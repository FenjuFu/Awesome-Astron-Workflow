import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src 'none'; connect-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
function previewDocument(html: string) {
  // The policy is parsed before any model-generated markup; the iframe has an opaque origin.
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer"></head><body>${html}</body></html>`;
}
export default function SparkPlayground() {
  const { language } = useLanguage();
  const zh = language === 'zh-CN';
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [mobile, setMobile] = useState(false);
  const [edit, setEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const samples = zh ? [
    ['信息卡片', '制作一张精美的 Spark X2.6 4B 模型介绍卡片，突出轻量、开源、本地部署。使用紫色渐变和清晰的排版，不编造性能数据。'],
    ['小游戏', '制作一个贪吃蛇小游戏，有分数、重新开始按钮、键盘方向键和手机触摸方向按钮，采用复古像素风。'],
    ['交互 Demo', '制作一个交互式太阳系演示，可以暂停动画、调整速度，点击行星查看简短介绍，注明大小和距离非真实比例。'],
    ['实用工具', '制作一个番茄钟，支持工作和休息时间设置、开始暂停重置，用圆形进度展示剩余时间。'],
  ] : [
    ['Info card', 'Create a polished Spark X2.6 4B introduction card about its compact size, open weights and local deployment. Use purple gradients. Do not invent benchmark results.'],
    ['Mini game', 'Build a snake game with score, restart, arrow keys and mobile direction buttons. Use a retro pixel style.'],
    ['Interactive demo', 'Build an animated solar system with pause, speed controls and clickable planet descriptions. Label size and distances as not to scale.'],
    ['Useful tool', 'Build a Pomodoro timer with configurable work and break durations, start, pause, reset and a circular progress indicator.'],
  ];
  async function generate() {
    if (busy || !prompt.trim()) return;
    const controller = new AbortController(); abort.current = controller;
    setBusy(true); setError('');
    const timeout = window.setTimeout(() => controller.abort(), 100000);
    try {
      const res = await fetch('/api/playground', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, ...(edit && code ? { html: code } : {}) }), signal: controller.signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      if (typeof data.html !== 'string') throw new Error('Invalid model response');
      setCode(data.html); setPreview(data.html); setTab('preview'); setEdit(true);
    } catch (e) { setError(controller.signal.aborted ? (zh ? '生成已停止或超时，之前的作品已保留。' : 'Generation stopped or timed out. Your previous work is preserved.') : e instanceof Error ? e.message : 'Generation failed'); }
    finally { clearTimeout(timeout); setBusy(false); abort.current = null; }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/html;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'spark-playground.html'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const button = 'rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-indigo-50 disabled:opacity-40';
  return <section id="spark-playground" className="mb-10 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm">
    <div className="bg-gradient-to-r from-indigo-950 to-purple-800 p-6 text-white">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-200">Build with Spark</p>
      <h2 className="text-2xl font-bold">Spark X2.6 4B Playground</h2>
      <p className="mt-2 text-sm text-indigo-100">{zh ? '把一句想法变成可以玩的网页。创建信息卡片、小游戏和交互 Demo。' : 'Turn an idea into a working webpage. Create cards, mini games and interactive demos.'}</p>
    </div>
    <div className="grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4 border-b border-gray-100 p-5 lg:border-b-0 lg:border-r">
        <div className="flex flex-wrap gap-2">{samples.map(([label, value]) => <button type="button" key={label} disabled={busy} className={button} onClick={() => { setPrompt(value); setEdit(false); }}>{label}</button>)}</div>
        <label className="block text-sm font-medium" htmlFor="spark-prompt">{zh ? '你想做什么？' : 'What would you like to build?'}</label>
        <textarea id="spark-prompt" value={prompt} disabled={busy} maxLength={3000} onChange={e => setPrompt(e.target.value)} className="min-h-40 w-full resize-y rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-400" placeholder={zh ? '描述外观、内容和交互方式…' : 'Describe the look, content and interactions…'} />
        {code && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit} disabled={busy} onChange={e => setEdit(e.target.checked)} />{zh ? '在当前作品上修改' : 'Edit the current result'}</label>}
        <button type="button" onClick={generate} disabled={busy || !prompt.trim()} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{busy ? (zh ? '正在生成…' : 'Generating…') : edit && code ? (zh ? '修改作品' : 'Update result') : (zh ? '生成网页' : 'Generate webpage')}</button>
        {busy && <button type="button" className={button} onClick={() => abort.current?.abort()}>{zh ? '停止等待' : 'Stop waiting'}</button>}
        <p className="text-xs leading-relaxed text-gray-500">{zh ? '由 Spark X2.6 4B 生成，通常需要几十秒。输入和当前修改的代码会发送给模型服务，请勿填写私密信息。' : 'Generated by Spark X2.6 4B, usually in tens of seconds. Your prompt and code being edited are sent to the model service. Avoid private information.'}</p>
        <p role="status" aria-live="polite" className="text-sm text-red-600">{error}</p>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-3">
          <button type="button" className={button} aria-pressed={tab === 'preview'} onClick={() => setTab('preview')}>{zh ? '效果预览' : 'Preview'}</button>
          <button type="button" className={button} aria-pressed={tab === 'code'} onClick={() => setTab('code')}>{zh ? 'HTML 代码' : 'HTML code'}</button>
          <button type="button" className={button} aria-pressed={mobile} onClick={() => setMobile(!mobile)}>{mobile ? (zh ? '手机' : 'Mobile') : (zh ? '桌面' : 'Desktop')}</button>
          <button type="button" disabled={!code || busy} className={button} onClick={() => { setPreview(code); setTab('preview'); }}>{zh ? '运行代码' : 'Run code'}</button>
          <button type="button" disabled={!code} className={button} onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setError(zh ? '复制失败，请在代码页手动复制。' : 'Copy failed. Select and copy the code manually.'); } }}>{copied ? (zh ? '已复制' : 'Copied') : (zh ? '复制' : 'Copy')}</button>
          <button type="button" disabled={!code} className={button} onClick={download}>{zh ? '下载 HTML' : 'Download HTML'}</button>
        </div>
        {tab === 'code' ? <textarea aria-label="HTML code" spellCheck={false} value={code} disabled={busy} onChange={e => setCode(e.target.value)} maxLength={100000} className="h-[520px] w-full resize-y bg-slate-950 p-4 font-mono text-sm text-slate-100" /> : <div className="min-h-[520px] bg-slate-100 p-3">
          {preview ? <iframe key={preview} title="Spark generated webpage" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={previewDocument(preview)} className={`mx-auto h-[500px] max-w-full rounded-lg border-0 bg-white ${mobile ? 'w-[375px]' : 'w-full'}`} /> : <div className="flex h-[490px] flex-col items-center justify-center gap-3 px-6 text-center text-gray-500"><span className="text-4xl" aria-hidden="true">✦</span><p>{zh ? '从一个想法开始' : 'Start with an idea'}</p><p className="text-sm">{zh ? '选择左侧示例或输入需求，生成后在这里直接体验。' : 'Choose an example or describe your idea, then try the result here.'}</p></div>}
        </div>}
        <p className="px-4 py-3 text-xs text-gray-500">{zh ? '预览限制联网与外部资源。下载的 HTML 在浏览器中运行时不再受本站预览限制。' : 'Preview blocks network access and external resources. Downloaded HTML runs outside this preview sandbox.'}</p>
      </div>
    </div>
  </section>;
}
