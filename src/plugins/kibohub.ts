import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import JSZip from "jszip";
import {
  DEFAULT_MAX_ARCHIVE_BYTES_ZIP,
  DEFAULT_MAX_ENTRIES,
  DEFAULT_MAX_EXTRACTED_BYTES,
  DEFAULT_MAX_ENTRY_BYTES,
} from "../infra/archive.js";
import {
  KiboHubRequestError,
  downloadKiboHubPackageArchive,
  fetchKiboHubPackageDetail,
  fetchKiboHubPackageVersion,
  normalizeKiboHubSha256Integrity,
  normalizeKiboHubSha256Hex,
  parseKiboHubPluginSpec,
  resolveLatestVersionFromPackage,
  satisfiesGatewayMinimum,
  satisfiesPluginApiRange,
  type KiboHubPackageChannel,
  type KiboHubPackageCompatibility,
  type KiboHubPackageDetail,
  type KiboHubPackageFamily,
  type KiboHubPackageVersion,
} from "../infra/kibohub.js";
import { formatErrorMessage } from "../infra/errors.js";
import { normalizeOptionalString } from "../shared/string-coerce.js";
import { resolveCompatibilityHostVersion } from "../version.js";
import type { InstallSafetyOverrides } from "./install-security-scan.js";
import { installPluginFromArchive, type InstallPluginResult } from "./install.js";

export const KIBOHUB_INSTALL_ERROR_CODE = {
  INVALID_SPEC: "invalid_spec",
  PACKAGE_NOT_FOUND: "package_not_found",
  VERSION_NOT_FOUND: "version_not_found",
  NO_INSTALLABLE_VERSION: "no_installable_version",
  SKILL_PACKAGE: "skill_package",
  UNSUPPORTED_FAMILY: "unsupported_family",
  PRIVATE_PACKAGE: "private_package",
  INCOMPATIBLE_PLUGIN_API: "incompatible_plugin_api",
  INCOMPATIBLE_GATEWAY: "incompatible_gateway",
  MISSING_ARCHIVE_INTEGRITY: "missing_archive_integrity",
  ARCHIVE_INTEGRITY_MISMATCH: "archive_integrity_mismatch",
} as const;

export type KiboHubInstallErrorCode =
  (typeof KIBOHUB_INSTALL_ERROR_CODE)[keyof typeof KIBOHUB_INSTALL_ERROR_CODE];

type PluginInstallLogger = {
  info?: (message: string) => void;
  warn?: (message: string) => void;
};

export type KiboHubPluginInstallRecordFields = {
  source: "kibohub";
  kibohubUrl: string;
  kibohubPackage: string;
  kibohubFamily: Exclude<KiboHubPackageFamily, "skill">;
  kibohubChannel?: KiboHubPackageChannel;
  version?: string;
  integrity?: string;
  resolvedAt?: string;
  installedAt?: string;
};

type KiboHubInstallFailure = {
  ok: false;
  error: string;
  code?: KiboHubInstallErrorCode;
};

type KiboHubFileEntryLike = {
  path?: unknown;
  sha256?: unknown;
};

type KiboHubFileVerificationEntry = {
  path: string;
  sha256: string;
};

type KiboHubArchiveVerification =
  | {
      kind: "archive-integrity";
      integrity: string;
    }
  | {
      kind: "file-list";
      files: KiboHubFileVerificationEntry[];
    };

type KiboHubArchiveVerificationResolution =
  | {
      ok: true;
      verification: KiboHubArchiveVerification | null;
    }
  | KiboHubInstallFailure;

type KiboHubArchiveFileVerificationResult =
  | {
      ok: true;
      validatedGeneratedPaths: string[];
    }
  | KiboHubInstallFailure;

type JSZipObjectWithSize = JSZip.JSZipObject & {
  // Internal JSZip field from loadAsync() metadata. Use it only as a best-effort
  // size hint; the streaming byte checks below are the authoritative guard.
  _data?: {
    uncompressedSize?: number;
  };
};

const KIBOHUB_GENERATED_ARCHIVE_METADATA_FILE = "_meta.json";

type KiboHubArchiveEntryLimits = {
  maxEntryBytes: number;
  addArchiveBytes: (bytes: number) => boolean;
};

export function formatKiboHubSpecifier(params: { name: string; version?: string }): string {
  return `kibohub:${params.name}${params.version ? `@${params.version}` : ""}`;
}

