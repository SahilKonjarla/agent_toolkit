// Opt-in native smoke. Uses existing model auth, finite test commands and a disposable Git repo.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
if (!process.argv.includes('--live')) throw new Error('Use --live to approve bounded model calls, fixture tests and isolated fixture edits.');
const install = join(homedir(), '.pi/agent/install');
const modules = process.env.PI_NODE_MODULES ?? join(install, 'releases', readFileSync(join(install, 'current-version'), 'utf8').trim(), 'node_modules');
process.env.PI_SUBAGENTS_PI_CODING_AGENT_PACKAGE_ROOT ??= join(modules, '@earendil-works/pi-coding-agent');
const sdk = await import(pathToFileURL(join(modules, '@earendil-works/pi-coding-agent/dist/index.js')).href);
const root = await mkdtemp(join(tmpdir(), 'toolkit-five-agent-smoke-'));
const cwd = join(root, 'repo');
await mkdir(cwd);
await writeFile(join(cwd, 'fixture.txt'), 'TOOLKIT_SMOKE_OK\n');
await writeFile(join(cwd, 'test_fixture.py'), 'import time, unittest\nfrom pathlib import Path\nclass FixtureTest(unittest.TestCase):\n    def test_marker(self):\n        time.sleep(8)\n        self.assertEqual(Path("fixture.txt").read_text().strip(), "TOOLKIT_SMOKE_OK")\n');
const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
git('init', '-q'); git('add', 'fixture.txt', 'test_fixture.py');
git('-c', 'user.name=Toolkit Smoke', '-c', 'user.email=smoke@example.invalid', 'commit', '-qm', 'fixture');
const modelRuntime = await sdk.ModelRuntime.create();
const model = modelRuntime.getModel(process.env.PI_PROVIDER, process.env.PI_MODEL);
if (!model) throw new Error('Set PI_PROVIDER and PI_MODEL to the approved parent model.');
let events;
const summaries = [];
const errors = [];
const loader = new sdk.DefaultResourceLoader({ cwd, agentDir: sdk.getAgentDir(), noExtensions: true, noSkills: true, noPromptTemplates: true,
  additionalExtensionPaths: [join(sdk.getAgentDir(), 'npm/node_modules/pi-subagents'), new URL('./index.ts', import.meta.url).pathname],
  extensionFactories: [pi => {
    events = pi.events;
    pi.events.on('toolkit:agents-status:v1', summary => summaries.push(summary));
    pi.on('before_agent_start', event => { event.systemPromptOptions.sections.smoke_parent = 'Runtime smoke harness. Acknowledge completion notices briefly. Do not call tools or launch children.'; });
  }],
});
await loader.reload();
const { session } = await sdk.createAgentSession({ cwd, resourceLoader: loader, modelRuntime, model, thinkingLevel: 'low', sessionManager: sdk.SessionManager.create(cwd, join(root, 'sessions')) });
const report = { pi: JSON.parse(await readFile(join(modules, '@earendil-works/pi-coding-agent/package.json'), 'utf8')).version,
  runner: JSON.parse(await readFile(join(sdk.getAgentDir(), 'npm/node_modules/pi-subagents/package.json'), 'utf8')).version,
  fixture: root, checks: [] };
