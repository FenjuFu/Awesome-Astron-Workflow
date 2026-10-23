import test from 'node:test';
import assert from 'node:assert/strict';
import { runChat } from '../../api/_lib/chat-core.js';

const messages = [{ role: 'user', content: 'What can Astron do?' }];
const env = { ASTRON_MAAS_API_KEY: 'test-only' };

for (const level of ['none', 'low', 'high', undefined]) {
  test(`thinking level ${level ?? '(default)'} configures real MaaS controls`, async t => {
    let payload;
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
      payload = JSON.parse(options.body);
      return new Response(JSON.stringify({ choices: [{ message: { content: 'Test reply' } }] }));
    });
    const result = await runChat({ messages, reasoning_effort: level, language: 'en', max_tokens: 32768 }, env);
    assert.equal(result.status, 200);
    assert.equal(payload.thinking.type, level === 'none' ? 'disabled' : 'enabled');
    assert.equal(payload.reasoning_effort, level === 'none' ? undefined : (level ?? 'low'));
    assert.equal(payload.max_tokens, 32768, 'Thinking levels must not reduce the final-answer token allowance');
    assert.match(payload.messages[0].content, /Respond in English/);
    assert.deepEqual(payload.messages.slice(1), messages);
    assert.equal(payload.model, 'spark-x2.6-4b');
  });
}

test('invalid thinking levels are rejected before any upstream request', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Must not call upstream'); });
  for (const level of ['medium', '', 'HIGH', null, {}, ['low']]) {
    const result = await runChat({ messages, reasoning_effort: level }, env);
    assert.equal(result.status, 400);
    assert.match(result.json.error, /reasoning_effort/);
  }
  assert.equal(fetch.mock.callCount(), 0);
});
