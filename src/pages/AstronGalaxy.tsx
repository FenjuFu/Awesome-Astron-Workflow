import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Focus, Minus, Plus, Search, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import snapshot from '../data/galaxy.json';
import './AstronGalaxy.css';

const definitions = [
  { id: 'astron-agent', name: 'Astron Agent', color: '#9da9ff', x: 390, y: 235,
    role: ['Agent orchestration', '智能体编排'],
    description: ['Build agentic workflows and next-generation SuperAgents on an enterprise-grade platform.', '面向企业构建智能体工作流与新一代 SuperAgent。'],
    tags: ['Agents', 'Workflows', 'Multi-agent'] },
  { id: 'skillhub', name: 'SkillHub', color: '#5ee6c4', x: 750, y: 345,
    role: ['Reusable agent skills', '技能资产管理'],
    description: ['Publish, version and govern agent skills in a self-hosted, open-source registry.', '在可自托管的开源技能仓库中，发布、版本化管理与治理智能体技能。'],
    tags: ['Skills', 'Registry', 'Self-hosted'] },
  { id: 'astron-rpa', name: 'Astron RPA', color: '#ffc17b', x: 420, y: 590,
    role: ['Desktop automation', '桌面自动化'],
    description: ['Bring automation to everyday work with an agent-ready RPA suite for individuals and enterprises.', '面向个人与企业，以支持智能体调用的 RPA 工具完成日常自动化工作。'],
    tags: ['RPA', 'Automation', 'Desktop'] },
];
const projects = definitions.map(p => ({ ...p, ...snapshot.projects.find(s => s.id === p.id)! }));
type Project = typeof projects[number];
type Contributor = Project['contributors'][number];
const stars = Array.from({ length: 180 }, (_, i) => ({
  x: (Math.sin(i * 73.31 + 4) * 43758.54 % 1 + 1) % 1 * 1100,
  y: (Math.sin(i * 39.71 + 2) * 29312.12 % 1 + 1) % 1 * 820,
  r: i % 9 === 0 ? 1.3 : .65,
}));
const number = (n: number) => n.toLocaleString('en-US');

