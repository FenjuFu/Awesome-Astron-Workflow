# Astron Agent → SKILL → DSH → Spark Ultra

This example reproduces a complete DSH model turn with an Astron-exported skill and iFlytek Spark `4.0Ultra`.

The verified run on 2026-08-14 used a goal-only prompt: it did not name any tool. Spark selected `skill → pwsh → pwsh`, completed four model steps, returned three successful tool results, and received HTTP 200 / provider code 0 from the published Astron workflow.

## What `skill → pwsh → pwsh` means

This is the model's observed decision sequence, not a hard-coded pipeline:

1. `skill`: Spark recognized that `astron-memflywheel` matched the goal and asked DSH to load its execution instructions.
2. First `pwsh`: after reading those instructions, Spark constructed and executed the loopback HTTP request that invokes the real Astron workflow.
3. Second `pwsh`: after seeing the first non-error result, Spark chose to execute the bridge again as an additional run/check before answering.
4. Final model step: Spark stopped calling tools and summarized the observed results for the user.

The prompt named no tools and the patch did not prescribe this order. The demo did restrict the available tool set to `skill` and `pwsh`, so “autonomous” here means the model chose the next action within that bounded set from the task and each returned result. It does not mean unrestricted autonomy, model training, or a native Astron–DSH integration. The second call is evidence of an additional model-chosen execution, not proof that every task requires two PowerShell calls.

A separate portability revalidation on the same date makes that boundary concrete. After the runner was made independent of the parent Git checkout and moved to a `read-only` DSH sandbox, Spark selected only `skill → pwsh`, then answered successfully: three model steps, 2/2 non-error tool results, a completed turn, and the requested recall marker in the session. The second `pwsh` in the original four-step run was therefore not required by the runner or the Skill; it was a model-chosen extra action in that particular turn.

## What is included

- `spark-ultra.patch.yml` registers Spark as an OpenAI-compatible DSH provider.
- `run-dsh-spark.ps1` starts the local adapters and invokes DSH without machine-specific paths.
- `spark-openai-proxy.mjs` forwards DSH requests to Spark's official OpenAI-compatible HTTP endpoint and normalizes the final streamed `finish_reason` expected by the tested DSH release.
- `astron-skill-bridge.mjs` keeps the private Astron workflow export outside the model-visible skill.
- `.agents/skills/astron-memflywheel/SKILL.md` is the sanitized skill that DSH discovers.
- `skill-demo-tools.patch.yml` limits the demonstration to the `skill` and `pwsh` tools, without prescribing their order.
- `memflywheel-bridge/` is the local adapter used by the published Astron workflow YAML.

No credential value is included. The private Astron export stays under `.runtime/`, which is ignored by Git.

The runner sets `DSH_AGENTS_HOME` to this example's `.agents` directory. That explicit setting matters when the example is nested inside a larger Git checkout: DSH otherwise treats the nearest `.git` ancestor as the project root and scans that root's skill directories.

## Prerequisites

- Windows PowerShell or PowerShell 7
- Node.js 22+
- DSH `@deepseek-ai/dsh@0.1.0-rc.6` installed globally, or installed locally as shown below
- An iFlytek Spark HTTP API `APIPassword`
- The published Astron MemFlywheel workflow imported from [`astron-agent-memflywheel.yml`](../../../assets_source/workflows/astron-agent-memflywheel.yml)
- An Astron application bound to that workflow, with its exported `SKILL.md`

From this directory:

```powershell
npm install --prefix .runtime/dsh @deepseek-ai/dsh@0.1.0-rc.6
npm install --prefix memflywheel-bridge
```

Place the private, operational Astron export here:

```text
.runtime/astron-private/exported-original.SKILL.md
```

The bridge reads the endpoint, flow ID, and authorization header from that file. Do not commit it.

## Configure Spark

Set the Spark HTTP API password in the current process. This is the console `APIPassword`, not the WebSocket `APPID + APIKey + APISecret` set.

```powershell
$env:IFLYTEK_SPARK_API_PASSWORD = '<your APIPassword>'
```

`spark-ultra.patch.yml` sends DSH traffic to `http://127.0.0.1:8788/v1`. The loopback proxy forwards it to:

```text
https://spark-api-open.xf-yun.com/v1/chat/completions
Authorization: Bearer <APIPassword>
model: 4.0Ultra
```

## Run the autonomous tool turn

```powershell
.\run-dsh-spark.ps1 `
  '请通过 Astron 的记忆工作流，把一条记忆保存后立即召回。请自行选择需要的能力，只依据真实运行结果回答。不要暴露凭据。' `
  -SkillDemo
```

The runner defaults DSH to the `read-only` sandbox because the model-side PowerShell call only needs to send a loopback HTTP request. Choose `workspace-write` explicitly only if you extend the Skill with a task that must modify files inside this example directory:

```powershell
.\run-dsh-spark.ps1 '<task>' -SkillDemo -PermissionMode workspace-write
```

If DSH is installed elsewhere, pass its executable explicitly:

```powershell
.\run-dsh-spark.ps1 '<task>' -SkillDemo -DshCommand 'C:\path\to\dsh.cmd'
```

The runtime chain is:

```text
goal-only prompt
  → DSH
  → Spark 4.0 Ultra
  → skill(astron-memflywheel)
  → pwsh
  → loopback Astron bridge
  → published Astron workflow API
  → MemFlywheel save + recall
  → tool result returned to Spark
  → final answer
```

## Security boundaries

- All three adapters bind to `127.0.0.1`.
- Credentials are read from an environment variable or the ignored private Astron export.
- The model-visible skill contains no endpoint credential.
- The adapters do not log authorization headers or request bodies.
- Keep the private export and `.runtime/` out of source control.
