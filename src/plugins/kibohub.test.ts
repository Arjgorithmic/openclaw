import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import JSZip from "jszip";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const parseKiboHubPluginSpecMock = vi.fn();
const fetchKiboHubPackageDetailMock = vi.fn();
const fetchKiboHubPackageVersionMock = vi.fn();
const downloadKiboHubPackageArchiveMock = vi.fn();
const archiveCleanupMock = vi.fn();
const resolveLatestVersionFromPackageMock = vi.fn();
const resolveCompatibilityHostVersionMock = vi.fn();
const installPluginFromArchiveMock = vi.fn();

vi.mock("../infra/kibohub.js", async () => {
  const actual = await vi.importActual<typeof import("../infra/kibohub.js")>("../infra/kibohub.js");
  return {
    ...actual,
    parseKiboHubPluginSpec: (...args: unknown[]) => parseKiboHubPluginSpecMock(...args),
    fetchKiboHubPackageDetail: (...args: unknown[]) => fetchKiboHubPackageDetailMock(...args),
    fetchKiboHubPackageVersion: (...args: unknown[]) => fetchKiboHubPackageVersionMock(...args),
    downloadKiboHubPackageArchive: (...args: unknown[]) =>
      downloadKiboHubPackageArchiveMock(...args),
    resolveLatestVersionFromPackage: (...args: unknown[]) =>
      resolveLatestVersionFromPackageMock(...args),
  };
});

vi.mock("../version.js", () => ({
  resolveCompatibilityHostVersion: (...args: unknown[]) =>
    resolveCompatibilityHostVersionMock(...args),
}));

vi.mock("./install.js", () => ({
  installPluginFromArchive: (...args: unknown[]) => installPluginFromArchiveMock(...args),
}));

vi.mock("../infra/archive.js", async () => {
  const actual = await vi.importActual<typeof import("../infra/archive.js")>("../infra/archive.js");
  return {
    ...actual,
    DEFAULT_MAX_ENTRIES: 50_000,
    DEFAULT_MAX_EXTRACTED_BYTES: 512 * 1024 * 1024,
    DEFAULT_MAX_ENTRY_BYTES: 256 * 1024 * 1024,
  };
});

const { KiboHubRequestError } = await import("../infra/kibohub.js");
const { KIBOHUB_INSTALL_ERROR_CODE, formatKiboHubSpecifier, installPluginFromKiboHub } =
  await import("./kibohub.js");

const DEMO_ARCHIVE_INTEGRITY = "sha256-qerEjGEpvES2+Tyan0j2xwDRkbcnmh4ZFfKN9vWbsa8=";
const tempDirs: string[] = [];

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function createKiboHubArchive(entries: Record<string, string>) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kibo-kibohub-archive-"));
  tempDirs.push(dir);
  const archivePath = path.join(dir, "archive.zip");
  const zip = new JSZip();
  for (const [filePath, contents] of Object.entries(entries)) {
    zip.file(filePath, contents);
  }
  const archiveBytes = await zip.generateAsync({ type: "nodebuffer" });
  await fs.writeFile(archivePath, archiveBytes);
  return {
    archivePath,
    integrity: `sha256-${createHash("sha256").update(archiveBytes).digest("base64")}`,
  };
}

async function expectKiboHubInstallError(params: {
  setup?: () => void;
  spec: string;
  expected: {
    ok: false;
    code: (typeof KIBOHUB_INSTALL_ERROR_CODE)[keyof typeof KIBOHUB_INSTALL_ERROR_CODE];
    error: string;
  };
}) {
  params.setup?.();
  await expect(installPluginFromKiboHub({ spec: params.spec })).resolves.toMatchObject(
    params.expected,
  );
}

function createLoggerSpies() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
  };
}

function expectKiboHubInstallFlow(params: {
  baseUrl: string;
  version: string;
  archivePath: string;
}) {
  expect(fetchKiboHubPackageDetailMock).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "demo",
      baseUrl: params.baseUrl,
    }),
  );
  expect(fetchKiboHubPackageVersionMock).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "demo",
      version: params.version,
    }),
  );
  expect(installPluginFromArchiveMock).toHaveBeenCalledWith(
    expect.objectContaining({
      archivePath: params.archivePath,
    }),
  );
}

