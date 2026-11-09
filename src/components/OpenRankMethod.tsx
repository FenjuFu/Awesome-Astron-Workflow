import OpenRankExamples from './OpenRankExamples';

const openRankReferences = [
  {
    "url": "https://open-digger.cn/en/blog/2025-08-09-openrank-introduction",
    "zhTitle": "OpenRank 开源评价系列算法介绍",
    "enTitle": "OpenRank algorithm family overview (Chinese)",
    "zhNote": "了解影响力与贡献度两类评价、设计思路和应用场景。",
    "enNote": "Introduces influence and contribution evaluation, their rationale and applications."
  },
  {
    "url": "https://open-digger.cn/en/docs/user-docs/metrics/openrank",
    "zhTitle": "OpenRank 算法文档",
    "enTitle": "OpenRank algorithm documentation",
    "zhNote": "说明通用图模型、价值传播及算法的评价理念。",
    "enNote": "Explains the general graph model, value propagation and evaluation principles."
  },
  {
    "url": "https://blog.frankzhao.cn/openrank_in_project/",
    "zhTitle": "开源项目内开发者贡献评价",
    "enTitle": "Developer contribution within a project (Chinese)",
    "zhNote": "以 Issue、PR 等协作事项构建项目内网络，介绍贡献评价与历史影响。",
    "enNote": "Models within-project collaboration through Issues and PRs, with contribution evaluation and historical influence."
  },
  {
    "url": "https://opensource.guide/metrics/",
    "zhTitle": "Open Source Guides：开源指标",
    "enTitle": "Open Source Guides: metrics",
    "zhNote": "从发现、使用、留存和维护者活跃度衡量社区；属于更广泛的度量指南，不是 OpenRank 公式。",
    "enNote": "Covers discovery, usage, retention and maintainer activity; broader measurement guidance, not the OpenRank formula."
  },
  {
    "url": "https://www.linuxfoundation.org/resources/open-source-guides/measuring-your-open-source-program-success",
    "zhTitle": "Linux Foundation：衡量开源计划成效",
    "enTitle": "Linux Foundation: measuring program success",
    "zhNote": "讨论组织如何定义目标、选择指标并评估开源计划成效；属于组织层面的补充阅读。",
    "enNote": "Discusses defining objectives, selecting metrics and evaluating an organization’s open-source program."
  },
  {
    "url": "https://open-digger.cn/docs/user_docs/metrics/global_openrank",
    "zhTitle": "全域 OpenRank 影响力",
    "enTitle": "Global OpenRank influence (Chinese)",
    "zhNote": "说明全域协作网络、历史继承、鲁棒性及参数，用于理解全域版本的具体口径。",
    "enNote": "Details the global collaboration network, historical retention, robustness and parameters."
  }
];

