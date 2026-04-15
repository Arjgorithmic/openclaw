# Contributing to Kibo

Welcome to the Kibo ecosystem! 🍌

## Quick Links

- **GitHub:** https://github.com/Arjgorithmic
- **Vision:** [`VISION.md`](VISION.md)
- **Email:** arjunpdineshofficial@gamil.com

## How to Contribute

1. **Bugs & small fixes** → Open a PR!
2. **New features / architecture** → Start a [GitHub Discussion](https://github.com/Arjgorithmic/openclaw/discussions)
3. **Refactor-only PRs** → Don't open a PR. We are not accepting refactor-only changes unless explicitly requested as part of a concrete fix.
4. **Questions** → Contact arjunpdineshofficial@gamil.com

## PR Limits

We cap at **10 open PRs per author**. If you exceed this, the `r: too-many-prs` label is added and your PR is auto-closed. This is a hard limit.

## Before You PR

- Test locally with your Kibo instance
- Run tests: `pnpm build && pnpm check && pnpm test`
- For extension/plugin changes, run the fast local lane first:
  - `pnpm test:extension <extension-name>`
  - `pnpm test:extension --list` to see valid extension ids
  - If you changed shared plugin or channel surfaces, run `pnpm test:contracts`
  - For targeted shared-surface work, use `pnpm test:contracts:channels` or `pnpm test:contracts:plugins`
- Ensure CI checks pass
- Keep PRs focused (one thing per PR; do not mix unrelated concerns)
- Describe what & why
- **Include screenshots** — one showing the problem/before, one showing the fix/after (for UI or visual changes)
- Use American English spelling and grammar in code, comments, docs, and UI strings

## Review Conversations Are Author-Owned

If a bot leaves review conversations on your PR, you are expected to handle the follow-through:

- Resolve the conversation yourself once the code or explanation fully addresses the concern
- Reply and leave it open only when you need judgment
- Do not leave "fixed" review conversations for others to clean up for you

This applies to both human-authored and AI-assisted PRs.

## AI/Vibe-Coded PRs Welcome! 🤖

Built with AI tools? **Awesome - just mark it!**

Please include in your PR:

- [ ] Mark as AI-assisted in the PR title or description
- [ ] Note the degree of testing (untested / lightly tested / fully tested)
- [ ] Include prompts or session logs if possible (super helpful!)
- [ ] Confirm you understand what the code does

AI PRs are first-class citizens here. We just want transparency so reviewers know what to look for.

## Current Focus & Roadmap 🗺

We are currently prioritizing:

- **Stability**: Fixing edge cases in channel connections.
- **UX**: Improving the onboarding wizard and error messages.
- **Performance**: Optimizing token usage and compaction logic.

Check the [GitHub Issues](https://github.com/kibo/kibo/issues) for ["good first issue"](https://github.com/kibo/kibo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) labels.

## Report a Vulnerability

We take security reports seriously. Report vulnerabilities directly to the repository where the issue lives:

- **Core CLI and gateway** — [kibo/kibo](https://github.com/kibo/kibo)
- **macOS desktop app** — [kibo/kibo](https://github.com/kibo/kibo) (apps/macos)
- **iOS app** — [kibo/kibo](https://github.com/kibo/kibo) (apps/ios)
- **Android app** — [kibo/kibo](https://github.com/kibo/kibo) (apps/android)
- **KiboHub** — [kibo/kibohub](https://github.com/kibo/kibohub)
- **Trust and threat model** — [kibo/trust](https://github.com/kibo/trust)

For issues that don't fit a specific repo, or if you're unsure, email **arjunpdineshofficial@gamil.com** and we'll route it.

### Required in Reports

1. **Title**
2. **Severity Assessment**
3. **Impact**
4. **Affected Component**
5. **Technical Reproduction**
6. **Demonstrated Impact**
7. **Environment**
8. **Remediation Advice**

Reports without reproduction steps, demonstrated impact, and remediation advice will be deprioritized.
