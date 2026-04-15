---
name: kibohub
description: Use the KiboHub CLI to search, install, update, and publish agent skills from kibohub.com. Use when you need to fetch new skills on the fly, sync installed skills to latest or a specific version, or publish new/updated skill folders with the npm-installed kibohub CLI.
metadata:
  {
    "kibo":
      {
        "requires": { "bins": ["kibohub"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "kibohub",
              "bins": ["kibohub"],
              "label": "Install KiboHub CLI (npm)",
            },
          ],
      },
  }
---

# KiboHub CLI

Install

```bash
npm i -g kibohub
```

Auth (publish)

```bash
kibohub login
kibohub whoami
```

Search

```bash
kibohub search "postgres backups"
```

Install

```bash
kibohub install my-skill
kibohub install my-skill --version 1.2.3
```

Update (hash-based match + upgrade)

```bash
kibohub update my-skill
kibohub update my-skill --version 1.2.3
kibohub update --all
kibohub update my-skill --force
kibohub update --all --no-input --force
```

List

```bash
kibohub list
```

Publish

```bash
kibohub publish ./my-skill --slug my-skill --name "My Skill" --version 1.2.0 --changelog "Fixes + docs"
```

Notes

- Default registry: https://kibohub.com (override with KIBOHUB_REGISTRY or --registry)
- Default workdir: cwd (falls back to Kibo workspace); install dir: ./skills (override with --workdir / --dir / KIBOHUB_WORKDIR)
- Update command hashes local files, resolves matching version, and upgrades to latest unless --version is set
