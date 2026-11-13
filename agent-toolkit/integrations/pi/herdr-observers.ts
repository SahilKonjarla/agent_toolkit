import { mkdir, writeFile, rename, rm, realpath, lstat } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { readRegularText } from "./artifact-io.mjs";

export interface TaskBinding { id: string; asyncDir: string; role: string }
interface Pane { exists: boolean; paneId?: string; terminalId?: string; foregroundPids?: number[]; shellPid?: number; viewer?: { token: string; task: string; manifest: string; receipt: string } }
interface View { id: string; token: string; paneId?: string; terminalId?: string; pid?: number; stamp?: string; state: "opening" | "open" | "closing" }
interface Manifest { version: 1; sessionId: string; sessionFile?: string; endpoint: string; tasks: Record<string, TaskBinding>; views: Record<string, View> }
export interface ObserverHost {
  split(): Promise<Pane>;
  inspect(paneId: string): Promise<Pane>;
  launch(pane: Pane, spec: { manifest: string; id: string; token: string; receipt: string }): Promise<{ pid: number; stamp: string }>;
  identify(pane: Pane, spec: { manifest: string; id: string; token: string; receipt: string }): Promise<{ pid: number; stamp: string }>;
  stamp(pid: number): Promise<string>;
  close(paneId: string): Promise<void>;
}
interface Options { directory: string; sessionId: string; sessionFile?: string; endpoint: string; parentPane: string; cwd: string; host: ObserverHost }