const running = new Set();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function rpc(method, params = {}) {
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { dispose(); reject(new Error(`${method}: RPC timeout`)); }, 30000);
    const dispose = events.on(`subagents:rpc:v1:reply:${id}`, reply => {
      clearTimeout(timer); dispose();
      if (reply.success) resolve(reply.data); else reject(new Error(reply.error?.message ?? 'RPC rejected'));
    });
    events.emit('subagents:rpc:v1:request', { version: 1, requestId: id, method, params });
  });
}
async function start(params) {
  const before = Date.now();
  const tool = session.extensionRunner.getToolDefinition('background_task');
  const result = await tool.execute(crypto.randomUUID(), { timeoutMs: 120000, ...params }, undefined, undefined, session.extensionRunner.createToolContext('smoke', undefined));
  const details = result.details;
  const id = details?.runId ?? details?.asyncId ?? details?.id;
  assert.ok(id && details.asyncDir, 'missing dispatch identity');
  running.add(id);
  report.checks.push({ check: 'dispatch', role: params.role, kind: params.kind, id, elapsedMs: Date.now() - before });
  return { id, dir: details.asyncDir };
}
async function settle(run) {
  const deadline = Date.now() + 130000;
  let status;
  while (Date.now() < deadline) {
    status = JSON.parse(await readFile(join(run.dir, 'status.json'), 'utf8'));
    if (['complete', 'failed', 'partial', 'stopped', 'rejected'].includes(status.state)) break;
    await sleep(200);
  }
  assert.equal(status.state, 'complete', `${run.id}: expected completed worker`);
  running.delete(run.id);
  report.checks.push({ check: 'completed', id: run.id, toolCount: status.toolCount });
  return status;
}
try {
  await session.bindExtensions({ onError: error => errors.push({ event: error.event, error: String(error.error) }) });
  assert.deepEqual(errors, []);
  const jobs = [];
  for (const role of ['auth-regression', 'API-contract-tests', 'CLI-checks', 'retry-tests', 'docs-examples-check']) {
    jobs.push(await start({ role, kind: 'tests', task: 'Approved fixture test task. In the assigned cwd run exactly once: `python3 -B -m unittest test_fixture.py`. Report the exact command, exit code and unittest result. Do not edit source, install dependencies, mutate Git or perform any other shell command.' }));
  }
  const snapshot = await rpc('status');
  assert.equal(snapshot.fleet.totalActive, 5);
  assert.equal(snapshot.fleet.topLevelAsyncCapacity.limit, 5);
  report.checks.push({ check: 'five-simultaneous-workers', active: snapshot.fleet.totalActive });
  await assert.rejects(() => start({ role: 'sixth-probe', kind: 'analysis', task: 'Do not start if all five slots are occupied.' }), /capacity exhausted.*5\/5/i);
  report.checks.push({ check: 'sixth-worker-rejected', ok: true });
  await session.reload();
  await rpc('status', { id: jobs[0].id });
  report.checks.push({ check: 'reload-retains-five-jobs', ok: true });
  const statuses = await Promise.all(jobs.map(settle));
  for (let index = 0; index < jobs.length; index++) {
    // Native mirrored child events, not a worker's prose, establish that bash ran and the test exited zero.
    const lines = (await readFile(join(jobs[index].dir, 'events.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line));
    const serialized = lines.map(line => JSON.stringify(line));
    assert.ok(serialized.some(line => line.includes('tool_execution_start') && line.includes('bash')), 'no native bash start');
    assert.ok(serialized.some(line => line.includes('Ran 1 test') && line.includes('OK')), 'missing actual unittest evidence');
    const tools = statuses[index].capabilityAudit?.effectiveTools;
    assert.ok(tools?.includes('bash'));
    assert.ok(!tools.includes('subagent') && !tools.includes('edit') && !tools.includes('write'));
  }
  report.checks.push({ check: 'five-real-test-commands', ok: true });
  assert.equal(git('status', '--porcelain'), '');
  const capacityDeadline = Date.now() + 15000;
  while (Date.now() < capacityDeadline && (await rpc('status')).fleet.topLevelAsyncCapacity.used > 0) await sleep(250);
  const replacement = await start({ role: 'newly-needed-task', kind: 'analysis', task: 'Read fixture.txt and return its exact content only. No shell or edits.' });
  await settle(replacement);
  report.checks.push({ check: 'capacity-reused-more-than-five-total-launches', ok: true });
  const writer = await start({ role: 'isolated-canary-implementation', kind: 'implementation', task: 'Explicitly approved isolated fixture edit: create only canary.txt containing ISOLATED_WORKER_OK in the assigned worktree. Use write, not shell. Do not stage, commit, push, install anything or edit the lead checkout. Return changed path and content.' });
  const written = await settle(writer);
  await assert.rejects(() => access(join(cwd, 'canary.txt')));
  assert.equal(git('status', '--porcelain'), '');
  assert.ok(written.parallelHandoff?.path, 'missing managed-worktree handoff');
  assert.equal(written.parallelHandoff.changedPatches, 1);
  const manifest = JSON.parse(await readFile(written.parallelHandoff.path, 'utf8'));
  const patches = manifest.groups.flatMap(group => group.children).map(child => child.patch?.path).filter(Boolean);
  assert.equal(patches.length, 1);
  assert.match(await readFile(patches[0], 'utf8'), /ISOLATED_WORKER_OK/);
  report.checks.push({ check: 'implementation-isolated-and-patch-captured', ok: true });
  assert.ok(summaries.some(summary => summary.available && summary.active === 5));
  report.checks.push({ check: 'footer-observed-five-active', ok: true });
  assert.deepEqual(errors, []);
} finally {
  for (const id of running) { try { await rpc('stop', { id }); } catch {} }
  await sleep(1500); await session.waitForIdle();
  await session.extensionRunner.emit({ type: 'session_shutdown', reason: 'quit' });
  session.dispose();
  await writeFile(join(root, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
