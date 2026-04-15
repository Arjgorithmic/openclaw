import type { ChannelDoctorConfigMutation } from "kibo/plugin-sdk/channel-contract";
import type { KiboConfig } from "kibo/plugin-sdk/config-runtime";
import { normalizeCompatibilityConfig as normalizeCompatibilityConfigImpl } from "./doctor.js";

export function normalizeCompatibilityConfig({
  cfg,
}: {
  cfg: KiboConfig;
}): ChannelDoctorConfigMutation {
  return normalizeCompatibilityConfigImpl({ cfg });
}
