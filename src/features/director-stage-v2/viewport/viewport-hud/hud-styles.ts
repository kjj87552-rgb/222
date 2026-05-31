// src/features/director-stage-v2/viewport/viewport-hud/hud-styles.ts
export const HUD_STYLES = `
.dsv2-hud-overlay { position: absolute; inset: 0; pointer-events: none; }
.dsv2-hud-top {
  position: absolute; top: 12px; left: 14px; right: 14px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
}
.dsv2-hud-bottom {
  position: absolute; bottom: 12px; left: 14px; right: 14px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
}
.dsv2-hud-group { display: flex; gap: 6px; pointer-events: auto; }
.dsv2-hud-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 11px;
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.14em;
  background: var(--stage-glass-bg);
  backdrop-filter: var(--stage-glass-blur);
  -webkit-backdrop-filter: var(--stage-glass-blur);
  border: 1px solid var(--stage-glass-border);
  border-radius: 7px;
  color: var(--ink);
  cursor: pointer;
  user-select: none;
  transition: all cubic-bezier(0.4,0,0.2,1) 140ms;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 14%, transparent),
    0 4px 12px -4px color-mix(in oklab, var(--ink) 25%, transparent);
}
.dsv2-hud-chip::before {
  content: ""; position: absolute; inset: 0;
  background: var(--stage-sheen-subtle);
  pointer-events: none;
  border-radius: inherit;
}
.dsv2-hud-chip:hover {
  background: var(--stage-glass-bg-strong);
  border-color: color-mix(in oklab, var(--accent) 30%, var(--stage-glass-border));
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 18%, transparent),
    0 6px 18px -4px color-mix(in oklab, var(--ink) 35%, transparent),
    var(--stage-hover-ring);
  transform: translateY(-1px);
}
.dsv2-hud-chip[data-active="0"] { opacity: 0.55; }
.dsv2-hud-chip[data-active="0"]:hover { opacity: 0.85; }
.dsv2-hud-chip[data-tone="camera"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--stage-camera) 22%, var(--stage-glass-bg-strong)),
    color-mix(in oklab, var(--stage-camera) 14%, var(--stage-glass-bg)));
  border-color: color-mix(in oklab, var(--stage-camera) 50%, transparent);
  color: var(--stage-camera);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 22%, transparent),
    0 4px 14px -4px color-mix(in oklab, var(--stage-camera) 30%, transparent),
    var(--stage-glow-accent);
}
.dsv2-hud-chip[data-tone="frame"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--stage-frame) 24%, var(--stage-glass-bg-strong)),
    color-mix(in oklab, var(--stage-frame) 14%, var(--stage-glass-bg)));
  border-color: color-mix(in oklab, var(--stage-frame) 50%, transparent);
  color: var(--stage-frame);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 25%, transparent),
    0 4px 14px -4px color-mix(in oklab, var(--stage-frame) 35%, transparent),
    var(--stage-glow-frame);
}
.dsv2-hud-chip[data-tone="hero"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--stage-hero) 22%, var(--stage-glass-bg-strong)),
    color-mix(in oklab, var(--stage-hero) 14%, var(--stage-glass-bg)));
  border-color: color-mix(in oklab, var(--stage-hero) 50%, transparent);
  color: var(--stage-hero);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 22%, transparent),
    0 4px 14px -4px color-mix(in oklab, var(--stage-hero) 32%, transparent),
    var(--stage-glow-hero);
}
`;
let __injected = false;
export function ensureHudStylesInjected() {
  if (__injected || typeof document === 'undefined') return;
  if (document.getElementById('director-stage-v2-hud')) { __injected = true; return; }
  __injected = true;
  const s = document.createElement('style');
  s.id = 'director-stage-v2-hud';
  s.textContent = HUD_STYLES;
  document.head.appendChild(s);
}
