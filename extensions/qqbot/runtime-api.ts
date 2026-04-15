export type { ChannelPlugin, KiboPluginApi, PluginRuntime } from "kibo/plugin-sdk/core";
export type { KiboConfig } from "kibo/plugin-sdk/config-runtime";
export type {
  KiboPluginService,
  KiboPluginServiceContext,
  PluginLogger,
} from "kibo/plugin-sdk/core";
export type { ResolvedQQBotAccount, QQBotAccountConfig } from "./src/types.js";
export { getQQBotRuntime, setQQBotRuntime } from "./src/runtime.js";
