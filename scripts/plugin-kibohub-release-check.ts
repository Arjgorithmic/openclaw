#!/usr/bin/env -S node --import tsx

import { pathToFileURL } from "node:url";
import {
  collectKiboHubPublishablePluginPackages,
  collectKiboHubVersionGateErrors,
  parsePluginReleaseArgs,
  resolveSelectedKiboHubPublishablePluginPackages,
} from "./lib/plugin-kibohub-release.ts";

export async function runPluginKiboHubReleaseCheck(argv: string[]) {
  const { selection, selectionMode, baseRef, headRef } = parsePluginReleaseArgs(argv);
  const publishable = collectKiboHubPublishablePluginPackages();
  const gitRange = baseRef && headRef ? { baseRef, headRef } : undefined;
  const selected = resolveSelectedKiboHubPublishablePluginPackages({
    plugins: publishable,
    selection,
    selectionMode,
    gitRange,
  });

  if (gitRange) {
    const errors = collectKiboHubVersionGateErrors({
      plugins: publishable,
      gitRange,
    });
    if (errors.length > 0) {
      throw new Error(
        `plugin-kibohub-release-check: version bumps required before KiboHub publish:\n${errors
          .map((error) => `  - ${error}`)
          .join("\n")}`,
      );
    }
  }

  console.log("plugin-kibohub-release-check: publishable plugin metadata looks OK.");
  if (gitRange && selected.length === 0) {
    console.log(
      `  - no publishable plugin package changes detected between ${gitRange.baseRef} and ${gitRange.headRef}`,
    );
  }
  for (const plugin of selected) {
    console.log(
      `  - ${plugin.packageName}@${plugin.version} (${plugin.channel}, ${plugin.extensionId})`,
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await runPluginKiboHubReleaseCheck(process.argv.slice(2));
}
