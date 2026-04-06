/**
 * PocketClaw Format Converter
 * Converts between Google genai internal types and OpenAI/Anthropic API formats.
 */

import type {
  Content,
  Part,
  GenerateContentResponse,
  GenerateContentParameters,
} from '@google/genai';
import type {
  OpenAIMessage,
  OpenAITool,
  OpenAIChatResponse,
  OpenAIStreamChunk,
  OpenAIToolCall,
  AnthropicMessage,
  AnthropicContentBlock,
  AnthropicTool,
  AnthropicResponse,
} from './types.js';

// ============================================================
// Google → OpenAI format (used by OpenRouter and Ollama)
// ============================================================

/**
 * Convert Google Content[] to OpenAI messages[] format.
 */
export function googleToOpenAIMessages(
  contents: readonly Content[],
  systemInstruction?: string,
): OpenAIMessage[] {
  const messages: OpenAIMessage[] = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  for (const content of contents) {
    const role = content.role === 'model' ? 'assistant' : 'user';

    if (!content.parts || content.parts.length === 0) {
      messages.push({ role, content: '' });
      continue;
    }

    // Check for function calls (tool use by assistant)
    const functionCalls = content.parts.filter((p) => p.functionCall);
    const functionResponses = content.parts.filter((p) => p.functionResponse);
    const textParts = content.parts.filter(
      (p) => p.text !== undefined && !p.thought,
    );

    if (functionCalls.length > 0) {
      // Assistant message with tool calls
      const toolCalls: OpenAIToolCall[] = functionCalls.map((p, i) => ({
        id: `call_${p.functionCall!.name}_${i}`,
        type: 'function' as const,
        function: {
          name: p.functionCall!.name!,
          arguments: JSON.stringify(p.functionCall!.args || {}),
        },
      }));
      const textContent = textParts.map((p) => p.text).join('');
      messages.push({
        role: 'assistant',
        content: textContent || null,
        tool_calls: toolCalls,
      });
    } else if (functionResponses.length > 0) {
      // Tool response messages
      for (const p of functionResponses) {
        messages.push({
          role: 'tool',
          tool_call_id: `call_${p.functionResponse!.name}_0`,
          content: JSON.stringify(p.functionResponse!.response || {}),
        });
      }
    } else {
      // Regular text message
      const text = textParts.map((p) => p.text).join('');
      messages.push({ role, content: text });
    }
  }

  return messages;
}

/**
 * Convert Google Tool[] to OpenAI tools[] format.
 */
export function googleToOpenAITools(
  tools: unknown[] | undefined,
): OpenAITool[] | undefined {
  if (!tools || tools.length === 0) return undefined;

  const openAITools: OpenAITool[] = [];

  for (const tool of tools) {
    const t = tool as Record<string, unknown>;
    const declarations = t['functionDeclarations'] as
      | Array<Record<string, unknown>>
      | undefined;
    if (!declarations) continue;
    for (const fn of declarations) {
      openAITools.push({
        type: 'function',
        function: {
        name: (fn['name'] as string) || '',
          description: (fn['description'] as string) || '',
          parameters: (fn['parameters'] as Record<string, unknown>) || {
            type: 'object',
            properties: {},
          },
        },
      });
    }
  }

  return openAITools.length > 0 ? openAITools : undefined;
}

/**
 * Convert OpenAI chat response to Google GenerateContentResponse format.
 */
export function openAIToGoogleResponse(
  response: OpenAIChatResponse,
): GenerateContentResponse {
  const choice = response.choices[0];
  if (!choice) {
    return {
      candidates: [],
      usageMetadata: undefined,
    } as unknown as GenerateContentResponse;
  }

  const parts: Part[] = [];

  // Add text content
  if (choice.message.content) {
    parts.push({ text: choice.message.content });
  }

  // Add tool calls as function calls
  if (choice.message.tool_calls) {
    for (const tc of choice.message.tool_calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
      } catch {
        args = {};
      }
      parts.push({
        functionCall: {
          name: tc.function.name,
          args,
        },
      });
    }
  }

  // If no parts were added, add empty text
  if (parts.length === 0) {
    parts.push({ text: '' });
  }

  return {
    candidates: [
      {
        content: {
          role: 'model',
          parts,
        },
        finishReason: mapFinishReason(choice.finish_reason),
      },
    ],
    usageMetadata: response.usage
      ? {
          promptTokenCount: response.usage.prompt_tokens,
          candidatesTokenCount: response.usage.completion_tokens,
          totalTokenCount: response.usage.total_tokens,
        }
      : undefined,
  } as unknown as GenerateContentResponse;
}

