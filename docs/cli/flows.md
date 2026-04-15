---
summary: "Redirect: flow commands live under `kibo tasks flow`"
read_when:
  - You encounter kibo flows in older docs or release notes
title: "flows (redirect)"
---

# `kibo tasks flow`

Flow commands are subcommands of `kibo tasks`, not a standalone `flows` command.

```bash
kibo tasks flow list [--json]
kibo tasks flow show <lookup>
kibo tasks flow cancel <lookup>
```

For full documentation see [Task Flow](/automation/taskflow) and the [tasks CLI reference](/cli/index#tasks).
