import { definePluginEntry } from "kibo/plugin-sdk/plugin-entry";
import type { AnyAgentTool, KiboPluginApi, KiboPluginToolFactory } from "./runtime-api.js";
import { createShellTool } from "./src/shell-tool.js";

export default definePluginEntry({
  id: "shell",
  name: "Shell",
  description: "Optional local shell helper tools",
  register(api: KiboPluginApi) {
    api.registerTool(
      ((ctx) => {
        if (ctx.sandboxed) {
          return null;
        }
        const taskFlow =
          api.runtime?.taskFlow && ctx.sessionKey
            ? api.runtime.taskFlow.fromToolContext(ctx)
            : undefined;
        return createShellTool(api, { taskFlow }) as AnyAgentTool;
      }) as KiboPluginToolFactory,
      { optional: true },
    );
  },
});
