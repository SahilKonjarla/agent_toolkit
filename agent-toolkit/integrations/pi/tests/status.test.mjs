import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';

const install = join(homedir(), '.pi/agent/install');
const modules = process.env.PI_NODE_MODULES ?? join(install, 'releases', readFileSync(join(install, 'current-version'), 'utf8').trim(), 'node_modules');
const { createJiti } = createRequire(import.meta.url)(join(modules, 'jiti/lib/jiti.cjs'));
const jiti = createJiti(import.meta.url, { alias: { typebox: createRequire(join(modules, '../package.json')).resolve('typebox') } });
const { projectStatus, requestRpc } = jiti('../runtime-status.ts');
const { applyLaunchPolicy } = jiti('../launch-policy.ts');
const { registerBackgroundTask, taskDefinition } = jiti('../background-task.ts');
function bus() {
  const emitter = new EventEmitter();
  return {
    emitter,
    on(name, handler) { emitter.on(name, handler); return () => emitter.off(name, handler); },
    emit(name, value) { emitter.emit(name, value); },
  };
}

test('single jobs acquire deadlines and cannot multiply capacity', () => {
  const input = { agent: 'any-role', async: false };
  assert.equal(applyLaunchPolicy(input), undefined);
  assert.deepEqual(input.options, { timeoutMs: 600000 });
  const tighter = { agent: 'another-role', async: false, options: { timeoutMs: 2000 } };
  assert.equal(applyLaunchPolicy(tighter), undefined);
  assert.equal(tighter.options.timeoutMs, 2000);
  for (const input of [{ agent: 'worker', async: true }, { workflow: true }, { tasks: [{}] }, { chain: [{}] }, { options: { count: 2 } }, { maxSubagentSpawnsPerRun: 5 }, { action: 'resume' }]) {
    assert.equal(typeof applyLaunchPolicy(input), 'string');
  }
});
test('five independent slots are configured without a cumulative session limit', () => {
  const profile = JSON.parse(readFileSync(new URL('../runner-config.json', import.meta.url), 'utf8'));
  assert.equal(profile.maxActiveAsyncRunsPerSession, 5);
  assert.equal(profile.maxSubagentSpawnsPerSession, 0);
  assert.equal(profile.maxSubagentSpawnsPerRun, 1);
  assert.equal(profile.maxSubagentDepth, 1);
  const management = { action: 'status' };
  assert.equal(applyLaunchPolicy(management), undefined);
  assert.equal(management.options, undefined);
});
test('roles are task-defined and tools follow job kind rather than a fixed roster', () => {
  const analysis = taskDefinition('release-risk', 'analysis');
  assert.ok(!analysis.tools.includes('bash'));
  const tests = taskDefinition('auth-test-runner', 'tests');
  assert.ok(tests.tools.includes('bash'));
  assert.ok(!tests.tools.includes('write'));
  const writer = taskDefinition('migration-seam', 'implementation');
  assert.ok(writer.tools.includes('edit'));
  assert.match(writer.systemPrompt, /isolated worktree/);
});
test('task tool uses public single-child dispatch and isolates implementation', async () => {
  const events = bus();
  const launches = [];
  let tool;
  let disposed = 0;
  events.on('pi-subagents:runtime-agent-register:v1', request => {
    assert.ok(request.name.startsWith('specialized-task-'));
    request.result = { ok: true, registration: { dispose() { disposed++; } } };
  });
  events.on('subagents:rpc:v1:request', request => {
    launches.push(request.params);
    events.emit(`subagents:rpc:v1:reply:${request.requestId}`, { version: 1, requestId: request.requestId, success: true, data: { text: 'started', details: { runId: `job-${launches.length}` } } });
  });
  const cleanup = registerBackgroundTask({ events, registerTool(value) { tool = value; } }, () => true);
  for (const kind of ['analysis', 'tests', 'implementation']) {
    await tool.execute('test', { role: 'specialized task', kind, task: 'bounded approved work' }, undefined, undefined, { cwd: '/fixture' });
  }
  assert.equal(launches.length, 3);
  assert.ok(launches.every(launch => launch.async && !launch.workflow && !launch.chain && !launch.tasks));
  assert.equal(launches[0].worktree, undefined);
  assert.equal(launches[1].worktree, undefined);
  assert.equal(launches[2].worktree, true);
  events.emit('subagent:async-complete', { id: 'job-1' });
  assert.equal(disposed, 1);
  cleanup();
  assert.equal(disposed, 3);
});
test('rejected admission releases the ephemeral role and preserves the capacity error', async () => {
  const events = bus();
  let tool;
  let disposed = 0;
  events.on('pi-subagents:runtime-agent-register:v1', request => { request.result = { ok: true, registration: { dispose() { disposed++; } } }; });
  events.on('subagents:rpc:v1:request', request => events.emit(`subagents:rpc:v1:reply:${request.requestId}`, {
    version: 1, requestId: request.requestId, success: false, error: { message: 'Active async run capacity exhausted: 5/5 used.' },
  }));
  const cleanup = registerBackgroundTask({ events, registerTool(value) { tool = value; } }, () => true);
  await assert.rejects(() => tool.execute('sixth', { role: 'another task', kind: 'tests', task: 'approved command' }, undefined, undefined, { cwd: '/fixture' }), /5\/5 used/);
  assert.equal(disposed, 1);
  cleanup();
  assert.equal(disposed, 1);
});
test('public fleet projection is bounded and never includes goal or transcript text', () => {
  const result = projectStatus({ fleet: { version: 1, totalActive: 3, entries: [
    { agent: 'toolkit-quality', startedAt: 100, goal: 'private task' },
    { agent: '\x1b[31mevil\nrole', startedAt: -1 }, { agent: 'third' },
  ] }, asyncSnapshot: { kind: 'pi-subagents.async-status-snapshot', version: 1, runs: [{ state: 'paused' }] } });
  assert.equal(result.active, 3);
  assert.equal(result.attention, 1);
  assert.equal(result.entries.length, 2);
  assert.deepEqual(result.entries[0], { role: 'quality', startedAt: 100 });
  assert.ok(!JSON.stringify(result).includes('private task'));
  assert.ok(!JSON.stringify(result).includes('\\u001b'));
});
test('workflow coordinators do not inflate the active child count', () => {
  const result = projectStatus({ fleet: { version: 1, totalActive: 3, entries: [
    { agent: 'workflow', startedAt: 1 }, { agent: 'toolkit-quality', startedAt: 2 }, { agent: 'toolkit-architect', startedAt: 3 },
  ] } });
  assert.equal(result.active, 2);
  assert.deepEqual(result.entries.map(entry => entry.role), ['quality', 'architect']);
});
test('malformed or unavailable RPC data is unknown, never a false idle success', () => {
  for (const value of [undefined, {}, { fleet: { version: 2, totalActive: 0, entries: [] } }, { fleet: { version: 1, totalActive: -1, entries: [] } }]) {
    assert.equal(projectStatus(value).available, false);
  }
  assert.deepEqual(projectStatus({ fleet: { version: 1, totalActive: 0, entries: [] } }), { available: true, active: 0, attention: 0, entries: [] });
});
test('RPC subscribes before dispatch and cleans up after synchronous replies', async () => {
  const events = bus();
  events.on('subagents:rpc:v1:request', request => events.emit(`subagents:rpc:v1:reply:${request.requestId}`, {
    version: 1, requestId: request.requestId, success: true, data: { ok: true },
  }));
  assert.deepEqual(await requestRpc(events, 'ping').promise, { ok: true });
  assert.deepEqual(events.emitter.eventNames(), ['subagents:rpc:v1:request']);
});
test('RPC timeout and cancellation drop reply listeners', async () => {
  const events = bus();
  assert.equal(await requestRpc(events, 'status', {}, 5).promise, undefined);
  assert.deepEqual(events.emitter.eventNames(), []);
  const request = requestRpc(events, 'status');
  request.cancel();
  assert.equal(await request.promise, undefined);
  assert.deepEqual(events.emitter.eventNames(), []);
});