export function createObserverManager(options: Options) {
  const file = join(options.directory, "manifest.json");
  let queue = Promise.resolve();
  const idPattern = /^[A-Za-z0-9-]{1,128}$/;
  const panePattern = /^[A-Za-z0-9:._-]{1,128}$/;
  const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const text = (value: unknown, limit: number) => typeof value === "string" && value.length > 0 && value.length <= limit && !/[\x00-\x1f\x7f]/.test(value);
  function validEntries(data: any) {
    if (Object.keys(data.tasks).length > 100 || Object.keys(data.views).length > 2) return false;
    for (const [id, task] of Object.entries<any>(data.tasks)) {
      if (!idPattern.test(id) || !task || task.id !== id || !text(task.asyncDir, 4096) || !isAbsolute(task.asyncDir) || !text(task.role, 80)) return false;
    }
    for (const [id, view] of Object.entries<any>(data.views)) {
      if (!Object.hasOwn(data.tasks, id) || !view || view.id !== id || !tokenPattern.test(view.token) || !["opening", "open", "closing"].includes(view.state)) return false;
      if (view.paneId !== undefined && (!panePattern.test(view.paneId) || view.paneId === options.parentPane)) return false;
      if (view.terminalId !== undefined && !text(view.terminalId, 256)) return false;
      if (view.pid !== undefined && (!Number.isSafeInteger(view.pid) || view.pid <= 0)) return false;
      if (view.stamp !== undefined && !text(view.stamp, 200)) return false;
      if (view.state !== "opening" && (!view.paneId || !view.terminalId || !view.pid || !view.stamp)) return false;
    }
    return true;
  }
  async function load(): Promise<Manifest> {
    try {
      const data = JSON.parse(await readRegularText(file));
      if (data.version !== 1 || data.sessionId !== options.sessionId || data.endpoint !== options.endpoint || !data.tasks || typeof data.tasks !== "object" || Array.isArray(data.tasks) || !data.views || typeof data.views !== "object" || Array.isArray(data.views) || data.sessionFile !== options.sessionFile || !validEntries(data)) throw new Error("Observer manifest identity is invalid; reconcile before opening anything.");
      return data;
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
      return { version: 1, sessionId: options.sessionId, sessionFile: options.sessionFile, endpoint: options.endpoint, tasks: {}, views: {} };
    }
  }
  async function save(state: Manifest) {
    const temporary = `${file}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(state, null, 2) + "\n", { mode: 0o600 });
    await rename(temporary, file);
  }
  function transaction<T>(fn: (state: Manifest) => Promise<T>): Promise<T> {
    const work = queue.then(async () => {
      await mkdir(options.directory, { recursive: true, mode: 0o700 });
      if ((await lstat(options.directory)).isSymbolicLink()) throw new Error("Observer state directory must not be a symlink.");
      const lock = join(options.directory, "operation.lock");
      try { await mkdir(lock); } catch { throw new Error("Another observer operation is active or unreconciled; no new pane was opened."); }
      try { return await fn(await load()); }
      finally { await rm(lock, { recursive: true }); }
    });
    queue = work.then(() => undefined, () => undefined);
    return work;
  }
  const viewerSpec = (view: View) => ({ manifest: file, id: view.id, token: view.token, receipt: join(options.directory, `viewer-${view.token}.json`) });
  async function verify(view: View) {
    if (!view.paneId) throw new Error("Observer launch outcome is unknown. Keep the reserved slot and reconcile; do not retry blindly.");
    const pane = await options.host.inspect(view.paneId);
    if (!pane.exists) return false;
    const receiptPath = viewerSpec(view).receipt;
    const receipt = JSON.parse(await readRegularText(receiptPath, 4096));
    const viewer = pane.viewer;
    if (receipt.version !== 1 || receipt.token !== view.token || receipt.pid !== view.pid || viewer?.token !== view.token || viewer.task !== view.id || viewer.manifest !== file || viewer.receipt !== receiptPath) throw new Error("Observer token/process receipt is invalid; close authority denied.");
    if (!["open", "closing"].includes(view.state) || !view.pid || !view.stamp || pane.terminalId !== view.terminalId || pane.foregroundPids?.length !== 1 || pane.foregroundPids[0] !== view.pid || await options.host.stamp(view.pid) !== view.stamp) {
      throw new Error("Observer occupant changed or cannot be verified. Refusing to reuse or close this pane.");
    }
    return true;
  }
  return {
    async track(task: TaskBinding) {
      if (!/^[A-Za-z0-9-]{1,128}$/.test(task.id)) throw new Error("Invalid task identity.");
      const asyncDir = await realpath(task.asyncDir);
      const status = JSON.parse(await readRegularText(join(asyncDir, "status.json")));
      if (status.runId !== task.id || ![options.sessionId, options.sessionFile].filter(Boolean).includes(status.sessionId)) throw new Error("Task belongs to another session; observer access denied.");
      await transaction(async state => {
        state.tasks[task.id] = { ...task, asyncDir, role: task.role.replace(/[\x00-\x1f\x7f]/g, " ").slice(0, 80) };
        for (const id of Object.keys(state.tasks)) {
          if (Object.keys(state.tasks).length <= 100) break;
          if (!state.views[id]) delete state.tasks[id];
        }
        await save(state);
      });
    },
    open(id: string) {
      return transaction(async state => {
        if (!Object.hasOwn(state.tasks, id)) throw new Error("Unknown or foreign task. Only jobs dispatched by this toolkit session can be observed.");
        const existing = Object.hasOwn(state.views, id) ? state.views[id] : undefined;
        if (existing?.state === "opening" && existing.paneId) {
          // Recover from a lost admission reply using the existing handshake only: no second pane.run.
          const ready = await options.host.identify({ exists: true, paneId: existing.paneId, terminalId: existing.terminalId }, viewerSpec(existing));
          existing.pid = ready.pid; existing.stamp = ready.stamp; existing.state = "open";
          await save(state);
        }
        if (existing && await verify(existing)) return { paneId: existing.paneId, reused: true };
        if (existing) delete state.views[id];
        // Confirm externally closed panes before reclaiming capacity; unknown occupants stay reserved.
        for (const [key, view] of Object.entries(state.views)) {
          if (view.paneId && !(await options.host.inspect(view.paneId)).exists) delete state.views[key];
        }
        if (Object.keys(state.views).length >= 2) throw new Error("Two observer panes are already reserved. Close an owned observer before opening another.");
        const view: View = { id, token: crypto.randomUUID(), state: "opening" };
        state.views[id] = view;
        await save(state); // Reserve before mutation. Errors below retain the slot and known pane ID.
        const pane = await options.host.split();
        if (!pane.paneId || !pane.terminalId) throw new Error("Herdr split returned no stable pane/terminal identity; observer outcome is unknown.");
        view.paneId = pane.paneId; view.terminalId = pane.terminalId;
        await save(state);
        const ready = await options.host.launch(pane, viewerSpec(view));
        view.pid = ready.pid; view.stamp = ready.stamp; view.state = "open";
        await save(state);
        return { paneId: view.paneId, reused: false };
      });
    },
    status() {
      return transaction(async state => ({ limit: 2, views: await Promise.all(Object.values(state.views).map(async view => {
        try { return { id: view.id, paneId: view.paneId, state: await verify(view) ? "open" : "closed" }; }
        catch { return { id: view.id, paneId: view.paneId, state: "unverified" }; }
      })) }));
    },
    close(id: string) {
      return transaction(async state => {
        const view = Object.hasOwn(state.views, id) ? state.views[id] : undefined;
        if (!view) return { closed: false, workerStopped: false };
        if (await verify(view)) {
          view.state = "closing";
          await save(state);
          await options.host.close(view.paneId!);
        }
        delete state.views[id];
        await save(state);
        await rm(join(options.directory, `viewer-${view.token}.json`), { force: true });
        return { closed: true, workerStopped: false };
      });
    },
  };
}
