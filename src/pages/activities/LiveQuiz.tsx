import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Zap, Plus, Trash2, ArrowLeft, Copy } from 'lucide-react';

type Question = { text: string; options: string[]; correct: number; seconds: number };
type Session = { code: string; token: string };
type Room = { code: string; title: string; phase: string; revision: number; index: number; total: number; deadline: number; serverNow: number; isHost: boolean; me?: string; answered: boolean; myChoice?: number; answerCount: number; leaderboard: { id: string; name: string; score: number; rank: number }[]; question: { text: string; options: string[]; correct?: number; counts?: number[] } | null };
const sample: Question[] = [
  { text: '让 AI 的回答更贴近你的需求，第一步应该做什么？', options: ['明确目标和背景', '只说“帮我做一下”', '反复发送同一句话', '把所有信息都删掉'], correct: 0, seconds: 20 },
  { text: '开源项目中，README 通常用来做什么？', options: ['存储密码', '介绍项目和使用方法', '自动购买服务器', '隐藏源代码'], correct: 1, seconds: 20 },
  { text: '判断 AI 给出的重要信息是否可靠，应该怎么做？', options: ['看文字是否自信', '看答案是否很长', '核对原始来源和证据', '直接转发'], correct: 2, seconds: 20 },
];
const colors = ['bg-rose-600', 'bg-blue-600', 'bg-amber-600', 'bg-emerald-600'];
const field = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500';
const button = 'rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed';
const storageKey = 'astron-live-quiz-session';
function restore(): Session | null { try { return JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { return null; } }
async function api(body: object) {
  const response = await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(12000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '请求失败，请重试');
  return data as { room: Room; token?: string };
}
export default function LiveQuiz() {
  const [session, setSession] = useState<Session | null>(restore);
  const [room, setRoom] = useState<Room | null>(null);
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [code, setCode] = useState(new URLSearchParams(location.search).get('room') || '');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('星辰答题派对');
  const [questions, setQuestions] = useState<Question[]>(sample);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [clock, setClock] = useState(Date.now());
  const offset = useRef(0);
  const active = useRef(session);
  active.current = session;
  function accept(next: Room) {
    offset.current = next.serverNow - Date.now();
    setRoom(previous => previous && previous.code === next.code && previous.revision > next.revision ? previous : next);
  }
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const data = await api({ action: 'state', ...session });
        if (!cancelled) { accept(data.room); setError(''); }
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : '连接中断，正在重试'); }
      if (!cancelled) timer = setTimeout(poll, 1500);
    }
    void poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [session]);
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 200); return () => clearInterval(timer); }, []);
  async function enter(create: boolean) {
    setBusy(true); setError('');
    try {
      const joinToken = Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
      const data = await api(create ? { action: 'create', title, questions } : { action: 'join', code, name, token: joinToken });
      const next = { code: data.room.code, token: data.token || joinToken };
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      accept(data.room); setSession(next);
    } catch (e) { setError(e instanceof Error ? e.message : '连接失败，请重试'); }
    finally { setBusy(false); }
  }
  async function act(action: string, choice?: number) {
    if (!session || !room) return;
    setBusy(true); setError('');
    const current = session;
    try {
      const data = await api({ action, ...session, revision: room.revision, index: room.index, choice });
      if (active.current === current) accept(data.room);
    } catch (e) { setError(e instanceof Error ? e.message : '操作失败，请重试'); }
    finally { setBusy(false); }
  }
  function leave() { sessionStorage.removeItem(storageKey); setSession(null); setRoom(null); setError(''); setNotice(''); }
  function edit(index: number, patch: Partial<Question>) { setQuestions(qs => qs.map((q, i) => i === index ? { ...q, ...patch } : q)); }
  const remaining = room ? Math.max(0, Math.ceil((room.deadline - clock - offset.current) / 1000)) : 0;
  const live = room?.phase === 'question';
  return <div className="min-h-screen bg-[#f6f5fc] text-slate-900">
    <header className="border-b border-violet-100 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Link to="/activities" className="flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={17} />活动中心</Link><span className="font-black tracking-wide text-violet-700">ASTRON · LIVE QUIZ</span>{session ? <button onClick={leave} className="text-sm text-slate-500">返回首页</button> : <Trophy className="text-violet-600" />}</div></header>
    <main className="mx-auto max-w-6xl px-5 py-10">
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {notice && <p role="status" className="mb-4 text-violet-700">{notice}</p>}
      {session && !room && <div className="text-center py-20">正在恢复房间… <button className={button} onClick={leave}>返回加入页面</button></div>}
      {!session && <>
        <div className="mb-10 text-center"><span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700"><Zap size={16} />同一道题，全场一起挑战</span><h1 className="mt-5 text-4xl font-black sm:text-6xl">下一位榜首，就是你。</h1><p className="mt-5 text-slate-500">输入房间码，用手机加入。答得准、答得快，一起冲上排行榜。</p></div>
        <div className="mx-auto max-w-3xl rounded-3xl border border-violet-100 bg-white p-6 shadow-xl shadow-violet-100/40 sm:p-8">
          <div className="mb-7 flex gap-2 rounded-xl bg-slate-100 p-1">{(['join', 'create'] as const).map(m => <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg py-3 font-bold ${mode === m ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>{m === 'join' ? '我是玩家' : '我要主持'}</button>)}</div>
          {mode === 'join' ? <form onSubmit={e => { e.preventDefault(); void enter(false); }} className="mx-auto max-w-md space-y-5"><label className="block font-semibold">房间码<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6 位数字" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} className={`${field} mt-2 text-center text-3xl tracking-[0.3em]`} /></label><label className="block font-semibold">你的昵称<input required maxLength={20} value={name} onChange={e => setName(e.target.value)} placeholder="让大家记住你" className={`${field} mt-2`} /></label><button disabled={busy} className={`${button} w-full`}>{busy ? '正在加入…' : '加入挑战 →'}</button><p className="text-center text-sm text-slate-400">无需注册 · 每房间最多 100 人</p></form> : <form className="space-y-6" onSubmit={e => { e.preventDefault(); void enter(true); }}>
            <label className="block font-bold">答题主题<input required maxLength={80} className={`${field} mt-2`} value={title} onChange={e => setTitle(e.target.value)} /></label>
            <p className="text-sm text-slate-500">已准备示例题，可直接开场，也可修改题目。选择每题正确答案后创建房间。</p>
            {questions.map((q, i) => <fieldset key={i} className="space-y-3 rounded-2xl bg-slate-50 p-4"><legend className="px-2 font-bold">第 {i + 1} 题</legend><input aria-label={`第 ${i + 1} 题题目`} required maxLength={300} value={q.text} onChange={e => edit(i, { text: e.target.value })} className={field} />{q.options.map((o, j) => <div className="flex items-center gap-3" key={j}><input aria-label={`第 ${i + 1} 题正确答案 ${'ABCD'[j]}`} type="radio" name={`correct-${i}`} checked={q.correct === j} onChange={() => edit(i, { correct: j })} /><span className="font-bold">{'ABCD'[j]}</span><input aria-label={`第 ${i + 1} 题选项 ${'ABCD'[j]}`} required maxLength={120} value={o} onChange={e => edit(i, { options: q.options.map((v, k) => k === j ? e.target.value : v) })} className={field} /></div>)}<div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm">限时（秒）<input className="w-20 rounded-lg border p-2" type="number" min={10} max={120} required value={q.seconds} onChange={e => edit(i, { seconds: Number(e.target.value) })} /></label><button type="button" disabled={questions.length === 1} onClick={() => setQuestions(qs => qs.filter((_, k) => k !== i))} aria-label={`删除第 ${i + 1} 题`} className="p-2 text-slate-500 disabled:opacity-30"><Trash2 size={18} /></button></div></fieldset>)}
            <div className="flex flex-wrap gap-3"><button type="button" disabled={questions.length >= 30} className="flex items-center gap-2 rounded-xl border px-4 py-3" onClick={() => setQuestions(qs => [...qs, { text: '', options: ['', '', '', ''], correct: 0, seconds: 20 }])}><Plus size={18} />添加题目</button><button disabled={busy} className={`${button} flex-1`}>{busy ? '创建中…' : '创建房间，邀请大家'}</button></div>
          </form>}
        </div><div className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-3 text-center text-sm text-slate-500"><span>01 / 分享房间码</span><span>02 / 同时答题</span><span>03 / 见证排行榜</span></div>
      </>}
      {room && session && <>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-sm font-bold text-violet-600">{room.isHost ? '主持人控制台' : '玩家答题席'}</p><h1 className="text-3xl font-black">{room.title}</h1></div><div className="flex items-center gap-4"><span className="flex items-center gap-2 text-slate-500"><Users size={18} />{room.leaderboard.length} 人</span><span className="rounded-xl bg-violet-100 px-4 py-2 font-mono text-xl font-bold text-violet-700">{room.code}</span></div></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            {room.phase === 'lobby' ? <div className="py-8 text-center"><Users className="mx-auto text-violet-500" size={48} /><h2 className="mt-5 text-2xl font-black">集结队友，准备开场</h2><p className="mt-4 text-slate-500">打开本页面，输入房间码</p><p className="my-6 font-mono text-5xl font-black tracking-widest text-violet-700 sm:text-6xl">{room.code}</p><button className="inline-flex items-center gap-2 rounded-xl border px-4 py-3" onClick={async () => { try { await navigator.clipboard.writeText(`${location.origin}/activities/quiz?room=${room.code}`); setNotice('邀请链接已复制'); } catch { setNotice(`请分享房间码 ${room.code}`); } }}><Copy size={16} />复制邀请链接</button><p className="mt-5 text-sm text-slate-400">{room.total} 道题 · 答对得 500–1000 分，越快分数越高 · 同分并列</p>{room.isHost ? <button disabled={busy || !room.leaderboard.length} className={`${button} mt-7`} onClick={() => void act('next')}>开始答题</button> : <p className="mt-7 font-bold text-violet-600">已加入！等待主持人开始…</p>}</div> : room.phase === 'finished' ? <div className="py-12 text-center"><Trophy className="mx-auto text-amber-500" size={72} /><h2 className="mt-6 text-4xl font-black">挑战完成！</h2><p className="mt-5 text-xl">🏆 {room.leaderboard.filter(p => p.rank === 1).map(p => p.name).join('、')}</p><p className="mt-3 text-slate-500">{room.leaderboard[0]?.score || 0} 分 · 感谢每一位参与者</p><button onClick={leave} className={`${button} mt-8`}>再办一场</button></div> : <>
              <div className="mb-6 flex items-center justify-between text-sm font-bold"><span className="text-violet-600">第 {room.index + 1} / {room.total} 题</span><span className="rounded-full bg-violet-100 px-4 py-2 text-violet-700">{live ? `${remaining} 秒` : '答案揭晓'}</span></div>
              <h2 className="mb-8 text-2xl font-black leading-relaxed sm:text-3xl">{room.question?.text}</h2>
              <div className="grid gap-3 sm:grid-cols-2">{room.question?.options.map((o, i) => <button key={i} disabled={busy || room.isHost || !live || remaining === 0 || room.answered} onClick={() => void act('answer', i)} className={`${colors[i]} min-h-28 rounded-2xl p-5 text-left text-lg font-bold text-white transition hover:brightness-110 disabled:cursor-default ${room.myChoice === i ? 'ring-4 ring-violet-300 ring-offset-2' : ''}`}><span className="mr-3 opacity-75">{'ABCD'[i]}</span>{o}{!live && <span className="mt-3 block text-sm">{room.question?.correct === i ? '✓ 正确答案 · ' : ''}{room.question?.counts?.[i]} 人选择</span>}</button>)}</div>
              <div role="status" className="mt-6 text-center text-slate-500">{live ? room.answered ? '✓ 答案已提交，等待揭晓' : remaining === 0 ? '时间到，正在同步结果…' : room.isHost ? '大家正在作答…' : '选定即提交，每题只有一次机会' : room.myChoice !== undefined ? room.myChoice === room.question?.correct ? '答对了！继续保持。' : '这题差一点，下一题加油！' : '本题已结束'}<p className="mt-2 text-sm">{room.answerCount} / {room.leaderboard.length} 人已作答</p></div>
              {room.isHost && <button disabled={busy} className={`${button} mt-6 w-full`} onClick={() => void act(live ? 'reveal' : 'next')}>{live ? '结束本题并公布答案' : room.index + 1 === room.total ? '公布最终排行榜' : '下一题 →'}</button>}
            </>}
          </section>
          <aside className="self-start rounded-3xl bg-slate-900 p-6 text-white"><h2 className="mb-2 flex items-center gap-2 text-xl font-black"><Trophy className="text-amber-400" />{room.phase === 'finished' ? '最终排行榜' : '排行榜'}</h2><p className="mb-6 text-xs text-slate-400">每题揭晓后更新 · 同分并列</p>{!room.leaderboard.length && <p className="py-8 text-sm text-slate-400">虚位以待，邀请第一位玩家吧</p>}<ol className="max-h-[600px] space-y-3 overflow-y-auto">{room.leaderboard.map(p => <li key={p.id} className={`flex items-center gap-3 rounded-xl p-3 ${p.id === room.me ? 'bg-violet-600' : 'bg-white/5'}`}><span className="w-6 font-black text-amber-300">{p.rank}</span><span className="min-w-0 flex-1 break-words">{p.name}{p.id === room.me ? '（你）' : ''}</span><strong>{p.score}</strong></li>)}</ol></aside>
        </div>
      </>}
    </main>
  </div>;
}
