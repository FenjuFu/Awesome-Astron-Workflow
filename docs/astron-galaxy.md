# Astron Galaxy

`/galaxy` visualizes Astron Agent, SkillHub and Astron RPA as project planets in the Astron ecosystem. The homepage and navigation link to it. The route loads separately from the homepage bundle.

The interaction concept references https://openatom-galaxy.x-lab.info/ (organization → projects → developers). The SVG artwork and UI are original; no reference-site assets or code are redistributed.

## Data

`src/data/galaxy.json` combines GitHub metadata and OpenDigger Global OpenRank. Refresh with `python scripts/update-galaxy.py` (delegates to `update-galaxy-openrank.py`), then `python scripts/cache-galaxy-avatars.py`; inspect the diff, build and deploy through the normal review process. Repository or contributor-list failures and archived projects stop the refresh. Individual OpenRank failures are recorded as missing, never zero. `docs/galaxy-data/sources.json` retains response content, raw-response SHA-256 and check time. Public avatar responses are cached unmodified in `src/data/galaxy-avatars.json`, with source and hash records in `docs/galaxy-data/avatars.json`. No visitor-side token is required; external image URLs and initials remain fallbacks for uncached images.

Repository Star and fork counters are recorded at UTC collection time. Every page of the GitHub contributors endpoint is read, excluding anonymous accounts. This code-contributor list is not a census of Issue participants, reviewers or community users; bots can be included. Accounts shared across projects appear once per project in the map; the overview deduplicates logins.

Project and contributor leaderboards use the latest completed month shared by all three repository OpenRank exports. Developer values are Global OpenRank, not contribution to the selected repository. Sort by the original value descending, use competition ranks for ties and alphabetical order within ties. Missing accounts remain visible in orbit and in a separate unranked list. No cross-month fallback or inferred scores are used.

The 2026-10 snapshot has 1/61 scored accounts for Astron Agent, 3/49 for SkillHub and 0/27 for Astron RPA. The three `community_openrank.json` endpoints returned HTTP 404; the page therefore explicitly identifies global influence and does not claim community-specific contribution scores. Case-normalized developer paths were also checked and did not fill the gaps.

Avatar orbit positions, planet sizes and background stars are illustrative. Larger avatars highlight leading entries, not a calibrated score scale. Clicking a rank, project or avatar focuses its project and shows the corresponding account; profiles and published score sources are linked.

## OpenRank explanation

The page reads the published monthly values without recomputing the global network. Its explanation is based on the pinned official implementation:
https://github.com/X-lab2017/open-digger/blob/5c2ffc4f5b3dd37ebcb20514c7abfee6853bd830/src/cron/tasks/globalOpenrank.ts

The implementation builds activity-weighted developer/repository relationships with repository dependencies, injects sigmoid-transformed activity, decays history, and iterates value transfer. The page shows exact activity weights, sigmoid parameters, retention factors and iteration settings from that source. Public monthly exports do not include a calculation-code version; the explanation does not assert that this source reproduces historical exports. Values are not Star/commit sums, percentages or measures of a person's technical ability.

## Validation

Run `npm run build`. Check `/galaxy` at desktop, tablet and mobile sizes; project selection, contributor click/keyboard activation, external links, search/empty state, drag, zoom/reset, language toggle and homepage links. The map has no continuous animation. Keyboard users can select the project cards and contributor nodes without dragging.
