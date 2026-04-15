---
summary: "CLI reference for `kibo reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `kibo reset`

Reset local config/state (keeps the CLI installed).

Options:

- `--scope <scope>`: `config`, `config+creds+sessions`, or `full`
- `--yes`: skip confirmation prompts
- `--non-interactive`: disable prompts; requires `--scope` and `--yes`
- `--dry-run`: print actions without removing files

Examples:

```bash
kibo backup create
kibo reset
kibo reset --dry-run
kibo reset --scope config --yes --non-interactive
kibo reset --scope config+creds+sessions --yes --non-interactive
kibo reset --scope full --yes --non-interactive
```

Notes:

- Run `kibo backup create` first if you want a restorable snapshot before removing local state.
- If you omit `--scope`, `kibo reset` uses an interactive prompt to choose what to remove.
- `--non-interactive` is only valid when both `--scope` and `--yes` are set.
