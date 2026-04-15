import type { PluginRuntime } from "kibo/plugin-sdk/core";
import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";

const { setRuntime: setFeishuRuntime, getRuntime: getFeishuRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Feishu runtime not initialized");
export { getFeishuRuntime, setFeishuRuntime };
