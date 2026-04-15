---
summary: "CLI reference for `kibo voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `kibo voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
kibo voicecall status --call-id <id>
kibo voicecall call --to "+15555550123" --message "Hello" --mode notify
kibo voicecall continue --call-id <id> --message "Any questions?"
kibo voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
kibo voicecall expose --mode serve
kibo voicecall expose --mode funnel
kibo voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
