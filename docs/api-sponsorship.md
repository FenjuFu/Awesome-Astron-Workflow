# API sponsorship

`/api-sponsorship` provides bilingual documentation and a shared sponsor key after code redemption. It does not create an individual upstream key or credit balance, and does not proxy inference.

Server-only Vercel environment variables (never use a `VITE_` prefix):

- `SPONSORSHIP_ENABLED=true`: explicit release switch. Remove or set false to stop future redemptions.
- `SPONSORSHIP_PASSPHRASE`: event redemption code, stored as a Secret.
- `SPONSORSHIP_API_KEY`: sponsor-provided model key, stored as a Secret.
- `MONGODB_URI`: existing database connection, required for distributed rate limiting.

POST `/api/sponsorship` accepts JSON `{ "passphrase": "...", "accepted": true }`. It requires the production origin or this deployment's exact Vercel URL/branch URL. All responses prohibit caching. Incorrect attempts and successful redemptions share a limit of 10 per address per 15-minute fixed bucket. The MongoDB collection `api_sponsorship_attempts` retains only HMAC address/bucket identifiers, counters, and TTL dates (up to 30 minutes, plus MongoDB TTL cleanup delay). Database failure returns 503, never an unthrottled key. No request bodies or credentials are logged by the handler.

The browser keeps the key in component memory only, clears it after ten minutes, and offers explicit reveal/copy/clear. No key is embedded in cURL examples or stored in browser persistence. Clipboard history is controlled by the user's OS. Configure monitoring not to record redemption request/response bodies or this page's DOM.

The shared key can be copied by a legitimate recipient. Disabling redemption does not revoke previously copied keys; revoke or rotate the key at the upstream provider when ending sponsorship. Configure model authorization and upstream usage limits there. There is no per-recipient quota or one-time redemption guarantee.

Validate with `node --test scripts/tests/sponsorship.test.mjs` and `npm run build`. Test the deployed endpoint with an incorrect code, the supplied code, and repeated attempts; redact the key from receipts. Verify inference separately against each documented upstream protocol.