function buildKiboHubInstallFailure(
  error: string,
  code?: KiboHubInstallErrorCode,
): KiboHubInstallFailure {
  return { ok: false, error, code };
}

function isKiboHubInstallFailure(value: unknown): value is KiboHubInstallFailure {
  return Boolean(
    value &&
    typeof value === "object" &&
    "ok" in value &&
    (value as { ok?: unknown }).ok === false &&
    "error" in value,
  );
}

function mapKiboHubRequestError(
  error: unknown,
  context: { stage: "package" | "version"; name: string; version?: string },
): KiboHubInstallFailure {
  if (error instanceof KiboHubRequestError && error.status === 404) {
    if (context.stage === "package") {
      return buildKiboHubInstallFailure(
        "Package not found on KiboHub.",
        KIBOHUB_INSTALL_ERROR_CODE.PACKAGE_NOT_FOUND,
      );
    }
    return buildKiboHubInstallFailure(
      `Version not found on KiboHub: ${context.name}@${context.version ?? "unknown"}.`,
      KIBOHUB_INSTALL_ERROR_CODE.VERSION_NOT_FOUND,
    );
  }
  return buildKiboHubInstallFailure(formatErrorMessage(error));
}

function resolveRequestedVersion(params: {
  detail: KiboHubPackageDetail;
  requestedVersion?: string;
}): string | null {
  if (params.requestedVersion) {
    return params.requestedVersion;
  }
  return resolveLatestVersionFromPackage(params.detail);
}

function readTrimmedString(value: unknown): string | null {
  return normalizeOptionalString(value) ?? null;
}

function normalizeKiboHubRelativePath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }
  if (value.trim() !== value || value.includes("\\")) {
    return null;
  }
  if (value.startsWith("/")) {
    return null;
  }
  const segments = value.split("/");
  if (segments.some((segment) => segment.length === 0 || segment === "." || segment === "..")) {
    return null;
  }
  return value;
}

function describeInvalidKiboHubRelativePath(value: unknown): string {
  if (typeof value !== "string") {
    return `non-string value of type ${typeof value}`;
  }
  if (value.length === 0) {
    return "empty string";
  }
  if (value.trim() !== value) {
    return `path "${value}" has leading or trailing whitespace`;
  }
  if (value.includes("\\")) {
    return `path "${value}" contains backslashes`;
  }
  if (value.startsWith("/")) {
    return `path "${value}" is absolute`;
  }
  const segments = value.split("/");
  if (segments.some((segment) => segment.length === 0)) {
    return `path "${value}" contains an empty segment`;
  }
  if (segments.some((segment) => segment === "." || segment === "..")) {
    return `path "${value}" contains dot segments`;
  }
  return `path "${value}" failed validation for an unknown reason`;
}

function describeInvalidKiboHubSha256(value: unknown): string {
  if (typeof value !== "string") {
    return `non-string value of type ${typeof value}`;
  }
  if (value.length === 0) {
    return "empty string";
  }
  if (value.trim().length === 0) {
    return "whitespace-only string";
  }
  return `value "${value}" is not a 64-character hexadecimal SHA-256 digest`;
}

