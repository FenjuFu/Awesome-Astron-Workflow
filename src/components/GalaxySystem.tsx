import OrbitMotion from './OrbitMotion';
import GalaxyContributors from './GalaxyContributors';
import type { GalaxyContributor } from './GalaxyContributors';

export interface OrbitProject {
  id: string; name: string; color: string; openrank: number | null;
  contributors: GalaxyContributor[]; historyEnd: string;
}
export function projectScale(score: number | null, max: number) {
  const value = score === null ? 0 : Math.log1p(score) / Math.log1p(Math.max(1, max));
  return { orbit: score === null ? 435 : 410 - 235 * value, radius: score === null ? 15 : 17 + 21 * value };
}
export default function GalaxySystem({ projects, selected, person, page, matches, zh, paused, onSelect, onPerson }: {
  projects: OrbitProject[]; selected: string | null; person: string | null; page: number;
  matches: string[]; zh: boolean; paused: boolean;
  onSelect: (id: string) => void; onPerson: (id: string, person: GalaxyContributor) => void;
}) {
  const max = Math.max(1, ...projects.map(p => p.openrank ?? 0));
  return <g transform="translate(550 440)">
    {!selected && <g aria-hidden="true"><circle r="50" fill="#697aff" opacity=".22" filter="url(#galaxy-glow)"/><circle r="27" fill="url(#galaxy-core)"/><ellipse rx="48" ry="12" fill="none" stroke="#b6c1ff" opacity=".6"/><text y="55" textAnchor="middle" className="galaxy-core-name">ASTRON</text><text y="73" textAnchor="middle" className="galaxy-core-sub">OPEN-SOURCE ECOSYSTEM</text></g>}
    {!selected && projects.map(p => { const s = projectScale(p.openrank,max); return <ellipse key={p.id} rx={s.orbit} ry={s.orbit*.59} className="galaxy-project-orbit" stroke={p.color} aria-hidden="true"/>; })}
    {projects.filter(p => !selected || selected === p.id).map(p => {
      const i = projects.indexOf(p);
      const focus = selected === p.id;
      const s = projectScale(p.openrank,max);
      const score = p.openrank === null ? (zh ? '暂无数据' : 'No data') : p.openrank.toFixed(2);
      return <OrbitMotion key={p.id} rx={focus ? 0 : s.orbit} ry={focus ? 0 : s.orbit*.59} phase={-1.2+i*2.39996} period={190+i*19} paused={paused || focus}>
        <g opacity={matches.includes(p.id) ? 1 : .12}>
          <GalaxyContributors people={p.contributors.slice(focus ? page*60 : 0, focus ? (page+1)*60 : 12)} color={p.color} x={0} y={0} selected={focus ? person : null} focus={focus} projectName={p.name} zh={zh} paused={paused} onSelect={c => onPerson(p.id,c)}/>
          <g data-node="project" data-project={p.id} className="galaxy-node galaxy-project-node" role="button" tabIndex={0} aria-label={`${p.name} · Local OpenRank ${score} · All time through ${p.historyEnd} (UTC)`} aria-pressed={focus} onClick={()=>onSelect(p.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(p.id);}}}>
            <title>{`${p.name}\nLocal OpenRank: ${score}\nAll collected history through ${p.historyEnd} (UTC)`}</title>
            <circle r={s.radius+18} fill={p.color} opacity=".17" filter="url(#galaxy-glow)"/>
            <circle r={s.radius+6} fill="transparent" stroke={p.color} strokeOpacity=".4"/>
            <circle r={s.radius} fill={`url(#planet-${p.id})`}/>
            <text y={focus ? 200 : s.radius+25} textAnchor="middle" className="galaxy-project-label">{p.name}</text>
            <text y={focus ? 224 : s.radius+43} textAnchor="middle" fill={p.color} className="galaxy-orbit-score">{score} · {zh ? '全历史' : 'All time'}</text>
          </g>
        </g>
      </OrbitMotion>;
    })}
  </g>;
}
