import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const install = join(homedir(), '.pi/agent/install');
const modules = process.env.PI_NODE_MODULES ?? join(install, 'releases', readFileSync(join(install, 'current-version'), 'utf8').trim(), 'node_modules');
const { createJiti } = createRequire(import.meta.url)(join(modules, 'jiti/lib/jiti.cjs'));
const jiti = createJiti(import.meta.url, { alias: { typebox: createRequire(join(modules, '../package.json')).resolve('typebox') } });
const { TASK_FOCUS_GUIDANCE } = jiti('../task-focus.ts');
const { taskDefinition } = jiti('../background-task.ts');

test('runtime task-focus guidance comes from the canonical portable standard', () => {
  assert.equal(TASK_FOCUS_GUIDANCE, readFileSync(new URL('../../../standards/task-focus-policy.md', import.meta.url), 'utf8').trim());
  for (const rule of [/acceptance criteria/i, /non-blocking/i, /required verification/i, /severity/i, /approval/i, /read-only/i, /safety/i, /smallest/i, /continue/i]) {
    assert.match(TASK_FOCUS_GUIDANCE, rule);
  }
});

test('all worker kinds receive the same focus policy without gaining remediation tools', () => {
  for (const kind of ['analysis', 'tests', 'implementation']) {
    const definition = taskDefinition('bounded-task', kind);
    assert.ok(definition.systemPrompt.includes(TASK_FOCUS_GUIDANCE));
    if (kind !== 'implementation') assert.ok(!definition.tools.includes('edit') && !definition.tools.includes('write'));
    if (kind === 'tests') assert.match(definition.systemPrompt, /Do not edit source or remediate failures/);
  }
});
