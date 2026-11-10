import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Focus, Minus, Plus, Search, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import snapshot from '../data/galaxy.json';
import definitions from '../data/galaxy-projects.json';
import './AstronGalaxy.css';
import './GalaxyRanking.css';
import './GalaxyExpanded.css';
import './GalaxyMotion.css';
import GalaxySystem from '../components/GalaxySystem';
import { ContributorAvatar, historyRange } from '../components/GalaxyContributors';
import type { GalaxyContributor } from '../components/GalaxyContributors';
import GalaxyRanking from '../components/GalaxyRanking';
import OpenRankMethod from '../components/OpenRankMethod';

const projects = definitions.map(p => ({ ...p, ...snapshot.projects.find(s => s.id === p.id)! })).sort((a, b) => (b.openrank ?? -1) - (a.openrank ?? -1));
type Project = typeof projects[number];
type Contributor = GalaxyContributor;
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
  const [paused, setPaused] = useState(false);
  const [orbitPage, setOrbitPage] = useState(0);
  const [person, setPerson] = useState<Contributor | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const drag = useRef<{ x: number; y: number; originX: number; originY: number; moved: boolean } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const project = projects.find(p => p.id === selected);
  const rankingProject = project ?? projects[0];
  const matches = projects.filter(p => `${p.name} ${p.id} ${p.owner}/${p.repo} ${p.url} ${p.role.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  const select = (p: Project) => { setSelected(p.id); setPerson(null); setOrbitPage(0); setView({x: 0, y: 0, zoom: 1}); };
  const selectPerson = (p: Project, c: Contributor) => { select(p); setPerson(c); setOrbitPage(Math.floor(p.contributors.findIndex(person => person.login === c.login) / 60)); };
  const reset = () => { setView({ x: 0, y: 0, zoom: 1 }); setSelected(null); setPerson(null); setOrbitPage(0); setQuery(''); };
  const zoom = (delta: number) => setView(v => { const next = Math.min(2.2, Math.max(.65, v.zoom + delta)); const ratio = next / v.zoom; return { x: v.x * ratio, y: v.y * ratio, zoom: next }; });
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 || (e.target as Element).closest('[data-node]')) return;
    drag.current = { x: e.clientX, y: e.clientY, originX: view.x, originY: view.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || !svg.current) return;
    const scale = Math.min(svg.current.clientWidth / (selected ? 600 : 1100), svg.current.clientHeight / (selected ? 640 : 820));
    setView(v => ({ ...v, x: Math.max(-1100, Math.min(1100, d.originX + (e.clientX - d.x) / scale)), y: Math.max(-820, Math.min(820, d.originY + (e.clientY - d.y) / scale)) }));
  };
  return <div className={`astron-galaxy ${selected ? 'galaxy-is-focused' : 'galaxy-overview'}`}>
    <header className="galaxy-header">
      <Link to="/" className="galaxy-brand"><span className="galaxy-brand-icon"><Sparkles size={21} /></span><span>ASTRON <b>GALAXY</b></span></Link>
      <div className="galaxy-header-right"><Link to="/"><ArrowLeft size={15} />{copy('Back to Astron', '返回 Astron')}</Link><button onClick={() => setLanguage(zh ? 'en' : 'zh-CN')} aria-label={copy('Switch to Chinese', '切换为英文')}>{zh ? 'EN' : '中文'}</button></div>
    </header>
    <main className="galaxy-layout">
      <section className="galaxy-universe" aria-label={copy('Interactive project galaxy', '交互项目星系')}>
        <div className="galaxy-intro"><p className="galaxy-eyebrow"><span /> OPEN SOURCE, CONNECTED</p><h1>{copy('One galaxy.', '同一片星系，')}<br /><em>{copy('Infinite possibilities.', '无限种可能。')}</em></h1><p>{copy(`${projects.length} projects. The people behind them. Explore the Astron open-source universe.`, `${projects.length} 个开源项目，与共同点亮它们的开发者。探索 Astron 开源星系。`)}</p></div>
        <svg ref={svg} className="galaxy-map" viewBox={selected ? "250 130 600 640" : "0 0 1100 820"} aria-label={copy('Astron projects and contributor orbits', 'Astron 项目及贡献者轨道')} onPointerDown={down} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
          <defs>
            <radialGradient id="galaxy-core"><stop stopColor="#fff" /><stop offset=".2" stopColor="#dbe2ff" /><stop offset=".5" stopColor="#6d7bea" /><stop offset="1" stopColor="#242c68" /></radialGradient>
            {projects.map(p => <radialGradient key={p.id} id={`planet-${p.id}`} cx="30%" cy="25%"><stop stopColor="#ffffff" /><stop offset=".12" stopColor={p.color} /><stop offset=".65" stopColor={p.color} stopOpacity=".6" /><stop offset="1" stopColor="#10182d" /></radialGradient>)}
            <filter id="galaxy-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14" /></filter>
          </defs>
          <g aria-hidden="true">{stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#d2e0ff" opacity={i % 3 === 0 ? .55 : .22} />)}</g>
          <g transform={`translate(${550 + view.x} ${410 + view.y}) scale(${view.zoom}) translate(-550 -410)`}>
            <GalaxySystem projects={projects} selected={selected} person={person?.login ?? null} page={orbitPage} matches={matches.map(p=>p.id)} zh={zh} paused={paused} onSelect={id=>select(projects.find(p=>p.id===id)!)} onPerson={(id,c)=>selectPerson(projects.find(p=>p.id===id)!,c)}/>

          </g>
        </svg>
        {project && project.contributors.length > 0 && <div className="galaxy-orbit-pagination"><button onClick={() => {setOrbitPage(n=>Math.max(0,n-1));setPerson(null);}} disabled={orbitPage===0} aria-label={copy('Previous contributors','上一页贡献者')}>←</button><span>{copy('Contributors','贡献者')} {orbitPage*60+1}–{Math.min((orbitPage+1)*60,project.contributors.length)} / {project.contributors.length}</span><button onClick={() => {setOrbitPage(n=>n+1);setPerson(null);}} disabled={(orbitPage+1)*60>=project.contributors.length} aria-label={copy('Next contributors','下一页贡献者')}>→</button></div>}
        <div className="galaxy-map-footer"><span>{copy('Drag to explore · Select a planet or a contributor', '拖动探索 · 点击项目行星或贡献者星点')}</span><div className="galaxy-controls"><button className="galaxy-motion-toggle" onClick={()=>setPaused(v=>!v)} aria-pressed={paused} aria-label={copy('Pause motion','暂停动画')}>{paused ? copy('Play','播放') : copy('Pause','暂停')}</button><button aria-label={copy('Zoom out', '缩小')} onClick={() => zoom(-.15)} disabled={view.zoom <= .65}><Minus size={17} /></button><span>{Math.round(view.zoom * 100)}%</span><button aria-label={copy('Zoom in', '放大')} onClick={() => zoom(.15)} disabled={view.zoom >= 2.2}><Plus size={17} /></button><button aria-label={copy('Reset view', '重置视图')} onClick={reset}><Focus size={17} /></button></div></div>
      </section>
      <aside className="galaxy-sidebar">
        <div className="galaxy-sidebar-heading"><span className="galaxy-eyebrow">{copy('LOCAL PROJECT OPENRANK', '本站项目 OpenRank 排名')}</span><span className="galaxy-count">{String(projects.length).padStart(2,'0')}</span></div>
        <p className="galaxy-local-note">{copy('Independently calculated from GitHub history using the OpenRank equation and community value-flow ratios. No official score API.', '根据 GitHub 历史数据，采用 OpenRank 公式及社区价值分配比例独立计算，不调用官方分数接口。')}<br/><a href="#galaxy-openrank-method" onClick={() => { const details = document.getElementById('galaxy-openrank-method'); if (details instanceof HTMLDetailsElement) details.open = true; }}>{copy('Formula, ratios & adaptations ↓', '计算公式、分配比例与调整说明 ↓')}</a><a href="https://blog.frankzhao.cn/openrank_in_project/" target="_blank" rel="noopener noreferrer">{copy('Original algorithm ↗', '原算法说明 ↗')}</a></p>
        <label className="galaxy-search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={copy('Find a project…', '搜索项目…')} aria-label={copy('Find a project', '搜索项目')} />{query && <button onClick={() => setQuery('')} aria-label={copy('Clear search', '清除搜索')}><X size={15} /></button>}</label>
        <div className="galaxy-project-list">{matches.map(p => <button key={p.id} className={`galaxy-project-card ${selected === p.id ? 'is-selected' : ''}`} style={{ '--project-color': p.color } as CSSProperties} onClick={() => select(p)} aria-pressed={selected === p.id}><span className="galaxy-card-orb" /><span><small>{p.openrank === null ? '—' : '#' + (1 + projects.filter(d => d.openrank !== null && d.openrank > p.openrank!).length)} / {p.role[zh ? 1 : 0]}</small><strong>{p.name}</strong><span className="galaxy-project-score">{p.openrank === null ? copy('No data','暂无数据') : p.openrank.toFixed(2)} <small>{copy('Local OpenRank · All time', '本地计算 · 全历史')}</small></span><span className="galaxy-project-history">{copy('Through', '截至')} {p.historyEnd} (UTC)</span><span className="galaxy-card-meta">☆ {number(p.stars)} <span>⑂ {number(p.forks)}</span></span></span><ArrowUpRight size={18} /></button>)}{matches.length === 0 && <p className="galaxy-empty">{copy('No matching projects. Try a project name or capability.', '未找到匹配项目，请尝试项目名称或能力关键词。')}</p>}</div>
        <GalaxyRanking key={rankingProject.id} name={rankingProject.name} people={rankingProject.contributors} selected={person?.login ?? null} month={rankingProject.historyEnd} zh={zh} onSelect={c => selectPerson(rankingProject, c)} />
        <OpenRankMethod zh={zh} />
        <div className="galaxy-details" aria-live="polite">
          {project ? <><div className="galaxy-detail-heading"><span className="galaxy-eyebrow">{person ? copy('CONTRIBUTOR', '贡献者') : copy('PROJECT IN FOCUS', '当前项目')}</span><button onClick={() => { reset(); }} aria-label={copy('Close details', '关闭详情')}><X size={16} /></button></div><h2>{person && <ContributorAvatar person={person} />}{person?.login ?? project.name}</h2>{!person && <p>{project.owner}/{project.repo}</p>}{person && <p className="galaxy-person-score">{copy('Local OpenRank', '本站计算 OpenRank')} · All time: <strong>{person.openrank === null ? copy('No data', '暂无数据') : person.openrank.toFixed(2)}</strong><span className="galaxy-person-history">{historyRange(person.openrankCoverage, zh)}</span>{person.openrank !== null && <a href={person.openrankSource} target="_blank" rel="noopener noreferrer">{copy('Calculation ledger ↗', '计算账本 ↗')}</a>}</p>}<p>{person ? copy(`${person.observedEvents} observed actions/verified relations in ${project.name}. ${person.type === 'Bot' ? 'Bot account.' : ''}`, `${project.name} 中采集到 ${person.observedEvents} 条行为或已核实关系。${person.type === 'Bot' ? '这是机器人账号。' : ''}`) : project.description[zh ? 1 : 0]}</p>{person && <div className="galaxy-action-stats">{Object.entries(person.stats).map(([kind,count]) => <span key={kind}>{({open:copy('Opened','发起'),comment:copy('Comments','评论'),review:copy('Reviews','审阅'),review_comment:copy('Review comments','审阅评论'),close:copy('Closed/merged','关闭/合并'),commit:copy('Code authorship','代码作者'),code_summary:copy('Code summary','代码汇总')} as Record<string,string>)[kind] ?? kind}: {count}</span>)}</div>}
{!person && <div className="galaxy-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}<a className="galaxy-primary-link" href={person?.url ?? project.url} target="_blank" rel="noopener noreferrer">{person ? copy('View GitHub profile', '查看 GitHub 主页') : copy('Explore repository', '探索项目仓库')}<ArrowUpRight size={16} /></a>{!person && <p className="galaxy-sample">{copy(`${project.contributors.length} public participant accounts`, `${project.contributors.length} 个公开参与者账号`)}</p>}</> : <><span className="galaxy-eyebrow">{copy('A SHARED UNIVERSE', '共同构建的开源星系')}</span><h2>{copy('Built together.', '由开发者共同点亮。')}</h2><p>{copy('Orchestrate agents, share skills and automate work. Discover complementary projects and the contributors behind their code.', '编排智能体、共享技能、自动化执行。探索这些互补的开源项目，以及代码背后的贡献者。')}</p><div className="galaxy-summary"><div><strong>{number(projects.reduce((n,p) => n + p.stars, 0))}</strong><span>{copy('repository stars', '仓库 Star 合计')}</span></div><div><strong>{new Set(projects.flatMap(p => p.contributors.map(c => c.login.toLowerCase()))).size}</strong><span>{copy('contributor accounts', '去重贡献者账号')}</span></div></div></>}
        </div>
        <details className="galaxy-method"><summary>{copy('Coverage, evidence & map legend', '采集范围、证据与星图说明')}</summary><p>{copy('Accounts are collected directly from GitHub code, Issue, PR, comment and review history. Eligible participants use the same model after identified Bot/AI/service accounts are excluded. Overview orbits show the first 12 per project; select a project to page through everyone, or search the complete leaderboard.', '账号直接来自 GitHub 的代码、Issue、PR、评论和审阅历史，排除已识别 Bot、AI 和服务账号后，其余参与者使用同一模型计算。概览每仓显示前 12 个头像；选中项目后可翻页浏览全部账号，也可搜索完整榜单。')}</p><p>{copy('Project distance and size encode the locally computed repository-node OpenRank using the same full-history model and a bounded logarithmic scale: higher scores are closer and larger. Each project retains its own capture cutoff; this is not the official global ranking. Missing scores are unranked. Motion speed is decorative. Contributors retain locally calculated all-time scores; their percentages use all eligible accounts in the same project, not only visible or searched accounts. These shares do not measure actual workload.', '项目距离与大小采用相同全历史模型独立算出的仓库节点 OpenRank，经有上下限的对数映射：高分更近、更大。各项目保留自身采集截止时间，不代表官方全网排名。缺失分数不排名，运动速度仅作装饰。贡献者保留本地全历史评分，占比以本项目全部合格账号为分母，搜索和分页不改变占比；不代表实际工作量。')}</p>{projects.map(p => <div className="galaxy-data-coverage" key={p.id}><strong>{p.name}</strong><details><summary>{copy(`Excluded automation: ${p.automationExclusions.accountCount} accounts`, `已排除自动化账号：${p.automationExclusions.accountCount} 个`)}</summary><p>{p.automationExclusions.accounts.map(account => account.login).join(', ')}</p><p>{copy(`${p.automationExclusions.eventCount} activities excluded before scoring; reasons are recorded in the ledger.`, `计分前排除 ${p.automationExclusions.eventCount} 条行为；逐账号原因见账本。`)}</p></details><p>{p.calculation.coverage.issues} Issues · {p.calculation.coverage.pullRequests} PRs · {p.calculation.events} {copy('observed relations','已采关系')} · {p.calculation.participants} {copy('accounts','账号')}</p><a href={p.openrankSource} target="_blank" rel="noopener noreferrer">{copy('Full graph, gaps & reproducible calculation ↗','完整图、缺口及可复算账本 ↗')}</a></div>)}</details>
        <footer className="galaxy-data-footer"><span>Locally calculated OpenRank · ALL TIME</span><span>{copy('Snapshot dates', '快照日期')}{zh ? '：' : ': '}{snapshot.captureRange.from === snapshot.captureRange.through ? snapshot.captureRange.through : `${snapshot.captureRange.from}–${snapshot.captureRange.through}`} (UTC)</span><span>{copy('Inspired by', '交互灵感来自')} <a href="https://openatom-galaxy.x-lab.info/" target="_blank" rel="noopener noreferrer">OpenAtom Galaxy ↗</a></span></footer>
      </aside>
    </main>
  </div>;
}
