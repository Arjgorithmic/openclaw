---
summary: "ClawDock shell helpers for Docker-based Kibo installs"
read_when:
  - You run Kibo with Docker often and want shorter day-to-day commands
  - You want a helper layer for dashboard, logs, token setup, and pairing flows
title: "ClawDock"
---

# ClawDock

ClawDock is a small shell-helper layer for Docker-based Kibo installs.

It gives you short commands like `kiboock-start`, `kiboock-dashboard`, and `kiboock-fix-token` instead of longer `docker compose ...` invocations.

If you have not set up Docker yet, start with [Docker](/install/docker).

## Install

Use the canonical helper path:

```bash
mkdir -p ~/.kiboock && curl -sL https://raw.githubusercontent.com/kibo/kibo/main/scripts/kiboock/kiboock-helpers.sh -o ~/.kiboock/kiboock-helpers.sh
echo 'source ~/.kiboock/kiboock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

If you previously installed ClawDock from `scripts/shell-helpers/kiboock-helpers.sh`, reinstall from the new `scripts/kiboock/kiboock-helpers.sh` path. The old raw GitHub path was removed.

## What you get

### Basic operations

| Command            | Description            |
| ------------------ | ---------------------- |
| `kiboock-start`   | Start the gateway      |
| `kiboock-stop`    | Stop the gateway       |
| `kiboock-restart` | Restart the gateway    |
| `kiboock-status`  | Check container status |
| `kiboock-logs`    | Follow gateway logs    |

### Container access

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `kiboock-shell`          | Open a shell inside the gateway container     |
| `kiboock-cli <command>`  | Run Kibo CLI commands in Docker           |
| `kiboock-exec <command>` | Execute an arbitrary command in the container |

### Web UI and pairing

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `kiboock-dashboard`    | Open the Control UI URL      |
| `kiboock-devices`      | List pending device pairings |
| `kiboock-approve <id>` | Approve a pairing request    |

### Setup and maintenance

| Command              | Description                                      |
| -------------------- | ------------------------------------------------ |
| `kiboock-fix-token` | Configure the gateway token inside the container |
| `kiboock-update`    | Pull, rebuild, and restart                       |
| `kiboock-rebuild`   | Rebuild the Docker image only                    |
| `kiboock-clean`     | Remove containers and volumes                    |

### Utilities

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `kiboock-health`      | Run a gateway health check              |
| `kiboock-token`       | Print the gateway token                 |
| `kiboock-cd`          | Jump to the Kibo project directory  |
| `kiboock-config`      | Open `~/.kibo`                      |
| `kiboock-show-config` | Print config files with redacted values |
| `kiboock-workspace`   | Open the workspace directory            |

## First-time flow

```bash
kiboock-start
kiboock-fix-token
kiboock-dashboard
```

If the browser says pairing is required:

```bash
kiboock-devices
kiboock-approve <request-id>
```

## Config and secrets

ClawDock works with the same Docker config split described in [Docker](/install/docker):

- `<project>/.env` for Docker-specific values like image name, ports, and the gateway token
- `~/.kibo/.env` for env-backed provider keys and bot tokens
- `~/.kibo/agents/<agentId>/agent/auth-profiles.json` for stored provider OAuth/API-key auth
- `~/.kibo/kibo.json` for behavior config

Use `kiboock-show-config` when you want to inspect the `.env` files and `kibo.json` quickly. It redacts `.env` values in its printed output.

## Related pages

- [Docker](/install/docker)
- [Docker VM Runtime](/install/docker-vm-runtime)
- [Updating](/install/updating)
