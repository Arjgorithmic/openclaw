import type { KiboConfig } from "../../config/config.js";
import { loadKiboPlugins } from "../loader.js";
import type { PluginRegistry } from "../registry.js";
import { buildPluginRuntimeLoadOptions, resolvePluginRuntimeLoadContext } from "./load-context.js";

export function loadPluginMetadataRegistrySnapshot(options?: {
  config?: KiboConfig;
  activationSourceConfig?: KiboConfig;
  env?: NodeJS.ProcessEnv;
  workspaceDir?: string;
  onlyPluginIds?: string[];
  loadModules?: boolean;
}): PluginRegistry {
  const context = resolvePluginRuntimeLoadContext(options);

  return loadKiboPlugins(
    buildPluginRuntimeLoadOptions(context, {
      throwOnLoadError: true,
      cache: false,
      activate: false,
      mode: "validate",
      loadModules: options?.loadModules,
      ...(options?.onlyPluginIds?.length ? { onlyPluginIds: options.onlyPluginIds } : {}),
    }),
  );
}
