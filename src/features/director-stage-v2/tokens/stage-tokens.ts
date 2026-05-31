// 角色色 var 名清单（用于测试与文档）
export const STAGE_ROLE_VARS = [
  '--stage-camera',
  '--stage-camera-soft',
  '--stage-hero',
  '--stage-crowd',
  '--stage-frame',
  '--stage-path',
] as const;

// 字号档 var 名清单（设计只允许这 4 档）
export const STAGE_TEXT_VARS = [
  '--stage-text-title',
  '--stage-text-section',
  '--stage-text-body',
  '--stage-text-meta',
] as const;

/**
 * Director Stage V2 语义 token 集合。
 * 通过 <style> 注入到 :root 后，组件层只引用 var(--stage-*)，永远不写硬编码 hex 或直接引 var(--accent)。
 * 双主题适配：所有颜色基于 libai_ 已有的 var(--paper/--accent/--ink) 衍生。
 */
export const STAGE_TOKENS_CSS = `
:root {
  /* shell */
  --stage-shell-bg:        color-mix(in oklab, var(--paper) 96%, var(--accent) 4%);
  --stage-shell-border:    color-mix(in oklab, var(--line) 80%, var(--accent) 20%);
  --stage-shell-shadow:    var(--shadow-float);

  /* 角色色 */
  --stage-camera:          var(--accent);
  --stage-camera-soft:     color-mix(in oklab, var(--accent) 16%, var(--paper-2));
  --stage-hero:            var(--accent-2);
  --stage-hero-soft:       color-mix(in oklab, var(--accent-2) 14%, var(--paper-2));
  --stage-crowd:           var(--ink-soft);
  --stage-frame:           var(--accent-3);
  --stage-path:            color-mix(in oklab, var(--accent-3) 75%, var(--accent-2));

  /* 状态 */
  --stage-online:          color-mix(in oklab, var(--accent) 70%, var(--accent-2));
  --stage-warning:         var(--warn);
  --stage-danger:          var(--accent-2);

  /* 诊断面板（CRT 遗产） */
  --stage-diag-bg:         color-mix(in oklab, var(--ink) 8%, var(--paper));
  --stage-diag-fg:         var(--ink-mute);
  --stage-diag-strong:     var(--ink);

  /* 字号档（只 4 档） */
  --stage-text-title:      22px;
  --stage-text-section:    14px;
  --stage-text-body:       12px;
  --stage-text-meta:       10px;

  /* 字间距 */
  --stage-letter-meta:     0.12em;
  --stage-letter-eyebrow:  0.18em;
}
`;

/**
 * 注入 token CSS 到 document.head。
 * 在 DirectorStageWorkbench / DirectorStagePreview 顶层 mount 时调用一次即可。
 */
export function ensureStageTokensInjected() {
  if (typeof document === 'undefined') return;
  const id = 'director-stage-v2-tokens';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = STAGE_TOKENS_CSS;
  document.head.appendChild(style);
}
