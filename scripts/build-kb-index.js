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
function chunkMarkdown(filePath, content, titleOverride) {
  const title = titleOverride || deriveTitle(filePath, content);
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

// ---------------------------------------------------------------------------
// External GitHub docs ingestion: official iFLYTEK / Astron project docs.
// Fetched from raw.githubusercontent.com at build time (dev machine only —
// Vercel just downloads the finished index). Files that 404 are skipped, so
// the manifest can list optional translations/dirs without breaking the build.
// ---------------------------------------------------------------------------

const GITHUB_BRANCH = 'main';
const GITHUB_DOCS = [
  { repo: 'iflytek/astron-agent', label: 'Astron Agent', files: [
    ['README.md', '项目总览'],
    ['FAQ.md', '高频问题汇总'],
    ['CONTRIBUTING.md', '贡献指南'],
    ['GOVERNANCE.md', '治理规范'],
    ['GOVERNANCE-zh.md', '治理规范（中文）'],
    ['AGENTS.md', 'Agent 定义与规范'],
    ['docs/DEPLOYMENT_GUIDE.md', '标准部署指南'],
    ['docs/DEPLOYMENT_GUIDE_zh.md', '标准部署指南（中文）'],
    ['docs/DEPLOYMENT_GUIDE_WITH_AUTH.md', '含鉴权部署'],
    ['docs/DEPLOYMENT_GUIDE_WITH_AUTH_zh.md', '含鉴权部署（中文）'],
    ['docs/DEPLOYMENT_GUIDE_WITH_AUTH_RPA.md', '含 RPA 的鉴权部署'],
    ['docs/DEPLOYMENT_GUIDE_WITH_AUTH_RPA_zh.md', '含 RPA 的鉴权部署（中文）'],
    ['docs/DEPLOYMENT_FAQ_zh.md', '部署常见问题'],
    ['docs/CONFIGURATION.md', '配置项说明'],
    ['docs/CONFIGURATION_zh.md', '配置项说明（中文）'],
    ['docs/PROJECT_MODULES.md', '模块架构说明'],
    ['docs/PROJECT_MODULES_zh.md', '模块架构说明（中文）'],
    ['faq/setup.md', '安装配置 FAQ'],
    ['faq/config.md', '配置相关 FAQ'],
    ['faq/features.md', '功能特性 FAQ'],
    ['faq/models.md', '模型接入 FAQ'],
    ['faq/troubleshooting.md', '故障排查 FAQ'],
  ]},
  { repo: 'iflytek/astron-rpa', label: 'Astron RPA', files: [
    ['README.md', '项目总览'],
    ['README.zh.md', '项目总览（中文）'],
    ['FAQ.md', '高频问题汇总'],
    ['FAQ.zh.md', '高频问题汇总（中文）'],
    ['BUILD_GUIDE.md', '构建指南'],
    ['BUILD_GUIDE.zh.md', '构建指南（中文）'],
    ['docs/devel/zh-CN/README.md', '开发者指南（中文）'],
    ['docs/devel/en-US/README.md', '开发者指南（英文）'],
  ]},
  { repo: 'iflytek/skillhub', label: 'SkillHub', files: [
    ['README.md', '项目总览'],
    ['README_zh.md', '项目总览（中文）'],
    ['docs/skillhub/introduction.md', '产品介绍'],
    ['docs/skillhub/quickstart.md', '快速上手'],
    ['docs/skillhub/faq.md', 'FAQ'],
    ['docs/skillhub/en/faq.md', 'FAQ（英文）'],
    ['docs/skillhub/guide/skill-publish.md', '技能发布流程'],
    ['docs/skillhub/guide/skill-discovery.md', '技能发现'],
    ['docs/skillhub/guide/namespace.md', '命名空间管理'],
    ['docs/skillhub/guide/review.md', '审核流程'],
    ['docs/skillhub/guide/cli.md', 'CLI 工具'],
    ['docs/skillhub/guide/kubernetes.md', 'Kubernetes 部署'],
    ['docs/00-product-direction.md', '产品方向'],
    ['docs/01-system-architecture.md', '系统架构'],
    ['docs/06-api-design.md', 'API 设计'],
    ['docs/07-skill-protocol.md', 'Skill 协议规范'],
    ['docs/09-deployment.md', '部署指南'],
    ['docs/openclaw-integration.md', '与 OpenClaw 集成'],
    ['docs/openclaw-integration-en.md', '与 OpenClaw 集成（英文）'],
  ]},
  { repo: 'iflytek/astronclaw-tutorial', label: 'AstronClaw 教程', files: [
    ['docs/guide/astronclaw/introduction.md', 'AstronClaw 产品介绍'],
    ['docs/guide/astronclaw/getting-started.md', 'AstronClaw 快速开始'],
    ['docs/guide/astronclaw/skills.md', 'AstronClaw 技能使用'],
    ['docs/guide/astronclaw/channels.md', 'AstronClaw 渠道配置'],
    ['docs/guide/astronclaw/scenarios.md', 'AstronClaw 使用场景'],
    ['docs/guide/astronclaw/billing.md', 'AstronClaw 计费说明'],
    ['docs/guide/astronclaw/faq.md', 'AstronClaw FAQ'],
    ['docs/guide/loomy/introduction.md', 'Loomy 产品介绍'],
    ['docs/guide/loomy/quick-start.md', 'Loomy 快速开始'],
    ['docs/guide/loomy/models.md', 'Loomy 模型配置'],
    ['docs/guide/loomy/toolbox.md', 'Loomy 工具箱'],
    ['docs/guide/loomy/scheduled-tasks.md', 'Loomy 定时任务'],
    ['docs/guide/loomy/remote-control.md', 'Loomy 远程控制'],
    ['docs/guide/loomy/scenarios.md', 'Loomy 使用场景'],
    ['docs/guide/loomy/faq.md', 'Loomy FAQ'],
  ]},
  { repo: 'harnessclaw/harnessclaw', label: 'HarnessClaw 桌面端', files: [
    ['README.md', '项目总览'],
    ['README_zh.md', '项目总览（中文）'],
    ['CHANGELOG.md', '版本更新记录'],
    ['CHANGELOG_zh.md', '版本更新记录（中文）'],
    ['docs/db.md', '数据库设计'],
    ['docs/architecture/user-question-sequence.md', '用户提问序列架构'],
  ]},
  { repo: 'harnessclaw/harnessclaw-engine', label: 'HarnessClaw 引擎', files: [
    ['README.md', '项目总览'],
    ['README_zh.md', '项目总览（中文）'],
    ['CHANGELOG.md', '版本更新记录'],
    ['docs/api/console-api.md', 'Console API 文档'],
    ['docs/api/tools-catalog.md', '工具目录'],
    ['docs/protocols/websocket.md', 'WebSocket 协议'],
  ]},
  { repo: 'iflytek/iFly-Skills', label: '讯飞官方技能包', files: [
    ['README.md', '技能集总览'],
    ['README_zh.md', '技能集总览（中文）'],
    ['ifly-hyper-tts/README.md', '超拟人语音合成'],
    ['ifly-hyper-tts/README_zh.md', '超拟人语音合成（中文）'],
    ['ifly-speed-transcription/README.md', '快速语音转写'],
    ['ifly-speed-transcription/README_zh.md', '快速语音转写（中文）'],
    ['ifly-ocr-invoice/README.md', '发票 OCR'],
    ['ifly-ocr-invoice/README_zh.md', '发票 OCR（中文）'],
    ['ifly-pdf-image-ocr/README.md', 'PDF/图片 OCR'],
    ['ifly-pdf-image-ocr/README_zh.md', 'PDF/图片 OCR（中文）'],
    ['ifly-image-understanding/README.md', '图像理解'],
    ['ifly-image-understanding/README_zh.md', '图像理解（中文）'],
    ['ifly-translate/README.md', '文本翻译'],
    ['ifly-translate/README_zh.md', '文本翻译（中文）'],
    ['ifly-text-proofread/README.md', '文本纠错'],
    ['ifly-text-proofread/README_zh.md', '文本纠错（中文）'],
    ['ifly-video-translate/README.md', '视频翻译'],
    ['ifly-video-translate/README_zh.md', '视频翻译（中文）'],
    ['ifly-voiceclone-tts/README.md', '声音克隆 TTS'],
    ['ifly-voiceclone-tts/README_zh.md', '声音克隆 TTS（中文）'],
    ['ifly-contract-intelligence-review/README.md', '合同智能审核'],
    ['ifly-contract-intelligence-review/README_zh.md', '合同智能审核（中文）'],
  ]},
];

// Drop the leading H1 so chunkMarkdown doesn't treat the whole README as
// skippable preamble; the human-readable title comes from titleOverride.
function stripFirstH1(md) {
  return md.replace(/^#\s+.+$/m, '').replace(/^\s+/, '');
}

const FETCH_TIMEOUT_MS = 15_000;
const FETCH_ATTEMPTS = 4;

// raw.githubusercontent.com is unreliable from some networks, so each file is
// tried against multiple mirrors (jsDelivr CDN is usually reachable) with a few
// retries and a per-attempt timeout. A 404 on a mirror is treated as "this file
// doesn't exist" and short-circuits (no point retrying optional translations).
function mirrorsFor(repo, file) {
  // jsDelivr CDN first — it's reliably reachable where raw.githubusercontent.com
  // often times out; raw is kept only as a secondary fallback.
  return [
    `https://cdn.jsdelivr.net/gh/${repo}@${GITHUB_BRANCH}/${file}`,
    `https://raw.githubusercontent.com/${repo}/${GITHUB_BRANCH}/${file}`,
  ];
}

async function fetchOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'astron-kb-builder' }, signal: controller.signal });
    if (res.status === 404) return { notFound: true };
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return { text: await res.text() };
  } catch (e) {
    return { error: e?.name === 'AbortError' ? 'timeout' : (e?.message || String(e)) };
  } finally {
    clearTimeout(timer);
  }
}

