// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  KiboConfig,
  KiboPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "kibo/plugin-sdk/core";
export type { KiboConfig as KibobotConfig } from "kibo/plugin-sdk/core";
export type { RuntimeEnv } from "kibo/plugin-sdk/runtime";
export type { GroupToolPolicyConfig } from "kibo/plugin-sdk/config-runtime";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "kibo/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "kibo/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "kibo/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "kibo/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "kibo/plugin-sdk/channel-reply-pipeline";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "kibo/plugin-sdk/config-runtime";
export { loadSessionStore, resolveSessionStoreEntry } from "kibo/plugin-sdk/config-runtime";
export { readJsonFileWithFallback } from "kibo/plugin-sdk/json-store";
export { createPersistentDedupe } from "kibo/plugin-sdk/persistent-dedupe";
export { normalizeAgentId } from "kibo/plugin-sdk/routing";
export { chunkTextForOutbound } from "kibo/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "kibo/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
