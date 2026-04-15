import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { validateExternalCodePluginPackageJson } from "../../packages/plugin-package-contract/src/index.ts";
import {
  collectExtensionPackageJsonCandidates,
  collectChangedPathsFromGitRange,
  collectChangedExtensionIdsFromPaths,
  collectPublishablePluginPackageErrors,
  parsePluginReleaseArgs,
  parsePluginReleaseSelection,
  parsePluginReleaseSelectionMode,
  resolvePublishablePluginVersion,
  resolveGitCommitSha,
  resolveChangedPublishablePluginPackages,
  resolveSelectedPublishablePluginPackages,
  type GitRangeSelection,
  type ParsedPluginReleaseArgs,
  type PluginReleaseSelectionMode,
} from "./plugin-npm-release.ts";

export {
  collectChangedExtensionIdsFromPaths,
  parsePluginReleaseArgs,
  parsePluginReleaseSelection,
  parsePluginReleaseSelectionMode,
  resolveChangedPublishablePluginPackages,
  resolveSelectedPublishablePluginPackages,
  type GitRangeSelection,
  type ParsedPluginReleaseArgs,
  type PluginReleaseSelectionMode,
};

export type PluginPackageJson = {
  name?: string;
  version?: string;
  private?: boolean;
  kibo?: {
    extensions?: string[];
    install?: {
      npmSpec?: string;
    };
    compat?: {
      pluginApi?: string;
      minGatewayVersion?: string;
    };
    build?: {
      kiboVersion?: string;
      pluginSdkVersion?: string;
    };
    release?: {
      publishToKiboHub?: boolean;
      publishToNpm?: boolean;
    };
  };
};

export type PublishablePluginPackage = {
  extensionId: string;
  packageDir: string;
  packageName: string;
  version: string;
  channel: "stable" | "beta";
  publishTag: "latest" | "beta";
};

export type PluginReleasePlanItem = PublishablePluginPackage & {
  alreadyPublished: boolean;
};

export type PluginReleasePlan = {
  all: PluginReleasePlanItem[];
  candidates: PluginReleasePlanItem[];
  skippedPublished: PluginReleasePlanItem[];
};

const KIBOHUB_DEFAULT_REGISTRY = "https://github.com/Arjgorithmic/openclaw";
const SAFE_EXTENSION_ID_RE = /^[a-z0-9][a-z0-9._-]*$/;
const KIBOHUB_SHARED_RELEASE_INPUT_PATHS = [
  ".github/workflows/plugin-kibohub-release.yml",
  ".github/actions/setup-node-env",
  "package.json",
  "pnpm-lock.yaml",
  "packages/plugin-package-contract/src/index.ts",
  "scripts/lib/npm-publish-plan.mjs",
  "scripts/lib/plugin-npm-release.ts",
  "scripts/lib/plugin-kibohub-release.ts",
  "scripts/kibo-npm-release-check.ts",
  "scripts/plugin-kibohub-publish.sh",
  "scripts/plugin-kibohub-release-check.ts",
  "scripts/plugin-kibohub-release-plan.ts",
] as const;

function getRegistryBaseUrl(explicit?: string) {
  return (
    explicit?.trim() ||
    process.env.KIBOHUB_REGISTRY?.trim() ||
    process.env.KIBOHUB_SITE?.trim() ||
    KIBOHUB_DEFAULT_REGISTRY
  );
}

