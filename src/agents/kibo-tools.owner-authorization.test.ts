import { describe, expect, it } from "vitest";
import {
  isKiboOwnerOnlyCoreToolName,
  KIBO_OWNER_ONLY_CORE_TOOL_NAMES,
} from "./tools/owner-only-tools.js";

describe("createKiboTools owner authorization", () => {
  it("marks owner-only core tool names", () => {
    expect(KIBO_OWNER_ONLY_CORE_TOOL_NAMES).toEqual(["cron", "gateway", "nodes"]);
    expect(isKiboOwnerOnlyCoreToolName("cron")).toBe(true);
    expect(isKiboOwnerOnlyCoreToolName("gateway")).toBe(true);
    expect(isKiboOwnerOnlyCoreToolName("nodes")).toBe(true);
  });

  it("keeps canvas non-owner-only", () => {
    expect(isKiboOwnerOnlyCoreToolName("canvas")).toBe(false);
  });
});
