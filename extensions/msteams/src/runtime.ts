import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";
import type { PluginRuntime } from "kibo/plugin-sdk/runtime-store";

const { setRuntime: setMSTeamsRuntime, getRuntime: getMSTeamsRuntime } =
  createPluginRuntimeStore<PluginRuntime>("MSTeams runtime not initialized");
export { getMSTeamsRuntime, setMSTeamsRuntime };
