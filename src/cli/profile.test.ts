import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "kibo",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "kibo", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("leaves gateway --dev for subcommands after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "kibo",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "kibo",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "kibo", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "kibo", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "kibo", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "kibo", "status"]);
  });

  it("parses interleaved --profile after the command token", () => {
    const res = parseCliProfileArgs(["node", "kibo", "status", "--profile", "work", "--deep"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "kibo", "status", "--deep"]);
  });

  it("parses interleaved --dev after the command token", () => {
    const res = parseCliProfileArgs(["node", "kibo", "status", "--dev"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "kibo", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "kibo", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "kibo", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "kibo", "--profile", "work", "--dev", "status"]],
    ["interleaved after command", ["node", "kibo", "status", "--profile", "work", "--dev"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/kibo",
    });
    const expectedStateDir = path.join(path.resolve("/home/kibo"), ".kibo-dev");
    expect(env.KIBO_PROFILE).toBe("dev");
    expect(env.KIBO_STATE_DIR).toBe(expectedStateDir);
    expect(env.KIBO_CONFIG_PATH).toBe(path.join(expectedStateDir, "kibo.json"));
    expect(env.KIBO_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      KIBO_STATE_DIR: "/custom",
      KIBO_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/kibo",
    });
    expect(env.KIBO_STATE_DIR).toBe("/custom");
    expect(env.KIBO_GATEWAY_PORT).toBe("19099");
    expect(env.KIBO_CONFIG_PATH).toBe(path.join("/custom", "kibo.json"));
  });

  it("uses KIBO_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      KIBO_HOME: "/srv/kibo-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/kibo-home");
    expect(env.KIBO_STATE_DIR).toBe(path.join(resolvedHome, ".kibo-work"));
    expect(env.KIBO_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".kibo-work", "kibo.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "kibo doctor --fix",
      env: {},
      expected: "kibo doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "kibo doctor --fix",
      env: { KIBO_PROFILE: "default" },
      expected: "kibo doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "kibo doctor --fix",
      env: { KIBO_PROFILE: "Default" },
      expected: "kibo doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "kibo doctor --fix",
      env: { KIBO_PROFILE: "bad profile" },
      expected: "kibo doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "kibo --profile work doctor --fix",
      env: { KIBO_PROFILE: "work" },
      expected: "kibo --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "kibo --dev doctor",
      env: { KIBO_PROFILE: "dev" },
      expected: "kibo --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("kibo doctor --fix", { KIBO_PROFILE: "work" })).toBe(
      "kibo --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("kibo doctor --fix", { KIBO_PROFILE: "  jbkibo  " })).toBe(
      "kibo --profile jbkibo doctor --fix",
    );
  });

  it("handles command with no args after kibo", () => {
    expect(formatCliCommand("kibo", { KIBO_PROFILE: "test" })).toBe(
      "kibo --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm kibo doctor", { KIBO_PROFILE: "work" })).toBe(
      "pnpm kibo --profile work doctor",
    );
  });

  it("inserts --container when a container hint is set", () => {
    expect(
      formatCliCommand("kibo gateway status --deep", { KIBO_CONTAINER_HINT: "demo" }),
    ).toBe("kibo --container demo gateway status --deep");
  });

  it("ignores unsafe container hints", () => {
    expect(
      formatCliCommand("kibo gateway status --deep", {
        KIBO_CONTAINER_HINT: "demo; rm -rf /",
      }),
    ).toBe("kibo gateway status --deep");
  });

  it("preserves both --container and --profile hints", () => {
    expect(
      formatCliCommand("kibo doctor", {
        KIBO_CONTAINER_HINT: "demo",
        KIBO_PROFILE: "work",
      }),
    ).toBe("kibo --container demo doctor");
  });

  it("does not prepend --container for update commands", () => {
    expect(formatCliCommand("kibo update", { KIBO_CONTAINER_HINT: "demo" })).toBe(
      "kibo update",
    );
    expect(
      formatCliCommand("pnpm kibo update --channel beta", { KIBO_CONTAINER_HINT: "demo" }),
    ).toBe("pnpm kibo update --channel beta");
  });
});
