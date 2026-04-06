/**
 * PocketClaw Provider Factory
 * Creates ContentGenerator instances for different LLM providers.
 */

import type { ContentGenerator } from '../core/contentGenerator.js';
import type { ProviderConfig, ProviderType } from './types.js';
import { PROVIDER_DEFAULTS } from './types.js';
import { OpenRouterProvider } from './openRouterProvider.js';
import { AnthropicProvider } from './anthropicProvider.js';
import { OllamaProvider } from './ollamaProvider.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Settings file structure saved by the setup wizard.
 */
export interface PocketClawSettings {
  provider: ProviderType;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

/** Path to user settings file */
export function getSettingsPath(): string {
  return path.join(os.homedir(), '.pocketclaw', 'settings.json');
}

/**
 * Load settings from ~/.pocketclaw/settings.json
 */
export function loadSettings(): PocketClawSettings | null {
  const settingsPath = getSettingsPath();
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      return JSON.parse(data) as PocketClawSettings;
    }
  } catch {
    // Corrupt settings, return null
  }
  return null;
}

/**
 * Save settings to ~/.pocketclaw/settings.json
 */
export function saveSettings(settings: PocketClawSettings): void {
  const settingsPath = getSettingsPath();
  const settingsDir = path.dirname(settingsPath);
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

/**
 * Create a ContentGenerator from provider settings.
 */
export function createProviderFromSettings(
  settings: PocketClawSettings,
): ContentGenerator {
  return createProvider(settings.provider, {
    provider: settings.provider,
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl,
    model: settings.model,
  });
}

/**
 * Create a ContentGenerator from explicit config.
 */
export function createProvider(
  type: ProviderType,
  config: ProviderConfig,
): ContentGenerator {
  switch (type) {
    case 'openrouter':
      if (!config.apiKey) {
        throw new Error(
          'OpenRouter requires an API key. Get one free at https://openrouter.ai/keys',
        );
      }
      return new OpenRouterProvider(config.apiKey, config.model, config.baseUrl);

    case 'anthropic':
      if (!config.apiKey) {
        throw new Error(
          'Anthropic requires an API key. Get one at https://console.anthropic.com',
        );
      }
      return new AnthropicProvider(config.apiKey, config.model, config.baseUrl);

    case 'ollama':
      return new OllamaProvider(config.model, config.baseUrl);

    default:
      throw new Error(`Unknown provider: ${type}`);
  }
}

/**
 * Detect provider from environment variables (fallback to settings).
 * Priority: ENV vars → settings.json → null
 */
export function detectProvider(): PocketClawSettings | null {
  // Check environment variables
  const openRouterKey = process.env['OPENROUTER_API_KEY'];
  if (openRouterKey) {
    return {
      provider: 'openrouter',
      apiKey: openRouterKey,
      model:
        process.env['POCKETCLAW_MODEL'] ||
        PROVIDER_DEFAULTS.openrouter.defaultModel,
    };
  }

  const anthropicKey = process.env['ANTHROPIC_API_KEY'];
  if (anthropicKey) {
    return {
      provider: 'anthropic',
      apiKey: anthropicKey,
      model:
        process.env['POCKETCLAW_MODEL'] ||
        PROVIDER_DEFAULTS.anthropic.defaultModel,
    };
  }

  const ollamaBaseUrl = process.env['OLLAMA_BASE_URL'];
  if (ollamaBaseUrl) {
    return {
      provider: 'ollama',
      baseUrl: ollamaBaseUrl,
      model:
        process.env['POCKETCLAW_MODEL'] ||
        PROVIDER_DEFAULTS.ollama.defaultModel,
    };
  }

  // Fall back to settings file
  return loadSettings();
}

/**
 * Check if any provider is configured.
 */
export function isProviderConfigured(): boolean {
  return detectProvider() !== null;
}

/**
 * Test provider connection by sending a simple request.
 */
export async function testProviderConnection(
  settings: PocketClawSettings,
): Promise<{ success: boolean; message: string; model?: string }> {
  try {
    const provider = createProviderFromSettings(settings);

    // Send a minimal test request
    const response = await provider.generateContent(
      {
        model: settings.model,
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Say "PocketClaw connected!" in exactly 3 words.' }],
          },
        ],
        config: {},
      },
      'test',
      'main' as unknown as import('../telemetry/llmRole.js').LlmRole,
    );

    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      success: true,
      message: text.trim() || 'Connected successfully',
      model: settings.model,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message };
  }
}
