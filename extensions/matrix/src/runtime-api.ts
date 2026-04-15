export {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  normalizeOptionalAccountId,
} from "kibo/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringArrayParam,
  readStringParam,
} from "kibo/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "kibo/plugin-sdk/channel-config-primitives";
export type { ChannelPlugin } from "kibo/plugin-sdk/channel-core";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
  ChannelMessageToolDiscovery,
  ChannelOutboundAdapter,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelToolSend,
} from "kibo/plugin-sdk/channel-contract";
export {
  formatLocationText,
  logInboundDrop,
  toLocationContext,
  type NormalizedLocation,
} from "kibo/plugin-sdk/channel-inbound";
export { resolveAckReaction, logTypingFailure } from "kibo/plugin-sdk/channel-feedback";
export type { ChannelSetupInput } from "kibo/plugin-sdk/setup";
export type {
  KiboConfig,
  ContextVisibilityMode,
  DmPolicy,
  GroupPolicy,
} from "kibo/plugin-sdk/config-runtime";
export type { GroupToolPolicyConfig } from "kibo/plugin-sdk/config-runtime";
export type { WizardPrompter } from "kibo/plugin-sdk/matrix-runtime-shared";
export type { SecretInput } from "kibo/plugin-sdk/secret-input";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "kibo/plugin-sdk/config-runtime";
export {
  addWildcardAllowFrom,
  formatDocsLink,
  hasConfiguredSecretInput,
  mergeAllowFromEntries,
  moveSingleAccountChannelSectionToDefaultAccount,
  promptAccountId,
  promptChannelAccessConfig,
  splitSetupEntries,
} from "kibo/plugin-sdk/setup";
export type { RuntimeEnv } from "kibo/plugin-sdk/runtime";
export {
  assertHttpUrlTargetsPrivateNetwork,
  closeDispatcher,
  createPinnedDispatcher,
  isPrivateOrLoopbackHost,
  resolvePinnedHostnameWithPolicy,
  ssrfPolicyFromDangerouslyAllowPrivateNetwork,
  ssrfPolicyFromAllowPrivateNetwork,
  type LookupFn,
  type SsrFPolicy,
} from "kibo/plugin-sdk/ssrf-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "kibo/plugin-sdk/inbound-reply-dispatch";
export {
  ensureConfiguredAcpBindingReady,
  resolveConfiguredAcpBindingRecord,
} from "kibo/plugin-sdk/acp-binding-runtime";
export {
  buildProbeChannelStatusSummary,
  collectStatusIssuesFromLastError,
  PAIRING_APPROVED_MESSAGE,
} from "kibo/plugin-sdk/channel-status";
export {
  getSessionBindingService,
  resolveThreadBindingIdleTimeoutMsForChannel,
  resolveThreadBindingMaxAgeMsForChannel,
} from "kibo/plugin-sdk/conversation-runtime";
export { resolveOutboundSendDep } from "kibo/plugin-sdk/outbound-runtime";
export { resolveAgentIdFromSessionKey } from "kibo/plugin-sdk/routing";
export { chunkTextForOutbound } from "kibo/plugin-sdk/text-chunking";
export { createChannelReplyPipeline } from "kibo/plugin-sdk/channel-reply-pipeline";
export { loadOutboundMediaFromUrl } from "kibo/plugin-sdk/outbound-media";
export { normalizePollInput, type PollInput } from "kibo/plugin-sdk/media-runtime";
export { writeJsonFileAtomically } from "kibo/plugin-sdk/json-store";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "kibo/plugin-sdk/channel-targets";
export {
  evaluateGroupRouteAccessForPolicy,
  resolveSenderScopedGroupPolicy,
} from "kibo/plugin-sdk/channel-policy";
export {
  formatZonedTimestamp,
  type PluginRuntime,
  type RuntimeLogger,
} from "kibo/plugin-sdk/matrix-runtime-shared";
export type { ReplyPayload } from "kibo/plugin-sdk/reply-runtime";
// resolveMatrixAccountStringValues already comes from plugin-sdk/matrix.
// Re-exporting auth-precedence here makes Jiti try to define the same export twice.

export function buildTimeoutAbortSignal(params: { timeoutMs?: number; signal?: AbortSignal }): {
  signal?: AbortSignal;
  cleanup: () => void;
} {
  const { timeoutMs, signal } = params;
  if (!timeoutMs && !signal) {
    return { signal: undefined, cleanup: () => {} };
  }
  if (!timeoutMs) {
    return { signal, cleanup: () => {} };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(controller.abort.bind(controller), timeoutMs);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
    },
  };
}
