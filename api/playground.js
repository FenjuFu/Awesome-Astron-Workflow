import { runPlayground } from './_lib/playground-core.js';
// Best-effort per-instance protection; configure a shared edge rate limit for production scale.
const clients = new Map();
let active = 0;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (req.headers['sec-fetch-site'] === 'cross-site') return res.status(403).json({ error: 'Cross-site requests are not allowed' });
  const now = Date.now();
  for (const [key, entry] of clients) if (now >= entry.until) clients.delete(key);
  const ip = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const entry = clients.get(ip) || { count: 0, until: now + 60000 };
  if (entry.count >= 5 || active >= 3 || clients.size >= 10000) {
    res.setHeader('Retry-After', '60'); return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }
  if (JSON.stringify(req.body || {}).length > 110000) return res.status(413).json({ error: 'Request too large' });
  entry.count++; clients.set(ip, entry); active++;
  try { const { status, json } = await runPlayground(req.body, process.env); return res.status(status).json(json); }
  finally { active--; }
}
