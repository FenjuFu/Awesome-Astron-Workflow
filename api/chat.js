// Vercel Serverless Function: knowledge-base-augmented AI chat proxy.
// Retrieval + upstream call live in api/_lib/chat-core.js so the Vite dev
// server can share the exact same logic.
import { runChat } from './_lib/chat-core.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status, json } = await runChat(req.body || {}, process.env);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(json);
}
