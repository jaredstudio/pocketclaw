/**
 * PocketClaw Interactive Setup Wizard
 * Runs on first launch when no provider is configured.
 */

import * as readline from 'node:readline';
import {
  type ProviderType,
  PROVIDER_DEFAULTS,
  FREE_OPENROUTER_MODELS,
  ANTHROPIC_MODELS,
} from '../../core/src/providers/types.js';
import {
  saveSettings,
  testProviderConnection,
  type PocketClawSettings,
} from '../../core/src/providers/providerFactory.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';

function print(msg: string) {
  process.stdout.write(msg + '\n');
}

function createPromptInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function ask(
  rl: readline.Interface,
  question: string,
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Run the interactive setup wizard.
 * Returns settings if configured, or null if user cancels.
 */
export async function runSetupWizard(): Promise<PocketClawSettings | null> {
  const rl = createPromptInterface();

  try {
    print('');
    print(
      `${BOLD}${CYAN}╔════════════════════════════════════════╗${RESET}`,
    );
    print(
      `${BOLD}${CYAN}║      🐾 PocketClaw Setup Wizard       ║${RESET}`,
    );
    print(
      `${BOLD}${CYAN}╚════════════════════════════════════════╝${RESET}`,
    );
    print('');
    print(`${DIM}Select your AI provider to get started.${RESET}`);
    print('');

    // Step 1: Select provider
    print(`${BOLD}Available Providers:${RESET}`);
    print('');
    print(
      `  ${GREEN}1)${RESET} ${BOLD}OpenRouter${RESET}  ${DIM}— Free models (Qwen, Gemma, Mistral)${RESET}`,
    );
    print(
      `  ${GREEN}2)${RESET} ${BOLD}Anthropic${RESET}   ${DIM}— Claude Sonnet/Haiku (paid)${RESET}`,
    );
    print(
      `  ${GREEN}3)${RESET} ${BOLD}Ollama${RESET}      ${DIM}— Local AI, no internet needed${RESET}`,
    );
    print('');

    const providerChoice = await ask(
      rl,
      `${CYAN}Select provider [1/2/3]: ${RESET}`,
    );

    let provider: ProviderType;
    switch (providerChoice) {
      case '1':
        provider = 'openrouter';
        break;
      case '2':
        provider = 'anthropic';
        break;
      case '3':
        provider = 'ollama';
        break;
      default:
        print(`${RED}Invalid choice. Defaulting to OpenRouter.${RESET}`);
        provider = 'openrouter';
    }

    print('');
    print(`${GREEN}✓${RESET} Selected: ${BOLD}${provider}${RESET}`);
    print('');

    // Step 2: API Key (skip for Ollama)
    let apiKey: string | undefined;

    if (provider !== 'ollama') {
      const keyUrl =
        provider === 'openrouter'
          ? 'https://openrouter.ai/keys'
          : 'https://console.anthropic.com/settings/keys';

      print(`${YELLOW}Get your API key at: ${keyUrl}${RESET}`);
      print('');

      apiKey = await ask(rl, `${CYAN}Enter API Key: ${RESET}`);

      if (!apiKey) {
        print(`${RED}✗ API key is required for ${provider}${RESET}`);
        rl.close();
        return null;
      }

      print(`${GREEN}✓${RESET} API key set`);
      print('');
    }

    // Step 3: Base URL (optional override)
    let baseUrl: string | undefined;

    if (provider === 'ollama') {
      const customUrl = await ask(
        rl,
        `${CYAN}Ollama URL [${DIM}${PROVIDER_DEFAULTS.ollama.baseUrl}${RESET}${CYAN}]: ${RESET}`,
      );
      baseUrl = customUrl || PROVIDER_DEFAULTS.ollama.baseUrl;
    }

    // Step 4: Select model
    let model: string;

    if (provider === 'openrouter') {
      print(`${BOLD}Free Models Available:${RESET}`);
      print('');
      FREE_OPENROUTER_MODELS.forEach((m, i) => {
        print(
          `  ${GREEN}${i + 1})${RESET} ${BOLD}${m.name}${RESET}  ${DIM}— ${m.description}${RESET}`,
        );
        print(`     ${DIM}${m.id}${RESET}`);
      });
      print('');
      print(
        `  ${GREEN}${FREE_OPENROUTER_MODELS.length + 1})${RESET} ${BOLD}Custom model${RESET}  ${DIM}— Enter a model ID manually${RESET}`,
      );
      print('');

      const modelChoice = await ask(
        rl,
        `${CYAN}Select model [1-${FREE_OPENROUTER_MODELS.length + 1}]: ${RESET}`,
      );

      const modelIndex = parseInt(modelChoice) - 1;

      if (modelIndex >= 0 && modelIndex < FREE_OPENROUTER_MODELS.length) {
        model = FREE_OPENROUTER_MODELS[modelIndex].id;
      } else {
        const customModel = await ask(
          rl,
          `${CYAN}Enter model ID: ${RESET}`,
        );
        model = customModel || PROVIDER_DEFAULTS.openrouter.defaultModel;
      }
    } else if (provider === 'anthropic') {
      print(`${BOLD}Claude Models:${RESET}`);
      print('');
      ANTHROPIC_MODELS.forEach((m, i) => {
        print(
          `  ${GREEN}${i + 1})${RESET} ${BOLD}${m.name}${RESET}  ${DIM}— ${m.description}${RESET}`,
        );
      });
      print('');
      print(
        `  ${GREEN}${ANTHROPIC_MODELS.length + 1})${RESET} ${BOLD}Custom model${RESET}  ${DIM}— Enter a model ID manually${RESET}`,
      );
      print('');

      const modelChoice = await ask(
        rl,
        `${CYAN}Select model [1-${ANTHROPIC_MODELS.length + 1}]: ${RESET}`,
      );
      const modelIndex = parseInt(modelChoice) - 1;

      if (modelIndex >= 0 && modelIndex < ANTHROPIC_MODELS.length) {
        model = ANTHROPIC_MODELS[modelIndex].id;
      } else {
        const customModel = await ask(
          rl,
          `${CYAN}Enter model ID: ${RESET}`,
        );
        model = customModel || PROVIDER_DEFAULTS.anthropic.defaultModel;
      }
    } else {
      // Ollama
      print(
        `${DIM}Checking Ollama for available models...${RESET}`,
      );
      try {
        const ollamaRes = await fetch(
          `${baseUrl || PROVIDER_DEFAULTS.ollama.baseUrl}/api/tags`,
        );
        if (ollamaRes.ok) {
          const ollamaData = (await ollamaRes.json()) as {
            models: Array<{ name: string; size: number }>;
          };
          if (ollamaData.models && ollamaData.models.length > 0) {
            print('');
            print(`${BOLD}Installed Models:${RESET}`);
            print('');
            ollamaData.models.forEach((m, i) => {
              const sizeMB = (m.size / 1024 / 1024).toFixed(0);
              print(
                `  ${GREEN}${i + 1})${RESET} ${BOLD}${m.name}${RESET}  ${DIM}(${sizeMB} MB)${RESET}`,
              );
            });
            print('');
            const modelChoice = await ask(
              rl,
              `${CYAN}Select model [1-${ollamaData.models.length}]: ${RESET}`,
            );
            const modelIndex = parseInt(modelChoice) - 1;
            if (modelIndex >= 0 && modelIndex < ollamaData.models.length) {
              model = ollamaData.models[modelIndex].name;
            } else {
              model = PROVIDER_DEFAULTS.ollama.defaultModel;
            }
          } else {
            print(
              `${YELLOW}No models found. Run: ollama pull llama3:8b${RESET}`,
            );
            model = await ask(
              rl,
              `${CYAN}Enter model name: ${RESET}`,
            );
            model = model || PROVIDER_DEFAULTS.ollama.defaultModel;
          }
        } else {
          throw new Error('Ollama not responding');
        }
      } catch {
        print(
          `${YELLOW}Could not reach Ollama. Make sure it's running.${RESET}`,
        );
        model = await ask(
          rl,
          `${CYAN}Enter model name [${PROVIDER_DEFAULTS.ollama.defaultModel}]: ${RESET}`,
        );
        model = model || PROVIDER_DEFAULTS.ollama.defaultModel;
      }
    }

    print(`${GREEN}✓${RESET} Model: ${BOLD}${model}${RESET}`);
    print('');

    // Step 5: Test connection
    print(`${DIM}Testing connection...${RESET}`);

    const settings: PocketClawSettings = {
      provider,
      model,
      ...(apiKey && { apiKey }),
      ...(baseUrl && { baseUrl }),
    };

    const testResult = await testProviderConnection(settings);

    if (testResult.success) {
      print(`${GREEN}✓ Connection successful!${RESET}`);
      if (testResult.message) {
        print(`${DIM}  Response: ${testResult.message}${RESET}`);
      }
    } else {
      print(`${YELLOW}⚠ Connection test failed: ${testResult.message}${RESET}`);
      print(`${DIM}  Settings will be saved anyway — you can fix later.${RESET}`);
    }

    // Step 6: Save settings
    print('');
    saveSettings(settings);
    print(
      `${GREEN}✓${RESET} Settings saved to ${DIM}~/.pocketclaw/settings.json${RESET}`,
    );
    print('');
    print(
      `${BOLD}${MAGENTA}🐾 PocketClaw is ready! Run 'pocketclaw' to start.${RESET}`,
    );
    print('');

    rl.close();
    return settings;
  } catch (error) {
    rl.close();
    throw error;
  }
}
