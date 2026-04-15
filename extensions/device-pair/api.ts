export {
  approveDevicePairing,
  clearDeviceBootstrapTokens,
  issueDeviceBootstrapToken,
  PAIRING_SETUP_BOOTSTRAP_PROFILE,
  listDevicePairing,
  revokeDeviceBootstrapToken,
  type DeviceBootstrapProfile,
} from "kibo/plugin-sdk/device-bootstrap";
export { definePluginEntry, type KiboPluginApi } from "kibo/plugin-sdk/plugin-entry";
export {
  resolveGatewayBindUrl,
  resolveGatewayPort,
  resolveTailnetHostWithRunner,
} from "kibo/plugin-sdk/core";
export {
  resolvePreferredKiboTmpDir,
  runPluginCommandWithTimeout,
} from "kibo/plugin-sdk/sandbox";
export { renderQrPngBase64 } from "./qr-image.js";
