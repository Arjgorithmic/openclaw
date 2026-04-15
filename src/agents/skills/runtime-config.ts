import { getRuntimeConfigSnapshot, type KiboConfig } from "../../config/config.js";

export function resolveSkillRuntimeConfig(config?: KiboConfig): KiboConfig | undefined {
  return getRuntimeConfigSnapshot() ?? config;
}
