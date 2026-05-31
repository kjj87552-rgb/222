// src/features/director-stage-v2/tokens/stage-signature.ts

/**
 * Director Stage V2 — 签名时刻 token。
 * 这些是让 V2 视觉上"区别于其他 libai_ 面板"的具体差异点。
 * LED 指示、滑块自定义化、hover ring、品牌光线。
 */

export const STAGE_SIGNATURE_CSS = `
:root {
  /* Signature glows — for selected/active emphasis */
  --stage-glow-accent: 0 0 24px -4px color-mix(in oklab, var(--accent)   60%, transparent);
  --stage-glow-hero:   0 0 20px -4px color-mix(in oklab, var(--accent-2) 65%, transparent);
  --stage-glow-frame:  0 0 18px -4px color-mix(in oklab, var(--accent-3) 65%, transparent);

  /* LED indicator (the diag bar online dot) */
  --stage-led-online-bg:   color-mix(in oklab, #5cd6a4 92%, var(--accent));
  --stage-led-online-glow:
    0 0 10px color-mix(in oklab, #5cd6a4 65%, transparent),
    0 0 2px  color-mix(in oklab, #5cd6a4 90%, transparent);

  /* Slider track + thumb (used by NumberInput/CameraInspector/etc) */
  --stage-slider-track-bg:
    linear-gradient(90deg,
      color-mix(in oklab, var(--accent) 80%, transparent),
      color-mix(in oklab, var(--accent) 30%, transparent));
  --stage-slider-rail-bg:  color-mix(in oklab, var(--ink) 14%, transparent);
  --stage-slider-thumb-bg: color-mix(in oklab, var(--paper) 80%, white);
  --stage-slider-thumb-border: color-mix(in oklab, var(--accent) 45%, var(--paper));
  --stage-slider-thumb-glow:
    0 0 12px -2px color-mix(in oklab, var(--accent) 55%, transparent),
    0 2px 6px -2px rgba(0,0,0,0.25);

  /* Hover ring (icon buttons, tool buttons) */
  --stage-hover-ring:        0 0 0 2px color-mix(in oklab, var(--accent)   25%, transparent);
  --stage-hover-ring-hero:   0 0 0 2px color-mix(in oklab, var(--accent-2) 25%, transparent);
  --stage-hover-ring-frame:  0 0 0 2px color-mix(in oklab, var(--accent-3) 30%, transparent);

  /* Brand sheen stripe — top of shell (subtle horizontal glow line) */
  --stage-brand-stripe:
    linear-gradient(90deg,
      transparent 0%,
      color-mix(in oklab, var(--accent)   55%, transparent) 30%,
      color-mix(in oklab, var(--accent-2) 50%, transparent) 50%,
      color-mix(in oklab, var(--accent)   55%, transparent) 70%,
      transparent 100%);

  /* Hero title styling vars */
  --stage-hero-title-size:    20px;
  --stage-hero-title-letter:  -0.012em;
  --stage-hero-title-weight:  700;
}

/* Theme B — dark mode signature adjustments */
.theme-b {
  /* Thumb is warmer cream on dark */
  --stage-slider-thumb-bg: color-mix(in oklab, var(--paper-3) 50%, white);

  /* LED slightly muted on dark to avoid blow-out */
  --stage-led-online-bg:   color-mix(in oklab, #5cd6a4 85%, var(--accent));
  --stage-led-online-glow:
    0 0 12px color-mix(in oklab, #5cd6a4 55%, transparent),
    0 0 3px  color-mix(in oklab, #5cd6a4 85%, transparent);

  /* Brand stripe — leaner intensity */
  --stage-brand-stripe:
    linear-gradient(90deg,
      transparent 0%,
      color-mix(in oklab, var(--accent)   45%, transparent) 30%,
      color-mix(in oklab, var(--accent-2) 40%, transparent) 50%,
      color-mix(in oklab, var(--accent)   45%, transparent) 70%,
      transparent 100%);
}
`;

let __injected = false;
export function ensureStageSignatureInjected() {
  if (__injected || typeof document === 'undefined') return;
  if (document.getElementById('director-stage-v2-signature')) { __injected = true; return; }
  __injected = true;
  const style = document.createElement('style');
  style.id = 'director-stage-v2-signature';
  style.textContent = STAGE_SIGNATURE_CSS;
  document.head.appendChild(style);
}
