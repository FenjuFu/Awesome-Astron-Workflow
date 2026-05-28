// Download the knowledge-base index from the private Supabase Storage bucket
// to api/_lib/kb-index.json. Runs automatically before `npm run build` (as the
// "prebuild" hook), so Vercel injects the index into the deployment bundle.
//
// Resilient by design: if storage/env is unavailable it keeps any existing
// local index, or writes an empty one — a failed fetch must never break the
// build (the chat just runs without KB grounding until the index is restored).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.resolve(__dirname, '..', 'api', '_lib', 'kb-index.json');
const BUCKET = process.env.KB_STORAGE_BUCKET || 'kb';
const OBJECT = process.env.KB_STORAGE_PATH || 'kb-index.json';
const EMPTY = { generatedAt: null, sourceRoot: null, fileCount: 0, count: 0, chunks: [] };

function fallback(reason) {
  if (fs.existsSync(INDEX_PATH)) {
    console.warn(`[kb] ${reason} — keeping existing local kb-index.json`);
    return;
  }
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(EMPTY), 'utf8');
  console.warn(`[kb] ${reason} — wrote empty index (chat runs without KB grounding)`);
}

async function main() {
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallback('Supabase env not set');
  }
  let supabaseAdmin;
  try {
    ({ supabaseAdmin } = await import('../api/_lib/supabase-admin.js'));
  } catch (e) {
    return fallback(`cannot load supabase client: ${e?.message || e}`);
  }
  try {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(OBJECT);
    if (error || !data) return fallback(`download failed: ${error?.message || 'no data'}`);
    const buf = Buffer.from(await data.arrayBuffer());
    const meta = JSON.parse(buf.toString('utf8')); // validate JSON before writing
    fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
    fs.writeFileSync(INDEX_PATH, buf);
    console.log(`[kb] fetched kb-index.json (${meta.count} chunks) from private bucket "${BUCKET}"`);
  } catch (e) {
    return fallback(`fetch error: ${e?.message || e}`);
  }
}

main();
