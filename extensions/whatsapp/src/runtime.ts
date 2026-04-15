import type { PluginRuntime } from "kibo/plugin-sdk/core";
import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";

const { setRuntime: setWhatsAppRuntime, getRuntime: getWhatsAppRuntime } =
  createPluginRuntimeStore<PluginRuntime>("WhatsApp runtime not initialized");
export { getWhatsAppRuntime, setWhatsAppRuntime };
