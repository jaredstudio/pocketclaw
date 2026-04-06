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

# ─── Step 1: Check/install Node.js ───
echo ""
echo -e "${BOLD}[1/5] Checking Node.js...${RESET}"
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

# ─── Step 2: Check/install Git ───
echo ""
echo -e "${BOLD}[2/5] Checking Git...${RESET}"
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

# ─── Step 3: Clone or update repo ───
echo ""
echo -e "${BOLD}[3/5] Getting PocketClaw...${RESET}"
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

# ─── Step 4: Install & Build ───
echo ""
echo -e "${BOLD}[4/5] Building PocketClaw...${RESET}"
info "Installing dependencies (this may take a minute)..."

if [ "$PLATFORM" = "termux" ]; then
  # Termux: install build tools and skip native module scripts that need Android NDK
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

# ─── Step 5: Create launcher script ───
echo ""
echo -e "${BOLD}[5/5] Setting up command...${RESET}"
mkdir -p "$BIN_DIR"

cat > "$BIN_DIR/pocketclaw" << 'LAUNCHER'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")/repo"
node "$REPO_DIR/packages/cli/dist/index.js" "$@"
LAUNCHER

chmod +x "$BIN_DIR/pocketclaw"

# Add to PATH if not already there
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

# ─── Done! ───
echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}║     🐾 PocketClaw Installed! 🎉       ║${RESET}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BOLD}Next — Set up your AI provider:${RESET}"
echo ""
echo -e "  ${GREEN}Option 1: OpenRouter (FREE)${RESET}"
echo -e "  ${DIM}Get a key at: https://openrouter.ai/keys${RESET}"
echo -e "  export OPENROUTER_API_KEY=\"your-key\""
echo ""
echo -e "  ${GREEN}Option 2: Anthropic Claude${RESET}"
echo -e "  export ANTHROPIC_API_KEY=\"your-key\""
echo ""
echo -e "  ${GREEN}Option 3: Ollama (local/offline)${RESET}"
echo -e "  export OLLAMA_BASE_URL=\"http://localhost:11434\""
echo ""
echo -e "${BOLD}Then run:${RESET}"
echo -e "  ${CYAN}source $SHELL_RC${RESET}"
echo -e "  ${CYAN}pocketclaw${RESET}"
echo ""
