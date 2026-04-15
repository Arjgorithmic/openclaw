import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          KIBO_STATE_DIR: "/tmp/kibo-state",
          KIBO_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "kibo-gateway",
        windowsTaskName: "Kibo Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/kibo-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/kibo-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "kibo-gateway",
        windowsTaskName: "Kibo Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u kibo-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "kibo-gateway",
        windowsTaskName: "Kibo Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "Kibo Gateway" /V /FO LIST']);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "kibo gateway install",
        startCommand: "kibo gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.kibo.gateway.plist",
        systemdServiceName: "kibo-gateway",
        windowsTaskName: "Kibo Gateway",
      }),
    ).toEqual([
      "kibo gateway install",
      "kibo gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.kibo.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "kibo gateway install",
        startCommand: "kibo gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.kibo.gateway.plist",
        systemdServiceName: "kibo-gateway",
        windowsTaskName: "Kibo Gateway",
      }),
    ).toEqual([
      "kibo gateway install",
      "kibo gateway",
      "systemctl --user start kibo-gateway.service",
    ]);
  });
});
