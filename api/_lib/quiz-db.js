import { MongoClient } from 'mongodb';

let connection;
export function getQuizClient() {
  if (!connection) {
    if (!process.env.MONGODB_URI) throw new Error('Quiz database is not configured');
    const client = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000, maxPoolSize: 10,
    });
    // A transient cold-start failure must not poison this instance permanently.
    connection = client.connect().catch(async error => {
      connection = undefined;
      await client.close().catch(() => {});
      throw error;
    });
  }
  return connection;
}
