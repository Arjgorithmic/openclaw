---
summary: "Gateway runtime on macOS (external launchd service)"
read_when:
  - Packaging Kibo.app
  - Debugging the macOS gateway launchd service
  - Installing the gateway CLI for macOS
title: "Gateway on macOS"
---

# Gateway on macOS (external launchd)

Kibo.app no longer bundles Node/Bun or the Gateway runtime. The macOS app
expects an **external** `kibo` CLI install, does not spawn the Gateway as a
child process, and manages a per‑user launchd service to keep the Gateway
running (or attaches to an existing local Gateway if one is already running).

## Install the CLI (required for local mode)

Node 24 is the default runtime on the Mac. Node 22 LTS, currently `22.14+`, still works for compatibility. Then install `kibo` globally:

```bash
npm install -g kibo@<version>
```

The macOS app’s **Install CLI** button runs the same global install flow the app
uses internally: it prefers npm first, then pnpm, then bun if that is the only
detected package manager. Node remains the recommended Gateway runtime.

## Launchd (Gateway as LaunchAgent)

Label:

- `ai.kibo.gateway` (or `ai.kibo.<profile>`; legacy `com.kibo.*` may remain)

Plist location (per‑user):

- `~/Library/LaunchAgents/ai.kibo.gateway.plist`
  (or `~/Library/LaunchAgents/ai.kibo.<profile>.plist`)

Manager:

- The macOS app owns LaunchAgent install/update in Local mode.
- The CLI can also install it: `kibo gateway install`.

Behavior:

- “Kibo Active” enables/disables the LaunchAgent.
- App quit does **not** stop the gateway (launchd keeps it alive).
- If a Gateway is already running on the configured port, the app attaches to
  it instead of starting a new one.

Logging:

- launchd stdout/err: `/tmp/kibo/kibo-gateway.log`

## Version compatibility

The macOS app checks the gateway version against its own version. If they’re
incompatible, update the global CLI to match the app version.

## Smoke check

```bash
kibo --version

KIBO_SKIP_CHANNELS=1 \
KIBO_SKIP_CANVAS_HOST=1 \
kibo gateway --port 18999 --bind loopback
```

Then:

```bash
kibo gateway call health --url ws://127.0.0.1:18999 --timeout 3000
```
