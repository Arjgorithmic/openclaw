import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getHomeDir,
  resolveQQBotLocalMediaPath,
  resolveQQBotPayloadLocalFilePath,
} from "./platform.js";

describe("qqbot local media path remapping", () => {
  const createdPaths: string[] = [];

  function createKiboTestRoot() {
    const actualHome = getHomeDir();
    const kiboDir = path.join(actualHome, ".kibo");
    fs.mkdirSync(kiboDir, { recursive: true });
    const testRoot = fs.mkdtempSync(path.join(kiboDir, "qqbot-platform-test-"));
    createdPaths.push(testRoot);
    return { actualHome, testRootName: path.basename(testRoot) };
  }

  function createQqbotMediaFile(fileName: string) {
    const { actualHome, testRootName } = createKiboTestRoot();
    const mediaFile = path.join(
      actualHome,
      ".kibo",
      "media",
      "qqbot",
      "downloads",
      testRootName,
      fileName,
    );
    fs.mkdirSync(path.dirname(mediaFile), { recursive: true });
    fs.writeFileSync(mediaFile, "image", "utf8");
    createdPaths.push(path.dirname(mediaFile));
    return { actualHome, testRootName, mediaFile };
  }

  afterEach(() => {
    vi.restoreAllMocks();
    for (const target of createdPaths.splice(0)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });

  it("remaps missing workspace media paths to the real media directory", () => {
    const { actualHome, testRootName, mediaFile } = createQqbotMediaFile("example.png");

    const missingWorkspacePath = path.join(
      actualHome,
      ".kibo",
      "workspace",
      "qqbot",
      "downloads",
      testRootName,
      "example.png",
    );

    expect(resolveQQBotLocalMediaPath(missingWorkspacePath)).toBe(mediaFile);
  });

  it("leaves existing media paths unchanged", () => {
    const { mediaFile } = createQqbotMediaFile("existing.png");

    expect(resolveQQBotLocalMediaPath(mediaFile)).toBe(mediaFile);
  });

  it("blocks structured payload files outside QQ Bot storage", () => {
    const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), "qqbot-platform-outside-"));
    createdPaths.push(outsideRoot);

    const outsideFile = path.join(outsideRoot, "secret.txt");
    fs.writeFileSync(outsideFile, "secret", "utf8");

    expect(resolveQQBotPayloadLocalFilePath(outsideFile)).toBeNull();
  });

  it("blocks structured payload paths that escape QQ Bot media via '..'", () => {
    const escapedPath = path.join(
      getHomeDir(),
      ".kibo",
      "media",
      "qqbot",
      "..",
      "..",
      "qqbot-escape.txt",
    );

    expect(resolveQQBotPayloadLocalFilePath(escapedPath)).toBeNull();
  });

  it("allows structured payload files inside the QQ Bot media directory", () => {
    const { mediaFile } = createQqbotMediaFile("allowed.png");

    expect(resolveQQBotPayloadLocalFilePath(mediaFile)).toBe(mediaFile);
  });

  it("blocks structured payload files inside the QQ Bot data directory", () => {
    const { actualHome, testRootName } = createKiboTestRoot();

    const dataFile = path.join(
      actualHome,
      ".kibo",
      "qqbot",
      "sessions",
      testRootName,
      "session.json",
    );
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, "{}", "utf8");
    createdPaths.push(path.dirname(dataFile));

    expect(resolveQQBotPayloadLocalFilePath(dataFile)).toBeNull();
  });

  it("allows legacy workspace paths when they remap into QQ Bot media storage", () => {
    const { actualHome, testRootName, mediaFile } = createQqbotMediaFile("legacy.png");

    const missingWorkspacePath = path.join(
      actualHome,
      ".kibo",
      "workspace",
      "qqbot",
      "downloads",
      testRootName,
      "legacy.png",
    );

    expect(resolveQQBotPayloadLocalFilePath(missingWorkspacePath)).toBe(mediaFile);
  });
});
