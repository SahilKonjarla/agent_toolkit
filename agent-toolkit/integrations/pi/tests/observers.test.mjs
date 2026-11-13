import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
const install = join(homedir(), '.pi/agent/install');
const modules = process.env.PI_NODE_MODULES ?? join(install, 'releases', readFileSync(join(install, 'current-version'), 'utf8').trim(), 'node_modules');
const { createJiti } = createRequire(import.meta.url)(join(modules, 'jiti/lib/jiti.cjs'));
const { createObserverManager } = createJiti(import.meta.url)('../herdr-observers.ts');
const { renderObserver } = await import('../observer-view.mjs');

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'toolkit-observers-test-'));
  const panes = new Map();
  let counter = 0;
  const host = {
    async split() { const paneId = `w1:p${++counter}`; const value = { exists: true, paneId, terminalId: `terminal-${counter}`, foregroundPids: [], shellPid: 10 }; panes.set(paneId, value); return value; },
    async inspect(paneId) { return panes.get(paneId) ?? { exists: false }; },
    async launch(pane, spec) {
      const pid = 100 + counter;
      panes.get(pane.paneId).foregroundPids = [pid];
      panes.get(pane.paneId).viewer = { token: spec.token, task: spec.id, manifest: spec.manifest, receipt: spec.receipt };
      await writeFile(spec.receipt, JSON.stringify({ version: 1, token: spec.token, pid }));
      return { pid, stamp: `start-${pid}` };
    },
    async identify(pane) { const pid = panes.get(pane.paneId)?.foregroundPids?.[0]; if (!pid) throw new Error('No viewer handshake'); return { pid, stamp: `start-${pid}` }; },
    async stamp(pid) { return `start-${pid}`; },
    async close(paneId) { panes.delete(paneId); },
  };
  const options = { directory: join(root, 'state'), sessionId: 'test-owner', sessionFile: '/sessions/test-owner.jsonl', endpoint: 'test-server', parentPane: 'w1:parent', cwd: root, host };
  const manager = createObserverManager(options);
  async function track(id) {
    const asyncDir = join(root, id); await mkdir(asyncDir);
    await writeFile(join(asyncDir, 'status.json'), JSON.stringify({ runId: id, sessionId: options.sessionFile, state: 'running' }));
    await manager.track({ id, asyncDir, role: id });
  }
  return { root, manager, host, panes, options, track, cleanup: () => rm(root, { recursive: true, force: true }) };
}

test('observer output cannot inject terminal control sequences', () => {
  const text = renderObserver('tests', { state: 'complete' }, '\x1b]52;c;clipboard\x07\x1b[31mOK\x1b[0m\x00');
  assert.doesNotMatch(text, /[\x00\x07\x1b]/);
  assert.match(text, /Read-only view/);
  assert.match(text, /OK/);
});

test('unknown task names cannot inherit object properties as launch authority', async () => {
  const f = await fixture();
  try {
    await assert.rejects(() => f.manager.open('constructor'), /Unknown or foreign/);
    assert.equal(f.panes.size, 0);
  } finally { await f.cleanup(); }
});

test('a third observer is rejected, and closing a view does not change worker state', async () => {
  const f = await fixture();
  try {
    await f.track('job-a'); await f.track('job-b'); await f.track('job-c');
    await Promise.all([f.manager.open('job-a'), f.manager.open('job-b')]);
    await assert.rejects(() => f.manager.open('job-c'), /Two observer/);
    assert.equal(f.panes.size, 2);
    const result = await f.manager.close('job-a');
    assert.equal(result.workerStopped, false);
    assert.equal(JSON.parse(readFileSync(join(f.root, 'job-a/status.json'), 'utf8')).state, 'running');
    await f.manager.open('job-c');
    assert.equal(f.panes.size, 2);
  } finally { await f.cleanup(); }
});

test('changed occupants and unknown launch outcomes retain capacity rather than closing unrelated work', async () => {
  const f = await fixture();
  try {
    await f.track('job-a'); await f.track('job-b'); await f.track('job-c');
    const view = await f.manager.open('job-a');
    f.panes.get(view.paneId).foregroundPids = [999];
    await assert.rejects(() => f.manager.close('job-a'), /occupant changed/);
    assert.equal(f.panes.size, 1);
    f.host.split = async () => { throw new Error('reply lost'); };
    await assert.rejects(() => f.manager.open('job-b'), /reply lost/);
    await assert.rejects(() => f.manager.open('job-c'), /Two observer/);
    assert.equal((await f.manager.status()).views.filter(view => view.state === 'unverified').length, 2);
  } finally { await f.cleanup(); }
});