function resolveKiboHubArchiveVerification(
  versionDetail: KiboHubPackageVersion,
  packageName: string,
  version: string,
): KiboHubArchiveVerificationResolution {
  const sha256hashValue = versionDetail.version?.sha256hash;
  const sha256hash = readTrimmedString(sha256hashValue);
  const integrity = sha256hash ? normalizeKiboHubSha256Integrity(sha256hash) : null;
  if (integrity) {
    return {
      ok: true,
      verification: {
        kind: "archive-integrity",
        integrity,
      },
    };
  }
  if (sha256hashValue !== undefined && sha256hashValue !== null) {
    const detail =
      typeof sha256hashValue === "string" && sha256hashValue.trim().length === 0
        ? "empty string"
        : typeof sha256hashValue === "string"
          ? `unrecognized value "${sha256hashValue.trim()}"`
          : `non-string value of type ${typeof sha256hashValue}`;
    return buildKiboHubInstallFailure(
      `KiboHub version metadata for "${packageName}@${version}" has an invalid sha256hash (${detail}).`,
      KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
    );
  }
  const files = versionDetail.version?.files;
  if (!Array.isArray(files) || files.length === 0) {
    return {
      ok: true,
      verification: null,
    };
  }
  const normalizedFiles: KiboHubFileVerificationEntry[] = [];
  const seenPaths = new Set<string>();
  for (const [index, file] of files.entries()) {
    if (!file || typeof file !== "object") {
      return buildKiboHubInstallFailure(
        `KiboHub version metadata for "${packageName}@${version}" has an invalid files[${index}] entry (expected an object, got ${file === null ? "null" : typeof file}).`,
        KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      );
    }
    const fileRecord = file as KiboHubFileEntryLike;
    const filePath = normalizeKiboHubRelativePath(fileRecord.path);
    const sha256Value = readTrimmedString(fileRecord.sha256);
    const sha256 = sha256Value ? normalizeKiboHubSha256Hex(sha256Value) : null;
    if (!filePath) {
      return buildKiboHubInstallFailure(
        `KiboHub version metadata for "${packageName}@${version}" has an invalid files[${index}].path (${describeInvalidKiboHubRelativePath(fileRecord.path)}).`,
        KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      );
    }
    if (filePath === KIBOHUB_GENERATED_ARCHIVE_METADATA_FILE) {
      return buildKiboHubInstallFailure(
        `KiboHub version metadata for "${packageName}@${version}" must not include generated file "${filePath}" in files[].`,
        KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      );
    }
    if (!sha256) {
      return buildKiboHubInstallFailure(
        `KiboHub version metadata for "${packageName}@${version}" has an invalid files[${index}].sha256 (${describeInvalidKiboHubSha256(fileRecord.sha256)}).`,
        KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      );
    }
    if (seenPaths.has(filePath)) {
      return buildKiboHubInstallFailure(
        `KiboHub version metadata for "${packageName}@${version}" has duplicate files[] path "${filePath}".`,
        KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
      );
    }
    seenPaths.add(filePath);
    normalizedFiles.push({ path: filePath, sha256 });
  }
  return {
    ok: true,
    verification: {
      kind: "file-list",
      files: normalizedFiles,
    },
  };
}

async function readLimitedKiboHubArchiveEntry<T>(
  entry: JSZip.JSZipObject,
  limits: KiboHubArchiveEntryLimits,
  handlers: {
    onChunk: (buffer: Buffer) => void;
    onEnd: () => T;
  },
): Promise<T | KiboHubInstallFailure> {
  const hintedSize = (entry as JSZipObjectWithSize)._data?.uncompressedSize;
  if (
    typeof hintedSize === "number" &&
    Number.isFinite(hintedSize) &&
    hintedSize > limits.maxEntryBytes
  ) {
    return buildKiboHubInstallFailure(
      `KiboHub archive fallback verification rejected "${entry.name}" because it exceeds the per-file size limit.`,
      KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
    );
  }
  let entryBytes = 0;
  return await new Promise<T | KiboHubInstallFailure>((resolve) => {
    let settled = false;
    const stream = entry.nodeStream("nodebuffer") as NodeJS.ReadableStream & {
      destroy?: (error?: Error) => void;
    };
    stream.on("data", (chunk: Buffer | Uint8Array | string) => {
      if (settled) {
        return;
      }
      const buffer =
        typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk as Uint8Array);
      entryBytes += buffer.byteLength;
      if (entryBytes > limits.maxEntryBytes) {
        settled = true;
        stream.destroy?.();
        resolve(
          buildKiboHubInstallFailure(
            `KiboHub archive fallback verification rejected "${entry.name}" because it exceeds the per-file size limit.`,
            KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
          ),
        );
        return;
      }
      if (!limits.addArchiveBytes(buffer.byteLength)) {
        settled = true;
        stream.destroy?.();
        resolve(
          buildKiboHubInstallFailure(
            "KiboHub archive fallback verification exceeded the total extracted-size limit.",
            KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
          ),
        );
        return;
      }
      handlers.onChunk(buffer);
    });
    stream.once("end", () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(handlers.onEnd());
    });
    stream.once("error", (error: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(
        buildKiboHubInstallFailure(
          error instanceof Error ? error.message : String(error),
          KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
        ),
      );
    });
  });
}