/**
 * Convert OpenAI streaming chunks to Google GenerateContentResponse format.
 */
export function openAIStreamChunkToGoogleResponse(
  chunk: OpenAIStreamChunk,
  accumulatedToolCalls: Map<
    number,
    { id: string; name: string; arguments: string }
  >,
): GenerateContentResponse | null {
  const choice = chunk.choices?.[0];
  if (!choice) return null;

  const parts: Part[] = [];
  const delta = choice.delta;

  // Handle text content
  if (delta.content) {
    parts.push({ text: delta.content });
  }

  // Handle streamed tool calls
  if (delta.tool_calls) {
    for (const tc of delta.tool_calls) {
      if (!accumulatedToolCalls.has(tc.index)) {
        accumulatedToolCalls.set(tc.index, {
          id: tc.id || '',
          name: '',
          arguments: '',
        });
      }
      const accumulated = accumulatedToolCalls.get(tc.index)!;
      if (tc.id) accumulated.id = tc.id;
      if (tc.function?.name) accumulated.name += tc.function.name;
      if (tc.function?.arguments)
        accumulated.arguments += tc.function.arguments;
    }
  }

  // When we hit a finish reason, emit any accumulated tool calls
  if (choice.finish_reason === 'tool_calls' || choice.finish_reason === 'stop') {
    for (const [, tc] of accumulatedToolCalls) {
      if (tc.name) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.arguments) as Record<string, unknown>;
        } catch {
          args = {};
        }
        parts.push({
          functionCall: {
            name: tc.name,
            args,
          },
        });
      }
    }
    if (choice.finish_reason === 'tool_calls') {
      accumulatedToolCalls.clear();
    }
  }

  if (parts.length === 0) return null;

  return {
    candidates: [
      {
        content: {
          role: 'model',
          parts,
        },
        finishReason: choice.finish_reason
          ? mapFinishReason(choice.finish_reason)
          : undefined,
      },
    ],
  } as unknown as GenerateContentResponse;
}

// ============================================================
// Google → Anthropic format
// ============================================================

/**
 * Convert Google Content[] to Anthropic messages[] format.
 * Returns { system, messages } since Anthropic uses a separate system field.
 */
export function googleToAnthropicMessages(
  contents: readonly Content[],
  systemInstruction?: string,
): { system?: string; messages: AnthropicMessage[] } {
  const messages: AnthropicMessage[] = [];

  for (const content of contents) {
    const role: 'user' | 'assistant' = content.role === 'model' ? 'assistant' : 'user';

    if (!content.parts || content.parts.length === 0) {
      messages.push({ role, content: '' });
      continue;
    }

    const functionCalls = content.parts.filter((p) => p.functionCall);
    const functionResponses = content.parts.filter((p) => p.functionResponse);
    const textParts = content.parts.filter(
      (p) => p.text !== undefined && !p.thought,
    );

    if (functionCalls.length > 0) {
      // Assistant message with tool_use blocks
      const blocks: AnthropicContentBlock[] = [];
      for (const tp of textParts) {
        if (tp.text) blocks.push({ type: 'text', text: tp.text });
      }
      for (const p of functionCalls) {
        blocks.push({
          type: 'tool_use',
          id: `toolu_${p.functionCall!.name}`,
          name: p.functionCall!.name!,
          input: (p.functionCall!.args as Record<string, unknown>) || {},
        });
      }
      messages.push({ role: 'assistant', content: blocks });
    } else if (functionResponses.length > 0) {
      // Tool results as user message
      const blocks: AnthropicContentBlock[] = functionResponses.map((p) => ({
        type: 'tool_result' as const,
        tool_use_id: `toolu_${p.functionResponse!.name}`,
        content: JSON.stringify(p.functionResponse!.response || {}),
      }));
      messages.push({ role: 'user', content: blocks });
    } else {
      const text = textParts.map((p) => p.text).join('');
      messages.push({ role, content: text });
    }
  }

  // Anthropic requires alternating user/assistant. Merge consecutive same-role messages.
  const merged = mergeConsecutiveMessages(messages);

  return {
    system: systemInstruction || undefined,
    messages: merged,
  };
}

