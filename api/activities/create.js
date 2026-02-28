import { supabaseAdmin } from '../lib/supabase-admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const activityData = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('activities')
      .insert([activityData])
      .select();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating activity:', error);
    return res.status(500).json({ error: error.message });
  }
}
