import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";
import type { PluginRuntime } from "kibo/plugin-sdk/runtime-store";

const { setRuntime: setGoogleChatRuntime, getRuntime: getGoogleChatRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Google Chat runtime not initialized");
export { getGoogleChatRuntime, setGoogleChatRuntime };
