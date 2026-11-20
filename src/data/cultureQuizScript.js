import { cultureQuestions } from './cultureQuestions.js';

/** No model-authored logic or answers: the model designs the surrounding HTML/CSS. */
export function buildCultureQuizScript() {
  return `const DATA=${JSON.stringify(cultureQuestions)};\n` + String.raw`
const root=document.getElementById('app');
const el=(tag,text,parent=root)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;parent.append(node);return node;};
const button=(text,fn,parent=root)=>{const node=el('button',text,parent);node.type='button';node.onclick=fn;return node;};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const categories=[...new Set(DATA.map(q=>q.category))];
let category='综合随机',mode='进阶综合',questions=[],index=0,score=0,correct=0,history=[];
function menu(){root.replaceChildren();el('h1','🧧 新春文化博物馆');el('p','24题 · 地方年俗 / 民族年节 / 历代风俗 / 诗文典故');el('p','文化知识有地域与时代背景，不同民族年节不都等同于农历春节。');
const cl=el('label','选择专题'),cs=el('select',undefined,cl);cs.setAttribute('aria-label','选择专题');['综合随机',...categories].forEach(x=>{const o=el('option',x,cs);o.selected=x===category;});
const ml=el('label','挑战层级'),ms=el('select',undefined,ml);ms.setAttribute('aria-label','挑战层级');['进阶综合','只看挑战题'].forEach(x=>{const o=el('option',x,ms);o.selected=x===mode;});
el('p','每轮最多5题，每题10分。分类中的挑战题不足5题时，按实际题数出题。');button('开始文化挑战',()=>{category=cs.value;mode=ms.value;let pool=DATA.filter(q=>(category==='综合随机'||q.category===category)&&(mode!=='只看挑战题'||q.level==='挑战'));
if(category==='综合随机'){let chosen=categories.map(c=>shuffle(pool.filter(q=>q.category===c))[0]).filter(Boolean);questions=shuffle([...chosen,...shuffle(pool.filter(q=>!chosen.includes(q))).slice(0,5-chosen.length)]);}else questions=shuffle(pool).slice(0,5);index=0;score=0;correct=0;history=[];render();});}
function render(){root.replaceChildren();el('h1','🧧 新春文化挑战');el('p',category+' · '+mode);const points=el('p','练习分：'+score+' · 答对 '+correct+' 题');el('p','DIY练习分不用于兑奖；现场积分请返回主页面闯关。');
if(index===questions.length){el('h2','本轮完成：'+correct+' / '+questions.length+'，'+score+'分');history.forEach(h=>{const box=el('section');box.className='card';el('h3',h.q.q,box);el('p','正确答案：'+h.q.a[h.q.c],box);el('p',h.q.why,box);el('p','出处：'+h.q.source,box);});button('再来一轮',()=>{menu();});return;}
const q=questions[index];el('p','第 '+(index+1)+' / '+questions.length+' 题 · '+q.category+' · '+q.level);el('h2',q.q);let locked=false;const options=el('div');options.className='choices';const feedback=el('p','请选择一个答案');const source=el('p','');
const next=button(index===questions.length-1?'查看结果':'下一题',()=>{if(!locked)return;index++;render();});next.disabled=true;
q.a.forEach((a,i)=>button(a,()=>{if(locked)return;locked=true;const ok=i===q.c;if(ok){score+=10;correct++;}points.textContent='练习分：'+score+' · 答对 '+correct+' 题';feedback.textContent=(ok?'答对了！':'这题学到了：')+'正确答案：'+q.a[q.c]+'。'+q.why;source.textContent='出处：'+q.source;options.querySelectorAll('button').forEach(b=>b.disabled=true);history.push({q,ok});next.disabled=false;},options));button('重新选专题',menu);}
menu();`;
}
