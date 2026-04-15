import type {
  KiboPluginApi,
  KiboPluginNodeHostCommand,
  KiboPluginToolContext,
  KiboPluginToolFactory,
} from "kibo/plugin-sdk/plugin-entry";
import {
  collectBrowserSecurityAuditFindings,
  createBrowserPluginService,
  createBrowserTool,
  handleBrowserGatewayRequest,
  registerBrowserCli,
  runBrowserProxyCommand,
} from "./register.runtime.js";

export const browserPluginReload = { restartPrefixes: ["browser"] };

export const browserPluginNodeHostCommands: KiboPluginNodeHostCommand[] = [
  {
    command: "browser.proxy",
    cap: "browser",
    handle: runBrowserProxyCommand,
  },
];

export const browserSecurityAuditCollectors = [collectBrowserSecurityAuditFindings];

export function registerBrowserPlugin(api: KiboPluginApi) {
  api.registerTool(((ctx: KiboPluginToolContext) =>
    createBrowserTool({
      sandboxBridgeUrl: ctx.browser?.sandboxBridgeUrl,
      allowHostControl: ctx.browser?.allowHostControl,
      agentSessionKey: ctx.sessionKey,
    })) as KiboPluginToolFactory);
  api.registerCli(({ program }) => registerBrowserCli(program), { commands: ["browser"] });
  api.registerGatewayMethod("browser.request", handleBrowserGatewayRequest, {
    scope: "operator.write",
  });
  api.registerService(createBrowserPluginService());
}
