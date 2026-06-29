# Knowledge Base (AI Chat 知识库源)

This directory is the **source of truth** for the `/chat` assistant's knowledge
base. It is **not a website route** and is never served to the browser — it is a
plain-Markdown corpus that the build step compiles into a retrieval index.

## How it feeds /chat

```
knowledge-base/  ──► scripts/build-kb-index.js  ──►  api/_lib/kb-index.json  ──►  api/_lib/kb-retriever.js (BM25)  ──►  /chat
```

Run `node scripts/build-kb-index.js` after editing anything here to regenerate
`api/_lib/kb-index.json` (the committed index the chat retriever loads). The
build step also pulls in official iFLYTEK / Astron project docs from GitHub at
build time; those are not stored here.

## Layout

| Dir | Contents |
| --- | --- |
| `faq/` | Curated, deduplicated FAQ pages for Astron Agent & Astron RPA (deployment, config, models, troubleshooting, features) plus refined community FAQ. |
| `cases/` | Anonymized customer case studies — real project scenarios, problems and resolutions, with customer identities removed. |
| `qa/` | Cleaned group-chat Q&A extracts (noisier; deduplicated and quality-filtered at build time). |

`README.md` and any priority/meta docs are excluded from the index by the build
script.

## Desensitization policy

All content is derived from internal community-support and 1v1 project records
and has been desensitized before being committed here:

- **Customer / company names** → generic industry descriptors (e.g. *某大型能源企业*,
  *某电信运营商地市分公司*, *某通信设备制造企业*). Each case keeps a distinct,
  anonymous alias so scenarios remain distinguishable without identifying anyone.
- **Personal names** (staff, ambassadors, community members) → removed or replaced
  with `某用户`. `@mentions` are replaced with `@某用户`.
- **Identifiers** — WeCom group IDs, `@chatroom` ids, room numbers, phone numbers,
  image filenames/timestamps — stripped or reduced to neutral tokens (e.g. `[图片]`).

Public, non-sensitive technical references are intentionally **kept**: product
names, GitHub repo/issue links, error messages, commands, config keys, ports,
and third-party LLM/product names (DeepSeek, 腾讯, 千问, etc.).

When adding new material, run it through the same desensitization before
committing, and rebuild the index.
