export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleKiboDevices: MatrixManagedDeviceInfo[];
  currentKiboDevices: MatrixManagedDeviceInfo[];
};

const KIBO_DEVICE_NAME_PREFIX = "Kibo ";

export function isKiboManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(KIBO_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const kiboDevices = devices.filter((device) =>
    isKiboManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleKiboDevices: kiboDevices.filter((device) => !device.current),
    currentKiboDevices: kiboDevices.filter((device) => device.current),
  };
}
