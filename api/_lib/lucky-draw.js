import { supabaseAdmin } from './supabase-admin.js';

function shuffle(array) {
  const items = [...array];

  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

export async function drawWinnersForDraw(drawId) {
  if (!drawId) {
    throw new Error('draw_id is required');
  }

  const { data: draw, error: drawError } = await supabaseAdmin
    .from('lucky_draws')
    .select('*')
    .eq('id', drawId)
    .single();

  if (drawError) throw drawError;
  if (!draw || !draw.is_active) {
    return { success: false, status: 400, error: 'Draw not found or inactive' };
  }

  if (new Date(draw.draw_time).getTime() > Date.now()) {
    return { success: false, status: 400, error: 'Draw time has not been reached yet' };
  }

  const { count, error: countError } = await supabaseAdmin
    .from('lucky_draw_winners')
    .select('*', { count: 'exact', head: true })
    .eq('draw_id', drawId)
    .eq('draw_time', draw.draw_time);

  if (countError) throw countError;

  if (count > 0) {
    return {
      success: true,
      alreadyCompleted: true,
      winnersCount: count,
      message: 'Draw has already been completed for this time',
    };
  }

  const { data: participants, error: participantsError } = await supabaseAdmin
    .from('lucky_draw_participants')
    .select('id, number')
    .eq('draw_id', drawId)
    .eq('draw_time', draw.draw_time);

  if (participantsError) throw participantsError;

  if (!participants || participants.length === 0) {
    return {
      success: true,
      winnersCount: 0,
      message: 'No participants to draw from',
    };
  }

  const shuffledParticipants = shuffle(participants);
  const winnersToInsert = [];
  let participantIndex = 0;

  for (const prize of draw.prizes || []) {
    for (let i = 0; i < prize.quantity; i += 1) {
      if (participantIndex >= shuffledParticipants.length) {
        break;
      }

      winnersToInsert.push({
        draw_id: drawId,
        draw_time: draw.draw_time,
        participant_id: shuffledParticipants[participantIndex].id,
        number: shuffledParticipants[participantIndex].number,
        prize_name: prize.name,
      });

      participantIndex += 1;
    }
  }

  if (winnersToInsert.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from('lucky_draw_winners')
      .insert(winnersToInsert);

    if (insertError) throw insertError;
  }

  return {
    success: true,
    winnersCount: winnersToInsert.length,
    message: `Successfully allocated ${winnersToInsert.length} prizes`,
  };
}

export async function drawDueLuckyDraws() {
  const nowIso = new Date().toISOString();

  const { data: dueDraws, error } = await supabaseAdmin
    .from('lucky_draws')
    .select('id')
    .eq('is_active', true)
    .lte('draw_time', nowIso);

  if (error) throw error;

  const results = [];

  for (const draw of dueDraws || []) {
    const result = await drawWinnersForDraw(draw.id);
    results.push({
      draw_id: draw.id,
      ...result,
    });
  }

  return results;
}
