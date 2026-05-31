// src/features/director-stage-v2/inspector/inspector-styles.ts
export const INSPECTOR_STYLES = `
.dsv2-insp {
  display: flex; flex-direction: column;
  background: var(--paper);
  border: 1px solid var(--stage-hairline);
  border-radius: 12px;
  box-shadow: var(--stage-elev-2);
  overflow: hidden;
  font-family: var(--font-body);
  color: var(--ink);
  position: relative;
  isolation: isolate;
}
.dsv2-insp::before {
  content: "";
  position: absolute; inset: 0;
  background: var(--stage-sheen-subtle);
  pointer-events: none; z-index: 0;
}
.dsv2-insp-tabs {
  display: flex; padding: 6px; gap: 4px;
  border-bottom: 1px solid var(--stage-hairline);
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--paper) 96%, var(--accent) 4%),
    var(--paper-2));
  flex: 0 0 auto;
  position: relative; z-index: 1;
}
.dsv2-insp-tab {
  flex: 1; padding: 7px 10px;
  font-size: 11px; text-align: center;
  border-radius: 7px;
  background: transparent;
  color: var(--ink-soft);
  border: none; cursor: pointer;
  letter-spacing: 0.02em;
  transition: all cubic-bezier(0.4,0,0.2,1) 180ms;
}
.dsv2-insp-tab:hover { color: var(--ink); background: color-mix(in oklab, var(--paper-2) 60%, transparent); }
.dsv2-insp-tab[data-active="1"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--paper) 98%, white),
    var(--paper));
  color: var(--ink); font-weight: 600;
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 20%, transparent),
    0 1px 3px color-mix(in oklab, var(--ink) 14%, transparent),
    0 0 12px -6px color-mix(in oklab, var(--accent) 50%, transparent);
}
.dsv2-insp-meta {
  padding: 12px 16px 10px;
  background: linear-gradient(180deg, var(--paper),
    color-mix(in oklab, var(--paper) 96%, var(--accent) 4%));
  border-bottom: 1px solid var(--stage-hairline);
  flex: 0 0 auto;
  position: relative; z-index: 1;
}
.dsv2-insp-meta::after {
  content: ""; position: absolute; inset: 0;
  background: var(--stage-sheen-subtle);
  pointer-events: none;
}
.dsv2-insp-meta[data-tone="hero"] {
  background: linear-gradient(180deg, var(--paper),
    color-mix(in oklab, var(--paper) 92%, var(--stage-hero) 8%));
  border-bottom-color: color-mix(in oklab, var(--stage-hero) 30%, var(--stage-hairline));
  box-shadow: inset 0 -3px 12px -8px color-mix(in oklab, var(--stage-hero) 35%, transparent);
}
.dsv2-insp-meta[data-tone="camera"] {
  background: linear-gradient(180deg, var(--paper),
    color-mix(in oklab, var(--paper) 92%, var(--stage-camera) 8%));
  border-bottom-color: color-mix(in oklab, var(--stage-camera) 30%, var(--stage-hairline));
  box-shadow: inset 0 -3px 12px -8px color-mix(in oklab, var(--stage-camera) 35%, transparent);
}
.dsv2-insp-eyebrow {
  font-family: var(--font-mono);
  font-size: 9px; letter-spacing: 0.2em;
  color: var(--ink-mute);
  display: flex; justify-content: space-between; align-items: center;
  text-transform: uppercase;
  position: relative; z-index: 1;
}
.dsv2-insp-eyebrow-key {
  padding: 2px 6px;
  background: color-mix(in oklab, var(--paper-2) 70%, transparent);
  border: 1px solid var(--stage-hairline-soft);
  border-radius: 4px;
  font-size: 9px;
  cursor: pointer;
  transition: all 80ms ease;
}
.dsv2-insp-eyebrow-key:hover { color: var(--ink); border-color: var(--stage-hairline); background: var(--paper-2); }
.dsv2-insp-name-row {
  display: flex; align-items: center; gap: 10px; margin-top: 6px;
  position: relative; z-index: 1;
}
.dsv2-insp-icon {
  width: 22px; height: 22px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: white; font-weight: 700;
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 30%, transparent),
    0 2px 4px -1px color-mix(in oklab, var(--ink) 30%, transparent);
}
.dsv2-insp-name {
  font-size: var(--stage-hero-title-size);
  font-weight: 700;
  flex: 1;
  background: transparent;
  border: none;
  padding: 2px 6px;
  border-radius: 5px;
  color: var(--ink);
  outline: none;
  letter-spacing: var(--stage-hero-title-letter);
}
.dsv2-insp-name:hover { background: color-mix(in oklab, var(--paper-2) 60%, transparent); }
.dsv2-insp-name:focus {
  background: var(--paper-2);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent) 35%, transparent);
}
.dsv2-insp-body {
  flex: 1 1 0; overflow: auto;
  padding: 14px 14px 18px;
  position: relative; z-index: 1;
}
.dsv2-insp-section {
  margin-bottom: 12px;
  border: 1px solid var(--stage-hairline-soft);
  border-radius: 9px;
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--paper) 98%, white),
    var(--paper));
  box-shadow: var(--stage-elev-1);
  position: relative;
  overflow: hidden;
}
.dsv2-insp-section::before {
  content: ""; position: absolute; inset: 0;
  background: var(--stage-sheen-subtle);
  pointer-events: none;
}
.dsv2-insp-sec-head {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid var(--stage-hairline-soft);
  font-size: 11px; font-weight: 600;
  color: var(--ink-soft);
  cursor: pointer; user-select: none;
  background: transparent;
  font-family: inherit;
  text-align: left;
  position: relative; z-index: 1;
  transition: color 80ms ease, background 80ms ease;
  letter-spacing: 0.02em;
}
.dsv2-insp-sec-head:hover { color: var(--ink); background: color-mix(in oklab, var(--paper-2) 50%, transparent); }
.dsv2-insp-sec-body {
  padding: 10px 12px 12px;
  position: relative; z-index: 1;
}
.dsv2-insp-field {
  display: grid; grid-template-columns: 60px 1fr; gap: 10px; align-items: center;
  padding: 5px 0; font-size: 11px;
}
.dsv2-insp-field-label {
  color: var(--ink-mute);
  font-size: 10px;
  letter-spacing: 0.04em;
}
.dsv2-insp-input {
  padding: 4px 8px;
  background: var(--paper-2);
  border: 1px solid var(--stage-hairline-soft);
  border-radius: 6px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  outline: none;
  transition: border-color 80ms ease, box-shadow 80ms ease;
}
.dsv2-insp-input:hover { border-color: var(--stage-hairline); }
.dsv2-insp-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent) 18%, transparent);
}
.dsv2-insp-chips {
  display: flex; flex-wrap: wrap; gap: 5px;
}
.dsv2-insp-chip {
  padding: 4px 10px;
  font-size: 10px;
  border-radius: 6px;
  background: var(--paper-2);
  color: var(--ink-soft);
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition: all cubic-bezier(0.4,0,0.2,1) 120ms;
  letter-spacing: 0.01em;
}
.dsv2-insp-chip:hover {
  background: color-mix(in oklab, var(--paper-2) 70%, var(--accent) 6%);
  color: var(--ink);
  border-color: var(--stage-hairline-soft);
}
.dsv2-insp-chip[data-active="1"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--accent) 100%, white),
    color-mix(in oklab, var(--accent) 80%, black));
  color: white;
  border-color: color-mix(in oklab, var(--accent) 60%, black);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 25%, transparent),
    var(--stage-glow-accent);
  font-weight: 600;
}
.dsv2-insp-chip[data-active="1"][data-tone="hero"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--stage-hero) 92%, white),
    color-mix(in oklab, var(--stage-hero) 75%, black));
  border-color: color-mix(in oklab, var(--stage-hero) 60%, black);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 22%, transparent),
    var(--stage-glow-hero);
}
.dsv2-insp-chip[data-active="1"][data-tone="frame"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--stage-frame) 96%, white),
    color-mix(in oklab, var(--stage-frame) 78%, black));
  color: var(--ink);
  border-color: color-mix(in oklab, var(--stage-frame) 60%, black);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 30%, transparent),
    var(--stage-glow-frame);
}
.dsv2-insp-empty {
  text-align: center; padding: 44px 24px 28px;
  color: var(--ink-mute);
  position: relative; z-index: 1;
}
.dsv2-insp-empty-icon { font-size: 40px; opacity: 0.45; }
.dsv2-insp-empty-title { font-size: 13px; font-weight: 600; color: var(--ink-soft); margin-top: 12px; letter-spacing: 0.01em; }
.dsv2-insp-empty-hint { font-size: 11px; line-height: 1.7; margin-top: 6px; }
.dsv2-insp-overview-stat {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px;
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--paper) 98%, white),
    var(--paper));
  border: 1px solid var(--stage-hairline-soft);
  border-radius: 8px;
  margin-bottom: 6px;
  box-shadow: var(--stage-elev-1);
  position: relative; z-index: 1;
}
.dsv2-insp-overview-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; color: var(--ink-soft);
}
.dsv2-insp-overview-value {
  font-size: 16px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

/* ===== 自定义 range slider — 给 JointSlider 和后续组件统一用 ===== */
.dsv2-stage-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%; height: 6px;
  border-radius: 999px;
  background: var(--stage-slider-rail-bg);
  outline: none;
  cursor: pointer;
  transition: background 80ms ease;
}
.dsv2-stage-slider::-webkit-slider-runnable-track {
  height: 6px; border-radius: 999px;
  background: transparent;
}
.dsv2-stage-slider::-moz-range-track {
  height: 6px; border-radius: 999px;
  background: transparent;
}
.dsv2-stage-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--stage-slider-thumb-bg);
  border: 1.5px solid var(--stage-slider-thumb-border);
  box-shadow: var(--stage-slider-thumb-glow);
  margin-top: -4px;
  cursor: grab;
  transition: transform 80ms ease, box-shadow 80ms ease;
}
.dsv2-stage-slider::-moz-range-thumb {
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--stage-slider-thumb-bg);
  border: 1.5px solid var(--stage-slider-thumb-border);
  box-shadow: var(--stage-slider-thumb-glow);
  cursor: grab;
  transition: transform 80ms ease, box-shadow 80ms ease;
}
.dsv2-stage-slider:hover::-webkit-slider-thumb { transform: scale(1.15); }
.dsv2-stage-slider:hover::-moz-range-thumb { transform: scale(1.15); }
.dsv2-stage-slider:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.05); }
.dsv2-stage-slider:active::-moz-range-thumb { cursor: grabbing; transform: scale(1.05); }
`;
let __injected = false;
export function ensureInspectorStylesInjected() {
  if (__injected || typeof document === 'undefined') return;
  if (document.getElementById('director-stage-v2-inspector')) { __injected = true; return; }
  __injected = true;
  const s = document.createElement('style');
  s.id = 'director-stage-v2-inspector';
  s.textContent = INSPECTOR_STYLES;
  document.head.appendChild(s);
}
