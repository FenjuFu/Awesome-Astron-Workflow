const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../src/components/OpenRankShare.tsx');
const mod = new Module(filename, module);
mod.paths = Module._nodeModulePaths(path.dirname(filename));
mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }
}).outputText, filename);
const {scoreShare} = mod.exports;
assert.equal(scoreShare(25, [25, 75]), 25);
assert.equal(scoreShare(0, [0, 100]), 0);
assert.equal(scoreShare(0, [0, 0]), null);
assert.equal(scoreShare(null, [20, null]), null);
assert.equal(scoreShare(20, [20, null]), null);
assert.equal(scoreShare(20, [20, NaN]), null);
assert.equal(scoreShare(20, [20, -1]), null);
assert.equal(scoreShare(20, [20, Infinity]), null);
assert.ok(scoreShare(.0001, [.0001, 100]) < .01);
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/galaxy.json'), 'utf8'));
for (const p of data.projects) {
  const scores = p.contributors.map(c => c.openrank);
  if (!scores.length) continue;
  const sum = scores.reduce((total, score) => total + scoreShare(score, scores), 0);
  assert.ok(Math.abs(sum - 100) < 1e-9, `${p.id} shares sum to 100`);
}
console.log('PASS share boundaries and all-project totals');
