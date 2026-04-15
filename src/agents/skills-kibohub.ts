import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileExists } from "../infra/archive.js";
import {
  downloadKiboHubSkillArchive,
  fetchKiboHubSkillDetail,
  resolveKiboHubBaseUrl,
  searchKiboHubSkills,
  type KiboHubSkillDetail,
  type KiboHubSkillSearchResult,
} from "../infra/kibohub.js";
import { formatErrorMessage } from "../infra/errors.js";
import { withExtractedArchiveRoot } from "../infra/install-flow.js";
import { installPackageDir } from "../infra/install-package-dir.js";
import { resolveSafeInstallDir } from "../infra/install-safe-path.js";

const DOT_DIR = ".kibohub";
const LEGACY_DOT_DIR = ".kibohub";
const SKILL_ORIGIN_RELATIVE_PATH = path.join(DOT_DIR, "origin.json");

export type KiboHubSkillOrigin = {
  version: 1;
  registry: string;
  slug: string;
  installedVersion: string;
  installedAt: number;
};

export type KiboHubSkillsLockfile = {
  version: 1;
  skills: Record<
    string,
    {
      version: string;
      installedAt: number;
    }
  >;
};

export type InstallKiboHubSkillResult =
  | {
      ok: true;
      slug: string;
      version: string;
      targetDir: string;
      detail: KiboHubSkillDetail;
    }
  | { ok: false; error: string };

export type UpdateKiboHubSkillResult =
  | {
      ok: true;
      slug: string;
      previousVersion: string | null;
      version: string;
      changed: boolean;
      targetDir: string;
    }
  | { ok: false; error: string };

type Logger = {
  info?: (message: string) => void;
};

const VALID_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
// eslint-disable-next-line no-control-regex -- detects any character outside printable ASCII
const NON_ASCII_PATTERN = /[^\x00-\x7F]/;

function normalizeTrackedSlug(raw: string): string {
  const slug = raw.trim();
  if (!slug || slug.includes("/") || slug.includes("\\") || slug.includes("..")) {
    throw new Error(`Invalid skill slug: ${raw}`);
  }
  return slug;
}

function validateRequestedSlug(raw: string): string {
  const slug = normalizeTrackedSlug(raw);
  if (NON_ASCII_PATTERN.test(slug) || !VALID_SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid skill slug: ${raw}`);
  }
  return slug;
}

async function resolveRequestedUpdateSlug(params: {
  workspaceDir: string;
  requestedSlug: string;
  lock: KiboHubSkillsLockfile;
}): Promise<string> {
  const trackedSlug = normalizeTrackedSlug(params.requestedSlug);
  const trackedTargetDir = resolveSkillInstallDir(params.workspaceDir, trackedSlug);
  const trackedOrigin = await readKiboHubSkillOrigin(trackedTargetDir);
  if (trackedOrigin || params.lock.skills[trackedSlug]) {
    return trackedSlug;
  }
  return validateRequestedSlug(params.requestedSlug);
}

type KiboHubInstallParams = {
  workspaceDir: string;
  slug: string;
  version?: string;
  baseUrl?: string;
  force?: boolean;
  logger?: Logger;
};

type TrackedUpdateTarget =
  | {
      ok: true;
      slug: string;
      baseUrl?: string;
      previousVersion: string | null;
    }
  | {
      ok: false;
      slug: string;
      error: string;
    };

function resolveSkillInstallDir(workspaceDir: string, slug: string): string {
  const skillsDir = path.join(path.resolve(workspaceDir), "skills");
  const target = resolveSafeInstallDir({
    baseDir: skillsDir,
    id: slug,
    invalidNameMessage: "invalid skill target path",
  });
  if (!target.ok) {
    throw new Error(target.error);
  }
  return target.path;
}

async function ensureSkillRoot(rootDir: string): Promise<void> {
  for (const candidate of ["SKILL.md", "skill.md", "skills.md", "SKILL.MD"]) {
    if (await fileExists(path.join(rootDir, candidate))) {
      return;
    }
  }
  throw new Error("downloaded archive is missing SKILL.md");
}

export async function readKiboHubSkillsLockfile(
  workspaceDir: string,
): Promise<KiboHubSkillsLockfile> {
  const candidates = [
    path.join(workspaceDir, DOT_DIR, "lock.json"),
    path.join(workspaceDir, LEGACY_DOT_DIR, "lock.json"),
  ];
  for (const candidate of candidates) {
    try {
      const raw = JSON.parse(
        await fs.readFile(candidate, "utf8"),
      ) as Partial<KiboHubSkillsLockfile>;
      if (raw.version === 1 && raw.skills && typeof raw.skills === "object") {
        return {
          version: 1,
          skills: raw.skills,
        };
      }
    } catch {
      // ignore
    }
  }
  return { version: 1, skills: {} };
}

export async function writeKiboHubSkillsLockfile(
  workspaceDir: string,
  lockfile: KiboHubSkillsLockfile,
): Promise<void> {
  const targetPath = path.join(workspaceDir, DOT_DIR, "lock.json");
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(lockfile, null, 2)}\n`, "utf8");
}

