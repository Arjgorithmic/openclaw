import type { KiboConfig } from "../config/config.js";
import { resolveProviderBuiltInModelSuppression } from "../plugins/provider-runtime.js";
import { normalizeLowercaseStringOrEmpty } from "../shared/string-coerce.js";
import { normalizeProviderId } from "./provider-id.js";

function resolveBuiltInModelSuppression(params: {
  provider?: string | null;
  id?: string | null;
  baseUrl?: string | null;
  config?: KiboConfig;
}) {
  const provider = normalizeProviderId(params.provider ?? "");
  const modelId = normalizeLowercaseStringOrEmpty(params.id);
  if (!provider || !modelId) {
    return undefined;
  }
  return resolveProviderBuiltInModelSuppression({
    ...(params.config ? { config: params.config } : {}),
    env: process.env,
    context: {
      ...(params.config ? { config: params.config } : {}),
      env: process.env,
      provider,
      modelId,
      ...(params.baseUrl ? { baseUrl: params.baseUrl } : {}),
    },
  });
}

export function shouldSuppressBuiltInModel(params: {
  provider?: string | null;
  id?: string | null;
  baseUrl?: string | null;
  config?: KiboConfig;
}) {
  return resolveBuiltInModelSuppression(params)?.suppress ?? false;
}

export function buildSuppressedBuiltInModelError(params: {
  provider?: string | null;
  id?: string | null;
  baseUrl?: string | null;
  config?: KiboConfig;
}): string | undefined {
  return resolveBuiltInModelSuppression(params)?.errorMessage;
}
