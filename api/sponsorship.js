import { getQuizClient } from './_lib/quiz-db.js';
import { createSponsorshipHandler } from './_lib/sponsorship-core.js';

let indexes;
async function consumeAttempt(subject) {
  const client = await getQuizClient();
  const collection = client.db().collection('api_sponsorship_attempts');
  if (!indexes) indexes = collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    .catch(error => { indexes = undefined; throw error; });
  await indexes;
  const window = Math.floor(Date.now() / 900000);
  const id = `${subject}:${window}`;
  let attempt;
  try {
    attempt = await collection.findOneAndUpdate({ _id: id }, {
      $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * 900000) },
    }, { upsert: true, returnDocument: 'after' });
  } catch (error) {
    if (error.code !== 11000) throw error;
    attempt = await collection.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { returnDocument: 'after' });
  }
  return Boolean(attempt && attempt.count <= 10);
}

export default createSponsorshipHandler({ consumeAttempt });
