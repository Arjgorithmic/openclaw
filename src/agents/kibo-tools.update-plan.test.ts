import { describe, expect, it } from "vitest";
import type { KiboConfig } from "../config/config.js";
import { isUpdatePlanToolEnabledForKiboTools } from "./kibo-tools.registration.js";
import { createUpdatePlanTool } from "./tools/update-plan-tool.js";

describe("kibo-tools update_plan gating", () => {
  it("keeps update_plan disabled by default", () => {
    expect(isUpdatePlanToolEnabledForKiboTools({} as KiboConfig)).toBe(false);
  });

  it("registers update_plan when explicitly enabled", () => {
    const config = {
      tools: {
        experimental: {
          planTool: true,
        },
      },
    } as KiboConfig;

    expect(isUpdatePlanToolEnabledForKiboTools(config)).toBe(true);
    expect(createUpdatePlanTool().displaySummary).toBe("Track a short structured work plan.");
  });

  it("auto-enables update_plan for OpenAI-family providers", () => {
    expect(isUpdatePlanToolEnabledForKiboTools({} as KiboConfig, "openai")).toBe(true);
    expect(isUpdatePlanToolEnabledForKiboTools({} as KiboConfig, "openai-codex")).toBe(
      true,
    );
    expect(isUpdatePlanToolEnabledForKiboTools({} as KiboConfig, "anthropic")).toBe(false);
  });

  it("lets config disable update_plan auto-enable", () => {
    const config = {
      tools: {
        experimental: {
          planTool: false,
        },
      },
    } as KiboConfig;

    expect(isUpdatePlanToolEnabledForKiboTools(config, "openai")).toBe(false);
  });
});
