import test from 'node:test';
import assert from 'node:assert/strict';
import {cultureQuestions,cultureCategories} from '../../src/data/cultureQuestions.js';
import {buildCultureQuizScript} from '../../src/data/cultureQuizScript.js';
import {runPlayground} from '../../api/_lib/playground-core.js';
import {createFair,fairTransition,fairView} from '../../api/_lib/new-year-core.js';
test('24 reviewed questions cover four topics with clear unique answers and sources',()=>{
 assert.equal(cultureQuestions.length,24);assert.equal(new Set(cultureQuestions.map(q=>q.id)).size,24);
 for(const category of cultureCategories){const qs=cultureQuestions.filter(q=>q.category===category);assert.equal(qs.length,6);assert(qs.some(q=>q.level==='挑战'));}
 for(const q of cultureQuestions){assert.equal(q.a.length,3);assert.equal(new Set(q.a).size,3);assert(q.c>=0&&q.c<3);assert(q.why&&q.source&&q.sourceUrl.startsWith('https://'));}
});
test('culture generator keeps verified runtime and omits bank from model-facing prompt',async()=>{
 let sent;const core=buildCultureQuizScript();const prompt='Create museum HTML with main id app.\n/* VERIFIED_CULTURE_CORE_START */'+core+'/* VERIFIED_CULTURE_CORE_END */';
 const r=await runPlayground({prompt},{ASTRON_MAAS_API_KEY:'test'},async(_,options)=>{sent=JSON.parse(options.body);return new Response(JSON.stringify({choices:[{message:{content:'<!DOCTYPE html><html><head><style>body{color:red}</style></head><body><main id="app"></main></body></html>'}}]}));});
 assert.equal(r.status,200);assert(r.json.html.includes('culture-24'));assert(r.json.html.includes(core));assert(!sent.messages.at(-1).content.includes('culture-24'));assert.equal((r.json.html.match(/<script>/g)||[]).length,1);
});
test('culture event rounds cover all topics, snapshot 5 questions, hide answers, and total 50 points',()=>{
 for(let run=0;run<15;run++){
 let room=createFair({title:'QA',prizes:[{name:'Test',cost:10,stock:1}]});const joined=fairTransition(room,{action:'join',name:'QA'});room=joined.room;const token=joined.token;
 room=fairTransition(room,{action:'start',game:'customs',token}).room;const questions=structuredClone(room.players[0].run.questions);
 assert.equal(questions.length,5);assert.equal(new Set(questions.map(q=>q[0])).size,5);assert.equal(new Set(questions.map(q=>q[4].category)).size,4);
 assert.equal(fairView(room,token).question.sourceUrl,undefined);assert.equal(fairView(room,token).question.correct,undefined);
 const refreshed=fairTransition(room,{action:'start',game:'customs',token}).room;assert.deepEqual(refreshed.players[0].run.questions,questions);
 for(let i=0;i<5;i++){const p=room.players[0],choice=p.run.order.indexOf(p.run.questions[i][2]);const result=fairTransition(room,{action:'answer',game:'customs',index:i,choice,token});room=result.room;assert(result.feedback.sourceUrl.startsWith('https://'));}
 assert.equal(room.players[0].points,50);assert.deepEqual(room.players[0].completed,['customs']);assert.throws(()=>fairTransition(room,{action:'start',game:'customs',token}));
 }
});
test('legacy customs round continues with original bank',()=>{
 let room=createFair({title:'QA',prizes:[{name:'Test',cost:10,stock:1}]});const joined=fairTransition(room,{action:'join',name:'QA'});room=joined.room;room.players[0].run={game:'customs',index:0,order:[0,1,2]};assert.equal(fairView(room,joined.token).question.text,'元宵节是农历哪一天？');
 const done=fairTransition(room,{action:'answer',game:'customs',index:0,choice:0,token:joined.token});assert.equal(done.feedback.correct,true);
});
