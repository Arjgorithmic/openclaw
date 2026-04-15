export const KIBO_OWNER_ONLY_CORE_TOOL_NAMES = ["cron", "gateway", "nodes"] as const;

const KIBO_OWNER_ONLY_CORE_TOOL_NAME_SET: ReadonlySet<string> = new Set(
  KIBO_OWNER_ONLY_CORE_TOOL_NAMES,
);

export function isKiboOwnerOnlyCoreToolName(toolName: string): boolean {
  return KIBO_OWNER_ONLY_CORE_TOOL_NAME_SET.has(toolName);
}
