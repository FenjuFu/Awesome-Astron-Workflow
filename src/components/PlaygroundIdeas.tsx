import { useState } from 'react';
import { Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { playgroundPrompts } from '../data/playgroundPrompts';

interface Props {
  zh: boolean;
  disabled: boolean;
  onUse: (prompt: string) => void;
}

export default function PlaygroundIdeas({ zh, disabled, onUse }: Props) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'copied' | 'used' | 'copy-error' | null>(null);
  const idea = playgroundPrompts[index];
  const locale = zh ? 'zh' : 'en';
  function select(next: number) {
    setIndex(next);
    setExpanded(false);
    setFeedback(null);
  }
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(idea.prompt);
      setFeedback('copied');
    } catch {
      setExpanded(true);
      setFeedback('copy-error');
    }
  }
  return <section aria-labelledby="try-this-title" className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
    <div className="flex items-center justify-between gap-2">
      <h3 id="try-this-title" className="flex items-center gap-1.5 text-sm font-bold text-indigo-950"><Sparkles size={16} aria-hidden="true" />Try this</h3>
      <button type="button" onClick={() => select((index + 1) % playgroundPrompts.length)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">{zh ? '换一个' : 'Next idea'}<ArrowRight size={14} aria-hidden="true" /></button>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-gray-500">{zh ? '这些提示词已用 Spark 试跑；每次生成的结果可能不同。' : 'Tried with Spark. Each generation can turn out differently.'}</p>
    <div className="mt-4 flex items-start gap-3">
      <span aria-hidden="true" className="text-2xl">{idea.icon}</span>
      <div className="min-w-0"><h4 className="font-semibold text-gray-900">{idea.title[locale]}</h4><p className="mt-1 text-xs leading-relaxed text-gray-600">{idea.description[locale]}</p></div>
    </div>
    <div className="mt-4 flex gap-2">
      <button type="button" disabled={disabled} onClick={() => { onUse(idea.prompt); setFeedback('used'); }} className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-200 hover:bg-indigo-100 disabled:opacity-40">{zh ? '使用提示词' : 'Use prompt'}</button>
      <button type="button" onClick={copyPrompt} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50">{feedback === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{feedback === 'copied' ? (zh ? '已复制' : 'Copied') : (zh ? '复制' : 'Copy')}</button>
    </div>
    <div className="mt-3 flex items-center justify-between gap-2">
      <button type="button" aria-expanded={expanded} aria-controls="try-this-prompt" onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-700 underline-offset-4 hover:underline">{expanded ? (zh ? '收起提示词' : 'Hide prompt') : (zh ? '查看完整提示词' : 'View full prompt')}</button>
      <span aria-label={zh ? `示例 ${index + 1}，共 ${playgroundPrompts.length} 个` : `Example ${index + 1} of ${playgroundPrompts.length}`} className="text-xs tabular-nums text-gray-500">{index + 1} / {playgroundPrompts.length}</span>
    </div>
    {expanded && <textarea id="try-this-prompt" aria-label={zh ? '完整示例提示词' : 'Full example prompt'} readOnly value={idea.prompt} className="mt-3 h-48 w-full resize-y rounded-lg border border-indigo-200 bg-white p-2 text-xs leading-relaxed text-gray-700" />}
    <div className="mt-3 flex flex-wrap gap-1.5" aria-label={zh ? '选择示例' : 'Choose an example'}>{playgroundPrompts.map((item, i) => <button key={item.id} type="button" title={item.title[locale]} aria-label={item.title[locale]} aria-pressed={i === index} onClick={() => select(i)} className={`rounded-lg px-2 py-1 text-base ring-1 transition-colors ${i === index ? 'bg-white ring-indigo-400' : 'ring-transparent hover:bg-indigo-100'}`}>{item.icon}</button>)}</div>
    <p role="status" aria-live="polite" className="mt-2 text-xs text-indigo-800">{feedback === 'used' ? (zh ? '已填入下方，点击“生成网页”即可。' : 'Ready below. Click Generate webpage to try it.') : feedback === 'copy-error' ? (zh ? '无法自动复制，请选中上方提示词手动复制。' : 'Select the prompt above and copy it manually.') : feedback === 'copied' ? (zh ? '完整提示词已复制。' : 'Full prompt copied.') : ''}</p>
  </section>;
}
