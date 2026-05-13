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

    // 2. Fetch draw config (prizes)
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('lucky_draws')
      .select('*')
      .eq('id', draw_id)
      .single();

    if (drawError) throw drawError;
    if (!draw || !draw.is_active) {
      return res.status(400).json({ error: 'Draw not found or inactive' });
    }
    
    if (new Date(draw.draw_time).getTime() > new Date().getTime() + 10000) {
       return res.status(400).json({ error: 'Draw time has not been reached yet' });
    }

    // 1. Check if winners already exist for this draw_time (prevent duplicate runs)
    const { count, error: countError } = await supabaseAdmin
      .from('lucky_draw_winners')
      .select('*', { count: 'exact', head: true })
      .eq('draw_id', draw_id)
      .eq('draw_time', draw.draw_time);

    if (countError) throw countError;

    if (count > 0) {
      return res.status(200).json({ message: 'Draw has already been completed for this time' });
    }

    // 3. Fetch all participants for this draw_time
    const { data: participants, error: pError } = await supabaseAdmin
      .from('lucky_draw_participants')
      .select('id, number')
      .eq('draw_id', draw_id)
      .eq('draw_time', draw.draw_time);

    if (pError) throw pError;

    if (!participants || participants.length === 0) {
      return res.status(200).json({ message: 'No participants to draw from' });
    }

    // 4. Shuffle participants randomly
    const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
    
    // 5. Allocate prizes
    const winnersToInsert = [];
    let participantIndex = 0;

    for (const prize of draw.prizes || []) {
      for (let i = 0; i < prize.quantity; i++) {
        // Stop if we run out of participants
        if (participantIndex >= shuffledParticipants.length) break;
        
        winnersToInsert.push({
          draw_id: draw_id,
          draw_time: draw.draw_time,
          participant_id: shuffledParticipants[participantIndex].id,
          number: shuffledParticipants[participantIndex].number,
          prize_name: prize.name
        });
        
        participantIndex++;
      }
    }

    // 6. Insert all winners in a batch
    if (winnersToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('lucky_draw_winners')
        .insert(winnersToInsert);
        
      if (insertError) throw insertError;
    }

    return res.status(200).json({ 
      success: true, 
      message: `Successfully allocated ${winnersToInsert.length} prizes` 
    });
  } catch (error) {
    console.error('Error auto-drawing winners:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}