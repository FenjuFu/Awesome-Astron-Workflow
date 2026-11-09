import examples from '../data/openrank-examples.json';
import snapshot from '../data/galaxy.json';
import './OpenRankExamples.css';

const decimal = (value: number, digits = 6) => value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });

export default function OpenRankExamples({ zh }: { zh: boolean }) {
  const project = snapshot.projects.find(p => p.id === 'astron-agent');
  const valid = project?.calculation.graphSha256 === examples.graphSha256 && examples.examples.every((example, index) => project.contributors[index]?.login === example.login && Math.abs(project.contributors[index].openrank - example.score) < 1e-8);
  return <details className="galaxy-score-examples">
    <summary>{zh ? '实算示例：Astron Agent 第一名与第二名' : 'Worked examples: Astron Agent’s top two'}</summary>
    {!valid ? <p>{zh ? '当前榜单的数值示例待更新，请查看最新计算账本。' : 'Examples for this leaderboard version are pending; consult the current calculation ledger.'}</p> : <>
      <p>{zh ? '以下代入当前榜单实际收敛图，初始值 b、保留系数 r 和每一项网络输入均来自计算账本。' : 'These examples use the current leaderboard’s converged graph. Initial value b, retention r and every network input come from the calculation ledger.'}</p>
      <code>R = r × b + (1 − r) × Σ(w × R_item)</code>
      {examples.examples.map(example => <section key={example.login} className="galaxy-score-example" data-example-login={example.login}>
        <h3>#{example.rank} <a href={example.profileUrl} target="_blank" rel="noopener noreferrer">{example.login} ↗</a></h3>
        <p>{zh ? `来自 ${example.termCount} 个协作事项的加权输入合计：` : `Weighted input from ${example.termCount} work items:`} <strong>{decimal(example.incomingTotal, 9)}</strong></p>
        <code className="galaxy-example-formula">{`R = ${decimal(example.retention, 2)} × ${decimal(example.base, 0)} + ${decimal(example.networkFactor, 2)} × ${decimal(example.incomingTotal, 9)}\n  = ${decimal(example.baseTerm, 2)} + ${decimal(example.networkTerm, 9)}\n  = ${decimal(example.recomputedScore, 9)}\n  ≈ ${decimal(example.score, 2)}`}</code>
        <p>{zh ? '其中，最大的三项输入为：' : 'The three largest input terms are:'}</p>
        <ol>{example.topTerms.map(term => <li key={term.node}><a href={term.url} target="_blank" rel="noopener noreferrer">{term.label} ↗</a><code>{`${decimal(term.edgeWeight)} × ${decimal(term.nodeScore)} = ${decimal(term.weightedInput)}`}</code></li>)}</ol>
        <p>{zh ? `其余 ${example.otherTermCount} 项输入合计：` : `Remaining ${example.otherTermCount} input terms:`} <strong>{decimal(example.otherInputTotal, 9)}</strong></p>
      </section>)}
      <p>{zh ? 'w 是协作事项传给该账号的归一化边权重，R_item 是该事项在整张图中的收敛分值。上方各项先求和，再统一乘 0.85；这不是将 PR、评论或提交次数直接相加。中间值按展示精度取舍，排名使用完整精度。' : 'w is the normalized edge weight from a work item to the account; R_item is that item’s converged graph score. Sum the inputs first, then multiply by 0.85. These are not raw counts of PRs, comments or commits. Displayed intermediate values are rounded; ranking uses full precision.'}</p>
      <a href={examples.fullBreakdown} target="_blank" rel="noopener noreferrer">{zh ? '查看两位账号的全部输入项与完整精度' : 'All input terms and full-precision values'} ↗</a>
      <a href={examples.source} target="_blank" rel="noopener noreferrer">{zh ? '查看原始图、边权与收敛账本' : 'Source graph, edge weights and convergence ledger'} ↗</a>
    </>}
  </details>;
}
