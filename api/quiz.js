import { getQuizClient } from './_lib/quiz-db.js';
import { createRoom, transition, publicRoom, requireQuiz } from './_lib/quiz-core.js';

let indexes;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    requireQuiz(req.method === 'POST', 'Method not allowed', 405);
    const body = req.body || {};
    requireQuiz(JSON.stringify(body).length < 40000, '请求内容过大', 413);
    const client = await getQuizClient();
    const rooms = client.db('astron_workflow').collection('live_quiz_rooms');
    indexes ||= rooms.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(e => { indexes = null; throw e; });
    await indexes;
    if (body.action === 'create') {
      for (let attempt = 0; attempt < 5; attempt++) {
        const { room, hostToken } = createRoom(body);
        try {
          await rooms.insertOne(room);
          return res.status(201).json({ token: hostToken, room: publicRoom(room, hostToken) });
        } catch (e) { if (e.code !== 11000) throw e; }
      }
      throw new Error('Room allocation failed');
    }
    requireQuiz(typeof body.code === 'string' && /^\d{6}$/.test(body.code), '请输入六位房间码');
    for (let attempt = 0; attempt < 20; attempt++) {
      const room = await rooms.findOne({ _id: body.code, expiresAt: { $gt: new Date() } });
      requireQuiz(room, '房间不存在或已过期（有效期 24 小时）', 404);
      if (body.action === 'state') return res.status(200).json({ room: publicRoom(room, body.token) });
      // Expiration is derived from server time, including when the host reconnects.
      if (room.phase === 'question' && Date.now() >= room.deadline) room.phase = 'reveal';
      const next = transition(room, body);
      if (body.action === 'join') {
        if (next.players.length === room.players.length) return res.status(200).json({ room: publicRoom(room, body.token) });
        const player = next.players[next.players.length - 1];
        const updated = await rooms.findOneAndUpdate({
          _id: room._id, phase: 'lobby', 'players.secret': { $ne: player.secret },
          'players.nameKey': { $ne: player.nameKey }, $expr: { $lt: [{ $size: '$players' }, 100] },
        }, { $push: { players: player }, $inc: { revision: 1 } }, { returnDocument: 'after' });
        if (updated) return res.status(200).json({ room: publicRoom(updated, body.token) });
        continue;
      }
      if (body.action === 'answer') {
        if (next.answers.length === room.answers.length) return res.status(200).json({ room: publicRoom(room, body.token) });
        const answer = next.answers[next.answers.length - 1];
        // Append independently per player: simultaneous answers do not contend on a room-wide revision.
        const updated = await rooms.findOneAndUpdate({
          _id: room._id, phase: 'question', index: room.index, deadline: { $gt: Date.now() },
          answers: { $not: { $elemMatch: { player: answer.player, index: answer.index } } },
        }, { $push: { answers: answer }, $inc: { revision: 1 } }, { returnDocument: 'after' });
        if (updated) return res.status(200).json({ room: publicRoom(updated, body.token) });
        continue;
      }
      const result = await rooms.replaceOne({ _id: room._id, revision: room.revision }, next);
      if (result.modifiedCount || result.matchedCount) return res.status(200).json({ room: publicRoom(next, body.token) });
      await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 90));
    }
    return res.status(409).json({ error: '房间繁忙，请重试' });
  } catch (e) {
    if (!e.status) console.error('Quiz service error:', e.name);
    return res.status(e.status || 503).json({ error: e.status ? e.message : '答题服务暂不可用，请稍后重试' });
  }
}