async function readKiboHubArchiveEntryBuffer(
  entry: JSZip.JSZipObject,
  limits: KiboHubArchiveEntryLimits,
): Promise<Buffer | KiboHubInstallFailure> {
  const chunks: Buffer[] = [];
  return await readLimitedKiboHubArchiveEntry(entry, limits, {
    onChunk(buffer) {
      chunks.push(buffer);
    },
    onEnd() {
      return Buffer.concat(chunks);
    },
  });
}

async function hashKiboHubArchiveEntry(
  entry: JSZip.JSZipObject,
  limits: KiboHubArchiveEntryLimits,
): Promise<string | KiboHubInstallFailure> {
  const digest = createHash("sha256");
  return await readLimitedKiboHubArchiveEntry(entry, limits, {
    onChunk(buffer) {
      digest.update(buffer);
    },
    onEnd() {
      return digest.digest("hex");
    },
  });
}

function validateKiboHubArchiveMetaJson(params: {
  packageName: string;
  version: string;
  bytes: Buffer;
}): KiboHubInstallFailure | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(params.bytes.toString("utf8"));
  } catch {
    return buildKiboHubInstallFailure(
      `KiboHub archive contents do not match files[] metadata for "${params.packageName}@${params.version}": _meta.json is not valid JSON.`,
      KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
    );
  }
  if (!parsed || typeof parsed !== "object") {
    return buildKiboHubInstallFailure(
      `KiboHub archive contents do not match files[] metadata for "${params.packageName}@${params.version}": _meta.json is not a JSON object.`,
      KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
    );
  }
  const record = parsed as { slug?: unknown; version?: unknown };
  if (record.slug !== params.packageName) {
    return buildKiboHubInstallFailure(
      `KiboHub archive contents do not match files[] metadata for "${params.packageName}@${params.version}": _meta.json slug does not match the package name.`,
      KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
    );
  }
  if (record.version !== params.version) {
    return buildKiboHubInstallFailure(
      `KiboHub archive contents do not match files[] metadata for "${params.packageName}@${params.version}": _meta.json version does not match the package version.`,
      KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
    );
  }
  return null;
}

async function verifyKiboHubArchiveFiles(params: {
  archivePath: string;
  packageName: string;
  packageVersion: string;
  files: KiboHubFileVerificationEntry[];
}): Promise<KiboHubArchiveFileVerificationResult> {
  try {
    const archiveStat = await fs.stat(params.archivePath);
    if (archiveStat.size > DEFAULT_MAX_ARCHIVE_BYTES_ZIP) {
      return buildKiboHubInstallFailure(
        "KiboHub archive fallback verification rejected the downloaded archive because it exceeds the ZIP archive size limit.",
        KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      );
    }
    const archiveBytes = await fs.readFile(params.archivePath);
    const zip = await JSZip.loadAsync(archiveBytes);
    const actualFiles = new Map<string, string>();
    const validatedGeneratedPaths = new Set<string>();
    let entryCount = 0;
    let extractedBytes = 0;
    const addArchiveBytes = (bytes: number): boolean => {
      extractedBytes += bytes;
      return extractedBytes <= DEFAULT_MAX_EXTRACTED_BYTES;
    };
    for (const entry of Object.values(zip.files)) {
      entryCount += 1;
      if (entryCount > DEFAULT_MAX_ENTRIES) {
        return buildKiboHubInstallFailure(
          "KiboHub archive fallback verification exceeded the archive entry limit.",
          KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
        );
      }
      if (entry.dir) {
        continue;
      }
      const relativePath = normalizeKiboHubRelativePath(entry.name);
      if (!relativePath) {
        return buildKiboHubInstallFailure(
          `KiboHub archive contents do not match files[] metadata for "${params.packageName}@${params.packageVersion}": invalid package file path "${entry.name}" (${describeInvalidKiboHubRelativePath(entry.name)}).`,
          KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
        );
      }
      if (relativePath === KIBOHUB_GENERATED_ARCHIVE_METADATA_FILE) {
        const metaResult = await readKiboHubArchiveEntryBuffer(entry, {
          maxEntryBytes: DEFAULT_MAX_ENTRY_BYTES,
          addArchiveBytes,
        });
        if (isKiboHubInstallFailure(metaResult)) {
          return metaResult;
        }
        const metaFailure = validateKiboHubArchiveMetaJson({
          packageName: params.packageName,
          version: params.packageVersion,
          bytes: metaResult,
        });
        if (metaFailure) {
          return metaFailure;
        }
        validatedGeneratedPaths.add(relativePath);
        continue;
      }
      const sha256 = await hashKiboHubArchiveEntry(entry, {
        maxEntryBytes: DEFAULT_MAX_ENTRY_BYTES,
        addArchiveBytes,
      });
      if (typeof sha256 !== "string") {
        return sha256;
      }
      actualFiles.set(relativePath, sha256);
    }
    for (const file of params.files) {
      const actualSha256 = actualFiles.get(file.path);
      if (!actualSha256) {
        return buildKiboHubInstallFailure(
          `KiboHub archive contents do not match files[] metadata for "${params.packageName}@${params.packageVersion}": missing "${file.path}".`,
          KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
        );
      }
      if (actualSha256 !== file.sha256) {
        return buildKiboHubInstallFailure(
          `KiboHub archive contents do not match files[] metadata for "${params.packageName}@${params.packageVersion}": expected ${file.path} to hash to ${file.sha256}, got ${actualSha256}.`,
          KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
        );
      }
      actualFiles.delete(file.path);
    }
    const unexpectedFile = [...actualFiles.keys()].toSorted()[0];
    if (unexpectedFile) {
      return buildKiboHubInstallFailure(
        `KiboHub archive contents do not match files[] metadata for "${params.packageName}@${params.packageVersion}": unexpected file "${unexpectedFile}".`,
        KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
      );
    }
    return {
      ok: true,
      validatedGeneratedPaths: [...validatedGeneratedPaths].toSorted(),
    };
  } catch {
    return buildKiboHubInstallFailure(
      "KiboHub archive fallback verification failed while reading the downloaded archive.",
      KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
    );
  }
}

