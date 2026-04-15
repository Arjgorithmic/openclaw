import { resolveActiveTalkProviderConfig } from "../../config/talk.js";
import type { KiboConfig } from "../../config/types.js";

export { resolveActiveTalkProviderConfig };

export function getRuntimeConfigSnapshot(): KiboConfig | null {
  return null;
}
