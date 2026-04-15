import { describe, expect, it } from "vitest";
import {
  ensureKiboExecMarkerOnProcess,
  markKiboExecEnv,
  KIBO_CLI_ENV_VALUE,
  KIBO_CLI_ENV_VAR,
} from "./kibo-exec-env.js";

describe("markKiboExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", KIBO_CLI: "0" };
    const marked = markKiboExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      KIBO_CLI: KIBO_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.KIBO_CLI).toBe("0");
  });
});

describe("ensureKiboExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [KIBO_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureKiboExecMarkerOnProcess(env)).toBe(env);
    expect(env[KIBO_CLI_ENV_VAR]).toBe(KIBO_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[KIBO_CLI_ENV_VAR];
    delete process.env[KIBO_CLI_ENV_VAR];

    try {
      expect(ensureKiboExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[KIBO_CLI_ENV_VAR]).toBe(KIBO_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[KIBO_CLI_ENV_VAR];
      } else {
        process.env[KIBO_CLI_ENV_VAR] = previous;
      }
    }
  });
});
