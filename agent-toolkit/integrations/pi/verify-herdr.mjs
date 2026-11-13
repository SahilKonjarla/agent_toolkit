// Opt-in: one no-focus observer pane, one finite fixture test worker, then owner-checked view cleanup.
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
if (!process.argv.includes('--live') || process.env.HERDR_ENV !== '1') throw new Error('Run --live from inside Herdr to authorize one owned observer and a finite fixture worker.');
const install = join(homedir(), '.pi/agent/install');
const modules = process.env.PI_NODE_MODULES ?? join(install, 'releases', readFileSync(join(install, 'current-version'), 'utf8').trim(), 'node_modules');
process.env.PI_SUBAGENTS_PI_CODING_AGENT_PACKAGE_ROOT ??= join(modules, '@earendil-works/pi-coding-agent');
const sdk = await import(pathToFileURL(join(modules, '@earendil-works/pi-coding-agent/dist/index.js')).href);
const cwd = await mkdtemp(join(tmpdir(), 'toolkit-herdr-smoke-'));
let events;
const loader = new sdk.DefaultResourceLoader({ cwd, agentDir: sdk.getAgentDir(), noExtensions: true, noSkills: true, noPromptTemplates: true,
  additionalExtensionPaths: [join(sdk.getAgentDir(), 'npm/node_modules/pi-subagents'), new URL('./index.ts', import.meta.url).pathname],
  extensionFactories: [pi => {
    events = pi.events;
    pi.on('before_agent_start', event => { event.systemPromptOptions.sections.smoke = 'Acknowledge fixture notices briefly. Do not call tools or launch work.'; });
  }],
});
// This disposable SDK parent must not overwrite the real parent pane's native metadata.
process.env.HERDR_ENV = '0';
try { await loader.reload(); } finally { process.env.HERDR_ENV = '1'; }
const modelRuntime = await sdk.ModelRuntime.create();
const model = modelRuntime.getModel(process.env.PI_PROVIDER, process.env.PI_MODEL);
assert.ok(model, 'approved parent model missing');
const { session } = await sdk.createAgentSession({ cwd, modelRuntime, model, resourceLoader: loader, thinkingLevel: 'low', sessionManager: sdk.SessionManager.create(cwd, join(cwd, 'sessions')) });
const errors = [];
const report = { fixture: cwd, checks: [] };
let task;
let observer;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function execute(name, input) {
  return session.extensionRunner.getToolDefinition(name).execute(crypto.randomUUID(), input, undefined, undefined, session.extensionRunner.createToolContext('smoke', undefined));
}
async function rpc(method, params) {
  const requestId = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { off(); reject(new Error('RPC timeout')); }, 15000);
    const off = events.on(`subagents:rpc:v1:reply:${requestId}`, reply => { clearTimeout(timer); off(); reply.success ? resolve(reply.data) : reject(new Error(reply.error?.message ?? 'RPC failed')); });
    events.emit('subagents:rpc:v1:request', { version: 1, requestId, method, params });
  });
}
try {
  await session.bindExtensions({ onError: error => errors.push(String(error.error)) });
  assert.deepEqual(errors, []);
  const launched = await execute('background_task', { role: 'observer-fixture-test', kind: 'tests', timeoutMs: 90000,
    task: 'Approved finite fixture command, run exactly once: `python3 -c "import time; time.sleep(20); print(\'OBSERVER_WORKER_OK\')"`. No source edits, installs, Git mutations or other shell commands. Return exit status and output.' });
  task = { id: launched.details.runId ?? launched.details.asyncId ?? launched.details.id, dir: launched.details.asyncDir };
  const opened = await execute('agent_inspector', { action: 'open', id: task.id });
  observer = opened.details.paneId;
  assert.ok(observer && observer !== process.env.HERDR_PANE_ID);
  const reused = await execute('agent_inspector', { action: 'open', id: task.id });
  assert.equal(reused.details.paneId, observer);
  assert.equal(reused.details.reused, true);
  report.checks.push({ check: 'one-owned-no-focus-view-reused', paneId: observer, taskId: task.id });
  await session.reload();
  const restored = await execute('agent_inspector', { action: 'status' });
  assert.ok(restored.details.views.some(view => view.id === task.id && view.state === 'open'));
  report.checks.push({ check: 'reload-restores-view-ownership', ok: true });
  const beforeClose = JSON.parse(await readFile(join(task.dir, 'status.json'), 'utf8'));
  assert.equal(beforeClose.state, 'running');
  const closed = await execute('agent_inspector', { action: 'close', id: task.id });
  assert.equal(closed.details.workerStopped, false);
  const afterClose = JSON.parse(await readFile(join(task.dir, 'status.json'), 'utf8'));
  assert.equal(afterClose.state, 'running');
  observer = undefined;
  report.checks.push({ check: 'closing-view-leaves-worker-running', ok: true });
  const deadline = Date.now() + 100000;
  let terminal;
  while (Date.now() < deadline) {
    terminal = JSON.parse(await readFile(join(task.dir, 'status.json'), 'utf8'));
    if (['complete', 'failed', 'stopped'].includes(terminal.state)) break;
    await sleep(250);
  }
  assert.equal(terminal.state, 'complete');
  assert.match(await readFile(join(task.dir, 'output-0.log'), 'utf8'), /OBSERVER_WORKER_OK/);
  report.checks.push({ check: 'worker-completes-after-view-close', ok: true });
  assert.deepEqual(errors, []);
} finally {
  if (observer && task) { try { await execute('agent_inspector', { action: 'close', id: task.id }); } catch { report.checks.push({ check: 'view-needs-manual-reconciliation', paneId: observer }); } }
  if (task) { try { const status = JSON.parse(await readFile(join(task.dir, 'status.json'), 'utf8')); if (['queued', 'running'].includes(status.state)) await rpc('stop', { id: task.id }); } catch {} }
  await sleep(1500); await session.waitForIdle();
  await session.extensionRunner.emit({ type: 'session_shutdown', reason: 'quit' });
  session.dispose();
  await writeFile(join(cwd, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
