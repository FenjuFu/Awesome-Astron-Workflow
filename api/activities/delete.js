import { supabaseAdmin } from '../lib/supabase-admin.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Or req.body depending on how it's sent

  if (!id) {
    return res.status(400).json({ error: 'Missing activity ID' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('activities')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error deleting activity:', error);
    return res.status(500).json({ error: error.message });
  }
}
