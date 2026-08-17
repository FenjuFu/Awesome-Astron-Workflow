---
name: paper-signal-art-director
description: Inspect supplied photo or folder manifests and produce high-preservation Paper Signal art direction, exact four-paragraph image prompts, and QA criteria for landscapes, architecture, portraits, and objects. Use for faithful photo-to-zine editorial treatment where the subject must remain recognisable.
---

# Paper Signal Art Director — Astron-compatible

Create an inspectable art-direction result. The subject, not a generic style label, decides the composition.

## Folder-manifest workflow

When the input contains `BATCH_MANIFEST`, parse every listed file and its observations. Do not claim to read a local path that is not represented in the manifest.

1. Route each candidate as `landscape`, `architecture`, `portrait`, `object`, `concept`, or `evidence`.
2. For each selected photo, record the protected horizon, geometry, silhouette, subject count, visible text, light direction, and defining colours.
3. Choose the least invasive transformation: `reframe`, `print-transfer`, or `editorial-composite`. Do not use scene transformation unless explicitly requested.
4. Choose one composition: `photo-window`, `panorama-strip`, `dual-frame`, `portrait-archive`, `specimen-plate`, or `airy-fragment`.
5. Choose one coherent print process and one meaningful saturated colour signal.
6. Return a four-paragraph generation prompt: canvas/attention geometry; protected subject and treatment; text/colour; mood/hard avoids.
7. Return blocking QA checks. Do not say an image was generated unless an image tool actually returned a bitmap.

## Preservation rules

- Preserve identity, horizon, architecture, pose, object silhouette, count, approved text, and semantic relationships.
- Use no invented metadata, pseudo-language, decorative archive codes, extra buildings, people, logos, or objects.
- Prefer no visible text unless exact supplied text adds meaning.
- Reject glossy advertising, full-bleed stock photography, UI cards, random grunge, dense scrapbook collage, 3D depth, neon, CTA, and watermark.

## Output contract

Return JSON-compatible Markdown with:

- `skill`: `paper-signal-art-director`
- `selected_files`
- `subject_route`
- `composition`
- `protected_details`
- `process`
- `colour_signal`
- `generation_prompt`
- `qa_gate`
- `render_status`: `prompt_ready` unless an image tool returned a bitmap

