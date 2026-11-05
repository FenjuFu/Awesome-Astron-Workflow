import { randomBytes, randomInt, createHash } from 'node:crypto';

export const token = () => randomBytes(24).toString('hex');
export const digest = value => createHash('sha256').update(String(value || '')).digest('hex');
export function requireQuiz(ok, message, status = 400) {
  if (!ok) throw Object.assign(new Error(message), { status });
}
export function createRoom(input, now = Date.now()) {
  requireQuiz(Array.isArray(input.questions) && input.questions.length > 0 && input.questions.length <= 30, '请设置 1–30 道题');
  const questions = input.questions.map(q => {
    requireQuiz(typeof q.text === 'string' && q.text.trim().length > 0 && q.text.length <= 300, '题目需为 1–300 字');
    requireQuiz(Array.isArray(q.options) && q.options.length === 4 && q.options.every(o => typeof o === 'string' && o.trim() && o.length <= 120), '每题需要四个非空选项，每项最多 120 字');
    requireQuiz(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4, '请选择正确答案');
    requireQuiz(Number.isInteger(q.seconds) && q.seconds >= 10 && q.seconds <= 120, '每题限时 10–120 秒');
    return { text: q.text.trim(), options: q.options.map(o => o.trim()), correct: q.correct, seconds: q.seconds };
  });
  const hostToken = token();
  return { hostToken, room: { _id: String(randomInt(100000, 1000000)), title: String(input.title || '星辰答题派对').slice(0, 80), host: digest(hostToken), questions, players: [], answers: [], phase: 'lobby', index: -1, deadline: 0, revision: 0, expiresAt: new Date(now + 86400000) } };
}
export function transition(room, input, now = Date.now()) {
  const r = structuredClone(room);
  if (input.action === 'join') {
    const existing = r.players.find(p => p.secret === digest(input.token));
    if (existing) return r;
    requireQuiz(r.phase === 'lobby', '答题已开始，暂时不能加入', 409);
    requireQuiz(r.players.length < 100, '房间已满（100 人）');
    requireQuiz(typeof input.name === 'string' && input.name.trim().length > 0 && input.name.trim().length <= 20, '昵称需为 1–20 字');
    requireQuiz(!r.players.some(p => p.name.toLowerCase() === input.name.trim().toLowerCase()), '昵称已被使用');
    requireQuiz(typeof input.token === 'string' && /^[a-f0-9]{48}$/.test(input.token), '加入凭据无效');
    r.players.push({ id: token().slice(0, 16), secret: digest(input.token), name: input.name.trim(), nameKey: input.name.trim().toLowerCase() });
  } else if (input.action === 'answer') {
    const player = r.players.find(p => p.secret === digest(input.token));
    requireQuiz(player, '请先加入房间', 403);
    requireQuiz(r.phase === 'question' && now < r.deadline && input.index === r.index, '本题已结束', 409);
    requireQuiz(Number.isInteger(input.choice) && input.choice >= 0 && input.choice < 4, '选项无效');
    if (r.answers.some(a => a.player === player.id && a.index === r.index)) return r;
    const q = r.questions[r.index];
    const correct = q.correct === input.choice;
    r.answers.push({ player: player.id, index: r.index, choice: input.choice, correct, score: correct ? 500 + Math.round(500 * Math.min(1, (r.deadline - now) / (q.seconds * 1000))) : 0 });
  } else {
    requireQuiz(r.host === digest(input.token), '只有主持人可操作', 403);
    requireQuiz(input.revision === r.revision, '状态已变化，请重试', 409);
    if (input.action === 'next') {
      requireQuiz(r.phase === 'lobby' || r.phase === 'reveal', '请先公布本题结果', 409);
      requireQuiz(r.players.length > 0, '等待至少一名玩家加入');
      r.index++;
      r.phase = r.index >= r.questions.length ? 'finished' : 'question';
      if (r.phase === 'question') r.deadline = now + r.questions[r.index].seconds * 1000;
    } else if (input.action === 'reveal') {
      requireQuiz(r.phase === 'question', '当前没有进行中的题目', 409);
      r.phase = 'reveal';
    } else requireQuiz(false, '未知操作');
  }
  r.revision++;
  return r;
}
export function publicRoom(room, secret, now = Date.now()) {
  const isHost = room.host === digest(secret);
  const me = room.players.find(p => p.secret === digest(secret));
  requireQuiz(isHost || me, '房间凭据无效，请重新加入', 403);
  const phase = room.phase === 'question' && now >= room.deadline ? 'reveal' : room.phase;
  const q = room.questions[room.index];
  const answers = room.answers.filter(a => a.index === room.index);
  // Scores for a live question stay hidden until reveal, so they cannot expose its answer.
  const leaderboard = room.players.map(p => ({ id: p.id, name: p.name, score: room.answers.filter(a => a.player === p.id && (phase !== 'question' || a.index < room.index)).reduce((s, a) => s + a.score, 0) })).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  let rank = 0;
  return { code: room._id, title: room.title, phase, revision: room.revision, index: room.index, total: room.questions.length, deadline: room.deadline, serverNow: now, isHost, me: me?.id, answered: answers.some(a => a.player === me?.id), myChoice: answers.find(a => a.player === me?.id)?.choice, answerCount: answers.length, leaderboard: leaderboard.map((p, i) => { if (i === 0 || p.score !== leaderboard[i - 1].score) rank = i + 1; return { ...p, rank }; }), question: q ? { text: q.text, options: q.options, ...(phase !== 'question' ? { correct: q.correct, counts: q.options.map((_, i) => answers.filter(a => a.choice === i).length) } : {}) } : null };
}
