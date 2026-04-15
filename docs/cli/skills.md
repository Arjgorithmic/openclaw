---
summary: "CLI reference for `kibo skills` (search/install/update/list/info/check)"
read_when:
  - You want to see which skills are available and ready to run
  - You want to search, install, or update skills from KiboHub
  - You want to debug missing binaries/env/config for skills
title: "skills"
---

# `kibo skills`

Inspect local skills and install/update skills from KiboHub.

Related:

- Skills system: [Skills](/tools/skills)
- Skills config: [Skills config](/tools/skills-config)
- KiboHub installs: [KiboHub](/tools/kibohub)

## Commands

```bash
kibo skills search "calendar"
kibo skills search --limit 20 --json
kibo skills install <slug>
kibo skills install <slug> --version <version>
kibo skills install <slug> --force
kibo skills update <slug>
kibo skills update --all
kibo skills list
kibo skills list --eligible
kibo skills list --json
kibo skills list --verbose
kibo skills info <name>
kibo skills info <name> --json
kibo skills check
kibo skills check --json
```

`search`/`install`/`update` use KiboHub directly and install into the active
workspace `skills/` directory. `list`/`info`/`check` still inspect the local
skills visible to the current workspace and config.

This CLI `install` command downloads skill folders from KiboHub. Gateway-backed
skill dependency installs triggered from onboarding or Skills settings use the
separate `skills.install` request path instead.

Notes:

- `search [query...]` accepts an optional query; omit it to browse the default
  KiboHub search feed.
- `search --limit <n>` caps returned results.
- `install --force` overwrites an existing workspace skill folder for the same
  slug.
- `update --all` only updates tracked KiboHub installs in the active workspace.
- `list` is the default action when no subcommand is provided.
- `list`, `info`, and `check` write their rendered output to stdout. With
  `--json`, that means the machine-readable payload stays on stdout for pipes
  and scripts.
