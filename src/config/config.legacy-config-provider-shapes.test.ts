import { describe, expect, it } from "vitest";
import { readConfigFileSnapshot, validateConfigObject } from "./config.js";
import { withTempHome, writeKiboConfig } from "./test-helpers.js";

describe("legacy provider-shaped config snapshots", () => {
  it("accepts a string map of voice aliases while still flagging legacy talk config", async () => {
    await withTempHome(async (home) => {
      await writeKiboConfig(home, {
        talk: {
          voiceAliases: {
            Kibo: "VoiceAlias1234567890",
            Roger: "CwhRBWXzGAHq8TQ4Fs17",
          },
        },
      });

      const snap = await readConfigFileSnapshot();

      expect(snap.valid).toBe(true);
      expect(snap.legacyIssues.some((issue) => issue.path === "talk")).toBe(true);
      expect(snap.sourceConfig.talk?.providers?.elevenlabs?.voiceAliases).toEqual({
        Kibo: "VoiceAlias1234567890",
        Roger: "CwhRBWXzGAHq8TQ4Fs17",
      });
    });
  });

  it("rejects non-string voice alias values", () => {
    const res = validateConfigObject({
      talk: {
        voiceAliases: {
          Kibo: 123,
        },
      },
    });
    expect(res.ok).toBe(false);
  });
});
