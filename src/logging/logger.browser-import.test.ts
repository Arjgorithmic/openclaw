import { afterEach, describe, expect, it, vi } from "vitest";
import { importFreshModule } from "../../test/helpers/import-fresh.js";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredKiboTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredKiboTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredKiboTmpDir =
    params?.resolvePreferredKiboTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredKiboTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-kibo-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-kibo-dir.js")>(
      "../infra/tmp-kibo-dir.js",
    );
    return {
      ...actual,
      resolvePreferredKiboTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredKiboTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-kibo-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredKiboTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredKiboTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/kibo");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/kibo/kibo.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredKiboTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toMatchObject({
      level: "silent",
      file: "/tmp/kibo/kibo.log",
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(() => module.getLogger().info("browser-safe")).not.toThrow();
    expect(resolvePreferredKiboTmpDir).not.toHaveBeenCalled();
  });
});
