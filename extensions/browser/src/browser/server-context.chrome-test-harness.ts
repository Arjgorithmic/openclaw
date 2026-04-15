import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/kibo" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchKiboChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveKiboUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopKiboChrome: vi.fn(async () => {}),
}));
