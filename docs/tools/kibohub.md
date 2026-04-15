---
summary: "KiboHub guide: public registry, native Kibo install flows, and KiboHub CLI workflows"
read_when:
  - Introducing KiboHub to new users
  - Installing, searching, or publishing skills or plugins
  - Explaining KiboHub CLI flags and sync behavior
title: "KiboHub"
---

# KiboHub

KiboHub is the public registry for **Kibo skills and plugins**.

- Use native `kibo` commands to search/install/update skills and install
  plugins from KiboHub.
- Use the separate `kibohub` CLI when you need registry auth, publish, delete,
  undelete, or sync workflows.

Site: [kibohub.ai](https://github.com/Arjgorithmic/openclaw)

## Native Kibo flows

Skills:

```bash
kibo skills search "calendar"
kibo skills install <skill-slug>
kibo skills update --all
```

Plugins:

```bash
kibo plugins install kibohub:<package>
kibo plugins update --all
```

Bare npm-safe plugin specs are also tried against KiboHub before npm:

```bash
kibo plugins install kibo-codex-app-server
```

Native `kibo` commands install into your active workspace and persist source
metadata so later `update` calls can stay on KiboHub.

Plugin installs validate advertised `pluginApi` and `minGatewayVersion`
compatibility before archive install runs, so incompatible hosts fail closed
early instead of partially installing the package.

`kibo plugins install kibohub:...` only accepts installable plugin families.
If a KiboHub package is actually a skill, Kibo stops and points you at
`kibo skills install <slug>` instead.

## What KiboHub is

- A public registry for Kibo skills and plugins.
- A versioned store of skill bundles and metadata.
- A discovery surface for search, tags, and usage signals.

## How it works

1. A user publishes a skill bundle (files + metadata).
2. KiboHub stores the bundle, parses metadata, and assigns a version.
3. The registry indexes the skill for search and discovery.
4. Users browse, download, and install skills in Kibo.

## What you can do

- Publish new skills and new versions of existing skills.
- Discover skills by name, tags, or search.
- Download skill bundles and inspect their files.
- Report skills that are abusive or unsafe.
- If you are a moderator, hide, unhide, delete, or ban.

## Who this is for (beginner-friendly)

If you want to add new capabilities to your Kibo agent, KiboHub is the easiest way to find and install skills. You do not need to know how the backend works. You can:

- Search for skills by plain language.
- Install a skill into your workspace.
- Update skills later with one command.
- Back up your own skills by publishing them.

## Quick start (non-technical)

1. Search for something you need:
   - `kibo skills search "calendar"`
2. Install a skill:
   - `kibo skills install <skill-slug>`
3. Start a new Kibo session so it picks up the new skill.
4. If you want to publish or manage registry auth, install the separate
   `kibohub` CLI too.

## Install the KiboHub CLI

You only need this for registry-authenticated workflows such as publish/sync:

```bash
npm i -g kibohub
```

```bash
pnpm add -g kibohub
```

## How it fits into Kibo

Native `kibo skills install` installs into the active workspace `skills/`
directory. `kibo plugins install kibohub:...` records a normal managed
plugin install plus KiboHub source metadata for updates.

Anonymous KiboHub plugin installs also fail closed for private packages.
Community or other non-official channels can still install, but Kibo warns
so operators can review source and verification before enabling them.

The separate `kibohub` CLI also installs skills into `./skills` under your
current working directory. If an Kibo workspace is configured, `kibohub`
falls back to that workspace unless you override `--workdir` (or
`KIBOHUB_WORKDIR`). Kibo loads workspace skills from `<workspace>/skills`
and will pick them up in the **next** session. If you already use
`~/.kibo/skills` or bundled skills, workspace skills take precedence.

For more detail on how skills are loaded, shared, and gated, see
[Skills](/tools/skills).

## Skill system overview

A skill is a versioned bundle of files that teaches Kibo how to perform a
specific task. Each publish creates a new version, and the registry keeps a
history of versions so users can audit changes.

A typical skill includes:

- A `SKILL.md` file with the primary description and usage.
- Optional configs, scripts, or supporting files used by the skill.
- Metadata such as tags, summary, and install requirements.

KiboHub uses metadata to power discovery and safely expose skill capabilities.
The registry also tracks usage signals (such as stars and downloads) to improve
ranking and visibility.

## What the service provides (features)

- **Public browsing** of skills and their `SKILL.md` content.
- **Search** powered by embeddings (vector search), not just keywords.
- **Versioning** with semver, changelogs, and tags (including `latest`).
- **Downloads** as a zip per version.
- **Stars and comments** for community feedback.
- **Moderation** hooks for approvals and audits.
- **CLI-friendly API** for automation and scripting.

## Security and moderation

KiboHub is open by default. Anyone can upload skills, but a GitHub account must
be at least one week old to publish. This helps slow down abuse without blocking
legitimate contributors.

Reporting and moderation:

- Any signed in user can report a skill.
- Report reasons are required and recorded.
- Each user can have up to 20 active reports at a time.
- Skills with more than 3 unique reports are auto hidden by default.
- Moderators can view hidden skills, unhide them, delete them, or ban users.
- Abusing the report feature can result in account bans.

Interested in becoming a moderator? Ask in the Kibo Discord and contact a
moderator or maintainer.

## CLI commands and parameters

Global options (apply to all commands):

- `--workdir <dir>`: Working directory (default: current dir; falls back to Kibo workspace).
- `--dir <dir>`: Skills directory, relative to workdir (default: `skills`).
- `--site <url>`: Site base URL (browser login).
- `--registry <url>`: Registry API base URL.
- `--no-input`: Disable prompts (non-interactive).
- `-V, --cli-version`: Print CLI version.

Auth:

- `kibohub login` (browser flow) or `kibohub login --token <token>`
- `kibohub logout`
- `kibohub whoami`

Options:

- `--token <token>`: Paste an API token.
- `--label <label>`: Label stored for browser login tokens (default: `CLI token`).
- `--no-browser`: Do not open a browser (requires `--token`).

Search:

- `kibohub search "query"`
- `--limit <n>`: Max results.

Install:

- `kibohub install <slug>`
- `--version <version>`: Install a specific version.
- `--force`: Overwrite if the folder already exists.

Update:

- `kibohub update <slug>`
- `kibohub update --all`
- `--version <version>`: Update to a specific version (single slug only).
- `--force`: Overwrite when local files do not match any published version.

List:

- `kibohub list` (reads `.kibohub/lock.json`)

Publish skills:

- `kibohub skill publish <path>`
- `--slug <slug>`: Skill slug.
- `--name <name>`: Display name.
- `--version <version>`: Semver version.
- `--changelog <text>`: Changelog text (can be empty).
- `--tags <tags>`: Comma-separated tags (default: `latest`).

Publish plugins:

- `kibohub package publish <source>`
- `<source>` can be a local folder, `owner/repo`, `owner/repo@ref`, or a GitHub URL.
- `--dry-run`: Build the exact publish plan without uploading anything.
- `--json`: Emit machine-readable output for CI.
- `--source-repo`, `--source-commit`, `--source-ref`: Optional overrides when auto-detection is not enough.

Delete/undelete (owner/admin only):

- `kibohub delete <slug> --yes`
- `kibohub undelete <slug> --yes`

Sync (scan local skills + publish new/updated):

- `kibohub sync`
- `--root <dir...>`: Extra scan roots.
- `--all`: Upload everything without prompts.
- `--dry-run`: Show what would be uploaded.
- `--bump <type>`: `patch|minor|major` for updates (default: `patch`).
- `--changelog <text>`: Changelog for non-interactive updates.
- `--tags <tags>`: Comma-separated tags (default: `latest`).
- `--concurrency <n>`: Registry checks (default: 4).

## Common workflows for agents

### Search for skills

```bash
kibohub search "postgres backups"
```

### Download new skills

```bash
kibohub install my-skill-pack
```

### Update installed skills

```bash
kibohub update --all
```

### Back up your skills (publish or sync)

For a single skill folder:

```bash
kibohub skill publish ./my-skill --slug my-skill --name "My Skill" --version 1.0.0 --tags latest
```

To scan and back up many skills at once:

```bash
kibohub sync --all
```

### Publish a plugin from GitHub

```bash
kibohub package publish your-org/your-plugin --dry-run
kibohub package publish your-org/your-plugin
kibohub package publish your-org/your-plugin@v1.0.0
kibohub package publish https://github.com/your-org/your-plugin
```

Code plugins must include the required Kibo metadata in `package.json`:

```json
{
  "name": "@myorg/kibo-my-plugin",
  "version": "1.0.0",
  "type": "module",
  "kibo": {
    "extensions": ["./index.ts"],
    "compat": {
      "pluginApi": ">=2026.3.24-beta.2",
      "minGatewayVersion": "2026.3.24-beta.2"
    },
    "build": {
      "kiboVersion": "2026.3.24-beta.2",
      "pluginSdkVersion": "2026.3.24-beta.2"
    }
  }
}
```

## Advanced details (technical)

### Versioning and tags

- Each publish creates a new **semver** `SkillVersion`.
- Tags (like `latest`) point to a version; moving tags lets you roll back.
- Changelogs are attached per version and can be empty when syncing or publishing updates.

### Local changes vs registry versions

Updates compare the local skill contents to registry versions using a content hash. If local files do not match any published version, the CLI asks before overwriting (or requires `--force` in non-interactive runs).

### Sync scanning and fallback roots

`kibohub sync` scans your current workdir first. If no skills are found, it falls back to known legacy locations (for example `~/kibo/skills` and `~/.kibo/skills`). This is designed to find older skill installs without extra flags.

### Storage and lockfile

- Installed skills are recorded in `.kibohub/lock.json` under your workdir.
- Auth tokens are stored in the KiboHub CLI config file (override via `KIBOHUB_CONFIG_PATH`).

### Telemetry (install counts)

When you run `kibohub sync` while logged in, the CLI sends a minimal snapshot to compute install counts. You can disable this entirely:

```bash
export KIBOHUB_DISABLE_TELEMETRY=1
```

## Environment variables

- `KIBOHUB_SITE`: Override the site URL.
- `KIBOHUB_REGISTRY`: Override the registry API URL.
- `KIBOHUB_CONFIG_PATH`: Override where the CLI stores the token/config.
- `KIBOHUB_WORKDIR`: Override the default workdir.
- `KIBOHUB_DISABLE_TELEMETRY=1`: Disable telemetry on `sync`.
