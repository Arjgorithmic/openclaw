import { describe, expect, it } from "vitest";
import { resolveEmojiAndHomepage } from "./entry-metadata.js";

describe("shared/entry-metadata", () => {
  it("prefers metadata emoji and homepage when present", () => {
    expect(
      resolveEmojiAndHomepage({
        metadata: { emoji: "🦀", homepage: " https://github.com/Arjgorithmic/openclaw " },
        frontmatter: { emoji: "🙂", homepage: "https://example.com" },
      }),
    ).toEqual({
      emoji: "🦀",
      homepage: "https://github.com/Arjgorithmic/openclaw",
    });
  });

  it("keeps metadata precedence even when metadata values are blank", () => {
    expect(
      resolveEmojiAndHomepage({
        metadata: { emoji: "", homepage: "   " },
        frontmatter: { emoji: "🙂", homepage: "https://example.com" },
      }),
    ).toEqual({});
  });

  it("falls back through frontmatter homepage aliases and drops blanks", () => {
    expect(
      resolveEmojiAndHomepage({
        frontmatter: { emoji: "🙂", website: " https://github.com/Arjgorithmic/openclaw " },
      }),
    ).toEqual({
      emoji: "🙂",
      homepage: "https://github.com/Arjgorithmic/openclaw",
    });
    expect(
      resolveEmojiAndHomepage({
        metadata: { homepage: "   " },
        frontmatter: { url: "   " },
      }),
    ).toEqual({});
    expect(
      resolveEmojiAndHomepage({
        frontmatter: { url: " https://github.com/Arjgorithmic/openclaw/install " },
      }),
    ).toEqual({
      homepage: "https://github.com/Arjgorithmic/openclaw/install",
    });
  });

  it("does not fall back once frontmatter homepage aliases are present but blank", () => {
    expect(
      resolveEmojiAndHomepage({
        frontmatter: {
          homepage: " ",
          website: "https://github.com/Arjgorithmic/openclaw",
          url: "https://github.com/Arjgorithmic/openclaw/install",
        },
      }),
    ).toEqual({});
  });
});
