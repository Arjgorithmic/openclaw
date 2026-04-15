export type InstallRecordBase = {
  source: "npm" | "archive" | "path" | "kibohub";
  spec?: string;
  sourcePath?: string;
  installPath?: string;
  version?: string;
  resolvedName?: string;
  resolvedVersion?: string;
  resolvedSpec?: string;
  integrity?: string;
  shasum?: string;
  resolvedAt?: string;
  installedAt?: string;
  kibohubUrl?: string;
  kibohubPackage?: string;
  kibohubFamily?: "code-plugin" | "bundle-plugin";
  kibohubChannel?: "official" | "community" | "private";
};
