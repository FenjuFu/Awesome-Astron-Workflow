import { supabaseAdmin } from '../_lib/supabase-admin.js';

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

    // Get IP address from Vercel headers
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Fetch the current draw_time for this draw_id
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('lucky_draws')
      .select('draw_time, is_active')
      .eq('id', draw_id)
      .single();

    if (drawError || !draw || !draw.is_active) {
      return res.status(400).json({ error: 'Draw not found or inactive' });
    }

    // Insert participant with IP and draw_time
    const { data, error } = await supabaseAdmin
      .from('lucky_draw_participants')
      .insert([{ draw_id, draw_time: draw.draw_time, ip_address: ipAddress }])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({ error: 'You have already got a number for this event.' });
      }
      throw error;
    }

    return res.status(200).json({ number: data.number });
  } catch (error) {
    console.error('Error participating in lucky draw:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}