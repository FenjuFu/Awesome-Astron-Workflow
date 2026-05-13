import { drawDueLuckyDraws } from '../_lib/lucky-draw.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = await drawDueLuckyDraws();
    const completed = results.filter((item) => item.success && !item.alreadyCompleted);

    return res.status(200).json({
      success: true,
      processed: results.length,
      completed: completed.length,
      results,
    });
  } catch (error) {
    console.error('Error processing due lucky draws:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
