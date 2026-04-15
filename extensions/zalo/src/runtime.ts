import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";
import type { PluginRuntime } from "./runtime-support.js";

const { setRuntime: setZaloRuntime, getRuntime: getZaloRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Zalo runtime not initialized");
export { getZaloRuntime, setZaloRuntime };
