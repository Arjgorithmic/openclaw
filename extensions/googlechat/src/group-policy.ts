import { resolveChannelGroupRequireMention } from "kibo/plugin-sdk/channel-policy";
import type { KiboConfig } from "kibo/plugin-sdk/core";

type GoogleChatGroupContext = {
  cfg: KiboConfig;
  accountId?: string | null;
  groupId?: string | null;
};

export function resolveGoogleChatGroupRequireMention(params: GoogleChatGroupContext): boolean {
  return resolveChannelGroupRequireMention({
    cfg: params.cfg,
    channel: "googlechat",
    groupId: params.groupId,
    accountId: params.accountId,
  });
}
