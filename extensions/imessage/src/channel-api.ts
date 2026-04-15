import { formatTrimmedAllowFromEntries } from "kibo/plugin-sdk/channel-config-helpers";
import type { ChannelStatusIssue } from "kibo/plugin-sdk/channel-contract";
import { PAIRING_APPROVED_MESSAGE } from "kibo/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
  type KiboConfig,
} from "kibo/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "kibo/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "kibo/plugin-sdk/status-helpers";
import {
  resolveIMessageConfigAllowFrom,
  resolveIMessageConfigDefaultTo,
} from "./config-accessors.js";
import { looksLikeIMessageTargetId, normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "kibo/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  looksLikeIMessageTargetId,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
  resolveIMessageConfigAllowFrom,
  resolveIMessageConfigDefaultTo,
};

export type { ChannelPlugin, ChannelStatusIssue, KiboConfig };
