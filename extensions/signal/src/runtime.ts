import type { PluginRuntime } from "kibo/plugin-sdk/core";
import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";

const {
  setRuntime: setSignalRuntime,
  clearRuntime: clearSignalRuntime,
  getRuntime: getSignalRuntime,
} = createPluginRuntimeStore<PluginRuntime>("Signal runtime not initialized");
export { clearSignalRuntime, getSignalRuntime, setSignalRuntime };
