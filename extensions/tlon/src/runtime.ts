import type { PluginRuntime } from "kibo/plugin-sdk/plugin-runtime";
import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";

const { setRuntime: setTlonRuntime, getRuntime: getTlonRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Tlon runtime not initialized");
export { getTlonRuntime, setTlonRuntime };
