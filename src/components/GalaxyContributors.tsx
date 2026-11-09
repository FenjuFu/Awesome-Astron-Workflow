import { useState } from 'react';
import avatarCache from '../data/galaxy-avatars.json';

const avatarSource = (person: GalaxyContributor) => (avatarCache as Record<string, string>)[person.login] ?? person.avatar;

export interface GalaxyContributor {
  login: string;
  url: string;
  avatar: string;
  contributions: number;
  type: string;
  openrank: number | null;
  openrankSource: string;
  openrankStatus: string;
  openrankCoverage: OpenRankCoverage | null;
  rank: number;
  observedEvents: number;
  stats: Record<string, number | undefined>;
}

export interface OpenRankCoverage {
  firstMonth: string; lastMonth: string; months: number; gapMonths: number; monthsSinceLast: number;
}

export const historyRange = (coverage: OpenRankCoverage | null, zh: boolean) => coverage
  ? `${coverage.firstMonth}–${coverage.lastMonth} · ${coverage.months} ${zh ? '个参与月份' : 'active months'}`
  : (zh ? '代码贡献汇总关系（无逐条日期）' : 'Verified code summary; individual dates unavailable');

export function contributorRank(people: GalaxyContributor[], person: GalaxyContributor) {
  return person.rank ?? (person.openrank === null ? null : 1 + people.filter(p => p.openrank !== null && p.openrank > person.openrank!).length);
}

export function ContributorAvatar({ person }: { person: GalaxyContributor }) {
  const [failed, setFailed] = useState(false);
  return <span className="galaxy-avatar-fallback" aria-hidden="true">{person.login.slice(0, 2).toUpperCase()}{!failed && <img src={avatarSource(person)} alt="" loading="lazy" onError={() => setFailed(true)} />}</span>;
}

export default function GalaxyContributors({ people, color, x, y, selected, focus, projectName, zh, onSelect }: {
  people: GalaxyContributor[]; color: string; x: number; y: number;
  selected: string | null; focus: boolean; projectName: string; zh: boolean;
  onSelect: (person: GalaxyContributor) => void;
}) {
  // Three explicit orbits; counts and deterministic spacing are illustrative.
  const rings: { radius: number; start: number; count: number }[] = [];
  for (let start = 0, index = 0; start < people.length; index++) {
    const count = 6 + index * 4;
    rings.push({ radius: 55 + index * 29, start, count });
    start += count;
  }
  return <g className="galaxy-contributor-system">
    {rings.map(r => <ellipse key={r.radius} cx={x} cy={y} rx={r.radius} ry={r.radius * .72} fill="none" stroke={color} strokeOpacity={focus ? .35 : .22} strokeDasharray="2 5" aria-hidden="true" />)}
    {people.map((person, i) => {
      const ring = rings.find(r => i < r.start + r.count) ?? rings[2];
      const count = Math.min(ring.count, people.length - ring.start);
      const angle = (i - ring.start) / count * Math.PI * 2 - Math.PI / 2 + (ring.start === 6 ? .2 : 0);
      const cx = x + Math.cos(angle) * ring.radius;
      const cy = y + Math.sin(angle) * ring.radius * .72;
      const active = selected === person.login;
      const radius = person.openrank !== null && i < 3 ? 11 : 7;
      const rank = contributorRank(people, person);
      const clip = `avatar-${projectName.replace(/ /g, '-')}-${i}`;
      const score = person.openrank === null ? (zh ? '暂无 OpenRank 数据' : 'OpenRank unavailable') : `${zh ? '累计 OpenRank' : 'All-time OpenRank'} ${person.openrank.toFixed(2)}`;
      return <g key={person.login} data-node="contributor" data-login={person.login} className={`galaxy-node galaxy-contributor-node ${active ? 'is-active' : ''}`} role="button" tabIndex={0} aria-pressed={active} aria-label={`${rank === null ? '' : '#' + rank} ${person.login} · ${projectName} · ${score}`} onClick={() => onSelect(person)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(person); } }}>
        <title>{`${rank === null ? '' : '#' + rank} ${person.login} · ${score}`}</title>
        <defs><clipPath id={clip}><circle cx={cx} cy={cy} r={radius} /></clipPath></defs>
        <circle cx={cx} cy={cy} r={radius + 4} fill="#0b1428" stroke={color} strokeWidth={active ? 2 : .8} strokeOpacity={active ? 1 : .7} />
        <text x={cx} y={cy + 3} textAnchor="middle" fill={color} fontSize="7" aria-hidden="true">{person.login.slice(0, 2).toUpperCase()}</text>
        <image href={avatarSource(person)} x={cx - radius} y={cy - radius} width={radius * 2} height={radius * 2} clipPath={`url(#${clip})`} onError={e => { e.currentTarget.style.display = 'none'; }} aria-hidden="true" />
        {rank !== null && <text x={cx + radius + 3} y={cy - radius - 3} className="galaxy-orbit-rank" aria-hidden="true">{rank}</text>}
        {active && focus && <g className="galaxy-contributor-label" aria-hidden="true"><rect x={x - 112} y={y - 177} width="224" height="38" rx="8" fill="#0c1529" stroke={color} strokeOpacity=".6" /><text x={x} y={y - 161} textAnchor="middle">{`${rank === null ? '' : '#' + rank + ' '}${person.login}`}</text><text x={x} y={y - 147} textAnchor="middle" className="galaxy-contributor-value">{score}</text></g>}
      </g>;
    })}
  </g>;
}
