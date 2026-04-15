import type { PluginRuntime } from "kibo/plugin-sdk/core";
import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";

const { setRuntime: setTwitchRuntime, getRuntime: getTwitchRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Twitch runtime not initialized");
export { getTwitchRuntime, setTwitchRuntime };
