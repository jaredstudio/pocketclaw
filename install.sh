#!/bin/bash
# ╔════════════════════════════════════════════╗
# ║  🐾 PocketClaw Installer                  ║
# ║  AI Coding Agent for Mobile & Desktop      ║
# ╚════════════════════════════════════════════╝

set -e

BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[32m'
CYAN='\033[36m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

print_banner() {
  echo ""
  echo -e "${CYAN}${BOLD}╔════════════════════════════════════════╗${RESET}"
  echo -e "${CYAN}${BOLD}║      🐾 PocketClaw Installer          ║${RESET}"
  echo -e "${CYAN}${BOLD}╚════════════════════════════════════════╝${RESET}"
  echo ""
}

log()   { echo -e "${GREEN}✓${RESET} $1"; }
warn()  { echo -e "${YELLOW}⚠${RESET} $1"; }
fail()  { echo -e "${RED}✗${RESET} $1"; exit 1; }
info()  { echo -e "${DIM}  $1${RESET}"; }

INSTALL_DIR="$HOME/.pocketclaw"
BIN_DIR="$INSTALL_DIR/bin"
REPO_URL="https://github.com/jaredstudio/pocketclaw.git"

print_banner

# ─── Detect platform ───
PLATFORM="unknown"
if [ -d "/data/data/com.termux" ]; then
  PLATFORM="termux"
elif [ "$(uname)" = "Darwin" ]; then
  PLATFORM="macos"
elif [ "$(uname)" = "Linux" ]; then
  PLATFORM="linux"
fi
info "Platform: $PLATFORM"

# ═══════════════════════════════════════════
# STEP 1: Check/install Node.js
# ═══════════════════════════════════════════
echo ""
echo -e "${BOLD}[1/6] Checking Node.js...${RESET}"
if command -v node &>/dev/null; then
  NODE_VER=$(node -v)
  log "Node.js $NODE_VER found"
else
  warn "Node.js not found — installing..."
  if [ "$PLATFORM" = "termux" ]; then
    pkg install nodejs-lts -y || fail "Could not install Node.js"
  elif [ "$PLATFORM" = "macos" ]; then
    if command -v brew &>/dev/null; then
      brew install node || fail "Could not install Node.js"
    else
      fail "Install Homebrew first: https://brew.sh"
    fi
  elif [ "$PLATFORM" = "linux" ]; then
    if command -v apt &>/dev/null; then
      sudo apt update && sudo apt install -y nodejs npm || fail "Could not install Node.js"
    elif command -v dnf &>/dev/null; then
      sudo dnf install -y nodejs npm || fail "Could not install Node.js"
    else
      fail "Install Node.js manually: https://nodejs.org"
    fi
  else
    fail "Install Node.js manually: https://nodejs.org"
  fi
  log "Node.js installed"
fi

# ═══════════════════════════════════════════
# STEP 2: Check/install Git
# ═══════════════════════════════════════════
echo ""
echo -e "${BOLD}[2/6] Checking Git...${RESET}"
if command -v git &>/dev/null; then
  log "Git found"
else
  warn "Git not found — installing..."
  if [ "$PLATFORM" = "termux" ]; then
    pkg install git -y || fail "Could not install Git"
  elif [ "$PLATFORM" = "macos" ]; then
    xcode-select --install 2>/dev/null || brew install git
  elif [ "$PLATFORM" = "linux" ]; then
    sudo apt install -y git 2>/dev/null || sudo dnf install -y git
  fi
  log "Git installed"
fi

# ═══════════════════════════════════════════
# STEP 3: Clone or update repo
# ═══════════════════════════════════════════
echo ""
echo -e "${BOLD}[3/6] Getting PocketClaw...${RESET}"
if [ -d "$INSTALL_DIR/repo" ]; then
  info "Updating existing installation..."
  cd "$INSTALL_DIR/repo"
  git pull --ff-only origin main 2>/dev/null || git pull origin main
  log "Updated to latest version"
else
  mkdir -p "$INSTALL_DIR"
  git clone "$REPO_URL" "$INSTALL_DIR/repo" || fail "Could not clone repository"
  cd "$INSTALL_DIR/repo"
  log "Downloaded PocketClaw"
fi

# ═══════════════════════════════════════════
# STEP 4: Install & Build
# ═══════════════════════════════════════════
echo ""
echo -e "${BOLD}[4/6] Building PocketClaw...${RESET}"
info "Installing dependencies (this may take a minute)..."

if [ "$PLATFORM" = "termux" ]; then
  pkg install -y python make 2>/dev/null || true
  npm install --no-fund --no-audit --ignore-scripts 2>/dev/null || npm install --ignore-scripts
  log "Dependencies installed (native modules skipped for Termux)"
else
  npm install --no-fund --no-audit 2>/dev/null || npm install
  log "Dependencies installed"
fi

info "Building..."
npm run build 2>/dev/null || {
  warn "Full build had issues, trying core only..."
  npx tsc -p packages/core/tsconfig.json 2>/dev/null || true
}
log "Build complete"

# ═══════════════════════════════════════════
# STEP 5: Create launcher script
# ═══════════════════════════════════════════
echo ""
echo -e "${BOLD}[5/6] Setting up command...${RESET}"
mkdir -p "$BIN_DIR"

cat > "$BIN_DIR/pocketclaw" << 'LAUNCHER'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")/repo"
node "$REPO_DIR/packages/cli/dist/index.js" "$@"
LAUNCHER

chmod +x "$BIN_DIR/pocketclaw"

# Add to PATH
SHELL_RC=""
if [ -f "$HOME/.bashrc" ]; then
  SHELL_RC="$HOME/.bashrc"
elif [ -f "$HOME/.zshrc" ]; then
  SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.profile" ]; then
  SHELL_RC="$HOME/.profile"
fi

if [ -n "$SHELL_RC" ]; then
  if ! grep -q "pocketclaw/bin" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# PocketClaw" >> "$SHELL_RC"
    echo "export PATH=\"\$HOME/.pocketclaw/bin:\$PATH\"" >> "$SHELL_RC"
    log "Added to PATH in $SHELL_RC"
  else
    log "Already in PATH"
  fi
fi

export PATH="$BIN_DIR:$PATH"
log "Command 'pocketclaw' is ready"

# ═══════════════════════════════════════════
# STEP 6: Configure OpenRouter
# ═══════════════════════════════════════════
echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}║   🔑 OpenRouter Setup                 ║${RESET}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BOLD}PocketClaw uses OpenRouter for FREE AI models.${RESET}"
echo -e "${DIM}Get your free API key at: ${RESET}${CYAN}https://openrouter.ai/keys${RESET}"
echo ""

