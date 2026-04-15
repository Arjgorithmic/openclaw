#!/usr/bin/env -S node --import tsx

import { pathToFileURL } from "node:url";
import {
  collectPluginKiboHubReleasePlan,
  parsePluginReleaseArgs,
} from "./lib/plugin-kibohub-release.ts";

export async function collectPluginReleasePlanForKiboHub(argv: string[]) {
  const { selection, selectionMode, baseRef, headRef } = parsePluginReleaseArgs(argv);
  return await collectPluginKiboHubReleasePlan({
    selection,
    selectionMode,
    gitRange: baseRef && headRef ? { baseRef, headRef } : undefined,
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const plan = await collectPluginReleasePlanForKiboHub(process.argv.slice(2));
  console.log(JSON.stringify(plan, null, 2));
}
