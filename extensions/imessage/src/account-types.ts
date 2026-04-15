import type { KiboConfig } from "kibo/plugin-sdk/config-runtime";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<KiboConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
