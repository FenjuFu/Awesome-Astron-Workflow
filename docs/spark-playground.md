# Spark HTML Playground

The `/demo#spark-playground` section generates standalone HTML using the fixed `spark-x2.6-4b` model. It reuses the server-only `ASTRON_MAAS_API_KEY`. The dedicated endpoint intentionally uses the standard MaaS URL, independently of the knowledge-base chat model overrides. Enable access to this model for the key.

Users can select bilingual examples, generate a page, revise the current source, edit and run HTML, switch preview width, copy and download. Requests and generated source are not persisted by this feature. Generation failures preserve the previous result. Stop cancels the browser wait; an upstream call already running may continue until its server timeout.

Preview uses an opaque-origin iframe (`sandbox="allow-scripts"`) with CSP placed ahead of model markup. External resources, network requests, nested frames, workers, forms and storage are unavailable. It permits inline scripts for games. This is not a CPU resource boundary: generated scripts can still hang a browser renderer. Downloaded HTML no longer has the preview restrictions; the UI says so.

Production endpoint: `POST /api/playground`, `{prompt, html?}`. Prompt limit 3000 characters, prior HTML 100000 characters, output 8192 tokens, upstream timeout 90 seconds, function budget 100 seconds. Incomplete/truncated results are rejected. Rate limiting is best-effort per warm instance (5 requests per IP/minute, 3 simultaneous calls); use shared edge/WAF limits for a durable public cost ceiling. Do not treat this in-memory limiter as a global quota. Local Vite uses the same generator core but does not apply the production limiter.

Checks: `node --test scripts/test-playground.mjs`, `npm run check`, `npx eslint src/components/SparkPlayground.tsx src/pages/DemoHub.tsx vite.config.ts`, `npx vite build`.
