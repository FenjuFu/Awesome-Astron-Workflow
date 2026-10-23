import test from 'node:test';
import assert from 'node:assert/strict';
import { runChat } from '../../api/_lib/chat-core.js';
import { replyLanguage, hasChineseProse } from '../../api/_lib/chat-language.js';

const question = [{ role: 'user', content: 'introduce skillhub' }];
const chinese = 'SkillHub 是面向企业的智能体技能管理平台，支持技能搜索、安装、发布和安全治理，也支持私有化部署。';
const english = 'SkillHub is an enterprise platform for discovering, installing, publishing, and governing agent skills, with support for private deployment.';
const env = { ASTRON_MAAS_API_KEY: 'test-only' };
const completion = (content, usage) => ({
  model: 'spark-x2.6-4b',
  choices: [{ message: { role: 'assistant', content }, finish_reason: 'stop' }],
  usage,
});

test('missing language follows an English question without using prior Chinese history', () => {
  assert.equal(replyLanguage(undefined, 'introduce skillhub'), 'en');
  assert.equal(replyLanguage(undefined, '你好，请介绍 SkillHub'), 'zh-CN');
  assert.equal(replyLanguage(undefined, '```js\nconst x = 1;\n```'), 'zh-CN');
  assert.equal(replyLanguage('en', '请介绍 SkillHub'), 'en');
  assert.equal(replyLanguage('zh-CN', 'introduce skillhub'), 'zh-CN');
});

test('language check permits Chinese names, quotations, and code in an English explanation', () => {
  assert.equal(hasChineseProse(chinese), true);
  assert.equal(hasChineseProse('你好！'), true);
  assert.equal(hasChineseProse('SkillHub (技能中心) manages reusable agent skills.'), false);
  assert.equal(hasChineseProse('The original quotation is “技能可以通过私有仓库集中分发和管理”。'), false);
  assert.equal(hasChineseProse('Run this example:\n```python\nprint("你好，这是中文示例。")\n```'), false);
  assert.equal(hasChineseProse(`${english}\n\n${chinese}`), true);
});

for (const level of ['none', 'low', 'high']) {
  test(`English SkillHub answer is corrected if ${level} returns Chinese prose`, async t => {
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
      requests.push({ body: JSON.parse(options.body), signal: options.signal });
      return new Response(JSON.stringify(requests.length === 1
        ? completion(chinese, { prompt_tokens: 100, completion_tokens: 40, total_tokens: 140, completion_tokens_details: { reasoning_tokens: 10 } })
        : completion(english, { prompt_tokens: 80, completion_tokens: 30, total_tokens: 110 })));
    });
    const result = await runChat({ language: 'en', reasoning_effort: level, messages: question }, env);
    assert.equal(result.status, 200);
    assert.equal(result.json.choices[0].message.content, english);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].body.thinking.type, level === 'none' ? 'disabled' : 'enabled');
    assert.equal(requests[1].body.thinking.type, 'disabled');
    assert.equal(requests[1].body.reasoning_effort, undefined);
    assert.match(requests[1].body.messages[0].content, /Translate.*English/);
    assert.equal(requests[1].body.messages[1].content, chinese);
    assert.equal(requests[0].signal, requests[1].signal, 'Correction shares the original timeout');
    assert.equal(result.json.usage.total_tokens, 250);
    assert.equal(result.json.usage.completion_tokens_details.reasoning_tokens, 10);
  });
}

test('correct English output makes only one model request', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(completion(english))));
  const result = await runChat({ language: 'en', messages: question }, env);
  assert.equal(result.json.choices[0].message.content, english);
  assert.equal(fetch.mock.callCount(), 1);
});

test('Chinese mode preserves Chinese output without a translation request', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(completion(chinese))));
  const result = await runChat({ language: 'zh-CN', messages: question }, env);
  assert.equal(result.json.choices[0].message.content, chinese);
  assert.equal(fetch.mock.callCount(), 1);
});

for (const failure of ['upstream-error', 'still-Chinese', 'empty']) {
  test(`failed correction (${failure}) never returns the wrong-language answer`, async t => {
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async () => {
      if (++calls === 1) return new Response(JSON.stringify(completion(chinese)));
      if (failure === 'upstream-error') return new Response('{}', { status: 503 });
      return new Response(JSON.stringify(completion(failure === 'empty' ? '' : chinese)));
    });
    const result = await runChat({ language: 'en', messages: question }, env);
    assert.equal(result.status, 502);
    assert.equal(result.json.choices, undefined);
    assert.match(result.json.error, /English response/);
    assert.equal(calls, 2, 'Correction must not loop');
  });
}
