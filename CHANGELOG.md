# Changelog

Docs: https://github.com/Arjgorithmic/openclaw

## Unreleased

### Changes

- Memory/Active Memory: add a new optional Active Memory plugin that gives Kibo a dedicated memory sub-agent right before the main reply, so ongoing chats can automatically pull in relevant preferences, context, and past details without making users remember to manually say "remember this" or "search memory" first. Includes configurable message/recent/full context modes, live `/verbose` inspection, advanced prompt/thinking overrides for tuning, and opt-in transcript persistence for debugging.
- macOS/Talk: add an experimental local MLX speech provider for Talk Mode, with explicit provider selection, local utterance playback, interruption handling, and system-voice fallback..
- CLI/exec policy: add a local `kibo exec-policy` command with `show`, `preset`, and `set` subcommands for synchronizing requested `tools.exec.*` config with the local exec approvals file, plus follow-up hardening for node-host rejection, rollback safety, and sync conflict detection.
- Gateway: add a `commands.list` RPC so remote gateway clients can discover runtime-native, text, skill, and plugin commands with surface-aware naming and serialized argument metadata..
- Models/providers: add per-provider `models.providers.*.request.allowPrivateNetwork` for trusted self-hosted OpenAI-compatible endpoints, keep the opt-in scoped to model request surfaces, and refresh cached WebSocket managers when request transport overrides change..
- QA/testing: add a `--runner multipass` lane for `kibo qa suite` so repo-backed QA scenarios can run inside a disposable Linux VM and write back the usual report, summary, and VM logs..
- Docs i18n: chunk raw doc translation, reject truncated tagged outputs, avoid ambiguous body-only wrapper unwrapping, and recover from terminated Pi translation sessions without changing the default `openai/gpt-5.4` path. (#62969, #63808).

### Fixes

- Gateway/startup: keep WebSocket RPC available while channels and plugin sidecars start, hold `chat.history` unavailable until startup sidecars finish so synchronous history reads cannot stall startup (), refresh advertised gateway methods after deferred plugin reloads, and enforce the pre-auth WebSocket upgrade budget before the no-handler 503 path so upgrade floods cannot bypass connection limits during that window..
- Gateway/tailscale: start Tailscale exposure and the gateway update check before awaiting channel and plugin sidecar startup so remote operators are not locked out when startup sidecars stall.
- WhatsApp: keep inbound replies, media, composing indicators, and queued outbound deliveries attached to the current socket across reconnect gaps, including fresh retry-eligible sends after the listener comes back. (#30806, #46299, #62892, #63916).
- Microsoft Teams: restore media downloads for personal DMs, Bot Framework `a:` conversations, OneDrive/SharePoint shared files, and Graph-backed chat IDs; accept Bot Framework audience tokens; and deliver cron announcements to Teams conversation IDs. (#55383, #58001, #58249, #62219, #62674, #63063, #63942, #63951, #63953).
- Gateway/thread routing: preserve Slack, Telegram, Mattermost, and ACP parent-thread delivery targets so subagent, cron, and stream-relay completion messages land back in the originating thread or topic. (#54840, #57056, #63228, #63506).
- Agents/timeouts: extend the default LLM idle window to 120s and keep silent no-token idle timeouts on recovery paths, so slow models can retry or fall back before users see an error.
- Gateway/agents: preserve configured model selection and richer `IDENTITY.md` content across agent create/update flows and workspace moves, and fail safely instead of silently overwriting unreadable identity files..
- Windows/exec: settle supervisor waits from child exit state after stdout and stderr drain even when `close` never arrives, so CLI commands stop hanging or dying with forced `SIGKILL` on Windows..
- Browser/sandbox: prevent sandbox browser CDP startup hangs by recreating containers when the browser security hash changes and by waiting on the correct sandbox browser lifecycle..
- iMessage/self-chat: distinguish normal DM outbound rows from true self-chat using `destination_caller_id` plus chat participants, while preserving multi-handle self-chat aliases so outbound DM replies stop looping back as inbound messages..
- Gateway/pairing: prefer explicit QR bootstrap auth over earlier Tailscale auth classification so iOS `/pair qr` silent bootstrap pairing does not fall through to `pairing required`..
- Browser/control: auto-generate browser-control auth tokens for `none` and `trusted-proxy` modes, and route browser auth/profile/doctor helpers through the public browser plugin facades. (#63280, #63957).
- Browser/act: centralize `/act` request normalization and execution dispatch while adding stable machine-readable route-level error codes for invalid requests, selector misuse, evaluate-disabled gating, target mismatch, and existing-session unsupported actions..
- Security/exec: replace script-preflight check-then-read logic with an atomic pinned-file-descriptor open, and expand the host environment denylist for dangerous runtime-control variables. (#62333, #63277).
- Security/nodes: keep `nodes` tool output paths inside the workspace boundary so model-driven node writes cannot escape the intended workspace..
- Security/QQBot: enforce media storage boundaries for all outbound local file paths and route image-size probes through SSRF-guarded media fetching instead of raw `fetch()`. (#63271, #63495).
- Channel setup: ignore workspace plugin shadows when resolving trusted channel setup catalog entries so onboarding and setup flows keep using the bundled, trusted setup contract.
- Config/plugins: let config writes keep disabled plugin entries without forcing required plugin config schemas or crashing raw plugin validation, and avoid re-activating plugin registry state during schema checks. (#54971, #63296).
- Config validation: surface the actual offending field for strict-schema union failures in bindings, including top-level unexpected keys on the matching ACP branch..
- Wizard/plugin config: coerce integer-typed plugin config fields from interactive text input so integer schema values persist as numbers instead of failing validation..
- Daemon/gateway install: preserve safe custom service env vars on forced reinstall, merge prior custom PATH segments behind the managed service PATH, and stop removed managed env keys from persisting as custom carryover..
- Cron/scheduling: treat `nextRunAtMs <= 0` as invalid across cron update, maintenance, timer, and stale-delivery paths so corrupted zero timestamps self-heal instead of causing immediate runs or skipped deliveries..
- Cron/auth: resolve auth profiles consistently for isolated cron jobs so scheduled runs use the same configured provider credentials as interactive sessions..
- Tasks: let `kibo tasks cancel` cancel stuck background tasks that never reached a normal terminal state..
- Sessions/model selection: preserve catalog-backed session model labels, provider-qualified context limits, and already-qualified session model refs when catalog metadata is unavailable, so model selection and memory/context budgets survive reloads without bogus provider prefixes. (#61382, #62493).
- Status: show configured fallback models in `/status` and shared session status cards so per-agent fallback configuration is visible before a live failover happens..
- `/context detail` now compares the tracked prompt estimate with cached context usage and surfaces untracked provider/runtime overhead when present..
- Gateway/sessions: scope bare `sessions.create` aliases like `main` to the requested agent while preserving the canonical `global` and `unknown` sentinel keys..
- Gateway/session reset: emit the typed `before_reset` hook for gateway `/new` and `/reset`, preserving reset-hook behavior even when the previous transcript has already been archived..
- Plugins/commands: pass the active host `sessionKey` into plugin command contexts, and include `sessionId` when it is already available from the active session entry, so bundled and third-party commands can resolve the current conversation reliably..
- Agents/auth: honor `models.providers.*.authHeader` for pi embedded runner model requests by injecting `Authorization: Bearer <apiKey>` when requested..
- Claude CLI: clear inherited Anthropic auth/header environment aliases before spawning Claude Code and add sanitized CLI backend auth-env diagnostics for debugging gateway-run provider selection.
- Agents/failover: classify AbortError and stream-abort messages as timeout so Ollama NDJSON stream aborts stop showing `reason=unknown` in model fallback logs..
- Fireworks/FirePass: disable Kimi K2.5 Turbo reasoning output by forcing thinking off on the FirePass path and hardening the provider wrapper so hidden reasoning no longer leaks into visible replies..
- Matrix/multi-account: keep room-level `account` scoping, inherited room overrides, and implicit account selection consistent across top-level default auth, named accounts, and cached-credential env setups..
- Matrix/runtime: resolve the verification/bootstrap runtime from a distinct packaged Matrix entry so global npm installs stop failing on crypto bootstrap with missing-module or recursive runtime alias errors..
- Matrix/streaming: preserve ordered block flushes before tool, message, and agent boundaries, add explicit `channels.matrix.blockStreaming` opt-in so Matrix `streaming: "off"` stays final-only by default, and move MiniMax plain-text final handling into the MiniMax provider runtime instead of the shared core heuristic..
- QQBot/streaming: make block streaming configurable per QQ bot account via `streaming.mode` (`"partial"` | `"off"`, default `"partial"`) instead of hardcoding it off, so responses can be delivered incrementally.
- Discord: update Carbon to v0.15.0..
- Config/Discord: coerce safe integer numeric Discord IDs to strings during config validation, keep unsafe or precision-losing numeric snowflakes rejected, and align `kibo doctor` repair guidance with the same fail-closed behavior..
- BlueBubbles/config: accept `enrichGroupParticipantsFromContacts` in the core strict config schema so gateways no longer fail validation or startup when the BlueBubbles plugin writes that field..
- Feishu/webhooks: read webhook bodies through the pre-auth guard so unauthenticated webhook traffic stays under the same body budget as other protected channel ingress paths.
- Tools/web_fetch: add an opt-in `tools.web.fetch.ssrfPolicy.allowRfc2544BenchmarkRange` config so fake-IP proxy environments that resolve public sites into `198.18.0.0/15` can use `web_fetch` without weakening the default SSRF block..
- Dreaming/gateway: require `operator.admin` for persistent `/dreaming on|off` changes and treat missing gateway client scopes as unprivileged instead of silently allowing config writes..
- Dreaming/cron: reconcile managed dreaming cron from startup config and runtime lifecycle changes, but only recover managed dreaming cron state during heartbeat-triggered dreaming checks so ordinary chat traffic does not recreate removed jobs. (#63873, #63929, #63938).
- Memory/lancedb: accept `dreaming` config when `memory-lancedb` owns the memory slot so Dreaming surfaces can read slot-owner settings without schema rejection..
- Control UI/dreaming: keep the Dreaming trace area contained and scrollable so overlays no longer cover tabs or blow out the page layout..
- Dreaming/diary: add idempotent narrative subagent runs, preserve restrictive `DREAMS.md` permissions during atomic writes, and surface temp cleanup failures so repeated sweeps do not double-run the same narrative request or silently weaken diary safety..
- Heartbeats/sessions: remove stale accumulated isolated heartbeat session keys when the next tick converges them back to the canonical sibling, so repaired sessions stop showing orphaned `:heartbeat:heartbeat` variants in session listings..
- Gateway/run cleanup: fix stale run-context TTL cleanup so the new maintenance sweep resets orphaned run sequence state and prevents unbounded run-context growth..
- UI/compaction: keep the compaction indicator in a retry-pending state until the run actually finishes, so the UI does not show `Context compacted` before compaction actually finishes..
- Cron/tool schemas: keep cron tool schemas strict-model-friendly while still preserving `failureAlert=false`, nullable `agentId`/`sessionKey`, and flattened add/update recovery for the newly exposed cron job fields..
- Git metadata: read commit ids from packed refs as well as loose refs so version and status metadata stay accurate after repository maintenance.
- Gateway: keep `commands.list` skill entries categorized under tools and include provider-aware plugin `nativeName` metadata even when `scope=text`, so remote clients can group skills correctly and map text-surface plugin commands back to native aliases.

## 2026.4.9

### Changes

- Memory/dreaming: add a grounded REM backfill lane with historical `rem-harness --path`, diary commit/reset flows, cleaner durable-fact extraction, and live short-term promotion integration so old daily notes can replay into Dreams and durable memory without a second memory stack..
- Control UI/dreaming: add a structured diary view with timeline navigation, backfill/reset controls, traceable dreaming summaries, and a grounded Scene lane with promotion hints plus a safe clear-grounded action for staged backfill signals..
- QA/lab: add character-vibes evaluation reports with model selection and parallel runs so live QA can compare candidate behavior faster.
- Plugins/provider-auth: let provider manifests declare `providerAuthAliases` so provider variants can share env vars, auth profiles, config-backed auth, and API-key onboarding choices without core-specific wiring.
- iOS: pin release versioning to an explicit CalVer in `apps/ios/version.json`, keep TestFlight iteration on the same short version until maintainers intentionally promote the next gateway version, and add the documented `pnpm ios:version:pin -- --from-gateway` workflow for release trains..

### Fixes

- Browser/security: re-run blocked-destination safety checks after interaction-driven main-frame navigations from click, evaluate, hook-triggered click, and batched action flows, so browser interactions cannot bypass the SSRF quarantine when they land on forbidden URLs..
- Security/dotenv: block runtime-control env vars plus browser-control override and skip-server env vars from untrusted workspace `.env` files, and reject unsafe URL-style browser control override specifiers before lazy loading. (#62660, #62663).
- Gateway/node exec events: mark remote node `exec.started`, `exec.finished`, and `exec.denied` summaries as untrusted system events and sanitize node-provided command/output/reason text before enqueueing them, so remote node output cannot inject trusted `System:` content into later turns..
- Plugins/onboarding auth choices: prevent untrusted workspace plugins from colliding with bundled provider auth-choice ids during non-interactive onboarding, so bundled provider setup keeps operator secrets out of untrusted workspace plugin handlers unless those plugins are explicitly trusted..
- Security/dependency audit: force `basic-ftp` to `5.2.1` for the CRLF command-injection fix and bump Hono plus `@hono/node-server` in production resolution paths.
- Android/pairing: clear stale setup-code auth on new QR scans, bootstrap operator and node sessions from fresh pairing, prefer stored device tokens after bootstrap handoff, and pause pairing auto-retry while the app is backgrounded so scan-once Android pairing recovers reliably again..
- Matrix/gateway: wait for Matrix sync readiness before marking startup successful, keep Matrix background handler failures contained, and route fatal Matrix sync stops through channel-level restart handling instead of crashing the whole gateway..
- Slack/media: preserve bearer auth across same-origin `files.slack.com` redirects while still stripping it on cross-origin Slack CDN hops, so `url_private_download` image attachments load again..
- Reply/doctor: use the active runtime snapshot for queued reply runs, resolve reply-run SecretRefs before preflight helpers touch config, surface gateway OAuth reauth failures to users, and make `kibo doctor` call out exact reauth commands. (#62693, #63217).
- Control UI: guard stale session-history reloads during fast session switches so the selected session and rendered transcript stay in sync..
- Gateway/chat: suppress exact and streamed `ANNOUNCE_SKIP` / `REPLY_SKIP` control replies across live chat updates and history sanitization so internal agent-to-agent control tokens no longer leak into user-facing gateway chat surfaces..
- Auto-reply/NO_REPLY: strip glued leading `NO_REPLY` tokens before reply normalization and ACP-visible streaming so silent sentinel text no longer leaks into user-visible replies while preserving substantive `NO_REPLY ...` text..
- Sessions/routing: preserve established external routes on inter-session announce traffic so `sessions_send` follow-ups do not steal delivery from Telegram, Discord, or other external channels..
- Gateway/sessions: clear auto-fallback-pinned model overrides on `/reset` and `/new` while still preserving explicit user model selections, including legacy sessions created before override-source tracking existed..
- Slack/ACP: treat Slack ACP block replies as visible delivered output so Kibo stops re-sending the final fallback text after Slack already rendered the reply..
- Slack/partial streaming: key turn-local dedupe by dispatch kind and keep the final fallback reply path active when preview finalization fails so stale preview text cannot suppress the actual final answer..
- Matrix/doctor: migrate legacy `channels.matrix.dm.policy: "trusted"` configs back to compatible DM policies during `kibo doctor --fix`, preserving explicit `allowFrom` boundaries as `allowlist` and defaulting empty legacy configs to `pairing`..
- npm packaging: mirror bundled channel runtime deps, stage Nostr runtime deps, derive required root mirrors from manifests and built chunks, and test packed release tarballs without repo `node_modules` so fresh installs fail fast on missing plugin deps instead of crashing at runtime..
- QA/live auth: fail fast when live QA scenarios hit classified auth or runtime failure replies, including raw scenario wait paths, and sanitize missing-key guidance so gateway auth problems surface as actionable errors instead of timeouts..
- Providers/OpenAI: default missing reasoning effort to `high` on OpenAI Responses, WebSocket, and compatible completions transports, while still honoring explicit per-run reasoning levels.
- Providers/Ollama: allow Ollama models using the native `api: "ollama"` path to optionally display thinking output when `/think` is set to a non-off level..
- Codex CLI: pass Kibo's system prompt through Codex's `model_instructions_file` config override so fresh Codex CLI sessions receive the same prompt guidance as Claude CLI sessions.
- Auth/profiles: persist explicit auth-profile upserts directly and skip external CLI sync for local writes so profile changes are saved without stale external credential state.
- Agents/timeouts: make the LLM idle timeout inherit `agents.defaults.timeoutSeconds` when configured, disable the unconfigured idle watchdog for cron runs, and point idle-timeout errors at `agents.defaults.llm.idleTimeoutSeconds`..
- Agents/failover: classify Z.ai vendor code `1311` as billing and `1113` as auth, including long wrapped `1311` payloads, so these errors stop falling through to generic failover handling..
- QQBot/media-tags: support HTML entity-encoded angle brackets (`&lt;`/`&gt;`), URL slashes in attributes, and self-closing media tags so upstream `<qqimg>` payloads are correctly parsed and normalized..
- Memory/dreaming: harden grounded backfill inputs, diary writes, status payloads, and diary action classification by preserving source-day labels, rejecting missing or symlinked targets cleanly, normalizing diary headings in gateway backfills, and tightening claim splitting plus diary source metadata..
- Memory/dreaming: accept embedded heartbeat trigger tokens so light and REM dreaming still run when runtime wrappers include extra heartbeat text.
- Android/manual connect: allow blank port input only for TLS manual gateway endpoints so standard HTTPS Tailscale hosts default to `443` without silently changing cleartext manual connects..
- Windows/update: add heap headroom to Windows `pnpm build` steps during dev updates so update preflight builds stop failing on low default Node memory.
- Plugin SDK: export the channel plugin base and web-search config contract through the public package so plugins can use them without private imports.
- Plugins/contracts: keep test-only helpers out of production contract barrels, load shared contract harnesses through bundled test surfaces, and harden guardrails so indirect re-exports and canonical `*.test.ts` files stay blocked..
- Control UI/models: preserve provider-qualified refs for OpenRouter catalog models whose ids already contain slashes so picker selections submit allowlist-compatible model refs instead of dropping the `openrouter/` prefix..
- Plugin SDK/command auth: split command status builders onto the lightweight `kibo/plugin-sdk/command-status` subpath while preserving deprecated `command-auth` compatibility exports, so auth-only plugin imports no longer pull status/context warmup into CLI onboarding paths..

## 2026.4.8

### Fixes

- Telegram/setup: load setup and secret contracts through packaged top-level sidecars so installed npm builds no longer try to import missing `dist/extensions/telegram/src/*` files during gateway startup.
- Bundled channels/setup: load shared secret contracts through packaged top-level sidecars across BlueBubbles, Feishu, Google Chat, IRC, Matrix, Mattermost, Microsoft Teams, Nextcloud Talk, Slack, and Zalo so installed npm builds no longer rely on missing `dist/extensions/*/src/*` files during gateway startup.
- Bundled plugins: align packaged plugin compatibility metadata with the release version so bundled channels and providers load on Kibo 2026.4.8.
- Agents/progress: keep `update_plan` available for OpenAI-family runs while returning compact success payloads and allowing `tools.experimental.planTool=false` to opt out.
- Agents/exec: keep `/exec` current-default reporting aligned with real runtime behavior so `host=auto` sessions surface the correct host-aware fallback policy (`full/off` on gateway or node, `deny/off` on sandbox) instead of stale stricter defaults.
- Slack: honor ambient HTTP(S) proxy settings for Socket Mode WebSocket connections, including NO_PROXY exclusions, so proxy-only deployments can connect without a monkey patch..
- Slack/actions: pass the already resolved read token into `downloadFile` so SecretRef-backed bot tokens no longer fail after a raw config re-read..
- Network/fetch guard: skip target DNS pinning when trusted env-proxy mode is active so proxy-only sandboxes can let the trusted proxy resolve outbound hosts..

## 2026.4.7-1

## 2026.4.7

### Changes

- CLI/infer: add a first-class `kibo infer ...` hub for provider-backed inference workflows across model, media, web, and embedding tasks..
- Tools/media generation: auto-fallback across auth-backed image, music, and video providers by default, preserve intent during provider switches, remap size/aspect/resolution/duration hints to the closest supported option, and surface provider capabilities plus mode-aware video-to-video support.
- Memory/wiki: restore the bundled `memory-wiki` stack with plugin, CLI, sync/query/apply tooling, memory-host integration, structured claim/evidence fields, compiled digest retrieval, claim-health linting, contradiction clustering, staleness dashboards, and freshness-weighted search..
- Plugins/webhooks: add a bundled webhook ingress plugin so external automation can create and drive bound TaskFlows through per-route shared-secret endpoints..
- Gateway/sessions: add persisted compaction checkpoints plus Sessions UI branch/restore actions so operators can inspect and recover pre-compaction session state..
- Compaction: add pluggable compaction provider registry so plugins can replace the built-in summarization pipeline. Configure via `agents.defaults.compaction.provider`; falls back to LLM summarization on provider failure..
- Agents/system prompt: add `agents.defaults.systemPromptOverride` for controlled prompt experiments plus heartbeat prompt-section controls so heartbeat runtime behavior can stay enabled without injecting heartbeat instructions every turn.
- Providers/Google: add Gemma 4 model support and keep Google fallback resolution on the requested provider path so native Google Gemma routes work again..
- Providers/Google: preserve explicit thinking-off semantics for Gemma 4 while still enabling Gemma reasoning support in compatibility wrappers..
- Providers/Arcee AI: add a bundled Arcee AI provider plugin with Trinity catalog entries, OpenRouter support, and updated onboarding/auth guidance..
- Providers/Anthropic: restore Claude CLI as the preferred local Anthropic path in onboarding, model-auth guidance, doctor flows, and Docker Claude CLI live lanes again.
- Providers/Ollama: detect vision capability from the `/api/show` response and set image input on models that support it so Ollama vision models accept image attachments..
- Memory/dreaming: ingest redacted session transcripts into the dreaming corpus with per-day session-corpus notes, cursor checkpointing, and promotion/doctor support..
- Providers/inferrs: add string-content compatibility for stricter OpenAI-compatible chat backends, document `inferrs` setup with a full config example, and add troubleshooting guidance for local backends that pass direct probes but fail on full agent-runtime prompts.
- Agents/context engine: expose prompt-cache runtime context to context engines and keep current-turn prompt-cache usage aligned with the active attempt instead of stale prior-turn assistant state..
- Plugin SDK/context engines: pass `availableTools` and `citationsMode` into `assemble()`, and expose memory-artifact and memory-prompt seams so companion plugins and non-legacy context engines can consume active memory state without reaching into internals..
- ACP/ACPX plugin: bump the bundled `acpx` pin to `0.5.1` so plugin-local installs and strict version checks pick up the latest published runtime release..
- Discord/events: allow `event-create` to accept a cover image URL or local file path, load and validate PNG/JPG/GIF event cover media, and pass the encoded image payload through Discord admin action/runtime paths..
- Plugins/provider-auth: expose runtime-ready provider auth through `kibo/plugin-sdk/provider-auth-runtime` so native plugins and context engines can resolve request-ready credentials after provider-owned runtime exchanges like GitHub Copilot device-token-to-bearer flows..

### Fixes

- CLI/infer: keep provider-backed infer behavior aligned with actual runtime execution by fixing explicit TTS override handling, profile-aware gateway TTS prefs resolution, per-request transcription `prompt`/`language` overrides, image output MIME/extension mismatches, configured web-search fallback behavior, and agent-vs-CLI web-search execution drift.
- Plugins/media: when `plugins.allow` is set, capability fallback now merges bundled capability plugin ids into the allowlist (not only `plugins.entries`), so media understanding providers such as OpenAI-compatible STT load for voice transcription without requiring `openai` in `plugins.allow`..
- Agents/history and replies: buffer phaseless OpenAI WS text until a real assistant phase arrives, keep replay and SSE history sequence tracking aligned, hide commentary and leaked tool XML from user-visible history, and keep history-based follow-up replies on `final_answer` text only. (#61729, #61747, #61829, #61855, #61954).
- Control UI: show `/tts` audio replies in webchat, detect mistaken `?token=` auth links with the correct `#token=` hint, and keep Copy, Canvas, and mobile exec-approval UI from covering chat content on narrow screens. (#54842, #61514, #61598).
- iOS/gateway: replace string-matched connection error UI with structured gateway connection problems, preserve actionable pairing/auth failures over later generic disconnect noise, and surface reusable problem banners and details across onboarding, settings, and root status surfaces..
- TUI: route `/status` through the shared session-status command, keep commentary hidden in history, strip raw envelope metadata from async command notices, preserve fallback streaming before per-attempt failures finalize, and restore Kitty keyboard state on exit or fatal crashes. (#49130, #59985, #60043, #61463).
- iOS/Watch exec approvals: keep Apple Watch review and approval recovery working while the iPhone is locked or backgrounded, including reconnect recovery, pending approval persistence, notification cleanup, and APNs-backed watch refresh recovery..
- Agents/context overflow: combine oversized and aggregate tool-result recovery in one pass and restore a total-context overflow backstop so recoverable sessions retry instead of failing early..
- Auth/OpenAI Codex OAuth: reload fresh on-disk credentials inside the locked refresh path and retry once after `refresh_token_reused` rotates only the stored refresh token, so relogin/restart recovery stops getting stuck on stale cached auth state..
- Auth/OpenAI Codex OAuth: keep native `/model ...@profile` selections on the target session and honor explicit user-locked auth profiles even when per-agent auth order excludes them..
- Providers/Anthropic: preserve thinking blocks for Claude Opus 4.5+, Sonnet 4.5+, and newer Claude 4-family models so prompt-cache prefixes keep matching, and skip `service_tier` injection on OAuth-authenticated stream wrapper requests so Claude OAuth streaming stops failing with HTTP 401. (#60356, #61793)
- Agents/Claude CLI: surface nested API error messages from structured CLI output so billing/auth/provider failures show the real provider error instead of an opaque CLI failure.
- Agents/exec: preserve explicit `host=node` routing under elevated defaults when `tools.exec.host=auto`, fail loud on invalid elevated cross-host overrides, and keep `strictInlineEval` commands blocked after approval timeouts instead of falling through to automatic execution..
- Nodes/exec approvals: keep `host=node` POSIX transport shell wrappers (`/bin/sh -lc ...`) aligned with inner-command allowlist analysis so allowlisted scripts stop prompting unnecessarily, while Windows `cmd.exe` wrapper runs stay approval-gated..
- Nodes/exec approvals: keep Windows `cmd.exe /c` wrapper runs approval-gated even when `env` carriers, including env-assignment carriers, wrap the shell invocation..
- Gateway tool/exec config: block model-facing `gateway config.apply` and `config.patch` writes from changing exec approval paths such as `safeBins`, `safeBinProfiles`, `safeBinTrustedDirs`, and `strictInlineEval`, while still allowing unchanged structured values through..
- Host exec/env sanitization: block dangerous Java, Rust, Cargo, Git, Kubernetes, cloud credential, config-path, and Helm env overrides so host-run tools cannot be redirected to attacker-chosen code, config, credentials, or repository state. (#59119, #62002, #62291).
- Commands/allowlist: require owner authorization for `/allowlist add` and `/allowlist remove` before channel resolution, so non-owner but command-authorized senders can no longer persistently rewrite allowlist policy state..
- Feishu/docx uploads: honor `tools.fs.workspaceOnly` for local `upload_file` and `upload_image` paths by forwarding workspace-constrained `localRoots` into the media loader, so docx uploads can no longer read host-local files outside the workspace when workspace-only mode is active..
- Network/fetch guard: drop request bodies and body-describing headers on cross-origin `307` and `308` redirects by default, so attacker-controlled redirect hops cannot receive secret-bearing POST payloads from SSRF-guarded fetch flows unless a caller explicitly opts in..
- Browser/SSRF: treat main-frame `document` redirect hops as navigations even when Playwright does not flag them as `isNavigationRequest()`, so strict private-network blocking still stops forbidden redirect pivots before the browser reaches the internal target..
- Browser/node invoke: block persistent browser profile create, reset, and delete mutations through `browser.proxy` on both gateway-forwarded `node.invoke` and the node-host proxy path, even when no profile allowlist is configured.
- Gateway/node pairing: require a fresh pairing request when a previously paired node reconnects with additional declared commands, and keep the live session pinned to the earlier approved command set until the upgrade is approved..
- Gateway/auth: invalidate existing shared-token and password WebSocket sessions when the configured secret rotates, so stale authenticated sockets cannot stay attached after token or password changes..
- MS Teams/security: validate file-consent upload URLs against HTTPS, Microsoft/SharePoint host allowlists, and private-IP DNS checks before uploading attachments, blocking SSRF-style consent-upload abuse.
- Media/base64 decode guards: enforce byte limits before decoding missed base64-backed Teams, Signal, QQ Bot, and image-tool payloads so oversized inbound media and data URLs no longer bypass pre-decode size checks..
- Runtime event trust: mark background `notifyOnExit` summaries, ACP parent-stream relays, and wake-hook payloads as untrusted system events so lower-trust runtime output no longer re-enters later turns as trusted `System:` text.
- Auto-reply/media: allow managed generated-media `MEDIA:` paths from normal reply text again while still blocking arbitrary host-local media and document paths, so generated media keep delivering without reopening host-path injection holes.
- Gateway/status and containers: auto-bind to `0.0.0.0` inside Docker and Podman environments, and probe local TLS gateways over `wss://` with self-signed fingerprint forwarding so container startup and loopback TLS status checks work again. (#61818, #61935).
- Gateway/OpenAI-compatible HTTP: abort in-flight `/v1/chat/completions` and `/v1/responses` turns when clients disconnect so abandoned HTTP requests stop wasting agent runtime..
- macOS/gateway version: strip trailing commit metadata from CLI version output before semver parsing so the Mac app recognizes installed gateway versions like `Kibo 2026.4.2 (d74a122)` again..
- Sessions/model selection: resolve the explicitly selected session model separately from runtime fallback resolution so session status and live model switching stay aligned with the chosen model.
- Discord/ACP bindings: canonicalize DM conversation identity across inbound messages, component interactions, native commands, and current-conversation binding resolution so `--bind here` in Discord DMs keeps routing follow-up replies to the bound agent instead of falling back to the default agent.
- Discord: recover forwarded referenced message text and attachments when snapshots are missing, use `ws://` again for gateway monitor sockets, stop forcing a hardcoded temperature for Codex-backed auto-thread titles, and harden voice receive recovery so rapid speaker restarts keep their next utterance. (#41536, #61670).
- Slack/thread mentions: add `channels.slack.thread.requireExplicitMention` so Slack channels that already require mentions can also require explicit `@bot` mentions inside bot-participated threads..
- Slack/threading: keep legacy thread stickiness for real replies when older callers omit `isThreadReply`, while still honoring `replyToMode` for Slack's auto-created top-level `thread_ts`..
- Slack/media: keep attachment downloads on the SSRF-guarded dispatcher path so Slack media fetching works on Node 22 without dropping pinned transport enforcement..
- Matrix/onboarding: add an invite auto-join setup step with explicit off warnings and strict stable-target validation so new Matrix accounts stop silently ignoring invited rooms and fresh DM-style invites unless operators opt in..
- Matrix/formatting: preserve multi-paragraph and loose-list rendering in Element so numbered and bulleted Markdown keeps their content attached to the correct list item..
- Telegram/doctor: keep top-level access-control fallback in place during multi-account normalization while still promoting legacy default auth into `accounts.default`, so existing named bots keep inherited allowlists without dropping the legacy default bot..
- Plugins/loaders: centralize bundled `dist/**` Jiti native-load policy and keep channel, public-surface, facade, and config-metadata loader seams off native Jiti on Windows so onboarding and configure flows stop tripping `ERR_UNSUPPORTED_ESM_URL_SCHEME`..
- Plugins/channels: keep bundled channel artifact and secret-contract loading stable under lazy loading, preserve plugin-schema defaults during install, and fix Windows `file://` plus native-Jiti plugin loader paths so onboarding, doctor, `kibo secret`, and bundled plugin installs work again. (#61832, #61836, #61853, #61856).
- Plugins/KiboHub: verify downloaded plugin archives against version metadata SHA-256, fail closed when archive integrity metadata is missing or malformed, and tighten fallback ZIP verification so plugin installs cannot proceed on mismatched or incomplete KiboHub package metadata..
- Plugins/provider hooks: stop recursive provider snapshot loads from overflowing the stack during plugin initialization, while still preserving cached nested provider-hook results. (#61922, #61938, #61946, #61951)
- Docker/plugins: stop forcing bundled plugin discovery to `/app/extensions` in runtime images so packaged installs use compiled `dist/extensions` artifacts again and Node 24 containers do not boot through source-only plugin entry paths. Fixes #62044..
- Providers/Ollama: honor the selected provider's `baseUrl` during streaming so multi-Ollama setups stop routing every stream to the first configured Ollama endpoint.
- Providers/Ollama: stop warning that Ollama could not be reached when discovery only sees empty default local stubs, while still keeping real explicit Ollama overrides loud when the endpoint is unreachable.
- Providers/xAI: recognize `api.grok.x.ai` as an xAI-native endpoint again and keep legacy `x_search` auth resolution working so older xAI web-search configs continue to load..
- Providers/Mistral: send `reasoning_effort` for `mistral/mistral-small-latest` (Mistral Small 4) with thinking-level mapping, and mark the catalog entry as reasoning-capable so adjustable reasoning matches Mistral’s Chat Completions API..
- OpenAI TTS/Groq: send `wav` to Groq-compatible speech endpoints, honor explicit `responseFormat` overrides on OpenAI-compatible paths, and only mark voice-note output as voice-compatible when the actual format is `opus`..
- Tools/web_fetch and web_search: fix `TypeError: fetch failed` caused by undici 8.0 enabling HTTP/2 by default; pinned SSRF-guard dispatchers now explicitly set `allowH2: false` to restore HTTP/1.1 behavior and keep the custom DNS-pinning lookup compatible. (#61738, #61777).
- Tools/web search/Exa: show Exa Search in onboarding and configure provider pickers again by marking the bundled Exa provider as setup-visible..
- Memory/vector recall: surface explicit warnings when `sqlite-vec` is unavailable or vector writes are degraded, and strip managed Light Sleep and REM blocks before daily-note ingestion so memory indexing and dreaming stop reporting false-success or re-ingesting staged output..
- Memory/dreaming: make Dreams config reads and writes respect the selected memory slot plugin instead of always targeting `memory-core`..
- QQ Bot/media: route gateway-side attachment and fallback downloads through guarded QQ/Tencent HTTPS fetches so QQ media handling no longer follows arbitrary remote hosts.
- Browser/remote CDP: retry the DevTools websocket once after remote browser restarts so healthy remote browser profiles do not fail availability checks during CDP warm-up..
- UI/light mode: target both root and nested WebKit scrollbar thumbs in the light theme so page-level and container scrollbars stay visible on light backgrounds..
- Agents/subagents: honor `sessions_spawn(lightContext: true)` for spawned subagent runs by preserving lightweight bootstrap context through the gateway and embedded runner instead of silently falling back to full workspace bootstrap injection..
- Cron: load `jobId` into `id` when the on-disk store omits `id`, matching doctor migration and fixing `unknown cron job id` for hand-edited `jobs.json`..
- Agents/model fallback: classify minimal HTTP 404 API errors (for example `404 status code (no body)`) as `model_not_found` so assistant failures throw into the fallback chain instead of stopping at the first fallback candidate..
- BlueBubbles/network: respect explicit private-network opt-out for loopback and private `serverUrl` values across account resolution, status probes, monitor startup, and attachment downloads, while keeping public-host attachment hostname pinning intact..
- Agents/heartbeat: keep heartbeat runs pinned to the main session so active subagent transcripts are not overwritten by heartbeat status messages..
- Agents/heartbeat: respect disabled heartbeat prompt guidance so operators can suppress heartbeat prompt instructions without disabling heartbeat runtime behavior.
- Agents/compaction: stop compaction-wait aborts from re-entering prompt failover and replaying completed tool turns..
- Approvals/runtime: move native approval lifecycle assembly into shared core bootstrap/runtime seams driven by channel capabilities and runtime contexts, and remove the legacy bundled approval fallback wiring..
- Security/fetch-guard: stop rejecting operator-configured proxy hostnames against the target-scoped hostname allowlist in SSRF-guarded fetches, restoring proxy-based media downloads for Telegram and other channels..
- Logging: make `logging.level` and `logging.consoleLevel` honor the documented severity threshold ordering again, and keep child loggers inheriting the parent `minLevel`..
- Agents/sessions_send: pass `threadId` through announce delivery so cross-session notifications land in the correct Telegram forum topic instead of the group's general thread..
- Daemon/systemd: keep sudo systemctl calls scoped to the invoking user when machine-scoped systemctl fails, while still avoiding machine fallback for permission-denied user bus errors..
- Docs/i18n: relocalize final localized-page links after translation and remove the zh-CN homepage redirect override so localized Mintlify pages resolve to the correct language roots again..
- Agents/exec: keep timed-out shell-backgrounded commands on the failed path and point long-running jobs to exec background/yield sessions so process polling is only suggested for registered sessions.
- Agents/model resolution: let explicit `openai-codex/gpt-5.4` selection prefer provider runtime metadata when it reports a larger context window, keeping configured Codex runs aligned with the live provider limits..
- Agents/model resolution: keep explicit-model runtime comparisons on the configured workspace plugin registry, so workspace-installed providers do not silently fall back to stale explicit metadata during runtime model lookup.
- Providers/Z.AI: default onboarding and endpoint detection to GLM-5.1 instead of GLM-5..
- Cron/isolated: resolve auth profiles without treating every isolated run as a brand-new auth session, so profile-based providers (for example OpenRouter) keep a stable credential choice instead of rotating or ignoring stored keys..
- CLI/tasks: `kibo tasks cancel` now records operator cancellation for CLI runtime tasks instead of returning "Task runtime does not support cancellation yet", so stuck `running` CLI tasks can be cleared..
- Sessions/context: resolve context window limits using the active provider plus model (not bare model id alone) when persisting session usage, applying inline directives, and sizing memory-flush / preflight compaction thresholds, so duplicate model ids across providers no longer leak the wrong `contextTokens` into the session store or `/status`..
- Channels/setup: exclude workspace shadow entries from channel setup catalog lookups and align trust checks with auto-enable so workspace-scoped overrides no longer bypass the trusted catalog. (`GHSA-82qx-6vj7-p8m2`).

## 2026.4.5

### Breaking

- Config: remove legacy public config aliases such as `talk.voiceId` / `talk.apiKey`, `agents.*.sandbox.perSession`, `browser.ssrfPolicy.allowPrivateNetwork`, `hooks.internal.handlers`, and channel/group/room `allow` toggles in favor of the canonical public paths and `enabled`, while keeping load-time compatibility and `kibo doctor --fix` migration support for existing configs..

### Changes

- Agents/video generation: add the built-in `video_generate` tool so agents can create videos through configured providers and return the generated media directly in the reply.
- Agents/music generation: ignore unsupported optional hints such as `durationSeconds` with a warning instead of hard-failing requests on providers like Google Lyria.
- Providers/Arcee AI: add a bundled Arcee AI provider plugin with `ARCEEAI_API_KEY` onboarding, Trinity model catalog (mini, large-preview, large-thinking), OpenAI-compatible API support, and OpenRouter as an alternative auth path..
- Providers/ComfyUI: add a bundled `comfy` workflow media plugin for local ComfyUI and Comfy Cloud workflows, including shared `image_generate`, `video_generate`, and workflow-backed `music_generate` support, with prompt injection, optional reference-image upload, live tests, and output download.
- Tools/music generation: add the built-in `music_generate` tool with bundled Google (Lyria) and MiniMax providers plus workflow-backed Comfy support, including async task tracking and follow-up delivery of finished audio.
- Providers: add bundled Qwen, Fireworks AI, and StepFun providers, plus MiniMax TTS, Ollama Web Search, and MiniMax Search integrations for chat, speech, and search workflows. (#60032, #55921, #59318, #54648)
- Providers/Amazon Bedrock: add bundled Mantle support plus inference-profile discovery and automatic request-region injection so Bedrock-hosted Claude, GPT-OSS, Qwen, Kimi, GLM, and similar routes work with less manual setup. (#61296, #61299).
- Control UI/multilingual: add localized control UI support for Simplified Chinese, Traditional Chinese, Brazilian Portuguese, German, Spanish, Japanese, Korean, French, Turkish, Indonesian, Polish, and Ukrainian..
- Plugins: add plugin-config TUI prompts to guided onboarding/setup flows, and add `kibo plugins install --force` so existing plugin and hook-pack targets can be replaced without using the dangerous-code override flag. (#60590, #60544)
- Control UI/skills: add KiboHub search, detail, and install flows directly in the Skills panel..
- iOS/exec approvals: add generic APNs approval notifications that open an in-app exec approval modal, fetch command details only after authenticated operator reconnect, and clear stale notification state when the approval resolves..
- Matrix/exec approvals: add Matrix-native exec approval prompts with account-scoped approvers, channel-or-DM delivery, and room-thread aware resolution handling..
- Channels/context visibility: add configurable `contextVisibility` per channel (`all`, `allowlist`, `allowlist_quote`) so supplemental quote, thread, and fetched history context can be filtered by sender allowlists instead of always passing through as received.
- Providers/request overrides: add shared model and media request transport overrides across OpenAI-, Anthropic-, Google-, and compatible provider paths, including headers, auth, proxy, and TLS controls.
- Providers/OpenAI: add forward-compat `openai-codex/gpt-5.4-mini`, an opt-in GPT personality, and provider-owned GPT-5 prompt contributions so Codex/GPT runs stay cache-stable and compatible with bundled catalog lag.
- Agents/Claude CLI: expose Kibo tools to background Claude CLI runs through a loopback MCP bridge and switch bundled runs to stdin + `stream-json` partial-message streaming so prompts stop riding argv, long replies show live progress, and final session/usage metadata still land cleanly..
- ACPX/runtime: embed the ACP runtime directly in the bundled `acpx` plugin, remove the extra external ACP CLI hop, harden live ACP session binding and reuse, and add a generic `reply_dispatch` hook so bundled plugins like ACPX can own reply interception without hardcoded ACP paths in core auto-reply routing.
- Agents/progress: add experimental structured plan updates and structured execution item events so compatible UIs can show clearer step-by-step progress during long-running runs.
- Providers/Anthropic: remove the Claude CLI backend and setup-token from new onboarding, keep existing configured legacy profiles runnable, and have `kibo doctor` repair or remove stale `anthropic:claude-cli` state during migration.
- Tools/video generation: add bundled xAI (`grok-imagine-video`), Alibaba Model Studio Wan, and Runway video providers, plus live-test/default model wiring for all three.
- Memory/search: add Amazon Bedrock embeddings for Titan, Cohere, Nova, and TwelveLabs models, with AWS credential-chain auto-detection for `provider: "auto"` and provider-specific dimension controls..
- Providers/Amazon Bedrock Mantle: generate bearer tokens from the AWS credential chain so Mantle auto-discovery can use IAM auth without manually exporting `AWS_BEARER_TOKEN_BEDROCK`..
- Memory/dreaming (experimental): add weighted short-term recall promotion, a `/dreaming` command, Dreams UI, multilingual conceptual tagging, and doctor/status repair support, while refactoring dreaming from competing modes into three cooperative phases (light, deep, REM) with independent schedules and recovery behavior so durable memory promotion can run in the background with less manual setup. (#60569, #60697).
- Memory/dreaming: add configurable aging controls (`recencyHalfLifeDays`, `maxAgeDays`) plus optional verbose logging so operators can tune recall decay and inspect promotion decisions more easily.
- Memory/dreaming: add REM preview tooling (`kibo memory rem-harness`, `promote-explain`), surface possible lasting truths during REM staging, and make deep promotion replay-safe so reruns reconcile instead of duplicating `MEMORY.md` entries.
- Memory/dreaming: write dreaming trail content to top-level `dreams.md` instead of daily memory notes, update `/dreaming` help text to point there, and keep `dreams.md` available for explicit reads without pulling it into default recall..
- Memory/dreaming: add the Dream Diary surface in Dreams, simplify user-facing dreaming config to `enabled` plus optional `frequency`, treat phases as implementation detail in docs/UI, and keep the shell animation visible above diary content..
- Prompt caching: keep prompt prefixes more reusable across transport fallback, deterministic MCP tool ordering, compaction, embedded image history, normalized system-prompt fingerprints, `kibo status --verbose` cache diagnostics, and the removal of duplicate in-band tool inventories from agent system prompts so follow-up turns hit cache more reliably. (#58036, #58037, #58038, #59054, #60603, #60691) and.
- Agents/cache: diagnostics: add prompt-cache break diagnostics, trace live cache scenarios through embedded runner paths, and show cache reuse explicitly in `kibo status --verbose`..
- Agents/cache: stabilize cache-relevant system prompt fingerprints by normalizing equivalent structured prompt whitespace, line endings, hook-added system context, and runtime capability ordering so semantically unchanged prompts reuse KV/cache more reliably..
- Agents/tool prompts: remove the duplicate in-band tool inventory from agent system prompts so tool-calling models rely on the structured tool definitions as the single source of truth, improving prompt stability and reducing stale tool guidance.
- Config/schema: enrich the exported `kibo config schema` JSON Schema with field titles and descriptions so editors, agents, and other schema consumers receive the same config help metadata..
- Matrix/exec approvals: clarify unavailable-approval replies so Matrix no longer claims chat approvals are unsupported when native exec approvals are merely unconfigured..
- Providers/OpenAI Codex: add forward-compat `openai-codex/gpt-5.4-mini` synthesis across provider runtime, model catalog, and model listing so Codex mini works before bundled Pi catalog updates land.
- Providers/OpenAI: add an opt-in GPT personality and move GPT-5 prompt tuning onto provider-owned system-prompt contributions so cache-stable guidance stays above the prompt cache boundary and embedded runner paths reuse the same provider-specific prompt behavior.
- Docs/IRC: replace public IRC hostname examples with `irc.example.com` and recommend private servers for bot coordination while listing common public networks for intentional use.
- Memory/dreaming: group nearby daily-note lines into short coherent chunks before staging them for dreaming, so one-off context from recent notes reaches REM/deep with better evidence and less line-level noise.
- Memory/dreaming: drop generic date/day headings from daily-note chunk prefixes while keeping meaningful section labels, so staged snippets stay cleaner and more reusable..
- Plugins/Kibo Shell: run bundled Kibo Shell workflows in process instead of spawning the external CLI, reducing transport overhead and unblocking native runtime integration..
- Plugins/Kibo Shell: harden managed resume validation so invalid TaskFlow resume calls fail earlier, and memoize embedded runtime loading per runner while keeping failed loads retryable..
- Agents/bootstrap: add opt-in `agents.defaults.contextInjection: "continuation-skip"` so safe continuation turns can skip workspace bootstrap re-injection, while heartbeat runs and post-compaction retries still rebuild context when needed. Fixes #9157..

### Fixes

- Control UI/chat: show `/tts` and other local audio-only slash replies in webchat by embedding local audio in the assistant message and rendering `<audio>` controls instead of dropping empty-text finals. Fixes #61564..
- Security: preserve restrictive plugin-only tool allowlists, require owner access for `/allowlist add` and `/allowlist remove`, fail closed when `before_tool_call` hooks crash, block browser SSRF redirect bypasses earlier, and keep non-interactive auth-choice inference scoped to bundled and already-trusted plugins. (#58476, #59836, #59822, #58771, #59120) and.
- Providers/OpenAI: make GPT-5 and Codex runs act sooner with lower-verbosity defaults, visible progress during tool work, and a one-shot retry when a turn only narrates the plan instead of taking action.
- Providers/OpenAI and reply delivery: preserve native `reasoning.effort: "none"` and strict schemas where supported, add GPT-5.4 assistant `phase` metadata across replay and the Gateway `/v1/responses` layer, and keep commentary buffered until `final_answer` so web chat, session previews, embedded replies, and Telegram partials stop leaking planning text. Fixes #59150, #59643, #61282.
- Telegram: fix current-model checks in the model picker, HTML-format non-default `/model` confirmations, explicit topic replies, persisted reaction ownership across restarts, caption-media placeholder and `file_id` preservation on download failure, and upgraded-install inbound image reads. (#60384, #60042, #59634, #59207, #59948, #59971), and.
- Telegram: restore DM voice-note preflight transcription so direct-message audio stops arriving as raw `<media:audio>` placeholders..
- Telegram/reasoning: only create a Telegram reasoning preview lane when the session is explicitly `reasoning:stream`, so hidden `<think>` traces from streamed replies stop surfacing as chat previews on normal sessions..
- Telegram/native command menu: trim long menu descriptions before dropping commands so sub-100 command sets can still fit Telegram's payload budget and keep more `/` entries visible..
- Telegram/startup: bound `deleteWebhook`, `getMe`, and `setWebhook` startup requests while keeping the longer `getUpdates` poll timeout, so wedged Telegram control-plane calls stop hanging startup indefinitely..
- Agents/failover: classify Anthropic "extra usage" exhaustion as billing so same-turn model fallback still triggers when Claude blocks long-context requests on usage limits..
- Discord: keep REST, webhook, and monitor traffic on the configured proxy, preserve component-only media sends, honor `@everyone` and `@here` mention gates, keep ACK reactions on the active account, and split voice connect/playback timeouts so auto-join is more reliable. (#57465, #60361, #60345).
- Discord/reply tags: strip leaked `[[reply_to_current]]` control tags from preview text and honor explicit reply-tag threading during final delivery, so Discord replies stay attached to the triggering message instead of printing reply metadata into chat.
- Discord/replies: replace the unshipped `replyToOnlyWhenBatched` flag with `replyToMode: "batched"` so native reply references only attach on debounced multi-message turns while explicit reply tags still work.
- Discord/image generation: include the real generated `MEDIA:` paths in tool output, avoid duplicate plain-output media requeueing, and persist volatile workspace-generated media into durable outbound media before final reply delivery so generated image replies stop pointing at missing local files.
- Slack: route live DM replies back to the concrete inbound DM channel while keeping persisted routing metadata user-scoped, so normal assistant replies stop disappearing when pairing and system messages still arrive..
- WhatsApp: restore `channels.whatsapp.blockStreaming` and reset watchdog timeouts after reconnect so quiet chats stop falling into reconnect loops. (#60007, #60069) and.
- Android/Talk Mode: cancel in-flight `talk.speak` playback when speech is explicitly stopped, and restore spoken replies on both node-scoped and gateway-backed sessions by keeping reply routing and embedded transport overrides aligned with the current playback path. (#60306, #61164, #61214)
- Voice-call/OpenAI: pass full plugin config into realtime transcription provider resolution so streaming calls can discover the bundled OpenAI realtime transcription provider again. Fixes #60936. and.
- Matrix/exec approvals: anchor seeded approval reactions to the primary Matrix prompt event, resolve them from event metadata instead of prompt text, and clean up chunked approval prompts correctly..
- Matrix: recover more reliably when secret storage or recovery keys are missing by recreating secret storage during repair and backup reset, hold crypto snapshot locks during persistence, and surface explicit too-large attachment markers. (#59846, #59851, #60599, #60289), and.
- Matrix/DM sessions: add `channels.matrix.dm.sessionScope`, shared-session collision notices, and aligned outbound session reuse so separate Matrix DM rooms can keep distinct context when configured..
- Matrix: move legacy top-level `avatarUrl` into the default account during multi-account promotion and keep env-backed account setup avatar config persisted..
- MS Teams: download inline DM images via Graph API and preserve channel reply threading in proactive fallback. (#52212, #55198) and.
- MS Teams: replace the deprecated Teams SDK HttpPlugin stub with `httpServerAdapter` so recurring gateway deprecation warnings stop firing and the Express 5 compatibility workaround stays on the supported SDK path..
- Control UI/chat: add a per-session thinking-level picker in the chat header and mobile chat settings, and keep the browser bundle on UI-local thinking/session-key helpers so Safari no longer crashes on Node-only imports before rendering chat controls.
- Sandbox/SSH: reject hardlinked files during cross-device rename fallback so EXDEV file copies preserve the same pinned file-boundary checks as direct reads.
- Control UI: keep Stop visible during tool-only execution, preserve pending-send busy state, and clear stale KiboHub search results as soon as the query changes. (#54528, #59800, #60267) and.
- Control UI/avatar: honor `ui.assistant.avatar` when serving `/avatar/:agentId` so Appearance UI avatar paths stop falling back to initials placeholders..
- Control UI/cron: highlight the Cron refresh button while refresh is in flight so the page's loading state stays visible even when prior data remains on screen..
- Control UI/Overview: prevent gateway access token/password visibility toggle buttons from overlapping their inputs at narrow widths..
- Auto-reply: unify reply lifecycle ownership across preflight compaction, session rotation, CLI-backed runs, and gateway restart handling so `/stop` and same-session overlap checks target the right active turn and restart-interrupted turns return the restart notice instead of being silently dropped..
- Reply delivery: prevent duplicate block replies on `text_end` channels so providers that emit explicit text-end boundaries no longer double-send the same final message.
- Gateway/startup: default `gateway.mode` to `local` when unset, detect PID recycling in gateway lock files on Windows and macOS, and show startup progress so healthy restarts stop getting blocked by stale locks. (#54801, #60085, #59843) and.
- Gateway/macOS: let launchd `KeepAlive` own in-process gateway restarts again, adding a short supervised-exit delay so rapid restarts avoid launchd crash-loop unloads while `kibo gateway restart` still reports real LaunchAgent errors synchronously.
- Gateway/macOS: re-bootstrap the LaunchAgent if `launchctl kickstart -k` unloads it during restart so failed restarts do not leave the gateway unmanaged until manual repair.
- Gateway/macOS: recover installed-but-unloaded LaunchAgents during `kibo gateway start` and `restart`, while still preferring live unmanaged gateways during restart recovery..
- Gateway/Windows scheduled tasks: preserve Task Scheduler settings on reinstall, fail loudly when `/Run` does not start, and report fast failed restarts accurately instead of pretending they timed out after 60 seconds..
- Windows/restart: fall back to the installed Startup-entry launcher when the scheduled task was never registered, so `/restart` can relaunch the gateway on Windows setups where `schtasks` install fell back during onboarding..
- Windows/restart: clean up stale gateway listeners before Windows self-restart and treat listener and argv probe failures as inconclusive, so scheduled-task relaunch no longer falls into an `EADDRINUSE` retry loop..
- Update/npm: prefer the npm binary that owns the installed global Kibo prefix so mixed Homebrew-plus-nvm setups update the right install..
- Agents/music and video generation: add `tools.media.asyncCompletion.directSend` as an opt-in direct-delivery path for finished async media tasks, while keeping the legacy requester-session wake/model-delivery flow as the default.
- CLI/skills JSON: route `skills list --json`, `skills info --json`, and `skills check --json` output to stdout instead of stderr so machine-readable consumers receive JSON on the expected stream again. (#60914; fixes #57599; landed from contributor PR #57611 by).
- CLI/Commander: preserve Commander-computed exit codes for argument and help-error paths, and cover the user-argv parse mode in the regression tests so invalid CLI invocations no longer report success when exits are intercepted..
- Cron: replay interrupted recurring jobs on the first gateway restart instead of waiting for a second restart..
- Cron: send failure notifications through the job's primary delivery channel using the same session context as successful delivery when no explicit `failureDestination` is configured..
- Exec/remote skills: stop advertising `exec host=node` when the current exec policy cannot route to a node, and clarify blocked exec-host override errors with both the requested host and allowed config path.
- Agents/Claude CLI/security: clear inherited Claude Code config-root and plugin-root env overrides like `CLAUDE_CONFIG_DIR` and `CLAUDE_CODE_PLUGIN_*`, so Kibo-launched Claude CLI runs cannot be silently pointed at an alternate Claude config/plugin tree with different hooks, plugins, or auth context..
- Agents/Claude CLI/security: clear inherited Claude Code provider-routing and managed-auth env overrides, and mark Kibo-launched Claude CLI runs as host-managed, so Claude CLI backdoor sessions cannot be silently redirected to proxy, Bedrock, Vertex, Foundry, or parent-managed token contexts..
- Agents/Claude CLI/security: force host-managed Claude CLI backdoor runs to `--setting-sources user`, even under custom backend arg overrides, so repo-local `.claude` project/local settings, hooks, and plugin discovery do not silently execute inside non-interactive Kibo sessions..
- Agents/Claude CLI: treat malformed bare `--permission-mode` backend overrides as missing and fail safe back to `bypassPermissions`, so custom `cliBackends.claude-cli.args` security config cannot accidentally consume the next flag as a bogus permission mode..
- Gateway/device pairing: require non-admin paired-device sessions to manage only their own device for token rotate/revoke and paired-device removal, blocking cross-device token theft inside pairing-scoped sessions..
- Gateway/plugin routes: keep gateway-auth plugin runtime routes on write-only fallback scopes unless a trusted-proxy caller explicitly declares narrower `x-kibo-scopes`, so plugin HTTP handlers no longer mint admin-level runtime scopes on missing or untrusted HTTP scope headers..
- Build/types: fix the Node `createRequire(...)` helper typing so provider-runtime lazy loads compile cleanly again and `pnpm build` no longer fails in the Pi embedded provider error-pattern path.
- Gateway/security: scope loopback browser-origin auth throttling by normalized origin so one localhost Control UI tab cannot lock out a different localhost browser origin after repeated auth failures.
- Gateway/auth: serialize async shared-secret auth attempts per client so concurrent Tailscale-capable failures cannot overrun the intended auth rate-limit budget..
- Device pairing/security: keep non-operator device scope checks bound to the requested role prefix so bootstrap verification cannot redeem `operator.*` scopes through `node` auth..
- Device pairing: reject rotating device tokens into roles that were never approved during pairing, and keep reconnect role checks bounded to the paired device's approved role set..
- Gateway/device auth: reuse cached device-token scopes only for cached-token reconnects, while keeping explicit `deviceToken` scope requests and empty-cache fallbacks intact so reconnects preserve `operator.read` without breaking explicit auth flows..
- Mobile pairing/security: fail closed for internal `/pair` setup-code issuance, cleanup, and approval paths when gateway pairing scopes are missing, and keep approval-time requested-scope enforcement on the internal command path..
- Mobile pairing/bootstrap: keep QR bootstrap handoff tokens bounded to the mobile-safe contract so node handoff stays unscoped and operator handoff drops mixed `node.*`, `operator.admin`, and `operator.pairing` scopes.
- Mobile pairing/Android: tighten secure endpoint handling so Tailscale and public remote setup reject cleartext endpoints, private LAN pairing still works, merged-role approvals mint both node and operator device tokens, and bootstrap tokens survive node auto-pair until operator approval finishes. (#60128, #60208, #60221).
- Android/canvas security: require exact normalized A2UI URL matches before forwarding canvas bridge actions, rejecting query mismatches and descendant paths while still allowing fragment-only A2UI navigation.
- Synology Chat/security: default low-level HTTPS helper TLS verification to on so helper/API defaults match the shipped safe account default, and only explicit `allowInsecureSsl: true` opts out.
- Synology Chat/security: route webhook token comparison through the shared constant-time secret helper for consistency with other bundled plugins.
- Plugins/marketplace: block remote marketplace symlink escapes without breaking ordinary local marketplace install paths..
- Telegram/local Bot API: honor `channels.telegram.apiRoot` for buffered media downloads, add `channels.telegram.network.dangerouslyAllowPrivateNetwork` for trusted fake-IP setups, and require `channels.telegram.trustedLocalFileRoots` before reading absolute Bot API `file_path` values. (#59544, #60705) and.
- Outbound/sanitizer: strip leaked `<tool_call>`, `<function_calls>`, and model special tokens from shared user-visible assistant text, including truncated tool-call streams, so internal scaffolding no longer bleeds into replies across surfaces..
- Agents/errors: surface an explicit disk-full message when local session or transcript writes fail with `ENOSPC`/`disk full`, so those runs stop degrading into opaque `NO_REPLY`-style failures..
- Exec approvals: remove heuristic command-obfuscation gating from host exec so gateway and node runs rely on explicit policy, allowlist, and strict inline-eval rules only.
- Agents/tool results: cap live tool-result persistence and overflow-recovery truncation at 40k characters so oversized tool output stays bounded without discarding recent context entirely.
- Discord/video replies: split text-plus-video deliveries into a text reply followed by a media-only send, and let live provider auth checks honor manifest-declared API key env vars like `MODELSTUDIO_API_KEY`.
- Config/All Settings: keep the raw config view intact when sensitive fields are blank instead of corrupting or dropping the rendered snapshot..
- Plugin SDK/facades: back-fill bundled plugin facade sentinels before plugin-id tracking re-enters config loading, so CLI/provider startup no longer crashes with `shouldNormalizeGoogleProviderConfig is not a function` or other empty-facade reads during bundled plugin re-entry..
- Plugins/facades: back-fill facade sentinels before tracked-plugin resolution re-enters config loading, so facade exports stay defined during circular provider normalization..
- QA lab: restore typed mock OpenAI gateway config wiring so QA-lab config helpers compile cleanly again and `pnpm check` / `pnpm build` stay green.
- Discord/image generation: include the real generated `MEDIA:` paths in tool output and avoid duplicate plain-output media requeueing so Discord image replies stop pointing at missing local files.
- Slack: route live DM replies back to the concrete inbound DM channel while keeping persisted routing metadata user-scoped, so normal assistant replies stop disappearing when pairing and system messages still arrive..
- Discord/reply tags: strip leaked `[[reply_to_current]]` control tags from preview text and honor explicit reply-tag threading during final delivery, so Discord replies stay attached to the triggering message instead of printing reply metadata into chat.
- Telegram: fix current-model checks in the model picker, HTML-format non-default `/model` confirmations, explicit topic replies, persisted reaction ownership across restarts, caption-media placeholder and `file_id` preservation on download failure, and upgraded-install inbound image reads. (#60384, #60042, #59634, #59207, #59948, #59971), and.
- Telegram: restore DM voice-note preflight transcription so direct-message audio stops arriving as raw `<media:audio>` placeholders..
- Telegram/reasoning: only create a Telegram reasoning preview lane when the session is explicitly `reasoning:stream`, so hidden `<think>` traces from streamed replies stop surfacing as chat previews on normal sessions..
- Telegram/native command menu: trim long menu descriptions before dropping commands so sub-100 command sets can still fit Telegram's payload budget and keep more `/` entries visible..
- Feishu/reasoning: only expose streamed reasoning previews when the session is explicitly `reasoning:stream`, so hidden reasoning traces do not surface on normal streaming sessions..
- Discord: keep REST, webhook, and monitor traffic on the configured proxy, preserve component-only media sends, honor `@everyone` and `@here` mention gates, keep ACK reactions on the active account, and split voice connect/playback timeouts so auto-join is more reliable. (#57465, #60361, #60345).
- WhatsApp: restore `channels.whatsapp.blockStreaming` and reset watchdog timeouts after reconnect so quiet chats stop falling into reconnect loops. (#60007, #60069) and.
- Browser/security: re-run SSRF safety checks after interaction-driven navigations and before snapshot reads so click, submit, keyboard, and current-page snapshot flows fail closed on disallowed destinations..
- Memory: keep `memory-core` builtin embedding registration on the already-registered path so selecting `memory-core` no longer recurses through plugin discovery and crashes during startup..
- Agents/tool results: keep large `read` outputs visible longer, preserve the latest `read` output when older tool output can absorb the overflow budget, and fall back to Pi's normal overflow compaction/retry path before replacing a fresh `read` with a compacted stub..
- Memory/QMD: prefer modern `qmd collection add --glob`, accept newer single-line JSON hit metadata while keeping legacy line fields, refresh QMD docs/doctor install guidance and model-override guidance, and keep older QMD releases working..
- MS Teams: download inline DM images via Graph API and preserve channel reply threading in proactive fallback. (#52212, #55198) and.
- MS Teams: replace the deprecated Teams SDK HttpPlugin stub with `httpServerAdapter` so recurring gateway deprecation warnings stop firing and the Express 5 compatibility workaround stays on the supported SDK path..
- Matrix/exec approvals: anchor seeded approval reactions to the primary Matrix prompt event, resolve them from event metadata instead of prompt text, and clean up chunked approval prompts correctly..
- Matrix: recover more reliably when secret storage or recovery keys are missing by recreating secret storage during repair and backup reset, hold crypto snapshot locks during persistence, and surface explicit too-large attachment markers. (#59846, #59851, #60599, #60289), and.
- Android/Talk Mode: cancel in-flight `talk.speak` playback when speech is explicitly stopped, so stale replies stop starting after barge-in or manual stop..
- Android/Talk Mode: restore spoken assistant replies on node-scoped sessions by keeping reply routing synced to the resolved node session key and pausing mic capture during reply playback..
- Android/Talk Mode: restore voice replies on gateway-backed talk mode sessions by updating embedded runner transport overrides to the current agent transport API..
- Voice-call/OpenAI: pass full plugin config into realtime transcription provider resolution so streaming calls can discover the bundled OpenAI realtime transcription provider again. Fixes #60936. and.
- Control UI/chat: add a per-session thinking-level picker in the chat header and mobile chat settings, and keep the browser bundle on UI-local thinking/session-key helpers so Safari no longer crashes on Node-only imports before rendering chat controls.
- Control UI: keep Stop visible during tool-only execution, preserve pending-send busy state, and clear stale KiboHub search results as soon as the query changes. (#54528, #59800, #60267) and.
- Control UI/avatar: honor `ui.assistant.avatar` when serving `/avatar/:agentId` so Appearance UI avatar paths stop falling back to initials placeholders..
- Control UI/cron: highlight the Cron refresh button while refresh is in flight so the page's loading state stays visible even when prior data remains on screen..
- Control UI/Overview: prevent gateway access token/password visibility toggle buttons from overlapping their inputs at narrow widths..
- CLI/skills JSON: route `skills list --json`, `skills info --json`, and `skills check --json` output to stdout instead of stderr so machine-readable consumers receive JSON on the expected stream again. (#60914; fixes #57599; landed from contributor PR #57611 by).
- CLI/Commander: preserve Commander-computed exit codes for argument and help-error paths, and cover the user-argv parse mode in the regression tests so invalid CLI invocations no longer report success when exits are intercepted..
- Cron: replay interrupted recurring jobs on the first gateway restart instead of waiting for a second restart..
- Cron: send failure notifications through the job's primary delivery channel using the same session context as successful delivery when no explicit `failureDestination` is configured..
- Live model switching: only treat explicit user-driven model changes as pending live switches, so fallback rotation, heartbeat overrides, and compaction no longer trip `LiveSessionModelSwitchError` before making an API call..
- Exec approvals: reuse durable exact-command `allow-always` approvals in allowlist mode so identical reruns stop prompting, and tighten Windows interpreter/path approval handling so wrapper and malformed-path cases fail closed more consistently. (#59880, #59780, #58040, #59182), and.
- Node exec approvals: keep node-host `system.run` approvals bound to the prepared execution plan across async forwarding, so mutable script operands still get approval-time binding and drift revalidation instead of dropping back to unbound execution.
- Agents/exec approvals: let `exec-approvals.json` agent security override stricter gateway tool defaults so approved subagents can use `security: “full”` without falling back to allowlist enforcement again..
- Agents/exec: restore `host=node` routing for node-pinned and `host=auto` sessions, while still blocking sandboxed `auto` sessions from jumping to gateway..
- Exec/heartbeat: use the canonical `exec-event` wake reason for `notifyOnExit` so background exec completions still trigger follow-up turns when `HEARTBEAT.md` is empty or comments-only..
- Heartbeat: skip wake delivery when the target session lane is already busy so the pending event is retried instead of getting drained too early..
- Group chats/agent prompts: tell models to minimize empty lines and use normal chat-style spacing so group replies avoid document-style blank-line formatting.
- Providers/OpenAI GPT: treat short approval turns like `ok do it` and `go ahead` as immediate action turns, and trim overly memo-like GPT-5 chat confirmations so OpenAI replies stay shorter and more conversational by default.
- Providers/OpenAI Codex: split native `contextWindow` from runtime `contextTokens`, keep the default effective cap at `272000`, and expose a per-model `contextTokens` override on `models.providers.*.models[]`.
- Providers/OpenAI-compatible WS: compute fallback token totals from normalized usage when providers omit or zero `total_tokens`, so DashScope-compatible sessions stop storing zero totals after alias normalization..
- Agents/OpenAI: mark Claude-compatible file tool schemas as `additionalProperties: false` so direct OpenAI GPT-5 routes stop rejecting the `read` tool with invalid strict-schema errors.
- Agents/OpenAI: fall back to `strict: false` for native OpenAI tool calls when a tool schema is not strict-compatible, and normalize empty-object tool schemas to include `required: []`, so direct GPT-5 routes stop failing with invalid strict-schema errors like missing `path` in `required`.
- Agents/GPT: add explicit work-item lifecycle events for embedded runs, use them to surface real progress more reliably, and stop counting tool-started turns as planning-only retries.
- Plugins/OpenAI: enable `gpt-image-1` reference-image edits through `/images/edits` multipart uploads, and stop inferring unsupported resolution overrides when no explicit `size` or `resolution` is provided.
- Agents/replay: remove the malformed assistant-content canonicalization repair from replay history sanitization instead of extending that legacy repair path into replay validation.
- Plugins/OpenAI: tune the OpenAI prompt overlay for live-chat cadence so GPT replies stay shorter, more human, and less wall-of-text by default.
- Providers/compat: stop forcing OpenAI-only defaults on proxy and custom OpenAI-compatible routes, preserve native vendor-specific reasoning/tool/streaming behavior across Anthropic-compatible, Moonshot, Mistral, ModelStudio, OpenRouter, xAI, and Z.ai endpoints, and route GitHub Copilot Claude models through Anthropic Messages instead of OpenAI Responses.
- Providers/GitHub Copilot: send IDE identity headers on runtime model requests and GitHub token exchange so IDE-authenticated Copilot runs stop failing with missing `Editor-Version`. and.
- Providers/OpenRouter failover: classify `403 “Key limit exceeded”` spending-limit responses as billing so model fallback continues instead of stopping on generic auth..
- Providers/Anthropic: keep `claude-cli/*` auth on live Claude CLI credentials at runtime, avoid persisting stale bearer-token profiles, and suppress macOS Keychain prompts during non-interactive Claude CLI setup..
- Providers/Anthropic: when Claude CLI auth becomes the default, write a real `claude-cli` auth profile so local and gateway agent runs can use Claude CLI immediately without missing-API-key failures..
- Memory/dreaming: make Dreams config reads and writes respect the selected memory slot plugin (including `doctor.memory.status` and Control UI fallback state) instead of always targeting `memory-core`..
- Providers/Anthropic Vertex: honor `cacheRetention: “long”` with the real 1-hour prompt-cache TTL on Vertex AI endpoints, and default `anthropic-vertex` cache retention like direct Anthropic..
- Agents/Anthropic: preserve native `toolu_*` replay ids on direct Anthropic and Anthropic Vertex paths so cache-sensitive history stops rewriting known-valid Anthropic tool-use ids.
- Providers/Google: add model-level `cacheRetention` support for direct Gemini system prompts by creating, reusing, and refreshing `cachedContents` automatically on Google AI Studio runs..
- Google Gemini CLI auth: detect bundled npm installs by scanning packaged bundle files for the Gemini OAuth client config, so `npm install -g/gemini-cli` layouts work again..
- Google Gemini CLI auth: detect personal OAuth mode from local Gemini settings and skip Code Assist project discovery for those logins, so personal Google accounts stop failing with `loadCodeAssist 400 Bad Request`..
- Google Gemini CLI auth: improve OAuth credential discovery across Windows nvm and Homebrew libexec installs, and align Code Assist metadata so Gemini login stops failing on packaged CLI layouts..
- Google Gemini CLI models: add forward-compat support for stable `gemini-2.5-*` model ids by letting the bundled CLI provider clone them from Google templates, so `gemini-2.5-flash-lite` and related configured models stop showing up as missing..
- Google image generation: disable pinned DNS for Gemini image requests and honor explicit `pinDns` overrides in shared provider HTTP helpers so proxy-backed image generation works again..
- Providers/Microsoft Foundry: preserve explicit image capability on normalized Foundry deployments, repair stale GPT/o-series text-only model metadata across gateway and runtime paths, and keep unknown fallback models from borrowing unrelated image support.
- Providers/Model Studio: preserve native streaming usage reporting for DashScope-compatible endpoints even when they are configured under a generic provider key, so streamed token totals stop sticking at zero..
- Providers/Z.AI: preserve explicitly registered `glm-5-*` variants like `glm-5-turbo` instead of intercepting them with the generic GLM-5 forward-compat shim..
- Amazon Bedrock/aws-sdk auth: stop injecting the fake `AWS_PROFILE` apiKey marker when no AWS auth env vars exist, so instance-role and other default-chain setups keep working without poisoning provider config..
- Agents/Kimi tool-call repair: preserve tool arguments that were already present on streamed tool calls when later malformed deltas fail reevaluation, while still dropping stale repair-only state before `toolcall_end`.
- Plugins/Kimi Coding: parse tagged tool calls and keep Anthropic-native tool payloads so Kimi coding endpoints execute tools instead of echoing raw markup. (#60051, #60391) and.
- Media understanding: auto-register image-capable config providers for vision routing, so custom GLM-style provider ids with image models stop failing with “no media-understanding provider registered”..
- Plugins/media understanding: enable bundled Groq and Deepgram providers by default so configured transcription models work without extra plugin activation config..
- MiniMax/pricing: keep bundled MiniMax highspeed pricing distinct in provider catalogs and preserve the lower M2.5 cache-read pricing when onboarding older MiniMax models..
- MiniMax: advertise image input on bundled `MiniMax-M2.7` and `MiniMax-M2.7-highspeed` model definitions so image-capable flows can route through the M2.7 family correctly..
- Models/MiniMax: honor `MINIMAX_API_HOST` for implicit bundled MiniMax provider catalogs so China-hosted API-key setups pick `api.minimaxi.com/anthropic` without manual provider config..
- Usage/MiniMax: invert remaining-style `usage_percent` fields when MiniMax reports only remaining percentage data, so usage bars stop showing nearly-full remaining quota as nearly-exhausted usage..
- Usage/MiniMax: let usage snapshots treat `minimax-portal` and MiniMax CN aliases as the same MiniMax quota surface, and prefer stored MiniMax OAuth before falling back to Coding Plan keys.
- Usage/MiniMax: prefer the chat-model `model_remains` entry and derive Coding Plan window labels from MiniMax interval timestamps so MiniMax usage snapshots stop picking zero-budget media rows and misreporting 4h windows as `5h`..
- Model picker/providers: treat bundled BytePlus and Volcengine plan aliases as their native providers during setup, and expose their bundled standard/coding catalogs before auth so setup can suggest the right models..
- Tools/web_search (Kimi): when `tools.web.search.kimi.baseUrl` is unset, inherit native Moonshot chat `baseUrl` (`.ai` / `.cn`) so China console keys authenticate on the same host as chat. Fixes #44851..
- Agents/Claude CLI: keep non-interactive `--permission-mode bypassPermissions` when custom `cliBackends.claude-cli.args` override defaults, including fallback resolution before the runtime plugin registry is active, so cron and heartbeat Claude CLI runs do not regress to interactive approval mode. and.
- Agents/Claude CLI: persist explicit `kibo agent --session-id` runs under a stable session key so follow-ups can reuse the stored CLI binding and resume the same underlying Claude session.
- Agents/Claude CLI: persist routed Claude session bindings, rotate them on `/new` and `/reset`, and keep live Claude CLI model switches moving across the configured Claude family so resumed sessions follow the real active thread and model..
- Agents/CLI backends: invalidate stored CLI session reuse when local CLI login state or the selected auth profile credential changes, so relogin and token rotation stop resuming stale sessions.
- Agents/Claude CLI/images: reuse stable hydrated image file paths and preserve shared media extensions like HEIC when passing image refs to local CLI runs, so Claude CLI image prompts stop thrashing KV cache prefixes and oddball image formats do not fall back to `.bin`..
- Agents/compaction: keep assistant tool calls and displaced tool results in the same compaction chunk so strict summarization providers stop rejecting orphaned tool pairs..
- Agents/failover: scope Anthropic `An unknown error occurred` failover matching by provider so generic internal unknown-error text no longer triggers retryable timeout fallback..
- Agents/subagents: honor allowlist validation, auth-profile handoff, and session override state when a subagent retries after `LiveSessionModelSwitchError`..
- Agents/runtime: make default subagent allowlists, inherited skills/workspaces, and duplicate session-id resolution behave more predictably, and include value-shape hints in missing-parameter tool errors. (#59944, #59992, #59858, #55317), and.
- Agents/pairing: merge completion announce delivery context with the requester session fallback so missing `to` still reaches the original channel, and include `operator.talk.secrets` in CLI default operator scopes for node-role device pairing approvals..
- Agents/scheduling: steer background-now work toward automatic completion wake and treat `process` polling as on-demand inspection or intervention instead of default completion handling..
- Agents/skills: skip `.git` and `node_modules` when mirroring skills into sandbox workspaces so read-only sandboxes do not copy repo history or dependency trees..
- ACP/agents: inherit the target agent workspace for cross-agent ACP spawns and fall back safely when the inherited workspace no longer exists..
- ACPX/Windows: preserve backslashes and absolute `.exe` paths in Claude CLI parsing, and fail fast on wrapper-script targets with guidance to use `cmd.exe /c`, `powershell.exe -File`, or `node <script>`..
- Auth/failover: persist selected fallback overrides before retrying, shorten `auth_permanent` lockouts, and refresh websocket/shared-auth sessions only when real auth changes occur so retries and secret rotations behave predictably. (#60404, #60323, #60387) and.
- Gateway/channels: pin the initial startup channel registry before later plugin-registry churn so configured channels stay visible and `channels.status` stops falling back to empty `channelOrder` / `channels` payloads after runtime plugin loads.
- Prompt caching: order stable workspace project-context files before `HEARTBEAT.md` and keep `HEARTBEAT.md` below the system-prompt cache boundary so heartbeat churn does not invalidate the stable project-context prefix. and.
- Prompt caching: route Codex Responses and Anthropic Vertex through boundary-aware cache shaping, and report the actual outbound system prompt in cache traces so cache reuse and misses line up with what providers really receive..
- Agents/cache: preserve the full 3-turn prompt-cache image window across tool loops, keep colliding bundled MCP tool definitions deterministic, and reapply Anthropic Vertex cache shaping after payload hook replacements so KV/cache reuse stays stable..
- Status/cache: restore `cacheRead` and `cacheWrite` in transcript fallback so `/status` keeps showing cache hit percentages when session logs are the only complete usage source..
- Status/usage: let `/status` and `session_status` fall back to transcript token totals when the session meta store stayed at zero, so LM Studio, Ollama, DashScope, and similar OpenAI-compatible providers stop showing `Context: 0/...`..
- Mattermost/config schema: accept `groups.*.requireMention` again so existing Mattermost configs no longer fail strict validation after upgrade..
- Doctor/config: compare normalized `talk` configs by deep structural equality instead of key-order-sensitive serialization so `kibo doctor --fix` stops repeatedly reporting/applying no-op `talk.provider/providers` normalization..
- Anthropic CLI onboarding: rewrite migrated fallback model refs during non-interactive Claude CLI setup too, so onboarding and scripted setup no longer keep stale `anthropic/*` fallbacks after switching the primary model to `claude-cli/*`..
- Models/Anthropic CLI auth: replace migrated `agents.defaults.models` allowlists when `kibo models auth login --provider anthropic --method cli --set-default` switches to `claude-cli/*`, so stale `anthropic/*` entries do not linger beside the migrated Claude CLI defaults..
- Doctor/Claude CLI: add dedicated Claude CLI health checks so `kibo doctor` can spot missing local installs or broken auth before agent runs fail..
- Plugins/auth-choice: apply provider-owned auth config patches without recursively preserving replaced default-model maps, so Anthropic Claude CLI and similar migrations can intentionally swap model allowlists during onboarding and setup instead of accumulating stale entries..
- Plugins/onboarding: write dotted plugin uiHint paths like Brave `webSearch.mode` as nested plugin config so `llm-context` setup stops failing validation..
- Plugins/install: preserve unsafe override flags across linked plugin and hook-pack probes so local `--link` installs honor the documented override behavior..
- Plugins/cache: inherit the active gateway workspace for provider, web-search, and web-fetch snapshot loads when callers omit `workspaceDir`, so compatible plugin registries and snapshot caches stop missing on gateway-owned runtime paths..
- Plugin SDK/context engines: export the missing context-engine result and subagent lifecycle types from `kibo/plugin-sdk` so context engine plugins can type `ContextEngine` implementations without local workarounds..
- Tasks/maintenance: reconcile stale cron and chat-backed CLI task rows against live cron-job and agent-run ownership instead of treating any persisted session key as proof that the task is still running..
- Plugins: suppress trust-warning noise during non-activating snapshot and CLI metadata loads..
- Agents/video generation: accept `agents.defaults.videoGenerationModel` in strict config validation and `kibo config set/get`, so gateways using `video_generate` no longer fail to boot after enabling a video model.
- Matrix/streaming: add a quiet preview mode for streamed Matrix replies, keep legacy `partial` preview-first behavior, and finalize quiet media captions correctly so previews stop notifying early without dropping final text semantics..
- Agents/compaction: skip redundant partial summarization when no messages were oversized, so the same transcript is not summarized twice after a full summarization failure. Fixes #61465..
- Gateway/shutdown: bound websocket-server shutdown even when no tracked clients remain, so gateway restarts stop hanging until the watchdog kills the process..
- Control UI/multilingual: localize the remaining shared channel, instances, nodes, and gateway-confirmation strings so the dashboard stops mixing translated UI with hardcoded English labels..
- Discord/media: raise the default inbound and outbound media cap to `100MB` so Discord matches Telegram more closely and larger attachments stop failing on the old low default.
- Matrix: keep direct transport requests on the pinned dispatcher by routing them through undici runtime fetch, so Matrix clients resume syncing on newer runtimes without dropping the validated address binding..
- Plugins/facades: resolve globally installed bundled-plugin runtime facades from registry roots so bundled channels like LINE still boot when the winning plugin install lives under the global extensions directory with an encoded scoped folder name..
- Matrix: avoid failing startup when token auth already knows the user ID but still needs optional device metadata, retry transient auth bootstrap requests, and backfill missing device IDs after startup while keeping unknown-device storage reuse conservative until metadata is repaired..
- Agents/exec: stop streaming `tool_execution_update` events after an exec session backgrounds, preventing delayed background output from hitting a stale listener and crashing the gateway while keeping the output available through `process poll/log`..
- Matrix: pass configured `deviceId` through health probes and keep probe-only client setup out of durable Matrix storage, so health checks preserve the correct device identity without rewriting `storage-meta.json` or related probe state on disk..
- Image generation/build: write stable runtime alias files into `dist/` and route provider-auth runtime lookups through those aliases so image-generation providers keep resolving auth/runtime modules after rebuilds instead of crashing on missing hashed chunk files.
- Config/runtime: pin the first successful config load in memory for the running process and refresh that snapshot on successful writes/reloads, so hot paths stop reparsing `kibo.json` between watcher-driven swaps.
- Config/legacy cleanup: stop probing obsolete alternate legacy config names and service labels during local config/service detection, while keeping the active `~/.kibo/kibo.json` path canonical.
- ACP/sessions_spawn: register ACP child runs for completion tracking and lifecycle cleanup, and make registration-failure cleanup explicitly best-effort so callers do not assume an already-started ACP turn was fully aborted. and.
- ACP/tasks: mark cleanly exited ACP runs as blocked when they end on deterministic write or authorization blockers, and wake the parent session with a follow-up instead of falsely reporting success.
- ACPX/runtime: derive the bundled ACPX expected version from the extension package metadata instead of hardcoding a separate literal, so plugin-local ACPX installs stop drifting out of health-check parity after version bumps. and.
- Gateway/auth: make local-direct `trusted-proxy` fallback require the configured shared token instead of silently authenticating same-host callers, while keeping same-host reverse proxy identity-header flows on the normal trusted-proxy path. and.
- Memory/QMD: send MCP `query` collection filters as the upstream `collections` array instead of the legacy singular `collection` field, so mcporter-backed QMD 1.1+ searches still scope correctly after the unified `query` tool migration. and.
- Memory/QMD: keep `qmd embed` active in `search` mode too, so BM25-first setups still build a complete index for later vector and hybrid retrieval. and.
- Memory/QMD: point `QMD_CONFIG_DIR` at the nested `xdg-config/qmd` directory so per-agent collection config resolves correctly. and.
- Memory/QMD: include deduplicated default plus per-agent `memorySearch.extraPaths` when building QMD custom collections, so shared and agent-specific extra roots both get indexed consistently. and.
- Memory/session indexer: include `.jsonl.reset.*` and `.jsonl.deleted.*` transcripts in the memory host session scan while still excluding `.jsonl.bak.*` compaction backups and lock files, so memory search sees archived session history without duplicating stale snapshots. and.
- Agents/sandbox: honor `tools.sandbox.tools.alsoAllow`, let explicit sandbox re-allows remove matching built-in default-deny tools, and keep sandbox explain/error guidance aligned with the effective sandbox tool policy..
- LINE/ACP: add current-conversation binding and inbound binding-routing parity so `/acp spawn ... --thread here`, configured ACP bindings, and active conversation-bound ACP sessions work on LINE like the other conversation channels.
- LINE/markdown: preserve underscores inside Latin, Cyrillic, and CJK words when stripping markdown, while still removing standalone `_italic_` markers on the shared text-runtime path used by LINE and TTS..
- TTS/Microsoft: auto-switch the default Edge voice to Chinese for CJK-dominant text without overriding explicitly selected Microsoft voices..
- Agents/context pruning: count supplementary-plane CJK characters with the shared code-point-aware estimator so context pruning stops underestimating Japanese and Chinese text that uses Extension B ideographs..
- Slack/status reactions: add a reaction lifecycle for queued, thinking, tool, done, and error phases in Slack monitors, with safer cleanup so queued ack reactions stay correct across silent runs, pre-reply failures, and delayed transitions..
- macOS/local gateway: stop Kibo.app from killing healthy local gateway listeners after startup by recognizing the current `kibo-gateway` process title and using the current `kibo gateway` launch shape.
- Gateway/OpenAI compatibility: accept flat Responses API function tool definitions on `/v1/responses` and preserve `strict` when normalizing hosted tools into the embedded runner, so spec-compliant clients like Codex no longer fail validation or silently lose strict tool enforcement. and.
- Memory/QMD: resolve slugified `memory_search` file hints back to the indexed filesystem path before returning search hits, so `memory_get` works again for mixed-case and spaced paths..
- OpenAI/Codex fast mode: map `/fast` to priority processing on native OpenAI and Codex Responses endpoints instead of rewriting reasoning settings, and document the exact endpoint and override behavior.
- Memory/QMD: weight CJK-heavy text correctly when estimating chunk sizes, preserve surrogate-pair characters during fine splits, and keep long Latin lines on the old chunk boundaries so memory indexing produces better-sized chunks for CJK notes..
- Security/LINE: make webhook signature validation run the timing-safe compare even when the supplied signature length is wrong, closing a small timing side-channel..
- LINE/status: stop `kibo status` from warning about missing credentials when sanitized LINE snapshots are already configured, while still surfacing whether the missing field is the token or secret..
- Gateway/health: carry webhook-vs-polling account mode from channel descriptors into runtime snapshots so passive channels like LINE and BlueBubbles skip false stale-socket health failures..
- Agents/MCP: reuse bundled MCP runtimes across turns in the same session, while recreating them when MCP config changes and disposing stale runtimes cleanly on session rollover..
- Memory/QMD: honor `memory.qmd.update.embedInterval` even when regular QMD update cadence is disabled or slower by arming a dedicated embed-cadence maintenance timer, while avoiding redundant timers when regular updates are already frequent enough..
- Memory/QMD: add `memory.qmd.searchTool` as an exact mcporter tool override, so custom QMD MCP tools such as `hybrid_search` can be used without weakening the validated `searchMode` config surface..
- Memory/QMD: keep reset and deleted session transcripts in QMD session export so daily session resets do not silently drop most historical recall from `memory_search`..
- Memory/QMD: rebind collections when QMD reports a changed pattern but omits path metadata, so config pattern changes stop being silently ignored on restart..
- Memory/QMD: warn explicitly when `memory.backend=qmd` is configured but the `qmd` binary is missing, so doctor and runtime fallback no longer fail as a silent builtin downgrade. and.
- Memory/QMD: pass a direct-session key on `kibo memory search` so CLI QMD searches no longer get denied as `session=<none>` under direct-only scope defaults. and.
- Memory/QMD: keep `memory_search` session-hit paths roundtrip-safe when exported session markdown lives under the workspace `qmd/` directory, so `memory_get` can read the exact returned path instead of failing on the generic `qmd/sessions/...` alias. and.
- Agents/memory flush: keep daily memory flush files append-only during embedded attempts so compaction writes do not overwrite earlier notes..
- Web UI/markdown: stop bare auto-links from swallowing adjacent CJK text while preserving valid mixed-script path and query characters in rendered links..
- BlueBubbles/iMessage: coalesce URL-only inbound messages with their link-preview balloon again so sharing a bare link no longer drops the URL from agent context..
- Sandbox/browser: install `fonts-noto-cjk` in the sandbox browser image so screenshots render Chinese, Japanese, and Korean text correctly instead of tofu boxes. Fixes #35597. and.
- Memory/FTS: add configurable trigram tokenization plus short-CJK substring fallback so memory search can find Chinese, Japanese, and Korean text without breaking mixed long-and-short queries..
- Hooks/config: accept runtime channel plugin ids in `hooks.mappings[].channel` (for example `feishu`) instead of rejecting non-core channels during config validation..
- TUI/chat: keep optimistic outbound user messages visible during active runs by deferring local-run binding until the first gateway chat event reveals the real run id, preventing premature history reloads from wiping pending local sends..
- TUI/model picker: keep searchable `/model` and `/models` input mode from hijacking `j`/`k` as navigation keys, and harden width bounds under `m`-filtered model lists so search no longer crashes on long rows..
- Agents/Kimi: preserve already-valid Anthropic-compatible tool call argument objects while still clearing cached repairs when later trailing junk exceeds the repair allowance..
- Docker/setup: force BuildKit for local image builds (including sandbox image builds) so `./docker-setup.sh` no longer fails on `RUN --mount=...` when hosts default to Docker's legacy builder..
- Control UI/agents: auto-load agent workspace files on initial Files panel open, and populate overview model/workspace/fallbacks from effective runtime agent metadata so defaulted models no longer show as `Not set`..
- Control UI/slash commands: make `/steer` and `/redirect` work from the chat command palette with visible pending state for active-run `/steer`, correct redirected-run tracking, and a single canonical `/steer` entry in the command menu..
- Exec/runtime: default implicit exec to `host=auto`, resolve that target to sandbox only when a sandbox runtime exists, keep explicit `host=sandbox` fail-closed without sandbox, and show `/exec` effective host state in runtime status/docs.
- Exec: fail closed when the implicit sandbox host has no sandbox runtime, and stop denied async approval followups from reusing prior command output from the same session..
- Exec/approvals: infer Discord and Telegram exec approvers from existing owner config when `execApprovals.approvers` is unset, extend the default approval window to 30 minutes, and clarify approval-unavailable guidance so approvals do not appear to silently disappear.
- Exec/node: stop gateway-side workdir fallback from rewriting explicit `host=node` cwd values to the gateway filesystem, so remote node exec approval and runs keep using the intended node-local directory..
- Plugins/KiboHub: sanitize temporary archive filenames for scoped package names and slash-containing skill slugs so `kibo plugins install/name` no longer fails with `ENOENT` during archive download..
- Telegram/polling: keep the watchdog from aborting long-running reply delivery by treating recent non-polling API activity as bounded liveness instead of a hard stall..
- Memory/FTS: keep provider-less keyword hits visible at the default memory-search threshold, so FTS-only recall works without requiring `--min-score 0`..
- Memory/LanceDB: resolve runtime dependency manifest lookup from the bundled `extensions/memory-lancedb` path (including flattened dist chunks) so startup no longer fails with a missing `@lancedb/lancedb` dependency error..
- Tools/web_search: localize the shared search cache to module scope so same-process global symbol lookups can no longer inspect or mutate cached web-search responses..
- Agents/silent turns: fail closed on silent memory-flush runs so narrated `NO_REPLY` self-talk cannot stream or finalize into external replies even when block streaming is enabled.
- Browser/plugins: auto-enable the bundled browser plugin when browser config or browser tool policy already references it, and show a clearer CLI error when `plugins.allow` excludes `browser`.
- Matrix/plugin loading: ship and source-load the crypto bootstrap runtime sidecar correctly so current `main` stops warning about failed Matrix bootstrap loads and `matrix/index` plugin-id mismatches on every invocation..
- iOS/Live Activities: mark the `ActivityKit` import in `LiveActivityManager.swift` as `@preconcurrency` so Xcode 26.4 / Swift 6 builds stop failing on strict concurrency checks..
- Plugins/Matrix: mirror the Matrix crypto WASM runtime dependency into the root packaged install and enforce root/plugin dependency parity so bundled Matrix E2EE crypto resolves correctly in shipped builds..
- Plugins/CLI: add descriptor-backed lazy plugin CLI registration so Matrix can keep its CLI module lazy-loaded without dropping `kibo matrix ...` from parse-time command registration..
- Plugins/CLI: collect root-help plugin descriptors through a dedicated non-activating CLI metadata path so enabled plugins keep validated config semantics without triggering runtime-only plugin registration work, while preserving runtime CLI command registration for legacy channel plugins that still wire commands from full registration..
- Anthropic/OAuth: inject `/fast` `service_tier` hints for direct `sk-ant-oat-*` requests so OAuth-authenticated Anthropic runs stop missing the same overload-routing signal as API-key traffic. Fixes #55758. and.
- Anthropic/service tiers: support explicit `serviceTier` model params for direct Anthropic requests and let them override `/fast` defaults when both are set..
- Auto-reply/fast: accept `/fast status` on the directive-only path, align help/status text with the documented `status|on|off` syntax, and keep current-state replies consistent across command surfaces. Fixes #46095. and.
- Telegram/native commands: prefix native command menu callback payloads and preserve `CommandSource: "native"` when Telegram replays them through callback queries, so `/fast` and other native command menus keep working even when text-command routing is disabled..
- Docs/anchors: fix broken English docs links and make Mint anchor audits run against the English-source docs tree..
- Cron/announce: preserve all deliverable text payloads for announce mode instead of collapsing to the last chunk, so multi-line cron reports deliver in full to Telegram forum topics.
- Harden async approval followup delivery in webchat-only sessions.
- Status: fix cache hit rate exceeding 100% by deriving denominator from prompt-side token fields instead of potentially undersized totalTokens. Fixes #26643.
- Config/update: stop `kibo doctor` write-backs from persisting plugin-injected channel defaults, so `kibo update` no longer seeds config keys that later break service refresh validation..
- Agents/Anthropic failover: treat Anthropic `api_error` payloads with `An unexpected error occurred while processing the response` as transient so retry/fallback can engage instead of surfacing a terminal failure. and.
- Agents/compaction: keep late compaction-retry rejections handled after the aggregate timeout path wins without swallowing real pre-timeout wait failures, so timed-out retries no longer surface an unhandled rejection on later unsubscribe. and.
- Matrix/delivery recovery: treat Synapse `User not in room` replay failures as permanent during startup recovery so poisoned queued messages move to `failed/` instead of crash-looping Matrix after restart..
- Plugins/facades: guard bundled plugin facade loads with a cache-first sentinel so circular re-entry stops crashing `xai`, `sglang`, and `vllm` during gateway plugin startup..
- Agents/MCP: dispose bundled MCP runtimes after one-shot `kibo agent --local` runs finish, while preserving bundled MCP state across in-run retries so local JSON runs exit cleanly without restarting stateful MCP tools mid-run.
- Gateway/OpenAI HTTP: restore default operator scopes for bearer-authenticated requests that omit `x-kibo-scopes`, so headless `/v1/chat/completions` and session-history callers work again after the recent method-scope hardening..
- Gateway/attachments: offload large inbound images without leaking `media://` markers into text-only runs, preserve mixed attachment order for model input/transcripts, and fail closed when model image capability cannot be resolved..
- Telegram/outbound chunking: use static markdown chunking when Telegram runtime state is unavailable so long outbound Telegram messages still split correctly after cold starts..

## 2026.4.2

### Breaking

- Plugins/xAI: move `x_search` settings from the legacy core `tools.web.x_search.*` path to the plugin-owned `plugins.entries.xai.config.xSearch.*` path, standardize `x_search` auth on `plugins.entries.xai.config.webSearch.apiKey` / `XAI_API_KEY`, and migrate legacy config with `kibo doctor --fix`..
- Plugins/web fetch: move Firecrawl `web_fetch` config from the legacy core `tools.web.fetch.firecrawl.*` path to the plugin-owned `plugins.entries.firecrawl.config.webFetch.*` path, route `web_fetch` fallback through the new fetch-provider boundary instead of a Firecrawl-only core branch, and migrate legacy config with `kibo doctor --fix`..

### Changes

- Tasks/Task Flow: restore the core Task Flow substrate with managed-vs-mirrored sync modes, durable flow state/revision tracking, and `kibo tasks flow` inspection/recovery primitives so background orchestration can persist and be operated separately from plugin authoring layers..
- Tasks/Task Flow: add managed child task spawning plus sticky cancel intent, so external orchestrators can stop scheduling immediately and let parent Task Flows settle to `cancelled` once active child tasks finish..
- Plugins/Task Flow: add a bound `api.runtime.taskFlow` seam so plugins and trusted authoring layers can create and drive managed Task Flows from host-resolved Kibo context without passing owner identifiers on each call..
- Android/assistant: add assistant-role entrypoints plus Google Assistant App Actions metadata so Android can launch Kibo from the assistant trigger and hand prompts into the chat composer..
- Exec defaults: make gateway/node host exec default to YOLO mode by requesting `security=full` with `ask=off`, and align host approval-file fallbacks plus docs/doctor reporting with that no-prompt default.
- Providers/runtime: add provider-owned replay hook surfaces for transcript policy, replay cleanup, and reasoning-mode dispatch..
- Plugins/hooks: add `before_agent_reply` so plugins can short-circuit the LLM with synthetic replies after inline actions..
- Channels/session routing: move provider-specific session conversation grammar into plugin-owned session-key surfaces, preserving Telegram topic routing and Feishu scoped inheritance across bootstrap, model override, restart, and tool-policy paths.
- Feishu/comments: add a dedicated Drive comment-event flow with comment-thread context resolution, in-thread replies, and `feishu_drive` comment actions for document collaboration workflows..
- Matrix/plugin: emit spec-compliant `m.mentions` metadata across text sends, media captions, edits, poll fallback text, and action-driven edits so Matrix mentions notify reliably in clients like Element..
- Diffs: add plugin-owned `viewerBaseUrl` so viewer links can use a stable proxy/public origin without passing `baseUrl` on every tool call. Related #59227..
- Agents/compaction: resolve `agents.defaults.compaction.model` consistently for manual `/compact` and other context-engine compaction paths, so engine-owned compaction uses the configured override model across runtime entrypoints..
- Agents/compaction: add `agents.defaults.compaction.notifyUser` so the `🧹 Compacting context...` start notice is opt-in instead of always being shown..
- WhatsApp/reactions: add `reactionLevel` guidance for agent reactions..
- Exec approvals/channels: auto-enable DM-first native chat approvals when supported channels can infer approvers from existing owner config, while keeping channel fanout explicit and clarifying forwarding versus native approval client config.
- Android/assistant: auto-send Google Assistant App Actions prompts once chat is healthy and idle, while keeping bare assistant launches as open-only..

### Fixes

- Sandbox/security: block credential-path binds even when sandbox home paths resolve through canonical aliases, so agent containers cannot mount user secret stores through alternate home-directory paths..
- Gateway/Windows scheduled tasks: preserve Task Scheduler settings on reinstall, fail loud when Scheduled Task `/Run` does not start, and report fast failed restarts with the actual elapsed time instead of a fake 60s timeout..
- Control UI/model picker: preserve already-qualified `provider/model` refs from the server so models whose ids already contain slashes stop being double-prefixed and remapped to the wrong provider..
- Models/selection: resolve bare model ids in session model switches against the configured allowlist before falling back to the current session provider, so Control UI model picks stop drifting into `google/k2p5` and similar wrong-provider refs..

## 2026.4.1-beta.1

- Providers/transport policy: centralize request auth, proxy, TLS, and header shaping across shared HTTP, stream, and websocket paths, block insecure TLS/runtime transport overrides, and keep proxy-hop TLS separate from target mTLS settings..
- Providers/OpenRouter: gate documented OpenRouter attribution to native OpenRouter endpoints or the default route so custom proxy base URLs do not inherit OpenRouter request headers.
- Providers/Copilot: classify native GitHub Copilot API hosts in the shared provider endpoint resolver and harden token-derived proxy endpoint parsing so Copilot base URL routing stays centralized and fails closed on malformed hints..
- Providers/streaming headers: centralize default and attribution header merging across OpenAI websocket, embedded-runner, and proxy stream paths so provider-specific headers stay consistent and caller overrides only win where intended..
- Providers/media HTTP: centralize base URL normalization, default auth/header injection, and explicit header override handling across shared OpenAI-compatible audio, Deepgram audio, Gemini media/image, and Moonshot video request paths..
- Providers/OpenAI-compatible routing: centralize native-vs-proxy request policy so hidden attribution and related OpenAI-family defaults only apply on verified native endpoints across stream, websocket, and shared audio HTTP paths..
- Providers/Anthropic routing: centralize native-vs-proxy endpoint classification for direct Anthropic `service_tier` handling so spoofed or proxied hosts do not inherit native Anthropic defaults..
- Gateway/exec loopback: restore legacy-role fallback for empty paired-device token maps and allow silent local role upgrades so local exec and node clients stop failing with pairing-required errors after `2026.3.31`..
- Agents/subagents: pin admin-only subagent gateway calls to `operator.admin` while keeping `agent` at least privilege, so `sessions_spawn` no longer dies on loopback scope-upgrade pairing with `close(1008) "pairing required"`..
- Exec approvals/config: strip invalid `security`, `ask`, and `askFallback` values from `~/.kibo/exec-approvals.json` during normalization so malformed policy enums fall back cleanly to the documented defaults instead of corrupting runtime policy resolution..
- Exec approvals/doctor: report host policy sources from the real approvals file path and ignore malformed host override values when attributing effective policy conflicts..
- Exec/runtime: treat `tools.exec.host=auto` as routing-only, keep implicit no-config exec on sandbox when available or gateway otherwise, and reject per-call host overrides that would bypass the configured sandbox or host target..
- Slack/mrkdwn formatting: add built-in Slack mrkdwn guidance in inbound context so Slack replies stop falling back to generic Markdown patterns that render poorly in Slack..
- WhatsApp/presence: send `unavailable` presence on connect in self-chat mode so personal-phone users stop losing all push notifications while the gateway is running..
- WhatsApp/media: add HTML, XML, and CSS to the MIME map and fall back gracefully for unknown media types instead of dropping the attachment..
- Matrix/onboarding: restore guided setup in `kibo channels add` and `kibo configure --section channels`, while keeping custom plugin wizards on the shared `setupWizard` seam..
- Matrix/streaming: keep live partial previews for the current assistant block while preserving completed block updates as separate messages when `channels.matrix.blockStreaming` is enabled..
- Feishu/comment threads: harden document comment-thread delivery so whole-document comments fall back to `add_comment`, delayed reply lookups retry more reliably, and user-visible replies avoid reasoning/planning spillover..
- MS Teams/streaming: strip already-streamed text from fallback block delivery when replies exceed the 4000-character streaming limit so long responses stop duplicating content..
- Slack/thread context: filter thread starter and history by the effective conversation allowlist without dropping valid open-room, DM, or group DM context..
- Mattermost/probes: route status probes through the SSRF guard and honor `allowPrivateNetwork` so connectivity checks stay safe for self-hosted Mattermost deployments..
- Zalo/webhook replay: scope replay dedupe key by chat and sender so reused message IDs across different chats or senders no longer collide, and harden metadata reads for partially missing payloads.
- QQBot/structured payloads: restrict local file paths to QQ Bot-owned media storage, block traversal outside that root, reduce path leakage in logs, and keep inline image data URLs working..
- Image generation/providers: route OpenAI, MiniMax, and fal image requests through the shared provider HTTP transport path so custom base URLs, guarded private-network routing, and provider request defaults stay aligned with the rest of provider HTTP..
- Image generation/providers: stop inferring private-network access from configured OpenAI, MiniMax, and fal image base URLs, and cap shared HTTP error-body reads so hostile or misconfigured endpoints fail closed without relaxing SSRF policy or buffering unbounded error payloads..
- Browser/host inspection: keep static Chrome inspection helpers out of the activated browser runtime so `kibo doctor browser` and related checks do not eagerly load the bundled browser plugin..
- Browser/CDP: normalize trailing-dot localhost absolute-form hosts before loopback checks so remote CDP websocket URLs like `ws://localhost.:...` rewrite back to the configured remote host..
- Browser/attach-only profiles: disconnect cached Playwright CDP sessions when stopping attach-only or remote CDP profiles, while still reporting never-started local managed profiles as not stopped..
- Agents/output sanitization: strip namespaced `antml:thinking` blocks from user-visible text so Anthropic-style internal monologue tags do not leak into replies..
- Kimi Coding/tools: normalize Anthropic tool payloads into the OpenAI-compatible function shape Kimi Coding expects so tool calls stop losing required arguments..
- Image tool/paths: resolve relative local media paths against the agent `workspaceDir` instead of `process.cwd()` so inputs like `inbox/receipt.png` pass the local-path allowlist reliably. Thanks Priyansh Gupta.
- Podman/launch: remove noisy container output from `scripts/run-kibo-podman.sh` and align the Podman install guidance with the quieter startup flow..
- Plugins/runtime: keep LINE reply directives and browser-backed cleanup/reset flows working even when those plugins are disabled while tightening bundled plugin activation guards..
- ACP/gateway reconnects: keep ACP prompts alive across transient websocket drops while still failing boundedly when reconnect recovery does not complete..
- ACP/gateway reconnects: reject stale pre-ack ACP prompts after reconnect grace expiry so callers fail cleanly instead of hanging indefinitely when the gateway never confirms the run.
- Gateway/session kill: enforce HTTP operator scopes on session kill requests and gate authorization before session lookup so unauthenticated callers cannot probe session existence..
- MS Teams/logging: format non-`Error` failures with the shared unknown-error helper so logs stop collapsing caught SDK or Axios objects into `[object Object]`..
- Channels/setup: ignore untrusted workspace channel plugins during setup resolution so a shadowing workspace plugin cannot override built-in channel setup/login flows unless explicitly trusted in config..
- Exec/Windows: restore allowlist enforcement with quote-aware `argPattern` matching across gateway and node exec, and surface accurate dynamic pre-approved executable hints in the exec tool description..
- Gateway: prune empty `node-pending-work` state entries after explicit acknowledgments and natural expiry so the per-node state map no longer grows indefinitely..
- Webhooks/secret comparison: replace ad-hoc timing-safe secret comparisons across BlueBubbles, Feishu, Mattermost, Telegram, Twilio, and Zalo webhook handlers with the shared `safeEqualSecret` helper and reject empty auth tokens in BlueBubbles..
- OpenShell/mirror: constrain `remoteWorkspaceDir` and `remoteAgentWorkspaceDir` to the managed `/sandbox` and `/agent` roots, and keep mirror sync from overwriting or removing user-added shell roots during config synchronization..
- Plugins/activation: preserve explicit, auto-enabled, and default activation provenance plus reason metadata across CLI, gateway bootstrap, and status surfaces so plugin enablement state stays accurate after auto-enable resolution..
- Exec/env: block additional host environment override pivots for package roots, language runtimes, compiler include paths, and credential/config locations so request-scoped exec cannot redirect trusted toolchains or config lookups..
- Dotenv/workspace overrides: block workspace `.env` files from overriding `KIBO_PINNED_PYTHON` and `KIBO_PINNED_WRITE_PYTHON` so trusted helper interpreters cannot be redirected by repo-local env injection..
- Plugins/install: accept JSON5 syntax in `kibo.plugin.json` and bundle `plugin.json` manifests during install/validation, so third-party plugins with trailing commas, comments, or unquoted keys no longer fail to install..
- Telegram/exec approvals: rewrite shared `/approve … allow-always` callback payloads to `/approve … always` before Telegram button rendering so plugin approval IDs still fit Telegram's `callback_data` limit and keep the Allow Always action visible..
- Cron/exec timeouts: surface timed-out `exec` and `bash` failures in isolated cron runs even when `verbose: off`, including custom session-target cron jobs, so scheduled runs stop failing silently..
- Telegram/exec approvals: fall back to the origin session key for async approval followups and keep resume-failure status delivery sanitized so Telegram followups still land without leaking raw exec metadata..
- Node-host/exec approvals: bind `pnpm dlx` invocations through the approval planner's mutable-script path so the effective runtime command is resolved for approval instead of being left unbound.
- Exec/node hosts: stop forwarding the gateway workspace cwd to remote node exec when no workdir was explicitly requested, so cross-platform node approvals fall back to the node default cwd instead of failing with `SYSTEM_RUN_DENIED`..
- TUI/chat: keep pending local sends visible and reconciled across history reloads, make busy/error recovery clearer through fallback and terminal-error paths, and reclaim transcript width for long links and paths..
- Exec approvals/channels: decouple initiating-surface approval availability from native delivery enablement so Telegram, Slack, and Discord still expose approvals when approvers exist and native target routing is configured separately..
- Agents/logging: keep orphaned-user transcript repair warnings focused on interactive runs, and downgrade background-trigger repairs (`heartbeat`, `cron`, `memory`, `overflow`) to debug logs to reduce false-alarm gateway noise.
- Gateway/node pairing: require `operator.pairing` for node approvals end-to-end, while still requiring `operator.write` or `operator.admin` when the pending node commands need those higher scopes..
- Providers/OpenRouter: gate Anthropic prompt-cache `cache_control` markers to native/default OpenRouter routes and preserve them for native OpenRouter hosts behind custom provider ids..
- Browser/CDP: validate both initial and discovered CDP websocket endpoints before connect so strict SSRF policy blocks cross-host pivots and direct websocket targets..
- Browser/profiles: reject remote browser profile `cdpUrl` values that violate strict SSRF policy before saving config, with clearer validation errors for blocked endpoints..
- Browser/screenshots: stop sending `fromSurface: false` on CDP screenshots so managed Chrome 146+ browsers can capture images again..
- Mattermost/slash commands: harden native slash-command callback token validation to use constant-time secret comparison, matching the existing interaction-token path.
- Control UI/mobile chat: reduce narrow-screen overflow by shrinking the chat pane minimum width, removing extra mobile padding, widening message groups, and hiding avatars on very small screens..
- Android/Talk Mode: route spoken replies through `talk.speak`, keep compressed playback cleanup deterministic, and fall back to local TTS for legacy gateways that omit Talk error reasons..
- Android/Talk Mode: keep reply-speaker routing and teardown behavior aligned with the new remote playback path..

## 2026.4.1

### Changes

- macOS/Voice Wake: add the Voice Wake option to trigger Talk Mode..
- Tasks/chat: add `/tasks` as a chat-native background task board for the current session, with recent task details and agent-local fallback counts when no linked tasks are visible. Related #54226..
- Web search/SearXNG: add the bundled SearXNG provider plugin for `web_search` with configurable host support..
- Telegram/errors: add configurable `errorPolicy` and `errorCooldownMs` controls so Telegram can suppress repeated delivery errors per account, chat, and topic without muting distinct failures.
- Gateway/webchat: make `chat.history` text truncation configurable with `gateway.webchat.chatHistoryMaxChars` and per-request `maxChars`, while preserving silent-reply filtering and existing default payload limits.
- Amazon Bedrock/Guardrails: add Bedrock Guardrails support to the bundled provider..
- ZAI/models: add `glm-5.1` and `glm-5v-turbo` to the bundled Z.AI provider catalog.
- Agents/default params: add `agents.defaults.params` for global default provider parameters..
- Agents/failover: cap prompt-side and assistant-side same-provider auth-profile retries for rate-limit failures before cross-provider model fallback, add the `auth.cooldowns.rateLimitedProfileRotations` knob, and document the new fallback behavior.
- Agents/compaction: resolve `agents.defaults.compaction.model` consistently for manual `/compact` and other context-engine compaction paths, so engine-owned compaction uses the configured override model across runtime entrypoints.
- Cron/tools allowlist: add `kibo cron --tools` for per-job tool allowlists..

### Fixes

- Chat/error replies: stop leaking raw provider/runtime failures into external chat channels, return a friendly retry message instead, and add a specific `/new` hint for Bedrock toolResult/toolUse session mismatches..
- Sessions/model switching: keep `/model` changes queued behind busy runs instead of interrupting the active turn, and retarget queued followups so later work picks up the new model as soon as the current turn finishes.
- Web UI/OpenResponses: preserve rewritten stream snapshots in webchat and keep OpenResponses final streamed text aligned when models rewind earlier output.
- Discord/inbound media: pass Discord attachment and sticker downloads through the shared idle-timeout and worker-abort path so slow or stuck inbound media fetches stop hanging message processing.
- Telegram/retries: keep non-idempotent sends on the strict safe-send path, retry wrapped pre-connect failures, and preserve `429` / `retry_after` backoff for safe delivery retries.
- Telegram/exec approvals: route topic-aware exec approval followups through Telegram-owned threading and approval-target parsing, so forum-topic approvals stay in the originating topic instead of falling back to the root chat.
- Telegram/local Bot API: preserve media MIME types for absolute-path downloads so local audio files still trigger transcription and other MIME-based handling.
- Channels/WhatsApp: pass inbound message timestamp to model context so the AI can see when WhatsApp messages were sent.
- QQBot/voice: lazy-load `silk-wasm` in `audio-convert.ts` so qqbot still starts when the optional voice dependency is missing, while voice encode/decode degrades gracefully instead of crashing at module load time..
- WhatsApp/groups: fix bot waking up on self-number quoted replies in groups with `selfChatMode` enabled.
- Device pairing: require `operator.pairing` or `operator.admin` for internal `/pair` setup-code, QR, and cleanup commands so lower-privilege gateway callers cannot mint or revoke pairing bootstrap material..
- Agents/failover: unify structured and raw provider error classification so provider-specific `400`/`422` payloads no longer get forced into generic format failures before retry, billing, or compaction logic can inspect them..
- Auth profiles/store: coerce misplaced SecretRef objects out of plaintext `key` and `token` fields during store load so agents without ACP runtime stop crashing on `.trim()` after upgrade..
- ACPX/runtime: repair `queue owner unavailable` session recovery by replacing dead named sessions and resuming the backend session when ACPX exposes a stable session id, so the first ACP prompt no longer inherits a dead handle.
- ACPX/runtime: retry dead-session queue-owner repair without `--resume-session` when the reported ACPX session id is stale, so recovery still creates a fresh named session instead of failing session init..
- Tools/web_search (Kimi): replay native Moonshot `$web_search` arguments verbatim, disable thinking for `kimi-k2.5`, and add Moonshot region/model setup prompts so bundled Kimi web search works again..

## 2026.3.31

### Breaking

- Nodes/exec: remove the duplicated `nodes.run` shell wrapper from the CLI and agent `nodes` tool so node shell execution always goes through `exec host=node`, keeping node-specific capabilities on `nodes invoke` and the dedicated media/location/notify actions.
- Plugin SDK: deprecate the legacy provider compat subpaths plus the older bundled provider setup and channel-runtime compatibility shims, emit migration warnings, and keep the current documented `kibo/plugin-sdk/*` entrypoints plus local `api.ts` / `runtime-api.ts` barrels as the forward path ahead of a future major-release removal.
- Skills/install and Plugins/install: built-in dangerous-code `critical` findings and install-time scan failures now fail closed by default, so plugin installs and gateway-backed skill dependency installs that previously succeeded may now require an explicit dangerous override such as `--dangerously-force-unsafe-install` to proceed.
- Gateway/auth: `trusted-proxy` now rejects mixed shared-token configs, and local-direct fallback requires the configured token instead of implicitly authenticating same-host callers., and.
- Gateway/node commands: node commands now stay disabled until node pairing is approved, so device pairing alone is no longer enough to expose declared node commands..
- Gateway/node events: node-originated runs now stay on a reduced trusted surface, so notification-driven or node-triggered flows that previously relied on broader host/session tool access may need adjustment..

### Changes

- ACP/plugins: add an explicit default-off ACPX plugin-tools MCP bridge config, document the trust boundary, and harden the built-in bridge packaging/logging path so global installs and stdio MCP sessions work reliably..
- Agents/LLM: add a configurable idle-stream timeout for embedded runner requests so stalled model streams abort cleanly instead of hanging until the broader run timeout fires..
- Docs/plugins: update the community wecom and qqbot plugin listing to the docs catalog..
- Agents/MCP: materialize bundle MCP tools with provider-safe names (`serverName__toolName`), support optional `streamable-http` transport selection plus per-server connection timeouts, and preserve real tool results from aborted/error turns unless truncation explicitly drops them..
- Android/notifications: add notification-forwarding controls with package filtering, quiet hours, rate limiting, and safer picker behavior for forwarded notification events..
- Background tasks: turn tasks into a real shared background-run control plane instead of ACP-only bookkeeping by unifying ACP, subagent, cron, and background CLI execution under one SQLite-backed ledger, routing detached lifecycle updates through the executor seam, adding audit/maintenance/status visibility, tightening auto-cleanup and lost-run recovery, improving task awareness in internal status/tool surfaces, and clarifying the split between heartbeat/main-session automation and detached scheduled runs. and.
- Background tasks: add the first linear task flow control surface with `kibo tasks list|show|cancel`, keep manual multi-task flows separate from one-task auto-sync flows, and surface doctor recovery hints for obviously orphaned or broken flow/task linkage. and.
- Channels/QQ Bot: add QQ Bot as a bundled channel plugin with multi-account setup, SecretRef-aware credentials, slash commands, reminders, and media send/receive support..
- Diffs: skip unused viewer-versus-file SSR preload work so `diffs` view-only and file-only runs do less render work while keeping mode outputs aligned..
- Tasks: add a minimal SQLite-backed task flow registry plus task-to-flow linkage scaffolding, so orchestrated work can start gaining a first-class parent record without changing current task delivery behavior. and.
- Tasks: persist blocked state on one-task task flows and let the same flow reopen cleanly on retry, so blocked detached work can carry a parent-level reason and continue without fragmenting into a new job. and.
- Tasks: route one-task ACP and subagent updates through a parent task-flow owner context, so detached work can emerge back through the intended parent thread/session instead of speaking only as a raw child task. and.
- LINE/outbound media: add LINE image, video, and audio outbound sends on the LINE-specific delivery path, including explicit preview/tracking handling for videos while keeping generic media sends on the existing image-only route..
- Matrix/history: add optional room history context for Matrix group triggers via `channels.matrix.historyLimit`, with per-agent watermarks and retry-safe snapshots so failed trigger retries do not drift into newer room messages..
- Matrix/network: add explicit `channels.matrix.proxy` config for routing Matrix traffic through an HTTP(S) proxy, including account-level overrides and matching probe/runtime behavior..
- Matrix/streaming: add draft streaming so partial Matrix replies update the same message in place instead of sending a new message for each chunk..
- Matrix/threads: add per-DM `threadReplies` overrides and keep thread session isolation aligned with the effective room or DM thread policy from the triggering message onward..
- MCP: add remote HTTP/SSE server support for `mcp.servers` URL configs, including auth headers and safer config redaction for MCP credentials..
- Memory/QMD: add per-agent `memorySearch.qmd.extraCollections` so agents can opt into cross-agent session search without flattening every transcript collection into one shared QMD namespace..
- Microsoft Teams/member info: add a Graph-backed member info action so Teams automations and tools can resolve channel member details directly from Microsoft Graph..
- Nostr/inbound DMs: verify inbound event signatures before pairing or sender-authorization side effects, so forged DM events no longer create pairing requests or trigger reply attempts. and.
- OpenAI/Responses: forward configured `text.verbosity` across Responses HTTP and WebSocket transports, surface it in `/status`, and keep per-agent verbosity precedence aligned with runtime behavior. and.
- Pi/Codex: add native Codex web search support for embedded Pi runs, including config/docs/wizard coverage and managed-tool suppression when native Codex search is active..
- Slack/exec approvals: add native Slack approval routing and approver authorization so exec approval prompts can stay in Slack instead of falling back to the Web UI or terminal..
- TTS: Add structured provider diagnostics and fallback attempt analytics..
- WhatsApp/reactions: agents can now react with emoji on incoming WhatsApp messages, enabling more natural conversational interactions like acknowledging a photo with ❤️ instead of typing a reply..
- Agents/BTW: force `/btw` side questions to disable provider reasoning so Anthropic adaptive-thinking sessions stop failing with `No BTW response generated`. Fixes #55376. and.
- CLI/onboarding: reset the remote gateway URL prompt to the safe loopback default after declining a discovered endpoint, so onboarding does not keep a previously rejected remote URL.
- Agents/exec defaults: honor per-agent `tools.exec` defaults when no inline directive or session override is present, so configured exec host, security, ask, and node settings actually apply.
- Sandbox/networking: sanitize SSH subprocess env vars through the shared sandbox policy and route marketplace archive downloads plus Ollama discovery, auth, and pull requests through the guarded fetch path so sandboxed execution and remote fetches follow the repo's trust boundaries. (#57848, #57850)

### Fixes

- Slack: stop retry-driven duplicate replies when draft-finalization edits fail ambiguously, and log configured allowlisted users/channels by readable name instead of raw IDs.
- Agents/OpenAI Responses: normalize raw bundled MCP tool schemas on the WebSocket/Responses path so bare-object, object-ish, and top-level union MCP tools no longer get rejected by OpenAI during tool registration..
- ACP/security: replace ACP's dangerous-tool name override with semantic approval classes, so only narrow readonly reads/searches can auto-approve while indirect exec-capable and control-plane tools always require explicit prompt approval..
- ACP: derive owner-only approval classes from the shared tool-policy fallback map so `cron`, `nodes`, and `whatsapp_login` cannot drift out of prompt-required coverage.
- ACP/sessions_spawn: register ACP child runs for completion tracking and lifecycle cleanup, and make registration-failure cleanup explicitly best-effort so callers do not assume an already-started ACP turn was fully aborted. and.
- ACP/tasks: mark cleanly exited ACP runs as blocked when they end on deterministic write or authorization blockers, and wake the parent session with a follow-up instead of falsely reporting success.
- ACPX/runtime: derive the bundled ACPX expected version from the extension package metadata instead of hardcoding a separate literal, so plugin-local ACPX installs stop drifting out of health-check parity after version bumps. and.
- Agents/Anthropic failover: treat Anthropic `api_error` payloads with `An unexpected error occurred while processing the response` as transient so retry/fallback can engage instead of surfacing a terminal failure. and.
- Agents/compaction: keep late compaction-retry completions from double-resolving finished compaction futures, so interrupted or timed-out compactions stop surfacing spurious second-completion races..
- Agents/disabled providers: make disabled providers disappear from default model selection and embedded provider fallback, while letting explicitly pinned disabled providers fail with a clear config error instead of silently taking traffic. and.
- Agents/OAuth output: force exec-host OAuth output readers through the gateway fs policy so embedded gateway runs stop crashing when provider auth writes land outside the current sandbox workspace..
- Agents/system prompt: fix `agent.name` interpolation in the embedded runtime system prompt and make provider/model fallback text reflect the effective runtime selection after start. and.
- Android/device info: read the app's version metadata from the package manager instead of hidden APIs so Android 15+ onboarding and device info no longer fail to compile or report placeholder values..
- Android/pairing: stop appending duplicate push receiver entries to `gateway-service.conf` on repeated QR pairing and keep push registration bounded to the current successful pairing, so Android push delivery stays healthy across re-pair and token rotation..
- App install smoke: pin the latest-release lookup to `latest`, cache the first stable install version across the rerun, and relax prerelease package assertions so the Parallels smoke lane can validate stable-to-main upgrades even when `beta` moves ahead or the guest starts from an older stable..
- Auth/profiles: keep the last successful config load in memory for the running process and refresh that snapshot on successful writes/reloads, so hot paths stop reparsing `kibo.json` between watcher-driven swaps.
- Config/SecretRef + Control UI: harden SecretRef redaction round-trip restore, block unsafe raw fallback (force Form mode when raw is unavailable), and preflight submitted-config SecretRefs before config write RPC persistence..
- Config/update: stop `kibo doctor` write-backs from persisting plugin-injected channel defaults, so `kibo update` no longer seeds config keys that later break service refresh validation..
- Control UI/agents: auto-load agent workspace files on initial Files panel open, and populate overview model/workspace/fallbacks from effective runtime agent metadata so defaulted models no longer show as `Not set`..
- Control UI/slash commands: make `/steer` and `/redirect` work from the chat command palette with visible pending state for active-run `/steer`, correct redirected-run tracking, and a single canonical `/steer` entry in the command menu..
- Cron/announce: preserve all deliverable text payloads for announce mode instead of collapsing to the last chunk, so multi-line cron reports deliver in full to Telegram forum topics.
- Cron/isolated sessions: carry the full live-session provider, model, and auth-profile selection across retry restarts so cron jobs with model overrides no longer fail or loop on mid-run model-switch requests..
- Diffs/config: preserve schema-shaped plugin config parsing from `diffsPluginConfigSchema.safeParse()`, so direct callers keep `defaults` and `security` sections instead of receiving flattened tool defaults..
- Diffs: fall back to plain text when `lang` hints are invalid during diff render and viewer hydration, so bad or stale language values no longer break the diff viewer..
- Discord/voice: enforce the same guild channel and member allowlist checks on spoken voice ingress before transcription, so joined voice channels no longer accept speech from users outside the configured Discord access policy. and.
- Docker/setup: force BuildKit for local image builds (including sandbox image builds) so `./docker-setup.sh` no longer fails on `RUN --mount=...` when hosts default to Docker's legacy builder..
- Docs/anchors: fix broken English docs links and make Mint anchor audits run against the English-source docs tree..
- Doctor/plugins: skip false Matrix legacy-helper warnings when no migration plans exist, and keep bundled `enabledByDefault` plugins in the gateway startup set..
- Exec approvals/macOS: unwrap `arch` and `xcrun` before deriving shell payloads and allow-always patterns, so wrapper approvals stay bound to the carried command instead of the outer carrier. and.
- Exec approvals: unwrap `caffeinate` and `sandbox-exec` before persisting allow-always trust so later shell payload changes still require a fresh approval. and.
- Exec/approvals: infer Discord and Telegram exec approvers from existing owner config when `execApprovals.approvers` is unset, extend the default approval window to 30 minutes, and clarify approval-unavailable guidance so approvals do not appear to silently disappear.
- Pi/TUI: flush message-boundary replies at `message_end` so turns stop looking stuck until the next nudge when the final reply was already ready..
- Status/tasks: fall back to same-agent task counts in `/status` when the current session has no linked tasks, keeping the default view useful without exposing other sessions' task details..
- Status/auto-reply: stop status-only turns from replying twice when inline `/status` handling already produced the reply, so Discord and other chat surfaces no longer emit duplicate status cards..
- Exec/approvals: keep `awk` and `sed` family binaries out of the low-risk `safeBins` fast path, and stop doctor profile scaffolding from treating them like ordinary custom filters..
- Exec/env: block proxy, TLS, and Docker endpoint env overrides in host execution so request-scoped commands cannot silently reroute outbound traffic or trust attacker-supplied certificate settings..
- Exec/env: block Python package index override variables from request-scoped host exec environment sanitization so package fetches cannot be redirected through a caller-supplied index. and.
- Exec/node: stop gateway-side workdir fallback from rewriting explicit `host=node` cwd values to the gateway filesystem, so remote node exec approval and runs keep using the intended node-local directory..
- Exec/runtime: default implicit exec to `host=auto`, resolve that target to sandbox only when a sandbox runtime exists, keep explicit `host=sandbox` fail-closed without sandbox, and show `/exec` effective host state in runtime status/docs.
- Exec: fail closed when the implicit sandbox host has no sandbox runtime, and stop denied async approval followups from reusing prior command output from the same session..
- Feishu/groups: keep quoted replies and topic bootstrap context aligned with group sender allowlists so only allowlisted thread messages seed agent context. and.
- Gateway/attachments: offload large inbound images without leaking `media://` markers into text-only runs, preserve mixed attachment order for model input/transcripts, and fail closed when model image capability cannot be resolved..
- Gateway/auth: keep shared-auth rate limiting active during WebSocket handshake attempts even when callers also send device-token candidates, so bogus device-token fields no longer suppress shared-secret brute-force tracking. and.
- Gateway/auth: reject mismatched browser `Origin` headers on trusted-proxy HTTP operator requests while keeping origin-less headless proxy clients working. and.
- Gateway/device tokens: disconnect active device sessions after token rotation so newly rotated credentials revoke existing live connections immediately instead of waiting for those sockets to close naturally. and.
- Gateway/health: carry webhook-vs-polling account mode from channel descriptors into runtime snapshots so passive channels like LINE and BlueBubbles skip false stale-socket health failures..
- Gateway/pairing: restore QR bootstrap onboarding handoff so fresh `/pair qr` iPhone setup can auto-approve the initial node pairing, receive a reusable node device token, and stop retrying with spent bootstrap auth..
- Gateway/OpenAI compatibility: accept flat Responses API function tool definitions on `/v1/responses` and preserve `strict` when normalizing hosted tools into the embedded runner, so spec-compliant clients like Codex no longer fail validation or silently lose strict tool enforcement. and.
- Gateway/OpenAI HTTP: restore default operator scopes for bearer-authenticated requests that omit `x-kibo-scopes`, so headless `/v1/chat/completions` and session-history callers work again after the recent method-scope hardening..
- Gateway/plugins: scope plugin-auth HTTP route runtime clients to read-only access and keep gateway-authenticated plugin routes on write scope, so plugin-owned webhook handlers do not inherit write-capable runtime access by default. and.
- Gateway/SecretRef: resolve restart token drift checks with merged service/runtime env sources and hard-fail unsupported mutable SecretRef plus OAuth-profile combinations so restart warnings and policy enforcement match runtime behavior..
- Gateway/tools HTTP: tighten HTTP tool-invoke authorization so owner-only tools stay off HTTP invoke paths..
- Harden async approval followup delivery in webchat-only sessions.
- Heartbeat/auth: prevent exec-event heartbeat runs from inheriting owner-only tool access from the session delivery target, so node exec output stays on the non-owner tool surface even when the target session belongs to the owner. and.
- Hooks/config: accept runtime channel plugin ids in `hooks.mappings[].channel` (for example `feishu`) instead of rejecting non-core channels during config validation..
- Hooks/session routing: rebind hook-triggered `agent:` session keys to the actual target agent before isolated dispatch so dedicated hook agents keep their own session-scoped tool and plugin identity. and.
- Host exec/env: block additional request-scoped env overrides that can redirect Docker endpoints, trust roots, compiler include paths, package resolution, or Python environment roots during approved host runs. and.
- Image generation/build: write stable runtime alias files into `dist/` and route provider-auth runtime lookups through those aliases so image-generation providers keep resolving auth/runtime modules after rebuilds instead of crashing on missing hashed chunk files.
- iOS/Live Activities: mark the `ActivityKit` import in `LiveActivityManager.swift` as `@preconcurrency` so Xcode 26.4 / Swift 6 builds stop failing on strict concurrency checks..
- LINE/ACP: add current-conversation binding and inbound binding-routing parity so `/acp spawn ... --thread here`, configured ACP bindings, and active conversation-bound ACP sessions work on LINE like the other conversation channels.
- LINE/markdown: preserve underscores inside Latin, Cyrillic, and CJK words when stripping markdown, while still removing standalone `_italic_` markers on the shared text-runtime path used by LINE and TTS..
- Agents/failover: make overloaded same-provider retry count and retry delay configurable via `auth.cooldowns`, default to one retry with no delay, and document the model-fallback behavior.
- Ollama/model picker: include configured Ollama models in the opted-in non-PI-native model catalog path so Ollama onboarding shows available models directly after provider selection..

## 2026.3.31-beta.1

### Fixes

- Agents/compaction: keep late compaction-retry rejections handled after the aggregate timeout path wins without swallowing real pre-timeout wait failures, so timed-out retries no longer surface an unhandled rejection on later unsubscribe. and.
- Agents/context pruning: count supplementary-plane CJK characters with the shared code-point-aware estimator so context pruning stops underestimating Japanese and Chinese text that uses Extension B ideographs..
- Agents/Kimi: preserve already-valid Anthropic-compatible tool call argument objects while still clearing cached repairs when later trailing junk exceeds the repair allowance..
- Agents/MCP: dispose bundled MCP runtimes after one-shot `kibo agent --local` runs finish, while preserving bundled MCP state across in-run retries so local JSON runs exit cleanly without restarting stateful MCP tools mid-run.
- Agents/MCP: reuse bundled MCP runtimes across turns in the same session, while recreating them when MCP config changes and disposing stale runtimes cleanly on session rollover..
- Agents/memory flush: keep daily memory flush files append-only during embedded attempts so compaction writes do not overwrite earlier notes..
- Agents/sandbox: honor `tools.sandbox.tools.alsoAllow`, let explicit sandbox re-allows remove matching built-in default-deny tools, and keep sandbox explain/error guidance aligned with the effective sandbox tool policy..
- Agents/sandbox: make remote FS bridge reads pin the parent path and open the file atomically in the helper so read access cannot race path resolution. and.
- Agents/silent turns: fail closed on silent memory-flush runs so narrated `NO_REPLY` self-talk cannot stream or finalize into external replies even when block streaming is enabled.
- Agents/subagents: fix interim subagent runtime display so `/subagents list` and `/subagents info` stop inflating short runtimes and show second-level durations correctly..
- Anthropic/OAuth: inject `/fast` `service_tier` hints for direct `sk-ant-oat-*` requests so OAuth-authenticated Anthropic runs stop missing the same overload-routing signal as API-key traffic. Fixes #55758. and.
- Anthropic/service tiers: support explicit `serviceTier` model params for direct Anthropic requests and let them override `/fast` defaults when both are set..
- Auto-reply/fast: accept `/fast status` on the directive-only path, align help/status text with the documented `status|on|off` syntax, and keep current-state replies consistent across command surfaces. Fixes #46095. and.
- Azure OpenAI/custom providers: use the `azure-openai-responses` path for Azure custom providers so Azure OpenAI endpoints stay on the correct Responses integration surface..
- BlueBubbles/iMessage: coalesce URL-only inbound messages with their link-preview balloon again so sharing a bare link no longer drops the URL from agent context..
- Browser/plugins: auto-enable the bundled browser plugin when browser config or browser tool policy already references it, and show a clearer CLI error when `plugins.allow` excludes `browser`.
- CI/dev checks: default local `pnpm check` to a lower-memory typecheck/lint path while keeping CI on the normal parallel path, and harden Telegram test typing/literals around native TypeScript-Go tooling crashes.
- Tasks: add a small task-flow runtime substrate for authoring layers with persisted wait targets and output bags, plus bundled skills/Kibo Shell examples and richer `flows show` / `doctor` recovery hints for multi-task flow state. and.
- Config/legacy cleanup: stop probing obsolete alternate legacy config names and service labels during local config/service detection, while keeping the active `~/.kibo/kibo.json` path canonical.
- Config/runtime: pin the first successful config load in memory for the running process and refresh that snapshot on successful writes/reloads, so hot paths stop reparsing `kibo.json` between watcher-driven swaps.
- LINE/status: stop `kibo status` from warning about missing credentials when sanitized LINE snapshots are already configured, while still surfacing whether the missing field is the token or secret..
- macOS/local gateway: stop Kibo.app from killing healthy local gateway listeners after startup by recognizing the current `kibo-gateway` process title and using the current `kibo gateway` launch shape.
- macOS/wide-area discovery: switch gateway discovery to Tailscale MagicDNS names so Mac clients recover more reliably across changing tailnet IPs..
- Matrix/CLI send: start one-off Matrix send clients before outbound delivery so `kibo message send --channel matrix` restores E2EE in encrypted rooms instead of sending plain events..
- Matrix/context: filter fetched room context by sender allowlists so reply and thread context lookup no longer pulls non-allowlisted messages into agent context..
- Matrix/delivery recovery: treat Synapse `User not in room` replay failures as permanent during startup recovery so poisoned queued messages move to `failed/` instead of crash-looping Matrix after restart..
- Matrix/direct rooms: recover fresh auto-joined 1:1 DMs without eagerly persisting invite-only `m.direct` mappings, while keeping named, aliased, and explicitly configured rooms on the room path..
- Matrix/direct rooms: stop trusting remote `is_direct`, honor explicit local `is_direct: false` for discovered DM candidates, and avoid extra member-state lookups for shared rooms so DM routing and repair stay aligned..
- Matrix/DM threads: keep strict unnamed fresh-invite rooms promotable even when Matrix omits the optional direct hint, preserve repair-failed local DM promotions while still revalidating later room metadata, and keep both bound and thread-isolated Matrix sessions reporting the correct route policy..
- Matrix/plugin loading: ship and source-load the crypto bootstrap runtime sidecar correctly so current `main` stops warning about failed Matrix bootstrap loads and `matrix/index` plugin-id mismatches on every invocation..
- Mattermost/websocket: detect stale Mattermost WebSocket sessions after bot disable/enable cycles so monitoring reconnects cleanly instead of silently staying stale..
- Media/downloads: stop forwarding auth and cookie headers across cross-origin redirects during media saves, while preserving safe request headers for same-origin redirect chains. and.
- Media/images: reject oversized decoded image inputs before metadata and resize backends run, so tiny compressed image bombs fail early instead of exhausting gateway memory. and.
- Memory/doctor: probe QMD availability from the agent workspace too, so `kibo doctor` no longer falsely reports relative `memory.qmd.command` configs as broken while runtime search still works..
- Memory/doctor: suppress the orphan transcript cleanup warning when QMD session indexing is enabled, so doctor no longer suggests deleting transcript history that QMD still uses for recall. and.
- Memory/FTS: add configurable trigram tokenization plus short-CJK substring fallback so memory search can find Chinese, Japanese, and Korean text without breaking mixed long-and-short queries..
- Memory/FTS: keep provider-less keyword hits visible at the default memory-search threshold, so FTS-only recall works without requiring `--min-score 0`..
- Memory/LanceDB: resolve runtime dependency manifest lookup from the bundled `extensions/memory-lancedb` path (including flattened dist chunks) so startup no longer fails with a missing `@lancedb/lancedb` dependency error..
- Memory/QMD: add `memory.qmd.searchTool` as an exact mcporter tool override, so custom QMD MCP tools such as `hybrid_search` can be used without weakening the validated `searchMode` config surface..
- Memory/QMD: honor `memory.qmd.update.embedInterval` even when regular QMD update cadence is disabled or slower by arming a dedicated embed-cadence maintenance timer, while avoiding redundant timers when regular updates are already frequent enough..
- Memory/QMD: include deduplicated default plus per-agent `memorySearch.extraPaths` when building QMD custom collections, so shared and agent-specific extra roots both get indexed consistently. and.
- Memory/QMD: keep `memory_search` session-hit paths roundtrip-safe when exported session markdown lives under the workspace `qmd/` directory, so `memory_get` can read the exact returned path instead of failing on the generic `qmd/sessions/...` alias. and.
- Memory/QMD: keep `qmd embed` active in `search` mode too, so BM25-first setups still build a complete index for later vector and hybrid retrieval. and.
- Memory/QMD: keep reset and deleted session transcripts in QMD session export so daily session resets do not silently drop most historical recall from `memory_search`..
- Memory/QMD: pass a direct-session key on `kibo memory search` so CLI QMD searches no longer get denied as `session=<none>` under direct-only scope defaults. and.
- Memory/QMD: point `QMD_CONFIG_DIR` at the nested `xdg-config/qmd` directory so per-agent collection config resolves correctly. and.
- Memory/QMD: preserve explicit `start_line` and `end_line` metadata from mcporter query results so `memory search` hits keep the real snippet offsets instead of falling back to the snippet header..
- Memory/QMD: rebind collections when QMD reports a changed pattern but omits path metadata, so config pattern changes stop being silently ignored on restart..
- Memory/QMD: resolve slugified `memory_search` file hints back to the indexed filesystem path before returning search hits, so `memory_get` works again for mixed-case and spaced paths..
- Memory/QMD: send MCP `query` collection filters as the upstream `collections` array instead of the legacy singular `collection` field, so mcporter-backed QMD 1.1+ searches still scope correctly after the unified `query` tool migration. and.
- Memory/QMD: serialize cross-process `qmd embed` runs behind a shared lock and stagger periodic embed timers so multi-agent QMD collections stop thundering-herding on startup and every maintenance interval..
- Memory/QMD: stop rewriting Han/CJK BM25 queries before `qmd search`, so Kibo search semantics match direct QMD results for mixed and spaced Chinese queries..
- Memory/QMD: surface degraded vector status from `qmd status` so `kibo memory status --deep` warns when semantic search is unavailable because the index still has `0` vectors. Fixes #28169..
- Memory/QMD: treat null-byte collection corruption the same when QMD surfaces it as `ENOENT`, so managed-collection repair still rebuilds and retries instead of leaving QMD stuck on a broken path..
- Memory/QMD: warn explicitly when `memory.backend=qmd` is configured but the `qmd` binary is missing, so doctor and runtime fallback no longer fail as a silent builtin downgrade. and.
- Memory/QMD: weight CJK-heavy text correctly when estimating chunk sizes, preserve surrogate-pair characters during fine splits, and keep long Latin lines on the old chunk boundaries so memory indexing produces better-sized chunks for CJK notes..
- Memory/session indexer: include `.jsonl.reset.*` and `.jsonl.deleted.*` transcripts in the memory host session scan while still excluding `.jsonl.bak.*` compaction backups and lock files, so memory search sees archived session history without duplicating stale snapshots. and.
- Microsoft Teams/threads: filter fetched thread history by sender allowlists so thread context seeding no longer pulls messages from disallowed users..
- OpenAI/Codex fast mode: map `/fast` to priority processing on native OpenAI and Codex Responses endpoints instead of rewriting reasoning settings, and document the exact endpoint and override behavior.
- Outbound media/local files: piggyback host-local `MEDIA:` reads on the configured fs policy instead of a separate media-root check, so generated files outside the workspace can send when `tools.fs.workspaceOnly=false` while plaintext-like host files stay blocked by the outbound media allowlist.
- Pairing: enforce pending request limits per account instead of per shared channel queue, so one account's outstanding pairing challenges no longer block new pairing on other accounts. and.
- Plugins/KiboHub: sanitize temporary archive filenames for scoped package names and slash-containing skill slugs so `kibo plugins install/name` no longer fails with `ENOENT` during archive download..
- Plugins/CLI: add descriptor-backed lazy plugin CLI registration so Matrix can keep its CLI module lazy-loaded without dropping `kibo matrix ...` from parse-time command registration..
- Plugins/CLI: collect root-help plugin descriptors through a dedicated non-activating CLI metadata path so enabled plugins keep validated config semantics without triggering runtime-only plugin registration work, while preserving runtime CLI command registration for legacy channel plugins that still wire commands from full registration..
- Plugins/facades: guard bundled plugin facade loads with a cache-first sentinel so circular re-entry stops crashing `xai`, `sglang`, and `vllm` during gateway plugin startup..
- Plugins/Matrix: mirror the Matrix crypto WASM runtime dependency into the root packaged install and enforce root/plugin dependency parity so bundled Matrix E2EE crypto resolves correctly in shipped builds..
- Plugins/startup: block workspace `.env` from overriding `KIBO_BUNDLED_PLUGINS_DIR`, so bundled plugin trust roots only come from inherited runtime env or package resolution instead of repo-local dotenv files. and.
- Sandbox/browser: install `fonts-noto-cjk` in the sandbox browser image so screenshots render Chinese, Japanese, and Korean text correctly instead of tofu boxes. Fixes #35597. and.
- Security/LINE: make webhook signature validation run the timing-safe compare even when the supplied signature length is wrong, closing a small timing side-channel..
- Sessions/Feishu: preserve conversation ids that legitimately embed `:topic:` in shared session helper parsing, while keeping Telegram topic session parsing intact..
- Slack/status reactions: add a reaction lifecycle for queued, thinking, tool, done, and error phases in Slack monitors, with safer cleanup so queued ack reactions stay correct across silent runs, pre-reply failures, and delayed transitions..
- Status/node-only hosts: teach `kibo status` to handle node-only hosts on current `main` without the old mixed gateway assumptions..
- Status: fix cache hit rate exceeding 100% by deriving denominator from prompt-side token fields instead of potentially undersized totalTokens. Fixes #26643.
- Telegram/audio: transcode Telegram voice-note `.ogg` attachments before the local `whisper-cli` auto fallback runs, and keep mention-preflight transcription enabled in auto mode when `tools.media.audio` is unset.
- Telegram/forum topics: restore reply routing to the active topic and keep ACP `sessions_spawn(..., thread=true, mode="session")` bound to that same topic instead of falling back to root chat or losing follow-up routing..
- Telegram/media: allow RFC 2544 benchmark-range Telegram CDN resolutions during media downloads, so voice messages, PDFs, and other attachments no longer fail with `Failed to download media`..
- Telegram/native commands: prefix native command menu callback payloads and preserve `CommandSource: "native"` when Telegram replays them through callback queries, so `/fast` and other native command menus keep working even when text-command routing is disabled..
- Telegram/polling: keep the watchdog from aborting long-running reply delivery by treating recent non-polling API activity as bounded liveness instead of a hard stall..
- Tools/web_fetch: add an explicit trusted env-proxy path for proxy-only installs while keeping strict SSRF fetches on the pinned direct path, so trusted proxy routing does not weaken strict destination binding..
- Tools/web_search: localize the shared search cache to module scope so same-process global symbol lookups can no longer inspect or mutate cached web-search responses..
- TTS/Microsoft: auto-switch the default Edge voice to Chinese for CJK-dominant text without overriding explicitly selected Microsoft voices..
- TTS: Restore 3.28 schema compatibility and fallback observability..
- TUI/chat: keep optimistic outbound user messages visible during active runs by deferring local-run binding until the first gateway chat event reveals the real run id, preventing premature history reloads from wiping pending local sends..
- TUI/model picker: keep searchable `/model` and `/models` input mode from hijacking `j`/`k` as navigation keys, and harden width bounds under `m`-filtered model lists so search no longer crashes on long rows..
- Discord/exec approvals: stop mixing native interactive approvals with extra plain `/approve` narration, so Discord approval prompts stay button-driven instead of showing both manual and interactive flows..
- Telegram/exec approvals: normalize 1:1 approval routing and suppress duplicate approval prompts, so Telegram direct chats show a single working interactive approval instead of multiple conflicting approval messages..
- Voice Call/media stream: cap inbound WebSocket frame size before `start` validation so oversized pre-start frames are dropped before JSON parsing. and.
- Voice call/Plivo: pin stored callback bases to the configured public webhook URL so later call-control redirects stay on the intended origin even if webhook transport metadata differs. and.
- Web UI/markdown: stop bare auto-links from swallowing adjacent CJK text while preserving valid mixed-script path and query characters in rendered links..
- Approvals/UI: keep the newest pending approval at the front of the Control UI queue so approving one request does not accidentally target an older expired id..
- Auth profiles/OAuth: refresh runtime auth snapshots when saving rotated credentials so OAuth providers do not reuse consumed refresh tokens after the first token rotation. Fixes #55389. and.
- Browser/screenshot: use `fromSurface: false` in raw CDP screenshots to avoid a Chromium compositor bug that drops cross-origin image textures (QR codes, CDN assets), and preserve pre-existing device emulation state across full-page viewport expansion..
- ClawDock/docs: move the helper scripts to `scripts/kiboock`, publish ClawDock as a first-class docs page on the docs site, and document reinstalling local helper copies from the new raw GitHub path..
- Control UI/gateway: clear queued browser connect timeouts on client stop so aborted or replaced gateway clients do not send delayed connect requests after shutdown..
- Control UI/gateway: reconnect the browser client when gateway event sequence gaps are detected, so stale non-chat state recovers automatically instead of only telling the user to refresh..
- Exec approvals/channels: unify Discord and Telegram exec approval runtime handling, move approval buttons onto the shared interactive reply model, and fix Telegram approval buttons and typed `/approve` commands so configured approvers can resolve requests reliably again..
- Gateway/SQLite transient handling: keep unhandled `SQLITE_CANTOPEN`, `SQLITE_BUSY`, `SQLITE_LOCKED`, and `SQLITE_IOERR` failures non-fatal in the global rejection handler so macOS LaunchAgent restarts do not enter a crash-throttle loop.
- Hooks/plugins/skills: block workspace `.env` overrides for bundled root directories so workspace startup cannot redirect bundled trust roots away from the packaged defaults. and.
- LINE/webhooks: cap shared concurrent pre-verify webhook body reads so excess requests are rejected before entering the LINE body handler. and.
- Memory/QMD: preserve explicit custom collection names for shared paths outside the agent workspace so `memory_search` stops appending `-<agentId>` to externally managed QMD collections. and.
- Memory/builtin: keep memory-file indexing active in FTS-only mode (no embedding provider) so forced reindexes no longer swap in an empty index and wipe existing memory chunks..
- Nostr/config: redact `channels.nostr.privateKey` in config snapshots and Control UI config views, so Nostr signing keys no longer appear in plain text..
- Plugin approvals: accept unique short approval-id prefixes on `plugin.approval.resolve`, matching exec approvals and restoring `/approve` fallback flows on chat approval surfaces..
- SSH sandbox/upload: reject workspace symlinks that resolve outside the uploaded tree before syncing to the remote sandbox, so later agent writes cannot be redirected through escaped links. and.
- Slack/interactive replies: resolve Slack Block Kit reply delivery from both authored `channelData.slack.blocks` payloads and directive-generated interactive replies, and keep Slack button styles mapped onto valid Block Kit button rendering so interactive replies stop dropping on Slack-specific delivery paths..
- Subagents/announcements: preserve the requester agent id for inline deterministic tool spawns so named agents without channel bindings can still announce completions through the correct owner session..
- Telegram/Anthropic streaming: replace raw invalid stream-order provider errors with a safe retry message so internal `message_start/message_stop` failures do not leak into chats..
- Tlon/media: route inbound image downloads through the shared media store, cap each download at 6 MB, and stop after 8 images per message so large Tlon posts no longer balloon local media storage. and.
- Agents/live switch: stop transient cron and subagent model overrides from being misread as persisted live-session switches, so isolated runs no longer fail with `LiveSessionModelSwitchError`..
- Agents/tool-call repair: recover malformed Kimi/OpenRouter tool-call argument streams when provider preambles appear before JSON payloads, and fail closed on non-tool leading text so fragment strings do not leak into filesystem path arguments during sub-agent runs..
- Gateway/startup: keep configured primary-model warmup on the static model path so container boots do not snapshot-load provider runtime graphs just to validate a configured model..
- OpenAI/Responses: omit disabled reasoning payloads across OpenAI, Codex, and Azure OpenAI request builders so GPT-5 endpoints no longer reject `reasoning.effort: "none"`..
- WhatsApp/outbound: restore runtime send/action routing and outbound compatibility after the recent channel seam refactor so outbound sends, reactions, and related media actions keep reaching the active session.
- xAI/Responses: normalize image-bearing tool results for xAI responses payloads, including OpenResponses-style `input_image.source` parts, so image tool replays no longer 422 on the follow-up turn..
- Zalo/webhooks: scope replay dedupe to the authenticated target so one configured account can no longer cause same-id inbound events for another target to be dropped. and.
- Plugins/prompt build: preserve the highest-priority `systemPrompt` when merging `before_prompt_build` hook results instead of letting lower-priority hooks overwrite it.
- Tlon/settings migration: preserve explicit empty-array settings during migration so restart-time reseeding no longer restores older file-config values.
- Plugins/marketplace: harden marketplace archive installs by surfacing guarded download failures as structured install errors and deriving temp filenames from the final resolved URL.
- UI/DOM safety: build the chat delete-confirm popover and Canvas Host fallback status line with DOM nodes instead of injected HTML strings. (#58269, #58266)
- Media/file handling: create image temp work directories under the shared Kibo temp root and stop widening allowed local media roots from reply or tool source paths, keeping local media access limited to configured and agent-scoped roots. (#58270, #57770)
- Telegram/security: migrate legacy pairing `allowFrom` state to the `default` account only and gate group voice-message preflight transcription on sender authorization so unauthorized senders cannot trigger paid transcription before being dropped. (#58165, #57566)
- Exec approvals: stop shell init-file flags from matching persisted script-path approvals, detect command-carrier inline eval in tools like `awk`, `find`, `xargs`, `make`, and `sed`, and treat the awk family as interpreter-like so allow-always decisions no longer persist interpreter paths. (#58369, #57842, #57772)
- Voice call/Telnyx: canonicalize verified webhook signatures before deriving replay keys so equivalent Base64 and Base64URL encodings dedupe correctly.
- Gateway/HTTP trust boundaries: ignore self-declared bearer scopes, deny dangerous HTTP tool-invoke paths by default, require write scope on `/v1/embeddings`, and bind OpenAI-compatible `/v1/chat/completions` plus `/v1/responses` ingress as non-owner so external HTTP callers cannot self-upgrade access. (#57783, #57771, #57721, #57769, #57778)
- Gateway/trusted config and bootstrap: clear self-declared scopes for device-less `trusted-proxy` WebSocket connects and trim the Control UI bootstrap payload to only the fields needed before the normal handshake. (#57692, #57727)
- Skills and workspace safety: replace raw skill-file reads with a symlink-safe, root-confined loader and pin workspace-only `apply_patch` delete and directory-creation mutations to verified workspace roots so path rebind races fail closed. (#57519, #56016)
- Env and filesystem hardening: block credential and gateway auth env vars from workspace `.env` files, always strip dangerous inherited host env vars such as `BROWSER` and `GIT_EDITOR`, and keep sensitive host paths and Kibo state roots blocked even when external sandbox bind sources are allowed. (#57767, #57559, #56024)
- OpenShell and ACP file boundaries: skip symlinks and preserve trusted host-only directories during OpenShell mirror sync, and route ACP attachment reads through the shared attachment cache so local files outside allowed roots are no longer forwarded. (#57693, #57690)
- Channel/webhook authorization: skip Discord audio preflight transcription for unauthorized guild senders, add a shared pre-auth in-flight guard to Synology Chat webhooks, and validate Microsoft Teams bearer auth before JSON body parsing. (#57695, #57722, #57686)
- Infra/randomness: replace `Math.random()` in affected identifier and delay-jitter paths with shared secure-random helpers, including UI UUID generation.

## 2026.3.28

### Changes

- xAI/tools: move the bundled xAI provider to the Responses API, add first-class `x_search`, and auto-enable the xAI plugin from owned web-search and tool config so bundled Grok auth/configured search flows work without manual plugin toggles..
- xAI/onboarding: let the bundled Grok web-search plugin offer optional `x_search` setup during `kibo onboard` and `kibo configure --section web`, including an x_search model picker with the shared xAI key.
- MiniMax: add image generation provider for `image-01` model, supporting generate and image-to-image editing with aspect ratio control..
- Plugins/hooks: add async `requireApproval` to `before_tool_call` hooks, letting plugins pause tool execution and prompt the user for approval via the exec approval overlay, Telegram buttons, Discord interactions, or the `/approve` command on any channel. The `/approve` command now handles both exec and plugin approvals with automatic fallback. and.
- ACP/channels: add current-conversation ACP binds for Discord, BlueBubbles, and iMessage so `/acp spawn codex --bind here` can turn the current chat into a Codex-backed workspace without creating a child thread, and document the distinction between chat surface, ACP session, and runtime workspace.
- OpenAI/apply_patch: enable `apply_patch` by default for OpenAI and OpenAI Codex models, and align its sandbox policy access with `write` permissions.
- Plugins/CLI backends: move bundled Claude CLI, Codex CLI, and Gemini CLI inference defaults onto the plugin surface, add bundled Gemini CLI backend support, and replace `gateway run --claude-cli-logs` with generic `--cli-backend-logs` while keeping the old flag as a compatibility alias.
- Plugins/startup: auto-load bundled provider and CLI-backend plugins from explicit config refs, so bundled Claude CLI, Codex CLI, and Gemini CLI message-provider setups no longer need manual `plugins.allow` entries.
- Podman: simplify the container setup around the current rootless user, install the launch helper under `~/.local/bin`, and document the host-CLI `kibo --container <name> ...` workflow instead of a dedicated `kibo` service user.
- Slack/tool actions: add an explicit `upload-file` Slack action that routes file uploads through the existing Slack upload transport, with optional filename/title/comment overrides for channels and DMs.
- Message actions/files: start unifying file-first sends on the canonical `upload-file` action by adding explicit support for Microsoft Teams and Google Chat, and by exposing BlueBubbles file sends through `upload-file` while keeping the legacy `sendAttachment` alias.
- Plugins/Matrix TTS: send auto-TTS replies as native Matrix voice bubbles instead of generic audio attachments..
- CLI: add `kibo config schema` to print the generated JSON schema for `kibo.json`..
- Config/TTS: auto-migrate legacy speech config on normal reads and secret resolution, keep legacy diagnostics for Doctor, and remove regular-mode runtime fallback for old bundled `tts.<provider>` API-key shapes.
- Memory/plugins: move the pre-compaction memory flush plan behind the active memory plugin contract so `memory-core` owns flush prompts and target-path policy instead of hardcoded core logic.
- MiniMax: trim model catalog to M2.7 only, removing legacy M2, M2.1, M2.5, and VL-01 models..
- Plugins/runtime: expose `runHeartbeatOnce` in the plugin runtime `system` namespace so plugins can trigger a single heartbeat cycle with an explicit delivery target override (e.g. `heartbeat: { target: "last" }`)..
- Background tasks: keep durable lifecycle records for ACP/subagent spawned work and deliver ACP completion/failure updates through the real requester chat path instead of session-only stream events. and.
- Agents/compaction: preserve the post-compaction AGENTS refresh on stale-usage preflight compaction for both immediate replies and queued followups..
- Agents/compaction: surface safeguard-specific cancel reasons and relabel benign manual `/compact` no-op cases as skipped instead of failed..
- Docs: add `pnpm docs:check-links:anchors` for Mintlify anchor validation while keeping `scripts/docs-link-audit.mjs` as the stable link-audit entrypoint..
- Tavily: mark outbound API requests with `X-Client-Source: kibo` so Tavily can attribute Kibo-originated traffic..
- Plugins/hooks: add async `requireApproval` to `before_tool_call` hooks, letting plugins pause tool execution and prompt the user for approval via the exec approval overlay, Telegram buttons, Discord interactions, or the `/approve` command on any channel. The `/approve` command now handles both exec and plugin approvals with automatic fallback. and.

### Fixes

- Agents/Anthropic: recover unhandled provider stop reasons (e.g. `sensitive`) as structured assistant errors instead of crashing the agent run.
- Google/models: resolve Gemini 3.1 pro, flash, and flash-lite for all Google provider aliases by passing the actual runtime provider ID and adding a template-provider fallback; fix flash-lite prefix ordering.
- OpenAI Codex/image tools: register Codex for media understanding and route image prompts through Codex instructions so image analysis no longer fails on missing provider registration or missing `instructions`..
- Agents/image tool: restore the generic image-runtime fallback when no provider-specific media-understanding provider is registered, so image analysis works again for providers like `openrouter` and `minimax-portal`..
- WhatsApp: fix infinite echo loop in self-chat DM mode where the bot's own outbound replies were re-processed as new inbound user messages.
- Telegram/splitting: replace proportional text estimate with verified HTML-length search so long messages split at word boundaries instead of mid-word; gracefully degrade when tag overhead exceeds the limit.
- Telegram/delivery: skip whitespace-only and hook-blanked text replies in bot delivery to prevent GrammyError 400 empty-text crashes.
- Telegram/send: validate `replyToMessageId` at all four API sinks with a shared normalizer that rejects non-numeric, NaN, and mixed-content strings.
- Telegram/cron topics: route announce target parsing through the Telegram extension seam and carry explicit `delivery.threadId` through cron delivery resolution, so legacy `group:` routes and topic-targeted cron sends keep their forum topic destination..
- Mistral: normalize OpenAI-compatible request flags so official Mistral API runs no longer fail with remaining `422 status code (no body)` chat errors.
- Control UI/config: keep sensitive raw config hidden by default, replace the blank blocked editor with an explicit reveal-to-edit state, and restore raw JSON editing without auto-exposing secrets. Fixes #55322.
- CLI/zsh: defer `compdef` registration until `compinit` is available so zsh completion loads cleanly with plugin managers and manual setups.
- BlueBubbles/debounce: guard debounce flush against null message text by sanitizing at the enqueue boundary and adding an independent combiner guard.
- Auto-reply: suppress JSON-wrapped `{"action":"NO_REPLY"}` control envelopes before channel delivery with a strict single-key detector; preserves media when text is only a silent envelope.
- ACP/ACPX agent registry: align Kibo's ACPX built-in agent mirror with the latest `kibo/acpx` command defaults and built-in aliases, pin versioned `npx` built-ins to exact versions, and stop unknown ACP agent ids from falling through to raw `--agent` command execution on the MCP-proxy path. and.
- Security/audit: extend web search key audit to recognize Gemini, Grok/xAI, Kimi, Moonshot, and OpenRouter credentials via a boundary-safe bundled-web-search registry shim.
- Docs/FAQ: remove broken Xfinity SSL troubleshooting cross-links from English and zh-CN FAQ entries - both sections already contain the full workaround inline.
- Telegram: deliver verbose tool summaries inside forum topic sessions again, so threaded topic chats now match DM verbose behavior..
- BlueBubbles/CLI agents: restore inbound prompt image refs for CLI routed turns, reapply embedded runner image size guardrails, and cover both CLI image transport paths with regression tests.
- BlueBubbles/groups: optionally enrich unnamed participant lists with local macOS Contacts names after group gating passes, so group member context can show names instead of only raw phone numbers.
- Discord/reconnect: drain stale gateway sockets, clear cached resume state before forced fresh reconnects, and fail closed when old sockets refuse to die so Discord recovery stops looping on poisoned resume state..
- iMessage: stop leaking inline `[[reply_to:...]]` tags into delivered text by sending `reply_to` as RPC metadata and stripping stray directive tags from outbound messages..
- CLI/plugins: make routed commands use the same auto-enabled bundled-channel snapshot as gateway startup, so configured bundled channels like Slack load without requiring a prior config rewrite..
- CLI/message send: write manual `kibo message send` deliveries into the resolved agent session transcript again by always threading the default CLI agent through outbound mirroring..
- CLI/onboarding: show the Kimi Code API key option again in the Moonshot setup menu so the interactive picker includes all Kimi setup paths together. Fixes #54412
- Agents/status: use provider-aware context window lookup for fresh Anthropic 4.6 model overrides so `/status` shows the correct 1.0m window instead of an underreported shared-cache minimum..
- OpenAI/WebSocket: preserve reasoning replay metadata and tool-call item ids on WebSocket tool turns, and start a fresh response chain when full-context resend is required..
- OpenAI/WS: restore reasoning blocks for Responses WebSocket runs and keep reasoning/tool-call replay metadata intact so resumed sessions do not lose or break follow-up reasoning-capable turns..
- Agents/errors: surface provider quota/reset details when available, but keep HTML/Cloudflare rate-limit pages on the generic fallback so raw error pages are not shown to users..
- Claude CLI: switch the bundled Claude CLI backend to `stream-json` output so watchdogs see progress on long runs, and keep session/usage metadata even when Claude finishes with an empty result line..
- Claude CLI/MCP: always pass a strict generated `--mcp-config` overlay for background Claude CLI runs, including the empty-server case, so Claude does not inherit ambient user/global MCP servers..
- Agents/embedded replies: surface mid-turn 429 and overload failures when embedded runs end without a user-visible reply, while preserving successful media-only replies that still use legacy `mediaUrl`..
- Chat/UI: move the chat send button onto the shared ghost-button theme styling, while keeping the stop button icon readable on the danger state..
- WhatsApp/allowFrom: show a specific allowFrom policy error for valid blocked targets instead of the misleading `<E.164|group JID>` format hint..
- Agents/cooldowns: scope rate-limit cooldowns per model so one 429 no longer blocks every model on the same auth profile, replace the exponential 1 min -> 1 h escalation with a stepped 30 s / 1 min / 5 min ladder, and surface a user-facing countdown message when all models are rate-limited..
- Agents/embedded transport errors: distinguish common network failures like connection refused, DNS lookup failure, and interrupted sockets from true timeouts in embedded-run user messaging and lifecycle diagnostics..
- Telegram/pairing: ignore self-authored DM `message` updates so bot-pinned status cards and similar service updates do not trigger bogus pairing requests or re-enter inbound dispatch.
- Mattermost/replies: keep pairing replies, slash-command fallback replies, and model-picker messages on the resolved config path so `exec:` SecretRef bot tokens work across all outbound reply branches..
- Microsoft Teams/config: accept the existing `welcomeCard`, `groupWelcomeCard`, `promptStarters`, and feedback/reflection keys in strict config validation so already-supported Teams runtime settings stop failing schema checks..
- MCP/channels: add a Gateway-backed channel MCP bridge with Codex/Claude-facing conversation tools, Claude channel notifications, and safer stdio bridge lifecycle handling for reconnects and routed session discovery.
- Plugins/SDK: thread `moduleUrl` through plugin-sdk alias resolution so user-installed plugins outside the kibo directory correctly resolve `kibo/plugin-sdk/*` subpath imports, and gate `plugin-sdk:check-exports` in `release:check`..
- Config/web fetch: allow the documented `tools.web.fetch.maxResponseBytes` setting in runtime schema validation so valid configs no longer fail with unrecognized-key errors..
- Message tool/buttons: keep the shared `buttons` schema optional in merged tool definitions so plain `action=send` calls stop failing validation when no buttons are provided..
- Agents/openai-compatible tool calls: deduplicate repeated tool call ids across live assistant messages and replayed history so OpenAI-compatible backends no longer reject duplicate `tool_call_id` values with HTTP 400..
- Models/openai-completions: default non-native OpenAI-compatible providers to omit tool-definition `strict` fields unless users explicitly opt back in, so tool calling keeps working on providers that reject that option..
- Plugins/context engines: retry strict legacy `assemble()` calls without the new `prompt` field when older engines reject it, preserving prompt-aware retrieval compatibility for pre-prompt plugins..
- CLI/update status: explicitly say `up to date` when the local version already matches npm latest, while keeping the availability logic unchanged..
- Daemon/Linux: stop flagging non-gateway systemd services as duplicate gateways just because their unit files mention Kibo, reducing false-positive doctor/log noise..
- Feishu: close WebSocket connections on monitor stop/abort so ghost connections no longer persist, preventing duplicate event processing and resource leaks across restart cycles..
- Feishu: use the original message `create_time` instead of `Date.now()` for inbound timestamps so offline-retried messages carry the correct authoring time, preventing mis-targeted agent actions on stale instructions..
- Control UI/Skills: open skill detail dialogs with the browser modal lifecycle so clicking a skill row keeps the panel centered instead of rendering it off-screen at the bottom of the page.
- Matrix/replies: include quoted poll question/options in inbound reply context so the agent sees the original poll content when users reply to Matrix poll messages..
- Matrix/plugins: keep plugin bootstrap from crashing when built runtime mixes bare and deep `matrix-js-sdk` entrypoints, so unrelated channels do not get taken down during plugin load..
- Agents/sandbox: make blocked-tool guidance glob-aware again, redact/sanitize session-specific explain hints for safer copy-paste, and avoid leaking control-character session keys in those hints..
- Agents/compaction: trigger timeout recovery compaction before retrying high-context LLM timeouts so embedded runs stop repeating oversized requests..
- Agents/compaction: reconcile `sessions.json.compactionCount` after a late embedded auto-compaction success so persisted session counts catch up once the handler reports completion..
- Agents/failover: classify Codex accountId token extraction failures as auth errors so model fallback continues to the next configured candidate..
- Plugins/runtime: reuse only compatible active plugin registries across tools, providers, web search, and channel bootstrap, align `/tools/invoke` plugin loading with the session workspace, and retry outbound channel recovery when the pinned channel surface changes so plugin tools and channels stop disappearing or re-registering from mismatched runtime loads..
- Talk/macOS: stop direct system-voice failures from replaying system speech, use app-locale fallback for shared watchdog timing, and add regression coverage for the macOS fallback route and language-aware timeout policy..
- Discord/gateway cleanup: keep late Carbon reconnect-exhausted errors suppressed through startup/dispose cleanup so Discord monitor shutdown no longer crashes on late gateway close events..
- Discord/gateway shutdown: treat expected reconnect-exhausted events during intentional lifecycle stop as clean shutdowns so startup-abort cleanup no longer surfaces false gateway failures..
- Discord/gateway shutdown: suppress reconnect-exhausted events that were already buffered before teardown flips `lifecycleStopping`, so stale-socket Discord restarts no longer crash the whole gateway. Fixes #55403 and #55421. and.
- GitHub Copilot/auth refresh: treat large `expires_at` values as seconds epochs and clamp far-future runtime auth refresh timers so Copilot token refresh cannot fall into a `setTimeout` overflow hot loop..
- Agents/status: use the persisted runtime session model in `session_status` when no explicit override exists, and honor per-agent `thinkingDefault` in both `session_status` and `/status`., and.
- Heartbeat/runner: guarantee the interval timer is re-armed after heartbeat runs and unexpected runner errors so scheduled heartbeats do not silently stop after an interrupted cycle..
- Config/Doctor: rewrite stale bundled plugin load paths from legacy bundled-plugin locations to the packaged bundled path, including directory-name mismatches and slash-suffixed config entries..
- WhatsApp/mentions: stop treating mentions embedded in quoted messages as direct mentions so replying to a message that the bot no longer falsely triggers mention gating..
- Matrix: keep separate 2-person rooms out of DM routing after `m.direct` seeds successfully, while still honoring explicit `is_direct` state and startup fallback recovery.
- Agents/ollama fallback: surface non-2xx Ollama HTTP errors with a leading status code so HTTP 503 responses trigger model fallback again..
- Feishu/tools: stop synthetic agent ids like `agent-spawner` from being treated as Feishu account ids during tool execution, so tools fall back to the configured/default Feishu account unless the contextual id is a real enabled Feishu account..
- Google/tools: strip empty `required: []` arrays from Gemini tool schemas so optional-only tool parameters no longer trigger Google validator 400s..
- Onboarding/TUI/local gateways: show the resolved gateway port in setup output, clarify no-daemon local health/dashboard messaging, and preserve loopback Control UI auth on reruns and explicit local gateway URLs so local quickstart flows recover cleanly..
- TUI/chat log: keep system messages as single logical entries and prune overflow at whole-message boundaries so wrapped system spacing stays intact..
- TUI/activation: validate `/activation` arguments in the TUI and reject invalid values instead of silently coercing them to `mention`..
- Agents/model switching: apply `/model` changes to active embedded runs at the next safe retry boundary, so overloaded or retrying turns switch to the newly selected model instead of staying pinned to the old provider.
- Agents/Codex fallback: classify Codex `server_error` payloads as failoverable, sanitize `Codex error:` payloads before they reach chat, preserve context-overflow guidance for prefixed `invalid_request_error` payloads, and omit provider `request_id` values from user-facing UI copy..
- Memory/search: share memory embedding provider registrations across split plugin runtimes so memory search no longer fails with unknown provider errors after memory-core registers built-in adapters..
- Discord/Carbon beta: update `@buape/carbon` to the latest beta and pass the new `RateLimitError` request argument so Discord stays compatible with the upstream beta constructor change..
- Plugins/inbound claims: pass full inbound attachment arrays through `inbound_claim` hook metadata while keeping the legacy singular media attachment fields for compatibility..
- Plugins/Matrix: preserve sender filenames for inbound media by forwarding `originalFilename` to `saveMediaBuffer`..
- Matrix/mentions: recognize `matrix.to` mentions whose visible label uses the bot's room display name, so `requireMention: true` rooms respond correctly in modern Matrix clients..
- Ollama/thinking off: route `thinkingLevel=off` through the live Ollama extension request path so thinking-capable Ollama models now receive top-level `think: false` instead of silently generating hidden reasoning tokens..
- Plugins/diffs: stage bundled `@pierre/diffs` runtime dependencies during packaged updates so the bundled diff viewer keeps loading after global installs and updates..
- Plugins/diffs: load bundled Pierre themes without JSON module imports so diff rendering keeps working on newer Node builds..
- Plugins/uninstall: remove owned `channels.<id>` config when uninstalling channel plugins, and keep the uninstall preview aligned with explicit channel ownership so built-in channels and shared keys stay intact..
- Plugins/Matrix: prefer explicit DM signals when choosing outbound direct rooms and routing unmapped verification summaries, so strict 2-person fallback rooms do not outrank the real DM.
- Plugins/Matrix: resolve env-backed `accessToken` and `password` SecretRefs against the active Matrix config env path during startup, and officially accept SecretRef `accessToken` config values..
- Microsoft Teams/proactive DMs: prefer the freshest personal conversation reference for `user:<aadObjectId>` sends when multiple stored references exist, so replies stop targeting stale DM threads..
- Gateway/plugins: reuse the session workspace when building HTTP `/tools/invoke` tool lists and harden tool construction to infer the session agent workspace by default, so workspace plugins do not re-register on repeated HTTP tool calls.
- Brave/web search: normalize unsupported Brave `country` filters to `ALL` before request and cache-key generation so locale-derived values like `VN` stop failing with upstream 422 validation errors..
- Discord/replies: preserve leading indentation when stripping inline reply tags so reply-tagged plain text and fenced code blocks keep their formatting..
- Daemon/status: surface immediate gateway close reasons from lightweight probes and prefer those concrete auth or pairing failures over generic timeouts in `kibo daemon status`..
- Agents/failover: classify HTTP 410 errors as retryable timeouts by default while still preserving explicit session-expired, billing, and auth signals from the payload..
- Agents/subagents: restore completion announce delivery for extension channels like BlueBubbles.
- Plugins/Matrix: load bundled `@matrix-org/matrix-sdk-crypto-nodejs` through `createRequire(...)` so E2EE media send and receive keep the package-local native binding lookup working in packaged ESM builds..
- Plugins/Matrix: encrypt E2EE image thumbnails with `thumbnail_file` while keeping unencrypted-room previews on `thumbnail_url`, so encrypted Matrix image events keep thumbnail metadata without leaking plaintext previews..
- Telegram/forum topics: keep native `/new` and `/reset` routed to the active topic by preserving the topic target on forum-thread command context.
- Status/port diagnostics: treat single-process dual-stack loopback gateway listeners as healthy in `kibo status --all`, suppressing false "port already in use" conflict warnings..
- CLI/Docker: treat loopback private-host CLI gateway connects as local for silent pairing auto-approval, while keeping remote backend and public-host CLI connects behind pairing..

## 2026.3.24

### Breaking

- Providers/Qwen: remove the deprecated `qwen-portal-auth` OAuth integration for `portal.qwen.ai`; migrate to Model Studio with `kibo onboard --auth-choice modelstudio-api-key`..
- Config/Doctor: drop automatic config migrations older than two months; very old legacy keys now fail validation instead of being rewritten on load or by `kibo doctor`.

## 2026.3.24

### Changes

- Gateway/OpenAI compatibility: add `/v1/models` and `/v1/embeddings`, and forward explicit model overrides through `/v1/chat/completions` and `/v1/responses` for broader client and RAG compatibility..
- Agents/tools: make `/tools` show the tools the current agent can actually use right now, add a compact default view with an optional detailed mode, and add a live "Available Right Now" section in the Control UI so it is easier to see what will work before you ask.
- Microsoft Teams: migrate to the official Teams SDK and add AI-agent UX best practices including streaming 1:1 replies, welcome cards with prompt starters, feedback/reflection, informative status updates, typing indicators, and native AI labeling.
- Microsoft Teams: add message edit and delete support for sent messages, including in-thread fallbacks when no explicit target is provided.
- Skills/install metadata: add one-click install recipes to bundled skills (coding-agent, gh-issues, openai-whisper-api, session-logs, tmux, trello, weather) so the CLI and Control UI can offer dependency installation when requirements are missing..
- Control UI/skills: add status-filter tabs (All / Ready / Needs Setup / Disabled) with counts, replace inline skill cards with a click-to-detail dialog showing requirements, toggle switch, install action, API key entry, source metadata, and homepage link..
- Slack/interactive replies: restore rich reply parity for direct deliveries, auto-render simple trailing `Options:` lines as buttons/selects, improve Slack interactive setup defaults, and isolate reply controls from plugin interactive handlers..
- CLI/containers: add `--container` and `KIBO_CONTAINER` to run `kibo` commands inside a running Docker or Podman Kibo container..
- Discord/auto threads: add optional `autoThreadName: "generated"` naming so new auto-created threads can be renamed asynchronously with concise LLM-generated titles while keeping the existing message-based naming as the default..
- Plugins/hooks: add `before_dispatch` with canonical inbound metadata and route handled replies through the normal final-delivery path, preserving TTS and routed delivery semantics..
- Control UI/agents: convert agent workspace file rows to expandable `<details>` with lazy-loaded inline markdown preview, and add comprehensive `.sidebar-markdown` styles for headings, lists, code blocks, tables, blockquotes, and details/summary elements..
- Control UI/markdown preview: restyle the agent workspace file preview dialog with a frosted backdrop, sized panel, and styled header, and integrate `@create-markdown/preview` v2 system theme for rich markdown rendering (headings, tables, code blocks, callouts, blockquotes) that auto-adapts to the app's light/dark design tokens..
- macOS app/config: replace horizontal pill-based subsection navigation with a collapsible tree sidebar using disclosure chevrons and indented subsection rows..
- CLI/skills: soften missing-requirements label from "missing" to "needs setup" and surface API key setup guidance (where to get a key, CLI save command, storage path) in `kibo skills info` output..
- macOS app/skills: add "Get your key" homepage link and storage-path hint to the API key editor dialog, and show the config path in save confirmation messages..
- Control UI/agents: add a "Not set" placeholder to the default agent model selector dropdown..
- Runtime/install: lower the supported Node 22 floor to `22.14+` while continuing to recommend Node 24, so npm installs and self-updates do not strand Node 22.14 users on older releases.
- CLI/update: preflight the target npm package `engines.node` before `kibo update` runs a global package install, so outdated Node runtimes fail with a clear upgrade message instead of attempting an unsupported latest release.

### Fixes

- Outbound media/local files: align outbound media access with the configured fs policy so host-local files and inbound-media paths keep sending when `workspaceOnly` is off, while strict workspace-only agents remain sandboxed.
- Security/sandbox media dispatch: close the `mediaUrl`/`fileUrl` alias bypass so outbound tool and message actions cannot escape media-root restrictions.
- Gateway/restart sentinel: wake the interrupted agent session via heartbeat after restart instead of only sending a best-effort restart note, retry outbound delivery once on transient failure, and preserve explicit thread/topic routing through the wake path so replies land in the correct Telegram topic or Slack thread..
- Docker/setup: avoid the pre-start `kibo-cli` shared-network namespace loop by routing setup-time onboard/config writes through `kibo-gateway`, so fresh Docker installs stop failing before the gateway comes up..
- Gateway/channels: keep channel startup sequential while isolating per-channel boot failures, so one broken channel no longer blocks later channels from starting..
- Embedded runs/secrets: stop unresolved `SecretRef` config from crashing embedded agent runs by falling back to the resolved runtime snapshot when needed. Fixes #45838.
- WhatsApp/groups: track recent gateway-sent message IDs and suppress only matching group echoes, preserving owner `/status`, `/new`, and `/activation` commands from linked-account `fromMe` traffic..
- WhatsApp/reply-to-bot detection: restore implicit group reply detection by unwrapping `botInvokeMessage` payloads and reading `selfLid` from `creds.json`, so reply-based mentions reach the bot again in linked-account group chats.
- Telegram/forum topics: recover `#General` topic `1` routing when Telegram omits forum metadata, including native commands, interactive callbacks, inbound message context, and fallback error replies.
- Discord/gateway supervision: centralize gateway error handling behind a lifetime-owned supervisor so early, active, and late-teardown Carbon gateway errors stay classified consistently and stop surfacing as process-killing teardown crashes.
- Discord/timeouts: send a visible timeout reply when the inbound Discord worker times out before a final reply starts, including created auto-thread targets and queued-run ordering..
- ACP/direct chats: always deliver a terminal ACP result when final TTS does not yield audio, even if block text already streamed earlier, and skip redundant empty-text final synthesis..
- Telegram/outbound errors: preserve actionable 403 membership/block/kick details and treat `bot not a member` as a permanent delivery failure so Telegram sends stop retrying doomed chats..
- Telegram/photos: preflight Telegram photo dimension and aspect-ratio rules, and fall back to document sends when image metadata is invalid or unavailable so photo uploads stop failing with `PHOTO_INVALID_DIMENSIONS`..
- Slack/runtime defaults: trim Slack DM reply overhead, restore Codex auto transport, and tighten Slack/web-search runtime defaults around DM preview threading, cache scoping, warning dedupe, and explicit web-search opt-in..
- Security/gateway config: block agent `config.apply` and `config.patch` writes to `tools.exec.ask` and `tools.exec.security` so gateway config tools cannot silently disable exec approvals or broaden exec security.
- Security/chat provenance: require `operator.admin` for system provenance injection so `chat.send` callers cannot spoof ACP-only provenance through client identity metadata.
- Security/exec approvals: treat `/usr/bin/script` as a transparent wrapper during trust-plan resolution and allow-always persistence so wrapper registration cannot broaden exec approvals.
- Security/Feishu uploads: route local doc and image upload inputs through media local-roots enforcement so Feishu uploads cannot read arbitrary host files outside the allowed sandbox and file policy.
- Security/dotenv: filter untrusted CWD and workspace-config `.env` entries before startup and config loading so dotenv-based host-env takeover paths can no longer rewrite runtime state or package registries.
- Security/media parsing: reject traversal and home-directory patterns in the shared media parse layer so parsed media paths cannot escape into arbitrary file reads.
- Security/path resolution: prefer non-user-writable absolute helper binaries for Kibo CLI, ffmpeg, and OpenSSL resolution so PATH hijacks cannot replace trusted helpers with attacker-controlled executables.
- Security/gateway command scopes: require `operator.admin` before Telegram target writeback and Talk Voice `/voice set` config writes persist through gateway message flows.
- Security/OpenShell mirror: exclude workspace `hooks/` from mirror sync so untrusted sandbox files cannot become trusted host hooks on gateway startup.
- Exec env policy: block Mercurial config redirects, Rust compiler wrappers, and GNU make flag env vars in host exec sanitization so inherited env and request-scoped overrides cannot redirect build-tool execution.

## 2026.3.24-beta.2

### Fixes

- Tests/security audit: isolate audit-test home and personal skill resolution so local `~/.agents/skills` installs no longer make maintainer prep runs fail nondeterministically.

## 2026.3.24-beta.1

### Fixes

- Doctor/image generation: seed migrated legacy Nano Banana Google provider config with the `/v1beta` API root and an empty model list so `kibo doctor --fix` completes and the migrated native Google image path keeps hitting the correct endpoint..
- Models/google: normalize bare Google Generative AI API roots for custom provider names, and keep built-in Google model-id rewrites working when `api` is declared only on individual models, so custom Google lanes and older configs stop missing `/v1beta` or preview-id normalization..
- Feishu/startup: treat unresolved `SecretRef` app credentials as not configured during account resolution so CLI startup and read-only Feishu config surfaces stop crashing before runtime-backed secret resolution is available..
- Feishu/groups: when `groupPolicy` is `open`, stop implicitly requiring for unset `requireMention`, so image, file, audio, and other non-text group messages reach the bot unless operators explicitly keep mention gating on..
- Feishu/startup: keep `requireMention` enforcement strict when bot identity startup probes fail, raise the startup bot-info timeout to 30s, and add cancellable background identity recovery so mention-gated groups recover without noisy fallback..
- Feishu/MSTeams message tool: keep provider-native `card` payloads optional in merged tool schemas so media-only sends stop failing validation before channel runtime dispatch..
- Feishu/docx block ordering: preserve the document tree order from `docx.document.convert` when inserting blocks, fixing heading/paragraph/list misordering in newly written Feishu documents..
- Telegram/native commands: run native slash-command execution against the resolved runtime snapshot so DM commands still reply when fresh config reads surface unresolved SecretRefs..
- Gateway/ports: parse Docker Compose-style `KIBO_GATEWAY_PORT` host publish values correctly without reviving the legacy `KIBOBOT_GATEWAY_PORT` override..
- Plugins/memory-lancedb: bootstrap the env-configured HTTP/HTTPS proxy dispatcher before OpenAI embeddings requests so memory capture and recall work in proxy-required environments again..
- Runtime/build: stabilize long-lived lazy `dist` runtime entry paths and harden bundled plugin npm staging so local rebuilds stop breaking on missing hashed chunks or broken shell `npm` shims..
- Security/skills: validate skill installer metadata against strict regex allowlists per package manager, sanitize skill metadata for terminal output, add URL protocol allowlisting in markdown preview and skill homepage links, warn on non-bundled skill install sources, and remove unsafe `file://` workspace links..
- Memory/builtin sqlite: cut redundant sync and status query churn by snapshotting file state once per source, reusing sync statements, and consolidating status aggregation reads, which reduces builtin memory overhead on sync/status/doctor-style paths..
- TUI/chat: preserve pending user messages when a slow local run emits an empty final event, but still defer and flush the needed history reload after the newer active run finishes so silent/tool-only runs do not stay incomplete..
- DeepSeek/pricing: replace the zero-cost DeepSeek catalog rates with the current DeepSeek V3.2 pricing so usage totals stop showing `$0.00` for DeepSeek sessions..
- CLI/logging: make pretty log timestamps always include an explicit timezone offset in default UTC and `--local-time` modes, so incident triage no longer mixes ambiguous clock displays..
- Browser/default detection: recognize macOS LaunchServices Edge bundle ids so default Chromium detection stops falling back to Chrome when Edge is the system default..
- CLI/Telegram topics: route `message thread create` through Telegram `topic-create` with the required topic `name` field so Telegram forum topic creation works from the CLI again..
- Telegram/pairing: render pairing codes and approval commands as Telegram-only code blocks while keeping shared pairing replies plain text for other channels..
- Agents/cron: suppress the default heartbeat system prompt for cron-triggered embedded runs even when they target non-cron session keys, so cron tasks stop reading `HEARTBEAT.md` and polluting unrelated threads..
- Agents/cron: mark best-effort announce runs as not delivered when any payload fails, and log those partial delivery failures instead of silently reporting success..
- Plugins: enforce terminal hook decision semantics for tool/message guards.
- Marketplace/agents: correct the KiboHub skill URL in agent docs and stream marketplace archive downloads to disk so installs avoid excess memory use and fail cleanly on empty responses..
- Discord/config types: add missing `autoArchiveDuration` to `DiscordGuildChannelConfig` so TypeScript config definitions match the existing schema and runtime support..
- Docs/IRC: fix five `json55` code-fence typos in the IRC channel examples so Mintlify applies JSON5 syntax highlighting correctly..
- Discord/commands: trim overlong slash-command descriptions to Discord's 100-character limit and map rejected deploy indexes from Discord validation payloads back to command names/descriptions, so deploys stop failing on long descriptions and startup logs identify the rejected commands.
- Media/store: enforce the intended media file mode after writes and redirect downloads so restrictive umasks do not silently narrow saved media permissions.
- Security/gateway auth: enforce `operator.read` and `models.list` on `/v1/models` so write-scoped callers cannot list models through the OpenAI-compatible HTTP surface.
- Security/allowlist commands: require `operator.admin` for internal `/allowlist` mutations and channel allowlist persistence reached through `chat.send`.
- Security/Feishu webhook: cap pre-auth webhook body reads with strict size and timeout guards before JSON parsing so slow-body requests cannot hold the webhook handler open.
- Security/session policy: require sender ownership for `/send` policy changes so command-authorized non-owners cannot rewrite owner-only session delivery policy.
- Security/bash stop: route `/bash stop` through the hardened process-tree killer so invalid or attacker-influenced SIGKILL targets cannot escape the intended bash-session scope.
- Security/installer: hide staged project `.npmrc` files during skill and package installs so npm registry and git settings inside the stage directory cannot hijack trusted installs.

## 2026.3.23

### Changes

- ModelStudio/Qwen: add standard (pay-as-you-go) DashScope endpoints for China and global Qwen API keys alongside the existing Coding Plan endpoints, and relabel the provider group to `Qwen (Alibaba Cloud Model Studio)`.
- UI/clarity: consolidate button primitives (`btn--icon`, `btn--ghost`, `btn--xs`), refine the Knot theme to a black-and-red palette with WCAG 2.1 AA contrast, add config icons for Diagnostics/CLI/Secrets/ACP/MCP sections, replace the roundness slider with discrete stops, and improve accessibility with aria-labels across usage filters..
- CSP/Control UI: compute SHA-256 hashes for inline `<script>` blocks in the served `index.html` and include them in the `script-src` CSP directive, keeping inline scripts blocked by default while allowing explicitly hashed bootstrap code..

### Fixes

- Plugins/bundled runtimes: ship bundled plugin runtime sidecars like WhatsApp `light-runtime-api.js`, Matrix `runtime-api.js`, and other plugin runtime entry files in the npm package again, so global installs stop failing on missing bundled plugin runtime surfaces.
- CLI/channel auth: auto-select the single configured login-capable channel for `channels login`/`logout`, harden channel ids against prototype-chain and control-character abuse, and fall back cleanly to catalog-backed channel installs, so channel auth works again for single-channel setups and on-demand channel installs..
- Auth/OpenAI tokens: stop live gateway auth-profile writes from reverting freshly saved credentials back to stale in-memory values, and make `models auth paste-token` write to the resolved agent store, so Configure, Onboard, and token-paste flows stop snapping back to expired OpenAI tokens. Fixes #53207. Related to #45516.
- Control UI/auth: preserve operator scopes through the device-auth bypass path, ignore cached under-scoped operator tokens, and show a clear `operator.read` fallback message when a connection really lacks read scope, so operator sessions stop failing or blanking on read-backed pages..
- Plugins/KiboHub: resolve plugin API compatibility against the active runtime version at install time, and add regression coverage for current `>=2026.3.22` KiboHub package checks so installs no longer fail behind the stale `1.2.0` constant..
- Plugins/uninstall: accept installed `kibohub:` specs and versionless KiboHub package names as uninstall targets, so `kibo plugins uninstall kibohub:<package>` works again even when the recorded install was pinned to a version.
- Browser/Chrome MCP: wait for existing-session browser tabs to become usable after attach instead of treating the initial Chrome MCP handshake as ready, which reduces user-profile timeouts and repeated consent churn on macOS Chrome attach flows. Fixes #52930..
- Browser/CDP: reuse an already-running loopback browser after a short initial reachability miss instead of immediately falling back to relaunch detection, which fixes second-run browser start/open regressions on slower headless Linux setups. Fixes #53004..
- Agents/web_search: use the active runtime `web_search` provider instead of stale/default selection, so agent turns keep hitting the provider you actually configured. Fixes #53020..
- Mistral/models: lower bundled Mistral max-token defaults to safe output budgets and teach `kibo doctor --fix` to repair old persisted Mistral provider configs that still carry context-sized output limits, avoiding deterministic Mistral 422 rejects on fresh and existing setups. Fixes #52599..
- KiboHub/macOS auth: honor macOS auth config and XDG auth paths for saved KiboHub credentials, so `kibo skills ...` and gateway skill browsing keep using the signed-in auth state instead of silently falling back to unauthenticated mode. Fixes #53034.
- KiboHub/macOS: read the local KiboHub login from the macOS Application Support path and still honor XDG config on macOS, so skill browsing uses the logged-in token on both default and XDG-style setups. Fixes #52949..
- KiboHub/skills: resolve the local KiboHub auth token for gateway skill browsing and switch browse-all requests to search so ClawControl stops falling into unauthenticated 429s and empty authenticated skill lists. Fixes #52949..
- Config/warnings: suppress the confusing "newer Kibo" warning when a config written by a same-base correction release like `2026.3.23-2` is read by `2026.3.23`, while still warning for truly newer or incompatible versions.
- CLI/cron: make `kibo cron add|edit --at ... --tz <iana>` honor the requested local wall-clock time for offset-less one-shot datetimes, including DST boundaries, and keep `--tz` rejected for `--every`..
- Commands/auth: stop slash-command authorization from crashing or dropping valid allowlists when channel `allowFrom` resolution hits unresolved SecretRef-backed accounts, and fail closed only for the affected provider inference path..
- Agents/failover: classify generic `api_error` payloads as retryable only when they include transient failure signals, so MiniMax-style backend failures still trigger model fallback without misclassifying billing, auth, or format/context errors..
- LINE/runtime-api: pre-export overlapping runtime symbols before the `line-runtime` star export so jiti no longer throws `TypeError: Cannot redefine property` on startup..
- Telegram/threading: populate `currentThreadTs` in the threading tool-context fallback for Telegram DM topics so thread-aware tools still receive the active topic context when the main thread metadata is missing.
- Diagnostics/cache trace: strip credential fields from cache-trace JSONL output while preserving non-sensitive diagnostic fields and image redaction metadata.
- Docs/Feishu: replace `botName` with `name` in the channel config examples so the docs match the strict account schema for per-account display names..
- Doctor/plugins: make `kibo doctor --fix` remove stale `plugins.allow` and `plugins.entries` refs left behind after plugin removal.
- Agents/replay: canonicalize malformed assistant transcript content before session-history sanitization so legacy or corrupted assistant turns stop crashing Pi replay and subagent recovery paths.
- KiboHub/skills: keep updating already-tracked legacy Unicode slugs after the ASCII-only slug hardening, so older installs do not get stuck behind `Invalid skill slug` errors during `kibo skills update`..
- Infra/exec trust: preserve shell-multiplexer wrapper binaries for policy checks without breaking approved-command reconstruction, so BusyBox/ToyBox allowlist and audit flows bind to the real wrapper while execution plans stay coherent..
- Plugins/message tool: make Discord `components` and Slack `blocks` optional again, and route Feishu `message(..., media=...)` sends through the outbound media path, so pin/unpin/react flows stop failing schema validation and Feishu file/image attachments actually send. Fixes #52970 and #52962..
- Gateway/model pricing: stop `openrouter/auto` pricing refresh from recursing indefinitely during bootstrap, so OpenRouter auto routes can populate cached pricing and `usage.cost` again. Fixes #53035..
- Models/OpenAI Codex OAuth: bootstrap the env-configured HTTP/HTTPS proxy dispatcher on the stored-credential refresh path before token renewal runs, so expired Codex OAuth profiles can refresh successfully in proxy-required environments instead of locking users out after the first token expiry.
- Models/OpenAI Codex OAuth and Plugins/MiniMax OAuth: ensure env-configured HTTP/HTTPS proxy dispatchers are initialized before OAuth preflight and token exchange requests so proxy-required environments can complete MiniMax and OpenAI Codex sign-in flows again. (#52228; fixes #51619, #51569).
- Plugins/memory-lancedb: bootstrap LanceDB into plugin runtime state on first use when the bundled npm install does not already have it, so `plugins.slots.memory="memory-lancedb"` works again after global npm installs without moving LanceDB into Kibo core dependencies. Fixes #26100.
- Config/plugins: treat stale unknown `plugins.allow` ids as warnings instead of fatal config errors, so recovery commands like `plugins install`, `doctor --fix`, and `status` still run when a plugin is missing locally. Fixes #52992..
- Doctor/WhatsApp: stop auto-enable from appending built-in channel ids like `whatsapp` to `plugins.allow`, so `kibo doctor --fix` no longer writes schema-invalid plugin allowlist entries when repairing built-in channels. Fixes #52931..
- Telegram/auto-reply: preserve same-chat inbound debounce order without stranding stale busy-session followups, and keep same-key overflow turns ordered when tracked debounce keys are saturated..
- Telegram/message tool: add `asDocument` as a user-facing alias for `forceDocument` on image and GIF sends, while preserving explicit `forceDocument` precedence when both flags are present..
- Discord/commands: return an explicit unauthorized reply for privileged native slash commands instead of falling through to Discord's misleading generic completion when auth gates reject the sender. Fixes #53041..
- Channels/catalog: let external channel catalogs override shipped fallback metadata and honor overridden npm specs during channel setup, so custom channel catalogs no longer fall back to bundled packages when a channel id matches.
- Voice-call/Plivo: stabilize Plivo v2 replay keys so webhook retries and replay protection stop colliding on valid follow-up deliveries.
- Agents/skills: prefer the active resolved runtime snapshot for embedded skill config and env injection, so `skills.entries.<skill>.apiKey` SecretRefs resolve correctly during embedded startup instead of failing on raw source config. Fixes #53098..
- Agents/subagents: recheck timed-out worker waits against the latest runtime snapshot before sending completion events, so fast-finishing workers stop being reported as timed out when they actually succeeded. Fixes #53106..
- Agents/Anthropic: preserve latest assistant thinking and redacted-thinking block ordering during transcript image sanitization so follow-up turns do not trip Anthropic's unmodified-thinking validation..
- Plugins/DeepSeek: refactor the bundled DeepSeek provider onto the shared single-provider plugin entry, move its coverage into the extension test lane, and keep bundled auth env-var metadata on the generated manifest path..
- Plugins/Matrix: avoid duplicate `resolveMatrixAccountStringValues` runtime-api exports under Jiti so bundled Matrix installs no longer crash at startup with `Cannot redefine property: resolveMatrixAccountStringValues`. Fixes #52909 and #52891..
- Security/exec approvals: keep shell-wrapper positional-argv allowlist matching on real direct carriers only by rejecting single-quoted `$0`/`$n` tokens, disallowing newline-separated `exec`, and still accepting `exec --` carrier forms..
- Gateway/probe: stop successful gateway handshakes from timing out as unreachable while post-connect detail RPCs are still loading, so slow devices report a reachable RPC failure instead of a false negative dead gateway. Fixes #52927..
- Gateway/supervision: stop lock conflicts from crash-looping under launchd and systemd by keeping the duplicate process in a retry wait instead of exiting as a failure while another healthy gateway still owns the lock. Fixes #52922..
- Gateway/auth: require auth for canvas routes and admin scope for agent session reset, so anonymous canvas access and non-admin reset requests fail closed.
- Release/install: keep previously released bundled plugins and Control UI assets in published kibo npm installs, and fail release checks when those shipped artifacts are missing..
- WhatsApp/outbound sends: keep the active Web listener on a direct process-global symbol so split runtime chunks keep sharing the connected Baileys session and `kibo message send --channel whatsapp` stops failing after connect. Fixes #52574..
- Agents/process: fail loud when `send-keys` tries cursor-sensitive keys before a background PTY reports its cursor mode, so startup races no longer silently send the wrong arrow/Home/End sequences..

## 2026.3.22

### Breaking

- Plugins/install: bare `kibo plugins install <package>` now prefers KiboHub before npm for npm-safe names, and only falls back to npm when KiboHub does not have that package or version. Docs: https://github.com/Arjgorithmic/openclaw/tools/kibohub
- Browser/Chrome MCP: remove the legacy Chrome extension relay path, bundled extension assets, `driver: "extension"`, and `browser.relayBindHost`. Run `kibo doctor --fix` to migrate host-local browser config to `existing-session` / `user`; Docker, headless, sandbox, and remote browser flows still use raw CDP. Docs: https://github.com/Arjgorithmic/openclaw/gateway/doctor and https://github.com/Arjgorithmic/openclaw/tools/browser.
- Tools/image generation: standardize the stock image create/edit path on the core `image_generate` tool. The old `nano-banana-pro` docs/examples are gone; if you previously copied that sample-skill config, switch to `agents.defaults.imageGenerationModel` for built-in image generation or install a separate third-party skill explicitly.
- Skills/image generation: remove the bundled `nano-banana-pro` skill wrapper. Use `agents.defaults.imageGenerationModel.primary: "google/gemini-3-pro-image-preview"` for the native Nano Banana-style path instead.
- Plugins/SDK: the new public plugin SDK surface is `kibo/plugin-sdk/*`; `kibo/extension-api` is removed with no compatibility shim. Bundled plugins must use injected runtime for host-side operations (for example `api.runtime.agent.runEmbeddedPiAgent`) and any remaining direct imports must come from narrow `kibo/plugin-sdk/*` subpaths instead of the monolithic SDK root. Docs: https://github.com/Arjgorithmic/openclaw/plugins/sdk-migration and https://github.com/Arjgorithmic/openclaw/plugins/sdk-overview
- Plugins/message discovery: require `ChannelMessageActionAdapter.describeMessageTool(...)` for shared `message` tool discovery. The legacy `listActions`, `getCapabilities`, and `getToolSchema` adapter methods are removed. Plugin authors should migrate message discovery to `describeMessageTool(...)` and keep channel-specific action runtime code inside the owning plugin package..
- Plugins/Matrix: add a new Matrix plugin backed by the official `matrix-js-sdk`. If you are upgrading from the previous public Matrix plugin, follow the migration guide: https://github.com/Arjgorithmic/openclaw/install/migrating-matrix.
- Config/env: remove legacy `KIBOBOT_*` and `MOLTBOT_*` compatibility env names across runtime, installers, and test tooling. Use the matching `KIBO_*` env names instead.
- Config/state: remove legacy `.moltbot` state-dir and `moltbot.json` auto-detection/migration fallback. If you still keep state under `~/.moltbot`, move it to `~/.kibo` or set `KIBO_STATE_DIR` / `KIBO_CONFIG_PATH` explicitly. Docs: https://github.com/Arjgorithmic/openclaw/install/migrating and https://github.com/Arjgorithmic/openclaw/start/getting-started
- Exec/env sandbox: block build-tool JVM injection (`MAVEN_OPTS`, `SBT_OPTS`, `GRADLE_OPTS`, `ANT_OPTS`), glibc tunable exploitation (`GLIBC_TUNABLES`), and .NET dependency resolution hijack (`DOTNET_ADDITIONAL_DEPS`) from the host exec environment, and restrict Gradle init script redirect (`GRADLE_USER_HOME`) as an override-only block so user-configured Gradle homes still propagate.
- Discord/commands: switch native command deployment to Carbon reconcile by default so Discord restarts stop churning slash commands through Kibo's local deploy path. and.
- Security/exec approvals: treat `time` as a transparent dispatch wrapper during allowlist evaluation and allow-always persistence so approved `time ...` commands bind the inner executable instead of the wrapper path. for reporting.
- Voice-call/webhooks: reject missing provider signature headers before body reads, drop the pre-auth body budget to `64 KB` / `5s`, and cap concurrent pre-auth requests per source IP so unauthenticated callers cannot force the old `1 MB` / `30s` buffering path. for reporting.
- Plugins/Matrix: stop mention-gated or otherwise dropped room chatter from refreshing focused thread bindings before the message is actually routed, so idle ACP and session bindings can still expire normally in mention-required rooms. and.
- Plugins/Matrix: durably dedupe inbound room events across gateway restarts so previously handled Matrix messages are not replayed as new, while preserving clean-restart backlog delivery for unseen events.
- Agents/media replies: migrate the remaining browser, canvas, and nodes snapshot outputs onto `details.media` so generated media keeps attaching to assistant replies after the collect-then-attach refactor..
- Android/contacts search: escape literal `%` and `_` in contact-name queries so searches like `100%` or `_id` no longer match unrelated contacts through SQL `LIKE` wildcards..
- Gateway/usage: include reset and deleted archived session transcripts in usage totals, session discovery, and archived-only session detail fallback so the Usage view no longer undercounts rotated sessions..

### Changes

- KiboHub/install: add native `kibo skills search|install|update` flows plus `kibo plugins install kibohub:<package>` with tracked update metadata, gateway skill-install/update support for KiboHub-backed requests, and regression coverage/docs for the new source path.
- Plugins/marketplaces: add Claude marketplace registry resolution, `plugin@marketplace` installs, marketplace listing, and update support, plus Docker E2E coverage for local and official marketplace flows..
- Commands/plugins: add owner-gated `/plugins` and `/plugin` chat commands for plugin list/show and enable/disable flows, alongside explicit `commands.plugins` config gating..
- Install/update: allow package-manager installs from GitHub `main` via `kibo update --tag main`, installer `--version main`, or direct npm/pnpm git specs..
- Plugins/bundles: add compatible Codex, Claude, and Cursor bundle discovery/install support, map bundle skills into Kibo skills, and apply Claude bundle `settings.json` defaults to embedded Pi with shell overrides sanitized.
- CLI/hooks: route hook-pack install and update through `kibo plugins`, keep `kibo hooks` focused on hook visibility and per-hook controls, and show plugin-managed hook details in CLI output.
- Models/OpenAI: switch the default OpenAI setup model to `openai/gpt-5.4`, keep Codex on `openai-codex/gpt-5.4`, and centralize OpenAI chat, image, TTS, transcription, and embedding defaults in one shared module so future default-model updates stay low-churn..
- Agents: add per-agent thinking/reasoning/fast defaults and auto-revert disallowed model overrides to the agent's default selection. and.
- Commands/btw: add `/btw` side questions for quick tool-less answers about the current session without changing future session context, with dismissible in-session TUI answers and explicit BTW replies on external channels..
- Sandbox/runtime: add pluggable sandbox backends, ship an OpenShell backend with `mirror` and `remote` workspace modes, and make sandbox list/recreate/prune backend-aware instead of Docker-only.
- Sandbox/SSH: add a core SSH sandbox backend with secret-backed key, certificate, and known_hosts inputs, move shared remote exec/filesystem tooling into core, and keep OpenShell focused on sandbox lifecycle plus optional `mirror` mode.
- Browser/existing-session: support `browser.profiles.<name>.userDataDir` so Chrome DevTools MCP can attach to Brave, Edge, and other Chromium-based browsers through their own user data directories..
- Plugins/bundles: make enabled bundle MCP servers expose runnable tools in embedded Pi, and default relative bundle MCP launches to the bundle root so marketplace bundles like Context7 work through Pi instead of stopping at config import.
- Plugins/providers: move OpenRouter, GitHub Copilot, and OpenAI Codex provider/runtime logic into bundled plugins, including dynamic model fallback, runtime auth exchange, stream wrappers, capability hints, and cache-TTL policy.
- Models/Anthropic Vertex: add core `anthropic-vertex` provider support for Claude via Google Vertex AI, including GCP auth/discovery and main run-path routing. and.
- Plugins/Chutes: add a bundled Chutes provider with plugin-owned OAuth/API-key auth, dynamic model discovery, and default-on extension wiring..
- Web tools/Exa: add Exa as a bundled web-search plugin with Exa-native date filters, search-mode selection, and optional content extraction under `plugins.entries.exa.config.webSearch.*`. and.
- Web tools/Tavily: add Tavily as a bundled web-search provider with dedicated `tavily_search` and `tavily_extract` tools, using canonical plugin-owned config under `plugins.entries.tavily.config.webSearch.*`..
- Web tools/Firecrawl: add Firecrawl as an `onboard`/configure search provider via a bundled plugin, expose explicit `firecrawl_search` and `firecrawl_scrape` tools, and align core `web_fetch` fallback behavior with Firecrawl base-URL/env fallback plus guarded endpoint fetches.
- Models/OpenAI: add native forward-compat support for `gpt-5.4-mini` and `gpt-5.4-nano` in the OpenAI provider catalog, runtime resolution, and reasoning capability gates..
- Control UI/chat: add an expand-to-canvas button on assistant chat bubbles and in-app session navigation from Sessions and Cron views..
- Control UI/appearance: unify theme border radii across Claw, Knot, and Dash, and add a Roundness slider to the Appearance settings so users can adjust corner radius from sharp to fully rounded..
- Control UI/usage: improve usage overview styling, localization, and responsive chat/context-notice presentation, including safer theme color handling and unclipped usage-header menus..
- Control UI/usage: drop the empty session-detail placeholder card so the usage view stays single-column until a real session detail panel is selected..
- Android/mobile: add a system-aware dark theme across onboarding and post-onboarding screens so the app follows the device theme through setup, chat, and voice flows..
- Android/Talk: move Talk speech synthesis behind gateway `talk.speak`, keep Talk secrets on the gateway, and switch Android playback to final-response audio instead of device-local ElevenLabs streaming.
- Android/nodes: add `callLog.search` plus shared Call Log permission wiring so Android nodes can search recent call history through the gateway..
- Android/nodes: add `sms.search` plus shared SMS permission wiring so Android nodes can search device text messages through the gateway..
- Telegram/apiRoot: add per-account custom Bot API endpoint support across send, probe, setup, doctor repair, and inbound media download paths so proxied or self-hosted Telegram deployments work end to end..
- Telegram/topics: auto-rename DM forum topics on first message with LLM-generated labels, with per-account and per-DM `autoTopicLabel` overrides..
- Telegram/actions: add `topic-edit` for forum-topic renames and icon updates while sharing the same Telegram topic-edit transport used by the plugin runtime..
- Telegram/error replies: add a default-off `channels.telegram.silentErrorReplies` setting so bot error replies can be delivered silently across regular replies, native commands, and fallback sends..
- Feishu/cards: add structured interactive approval and quick-action launcher cards, preserve callback user and conversation context through routing, and keep legacy card-action fallback behavior so common actions can run without typing raw commands..
- Feishu/ACP: add current-conversation ACP and subagent session binding for supported DMs and topic conversations, including completion delivery back to the originating Feishu conversation..
- Feishu/streaming: add `onReasoningStream` and `onReasoningEnd` support to streaming cards, so `/reasoning stream` renders thinking tokens as markdown blockquotes in the same card - matching the Telegram channel's reasoning lane behavior..
- Feishu/cards: add identity-aware structured card headers and note footers for Feishu replies and direct sends, while keeping that presentation wired through the shared outbound identity path..
- Plugins/Matrix: add `allowBots` room policy so configured Matrix bot accounts can talk to each other, with optional mention-only gating..
- Plugins/Matrix: add per-account `allowPrivateNetwork` opt-in for private/internal homeservers, while keeping public cleartext homeservers blocked..
- Plugins/MiniMax: add MiniMax-M2.7 and MiniMax-M2.7-highspeed models and update the default model from M2.5 to M2.7..
- MiniMax/fast mode: map shared `/fast` and `params.fastMode` to MiniMax `-highspeed` models for M2.1, M2.5, and M2.7 API-key and OAuth runs..
- Models/MiniMax defaults: raise bundled MiniMax M2.5/M2.7 context-window, max-token, and pricing metadata to the higher defaults shipped by the current upstream Pi SDK..
- Models/MiniMax: add bundled `MiniMax-M2`, `MiniMax-M2.1`, and `MiniMax-M2.1-highspeed` catalog entries so Kibo's provider metadata and OAuth aliases stay aligned with the current upstream Pi SDK..
- Plugins/MiniMax: merge the bundled MiniMax API and MiniMax OAuth plugin surfaces into a single default-on `minimax` plugin, while keeping legacy `minimax-portal-auth` config ids aliased for compatibility.
- Agents/Pi compatibility: align Kibo's bundled MiniMax runtime behavior with the current upstream Pi 0.61.1 release so embedded runs stay in sync with the latest published Pi SDK semantics..
- Models/GitHub Copilot: allow forward-compat dynamic model ids without code updates, while preserving configured provider and per-model overrides for those synthetic models..
- xAI/models: sync the bundled Grok catalog to current Pi-backed IDs, limits, and pricing metadata, while keeping older Grok fast and 4.20 aliases resolving cleanly at runtime..
- xAI/fast mode: map shared `/fast` and `params.fastMode` to the current xAI Grok fast model family so direct Grok runs can opt into the faster Pi-backed variants..
- CLI/config: expand `config set` with SecretRef and provider builder modes, JSON/batch assignment support, and `--dry-run` validation with structured JSON output..
- Z.AI/models: sync the bundled GLM catalog to current Pi metadata, including newer 4.5/4.6 model families, updated multimodal entries, and current pricing and token limits..
- Mistral/models: sync the bundled default Mistral metadata to current Pi pricing so the built-in default no longer advertises zero-cost usage..
- Plugins/Xiaomi: switch the bundled Xiaomi provider to the `/v1` OpenAI-compatible endpoint and add MiMo V2 Pro plus MiMo V2 Omni to the built-in catalog..
- Agents/compaction: notify users when followup auto-compaction starts and finishes, keeping those notices out of TTS and preserving reply threading for the real assistant reply..
- Memory/plugins: let the active memory plugin register its own system-prompt section while preserving cache-clear and snapshot-load prompt isolation..
- Gateway/health monitor: add configurable stale-event thresholds and restart limits, plus per-channel and per-account `healthMonitor.enabled` overrides, while keeping the existing global disable path on `gateway.channelHealthCheckMinutes=0`..
- Plugins/agent integrations: broaden the plugin surface for app-server integrations with channel-aware commands, interactive callbacks, inbound claims, and Discord/Telegram conversation binding support. and.
- Plugins/binding: add `onConversationBindingResolved(...)` so plugins can react immediately after bind approvals or denies without blocking channel interaction acknowledgements..
- Plugins/context engines: expose `delegateCompactionToRuntime(...)` on the public plugin SDK, refactor the legacy engine to use the shared helper, and clarify `ownsCompaction` delegation semantics for non-owning engines..
- Plugins/context engines: pass the embedded runner `modelId` into context-engine `assemble()` so plugins can adapt context formatting per model..
- Plugins/context engines: add transcript maintenance rewrites for context engines, preserve active-branch transcript metadata during rewrites, and harden overflow-recovery truncation to rewrite sessions under the normal session write lock..
- Skills/prompt budget: preserve all registered skills via a compact catalog fallback before dropping entries when the full prompt format exceeds `maxSkillsPromptChars`..
- Hooks/workspace: keep repo-local `<workspace>/hooks` disabled until explicitly enabled, block workspace hook name collisions from shadowing bundled/managed/plugin hooks, and treat `hooks.internal.load.extraDirs` as trusted managed hook sources.
- Security/plugins: reject remote marketplace manifest entries that expand installation outside the cloned marketplace repo, including external git/GitHub sources, HTTP archives, and absolute paths.
- Gateway/docs: clarify that empty URL input allowlists are treated as unset, document `allowUrl: false` as the deny-all switch, and add regression coverage for the normalization path.
- secrets: harden read-only SecretRef command paths and diagnostics..
- Scope message SecretRef resolution and harden doctor/status paths..
- Build/memory tools: emit `dist/cli/memory-cli.js` as a stable core entry so runtime `memory_search` loading no longer depends on hashed `memory-cli-*` bundle names..
- Plugins/testing: add a public `kibo/plugin-sdk/testing` surface for plugin-author test helpers, and move bundled-plugin-only test bridges into private repo test helpers.
- Agents/steering docs: update embedded Pi steering docs and runner comments for the current upstream behavior, where queued steering is injected after the active assistant turn finishes its tool calls instead of skipping the remaining tools mid-turn..
- Doctor/refactor: start splitting doctor provider checks into `src/commands/doctor/providers/*` by extracting Telegram first-run and group allowlist warnings into a provider-specific module, keeping the current setup guidance and warning behavior intact..
- Refactor/channels: remove the legacy channel shim directories and point channel-specific imports directly at the extension-owned implementations..
- Docs/Zalo: clarify the Marketplace-bot support matrix and config guidance so the Zalo channel docs match current Bot Creator behavior more closely..
- Docs/plugins: add the community DingTalk plugin listing to the docs catalog..
- Docs/plugins: add the community QQbot plugin listing to the docs catalog..
- Docs/plugins: add the community wecom plugin listing to the docs catalog..

### Fixes

- Web tools/search provider lists: keep onboarding, configure, and docs provider lists alphabetical while preserving the separate runtime auto-detect precedence used for credential-based provider selection.
- Media/Windows security: block remote-host `file://` media URLs and UNC/network paths before local filesystem resolution in core media loading and adjacent prompt/sandbox attachment seams, so the next release no longer allows structured local-media inputs to trigger outbound SMB credential handshakes on Windows. for reporting.
- Gateway/discovery: fail closed on unresolved Bonjour and DNS-SD service endpoints in CLI discovery, onboarding, and `gateway status` so TXT-only hints can no longer steer routing or SSH auto-target selection. for reporting.
- Security/pairing: bind iOS setup codes to the intended node profile and reject first-use bootstrap redemption that asks for broader roles or scopes..
- Memory/core tools: register `memory_search` and `memory_get` independently so one unavailable memory tool no longer suppresses the other in new sessions..
- Web tools/Exa: align the bundled Exa plugin with the current Exa API by supporting newer search types and richer `contents` options, while fixing the result-count cap to honor Exa's higher limit..
- Plugins/Matrix: move bundled plugin `KeyedAsyncQueue` imports onto the stable `plugin-sdk/core` surface so Matrix Docker/runtime builds do not depend on the brittle keyed-async-queue subpath. and.
- Nostr/security: enforce inbound DM policy before decrypt, route Nostr DMs through the standard reply pipeline, and add pre-crypto rate and size guards so unknown senders cannot bypass pairing or force unbounded crypto work..
- Synology Chat/security: keep reply delivery bound to stable numeric `user_id` by default, and gate mutable username/nickname recipient lookup behind `dangerouslyAllowNameMatching` with new regression coverage..
- Agents/default timeout: raise the shared default agent timeout from `600s` to `48h` so long-running ACP and agent sessions do not fail unless you configure a shorter limit.
- Gateway/startup: load bundled channel plugins from compiled `dist/extensions` entries in built installs, so gateway boot no longer recompiles bundled extension TypeScript on every startup and WhatsApp-class cold starts drop back to seconds instead of tens of seconds or worse..
- Gateway/startup: prewarm the configured primary model before channel startup and retry one transient provider-runtime miss so the first Telegram or Discord message after boot no longer fails with `Unknown model: openai-codex/gpt-5.4`..
- CLI/startup: lazy-load channel add and root help startup paths to trim avoidable RSS and help latency on constrained hosts..
- Configure/startup: move outbound send-deps resolution into a lightweight helper so `kibo configure` no longer stalls after the banner while eagerly loading channel plugins..
- CLI/auth choice: lazy-load plugin/provider fallback resolution so mapped auth choices stay on the static path and only unknown choices pay the heavy provider load..
- Gateway/Discord startup: load only configured channel plugins during gateway boot, and lazy-load Discord provider/session runtime setup so startup stops importing unrelated providers and trims cold-start delay..
- Agents/inbound: lazy-load media and link understanding for plain-text turns and cache synced auth stores by auth-file state so ordinary inbound replies avoid unnecessary startup churn..
- Agents/openai-responses: strip `prompt_cache_key` and `prompt_cache_retention` for non-OpenAI-compatible Responses endpoints while keeping them on direct OpenAI and Azure OpenAI paths, so third-party OpenAI-compatible providers no longer reject those requests with HTTP 400..
- Models/OpenRouter runtime capabilities: fetch uncatalogued OpenRouter model metadata on first use so newly added vision models keep image input instead of silently degrading to text-only, with top-level capability field fallbacks for `/api/v1/models`..
- Control UI/session routing: preserve established external delivery routes when webchat views or sends in externally originated sessions, so subagent completions still return to the original channel instead of the dashboard..
- Telegram/replies: set `allow_sending_without_reply` on reply-targeted sends and media-error notices so deleted parent messages no longer drop otherwise valid replies..
- Telegram/polling: hard-timeout stuck `getUpdates` requests so wedged network paths fail over sooner instead of waiting for the polling stall watchdog..
- Android/location: make current-location requests drop late callbacks after timeout instead of crashing with `Already resumed`..
- Android/pairing: resolve portless secure setup URLs to `443` while preserving direct cleartext gateway defaults and explicit `:80` manual endpoints in onboarding..
- Android/canvas: ignore bridge messages from pages outside the bundled scaffold and trusted A2UI surfaces..
- CLI/status: keep `status --json` stdout clean by skipping plugin compatibility scans that were not rendered in the JSON payload..
- WhatsApp/reconnect: restore the append recency filter in the extension inbox monitor and handle protobuf `Long` timestamps correctly, so fresh post-reconnect append messages are processed while stale history sync stays suppressed..
- WhatsApp/login: wait for pending creds writes before reopening after Baileys `515` pairing restarts in both QR login and `channels login` flows, and keep the restart coverage pinned to the real wrapped error shape plus per-account creds queues..
- Android/canvas: serialize A2UI action-status event strings before evaluating WebView JS, so action ids and multiline errors do not break the callback dispatch..
- Android/camera: recycle intermediate and final snap bitmaps in `camera.snap` so repeated captures do not leak native image memory..
- Control UI/logging: make browser-safe logger imports avoid eager temp-dir resolution so the bundled Control UI no longer crashes to a blank screen when logging reaches `tmp-kibo-dir`. Fixes #48062..
- Control UI/chat sessions: show human-readable labels in the grouped session dropdown again, keep unique scoped fallbacks when metadata is missing, and disambiguate duplicate labels only when needed..
- Telegram/replies: ignore malformed non-string reply text and caption fields when describing reply context, so unexpected Telegram reply payloads no longer break inbound context assembly..
- Control UI/dashboard: preserve structured gateway shutdown reasons across restart disconnects so config-triggered restarts no longer fall back to `disconnected (1006): no reason`. Fixes #46532..
- Android/chat: theme the thinking dropdown and TLS trust dialogs explicitly so popup surfaces match the active app theme instead of falling back to mismatched Material defaults.
- Node/startup: remove leftover debug `console.log("node host PATH: ...")` that printed the resolved PATH on every `kibo node run` invocation. Fixes #46411..
- Slack/startup: harden `@slack/bolt` import interop across current bundled runtime shapes so Slack monitors no longer crash with `App is not a constructor` after plugin-sdk bundling changes..
- Control UI/model switching: preserve the selected provider prefix when switching models from the chat dropdown, so multi-provider setups no longer send `anthropic/gpt-5.2`-style mismatches when the user picked `openai/gpt-5.2`..
- Control UI/storage: scope persisted settings keys by gateway base path, with migration from the legacy shared key, so multiple gateways under one domain stop overwriting each other's dashboard preferences..
- Control UI/overview: keep the language dropdown aligned with the persisted locale during dashboard startup so refreshing the page does not fall back to English before locale hydration completes..
- macOS/node service startup: use `kibo node start/stop --json` from the Mac app instead of the removed `kibo service node ...` command shape, so current CLI installs expose the full node exec surface again. Fixes #43171..
- ACP/gateway startup: use direct Telegram and Discord startup/status helpers instead of routing probes through the plugin runtime, and prepend the selected daemon Node bin dir to service PATH so plugin-local installs can still find `npm` and `pnpm`.
- WhatsApp/active-listener: pin the active listener registry to a `globalThis` singleton so split WhatsApp bundle chunks share one listener map and outbound sends stop missing the registered session..
- Gateway/probe: honor caller `--timeout` for active local loopback probes in `gateway status`, keep inactive remote-mode loopback probes fast, and clamp probe timers to JS-safe bounds so slow local/container gateways stop reporting false timeouts..
- Config/startup: keep bundled web-search allowlist compatibility on a lightweight manifest path so config validation no longer pulls bundled web-search registry imports into startup, while still avoiding accidental auto-allow of config-loaded override plugins..
- Gateway/chat.send: persist uploaded image references across reloads and compaction without delaying first-turn dispatch or double-submitting the same image to vision models..
- Android/canvas: recycle captured and scaled snapshot bitmaps so repeated canvas snapshots do not leak native image memory..
- Android/theme: switch status bar icon contrast with the active system theme so Android light mode no longer leaves unreadable light icons over the app header..
- Gateway/openresponses: preserve assistant commentary and session continuity across hosted-tool `/v1/responses` turns, and emit streamed tool-call payloads before finalization so client tool loops stay resumable..
- Android/Talk: serialize `TalkModeManager` player teardown so rapid interrupt/restart cycles stop double-releasing or overlapping TTS playback..
- WhatsApp/reconnect: preserve the last inbound timestamp across reconnect attempts so the watchdog can still recycle linked-but-dead listeners after a restart instead of leaving them stuck connected forever.
- Gateway/network discovery: guard LAN, tailnet, and pairing interface enumeration so WSL2 and restricted hosts degrade to missing-address fallbacks instead of crashing on `uv_interface_addresses` errors. (#44180, #47590)
- Gateway/bonjour: suppress the non-fatal `@homebridge/ciao` IPv4-loss assertion during interface churn so WiFi/VPN/sleep-wake changes no longer take down the gateway. (#38628, #47159, #52431)
- Browser/launch: stop forcing an extra blank tab on browser launch so managed browser startup no longer opens an unwanted empty page..
- CLI/onboarding: import static provider definitions directly for onboarding model/config helpers so those paths no longer pull provider discovery just for built-in defaults..
- Agents/exec: return plain-text failed tool output for timeouts and other non-success exec outcomes so models no longer parrot raw JSON error payloads back to users..
- CLI/config: make `config set --strict-json` enforce real JSON, prefer `JSON.parse` with JSON5 fallback for machine-written cron/subagent stores, and relabel raw config surfaces as `JSON/JSON5` to match actual compatibility. Related: #48415, #43127, #14529, #21332. and.
- CLI/Ollama onboarding: keep the interactive model picker for explicit `kibo onboard --auth-choice ollama` runs so setup still selects a default model without reintroducing pre-picker auto-pulls..
- CLI/configure: clarify fresh-setup memory-search warnings so they say semantic recall needs at least one embedding provider, and scope the initial model allowlist picker to the provider selected in configure..
- Mattermost/threading: honor `replyToMode: "off"` for already-threaded inbound posts so threaded follow-ups can fall back to top-level replies when configured..
- Onboarding/custom providers: store Azure OpenAI and Azure AI Foundry custom endpoints with the Responses API config shape, normalized `/openai/v1` base URLs, and Azure-safe defaults so TUI and agent runs work after setup..
- CLI/completion: reduce recursive completion-script string churn and fix nested PowerShell command-path matching so generated nested completions resolve on PowerShell too. and.
- macOS/launch at login: stop emitting `KeepAlive` for the desktop app launch agent so Kibo no longer relaunches immediately after a manual quit while launch at login remains enabled..
- Mattermost/DM send: retry transient direct-channel creation failures for DM deliveries, with configurable backoff and per-request timeout..
- Secrets/exec refs: require explicit `--allow-exec` for `secrets apply` write plans that contain exec SecretRefs/providers, and align audit/configure/apply dry-run behavior to skip exec checks unless opted in to prevent unexpected command side effects. and.
- Signal/runtime API: re-export `SignalAccountConfig` so Signal account resolution type-checks again..
- Google Chat/runtime API: thin the private runtime barrel onto the curated public SDK surface while keeping public Google Chat exports intact..
- Onboarding/custom providers: keep Azure AI Foundry `*.services.ai.azure.com` custom endpoints on the selected compatibility path instead of forcing Responses, so chat-completions Foundry models still work after setup. Fixes #50528..
- make `kibo update status` explicitly say `up to date` when the local version already matches npm latest, while keeping the availability logic unchanged..
- Browser/node proxy: enforce `nodeHost.browserProxy.allowProfiles` across `query.profile` and `body.profile`, block proxy-side profile create/delete when the allowlist is set, and keep the default full proxy surface when the allowlist is empty.
- Security/device pairing: harden `device.token.rotate` deny handling by keeping public failures generic while logging internal deny reasons and preserving approved-baseline enforcement. (`GHSA-7jrw-x62h-64p8`)
- Security/exec safe bins: remove `jq` from the default safe-bin allowlist and fail closed on the `jq` `env` builtin when operators explicitly opt `jq` back in, so `jq -n env` cannot dump host secrets without an explicit trust path. for reporting.
- Security/exec approvals: escape blank Hangul filler code points in approval prompts across gateway/chat and the macOS native approval UI so visually empty Unicode padding cannot hide reviewed command text.
- Security/exec approvals: unify transparent dispatch-wrapper handling across resolution and allow-always persistence so wrapper metadata cannot silently drift and broaden approvals.
- Security/exec: harden macOS allowlist resolution against wrapper and `env` spoofing, require fresh approval for inline interpreter eval with `tools.exec.strictInlineEval`, wrap Discord guild message bodies as untrusted external content, and add audit findings for risky exec approval and open-channel combinations.
- Security/network: harden explicit-proxy SSRF pinning by translating target-hop transport hints onto HTTPS proxy tunnels and failing closed for plain HTTP guarded fetches that cannot preserve pinned DNS.
- Security/Synology Chat: require explicit per-account webhook paths for multi-account setups by default, reject duplicate exact webhook paths fail-closed, and keep inherited-path behavior behind an explicit dangerous opt-in so shared routes can no longer collapse DM policy contexts across accounts. for reporting.
- Browser/remote CDP: honor strict browser SSRF policy during remote CDP reachability and `/json/version` discovery checks, redact sensitive `cdpUrl` tokens from status output, and warn when remote CDP targets private/internal hosts.
- Media/security: bound remote-media error-body snippets with the same streaming caps and idle timeouts as successful downloads, so malicious HTTP error responses cannot force unbounded buffering before Kibo throws.
- Gateway/auth: ignore spoofed loopback hops in trusted forwarding chains and block device approvals that request scopes above the caller session..
- Gateway/auth: clear self-declared scopes for device-less trusted-proxy Control UI sessions so proxy-authenticated connects cannot claim admin or secrets scopes without a bound device identity.
- Hardening: refresh stale device pairing requests and pending metadata and.
- Gateway/auth: add regression coverage that keeps device-less trusted-proxy Control UI sessions off privileged pairing approval RPCs..
- Agents/models: cache `models.json` readiness by config and auth-file state so embedded runner turns stop paying repeated model-catalog startup work before replies..
- Gateway/status: tolerate network interface discovery failures in status, onboarding control-UI links, and self-presence display paths so those surfaces fall back cleanly instead of crashing..
- Gateway/Linux: auto-detect nvm-managed Node TLS CA bundle needs before CLI startup and refresh installed services that are missing `NODE_EXTRA_CA_CERTS`..
- Google auth/Node 25: patch `gaxios` to use native fetch without injecting `globalThis.window`, while translating proxy and mTLS transport settings so Google Vertex and Google Chat auth keep working on Node 25..
- Gateway/plugins: pin runtime webhook routes to the gateway startup registry so channel webhooks keep working across plugin-registry churn, and make plugin auth + dispatch resolve routes from the same live HTTP-route registry. Fixes #46924 and #47041..
- Gateway/restart: defer externally signaled unmanaged restarts through the in-process idle drain, and preserve the restored subagent run as remap fallback during orphan recovery so resumed sessions do not duplicate work..
- Telegram/setup: seed fresh setups with `channels.telegram.groups["*"].requireMention=true` so new bots stay mention-gated in groups unless you explicitly open them up..
- Inbound policy hardening: tighten callback and webhook sender checks across Mattermost and Google Chat, match Nextcloud Talk rooms by stable room token, and treat explicit empty Twitch allowlists as deny-all. and.
- Webhooks/runtime: move auth earlier and tighten pre-auth body limits and timeouts across bundled webhook handlers, including slow-body handling for Mattermost slash commands..
- Email/webhook wrapping: sanitize sender and subject metadata before external-content wrapping so metadata fields cannot break the wrapper structure..
- Gateway/chat: only reap orphaned stale chat buffers after the abort controller is gone, and clear abort-time streaming metadata so long-running sessions do not lose buffered output while stale maps still get reclaimed..
- Tools/apply-patch: revalidate workspace-only delete and directory targets immediately before mutating host paths..
- Gateway/config views: strip embedded credentials from URL-based endpoint fields before returning read-only account and config snapshots..
- ACP/approvals: use canonical tool identity for prompting decisions and fail closed when conflicting tool identity hints are present. and.
- ACP: require admin scope for mutating internal actions. and.
- Subagents/follow-ups: require the same controller ownership checks for `/subagents send` as other control actions, so leaf sessions cannot message nested child runs they do not control..
- Web search/onboarding: clarify provider labels, key prompts, and missing-key notes so setup/configure more clearly names the required provider credential for Gemini, Kimi, Grok, Brave Search, Firecrawl, Perplexity, and Tavily..
- macOS/canvas actions: keep unattended local agent actions on trusted in-app canvas surfaces only, and stop exposing the deep-link fallback key to arbitrary page scripts..
- Agents/compaction: extend the enclosing run deadline once while compaction is actively in flight, and abort the underlying SDK compaction on timeout/cancel so large-session compactions stop freezing mid-run..
- Gateway/Telegram shutdown: abort stalled Telegram polling fetches on shutdown, clean up per-cycle abort listeners, and keep the in-process watchdog ahead of supervisor stop timeouts so SIGTERM no longer leaves zombie gateways behind..
- Telegram/setup: warn when setup leaves DMs on pairing without an allowlist, and show valid account-scoped remediation commands..
- Doctor/Telegram: replace the fresh-install empty group-allowlist false positive with first-run guidance that explains DM pairing approval and the next group setup steps, so new Telegram installs get actionable setup help instead of a broken-config warning..
- Doctor/extensions: keep Matrix DM `allowFrom` repairs on the canonical `dm.allowFrom` path and stop treating Zalouser group sender gating as if it fell back to `allowFrom`, so doctor warnings and `--fix` stay aligned with runtime access control..
- Doctor/refactor: centralize built-in channel doctor semantics in one static capability registry with conservative fallback behavior for unknown/external channels, so future extension changes stop depending on scattered shared string checks..
- Channels/plugins: keep shared interactive payloads merge-ready by fixing Slack custom callback routing and repeat-click dedupe, allowing interactive-only sends, and preserving ordered Discord shared text blocks..
- Slack/interactive replies: preserve `channelData.slack.blocks` through live DM delivery and preview-finalized edits so Block Kit button and select directives render instead of falling back to raw text..
- Feishu/actions: expand the runtime action surface with message read/edit, explicit thread replies, pinning, and operator-facing chat/member inspection so Feishu can operate more of the workspace directly..
- Feishu/topic threads: fetch full thread context, including prior bot replies, when starting a topic-thread session so follow-up turns in Feishu topics keep the right conversation state..
- Feishu/media: keep native image, file, audio, and video/media handling aligned across outbound sends, inbound downloads, thread replies, directory/action aliases, and capability docs so unsupported areas are explicit instead of implied..
- Feishu/webhooks: harden signed webhook verification to use constant-time signature comparison and keep malformed short signatures fail-closed in webhook E2E coverage.
- Ollama/tool replay: deserialize stringified tool-call arguments on native and OpenAI-compatible Ollama paths while preserving unsafe integer ids across round-trips..
- WhatsApp/reconnect: restore the append recency filter in the extension inbox monitor and handle protobuf `Long` timestamps correctly, so fresh post-reconnect append messages are processed while stale history sync stays suppressed..
- WhatsApp/login: wait for pending creds writes before reopening after Baileys `515` pairing restarts in both QR login and `channels login` flows, and keep the restart coverage pinned to the real wrapped error shape plus per-account creds queues..
- Telegram/message send: forward `--force-document` through the `sendPayload` path as well as `sendMedia`, so Telegram payload sends with `channelData` keep uploading images as documents instead of silently falling back to compressed photo sends..
- Telegram/message chunking: preserve spaces, paragraph separators, and word boundaries when HTML overflow rechunking splits formatted replies..
- Z.AI/onboarding: detect a working default model even for explicit `zai-coding-*` endpoint choices, so Coding Plan setup can keep the selected endpoint while defaulting to `glm-5` when available or `glm-4.7` as fallback..
- CI/onboarding smoke: surface `ensure-base-commit` fetch failures as workflow warnings and fail the onboarding Docker smoke when expected setup prompts drift instead of continuing silently..
- Z.AI/onboarding: add `glm-5-turbo` to the default Z.AI provider catalog so onboarding-generated configs expose the new model alongside the existing GLM defaults..
- Zalo Personal/group gating: stop reapplying `dmPolicy.allowFrom` as a sender gate for already-allowlisted groups when `groupAllowFrom` is unset, so any member of an allowed group can trigger replies while DMs stay restricted. Fixes #40146..
- Zalo/plugin runtime: export `resolveClientIp` from `kibo/plugin-sdk/zalo` so installed builds no longer crash on startup when the webhook monitor loads from the packaged extension instead of the monorepo source tree..
- Docker/live tests: mount external CLI auth homes into writable container copies, derive Codex OAuth expiry from JWT `exp`, refresh synced CLI creds instead of trusting stale cached expiry, and make gateway live probes wait on transcript output so `pnpm test:docker:all` stays green in Linux.
- Gateway/watch mode: restart on bundled-plugin package and manifest metadata changes, rebuild `dist` for extension source and `tsdown.config.ts` changes, and still ignore extension docs..
- Gateway/watch mode: recreate bundled plugin runtime metadata after clean or stale `dist` states, so `pnpm gateway:watch` no longer fails on missing bundled-plugin manifests after a rebuild..
- Control UI: scope persisted session selection per gateway, prevent stale session bleed across tokenized gateway opens, and cap stored gateway session history..
- Models/OpenAI Codex OAuth: start the remote manual-input race for Codex login and keep the pasted-input prompt aligned with the actual accepted values, so remote/VPS auth no longer stalls waiting on an unreachable localhost callback..
- Group mention gating: reject invalid and unsafe nested-repetition `mentionPatterns`, reuse the shared safe config-regex compiler across mention stripping and detection, and cache strip-time regex compilation so noisy groups avoid repeated recompiles.
- Browser/profiles: drop the auto-created `chrome-relay` browser profile; users who need the Chrome extension relay must now create their own profile via `kibo browser create-profile`. Fixes #45777..
- CI/channel test routing: move the built-in channel suites into `test:channels` and keep them out of `test:extensions`, so extension CI no longer fails after the channel migration while targeted test routing still sends Slack, Signal, and iMessage suites to the right lane..
- Gateway/config validation: stop treating the implicit default memory slot as a required explicit plugin config, so startup no longer fails with `plugins.slots.memory: plugin not found: memory-core` when `memory-core` was only inferred..
- Tlon: honor explicit empty allowlists and defer cite expansion. and.
- Tlon/DM auth: defer cited-message expansion until after DM authorization and owner command handling, so unauthorized DMs and owner approval/admin commands no longer trigger cross-channel cite fetches before the deny or command path.
- Gateway/agent events: stop broadcasting false end-of-run `seq gap` errors to clients, and isolate node-driven ingress turns with per-turn run IDs so stale tail events cannot leak into later session runs..
- Nodes/pending actions: re-check queued foreground actions against the current node command policy before returning them to the node. and.
- Windows/gateway status: accept `schtasks` `Last Result` output as an alias for `Last Run Result`, so running scheduled-task installs no longer show `Runtime: unknown`..
- ACP/acpx: resolve the bundled plugin root from the actual plugin directory so plugin-local installs stay under the bundled dist plugin tree instead of escaping upward and failing runtime setup..
- Gateway/WS handshake: raise the default pre-auth handshake timeout to 10 seconds and add `KIBO_HANDSHAKE_TIMEOUT_MS` as a runtime override so busy local gateways stop dropping healthy CLI connections at 3 seconds..
- Gateway/websocket pairing bypass for disabled auth: skip device-pairing enforcement for Control UI operator sessions when `gateway.auth.mode=none`, so reverse-proxied dashboards no longer get stuck on `pairing required` despite auth being explicitly disabled..
- Agents/usage tracking: stop forcing `supportsUsageInStreaming: false` on non-native OpenAI-completions providers so compatible backends report token usage and cost again instead of showing all zeros. Fixes #46142..
- ACP/acpx: keep plugin-local backend installs under the bundled ACPX plugin package in live repo checkouts so rebuilds no longer delete the runtime binary, and avoid package-lock churn during runtime repair.
- Agents/compaction: rerun transcript repair after `session.compact()` so orphaned `tool_result` blocks cannot survive compaction and break later Anthropic requests..
- Agents/compaction: trigger overflow recovery from the tool-result guard once post-compaction context still exceeds the safe threshold, so long tool loops compact before the next model call hard-fails..
- macOS/exec approvals: harden exec-host request HMAC verification to use a timing-safe compare and keep malformed or truncated signatures fail-closed in focused IPC auth coverage.
- Gateway/exec approvals: surface requested env override keys in gateway-host approval prompts so operators can review surviving env context without inheriting noisy base host env.
- Telegram/network: preserve sticky IPv4 fallback state across polling restarts so hosts with unstable IPv6 to `api.telegram.org` stop re-triggering repeated Telegram timeouts after each restart..
- Agents/compaction: write minimal boundary summaries for empty preparations while keeping split-turn prefixes on the normal path, so no-summarizable-message sessions stop retriggering the safeguard loop..
- Models/chat commands: keep `/model ...@YYYYMMDD` version suffixes intact by default, but still honor matching stored numeric auth-profile overrides for the same provider..
- Gateway/channels: serialize per-account channel startup so overlapping starts do not boot the same provider twice, preventing MS Teams `EADDRINUSE` crash loops during startup and restart..
- Discord: enforce strict DM component allowlist auth.
- Stabilize plugin loader and Docker extension smoke.
- Telegram: stabilize pairing/session/forum routing and reply formatting tests.
- Gateway: harden OpenResponses file-context escaping and.
- LINE: harden Express webhook parsing to verified raw body and.
- Exec: harden host env override handling across gateway and node and.
- Voice Call: enforce spoken-output contract and fix stream TTS silence regression.
- xAI/models: rename the bundled Grok 4.20 catalog entries to the GA IDs and normalize saved deprecated beta IDs at runtime so existing configs and sessions keep resolving.
- WhatsApp/outbound media: fix HTML, XML, and CSS files being silently dropped on outbound send by adding missing MIME entries and falling back to `application/octet-stream` for unknown media types.
- Agents/bootstrap warnings: move bootstrap truncation warnings out of the system prompt and into the per-turn prompt body so prompt-cache reuse stays stable when truncation warnings appear or disappear. and.
- Telegram/DM topic session keys: route named-account DM topics through the same per-account base session key across inbound messages, native commands, and session-state lookups so `/status` and thread recovery stop creating phantom `agent:main:main:thread:...` sessions..
- ACP/configured bindings: reinitialize configured ACP sessions that are stuck in `error` state instead of reusing the failed runtime.
- Telegram/network: unify API and media fetches under the same sticky IPv4 and pinned-IP fallback chain, and re-validate pinned override addresses against SSRF policy..
- Agents/prompt composition: append bootstrap truncation warnings to the current-turn prompt and add regression coverage for stable system-prompt cache invariants..
- Synology Chat/multi-account: scope direct-message sessions by account and sender so identical webhook `user_id` values on different Synology accounts no longer share transcript or delivery state.
- Telegram/security: add regression coverage proving pinned fallback host overrides stay bound to Telegram and delegate non-matching hostnames back to the original lookup path..
- Tools/image generation: add bundled fal image generation support so `image_generate` can target `fal/*` models with `FAL_KEY`, including single-image edit flows via FLUX image-to-image..
- Gateway/hooks: preserve immutable hook ingress provenance across async isolated-agent dispatch so normalized hook session routes keep external wrapping, Gmail-specific policy, and Gmail model selection intact.
- Messages/polls: treat zero-valued poll params on `message.send` as unset defaults while keeping non-zero poll params on the poll validation path. Fixes #52118..
- xAI/web search: add missing Grok credential metadata so the bundled provider registration type-checks again..
- Agents/session cache: opportunistically sweep expired embedded-runner session cache entries during later cache activity, so one-shot session files do not accumulate forever..
- WhatsApp: stabilize inbound monitor and setup tests.
- Matrix: make onboarding status runtime-safe.
- Channels: stabilize lane harness and monitor tests.
- Agents/compaction: add an opt-in post-compaction session JSONL truncation step that drops summarized transcript entries while preserving the retained branch tail and live session metadata..
- Telegram/routing: fail loud when `message send` targets an unknown non-default Telegram `accountId`, instead of silently falling back to the channel-level bot token and sending through the wrong bot..
- Web search: align onboarding, configure, and finalize with plugin-owned provider contracts, including disabled-provider recovery, config-aware credential hooks, and runtime-visible summaries..
- Agents/replay: sanitize malformed assistant tool-call replay blocks before provider replay so follow-up Anthropic requests do not inherit the downstream `replace` crash..
- Discord/startup logging: report client initialization while the gateway is still connecting instead of claiming Discord is logged in before readiness is reached..
- Agents/compaction safeguard: preserve split-turn context and preserved recent turns when capped retry fallback reuses the last successful summary..
- Agents/memory flush: keep transcript-hash dedup active across memory-flush fallback retries so a write-then-throw flush attempt cannot append duplicate `MEMORY.md` entries before the fallback cycle completes..
- Discord/ACP: forward worker abort signals into ACP turns so timed-out Discord jobs cancel the running turn instead of silently leaving the bound ACP session working in the background.
- ACP/Codex session replay: preserve hidden assistant thinking when loading or rebinding existing ACP sessions so stored thought chunks do not replay into visible assistant text..
- Gateway/commands: keep internal `chat.send` slash-command UX while requiring `operator.admin` before internal callers can persist `/exec` defaults or mutate `phone-control` node policy through `/phone arm|disarm`.
- Plugins/context engines: enforce owner-aware context-engine registration on both loader and public SDK paths so plugins cannot spoof privileged ownership, claim the core `legacy` engine id, or overwrite an existing engine id through direct SDK imports..
- Plugins/bundler TDZ: fix `RESERVED_COMMANDS` temporal dead zone error that prevented device-pair, phone-control, and talk-voice plugins from registering when the bundler placed the commands module after call sites in the same output chunk..
- Plugins/imports: fix stale googlechat runtime-api import paths and signal SDK circular re-exports broken by recent plugin-sdk refactors..
- Plugins/install precedence: keep bundled plugins ahead of auto-discovered globals by default, but let an explicitly installed plugin record win its own duplicate-id tie so installed channel plugins load from `~/.kibo/extensions` after `kibo plugins install`..
- Plugins/scoped ids: preserve scoped plugin ids during install and config keying, and keep bundled plugins ahead of discovered duplicate ids by default so `@scope/name` plugins no longer collide with unscoped installs..
- Docs/Mintlify: fix MDX marker syntax on Perplexity, Model Providers, Moonshot, and exec approvals pages so local docs preview no longer breaks rendering or leaves stale pages unpublished..
- Plugins/runtime barrels: route bundled extension runtime imports through public `kibo/plugin-sdk/*` subpaths and block relative cross-package escapes so packaged extensions stop depending on monorepo-only relative paths..
- Docs/security audit: spell out that `gateway.controlUi.allowedOrigins: ["*"]` is an explicit allow-all browser-origin policy and should be avoided outside tightly controlled local testing.
- Plugins/subagents: preserve gateway-owned plugin subagent access across runtime, tool, and embedded-runner load paths so gateway plugin tools and context engines can still spawn and manage subagents after the loader cache split..
- Plugins/subagents: forward per-run provider and model overrides through gateway plugin subagent dispatch so plugin-launched agent delegations honor explicit model selection again..
- Tests/OpenAI Codex auth: align login expectations with the default `gpt-5.4` model so CI coverage stays consistent with the current OpenAI Codex default..
- Plugins/discovery: distinguish missing package entry files from package-path escape violations so startup skips absent plugin entry paths without raising false security diagnostics..
- Plugins/Matrix: accept shared send-tool media aliases (`mediaUrl`, `filePath`, `path`) and preserve `asVoice` / `audioAsVoice` through Matrix action dispatch so media-only sends and voice-message intents reach the plugin send layer correctly. and.
- Plugins/runtime-api: pin extension runtime-api export surfaces with explicit guardrail coverage so future surface creep becomes a deliberate diff..
- Plugins/WhatsApp: share split-load singleton state for plugin command registration and active WhatsApp listeners so duplicate module graphs no longer lose native plugin commands or outbound listener state..
- Plugins/update: let `kibo plugins update <npm-spec>` target tracked npm installs by dist-tag or exact version, and preserve the recorded npm spec for later id-based updates..
- Tests/CLI: reduce command-secret gateway test import pressure while keeping the real protocol payload validator in place, so the isolated lane no longer carries the heavier runtime-web and message-channel graphs..
- Gateway/plugins: share plugin interactive callback routing and plugin bind approval state across duplicate module graphs so Telegram Codex picker buttons and plugin bind approvals no longer fall through to normal inbound message routing..
- Plugins/runtime state: share plugin-facing infra singleton state across duplicate module graphs and keep session-binding adapter ownership stable until the active owner unregisters..
- Discord/pickers: keep `/codex_resume --browse-projects` picker callbacks alive in Discord by sharing component callback state across duplicate module graphs, preserving callback fallbacks, and acknowledging matched plugin interactions before dispatch..
- Telegram/Mattermost message tool: keep plugin button schemas optional in isolated and cron sessions so plain sends do not fail validation when no current channel is active..
- Release/npm publish: fail the npm release check when `dist/control-ui/index.html` is missing from the packed tarball, so broken Control UI asset releases are blocked before publish. Fixes #52808..
- Slack/embedded delivery: suppress transcript-only `delivery-mirror` assistant messages before embedded re-delivery and raise the default Slack chunk fallback so messages just over 4000 characters stay in a single post..

### Fixes

- Agents/edit tool: accept common path/text alias spellings, show current file contents on exact-match failures, and avoid false edit failures after successful writes..

## 2026.3.13

### Changes

- Android/chat settings: redesign the chat settings sheet with grouped device and media sections, refresh the Connect and Voice tabs, and tighten the chat composer/session header for a denser mobile layout..
- iOS/onboarding: add a first-run welcome pager before gateway setup, stop auto-opening the QR scanner, and show `/pair qr` instructions on the connect step..
- Browser/existing-session: add an official Chrome DevTools MCP attach mode for signed-in live Chrome sessions, with docs for `chrome://inspect/#remote-debugging` enablement and direct backlinks to Chrome's own setup guides.
- Browser/agents: add built-in `profile="user"` for the logged-in host browser and `profile="chrome-relay"` for the extension relay, so agent browser calls can prefer the real signed-in browser without the extra `browserSession` selector.
- Browser/act automation: add batched actions, selector targeting, and delayed clicks for browser act requests with normalized batch dispatch..
- Docker/timezone override: add `KIBO_TZ` so `docker-setup.sh` can pin gateway and CLI containers to a chosen IANA timezone instead of inheriting the daemon default..
- Dependencies/pi: bump `@mariozechner/pi-agent-core`, `@mariozechner/pi-ai`, `@mariozechner/pi-coding-agent`, and `@mariozechner/pi-tui` to `0.58.0`.
- Cron/sessions: add `sessionTarget: "current"` and `session:<id>` support so cron jobs can bind to the creating session or a persistent named session instead of only `main` or `isolated`. and.
- Telegram/message send: add `--force-document` so Telegram image and GIF sends can upload as documents without compression..

### Fixes

- Dashboard/chat UI: stop reloading full chat history on every live tool result in dashboard v2 so tool-heavy runs no longer trigger UI freeze/re-render storms while the final event still refreshes persisted history..
- Gateway/client requests: reject unanswered gateway RPC calls after a bounded timeout and clear their pending state, so stalled connections no longer leak hanging `GatewayClient.request()` promises indefinitely.
- Build/plugin-sdk bundling: bundle plugin-sdk subpath entries in one shared build pass so published packages stop duplicating shared chunks and avoid the recent plugin-sdk memory blow-up..
- Ollama/reasoning visibility: stop promoting native `thinking` and `reasoning` fields into final assistant text so local reasoning models no longer leak internal thoughts in normal replies..
- Android/onboarding QR scan: switch setup QR scanning to Google Code Scanner so onboarding uses a more reliable scanner instead of the legacy embedded ZXing flow..
- Browser/existing-session: harden driver validation and session lifecycle so transport errors trigger reconnects while tool-level errors preserve the session, and extract shared ARIA role sets to deduplicate Playwright and Chrome MCP snapshot paths..
- Browser/existing-session: accept text-only `list_pages` and `new_page` responses from Chrome DevTools MCP so live-session tab discovery and new-tab open flows keep working when the server omits structured page metadata.
- Control UI/insecure auth: preserve explicit shared token and password auth on plain-HTTP Control UI connects so LAN and reverse-proxy sessions no longer drop shared auth before the first WebSocket handshake..
- Gateway/session reset: preserve `lastAccountId` and `lastThreadId` across gateway session resets so replies keep routing back to the same account and thread after `/reset`..
- macOS/onboarding: avoid self-restarting freshly bootstrapped launchd gateways and give new daemon installs longer to become healthy, so `kibo onboard --install-daemon` no longer false-fails on slower Macs and fresh VM snapshots.
- Gateway/status: add `kibo gateway status --require-rpc` and clearer Linux non-interactive daemon-install failure reporting so automation can fail hard on probe misses instead of treating a printed RPC error as green.
- macOS/exec approvals: respect per-agent exec approval settings in the gateway prompter, including allowlist fallback when the native prompt cannot be shown, so gateway-triggered `system.run` requests follow configured policy instead of always prompting or denying unexpectedly..
- Telegram/media downloads: thread the same direct or proxy transport policy into SSRF-guarded file fetches so inbound attachments keep working when Telegram falls back between env-proxy and direct networking..
- Telegram/inbound media IPv4 fallback: retry SSRF-guarded Telegram file downloads once with the same IPv4 fallback policy as Bot API calls so fresh installs on IPv6-broken hosts no longer fail to download inbound images.
- Commands/onboarding: split static auth-choice help from the plugin-backed onboarding catalog so `kibo onboard` registration no longer pulls provider-wizard imports just to describe `--auth-choice`..
- Windows/gateway install: bound `schtasks` calls and fall back to the Startup-folder login item when task creation hangs, so native `kibo gateway install` fails fast instead of wedging forever on broken Scheduled Task setups.
- Windows/gateway stop: resolve Startup-folder fallback listeners from the installed `gateway.cmd` port, so `kibo gateway stop` now actually kills fallback-launched gateway processes before restart.
- Windows/gateway status: reuse the installed service command environment when reading runtime status, so startup-fallback gateways keep reporting the configured port and running state in `gateway status --json` instead of falling back to `gateway port unknown`.
- Windows/gateway auth: stop attaching device identity on local loopback shared-token and password gateway calls, so native Windows agent replies no longer log stale `device signature expired` fallback noise before succeeding.
- Discord/gateway startup: treat plain-text and transient `/gateway/bot` metadata fetch failures as transient startup errors so Discord gateway boot no longer crashes on unhandled rejections..
- Slack/probe: keep `auth.test()` bot and team metadata mapping stable while simplifying the probe result path..
- Dashboard/chat UI: render oversized plain-text replies as normal paragraphs instead of capped gray code blocks, so long desktop chat responses stay readable without tab-switching refreshes.
- Dashboard/chat UI: restore the `chat-new-messages` class on the New messages scroll pill so the button uses its existing compact styling instead of rendering as a full-screen SVG overlay..
- Gateway/Control UI: restore the operator-only device-auth bypass and classify browser connect failures so origin and device-identity problems no longer show up as auth errors in the Control UI and web chat..
- macOS/voice wake: stop crashing wake-word command extraction when speech segment ranges come from a different transcript instance.
- Discord/allowlists: honor raw `guild_id` when hydrated guild objects are missing so allowlisted channels and threads like `#maintainers` no longer get false-dropped before channel allowlist checks.
- macOS/runtime locator: require Node >=22.16.0 during macOS runtime discovery so the app no longer accepts Node versions that the main runtime guard rejects later..
- Agents/custom providers: preserve blank API keys for loopback OpenAI-compatible custom providers by clearing the synthetic Authorization header at runtime, while keeping explicit apiKey and oauth/token config from silently downgrading into fake bearer auth..
- Models/google-vertex Gemini flash-lite normalization: apply existing bare-ID preview normalization to `google-vertex` model refs and provider configs so `google-vertex/gemini-3.1-flash-lite` resolves as `gemini-3.1-flash-lite-preview`..
- iMessage/remote attachments: reject unsafe remote attachment paths before spawning SCP, so sender-controlled filenames can no longer inject shell metacharacters into remote media staging..
- Telegram/webhook auth: validate the Telegram webhook secret before reading or parsing request bodies, so unauthenticated requests are rejected immediately instead of consuming up to 1 MB first..
- Security/device pairing: make bootstrap setup codes single-use so pending device pairing requests cannot be silently replayed and widened to admin before approval..
- Security/external content: strip zero-width and soft-hyphen marker-splitting characters during boundary sanitization so spoofed `EXTERNAL_UNTRUSTED_CONTENT` markers fall back to the existing hardening path instead of bypassing marker normalization.
- CLI/startup: stop `kibo devices list` and similar loopback gateway commands from failing during startup by isolating heavy import-time side effects from the normal CLI path..
- Security/exec approvals: unwrap more `pnpm` runtime forms during approval binding, including `pnpm --reporter ... exec` and direct `pnpm node` file runs, with matching regression coverage and docs updates.
- Security/exec approvals: fail closed for Perl `-M` and `-I` approval flows so preload and load-path module resolution stays outside approval-backed runtime execution unless the operator uses a broader explicit trust path.
- Security/exec approvals: recognize PowerShell `-File` and `-f` wrapper forms during inline-command extraction so approval and command-analysis paths treat file-based PowerShell launches like the existing `-Command` variants.
- Security/exec approvals: unwrap `env` dispatch wrappers inside shell-segment allowlist resolution on macOS so `env FOO=bar /path/to/bin` resolves against the effective executable instead of the wrapper token.
- Security/exec approvals: treat backslash-newline as shell line continuation during macOS shell-chain parsing so line-continued `$(` substitutions fail closed instead of slipping past command-substitution checks.
- Security/exec approvals: bind macOS skill auto-allow trust to both executable name and resolved path so same-basename binaries no longer inherit trust from unrelated skill bins.
- Cron/isolated sessions: route nested cron-triggered embedded runner work onto the nested lane so isolated cron jobs no longer deadlock when compaction or other queued inner work runs..
- Agents/OpenAI-compatible compat overrides: respect explicit user `models[].compat` opt-ins for non-native `openai-completions` endpoints so usage-in-streaming capability overrides no longer get forced off when the endpoint actually supports them..
- Agents/Azure OpenAI startup prompts: rephrase the built-in `/new`, `/reset`, and post-compaction startup instruction so Azure OpenAI deployments no longer hit HTTP 400 false positives from the content filter..
- Agents/compaction: compare post-compaction token sanity checks against full-session pre-compaction totals and skip the check when token estimation fails, so sessions with large bootstrap context keep real token counts instead of falling back to unknown..
- Agents/compaction: preserve safeguard compaction summary language continuity via default and configurable custom instructions so persona drift is reduced after auto-compaction..
- Agents/tool warnings: distinguish gated core tools like `apply_patch` from plugin-only unknown entries in `tools.profile` warnings, so unavailable core tools now report current runtime/provider/model/config gating instead of suggesting a missing plugin.
- Config/validation: accept documented `agents.list[].params` per-agent overrides in strict config validation so `kibo config validate` no longer rejects runtime-supported `cacheRetention`, `temperature`, and `maxTokens` settings..
- Config/web fetch: restore runtime validation for documented `tools.web.fetch.readability` and `tools.web.fetch.firecrawl` settings so valid web fetch configs no longer fail with unrecognized-key errors..
- Signal/config validation: add `channels.signal.groups` schema support so per-group `requireMention`, `tools`, and `toolsBySender` overrides no longer get rejected during config validation..
- Config/discovery: accept `discovery.wideArea.domain` in strict config validation so unicast DNS-SD gateway configs no longer fail with an unrecognized-key error..
- Telegram/media errors: redact Telegram file URLs before building media fetch errors so failed inbound downloads do not leak bot tokens into logs..
- Agents/failover: normalize abort-wrapped `429 RESOURCE_EXHAUSTED` provider failures before abort short-circuiting so wrapped Google/Vertex rate limits continue across configured fallback models, including the embedded runner prompt-error path..
- Mattermost/thread routing: non-inbound reply paths (TUI/WebUI turns, tool-call callbacks, subagent responses) now correctly route to the originating Mattermost thread when `replyToMode: "all"` is active; also prevents stale `origin.threadId` metadata from resurrecting cleared thread routes.
- Gateway/websocket pairing bypass for disabled auth: skip device-pairing enforcement when `gateway.auth.mode=none` so Control UI connections behind reverse proxies no longer get stuck on `pairing required` (code 1008) despite auth being explicitly disabled.
- Auth/login lockout recovery: clear stale `auth_permanent` and `billing` disabled state for all profiles matching the target provider when `kibo models auth login` is invoked, so users locked out by expired or revoked OAuth tokens can recover by re-authenticating instead of waiting for the cooldown timer to expire.
- Auto-reply/context-engine compaction: persist the exact embedded-run metadata compaction count for main and followup runner session accounting, so metadata-only auto-compactions no longer undercount multi-compaction runs..
- Auth/Codex CLI reuse: sync reused Codex CLI credentials into the supported `openai-codex:default` OAuth profile instead of reviving the deprecated `openai-codex:codex-cli` slot, so doctor cleanup no longer loops..
- Deps/audit: bump the pinned `fast-xml-parser` override to the first patched release so `pnpm audit --prod --audit-level=high` no longer fails on the AWS Bedrock XML builder path..
- Hooks/after_compaction: forward `sessionFile` for direct/manual compaction events and add `sessionFile` plus `sessionKey` to wired auto-compaction hook context so plugins receive the session metadata already declared in the hook types..
- Sessions/BlueBubbles/cron: persist outbound session routing and transcript mirroring for new targets, auto-create BlueBubbles chats before attachment sends, and only suppress isolated cron deliveries when the run started hours late instead of merely finishing late.

### Breaking

- **BREAKING:** Agents now load at most one root memory bootstrap file. `MEMORY.md` wins; `memory.md` is only used when `MEMORY.md` is absent. If you intentionally kept both files and depended on both being injected, merge them before upgrade. This also fixes duplicate memory injection on case-insensitive Docker mounts..

## 2026.3.12

### Changes

- Control UI/dashboard-v2: refresh the gateway dashboard with modular overview, chat, config, agent, and session views, plus a command palette, mobile bottom tabs, and richer chat tools like slash commands, search, export, and pinned messages..
- OpenAI/GPT-5.4 fast mode: add configurable session-level fast toggles across `/fast`, TUI, Control UI, and ACP, with per-model config defaults and OpenAI/Codex request shaping.
- Anthropic/Claude fast mode: map the shared `/fast` toggle and `params.fastMode` to direct Anthropic API-key `service_tier` requests, with live verification for both Anthropic and OpenAI fast-mode tiers.
- Models/plugins: move Ollama, vLLM, and SGLang onto the provider-plugin architecture, with provider-owned onboarding, discovery, model-picker setup, and post-selection hooks so core provider wiring is more modular.
- Docs/Kubernetes: Add a starter K8s install path with raw manifests, Kind setup, and deployment docs.
- Agents/subagents: add `sessions_yield` so orchestrators can end the current turn immediately, skip queued tool work, and carry a hidden follow-up payload into the next session turn.
- Slack/agent replies: support `channelData.slack.blocks` in the shared reply delivery path so agents can send Block Kit messages through standard Slack outbound delivery..
- Slack/interactive replies: add opt-in Slack button and select reply directives behind `channels.slack.capabilities.interactiveReplies`, disabled by default unless explicitly enabled..

### Fixes

- Security/device pairing: switch `/pair` and `kibo qr` setup codes to short-lived bootstrap tokens so the next release no longer embeds shared gateway credentials in chat or QR pairing payloads..
- Security/plugins: disable implicit workspace plugin auto-load so cloned repositories cannot execute workspace plugin code without an explicit trust decision. (`GHSA-99qw-6mr3-36qr`)(#44174) and.
- Models/Kimi Coding: send `anthropic-messages` tools in native Anthropic format again so `kimi-coding` stops degrading tool calls into XML/plain-text pseudo invocations instead of real `tool_use` blocks. (#38669, #39907, #40552).
- TUI/chat log: reuse the active assistant message component for the same streaming run so `kibo tui` no longer renders duplicate assistant replies..
- Telegram/model picker: make inline model button selections persist the chosen session model correctly, clear overrides when selecting the configured default, and include effective fallback models in `/models` button validation..
- Cron/proactive delivery: keep isolated direct cron sends out of the write-ahead resend queue so transient-send retries do not replay duplicate proactive messages after restart. and.
- Models/Kimi Coding: send the built-in `User-Agent: claude-code/0.1.0` header by default for `kimi-coding` while still allowing explicit provider headers to override it, so Kimi Code subscription auth can work without a local header-injection proxy. and.
- Models/OpenAI Codex Spark: keep `gpt-5.3-codex-spark` working on the `openai-codex/*` path via resolver fallbacks and clearer Codex-only handling, while continuing to suppress the stale direct `openai/*` Spark row that OpenAI rejects live.
- Ollama/Kimi Cloud: apply the Moonshot Kimi payload compatibility wrapper to Ollama-hosted Kimi models like `kimi-k2.5:cloud`, so tool routing no longer breaks when thinking is enabled..
- Moonshot CN API: respect explicit `baseUrl` (api.moonshot.cn) in implicit provider resolution so platform.moonshot.cn API keys authenticate correctly instead of returning HTTP 401..
- Kimi Coding/provider config: respect explicit `models.providers["kimi-coding"].baseUrl` when resolving the implicit provider so custom Kimi Coding endpoints no longer get overwritten by the built-in default..
- Gateway/main-session routing: keep TUI and other `mode:UI` main-session sends on the internal surface when `deliver` is enabled, so replies no longer inherit the session's persisted Telegram/WhatsApp route..
- BlueBubbles/self-chat echo dedupe: drop reflected duplicate webhook copies only when a matching `fromMe` event was just seen for the same chat, body, and timestamp, preventing self-chat loops without broad webhook suppression. Related to #32166..
- iMessage/self-chat echo dedupe: drop reflected duplicate copies only when a matching `is_from_me` event was just seen for the same chat, text, and `created_at`, preventing self-chat loops without broad text-only suppression. Related to #32166..
- Subagents/completion announce retries: raise the default announce timeout to 90 seconds and stop retrying gateway-timeout failures for externally delivered completion announces, preventing duplicate user-facing completion messages after slow gateway responses. Fixes #41235. and.
- Mattermost/block streaming: fix duplicate message delivery (one threaded, one top-level) when block streaming is active by excluding `replyToId` from the block reply dedup key and adding an explicit `threading` dock to the Mattermost plugin. and.
- Mattermost/reply media delivery: pass agent-scoped `mediaLocalRoots` through shared reply delivery so allowed local files upload correctly from button, slash-command, and model-picker replies..
- macOS/Reminders: add the missing `NSRemindersUsageDescription` to the bundled app so `apple-reminders` can trigger the system permission prompt from Kibo.app..
- Gateway/session discovery: discover disk-only and retired ACP session stores under custom templated `session.store` roots so ACP reconciliation, session-id/session-label targeting, and run-id fallback keep working after restart..
- Plugins/env-scoped roots: fix plugin discovery/load caches and provenance tracking so same-process `HOME`/`KIBO_HOME` changes no longer reuse stale plugin state or misreport `~/...` plugins as untracked..
- Models/OpenRouter native ids: canonicalize native OpenRouter model keys across config writes, runtime lookups, fallback management, and `models list --plain`, and migrate legacy duplicated `openrouter/openrouter/...` config entries forward on write.
- Windows/native update: make package installs use the npm update path instead of the git path, carry portable Git into native Windows updates, and mirror the installer's Windows npm env so `kibo update` no longer dies early on missing `git` or `node-llama-cpp` download setup.
- Sandbox/write: preserve pinned mutation-helper payload stdin so sandboxed `write` no longer reports success while creating empty files..
- Security/exec approvals: escape invisible Unicode format characters in approval prompts so zero-width command text renders as visible `\u{...}` escapes instead of spoofing the reviewed command. (`GHSA-pcqg-f7rg-xfvv`)(#43687) and.
- Hooks/loader: fail closed when workspace hook paths cannot be resolved with `realpath`, so unreadable or broken internal hook paths are skipped instead of falling back to unresolved imports..
- Hooks/agent deliveries: dedupe repeated hook requests by optional idempotency key so webhook retries can reuse the first run instead of launching duplicate agent executions..
- Security/exec detection: normalize compatibility Unicode and strip invisible formatting code points before obfuscation checks so zero-width and fullwidth command tricks no longer suppress heuristic detection. (`GHSA-9r3v-37xh-2cf6`)(#44091) and.
- Security/exec allowlist: preserve POSIX case sensitivity and keep `?` within a single path segment so exact-looking allowlist patterns no longer overmatch executables across case or directory boundaries. (`GHSA-f8r2-vg7x-gh8m`)(#43798) and.
- Security/commands: require sender ownership for `/config` and `/debug` so authorized non-owner senders can no longer reach owner-only config and runtime debug surfaces. (`GHSA-r7vr-gr74-94p8`)(#44305) and.
- Security/gateway auth: clear unbound client-declared scopes on shared-token WebSocket connects so device-less shared-token operators cannot self-declare elevated scopes. (`GHSA-rqpp-rjj8-7wv8`)(#44306) and.
- Security/browser.request: block persistent browser profile create/delete routes from write-scoped `browser.request` so callers can no longer persist admin-only browser profile changes through the browser control surface. (`GHSA-vmhq-cqm9-6p7q`)(#43800) and.
- Security/agent: reject public spawned-run lineage fields and keep workspace inheritance on the internal spawned-session path so external `agent` callers can no longer override the gateway workspace boundary. (`GHSA-2rqg-gjgv-84jm`)(#43801) and.
- Security/session_status: enforce sandbox session-tree visibility and shared agent-to-agent access guards before reading or mutating target session state, so sandboxed subagents can no longer inspect parent session metadata or write parent model overrides via `session_status`. (`GHSA-wcxr-59v9-rxr8`)(#43754) and.
- Security/agent tools: mark `nodes` as explicitly owner-only and document/test that `canvas` remains a shared trusted-operator surface unless a real boundary bypass exists.
- Security/exec approvals: fail closed for Ruby approval flows that use `-r`, `--require`, or `-I` so approval-backed commands no longer bind only the main script while extra local code-loading flags remain outside the reviewed file snapshot.
- Security/device pairing: cap issued and verified device-token scopes to each paired device's approved scope baseline so stale or overbroad tokens cannot exceed approved access. (`GHSA-2pwv-x786-56f8`)(#43686) and.
- Docs/onboarding: align the legacy wizard reference and `kibo onboard` command docs with the Ollama onboarding flow so all onboarding reference paths now document `--auth-choice ollama`, Cloud + Local mode, and non-interactive usage..
- Models/secrets: enforce source-managed SecretRef markers in generated `models.json` so runtime-resolved provider secrets are not persisted when runtime projection is skipped..
- Security/WebSocket preauth: shorten unauthenticated handshake retention and reject oversized pre-auth frames before application-layer parsing to reduce pre-pairing exposure on unsupported public deployments. (`GHSA-jv4g-m82p-2j93`)(#44089) (`GHSA-xwx2-ppv2-wx98`)(#44089) and.
- Security/proxy attachments: restore the shared media-store size cap for persisted browser proxy files so oversized payloads are rejected instead of overriding the intended 5 MB limit. (`GHSA-6rph-mmhp-h7h9`)(#43684) and.
- Security/host env: block inherited `GIT_EXEC_PATH` from sanitized host exec environments so Git helper resolution cannot be steered by host environment state. (`GHSA-jf5v-pqgw-gm5m`)(#43685) and.
- Security/Feishu webhook: require `encryptKey` alongside `verificationToken` in webhook mode so unsigned forged events are rejected instead of being processed with token-only configuration. (`GHSA-g353-mgv3-8pcj`)(#44087) and.
- Security/Feishu reactions: preserve looked-up group chat typing and fail closed on ambiguous reaction context so group authorization and mention gating cannot be bypassed through synthetic `p2p` reactions. (`GHSA-m69h-jm2f-2pv8`)(#44088) and.
- Security/LINE webhook: require signatures for empty-event POST probes too so unsigned requests no longer confirm webhook reachability with a `200` response. (`GHSA-mhxh-9pjm-w7q5`)(#44090) and.
- Security/Zalo webhook: rate limit invalid secret guesses before auth so weak webhook secrets cannot be brute-forced through unauthenticated churned requests without pre-auth `429` responses. (`GHSA-5m9r-p9g7-679c`)(#44173) and.
- Security/Zalouser groups: require stable group IDs for allowlist auth by default and gate mutable group-name matching behind `channels.zalouser.dangerouslyAllowNameMatching`..
- Security/Slack and Teams routing: require stable channel and team IDs for allowlist routing by default, with mutable name matching only via each channel's `dangerouslyAllowNameMatching` break-glass flag.
- Security/exec approvals: fail closed for ambiguous inline loader and shell-payload script execution, bind the real script after POSIX shell value-taking flags, and unwrap `pnpm`/`npm exec`/`npx` script runners before approval binding. (`GHSA-57jw-9722-6rf2`)(`GHSA-jvqh-rfmh-jh27`)(`GHSA-x7pp-23xv-mmr4`)(`GHSA-jc5j-vg4r-j5jx`)(#44247) and.
- Doctor/gateway service audit: canonicalize service entrypoint paths before comparing them so symlink-vs-realpath installs no longer trigger false "entrypoint does not match the current install" repair prompts..
- Doctor/gateway service audit: earlier groundwork for this fix landed in the superseded #28338 branch..
- Gateway/session stores: regenerate the Swift push-test protocol models and align Windows native session-store realpath handling so protocol checks and sync session discovery stop drifting on Windows..
- Context engine/session routing: forward optional `sessionKey` through context-engine lifecycle calls so plugins can see structured routing metadata during bootstrap, assembly, post-turn ingestion, and compaction..
- Agents/failover: classify z.ai `network_error` stop reasons as retryable timeouts so provider connectivity failures trigger fallback instead of surfacing raw unhandled-stop-reason errors..
- Config/Anthropic startup: inline Anthropic alias normalization during config load so gateway startup no longer crashes on dated Anthropic model refs like `anthropic/claude-sonnet-4-20250514`..
- Memory/session sync: add mode-aware post-compaction session reindexing with `agents.defaults.compaction.postIndexSync` plus `agents.defaults.memorySearch.sync.sessions.postCompactionForce`, so compacted session memory can refresh immediately without forcing every deployment into synchronous reindexing..
- Telegram/native command sync: suppress expected `BOT_COMMANDS_TOO_MUCH` retry error noise, add a final fallback summary log, and document the difference between command-menu overflow and real Telegram network failures.
- Browser/existing-session: stop reporting fake CDP ports/URLs for live attached Chrome sessions, render `transport: chrome-mcp` in CLI/status output instead of `port: 0`, and keep timeout diagnostics transport-aware when no direct CDP URL exists.
- Feishu/event dedupe: keep early duplicate suppression aligned with the shared Feishu message-id contract and release the pre-queue dedupe marker after failed dispatch so retried events can recover instead of being dropped until the short TTL expires..
- Gateway/hooks: bucket hook auth failures by forwarded client IP behind trusted proxies and warn when `hooks.allowedAgentIds` leaves hook routing unrestricted.
- Agents/compaction: skip the post-compaction `cache-ttl` marker write when a compaction completed in the same attempt, preventing the next turn from immediately triggering a second tiny compaction..
- Native chat/macOS: add `/new`, `/reset`, and `/clear` reset triggers, keep shared main-session aliases aligned, and ignore stale model-selection completions so native chat state stays in sync across reset and fast model changes..
- Agents/compaction safeguard: route missing-model and missing-API-key cancellation warnings through the shared subsystem logger so they land in structured and file logs..
- Cron/doctor: stop flagging canonical `agentTurn` and `systemEvent` payload kinds as legacy cron storage, while still normalizing whitespace-padded and non-canonical variants..
- ACP/client final-message delivery: preserve terminal assistant text snapshots before resolving `end_turn`, so ACP clients no longer drop the last visible reply when the gateway sends the final message body on the terminal chat event..
- Telegram/Discord status reactions: show a temporary compacting reaction during auto-compaction pauses and restore thinking afterward so the bot no longer appears frozen while context is being compacted..
- Delivery/dedupe: trim completed direct-cron delivery cache correctly and keep mirrored transcript dedupe active even when transcript files contain malformed lines..
- CLI/thinking help: add the missing `xhigh` level hints to `kibo cron add`, `kibo cron edit`, and `kibo agent` so the help text matches the levels already accepted at runtime..
- Agents/Anthropic replay: drop replayed assistant thinking blocks for native Anthropic and Bedrock Claude providers so persisted follow-up turns no longer fail on stored thinking blocks..
- Docs/Brave pricing: escape literal dollar signs in Brave Search cost text so the docs render the free credit and per-request pricing correctly..
- Feishu/file uploads: preserve literal UTF-8 filenames in `im.file.create` so Chinese and other non-ASCII filenames no longer appear percent-encoded in chat. and.
- Agents/compaction safeguard: trim large kept `toolResult` payloads consistently for budgeting, pruning, and identifier seeding, then restore preserved payloads after prune so oversized safeguard summaries stay stable..
- Agents/Ollama overflow: rewrite Ollama `prompt too long` API payloads through the normal context-overflow sanitizer so embedded sessions keep the friendly overflow copy and auto-compaction trigger..

- Control UI/auth: restore one-time legacy `?token=` imports for shared Control UI links while keeping `#token=` preferred, and carry pending query tokens through gateway URL confirmation so compatibility links still authenticate after confirmation..
- Plugins/context engines: retry legacy lifecycle calls once without `sessionKey` when older plugins reject that field, memoize legacy mode after the first strict-schema fallback, and preserve non-compat runtime errors without retry..
- Agents/compaction: treat markup-wrapped heartbeat boilerplate as non-meaningful session history when deciding whether to compact, so heartbeat-only sessions no longer keep compaction alive due to wrapper formatting..

## 2026.3.11

### Changes

- OpenRouter/models: add temporary Hunter Alpha and Healer Alpha entries to the built-in catalog so OpenRouter users can try the new free stealth models during their roughly one-week availability window..
- iOS/Home canvas: add a bundled welcome screen with a live agent overview that refreshes on connect, reconnect, and foreground return, and move the compact connection pill off the top-left canvas overlay..
- iOS/Home canvas: replace floating controls with a docked toolbar, make the bundled home scaffold adapt to smaller phones, and open chat in the resolved main session instead of a synthetic `ios` session..
- macOS/chat UI: add a chat model picker, persist explicit thinking-level selections across relaunch, and harden provider-aware session model sync for the shared chat composer..
- Onboarding/Ollama: add first-class Ollama setup with Local or Cloud + Local modes, browser-based cloud sign-in, curated model suggestions, and cloud-model handling that skips unnecessary local pulls..
- OpenCode/onboarding: add new OpenCode Go provider, treat Zen and Go as one OpenCode setup in the wizard/docs while keeping the runtime providers split, store one shared OpenCode key for both profiles, and stop overriding the built-in `opencode-go` catalog routing. and.
- Memory: add opt-in multimodal image and audio indexing for `memorySearch.extraPaths` with Gemini `gemini-embedding-2-preview`, strict fallback gating, and scope-based reindexing..
- Memory/Gemini: add `gemini-embedding-2-preview` memory-search support with configurable output dimensions and automatic reindexing when the configured dimensions change. and.
- macOS/onboarding: detect when remote gateways need a shared auth token, explain where to find it on the gateway host, and clarify when a successful check used paired-device auth instead..
- Discord/auto threads: add `autoArchiveDuration` channel config for auto-created threads so Discord thread archiving can stay at 1 hour, 1 day, 3 days, or 1 week instead of always using the 1-hour default..
- iOS/TestFlight: add a local beta release flow with Fastlane prepare/archive/upload support, canonical beta bundle IDs, and watch-app archive fixes..
- ACP/sessions_spawn: add optional `resumeSessionId` for `runtime: "acp"` so spawned ACP sessions can resume an existing ACPX/Codex conversation instead of always starting fresh..
- Gateway/node pending work: add narrow in-memory pending-work queue primitives (`node.pending.enqueue` / `node.pending.drain`) and wake-helper reuse as a foundation for dormant-node work delivery..
- Git/runtime state: ignore the gateway-generated `.dev-state` file so local runtime state does not show up as untracked repo noise..
- Exec/child commands: mark child command environments with `KIBO_CLI` so subprocesses can detect when they were launched from the Kibo CLI..
- LLM Task/Kibo Shell: add an optional `thinking` override so workflow calls can explicitly set embedded reasoning level with shared validation for invalid values and unsupported `xhigh` modes. and.
- Mattermost/reply threading: add `channels.mattermost.replyToMode` for channel and group messages so top-level posts can start thread-scoped sessions without the manual reply-then-thread workaround..
- iOS/push relay: add relay-backed official-build push delivery with App Attest + receipt verification, gateway-bound send delegation, and config-based relay URL setup on the gateway..

### Fixes

- Windows/install: stop auto-installing `node-llama-cpp` during normal npm CLI installs so `kibo@latest` no longer fails on Windows while building optional local-embedding dependencies.
- Windows/update: mirror the native installer environment during global npm updates, including portable Git fallback and Windows-safe npm shell settings, so `kibo update` works again on native Windows installs.
- Gateway/status: expose `runtimeVersion` in gateway status output so install/update smoke tests can verify the running version before and after updates.
- Windows/onboarding: explain when non-interactive local onboarding is waiting for an already-running gateway, and surface native Scheduled Task admin requirements more clearly instead of failing with an opaque gateway timeout.
- Windows/gateway install: fall back from denied Scheduled Task creation to a per-user Startup-folder login item, so native `kibo gateway install` and `--install-daemon` keep working without an elevated PowerShell shell.
- Agents/text sanitization: strip leaked model control tokens (`<|...|>` and full-width `<|...|>` variants) from user-facing assistant text, preventing GLM-5 and DeepSeek internal delimiters from reaching end users..
- iOS/gateway foreground recovery: reconnect immediately on foreground return after stale background sockets are torn down, so the app no longer stays disconnected until a later wake path happens..
- Gateway/Control UI: keep dashboard auth tokens in session-scoped browser storage so same-tab refreshes preserve remote token auth without restoring long-lived localStorage token persistence, while scoping tokens to the selected gateway URL and fragment-only bootstrap flow..
- Gateway/macOS launchd restarts: keep the LaunchAgent registered during explicit restarts, hand off self-restarts through a detached launchd helper, and recover config/hot reload restart paths without unloading the service. Fixes #43311, #43406, #43035, and #43049.
- macOS/LaunchAgent install: tighten LaunchAgent directory and plist permissions during install so launchd bootstrap does not fail when the target home path or generated plist inherited group/world-writable modes.
- Discord/reply chunking: resolve the effective `maxLinesPerMessage` config across live reply paths and preserve `chunkMode` in the fast send path so long Discord replies no longer split unexpectedly at the default 17-line limit..
- Feishu/local image auto-convert: pass `mediaLocalRoots` through the `sendText` local-image shim so allowed local image paths upload as Feishu images again instead of falling back to raw path text..
- Telegram/outbound HTML sends: chunk long HTML-mode messages, preserve plain-text fallback and silent-delivery params across retries, and cut over to plain text when HTML chunk planning cannot safely preserve the full message..
- Telegram/final preview delivery: split active preview lifecycle from cleanup retention so missing archived preview edits avoid duplicate fallback sends without clearing the live preview or blocking later in-place finalization..
- Telegram/final preview delivery followup: keep ambiguous missing-`message_id` finals only when a preview was already visible, while first-preview/no-id cases still fall back so Telegram users do not lose the final reply..
- Telegram/final preview cleanup follow-up: clear stale cleanup-retain state only for transient preview finals so archived-preview retains no longer leave a stale partial bubble beside a later fallback-sent final..
- Telegram/poll restarts: scope process-level polling restarts to real Telegram `getUpdates` failures so unrelated network errors, such as Slack DNS misses, no longer bounce Telegram polling..
- Gateway/auth: allow one trusted device-token retry on shared-token mismatch with recovery hints to prevent reconnect churn during token drift..
- Gateway/config errors: surface up to three validation issues in top-level `config.set`, `config.patch`, and `config.apply` error messages while preserving structured issue details..
- Agents/Azure OpenAI Responses: include the `azure-openai` provider in the Responses API store override so Azure OpenAI multi-turn cron jobs and embedded agent runs no longer fail with HTTP 400 "store is set to false". (#42934, fixes #42800).
- Agents/error rendering: ignore stale assistant `errorMessage` fields on successful turns so background/tool-side failures no longer prepend synthetic billing errors over valid replies..
- Agents/billing recovery: probe single-provider billing cooldowns on the existing throttle so topping up credits can recover without a manual gateway restart..
- Agents/fallback: treat HTTP 499 responses as transient in both raw-text and structured failover paths so Anthropic-style client-closed overload responses trigger model fallback reliably..
- Agents/fallback: recognize Venice `402 Insufficient USD or Diem balance` billing errors so configured model fallbacks trigger instead of surfacing the raw provider error..
- Agents/fallback: recognize Poe `402 You've used up your points!` billing errors so configured model fallbacks trigger instead of surfacing the raw provider error..
- Agents/failover: treat Gemini `MALFORMED_RESPONSE` stop reasons as retryable timeouts so preview-model enum drift falls back cleanly instead of crashing the run, without also reclassifying malformed function-call errors..
- Agents/cooldowns: default cooldown windows with no recorded failure history to `unknown` instead of `rate_limit`, avoiding false API rate-limit warnings while preserving cooldown recovery probes..
- Auth/cooldowns: reset expired auth-profile cooldown error counters before computing the next backoff so stale on-disk counters do not re-escalate into long cooldown loops after expiry..
- Agents/memory flush: forward `memoryFlushWritePath` through `runEmbeddedPiAgent` so memory-triggered flush turns keep the append-only write guard without aborting before tool setup. Follows up on #38574..
- Agents/context pruning: prune image-only tool results during soft-trim, align context-pruning coverage with the new tool-result contract, and extend historical image cleanup to the same screenshot-heavy session path..
- Sessions/reset model recompute: clear stale runtime model, context-token, and system-prompt metadata before session resets recompute the replacement session, so resets pick up current defaults and explicit overrides instead of reusing old runtime model state..
- Channels/allowlists: remove stale matcher caching so same-array allowlist edits and wildcard replacements take effect immediately, with regression coverage for in-place mutation cases.
- Discord/Telegram outbound runtime config: thread runtime-resolved config through Discord and Telegram send paths so SecretRef-based credentials stay resolved during message delivery..
- Tools/web search: treat Brave `llm-context` grounding snippets as plain strings so `web_search` no longer returns empty snippet arrays in LLM Context mode..
- Tools/web search: recover OpenRouter Perplexity citation extraction from `message.annotations` when chat-completions responses omit top-level citations..
- CLI/skills JSON: strip ANSI and C1 control bytes from `skills list --json`, `skills info --json`, and `skills check --json` so machine-readable output stays valid for terminals and skill metadata with embedded control characters. Fixes #27530. Related #27557. and.
- CLI/tables: default shared tables to ASCII borders on legacy Windows consoles while keeping Unicode borders on modern Windows terminals, so commands like `kibo skills` stop rendering mojibake under GBK/936 consoles. Fixes #40853. Related #41015. and.
- CLI/memory teardown: close cached memory search/index managers in the one-shot CLI shutdown path so watcher-backed memory caches no longer keep completed CLI runs alive after output finishes..
- Control UI/Sessions: restore single-column session table collapse on narrow viewport or container widths by moving the responsive table override next to the base grid rule and enabling inline-size container queries..
- Telegram/network env-proxy: apply configured transport policy to proxied HTTPS dispatchers as well as direct `NO_PROXY` bypasses, so resolver-scoped IPv4 fallback and network settings work consistently for env-proxied Telegram traffic..
- Mattermost/Markdown formatting: preserve first-line indentation when stripping bot mentions so nested list items and indented code blocks keep their structure, and render Mattermost tables natively by default instead of fenced-code fallback..
- Mattermost/plugin send actions: normalize direct `replyTo` fallback handling so threaded plugin sends trim blank IDs and reuse the correct reply target again..
- MS Teams/allowlist resolution: use the General channel conversation ID as the resolved team key (with Graph GUID fallback) so Bot Framework runtime `channelData.team.id` matching works for team and team/channel allowlist entries..
- Signal/config schema: accept `channels.signal.accountUuid` in strict config validation so loop-protection configs no longer fail with an unrecognized-key error..
- Telegram/config schema: accept `channels.telegram.actions.editMessage` and `createForumTopic` in strict config validation so existing Telegram action toggles no longer fail as unrecognized keys..
- Telegram/docs: clarify that `channels.telegram.groups` allowlists chats while `groupAllowFrom` allowlists users inside those chats, and point invalid negative chat IDs at the right config key..
- Discord/config typing: expose channel-level `autoThread` on the canonical guild-channel config type so strict config loading matches the existing Discord schema and runtime behavior..
- fix(models): guard optional model.input capability checks
- Models/Alibaba Cloud Model Studio: wire `MODELSTUDIO_API_KEY` through shared env auth, implicit provider discovery, and shell-env fallback so onboarding works outside the wizard too..
- Resolve web tool SecretRefs atomically at runtime..
- Secret files: harden CLI and channel credential file reads against path-swap races by requiring direct regular files for `*File` secret inputs and rejecting symlink-backed secret files.
- Archive extraction: harden TAR and external `tar.bz2` installs against destination symlink and pre-existing child-symlink escapes by extracting into staging first and merging into the canonical destination with safe file opens.
- Secrets/SecretRef: reject exec SecretRef traversal ids across schema, runtime, and gateway..
- Sandbox/fs bridge: pin staged writes to verified parent directories so temporary write files cannot materialize outside the allowed mount before atomic replace..
- Gateway/auth: fail closed when local `gateway.auth.*` SecretRefs are configured but unavailable, instead of silently falling back to `gateway.remote.*` credentials in local mode..
- Commands/config writes: enforce `configWrites` against both the originating account and the targeted account scope for `/config` and config-backed `/allowlist` edits, blocking sibling-account mutations while preserving gateway `operator.admin` flows. for reporting.
- Security/system.run: fail closed for approval-backed interpreter/runtime commands when Kibo cannot bind exactly one concrete local file operand, while extending best-effort direct-file binding to additional runtime forms. for reporting.
- Gateway/session reset auth: split conversation `/new` and `/reset` handling away from the admin-only `sessions.reset` control-plane RPC so write-scoped gateway callers can no longer reach the privileged reset path through `agent`. for reporting.
- Security/plugin runtime: stop unauthenticated plugin HTTP routes from inheriting synthetic admin gateway scopes when they call `runtime.subagent.*`, so admin-only methods like `sessions.delete` stay blocked without gateway auth.
- Security/nodes: treat the `nodes` agent tool as owner-only fallback policy so non-owner senders cannot reach paired-node approval or invoke paths through the shared tool set.
- Sandbox/sessions_spawn: restore real workspace handoff for read-only sandboxed sessions so spawned subagents mount the configured workspace at `/agent` instead of inheriting the sandbox copy. Related #40582.
- Security/external content: treat whitespace-delimited `EXTERNAL UNTRUSTED CONTENT` boundary markers like underscore-delimited variants so prompt wrappers cannot bypass marker sanitization..
- Telegram/exec approvals: reject `/approve` commands aimed at other bots, keep deterministic approval prompts visible when tool-result delivery fails, and stop resolved exact IDs from matching other pending approvals by prefix..
- Subagents/authority: persist leaf vs orchestrator control scope at spawn time and route tool plus slash-command control through shared ownership checks, so leaf sessions cannot regain orchestration privileges after restore or flat-key lookups..
- ACP/ACPX plugin: bump the bundled `acpx` pin to `0.1.16` so plugin-local installs and strict version checks match the latest published CLI..
- ACP/sessions.patch: allow `spawnedBy` and `spawnDepth` lineage fields on ACP session keys so `sessions_spawn` with `runtime: "acp"` no longer fails during child-session setup. Fixes #40971..
- ACP/stop reason mapping: resolve gateway chat `state: "error"` completions as ACP `end_turn` instead of `refusal` so transient backend failures are not surfaced as deliberate refusals..
- ACP/setSessionMode: propagate gateway `sessions.patch` failures back to ACP clients so rejected mode changes no longer return silent success..
- ACP/bridge mode: reject unsupported per-session MCP server setup and propagate rejected session-mode changes so IDE clients see explicit bridge limitations instead of silent success..
- ACP/session UX: replay stored user and assistant text on `loadSession`, expose Gateway-backed session controls and metadata, and emit approximate session usage updates so IDE clients restore context more faithfully..
- ACP/tool streaming: enrich `tool_call` and `tool_call_update` events with best-effort text content and file-location hints so IDE clients can follow bridge tool activity more naturally..
- ACP/runtime attachments: forward normalized inbound image attachments into ACP runtime turns so ACPX sessions can preserve image prompt content on the runtime path..
- ACP/regressions: add gateway RPC coverage for ACP lineage patching, ACPX runtime coverage for image prompt serialization, and an operator smoke-test procedure for live ACP spawn verification..
- ACP/follow-up hardening: make session restore and prompt completion degrade gracefully on transcript/update failures, enforce bounded tool-location traversal, and skip non-image ACPX turns the runtime cannot serialize..
- ACP/sessions_spawn: implicitly stream `mode="run"` ACP spawns to parent only for eligible subagent orchestrator sessions (heartbeat `target: "last"` with a usable session-local route), restoring parent progress relays without thread binding..
- ACP/main session aliases: canonicalize `main` before ACP session lookup so restarted ACP main sessions rehydrate instead of failing closed with `Session is not ACP-enabled: main`. (#43285, fixes #25692)
- Plugins/context-engine model auth: expose `runtime.modelAuth` and plugin-sdk auth helpers so plugins can resolve provider/model API keys through the normal auth pipeline..
- Hooks/plugin context parity followup: pass `trigger` and `channelId` through embedded `llm_input`, `agent_end`, and `llm_output` hook contexts so plugins receive the same agent metadata across hook phases..
- Plugins/global hook runner: harden singleton state handling so shared global hook runner reuse does not leak or corrupt runner state across executions..
- Context engine/tests: add bundled-registry regression coverage for cross-chunk resolution, plugin-sdk re-exports, and concurrent chunk registration..
- Agents/embedded runner: bound compaction retry waiting and drain embedded runs during SIGUSR1 restart so session lanes recover instead of staying blocked behind compaction..
- Agents/embedded logs: add structured, sanitized lifecycle and failover observation events so overload and provider failures are easier to tail and filter..
- Agents/embedded overload logs: include the failing model and provider in error-path console output, with lifecycle regression coverage for the rendered and sanitized `consoleMessage`..
- Agents/fallback observability: add structured, sanitized model-fallback decision and auth-profile failure-state events with correlated run IDs so cooldown probes and failover paths are easier to trace in logs..
- Logging/probe observations: suppress structured embedded and model-fallback probe warnings on the console without hiding error or fatal output..
- Agents/context-engine compaction: guard thrown engine-owned overflow compaction attempts and fire compaction hooks for `ownsCompaction` engines so overflow recovery no longer crashes and plugin subscribers still observe compact runs..
- Gateway/node pending drain followup: keep `hasMore` true when the deferred baseline status item still needs delivery, and avoid allocating empty pending-work state for drain-only nodes with no queued work..
- Protocol/Swift model sync: regenerate pending node work Swift bindings after the landed `node.pending.*` schema additions so generated protocol artifacts are consistent again..
- Cron/subagent followup: do not misclassify empty or `NO_REPLY` cron responses as interim acknowledgements that need a rerun, so deliberately silent cron jobs are no longer retried..
- ACP/run-mode delivery: restore inline delivery for one-shot ACP run spawns from non-subagent (main) requester sessions so completions reach the originating Discord/Telegram/etc. channel again. Subagent orchestrators continue to use stream-to-parent when an active heartbeat relay route is available..
- Cron/state errors: record `lastErrorReason` in cron job state and keep the gateway schema aligned with the full failover-reason set, including regression coverage for protocol conformance..
- Browser/Browserbase 429 handling: surface stable no-retry rate-limit guidance without buffering discarded HTTP 429 response bodies from remote browser services..
- CI/CodeQL Swift toolchain: select Xcode 26.1 before installing Swift build tools so the CodeQL Swift job uses Swift tools 6.2 on `macos-latest`..
- Sandbox/subagents: pass the real configured workspace through `sessions_spawn` inheritance when a parent agent runs in a copied-workspace sandbox, so child `/agent` mounts point at the configured workspace instead of the parent sandbox copy..
- Agents/fallback cooldown probing: cap cooldown-bypass probing to one attempt per provider per fallback run so multi-model same-provider cooldown chains can continue to cross-provider fallbacks instead of repeatedly stalling on duplicate cooldown probes..
- Telegram/direct delivery: bridge direct delivery sends to internal `message:sent` hooks so internal hook listeners observe successful Telegram deliveries..
- Dependencies: refresh workspace dependencies except the pinned Carbon package, and harden ACP session-config writes against non-string SDK values so newer ACP clients fail fast instead of tripping type/runtime mismatches.
- Telegram/polling restarts: clear bounded cleanup timeout handles after `runner.stop()` and `bot.stop()` settle so stall recovery no longer leaves stray 15-second timers behind on clean shutdown..
- Status/context windows: normalize provider-qualified override cache keys so `/status` resolves the active provider's configured context window even when `models.providers` keys use mixed case or surrounding whitespace..
- Agents/embedded runner: recover canonical allowlisted tool names from malformed `toolCallId` and malformed non-blank tool-name variants before dispatch, while failing closed on ambiguous matches..
- Agents/failover: classify ZenMux quota-refresh `402` responses as `rate_limit` so model fallback retries continue instead of stopping on a temporary subscription window..
- Agents/failover: classify HTTP 422 malformed-request responses as `format` and recognize OpenRouter "requires more credits" billing errors so provider fallback triggers instead of surfacing raw errors..
- Memory/QMD Windows: fail closed when `qmd.cmd` or `mcporter.cmd` wrappers cannot be resolved to a direct entrypoint, so memory search no longer falls back to shell execution on Windows.
- macOS/remote gateway: stop PortGuardian from killing Docker Desktop and other external listeners on the gateway port in remote mode, so containerized and tunneled gateway setups no longer lose their port-forward owner on app startup..
- Feishu/streaming recovery: clear stale `streamingStartPromise` when card creation fails (HTTP 400) so subsequent messages can retry streaming instead of silently dropping all future replies. Fixes #43322.
- Exec/env sandbox: block JVM agent injection (`JAVA_TOOL_OPTIONS`, `_JAVA_OPTIONS`, `JDK_JAVA_OPTIONS`), Python breakpoint hijack (`PYTHONBREAKPOINT`), and .NET startup hooks (`DOTNET_STARTUP_HOOKS`) from the host exec environment.
- Android/camera clip cleanup: delete temporary clip files even when `readBytes()` fails so failed clip captures do not leak cache storage..
- Android/photos: recycle decoded and intermediate bitmaps in `photos.latest` so repeated photo fetches stop leaking native memory..

### Security

- Gateway/WebSocket: enforce browser origin validation for all browser-originated connections regardless of whether proxy headers are present, closing a cross-site WebSocket hijacking path in `trusted-proxy` mode that could grant untrusted origins `operator.admin` access. (GHSA-5wcw-8jjv-m286)

### Breaking

- Cron/doctor: tighten isolated cron delivery so cron jobs can no longer notify through ad hoc agent sends or fallback main-session summaries, and add `kibo doctor --fix` migration for legacy cron storage and legacy notify/webhook delivery metadata..

## 2026.3.8

### Changes

- CLI/backup: add `kibo backup create` and `kibo backup verify` for local state archives, including `--only-config`, `--no-include-workspace`, manifest/payload validation, and backup guidance in destructive flows..
- macOS/onboarding: add a remote gateway token field for remote mode, preserve existing non-plaintext `gateway.remote.token` config values until explicitly replaced, and warn when the loaded token shape cannot be used directly from the macOS app. (#40187, supersedes #34614).
- Talk mode: add top-level `talk.silenceTimeoutMs` config so Talk waits a configurable amount of silence before auto-sending the current transcript, while keeping each platform's existing default pause window when unset.. Fixes #17147.
- TUI: infer the active agent from the current workspace when launched inside a configured agent workspace, while preserving explicit `agent:` session targets..
- Tools/Brave web search: add opt-in `tools.web.search.brave.mode: "llm-context"` so `web_search` can call Brave's LLM Context endpoint and return extracted grounding snippets with source metadata, plus config/docs/test coverage..
- CLI/install: include the short git commit hash in `kibo --version` output when metadata is available, and keep installer version checks compatible with the decorated format..
- CLI/backup: improve archive naming for date sorting, add config-only backup mode, and harden backup planning, publication, and verification edge cases..
- ACP/Provenance: add optional ACP ingress provenance metadata and visible receipt injection (`kibo acp --provenance off|meta|meta+receipt`) so Kibo agents can retain and report ACP-origin context with session trace IDs..
- Tools/web search: alphabetize provider ordering across runtime selection, onboarding/configure pickers, and config metadata, so provider lists stay neutral and multi-key auto-detect now prefers Grok before Kimi..
- Docs/Web search: restore $5/month free-credit details, replace defunct "Data for Search"/"Data for AI" plan names with current "Search" plan, and note legacy subscription validity in Brave setup docs. Follows up on #26860..
- Extensions/ACPX tests: move the shared runtime fixture helper from `src/runtime-internals/` to `src/test-utils/` so the test-only helper no longer looks like shipped runtime code.

### Fixes

- Update/macOS launchd restart: re-enable disabled LaunchAgent services before updater bootstrap so `kibo update` can recover from a disabled gateway service instead of leaving the restart step stuck.
- macOS app/chat UI: route browser proxy through the local node browser service, preserve plain-text paste semantics, strip completed assistant trace/debug wrapper noise from transcripts, refresh permission state after returning from System Settings, and tolerate malformed cron rows in the macOS tab..
- Android/Play distribution: remove self-update, background location, `screen.record`, and background mic capture from the Android app, narrow the foreground service to `dataSync` only, and clean up the legacy `location.enabledMode=always` preference migration..
- Telegram/DM routing: dedupe inbound Telegram DMs per agent instead of per session key so the same DM cannot trigger duplicate replies when both `agent:main:main` and `agent:main:telegram:direct:<id>` resolve for one agent. Fixes #40005. Supersedes #40116..
- Cron/Telegram announce delivery: route text-only announce jobs through the real outbound adapters after finalizing descendant output so plain Telegram targets no longer report `delivered: true` when no message actually reached Telegram..
- Matrix/DM routing: add safer fallback detection for broken `m.direct` homeservers, honor explicit room bindings over DM classification, and preserve room-bound agent selection for Matrix DM rooms..
- Feishu/plugin onboarding: clear the short-lived plugin discovery cache before reloading the registry after installing a channel plugin, so onboarding no longer re-prompts to download Feishu immediately after a successful install. Fixes #39642..
- Plugins/channel onboarding: prefer bundled channel plugins over duplicate npm-installed copies during onboarding and release-channel sync, preventing bundled plugins from being shadowed by npm installs with the same plugin ID.
- Config/runtime snapshots: keep secrets-runtime-resolved config and auth-profile snapshots intact after config writes so follow-up reads still see file-backed secret values while picking up the persisted config update..
- Gateway/Control UI: resolve bundled dashboard assets through symlinked global wrappers and auto-detected package roots, while keeping configured and custom roots on the strict hardlink boundary..
- Browser/extension relay: add `browser.relayBindHost` so the Chrome relay can bind to an explicit non-loopback address for WSL2 and other cross-namespace setups, while preserving loopback-only defaults..
- Browser/CDP: normalize loopback direct WebSocket CDP URLs back to HTTP(S) for `/json/*` tab operations so local `ws://` / `wss://` profiles can still list, focus, open, and close tabs after the new direct-WS support lands..
- Browser/CDP: rewrite wildcard `ws://0.0.0.0` and `ws://[::]` debugger URLs from remote `/json/version` responses back to the external CDP host/port, fixing Browserless-style container endpoints..
- Browser/extension relay: wait briefly for a previously attached Chrome tab to reappear after transient relay drops before failing with `tab not found`, reducing noisy reconnect flakes..
- macOS/Tailscale gateway discovery: keep Tailscale Serve probing alive when other remote gateways are already discovered, prefer direct transport for resolved `.ts.net` and Tailscale Serve gateways, and set `TERM=dumb` for GUI-launched Tailscale CLI discovery..
- TUI/theme: detect light terminal backgrounds via `COLORFGBG` and pick a WCAG AA-compliant light palette, with `KIBO_THEME=light|dark` override for terminals without auto-detection. and.
- Agents/openai-codex: normalize `gpt-5.4` fallback transport back to `openai-codex-responses` on `chatgpt.com/backend-api` when config drifts to the generic OpenAI responses endpoint..
- Models/openai-codex GPT-5.4 forward-compat: use the GPT-5.4 1,050,000-token context window and 128,000 max tokens for `openai-codex/gpt-5.4` instead of inheriting stale legacy Codex limits in resolver fallbacks and model listing..
- Tools/web search: restore Perplexity OpenRouter/Sonar compatibility for legacy `OPENROUTER_API_KEY`, `sk-or-...`, and explicit `perplexity.baseUrl` / `model` setups while keeping direct Perplexity keys on the native Search API path..
- Agents/failover: detect Amazon Bedrock `Too many tokens per day` quota errors as rate limits across fallback, cron retry, and memory embeddings while keeping context-window `too many tokens per request` errors out of the rate-limit lane..
- Mattermost replies: keep `root_id` pinned to the existing thread root when an agent replies inside a thread, while still using reply-target threading for top-level posts..
- Telegram/DM partial streaming: keep DM preview lanes on real message edits instead of native draft materialization so final replies no longer flash a second duplicate copy before collapsing back to one.
- macOS overlays: fix VoiceWake, Talk, and Notify overlay exclusivity crashes by removing shared `inout` visibility mutation from `OverlayPanelFactory.present`, and add a repeated Talk overlay smoke test. (#39275, #39321).
- macOS Talk Mode: set the speech recognition request `taskHint` to `.dictation` for mic capture, and add regression coverage for the request defaults..
- macOS release packaging: default `scripts/package-mac-app.sh` to universal binaries for `BUILD_CONFIG=release`, and clarify that `scripts/package-mac-dist.sh` already produces the release zip + DMG..
- Tools/web search: restore Perplexity OpenRouter/Sonar compatibility for legacy `OPENROUTER_API_KEY`, `sk-or-...`, and explicit `perplexity.baseUrl` / `model` setups while keeping direct Perplexity keys on the native Search API path..
- Tools/web search: restore Perplexity OpenRouter/Sonar compatibility for legacy `OPENROUTER_API_KEY`, `sk-or-...`, and explicit `perplexity.baseUrl` / `model` setups while keeping direct Perplexity keys on the native Search API path..
- Doctor/Codex OAuth: warn only for legacy `models.providers.openai-codex` transport overrides that can shadow the built-in Codex OAuth path, while leaving supported custom proxies and header-only overrides alone..
- Hooks/session-memory: keep `/new` and `/reset` memory artifacts in the bound agent workspace and align saved reset session keys with that workspace when stale main-agent keys leak into the hook path..
- Sessions/model switch: clear stale cached `contextTokens` when a session changes models so status and runtime paths recompute against the active model window..
- ACP/session history: persist transcripts for successful ACP child runs, preserve exact transcript text, record ACP spawned-session lineage, and keep spawn-time transcript-path persistence best-effort so history storage failures do not block execution..
- Docs/browser: add a layered WSL2 + Windows remote Chrome CDP troubleshooting guide, including Control UI origin pitfalls and extension-relay bind-address guidance..
- Context engine registry/bundled builds: share the registry state through a `globalThis` singleton so duplicated bundled module copies can resolve engines registered by each other at runtime, with regression coverage for duplicate-module imports..
- Podman/setup: fix `cannot chdir: Permission denied` in `run_as_user` when `setup-podman.sh` is invoked from a directory the target user cannot access, by wrapping user-switch calls in a subshell that cd's to `/tmp` with `/` fallback. and.
- Podman/SELinux: auto-detect SELinux enforcing/permissive mode and add `:Z` relabel to bind mounts in `run-kibo-podman.sh` and the Quadlet template, fixing `EACCES` on Fedora/RHEL hosts. Supports `KIBO_BIND_MOUNT_OPTIONS` override. and.
- Agents/context-engine plugins: bootstrap runtime plugins once at embedded-run, compaction, and subagent boundaries so plugin-provided context engines and hooks load from the active workspace before runtime resolution.
- Docs/Changelog: correct the contributor credit for the bundled Control UI global-install fix to..
- Telegram/media downloads: time out only stalled body reads so polling recovers from hung file downloads without aborting slow downloads that are still streaming data..
- Docker/runtime image: prune dev dependencies, strip build-only dist metadata for smaller Docker images..
- Subagents/sandboxing: restrict leaf subagents to their own spawned runs and remove leaf `subagents` control access so sandboxed leaf workers can no longer steer sibling sessions..
- Gateway/restart timeout recovery: exit non-zero when restart-triggered shutdown drains time out so launchd/systemd restart the gateway instead of treating the failed restart as a clean stop. Landed from contributor PR #40380 by..
- Gateway/config restart guard: validate config before service start/restart and keep post-SIGUSR1 startup failures from crashing the gateway process, reducing invalid-config restart loops and macOS permission loss. Landed from contributor PR #38699 by..
- Gateway/launchd respawn detection: treat `XPC_SERVICE_NAME` as a launchd supervision hint so macOS restarts exit cleanly under launchd instead of attempting detached self-respawn. Landed from contributor PR #20555 by..
- Telegram/poll restart cleanup: abort the in-flight Telegram API fetch when shutdown or forced polling restarts stop a runner, preventing stale `getUpdates` long polls from colliding with the replacement runner. Landed from contributor PR #23950 by..
- Cron/restart catch-up staggering: limit immediate missed-job replay on startup and reschedule the deferred remainder from the post-catchup clock so restart bursts do not starve the gateway or silently skip overdue recurring jobs. Landed from contributor PR #18925 by..
- Cron/owner-only tools: pass trusted isolated cron runs into the embedded agent with owner context so `cron`/`gateway` tooling remains available after the owner-auth hardening narrowed direct-message ownership inference.
- Browser/SSRF: block private-network intermediate redirect hops in strict browser navigation flows and fail closed when remote tab-open paths cannot inspect redirect chains..
- MS Teams/authz: keep `groupPolicy: "allowlist"` enforcing sender allowlists even when a team/channel route allowlist is configured, so route matches no longer widen group access to every sender in that route..
- Security/Gateway: block `device.token.rotate` from minting operator scopes broader than the caller session already holds, closing the critical paired-device token privilege escalation reported as GHSA-4jpw-hj22-2xmc.
- Security/system.run: bind approved `bun` and `deno run` script operands to on-disk file snapshots so post-approval script rewrites are denied before execution.
- Skills/download installs: pin the validated per-skill tools root before writing downloaded archives, so rebinding the lexical tools path cannot redirect download writes outside the intended tools directory..
- Control UI/Debug: replace the Manual RPC free-text method field with a sorted dropdown sourced from gateway-advertised methods, and stack the form vertically for narrower layouts..
- Auth/profile resolution: log debug details when auto-discovered auth profiles fail during provider API-key resolution, so `--debug` output surfaces the real refresh/keychain/credential-store failure instead of only the generic missing-key message..
- ACP/cancel scoping: scope `chat.abort` and shared-session ACP event routing by `runId` so one session cannot cancel or consume another session's run when they share the same gateway session key..
- SecretRef/models: harden custom/provider secret persistence and reuse across models.json snapshots, merge behavior, runtime headers, and secret audits..
- macOS/browser proxy: serialize non-GET browser proxy request bodies through `AnyCodable.foundationValue` so nested JSON bodies no longer crash the macOS app with `Invalid type in JSON write (__SwiftValue)`..
- CLI/skills tables: keep terminal table borders aligned for wide graphemes, use full reported terminal width, and switch a few ambiguous skill icons to Terminal-safe emoji so `kibo skills` renders more consistently in Terminal.app and iTerm..
- Memory/Gemini: normalize returned Gemini embeddings across direct query, direct batch, and async batch paths so memory search uses consistent vector handling for Gemini too..
- Agents/failover: recognize additional serialized network errno strings plus `EHOSTDOWN` and `EPIPE` structured codes so transient transport failures trigger timeout failover more reliably..
- Agents/embedded runner: carry provider-observed overflow token counts into compaction so overflow retries and diagnostics use the rejected live prompt size instead of only transcript estimates..
- Agents/compaction transcript updates: emit a transcript-update event immediately after successful embedded compaction so downstream listeners observe the post-compact transcript without waiting for a later write..
- Agents/sessions_spawn: use the target agent workspace for cross-agent spawned runs instead of inheriting the caller workspace, so child sessions load the correct workspace-scoped instructions and persona files..

## 2026.3.7

### Changes

- Agents/context engine plugin interface: add `ContextEngine` plugin slot with full lifecycle hooks (`bootstrap`, `ingest`, `assemble`, `compact`, `afterTurn`, `prepareSubagentSpawn`, `onSubagentEnded`), slot-based registry with config-driven resolution, `LegacyContextEngine` wrapper preserving existing compaction behavior, scoped subagent runtime for plugin runtimes via `AsyncLocalStorage`, and `sessions.get` gateway method. Enables plugins like `lossless-claw` to provide alternative context management strategies without modifying core compaction logic. Zero behavior change when no context engine plugin is configured..
- ACP/persistent channel bindings: add durable Discord channel and Telegram topic binding storage, routing resolution, and CLI/docs support so ACP thread targets survive restarts and can be managed consistently..
- Telegram/ACP topic bindings: accept Telegram Mac Unicode dash option prefixes in `/acp spawn`, support Telegram topic thread binding (`--thread here|auto`), route bound-topic follow-ups to ACP sessions, add actionable Telegram approval buttons with prefixed approval-id resolution, and pin successful bind confirmations in-topic..
- Telegram/topic agent routing: support per-topic `agentId` overrides in forum groups and DM topics so topics can route to dedicated agents with isolated sessions. (#33647; based on #31513) and.
- Web UI/i18n: add Spanish (`es`) locale support in the Control UI, including locale detection, lazy loading, and language picker labels across supported locales..
- Onboarding/web search: add provider selection step and full provider list in configure wizard, with SecretRef ref-mode support during onboarding. and.
- Tools/Web search: switch Perplexity provider to Search API with structured results plus new language/region/time filters..
- Gateway: add SecretRef support for gateway.auth.token with auth-mode guardrails..
- Docker/Podman extension dependency baking: add `KIBO_EXTENSIONS` so container builds can preinstall selected bundled extension npm dependencies into the image for faster and more reproducible startup in container deployments..
- Plugins/before_prompt_build system-context fields: add `prependSystemContext` and `appendSystemContext` so static plugin guidance can be placed in system prompt space for provider caching and lower repeated prompt token cost..
- Plugins/hook policy: add `plugins.entries.<id>.hooks.allowPromptInjection`, validate unknown typed hook names at runtime, and preserve legacy `before_agent_start` model/provider overrides while stripping prompt-mutating fields when prompt injection is disabled..
- Hooks/Compaction lifecycle: emit `session:compact:before` and `session:compact:after` internal events plus plugin compaction callbacks with session/count metadata, so automations can react to compaction runs consistently..
- Agents/compaction post-context configurability: add `agents.defaults.compaction.postCompactionSections` so deployments can choose which `AGENTS.md` sections are re-injected after compaction, while preserving legacy fallback behavior when the documented default pair is configured in any order..
- TTS/OpenAI-compatible endpoints: add `messages.tts.openai.baseUrl` config support with config-over-env precedence, endpoint-aware directive validation, and OpenAI TTS request routing to the resolved base URL..
- Slack/DM typing feedback: add `channels.slack.typingReaction` so Socket Mode DMs can show reaction-based processing status even when Slack native assistant typing is unavailable..
- Discord/allowBots mention gating: add `allowBots: "mentions"` to only accept bot-authored messages that mention the bot..
- Agents/tool-result truncation: preserve important tail diagnostics by using head+tail truncation for oversized tool results while keeping configurable truncation options..
- Cron/job snapshot persistence: skip backup during normalization persistence in `ensureLoaded` so `jobs.json.bak` keeps the pre-edit snapshot for recovery, while preserving backup creation on explicit user-driven writes..
- CLI: make read-only SecretRef status flows degrade safely.
- Tools/Diffs guidance: restore a short system-prompt hint for enabled diffs while keeping the detailed instructions in the companion skill, so diffs usage guidance stays out of user-prompt space..
- Tools/Diffs guidance loading: move diffs usage guidance from unconditional prompt-hook injection to the plugin companion skill path, reducing unrelated-turn prompt noise while keeping diffs tool behavior unchanged..
- Docs/Web search: remove outdated Brave free-tier wording and replace prescriptive AI ToS guidance with neutral compliance language in Brave setup docs..
- Config/Compaction safeguard tuning: expose `agents.defaults.compaction.recentTurnsPreserve` and quality-guard retry knobs through the validated config surface and embedded-runner wiring, with regression coverage for real config loading and schema metadata..
- iOS/App Store Connect release prep: align iOS bundle identifiers under `ai.kibo.client`, refresh Watch app icons, add Fastlane metadata/screenshot automation, and support Keychain-backed ASC auth for uploads..
- Mattermost/model picker: add Telegram-style interactive provider/model browsing for `/oc_model` and `/oc_models`, fix picker callback updates, and emit a normal confirmation reply when a model is selected..
- Docker/multi-stage build: restructure Dockerfile as a multi-stage build to produce a minimal runtime image without build tools, source code, or Bun; add `KIBO_VARIANT=slim` build arg for a bookworm-slim variant..
- Google/Gemini 3.1 Flash-Lite: add first-class `google/gemini-3.1-flash-lite-preview` support across model-id normalization, default aliases, media-understanding image lookups, Google Gemini CLI forward-compat fallback, and docs.
- Agents/compaction model override: allow `agents.defaults.compaction.model` to route compaction summarization through a different model than the main session, and document the override across config help/reference surfaces..

### Fixes

- Models/MiniMax: stop advertising removed `MiniMax-M2.5-Lightning` in built-in provider catalogs, onboarding metadata, and docs; keep the supported fast-tier model as `MiniMax-M2.5-highspeed`.
- Models/Vercel AI Gateway: synthesize the built-in `vercel-ai-gateway` provider from `AI_GATEWAY_API_KEY` and auto-discover the live `/v1/models` catalog so `/models vercel-ai-gateway` exposes current refs including `openai/gpt-5.4`.
- Security/Config: fail closed when `loadConfig()` hits validation or read errors so invalid configs cannot silently fall back to permissive runtime defaults..
- Memory/Hybrid search: preserve negative FTS5 BM25 relevance ordering in `bm25RankToScore()` so stronger keyword matches rank above weaker ones instead of collapsing or reversing scores..
- LINE/`requireMention` group gating: align inbound and reply-stage LINE group policy resolution across raw, `group:`, and `room:` keys (including account-scoped group config), preserve plugin-backed reply-stage fallback behavior, and add regression coverage for prefixed-only group/room config plus reply-stage policy resolution..
- Onboarding/local setup: default unset local `tools.profile` to `coding` instead of `messaging`, restoring file/runtime tools for fresh local installs while preserving explicit user-set profiles. (from #38241, overlap with #34958).
- Gateway/Telegram stale-socket restart guard: only apply stale-socket restarts to channels that publish event-liveness timestamps, preventing Telegram providers from being misclassified as stale solely due to long uptime and avoiding restart/pairing storms after upgrade. (kibo#38464)
- Onboarding/headless Linux daemon probe hardening: treat `systemctl --user is-enabled` probe failures as non-fatal during daemon install flow so onboarding no longer crashes on SSH/headless VPS environments before showing install guidance..
- Memory/QMD mcporter Windows spawn hardening: when `mcporter.cmd` launch fails with `spawn EINVAL`, retry via bare `mcporter` shell resolution so QMD recall can continue instead of falling back to builtin memory search..
- Tools/web_search Brave language-code validation: align `search_lang` handling with Brave-supported codes (including `zh-hans`, `zh-hant`, `en-gb`, and `pt-br`), map common alias inputs (`zh`, `ja`) to valid Brave values, and reject unsupported codes before upstream requests to prevent 422 failures..
- Models/openai-completions streaming compatibility: force `compat.supportsUsageInStreaming=false` for non-native OpenAI-compatible endpoints during model normalization, preventing usage-only stream chunks from triggering `choices[0]` parser crashes in provider streams..
- Tools/xAI native web-search collision guard: drop Kibo `web_search` from tool registration when routing to xAI/Grok model providers (including OpenRouter `x-ai/*`) to avoid duplicate tool-name request failures against provider-native `web_search`..
- TUI/token copy-safety rendering: treat long credential-like mixed alphanumeric tokens (including quoted forms) as copy-sensitive in render sanitization so formatter hard-wrap guards no longer inject visible spaces into auth-style values before display..
- WhatsApp/self-chat response prefix fallback: stop forcing `"[kibo]"` as the implicit outbound response prefix when no identity name or response prefix is configured, so blank/default prefix settings no longer inject branding text unexpectedly in self-chat flows..
- Memory/QMD search result decoding: accept `qmd search` hits that only include `file` URIs (for example `qmd://collection/path.md`) without `docid`, resolve them through managed collection roots, and keep multi-collection results keyed by file fallback so valid QMD hits no longer collapse to empty `memory_search` output..
- Memory/QMD collection-name conflict recovery: when `qmd collection add` fails because another collection already occupies the same `path + pattern`, detect the conflicting collection from `collection list`, remove it, and retry add so agent-scoped managed collections are created deterministically instead of being silently skipped; also add warning-only fallback when qmd metadata is unavailable to avoid destructive guesses..
- Slack/app_mention race dedupe: when `app_mention` dispatch wins while same-`ts` `message` prepare is still in-flight, suppress the later message dispatch so near-simultaneous Slack deliveries do not produce duplicate replies; keep single-retry behavior and add regression coverage for both dropped and successful message-prepare outcomes..
- Gateway/chat streaming tool-boundary text retention: merge assistant delta segments into per-run chat buffers so pre-tool text is preserved in live chat deltas/finals when providers emit post-tool assistant segments as non-prefix snapshots..
- TUI/model indicator freshness: prevent stale session snapshots from overwriting freshly patched model selection (and reset per-session freshness when switching session keys) so `/model` updates reflect immediately instead of lagging by one or more commands..
- TUI/final-error rendering fallback: when a chat `final` event has no renderable assistant content but includes envelope `errorMessage`, render the formatted error text instead of collapsing to `"(no output)"`, preserving actionable failure context in-session..
- TUI/session-key alias event matching: treat chat events whose session keys are canonical aliases (for example `agent:<id>:main` vs `main`) as the same session while preserving cross-agent isolation, so assistant replies no longer disappear or surface in another terminal window due to strict key-form mismatch..
- OpenAI Codex OAuth/login parity: keep `kibo models auth login --provider openai-codex` on the built-in path even without provider plugins, preserve Pi-generated authorize URLs without local scope rewriting, and stop validating successful Codex sign-ins against the public OpenAI Responses API after callback. (#37558; follow-up to #36660 and #24720), and.
- Agents/config schema lookup: add `gateway` tool action `config.schema.lookup` so agents can inspect one config path at a time before edits without loading the full schema into prompt context..
- Onboarding/API key input hardening: strip non-Latin1 Unicode artifacts from normalized secret input (while preserving Latin-1 content and internal spaces) so malformed copied API keys cannot trigger HTTP header `ByteString` construction crashes; adds regression coverage for shared normalization and MiniMax auth header usage..
- Kimi Coding/Anthropic tools compatibility: normalize `anthropic-messages` tool payloads to OpenAI-style `tools[].function` + compatible `tool_choice` when targeting Kimi Coding endpoints, restoring tool-call workflows that regressed after v2026.3.2..
- Heartbeat/workspace-path guardrails: append explicit workspace `HEARTBEAT.md` path guidance (and `docs/heartbeat.md` avoidance) to heartbeat prompts so heartbeat runs target workspace checklists reliably across packaged install layouts..
- Node/system.run approvals: bind approval prompts to the exact executed argv text and show shell payload only as a secondary preview, closing basename-spoofed wrapper approval mismatches..
- Subagents/kill-complete announce race: when a late `subagent-complete` lifecycle event arrives after an earlier kill marker, clear stale kill suppression/cleanup flags and re-run announce cleanup so finished runs no longer get silently swallowed..
- Agents/tool-result cleanup timeout hardening: on embedded runner teardown idle timeouts, clear pending tool-call state without persisting synthetic `missing tool result` entries, preventing timeout cleanups from poisoning follow-up turns; adds regression coverage for timeout clear-vs-flush behavior..
- Agents/openai-completions stream timeout hardening: ensure runtime undici global dispatchers use extended streaming body/header timeouts (including env-proxy dispatcher mode) before embedded runs, reducing forced mid-stream `terminated` failures on long generations; adds regression coverage for dispatcher selection and idempotent reconfiguration..
- Agents/fallback cooldown probe execution: thread explicit rate-limit cooldown probe intent from model fallback into embedded runner auth-profile selection so same-provider fallback attempts can actually run when all profiles are cooldowned for `rate_limit` (instead of failing pre-run as `No available auth profile`), while preserving default cooldown skip behavior and adding regression tests at both fallback and runner layers..
- Cron/OpenAI Codex OAuth refresh hardening: when `openai-codex` token refresh fails specifically on account-id extraction, reuse the cached access token instead of failing the run immediately, with regression coverage to keep non-Codex and unrelated refresh failures unchanged..
- TUI/session isolation for `/new`: make `/new` allocate a unique `tui-<uuid>` session key instead of resetting the shared agent session, so multiple TUI clients on the same agent stop receiving each other's replies; also sanitize `/new` and `/reset` failure text before rendering in-terminal. Landed from contributor PR #39238 by..
- Synology Chat/rate-limit env parsing: honor `SYNOLOGY_RATE_LIMIT=0` as an explicit value while still falling back to the default limit for malformed env values instead of partially parsing them. Landed from contributor PR #39197 by..
- Voice-call/OpenAI Realtime STT config defaults: honor explicit `vadThreshold: 0` and `silenceDurationMs: 0` instead of silently replacing them with defaults. Landed from contributor PR #39196 by..
- Voice-call/OpenAI TTS speed config: honor explicit `speed: 0` instead of silently replacing it with the default speed. Landed from contributor PR #39318 by..
- launchd/runtime PID parsing: reject `pid <= 0` from `launchctl print` so the daemon state parser no longer treats kernel/non-running sentinel values as real process IDs. Landed from contributor PR #39281 by..
- Cron/file permission hardening: enforce owner-only (`0600`) cron store/backup/run-log files and harden cron store + run-log directories to `0700`, including pre-existing directories from older installs..
- Gateway/remote WS break-glass hostname support: honor `KIBO_ALLOW_INSECURE_PRIVATE_WS=1` for `ws://` hostname URLs (not only private IP literals) across onboarding validation and runtime gateway connection checks, while still rejecting public IP literals and non-unicast IPv6 endpoints..
- Routing/binding lookup scalability: pre-index route bindings by channel/account and avoid full binding-list rescans on channel-account cache rollover, preventing multi-second `resolveAgentRoute` stalls in large binding configurations..
- Browser/session cleanup: track browser tabs opened by session-scoped browser tool runs and close tracked tabs during `sessions.reset`/`sessions.delete` runtime cleanup, preventing orphaned tabs and unbounded browser memory growth after session teardown..
- Plugin/hook install rollback hardening: stage installs under the canonical install base, validate and run dependency installs before publish, and restore updates by rename instead of deleting the target path, reducing partial-replace and symlink-rebind risk during install failures.
- Slack/local file upload allowlist parity: propagate `mediaLocalRoots` through the Slack send action pipeline so workspace-rooted attachments pass `assertLocalMediaAllowed` checks while non-allowlisted paths remain blocked. (synthesis: #36656; overlap considered from #36516, #36496, #36493, #36484, #32648, #30888).
- Agents/compaction safeguard pre-check: skip embedded compaction before entering the Pi SDK when a session has no real conversation messages, avoiding unnecessary LLM API calls on idle sessions..
- Config/schema cache key stability: build merged schema cache keys with incremental hashing to avoid large single-string serialization and prevent `RangeError: Invalid string length` on high-cardinality plugin/channel metadata..
- iMessage/cron completion announces: strip leaked inline reply tags (for example `[[reply_to:6100]]`) from user-visible completion text so announcement deliveries do not expose threading metadata..
- Cron/manual run enqueue flow: queue `cron.run` requests behind the cron execution lane, return immediate `{ ok: true, enqueued: true, runId }` acknowledgements, preserve `{ ok: true, ran: false, reason }` skip responses for already-running and not-due jobs, and document the asynchronous completion flow.
- Control UI/iMessage duplicate reply routing: keep internal webchat turns on dispatcher delivery (instead of origin-channel reroute) so Control UI chats do not duplicate replies into iMessage, while preserving webchat-provider relayed routing for external surfaces. Fixes #33483..
- Sessions/daily reset transcript archival: archive prior transcript files during stale-session scheduled/daily resets by capturing the previous session entry before rollover, preventing orphaned transcript files on disk..
- Feishu/group slash command detection: normalize group mention wrappers before command-authorization probing so mention-prefixed commands (for example `@Bot/model` and `@Bot /reset`) are recognized as gateway commands instead of being forwarded to the agent..
- Control UI/auth token separation: keep the shared gateway token in browser auth validation while reserving cached device tokens for signed device payloads, preventing false `device token mismatch` disconnects after restart/rotation. Landed from contributor PR #37382 by..
- Gateway/browser auth reconnect hardening: stop counting missing token/password submissions as auth rate-limit failures, and stop auto-reconnecting Control UI clients on non-recoverable auth errors so misconfigured browser tabs no longer lock out healthy sessions. Landed from contributor PR #38725 by..
- Gateway/service token drift repair: stop persisting shared auth tokens into installed gateway service units, flag stale embedded service tokens for reinstall, and treat tokenless service env as canonical so token rotation/reboot flows stay aligned with config/env resolution. Landed from contributor PR #28428 by..
- Control UI/agents-page selection: keep the edited agent selected after saving agent config changes and reloading the agents list, so `/agents` no longer snaps back to the default agent. Landed from contributor PR #39301 by..
- Gateway/auth follow-up hardening: preserve systemd `EnvironmentFile=` precedence/source provenance in daemon audits and doctor repairs, block shared-password override flows from piggybacking cached device tokens, and fail closed when config-first gateway SecretRefs cannot resolve. Follow-up to #39241.
- Agents/context pruning: guard assistant thinking/text char estimation against malformed blocks (missing `thinking`/`text` strings or null entries) so pruning no longer crashes with malformed provider content. (kibo#35146).
- Agents/transcript policy: set `preserveSignatures` to Anthropic-only handling in `resolveTranscriptPolicy` so Anthropic thinking signatures are preserved while non-Anthropic providers remain unchanged..
- Agents/schema cleaning: detect Venice + Grok model IDs as xAI-proxied targets so unsupported JSON Schema keywords are stripped before requests, preventing Venice/Grok `Invalid arguments` failures. (kibo#35355).
- Skills/native command deduplication: centralize skill command dedupe by canonical `skillName` in `listSkillCommandsForAgents` so duplicate suffixed variants (for example `_2`) are no longer surfaced across interfaces outside Discord..
- Agents/xAI tool-call argument decoding: decode HTML-entity encoded xAI/Grok tool-call argument values (`&amp;`, `&quot;`, `&lt;`, `&gt;`, numeric entities) before tool execution so commands with shell operators and quotes no longer fail with parse errors..
- Linux/WSL2 daemon install hardening: add regression coverage for WSL environment detection, WSL-specific systemd guidance, and `systemctl --user is-enabled` failure paths so WSL2/headless onboarding keeps treating bus-unavailable probes as non-fatal while preserving real permission errors. Related: #36495..
- Linux/systemd status and degraded-session handling: treat degraded-but-reachable `systemctl --user status` results as available, preserve early errors for truly unavailable user-bus cases, and report externally managed running services as running instead of `not installed`..
- Agents/thinking-tag promotion hardening: guard `promoteThinkingTagsToBlocks` against malformed assistant content entries (`null`/`undefined`) before `block.type` reads so malformed provider payloads no longer crash session processing while preserving pass-through behavior..
- Gateway/Control UI version reporting: align runtime and browser client version metadata to avoid `dev` placeholders, wait for bootstrap version before first UI websocket connect, and only forward bootstrap `serverVersion` to same-origin gateway targets to prevent cross-target version leakage. (from #35230, #30928, #33928), and.
- Control UI/markdown parser crash fallback: catch `marked.parse()` failures and fall back to escaped plain-text `<pre>` rendering so malformed recursive markdown no longer crashes Control UI session rendering on load..
- Control UI/markdown fallback regression coverage: add explicit regression assertions for parser-error fallback behavior so malformed markdown no longer risks reintroducing hard-crash rendering paths in future markdown/parser upgrades..
- Web UI/config form: treat `additionalProperties: true` object schemas as editable map entries instead of unsupported fields so Accounts-style maps stay editable in form mode. (#35380, supersedes #32072) and.
- Feishu/streaming card delivery synthesis: unify snapshot and delta streaming merge semantics, apply overlap-aware final merge, suppress duplicate final text delivery (including text+media final packets), prefer topic-thread `message.reply` routing when a reply target exists, and tune card print cadence to avoid duplicate incremental rendering. (from #33245, #32896, #33840), and.
- macOS/tray menu: keep injected sessions and device rows below the controls section so toggles and action buttons stay visible even when many sessions are active..
- Feishu/group mention detection: carry startup-probed bot display names through monitor dispatch so `requireMention` checks compare against current bot identity instead of stale config names, fixing missed `@bot` handling in groups while preserving multi-bot false-positive guards. (#36317, #34271).
- Security/dependency audit: patch transitive Hono vulnerabilities by pinning `hono` to `4.12.5` and `@hono/node-server` to `1.19.10` in production resolution paths..
- Security/dependency audit: bump `tar` to `7.5.10` (from `7.5.9`) to address the high-severity hardlink path traversal advisory (`GHSA-qffp-2rhf-9h96`)..
- Cron/announce delivery robustness: bypass pending-descendant announce guards for cron completion sends, ensure named-agent announce routes have outbound session entries, and fall back to direct delivery only when an announce send was actually attempted and failed. (from #35185, #32443, #34987), and.
- Cron/announce best-effort fallback: run direct outbound fallback after attempted announce failures even when delivery is configured as best-effort, so Telegram cron sends are not left as attempted-but-undelivered after `cron announce delivery failed` warnings.
- Auto-reply/system events: restore runtime system events to the message timeline (`System:` lines), preserve think-hint parsing with prepended events, and carry events into deferred followup/collect/steer-backlog prompts to keep cache behavior stable without dropping queued metadata..
- Security/audit account handling: avoid prototype-chain account IDs in audit validation by using own-property checks for `accounts`..
- Cron/restart catch-up semantics: replay interrupted recurring jobs and missed immediate cron slots on startup without replaying interrupted one-shot jobs, with guarded missed-slot probing to avoid malformed-schedule startup aborts and duplicate-trigger drift after restart. (from #34466, #34896, #34625, #33206), and.
- Venice/provider onboarding hardening: align per-model Venice completion-token limits with discovery metadata, clamp untrusted discovery values to safe bounds, sync the static Venice fallback catalog with current live model metadata, and disable tool wiring for Venice models that do not support function calling so default Venice setups no longer fail with `max_completion_tokens` or unsupported-tools 400s. Fixes #38168. and.
- Agents/session usage tracking: preserve accumulated usage metadata on embedded Pi runner error exits so failed turns still update session `totalTokens` from real usage instead of stale prior values..
- Slack/reaction thread context routing: carry Slack native DM channel IDs through inbound context and threading tool resolution so reaction targets resolve consistently for DM `To=user:*` sessions (including `toolContext.currentChannelId` fallback behavior). (from #34831; overlaps #34440, #34502, #34483, #32754).
- Subagents/announce completion scoping: scope nested direct-child completion aggregation to the current requester run window, harden frozen completion capture for deterministic descendant synthesis, and route completion announce delivery through parent-agent announce turns with provenance-aware internal events..
- Nodes/system.run approval hardening: use explicit argv-mutation signaling when regenerating prepared `rawCommand`, and cover the `system.run.prepare -> system.run` handoff so direct PATH-based `nodes.run` commands no longer fail with `rawCommand does not match command`..
- Models/custom provider headers: propagate `models.providers.<name>.headers` across inline, fallback, and registry-found model resolution so header-authenticated proxies consistently receive configured request headers..
- Ollama/remote provider auth fallback: synthesize a local runtime auth key for explicitly configured `models.providers.ollama` entries that omit `apiKey`, so remote Ollama endpoints run without requiring manual dummy-key setup while preserving env/profile/config key precedence and missing-config failures..
- Ollama/custom provider headers: forward resolved model headers into native Ollama stream requests so header-authenticated Ollama proxies receive configured request headers..
- Ollama/compaction and summarization: register custom `api: "ollama"` handling for compaction, branch-style internal summarization, and TTS text summarization on current `main`, so native Ollama models no longer fail with `No API provider registered for api: ollama` outside the main run loop..
- Daemon/systemd install robustness: treat `systemctl --user is-enabled` exit-code-4 `not-found` responses as not-enabled by combining stderr/stdout detail parsing, so Ubuntu fresh installs no longer fail with `systemctl is-enabled unavailable`..
- Slack/system-event session routing: resolve reaction/member/pin/interaction system-event session keys through channel/account bindings (with sender-aware DM routing) so inbound Slack events target the correct agent session in multi-account setups instead of defaulting to `agent:main`. and.
- Slack/native streaming markdown conversion: stop pre-normalizing text passed to Slack native `markdown_text` in streaming start/append/stop paths to prevent Markdown style corruption from double conversion.
- Gateway/HTTP tools invoke media compatibility: preserve raw media payload access for direct `/tools/invoke` clients by allowing media `nodes` invoke commands only in HTTP tool context, while keeping agent-context media invoke blocking to prevent base64 prompt bloat..
- Security/archive ZIP hardening: extract ZIP entries via same-directory temp files plus atomic rename, then re-open and reject post-rename hardlink alias races outside the destination root.
- Agents/Nodes media outputs: add dedicated `photos_latest` action handling, block media-returning `nodes invoke` commands, keep metadata-only `camera.list` invoke allowed, and normalize empty `photos_latest` results to a consistent response shape to prevent base64 context bloat..
- TUI/session-key canonicalization: normalize `kibo tui --session` values to lowercase so uppercase session names no longer drop real-time streaming updates due to gateway/TUI key mismatches. (#33866, #34013).
- iMessage/echo loop hardening: strip leaked assistant-internal scaffolding from outbound iMessage replies, drop reflected assistant-content messages before they re-enter inbound processing, extend echo-cache text retention for delayed reflections, and suppress repeated loop traffic before it amplifies into queue overflow..
- Skills/workspace boundary hardening: reject workspace and extra-dir skill roots or `SKILL.md` files whose realpath escapes the configured source root, and skip syncing those escaped skills into sandbox workspaces.
- Outbound/send config threading: pass resolved SecretRef config through outbound adapters and helper send paths so send flows do not reload unresolved runtime config..
- gateway: harden shared auth resolution across systemd, discord, and node host.
- Secrets/models.json persistence hardening: keep SecretRef-managed api keys + headers from persisting in generated models.json, expand audit/apply coverage, and harden marker handling/serialization..
- Sessions/subagent attachments: remove `attachments[].content.maxLength` from `sessions_spawn` schema to avoid llama.cpp GBNF repetition overflow, and preflight UTF-8 byte size before buffer allocation while keeping runtime file-size enforcement unchanged..
- Runtime/tool-state stability: recover from dangling Anthropic `tool_use` after compaction, serialize long-running Discord handler runs without blocking new inbound events, and prevent stale busy snapshots from suppressing stuck-channel recovery. (from #33630, #33583) and.
- ACP/Discord startup hardening: clean up stuck ACP worker children on gateway restart, unbind stale ACP thread bindings during Discord startup reconciliation, and add per-thread listener watchdog timeouts so wedged turns cannot block later messages..
- Extensions/media local-root propagation: consistently forward `mediaLocalRoots` through extension `sendMedia` adapters (Google Chat, Slack, iMessage, Signal, WhatsApp), preserving non-local media behavior while restoring local attachment resolution from configured roots. Synthesis of #33581, #33545, #33540, #33536, #33528..
- Gateway/plugin HTTP auth hardening: require gateway auth when any overlapping matched route needs it, block mixed-auth fallthrough at dispatch, and reject mixed-auth exact/prefix route overlaps during plugin registration.
- Feishu/video media send contract: keep mp4-like outbound payloads on `msg_type: "media"` (including reply and reply-in-thread paths) so videos render as media instead of degrading to file-link behavior, while preserving existing non-video file subtype handling. (from #33720, #33808, #33678), and.
- Gateway/security default response headers: add `Permissions-Policy: camera=(), microphone=(), geolocation=()` to baseline gateway HTTP security headers for all responses..
- Plugins/startup loading: lazily initialize plugin runtime, split startup-critical plugin SDK imports into `kibo/plugin-sdk/core` and `kibo/plugin-sdk/telegram`, and preserve `api.runtime` reflection semantics for plugin compatibility..
- Plugins/startup performance: reduce bursty plugin discovery/manifest overhead with short in-process caches, skip importing bundled memory plugins that are disabled by slot selection, and speed legacy root `kibo/plugin-sdk` compatibility via runtime root-alias routing while preserving backward compatibility..
- Build/lazy runtime boundaries: replace ineffective dynamic import sites with dedicated lazy runtime boundaries across Slack slash handling, Telegram audit, CLI send deps, memory fallback, and outbound delivery paths while preserving behavior..
- Gateway/password CLI hardening: add `kibo gateway run --password-file`, warn when inline `--password` is used because it can leak via process listings, and document env/file-backed password input as the preferred startup path. Fixes #27948. and.
- Config/heartbeat legacy-path handling: auto-migrate top-level `heartbeat` into `agents.defaults.heartbeat` (with merge semantics that preserve explicit defaults), and keep startup failures on non-migratable legacy entries in the detailed invalid-config path instead of generic migration-failed errors..
- Plugins/SDK subpath parity: expand plugin SDK subpaths across bundled channels/extensions (Discord, Slack, Signal, iMessage, WhatsApp, LINE, and bundled companion plugins), with build/export/type/runtime wiring so scoped imports resolve consistently in source and dist while preserving compatibility..
- Google/Gemini Flash model selection: switch built-in `gemini-flash` defaults and docs/examples from the nonexistent `google/gemini-3.1-flash-preview` ID to the working `google/gemini-3-flash-preview`, while normalizing legacy Kibo config that still uses the old Flash 3.1 alias.
- Plugins/bundled scoped-import migration: migrate bundled plugins from monolithic `kibo/plugin-sdk` imports to scoped subpaths (or `kibo/plugin-sdk/core`) across registration and startup-sensitive runtime files, add CI/release guardrails to prevent regressions, and keep root `kibo/plugin-sdk` support for external/community plugins..
- Routing/session duplicate suppression synthesis: align shared session delivery-context inheritance, channel-paired route-field merges, and reply-surface target matching so dmScope=main turns avoid cross-surface duplicate replies while thread-aware forwarding keeps intended routing semantics. (from #33629, #26889, #17337, #33250), and.
- Routing/legacy session route inheritance: preserve external route metadata inheritance for legacy channel session keys (`agent:<agent>:<channel>:<peer>` and `...:thread:<id>`) so `chat.send` does not incorrectly fall back to webchat when valid delivery context exists. Follow-up to #33786.
- Routing/legacy route guard tightening: require legacy session-key channel hints to match the saved delivery channel before inheriting external routing metadata, preventing custom namespaced keys like `agent:<agent>:work:<ticket>` from inheriting stale non-webchat routes.
- Gateway/internal client routing continuity: prevent webchat/TUI/UI turns from inheriting stale external reply routes by requiring explicit `deliver: true` for external delivery, keeping main-session external inheritance scoped to non-Webchat/UI clients, and honoring configured `session.mainKey` when identifying main-session continuity. (from #35321, #34635, #35356) and.
- Security/auth labels: remove token and API-key snippets from user-facing auth status labels so `/status` and `/models` do not expose credential fragments..
- Models/MiniMax portal vision routing: add `MiniMax-VL-01` to the `minimax-portal` provider, route portal image understanding through the MiniMax VLM endpoint, and align media auto-selection plus Telegram sticker description with the shared portal image provider path..
- Auth/credential semantics: align profile eligibility + probe diagnostics with SecretRef/expiry rules and harden browser download atomic writes..
- Security/audit denyCommands guidance: suggest likely exact node command IDs for unknown `gateway.nodes.denyCommands` entries so ineffective denylist entries are easier to correct..
- Agents/overload failover handling: classify overloaded provider failures separately from rate limits/status timeouts, add short overload backoff before retry/failover, record overloaded prompt/assistant failures as transient auth-profile cooldowns (with probeable same-provider fallback) instead of treating them like persistent auth/billing failures, and keep one-shot cron retry classification aligned so overloaded fallback summaries still count as transient retries.
- Docs/security hardening guidance: document Docker `DOCKER-USER` + UFW policy and add cross-linking from Docker install docs for VPS/public-host setups..
- Docs/security threat-model links: replace relative `.md` links with Mintlify-compatible root-relative routes in security docs to prevent broken internal navigation..
- Plugins/Update integrity drift: avoid false integrity drift prompts when updating npm-installed plugins from unpinned specs, while keeping drift checks for exact pinned versions..
- iOS/Voice timing safety: guard system speech start/finish callbacks to the active utterance to avoid misattributed start events during rapid stop/restart cycles.; original implementation direction by.
- Gateway/chat.send command scopes: require `operator.admin` for persistent `/config set|unset` writes routed through gateway chat clients while keeping `/config show` available to normal write-scoped operator clients, preserving messaging-channel config command behavior without widening RPC write scope into admin config mutation. for reporting.
- iOS/Talk incremental speech pacing: allow long punctuation-free assistant chunks to start speaking at safe whitespace boundaries so voice responses begin sooner instead of waiting for terminal punctuation.; original implementation by.
- iOS/Watch reply reliability: make watch session activation waiters robust under concurrent requests so status/send calls no longer hang intermittently, and align delegate callbacks with Swift 6 actor safety.; original implementation by.
- Docs/tool-loop detection config keys: align `docs/tools/loop-detection.md` examples and field names with the current `tools.loopDetection` schema to prevent copy-paste validation failures from outdated keys..
- Gateway/session agent discovery: include disk-scanned agent IDs in `listConfiguredAgentIds` even when `agents.list` is configured, so disk-only/ACP agent sessions remain visible in gateway session aggregation and listings..
- Discord/inbound debouncer: skip bot-own MESSAGE_CREATE events before they reach the debounce queue to avoid self-triggered slowdowns in busy servers..
- Discord/Agent-scoped media roots: pass `mediaLocalRoots` through Discord monitor reply delivery (message + component interaction paths) so local media attachments honor per-agent workspace roots instead of falling back to default global roots..
- Discord/slash command handling: intercept text-based slash commands in channels, register plugin commands as native, and send fallback acknowledgments for empty slash runs so interactions do not hang..
- Discord/thread session lifecycle: reset thread-scoped sessions when a thread is archived so reopening a thread starts fresh without deleting transcript history..
- Discord/presence defaults: send an online presence update on ready when no custom presence is configured so bots no longer appear offline by default..
- Discord/typing cleanup: stop typing indicators after silent/NO_REPLY runs by marking the run complete before dispatch idle cleanup..
- ACP/sandbox spawn parity: block `/acp spawn` from sandboxed requester sessions with the same host-runtime guard already enforced for `sessions_spawn({ runtime: "acp" })`, preserving non-sandbox ACP flows while closing the command-path policy gap..
- Discord/config SecretRef typing: align Discord account token config typing with SecretInput so SecretRef tokens typecheck..
- Discord/voice messages: request upload slots with JSON fetch calls so voice message uploads no longer fail with content-type errors..
- Discord/voice decoder fallback: drop the native Opus dependency and use opusscript for voice decoding to avoid native-opus installs..
- Discord/auto presence health signal: add runtime availability-driven presence updates plus connected-state reporting to improve health monitoring and operator visibility..
- HEIC image inputs: accept HEIC/HEIF `input_image` sources in Gateway HTTP APIs, normalize them to JPEG before provider delivery, and document the expanded default MIME allowlist..
- Gateway/HEIC input follow-up: keep non-HEIC `input_image` MIME handling unchanged, make HEIC tests hermetic, and enforce chat-completions `maxTotalImageBytes` against post-normalization image payload size..
- Telegram/draft-stream boundary stability: materialize DM draft previews at assistant-message/tool boundaries, serialize lane-boundary callbacks before final delivery, and scope preview cleanup to the active preview so multi-step Telegram streams no longer lose, overwrite, or leave stale preview bubbles..
- Telegram/DM draft finalization reliability: require verified final-text draft emission before treating preview finalization as delivered, and fall back to normal payload send when final draft delivery is not confirmed (preventing missing final responses and preserving media/button delivery)..
- Telegram/DM draft final delivery: materialize text-only `sendMessageDraft` previews into one permanent final message and skip duplicate final payload sends, while preserving fallback behavior when materialization fails..
- Telegram/DM draft duplicate display: clear stale DM draft previews after materializing the real final message, including threadless fallback when DM topic lookup fails, so partial streaming no longer briefly shows duplicate replies..
- Telegram/draft preview boundary + silent-token reliability: stabilize answer-lane message boundaries across late-partial/message-start races, preserve/reset finalized preview state at the correct boundaries, and suppress `NO_REPLY` lead-fragment leaks without broad heartbeat-prefix false positives..
- Telegram/native commands `commands.allowFrom` precedence: make native Telegram commands honor `commands.allowFrom` as the command-specific authorization source, including group chats, instead of falling back to channel sender allowlists. and.
- Telegram/`groupAllowFrom` sender-ID validation: restore sender-only runtime validation so negative chat/group IDs remain invalid entries instead of appearing accepted while still being unable to authorize group access. and.
- Telegram/native group command auth: authorize native commands in groups and forum topics against `groupAllowFrom` and per-group/topic sender overrides, while keeping auth rejection replies in the originating topic thread..
- Telegram/named-account DMs: restore non-default-account DM routing when a named Telegram account falls back to the default agent by keeping groups fail-closed but deriving a per-account session key for DMs, including identity-link canonicalization and regression coverage for account isolation. (from #32426; fixes #32351).
- Discord/audit wildcard warnings: ignore "\*" wildcard keys when counting unresolved guild channels so doctor/status no longer warns on allow-all configs..
- Discord/channel resolution: default bare numeric recipients to channels, harden allowlist numeric ID handling with safe fallbacks, and avoid inbound WS heartbeat stalls..
- Discord/chunk delivery reliability: preserve chunk ordering when using a REST client and retry chunk sends on 429/5xx using account retry settings..
- Discord/mention handling: add id-based mention formatting + cached rewrites, resolve inbound mentions to display names, and add optional ignoreOtherMentions gating (excluding/@here)..
- Discord/media SSRF allowlist: allow Discord CDN hostnames (including wildcard domains) in inbound media SSRF policy to prevent proxy/VPN fake-ip blocks..
- Telegram/device pairing notifications: auto-arm one-shot notify on `/pair qr`, auto-ping on new pairing requests, and add manual fallback via `/pair approve latest` if the ping does not arrive..
- Exec heartbeat routing: scope exec-triggered heartbeat wakes to agent session keys so unrelated agents are no longer awakened by exec events, while preserving legacy unscoped behavior for non-canonical session keys.
- macOS/Tailscale remote gateway discovery: add a Tailscale Serve fallback peer probe path (`wss://<peer>.ts.net`) when Bonjour and wide-area DNS-SD discovery return no gateways, and refresh both discovery paths from macOS onboarding..
- iOS/Gateway keychain hardening: move gateway metadata and TLS fingerprints to device keychain storage with safer migration behavior and rollback-safe writes to reduce credential loss risk during upgrades..
- iOS/Concurrency stability: replace risky shared-state access in camera and gateway connection paths with lock-protected access patterns to reduce crash risk under load..
- iOS/Security guardrails: limit production API-key sourcing to app config and make deep-link confirmation prompts safer by coalescing queued requests instead of silently dropping them..
- iOS/TTS playback fallback: keep voice playback resilient by switching from PCM to MP3 when provider format support is unavailable, while avoiding sticky fallback on generic local playback errors..
- Plugin outbound/text-only adapter compatibility: allow direct-delivery channel plugins that only implement `sendText` (without `sendMedia`) to remain outbound-capable, gracefully fall back to text delivery for media payloads when `sendMedia` is absent, and fail explicitly for media-only payloads with no text fallback..
- Telegram/multi-account default routing clarity: warn only for ambiguous (2+) account setups without an explicit default, add `kibo doctor` warnings for missing/invalid multi-account defaults across channels, and document explicit-default guidance for channel routing and Telegram config..
- Telegram/plugin outbound hook parity: run `message_sending` + `message_sent` in Telegram reply delivery, include reply-path hook metadata (`mediaUrls`, `threadId`), and report `message_sent.success=false` when hooks blank text and no outbound message is delivered..
- CLI/Coding-agent reliability: switch default `claude-cli` non-interactive args to `--permission-mode bypassPermissions`, auto-normalize legacy `--dangerously-skip-permissions` backend overrides to the modern permission-mode form, align coding-agent + live-test docs with the non-PTY Claude path, and emit session system-event heartbeat notices when CLI watchdog no-output timeouts terminate runs. (#28610, #31149, #34055). and.
- Gateway/OpenAI chat completions: parse active-turn `image_url` content parts (including parameterized data URIs and guarded URL sources), forward them as multimodal `images`, accept image-only user turns, enforce per-request image-part/byte budgets, default URL-based image fetches to disabled unless explicitly enabled by config, and redact image base64 data in cache-trace/provider payload diagnostics.
- ACP/ACPX session bootstrap: retry with `sessions new` when `sessions ensure` returns no session identifiers so ACP spawns avoid `NO_SESSION`/`ACP_TURN_FAILED` failures on affected agents. (#28786, #31338, #34055). and.
- ACP/sessions_spawn parent stream visibility: add `streamTo: "parent"` for `runtime: "acp"` to forward initial child-run progress/no-output/completion updates back into the requester session as system events (instead of direct child delivery), and emit a tail-able session-scoped relay log (`<sessionId>.acp-stream.jsonl`, returned as `streamLogPath` when available), improving orchestrator visibility for blocked or long-running harness turns. (#34310, #29909; reopened from #34055)..
- Agents/bootstrap truncation warning handling: unify bootstrap budget/truncation analysis across embedded + CLI runtime, `/context`, and `kibo doctor`; add `agents.defaults.bootstrapPromptTruncationWarning` (`off|once|always`, default `once`) and persist warning-signature metadata so truncation warnings are consistent and deduped across turns..
- Agents/Skills runtime loading: propagate run config into embedded attempt and compaction skill-entry loading so explicitly enabled bundled companion skills are discovered consistently when skill snapshots do not already provide resolved entries..
- Agents/Session startup date grounding: substitute `YYYY-MM-DD` placeholders in startup/post-compaction AGENTS context and append runtime current-time lines for `/new` and `/reset` prompts so daily-memory references resolve correctly..
- Agents/Compaction template heading alignment: update AGENTS template section names to `Session Startup`/`Red Lines` and keep legacy `Every Session`/`Safety` fallback extraction so post-compaction context remains intact across template versions..
- Agents/Compaction continuity: expand staged-summary merge instructions to preserve active task status, batch progress, latest user request, and follow-up commitments so compaction handoffs retain in-flight work context..
- Agents/Compaction safeguard structure hardening: require exact fallback summary headings, sanitize untrusted compaction instruction text before prompt embedding, and keep structured sections when preserving all turns..
- Gateway/status self version reporting: make Gateway self version in `kibo status` prefer runtime `VERSION` (while preserving explicit `KIBO_VERSION` override), preventing stale post-upgrade app version output..
- Memory/QMD index isolation: set `QMD_CONFIG_DIR` alongside `XDG_CONFIG_HOME` so QMD config state stays per-agent despite upstream XDG handling bugs, preventing cross-agent collection indexing and excess disk/CPU usage..
- Memory/QMD collection safety: stop destructive collection rebinds when QMD `collection list` only reports names without path metadata, preventing `memory search` from dropping existing collections if re-add fails..
- Memory/QMD duplicate-document recovery: detect `UNIQUE constraint failed: documents.collection, documents.path` update failures, rebuild managed collections once, and retry update so periodic QMD syncs recover instead of failing every run; includes regression coverage to avoid over-matching unrelated unique constraints..
- Memory/local embedding initialization hardening: add regression coverage for transient initialization retry and mixed `embedQuery` + `embedBatch` concurrent startup to lock single-flight initialization behavior..
- CLI/Coding-agent reliability: switch default `claude-cli` non-interactive args to `--permission-mode bypassPermissions`, auto-normalize legacy `--dangerously-skip-permissions` backend overrides to the modern permission-mode form, align coding-agent + live-test docs with the non-PTY Claude path, and emit session system-event heartbeat notices when CLI watchdog no-output timeouts terminate runs. Related to #28261. Landed from contributor PRs #28610 and #31149. and.
- ACP/ACPX session bootstrap: retry with `sessions new` when `sessions ensure` returns no session identifiers so ACP spawns avoid `NO_SESSION`/`ACP_TURN_FAILED` failures on affected agents. Related to #28786. Landed from contributor PR #31338. and.
- LINE/auth boundary hardening synthesis: enforce strict LINE webhook authn/z boundary semantics across pairing-store account scoping, DM/group allowlist separation, fail-closed webhook auth/runtime behavior, and replay/duplication controls (including in-flight replay reservation and post-success dedupe marking). (from #26701, #26683, #25978, #17593, #16619, #31990, #26047, #30584, #18777), and.
- LINE/media download synthesis: fix file-media download handling and M4A audio classification across overlapping LINE regressions. (from #26386, #27761, #27787, #29509, #29755, #29776, #29785, #32240), and.
- LINE/context and routing synthesis: fix group/room peer routing and command-authorization context propagation, and keep processing later events in mixed-success webhook batches. (from #21955, #24475, #27035, #28286), and.
- LINE/status/config/webhook synthesis: fix status false positives from snapshot/config state and accept LINE webhook HEAD probes for compatibility. (from #10487, #25726, #27537, #27908, #31387), and.
- LINE cleanup/test follow-ups: fold cleanup/test learnings into the synthesis review path while keeping runtime changes focused on regression fixes. (from #17630, #17289) and.
- Mattermost/interactive buttons: add interactive button send/callback support with directory-based channel/user target resolution, and harden callbacks via account-scoped HMAC verification plus sender-scoped DM routing..
- Feishu/groupPolicy legacy alias compatibility: treat legacy `groupPolicy: "allowall"` as `open` in both schema parsing and runtime policy checks so intended open-group configs no longer silently drop group messages when `groupAllowFrom` is empty. (from #36358).
- Mattermost/plugin SDK import policy: replace remaining monolithic `kibo/plugin-sdk` imports in Mattermost mention-gating paths/tests with scoped subpaths (`kibo/plugin-sdk/compat` and `kibo/plugin-sdk/mattermost`) so `pnpm check` passes `lint:plugins:no-monolithic-plugin-sdk-entry-imports` on baseline..
- Telegram/polls: add Telegram poll action support to channel action discovery and tool/CLI poll flows, with multi-account discoverability gated to accounts that can actually execute polls (`sendMessage` + `poll`)..
- Agents/failover cooldown classification: stop treating generic `cooling down` text as provider `rate_limit` so healthy models no longer show false global cooldown/rate-limit warnings while explicit `model_cooldown` markers still trigger failover..
- Agents/failover service-unavailable handling: stop treating bare proxy/CDN `service unavailable` errors as provider overload while keeping them retryable via the timeout/failover path, so transient outages no longer show false rate-limit warnings or block fallback..
- Plugins/HTTP route migration diagnostics: rewrite legacy `api.registerHttpHandler(...)` loader failures into actionable migration guidance so doctor/plugin diagnostics point operators to `api.registerHttpRoute(...)` or `registerPluginHttpRoute(...)`.
- Doctor/Heartbeat upgrade diagnostics: warn when heartbeat delivery is configured with an implicit `directPolicy` so upgrades pin direct/DM behavior explicitly instead of relying on the current default..
- Agents/current-time UTC anchor: append a machine-readable UTC suffix alongside local `Current time:` lines in shared cron-style prompt contexts so agents can compare UTC-stamped workspace timestamps without doing timezone math..
- Ollama/local model handling: preserve explicit lower `contextWindow` / `maxTokens` overrides during merge refresh, and keep native Ollama streamed replies from surfacing fallback `thinking` / `reasoning` text once real content starts streaming..
- TUI/webchat command-owner scope alignment: treat internal-channel gateway sessions with `operator.admin` as owner-authorized in command auth, restoring cron/gateway/connector tool access for affected TUI/webchat sessions while keeping external channels on identity-based owner checks. (from #35666, #35673, #35704), and.
- Discord/inbound timeout isolation: separate inbound worker timeout tracking from listener timeout budgets so queued Discord replies are no longer dropped when listener watchdog windows expire mid-run..
- Memory/doctor SecretRef handling: treat SecretRef-backed memory-search API keys as configured, and fail embedding setup with explicit unresolved-secret errors instead of crashing..
- Memory/flush default prompt: ban timestamped variant filenames during default memory flush runs so durable notes stay in the canonical daily `memory/YYYY-MM-DD.md` file..
- Agents/reply delivery timing: flush embedded Pi block replies before waiting on compaction retries so already-generated assistant replies reach channels before compaction wait completes..
- Agents/gateway config guidance: stop exposing `config.schema` through the agent `gateway` tool, remove prompt/docs guidance that told agents to call it, and keep agents on `config.get` plus `config.patch`/`config.apply` for config changes..
- Provider/KiloCode: Keep duplicate models after malformed discovery rows, and strip legacy `reasoning_effort` when proxy reasoning injection is skipped. and.
- Agents/failover: classify periodic provider limit exhaustion text (for example `Weekly/Monthly Limit Exhausted`) as `rate_limit` while keeping explicit `402 Payment Required` variants in billing, so failover continues without misclassifying billing-wrapped quota errors..
- Mattermost/interactive button callbacks: allow external callback base URLs and stop requiring loopback-origin requests so button clicks work when Mattermost reaches the gateway over Tailscale, LAN, or a reverse proxy..
- Gateway/chat.send route inheritance: keep explicit external delivery for channel-scoped sessions while preventing shared-main and other channel-agnostic webchat sessions from inheriting stale external routes, so Control UI replies stay on webchat without breaking selected channel-target sessions..
- Telegram/Discord media upload caps: make outbound uploads honor channel `mediaMaxMb` config, raise Telegram's default media cap to 100MB, and remove MIME fallback limits that kept some Telegram uploads at 16MB..
- Skills/nano-banana-pro resolution override: respect explicit `--resolution` values during image editing and only auto-detect output size from input images when the flag is omitted. and.
- Skills/openai-image-gen CLI validation: validate `--background` and `--style` inputs early, normalize supported values, and warn when those flags are ignored for incompatible models. and.
- Skills/openai-image-gen output formats: validate `--output-format` values early, normalize aliases like `jpg -> jpeg`, and warn when the flag is ignored for incompatible models. and.
- ACP/skill env isolation: strip skill-injected API keys from ACP harness child-process environments so tools like Codex CLI keep their own auth flow instead of inheriting billed provider keys from active skills. and.
- WhatsApp media upload caps: make outbound media sends and auto-replies honor `channels.whatsapp.mediaMaxMb` with per-account overrides so inbound and outbound limits use the same channel config..
- Windows/Plugin install: when Kibo runs on Windows via Bun and `npm-cli.js` is not colocated with the runtime binary, fall back to `npm.cmd`/`npx.cmd` through the existing `cmd.exe` wrapper so `kibo plugins install` no longer fails with `spawn EINVAL`..
- Telegram/send retry classification: retry grammY `Network request ... failed after N attempts` envelopes in send flows without reclassifying plain `Network request ... failed!` wrappers as transient, restoring the intended retry path while keeping broad send-context message matching tight..
- Gateway/probes: keep `/health`, `/healthz`, `/ready`, and `/readyz` reachable when the Control UI is mounted at `/`, preserve plugin-owned route precedence on those paths, and make `/ready` and `/readyz` report channel-backed readiness with startup grace plus `503` on disconnected managed channels, while `/health` and `/healthz` stay shallow liveness probes., and.
- Feishu/media downloads: drop invalid timeout fields from SDK method calls now that client-level `httpTimeoutMs` applies to requests. and.
- PI embedded runner/Feishu docs: propagate sender identity into embedded attempts so Feishu doc auto-grant restores requester access for embedded-runner executions..
- Agents/usage normalization: normalize missing or partial assistant usage snapshots before compaction accounting so `kibo agent --json` no longer crashes when provider payloads omit `totalTokens` or related usage fields..
- Venice/default model refresh: switch the built-in Venice default to `kimi-k2-5`, update onboarding aliasing, and refresh Venice provider docs/recommendations to match the current private and anonymized catalog. (from #12964) Fixes #20156. and.
- Agents/skill API write pacing: add a global prompt guardrail that treats skill-driven external API writes as rate-limited by default, so runners prefer batched writes, avoid tight request loops, and respect `429`/`Retry-After`..
- Google Chat/multi-account webhook auth fallback: when `channels.googlechat.accounts.default` carries shared webhook audience/path settings (for example after config normalization), inherit those defaults for named accounts while preserving top-level and per-account overrides, so inbound webhook verification no longer fails silently for named accounts missing duplicated audience fields. Fixes #38369.
- Models/tool probing: raise the tool-capability probe budget from 32 to 256 tokens so reasoning models that spend tokens on thinking before returning a required tool call are less likely to be misclassified as not supporting tools..
- Gateway/transient network classification: treat wrapped `...: fetch failed` transport messages as transient while avoiding broad matches like `Web fetch failed (404): ...`, preventing Discord reconnect wrappers from crashing the gateway without suppressing non-network tool failures..
- ACP/console silent reply suppression: filter ACP `NO_REPLY` lead fragments and silent-only finals before `kibo agent` logging/delivery so console-backed ACP sessions no longer leak `NO`/`NO_REPLY` placeholders..
- Feishu/reply delivery reliability: disable block streaming in Feishu reply options so plain-text auto-render replies are no longer silently dropped before final delivery..
- Agents/reply MEDIA delivery: normalize local assistant `MEDIA:` paths before block/final delivery, keep media dedupe aligned with message-tool sends, and contain malformed media normalization failures so generated files send reliably instead of falling back to empty responses..
- Sessions/bootstrap cache rollover invalidation: clear cached workspace bootstrap snapshots whenever an existing `sessionKey` rolls to a new `sessionId` across auto-reply, command, and isolated cron session resolvers, so `AGENTS.md`/`MEMORY.md`/`USER.md` updates are reloaded after daily, idle, or forced session resets instead of staying stale until gateway restart..
- Gateway/Telegram polling health monitor: skip stale-socket restarts for Telegram long-polling channels and thread channel identity through shared health evaluation so polling connections are not restarted on the WebSocket stale-socket heuristic. and.
- Daemon/systemd fresh-install probe: check for Kibo's managed user unit before running `systemctl --user is-enabled`, so first-time Linux installs no longer fail on generic missing-unit probe errors..
- Gateway/container lifecycle: allow `kibo gateway stop` to SIGTERM unmanaged gateway listeners and `kibo gateway restart` to SIGUSR1 a single unmanaged listener when no service manager is installed, so container and supervisor-based deployments are no longer blocked by `service disabled` no-op responses. Fixes #36137..
- Gateway/Windows restart supervision: relaunch task-managed gateways through Scheduled Task with quoted helper-script command paths, distinguish restart-capable supervisors per platform, and stop orphaned Windows gateway children during self-restart..
- Telegram/native topic command routing: resolve forum-topic native commands through the same conversation route as inbound messages so topic `agentId` overrides and bound topic sessions target the active session instead of the default topic-parent session..
- Markdown/assistant image hardening: flatten remote markdown images to plain text across the Control UI, exported HTML, and shared Swift chat while keeping inline `data:image/...` markdown renderable, so model output no longer triggers automatic remote image fetches..
- Config/compaction safeguard settings: regression-test `agents.defaults.compaction.recentTurnsPreserve` through `loadConfig()` and cover the new help metadata entry so the exposed preserve knob stays wired through schema validation and config UX..
- iOS/Quick Setup presentation: skip automatic Quick Setup when a gateway is already configured (active connect config, last-known connection, preferred gateway, or manual host), so reconnecting installs no longer get prompted to connect again..
- CLI/Docs memory help accuracy: clarify `kibo memory status --deep` behavior and align memory command examples/docs with the current search options. and.
- Auto-reply/allowlist store account scoping: keep `/allowlist ... --store` writes scoped to the selected account and clear legacy unscoped entries when removing default-account store access, preventing cross-account default allowlist bleed-through from legacy pairing-store reads. for reporting and for the fix.
- Security/Nostr: harden profile mutation/import loopback guards by failing closed on non-loopback forwarded client headers (`x-forwarded-for` / `x-real-ip`) and rejecting `sec-fetch-site: cross-site`; adds regression coverage for proxy-forwarded and browser cross-site mutation attempts.
- CLI/bootstrap Node version hint maintenance: replace hardcoded nvm `22` instructions in `kibo.mjs` with `MIN_NODE_MAJOR` interpolation so future minimum-Node bumps keep startup guidance in sync automatically..
- Discord/native slash command auth: honor `commands.allowFrom.discord` (and `commands.allowFrom["*"]`) in guild slash-command pre-dispatch authorization so allowlisted senders are no longer incorrectly rejected as unauthorized. and.
- Outbound/message target normalization: ignore empty legacy `to`/`channelId` fields when explicit `target` is provided so valid target-based sends no longer fail legacy-param validation; includes regression coverage..
- Models/auth token prompts: guard cancelled manual token prompts so `Symbol(clack:cancel)` values cannot be persisted into auth profiles; adds regression coverage for cancelled `models auth paste-token`..
- Gateway/loopback announce URLs: treat `http://` and `https://` aliases with the same loopback/private-network policy as websocket URLs so loopback cron announce delivery no longer fails secure URL validation..
- Models/default provider fallback: when the hardcoded default provider is removed from `models.providers`, resolve defaults from configured providers instead of reporting stale removed-provider defaults in status output..
- Agents/cache-trace stability: guard stable stringify against circular references in trace payloads so near-limit payloads no longer crash with `Maximum call stack size exceeded`; adds regression coverage..
- Extensions/diffs CI stability: add `headers` to the diffs plugin `localReq` test helper so forwarding-hint checks no longer crash with `req.headers` undefined. (supersedes #39063).
- Agents/compaction thresholding: apply `agents.defaults.contextTokens` cap to the model passed into embedded run and `/compact` session creation so auto-compaction thresholds use the effective context window, not native model max context..
- Models/merge mode provider precedence: when `models.mode: "merge"` is active and config explicitly sets a provider `baseUrl`, keep config as source of truth instead of preserving stale runtime `models.json` `baseUrl` values; includes normalized provider-key coverage..
- UI/Control chat tool streaming: render tool events live in webchat without requiring refresh by enabling `tool-events` capability, fixing stream/event correlation, and resetting/reloading stream state around tool results and terminal events..
- Models/provider apiKey persistence hardening: when a provider `apiKey` value equals a known provider env var value, persist the canonical env var name into `models.json` instead of resolved plaintext secrets..
- Discord/model picker persistence check: add a short post-dispatch settle delay before reading back session model state so picker confirmations stop reporting false mismatch warnings after successful model switches..
- Agents/OpenAI WS compat store flag: omit `store` from `response.create` payloads when model compat sets `supportsStore: false`, preventing strict OpenAI-compatible providers from rejecting websocket requests with unknown-field errors..
- Config/validation log sanitization: sanitize config-validation issue paths/messages before logging so control characters and ANSI escape sequences cannot inject misleading terminal output from crafted config content..
- Agents/compaction counter accuracy: count successful overflow-triggered auto-compactions (`willRetry=true`) in the compaction counter while still excluding aborted/no-result events, so `/status` reflects actual safeguard compaction activity..
- Gateway/chat delta ordering: flush buffered assistant deltas before emitting tool `start` events so pre-tool text is delivered to Control UI before tool cards, avoiding transient text/tool ordering artifacts in streaming..
- Voice-call plugin schema parity: add missing manifest `configSchema` fields (`webhookSecurity`, `streaming.preStartTimeoutMs|maxPendingConnections|maxPendingConnectionsPerIp|maxConnections`, `staleCallReaperSeconds`) so gateway AJV validation accepts already-supported runtime config instead of failing with `additionalProperties` errors..
- Agents/OpenAI WS reconnect retry accounting: avoid double retry scheduling when reconnect failures emit both `error` and `close`, so retry budgets track actual reconnect attempts instead of exhausting early..
- Daemon/Windows schtasks runtime detection: use locale-invariant `Last Run Result` running codes (`0x41301`/`267009`) as the primary running signal so `kibo node status` no longer misreports active tasks as stopped on non-English Windows locales..
- Usage/token count formatting: round near-million token counts to millions (`1.0m`) instead of `1000k`, with explicit boundary coverage for `999_499` and `999_500`..
- Gateway/session bootstrap cache invalidation ordering: clear bootstrap snapshots only after active embedded-run shutdown wait completes, preventing dying runs from repopulating stale cache between `/new`/`sessions.reset` turns..
- Browser/dispatcher error clarity: preserve dispatcher-side failure context in browser fetch errors while still appending operator guidance and explicit no-retry model hints, preventing misleading `"Can't reach service"` wrapping and avoiding LLM retry loops..
- Telegram/polling offset safety: confirm persisted offsets before polling startup while validating stored `lastUpdateId` values as non-negative safe integers (with overflow guards) so malformed offset state cannot cause update skipping/dropping..
- Telegram/status SecretRef read-only resolution: resolve env-backed bot-token SecretRefs in config-only/status inspection while respecting provider source/defaults and env allowlists, so status no longer crashes or reports false-ready tokens for disallowed providers..
- Agents/OpenAI WS max-token zero forwarding: treat `maxTokens: 0` as an explicit value in websocket `response.create` payloads (instead of dropping it as falsy), with regression coverage for zero-token forwarding..
- Podman/.env gateway bind precedence: evaluate `KIBO_GATEWAY_BIND` after sourcing `.env` in `run-kibo-podman.sh` so env-file overrides are honored..
- Models/default alias refresh: bump `gpt` to `openai/gpt-5.4` and Gemini defaults to `gemini-3.1` preview aliases (including normalization/default wiring) to track current model IDs..
- Config/env substitution degraded mode: convert missing `${VAR}` resolution in config reads from hard-fail to warning-backed degraded behavior, while preventing unresolved placeholders from being accepted as gateway credentials..
- Discord inbound listener non-blocking dispatch: make `MESSAGE_CREATE` listener handoff asynchronous (no per-listener queue blocking), so long runs no longer stall unrelated incoming events..
- Daemon/Windows PATH freeze fix: stop persisting install-time `PATH` snapshots into Scheduled Task scripts so runtime tool lookup follows current host PATH updates; also refresh local TUI history on silent local finals..
- Gateway/systemd service restart hardening: clear stale gateway listeners by explicit run-port before service bind, add restart stale-pid port-override support, tune systemd start/stop/exit handling, and disable detached child mode only in service-managed runtime so cgroup stop semantics clean up descendants reliably..
- Discord/plugin native command aliases: let plugins declare provider-specific slash names so native Discord registration can avoid built-in command collisions; the bundled Talk voice plugin now uses `/talkvoice` natively on Discord while keeping text `/voice`.
- Daemon/Windows schtasks status normalization: derive runtime state from locale-neutral numeric `Last Run Result` codes only (without language string matching) and surface unknown when numeric result data is unavailable, preventing locale-specific misclassification drift..
- Telegram/polling conflict recovery: reset the polling `webhookCleared` latch on `getUpdates` 409 conflicts so webhook cleanup re-runs on restart cycles and polling avoids infinite conflict loops..
- Heartbeat/requests-in-flight scheduling: stop advancing `nextDueMs` and avoid immediate `scheduleNext()` timer overrides on requests-in-flight skips, so wake-layer retry cooldowns are honored and heartbeat cadence no longer drifts under sustained contention..
- Memory/SQLite contention resilience: re-apply `PRAGMA busy_timeout` on every sync-store and QMD connection open so process restarts/reopens no longer revert to immediate `SQLITE_BUSY` failures under lock contention..
- Gateway/webchat route safety: block webchat/control-ui clients from inheriting stored external delivery routes on channel-scoped sessions (while preserving route inheritance for UI/TUI clients), preventing cross-channel leakage from scoped chats..
- Telegram error-surface resilience: return a user-visible fallback reply when dispatch/debounce processing fails instead of going silent, while preserving draft-stream cleanup and best-effort thread-scoped fallback delivery..
- Gateway/password auth startup diagnostics: detect unresolved provider-reference objects in `gateway.auth.password` and fail with a specific bootstrap-secrets error message instead of generic misconfiguration output..
- Agents/OpenAI-responses compatibility: strip unsupported `store` payload fields when `supportsStore=false` (including OpenAI-compatible non-OpenAI providers) while preserving server-compaction payload behavior..
- Agents/model fallback visibility: warn when configured model IDs cannot be resolved and fallback is applied, with log-safe sanitization of model text to prevent control-sequence injection in warning output..
- Outbound delivery replay safety: use two-phase delivery ACK markers (`.json` -> `.delivered` -> unlink) and startup marker cleanup so crash windows between send and cleanup do not replay already-delivered messages..
- Nodes/system.run approval binding: carry prepared approval plans through gateway forwarding and bind interpreter-style script operands across approval to execution, so post-approval script rewrites are denied while unchanged approved script runs keep working. for reporting.
- Nodes/system.run PowerShell wrapper parsing: treat `pwsh`/`powershell` `-EncodedCommand` forms as shell-wrapper payloads so allowlist mode still requires approval instead of falling back to plain argv analysis. for reporting.
- Control UI/auth error reporting: map generic browser `Fetch failed` websocket close errors back to actionable gateway auth messages (`gateway token mismatch`, `authentication failed`, `retry later`) so dashboard disconnects stop hiding credential problems. Landed from contributor PR #28608 by..
- Media/mime unknown-kind handling: return `undefined` (not `"unknown"`) for missing/unrecognized MIME kinds and use document-size fallback caps for unknown remote media, preventing phantom `<media:unknown>` Signal events from being treated as real messages..
- Nodes/system.run allow-always persistence: honor shell comment semantics during allowlist analysis so `#`-tailed payloads that never execute are not persisted as trusted follow-up commands. for reporting.
- Signal/inbound attachment fan-in: forward all successfully fetched inbound attachments through `MediaPaths`/`MediaUrls`/`MediaTypes` (instead of only the first), and improve multi-attachment placeholder summaries in mention-gated pending history..
- Nodes/system.run dispatch-wrapper boundary: keep shell-wrapper approval classification active at the depth boundary so `env` wrapper stacks cannot reach `/bin/sh -c` execution without the expected approval gate. for reporting.
- Docker/token persistence on reconfigure: reuse the existing `.env` gateway token during `docker-setup.sh` reruns and align compose token env defaults, so Docker installs stop silently rotating tokens and breaking existing dashboard sessions. Landed from contributor PR #33097 by..
- Agents/strict OpenAI turn ordering: apply assistant-first transcript bootstrap sanitization to strict OpenAI-compatible providers (for example vLLM/Gemma via `openai-completions`) without adding Google-specific session markers, preventing assistant-first history rejections..
- Discord/exec approvals gateway auth: pass resolved shared gateway credentials into the Discord exec-approvals gateway client so token-auth installs stop failing approvals with `gateway token mismatch`. Related to #38179. for the adjacent PR #35147 investigation.
- Subagents/workspace inheritance: propagate parent workspace directory to spawned subagent runs so child sessions reliably inherit workspace-scoped instructions (`AGENTS.md`, `SOUL.md`, etc.) without exposing workspace override through tool-call arguments..
- Exec approvals/gateway-node policy: honor explicit `ask=off` from `exec-approvals.json` even when runtime defaults are stricter, so trusted full/off setups stop re-prompting on gateway and node exec paths. Landed from contributor PR #26789 by..
- Exec approvals/config fallback: inherit `ask` from `exec-approvals.json` when `tools.exec.ask` is unset, so local full/off defaults no longer fall back to `on-miss` for exec tool and `nodes run`. Landed from contributor PR #29187 by..
- Exec approvals/allow-always shell scripts: persist and match script paths for wrapper invocations like `bash scripts/foo.sh` while still blocking `-c`/`-s` wrapper bypasses. Landed from contributor PR #35137 by..
- Queue/followup dedupe across drain restarts: dedupe queued redelivery `message_id` values after queue recreation so busy-session followups no longer duplicate on replayed inbound events. Landed from contributor PR #33168 by..
- Telegram/preview-final edit idempotence: treat `message is not modified` errors during preview finalization as delivered so partial-stream final replies do not fall back to duplicate sends. Landed from contributor PR #34983 by..
- Telegram/DM streaming transport parity: use message preview transport for all DM streaming lanes so final delivery can edit the active preview instead of sending duplicate finals. Landed from contributor PR #38906 by..
- Telegram/DM draft streaming restoration: restore native `sendMessageDraft` preview transport for DM answer streaming while keeping reasoning on message transport, with regression coverage to keep draft finalization from sending duplicate finals..
- Telegram/send retry safety: retry non-idempotent send paths only for pre-connect failures and make custom retry predicates strict, preventing ambiguous reconnect retries from sending duplicate messages. Landed from contributor PR #34238 by..
- ACP/run spawn delivery bootstrap: stop reusing requester inline delivery targets for one-shot `mode: "run"` ACP spawns, so fresh run-mode workers bootstrap in isolation instead of inheriting thread-bound session delivery behavior..
- Discord/DM session-key normalization: rewrite legacy `discord:dm:*` and phantom direct-message `discord:channel:<user>` session keys to `discord:direct:*` when the sender matches, so multi-agent Discord DMs stop falling into empty channel-shaped sessions and resume replying correctly.
- Discord/native slash session fallback: treat empty configured bound-session keys as missing so `/status` and other native commands fall back to the routed slash session and routed channel session instead of blanking Discord session keys in normal channel bindings.
- Agents/tool-call dispatch normalization: normalize provider-prefixed tool names before dispatch across `toolCall`, `toolUse`, and `functionCall` blocks, while preserving multi-segment tool suffixes when stripping provider wrappers so malformed-but-recoverable tool names no longer fail with `Tool not found`..
- Agents/parallel tool-call compatibility: honor `parallel_tool_calls` / `parallelToolCalls` extra params only for `openai-completions` and `openai-responses` payloads, preserve higher-precedence alias overrides across config and runtime layers, and ignore invalid non-boolean values so single-tool-call providers like NVIDIA-hosted Kimi stop failing on forced parallel tool-call payloads..
- Config/invalid-load fail-closed: stop converting `INVALID_CONFIG` into an empty runtime config, keep valid settings available only through explicit best-effort diagnostic reads, and route read-only CLI diagnostics through that path so unknown keys no longer silently drop security-sensitive config. and.
- Agents/codex-cli sandbox defaults: switch the built-in Codex backend from `read-only` to `workspace-write` so spawned coding runs can edit files out of the box. Landed from contributor PR #39336 by..
- Gateway/health-monitor restart reason labeling: report `disconnected` instead of `stuck` for clean channel disconnect restarts, so operator logs distinguish socket drops from genuinely stuck channels..
- Control UI/agents-page overrides: auto-create minimal per-agent config entries when editing inherited agents, so model/tool/skill changes enable Save and inherited model fallbacks can be cleared by writing a primary-only override. Landed from contributor PR #39326 by..
- Gateway/Telegram webhook-mode recovery: add `webhookCertPath` to re-upload self-signed certificates during webhook registration and skip stale-socket detection for webhook-mode channels, so Telegram webhook setups survive health-monitor restarts. Landed from contributor PR #39313 by..
- Discord/config schema parity: add `channels.discord.agentComponents` to the strict Zod config schema so valid `agentComponents.enabled` settings (root and account-scoped) no longer fail with unrecognized-key validation errors. Landed from contributor PR #39378 by. and.
- ACPX/MCP session bootstrap: inject configured MCP servers into ACP `session/new` and `session/load` for acpx-backed sessions, restoring Canva and other external MCP tools. Landed from contributor PR #39337..
- Control UI/Telegram sender labels: preserve inbound sender labels in sanitized chat history so dashboard user-message groups split correctly and show real group-member names instead of `You`..
- Agents/failover 402 recovery: keep temporary spend-limit `402` payloads retryable, preserve explicit insufficient-credit billing detection even in long provider payloads, and allow throttled billing-cooldown probes so single-provider setups can recover instead of staying locked out..
- Browser/config schema: accept `browser.profiles.*.driver: "kibo"` while preserving legacy `"kibo"` compatibility in validated config. (#39374; based on #35621) and.
- Memory flush/bootstrap file protection: restrict memory-flush runs to append-only `read`/`write` tools and route host-side memory appends through root-enforced safe file handles so flush turns cannot overwrite bootstrap files via `exec` or unsafe raw rewrites..
- Mattermost/DM media uploads: resolve bare 26-character Mattermost IDs user-first for direct messages so media sends no longer fail with `403 Forbidden` when targets are configured as unprefixed user IDs..
- Voice-call/OpenAI TTS config parity: add missing `speed`, `instructions`, and `baseUrl` fields to the OpenAI TTS config schema and gate `instructions` to supported models so voice-call overrides validate and route cleanly through core TTS..

### Breaking

- **BREAKING:** Gateway auth now requires explicit `gateway.auth.mode` when both `gateway.auth.token` and `gateway.auth.password` are configured (including SecretRefs). Set `gateway.auth.mode` to `token` or `password` before upgrade to avoid startup/pairing/TUI failures..

## 2026.3.2

### Changes

- Secrets/SecretRef coverage: expand SecretRef support across the full supported user-supplied credential surface (64 targets total), including runtime collectors, `kibo secrets` planning/apply/audit flows, onboarding SecretInput UX, and related docs; unresolved refs now fail fast on active surfaces while inactive surfaces report non-blocking diagnostics..
- Tools/PDF analysis: add a first-class `pdf` tool with native Anthropic and Google PDF provider support, extraction fallback for non-native models, configurable defaults (`agents.defaults.pdfModel`, `pdfMaxBytesMb`, `pdfMaxPages`), and docs/tests covering routing, validation, and registration..
- Outbound adapters/plugins: add shared `sendPayload` support across direct-text-media, Discord, Slack, WhatsApp, Zalo, and Zalouser with multi-media iteration and chunk-aware text fallback..
- Models/MiniMax: add first-class `MiniMax-M2.5-highspeed` support across built-in provider catalogs, onboarding flows, and MiniMax OAuth plugin defaults, while keeping legacy `MiniMax-M2.5-Lightning` compatibility for existing configs.
- Sessions/Attachments: add inline file attachment support for `sessions_spawn` (subagent runtime only) with base64/utf8 encoding, transcript content redaction, lifecycle cleanup, and configurable limits via `tools.sessions_spawn.attachments`..
- Telegram/Streaming defaults: default `channels.telegram.streaming` to `partial` (from `off`) so new Telegram setups get live preview streaming out of the box, with runtime fallback to message-edit preview when native drafts are unavailable.
- Telegram/DM streaming: use `sendMessageDraft` for private preview streaming, keep reasoning/answer preview lanes separated in DM reasoning-stream mode..
- Telegram/voice mention gating: add optional `disableAudioPreflight` on group/topic config to skip mention-detection preflight transcription for inbound voice notes where operators want text-only mention checks..
- CLI/Config validation: add `kibo config validate` (with `--json`) to validate config files before gateway startup, and include detailed invalid-key paths in startup invalid-config errors..
- Tools/Diffs: add PDF file output support and rendering quality customization controls (`fileQuality`, `fileScale`, `fileMaxWidth`) for generated diff artifacts, and document PDF as the preferred option when messaging channels compress images..
- Memory/Ollama embeddings: add `memorySearch.provider = "ollama"` and `memorySearch.fallback = "ollama"` support, honor `models.providers.ollama` settings for memory embedding requests, and document Ollama embedding usage..
- Zalo Personal plugin (`@kibo/zalouser`): rebuilt channel runtime to use native `zca-js` integration in-process, removing external CLI transport usage and keeping QR/login + send/listen flows fully inside Kibo.
- Plugin SDK/channel extensibility: expose `channelRuntime` on `ChannelGatewayContext` so external channel plugins can access shared runtime helpers (reply/routing/session/text/media/commands) without internal imports..
- Plugin runtime/STT: add `api.runtime.stt.transcribeAudioFile(...)` so extensions can transcribe local audio files through Kibo's configured media-understanding audio providers..
- Plugin hooks/session lifecycle: include `sessionKey` in `session_start`/`session_end` hook events and contexts so plugins can correlate lifecycle callbacks with routing identity..
- Hooks/message lifecycle: add internal hook events `message:transcribed` and `message:preprocessed`, plus richer outbound `message:sent` context (`isGroup`, `groupId`) for group-conversation correlation and post-transcription automations..
- Media understanding/audio echo: add optional `tools.media.audio.echoTranscript` + `echoFormat` to send a pre-agent transcript confirmation message to the originating chat, with echo disabled by default..
- Plugin runtime/system: expose `runtime.system.requestHeartbeatNow(...)` so extensions can wake targeted sessions immediately after enqueueing system events..
- Plugin runtime/events: expose `runtime.events.onAgentEvent` and `runtime.events.onSessionTranscriptUpdate` for extension-side subscriptions, and isolate transcript-listener failures so one faulty listener cannot break the entire update fanout..
- CLI/Banner taglines: add `cli.banner.taglineMode` (`random` | `default` | `off`) to control funny tagline behavior in startup output, with docs + FAQ guidance and regression tests for config override behavior.
- Agents/compaction safeguard quality-audit rollout: keep summary quality audits disabled by default unless `agents.defaults.compaction.qualityGuard` is explicitly enabled, and add config plumbing for bounded retry control..
- Gateway/input_image MIME validation: sniff uploaded image bytes before MIME allowlist enforcement again so declared image types cannot mask concrete non-image payloads, while keeping HEIC/HEIF normalization behavior scoped to actual HEIC inputs..
- Zalo Personal plugin (`@kibo/zalouser`): keep canonical DM routing while preserving legacy DM session continuity on upgrade, and preserve provider-native `g-`/`u-` target ids in outbound send and directory flows so #33992 lands without breaking existing sessions or stored targets..

### Fixes

- Feishu/Outbound render mode: respect Feishu account `renderMode` in outbound sends so card mode (and auto-detected markdown tables/code blocks) uses markdown card delivery instead of always sending plain text..
- Plugin command/runtime hardening: validate and normalize plugin command name/description at registration boundaries, and guard Telegram native menu normalization paths so malformed plugin command specs cannot crash startup (`trim` on undefined). Fixes #31944..
- Telegram: guard duplicate-token checks and gateway startup token normalization when account tokens are missing, preventing `token.trim()` crashes during status/start flows..
- Discord/lifecycle startup status: push an immediate `connected` status snapshot when the gateway is already connected before lifecycle debug listeners attach, with abort-guarding to avoid contradictory status flips during pre-aborted startup..
- Feishu/inbound mention normalization: preserve all inbound mention semantics by normalizing Feishu mention placeholders into explicit `<at user_id=\"...\">name</at>` tags (instead of stripping them), improving multi-mention context fidelity in agent prompts while retaining bot/self mention disambiguation..
- Feishu/multi-app mention routing: guard mention detection in multi-bot groups by validating mention display name alongside bot `open_id`, preventing false-positive self-mentions from Feishu WebSocket remapping so only the actually mentioned bot responds under `requireMention`..
- Feishu/session-memory hook parity: trigger the shared `before_reset` session-memory hook path when Feishu `/new` and `/reset` commands execute so reset flows preserve memory behavior consistent with other channels..
- Feishu/LINE group system prompts: forward per-group `systemPrompt` config into inbound context `GroupSystemPrompt` for Feishu and LINE group/room events so configured group-specific behavior actually applies at dispatch time..
- Mentions/Slack formatting hardening: add null-safe guards for runtime text normalization paths so malformed/undefined text payloads do not crash mention stripping or mrkdwn conversion..
- Feishu/Plugin sdk compatibility: add safe webhook default fallbacks when loading Feishu monitor state so mixed-version installs no longer crash if older `kibo/plugin-sdk` builds omit webhook default constants.
- Feishu/group broadcast dispatch: add configurable multi-agent group broadcast dispatch with observer-session isolation, cross-account dedupe safeguards, and non-mention history buffering rules that avoid duplicate replay in broadcast/topic workflows..
- Gateway/Subagent TLS pairing: allow authenticated local `gateway-client` backend self-connections to skip device pairing while still requiring pairing for non-local/direct-host paths, restoring `sessions_spawn` with `gateway.tls.enabled=true` in Docker/LAN setups. Fixes #30740. and.
- Browser/CDP startup diagnostics: include Chrome stderr output and a Linux no-sandbox hint in startup timeout errors so failed launches are easier to diagnose..
- Synology Chat/webhook ingress hardening: enforce bounded body reads (size + timeout) via shared request-body guards to prevent unauthenticated slow-body hangs before token validation..
- Feishu/Dedup restart resilience: warm persistent dedup state into memory on monitor startup so retry events after gateway restart stay suppressed without requiring initial on-disk probe misses.
- Voice-call/runtime lifecycle: prevent `EADDRINUSE` loops by resetting failed runtime promises, making webhook `start()` idempotent with the actual bound port, and fully cleaning up webhook/tunnel/tailscale resources after startup failures..
- Gateway/Security hardening: tie loopback-origin dev allowance to actual local socket clients (not Host header claims), add explicit warnings/metrics when `gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback` accepts websocket origins, harden safe-regex detection for quantified ambiguous alternation patterns (for example `(a|aa)+`), and bound large regex-evaluation inputs for session-filter and log-redaction paths.
- Gateway/Plugin HTTP hardening: require explicit `auth` for plugin route registration, add route ownership guards for duplicate `path+match` registrations, centralize plugin path matching/auth logic into dedicated modules, and share webhook target-route lifecycle wiring across channel monitors to avoid stale or conflicting registrations. for reporting.
- Browser/Profile defaults: prefer `kibo` profile over `chrome` in headless/no-sandbox environments unless an explicit `defaultProfile` is configured..
- Gateway/WS security: keep plaintext `ws://` loopback-only by default, with explicit break-glass private-network opt-in via `KIBO_ALLOW_INSECURE_PRIVATE_WS=1`; align onboarding/client/call validation and tests to this strict-default policy..
- OpenAI Codex OAuth/TLS prerequisites: add an OAuth TLS cert-chain preflight with actionable remediation for cert trust failures, and gate doctor TLS prerequisite probing to OpenAI Codex OAuth-configured installs (or explicit `doctor --deep`) to avoid unconditional outbound probe latency..
- Security/Webhook request hardening: enforce auth-before-body parsing for BlueBubbles and Google Chat webhook handlers, add strict pre-auth body/time budgets for webhook auth paths (including LINE signature verification), and add shared in-flight/request guardrails plus regression tests/lint checks to prevent reintroducing unauthenticated slow-body DoS patterns. for reporting.
- CLI/Config validation and routing hardening: dedupe `kibo config validate` failures to a single authoritative report, expose allowed-values metadata/hints across core Zod and plugin AJV validation (including `--json` fields), sanitize terminal-rendered validation text, and make command-path parsing root-option-aware across preaction/route/lazy registration (including routed `config get/unset` with split root options)..
- Browser/Extension relay reconnect tolerance: keep `/json/version` and `/cdp` reachable during short MV3 worker disconnects when attached targets still exist, and retain clients across reconnect grace windows..
- CLI/Browser start timeout: honor `kibo browser --timeout <ms> start` and stop by removing the fixed 15000ms override so slower Chrome startups can use caller-provided timeouts. (#22412, #23427).
- Synology Chat/gateway lifecycle: keep `startAccount` pending until abort for inactive and active account paths to prevent webhook route restart loops under gateway supervision..
- Exec approvals/allowlist matching: escape regex metacharacters in path-pattern literals (while preserving glob wildcards), preventing crashes on allowlisted executables like `/usr/bin/g++` and correctly matching mixed wildcard/literal token paths..
- Synology Chat/webhook compatibility: accept JSON and alias payload fields, allow token resolution from body/query/header sources, and ACK webhook requests with `204` to avoid persistent `Processing...` states in Synology Chat clients..
- Voice-call/Twilio signature verification: retry signature validation across deterministic URL port variants (with/without port) to handle mixed Twilio signing behavior behind reverse proxies and non-standard ports..
- Slack/Bolt startup compatibility: remove invalid `message.channels` and `message.groups` event registrations so Slack providers no longer crash on startup with Bolt 4.6+; channel/group traffic continues through the unified `message` handler (`channel_type`)..
- Slack/socket auth failure handling: fail fast on non-recoverable auth errors (`account_inactive`, `invalid_auth`, etc.) during startup and reconnect instead of retry-looping indefinitely, including `unable_to_socket_mode_start` error payload propagation..
- Gateway/macOS LaunchAgent hardening: write `Umask=077` in generated gateway LaunchAgent plists so npm upgrades preserve owner-only default file permissions for gateway-created state files. Fixes #31905..
- macOS/LaunchAgent security defaults: write `Umask=63` (octal `077`) into generated gateway launchd plists so post-update service reinstalls keep owner-only file permissions by default instead of falling back to system `022`. Fixes #31905..
- Media understanding/provider HTTP proxy routing: pass a proxy-aware fetch function from `HTTPS_PROXY`/`HTTP_PROXY` env vars into audio/video provider calls (with graceful malformed-proxy fallback) so transcription/video requests honor configured outbound proxies..
- Sandbox/workspace mount permissions: make primary `/workspace` bind mounts read-only whenever `workspaceAccess` is not `rw` (including `none`) across both core sandbox container and sandbox browser create flows..
- Tools/fsPolicy propagation: honor `tools.fs.workspaceOnly` for image/pdf local-root allowlists so non-sandbox media paths outside workspace are rejected when workspace-only mode is enabled..
- Daemon/Homebrew runtime pinning: resolve Homebrew Cellar Node paths to stable Homebrew-managed symlinks (including versioned formulas like `node@22`) so gateway installs keep the intended runtime across brew upgrades..
- Browser/Security output boundary hardening: replace check-then-rename output commits with root-bound fd-verified writes, unify install/skills canonical path-boundary checks, and add regression coverage for symlink-rebind race paths across browser output and shared fs-safe write flows. for reporting.
- Gateway/Security canonicalization hardening: decode plugin route path variants to canonical fixpoint (with bounded depth), fail closed on canonicalization anomalies, and enforce gateway auth for deeply encoded `/api/channels/*` variants to prevent alternate-path auth bypass through plugin handlers. for reporting.
- Browser/Gateway hardening: preserve env credentials for `KIBO_GATEWAY_URL` / `KIBOBOT_GATEWAY_URL` while treating explicit `--url` as override-only auth, and make container browser hardening flags optional with safer defaults for Docker/LXC stability..
- Gateway/Control UI basePath webhook passthrough: let non-read methods under configured `controlUiBasePath` fall through to plugin routes (instead of returning Control UI 405), restoring webhook handlers behind basePath mounts..
- Gateway/Webchat streaming finalization: flush throttled trailing assistant text before `final` chat events so streaming consumers do not miss tail content, while preserving duplicate suppression and heartbeat/silent lead-fragment guards. and.
- Control UI/Legacy browser compatibility: replace `toSorted`-dependent cron suggestion sorting in `app-render` with a compatibility helper so older browsers without `Array.prototype.toSorted` no longer white-screen..
- macOS/PeekabooBridge: add compatibility socket symlinks for legacy `kibobot`, `kibois`, and `moltbot` Application Support socket paths so pre-rename clients can still connect. and.
- Gateway/message tool reliability: avoid false `Unknown channel` failures when `message.*` actions receive platform-specific channel ids by falling back to `toolContext.currentChannelProvider`, and prevent health-monitor restart thrash for channels that just (re)started by adding a per-channel startup-connect grace window. (from #32367).
- Windows/Spawn canonicalization: unify non-core Windows spawn handling across ACP client, QMD/mcporter memory paths, and sandbox Docker execution using the shared wrapper-resolution policy, with targeted regression coverage for `.cmd` shim unwrapping and shell fallback behavior..
- Security/ACP sandbox inheritance: enforce fail-closed runtime guardrails for `sessions_spawn` with `runtime="acp"` by rejecting ACP spawns from sandboxed requester sessions and rejecting `sandbox="require"` for ACP runtime, preventing sandbox-boundary bypass via host-side ACP initialization. for reporting, and for the fix.
- Security/Web tools SSRF guard: keep DNS pinning for untrusted `web_fetch` and citation-redirect URL checks when proxy env vars are set, and require explicit dangerous opt-in before env-proxy routing can bypass pinned dispatch for trusted/operator-controlled endpoints. for reporting.
- Gemini schema sanitization: coerce malformed JSON Schema `properties` values (`null`, arrays, primitives) to `{}` before provider validation, preventing downstream strict-validator crashes on invalid plugin/tool schemas..
- Media understanding/malformed attachment guards: harden attachment selection and decision summary formatting against non-array or malformed attachment payloads to prevent runtime crashes on invalid inbound metadata shapes..
- Browser/Extension navigation reattach: preserve debugger re-attachment when relay is temporarily disconnected by deferring relay attach events until reconnect/re-announce, reducing post-navigation tab loss..
- Browser/Extension relay stale tabs: evict stale cached targets from `/json/list` when extension targets are destroyed/crashed or commands fail with missing target/session errors..
- Browser/CDP startup readiness: wait for CDP websocket readiness after launching Chrome and cleanly stop/reset when readiness never arrives, reducing follow-up `PortInUseError` races after `browser start`/`open`..
- OpenAI/Responses WebSocket tool-call id hygiene: normalize blank/whitespace streamed tool-call ids before persistence, and block empty `function_call_output.call_id` payloads in the WS conversion path to avoid OpenAI 400 errors (`Invalid 'input[n].call_id': empty string`), with regression coverage for both inbound stream normalization and outbound payload guards.
- Security/Nodes camera URL downloads: bind node `camera.snap`/`camera.clip` URL payload downloads to the resolved node host, enforce fail-closed behavior when node `remoteIp` is unavailable, and use SSRF-guarded fetch with redirect host/protocol checks to prevent off-node fetch pivots. for reporting.
- Config/backups hardening: enforce owner-only (`0600`) permissions on rotated config backups and clean orphan `.bak.*` files outside the managed backup ring, reducing credential leakage risk from stale or permissive backup artifacts..
- Telegram/inbound media filenames: preserve original `file_name` metadata for document/audio/video/animation downloads (with fetch/path fallbacks), so saved inbound attachments keep sender-provided names instead of opaque Telegram file paths..
- Gateway/OpenAI chat completions: honor `x-kibo-message-channel` when building `agentCommand` input for `/v1/chat/completions`, preserving caller channel identity instead of forcing `webchat`..
- Plugin SDK/runtime hardening: add package export verification in CI/release checks to catch missing runtime exports before publish-time regressions..
- Media/MIME normalization: normalize parameterized/case-variant MIME strings in `kindFromMime` (for example `Audio/Ogg; codecs=opus`) so WhatsApp voice notes are classified as audio and routed through transcription correctly..
- Discord/audio preflight mentions: detect audio attachments via Discord `content_type` and gate preflight transcription on typed text (not media placeholders), so guild voice-note mentions are transcribed and matched correctly..
- Discord/acp inline actions: prefer autocomplete for `/acp` action inline values and ignore bound-thread bot system messages to prevent ACP loops..
- Feishu/topic session routing: use `thread_id` as topic session scope fallback when `root_id` is absent, keep first-turn topic keys stable across thread creation, and force thread replies when inbound events already carry topic/thread context..
- Gateway/Webchat NO_REPLY streaming: suppress assistant lead-fragment deltas that are prefixes of `NO_REPLY` and keep final-message buffering in sync, preventing partial `NO` leaks on silent-response runs while preserving legitimate short replies..
- Telegram/models picker callbacks: keep long model buttons selectable by falling back to compact callback payloads and resolving provider ids on selection (with provider re-prompt on ambiguity), avoiding Telegram 64-byte callback truncation failures..
- Context-window metadata warmup: add exponential config-load retry backoff (1s -> 2s -> 4s, capped at 60s) so transient startup failures recover automatically without hot-loop retries.
- Voice-call/Twilio external outbound: auto-register webhook-first `outbound-api` calls (initiated outside Kibo) so media streams are accepted and call direction metadata stays accurate..
- Feishu/topic root replies: prefer `root_id` as outbound `replyTargetMessageId` when present, and parse millisecond `message_create_time` values correctly so topic replies anchor to the root message in grouped thread flows..
- Feishu/DM pairing reply target: send pairing challenge replies to `chat:<chat_id>` instead of `user:<sender_open_id>` so Lark/Feishu private chats with user-id-only sender payloads receive pairing messages reliably..
- Feishu/Lark private DM routing: treat inbound `chat_type: "private"` as direct-message context for pairing/mention-forward/reaction synthetic handling so Lark private chats behave like Feishu p2p DMs..
- Feishu/streaming card transport error handling: check `response.ok` before parsing JSON in token and card create requests so non-JSON HTTP error responses surface deterministic status failures..
- Signal/message actions: allow `react` to fall back to `toolContext.currentMessageId` when `messageId` is omitted, matching Telegram behavior and unblocking agent-initiated reactions on inbound turns..
- Discord/message actions: allow `react` to fall back to `toolContext.currentMessageId` when `messageId` is omitted, matching Telegram/Signal reaction ergonomics in inbound turns.
- Synology Chat/reply delivery: resolve webhook usernames to Chat API `user_id` values for outbound chatbot replies, avoiding mismatches between webhook user IDs and `method=chatbot` recipient IDs in multi-account setups..
- Slack/thread context payloads: only inject thread starter/history text on first thread turn for new sessions while preserving thread metadata, reducing repeated context-token bloat on long-lived thread sessions..
- Slack/session routing: keep top-level channel messages in one shared session when `replyToMode=off`, while preserving thread-scoped keys for true thread replies and non-off modes..
- Slack/app_mention dedupe race handling: keep seen-message dedupe to prevent duplicate replies while allowing a one-time app_mention retry when the paired message event was dropped pre-dispatch, so requireMention channels do not lose mentions under Slack event reordering..
- Voice-call/webhook routing: require exact webhook path matches (instead of prefix matches) so lookalike paths cannot reach provider verification/dispatch logic..
- Zalo/Pairing auth tests: add webhook regression coverage asserting DM pairing-store reads/writes remain account-scoped, preventing cross-account authorization bleed in multi-account setups..
- Zalouser/Pairing auth tests: add account-scoped DM pairing-store regression coverage (`monitor.account-scope.test.ts`) to prevent cross-account allowlist bleed in multi-account setups..
- Feishu/Send target prefixes: normalize explicit `group:`/`dm:` send targets and preserve explicit receive-id routing hints when resolving outbound Feishu targets..
- Webchat/Feishu session continuation: preserve routable `OriginatingChannel`/`OriginatingTo` metadata from session delivery context in `chat.send`, and prefer provider-normalized channel when deciding cross-channel route dispatch so Webchat replies continue on the selected Feishu session instead of falling back to main/internal session routing.
- Telegram/implicit mention forum handling: exclude Telegram forum system service messages (`forum_topic_*`, `general_forum_topic_*`) from reply-chain implicit mention detection so `requireMention` does not get bypassed inside bot-created topic lifecycle events..
- Slack/inbound debounce routing: isolate top-level non-DM message debounce keys by message timestamp to avoid cross-thread collisions, preserve DM batching, and flush pending top-level buffers before immediate non-debounce follow-ups to keep ordering stable..
- Feishu/Duplicate replies: suppress same-target reply dispatch when message-tool sends use generic provider metadata (`provider: "message"`) and normalize `lark`/`feishu` provider aliases during duplicate-target checks, preventing double-delivery in Feishu sessions.
- Webchat/silent token leak: filter assistant `NO_REPLY`-only transcript entries from `chat.history` responses and add client-side defense-in-depth guards in the chat controller so internal silent tokens never render as visible chat bubbles. Consolidates overlap from #32183, #32082, #32045, #32052, #32172, and #32112., and.
- Doctor/local memory provider checks: stop false-positive local-provider warnings when `provider=local` and no explicit `modelPath` is set by honoring default local model fallback while still warning when gateway probe reports local embeddings not ready. Fixes #31998..
- Media understanding/parakeet CLI output parsing: read `parakeet-mlx` transcripts from `--output-dir/<media-basename>.txt` when txt output is requested (or default), with stdout fallback for non-txt formats..
- Media understanding/audio transcription guard: skip tiny/empty audio files (<1024 bytes) before provider/CLI transcription to avoid noisy invalid-audio failures and preserve clean fallback behavior..
- Gateway/Plugin HTTP route precedence: run explicit plugin HTTP routes before the Control UI SPA catch-all so registered plugin webhook/custom paths remain reachable, while unmatched paths still fall through to Control UI handling..
- Gateway/Node browser proxy routing: honor `profile` from `browser.request` JSON body when query params omit it, while preserving query-profile precedence when both are present..
- Gateway/Control UI basePath POST handling: return 405 for `POST` on exact basePath routes (for example `/kibo`) instead of redirecting, and add end-to-end regression coverage that root-mounted webhook POST paths still pass through to plugin handlers..
- Browser/default profile selection: default `browser.defaultProfile` behavior now prefers `kibo` (managed standalone CDP) when no explicit default is configured, while still auto-provisioning the `chrome` relay profile for explicit opt-in use. Fixes #31907..
- Sandbox/mkdirp boundary checks: allow existing in-boundary directories to pass mkdirp boundary validation when directory open probes return platform-specific I/O errors, with regression coverage for directory-safe fallback behavior..
- Models/config env propagation: apply `config.env.vars` before implicit provider discovery in models bootstrap so config-scoped credentials are visible to implicit provider resolution paths..
- Models/Codex usage labels: infer weekly secondary usage windows from reset cadence when API window seconds are ambiguously reported as 24h, so `kibo models status` no longer mislabels weekly limits as daily..
- Gateway/Heartbeat model reload: treat `models.*` and `agents.defaults.model` config updates as heartbeat hot-reload triggers so heartbeat picks up model changes without a full gateway restart..
- Memory/LanceDB embeddings: forward configured `embedding.dimensions` into OpenAI embeddings requests so vector size and API output dimensions stay aligned when dimensions are explicitly configured..
- Gateway/Control UI method guard: allow POST requests to non-UI routes to fall through when no base path is configured, and add POST regression coverage for fallthrough and base-path 405 behavior..
- Browser/CDP status accuracy: require a successful `Browser.getVersion` response over the CDP websocket (not just socket-open) before reporting `cdpReady`, so stale idle command channels are surfaced as unhealthy..
- Daemon/systemd checks in containers: treat missing `systemctl` invocations (including `spawn systemctl ENOENT`/`EACCES`) as unavailable service state during `is-enabled` checks, preventing container flows from failing with `Gateway service check failed` before install/status handling can continue. and.
- Security/Node exec approvals: revalidate approval-bound `cwd` identity immediately before execution/forwarding and fail closed with an explicit denial when `cwd` drifts after approval hardening.
- Security audit/skills workspace hardening: add `skills.workspace.symlink_escape` warning in `kibo security audit` when workspace `skills/**/SKILL.md` resolves outside the workspace root (for example symlink-chain drift), plus docs coverage in the security glossary.
- Security/Node exec approvals: preserve shell/dispatch-wrapper argv semantics during approval hardening so approved wrapper commands (for example `env sh -c ...`) cannot drift into a different runtime command shape, and add regression coverage for both approval-plan generation and approved runtime execution paths. for reporting.
- Security/fs-safe write hardening: make `writeFileWithinRoot` use same-directory temp writes plus atomic rename, add post-write inode/hardlink revalidation with security warnings on boundary drift, and avoid truncating existing targets when final rename fails.
- Security/Skills archive extraction: unify tar extraction safety checks across tar.gz and tar.bz2 install flows, enforce tar compressed-size limits, and fail closed if tar.bz2 archives change between preflight and extraction to prevent bypasses of entry-type/size guardrails. for reporting.
- Security/Prompt spoofing hardening: stop injecting queued runtime events into user-role prompt text, route them through trusted system-prompt context, and neutralize inbound spoof markers like `[System Message]` and line-leading `System:` in untrusted message content.
- Sandbox/Docker setup command parsing: accept `agents.*.sandbox.docker.setupCommand` as either a string or a string array, and normalize arrays to newline-delimited shell scripts so multi-step setup commands no longer concatenate without separators..
- Sandbox/Bootstrap context boundary hardening: reject symlink/hardlink alias bootstrap seed files that resolve outside the source workspace and switch post-compaction `AGENTS.md` context reads to boundary-verified file opens, preventing host file content from being injected via workspace aliasing. for reporting.
- Agents/Sandbox workdir mapping: map container workdir paths (for example `/workspace`) back to the host workspace before sandbox path validation so exec requests keep the intended directory in containerized runs instead of falling back to an unavailable host path..
- Docker/Sandbox bootstrap hardening: make `KIBO_SANDBOX` opt-in parsing explicit (`1|true|yes|on`), support custom Docker socket paths via `KIBO_DOCKER_SOCKET`, defer docker.sock exposure until sandbox prerequisites pass, and reset/roll back persisted sandbox mode to `off` when setup is skipped or partially fails to avoid stale broken sandbox state. and.
- Hooks/webhook ACK compatibility: return `200` (instead of `202`) for successful `/hooks/agent` requests so providers that require `200` (for example Forward Email) accept dispatched agent hook deliveries..
- Feishu/Run channel fallback: prefer `Provider` over `Surface` when inferring queued run `messageProvider` fallback (when `OriginatingChannel` is missing), preventing Feishu turns from being mislabeled as `webchat` in mixed relay metadata contexts. Fixes #31859..
- Skills/sherpa-onnx-tts: run the `sherpa-onnx-tts` bin under ESM (replace CommonJS `require` imports) and add regression coverage to prevent `require is not defined in ES module scope` startup crashes..
- Inbound metadata/direct relay context: restore direct-channel conversation metadata blocks for external channels (for example WhatsApp) while preserving webchat-direct suppression, so relay agents recover sender/message identifiers without reintroducing internal webchat metadata noise. Fixes #29972..
- Slack/Channel message subscriptions: register explicit `message.channels` and `message.groups` monitor handlers (alongside generic `message`) so channel/group event subscriptions are consumed even when Slack dispatches typed message event names. Fixes #31674.
- Hooks/session-scoped memory context: expose ephemeral `sessionId` in embedded plugin tool contexts and `before_tool_call`/`after_tool_call` hook contexts (including compaction and client-tool wiring) so plugins can isolate per-conversation state across `/new` and `/reset`. Related #31253 and #31304. and.
- Voice-call/Twilio inbound greeting: run answered-call initial notify greeting for Twilio instead of skipping the manager speak path, with regression coverage for both Twilio and Plivo notify flows..
- Voice-call/stale call hydration: verify active calls with the provider before loading persisted in-progress calls so stale locally persisted records do not block or misroute new call handling after restarts..
- Feishu/File upload filenames: percent-encode non-ASCII/special-character `file_name` values in Feishu multipart uploads so Chinese/symbol-heavy filenames are sent as proper attachments instead of plain text links..
- Media/MIME channel parity: route Telegram/Signal/iMessage media-kind checks through normalized `kindFromMime` so mixed-case/parameterized MIME values classify consistently across message channels.
- WhatsApp/inbound self-message context: propagate inbound `fromMe` through the web inbox pipeline and annotate direct self messages as `(self)` in envelopes so agents can distinguish owner-authored turns from contact turns..
- Webchat/stream finalization: persist streamed assistant text when final events omit `message`, while keeping final payload precedence and skipping empty stream buffers to prevent disappearing replies after tool turns..
- Feishu/Inbound ordering: serialize message handling per chat while preserving cross-chat concurrency to avoid same-chat race drops under bursty inbound traffic.
- Feishu/Typing notification suppression: skip typing keepalive reaction re-adds when the indicator is already active, preventing duplicate notification pings from repeated identical emoji adds.
- Feishu/Probe failure backoff: cache API and timeout probe failures for one minute per account key while preserving abort-aware probe timeouts, reducing repeated health-check retries during transient credential/network outages.
- Feishu/Streaming block fallback: preserve markdown block stream text as final streaming-card content when final payload text is missing, while still suppressing non-card internal block chunk delivery.
- Feishu/Bitable API errors: unify Feishu Bitable tool error handling with structured `LarkApiError` responses and consistent API/context attribution across wiki/base metadata, field, and record operations.
- Feishu/Missing-scope grant URL fix: rewrite known invalid scope aliases (`contact:contact.base:readonly`) to valid scope names in permission grant links, so remediation URLs open with correct Feishu consent scopes.
- BlueBubbles/Message metadata: harden send response ID extraction, include sender identity in DM context, and normalize inbound `message_id` selection to avoid duplicate ID metadata..
- WebChat/markdown tables: ensure GitHub-flavored markdown table parsing is explicitly enabled at render time and add horizontal overflow handling for wide tables, with regression coverage for table-only and mixed text+table content..
- Feishu/default account resolution: always honor explicit `channels.feishu.defaultAccount` during outbound account selection (including top-level-credential setups where the preferred id is not present in `accounts`), instead of silently falling back to another account id..
- Feishu/Sender lookup permissions: suppress user-facing grant prompts for stale non-existent scope errors (`contact:contact.base:readonly`) during best-effort sender-name resolution so inbound messages continue without repeated false permission notices.
- Discord/dispatch + Slack formatting: restore parallel outbound dispatch across Discord channels with per-channel queues while preserving in-channel ordering, and run Slack preview/stream update text through mrkdwn normalization for consistent formatting..
- Feishu/Inbound debounce: debounce rapid same-chat sender bursts into one ordered dispatch turn, skip already-processed retries when composing merged text, and preserve bot-mention intent across merged entries to reduce duplicate or late inbound handling.
- Tests/Sandbox + archive portability: use junction-compatible directory-link setup on Windows and explicit file-symlink platform guards in symlink escape tests where unprivileged file symlinks are unavailable, reducing false Windows CI failures while preserving traversal checks on supported paths..
- Browser/Extension re-announce reliability: keep relay state in `connecting` when re-announce forwarding fails and extend debugger re-attach retries after navigation to reduce false attached states and post-nav disconnect loops..
- Browser/Act request compatibility: accept legacy flattened `action="act"` params (`kind/ref/text/...`) in addition to `request={...}` so browser act calls no longer fail with `request required`..
- OpenRouter/x-ai compatibility: skip `reasoning.effort` injection for `x-ai/*` models (for example Grok) so OpenRouter requests no longer fail with invalid-arguments errors on unsupported reasoning params..
- Models/openai-completions developer-role compatibility: force `supportsDeveloperRole=false` for non-native endpoints, treat unparseable `baseUrl` values as non-native, and add regression coverage for empty/malformed baseUrl plus explicit-true override behavior..
- Browser/Profile attach-only override: support `browser.profiles.<name>.attachOnly` (fallback to global `browser.attachOnly`) so loopback proxy profiles can skip local launch/port-ownership checks without forcing attach-only mode for every profile. and.
- Sessions/Lock recovery: detect recycled Linux PIDs by comparing lock-file `starttime` with `/proc/<pid>/stat` starttime, so stale `.jsonl.lock` files are reclaimed immediately in containerized PID-reuse scenarios while preserving compatibility for older lock files. Fixes #27252. and.
- Cron/isolated delivery target fallback: remove early unresolved-target return so cron delivery can flow through shared outbound target resolution (including per-channel `resolveDefaultTo` fallback) when `delivery.to` is omitted..
- OpenAI media capabilities: include `audio` in the OpenAI provider capability list so audio transcription models are eligible in media-understanding provider selection..
- Browser/Managed tab cap: limit loopback managed `kibo` page tabs to 8 via best-effort cleanup after tab opens to reduce long-running renderer buildup while preserving attach-only and remote profile behavior..
- Docker/Image health checks: add Dockerfile `HEALTHCHECK` that probes gateway `GET /healthz` so container runtimes can mark unhealthy instances without requiring auth credentials in the probe command. and.
- Gateway/Node dangerous-command parity: include `sms.send` in default onboarding node `denyCommands`, share onboarding deny defaults with the gateway dangerous-command source of truth, and include `sms.send` in phone-control `/phone arm writes` handling so SMS follows the same break-glass flow as other dangerous node commands..
- Pairing/AllowFrom account fallback: handle omitted `accountId` values in `readChannelAllowFromStore` and `readChannelAllowFromStoreSync` as `default`, while preserving legacy unscoped allowFrom merges for default-account flows. and.
- Browser/Remote CDP ownership checks: skip local-process ownership errors for non-loopback remote CDP profiles when HTTP is reachable but the websocket handshake fails, and surface the remote websocket attach/retry path instead. Landed from contributor and.
- Browser/CDP proxy bypass: force direct loopback agent paths and scoped `NO_PROXY` expansion for localhost CDP HTTP/WS connections when proxy env vars are set, so browser relay/control still works behind global proxy settings..
- Sessions/idle reset correctness: preserve existing `updatedAt` during inbound metadata-only writes so idle-reset boundaries are not unintentionally refreshed before actual user turns..
- Sessions/lock recovery: reclaim orphan legacy same-PID lock files missing `starttime` when no in-process lock ownership exists, avoiding false lock timeouts after PID reuse while preserving active lock safety checks..
- Sessions/store cache invalidation: reload cached session stores when file size changes within the same mtime tick by keying cache validation on a single file-stat snapshot (`mtimeMs` + `sizeBytes`), with regression coverage for same-tick rewrites..
- Agents/Subagents `sessions_spawn`: reject malformed `agentId` inputs before normalization (for example error-message/path-like strings) to prevent unintended synthetic agent IDs and ghost workspace/session paths; includes strict validation regression coverage..
- CLI/installer Node preflight: enforce Node.js `v22.12+` consistently in both `kibo.mjs` runtime bootstrap and installer active-shell checks, with actionable nvm recovery guidance for mismatched shell PATH/defaults..
- Web UI/config form: support SecretInput string-or-secret-ref unions in map `additionalProperties`, so provider API key fields stay editable instead of being marked unsupported..
- Auto-reply/inline command cleanup: preserve newline structure when stripping inline `/status` and extracting inline slash commands by collapsing only horizontal whitespace, preventing paragraph flattening in multi-line replies..
- Config/raw redaction safety: preserve non-sensitive literals during raw redaction round-trips, scope SecretRef redaction to secret IDs (not structural fields like `source`/`provider`), and fall back to structured raw redaction when text replacement cannot restore the original config shape..
- Hooks/runtime stability: keep the internal hook handler registry on a `globalThis` singleton so hook registration/dispatch remains consistent when bundling emits duplicate module copies..
- Hooks/after_tool_call: include embedded session context (`sessionKey`, `agentId`) and fire the hook exactly once per tool execution by removing duplicate adapter-path dispatch in embedded runs..
- Hooks/tool-call correlation: include `runId` and `toolCallId` in plugin tool hook payloads/context and scope tool start/adjusted-param tracking by run to prevent cross-run collisions in `before_tool_call` and `after_tool_call`..
- Plugins/install diagnostics: reject legacy plugin package shapes without `kibo.extensions` and return an explicit upgrade hint with troubleshooting docs for repackaging..
- Hooks/plugin context parity: ensure `llm_input` hooks in embedded attempts receive the same `trigger` and `channelId`-aware `hookCtx` used by the other hook phases, preserving channel/trigger-scoped plugin behavior. and.
- Plugins/hardlink install compatibility: allow bundled plugin manifests and entry files to load when installed via hardlink-based package managers (`pnpm`, `bun`) while keeping hardlink rejection enabled for non-bundled plugin sources. Fixes #28175, #28404, #29455..
- Cron/session reaper reliability: move cron session reaper sweeps into `onTimer` `finally` and keep pruning active even when timer ticks fail early (for example cron store parse failures), preventing stale isolated run sessions from accumulating indefinitely. Fixes #31946..
- Cron/HEARTBEAT_OK summary leak: suppress fallback main-session enqueue for heartbeat/internal ack summaries in isolated announce mode so `HEARTBEAT_OK` noise never appears in user chat while real summaries still forward..
- Authentication: classify `permission_error` as `auth_permanent` for profile fallback..
- Agents/host edit reliability: treat host edit-tool throws as success only when on-disk post-check confirms replacement likely happened (`newText` present and `oldText` absent), preventing false failure reports while avoiding pre-write false positives..
- Plugins/install fallback safety: resolve bare install specs to bundled plugin ids before npm lookup (for example `diffs` -> bundled `@kibo/diffs`), keep npm fallback limited to true package-not-found errors, and continue rejecting non-plugin npm packages that fail manifest validation..
- Web UI/inline code copy fidelity: disable forced mid-token wraps on inline `<code>` spans so copied UUID/hash/token strings preserve exact content instead of inserting line-break spaces..
- Restart sentinel formatting: avoid duplicate `Reason:` lines when restart message text already matches `stats.reason`, keeping restart notifications concise for users and downstream parsers..
- Auto-reply/followup queue: avoid stale callback reuse across idle-window restarts by caching the followup runner only when a drain actually starts, preserving enqueue ordering after empty-finalize paths..
- Agents/tool-result guard: always clear pending tool-call state on interruptions even when synthetic tool results are disabled, preventing orphaned tool-use transcripts that cause follow-up provider request failures..
- Failover/error classification: treat HTTP `529` (provider overloaded, common with Anthropic-compatible APIs) as `rate_limit` so model failover can engage instead of misclassifying the error path..
- Logging: use local time for logged timestamps instead of UTC, aligning log output with documented local timezone behavior and avoiding confusion during local diagnostics..
- Agents/Subagent announce cleanup: keep completion-message runs pending while descendants settle, add a 30 minute hard-expiry backstop to avoid indefinite pending state, and keep retry bookkeeping resumable across deferred wakes..
- Secrets/exec resolver timeout defaults: use provider `timeoutMs` as the default inactivity (`noOutputTimeoutMs`) watchdog for exec secret providers, preventing premature no-output kills for resolvers that start producing output after 2s..
- Auto-reply/reminder guard note suppression: when a turn makes reminder-like commitments but schedules no new cron jobs, suppress the unscheduled-reminder warning note only if an enabled cron already exists for the same session; keep warnings for unrelated sessions, disabled jobs, or unreadable cron store paths..
- Cron/isolated announce heartbeat suppression: treat multi-payload runs as skippable when any payload is a heartbeat ack token and no payload has media, preventing internal narration + trailing `HEARTBEAT_OK` from being delivered to users..
- Cron/store migration: normalize legacy cron jobs with string `schedule` and top-level `command`/`timeout` fields into canonical schedule/payload/session-target shape on load, preventing schedule-error loops on old persisted stores..
- Tests/Windows backup rotation: skip chmod-only backup permission assertions on Windows while retaining compose/rotation/prune coverage across platforms to avoid false CI failures from Windows non-POSIX mode semantics..
- Tests/Subagent announce: set `KIBO_TEST_FAST=1` before importing `subagent-announce` format suites so module-level fast-mode constants are captured deterministically on Windows CI, preventing timeout flakes in nested completion announce coverage..
- Control UI/markdown recursion fallback: catch markdown parser failures and safely render escaped plain-text fallback instead of crashing the Control UI on pathological markdown history payloads. (#36445, fixes #36213).

### Breaking

- **BREAKING:** Onboarding now defaults `tools.profile` to `messaging` for new local installs (interactive + non-interactive). New setups no longer start with broad coding/system tools unless explicitly configured.
- **BREAKING:** ACP dispatch now defaults to enabled unless explicitly disabled (`acp.dispatch.enabled=false`). If you need to pause ACP turn routing while keeping `/acp` controls, set `acp.dispatch.enabled=false`. Docs: https://github.com/Arjgorithmic/openclaw/tools/acp-agents
- **BREAKING:** Plugin SDK removed `api.registerHttpHandler(...)`. Plugins must register explicit HTTP routes via `api.registerHttpRoute({ path, auth, match, handler })`, and dynamic webhook lifecycles should use `registerPluginHttpRoute(...)`.
- **BREAKING:** Zalo Personal plugin (`@kibo/zalouser`) no longer depends on external `zca`-compatible CLI binaries (`openzca`, `zca-cli`) for runtime send/listen/login; operators should use `kibo channels login --channel zalouser` after upgrade to refresh sessions in the new JS-native path.

## 2026.3.1

### Changes

- OpenAI/Streaming transport: make `openai` Responses WebSocket-first by default (`transport: "auto"` with SSE fallback), add shared OpenAI WS stream/connection runtime wiring with per-session cleanup, and preserve server-side compaction payload mutation (`store` + `context_management`) on the WS path.
- Gateway/Container probes: add built-in HTTP liveness/readiness endpoints (`/health`, `/healthz`, `/ready`, `/readyz`) for Docker/Kubernetes health checks, with fallback routing so existing handlers on those paths are not shadowed..
- Android/Nodes: add `camera.list`, `device.permissions`, `device.health`, and `notifications.actions` (`open`/`dismiss`/`reply`) on Android nodes, plus first-class node-tool actions for the new device/notification commands..
- Discord/Thread bindings: replace fixed TTL lifecycle with inactivity (`idleHours`, default 24h) plus optional hard `maxAgeHours` lifecycle controls, and add `/session idle` + `/session max-age` commands for focused thread-bound sessions..
- Telegram/DM topics: add per-DM `direct` + topic config (allowlists, `dmPolicy`, `skills`, `systemPrompt`, `requireTopic`), route DM topics as distinct inbound/outbound sessions, and enforce topic-aware authorization/debounce for messages, callbacks, commands, and reactions. Landed from contributor PR #30579 by..
- Android/Gateway capability refresh: add live Android capability integration coverage and node canvas capability refresh wiring, plus runtime hardening for A2UI readiness retries, scoped canvas URL normalization, debug diagnostics JSON, and JavaScript MIME delivery..
- Android/Nodes parity: add `system.notify`, `photos.latest`, `contacts.search`/`contacts.add`, `calendar.events`/`calendar.add`, and `motion.activity`/`motion.pedometer`, with motion sensor-aware command gating and improved activity sampling reliability..
- Agents/Thinking defaults: set `adaptive` as the default thinking level for Anthropic Claude 4.6 models (including Bedrock Claude 4.6 refs) while keeping other reasoning-capable models at `low` unless explicitly configured.
- Web UI/Cron i18n: localize cron page labels, filters, form help text, and validation/error messaging in English and zh-CN..
- CLI/Config: add `kibo config file` to print the active config file path resolved from `KIBO_CONFIG_PATH` or the default location..
- Feishu/Docx tables + uploads: add `feishu_doc` actions for Docx table creation/cell writing (`create_table`, `write_table_cells`, `create_table_with_values`) and image/file uploads (`upload_image`, `upload_file`) with stricter create/upload error handling for missing `document_id` and placeholder cleanup failures..
- Feishu/Reactions: add inbound `im.message.reaction.created_v1` handling, route verified reactions through synthetic inbound turns, and harden verification with timeout + fail-closed filtering so non-bot or unverified reactions are dropped..
- Feishu/Chat tooling: add `feishu_chat` tool actions for chat info and member queries, with configurable enablement under `channels.feishu.tools.chat`..
- Feishu/Doc permissions: support optional owner permission grant fields on `feishu_doc` create and report permission metadata only when the grant call succeeds, with regression coverage for success/failure/omitted-owner paths..
- Web UI/i18n: add German (`de`) locale support and auto-render language options from supported locale constants in Overview settings..
- Tools/Diffs: add a new optional `diffs` plugin tool for read-only diff rendering from before/after text or unified patches, with gateway viewer URLs for canvas and PNG image output..
- Memory/LanceDB: support custom OpenAI `baseUrl` and embedding dimensions for LanceDB memory. and.
- ACP/ACPX streaming: pin ACPX plugin support to `0.1.15`, add configurable ACPX command/version probing, and streamline ACP stream delivery (`final_only` default + reduced tool-event noise) with matching runtime and test updates..
- Shell env markers: set `KIBO_SHELL` across shell-like runtimes (`exec`, `acp`, `acp-client`, `tui-local`) so shell startup/config rules can target Kibo contexts consistently, and document the markers in env/exec/acp/TUI docs..
- Cron/Heartbeat light bootstrap context: add opt-in lightweight bootstrap mode for automation runs (`--light-context` for cron agent turns and `agents.*.heartbeat.lightContext` for heartbeat), keeping only `HEARTBEAT.md` for heartbeat runs and skipping bootstrap-file injection for cron lightweight runs..
- OpenAI/WebSocket warm-up: add optional OpenAI Responses WebSocket warm-up (`response.create` with `generate:false`), enable it by default for `openai/*`, and expose `params.openaiWsWarmup` for per-model enable/disable control.
- Agents/Subagents runtime events: replace ad-hoc subagent completion system-message handoff with typed internal completion events (`task_completion`) that are rendered consistently across direct and queued announce paths, with gateway/CLI plumbing for structured `internalEvents`.

### Fixes

- Feishu/Streaming card text fidelity: merge throttled/fragmented partial updates without dropping content and avoid newline injection when stitching chunk-style deltas so card-stream output matches final reply text..
- Security/Feishu webhook ingress: bound unauthenticated webhook rate-limit state with stale-window pruning and a hard key cap to prevent unbounded pre-auth memory growth from rotating source keys..
- Security/Compaction audit: remove the post-compaction audit injection message. and.
- Web tools/RFC2544 fake-IP compatibility: allow RFC2544 benchmark range (`198.18.0.0/15`) for trusted web-tool fetch endpoints so proxy fake-IP networking modes do not trigger false SSRF blocks. Landed from contributor PR #31176 by..
- Feishu/Sessions announce group targets: normalize `group:` and `channel:` Feishu targets to `chat_id` routing so `sessions_send` announce delivery no longer sends group chat IDs via `user_id` API params. Fixes #31426.
- Windows/Plugin install: avoid `spawn EINVAL` on Windows npm/npx invocations by resolving to `node` + npm CLI scripts instead of spawning `.cmd` directly. Landed from contributor PR #31147 by..
- Web UI/Cron: include configured agent model defaults/fallbacks in cron model suggestions so scheduled-job model autocomplete reflects configured models..
- Cron/Delivery: disable the agent messaging tool when `delivery.mode` is `"none"` so cron output is not sent to Telegram or other channels..
- CLI/Cron: clarify `cron list` output by renaming `Agent` to `Agent ID` and adding a `Model` column for isolated agent-turn jobs..
- Gateway/Control UI origins: honor `gateway.controlUi.allowedOrigins: ["*"]` wildcard entries (including trimmed values) and lock behavior with regression tests. Landed from contributor PR #31058 by..
- Agents/Sessions list transcript paths: handle missing/non-string/relative `sessions.list.path` values and per-agent `{agentId}` templates when deriving `transcriptPath`, so cross-agent session listings resolve to concrete agent session files instead of workspace-relative paths..
- Gateway/Control UI CSP: allow required Google Fonts origins in Control UI CSP..
- CLI/Install: add an npm-link fallback to fix CLI startup `Permission denied` failures (`exit 127`) on affected installs. and.
- Plugins/NPM spec install: fix npm-spec plugin installs when `npm pack` output is empty by detecting newly created `.tgz` archives in the pack directory. and.
- Plugins/Install: clear stale install errors when an npm package is not found so follow-up install attempts report current state correctly..
- Gateway/macOS supervised restart: actively `launchctl kickstart -k` during intentional supervised restarts to bypass LaunchAgent `ThrottleInterval` delays, and fall back to in-process restart when kickstart fails. Landed from contributor PR #29078 by..
- Sessions/Internal routing: preserve established external `lastTo`/`lastChannel` routes for internal/non-deliverable turns, with added coverage for no-fallback internal routing behavior. Landed from contributor PR #30941 by..
- Auto-reply/NO_REPLY: strip `NO_REPLY` token from mixed-content messages instead of leaking raw control text to end users. Landed from contributor PR #31080 by..
- Inbound metadata/Multi-account routing: include `account_id` in trusted inbound metadata so multi-account channel sessions can reliably disambiguate the receiving account in prompt context. Landed from contributor PR #30984 by..
- Cron/Delivery mode none: send explicit `delivery: { mode: "none" }` from cron editor for both add and update flows so previous announce delivery is actually cleared. Landed from contributor PR #31145 by..
- Cron editor viewport: make the sticky cron edit form independently scrollable with viewport-bounded height so lower fields/actions are reachable on shorter screens. Landed from contributor PR #31133 by..
- Agents/Thinking fallback: when providers reject unsupported thinking levels without enumerating alternatives, retry with `think=off` to avoid hard failure during model/provider fallback chains. Landed from contributor PR #31002 by..
- Agents/Failover reason classification: avoid false rate-limit classification from incidental `tpm` substrings by matching TPM as a standalone token/phrase and keeping auth-context errors on the auth path. Landed from contributor PR #31007 by..
- Gateway/WS: close repeated post-handshake `unauthorized role:*` request floods per connection and sample duplicate rejection logs, preventing a single misbehaving client from degrading gateway responsiveness., and.
- Gateway/Auth: improve device-auth v2 migration diagnostics so operators get clearer guidance when legacy clients connect..
- CLI/Ollama config: allow `config set` for Ollama `apiKey` without predeclared provider config..
- Agents/Ollama: demote empty-discovery logging from `warn` to `debug` to reduce noisy warnings in normal edge-case discovery flows..
- Sandbox/Browser Docker: pass `KIBO_BROWSER_NO_SANDBOX=1` to sandbox browser containers and bump sandbox browser security hash epoch so existing containers are recreated and pick up the env on upgrade..
- Tools/Edit workspace boundary errors: preserve the real `Path escapes workspace root` failure path instead of surfacing a misleading access/file-not-found error when editing outside workspace roots. Landed from contributor PR #31015 by..
- Browser/Open & navigate: accept `url` as an alias parameter for `open` and `navigate`..
- Sandbox/mkdirp boundary checks: allow directory-safe boundary validation for existing in-boundary subdirectories, preventing false `cannot create directories` failures in sandbox write mode..
- Android/Nodes reliability: reject `facing=both` when `deviceId` is set to avoid mislabeled duplicate captures, allow notification `open`/`reply` on non-clearable entries while still gating dismiss, trigger listener rebind before notification actions, and scale invoke-result ack timeout to invoke budget for large clip payloads..
- LINE/Voice transcription: classify M4A voice media as `audio/mp4` (not `video/mp4`) by checking the MPEG-4 `ftyp` major brand (`M4A ` / `M4B `), restoring voice transcription for LINE voice messages. Landed from contributor PR #31151 by..
- Slack/Announce target account routing: enable session-backed announce-target lookup for Slack so multi-account announces resolve the correct `accountId` instead of defaulting to bot-token context. Landed from contributor PR #31028 by..
- Android/Voice screen TTS: stream assistant speech via ElevenLabs WebSocket in Talk Mode, stop cleanly on speaker mute/barge-in, and ignore stale out-of-order stream events..
- Android/Photos permissions: declare Android 14+ selected-photo access permission (`READ_MEDIA_VISUAL_USER_SELECTED`) and align Android permission/settings paths with current minSdk behavior for more reliable permission state handling.
- Feishu/Reply media attachments: send Feishu reply `mediaUrl`/`mediaUrls` payloads as attachments alongside text/streamed replies in the reply dispatcher, including legacy fallback when `mediaUrls` is empty..
- Slack/User-token resolution: normalize Slack account user-token sourcing through resolved account metadata (`SLACK_USER_TOKEN` env + config) so monitor reads, Slack actions, directory lookups, onboarding allow-from resolution, and capabilities probing consistently use the effective user token..
- Feishu/Outbound session routing: stop assuming bare `oc_` identifiers are always group chats, honor explicit `dm:`/`group:` prefixes for `oc_` chat IDs, and default ambiguous bare `oc_` targets to direct routing to avoid DM session misclassification..
- Feishu/Group session routing: add configurable group session scopes (`group`, `group_sender`, `group_topic`, `group_topic_sender`) with legacy `topicSessionMode=enabled` compatibility so Feishu group conversations can isolate sessions by sender/topic as configured..
- Feishu/Reply-in-thread routing: add `replyInThread` config (`disabled|enabled`) for group replies, propagate `reply_in_thread` across text/card/media/streaming sends, and align topic-scoped session routing so newly created reply threads stay on the same session root..
- Feishu/Probe status caching: cache successful `probeFeishu()` bot-info results for 10 minutes (bounded cache with per-account keying) to reduce repeated status/onboarding probe API calls, while bypassing cache for failures and exceptions..
- Feishu/Opus media send type: send `.opus` attachments with `msg_type: "audio"` (instead of `"media"`) so Feishu voice messages deliver correctly while `.mp4` remains `msg_type: "media"` and documents remain `msg_type: "file"`..
- Feishu/Mobile video media type: treat inbound `message_type: "media"` as video-equivalent for media key extraction, placeholder inference, and media download resolution so mobile-app video sends ingest correctly..
- Feishu/Inbound sender fallback: fall back to `sender_id.user_id` when `sender_id.open_id` is missing on inbound events, and use ID-type-aware sender lookup so mobile-delivered messages keep stable sender identity/routing..
- Feishu/Reply context metadata: include inbound `parent_id` and `root_id` as `ReplyToId`/`RootMessageId` in inbound context, and parse interactive-card quote bodies into readable text when fetching replied messages..
- Feishu/Post embedded media: extract `media` tags from inbound rich-text (`post`) messages and download embedded video/audio files alongside existing embedded-image handling, with regression coverage..
- Feishu/Local media sends: propagate `mediaLocalRoots` through Feishu outbound media sending into `loadWebMedia` so local path attachments work with post-CVE local-root enforcement..
- Feishu/Group wildcard policy fallback: honor `channels.feishu.groups["*"]` when no explicit group match exists so unmatched groups inherit wildcard reply-policy settings instead of falling back to global defaults..
- Feishu/Inbound media regression coverage: add explicit tests for message resource type mapping (`image` stays `image`, non-image maps to `file`) to prevent reintroducing unsupported Feishu `type=audio` fetches. (#16311, #8746).
- TTS/Voice bubbles: use opus output and enable `audioAsVoice` routing for Feishu and WhatsApp (in addition to Telegram) so supported channels receive voice-bubble playback instead of file-style audio attachments..
- Telegram/Reply media context: include replied media files in inbound context when replying to media, defer reply-media downloads to debounce flush, gate reply-media fetch behind DM authorization, and preserve replied media when non-vision sticker fallback runs (including cached-sticker paths)..
- Android/Nodes notification wake flow: enable Android `system.notify` default allowlist, emit `notifications.changed` events for posted/removed notifications (excluding Kibo app-owned notifications), canonicalize notification session keys before enqueue/wake routing, and skip heartbeat wakes when consecutive notification summaries dedupe..
- Telegram/Voice fallback reply chunking: apply reply reference, quote text, and inline buttons only to the first fallback text chunk when voice delivery is blocked, preventing over-quoted multi-chunk replies. Landed from contributor PR #31067 by..
- Feishu/Multi-account + reply reliability: add `channels.feishu.defaultAccount` outbound routing support with schema validation, keep quoted-message extraction text-first (post/interactive/file placeholders instead of raw JSON), route Feishu video sends as `msg_type: "file"`, and avoid websocket event blocking by using non-blocking event handling in monitor dispatch. Landed from contributor PRs #29610, #30432, #30331, and #29501., and.
- Feishu/Inbound rich-text parsing: preserve `share_chat` payload summaries when available and add explicit parsing for rich-text `code`/`code_block`/`pre` tags so forwarded and code-heavy messages keep useful context in agent input..
- Feishu/Post markdown parsing: parse rich-text `post` payloads through a shared markdown-aware parser with locale-wrapper support, preserved mention/image metadata extraction, and inline/fenced code fidelity for agent input rendering..
- Telegram/Outbound chunking: route oversize splitting through the shared outbound pipeline (including subagents), retry Telegram sends when escaped HTML exceeds limits, and preserve boundary whitespace when retry re-splitting rendered chunks so plain-text/transcript fidelity is retained. (#29342, #27317; follow-up to #27461).
- Slack/Native commands: register Slack native status as `/agentstatus` (Slack-reserved `/status`) so manifest slash command registration stays valid while text `/status` still works. Landed from contributor PR #29032 by..
- Android/Camera clip: remove `camera.clip` HTTP-upload fallback to base64 so clip transport is deterministic and fail-loud, and reject non-positive `maxWidth` values so invalid inputs fall back to the safe resize default..
- Android/Gateway canvas capability refresh: send `node.canvas.capability.refresh` with object `params` (`{}`) from Android node runtime so gateway object-schema validation accepts refresh retries and A2UI host recovery works after scoped capability expiry..
- Onboarding/Custom providers: improve verification reliability for slower local endpoints (for example Ollama) during setup..
- Daemon/macOS TLS certs: default LaunchAgent service env `NODE_EXTRA_CA_CERTS` to `/etc/ssl/cert.pem` (while preserving explicit overrides) so HTTPS clients no longer fail with local-issuer errors under launchd..
- Daemon/Linux systemd user-bus fallback: when `systemctl --user` cannot reach the user bus due missing session env, fall back to `systemctl --machine <user>@ --user` so daemon checks/install continue in headless SSH/server sessions..
- Gateway/Linux restart health: reduce false `kibo gateway restart` timeouts by falling back to `ss -ltnp` when `lsof` is missing, confirming ambiguous busy-port cases via local gateway probe, and targeting the original `SUDO_USER` systemd user scope for restart commands..
- Discord/Components wildcard handlers: use distinct internal registration sentinel IDs and parse those sentinels as wildcard keys so select/user/role/channel/mentionable/modal interactions are not dropped by raw customId dedupe paths. Landed from contributor PR #29459 by..
- Feishu/Reaction notifications: add `channels.feishu.reactionNotifications` (`off | own | all`, default `own`) so operators can disable reaction ingress or allow all verified reaction events (not only bot-authored message reactions)..
- Feishu/Typing backoff: re-throw Feishu typing add/remove rate-limit and quota errors (`429`, `99991400`, `99991403`) and detect SDK non-throwing backoff responses so the typing keepalive circuit breaker can stop retries instead of looping indefinitely..
- Feishu/Zalo runtime logging: replace direct `console.log/error` usage in Feishu typing-indicator paths and Zalo monitor paths with runtime-gated logger calls so verbosity controls are respected while preserving typing backoff behavior..
- Feishu/Group sender allowlist fallback: add global `channels.feishu.groupSenderAllowFrom` sender authorization for group chats, with per-group `groups.<id>.allowFrom` precedence and regression coverage for allow/block/precedence behavior..
- Feishu/Docx append/write ordering: insert converted Docx blocks sequentially (single-block creates) so Feishu append/write preserves markdown block order instead of returning shuffled sections in asynchronous batch inserts. (#26172, #26022).
- Feishu/Docx convert fallback chunking: recursively split oversized markdown chunks (including long no-heading sections) when `document.convert` hits content limits, while keeping fenced-code-aware split boundaries whenever possible..
- Feishu/API quota controls: add `typingIndicator` and `resolveSenderNames` config flags (top-level and per-account) so operators can disable typing reactions and sender-name lookup requests while keeping default behavior unchanged..
- Feishu/System preview prompt leakage: stop enqueuing inbound Feishu message previews as system events so user preview text is not injected into later turns as trusted `System:` context. Landed from contributor PR #31209 by..
- Feishu/Typing replay suppression: skip typing indicators for stale replayed inbound messages after compaction using message-age checks with second/millisecond timestamp normalization, preventing old-message reaction floods while preserving typing for fresh messages. Landed from contributor PR #30709 by..
- Control UI/Debug log layout: render Debug Event Log payloads at full width to prevent payload JSON from being squeezed into a narrow side column. Landed from contributor PR #30978 by..
- Install/npm: fix npm global install deprecation warnings..
- Update/Global npm: fallback to `--omit=optional` when global `npm update` fails so optional dependency install failures no longer abort update flows. and.
- Model directives/Auth profiles: split `/model` profile suffixes at the first `@` after the last slash so email-based auth profile IDs (for example OAuth profile IDs) resolve correctly. Landed from contributor PR #30932 by..
- Ollama/Embedded runner base URL precedence: prioritize configured provider `baseUrl` over model defaults for embedded Ollama runs so Docker and remote-host setups avoid localhost fetch failures..
- Ollama/Autodiscovery: harden autodiscovery and warning behavior. and.
- Ollama/Context window: unify context window handling across discovery, merge, and OpenAI-compatible transport paths., and.
- fix(model): preserve reasoning in provider fallback resolution. Fixes #25636..
- Docker/Image permissions: normalize `/app/extensions`, `/app/.agent`, and `/app/.agents` to directory mode `755` and file mode `644` during image build so plugin discovery does not block inherited world-writable paths. Fixes #30139..
- OpenAI Responses/Compaction: rewrite and unify the OpenAI Responses store patches to treat empty `baseUrl` as non-direct, honor `compat.supportsStore=false`, and auto-inject server-side compaction `context_management` for compatible direct OpenAI models (with per-model opt-out/threshold overrides). Landed from contributor PRs #16930 (@OiPunk), #22441 (@EdwardWu7), and #25088 (@MoerAI)., and.
- Agents/Compaction safeguard: preserve recent turns verbatim with stable user/assistant pairing, keep multimodal and tool-result hints in preserved tails, and avoid empty-history fallback text in compacted output..
- Usage normalization: clamp negative prompt/input token values to zero (including `prompt_tokens` alias inputs) so `/usage` and TUI usage displays cannot show nonsensical negative counts. Landed from contributor PR #31211 by..
- Secrets/Auth profiles: normalize inline SecretRef `token`/`key` values to canonical `tokenRef`/`keyRef` before persistence, and keep explicit `keyRef` precedence when inline refs are also present. Landed from contributor PR #31047 by..
- Codex/Usage window: label weekly usage window as `Week` instead of `Day`..
- Signal/Sync message null-handling: treat `syncMessage` presence (including `null`) as sync envelope traffic so replayed sentTranscript payloads cannot bypass loop guards after daemon restart. Landed from contributor PR #31138 by..
- Infra/fs-safe: sanitize directory-read failures so raw `EISDIR` text never leaks to messaging surfaces, with regression tests for both root-scoped and direct safe reads. Landed from contributor PR #31205 by..

### Breaking

- **BREAKING:** Node exec approval payloads now require `systemRunPlan`. `host=node` approval requests without that plan are rejected.
- **BREAKING:** Node `system.run` execution now pins path-token commands to the canonical executable path (`realpath`) in both allowlist and approval execution flows. Integrations/tests that asserted token-form argv (for example `tr`) must now accept canonical paths (for example `/usr/bin/tr`).

## 2026.2.27

### Changes

- Models/OpenAI forward compat: add support for `openai/gpt-5.4`, `openai/gpt-5.4-pro`, and `openai-codex/gpt-5.4`, including direct OpenAI Responses `serviceTier` passthrough safeguards for valid values..
- Android/Play package ID: rename the Android app package to `ai.kibo.app`, including matching benchmark and Android tooling references for Play publishing..

### Fixes

- Gateway/macOS restart: remove self-issued `launchctl kickstart -k` from launchd supervised restart path to prevent race with launchd's async bootout state machine that permanently unloads the LaunchAgent. With `ThrottleInterval=1` (current default), `exit(0)` + `KeepAlive=true` restarts the service within ~1s without the race condition. Landed from contributor PR #39763 by..
- Plugin SDK/bundled subpath contracts: add regression coverage for newly routed bundled-plugin SDK exports so BlueBubbles, Mattermost, Nextcloud Talk, and Twitch subpath symbols stay pinned during future plugin-sdk cleanup.
- Exec/system.run env sanitization: block dangerous override-only env pivots such as `GIT_SSH_COMMAND`, editor/pager hooks, and `GIT_CONFIG_` / `NPM_CONFIG_` override prefixes so allowlisted tools cannot smuggle helper command execution through subprocess environment overrides. and for reporting.
- Network/fetch guard redirect auth stripping: switch cross-origin redirect handling in `fetchWithSsrFGuard` from a narrow sensitive-header denylist to a safe-header allowlist so custom auth headers like `X-Api-Key` and `Private-Token` no longer leak on origin changes. for reporting.
- Security/Sandbox media reads: eliminate sandbox media TOCTOU symlink-retarget escapes by enforcing root-scoped boundary-safe reads at attachment/image load time and consolidating shared safe-read helpers across sandbox media callsites. This ships in the next npm release. for reporting.
- Security/Sandbox media staging: block destination symlink escapes in `stageSandboxMedia` by replacing direct destination copies with root-scoped safe writes for both local and SCP-staged attachments, preventing out-of-workspace file overwrite through `media/inbound` alias traversal. This ships in the next npm release (`2026.3.2`). for reporting.
- Security/Sandbox fs bridge: harden sandbox `readFile`, `mkdirp`, `remove`, and `rename` operations by pinning reads to boundary-opened file descriptors and anchoring filesystem changes to verified canonical parent directories plus basenames instead of passing mutable full path strings to `mkdir -p`, `rm`, and `mv`, reducing TOCTOU race exposure in sandbox file operations. This ships in the next npm release. for reporting.
- Security/Workspace safe writes: harden `writeFileWithinRoot` against symlink-retarget TOCTOU races by opening existing files without truncation, creating missing files with exclusive create, deferring truncation until post-open identity+boundary validation, and removing out-of-root create artifacts on blocked races; added regression tests for truncate/create race paths. This ships in the next npm release (`2026.3.2`). for reporting.
- Security/Subagents sandbox inheritance: block sandboxed sessions from spawning cross-agent subagents that would run unsandboxed, preventing runtime sandbox downgrade via `sessions_spawn agentId`. for reporting.
- Browser/Security: fail closed on browser-control auth bootstrap errors; if auto-auth setup fails and no explicit token/password exists, browser control server startup now aborts instead of starting unauthenticated. This ships in the next npm release..
- Security/ACPX Windows spawn hardening: resolve `.cmd/.bat` wrappers via PATH/PATHEXT and execute unwrapped Node/EXE entrypoints without shell parsing when possible, and enable strict fail-closed handling (`strictWindowsCmdWrapper`) by default for unresolvable wrappers on Windows (with explicit opt-out for compatibility). This ships in the next npm release. for reporting.
- Security/Web search citation redirects: enforce strict SSRF defaults for Gemini citation redirect resolution so redirects to localhost/private/internal targets are blocked. for reporting.
- Security/Node metadata policy: harden node platform classification against Unicode confusables and switch unknown platform defaults to a conservative allowlist that excludes `system.run`/`system.which` unless explicitly allowlisted, preventing metadata canonicalization drift from broadening node command permissions. for reporting.
- Security/Skills: harden skill installer metadata parsing by rejecting unsafe installer specs (brew/node/go/uv/download) and constrain plugin-declared skill directories to the plugin root (including symlink-escape checks), with regression coverage.
- Sandbox/noVNC hardening: increase observer password entropy, shorten observer token lifetime, and replace noVNC token redirect with a bootstrap page that keeps credentials out of `Location` query strings and adds strict no-cache/no-referrer headers.
- Security/Logging utility hardening: remove `eval`-based command execution from `scripts/clawlog.sh`, switch to argv-safe command construction, and escape predicate literals for user-supplied search/category filters to block local command/predicate injection paths.
- Slack/Security ingress mismatch guard: drop slash-command and interaction payloads when app/team identifiers do not match the active Slack account context (including nested `team.id` interaction payloads), preventing cross-app or cross-workspace payload injection into system-event handling..
- Security/Inbound metadata stripping: tighten sentinel matching and JSON-fence validation for inbound metadata stripping so user-authored lookalike lines no longer trigger unintended metadata removal.
- Security/External content marker folding: expand Unicode angle-bracket homoglyph normalization in marker sanitization so additional guillemet, double-angle, tortoise-shell, flattened-parenthesis, and ornamental variants are folded before boundary replacement..
- Security/Zalo webhook memory hardening: bound webhook security tracking state and normalize security keying to matched webhook paths (excluding attacker query-string churn) to prevent unauthenticated memory growth pressure on reachable webhook endpoints..
- Security/Audit: flag `gateway.controlUi.allowedOrigins=["*"]` as a high-risk configuration (severity based on bind exposure), and add a Feishu doc-tool warning that `owner_open_id` on `feishu_doc` create can grant document permissions.
- Hooks/auth throttling: reject non-`POST` `/hooks/*` requests before auth-failure accounting so unsupported methods can no longer burn the hook auth lockout budget and block legitimate webhook delivery. for reporting.
- Feishu/Doc create permissions: remove caller-controlled owner fields from `feishu_doc` create and bind optional grant behavior to trusted Feishu requester context (`grant_to_requester`), preventing principal selection via tool arguments..
- Dashboard/macOS auth handling: switch the macOS "Open Dashboard" flow from query-string token injection to URL fragments, stop persisting Control UI gateway tokens in browser localStorage, and scrub legacy stored tokens on load. for reporting.
- Gateway/Plugin HTTP auth hardening: require gateway auth for protected plugin paths and explicit `registerHttpRoute` paths (while preserving wildcard-handler behavior for signature-auth webhooks), and run plugin handlers after built-in handlers for deterministic route precedence. Landed from contributor PR #29198..
- Gateway/Upgrade migration for Control UI origins: seed `gateway.controlUi.allowedOrigins` on startup for legacy non-loopback configs (`lan`/`tailnet`/`custom`) when origins are missing or blank, preventing post-upgrade crash loops while preserving explicit existing policy. Landed from contributor PR #29394..
- Gateway/Config patch guard: reject `config.patch` updates that set non-loopback `gateway.bind` while `gateway.tailscale.mode` is `serve`/`funnel`, preventing restart crash loops from invalid bind/tailscale combinations. Landed from contributor PR #30910..
- Gateway/Tailscale onboarding origin allowlist: auto-add the detected Tailnet HTTPS origin during interactive configure/onboarding flows (including IPv6-safe origin formatting and binary-path reuse), so Tailscale serve/funnel Control UI access works without manual `allowedOrigins` edits. Landed from contributor PR #26157..
- Web UI/Assistant text: strip internal `<relevant-memories>...</relevant-memories>` scaffolding from rendered assistant messages (while preserving code-fence literals), preventing memory-context leakage in chat output for models that echo internal blocks..
- Dashboard/Sessions: allow authenticated Control UI clients to delete and patch sessions while still blocking regular webchat clients from session mutation RPCs, fixing Dashboard session delete failures..
- Web UI/Control UI WebSocket defaults: include normalized `gateway.controlUi.basePath` (or inferred nested route base path) in the default `gatewayUrl` so first-load dashboard connections work behind path-based reverse proxies..
- Gateway/Control UI API routing: when `gateway.controlUi.basePath` is unset (default), stop serving Control UI SPA HTML for `/api` and `/api/*` so API paths fall through to normal gateway handlers/404 responses instead of `index.html`. Fixes #30295..
- Node host/service auth env: include `KIBO_GATEWAY_TOKEN` in `kibo node install` service environments (with `KIBOBOT_GATEWAY_TOKEN` compatibility fallback) so installed node services keep remote gateway token auth across restart/reboot. Fixes #31041. for reporting, and.
- Gateway/Control UI origins: support wildcard `"*"` in `gateway.controlUi.allowedOrigins` for trusted remote access setups. Landed from contributor PR #31088..
- Gateway/Cron auditability: add gateway info logs for successful cron create, update, and remove operations..
- Control UI/Cron editor: include `{ mode: "none" }` in `cron.update` patches when editing an existing job and selecting "Result delivery = None (internal)", so saved jobs no longer keep stale announce delivery mode. Fixes #31075.
- Feishu/Multi-account + reply reliability: add `channels.feishu.defaultAccount` outbound routing support with schema validation, prevent inbound preview text from leaking into prompt system events, keep quoted-message extraction text-first (post/interactive/file placeholders instead of raw JSON), route Feishu video sends as `msg_type: "file"`, and avoid websocket event blocking by using non-blocking event handling in monitor dispatch. Landed from contributor PRs #31209, #29610, #30432, #30331, and #29501., and.
- Feishu/Target routing + replies + dedupe: normalize provider-prefixed targets (`feishu:`/`lark:`), prefer configured `channels.feishu.defaultAccount` for tool execution, honor Feishu outbound `renderMode` in adapter text/caption sends, fall back to normal send when reply targets are withdrawn/deleted, and add synchronous in-memory dedupe guard for concurrent duplicate inbound events. Landed from contributor PRs #30428, #30438, #29958, #30444, and #29463. and.
- Channels/Multi-account default routing: add optional `channels.<channel>.defaultAccount` default-selection support across message channels so omitted `accountId` routes to an explicit configured account instead of relying on implicit first-entry ordering (fallback behavior unchanged when unset).
- Telegram/Multi-account fallback isolation: fail closed for non-default Telegram accounts when route resolution falls back to `matchedBy=default`, preventing cross-account DM/session contamination without explicit account bindings.
- Telegram/DM topic session isolation: scope DM topic thread session keys by chat ID (`<chatId>:<threadId>`) and parse scoped thread IDs in outbound recovery so parallel DMs cannot collide on shared topic IDs. Landed from contributor PR #31064..
- Telegram/Multi-account group isolation: prevent channel-level `groups` config from leaking across Telegram accounts in multi-account setups, avoiding cross-account group routing drops. Landed from contributor PR #30677..
- Telegram/Group allowlist ordering: evaluate chat allowlist before sender allowlist enforcement so explicitly allowlisted groups are not fail-closed by empty sender allowlists. Landed from contributor PR #30680..
- Telegram/Empty final replies: skip outbound send for null/undefined final text payloads without media so Telegram typing indicators do not linger on `text must be non-empty` errors, with added regression coverage for undefined final payload dispatch. Landed from contributor PRs #30969 and #30746. and.
- Telegram/Voice caption overflow fallback: recover from `sendVoice` caption length errors by re-sending voice without caption and delivering text separately so replies are not lost. Landed from contributor PR #31131..
- Telegram/Reply `first` chunking: apply `replyToMode: "first"` reply targets only to the first Telegram text/media/fallback chunk, avoiding multi-chunk over-quoting in split replies. Landed from contributor PR #31077..
- Telegram/Proxy dispatcher preservation: preserve proxy-aware global undici dispatcher behavior in Telegram network workarounds so proxy-backed Telegram + model traffic is not broken by dispatcher replacement. Landed from contributor PR #30367..
- Telegram/Media fetch IPv4 fallback: retry Telegram media fetches once with IPv4-first dispatcher settings when dual-stack connect errors (`ETIMEDOUT`/`ENETUNREACH`/`EHOSTUNREACH`) occur, improving reliability on broken IPv6 routes. Landed from contributor PR #30554..
- Telegram/Restart polling teardown: stop the Telegram bot instance when a polling cycle exits so in-process SIGUSR1 restarts fully tear down old long-poll loops before restart, reducing post-restart `getUpdates` 409 conflict storms. Fixes #31107. Landed from contributor PR #31141..
- Google Chat/Thread replies: set `messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD` on threaded sends so replies attach to existing threads instead of silently failing thread placement. Landed from contributor PR #30965..
- Mattermost/Private channel policy routing: map Mattermost private channel type `P` to group chat type so `groupPolicy`/`groupAllowFrom` gates apply correctly instead of being treated as open public channels. Landed from contributor PR #30891..
- Discord/Agent component interactions: accept Components v2 `cid` payloads alongside legacy `componentId`, and safely decode percent-encoded IDs without throwing on malformed `%` sequences. Landed from contributor PR #29013..
- Discord/Inbound media fallback: preserve attachment and sticker metadata when Discord CDN fetch/save fails by keeping URL-based media entries in context, with regression coverage for save failures and mixed success/failure ordering. Landed from contributor PR #28906..
- Matrix/Directory room IDs: preserve original room-ID casing for direct `!roomId` group lookups (without `:server`) so allowlist checks do not fail on case-sensitive IDs. Landed from contributor PR #31201..
- Slack/Subagent completion delivery: stop forcing bound conversation IDs into `threadId` so Slack completion announces do not send invalid `thread_ts` for DMs/top-level channels. Landed from contributor PR #31105..
- Signal/Loop protection: evaluate own-account detection before sync-message filtering (including UUID-only `accountUuid` configs) so `sentTranscript` sync events cannot bypass loop protection and self-reply loops. Landed from contributor PR #31093..
- Discord/DM command auth: unify DM allowlist + pairing-store authorization across message preflight and native command interactions so DM command gating is consistent for `open`/`pairing`/`allowlist` policies.
- Slack/download-file scoping: thread/channel-aware `download-file` actions now propagate optional scope context and reject downloads when Slack metadata definitively shows the file is outside the requested channel/thread, while preserving legacy behavior when share metadata is unavailable.
- Routing/Binding peer-kind parity: treat `peer.kind` `group` and `channel` as equivalent for binding scope matching (while keeping `direct` separate) so Slack/public channel bindings do not silently fall through. Landed from contributor PR #31135..
- Discord/Reconnect integrity: release Discord message listener lane immediately while preserving serialized handler execution, add HELLO-stall resume-first recovery with bounded fresh-identify fallback after repeated stalls, and extend lifecycle/listener regression coverage for forced reconnect scenarios. Landed from contributor PR #29508..
- Discord/Reconnect watchdog: add a shared armable transport stall-watchdog and wire Discord gateway lifecycle force-stop semantics for silent close/reconnect zombies, with gateway/lifecycle watchdog regression coverage and runtime status liveness updates. Follow-up to contributor PR #31025 by and PR #30530 by. and.
- Matrix/Conduit compatibility: avoid blocking startup on non-resolving Matrix sync start, preserve startup error propagation, prevent duplicate monitor listener registration, remove unreliable 2-member DM heuristics, accept `!room` IDs without alias resolution, and add matrix monitor/client regression coverage. Landed from contributor PR #31023..
- Slack/HTTP mode startup: treat Slack HTTP accounts as configured when `botToken` + `signingSecret` are present (without requiring `appToken`) in channel config/runtime status so webhook mode is not silently skipped..
- Slack/Socket reconnect reliability: reconnect Socket Mode after disconnect/start failures using bounded exponential backoff with abort-aware waits, while preserving clean shutdown behavior and adding disconnect/error helper tests..
- Slack/Thread session isolation: route channel/group top-level messages into thread-scoped sessions (`:thread:<ts>`) and read inbound `previousTimestamp` from the resolved thread session key, preventing cross-thread context bleed and stale timestamp lookups..
- Slack/Transient request errors: classify Slack request-error messages like `Client network socket disconnected before secure TLS connection was established` as transient in unhandled-rejection fatal detection, preventing temporary network drops from crash-looping the gateway..
- Slack/Disabled channel startup: skip Slack monitor socket startup entirely when `channels.slack.enabled=false` (including configs that still contain valid tokens), preventing disabled accounts from opening websocket connections..
- Telegram/Outbound API proxy env: keep the Node 22 `autoSelectFamily` global-dispatcher workaround while restoring env-proxy support by using `EnvHttpProxyAgent` so `HTTP_PROXY`/`HTTPS_PROXY` continue to apply to outbound requests. for reporting and and for work.
- Telegram/Thread fallback safety: when Telegram returns `message thread not found`, retry without `message_thread_id` only for DM-thread sends (not forum topics), and suppress first-attempt danger logs when retry succeeds. Landed from contributor PR #30892..
- Slack/Inbound media auth + HTML guard: keep Slack auth headers on forwarded shared attachment image downloads, and reject login/error HTML payloads (while allowing expected `.html` uploads) when resolving Slack media so auth failures do not silently pass as files..
- Slack/Bot attachment-only messages: when `allowBots: true`, bot messages with empty `text` now include non-forwarded attachment `text`/`fallback` content so webhook alerts are not silently dropped..
- Slack/Onboarding token help: update setup text to include the "From manifest" app-creation path and current install wording for obtaining the `xoxb-` bot token..
- Feishu/Docx editing tools: add `feishu_doc` positional insert, table row/column operations, table-cell merge, and color-text updates; switch markdown write/append/insert to Descendant API insertion with large-document batching; and harden image uploads for data URI/base64/local-path inputs with strict validation and routing-safe upload metadata..
- Discord/Allowlist diagnostics: add debug logs for guild/channel allowlist drops so operators can quickly identify ignored inbound messages and required allowlist entries. Landed from contributor PR #30966..
- Discord/Ack reactions: add Discord-account-level `ackReactionScope` override and support explicit `off`/`none` values in shared config schemas to disable ack reactions per account. Landed from contributor PR #30400..
- Discord/Forum thread tags: support `appliedTags` on Discord thread-create actions and map to `applied_tags` for forum/media starter posts, with targeted thread-creation regression coverage. Landed from contributor PR #30358..
- Discord/Application ID fallback: parse bot application IDs from token prefixes without numeric precision loss and use token fallback only on transport/timeout failures when probing `/oauth2/applications/@me`. Landed from contributor PR #29695..
- Discord/EventQueue timeout config: expose per-account `channels.discord.accounts.<id>.eventQueue.listenerTimeout` (and related queue options) so long-running handlers can avoid Carbon listener timeout drops. Landed from contributor PR #24270..
- Slack/Usage footer formatting: wrap session keys in inline code in full response-usage footers so Slack does not parse colon-delimited session segments as emoji shortcodes..
- Slack/Socket Mode slash startup: treat `app.options()` registration as best-effort and fall back to static arg menus when listener registration fails, preventing Slack monitor startup crash loops on receiver init edge cases..
- Slack/Legacy streaming config: map boolean `channels.slack.streaming=false` to unified streaming mode `off` (with `nativeStreaming=false`) so legacy configs correctly disable draft preview/native streaming instead of defaulting to `partial`..
- Cron/Failure delivery routing: add `failureAlert.mode` (`announce|webhook`) and `failureAlert.accountId` support, plus `cron.failureDestination` and per-job `delivery.failureDestination` routing with duplicate-target suppression, best-effort skip behavior, and global+job merge semantics. Landed from contributor PR #31059..
- Cron/announce delivery: stop duplicate completion announces when cron early-return paths already handled delivery, and replace descendant followup polling with push-based waits so cron summaries arrive without the old busy-loop fallback..
- Cron/Failure alerts: add configurable repeated-failure alerting with per-job overrides and Web UI cron editor support (`inherit|disabled|custom` with threshold/cooldown/channel/target fields)..
- Cron/Isolated model defaults: resolve isolated cron `subagents.model` (including object-form `primary`) through allowlist-aware model selection so isolated cron runs honor subagent model defaults unless explicitly overridden by job payload model..
- Cron/Announce delivery status: keep isolated cron runs in `ok` state when execution succeeds but announce delivery fails (for example transient `pairing required`), while preserving `delivered=false` and delivery error context for visibility..
- Cron/One-shot reliability: retry transient one-shot failures with bounded backoff and configurable retry policy before disabling..
- Cron/Schedule errors: notify users when a job is auto-disabled after repeated schedule computation failures..
- Cron/One-shot reschedule re-arm: allow completed `at` jobs to run again when rescheduled to a later time than `lastRunAtMs`, while keeping completed non-rescheduled one-shot jobs inactive..
- Cron/Store EBUSY fallback: retry `rename` on `EBUSY` and use `copyFile` fallback on Windows when replacing cron store files so busy-file contention no longer causes false write failures..
- Cron/Isolated payload selection: ignore `isError` payloads when deriving summary/output/delivery payload fallbacks, while preserving error-only fallback behavior when no non-error payload exists..
- Cron/Isolated CLI timeout ratio: avoid reusing persisted CLI session IDs on fresh isolated cron runs so the fresh watchdog profile is used and jobs do not abort at roughly one-third of configured `timeoutSeconds`..
- Cron/Session target guardrail: reject creating or patching `sessionTarget: "main"` cron jobs when `agentId` is not the default agent, preventing invalid cross-agent main-session bindings at write time..
- Cron/Reminder session routing: preserve `job.sessionKey` for `sessionTarget="main"` runs so queued reminders wake and deliver in the originating scoped session/channel instead of being forced to the agent main session.
- Cron/Timezone regression guard: add explicit schedule coverage for `0 8 * * *` with `Asia/Shanghai` to ensure `nextRunAtMs` never rolls back to a past year and always advances to the next valid occurrence.
- Cron/Isolated sessions list: persist the intended pre-run model/provider on isolated cron session entries so `sessions_list` reflects payload/session model overrides even when runs fail before post-run telemetry persistence..
- Cron tool/update flat params: recover top-level update patch fields when models omit the `patch` wrapper, and allow flattened update keys through tool input schema validation so `cron.update` no longer fails with `patch required` for valid flat payloads.
- Web UI/Cron jobs: add schedule-kind and last-run-status filters to the Jobs list, with reset control and client-side filtering over loaded results..
- Web UI/Chat sessions: add a cron-session visibility toggle in the session selector, fix cron-key detection across `cron:*` and `agent:*:cron:*` formats, and localize the new control labels/tooltips..
- Cron/Timer hot-loop guard: enforce a minimum timer re-arm delay when stale past-due jobs would otherwise trigger repeated `setTimeout(0)` loops, preventing event-loop saturation and log-flood behavior..
- Models/provider config precedence: prefer exact `models.providers.<name>` matches before normalized provider aliases in embedded model resolution, preventing alias/canonical key collisions from applying the wrong provider `api`, `baseUrl`, or headers..
- Models/Custom provider keys: trim custom provider map keys during normalization so image-capable models remain discoverable when provider keys are configured with leading/trailing whitespace. Landed from contributor PR #31202..
- Agents/Model fallback: classify additional network transport errors (`ECONNREFUSED`, `ENETUNREACH`, `EHOSTUNREACH`, `ENETRESET`, `EAI_AGAIN`) as failover-worthy so fallback chains advance when primary providers are unreachable. Landed from contributor PR #19077..
- Agents/Copilot token refresh: refresh GitHub Copilot runtime API tokens after auth-expiry failures and re-run with the renewed token so long-running embedded/subagent turns do not fail on mid-session 401 expiry. Landed from contributor PR #8805..
- Agents/Subagents delivery params: reject unsupported `sessions_spawn` channel-delivery params (`target`, `channel`, `to`, `threadId`, `replyTo`, `transport`) with explicit input errors so delivery intent does not silently leak output to the parent conversation.
- Agents/FS workspace default: honor documented host file-tool default `tools.fs.workspaceOnly=false` when unset so host `write`/`edit` calls are not incorrectly workspace-restricted unless explicitly enabled. Landed from contributor PR #31128..
- Sessions/Followup queue: always schedule followup drain even when unexpected runtime exceptions escape `runReplyAgent`, preventing silent stuck followup backlogs after failed turns.
- Sessions/Compaction safety: add transcript-size forced pre-compaction memory flush (`agents.defaults.compaction.memoryFlush.forceFlushTranscriptBytes`, default 2MB) so long sessions recover without manual transcript deletion when token snapshots are stale.
- Sessions/Usage accounting: persist `cacheRead`/`cacheWrite` from the latest call snapshot (`lastCallUsage`) instead of accumulated multi-call totals, preventing inflated token/cost reporting in long tool/compaction runs.
- Sessions/DM scope migration: when `session.dmScope` is non-`main`, retire stale `agent:*:main` delivery routing metadata once the matching direct-chat peer session is active, preventing duplicate Telegram/DM announce deliveries from legacy main sessions after scope migration.
- Agents/Session status: read thinking/verbose/reasoning levels from persisted session state in `session_status` output when resolved levels are not provided, so status reflects runtime toggles correctly..
- Agents/Tool-name recovery chain: normalize streamed alias/case tool names against the allowed set, preserve whitespace-only streamed placeholders to avoid collapsing to empty names, and repair/guard persisted blank `toolResult.toolName` values from matching tool calls to reduce repeated `Tool not found` loops in long sessions. Landed from contributor PRs #30620 and #30735, plus #30881. and.
- Agents/Sessions list transcript paths: resolve `sessions_list` `transcriptPath` via agent-aware session path options and ignore combined-store sentinel paths (`(multiple)`) so listed transcript paths always point to the state directory..
- Agents/Ollama discovery: skip Ollama discovery when explicit models are configured. and.
- Onboarding/Custom providers: raise default custom-provider model context window to the runtime hard minimum (16k) and auto-heal existing custom model entries below that threshold during reconfiguration, preventing immediate `Model context window too small (4096 tokens)` failures..
- Onboarding/Custom providers: use Azure OpenAI-specific verification auth/payload shape (`api-key`, deployment-path chat completions payload) when probing Azure endpoints so valid Azure custom-provider setup no longer fails preflight..
- Feishu/Onboarding SecretRef guards: avoid direct `.trim()` calls on object-form `appId`/`appSecret` in onboarding credential checks, keep status semantics strict when an account explicitly sets empty `appId` (no fallback to top-level `appId`), recognize env SecretRef `appId`/`appSecret` as configured so readiness is accurate, and preserve unresolved SecretRef errors in default account resolution for actionable diagnostics..
- Memory/Hybrid recall: when strict hybrid scoring yields no hits, preserve keyword-backed matches using a text-weight floor so freshly indexed lexical canaries no longer disappear behind `minScore` filtering..
- Feishu/Startup probes: serialize multi-account bot-info probes during monitor startup so large Feishu account sets do not burst `/open-apis/bot/v3/info`, bound startup probe latency/abort handling to avoid head-of-line stalls, and avoid triggering rate limits. (#26685, #29941).
- Android/Onboarding + voice reliability: request per-toggle onboarding permissions, update pairing guidance to `kibo devices list/approve`, restore assistant speech playback in mic capture flow, cancel superseded in-flight speech (mute + per-reply token rotation), and keep `talk.config` loads retryable after transient failures..
- Android/Notifications auth race: return `NOT_AUTHORIZED` when `POST_NOTIFICATIONS` is revoked between authorization precheck and delivery, instead of returning success while dropping the notification..
- Commands/Owner-only tools: treat identified direct-chat senders as owners when no owner allowlist is configured, while preserving internal `operator.admin` owner sessions.
- ACP/Harness thread spawn routing: force ACP harness thread creation through `sessions_spawn` (`runtime: "acp"`, `thread: true`) and explicitly forbid `message action=thread-create` for ACP harness requests, avoiding misrouted `Unknown channel` errors..
- Agents/Message tool scoping: include other configured channels in scoped `message` tool action enum + description so isolated/cron runs can discover and invoke cross-channel actions without schema validation failures. Landed from contributor PR #20840..
- Plugins/Discovery precedence: load bundled plugins before auto-discovered global extensions so bundled channel plugins win duplicate-ID resolution by default (explicit `plugins.load.paths` overrides remain highest precedence), with loader regression coverage. Landed from contributor PR #29710..
- CLI/Startup (Raspberry Pi + small hosts): speed up startup by avoiding unnecessary plugin preload on fast routes, adding root `--version` fast-path bootstrap bypass, parallelizing status JSON/non-JSON scans where safe, and enabling Node compile cache at startup with env override compatibility (`NODE_COMPILE_CACHE`, `NODE_DISABLE_COMPILE_CACHE`). and for raising startup reports, and for related startup work in #27973.
- CLI/Startup follow-up: add root `--help` fast-path bootstrap bypass with strict root-only matching, lazily resolve CLI channel options only when commands need them, merge build-time startup metadata (`dist/cli-startup-metadata.json`) with runtime catalog discovery so dynamic catalogs are preserved, and add low-power Linux doctor hints for compile-cache placement and respawn tuning..
- Docker/Compose gateway targeting: run `kibo-cli` in the `kibo-gateway` service network namespace, require gateway startup ordering, pin Docker setup to `gateway.mode=local`, sync `gateway.bind` from `KIBO_GATEWAY_BIND`, default optional `CLAUDE_*` compose vars to empty values to reduce automation warning noise, and harden `kibo-cli` with `cap_drop` (`NET_RAW`, `NET_ADMIN`) + `no-new-privileges`. Docs now call out the shared trust boundary explicitly. and.
- Docker/Image base annotations: add OCI labels for base image plus source/documentation/license metadata, include revision/version/created labels in Docker release builds, and document annotation keys/release context in install docs. Fixes #27945..
- Config/Legacy gateway bind aliases: normalize host-style `gateway.bind` values (`0.0.0.0`/`::`/`127.0.0.1`/`localhost`) to supported bind modes (`lan`/`loopback`) during legacy migration so older configs recover without manual edits. and.
- Podman/Quadlet setup: fix `sed` escaping and UID mismatch in Podman Quadlet setup. and.
- Doctor/macOS state-dir safety: warn when Kibo state resolves inside iCloud Drive (`~/Library/Mobile Documents/com~apple~CloudDocs/...`) or `~/Library/CloudStorage/...`, because sync-backed paths can cause slower I/O and lock/sync races..
- Doctor/Linux state-dir safety: warn when Kibo state resolves to an `mmcblk*` mount source (SD or eMMC), because random I/O can be slower and media wear can increase under session and credential writes..
- CLI/Cron run exit code: return exit code `0` only when `cron run` reports `{ ok: true, ran: true }`, and `1` for non-run/error outcomes so scripting/debugging reflects actual execution status. Landed from contributor PR #31121..
- CLI/JSON preflight output: keep `--json` command stdout machine-readable by suppressing doctor preflight note output while still running legacy migration/config doctor flow..
- Issues/triage labeling: consolidate bug intake to a single bug issue form with required bug-type classification (regression/crash/behavior), auto-apply matching subtype labels from issue form content, and retire the separate regression template to reduce misfiled issue types and improve queue filtering..
- Logging/Subsystem console timestamps: route subsystem console timestamp rendering through `formatConsoleTimestamp(...)` so `pretty` and timestamp-prefix output use local timezone formatting consistently instead of inline UTC `toISOString()` paths..
- Auto-reply/Block reply timeout path: normalize `onBlockReply(...)` execution through `Promise.resolve(...)` before timeout wrapping so mixed sync/async callbacks keep deterministic timeout behavior across strict TypeScript build paths. and.
- Nodes/Screen recording guardrails: cap `nodes` tool `screen_record` `durationMs` to 5 minutes at both schema-validation and runtime invocation layers to prevent long-running blocking captures from unbounded durations. Landed from contributor PR #31106..
- Gateway/CLI session recovery: handle expired CLI session IDs gracefully by clearing stale session state and retrying without crashing gateway runs. Landed from contributor PR #31090..
- Onboarding/Docker token parity: use `KIBO_GATEWAY_TOKEN` as the default gateway token in interactive and non-interactive onboarding when `--gateway-token` is not provided, so `docker-setup.sh` token env/config values stay aligned. Fixes #22638. and.
- Channels/Command parsing parity: align command-body parsing fields with channel command-gating text for Slack, Signal, Microsoft Teams, Mattermost, and BlueBubbles to avoid mention-strip mismatches and inconsistent command detection.
- File tools/tilde paths: expand `~/...` against the user home directory before workspace-root checks in host file read/write/edit paths, while preserving root-boundary enforcement so outside-root targets remain blocked..
- Memory/QMD update+embed output cap: discard captured stdout for `qmd update` and `qmd embed` runs (while keeping stderr diagnostics) so large index progress output no longer fails sync with `produced too much output` during boot/refresh. (#28900; landed from contributor PR #23311 by).
- Config/Doctor group allowlist diagnostics: align `groupPolicy: "allowlist"` warnings with per-channel runtime semantics by excluding Google Chat sender-list checks and by warning when no-fallback channels (for example iMessage) omit `groupAllowFrom`, with regression coverage..
- TUI/Session model status: clear stale runtime model identity when model overrides change so `/model` updates are reflected immediately in `sessions.patch` responses and `sessions.list` status surfaces..
- TUI/SIGTERM shutdown: ignore `setRawMode EBADF` teardown errors during `SIGTERM` exit so long-running TUI sessions do not crash on terminal shutdown races, while still rethrowing unrelated stop errors..
- Browser/Navigate: resolve the correct `targetId` in navigate responses after renderer swaps. and.
- FS/Sandbox workspace boundaries: add a dedicated `outside-workspace` safe-open error code for root-escape checks, and propagate specific outside-workspace messages across edit/browser/media consumers instead of generic not-found/invalid-path fallbacks..
- Diagnostics/Stuck session signal: add configurable stuck-session warning threshold via `diagnostics.stuckSessionWarnMs` (default 120000ms) to reduce false-positive warnings on long multi-tool turns.
- Agents/error classification: check billing errors before context overflow heuristics in the agent runner catch block so spend-limit and quota errors show the billing-specific message instead of being misclassified as "Context overflow: prompt too large"..
- Memory/MMR CJK tokenization: add Han, kana, and hangul tokens plus adjacent bigrams so memory-search reranking can detect overlap for CJK text instead of treating unrelated snippets as identical..

## 2026.2.26

### Changes

- Highlight: External Secrets Management introduces a full `kibo secrets` workflow (`audit`, `configure`, `apply`, `reload`) with runtime snapshot activation, strict `secrets apply` target-path validation, safer migration scrubbing, ref-only auth-profile support, and dedicated docs..
- ACP/Thread-bound agents: make ACP agents first-class runtimes for thread sessions with `acp` spawn/send dispatch integration, acpx backend bridging, lifecycle controls, startup reconciliation, runtime cleanup, and coalesced thread replies..
- Agents/Routing CLI: add `kibo agents bindings`, `kibo agents bind`, and `kibo agents unbind` for account-scoped route management, including channel-only to account-scoped binding upgrades, role-aware binding identity handling, plugin-resolved binding account IDs, and optional account-binding prompts in `kibo channels add`..
- Codex/WebSocket transport: make `openai-codex` WebSocket-first by default (`transport: "auto"` with SSE fallback), keep explicit per-model/runtime transport overrides, and add regression coverage + docs for transport selection.
- Onboarding/Plugins: let channel plugins own interactive onboarding flows with optional `configureInteractive` and `configureWhenConfigured` hooks while preserving the generic fallback path..
- Auth/Onboarding: add an explicit account-risk warning and confirmation gate before starting Gemini CLI OAuth, and document the caution in provider docs and the Gemini CLI auth plugin README..
- Android/Nodes: add Android `device` capability plus `device.status` and `device.info` node commands, including runtime handler wiring and protocol/registry coverage for device status/info payloads..
- Android/Nodes: add `notifications.list` support on Android nodes and expose `nodes notifications_list` in agent tooling for listing active device notifications..

### Fixes

- FS tools/workspaceOnly: honor `tools.fs.workspaceOnly=false` for host write and edit operations so FS tools can access paths outside the workspace when sandbox is off.. Fixes #28763. for reporting.
- Telegram/DM allowlist runtime inheritance: enforce `dmPolicy: "allowlist"` `allowFrom` requirements using effective account-plus-parent config across account-capable channels (Telegram, Discord, Slack, Signal, iMessage, IRC, BlueBubbles, WhatsApp), and align `kibo doctor` checks to the same inheritance logic so DM traffic is not silently dropped after upgrades..
- Delivery queue/recovery backoff: prevent retry starvation by persisting `lastAttemptAt` on failed sends and deferring recovery retries until each entry's `lastAttemptAt + backoff` window is eligible, while continuing to recover ready entries behind deferred ones. Landed from contributor PR #27710..
- Gemini OAuth/Auth flow: align OAuth project discovery metadata and endpoint fallback handling for Gemini CLI auth, including fallback coverage for environment-provided project IDs..
- Google Chat/Lifecycle: keep Google Chat `startAccount` pending until abort in webhook mode so startup is no longer interpreted as immediate exit, preventing auto-restart loops and webhook-target churn..
- Temp dirs/Linux umask: force `0700` permissions after temp-dir creation and self-heal existing writable temp dirs before trust checks so `umask 0002` installs no longer crash-loop on startup. Landed from contributor PR #27860..
- Nextcloud Talk/Lifecycle: keep `startAccount` pending until abort and stop the webhook monitor on shutdown, preventing `EADDRINUSE` restart loops when the gateway manages account lifecycle..
- Microsoft Teams/File uploads: acknowledge `fileConsent/invoke` immediately (`invokeResponse` before upload + file card send) so Teams no longer shows false "Something went wrong" timeout banners while upload completion continues asynchronously; includes updated async regression coverage. Landed from contributor PR #27641 by.
- Queue/Drain/Cron reliability: harden lane draining with guaranteed `draining` flag reset on synchronous pump failures, reject new queue enqueues during gateway restart drain windows (instead of silently killing accepted tasks), add `/stop` queued-backlog cutoff metadata with stale-message skipping (while avoiding cross-session native-stop cutoff bleed), and raise isolated cron `agentTurn` outer safety timeout to avoid false 10-minute timeout races against longer agent session timeouts. (#27407, #27332, #27427)
- Typing/Main reply pipeline: always mark dispatch idle in `agent-runner` finalization so typing cleanup runs even when dispatcher `onIdle` does not fire, preventing stuck typing indicators after run completion..
- Typing/TTL safety net: add max-duration guardrails to shared typing callbacks so stuck lifecycle edges auto-stop typing indicators even when explicit idle/cleanup signals are missed..
- Typing/Cross-channel leakage: unify run-scoped typing suppression for cross-channel/internal-webchat routes, preserve current inbound origin as embedded run message channel context, harden shared typing keepalive with consecutive-failure circuit breaker edge-case handling, and enforce dispatcher completion/idle waits in extension dispatcher callsites (Feishu, Matrix, Mattermost, MSTeams) so typing indicators always clean up on success/error paths. Related: #27647, #27493, #27598. Supersedes/replaces draft PRs: #27640, #27593, #27540.
- Telegram/sendChatAction 401 handling: add bounded exponential backoff + temporary local typing suppression after repeated unauthorized failures to stop unbounded `sendChatAction` retry loops that can trigger Telegram abuse enforcement and bot deletion..
- Telegram/Webhook startup: clarify webhook config guidance, allow `channels.telegram.webhookPort: 0` for ephemeral listener binding, and log both the local listener URL and Telegram-advertised webhook URL with the bound port..
- Config/Doctor allowlist safety: reject `dmPolicy: "allowlist"` configs with empty `allowFrom`, add Telegram account-level inheritance-aware validation, and teach `kibo doctor --fix` to restore missing `allowFrom` entries from pairing-store files when present, preventing silent DM drops after upgrades..
- Browser/Chrome extension handshake: bind relay WS message handling before `onopen` and add non-blocking `connect.challenge` response handling for gateway-style handshake frames, avoiding stuck `...` badge states when challenge frames arrive immediately on connect. Landed from contributor PR #22571 by.
- Browser/Extension relay init: dedupe concurrent same-port relay startup with shared in-flight initialization promises so callers await one startup lifecycle and receive consistent success/failure results. Landed from contributor PR #21277 by. (Related #20688)
- Browser/Fill relay + CLI parity: accept `act.fill` fields without explicit `type` by defaulting missing/empty `type` to `text` in both browser relay route parsing and `kibo browser fill` CLI field parsing, so relay calls no longer fail when the model omits field type metadata. Landed from contributor PR #27662..
- Feishu/Permission error dispatch: merge sender-name permission notices into the main inbound dispatch so one user message produces one agent turn/reply (instead of a duplicate permission-notice turn), with regression coverage..
- Feishu/Merged forward parsing: expand inbound `merge_forward` messages by fetching and formatting API sub-messages in order, so merged forwards provide usable content context instead of only a placeholder line..
- Agents/Canvas default node resolution: when multiple connected canvas-capable nodes exist and no single `mac-*` candidate is selected, default to the first connected candidate instead of failing with `node required` for implicit-node canvas tool calls. Landed from contributor PR #27444..
- TUI/stream assembly: preserve streamed text across real tool-boundary drops without keeping stale streamed text when non-text blocks appear only in the final payload. Landed from contributor PR #27711 by.
- Hooks/Internal `message:sent`: forward `sessionKey` on outbound sends from agent delivery, cron isolated delivery, gateway receipt acks, heartbeat sends, session-maintenance warnings, and restart-sentinel recovery so internal `message:sent` hooks consistently dispatch with session context, including `kibo agent --deliver` runs resumed via `--session-id` (without explicit `--session-key`). Landed from contributor PR #27584..
- Pi image-token usage: stop re-injecting history image blocks each turn, process image references from the current prompt only, and prune already-answered user-image blocks in stored history to prevent runaway token growth..
- BlueBubbles/SSRF: auto-allowlist the configured `serverUrl` hostname for attachment fetches so localhost/private-IP BlueBubbles setups are no longer false-blocked by default SSRF checks. Landed from contributor PR #27648 by. for reporting.
- Agents/Compaction + onboarding safety: prevent destructive double-compaction by stripping stale assistant usage around compaction boundaries, skipping post-compaction custom metadata writes in the same attempt, and cancelling safeguard compaction when there are no real conversation messages to summarize; harden workspace/bootstrap detection for memory-backed workspaces; and change `kibo onboard --reset` default scope to `config+creds+sessions` (workspace deletion now requires `--reset-scope full`). (#26458, #27314), and for fix direction in #26502, #26529, and #27492.
- NO_REPLY suppression: suppress `NO_REPLY` before Slack API send and in sub-agent announce completion flow so sentinel text no longer leaks into user channels. Landed from contributor PRs #27529 (by) and #27535 (rewritten minimal landing by maintainers). (#27387, #27531)
- Matrix/Group sender identity: preserve sender labels in Matrix group inbound prompt text (`BodyForAgent`) for both channel and threaded messages, and align group envelopes with shared inbound sender-prefix formatting so first-person requests resolve against the current sender..
- Auto-reply/Streaming: suppress only exact `NO_REPLY` final replies while still filtering streaming partial sentinel fragments (`NO_`, `NO_RE`, `HEARTBEAT_...`) so substantive replies ending with `NO_REPLY` are delivered and partial silent tokens do not leak during streaming..
- Auto-reply/Inbound metadata: add a readable `timestamp` field to conversation info and ignore invalid/out-of-range timestamp values so prompt assembly never crashes on malformed timestamp inputs..
- Typing/Run completion race: prevent post-run keepalive ticks from re-triggering typing callbacks by guarding `triggerTyping()` with `runComplete`, with regression coverage for no-restart behavior during run-complete/dispatch-idle boundaries..
- Typing/Dispatch idle: force typing cleanup when `markDispatchIdle` never arrives after run completion, avoiding leaked typing keepalive loops in cron/announce edges. Landed from contributor PR #27541 by.
- Telegram/Inline buttons: allow callback-query button handling in groups (including `/models` follow-up buttons) when group policy authorizes the sender, by removing the redundant callback allowlist gate that blocked open-policy groups..
- Telegram/Streaming preview: when finalizing without an existing preview message, prime pending preview text with final answer before stop-flush so users do not briefly see stale 1-2 word fragments (for example `no` before `no problem`). for the original fix direction in #19673.
- Browser/Extension relay CORS: handle `/json*` `OPTIONS` preflight before auth checks, allow Chrome extension origins, and return extension-origin CORS headers on relay HTTP responses so extension token validation no longer fails cross-origin. Landed from contributor PR #23962 by.
- Browser/Extension relay auth: allow `?token=` query-param auth on relay `/json*` endpoints (consistent with relay WebSocket auth) so curl/devtools-style `/json/version` and `/json/list` probes work without requiring custom headers. Landed from contributor PR #26015 by.
- Browser/Extension relay shutdown: flush pending extension-request timers/rejections during relay `stop()` before socket/server teardown so in-flight extension waits do not survive shutdown windows. Landed from contributor PR #24142 by.
- Browser/Extension relay reconnect resilience: keep CDP clients alive across brief MV3 extension disconnect windows, wait briefly for extension reconnect before failing in-flight CDP commands, and only tear down relay target/client state after reconnect grace expires. Landed from contributor PR #27617 by.
- Browser/Route decode hardening: guard malformed percent-encoding in relay target action routes and browser route-param decoding so crafted `%` paths return `400` instead of crashing/unhandled URI decode failures. Landed from contributor PR #11880 by.
- Browser/Writable output path hardening: reject existing hardlinked writable targets, and finalize browser download/trace outputs via sibling temp files plus atomic rename to block hardlink-alias overwrite paths under browser temp roots.
- Feishu/Inbound message metadata: include inbound `message_id` in `BodyForAgent` on a dedicated metadata line so agents can reliably correlate and act on media/message operations that require message IDs, with regression coverage..
- Feishu/Doc tools: route `feishu_doc` and `feishu_app_scopes` through the active agent account context (with explicit `accountId` override support) so multi-account agents no longer default to the first configured app, with regression coverage for context routing and explicit override behavior..
- LINE/Inline directives auth: gate directive parsing (`/model`, `/think`, `/verbose`, `/reasoning`, `/queue`) on resolved authorization (`command.isAuthorizedSender`) so `commands.allowFrom`-authorized LINE senders are not silently stripped when raw `CommandAuthorized` is unset. Landed from contributor PR #27248 by.
- Onboarding/Gateway: seed default Control UI `allowedOrigins` for non-loopback binds during onboarding (`localhost`/`127.0.0.1` plus custom bind host) so fresh non-loopback setups do not fail startup due to missing origin policy..
- Docker/GCP onboarding: reduce first-build OOM risk by capping Node heap during `pnpm install`, reuse existing gateway token during `docker-setup.sh` reruns so `.env` stays aligned with config, auto-bootstrap Control UI allowed origins for non-loopback Docker binds, and add GCP docs guidance for tokenized dashboard links + pairing recovery commands..
- CLI/Gateway `--force` in non-root Docker: recover from `lsof` permission failures (`EACCES`/`EPERM`) by falling back to `fuser` kill + probe-based port checks, so `kibo gateway --force` works for default container `node` user flows..
- Gateway/Bind visibility: emit a startup warning when binding to non-loopback addresses so operators get explicit exposure guidance in runtime logs..
- Sessions cleanup/Doctor: add `kibo sessions cleanup --fix-missing` to prune store entries whose transcript files are missing, including doctor guidance and CLI coverage. Landed from contributor PR #27508 by.
- Doctor/State integrity: ignore metadata-only slash routing sessions when checking recent missing transcripts so `kibo doctor` no longer reports false-positive transcript-missing warnings for `*:slash:*` keys..
- CLI/Gateway status: force local `gateway status` probe host to `127.0.0.1` for `bind=lan` so co-located probes do not trip non-loopback plaintext WebSocket checks..
- CLI/Gateway auth: align `gateway run --auth` parsing/help text with supported gateway auth modes by accepting `none` and `trusted-proxy` (in addition to `token`/`password`) for CLI overrides..
- CLI/Daemon status TLS probe: use `wss://` and forward local TLS certificate fingerprint for TLS-enabled gateway daemon probes so `kibo daemon status` works with `gateway.bind=lan` + `gateway.tls.enabled=true`..
- Podman/Default bind: change `run-kibo-podman.sh` default gateway bind from `lan` to `loopback` and document explicit LAN opt-in with Control UI origin configuration..
- Daemon/macOS launchd: forward proxy env vars into supervised service environments, keep LaunchAgent `KeepAlive=true` semantics, and harden restart sequencing to `print -> bootout -> wait old pid exit -> bootstrap -> kickstart`..
- Gateway/macOS restart-loop hardening: detect Kibo-managed supervisor markers during SIGUSR1 restart handoff, clean stale gateway PIDs before `/restart` launchctl/systemctl triggers, and set LaunchAgent `ThrottleInterval=60` to bound launchd retry storms during lock-release races. Landed from contributor PRs #27655 (@taw0002), #27448 (@Sid-Qin), and #27650 (@kevinWangSheng). (#27605, #27590, #26904, #26736)
- Models/MiniMax auth header defaults: set `authHeader: true` for both onboarding-generated MiniMax API providers and implicit built-in MiniMax (`minimax`, `minimax-portal`) provider templates so first requests no longer fail with MiniMax `401 authentication_error` due to missing `Authorization` header. Landed from contributor PRs #27622 by and #27631 by. (#27600, #15303)
- Models/Google Antigravity IDs: normalize bare `gemini-3-pro`, `gemini-3.1-pro`, and `gemini-3-1-pro` model IDs to the default `-low` thinking tier so provider requests no longer fail with 404 when the tier suffix is omitted..
- Auth/Auth profiles: normalize `auth-profiles.json` alias fields (`mode -> type`, `apiKey -> key`) before credential validation so entries copied from `kibo.json` auth examples are no longer silently dropped..
- Models/Google Gemini: treat `google` (Gemini API key auth profile) as a reasoning-tag provider to prevent `<think>` leakage, and add forward-compat model fallback for `google-gemini-cli` `gemini-3.1-pro*` / `gemini-3.1-flash*` IDs to avoid false unknown-model errors. (#26551, #26524).
- Models/Profile suffix parsing: centralize trailing `@profile` parsing and only treat `@` as a profile separator when it appears after the final `/`, preserving model IDs like `openai/@cf/...` and `openrouter/@preset/...` across `/model` directive parsing and allowlist model resolution, with regression coverage.
- Models/OpenAI Codex config schema parity: accept `openai-codex-responses` in the config model API schema and TypeScript `ModelApi` union, with regression coverage for config validation. Landed from contributor PR #27501..
- Agents/Models config: preserve agent-level provider `apiKey` and `baseUrl` during merge-mode `models.json` updates when agent values are present..
- Azure OpenAI Responses: force `store=true` for `azure-openai-responses` direct responses API calls to avoid multi-turn 400 failures. Landed from contributor PR #27499 by.
- Security/Node exec approvals: require structured `commandArgv` approvals for `host=node`, enforce `systemRunBinding` matching for argv/cwd/session/agent/env context with fail-closed behavior on missing/mismatched bindings, and add `GIT_EXTERNAL_DIFF` to blocked host env keys. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Command authorization: enforce sender authorization for natural-language abort triggers (`stop`-like text) and `/models` listings, preventing unauthorized session aborts and model-auth metadata disclosure. This ships in the next npm release (`2026.2.27`). for reporting.
- Security/Plugin channel HTTP auth: normalize protected `/api/channels` path checks against canonicalized request paths (case + percent-decoding + slash normalization), resolve encoded dot-segment traversal variants, and fail closed on malformed `%`-encoded channel prefixes so alternate-path variants cannot bypass gateway auth. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Gateway node pairing: pin paired-device `platform`/`deviceFamily` metadata across reconnects and bind those fields into device-auth signatures, so reconnect metadata spoofing cannot expand node command allowlists without explicit repair pairing. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Sandbox path alias guard: reject broken symlink targets by resolving through existing ancestors and failing closed on out-of-root targets, preventing workspace-only `apply_patch` writes from escaping sandbox/workspace boundaries via dangling symlinks. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Workspace FS boundary aliases: harden canonical boundary resolution for non-existent-leaf symlink aliases while preserving valid in-root aliases, preventing first-write workspace escapes via out-of-root symlink targets. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Config includes: harden `$include` file loading with verified-open reads, reject hardlinked include aliases, and enforce include file-size guardrails so config include resolution remains bounded to trusted in-root files. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Node exec approvals hardening: freeze immutable approval-time execution plans (`argv`/`cwd`/`agentId`/`sessionKey`) via `system.run.prepare`, enforce those canonical plan values during approval forwarding/execution, and reject mutable parent-symlink cwd paths during approval-plan building to prevent approval bypass via symlink rebind. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Microsoft Teams media fetch: route Graph message/hosted-content/attachment fetches and auth-scope fallback attachment downloads through shared SSRF-guarded fetch paths, and centralize hostname-suffix allowlist policy helpers in the plugin SDK to remove channel/plugin drift. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Voice Call (Twilio): bind webhook replay + manager dedupe identity to authenticated request material, remove unsigned `i-twilio-idempotency-token` trust from replay/dedupe keys, and thread verified request identity through provider parse flow to harden cross-provider event dedupe. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Exec approvals forwarding: prefer turn-source channel/account/thread metadata when resolving approval delivery targets so stale session routes do not misroute approval prompts.
- Security/Pairing multi-account isolation: enforce account-scoped pairing allowlists and pending-request storage across core + extension message channels while preserving channel-scoped defaults for the default account. This ships in the next npm release (`2026.2.26`). for reporting and for implementation.
- Memory/SQLite: deduplicate concurrent memory-manager initialization and auto-reopen stale SQLite handles after atomic reindex swaps, preventing repeated `attempt to write a readonly database` sync failures until gateway restart.
- Config/Plugins entries: treat unknown `plugins.entries.*` ids as startup warnings (ignored stale keys) instead of hard validation failures that can crash-loop gateway boot. Landed from contributor PR #27506 by.
- Telegram native commands: degrade command registration on `BOT_COMMANDS_TOO_MUCH` by retrying with fewer commands instead of crash-looping startup sync. Landed from contributor PR #27512 by.
- Web tools/Proxy: route `web_search` provider HTTP calls (Brave, Perplexity, xAI, Gemini, Kimi), redirect resolution, and `web_fetch` through a shared proxy-aware SSRF guard path so gateway installs behind `HTTP_PROXY`/`HTTPS_PROXY`/`ALL_PROXY` no longer fail with transport `fetch failed` errors..
- Android/Node invoke: remove native gateway WebSocket `Origin` header to avoid false origin rejections, unify invoke command registry/policy/error parsing paths, and keep command availability checks centralized to reduce dispatcher/advertisement drift..
- Gateway shared-auth scopes: preserve requested operator scopes for shared-token clients when device identity is unavailable, instead of clearing scopes during auth handling. Landed from contributor PR #27498 by.
- Cron/Hooks isolated routing: preserve canonical `agent:*` session keys in isolated runs so already-qualified keys are not double-prefixed (for example `agent:main:main` no longer becomes `agent:main:agent:main:main`). Landed from contributor PR #27333 by. (#27289, #27282)
- Channels/Multi-account config: when adding a non-default channel account to a single-account top-level channel setup, move existing account-scoped top-level single-account values into `channels.<channel>.accounts.default` before writing the new account so the original account keeps working without duplicated account values at channel root; `kibo doctor --fix` now repairs previously mixed channel account shapes the same way..
- iOS/Talk mode: stop injecting the voice directive hint into iOS Talk prompts and remove the Voice Directive Hint setting, reducing model bias toward tool-style TTS directives and keeping relay responses text-first by default..
- Mattermost/mention gating: honor `chatmode: "onmessage"` account override in inbound group/channel mention-gate resolution, while preserving explicit group `requireMention` config precedence and adding verbose drop diagnostics for skipped inbound posts..

## 2026.2.25

### Changes

- Android/Chat: improve streaming delivery handling and markdown rendering quality in the native Android chat UI, including better GitHub-flavored markdown behavior..
- Android/Startup perf: defer foreground-service startup, move WebView debugging init out of critical startup, and add startup macrobenchmark + low-noise perf CLI scripts for deterministic cold-start tracking..
- UI/Chat compose: add mobile stacked layout for compose action buttons on small screens to improve send/session controls usability..
- Heartbeat/Config: replace heartbeat DM toggle with `agents.defaults.heartbeat.directPolicy` (`allow` | `block`; also supported per-agent via `agents.list[].heartbeat.directPolicy`) for clearer delivery semantics.
- Onboarding/Security: clarify onboarding security notices that Kibo is personal-by-default (single trusted operator boundary) and shared/multi-user setups require explicit lock-down/hardening.
- Branding/Docs + Apple surfaces: replace remaining `bot.molt` launchd label, bundle-id, logging subsystem, and command examples with `ai.kibo` across docs, iOS app surfaces, helper scripts, and CLI test fixtures.
- Agents/Config: remind agents to call `config.schema` before config edits or config-field questions to avoid guessing..
- Dependencies: update workspace dependency pins and lockfile (Bedrock SDK `3.998.0`, `@mariozechner/pi-*` `0.55.1`, TypeScript native preview `7.0.0-dev.20260225.1`) while keeping `@buape/carbon` pinned.

### Fixes

- Slack/Identity: thread agent outbound identity (`chat:write.customize` overrides) through the channel reply delivery path so per-agent username, icon URL, and icon emoji are applied to all Slack replies including media messages..
- Slack/Threading: resolve `replyToMode` per incoming message using chat-type-aware account config (`replyToModeByChatType` and legacy `dm.replyToMode`) so DM/channel reply threading honors overrides instead of always using monitor startup defaults..
- Slack/Threading: track bot participation in message threads (per account/channel/thread) so follow-up messages in those threads can be handled without requiring repeated, while preserving mention-gating behavior for unrelated threads..
- Slack/Threading: stop forcing tool-call reply mode to `all` based on `ThreadLabel` alone; now force thread reply mode only when an explicit thread target exists (`MessageThreadId`/`ReplyToId`), so DM `replyToModeByChatType.direct` overrides are honored outside real thread replies..
- Slack/Threading: when `replyToMode="all"` auto-threads top-level Slack DMs, seed the thread session key from the message `ts` so the initial message and later replies share the same isolated `:thread:` session instead of falling back to base DM context..
- Agents/Subagents delivery: refactor subagent completion announce dispatch into an explicit queue/direct/fallback state machine, recover outbound channel-plugin resolution in cold/stale plugin-registry states across announce/message/gateway send paths, finalize cleanup bookkeeping when announce flow rejects, and treat Telegram sends without `message_id` as delivery failures (instead of false-success `"unknown"` IDs). (#26867, #25961, #26803, #25069, #26741) and.
- Telegram/Webhook: pre-initialize webhook bots, switch webhook processing to callback-mode JSON handling, and preserve full near-limit payload reads under delayed handlers to prevent webhook request hangs and dropped updates..
- Slack/Session threads: prevent oversized parent-session inheritance from silently bricking new thread sessions, surface embedded context-overflow empty-result failures to users, and add configurable `session.parentForkMaxTokens` (default `100000`, `0` disables)..
- Cron/Message multi-account routing: honor explicit `delivery.accountId` for isolated cron delivery resolution, and when `message.send` omits `accountId`, fall back to the sending agent's bound channel account instead of defaulting to the global account. (#27015, #26975) and.
- Gateway/Message media roots: thread `agentId` through gateway `send` RPC and prefer explicit `agentId` over session/default resolution so non-default agent workspace media sends no longer fail with `LocalMediaAccessError`; added regression coverage for agent precedence and blank-agent fallback..
- Followups/Routing: when explicit origin routing fails, allow same-channel fallback dispatch (while still blocking cross-channel fallback) so followup replies do not get dropped on transient origin-adapter failures..
- Cron/Announce duplicate guard: track attempted announce/direct delivery separately from confirmed `delivered`, and suppress fallback main-session cron summaries when delivery was already attempted to avoid duplicate end-user sends in uncertain-ack paths..
- LINE/Lifecycle: keep LINE `startAccount` pending until abort so webhook startup is no longer misread as immediate channel exit, preventing restart-loop storms on LINE provider boot..
- Discord/Gateway: capture and drain startup-time gateway `error` events before lifecycle listeners attach so early `Fatal Gateway error: 4014` closes surface as actionable intent guidance instead of uncaught gateway crashes..
- Discord/Inbound text: preserve embed `title` + `description` fallback text in message and forwarded snapshot parsing so embed titles are not silently dropped from agent input..
- Slack/Inbound media fallback: deliver file-only messages even when Slack media downloads fail by adding a filename placeholder fallback, capping fallback names to the shared media-file limit, and normalizing empty filenames to `file` so attachment-only messages are not silently dropped..
- Telegram/Preview cleanup: keep finalized text previews when a later assistant message is media-only (for example mixed text plus voice turns) by skipping finalized preview archival at assistant-message boundaries, preventing cleanup from deleting already-visible final text messages..
- Telegram/Markdown spoilers: keep valid `||spoiler||` pairs while leaving unmatched trailing `||` delimiters as literal text, avoiding false all-or-nothing spoiler suppression..
- Slack/Allowlist channels: match channel IDs case-insensitively during channel allowlist resolution so lowercase config keys (for example `c0abc12345`) correctly match Slack runtime IDs (`C0ABC12345`) under `groupPolicy: "allowlist"`, preventing silent channel-event drops..
- Discord/Typing indicator: prevent stuck typing indicators by sealing channel typing keepalive callbacks after idle/cleanup and ensuring Discord dispatch always marks typing idle even if preview-stream cleanup fails..
- Channels/Typing indicator: guard typing keepalive start callbacks after idle/cleanup close so post-close ticks cannot re-trigger stale typing indicators..
- Followups/Typing indicator: ensure followup turns mark dispatch idle on every exit path (including `NO_REPLY`, empty payloads, and agent errors) so typing keepalive cleanup always runs and channel typing indicators do not get stuck after queued/silent followups..
- Voice-call/TTS tools: hide the `tts` tool when the message provider is `voice`, preventing voice-call runs from selecting self-playback TTS and falling into silent no-output loops..
- Agents/Tools: normalize non-standard plugin tool results that omit `content` so embedded runs no longer crash with `Cannot read properties of undefined (reading 'filter')` after tool completion (including `tesseramemo_query`)..
- Agents/Tool-call dispatch: trim whitespace-padded tool names in both transcript repair and live streamed embedded-runner responses so exact-match tool lookup no longer fails with `Tool ... not found` for model outputs like `" read "`. and.
- Cron/Model overrides: when isolated `payload.model` is no longer allowlisted, fall back to default model selection instead of failing the job, while still returning explicit errors for invalid model strings..
- Agents/Model fallback: keep explicit text + image fallback chains reachable even when `agents.defaults.models` allowlists are present, prefer explicit run `agentId` over session-key parsing for followup fallback override resolution (with session-key fallback), treat agent-level fallback overrides as configured in embedded runner preflight, and classify `model_cooldown` / `cooling down` errors as `rate_limit` so failover continues. (#11972, #24137, #17231)
- Agents/Model fallback: keep same-provider fallback chains active when session model differs from configured primary, infer cooldown reason from provider profile state (instead of `disabledReason` only), keep no-profile fallback providers eligible (env/models.json paths), and only relax same-provider cooldown fallback attempts for `rate_limit`..
- Agents/Model fallback: continue fallback traversal on unrecognized errors when candidates remain, while still throwing the original unknown error on the last candidate..
- Models/Auth probes: map permanent auth failover reasons (`auth_permanent`, for example revoked keys) into probe auth status instead of `unknown`, so `kibo models status --probe` reports actionable auth failures..
- Hooks/Inbound metadata: include `guildId` and `channelName` in `message_received` metadata for both plugin and internal hook paths..
- Discord/Component auth: evaluate guild component interactions with command-gating authorizers so unauthorized users no longer get `CommandAuthorized: true` on modal/button events..
- Security/Gateway auth: require pairing for operator device-identity sessions authenticated with shared token auth so unpaired devices cannot self-assign operator scopes. for reporting.
- Security/Gateway WebSocket auth: enforce origin checks for direct browser WebSocket clients beyond Control UI/Webchat, apply password-auth failure throttling to browser-origin loopback attempts (including localhost), and block silent auto-pairing for non-Control-UI browser clients to prevent cross-origin brute-force and session takeover chains. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Gateway trusted proxy: require `operator` role for the Control UI trusted-proxy pairing bypass so unpaired `node` sessions can no longer connect via `client.id=control-ui` and invoke node event methods. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/macOS beta onboarding: remove Anthropic OAuth sign-in and the legacy `oauth.json` onboarding path that exposed the PKCE verifier via OAuth `state`; this impacted the macOS beta onboarding path only. Anthropic subscription auth is now setup-token-only and will ship in the next npm release (`2026.2.26`). for reporting.
- Security/Microsoft Teams file consent: bind `fileConsent/invoke` upload acceptance/decline to the originating conversation before consuming pending uploads, preventing cross-conversation pending-file upload or cancellation via leaked `uploadId` values; includes regression coverage for match/mismatch invoke handling. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Gateway: harden `agents.files` path handling to block out-of-workspace symlink targets for `agents.files.get`/`agents.files.set`, keep in-workspace symlink targets supported, and add gateway regression coverage for both blocked escapes and allowed in-workspace symlinks. for reporting.
- Security/Workspace FS: reject hardlinked workspace file aliases in `tools.fs.workspaceOnly` and `tools.exec.applyPatch.workspaceOnly` boundary checks (including sandbox mount-root guards) to prevent out-of-workspace read/write via in-workspace hardlink paths. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Browser temp paths: harden trace/download output-path handling against symlink-root and symlink-parent escapes with realpath-based write-path checks plus secure fallback tmp-dir validation that fails closed on unsafe fallback links. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Browser uploads: revalidate upload paths at use-time in Playwright file-chooser and direct-input flows so missing/rebound paths are rejected before `setFiles`, with regression coverage for strict missing-path handling.
- Security/Exec approvals: bind `system.run` approval matching to exact argv identity and preserve argv whitespace in rendered command text, preventing trailing-space executable path swaps from reusing a mismatched approval. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Exec approvals: harden approval-bound `system.run` execution on node hosts by rejecting symlink `cwd` paths and canonicalizing path-like executable argv before spawn, blocking mutable-cwd symlink retarget chains between approval and execution. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Signal: enforce DM/group authorization before reaction-only notification enqueue so unauthorized senders can no longer inject Signal reaction system events under `dmPolicy`/`groupPolicy`; reaction notifications now require channel access checks first. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Discord reactions: enforce DM policy/allowlist authorization before reaction-event system enqueue in direct messages; Discord reaction handling now also honors DM/group-DM enablement and guild `groupPolicy` channel gating to keep reaction ingress aligned with normal message preflight. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Slack reactions + pins: gate `reaction_*` and `pin_*` system-event enqueue through shared sender authorization so DM `dmPolicy`/`allowFrom` and channel `users` allowlists are enforced consistently for non-message ingress, with regression coverage for denied/allowed sender paths. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Slack member + message subtype events: gate `member_*` plus `message_changed`/`message_deleted`/`thread_broadcast` system-event enqueue through shared sender authorization so DM `dmPolicy`/`allowFrom` and channel `users` allowlists are enforced consistently for non-message ingress; message subtype system events now fail closed when sender identity is missing, with regression coverage. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Telegram reactions: enforce `dmPolicy`/`allowFrom` and group allowlist authorization on `message_reaction` events before enqueueing reaction system events, preventing unauthorized reaction-triggered input in DMs and groups; ships in the next npm release (`2026.2.26`). for reporting.
- Security/Telegram group allowlist: fail closed for group sender authorization by removing DM pairing-store fallback from group allowlist evaluation; group sender access now requires explicit `groupAllowFrom` or per-group/per-topic `allowFrom`..
- Security/DM-group allowlist boundaries: keep DM pairing-store approvals DM-only by removing pairing-store inheritance from group sender authorization in LINE and Mattermost message preflight, and by centralizing shared DM/group allowlist composition so group checks never include pairing-store entries. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Slack interactions: enforce channel/DM authorization and modal actor binding (`private_metadata.userId`) before enqueueing `block_action`/`view_submission`/`view_closed` system events, with regression coverage for unauthorized senders and missing/mismatched actor metadata. This ships in the next npm release (`2026.2.26`). for reporting.
- Security/Nextcloud Talk: drop replayed signed webhook events with persistent per-account replay dedupe across restarts, and reject unexpected webhook backend origins when account base URL is configured. for reporting.
- Security/Nextcloud Talk: reject unsigned webhook traffic before full body reads, reducing unauthenticated request-body exposure, with auth-order regression coverage..
- Security/Nextcloud Talk: stop treating DM pairing-store entries as group allowlist senders, so group authorization remains bounded to configured group allowlists..
- Security/LINE: cap unsigned webhook body reads before auth/signature handling to bound unauthenticated body processing..
- Security/IRC: keep pairing-store approvals DM-only and out of IRC group allowlist authorization, with policy regression tests for allowlist resolution..
- Security/Microsoft Teams: isolate group allowlist and command authorization from DM pairing-store entries to prevent cross-context authorization bleed..
- Security/SSRF guard: classify IPv6 multicast literals (`ff00::/8`) as blocked/private-internal targets in shared SSRF IP checks, preventing multicast literals from bypassing URL-host preflight and DNS answer validation. This ships in the next npm release (`2026.2.26`). for reporting.
- Tests/Low-memory stability: disable Vitest `vmForks` by default on low-memory local hosts (`<64 GiB`), keep low-profile extension lane parallelism at 4 workers, and align cron isolated-agent tests with `setSessionRuntimeModel` usage to avoid deterministic suite failures..
- Feishu/WebSocket proxy: pass a proxy agent to Feishu WS clients from standard proxy environment variables and include plugin-local runtime dependency wiring so websocket mode works in proxy-constrained installs..

### Breaking

- **BREAKING:** Heartbeat direct/DM delivery default is now `allow` again. To keep DM-blocked behavior from `2026.2.24`, set `agents.defaults.heartbeat.directPolicy: "block"` (or per-agent override).

## 2026.2.24

### Changes

- Auto-reply/Abort shortcuts: expand standalone stop phrases (`stop kibo`, `stop action`, `stop run`, `stop agent`, `please stop`, and related variants), accept trailing punctuation (for example `STOP KIBO!!!`), add multilingual stop keywords (including ES/FR/ZH/HI/AR/JP/DE/PT/RU forms), and treat exact `do not do that` as a stop trigger while preserving strict standalone matching. and.
- Android/App UX: ship a native four-step onboarding flow, move post-onboarding into a five-tab shell (Connect, Chat, Voice, Screen, Settings), add a full Connect setup/manual mode screen, and refresh Android chat/settings surfaces for the new navigation model.
- Talk/Gateway config: add provider-agnostic Talk configuration with legacy compatibility, and expose gateway Talk ElevenLabs config metadata for setup/status surfaces.
- Security/Audit: add `security.trust_model.multi_user_heuristic` to flag likely shared-user ingress and clarify the personal-assistant trust model, with hardening guidance for intentional multi-user setups (`sandbox.mode="all"`, workspace-scoped FS, reduced tool surface, no personal/private identities on shared runtimes).
- Dependencies: refresh key runtime and tooling packages across the workspace (Bedrock SDK, pi runtime stack, OpenAI, Google auth, and oxlint/oxfmt), while intentionally keeping `@buape/carbon` pinned.

### Fixes

- Routing/Session isolation: harden followup routing so explicit cross-channel origin replies never fall back to the active dispatcher on route failure, preserve queued overflow summary routing metadata (`channel`/`to`/`thread`) across followup drain, and prefer originating channel context over internal provider tags for embedded followup runs. This prevents webchat/control-ui context from hijacking Discord-targeted replies in shared sessions..
- Security/Routing: fail closed for shared-session cross-channel replies by binding outbound target resolution to the current turn's source channel metadata (instead of stale session route fallbacks), and wire those turn-source fields through gateway + command delivery planners with regression coverage..
- Heartbeat routing: prevent heartbeat leakage/spam into Discord and other direct-message destinations by blocking direct-chat heartbeat delivery targets and keeping blocked-delivery cron/exec prompts internal-only..
- Heartbeat defaults/prompts: switch the implicit heartbeat delivery target from `last` to `none` (opt-in for external delivery), and use internal-only cron/exec heartbeat prompt wording when delivery is disabled so background checks do not nudge user-facing relay behavior. (#25871, #24638, #25851)
- Auto-reply/Heartbeat queueing: drop heartbeat runs when a session already has an active run instead of enqueueing a stale followup, preventing duplicate heartbeat response branches after queue drain. (#25610, #25606).
- Cron/Heartbeat delivery: stop inheriting cached session `lastThreadId` for heartbeat-mode target resolution unless a thread/topic is explicitly requested, so announce-mode cron and heartbeat deliveries stay on top-level destinations instead of leaking into active conversation threads..
- Messaging tool dedupe: treat originating channel metadata as authoritative for same-target `message.send` suppression in proactive runs (heartbeat/cron/exec-event), including synthetic-provider contexts, so `delivery-mirror` transcript entries no longer cause duplicate Telegram sends..
- Channels/Typing keepalive: refresh channel typing callbacks on a keepalive interval during long replies and clear keepalive timers on idle/cleanup across core + extension dispatcher callsites so typing indicators do not expire mid-inference. (#25886, #25882).
- Agents/Model fallback: when a run is currently on a configured fallback model, keep traversing the configured fallback chain instead of collapsing straight to primary-only, preventing dead-end failures when primary stays in cooldown. (#25922, #25912).
- Gateway/Models: honor explicit `agents.defaults.models` allowlist refs even when bundled model catalog data is stale, synthesize missing allowlist entries in `models.list`, and allow `sessions.patch`/`/model` selection for those refs without false `model not allowed` errors., and.
- Control UI/Agents: inherit `agents.defaults.model.fallbacks` in the Overview fallback input when no per-agent model entry exists, while preserving explicit per-agent fallback overrides (including empty lists). (#25729, #25710).
- Automation/Subagent/Cron reliability: honor `ANNOUNCE_SKIP` in `sessions_spawn` completion/direct announce flows (no user-visible token leaks), add transient direct-announce retries for channel unavailability (for example WhatsApp listener reconnect windows), and include `cron` in the `coding` tool profile so `/tools/invoke` can execute cron actions when explicitly allowed by gateway policy. (#25800, #25656, #25842, #25813, #25822, #25821), and.
- Discord/Voice reliability: restore runtime DAVE dependency (`@snazzah/davey`), add configurable DAVE join options (`channels.discord.voice.daveEncryption` and `channels.discord.voice.decryptionFailureTolerance`), clean up voice listeners/session teardown, guard against stale connection events, and trigger controlled rejoin recovery after repeated decrypt failures to improve inbound STT stability under DAVE receive errors. (#25861, #25372, #24883, #24825, #23890, #23105, #22961, #23421, #23278, #23032)
- Discord/Block streaming: restore block-streamed reply delivery by suppressing only reasoning payloads (instead of all `block` payloads), fixing missing Discord replies in `channels.discord.streaming=block` mode. (#25839, #25836, #25792).
- Discord/Proxy + reactions + model picker: thread channel proxy fetch into inbound media/sticker downloads, use proxy-aware gateway metadata fetch for WSL/corporate proxy setups, wire `messages.statusReactions.{emojis,timing}` into Discord reaction lifecycle control, and compact model-picker `custom_id` keys to stay under Discord's 100-char limit while keeping backward-compatible parsing. (#25232, #25507, #25564, #25695), and.
- WhatsApp/Web reconnect: treat close status `440` as non-retryable (including string-form status values), stop reconnect loops immediately, and emit operator guidance to relink after resolving session conflicts..
- WhatsApp/Reasoning safety: suppress outbound payloads marked as reasoning and hard-drop text payloads that begin with `Reasoning:` before WhatsApp delivery, preventing hidden thinking blocks from leaking to end users through final-message paths. (#25804, #25214, #24328)
- Matrix/Read receipts: send read receipts as soon as Matrix messages arrive (before handler pipeline work), so clients no longer show long-lived unread/sent states while replies are processing. (#25841, #25840).
- Telegram/Replies: when markdown formatting renders to empty HTML (for example syntax-only chunks in threaded replies), retry delivery with plain text, and fail loud when both formatted and plain payloads are empty to avoid false delivered states. (#25096, #25091).
- Telegram/Media fetch: prioritize IPv4 before IPv6 in SSRF pinned DNS address ordering so media downloads still work on hosts with broken IPv6 routing. (#24295, #23975).
- Telegram/Outbound API: replace Node 22's global undici dispatcher when applying Telegram `autoSelectFamily` decisions so outbound `fetch` calls inherit IPv4 fallback instead of staying pinned to stale dispatcher settings. (#25682, #25676).
- Onboarding/Telegram: keep core-channel onboarding available when plugin registry population is missing by falling back to built-in adapters and continuing wizard setup with actionable recovery guidance..
- Android/Gateway auth: preserve Android gateway auth state across onboarding, use the native client id for operator sessions, retry with shared-token fallback after device-token auth failures, and avoid clearing tokens on transient connect errors.
- Slack/DM routing: treat `D*` channel IDs as direct messages even when Slack sends an incorrect `channel_type`, preventing DM traffic from being misclassified as channel/group chats..
- Zalo/Group policy: enforce sender authorization for group messages with `groupPolicy` + `groupAllowFrom` (fallback to `allowFrom`), default runtime group behavior to fail-closed allowlist, and block unauthorized non-command group messages before dispatch. for reporting.
- macOS/Voice input: guard all audio-input startup paths against missing default microphones (Voice Wake, Talk Mode, Push-to-Talk, mic-level monitor, tester) to avoid launch/runtime crashes on mic-less Macs and fail gracefully until input becomes available..
- macOS/IME input: when marked text is active, treat Return as IME candidate confirmation first in both the voice overlay composer and shared chat composer to prevent accidental sends while composing CJK text..
- macOS/Voice wake routing: default forwarded voice-wake transcripts to the `webchat` channel (instead of ambiguous `last` routing) so local voice prompts stay pinned to the control chat surface unless explicitly overridden..
- macOS/Gateway launch: prefer an available `kibo` binary before pnpm/node runtime fallback when resolving local gateway commands, so local startup no longer fails on hosts with broken runtime discovery..
- macOS/Menu bar: stop reusing the injector delegate for the "Usage cost (30 days)" submenu to prevent recursive submenu injection loops when opening cost history..
- macOS/WebChat panel: fix rounded-corner clipping by using panel-specific visual-effect blending and matching corner masking on both effect and hosting layers. and.
- Windows/Exec shell selection: prefer PowerShell 7 (`pwsh`) discovery (Program Files, ProgramW6432, PATH) before falling back to Windows PowerShell 5.1, fixing `&&` command chaining failures on Windows hosts with PS7 installed. (#25684, #25638).
- Windows/Media safety checks: align async local-file identity validation with sync-safe-open behavior by treating win32 `dev=0` stats as unknown-device fallbacks (while keeping strict dev checks when both sides are non-zero), fixing false `Local media path is not safe to read` drops for local attachments/TTS/images. (#25708, #21989, #25699, #25878).
- iMessage/Reasoning safety: harden iMessage echo suppression with outbound `messageId` matching (plus scoped text fallback), and enforce reasoning-payload suppression on routed outbound delivery paths to prevent hidden thinking text from being sent as user-visible channel messages. (#25897, #1649, #25757) and.
- Providers/OpenRouter/Auth profiles: bypass auth-profile cooldown/disable windows for OpenRouter, so provider failures no longer put OpenRouter profiles into local cooldown and stale legacy cooldown markers are ignored in fallback and status selection paths. for raising this and for the fix.
- Providers/Google reasoning: sanitize invalid negative `thinkingBudget` payloads for Gemini 3.1 requests by dropping `-1` budgets and mapping configured reasoning effort to `thinkingLevel`, preventing malformed reasoning payloads on `google-generative-ai`..
- Providers/SiliconFlow: normalize `thinking="off"` to `thinking: null` for `Pro/*` model payloads to avoid provider-side 400 loops and misleading compaction retries..
- Models/Bedrock auth: normalize additional Bedrock provider aliases (`bedrock`, `aws-bedrock`, `aws_bedrock`, `amazon bedrock`) to canonical `amazon-bedrock`, ensuring auth-mode resolution consistently selects AWS SDK fallback..
- Models/Providers: preserve explicit user `reasoning` overrides when merging provider model config with built-in catalog metadata, so `reasoning: false` is no longer overwritten by catalog defaults..
- Gateway/Auth: allow trusted-proxy authenticated Control UI websocket sessions to skip device pairing when device identity is absent, preventing false `pairing required` failures behind trusted reverse proxies..
- CLI/Memory search: accept `--query <text>` for `kibo memory search` (while keeping positional query support), and emit a clear error when neither form is provided. (#25904, #25857) and.
- CLI/Doctor: correct stale recovery hints to use valid commands (`kibo gateway status --deep` and `kibo configure --section model`)..
- Doctor/Sandbox: when sandbox mode is enabled but Docker is unavailable, surface a clear actionable warning (including failure impact and remediation) instead of a mild "skip checks" note..
- Doctor/Plugins: auto-enable now resolves third-party channel plugins by manifest plugin id (not channel id), preventing invalid `plugins.entries.<channelId>` writes when ids differ..
- Config/Plugins: treat stale removed `google-antigravity-auth` plugin references as compatibility warnings (not hard validation errors) across `plugins.entries`, `plugins.allow`, `plugins.deny`, and `plugins.slots.memory`, so startup no longer fails after antigravity removal. (#25538, #25862).
- Config/Meta: accept numeric `meta.lastTouchedAt` timestamps and coerce them to ISO strings, preserving compatibility with agent edits that write `Date.now()` values..
- Usage accounting: parse Moonshot/Kimi `cached_tokens` fields (including `prompt_tokens_details.cached_tokens`) into normalized cache-read usage metrics..
- Agents/Tool dispatch: await block-reply flush before tool execution starts so buffered block replies preserve message ordering around tool calls..
- Agents/Billing classification: prevent long assistant/user-facing text from being rewritten as billing failures while preserving explicit `status/code/http 402` detection for oversized structured error payloads. (#25680, #25661).
- Sessions/Tool-result guard: avoid generating synthetic `toolResult` entries for assistant turns that ended with `stopReason: "aborted"` or `"error"`, preventing orphaned tool-use IDs from triggering downstream API validation errors..
- Auto-reply/Reset hooks: guarantee native `/new` and `/reset` flows emit command/reset hooks even on early-return command paths, with dedupe protection to avoid double hook emission..
- Hooks/Slug generator: resolve session slug model from the agent's effective model (including defaults/fallback resolution) instead of raw agent-primary config only..
- Sandbox/FS bridge tests: add regression coverage for dash-leading basenames to confirm sandbox file reads resolve to absolute container paths (and avoid shell-option misdiagnosis for dashed filenames)..
- Sandbox/FS bridge: build canonical-path shell scripts with newline separators (not `; ` joins) to avoid POSIX `sh` `do;` syntax errors that broke sandbox file/image read-write operations. (#25737, #25824, #25868) and.
- Sandbox/Config: preserve `dangerouslyAllowReservedContainerTargets` and `dangerouslyAllowExternalBindSources` during sandbox docker config resolution so explicit bind-mount break-glass overrides reach runtime validation..
- Gateway/Security: enforce gateway auth for the exact `/api/channels` plugin root path (plus `/api/channels/` descendants), with regression coverage for query/trailing-slash variants and near-miss paths that must remain plugin-owned..
- Exec approvals: treat bare allowlist `*` as a true wildcard for parsed executables, including unresolved PATH lookups, so global opt-in allowlists work as configured..
- iOS/Signing: improve `scripts/ios-team-id.sh` for Xcode 16+ by falling back to Xcode-managed provisioning profiles, add actionable guidance when an Apple account exists but no Team ID can be resolved, and ignore Xcode `xcodebuild` output directories (`apps/ios/build`, `apps/shared/KiboKit/build`, `Swabble/build`)..
- Control UI/Chat images: route image-click opens through a shared safe-open helper (allowing only safe URL schemes) and open new tabs with opener isolation to block tabnabbing. (#18685, #25444, #25847) and.
- Security/Exec: sanitize inherited host execution environment before merge, canonicalize inherited PATH handling, and strip dangerous keys (`LD_*`, `DYLD_*`, `SSLKEYLOGFILE`, and related injection vectors) from non-sandboxed exec runs..
- Security/Hooks: normalize hook session-key classification with trim/lowercase plus Unicode NFKC folding (for example full-width `HOOK:...`) so external-content wrapping cannot be bypassed by mixed-case or lookalike prefixes..
- Security/Voice Call: add Telnyx webhook replay detection and canonicalize replay-key signature encoding (Base64/Base64URL equivalent forms dedupe together), so duplicate signed webhook deliveries no longer re-trigger side effects..
- Security/Sandbox media: restrict sandbox media tmp-path allowances to Kibo-managed tmp roots instead of broad host `os.tmpdir()` trust, and add outbound/channel guardrails (tmp-path lint + media-root smoke tests) to prevent regressions in local media attachment reads. for reporting.
- Security/Sandbox media: reject hard-linked Kibo tmp media aliases (including symlink-to-hardlink chains) during sandbox media path resolution to prevent out-of-sandbox inode alias reads..
- Security/Message actions: enforce local media root checks for `sendAttachment` and `setGroupIcon` when `sandboxRoot` is unset, preventing attachment hydration from reading arbitrary host files via local absolute paths. for reporting.
- Security/Telegram: enforce DM authorization before media download/write (including media groups) and move telegram inbound activity tracking after DM authorization, preventing unauthorized sender-triggered inbound media disk writes. for reporting.
- Security/Workspace FS: normalize `@`-prefixed paths before workspace-boundary checks (including workspace-only read/write/edit and sandbox mount path guards), preventing absolute-path escape attempts from bypassing guard validation. for reporting.
- Security/Synology Chat: enforce fail-closed allowlist behavior for DM ingress so `dmPolicy: "allowlist"` with empty `allowedUserIds` rejects all senders instead of allowing unauthorized dispatch. for the contribution and for reporting.
- Security/Native images: enforce `tools.fs.workspaceOnly` for native prompt image auto-load (including history refs), preventing out-of-workspace sandbox mounts from being implicitly ingested as vision input. for reporting.
- Security/Exec approvals: bind `system.run` command display/approval text to full argv when shell-wrapper inline payloads carry positional argv values, and reject payload-only `rawCommand` mismatches for those wrapper-carrier forms, preventing hidden command execution under misleading approval text. for reporting.
- Security/Exec companion host: forward canonical `system.run` display text (not payload-only shell snippets) to the macOS exec host, and enforce rawCommand/argv consistency there for shell-wrapper positional-argv carriers and env-modifier preludes, preventing companion-side approval/display drift. for reporting.
- Security/Exec approvals: fail closed when transparent dispatch-wrapper unwrapping exceeds the depth cap, so nested `/usr/bin/env` chains cannot bypass shell-wrapper approval gating in `allowlist` + `ask=on-miss` mode. for reporting.
- Security/Exec: limit default safe-bin trusted directories to immutable system paths (`/bin`, `/usr/bin`) and require explicit opt-in (`tools.exec.safeBinTrustedDirs`) for package-manager/user bin paths (for example Homebrew), add security-audit findings for risky trusted-dir choices, warn at runtime when explicitly trusted dirs are group/world writable, and add doctor hints when configured `safeBins` resolve outside trusted dirs. for reporting.
- Gateway/Sessions: preserve `modelProvider` on `sessions.reset` and avoid incorrect provider prefixes for legacy session models..
- Agents/Compaction: harden summarization prompts to preserve opaque identifiers verbatim (UUIDs, IDs, tokens, host/IP/port, URLs), reducing post-compaction identifier drift and hallucinated identifier reconstruction.
- Security/Sandbox: canonicalize bind-mount source paths via existing-ancestor realpath so symlink-parent + non-existent-leaf paths cannot bypass allowed-source-roots or blocked-path checks..

### Breaking

- **BREAKING:** Heartbeat delivery now blocks direct/DM targets when destination parsing identifies a direct chat (for example `user:<id>`, Telegram user chat IDs, or WhatsApp direct numbers/JIDs). Heartbeat runs still execute, but direct-message delivery is skipped and only non-DM destinations (for example channel/group targets) can receive outbound heartbeat messages.
- **BREAKING:** Security/Sandbox: block Docker `network: "container:<id>"` namespace-join mode by default for sandbox and sandbox-browser containers. To keep that behavior intentionally, set `agents.defaults.sandbox.docker.dangerouslyAllowContainerNamespaceJoin: true` (break-glass). for reporting.

## 2026.2.23

### Changes

- Providers/Kilo Gateway: add first-class `kilocode` provider support (auth, onboarding, implicit provider detection, model defaults, transcript/cache-ttl handling, and docs), with default model `kilocode/anthropic/claude-opus-4.6`. and.
- Providers/Vercel AI Gateway: accept Claude shorthand model refs (`vercel-ai-gateway/claude-*`) by normalizing to canonical Anthropic-routed model ids., and.
- Docs/Prompt caching: add a dedicated prompt-caching reference covering `cacheRetention`, per-agent `params` merge precedence, Bedrock/OpenRouter behavior, and cache-ttl + heartbeat tuning..
- Gateway/HTTP security headers: add optional `gateway.http.securityHeaders.strictTransportSecurity` support to emit `Strict-Transport-Security` for direct HTTPS deployments, with runtime wiring, validation, tests, and hardening docs.
- Sessions/Cron: harden session maintenance with `kibo sessions cleanup`, per-agent store targeting, disk-budget controls (`session.maintenance.maxDiskBytes` / `highWaterBytes`), and safer transcript/archive cleanup + run-log retention behavior..
- Tools/web_search: add `provider: "kimi"` (Moonshot) support with key/config schema wiring and a corrected two-step `$web_search` tool flow that echoes tool results before final synthesis, including citation extraction from search results. (#16616, #18822).
- Media understanding/Video: add a native Moonshot video provider and include Moonshot in auto video key detection, plus refactor video execution to honor `entry/config/provider` baseUrl+header precedence (matching audio behavior)..
- Agents/Config: support per-agent `params` overrides merged on top of model defaults (including `cacheRetention`) so mixed-traffic agents can tune cache behavior independently. (#17470, #17112).
- Agents/Bootstrap: cache bootstrap file snapshots per session key and clear them on session reset/delete, reducing prompt-cache invalidations from in-session `AGENTS.md`/`MEMORY.md` writes..

### Fixes

- Security/Config: redact sensitive-looking dynamic catchall keys in `config.get` snapshots (for example `env.*` and `skills.entries.*.env.*`) and preserve round-trip restore behavior for those redacted sentinels..
- Tests/Vitest: tier local parallel worker defaults by host memory, keep gateway serial by default on non-high-memory hosts, and document a low-profile fallback command for memory-constrained land/gate runs to prevent local OOMs..
- WhatsApp/Group policy: fix `groupAllowFrom` sender filtering when `groupPolicy: "allowlist"` is set without explicit `groups` - previously all group messages were blocked even for allowlisted senders..
- Agents/Context pruning: extend `cache-ttl` eligibility to Moonshot/Kimi and ZAI/GLM providers (including OpenRouter model refs), so `contextPruning.mode: "cache-ttl"` is no longer silently skipped for those sessions..
- Doctor/Memory: query gateway-side default-agent memory embedding readiness during `kibo doctor` (instead of inferring from generic gateway health), and warn when the gateway memory probe is unavailable or not ready while keeping `kibo configure` remediation guidance..
- Sessions/Store: canonicalize inbound mixed-case session keys for metadata and route updates, and migrate legacy case-variant entries to a single lowercase key to prevent duplicate sessions and missing TUI/WebUI history..
- Telegram/Reactions: soft-fail reaction action errors (policy/token/emoji/API), accept snake_case `message_id`, and fallback to inbound message-id context when explicit `messageId` is omitted so DM reactions stay stable without regeneration loops. (#20236, #21001) and.
- Telegram/Polling: scope persisted polling offsets to bot identity and reuse a single awaited runner-stop path on abort/retry, preventing cross-token offset bleed and overlapping pollers during restart/error recovery. (#10850, #11347), and.
- Telegram/Reasoning: when `/reasoning off` is active, suppress reasoning-only delivery segments and block raw fallback resend of suppressed `Reasoning:`/`<think>` text, preventing internal reasoning leakage in legacy sessions while preserving answer delivery. (#24626, #24518)
- Agents/Reasoning: when model-default thinking is active (for example `thinking=low`), keep auto-reasoning disabled unless explicitly enabled, preventing `Reasoning:` thinking-block leakage in channel replies. (#24335, #24290).
- Agents/Reasoning: avoid classifying provider reasoning-required errors as context overflows so these failures no longer trigger compaction-style overflow recovery..
- Agents/Models: codify `agents.defaults.model` / `agents.defaults.imageModel` config-boundary input as `string | {primary,fallbacks}`, split explicit vs effective model resolution, and fix `models status --agent` source attribution so defaults-inherited agents are labeled as `defaults` while runtime selection still honors defaults fallback..
- Agents/Compaction: pass `agentDir` into manual `/compact` command runs so compaction auth/profile resolution stays scoped to the active agent..
- Agents/Compaction: pass model metadata through the embedded runtime so safeguard summarization can run when `ctx.model` is unavailable, avoiding repeated `"Summary unavailable due to context limits"` fallback summaries. and.
- Agents/Compaction: cancel safeguard compaction when summary generation cannot run (missing model/API key or summarization failure), preserving history instead of truncating to fallback `"Summary unavailable"` text. and.
- Agents/Tools: make `session_status` read transcript-derived usage mid-turn and tail-read session logs for cache-aware context reporting without full-log scans..
- Agents/Overflow: detect additional provider context-overflow error shapes (including `input length` + `max_tokens` exceed-context variants) so failures route through compaction/recovery paths instead of leaking raw provider errors to users..
- Agents/Overflow: add Chinese context-overflow pattern detection in `isContextOverflowError` so localized provider errors route through overflow recovery paths..
- Agents/Failover: treat HTTP 502/503/504 errors as failover-eligible transient timeouts so fallback chains can switch providers/models during upstream outages instead of retrying the same failing target. and.
- Auto-reply/Inbound metadata: hide direct-chat `message_id`/`message_id_full` and sender metadata only from normalized chat type (not sender-id sentinels), preserving group metadata visibility and preventing sender-id spoofed direct-mode classification..
- Auto-reply/Inbound metadata: move dynamic inbound `flags` (reply/forward/thread/history) from system metadata to user-context conversation info, preventing turn-by-turn prompt-cache invalidation from flag toggles..
- Auto-reply/Sessions: remove auth-key labels from `/new` and `/reset` confirmation messages so session reset notices never expose API key prefixes or env-key labels in chat output. (#24384, #24409).
- Slack/Group policy: move Slack account `groupPolicy` defaulting to provider-level schema defaults so multi-account configs inherit top-level `channels.slack.groupPolicy` instead of silently overriding inheritance with per-account `allowlist`..
- Providers/Anthropic: skip `context-1m-*` beta injection for OAuth/subscription tokens (`sk-ant-oat-*`) while preserving OAuth-required betas, avoiding Anthropic 401 auth failures when `params.context1m` is enabled. (#10647, #20354) and.
- Providers/DashScope: mark DashScope-compatible `openai-completions` endpoints as `supportsDeveloperRole=false` so Kibo sends `system` instead of unsupported `developer` role on Qwen/DashScope APIs. and.
- Providers/Bedrock: disable prompt-cache retention for non-Anthropic Bedrock models so Nova/Mistral requests do not send unsupported cache metadata..
- Providers/Bedrock: apply Anthropic-Claude cacheRetention defaults and runtime pass-through for `amazon-bedrock/*anthropic.claude*` model refs, while keeping non-Anthropic Bedrock models excluded..
- Providers/OpenRouter: remove conflicting top-level `reasoning_effort` when injecting nested `reasoning.effort`, preventing OpenRouter 400 payload-validation failures for reasoning models..
- Plugins/Install: when npm install returns 404 for bundled channel npm specs, fallback to bundled channel sources and complete install/enable persistence instead of failing plugin install..
- Gemini OAuth/Auth: resolve npm global shim install layouts while discovering Gemini CLI credentials, preventing false "Gemini CLI not found" onboarding/auth failures when shim paths are on `PATH`. and.
- Providers/Groq: avoid classifying Groq TPM limit errors as context overflow so throttling paths no longer trigger overflow recovery logic..
- Gateway/Restart: treat child listener PIDs as owned by the service runtime PID during restart health checks to avoid false stale-process kills and restart timeouts on launchd/systemd..
- Config/Write: apply `unsetPaths` with immutable path-copy updates so config writes never mutate caller-provided objects, and harden `kibo config get/set/unset` path traversal by rejecting prototype-key segments and inherited-property traversal..
- Channels/WhatsApp: accept `channels.whatsapp.enabled` in config validation to match built-in channel auto-enable behavior, preventing `Unrecognized key: "enabled"` failures during channel setup..
- Security/Exec: detect obfuscated commands before exec allowlist decisions and require explicit approval for obfuscation patterns. and.
- Security/ACP: harden ACP client permission auto-approval to require trusted core tool IDs, ignore untrusted `toolCall.kind` hints, and scope `read` auto-approval to the active working directory so unknown tool names and out-of-scope file reads always prompt. for reporting.
- Security/Skills: escape user-controlled prompt, filename, and output-path values in `openai-image-gen` HTML gallery generation to prevent stored XSS in generated `index.html` output..
- Security/Skills: harden `skill-creator` packaging by skipping symlink entries and rejecting files whose resolved paths escape the selected skill root. (#24260, #16959) and.
- Security/OTEL: redact sensitive values (API keys, tokens, credential fields) from diagnostics-otel log bodies, log attributes, and error/reason span fields before OTLP export..
- Security/CI: add pre-commit security hook coverage for private-key detection and production dependency auditing, and enforce those checks in CI alongside baseline secret scanning..
- Skills/Python: harden skill script packaging and validation edge cases (self-including `.skill` outputs, CRLF frontmatter parsing, strict `--days` validation, and safer image file loading), with expanded Python regression coverage..
- Skills/Python: add CI + pre-commit linting (`ruff`) and pytest discovery coverage for Python scripts/tests under `skills/`, including package test execution from repo root..

### Breaking

- **BREAKING:** browser SSRF policy now defaults to trusted-network mode (`browser.ssrfPolicy.dangerouslyAllowPrivateNetwork=true` when unset), and canonical config uses `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork` instead of `browser.ssrfPolicy.allowPrivateNetwork`. `kibo doctor --fix` migrates the legacy key automatically.

## 2026.2.22

### Changes

- Control UI/Agents: make the Tools panel data-driven from runtime `tools.catalog`, add per-tool provenance labels (`core` / `plugin:<id>` + optional marker), and keep a static fallback list when the runtime catalog is unavailable.
- Web Search/Gemini: add grounded Gemini provider support with provider auto-detection and config/docs updates. (#13075, #13074).
- Control UI/Cron: add full web cron edit parity (including clone and richer validation/help text), plus all-jobs run history with pagination/search/sort/multi-filter controls and improved cron page layout for cleaner scheduling and failure triage workflows.
- Provider/Mistral: add support for the Mistral provider, including memory embeddings and voice support..
- Update/Core: add an optional built-in auto-updater for package installs (`update.auto.*`), default-off, with stable rollout delay+jitter and beta hourly cadence.
- CLI/Update: add `kibo update --dry-run` to preview channel/tag/target/restart actions without mutating config, installing, syncing plugins, or restarting.
- Config/UI: add tag-aware settings filtering and broaden config labels/help copy so fields are easier to discover and understand in the dashboard config screen.
- Channels/Synology Chat: add a native Synology Chat channel plugin with webhook ingress, direct-message routing, outbound send/media support, per-account config, and DM policy controls..
- iOS/Talk: prefetch TTS segments and suppress expected speech-cancellation errors for smoother talk playback..
- Memory/FTS: add Spanish and Portuguese stop-word filtering for query expansion in FTS-only search mode, improving conversational recall for both languages..
- Memory/FTS: add Japanese-aware query expansion tokenization and stop-word filtering (including mixed-script terms like ASCII + katakana) for FTS-only search mode..
- Memory/FTS: add Korean stop-word filtering and particle-aware keyword extraction (including mixed Korean/English stems) for query expansion in FTS-only search mode..
- Memory/FTS: add Arabic stop-word filtering for query expansion in FTS-only search mode to reduce conversational filler in Arabic memory searches..
- Discord/Allowlist: canonicalize resolved Discord allowlist names to IDs and split resolution flow for clearer fail-closed behavior.
- Channels/Config: unify channel preview streaming config handling with a shared resolver and canonical migration path.
- Gateway/Auth: unify call/probe/status/auth credential-source precedence on shared resolver helpers, with table-driven parity coverage across gateway entrypoints.
- Gateway/Auth: refactor gateway credential resolution and websocket auth handshake paths to use shared typed auth contexts, including explicit `auth.deviceToken` support in connect frames and tests.
- Skills: remove bundled `food-order` skill from this repo; manage/install it from KiboHub instead.
- Docs/Subagents: make thread-bound session guidance channel-first instead of Discord-specific, and list thread-supporting channels explicitly..

### Fixes

- Sessions/Resilience: ignore invalid persisted `sessionFile` metadata and fall back to the derived safe transcript path instead of aborting session resolution for handlers and tooling. and.
- Sessions/Paths: resolve symlinked state-dir aliases during transcript-path validation while preserving safe cross-agent/state-root compatibility for valid `agents/<id>/sessions/**` paths. and.
- Agents/Compaction: count auto-compactions only after a non-retry `auto_compaction_end`, keeping session `compactionCount` aligned to completed compactions.
- Security/CLI: redact sensitive values in `kibo config get` output before printing config paths, preventing credential leakage to terminal output/history..
- Agents/Moonshot: force `supportsDeveloperRole=false` for Moonshot-compatible `openai-completions` models (provider `moonshot` and Moonshot base URLs), so initial runs no longer send unsupported `developer` roles that trigger `ROLE_UNSPECIFIED` errors. (#21060, #22194).
- Agents/Kimi: classify Moonshot `Your request exceeded model token limit` failures as context overflows so auto-compaction and user-facing overflow recovery trigger correctly instead of surfacing raw invalid-request errors..
- Providers/Moonshot: mark Kimi K2.5 as image-capable in implicit + onboarding model definitions, and refresh stale explicit provider capability fields (`input`/`reasoning`/context limits) from implicit catalogs so existing configs pick up Moonshot vision support without manual model rewrites. (#13135, #4459).
- Agents/Transcript: enable consecutive-user turn merging for strict non-OpenAI `openai-completions` providers (for example Moonshot/Kimi), reducing `roles must alternate` ordering failures on OpenAI-compatible endpoints while preserving current OpenRouter/Opencode behavior..
- Install/Discord Voice: make the native Opus decoder optional so `kibo` install/update no longer hard-fails when native builds fail, while keeping `opusscript` as the runtime fallback decoder for Discord voice flows. (#23737, #23733, #23703), and.
- Docker/Setup: precreate `$KIBO_CONFIG_DIR/identity` during `docker-setup.sh` so CLI commands that need device identity (for example `devices list`) avoid `EACCES ... /home/node/.kibo/identity` failures on restrictive bind mounts..
- Exec/Background: stop applying the default exec timeout to background sessions (`background: true` or explicit `yieldMs`) when no explicit timeout is set, so long-running background jobs are no longer terminated at the default timeout boundary..
- Slack/Threading: sessions: keep parent-session forking and thread-history context active beyond first turn by removing first-turn-only gates in session init, thread-history fetch, and reply prompt context injection. (#23843, #23090) and.
- Slack/Threading: respect `replyToMode` when Slack auto-populates top-level `thread_ts`, and ignore inline `replyToId` directive tags when `replyToMode` is `off` so thread forcing stays disabled unless explicitly configured. (#23839, #23320, #23513) and.
- Slack/Extension: forward `message read` `threadId` to `readMessages` and use delivery-context `threadId` as outbound `thread_ts` fallback so extension replies/reads stay in the correct Slack thread. (#22216, #22485, #23836) and.
- Slack/Upload: resolve bare user IDs (U-prefix) to DM channel IDs via `conversations.open`, and replace `files.uploadV2` with Slack's external 3-step upload flow (`files.getUploadURLExternal` → presigned upload POST → `files.completeUploadExternal`) to avoid `missing_scope`/`invalid_arguments` upload failures in DM and threaded media replies.
- Webchat/Chat: apply assistant `final` payload messages directly to chat state so sent turns render without waiting for a full history refresh cycle..
- Webchat/Chat: for out-of-band final events (for example tool-call side runs), append provided final assistant payloads directly instead of forcing a transient history reset..
- Webchat/Performance: reload `chat.history` after final events only when the final payload lacks a renderable assistant message, avoiding expensive full-history refreshes on normal turns..
- Webchat/Sessions: preserve external session routing metadata when internal `chat.send` turns run under `webchat`, so explicit channel-keyed sessions (for example Telegram) no longer get rewritten to `webchat` and misroute follow-up delivery..
- Webchat/Sessions: preserve existing session `label` across `/new` and `/reset` rollovers so reset sessions remain discoverable in session history lists..
- Gateway/Chat UI: strip inline reply/audio directive tags from non-streaming final webchat broadcasts (including `chat.inject`) while preserving empty-string message content when tags are the entire reply..
- Chat/UI: strip inline reply/audio directive tags (`[[reply_to_current]]`, `[[reply_to:<id>]]`, `[[audio_as_voice]]`) from displayed chat history, live chat event output, and session preview snippets so control tags no longer leak into user-visible surfaces.
- Gateway/Chat UI: sanitize non-streaming final `chat.send`/`chat.inject` payload text with the same envelope/untrusted-context stripping used by `chat.history`, preventing `<<<EXTERNAL_UNTRUSTED_CONTENT...>>>` wrapper markup from rendering in Control UI chat..
- Telegram/Media: send a user-facing Telegram reply when media download fails (non-size errors) instead of silently dropping the message.
- Telegram/Webhook: keep webhook monitors alive until gateway abort signals fire, preventing false channel exits and immediate webhook auto-restart loops.
- Telegram/Polling: retry recoverable setup-time network failures in monitor startup and await runner teardown before retry to avoid overlapping polling sessions.
- Telegram/Polling: clear Telegram webhooks (`deleteWebhook`) before starting long-poll `getUpdates`, including retry handling for transient cleanup failures.
- Telegram/Webhook: add `channels.telegram.webhookPort` config support and pass it through plugin startup wiring to the monitor listener.
- Browser/Extension Relay: refactor the MV3 worker to preserve debugger attachments across relay drops, auto-reconnect with bounded backoff+jitter, persist and rehydrate attached tab state via `chrome.storage.session`, recover from `target_closed` navigation detaches, guard stale socket handlers, enforce per-tab operation locks and per-request timeouts, and add lifecycle keepalive/badge refresh hooks (`alarms`, `webNavigation`). (#15099, #6175, #8468, #9807)
- Browser/Relay: treat extension websocket as connected only when `OPEN`, allow reconnect when a stale `CLOSING/CLOSED` extension socket lingers, and guard stale socket message/close handlers so late events cannot clear active relay state; includes regression coverage for live-duplicate `409` rejection and immediate reconnect-after-close races. (#15099, #18698, #20688)
- Browser/Remote CDP: extend stale-target recovery so `ensureTabAvailable()` now reuses the sole available tab for remote CDP profiles (same behavior as extension profiles) while preserving strict `tab not found` errors when multiple tabs exist; includes remote-profile regression tests..
- Gateway/Pairing: treat `operator.admin` as satisfying other `operator.*` scope checks during device-auth verification so local CLI/TUI sessions stop entering pairing-required loops for pairing/approval-scoped commands. (#22062, #22193, #21191), and.
- Gateway/Pairing: auto-approve loopback `scope-upgrade` pairing requests (including device-token reconnects) so local clients do not disconnect on pairing-required scope elevation..
- Gateway/Scopes: include `operator.read` and `operator.write` in default operator connect scope bundles across CLI, Control UI, and macOS clients so write-scoped announce/sub-agent follow-up calls no longer hit `pairing required` disconnects on loopback gateways..
- Gateway/Pairing: treat operator.admin pairing tokens as satisfying operator.write requests so legacy devices stop looping through scope-upgrade prompts introduced in 2026.2.19. (#23125, #23006).
- Gateway/Restart: fix restart-loop edge cases by keeping `kibo.mjs -> dist/entry.js` bootstrap detection explicit, reacquiring the gateway lock for in-process restart fallback paths, and tightening restart-loop regression coverage..
- Gateway/Lock: use optional gateway-port reachability as a primary stale-lock liveness signal (and wire gateway run-loop lock acquisition to the resolved port), reducing false "already running" lockouts after unclean exits..
- Delivery/Queue: quarantine queue entries immediately on known permanent delivery errors (for example invalid recipients or missing conversation references) by moving them to `failed/` instead of retrying on every restart..
- Cron/Status: split execution outcome (`lastRunStatus`) from delivery outcome (`lastDeliveryStatus`) in persisted cron state, finished events, and run history so failed/unknown announcement delivery is visible without conflating it with run errors.
- Cron/Delivery: route text-only announce jobs with explicit thread/topic targets through direct outbound delivery so forum/thread destinations do not get dropped by intermediary announce turns..
- Cron: honor `cron.maxConcurrentRuns` in the timer loop so due jobs can execute up to the configured parallelism instead of always running serially..
- Cron/Run: enforce the same per-job timeout guard for manual `cron.run` executions as timer-driven runs, including abort propagation for isolated agent jobs, so forced runs cannot wedge indefinitely..
- Cron/Run: persist the manual-run `runningAtMs` marker before releasing the cron lock so overlapping timer ticks cannot start the same job concurrently.
- Cron/Startup: enforce per-job timeout guards for startup catch-up replay runs so missed isolated jobs cannot hang indefinitely during gateway boot recovery.
- Cron/Main session: honor abort/timeout signals while retrying `wakeMode=now` heartbeat contention loops so main-target cron runs stop promptly instead of waiting through the full busy-retry window.
- Cron/Schedule: for `every` jobs, prefer `lastRunAtMs + everyMs` when still in the future after restarts, then fall back to anchor scheduling for catch-up windows, so NEXT timing matches the last successful cadence..
- Cron/Service: execute manual `cron.run` jobs outside the cron lock (while still persisting started/finished state atomically) so `cron.list` and `cron.status` remain responsive during long forced runs..
- Cron/Timer: keep a watchdog recheck timer armed while `onTimer` is actively executing so the scheduler continues polling even if a due-run tick stalls for an extended period..
- Cron/Run log: clean up settled per-path run-log write queue entries so long-running cron uptime does not retain stale promise bookkeeping in memory.
- Cron/Run log: harden `cron.runs` run-log path resolution by rejecting path-separator `id`/`jobId` inputs and enforcing reads within the per-cron `runs/` directory.
- Cron/Announce: when announce delivery target resolution fails (for example multiple configured channels with no explicit target), skip injecting fallback `Cron (error): ...` into the main session so runs fail cleanly without accidental last-route sends..
- Cron/Telegram: validate cron `delivery.to` with shared Telegram target parsing and resolve legacy `@username`/`t.me` targets to numeric IDs at send-time for deterministic delivery target writeback..
- Telegram/Targets: normalize unprefixed topic-qualified targets through the shared parse/normalize path so valid `@channel:topic:<id>` and `<chatId>:topic:<id>` routes are recognized again..
- Cron/Isolation: force fresh session IDs for isolated cron runs so `sessionTarget="isolated"` executions never reuse prior run context..
- Plugins/Install: strip `workspace:*` devDependency entries from copied plugin manifests before `npm install --omit=dev`, preventing `EUNSUPPORTEDPROTOCOL` install failures for npm-published channel plugins (including Feishu and MS Teams).
- Feishu/Plugins: restore bundled Feishu SDK availability for global installs and strip `kibo: workspace:*` from plugin `devDependencies` during plugin-version sync so npm-installed Feishu plugins do not fail dependency install. (#23611, #23645, #23603)
- Config/Channels: auto-enable built-in channels by writing `channels.<id>.enabled=true` (not `plugins.entries.<id>`), and stop adding built-ins to `plugins.allow`, preventing `plugins.entries.telegram: plugin not found` validation failures.
- Config/Channels: when `plugins.allow` is active, auto-enable/enable flows now also allowlist configured built-in channels so `channels.<id>.enabled=true` cannot remain blocked by restrictive plugin allowlists.
- Plugins/Discovery: ignore scanned extension backup/disabled directory patterns (for example `.backup-*`, `.bak`, `.disabled*`) and move updater backup directories under `.kibo-install-backups`, preventing duplicate plugin-id collisions from archived copies.
- Plugins/CLI: make `kibo plugins enable` and plugin install/link flows update allowlists via shared plugin-enable policy so enabled plugins are not left disabled by allowlist mismatch..
- Security/Voice Call: harden media stream WebSocket handling against pre-auth idle-connection DoS by adding strict pre-start timeouts, pending/per-IP connection limits, and total connection caps for streaming endpoints. for reporting.
- Security/Sessions: redact sensitive token patterns from `sessions_history` tool output and surface `contentRedacted` metadata when masking occurs..
- Security/Exec: stop trusting `PATH`-derived directories for safe-bin allowlist checks, add explicit `tools.exec.safeBinTrustedDirs`, and pin safe-bin shell execution to resolved absolute executable paths to prevent binary-shadowing approval bypasses. for reporting.
- Security/Elevated: match `tools.elevated.allowFrom` against sender identities only (not recipient `ctx.To`), closing a recipient-token bypass for `/elevated` authorization. for reporting.
- Security/Feishu: enforce ID-only allowlist matching for DM/group sender authorization, normalize Feishu ID prefixes during checks, and ignore mutable display names so display-name collisions cannot satisfy allowlist entries. for reporting.
- Security/Group policy: harden `channels.*.groups.*.toolsBySender` matching by requiring explicit sender-key types (`id:`, `e164:`, `username:`, `name:`), preventing cross-identifier collisions across mutable/display-name fields while keeping legacy untyped keys on a deprecated ID-only path. for reporting.
- Channels/Group policy: fail closed when `groupPolicy: "allowlist"` is set without explicit `groups`, honor account-level `groupPolicy` overrides, and enforce `groupPolicy: "disabled"` as a hard group block..
- Telegram/Discord extensions: propagate trusted `mediaLocalRoots` through extension outbound `sendMedia` options so extension direct-send media paths honor agent-scoped local-media allowlists. (#20029, #21903, #23227)
- Agents/Exec: honor explicit agent context when resolving `tools.exec` defaults for runs with opaque/non-agent session keys, so per-agent `host/security/ask` policies are applied consistently..
- CLI/Sessions: resolve implicit session-store path templates with the configured default agent ID so named-agent setups do not silently read/write stale `agent:main` session/auth stores..
- Doctor/Security: add an explicit warning that `approvals.exec.enabled=false` disables forwarding only, while enforcement remains driven by host-local `exec-approvals.json` policy..
- Sandbox/Docker: default sandbox container user to the workspace owner `uid:gid` when `agents.*.sandbox.docker.user` is unset, fixing non-root gateway file-tool permissions under capability-dropped containers..
- Plugins/Media sandbox: propagate trusted `mediaLocalRoots` through plugin action dispatch (including Discord/Telegram action adapters) so plugin send paths enforce the same agent-scoped local-media sandbox roots as core outbound sends. (#20258, #22718)
- Agents/Workspace guard: map sandbox container-workdir file-tool paths (for example `/workspace/...` and `file:///workspace/...`) to host workspace roots before workspace-only validation, preventing false `Path escapes sandbox root` rejections for sandbox file tools..
- Gateway/Exec approvals: expire approval requests immediately when no approval-capable gateway clients are connected and no forwarding targets are available, avoiding delayed approvals after restarts/offline approver windows..
- Security/Exec approvals: when approving wrapper commands with allow-always in allowlist mode, persist inner executable paths for known dispatch wrappers (`env`, `nice`, `nohup`, `stdbuf`, `timeout`) and fail closed (no persisted entry) when wrapper unwrapping is not safe, preventing wrapper-path approval bypasses. for reporting.
- Node/macOS exec host: default headless macOS node `system.run` to local execution and only route through the companion app when `KIBO_NODE_EXEC_HOST=app` is explicitly set, avoiding companion-app filesystem namespace mismatches during exec..
- Sandbox/Media: map container workspace paths (`/workspace/...` and `file:///workspace/...`) back to the host sandbox root for outbound media validation, preventing false deny errors for sandbox-generated local media..
- Sandbox/Docker: apply custom bind mounts after workspace mounts and prioritize bind-source resolution on overlapping paths, so explicit workspace binds are no longer ignored..
- Exec approvals/Forwarding: restore Discord text forwarding when component approvals are not configured, and carry request snapshots through resolve events so resolved notices still forward after cache misses/restarts..
- Control UI/WebSocket: stop and clear the browser gateway client on UI teardown so remounts cannot leave orphan websocket clients that create duplicate active connections..
- Control UI/WebSocket: send a stable per-tab `instanceId` in websocket connect frames so reconnect cycles keep a consistent client identity for diagnostics and presence tracking..
- Config/Memory: allow `"mistral"` in `agents.defaults.memorySearch.provider` and `agents.defaults.memorySearch.fallback` schema validation..
- Feishu/Commands: in group chats, command authorization now falls back to top-level `channels.feishu.allowFrom` when per-group `allowFrom` is not set, so `/command` no longer gets blocked by an unintended empty allowlist..
- Dev tooling: prevent `CLAUDE.md` symlink target regressions by excluding CLAUDE symlink sentinels from `oxfmt` and marking them `-text` in `.gitattributes`, so formatter/EOL normalization cannot reintroduce trailing-newline targets..
- Agents/Compaction: restore embedded compaction safeguard/context-pruning extension loading in production by wiring bundled extension factories into the resource loader instead of runtime file-path resolution. (#22349; landed from contributor PR #5005 by).
- Feishu/Media: for inbound video messages that include both `file_key` (video) and `image_key` (thumbnail), prefer `file_key` when downloading media so video attachments are saved instead of silently failing on thumbnail keys..
- Hooks/Loader: avoid redundant hook-module recompilation on gateway restart by skipping cache-busting for bundled hooks and using stable file metadata keys (`mtime+size`) for mutable workspace/managed/plugin hook imports..
- Hooks/Cron: suppress duplicate main-session events for delivered hook turns and mark `SILENT_REPLY_TOKEN` (`NO_REPLY`) early exits as delivered to prevent hook context pollution..
- Providers/OpenRouter: inject `cache_control` on system prompts for OpenRouter Anthropic models to improve prompt-cache reuse..
- Installer/Smoke tests: remove legacy `KIBO_USE_GUM` overrides from docker install-smoke runs so tests exercise installer auto TTY detection behavior directly.
- Providers/OpenRouter: allow pass-through OpenRouter and Opencode model IDs in live model filtering so custom routed model IDs are treated as modern refs..
- Providers/OpenRouter: default reasoning to enabled when the selected model advertises `reasoning: true` and no session/directive override is set..
- Providers/OpenRouter: map `/think` levels to `reasoning.effort` in embedded runs while preserving explicit `reasoning.max_tokens` payloads..
- Providers/OpenRouter: preserve stored session provider when model IDs are vendor-prefixed (for example, `anthropic/...`) so follow-up turns do not incorrectly route to direct provider APIs..
- Providers/OpenRouter: preserve the required `openrouter/` prefix for OpenRouter-native model IDs during model-ref normalization..
- Providers/OpenRouter: pass through provider routing parameters from model params.provider to OpenRouter request payloads for provider selection controls..
- Providers/OpenRouter: preserve model allowlist entries containing OpenRouter preset paths (for example `openrouter/@preset/...`) by treating `/model ...@profile` auth-profile parsing as a suffix-only override..
- Cron/Auth: propagate auth-profile resolution to isolated cron sessions so provider API keys are resolved the same way as main sessions, fixing 401 errors when using providers configured via auth-profiles..
- Cron/Follow-up: pass resolved `agentDir` through isolated cron and queued follow-up embedded runs so auth/profile lookups stay scoped to the correct agent directory..
- Agents/Media: route tool-result `MEDIA:` extraction through shared parser validation so malformed prose like `MEDIA:-prefixed ...` is no longer treated as a local file path (prevents Telegram ENOENT tool-error overrides)..
- Logging: cap single log-file size with `logging.maxFileBytes` (default 500 MB) and suppress additional writes after cap hit to prevent disk exhaustion from repeated error storms.
- Memory/Remote HTTP: centralize remote memory HTTP calls behind a shared guarded helper (`withRemoteHttpResponse`) so embeddings and batch flows use one request/release path.
- Memory/Embeddings: apply configured remote-base host pinning (`allowedHostnames`) across OpenAI/Voyage/Gemini embedding requests to keep private/self-hosted endpoints working without cross-host drift..
- Memory/Batch: route OpenAI/Voyage/Gemini batch upload/create/status/download requests through the same guarded HTTP path for consistent SSRF policy enforcement.
- Memory/Index: detect memory source-set changes (for example enabling `sessions` after an existing memory-only index) and trigger a full reindex so existing session transcripts are indexed without requiring `--force`..
- Memory/Embeddings: enforce a per-input 8k safety cap before embedding batching and apply a conservative 2k fallback limit for local providers without declared input limits, preventing oversized session/memory chunks from triggering provider context-size failures during sync/indexing..
- Memory/QMD: on Windows, resolve bare `qmd`/`mcporter` command names to npm shim executables (`.cmd`) before spawning, so qmd boot updates and mcporter-backed searches no longer fail with `spawn ... ENOENT` on default npm installs..
- Memory/QMD: parse plain-text `qmd collection list --json` output when older qmd builds ignore JSON mode, and retry memory searches once after re-ensuring managed collections when qmd returns `Collection not found ...`..
- iOS/Watch: normalize watch quick-action notification payloads, support mirrored indexed actions beyond primary/secondary, and fix iOS test-target signing/compile blockers for watch notify coverage..
- Signal/RPC: guard malformed Signal RPC JSON responses with a clear status-scoped error and add regression coverage for invalid JSON responses..
- Gateway/Subagents: guard gateway and subagent session-key/message trim paths against undefined inputs to prevent early `Cannot read properties of undefined (reading 'trim')` crashes during subagent spawn and wait flows.
- Agents/Workspace: guard `resolveUserPath` against undefined/null input to prevent `Cannot read properties of undefined (reading 'trim')` crashes when workspace paths are missing in embedded runner flows.
- Auth/Profiles: keep active `cooldownUntil`/`disabledUntil` windows immutable across retries so mid-window failures cannot extend recovery indefinitely; only recompute a backoff window after the previous deadline has expired. This resolves cron/inbound retry loops that could trap gateways until manual `usageStats` cleanup. (#23516, #23536).
- Channels/Security: fail closed on missing provider group policy config by defaulting runtime group policy to `allowlist` (instead of inheriting `channels.defaults.groupPolicy`) when `channels.<provider>` is absent across message channels, and align runtime + security warnings/docs to the same fallback behavior (Slack, Discord, iMessage, Telegram, WhatsApp, Signal, LINE, Matrix, Mattermost, Google Chat, IRC, Nextcloud Talk, Feishu, and Zalo user flows; plus Discord message/native-command paths)..
- Gateway/Onboarding: harden remote gateway onboarding defaults and guidance by defaulting discovered direct URLs to `wss://`, rejecting insecure non-loopback `ws://` targets in onboarding validation, and expanding remote-security remediation messaging across gateway client/call/doctor flows..
- CLI/Sessions: pass the configured sessions directory when resolving transcript paths in `agentCommand`, so custom `session.store` locations resume sessions reliably..
- Signal/Monitor: treat user-initiated abort shutdowns as clean exits when auto-started `signal-cli` is terminated, while still surfacing unexpected daemon exits as startup/runtime failures..
- Channels/Dedupe: centralize plugin dedupe primitives in plugin SDK (memory + persistent), move Feishu inbound dedupe to a namespace-scoped persistent store, and reuse shared dedupe cache logic for Zalo webhook replay + Tlon processed-message tracking to reduce duplicate handling during reconnect/replay paths..
- Channels/Delivery: remove hardcoded WhatsApp delivery fallbacks; require explicit/session channel context or auto-pick the sole configured channel when unambiguous..
- ACP/Gateway: wait for gateway hello before opening ACP requests, and fail fast on pre-hello connect failures to avoid startup hangs and early `gateway not connected` request races..
- Gateway/Auth: preserve `KIBO_GATEWAY_PASSWORD` env override precedence for remote gateway call credentials after shared resolver refactors, preventing stale configured remote passwords from overriding runtime secret rotation.
- Gateway/Auth: preserve shared-token `gateway token mismatch` auth errors when `auth.token` fallback device-token checks fail, and reserve `device token mismatch` guidance for explicit `auth.deviceToken` failures.
- Gateway/Tools: when agent tools pass an allowlisted `gatewayUrl` override, resolve local override tokens from env/config fallback but keep remote overrides strict to `gateway.remote.token`, preventing local token leakage to remote targets.
- Gateway/Client: keep cached device-auth tokens on `device token mismatch` closes when the client used explicit shared token/password credentials, avoiding accidental pairing-token churn during explicit-auth failures.
- Node host/Exec: keep strict Windows allowlist behavior for `cmd.exe /c` shell-wrapper runs, and return explicit approval guidance when blocked (`SYSTEM_RUN_DENIED: allowlist miss`).
- Control UI: show pairing-required guidance (commands + mobile tokenized URL reminder) when the dashboard disconnects with `1008 pairing required`.
- Security/Audit: add `kibo security audit` detection for open group policies that expose runtime/filesystem tools without sandbox/workspace guards (`security.exposure.open_groups_with_runtime_or_fs`).
- Security/Audit: make `gateway.real_ip_fallback_enabled` severity conditional for loopback trusted-proxy setups (warn for loopback-only `trustedProxies`, critical when non-loopback proxies are trusted)..
- Security/Exec env: block request-scoped `HOME` and `ZDOTDIR` overrides in host exec env sanitizers (Node + macOS), preventing shell startup-file execution before allowlist-evaluated command bodies. for reporting.
- Security/Exec env: block `SHELLOPTS`/`PS4` in host exec env sanitizers and restrict shell-wrapper (`bash|sh|zsh ... -c/-lc`) request env overrides to a small explicit allowlist (`TERM`, `LANG`, `LC_*`, `COLORTERM`, `NO_COLOR`, `FORCE_COLOR`) on both node host and macOS companion paths, preventing xtrace prompt command-substitution allowlist bypasses. for reporting.
- WhatsApp/Security: enforce `allowFrom` for direct-message outbound targets in all send modes (including `mode: "explicit"`), preventing sends to non-allowlisted numbers..
- Security/Exec approvals: fail closed on shell line continuations (`\\\n`/`\\\r\n`) and treat shell-wrapper execution as approval-required in allowlist mode, preventing `$\\` newline command-substitution bypasses. for reporting.
- Security/Gateway: emit a startup security warning when insecure/dangerous config flags are enabled (including `gateway.controlUi.dangerouslyDisableDeviceAuth=true`) and point operators to `kibo security audit`.
- Security/Hooks auth: normalize hook auth rate-limit client IP keys so IPv4 and IPv4-mapped IPv6 addresses share one throttle bucket, preventing dual-form auth-attempt budget bypasses. for reporting.
- Security/Exec approvals: treat `env` and shell-dispatch wrappers as transparent during allowlist analysis on node-host and macOS companion paths so policy checks match the effective executable/inline shell payload instead of the wrapper binary, blocking wrapper-smuggled allowlist bypasses. for reporting.
- Security/Exec approvals: require explicit safe-bin profiles for `tools.exec.safeBins` entries in allowlist mode (remove generic safe-bin profile fallback), and add `tools.exec.safeBinProfiles` for safe custom binaries so unprofiled interpreter-style entries cannot be treated as stdin-safe. for reporting.
- Security/Channels: harden Slack external menu token handling by switching to CSPRNG tokens, validating token shape, requiring user identity for external option lookups, and avoiding fabricated timestamp `trigger_id` fallbacks; also switch Tlon Urbit channel IDs to CSPRNG UUIDs, centralize secure ID/token generation via shared infra helpers, and add a guardrail test to block new runtime `Date.now()+Math.random()` token/id patterns.
- Security/Hooks transforms: enforce symlink-safe containment for webhook transform module paths (including `hooks.transformsDir` and `hooks.mappings[].transform.module`) by resolving existing-path ancestors via realpath before import, while preserving in-root symlink support; add regression coverage for both escape and allow cases. for reporting.
- Telegram/WSL2: disable `autoSelectFamily` by default on WSL2 and memoize WSL2 detection in Telegram network decision logic to avoid repeated sync `/proc/version` probes on fetch/send paths..
- Telegram/Network: default Node 22+ DNS result ordering to `ipv4first` for Telegram fetch paths and add `KIBO_TELEGRAM_DNS_RESULT_ORDER`/`channels.telegram.network.dnsResultOrder` overrides to reduce IPv6-path fetch failures..
- Telegram/Forward bursts: coalesce forwarded text+media updates through a dedicated forward lane debounce window that works with default inbound debounce config, while keeping forwarded control commands immediate..
- Telegram/Streaming: preserve archived draft preview mapping after flush and clean superseded reasoning preview bubbles so multi-message preview finals no longer cross-edit or orphan stale messages under send/rotation races..
- Telegram/Replies: scope messaging-tool text/media dedupe to same-target sends only, so cross-target tool sends can no longer silently suppress Telegram final replies.
- Telegram/Replies: normalize `file://` and local-path media variants during messaging dedupe so equivalent media paths do not produce duplicate Telegram replies.
- Telegram/Replies: extract forwarded-origin context from unified reply targets (`reply_to_message` and `external_reply`) so forward+comment metadata is preserved across partial reply shapes..
- Telegram/Polling: persist a safe update-offset watermark bounded by pending updates so crash/restart cannot skip queued lower `update_id` updates after out-of-order completion..
- Telegram/Polling: force-restart stuck runner instances when recoverable unhandled network rejections escape the polling task path, so polling resumes instead of silently stalling..
- Slack/Slash commands: preserve the Bolt app receiver when registering external select options handlers so monitor startup does not crash on runtimes that require bound `app.options` calls..
- Slack/Telegram slash sessions: await session metadata persistence before dispatch so first-turn native slash runs do not race session-origin metadata updates..
- Slack/Queue routing: preserve string `thread_ts` values through collect-mode queue drain and DM `deliveryContext` updates so threaded follow-ups do not leak to the main channel when Slack thread IDs are strings. and.
- Telegram/Native commands: set `ctx.Provider="telegram"` for native slash-command context so elevated gate checks resolve provider correctly (fixes `provider (ctx.Provider)` failures in `/elevated` flows)..
- Agents/Ollama: preserve unsafe integer tool-call arguments as exact strings during NDJSON parsing, preventing large numeric IDs from being rounded before tool execution..
- Cron/Gateway: keep `cron.list` and `cron.status` responsive during startup catch-up by avoiding a long-held cron lock while missed jobs execute..
- Gateway/Config reload: compare array-valued config paths structurally during diffing so unchanged `memory.qmd.paths` and `memory.qmd.scope.rules` no longer trigger false restart-required reloads..
- Gateway/Config reload: retry short-lived missing config snapshots during reload before skipping, preventing atomic-write unlink windows from triggering restart loops..
- Cron/Scheduling: validate runtime cron expressions before schedule/stagger evaluation so malformed persisted jobs report a clear `invalid cron schedule: expr is required` error instead of crashing with `undefined.trim` failures and auto-disable churn..
- Memory/QMD: migrate legacy unscoped collection bindings (for example `memory-root`) to per-agent scoped names (for example `memory-root-main`) during startup when safe, so QMD-backed `memory_search` no longer fails with `Collection not found` after upgrades. (#23228, #20727) and.
- Memory/QMD: normalize Han-script BM25 search queries before invoking `qmd search` so mixed CJK+Latin prompts no longer return empty results due to tokenizer mismatch..
- TUI/Input: enable multiline-paste burst coalescing on macOS Terminal.app and iTerm so pasted blocks no longer submit line-by-line as separate messages..
- TUI/RTL: isolate right-to-left script lines (Arabic/Hebrew ranges) with Unicode bidi isolation marks in TUI text sanitization so RTL assistant output no longer renders in reversed visual order in terminal chat panes..
- TUI/Status: request immediate renders after setting `sending`/`waiting` activity states so in-flight runs always show visible progress indicators instead of appearing idle until completion..
- TUI/Input: arm Ctrl+C exit timing when clearing non-empty composer text and add a SIGINT fallback path so double Ctrl+C exits remain responsive during active runs instead of requiring an extra press or appearing stuck..
- Agents/Fallbacks: treat JSON payloads with `type: "api_error"` + `"Internal server error"` as transient failover errors so Anthropic 500-style failures trigger model fallback..
- Agents/Google: sanitize non-base64 `thought_signature`/`thoughtSignature` values from assistant replay transcripts for native Google Gemini requests while preserving valid signatures and tool-call order..
- Agents/Transcripts: validate assistant tool-call names (syntax/length + registered tool allowlist) before transcript persistence and during replay sanitization so malformed failover tool names no longer poison sessions with repeated provider HTTP 400 errors..
- Agents/Mistral: sanitize tool-call IDs in the embedded agent loop and generate strict provider-safe pending tool-call IDs, preventing Mistral strict9 `HTTP 400` failures on tool continuations..
- Agents/Compaction: strip stale assistant usage snapshots from pre-compaction turns when replaying history after a compaction summary so context-token estimation no longer reuses pre-compaction totals and immediately re-triggers destructive follow-up compactions..
- Agents/Replies: emit a default completion acknowledgement (`✅ Done.`) only for direct/private tool-only completions with no final assistant text, while suppressing synthetic acknowledgements for channel/group sessions and runs that already delivered output via messaging tools..
- Agents/Subagents: honor `tools.subagents.tools.alsoAllow` and explicit subagent `allow` entries when resolving built-in subagent deny defaults, so explicitly granted tools (for example `sessions_send`) are no longer blocked unless re-denied in `tools.subagents.tools.deny`..
- Agents/Subagents: make announce call timeouts configurable via `agents.defaults.subagents.announceTimeoutMs` and restore a 60s default to prevent false timeout failures on slower announce paths..
- Agents/Diagnostics: include resolved lifecycle error text in `embedded run agent end` warnings so UI/TUI "Connection error" runs expose actionable provider failure reasons in gateway logs..
- Agents/Auth profiles: resolve `agentCommand` session scope before choosing `agentDir`/workspace so resumed runs no longer read auth from `agents/main/agent` when the resolved session belongs to a different/default agent (for example `agent:exec:*` sessions)..
- Agents/Auth profiles: skip auth-profile cooldown writes for timeout failures in embedded runner rotation so model/network timeouts do not poison same-provider fallback model selection while still allowing in-turn account rotation..
- Plugins/Hooks: run legacy `before_agent_start` once per agent turn and reuse that result across model-resolve and prompt-build compatibility paths, preventing duplicate hook side effects (for example duplicate external API calls)..
- Models/Config: default missing Anthropic provider/model `api` fields to `anthropic-messages` during config validation so custom relay model entries are preserved instead of being dropped by runtime model registry validation..
- Gateway/Pairing: preserve existing approved token scopes when processing repair pairings that omit `scopes`, preventing empty-scope token regressions on reconnecting clients..
- Memory/QMD: add optional `memory.qmd.mcporter` search routing so QMD `query/search/vsearch` can run through mcporter keep-alive flows (including multi-collection paths) to reduce cold starts, while keeping searches on agent-scoped QMD state for consistent recall. and.
- Infra/Network: classify undici `TypeError: fetch failed` as transient in unhandled-rejection detection even when nested causes are unclassified, preventing avoidable gateway crash loops on flaky networks..
- Telegram/Retry: classify undici `TypeError: fetch failed` as recoverable in both polling and send retry paths so transient fetch failures no longer fail fast..
- Docs/Telegram: correct Node 22+ network defaults (`autoSelectFamily`, `dnsResultOrder`) and clarify Telegram setup does not use positional `kibo channels login telegram`..
- BlueBubbles/DM history: restore DM backfill context with account-scoped rolling history, bounded backfill retries, and safer history payload limits..
- BlueBubbles/Private API cache: treat unknown (`null`) private-API cache status as disabled for send/attachment/reply flows to avoid stale-cache 500s, and log a warning when reply/effect features are requested while capability is unknown..
- BlueBubbles/Webhooks: accept inbound/reaction webhook payloads when BlueBubbles omits `handle` but provides DM `chatGuid`, and harden payload extraction for array/string-wrapped message bodies so valid webhook events no longer get rejected as unparseable..
- Security/Audit: add `kibo security audit` finding `gateway.nodes.allow_commands_dangerous` for risky `gateway.nodes.allowCommands` overrides, with severity upgraded to critical on remote gateway exposure.
- Gateway/Control plane: reduce cross-client write limiter contention by adding `connId` fallback keying when device ID and client IP are both unavailable.
- Security/Config: block prototype-key traversal during config merge patch and legacy migration merge helpers (`__proto__`, `constructor`, `prototype`) to prevent prototype pollution during config mutation flows..
- Security/Shell env: validate login-shell executable paths for shell-env fallback (`/etc/shells` + trusted prefixes), block `SHELL`/`HOME`/`ZDOTDIR` in config env ingestion before fallback execution, and sanitize fallback shell exec env to pin `HOME` to the real user home while dropping `ZDOTDIR` and other dangerous startup vars. for reporting.
- Network/SSRF: enable `autoSelectFamily` on pinned undici dispatchers (with attempt timeout) so IPv6-unreachable environments can quickly fall back to IPv4 for guarded fetch paths..
- Security/Config: make parsed chat allowlist checks fail closed when `allowFrom` is empty, restoring expected DM/pairing gating.
- Security/Exec: in non-default setups that manually add `sort` to `tools.exec.safeBins`, block `sort --compress-program` so allowlist-mode safe-bin checks cannot bypass approval. for reporting.
- Security/Exec approvals: when users choose `allow-always` for shell-wrapper commands (for example `/bin/zsh -lc ...`), persist allowlist patterns for the inner executable(s) instead of the wrapper shell binary, preventing accidental broad shell allowlisting in moderate mode..
- Security/Exec: fail closed when `tools.exec.host=sandbox` is configured/requested but sandbox runtime is unavailable..
- Security/Exec: restore runtime-aware implicit exec host selection so sandbox-off sessions keep defaulting to the gateway host, while explicit `host=sandbox` still fails closed without a sandbox runtime.
- Security/macOS app beta: enforce path-only `system.run` allowlist matching (drop basename matches like `echo`), migrate legacy basename entries to last resolved paths when available, and harden shell-chain handling to fail closed on unsafe parse/control syntax (including quoted command substitution/backticks). This is an optional allowlist-mode feature; default installs remain deny-by-default. for reporting.
- Security/Agents: auto-generate and persist a dedicated `commands.ownerDisplaySecret` when `commands.ownerDisplay=hash`, remove gateway token fallback from owner-ID prompt hashing across CLI and embedded agent runners, and centralize owner-display secret resolution in one shared helper. for reporting.
- Security/SSRF: expand IPv4 fetch guard blocking to include RFC special-use/non-global ranges (including benchmarking, TEST-NET, multicast, and reserved/broadcast blocks), centralize range checks into a single CIDR policy table, and reuse one shared host/IP classifier across literal + DNS checks to reduce classifier drift. for reporting.
- Security/SSRF: block RFC2544 benchmarking range (`198.18.0.0/15`) across direct and embedded-IP paths, and normalize IPv6 dotted-quad transition literals (for example `::127.0.0.1`, `64:ff9b::8.8.8.8`) in shared IP parsing/classification.
- Security/Archive: block zip symlink escapes during archive extraction.
- Security/Media sandbox: keep tmp media allowance for absolute tmp paths only and enforce symlink-escape checks before sandbox-validated reads, preventing tmp symlink exfiltration and relative `../` sandbox escapes when sandboxes live under tmp..
- Browser/Upload: accept canonical in-root upload paths when the configured uploads directory is a symlink alias (for example `/tmp` -> `/private/tmp` on macOS), so browser upload validation no longer rejects valid files during client->server revalidation. (#23300, #23222, #22848), and.
- Security/Discord: add `kibo security audit` warnings for name/tag-based Discord allowlist entries (DM allowlists, guild/channel `users`, and pairing-store entries), highlighting slug-collision risk while keeping name-based matching supported, and canonicalize resolved Discord allowlist names to IDs at runtime without rewriting config files. for reporting.
- Security/Gateway: block node-role connections when device identity metadata is missing.
- Security/Media: enforce inbound media byte limits during download/read across Discord, Telegram, Zalo, Microsoft Teams, and BlueBubbles to prevent oversized payload memory spikes before rejection. for reporting.
- Media/Understanding: preserve `application/pdf` MIME classification during text-like file heuristics so PDF uploads use PDF extraction paths instead of being inlined as raw text..
- Security/Control UI: block symlink-based out-of-root static file reads by enforcing realpath containment and file-identity checks when serving Control UI assets and SPA fallback `index.html`. for reporting.
- Security/Gateway avatars: block symlink traversal during local avatar `data:` URL resolution by enforcing realpath containment and file-identity checks before reads. for reporting.
- Security/Control UI: centralize avatar URL/path validation across gateway/config helpers and enforce a 2 MB max size for local agent avatar files before `/avatar` resolution, reducing oversized-avatar memory risk without changing supported avatar formats.
- Security/Control UI avatars: harden `/avatar/:agentId` local avatar serving by rejecting symlink paths and requiring fd-level file identity + size checks before reads. for reporting.
- Security/MSTeams media: enforce allowlist checks for SharePoint reference attachment URLs and redirect targets during Graph-backed media fetches so redirect chains cannot escape configured media host boundaries. for reporting.
- Security/MSTeams media: route attachment auth-retry and Graph SharePoint download redirects through shared `safeFetch` so each hop is validated with allowlist + DNS/IP checks across the full redirect chain. and.
- Security/MSTeams auth redirect scoping: strip bearer auth on redirect hops outside `authAllowHosts` and gate SharePoint Graph auth-header injection by auth allowlist to prevent token bleed across redirect targets..
- MSTeams/reply reliability: when Bot Framework revokes thread turn-context proxies (for example debounced flush paths), fall back to proactive messaging/typing and continue pending sends without duplicating already delivered messages..
- Security/macOS discovery: fail closed for unresolved discovery endpoints by clearing stale remote selection values, use resolved service host only for SSH target derivation, and keep remote URL config aligned with resolved endpoint availability..
- Chat/Usage/TUI: strip synthetic inbound metadata blocks (including `Conversation info` and trailing `Untrusted context` channel metadata wrappers) from displayed conversation history so internal prompt context no longer leaks into user-visible logs.
- CI/Tests: fix TypeScript case-table typing and lint assertion regressions so `pnpm check` passes again after Synology Chat landing..
- Security/Browser relay: harden extension relay auth token handling for `/extension` and `/cdp` pathways.
- Cron: persist `delivered` state in cron job records so delivery failures remain visible in status and logs..
- Config/Doctor: only repair the OAuth credentials directory when affected channels are configured, avoiding fresh-install noise.
- Config/Channels: whitelist `channels.modelByChannel` in config validation and exclude it from plugin auto-enable channel detection so model overrides no longer trigger `unknown channel id` validation errors or bogus `modelByChannel` plugin enables..
- Config/Bindings: allow optional `bindings[].comment` in strict config validation so annotated binding entries no longer fail load..
- Usage/Pricing: correct MiniMax M2.5 pricing defaults to fix inflated cost reporting..
- Gateway/Daemon: verify gateway health after daemon restart.
- Agents/UI text: stop rewriting normal assistant billing/payment language outside explicit error contexts..

### Breaking

- **BREAKING:** removed Google Antigravity provider support and the bundled `google-antigravity-auth` plugin. Existing `google-antigravity/*` model/profile configs no longer work; migrate to `google-gemini-cli` or other supported providers.
- **BREAKING:** tool-failure replies now hide raw error details by default. Kibo still sends a failure summary, but detailed error suffixes (for example provider/runtime messages and local path fragments) now require `/verbose on` or `/verbose full`.
- **BREAKING:** CLI local onboarding now sets `session.dmScope` to `per-channel-peer` by default for new/implicit DM scope configuration. If you depend on shared DM continuity across senders, explicitly set `session.dmScope` to `main`..
- **BREAKING:** unify channel preview-streaming config to `channels.<channel>.streaming` with enum values `off | partial | block | progress`, and move Slack native stream toggle to `channels.slack.nativeStreaming`. Legacy keys (`streamMode`, Slack boolean `streaming`) are still read and migrated by `kibo doctor --fix`, but canonical saved config/docs now use the unified names.
- **BREAKING:** remove legacy Gateway device-auth signature `v1`. Device-auth clients must now sign `v2` payloads with the per-connection `connect.challenge` nonce and send `device.nonce`; nonce-less connects are rejected.

## 2026.2.21

### Changes

- Models/Google: add Gemini 3.1 support (`google/gemini-3.1-pro-preview`).
- Providers/Onboarding: add Volcano Engine (Doubao) and BytePlus providers/models (including coding variants), wire onboarding auth choices for interactive + non-interactive flows, and align docs to `volcengine-api-key`..
- Channels/CLI: add per-account/channel `defaultTo` outbound routing fallback so `kibo agent --deliver` can send without explicit `--reply-to` when a default target is configured..
- Channels: allow per-channel model overrides via `channels.modelByChannel` and note them in /status..
- Telegram/Streaming: simplify preview streaming config to `channels.telegram.streaming` (boolean), auto-map legacy `streamMode` values, and remove block-vs-partial preview branching..
- Discord/Streaming: add stream preview mode for live draft replies with partial/block options and configurable chunking.. Inspiration.
- Discord/Telegram: add configurable lifecycle status reactions for queued/thinking/tool/done/error phases with a shared controller and emoji/timing overrides. and.
- Discord/Voice: add voice channel join/leave/status via `/vc`, plus auto-join configuration for realtime voice conversations..
- Discord: add configurable ephemeral defaults for slash-command responses..
- Discord: support updating forum `available_tags` via channel edit actions for forum tag management..
- Discord: include channel topics in trusted inbound metadata on new sessions..
- Discord/Subagents: add thread-bound subagent sessions on Discord with per-thread focus/list controls and thread-bound continuation routing for spawned helper agents..
- iOS/Chat: clean chat UI noise by stripping inbound untrusted metadata/timestamp prefixes, formatting tool outputs into concise summaries/errors, compacting the composer while typing, and supporting tap-to-dismiss keyboard in chat view..
- iOS/Watch: bridge mirrored watch prompt notification actions into iOS quick-reply handling, including queued action handoff until app model initialization..
- iOS/Gateway: stabilize background wake and reconnect behavior with background reconnect suppression/lease windows, BGAppRefresh wake fallback, location wake hook throttling, and APNs wake retry+nudge instrumentation..
- Auto-reply/UI: add model fallback lifecycle visibility in verbose logs, /status active-model context with fallback reason, and cohesive WebUI fallback indicators..
- MSTeams: dedupe sent-message cache storage by removing duplicate per-message Set storage and using timestamps Map keys as the single membership source..
- Agents/Subagents: default subagent spawn depth now uses shared `maxSpawnDepth=2`, enabling depth-1 orchestrator spawning by default while keeping depth policy checks consistent across spawn and prompt paths..
- Security/Agents: make owner-ID obfuscation use a dedicated HMAC secret from configuration (`ownerDisplaySecret`) and update hashing behavior so obfuscation is decoupled from gateway token handling for improved control..
- Security/Infra: switch gateway lock and tool-call synthetic IDs from SHA-1 to SHA-256 with unchanged truncation length to strengthen hash basis while keeping deterministic behavior and lock key format..
- Dependencies/Tooling: add non-blocking dead-code scans in CI via Knip/ts-prune/ts-unused-exports to surface unused dependencies and exports earlier..
- Dependencies/Unused Dependencies: remove or scope unused root and extension deps (`@larksuiteoapi/node-sdk`, `signal-utils`, `ollama`, `lit`, `@lit/context`, `@lit-labs/signals`, `@microsoft/agents-hosting-express`, `@microsoft/agents-hosting-extensions-teams`, and plugin-local `kibo` devDeps in the Open Prose, Kibo Shell, and LLM Task plugin packages). (#22471, #22495).
- Dependencies/A2UI: harden dependency resolution after root cleanup (resolve `lit`, `@lit/context`, `@lit-labs/signals`, and `signal-utils` from workspace/root) and simplify bundling fallback behavior, including `pnpm dlx rolldown` compatibility. (#22481, #22507).

### Fixes

- Agents/Bootstrap: skip malformed bootstrap files with missing/invalid paths instead of crashing agent sessions; hooks using `filePath` (or non-string `path`) are skipped with a warning. (#22693, #22698).
- Security/Agents: cap embedded Pi runner outer retry loop with a higher profile-aware dynamic limit (32-160 attempts) and return an explicit `retry_limit` error payload when retries never converge, preventing unbounded internal retry cycles (`GHSA-76m6-pj3w-v7mf`).
- Telegram: detect duplicate bot-token ownership across Telegram accounts at startup/status time, mark secondary accounts as not configured with an explicit fix message, and block duplicate account startup before polling to avoid endless `getUpdates` conflict loops.
- Agents/Tool images: include source filenames in `agents/tool-images` resize logs so compression events can be traced back to specific files.
- Providers/OAuth: harden Qwen and Chutes refresh handling by validating refresh response expiry values and preserving prior refresh tokens when providers return empty refresh token fields, with regression coverage for empty-token responses.
- Models/Kimi-Coding: add missing implicit provider template for `kimi-coding` with correct `anthropic-messages` API type and base URL, fixing 403 errors when using Kimi for Coding.
- Auto-reply/Tools: forward `senderIsOwner` through embedded queued/followup runner params so owner-only tools remain available for authorized senders..
- Discord: restore model picker back navigation when a provider is missing and document the Discord picker flow. and.
- Memory/QMD: respect per-agent `memorySearch.enabled=false` during gateway QMD startup initialization, split multi-collection QMD searches into per-collection queries (`search`/`vsearch`/`query`) to avoid sparse-term drops, prefer collection-hinted doc resolution to avoid stale-hash collisions, retry boot updates on transient lock/timeout failures, skip `qmd embed` in BM25-only `search` mode (including `memory index --force`), and serialize embed runs globally with failure backoff to prevent CPU storms on multi-agent hosts. (#20581, #21590, #20513, #20001, #21266, #21583, #20346, #19493), and.
- Memory/Builtin: prevent automatic sync races with manager shutdown by skipping post-close sync starts and waiting for in-flight sync before closing SQLite, so `onSearch`/`onSessionStart` no longer fail with `database is not open` in ephemeral CLI flows. (#20556, #7464) and.
- Providers/Copilot: drop persisted assistant `thinking` blocks for Claude models (while preserving turn structure/tool blocks) so follow-up requests no longer fail on invalid `thinkingSignature` payloads..
- Providers/Copilot: add `claude-sonnet-4.6` and `claude-sonnet-4.5` to the default GitHub Copilot model catalog and add coverage for model-list/definition helpers. (#20270, fixes #20091).
- Auto-reply/WebChat: avoid defaulting inbound runtime channel labels to unrelated providers (for example `whatsapp`) for webchat sessions so channel-specific formatting guidance stays accurate..
- Status: include persisted `cacheRead`/`cacheWrite` in session summaries so compact `/status` output consistently shows cache hit percentages from real session data.
- Sessions/Usage: persist `totalTokens` from `promptTokens` snapshots even when providers omit structured usage payloads, so session history/status no longer regress to `unknown` token utilization for otherwise successful runs..
- Heartbeat/Cron: restore interval heartbeat behavior so missing `HEARTBEAT.md` no longer suppresses runs (only effectively empty files skip), preserving prompt-driven and tagged-cron execution paths.
- WhatsApp/Cron/Heartbeat: enforce allowlisted routing for implicit scheduled/system delivery by merging pairing-store + configured `allowFrom` recipients, selecting authorized recipients when last-route context points to a non-allowlisted chat, and preventing heartbeat fan-out to recent unauthorized chats.
- Heartbeat/Active hours: constrain active-hours `24` sentinel parsing to `24:00` in time validation so invalid values like `24:30` are rejected early..
- Heartbeat: treat `activeHours` windows with identical `start`/`end` times as zero-width (always outside the window) instead of always-active..
- CLI/Pairing: default `pairing list` and `pairing approve` to the sole available pairing channel when omitted, so TUI-only setups can recover from `pairing required` without guessing channel arguments..
- TUI/Pairing: show explicit pairing-required recovery guidance after gateway disconnects that return `pairing required`, including approval steps to unblock quickstart TUI hatching on fresh installs..
- TUI/Input: suppress duplicate backspace events arriving in the same input burst window so SSH sessions no longer delete two characters per backspace press in the composer..
- TUI/Models: scope `models.list` to the configured model allowlist (`agents.defaults.models`) so `/model` picker no longer floods with unrelated catalog entries by default..
- TUI/Heartbeat: suppress heartbeat ACK/prompt noise in chat streaming when `showOk` is disabled, while still preserving non-ACK heartbeat alerts in final output..
- TUI/History: cap chat-log component growth and prune stale render nodes/references so large default history loads no longer overflow render recursion with `RangeError: Maximum call stack size exceeded`..
- Memory/QMD: diversify mixed-source search ranking when both session and memory collections are present so session transcript hits no longer crowd out durable memory-file matches in top results..
- Memory/Tools: return explicit `unavailable` warnings/actions from `memory_search` when embedding/provider failures occur (including quota exhaustion), so disabled memory does not look like an empty recall result..
- Session/Startup: require the `/new` and `/reset` greeting path to run Session Startup file-reading instructions before responding, so daily memory startup context is not skipped on fresh-session greetings..
- Auth/Onboarding: align OAuth profile-id config mapping with stored credential IDs for OpenAI Codex and Chutes flows, preventing `provider:default` mismatches when OAuth returns email-scoped credentials..
- Provider/HTTP: treat HTTP 503 as failover-eligible for LLM provider errors..
- Slack: pass `recipient_team_id` / `recipient_user_id` through Slack native streaming calls so `chat.startStream`/`appendStream`/`stopStream` work reliably across DMs and Slack Connect setups, and disable block streaming when native streaming is active.. Earlier recipient-ID groundwork was contributed in #20377 by.
- CLI/Config: add canonical `--strict-json` parsing for `config set` and keep `--json` as a legacy alias to reduce help/behavior drift..
- CLI/Config: preserve explicitly unset config paths in persisted JSON after writes so `kibo config unset <path>` no longer re-introduces defaulted keys (for example `commands.ownerDisplay`) through schema normalization..
- CLI: keep `kibo -v` as a root-only version alias so subcommand `-v, --verbose` flags (for example ACP/hooks/skills) are no longer intercepted globally..
- Memory: return empty snippets when `memory_get`/QMD read files that have not been created yet, and harden memory indexing/session helpers against ENOENT races so missing Markdown no longer crashes tools..
- Telegram/Streaming: always clean up draft previews even when dispatch throws before fallback handling, preventing orphaned preview messages during failed runs..
- Telegram/Streaming: split reasoning and answer draft preview lanes to prevent cross-lane overwrites, and ignore literal `<think>` tags inside inline/fenced code snippets so sample markup is not misrouted as reasoning..
- Telegram/Streaming: restore 30-char first-preview debounce and scope `NO_REPLY` prefix suppression to partial sentinel fragments so normal `No...` text is not filtered..
- Telegram/Status reactions: refresh stall timers on repeated phase updates and honor ack-reaction scope when lifecycle reactions are enabled, preventing false stall emojis and unwanted group reactions. and.
- Telegram/Status reactions: keep lifecycle reactions active when available-reactions lookup fails by falling back to unrestricted variant selection instead of suppressing reaction updates..
- Discord/Events: await `DiscordMessageListener` message handlers so regular `MESSAGE_CREATE` traffic is processed through queue ordering/timeout flow instead of fire-and-forget drops..
- Discord/Streaming: apply `replyToMode: first` only to the first Discord chunk so block-streamed replies do not spam mention pings. for the report.
- Discord/Components: map DM channel targets back to user-scoped component sessions so button/select interactions stay in the main DM session..
- Discord/Allowlist: lazy-load guild lists when resolving Discord user allowlists so ID-only entries resolve even if guild fetch fails..
- Discord/Gateway: handle close code 4014 (missing privileged gateway intents) without crashing the gateway..
- Discord: ingest inbound stickers as media so sticker-only messages and forwarded stickers are visible to agents..
- Auto-reply/Runner: emit `onAgentRunStart` only after agent lifecycle or tool activity begins (and only once per run), so fallback preflight errors no longer mark runs as started..
- Auto-reply/Tool results: serialize tool-result delivery and keep the delivery chain progressing after individual failures so concurrent tool outputs preserve user-visible ordering..
- Auto-reply/Prompt caching: restore prefix-cache stability by keeping inbound system metadata session-stable and moving per-message IDs (`message_id`, `message_id_full`, `reply_to_id`, `sender_id`) into untrusted conversation context..
- iOS/Watch: add actionable watch approval/reject controls and quick-reply actions so watch-originated approvals and responses can be sent directly from notification flows..
- iOS/Watch: refresh iOS and watch app icon assets with the shell icon set to keep phone/watch branding aligned..
- CLI/Onboarding: fix Anthropic-compatible custom provider verification by normalizing base URLs to avoid duplicate `/v1` paths during setup checks..
- iOS/Gateway/Tools: prefer uniquely connected node matches when duplicate display names exist, surface actionable `nodes invoke` pairing-required guidance with request IDs, and refresh active iOS gateway registration after location-capability setting changes so capability updates apply immediately..
- Gateway/Auth: require `gateway.trustedProxies` to include a loopback proxy address when `auth.mode="trusted-proxy"` and `bind="loopback"`, preventing same-host proxy misconfiguration from silently blocking auth. (#22082, follow-up to #20097).
- Gateway/Auth: allow trusted-proxy mode with loopback bind for same-host reverse-proxy deployments, while still requiring configured `gateway.trustedProxies`..
- Gateway/Auth: allow authenticated clients across roles/scopes to call `health` while preserving role and scope enforcement for non-health methods..
- Gateway/Hooks: include transform export name in hook-transform cache keys so distinct exports from the same module do not reuse the wrong cached transform function..
- Gateway/Control UI: return 404 for missing static-asset paths instead of serving SPA fallback HTML, while preserving client-route fallback behavior for extensionless and non-asset dotted paths..
- Gateway/Pairing: prevent device-token rotate scope escalation by enforcing an approved-scope baseline, preserving approved scopes across metadata updates, and rejecting rotate requests that exceed approved role scope implications..
- Gateway/Pairing: clear persisted paired-device state when the gateway client closes with `device token mismatch` (`1008`) so reconnect flows can cleanly re-enter pairing..
- Gateway/Config: allow `gateway.customBindHost` in strict config validation when `gateway.bind="custom"` so valid custom bind-host configurations no longer fail startup. (#20318, fixes #20289).
- Gateway/Pairing: tolerate legacy paired devices missing `roles`/`scopes` metadata in websocket upgrade checks and backfill metadata on reconnect. (#21447, fixes #21236).
- Gateway/Pairing/CLI: align read-scope compatibility in pairing/device-token checks and add local `kibo devices` fallback recovery for loopback `pairing required` deadlocks, with explicit fallback notice to unblock approval bootstrap flows..
- Agents/Subagents: restore announce-chain delivery to agent injection, defer nested announce output until descendant follow-up content is ready, and prevent descendant deferrals from consuming announce retry budget so deep chains do not drop final completions..
- Agents/System Prompt: label allowlisted senders as authorized senders to avoid implying ownership..
- Agents/Tool display: fix exec cwd suffix inference so `pushd ... && popd ... && <command>` does not keep stale `(in <dir>)` context in summaries..
- Agents/Google: flatten residual nested `anyOf`/`oneOf` unions in Gemini tool-schema cleanup so Cloud Code Assist no longer rejects unsupported union keywords that survive earlier simplification..
- Tools/web_search: handle xAI Responses API payloads that emit top-level `output_text` blocks (without a `message` wrapper) so Grok web_search no longer returns `No response` for those results..
- Agents/Failover: treat non-default override runs as direct fallback-to-configured-primary (skip configured fallback chain), normalize default-model detection for provider casing/whitespace, and add regression coverage for override/auth error paths..
- Docker/Build: include `ownerDisplay` in `CommandsSchema` object-level defaults so Docker `pnpm build` no longer fails with `TS2769` during plugin SDK d.ts generation..
- Docker/Browser: install Playwright Chromium into `/home/node/.cache/ms-playwright` and set `node:node` ownership so browser binaries are available to the runtime user in browser-enabled images..
- Hooks/Session memory: trigger bundled `session-memory` persistence on both `/new` and `/reset` so reset flows no longer skip markdown transcript capture before archival..
- Dependencies/Agents: bump embedded Pi SDK packages (`@mariozechner/pi-agent-core`, `@mariozechner/pi-ai`, `@mariozechner/pi-coding-agent`, `@mariozechner/pi-tui`) to `0.54.0`..
- Config/Agents: expose Pi compaction tuning values `agents.defaults.compaction.reserveTokens` and `agents.defaults.compaction.keepRecentTokens` in config schema/types and apply them in embedded Pi runner settings overrides with floor enforcement via `reserveTokensFloor`..
- Docker: pin base images to SHA256 digests in Docker builds to prevent mutable tag drift..
- Docker: run build steps as the `node` user and use `COPY --chown` to avoid recursive ownership changes, trimming image size and layer churn..
- Config/Memory: restore schema help/label metadata for hybrid `mmr` and `temporalDecay` settings so configuration surfaces show correct names and guidance..
- Skills/SonosCLI: add troubleshooting guidance for `sonos discover` failures on macOS direct mode (`sendto: no route to host`) and sandbox network restrictions (`bind: operation not permitted`)..
- macOS/Build: default release packaging to `BUNDLE_ID=ai.kibo.mac` in `scripts/package-mac-dist.sh`, so Sparkle feed URL is retained and auto-update no longer fails with an empty appcast feed..
- Signal/Outbound: preserve case for Base64 group IDs during outbound target normalization so cross-context routing and policy checks no longer break when group IDs include uppercase characters..
- Anthropic/Agents: preserve required pi-ai default OAuth beta headers when `context1m` injects `anthropic-beta`, preventing 401 auth failures for `sk-ant-oat-*` tokens. (#19789, fixes #19769).
- Security/Exec: block unquoted heredoc body expansion tokens in shell allowlist analysis, reject unterminated heredocs, and require explicit approval for allowlisted heredoc execution on gateway hosts to prevent heredoc substitution allowlist bypass. for reporting.
- macOS/Security: evaluate `system.run` allowlists per shell segment in macOS node runtime and companion exec host (including chained shell operators), fail closed on shell/process substitution parsing, and require explicit approval on unsafe parse cases to prevent allowlist bypass via `rawCommand` chaining. for reporting.
- WhatsApp/Security: enforce allowlist JID authorization for reaction actions so authenticated callers cannot target non-allowlisted chats by forging `chatJid` + valid `messageId` pairs. for reporting.
- ACP/Security: escape control and delimiter characters in ACP `resource_link` title/URI metadata before prompt interpolation to prevent metadata-driven prompt injection through resource links. for reporting.
- TTS/Security: make model-driven provider switching opt-in by default (`messages.tts.modelOverrides.allowProvider=false` unless explicitly enabled), while keeping voice/style overrides available, to reduce prompt-injection-driven provider hops and unexpected TTS cost escalation. for reporting.
- Security/Agents: keep overflow compaction retry budgeting global across tool-result truncation recovery so successful truncation cannot reset the overflow retry counter and amplify retry/cost cycles. for reporting.
- BlueBubbles/Security: require webhook token authentication for all BlueBubbles webhook requests (including loopback/proxied setups), removing passwordless webhook fallback behavior..
- iOS/Security: force `https://` for non-loopback manual gateway hosts during iOS onboarding to block insecure remote transport URLs..
- Gateway/Security: remove shared-IP fallback for canvas endpoints and require token or session capability for canvas access..
- Gateway/Security: require secure context and paired-device checks for Control UI auth even when `gateway.controlUi.allowInsecureAuth` is set, and align audit messaging with the hardened behavior. and for reporting.
- Gateway/Security: scope tokenless Tailscale forwarded-header auth to Control UI websocket auth only, so HTTP gateway routes still require token/password even on trusted hosts. for reporting.
- Docker/Security: run E2E and install-sh test images as non-root by adding appuser directives..
- Skills/Security: sanitize skill env overrides to block unsafe runtime injection variables and only allow sensitive keys when declared in skill metadata, with warnings for suspicious values..
- Security/Commands: block prototype-key injection in runtime `/debug` overrides and require own-property checks for gated command flags (`bash`, `config`, `debug`) so inherited prototype values cannot enable privileged commands. for reporting.
- Security/Browser: block non-network browser navigation protocols (including `file:`, `data:`, and `javascript:`) while preserving `about:blank`, preventing local file reads via browser tool navigation. for reporting.
- Security/Exec: block shell startup-file env injection (`BASH_ENV`, `ENV`, `BASH_FUNC_*`, `LD_*`, `DYLD_*`) across config env ingestion, node-host inherited environment sanitization, and macOS exec host runtime to prevent pre-command execution from attacker-controlled environment variables..
- Security/Exec (Windows): canonicalize `cmd.exe /c` command text across validation, approval binding, and audit/event rendering to prevent trailing-argument approval mismatches in `system.run`. for reporting.
- Security/Gateway/Hooks: block `__proto__`, `constructor`, and `prototype` traversal in webhook template path resolution to prevent prototype-chain payload data leakage in `messageTemplate` rendering..
- Security/KiboKit/UI: prevent injected inbound user context metadata blocks from leaking into chat history in TUI, webchat, and macOS surfaces by stripping all untrusted metadata prefixes at display boundaries..
- Security/KiboKit/UI: strip inbound metadata blocks from user messages in TUI rendering while preserving user-authored content..
- Security/KiboKit/UI: prevent inbound metadata leaks and reply-tag streaming artifacts in TUI rendering by stripping untrusted metadata prefixes at display boundaries..
- Security/Agents: restrict local MEDIA tool attachments to core tools and the Kibo temp root to prevent untrusted MCP tool file exfiltration. and.
- Security/Net: strip sensitive headers (`Authorization`, `Proxy-Authorization`, `Cookie`, `Cookie2`) on cross-origin redirects in `fetchWithSsrFGuard` to prevent credential forwarding across origin boundaries..
- Security/Systemd: reject CR/LF in systemd unit environment values and fix argument escaping so generated units cannot be injected with extra directives..
- Security/Tools: add per-wrapper random IDs to untrusted-content markers from `wrapExternalContent`/`wrapWebContent`, preventing marker spoofing from escaping content boundaries..
- Shared/Security: reject insecure deep links that use `ws://` non-loopback gateway URLs to prevent plaintext remote websocket configuration..
- macOS/Security: reject non-loopback `ws://` remote gateway URLs in macOS remote config to block insecure plaintext websocket endpoints..
- Browser/Security: block upload path symlink escapes so browser upload sources cannot traverse outside the allowed workspace via symlinked paths..
- Security/Dependencies: bump transitive `hono` usage to `4.11.10` to incorporate timing-safe authentication comparison hardening for `basicAuth`/`bearerAuth` (`GHSA-gq3j-xvxp-8hrf`)..
- Security/Gateway: parse `X-Forwarded-For` with trust-preserving semantics when requests come from configured trusted proxies, preventing proxy-chain spoofing from influencing client IP classification and rate-limit identity. and.
- Security/Sandbox: remove default `--no-sandbox` for the browser container entrypoint, add explicit opt-in via `KIBO_BROWSER_NO_SANDBOX` / `KIBOBOT_BROWSER_NO_SANDBOX`, and add security-audit checks for stale/missing sandbox browser Docker hash labels. and.
- Security/Sandbox Browser: require VNC password auth for noVNC observer sessions in the sandbox browser entrypoint, plumb per-container noVNC passwords from runtime, and emit short-lived noVNC observer token URLs while keeping loopback-only host port publishing. for reporting.
- Security/Sandbox Browser: default browser sandbox containers to a dedicated Docker network (`kibo-sandbox-browser`), add optional CDP ingress source-range restrictions, auto-create missing dedicated networks, and warn in `kibo security --audit` when browser sandboxing runs on bridge without source-range limits. for reporting.

## 2026.2.19

### Changes

- iOS/Watch: add an Apple Watch companion MVP with watch inbox UI, watch notification relay handling, and gateway command surfaces for watch status/send flows..
- iOS/Gateway: wake disconnected iOS nodes via APNs before `nodes.invoke` and auto-reconnect gateway sessions on silent push wake to reduce invoke failures while the app is backgrounded..
- Gateway/CLI: add paired-device hygiene flows with `device.pair.remove`, plus `kibo devices remove` and guarded `kibo devices clear --yes [--pending]` commands for removing paired entries and optionally rejecting pending requests..
- Mattermost: add opt-in native slash command support with registration lifecycle, callback route/token validation, multi-account token routing, and callback URL/path configuration (`channels.mattermost.commands.*`)..
- Mattermost: harden native slash callback auth-bypass behavior for configurable callback paths, add callback validation coverage, and clarify callback reachability/allowlist docs. and.
- iOS/APNs: add push registration and notification-signing configuration for node delivery..
- Gateway/APNs: add a push-test pipeline for APNs delivery validation in gateway flows..
- Security/Audit: add `gateway.http.no_auth` findings when `gateway.auth.mode="none"` leaves Gateway HTTP APIs reachable, with loopback warning and remote-exposure critical severity, plus regression coverage and docs updates.
- Skills: harden coding-agent skill guidance by removing shell-command examples that interpolate untrusted issue text directly into command strings.
- Dev tooling: align `oxfmt` local/CI formatting behavior..

### Fixes

- Security: strip hidden text from `web_fetch` extracted content to prevent indirect prompt injection, covering CSS-hidden elements, class-based hiding (sr-only, d-none, etc.), invisible Unicode, color:transparent, offscreen transforms, and non-content tags. (#8027, #21074) for the fix and for reporting.
- Agents/Streaming: keep assistant partial streaming active during reasoning streams, handle native `thinking_*` stream events consistently, dedupe mixed reasoning-end signals, and clear stale mutating tool errors after same-target retry success..
- iOS/Chat: use a dedicated iOS chat session key for ChatSheet routing to avoid cross-client session collisions with main-session traffic..
- iOS/Chat: auto-resync chat history after reconnect sequence gaps, clear stale pending runs, and avoid dead-end manual refresh errors after transient disconnects..
- UI/Usage: reload usage data immediately when timezone changes so Local/UTC toggles apply the selected date range without requiring a manual refresh.
- iOS/Screen: move `WKWebView` lifecycle ownership into `ScreenWebView` coordinator and explicit attach/detach flow to reduce gesture/lifecycle crash risk (`__NSArrayM insertObject:atIndex:` paths) during screen tab updates..
- iOS/Onboarding: prevent pairing-status flicker during auto-resume by keeping resumed state transitions stable..
- iOS/Onboarding: stabilize pairing and reconnect behavior by resetting stale pairing request state on manual retry, disconnecting both operator and node gateways on operator failure, and avoiding duplicate pairing loops from operator transport identity attachment..
- iOS/Signing: restore local auto-selected signing-team overrides during iOS project generation by wiring `.local-signing.xcconfig` into the active signing config and emitting `KIBO_DEVELOPMENT_TEAM` in local signing setup..
- Telegram: unify message-like inbound handling so `message` and `channel_post` share the same dedupe/access/media pipeline and remain behaviorally consistent..
- Telegram: keep media-group processing resilient by skipping recoverable per-item download failures while still failing loud on non-recoverable media errors..
- Telegram/Agents: gate exec/bash tool-failure warnings behind verbose mode so default Telegram replies stay clean while verbose sessions still surface diagnostics..
- Telegram/Cron/Heartbeat: honor explicit Telegram topic targets in cron and heartbeat delivery (`<chatId>:topic:<threadId>`) so scheduled sends land in the configured topic instead of the last active thread..
- Telegram/DM routing: prevent DM inbound origin metadata from leaking into main-session `lastRoute` updates and normalize DM `lastRoute.to` to provider-prefixed `telegram:<chatId>`..
- Gateway/Daemon: forward `TMPDIR` into installed service environments so macOS LaunchAgent gateway runs can open SQLite temp/journal files reliably instead of failing with `SQLITE_CANTOPEN`..
- Agents/Billing: include the active model that produced a billing error in user-facing billing messages (for example, `OpenAI (gpt-5.3)`) across payload, failover, and lifecycle error paths, so users can identify exactly which key needs credits..
- Gateway/TUI: honor `agents.defaults.blockStreamingDefault` for `chat.send` by removing the hardcoded block-streaming disable override, so replies can use configured block-mode delivery..
- UI/Sessions: accept the canonical main session-key alias in Chat UI flows so main-session routing stays consistent..
- KiboKit/Protocol: preserve JSON boolean literals (`true`/`false`) when bridging through `AnyCodable` so Apple client RPC params no longer re-encode booleans as `1`/`0`..
- Commands/Doctor: skip embedding-provider warnings when `memory.backend` is `qmd`, because QMD manages embeddings internally and does not require `memorySearch` providers..
- Canvas/A2UI: improve bundled-asset resolution and empty-state handling so UI fallbacks render reliably..
- Commands/Doctor: avoid rewriting invalid configs with new `gateway.auth.token` defaults during repair and only write when real config changes are detected, preventing accidental token duplication and backup churn.
- Gateway/Auth: default unresolved gateway auth to token mode with startup auto-generation/persistence of `gateway.auth.token`, while allowing explicit `gateway.auth.mode: "none"` for intentional open loopback setups..
- Channels/Matrix: fix mention detection for `formatted_body` Matrix-to links by handling matrix.to mention formats consistently..
- Heartbeat/Cron: skip interval heartbeats when `HEARTBEAT.md` is missing or empty and no tagged cron events are queued, while preserving cron-event fallback for queued tagged reminders..
- Browser/Relay: reuse an already-running extension relay when the relay port is occupied by another Kibo process, while still failing on non-relay port collisions to avoid masking unrelated listeners..
- Scripts: update kiboock helper command support to include `docker-compose.extra.yml` where available..
- Kibo Shell/Config: remove Kibo Shell executable-path overrides (`shellPath`), require PATH-based execution, and add focused Windows wrapper-resolution tests to keep shell-free behavior stable.
- Gateway/WebChat: block `sessions.patch` and `sessions.delete` for WebChat clients so session-store mutations stay restricted to non-WebChat operator flows. for reporting.
- Gateway: clarify launchctl GUI domain bootstrap failure on macOS..
- Kibo Shell/CI: fix flaky test Windows cmd shim script resolution..
- Browser/Relay: require gateway-token auth on both `/extension` and `/cdp`, and align Chrome extension setup to use a single `gateway.auth.token` input for relay authentication. for reporting.
- Gateway/Hooks: run BOOT.md startup checks per configured agent scope, including per-agent session-key resolution, startup-hook regression coverage, and non-success boot outcome logging for diagnosability..
- Protocol/Apple: regenerate Swift gateway models for `push.test` so `pnpm protocol:check` stays green on main..
- Sandbox/Registry: serialize container and browser registry writes with shared file locks and atomic replacement to prevent lost updates and delete rollback races from desyncing `sandbox list`, `prune`, and `recreate --all`..
- OTEL/diagnostics-otel: complete OpenTelemetry v2 API migration..
- Cron/Webhooks: protect cron webhook POST delivery with SSRF-guarded outbound fetch (`fetchWithSsrFGuard`) to block private/metadata destinations before request dispatch..
- Security/Voice Call: harden `voice-call` telephony TTS override merging by blocking unsafe deep-merge keys (`__proto__`, `prototype`, `constructor`) and add regression coverage for top-level and nested prototype-pollution payloads.
- Security/Windows Daemon: harden Scheduled Task `gateway.cmd` generation by quoting cmd metacharacter arguments, escaping `%`/`!` expansions, and rejecting CR/LF in arguments, descriptions, and environment assignments (`set "KEY=VALUE"`), preventing command injection in Windows daemon startup scripts. for reporting.
- Security/Gateway/Canvas: replace shared-IP fallback auth with node-scoped session capability URLs for `/__kibo__/canvas/*` and `/__kibo__/a2ui/*`, fail closed when trusted-proxy requests omit forwarded client headers, and add IPv6/proxy-header regression coverage. for reporting.
- Security/Net: enforce strict dotted-decimal IPv4 literals in SSRF checks and fail closed on unsupported legacy forms (octal/hex/short/packed, for example `0177.0.0.1`, `127.1`, `2130706433`) before DNS lookup.
- Security/Discord: enforce trusted-sender guild permission checks for moderation actions (`timeout`, `kick`, `ban`) and ignore untrusted `senderUserId` params to prevent privilege escalation in tool-driven flows. for reporting.
- Security/ACP+Exec: add `kibo acp --token-file/--password-file` secret-file support (with inline secret flag warnings), redact ACP working-directory prefixes to `~` home-relative paths, constrain exec script preflight file inspection to the effective `workdir` boundary, and add security-audit warnings when `tools.exec.host="sandbox"` is configured while sandbox mode is off.
- Security/Plugins/Hooks: enforce runtime/package path containment with realpath checks so `kibo.extensions`, `kibo.hooks`, and hook handler modules cannot escape their trusted roots via traversal or symlinks.
- Security/Discord: centralize trusted sender checks for moderation actions in message-action dispatch, share moderation command parsing across handlers, and clarify permission helpers with explicit any/all semantics.
- Security/ACP: harden ACP bridge session management with duplicate-session refresh, idle-session reaping, oldest-idle soft-cap eviction, and burst rate limiting on session creation to reduce local DoS risk without disrupting normal IDE usage.
- Security/ACP: bound ACP prompt text payloads to 2 MiB before gateway forwarding, account for join separator bytes during pre-concatenation size checks, and avoid stale active-run session state when oversized prompts are rejected. for reporting.
- Security/Plugins/Hooks: add optional `--pin` for npm plugin/hook installs, persist resolved npm metadata (`name`, `version`, `spec`, integrity, shasum, timestamp), warn/confirm on integrity drift during updates, and extend `kibo security audit` to flag unpinned specs, missing integrity metadata, and install-record version drift.
- Security/Plugins: harden plugin discovery by blocking unsafe candidates (root escapes, world-writable paths, suspicious ownership), add startup warnings when `plugins.allow` is empty with discoverable non-bundled plugins, and warn on loaded plugins without install/load-path provenance.
- Security/Gateway: rate-limit control-plane write RPCs (`config.apply`, `config.patch`, `update.run`) to 3 requests per minute per `deviceId+clientIp`, add restart single-flight coalescing plus a 30-second restart cooldown, and log actor/device/ip with changed-path audit details for config/update-triggered restarts.
- Security/Webhooks: harden Feishu and Zalo webhook ingress with webhook-mode token preconditions, loopback-default Feishu bind host, JSON content-type enforcement, per-path rate limiting, replay dedupe for Zalo events, constant-time Zalo secret comparison, and anomaly status counters.
- Security/Plugins: for the next npm release, clarify plugin trust boundary and keep `runtime.system.runCommandWithTimeout` available by default for trusted in-process plugins. for reporting.
- Security/Skills: for the next npm release, reject symlinks during skill packaging to prevent external file inclusion in distributed `.skill` archives. for reporting.
- Security/Gateway: fail startup when `hooks.token` matches `gateway.auth.token` so hooks and gateway token reuse is rejected at boot..
- Security/Network: block plaintext `ws://` connections to non-loopback hosts and require secure websocket transport elsewhere..
- Security/Config: parse frontmatter YAML using the YAML 1.2 core schema to avoid implicit coercion of `on`/`off`-style values..
- Security/Discord: escape backticks in exec-approval embed content to prevent markdown formatting injection via command text..
- Security/Agents: replace shell-based `execSync` usage with `execFileSync` in command lookup helpers to eliminate shell argument interpolation risk..
- Security/Media: use `crypto.randomBytes()` for temp file names and set owner-only permissions for TTS temp files..
- Security/Gateway: set baseline security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`) on gateway HTTP responses..
- Security/iMessage: harden remote attachment SSH/SCP handling by requiring strict host-key verification, validating `channels.imessage.remoteHost` as `host`/`user@host`, and rejecting unsafe host tokens from config or auto-detection. for reporting.
- Security/Feishu: prevent path traversal in Feishu inbound media temp-file writes by replacing key-derived temp filenames with UUID-based names. for reporting.
- Security/Feishu: escape mention regex metacharacters in `stripBotMention` so crafted mention metadata cannot trigger regex injection or ReDoS during inbound message parsing. for the fix and for reporting.
- LINE/Security: harden inbound media temp-file naming by using UUID-based temp paths for downloaded media instead of external message IDs..
- Security/Media: harden local media ingestion against TOCTOU/symlink swap attacks by pinning reads to a single file descriptor with symlink rejection and inode/device verification in `saveMediaSource`. for reporting.
- Security/Kibo Shell (Windows): for the next npm release, remove shell-based fallback when launching Kibo Shell wrappers (`.cmd`/`.bat`) and switch to explicit argv execution with wrapper entrypoint resolution, preventing command injection while preserving Windows wrapper compatibility. for reporting.
- Security/Exec: require `tools.exec.safeBins` binaries to resolve from trusted bin directories (system defaults plus gateway startup `PATH`) so PATH-hijacked trojan binaries cannot bypass allowlist checks. for reporting.
- Security/Exec: remove file-existence oracle behavior from `tools.exec.safeBins` by using deterministic argv-only stdin-safe validation and blocking file-oriented flags (for example `sort -o`, `jq -f`, `grep -f`) so allow/deny results no longer disclose host file presence. for reporting.
- Security/Browser: route browser URL navigation through one SSRF-guarded validation path for tab-open/CDP-target/Playwright navigation flows and block private/metadata destinations by default (configurable via `browser.ssrfPolicy`). for reporting.
- Security/Exec: for the next npm release, harden safe-bin stdin-only enforcement by blocking output/recursive flags (`sort -o/--output`, grep recursion) and tightening default safe bins to remove `sort`/`grep`, preventing safe-bin allowlist bypass for file writes/recursive reads. for reporting.
- Security/Exec: block grep safe-bin positional operand bypass by setting grep positional budget to zero, so `-e/--regexp` cannot smuggle bare filename reads (for example `.env`) via ambiguous positionals; safe-bin grep patterns must come from `-e/--regexp`. for reporting.
- Security/Gateway/Agents: remove implicit admin scopes from agent tool gateway calls by classifying methods to least-privilege operator scopes, and enforce owner-only tooling (`cron`, `gateway`, `whatsapp_login`) through centralized tool-policy wrappers plus tool metadata to prevent non-owner DM privilege escalation. Ships in the next npm release. for reporting.
- Security/Gateway: centralize gateway method-scope authorization and default non-CLI gateway callers to least-privilege method scopes, with explicit CLI scope handling, full core-handler scope classification coverage, and regression guards to prevent scope drift.
- Security/Net: block SSRF bypass via NAT64 (`64:ff9b::/96`, `64:ff9b:1::/48`), 6to4 (`2002::/16`), and Teredo (`2001:0000::/32`) IPv6 transition addresses, and fail closed on IPv6 parse errors..
- Security/OTEL: sanitize OTLP endpoint URL resolution..
- Security: patch Dependabot security issues in pnpm lock..
- Security: migrate request dependencies to `@cypress/request`..

## 2026.2.17

### Changes

- Agents/Anthropic: add opt-in 1M context beta header support for Opus/Sonnet via model `params.context1m: true` (maps to `anthropic-beta: context-1m-2025-08-07`).
- Agents/Models: support Anthropic Sonnet 4.6 (`anthropic/claude-sonnet-4-6`) across aliases/defaults with forward-compat fallback when upstream catalogs still only expose Sonnet 4.5.
- Commands/Subagents: add `/subagents spawn` for deterministic subagent activation from chat commands..
- Agents/Subagents: add an accepted response note for `sessions_spawn` explaining polling subagents are disabled for one-off calls..
- Agents/Subagents: prefix spawned subagent task messages with context to preserve source information in downstream handling..
- iOS/Share: add an iOS share extension that forwards shared URL/text/image content directly to gateway `agent.request`, with delivery-route fallback and optional receipt acknowledgements..
- iOS/Talk: add a `Background Listening` toggle that keeps Talk Mode active while the app is backgrounded (off by default for battery safety)..
- iOS/Talk: add a `Voice Directive Hint` toggle for Talk Mode prompts so users can disable ElevenLabs voice-switching instructions to save tokens when not needed..
- iOS/Talk: harden barge-in behavior by disabling interrupt-on-speech when output route is built-in speaker/receiver, reducing false interruptions from local TTS bleed-through..
- Slack: add native single-message text streaming with Slack `chat.startStream`/`appendStream`/`stopStream`; keep reply threading aligned with `replyToMode`, default streaming to enabled, and fall back to normal delivery when streaming fails..
- Slack: add configurable streaming modes for draft previews..
- Telegram/Agents: add inline button `style` support (`primary|success|danger`) across message tool schema, Telegram action parsing, send pipeline, and runtime prompt guidance..
- Telegram: surface user message reactions as system events, with configurable `channels.telegram.reactionNotifications` scope..
- iMessage: support `replyToId` on outbound text/media sends and normalize leading `[[reply_to:<id>]]` tags so replies target the intended iMessage..
- Tool Display/Web UI: add intent-first tool detail views and exec summaries..
- Discord: expose native `/exec` command options (host/security/ask/node) so Discord slash commands get autocomplete and structured inputs..
- Discord: allow reusable interactive components with `components.reusable=true` so buttons, selects, and forms can be used multiple times before expiring..
- Discord: add per-button `allowedUsers` allowlist for interactive components to restrict who can click buttons..
- Cron/Gateway: separate per-job webhook delivery (`delivery.mode = "webhook"`) from announce delivery, enforce valid HTTP(S) webhook URLs, and keep a temporary legacy `notify + cron.webhook` fallback for stored jobs..
- Cron/CLI: add deterministic default stagger for recurring top-of-hour cron schedules (including 6-field seconds cron), auto-migrate existing jobs to persisted `schedule.staggerMs`, and add `kibo cron add/edit --stagger <duration>` plus `--exact` overrides for per-job timing control.
- Cron: log per-run model/provider usage telemetry in cron run logs/webhooks and add a local usage report script for aggregating token usage by job..
- Tools/Web: add URL allowlists for `web_search` and `web_fetch`..
- Browser: add `extraArgs` config for custom Chrome launch arguments..
- Voice Call: pre-cache inbound greeting TTS for faster first playback..
- Skills: compact skill file `<location>` paths in the system prompt by replacing home-directory prefixes with `~`, and add targeted compaction tests for prompt serialization behavior..
- Skills: refine skill-description routing boundaries with explicit "Use when"/"NOT for" guidance for coding-agent/github/weather, and clarify PTY/browser fallback wording..
- Auto-reply/Prompts: include trusted inbound `message_id` in conversation metadata payloads for downstream targeting workflows..
- Auto-reply: include `sender_id` in trusted inbound metadata so moderation workflows can target the sender without relying on untrusted text..
- UI/Sessions: avoid duplicating typed session prefixes in display names (for example `Subagent Subagent ...`)..
- Agents/Z.AI: enable `tool_stream` by default for real-time tool call streaming, with opt-out via `params.tool_stream: false`..
- Plugins: add `before_agent_start` model/provider overrides before resolution..
- Mattermost: add emoji reaction actions plus reaction event notifications, including an explicit boolean `remove` flag to avoid accidental removals..
- Memory/Search: add FTS fallback plus query expansion for memory search..
- Agents/Models: support per-model `thinkingDefault` overrides in model config..
- Agents: enable `llms.txt` discovery in default behavior..
- Extensions/Auth: add OpenAI Codex CLI auth provider integration..
- Feishu: add Bitable create-app/create-field tools for automation workflows..
- Docker: add optional `KIBO_INSTALL_BROWSER` build arg to preinstall Chromium + Xvfb in the Docker image, avoiding runtime Playwright installs.

### Fixes

- Agents/Antigravity: preserve unsigned Claude thinking blocks as plain text instead of dropping them during transcript sanitization, preventing reasoning context loss while avoiding `thinking.signature` request rejections.
- Agents/Google: clean tool JSON Schemas for `google-antigravity` the same as `google-gemini-cli` before Cloud Code Assist requests, preventing Claude tool calls from failing with `patternProperties` 400 errors.
- Tests/Telegram: add regression coverage for command-menu sync that asserts all `setMyCommands` entries are Telegram-safe and hyphen-normalized across native/custom/plugin command sources..
- Agents/Image: collapse resize diagnostics to one line per image and include visible pixel/byte size details in the log message for faster triage.
- Auth/Cooldowns: clear all usage stats fields (`disabledUntil`, `disabledReason`, `failureCounts`) in `clearAuthProfileCooldown` so manual cooldown resets fully recover billing-disabled profiles without requiring direct file edits..
- Agents/Subagents: preemptively guard accumulated tool-result context before model calls by truncating oversized outputs and compacting oldest tool-result messages to avoid context-window overflow crashes..
- Agents/Subagents/CLI: fail `sessions_spawn` when subagent model patching is rejected, allow subagent model patch defaults from `subagents.model`, and keep `sessions list`/`status` model reporting aligned to runtime model resolution..
- Agents/Subagents: add explicit subagent guidance to recover from `[compacted: tool output removed to free context]` / `[truncated: output exceeded context limit]` markers by re-reading with smaller chunks instead of full-file `cat`..
- Agents/Tools: make `read` auto-page across chunks (when no explicit `limit` is provided) and scale its per-call output budget from model `contextWindow`, so larger contexts can read more before context guards kick in..
- Agents/Tools: strip duplicated `read` truncation payloads from tool-result `details` and make pre-call context guarding account for heavy tool-result metadata, so repeated `read` calls no longer bypass compaction and overflow model context windows..
- Reply threading: keep reply context sticky across streamed/split chunks and preserve `replyToId` on all chunk sends across shared and channel-specific delivery paths (including iMessage, BlueBubbles, Telegram, Discord, and Matrix), so follow-up bubbles stay attached to the same referenced message..
- Gateway/Agent: defer transient lifecycle `error` snapshots with a short grace window so `agent.wait` does not resolve early during retry/failover..
- Gateway/Presence: centralize presence snapshot broadcasts and unify runtime version precedence (`KIBO_VERSION` > `KIBO_SERVICE_VERSION` > `npm_package_version`) so self-presence and websocket `hello-ok` report consistent versions.
- Hooks/Automation: bridge outbound/inbound message lifecycle into internal hook events (`message:received`, `message:sent`) with session-key correlation guards, while keeping per-payload success/error reporting accurate for chunked and best-effort deliveries. (PR #9387)
- Media understanding: honor `agents.defaults.imageModel` during auto-discovery so implicit image analysis uses configured primary/fallback image models. (PR #7607)
- iOS/Onboarding: stop auth Step 3 retry-loop churn by pausing reconnect attempts on unauthorized/missing-token gateway errors and keeping auth/pairing issue state sticky during manual retry..
- Voice-call: auto-end calls when media streams disconnect to prevent stuck active calls..
- Voice call/Gateway: prevent overlapping closed-loop turn races with per-call turn locking, route transcript dedupe via source-aware fingerprints with strict cache eviction bounds, and harden `voicecall latency` stats for large logs without spread-operator stack overflow..
- iOS/Chat: route ChatSheet RPCs through the operator session instead of the node session to avoid node-role authorization failures for `chat.history`, `chat.send`, and `sessions.list`..
- macOS/Update: correct the Sparkle appcast version for 2026.2.15 so updates are offered again.
- Gateway/Auth: clear stale device-auth tokens after device token mismatch errors so re-paired clients can re-auth.
- Telegram: enable DM voice-note transcription with CLI fallback handling..
- Telegram/Polls: restore Telegram poll action wiring in channel handlers..
- WebChat: strip reply/audio directive tags from rendered chat output..
- Discord: honor configured HTTP proxy for app-id and allowlist REST resolution..
- BlueBubbles: add fallback path to recover outbound `message_id` from `fromMe` webhooks when platform message IDs are missing..
- BlueBubbles: match outbound message-id fallback recovery by chat identifier as well as account context..
- BlueBubbles: include sender identifier in untrusted conversation metadata for conversation info payloads..
- Security/Exec: fix the OC-09 credential-theft path via environment-variable injection..
- Security/Config: confine `$include` resolution to the top-level config directory, harden traversal/symlink checks with cross-platform-safe path containment, and add doctor hints for invalid escaped include paths..
- Security/Net: block SSRF bypass via ISATAP embedded IPv4 transition addresses and centralize hostname/IP blocking checks across URL safety validators. for reporting.
- Providers: improve error messaging for unconfigured local `ollama`/`vllm` providers..
- TTS: surface all provider errors instead of only the last error in aggregated failures..
- CLI/Doctor/Configure: skip gateway auth checks for loopback-only setups..
- CLI/Doctor: reconcile gateway service-token drift after re-pair flows..
- Process/Windows: disable detached spawn in exec runs to prevent empty command output..
- Process: gracefully terminate process trees with SIGTERM before SIGKILL..
- Sessions/Windows: use atomic session-store writes to prevent context loss on Windows..
- Agents/Image: validate base64 image payloads before provider submission..
- Models CLI: validate catalog entries in `kibo models set`..
- Usage: isolate last-turn totals in token usage reporting to avoid mixed-turn totals..
- Cron: resolve `accountId` from agent bindings in isolated sessions..
- Gateway/HTTP: preserve unbracketed IPv6 `Host` headers when normalizing requests..
- Sandbox: fix workspace-directory orphaning during SHA-1 -> SHA-256 slug migration..
- Ollama/Qwen: handle Qwen 3 reasoning field format in Ollama responses..
- OpenAI/Transcripts: always drop orphaned reasoning blocks from transcript repair..
- Fix types in all tests. Typecheck the whole repository.
- Gateway/Channels: wire `gateway.channelHealthCheckMinutes` into strict config validation, treat implicit account status as managed for health checks, and harden channel auto-restart flow (preserve restart-attempt caps across crash loops, propagate enabled/configured runtime flags, and stop pending restart backoff after manual stop)..
- Gateway/WebChat: hard-cap `chat.history` oversized payloads by truncating high-cost fields and replacing over-budget entries with placeholders, so history fetches stay within configured byte limits and avoid chat UI freezes.
- UI/Usage: replace lingering undefined `var(--text-muted)` usage with `var(--muted)` in usage date-range and chart styles to keep muted text visible across themes..
- UI/Usage: preserve selected-range totals when timeline data is downsampled by bucket-aggregating timeseries points (instead of dropping intermediate points), so filtered tokens/cost stay accurate..
- UI/Sessions: refresh the sessions table only after successful deletes and preserve delete errors on cancel/failure paths, so deleted sessions disappear automatically without masking delete failures.
- Scripts/UI/Windows: fix `pnpm ui:*` spawn `EINVAL` failures by restoring shell-backed launch for `.cmd`/`.bat` runners, narrowing shell usage to launcher types that require it, and rejecting unsafe forwarded shell metacharacters in UI script args.
- Hooks/Session-memory: recover `/new` conversation summaries when session pointers are reset-path or missing `sessionFile`, and consistently prefer the newest `.jsonl.reset.*` transcript candidate for fallback extraction.
- Auto-reply/Sessions: prevent stale thread ID leakage into non-thread sessions so replies stay in the main DM after topic interactions..
- Slack: restrict forwarded-attachment ingestion to explicit shared-message attachments and skip non-Slack forwarded `image_url` fetches, preventing non-forward attachment unfurls from polluting inbound agent context while preserving forwarded message handling.
- Feishu: detect bot mentions in post messages with embedded docs when `message.mentions` is empty..
- Agents/Sessions: align session lock watchdog hold windows with run and compaction timeout budgets (plus grace), preventing valid long-running turns from being force-unlocked mid-run while still recovering hung lock owners.
- Cron: preserve default model fallbacks for cron agent runs when only `model.primary` is overridden, so failover still follows configured fallbacks unless explicitly cleared with `fallbacks: []`..
- Cron/Isolation: treat non-finite `nextRunAtMs` as missing and repair isolated `every` anchor fallback so legacy jobs without valid timestamps self-heal and scheduler wake timing remains valid..
- Cron: route text-only announce output through the main session announce flow via runSubagentAnnounceFlow so cron text-only output remains visible to the initiating session..
- Cron: treat `timeoutSeconds: 0` as no-timeout (not clamped to 1), ensuring long-running cron runs are not prematurely terminated..
- Cron announce injection now targets the session determined by delivery config (`to` + channel) instead of defaulting to the current session..
- Cron/Heartbeat: canonicalize session-scoped reminder `sessionKey` routing and preserve explicit flat `sessionKey` cron tool inputs, preventing enqueue/wake namespace drift for session-targeted reminders..
- Cron/Webhooks: reuse existing session IDs for webhook/cron runs when the session key is stable and still fresh, preserving conversation history..
- Cron: prevent spin loops when cron jobs complete within the scheduled second by advancing the next run and enforcing a minimum refire gap..
- KiboKit/iOS ChatUI: accept canonical session-key completion events for local pending runs and preserve message IDs across history refreshes, preventing stuck "thinking" state and message flicker after gateway replies..
- iOS/Onboarding: add QR-first onboarding wizard with setup-code deep link support, pairing/auth issue guidance, and device-pair QR generation improvements for Telegram/Web/TUI fallback flows. and.
- iOS/Gateway: stabilize connect/discovery state handling, add onboarding reset recovery in Settings, and fix iOS gateway-controller coverage for command-surface and last-connection persistence behavior..
- iOS/Talk: harden mobile talk config handling by ignoring redacted/env-placeholder API keys, support secure local keychain override, improve accessibility motion/contrast behavior in status UI, and tighten ATS to local-network allowance..
- iOS/Location: restore the significant location monitor implementation (service hooks + protocol surface + ATS key alignment) after merge drift so iOS builds compile again..
- iOS/Signing: auto-select local Apple Development team during iOS project generation/build, prefer the canonical Kibo team when available, and support local per-machine signing overrides without committing team IDs..
- Discord/Telegram: make per-account message action gates effective for both action listing and execution, and preserve top-level gate restrictions when account overrides only specify a subset of `actions` keys (account key -> base key -> default fallback).
- Telegram: keep DM-topic replies and draft previews in the originating private-chat topic by preserving positive `message_thread_id` values for DM threads..
- Telegram: preserve private-chat topic `message_thread_id` on outbound sends (message/sticker/poll), keep thread-not-found retry fallback, and avoid masking `chat not found` routing errors..
- Discord: prevent duplicate media delivery when the model uses the `message send` tool with media, by skipping media extraction from messaging tool results since the tool already sent the message directly.
- Discord: route `audioAsVoice` auto-replies through the voice message API so opt-in audio renders as voice messages..
- Discord: skip auto-thread creation in forum/media/voice/stage channels and keep group session last-route metadata fresh to avoid invalid thread API errors and lost follow-up sends..
- Discord/Commands: normalize `commands.allowFrom` entries with `user:`/`discord:`/`pk:` prefixes and `<@id>` mentions so command authorization matches Discord allowlist behavior.
- Telegram: keep draft-stream preview replies attached to the user message for `replyToMode: "all"` in groups and DMs, preserving threaded reply context from preview through finalization..
- Telegram: prevent streaming final replies from being overwritten by later final/error payloads, and suppress fallback tool-error warnings when a recovered assistant answer already exists after tool calls. and.
- Telegram: debounce the first draft-stream preview update (30-char threshold) and finalize short responses by editing the stop-time preview message, improving first push notifications and avoiding duplicate final sends..
- Telegram: disable block streaming when `channels.telegram.streamMode` is `off`, preventing newline/content-block replies from splitting into multiple messages..
- Telegram: keep `streamMode: "partial"` draft previews in a single message across assistant-message/reasoning boundaries, preventing duplicate preview bubbles during partial-mode tool-call turns..
- Telegram: normalize native command names for Telegram menu registration (`-` -> `_`) to avoid `BOT_COMMAND_INVALID` command-menu wipeouts, and log failed command syncs instead of silently swallowing them..
- Telegram: route non-abort slash commands on the normal chat/topic sequential lane while keeping true abort requests (`/stop`, `stop`) on the control lane, preventing command/reply race conditions from control-lane bypass..
- Telegram: ignore `<media:...>` placeholder lines when extracting `MEDIA:` tool-result paths, preventing false local-file reads and dropped replies..
- Telegram: skip retries when inbound media `getFile` fails with Telegram's 20MB limit and continue processing message text, avoiding dropped messages for oversized attachments..
- Telegram: clear stored polling offsets when bot tokens change or accounts are deleted, preventing stale offsets after token rotations.
- Telegram: enable `autoSelectFamily` by default on Node.js 22+ so IPv4 fallback works on broken IPv6 networks..
- Auto-reply/TTS: keep tool-result media delivery enabled in group chats and native command sessions (while still suppressing tool summary text) so `NO_REPLY` follow-ups do not drop successful TTS audio..
- Agents/Tools: deliver tool-result media even when verbose tool output is off so media attachments are not dropped.
- Discord: optimize reaction notification handling to skip unnecessary message fetches in `off`/`all`/`allowlist` modes, streamline reaction routing, and improve reaction emoji formatting. and.
- CLI/Pairing: make `kibo qr --remote` prefer `gateway.remote.url` over tailscale/public URL resolution and register the `kibo clawbot qr` legacy alias path.
- CLI/QR: restore fail-fast validation for `kibo qr --remote` when neither `gateway.remote.url` nor tailscale `serve`/`funnel` is configured, preventing unusable remote pairing QR flows..
- CLI: fix parent/subcommand option collisions across gateway, daemon, update, ACP, and browser command flows, while preserving legacy `browser set headers --json <payload>` compatibility.
- CLI/Doctor: ensure `kibo doctor --fix --non-interactive --yes` exits promptly after completion so one-shot automation no longer hangs.
- CLI/Doctor: auto-repair `dmPolicy="open"` configs missing wildcard allowlists and write channel-correct repair paths (including `channels.googlechat.dm.allowFrom`) so `kibo doctor --fix` no longer leaves Google Chat configs invalid after attempted repair.
- CLI/Doctor: detect gateway service token drift when the gateway token is only provided via environment variables, keeping service repairs aligned after token rotation.
- Gateway/Update: prevent restart crash loops after failed self-updates by restarting only on successful updates, stopping early on failed install/build steps, and running `kibo doctor --fix` during updates to sanitize config..
- Gateway/Update: preserve update.run restart delivery context so post-update status replies route back to the initiating channel/thread..
- CLI/Update: run a standalone restart helper after updates, honoring service-name overrides and reporting restart initiation separately from confirmed restarts.
- CLI/Daemon: warn when a gateway restart sees a stale service token so users can reinstall with `kibo gateway install --force`, and skip drift warnings for non-gateway service restarts.
- CLI/Daemon: prefer the active version-manager Node when installing daemons and include macOS version-manager bin directories in the service PATH so launchd services resolve user-managed runtimes.
- CLI/Status: fix `kibo status --all` token summaries for bot-token-only channels so Mattermost/Zalo no longer show a bot+app warning..
- CLI/Configure: make the `/model picker` allowlist prompt searchable with tokenized matching in `kibo configure` so users can filter huge model lists by typing terms like `gpt-5.2 openai/`..
- CLI/Message: preserve `--components` JSON payloads in `kibo message send` so Discord component payloads are no longer dropped..
- Voice Call: add an optional stale call reaper (`staleCallReaperSeconds`) to end stuck calls when enabled.
- Auto-reply/Subagents: propagate group context (`groupId`, `groupChannel`, `space`) when spawning via `/subagents spawn`, matching tool-triggered subagent spawn behavior.
- Subagents: route nested announce results back to the parent session after the parent run ends, falling back only when the parent session is deleted..
- Subagents: cap announce retry loops with max attempts and expiry to prevent infinite retry spam after deferred announces.
- Agents/Tools/exec: add a preflight guard that detects likely shell env var injection (e.g. `$DM_JSON`, `$TMPDIR`) in Python/Node scripts before execution, preventing recurring cron failures and wasted tokens when models emit mixed shell+language source.
- Agents/Tools/exec: treat normal non-zero exit codes as completed and append the exit code to tool output to avoid false tool-failure warnings.
- Agents/Tools: make loop detection progress-aware and phased by hard-blocking known `process(action=poll|log)` no-progress loops, warning on generic identical-call repeats, warning + no-progress-blocking ping-pong alternation loops (10/20), coalescing repeated warning spam into threshold buckets (including canonical ping-pong pairs), adding a global circuit breaker at 30 no-progress repeats, and emitting structured diagnostic `tool.loop` warning/error events for loop actions. and.
- Agents/Hooks: preserve the `before_tool_call` wrapped-marker across abort-signal tool wrapping so the hook runs once per tool call in normal agent sessions..
- Agents/Tests: add `before_message_write` persistence regression coverage for block/mutate behavior (including synthetic tool-result flushes) and thrown-hook fallback persistence.
- Agents/Tools: scope the `message` tool schema to the active channel so Telegram uses `buttons` and Discord uses `components`..
- Agents/Image tool: replace Anthropic-incompatible union schema with explicit `image` (single) and `images` (multi) parameters, keeping tool schemas `anyOf`/`oneOf`/`allOf`-free while preserving multi-image analysis support. (#18551, #18566).
- Agents/Models: probe the primary model when its auth-profile cooldown is near expiry (with per-provider throttling), so runs recover from temporary rate limits without staying on fallback models until restart..
- Agents/Failover: classify provider abort stop-reason errors (`Unhandled stop reason: abort`, `stop reason: abort`, `reason: abort`) as timeout-class failures so configured model fallback chains trigger instead of surfacing raw abort failures..
- Models/CLI: sync auth-profiles credentials into agent `auth.json` before registry availability checks so `kibo models list --all` reports auth correctly for API-key/token providers, normalize provider-id aliases when bridging credentials, and skip expired token mirrors. (#18610, #18615)
- Agents/Context: raise default total bootstrap prompt cap from `24000` to `150000` chars (keeping `bootstrapMaxChars` at `20000`), include total-cap visibility in `/context`, and mark truncation from injected-vs-raw sizes so total-cap clipping is reflected accurately.
- Memory/QMD: scope managed collection names per agent and precreate glob-backed collection directories before registration, preventing cross-agent collection clobbering and startup ENOENT failures in fresh workspaces..
- Cron: preserve per-job schedule-error isolation in post-run maintenance recompute so malformed sibling jobs no longer abort persistence of successful runs..
- Gateway/Config: prevent `config.patch` object-array merges from falling back to full-array replacement when some patch entries lack `id`, so partial `agents.list` updates no longer drop unrelated agents..
- Gateway/Auth: trim whitespace around trusted proxy entries before matching so configured proxies with stray spaces still authorize..
- Config/Discord: require string IDs in Discord allowlists, keep onboarding inputs string-only, and add doctor repair for numeric entries..
- Security/Sessions: create new session transcript JSONL files with user-only (`0o600`) permissions and extend `kibo security audit --fix` to remediate existing transcript file permissions.
- Sessions/Maintenance: archive transcripts when pruning stale sessions, clean expired media in subdirectories, and purge `.deleted` transcript archives after the prune window to prevent disk leaks.
- Infra/Fetch: ensure foreign abort-signal listener cleanup never masks original fetch successes/failures, while still preventing detached-finally unhandled rejection noise in `wrapFetchWithAbortSignal`..
- Heartbeat: allow suppressing tool error warning payloads during heartbeat runs via a new heartbeat config flag..
- Heartbeat: include sender metadata (From/To/Provider) in heartbeat prompts so model context matches the delivery target..
- Heartbeat/Telegram: strip configured `responsePrefix` before heartbeat ack detection (with boundary-safe matching) so prefixed `HEARTBEAT_OK` replies are correctly suppressed instead of leaking into DMs.

## 2026.2.15

### Changes

- Discord: unlock rich interactive agent prompts with Components v2 (buttons, selects, modals, and attachment-backed file blocks) so for native interaction through Discord..
- Discord: components v2 UI + embeds passthrough + exec approval UX refinements (CV2 containers, button layout, Discord-forwarding skip)..
- Plugins: expose `llm_input` and `llm_output` hook payloads so extensions can observe prompt/input context and model output usage details..
- Subagents: nested sub-agents (sub-sub-agents) with configurable depth. Set `agents.defaults.subagents.maxSpawnDepth: 2` to allow sub-agents to spawn their own children. Includes `maxChildrenPerAgent` limit (default 5), depth-aware tool policy, and proper announce chain routing..
- Slack/Discord/Telegram: add per-channel ack reaction overrides (account/channel-level) to support platform-specific emoji formats..
- Telegram: add `channel_post` inbound support for channel-based bot-to-bot wake/trigger flows, with channel allowlist gating and message/media batching parity.
- Cron/Gateway: add finished-run webhook delivery toggle (`notify`) and dedicated webhook auth token support (`cron.webhookToken`) for outbound cron webhook posts..
- Channels: deduplicate probe/token resolution base types across core + extensions while preserving per-channel error typing. and.
- Memory: add MMR (Maximal Marginal Relevance) re-ranking for hybrid search diversity. Configurable via `memorySearch.query.hybrid.mmr`..
- Memory: add opt-in temporal decay for hybrid search scoring, with configurable half-life via `memorySearch.query.hybrid.temporalDecay`..

### Fixes

- Discord: send initial content when creating non-forum threads so `thread-create` content is delivered..
- Security: replace deprecated SHA-1 sandbox configuration hashing with SHA-256 for deterministic sandbox cache identity and recreation checks..
- Security/Logging: redact Telegram bot tokens from error messages and uncaught stack traces to prevent accidental secret leakage into logs..
- Sandbox/Security: block dangerous sandbox Docker config (bind mounts, host networking, unconfined seccomp/apparmor) to prevent container escape via config injection..
- Sandbox: preserve array order in config hashing so order-sensitive Docker/browser settings trigger container recreation correctly..
- Gateway/Security: redact sensitive session/path details from `status` responses for non-admin clients; full details remain available to `operator.admin`..
- Gateway/Control UI: preserve requested operator scopes for Control UI bypass modes (`allowInsecureAuth` / `dangerouslyDisableDeviceAuth`) when device identity is unavailable, preventing false `missing scope` failures on authenticated LAN/HTTP operator sessions..
- LINE/Security: fail closed on webhook startup when channel token or channel secret is missing, and treat LINE accounts as configured only when both are present..
- Skills/Security: restrict `download` installer `targetDir` to the per-skill tools directory to prevent arbitrary file writes..
- Skills/Linux: harden go installer fallback on apt-based systems by handling root/no-sudo environments safely, doing best-effort apt index refresh, and returning actionable errors instead of failing with spawn errors..
- Web Fetch/Security: cap downloaded response body size before HTML parsing to prevent memory exhaustion from oversized or deeply nested pages..
- Config/Gateway: make sensitive-key whitelist suffix matching case-insensitive while preserving `passwordFile` path exemptions, preventing accidental redaction of non-secret config values like `maxTokens` and IRC password-file paths..
- Dev tooling: harden git `pre-commit` hook against option injection from malicious filenames (for example `--force`), preventing accidental staging of ignored files..
- Gateway/Agent: reject malformed `agent:`-prefixed session keys (for example, `agent:main`) in `agent` and `agent.identity.get` instead of silently resolving them to the default agent, preventing accidental cross-session routing..
- Gateway/Chat: harden `chat.send` inbound message handling by rejecting null bytes, stripping unsafe control characters, and normalizing Unicode to NFC before dispatch..
- Gateway/Send: return an actionable error when `send` targets internal-only `webchat`, guiding callers to use `chat.send` or a deliverable channel..
- Gateway/Commands: keep webchat command authorization on the internal `webchat` context instead of inferring another provider from channel allowlists, fixing dropped `/new`/`/status` commands in Control UI when channel allowlists are configured..
- Control UI: prevent stored XSS via assistant name/avatar by removing inline script injection, serving bootstrap config as JSON, and enforcing `script-src 'self'`..
- Agents/Security: sanitize workspace paths before embedding into LLM prompts (strip Unicode control/format chars) to prevent instruction injection via malicious directory names..
- Agents/Sandbox: clarify system prompt path guidance so sandbox `bash/exec` uses container paths (for example `/workspace`) while file tools keep host-bridge mapping, avoiding first-attempt path misses from host-only absolute paths in sandbox command execution./juniordevbot.
- Agents/Context: apply configured model `contextWindow` overrides after provider discovery so `lookupContextTokens()` honors operator config values (including discovery-failure paths). and.
- Agents/Context: derive `lookupContextTokens()` from auth-available model metadata and keep the smallest discovered context window for duplicate model ids, preventing cross-provider cache collisions from overestimating session context limits. and.
- Agents/OpenAI: force `store=true` for direct OpenAI Responses/Codex runs to preserve multi-turn server-side conversation state, while leaving proxy/non-OpenAI endpoints unchanged. and.
- Memory/FTS: make `buildFtsQuery` Unicode-aware so non-ASCII queries (including CJK) produce keyword tokens instead of falling back to vector-only search..
- Auto-reply/Compaction: resolve `memory/YYYY-MM-DD.md` placeholders with timezone-aware runtime dates and append a `Current time:` line to memory-flush turns, preventing wrong-year memory filenames without making the system prompt time-variant. (#17603, #17633) and.
- Auth/Cooldowns: auto-expire stale auth profile cooldowns when `cooldownUntil` or `disabledUntil` timestamps have passed, and reset `errorCount` so the next transient failure does not immediately escalate to a disproportionately long cooldown. Handles `cooldownUntil` and `disabledUntil` independently..
- Agents: return an explicit timeout error reply when an embedded run times out before producing any payloads, preventing silent dropped turns during slow cache-refresh transitions. and.
- Group chats: always inject group chat context (name, participants, reply guidance) into the system prompt on every turn, not just the first. Prevents the model from losing awareness of which group it's in and incorrectly using the message tool to send to the same group..
- Browser/Agents: when browser control service is unavailable, return explicit non-retry guidance (instead of "try again") so models do not loop on repeated browser tool calls until timeout..
- Subagents: use child-run-based deterministic announce idempotency keys across direct and queued delivery paths (with legacy queued-item fallback) to prevent duplicate announce retries without collapsing distinct same-millisecond announces..
- Subagents/Models: preserve `agents.defaults.model.fallbacks` when subagent sessions carry a model override, so subagent runs fail over to configured fallback models instead of retrying only the overridden primary model.
- Telegram: omit `message_thread_id` for DM sends/draft previews and keep forum-topic handling (`id=1` general omitted, non-general kept), preventing DM failures with `400 Bad Request: message thread not found`..
- Telegram: replace inbound `<media:audio>` placeholder with successful preflight voice transcript in message body context, preventing placeholder-only prompt bodies for mention-gated voice messages..
- Telegram: retry inbound media `getFile` calls (3 attempts with backoff) and gracefully fall back to placeholder-only processing when retries fail, preventing dropped voice/media messages on transient Telegram network errors..
- Telegram: finalize streaming preview replies in place instead of sending a second final message, preventing duplicate Telegram assistant outputs at stream completion..
- Discord: preserve channel session continuity when runtime payloads omit `message.channelId` by falling back to event/raw `channel_id` values for routing/session keys, so same-channel messages keep history across turns/restarts. Also align diagnostics so active Discord runs no longer appear as `sessionKey=unknown`..
- Discord: dedupe native skill commands by skill name in multi-agent setups to prevent duplicated slash commands with `_2` suffixes..
- Discord: ensure role allowlist matching uses raw role IDs for message routing authorization..
- Discord: skip text-based exec approval forwarding in favor of Discord's component-based approval UI..
- Web UI/Agents: hide `BOOTSTRAP.md` in the Agents Files list after onboarding is completed, avoiding confusing missing-file warnings for completed workspaces..
- Gateway/Memory: initialize QMD startup sync for every configured agent (not just the default agent), so `memory.qmd.update.onBoot` is effective across multi-agent setups..
- Auto-reply/WhatsApp/TUI/Web: when a final assistant message is `NO_REPLY` and a messaging tool send succeeded, mirror the delivered messaging-tool text into session-visible assistant output so TUI/Web no longer show `NO_REPLY` placeholders..
- Cron: infer `payload.kind="agentTurn"` for model-only `cron.update` payload patches, so partial agent-turn updates do not fail validation when `kind` is omitted..
- TUI: make searchable-select filtering and highlight rendering ANSI-aware so queries ignore hidden escape codes and no longer corrupt ANSI styling sequences during match highlighting..
- TUI/Windows: coalesce rapid single-line submit bursts in Git Bash into one multiline message as a fallback when bracketed paste is unavailable, preventing pasted multiline text from being split into multiple sends..
- TUI: suppress false `(no output)` placeholders for non-local empty final events during concurrent runs, preventing external-channel replies from showing empty assistant bubbles while a local run is still streaming. and.
- TUI: preserve copy-sensitive long tokens (URLs/paths/file-like identifiers) during wrapping and overflow sanitization so wrapped output no longer inserts spaces that corrupt copy/paste values. (#17515, #17466, #17505), and.
- CLI/Build: make legacy daemon CLI compatibility shim generation tolerant of minimal tsdown daemon export sets, while preserving restart/register compatibility aliases and surfacing explicit errors for unavailable legacy daemon commands..

## 2026.2.14

### Changes

- Telegram: add poll sending via `kibo message poll` (duration seconds, silent delivery, anonymity controls)..
- Slack/Discord: add `dmPolicy` + `allowFrom` config aliases for DM access control; legacy `dm.policy` + `dm.allowFrom` keys remain supported and `kibo doctor --fix` can migrate them.
- Discord: allow exec approval prompts to target channels or both DM+channel via `channels.discord.execApprovals.target`..
- Sandbox: add `sandbox.browser.binds` to configure browser-container bind mounts separately from exec containers..
- Discord: add debug logging for message routing decisions to improve `--debug` tracing..
- Agents: add optional `messages.suppressToolErrors` config to hide non-mutating tool-failure warnings from user-facing chat while still surfacing mutating failures..

### Fixes

- CLI/Installation: fix Docker installation hangs on macOS..
- Models: fix antigravity opus 4.6 availability follow-up..
- Security/Sessions/Telegram: restrict session tool targeting by default to the current session tree (`tools.sessions.visibility`, default `tree`) with sandbox clamping, and pass configured per-account Telegram webhook secrets in webhook mode when no explicit override is provided..
- CLI/Plugins: ensure `kibo message send` exits after successful delivery across plugin-backed channels so one-shot sends do not hang..
- CLI/Plugins: run registered plugin `gateway_stop` hooks before `kibo message` exits (success and failure paths), so plugin-backed channels can clean up one-shot CLI resources..
- WhatsApp: honor per-account `dmPolicy` overrides (account-level settings now take precedence over channel defaults for inbound DMs)..
- Telegram: when `channels.telegram.commands.native` is `false`, exclude plugin commands from `setMyCommands` menu registration while keeping plugin slash handlers callable..
- LINE: return 200 OK for Developers Console "Verify" requests (`{"events":[]}`) without `X-Line-Signature`, while still requiring signatures for real deliveries..
- Cron: deliver text-only output directly when `delivery.to` is set so cron recipients get full output instead of summaries..
- Cron/Slack: preserve agent identity (name and icon) when cron jobs deliver outbound messages..
- Media: accept `MEDIA:`-prefixed paths (lenient whitespace) when loading outbound media to prevent `ENOENT` for tool-returned local media paths..
- Media understanding: treat binary `application/vnd.*`/zip/octet-stream attachments as non-text (while keeping vendor `+json`/`+xml` text-eligible) so Office/ZIP files are not inlined into prompt body text..
- Agents: deliver tool result media (screenshots, images, audio) to channels regardless of verbose level..
- Auto-reply/Block streaming: strip leading whitespace from streamed block replies so messages starting with blank lines no longer deliver visible leading empty lines..
- Auto-reply/Queue: keep queued followups and overflow summaries when drain attempts fail, then retry delivery instead of dropping messages on transient errors..
- Agents/Image tool: allow workspace-local image paths by including the active workspace directory in local media allowlists, and trust sandbox-validated paths in image loaders to prevent false "not under an allowed directory" rejections.
- Agents/Image tool: propagate the effective workspace root into tool wiring so workspace-local image paths are accepted by default when running without an explicit `workspaceDir`.
- BlueBubbles: include sender identity in group chat envelopes and pass clean message text to the agent prompt, aligning with iMessage/Signal formatting..
- CLI: fix lazy core command registration so top-level maintenance commands (`doctor`, `dashboard`, `reset`, `uninstall`) resolve correctly instead of exposing a non-functional `maintenance` placeholder command.
- CLI/Dashboard: when `gateway.bind=lan`, generate localhost dashboard URLs to satisfy browser secure-context requirements while preserving non-LAN bind behavior..
- TUI/Gateway: resolve local gateway target URL from `gateway.bind` mode (tailnet/lan) instead of hardcoded localhost so `kibo tui` connects when gateway is non-loopback..
- TUI: honor explicit `--session <key>` in `kibo tui` even when `session.scope` is `global`, so named sessions no longer collapse into shared global history..
- TUI: use available terminal width for session name display in searchable select lists..
- TUI: preserve in-flight streaming replies when a different run finalizes concurrently (avoid clearing active run or reloading history mid-stream)..
- TUI: keep pre-tool streamed text visible when later tool-boundary deltas temporarily omit earlier text blocks..
- TUI: sanitize ANSI/control-heavy history text, redact binary-like lines, and split pathological long unbroken tokens before rendering to prevent startup crashes on binary attachment history..
- TUI: harden render-time sanitizer for narrow terminals by chunking moderately long unbroken tokens and adding fast-path sanitization guards to reduce overhead on normal text..
- TUI: render assistant body text in terminal default foreground (instead of fixed light ANSI color) so contrast remains readable on light themes such as Solarized Light..
- TUI/Hooks: pass explicit reset reason (`new` vs `reset`) through `sessions.reset` and emit internal command hooks for gateway-triggered resets so `/new` hook workflows fire in TUI/webchat.
- Gateway/Agent: route bare `/new` and `/reset` through `sessions.reset` before running the fresh-session greeting prompt, so reset commands clear the current session in-place instead of falling through to normal agent runs. and.
- Cron: prevent `cron list`/`cron status` from silently skipping past-due recurring jobs by using maintenance recompute semantics..
- Cron: repair missing/corrupt `nextRunAtMs` for the updated job without globally recomputing unrelated due jobs during `cron update`.
- Cron: treat persisted jobs with missing `enabled` as enabled by default across update/list/timer due-path checks, and add regression coverage for missing-`enabled` store records..
- Cron: skip missed-job replay on startup for jobs interrupted mid-run (stale `runningAtMs` markers), preventing restart loops for self-restarting jobs such as update tasks..
- Heartbeat/Cron: treat cron-tagged queued system events as cron reminders even on interval wakes, so isolated cron announce summaries no longer run under the default heartbeat prompt. and.
- Discord: prefer gateway guild id when logging inbound messages so cached-miss guilds do not appear as `guild=dm`..
- Discord: treat empty per-guild `channels: {}` config maps as no channel allowlist (not deny-all), so `groupPolicy: "open"` guilds without explicit channel entries continue to receive messages..
- Models/CLI: guard `models status` string trimming paths to prevent crashes from malformed non-string config values..
- Gateway/Subagents: preserve queued announce items and summary state on delivery errors, retry failed announce drains, and avoid dropping unsent announcements on timeout/failure..
- Gateway/Config: make `config.patch` merge object arrays by `id` (for example `agents.list`) instead of replacing the whole array, so partial agent updates do not silently delete unrelated agents..
- Webchat/Prompts: stop injecting direct-chat `conversation_label` into inbound untrusted metadata context blocks, preventing internal label noise from leaking into visible chat replies..
- Auto-reply/Prompts: include trusted inbound `message_id`, `chat_id`, `reply_to_id`, and optional `message_id_full` metadata fields so action tools (for example reactions) can target the triggering message without relying on user text..
- Gateway/Sessions: abort active embedded runs and clear queued session work before `sessions.reset`, returning unavailable if the run does not stop in time..
- Sessions/Agents: harden transcript path resolution for mismatched agent context by preserving explicit store roots and adding safe absolute-path fallback to the correct agent sessions directory..
- Agents: add a safety timeout around embedded `session.compact()` to ensure stalled compaction runs settle and release blocked session lanes..
- Agents/Tools: make required-parameter validation errors list missing fields and instruct: "Supply correct parameters before retrying," reducing repeated invalid tool-call loops (for example `read({})`).
- Agents: keep unresolved mutating tool failures visible until the same action retry succeeds, scope mutation-error surfacing to mutating calls (including `session_status` model changes), and dedupe duplicate failure warnings in outbound replies..
- Agents/Process/Bootstrap: preserve unbounded `process log` offset-only pagination (default tail applies only when both `offset` and `limit` are omitted) and enforce strict `bootstrapTotalMaxChars` budgeting across injected bootstrap content (including markers), skipping additional injection when remaining budget is too small..
- Agents/Workspace: persist bootstrap onboarding state so partially initialized workspaces recover missing `BOOTSTRAP.md` once, while completed onboarding keeps BOOTSTRAP deleted even if runtime files are later recreated..
- Agents/Workspace: create `BOOTSTRAP.md` when core workspace files are seeded in partially initialized workspaces, while keeping BOOTSTRAP one-shot after onboarding deletion..
- Agents: classify external timeout aborts during compaction the same as internal timeouts, preventing unnecessary auth-profile rotation and preserving compaction-timeout snapshot fallback behavior..
- Agents: treat empty-stream provider failures (`request ended without sending any chunks`) as timeout-class failover signals, enabling auth-profile rotation/fallback and showing a friendly timeout message instead of raw provider errors..
- Agents: treat `read` tool `file_path` arguments as valid in tool-start diagnostics to avoid false "read tool called without path" warnings when alias parameters are used..
- Agents/Transcript: drop malformed tool-call blocks with blank required fields (`id`/`name` or missing `input`/`arguments`) during session transcript repair to prevent persistent tool-call corruption on future turns..
- Tools/Write/Edit: normalize structured text-block arguments for `content`/`oldText`/`newText` before filesystem edits, preventing JSON-like file corruption and false "exact text not found" misses from block-form params..
- Ollama/Agents: avoid forcing `<final>` tag enforcement for Ollama models, which could suppress all output as `(no output)`..
- Plugins: suppress false duplicate plugin id warnings when the same extension is discovered via multiple paths (config/workspace/global vs bundled), while still warning on genuine duplicates..
- Agents/Process: supervise PTY/child process lifecycles with explicit ownership, cancellation, timeouts, and deterministic cleanup, preventing Codex/Pi PTY sessions from dying or stalling on resume..
- Skills: watch `SKILL.md` only when refreshing skills snapshot to avoid file-descriptor exhaustion in large data trees..
- Memory/QMD: make `memory status` read-only by skipping QMD boot update/embed side effects for status-only manager checks.
- Memory/QMD: keep original QMD failures when builtin fallback initialization fails (for example missing embedding API keys), instead of replacing them with fallback init errors.
- Memory/Builtin: keep `memory status` dirty reporting stable across invocations by deriving status-only manager dirty state from persisted index metadata instead of process-start defaults..
- Memory/QMD: cap QMD command output buffering to prevent memory exhaustion from pathological `qmd` command output.
- Memory/QMD: parse qmd scope keys once per request to avoid repeated parsing in scope checks.
- Memory/QMD: query QMD index using exact docid matches before falling back to prefix lookup for better recall correctness and index efficiency.
- Memory/QMD: pass result limits to `search`/`vsearch` commands so QMD can cap results earlier.
- Memory/QMD: avoid reading full markdown files when a `from/lines` window is requested in QMD reads.
- Memory/QMD: skip rewriting unchanged session export markdown files during sync to reduce disk churn.
- Memory/QMD: make QMD result JSON parsing resilient to noisy command output by extracting the first JSON array from noisy `stdout`.
- Memory/QMD: treat prefixed `no results found` marker output as an empty result set in qmd JSON parsing..
- Memory/QMD: avoid multi-collection `query` ranking corruption by running one `qmd query -c <collection>` per managed collection and merging by best score (also used for `search`/`vsearch` fallback-to-query)..
- Memory/QMD: rebind managed collections when existing collection metadata drifts (including sessions name-only listings), preventing non-default agents from reusing another agent's `sessions` collection path..
- Memory/QMD: make `kibo memory index` verify and print the active QMD index file path/size, and fail when QMD leaves a missing or zero-byte index artifact after an update..
- Memory/QMD: detect null-byte `ENOTDIR` update failures, rebuild managed collections once, and retry update to self-heal corrupted collection metadata..
- Memory/QMD/Security: add `rawKeyPrefix` support for QMD scope rules and preserve legacy `keyPrefix: "agent:..."` matching, preventing scoped deny bypass when operators match agent-prefixed session keys.
- Memory/Builtin: narrow memory watcher targets to markdown globs and ignore dependency/venv directories to reduce file-descriptor pressure during memory sync startup..
- Security/Memory-LanceDB: treat recalled memories as untrusted context (escape injected memory text + explicit non-instruction framing), skip likely prompt-injection payloads during auto-capture, and restrict auto-capture to user messages to reduce memory-poisoning risk..
- Security/Memory-LanceDB: require explicit `autoCapture: true` opt-in (default is now disabled) to prevent automatic PII capture unless operators intentionally enable it..
- Diagnostics/Memory: prune stale diagnostic session state entries and cap tracked session states to prevent unbounded in-memory growth on long-running gateways. and.
- Gateway/Memory: clean up `agentRunSeq` tracking on run completion/abort and enforce maintenance-time cap pruning to prevent unbounded sequence-map growth over long uptimes. and.
- Auto-reply/Memory: bound `ABORT_MEMORY` growth by evicting oldest entries and deleting reset (`false`) flags so abort state tracking cannot grow unbounded over long uptimes. and.
- Slack/Memory: bound thread-starter cache growth with TTL + max-size pruning to prevent long-running Slack gateways from accumulating unbounded thread cache state. and.
- Outbound/Memory: bound directory cache growth with max-size eviction and proactive TTL pruning to prevent long-running gateways from accumulating unbounded directory entries. and.
- Skills/Memory: remove disconnected nodes from remote-skills cache to prevent stale node metadata from accumulating over long uptimes..
- Sandbox/Tools: make sandbox file tools bind-mount aware (including absolute container paths) and enforce read-only bind semantics for writes..
- Sandbox/Prompts: show the sandbox container workdir as the prompt working directory and clarify host-path usage for file tools, preventing host-path `exec` failures in sandbox sessions..
- Media/Security: allow local media reads from Kibo state `workspace/` and `sandboxes/` roots by default so generated workspace media can be delivered without unsafe global path bypasses..
- Media/Security: harden local media allowlist bypasses by requiring an explicit `readFile` override when callers mark paths as validated, and reject filesystem-root `localRoots` entries.
- Media/Security: allow outbound local media reads from the active agent workspace (including `workspace-<agentId>`) via agent-scoped local roots, avoiding broad global allowlisting of all per-agent workspaces..
- Outbound/Media: thread explicit `agentId` through core `sendMessage` direct-delivery path so agent-scoped local media roots apply even when mirror metadata is absent..
- Discord/Security: harden voice message media loading (SSRF + allowed-local-root checks) so tool-supplied paths/URLs cannot be used to probe internal URLs or read arbitrary local files.
- Security/BlueBubbles: require explicit `mediaLocalRoots` allowlists for local outbound media path reads to prevent local file disclosure..
- Security/BlueBubbles: reject ambiguous shared-path webhook routing when multiple webhook targets match the same guid/password.
- Security/BlueBubbles: harden BlueBubbles webhook auth behind reverse proxies by only accepting passwordless webhooks for direct localhost loopback requests (forwarded/proxied requests now require a password)..
- Feishu/Security: harden media URL fetching against SSRF and local file disclosure..
- Security/Zalo: reject ambiguous shared-path webhook routing when multiple webhook targets match the same secret.
- Security/Nostr: require loopback source and block cross-origin profile mutation/import attempts..
- Security/Signal: harden signal-cli archive extraction during install to prevent path traversal outside the install root.
- Security/Hooks: restrict hook transform modules to `~/.kibo/hooks/transforms` (prevents path traversal/escape module loads via config). Config note: `hooks.transformsDir` must now be within that directory..
- Security/Hooks: ignore hook package manifest entries that point outside the package directory (prevents out-of-tree handler loads during hook discovery).
- Security/Archive: enforce archive extraction entry/size limits to prevent resource exhaustion from high-expansion ZIP/TAR archives..
- Security/Media: reject oversized base64-backed input media before decoding to avoid large allocations..
- Security/Media: stream and bound URL-backed input media fetches to prevent memory exhaustion from oversized responses..
- Security/Skills: harden archive extraction for download-installed skills to prevent path traversal outside the target directory..
- Security/Slack: compute command authorization for DM slash commands even when `dmPolicy=open`, preventing unauthorized users from running privileged commands via DM..
- Security/Pairing: scope pairing allowlist writes/reads to channel accounts (for example `telegram:yy`), and propagate account-aware pairing approvals so multi-account channels do not share a single per-channel pairing allowFrom store..
- Security/iMessage: keep DM pairing-store identities out of group allowlist authorization (prevents cross-context command authorization)..
- Security/Google Chat: deprecate `users/<email>` allowlists (treat `users/...` as immutable user id only); keep raw email allowlists for usability..
- Security/Google Chat: reject ambiguous shared-path webhook routing when multiple webhook targets verify successfully (prevents cross-account policy-context misrouting)..
- Telegram/Security: require numeric Telegram sender IDs for allowlist authorization (reject `@username` principals), auto-resolve `@username` to IDs in `kibo doctor --fix` (when possible), and warn in `kibo security audit` when legacy configs contain usernames..
- Telegram/Security: reject Telegram webhook startup when `webhookSecret` is missing or empty (prevents unauthenticated webhook request forgery)..
- Security/Windows: avoid shell invocation when spawning child processes to prevent cmd.exe metacharacter injection via untrusted CLI arguments (e.g. agent prompt text).
- Telegram: set webhook callback timeout handling to `onTimeout: "return"` (10s) so long-running update processing no longer emits webhook 500s and retry storms..
- Signal: preserve case-sensitive `group:` target IDs during normalization so mixed-case group IDs no longer fail with `Group not found`..
- Security/Agents: scope CLI process cleanup to owned child PIDs to avoid killing unrelated processes on shared hosts..
- Security/Agents: enforce workspace-root path bounds for `apply_patch` in non-sandbox mode to block traversal and symlink escape writes..
- Security/Agents: enforce symlink-escape checks for `apply_patch` delete hunks under `workspaceOnly`, while still allowing deleting the symlink itself..
- Security/Agents (macOS): prevent shell injection when writing Claude CLI keychain credentials..
- macOS: hard-limit unkeyed `kibo://agent` deep links and ignore `deliver` / `to` / `channel` unless a valid unattended key is provided..
- Scripts/Security: validate GitHub logins and avoid shell invocation in `scripts/update-clawtributors.ts` to prevent command injection via malicious commit records..
- Security: fix Chutes manual OAuth login state validation by requiring the full redirect URL (reject code-only pastes) (thanks).
- Security/Gateway: harden tool-supplied `gatewayUrl` overrides by restricting them to loopback or the configured `gateway.remote.url`..
- Security/Gateway: block `system.execApprovals.*` via `node.invoke` (use `exec.approvals.node.*` instead)..
- Security/Gateway: reject oversized base64 chat attachments before decoding to avoid large allocations..
- Security/Gateway: stop returning raw resolved config values in `skills.status` requirement checks (prevents operator.read clients from reading secrets)..
- Security/Net: fix SSRF guard bypass via full-form IPv4-mapped IPv6 literals (blocks loopback/private/metadata access)..
- Security/Browser: harden browser control file upload + download helpers to prevent path traversal / local file disclosure..
- Security/Browser: block cross-origin mutating requests to loopback browser control routes (CSRF hardening)..
- Security/Node Host: enforce `system.run` rawCommand/argv consistency to prevent allowlist/approval bypass..
- Security/Exec approvals: prevent safeBins allowlist bypass via shell expansion (host exec allowlist mode only; not enabled by default)..
- Security/Exec: harden PATH handling by disabling project-local `node_modules/.bin` bootstrapping by default, disallowing node-host `PATH` overrides, and spawning ACP servers via the current executable by default..
- Security/Tlon: harden Urbit URL fetching against SSRF by blocking private/internal hosts by default (opt-in: `channels.tlon.allowPrivateNetwork`)..
- Security/Voice Call (Telnyx): require webhook signature verification when receiving inbound events; configs without `telnyx.publicKey` are now rejected unless `skipSignatureVerification` is enabled..
- Security/Voice Call: require valid Twilio webhook signatures even when ngrok free tier loopback compatibility mode is enabled..
- Security/Discovery: stop treating Bonjour TXT records as authoritative routing (prefer resolved service endpoints) and prevent discovery from overriding stored TLS pins; autoconnect now requires a previously trusted gateway..

## 2026.2.13

### Changes

- Install: add optional Podman-based setup: `setup-podman.sh` for one-time host setup (kibo user, image, launch script, systemd quadlet), `run-kibo-podman.sh launch` / `launch setup`; systemd Quadlet unit for kibo user service; docs for rootless container, kibo user (subuid/subgid), and quadlet (troubleshooting)..
- Discord: send voice messages with waveform previews from local audio files (including silent delivery)..
- Discord: add configurable presence status/activity/type/url (custom status defaults to activity text)..
- Slack/Plugins: add thread-ownership outbound gating via `message_sending` hooks, including bypass tracking and Slack outbound hook wiring for cancel/modify behavior..
- Agents: add synthetic catalog support for `hf:zai-org/GLM-5`..
- Skills: remove duplicate `local-places` Google Places skill/proxy and keep `goplaces` as the single supported Google Places path.
- Agents: add pre-prompt context diagnostics (`messages`, `systemPromptChars`, `promptChars`, provider/model, session file) before embedded runner prompt calls to improve overflow debugging..
- Onboarding/Providers: add first-class Hugging Face Inference provider support (provider wiring, onboarding auth choice/API key flow, and default-model selection), and preserve Hugging Face auth intent in auth-choice remapping (`tokenProvider=huggingface` with `authChoice=apiKey`) while skipping env-override prompts when an explicit token is provided..
- Onboarding/Providers: add `minimax-api-key-cn` auth choice for the MiniMax China API endpoint..

### Fixes

- Gateway/Auth: add trusted-proxy mode hardening follow-ups by keeping `KIBO_GATEWAY_*` env compatibility, auto-normalizing invalid setup combinations in interactive `gateway configure` (trusted-proxy forces `bind=lan` and disables Tailscale serve/funnel), and suppressing shared-secret/rate-limit audit findings that do not apply to trusted-proxy deployments..
- Docs/Hooks: update hooks documentation URLs to the new `/automation/hooks` location..
- Security/Audit: warn when `gateway.tools.allow` re-enables default-denied tools over HTTP `POST /tools/invoke`, since this can increase RCE blast radius if the gateway is reachable.
- Security/Plugins/Hooks: harden npm-based installs by restricting specs to registry packages only, passing `--ignore-scripts` to `npm pack`, and cleaning up temp install directories.
- Security/Sessions: preserve inter-session input provenance for routed prompts so delegated/internal sessions are not treated as direct external user instructions..
- Feishu: stop persistent Typing reaction on NO_REPLY/suppressed runs by wiring reply-dispatcher cleanup to remove typing indicators..
- Agents: strip leading empty lines from `sanitizeUserFacingText` output and normalize whitespace-only outputs to empty text..
- BlueBubbles: gracefully degrade when Private API is disabled by filtering private-only actions, skipping private-only reactions/reply effects, and avoiding private reply markers so non-private flows remain usable..
- Outbound: add a write-ahead delivery queue with crash-recovery retries to prevent lost outbound messages after gateway restarts..
- Auto-reply/Threading: auto-inject implicit reply threading so `replyToMode` works without requiring model-emitted `[[reply_to_current]]`, while preserving `replyToMode: "off"` behavior for implicit Slack replies and keeping block-streaming chunk coalescing stable under `replyToMode: "first"`..
- Auto-reply/Threading: honor explicit `[[reply_to_*]]` tags even when `replyToMode` is `off`..
- Plugins/Threading: rename `allowTagsWhenOff` to `allowExplicitReplyTagsWhenOff` and keep the old key as a deprecated alias for compatibility.
- Outbound/Threading: pass `replyTo` and `threadId` from `message send` tool actions through the core outbound send path to channel adapters, preserving thread/reply routing..
- Auto-reply/Media: allow image-only inbound messages (no caption) to reach the agent instead of short-circuiting as empty text, and preserve thread context in queued/followup prompt bodies for media-only runs..
- Discord: route autoThread replies to existing threads instead of the root channel..
- Web UI: add `img` to DOMPurify allowed tags and `src`/`alt` to allowed attributes so markdown images render in webchat instead of being stripped..
- Telegram/Matrix: treat MP3 and M4A (including `audio/mp4`) as voice-compatible for `asVoice` routing, and keep WAV/AAC falling back to regular audio sends..
- WhatsApp: preserve outbound document filenames for web-session document sends instead of always sending `"file"`..
- Telegram: cap bot menu registration to Telegram's 100-command limit with an overflow warning while keeping typed hidden commands available..
- Telegram: scope skill commands to the resolved agent for default accounts so `setMyCommands` no longer triggers `BOT_COMMANDS_TOO_MUCH` when multiple agents are configured.
- Discord: avoid misrouting numeric guild allowlist entries to `/channels/<guildId>` by prefixing guild-only inputs with `guild:` during resolution..
- Memory/QMD: default `memory.qmd.searchMode` to `search` for faster CPU-only recall and always scope `search`/`vsearch` requests to managed collections (auto-falling back to `query` when required)..
- Memory/LanceDB: add configurable `captureMaxChars` for auto-capture while keeping the legacy 500-char default..
- MS Teams: preserve parsed mention entities/text when appending OneDrive fallback file links, and accept broader real-world Teams mention ID formats (`29:...`, `8:orgid:...`) while still rejecting placeholder patterns..
- Media: classify `text/*` MIME types as documents in media-kind routing so text attachments are no longer treated as unknown..
- Inbound/Web UI: preserve literal `\n` sequences when normalizing inbound text so Windows paths like `C:\\Work\\nxxx\\README.md` are not corrupted..
- TUI/Streaming: preserve richer streamed assistant text when final payload drops pre-tool-call text blocks, while keeping non-empty final payload authoritative for plain-text updates..
- Providers/MiniMax: switch implicit MiniMax API-key provider from `openai-completions` to `anthropic-messages` with the correct Anthropic-compatible base URL, fixing `invalid role: developer (2013)` errors on MiniMax M2.5..
- Ollama/Agents: use resolved model/provider base URLs for native `/api/chat` streaming (including aliased providers), normalize `/v1` endpoints, and forward abort + `maxTokens` stream options for reliable cancellation and token caps..
- OpenAI Codex/Spark: implement end-to-end `gpt-5.3-codex-spark` support across fallback/thinking/model resolution and `models list` forward-compat visibility. (#14990, #15174).
- Agents/Codex: allow `gpt-5.3-codex-spark` in forward-compat fallback, live model filtering, and thinking presets, and fix model-picker recognition for spark..
- Models/Codex: resolve configured `openai-codex/gpt-5.3-codex-spark` through forward-compat fallback during `models list`, so it is not incorrectly tagged as missing when runtime resolution succeeds..
- OpenAI Codex/Auth: bridge Kibo OAuth profiles into `pi` `auth.json` so model discovery and models-list registry resolution can use Codex OAuth credentials..
- Auth/OpenAI Codex: share OAuth login handling across onboarding and `models auth login --provider openai-codex`, keep onboarding alive when OAuth fails, and surface a direct OAuth help note instead of terminating the wizard. (#15406, follow-up to #14552).
- Onboarding/Providers: add vLLM as an onboarding provider with model discovery, auth profile wiring, and non-interactive auth-choice validation..
- Onboarding/CLI: restore terminal state without resuming paused `stdin`, so onboarding exits cleanly (including Docker TTY installs that would otherwise hang)..
- Signal/Install: auto-install `signal-cli` via Homebrew on non-x64 Linux architectures, avoiding x86_64 native binary `Exec format error` failures on arm64/arm hosts..
- macOS Voice Wake: fix a crash in trigger trimming for CJK/Unicode transcripts by matching and slicing on original-string ranges instead of transformed-string indices..
- Mattermost (plugin): retry websocket monitor connections with exponential backoff and abort-aware teardown so transient connect failures no longer permanently stop monitoring..
- Discord/Agents: apply channel/group `historyLimit` during embedded-runner history compaction to prevent long-running channel sessions from bypassing truncation and overflowing context windows..
- Outbound targets: fail closed for WhatsApp/Twitch/Google Chat fallback paths so invalid or missing targets are dropped instead of rerouted, and align resolver hints with strict target requirements..
- Gateway/Restart: clear stale command-queue and heartbeat wake runtime state after SIGUSR1 in-process restarts to prevent zombie gateway behavior where queued work stops draining..
- Heartbeat: prevent scheduler silent-death races during runner reloads, preserve retry cooldown backoff under wake bursts, and prioritize user/action wake causes over interval/retry reasons when coalescing..
- Heartbeat: allow explicit wake (`wake`) and hook wake (`hook:*`) reasons to run even when `HEARTBEAT.md` is effectively empty so queued system events are processed..
- Auto-reply/Heartbeat: strip sentence-ending `HEARTBEAT_OK` tokens even when followed by up to 4 punctuation characters, while preserving surrounding sentence punctuation..
- Sessions/Agents: pass `agentId` when resolving existing transcript paths in reply runs so non-default agents and heartbeat/chat handlers no longer fail with `Session file path must be within sessions directory`..
- Sessions/Agents: pass `agentId` through status and usage transcript-resolution paths (auto-reply, gateway usage APIs, and session cost/log loaders) so non-default agents can resolve absolute session files without path-validation failures..
- Sessions: archive previous transcript files on `/new` and `/reset` session resets (including gateway `sessions.reset`) so stale transcripts do not accumulate on disk..
- Status/Sessions: stop clamping derived `totalTokens` to context-window size, keep prompt-token snapshots wired through session accounting, and surface context usage as unknown when fresh snapshot data is missing to avoid false 100% reports..
- Gateway/Routing: speed up hot paths for session listing (derived titles + previews), WS broadcast, and binding resolution.
- Gateway/Sessions: cache derived title + last-message transcript reads to speed up repeated sessions list refreshes.
- CLI/Completion: route plugin-load logs to stderr and write generated completion scripts directly to stdout to avoid `source <(kibo completion ...)` corruption..
- CLI: lazily load outbound provider dependencies and remove forced success-path exits so commands terminate naturally without killing intentional long-running foreground actions..
- CLI: speed up startup by lazily registering core commands (keeps rich `--help` while reducing cold-start overhead).
- Security/Gateway + ACP: block high-risk tools (`sessions_spawn`, `sessions_send`, `gateway`, `whatsapp_login`) from HTTP `/tools/invoke` by default with `gateway.tools.{allow,deny}` overrides, and harden ACP permission selection to fail closed when tool identity/options are ambiguous while supporting `allow_always`/`reject_always`..
- Security/ACP: prompt for non-read/search permission requests in ACP clients (reduces silent tool approval risk)..
- Security/Gateway: breaking default-behavior change - canvas IP-based auth fallback now only accepts machine-scoped addresses (RFC1918, link-local, ULA IPv6, CGNAT); public-source IP matches now require bearer token auth..
- Security/Link understanding: block loopback/internal host patterns and private/mapped IPv6 addresses in extracted URL handling to close SSRF bypasses in link CLI flows..
- Security/Browser: constrain `POST /trace/stop`, `POST /wait/download`, and `POST /download` output paths to Kibo temp roots and reject traversal/escape paths.
- Security/Browser: sanitize download `suggestedFilename` to keep implicit `wait/download` paths within the downloads root..
- Security/Browser: confine `POST /hooks/file-chooser` upload paths to an Kibo temp uploads root and reject traversal/escape paths..
- Security/Browser: require auth for the sandbox browser bridge server (protects `/profiles`, `/tabs`, CDP URLs, and other control endpoints)..
- Security: bind local helper servers to loopback and fail closed on non-loopback OAuth callback hosts (reduces localhost/LAN attack surface).
- Security/Canvas: serve A2UI assets via the shared safe-open path (`openFileWithinRoot`) to close traversal/TOCTOU gaps, with traversal and symlink regression coverage..
- Security/WhatsApp: enforce `0o600` on `creds.json` and `creds.json.bak` on save/backup/restore paths to reduce credential file exposure..
- Security/Gateway: sanitize and truncate untrusted WebSocket header values in pre-handshake close logs to reduce log-poisoning risk..
- Security/Audit: add misconfiguration checks for sandbox Docker config with sandbox mode off, ineffective `gateway.nodes.denyCommands` entries, global minimal tool-profile overrides by agent profiles, and permissive extension-plugin tool reachability.
- Security/Audit: distinguish external webhooks (`hooks.enabled`) from internal hooks (`hooks.internal.enabled`) in attack-surface summaries to avoid false exposure signals when only internal hooks are enabled..
- Security/Onboarding: clarify multi-user DM isolation remediation with explicit `kibo config set session.dmScope ...` commands in security audit, doctor security, and channel onboarding guidance..
- Security/Gateway: bind node `system.run` approval overrides to gateway exec-approval records (runId-bound), preventing approval-bypass via `node.invoke` param injection..
- Agents/Nodes: harden node exec approval decision handling in the `nodes` tool run path by failing closed on unexpected approval decisions, and add regression coverage for approval-required retry/deny/timeout flows..
- Android/Nodes: harden `app.update` by requiring HTTPS and gateway-host URL matching plus SHA-256 verification, stream URL camera downloads to disk with size guards to avoid memory spikes, and stop signing release builds with debug keys..
- Routing: enforce strict binding-scope matching across peer/guild/team/roles so peer-scoped Discord/Slack bindings no longer match unrelated guild/team contexts or fallback tiers..
- Exec/Allowlist: allow multiline heredoc bodies (`<<`, `<<-`) while keeping multiline non-heredoc shell commands blocked, so exec approval parsing permits heredoc input safely without allowing general newline command chaining..
- Config: preserve `${VAR}` env references when writing config files so `kibo config set/apply/patch` does not persist secrets to disk..
- Config: remove a cross-request env-snapshot race in config writes by carrying read-time env context into write calls per request, preserving `${VAR}` refs safely under concurrent gateway config mutations..
- Config: log overwrite audit entries (path, backup target, and hash transition) whenever an existing config file is replaced, improving traceability for unexpected config clobbers.
- Config: keep legacy audio transcription migration strict by rejecting non-string/unsafe command tokens while still migrating valid custom script executables..
- Config: accept `$schema` key in config file so JSON Schema editor tooling works without validation errors.
- Gateway/Tools Invoke: sanitize `/tools/invoke` execution failures while preserving `400` for tool input errors and returning `500` for unexpected runtime failures, with regression coverage and docs updates..
- Gateway/Hooks: preserve `408` for hook request-body timeout responses while keeping bounded auth-failure cache eviction behavior, with timeout-status regression coverage..
- Plugins/Hooks: fire `before_tool_call` hook exactly once per tool invocation in embedded runs by removing duplicate dispatch paths while preserving parameter mutation semantics..
- Agents/Transcript policy: sanitize OpenAI/Codex tool-call ids during transcript policy normalization to prevent invalid tool-call identifiers from propagating into session history..
- Agents/Image tool: cap image-analysis completion `maxTokens` by model capability (`min(4096, model.maxTokens)`) to avoid over-limit provider failures while still preventing truncation..
- Agents/Compaction: centralize exec default resolution in the shared tool factory so per-agent `tools.exec` overrides (host/security/ask/node and related defaults) persist across compaction retries..
- Gateway/Agents: stop injecting a phantom `main` agent into gateway agent listings when `agents.list` explicitly excludes it..
- Process/Exec: avoid shell execution for `.exe` commands on Windows so env overrides work reliably in `runCommandWithTimeout`..
- Daemon/Windows: preserve literal backslashes in `gateway.cmd` command parsing so drive and UNC paths are not corrupted in runtime checks and doctor entrypoint comparisons..
- Sandbox: pass configured `sandbox.docker.env` variables to sandbox containers at `docker create` time..
- Voice Call: route webhook runtime event handling through shared manager event logic so rejected inbound hangups are idempotent in production, with regression tests for duplicate reject events and provider-call-ID remapping parity..
- Cron: add regression coverage for announce-mode isolated jobs so runs that already report `delivered: true` do not enqueue duplicate main-session relays, including delivery configs where `mode` is omitted and defaults to announce..
- Cron: honor `deleteAfterRun` in isolated announce delivery by mapping it to subagent announce cleanup mode, so cron run sessions configured for deletion are removed after completion..
- Web tools/web_fetch: prefer `text/markdown` responses for Cloudflare Markdown for Agents, add `cf-markdown` extraction for markdown bodies, and redact fetched URLs in `x-markdown-tokens` debug logs to avoid leaking raw paths/query params..
- Tools/web_search: support `freshness` for the Perplexity provider by mapping `pd`/`pw`/`pm`/`py` to Perplexity `search_recency_filter` values and including freshness in the Perplexity cache key..
- Kiboock: avoid Zsh readonly variable collisions in helper scripts..
- Memory: switch default local embedding model to the QAT `embeddinggemma-300m-qat-Q8_0` variant for better quality at the same footprint..
- Docs/Discord: expand quick setup and clarify guild workspace guidance..
- Docs/Mermaid: remove hardcoded Mermaid init theme blocks from four docs diagrams so dark mode inherits readable theme defaults..
- Security/Pairing: generate 256-bit base64url device and node pairing tokens and use byte-safe constant-time verification to avoid token-compare edge-case failures..

### Breaking

- Config/State: removed legacy `.moltbot` auto-detection/migration and `moltbot.json` config candidates. If you still have state/config under `~/.moltbot`, move it to `~/.kibo` (recommended) or set `KIBO_STATE_DIR` / `KIBO_CONFIG_PATH` explicitly.

## 2026.2.12

### Changes

- CLI/Plugins: add `kibo plugins uninstall <id>` with `--dry-run`, `--force`, and `--keep-files` options, including safe uninstall path handling and plugin uninstall docs..
- CLI: add `kibo logs --local-time` to display log timestamps in local timezone..
- Telegram: render blockquotes as native `<blockquote>` tags instead of stripping them.
- Telegram: expose `/compact` in the native command menu..
- Discord: add role-based allowlists and role-based agent routing..
- Config: avoid redacting `maxTokens`-like fields during config snapshot redaction, preventing round-trip validation failures in `/config`..

### Fixes

- Gateway/OpenResponses: harden URL-based `input_file`/`input_image` handling with explicit SSRF deny policy, hostname allowlists (`files.urlAllowlist` / `images.urlAllowlist`), per-request URL input caps (`maxUrlParts`), blocked-fetch audit logging, and regression coverage/docs updates.
- Sessions: guard `withSessionStoreLock` against undefined `storePath` to prevent `path.dirname` crash.
- Security: fix unauthenticated Nostr profile API remote config tampering..
- Security: remove bundled soul-evil hook..
- Security/Audit: add hook session-routing hardening checks (`hooks.defaultSessionKey`, `hooks.allowRequestSessionKey`, and prefix allowlists), and warn when HTTP API endpoints allow explicit session-key routing.
- Security/Sandbox: confine mirrored skill sync destinations to the sandbox `skills/` root and stop using frontmatter-controlled skill names as filesystem destination paths..
- Security/Web tools: treat browser/web content as untrusted by default (wrapped outputs for browser snapshot/tabs/console and structured external-content metadata for web tools), and strip `toolResult.details` from model-facing transcript/compaction inputs to reduce prompt-injection replay risk.
- Security/Hooks: harden webhook and device token verification with shared constant-time secret comparison, and add per-client auth-failure throttling for hook endpoints (`429` + `Retry-After`)..
- Security/Browser: require auth for loopback browser control HTTP routes, auto-generate `gateway.auth.token` when browser control starts without auth, and add a security-audit check for unauthenticated browser control..
- Sessions/Gateway: harden transcript path resolution and reject unsafe session IDs/file paths so session operations stay within agent sessions directories..
- Sessions: preserve `verboseLevel`, `thinkingLevel`/`reasoningLevel`, and `ttsAuto` overrides across `/new` and `/reset` session resets..
- Gateway: raise WS payload/buffer limits so 5,000,000-byte image attachments work reliably..
- Logging/CLI: use local timezone timestamps for console prefixing, and include `±HH:MM` offsets when using `kibo logs --local-time` to avoid ambiguity..
- Gateway: drain active turns before restart to prevent message loss..
- Gateway: auto-generate auth token during install to prevent launchd restart loops..
- Gateway: prevent `undefined`/missing token in auth config..
- Configure/Gateway: reject literal `"undefined"`/`"null"` token input and validate gateway password prompt values to avoid invalid password-mode configs..
- Gateway: handle async `EPIPE` on stdout/stderr during shutdown..
- Gateway/Control UI: resolve missing dashboard assets when `kibo` is installed globally via symlink-based Node managers (nvm/fnm/n/Homebrew)..
- Gateway/Control UI: keep partial assistant output visible when runs are aborted, and persist aborted partials to session transcripts for follow-up context.
- Cron: use requested `agentId` for isolated job auth resolution..
- Cron: prevent cron jobs from skipping execution when `nextRunAtMs` advances..
- Cron: pass `agentId` to `runHeartbeatOnce` for main-session jobs..
- Cron: re-arm timers when `onTimer` fires while a job is still executing..
- Cron: prevent duplicate fires when multiple jobs trigger simultaneously..
- Cron: prevent duplicate announce-mode isolated cron deliveries, and keep main-session fallback active when best-effort structured delivery attempts fail to send any message..
- Cron: isolate scheduler errors so one bad job does not break all jobs..
- Cron: prevent one-shot `at` jobs from re-firing on restart after skipped/errored runs..
- Heartbeat: prevent scheduler stalls on unexpected run errors and avoid immediate rerun loops after `requests-in-flight` skips..
- Cron: honor stored session model overrides for isolated-agent runs while preserving `hooks.gmail.model` precedence for Gmail hook sessions..
- Logging/Browser: fall back to `os.tmpdir()/kibo` for default log, browser trace, and browser download temp paths when `/tmp/kibo` is unavailable.
- WhatsApp: convert Markdown bold/strikethrough to WhatsApp formatting..
- WhatsApp: allow media-only sends and normalize leading blank payloads..
- WhatsApp: default MIME type for voice messages when Baileys omits it..
- Telegram: handle no-text message in model picker editMessageText..
- Telegram: surface REACTION_INVALID as non-fatal warning..
- BlueBubbles: fix webhook auth bypass via loopback proxy trust..
- Slack: change default replyToMode from "off" to "all"..
- Slack: honor `limit` for `emoji-list` actions across core and extension adapters, with capped emoji-list responses in the Slack action handler..
- Slack: detect control commands when channel messages start with bot mention prefixes (for example, `@Bot /new`)..
- Slack: include thread reply metadata in inbound message footer context (`thread_ts`, `parent_user_id`) while keeping top-level `thread_ts == ts` events unthreaded..
- Signal: enforce E.164 validation for the Signal bot account prompt so mistyped numbers are caught early..
- Discord: process DM reactions instead of silently dropping them..
- Discord: treat Administrator as full permissions in channel permission checks..
- Discord: respect replyToMode in threads..
- Discord: add optional gateway proxy support for WebSocket connections via `channels.discord.proxy`..
- Browser: add Chrome launch flag `--disable-blink-features=AutomationControlled` to reduce `navigator.webdriver` automation detection issues on reCAPTCHA-protected sites..
- Heartbeat: filter noise-only system events so scheduled reminder notifications do not fire when cron runs carry only heartbeat markers..
- Signal: render mention placeholders as `@uuid`/`@phone` so mention gating and Kibobot targeting work..
- Agents/Reminders: guard reminder promises by appending a note when no `cron.add` succeeded in the turn, so users know nothing was scheduled..
- Discord: omit empty content fields for media-only messages while preserving caption whitespace..
- Onboarding/Providers: add Z.AI endpoint-specific auth choices (`zai-coding-global`, `zai-coding-cn`, `zai-global`, `zai-cn`) and expand default Z.AI model wiring..
- Onboarding/Providers: update MiniMax API default/recommended models from M2.1 to M2.5, add M2.5/M2.5-Lightning model entries, and include `minimax-m2.5` in modern model filtering..
- Ollama: use configured `models.providers.ollama.baseUrl` for model discovery and normalize `/v1` endpoints to the native Ollama API root..
- Voice Call: pass Twilio stream auth token via `<Parameter>` instead of query string..
- Config/Models: allow full `models.providers.*.models[*].compat` keys used by `openai-completions` (`thinkingFormat`, `supportsStrictMode`, and streaming/tool-result compatibility flags) so valid provider overrides no longer fail strict config validation..
- Feishu: pass `Buffer` directly to the Feishu SDK upload APIs instead of `Readable.from(...)` to avoid form-data upload failures..
- Feishu: trigger mention-gated group handling only when the bot itself is mentioned (not just any mention)..
- Feishu: probe status uses the resolved account context for multi-account credential checks..
- Feishu: add streaming card replies via Card Kit API and preserve `renderMode=auto` fallback behavior for plain-text responses..
- Feishu DocX: preserve top-level converted block order using `firstLevelBlockIds` when writing/appending documents..
- Feishu plugin packaging: remove `workspace:*` `kibo` dependency from the Feishu plugin package and sync lockfile for install compatibility..
- CLI/Wizard: exit with code 1 when `configure`, `agents add`, or interactive `onboard` wizards are canceled, so `set -e` automation stops correctly..
- Media: strip `MEDIA:` lines with local paths instead of leaking as visible text..
- Config/Cron: exclude `maxTokens` from config redaction and honor `deleteAfterRun` on skipped cron jobs..
- Config: ignore `meta` field changes in config file watcher..
- Daemon: suppress `EPIPE` error when restarting LaunchAgent..
- Antigravity: add opus 4.6 forward-compat model and bypass thinking signature sanitization..
- Agents: prevent file descriptor leaks in child process cleanup..
- Agents: prevent double compaction caused by cache TTL bypassing guard..
- Agents: use last API call's cache tokens for context display instead of accumulated sum..
- Agents: keep followup-runner session `totalTokens` aligned with post-compaction context by using last-call usage and shared token-accounting logic..
- Hooks/Plugins: wire 9 previously unwired plugin lifecycle hooks into core runtime paths (session, compaction, gateway, and outbound message hooks)..
- Hooks/Tools: dispatch `before_tool_call` and `after_tool_call` hooks from both tool execution paths with rebased conflict fixes..
- Hooks: replace loader `console.*` output with subsystem logger messages so hook loading errors/warnings route through standard logging..
- Discord: allow channel-edit to archive/lock threads and set auto-archive duration..
- Discord tests: use a partial/carbon mock in slash command coverage..
- Tests: update thread ID handling in Slack message collection tests..
- Update/Daemon: fix post-update restart compatibility by generating `dist/cli/daemon-cli.js` with alias-aware exports from hashed daemon bundles, preventing `registerDaemonCli` import failures during `kibo update`.

### Breaking

- Hooks: `POST /hooks/agent` now rejects payload `sessionKey` overrides by default. To keep fixed hook context, set `hooks.defaultSessionKey` (recommended with `hooks.allowedSessionKeyPrefixes: ["hook:"]`). If you need legacy behavior, explicitly set `hooks.allowRequestSessionKey: true`. for reporting.

## 2026.2.9

### Added

- Commands: add `commands.allowFrom` config for separate command authorization, allowing operators to restrict slash commands to specific users while keeping chat open to others..
- Docker: add ClawDock shell helpers for Docker workflows..
- Gateway: periodic channel health monitor auto-restarts stuck, crashed, or silently-stopped channels. Configurable via `gateway.channelHealthCheckMinutes` (default: 5, set to 0 to disable). (#7053, #4302)
- iOS: alpha node app + setup-code onboarding..
- Channels: comprehensive BlueBubbles and channel cleanup..
- Channels: IRC first-class channel support..
- Plugins: device pairing + phone control plugins (Telegram `/pair`, iOS/Android node controls)..
- Tools: add Grok (xAI) as a `web_search` provider..
- Gateway: add agent management RPC methods for the web UI (`agents.create`, `agents.update`, `agents.delete`)..
- Gateway: stream thinking events to WS clients and broadcast tool events independent of verbose level..
- Web UI: show a Compaction divider in chat history..
- Agents: include runtime shell in agent envelopes..
- Agents: auto-select `zai/glm-4.6v` for image understanding when ZAI is primary provider..
- Paths: add `KIBO_HOME` for overriding the home directory used by internal path resolution..
- Onboarding: add Custom Provider flow for OpenAI and Anthropic-compatible endpoints..
- Hooks: route webhook agent runs to specific `agentId`s, add `hooks.allowedAgentIds` controls, and fall back to default agent when unknown IDs are provided..

### Fixes

- Cron: prevent one-shot `at` jobs from re-firing on gateway restart when previously skipped or errored.
- Discord: add exec approval cleanup option to delete DMs after approval/denial/timeout..
- Sessions: prune stale entries, cap session store size, rotate large stores, accept duration/size thresholds, default to warn-only maintenance, and prune cron run sessions after retention windows..
- CI: Implement pipeline and workflow order..
- WhatsApp: preserve original filenames for inbound documents..
- Telegram: harden quote parsing; preserve quote context; avoid QUOTE_TEXT_INVALID; avoid nested reply quote misclassification..
- Security/Telegram: breaking default-behavior change - standalone canvas host + Telegram webhook listeners now bind loopback (`127.0.0.1`) instead of `0.0.0.0`; set `channels.telegram.webhookHost` when external ingress is required..
- Telegram: recover proactive sends when stale topic thread IDs are used by retrying without `message_thread_id`.
- Discord: auto-create forum/media thread posts on send, with chunked follow-up replies and media handling for forum sends..
- Discord: cap gateway reconnect attempts to avoid infinite retry loops..
- Telegram: render markdown spoilers with `<tg-spoiler>` HTML tags..
- Telegram: truncate command registration to 100 entries to avoid `BOT_COMMANDS_TOO_MUCH` failures on startup..
- Telegram: match DM `allowFrom` against sender user id (fallback to chat id) and clarify pairing logs..
- Pairing/Telegram: include the actual pairing code in approve commands, route Telegram pairing replies through the shared pairing message builder, and add regression checks to prevent `<code>` placeholder drift.
- Onboarding: QuickStart now auto-installs shell completion (prompt only in Manual).
- Onboarding/Providers: add LiteLLM provider onboarding and preserve custom LiteLLM proxy base URLs while enforcing API-key auth mode..
- Docker: make `docker-setup.sh` compatible with macOS Bash 3.2 and empty extra mounts..
- Auth: strip embedded line breaks from pasted API keys and tokens before storing/resolving credentials.
- Agents: strip reasoning tags and downgraded tool markers from messaging tool and streaming output to prevent leakage. (#11053, #13453).
- Browser: prevent stuck `act:evaluate` from wedging the browser tool, and make cancellation stop waiting promptly..
- Security/Gateway: default-deny missing connect `scopes` (no implicit `operator.admin`).
- Web UI: make chat refresh smoothly scroll to the latest messages and suppress new-messages badge flash during manual refresh.
- Web UI: coerce Form Editor values to schema types before `config.set` and `config.apply`, preventing numeric and boolean fields from being serialized as strings..
- Tools/web_search: include provider-specific settings in the web search cache key, and pass `inlineCitations` for Grok..
- Tools/web_search: fix Grok response parsing for xAI Responses API output blocks..
- Tools/web_search: normalize direct Perplexity model IDs while keeping OpenRouter model IDs unchanged..
- Model failover: treat HTTP 400 errors as failover-eligible, enabling automatic model fallback..
- Errors: prevent false positive context overflow detection when conversation mentions "context overflow" topic..
- Errors: avoid rewriting/swallowing normal assistant replies that mention error keywords by scoping `sanitizeUserFacingText` rewrites to error-context..
- Config: re-hydrate state-dir `.env` during runtime config loads so `${VAR}` substitutions remain resolvable..
- Gateway: no more post-compaction amnesia; injected transcript writes now preserve Pi session `parentId` chain so agents can remember again..
- Gateway: fix multi-agent sessions.usage discovery..
- Agents: recover from context overflow caused by oversized tool results (pre-emptive capping + fallback truncation)..
- Subagents/compaction: stabilize announce timing and preserve compaction metrics across retries..
- Subagents: report timeout-aborted runs as timed out instead of completed successfully in parent-session announcements..
- Cron: share isolated announce flow and harden scheduling/delivery reliability..
- Cron tool: recover flat params when LLM omits the `job` wrapper for add requests..
- Gateway/CLI: when `gateway.bind=lan`, use a LAN IP for probe URLs and Control UI links..
- CLI: make `kibo plugins list` output scannable by hoisting source roots and shortening bundled/global/workspace plugin paths.
- Hooks: fix bundled hooks broken since 2026.2.2 (tsdown migration)..
- Security/Plugins: install plugin and hook dependencies with `--ignore-scripts` to prevent lifecycle script execution.
- Routing: refresh bindings per message by loading config at route resolution so binding changes apply without restart..
- Exec approvals: render forwarded commands in monospace for safer approval scanning..
- Config: clamp `maxTokens` to `contextWindow` to prevent invalid model configs..
- Thinking: allow xhigh for `github-copilot/gpt-5.2-codex` and `github-copilot/gpt-5.2`..
- Thinking: honor `/think off` for reasoning-capable models..
- Discord: support forum/media thread-create starter messages, wire `message thread create --message`, and harden routing..
- Discord: download attachments from forwarded messages..
- Paths: structurally resolve `KIBO_HOME`-derived home paths and fix Windows drive-letter handling in tool meta shortening..
- Memory: set Voyage embeddings `input_type` for improved retrieval..
- Memory: disable async batch embeddings by default for memory indexing (opt-in via `agents.defaults.memorySearch.remote.batch.enabled`)..
- Memory/QMD: reuse default model cache across agents instead of re-downloading per agent..
- Memory/QMD: run boot refresh in background by default, add configurable QMD maintenance timeouts, retry QMD after fallback failures, and scope QMD queries to Kibo-managed collections. (#9690, #9705, #10042).
- Memory/QMD: initialize QMD backend on gateway startup so background update timers restart after process reloads..
- Config/Memory: auto-migrate legacy top-level `memorySearch` settings into `agents.defaults.memorySearch`. (#11278, #9143).
- Memory/QMD: treat plain-text `No results found` output from QMD as an empty result instead of throwing invalid JSON errors.
- Memory/QMD: add `memory.qmd.searchMode` to choose `query`, `search`, or `vsearch` recall mode. (#9967, #10084)
- Media understanding: recognize `.caf` audio attachments for transcription..
- State dir: honor `KIBO_STATE_DIR` for default device identity and canvas storage paths..
- Doctor/State dir: suppress repeated legacy migration warnings only for valid symlink mirrors, while keeping warnings for empty or invalid legacy trees..
- Tests: harden flaky hotspots by removing timer sleeps, consolidating onboarding provider-auth coverage, and improving memory test realism..
- macOS: honor Nix-managed defaults suite (`ai.kibo.mac`) for nixMode to prevent onboarding from reappearing after bundle-id churn..
- Matrix: add multi-account support via `channels.matrix.accounts`; use per-account config for dm policy, allowFrom, groups, and other settings; serialize account startup to avoid race condition. (#7286, #3165, #3085).

## 2026.2.6

### Added

- Cron: run history deep-links to session chat from the dashboard..
- Cron: per-run session keys in run log entries and default labels for cron sessions..
- Cron: legacy payload field compatibility (`deliver`, `channel`, `to`, `bestEffortDeliver`) in schema..

### Changes

- Cron: default `wakeMode` is now `"now"` for new jobs (was `"next-heartbeat"`)..
- Cron: `cron run` defaults to force execution; use `--due` to restrict to due-only..
- Models: support Anthropic Opus 4.6 and OpenAI Codex gpt-5.3-codex (forward-compat fallbacks). (#9853, #10720, #9995).
- Providers: add xAI (Grok) support..
- Providers: add Baidu Qianfan support..
- Web UI: add token usage dashboard..
- Web UI: add RTL auto-direction support for Hebrew/Arabic text in chat composer and rendered messages..
- Memory: native Voyage AI support..
- Sessions: cap sessions_history payloads to reduce context overflow..
- CLI: sort commands alphabetically in help output..
- CI: optimize pipeline throughput (macOS consolidation, Windows perf, workflow concurrency)..
- Agents: bump pi-mono to 0.52.7; add embedded forward-compat fallback for Opus 4.6 model ids.

### Fixes

- TTS: add missing OpenAI voices (ballad, cedar, juniper, marin, verse) to the allowlist so they are recognized instead of silently falling back to Edge TTS.
- Cron: scheduler reliability (timer drift, restart catch-up, lock contention, stale running markers)..
- Cron: store migration hardening (legacy field migration, parse error handling, explicit delivery mode persistence)..
- Telegram: auto-inject DM topic threadId in message tool + subagent announce..
- Security: require auth for Gateway canvas host and A2UI assets..
- Cron: fix scheduling and reminder delivery regressions; harden next-run recompute + timer re-arming + legacy schedule fields. (#9733, #9823, #9948, #9932).
- Update: harden Control UI asset handling in update flow..
- Security: add skill/plugin code safety scanner; redact credentials from config.get gateway responses. (#9806, #9858).
- Exec approvals: coerce bare string allowlist entries to objects..
- Slack: add mention stripPatterns for /new and /reset..
- Chrome extension: fix bundled path resolution..
- Compaction/errors: allow multiple compaction retries on context overflow; show clear billing errors. (#8928, #8391).

## 2026.2.3

### Changes

- Telegram: remove last `@ts-nocheck` from `bot-handlers.ts`, use Grammy types directly, deduplicate `StickerMetadata`. Zero `@ts-nocheck` remaining in `src/telegram/`.
- Telegram: remove `@ts-nocheck` from `bot-message.ts`, type deps via `Omit<BuildTelegramMessageContextParams>`, widen `allMedia` to `TelegramMediaRef[]`.
- Telegram: remove `@ts-nocheck` from `bot.ts`, fix duplicate `bot.catch` error handler (Grammy overrides), remove dead reaction `message_thread_id` routing, harden sticker cache guard.
- Onboarding: add Cloudflare AI Gateway provider setup and docs..
- Onboarding: add Moonshot (.cn) auth choice and keep the China base URL when preserving defaults..
- Docs: clarify tmux send-keys for TUI by splitting text and Enter..
- Docs: mirror the landing page revamp for zh-CN (features, quickstart, docs directory, network model, credits)..
- Messages: add per-channel and per-account responsePrefix overrides across channels..
- Cron: add announce delivery mode for isolated jobs (CLI + Control UI) and delivery mode config.
- Cron: default isolated jobs to announce delivery; accept ISO 8601 `schedule.at` in tool inputs.
- Cron: hard-migrate isolated jobs to announce/none delivery; drop legacy post-to-main/payload delivery fields and `atMs` inputs.
- Cron: delete one-shot jobs after success by default; add `--keep-after-run` for CLI.
- Cron: suppress messaging tools during announce delivery so summaries post consistently.
- Cron: avoid duplicate deliveries when isolated runs send messages directly.

### Fixes

- Control UI: add hardened fallback for asset resolution in global npm installs..
- Update: remove dead restore control-ui step that failed on gitignored dist/ output.
- Update: avoid wiping prebuilt Control UI assets during dev auto-builds (`tsdown --no-clean`), run update doctor via `kibo.mjs`, and auto-restore missing UI assets after doctor..
- Models: add forward-compat fallback for `openai-codex/gpt-5.3-codex` when model registry hasn't discovered it yet..
- Auto-reply/Docs: normalize `extra-high` (and spaced variants) to `xhigh` for Codex thinking levels, and align Codex 5.3 FAQ examples..
- Compaction: remove orphaned `tool_result` messages during history pruning to prevent session corruption from aborted tool calls. (#9868, fixes #9769, #9724, #9672)
- Telegram: pass `parentPeer` for forum topic binding inheritance so group-level bindings apply to all topics within the group. (#9789, fixes #9545, #9351)
- CLI: pass `--disable-warning=ExperimentalWarning` as a Node CLI option when respawning (avoid disallowed `NODE_OPTIONS` usage; fixes npm pack)..
- CLI: resolve bundled Chrome extension assets by walking up to the nearest assets directory; add resolver and clipboard tests..
- Tests: stabilize Windows ACL coverage with deterministic os.userInfo mocking..
- Exec approvals: coerce bare string allowlist entries to objects to prevent allowlist corruption. (#9903, fixes #9790).
- Exec approvals: ensure two-phase approval registration/decision flow works reliably by validating `twoPhase` requests and exposing `waitDecision` as an approvals-scoped gateway method. (#3357, fixes #2402).
- Heartbeat: allow explicit accountId routing for multi-account channels..
- TUI/Gateway: handle non-streaming finals, refresh history for non-local chat runs, and avoid event gap warnings for targeted tool streams..
- Shell completion: auto-detect and migrate slow dynamic patterns to cached files for faster terminal startup; add completion health checks to doctor/update/onboard.
- Telegram: honor session model overrides in inline model selection..
- Web UI: fix agent model selection saves for default/non-default agents and wrap long workspace paths..
- Web UI: resolve header logo path when `gateway.controlUi.basePath` is set..
- Web UI: apply button styling to the new-messages indicator.
- Onboarding: infer auth choice from non-interactive API key flags..
- Security: keep untrusted channel metadata out of system prompts (Slack/Discord)..
- Security: enforce sandboxed media paths for message tool attachments..
- Security: require explicit credentials for gateway URL overrides to prevent credential leakage..
- Security: gate `whatsapp_login` tool to owner senders and default-deny non-owner contexts..
- Voice call: harden webhook verification with host allowlists/proxy trust and keep ngrok loopback bypass.
- Voice call: add regression coverage for anonymous inbound caller IDs with allowlist policy..
- Cron: accept epoch timestamps and 0ms durations in CLI `--at` parsing.
- Cron: reload store data when the store file is recreated or mtime changes.
- Cron: deliver announce runs directly, honor delivery mode, and respect wakeMode for summaries..
- Telegram: include forward_from_chat metadata in forwarded messages and harden cron delivery target checks..
- macOS: fix cron payload summary rendering and ISO 8601 formatter concurrency safety.
- Discord: enforce DM allowlists for agent components (buttons/select menus), honoring pairing store approvals and tag matches..

## 2026.2.2-3

### Fixes

- Update: ship legacy daemon-cli shim for pre-tsdown update imports (fixes daemon restart after npm update).

## 2026.2.2-2

### Changes

- Docs: promote BlueBubbles as the recommended iMessage integration; mark imsg channel as legacy..

### Fixes

- CLI status: resolve build-info from bundled dist output (fixes "unknown" commit in npm builds).

## 2026.2.2-1

### Fixes

- CLI status: fall back to build-info for version detection (fixes "unknown" in beta builds)..

## 2026.2.2

### Changes

- Feishu: add Feishu/Lark plugin support + docs. (kibo-cn).
- Web UI: add Agents dashboard for managing agent files, tools, skills, models, channels, and cron jobs.
- Subagents: discourage direct messaging tool use unless a specific external recipient is requested.
- Memory: implement the opt-in QMD backend for workspace memory..
- Security: add healthcheck skill and bootstrap audit guidance..
- Config: allow setting a default subagent thinking level via `agents.defaults.subagents.thinking` (and per-agent `agents.list[].subagents.thinking`)..
- Docs: zh-CN translations seed + polish, pipeline guidance, nav/landing updates, and typo fixes. (#8202, #6995, #6619, #7242, #7303, #7415).
- Docs: add zh-CN i18n guardrails to avoid editing generated translations..

### Fixes

- Docs: finish renaming the QMD memory docs to reference the Kibo state dir.
- Onboarding: keep TUI flow exclusive (skip completion prompt + background Web UI seed).
- Onboarding: drop completion prompt now handled by install/update.
- TUI: block onboarding output while TUI is active and restore terminal state on exit.
- CLI: cache shell completion scripts in state dir and source cached files in profiles.
- Zsh completion: escape option descriptions to avoid invalid option errors.
- Agents: repair malformed tool calls and session transcripts..
- fix(agents): validate AbortSignal instances before calling AbortSignal.any() (thanks)
- fix(webchat): respect user scroll position during streaming and refresh (thanks)
- Telegram: recover from grammY long-poll timed out errors..
- Media understanding: skip binary media from file text extraction..
- Security: enforce access-group gating for Slack slash commands when channel type lookup fails.
- Security: require validated shared-secret auth before skipping device identity on gateway connect..
- Security: guard skill installer downloads with SSRF checks (block private/localhost URLs).
- Security/Gateway: require `operator.approvals` for in-chat `/approve` when invoked from gateway clients..
- Security: harden Windows exec allowlist; block cmd.exe bypass via single &..
- Media understanding: apply SSRF guardrails to provider fetches; allow private baseUrl overrides explicitly.
- fix(voice-call): harden inbound allowlist; reject anonymous callers; require Telnyx publicKey for allowlist; token-gate Twilio media streams; cap webhook body size (thanks)
- Onboarding: keep TUI flow exclusive (skip completion prompt + background Web UI seed); completion prompt now handled by install/update.
- CLI/Zsh completion: cache scripts in state dir and escape option descriptions to avoid invalid option errors.
- fix(ui): resolve Control UI asset path correctly.
- fix(ui): refresh agent files after external edits.
- Tests: stub SSRF DNS pinning in web auto-reply + Gemini video coverage..

## 2026.2.1

### Changes

- Docs: onboarding/install/i18n/exec-approvals/Control UI/exe.dev/cacheRetention updates + misc nav/typos. (#3050, #3461, #4064, #4675, #4729, #4763, #5003, #5402, #5446, #5474, #5663, #5689, #5694, #5967, #6270, #6300, #6311, #6416, #6487, #6550, #6789)
- Telegram: use shared pairing store..
- Agents: add OpenRouter app attribution headers..
- Agents: add system prompt safety guardrails..
- Agents: update pi-ai to 0.50.9 and rename cacheControlTtl -> cacheRetention (with back-compat mapping).
- Agents: extend CreateAgentSessionOptions with systemPrompt/skills/contextFiles.
- Agents: add tool policy conformance snapshot (no runtime behavior change).
- Auth: update MiniMax OAuth hint + portal auth note copy.
- Discord: inherit thread parent bindings for routing..
- Gateway: inject timestamps into agent and chat.send messages..
- Gateway: require TLS 1.3 minimum for TLS listeners..
- Web UI: refine chat layout + extend session active duration.
- CI: add formal conformance + alias consistency checks. (#5723, #5807)

### Fixes

- Security: guard remote media fetches with SSRF protections (block private/localhost, DNS pinning).
- Updates: clean stale global install rename dirs and extend gateway update timeouts to avoid npm ENOTEMPTY failures.
- Security/Plugins/Hooks: validate install paths and reject traversal-like names (prevents path traversal outside the state dir)..
- Telegram: add download timeouts for file fetches..
- Telegram: enforce thread specs for DM vs forum sends..
- Streaming: flush block streaming on paragraph boundaries for newline chunking.
- Streaming: stabilize partial streaming filters.
- Auto-reply: avoid referencing workspace files in /new greeting prompt..
- Tools: align tool execute adapters/signatures (legacy + parameter order + arg normalization).
- Tools: treat "\*" tool allowlist entries as valid to avoid spurious unknown-entry warnings.
- Skills: update session-logs paths from .kibobot to .kibo.
- Slack: harden media fetch limits and Slack file URL validation..
- Lint: satisfy curly rule after import sorting.
- Process: resolve Windows `spawn()` failures for npm-family CLIs by appending `.cmd` when needed..
- Discord: resolve PluralKit proxied senders for allowlists and labels..
- Tlon: add timeout to SSE client fetch calls (CWE-400).
- Memory search: L2-normalize local embedding vectors to fix semantic search.
- Agents: align embedded runner + typings with pi-coding-agent API updates (pi 0.51.0).
- Agents: ensure OpenRouter attribution headers apply in the embedded runner.
- Agents: cap context window resolution for compaction safeguard..
- System prompt: resolve overrides and hint using session_status for current date/time. (#1897, #1928, #2108, #3677)
- Agents: fix Pi prompt template argument syntax.
- Subagents: fix announce failover race (always emit lifecycle end; timeout=0 means no-timeout).
- Teams: gate media auth retries.
- Telegram: restore draft streaming partials..
- Onboarding: friendlier Windows onboarding message..
- TUI: prevent crash when searching with digits in the model selector.
- Agents: wire before_tool_call plugin hook into tool execution. (#6570, #6660).
- Browser: secure Chrome extension relay CDP sessions.
- Docker: use container port for gateway command instead of host port..
- Docker: start gateway CMD by default for container deployments..
- fix(shell): block arbitrary exec via shellPath/cwd injection (GHSA-4mhr-g7xj-cg8j)..
- Security: sanitize WhatsApp accountId to prevent path traversal.
- Security: restrict MEDIA path extraction to prevent LFI.
- Security: validate message-tool filePath/path against sandbox root.
- Security: block LD*/DYLD* env overrides for host exec..
- Security: harden web tool content wrapping + file parsing safeguards..
- Security: enforce Twitch `allowFrom` allowlist gating (deny non-allowlisted senders)..

## 2026.1.31

### Fixes

- Plugins: validate plugin/hook install paths and reject traversal-like names.
- Tools: treat `"*"` tool allowlist entries as valid to avoid spurious unknown-entry warnings.

## 2026.1.30

### Changes

- CLI: add `completion` command (Zsh/Bash/PowerShell/Fish) and auto-setup during postinstall/onboarding.
- CLI: add per-agent `models status` (`--agent` filter)..
- Agents: add Kimi K2.5 to the synthetic model catalog..
- Auth: switch Kimi Coding to built-in provider; normalize OAuth profile email.
- Auth: add MiniMax OAuth plugin + onboarding option..
- Agents: update pi SDK/API usage and dependencies.
- Web UI: refresh sessions after chat commands and improve session display names.
- Build: move TypeScript builds to `tsdown` + `tsgo` (faster builds, CI typechecks), update tsconfig target, and clean up lint rules.
- Build: align npm tar override and bin metadata so the `kibo` CLI entrypoint is preserved in npm publishes.
- Docs: add pi/pi-dev docs and update Kibo branding + install links.
- Docker E2E: stabilize gateway readiness, plugin installs/manifests, and cleanup/doctor switch entrypoint checks.

### Fixes

- Security: restrict local path extraction in media parser to prevent LFI.
- Gateway: prevent token defaults from becoming the literal "undefined"..
- Control UI: fix assets resolution for npm global installs..
- macOS: avoid stderr pipe backpressure in gateway discovery..
- Telegram: normalize account token lookup for non-normalized IDs..
- Telegram: preserve delivery thread fallback and fix threadId handling in delivery context.
- Telegram: fix HTML nesting for overlapping styles/links..
- Telegram: accept numeric messageId/chatId in react actions..
- Telegram: honor per-account proxy dispatcher via undici fetch..
- Telegram: scope skill commands to bound agent per bot..
- BlueBubbles: debounce by messageId to preserve attachments in text+image messages.
- Routing: prefer requesterOrigin over stale session entries for sub-agent announce delivery.
- Extensions: restore embedded extension discovery typings.
- CLI: fix `tui:dev` port resolution.
- LINE: fix status command TypeError.
- OAuth: skip expired-token warnings when refresh tokens are still valid.
- Build: skip redundant UI install step in Dockerfile..

## 2026.1.29

### Changes

- Rebrand: rename the npm package/CLI to `kibo`, add a `kibo` compatibility shim, and move extensions to the `@kibo/*` scope.
- Onboarding: strengthen security warning copy for beta + access control expectations.
- Onboarding: add Venice API key to non-interactive flow..
- Config: auto-migrate legacy state/config paths and keep config resolution consistent across legacy filenames.
- Gateway: warn on hook tokens via query params; document header auth preference..
- Gateway: add dangerous Control UI device auth bypass flag + audit warnings.
- Doctor: warn on gateway exposure without auth..
- Web UI: keep sub-agent announce replies visible in WebChat..
- Browser: route browser control via gateway/node; remove standalone browser control command and control URL config.
- Browser: route `browser.request` via node proxies when available; honor proxy timeouts; derive browser ports from `gateway.port`.
- Browser: fall back to URL matching for extension relay target resolution..
- Telegram: allow caption param for media sends..
- Telegram: support plugin sendPayload channelData (media/buttons) and validate plugin commands..
- Telegram: avoid block replies when streaming is disabled..
- Telegram: add optional silent send flag (disable notifications)..
- Telegram: support editing sent messages via message(action="edit")..
- Telegram: support quote replies for message tool and inbound context..
- Telegram: add sticker receive/send with vision caching..
- Telegram: send sticker pixels to vision models.
- Telegram: keep topic IDs in restart sentinel notifications..
- Discord: add configurable privileged gateway intents for presences/members..
- Slack: clear ack reaction after streamed replies..
- Matrix: switch plugin SDK to/matrix-bot-sdk.
- Tlon: format thread reply IDs as..
- Tools: add per-sender group tool policies and fix precedence..
- Agents: summarize dropped messages during compaction safeguard pruning..
- Agents: expand cron tool description with full schema docs..
- Agents: honor tools.exec.safeBins in exec allowlist checks.
- Memory Search: allow extra paths for memory indexing (ignores symlinks)..
- Skills: add multi-image input support to Nano Banana Pro skill..
- Skills: add missing dependency metadata for GitHub, Notion, Slack, Discord..
- Commands: group /help and /commands output with Telegram paging..
- Routing: add per-account DM session scope and document multi-account isolation..
- Routing: precompile session key regexes..
- CLI: use Node's module compile cache for faster startup..
- Auth: show copyable Google auth URL after ASCII prompt..
- TUI: avoid width overflow when rendering selection lists..
- macOS: finish Kibo app rename for macOS sources, bundle identifiers, and shared kit paths..
- Branding: update launchd labels, mobile bundle IDs, and logging subsystems to bot.molt (legacy bundle ID migrations)..
- macOS: limit project-local `node_modules/.bin` PATH preference to debug builds (reduce PATH hijacking risk).
- macOS: keep custom SSH usernames in remote target..
- macOS: avoid crash when rendering code blocks by bumping Textual to 0.3.1..
- Update: ignore dist/control-ui for dirty checks and restore after ui builds..
- Build: bundle A2UI assets during build and stop tracking generated bundles..
- CI: increase Node heap size for macOS checks..
- Config: apply config.env before ${VAR} substitution..
- Gateway: prefer newest session metadata when combining stores..
- Docs: tighten Fly private deployment steps..
- Docs: add migration guide for moving to a new machine.
- Docs: add Northflank one-click deployment guide..
- Docs: add Vercel AI Gateway to providers sidebar..
- Docs: add Render deployment guide..
- Docs: add Claude Max API Proxy guide..
- Docs: add DigitalOcean deployment guide..
- Docs: add Oracle Cloud (OCI) platform guide + cross-links..
- Docs: add Raspberry Pi install guide..
- Docs: add GCP Compute Engine deployment guide..
- Docs: add LINE channel guide..
- Docs: credit both contributors for Control UI refresh..
- Docs: keep docs header sticky so navbar stays visible while scrolling..
- Docs: update exe.dev install instructions. (#https://github.com/kibo/kibo/pull/3047).

### Fixes

- Skills: update session-logs paths to use ~/.kibo..
- Telegram: avoid silent empty replies by tracking normalization skips before fallback.
- Mentions: honor mentionPatterns even when explicit mentions are present..
- Discord: restore username directory lookup in target resolution..
- Agents: align MiniMax base URL test expectation with default provider config..
- Agents: prevent retries on oversized image errors and surface size limits..
- Agents: inherit provider baseUrl/api for inline models..
- Memory Search: keep auto provider model defaults and only include remote when configured..
- Telegram: include AccountId in native command context for multi-agent routing..
- Telegram: handle video note attachments in media extraction..
- TTS: read OPENAI_TTS_BASE_URL at runtime instead of module load to honor config.env..
- macOS: auto-scroll to bottom when sending a new message while scrolled up..
- Web UI: auto-expand the chat compose textarea while typing (with sensible max height)..
- Gateway: prevent crashes on transient network errors (fetch failures, timeouts, DNS). Added fatal error detection to only exit on truly critical errors. Fixes #2895, #2879, #2873..
- Agents: guard channel tool listActions to avoid plugin crashes..
- Discord: stop resolveDiscordTarget from passing directory params into messaging target parsers. Fixes #3167..
- Discord: avoid resolving bare channel names to user DMs when a username matches..
- Discord: fix directory config type import for target resolution..
- Providers: update MiniMax API endpoint and compatibility mode..
- Telegram: treat more network errors as recoverable in polling..
- Discord: resolve usernames to user IDs for outbound messages..
- Providers: update Moonshot Kimi model references to kimi-k2.5..
- Gateway: suppress AbortError and transient network errors in unhandled rejections..
- TTS: keep /tts status replies on text-only commands and avoid duplicate block-stream audio..
- Security: pin npm overrides to keep tar@7.5.4 for install toolchains.
- Security: properly test Windows ACL audit for config includes..
- CLI: recognize versioned Node executables when parsing argv..
- CLI: avoid prompting for gateway runtime under the spinner.
- BlueBubbles: coalesce inbound URL link preview messages..
- Cron: allow payloads containing "heartbeat" in event filter..
- CLI: avoid loading config for global help/version while registering plugin commands..
- Agents: include memory.md when bootstrapping memory context..
- Agents: release session locks on process termination and cover more signals..
- Agents: skip cooldowned providers during model failover..
- Telegram: harden polling + retry behavior for transient network errors and Node 22 transport issues..
- Telegram: ignore non-forum group message_thread_id while preserving DM thread sessions..
- Telegram: wrap reasoning italics per line to avoid raw underscores..
- Telegram: centralize API error logging for delivery and bot calls..
- Voice Call: enforce Twilio webhook signature verification for ngrok URLs; disable ngrok free tier bypass by default.
- Security: harden Tailscale Serve auth by validating identity via local tailscaled before trusting headers.
- Media: fix text attachment MIME misclassification with CSV/TSV inference and UTF-16 detection; add XML attribute escaping for file output..
- Build: align memory-core peer dependency with lockfile.
- Security: add mDNS discovery mode with minimal default to reduce information disclosure..
- Security: harden URL fetches with DNS pinning to reduce rebinding risk. Thanks Chris Zheng.
- Web UI: improve WebChat image paste previews and allow image-only sends..
- Security: wrap external hook content by default with a per-hook opt-out..
- Gateway: default auth now fail-closed (token/password required; Tailscale Serve identity remains allowed).
- Gateway: treat loopback + non-local Host connections as remote unless trusted proxy headers are present.
- Onboarding: remove unsupported gateway auth "off" choice from onboarding/configure flows and CLI flags.

### Breaking

- **BREAKING:** Gateway auth mode "none" is removed; gateway now requires token/password (Tailscale Serve identity still allowed).

## 2026.1.24-3

### Fixes

- Slack: fix image downloads failing due to missing Authorization header on cross-origin redirects..
- Gateway: harden reverse proxy handling for local-client detection and unauthenticated proxied connects..
- Security audit: flag loopback Control UI with auth disabled as critical..
- CLI: resume claude-cli sessions and stream CLI replies to TUI clients..

## 2026.1.24-2

### Fixes

- Packaging: include dist/link-understanding output in npm tarball (fixes missing apply.js import on install).

## 2026.1.24-1

### Fixes

- Packaging: include dist/shared output in npm tarball (fixes missing reasoning-tags import on install).

## 2026.1.24

### Highlights

- Providers: Ollama discovery + docs; Venice guide upgrades + cross-links.. https://github.com/Arjgorithmic/openclaw/providers/ollama https://github.com/Arjgorithmic/openclaw/providers/venice
- Channels: LINE plugin (Messaging API) with rich replies + quick replies..
- TTS: Edge fallback (keyless) + `/tts` auto modes. (#1668, #1667). https://github.com/Arjgorithmic/openclaw/tts
- Exec approvals: approve in-chat via `/approve` across all channels (including plugins).. https://github.com/Arjgorithmic/openclaw/tools/exec-approvals https://github.com/Arjgorithmic/openclaw/tools/slash-commands
- Telegram: DM topics as separate sessions + outbound link preview toggle. (#1597, #1700). https://github.com/Arjgorithmic/openclaw/channels/telegram

### Changes

- Channels: add LINE plugin (Messaging API) with rich replies, quick replies, and plugin HTTP registry..
- TTS: add Edge TTS provider fallback, defaulting to keyless Edge with MP3 retry on format failures.. https://github.com/Arjgorithmic/openclaw/tts
- TTS: add auto mode enum (off/always/inbound/tagged) with per-session `/tts` override.. https://github.com/Arjgorithmic/openclaw/tts
- Telegram: treat DM topics as separate sessions and keep DM history limits stable with thread suffixes..
- Telegram: add `channels.telegram.linkPreview` to toggle outbound link previews.. https://github.com/Arjgorithmic/openclaw/channels/telegram
- Web search: add Brave freshness filter parameter for time-scoped results.. https://github.com/Arjgorithmic/openclaw/tools/web
- UI: refresh Control UI dashboard design system (colors, icons, typography). (#1745, #1786).
- Exec approvals: forward approval prompts to chat with `/approve` for all channels (including plugins).. https://github.com/Arjgorithmic/openclaw/tools/exec-approvals https://github.com/Arjgorithmic/openclaw/tools/slash-commands
- Gateway: expose config.patch in the gateway tool with safe partial updates + restart sentinel..
- Diagnostics: add diagnostic flags for targeted debug logs (config + env override). https://github.com/Arjgorithmic/openclaw/diagnostics/flags
- Docs: expand FAQ (migration, scheduling, concurrency, model recommendations, OpenAI subscription auth, Pi sizing, hackable install, docs SSL workaround).
- Docs: add verbose installer troubleshooting guidance.
- Docs: add macOS VM guide with local/hosted options + VPS/nodes guidance..
- Docs: add Bedrock EC2 instance role setup + IAM steps.. https://github.com/Arjgorithmic/openclaw/bedrock
- Docs: update Fly.io guide notes.
- Dev: add prek pre-commit hooks + dependabot config for weekly updates..

### Fixes

- Web UI: fix config/debug layout overflow, scrolling, and code block sizing..
- Web UI: show Stop button during active runs, swap back to New session when idle..
- Web UI: clear stale disconnect banners on reconnect; allow form saves with unsupported schema paths but block missing schema..
- Web UI: hide internal `message_id` hints in chat bubbles.
- Gateway: allow Control UI token-only auth to skip device pairing even when device identity is present (`gateway.controlUi.allowInsecureAuth`)..
- Matrix: decrypt E2EE media attachments with preflight size guard..
- BlueBubbles: route phone-number targets to DMs, avoid leaking routing IDs, and auto-create missing DMs (Private API required).. https://github.com/Arjgorithmic/openclaw/channels/bluebubbles
- BlueBubbles: keep part-index GUIDs in reply tags when short IDs are missing.
- iMessage: normalize chat_id/chat_guid/chat_identifier prefixes case-insensitively and keep service-prefixed handles stable..
- Signal: repair reaction sends (group/UUID targets + CLI author flags)..
- Signal: add configurable signal-cli startup timeout + external daemon mode docs. https://github.com/Arjgorithmic/openclaw/channels/signal
- Telegram: set fetch duplex="half" for uploads on Node 22 to avoid sendPhoto failures..
- Telegram: use wrapped fetch for long-polling on Node to normalize AbortSignal handling.
- Telegram: honor per-account proxy for outbound API calls..
- Telegram: fall back to text when voice notes are blocked by privacy settings..
- Voice Call: return stream TwiML for outbound conversation calls on initial Twilio webhook.
- Voice Call: serialize Twilio TTS playback and cancel on barge-in to prevent overlap..
- Google Chat: tighten email allowlist matching, typing cleanup, media caps, and onboarding/docs/tests..
- Google Chat: normalize space targets without double `spaces/` prefix.
- Agents: auto-compact on context overflow prompt errors before failing..
- Agents: use the active auth profile for auto-compaction recovery.
- Media understanding: skip image understanding when the primary model already supports vision..
- Models: default missing custom provider fields so minimal configs are accepted.
- Messaging: keep newline chunking safe for fenced markdown blocks across channels.
- Messaging: treat newline chunking as paragraph-aware (blank-line splits) to keep lists and headings together..
- TUI: reload history after gateway reconnect to restore session state.
- Heartbeat: normalize target identifiers for consistent routing.
- Exec: keep approvals for elevated ask unless full mode..
- Exec: treat Windows platform labels as Windows for node shell selection..
- Gateway: include inline config env vars in service install environments..
- Gateway: skip Tailscale DNS probing when tailscale.mode is off.
- Gateway: reduce log noise for late invokes + remote node probes; debounce skills refresh..
- Gateway: clarify Control UI/WebChat auth error hints for missing tokens.
- Gateway: listen on IPv6 loopback when bound to 127.0.0.1 so localhost webhooks work.
- Gateway: store lock files in the temp directory to avoid stale locks on persistent volumes.
- macOS: default direct-transport `ws://` URLs to port 18789; document `gateway.remote.transport`..
- Tests: cap Vitest workers on CI macOS to reduce timeouts..
- Tests: avoid fake-timer dependency in embedded runner stream mock to reduce CI flakes..
- Tests: increase embedded runner ordering test timeout to reduce CI flakes..

## 2026.1.23-1

### Fixes

- Packaging: include dist/tts output in npm tarball (fixes missing dist/tts/tts.js).

## 2026.1.23

### Highlights

- TTS: move Telegram TTS into core + enable model-driven TTS tags by default for expressive audio replies.. https://github.com/Arjgorithmic/openclaw/tts
- Gateway: add `/tools/invoke` HTTP endpoint for direct tool calls (auth + tool policy enforced).. https://github.com/Arjgorithmic/openclaw/gateway/tools-invoke-http-api
- Heartbeat: per-channel visibility controls (OK/alerts/indicator).. https://github.com/Arjgorithmic/openclaw/gateway/heartbeat
- Deploy: add Fly.io deployment support + guide. https://github.com/Arjgorithmic/openclaw/platforms/fly
- Channels: add Tlon/Urbit channel plugin (DMs, group mentions, thread replies).. https://github.com/Arjgorithmic/openclaw/channels/tlon

### Changes

- Channels: allow per-group tool allow/deny policies across built-in + plugin channels.. https://github.com/Arjgorithmic/openclaw/multi-agent-sandbox-tools
- Agents: add Bedrock auto-discovery defaults + config overrides.. https://github.com/Arjgorithmic/openclaw/bedrock
- CLI: add `kibo system` for system events + heartbeat controls; remove standalone `wake`. (commit 71203829d) https://github.com/Arjgorithmic/openclaw/cli/system
- CLI: add live auth probes to `kibo models status` for per-profile verification. (commit 40181afde) https://github.com/Arjgorithmic/openclaw/cli/models
- CLI: restart the gateway by default after `kibo update`; add `--no-restart` to skip it. (commit 2c85b1b40)
- Browser: add node-host proxy auto-routing for remote gateways (configurable per gateway/node). (commit c3cb26f7c)
- Plugins: add optional `llm-task` JSON-only tool for workflows.. https://github.com/Arjgorithmic/openclaw/tools/llm-task
- Markdown: add per-channel table conversion (bullets for Signal/WhatsApp, code blocks elsewhere)..
- Agents: keep system prompt time zone-only and move current time to `session_status` for better cache hits. (commit 66eec295b)
- Agents: remove redundant bash tool alias from tool registration/display..
- Docs: add cron vs heartbeat decision guide (with Kibo Shell workflow notes).. https://github.com/Arjgorithmic/openclaw/automation/cron-vs-heartbeat
- Docs: clarify HEARTBEAT.md empty file skips heartbeats, missing file still runs.. https://github.com/Arjgorithmic/openclaw/gateway/heartbeat

### Fixes

- Sessions: accept non-UUID sessionIds for history/send/status while preserving agent scoping.
- Heartbeat: accept plugin channel ids for heartbeat target validation + UI hints.
- Messaging/Sessions: mirror outbound sends into target session keys (threads + dmScope), create session entries on send, and normalize session key casing. (#1520, commit 4b6cdd1d3)
- Sessions: reject array-backed session stores to prevent silent wipes.
- Gateway: compare Linux process start time to avoid PID recycling lock loops; keep locks unless stale..
- Gateway: accept null optional fields in exec approval requests..
- Exec approvals: persist allowlist entry ids to keep macOS allowlist rows stable..
- Exec: honor tools.exec ask/security defaults for elevated approvals (avoid unwanted prompts). (commit 5662a9cdf)
- Daemon: use platform PATH delimiters when building minimal service paths. (commit a4e57d3ac)
- Linux: include env-configured user bin roots in systemd PATH and align PATH audits..
- Tailscale: retry serve/funnel with sudo only for permission errors and keep original failure details..
- Docker: update gateway command in docker-compose and Hetzner guide.
- Agents: show tool error fallback when the last assistant turn only invoked tools (prevents silent stops). (commit 8ea8801d0)
- Agents: ignore IDENTITY.md template placeholders when parsing identity.
- Agents: drop orphaned OpenAI Responses reasoning blocks on model switches..
- Agents: add CLI log hint to "agent failed before reply" messages..
- Agents: warn and ignore tool allowlists that only reference unknown or unloaded plugin tools.
- Agents: treat plugin-only tool allowlists as opt-ins; keep core tools enabled.
- Agents: honor enqueue overrides for embedded runs to avoid queue deadlocks in tests. and.
- Slack: honor open groupPolicy for unlisted channels in message + slash gating..
- Discord: limit autoThread mention bypass to bot-owned threads; keep ack reactions mention-gated..
- Discord: retry rate-limited allowlist resolution + command deploy to avoid gateway crashes. (commit f70ac0c7c)
- Mentions: ignore mentionPattern matches when another explicit mention is present in group chats (Slack/Discord/Telegram/WhatsApp). (commit d905ca0e0)
- Telegram: render markdown in media captions.
- MS Teams: remove `.default` suffix from Graph scopes and Bot Framework probe scopes. (#1507, #1574).
- Browser: keep extension relay tabs controllable when the extension reuses a session id after switching tabs.
- Voice wake: auto-save wake words on blur/submit across iOS/Android and align limits with macOS. (commit 69f645c66)
- UI: keep the Control UI sidebar visible while scrolling long pages..
- UI: cache Control UI markdown rendering + memoize chat text extraction to reduce Safari typing jank. (commit d57cb2e1a)
- TUI: forward unknown slash commands, include Gateway commands in autocomplete, and render slash replies as system output. (commit 1af227b61, commit 8195497ce, commit 6fba598ea)
- CLI: auth probe output polish (table output, inline errors, reduced noise, and wrap fixes in `kibo models status`). (commit da3f2b489, commit 00ae21bed, commit 31e59cd58, commit f7dc27f2d, commit 438e782f8, commit 886752217, commit aabe0bed3, commit 81535d512, commit c63144ab1)
- Media: only parse `MEDIA:` tags when they start the line to avoid stripping prose mentions.
- Media: preserve PNG alpha when possible; fall back to JPEG when still over size cap..
- Skills: gate bird Homebrew install to macOS..

## 2026.1.22

### Changes

- Highlight: Compaction safeguard now uses adaptive chunking, progressive fallback, and UI status + retries..
- Providers: add Antigravity usage tracking to status output..
- Slack: add chat-type reply threading overrides via `replyToModeByChatType`..
- BlueBubbles: add `asVoice` support for MP3/CAF voice memos in sendAttachment. (#1477, #1482).
- Onboarding: add hatch choice (TUI/Web/Later), token explainer, background dashboard seed on macOS, and showcase link.

### Fixes

- BlueBubbles: stop typing indicator on idle/no-reply..
- Message tool: keep path/filePath as-is for send; hydrate buffers only for sendAttachment..
- Auto-reply: only report a model switch when session state is available..
- Control UI: resolve local avatar URLs with basePath across injection + identity RPC..
- Agents: sanitize assistant history text to strip tool-call markers..
- Discord: clarify Message Content Intent onboarding hint..
- Gateway: stop the service before uninstalling and fail if it remains loaded.
- Agents: surface concrete API error details instead of generic AI service errors.
- Exec: fall back to non-PTY when PTY spawn fails (EBADF).
- Exec approvals: allow per-segment allowlists for chained shell commands on gateway + node hosts..
- Agents: make OpenAI sessions image-sanitize-only; gate tool-id/repair sanitization by provider.
- Doctor: honor KIBOBOT_GATEWAY_TOKEN for auth checks and security audit token reuse..
- Agents: make tool summaries more readable and only show optional params when set.
- Agents: honor SOUL.md guidance even when the file is nested or path-qualified..
- Matrix (plugin): persist m.direct for resolved DMs and harden room fallback. (#1436, #1486).
- CLI: prefer `~` for home paths in output.
- Mattermost (plugin): enforce pairing/allowlist gating, keep targets, and clarify plugin-only docs..
- Agents: centralize transcript sanitization in the runner; keep <final> tags and error turns intact.
- Auth: skip auth profiles in cooldown during initial selection and rotation..
- Agents/TUI: honor user-pinned auth profiles during cooldown and preserve search picker ranking..
- Docs: fix gog auth services example to include docs scope..
- Slack: reduce WebClient retries to avoid duplicate sends.
- Slack: read thread replies for message reads when threadId is provided (replies-only)..
- Discord: honor accountId across message actions and cron deliveries..
- macOS: prefer linked channels in gateway summary to avoid false "not linked" status.
- macOS/tests: fix gateway summary lookup after guard unwrap; prevent browser opens during tests. (ECID-1483)

## 2026.1.21-2

### Fixes

- Control UI: ignore bootstrap identity placeholder text for avatar values and fall back to the default avatar. https://github.com/Arjgorithmic/openclaw/cli/agents https://github.com/Arjgorithmic/openclaw/web/control-ui
- Slack: remove deprecated `filetype` field from `files.uploadV2` to eliminate API warnings.

## 2026.1.21

### Changes

- Highlight: Kibo Shell optional plugin tool for typed workflows + approval gates. https://github.com/Arjgorithmic/openclaw/tools/shell
- Kibo Shell: allow workflow file args via `argsJson` in the plugin tool. https://github.com/Arjgorithmic/openclaw/tools/shell
- Heartbeat: allow running heartbeats in an explicit session key..
- CLI: default exec approvals to the local host, add gateway/node targeting flags, and show target details in allowlist output.
- CLI: exec approvals mutations render tables instead of raw JSON.
- Exec approvals: support wildcard agent allowlists (`*`) across all agents.
- Exec approvals: allowlist matches resolved binary paths only, add safe stdin-only bins, and tighten allowlist shell parsing.
- Nodes: expose node PATH in status/describe and bootstrap PATH for node-host execution.
- CLI: flatten node service commands under `kibo node` and remove `service node` docs.
- CLI: move gateway service commands under `kibo gateway` and add `gateway probe` for reachability.
- Sessions: add per-channel reset overrides via `session.resetByChannel`..
- Agents: add identity avatar config support and Control UI avatar rendering. (#1329, #1424).
- UI: show per-session assistant identity in the Control UI..
- CLI: add `kibo update wizard` for interactive channel selection and restart prompts. https://github.com/Arjgorithmic/openclaw/cli/update
- Signal: add typing indicators and DM read receipts via signal-cli.
- MSTeams: add file uploads, adaptive cards, and attachment handling improvements..
- Onboarding: remove the run setup-token auth option (paste setup-token or reuse CLI creds instead).
- Docs: add troubleshooting entry for gateway.mode blocking gateway start. https://github.com/Arjgorithmic/openclaw/gateway/troubleshooting
- Docs: add /model allowlist troubleshooting note.
- Docs: add per-message Gmail search example for gog..

### Fixes

- Nodes/macOS: prompt on allowlist miss for node exec approvals, persist allowlist decisions, and flatten node invoke errors..
- Gateway: keep auto bind loopback-first and add explicit tailnet binding to avoid Tailscale taking over local UI.
- Memory: prevent CLI hangs by deferring vector probes, adding sqlite-vec/embedding timeouts, and showing sync progress early.
- Agents: enforce 9-char alphanumeric tool call ids for Mistral providers..
- Embedded runner: persist injected history images so attachments aren't reloaded each turn..
- Nodes tool: include agent/node/gateway context in tool failure logs to speed approval debugging.
- macOS: exec approvals now respect wildcard agent allowlists (`*`).
- macOS: allow SSH agent auth when no identity file is set..
- Gateway: prevent multiple gateways from sharing the same config/state at once (singleton lock).
- UI: remove the chat stop button and keep the composer aligned to the bottom edge.
- Typing: start instant typing indicators at run start so DMs and mentions show immediately.
- Configure: restrict the model allowlist picker to OAuth-compatible Anthropic models and preselect Opus 4.5.
- Configure: seed model fallbacks from the allowlist selection when multiple models are chosen.
- Model picker: list the full catalog when no model allowlist is configured.
- Discord: honor wildcard channel configs via shared match helpers..
- BlueBubbles: resolve short message IDs safely and expose full IDs in templates..
- Infra: preserve fetch helper methods when wrapping abort signals.
- macOS: default distribution packaging to universal binaries..
- Embedded runner: forward sender identity into attempt execution so Feishu doc auto-grant receives requester context again..

### Breaking

- **BREAKING:** Control UI now rejects insecure HTTP without device identity by default. Use HTTPS (Tailscale Serve) or set `gateway.controlUi.allowInsecureAuth: true` to allow token-only auth. https://github.com/Arjgorithmic/openclaw/web/control-ui#insecure-http
- **BREAKING:** Envelope and system event timestamps now default to host-local time (was UTC) so agents don't have to constantly convert.

## 2026.1.20

### Changes

- Control UI: add copy-as-markdown with error feedback. https://github.com/Arjgorithmic/openclaw/web/control-ui
- Control UI: drop the legacy list view. https://github.com/Arjgorithmic/openclaw/web/control-ui
- TUI: add syntax highlighting for code blocks. https://github.com/Arjgorithmic/openclaw/tui
- TUI: session picker shows derived titles, fuzzy search, relative times, and last message preview. https://github.com/Arjgorithmic/openclaw/tui
- TUI: add a searchable model picker for quicker model selection. https://github.com/Arjgorithmic/openclaw/tui
- TUI: add input history (up/down) for submitted messages. https://github.com/Arjgorithmic/openclaw/tui
- ACP: add `kibo acp` for IDE integrations. https://github.com/Arjgorithmic/openclaw/cli/acp
- ACP: add `kibo acp client` interactive harness for debugging. https://github.com/Arjgorithmic/openclaw/cli/acp
- Skills: add download installs with OS-filtered options. https://github.com/Arjgorithmic/openclaw/tools/skills
- Skills: add the local sherpa-onnx-tts skill. https://github.com/Arjgorithmic/openclaw/tools/skills
- Memory: add hybrid BM25 + vector search (FTS5) with weighted merging and fallback. https://github.com/Arjgorithmic/openclaw/concepts/memory
- Memory: add SQLite embedding cache to speed up reindexing and frequent updates. https://github.com/Arjgorithmic/openclaw/concepts/memory
- Memory: add OpenAI batch indexing for embeddings when configured. https://github.com/Arjgorithmic/openclaw/concepts/memory
- Memory: enable OpenAI batch indexing by default for OpenAI embeddings. https://github.com/Arjgorithmic/openclaw/concepts/memory
- Memory: allow parallel OpenAI batch indexing jobs (default concurrency: 2). https://github.com/Arjgorithmic/openclaw/concepts/memory
- Memory: render progress immediately, color batch statuses in verbose logs, and poll OpenAI batch status every 2s by default. https://github.com/Arjgorithmic/openclaw/concepts/memory
- Memory: add `--verbose` logging for memory status + batch indexing details. https://github.com/Arjgorithmic/openclaw/concepts/memory
- Memory: add native Gemini embeddings provider for memory search. https://github.com/Arjgorithmic/openclaw/concepts/memory
- Browser: allow config defaults for efficient snapshots in the tool/CLI. https://github.com/Arjgorithmic/openclaw/tools/browser
- Nostr: add the Nostr channel plugin with profile management + onboarding defaults. https://github.com/Arjgorithmic/openclaw/channels/nostr
- Matrix: migrate to matrix-bot-sdk with E2EE support, location handling, and group allowlist upgrades. https://github.com/Arjgorithmic/openclaw/channels/matrix
- Slack: add HTTP webhook mode via Bolt HTTP receiver. https://github.com/Arjgorithmic/openclaw/channels/slack
- Telegram: enrich forwarded-message context with normalized origin details + legacy fallback. https://github.com/Arjgorithmic/openclaw/channels/telegram
- Discord: fall back to `/skill` when native command limits are exceeded.
- Discord: expose `/skill` globally.
- Zalouser: add channel dock metadata, config schema, setup wiring, probe, and status issues. https://github.com/Arjgorithmic/openclaw/plugins/zalouser
- Plugins: require manifest-embedded config schemas with preflight validation warnings. https://github.com/Arjgorithmic/openclaw/plugins/manifest
- Plugins: move channel catalog metadata into plugin manifests. https://github.com/Arjgorithmic/openclaw/plugins/manifest
- Plugins: align Nextcloud Talk policy helpers with core patterns. https://github.com/Arjgorithmic/openclaw/plugins/manifest
- Plugins/UI: let channel plugin metadata drive UI labels/icons and cron channel options. https://github.com/Arjgorithmic/openclaw/web/control-ui
- Agents/UI: add agent avatar support in identity config, IDENTITY.md, and the Control UI. https://github.com/Arjgorithmic/openclaw/gateway/configuration
- Plugins: add plugin slots with a dedicated memory slot selector. https://github.com/Arjgorithmic/openclaw/plugins/agent-tools
- Plugins: ship the bundled BlueBubbles channel plugin (disabled by default). https://github.com/Arjgorithmic/openclaw/channels/bluebubbles
- Plugins: migrate bundled messaging extensions to the plugin SDK and resolve plugin-sdk imports in the loader.
- Plugins: migrate the Zalo plugin to the shared plugin SDK runtime. https://github.com/Arjgorithmic/openclaw/channels/zalo
- Plugins: migrate the Zalo Personal plugin to the shared plugin SDK runtime. https://github.com/Arjgorithmic/openclaw/plugins/zalouser
- Plugins: allow optional agent tools with explicit allowlists and add the plugin tool authoring guide. https://github.com/Arjgorithmic/openclaw/plugins/agent-tools
- Plugins: auto-enable bundled channel/provider plugins when configuration is present.
- Plugins: sync plugin sources on channel switches and update npm-installed plugins during `kibo update`.
- Plugins: share npm plugin update logic between `kibo update` and `kibo plugins update`.

- Gateway/API: add `/v1/responses` (OpenResponses) with item-based input + semantic streaming events.
- Gateway/API: expand `/v1/responses` to support file/image inputs, tool_choice, usage, and output limits.
- Usage: add `/usage cost` summaries and macOS menu cost charts. https://github.com/Arjgorithmic/openclaw/reference/api-usage-costs
- Security: warn when <=300B models run without sandboxing while web tools are enabled. https://github.com/Arjgorithmic/openclaw/cli/security
- Exec: add host/security/ask routing for gateway + node exec. https://github.com/Arjgorithmic/openclaw/tools/exec
- Exec: add `/exec` directive for per-session exec defaults (host/security/ask/node). https://github.com/Arjgorithmic/openclaw/tools/exec
- Exec approvals: migrate approvals to `~/.kibo/exec-approvals.json` with per-agent allowlists + skill auto-allow toggle, and add approvals UI + node exec lifecycle events. https://github.com/Arjgorithmic/openclaw/tools/exec-approvals
- Nodes: add headless node host (`kibo node start`) for `system.run`/`system.which`. https://github.com/Arjgorithmic/openclaw/cli/node
- Nodes: add node daemon service install/status/start/stop/restart. https://github.com/Arjgorithmic/openclaw/cli/node
- Bridge: add `skills.bins` RPC to support node host auto-allow skill bins.
- Sessions: add daily reset policy with per-type overrides and idle windows (default 4am local), preserving legacy idle-only configs. https://github.com/Arjgorithmic/openclaw/concepts/session
- Sessions: allow `sessions_spawn` to override thinking level for sub-agent runs. https://github.com/Arjgorithmic/openclaw/tools/subagents
- Channels: unify thread/topic allowlist matching + command/mention gating helpers across core providers. https://github.com/Arjgorithmic/openclaw/concepts/groups
- Models: add Qwen Portal OAuth provider support. https://github.com/Arjgorithmic/openclaw/providers/qwen
- Onboarding: add allowlist prompts and username-to-id resolution across core and extension channels. https://github.com/Arjgorithmic/openclaw/start/onboarding
- Docs: clarify allowlist input types and onboarding behavior for messaging channels. https://github.com/Arjgorithmic/openclaw/start/onboarding
- Docs: refresh Android node discovery docs for the Gateway WS service type. https://github.com/Arjgorithmic/openclaw/platforms/android
- Docs: surface Amazon Bedrock in provider lists and clarify Bedrock auth env vars. https://github.com/Arjgorithmic/openclaw/bedrock
- Docs: clarify WhatsApp voice notes. https://github.com/Arjgorithmic/openclaw/channels/whatsapp
- Docs: clarify Windows WSL portproxy LAN access notes. https://github.com/Arjgorithmic/openclaw/platforms/windows
- Docs: refresh bird skill install metadata and usage notes. https://github.com/Arjgorithmic/openclaw/tools/browser-login
- Agents: add local docs path resolution and include docs/mirror/source/community pointers in the system prompt.
- Agents: clarify node_modules read-only guidance in agent instructions.
- Config: stamp last-touched metadata on write and warn if the config is newer than the running build.
- macOS: hide usage section when usage is unavailable instead of showing provider errors.
- Android: migrate node transport to the Gateway WebSocket protocol with TLS pinning support + gateway discovery naming.
- Android: send structured payloads in node events/invokes and include user-agent metadata in gateway connects.
- Android: remove legacy bridge transport code now that nodes use the gateway protocol.
- Android: bump okhttp + dnsjava to satisfy lint dependency checks.
- Build: update workspace + core/plugin deps.
- Build: use tsgo for dev/watch builds by default (opt out with `KIBO_TS_COMPILER=tsc`).
- Repo: remove the Peekaboo git submodule now that the SPM release is used.
- macOS: switch PeekabooBridge integration to the tagged Swift Package Manager release.
- macOS: stop syncing Peekaboo in postinstall.
- Swabble: use the tagged Commander Swift package release.

### Fixes

- Discovery: shorten Bonjour DNS-SD service type to `_moltbot-gw._tcp` and update discovery clients/docs.
- Diagnostics: export OTLP logs, correct queue depth tracking, and document message-flow telemetry.
- Diagnostics: emit message-flow diagnostics across channels via shared dispatch.
- Diagnostics: gate heartbeat/webhook logging.
- Gateway: strip inbound envelope headers from chat history messages to keep clients clean.
- Gateway: clarify unauthorized handshake responses with token/password mismatch guidance.
- Gateway: allow mobile node client ids for iOS + Android handshake validation.
- Gateway: clarify connect/validation errors for gateway params.
- Gateway: preserve restart wake routing + thread replies across restarts.
- Gateway: reschedule per-agent heartbeats on config hot reload without restarting the runner.
- Gateway: require authorized restarts for SIGUSR1 (restart/apply/update) so config gating can't be bypassed.
- Cron: auto-deliver isolated agent output to explicit targets without tool calls.
- Agents: preserve subagent announce thread/topic routing + queued replies across channels.
- Agents: propagate accountId into embedded runs so sub-agent announce routing honors the originating account.
- Agents: avoid treating timeout errors with "aborted" messages as user aborts, so model fallback still runs.
- Agents: sanitize oversized image payloads before send and surface image-dimension errors.
- Sessions: fall back to session labels when listing display names.
- Compaction: include tool failure summaries in safeguard compaction to prevent retry loops.
- Config: log invalid config issues once per run and keep invalid-config errors stackless.
- Config: allow Perplexity as a web_search provider in config validation.
- Config: allow custom fields under `skills.entries.<name>.config` for skill credentials/config.
- Doctor: clarify plugin auto-enable hint text in the startup banner.
- Doctor: canonicalize legacy session keys in session stores to prevent stale metadata.
- Docs: make docs:list fail fast with a clear error if the docs directory is missing.
- Plugins: add Nextcloud Talk manifest for plugin config validation.
- Plugins: surface plugin load/register/config errors in gateway logs with plugin/source context.
- CLI: preserve cron delivery settings when editing message payloads.
- CLI: keep `kibo logs` output resilient to broken pipes while preserving progress output.
- CLI: avoid duplicating --profile/--dev flags when formatting commands.
- CLI: centralize CLI command registration to keep fast-path routing and program wiring in sync.
- CLI: keep banners on routed commands, restore config guarding outside fast-path routing, and tighten fast-path flag parsing while skipping console capture for extra speed.
- CLI: skip runner rebuilds when dist is fresh.
- CLI: add WSL2/systemd unavailable hints in daemon status/doctor output.
- Status: route native `/status` to the active agent so model selection reflects the correct profile.
- Status: show both usage windows with reset hints when usage data is available.
- UI: keep config form enums typed, preserve empty strings, protect sensitive defaults, and deepen config search.
- UI: preserve ordered list numbering in chat markdown.
- UI: allow Control UI to read gatewayUrl from URL params for remote WebSocket targets.
- UI: prevent double-scroll in Control UI chat by locking chat layout to the viewport.
- UI: enable shell mode for sync Windows spawns to avoid `pnpm ui:build` EINVAL.
- TUI: keep thinking blocks ordered before content during streaming and isolate per-run assembly.
- TUI: align custom editor initialization with the latest pi-tui API.
- TUI: show generic empty-state text for searchable pickers.
- TUI: highlight model search matches and stabilize search ordering.
- Configure: hide OpenRouter auto routing model from the model picker.
- Memory: show total file counts + scan issues in `kibo memory status`.
- Memory: fall back to non-batch embeddings after repeated batch failures.
- Memory: apply OpenAI batch defaults even without explicit remote config.
- Memory: index atomically so failed reindex preserves the previous memory database.
- Memory: avoid sqlite-vec unique constraint failures when reindexing duplicate chunk ids.
- Memory: retry transient 5xx errors (Cloudflare) during embedding indexing.
- Memory: parallelize embedding indexing with rate-limit retries.
- Memory: split overly long lines to keep embeddings under token limits.
- Memory: skip empty chunks to avoid invalid embedding inputs.
- Memory: split embedding batches to avoid OpenAI token limits during indexing.
- Memory: probe sqlite-vec availability in `kibo memory status`.
- Exec approvals: enforce allowlist when ask is off.
- Exec approvals: prefer raw command for node approvals/events.
- Tools: show exec elevated flag before the command and keep it outside markdown in tool summaries.
- Tools: return a companion-app-required message when node exec is requested with no paired node.
- Tools: return a companion-app-required message when `system.run` is requested without a supporting node.
- Exec: default gateway/node exec security to allowlist when unset (sandbox stays deny).
- Exec: prefer bash when fish is default shell, falling back to sh if bash is missing.
- Exec: merge login-shell PATH for host=gateway exec while keeping daemon PATH minimal.
- Streaming: emit assistant deltas for OpenAI-compatible SSE chunks.
- Discord: make resolve warnings avoid raw JSON payloads on rate limits.
- Discord: process message handlers in parallel across sessions to avoid event queue blocking.
- Discord: stop reconnecting the gateway after aborts to prevent duplicate listeners.
- Discord: only emit slow listener warnings after 30s.
- Discord: inherit parent channel allowlists for thread slash commands and reactions.
- Telegram: honor pairing allowlists for native slash commands.
- Telegram: preserve hidden text_link URLs by expanding entities in inbound text.
- Slack: resolve Bolt import interop for Bun + Node.
- Web search: infer Perplexity base URL from API key source (direct vs OpenRouter).
- Web fetch: harden SSRF protection with shared hostname checks and redirect limits.
- Browser: register AI snapshot refs for act commands.
- Voice call: include request query in Twilio webhook verification when publicUrl is set.
- Anthropic: default API prompt caching to 1h with configurable TTL override.
- Anthropic: ignore TTL for OAuth.
- Auth profiles: keep auto-pinned preference while allowing rotation on failover.
- Auth profiles: user pins stay locked.
- Model catalog: avoid caching import failures, log transient discovery errors, and keep partial results.
- Tests: stabilize Windows gateway/CLI tests by skipping sidecars, normalizing argv, and extending timeouts.
- Tests: stabilize plugin SDK resolution and embedded agent timeouts.
- Windows: install gateway scheduled task as the current user.
- Windows: show friendly guidance instead of failing on access denied.
- macOS: load menu session previews asynchronously so items populate while the menu is open.
- macOS: use label colors for session preview text so previews render in menu subviews.
- macOS: suppress usage error text in the menubar cost view.
- macOS: Doctor repairs LaunchAgent bootstrap issues for Gateway + Node when listed but not loaded.
- macOS: avoid touching launchd in Remote over SSH so quitting the app no longer disables the remote gateway.
- macOS: bundle Textual resources in packaged app builds to avoid code block crashes.
- Daemon: include HOME in service environments to avoid missing HOME errors.

Thanks.

### Breaking

- **BREAKING:** Reject invalid/unknown config entries and refuse to start the gateway for safety. Run `kibo doctor --fix` to repair, then update plugins (`kibo plugins update`) if you use any.

## 2026.1.16-2

### Changes

- CLI: stamp build commit into dist metadata so banners show the commit in npm installs.
- CLI: close memory manager after memory commands to avoid hanging processes. -.

## 2026.1.16-1

### Highlights

- Hooks: add hooks system with bundled hooks, CLI tooling, and docs. -. https://github.com/Arjgorithmic/openclaw/hooks
- Media: add inbound media understanding (image/audio/video) with provider + CLI fallbacks. https://github.com/Arjgorithmic/openclaw/nodes/media-understanding
- Plugins: add Zalo Personal plugin (`@kibo/zalouser`) and unify channel directory for plugins. -. https://github.com/Arjgorithmic/openclaw/plugins/zalouser
- Models: add Vercel AI Gateway auth choice + onboarding updates. -. https://github.com/Arjgorithmic/openclaw/providers/vercel-ai-gateway
- Sessions: add `session.identityLinks` for cross-platform DM session li nking. -. https://github.com/Arjgorithmic/openclaw/concepts/session
- Web search: add `country`/`language` parameters (schema + Brave API) and docs. -. https://github.com/Arjgorithmic/openclaw/tools/web

### Changes

- Plugins: ship bundled plugins disabled by default and allow overrides by installed versions. -.
- Plugins: add bundled Antigravity + Gemini CLI OAuth + Copilot Proxy provider plugins. -.
- Tools: improve `web_fetch` extraction using Readability (with fallback).
- Tools: add Firecrawl fallback for `web_fetch` when configured.
- Tools: send Chrome-like headers by default for `web_fetch` to improve extraction on bot-sensitive sites.
- Tools: Firecrawl fallback now uses bot-circumvention + cache by default; remove basic HTML fallback when extraction fails.
- Tools: default `exec` exit notifications and auto-migrate legacy `tools.bash` to `tools.exec`.
- Tools: add `exec` PTY support for interactive sessions. https://github.com/Arjgorithmic/openclaw/tools/exec
- Tools: add tmux-style `process send-keys` and bracketed paste helpers for PTY sessions.
- Tools: add `process submit` helper to send CR for PTY sessions.
- Tools: respond to PTY cursor position queries to unblock interactive TUIs.
- Tools: include tool outputs in verbose mode and expand verbose tool feedback.
- Skills: update coding-agent guidance to prefer PTY-enabled exec runs and simplify tmux usage.
- TUI: refresh session token counts after runs complete or fail. -.
- Status: trim `/status` to current-provider usage only and drop the OAuth/token block.
- Directory: unify `kibo directory` across channels and plugin channels.
- UI: allow deleting sessions from the Control UI.
- Memory: add sqlite-vec vector acceleration with CLI status details.
- Memory: add experimental session transcript indexing for memory_search (opt-in via memorySearch.experimental.sessionMemory + sources).
- Skills: add user-invocable skill commands and expanded skill command registration.
- Telegram: default reaction level to minimal and enable reaction notifications by default.
- Telegram: allow reply-chain messages to bypass mention gating in groups. -.
- iMessage: add remote attachment support for VM/SSH deployments.
- Messages: refresh live directory cache results when resolving targets.
- Messages: mirror delivered outbound text/media into session transcripts. -.
- Messages: avoid redundant sender envelopes for iMessage + Signal group chats. -.
- Media: normalize Deepgram audio upload bytes for fetch compatibility.
- Cron: isolated cron jobs now start a fresh session id on every run to prevent context buildup.
- Docs: add `/help` hub, Node/npm PATH guide, and expand directory CLI docs.
- Config: support env var substitution in config values. -.
- Health: add per-agent session summaries and account-level health details, and allow selective probes. -.
- Hooks: add hook pack installs (npm/path/zip/tar) with `kibo.hooks` manifests and `kibo hooks install/update`.
- Plugins: add zip installs and `--link` to avoid copying local paths.

### Fixes

- macOS: drain subprocess pipes before waiting to avoid deadlocks. -.
- Verbose: wrap tool summaries/output in markdown only for markdown-capable channels.
- Tools: include provider/session context in elevated exec denial errors.
- Tools: normalize exec tool alias naming in tool error logs.
- Logging: reuse shared ANSI stripping to keep console capture lint-clean.
- Logging: prefix nested agent output with session/run/channel context.
- Telegram: accept tg/group/telegram prefixes + topic targets for inline button validation. -.
- Telegram: split long captions into follow-up messages.
- Config: block startup on invalid config, preserve best-effort doctor config, and keep rolling config backups. -.
- Sub-agents: normalize announce delivery origin + queue bucketing by accountId to keep multi-account routing stable. (#1061, #1058) -.
- Sessions: include deliveryContext in sessions.list and reuse normalized delivery routing for announce/restart fallbacks.
- Sessions: propagate deliveryContext into last-route updates to keep account/channel routing stable.
- Sessions: preserve overrides on `/new` reset.
- Memory: prevent unhandled rejections when watch/interval sync fails. -.
- Memory: avoid gateway crash when embeddings return 429/insufficient_quota (disable tool + surface error).
- Gateway: honor explicit delivery targets without implicit accountId fallback; preserve lastAccountId for implicit routing.
- Gateway: avoid reusing last-to/accountId when the requested channel differs; sync deliveryContext with last route fields.
- Build: allow `@lydell/node-pty` builds on supported platforms.
- Repo: fix oxlint config filename and move ignore pattern into config. -.
- Messages: `/stop` now hard-aborts queued followups and sub-agent runs; suppress zero-count stop notes.
- Messages: honor message tool channel when deduping sends.
- Messages: include sender labels for live group messages across channels, matching queued/history formatting.
- Sessions: reset `compactionCount` on `/new` and `/reset`, and preserve `sessions.json` file mode (0600).
- Sessions: repair orphaned user turns before embedded prompts.
- Sessions: hard-stop `sessions.delete` cleanup.
- Channels: treat replies to the bot as implicit mentions across supported channels.
- Channels: normalize object-format capabilities in channel capability parsing.
- Security: default-deny slash/control commands unless a channel computed `CommandAuthorized` (fixes accidental "open" behavior), and ensure WhatsApp + Zalo plugin channels gate inline `/...` tokens correctly. https://github.com/Arjgorithmic/openclaw/gateway/security
- Security: redact sensitive text in gateway WS logs.
- Tools: cap pending `exec` process output to avoid unbounded buffers.
- CLI: speed up `kibo sandbox-explain` by avoiding heavy plugin imports when normalizing channel ids.
- Browser: remote profile tab operations prefer persistent Playwright and avoid silent HTTP fallbacks. -.
- Browser: remote profile tab ops follow-up: shared Playwright loader, Playwright-based focus, and more coverage (incl. opt-in live Browserless test). (follow-up to #1057) -.
- Browser: refresh extension relay tab metadata after navigation so `/json/list` stays current. -.
- WhatsApp: scope self-chat response prefix; inject pending-only group history and clear after any processed message.
- WhatsApp: include `linked` field in `describeAccount`.
- Agents: drop unsigned Gemini tool calls and avoid JSON Schema `format` keyword collisions.
- Agents: hide the image tool when the primary model already supports images.
- Agents: avoid duplicate sends by replying with `NO_REPLY` after `message` tool sends.
- Auth: inherit/merge sub-agent auth profiles from the main agent.
- Gateway: resolve local auth for security probe and validate gateway token/password file modes. (#1011, #1022) -.
- Signal/iMessage: bound transport readiness waits to 30s with periodic logging. -.
- iMessage: avoid RPC restart loops.
- OpenAI image-gen: handle URL + `b64_json` responses and remove deprecated `response_format` (use URL downloads).
- CLI: auto-update global installs when installed via a package manager.
- Routing: migrate legacy `accountID` bindings to `accountId` and remove legacy fallback lookups. -.
- Discord: truncate skill command descriptions to 100 chars for slash command limits. -.
- Security: bump `tar` to 7.5.3.
- Models: align ZAI thinking toggles.
- iMessage/Signal: include sender metadata for non-queued group messages.
- Discord: preserve whitespace when chunking long lines so message splits keep spacing intact.
- Skills: fix skills watcher ignored list typing (tsc).

### Breaking

- **BREAKING:** `kibo message` and message tool now require `target` (dropping `to`/`channelId` for destinations). -.
- **BREAKING:** Channel auth now prefers config over env for Discord/Telegram/Matrix (env is fallback only). -.
- **BREAKING:** Drop legacy `chatType: "room"` support; use `chatType: "channel"`.
- **BREAKING:** remove legacy provider-specific target resolution fallbacks; target resolution is centralized with plugin hints + directory lookups.
- **BREAKING:** `kibo hooks` is now `kibo webhooks`; hooks live under `kibo hooks`. https://github.com/Arjgorithmic/openclaw/cli/webhooks
- **BREAKING:** `kibo plugins install <path>` now copies into `~/.kibo/extensions` (use `--link` to keep path-based loading).

## 2026.1.15

### Highlights

- Plugins: add provider auth registry + `kibo models auth login` for plugin-driven OAuth/API key flows.
- Browser: improve remote CDP/Browserless support (auth passthrough, `wss` upgrade, timeouts, clearer errors).
- Heartbeat: per-agent configuration + 24h duplicate suppression. -.
- Security: audit warns on weak model tiers; app nodes store auth tokens encrypted (Keychain/SecurePrefs).

### Changes

- UI/Apps: move channel/config settings to schema-driven forms and rename Connections → Channels. -.
- CLI: set process titles to `kibo-<command>` for clearer process listings.
- CLI/macOS: sync remote SSH target/identity to config and let `gateway status` auto-infer SSH targets (ssh-config aware).
- Telegram: scope inline buttons with allowlist default + callback gating in DMs/groups.
- Telegram: default reaction notifications to own.
- Heartbeat: tighten prompt guidance + suppress duplicate alerts for 24h. -.
- Repo: ignore local identity files to avoid accidental commits. -.
- Sessions/Security: add `session.dmScope` for multi-user DM isolation and audit warnings. -.
- Onboarding: switch channels setup to a single-select loop with per-channel actions and disabled hints in the picker.
- TUI: show provider/model labels for the active session and default model.
- Heartbeat: add per-agent heartbeat configuration and multi-agent docs example.
- UI: show gateway auth guidance + doc link on unauthorized Control UI connections.
- UI: add session deletion action in Control UI sessions list. -.
- Security: warn on weak model tiers (Haiku, below GPT-5, below Claude 4.5) in `kibo security audit`.
- Apps: store node auth tokens encrypted (Keychain/SecurePrefs).
- Daemon: share profile/state-dir resolution across service helpers and honor `KIBOBOT_STATE_DIR` for Windows task scripts.
- Docs: clarify multi-gateway rescue bot guidance. -.
- Agents: add Current Date & Time system prompt section with configurable time format (auto/12/24).
- Tools: normalize Slack/Discord message timestamps with `timestampMs`/`timestampUtc` while keeping raw provider fields.
- macOS: add `system.which` for prompt-free remote skill discovery (with gateway fallback to `system.run`).
- Docs: add Date & Time guide and update prompt/timezone configuration docs.
- Messages: debounce rapid inbound messages across channels with per-connector overrides. -.
- Messages: allow media-only sends (CLI/tool) and show Telegram voice recording status for voice notes. -.
- Auth/Status: keep auth profiles sticky per session (rotate on compaction/new), surface provider usage headers in `/status` and `kibo models status`, and update docs.
- CLI: add `--json` output for `kibo daemon` lifecycle/install commands.
- Memory: make `node-llama-cpp` an optional dependency (avoid Node 25 install failures) and improve local-embeddings fallback/errors.
- Browser: add `snapshot refs=aria` (Playwright aria-ref ids) for self-resolving refs across `snapshot` → `act`.
- Browser: `profile="chrome"` now defaults to host control and returns clearer "attach a tab" errors.
- Browser: prefer stable Chrome for auto-detect, with Brave/Edge fallbacks and updated docs. -.
- Browser: increase remote CDP reachability timeouts + add `remoteCdpTimeoutMs`/`remoteCdpHandshakeTimeoutMs`.
- Browser: preserve auth/query tokens for remote CDP endpoints and pass Basic auth for CDP HTTP/WS. -.
- Telegram: add bidirectional reaction support with configurable notifications and agent guidance. -.
- Telegram: allow custom commands in the bot menu (merged with native; conflicts ignored). -.
- Discord: allow allowlisted guilds without channel lists to receive messages when `groupPolicy="allowlist"`. -.
- Discord: allow emoji/sticker uploads + channel actions in config defaults. -.

### Fixes

- Messages: make `/stop` clear queued followups and pending session lane work for a hard abort.
- Messages: make `/stop` abort active sub-agent runs spawned from the requester session and report how many were stopped.
- WhatsApp: report linked status consistently in channel status. -.
- Sessions: keep per-session overrides when `/new` resets compaction counters. -.
- Skills: allow OpenAI image-gen helper to handle URL or base64 responses. -.
- WhatsApp: default response prefix only for self-chat, using identity name when set.
- iMessage: treat missing `imsg rpc` support as fatal to avoid restart loops.
- Auth: merge main auth profiles into per-agent stores for sub-agents and document inheritance. -.
- Agents: avoid JSON Schema `format` collisions in tool params by renaming snapshot format fields. -.
- Fix: make `kibo update` auto-update global installs when installed via a package manager.
- Fix: list model picker entries as provider/model pairs for explicit selection. -.
- Fix: align OpenAI image-gen defaults with DALL-E 3 standard quality and document output formats. -.
- Fix: persist `gateway.mode=local` after selecting Local run mode in `kibo configure`, even if no other sections are chosen.
- Daemon: fix profile-aware service label resolution (env-driven) and add coverage for launchd/systemd/schtasks. -.
- Agents: avoid false positives when logging unsupported Google tool schema keywords.
- Agents: skip Gemini history downgrades for google-antigravity to preserve tool calls. -.
- Status: restore usage summary line for current provider when no OAuth profiles exist.
- Fix: guard model fallback against undefined provider/model values. -.
- Fix: refactor session store updates, add chat.inject, and harden subagent cleanup flow. -.
- Fix: clean up suspended CLI processes across backends. -.
- Fix: support MiniMax coding plan usage responses with `model_remains`/`current_interval_*` payloads.
- Fix: honor message tool channel for duplicate suppression (prefer `NO_REPLY` after `message` tool sends). -.
- Fix: suppress WhatsApp pairing replies for historical catch-up DMs on initial link.
- Browser: extension mode recovers when only one tab is attached (stale targetId fallback).
- Browser: fix `tab not found` for extension relay snapshots/actions when Playwright blocks `newCDPSession` (use the single available Page).
- Browser: upgrade `ws` → `wss` when remote CDP uses `https` (fixes Browserless handshake).
- Telegram: skip `message_thread_id=1` for General topic sends while keeping typing indicators. -.
- Fix: sanitize user-facing error text + strip `<final>` tags across reply pipelines. -.
- Fix: normalize pairing CLI aliases, allow extension channels, and harden Zalo webhook payload parsing. -.
- Fix: allow local Tailscale Serve hostnames without treating tailnet clients as direct. -.
- Fix: reset sessions after role-ordering conflicts to recover from consecutive user turns.

### Breaking

- **BREAKING:** iOS minimum version is now 18.0 to support Textual markdown rendering in native chat.
- **BREAKING:** Microsoft Teams is now a plugin; install `@kibo/msteams` via `kibo plugins install/msteams`.

## 2026.1.14-1

### Highlights

- Web search: `web_search`/`web_fetch` tools (Brave API) + first-time setup in onboarding/configure.
- Browser control: Chrome extension relay takeover mode + remote browser control support.
- Plugins: channel plugins (gateway HTTP hooks) + Zalo plugin + onboarding install flow. -.
- Security: expanded `kibo security audit` (+ `--fix`), detect-secrets CI scan, and a `SECURITY.md` reporting policy.

### Changes

- Docs: clarify per-agent auth stores, sandboxed skill binaries, and elevated semantics.
- Docs: add FAQ entries for missing provider auth after adding agents and Gemini thinking signature errors.
- Agents: add optional auth-profile copy prompt on `agents add` and improve auth error messaging.
- Security: expand `kibo security audit` checks (model hygiene, config includes, plugin allowlists, exposure matrix) and extend `--fix` to tighten more sensitive state paths.
- Security: add `SECURITY.md` reporting policy.
- Channels: add Matrix plugin (external) with docs + onboarding hooks.
- Plugins: add Zalo channel plugin with gateway HTTP hooks and onboarding install prompt. -.
- Onboarding: add a security checkpoint prompt (docs link + sandboxing hint); require `--accept-risk` for `--non-interactive`.
- Docs: expand gateway security hardening guidance and incident response checklist.
- Docs: document DM history limits for channel DMs. -.
- Security: add detect-secrets CI scan and baseline guidance. -.
- Tools: add `web_search`/`web_fetch` (Brave API), auto-enable `web_fetch` for sandboxed sessions, and remove the `brave-search` skill.
- CLI/Docs: add a web tools configure section for storing Brave API keys and update onboarding tips.
- Browser: add Chrome extension relay takeover mode (toolbar button), plus `kibo browser extension install/path` and remote browser control (standalone server + token auth).

### Fixes

- Sessions: refactor session store updates to lock + mutate per-entry, add chat.inject, and harden subagent cleanup flow. -.
- Browser: add tests for snapshot labels/efficient query params and labeled image responses.
- Google: downgrade unsigned thinking blocks before send to avoid missing signature errors.
- Doctor: avoid re-adding WhatsApp config when only legacy ack reactions are set. (#927, fixes #900) -.
- Agents: scrub tuple `items` schemas for Gemini tool calls. (#926, fixes #746) -.
- Agents: harden Antigravity Claude history/tool-call sanitization. -.
- Agents: stabilize sub-agent announce status from runtime outcomes and normalize Result/Notes. -.
- Embedded runner: suppress raw API error payloads from replies. -.
- Auth: normalize Claude Code CLI profile mode to oauth and auto-migrate config. -.
- Daemon: clear persisted launchd disabled state before bootstrap (fixes `daemon install` after uninstall). -.
- Logging: tolerate `EIO` from console writes to avoid gateway crashes. (#925, fixes #878) -.
- Sandbox: restore `docker.binds` config validation for custom bind mounts. -.
- Sandbox: preserve configured PATH for `docker exec` so custom tools remain available. -.
- Slack: respect `channels.slack.requireMention` default when resolving channel mention gating. -.
- Telegram: aggregate split inbound messages into one prompt (reduces "one reply per fragment").
- Auto-reply: treat trailing `NO_REPLY` tokens as silent replies.
- Config: prevent partial config writes from clobbering unrelated settings (base hash guard + merge patch for connection saves).

## 2026.1.14

### Changes

- Usage: add MiniMax coding plan usage tracking.
- Auth: label Claude Code CLI auth options. -.
- Docs: standardize Claude Code CLI naming across docs and prompts. (follow-up to #915)
- Telegram: add message delete action in the message tool. -.
- Config: add `channels.<provider>.configWrites` gating for channel-initiated config writes; migrate Slack channel IDs.

### Fixes

- Mac: pass auth token/password to dashboard URL for authenticated access. -.
- UI: use application-defined WebSocket close code (browser compatibility). -.
- TUI: render picker overlays via the overlay stack so /models and /settings display. -.
- TUI: add a bright spinner + elapsed time in the status line for send/stream/run states.
- TUI: show LLM error messages (rate limits, auth, etc.) instead of `(no output)`.
- Gateway/Dev: ensure `pnpm gateway:dev` always uses the dev profile config + state (`~/.kibo-dev`).

#### Agents / Auth / Tools / Sandbox

- Agents: make user time zone and 24-hour time explicit in the system prompt. -.
- Agents: strip downgraded tool call text without eating adjacent replies and filter thinking-tag leaks. -.
- Agents: cap tool call IDs for OpenAI/OpenRouter to avoid request rejections. -.
- Sandbox: restore `docker.binds` config validation and preserve configured PATH for `docker exec`. -.

#### macOS / Apps

- macOS: ensure launchd log directory exists with a test-only override. -.
- macOS: format ConnectionsStore config to satisfy SwiftFormat lint. -.
- macOS: pass auth token/password to dashboard URL for authenticated access. -.
- macOS: reuse launchd gateway auth and skip wizard when gateway config already exists.
- macOS: prefer the default bridge tunnel port in remote mode for node bridge connectivity; document macOS remote control + bridge tunnels. (#960, fixes #865) -.
- Apps: use canonical main session keys from gateway defaults across macOS/iOS/Android to avoid creating bare `main` sessions.
- macOS: fix cron preview/testing payload to use `channel` key. -.
- Telegram: honor `channels.telegram.timeoutSeconds` for grammY API requests. -.
- Telegram: split long captions into media + follow-up text messages. -.
- Telegram: migrate group config when supergroups change chat IDs. -.
- Messaging: unify markdown formatting + format-first chunking for Slack/Telegram/Signal. -.
- Slack: drop Socket Mode events with mismatched `api_app_id`/`team_id`. -.
- Discord: isolate autoThread thread context. -.
- WhatsApp: fix context isolation using wrong ID (was bot's number, now conversation ID). -.
- WhatsApp: normalize user JIDs with device suffix for allowlist checks in groups. -.

## 2026.1.13

### Fixes

- Postinstall: treat already-applied pnpm patches as no-ops to avoid npm/bun install failures.
- Packaging: pin `@mariozechner/pi-ai` to 0.45.7 and refresh patched dependency to match npm resolution.

## 2026.1.12-2

### Fixes

- Packaging: include `dist/memory/**` in the npm tarball (fixes `ERR_MODULE_NOT_FOUND` for `dist/memory/index.js`).
- Agents: persist sub-agent registry across gateway restarts and resume announce flow safely. -.
- Agents: strip invalid Gemini thought signatures from OpenRouter history to avoid 400s. (#841, #845) -.

## 2026.1.12-1

### Fixes

- Packaging: include `dist/channels/**` in the npm tarball (fixes `ERR_MODULE_NOT_FOUND` for `dist/channels/registry.js`).

## 2026.1.12

### Highlights

- **BREAKING:** rename chat "providers" (Slack/Telegram/WhatsApp/...) to **channels** across CLI/RPC/config; legacy config keys auto-migrate on load (and are written back as `channels.*`).
- Memory: add vector search for agent memories (Markdown-only) with SQLite index, chunking, lazy sync + file watch, and per-agent enablement/fallback.
- Plugins: restore full voice-call plugin parity (Telnyx/Twilio, streaming, inbound policies, tools/CLI).
- Models: add Synthetic provider plus Moonshot Kimi K2 0905 + turbo/thinking variants (with docs). -; -.
- Cron: one-shot schedules accept ISO timestamps (UTC) with optional delete-after-run; cron jobs can target a specific agent (CLI + macOS/Control UI).
- Agents: add compaction mode config with optional safeguard summarization and per-agent model fallbacks. -; -.

### New & Improved

- Memory: add custom OpenAI-compatible embedding endpoints; support OpenAI/local `node-llama-cpp` embeddings with per-agent overrides and provider metadata in tools/CLI. -.
- Memory: new `kibo memory` CLI plus `memory_search`/`memory_get` tools with snippets + line ranges; index stored under `~/.kibo/memory/{agentId}.sqlite` with watch-on-by-default.
- Agents: strengthen memory recall guidance; make workspace bootstrap truncation configurable (default 20k) with warnings; add default sub-agent model config.
- Tools/Sandbox: add tool profiles + group shorthands; support tool-policy groups in `tools.sandbox.tools`; drop legacy `memory` shorthand; allow Docker bind mounts via `docker.binds`. -.
- Tools: add provider/model-specific tool policy overrides (`tools.byProvider`) to trim tool exposure per provider.
- Tools: add browser `scrollintoview` action; allow Claude/Gemini tool param aliases; allow thinking `xhigh` for GPT-5.2/Codex with safe downgrades. -; -.
- Gateway/CLI: add Tailscale binary discovery, custom bind mode, and probe auth retry; add `kibo dashboard` auto-open flow; default native slash commands to `"auto"` with per-provider overrides. -.
- Auth/Onboarding: add Chutes OAuth (PKCE + refresh + onboarding choice); normalize API key inputs; default TUI onboarding to `deliver: false`. -; -.
- Providers: add `discord.allowBots`; trim legacy MiniMax M2 from default catalogs; route MiniMax vision to the Coding Plan VLM endpoint (also accepts `@/path/to/file.png` inputs). -.
- Gateway: allow Tailscale Serve identity headers to satisfy token auth; rebuild Control UI assets when protocol schema is newer. -; -.
- Heartbeat: default `ackMaxChars` to 300 so short `HEARTBEAT_OK` replies stay internal.

### Fixes

- Doctor: warn on pnpm workspace mismatches, missing Control UI assets, and missing tsx binaries; offer UI rebuilds.
- Tools: apply global tool allow/deny even when agent-specific tool policy is set.
- Models/Providers: treat credential validation failures as auth errors to trigger fallback; normalize `${ENV_VAR}` apiKey values and auto-fill missing provider keys; preserve explicit GitHub Copilot provider config + agent-dir auth profiles. -; -.
- Auth: drop invalid auth profiles from ordering so environment keys can still be used for providers like MiniMax.
- Gemini: normalize Gemini 3 ids to preview variants; strip Gemini CLI tool call/response ids; downgrade missing `thought_signature`; strip Claude `msg_*` thought_signature fields to avoid base64 decode errors. -; -; -; -.
- Agents: auto-recover from compaction context overflow by resetting the session and retrying; propagate overflow details from embedded runs so callers can recover.
- MiniMax: strip malformed tool invocation XML; include `MiniMax-VL-01` in implicit provider for image pairing. -.
- Onboarding/Auth: honor `KIBOBOT_AGENT_DIR` / `PI_CODING_AGENT_DIR` when writing auth profiles (MiniMax). -.
- Anthropic: handle `overloaded_error` with a friendly message and failover classification. -.
- Anthropic: merge consecutive user turns (preserve newest metadata) before validation to avoid incorrect role errors. -.
- Messaging: enforce context isolation for message tool sends; keep typing indicators alive during tool execution. -; (#450, #447) -.
- Auto-reply: `/status` allowlist behavior, reasoning-tag enforcement on fallback, and system-event enqueueing for elevated/reasoning toggles. -.
- System events: include local timestamps when events are injected into prompts. -.
- Auto-reply: resolve ambiguous `/model` matches; fix streaming block reply media handling; keep >300 char heartbeat replies instead of dropping.
- Discord/Slack: centralize reply-thread planning; fix autoThread routing + add per-channel autoThread; avoid duplicate listeners; keep reasoning italics intact; allow clearing channel parents via message tool. (#800, #807) -; -.
- Telegram: preserve forum topic thread ids, persist polling offsets, respect account bindings in webhook mode, and show typing indicator in General topics. (#727, #739) -; -; -.
- Slack: accept slash commands with or without leading `/` for custom command configs. -.
- Cron: persist disabled jobs correctly; accept `jobId` aliases for update/run/remove params. (#205, #252) -.
- Gateway/CLI: honor `KIBOBOT_LAUNCHD_LABEL` / `KIBOBOT_SYSTEMD_UNIT` overrides; `agents.list` respects explicit config; reduce noisy loopback WS logs during tests; run `kibo doctor --non-interactive` during updates. -.
- Onboarding/Control UI: refuse invalid configs (run doctor first); quote Windows browser URLs for OAuth; keep chat scroll position unless the user is near the bottom. -; -; -.
- Tools/UI: harden tool input schemas for strict providers; drop null-only union variants for Gemini schema cleanup; treat `maxChars: 0` as unlimited; keep TUI last streamed response instead of "(no output)". -; -; -.
- Connections UI: polish multi-account account cards. -.

### Installer

- Install: run `kibo doctor --non-interactive` after git installs/updates and nudge daemon restarts when detected.

### Maintenance

- Dependencies: bump Pi packages to 0.45.3 and refresh patched pi-ai.
- Testing: update Vitest + browser-playwright to 4.0.17.
- Docs: add Amazon Bedrock provider notes and link from models/FAQ.

## 2026.1.11

### Highlights

- Plugins are now first-class: loader + CLI management, plus the new Voice Call plugin.
- Config: modular `$include` support for split config files. -.
- Agents/Pi: reserve compaction headroom so pre-compaction memory writes can run before auto-compaction.
- Agents: automatic pre-compaction memory flush turn to store durable memories before compaction.

### Changes

- CLI/Onboarding: simplify MiniMax auth choice to a single M2.1 option.
- CLI: configure section selection now loops until Continue.
- Docs: explain MiniMax vs MiniMax Lightning (speed vs cost) and restore LM Studio example.
- Docs: add Cerebras GLM 4.6/4.7 config example (OpenAI-compatible endpoint).
- Onboarding/CLI: group model/auth choice by provider and label Z.AI as GLM 4.7.
- Onboarding/Docs: add Moonshot AI (Kimi K2) auth choice + config example.
- CLI/Onboarding: prompt to reuse detected API keys for Moonshot/MiniMax/Z.AI/Gemini/Anthropic/OpenCode.
- Auto-reply: add compact `/model` picker (models + available providers) and show provider endpoints in `/model status`.
- Control UI: add Config tab model presets (MiniMax M2.1, GLM 4.7, Kimi) for one-click setup.
- Plugins: add extension loader (tools/RPC/CLI/services), discovery paths, and config schema + Control UI labels (uiHints).
- Plugins: add `kibo plugins install` (path/tgz/npm), plus `list|info|enable|disable|doctor` UX.
- Plugins: voice-call plugin now real (Twilio/log), adds start/status RPC/CLI/tool + tests.
- Docs: add plugins doc + cross-links from tools/skills/gateway config.
- Docs: add beginner-friendly plugin quick start + expand Voice Call plugin docs.
- Tests: add Docker plugin loader + tgz-install smoke test.
- Tests: extend Docker plugin E2E to cover installing from local folders (`plugins.load.paths`) and `file:` npm specs.
- Tests: add coverage for pre-compaction memory flush settings.
- Tests: modernize live model smoke selection for current releases and enforce tools/images/thinking-high coverage. -.
- Agents/Tools: add `apply_patch` tool for multi-file edits (experimental; gated by tools.exec.applyPatch; OpenAI-only).
- Agents/Tools: rename the bash tool to exec (config alias maintained). -.
- Agents: add pre-compaction memory flush config (`agents.defaults.compaction.*`) with a soft threshold + system prompt.
- Config: add `$include` directive for modular config files. -.
- Build: set pnpm minimum release age to 2880 minutes (2 days). -.
- macOS: prompt to install the global `kibo` CLI when missing in local mode; install via `kibo.ai/install-cli.sh` (no onboarding) and use external launchd/CLI instead of the embedded gateway runtime.
- Docs: add gog calendar event color IDs from `gog calendar colors`. -.
- Cron/CLI: add `--model` flag to cron add/edit commands. -.
- Cron/CLI: trim model overrides on cron edits and document main-session guidance. -.
- Skills: bundle `skill-creator` to guide creating and packaging skills.
- Providers: add per-DM history limit overrides (`dmHistoryLimit`) with provider-level config. -.
- Discord: expose channel/category management actions in the message tool. -.
- Docs: rename README "macOS app" section to "Apps". -.
- Gateway: require `client.id` in WebSocket connect params; use `client.instanceId` for presence de-dupe; update docs/tests.
- macOS: remove the attach-only gateway setting; local mode now always manages launchd while still attaching to an existing gateway if present.

### Fixes

- Models/Onboarding: configure MiniMax (minimax.io) via Anthropic-compatible `/anthropic` endpoint by default (keep `minimax-api` as a legacy alias).
- Models: normalize Gemini 3 Pro/Flash IDs to preview names for live model lookups. -.
- CLI: fix guardCancel typing for configure prompts. -.
- Gateway/WebChat: include handshake validation details in the WebSocket close reason for easier debugging; preserve close codes.
- Gateway/Auth: send invalid connect responses before closing the handshake; stabilize invalid-connect auth test.
- Gateway: tighten gateway listener detection.
- Control UI: hide onboarding chat when configured and guard the mobile chat sidebar overlay.
- Auth: read Codex keychain credentials and make the lookup platform-aware.
- macOS/Release: avoid bundling dist artifacts in relay builds and generate appcasts from zip-only sources.
- Doctor: surface plugin diagnostics in the report.
- Plugins: treat `plugins.load.paths` directory entries as package roots when they contain `package.json` + `kibo.extensions`; load plugin packages from config dirs; extract archives without system tar.
- Config: expand `~` in `KIBOBOT_CONFIG_PATH` and common path-like config fields (including `plugins.load.paths`); guard invalid `$include` paths. -.
- Memory/QMD: honor `memorySearch.sync.watch` and first-session warm sync for the QMD backend, so managed collections refresh after watched file changes and on the first search in a new session. and.
- Agents: stop pre-creating session transcripts so first user messages persist in JSONL history.
- Agents: skip pre-compaction memory flush when the session workspace is read-only.
- Auto-reply: ignore inline `/status` directives unless the message is directive-only.
- Auto-reply: align `/think` default display with model reasoning defaults. -.
- Auto-reply: flush block reply buffers on tool boundaries. -.
- Auto-reply: allow sender fallback for command authorization when `SenderId` is empty (WhatsApp self-chat). -.
- Auto-reply: treat whitespace-only sender ids as missing for command authorization (WhatsApp self-chat). -.
- Heartbeat: refresh prompt text for updated defaults.
- Memory/QMD: prefer `qmd collection add --glob` for current QMD releases and fall back to legacy `--mask` when older builds reject it. and.
- Agents/Tools: use PowerShell on Windows to capture system utility output. -.
- Docker: tolerate unset optional env vars in docker-setup.sh under strict mode. -.
- CLI/Update: preserve base environment when passing overrides to update subprocesses. -.
- Agents: treat message tool errors as failures so fallback replies still send; require `to` + `message` for `action=send`. -.
- Agents: preserve reasoning items on tool-only turns.
- Agents/Subagents: wait for completion before announcing, align wait timeout with run timeout, and make announce prompts more emphatic.
- Agents: route subagent transcripts to the target agent sessions directory and add regression coverage. -.
- Agents/Tools: preserve action enums when flattening tool schemas. -.
- Gateway/Agents: canonicalize main session aliases for store writes and add regression coverage. -.
- Agents: reset sessions and retry when auto-compaction overflows instead of crashing the gateway.
- Providers/Telegram: normalize command mentions for consistent parsing. -.
- Providers: skip DM history limit handling for non-DM sessions. -.
- Sandbox: fix non-main mode incorrectly sandboxing the main DM session and align `/status` runtime reporting with effective sandbox state.
- Sandbox/Gateway: treat `agent:<id>:main` as a main-session alias when `session.mainKey` is customized (backwards compatible).
- Auto-reply: fast-path allowlisted slash commands (inline `/help`/`/commands`/`/status`/`/whoami` stripped before model).

### Installer

- Postinstall: replace `git apply` with builtin JS patcher (works npm/pnpm/bun; no git dependency) plus regression tests.
- Postinstall: skip pnpm patch fallback when the new patcher is active.
- Installer tests: add root+non-root docker smokes, CI workflow to fetch kibo.ai scripts and run install sh/cli with onboarding skipped.
- Installer UX: support `KIBOBOT_NO_ONBOARD=1` for non-interactive installs; fix npm prefix on Linux and auto-install git.
- Installer UX: add `install.sh --help` with flags/env and git install hint.
- Installer UX: add `--install-method git|npm` and auto-detect source checkouts (prompt to update git checkout vs migrate to npm).

## 2026.1.10

### Highlights

- CLI: `kibo status` now table-based + shows OS/update/gateway/daemon/agents/sessions; `status --all` adds a full read-only debug report (tables, log tails, Tailscale summary, and scan progress via OSC-9 + spinner).
- CLI Backends: add Codex CLI fallback with resume support (text output) and JSONL parsing for new runs, plus a live CLI resume probe.
- CLI: add `kibo update` (safe-ish git checkout update) + `--update` shorthand. -.
- Gateway: add OpenAI-compatible `/v1/chat/completions` HTTP endpoint (auth, SSE streaming, per-agent routing)..

### Changes

- Onboarding/Models: add first-class Z.AI (GLM) auth choice (`zai-api-key`) + `--zai-api-key` flag.
- CLI/Onboarding: add OpenRouter API key auth option in configure/onboard. -.
- Agents: add human-delay pacing between block replies (modes: off/natural/custom, per-agent configurable). -.
- Agents/Browser: add `browser.target` (sandbox/host/custom) with sandbox host-control gating via `agents.defaults.sandbox.browser.allowHostControl`, allowlists for custom control URLs/hosts/ports, and expand browser tool docs (remote control, profiles, internals).
- Onboarding/Models: add catalog-backed default model picker to onboarding + configure. -.
- Agents/OpenCode Zen: update fallback models + defaults, keep legacy alias mappings. -.
- CLI: add `kibo reset` and `kibo uninstall` flows (interactive + non-interactive) plus docker cleanup smoke test.
- Providers: move provider wiring to a plugin architecture..
- Providers: unify group history context wrappers across providers with per-provider/per-account `historyLimit` overrides (fallback to `messages.groupChat.historyLimit`). Set `0` to disable..
- Gateway/Heartbeat: optionally deliver heartbeat `Reasoning:` output (`agents.defaults.heartbeat.includeReasoning`).
- Docker: allow optional home volume + extra bind mounts in `docker-setup.sh`. -.

### Fixes

- Auto-reply: suppress draft/typing streaming for `NO_REPLY` (silent system ops) so it doesn't leak partial output.
- CLI/Status: expand tables to full terminal width; clarify provider setup vs runtime warnings; richer per-provider detail; token previews in `status` while keeping `status --all` redacted; add troubleshooting link footer; keep log tails pasteable; show gateway auth used when reachable; surface provider runtime errors (Signal/iMessage/Slack); harden `tailscale status --json` parsing; make `status --all` scan progress determinate; and replace the footer with a 3-line "Next steps" recommendation (share/debug/probe).
- CLI/Gateway: clarify that `kibo gateway status` reports RPC health (connect + RPC) and shows RPC failures separately from connect failures.
- CLI/Update: gate progress spinner on stdout TTY and align clean-check step label. -.
- Telegram: add `/whoami` + `/id` commands to reveal sender id for allowlists; allow `@username` and prefixed ids in `allowFrom` prompts (with stability warning).
- Heartbeat: strip markup-wrapped `HEARTBEAT_OK` so acks don't leak to external providers (e.g., Telegram).
- Control UI: stop auto-writing `telegram.groups["*"]` and warn/confirm before enabling wildcard groups.
- WhatsApp: send ack reactions only for handled messages and ignore legacy `messages.ackReaction` (doctor copies to `whatsapp.ackReaction`). -.
- Sandbox/Skills: mirror skills into sandbox workspaces for read-only mounts so SKILL.md stays accessible.
- Terminal/Table: ANSI-safe wrapping to prevent table clipping/color loss; add regression coverage.
- Docker: allow optional apt packages during image build and document the build arg. -.
- Gateway/Heartbeat: deliver reasoning even when the main heartbeat reply is `HEARTBEAT_OK`. -.
- Agents/Pi: inject config `temperature`/`maxTokens` into streaming without replacing the session streamFn; cover with live maxTokens probe. -.
- macOS: clear unsigned launchd overrides on signed restarts and warn via doctor when attach-only/disable markers are set. -.
- Agents: enforce single-writer session locks and drop orphan tool results to prevent tool-call ID failures (MiniMax/Anthropic-compatible APIs).
- Docs: make `kibo status` the first diagnostic step, clarify `status --deep` behavior, and document `/whoami` + `/id`.
- Docs/Testing: clarify live tool+image probes and how to list your testable `provider/model` ids.
- Tests/Live: make gateway bash+read probes resilient to provider formatting while still validating real tool calls.
- WhatsApp: detect mentions in groups using authDir reverse mapping + resolve self JID E.164 for mention gating. -.
- Gateway/Auth: default to token auth on loopback during onboarding, add doctor token generation flow, and tighten audio transcription config to Whisper-only.
- Providers: dedupe inbound messages across providers to avoid duplicate LLM runs on redeliveries/reconnects. -.
- Agents: strip `<thought>`/`<antthinking>` tags from hidden reasoning output and cover tag variants in tests. -.
- macOS: save model picker selections as normalized provider/model IDs and keep manual entries aligned. -.
- Agents: recognize "usage limit" errors as rate limits for failover. -.
- CLI: avoid success message when daemon restart is skipped. -.
- Commands: disable `/config` + `/debug` by default; gate via `commands.config`/`commands.debug` and hide from native registration/help output.
- Agents/System: clarify that sub-agents remain sandboxed and cannot use elevated host access.
- Gateway: disable the OpenAI-compatible `/v1/chat/completions` endpoint by default; enable via `gateway.http.endpoints.chatCompletions.enabled=true`.
- macOS: stabilize bridge tunnels, guard invoke senders on disconnect, and drain stdout/stderr to avoid deadlocks. -.
- Agents/System: clarify sandboxed runtime in system prompt and surface elevated availability when sandboxed.
- Auto-reply: prefer `RawBody` for command/directive parsing (WhatsApp + Discord) and prevent fallback runs from clobbering concurrent session updates. -.
- WhatsApp: fix group reactions by preserving message IDs and sender JIDs in history; normalize participant phone numbers to JIDs in outbound reactions. -.
- WhatsApp: expose group participant IDs to the model so reactions can target the right sender.
- Cron: `wakeMode: "now"` waits for heartbeat completion (and retries when the main lane is busy). -.
- Agents/OpenAI: fix Responses tool-only → follow-up turn handling (avoid standalone `reasoning` items that trigger 400 "required following item") and replay reasoning items in Responses/Codex Responses history for tool-call-only turns.
- Sandbox: add `kibo sandbox explain` (effective policy inspector + fix-it keys); improve "sandbox jail" tool-policy/elevated errors with actionable config key paths; link to docs.
- Hooks/Gmail: keep Tailscale serve path at `/` while preserving the public path. -.
- Hooks/Gmail: allow Tailscale target URLs to preserve internal serve paths.
- Auth: update Claude Code keychain credentials in-place during refresh sync; share JSON file helpers; add CLI fallback coverage.
- Auth: throttle external CLI credential syncs (Claude/Codex), reduce Keychain reads, and skip sync when cached credentials are still fresh.
- CLI: respect `KIBOBOT_STATE_DIR` for node pairing + voice wake settings storage. -.
- Onboarding/Gateway: persist non-interactive gateway token auth in config; add WS wizard + gateway tool-calling regression coverage.
- Gateway/Control UI: make `chat.send` non-blocking, wire Stop to `chat.abort`, and treat `/stop` as an out-of-band abort.
- Gateway/Control UI: allow `chat.abort` without `runId` (abort active runs), suppress post-abort chat streaming, and prune stuck chat runs.
- Gateway/Control UI: sniff image attachments for chat.send, drop non-images, and log mismatches. -.
- macOS: force `restart-mac.sh --sign` to require identities and keep bundled Node signed for relay verification. -.
- Gateway/Agent: accept image attachments on `agent` (multimodal message) and add live gateway image probe (`KIBOBOT_LIVE_GATEWAY_IMAGE_PROBE=1`).
- CLI: `kibo sessions` now includes `elev:*` + `usage:*` flags in the table output.
- CLI/Pairing: accept positional provider for `pairing list|approve` (npm-run compatible); update docs/bot hints.
- Branding: normalize legacy casing/branding to "Kibo" (CLI, status, docs).
- Auto-reply: fix native `/model` not updating the actual chat session (Telegram/Slack/Discord).
- Doctor: offer to run `kibo update` first on git installs (keeps doctor output aligned with latest).
- Doctor: avoid false legacy workspace warning when install dir is `~/kibo`.
- iMessage: fix reasoning persistence across DMs; avoid partial/duplicate replies when reasoning is enabled. -.
- Models/Auth: allow MiniMax API configs without `models.providers.minimax.apiKey` (auth profiles / `MINIMAX_API_KEY`). -.
- Agents: avoid duplicate replies when the message tool sends. -.
- Agents: harden Cloud Code Assist tool ID sanitization (toolUse/toolCall/toolResult) and scrub extra JSON Schema constraints. -.
- Agents: sanitize tool results + Cloud Code Assist tool IDs at context-build time (prevents mid-run strict-provider request rejects).
- Agents/Tools: resolve workspace-relative Read/Write/Edit paths; align bash default cwd. -.
- Discord: include forwarded message snapshots in agent session context. -.
- Telegram: add `telegram.draftChunk` to tune draft streaming chunking for `streamMode: "block"`. -.
- Tests/Agents: add regression coverage for workspace tool path resolution and bash cwd defaults.
- iOS/Android: enable stricter concurrency/lint checks; fix Swift 6 strict concurrency issues + Android lint errors (ExifInterface, obsolete SDK check). -.
- Auth: read Codex CLI keychain tokens on macOS before falling back to `~/.codex/auth.json`, preventing stale refresh tokens from breaking gateway live tests.
- Security/Exec approvals: reject shell command substitution (`$()` and backticks) inside double quotes to prevent exec allowlist bypass when exec allowlist mode is explicitly enabled (the default configuration does not use this mode)..
- iOS/macOS: share `AsyncTimeout`, require explicit `bridgeStableID` on connect, and harden tool display defaults (avoids missing-resource label fallbacks).
- Telegram: serialize media-group processing to avoid missed albums under load.
- Signal: handle `dataMessage.reaction` events (signal-cli SSE) to avoid broken attachment errors. -.
- Docs: showcase entries for ParentPay, R2 Upload, iOS TestFlight, and Oura Health. -.
- Agents: repair session transcripts by dropping duplicate tool results across the whole history (unblocks Anthropic-compatible APIs after retries).
- Tests/Live: reset the gateway session between model runs to avoid cross-provider transcript incompatibilities (notably OpenAI Responses reasoning replay rules).

## 2026.1.9

### Highlights

- Microsoft Teams provider: polling, attachments, outbound CLI send, per-channel policy.
- Models/Auth expansion: OpenCode Zen + MiniMax API onboarding; token auth profiles + auth order; OAuth health in doctor/status.
- CLI/Gateway UX: message subcommands, gateway discover/status/SSH, /config + /debug, sandbox CLI.
- Provider reliability sweep: WhatsApp contact cards/targets, Telegram audio-as-voice + streaming, Signal reactions, Slack threading, Discord stability.
- Auto-reply + status: block-streaming controls, reasoning handling, usage/cost reporting.
- Control UI/TUI: queued messages, session links, reasoning view, mobile polish, logs UX.

### New Features and Changes

- Models/Auth: OpenCode Zen onboarding -; MiniMax Anthropic-compatible API + hosted onboarding (#590, #495) -.
- Models/Auth: setup-token + token auth profiles; `kibo models auth order {get,set,clear}`; per-agent auth candidates in `/model status`; OAuth expiry checks in doctor/status.
- Agent/System: claude-cli runner; `session_status` tool (and sandbox allow); adaptive context pruning default; system prompt messaging guidance + no auto self-update; eligible skills list injection; sub-agent context trimmed.
- Commands: `/commands` list; `/models` alias; `/usage` alias; `/debug` runtime overrides + effective config view; `/config` chat updates + `/config get`; `config --section`.
- CLI/Gateway: unified message tool + message subcommands; gateway discover (local + wide-area DNS-SD) with JSON/timeout; gateway status human-readable + JSON + SSH loopback; wide-area records include gatewayPort/sshPort/cliPath + tailnet DNS fallback.
- CLI UX: logs output modes (pretty/plain/JSONL) + colorized health/daemon output; global `--no-color`; shell palette in onboarding/config.
- Dev ergonomics: gateway `--dev/--reset` + dev profile auto-config; C-3PO dev templates; dev gateway/TUI helper scripts.
- Sandbox/Workspace: sandbox list/recreate commands; sync skills into sandbox workspace; sandbox browser auto-start.
- Config/Onboarding: inline env vars; OpenAI API key flow to shared `~/.kibo/.env`; Opus 4.5 default prompt for Anthropic auth; QuickStart auto-install gateway (Node-only) + provider picker tweaks + skip-systemd flags; TUI bootstrap prompt (`tui --message`); remove Bun runtime choice.
- Providers: Microsoft Teams provider (polling, attachments, outbound sends, requireMention, config reload/DM policy). -
- Providers: WhatsApp broadcast groups for multi-agent replies -; inbound media size cap configurable -; identity-based message prefixes -.
- Providers: Telegram inline keyboard buttons + callback payload routing -; cron topic delivery targets (#474/#478) -; `[[audio_as_voice]]` tag support -.
- Providers: Signal reactions + notifications with allowlist support.
- Status/Usage: /status cost reporting + `/cost` lines; auth profile snippet; provider usage windows.
- Control UI: mobile responsiveness -; queued messages + Enter-to-send -; session links -; reasoning view; skill install feedback -; chat layout refresh -; docs link + new session button; drop explicit `ui:install`.
- TUI: agent picker + agents list RPC; improved status line.
- Doctor/Daemon: audit/repair flows, permissions checks, supervisor config audits; provider status probes + warnings for Discord intents and Telegram privacy; last activity timestamps; gateway restart guidance.
- Docs: Hetzner Docker VPS guide + cross-links (#556/#592) -; Ansible guide -; provider troubleshooting index; hook parameter expansion -; model allowlist notes; OAuth deep dive; showcase refresh.
- Apps/Branding: refreshed iOS/Android/macOS icons -.

### Fixes

- Packaging: include MS Teams send module in npm tarball.
- Sandbox/Browser: auto-start CDP endpoint; proxy CDP out of container for attachOnly; relax Bun fetch typing; align sandbox list output with config images.
- Agents/Runtime: gate heartbeat prompt to default sessions; /stop aborts between tool calls; require explicit system-event session keys; guard small context windows; fix model fallback stringification; sessions_spawn inherits provider; failover on billing/credits; respect auth cooldown ordering; restore Anthropic OAuth tool dispatch + tool-name bypass; avoid OpenAI invalid reasoning replay; harden Gmail hook model defaults.
- Agent history/schema: strip/skip empty assistant/error blocks to prevent session corruption/Claude 400s; scrub unsupported JSON Schema keywords + sanitize tool call IDs for Cloud Code Assist; simplify Gemini-compatible tool/session schemas; require raw for config.apply.
- Auto-reply/Streaming: default audioAsVoice false; preserve audio_as_voice propagation + buffer audio blocks + guard voice notes; block reply ordering (timeout) + forced-block fence-safe; avoid chunk splits inside parentheses + fence-close breaks + invalid UTF-16 truncation; preserve inline directive spacing + allow whitespace in reply tags; filter NO_REPLY prefixes + normalize routed replies; suppress <think> leakage with separate Reasoning; block streaming defaults (off by default, minChars/idle tuning) + coalesced blocks; dedupe followup queue; restore explicit responsePrefix default.
- Status/Commands: provider prefix in /status model display; usage filtering + provider mapping; auth label + usage snapshots (claude-cli fallback + optional claude.ai); show Verbose/Elevated only when enabled; compact usage/cost line + restore emoji-rich status; /status in directive-only + multi-directive handling; mention-bypass elevated handling; surface provider usage errors; wire /usage to /status; restore hidden gateway-daemon alias; fallback /model list when catalog unavailable.
- WhatsApp: vCard/contact cards (prefer FN, include numbers, show all contacts, keep summary counts, better empty summaries); preserve group JIDs + normalize targets; resolve mappings/JIDs (Baileys/auth-dir) + inbound mapping; route queued replies to sender; improve web listener errors + remove provider name from errors; record outbound activity account id; fix web media fetch errors; broadcast group history consistency.
- Telegram: keep streamMode draft-only; long-poll conflict retries + update dedupe; grammY fetch mismatch fixes + restrict native fetch to Bun; suppress getUpdates stack traces; include user id in pairing; audio_as_voice handling fixes.
- Discord/Slack: thread context helpers + forum thread starters; avoid category parent overrides; gateway reconnect logs + HELLO timeout + stop provider after reconnect exhaustion; DM recipient parsing for numeric IDs; remove incorrect limited warning; reply threading + mrkdwn edge cases; remove ack reactions after reply; gateway debug event visibility.
- Signal: reaction handling safety; own-reaction matching (uuid+phone); UUID-only senders accepted; ignore reaction-only messages.
- MS Teams: download image attachments reliably; fix top-level replies; stop on shutdown + honor chunk limits; normalize poll providers/deps; pairing label fixes.
- iMessage: isolate group-ish threads by chat_id.
- Gateway/Daemon/Doctor: atomic config writes; repair gateway service entrypoint + install switches; non-interactive legacy migrations; systemd unit alignment + KillMode=process; node bridge keepalive/pings; Launch at Login persistence; bundle MoltbotKit resources + Swift 6.2 compat dylib; relay version check + remove smoke test; regen Swift GatewayModels + keep agent provider string; cron jobId alias + channel alias migration + main session key normalization; heartbeat Telegram accountId resolution; avoid WhatsApp fallback for internal runs; gateway listener error wording; serveBaseUrl param; honor gateway --dev; fix wide-area discovery updates; align agents.defaults schema; provider account metadata in daemon status; refresh Carbon patch for gateway fixes; restore doctor prompter initialValue handling.
- Control UI/TUI: persist per-session verbose off + hide tool cards; logs tab opens at bottom; relative asset paths + landing cleanup; session labels lookup/persistence; stop pinning main session in recents; start logs at bottom; TUI status bar refresh + timeout handling + hide reasoning label when off.
- Onboarding/Configure: QuickStart single-select provider picker; avoid Codex CLI false-expiry warnings; clarify WhatsApp owner prompt; fix Minimax hosted onboarding (agents.defaults + msteams heartbeat target); remove configure Control UI prompt; honor gateway --dev flag.
- Agent loop: guard overflow compaction throws and restore compaction hooks for engine-owned context engines. -

### Breaking

- CLI: `kibo message` now subcommands (`message send|poll|...`) and requires `--provider` unless only one provider configured.
- Commands/Tools: `/restart` and gateway restart tool disabled by default; enable with `commands.restart=true`.

### Maintenance

- Dependencies: bump pi-\* stack to 0.42.2.
- Dependencies: Pi 0.40.0 bump -.
- Build: Docker build cache layer -.

- Auth: enable OAuth token refresh for Claude Code CLI credentials (`anthropic:claude-cli`) with bidirectional sync back to Claude Code storage (file on Linux/Windows, Keychain on macOS). This allows long-running agents to operate autonomously without manual re-authentication (#654 -).

## 2026.1.8

### Highlights

- Security: DMs locked down by default across providers; pairing-first + allowlist guidance.
- Sandbox: per-agent scope defaults + workspace access controls; tool/session isolation tuned.
- Agent loop: compaction, pruning, streaming, and error handling hardened.
- Providers: Telegram/WhatsApp/Discord/Slack reliability, threading, reactions, media, and retries improved.
- Control UI: logs tab, streaming stability, focus mode, and large-output rendering fixes.
- CLI/Gateway/Doctor: daemon/logs/status, auth migration, and diagnostics significantly expanded.

### Fixes

- **CLI/Gateway/Doctor:** daemon runtime selection + improved logs/status/health/errors; auth/password handling for local CLI; richer close/timeout details; auto-migrate legacy config/sessions/state; integrity checks + repair prompts; `--yes`/`--non-interactive`; `--deep` gateway scans; better restart/service hints.
- **Agent loop + compaction:** compaction/pruning tuning, overflow handling, safer bootstrap context, and per-provider threading/confirmations; opt-in tool-result pruning + compact tracking.
- **Sandbox + tools:** per-agent sandbox overrides, workspaceAccess controls, session tool visibility, tool policy overrides, process isolation, and tool schema/timeout/reaction unification.
- **Providers (Telegram/WhatsApp/Discord/Slack/Signal/iMessage):** retry/backoff, threading, reactions, media groups/attachments, mention gating, typing behavior, and error/log stability; long polling + forum topic isolation for Telegram.
- **Gateway/CLI UX:** `kibo logs`, cron list colors/aliases, docs search, agents list/add/delete flows, status usage snapshots, runtime/auth source display, and `/status`/commands auth unification.
- **Control UI/Web:** logs tab, focus mode polish, config form resilience, streaming stability, tool output caps, windowed chat history, and reconnect/password URL auth.
- **macOS/Android/TUI/Build:** macOS gateway races, QR bundling, JSON5 config safety, Voice Wake hardening; Android EXIF rotation + APK naming/versioning; TUI key handling; tooling/bundling fixes.
- **Packaging/compat:** npm dist folder coverage, Node 25 qrcode-terminal import fixes, Bun/Playwright/WebSocket patches, and Docker Bun install.
- **Docs:** new FAQ/KiboHub/config examples/showcase entries and clarified auth, sandbox, and systemd docs.

### Breaking

- **SECURITY (update ASAP):** inbound DMs are now **locked down by default** on Telegram/WhatsApp/Signal/iMessage/Discord/Slack.
  - Previously, if you didn't configure an allowlist, your bot could be **open to anyone** (especially discoverable Telegram bots).
  - New default: DM pairing (`dmPolicy="pairing"` / `discord.dm.policy="pairing"` / `slack.dm.policy="pairing"`).
  - To keep old "open to everyone" behavior: set `dmPolicy="open"` and include `"*"` in the relevant `allowFrom` (Discord/Slack: `discord.dm.allowFrom` / `slack.dm.allowFrom`).
  - Approve requests via `kibo pairing list <provider>` + `kibo pairing approve <provider> <code>`.
- Sandbox: default `agent.sandbox.scope` to `"agent"` (one container/workspace per agent). Use `"session"` for per-session isolation; `"shared"` disables cross-session isolation.
- Timestamps in agent envelopes are now UTC (compact `YYYY-MM-DDTHH:mmZ`); removed `messages.timestampPrefix`. Add `agent.userTimezone` to tell the model the user's local time (system prompt only).
- Model config schema changes (auth profiles + model lists); doctor auto-migrates and the gateway rewrites legacy configs on startup.
- Commands: gate all slash commands to authorized senders; add `/compact` to manually compact session context.
- Groups: `whatsapp.groups`, `telegram.groups`, and `imessage.groups` now act as allowlists when set. Add `"*"` to keep allow-all behavior.
- Auto-reply: removed `autoReply` from Discord/Slack/Telegram channel configs; use `requireMention` instead (Telegram topics now support `requireMention` overrides).
- CLI: remove `update`, `gateway-daemon`, `gateway {install|uninstall|start|stop|restart|daemon status|wake|send|agent}`, and `telegram` commands; move `login/logout` to `providers login/logout` (top-level aliases hidden); use `daemon` for service control, `send`/`agent`/`wake` for RPC, and `nodes canvas` for canvas ops.

### Maintenance

- Skills additions (Himalaya email, CodexBar, 1Password).
- Dependency refreshes (pi-\* stack, Slack SDK, discord-api-types, file-type, zod, Biome, Vite).

## 2026.1.5

### Highlights

- Models: add image-specific model config (`agent.imageModel` + fallbacks) and scan support.
- Agent tools: new `image` tool routed to the image model (when configured).
- Config: default model shorthands (`opus`, `sonnet`, `gpt`, `gpt-mini`, `gemini`, `gemini-flash`).
- Docs: document built-in model shorthands + precedence (user config wins).
- Bun: optional local install/build workflow without maintaining a Bun lockfile (see `docs/bun.md`).

### Fixes

- Control UI: render Markdown in tool result cards.
- Control UI: prevent overlapping action buttons in Discord guild rules on narrow layouts.
- Android: tapping the foreground service notification brings the app to the front. -
- Cron tool uses `id` for update/remove/run/runs (aligns with gateway params). -
- Control UI: chat view uses page scroll with sticky header/sidebar and fixed composer (no inner scroll frame).
- macOS: treat location permission as always-only to avoid iOS-only enums. -
- macOS: make generated gateway protocol models `Sendable` for Swift 6 strict concurrency. -
- macOS: bundle QR code renderer modules so DMG gateway boot doesn't crash on missing qrcode-terminal vendor files.
- macOS: parse JSON5 config safely to avoid wiping user settings when comments are present.
- WhatsApp: suppress typing indicator during heartbeat background tasks. -
- WhatsApp: mark offline history sync messages as read without auto-reply. -
- Discord: avoid duplicate replies when a provider emits late streaming `text_end` events (OpenAI/GPT).
- CLI: use tailnet IP for local gateway calls when bind is tailnet/auto (fixes #176).
- Env: load global `$KIBO_STATE_DIR/.env` (`~/.kibo/.env`) as a fallback after CWD `.env`.
- Env: optional login-shell env fallback (opt-in; imports expected keys without overriding existing env).
- Agent tools: OpenAI-compatible tool JSON Schemas (fix `browser`, normalize union schemas).
- Onboarding: when running from source, auto-build missing Control UI assets (`bun run ui:build`).
- Discord/Slack: route reaction + system notifications to the correct session (no main-session bleed).
- Agent tools: honor `agent.tools` allow/deny policy even when sandbox is off.
- Discord: avoid duplicate replies when OpenAI emits repeated `message_end` events.
- Commands: unify /status (inline) and command auth across providers; group bypass for authorized control commands; remove Discord /kibo slash handler.
- CLI: run `kibo agent` via the Gateway by default; use `--local` to force embedded mode.
