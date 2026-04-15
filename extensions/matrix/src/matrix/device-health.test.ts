import { describe, expect, it } from "vitest";
import { isKiboManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects Kibo-managed device names", () => {
    expect(isKiboManagedMatrixDevice("Kibo Gateway")).toBe(true);
    expect(isKiboManagedMatrixDevice("Kibo Debug")).toBe(true);
    expect(isKiboManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isKiboManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale Kibo-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "Kibo Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "Kibo Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "Kibo Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary.currentDeviceId).toBe("du314Zpw3A");
    expect(summary.currentKiboDevices).toEqual([
      expect.objectContaining({ deviceId: "du314Zpw3A" }),
    ]);
    expect(summary.staleKiboDevices).toEqual([
      expect.objectContaining({ deviceId: "BritdXC6iL" }),
      expect.objectContaining({ deviceId: "G6NJU9cTgs" }),
    ]);
  });
});
