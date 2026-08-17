# Astron Landscape Folder Dual-Skill Workflow

This package contains the exported Astron DSL v1 workflow used in the real-run demo **风景文件夹双Skill编排**.

The workflow accepts a `BATCH_MANIFEST`, calls two attached skills through an Agent Decision node, and merges their routing, protected details, generation prompts, QA gates, and render status into one result.

## Verified run

- Workflow: `风景文件夹双Skill编排`
- Model: Spark Ultra-32K
- Strategy: ReACT with tool support
- Result: Start, Agent Decision, and End all succeeded
- Runtime: 87.184 seconds
- Usage: 4,605 tokens
- Batch: nine landscape photos

Evidence:

- [Agent node with both skills attached](https://github.com/FenjuFu/astron-images/blob/main/astron-photo-skills-2026-08-18/01-agent-mounted-skills.png)
- [Workflow canvas](https://github.com/FenjuFu/astron-images/blob/main/astron-photo-skills-2026-08-18/02-workflow-canvas.png)
- [Successful debug run](https://github.com/FenjuFu/astron-images/blob/main/astron-photo-skills-2026-08-18/03-workflow-run-success.png)

## Files

- `astron-landscape-dual-photo-skills.zh-CN.yml`: exported Astron workflow.
- `skills/paper-signal-art-director/SKILL.md`: Astron-compatible Paper Signal routing and QA instructions.
- `skills/gc-minimal-zine-poster-v0-3/SKILL.md`: Astron-compatible minimal-zine routing and QA instructions.

## Import

1. In Astron Resource Management, create the two skill folders and add the supplied `SKILL.md` files.
2. Import `astron-landscape-dual-photo-skills.zh-CN.yml`.
3. Open the Agent Decision node and re-bind both skills if the imported environment uses different local skill IDs.
4. Confirm that the node exposes one `read_skill_*` tool for each attached skill.
5. Run the workflow with a `BATCH_MANIFEST` containing file names and observable photo details.

Skill IDs in an Astron export are environment-local. Re-binding after import is therefore expected on another installation.

The workflow returns prompt and QA contracts. It does not claim bitmap generation unless an actual image tool returns a bitmap.

## Source projects

- [Paper Signal](https://github.com/jiahuiqu17/paper-signal)
- [GC Minimal Zine Poster](https://github.com/LiamGvchi/gc-minimal-zine-poster)
- [Astron Agent](https://github.com/iflytek/astron-agent)
