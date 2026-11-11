import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { KeyRound, ShieldCheck, Terminal, ArrowUpRight, Copy, Check } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useLanguage } from '../contexts/LanguageContext';

const host = 'https://maas-api.cn-huabei-1.xf-yun.com';
const official = 'https://maas.xfyun.cn/experience/text2text?type=public&modelServiceId=2629472627539999&modelType=1';
const protocols = [
  { name: 'OpenAI Chat', path: '/v2/chat/completions', body: { model: 'spark-x2.6-4b', messages: [{ role: 'user', content: 'Hello.' }], stream: false } },
  { name: 'OpenAI Responses', path: '/v1/responses', body: { model: 'spark-x2.6-4b', input: 'Hello.', stream: false } },
  { name: 'Anthropic Messages', path: '/anthropic/v1/messages', body: { model: 'spark-x2.6-4b', max_tokens: 256, messages: [{ role: 'user', content: 'Hello.' }], stream: false } },
];

function CodeBlock({ value, label, zh }: { value: string; label: string; zh: boolean }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(value); setStatus(zh ? '已复制' : 'Copied'); }
    catch { setStatus(zh ? '复制失败，请手动选择文本复制' : 'Copy failed; select and copy the text manually'); }
  }
  return <div className="overflow-hidden rounded-xl border border-violet-200 bg-slate-950 text-slate-100">
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-xs">
      <span className="text-violet-200">{label}</span>
      <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10"><Copy size={14} />{zh ? '复制' : 'Copy'}</button>
    </div>
    <pre className="overflow-x-auto p-4 text-xs leading-6 sm:text-sm" tabIndex={0}><code>{value}</code></pre>
    {status && <p role="status" className="px-4 pb-3 text-xs text-violet-200">{status}</p>}
  </div>;
}

