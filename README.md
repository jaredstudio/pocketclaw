# PocketClaw

**Mobile-first AI coding agent for Android & iOS — powered by free AI models via OpenRouter.**

> Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google, licensed under Apache 2.0.

![PocketClaw Screenshot](/docs/assets/gemini-screenshot.png)

PocketClaw puts a full AI coding assistant in your pocket. Run it on Android (Termux), iOS (iSH), or any terminal — completely free using open AI models through OpenRouter.

## 🚀 Why PocketClaw?

- **📱 Mobile-first**: Built for Termux (Android) and iSH (iOS)
- **💰 100% FREE**: No paid subscription needed — uses free OpenRouter models
- **🧠 Multiple AI models**: Access Qwen, Gemma, Mistral, and more
- **🔧 Built-in tools**: File operations, shell commands, web fetching
- **🔌 Extensible**: MCP (Model Context Protocol) support
- **💻 Terminal-first**: Designed for developers who code from anywhere
- **🛡️ Open source**: Apache 2.0 licensed

## 📦 Quick Install (Android — Termux)

### Step 1: Install Termux
1. Go to [F-Droid](https://f-droid.org/en/) and install the F-Droid app
2. Search for **Termux** and install it
3. ⚠️ Do NOT install from Google Play Store (outdated)

### Step 2: Set up Termux
```bash
pkg update && pkg upgrade -y
termux-setup-storage
```

### Step 3: Install Node.js & PocketClaw
```bash
pkg install nodejs -y
npm install -g pocketclaw
```

### Step 4: Get your free OpenRouter API key
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up (free, no credit card)
3. Create a key — looks like `sk-or-v1-xxxxxxxxxxxx`

### Step 5: Configure PocketClaw
```bash
mkdir -p ~/.pocketclaw

cat > ~/.pocketclaw/settings.json << 'EOF'
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_KEY_HERE",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_MODEL": "qwen/qwen3.6-plus:free"
  },
  "model": "sonnet[1m]"
}
EOF
```

### Step 6: Launch!
```bash
pocketclaw
```

## 📱 iOS Installation (iSH)

1. Install [iSH](https://apps.apple.com/app/ish-shell/id1436902243) from App Store
2. Install Node.js: `apk add nodejs npm`
3. Install PocketClaw: `npm install -g pocketclaw`
4. Follow Steps 4-6 above

## 🎯 Free Models You Can Use

| Model | Best For |
|-------|----------|
| `qwen/qwen3.6-plus:free` | General coding |
| `qwen/qwen3-coder:free` | Code generation |
| `nvidia/nemotron-3-super-120b-a12b:free` | Smart reasoning |
| `google/gemma-3-27b-it:free` | General tasks |
| `mistralai/devstral-small:free` | Coding tasks |

Visit [openrouter.ai/models](https://openrouter.ai/models) and filter by "Free" for the latest models.

## ⌨️ Basic Commands

| Command | What it does |
|---------|-------------|
| Type your message | Ask PocketClaw anything |
| `/model` | Switch AI model |
| `/clear` | Clear conversation |
| `Ctrl + C` | Cancel/Exit |
| `exit` | Close PocketClaw |

## 📋 Key Features

### Code Understanding & Generation
- Query and edit large codebases
- Generate new apps from PDFs, images, or sketches
- Debug issues with natural language

### Automation & Integration
- Automate operational tasks
- Use MCP servers for custom tools
- Run non-interactively in scripts

### Advanced Capabilities
- Conversation checkpointing
- Custom context files (POCKETCLAW.md)
- Skills and extensions system

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Model not found" | Update model name in settings.json |
| "402 Not enough credits" | Switch to a different free model |
| "ECONNREFUSED" | Check internet connection |
| Settings not applying | Fully close and reopen Termux |
| Ctrl+C not working | Tap CTRL on Termux extra keys, then C |

## 💡 Tips

- 🔋 Keep your phone charged — AI uses battery
- 📶 Use WiFi for faster responses
- ⌨️ Connect a Bluetooth keyboard for easier typing
- 💾 Free models: ~20 requests/min, ~200/day
- 🔄 If a model is slow, try a different free model

## 🤝 Contributing

We welcome contributions! PocketClaw is fully open source (Apache 2.0).

- Report bugs and suggest features
- Improve documentation
- Submit code improvements
- Share your MCP servers and extensions

See our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Original Work**: Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google
- All original copyright and attribution notices retained per Apache 2.0 requirements

---

<p align="center">
  Built with 🐾 by the PocketClaw community
</p>