async function resolveCompatiblePackageVersion(params: {
  detail: KiboHubPackageDetail;
  requestedVersion?: string;
  baseUrl?: string;
  token?: string;
}): Promise<
  | {
      ok: true;
      version: string;
      compatibility?: KiboHubPackageCompatibility | null;
      verification: KiboHubArchiveVerification | null;
    }
  | KiboHubInstallFailure
> {
  const requestedVersion = resolveRequestedVersion(params);
  if (!requestedVersion) {
    return buildKiboHubInstallFailure(
      `KiboHub package "${params.detail.package?.name ?? "unknown"}" has no installable version.`,
      KIBOHUB_INSTALL_ERROR_CODE.NO_INSTALLABLE_VERSION,
    );
  }
  let versionDetail;
  try {
    versionDetail = await fetchKiboHubPackageVersion({
      name: params.detail.package?.name ?? "",
      version: requestedVersion,
      baseUrl: params.baseUrl,
      token: params.token,
    });
  } catch (error) {
    return mapKiboHubRequestError(error, {
      stage: "version",
      name: params.detail.package?.name ?? "unknown",
      version: requestedVersion,
    });
  }
  const resolvedVersion = versionDetail.version?.version ?? requestedVersion;
  if (params.detail.package?.family === "skill") {
    return {
      ok: true,
      version: resolvedVersion,
      compatibility:
        versionDetail.version?.compatibility ?? params.detail.package?.compatibility ?? null,
      verification: null,
    };
  }
  const verificationState = resolveKiboHubArchiveVerification(
    versionDetail,
    params.detail.package?.name ?? "unknown",
    resolvedVersion,
  );
  if (!verificationState.ok) {
    return verificationState;
  }
  return {
    ok: true,
    version: resolvedVersion,
    compatibility:
      versionDetail.version?.compatibility ?? params.detail.package?.compatibility ?? null,
    verification: verificationState.verification,
  };
}

