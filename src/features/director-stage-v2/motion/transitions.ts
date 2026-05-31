// src/features/director-stage-v2/motion/transitions.ts

/**
 * Director Stage V2 动效令牌。
 * prefers-reduced-motion 由 index.html 全局规则降为 0.01ms，组件层无需重复处理。
 */
export const motion = {
  /** hover、按钮压下、tooltip 出现 */
  instant: 'cubic-bezier(0.4, 0, 1, 1) 80ms',
  /** 面板切换、tab 滑动、选中态变化 */
  quick: 'cubic-bezier(0.4, 0, 0.2, 1) 180ms',
  /** Workbench 进入/离开、Inspector 整面板替换 */
  flow: 'cubic-bezier(0.2, 0.8, 0.2, 1) 320ms',
  /** 机位切换镜头飞行、对象高亮脉冲 */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1) 280ms',
} as const;

export const MOTION_KEYFRAMES_CSS = `
@keyframes stage-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(1.06); }
}
@keyframes stage-blink {
  0%, 49%   { opacity: 0.55; }
  50%, 100% { opacity: 0; }
}
@keyframes stage-cross-fade-in {
  from { opacity: 0; transform: translateY(2px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

export function ensureMotionKeyframesInjected() {
  if (typeof document === 'undefined') return;
  const id = 'director-stage-v2-motion';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = MOTION_KEYFRAMES_CSS;
  document.head.appendChild(style);
}