export default function AstronGalaxy() {
  const { language, setLanguage } = useLanguage();
  const zh = language === 'zh-CN';
  const copy = (en: string, cn: string) => zh ? cn : en;
  const [selected, setSelected] = useState<string | null>(null);
  const [person, setPerson] = useState<Contributor | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const drag = useRef<{ x: number; y: number; originX: number; originY: number; moved: boolean } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const project = projects.find(p => p.id === selected);
  const matches = projects.filter(p => `${p.name} ${p.id} ${p.role.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  const select = (p: Project) => { setSelected(p.id); setPerson(null); };
  const reset = () => { setView({ x: 0, y: 0, zoom: 1 }); setSelected(null); setPerson(null); setQuery(''); };
  const zoom = (delta: number) => setView(v => ({ ...v, zoom: Math.min(2.2, Math.max(.65, v.zoom + delta)) }));
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 || (e.target as Element).closest('[data-node]')) return;
    drag.current = { x: e.clientX, y: e.clientY, originX: view.x, originY: view.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || !svg.current) return;
    const scale = Math.min(svg.current.clientWidth / 1100, svg.current.clientHeight / 820);
    setView(v => ({ ...v, x: Math.max(-600, Math.min(600, d.originX + (e.clientX - d.x) / scale)), y: Math.max(-450, Math.min(450, d.originY + (e.clientY - d.y) / scale)) }));
  };
  return <div className="astron-galaxy">
    <header className="galaxy-header">
      <Link to="/" className="galaxy-brand"><span className="galaxy-brand-icon"><Sparkles size={21} /></span><span>ASTRON <b>GALAXY</b></span></Link>
      <div className="galaxy-header-right"><Link to="/"><ArrowLeft size={15} />{copy('Back to Astron', '返回 Astron')}</Link><button onClick={() => setLanguage(zh ? 'en' : 'zh-CN')} aria-label={copy('Switch to Chinese', '切换为英文')}>{zh ? 'EN' : '中文'}</button></div>
    </header>
    <main className="galaxy-layout">
      <section className="galaxy-universe" aria-label={copy('Interactive project galaxy', '交互项目星系')}>
        <div className="galaxy-intro"><p className="galaxy-eyebrow"><span /> OPEN SOURCE, CONNECTED</p><h1>{copy('One galaxy.', '同一片星系，')}<br /><em>{copy('Infinite possibilities.', '无限种可能。')}</em></h1><p>{copy('Three projects. The people behind them. Explore the Astron open-source universe.', '三个开源项目，与共同点亮它们的开发者。探索 Astron 开源星系。')}</p></div>
        <svg ref={svg} className="galaxy-map" viewBox="0 0 1100 820" aria-label={copy('Astron projects and sampled contributors', 'Astron 项目及贡献者样本')} onPointerDown={down} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
          <defs>
            <radialGradient id="galaxy-core"><stop stopColor="#fff" /><stop offset=".2" stopColor="#dbe2ff" /><stop offset=".5" stopColor="#6d7bea" /><stop offset="1" stopColor="#242c68" /></radialGradient>
            {projects.map(p => <radialGradient key={p.id} id={`planet-${p.id}`} cx="30%" cy="25%"><stop stopColor="#ffffff" /><stop offset=".12" stopColor={p.color} /><stop offset=".65" stopColor={p.color} stopOpacity=".6" /><stop offset="1" stopColor="#10182d" /></radialGradient>)}
            <filter id="galaxy-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14" /></filter>
          </defs>
          <g aria-hidden="true">{stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#d2e0ff" opacity={i % 3 === 0 ? .55 : .22} />)}</g>
          <g transform={`translate(${550 + view.x} ${410 + view.y}) scale(${view.zoom}) translate(-550 -410)`}>
            <g className="galaxy-orbits" aria-hidden="true"><ellipse cx="550" cy="440" rx="320" ry="235" transform="rotate(-20 550 440)" /><ellipse cx="550" cy="440" rx="420" ry="310" transform="rotate(-20 550 440)" /><ellipse cx="550" cy="440" rx="180" ry="125" transform="rotate(-20 550 440)" /></g>
            {projects.map(p => <path key={p.id} d={`M 550 440 Q ${p.x} 440 ${p.x} ${p.y}`} stroke={p.color} strokeOpacity={selected === p.id ? .55 : .2} strokeDasharray="3 7" fill="none" aria-hidden="true" />)}
            <g aria-hidden="true"><circle cx="550" cy="440" r="58" fill="#697aff" opacity=".27" filter="url(#galaxy-glow)" /><circle cx="550" cy="440" r="27" fill="url(#galaxy-core)" /><ellipse cx="550" cy="440" rx="50" ry="12" transform="rotate(-26 550 440)" fill="none" stroke="#b6c1ff" strokeOpacity=".6" /><text x="550" y="495" textAnchor="middle" className="galaxy-core-name">ASTRON</text><text x="550" y="514" textAnchor="middle" className="galaxy-core-sub">OPEN-SOURCE ECOSYSTEM</text></g>
            {projects.map(p => <g key={p.id} opacity={matches.includes(p) && (!selected || selected === p.id) ? 1 : .22}>
              <ellipse cx={p.x} cy={p.y} rx="132" ry="84" fill="none" stroke={p.color} strokeOpacity=".12" transform={`rotate(-22 ${p.x} ${p.y})`} aria-hidden="true" />
              {p.contributors.map((c, i) => {
                const angle = i * 2.399963;
                const radius = 61 + Math.sqrt(i / Math.max(1, p.contributors.length - 1)) * 75;
                const x = p.x + Math.cos(angle) * radius;
                const y = p.y + Math.sin(angle) * radius * .67;
                const active = person?.login === c.login && selected === p.id;
                return <g key={c.login} data-node="contributor" className="galaxy-node" role="button" tabIndex={0} aria-label={`${c.login} · ${p.name} · ${number(c.contributions)} ${copy('contributions', '次贡献')}`} onClick={() => { select(p); setPerson(c); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p); setPerson(c); } }}>
                  <title>{c.login} · {number(c.contributions)} {copy('contributions', '次贡献')}</title>
                  <circle cx={x} cy={y} r="11" fill="transparent" />
                  <circle cx={x} cy={y} r={active ? 6 : 2 + Math.min(3, Math.log10(c.contributions + 1))} fill={p.color} opacity={active ? 1 : .7} />
                  {active && <circle cx={x} cy={y} r="10" fill="none" stroke={p.color} />}
                </g>;
              })}
              <g data-node="project" role="button" tabIndex={0} className="galaxy-node galaxy-project-node" aria-label={p.name} aria-pressed={selected === p.id} onClick={() => select(p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p); } }}>
                <circle cx={p.x} cy={p.y} r="42" fill={p.color} opacity=".16" filter="url(#galaxy-glow)" />
                <circle cx={p.x} cy={p.y} r="31" fill="transparent" stroke={p.color} strokeOpacity={selected === p.id ? .9 : .2} />
                <circle cx={p.x} cy={p.y} r="22" fill={`url(#planet-${p.id})`} />
                <text x={p.x} y={p.y + 113} textAnchor="middle" className="galaxy-project-label">{p.name}</text>
                <text x={p.x} y={p.y + 134} textAnchor="middle" fill={p.color} className="galaxy-project-role">{p.role[zh ? 1 : 0]}</text>
              </g>
            </g>)}
          </g>
        </svg>
        <div className="galaxy-map-footer"><span>{copy('Drag to explore · Select a planet or a contributor', '拖动探索 · 点击项目行星或贡献者星点')}</span><div className="galaxy-controls"><button aria-label={copy('Zoom out', '缩小')} onClick={() => zoom(-.15)} disabled={view.zoom <= .65}><Minus size={17} /></button><span>{Math.round(view.zoom * 100)}%</span><button aria-label={copy('Zoom in', '放大')} onClick={() => zoom(.15)} disabled={view.zoom >= 2.2}><Plus size={17} /></button><button aria-label={copy('Reset view', '重置视图')} onClick={reset}><Focus size={17} /></button></div></div>
      </section>
      <aside className="galaxy-sidebar">
        <div className="galaxy-sidebar-heading"><span className="galaxy-eyebrow">EXPLORE THE ECOSYSTEM</span><span className="galaxy-count">03</span></div>
        <label className="galaxy-search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={copy('Find a project…', '搜索项目…')} aria-label={copy('Find a project', '搜索项目')} />{query && <button onClick={() => setQuery('')} aria-label={copy('Clear search', '清除搜索')}><X size={15} /></button>}</label>
        <div className="galaxy-project-list">{matches.map(p => <button key={p.id} className={`galaxy-project-card ${selected === p.id ? 'is-selected' : ''}`} style={{ '--project-color': p.color } as CSSProperties} onClick={() => select(p)} aria-pressed={selected === p.id}><span className="galaxy-card-orb" /><span><small>0{definitions.findIndex(d => d.id === p.id) + 1} / {p.role[zh ? 1 : 0]}</small><strong>{p.name}</strong><span className="galaxy-card-meta">☆ {number(p.stars)} <span>⑂ {number(p.forks)}</span></span></span><ArrowUpRight size={18} /></button>)}{matches.length === 0 && <p className="galaxy-empty">{copy('No projects found. Try Agent, SkillHub or RPA.', '未找到项目，试试 Agent、SkillHub 或 RPA。')}</p>}</div>
        <div className="galaxy-details" aria-live="polite">
          {project ? <><div className="galaxy-detail-heading"><span className="galaxy-eyebrow">{person ? copy('CONTRIBUTOR', '贡献者') : copy('PROJECT IN FOCUS', '当前项目')}</span><button onClick={() => { setSelected(null); setPerson(null); }} aria-label={copy('Close details', '关闭详情')}><X size={16} /></button></div><h2>{person?.login ?? project.name}</h2><p>{person ? copy(`${number(person.contributions)} contributions reported by GitHub for ${project.name}. ${person.type === 'Bot' ? 'Bot account.' : ''}`, `GitHub 为该账号记录了 ${number(person.contributions)} 次 ${project.name} 贡献。${person.type === 'Bot' ? '这是机器人账号。' : ''}`) : project.description[zh ? 1 : 0]}</p>{!person && <div className="galaxy-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}<a className="galaxy-primary-link" href={person?.url ?? project.url} target="_blank" rel="noopener noreferrer">{person ? copy('View GitHub profile', '查看 GitHub 主页') : copy('Explore repository', '探索项目仓库')}<ArrowUpRight size={16} /></a>{!person && <p className="galaxy-sample">{copy(`${project.contributors.length} sampled contributor accounts`, `${project.contributors.length} 个贡献者样本账号`)}</p>}</> : <><span className="galaxy-eyebrow">{copy('A SHARED UNIVERSE', '共同构建的开源星系')}</span><h2>{copy('Built together.', '由开发者共同点亮。')}</h2><p>{copy('Orchestrate agents, share skills and automate work. Discover three complementary projects and the contributors behind their code.', '编排智能体、共享技能、自动化执行。探索三个互补的开源项目，以及代码背后的贡献者。')}</p><div className="galaxy-summary"><div><strong>{number(projects.reduce((n,p) => n + p.stars, 0))}</strong><span>{copy('repository stars', '仓库 Star 合计')}</span></div><div><strong>{new Set(projects.flatMap(p => p.contributors.map(c => c.login))).size}</strong><span>{copy('sampled accounts', '去重样本账号')}</span></div></div></>}
        </div>
        <details className="galaxy-method"><summary>{copy('About the map & data', '星图与数据说明')}</summary><p>{copy('Planets represent repositories; small colored points show up to 30 contributor accounts per repository from GitHub’s contributors endpoint, ordered by contribution count. Accounts can appear in multiple projects and may include bots. This is a sample, not all contributors or active users.', '行星代表仓库；彩色星点来自 GitHub contributors 接口，每仓按贡献次数取前 30 个账号，可能包含机器人，同一账号可出现在多个项目。这是样本，不是全部贡献者或活跃用户。')}</p><p>{copy('Contributor point sizes use a capped logarithmic scale of GitHub contribution counts. Planet sizes, positions and background stars are illustrative. Connections show project membership, not dependencies or measured collaboration. Star totals are not unique people. No OpenRank scores are inferred.', '贡献者星点大小使用有上下限的贡献次数对数尺度。行星大小、位置和背景星空为示意；连线表示所属项目，不表示依赖或实测协作关系。Star 合计不是去重人数，不推算 OpenRank。')}</p>{projects.map(p => <a key={p.id} href={p.contributorsSource} target="_blank" rel="noopener noreferrer">{p.name} · GitHub API ↗</a>)}</details>
        <footer className="galaxy-data-footer"><span>{copy('Data as of', '数据截至')} {snapshot.capturedAt.slice(0, 10)} (UTC)</span><span>{copy('Inspired by', '交互灵感来自')} <a href="https://openatom-galaxy.x-lab.info/" target="_blank" rel="noopener noreferrer">OpenAtom Galaxy ↗</a></span></footer>
      </aside>
    </main>
  </div>;
}
