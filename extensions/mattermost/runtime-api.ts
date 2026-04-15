// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  KiboConfig,
  KiboPluginApi,
  PluginRuntime,
} from "kibo/plugin-sdk/core";
export type { RuntimeEnv } from "kibo/plugin-sdk/runtime";
export type { ReplyPayload } from "kibo/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "kibo/plugin-sdk/command-auth";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "kibo/plugin-sdk/config-runtime";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "kibo/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "kibo/plugin-sdk/channel-status";
export { createAccountStatusSink } from "kibo/plugin-sdk/channel-lifecycle";
export { buildAgentMediaPayload } from "kibo/plugin-sdk/agent-media-payload";
export {
  buildModelsProviderData,
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "kibo/plugin-sdk/command-auth";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  isDangerousNameMatchingEnabled,
  loadSessionStore,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  resolveStorePath,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "kibo/plugin-sdk/config-runtime";
export { formatInboundFromLabel } from "kibo/plugin-sdk/channel-inbound";
export { logInboundDrop } from "kibo/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "kibo/plugin-sdk/channel-pairing";
export {
  DM_GROUP_ACCESS_REASON,
  readStoreAllowFromForDmPolicy,
  resolveDmGroupAccessWithLists,
  resolveEffectiveAllowFromLists,
} from "kibo/plugin-sdk/channel-policy";
export { evaluateSenderGroupAccessForPolicy } from "kibo/plugin-sdk/group-access";
export { createChannelReplyPipeline } from "kibo/plugin-sdk/channel-reply-pipeline";
export { logTypingFailure } from "kibo/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "kibo/plugin-sdk/outbound-media";
export { rawDataToString } from "kibo/plugin-sdk/browser-node-runtime";
export { chunkTextForOutbound } from "kibo/plugin-sdk/text-chunking";
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "kibo/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "kibo/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "kibo/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "kibo/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "kibo/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "kibo/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "kibo/plugin-sdk/media-runtime";
export { normalizeProviderId } from "kibo/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
