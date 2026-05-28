// Shared chat logic: knowledge-base retrieval + upstream MaaS call.
// Used by both the Vercel function (api/chat.js) and the Vite dev middleware,
// so /chat behaves identically in development and production.

import { retrieve } from './kb-retriever.js';

const DEFAULT_UPSTREAM = 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2/chat/completions';
const TOP_K = 4;

function lastUserMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i] && messages[i].role === 'user') return messages[i].content || '';
  }
  return '';
}

function buildKnowledgeBlock(hits) {
  const parts = hits.map((h, i) => {
    const c = h.chunk;
    const src = [c.title, c.section || c.heading].filter(Boolean).join(' / ');
    return `【${i + 1}】来源：${src}\n${c.text}`;
  });
  return parts.join('\n\n');
}

// Pick the strong matches: always the top hit, plus others close to it.
function selectHits(query) {
  const hits = retrieve(query, TOP_K + 2);
  if (hits.length === 0) return [];
  const top = hits[0].score;
  const floor = Math.max(1.0, top * 0.35);
  return hits.filter((h) => h.score >= floor).slice(0, TOP_K);
}

function systemPrompt(knowledgeBlock) {
  const base =
    '你是 Astron（讯飞星辰）智能体平台与 Astron RPA 的官方技术支持助手。' +
    '请优先依据下方“知识库片段”回答用户问题，尽量给出可操作的步骤、命令和配置项。' +
    '若知识库片段未覆盖该问题，可结合通用知识作答，但需说明这部分属于通用建议。' +
    '请使用简体中文，回答简洁、分步、可执行。';
  if (!knowledgeBlock) return base + '\n\n（本次未检索到相关知识库片段。）';
  return `${base}\n\n===== 知识库片段 =====\n${knowledgeBlock}\n===== 知识库片段结束 =====`;
}

/**
 * Run a chat completion with KB augmentation.
 * @param {object} body  request body ({ messages, model?, max_tokens?, temperature? })
 * @param {object} env   process.env
 * @returns {Promise<{status:number, json:object}>}
 */
export async function runChat(body = {}, env = {}) {
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { status: 400, json: { error: 'Invalid request: messages must be a non-empty array' } };
  }

  const apiKey = env.ASTRON_MAAS_API_KEY;
  if (!apiKey) {
    return { status: 500, json: { error: 'Missing server configuration: ASTRON_MAAS_API_KEY' } };
  }
  const upstreamUrl = env.ASTRON_MAAS_BASE_URL || DEFAULT_UPSTREAM;
  const model = body.model || env.ASTRON_MAAS_MODEL || 'astron-code-latest';

  const maxTokensEnv = Number.parseInt(env.ASTRON_MAAS_MAX_TOKENS || '', 10);
  const tempEnv = Number.parseFloat(env.ASTRON_MAAS_TEMPERATURE || '');

  // Retrieve KB context for the latest user turn and prepend as a system message.
  let hits = [];
  try {
    hits = selectHits(lastUserMessage(messages));
  } catch {
    hits = [];
  }
  const augmented = [
    { role: 'system', content: systemPrompt(buildKnowledgeBlock(hits)) },
    ...messages,
  ];

  const payload = {
    model,
    messages: augmented,
    max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : (Number.isFinite(maxTokensEnv) ? maxTokensEnv : 32768),
    temperature: typeof body.temperature === 'number' ? body.temperature : (Number.isFinite(tempEnv) ? tempEnv : 0.7),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await upstreamRes.text();
    if (!upstreamRes.ok) {
      return {
        status: upstreamRes.status,
        json: { error: `Upstream API error: ${upstreamRes.status} ${upstreamRes.statusText}`, details: text },
      };
    }
    return { status: 200, json: text ? JSON.parse(text) : {} };
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Upstream request timed out' : (error?.message || 'AI request failed');
    return { status: 502, json: { error: message } };
  } finally {
    clearTimeout(timeout);
  }
}
