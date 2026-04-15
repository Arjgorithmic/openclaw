import { describe, expect, it, vi } from "vitest";
import { createTestPluginApi } from "../../../test/helpers/plugins/plugin-api.js";
import type { KiboPluginApi, KiboPluginToolContext } from "../runtime-api.js";
import { createShellTool } from "./shell-tool.js";
import { createFakeTaskFlow } from "./taskflow-test-helpers.js";

function fakeApi(overrides: Partial<KiboPluginApi> = {}): KiboPluginApi {
  return createTestPluginApi({
    id: "shell",
    name: "shell",
    source: "test",
    runtime: { version: "test" } as any,
    resolvePath: (p) => p,
    ...overrides,
  });
}

function fakeCtx(overrides: Partial<KiboPluginToolContext> = {}): KiboPluginToolContext {
  return {
    config: {},
    workspaceDir: "/tmp",
    agentDir: "/tmp",
    agentId: "main",
    sessionKey: "main",
    messageChannel: undefined,
    agentAccountId: undefined,
    sandboxed: false,
    ...overrides,
  };
}

describe("shell plugin tool", () => {
  it("returns the Shell envelope in details", async () => {
    const runner = {
      run: vi.fn().mockResolvedValue({
        ok: true,
        status: "ok",
        output: [{ hello: "world" }],
        requiresApproval: null,
      }),
    };

    const tool = createShellTool(fakeApi(), { runner });
    const res = await tool.execute("call1", {
      action: "run",
      pipeline: "noop",
      timeoutMs: 1000,
    });

    expect(runner.run).toHaveBeenCalledWith({
      action: "run",
      pipeline: "noop",
      cwd: process.cwd(),
      timeoutMs: 1000,
      maxStdoutBytes: 512_000,
    });
    expect(res.details).toMatchObject({
      ok: true,
      status: "ok",
      output: [{ hello: "world" }],
      requiresApproval: null,
    });
  });

  it("supports approval envelopes without changing the tool contract", async () => {
    const runner = {
      run: vi.fn().mockResolvedValue({
        ok: true,
        status: "needs_approval",
        output: [],
        requiresApproval: {
          type: "approval_request",
          prompt: "Send these alerts?",
          items: [{ id: "alert-1" }],
          resumeToken: "resume-token-1",
        },
      }),
    };

    const tool = createShellTool(fakeApi(), { runner });
    const res = await tool.execute("call-injected-runner", {
      action: "run",
      pipeline: "noop",
      argsJson: '{"since_hours":1}',
      timeoutMs: 1500,
      maxStdoutBytes: 4096,
    });

    expect(runner.run).toHaveBeenCalledWith({
      action: "run",
      pipeline: "noop",
      argsJson: '{"since_hours":1}',
      cwd: process.cwd(),
      timeoutMs: 1500,
      maxStdoutBytes: 4096,
    });
    expect(res.details).toMatchObject({
      ok: true,
      status: "needs_approval",
      requiresApproval: {
        type: "approval_request",
        prompt: "Send these alerts?",
        resumeToken: "resume-token-1",
      },
    });
  });

  it("throws when the runner returns an error envelope", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: {
        run: vi.fn().mockResolvedValue({
          ok: false,
          error: {
            type: "runtime_error",
            message: "boom",
          },
        }),
      },
    });

    await expect(
      tool.execute("call-runner-error", {
        action: "run",
        pipeline: "noop",
      }),
    ).rejects.toThrow("boom");
  });

  it("can run through managed TaskFlow mode", async () => {
    const runner = {
      run: vi.fn().mockResolvedValue({
        ok: true,
        status: "needs_approval",
        output: [],
        requiresApproval: {
          type: "approval_request",
          prompt: "Approve this?",
          items: [{ id: "item-1" }],
          resumeToken: "resume-1",
        },
      }),
    };
    const taskFlow = createFakeTaskFlow();

    const tool = createShellTool(fakeApi(), { runner, taskFlow });
    const res = await tool.execute("call-managed-run", {
      action: "run",
      pipeline: "noop",
      flowControllerId: "tests/shell",
      flowGoal: "Run Shell workflow",
      flowStateJson: '{"lane":"email"}',
      flowCurrentStep: "run_shell",
      flowWaitingStep: "await_review",
    });

    expect(taskFlow.createManaged).toHaveBeenCalledWith({
      controllerId: "tests/shell",
      goal: "Run Shell workflow",
      currentStep: "run_shell",
      stateJson: { lane: "email" },
    });
    expect(taskFlow.setWaiting).toHaveBeenCalledWith({
      flowId: "flow-1",
      expectedRevision: 1,
      currentStep: "await_review",
      waitJson: {
        kind: "shell_approval",
        prompt: "Approve this?",
        items: [{ id: "item-1" }],
        resumeToken: "resume-1",
      },
    });
    expect(res.details).toMatchObject({
      ok: true,
      status: "needs_approval",
      flow: {
        flowId: "flow-1",
      },
      mutation: {
        applied: true,
      },
    });
  });

  it("rejects managed TaskFlow params when no bound taskFlow runtime is available", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: { run: vi.fn() },
    });

    await expect(
      tool.execute("call-missing-taskflow", {
        action: "run",
        pipeline: "noop",
        flowControllerId: "tests/shell",
        flowGoal: "Run Shell workflow",
      }),
    ).rejects.toThrow(/Managed TaskFlow run mode requires a bound taskFlow runtime/);
  });

  it("rejects invalid flowStateJson in managed TaskFlow mode", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: { run: vi.fn() },
      taskFlow: createFakeTaskFlow(),
    });

    await expect(
      tool.execute("call-invalid-flow-json", {
        action: "run",
        pipeline: "noop",
        flowControllerId: "tests/shell",
        flowGoal: "Run Shell workflow",
        flowStateJson: "{bad",
      }),
    ).rejects.toThrow(/flowStateJson must be valid JSON/);
  });

  it("rejects managed TaskFlow resume mode without a token", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: { run: vi.fn() },
      taskFlow: createFakeTaskFlow(),
    });

    await expect(
      tool.execute("call-missing-resume-token", {
        action: "resume",
        flowId: "flow-1",
        flowExpectedRevision: 1,
        approve: true,
      }),
    ).rejects.toThrow(/token required when using managed TaskFlow resume mode/);
  });

  it("rejects managed TaskFlow resume mode without approve", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: { run: vi.fn() },
      taskFlow: createFakeTaskFlow(),
    });

    await expect(
      tool.execute("call-missing-resume-approve", {
        action: "resume",
        token: "resume-token",
        flowId: "flow-1",
        flowExpectedRevision: 1,
      }),
    ).rejects.toThrow(/approve required when using managed TaskFlow resume mode/);
  });

  it("requires action", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: { run: vi.fn() },
    });
    await expect(tool.execute("call-action-missing", {})).rejects.toThrow(/action required/);
  });

  it("rejects unknown action", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: { run: vi.fn() },
    });
    await expect(
      tool.execute("call-action-unknown", {
        action: "explode",
      }),
    ).rejects.toThrow(/Unknown action/);
  });

  it("rejects absolute cwd", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: { run: vi.fn() },
    });
    await expect(
      tool.execute("call-absolute-cwd", {
        action: "run",
        pipeline: "noop",
        cwd: "/tmp",
      }),
    ).rejects.toThrow(/cwd must be a relative path/);
  });

  it("rejects cwd that escapes the gateway working directory", async () => {
    const tool = createShellTool(fakeApi(), {
      runner: { run: vi.fn() },
    });
    await expect(
      tool.execute("call-escape-cwd", {
        action: "run",
        pipeline: "noop",
        cwd: "../../etc",
      }),
    ).rejects.toThrow(/must stay within/);
  });

  it("can be gated off in sandboxed contexts", async () => {
    const api = fakeApi();
    const factoryTool = (ctx: KiboPluginToolContext) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createShellTool(api, {
        runner: { run: vi.fn() },
      });
    };

    expect(factoryTool(fakeCtx({ sandboxed: true }))).toBeNull();
    expect(factoryTool(fakeCtx({ sandboxed: false }))?.name).toBe("shell");
  });
});
