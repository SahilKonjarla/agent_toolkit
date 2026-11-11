import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Real host/runner loading and tool-hook wiring, without prompting any model.
test('installed Pi binds task-defined workers and prevents fan-out bypass', async () => {
  const install = join(homedir(), '.pi/agent/install');
  const modules = process.env.PI_NODE_MODULES ?? join(install, 'releases', (await readFile(join(install, 'current-version'), 'utf8')).trim(), 'node_modules');
  const sdk = await import(pathToFileURL(join(modules, '@earendil-works/pi-coding-agent/dist/index.js')).href);
  const loader = new sdk.DefaultResourceLoader({ cwd: tmpdir(), agentDir: sdk.getAgentDir(), noExtensions: true, noSkills: true, noPromptTemplates: true,
    additionalExtensionPaths: [join(sdk.getAgentDir(), 'npm/node_modules/pi-subagents'), new URL('../index.ts', import.meta.url).pathname],
  });
  await loader.reload();
  const { session } = await sdk.createAgentSession({ cwd: tmpdir(), resourceLoader: loader, sessionManager: sdk.SessionManager.inMemory(tmpdir()) });
  const errors = [];
  try {
    await session.bindExtensions({ onError: error => errors.push(String(error.error)) });
    assert.deepEqual(errors, []);
    assert.ok(session.extensionRunner.getToolDefinition('background_task'));
    const input = { agent: 'delegate', async: false };
    const result = await session.extensionRunner.emitToolCall({ type: 'tool_call', toolName: 'subagent', toolCallId: 'policy-check', input });
    assert.ok(!result?.block);
    assert.equal(input.options.timeoutMs, 600000);
    assert.equal(input.options.maxSubagentSpawnsPerRun, undefined);
    const blocked = await session.extensionRunner.emitToolCall({ type: 'tool_call', toolName: 'subagent', toolCallId: 'policy-denial', input: { workflow: true, options: { globalConcurrencyLimit: 3 } } });
    assert.equal(blocked.block, true);
    assert.match(blocked.reason, /five concurrently/);
  } finally {
    await session.extensionRunner.emit({ type: 'session_shutdown', reason: 'quit' });
    session.dispose();
  }
});
