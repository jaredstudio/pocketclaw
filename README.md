# 🐾 PocketClaw

**AI Coding Agent — Run FREE on Android, iOS, Mac, Windows, Linux**

> Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google, licensed under Apache 2.0.

PocketClaw puts a full AI coding assistant in your pocket. Powered by **OpenRouter** — use powerful AI models for FREE.

---

## ⚡ Install (One Command)

### Android (Termux)
```bash
pkg install curl -y && curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

### iOS (iSH)
```bash
apk add curl bash && curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

The installer will:
1. ✅ Install Node.js & Git (if missing)
2. ✅ Download & build PocketClaw
3. ✅ Ask for your **OpenRouter API key**
4. ✅ Let you pick a **free AI model**
5. ✅ Save config — ready to use!

---

## 🔑 Get Your Free API Key

1. Go to **https://openrouter.ai/keys**
2. Sign up (no credit card needed)
3. Click **"Create Key"**
4. Copy your key — it looks like: `sk-or-v1-xxxxxxxxxxxx`

> The installer will ask you to paste this key during setup.

---

## 🎯 Free AI Models

During install, you'll choose from these FREE models:

| # | Model | Best For |
|---|-------|----------|
| 1 | **Qwen 3.6 Plus** | General coding (default) |
| 2 | **Qwen 3 Coder** | Code generation |
| 3 | **Gemma 3 27B** | General tasks |
| 4 | **Devstral Small** | Coding assistant |
| 5 | **Llama 4 Scout** | General purpose |
| 6 | **Custom** | Enter any model from openrouter.ai |

> Browse all free models at [openrouter.ai/models](https://openrouter.ai/models) — filter by "Free"

---

## 🚀 Usage

```bash
# Start PocketClaw
pocketclaw

# Change API key or model anytime
pocketclaw-setup
```

### Commands Inside PocketClaw

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

## 📱 Platform Guides

<details>
<summary><b>📱 Android (Termux) — Full Guide</b></summary>

### Step 1 — Install Termux
1. Go to **https://f-droid.org** (NOT Google Play Store)
2. Download and install **F-Droid**
3. Open F-Droid → Search **"Termux"** → Install

> ⚠️ Do NOT use the Play Store version — it's outdated and broken.

### Step 2 — Set Up Termux
```bash
pkg update && pkg upgrade -y
termux-setup-storage
```

### Step 3 — Install PocketClaw
```bash
pkg install curl -y && curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

The installer will ask for your API key and model — follow the prompts.

### Step 4 — Launch
```bash
source ~/.bashrc
pocketclaw
```

Type `hello` to test! 🎉

</details>

<details>
<summary><b>🍎 iOS (iSH) — Full Guide</b></summary>

### Step 1 — Install iSH
Download from the App Store: [iSH Shell](https://apps.apple.com/app/ish-shell/id1436902243)

### Step 2 — Set Up
```bash
apk update && apk upgrade
apk add nodejs npm git curl bash
```

### Step 3 — Install PocketClaw
```bash
curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
```

### Step 4 — Launch
```bash
source ~/.profile
pocketclaw
```

> ⚠️ iSH is slower than Termux (x86 emulation). WiFi recommended.

</details>

<details>
<summary><b>💻 Desktop (macOS / Linux / Windows)</b></summary>

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/jaredstudio/pocketclaw/main/install.sh | bash
source ~/.bashrc  # or ~/.zshrc
pocketclaw
```

### Windows (PowerShell)
```powershell
git clone https://github.com/jaredstudio/pocketclaw.git
cd pocketclaw
npm install
npm run build
npm link
# Create settings manually — see Configuration section
pocketclaw
```

</details>

---

## ⚙️ Configuration

PocketClaw stores its config at `~/.pocketclaw/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_AUTH_TOKEN": "sk-or-v1-your-key-here",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_MODEL": "qwen/qwen3.6-plus:free"
  },
  "model": "sonnet[1m]"
}
```

**To change your key or model**, run:
```bash
pocketclaw-setup
```

Or edit `~/.pocketclaw/settings.json` directly.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `pocketclaw: not found` | Run `source ~/.bashrc` or restart terminal |
| `npm install` fails on Termux | The installer handles this — try reinstalling |
| API key error | Double-check at openrouter.ai/keys |
| Model not found | Check model ID at openrouter.ai/models |
| iSH is very slow | Normal — x86 emulation. Use WiFi. |
| Want to change model | Run `pocketclaw-setup` |

---

## 📋 Features

- 🤖 **Free AI Models** — Powered by OpenRouter
- 📱 **Mobile-First** — Built for Termux & iSH
- ⚡ **One-Command Install** — No manual config
- 🔧 **Code Agent** — Read, write, debug code
- 🔌 **MCP Tools** — Extensible with custom tools
- 💬 **Streaming** — Real-time responses

---

## 🤝 Contributing

We welcome contributions! PocketClaw is fully open source (Apache 2.0).

See our [Contributing Guide](./CONTRIBUTING.md) for details.

---

## 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Original Work**: Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google

---

<p align="center">
  Built with 🐾 by the PocketClaw community<br>
  <em>Models and availability may change. Check <a href="https://openrouter.ai/models">openrouter.ai/models</a> for current free models.</em>
</p>
