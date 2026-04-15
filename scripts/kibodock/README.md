# ClawDock <!-- omit in toc -->

Stop typing `docker-compose` commands. Just type `kiboock-start`.

Inspired by Simon Willison's [Running Kibo in Docker](https://til.simonwillison.net/llms/kibo-docker).

- [Quickstart](#quickstart)
- [Available Commands](#available-commands)
  - [Basic Operations](#basic-operations)
  - [Container Access](#container-access)
  - [Web UI \& Devices](#web-ui--devices)
  - [Setup \& Configuration](#setup--configuration)
  - [Maintenance](#maintenance)
  - [Utilities](#utilities)
- [Configuration \& Secrets](#configuration--secrets)
  - [Docker Files](#docker-files)
  - [Config Files](#config-files)
  - [Initial Setup](#initial-setup)
  - [How It Works in Docker](#how-it-works-in-docker)
  - [Env Precedence](#env-precedence)
- [Common Workflows](#common-workflows)
  - [Check Status and Logs](#check-status-and-logs)
  - [Set Up WhatsApp Bot](#set-up-whatsapp-bot)
  - [Troubleshooting Device Pairing](#troubleshooting-device-pairing)
  - [Fix Token Mismatch Issues](#fix-token-mismatch-issues)
  - [Permission Denied](#permission-denied)
- [Requirements](#requirements)
- [Development](#development)

## Quickstart

**Install:**

```bash
mkdir -p ~/.kiboock && curl -sL https://raw.githubusercontent.com/kibo/kibo/main/scripts/kiboock/kiboock-helpers.sh -o ~/.kiboock/kiboock-helpers.sh
```

```bash
echo 'source ~/.kiboock/kiboock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

Canonical docs page: https://github.com/Arjgorithmic/openclaw/install/kiboock

If you previously installed ClawDock from `scripts/shell-helpers/kiboock-helpers.sh`, rerun the install command above. The old raw GitHub path has been removed.

**See what you get:**

```bash
kiboock-help
```

On first command, ClawDock auto-detects your Kibo directory:

- Checks common paths (`~/kibo`, `~/workspace/kibo`, etc.)
- If found, asks you to confirm
- Saves to `~/.kiboock/config`

**First time setup:**

```bash
kiboock-start
```

```bash
kiboock-fix-token
```

```bash
kiboock-dashboard
```

If you see "pairing required":

```bash
kiboock-devices
```

And approve the request for the specific device:

```bash
kiboock-approve <request-id>
```

## Available Commands

### Basic Operations

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `kiboock-start`   | Start the gateway               |
| `kiboock-stop`    | Stop the gateway                |
| `kiboock-restart` | Restart the gateway             |
| `kiboock-status`  | Check container status          |
| `kiboock-logs`    | View live logs (follows output) |

### Container Access

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `kiboock-shell`          | Interactive shell inside the gateway container |
| `kiboock-cli <command>`  | Run Kibo CLI commands                      |
| `kiboock-exec <command>` | Execute arbitrary commands in the container    |

### Web UI & Devices

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `kiboock-dashboard`    | Open web UI in browser with authentication |
| `kiboock-devices`      | List device pairing requests               |
| `kiboock-approve <id>` | Approve a device pairing request           |

### Setup & Configuration

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `kiboock-fix-token` | Configure gateway authentication token (run once) |

### Maintenance

| Command            | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `kiboock-update`  | Pull latest, rebuild image, and restart (one command) |
| `kiboock-rebuild` | Rebuild the Docker image only                         |
| `kiboock-clean`   | Remove all containers and volumes (destructive!)      |

### Utilities

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `kiboock-health`      | Run gateway health check                  |
| `kiboock-token`       | Display the gateway authentication token  |
| `kiboock-cd`          | Jump to the Kibo project directory    |
| `kiboock-config`      | Open the Kibo config directory        |
| `kiboock-show-config` | Print config files with redacted values   |
| `kiboock-workspace`   | Open the workspace directory              |
| `kiboock-help`        | Show all available commands with examples |

## Configuration & Secrets

The Docker setup uses three config files on the host. The container never stores secrets — everything is bind-mounted from local files.

### Docker Files

| File                       | Purpose                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `Dockerfile`               | Builds the `kibo:local` image (Node 22, pnpm, non-root `node` user)    |
| `docker-compose.yml`       | Defines `kibo-gateway` and `kibo-cli` services, bind-mounts, ports |
| `docker-setup.sh`          | First-time setup — builds image, creates `.env` from `.env.example`        |
| `.env.example`             | Template for `<project>/.env` with all supported vars and docs             |
| `docker-compose.extra.yml` | Optional overrides — auto-loaded by ClawDock helpers if present            |

### Config Files

| File                        | Purpose                                          | Examples                                                            |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| `<project>/.env`            | **Docker infra** — image, ports, gateway token   | `KIBO_GATEWAY_TOKEN`, `KIBO_IMAGE`, `KIBO_GATEWAY_PORT` |
| `~/.kibo/.env`          | **Secrets** — API keys and bot tokens            | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`         |
| `~/.kibo/kibo.json` | **Behavior config** — models, channels, policies | Model selection, WhatsApp allowlists, agent settings                |

**Do NOT** put API keys or bot tokens in `kibo.json`. Use `~/.kibo/.env` for all secrets.

### Initial Setup

`./docker-setup.sh` (in the project root) handles first-time Docker configuration:

- Builds the `kibo:local` image from `Dockerfile`
- Creates `<project>/.env` from `.env.example` with a generated gateway token
- Sets up `~/.kibo` directories if they don't exist

```bash
./docker-setup.sh
```

After setup, add your API keys:

```bash
vim ~/.kibo/.env
```

See `.env.example` for all supported keys.

The `Dockerfile` supports two optional build args:

- `KIBO_DOCKER_APT_PACKAGES` — extra apt packages to install (e.g. `ffmpeg`)
- `KIBO_INSTALL_BROWSER=1` — pre-install Chromium for browser automation (adds ~300MB, but skips the 60-90s Playwright install on each container start)

### How It Works in Docker

`docker-compose.yml` bind-mounts both config and workspace from the host:

```yaml
volumes:
  - ${KIBO_CONFIG_DIR}:/home/node/.kibo
  - ${KIBO_WORKSPACE_DIR}:/home/node/.kibo/workspace
```

This means:

- `~/.kibo/.env` is available inside the container at `/home/node/.kibo/.env` — Kibo loads it automatically as the global env fallback
- `~/.kibo/kibo.json` is available at `/home/node/.kibo/kibo.json` — the gateway watches it and hot-reloads most changes
- No need to add API keys to `docker-compose.yml` or configure anything inside the container
- Keys survive `kiboock-update`, `kiboock-rebuild`, and `kiboock-clean` because they live on the host

The project `.env` feeds Docker Compose directly (gateway token, image name, ports). The `~/.kibo/.env` feeds the Kibo process inside the container.

### Example `~/.kibo/.env`

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
TELEGRAM_BOT_TOKEN=123456:ABCDEF...
```

### Example `<project>/.env`

```bash
KIBO_CONFIG_DIR=/Users/you/.kibo
KIBO_WORKSPACE_DIR=/Users/you/.kibo/workspace
KIBO_GATEWAY_PORT=18789
KIBO_BRIDGE_PORT=18790
KIBO_GATEWAY_BIND=lan
KIBO_GATEWAY_TOKEN=<generated-by-docker-setup>
KIBO_IMAGE=kibo:local
```

### Env Precedence

Kibo loads env vars in this order (highest wins, never overrides existing):

1. **Process environment** — `docker-compose.yml` `environment:` block (gateway token, session keys)
2. **`.env` in CWD** — project root `.env` (Docker infra vars)
3. **`~/.kibo/.env`** — global secrets (API keys, bot tokens)
4. **`kibo.json` `env` block** — inline vars, applied only if still missing
5. **Shell env import** — optional login-shell scrape (`KIBO_LOAD_SHELL_ENV=1`)

## Common Workflows

### Update Kibo

> **Important:** `kibo update` does not work inside Docker.
> The container runs as a non-root user with a source-built image, so `npm i -g` fails with EACCES.
> Use `kiboock-update` instead — it pulls, rebuilds, and restarts from the host.

```bash
kiboock-update
```

This runs `git pull` → `docker compose build` → `docker compose down/up` in one step.

If you only want to rebuild without pulling:

```bash
kiboock-rebuild && kiboock-stop && kiboock-start
```

### Check Status and Logs

**Restart the gateway:**

```bash
kiboock-restart
```

**Check container status:**

```bash
kiboock-status
```

**View live logs:**

```bash
kiboock-logs
```

### Set Up WhatsApp Bot

**Shell into the container:**

```bash
kiboock-shell
```

**Inside the container, login to WhatsApp:**

```bash
kibo channels login --channel whatsapp --verbose
```

Scan the QR code with WhatsApp on your phone.

**Verify connection:**

```bash
kibo status
```

### Troubleshooting Device Pairing

**Check for pending pairing requests:**

```bash
kiboock-devices
```

**Copy the Request ID from the "Pending" table, then approve:**

```bash
kiboock-approve <request-id>
```

Then refresh your browser.

### Fix Token Mismatch Issues

If you see "gateway token mismatch" errors:

```bash
kiboock-fix-token
```

This will:

1. Read the token from your `.env` file
2. Configure it in the Kibo config
3. Restart the gateway
4. Verify the configuration

### Permission Denied

**Ensure Docker is running and you have permission:**

```bash
docker ps
```

## Requirements

- Docker and Docker Compose installed
- Bash or Zsh shell
- Kibo project (run `scripts/docker/setup.sh`)

## Development

**Test with fresh config (mimics first-time install):**

```bash
unset KIBOOCK_DIR && rm -f ~/.kiboock/config && source scripts/kiboock/kiboock-helpers.sh
```

Then run any command to trigger auto-detect:

```bash
kiboock-start
```