export default function OpenRankMethod({ zh }: { zh: boolean }) {
  return <details className="galaxy-method galaxy-openrank-method"><summary>{zh ? 'OpenRank 介绍与计算方式' : 'About OpenRank & its calculation'}</summary>
    <div className="galaxy-openrank-intro">
      <p><strong>{zh ? '价值与影响力 · 图算法' : 'Impact & value · a graph algorithm'}</strong><br />{zh ? 'OpenRank 从协作网络衡量开源价值与影响力。全域版本连接开发者与仓库，分值取决于谁与谁协作、协作强度及网络结构；价值沿关系迭代流动，而非仅统计活动次数。' : 'OpenRank evaluates open-source impact through collaboration networks. Its global form connects developers and repositories: scores depend on who collaborates, the strength of those relationships and network structure. Value flows iteratively through the graph.'}</p>
      <p><strong>{zh ? '历史积累与长期贡献' : 'History & sustained contribution'}</strong><br />{zh ? '按月计算的全域 OpenRank 会保留一部分历史影响力，并结合当期协作更新，具有类似声誉积累的属性。这使长期、持续的有效贡献能够得到体现，但并不保证贡献时间越长，分值就一定越高。' : 'Monthly Global OpenRank retains part of historical influence and updates it with current collaboration, giving it a reputation-like quality. Sustained, meaningful participation can accumulate influence; a longer history alone does not guarantee a higher score.'}</p>
      <p><strong>{zh ? '鲁棒性与抗刷量' : 'Robustness & resistance to manipulation'}</strong><br />{zh ? '网络关系使 OpenRank 比单纯计数更有能力缓解刷量：孤立账号的重复活动不必然获得同等影响力。协作结构可提供抱团或孤岛行为的分析线索，但分值本身不是作弊判定，也不能保证识别所有操纵。' : 'Network relationships can make OpenRank more robust than raw counts: repeated activity by isolated accounts need not translate into equivalent influence. Network structure can provide clues about closed groups or isolated activity, but scores alone neither prove misconduct nor detect every manipulation.'}</p>
      <div className="galaxy-openrank-references">
        <p><strong>{zh ? '完整介绍与延伸阅读' : 'Full introductions & further reading'}</strong></p>
        {openRankReferences.map(reference => <p key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer">{zh ? reference.zhTitle : reference.enTitle} ↗</a><span>{zh ? reference.zhNote : reference.enNote}</span></p>)}
      </div>
      <p><strong>{zh ? '本站当前采用的口径' : 'How this site applies the model'}</strong><br />{zh ? '下方榜单为每个仓库分别构建全历史协作图，由本站独立计算。当前未实施跨月分值继承，也未覆盖全域网络；上述历史声誉和全域抗刷特性不应直接视为本站已验证的能力。' : 'This site independently calculates a separate all-history collaboration graph for each repository. It does not currently implement month-to-month score inheritance or a global network. Historical reputation and global anti-manipulation properties should not be treated as validated capabilities of this implementation.'}</p>
    </div>
    <p>{zh ? '本站直接采集这些 GitHub 仓库的公开历史，独立计算全历史仓库内 OpenRank。排除已识别的 Bot、AI 和服务账号后，其余公开参与者统一进入计算，不使用 OpenDigger 的分值、账号名单或数据接口。每个仓库单独构图，这是项目内贡献度，不是全网影响力。' : 'We collect public GitHub history and independently calculate all-history repository OpenRank for eligible public participants after excluding identified Bot, AI and service accounts. No OpenDigger scores, account lists or data endpoints are used. Each repository has its own graph; this measures within-project contribution.'}</p>
    <ol><li>{zh ? '构图：节点包括仓库、Issue、PR、开发者，以及未被 PR 覆盖的主分支提交。边来自发起、评论、审阅、关闭/合并和代码作者关系。' : 'Build nodes for the repository, Issues, PRs, developers and default-branch commits not covered by PRs. Connect them using authorship, comments, reviews, closure/merge and code authorship.'}</li><li>{zh ? '赋权：发起与关闭为 2，评论、审阅和提交为 1；共同作者平分单次提交的权重。协作事项向仓库传递 10%、向参与者传递 90%；有其他参与者时，作者取得参与者部分的一半，其余按行为权重分配。' : 'Opening and closing weigh 2; comments, reviews and commits weigh 1, split across coauthors. Items send 10% to the repository and 90% to participants; authors receive half the participant share when others participate.'}</li><li>{zh ? '迭代：按下式沿加权网络传递数值，直到变化小于 10⁻¹⁰，最多 1000 次；未收敛不会发布。按最终值降序排序，同分并列。' : 'Iterate the equation below to a tolerance of 10⁻¹⁰, at most 1,000 iterations. Non-convergent results are not published. Rank final values descending, with ties sharing a rank.'}</li></ol>
    <code>Rᵢ(next) = rᵢ × bᵢ + (1 − rᵢ) × Σⱼ(wⱼᵢ × Rⱼ)</code>
    <OpenRankExamples zh={zh} />
    <p>{zh ? 'b 为初始值：开发者/仓库 1、Issue 2、未合并 PR 3、已合并 PR 5、独立代码事项 1。r 为保留系数：开发者/仓库 0.15、协作事项 0.8；w 为归一化边权重。全历史一次构图，不截取单月，也不累加外部月度分值。' : 'Initial b: developer/repository 1, Issue 2, unmerged PR 3, merged PR 5, standalone code item 1. Retention r: developer/repository 0.15, work item 0.8. Edge weights w are normalized. The graph spans all collected history, without a single-month cutoff or external score accumulation.'}</p>
    <details><summary>{zh ? '数据范围与计算边界' : 'Data scope & model boundaries'}</summary><p>{zh ? 'Issue、PR、审阅、共同作者、评论和主分支提交均检查分页；提交在 PR 与主分支之间去重。无法逐提交关联的代码账号用 GitHub contributors 的已核实汇总关系补入，不虚构事件日期。GitHub Bot 标记、[bot] 后缀及明确列出的 AI/自动化账号（含 GitHub、CLA、Copilot、Gemini、Claude、ChatGPT 服务账号）在构图前排除；只含自动化活动的事项也移除。原始记录和逐账号排除原因保留在账本中。' : 'Pagination covers Issues, PRs, reviews, coauthors, comments and default-branch commits. Commit credit is deduplicated. A verified GitHub contributor-summary relation covers code accounts without individually linked commits, without invented dates. GitHub Bot flags, [bot] suffixes and an explicit AI/automation account list are excluded before building the graph, including GitHub, CLA, Copilot, Gemini, Claude and ChatGPT service accounts. Automation-only items are removed. Raw records and exclusion reasons remain in the ledger.'}</p><p>{zh ? '不推算已删除、私有或无法关联身份的活动，不使用表情加分；导入的 Git 历史可能早于仓库创建日期。计算账本记录缺口、原始采集范围、图结构、参数和收敛残差。此版本是透明的全历史模型，不声称复现其他榜单。' : 'Deleted, private and unidentified activity is not inferred; reaction bonuses are disabled. Imported Git history may predate repository creation. Downloadable ledgers record coverage, gaps, graph, parameters and convergence residuals. This is a transparent all-history model, not a claim to reproduce another leaderboard.'}</p></details>
    <a href="https://github.com/X-lab2017/openrank-neo4j-gds/blob/83ec0da7352440e391726323bb5eed43c4aa3d76/src/main/java/gds/openrank/OpenRankPregel.java" target="_blank" rel="noopener noreferrer">{zh ? 'OpenRank 迭代公式参考 · 固定版本' : 'OpenRank equation reference · pinned version'} ↗</a>
  </details>;
}