function mergeConsecutiveMessages(
  messages: AnthropicMessage[],
): AnthropicMessage[] {
  const merged: AnthropicMessage[] = [];
  for (const msg of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === msg.role) {
      // Merge content
      if (typeof last.content === 'string' && typeof msg.content === 'string') {
        last.content = last.content + '\n' + msg.content;
      } else {
        const lastBlocks = typeof last.content === 'string'
          ? [{ type: 'text' as const, text: last.content }]
          : last.content;
        const msgBlocks = typeof msg.content === 'string'
          ? [{ type: 'text' as const, text: msg.content }]
          : msg.content;
        last.content = [...lastBlocks, ...msgBlocks];
      }
    } else {
      merged.push({ ...msg });
    }
  }
  return merged;
}

/**
 * Convert Google Tool[] to Anthropic tools[] format.
 */
export function googleToAnthropicTools(
  tools: unknown[] | undefined,
): AnthropicTool[] | undefined {
  if (!tools || tools.length === 0) return undefined;

  const anthropicTools: AnthropicTool[] = [];

  for (const tool of tools) {
    const t = tool as Record<string, unknown>;
    const declarations = t['functionDeclarations'] as
      | Array<Record<string, unknown>>
      | undefined;
    if (!declarations) continue;
    for (const fn of declarations) {
      anthropicTools.push({
        name: (fn['name'] as string) || '',
        description: (fn['description'] as string) || '',
        input_schema: (fn['parameters'] as Record<string, unknown>) || {
          type: 'object',
          properties: {},
        },
      });
    }
  }

  return anthropicTools.length > 0 ? anthropicTools : undefined;
}

/**
 * Convert Anthropic response to Google GenerateContentResponse format.
 */
export function anthropicToGoogleResponse(
  response: AnthropicResponse,
): GenerateContentResponse {
  const parts: Part[] = [];

  for (const block of response.content) {
    if (block.type === 'text' && block.text) {
      parts.push({ text: block.text });
    } else if (block.type === 'tool_use') {
      parts.push({
        functionCall: {
          name: block.name!,
          args: (block.input as Record<string, unknown>) || {},
        },
      });
    }
  }

  if (parts.length === 0) {
    parts.push({ text: '' });
  }

  return {
    candidates: [
      {
        content: {
          role: 'model',
          parts,
        },
        finishReason: response.stop_reason === 'tool_use' ? 'STOP' : 'STOP',
      },
    ],
    usageMetadata: {
      promptTokenCount: response.usage.input_tokens,
      candidatesTokenCount: response.usage.output_tokens,
      totalTokenCount:
        response.usage.input_tokens + response.usage.output_tokens,
    },
  } as unknown as GenerateContentResponse;
}

// ============================================================
// Helpers
// ============================================================

function mapFinishReason(reason: string | null): string {
  switch (reason) {
    case 'stop':
      return 'STOP';
    case 'length':
      return 'MAX_TOKENS';
    case 'tool_calls':
    case 'function_call':
      return 'STOP';
    case 'content_filter':
      return 'SAFETY';
    default:
      return 'STOP';
  }
}

/**
 * Extract system instruction string from GenerateContentParameters config.
 */
export function extractSystemInstruction(
  request: GenerateContentParameters,
): string | undefined {
  const si = request.config?.systemInstruction;
  if (!si) return undefined;
  if (typeof si === 'string') return si;
  // Content type
  if ('parts' in si && Array.isArray(si.parts)) {
    return si.parts.map((p: Part) => p.text || '').join('');
  }
  // Part type
  if ('text' in si) {
    return (si as Part).text || undefined;
  }
  // Part[] type
  if (Array.isArray(si)) {
    return (si as Part[]).map((p) => p.text || '').join('');
  }
  return undefined;
}

/**
 * Extract temperature from config.
 */
export function extractTemperature(
  request: GenerateContentParameters,
): number | undefined {
  return request.config?.temperature ?? undefined;
}
