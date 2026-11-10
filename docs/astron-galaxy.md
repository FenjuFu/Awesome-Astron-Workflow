# Astron Galaxy: independently computed project and contributor OpenRank

`/galaxy` shows the eight projects declared in `src/data/galaxy-projects.json`, with contributor avatar orbits and linked leaderboards. The registry contains stable artifact IDs plus canonical GitHub owner/repository names, including `XHToken/Spark-MLX-LLM`; it is shared by collection, calculation and display. Homepage/navigation entries are preserved. Both project and contributor scores are independently calculated from GitHub history using the documented OpenRank equation and community value-flow ratios. No official score API or external score dataset is used.

## Daily cloud refresh

`.github/workflows/galaxy-daily.yml` runs at 01:30 UTC / 09:30 Asia/Shanghai daily and supports manual dispatch. GitHub may delay scheduled starts. It uses a fresh history cache, recalculates all registered projects, replays every graph, runs the publishing boundary tests and builds the frontend before publishing.

The repository secret `GALAXY_GH_TOKEN` must authenticate as FenjuFu, with repository contents and pull-request write access and access to public GitHub history. It is never printed. A missing/expired secret fails before collection; no permission or branch-protection settings are changed automatically. Provision credentials through an explicitly authorized secure flow.

On 2026-11-10 the owner authorized automatic merges for this daily update. Each run creates a signed, data-only commit and a PR, requests a non-author collaborator with write access when available, then waits for external checks (including Vercel). If no eligible reviewer exists, the receipt and Actions warning explicitly report the gap; no collaborator is added. No source-code changes are eligible for this automatic merge. Failed/missing checks, changed PR heads or changed master leave the PR open. Branch protection remains enforced; no admin bypass is used.

The existing Vercel Git integration deploys the merged master branch. The job then anonymously checks the production page's entry bundle for the snapshot time and every project graph hash, and compares every public Galaxy JSON artifact byte-for-byte. Publication/production receipts are retained in the run artifact for 30 days, including errors. A green collection step alone does not mean publication succeeded. The run is unsuccessful if production verification times out. Failed runs can be inspected and rerun; previously deployed production remains available if collection or validation fails.

This cloud schedule replaces the proposed local desktop task; no computer or desktop app needs to remain running.

## Manual reproduction

1. Authenticate the user's local `gh` CLI. Run `python scripts/update-galaxy.py` to collect GitHub history, calculate scores and cache public avatars. A new cache directory is created for each refresh. To resume, set `GALAXY_HISTORY_CACHE` to the prior run directory.
2. `python scripts/compute-galaxy-openrank.py` recalculates from the checked-in lossless `docs/galaxy-data/github-history/*.json.gz` archives, without contacting GitHub or a score service.
3. Run `python scripts/test_local_openrank.py` and `npm run build`.

Collection uses GraphQL and REST through `gh`, including full Issue/PR pagination, all reviews, closed/merge actors, issue comments, review comments, PR commit authors/coauthors and immutable default-branch commit history. GitHub's 250-commit PR limit is handled by complete paginated comparisons or verified commit ancestry, checked against the PR count and known commit set. Filtered timeline `totalCount` is not mistaken for the filtered item count. The request manifest retains actual fetch times and response hashes. Original comment bodies and email addresses are not published.

The public `galaxy-data/<repo>-calculation.json` files contain the full graph, event ledger, input hashes, parameters, scores, iterations and residual. The frontend does not need to download these ledgers to render the graph.

## Local contributor model

The independently implemented equation is `R_i(next) = r_i*b_i + (1-r_i)*sum_j(w_ji*R_j)`. Reference: https://github.com/X-lab2017/openrank-neo4j-gds/blob/83ec0da7352440e391726323bb5eed43c4aa3d76/src/main/java/gds/openrank/OpenRankPregel.java . The implementation uses the mathematical equation, not copied Java library code. Project collaboration modeling reference: https://blog.frankzhao.cn/openrank_in_project/ .

Each repository is calculated separately using all collected history in a single graph. There is no single-month restriction, no summation of externally published monthly values, and no claim that this is global OpenRank or reproduces a third-party leaderboard.

Initial values: developer/repository 1, Issue 2, unmerged PR 3, merged PR 5, standalone code work item 1. Retention: developer/repository 0.15, work item 0.8. Opening/closing weigh 2; comments/reviews/code authorship weigh 1, with each commit's credit split across linked coauthors. An item sends 10% to the repository and 90% to participants. With other participants present, authors receive half the participant share and others split the rest by action weight. Developers send value to their work items by normalized action weights; repositories split value across work items. Convergence requires a residual below 1e-10, with at most 1,000 iterations.

PR and default-branch commits are deduplicated. Default-branch commits not covered by a PR form standalone base-1 work items. If GitHub reports a code contributor but no individual event is linkable, one verified contributor-summary relation is included without inventing event dates. Identified Bots, AI agents and service accounts are excluded before graph construction. The policy in `scripts/galaxy_automation.py` uses the GitHub Bot type, the `[bot]` suffix and exact case-insensitive configured account names (including CLAassistant, Copilot, Claude and GitHub service accounts). It does not use broad substring matches or claim all remaining accounts are verified humans. Automation-only work items without eligible participants are removed; code credit is split only among eligible coauthors. Raw observations, aliases, reasons and excluded event ledgers are retained. Reaction multipliers are not used.

Deleted, private, inaccessible and unlinked-identity activity cannot be reconstructed and is not invented. Imported Git history can predate repository creation. Per-repository ledgers enumerate these limitations and the recorded fetch interval; this is a paginated capture of a changing public repository, not an atomic GitHub database dump. Scores are a consequence of the stated model and observed data, not proof of product usage or technical ability.

## Display and validation

