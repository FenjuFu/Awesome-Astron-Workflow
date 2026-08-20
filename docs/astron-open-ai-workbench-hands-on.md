# Astron Open AI Workbench — real UI integration demo

This example is an importable Astron DSL v1 workflow for a personal or team workbench backed by a local adapter. It was exercised in a local Astron deployment with fictional sandbox data.

## Verified run

- Astron workflow: 4 nodes and 3 edges
- Native Astron table used by the demo: `ai_workbench_0820.workbench_items`
- Records returned: 5
- Successful idempotent rerun: 6.94 seconds
- Model tokens: 0
- Human approvals retained for payment, outbound messages, and public publishing

The first write completed in the table but exceeded the code node's ten-second limit. The adapter checks for the draft title before inserting, so the second run did not create a duplicate and completed successfully.

![Workflow canvas](https://testingcf.jsdelivr.net/gh/FenjuFu/astron-images@main/英文/Open_AI_Workbench_4_Node_Workflow_English_UI.png)

![Debug result](https://testingcf.jsdelivr.net/gh/FenjuFu/astron-images@main/英文/Open_AI_Workbench_Debug_5_Page_Records_English_UI.png)

## Workflow

1. **Start** receives the synchronization request.
2. **AI-assisted draft sync** calls `http://host.docker.internal:8801/v1/workbench/sync`.
3. **Prepare page data** converts the adapter response into a stable JSON page contract.
4. **End** returns the page data to the Astron debugger or user preview.

The phrase “AI-assisted” describes how the draft content was prepared and reviewed. The runtime synchronization node itself is deterministic and used zero model tokens.

## Local adapter contract

The workflow expects a local HTTP adapter because authenticated Astron database access is deployment-specific. The adapter must expose:

```http
POST /v1/workbench/sync
Content-Type: application/json
```

Example response:

```json
{
  "stage": "astron_workbench_sync",
  "database": "ai_workbench_0820",
  "table": "workbench_items",
  "adapter": "local UI adapter",
  "inserted": false,
  "record_count": 5,
  "items": [
    {
      "title": "Confirm family travel budget",
      "owner": "Family",
      "status": "Awaiting review",
      "channel": "Ideas",
      "maintainer_note": "Payment and public publishing still require human approval",
      "updated_by": "Astron Workflow"
    }
  ],
  "human_approval": ["payment", "outbound messages", "public publishing"]
}
```

## Integration boundary

- This is a tested local adapter integration, not an official built-in Astron connector.
- The published YAML contains no account credentials, browser state, API keys, or production data.
- Implement authentication for your own deployment and keep credentials outside the workflow file.
- Do not expose a browser-authenticated adapter to an untrusted network.
- All example business data is fictional.

## Import

Download `assets_source/workflows/astron-open-ai-workbench-hands-on.zh-CN.yml`, then use **Create → Workflow Creation → Import Workflow** in Astron Agent. Start the local adapter before running the debugger.

## License

This contribution follows the repository's MIT license. Astron Agent is available at https://github.com/iflytek/astron-agent.
