import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoom, transition, publicRoom, token } from '../../api/_lib/quiz-core.js';

const questions = [{ text: '2 + 2 = ?', options: ['4', '3', '2', '1'], correct: 0, seconds: 20 }];
function fixture() {
  const { room, hostToken } = createRoom({ questions }, 1000);
  const player = token();
  const joined = transition(room, { action: 'join', token: player, name: 'Alice' }, 1000);
  const started = transition(joined, { action: 'next', token: hostToken, revision: joined.revision }, 1000);
  return { room: started, hostToken, player };
}
test('server scores speed, hides answers and current scores, reveals and finishes', () => {
  const f = fixture();
  const answered = transition(f.room, { action: 'answer', token: f.player, index: 0, choice: 0 }, 11000);
  assert.equal(answered.answers[0].score, 750);
  const live = publicRoom(answered, f.player, 11000);
  assert.equal(live.question.correct, undefined);
  assert.equal(live.leaderboard[0].score, 0);
  assert.equal(live.answered, true);
  assert.ok(!JSON.stringify(live).includes(f.hostToken));
  assert.ok(!JSON.stringify(live).includes('secret'));
  const revealed = transition(answered, { action: 'reveal', token: f.hostToken, revision: answered.revision }, 12000);
  assert.equal(publicRoom(revealed, f.player, 12000).leaderboard[0].score, 750);
  assert.equal(publicRoom(revealed, f.player, 12000).question.correct, 0);
  assert.equal(transition(revealed, { action: 'next', token: f.hostToken, revision: revealed.revision }).phase, 'finished');
});
test('duplicates are idempotent; late, forged and wrong-question answers rejected', () => {
  const f = fixture();
  const first = transition(f.room, { action: 'answer', token: f.player, index: 0, choice: 1 }, 2000);
  assert.equal(transition(first, { action: 'answer', token: f.player, index: 0, choice: 0 }, 3000).answers.length, 1);
  assert.equal(first.answers[0].score, 0);
  assert.throws(() => transition(f.room, { action: 'answer', token: f.player, index: 0, choice: 0 }, 21000));
  assert.throws(() => transition(f.room, { action: 'answer', token: f.player, index: 1, choice: 0 }, 2000));
  assert.throws(() => transition(f.room, { action: 'reveal', token: f.player, revision: f.room.revision }));
  assert.throws(() => publicRoom(f.room, 'forged'));
  assert.equal(publicRoom(f.room, f.player, 21000).phase, 'reveal');
});
test('validates input, blocks late joins and stale host controls', () => {
  assert.throws(() => createRoom({ questions: [] }));
  assert.throws(() => createRoom({ questions: [{ ...questions[0], seconds: 0 }] }));
  const f = fixture();
  assert.throws(() => transition(f.room, { action: 'join', token: token(), name: 'Bob' }));
  assert.throws(() => transition(f.room, { action: 'reveal', token: f.hostToken, revision: -1 }));
});
test('equal scores share the same rank', () => {
  const { room, hostToken } = createRoom({ questions });
  const a = transition(room, { action: 'join', token: token(), name: 'A' });
  const b = transition(a, { action: 'join', token: token(), name: 'B' });
  assert.deepEqual(publicRoom(b, hostToken).leaderboard.map(p => p.rank), [1, 1]);
});