All eligible identified participants receive a recalculated score after the automation filter. The full leaderboard supports search and incremental display. Overview orbits show up to 12 accounts per project; focused orbits show 60 accounts per page; selecting any leaderboard row navigates to the correct orbit page and highlights the account. Contributor orbital geometry is illustrative; project orbital radius and size encode the local repository-node score (see below). Original public avatars are cached, with external URLs and initials as fallbacks.

Validate graph replay against reported scores, user identity deduplication, full-history dates, all three leaderboard orders, row-to-orbit pagination, search, formula disclosure, direct evidence links, keyboard activation and desktop/mobile rendering. GitHub writes use only the user's authenticated `gh`; PR merging still requires explicit owner confirmation.

The superseded external-score snapshot remains in Git history (PR #62 / bf14d52346e7220eb0a2394f2743d6134f1d8ce4). It is not an input to this pipeline.

The bilingual introduction includes the six owner-specified annotated links: the OpenRank family introduction, algorithm documentation, project-level contribution article, Open Source Guides metrics guide, Linux Foundation program-success guide and Chinese Global OpenRank documentation. It distinguishes general monthly/global properties from the site’s current all-history repository model.

## Worked score examples

`python scripts/build-openrank-examples.py` derives Astron Agent’s current top two directly from the converged graph and verifies their scores. It writes a compact UI artifact and a public full-precision breakdown of every incoming edge. `compute-galaxy-openrank.py` invokes it after each refresh. The frontend checks the graph hash, names and scores against the active leaderboard and suppresses stale examples. Displayed values are rounded; the full-precision ledger is authoritative.

## Project expansion and capture dates

The catalog includes Astron Agent, SkillHub, Astron RPA, Astron Harness Tutorial, iFly-Skills, Domux, Dolphin MCP Pilot and Spark MLX LLM. All are checked for public/non-archived status before collection. `collect-galaxy-github.py --repos <id> ...` supports targeted additions; the normal refresh collects every configured project. REST paths, GraphQL owner/name variables, commit links and evidence metadata use each project’s actual organization.

When adding the five projects, the original three verified history archives are retained. Each leaderboard uses its own repository capture cutoff; the footer labels the date range as snapshot dates, not as the OpenRank activity window. The Astron Agent worked examples use that repository’s own capture timestamp. Existing scores are checked for unchanged graph hashes.

## Local project scores and animated orbits

Both scores come from `scripts/compute-galaxy-openrank.py` using the checked-in GitHub history archives. The project score is the converged repository node (`repositoryOpenRank` in its ledger), not a sum of contributor scores. All eight projects use the same parameters: work items transfer 10% to the repository and 90% to participants; when other participants exist, authors receive 50% of the participant allocation. See the local model above and the linked original article and Community OpenRank documentation in the page.

This is an all-history adaptation of the community model, not the official monthly global algorithm: no full global collaboration graph, monthly inheritance/decay, or reaction bonuses are claimed. Projects show their individual capture cutoff; historical coverage lengths differ. The map's logarithmic sizing is a separate visualization choice. The repository score is independently replayed and checked against its ledger and frontend value.

The former external-score capture in `docs/galaxy-data/global-openrank/` is retained solely as superseded historical evidence from commit 004aa2ed9fae71390c8118f022695cebbf414f93. Its collection script and frontend artifact have been removed. It is never an input to active calculation or display; Spark MLX LLM now uses its own local graph like every other project.

For score s and display-set maximum M, u = log(1+s)/log(1+max(1,M)). Orbital semi-major radius = 190+54k+130(1-u), with k counting higher-scoring projects; planet radius = 12+14u. This introduces a minimum 54-unit separation for unequal scores while preserving ordering and equal-score ties. The projection uses a 0.59 vertical ratio. Missing scores use an explicitly unranked outer track. Values remain visible in labels/tooltips. The center is the Astron ecosystem identity, not a computed aggregate. Motion speeds are decorative. Project orbit wrappers move their contributor systems, while contributor wrappers independently orbit locally; avatars and text never rotate. Hover/focus pauses the relevant orbit, selected contributors remain stable, a pause button stops both layers and reduced-motion preference disables animation. Browser frames update wrapper transforms without React state renders.

Percentages divide each local contributor score by the sum of **all eligible participants in the same repository and all-history period**, after the existing automation exclusions. Search and pagination never change the denominator. Missing/nonfinite/negative scores or zero totals render an unavailable share; positive values below 0.01% display `<0.01%`. The gradient ring arc is exactly the percentage (no artificially enlarged minimum arc). Shares describe this model's score allocation, not actual workload or product usage.

Validation: TypeScript check and production build; browser checks for both motion layers, global pause, reduced motion, project order/missing score, selected contributor, full-denominator calculation and search invariance, English/Chinese, and 390/768/1024/1600px layouts. Screenshots and receipts are retained outside the source checkout in `D:/aaw-galaxy-evidence/global-motion/`.

## Collapsible panel and viewport controls

The sidebar starts closed on every page visit. A visible bilingual guide opens project rankings, contributor shares and algorithm references; selecting a project also opens it. Close or Escape restores focus to the toggle. The drawer overlays the full-width canvas without changing the camera position. The hidden panel cannot receive keyboard focus.

The persistent toolbar includes drag mode, directional pan, zoom (50–300%), reset and pause. Canvas wheel zoom is pointer-anchored; touch supports two-pointer pinch and pan. Keyboard arrows pan, +/- zoom and 0 resets when the map has focus. Dragging suppresses accidental node clicks. SVG screen transforms are used for coordinate conversion at every responsive size. Project planets are smaller; minimum radial spacing supplements the logarithmic score mapping, and a shared 260-second decorative orbit period reduces overtaking. Scores, contributor percentages and model parameters are unchanged.
