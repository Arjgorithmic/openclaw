import type { KiboPluginApi } from "kibo/plugin-sdk/channel-plugin-common";

export function registerMatrixCliMetadata(api: KiboPluginApi) {
  api.registerCli(
    async ({ program }) => {
      const { registerMatrixCli } = await import("./cli.js");
      registerMatrixCli({ program });
    },
    {
      descriptors: [
        {
          name: "matrix",
          description: "Manage Matrix accounts, verification, devices, and profile state",
          hasSubcommands: true,
        },
      ],
    },
  );
}