// Returns the file text, or null if it genuinely 404s / is unreachable.
async function fetchDoc(repo, file) {
  const urls = mirrorsFor(repo, file);
  for (let attempt = 0; attempt < FETCH_ATTEMPTS; attempt++) {
    for (const url of urls) {
      const r = await fetchOnce(url);
      if (r.text != null) return r.text;
      if (r.notFound) return null; // file doesn't exist — don't keep retrying
    }
    await new Promise((res) => setTimeout(res, 400 * (attempt + 1)));
  }
  return null;
}

async function fetchGithubChunks() {
  const out = [];
  let okFiles = 0;
  let missFiles = 0;
  for (const { repo, label, files } of GITHUB_DOCS) {
    for (const [file, desc] of files) {
      const md = await fetchDoc(repo, file);
      if (!md || md.trim().length < MIN_CHUNK_CHARS) {
        console.warn(`[gh] skipped ${repo}/${file}`);
        missFiles++;
        continue;
      }
      const title = `${label} - ${desc}`;
      for (const c of chunkMarkdown(`${repo}/${file}`, stripFirstH1(md), title)) {
        c.section = c.section || file; // fall back to the file path for context
        out.push(c);
      }
      okFiles++;
    }
  }
  return { okFiles, missFiles, chunks: out };
}

async function main() {
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

  // 3) Official GitHub project docs (fetched at build time; failures are
  // non-fatal so the index still builds from local sources offline).
  let ghCount = 0;
  let ghFiles = 0;
  try {
    const gh = await fetchGithubChunks();
    for (const c of gh.chunks) addChunk(c);
    ghCount = chunks.length - faqCount - qaCount;
    ghFiles = gh.okFiles;
    console.log(`GitHub docs: ${gh.okFiles} files ok, ${gh.missFiles} skipped -> ${ghCount} chunks (after dedup)`);
  } catch (e) {
    console.warn(`[gh] GitHub docs stage failed: ${e?.message || e} — building without them`);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    sourceRoot,
    fileCount: files.length + qa.files + ghFiles,
    count: chunks.length,
    chunks,
  };
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(`FAQ/cases: ${files.length} files -> ${faqCount} chunks`);
  console.log(`QA extracts: ${qa.files} files -> ${qaCount} chunks (after filtering + dedup)`);
  console.log(`GitHub docs: ${ghFiles} files -> ${ghCount} chunks`);
  console.log(`Total: ${chunks.length} chunks`);
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((e) => {
  console.error('Build failed:', e?.message || e);
  process.exit(1);
});
