import NewYearFair from './NewYearFair';
import PlaygroundIdeas from './PlaygroundIdeas';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { withComfortableSpacing } from '../data/playgroundPresentation';

const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src 'none'; connect-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const snapshotBridge = `<script>window.addEventListener('keydown',function(event){if(event.key==='Escape')parent.postMessage({type:'spark-exit-fullscreen'},'*');});window.addEventListener('message',function(event){
 if(event.source!==parent||event.data?.type!=='spark-snapshot-request')return;
 const copy=document.documentElement.cloneNode(true);
 const originals=document.querySelectorAll('input,textarea,select');
 copy.querySelectorAll('input,textarea,select').forEach((node,i)=>{
  const original=originals[i];
  if(node.tagName==='TEXTAREA')node.textContent=original.value;
  else if(node.tagName==='SELECT')Array.from(node.options).forEach((option,j)=>{if(original.options[j].selected)option.setAttribute('selected','');else option.removeAttribute('selected');});
  else{node.setAttribute('value',original.value);if(original.checked)node.setAttribute('checked','');else node.removeAttribute('checked');}
  node.setAttribute('disabled','');
 });
 copy.querySelectorAll('script,iframe,object,embed').forEach(node=>node.remove());
 copy.querySelectorAll('*').forEach(node=>Array.from(node.attributes).forEach(attr=>{if(attr.name.toLowerCase().startsWith('on'))node.removeAttribute(attr.name);}));
 copy.querySelectorAll('button').forEach(node=>node.setAttribute('disabled',''));
 const note=document.createElement('p');note.textContent='这是保存的静态纪念页，保留了当时的内容与选择。';copy.querySelector('body').append(note);
 parent.postMessage({type:'spark-snapshot-ready',id:event.data.id,html:'<!DOCTYPE html>'+copy.outerHTML},'*');
});<\/script>`;
function previewDocument(html: string) {
  html = withComfortableSpacing(html);
  // The policy is parsed before any model-generated markup; the iframe has an opaque origin.
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer">${snapshotBridge}</head><body>${html}</body></html>`;
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
  const [downloadUrl, setDownloadUrl] = useState('');
  const [snapshotHtml, setSnapshotHtml] = useState('');
  const [snapshotUrl, setSnapshotUrl] = useState('');
  const [expanded, setExpanded] = useState(false);
  const previewPanel = useRef<HTMLDivElement>(null);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  const previewFrame = useRef<HTMLIFrameElement>(null);
  const snapshotRequest = useRef('');
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    const changed = () => setExpanded(document.fullscreenElement === previewPanel.current);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) setExpanded(false);
    };
    window.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', escape);
      fullscreenButton.current?.focus();
    };
  }, [expanded]);
  async function toggleFullscreen() {
    if (expanded) {
      if (document.fullscreenElement === previewPanel.current) await document.exitFullscreen().catch(() => {});
      setExpanded(false);
    } else {
      // Keep the same iframe mounted: game state and story progress survive both transitions.
      try { await previewPanel.current?.requestFullscreen?.(); } catch { /* Use the viewport-filling fallback. */ }
      setExpanded(true);
    }
  }
  useEffect(() => {
    if (!code) { setDownloadUrl(''); return; }
    const url = URL.createObjectURL(new Blob([withComfortableSpacing(code)], { type: 'text/html;charset=utf-8' }));
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [code]);
  useEffect(() => {
    setSnapshotHtml(''); snapshotRequest.current = '';
  }, [preview]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== previewFrame.current?.contentWindow) return;
      if (event.data?.type === 'spark-exit-fullscreen') { if (!document.fullscreenElement) setExpanded(false); return; }
      if (event.data?.type !== 'spark-snapshot-ready' || !snapshotRequest.current || event.data.id !== snapshotRequest.current) return;
      if (typeof event.data.html === 'string' && event.data.html.length <= 250000) setSnapshotHtml(event.data.html);
      snapshotRequest.current = '';
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);
  useEffect(() => {
    if (!snapshotHtml) { setSnapshotUrl(''); return; }
    const url = URL.createObjectURL(new Blob([snapshotHtml], { type: 'text/html;charset=utf-8' }));
    setSnapshotUrl(url); return () => URL.revokeObjectURL(url);
  }, [snapshotHtml]);
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
  const button = 'min-h-11 rounded-lg border border-gray-200 px-4 py-2.5 text-sm leading-relaxed hover:bg-indigo-50 disabled:opacity-40';
  return <><NewYearFair zh={zh} onCreate={() => { document.getElementById('spark-playground')?.scrollIntoView({ behavior: 'smooth' }); document.getElementById('spark-prompt')?.focus(); }} /><section id="spark-playground" className="mb-10 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm">
    <div className="bg-gradient-to-r from-indigo-950 to-purple-800 p-6 text-white">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-200">Build with Spark</p>
      <h2 className="text-2xl font-bold">Spark X2.6 4B Playground</h2>
      <p className="mt-2 text-sm text-indigo-100">{zh ? '把一句想法变成可以玩的网页。创建信息卡片、小游戏和交互 Demo。' : 'Turn an idea into a working webpage. Create cards, mini games and interactive demos.'}</p>
    </div>
    <div className="grid xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-6 border-b border-gray-100 p-6 xl:border-b-0 xl:border-r">
        <PlaygroundIdeas zh={zh} disabled={busy} onUse={(value) => { setPrompt(value); setEdit(false); setError(''); document.getElementById('spark-prompt')?.focus(); }} />
        <label className="block text-sm font-medium" htmlFor="spark-prompt">{zh ? '你想做什么？（括号内可 DIY）' : 'What would you like to build? (Edit the parentheses)'}</label>
        <textarea id="spark-prompt" value={prompt} disabled={busy} maxLength={12000} onChange={e => setPrompt(e.target.value)} className="min-h-40 w-full resize-y rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-400" placeholder={zh ? '描述外观、内容和交互方式…' : 'Describe the look, content and interactions…'} />
        {code && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit} disabled={busy} onChange={e => setEdit(e.target.checked)} />{zh ? '在当前作品上修改' : 'Edit the current result'}</label>}
        <button type="button" onClick={generate} disabled={busy || !prompt.trim()} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{busy ? (zh ? '正在生成…' : 'Generating…') : edit && code ? (zh ? '修改作品' : 'Update result') : (zh ? '生成网页' : 'Generate webpage')}</button>
        {busy && <button type="button" className={button} onClick={() => abort.current?.abort()}>{zh ? '停止等待' : 'Stop waiting'}</button>}
        <p className="text-xs leading-relaxed text-gray-500">{zh ? '由 Spark X2.6 4B 生成，通常需要几十秒。输入和当前修改的代码会发送给模型服务，请勿填写私密信息。' : 'Generated by Spark X2.6 4B, usually in tens of seconds. Your prompt and code being edited are sent to the model service. Avoid private information.'}</p>
        <p role="status" aria-live="polite" className="text-sm text-red-600">{error}</p>
      </div>
      <div ref={previewPanel} data-testid="work-preview-panel" className={expanded ? 'fixed inset-0 z-[100] flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-white' : 'min-w-0'}>
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4 sm:p-5">
          <button type="button" className={button} aria-pressed={tab === 'preview'} onClick={() => setTab('preview')}>{zh ? '效果预览' : 'Preview'}</button>
          <button type="button" className={button} aria-pressed={tab === 'code'} onClick={() => setTab('code')}>{zh ? 'HTML 代码' : 'HTML code'}</button>
          <button type="button" className={button} aria-pressed={mobile} onClick={() => setMobile(!mobile)}>{mobile ? (zh ? '手机' : 'Mobile') : (zh ? '桌面' : 'Desktop')}</button>
          <button ref={fullscreenButton} type="button" className={button} disabled={!preview || tab !== 'preview'} aria-pressed={expanded} onClick={toggleFullscreen}>{expanded ? (zh ? '退出全屏' : 'Exit fullscreen') : (zh ? '全屏体验' : 'Fullscreen')}</button>
          <button type="button" disabled={!code || busy} className={button} onClick={() => { const formatted = withComfortableSpacing(code); setCode(formatted); setPreview(formatted); setTab('preview'); }}>{zh ? '运行代码' : 'Run code'}</button>
          <button type="button" disabled={!code} className={button} onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setError(zh ? '复制失败，请在代码页手动复制。' : 'Copy failed. Select and copy the code manually.'); } }}>{copied ? (zh ? '已复制' : 'Copied') : (zh ? '复制' : 'Copy')}</button>
          <a href={downloadUrl || undefined} download="spark-2027-creation.html" aria-disabled={!code} tabIndex={code ? 0 : -1} className={`${button} ${code ? '' : 'pointer-events-none opacity-40'}`}>{zh ? '下载 HTML' : 'Download HTML'}</a>
          <button type="button" className={button} disabled={!preview || tab !== 'preview'} onClick={() => { snapshotRequest.current = crypto.randomUUID(); previewFrame.current?.contentWindow?.postMessage({ type: 'spark-snapshot-request', id: snapshotRequest.current }, '*'); }}>{zh ? '保存当前纪念页' : 'Capture keepsake'}</button>
          {snapshotUrl && <a href={snapshotUrl} download="spark-2027-keepsake.html" className={button}>{zh ? '下载纪念页' : 'Download keepsake'}</a>}
        </div>
        {tab === 'code' ? <textarea aria-label="HTML code" spellCheck={false} value={code} disabled={busy} onChange={e => setCode(e.target.value)} maxLength={100000} className={`${expanded ? 'min-h-0 flex-1' : 'h-[680px]'} w-full resize-y bg-slate-950 p-5 font-mono text-sm text-slate-100`} /> : <div className={expanded ? 'min-h-0 flex-1 bg-slate-100 p-0' : 'min-h-[680px] bg-slate-100 p-4 sm:p-5'}>
          {preview ? <iframe ref={previewFrame} key={preview} title="Spark generated webpage" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={previewDocument(preview)} className={expanded ? 'h-full w-full border-0 bg-white' : `mx-auto h-[640px] max-w-full rounded-xl border-0 bg-white ${mobile ? 'w-[375px]' : 'w-full'}`} /> : <div className="flex h-[620px] flex-col items-center justify-center gap-5 px-6 text-center text-gray-500"><span className="text-4xl" aria-hidden="true">✦</span><p>{zh ? '从一个想法开始' : 'Start with an idea'}</p><p className="text-sm">{zh ? '选择左侧示例或输入需求，生成后在这里直接体验。' : 'Choose an example or describe your idea, then try the result here.'}</p></div>}
        </div>}
        <p className="px-4 py-3 text-xs text-gray-500">{zh ? '下载 HTML：保存可玩的网页，重新打开从头开始。保存当前纪念页：保留昵称、选择和接龙文字的静态页面。预览限制联网；下载的可玩 HTML 不再受本站预览限制。' : 'Download HTML saves the playable app, which restarts when opened. Capture keepsake preserves the current names, choices and story as a static page. Downloaded playable HTML runs outside the preview sandbox.'}</p>
      </div>
    </div>
  </section></>;
}
