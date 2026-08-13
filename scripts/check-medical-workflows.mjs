import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import yaml from 'js-yaml';

const root = process.cwd();
const python =
  process.env.WORKFLOW_VALIDATOR_PYTHON ||
  'C:/Users/fufen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const files = [
  'astron-openrare-clue-extraction.zh-CN.yml',
  'astron-openrare-clue-extraction.en-US.yml',
  'astron-pubmed-evidence-card.zh-CN.yml',
  'astron-pubmed-evidence-card.en-US.yml',
];

function collectCode(value, out = []) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectCode(entry, out));
  } else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (key === 'code' && typeof entry === 'string' && entry.includes('def main')) {
        out.push(entry);
      }
      collectCode(entry, out);
    }
  }
  return out;
}

for (const name of files) {
  const source = path.join(root, 'assets_source', 'workflows', name);
  const mirror = path.join(root, 'public', 'workflows', name);
  const raw = fs.readFileSync(source, 'utf8');
  const document = yaml.load(raw);
  if (!document?.flowMeta || !document?.flowData) {
    throw new Error(`${name}: missing flowMeta or flowData`);
  }
  if (!fs.readFileSync(source).equals(fs.readFileSync(mirror))) {
    throw new Error(`${name}: public mirror differs`);
  }
  const codeNodes = collectCode(document);
  for (const code of codeNodes) {
    const result = spawnSync(
      python,
      ['-c', 'import sys; compile(sys.stdin.read(), "workflow-node", "exec")'],
      {
        input: code,
        encoding: 'utf8',
        env: { ...process.env, PYTHONUTF8: '1' },
      },
    );
    if (result.status !== 0) {
      throw new Error(`${name}: invalid Python code: ${result.stderr}`);
    }
  }
  console.log(`${name}: YAML_OK CODE_NODES=${codeNodes.length}`);
}