# ─── API Key Input ───
echo -e "${BOLD}Enter your OpenRouter API Key:${RESET}"
echo -e "${DIM}(starts with sk-or-v1-...)${RESET}"
echo -n "> "
read -r API_KEY

if [ -z "$API_KEY" ]; then
  warn "No API key entered. You can set it later by running:"
  echo -e "  ${CYAN}pocketclaw-setup${RESET}"
  API_KEY="YOUR_KEY_HERE"
fi

# ─── Model Selection ───
echo ""
echo -e "${BOLD}Choose your AI model:${RESET}"
echo ""
echo -e "  ${GREEN}1)${RESET} Qwen 3.6 Plus        ${DIM}— Best for general coding (FREE)${RESET}"
echo -e "  ${GREEN}2)${RESET} Qwen 3 Coder          ${DIM}— Best for code generation (FREE)${RESET}"
echo -e "  ${GREEN}3)${RESET} Gemma 3 27B            ${DIM}— Google's best free model${RESET}"
echo -e "  ${GREEN}4)${RESET} Devstral Small         ${DIM}— Mistral coding model (FREE)${RESET}"
echo -e "  ${GREEN}5)${RESET} Llama 4 Scout          ${DIM}— Meta's latest model (FREE)${RESET}"
echo -e "  ${GREEN}6)${RESET} Custom                 ${DIM}— Enter any OpenRouter model ID${RESET}"
echo ""
echo -n "Pick a number [1-6] (default: 1): "
read -r MODEL_CHOICE

