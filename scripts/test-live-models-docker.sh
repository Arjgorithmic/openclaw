#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/scripts/lib/live-docker-auth.sh"
IMAGE_NAME="${KIBO_IMAGE:-kibo:local}"
LIVE_IMAGE_NAME="${KIBO_LIVE_IMAGE:-${IMAGE_NAME}-live}"
CONFIG_DIR="${KIBO_CONFIG_DIR:-$HOME/.kibo}"
WORKSPACE_DIR="${KIBO_WORKSPACE_DIR:-$HOME/.kibo/workspace}"
PROFILE_FILE="${KIBO_PROFILE_FILE:-$HOME/.profile}"

PROFILE_MOUNT=()
if [[ -f "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
fi

AUTH_DIRS=()
AUTH_FILES=()
if [[ -n "${KIBO_DOCKER_AUTH_DIRS:-}" ]]; then
  while IFS= read -r auth_dir; do
    [[ -n "$auth_dir" ]] || continue
    AUTH_DIRS+=("$auth_dir")
  done < <(kibo_live_collect_auth_dirs)
  while IFS= read -r auth_file; do
    [[ -n "$auth_file" ]] || continue
    AUTH_FILES+=("$auth_file")
  done < <(kibo_live_collect_auth_files)
elif [[ -n "${KIBO_LIVE_PROVIDERS:-}" || -n "${KIBO_LIVE_GATEWAY_PROVIDERS:-}" ]]; then
  while IFS= read -r auth_dir; do
    [[ -n "$auth_dir" ]] || continue
    AUTH_DIRS+=("$auth_dir")
  done < <(
    {
      kibo_live_collect_auth_dirs_from_csv "${KIBO_LIVE_PROVIDERS:-}"
      kibo_live_collect_auth_dirs_from_csv "${KIBO_LIVE_GATEWAY_PROVIDERS:-}"
    } | awk '!seen[$0]++'
  )
  while IFS= read -r auth_file; do
    [[ -n "$auth_file" ]] || continue
    AUTH_FILES+=("$auth_file")
  done < <(
    {
      kibo_live_collect_auth_files_from_csv "${KIBO_LIVE_PROVIDERS:-}"
      kibo_live_collect_auth_files_from_csv "${KIBO_LIVE_GATEWAY_PROVIDERS:-}"
    } | awk '!seen[$0]++'
  )
else
  while IFS= read -r auth_dir; do
    [[ -n "$auth_dir" ]] || continue
    AUTH_DIRS+=("$auth_dir")
  done < <(kibo_live_collect_auth_dirs)
  while IFS= read -r auth_file; do
    [[ -n "$auth_file" ]] || continue
    AUTH_FILES+=("$auth_file")
  done < <(kibo_live_collect_auth_files)
fi
AUTH_DIRS_CSV=""
if ((${#AUTH_DIRS[@]} > 0)); then
  AUTH_DIRS_CSV="$(kibo_live_join_csv "${AUTH_DIRS[@]}")"
fi
AUTH_FILES_CSV=""
if ((${#AUTH_FILES[@]} > 0)); then
  AUTH_FILES_CSV="$(kibo_live_join_csv "${AUTH_FILES[@]}")"
fi

EXTERNAL_AUTH_MOUNTS=()
if ((${#AUTH_DIRS[@]} > 0)); then
  for auth_dir in "${AUTH_DIRS[@]}"; do
    host_path="$HOME/$auth_dir"
    if [[ -d "$host_path" ]]; then
      EXTERNAL_AUTH_MOUNTS+=(-v "$host_path":/host-auth/"$auth_dir":ro)
    fi
  done
fi
if ((${#AUTH_FILES[@]} > 0)); then
  for auth_file in "${AUTH_FILES[@]}"; do
    host_path="$HOME/$auth_file"
    if [[ -f "$host_path" ]]; then
      EXTERNAL_AUTH_MOUNTS+=(-v "$host_path":/host-auth-files/"$auth_file":ro)
    fi
  done
fi

read -r -d '' LIVE_TEST_CMD <<'EOF' || true
set -euo pipefail
[ -f "$HOME/.profile" ] && source "$HOME/.profile" || true
IFS=',' read -r -a auth_dirs <<<"${KIBO_DOCKER_AUTH_DIRS_RESOLVED:-}"
IFS=',' read -r -a auth_files <<<"${KIBO_DOCKER_AUTH_FILES_RESOLVED:-}"
if ((${#auth_dirs[@]} > 0)); then
  for auth_dir in "${auth_dirs[@]}"; do
    [ -n "$auth_dir" ] || continue
    if [ -d "/host-auth/$auth_dir" ]; then
      mkdir -p "$HOME/$auth_dir"
      cp -R "/host-auth/$auth_dir/." "$HOME/$auth_dir"
      chmod -R u+rwX "$HOME/$auth_dir" || true
    fi
  done
fi
if ((${#auth_files[@]} > 0)); then
  for auth_file in "${auth_files[@]}"; do
    [ -n "$auth_file" ] || continue
    if [ -f "/host-auth-files/$auth_file" ]; then
      mkdir -p "$(dirname "$HOME/$auth_file")"
      cp "/host-auth-files/$auth_file" "$HOME/$auth_file"
      chmod u+rw "$HOME/$auth_file" || true
    fi
  done
fi
tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT
source /src/scripts/lib/live-docker-stage.sh
kibo_live_stage_source_tree "$tmp_dir"
kibo_live_link_runtime_tree "$tmp_dir"
kibo_live_stage_state_dir "$tmp_dir/.kibo-state"
kibo_live_prepare_staged_config
cd "$tmp_dir"
pnpm test:live:models-profiles
EOF

"$ROOT_DIR/scripts/test-live-build-docker.sh"

echo "==> Run live model tests (profile keys)"
echo "==> Target: src/agents/models.profiles.live.test.ts"
echo "==> External auth dirs: ${AUTH_DIRS_CSV:-none}"
echo "==> External auth files: ${AUTH_FILES_CSV:-none}"
docker run --rm -t \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS=--disable-warning=ExperimentalWarning \
  -e KIBO_SKIP_CHANNELS=1 \
  -e KIBO_SUPPRESS_NOTES=1 \
  -e KIBO_DOCKER_AUTH_DIRS_RESOLVED="$AUTH_DIRS_CSV" \
  -e KIBO_DOCKER_AUTH_FILES_RESOLVED="$AUTH_FILES_CSV" \
  -e KIBO_LIVE_TEST=1 \
  -e KIBO_LIVE_MODELS="${KIBO_LIVE_MODELS:-modern}" \
  -e KIBO_LIVE_PROVIDERS="${KIBO_LIVE_PROVIDERS:-}" \
  -e KIBO_LIVE_MAX_MODELS="${KIBO_LIVE_MAX_MODELS:-12}" \
  -e KIBO_LIVE_MODEL_TIMEOUT_MS="${KIBO_LIVE_MODEL_TIMEOUT_MS:-}" \
  -e KIBO_LIVE_REQUIRE_PROFILE_KEYS="${KIBO_LIVE_REQUIRE_PROFILE_KEYS:-}" \
  -e KIBO_LIVE_GATEWAY_MODELS="${KIBO_LIVE_GATEWAY_MODELS:-}" \
  -e KIBO_LIVE_GATEWAY_PROVIDERS="${KIBO_LIVE_GATEWAY_PROVIDERS:-}" \
  -e KIBO_LIVE_GATEWAY_MAX_MODELS="${KIBO_LIVE_GATEWAY_MAX_MODELS:-}" \
  -v "$ROOT_DIR":/src:ro \
  -v "$CONFIG_DIR":/home/node/.kibo \
  -v "$WORKSPACE_DIR":/home/node/.kibo/workspace \
  "${EXTERNAL_AUTH_MOUNTS[@]}" \
  "${PROFILE_MOUNT[@]}" \
  "$LIVE_IMAGE_NAME" \
  -lc "$LIVE_TEST_CMD"
