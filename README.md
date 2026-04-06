# 🐾 PocketClaw

**AI Coding Agent — Runs on Android, iOS, Mac, Windows, Linux**

> Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google, licensed under Apache 2.0.

PocketClaw puts a full AI coding assistant in your pocket. Supports **OpenRouter** (free models), **Anthropic Claude**, and **Ollama** (local/offline).

---

## ⚡ Quick Install (One Command)

### Android (Termux)
```bash
curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

### iOS (iSH)
```bash
apk add curl bash && curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

> The install script auto-detects your platform and installs everything.

---

## 🔑 Set Your AI Provider (Pick One)

After install, set your provider:

### Option A — OpenRouter (FREE, recommended)
```bash
export OPENROUTER_API_KEY="sk-or-v1-your-key"
echo 'export OPENROUTER_API_KEY="sk-or-v1-your-key"' >> ~/.bashrc
```
> Get your free key at: https://openrouter.ai/keys

### Option B — Anthropic Claude (paid)
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key"
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key"' >> ~/.bashrc
```

### Option C — Ollama (local, offline)
```bash
export OLLAMA_BASE_URL="http://localhost:11434"
echo 'export OLLAMA_BASE_URL="http://localhost:11434"' >> ~/.bashrc
```

Then launch:
```bash
source ~/.bashrc
pocketclaw
```

---

## 🎯 Choose Your Model

Set a specific model with:
```bash
export POCKETCLAW_MODEL="qwen/qwen3-coder:free"
```

Or save it permanently in `~/.pocketclaw/settings.json`:
```json
{
  "provider": "openrouter",
  "apiKey": "sk-or-v1-your-key",
  "model": "qwen/qwen3.6-plus:free"
}
```

### Free Models (OpenRouter)

| Model | Best For |
|-------|----------|
| `qwen/qwen3.6-plus:free` | General coding (default) |
| `qwen/qwen3-coder:free` | Code generation |
| `google/gemma-3-27b-it:free` | General tasks |
| `mistralai/devstral-small:free` | Coding assistant |
| `meta-llama/llama-4-scout:free` | General purpose |

> Browse all models at [openrouter.ai/models](https://openrouter.ai/models) — filter by "Free"

### Claude Models (Anthropic)

| Model | Best For |
|-------|----------|
| `claude-sonnet-4-20250514` | Best balance |
| `claude-haiku-3-20240307` | Fast & affordable |

### Ollama Models (Local)

Whatever you have pulled — run `ollama list` to see yours.

---

# 📱 ANDROID — Detailed Guide (Termux)

<details>
<summary><b>Click to expand full step-by-step</b></summary>

### Step 1 — Install Termux
1. Go to https://f-droid.org (NOT Google Play Store)
2. Download and install **F-Droid**
3. Open F-Droid → Search **"Termux"** → Install it
4. Also install **Termux:Boot** (optional, for auto-start)

> ⚠️ Do NOT use the Play Store version — it's outdated and broken.

### Step 2 — Set Up Termux
```bash
pkg update && pkg upgrade -y
termux-setup-storage
```

### Step 3 — Install PocketClaw
```bash
curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

### Step 4 — Set Your API Key
```bash
export OPENROUTER_API_KEY="sk-or-v1-your-key"
echo 'export OPENROUTER_API_KEY="sk-or-v1-your-key"' >> ~/.bashrc
source ~/.bashrc
```

### Step 5 — Launch
```bash
pocketclaw
```

Type `hello` to test! 🎉

</details>

---

# 🍎 iOS — Detailed Guide (iSH)

<details>
<summary><b>Click to expand full step-by-step</b></summary>

### Step 1 — Install iSH
Download from the App Store: [iSH Shell](https://apps.apple.com/app/ish-shell/id1436902243)

### Step 2 — Set Up iSH
```bash
apk update && apk upgrade
apk add nodejs npm git curl bash
```

### Step 3 — Install PocketClaw
```bash
curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

### Step 4 — Set Your API Key
```bash
export OPENROUTER_API_KEY="sk-or-v1-your-key"
echo 'export OPENROUTER_API_KEY="sk-or-v1-your-key"' >> ~/.profile
source ~/.profile
```

### Step 5 — Launch
```bash
pocketclaw
```

> ⚠️ iSH is slower than Termux (x86 emulation on ARM). WiFi recommended.

</details>

---

# 💻 Desktop (macOS / Windows / Linux)

<details>
<summary><b>Click to expand</b></summary>

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
source ~/.bashrc  # or ~/.zshrc
export OPENROUTER_API_KEY="sk-or-v1-your-key"
pocketclaw
```

### Windows (PowerShell)
```powershell
git clone https://github.com/jaredstudio/pocketclaw.git
cd pocketclaw
npm install
npm run build
npm link
$env:OPENROUTER_API_KEY = "sk-or-v1-your-key"
pocketclaw
```

</details>

---

# ⌨️ Using PocketClaw

| Command | What it does |
|---------|-------------|
| Type your message | Ask PocketClaw anything |
| `/model` | Switch AI model |
| `/clear` | Clear conversation |
| `Ctrl + C` | Cancel/Exit |
| `exit` | Close PocketClaw |

### Example Prompts
- `"Create a simple HTML website"`
- `"Write a Python script to rename files"`
- `"Help me debug this code: [paste code]"`

---

# 📋 Key Features

- **Multi-Provider** — OpenRouter, Anthropic Claude, Ollama
- **Free Models** — Use powerful AI models at zero cost
- **Tool Calling** — MCP servers for custom tools
- **Streaming** — Real-time response streaming
- **Mobile-First** — Optimized for Termux and iSH
- **Offline Mode** — Use Ollama for local AI

---

# 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `pocketclaw: not found` | Run `source ~/.bashrc` or restart terminal |
| `npm install` fails | Run `pkg install python make` (Termux) |
| API key error | Double-check your key at openrouter.ai/keys |
| Model not found | Check model ID at openrouter.ai/models |
| iSH is very slow | Normal — x86 emulation. Use WiFi. |
| Ctrl+C not working | Tap CTRL on Termux keyboard bar, then C |

---

# 🤝 Contributing

We welcome contributions! PocketClaw is fully open source (Apache 2.0).

See our [Contributing Guide](./CONTRIBUTING.md) for details.

---

# 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Original Work**: Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google
- All original copyright and attribution notices retained per Apache 2.0 requirements

---

<p align="center">
  Built with 🐾 by the PocketClaw community<br>
  <em>Guide updated April 2026 — Models and availability may change. Always check <a href="https://openrouter.ai/models">openrouter.ai/models</a> for current free models.</em>
</p>
