import { useId } from 'react';

export function scoreShare(score: number | null, scores: (number | null)[]) {
  if (score === null || !Number.isFinite(score) || score < 0 || scores.some(s => s === null || !Number.isFinite(s) || s < 0)) return null;
  const total = scores.reduce<number>((sum, s) => sum + (s ?? 0), 0);
  return total > 0 ? score / total * 100 : null;
}

export default function OpenRankShare({ score, scores, zh }: { score: number | null; scores: (number | null)[]; zh: boolean }) {
  const id = useId().replace(/:/g, '');
  const share = scoreShare(score, scores);
  const label = share === null ? '—' : share > 0 && share < .01 ? '<0.01%' : `${share.toFixed(2)}%`;
  return <span className="galaxy-score-share" title={zh ? '本项目同时间范围内全部合格贡献者的本地 OpenRank 分数占比，不代表实际工作量。搜索和分页不改变分母。' : 'Share of local OpenRank across all eligible contributors in this project and period, not a share of actual work. Search and pagination do not change the denominator.'}>
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <defs><linearGradient id={id}><stop stopColor="#5ee6d0"/><stop offset=".5" stopColor="#69b8ff"/><stop offset="1" stopColor="#bb96ff"/></linearGradient></defs>
      <circle cx="12" cy="12" r="9" fill="none" stroke="#ffffff18" strokeWidth="2.5"/>
      {share !== null && <circle cx="12" cy="12" r="9" fill="none" stroke={`url(#${id})`} strokeWidth="2.5" pathLength="100" strokeDasharray={`${share} ${100-share}`} transform="rotate(-90 12 12)"/>}
    </svg><span>{label}<small>{zh ? 'OpenRank 占比' : 'OpenRank share'}</small></span>
  </span>;
}
