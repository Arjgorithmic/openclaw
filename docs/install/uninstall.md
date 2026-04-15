---
summary: "Uninstall Kibo completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Kibo from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `kibo` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
kibo uninstall
```

Non-interactive (automation / npx):

```bash
kibo uninstall --all --yes --non-interactive
npx -y kibo uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
kibo gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
kibo gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${KIBO_STATE_DIR:-$HOME/.kibo}"
```

If you set `KIBO_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.kibo/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g kibo
pnpm remove -g kibo
bun remove -g kibo
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/Kibo.app
```

Notes:

- If you used profiles (`--profile` / `KIBO_PROFILE`), repeat step 3 for each state dir (defaults are `~/.kibo-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `kibo` is missing.

### macOS (launchd)

Default label is `ai.kibo.gateway` (or `ai.kibo.<profile>`; legacy `com.kibo.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.kibo.gateway
rm -f ~/Library/LaunchAgents/ai.kibo.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.kibo.<profile>`. Remove any legacy `com.kibo.*` plists if present.

### Linux (systemd user unit)

Default unit name is `kibo-gateway.service` (or `kibo-gateway-<profile>.service`):

```bash
systemctl --user disable --now kibo-gateway.service
rm -f ~/.config/systemd/user/kibo-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Kibo Gateway` (or `Kibo Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Kibo Gateway"
Remove-Item -Force "$env:USERPROFILE\.kibo\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.kibo-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://github.com/Arjgorithmic/openclaw/install.sh` or `install.ps1`, the CLI was installed with `npm install -g kibo@latest`.
Remove it with `npm rm -g kibo` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `kibo ...` / `bun run kibo ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
