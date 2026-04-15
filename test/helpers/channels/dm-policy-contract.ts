import type { SignalSender } from "@kibo/signal/contract-api.js";
import { loadBundledPluginContractApiSync } from "../../../src/test-utils/bundled-plugin-public-surface.js";

type SignalContractApiSurface = Pick<
  typeof import("@kibo/signal/contract-api.js"),
  "isSignalSenderAllowed"
>;

const { isSignalSenderAllowed } =
  loadBundledPluginContractApiSync<SignalContractApiSurface>("signal");

export { isSignalSenderAllowed };
export type { SignalSender };
