/**
 * PocketClaw OpenRouter Provider
 * Implements ContentGenerator interface using OpenRouter's OpenAI-compatible API.
 */

import type {
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  Content,
} from '@google/genai';
import type { ContentGenerator } from '../core/contentGenerator.js';
import type { LlmRole } from '../telemetry/llmRole.js';
import { PROVIDER_DEFAULTS, type OpenAIChatRequest, type OpenAIChatResponse, type OpenAIStreamChunk } from './types.js';
import {
  googleToOpenAIMessages,
  googleToOpenAITools,
  openAIToGoogleResponse,
  openAIStreamChunkToGoogleResponse,
  extractSystemInstruction,
  extractTemperature,
} from './formatConverter.js';

export class OpenRouterProvider implements ContentGenerator {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(apiKey: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || PROVIDER_DEFAULTS.openrouter.baseUrl;
    this.defaultModel = model || PROVIDER_DEFAULTS.openrouter.defaultModel;
  }

  async generateContent(
    request: GenerateContentParameters,
    _userPromptId: string,
    _role: LlmRole,
  ): Promise<GenerateContentResponse> {
    const systemInstruction = extractSystemInstruction(request);
    const messages = googleToOpenAIMessages(
      (request.contents || []) as readonly Content[],
      systemInstruction,
    );
    const tools = googleToOpenAITools(request.config?.tools);

    const body: OpenAIChatRequest = {
      model: request.model || this.defaultModel,
      messages,
      ...(tools && { tools }),
      stream: false,
      ...(extractTemperature(request) !== undefined && {
        temperature: extractTemperature(request),
      }),
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://github.com/jaredstudio/pocketclaw',
        'X-Title': 'PocketClaw',
      },
      body: JSON.stringify(body),
      signal: request.config?.abortSignal as AbortSignal | undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error ${response.status}: ${errorText}`,
      );
    }

    const data = (await response.json()) as OpenAIChatResponse;
    return openAIToGoogleResponse(data);
  }

  async generateContentStream(
    request: GenerateContentParameters,
    _userPromptId: string,
    _role: LlmRole,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const systemInstruction = extractSystemInstruction(request);
    const messages = googleToOpenAIMessages(
      (request.contents || []) as readonly Content[],
      systemInstruction,
    );
    const tools = googleToOpenAITools(request.config?.tools);

    const body: OpenAIChatRequest = {
      model: request.model || this.defaultModel,
      messages,
      ...(tools && { tools }),
      stream: true,
      ...(extractTemperature(request) !== undefined && {
        temperature: extractTemperature(request),
      }),
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://github.com/jaredstudio/pocketclaw',
        'X-Title': 'PocketClaw',
      },
      body: JSON.stringify(body),
      signal: request.config?.abortSignal as AbortSignal | undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error ${response.status}: ${errorText}`,
      );
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const accumulatedToolCalls = new Map<
      number,
      { id: string; name: string; arguments: string }
    >();

    async function* streamGenerator(): AsyncGenerator<GenerateContentResponse> {
      let buffer = '';
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
          if (data === '[DONE]') return;

          try {
            const chunk = JSON.parse(data) as OpenAIStreamChunk;
            const googleResponse = openAIStreamChunkToGoogleResponse(
              chunk,
              accumulatedToolCalls,
            );
            if (googleResponse) {
              yield googleResponse;
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    }

    return streamGenerator();
  }

  async countTokens(
    _request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    // OpenRouter doesn't have a token counting endpoint
    // Return a rough estimate
    return {
      totalTokens: 0,
    } as unknown as CountTokensResponse;
  }

  async embedContent(
    _request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    throw new Error('Embeddings not supported by OpenRouter provider');
  }
}
