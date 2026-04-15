import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { withTempDir } from "./test-helpers/temp-dir.js";
import {
  ensureDir,
  resolveConfigDir,
  resolveHomeDir,
  resolveUserPath,
  shortenHomeInString,
  shortenHomePath,
  sleep,
} from "./utils.js";

describe("ensureDir", () => {
  it("creates nested directory", async () => {
    await withTempDir({ prefix: "kibo-test-" }, async (tmp) => {
      const target = path.join(tmp, "nested", "dir");
      await ensureDir(target);
      expect(fs.existsSync(target)).toBe(true);
    });
  });
});

describe("sleep", () => {
  it("resolves after delay using fake timers", async () => {
    vi.useFakeTimers();
    const promise = sleep(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe("resolveConfigDir", () => {
  it("prefers ~/.kibo when legacy dir is missing", async () => {
    await withTempDir({ prefix: "kibo-config-dir-" }, async (root) => {
      const newDir = path.join(root, ".kibo");
      await fs.promises.mkdir(newDir, { recursive: true });
      const resolved = resolveConfigDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("expands KIBO_STATE_DIR using the provided env", () => {
    const env = {
      HOME: "/tmp/kibo-home",
      KIBO_STATE_DIR: "~/state",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/kibo-home", "state"));
  });

  it("falls back to the config file directory when only KIBO_CONFIG_PATH is set", () => {
    const env = {
      HOME: "/tmp/kibo-home",
      KIBO_CONFIG_PATH: "~/profiles/dev/kibo.json",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/kibo-home", "profiles", "dev"));
  });
});

describe("resolveHomeDir", () => {
  it("prefers KIBO_HOME over HOME", () => {
    vi.stubEnv("KIBO_HOME", "/srv/kibo-home");
    vi.stubEnv("HOME", "/home/other");

    expect(resolveHomeDir()).toBe(path.resolve("/srv/kibo-home"));

    vi.unstubAllEnvs();
  });
});

describe("shortenHomePath", () => {
  it("uses $KIBO_HOME prefix when KIBO_HOME is set", () => {
    vi.stubEnv("KIBO_HOME", "/srv/kibo-home");
    vi.stubEnv("HOME", "/home/other");

    expect(shortenHomePath(`${path.resolve("/srv/kibo-home")}/.kibo/kibo.json`)).toBe(
      "$KIBO_HOME/.kibo/kibo.json",
    );

    vi.unstubAllEnvs();
  });
});

describe("shortenHomeInString", () => {
  it("uses $KIBO_HOME replacement when KIBO_HOME is set", () => {
    vi.stubEnv("KIBO_HOME", "/srv/kibo-home");
    vi.stubEnv("HOME", "/home/other");

    expect(
      shortenHomeInString(`config: ${path.resolve("/srv/kibo-home")}/.kibo/kibo.json`),
    ).toBe("config: $KIBO_HOME/.kibo/kibo.json");

    vi.unstubAllEnvs();
  });
});

describe("resolveUserPath", () => {
  it("expands ~ to home dir", () => {
    expect(resolveUserPath("~", {}, () => "/Users/thoffman")).toBe(path.resolve("/Users/thoffman"));
  });

  it("expands ~/ to home dir", () => {
    expect(resolveUserPath("~/kibo", {}, () => "/Users/thoffman")).toBe(
      path.resolve("/Users/thoffman", "kibo"),
    );
  });

  it("resolves relative paths", () => {
    expect(resolveUserPath("tmp/dir")).toBe(path.resolve("tmp/dir"));
  });

  it("prefers KIBO_HOME for tilde expansion", () => {
    vi.stubEnv("KIBO_HOME", "/srv/kibo-home");
    vi.stubEnv("HOME", "/home/other");

    expect(resolveUserPath("~/kibo")).toBe(path.resolve("/srv/kibo-home", "kibo"));

    vi.unstubAllEnvs();
  });

  it("uses the provided env for tilde expansion", () => {
    const env = {
      HOME: "/tmp/kibo-home",
      KIBO_HOME: "/srv/kibo-home",
    } as NodeJS.ProcessEnv;

    expect(resolveUserPath("~/kibo", env)).toBe(path.resolve("/srv/kibo-home", "kibo"));
  });

  it("keeps blank paths blank", () => {
    expect(resolveUserPath("")).toBe("");
    expect(resolveUserPath("   ")).toBe("");
  });

  it("returns empty string for undefined/null input", () => {
    expect(resolveUserPath(undefined as unknown as string)).toBe("");
    expect(resolveUserPath(null as unknown as string)).toBe("");
  });
});
