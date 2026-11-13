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
const jiti = createJiti(import.meta.url, { alias: {
  typebox: createRequire(join(modules, '../package.json')).resolve('typebox'),
} });
const { registerHerdrPresentation } = jiti('../herdr-presentation.ts');

test('Herdr alerts failures and real human-input dialogs, not routine completion or worker attention', () => {
  const original = { HERDR_ENV: process.env.HERDR_ENV, HERDR_PANE_ID: process.env.HERDR_PANE_ID, HERDR_SOCKET_PATH: process.env.HERDR_SOCKET_PATH };
  Object.assign(process.env, { HERDR_ENV: '1', HERDR_PANE_ID: 'w1:p1', HERDR_SOCKET_PATH: '/fixture/herdr.sock' });
  const events = new EventEmitter();
  const handlers = new Map();
  const calls = [];
  const pi = {
    events: { on(name, handler) { events.on(name, handler); return () => events.off(name, handler); } },
    on(name, handler) { handlers.set(name, handler); }, registerTool() {},
    exec(command, args) { calls.push({ command, args }); return Promise.resolve({ code: 0, stdout: '', stderr: '' }); },
  };
  try {
    registerHerdrPresentation(pi, '/fixture');
    handlers.get('session_start')({}, { mode: 'tui', cwd: '/fixture', sessionManager: { getSessionId: () => 'notice-test', getSessionFile: () => undefined } });
    events.emit('subagent:async-complete', { id: 'ok', results: [{ status: 'completed' }] });
    events.emit('subagent:async-complete', { id: 'stopped', status: 'stopped' });
    events.emit('subagent:control-event', { type: 'needs_attention' });
    assert.equal(calls.length, 0);
    events.emit('subagent:async-complete', { id: 'bad', results: [{ status: 'failed', summary: 'private log text' }] });
    events.emit('subagent:async-complete', { id: 'bad', results: [{ status: 'failed' }] });
    handlers.get('ui_prompt_start')({ kind: 'confirm' });
    assert.equal(calls.length, 2);
    assert.ok(calls.every(call => call.command === 'herdr' && call.args[0] === 'notification'));
    assert.ok(!JSON.stringify(calls).includes('private log text'));
    handlers.get('session_shutdown')();
  } finally {
    for (const [key, value] of Object.entries(original)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
