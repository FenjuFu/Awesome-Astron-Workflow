# Astron Agent -> MemFlywheel demo bridge

This local adapter exposes a deterministic HTTP surface for an Astron Agent workflow while calling the official `@iflytekopensource/memflywheel@0.1.1` SDK.

It intentionally runs in `recall-only` mode: explicit `sdk.save(...)` writes and `sdk.onPromptBuild(...)` recall are real; automatic turn-end extraction, dream consolidation, and skill evolution are not claimed.

Endpoints:

- `GET /health`
- `POST /v1/memory/save`
- `POST /v1/memory/recall`
- `POST /v1/demo` (save + recall round trip)

The Astron code node calls `http://host.docker.internal:8787/v1/demo` from the `core-workflow` container.
