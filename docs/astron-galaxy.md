# Astron Galaxy: independently calculated all-history OpenRank

`/galaxy` shows Astron Agent, SkillHub and Astron RPA with contributor avatar orbits and linked leaderboards. Homepage/navigation entries are preserved. No OpenDigger scores, user lists or data endpoints are used by the current refresh/calculation pipeline.

## Reproduce

1. Authenticate the user's local `gh` CLI. Run `python scripts/update-galaxy.py` to collect GitHub history, calculate scores and cache public avatars. A new cache directory is created for each refresh. To resume, set `GALAXY_HISTORY_CACHE` to the prior run directory.
2. `python scripts/compute-galaxy-openrank.py` recalculates from the checked-in lossless `docs/galaxy-data/github-history/*.json.gz` archives, without contacting GitHub or a score service.
3. Run `python scripts/test_local_openrank.py` and `npm run build`.

Collection uses GraphQL and REST through `gh`, including full Issue/PR pagination, all reviews, closed/merge actors, issue comments, review comments, PR commit authors/coauthors and immutable default-branch commit history. GitHub's 250-commit PR limit is handled by complete paginated comparisons or verified commit ancestry, checked against the PR count and known commit set. Filtered timeline `totalCount` is not mistaken for the filtered item count. The request manifest retains actual fetch times and response hashes. Original comment bodies and email addresses are not published.

The public `galaxy-data/<repo>-calculation.json` files contain the full graph, event ledger, input hashes, parameters, scores, iterations and residual. The frontend does not need to download these ledgers to render the graph.

## Model

The independently implemented equation is `R_i(next) = r_i*b_i + (1-r_i)*sum_j(w_ji*R_j)`. Reference: https://github.com/X-lab2017/openrank-neo4j-gds/blob/83ec0da7352440e391726323bb5eed43c4aa3d76/src/main/java/gds/openrank/OpenRankPregel.java . The implementation uses the mathematical equation, not copied Java library code. Project collaboration modeling reference: https://blog.frankzhao.cn/openrank_in_project/ .

Each repository is calculated separately using all collected history in a single graph. There is no single-month restriction, no summation of externally published monthly values, and no claim that this is global OpenRank or reproduces a third-party leaderboard.

Initial values: developer/repository 1, Issue 2, unmerged PR 3, merged PR 5, standalone code work item 1. Retention: developer/repository 0.15, work item 0.8. Opening/closing weigh 2; comments/reviews/code authorship weigh 1, with each commit's credit split across linked coauthors. An item sends 10% to the repository and 90% to participants. With other participants present, authors receive half the participant share and others split the rest by action weight. Developers send value to their work items by normalized action weights; repositories split value across work items. Convergence requires a residual below 1e-10, with at most 1,000 iterations.

PR and default-branch commits are deduplicated. Default-branch commits not covered by a PR form standalone base-1 work items. If GitHub reports a code contributor but no individual event is linkable, one verified contributor-summary relation is included without inventing event dates. Identified Bots, AI agents and service accounts are excluded before graph construction. The policy in `scripts/galaxy_automation.py` uses the GitHub Bot type, the `[bot]` suffix and exact case-insensitive configured account names (including CLAassistant, Copilot, Claude and GitHub service accounts). It does not use broad substring matches or claim all remaining accounts are verified humans. Automation-only work items without eligible participants are removed; code credit is split only among eligible coauthors. Raw observations, aliases, reasons and excluded event ledgers are retained. Reaction multipliers are not used.

Deleted, private, inaccessible and unlinked-identity activity cannot be reconstructed and is not invented. Imported Git history can predate repository creation. Per-repository ledgers enumerate these limitations and the recorded fetch interval; this is a paginated capture of a changing public repository, not an atomic GitHub database dump. Scores are a consequence of the stated model and observed data, not proof of product usage or technical ability.

## Display and validation

All eligible identified participants receive a recalculated score after the automation filter. The full leaderboard supports search and incremental display. Orbits show 60 accounts per page; selecting any leaderboard row navigates to the correct orbit page and highlights the account. Orbital geometry is illustrative. Original public avatars are cached, with external URLs and initials as fallbacks.

Validate graph replay against reported scores, user identity deduplication, full-history dates, all three leaderboard orders, row-to-orbit pagination, search, formula disclosure, direct evidence links, keyboard activation and desktop/mobile rendering. GitHub writes use only the user's authenticated `gh`; PR merging still requires explicit owner confirmation.

The superseded external-score snapshot remains in Git history (PR #62 / bf14d52346e7220eb0a2394f2743d6134f1d8ce4). It is not an input to this pipeline.

The bilingual introduction includes the six owner-specified annotated links: the OpenRank family introduction, algorithm documentation, project-level contribution article, Open Source Guides metrics guide, Linux Foundation program-success guide and Chinese Global OpenRank documentation. It distinguishes general monthly/global properties from the site’s current all-history repository model.
