---
summary: "Infer-first CLI for provider-backed model, image, audio, TTS, video, web, and embedding workflows"
read_when:
  - Adding or modifying `kibo infer` commands
  - Designing stable headless capability automation
title: "Inference CLI"
---

# Inference CLI

`kibo infer` is the canonical headless surface for provider-backed inference workflows.

It intentionally exposes capability families, not raw gateway RPC names and not raw agent tool ids.

## Turn infer into a skill

Copy and paste this to an agent:

```text
Read https://github.com/Arjgorithmic/openclaw/cli/infer, then create a skill that routes my common workflows to `kibo infer`.
Focus on model runs, image generation, video generation, audio transcription, TTS, web search, and embeddings.
```

A good infer-based skill should:

- map common user intents to the correct infer subcommand
- include a few canonical infer examples for the workflows it covers
- prefer `kibo infer ...` in examples and suggestions
- avoid re-documenting the entire infer surface inside the skill body

Typical infer-focused skill coverage:

- `kibo infer model run`
- `kibo infer image generate`
- `kibo infer audio transcribe`
- `kibo infer tts convert`
- `kibo infer web search`
- `kibo infer embedding create`

## Why use infer

`kibo infer` provides one consistent CLI for provider-backed inference tasks inside Kibo.

Benefits:

- Use the providers and models already configured in Kibo instead of wiring up one-off wrappers for each backend.
- Keep model, image, audio transcription, TTS, video, web, and embedding workflows under one command tree.
- Use a stable `--json` output shape for scripts, automation, and agent-driven workflows.
- Prefer a first-party Kibo surface when the task is fundamentally "run inference."
- Use the normal local path without requiring the gateway for most infer commands.

## Command tree

```text
 kibo infer
  list
  inspect

  model
    run
    list
    inspect
    providers
    auth login
    auth logout
    auth status

  image
    generate
    edit
    describe
    describe-many
    providers

  audio
    transcribe
    providers

  tts
    convert
    voices
    providers
    status
    enable
    disable
    set-provider

  video
    generate
    describe
    providers

  web
    search
    fetch
    providers

  embedding
    create
    providers
```

## Common tasks

This table maps common inference tasks to the corresponding infer command.

| Task                    | Command                                                                | Notes                                                |
| ----------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| Run a text/model prompt | `kibo infer model run --prompt "..." --json`                       | Uses the normal local path by default                |
| Generate an image       | `kibo infer image generate --prompt "..." --json`                  | Use `image edit` when starting from an existing file |
| Describe an image file  | `kibo infer image describe --file ./image.png --json`              | `--model` must be `<provider/model>`                 |
| Transcribe audio        | `kibo infer audio transcribe --file ./memo.m4a --json`             | `--model` must be `<provider/model>`                 |
| Synthesize speech       | `kibo infer tts convert --text "..." --output ./speech.mp3 --json` | `tts status` is gateway-oriented                     |
| Generate a video        | `kibo infer video generate --prompt "..." --json`                  |                                                      |
| Describe a video file   | `kibo infer video describe --file ./clip.mp4 --json`               | `--model` must be `<provider/model>`                 |
| Search the web          | `kibo infer web search --query "..." --json`                       |                                                      |
| Fetch a web page        | `kibo infer web fetch --url https://example.com --json`            |                                                      |
| Create embeddings       | `kibo infer embedding create --text "..." --json`                  |                                                      |

## Behavior

- `kibo infer ...` is the primary CLI surface for these workflows.
- Use `--json` when the output will be consumed by another command or script.
- Use `--provider` or `--model provider/model` when a specific backend is required.
- For `image describe`, `audio transcribe`, and `video describe`, `--model` must use the form `<provider/model>`.
- Stateless execution commands default to local.
- Gateway-managed state commands default to gateway.
- The normal local path does not require the gateway to be running.

## Model

Use `model` for provider-backed text inference and model/provider inspection.

```bash
kibo infer model run --prompt "Reply with exactly: smoke-ok" --json
kibo infer model run --prompt "Summarize this changelog entry" --provider openai --json
kibo infer model providers --json
kibo infer model inspect --name gpt-5.4 --json
```

Notes:

- `model run` reuses the agent runtime so provider/model overrides behave like normal agent execution.
- `model auth login`, `model auth logout`, and `model auth status` manage saved provider auth state.

## Image

Use `image` for generation, edit, and description.

```bash
kibo infer image generate --prompt "friendly shell illustration" --json
kibo infer image generate --prompt "cinematic product photo of headphones" --json
kibo infer image describe --file ./photo.jpg --json
kibo infer image describe --file ./ui-screenshot.png --model openai/gpt-4.1-mini --json
```

Notes:

- Use `image edit` when starting from existing input files.
- For `image describe`, `--model` must be `<provider/model>`.

## Audio

Use `audio` for file transcription.

```bash
kibo infer audio transcribe --file ./memo.m4a --json
kibo infer audio transcribe --file ./team-sync.m4a --language en --prompt "Focus on names and action items" --json
kibo infer audio transcribe --file ./memo.m4a --model openai/whisper-1 --json
```

Notes:

- `audio transcribe` is for file transcription, not realtime session management.
- `--model` must be `<provider/model>`.

## TTS

Use `tts` for speech synthesis and TTS provider state.

```bash
kibo infer tts convert --text "hello from kibo" --output ./hello.mp3 --json
kibo infer tts convert --text "Your build is complete" --output ./build-complete.mp3 --json
kibo infer tts providers --json
kibo infer tts status --json
```

Notes:

- `tts status` defaults to gateway because it reflects gateway-managed TTS state.
- Use `tts providers`, `tts voices`, and `tts set-provider` to inspect and configure TTS behavior.

## Video

Use `video` for generation and description.

```bash
kibo infer video generate --prompt "cinematic sunset over the ocean" --json
kibo infer video generate --prompt "slow drone shot over a forest lake" --json
kibo infer video describe --file ./clip.mp4 --json
kibo infer video describe --file ./clip.mp4 --model openai/gpt-4.1-mini --json
```

Notes:

- `--model` must be `<provider/model>` for `video describe`.

## Web

Use `web` for search and fetch workflows.

```bash
kibo infer web search --query "Kibo docs" --json
kibo infer web search --query "Kibo infer web providers" --json
kibo infer web fetch --url https://github.com/Arjgorithmic/openclaw/cli/infer --json
kibo infer web providers --json
```

Notes:

- Use `web providers` to inspect available, configured, and selected providers.

## Embedding

Use `embedding` for vector creation and embedding provider inspection.

```bash
kibo infer embedding create --text "friendly shell" --json
kibo infer embedding create --text "customer support ticket: delayed shipment" --model openai/text-embedding-3-large --json
kibo infer embedding providers --json
```

## JSON output

Infer commands normalize JSON output under a shared envelope:

```json
{
  "ok": true,
  "capability": "image.generate",
  "transport": "local",
  "provider": "openai",
  "model": "gpt-image-1",
  "attempts": [],
  "outputs": []
}
```

Top-level fields are stable:

- `ok`
- `capability`
- `transport`
- `provider`
- `model`
- `attempts`
- `outputs`
- `error`

## Common pitfalls

```bash
# Bad
kibo infer media image generate --prompt "friendly shell"

# Good
kibo infer image generate --prompt "friendly shell"
```

```bash
# Bad
kibo infer audio transcribe --file ./memo.m4a --model whisper-1 --json

# Good
kibo infer audio transcribe --file ./memo.m4a --model openai/whisper-1 --json
```

## Notes

- `kibo capability ...` is an alias for `kibo infer ...`.
