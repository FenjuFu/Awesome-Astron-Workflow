---
name: astron-memflywheel
description: "Use when the user needs to run the Astron MemFlywheel workflow for a real save-and-recall roundtrip."
---

# Astron MemFlywheel

Use this skill for a real save-and-recall roundtrip through the published Astron Agent workflow.

## Inputs

- `input` (string, required): The memory text or save-and-recall instruction.
- `uid` (string, optional): Stable caller id. Use `dsh-demo-user` when the user gives no id.

## Local bridge

The DSH-facing skill never receives Astron credentials. Call the loopback bridge, which owns the private exported workflow configuration on the host.

## Procedure

1. Keep the user's requested memory text unchanged in `input`.
2. Use the `pwsh` tool to POST JSON to `http://127.0.0.1:8789/run`.
3. Read the returned `ok`, `httpStatus`, `providerCode`, `eventCount`, and `texts` fields.
4. Report the workflow result. Never invent a save or recall result when `ok` is false.

```powershell
$body = @{
  input = '<user request>'
  uid = 'dsh-demo-user'
} | ConvertTo-Json -Compress

Invoke-RestMethod `
  -Uri 'http://127.0.0.1:8789/run' `
  -Method Post `
  -ContentType 'application/json' `
  -Body $body | ConvertTo-Json -Depth 12
```

## Notes

- The bridge binds only to `127.0.0.1` and does not log request bodies or authorization headers.
- If the bridge is unavailable, report that local runtime failure instead of calling the public Astron endpoint directly.
- Do not search for, open, or expose the bridge's private exported configuration.
