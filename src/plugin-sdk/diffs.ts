// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to the bundled diffs surface.

export { definePluginEntry } from "./plugin-entry.js";
export type { KiboConfig } from "../config/config.js";
export { resolvePreferredKiboTmpDir } from "../infra/tmp-kibo-dir.js";
export type {
  AnyAgentTool,
  KiboPluginApi,
  KiboPluginConfigSchema,
  KiboPluginToolContext,
  PluginLogger,
} from "../plugins/types.js";
