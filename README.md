# 🐾 PocketClaw

**Run AI Code Agent FREE on Android & iOS — No PC Required**

> Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google, licensed under Apache 2.0.

PocketClaw puts a full AI coding assistant in your pocket. Run it on Android (Termux), iOS (iSH), or any terminal — completely free using open AI models through OpenRouter.

---

## What You Will Get

- ✅ AI coding assistant running on your phone
- ✅ 100% FREE — no paid subscription needed
- ✅ Works with powerful AI models via OpenRouter
- ✅ No PC required — everything done on your phone

## What You Need

- Android phone (4GB+ RAM recommended, 8GB ideal) **or** iPhone/iPad
- Internet connection
- A free OpenRouter account
- About 30 minutes of your time

---

# 📱 ANDROID — Complete Step-by-Step Guide (Termux)

## PART 1 — Install Termux

**Step 1.** Open your phone's browser and go to:
🔗 https://f-droid.org/en/

**Step 2.** Download and install the **F-Droid** app from that website.

**Step 3.** Open F-Droid and search for **"Termux"**

**Step 4.** Install these two apps by tapping the download button:
- ✅ **Termux** — Terminal emulator with packages (Version 0.118.3)
- ✅ **Termux:Boot** — Add-on that allows programs to run at boot (Version 0.8.1)

> ⚠️ **WARNING:** Do NOT install Termux from Google Play Store.
> The Play Store version is outdated and will cause errors.
> Always use F-Droid: https://f-droid.org/en/

**Step 5.** Open Termux. You will see a black terminal screen.

> 💡 **TIP:** Swipe from the left edge to open the session sidebar.
> Tap "New Session" to open multiple terminals at once.

---

## PART 2 — Set Up Termux

**Step 6.** Update Termux packages. Type this and press Enter:

```bash
pkg update && pkg upgrade -y
```

When asked questions, press Enter to accept defaults.

**Step 7.** Grant storage access:

```bash
termux-setup-storage
```

Tap **"Allow"** when your phone asks for permission.

---

## PART 3 — Install Node.js and PocketClaw

**Step 8.** Install Node.js:

```bash
pkg install nodejs -y
```

**Step 9.** Install PocketClaw:

```bash
npm install -g pocketclaw
```

This may take 3–5 minutes. Wait for it to finish.

---

## PART 4 — Get Your Free OpenRouter API Key

