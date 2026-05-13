import { drawWinnersForDraw } from '../_lib/lucky-draw.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { draw_id } = req.body;

    if (!draw_id) {
      return res.status(400).json({ error: 'draw_id is required' });
    }
    const result = await drawWinnersForDraw(draw_id);

    if (!result.success) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error auto-drawing winners:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || String(error),
    });
  }
}
