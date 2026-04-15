// Narrow Matrix monitor helper seam.
// Keep monitor internals off the broad package runtime-api barrel so monitor
// tests and shared workers do not pull unrelated Matrix helper surfaces.

export { ensureConfiguredAcpBindingReady } from "kibo/plugin-sdk/acp-binding-runtime";
export type { NormalizedLocation } from "kibo/plugin-sdk/channel-inbound";
export type { PluginRuntime, RuntimeLogger } from "kibo/plugin-sdk/plugin-runtime";
export type { BlockReplyContext, ReplyPayload } from "kibo/plugin-sdk/reply-runtime";
export type { MarkdownTableMode, KiboConfig } from "kibo/plugin-sdk/config-runtime";
export type { RuntimeEnv } from "kibo/plugin-sdk/runtime";
export {
  addAllowlistUserEntriesFromConfigEntry,
  buildAllowlistResolutionSummary,
  canonicalizeAllowlistWithResolvedIds,
  formatAllowlistMatchMeta,
  patchAllowlistUsersInConfigEntries,
  summarizeMapping,
} from "kibo/plugin-sdk/allow-from";
export { createReplyPrefixOptions } from "kibo/plugin-sdk/channel-reply-pipeline";
export { createTypingCallbacks } from "kibo/plugin-sdk/channel-reply-pipeline";
export {
  formatLocationText,
  logInboundDrop,
  toLocationContext,
} from "kibo/plugin-sdk/channel-inbound";
export { getAgentScopedMediaLocalRoots } from "kibo/plugin-sdk/agent-media-payload";
export { logTypingFailure, resolveAckReaction } from "kibo/plugin-sdk/channel-feedback";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "kibo/plugin-sdk/channel-targets";
