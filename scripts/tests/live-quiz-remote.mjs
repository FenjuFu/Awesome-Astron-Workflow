import { spawn } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { token } from '../../api/_lib/quiz-core.js';
const deployment = process.argv[2];
assert.ok(deployment, 'Provide the preview URL');
const quote = value => JSON.stringify(String(value));
async function curl(url, headers = {}, body) {
  const config = ['url = ' + quote(url), 'silent', 'show-error', 'fail', 'max-time = 30', 'retry = 2', 'connect-timeout = 10', ...Object.entries(headers).map(([k,v]) => 'header = ' + quote(k + ': ' + v)), ...(body ? ['data = ' + quote(JSON.stringify(body))] : [])].join('\n');
  const raw = await new Promise((resolve, reject) => {
    const child = spawn('curl.exe', ['--config', '-'], { windowsHide: true });
    let out = ''; let err = '';
    child.stdout.on('data', d => out += d);
    child.stderr.on('data', d => err += d);
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(out) : reject(new Error('HTTP transport failed: ' + err)));
    child.stdin.end(config);
  });
  return JSON.parse(raw);
}
const auth = JSON.parse(fs.readFileSync(process.env.APPDATA + '/com.vercel.cli/Data/auth.json'));
const project = JSON.parse(fs.readFileSync('.vercel/project.json'));
const metadata = await curl(`https://api.vercel.com/v9/projects/${project.projectId}?teamId=${project.orgId}`, { Authorization: `Bearer ${auth.token}` });
const bypass = Object.keys(metadata.protectionBypass || {})[0];
assert.ok(bypass, 'Preview protection credential unavailable');
async function request(body) {
  const data = await curl(deployment + '/api/quiz', { 'Content-Type': 'application/json', 'x-vercel-protection-bypass': bypass }, body);
  assert.ok(data.room, data.error || 'Missing room');
  return data;
}
const created = await request({ action: 'create', title: 'Temporary concurrency verification', questions: [{ text: '2+2?', options: ['4','3','2','1'], correct: 0, seconds: 120 }] });
const code = created.room.code;
const players = Array.from({length:20}, (_,i) => ({ name:'QA '+i, token:token() }));
await Promise.all(players.map(p => request({action:'join',code,...p})));
let state = await request({action:'state',code,token:created.token});
assert.equal(state.room.leaderboard.length,20);
console.log('PASS: 20 concurrent joins');
await request({action:'next',code,token:created.token,revision:state.room.revision});
await Promise.all(players.map(p => request({action:'answer',code,token:p.token,index:0,choice:0})));
state = await request({action:'state',code,token:created.token});
assert.equal(state.room.answerCount,20);
assert.equal(state.room.question.correct,undefined);
assert.ok(state.room.leaderboard.every(p => p.score === 0));
await request({action:'answer',code,token:players[0].token,index:0,choice:1});
const reveal = await request({action:'reveal',code,token:created.token,revision:state.room.revision});
assert.equal(reveal.room.answerCount,20);
assert.ok(reveal.room.leaderboard.every(p => p.score >= 500));
const end = await request({action:'next',code,token:created.token,revision:reveal.room.revision});
assert.equal(end.room.phase,'finished');
console.log('PASS: 20 concurrent answers, idempotent retry, hidden correct answer, server scoring, final leaderboard');
