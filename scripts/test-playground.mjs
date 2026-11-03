import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runPlayground } from '../api/_lib/playground-core.js';
const env = { ASTRON_MAAS_API_KEY: 'test-only' };
const html = '<!DOCTYPE html><html><body>Demo</body></html>';
const fake = (content = html, finish_reason = 'stop') => async () => ({ ok: true, json: async () => ({ choices: [{ message: { content }, finish_reason }] }) });
test('reject invalid input before calling upstream', async () => {
  for (const body of [null, {}, {prompt:''}, {prompt:'x'.repeat(3001)}, {prompt:'ok',html:123}]) assert.equal((await runPlayground(body, env, () => { throw Error('must not call'); })).status, 400);
});
test('fixed model and server-only settings; edit source precedes requested change', async () => {
  const result = await runPlayground({prompt:'Make blue',html,model:'other'},env,async (_url, options) => {
    const payload = JSON.parse(options.body);
    assert.equal(payload.model, 'spark-x2.6-4b'); assert.equal(payload.thinking.type, 'disabled');
    assert.equal(payload.messages.at(-1).content, 'Make blue'); assert.match(payload.messages[1].content, /Demo/);
    return fake()();
  }); assert.equal(result.json.html,html);
});
test('handles missing configuration, upstream errors, malformed JSON, incomplete and truncated output',async () => {
  assert.equal((await runPlayground({prompt:'ok'})).status,503);
  assert.equal((await runPlayground({prompt:'ok'},env,async () => ({ok:false}))).status,502);
  assert.equal((await runPlayground({prompt:'ok'},env,async () => {throw Error('SECRET');})).json.error.includes('SECRET'),false);
  assert.equal((await runPlayground({prompt:'ok'},env,fake('<html>'))).status,422);
  assert.equal((await runPlayground({prompt:'ok'},env,fake(html,'length'))).status,422);
  assert.equal((await runPlayground({prompt:'ok'},env,fake('```html\n'+html+'\n```'))).json.html,html);
});