export async function readKiboHubSkillOrigin(skillDir: string): Promise<KiboHubSkillOrigin | null> {
  const candidates = [
    path.join(skillDir, DOT_DIR, "origin.json"),
    path.join(skillDir, LEGACY_DOT_DIR, "origin.json"),
  ];
  for (const candidate of candidates) {
    try {
      const raw = JSON.parse(await fs.readFile(candidate, "utf8")) as Partial<KiboHubSkillOrigin>;
      if (
        raw.version === 1 &&
        typeof raw.registry === "string" &&
        typeof raw.slug === "string" &&
        typeof raw.installedVersion === "string" &&
        typeof raw.installedAt === "number"
      ) {
        return raw as KiboHubSkillOrigin;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export async function writeKiboHubSkillOrigin(
  skillDir: string,
  origin: KiboHubSkillOrigin,
): Promise<void> {
  const targetPath = path.join(skillDir, SKILL_ORIGIN_RELATIVE_PATH);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(origin, null, 2)}\n`, "utf8");
}

export async function searchSkillsFromKiboHub(params: {
  query?: string;
  limit?: number;
  baseUrl?: string;
}): Promise<KiboHubSkillSearchResult[]> {
  return await searchKiboHubSkills({
    query: params.query?.trim() || "*",
    limit: params.limit,
    baseUrl: params.baseUrl,
  });
}

async function resolveInstallVersion(params: {
  slug: string;
  version?: string;
  baseUrl?: string;
}): Promise<{ detail: KiboHubSkillDetail; version: string }> {
  const detail = await fetchKiboHubSkillDetail({
    slug: params.slug,
    baseUrl: params.baseUrl,
  });
  if (!detail.skill) {
    throw new Error(`Skill "${params.slug}" not found on KiboHub.`);
  }
  const resolvedVersion = params.version ?? detail.latestVersion?.version;
  if (!resolvedVersion) {
    throw new Error(`Skill "${params.slug}" has no installable version.`);
  }
  return {
    detail,
    version: resolvedVersion,
  };
}

async function installExtractedSkill(params: {
  workspaceDir: string;
  slug: string;
  extractedRoot: string;
  mode: "install" | "update";
  logger?: Logger;
}): Promise<{ ok: true; targetDir: string } | { ok: false; error: string }> {
  await ensureSkillRoot(params.extractedRoot);
  const targetDir = resolveSkillInstallDir(params.workspaceDir, params.slug);
  const install = await installPackageDir({
    sourceDir: params.extractedRoot,
    targetDir,
    mode: params.mode,
    timeoutMs: 120_000,
    logger: params.logger,
    copyErrorPrefix: "failed to install skill",
    hasDeps: false,
    depsLogMessage: "",
  });
  if (!install.ok) {
    return install;
  }
  return { ok: true, targetDir };
}

async function performKiboHubSkillInstall(
  params: KiboHubInstallParams,
): Promise<InstallKiboHubSkillResult> {
  try {
    const { detail, version } = await resolveInstallVersion({
      slug: params.slug,
      version: params.version,
      baseUrl: params.baseUrl,
    });
    const targetDir = resolveSkillInstallDir(params.workspaceDir, params.slug);
    if (!params.force && (await fileExists(targetDir))) {
      return {
        ok: false,
        error: `Skill already exists at ${targetDir}. Re-run with force/update.`,
      };
    }

    params.logger?.info?.(`Downloading ${params.slug}@${version} from KiboHub…`);
    const archive = await downloadKiboHubSkillArchive({
      slug: params.slug,
      version,
      baseUrl: params.baseUrl,
    });
    try {
      const install = await withExtractedArchiveRoot({
        archivePath: archive.archivePath,
        tempDirPrefix: "kibo-skill-kibohub-",
        timeoutMs: 120_000,
        rootMarkers: ["SKILL.md"],
        onExtracted: async (rootDir) =>
          await installExtractedSkill({
            workspaceDir: params.workspaceDir,
            slug: params.slug,
            extractedRoot: rootDir,
            mode: params.force ? "update" : "install",
            logger: params.logger,
          }),
      });
      if (!install.ok) {
        return install;
      }

      const installedAt = Date.now();
      await writeKiboHubSkillOrigin(install.targetDir, {
        version: 1,
        registry: resolveKiboHubBaseUrl(params.baseUrl),
        slug: params.slug,
        installedVersion: version,
        installedAt,
      });
      const lock = await readKiboHubSkillsLockfile(params.workspaceDir);
      lock.skills[params.slug] = {
        version,
        installedAt,
      };
      await writeKiboHubSkillsLockfile(params.workspaceDir, lock);

      return {
        ok: true,
        slug: params.slug,
        version,
        targetDir: install.targetDir,
        detail,
      };
    } finally {
      await archive.cleanup().catch(() => undefined);
    }
  } catch (err) {
    return {
      ok: false,
      error: formatErrorMessage(err),
    };
  }
}

async function installRequestedSkillFromKiboHub(
  params: KiboHubInstallParams,
): Promise<InstallKiboHubSkillResult> {
  try {
    return await performKiboHubSkillInstall({
      ...params,
      slug: validateRequestedSlug(params.slug),
    });
  } catch (err) {
    return {
      ok: false,
      error: formatErrorMessage(err),
    };
  }
}

async function installTrackedSkillFromKiboHub(
  params: KiboHubInstallParams,
): Promise<InstallKiboHubSkillResult> {
  try {
    return await performKiboHubSkillInstall({
      ...params,
      slug: normalizeTrackedSlug(params.slug),
    });
  } catch (err) {
    return {
      ok: false,
      error: formatErrorMessage(err),
    };
  }
}

async function resolveTrackedUpdateTarget(params: {
  workspaceDir: string;
  slug: string;
  lock: KiboHubSkillsLockfile;
  baseUrl?: string;
}): Promise<TrackedUpdateTarget> {
  const targetDir = resolveSkillInstallDir(params.workspaceDir, params.slug);
  const origin = (await readKiboHubSkillOrigin(targetDir)) ?? null;
  if (!origin && !params.lock.skills[params.slug]) {
    return {
      ok: false,
      slug: params.slug,
      error: `Skill "${params.slug}" is not tracked as a KiboHub install.`,
    };
  }
  return {
    ok: true,
    slug: params.slug,
    baseUrl: origin?.registry ?? params.baseUrl,
    previousVersion: origin?.installedVersion ?? params.lock.skills[params.slug]?.version ?? null,
  };
}

export async function installSkillFromKiboHub(params: {
  workspaceDir: string;
  slug: string;
  version?: string;
  baseUrl?: string;
  force?: boolean;
  logger?: Logger;
}): Promise<InstallKiboHubSkillResult> {
  return await installRequestedSkillFromKiboHub(params);
}

export async function updateSkillsFromKiboHub(params: {
  workspaceDir: string;
  slug?: string;
  baseUrl?: string;
  logger?: Logger;
}): Promise<UpdateKiboHubSkillResult[]> {
  const lock = await readKiboHubSkillsLockfile(params.workspaceDir);
  const slugs = params.slug
    ? [
        await resolveRequestedUpdateSlug({
          workspaceDir: params.workspaceDir,
          requestedSlug: params.slug,
          lock,
        }),
      ]
    : Object.keys(lock.skills).map((slug) => normalizeTrackedSlug(slug));
  const results: UpdateKiboHubSkillResult[] = [];
  for (const slug of slugs) {
    const tracked = await resolveTrackedUpdateTarget({
      workspaceDir: params.workspaceDir,
      slug,
      lock,
      baseUrl: params.baseUrl,
    });
    if (!tracked.ok) {
      results.push({
        ok: false,
        error: tracked.error,
      });
      continue;
    }
    const install = await installTrackedSkillFromKiboHub({
      workspaceDir: params.workspaceDir,
      slug: tracked.slug,
      baseUrl: tracked.baseUrl,
      force: true,
      logger: params.logger,
    });
    if (!install.ok) {
      results.push(install);
      continue;
    }
    results.push({
      ok: true,
      slug: tracked.slug,
      previousVersion: tracked.previousVersion,
      version: install.version,
      changed: tracked.previousVersion !== install.version,
      targetDir: install.targetDir,
    });
  }
  return results;
}

export async function readTrackedKiboHubSkillSlugs(workspaceDir: string): Promise<string[]> {
  const lock = await readKiboHubSkillsLockfile(workspaceDir);
  return Object.keys(lock.skills).toSorted();
}

export async function computeSkillFingerprint(skillDir: string): Promise<string> {
  const digest = createHash("sha256");
  const queue = [skillDir];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      const relPath = path.relative(skillDir, fullPath).split(path.sep).join("/");
      digest.update(relPath);
      digest.update("\n");
      digest.update(await fs.readFile(fullPath));
      digest.update("\n");
    }
  }
  return digest.digest("hex");
}