export default function ApiSponsorship() {
  const { language } = useLanguage();
  const zh = language === 'zh-CN';
  const [passphrase, setPassphrase] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [protocol, setProtocol] = useState(0);
  // Secrets live only in component memory; clear after 10 minutes or leaving the page.
  useEffect(() => {
    if (!apiKey) return;
    const clear = () => { setApiKey(''); setVisible(false); setCopied(false); };
    const timer = window.setTimeout(clear, 600000);
    window.addEventListener('pagehide', clear);
    return () => { window.clearTimeout(timer); window.removeEventListener('pagehide', clear); };
  }, [apiKey]);
  const messages: Record<string, string> = zh ? {
    invalid_passphrase: '兑换口令不正确，请核对后重试。', rate_limited: '尝试过于频繁，请 15 分钟后再试。',
    unavailable: '赞助服务暂不可用，请稍后重试或联系活动组织者。', invalid_request: '请填写口令并确认本地使用须知。',
  } : {
    invalid_passphrase: 'That code is incorrect. Please check and try again.', rate_limited: 'Too many attempts. Please try again in 15 minutes.',
    unavailable: 'Sponsorship is temporarily unavailable. Try later or contact the organizer.', invalid_request: 'Enter your code and accept the local-use guidance.',
  };
  async function redeem(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setApiKey(''); setVisible(false); setCopied(false);
    try {
      const response = await fetch('/api/sponsorship', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase, accepted }), cache: 'no-store', signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok || typeof result.apiKey !== 'string') { setError(messages[result.error] || messages.unavailable); return; }
      setApiKey(result.apiKey); setPassphrase('');
    } catch { setError(messages.unavailable); }
    finally { setBusy(false); }
  }
  async function copyKey() {
    try { await navigator.clipboard.writeText(apiKey); setCopied(true); }
    catch { setError(zh ? '剪贴板不可用，请显示 Key 后手动复制。' : 'Clipboard unavailable. Reveal the key and copy it manually.'); }
  }
  const selected = protocols[protocol];
  const curl = `curl ${host}${selected.path} \\\n  -H "Content-Type: application/json" \\\n  ${protocol === 2 ? '-H "x-api-key: $SPARK_API_KEY" \\\n  -H "anthropic-version: 2023-06-01"' : '-H "Authorization: Bearer $SPARK_API_KEY"'} \\\n  -d '${JSON.stringify(selected.body, null, 2)}'`;
  return <div className="min-h-screen bg-[#f8f7fc] text-slate-900">
    <Helmet><title>{zh ? 'API 赞助' : 'API Sponsorship'} · Astron</title><meta name="referrer" content="no-referrer" /></Helmet>
    <Navigation />
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
      <header className="mb-10 max-w-3xl">
        <p className="mb-4 text-sm font-semibold tracking-widest text-violet-700">ASTRON · API SPONSORSHIP</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{zh ? '让你的第一个想法，跑起来。' : 'Give your next idea a first run.'}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{zh ? '用活动口令领取 Spark-X2.6-4B 共享赞助 API Key，在本地开始实验。' : 'Redeem your event code for a shared, sponsored Spark-X2.6-4B API key. Start experimenting locally.'}</p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl bg-gradient-to-br from-[#201239] to-[#382259] p-6 text-white shadow-lg sm:p-8" aria-labelledby="redeem-title">
          <div className="flex items-center justify-between gap-3"><KeyRound className="text-violet-300" /><span className="rounded-full border border-violet-300/30 px-3 py-1 text-xs text-violet-200">{zh ? '社区赞助 · 共享 Key' : 'Community sponsored · Shared key'}</span></div>
          <h2 id="redeem-title" className="mt-6 text-3xl font-semibold">Spark-X2.6-4B</h2>
          <p className="mb-7 mt-2 font-mono text-sm text-violet-200">spark-x2.6-4b</p>
          <form onSubmit={redeem}>
            <label htmlFor="redeem-code" className="mb-2 block text-sm">{zh ? '兑换口令' : 'Redemption code'}</label>
            <input id="redeem-code" type="password" value={passphrase} onChange={e => setPassphrase(e.target.value)} maxLength={128} required autoComplete="off" spellCheck={false} placeholder={zh ? '输入组织者提供的口令' : 'Enter the code from your organizer'} className="w-full rounded-xl border border-violet-300/30 bg-white/10 px-4 py-3 text-white placeholder:text-violet-200/60 focus:outline-none focus:ring-2 focus:ring-violet-300" />
            <label className="my-5 flex items-start gap-3 text-sm leading-6 text-violet-100"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} required className="mt-1 h-4 w-4 shrink-0 accent-violet-400" /><span>{zh ? '我会仅在本地使用，把 Key 存入 .env，不上传云端、不提交 Git、不转发给他人。' : 'I will use the key locally, store it in .env, and keep it out of cloud tools, Git commits, and public sharing.'}</span></label>
            <button disabled={busy || !accepted || !passphrase.trim()} className="w-full rounded-xl bg-violet-200 px-5 py-3 font-semibold text-violet-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40">{busy ? (zh ? '正在兑换…' : 'Redeeming…') : (zh ? '领取赞助 API Key' : 'Redeem API key')}</button>
          </form>
          {error && <p role="alert" className="mt-4 text-sm text-rose-200">{error}</p>}
          {apiKey && <div className="mt-6 rounded-xl border border-violet-300/30 bg-black/20 p-4">
            <p role="status" className="mb-3 flex items-center gap-2 text-sm text-violet-100"><Check size={16} />{zh ? '兑换成功，请保存到本地 .env' : 'Redeemed. Save to your local .env'}</p>
            <label htmlFor="sponsored-key" className="sr-only">API Key</label><input id="sponsored-key" readOnly type={visible ? 'text' : 'password'} value={apiKey} className="w-full rounded-lg bg-black/30 p-3 font-mono text-sm" />
            <div className="mt-3 flex flex-wrap gap-4 text-sm"><button onClick={() => setVisible(!visible)}>{visible ? (zh ? '隐藏' : 'Hide') : (zh ? '显示' : 'Reveal')}</button><button onClick={copyKey}>{copied ? (zh ? '已复制' : 'Copied') : (zh ? '复制 Key' : 'Copy key')}</button><button onClick={() => { setApiKey(''); setVisible(false); }}>{zh ? '清除' : 'Clear'}</button></div>
            <p className="mt-3 text-xs leading-5 text-violet-200">{zh ? '页面不会持久保存 Key，10 分钟后自动清除。复制后请留意系统剪贴板历史与跨设备同步。' : 'The page does not persist the key and clears it after 10 minutes. Check clipboard history and cross-device clipboard sync after copying.'}</p>
          </div>}
          <p className="mt-5 text-xs leading-6 text-violet-200">{zh ? '领取者无需向本站付费。共享赞助不是独立账户额度，不承诺无限调用、固定有效期或生产 SLA；可用性以赞助方和上游服务状态为准。' : 'No payment to this site is required. This is shared sponsorship, not individual account credit. Unlimited calls, a fixed validity period, and a production SLA are not promised; availability depends on the sponsor and upstream service.'}</p>
        </section>
        <aside className="rounded-2xl border border-violet-100 bg-white p-6 sm:p-8">
          <ShieldCheck className="mb-5 text-violet-600" /><h2 className="text-xl font-semibold">{zh ? 'Key 留在本地，实验由你掌控' : 'Keep your key local'}</h2>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <li>{zh ? '保存到本地项目的 .env，并把 .env / .env.* 加入 .gitignore。不要放进前端代码或带 VITE_ / NEXT_PUBLIC_ 前缀的变量。' : 'Save it in a local .env and ignore .env / .env.* in Git. Never put it in frontend code or VITE_ / NEXT_PUBLIC_ variables.'}</li>
            <li>{zh ? '不要粘贴到在线聊天、云端 IDE、托管工作流、截图或公开 Issue；也不要通过网盘同步 .env。' : 'Do not paste it into online chats, cloud IDEs, hosted workflows, screenshots, or public issues. Do not sync .env to cloud storage.'}</li>
            <li>{zh ? '本地保存不等于离线推理：调用时，Key 和请求内容仍会通过 HTTPS 发往讯飞官方接口。请勿发送敏感数据。' : 'Local storage does not mean offline inference: API calls send the key and request content to the official iFLYTEK endpoint over HTTPS. Avoid sensitive data.'}</li>
            <li>{zh ? '本站不代理模型请求。兑换限流仅保留短期地址哈希和计数，不保存你输入的口令或兑换返回的 Key。' : 'This site does not proxy model requests. Redemption throttling retains only short-lived address hashes and counts, not submitted codes or returned keys.'}</li>
          </ul>
        </aside>
      </div>
      <section className="mt-12" aria-labelledby="docs-title">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 id="docs-title" className="flex items-center gap-3 text-2xl font-bold"><Terminal className="text-violet-600" />{zh ? '从本地 .env 到第一次调用' : 'From local .env to your first call'}</h2><a href={official} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-violet-700">{zh ? '官方模型体验与接入入口' : 'Official model & API entry'}<ArrowUpRight size={16} /></a></div>
        <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? '在本地编辑器创建 .env，把占位符换成刚领取的 Key。以下终端示例适用于 macOS / Linux / WSL / Git Bash；Windows PowerShell 请使用下方 Python 示例。' : 'Create .env in your local editor and replace the placeholder with your redeemed key. Terminal examples use macOS / Linux / WSL / Git Bash; for Windows PowerShell, use the Python example below.'}</p>
        <div className="grid gap-4 md:grid-cols-2"><CodeBlock label=".env" zh={zh} value={'SPARK_API_KEY=PASTE_YOUR_KEY_HERE\nSPARK_MODEL=spark-x2.6-4b'} /><CodeBlock label=".gitignore" zh={zh} value={'.env\n.env.*\n!.env.example'} /></div>
        <div className="my-4"><CodeBlock label={zh ? '在终端加载自己创建的 .env' : 'Load the .env you created'} zh={zh} value={'set -a\n. ./.env\nset +a'} /></div>
        <div className="mb-4 flex flex-wrap gap-2" aria-label={zh ? '调用协议' : 'API protocol'}>{protocols.map((item, index) => <button key={item.name} onClick={() => setProtocol(index)} aria-pressed={protocol === index} className={`rounded-full px-4 py-2 text-sm font-medium ${protocol === index ? 'bg-violet-700 text-white' : 'border border-violet-200 bg-white text-violet-800'}`}>{item.name}</button>)}</div>
        <p className="mb-3 break-all font-mono text-xs text-slate-500">POST {host}{selected.path}</p>
        <CodeBlock key={protocol} label={`${selected.name} · cURL`} zh={zh} value={curl} />
        <details className="mt-5 rounded-xl border border-violet-100 bg-white p-5"><summary className="cursor-pointer font-medium">{zh ? 'Python 示例（Windows / macOS / Linux）' : 'Python example (Windows / macOS / Linux)'}</summary><div className="mt-4"><CodeBlock zh={zh} label="pip install openai python-dotenv" value={'import os\nfrom dotenv import load_dotenv\nfrom openai import OpenAI\n\nload_dotenv()\nclient = OpenAI(\n    api_key=os.environ["SPARK_API_KEY"],\n    base_url="https://maas-api.cn-huabei-1.xf-yun.com/v2",\n)\nresponse = client.chat.completions.create(\n    model="spark-x2.6-4b",\n    messages=[{"role": "user", "content": "Hello."}],\n)\nprint(response.choices[0].message.content)'} /></div></details>
        <p className="mt-5 text-sm leading-7 text-slate-500">{zh ? '遇到 401：核对 Key 是否完整、是否仍有效。遇到 403：联系赞助方检查模型授权。遇到 429：降低并发，稍后重试。不要公开包含 Key 的报错截图。' : '401: check that the key is complete and valid. 403: ask the sponsor to check model authorization. 429: reduce concurrency and retry later. Keep keys out of error screenshots.'}</p>
      </section>
    </main>
  </div>;
}
