# Live quiz

Entry: `/activities/quiz`, linked from `/activities`.

The host edits 1–30 four-option questions (10–120 seconds each), creates a room,
shares its six-digit code or invitation link, and starts after players arrive.
Players join with unique nicknames. Each question accepts one answer per player.
The host can reveal early, advance to the next question, and display the final
leaderboard. Correct answers earn 500–1000 points based on server receipt time;
incorrect or missing answers earn zero. Equal totals share a rank.

## Runtime

- Uses the existing `MONGODB_URI`, database `astron_workflow`, collection
  `live_quiz_rooms`. No new external service is required.
- The API creates a TTL index on `expiresAt`. Rooms expire after 24 hours; reads
  enforce expiration even before MongoDB's asynchronous TTL cleanup runs.
- Capacity: 100 players per room. Joining closes when the game starts.
- Clients poll every 1.5 seconds, without overlapping requests. This is polling,
  not WebSockets. Timers use the server clock offset; scoring is server-only.
- Join and answer writes are atomic, including capacity, nickname uniqueness,
  duplicate-answer and deadline guards. Host transitions use revision matching.
- Random host/player credentials stay in browser session storage. Only hashes
  are stored in MongoDB. Credentials never enter invitation URLs. Refreshing the
  same tab recovers the session; closing the tab or explicitly leaving discards it.
- Unrevealed answers and current-question scores are excluded from responses.
  The endpoint uses `Cache-Control: no-store`.
- `/activities/quiz` has an explicit Vercel SPA rewrite before the generic
  activity Open Graph route.

## Checks

```
node --test scripts/tests/live-quiz.test.mjs
npm run build
```

Optional database integration test (creates and removes its own room):

```
node --env-file=.env --env-file=.env.local scripts/tests/live-quiz-integration.mjs
```

`scripts/tests/live-quiz-remote.mjs <preview-url>` is a Windows deployment check
using curl and the locally authenticated Vercel CLI configuration. It reads an
existing preview bypass credential without printing it, creates an ephemeral
test room, and tests 20 concurrent joins and answers. Test rooms expire via TTL.

Browser visual QA must be performed separately; a successful API check does not
verify rendered layouts or touch interactions.

## Deployment verification — 2026-11-05

- Production deployment: `dpl_4f6wGZmCGXADqDq2tNah67ar2nKg`.
- Public route returned HTTP 200 without a protection bypass.
- Production API passed 20 concurrent joins, 20 concurrent answers, repeat-answer
  idempotency, hidden correct-answer checks, scoring and final leaderboard checks.
- Four core behavior tests passed. Vercel production TypeScript/build checks passed.
- A 100-player test was interrupted by a client-side network timeout and is not
  counted as passed. The configured limit is 100; validated concurrency is 20.
- Browser visual/mobile interaction QA was unavailable because the Windows browser
  automation process could not start (`CreateProcessWithLogonW: 1385`).
- Source remains on the local `feat/live-quiz-20261105` branch. No GitHub main branch
  merge was performed.
