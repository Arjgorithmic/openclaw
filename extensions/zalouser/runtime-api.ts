// Private runtime barrel for the bundled Zalo Personal extension.
// Keep this barrel thin and aligned with the local extension surface.

export * from "./api.js";
export { setZalouserRuntime } from "./src/runtime.js";
export type { ReplyPayload } from "kibo/plugin-sdk/reply-runtime";
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
  ChannelStatusIssue,
} from "kibo/plugin-sdk/channel-contract";
export type {
  KiboConfig,
  GroupToolPolicyConfig,
  MarkdownTableMode,
} from "kibo/plugin-sdk/config-runtime";
export type {
  PluginRuntime,
  AnyAgentTool,
  ChannelPlugin,
  KiboPluginToolContext,
} from "kibo/plugin-sdk/core";
export type { RuntimeEnv } from "kibo/plugin-sdk/runtime";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  normalizeAccountId,
} from "kibo/plugin-sdk/core";
export { chunkTextForOutbound } from "kibo/plugin-sdk/text-chunking";
export {
  isDangerousNameMatchingEnabled,
  resolveDefaultGroupPolicy,
  resolveOpenProviderRuntimeGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "kibo/plugin-sdk/config-runtime";
export {
  mergeAllowlist,
  summarizeMapping,
  formatAllowFromLowercase,
} from "kibo/plugin-sdk/allow-from";
export { resolveInboundMentionDecision } from "kibo/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "kibo/plugin-sdk/channel-pairing";
export { createChannelReplyPipeline } from "kibo/plugin-sdk/channel-reply-pipeline";
export { buildBaseAccountStatusSnapshot } from "kibo/plugin-sdk/status-helpers";
export { resolveSenderCommandAuthorization } from "kibo/plugin-sdk/command-auth";
export {
  evaluateGroupRouteAccessForPolicy,
  resolveSenderScopedGroupPolicy,
} from "kibo/plugin-sdk/group-access";
export { loadOutboundMediaFromUrl } from "kibo/plugin-sdk/outbound-media";
export {
  deliverTextOrMediaReply,
  isNumericTargetId,
  resolveSendableOutboundReplyParts,
  sendPayloadWithChunkedTextAndMedia,
  type OutboundReplyPayload,
} from "kibo/plugin-sdk/reply-payload";
export { resolvePreferredKiboTmpDir } from "kibo/plugin-sdk/browser-security-runtime";
