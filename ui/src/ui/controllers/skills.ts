import type { GatewayBrowserClient } from "../gateway.ts";
import type { SkillStatusReport } from "../types.ts";

export type KiboHubSearchResult = {
  score: number;
  slug: string;
  displayName: string;
  summary?: string;
  version?: string;
  updatedAt?: number;
};

export type KiboHubSkillDetail = {
  skill: {
    slug: string;
    displayName: string;
    summary?: string;
    tags?: Record<string, string>;
    createdAt: number;
    updatedAt: number;
  } | null;
  latestVersion?: {
    version: string;
    createdAt: number;
    changelog?: string;
  } | null;
  metadata?: {
    os?: string[] | null;
    systems?: string[] | null;
  } | null;
  owner?: {
    handle?: string | null;
    displayName?: string | null;
    image?: string | null;
  } | null;
};

export type SkillsState = {
  client: GatewayBrowserClient | null;
  connected: boolean;
  skillsLoading: boolean;
  skillsReport: SkillStatusReport | null;
  skillsError: string | null;
  skillsBusyKey: string | null;
  skillEdits: Record<string, string>;
  skillMessages: SkillMessageMap;
  kibohubSearchQuery: string;
  kibohubSearchResults: KiboHubSearchResult[] | null;
  kibohubSearchLoading: boolean;
  kibohubSearchError: string | null;
  kibohubDetail: KiboHubSkillDetail | null;
  kibohubDetailSlug: string | null;
  kibohubDetailLoading: boolean;
  kibohubDetailError: string | null;
  kibohubInstallSlug: string | null;
  kibohubInstallMessage: { kind: "success" | "error"; text: string } | null;
};

export type SkillMessage = {
  kind: "success" | "error";
  message: string;
};

export type SkillMessageMap = Record<string, SkillMessage>;

function setSkillMessage(state: SkillsState, key: string, message: SkillMessage) {
  if (!key.trim()) {
    return;
  }
  state.skillMessages = { ...state.skillMessages, [key]: message };
}

const getErrorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

async function runStaleAwareRequest<T>(
  isCurrent: () => boolean,
  request: () => Promise<T>,
  onSuccess: (value: T) => void,
  onError: (err: unknown) => void,
  onFinally: () => void,
) {
  try {
    const result = await request();
    if (!isCurrent()) {
      return;
    }
    onSuccess(result);
  } catch (err) {
    if (!isCurrent()) {
      return;
    }
    onError(err);
  }
  onFinally();
}

export function setKiboHubSearchQuery(state: SkillsState, query: string) {
  state.kibohubSearchQuery = query;
  state.kibohubInstallMessage = null;
  state.kibohubSearchResults = null;
  state.kibohubSearchError = null;
  state.kibohubSearchLoading = false;
}

export async function loadSkills(state: SkillsState, options?: { clearMessages?: boolean }) {
  if (options?.clearMessages && Object.keys(state.skillMessages).length > 0) {
    state.skillMessages = {};
  }
  if (!state.client || !state.connected || state.skillsLoading) {
    return;
  }
  state.skillsLoading = true;
  state.skillsError = null;
  try {
    const res = await state.client.request<SkillStatusReport | undefined>("skills.status", {});
    if (res) {
      state.skillsReport = res;
    }
  } catch (err) {
    state.skillsError = getErrorMessage(err);
  } finally {
    state.skillsLoading = false;
  }
}

export function updateSkillEdit(state: SkillsState, skillKey: string, value: string) {
  state.skillEdits = { ...state.skillEdits, [skillKey]: value };
}

async function runSkillMutation(
  state: SkillsState,
  skillKey: string,
  run: (client: GatewayBrowserClient) => Promise<SkillMessage>,
) {
  const client = state.client;
  if (!client || !state.connected) {
    return;
  }
  state.skillsBusyKey = skillKey;
  state.skillsError = null;
  try {
    const message = await run(client);
    await loadSkills(state);
    setSkillMessage(state, skillKey, message);
  } catch (err) {
    const message = getErrorMessage(err);
    state.skillsError = message;
    setSkillMessage(state, skillKey, {
      kind: "error",
      message,
    });
  } finally {
    state.skillsBusyKey = null;
  }
}