function expectSuccessfulKiboHubInstall(result: unknown) {
  expect(result).toMatchObject({
    ok: true,
    pluginId: "demo",
    version: "2026.3.22",
    kibohub: {
      source: "kibohub",
      kibohubPackage: "demo",
      kibohubFamily: "code-plugin",
      kibohubChannel: "official",
      integrity: DEMO_ARCHIVE_INTEGRITY,
    },
  });
}

describe("installPluginFromKiboHub", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })),
    );
  });

  beforeEach(() => {
    parseKiboHubPluginSpecMock.mockReset();
    fetchKiboHubPackageDetailMock.mockReset();
    fetchKiboHubPackageVersionMock.mockReset();
    downloadKiboHubPackageArchiveMock.mockReset();
    archiveCleanupMock.mockReset();
    resolveLatestVersionFromPackageMock.mockReset();
    resolveCompatibilityHostVersionMock.mockReset();
    installPluginFromArchiveMock.mockReset();

    parseKiboHubPluginSpecMock.mockReturnValue({ name: "demo" });
    fetchKiboHubPackageDetailMock.mockResolvedValue({
      package: {
        name: "demo",
        displayName: "Demo",
        family: "code-plugin",
        channel: "official",
        isOfficial: true,
        createdAt: 0,
        updatedAt: 0,
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    resolveLatestVersionFromPackageMock.mockReturnValue("2026.3.22");
    fetchKiboHubPackageVersionMock.mockResolvedValue({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: "a9eac48c6129bc44b6f93c9a9f48f6c700d191b7279a1e1915f28df6f59bb1af",
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValue({
      archivePath: "/tmp/kibohub-demo/archive.zip",
      integrity: DEMO_ARCHIVE_INTEGRITY,
      cleanup: archiveCleanupMock,
    });
    archiveCleanupMock.mockResolvedValue(undefined);
    resolveCompatibilityHostVersionMock.mockReturnValue("2026.3.22");
    installPluginFromArchiveMock.mockResolvedValue({
      ok: true,
      pluginId: "demo",
      targetDir: "/tmp/kibo/plugins/demo",
      version: "2026.3.22",
    });
  });

  it("formats kibohub specifiers", () => {
    expect(formatKiboHubSpecifier({ name: "demo" })).toBe("kibohub:demo");
    expect(formatKiboHubSpecifier({ name: "demo", version: "1.2.3" })).toBe("kibohub:demo@1.2.3");
  });

  it("installs a KiboHub code plugin through the archive installer", async () => {
    const logger = createLoggerSpies();
    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
      baseUrl: "https://github.com/Arjgorithmic/openclaw",
      logger,
    });

    expectKiboHubInstallFlow({
      baseUrl: "https://github.com/Arjgorithmic/openclaw",
      version: "2026.3.22",
      archivePath: "/tmp/kibohub-demo/archive.zip",
    });
    expectSuccessfulKiboHubInstall(result);
    expect(logger.info).toHaveBeenCalledWith("KiboHub code-plugin demo@2026.3.22 channel=official");
    expect(logger.info).toHaveBeenCalledWith(
      "Compatibility: pluginApi=>=2026.3.22 minGateway=2026.3.0",
    );
    expect(logger.warn).not.toHaveBeenCalled();
    expect(archiveCleanupMock).toHaveBeenCalledTimes(1);
  });

  it("passes dangerous force unsafe install through to archive installs", async () => {
    await installPluginFromKiboHub({
      spec: "kibohub:demo",
      dangerouslyForceUnsafeInstall: true,
    });

    expect(installPluginFromArchiveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        archivePath: "/tmp/kibohub-demo/archive.zip",
        dangerouslyForceUnsafeInstall: true,
      }),
    );
  });

  it("cleans up the downloaded archive even when archive install fails", async () => {
    installPluginFromArchiveMock.mockResolvedValueOnce({
      ok: false,
      error: "bad archive",
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
      baseUrl: "https://github.com/Arjgorithmic/openclaw",
    });

    expect(result).toMatchObject({
      ok: false,
      error: "bad archive",
    });
    expect(archiveCleanupMock).toHaveBeenCalledTimes(1);
  });

  it("accepts version-endpoint SHA-256 hashes expressed as raw hex", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: "a9eac48c6129bc44b6f93c9a9f48f6c700d191b7279a1e1915f28df6f59bb1af",
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      archivePath: "/tmp/kibohub-demo/archive.zip",
      integrity: "sha256-qerEjGEpvES2+Tyan0j2xwDRkbcnmh4ZFfKN9vWbsa8=",
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({ ok: true, pluginId: "demo" });
  });

  it("accepts version-endpoint SHA-256 hashes expressed as unpadded SRI", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: "sha256-qerEjGEpvES2+Tyan0j2xwDRkbcnmh4ZFfKN9vWbsa8",
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      archivePath: "/tmp/kibohub-demo/archive.zip",
      integrity: DEMO_ARCHIVE_INTEGRITY,
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({ ok: true, pluginId: "demo" });
  });

  it("falls back to strict files[] verification when sha256hash is missing", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
      "dist/index.js": 'export const demo = "ok";',
      "_meta.json": '{"slug":"demo","version":"2026.3.22"}',
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: null,
        files: [
          {
            path: "dist/index.js",
            size: 25,
            sha256: sha256Hex('export const demo = "ok";'),
          },
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });
    const logger = createLoggerSpies();

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
      logger,
    });

    expect(result).toMatchObject({ ok: true, pluginId: "demo" });
    expect(logger.warn).toHaveBeenCalledWith(
      'KiboHub package "demo@2026.3.22" is missing sha256hash; falling back to files[] verification. Validated files: dist/index.js, kibo.plugin.json. Validated generated metadata files present in archive: _meta.json (JSON parse plus slug/version match only).',
    );
  });

  it("validates _meta.json against canonical package and resolved version metadata", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
      "_meta.json": '{"slug":"demo","version":"2026.3.22"}',
    });
    parseKiboHubPluginSpecMock.mockReturnValueOnce({ name: "DemoAlias", version: "latest" });
    fetchKiboHubPackageDetailMock.mockResolvedValueOnce({
      package: {
        name: "demo",
        displayName: "Demo",
        family: "code-plugin",
        channel: "official",
        isOfficial: true,
        createdAt: 0,
        updatedAt: 0,
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: null,
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });
    const logger = createLoggerSpies();

    const result = await installPluginFromKiboHub({
      spec: "kibohub:DemoAlias@latest",
      logger,
    });

    expect(result).toMatchObject({ ok: true, pluginId: "demo", version: "2026.3.22" });
    expect(fetchKiboHubPackageDetailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "DemoAlias",
      }),
    );
    expect(fetchKiboHubPackageVersionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "demo",
        version: "latest",
      }),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'KiboHub package "demo@2026.3.22" is missing sha256hash; falling back to files[] verification. Validated files: kibo.plugin.json. Validated generated metadata files present in archive: _meta.json (JSON parse plus slug/version match only).',
    );
  });

  it("fails closed when sha256hash is present but unrecognized instead of silently falling back", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: "definitely-not-a-sha256",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" has an invalid sha256hash (unrecognized value "definitely-not-a-sha256").',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects KiboHub installs when sha256hash is explicitly null and files[] is unavailable", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: null,
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" is missing sha256hash and usable files[] metadata for fallback archive verification.',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects KiboHub installs when the version metadata has no archive hash or fallback files[]", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" is missing sha256hash and usable files[] metadata for fallback archive verification.',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("fails closed when files[] contains a malformed entry", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [null as unknown as { path: string; sha256: string }],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" has an invalid files[0] entry (expected an object, got null).',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("fails closed when files[] contains an invalid sha256", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: "not-a-digest",
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" has an invalid files[0].sha256 (value "not-a-digest" is not a 64-character hexadecimal SHA-256 digest).',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("fails closed when sha256hash is not a string", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: 123 as unknown as string,
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" has an invalid sha256hash (non-string value of type number).',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("returns a typed install failure when the archive download throws", async () => {
    downloadKiboHubPackageArchiveMock.mockRejectedValueOnce(new Error("network timeout"));

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      error: "network timeout",
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("returns a typed install failure when fallback archive verification cannot read the zip", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kibo-kibohub-archive-"));
    tempDirs.push(dir);
    const archivePath = path.join(dir, "archive.zip");
    await fs.writeFile(archivePath, "not-a-zip", "utf8");
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      archivePath,
      integrity: "sha256-not-used-in-fallback",
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error: "KiboHub archive fallback verification failed while reading the downloaded archive.",
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects KiboHub installs when the downloaded archive hash drifts from metadata", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        sha256hash: "1111111111111111111111111111111111111111111111111111111111111111",
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      archivePath: "/tmp/kibohub-demo/archive.zip",
      integrity: DEMO_ARCHIVE_INTEGRITY,
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error: `KiboHub archive integrity mismatch for "demo@2026.3.22": expected sha256-ERERERERERERERERERERERERERERERERERERERERERE=, got ${DEMO_ARCHIVE_INTEGRITY}.`,
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
    expect(archiveCleanupMock).toHaveBeenCalledTimes(1);
  });

  it("rejects fallback verification when an expected file is missing from the archive", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
          {
            path: "dist/index.js",
            size: 25,
            sha256: sha256Hex('export const demo = "ok";'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error:
        'KiboHub archive contents do not match files[] metadata for "demo@2026.3.22": missing "dist/index.js".',
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback verification when the archive includes an unexpected file", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
      "dist/index.js": 'export const demo = "ok";',
      "extra.txt": "surprise",
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
          {
            path: "dist/index.js",
            size: 25,
            sha256: sha256Hex('export const demo = "ok";'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error:
        'KiboHub archive contents do not match files[] metadata for "demo@2026.3.22": unexpected file "extra.txt".',
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("accepts root-level files[] paths and allows _meta.json as an unvalidated generated file", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kibo-kibohub-archive-"));
    tempDirs.push(dir);
    const archivePath = path.join(dir, "archive.zip");
    const zip = new JSZip();
    zip.file("scripts/search.py", "print('ok')\n");
    zip.file("SKILL.md", "# Demo\n");
    zip.file("_meta.json", '{"slug":"demo","version":"2026.3.22"}');
    const archiveBytes = await zip.generateAsync({ type: "nodebuffer" });
    await fs.writeFile(archivePath, archiveBytes);
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "scripts/search.py",
            size: 12,
            sha256: sha256Hex("print('ok')\n"),
          },
          {
            path: "SKILL.md",
            size: 7,
            sha256: sha256Hex("# Demo\n"),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      archivePath,
      integrity: `sha256-${createHash("sha256").update(archiveBytes).digest("base64")}`,
      cleanup: archiveCleanupMock,
    });
    const logger = createLoggerSpies();

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
      logger,
    });

    expect(result).toMatchObject({ ok: true, pluginId: "demo" });
    expect(logger.warn).toHaveBeenCalledWith(
      'KiboHub package "demo@2026.3.22" is missing sha256hash; falling back to files[] verification. Validated files: SKILL.md, scripts/search.py. Validated generated metadata files present in archive: _meta.json (JSON parse plus slug/version match only).',
    );
  });

  it("omits the skipped-files suffix when no generated extras are present", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });
    const logger = createLoggerSpies();

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
      logger,
    });

    expect(result).toMatchObject({ ok: true, pluginId: "demo" });
    expect(logger.warn).toHaveBeenCalledWith(
      'KiboHub package "demo@2026.3.22" is missing sha256hash; falling back to files[] verification. Validated files: kibo.plugin.json.',
    );
  });

  it("rejects fallback verification when _meta.json is not valid JSON", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
      "_meta.json": "{not-json",
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error:
        'KiboHub archive contents do not match files[] metadata for "demo@2026.3.22": _meta.json is not valid JSON.',
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback verification when _meta.json slug does not match the package name", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
      "_meta.json": '{"slug":"wrong","version":"2026.3.22"}',
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error:
        'KiboHub archive contents do not match files[] metadata for "demo@2026.3.22": _meta.json slug does not match the package name.',
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback verification when _meta.json exceeds the per-file size limit", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kibo-kibohub-archive-"));
    tempDirs.push(dir);
    const archivePath = path.join(dir, "archive.zip");
    await fs.writeFile(archivePath, "placeholder", "utf8");
    const oversizedMetaEntry = {
      name: "_meta.json",
      dir: false,
      _data: { uncompressedSize: 256 * 1024 * 1024 + 1 },
      nodeStream: vi.fn(),
    } as unknown as JSZip.JSZipObject;
    const listedFileEntry = {
      name: "kibo.plugin.json",
      dir: false,
      _data: { uncompressedSize: 13 },
      nodeStream: () => Readable.from([Buffer.from('{"id":"demo"}')]),
    } as unknown as JSZip.JSZipObject;
    const loadAsyncSpy = vi.spyOn(JSZip, "loadAsync").mockResolvedValueOnce({
      files: {
        "_meta.json": oversizedMetaEntry,
        "kibo.plugin.json": listedFileEntry,
      },
    } as unknown as JSZip);
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      archivePath,
      integrity: "sha256-not-used-in-fallback",
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    loadAsyncSpy.mockRestore();
    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error:
        'KiboHub archive fallback verification rejected "_meta.json" because it exceeds the per-file size limit.',
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback verification when archive directories alone exceed the entry limit", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kibo-kibohub-archive-"));
    tempDirs.push(dir);
    const archivePath = path.join(dir, "archive.zip");
    await fs.writeFile(archivePath, "placeholder", "utf8");
    const zipEntries = Object.fromEntries(
      Array.from({ length: 50_001 }, (_, index) => [
        `folder-${index}/`,
        {
          name: `folder-${index}/`,
          dir: true,
        },
      ]),
    );
    const loadAsyncSpy = vi.spyOn(JSZip, "loadAsync").mockResolvedValueOnce({
      files: zipEntries,
    } as unknown as JSZip);
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      archivePath,
      integrity: "sha256-not-used-in-fallback",
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    loadAsyncSpy.mockRestore();
    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error: "KiboHub archive fallback verification exceeded the archive entry limit.",
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback verification when the downloaded archive exceeds the ZIP size limit", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kibo-kibohub-archive-"));
    tempDirs.push(dir);
    const archivePath = path.join(dir, "archive.zip");
    await fs.writeFile(archivePath, "placeholder", "utf8");
    const realStat = fs.stat.bind(fs);
    const statSpy = vi.spyOn(fs, "stat").mockImplementation(async (filePath, options) => {
      if (filePath === archivePath) {
        return {
          size: 256 * 1024 * 1024 + 1,
        } as Awaited<ReturnType<typeof fs.stat>>;
      }
      return await realStat(filePath, options);
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      archivePath,
      integrity: "sha256-not-used-in-fallback",
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    statSpy.mockRestore();
    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error:
        "KiboHub archive fallback verification rejected the downloaded archive because it exceeds the ZIP archive size limit.",
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback verification when a file hash drifts from files[] metadata", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: "1".repeat(64),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error: `KiboHub archive contents do not match files[] metadata for "demo@2026.3.22": expected kibo.plugin.json to hash to ${"1".repeat(64)}, got ${sha256Hex('{"id":"demo"}')}.`,
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback metadata with an unsafe files[] path", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "../evil.txt",
            size: 4,
            sha256: "1".repeat(64),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" has an invalid files[0].path (path "../evil.txt" contains dot segments).',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback metadata with leading or trailing path whitespace", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json ",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" has an invalid files[0].path (path "kibo.plugin.json " has leading or trailing whitespace).',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback verification when the archive includes a whitespace-suffixed file path", async () => {
    const archive = await createKiboHubArchive({
      "kibo.plugin.json": '{"id":"demo"}',
      "kibo.plugin.json ": '{"id":"demo"}',
    });
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });
    downloadKiboHubPackageArchiveMock.mockResolvedValueOnce({
      ...archive,
      cleanup: archiveCleanupMock,
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      error:
        'KiboHub archive contents do not match files[] metadata for "demo@2026.3.22": invalid package file path "kibo.plugin.json " (path "kibo.plugin.json " has leading or trailing whitespace).',
    });
    expect(installPluginFromArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback metadata with duplicate files[] paths", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
          {
            path: "kibo.plugin.json",
            size: 13,
            sha256: sha256Hex('{"id":"demo"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" has duplicate files[] path "kibo.plugin.json".',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it("rejects fallback metadata when files[] includes generated _meta.json", async () => {
    fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
      version: {
        version: "2026.3.22",
        createdAt: 0,
        changelog: "",
        files: [
          {
            path: "_meta.json",
            size: 64,
            sha256: sha256Hex('{"slug":"demo","version":"2026.3.22"}'),
          },
        ],
        compatibility: {
          pluginApiRange: ">=2026.3.22",
          minGatewayVersion: "2026.3.0",
        },
      },
    });

    const result = await installPluginFromKiboHub({
      spec: "kibohub:demo",
    });

    expect(result).toMatchObject({
      ok: false,
      code: KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      error:
        'KiboHub version metadata for "demo@2026.3.22" must not include generated file "_meta.json" in files[].',
    });
    expect(downloadKiboHubPackageArchiveMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "rejects packages whose plugin API range exceeds the runtime version",
      setup: () => {
        resolveCompatibilityHostVersionMock.mockReturnValueOnce("2026.3.21");
      },
      spec: "kibohub:demo",
      expected: {
        ok: false,
        code: KIBOHUB_INSTALL_ERROR_CODE.INCOMPATIBLE_PLUGIN_API,
        error:
          'Plugin "demo" requires plugin API >=2026.3.22, but this Kibo runtime exposes 2026.3.21.',
      },
    },
    {
      name: "rejects skill families and redirects to skills install",
      setup: () => {
        fetchKiboHubPackageDetailMock.mockResolvedValueOnce({
          package: {
            name: "calendar",
            displayName: "Calendar",
            family: "skill",
            channel: "official",
            isOfficial: true,
            createdAt: 0,
            updatedAt: 0,
          },
        });
      },
      spec: "kibohub:calendar",
      expected: {
        ok: false,
        code: KIBOHUB_INSTALL_ERROR_CODE.SKILL_PACKAGE,
        error: '"calendar" is a skill. Use "kibo skills install calendar" instead.',
      },
    },
    {
      name: "redirects skill families before missing archive metadata checks",
      setup: () => {
        fetchKiboHubPackageDetailMock.mockResolvedValueOnce({
          package: {
            name: "calendar",
            displayName: "Calendar",
            family: "skill",
            channel: "official",
            isOfficial: true,
            createdAt: 0,
            updatedAt: 0,
          },
        });
        fetchKiboHubPackageVersionMock.mockResolvedValueOnce({
          version: {
            version: "2026.3.22",
            createdAt: 0,
            changelog: "",
          },
        });
      },
      spec: "kibohub:calendar",
      expected: {
        ok: false,
        code: KIBOHUB_INSTALL_ERROR_CODE.SKILL_PACKAGE,
        error: '"calendar" is a skill. Use "kibo skills install calendar" instead.',
      },
    },
    {
      name: "returns typed package-not-found failures",
      setup: () => {
        fetchKiboHubPackageDetailMock.mockRejectedValueOnce(
          new KiboHubRequestError({
            path: "/api/v1/packages/demo",
            status: 404,
            body: "Package not found",
          }),
        );
      },
      spec: "kibohub:demo",
      expected: {
        ok: false,
        code: KIBOHUB_INSTALL_ERROR_CODE.PACKAGE_NOT_FOUND,
        error: "Package not found on KiboHub.",
      },
    },
    {
      name: "returns typed version-not-found failures",
      setup: () => {
        parseKiboHubPluginSpecMock.mockReturnValueOnce({ name: "demo", version: "9.9.9" });
        fetchKiboHubPackageVersionMock.mockRejectedValueOnce(
          new KiboHubRequestError({
            path: "/api/v1/packages/demo/versions/9.9.9",
            status: 404,
            body: "Version not found",
          }),
        );
      },
      spec: "kibohub:demo@9.9.9",
      expected: {
        ok: false,
        code: KIBOHUB_INSTALL_ERROR_CODE.VERSION_NOT_FOUND,
        error: "Version not found on KiboHub: demo@9.9.9.",
      },
    },
  ] as const)("$name", async ({ setup, spec, expected }) => {
    await expectKiboHubInstallError({ setup, spec, expected });
  });
});
