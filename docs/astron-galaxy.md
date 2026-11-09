# Astron Galaxy

`/galaxy` visualizes Astron Agent, SkillHub and Astron RPA as project planets in the Astron ecosystem. The homepage and navigation link to it. The route loads separately from the homepage bundle.

The interaction concept references https://openatom-galaxy.x-lab.info/ (organization → projects → developers). The SVG artwork and UI are original; no reference-site assets or code are redistributed.

## Data

`src/data/galaxy.json` is a checked-in GitHub API snapshot. Refresh with `python scripts/update-galaxy.py`, inspect the diff, build and deploy through the normal review process. A failed request or archived project stops the refresh without replacing the prior snapshot. No visitor-side GitHub token or API request is required.

Repository Star and fork counters are exact at the recorded UTC collection time, not live counters. The contributor endpoint returns the first 30 accounts per repository in contribution-count order; this includes bots when present and is not an exhaustive contributor or user census. Accounts shared across projects appear once per project in the map; the overview account count deduplicates login names. GitHub contribution counts are not OpenRank.

Contributor sizes use a capped logarithmic scale. Planet sizes, coordinates, orbital paths and background stars are illustrative. Edges express ecosystem/project membership, not technical dependencies or measured collaboration.

## Validation

Run `npm run build`. Check `/galaxy` at desktop, tablet and mobile sizes; project selection, contributor click/keyboard activation, external links, search/empty state, drag, zoom/reset, language toggle and homepage links. The map has no continuous animation. Keyboard users can select the project cards and contributor nodes without dragging.
