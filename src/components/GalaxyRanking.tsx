import { ContributorAvatar, contributorRank } from './GalaxyContributors';
import type { GalaxyContributor } from './GalaxyContributors';

export default function GalaxyRanking({ name, people, selected, month, zh, onSelect }: {
  name: string; people: GalaxyContributor[]; selected: string | null; month: string; zh: boolean;
  onSelect: (person: GalaxyContributor) => void;
}) {
  const ranked = people.filter(p => p.openrank !== null);
  const missing = people.filter(p => p.openrank === null);
  return <section className="galaxy-ranking" aria-labelledby="contributor-ranking-title">
    <div className="galaxy-ranking-heading"><h2 id="contributor-ranking-title">{zh ? '贡献者 OpenRank 榜' : 'Contributor OpenRank'}</h2><span>{month}</span></div>
    <p className="galaxy-ranking-scope">{name} · {zh ? '全域影响力' : 'Global influence'}</p>
    <p className="galaxy-coverage">{zh ? `${ranked.length} / ${people.length} 个代码贡献者账号有该月分值` : `${ranked.length} / ${people.length} code contributor accounts have a score this month`}</p>
    {ranked.length ? <ol className="galaxy-ranking-list">{ranked.map(c => <li key={c.login}><button className={selected === c.login ? 'is-selected' : ''} onClick={() => onSelect(c)} aria-pressed={selected === c.login}><span className="galaxy-rank-position">{contributorRank(people, c)}</span><ContributorAvatar person={c} /><span className="galaxy-rank-login">{c.login}{c.type === 'Bot' && <small>BOT</small>}</span><strong>{c.openrank!.toFixed(2)}</strong></button></li>)}</ol> : <p className="galaxy-ranking-empty">{zh ? '该月尚无可用分值，暂不生成名次。贡献者头像仍显示在轨道中。' : 'No published scores for this month. Contributors remain visible in orbit, without assigned ranks.'}</p>}
    {!!missing.length && <details className="galaxy-missing"><summary>{zh ? `暂无数据 · ${missing.length} 个账号` : `No data · ${missing.length} accounts`}</summary><p>{zh ? '未导出或该月缺值；不记作 0，不参与排名。' : 'Not exported or no value for this month; not scored as zero or ranked.'}</p><ul>{missing.map(c => <li key={c.login}><button onClick={() => onSelect(c)}><ContributorAvatar person={c} /><span>{c.login}</span><small>{c.openrankStatus === 'not-exported' ? (zh ? '未导出' : 'Not exported') : c.openrankStatus === 'month-missing' ? (zh ? '本月缺值' : 'Month missing') : (zh ? '请求失败' : 'Request failed')}</small></button></li>)}</ul></details>}
  </section>;
}