export function collectKiboHubPublishablePluginPackages(
  rootDir = resolve("."),
): PublishablePluginPackage[] {
  const publishable: PublishablePluginPackage[] = [];
  const validationErrors: string[] = [];

  for (const candidate of collectExtensionPackageJsonCandidates<PluginPackageJson>(rootDir)) {
    const { extensionId, packageDir, packageJson } = candidate;
    if (packageJson.kibo?.release?.publishToKiboHub !== true) {
      continue;
    }
    if (!SAFE_EXTENSION_ID_RE.test(extensionId)) {
      validationErrors.push(
        `${extensionId}: extension directory name must match ^[a-z0-9][a-z0-9._-]*$ for KiboHub publish.`,
      );
      continue;
    }

    const errors = collectPublishablePluginPackageErrors({
      extensionId,
      packageDir,
      packageJson,
    });
    if (errors.length > 0) {
      validationErrors.push(...errors.map((error) => `${extensionId}: ${error}`));
      continue;
    }
    const contractValidation = validateExternalCodePluginPackageJson(packageJson);
    if (contractValidation.issues.length > 0) {
      validationErrors.push(
        ...contractValidation.issues.map((issue) => `${extensionId}: ${issue.message}`),
      );
      continue;
    }

    const resolvedVersion = resolvePublishablePluginVersion({
      extensionId,
      packageJson,
      validationErrors,
    });
    if (!resolvedVersion) {
      continue;
    }
    const { version, parsedVersion } = resolvedVersion;

    publishable.push({
      extensionId,
      packageDir,
      packageName: packageJson.name!.trim(),
      version,
      channel: parsedVersion.channel,
      publishTag: parsedVersion.channel === "beta" ? "beta" : "latest",
    });
  }

  if (validationErrors.length > 0) {
    throw new Error(
      `Publishable KiboHub plugin metadata validation failed:\n${validationErrors.map((error) => `- ${error}`).join("\n")}`,
    );
  }

  return publishable.toSorted((left, right) => left.packageName.localeCompare(right.packageName));
}

export function collectPluginKiboHubReleasePathsFromGitRange(params: {
  rootDir?: string;
  gitRange: GitRangeSelection;
}): string[] {
  return collectPluginKiboHubReleasePathsFromGitRangeForPathspecs(params, ["extensions"]);
}

function collectPluginKiboHubRelevantPathsFromGitRange(params: {
  rootDir?: string;
  gitRange: GitRangeSelection;
}): string[] {
  return collectPluginKiboHubReleasePathsFromGitRangeForPathspecs(params, [
    "extensions",
    ...KIBOHUB_SHARED_RELEASE_INPUT_PATHS,
  ]);
}

function collectPluginKiboHubReleasePathsFromGitRangeForPathspecs(
  params: {
    rootDir?: string;
    gitRange: GitRangeSelection;
  },
  pathspecs: readonly string[],
): string[] {
  return collectChangedPathsFromGitRange({
    rootDir: params.rootDir,
    gitRange: params.gitRange,
    pathspecs,
  });
}

function hasSharedKiboHubReleaseInputChanges(changedPaths: readonly string[]) {
  return changedPaths.some((path) =>
    KIBOHUB_SHARED_RELEASE_INPUT_PATHS.some(
      (sharedPath) => path === sharedPath || path.startsWith(`${sharedPath}/`),
    ),
  );
}

export function resolveChangedKiboHubPublishablePluginPackages(params: {
  plugins: PublishablePluginPackage[];
  changedPaths: readonly string[];
}): PublishablePluginPackage[] {
  return resolveChangedPublishablePluginPackages({
    plugins: params.plugins,
    changedExtensionIds: collectChangedExtensionIdsFromPaths(params.changedPaths),
  });
}

export function resolveSelectedKiboHubPublishablePluginPackages(params: {
  plugins: PublishablePluginPackage[];
  selection?: string[];
  selectionMode?: PluginReleaseSelectionMode;
  gitRange?: GitRangeSelection;
  rootDir?: string;
}): PublishablePluginPackage[] {
  if (params.selectionMode === "all-publishable") {
    return params.plugins;
  }
  if (params.selection && params.selection.length > 0) {
    return resolveSelectedPublishablePluginPackages({
      plugins: params.plugins,
      selection: params.selection,
    });
  }
  if (params.gitRange) {
    const changedPaths = collectPluginKiboHubRelevantPathsFromGitRange({
      rootDir: params.rootDir,
      gitRange: params.gitRange,
    });
    if (hasSharedKiboHubReleaseInputChanges(changedPaths)) {
      return params.plugins;
    }
    return resolveChangedKiboHubPublishablePluginPackages({
      plugins: params.plugins,
      changedPaths,
    });
  }
  return params.plugins;
}

