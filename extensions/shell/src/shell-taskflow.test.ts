import { describe, expect, it, vi } from "vitest";
import type { ShellRunner } from "./shell-runner.js";
import { resumeManagedShellFlow, runManagedShellFlow } from "./shell-taskflow.js";
import { createFakeTaskFlow } from "./taskflow-test-helpers.js";

function expectManagedFlowFailure(
  result: Awaited<ReturnType<typeof runManagedShellFlow | typeof resumeManagedShellFlow>>,
) {
  expect(result.ok).toBe(false);
  if (result.ok) {
    throw new Error("Expected managed Shell flow to fail");
  }
  return result;
}
function createRunner(result: Awaited<ReturnType<ShellRunner["run"]>>): ShellRunner {
  return {
    run: vi.fn().mockResolvedValue(result),
  };
}

function createRunFlowParams(
  taskFlow: ReturnType<typeof createFakeTaskFlow>,
  runner: ShellRunner,
): Parameters<typeof runManagedShellFlow>[0] {
  return {
    taskFlow,
    runner,
    runnerParams: {
      action: "run",
      pipeline: "noop",
      cwd: process.cwd(),
      timeoutMs: 1000,
      maxStdoutBytes: 4096,
    },
    controllerId: "tests/shell",
    goal: "Run Shell workflow",
  };
}

function createResumeFlowParams(
  taskFlow: ReturnType<typeof createFakeTaskFlow>,
  runner: ShellRunner,
): Parameters<typeof resumeManagedShellFlow>[0] {
  return {
    taskFlow,
    runner,
    flowId: "flow-1",
    expectedRevision: 4,
    runnerParams: {
      action: "resume",
      token: "resume-1",
      approve: true,
      cwd: process.cwd(),
      timeoutMs: 1000,
      maxStdoutBytes: 4096,
    },
  };
}

describe("runManagedShellFlow", () => {
  it("creates a flow and finishes it when Shell succeeds", async () => {
    const taskFlow = createFakeTaskFlow();
    const runner = createRunner({
      ok: true,
      status: "ok",
      output: [{ id: "result-1" }],
      requiresApproval: null,
    });

    const result = await runManagedShellFlow(createRunFlowParams(taskFlow, runner));

    expect(result.ok).toBe(true);
    expect(taskFlow.createManaged).toHaveBeenCalledWith({
      controllerId: "tests/shell",
      goal: "Run Shell workflow",
      currentStep: "run_shell",
    });
    expect(taskFlow.finish).toHaveBeenCalledWith({
      flowId: "flow-1",
      expectedRevision: 1,
    });
  });

  it("moves the flow to waiting when Shell requests approval", async () => {
    const taskFlow = createFakeTaskFlow();
    const createdAt = new Date("2026-04-05T21:00:00.000Z");
    const runner = createRunner({
      ok: true,
      status: "needs_approval",
      output: [],
      requiresApproval: {
        type: "approval_request",
        prompt: "Approve this?",
        items: [{ id: "item-1", createdAt, count: 2n, skip: undefined }],
        resumeToken: "resume-1",
      },
    });

    const result = await runManagedShellFlow(createRunFlowParams(taskFlow, runner));

    expect(result.ok).toBe(true);
    expect(taskFlow.setWaiting).toHaveBeenCalledWith({
      flowId: "flow-1",
      expectedRevision: 1,
      currentStep: "await_shell_approval",
      waitJson: {
        kind: "shell_approval",
        prompt: "Approve this?",
        items: [{ id: "item-1", createdAt: createdAt.toISOString(), count: "2" }],
        resumeToken: "resume-1",
      },
    });
  });

  it("fails the flow when Shell returns an error envelope", async () => {
    const taskFlow = createFakeTaskFlow();
    const runner = createRunner({
      ok: false,
      error: {
        type: "runtime_error",
        message: "boom",
      },
    });

    const result = expectManagedFlowFailure(
      await runManagedShellFlow(createRunFlowParams(taskFlow, runner)),
    );
    expect(result.error.message).toBe("boom");
    expect(taskFlow.fail).toHaveBeenCalledWith({
      flowId: "flow-1",
      expectedRevision: 1,
    });
  });

  it("fails the flow when the runner throws", async () => {
    const taskFlow = createFakeTaskFlow();
    const runner: ShellRunner = {
      run: vi.fn().mockRejectedValue(new Error("crashed")),
    };

    const result = expectManagedFlowFailure(
      await runManagedShellFlow(createRunFlowParams(taskFlow, runner)),
    );
    expect(result.error.message).toBe("crashed");
    expect(taskFlow.fail).toHaveBeenCalledWith({
      flowId: "flow-1",
      expectedRevision: 1,
    });
  });
});

describe("resumeManagedShellFlow", () => {
  it("resumes the flow and finishes it on success", async () => {
    const taskFlow = createFakeTaskFlow();
    const runner = createRunner({
      ok: true,
      status: "ok",
      output: [],
      requiresApproval: null,
    });

    const result = await resumeManagedShellFlow(createResumeFlowParams(taskFlow, runner));

    expect(result.ok).toBe(true);
    expect(taskFlow.resume).toHaveBeenCalledWith({
      flowId: "flow-1",
      expectedRevision: 4,
      status: "running",
      currentStep: "resume_shell",
    });
    expect(taskFlow.finish).toHaveBeenCalledWith({
      flowId: "flow-1",
      expectedRevision: 5,
    });
  });

  it("returns a mutation error when taskFlow resume is rejected", async () => {
    const taskFlow = createFakeTaskFlow({
      resume: vi.fn().mockReturnValue({
        applied: false,
        code: "revision_conflict",
      }),
    });
    const runner = createRunner({
      ok: true,
      status: "ok",
      output: [],
      requiresApproval: null,
    });

    const result = expectManagedFlowFailure(
      await resumeManagedShellFlow(createResumeFlowParams(taskFlow, runner)),
    );
    expect(result.error.message).toMatch(/revision_conflict/);
    expect(runner.run).not.toHaveBeenCalled();
  });

  it("returns to waiting when the resumed Shell run needs approval again", async () => {
    const taskFlow = createFakeTaskFlow();
    const runner = createRunner({
      ok: true,
      status: "needs_approval",
      output: [],
      requiresApproval: {
        type: "approval_request",
        prompt: "Approve this too?",
        items: [{ id: "item-2" }],
        resumeToken: "resume-2",
      },
    });

    const result = await resumeManagedShellFlow(createResumeFlowParams(taskFlow, runner));

    expect(result.ok).toBe(true);
    expect(taskFlow.setWaiting).toHaveBeenCalledWith({
      flowId: "flow-1",
      expectedRevision: 5,
      currentStep: "await_shell_approval",
      waitJson: {
        kind: "shell_approval",
        prompt: "Approve this too?",
        items: [{ id: "item-2" }],
        resumeToken: "resume-2",
      },
    });
  });
});
