// Upload the built knowledge-base index to a PRIVATE Supabase Storage bucket.
// The index itself is gitignored (it contains group-chat content) and is
// injected into the deployment at build time by scripts/fetch-kb-index.js.
//
//   npm run kb:upload      (rebuild first with: npm run kb:build)
//   npm run build-kb       (rebuild + upload in one step)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabaseAdmin } from '../api/_lib/supabase-admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.resolve(__dirname, '..', 'api', '_lib', 'kb-index.json');
const BUCKET = process.env.KB_STORAGE_BUCKET || 'kb';
const OBJECT = process.env.KB_STORAGE_PATH || 'kb-index.json';

async function ensureBucket() {
  const { data, error } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!error && data) return;
  const { error: createErr } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: '20MB',
  });
  if (createErr && !/already exists/i.test(createErr.message || '')) throw createErr;
}

async function main() {
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env. Run via: node --env-file=.env scripts/upload-kb-index.js');
    process.exit(1);
  }
  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`Index not found: ${INDEX_PATH}\nRun "npm run kb:build" first.`);
    process.exit(1);
  }

  const buf = fs.readFileSync(INDEX_PATH);
  const meta = JSON.parse(buf.toString('utf8'));

  await ensureBucket();
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(OBJECT, buf, {
    contentType: 'application/json',
    upsert: true,
    cacheControl: '0',
  });
  if (error) throw error;

  console.log(`Uploaded "${OBJECT}" (${(buf.length / 1024).toFixed(0)} KB, ${meta.count} chunks) to private bucket "${BUCKET}".`);
}

main().catch((e) => {
  console.error('Upload failed:', e?.message || e);
  process.exit(1);
});
