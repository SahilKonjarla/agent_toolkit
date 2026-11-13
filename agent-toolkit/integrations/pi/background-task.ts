import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { DEFAULT_TIMEOUT_MS } from "./launch-policy";
import { requestRpc } from "./runtime-status";

export type TaskKind = "analysis" | "tests" | "implementation";
export const TASK_TOOLS: Record<TaskKind, string[]> = {
  analysis: ["read", "grep", "find", "ls", "contact_supervisor"],
  tests: ["read", "grep", "find", "ls", "bash", "contact_supervisor"],
  implementation: ["read", "grep", "find", "ls", "bash", "edit", "write", "contact_supervisor"],
};

export function taskDefinition(role: string, kind: TaskKind) {
  return {
    description: `${role}: bounded ${kind} task`,
    tools: TASK_TOOLS[kind],
    systemPrompt: [
      `You are an independent background worker assigned the role ${JSON.stringify(role)} for a ${kind} task.`,
      "The task brief defines your exact goal, scope, pinned source, approved commands/paths, acceptance criteria and output. Read applicable AGENTS.md and relevant project configuration/context when present; follow project instructions and toolkit approval/secrets/Git rules.",
      "Only the lead delegates. Do not launch nested agents. Do not stage, commit, push, deploy, install dependencies, read secrets/.env, or expand scope without explicit approval in the brief.",
      kind === "analysis" ? "Inspect and report only. No shell, tests, or edits." : kind === "tests" ? "Run only the approved finite test/check commands. Do not edit source or remediate failures; report them. Test-generated files are not permission to change application behavior." : "Implement only the approved slice in your isolated worktree. Do not integrate into the lead checkout. Report changed paths and verification; the lead reviews and integrates the patch.",
      "Ask the supervisor for an unapproved decision instead of guessing. Return the result, exact commands/outcomes, limitations and next action. A failed test is a failed test, even when the worker itself completed normally.",
    ].join("\n"),
  };
}

// This tool only adapts task briefs to the runner's public APIs. The runner owns
// atomic five-slot admission, processes, deadlines, results and cancellation.
export function registerBackgroundTask(pi: ExtensionAPI, ready: () => boolean, onDispatch?: (task: { id: string; asyncDir: string; role: string }) => Promise<void>) {
  const registrations = new Set<{ dispose(): void }>();
  const byRun = new Map<string, { dispose(): void }>();
  const stopComplete = pi.events.on("subagent:async-complete", (event: any) => {
    const id = event?.id ?? event?.runId;
    const registration = byRun.get(id);
    if (registration) { registration.dispose(); registrations.delete(registration); byRun.delete(id); }
  });
  pi.registerTool({
    name: "background_task",
    label: "Background task",
    description: "Start one task-defined background worker and return its job ID immediately. At most five workers per lead session; choose roles as needed. Use for independent analysis, approved tests, or approved isolated implementation. Do not wait here for results; continue other work and collect from subagent status/fleet at the dependent decision.",
    parameters: Type.Object({
      role: Type.String({ minLength: 1, maxLength: 80, description: "Task-specific role, e.g. auth-tests or API-compatibility; no fixed roster." }),
      kind: Type.Union([Type.Literal("analysis"), Type.Literal("tests"), Type.Literal("implementation")]),
      task: Type.String({ minLength: 1, maxLength: 30000, description: "Goal, bounded scope, approved commands/paths, pinned source and expected output." }),
      cwd: Type.Optional(Type.String({ minLength: 1 })),
      timeoutMs: Type.Optional(Type.Integer({ minimum: 1000, maximum: 3600000 })),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      if (!ready()) throw new Error("Toolkit runtime is not ready; reload before dispatching.");
      const role = params.role.replace(/[\x00-\x1f\x7f]/g, " ").trim();
      if (!role || !params.task.trim()) throw new Error("Background role and task must contain non-whitespace text.");
      const slug = role.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "task";
      const name = `${slug}-${crypto.randomUUID().slice(0, 8)}`;
      const request: any = { version: 1, name, definition: taskDefinition(role, params.kind) };
      pi.events.emit("pi-subagents:runtime-agent-register:v1", request);
      if (!request.result?.ok) throw request.result?.error ?? new Error("Runner runtime-agent API unavailable.");
      const registration = request.result.registration;
      registrations.add(registration);
      const launch = requestRpc(pi.events, "spawn", {
        agent: name, task: params.task, cwd: params.cwd ?? ctx.cwd, async: true,
        timeoutMs: params.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        ...(params.kind === "implementation" ? { worktree: true } : {}),
        mission: false,
      }, 30000);
      const data = await launch.promise;
      // A lost reply does not prove that dispatch never occurred. Keep the role
      // until shutdown; never silently launch a replacement.
      if (!data) {
        if (launch.responded) { registration.dispose(); registrations.delete(registration); }
        throw new Error(launch.error ?? "Dispatch reply unavailable; inspect fleet status before retrying.");
      }
      const runId = data.details?.runId ?? data.details?.asyncId ?? data.details?.id;
      if (runId) byRun.set(runId, registration);
      if (runId && typeof data.details?.asyncDir === "string" && onDispatch) {
        // Inspector bookkeeping is not execution success and must never invite a duplicate dispatch.
        try { await onDispatch({ id: runId, asyncDir: data.details.asyncDir, role }); } catch {}
      }
      return { content: [{ type: "text", text: data.text || `Background task dispatched: ${runId ?? name}` }], details: data.details ?? {} };
    },
  });
  return () => {
    stopComplete();
    registrations.forEach(registration => registration.dispose());
    registrations.clear(); byRun.clear();
  };
}
