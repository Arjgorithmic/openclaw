import { createPluginRuntimeStore } from "kibo/plugin-sdk/runtime-store";
import type { PluginRuntime } from "kibo/plugin-sdk/runtime-store";

const { setRuntime: setMattermostRuntime, getRuntime: getMattermostRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Mattermost runtime not initialized");
export { getMattermostRuntime, setMattermostRuntime };
