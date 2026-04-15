import type { PluginRuntime } from "kibo/plugin-sdk/core";
import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";

const { setRuntime: setQQBotRuntime, getRuntime: getQQBotRuntime } =
  createPluginRuntimeStore<PluginRuntime>("QQBot runtime not initialized");
export { getQQBotRuntime, setQQBotRuntime };
