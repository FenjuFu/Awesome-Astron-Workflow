# SPARK website artwork and UI

Prepared 2026-11-12. Reference: the user-supplied 小火苗角色设计.png character sheet. Generated with the built-in image_gen tool, with transparent_background=true. Original generated PNGs are retained without cropping or character deformation; no experimental output is represented by these illustrations.

- `public/illustrations/spark-creative-duo.png`: 1184 × 1328 RGBA. Hero illustration; eager-loaded with explicit dimensions.
- `public/illustrations/spark-flame-guide.png`: 1536 × 1024 RGBA. Decorative workflow-section illustration; lazy-loaded with an empty alt attribute.

## Hero generation prompt

Use case: illustration-story. Create a polished transparent-background website hero illustration based faithfully on the supplied character reference sheet. ONE cohesive composition, no sheet or panels: the same cheerful purple short-haired SPARK girl with violet eyes, flame-shaped hair tuft, star hair clip, black and white technical jacket with violet straps and star details, sitting casually using a dark laptop; beside her floats her cute violet flame companion with a white star belly, looking at the laptop. Full complete characters and laptop, no cropped extremities, breathing room. Anime illustration matching reference, exquisite clean line art, lavender/violet highlights, restrained small star sparkles. Composition slightly taller than wide, suitable for the right side of an elegant pale lavender developer website. Background genuinely transparent, no floor rectangle, no text or labels or watermark. Preserve exact recognizable character identity and clothes. Friendly creative collaboration, not a generic robot.

## Companion generation prompt

Use case: illustration-story. Website spot illustration on a genuinely transparent background. Use ONLY the small purple flame companion in the supplied character sheet, no human. Match its round lavender flame body, violet flame tips, tiny round feet, sparkling dark eyes and prominent white five-pointed star belly exactly. One complete happy flame mascot floating playfully, accompanied by two small four-point lavender sparkles, clean anime illustration. Soft lavender highlights, crisp edges, minimal outer glow, generous transparent margin. No text, no border, no scene, no panels, no other objects. Suitable as a small friendly guide beside a website section title.

## UI scope

Shared navigation shows all eight existing sections at 1024 CSS pixels and above, including the screenshot's approximately 1225 CSS-pixel desktop viewport. Below that, the same links remain in a labeled collapsible menu. Submenu links remain separate from disclosure buttons; Enter, Tab and Escape are supported. Header height stays 64px to preserve route layouts. No Galaxy scoring, underlying content datasets or API behavior changes.

The homepage pairs soft lavender surfaces and violet accents with ink-purple Galaxy/footer sections. Workflows keep their existing category colors. Character illustration never contains the actual interface text. Language-specific copy stays in HTML. Reduced-motion preferences disable homepage decorative animation.
