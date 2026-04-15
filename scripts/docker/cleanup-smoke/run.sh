#!/usr/bin/env bash
set -euo pipefail

cd /repo

export KIBO_STATE_DIR="/tmp/kibo-test"
export KIBO_CONFIG_PATH="${KIBO_STATE_DIR}/kibo.json"

echo "==> Build"
if ! pnpm build >/tmp/kibo-cleanup-build.log 2>&1; then
  cat /tmp/kibo-cleanup-build.log
  exit 1
fi

echo "==> Seed state"
mkdir -p "${KIBO_STATE_DIR}/credentials"
mkdir -p "${KIBO_STATE_DIR}/agents/main/sessions"
echo '{}' >"${KIBO_CONFIG_PATH}"
echo 'creds' >"${KIBO_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${KIBO_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
if ! pnpm kibo reset --scope config+creds+sessions --yes --non-interactive >/tmp/kibo-cleanup-reset.log 2>&1; then
  cat /tmp/kibo-cleanup-reset.log
  exit 1
fi

test ! -f "${KIBO_CONFIG_PATH}"
test ! -d "${KIBO_STATE_DIR}/credentials"
test ! -d "${KIBO_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${KIBO_STATE_DIR}/credentials"
echo '{}' >"${KIBO_CONFIG_PATH}"

echo "==> Uninstall (state only)"
if ! pnpm kibo uninstall --state --yes --non-interactive >/tmp/kibo-cleanup-uninstall.log 2>&1; then
  cat /tmp/kibo-cleanup-uninstall.log
  exit 1
fi

test ! -d "${KIBO_STATE_DIR}"

echo "OK"
