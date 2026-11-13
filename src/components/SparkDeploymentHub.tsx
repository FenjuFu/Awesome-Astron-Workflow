import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Copy, Search, Sparkles, Terminal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { sparkDeployments, sparkDeploymentChecked, type DeploymentCategory, type Localized } from '../data/sparkDeployments';

const categories: { id: 'all' | DeploymentCategory; en: string; zh: string }[] = [
  { id: 'all', en: 'All ways', zh: '全部方式' },
  { id: 'cloud', en: 'Online & distribution', zh: '在线与分发' },
  { id: 'desktop', en: 'Desktop', zh: '桌面安装' },
  { id: 'developer', en: 'Python & MLX', zh: 'Python 与 MLX' },
  { id: 'server', en: 'GPU & NPU servers', zh: 'GPU／NPU 服务' },
  { id: 'edge', en: 'Browser, phone & ARM', zh: '浏览器／手机／ARM' },
  { id: 'advanced', en: 'More runtimes & DSpark', zh: '更多运行时与 DSpark' },
];

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className = 'inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-medium text-violet-800 transition hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600';
  return href.startsWith('/')
    ? <Link className={className} to={href}>{children}<ArrowUpRight size={13} aria-hidden="true" /></Link>
    : <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={13} aria-hidden="true" /></a>;
}

function CommandBlock({ value, label, zh }: { value: string; label?: string; zh: boolean }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }
  return <div className="mt-4 min-w-0 overflow-hidden rounded-xl bg-slate-950 text-slate-100">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
      <span className="flex min-w-0 items-center gap-2 text-xs text-violet-200"><Terminal size={14} aria-hidden="true" />{label || 'Terminal'}</span>
      <button type="button" onClick={copy} aria-label={zh ? '复制示例代码' : 'Copy example code'} className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-violet-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
        {status === 'copied' ? <Check size={14} /> : <Copy size={14} />}{status === 'copied' ? (zh ? '已复制' : 'Copied') : (zh ? '复制' : 'Copy')}
      </button>
    </div>
    <pre className="max-h-96 overflow-auto p-4 text-xs leading-6" tabIndex={0} aria-label={zh ? '可滚动示例代码' : 'Scrollable example code'}><code>{value}</code></pre>
    <p className="sr-only" role="status">{status === 'copied' ? (zh ? '代码已复制' : 'Code copied') : ''}</p>
    {status === 'failed' && <p role="status" className="px-4 pb-3 text-xs text-amber-200">{zh ? '无法访问剪贴板，请在代码框中手动选择复制。' : 'Clipboard access failed. Select and copy the code manually.'}</p>}
  </div>;
}

