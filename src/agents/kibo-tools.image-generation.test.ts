import { describe, expect, it } from "vitest";
import { collectPresentKiboTools } from "./kibo-tools.registration.js";
import { textResult, type AnyAgentTool } from "./tools/common.js";

function stubAgentTool(name: string): AnyAgentTool {
  return {
    label: name,
    name,
    description: `${name} stub`,
    parameters: { type: "object", properties: {} },
    async execute() {
      return textResult("ok", {});
    },
  };
}

describe("kibo tools image generation registration", () => {
  it("registers image_generate when an image-generation tool is present", () => {
    const imageGenerateTool = stubAgentTool("image_generate");

    expect(collectPresentKiboTools([imageGenerateTool])).toEqual([imageGenerateTool]);
  });

  it("omits image_generate when the image-generation tool is absent", () => {
    expect(collectPresentKiboTools([null]).map((tool) => tool.name)).not.toContain(
      "image_generate",
    );
  });
});
