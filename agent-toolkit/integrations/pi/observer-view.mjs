// Read-only display of documented native status/output artifacts. No worker control or execution.
import { writeFile, rename } from 'node:fs/promises';
import { readRegularText } from './artifact-io.mjs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';

export function renderObserver(role, status, output) {
  const clean = value => stripVTControlCharacters(String(value ?? '')).replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, '');
  return [
    `Agent observer: ${clean(role).slice(0, 80)} | ${clean(status.state ?? 'unavailable').slice(0, 40)}`,
    'Read-only view. q/Ctrl+C exits this viewer, never the worker. Use Pi /subagents-fleet for controls.',
    '', ...clean(output).split('\n').slice(-120),
  ].join('\n');
}
const tail = (path, maximum = 32000) => readRegularText(path, maximum, true);
async function main() {
  const args = process.argv.slice(2);
  const value = flag => args[args.indexOf(flag) + 1];
  const manifestPath = value('--manifest');
  const id = value('--task');
  const token = value('--token');
  const receipt = value('--receipt');
  if (!manifestPath || !id || !token || !receipt) throw new Error('Missing observer launch identity');
  const manifest = JSON.parse(await readRegularText(manifestPath));
  if (!Object.hasOwn(manifest.tasks, id) || manifest.views[id]?.token !== token) throw new Error('Observer task binding is invalid');
  const task = manifest.tasks[id];
  const initial = JSON.parse(await tail(join(task.asyncDir, 'status.json'), 256000));
  if (initial.runId !== id || ![manifest.sessionId, manifest.sessionFile].filter(Boolean).includes(initial.sessionId)) throw new Error('Observer task owner mismatch');
  const temporary = `${receipt}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify({ version: 1, token, pid: process.pid }), { mode: 0o600 });
  await rename(temporary, receipt);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true); process.stdin.resume();
    process.stdin.on('data', data => { if (data.includes(3) || data.includes(113)) process.exit(0); });
  }
  let last;
  const draw = async () => {
    let status = { state: 'unavailable' };
    let output = 'Artifacts are unavailable or expired. Inspect the task in Pi; this is not completion evidence.';
    try {
      const current = JSON.parse(await tail(join(task.asyncDir, 'status.json'), 256000));
      if (current.runId !== id || ![manifest.sessionId, manifest.sessionFile].filter(Boolean).includes(current.sessionId)) throw new Error('Owner changed');
      status = current;
      try { output = await tail(join(task.asyncDir, 'output-0.log')); } catch { output = 'Waiting for job output…'; }
    } catch {}
    const text = renderObserver(task.role, status, output);
    if (text !== last) { process.stdout.write(`\x1b[2J\x1b[H${text}\n`); last = text; }
  };
  await draw();
  let drawing = false;
  setInterval(async () => {
    if (drawing) return;
    drawing = true;
    try { await draw(); } finally { drawing = false; }
  }, 1000);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('Observer could not verify its task or artifacts. Worker state is unchanged.'); process.exitCode = 1; });
}
