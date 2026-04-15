// Private Kibo Shell plugin helpers for bundled extensions.
// Keep this surface narrow and limited to the Kibo Shell workflow/tool contract.

export { definePluginEntry } from "./plugin-entry.js";
export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "./windows-spawn.js";
export type {
  AnyAgentTool,
  KiboPluginApi,
  KiboPluginToolContext,
  KiboPluginToolFactory,
} from "../plugins/types.js";
