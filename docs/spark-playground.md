# Spark HTML Playground

The `/playground` page (replacing Landscape in the main navigation; `/landscape` and `/astron-landscape` redirect here) generates standalone HTML using the fixed `spark-x2.6-4b` model. It reuses the server-only `ASTRON_MAAS_API_KEY`. The dedicated endpoint intentionally uses the standard MaaS URL, independently of the knowledge-base chat model overrides. Enable access to this model for the key.

Users can select bilingual examples, generate a page, revise the current source, edit and run HTML, switch preview width, copy and download. Requests and generated source are not persisted by this feature. Generation failures preserve the previous result. Stop cancels the browser wait; an upstream call already running may continue until its server timeout.

Preview uses an opaque-origin iframe (`sandbox="allow-scripts"`) with CSP placed ahead of model markup. External resources, network requests, nested frames, workers, forms and storage are unavailable. It permits inline scripts for games. This is not a CPU resource boundary: generated scripts can still hang a browser renderer. Downloaded HTML no longer has the preview restrictions; the UI says so.

Production endpoint: `POST /api/playground`, `{prompt, html?}`. Prompt limit 12000 characters, prior HTML 100000 characters, output 8192 tokens, upstream timeout 90 seconds, function budget 100 seconds. Incomplete/truncated results are rejected. Rate limiting is best-effort per warm instance (5 requests per IP/minute, 3 simultaneous calls); use shared edge/WAF limits for a durable public cost ceiling. Do not treat this in-memory limiter as a global quota. Local Vite uses the same generator core but does not apply the production limiter.

Checks: `node --test scripts/test-playground.mjs`, `npm run check`, `npx eslint src/components/SparkPlayground.tsx src/pages/DemoHub.tsx vite.config.ts`, `npx vite build`.

## 2027 Goat Year fair

Seven Chinese New Year prompts appear first in the example picker. Parenthesized values are DIY parameters. Dialogue/story HTML uses prewritten local branches, not hidden model calls. Listening uses browser speech synthesis when supported. Generated works can be downloaded with the existing HTML export. A generated game's practice score is never trusted for a prize.

`NewYearFair` provides two paths: create/download work, or join an event to play three fixed five-question games. A correct answer earns 10 points. Each game is scored once per participant per event (maximum 150 points). A staff member creates a 30-day room and configures actual prize names, point costs (10–150) and stock. The host's tab stores a private 192-bit token in sessionStorage; the visitor share URL contains only the six-digit room code. Keep the host tab available until the event ends. Participants use nicknames and a random participant ID; this is not identity verification. Staff must enforce one participant per person at the booth. Shared kiosks should use “Leave / next visitor”.

`POST /api/new-year` uses the existing server-only `MONGODB_URI` and stores rooms in `astron_workflow.new_year_fairs`, with a TTL index. Answers and scoring stay on the server. Compare-and-replace on the room revision serializes concurrent answers, inventory updates and redemptions. Stale answer indices cannot score twice. Staff redemption uses an idempotency key, deducts the balance and stock together, and requires the event's host token. Other rooms, visitor tokens and DIY iframe messages cannot redeem. The staff UI requires checking the visitor and prize before each redemption. Downloaded score cards are souvenirs, not redeemable bearer vouchers.

Validation: `node --test scripts/tests/new-year-fair.test.mjs scripts/test-playground.mjs`, `npm run check`, `npx vite build`. Local Vite proxies `/api/new-year` to the same handler when `MONGODB_URI` is configured; do not commit credentials.

## Template QA — 2026-11-20

All 13 templates were generated with the real Spark endpoint on the protected feature preview. Final artifacts were exercised in a DOM runtime and the browser, downloaded using the actual editor link, compared byte-for-byte, and reopened independently. API/error/scoring regression tests also pass. Speech reading and navigation work; the test browser has no usable voice, so audible speech remains a target-device acceptance check.

Changes from QA:
- New Year prompts include complete interaction cores, clear inputs, fixed questions, locked scoring, full story paths and restart behavior. Their prompt budget is 12000 characters.
- The candy template includes explicit markup and bounded tile sizing. Because it explicitly requests unchanged JavaScript, initial generation preserves the supplied core, including startup, instead of accepting an omitted model line. Edit requests remain free-form.
- Invalid script syntax, incomplete style/script tags and empty app shells are rejected. Stray tokens between doctype and the HTML root are removed.
- Native download links retain exact source bytes. HTML downloads reopen as playable apps; the new keepsake capture stores the current rendered text, input values, choices and story as a separate static HTML document, without executable scripts or event handlers.
- Profile theme changes the whole page; checklist text is associated with native checkboxes. The three quiz templates refresh the score immediately and reset it on replay.

The checked-in opt-in QA runner (`node scripts/qa-playground.mjs [template-id ...]`) needs a preview-scoped model key. It logs only the generated public template artifacts and status; it never logs credentials. It is not part of the normal build command.

## Culture challenge and shared fullscreen

The culture challenge now uses 24 reviewed questions across regional customs, ethnic festivals, historical customs and classical literature, with topic and difficulty selectors. See [the question inventory and sources](new-year-culture-bank.md). Comprehensive rounds include every topic; filtered challenge rounds use the available question count. Answer feedback includes an explanation and source. Initial generation asks the model for presentation only and inserts the reviewed interaction core on the server. Subsequent user edits remain free-form. Event scoring snapshots five questions server-side, keeps answers hidden until submission, and preserves compatibility with already-started rounds.

The preview toolbar exposes one fullscreen control for all 13 templates and all generated or edited works. It uses native fullscreen with a viewport fallback, preserves the mounted iframe and its state on enter/exit, supports Escape, and restores page scrolling and focus afterward.

Verification: 19 API, scoring and generation regression tests; TypeScript and production build; real Spark generation of the new culture sample; all 10 topic/difficulty combinations completed in the DOM runtime; native fullscreen enter/exit and retained state checked for all 13 samples in the browser. The downloaded culture HTML matched the generated source byte-for-byte and retained its standalone game logic. Fullscreen culture answers retained their question and score after Escape. Audible speech still needs target-device validation as noted above.

## Comfortable spacing across samples

Shared presentation rules now apply to generation, preview, manual HTML runs and downloads. Samples use natural scrollable height instead of squeezing into 470–500px; the editor preview is 640px tall. Main sections use 24px gaps on desktop and 20px on mobile, fields and buttons have at least 48px height, choices have 12px separation, and text uses a 1.75 line height. The sample picker, editor sidebar and toolbar also have more room. The candy board keeps square tiles and its separate grid sizing.

All 13 existing model outputs were checked at mobile and desktop preview widths: no horizontal overflow, one shared style block, and the expected section spacing. Candy scoring/restart, checklist toggling/reset and culture quiz scoring were exercised in the browser. All 13 interaction scripts remain byte-identical after formatting; repeat formatting is idempotent. The browser-downloaded culture HTML matches the formatted source, including spacing. The 19 existing regression checks and the TypeScript/production build pass.
