#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${KIBO_INSTALL_E2E_IMAGE:-kibo-install-e2e:local}"
INSTALL_URL="${KIBO_INSTALL_URL:-https://kibo.bot/install.sh}"

OPENAI_API_KEY="${OPENAI_API_KEY:-}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
ANTHROPIC_API_TOKEN="${ANTHROPIC_API_TOKEN:-}"
KIBO_E2E_MODELS="${KIBO_E2E_MODELS:-}"

echo "==> Build image: $IMAGE_NAME"
docker build \
  -t "$IMAGE_NAME" \
  -f "$ROOT_DIR/scripts/docker/install-sh-e2e/Dockerfile" \
  "$ROOT_DIR/scripts/docker"

echo "==> Run E2E installer test"
docker run --rm \
  -e KIBO_INSTALL_URL="$INSTALL_URL" \
  -e KIBO_INSTALL_TAG="${KIBO_INSTALL_TAG:-latest}" \
  -e KIBO_E2E_MODELS="$KIBO_E2E_MODELS" \
  -e KIBO_INSTALL_E2E_PREVIOUS="${KIBO_INSTALL_E2E_PREVIOUS:-}" \
  -e KIBO_INSTALL_E2E_SKIP_PREVIOUS="${KIBO_INSTALL_E2E_SKIP_PREVIOUS:-0}" \
  -e KIBO_NO_ONBOARD=1 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  -e ANTHROPIC_API_TOKEN="$ANTHROPIC_API_TOKEN" \
  "$IMAGE_NAME"
