import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { withTempHome } from "../../config/home-env.test-harness.js";
import { createCommandWorkspaceHarness } from "./commands-filesystem.test-support.js";
import { handlePluginsCommand } from "./commands-plugins.js";
import type { HandleCommandsParams } from "./commands-types.js";

const { installPluginFromPathMock, installPluginFromKiboHubMock, persistPluginInstallMock } =
  vi.hoisted(() => ({
    installPluginFromPathMock: vi.fn(),
    installPluginFromKiboHubMock: vi.fn(),
    persistPluginInstallMock: vi.fn(),
  }));

vi.mock("../../plugins/install.js", async () => {
  const actual = await vi.importActual<typeof import("../../plugins/install.js")>(
    "../../plugins/install.js",
  );
  return {
    ...actual,
    installPluginFromPath: installPluginFromPathMock,
  };
});

vi.mock("../../plugins/kibohub.js", async () => {
  const actual = await vi.importActual<typeof import("../../plugins/kibohub.js")>(
    "../../plugins/kibohub.js",
  );
  return {
    ...actual,
    installPluginFromKiboHub: installPluginFromKiboHubMock,
  };
});

vi.mock("../../cli/plugins-install-persist.js", () => ({
  persistPluginInstall: persistPluginInstallMock,
}));

const workspaceHarness = createCommandWorkspaceHarness("kibo-command-plugins-install-");

function buildPluginsParams(
  commandBodyNormalized: string,
  workspaceDir: string,
): HandleCommandsParams {
  return {
    cfg: {
      commands: {
        text: true,
        plugins: true,
      },
      plugins: { enabled: true },
    },
    ctx: {
      Provider: "whatsapp",
      Surface: "whatsapp",
      CommandSource: "text",
      GatewayClientScopes: ["operator.admin", "operator.write", "operator.pairing"],
      AccountId: undefined,
    },
    command: {
      commandBodyNormalized,
      rawBodyNormalized: commandBodyNormalized,
      isAuthorizedSender: true,
      senderIsOwner: true,
      senderId: "owner",
      channel: "whatsapp",
      channelId: "whatsapp",
      surface: "whatsapp",
      ownerList: [],
      from: "test-user",
      to: "test-bot",
    },
    sessionKey: "agent:main:whatsapp:direct:test-user",
    sessionEntry: {
      sessionId: "session-plugin-command",
      updatedAt: Date.now(),
    },
    workspaceDir,
  } as unknown as HandleCommandsParams;
}

describe("handleCommands /plugins install", () => {
  afterEach(async () => {
    installPluginFromPathMock.mockReset();
    installPluginFromKiboHubMock.mockReset();
    persistPluginInstallMock.mockReset();
    await workspaceHarness.cleanupWorkspaces();
  });

  it("installs a plugin from a local path", async () => {
    installPluginFromPathMock.mockResolvedValue({
      ok: true,
      pluginId: "path-install-plugin",
      targetDir: "/tmp/path-install-plugin",
      version: "0.0.1",
      extensions: ["index.js"],
    });
    persistPluginInstallMock.mockResolvedValue({});

    await withTempHome("kibo-command-plugins-home-", async () => {
      const workspaceDir = await workspaceHarness.createWorkspace();
      const pluginDir = path.join(workspaceDir, "fixtures", "path-install-plugin");
      await fs.mkdir(pluginDir, { recursive: true });

      const params = buildPluginsParams(`/plugins install ${pluginDir}`, workspaceDir);
      const result = await handlePluginsCommand(params, true);
      if (result === null) {
        throw new Error("expected plugin install result");
      }
      expect(result.reply?.text).toContain('Installed plugin "path-install-plugin"');
      expect(installPluginFromPathMock).toHaveBeenCalledWith(
        expect.objectContaining({
          path: pluginDir,
        }),
      );
      expect(persistPluginInstallMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pluginId: "path-install-plugin",
          install: expect.objectContaining({
            source: "path",
            sourcePath: pluginDir,
            installPath: "/tmp/path-install-plugin",
            version: "0.0.1",
          }),
        }),
      );
    });
  });

  it("installs from an explicit kibohub: spec", async () => {
    installPluginFromKiboHubMock.mockResolvedValue({
      ok: true,
      pluginId: "kibohub-demo",
      targetDir: "/tmp/kibohub-demo",
      version: "1.2.3",
      extensions: ["index.js"],
      packageName: "@kibo/kibohub-demo",
      kibohub: {
        source: "kibohub",
        kibohubUrl: "https://github.com/Arjgorithmic/openclaw",
        kibohubPackage: "@kibo/kibohub-demo",
        kibohubFamily: "code-plugin",
        kibohubChannel: "official",
        version: "1.2.3",
        integrity: "sha512-demo",
        resolvedAt: "2026-03-22T12:00:00.000Z",
      },
    });
    persistPluginInstallMock.mockResolvedValue({});

    await withTempHome("kibo-command-plugins-home-", async () => {
      const workspaceDir = await workspaceHarness.createWorkspace();
      const params = buildPluginsParams(
        "/plugins install kibohub:@kibo/kibohub-demo@1.2.3",
        workspaceDir,
      );
      const result = await handlePluginsCommand(params, true);
      if (result === null) {
        throw new Error("expected plugin install result");
      }
      expect(result.reply?.text).toContain('Installed plugin "kibohub-demo"');
      expect(installPluginFromKiboHubMock).toHaveBeenCalledWith(
        expect.objectContaining({
          spec: "kibohub:@kibo/kibohub-demo@1.2.3",
        }),
      );
      expect(persistPluginInstallMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pluginId: "kibohub-demo",
          install: expect.objectContaining({
            source: "kibohub",
            spec: "kibohub:@kibo/kibohub-demo@1.2.3",
            installPath: "/tmp/kibohub-demo",
            version: "1.2.3",
            integrity: "sha512-demo",
            kibohubPackage: "@kibo/kibohub-demo",
            kibohubChannel: "official",
          }),
        }),
      );
    });
  });

  it("treats /plugin add as an install alias", async () => {
    installPluginFromKiboHubMock.mockResolvedValue({
      ok: true,
      pluginId: "alias-demo",
      targetDir: "/tmp/alias-demo",
      version: "1.0.0",
      extensions: ["index.js"],
      packageName: "@kibo/alias-demo",
      kibohub: {
        source: "kibohub",
        kibohubUrl: "https://github.com/Arjgorithmic/openclaw",
        kibohubPackage: "@kibo/alias-demo",
        kibohubFamily: "code-plugin",
        kibohubChannel: "official",
        version: "1.0.0",
        integrity: "sha512-alias",
        resolvedAt: "2026-03-23T12:00:00.000Z",
      },
    });
    persistPluginInstallMock.mockResolvedValue({});

    await withTempHome("kibo-command-plugins-home-", async () => {
      const workspaceDir = await workspaceHarness.createWorkspace();
      const params = buildPluginsParams(
        "/plugin add kibohub:@kibo/alias-demo@1.0.0",
        workspaceDir,
      );
      const result = await handlePluginsCommand(params, true);
      if (result === null) {
        throw new Error("expected plugin install result");
      }
      expect(result.reply?.text).toContain('Installed plugin "alias-demo"');
      expect(installPluginFromKiboHubMock).toHaveBeenCalledWith(
        expect.objectContaining({
          spec: "kibohub:@kibo/alias-demo@1.0.0",
        }),
      );
    });
  });
});
