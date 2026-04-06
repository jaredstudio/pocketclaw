/**
 * PocketClaw Provider Types
 * Defines the configuration for connecting to different LLM providers.
 */

export type ProviderType = 'openrouter' | 'anthropic' | 'ollama';

export interface ProviderConfig {
  provider: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  customHeaders?: Record<string, string>;
}

export interface OpenRouterConfig extends ProviderConfig {
  provider: 'openrouter';
  apiKey: string;
  baseUrl?: string; // defaults to https://openrouter.ai/api/v1
}

export interface AnthropicConfig extends ProviderConfig {
  provider: 'anthropic';
  apiKey: string;
  baseUrl?: string; // defaults to https://api.anthropic.com
}

export interface OllamaConfig extends ProviderConfig {
  provider: 'ollama';
  baseUrl?: string; // defaults to http://localhost:11434
}

/** OpenAI-compatible message format (used by OpenRouter and Ollama) */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  tools?: OpenAITool[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface OpenAIChatResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIStreamChunk {
  id: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string | null;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: string;
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason: string | null;
  }>;
}

/** Anthropic message format */
export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

export interface AnthropicContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  system?: string;
  tools?: AnthropicTool[];
  max_tokens: number;
  stream?: boolean;
  temperature?: number;
}

export interface AnthropicTool {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
}

export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicContentBlock[];
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/** Default provider endpoints */
export const PROVIDER_DEFAULTS: Record<
  ProviderType,
  { baseUrl: string; defaultModel: string }
> = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'qwen/qwen3.6-plus:free',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  ollama: {
    baseUrl: 'http://localhost:11434',
    defaultModel: 'llama3:8b',
  },
};

/** Free models available on OpenRouter */
export const FREE_OPENROUTER_MODELS = [
  {
    id: 'qwen/qwen3.6-plus:free',
    name: 'Qwen 3.6 Plus',
    description: 'General coding — recommended',
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen 3 Coder',
    description: 'Code generation',
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3 27B',
    description: 'General tasks',
  },
  {
    id: 'mistralai/devstral-small:free',
    name: 'Devstral Small',
    description: 'Coding assistant',
  },
  {
    id: 'meta-llama/llama-4-scout:free',
    name: 'Llama 4 Scout',
    description: 'General purpose',
  },
];

/** Claude models */
export const ANTHROPIC_MODELS = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    description: 'Best balance of speed and intelligence',
  },
  {
    id: 'claude-haiku-3-20240307',
    name: 'Claude Haiku 3',
    description: 'Fast and affordable',
  },
];
