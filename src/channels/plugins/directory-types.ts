import type { KiboConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: KiboConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
