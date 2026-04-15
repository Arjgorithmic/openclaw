import { createConfigIO, getRuntimeConfigSnapshot, type KiboConfig } from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): KiboConfig {
  return getRuntimeConfigSnapshot() ?? createConfigIO().loadConfig();
}
