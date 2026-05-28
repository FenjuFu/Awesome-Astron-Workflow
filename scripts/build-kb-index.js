// Build the AI Chat knowledge-base index from the qiwei-chat-records corpus.
//
// Source: the curated "可直接训练" subset (FAQ + user cases + QA extracts) of
// the FenjuFu/qiwei-chat-records repo. Clone it first, then point this script
// at the "01_可直接训练" directory:
//
//   git clone --filter=blob:none --no-checkout https://github.com/FenjuFu/qiwei-chat-records <dir>
//   cd <dir> && git sparse-checkout set "给同事_机器人训练交付版/01_可直接训练" && git checkout
//   node scripts/build-kb-index.js "<dir>/给同事_机器人训练交付版/01_可直接训练"
//
// Output: api/_lib/kb-index.json (committed; loaded by the chat retriever).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(REPO_ROOT, 'api', '_lib', 'kb-index.json');

const DEFAULT_SOURCE = 'D:/qiwei-kb-src/给同事_机器人训练交付版/01_可直接训练';
const sourceRoot = process.argv[2] || DEFAULT_SOURCE;

const MAX_CHUNK_CHARS = 1400;
const MIN_CHUNK_CHARS = 24;

// Only the high-value, deduped knowledge: FAQ docs + user cases. The raw QA
// extracts (03_问答提取原始产物) are noisy and largely duplicate the FAQ, and
// the priority doc is meta — both are excluded per README_交付说明.md guidance.
const EXCLUDE_DIR_RE = /03_问答提取原始产物/;
const EXCLUDE_FILE_RE = /(推荐训练素材优先级|README)/i;

function walkMarkdown(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIR_RE.test(entry.name)) continue;
      out.push(...walkMarkdown(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      if (EXCLUDE_FILE_RE.test(entry.name)) continue;
      out.push(full);
    }
  }
  return out;
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, '').trim();
}

// Derive a human-readable document title for citation/context.
function deriveTitle(filePath, content) {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  let name = path.basename(filePath, '.md');
  name = name.replace(/^群聊支持记录\s*-\s*/, '');
  name = name.replace(/\[[^\]]*\]/g, ''); // drop [10719663...] ids and [..@chatroom]
  const caseIdx = name.indexOf('用户案例');
  if (caseIdx >= 0) name = name.slice(caseIdx);
  return name.replace(/\s{2,}/g, ' ').trim();
}

