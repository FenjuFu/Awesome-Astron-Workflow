import { newYearPrompts } from './newYearPrompts';
export const playgroundPrompts = [
  ...newYearPrompts,
  {
    "id": "candy-match",
    "icon": "🍬",
    "title": {
      "en": "Candy match",
      "zh": "糖果消消乐"
    },
    "description": {
      "en": "Clear matching groups, earn points and restart.",
      "zh": "点击同色糖果消除，计分、倒数步数、重新开始。"
    },
    "prompt": "Create a beautiful candy-matching game around the working JavaScript below. Keep this game logic unchanged; focus on the HTML and CSS. Make elements with ids board, score, moves, message and a Restart button calling reset(). You MUST include this exact HTML body structure before the script; do not omit the markup: <main class='game-container'><h1>Candy Match</h1><p>Tap 2 or more connected matching candies.</p><p>Score: <strong id='score'>0</strong> · Moves: <strong id='moves'>20</strong></p><div id='board'></div><p id='message' role='status'></p><button type='button' onclick='reset()'>Restart</button></main>. Style #board as a 6-column CSS grid, width min(300px,100%), aspect-ratio 1; style #board button directly, with aspect-ratio 1 and font-size 24px; tile buttons fill their cells. Set #board grid-template-columns:repeat(6,minmax(0,1fr)); #board button must have padding:0,min-width:0,width:100%,overflow:hidden to prevent generic button padding from stretching the grid. Use a well-spaced purple card, large candy emoji, readable score and remaining moves, visible instructions and hover effects. Adapt to 350px width; use natural content height and vertical scrolling with no forced height limit. No overlays. Start with <!DOCTYPE html><html lang=\"en\">. Return complete HTML with inline CSS and this inline script, no dependencies or network.\nconst icons=['🍇','🍓','🍋','🍩'], colors=['#a78bfa','#fb7185','#facc15','#38bdf8'];\nlet board=[],score=0,moves=20;\nconst rand=()=>Math.floor(Math.random()*4);\nfunction hasMatch(){return board.some((v,i)=>(i%6<5&&board[i+1]===v)||(i<30&&board[i+6]===v));}\nfunction fresh(){do{board=Array.from({length:36},rand);}while(!hasMatch());}\nfunction render(){\n document.getElementById('score').textContent=score;\n document.getElementById('moves').textContent=moves;\n document.getElementById('message').textContent=moves===0?'Game over — restart to play again':'';\n const grid=document.getElementById('board');grid.replaceChildren();\n board.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.className='tile';b.style.padding='0';b.style.minWidth='0';b.style.width='100%';b.style.overflow='hidden';b.textContent=icons[v];b.style.background=colors[v];b.dataset.row=Math.floor(i/6);b.dataset.col=i%6;b.setAttribute('aria-label',icons[v]+' candy');b.disabled=moves===0;b.onclick=()=>pop(i);grid.appendChild(b);});\n}\nfunction pop(start){\n if(moves===0)return;\n const target=board[start],seen=new Set(),stack=[start],group=[];\n while(stack.length){const i=stack.pop();if(seen.has(i)||board[i]!==target)continue;seen.add(i);group.push(i);if(i%6>0)stack.push(i-1);if(i%6<5)stack.push(i+1);if(i>=6)stack.push(i-6);if(i<30)stack.push(i+6);}\n if(group.length<2)return;\n score+=group.length*10;moves--;group.forEach(i=>{board[i]=rand();});\n if(moves>0&&!hasMatch())fresh();render();\n}\nfunction reset(){score=0;moves=20;fresh();render();}\nreset();"
  },
  {
    "id": "profile-card",
    "icon": "✨",
    "title": {
      "en": "Profile card",
      "zh": "个人介绍卡片"
    },
    "description": {
      "en": "A polished fictional profile with a light/dark switch.",
      "zh": "精美虚构人物介绍卡，支持明暗主题切换。"
    },
    "prompt": "Create a beautiful responsive profile card for a fictional designer named Alex Chen. REQUIRED structure: <!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Alex Chen</title><style>YOUR COMPLETE CSS HERE</style></head><body><main class='card'><div class='avatar'>AC</div><h1>Alex Chen</h1><p>Product Designer</p><p>A fictional designer who creates clear, accessible digital experiences.</p><div class='chips'><span>Prototyping</span><span>Design systems</span><span>Accessibility</span></div><button id='theme-toggle' type='button' aria-pressed='false'>Toggle theme</button></main><script>let dark=false;document.getElementById('theme-toggle').onclick=()=>{dark=!dark;document.documentElement.classList.toggle('dark',dark);document.getElementById('theme-toggle').setAttribute('aria-pressed',String(dark));};</script></body></html>. Keep EVERY HTML tag above, close style/head/body/script correctly. Only replace YOUR COMPLETE CSS HERE with polished CSS. Do not omit the visible card or move the button/script into style. Show an initials avatar made with CSS, the role Product Designer, a short fictional bio and three skill chips: Prototyping, Design systems, Accessibility. Include a clearly labelled Toggle theme button that switches the card and background between readable light and dark palettes on every click. Use this exact script, and define both light and dark CSS custom properties on :root and :root.dark. body AND card must consume those variables so the whole page changes, not only the card: let dark=false;document.getElementById('theme-toggle').onclick=()=>{dark=!dark;document.documentElement.classList.toggle('dark',dark);document.getElementById('theme-toggle').setAttribute('aria-pressed',String(dark));}; Include <button id='theme-toggle' type='button' aria-pressed='false'>Toggle theme</button> after the profile text. Use readable contrast in both modes, 44px controls. No links or nonfunctional buttons, no invented employer or testimonials. Make the card elegant with generous spacing, a purple accent, rounded corners and a subtle shadow. It must adapt to 350px width with comfortable 24px section gaps and natural height; let the page scroll. Return one complete HTML document with inline CSS and JavaScript, no network requests, external assets, libraries or storage. Start exactly with <!DOCTYPE html><html lang=\"en\"> and finish with </html>. Keep the full response under 150 lines."
  },
  {
    "id": "focus-timer",
    "icon": "⏱️",
    "title": {
      "en": "Focus timer",
      "zh": "专注倒计时"
    },
    "description": {
      "en": "Set a duration, start, pause and reset.",
      "zh": "设置时长，一键开始、暂停和重置。"
    },
    "prompt": "Create a beautiful well-spaced focus timer around the exact working JavaScript below. Keep the logic unchanged. HTML elements: labelled number input id duration min=1 max=3600 value=60; large MM:SS text id display; progress element id progress max=60 value=60; status text id status; buttons labelled Start, Pause, Reset calling start(), pause(), reset() respectively. Purple and cream card, responsive at 350px width, with 24px section gaps and natural scrollable height, readable controls. Return a complete document starting <!DOCTYPE html><html lang=\"en\"> and ending </html>. Inline CSS and script only; no dependencies, network or storage. Keep the output well-spaced.\nconst input=document.getElementById('duration'),display=document.getElementById('display'),bar=document.getElementById('progress'),statusText=document.getElementById('status');\nlet remaining=60,total=60,interval=null;\nfunction update(){display.textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');bar.max=total;bar.value=remaining;input.disabled=interval!==null;}\nfunction pause(){if(interval!==null)clearInterval(interval);interval=null;statusText.textContent='Paused';update();}\nfunction reset(){pause();const n=Number(input.value);total=Number.isInteger(n)&&n>=1&&n<=3600?n:60;input.value=total;remaining=total;statusText.textContent='Ready';update();}\nfunction start(){if(interval!==null)return;if(remaining<=0)reset();statusText.textContent='Focusing';interval=setInterval(()=>{remaining--;if(remaining<=0){remaining=0;clearInterval(interval);interval=null;statusText.textContent='Done';}update();},1000);update();}\ninput.addEventListener('change',()=>{if(interval===null)reset();});reset();"
  },
  {
    "id": "gradient-studio",
    "icon": "🎨",
    "title": {
      "en": "Gradient studio",
      "zh": "渐变调色台"
    },
    "description": {
      "en": "Mix two colors and adjust the angle live.",
      "zh": "选择两种颜色、调整角度，实时查看渐变。"
    },
    "prompt": "Create a well-spaced interactive gradient studio. Include two labelled native color inputs, Color A default #7c3aed and Color B default #06b6d4, plus an Angle range slider from 0 to 360 default 135. Show the current angle in degrees, a large rounded gradient preview and the exact CSS linear-gradient(...) value as selectable text. Update the preview, angle text and CSS value immediately on every input event. Add a Reset button that restores both colors and angle and updates every display. Use one update() function shared by all controls and reset. Design a clean light panel with a dark preview border, readable labels and responsive spacing, adapting to 350px width with 24px section gaps and no fixed height. No copy API, storage, external assets, libraries or network. Return one complete HTML file with inline CSS and JavaScript."
  },
  {
    "id": "mini-quiz",
    "icon": "🧠",
    "title": {
      "en": "Mini quiz",
      "zh": "趣味小测验"
    },
    "description": {
      "en": "Three questions, instant feedback and a final score.",
      "zh": "三道常识题，即时反馈、结算分数、重新挑战。"
    },
    "prompt": "Create a friendly well-spaced three-question quiz around the exact working script below, preserving its logic. Provide elements id question, id options, id feedback, id summary, a Next button id next, and a Restart button id restart. Use a readable purple theme and attractive option buttons. No overlays. Adapt to 350px width; use 24px section gaps and let the page scroll naturally. Return one complete HTML document beginning <!DOCTYPE html><html lang=\"en\"> and ending </html>, with inline CSS and this script. No dependencies, external assets, network or storage; keep the output well-spaced.\nconst qs=[{q:'Which planet is known as the Red Planet?',a:['Earth','Mars','Venus'],correct:1},{q:'How many sides does a triangle have?',a:['3','4','5'],correct:0},{q:'Which language styles web pages?',a:['HTML','CSS','SQL'],correct:1}];\nlet index=0,score=0,answered=false;\nconst question=document.getElementById('question'),options=document.getElementById('options'),feedback=document.getElementById('feedback'),summary=document.getElementById('summary'),next=document.getElementById('next');\nfunction render(){answered=false;feedback.textContent='';options.replaceChildren();next.disabled=true;summary.textContent='';if(index===qs.length){question.textContent='Quiz complete';summary.textContent='Score: '+score+' / 3';return;}question.textContent=(index+1)+' / 3 - '+qs[index].q;qs[index].a.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>answer(i);options.appendChild(b);});}\nfunction answer(i){if(answered||index>=qs.length)return;answered=true;const ok=i===qs[index].correct;if(ok)score++;feedback.textContent=ok?'Correct!':'Not quite. Correct answer: '+qs[index].a[qs[index].correct];options.querySelectorAll('button').forEach(b=>b.disabled=true);next.disabled=false;}\nnext.onclick=()=>{if(!answered)return;index++;render();};document.getElementById('restart').onclick=()=>{index=0;score=0;render();};render();"
  },
  {
    "id": "daily-checklist",
    "icon": "✅",
    "title": {
      "en": "Daily checklist",
      "zh": "每日清单"
    },
    "description": {
      "en": "Check off small goals and watch progress grow.",
      "zh": "勾选每日小目标，进度条随完成情况变化。"
    },
    "prompt": "Make a beautiful well-spaced daily checklist with exactly five initially unchecked items: Drink water, Stretch, Read 10 pages, Take a walk, Plan tomorrow. Include each checkbox inside its native <label> with the text, not an unrelated span; clicking either the text or checkbox must toggle it. Use the exact body structure: <main><h1>Daily checklist</h1><label><input type='checkbox'>Drink water</label><label><input type='checkbox'>Stretch</label><label><input type='checkbox'>Read 10 pages</label><label><input type='checkbox'>Take a walk</label><label><input type='checkbox'>Plan tomorrow</label><p id='count'>Completed: 0 / 5</p><progress id='progress' max='5' value='0'></progress><p id='complete' hidden>All done!</p><button id='reset' type='button'>Reset</button></main>. Preserve this exact script: const boxes=[...document.querySelectorAll('input[type=checkbox]')];function update(){const n=boxes.filter(b=>b.checked).length;document.getElementById('count').textContent='Completed: '+n+' / 5';document.getElementById('progress').value=n;document.getElementById('complete').hidden=n!==5;}boxes.forEach(b=>b.addEventListener('change',update));document.getElementById('reset').onclick=()=>{boxes.forEach(b=>b.checked=false);update();};update(); Style labels as full-width flex rows with minimum 44px height; keep checkboxes visible. Show Completed: 0 / 5 and a progress bar. On every checkbox change count the checked inputs to update both displays; unchecking must decrease progress. Show All done! only when all five are checked. Add Reset to uncheck all items and restore 0 / 5 with an empty bar. Keep data in the current page only, no persistence or storage. Use a warm cream card, green accent, readable type and subtle checked-state styling. Adapt to 350px width; use 24px section gaps and let the page scroll naturally. Return a single complete HTML document with inline CSS and JavaScript and no external dependencies or network requests."
  }
];
