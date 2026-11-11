import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const digest = value => createHash('sha256').update(value).digest();
export function createSponsorshipHandler({ env = process.env, consumeAttempt }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, private, max-age=0');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'method_not_allowed' });
    }
    const origins = new Set(['https://www.awesome-astron-workflow.dev', 'https://awesome-astron-workflow.dev']);
    for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) if (host) origins.add(`https://${host}`);
    if (!origins.has(req.headers.origin)) return res.status(403).json({ error: 'invalid_origin' });
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).json({ error: 'invalid_content_type' });
    const passphrase = env.SPONSORSHIP_PASSPHRASE;
    const apiKey = env.SPONSORSHIP_API_KEY;
    if (!passphrase || !apiKey || env.SPONSORSHIP_ENABLED !== 'true') return res.status(503).json({ error: 'unavailable' });
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch { return res.status(400).json({ error: 'invalid_request' }); }
    if (!body || typeof body.passphrase !== 'string' || body.passphrase.length > 128 || body.accepted !== true) return res.status(400).json({ error: 'invalid_request' });
    try {
      // Vercel overwrites x-forwarded-for; store only a keyed address hash.
      const ip = env.VERCEL ? String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim() : req.socket?.remoteAddress || 'local';
      const subject = createHmac('sha256', apiKey).update(ip).digest('hex');
      if (!(await consumeAttempt(subject))) {
        res.setHeader('Retry-After', '900');
        return res.status(429).json({ error: 'rate_limited' });
      }
      if (!timingSafeEqual(digest(body.passphrase.trim()), digest(passphrase))) return res.status(403).json({ error: 'invalid_passphrase' });
      return res.status(200).json({ apiKey, model: 'spark-x2.6-4b' });
    } catch {
      // Fail closed without logging secrets or request bodies.
      return res.status(503).json({ error: 'unavailable' });
    }
  };
}
