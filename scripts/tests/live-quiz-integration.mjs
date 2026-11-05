// Opt-in integration check: creates one temporary room and deletes only that room.
import assert from 'node:assert/strict';
import handler from '../../api/quiz.js';
import { getQuizClient } from '../../api/_lib/quiz-db.js';
import { token } from '../../api/_lib/quiz-core.js';
async function request(body) {
  let status;
  let data;
  await handler({ method: 'POST', body }, { setHeader() {}, status(s) { status = s; return this; }, json(d) { data = d; } });
  assert.ok(status < 300, JSON.stringify({ status, data }));
  return data;
}
let code;
try {
  const created = await request({ action: 'create', title: 'Temporary automated quiz check', questions: [{ text: '2 + 2?', options: ['4', '3', '2', '1'], correct: 0, seconds: 120 }] });
  code = created.room.code;
  const players = Array.from({ length: 20 }, (_, i) => ({ name: `Test ${i}`, token: token() }));
  await Promise.all(players.map(p => request({ action: 'join', code, ...p })));
  const lobby = await request({ action: 'state', code, token: created.token });
  assert.equal(lobby.room.leaderboard.length, 20);
  await request({ action: 'next', code, token: created.token, revision: lobby.room.revision });
  await Promise.all(players.map(p => request({ action: 'answer', code, token: p.token, index: 0, choice: 0 })));
  const live = await request({ action: 'state', code, token: created.token });
  assert.equal(live.room.answerCount, 20);
  assert.equal(live.room.question.correct, undefined);
  assert.ok(live.room.leaderboard.every(p => p.score === 0));
  await Promise.all(players.slice(0, 5).map(p => request({ action: 'answer', code, token: p.token, index: 0, choice: 1 })));
  const state = await request({ action: 'state', code, token: created.token });
  assert.equal(state.room.answerCount, 20);
  const reveal = await request({ action: 'reveal', code, token: created.token, revision: state.room.revision });
  assert.ok(reveal.room.leaderboard.every(p => p.score >= 500));
  const end = await request({ action: 'next', code, token: created.token, revision: reveal.room.revision });
  assert.equal(end.room.phase, 'finished');
  console.log('PASS: 20 concurrent joins + answers, retries, secret filtering, scoring, final leaderboard');
} finally {
  try {
    const client = await getQuizClient();
    if (code) await client.db('astron_workflow').collection('live_quiz_rooms').deleteOne({ _id: code });
    await client.close();
  } catch { console.error('Database connection unavailable; cleanup could not connect.'); }
}
