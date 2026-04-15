import chalk, { Chalk } from "chalk";
import { KIBO_SHELL_PALETTE } from "./palette.js";

const hasForceColor =
  typeof process.env.FORCE_COLOR === "string" &&
  process.env.FORCE_COLOR.trim().length > 0 &&
  process.env.FORCE_COLOR.trim() !== "0";

const baseChalk = process.env.NO_COLOR && !hasForceColor ? new Chalk({ level: 0 }) : chalk;

const hex = (value: string) => baseChalk.hex(value);

export const theme = {
  accent: hex(KIBO_SHELL_PALETTE.accent),
  accentBright: hex(KIBO_SHELL_PALETTE.accentBright),
  accentDim: hex(KIBO_SHELL_PALETTE.accentDim),
  info: hex(KIBO_SHELL_PALETTE.info),
  success: hex(KIBO_SHELL_PALETTE.success),
  warn: hex(KIBO_SHELL_PALETTE.warn),
  error: hex(KIBO_SHELL_PALETTE.error),
  muted: hex(KIBO_SHELL_PALETTE.muted),
  heading: baseChalk.bold.hex(KIBO_SHELL_PALETTE.accent),
  command: hex(KIBO_SHELL_PALETTE.accentBright),
  option: hex(KIBO_SHELL_PALETTE.warn),
} as const;

export const isRich = () => Boolean(baseChalk.level > 0);

export const colorize = (rich: boolean, color: (value: string) => string, value: string) =>
  rich ? color(value) : value;
