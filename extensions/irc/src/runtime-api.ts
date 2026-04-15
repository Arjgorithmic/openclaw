// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "kibo/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "kibo/plugin-sdk/channel-core";
export type { KiboConfig } from "kibo/plugin-sdk/config-runtime";
export type { PluginRuntime } from "kibo/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "kibo/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "kibo/plugin-sdk/config-runtime";
export type { OutboundReplyPayload } from "kibo/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "kibo/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "kibo/plugin-sdk/channel-config-primitives";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "kibo/plugin-sdk/channel-status";
export { createChannelPairingController } from "kibo/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "kibo/plugin-sdk/channel-lifecycle";
export {
  readStoreAllowFromForDmPolicy,
  resolveEffectiveAllowFromLists,
} from "kibo/plugin-sdk/channel-policy";
export { resolveControlCommandGate } from "kibo/plugin-sdk/command-auth";
export { dispatchInboundReplyWithBase } from "kibo/plugin-sdk/inbound-reply-dispatch";
export { chunkTextForOutbound } from "kibo/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "kibo/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  isDangerousNameMatchingEnabled,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "kibo/plugin-sdk/config-runtime";
export { logInboundDrop } from "kibo/plugin-sdk/channel-inbound";
