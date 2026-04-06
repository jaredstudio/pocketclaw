/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PocketClaw Anthropic Provider
 * Implements ContentGenerator interface using Anthropic's Messages API.
 */

import type {
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  Content,
  Tool,
} from '@google/genai';
import type { ContentGenerator } from '../core/contentGenerator.js';
import type { LlmRole } from '../telemetry/llmRole.js';
import {
  PROVIDER_DEFAULTS,
  type AnthropicRequest,
  type AnthropicResponse,
  type AnthropicContentBlock,
} from './types.js';
import {
  googleToAnthropicMessages,
  googleToAnthropicTools,
  anthropicToGoogleResponse,
  extractSystemInstruction,
  extractTemperature,
} from './formatConverter.js';

export class AnthropicProvider implements ContentGenerator {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(apiKey: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || PROVIDER_DEFAULTS.anthropic.baseUrl;
    this.defaultModel = model || PROVIDER_DEFAULTS.anthropic.defaultModel;
  }

  async generateContent(
    request: GenerateContentParameters,
    _userPromptId: string,
    _role: LlmRole,
  ): Promise<GenerateContentResponse> {
    const systemInstruction = extractSystemInstruction(request);
    const contents = (request.contents || []) as readonly Content[];
    const { system, messages } = googleToAnthropicMessages(
      contents,
      systemInstruction,
    );
    const tools = googleToAnthropicTools(
      request.config?.tools as Tool[] | undefined,
    );

    const body: AnthropicRequest = {
      model: request.model || this.defaultModel,
      messages,
      max_tokens: 8192,
      stream: false,
      ...(system && { system }),
      ...(tools && { tools }),
      ...(extractTemperature(request) !== undefined && {
        temperature: extractTemperature(request),
      }),
    };

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: request.config?.abortSignal as AbortSignal | undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Anthropic API error ${response.status}: ${errorText}`,
      );
    }

    const data = (await response.json()) as AnthropicResponse;
    return anthropicToGoogleResponse(data);
  }

  async generateContentStream(
    request: GenerateContentParameters,
    _userPromptId: string,
    _role: LlmRole,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const systemInstruction = extractSystemInstruction(request);
    const contents = (request.contents || []) as readonly Content[];
    const { system, messages } = googleToAnthropicMessages(
      contents,
      systemInstruction,
    );
    const tools = googleToAnthropicTools(
      request.config?.tools as Tool[] | undefined,
    );

    const body: AnthropicRequest = {
      model: request.model || this.defaultModel,
      messages,
      max_tokens: 8192,
      stream: true,
      ...(system && { system }),
      ...(tools && { tools }),
      ...(extractTemperature(request) !== undefined && {
        temperature: extractTemperature(request),
      }),
    };

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: request.config?.abortSignal as AbortSignal | undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Anthropic API error ${response.status}: ${errorText}`,
      );
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    async function* streamGenerator(): AsyncGenerator<GenerateContentResponse> {
      let buffer = '';
      let currentToolUse: {
        id: string;
        name: string;
        inputJson: string;
      } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);

          try {
            const event = JSON.parse(data) as {
              type: string;
              delta?: { type: string; text?: string; partial_json?: string };
              content_block?: AnthropicContentBlock;
            };

            if (event.type === 'content_block_delta') {
              const delta = event.delta;
              if (delta?.type === 'text_delta' && delta.text) {
                yield {
                  candidates: [
                    {
                      content: {
                        role: 'model',
                        parts: [{ text: delta.text }],
                      },
                    },
                  ],
                } as unknown as GenerateContentResponse;
              } else if (delta?.type === 'input_json_delta' && currentToolUse) {
                currentToolUse.inputJson += delta.partial_json || '';
              }
            } else if (event.type === 'content_block_start') {
              const block = event.content_block;
              if (block?.type === 'tool_use') {
                currentToolUse = {
                  id: block.id || '',
                  name: block.name || '',
                  inputJson: '',
                };
              }
            } else if (event.type === 'content_block_stop') {
              if (currentToolUse) {
                let args: Record<string, unknown> = {};
                try {
                  args = JSON.parse(currentToolUse.inputJson || '{}') as Record<string, unknown>;
                } catch {
                  args = {};
                }
                yield {
                  candidates: [
                    {
                      content: {
                        role: 'model',
                        parts: [
                          {
                            functionCall: {
                              name: currentToolUse.name,
                              args,
                            },
                          },
                        ],
                      },
                    },
                  ],
                } as unknown as GenerateContentResponse;
                currentToolUse = null;
              }
            } else if (event.type === 'message_stop') {
              yield {
                candidates: [
                  {
                    content: {
                      role: 'model',
                      parts: [{ text: '' }],
                    },
                    finishReason: 'STOP',
                  },
                ],
              } as unknown as GenerateContentResponse;
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    }

    return streamGenerator();
  }

  async countTokens(
    _request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    return { totalTokens: 0 } as unknown as CountTokensResponse;
  }

  async embedContent(
    _request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    throw new Error('Embeddings not supported by Anthropic provider');
  }
}
