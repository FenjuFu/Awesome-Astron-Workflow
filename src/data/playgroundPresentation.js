// Shared by generation, preview and download so the same work has the same spacing.
export const presentationGuidance = 'Use comfortable, responsive spacing: 24–32px card padding, 20–24px between sections, 12–16px between controls, 8px between a label and its field, body line-height 1.7, and controls at least 48px high. Do not force the whole app into a fixed height. Let long content scroll vertically. Keep game grids compact and square.';

export const comfortableCss = `
html { min-height: 100%; height: auto !important; }
body { box-sizing: border-box !important; width: auto !important; max-width: none !important; height: auto !important; min-height: 100vh; min-height: 100dvh; margin: 0 !important; padding: clamp(20px, 4vw, 40px) !important; line-height: 1.7 !important; overflow-y: auto !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; align-items: center !important; }
body > main, main#app, .timer-card, .studio-panel, .quiz-container { box-sizing: border-box !important; flex-shrink: 0; height: auto !important; max-height: none !important; display: flex !important; flex-direction: column !important; gap: 24px !important; padding: clamp(24px, 3vw, 36px) !important; margin-inline: auto !important; }
main#app { width: 100% !important; max-width: 760px !important; overflow: visible !important; }
body > main > *, main#app > *, .timer-card > *, .studio-panel > *, .quiz-container > * { flex-shrink: 0; margin-block: 0 !important; min-width: 0; }
h1, h2, h3 { line-height: 1.4 !important; overflow-wrap: anywhere; }
p { line-height: 1.75 !important; overflow-wrap: anywhere; }
.card:not(main), .question-panel { box-sizing: border-box !important; padding: 24px !important; display: flex; flex-direction: column; gap: 16px; }
.card > *, .question-panel > * { margin-block: 0; }
.choices, #options, .controls, .actions, .buttons, .chips { gap: 12px !important; }
.controls, .actions, .buttons { flex-wrap: wrap !important; }
.control-group { gap: 10px !important; }
.choices, #options { display: flex !important; flex-direction: column !important; margin-block: 4px !important; }
button:not(#board button):not(.tile) { box-sizing: border-box !important; height: auto !important; min-height: 48px !important; padding: 12px 18px !important; line-height: 1.5 !important; white-space: normal; }
input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]), select, textarea { box-sizing: border-box !important; min-height: 48px !important; padding: 12px 14px !important; line-height: 1.6 !important; max-width: 100%; }
textarea { min-height: 112px !important; }
select, select option { color: #2a1747 !important; background: #fff9ee !important; }
label { line-height: 1.6 !important; gap: 10px !important; }
label:not(:has(input[type=checkbox], input[type=radio])) { display: flex !important; flex-direction: column !important; align-items: stretch !important; }
main > label:has(input[type=checkbox]), main > label:has(input[type=radio]) { min-height: 52px !important; padding: 12px 14px !important; }
#board { flex-shrink: 0; align-self: center; gap: 6px !important; }
#board button, #board .tile { min-height: 0 !important; padding: 0 !important; margin: 0 !important; }
[hidden] { display: none !important; }
@media (max-width: 480px) {
  body { padding: 16px !important; }
  body > main, main#app, .timer-card, .studio-panel, .quiz-container { padding: 20px !important; gap: 20px !important; max-width: 100% !important; }
  .card:not(main), .question-panel { padding: 18px !important; gap: 14px; }
}
`;

export function withComfortableSpacing(html) {
  if (!html) return html;
  const cleaned = html.replace(/<style\b[^>]*\bid=["']spark-comfort-style["'][^>]*>[\s\S]*?<\/style\s*>[ \t]*\r?\n?/gi, '');
  const style = '<style id="spark-comfort-style">' + comfortableCss + '</style>';
  return /<\/head\s*>/i.test(cleaned)
    ? cleaned.replace(/<\/head\s*>/i, style + '\n</head>')
    : cleaned.replace(/<body\b[^>]*>/i, match => match + style);
}
