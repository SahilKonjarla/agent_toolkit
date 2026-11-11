// Only public RPC DTO fields enter the footer. Never expose tasks or transcript text.
export interface AgentSummary {
  available: boolean;
  active: number;
  attention: number;
  entries: { role: string; startedAt?: number }[];
}

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

export function projectStatus(value: unknown): AgentSummary {
  const data = record(value);
  const fleet = record(data.fleet);
  if (fleet.version !== 1 || !Number.isSafeInteger(fleet.totalActive) || fleet.totalActive < 0 || !Array.isArray(fleet.entries)) {
    return { available: false, active: 0, attention: 0, entries: [] };
  }
  const coordinators = fleet.entries.filter((value: unknown) => record(value).agent === "workflow").length;
  const entries = fleet.entries.filter((value: unknown) => record(value).agent !== "workflow").slice(0, 2).map((value: unknown) => {
    const item = record(value);
    // Canonical profile names, not free-form task/goal labels.
    const agent = typeof item.agent === "string" ? item.agent : "agent";
    const role = agent.replace(/^toolkit-/, "").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 22) || "agent";
    return { role, ...(Number.isSafeInteger(item.startedAt) && item.startedAt >= 0 ? { startedAt: item.startedAt } : {}) };
  });
  const snapshot = record(data.asyncSnapshot);
  const runs = snapshot.version === 1 && snapshot.kind === "pi-subagents.async-status-snapshot" && Array.isArray(snapshot.runs) ? snapshot.runs : [];
  const attention = runs.filter((run: unknown) => {
    const item = record(run);
    return item.state === "paused" || record(item.activity).state === "needs_attention";
  }).length;
  return { available: true, active: Math.max(0, fleet.totalActive - coordinators), attention, entries };
}

interface Events {
  on(name: string, handler: (value: any) => void): () => void;
  emit(name: string, value: unknown): void;
}

// A bounded, disposable request; late replies cannot revive a replaced session.
export function requestRpc(events: Events, method: string, params: unknown = {}, timeoutMs = 5000): { promise: Promise<any>; cancel(): void; readonly error: string | undefined; readonly responded: boolean } {
  const requestId = crypto.randomUUID();
  let finish: (value: any) => void;
  const promise = new Promise(resolve => { finish = resolve; });
  let settled = false;
  let error: string | undefined;
  let responded = false;
  let timer: ReturnType<typeof setTimeout>;
  const unsubscribe = events.on(`subagents:rpc:v1:reply:${requestId}`, reply => {
    if (reply?.version === 1 && reply.requestId === requestId) {
      responded = true;
      if (!reply.success) error = typeof reply.error?.message === "string" ? reply.error.message : "Runner rejected the request.";
      settle(reply.success ? reply.data : undefined);
    }
  });
  function settle(value: any) {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    unsubscribe();
    finish(value);
  }
  timer = setTimeout(() => { error = "RPC timed out; inspect fleet status before retrying because dispatch may have occurred."; settle(undefined); }, timeoutMs);
  try { events.emit("subagents:rpc:v1:request", { version: 1, requestId, method, params }); }
  catch { error = "Runner RPC dispatch failed."; settle(undefined); }
  return { promise, cancel: () => settle(undefined), get error() { return error; }, get responded() { return responded; } };
}
