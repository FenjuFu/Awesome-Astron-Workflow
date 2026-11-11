import test from 'node:test';
import assert from 'node:assert/strict';
import { createSponsorshipHandler } from '../../api/_lib/sponsorship-core.js';

const env = { SPONSORSHIP_ENABLED: 'true', SPONSORSHIP_API_KEY: 'test-key-only', SPONSORSHIP_PASSPHRASE: 'test-code' };
async function request({ method = 'POST', body = { passphrase: 'test-code', accepted: true }, origin = 'https://www.awesome-astron-workflow.dev', config = env, consumeAttempt = async () => true, contentType = 'application/json' } = {}) {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await createSponsorshipHandler({ env: config, consumeAttempt })({ method, body, headers: { origin, 'content-type': contentType }, socket: { remoteAddress: '127.0.0.1' } }, res);
  assert.match(res.headers['Cache-Control'], /no-store/);
  return res;
}
test('only a correct code and accepted guidance release the key', async () => {
  assert.equal((await request()).body.apiKey, env.SPONSORSHIP_API_KEY);
  for (const body of [{ passphrase: 'wrong', accepted: true }, { passphrase: 'test-code', accepted: false }, {}, 'invalid json', { passphrase: 'x'.repeat(129), accepted: true }]) {
    const res = await request({ body }); assert.ok(res.code >= 400); assert.ok(!JSON.stringify(res.body).includes(env.SPONSORSHIP_API_KEY));
  }
});
test('rejects GET, foreign origins and unsupported content types', async () => {
  assert.equal((await request({ method: 'GET' })).code, 405);
  assert.equal((await request({ origin: 'https://attacker.example' })).code, 403);
  assert.equal((await request({ origin: undefined })).code, 200); // default fixture origin
  assert.equal((await request({ origin: '' })).code, 403);
  assert.equal((await request({ contentType: 'text/plain' })).code, 415);
});
test('limiter is used for incorrect and correct codes without raw personal data', async () => {
  const subjects = [];
  const consumeAttempt = async subject => { subjects.push(subject); return subjects.length <= 1; };
  assert.equal((await request({ body: { passphrase: 'wrong', accepted: true }, consumeAttempt })).code, 403);
  const response = await request({ consumeAttempt });
  assert.equal(response.code, 429); assert.equal(response.headers['Retry-After'], '900');
  assert.match(subjects[0], /^[a-f0-9]{64}$/); assert.equal(subjects[0], subjects[1]);
});
test('disabled configuration and storage failures fail closed', async () => {
  assert.equal((await request({ config: {} })).code, 503);
  assert.equal((await request({ config: { ...env, SPONSORSHIP_ENABLED: 'false' } })).code, 503);
  assert.equal((await request({ consumeAttempt: async () => { throw new Error('private'); } })).code, 503);
});
