import { loadBundledPluginTestApiSync } from "../../../src/test-utils/bundled-plugin-public-surface.js";

type WhatsAppTestSurface = typeof import("@kibo/whatsapp/test-api.js");
type ZaloTestSurface = typeof import("@kibo/zalo/test-api.js");

const { resolveWhatsAppRuntimeGroupPolicy } =
  loadBundledPluginTestApiSync<WhatsAppTestSurface>("whatsapp");
const { evaluateZaloGroupAccess, resolveZaloRuntimeGroupPolicy } =
  loadBundledPluginTestApiSync<ZaloTestSurface>("zalo");

export {
  evaluateZaloGroupAccess,
  resolveWhatsAppRuntimeGroupPolicy,
  resolveZaloRuntimeGroupPolicy,
};
