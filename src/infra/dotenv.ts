import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import dotenv from "dotenv";
import { resolveConfigDir } from "../utils.js";
import { resolveRequiredHomeDir } from "./home-dir.js";
import {
  isDangerousHostEnvOverrideVarName,
  isDangerousHostEnvVarName,
  normalizeEnvVarKey,
} from "./host-env-security.js";

const BLOCKED_WORKSPACE_DOTENV_KEYS = new Set([
  "ALL_PROXY",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_OAUTH_TOKEN",
  "BROWSER_EXECUTABLE_PATH",
  "KIBOHUB_AUTH_TOKEN",
  "KIBOHUB_CONFIG_PATH",
  "KIBOHUB_TOKEN",
  "KIBOHUB_URL",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NODE_TLS_REJECT_UNAUTHORIZED",
  "NO_PROXY",
  "OPENAI_API_KEY",
  "OPENAI_API_KEYS",
  "KIBO_AGENT_DIR",
  "KIBO_ALLOW_INSECURE_PRIVATE_WS",
  "KIBO_ALLOW_PROJECT_LOCAL_BIN",
  "KIBO_BROWSER_EXECUTABLE_PATH",
  "KIBO_BROWSER_CONTROL_MODULE",
  "KIBO_BUNDLED_HOOKS_DIR",
  "KIBO_BUNDLED_PLUGINS_DIR",
  "KIBO_BUNDLED_SKILLS_DIR",
  "KIBO_CACHE_TRACE",
  "KIBO_CACHE_TRACE_FILE",
  "KIBO_CACHE_TRACE_MESSAGES",
  "KIBO_CACHE_TRACE_PROMPT",
  "KIBO_CACHE_TRACE_SYSTEM",
  "KIBO_CONFIG_PATH",
  "KIBO_GATEWAY_PASSWORD",
  "KIBO_GATEWAY_PORT",
  "KIBO_GATEWAY_SECRET",
  "KIBO_GATEWAY_TOKEN",
  "KIBO_GATEWAY_URL",
  "KIBO_HOME",
  "KIBO_LIVE_ANTHROPIC_KEY",
  "KIBO_LIVE_ANTHROPIC_KEYS",
  "KIBO_LIVE_GEMINI_KEY",
  "KIBO_LIVE_OPENAI_KEY",
  "KIBO_MPM_CATALOG_PATHS",
  "KIBO_NODE_EXEC_FALLBACK",
  "KIBO_NODE_EXEC_HOST",
  "KIBO_OAUTH_DIR",
  "KIBO_PINNED_PYTHON",
  "KIBO_PINNED_WRITE_PYTHON",
  "KIBO_PLUGIN_CATALOG_PATHS",
  "KIBO_PROFILE",
  "KIBO_RAW_STREAM",
  "KIBO_RAW_STREAM_PATH",
  "KIBO_SHOW_SECRETS",
  "KIBO_SKIP_BROWSER_CONTROL_SERVER",
  "KIBO_STATE_DIR",
  "KIBO_TEST_TAILSCALE_BINARY",
  "PI_CODING_AGENT_DIR",
  "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH",
  "UV_PYTHON",
]);

// Block endpoint redirection for any service without overfitting per-provider names.
const BLOCKED_WORKSPACE_DOTENV_SUFFIXES = ["_BASE_URL"];
const BLOCKED_WORKSPACE_DOTENV_PREFIXES = [
  "ANTHROPIC_API_KEY_",
  "KIBOHUB_",
  "OPENAI_API_KEY_",
  "KIBO_KIBOHUB_",
  "KIBO_DISABLE_",
  "KIBO_SKIP_",
  "KIBO_UPDATE_",
];

function shouldBlockWorkspaceRuntimeDotEnvKey(key: string): boolean {
  return isDangerousHostEnvVarName(key) || isDangerousHostEnvOverrideVarName(key);
}

function shouldBlockRuntimeDotEnvKey(key: string): boolean {
  // The global ~/.kibo/.env (or KIBO_STATE_DIR/.env) is a trusted
  // operator-controlled runtime surface. Workspace .env is untrusted and gets
  // the strict blocklist, but the trusted global fallback is allowed to set
  // runtime vars like proxy/base-url/auth values.
  void key;
  return false;
}

function shouldBlockWorkspaceDotEnvKey(key: string): boolean {
  const upper = key.toUpperCase();
  return (
    shouldBlockWorkspaceRuntimeDotEnvKey(upper) ||
    BLOCKED_WORKSPACE_DOTENV_KEYS.has(upper) ||
    BLOCKED_WORKSPACE_DOTENV_PREFIXES.some((prefix) => upper.startsWith(prefix)) ||
    BLOCKED_WORKSPACE_DOTENV_SUFFIXES.some((suffix) => upper.endsWith(suffix))
  );
}

type DotEnvEntry = {
  key: string;
  value: string;
};

type LoadedDotEnvFile = {
  filePath: string;
  entries: DotEnvEntry[];
};

