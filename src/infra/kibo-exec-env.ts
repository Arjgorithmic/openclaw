export const KIBO_CLI_ENV_VAR = "KIBO_CLI";
export const KIBO_CLI_ENV_VALUE = "1";

export function markKiboExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [KIBO_CLI_ENV_VAR]: KIBO_CLI_ENV_VALUE,
  };
}

export function ensureKiboExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[KIBO_CLI_ENV_VAR] = KIBO_CLI_ENV_VALUE;
  return env;
}