**Step 10.** Open Chrome on your phone and go to:
🔗 [openrouter.ai/keys](https://openrouter.ai/keys)

**Step 11.** Sign up for a free account (no credit card needed).

**Step 12.** Click **"Create Key"** and copy your API key.

Your key will look like: `sk-or-v1-xxxxxxxxxxxx`

> 🔒 Keep this key safe — do not share it publicly.

---

## PART 5 — Configure PocketClaw

**Step 13.** Create the PocketClaw config folder:

```bash
mkdir -p ~/.pocketclaw
```

**Step 14.** Create the settings file. Copy this entire block, replace `YOUR_KEY_HERE` with your real OpenRouter key, then paste and press Enter:

```bash
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

**Step 15.** Verify the file was saved correctly:

```bash
cat ~/.pocketclaw/settings.json
```

Make sure you can see your API key in the output.

---

## PART 6 — Launch PocketClaw

**Step 16.** Close Termux completely:
- Press the square **Recent Apps** button
- Swipe Termux away to close it

**Step 17.** Reopen Termux.

**Step 18.** Type and press Enter:

```bash
pocketclaw
```

**Step 19.** You should see the PocketClaw welcome screen showing your model name (`qwen/qwen3.6-plus:free`).

**Step 20.** Type `hello` and press Enter to test it! 🎉

---

# 🍎 iOS — Complete Step-by-Step Guide (iSH)

## PART 1 — Install iSH

**Step 1.** Open the App Store on your iPhone/iPad and search for **"iSH Shell"**

🔗 [Download iSH from App Store](https://apps.apple.com/app/ish-shell/id1436902243)

**Step 2.** Install and open **iSH Shell**. You will see a terminal screen.

> 💡 **TIP:** iSH provides a Linux (Alpine) environment on iOS.
> It works similarly to Termux but uses Alpine package manager (`apk`).

---

## PART 2 — Set Up iSH

**Step 3.** Update packages:

```bash
apk update && apk upgrade
```

**Step 4.** Install required tools:

```bash
apk add nodejs npm git curl
```

Wait for the installation to complete.

---

## PART 3 — Install PocketClaw

**Step 5.** Install PocketClaw globally:

```bash
npm install -g pocketclaw
```

This may take 5–10 minutes on iOS. Be patient — iSH emulates x86 on ARM, so it's slower than Termux.

> 💡 **TIP:** If npm hangs, try:
> ```bash
> npm install -g pocketclaw --prefer-offline
> ```

---

## PART 4 — Get Your Free OpenRouter API Key

**Step 6.** Open Safari on your iPhone/iPad and go to:
🔗 [openrouter.ai/keys](https://openrouter.ai/keys)

**Step 7.** Sign up for a free account (no credit card needed).

**Step 8.** Click **"Create Key"** and copy your API key.

Your key will look like: `sk-or-v1-xxxxxxxxxxxx`

> 🔒 Keep this key safe — do not share it publicly.

---

## PART 5 — Configure PocketClaw

**Step 9.** Create the PocketClaw config folder:

```bash
mkdir -p ~/.pocketclaw
```

**Step 10.** Create the settings file. Copy this entire block, replace `YOUR_KEY_HERE` with your real OpenRouter key, then paste:

```bash
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

**Step 11.** Verify the file was saved:

```bash
cat ~/.pocketclaw/settings.json
```

---

## PART 6 — Launch PocketClaw on iOS

**Step 12.** Fully close iSH:
- Swipe up from the bottom (or double-press Home button)
- Swipe iSH away to close it

**Step 13.** Reopen iSH.

**Step 14.** Launch PocketClaw:

```bash
pocketclaw
```

**Step 15.** You should see the PocketClaw welcome screen. Type `hello` to test! 🎉

> ⚠️ **iOS Note:** iSH is slower than Termux because it emulates x86.
> Responses may take a bit longer. WiFi is strongly recommended.

---

# 💻 Desktop Installation (macOS / Windows / Linux)

## macOS / Linux

```bash
npm install -g pocketclaw
mkdir -p ~/.pocketclaw
# Create settings.json as shown above
pocketclaw
```

## Windows (PowerShell)

```powershell
npm install -g pocketclaw
mkdir "$env:USERPROFILE\.pocketclaw" -Force
# Create settings.json in %USERPROFILE%\.pocketclaw\
pocketclaw
```

---

# ⌨️ Using PocketClaw

## Basic Commands

| Command | What it does |
|---------|-------------|
| Type your message | Ask PocketClaw anything |
| `/model` | Switch AI model |
| `/clear` | Clear conversation |
| `Ctrl + C` | Cancel/Exit |
| `exit` | Close PocketClaw |

## Example Prompts to Try

- `"Create a simple HTML website for me"`
- `"Write a Python script to rename files"`
- `"Explain how JavaScript works"`
- `"Help me debug this code: [paste your code]"`

---

# 🎯 Free Models You Can Use

If your current model stops working, update the `ANTHROPIC_MODEL` value in `~/.pocketclaw/settings.json` with any of these free models:

| Model | Best For |
|-------|----------|
| `qwen/qwen3.6-plus:free` | General coding |
| `qwen/qwen3-coder:free` | Code generation |
| `nvidia/nemotron-3-super-120b-a12b:free` | Smart reasoning |
| `google/gemma-3-27b-it:free` | General tasks |
| `mistralai/devstral-small:free` | Coding tasks |

To change the model, edit your settings file:

```bash
cat > ~/.pocketclaw/settings.json << 'EOF'
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_KEY_HERE",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_MODEL": "NEW_MODEL_NAME_HERE"
  },
  "model": "sonnet[1m]"
}
EOF
```

Then close and reopen your terminal app, and run `pocketclaw` again.

Visit [openrouter.ai/models](https://openrouter.ai/models) and filter by **"Free"** for the latest models.

---

# 📋 Key Features

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
- Custom context files (`POCKETCLAW.md`)
- Skills and extensions system

---

# 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Model not found"** error | The model ID is wrong or no longer free. Visit [openrouter.ai/models](https://openrouter.ai/models) and filter by Free. Update `ANTHROPIC_MODEL` in settings.json. |
| **"402 Not enough credits"** error | Your OpenRouter free credits ran out. Switch to a different free model (see Free Models section). |
| **"ECONNREFUSED"** error | No internet connection. Check your WiFi/data. |
| **PocketClaw still asks to log in** | `ANTHROPIC_API_KEY` must be set to `""` (empty string). Recheck your settings.json file. |
| **Settings not taking effect** | You must fully close and reopen Termux/iSH. A new tab is not enough — swipe the app away first. |
| **Ctrl+C not working (Termux)** | Tap CTRL on the Termux extra key bar, then tap C. Or press ESC on the extra key bar. |
| **Ctrl+C not working (iSH)** | Tap the Ctrl button on the iSH keyboard bar, then tap C. |
| **iSH is very slow** | This is normal — iSH emulates x86 on ARM. Use WiFi, keep the app in foreground, and be patient. |
| **npm install fails on iSH** | Try `npm install -g pocketclaw --prefer-offline` or `npm install -g pocketclaw --no-optional` |

---

# 💡 Tips for Best Experience

- 🔋 Keep your phone charged — AI uses battery
- 📶 Use WiFi for faster responses
- ⌨️ Connect a Bluetooth keyboard for easier typing
- 💾 Free models have limits: ~20 requests/min, ~200/day
- 🔄 If a model is slow, try a different free model
- 📱 **Termux users:** Install Termux:Boot to auto-start on boot
- 🍎 **iSH users:** Keep the app in foreground for best performance

## Free Model Limits on OpenRouter

| Limit | Amount |
|-------|--------|
| Requests per minute | ~20 |
| Requests per day | ~200 |
| Cost | $0.00 forever |

---

# 🤝 Contributing

We welcome contributions! PocketClaw is fully open source (Apache 2.0).

- Report bugs and suggest features
- Improve documentation
- Submit code improvements
- Share your MCP servers and extensions

See our [Contributing Guide](./CONTRIBUTING.md) for details.

---

# 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Original Work**: Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google
- All original copyright and attribution notices retained per Apache 2.0 requirements

---

<p align="center">
  Built with 🐾 by the PocketClaw community<br>
  <em>Guide created April 2026 — Models and availability may change. Always check <a href="https://openrouter.ai/models">openrouter.ai/models</a> for current free models.</em>
</p>
