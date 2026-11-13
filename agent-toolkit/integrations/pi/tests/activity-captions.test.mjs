import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const install = join(homedir(), '.pi/agent/install');
const modules = process.env.PI_NODE_MODULES ?? join(install, 'releases', readFileSync(join(install, 'current-version'), 'utf8').trim(), 'node_modules');
const { createJiti } = createRequire(import.meta.url)(join(modules, 'jiti/lib/jiti.cjs'));
const { detailedCaptionPayload, registerActivityCaptions } = createJiti(import.meta.url)('../activity-captions.ts');
const openai = { api: 'openai-responses', provider: 'openai', baseUrl: 'https://api.openai.com/v1', reasoning: true };
const codex = { api: 'openai-codex-responses', provider: 'openai-codex', baseUrl: 'https://chatgpt.com/backend-api', reasoning: true };

// Test the outgoing request, not invented or provider-dependent caption wording.
test('official Responses requests ask for detailed captions without changing effort or other content', () => {
  for (const model of [openai, codex]) {
    for (const effort of ['minimal', 'low', 'medium', 'high', 'xhigh', 'max']) {
      const reasoning = Object.freeze({ effort, summary: 'auto', futureOption: 'preserved' });
      const payload = Object.freeze({ reasoning, input: [{ role: 'user', content: 'fixture' }], tools: [], stream: true, text: { verbosity: 'low' } });
      const result = detailedCaptionPayload(payload, model);
      assert.deepEqual(result, { ...payload, reasoning: { ...reasoning, summary: 'detailed' } });
      assert.equal(result.input, payload.input);
      assert.equal(result.tools, payload.tools);
      assert.equal(result.text, payload.text);
      assert.equal(payload.reasoning.summary, 'auto');
    }
  }
});

test('unsupported APIs, providers, proxy endpoints and non-reasoning models are untouched', () => {
  const payload = { reasoning: { effort: 'high', summary: 'auto' } };
  for (const model of [undefined, { ...openai, api: 'anthropic-messages' }, { ...openai, api: 'openai-completions' }, { ...openai, provider: 'proxy' }, { ...openai, baseUrl: 'https://proxy.example/v1' }, { ...openai, baseUrl: 'https://api.openai.com.evil.example/v1' }, { ...openai, baseUrl: 'not a URL' }, { ...openai, baseUrl: 'http://api.openai.com/v1' }, { ...openai, baseUrl: 'https://api.openai.com/other' }, { ...openai, baseUrl: 'https://api.openai.com/v1?override=1' }, { ...codex, provider: 'openai' }, { ...openai, reasoning: false }]) {
    assert.equal(detailedCaptionPayload(payload, model), undefined);
  }
});

test('disabled, absent, malformed or explicitly chosen summaries/effort are preserved', () => {
  for (const payload of [null, [], 'request', {}, { reasoning: null }, { reasoning: [] }, { reasoning: { summary: 'auto' } }, { reasoning: { effort: 'high' } }, ...['none', 'off', '', 'future-effort', null].map(effort => ({ reasoning: { effort, summary: 'auto' } })), ...[null, false, 'off', 'concise', 'detailed', 'future-summary'].map(summary => ({ reasoning: { effort: 'high', summary } }))]) {
    assert.equal(detailedCaptionPayload(payload, codex), undefined);
  }
});

test('the startup environment opt-out preserves the provider request', () => {
  const previous = process.env.PI_TOOLKIT_ACTIVITY_CAPTIONS;
  try {
    process.env.PI_TOOLKIT_ACTIVITY_CAPTIONS = 'default';
    let handler;
    registerActivityCaptions({ on(_name, callback) { handler = callback; } });
    assert.equal(handler({ payload: { reasoning: { effort: 'high', summary: 'auto' } } }, { model: codex, thinkingLevel: 'high' }), undefined);
  } finally {
    if (previous === undefined) delete process.env.PI_TOOLKIT_ACTIVITY_CAPTIONS;
    else process.env.PI_TOOLKIT_ACTIVITY_CAPTIONS = previous;
  }
});

test('the documented hook respects disabled thinking and the startup opt-out', () => {
  for (const enabled of [true, false]) {
    let handler;
    registerActivityCaptions({ on(name, callback) { assert.equal(name, 'before_provider_request'); handler = callback; } }, enabled);
    const payload = { reasoning: { effort: 'low', summary: 'auto' } };
    assert.equal(handler({ payload }, { model: codex, thinkingLevel: 'off' }), undefined);
    const result = handler({ payload }, { model: codex, thinkingLevel: 'low' });
    assert.equal(result?.reasoning.summary, enabled ? 'detailed' : undefined);
  }
});
