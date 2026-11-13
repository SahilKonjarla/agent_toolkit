import { join } from "node:path";
import { Type } from "typebox";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createObserverManager, type TaskBinding } from "./herdr-observers";
import { createHerdrHost } from "./herdr-host";

export function shouldNotifyFailure(event: any): boolean {
  if (["stopped", "paused"].includes(event?.state ?? event?.status)) return false;
  return event?.state === "failed" || event?.status === "failed" || Boolean(event?.results?.some((result: any) => result.status === "failed"));
}

export function registerHerdrPresentation(pi: ExtensionAPI, agentDirectory: string) {
  let manager: ReturnType<typeof createObserverManager> | undefined;
  let currentContext: any;
  let enabled = false;
  const notices = new Map<string, number>();
  const seenFailures = new Set<string>();
  const notify = (key: string, title: string, sound: "done" | "request") => {
    if (!enabled || Date.now() - (notices.get(key) ?? 0) < 30000) return;
    notices.set(key, Date.now());
    void pi.exec("herdr", ["notification", "show", title, "--body", "Inspect the owning Pi chat or /subagents-fleet.", "--sound", sound], { timeout: 5000 }).catch(() => {});
  };
  const stopFailures = pi.events.on("subagent:async-complete", (event: any) => {
    const id = event?.id ?? event?.runId;
    if (!id || seenFailures.has(id) || !shouldNotifyFailure(event)) return;
    if (seenFailures.size >= 100) seenFailures.delete(seenFailures.values().next().value!);
    seenFailures.add(id);
    notify("failure", "Background agent failed", "request");
  });
  pi.on("ui_prompt_start", () => notify("human-input", "Pi needs your input", "request"));
  pi.on("session_start", (_event, ctx) => {
    currentContext = ctx;
    enabled = ctx.mode === "tui" && process.env.HERDR_ENV === "1" && Boolean(process.env.HERDR_PANE_ID && process.env.HERDR_SOCKET_PATH);
    // Explicit tool use in an SDK smoke may be headless but must still originate inside Herdr.
    if (process.env.HERDR_ENV !== "1" || !process.env.HERDR_PANE_ID || !process.env.HERDR_SOCKET_PATH) return;
    const sessionId = ctx.sessionManager.getSessionId();
    if (!/^[A-Za-z0-9-]{1,100}$/.test(sessionId)) return;
    manager = createObserverManager({
      directory: join(agentDirectory, "toolkit-observers", sessionId), sessionId,
      sessionFile: ctx.sessionManager.getSessionFile(), endpoint: process.env.HERDR_SOCKET_PATH,
      parentPane: process.env.HERDR_PANE_ID, cwd: ctx.cwd,
      host: createHerdrHost((command, args, options) => pi.exec(command, args, options), process.env.HERDR_PANE_ID, ctx.cwd),
    });
  });
  pi.registerTool({
    name: "agent_inspector", label: "Agent inspector", executionMode: "sequential",
    description: "Open/reuse, inspect, or close a read-only Herdr viewer for a task dispatched by this Pi session. At most two toolkit-created views; opening never starts a worker or steals focus. Closing only closes a verified owned viewer, never the task. No new chats/workspaces.",
    parameters: Type.Object({ action: Type.Union([Type.Literal("open"), Type.Literal("status"), Type.Literal("close")]), id: Type.Optional(Type.String({ minLength: 1, maxLength: 128 })) }),
    async execute(_id, params) {
      if (!manager) throw new Error("Agent inspectors require this Pi chat to run inside Herdr with a verified caller pane.");
      if (params.action !== "status" && !params.id) throw new Error("An exact owned task ID is required.");
      const data = params.action === "open" ? await manager.open(params.id!) : params.action === "close" ? await manager.close(params.id!) : await manager.status();
      return { content: [{ type: "text", text: JSON.stringify(data) + (params.action === "close" ? "\nViewer only; worker state is unchanged." : "") }], details: data };
    },
  });
  pi.on("session_shutdown", () => {
    enabled = false; manager = undefined; currentContext = undefined;
    stopFailures(); notices.clear(); seenFailures.clear();
    // Views deliberately survive reload. Their private manifest and process identity govern reuse/close.
  });
  return {
    async track(task: TaskBinding) {
      if (!manager) return;
      try { await manager.track(task); }
      catch { currentContext?.ui.notify("Task started, but its Herdr inspector binding could not be recorded. Do not redispatch; use /subagents-fleet.", "warning"); }
    },
  };
}
