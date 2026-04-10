// Vercel Serverless Function: proxy AI chat requests to upstream provider.
// This avoids browser CORS restrictions and keeps API keys off the client.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ASTRON_MAAS_API_KEY;
  const upstreamUrl =
    process.env.ASTRON_MAAS_BASE_URL ||
    'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2/chat/completions';

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing server configuration: ASTRON_MAAS_API_KEY',
    });
  }

  const body = req.body || {};
  const messages = body.messages;
  const model = body.model || process.env.ASTRON_MAAS_MODEL || 'astron-code-latest';

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request: messages must be a non-empty array' });
  }

  const maxTokensEnv = Number.parseInt(process.env.ASTRON_MAAS_MAX_TOKENS || '', 10);
  const tempEnv = Number.parseFloat(process.env.ASTRON_MAAS_TEMPERATURE || '');

  const payload = {
    model,
    messages,
    max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : (Number.isFinite(maxTokensEnv) ? maxTokensEnv : 32768),
    temperature: typeof body.temperature === 'number' ? body.temperature : (Number.isFinite(tempEnv) ? tempEnv : 0.7),
  };

  // Prevent hanging requests in serverless environments.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await upstreamRes.text();
    res.setHeader('Cache-Control', 'no-store');

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: `Upstream API error: ${upstreamRes.status} ${upstreamRes.statusText}`,
        details: text,
      });
    }

    // Upstream returns JSON; parse after checking status to surface errors cleanly.
    const data = text ? JSON.parse(text) : {};
    return res.status(200).json(data);
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Upstream request timed out' : (error?.message || 'AI request failed');
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
}