test('lost launch acknowledgement reconciles the existing viewer without redispatch', async () => {
  const f = await fixture();
  try {
    await f.track('job-a');
    const launch = f.host.launch;
    f.host.launch = async (...args) => { await launch(...args); throw new Error('admission reply lost'); };
    await assert.rejects(() => f.manager.open('job-a'), /reply lost/);
    const recovered = await createObserverManager(f.options).open('job-a');
    assert.equal(recovered.reused, true);
    assert.equal(f.panes.size, 1);
    await f.manager.close('job-a');
  } finally { await f.cleanup(); }
});

test('another session cannot acquire observer authority for a task', async () => {
  const f = await fixture();
  try {
    const path = join(f.root, 'foreign'); await mkdir(path);
    await writeFile(join(path, 'status.json'), JSON.stringify({ runId: 'foreign', sessionId: 'other-owner', state: 'running' }));
    await assert.rejects(() => f.manager.track({ id: 'foreign', asyncDir: path, role: 'foreign' }), /another session/);
    await assert.rejects(() => f.manager.open('foreign'), /Unknown or foreign/);
    assert.equal(f.panes.size, 0);
  } finally { await f.cleanup(); }
});

test('corrupted view proof cannot redirect close authority or receipt deletion', async () => {
  const f = await fixture();
  try {
    await f.track('job-a');
    const opened = await f.manager.open('job-a');
    const path = join(f.options.directory, 'manifest.json');
    const state = JSON.parse(readFileSync(path, 'utf8'));
    state.views['job-a'].token = '../../outside';
    await writeFile(path, JSON.stringify(state));
    await assert.rejects(() => f.manager.close('job-a'), /manifest identity is invalid/);
    assert.ok(f.panes.has(opened.paneId));
  } finally { await f.cleanup(); }
});

test('a forged PID/start stamp cannot substitute for the token-bound viewer receipt', async () => {
  const f = await fixture();
  try {
    await f.track('job-a');
    const opened = await f.manager.open('job-a');
    const path = join(f.options.directory, 'manifest.json');
    const state = JSON.parse(readFileSync(path, 'utf8'));
    state.views['job-a'].pid = 999;
    state.views['job-a'].stamp = 'start-999';
    f.panes.get(opened.paneId).foregroundPids = [999];
    await writeFile(path, JSON.stringify(state));
    await assert.rejects(() => f.manager.close('job-a'), /receipt is invalid/);
    assert.ok(f.panes.has(opened.paneId));
  } finally { await f.cleanup(); }
});

test('viewer rejects artifact FIFOs instead of blocking before its regular-file check', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'observer-fifo-'));
  try {
    const token = crypto.randomUUID();
    await writeFile(join(root, 'status.json'), JSON.stringify({ runId: 'fifo-task', sessionId: 'fifo-owner', state: 'running' }));
    execFileSync('mkfifo', [join(root, 'output-0.log')]);
    const manifest = join(root, 'manifest.json');
    await writeFile(manifest, JSON.stringify({ sessionId: 'fifo-owner', tasks: { 'fifo-task': { asyncDir: root, role: 'fifo-test' } }, views: { 'fifo-task': { token } } }));
    let output = '';
    try { await promisify(execFile)(process.execPath, [new URL('../observer-view.mjs', import.meta.url).pathname, '--manifest', manifest, '--task', 'fifo-task', '--token', token, '--receipt', join(root, 'receipt.json')], { timeout: 1200 }); }
    catch (error) { output = error.stdout ?? ''; }
    assert.match(output, /Read-only view/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('malformed persisted authority fails closed', async () => {
  const f = await fixture();
  try {
    await mkdir(f.options.directory);
    await writeFile(join(f.options.directory, 'manifest.json'), JSON.stringify({ version: 1, sessionId: 'test-owner', endpoint: 'test-server', tasks: [], views: [] }));
    await assert.rejects(() => f.manager.status(), /manifest identity is invalid/);
  } finally { await f.cleanup(); }
});

test('opening the same owned task reuses its read-only viewer across manager reload', async () => {
  const f = await fixture();
  try {
    await f.track('job-a');
    const first = await f.manager.open('job-a');
    const again = await createObserverManager(f.options).open('job-a');
    assert.equal(first.paneId, again.paneId);
    assert.equal(again.reused, true);
    assert.equal(f.panes.size, 1);
    await f.manager.close('job-a');
    assert.equal(f.panes.size, 0);
  } finally { await f.cleanup(); }
});