function validateKiboHubPluginPackage(params: {
  detail: KiboHubPackageDetail;
  compatibility?: KiboHubPackageCompatibility | null;
  runtimeVersion: string;
}): KiboHubInstallFailure | null {
  const pkg = params.detail.package;
  if (!pkg) {
    return buildKiboHubInstallFailure(
      "Package not found on KiboHub.",
      KIBOHUB_INSTALL_ERROR_CODE.PACKAGE_NOT_FOUND,
    );
  }
  if (pkg.family === "skill") {
    return buildKiboHubInstallFailure(
      `"${pkg.name}" is a skill. Use "kibo skills install ${pkg.name}" instead.`,
      KIBOHUB_INSTALL_ERROR_CODE.SKILL_PACKAGE,
    );
  }
  if (pkg.family !== "code-plugin" && pkg.family !== "bundle-plugin") {
    return buildKiboHubInstallFailure(
      `Unsupported KiboHub package family: ${String(pkg.family)}`,
      KIBOHUB_INSTALL_ERROR_CODE.UNSUPPORTED_FAMILY,
    );
  }
  if (pkg.channel === "private") {
    return buildKiboHubInstallFailure(
      `"${pkg.name}" is private on KiboHub and cannot be installed anonymously.`,
      KIBOHUB_INSTALL_ERROR_CODE.PRIVATE_PACKAGE,
    );
  }

  const compatibility = params.compatibility;
  const runtimeVersion = params.runtimeVersion;
  if (
    compatibility?.pluginApiRange &&
    !satisfiesPluginApiRange(runtimeVersion, compatibility.pluginApiRange)
  ) {
    return buildKiboHubInstallFailure(
      `Plugin "${pkg.name}" requires plugin API ${compatibility.pluginApiRange}, but this Kibo runtime exposes ${runtimeVersion}.`,
      KIBOHUB_INSTALL_ERROR_CODE.INCOMPATIBLE_PLUGIN_API,
    );
  }

  if (
    compatibility?.minGatewayVersion &&
    !satisfiesGatewayMinimum(runtimeVersion, compatibility.minGatewayVersion)
  ) {
    return buildKiboHubInstallFailure(
      `Plugin "${pkg.name}" requires Kibo >=${compatibility.minGatewayVersion}, but this host is ${runtimeVersion}.`,
      KIBOHUB_INSTALL_ERROR_CODE.INCOMPATIBLE_GATEWAY,
    );
  }
  return null;
}

function logKiboHubPackageSummary(params: {
  detail: KiboHubPackageDetail;
  version: string;
  compatibility?: KiboHubPackageCompatibility | null;
  logger?: PluginInstallLogger;
}) {
  const pkg = params.detail.package;
  if (!pkg) {
    return;
  }
  const verification = pkg.verification?.tier ? ` verification=${pkg.verification.tier}` : "";
  params.logger?.info?.(
    `KiboHub ${pkg.family} ${pkg.name}@${params.version} channel=${pkg.channel}${verification}`,
  );
  const compatibilityParts = [
    params.compatibility?.pluginApiRange
      ? `pluginApi=${params.compatibility.pluginApiRange}`
      : null,
    params.compatibility?.minGatewayVersion
      ? `minGateway=${params.compatibility.minGatewayVersion}`
      : null,
  ].filter(Boolean);
  if (compatibilityParts.length > 0) {
    params.logger?.info?.(`Compatibility: ${compatibilityParts.join(" ")}`);
  }
  if (pkg.channel !== "official") {
    params.logger?.warn?.(
      `KiboHub package "${pkg.name}" is ${pkg.channel}; review source and verification before enabling.`,
    );
  }
}

export async function installPluginFromKiboHub(
  params: InstallSafetyOverrides & {
    spec: string;
    baseUrl?: string;
    token?: string;
    logger?: PluginInstallLogger;
    mode?: "install" | "update";
    dryRun?: boolean;
    expectedPluginId?: string;
  },
): Promise<
  | ({
      ok: true;
    } & Extract<InstallPluginResult, { ok: true }> & {
        kibohub: KiboHubPluginInstallRecordFields;
        packageName: string;
      })
  | KiboHubInstallFailure
  | Extract<InstallPluginResult, { ok: false }>
