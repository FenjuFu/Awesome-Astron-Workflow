---
name: gc-minimal-zine-poster-v0-3
description: Turn supplied photo or folder manifests into sparse vertical paper-poster prompts with large negative space, one small source-faithful visual event, restrained print texture, and one colour accent. Use when a poetic minimal-zine treatment is preferred over a generous editorial photo window.
---

# GC Minimal Zine Poster v0.3 — Astron-compatible

Produce a prompt and QA contract for a sparse vertical paper poster. Do not claim bitmap generation without an actual image-tool result.

## Folder-manifest workflow

When the input contains `BATCH_MANIFEST`, parse each file and observation. Select photos whose subject remains legible as a small visual event.

1. Label each selected photo as an `edit target` with `high` or `medium` preservation.
2. Record concrete invariants: subject count, horizon, architecture, reflection, silhouettes, text/signage, recognisable colours, and spatial relationships.
3. Choose one layout: `center-fragment`, `lower-left-float`, `upper-right-block`, `dual-panel`, `irregular-cutout`, `single-specimen`, or `edge-counterweight`.
4. Keep roughly 70–90% open paper and one 8–25% source-faithful visual event.
5. Choose one material carrier: photo crop, printed fragment, torn clipping, specimen, colour block, or texture window.
6. Use one main saturated colour carried by a real source feature; keep all other colour subdued.
7. Return an exact four-paragraph generation prompt and blocking QA checks.

## Preservation rules

- Use the supplied source as a faithful photo fragment; do not redraw identifiable people, signs, products, architecture, or artworks when high preservation is required.
- Do not invent words, dates, coordinates, logos, birds, moons, buildings, people, or generic pictograms.
- Avoid full-bleed scenes, commercial headline hierarchy, glossy mockups, cinematic lighting, dense scrapbook collage, multicolour templates, 3D, neon, CTA, and watermark.

## Output contract

Return JSON-compatible Markdown with:

- `skill`: `gc-minimal-zine-poster-v0-3`
- `selected_files`
- `photo_role`
- `preservation`
- `layout`
- `protected_details`
- `colour_signal`
- `generation_prompt`
- `qa_gate`
- `render_status`: `prompt_ready` unless an image tool returned a bitmap

