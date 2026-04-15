import type { KiboConfig } from "kibo/plugin-sdk/config-runtime";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<KiboConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
