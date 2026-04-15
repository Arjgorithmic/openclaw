import type { KiboConfig } from "kibo/plugin-sdk/config-runtime";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<KiboConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