function readDotEnvFile(params: {
  filePath: string;
  shouldBlockKey: (key: string) => boolean;
  quiet?: boolean;
}): LoadedDotEnvFile | null {
  let content: string;
  try {
    content = fs.readFileSync(params.filePath, "utf8");
  } catch (error) {
    if (!params.quiet) {
      const code =
        error && typeof error === "object" && "code" in error ? String(error.code) : undefined;
      if (code !== "ENOENT") {
        console.warn(`[dotenv] Failed to read ${params.filePath}: ${String(error)}`);
      }
    }
    return null;
  }

  let parsed: Record<string, string>;
  try {
    parsed = dotenv.parse(content);
  } catch (error) {
    if (!params.quiet) {
      console.warn(`[dotenv] Failed to parse ${params.filePath}: ${String(error)}`);
    }
    return null;
  }
  const entries: DotEnvEntry[] = [];
  for (const [rawKey, value] of Object.entries(parsed)) {
    const key = normalizeEnvVarKey(rawKey, { portable: true });
    if (!key || params.shouldBlockKey(key)) {
      continue;
    }
    entries.push({ key, value });
  }
  return { filePath: params.filePath, entries };
}

export function loadRuntimeDotEnvFile(filePath: string, opts?: { quiet?: boolean }) {
  const parsed = readDotEnvFile({
    filePath,
    shouldBlockKey: shouldBlockRuntimeDotEnvKey,
    quiet: opts?.quiet ?? true,
  });
  if (!parsed) {
    return;
  }
  for (const { key, value } of parsed.entries) {
    if (process.env[key] !== undefined) {
      continue;
    }
    process.env[key] = value;
  }
}

export function loadWorkspaceDotEnvFile(filePath: string, opts?: { quiet?: boolean }) {
  const parsed = readDotEnvFile({
    filePath,
    shouldBlockKey: shouldBlockWorkspaceDotEnvKey,
    quiet: opts?.quiet ?? true,
  });
  if (!parsed) {
    return;
  }
  for (const { key, value } of parsed.entries) {
    if (process.env[key] !== undefined) {
      continue;
    }
    process.env[key] = value;
  }
}

function loadParsedDotEnvFiles(files: LoadedDotEnvFile[]) {
  const preExistingKeys = new Set(Object.keys(process.env));
  const conflicts = new Map<string, { keptPath: string; ignoredPath: string; keys: Set<string> }>();
  const firstSeen = new Map<string, { value: string; filePath: string }>();

  for (const file of files) {
    for (const { key, value } of file.entries) {
      if (preExistingKeys.has(key)) {
        continue;
      }
      const previous = firstSeen.get(key);
      if (previous) {
        if (previous.value !== value) {
          const conflictKey = `${previous.filePath}\u0000${file.filePath}`;
          const existing = conflicts.get(conflictKey);
          if (existing) {
            existing.keys.add(key);
          } else {
            conflicts.set(conflictKey, {
              keptPath: previous.filePath,
              ignoredPath: file.filePath,
              keys: new Set([key]),
            });
          }
        }
        continue;
      }
      firstSeen.set(key, { value, filePath: file.filePath });
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }

  for (const conflict of conflicts.values()) {
    const keys = [...conflict.keys].toSorted();
    if (keys.length === 0) {
      continue;
    }
    console.warn(
      `[dotenv] Conflicting values in ${conflict.keptPath} and ${conflict.ignoredPath} for ${keys.join(", ")}; keeping ${conflict.keptPath}.`,
    );
  }
}

export function loadGlobalRuntimeDotEnvFiles(opts?: { quiet?: boolean; stateEnvPath?: string }) {
  const quiet = opts?.quiet ?? true;
  const stateEnvPath = opts?.stateEnvPath ?? path.join(resolveConfigDir(process.env), ".env");
  const defaultStateEnvPath = path.join(
    resolveRequiredHomeDir(process.env, os.homedir),
    ".kibo",
    ".env",
  );
  const hasExplicitNonDefaultStateDir =
    process.env.KIBO_STATE_DIR?.trim() !== undefined &&
    path.resolve(stateEnvPath) !== path.resolve(defaultStateEnvPath);
  const parsedFiles = [
    readDotEnvFile({
      filePath: stateEnvPath,
      shouldBlockKey: shouldBlockRuntimeDotEnvKey,
      quiet,
    }),
  ];
  if (!hasExplicitNonDefaultStateDir) {
    parsedFiles.push(
      readDotEnvFile({
        filePath: path.join(
          resolveRequiredHomeDir(process.env, os.homedir),
          ".config",
          "kibo",
          "gateway.env",
        ),
        shouldBlockKey: shouldBlockRuntimeDotEnvKey,
        quiet,
      }),
    );
  }
  const parsed = parsedFiles.filter((file): file is LoadedDotEnvFile => file !== null);
  loadParsedDotEnvFiles(parsed);
}

export function loadDotEnv(opts?: { quiet?: boolean }) {
  const quiet = opts?.quiet ?? true;
  const cwdEnvPath = path.join(process.cwd(), ".env");
  loadWorkspaceDotEnvFile(cwdEnvPath, { quiet });

  // Then load global fallback: ~/.kibo/.env (or KIBO_STATE_DIR/.env),
  // without overriding any env vars already present.
  loadGlobalRuntimeDotEnvFiles({ quiet });
}