// Split one markdown file into retrieval chunks.
function chunkMarkdown(filePath, content) {
  const title = deriveTitle(filePath, content);
  const lines = content.split(/\r?\n/);

  // Pass 1: break into heading-delimited blocks. A heading is `## ` .. `###### `.
  const blocks = [];
  let current = { heading: '', section: '', lines: [] };
  let section = ''; // nearest level-2 heading
  const headingRe = /^(#{2,6})\s+(.+?)\s*#*$/;
  for (const line of lines) {
    const m = line.match(headingRe);
    if (m) {
      if (current.lines.length || current.heading) blocks.push(current);
      const level = m[1].length;
      const text = stripHtml(m[2].trim());
      if (level === 2) section = text;
      current = { heading: text, section: level === 2 ? '' : section, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length || current.heading) blocks.push(current);

  // Pass 2: turn blocks into chunks, splitting bold-Q lists and oversized bodies.
  const chunks = [];
  for (const block of blocks) {
    const headingText = block.heading.trim();
    if (/^目录$|^table of contents$/i.test(headingText)) continue; // skip TOC
    const body = block.lines.join('\n').trim();
    if (!body && !headingText) continue;
    // Skip document preamble (H1 title + intro before the first section).
    if (!headingText && !block.section && /^#\s/.test(body)) continue;

    // Bold-question style: "**Q: ...**" with answers, multiple per section.
    const hasBoldQ = (body.match(/(^|\n)\s*\*\*Q[:：]/g) || []).length >= 1 && !/^Q[:：]/.test(headingText);
    if (hasBoldQ) {
      const parts = body.split(/(?=(?:^|\n)\s*\*\*Q[:：])/);
      for (const part of parts) {
        const t = part.trim();
        if (t.length >= MIN_CHUNK_CHARS) {
          pushChunk(chunks, filePath, title, block.section || headingText, headingText, t);
        }
      }
      continue;
    }

    const combined = headingText ? `${headingText}\n${body}` : body;
    if (combined.trim().length < MIN_CHUNK_CHARS) continue;

    if (combined.length <= MAX_CHUNK_CHARS) {
      pushChunk(chunks, filePath, title, block.section, headingText, combined.trim());
    } else {
      // Oversized: split by blank-line paragraphs, keep heading on each piece.
      const paras = body.split(/\n\s*\n/);
      let buf = headingText ? headingText + '\n' : '';
      for (const para of paras) {
        if ((buf + '\n' + para).length > MAX_CHUNK_CHARS && buf.trim().length >= MIN_CHUNK_CHARS) {
          pushChunk(chunks, filePath, title, block.section, headingText, buf.trim());
          buf = headingText ? headingText + '\n' + para : para;
        } else {
          buf += (buf ? '\n' : '') + para;
        }
      }
      if (buf.trim().length >= MIN_CHUNK_CHARS) {
        pushChunk(chunks, filePath, title, block.section, headingText, buf.trim());
      }
    }
  }
  return chunks;
}

function pushChunk(chunks, filePath, title, section, heading, text) {
  chunks.push({ filePath, title, section: section || '', heading: heading || '', text });
}

function normalizeForDedup(text) {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// QA-extract ingestion (03_问答提取原始产物): raw group-chat Q&A pairs.
// These are noisier than the curated FAQ, so they get a dedicated parser with
// cleaning + quality filtering rather than the generic markdown chunker.
// ---------------------------------------------------------------------------

const QA_DIR_NAME = '03_问答提取原始产物';
const STOP_ANSWER_RE = /^(?:好的?|收到|谢谢\S*|感谢\S*|嗯+|哦+|啊+|是的?|对的?|可以了?|行|好嘞|在的?|稍等|没问题|明白了?|了解了?|ok|okay|👍+|[\s、。，！？!?.~…]+)$/i;
const NOISE_TOKEN_RE = /\[(?:图片|表情|动画表情|文件|链接|视频|语音|聊天记录|位置|名片|引用|emoji)\]/g;

function cleanQaText(s) {
  if (!s) return '';
  let t = String(s);
  t = t.replace(NOISE_TOKEN_RE, ' ');
  t = t.replace(/-{3,}/g, ' ');          // quoted-reply separators "------"
  t = t.replace(/[“”"]/g, ' ');          // quote marks wrapping replies
  t = t.replace(/^[\s　]*@\S+[:：]?/gm, ' '); // leading @mentions
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function qaPairOk(q, a) {
  if (!q || !a) return false;
  if (a.length < 5 || STOP_ANSWER_RE.test(a)) return false;
  if ((q + a).length < 16) return false;
  if (!/[一-鿿a-zA-Z0-9]/.test(a)) return false; // answer must carry real content
  // Drop mislabeled "echo" pairs where the answer just repeats the question
  // (common in quoted-reply extraction).
  const nq = q.replace(/\s/g, '');
  const na = a.replace(/\s/g, '');
  if (na.length >= 4 && (nq.includes(na) || na.includes(nq))) return false;
  return true;
}

function qaTitle(filePath) {
  let n = path.basename(filePath).replace(/\.(md|txt|json)$/i, '');
  n = n.replace(/^群聊支持记录\s*-\s*/, '');
  n = n.replace(/\[[^\]]*\]/g, '');
  n = n.replace(/-\s*(extracted_qa_pairs|extracted_qa|qa_pairs|1688_qa)\s*$/i, '');
  n = n.replace(/\s{2,}/g, ' ').trim();
  return `${n || '群聊'}（群聊问答）`;
}

// Parse one QA-extract file into raw {q, a} pairs (pre-cleaning).
function parseQaPairs(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath);
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  if (ext === '.json') {
    if (/Co_Construction/i.test(name)) return []; // survey form, not Q&A (and has NaN)
    let arr;
    try { arr = JSON.parse(content); } catch { return []; }
    if (!Array.isArray(arr)) return [];
    return arr.map((o) => ({ q: o && o.question, a: o && o.answer }));
  }

  if (ext === '.txt') {
    if (/extracted_qa_pairs\.txt$/i.test(name)) return []; // duplicate of the .json
    const pairs = [];
    for (const block of content.split(/\n-{5,}\n?/)) {
      const m = block.match(/Q[:：]\s*([\s\S]*?)\nA[:：]\s*([\s\S]*)/);
      if (m) pairs.push({ q: m[1], a: m[2] });
    }
    return pairs;
  }

  if (ext === '.md') {
    const pairs = [];
    for (const block of content.split(/\n-{3,}\n/)) {
      const qm = block.match(/(?:\*\*问题\*\*|###\s*Q)[:：]?\s*([\s\S]*?)(?=\*\*回答者\*\*|\*\*回答\*\*|###\s*A|$)/);
      const am = block.match(/(?:\*\*回答\*\*|###\s*A)[:：]?\s*([\s\S]*?)(?=\*Source|\*\*提问者\*\*|##\s|$)/);
      if (qm || am) pairs.push({ q: qm && qm[1], a: am && am[1] });
    }
    return pairs;
  }

  return [];
}

function findQaDir(root) {
  const direct = path.join(root, QA_DIR_NAME);
  if (fs.existsSync(direct)) return direct;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const found = findQaDir(path.join(root, entry.name));
      if (found) return found;
    }
  }
  return null;
}

function collectQaChunks() {
  const qaDir = findQaDir(sourceRoot);
  if (!qaDir) return { files: 0, chunks: [] };
  const out = [];
  let files = 0;
  for (const entry of fs.readdirSync(qaDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!/\.(md|txt|json)$/i.test(entry.name)) continue;
    const filePath = path.join(qaDir, entry.name);
    const title = qaTitle(filePath);
    let kept = 0;
    for (const { q, a } of parseQaPairs(filePath)) {
      const cq = cleanQaText(q);
      const ca = cleanQaText(a);
      if (!qaPairOk(cq, ca)) continue;
      out.push({ title, section: '群聊问答提取', heading: cq.slice(0, 40), text: `问：${cq}\n答：${ca}` });
      kept++;
    }
    if (kept > 0) files++;
  }
  return { files, chunks: out };
}

function main() {
  if (!fs.existsSync(sourceRoot)) {
    console.error(`Source directory not found: ${sourceRoot}`);
    console.error('Pass the path to "01_可直接训练" as the first argument.');
    process.exit(1);
  }

  const files = walkMarkdown(sourceRoot);
  const seen = new Set();
  const chunks = [];
  let id = 0;
  const addChunk = (c) => {
    const key = normalizeForDedup(c.text);
    if (seen.has(key)) return false; // drop exact-normalized duplicates across files
    seen.add(key);
    chunks.push({ id: `kb-${id++}`, title: c.title, section: c.section, heading: c.heading, text: c.text });
    return true;
  };

  // 1) Curated FAQ + user cases (generic markdown chunker).
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const c of chunkMarkdown(file, content)) addChunk(c);
  }
  const faqCount = chunks.length;

  // 2) Group-chat QA extracts (dedicated parser + quality filter).
  const qa = collectQaChunks();
  for (const c of qa.chunks) addChunk(c);
  const qaCount = chunks.length - faqCount;

  const out = {
    generatedAt: new Date().toISOString(),
    sourceRoot,
    fileCount: files.length + qa.files,
    count: chunks.length,
    chunks,
  };
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(`FAQ/cases: ${files.length} files -> ${faqCount} chunks`);
  console.log(`QA extracts: ${qa.files} files -> ${qaCount} chunks (after filtering + dedup)`);
  console.log(`Total: ${chunks.length} chunks`);
  console.log(`Wrote ${OUT_PATH}`);
}

main();
