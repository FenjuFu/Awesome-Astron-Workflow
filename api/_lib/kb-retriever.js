// Dependency-free lexical retriever over the knowledge-base index.
// The MaaS coding gateway exposes no embeddings endpoint, so retrieval uses
// BM25 over CJK character bigrams + ASCII word tokens — robust for the mixed
// Chinese/English FAQ corpus without any tokenizer dependency.

import fs from 'node:fs';

// Load via fs (not a JSON import attribute) so it works identically under the
// Vite dev server and Vercel's function file tracer, regardless of Node version.
const kbIndex = JSON.parse(fs.readFileSync(new URL('./kb-index.json', import.meta.url), 'utf8'));

const K1 = 1.5;
const B = 0.75;
const CJK_RE = /[㐀-䶿一-鿿]/;

function tokenize(text) {
  const tokens = [];
  const lower = String(text || '').toLowerCase();
  // ASCII alphanumeric words (rpa, docker, 404, 8000, casdoor, ...).
  for (const m of lower.matchAll(/[a-z0-9]{2,}/g)) tokens.push(m[0]);
  // CJK: bigrams within each run of CJK characters (and the unigram for 1-char runs).
  let run = '';
  const flush = () => {
    if (!run) return;
    if (run.length === 1) tokens.push(run);
    else for (let i = 0; i < run.length - 1; i++) tokens.push(run.slice(i, i + 2));
    run = '';
  };
  for (const ch of lower) {
    if (CJK_RE.test(ch)) run += ch;
    else flush();
  }
  flush();
  return tokens;
}

// Build the BM25 index once per process.
const docs = kbIndex.chunks.map((chunk) => {
  const tokens = tokenize(`${chunk.title} ${chunk.section} ${chunk.heading} ${chunk.text}`);
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return { chunk, tf, length: tokens.length };
});

const df = new Map();
for (const d of docs) for (const term of d.tf.keys()) df.set(term, (df.get(term) || 0) + 1);

const N = docs.length || 1;
const avgdl = docs.reduce((s, d) => s + d.length, 0) / N || 1;

function idf(term) {
  const n = df.get(term) || 0;
  return Math.log(1 + (N - n + 0.5) / (n + 0.5));
}

/**
 * Retrieve the top-k knowledge-base chunks for a query.
 * @returns {Array<{chunk: object, score: number}>}
 */
export function retrieve(query, k = 4) {
  const qTerms = [...new Set(tokenize(query))];
  if (qTerms.length === 0) return [];
  const scored = [];
  for (const d of docs) {
    let score = 0;
    for (const term of qTerms) {
      const tf = d.tf.get(term);
      if (!tf) continue;
      const denom = tf + K1 * (1 - B + (B * d.length) / avgdl);
      score += idf(term) * ((tf * (K1 + 1)) / denom);
    }
    if (score > 0) scored.push({ chunk: d.chunk, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

export const kbMeta = { count: N, generatedAt: kbIndex.generatedAt };
