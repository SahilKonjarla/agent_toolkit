import { readRegularText } from "./artifact-io.mjs";
import { fileURLToPath } from "node:url";
import type { ObserverHost } from "./herdr-observers";

type Exec = (command: string, args: string[], options?: any) => Promise<{ code: number; stdout: string; stderr: string }>;
const quote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;
export function createHerdrHost(exec: Exec, parentPane: string, cwd: string): ObserverHost {
  async function run(args: string[], admissionOnly = false) {
    const response = await exec("herdr", args, { timeout: 15000 });
    let data: any;
    try { data = JSON.parse(response.code === 0 ? response.stdout : response.stderr); }
    catch {
      // pane.run may acknowledge with plain text/empty stdout. Exit zero is admission only;
      // the viewer handshake below is still required to prove that our process started.
      if (response.code === 0 && admissionOnly) return { admitted: true };
      throw new Error("Herdr returned no valid response; observer outcome may be unknown.");
    }
    if (response.code !== 0) {
      const code = String(data.error?.code ?? "UNKNOWN").toUpperCase();
      if (["NOT_FOUND", "PANE_GONE", "PANE_NOT_FOUND"].includes(code)) return undefined;
      throw new Error(`Herdr observer request failed (${code}); no blind retry.`);
    }
    return data.result;
  }
  async function inspect(id: string) {
    const result = await run(["pane", "get", id]);
    if (!result) return { exists: false };
    const pane = result.pane ?? result;
    if (pane.pane_id !== id || !pane.terminal_id) throw new Error("Herdr pane identity could not be verified.");
    const info = (await run(["pane", "process-info", "--pane", id]))?.process_info;
    if (!info || info.pane_id !== id) throw new Error("Herdr pane process identity is unavailable.");
    const processes = info.foreground_processes ?? [];
    const argv = processes.length === 1 ? processes[0].argv : undefined;
    const viewerPath = fileURLToPath(new URL("./observer-view.mjs", import.meta.url));
    const viewer = Array.isArray(argv) && argv.length === 10 && argv[1] === viewerPath && argv[2] === "--manifest" && argv[4] === "--task" && argv[6] === "--token" && argv[8] === "--receipt"
      ? { manifest: argv[3], task: argv[5], token: argv[7], receipt: argv[9] } : undefined;
    return { exists: true, paneId: id, terminalId: pane.terminal_id, foregroundPids: processes.map((process: any) => process.pid), shellPid: info.shell_pid, viewer };
  }
  async function stamp(pid: number) {
    if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error("Invalid viewer process identity.");
    const result = await exec("ps", ["-p", String(pid), "-o", "lstart="], { timeout: 5000 });
    const value = result.stdout.trim();
    if (result.code !== 0 || !value) throw new Error("Viewer process start identity is unavailable.");
    return value;
  }
  async function identify(pane: any, spec: any) {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      try {
        const receipt = JSON.parse(await readRegularText(spec.receipt, 4096));
        if (receipt.version !== 1 || receipt.token !== spec.token || !Number.isSafeInteger(receipt.pid)) throw new Error("Invalid viewer receipt");
        const current = await inspect(pane.paneId);
        if (current.terminalId === pane.terminalId && current.foregroundPids?.length === 1 && current.foregroundPids[0] === receipt.pid && current.viewer?.token === spec.token && current.viewer.task === spec.id && current.viewer.manifest === spec.manifest && current.viewer.receipt === spec.receipt) return { pid: receipt.pid, stamp: await stamp(receipt.pid) };
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Observer startup was not verified; reserved view retained for reconciliation.");
  }
  return {
    async split() {
      const result = await run(["pane", "split", "--pane", parentPane, "--direction", "down", "--cwd", cwd, "--no-focus"]);
      const pane = result?.pane;
      return { exists: true, paneId: pane?.pane_id, terminalId: pane?.terminal_id };
    },
    inspect, stamp, identify,
    async launch(pane, spec) {
      const viewer = fileURLToPath(new URL("./observer-view.mjs", import.meta.url));
      const command = [process.execPath, viewer, "--manifest", spec.manifest, "--task", spec.id, "--token", spec.token, "--receipt", spec.receipt].map(quote).join(" ");
      const accepted = await run(["pane", "run", pane.paneId!, command], true);
      if (!accepted) throw new Error("Observer command admission is unknown; reserved view retained.");
      // pane.run acknowledges admission, not execution. Require our viewer handshake and exact foreground PID.
      return identify(pane, spec);
    },
    async close(id) {
      await run(["pane", "close", id]);
      // The close acknowledgement is not evidence that a view disappeared.
      if (await run(["pane", "get", id])) throw new Error("Observer close not confirmed; retain the reservation.");
    },
  };
}
