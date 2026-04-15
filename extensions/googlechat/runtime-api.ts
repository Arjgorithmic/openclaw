// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "kibo/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "kibo/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "kibo/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "kibo/plugin-sdk/channel-contract";
export { missingTargetError } from "kibo/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "kibo/plugin-sdk/channel-lifecycle";
export { createChannelPairingController } from "kibo/plugin-sdk/channel-pairing";
export { createChannelReplyPipeline } from "kibo/plugin-sdk/channel-reply-pipeline";
export {
  evaluateGroupRouteAccessForPolicy,
  resolveDmGroupAccessWithLists,
  resolveSenderScopedGroupPolicy,
} from "kibo/plugin-sdk/channel-policy";
export { PAIRING_APPROVED_MESSAGE } from "kibo/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "kibo/plugin-sdk/text-chunking";
export type { KiboConfig } from "kibo/plugin-sdk/config-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  isDangerousNameMatchingEnabled,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "kibo/plugin-sdk/config-runtime";
export { fetchRemoteMedia, resolveChannelMediaMaxBytes } from "kibo/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "kibo/plugin-sdk/outbound-media";
export type { PluginRuntime } from "kibo/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "kibo/plugin-sdk/ssrf-runtime";
export {
  GoogleChatConfigSchema,
  type GoogleChatAccountConfig,
  type GoogleChatConfig,
} from "kibo/plugin-sdk/googlechat-runtime-shared";
export { extractToolSend } from "kibo/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "kibo/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "kibo/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "kibo/plugin-sdk/webhook-path";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "kibo/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "kibo/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