export async function updateSkillEnabled(state: SkillsState, skillKey: string, enabled: boolean) {
  await runSkillMutation(state, skillKey, async (client) => {
    await client.request("skills.update", { skillKey, enabled });
    return {
      kind: "success",
      message: enabled ? "Skill enabled" : "Skill disabled",
    };
  });
}

export async function saveSkillApiKey(state: SkillsState, skillKey: string) {
  await runSkillMutation(state, skillKey, async (client) => {
    const apiKey = state.skillEdits[skillKey] ?? "";
    await client.request("skills.update", { skillKey, apiKey });
    return {
      kind: "success",
      message: `API key saved — stored in kibo.json (skills.entries.${skillKey})`,
    };
  });
}

export async function installSkill(
  state: SkillsState,
  skillKey: string,
  name: string,
  installId: string,
  dangerouslyForceUnsafeInstall = false,
) {
  await runSkillMutation(state, skillKey, async (client) => {
    const result = await client.request<{ message?: string }>("skills.install", {
      name,
      installId,
      dangerouslyForceUnsafeInstall,
      timeoutMs: 120000,
    });
    return {
      kind: "success",
      message: result?.message ?? "Installed",
    };
  });
}

export async function searchKiboHub(state: SkillsState, query: string) {
  if (!state.client || !state.connected) {
    return;
  }
  if (!query.trim()) {
    state.kibohubSearchResults = null;
    state.kibohubSearchError = null;
    state.kibohubSearchLoading = false;
    return;
  }
  const client = state.client;
  // Clear stale entries as soon as a new search begins so the UI cannot act on
  // results that no longer match the current query while the next request is in flight.
  state.kibohubSearchResults = null;
  state.kibohubSearchLoading = true;
  state.kibohubSearchError = null;
  await runStaleAwareRequest(
    () => query === state.kibohubSearchQuery,
    () =>
      client.request<{ results: KiboHubSearchResult[] }>("skills.search", {
        query,
        limit: 20,
      }),
    (res) => {
      state.kibohubSearchResults = res?.results ?? [];
    },
    (err) => {
      state.kibohubSearchError = getErrorMessage(err);
    },
    () => {
      state.kibohubSearchLoading = false;
    },
  );
}

export async function loadKiboHubDetail(state: SkillsState, slug: string) {
  if (!state.client || !state.connected) {
    return;
  }
  const client = state.client;
  state.kibohubDetailSlug = slug;
  state.kibohubDetailLoading = true;
  state.kibohubDetailError = null;
  state.kibohubDetail = null;
  await runStaleAwareRequest(
    () => slug === state.kibohubDetailSlug,
    () => client.request<KiboHubSkillDetail>("skills.detail", { slug }),
    (res) => {
      state.kibohubDetail = res ?? null;
    },
    (err) => {
      state.kibohubDetailError = getErrorMessage(err);
    },
    () => {
      state.kibohubDetailLoading = false;
    },
  );
}

export function closeKiboHubDetail(state: SkillsState) {
  state.kibohubDetailSlug = null;
  state.kibohubDetail = null;
  state.kibohubDetailError = null;
  state.kibohubDetailLoading = false;
}

export async function installFromKiboHub(state: SkillsState, slug: string) {
  if (!state.client || !state.connected) {
    return;
  }
  state.kibohubInstallSlug = slug;
  state.kibohubInstallMessage = null;
  try {
    await state.client.request("skills.install", { source: "kibohub", slug });
    await loadSkills(state);
    state.kibohubInstallMessage = { kind: "success", text: `Installed ${slug}` };
  } catch (err) {
    state.kibohubInstallMessage = { kind: "error", text: getErrorMessage(err) };
  } finally {
    state.kibohubInstallSlug = null;
  }
}
