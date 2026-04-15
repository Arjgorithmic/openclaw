import { beforeEach, describe, expect, it, vi } from "vitest";

const loadConfigMock = vi.fn(() => ({}));
const resolveDefaultAgentIdMock = vi.fn(() => "main");
const resolveAgentWorkspaceDirMock = vi.fn(() => "/tmp/workspace");
const installSkillFromKiboHubMock = vi.fn();
const installSkillMock = vi.fn();
const updateSkillsFromKiboHubMock = vi.fn();

vi.mock("../../config/config.js", () => ({
  loadConfig: () => loadConfigMock(),
  writeConfigFile: vi.fn(),
}));

vi.mock("../../agents/agent-scope.js", () => ({
  listAgentIds: vi.fn(() => ["main"]),
  resolveDefaultAgentId: () => resolveDefaultAgentIdMock(),
  resolveAgentWorkspaceDir: () => resolveAgentWorkspaceDirMock(),
}));

vi.mock("../../agents/skills-kibohub.js", () => ({
  installSkillFromKiboHub: (...args: unknown[]) => installSkillFromKiboHubMock(...args),
  updateSkillsFromKiboHub: (...args: unknown[]) => updateSkillsFromKiboHubMock(...args),
}));

vi.mock("../../agents/skills-install.js", () => ({
  installSkill: (...args: unknown[]) => installSkillMock(...args),
}));

const { skillsHandlers } = await import("./skills.js");

describe("skills gateway handlers (kibohub)", () => {
  beforeEach(() => {
    loadConfigMock.mockReset();
    resolveDefaultAgentIdMock.mockReset();
    resolveAgentWorkspaceDirMock.mockReset();
    installSkillFromKiboHubMock.mockReset();
    installSkillMock.mockReset();
    updateSkillsFromKiboHubMock.mockReset();

    loadConfigMock.mockReturnValue({});
    resolveDefaultAgentIdMock.mockReturnValue("main");
    resolveAgentWorkspaceDirMock.mockReturnValue("/tmp/workspace");
  });

  it("installs a KiboHub skill through skills.install", async () => {
    installSkillFromKiboHubMock.mockResolvedValue({
      ok: true,
      slug: "calendar",
      version: "1.2.3",
      targetDir: "/tmp/workspace/skills/calendar",
    });

    let ok: boolean | null = null;
    let response: unknown;
    let error: unknown;
    await skillsHandlers["skills.install"]({
      params: {
        source: "kibohub",
        slug: "calendar",
        version: "1.2.3",
      },
      req: {} as never,
      client: null as never,
      isWebchatConnect: () => false,
      context: {} as never,
      respond: (success, result, err) => {
        ok = success;
        response = result;
        error = err;
      },
    });

    expect(installSkillFromKiboHubMock).toHaveBeenCalledWith({
      workspaceDir: "/tmp/workspace",
      slug: "calendar",
      version: "1.2.3",
      force: false,
    });
    expect(ok).toBe(true);
    expect(error).toBeUndefined();
    expect(response).toMatchObject({
      ok: true,
      message: "Installed calendar@1.2.3",
      slug: "calendar",
      version: "1.2.3",
    });
  });

  it("forwards dangerous override for local skill installs", async () => {
    installSkillMock.mockResolvedValue({
      ok: true,
      message: "Installed",
      stdout: "",
      stderr: "",
      code: 0,
    });

    let ok: boolean | null = null;
    let response: unknown;
    let error: unknown;
    await skillsHandlers["skills.install"]({
      params: {
        name: "calendar",
        installId: "deps",
        dangerouslyForceUnsafeInstall: true,
        timeoutMs: 120_000,
      },
      req: {} as never,
      client: null as never,
      isWebchatConnect: () => false,
      context: {} as never,
      respond: (success, result, err) => {
        ok = success;
        response = result;
        error = err;
      },
    });

    expect(installSkillMock).toHaveBeenCalledWith({
      workspaceDir: "/tmp/workspace",
      skillName: "calendar",
      installId: "deps",
      dangerouslyForceUnsafeInstall: true,
      timeoutMs: 120_000,
      config: {},
    });
    expect(ok).toBe(true);
    expect(error).toBeUndefined();
    expect(response).toMatchObject({
      ok: true,
      message: "Installed",
    });
  });

  it("updates KiboHub skills through skills.update", async () => {
    updateSkillsFromKiboHubMock.mockResolvedValue([
      {
        ok: true,
        slug: "calendar",
        previousVersion: "1.2.2",
        version: "1.2.3",
        changed: true,
        targetDir: "/tmp/workspace/skills/calendar",
      },
    ]);

    let ok: boolean | null = null;
    let response: unknown;
    let error: unknown;
    await skillsHandlers["skills.update"]({
      params: {
        source: "kibohub",
        slug: "calendar",
      },
      req: {} as never,
      client: null as never,
      isWebchatConnect: () => false,
      context: {} as never,
      respond: (success, result, err) => {
        ok = success;
        response = result;
        error = err;
      },
    });

    expect(updateSkillsFromKiboHubMock).toHaveBeenCalledWith({
      workspaceDir: "/tmp/workspace",
      slug: "calendar",
    });
    expect(ok).toBe(true);
    expect(error).toBeUndefined();
    expect(response).toMatchObject({
      ok: true,
      skillKey: "calendar",
      config: {
        source: "kibohub",
        results: [
          {
            ok: true,
            slug: "calendar",
            version: "1.2.3",
          },
        ],
      },
    });
  });

  it("rejects KiboHub skills.update requests without slug or all", async () => {
    let ok: boolean | null = null;
    let error: { code?: string; message?: string } | undefined;
    await skillsHandlers["skills.update"]({
      params: {
        source: "kibohub",
      },
      req: {} as never,
      client: null as never,
      isWebchatConnect: () => false,
      context: {} as never,
      respond: (success, _result, err) => {
        ok = success;
        error = err as { code?: string; message?: string } | undefined;
      },
    });

    expect(ok).toBe(false);
    expect(error?.message).toContain('requires "slug" or "all"');
    expect(updateSkillsFromKiboHubMock).not.toHaveBeenCalled();
  });
});
