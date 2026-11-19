# Spark HTML Playground

The `/playground` page (replacing Landscape in the main navigation; `/landscape` and `/astron-landscape` redirect here) generates standalone HTML using the fixed `spark-x2.6-4b` model. It reuses the server-only `ASTRON_MAAS_API_KEY`. The dedicated endpoint intentionally uses the standard MaaS URL, independently of the knowledge-base chat model overrides. Enable access to this model for the key.

Users can select bilingual examples, generate a page, revise the current source, edit and run HTML, switch preview width, copy and download. Requests and generated source are not persisted by this feature. Generation failures preserve the previous result. Stop cancels the browser wait; an upstream call already running may continue until its server timeout.

Preview uses an opaque-origin iframe (`sandbox="allow-scripts"`) with CSP placed ahead of model markup. External resources, network requests, nested frames, workers, forms and storage are unavailable. It permits inline scripts for games. This is not a CPU resource boundary: generated scripts can still hang a browser renderer. Downloaded HTML no longer has the preview restrictions; the UI says so.

Production endpoint: `POST /api/playground`, `{prompt, html?}`. Prompt limit 3000 characters, prior HTML 100000 characters, output 8192 tokens, upstream timeout 90 seconds, function budget 100 seconds. Incomplete/truncated results are rejected. Rate limiting is best-effort per warm instance (5 requests per IP/minute, 3 simultaneous calls); use shared edge/WAF limits for a durable public cost ceiling. Do not treat this in-memory limiter as a global quota. Local Vite uses the same generator core but does not apply the production limiter.

Checks: `node --test scripts/test-playground.mjs`, `npm run check`, `npx eslint src/components/SparkPlayground.tsx src/pages/DemoHub.tsx vite.config.ts`, `npx vite build`.

## 2027 Goat Year fair

Seven Chinese New Year prompts appear first in the example picker. Parenthesized values are DIY parameters. Dialogue/story HTML uses prewritten local branches, not hidden model calls. Listening uses browser speech synthesis when supported. Generated works can be downloaded with the existing HTML export. A generated game's practice score is never trusted for a prize.

`NewYearFair` provides two paths: create/download work, or join an event to play three fixed five-question games. A correct answer earns 10 points. Each game is scored once per participant per event (maximum 150 points). A staff member creates a 30-day room and configures actual prize names, point costs (10–150) and stock. The host's tab stores a private 192-bit token in sessionStorage; the visitor share URL contains only the six-digit room code. Keep the host tab available until the event ends. Participants use nicknames and a random participant ID; this is not identity verification. Staff must enforce one participant per person at the booth. Shared kiosks should use “Leave / next visitor”.

`POST /api/new-year` uses the existing server-only `MONGODB_URI` and stores rooms in `astron_workflow.new_year_fairs`, with a TTL index. Answers and scoring stay on the server. Compare-and-replace on the room revision serializes concurrent answers, inventory updates and redemptions. Stale answer indices cannot score twice. Staff redemption uses an idempotency key, deducts the balance and stock together, and requires the event's host token. Other rooms, visitor tokens and DIY iframe messages cannot redeem. The staff UI requires checking the visitor and prize before each redemption. Downloaded score cards are souvenirs, not redeemable bearer vouchers.

Validation: `node --test scripts/tests/new-year-fair.test.mjs scripts/test-playground.mjs`, `npm run check`, `npx vite build`. Local Vite proxies `/api/new-year` to the same handler when `MONGODB_URI` is configured; do not commit credentials.
