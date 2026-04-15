# Build Kibo Shell Invaders

```yaml qa-scenario
id: shell-invaders-build
title: Build Kibo Shell Invaders
surface: workspace
objective: Verify the agent can read the repo, create a tiny playable artifact, and report what changed.
successCriteria:
  - Agent inspects source before coding.
  - Agent builds a tiny playable Kibo Shell Invaders artifact.
  - Agent explains how to run or view the artifact.
docsRefs:
  - docs/help/testing.md
  - docs/web/dashboard.md
codeRefs:
  - extensions/qa-lab/src/report.ts
  - extensions/qa-lab/web/src/app.ts
execution:
  kind: flow
  summary: Verify the agent can read the repo, create a tiny playable artifact, and report what changed.
  config:
    prompt: Read the QA kickoff context first, then build a tiny Kibo Shell Invaders HTML game at ./shell-invaders.html in this workspace and tell me where it is.
```

```yaml qa-flow
steps:
  - name: creates the artifact after reading context
    actions:
      - call: reset
      - call: runAgentPrompt
        args:
          - ref: env
          - sessionKey: agent:qa:shell-invaders
            message:
              expr: config.prompt
            timeoutMs:
              expr: liveTurnTimeoutMs(env, 30000)
      - call: waitForOutboundMessage
        args:
          - ref: state
          - lambda:
              params: [candidate]
              expr: "candidate.conversation.id === 'qa-operator'"
      - set: artifactPath
        value:
          expr: "path.join(env.gateway.workspaceDir, 'shell-invaders.html')"
      - call: waitForCondition
        saveAs: artifact
        args:
          - lambda:
              async: true
              expr: "((await fs.readFile(artifactPath, 'utf8').catch(() => null))?.includes('Kibo Shell Invaders') ? await fs.readFile(artifactPath, 'utf8').catch(() => null) : undefined)"
          - expr: liveTurnTimeoutMs(env, 20000)
          - 250
      - assert:
          expr: "artifact.includes('Kibo Shell Invaders')"
          message: missing Kibo Shell Invaders artifact
      - assert:
          expr: "!env.mock || (await fetchJson(`${env.mock.baseUrl}/debug/requests`)).some((request) => (request.toolOutput ?? '').includes('QA mission'))"
          message: expected pre-write read evidence
    detailsExpr: "'shell-invaders.html'"
```