export default function SparkDeploymentHub() {
  const { language } = useLanguage();
  const zh = language === 'zh-CN';
  const text = (value: Localized) => zh ? value.zh : value.en;
  const [category, setCategory] = useState<'all' | DeploymentCategory>('all');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = sparkDeployments.filter(item =>
    (category === 'all' || item.category === category)
    && (!normalizedQuery || [item.name, item.environment, item.description.en, item.description.zh, item.note.en, item.note.zh].join(' ').toLocaleLowerCase().includes(normalizedQuery))
  );

  return <section id="spark-x26-deploy" aria-labelledby="spark-deploy-title" className="mt-12 scroll-mt-24">
    <header className="overflow-hidden rounded-2xl border border-violet-300/30 bg-gradient-to-br from-[#1d102e] via-[#30204c] to-[#4b286d] p-6 text-white sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-violet-200"><Sparkles size={16} aria-hidden="true" /><span>SPARK-X2.6-4B</span><span className="rounded-full border border-violet-200/30 px-2.5 py-1">{zh ? '安装 · 部署 · 在线调用' : 'Install · Deploy · Call online'}</span></div>
      <h2 id="spark-deploy-title" className="mt-4 text-2xl font-bold sm:text-3xl">{zh ? '让 Spark 4B 在你的设备与应用里跑起来' : 'Run Spark 4B where you build'}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-violet-100">{zh ? '从星辰 MaaS 在线 API，到电脑、手机、浏览器与服务器。按设备选入口，展开查看步骤、命令和公开示例。' : 'From Astron MaaS APIs to desktops, phones, browsers and servers. Choose a route for your setup, then expand it for steps, commands and public examples.'}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/api-sponsorship" className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-4 py-2.5 text-sm font-semibold text-violet-950 hover:bg-white">{zh ? '星辰 MaaS · API 赞助指南' : 'Astron MaaS · API sponsorship'}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        <a href="https://flashhub.top/repositories/37" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200/40 px-4 py-2.5 text-sm font-medium hover:bg-white/10">FlashHub / FlashRT<ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </header>

    <div className="mt-5 rounded-xl border border-violet-100 bg-white p-5 text-sm leading-7 text-slate-600">
      <p>{zh ? '先选格式：Ollama／llama.cpp／LM Studio 用 GGUF；Transformers／服务框架用原始权重；MLX 用其专用转换产物；WebGPU 用社区 ONNX。上下文与并发另占内存，模型文件大小不等于总内存需求。' : 'Choose the right format: GGUF for Ollama / llama.cpp / LM Studio; original checkpoints for Transformers / serving frameworks; converted checkpoints for MLX; community ONNX for WebGPU. Context and concurrency add memory beyond the model file.'}</p>
      <div className="mt-3 flex flex-wrap gap-2"><SourceLink href="https://huggingface.co/collections/XHToken/spark-x26">Hugging Face</SourceLink><SourceLink href="https://www.modelscope.cn/collections/XHToken/Spark-X26">ModelScope · 魔搭</SourceLink><SourceLink href="https://github.com/XHToken/Spark-X2.6/blob/X2.6/FAQ.md">{zh ? '版本与部署 FAQ' : 'Version & deployment FAQ'}</SourceLink></div>
    </div>

    <div className="mt-6 flex flex-col gap-4">
      <label className="relative block w-full sm:max-w-md"><span className="sr-only">{zh ? '搜索 Spark 部署方式' : 'Search Spark deployment methods'}</span><Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={zh ? '搜索设备、运行时或平台…' : 'Search a device, runtime or platform…'} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" /></label>
      <div className="flex flex-wrap gap-2" aria-label={zh ? '部署分类' : 'Deployment categories'}>{categories.map(item => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)} className={`rounded-full px-3.5 py-2 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${category === item.id ? 'bg-violet-700 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'}`}>{zh ? item.zh : item.en}<span className="ml-1.5 opacity-70">{item.id === 'all' ? sparkDeployments.length : sparkDeployments.filter(method => method.category === item.id).length}</span></button>)}</div>
    </div>

    <p role="status" className="my-4 text-xs text-slate-500">{zh ? `显示 ${filtered.length} / ${sparkDeployments.length} 种方式` : `Showing ${filtered.length} of ${sparkDeployments.length} routes`}</p>
    <div className="grid items-start gap-5 md:grid-cols-2">
      {filtered.map(item => <article key={item.id} id={`spark-${item.id}`} className="min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.kind === 'official' ? 'bg-violet-50 text-violet-800' : 'bg-slate-100 text-slate-600'}`}>{item.kind === 'official' ? (zh ? '官方文档路径' : 'Officially documented') : (zh ? '社区方案' : 'Community route')}</span><span className="text-[11px] text-slate-500">{zh ? categories.find(c => c.id === item.category)?.zh : categories.find(c => c.id === item.category)?.en}</span></div>
        <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
        <p className="mt-1 break-words text-xs leading-6 text-violet-700">{item.environment}</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{text(item.description)}</p>
        <div className="mt-4 flex flex-wrap gap-2">{item.links.slice(0, 2).map(source => <SourceLink key={source.href} href={source.href}>{text(source.label)}</SourceLink>)}</div>
        <details className="group mt-5 border-t border-slate-100 pt-4">
          <summary className="cursor-pointer rounded text-sm font-semibold text-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">{zh ? '安装步骤、示例与适用条件' : 'Setup, examples & requirements'}</summary>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-600">{item.steps.map(step => <li key={step.en}>{text(step)}</li>)}</ol>
          {item.code && <CommandBlock value={item.code} label={item.codeLabel} zh={zh} />}
          <p className="mt-4 rounded-xl bg-violet-50/70 p-4 text-xs leading-6 text-slate-600">{text(item.note)}</p>
          {item.links.length > 2 && <div className="mt-4 flex flex-wrap gap-2">{item.links.slice(2).map(source => <SourceLink key={source.href} href={source.href}>{text(source.label)}</SourceLink>)}</div>}
        </details>
      </article>)}
    </div>
    {filtered.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{zh ? '未找到匹配方式，试试清空搜索或切换分类。' : 'No matching route. Clear the search or choose another category.'}</p>}
    <p className="mt-5 text-xs leading-6 text-slate-500">{zh ? `资料检索日期：${sparkDeploymentChecked}（UTC）。逐方式检索官方仓库、模型卡、社区讨论、应用商店与公开示例；不代表全网穷尽或逐设备独立实测。入口、依赖与服务额度可能变化，具体限制见各项展开内容。` : `Sources searched: ${sparkDeploymentChecked} (UTC). Each route was researched across official repositories, model cards, community discussions, stores and public examples; this is not an exhaustive web inventory or an independent test on every device. Availability, dependencies and quotas can change; see each route’s requirements.`}</p>
  </section>;
}
