import { ArrowRight, Github, Sparkles, Code2, Orbit, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { workflows } from '../types/workflow';

export default function Hero() {
  const { language, t } = useLanguage();
  const zh = language === 'zh-CN';
  return <section id="home" className="spark-hero">
    <div className="spark-hero-grid">
      <div className="spark-hero-copy">
        <div className="spark-eyebrow"><span /> ASTRON × SPARK <span className="spark-eyebrow-divider">/</span> {zh ? '开源创作空间' : 'OPEN CREATIVE SPACE'}</div>
        <h1>{zh ? <>给灵感，<br />一点<span>星火。</span></> : <>A little spark.<br /><span>Endless possibilities.</span></>}</h1>
        <p className="spark-hero-subtitle">{zh ? 'Awesome Astron 工作流' : 'Awesome Astron Workflows'}</p>
        <p className="spark-hero-description">{zh ? '从一个想法，到第一个 AI 作品。和小火苗一起探索工作流、体验模型，把灵感变成可以运行的创作。' : 'From a first idea to your first AI creation. Explore workflows, try models, and bring something new to life with SPARK.'}</p>
        <div className="spark-hero-buttons">
          <a href="#workflows" className="spark-button-primary">{t('hero.cta')}<ArrowRight size={18} /></a>
          <a href="https://github.com/FenjuFu/Awesome-Astron-Workflow" target="_blank" rel="noopener noreferrer" className="spark-button-secondary"><Github size={18} />{zh ? '在 GitHub 共创' : 'Build on GitHub'}</a>
        </div>
        <div className="spark-hero-facts">
          <div><strong>{workflows.length}</strong><span>{zh ? '精选 AI 工作流' : 'Curated AI workflows'}</span></div>
          <div><strong>{zh ? '开源' : 'Open'}</strong><span>{zh ? '一起探索，一起构建' : 'Made by the community'}</span></div>
          <div><strong>{zh ? '动手做' : 'Create'}</strong><span>{zh ? '让想法开始运行' : 'Turn ideas into action'}</span></div>
        </div>
      </div>
      <div className="spark-hero-art">
        <div className="spark-art-orbit" aria-hidden="true" />
        <span className="spark-art-star spark-art-star-one" aria-hidden="true">✦</span>
        <span className="spark-art-star spark-art-star-two" aria-hidden="true">✧</span>
        <img src="/illustrations/spark-creative-duo.png" width="1184" height="1328" fetchPriority="high" alt={zh ? '紫发女生小火苗与星形肚子的紫色火苗伙伴一起用电脑创作' : 'SPARK, the purple-haired girl, creating on a laptop with her purple flame companion'} />
        <div className="spark-art-caption"><Sparkles size={16} /><span>{zh ? '轻巧随行，能想会做' : 'Small spark. Big imagination.'}</span></div>
      </div>
    </div>
    <div className="spark-quick-links">
      <Link to="/playground"><Code2 size={22} /><div><strong>{zh ? '试试你的下一个想法' : 'Try your next idea'}</strong><span>{zh ? '在 Playground 体验 Spark' : 'Meet Spark in the playground'}</span></div><ArrowUpRight size={19} /></Link>
      <Link to="/galaxy"><Orbit size={22} /><div><strong>{zh ? '发现开源的引力' : 'Find your open-source orbit'}</strong><span>{zh ? '认识项目与背后的贡献者' : 'Discover projects and their contributors'}</span></div><ArrowUpRight size={19} /></Link>
    </div>
  </section>;
}
