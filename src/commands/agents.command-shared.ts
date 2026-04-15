import type { KiboConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import {
  requireValidConfigFileSnapshot as requireValidConfigFileSnapshotBase,
  requireValidConfigSnapshot,
} from "./config-validation.js";

export function createQuietRuntime(runtime: RuntimeEnv): RuntimeEnv {
  return { ...runtime, log: () => {} };
}

export async function requireValidConfigFileSnapshot(runtime: RuntimeEnv) {
  return await requireValidConfigFileSnapshotBase(runtime);
}

export async function requireValidConfig(runtime: RuntimeEnv): Promise<KiboConfig | null> {
  return await requireValidConfigSnapshot(runtime);
}
