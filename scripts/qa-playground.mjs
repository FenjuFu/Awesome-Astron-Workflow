// Opt-in real-model QA. Run only with a preview-scoped key; never logs credentials.
import fs from 'node:fs/promises';
import ts from 'typescript';
import { runPlayground } from '../api/_lib/playground-core.js';
const load = async p => (await fs.readFile(p,'utf8'));
const core=ts.transpile((await load('src/data/newYearScripts.ts')),{module:ts.ModuleKind.ES2022});
const ny=ts.transpile((await load('src/data/newYearPrompts.ts')).replace("import { newYearScripts } from './newYearScripts';",''),{module:ts.ModuleKind.ES2022});
const ps=ts.transpile((await load('src/data/playgroundPrompts.ts')).replace("import { newYearPrompts } from './newYearPrompts';",''),{module:ts.ModuleKind.ES2022});
const {playgroundPrompts:prompts}=await import('data:text/javascript;base64,'+Buffer.from(core+'\n'+ny+'\n'+ps).toString('base64'));
const selected=process.argv.slice(2);
const cases=prompts.map((p,index)=>({p,index})).filter(({p})=>!selected.length||selected.includes(p.id));
let next=0;
async function worker(){
 while(next<cases.length){
 const {index,p}=cases[next++];
 const start=Date.now();
 let result=await runPlayground({prompt:p.prompt},process.env);
 if(result.status!==200) result=await runPlayground({prompt:p.prompt},process.env);
 const record={index,id:p.id,title:p.title.zh,status:result.status,ms:Date.now()-start,...result.json};
 const payload=Buffer.from(JSON.stringify(record)).toString('base64');
 const chunks=payload.match(/.{1,1800}/g)||[];
 for(const [i,c] of chunks.entries()){console.log('QA_RECORD '+index+' '+i+'/'+chunks.length+' '+c);await new Promise(r=>setTimeout(r,5));}
 console.log('QA_STATUS '+index+' '+p.id+' '+result.status);
 }
}
await Promise.all([worker(),worker()]);
