# 🍌 Kibo — Personal AI Assistant

<p align="center">
  <strong>EXFOLIATE! EXFOLIATE!</strong>
</p>

<p align="center">
  <a href="https://github.com/Arjgorithmic/openclaw/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/Arjgorithmic/openclaw/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/Arjgorithmic/openclaw/releases"><img src="https://img.shields.io/github/v/release/Arjgorithmic/openclaw?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**Kibo** is a _personal AI assistant_ you run on your own devices.
It answers you on the channels you already use (WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, BlueBubbles, IRC, Microsoft Teams, Matrix, Feishu, LINE, Mattermost, Nextcloud Talk, Nostr, Synology Chat, Tlon, Twitch, Zalo, Zalo Personal, WeChat, WebChat). It can speak and listen on macOS/iOS/Android, and can render a live Canvas you control. The Gateway is just the control plane — the product is the assistant.

If you want a personal, single-user assistant that feels local, fast, and always-on, this is it.

[GitHub](https://github.com/Arjgorithmic) · [Vision](VISION.md) · [Email](mailto:arjunpdineshofficial@gamil.com)

Preferred setup: run `kibo onboard` in your terminal.
Kibo Onboard guides you step by step through setting up the gateway, workspace, channels, and skills. It is the recommended CLI setup path and works on **macOS, Linux, and Windows (via WSL2; strongly recommended)**.
Works with npm, pnpm, or bun.
New install? Start here: [Getting started](https://github.com/Arjgorithmic/openclaw/start/getting-started)


**Subscriptions (OAuth):**

- **[OpenAI](https://openai.com/)** (ChatGPT/Codex)

Model note: while many providers and models are supported, prefer a current flagship model from the provider you trust and already use. See [Onboarding](https://github.com/Arjgorithmic/openclaw/start/onboarding).

## Models (selection + auth)

- Models config + CLI: [Models](https://github.com/Arjgorithmic/openclaw/concepts/models)
- Auth profile rotation (OAuth vs API keys) + fallbacks: [Model failover](https://github.com/Arjgorithmic/openclaw/concepts/model-failover)

## Install (recommended)

Runtime: **Node 24 (recommended) or Node 22.16+**.

```bash
npm install -g kibo@latest
# or: pnpm add -g kibo@latest

kibo onboard --install-daemon
```

Kibo Onboard installs the Gateway daemon (launchd/systemd user service) so it stays running.

## Quick start (TL;DR)

Runtime: **Node 24 (recommended) or Node 22.16+**.

Full beginner guide (auth, pairing, channels): [Getting started](https://github.com/Arjgorithmic/openclaw/start/getting-started)

```bash
kibo onboard --install-daemon

kibo gateway --port 18789 --verbose

# Send a message
kibo message send --to +1234567890 --message "Hello from Kibo"

# Talk to the assistant (optionally deliver back to any connected channel: WhatsApp/Telegram/Slack/Discord/Google Chat/Signal/iMessage/BlueBubbles/IRC/Microsoft Teams/Matrix/Feishu/LINE/Mattermost/Nextcloud Talk/Nostr/Synology Chat/Tlon/Twitch/Zalo/Zalo Personal/WeChat/WebChat)
kibo agent --message "Ship checklist" --thinking high
```

Upgrading? [Updating guide](https://github.com/Arjgorithmic/openclaw/install/updating) (and run `kibo doctor`).

## Development channels

- **stable**: tagged releases (`vYYYY.M.D` or `vYYYY.M.D-<patch>`), npm dist-tag `latest`.
- **beta**: prerelease tags (`vYYYY.M.D-beta.N`), npm dist-tag `beta` (macOS app may be missing).
- **dev**: moving head of `main`, npm dist-tag `dev` (when published).

Switch channels (git + npm): `kibo update --channel stable|beta|dev`.
Details: [Development channels](https://github.com/Arjgorithmic/openclaw/install/development-channels).

## From source (development)

Prefer `pnpm` for builds from source. Bun is optional for running TypeScript directly.

```bash
git clone https://github.com/kibo/kibo.git
cd kibo

pnpm install
pnpm ui:build # auto-installs UI deps on first run
pnpm build

pnpm kibo onboard --install-daemon

# Dev loop (auto-reload on source/config changes)
pnpm gateway:watch
```

Note: `pnpm kibo ...` runs TypeScript directly (via `tsx`). `pnpm build` produces `dist/` for running via Node / the packaged `kibo` binary.

## Security defaults (DM access)

Kibo connects to real messaging surfaces. Treat inbound DMs as **untrusted input**.

Full security guide: [Security](https://github.com/Arjgorithmic/openclaw/gateway/security)

Default behavior on Telegram/WhatsApp/Signal/iMessage/Microsoft Teams/Discord/Google Chat/Slack:

- **DM pairing** (`dmPolicy="pairing"` / `channels.discord.dmPolicy="pairing"` / `channels.slack.dmPolicy="pairing"`; legacy: `channels.discord.dm.policy`, `channels.slack.dm.policy`): unknown senders receive a short pairing code and the bot does not process their message.
- Approve with: `kibo pairing approve <channel> <code>` (then the sender is added to a local allowlist store).
- Public inbound DMs require an explicit opt-in: set `dmPolicy="open"` and include `"*"` in the channel allowlist (`allowFrom` / `channels.discord.allowFrom` / `channels.slack.allowFrom`; legacy: `channels.discord.dm.allowFrom`, `channels.slack.dm.allowFrom`).

Run `kibo doctor` to surface risky/misconfigured DM policies.

## Highlights

- **[Local-first Gateway](https://github.com/Arjgorithmic/openclaw/gateway)** — single control plane for sessions, channels, tools, and events.
- **[Multi-channel inbox](https://github.com/Arjgorithmic/openclaw/channels)** — WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, BlueBubbles (iMessage), iMessage (legacy), IRC, Microsoft Teams, Matrix, Feishu, LINE, Mattermost, Nextcloud Talk, Nostr, Synology Chat, Tlon, Twitch, Zalo, Zalo Personal, WeChat, WebChat, macOS, iOS/Android.
- **[Multi-agent routing](https://github.com/Arjgorithmic/openclaw/gateway/configuration)** — route inbound channels/accounts/peers to isolated agents (workspaces + per-agent sessions).
- **[Voice Wake](https://github.com/Arjgorithmic/openclaw/nodes/voicewake) + [Talk Mode](https://github.com/Arjgorithmic/openclaw/nodes/talk)** — wake words on macOS/iOS and continuous voice on Android (ElevenLabs + system TTS fallback).
- **[Live Canvas](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas)** — agent-driven visual workspace with [A2UI](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas#canvas-a2ui).
- **[First-class tools](https://github.com/Arjgorithmic/openclaw/tools)** — browser, canvas, nodes, cron, sessions, and Discord/Slack actions.
- **[Companion apps](https://github.com/Arjgorithmic/openclaw/platforms/macos)** — macOS menu bar app + iOS/Android [nodes](https://github.com/Arjgorithmic/openclaw/nodes).
- **[Onboarding](https://github.com/Arjgorithmic/openclaw/start/wizard) + [skills](https://github.com/Arjgorithmic/openclaw/tools/skills)** — onboarding-driven setup with bundled/managed/workspace skills.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=kibo/kibo&type=date&legend=top-left)](https://www.star-history.com/#kibo/kibo&type=date&legend=top-left)

## Everything we built so far

### Core platform

- [Gateway WS control plane](https://github.com/Arjgorithmic/openclaw/gateway) with sessions, presence, config, cron, webhooks, [Control UI](https://github.com/Arjgorithmic/openclaw/web), and [Canvas host](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas#canvas-a2ui).
- [CLI surface](https://github.com/Arjgorithmic/openclaw/tools/agent-send): gateway, agent, send, [onboarding](https://github.com/Arjgorithmic/openclaw/start/wizard), and [doctor](https://github.com/Arjgorithmic/openclaw/gateway/doctor).
- [Pi agent runtime](https://github.com/Arjgorithmic/openclaw/concepts/agent) in RPC mode with tool streaming and block streaming.
- [Session model](https://github.com/Arjgorithmic/openclaw/concepts/session): `main` for direct chats, group isolation, activation modes, queue modes, reply-back. Group rules: [Groups](https://github.com/Arjgorithmic/openclaw/channels/groups).
- [Media pipeline](https://github.com/Arjgorithmic/openclaw/nodes/images): images/audio/video, transcription hooks, size caps, temp file lifecycle. Audio details: [Audio](https://github.com/Arjgorithmic/openclaw/nodes/audio).

### Channels

- [Channels](https://github.com/Arjgorithmic/openclaw/channels): [WhatsApp](https://github.com/Arjgorithmic/openclaw/channels/whatsapp) (Baileys), [Telegram](https://github.com/Arjgorithmic/openclaw/channels/telegram) (grammY), [Slack](https://github.com/Arjgorithmic/openclaw/channels/slack) (Bolt), [Discord](https://github.com/Arjgorithmic/openclaw/channels/discord) (discord.js), [Google Chat](https://github.com/Arjgorithmic/openclaw/channels/googlechat) (Chat API), [Signal](https://github.com/Arjgorithmic/openclaw/channels/signal) (signal-cli), [BlueBubbles](https://github.com/Arjgorithmic/openclaw/channels/bluebubbles) (iMessage, recommended), [iMessage](https://github.com/Arjgorithmic/openclaw/channels/imessage) (legacy imsg), [IRC](https://github.com/Arjgorithmic/openclaw/channels/irc), [Microsoft Teams](https://github.com/Arjgorithmic/openclaw/channels/msteams), [Matrix](https://github.com/Arjgorithmic/openclaw/channels/matrix), [Feishu](https://github.com/Arjgorithmic/openclaw/channels/feishu), [LINE](https://github.com/Arjgorithmic/openclaw/channels/line), [Mattermost](https://github.com/Arjgorithmic/openclaw/channels/mattermost), [Nextcloud Talk](https://github.com/Arjgorithmic/openclaw/channels/nextcloud-talk), [Nostr](https://github.com/Arjgorithmic/openclaw/channels/nostr), [Synology Chat](https://github.com/Arjgorithmic/openclaw/channels/synology-chat), [Tlon](https://github.com/Arjgorithmic/openclaw/channels/tlon), [Twitch](https://github.com/Arjgorithmic/openclaw/channels/twitch), [Zalo](https://github.com/Arjgorithmic/openclaw/channels/zalo), [Zalo Personal](https://github.com/Arjgorithmic/openclaw/channels/zalouser), WeChat (`@tencent-weixin/kibo-weixin`), [WebChat](https://github.com/Arjgorithmic/openclaw/web/webchat).
- [Group routing](https://github.com/Arjgorithmic/openclaw/channels/group-messages): mention gating, reply tags, per-channel chunking and routing. Channel rules: [Channels](https://github.com/Arjgorithmic/openclaw/channels).

### Apps + nodes

- [macOS app](https://github.com/Arjgorithmic/openclaw/platforms/macos): menu bar control plane, [Voice Wake](https://github.com/Arjgorithmic/openclaw/nodes/voicewake)/PTT, [Talk Mode](https://github.com/Arjgorithmic/openclaw/nodes/talk) overlay, [WebChat](https://github.com/Arjgorithmic/openclaw/web/webchat), debug tools, [remote gateway](https://github.com/Arjgorithmic/openclaw/gateway/remote) control.
- [iOS node](https://github.com/Arjgorithmic/openclaw/platforms/ios): [Canvas](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas), [Voice Wake](https://github.com/Arjgorithmic/openclaw/nodes/voicewake), [Talk Mode](https://github.com/Arjgorithmic/openclaw/nodes/talk), camera, screen recording, Bonjour + device pairing.
- [Android node](https://github.com/Arjgorithmic/openclaw/platforms/android): Connect tab (setup code/manual), chat sessions, voice tab, [Canvas](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas), camera/screen recording, and Android device commands (notifications/location/SMS/photos/contacts/calendar/motion/app update).
- [macOS node mode](https://github.com/Arjgorithmic/openclaw/nodes): system.run/notify + canvas/camera exposure.

### Tools + automation

- [Browser control](https://github.com/Arjgorithmic/openclaw/tools/browser): dedicated kibo Chrome/Chromium, snapshots, actions, uploads, profiles.
- [Canvas](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas): [A2UI](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas#canvas-a2ui) push/reset, eval, snapshot.
- [Nodes](https://github.com/Arjgorithmic/openclaw/nodes): camera snap/clip, screen record, [location.get](https://github.com/Arjgorithmic/openclaw/nodes/location-command), notifications.
- [Cron + wakeups](https://github.com/Arjgorithmic/openclaw/automation/cron-jobs); [webhooks](https://github.com/Arjgorithmic/openclaw/automation/webhook); [Gmail Pub/Sub](https://github.com/Arjgorithmic/openclaw/automation/gmail-pubsub).
- [Skills platform](https://github.com/Arjgorithmic/openclaw/tools/skills): bundled, managed, and workspace skills with install gating + UI.

### Runtime + safety

- [Channel routing](https://github.com/Arjgorithmic/openclaw/channels/channel-routing), [retry policy](https://github.com/Arjgorithmic/openclaw/concepts/retry), and [streaming/chunking](https://github.com/Arjgorithmic/openclaw/concepts/streaming).
- [Presence](https://github.com/Arjgorithmic/openclaw/concepts/presence), [typing indicators](https://github.com/Arjgorithmic/openclaw/concepts/typing-indicators), and [usage tracking](https://github.com/Arjgorithmic/openclaw/concepts/usage-tracking).
- [Models](https://github.com/Arjgorithmic/openclaw/concepts/models), [model failover](https://github.com/Arjgorithmic/openclaw/concepts/model-failover), and [session pruning](https://github.com/Arjgorithmic/openclaw/concepts/session-pruning).
- [Security](https://github.com/Arjgorithmic/openclaw/gateway/security) and [troubleshooting](https://github.com/Arjgorithmic/openclaw/channels/troubleshooting).

### Ops + packaging

- [Control UI](https://github.com/Arjgorithmic/openclaw/web) + [WebChat](https://github.com/Arjgorithmic/openclaw/web/webchat) served directly from the Gateway.
- [Tailscale Serve/Funnel](https://github.com/Arjgorithmic/openclaw/gateway/tailscale) or [SSH tunnels](https://github.com/Arjgorithmic/openclaw/gateway/remote) with token/password auth.
- [Nix mode](https://github.com/Arjgorithmic/openclaw/install/nix) for declarative config; [Docker](https://github.com/Arjgorithmic/openclaw/install/docker)-based installs.
- [Doctor](https://github.com/Arjgorithmic/openclaw/gateway/doctor) migrations, [logging](https://github.com/Arjgorithmic/openclaw/logging).

## How it works (short)

```
WhatsApp / Telegram / Slack / Discord / Google Chat / Signal / iMessage / BlueBubbles / IRC / Microsoft Teams / Matrix / Feishu / LINE / Mattermost / Nextcloud Talk / Nostr / Synology Chat / Tlon / Twitch / Zalo / Zalo Personal / WeChat / WebChat
               │
               ▼
┌───────────────────────────────┐
│            Gateway            │
│       (control plane)         │
│     ws://127.0.0.1:18789      │
└──────────────┬────────────────┘
               │
               ├─ Pi agent (RPC)
               ├─ CLI (kibo …)
               ├─ WebChat UI
               ├─ macOS app
               └─ iOS / Android nodes
```

## Key subsystems

- **[Gateway WebSocket network](https://github.com/Arjgorithmic/openclaw/concepts/architecture)** — single WS control plane for clients, tools, and events (plus ops: [Gateway runbook](https://github.com/Arjgorithmic/openclaw/gateway)).
- **[Tailscale exposure](https://github.com/Arjgorithmic/openclaw/gateway/tailscale)** — Serve/Funnel for the Gateway dashboard + WS (remote access: [Remote](https://github.com/Arjgorithmic/openclaw/gateway/remote)).
- **[Browser control](https://github.com/Arjgorithmic/openclaw/tools/browser)** — kibo‑managed Chrome/Chromium with CDP control.
- **[Canvas + A2UI](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas)** — agent‑driven visual workspace (A2UI host: [Canvas/A2UI](https://github.com/Arjgorithmic/openclaw/platforms/mac/canvas#canvas-a2ui)).
- **[Voice Wake](https://github.com/Arjgorithmic/openclaw/nodes/voicewake) + [Talk Mode](https://github.com/Arjgorithmic/openclaw/nodes/talk)** — wake words on macOS/iOS plus continuous voice on Android.
- **[Nodes](https://github.com/Arjgorithmic/openclaw/nodes)** — Canvas, camera snap/clip, screen record, `location.get`, notifications, plus macOS‑only `system.run`/`system.notify`.

## Tailscale access (Gateway dashboard)

Kibo can auto-configure Tailscale **Serve** (tailnet-only) or **Funnel** (public) while the Gateway stays bound to loopback. Configure `gateway.tailscale.mode`:

- `off`: no Tailscale automation (default).
- `serve`: tailnet-only HTTPS via `tailscale serve` (uses Tailscale identity headers by default).
- `funnel`: public HTTPS via `tailscale funnel` (requires shared password auth).

Notes:

- `gateway.bind` must stay `loopback` when Serve/Funnel is enabled (Kibo enforces this).
- Serve can be forced to require a password by setting `gateway.auth.mode: "password"` or `gateway.auth.allowTailscale: false`.
- Funnel refuses to start unless `gateway.auth.mode: "password"` is set.
- Optional: `gateway.tailscale.resetOnExit` to undo Serve/Funnel on shutdown.

Details: [Tailscale guide](https://github.com/Arjgorithmic/openclaw/gateway/tailscale) · [Web surfaces](https://github.com/Arjgorithmic/openclaw/web)

## Remote Gateway (Linux is great)

It’s perfectly fine to run the Gateway on a small Linux instance. Clients (macOS app, CLI, WebChat) can connect over **Tailscale Serve/Funnel** or **SSH tunnels**, and you can still pair device nodes (macOS/iOS/Android) to execute device‑local actions when needed.

- **Gateway host** runs the exec tool and channel connections by default.
- **Device nodes** run device‑local actions (`system.run`, camera, screen recording, notifications) via `node.invoke`.
  In short: exec runs where the Gateway lives; device actions run where the device lives.

Details: [Remote access](https://github.com/Arjgorithmic/openclaw/gateway/remote) · [Nodes](https://github.com/Arjgorithmic/openclaw/nodes) · [Security](https://github.com/Arjgorithmic/openclaw/gateway/security)

## macOS permissions via the Gateway protocol

The macOS app can run in **node mode** and advertises its capabilities + permission map over the Gateway WebSocket (`node.list` / `node.describe`). Clients can then execute local actions via `node.invoke`:

- `system.run` runs a local command and returns stdout/stderr/exit code; set `needsScreenRecording: true` to require screen-recording permission (otherwise you’ll get `PERMISSION_MISSING`).
- `system.notify` posts a user notification and fails if notifications are denied.
- `canvas.*`, `camera.*`, `screen.record`, and `location.get` are also routed via `node.invoke` and follow TCC permission status.

Elevated bash (host permissions) is separate from macOS TCC:

- Use `/elevated on|off` to toggle per‑session elevated access when enabled + allowlisted.
- Gateway persists the per‑session toggle via `sessions.patch` (WS method) alongside `thinkingLevel`, `verboseLevel`, `model`, `sendPolicy`, and `groupActivation`.

Details: [Nodes](https://github.com/Arjgorithmic/openclaw/nodes) · [macOS app](https://github.com/Arjgorithmic/openclaw/platforms/macos) · [Gateway protocol](https://github.com/Arjgorithmic/openclaw/concepts/architecture)

## Agent to Agent (sessions\_\* tools)

- Use these to coordinate work across sessions without jumping between chat surfaces.
- `sessions_list` — discover active sessions (agents) and their metadata.
- `sessions_history` — fetch transcript logs for a session.
- `sessions_send` — message another session; optional reply‑back ping‑pong + announce step (`REPLY_SKIP`, `ANNOUNCE_SKIP`).

Details: [Session tools](https://github.com/Arjgorithmic/openclaw/concepts/session-tool)

## Skills registry (KiboHub)

KiboHub is a minimal skill registry. With KiboHub enabled, the agent can search for skills automatically and pull in new ones as needed.

[KiboHub](https://kibohub.com)

## Chat commands

Send these in WhatsApp/Telegram/Slack/Google Chat/Microsoft Teams/WebChat (group commands are owner-only):

- `/status` — compact session status (model + tokens, cost when available)
- `/new` or `/reset` — reset the session
- `/compact` — compact session context (summary)
- `/think <level>` — off|minimal|low|medium|high|xhigh (GPT-5.2 + Codex models only)
- `/verbose on|off`
- `/usage off|tokens|full` — per-response usage footer
- `/restart` — restart the gateway (owner-only in groups)
- `/activation mention|always` — group activation toggle (groups only)

## Apps (optional)

The Gateway alone delivers a great experience. All apps are optional and add extra features.

If you plan to build/run companion apps, follow the platform runbooks below.

### macOS (Kibo.app) (optional)

- Menu bar control for the Gateway and health.
- Voice Wake + push-to-talk overlay.
- WebChat + debug tools.
- Remote gateway control over SSH.

Note: signed builds required for macOS permissions to stick across rebuilds (see [macOS Permissions](https://github.com/Arjgorithmic/openclaw/platforms/mac/permissions)).

### iOS node (optional)

- Pairs as a node over the Gateway WebSocket (device pairing).
- Voice trigger forwarding + Canvas surface.
- Controlled via `kibo nodes …`.

Runbook: [iOS connect](https://github.com/Arjgorithmic/openclaw/platforms/ios).

### Android node (optional)

- Pairs as a WS node via device pairing (`kibo devices ...`).
- Exposes Connect/Chat/Voice tabs plus Canvas, Camera, Screen capture, and Android device command families.
- Runbook: [Android connect](https://github.com/Arjgorithmic/openclaw/platforms/android).

## Agent workspace + skills

- Workspace root: `~/.kibo/workspace` (configurable via `agents.defaults.workspace`).
- Injected prompt files: `AGENTS.md`, `SOUL.md`, `TOOLS.md`.
- Skills: `~/.kibo/workspace/skills/<skill>/SKILL.md`.

## Configuration

Minimal `~/.kibo/kibo.json` (model + defaults):

```json5
{
  agent: {
    model: "<provider>/<model-id>",
  },
}
```

[Full configuration reference (all keys + examples).](https://github.com/Arjgorithmic/openclaw/gateway/configuration)

## Security model (important)

- **Default:** tools run on the host for the **main** session, so the agent has full access when it’s just you.
- **Group/channel safety:** set `agents.defaults.sandbox.mode: "non-main"` to run **non‑main sessions** (groups/channels) inside per‑session Docker sandboxes; bash then runs in Docker for those sessions.
- **Sandbox defaults:** allowlist `bash`, `process`, `read`, `write`, `edit`, `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`; denylist `browser`, `canvas`, `nodes`, `cron`, `discord`, `gateway`.

Details: [Security guide](https://github.com/Arjgorithmic/openclaw/gateway/security) · [Docker + sandboxing](https://github.com/Arjgorithmic/openclaw/install/docker) · [Sandbox config](https://github.com/Arjgorithmic/openclaw/gateway/configuration)

### [WhatsApp](https://github.com/Arjgorithmic/openclaw/channels/whatsapp)

- Link the device: `pnpm kibo channels login` (stores creds in `~/.kibo/credentials`).
- Allowlist who can talk to the assistant via `channels.whatsapp.allowFrom`.
- If `channels.whatsapp.groups` is set, it becomes a group allowlist; include `"*"` to allow all.

### [Telegram](https://github.com/Arjgorithmic/openclaw/channels/telegram)

- Set `TELEGRAM_BOT_TOKEN` or `channels.telegram.botToken` (env wins).
- Optional: set `channels.telegram.groups` (with `channels.telegram.groups."*".requireMention`); when set, it is a group allowlist (include `"*"` to allow all). Also `channels.telegram.allowFrom` or `channels.telegram.webhookUrl` + `channels.telegram.webhookSecret` as needed.

```json5
{
  channels: {
    telegram: {
      botToken: "123456:ABCDEF",
    },
  },
}
```

### [Slack](https://github.com/Arjgorithmic/openclaw/channels/slack)

- Set `SLACK_BOT_TOKEN` + `SLACK_APP_TOKEN` (or `channels.slack.botToken` + `channels.slack.appToken`).

### [Discord](https://github.com/Arjgorithmic/openclaw/channels/discord)

- Set `DISCORD_BOT_TOKEN` or `channels.discord.token`.
- Optional: set `commands.native`, `commands.text`, or `commands.useAccessGroups`, plus `channels.discord.allowFrom`, `channels.discord.guilds`, or `channels.discord.mediaMaxMb` as needed.

```json5
{
  channels: {
    discord: {
      token: "1234abcd",
    },
  },
}
```

### [Signal](https://github.com/Arjgorithmic/openclaw/channels/signal)

- Requires `signal-cli` and a `channels.signal` config section.

### [BlueBubbles (iMessage)](https://github.com/Arjgorithmic/openclaw/channels/bluebubbles)

- **Recommended** iMessage integration.
- Configure `channels.bluebubbles.serverUrl` + `channels.bluebubbles.password` and a webhook (`channels.bluebubbles.webhookPath`).
- The BlueBubbles server runs on macOS; the Gateway can run on macOS or elsewhere.

### [iMessage (legacy)](https://github.com/Arjgorithmic/openclaw/channels/imessage)

- Legacy macOS-only integration via `imsg` (Messages must be signed in).
- If `channels.imessage.groups` is set, it becomes a group allowlist; include `"*"` to allow all.

### [Microsoft Teams](https://github.com/Arjgorithmic/openclaw/channels/msteams)

- Configure a Teams app + Bot Framework, then add a `msteams` config section.
- Allowlist who can talk via `msteams.allowFrom`; group access via `msteams.groupAllowFrom` or `msteams.groupPolicy: "open"`.

### WeChat

- Official Tencent plugin via [`@tencent-weixin/kibo-weixin`](https://www.npmjs.com/package/@tencent-weixin/kibo-weixin) (iLink Bot API). Private chats only; v2.x requires Kibo `>=2026.3.22`.
- Install: `kibo plugins install "@tencent-weixin/kibo-weixin"`, then `kibo channels login --channel kibo-weixin` to scan the QR code.
- Requires the WeChat ClawBot plugin (WeChat > Me > Settings > Plugins); gradual rollout by Tencent.

### [WebChat](https://github.com/Arjgorithmic/openclaw/web/webchat)

- Uses the Gateway WebSocket; no separate WebChat port/config.

Browser control (optional):

```json5
{
  browser: {
    enabled: true,
    color: "#FF4500",
  },
}
```

## Docs

Use these when you’re past the onboarding flow and want the deeper reference.

- [Start with the docs index for navigation and “what’s where.”](https://github.com/Arjgorithmic/openclaw)
- [Read the architecture overview for the gateway + protocol model.](https://github.com/Arjgorithmic/openclaw/concepts/architecture)
- [Use the full configuration reference when you need every key and example.](https://github.com/Arjgorithmic/openclaw/gateway/configuration)
- [Run the Gateway by the book with the operational runbook.](https://github.com/Arjgorithmic/openclaw/gateway)
- [Learn how the Control UI/Web surfaces work and how to expose them safely.](https://github.com/Arjgorithmic/openclaw/web)
- [Understand remote access over SSH tunnels or tailnets.](https://github.com/Arjgorithmic/openclaw/gateway/remote)
- [Follow Kibo Onboard for a guided setup.](https://github.com/Arjgorithmic/openclaw/start/wizard)
- [Wire external triggers via the webhook surface.](https://github.com/Arjgorithmic/openclaw/automation/webhook)
- [Set up Gmail Pub/Sub triggers.](https://github.com/Arjgorithmic/openclaw/automation/gmail-pubsub)
- [Learn the macOS menu bar companion details.](https://github.com/Arjgorithmic/openclaw/platforms/mac/menu-bar)
- [Platform guides: Windows (WSL2)](https://github.com/Arjgorithmic/openclaw/platforms/windows), [Linux](https://github.com/Arjgorithmic/openclaw/platforms/linux), [macOS](https://github.com/Arjgorithmic/openclaw/platforms/macos), [iOS](https://github.com/Arjgorithmic/openclaw/platforms/ios), [Android](https://github.com/Arjgorithmic/openclaw/platforms/android)
- [Debug common failures with the troubleshooting guide.](https://github.com/Arjgorithmic/openclaw/channels/troubleshooting)
- [Review security guidance before exposing anything.](https://github.com/Arjgorithmic/openclaw/gateway/security)

## Advanced docs (discovery + control)

- [Discovery + transports](https://github.com/Arjgorithmic/openclaw/gateway/discovery)
- [Bonjour/mDNS](https://github.com/Arjgorithmic/openclaw/gateway/bonjour)
- [Gateway pairing](https://github.com/Arjgorithmic/openclaw/gateway/pairing)
- [Remote gateway README](https://github.com/Arjgorithmic/openclaw/gateway/remote-gateway-readme)
- [Control UI](https://github.com/Arjgorithmic/openclaw/web/control-ui)
- [Dashboard](https://github.com/Arjgorithmic/openclaw/web/dashboard)

## Operations & troubleshooting

- [Health checks](https://github.com/Arjgorithmic/openclaw/gateway/health)
- [Gateway lock](https://github.com/Arjgorithmic/openclaw/gateway/gateway-lock)
- [Background process](https://github.com/Arjgorithmic/openclaw/gateway/background-process)
- [Browser troubleshooting (Linux)](https://github.com/Arjgorithmic/openclaw/tools/browser-linux-troubleshooting)
- [Logging](https://github.com/Arjgorithmic/openclaw/logging)

## Deep dives

- [Agent loop](https://github.com/Arjgorithmic/openclaw/concepts/agent-loop)
- [Presence](https://github.com/Arjgorithmic/openclaw/concepts/presence)
- [TypeBox schemas](https://github.com/Arjgorithmic/openclaw/concepts/typebox)
- [RPC adapters](https://github.com/Arjgorithmic/openclaw/reference/rpc)
- [Queue](https://github.com/Arjgorithmic/openclaw/concepts/queue)

## Workspace & skills

- [Skills config](https://github.com/Arjgorithmic/openclaw/tools/skills-config)
- [Default AGENTS](https://github.com/Arjgorithmic/openclaw/reference/AGENTS.default)
- [Templates: AGENTS](https://github.com/Arjgorithmic/openclaw/reference/templates/AGENTS)
- [Templates: BOOTSTRAP](https://github.com/Arjgorithmic/openclaw/reference/templates/BOOTSTRAP)
- [Templates: IDENTITY](https://github.com/Arjgorithmic/openclaw/reference/templates/IDENTITY)
- [Templates: SOUL](https://github.com/Arjgorithmic/openclaw/reference/templates/SOUL)
- [Templates: TOOLS](https://github.com/Arjgorithmic/openclaw/reference/templates/TOOLS)
- [Templates: USER](https://github.com/Arjgorithmic/openclaw/reference/templates/USER)

## Platform internals

- [macOS dev setup](https://github.com/Arjgorithmic/openclaw/platforms/mac/dev-setup)
- [macOS menu bar](https://github.com/Arjgorithmic/openclaw/platforms/mac/menu-bar)
- [macOS voice wake](https://github.com/Arjgorithmic/openclaw/platforms/mac/voicewake)
- [iOS node](https://github.com/Arjgorithmic/openclaw/platforms/ios)
- [Android node](https://github.com/Arjgorithmic/openclaw/platforms/android)
- [Windows (WSL2)](https://github.com/Arjgorithmic/openclaw/platforms/windows)
- [Linux app](https://github.com/Arjgorithmic/openclaw/platforms/linux)

## Email hooks (Gmail)

- [docs.kibo.ai/gmail-pubsub](https://github.com/Arjgorithmic/openclaw/automation/gmail-pubsub)

## Kibo

Kibo is your personal AI assistant. 🍌
- [kibo.ai](https://github.com/Arjgorithmic/openclaw)
- [soul.md](https://soul.md)
- [@kibo](https://x.com/kibo)

## Community

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
