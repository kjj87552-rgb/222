// src/features/director-stage-v2/tools/toolbar-styles.ts
export const TOOLBAR_STYLES = `
.dsv2-rail {
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 6px; gap: 6px;
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--paper) 98%, white),
    var(--paper));
  border: 1px solid var(--stage-hairline);
  border-radius: 12px;
  box-shadow: var(--stage-elev-2);
  position: relative;
  isolation: isolate;
}
.dsv2-rail::before {
  content: ""; position: absolute; inset: 0;
  background: var(--stage-sheen-subtle);
  border-radius: inherit;
  pointer-events: none;
}
.dsv2-rail-section {
  font-family: var(--font-mono);
  font-size: 8px; letter-spacing: 0.22em;
  color: var(--ink-mute);
  padding-top: 4px;
  text-transform: uppercase;
  position: relative; z-index: 1;
}
.dsv2-rail-divider {
  width: 32px; height: 1px;
  background: linear-gradient(90deg, transparent,
    var(--stage-hairline) 30%,
    var(--stage-hairline) 70%,
    transparent);
  margin: 3px 0;
  position: relative; z-index: 1;
}
.dsv2-rail-tool {
  width: 46px; height: 46px;
  border-radius: 9px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px;
  background: transparent;
  color: var(--ink-soft);
  border: 1px solid transparent;
  cursor: pointer;
  position: relative; z-index: 1;
  transition: all cubic-bezier(0.4,0,0.2,1) 140ms;
}
.dsv2-rail-tool:hover {
  background: color-mix(in oklab, var(--paper-2) 80%, var(--accent) 6%);
  color: var(--ink);
  box-shadow: var(--stage-hover-ring);
}
.dsv2-rail-tool[data-active="1"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--paper) 98%, white),
    var(--paper));
  border-color: color-mix(in oklab, var(--stage-camera) 50%, transparent);
  color: var(--stage-camera);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 20%, transparent),
    0 0 0 1px color-mix(in oklab, var(--stage-camera) 30%, transparent),
    var(--stage-glow-accent);
}
.dsv2-rail-tool[data-active="1"][data-role="hero"] {
  border-color: color-mix(in oklab, var(--stage-hero) 50%, transparent);
  color: var(--stage-hero);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 20%, transparent),
    0 0 0 1px color-mix(in oklab, var(--stage-hero) 30%, transparent),
    var(--stage-glow-hero);
}
.dsv2-rail-tool[data-active="1"][data-role="frame"] {
  border-color: color-mix(in oklab, var(--stage-frame) 55%, transparent);
  color: var(--stage-frame);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 20%, transparent),
    0 0 0 1px color-mix(in oklab, var(--stage-frame) 35%, transparent),
    var(--stage-glow-frame);
}
.dsv2-rail-tool[data-role="hero"]:hover { box-shadow: var(--stage-hover-ring-hero); }
.dsv2-rail-tool[data-role="frame"]:hover { box-shadow: var(--stage-hover-ring-frame); }
.dsv2-rail-tool-icon { font-size: 19px; line-height: 1; }
.dsv2-rail-tool-key {
  font-family: var(--font-mono);
  font-size: 8.5px; opacity: 0.55; line-height: 1;
  letter-spacing: 0.05em;
}
.dsv2-rail-tool-badge {
  position: absolute; top: 4px; right: 4px;
  min-width: 15px; height: 15px; padding: 0 4px;
  border-radius: 8px;
  background: var(--stage-hero);
  color: white;
  font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 30%, transparent),
    0 0 6px -1px color-mix(in oklab, var(--stage-hero) 45%, transparent),
    0 1px 2px rgba(0,0,0,0.2);
}
.dsv2-rail-spacer { flex: 1; }
.dsv2-rail-tooltip {
  position: absolute; left: calc(100% + 8px); top: 50%; transform: translateY(-50%);
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--ink) 96%, var(--accent)),
    var(--ink));
  color: var(--paper);
  padding: 6px 10px; border-radius: 7px;
  font-size: 10.5px; white-space: nowrap;
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 12%, transparent),
    0 6px 18px color-mix(in oklab, var(--ink) 35%, transparent);
  pointer-events: none;
  z-index: 100;
  opacity: 0;
  transform-origin: left center;
  transition: opacity 80ms ease, transform 80ms ease;
  letter-spacing: 0.02em;
}
.dsv2-rail-tool:hover .dsv2-rail-tooltip { opacity: 1; transform: translateY(-50%) translateX(0); }
.dsv2-rail-tooltip-key {
  display: inline-block; margin-left: 10px;
  padding: 1px 6px;
  background: color-mix(in oklab, var(--paper) 16%, transparent);
  border: 1px solid color-mix(in oklab, var(--paper) 25%, transparent);
  border-radius: 4px;
  font-family: var(--font-mono); font-size: 9px;
  letter-spacing: 0.04em;
}
`;
let __injected = false;
export function ensureToolbarStylesInjected() {
  if (__injected || typeof document === 'undefined') return;
  if (document.getElementById('director-stage-v2-toolbar')) { __injected = true; return; }
  __injected = true;
  const s = document.createElement('style');
  s.id = 'director-stage-v2-toolbar';
  s.textContent = TOOLBAR_STYLES;
  document.head.appendChild(s);
}
