# Try this prompt library

The Playground sidebar offers six complete prompts with use, copy, full-text view, direct selection and next-example controls. Browsing or copying an idea does not replace the user's input. Using one starts a fresh-generation prompt without discarding the existing result. While generating, using another prompt is disabled. Clipboard failure expands selectable text for manual copying.

The prompt text stays in its tested English form; titles, descriptions and controls follow the site's language. The UI says each generation can differ. Candy match, focus timer and mini quiz include explicit working JavaScript starter logic for the model to preserve while generating the page and styling. These are complete reusable recipes, not claims that the model independently invented the supplied algorithms.

## Recorded output verification — 2026-11-03

All final prompt texts were sent to the same `runPlayground` generator used by production, with `spark-x2.6-4b`, thinking disabled and the same system instruction. The local system proxy was used for connectivity. No generated code was manually repaired before testing. The cloud model revision is not disclosed.

| Prompt | Browser checks on its generated output |
| --- | --- |
| Candy match | 20 successful clears with exact point increments and remaining moves; zero-move state; disabled tiles; restart restores 0 points / 20 moves |
| Profile card | Fictional name present; theme changes and toggles back |
| Focus timer | Set 4 seconds; start, pause at 3, remain paused, resume to 0 / Done, reset to 4 |
| Gradient studio | Color and angle update CSS value; reset restores defaults |
| Mini quiz | Next disabled before answering; answers lock; correct/wrong feedback; 2/3 final score; restart |
| Daily checklist | Five checkboxes; completion 5/5, undo to 4/5, reset to 0/5 |

Each output was checked at 350px iframe width for horizontal overflow and screenshotted. Some generated layouts need a little vertical scrolling; this is permitted by the preview. No runtime script errors were observed in these checks. See `verification.json` for exact prompt/output hashes and recorded dimensions, and `examples/` for the unedited generated HTML.

Initial natural-language drafts for the game, timer and quiz had functional errors; their prompts were strengthened with explicit starter logic and regenerated. An initial profile-card request returned incomplete HTML. These failed drafts are not the prompts shipped here. The final checks cover one generated output per final prompt, not a statistical reliability claim or a guarantee of identical future output.
