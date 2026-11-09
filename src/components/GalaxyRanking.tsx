import { useState } from 'react';
import { ContributorAvatar, contributorRank, historyRange } from './GalaxyContributors';
import type { GalaxyContributor } from './GalaxyContributors';

export default function GalaxyRanking({ name, people, selected, month, zh, onSelect }: {
  name: string; people: GalaxyContributor[]; selected: string | null; month: string; zh: boolean;
  onSelect: (person: GalaxyContributor) => void;
}) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(100);
  const filtered = people.filter(p => p.login.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="galaxy-ranking" aria-labelledby="contributor-ranking-title">
    <div className="galaxy-ranking-heading"><h2 id="contributor-ranking-title">{zh ? '贡献者 OpenRank 榜' : 'Contributor OpenRank'}</h2><span>ALL TIME</span></div>
    <p className="galaxy-ranking-scope">{name} · {zh ? '本站独立计算 · 仓库内贡献度' : 'Locally calculated · repository contribution'}</p>
    <p className="galaxy-ranking-cutoff">{zh ? '全部已采历史，截至' : 'All collected history through'} {month} (UTC)</p>
    <p className="galaxy-coverage">{zh ? `${people.length} 个参与者账号已计算，已排除识别到的 Bot、AI 和自动化服务账号` : `${people.length} participant accounts scored after excluding identified Bots, AI and automation services`}</p>
    <input className="galaxy-contributor-search" value={query} onChange={e => {setQuery(e.target.value);setLimit(100);}} aria-label={zh ? '搜索贡献者' : 'Search contributors'} placeholder={zh ? '搜索全部贡献者…' : 'Search all contributors…'} />
    <ol className="galaxy-ranking-list">{filtered.slice(0,limit).map(c => <li key={c.login}><button className={selected === c.login ? 'is-selected' : ''} onClick={() => onSelect(c)} aria-pressed={selected === c.login}><span className="galaxy-rank-position">{contributorRank(people,c)}</span><ContributorAvatar person={c}/><span className="galaxy-rank-login">{c.login}{c.type === 'Bot' && <small>BOT</small>}<span className="galaxy-history-range">{historyRange(c.openrankCoverage,zh)}</span></span><strong>{c.openrank?.toFixed(2)}</strong></button></li>)}</ol>
    {!filtered.length && <p className="galaxy-ranking-empty">{zh ? '没有匹配的账号。' : 'No matching accounts.'}</p>}
    {filtered.length>limit && <button className="galaxy-load-more" onClick={() => setLimit(n=>n+100)}>{zh ? `继续显示 · ${limit}/${filtered.length}` : `Show more · ${limit}/${filtered.length}`}</button>}
  </section>;
}
