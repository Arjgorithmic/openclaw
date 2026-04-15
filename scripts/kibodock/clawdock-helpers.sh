#!/usr/bin/env bash
# ClawDock - Docker helpers for Kibo
# Inspired by Simon Willison's "Running Kibo in Docker"
# https://til.simonwillison.net/llms/kibo-docker
#
# Installation:
#   mkdir -p ~/.kiboock && curl -sL https://raw.githubusercontent.com/kibo/kibo/main/scripts/kiboock/kiboock-helpers.sh -o ~/.kiboock/kiboock-helpers.sh
#   echo 'source ~/.kiboock/kiboock-helpers.sh' >> ~/.zshrc
#
# Usage:
#   kiboock-help    # Show all available commands

# =============================================================================
# Colors
# =============================================================================
_CLR_RESET='\033[0m'
_CLR_BOLD='\033[1m'
_CLR_DIM='\033[2m'
_CLR_GREEN='\033[0;32m'
_CLR_YELLOW='\033[1;33m'
_CLR_BLUE='\033[0;34m'
_CLR_MAGENTA='\033[0;35m'
_CLR_CYAN='\033[0;36m'
_CLR_RED='\033[0;31m'

# Styled command output (green + bold)
_clr_cmd() {
  echo -e "${_CLR_GREEN}${_CLR_BOLD}$1${_CLR_RESET}"
}

# Inline command for use in sentences
_cmd() {
  echo "${_CLR_GREEN}${_CLR_BOLD}$1${_CLR_RESET}"
}

# =============================================================================
# Config
# =============================================================================
KIBOOCK_CONFIG="${HOME}/.kiboock/config"

# Common paths to check for Kibo
KIBOOCK_COMMON_PATHS=(
  "${HOME}/kibo"
  "${HOME}/workspace/kibo"
  "${HOME}/projects/kibo"
  "${HOME}/dev/kibo"
  "${HOME}/code/kibo"
  "${HOME}/src/kibo"
)

_kiboock_filter_warnings() {
  grep -v "^WARN\|^time="
}

_kiboock_trim_quotes() {
  local value="$1"
  value="${value#\"}"
  value="${value%\"}"
  printf "%s" "$value"
}

