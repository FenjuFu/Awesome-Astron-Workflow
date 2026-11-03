export const playgroundPrompts = [
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
    "prompt": "Create a beautiful candy-matching game around the working JavaScript below. Keep this game logic unchanged; focus on the HTML and CSS. Make elements with ids board, score, moves, message and a Restart button calling reset(). The board is a 6-column CSS grid, width min(300px,100%), aspect-ratio 1; tile buttons fill their cells. Use a compact purple card, large candy emoji, readable score and remaining moves, visible instructions and hover effects. Fit at 350px width and inside a 470px-high iframe. No overlays. Start with <!DOCTYPE html><html lang=\"en\">. Return complete HTML with inline CSS and this inline script, no dependencies or network.\nconst icons=['🍇','🍓','🍋','🍩'], colors=['#a78bfa','#fb7185','#facc15','#38bdf8'];\nlet board=[],score=0,moves=20;\nconst rand=()=>Math.floor(Math.random()*4);\nfunction hasMatch(){return board.some((v,i)=>(i%6<5&&board[i+1]===v)||(i<30&&board[i+6]===v));}\nfunction fresh(){do{board=Array.from({length:36},rand);}while(!hasMatch());}\nfunction render(){\n document.getElementById('score').textContent=score;\n document.getElementById('moves').textContent=moves;\n document.getElementById('message').textContent=moves===0?'Game over — restart to play again':'';\n const grid=document.getElementById('board');grid.replaceChildren();\n board.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.textContent=icons[v];b.style.background=colors[v];b.dataset.row=Math.floor(i/6);b.dataset.col=i%6;b.setAttribute('aria-label',icons[v]+' candy');b.disabled=moves===0;b.onclick=()=>pop(i);grid.appendChild(b);});\n}\nfunction pop(start){\n if(moves===0)return;\n const target=board[start],seen=new Set(),stack=[start],group=[];\n while(stack.length){const i=stack.pop();if(seen.has(i)||board[i]!==target)continue;seen.add(i);group.push(i);if(i%6>0)stack.push(i-1);if(i%6<5)stack.push(i+1);if(i>=6)stack.push(i-6);if(i<30)stack.push(i+6);}\n if(group.length<2)return;\n score+=group.length*10;moves--;group.forEach(i=>{board[i]=rand();});\n if(moves>0&&!hasMatch())fresh();render();\n}\nfunction reset(){score=0;moves=20;fresh();render();}\nreset();"
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
    "prompt": "Create a beautiful responsive profile card for a fictional designer named Alex Chen. Show an initials avatar made with CSS, the role Product Designer, a short fictional bio and three skill chips: Prototyping, Design systems, Accessibility. Include a clearly labelled Toggle theme button that switches the card and background between readable light and dark palettes on every click. Use a single boolean and one CSS class for theme state. No links or nonfunctional buttons, no invented employer or testimonials. Make the card elegant with generous spacing, a purple accent, rounded corners and a subtle shadow. It must fit at 350px width and within 470px height. Return one complete HTML document with inline CSS and JavaScript, no network requests, external assets, libraries or storage. Start exactly with <!DOCTYPE html><html lang=\"en\"> and finish with </html>. Keep the full response under 150 lines."
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
    "prompt": "Create a beautiful compact focus timer around the exact working JavaScript below. Keep the logic unchanged. HTML elements: labelled number input id duration min=1 max=3600 value=60; large MM:SS text id display; progress element id progress max=60 value=60; status text id status; buttons labelled Start, Pause, Reset calling start(), pause(), reset() respectively. Purple and cream card, responsive at 350px width and under 470px height, readable controls. Return a complete document starting <!DOCTYPE html><html lang=\"en\"> and ending </html>. Inline CSS and script only; no dependencies, network or storage. Keep the output compact.\nconst input=document.getElementById('duration'),display=document.getElementById('display'),bar=document.getElementById('progress'),statusText=document.getElementById('status');\nlet remaining=60,total=60,interval=null;\nfunction update(){display.textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');bar.max=total;bar.value=remaining;input.disabled=interval!==null;}\nfunction pause(){if(interval!==null)clearInterval(interval);interval=null;statusText.textContent='Paused';update();}\nfunction reset(){pause();const n=Number(input.value);total=Number.isInteger(n)&&n>=1&&n<=3600?n:60;input.value=total;remaining=total;statusText.textContent='Ready';update();}\nfunction start(){if(interval!==null)return;if(remaining<=0)reset();statusText.textContent='Focusing';interval=setInterval(()=>{remaining--;if(remaining<=0){remaining=0;clearInterval(interval);interval=null;statusText.textContent='Done';}update();},1000);update();}\ninput.addEventListener('change',()=>{if(interval===null)reset();});reset();"
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
    "prompt": "Create a compact interactive gradient studio. Include two labelled native color inputs, Color A default #7c3aed and Color B default #06b6d4, plus an Angle range slider from 0 to 360 default 135. Show the current angle in degrees, a large rounded gradient preview and the exact CSS linear-gradient(...) value as selectable text. Update the preview, angle text and CSS value immediately on every input event. Add a Reset button that restores both colors and angle and updates every display. Use one update() function shared by all controls and reset. Design a clean light panel with a dark preview border, readable labels and responsive spacing, fitting 350px width and 470px height. No copy API, storage, external assets, libraries or network. Return one complete HTML file with inline CSS and JavaScript."
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
    "prompt": "Create a friendly compact three-question quiz around the exact working script below, preserving its logic. Provide elements id question, id options, id feedback, id summary, a Next button id next, and a Restart button id restart. Use a readable purple theme and attractive option buttons. No overlays. Fit 350px width and 470px height. Return one complete HTML document beginning <!DOCTYPE html><html lang=\"en\"> and ending </html>, with inline CSS and this script. No dependencies, external assets, network or storage; keep the output compact.\nconst qs=[{q:'Which planet is known as the Red Planet?',a:['Earth','Mars','Venus'],correct:1},{q:'How many sides does a triangle have?',a:['3','4','5'],correct:0},{q:'Which language styles web pages?',a:['HTML','CSS','SQL'],correct:1}];\nlet index=0,score=0,answered=false;\nconst question=document.getElementById('question'),options=document.getElementById('options'),feedback=document.getElementById('feedback'),summary=document.getElementById('summary'),next=document.getElementById('next');\nfunction render(){answered=false;feedback.textContent='';options.replaceChildren();next.disabled=true;summary.textContent='';if(index===qs.length){question.textContent='Quiz complete';summary.textContent='Score: '+score+' / 3';return;}question.textContent=(index+1)+' / 3 - '+qs[index].q;qs[index].a.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>answer(i);options.appendChild(b);});}\nfunction answer(i){if(answered||index>=qs.length)return;answered=true;const ok=i===qs[index].correct;if(ok)score++;feedback.textContent=ok?'Correct!':'Not quite. Correct answer: '+qs[index].a[qs[index].correct];options.querySelectorAll('button').forEach(b=>b.disabled=true);next.disabled=false;}\nnext.onclick=()=>{if(!answered)return;index++;render();};document.getElementById('restart').onclick=()=>{index=0;score=0;render();};render();"
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
    "prompt": "Make a beautiful compact daily checklist with exactly five initially unchecked items: Drink water, Stretch, Read 10 pages, Take a walk, Plan tomorrow. Use native checkboxes with clickable text labels. Show Completed: 0 / 5 and a progress bar. On every checkbox change count the checked inputs to update both displays; unchecking must decrease progress. Show All done! only when all five are checked. Add Reset to uncheck all items and restore 0 / 5 with an empty bar. Keep data in the current page only, no persistence or storage. Use a warm cream card, green accent, readable type and subtle checked-state styling. Fit 350px width and 470px height. Return a single complete HTML document with inline CSS and JavaScript and no external dependencies or network requests."
  }
];
