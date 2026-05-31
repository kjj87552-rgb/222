// src/features/director-stage-v2/preview/preview-styles.ts
export const PREVIEW_STYLES = `
.dsv2-preview {
  display: flex; flex-direction: column;
  width: 100%; height: 100%;
  border-radius: var(--radius-lg);
  background:
    var(--stage-bg-texture),
    linear-gradient(180deg,
      color-mix(in oklab, var(--paper) 96%, transparent) 0%,
      var(--paper-2) 60%,
      var(--paper-3) 100%);
  border: 1px solid var(--stage-hairline);
  box-shadow: var(--stage-elev-2);
  color: var(--ink);
  font-family: var(--font-body);
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  position: relative;
  isolation: isolate;
}
.dsv2-preview::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: var(--stage-brand-stripe);
  z-index: 2;
  pointer-events: none;
}
.dsv2-preview::after {
  content: ""; position: absolute; inset: 0;
  background: var(--stage-sheen-subtle);
  pointer-events: none;
  z-index: 1;
}
.dsv2-preview > * { position: relative; z-index: 2; }
.dsv2-preview-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px 7px;
  border-bottom: 1px solid var(--stage-hairline-soft);
}
.dsv2-preview-brand {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--font-mono);
  font-size: 9.5px; letter-spacing: 0.16em;
  color: var(--ink-soft);
  text-transform: uppercase;
}
.dsv2-preview-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--accent) 30%, transparent),
    0 0 7px color-mix(in oklab, var(--accent) 55%, transparent),
    inset 0 1px 0 color-mix(in oklab, white 40%, transparent);
}
.dsv2-preview-status {
  font-family: var(--font-mono);
  font-size: 8.5px; letter-spacing: 0.18em;
  color: var(--ink-mute);
  text-transform: uppercase;
}
.dsv2-preview-title-block { padding: 10px 12px 6px; }
.dsv2-preview-eyebrow {
  font-family: var(--font-mono);
  font-size: 9px; letter-spacing: 0.2em;
  color: var(--ink-mute); text-transform: uppercase;
  font-weight: 500;
}
.dsv2-preview-title {
  font-size: var(--stage-hero-title-size);
  font-weight: var(--stage-hero-title-weight);
  letter-spacing: var(--stage-hero-title-letter);
  margin-top: 2px;
  color: var(--ink);
  line-height: 1.2;
  background: linear-gradient(180deg,
    var(--ink),
    color-mix(in oklab, var(--ink) 88%, var(--accent) 6%));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dsv2-preview-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px;
  padding: 0 12px; margin-top: auto;
}
.dsv2-preview-stat {
  padding: 8px 9px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--stage-hairline-soft);
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--paper) 96%, white) 0%,
    var(--paper) 100%);
  box-shadow: var(--stage-elev-1);
  position: relative;
  overflow: hidden;
}
.dsv2-preview-stat::after {
  content: ""; position: absolute; inset: 0;
  background: var(--stage-sheen-subtle);
  pointer-events: none;
}
.dsv2-preview-stat-label {
  font-size: 9px; opacity: 0.6;
  letter-spacing: 0.12em; text-transform: uppercase;
  position: relative;
}
.dsv2-preview-stat-value {
  font-size: 19px; font-weight: 700; line-height: 1;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  position: relative;
}
.dsv2-preview-stat[data-role="hero"]  .dsv2-preview-stat-value { color: var(--stage-hero); }
.dsv2-preview-stat[data-role="cam"]   .dsv2-preview-stat-value { color: var(--stage-camera); }
.dsv2-preview-diag {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 12px 10px;
  font-family: var(--font-mono);
  font-size: 9px; color: var(--stage-diag-fg);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.dsv2-preview-cursor {
  display: inline-block; width: 6px; height: 9px;
  vertical-align: -1px;
  background: currentColor; opacity: 0.55;
  margin-left: 4px;
  animation: stage-blink 1.4s infinite;
}
.dsv2-preview-enter {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  font-size: 10px; font-weight: 600;
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--accent) 95%, white),
    color-mix(in oklab, var(--accent) 75%, black));
  color: white;
  border: 1px solid color-mix(in oklab, var(--accent) 65%, black);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 28%, transparent),
    var(--stage-glow-accent),
    0 1px 3px color-mix(in oklab, var(--accent) 30%, transparent);
  cursor: pointer; user-select: none;
  letter-spacing: 0.08em;
  transition: all cubic-bezier(0.4,0,0.2,1) 140ms;
}
.dsv2-preview-enter:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 32%, transparent),
    var(--stage-glow-accent),
    0 3px 8px color-mix(in oklab, var(--accent) 40%, transparent);
}
.dsv2-preview-enter:active { transform: translateY(0); }
`;

export function ensurePreviewStylesInjected() {
  if (typeof document === 'undefined') return;
  const id = 'director-stage-v2-preview-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = PREVIEW_STYLES;
  document.head.appendChild(style);
}
