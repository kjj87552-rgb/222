// src/features/director-stage-v2/tokens/stage-materials.ts

/**
 * Director Stage V2 — premium material 令牌层。
 * 在 stage-tokens.ts（角色色 + 字号）之上叠加：玻璃、阴影、高光、subtle 背景纹理。
 * 双主题适配：Theme A（浅蓝玫瑰）+ Theme B（暗夜暖金）各自演绎。
 */

export const STAGE_MATERIALS_CSS = `
:root {
  /* Glass material — for top bars, HUD chips, popover */
  --stage-glass-bg:        color-mix(in oklab, var(--paper) 88%, transparent);
  --stage-glass-bg-strong: color-mix(in oklab, var(--paper) 94%, transparent);
  --stage-glass-blur:      blur(20px) saturate(140%);
  --stage-glass-border:    color-mix(in oklab, var(--line) 70%, transparent);

  /* Inner highlight (top edge "sheen") — gloss effect on cards/panels */
  --stage-sheen:           linear-gradient(180deg, color-mix(in oklab, white 18%, transparent) 0%, transparent 30%);
  --stage-sheen-subtle:    linear-gradient(180deg, color-mix(in oklab, white 8%, transparent) 0%, transparent 25%);

  /* Depth shadow stack */
  --stage-elev-1:
    inset 0 1px 0 color-mix(in oklab, white 10%, transparent),
    0 6px 18px -10px color-mix(in oklab, var(--ink) 28%, transparent);
  --stage-elev-2:
    inset 0 1px 0 color-mix(in oklab, white 12%, transparent),
    0 14px 36px -18px color-mix(in oklab, var(--ink) 42%, transparent),
    0 2px 6px -2px   color-mix(in oklab, var(--ink) 22%, transparent);
  --stage-elev-3:
    inset 0 1px 0 color-mix(in oklab, white 14%, transparent),
    0 24px 64px -24px color-mix(in oklab, var(--ink) 52%, transparent),
    0 4px 12px -2px   color-mix(in oklab, var(--ink) 28%, transparent);

  /* Background texture — subtle dual radial mesh, theme-aware via --accent */
  --stage-bg-texture:
    radial-gradient(ellipse 800px 600px at 15% 12%, color-mix(in oklab, var(--accent) 5%, transparent) 0%, transparent 60%),
    radial-gradient(ellipse 700px 500px at 88% 88%, color-mix(in oklab, var(--accent-2) 4%, transparent) 0%, transparent 55%);

  /* Hairline borders — for dividers, section separators */
  --stage-hairline:        color-mix(in oklab, var(--ink) 12%, transparent);
  --stage-hairline-soft:   color-mix(in oklab, var(--ink) 6%, transparent);
}

/* Theme B overrides — dark mode needs gentler sheen + deeper shadows */
.theme-b {
  --stage-sheen:           linear-gradient(180deg, color-mix(in oklab, white 6%, transparent) 0%, transparent 30%);
  --stage-sheen-subtle:    linear-gradient(180deg, color-mix(in oklab, white 3%, transparent) 0%, transparent 25%);

  --stage-elev-1:
    inset 0 1px 0 color-mix(in oklab, white 4%, transparent),
    0 6px 18px -10px rgba(0,0,0,0.55);
  --stage-elev-2:
    inset 0 1px 0 color-mix(in oklab, white 5%, transparent),
    0 14px 36px -18px rgba(0,0,0,0.65),
    0 2px 6px -2px rgba(0,0,0,0.45);
  --stage-elev-3:
    inset 0 1px 0 color-mix(in oklab, white 6%, transparent),
    0 24px 64px -24px rgba(0,0,0,0.75),
    0 4px 12px -2px rgba(0,0,0,0.55);

  --stage-hairline:        color-mix(in oklab, white 10%, transparent);
  --stage-hairline-soft:   color-mix(in oklab, white 5%, transparent);
}
`;

let __injected = false;
export function ensureStageMaterialsInjected() {
  if (__injected || typeof document === 'undefined') return;
  if (document.getElementById('director-stage-v2-materials')) { __injected = true; return; }
  __injected = true;
  const style = document.createElement('style');
  style.id = 'director-stage-v2-materials';
  style.textContent = STAGE_MATERIALS_CSS;
  document.head.appendChild(style);
}
