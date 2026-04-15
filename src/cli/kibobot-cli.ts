import type { Command } from "commander";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { registerQrCli } from "./qr-cli.js";

export function registerKibobotCli(program: Command) {
  const kibobot = program
    .command("kibobot")
    .description("Legacy kibobot command aliases")
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/kibobot", "docs.kibo.ai/cli/kibobot")}\n`,
    );
  registerQrCli(kibobot);
}