case "$MODEL_CHOICE" in
  2) MODEL_ID="qwen/qwen3-coder:free" ;;
  3) MODEL_ID="google/gemma-3-27b-it:free" ;;
  4) MODEL_ID="mistralai/devstral-small:free" ;;
  5) MODEL_ID="meta-llama/llama-4-scout:free" ;;
  6)
    echo ""
    echo -e "${BOLD}Enter model ID:${RESET}"
    echo -e "${DIM}(e.g. qwen/qwen3.6-plus:free)${RESET}"
    echo -n "> "
    read -r MODEL_ID
    if [ -z "$MODEL_ID" ]; then
      MODEL_ID="qwen/qwen3.6-plus:free"
    fi
    ;;
  *) MODEL_ID="qwen/qwen3.6-plus:free" ;;
esac

log "Model: $MODEL_ID"

# ─── Write settings.json ───
mkdir -p "$HOME/.pocketclaw"

cat > "$HOME/.pocketclaw/settings.json" << SETTINGS
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_AUTH_TOKEN": "${API_KEY}",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_MODEL": "${MODEL_ID}"
  },
  "model": "sonnet[1m]"
}
SETTINGS

log "Settings saved to ~/.pocketclaw/settings.json"

# ─── Create reconfigure script ───
cat > "$BIN_DIR/pocketclaw-setup" << 'SETUP'
#!/bin/bash
BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[32m'
CYAN='\033[36m'
RESET='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}🔑 PocketClaw — Reconfigure OpenRouter${RESET}"
echo ""

echo -e "${BOLD}Enter your OpenRouter API Key:${RESET}"
echo -e "${DIM}(starts with sk-or-v1-...)${RESET}"
echo -n "> "
read -r API_KEY

if [ -z "$API_KEY" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo -e "${BOLD}Choose your AI model:${RESET}"
echo ""
echo -e "  ${GREEN}1)${RESET} Qwen 3.6 Plus        ${DIM}— General coding (FREE)${RESET}"
echo -e "  ${GREEN}2)${RESET} Qwen 3 Coder          ${DIM}— Code generation (FREE)${RESET}"
echo -e "  ${GREEN}3)${RESET} Gemma 3 27B            ${DIM}— Google free model${RESET}"
echo -e "  ${GREEN}4)${RESET} Devstral Small         ${DIM}— Mistral coding (FREE)${RESET}"
echo -e "  ${GREEN}5)${RESET} Llama 4 Scout          ${DIM}— Meta model (FREE)${RESET}"
echo -e "  ${GREEN}6)${RESET} Custom                 ${DIM}— Enter model ID${RESET}"
echo ""
echo -n "Pick [1-6] (default: 1): "
read -r CHOICE

case "$CHOICE" in
  2) MODEL="qwen/qwen3-coder:free" ;;
  3) MODEL="google/gemma-3-27b-it:free" ;;
  4) MODEL="mistralai/devstral-small:free" ;;
  5) MODEL="meta-llama/llama-4-scout:free" ;;
  6)
    echo -n "Model ID: "
    read -r MODEL
    [ -z "$MODEL" ] && MODEL="qwen/qwen3.6-plus:free"
    ;;
  *) MODEL="qwen/qwen3.6-plus:free" ;;
esac

mkdir -p "$HOME/.pocketclaw"
cat > "$HOME/.pocketclaw/settings.json" << EOF
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_AUTH_TOKEN": "${API_KEY}",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_MODEL": "${MODEL}"
  },
  "model": "sonnet[1m]"
}
EOF

echo ""
echo -e "${GREEN}✓${RESET} Settings saved!"
echo -e "${GREEN}✓${RESET} Model: ${MODEL}"
echo -e "${CYAN}Run 'pocketclaw' to start.${RESET}"
SETUP

chmod +x "$BIN_DIR/pocketclaw-setup"

# ═══════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════
echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}║    🐾 PocketClaw is Ready! 🎉         ║${RESET}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BOLD}Your configuration:${RESET}"
echo -e "  API Key:  ${DIM}${API_KEY:0:12}...${RESET}"
echo -e "  Model:    ${GREEN}${MODEL_ID}${RESET}"
echo -e "  Settings: ${DIM}~/.pocketclaw/settings.json${RESET}"
echo ""
echo -e "${BOLD}Commands:${RESET}"
echo -e "  ${CYAN}source $SHELL_RC${RESET}       ${DIM}← reload PATH (first time only)${RESET}"
echo -e "  ${CYAN}pocketclaw${RESET}             ${DIM}← start AI coding agent${RESET}"
echo -e "  ${CYAN}pocketclaw-setup${RESET}       ${DIM}← change API key or model${RESET}"
echo ""
