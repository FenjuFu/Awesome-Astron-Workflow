import { Link } from 'react-router-dom';
import { ArrowUpRight, Orbit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function GalaxyEntry() {
  const { language } = useLanguage();
  const zh = language === 'zh-CN';
  return <section className="bg-[#0b1020] text-white px-6 py-12" aria-labelledby="galaxy-entry-title">
    <Link to="/galaxy" className="max-w-6xl mx-auto flex items-center justify-between gap-6 group focus-visible:outline focus-visible:outline-indigo-300 focus-visible:outline-offset-8">
      <div className="flex items-center gap-6"><Orbit className="hidden sm:block w-16 h-16 text-indigo-300" strokeWidth={1} /><div><p className="text-xs tracking-[.2em] text-indigo-300 mb-2">ASTRON GALAXY</p><h2 id="galaxy-entry-title" className="text-2xl sm:text-3xl font-semibold">{zh ? '三个项目，同一片开源星系。' : 'Three projects. One open-source galaxy.'}</h2><p className="text-sm text-slate-400 mt-3">Astron Agent · SkillHub · Astron RPA <span className="mx-2">/</span>{zh ? '探索项目与贡献者' : 'Explore projects & contributors'}</p></div></div>
      <ArrowUpRight className="shrink-0 text-indigo-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform motion-reduce:transition-none" size={28} />
    </Link>
  </section>;
}