> {
  const parsed = parseKiboHubPluginSpec(params.spec);
  if (!parsed?.name) {
    return buildKiboHubInstallFailure(
      `invalid KiboHub plugin spec: ${params.spec}`,
      KIBOHUB_INSTALL_ERROR_CODE.INVALID_SPEC,
    );
  }

  params.logger?.info?.(`Resolving ${formatKiboHubSpecifier(parsed)}…`);
  let detail: KiboHubPackageDetail;
  try {
    detail = await fetchKiboHubPackageDetail({
      name: parsed.name,
      baseUrl: params.baseUrl,
      token: params.token,
    });
  } catch (error) {
    return mapKiboHubRequestError(error, {
      stage: "package",
      name: parsed.name,
    });
  }
  const versionState = await resolveCompatiblePackageVersion({
    detail,
    requestedVersion: parsed.version,
    baseUrl: params.baseUrl,
    token: params.token,
  });
  if (!versionState.ok) {
    return versionState;
  }
  const runtimeVersion = resolveCompatibilityHostVersion();
  const validationFailure = validateKiboHubPluginPackage({
    detail,
    compatibility: versionState.compatibility,
    runtimeVersion,
  });
  if (validationFailure) {
    return validationFailure;
  }
  if (!versionState.verification) {
    return buildKiboHubInstallFailure(
      `KiboHub version metadata for "${parsed.name}@${versionState.version}" is missing sha256hash and usable files[] metadata for fallback archive verification.`,
      KIBOHUB_INSTALL_ERROR_CODE.MISSING_ARCHIVE_INTEGRITY,
    );
  }
  const canonicalPackageName = detail.package?.name ?? parsed.name;
  logKiboHubPackageSummary({
    detail,
    version: versionState.version,
    compatibility: versionState.compatibility,
    logger: params.logger,
  });

  let archive;
  try {
    archive = await downloadKiboHubPackageArchive({
      name: parsed.name,
      version: versionState.version,
      baseUrl: params.baseUrl,
      token: params.token,
    });
  } catch (error) {
    return buildKiboHubInstallFailure(formatErrorMessage(error));
  }
  try {
    if (versionState.verification.kind === "archive-integrity") {
      if (archive.integrity !== versionState.verification.integrity) {
        return buildKiboHubInstallFailure(
          `KiboHub archive integrity mismatch for "${parsed.name}@${versionState.version}": expected ${versionState.verification.integrity}, got ${archive.integrity}.`,
          KIBOHUB_INSTALL_ERROR_CODE.ARCHIVE_INTEGRITY_MISMATCH,
        );
      }
    } else {
      const validatedPaths = versionState.verification.files
        .map((file) => file.path)
        .toSorted()
        .join(", ");
      const fallbackVerification = await verifyKiboHubArchiveFiles({
        archivePath: archive.archivePath,
        packageName: canonicalPackageName,
        packageVersion: versionState.version,
        files: versionState.verification.files,
      });
      if (!fallbackVerification.ok) {
        return fallbackVerification;
      }
      const validatedGeneratedPaths =
        fallbackVerification.validatedGeneratedPaths.length > 0
          ? ` Validated generated metadata files present in archive: ${fallbackVerification.validatedGeneratedPaths.join(", ")} (JSON parse plus slug/version match only).`
          : "";
      params.logger?.warn?.(
        `KiboHub package "${canonicalPackageName}@${versionState.version}" is missing sha256hash; falling back to files[] verification. Validated files: ${validatedPaths}.${validatedGeneratedPaths}`,
      );
    }
    params.logger?.info?.(
      `Downloading ${detail.package?.family === "bundle-plugin" ? "bundle" : "plugin"} ${parsed.name}@${versionState.version} from KiboHub…`,
    );
    const installResult = await installPluginFromArchive({
      archivePath: archive.archivePath,
      dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
      logger: params.logger,
      mode: params.mode,
      dryRun: params.dryRun,
      expectedPluginId: params.expectedPluginId,
    });
    if (!installResult.ok) {
      return installResult;
    }

    const pkg = detail.package!;
    const kibohubFamily =
      pkg.family === "code-plugin" || pkg.family === "bundle-plugin" ? pkg.family : null;
    if (!kibohubFamily) {
      return buildKiboHubInstallFailure(
        `Unsupported KiboHub package family: ${pkg.family}`,
        KIBOHUB_INSTALL_ERROR_CODE.UNSUPPORTED_FAMILY,
      );
    }
    return {
      ...installResult,
      packageName: parsed.name,
      kibohub: {
        source: "kibohub",
        kibohubUrl:
          normalizeOptionalString(params.baseUrl) ||
          normalizeOptionalString(process.env.KIBO_KIBOHUB_URL) ||
          "https://github.com/Arjgorithmic/openclaw",
        kibohubPackage: parsed.name,
        kibohubFamily,
        kibohubChannel: pkg.channel,
        version: installResult.version ?? versionState.version,
        // For fallback installs this is the observed download digest, not a
        // server-attested sha256hash from KiboHub version metadata.
        integrity: archive.integrity,
        resolvedAt: new Date().toISOString(),
      },
    };
  } finally {
    await archive.cleanup().catch(() => undefined);
  }
}