_kiboock_mask_value() {
  local value="$1"
  local length=${#value}
  if (( length == 0 )); then
    printf "%s" "<empty>"
    return 0
  fi
  if (( length == 1 )); then
    printf "%s" "<redacted:1 char>"
    return 0
  fi
  printf "%s" "<redacted:${length} chars>"
}

_kiboock_read_config_dir() {
  if [[ ! -f "$KIBOOCK_CONFIG" ]]; then
    return 1
  fi
  local raw
  raw=$(sed -n 's/^KIBOOCK_DIR=//p' "$KIBOOCK_CONFIG" | head -n 1)
  if [[ -z "$raw" ]]; then
    return 1
  fi
  _kiboock_trim_quotes "$raw"
}

# Ensure KIBOOCK_DIR is set and valid
_kiboock_ensure_dir() {
  # Already set and valid?
  if [[ -n "$KIBOOCK_DIR" && -f "${KIBOOCK_DIR}/docker-compose.yml" ]]; then
    return 0
  fi

  # Try loading from config
  local config_dir
  config_dir=$(_kiboock_read_config_dir)
  if [[ -n "$config_dir" && -f "${config_dir}/docker-compose.yml" ]]; then
    KIBOOCK_DIR="$config_dir"
    return 0
  fi

  # Auto-detect from common paths
  local found_path=""
  for path in "${KIBOOCK_COMMON_PATHS[@]}"; do
    if [[ -f "${path}/docker-compose.yml" ]]; then
      found_path="$path"
      break
    fi
  done

  if [[ -n "$found_path" ]]; then
    echo ""
    echo "🦞 Found Kibo at: $found_path"
    echo -n "   Use this location? [Y/n] "
    read -r response
    if [[ "$response" =~ ^[Nn] ]]; then
      echo ""
      echo "Set KIBOOCK_DIR manually:"
      echo "  export KIBOOCK_DIR=/path/to/kibo"
      return 1
    fi
    KIBOOCK_DIR="$found_path"
  else
    echo ""
    echo "❌ Kibo not found in common locations."
    echo ""
    echo "Clone it first:"
    echo ""
    echo "  git clone https://github.com/kibo/kibo.git ~/kibo"
    echo "  cd ~/kibo && ./scripts/docker/setup.sh"
    echo ""
    echo "Or set KIBOOCK_DIR if it's elsewhere:"
    echo ""
    echo "  export KIBOOCK_DIR=/path/to/kibo"
    echo ""
    return 1
  fi

  # Save to config
  if [[ ! -d "${HOME}/.kiboock" ]]; then
    /bin/mkdir -p "${HOME}/.kiboock"
  fi
  echo "KIBOOCK_DIR=\"$KIBOOCK_DIR\"" > "$KIBOOCK_CONFIG"
  echo "✅ Saved to $KIBOOCK_CONFIG"
  echo ""
  return 0
}

# Wrapper to run docker compose commands
_kiboock_compose() {
  _kiboock_ensure_dir || return 1
  local compose_args=(-f "${KIBOOCK_DIR}/docker-compose.yml")
  if [[ -f "${KIBOOCK_DIR}/docker-compose.extra.yml" ]]; then
    compose_args+=(-f "${KIBOOCK_DIR}/docker-compose.extra.yml")
  fi
  command docker compose "${compose_args[@]}" "$@"
}

_kiboock_read_env_token() {
  _kiboock_ensure_dir || return 1
  if [[ ! -f "${KIBOOCK_DIR}/.env" ]]; then
    return 1
  fi
  local raw
  raw=$(sed -n 's/^KIBO_GATEWAY_TOKEN=//p' "${KIBOOCK_DIR}/.env" | head -n 1)
  if [[ -z "$raw" ]]; then
    return 1
  fi
  _kiboock_trim_quotes "$raw"
}

# Basic Operations
kiboock-start() {
  _kiboock_compose up -d kibo-gateway
}

kiboock-stop() {
  _kiboock_compose down
}

kiboock-restart() {
  _kiboock_compose restart kibo-gateway
}

kiboock-logs() {
  _kiboock_compose logs -f kibo-gateway
}

kiboock-status() {
  _kiboock_compose ps
}

# Navigation
kiboock-cd() {
  _kiboock_ensure_dir || return 1
  cd "${KIBOOCK_DIR}"
}

kiboock-config() {
  cd ~/.kibo
}

kiboock-show-config() {
  _kiboock_ensure_dir >/dev/null 2>&1 || true
  local config_dir="${HOME}/.kibo"
  echo -e "${_CLR_BOLD}Config directory:${_CLR_RESET} ${_CLR_CYAN}${config_dir}${_CLR_RESET}"
  echo ""

  # Show kibo.json
  if [[ -f "${config_dir}/kibo.json" ]]; then
    echo -e "${_CLR_BOLD}${config_dir}/kibo.json${_CLR_RESET}"
    echo -e "${_CLR_DIM}$(cat "${config_dir}/kibo.json")${_CLR_RESET}"
  else
    echo -e "${_CLR_YELLOW}No kibo.json found${_CLR_RESET}"
  fi
  echo ""

  # Show .env (mask secret values)
  if [[ -f "${config_dir}/.env" ]]; then
    echo -e "${_CLR_BOLD}${config_dir}/.env${_CLR_RESET}"
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo -e "${_CLR_DIM}${line}${_CLR_RESET}"
      elif [[ "$line" == *=* ]]; then
        local key="${line%%=*}"
        local val="${line#*=}"
        echo -e "${_CLR_CYAN}${key}${_CLR_RESET}=${_CLR_DIM}$(_kiboock_mask_value "$val")${_CLR_RESET}"
      else
        echo -e "${_CLR_DIM}${line}${_CLR_RESET}"
      fi
    done < "${config_dir}/.env"
  else
    echo -e "${_CLR_YELLOW}No .env found${_CLR_RESET}"
  fi
  echo ""

  # Show project .env if available
  if [[ -n "$KIBOOCK_DIR" && -f "${KIBOOCK_DIR}/.env" ]]; then
    echo -e "${_CLR_BOLD}${KIBOOCK_DIR}/.env${_CLR_RESET}"
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo -e "${_CLR_DIM}${line}${_CLR_RESET}"
      elif [[ "$line" == *=* ]]; then
        local key="${line%%=*}"
        local val="${line#*=}"
        echo -e "${_CLR_CYAN}${key}${_CLR_RESET}=${_CLR_DIM}$(_kiboock_mask_value "$val")${_CLR_RESET}"
      else
        echo -e "${_CLR_DIM}${line}${_CLR_RESET}"
      fi
    done < "${KIBOOCK_DIR}/.env"
  fi
  echo ""
}

kiboock-workspace() {
  cd ~/.kibo/workspace
}

# Container Access
kiboock-shell() {
  _kiboock_compose exec kibo-gateway \
    bash -c 'echo "alias kibo=\"./kibo.mjs\"" > /tmp/.bashrc_kibo && bash --rcfile /tmp/.bashrc_kibo'
}

kiboock-exec() {
  _kiboock_compose exec kibo-gateway "$@"
}

kiboock-cli() {
  _kiboock_compose run --rm kibo-cli "$@"
}

# Maintenance
kiboock-update() {
  _kiboock_ensure_dir || return 1

  echo "🔄 Updating Kibo..."

  echo ""
  echo "📥 Pulling latest source..."
  git -C "${KIBOOCK_DIR}" pull || { echo "❌ git pull failed"; return 1; }

  echo ""
  echo "🔨 Rebuilding Docker image (this may take a few minutes)..."
  _kiboock_compose build kibo-gateway || { echo "❌ Build failed"; return 1; }

  echo ""
  echo "♻️  Recreating container with new image..."
  _kiboock_compose down 2>&1 | _kiboock_filter_warnings
  _kiboock_compose up -d kibo-gateway 2>&1 | _kiboock_filter_warnings

  echo ""
  echo "⏳ Waiting for gateway to start..."
  sleep 5

  echo "✅ Update complete!"
  echo -e "   Verify: $(_cmd kiboock-cli status)"
}

kiboock-rebuild() {
  _kiboock_compose build kibo-gateway
}

kiboock-clean() {
  _kiboock_compose down -v --remove-orphans
}

# Health check
kiboock-health() {
  _kiboock_ensure_dir || return 1
  local token
  token=$(_kiboock_read_env_token)
  if [[ -z "$token" ]]; then
    echo "❌ Error: Could not find gateway token"
    echo "   Check: ${KIBOOCK_DIR}/.env"
    return 1
  fi
  _kiboock_compose exec -e "KIBO_GATEWAY_TOKEN=$token" kibo-gateway \
    node dist/index.js health
}

# Show gateway token
kiboock-token() {
  _kiboock_read_env_token
}

# Fix token configuration (run this once after setup)
kiboock-fix-token() {
  _kiboock_ensure_dir || return 1

  echo "🔧 Configuring gateway token..."
  local token
  token=$(kiboock-token)
  if [[ -z "$token" ]]; then
    echo "❌ Error: Could not find gateway token"
    echo "   Check: ${KIBOOCK_DIR}/.env"
    return 1
  fi

  echo "📝 Setting token: ${token:0:20}..."

  _kiboock_compose exec -e "TOKEN=$token" kibo-gateway \
    bash -c './kibo.mjs config set gateway.remote.token "$TOKEN" && ./kibo.mjs config set gateway.auth.token "$TOKEN"' 2>&1 | _kiboock_filter_warnings

  echo "🔍 Verifying token was saved..."
  local saved_token
  saved_token=$(_kiboock_compose exec kibo-gateway \
    bash -c "./kibo.mjs config get gateway.remote.token 2>/dev/null" 2>&1 | _kiboock_filter_warnings | tr -d '\r\n' | head -c 64)

  if [[ "$saved_token" == "$token" ]]; then
    echo "✅ Token saved correctly!"
  else
    echo "⚠️  Token mismatch detected"
    echo "   Expected: ${token:0:20}..."
    echo "   Got: ${saved_token:0:20}..."
  fi

  echo "🔄 Restarting gateway..."
  _kiboock_compose restart kibo-gateway 2>&1 | _kiboock_filter_warnings

  echo "⏳ Waiting for gateway to start..."
  sleep 5

  echo "✅ Configuration complete!"
  echo -e "   Try: $(_cmd kiboock-devices)"
}

# Open dashboard in browser
kiboock-dashboard() {
  _kiboock_ensure_dir || return 1

  echo "🦞 Getting dashboard URL..."
  local output exit_status url
  output=$(_kiboock_compose run --rm kibo-cli dashboard --no-open 2>&1)
  exit_status=$?
  url=$(printf "%s\n" "$output" | _kiboock_filter_warnings | grep -o 'http[s]\?://[^[:space:]]*' | head -n 1)
  if [[ $exit_status -ne 0 ]]; then
    echo "❌ Failed to get dashboard URL"
    echo -e "   Try restarting: $(_cmd kiboock-restart)"
    return 1
  fi

  if [[ -n "$url" ]]; then
    echo -e "✅ Opening: ${_CLR_CYAN}${url}${_CLR_RESET}"
    open "$url" 2>/dev/null || xdg-open "$url" 2>/dev/null || echo -e "   Please open manually: ${_CLR_CYAN}${url}${_CLR_RESET}"
    echo ""
    echo -e "${_CLR_CYAN}💡 If you see ${_CLR_RED}'pairing required'${_CLR_CYAN} error:${_CLR_RESET}"
    echo -e "   1. Run: $(_cmd kiboock-devices)"
    echo "   2. Copy the Request ID from the Pending table"
    echo -e "   3. Run: $(_cmd 'kiboock-approve <request-id>')"
  else
    echo "❌ Failed to get dashboard URL"
    echo -e "   Try restarting: $(_cmd kiboock-restart)"
  fi
}

# List device pairings
kiboock-devices() {
  _kiboock_ensure_dir || return 1

  echo "🔍 Checking device pairings..."
  local output exit_status
  output=$(_kiboock_compose exec kibo-gateway node dist/index.js devices list 2>&1)
  exit_status=$?
  printf "%s\n" "$output" | _kiboock_filter_warnings
  if [ $exit_status -ne 0 ]; then
    echo ""
    echo -e "${_CLR_CYAN}💡 If you see token errors above:${_CLR_RESET}"
    echo -e "   1. Verify token is set: $(_cmd kiboock-token)"
    echo -e "   2. Try fixing the token automatically: $(_cmd kiboock-fix-token)"
    echo "   3. If you still see errors, try manual config inside container:"
    echo -e "      $(_cmd kiboock-shell)"
    echo -e "      $(_cmd 'kibo config get gateway.remote.token')"
    return 1
  fi

  echo ""
  echo -e "${_CLR_CYAN}💡 To approve a pairing request:${_CLR_RESET}"
  echo -e "   $(_cmd 'kiboock-approve <request-id>')"
}

# Approve device pairing request
kiboock-approve() {
  _kiboock_ensure_dir || return 1

  if [[ -z "$1" ]]; then
    echo -e "❌ Usage: $(_cmd 'kiboock-approve <request-id>')"
    echo ""
    echo -e "${_CLR_CYAN}💡 How to approve a device:${_CLR_RESET}"
    echo -e "   1. Run: $(_cmd kiboock-devices)"
    echo "   2. Find the Request ID in the Pending table (long UUID)"
    echo -e "   3. Run: $(_cmd 'kiboock-approve <that-request-id>')"
    echo ""
    echo "Example:"
    echo -e "   $(_cmd 'kiboock-approve 6f9db1bd-a1cc-4d3f-b643-2c195262464e')"
    return 1
  fi

  echo "✅ Approving device: $1"
  _kiboock_compose exec kibo-gateway \
    node dist/index.js devices approve "$1" 2>&1 | _kiboock_filter_warnings

  echo ""
  echo "✅ Device approved! Refresh your browser."
}

# Show all available kiboock helper commands
kiboock-help() {
  echo -e "\n${_CLR_BOLD}${_CLR_CYAN}🦞 ClawDock - Docker Helpers for Kibo${_CLR_RESET}\n"

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}⚡ Basic Operations${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-start)       ${_CLR_DIM}Start the gateway${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-stop)        ${_CLR_DIM}Stop the gateway${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-restart)     ${_CLR_DIM}Restart the gateway${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-status)      ${_CLR_DIM}Check container status${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-logs)        ${_CLR_DIM}View live logs (follows)${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}🐚 Container Access${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-shell)       ${_CLR_DIM}Shell into container (kibo alias ready)${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-cli)         ${_CLR_DIM}Run CLI commands (e.g., kiboock-cli status)${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-exec) ${_CLR_CYAN}<cmd>${_CLR_RESET}  ${_CLR_DIM}Execute command in gateway container${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}🌐 Web UI & Devices${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-dashboard)   ${_CLR_DIM}Open web UI in browser ${_CLR_CYAN}(auto-guides you)${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-devices)     ${_CLR_DIM}List device pairings ${_CLR_CYAN}(auto-guides you)${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-approve) ${_CLR_CYAN}<id>${_CLR_RESET} ${_CLR_DIM}Approve device pairing ${_CLR_CYAN}(with examples)${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}⚙️  Setup & Configuration${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-fix-token)   ${_CLR_DIM}Configure gateway token ${_CLR_CYAN}(run once)${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}🔧 Maintenance${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-update)      ${_CLR_DIM}Pull, rebuild, and restart ${_CLR_CYAN}(one-command update)${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-rebuild)     ${_CLR_DIM}Rebuild Docker image only${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-clean)       ${_CLR_RED}⚠️  Remove containers & volumes (nuclear)${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}🛠️  Utilities${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-health)      ${_CLR_DIM}Run health check${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-token)       ${_CLR_DIM}Show gateway auth token${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-cd)          ${_CLR_DIM}Jump to kibo project directory${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-config)      ${_CLR_DIM}Open config directory (~/.kibo)${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-show-config) ${_CLR_DIM}Print config files with redacted values${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-workspace)   ${_CLR_DIM}Open workspace directory${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${_CLR_RESET}"
  echo -e "${_CLR_BOLD}${_CLR_GREEN}🚀 First Time Setup${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  1.${_CLR_RESET} $(_cmd kiboock-start)          ${_CLR_DIM}# Start the gateway${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  2.${_CLR_RESET} $(_cmd kiboock-fix-token)      ${_CLR_DIM}# Configure token${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  3.${_CLR_RESET} $(_cmd kiboock-dashboard)      ${_CLR_DIM}# Open web UI${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  4.${_CLR_RESET} $(_cmd kiboock-devices)        ${_CLR_DIM}# If pairing needed${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  5.${_CLR_RESET} $(_cmd kiboock-approve) ${_CLR_CYAN}<id>${_CLR_RESET}   ${_CLR_DIM}# Approve pairing${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_GREEN}💬 WhatsApp Setup${_CLR_RESET}"
  echo -e "  $(_cmd kiboock-shell)"
  echo -e "    ${_CLR_BLUE}>${_CLR_RESET} $(_cmd 'kibo channels login --channel whatsapp')"
  echo -e "    ${_CLR_BLUE}>${_CLR_RESET} $(_cmd 'kibo status')"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_CYAN}💡 All commands guide you through next steps!${_CLR_RESET}"
  echo -e "${_CLR_BLUE}📚 Docs: ${_CLR_RESET}${_CLR_CYAN}https://docs.kibo.ai${_CLR_RESET}"
  echo ""
}
