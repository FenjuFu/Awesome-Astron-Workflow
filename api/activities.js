import { supabaseAdmin } from './_lib/supabase-admin.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handleCreate(req, res);
      case 'PUT':
        return await handleUpdate(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error(`Error in activities handler (${method}):`, error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleCreate(req, res) {
  const activityData = req.body;
  const { data, error } = await supabaseAdmin
    .from('activities')
    .insert([activityData])
    .select();

  if (error) throw error;
  return res.status(200).json(data);
}

async function handleUpdate(req, res) {
  const { id, ...updates } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing activity ID' });
  }

  const { data, error } = await supabaseAdmin
    .from('activities')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return res.status(200).json(data);
}

async function handleDelete(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing activity ID' });
  }

  const { data, error } = await supabaseAdmin
    .from('activities')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  return res.status(200).json(data);
}
