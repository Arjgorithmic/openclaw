---
summary: "Community-maintained Kibo plugins: browse, install, and submit your own"
read_when:
  - You want to find third-party Kibo plugins
  - You want to publish or list your own plugin
title: "Community Plugins"
---

# Community Plugins

Community plugins are third-party packages that extend Kibo with new
channels, tools, providers, or other capabilities. They are built and maintained
by the community, published on [KiboHub](/tools/kibohub) or npm, and
installable with a single command.

KiboHub is the canonical discovery surface for community plugins. Do not open
docs-only PRs just to add your plugin here for discoverability; publish it on
KiboHub instead.

```bash
kibo plugins install <package-name>
```

Kibo checks KiboHub first and falls back to npm automatically.

## Listed plugins

### Codex App Server Bridge

Independent Kibo bridge for Codex App Server conversations. Bind a chat to
a Codex thread, talk to it with plain text, and control it with chat-native
commands for resume, planning, review, model selection, compaction, and more.

- **npm:** `kibo-codex-app-server`
- **repo:** [github.com/pwrdrvr/kibo-codex-app-server](https://github.com/pwrdrvr/kibo-codex-app-server)

```bash
kibo plugins install kibo-codex-app-server
```

### DingTalk

Enterprise robot integration using Stream mode. Supports text, images, and
file messages via any DingTalk client.

- **npm:** `@largezhou/ddingtalk`
- **repo:** [github.com/largezhou/kibo-dingtalk](https://github.com/largezhou/kibo-dingtalk)

```bash
kibo plugins install @largezhou/ddingtalk
```

### Lossless Claw (LCM)

Lossless Context Management plugin for Kibo. DAG-based conversation
summarization with incremental compaction — preserves full context fidelity
while reducing token usage.

- **npm:** `@martian-engineering/lossless-claw`
- **repo:** [github.com/Martian-Engineering/lossless-claw](https://github.com/Martian-Engineering/lossless-claw)

```bash
kibo plugins install @martian-engineering/lossless-claw
```

### Opik

Official plugin that exports agent traces to Opik. Monitor agent behavior,
cost, tokens, errors, and more.

- **npm:** `@opik/opik-kibo`
- **repo:** [github.com/comet-ml/opik-kibo](https://github.com/comet-ml/opik-kibo)

```bash
kibo plugins install @opik/opik-kibo
```

### QQbot

Connect Kibo to QQ via the QQ Bot API. Supports private chats, group
mentions, channel messages, and rich media including voice, images, videos,
and files.

- **npm:** `@tencent-connect/kibo-qqbot`
- **repo:** [github.com/tencent-connect/kibo-qqbot](https://github.com/tencent-connect/kibo-qqbot)

```bash
kibo plugins install @tencent-connect/kibo-qqbot
```

### wecom

WeCom channel plugin for Kibo by the Tencent WeCom team. Powered by
WeCom Bot WebSocket persistent connections, it supports direct messages & group
chats, streaming replies, proactive messaging, image/file processing, Markdown
formatting, built-in access control, and document/meeting/messaging skills.

- **npm:** `@wecom/wecom-kibo-plugin`
- **repo:** [github.com/WecomTeam/wecom-kibo-plugin](https://github.com/WecomTeam/wecom-kibo-plugin)

```bash
kibo plugins install @wecom/wecom-kibo-plugin
```

## Submit your plugin

We welcome community plugins that are useful, documented, and safe to operate.

<Steps>
  <Step title="Publish to KiboHub or npm">
    Your plugin must be installable via `kibo plugins install \<package-name\>`.
    Publish to [KiboHub](/tools/kibohub) (preferred) or npm.
    See [Building Plugins](/plugins/building-plugins) for the full guide.

  </Step>

  <Step title="Host on GitHub">
    Source code must be in a public repository with setup docs and an issue
    tracker.

  </Step>

  <Step title="Use docs PRs only for source-doc changes">
    You do not need a docs PR just to make your plugin discoverable. Publish it
    on KiboHub instead.

    Open a docs PR only when Kibo's source docs need an actual content
    change, such as correcting install guidance or adding cross-repo
    documentation that belongs in the main docs set.

  </Step>
</Steps>

## Quality bar

| Requirement                 | Why                                           |
| --------------------------- | --------------------------------------------- |
| Published on KiboHub or npm | Users need `kibo plugins install` to work |
| Public GitHub repo          | Source review, issue tracking, transparency   |
| Setup and usage docs        | Users need to know how to configure it        |
| Active maintenance          | Recent updates or responsive issue handling   |

Low-effort wrappers, unclear ownership, or unmaintained packages may be declined.

## Related

- [Install and Configure Plugins](/tools/plugin) — how to install any plugin
- [Building Plugins](/plugins/building-plugins) — create your own
- [Plugin Manifest](/plugins/manifest) — manifest schema
