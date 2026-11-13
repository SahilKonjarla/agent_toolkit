import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { getAgentDir, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { projectStatus, requestRpc } from "./runtime-status";
import { applyLaunchPolicy } from "./launch-policy";
import { registerBackgroundTask, TASK_TOOLS } from "./background-task";
import { registerHerdrPresentation } from "./herdr-presentation";

const STATUS_EVENT = "toolkit:agents-status:v1";
const READY_EVENT = "subagents:rpc:v1:ready";

export default function (pi: ExtensionAPI) {
  let restriction: { dispose(): void } | undefined;
  let generation = 0;
  let active = false;
  let dirty = false;
  let refreshing = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending = new Set<ReturnType<typeof requestRpc>>();
  let connecting = false;
  let reconnect = false;
  let eventDisposers: (() => void)[] = [];
  const rpc = async (method: string) => {
    const request = requestRpc(pi.events, method);
    pending.add(request);
    try { return await request.promise; }
    finally { pending.delete(request); }
  };

  const publish = (data: unknown) => pi.events.emit(STATUS_EVENT, { version: 1, ...projectStatus(data) });
  const refresh = async () => {
    if (!active || refreshing) { dirty = true; return; }
    const ownGeneration = generation;
    refreshing = true;
    dirty = false;
    const data = await rpc("status");
    if (ownGeneration !== generation) return;
    refreshing = false;
    publish(data);
    if (dirty) schedule();
  };
  const schedule = () => {
    if (!active) return;
    dirty = true;
    if (!timer) timer = setTimeout(() => { timer = undefined; void refresh(); }, 250);
  };
  const connect = async () => {
    if (!active) return;
    if (connecting) { reconnect = true; return; }
    const ownGeneration = generation;
    connecting = true;
    try {
      const data = await rpc("ping");
      if (!active || ownGeneration !== generation) return;
      eventDisposers.forEach(dispose => dispose());
      eventDisposers = [];
      if (data?.capabilities?.fleetStatus?.version !== 1) { publish(undefined); return; }
      // Subscribe before reading status; coalesce changes arriving during that read.
      for (const name of new Set<string>(["jobsChanged", "asyncStarted", "childStatus", "asyncComplete", "processTerminal"].map(key => data.events?.[key]).filter((name): name is string => typeof name === "string"))) {
        eventDisposers.push(pi.events.on(name, schedule));
      }
      schedule();
    } finally {
      if (ownGeneration === generation) {
        connecting = false;
        if (reconnect) { reconnect = false; void connect(); }
      }
    }
  };
  const readyDispose = pi.events.on(READY_EVENT, () => { void connect(); });
  const requestDispose = pi.events.on("toolkit:agents-status-request:v1", schedule);
  const herdrPresentation = registerHerdrPresentation(pi, getAgentDir());
  const disposeTasks = registerBackgroundTask(pi, () => active && Boolean(restriction), task => herdrPresentation.track(task));

  pi.on("session_start", async (_event, ctx) => {
    generation++;
    // Public export, resolved from Pi's managed npm install instead of private runner modules.
    const require = createRequire(join(getAgentDir(), "npm", "package.json"));
    const apiPath = require.resolve("pi-subagents/capability-ceiling");
    const { registerSubagentCapabilityCeiling } = await import(pathToFileURL(apiPath).href);
    restriction = registerSubagentCapabilityCeiling({
      sessionId: ctx.sessionManager.getSessionId(),
      source: "agent-toolkit/task-defined-workers",
      ceiling: { allowedTools: TASK_TOOLS.implementation, denyExtensions: true },
    });
    try {
      active = true;
      await connect();
    } catch (error) {
      restriction.dispose();
      restriction = undefined;
      throw error;
    }
  });

  pi.on("tool_call", event => {
    if ((event.toolName === "subagent" || event.toolName === "subagent_launch") && !restriction) {
      return { block: true, reason: "Toolkit capability ceiling is unavailable. Fix the runtime installation and reload before delegating." };
    }
    if (event.toolName === "subagent") {
      const reason = applyLaunchPolicy(event.input as Record<string, any>);
      if (reason) return { block: true, reason };
    }
  });
  pi.on("before_agent_start", (event) => {
    if (!active || !restriction) return;
    event.systemPromptOptions.sections.toolkit_delegation = [
      "Automatically use background_task for independent bounded work that lets the lead continue: analysis, approved test/check commands, or approved isolated implementation. Keep small tasks and coupled decisions in the lead.",
      "Choose the role and brief for each task as needed; there is no fixed specialist roster. kind:analysis has read/search tools, kind:tests adds bash, kind:implementation adds edits and a mandatory isolated worktree.",
      "At most FIVE active background workers per lead session, not five total launches. Each background_task starts exactly one child; do not use composite workflows, counted launches or nested delegation to multiply slots. If capacity is full, continue useful lead work or collect a result before starting another job.",
      "Only the lead delegates. Fresh context and the parent model are defaults. Each job has a deadline and returns an immediate receipt. Continue working until the next decision actually needs its result; never immediately wait just to make async look synchronous.",
      "Tests need approved finite commands and an agreed checkout/snapshot. Tests on the lead's live checkout can race ongoing edits: record that limitation, use snapshots/worktrees where appropriate, and leave remediation to a separately approved task. Implementation requires explicit write/worktree approval and a clean source checkout; never commit or stash automatically to create one.",
      "Each brief needs task, scope, repository/cwd, pinned SHA or dirty snapshot, relevant paths, approved commands/write scope, acceptance criteria, output and collection point. Load relevant toolkit roles/skills when useful, not as a fixed roster.",
      "Collect at the next dependent decision. Recheck the reviewed ref; stale results and failed/canceled workers are evidence gaps. Never infer completion or cancellation from dispatch alone.",
      "Use /subagents-fleet for native transcripts/controls. When the user needs visibility, use agent_inspector open/status/close with an exact task ID: at most two read-only Herdr views, reused per task, no focus stealing or new worker. Closing a viewer never stops the job. Do not use raw shell pane creation or native inspector.open to bypass these bounds.",
      "Do not automatically open independent Pi chats or new Herdr workspaces; they remain deferred pending shared cross-chat budgeting and explicit user request. Keep the current five-worker native execution model.",
      "Use an explicit same-role fresh task for an approved retry. Runtime tool ceilings do not sandbox filesystem reads: do not access secrets or .env; preserve project approvals.",
    ].join("\n");
  });
  pi.on("session_shutdown", () => {
    active = false;
    generation++;
    if (timer) clearTimeout(timer);
    timer = undefined;
    pending.forEach(request => request.cancel());
    pending.clear();
    connecting = false;
    reconnect = false;
    eventDisposers.forEach(dispose => dispose());
    eventDisposers = [];
    readyDispose();
    requestDispose();
    disposeTasks();
    restriction?.dispose();
    restriction = undefined;
    refreshing = false;
    publish(undefined);
  });
}
