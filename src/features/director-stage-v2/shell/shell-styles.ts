// src/features/director-stage-v2/shell/shell-styles.ts
export const SHELL_STYLES = `
.dsv2-shell {
  position: fixed; inset: 0; z-index: 1000;
  background:
    var(--stage-bg-texture),
    var(--stage-shell-bg);
  color: var(--ink);
  display: flex; flex-direction: column;
  font-family: var(--font-body);
  isolation: isolate;
}
.dsv2-shell::before {
  /* Brand sheen stripe — 顶端一条 1px 渐变光线 */
  content: "";
  position: absolute; top: 0; left: 0; right: 0;
  height: 1px;
  background: var(--stage-brand-stripe);
  z-index: 3;
  pointer-events: none;
}
.dsv2-shell-topbar {
  display: grid; grid-template-columns: auto 1fr auto;
  align-items: center; gap: 14px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--stage-hairline);
  background: var(--stage-glass-bg-strong);
  backdrop-filter: var(--stage-glass-blur);
  -webkit-backdrop-filter: var(--stage-glass-blur);
  flex: 0 0 auto;
  z-index: 2;
  position: relative;
}
.dsv2-shell-topbar::after {
  /* 顶栏 inner sheen */
  content: "";
  position: absolute; inset: 0;
  background: var(--stage-sheen);
  pointer-events: none;
}
.dsv2-shell-title-block {
  display: flex; align-items: center; gap: 12px;
  position: relative; z-index: 1;
}
.dsv2-shell-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--accent) 30%, transparent),
    0 0 10px color-mix(in oklab, var(--accent) 50%, transparent),
    inset 0 1px 0 color-mix(in oklab, white 45%, transparent),
    inset 0 -1px 0 color-mix(in oklab, var(--accent-2) 35%, transparent);
  position: relative;
}
.dsv2-shell-dot::after {
  content: ""; position: absolute;
  top: 2px; left: 2px; width: 3px; height: 3px;
  border-radius: 50%;
  background: color-mix(in oklab, white 80%, var(--accent));
  opacity: 0.85;
}
.dsv2-shell-title {
  font-size: var(--stage-hero-title-size);
  font-weight: var(--stage-hero-title-weight);
  color: var(--ink);
  letter-spacing: var(--stage-hero-title-letter);
  background: transparent;
  border: none;
  outline: none;
  padding: 2px 6px;
  border-radius: 5px;
  min-width: 80px;
  transition: background 80ms cubic-bezier(0.4,0,1,1), box-shadow 80ms cubic-bezier(0.4,0,1,1);
  /* 新增：极淡 vertical gradient + text-shadow，让 hero 标题有材质 */
  background-image: linear-gradient(180deg,
    color-mix(in oklab, var(--ink) 100%, white),
    color-mix(in oklab, var(--ink) 88%, var(--accent) 4%));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dsv2-shell-title:hover {
  background: color-mix(in oklab, var(--paper-2) 60%, transparent);
  -webkit-text-fill-color: var(--ink);
  background-clip: initial;
  -webkit-background-clip: initial;
}
.dsv2-shell-title:focus {
  background: var(--paper);
  -webkit-text-fill-color: var(--ink);
  background-clip: initial;
  -webkit-background-clip: initial;
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent) 40%, transparent), var(--stage-elev-1);
}
.dsv2-shell-eyebrow {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.24em;
  color: var(--ink-mute);
  padding-left: 10px;
  border-left: 1px solid var(--stage-hairline);
  text-transform: uppercase;
  font-weight: 500;
  background: linear-gradient(90deg,
    var(--ink-mute),
    color-mix(in oklab, var(--ink-mute) 70%, var(--accent) 30%));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dsv2-shell-mode {
  display: flex; gap: 2px; padding: 3px;
  background: color-mix(in oklab, var(--paper-2) 80%, transparent);
  border: 1px solid var(--stage-hairline);
  border-radius: 8px;
  width: fit-content; justify-self: center;
  box-shadow: var(--stage-elev-1);
  position: relative; z-index: 1;
}
.dsv2-shell-mode-btn {
  padding: 5px 14px;
  font-size: 11px; font-weight: 500;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-soft);
  border: none;
  cursor: pointer;
  transition: all cubic-bezier(0.4,0,0.2,1) 180ms;
  letter-spacing: 0.02em;
}
.dsv2-shell-mode-btn:hover { color: var(--ink); }
.dsv2-shell-mode-btn[data-active="1"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--paper) 96%, var(--accent) 4%),
    var(--paper-2));
  color: var(--ink);
  font-weight: 600;
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 20%, transparent),
    0 1px 2px color-mix(in oklab, var(--ink) 12%, transparent),
    0 0 12px -4px color-mix(in oklab, var(--accent) 40%, transparent);
}
.dsv2-shell-actions {
  display: flex; gap: 8px; align-items: center;
  position: relative; z-index: 1;
}
.dsv2-shell-action {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  border-radius: 7px;
  border: 1px solid var(--stage-hairline);
  background: var(--stage-glass-bg);
  color: var(--ink-soft);
  cursor: pointer;
  transition: all cubic-bezier(0.4,0,0.2,1) 180ms;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dsv2-shell-action:hover {
  color: var(--ink);
  border-color: color-mix(in oklab, var(--accent) 35%, var(--line));
  background: color-mix(in oklab, var(--paper) 92%, var(--accent) 4%);
  box-shadow: var(--stage-elev-1);
}
.dsv2-shell-action[data-primary="1"] {
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--accent) 95%, white),
    color-mix(in oklab, var(--accent) 75%, black));
  color: white;
  border-color: color-mix(in oklab, var(--accent) 60%, black);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 30%, transparent),
    var(--stage-glow-accent),
    0 2px 8px -2px color-mix(in oklab, var(--accent) 35%, transparent);
  font-weight: 600;
}
.dsv2-shell-action[data-primary="1"][data-dirty="0"] {
  opacity: 0.45;
  cursor: default;
  box-shadow: inset 0 1px 0 color-mix(in oklab, white 12%, transparent);
}
.dsv2-shell-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--stage-hairline);
  background: var(--stage-glass-bg);
  color: var(--ink-mute);
  cursor: pointer;
  transition: all cubic-bezier(0.4,0,0.2,1) 180ms;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dsv2-shell-close:hover {
  color: var(--accent-2);
  border-color: color-mix(in oklab, var(--accent-2) 40%, var(--line));
  background: color-mix(in oklab, var(--paper) 92%, var(--accent-2) 4%);
  box-shadow: var(--stage-glow-hero);
}
.dsv2-shell-body {
  flex: 1 1 0;
  display: grid; grid-template-columns: 64px 1fr 320px;
  gap: 12px; padding: 12px;
  min-height: 0;
  position: relative; z-index: 1;
}
`;

export function ensureShellStylesInjected() {
  if (typeof document === 'undefined') return;
  const id = 'director-stage-v2-shell-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = SHELL_STYLES;
  document.head.appendChild(style);
}