function readPackageManifestAtGitRef(params: {
  rootDir?: string;
  ref: string;
  packageDir: string;
}): PluginPackageJson | null {
  const rootDir = params.rootDir ?? resolve(".");
  const commitSha = resolveGitCommitSha(rootDir, params.ref, "ref");
  try {
    const raw = execFileSync("git", ["show", `${commitSha}:${params.packageDir}/package.json`], {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(raw) as PluginPackageJson;
  } catch {
    return null;
  }
}

export function collectKiboHubVersionGateErrors(params: {
  plugins: PublishablePluginPackage[];
  gitRange: GitRangeSelection;
  rootDir?: string;
}): string[] {
  const changedPaths = collectPluginKiboHubReleasePathsFromGitRange({
    rootDir: params.rootDir,
    gitRange: params.gitRange,
  });
  const changedPlugins = resolveChangedKiboHubPublishablePluginPackages({
    plugins: params.plugins,
    changedPaths,
  });

  const errors: string[] = [];
  for (const plugin of changedPlugins) {
    const baseManifest = readPackageManifestAtGitRef({
      rootDir: params.rootDir,
      ref: params.gitRange.baseRef,
      packageDir: plugin.packageDir,
    });
    if (baseManifest?.kibo?.release?.publishToKiboHub !== true) {
      continue;
    }
    const baseVersion =
      typeof baseManifest.version === "string" && baseManifest.version.trim()
        ? baseManifest.version.trim()
        : null;
    if (baseVersion === null || baseVersion !== plugin.version) {
      continue;
    }
    errors.push(
      `${plugin.packageName}@${plugin.version}: changed publishable plugin still has the same version in package.json.`,
    );
  }

  return errors;
}

export async function isPluginVersionPublishedOnKiboHub(
  packageName: string,
  version: string,
  options: {
    fetchImpl?: typeof fetch;
    registryBaseUrl?: string;
  } = {},
): Promise<boolean> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const url = new URL(
    `/api/v1/packages/${encodeURIComponent(packageName)}/versions/${encodeURIComponent(version)}`,
    getRegistryBaseUrl(options.registryBaseUrl),
  );
  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return false;
  }
  if (response.ok) {
    return true;
  }

  throw new Error(
    `Failed to query KiboHub for ${packageName}@${version}: ${response.status} ${response.statusText}`,
  );
}

export async function collectPluginKiboHubReleasePlan(params?: {
  rootDir?: string;
  selection?: string[];
  selectionMode?: PluginReleaseSelectionMode;
  gitRange?: GitRangeSelection;
  registryBaseUrl?: string;
  fetchImpl?: typeof fetch;
}): Promise<PluginReleasePlan> {
  const allPublishable = collectKiboHubPublishablePluginPackages(params?.rootDir);
  const selectedPublishable = resolveSelectedKiboHubPublishablePluginPackages({
    plugins: allPublishable,
    selection: params?.selection,
    selectionMode: params?.selectionMode,
    gitRange: params?.gitRange,
    rootDir: params?.rootDir,
  });

  const all = await Promise.all(
    selectedPublishable.map(async (plugin) => ({
      ...plugin,
      alreadyPublished: await isPluginVersionPublishedOnKiboHub(
        plugin.packageName,
        plugin.version,
        {
          registryBaseUrl: params?.registryBaseUrl,
          fetchImpl: params?.fetchImpl,
        },
      ),
    })),
  );

  return {
    all,
    candidates: all.filter((plugin) => !plugin.alreadyPublished),
    skippedPublished: all.filter((plugin) => plugin.alreadyPublished),
  };
}
