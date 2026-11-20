import { useEffect, useState } from 'react';

type Prize = {id:string;name:string;cost:number;stock:number};
type Player = {id:string;name:string;points:number;earned:number;completed:string[];redemptions:{name:string;cost:number;at:string}[]};
type Room = {code:string;title:string;expiresAt:string;isHost:boolean;playerCount:number;prizes:Prize[];player?:Player;players?:Player[];question?:{game:string;index:number;total:number;text:string;options:string[];category?:string;level?:string}};
type Credentials = {code:string;token:string};
const gameNames = {goat:['羊年趣味问答','Goat Year quiz'],riddles:['羊年灯谜会','Lantern riddles'],customs:['新春知识挑战','New Year customs']};
const storeKey='astron-new-year-2027';
function loadSession():Credentials|null {try{return JSON.parse(sessionStorage.getItem(storeKey)||'null');}catch{return null;}}
const btn='rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-950 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed';

export default function NewYearFair({zh,onCreate}:{zh:boolean;onCreate:()=>void}){
  const tr=(cn:string,en:string)=>zh?cn:en;
  const [credentials,setCredentials]=useState<Credentials|null>(loadSession);
  const [room,setRoom]=useState<Room|null>(null);
  const [code,setCode]=useState(()=>new URLSearchParams(window.location.search).get('fair')||'');
  const [name,setName]=useState('');
  const [setup,setSetup]=useState(false);
  const [title,setTitle]=useState('2027 羊年新春游园会');
  const [prizes,setPrizes]=useState([{name:'新春贴纸（请修改为实际礼品）',cost:20,stock:100},{name:'新春纪念礼品（请修改为实际礼品）',cost:60,stock:30}]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [feedback,setFeedback]=useState<{correct:boolean;points:number;answer:string;explanation:string;source?:string;sourceUrl?:string}|null>(null);
  const [playerId,setPlayerId]=useState('');
  const [prizeId,setPrizeId]=useState('0');
  const [redeemConfirmation,setRedeemConfirmation]=useState(false);
  const [redeemRequest,setRedeemRequest]=useState('');
  const [copied,setCopied]=useState(false);
  async function request(body:Record<string,unknown>,auth=credentials){
    const response=await fetch('/api/new-year',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...auth,...body})});
    const data=await response.json();if(!response.ok)throw Error(data.error||tr('请求失败','Request failed'));
    setRoom(data.room);return data;
  }
  async function act(body:Record<string,unknown>){
    if(busy)return;setBusy(true);setError('');setNotice('');
    try{const data=await request(body);if(data.token){const auth={code:data.room.code,token:data.token};setCredentials(auth);try{sessionStorage.setItem(storeKey,JSON.stringify(auth));}catch{/* Current tab still works. */}}if(data.feedback)setFeedback(data.feedback);return data;}
    catch(e){setError(e instanceof Error?e.message:tr('服务暂不可用','Service unavailable'));}
    finally{setBusy(false);}
  }
  useEffect(()=>{if(credentials){setBusy(true);request({action:'state'},credentials).catch(e=>setError(e.message)).finally(()=>setBusy(false));}},[]);
  const player=room?.player;
  const selectedPlayer=room?.players?.find(p=>p.id===playerId);
  const selectedPrize=room?.prizes.find(p=>p.id===prizeId);
  const publicUrl=room?`${window.location.origin}/playground?fair=${room.code}`:'';
  function leave(){setCredentials(null);setRoom(null);setName('');setFeedback(null);setError('');setNotice('');setSetup(false);try{sessionStorage.removeItem(storeKey);}catch{/* Ignore unavailable storage. */}}
  function downloadCard(){if(!room||!player)return;const text=[room.title,`参与编号：${player.id}`,`昵称：${player.name}`,`累计获得：${player.earned} 分`, `可用积分：${player.points} 分`,...player.redemptions.map(r=>`已兑：${r.name}（${r.cost} 分）`),'此文件为纪念记录，兑奖以现场服务器记录与工作人员核验为准。'].join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`羊年积分卡-${player.id}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <section aria-label={tr('羊年新春游园会','Goat Year fair')} className="mb-6 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
    <div className="bg-gradient-to-r from-rose-950 via-rose-800 to-orange-700 p-6 text-white">
      <p className="text-sm font-medium text-amber-200">2027 · {tr('丁未羊年','Year of the Goat')}</p>
      <h2 className="mt-1 text-2xl font-bold">🐑 {tr('新春创作与闯关','Create, play & celebrate')}</h2>
      <p className="mt-2 text-base text-rose-50">{tr('改一改模板，把自己的作品下载带走；玩固定题库，攒积分到现场兑换礼品。','Remix a template and download your creation, or earn event points with fixed quizzes and redeem gifts on site.')}</p>
      <div className="mt-4 flex flex-wrap gap-3"><button className="rounded-xl bg-amber-200 px-4 py-2 font-semibold text-rose-950" onClick={onCreate}>{tr('创作我的作品','Create my work')}</button><a href="#new-year-games" className="rounded-xl border border-white/40 px-4 py-2 font-medium">{tr('玩游戏攒积分','Play for points')}</a></div>
    </div>
    <div id="new-year-games" className="scroll-mt-24 p-5 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed text-gray-600">{tr('玩法：加入现场活动 → 完成三种游戏（每种5题，每题10分，每种仅计分一次）→ 出示参与编号 → 工作人员核验后扣分发礼品。DIY作品里的分数不计入兑奖。','Join an event → play three 5-question games (10 points per correct answer, once per game) → show your participant ID → staff verify, deduct points and issue a gift. DIY scores do not count.')}</p>
      {!room ? <>
        {!setup ? <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={e=>{e.preventDefault();act({action:'join',code,name});}}>
          <label className="text-sm">{tr('现场六位活动码','6-digit event code')}<input required pattern="[0-9]{6}" inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="text-sm">{tr('你的昵称（无需实名）','Nickname (no real name needed)')}<input required maxLength={20} value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
          <button disabled={busy} className={`${btn} self-end py-3`}>{busy?tr('正在连接…','Connecting…'):tr('加入闯关','Join event')}</button>
        </form> : <form onSubmit={e=>{e.preventDefault();act({action:'create',title,prizes});}} className="space-y-4">
          <h3 className="font-semibold">{tr('工作人员 · 开一场活动','Staff · create an event')}</h3>
          <p className="text-sm text-gray-600">{tr('请按实际礼品填写名称、所需积分和库存。创建后此标签页成为核销台，请勿给游客操作。活动有效30天，正式活动请临近开场创建。','Enter real prizes, costs and stock. This tab becomes the staff desk; keep it with staff. Events last 30 days, so create the live event near its date.')}</p>
          <label className="block text-sm">{tr('活动名称','Event title')}<input required maxLength={60} value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label>
          {prizes.map((prize,i)=><div key={i} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
            <label className="text-sm">{tr('礼品名称','Prize')}<input required maxLength={40} value={prize.name} onChange={e=>setPrizes(prizes.map((p,j)=>j===i?{...p,name:e.target.value}:p))} className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="text-sm">{tr('所需积分','Points')}<input required type="number" min={10} max={150} value={prize.cost} onChange={e=>setPrizes(prizes.map((p,j)=>j===i?{...p,cost:Number(e.target.value)}:p))} className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="text-sm">{tr('库存','Stock')}<input required type="number" min={1} max={10000} value={prize.stock} onChange={e=>setPrizes(prizes.map((p,j)=>j===i?{...p,stock:Number(e.target.value)}:p))} className="mt-1 w-full rounded-lg border p-2" /></label>
          </div>)}
          <button disabled={busy} className={btn}>{tr('创建活动与核销台','Create event & staff desk')}</button>
        </form>}
        <button className="mt-4 text-sm text-rose-800 underline" disabled={busy} onClick={()=>setSetup(!setup)}>{setup?tr('返回游客入口','Back to visitor entry'):tr('我是工作人员：配置礼品并创建活动','Staff: configure prizes and create event')}</button>
      </> : <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">{room.title}</h3><p className="mt-1 text-sm text-gray-600">{tr('活动码','Event code')} <strong className="tracking-widest text-rose-800">{room.code}</strong> · {tr('已加入','Joined')}: {room.playerCount}</p></div><button className={btn} disabled={busy} onClick={()=>act({action:'state'})}>{tr('刷新记录','Refresh')}</button></div>
        {room.isHost ? <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 p-4 text-sm"><p className="font-bold">{tr('工作人员核销台 · 请保管此标签页','Staff desk · keep this tab private')}</p><p className="mt-1">{tr('下方链接只供游客加入，不包含核销权限。请核对本人、参与编号与礼品，再确认发放。','The visitor link below has no staff permissions. Check the person, participant ID and prize before issuing.')}</p><p className="mt-2 break-all">{publicUrl}</p><button className={`${btn} mt-2`} onClick={async()=>{try{await navigator.clipboard.writeText(publicUrl);setCopied(true);}catch{setError(tr('请手动复制上方游客链接','Please copy the visitor link manually'));}}}>{copied?tr('已复制游客链接','Visitor link copied'):tr('复制游客链接','Copy visitor link')}</button></div>
          <label className="block text-sm">{tr('参与编号','Participant ID')}<input value={playerId} onChange={e=>{setPlayerId(e.target.value.trim().toUpperCase());setRedeemConfirmation(false);setRedeemRequest('');}} className="mt-1 w-full rounded-lg border p-3" placeholder={tr('输入游客出示的编号','Enter the visitor’s ID')} /></label>
          {selectedPlayer&&<div className="rounded-xl border p-4"><p className="font-semibold">{selectedPlayer.name} · {selectedPlayer.id}</p><p className="mt-1">{tr('可用积分','Available points')}: <strong>{selectedPlayer.points}</strong> / {tr('累计','Earned')}: {selectedPlayer.earned}</p><label className="mt-3 block text-sm">{tr('选择礼品','Choose prize')}<select value={prizeId} onChange={e=>{setPrizeId(e.target.value);setRedeemConfirmation(false);setRedeemRequest('');}} className="mt-1 w-full rounded-lg border bg-white p-3">{room.prizes.map(p=><option key={p.id} value={p.id}>{p.name} · {p.cost}{tr('分',' pts')} · {tr('余','stock ')}{p.stock}</option>)}</select></label><label className="my-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={redeemConfirmation} onChange={e=>setRedeemConfirmation(e.target.checked)} />{tr('已核对游客本人、编号与本次礼品','I checked the visitor, ID and selected prize')}</label><button className={btn} disabled={busy||!redeemConfirmation||!selectedPrize||selectedPlayer.points<selectedPrize.cost||selectedPrize.stock<1} onClick={async()=>{const requestId=redeemRequest||crypto.randomUUID();setRedeemRequest(requestId);const data=await act({action:'redeem',playerId,prizeId,requestId});if(data){setNotice(tr('核销成功，请发放礼品。','Redeemed. Please hand over the gift.'));setRedeemConfirmation(false);setRedeemRequest('');}}}>{tr('确认扣分并核销','Deduct points & redeem')}</button><ul className="mt-3 text-sm text-gray-600">{selectedPlayer.redemptions.map((r,i)=><li key={i}>{tr('已兑','Redeemed')}: {r.name} · −{r.cost}</li>)}</ul></div>}
          {!selectedPlayer&&playerId&&<p className="text-sm text-gray-500">{tr('未找到编号，请刷新并检查输入。','ID not found. Refresh and check the input.')}</p>}
          <details><summary className="cursor-pointer text-sm">{tr('查看参与记录','Participant records')} ({room.playerCount})</summary><div className="mt-2 max-h-72 overflow-auto text-sm">{room.players?.map(p=><button key={p.id} className="flex w-full justify-between border-b p-2 text-left hover:bg-rose-50" onClick={()=>{setPlayerId(p.id);setRedeemConfirmation(false);setRedeemRequest('');}}><span>{p.name} · {p.id}</span><span>{p.points} {tr('分','pts')}</span></button>)}</div></details>
        </div> : player ? <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 p-4"><div><p className="text-sm">{player.name} · {tr('参与编号','Participant ID')}: <strong>{player.id}</strong></p><p className="mt-2 text-3xl font-bold text-rose-900">{player.points} <span className="text-base">{tr('可用积分','points available')}</span></p></div><button className={btn} onClick={downloadCard}>{tr('下载积分纪念卡','Download score card')}</button></div>
          {feedback ? <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h4 className="text-lg font-semibold">{feedback.correct?tr('答对了！','Correct!'):tr('一起看看答案','Let’s see the answer')} +{feedback.points}</h4><p className="mt-2">{feedback.answer}</p><p className="mt-1 text-sm">{feedback.explanation}</p>{feedback.source&&<p className="mt-2 text-xs text-gray-600">{tr('出处：','Source: ')}<a href={feedback.sourceUrl} target="_blank" rel="noreferrer" className="underline">{feedback.source}</a></p>}<button className={`${btn} mt-4`} onClick={()=>setFeedback(null)}>{room.question?tr('下一题','Next question'):tr('查看成绩','View results')}</button></div> : room.question ? <div className="rounded-xl border p-5"><p className="text-sm text-rose-800">{gameNames[room.question.game]?.[zh?0:1]} · {room.question.index+1}/{room.question.total}{room.question.category&&` · ${room.question.category} · ${room.question.level}`}</p><h4 className="my-4 text-xl font-bold">{room.question.text}</h4><div className="grid gap-3">{room.question.options.map((option,i)=><button key={`${room.question!.index}-${i}`} disabled={busy} className={`${btn} text-left text-base`} onClick={()=>act({action:'answer',game:room.question!.game,index:room.question!.index,choice:i})}>{String.fromCharCode(65+i)}. {option}</button>)}</div></div> : <div className="grid gap-3 md:grid-cols-3">{Object.entries(gameNames).map(([id,titles])=><button key={id} disabled={busy||player.completed.includes(id)} onClick={()=>act({action:'start',game:id})} className={`${btn} p-5 text-left`}><strong className="text-base">{titles[zh?0:1]}</strong>{id==='customs'&&<p className="mt-2 text-xs">{tr('24题文化库 · 地方 / 民族 / 历代 / 诗文，随机抽题','24 reviewed cultural questions · random rounds')}</p>}<p className="mt-2 text-sm">{player.completed.includes(id)?tr('已完成 · 本场不重复计分','Completed · scored once'):tr('5题 · 最高50分','5 questions · up to 50 pts')}</p></button>)}</div>}
          <h4 className="mb-2 mt-5 font-semibold">{tr('现场礼品','On-site gifts')}</h4><div className="grid gap-2 sm:grid-cols-2">{room.prizes.map(p=><div className="rounded-xl border p-3 text-sm" key={p.id}><strong>{p.name}</strong><p className="mt-1">{p.cost} {tr('积分','pts')} · {tr('剩余','remaining')}: {p.stock}</p></div>)}</div><p className="mt-3 text-sm text-gray-600">{tr('到核销台出示参与编号，由工作人员扣分兑换。下载卡片和截图不能代替服务器记录；每位游客仅使用一个参与编号。','Show your participant ID to staff for redemption. Downloaded cards and screenshots do not replace server records. Use one participant ID per visitor.')}</p>
          {player.redemptions.length>0&&<ul className="mt-3 text-sm">{player.redemptions.map((r,i)=><li key={i}>✓ {r.name} · −{r.cost} {tr('分','pts')}</li>)}</ul>}
        </div> : <p>{tr('请返回入口，以昵称加入活动。','Return to the entry and join with a nickname.')}</p>}
        <p className="mt-5 text-sm text-gray-500">{tr('有效期至','Expires')}: {new Date(room.expiresAt).toLocaleDateString(zh?'zh-CN':'en-GB')}</p>
        <button disabled={busy} className="mt-3 text-sm text-rose-800 underline" onClick={leave}>{room.isHost?tr('退出此核销台（将失去本页权限）','Leave staff desk (loses this tab’s access)'):tr('退出 / 下一位游客','Leave / next visitor')}</button>
      </>}
      <p role="alert" className="mt-3 text-sm text-red-700">{error}</p><p role="status" className="mt-2 text-sm text-green-700">{notice}</p>
    </div>
  </section>;
}
