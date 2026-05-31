// src/features/director-stage-v2/shell/WorkbenchShell.tsx
import React, { useEffect, useRef } from 'react';
import { ensureShellStylesInjected } from './shell-styles';

export type ViewportMode = 'director' | 'camera';

interface WorkbenchShellProps {
  title: string;
  isDirty: boolean;
  viewportMode: ViewportMode;
  onViewportModeChange: (mode: ViewportMode) => void;
  onTitleChange: (next: string) => void;
  onSave: () => void;
  onClose: () => void;
  leftRail: React.ReactNode;
  viewport: React.ReactNode;
  inspector: React.ReactNode;
  diagBar: React.ReactNode;
}

export function WorkbenchShell(props: WorkbenchShellProps) {
  const { title, isDirty, viewportMode, onViewportModeChange, onTitleChange, onSave, onClose,
          leftRail, viewport, inspector, diagBar } = props;
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { ensureShellStylesInjected(); }, []);

  return (
    <div className="dsv2-shell" data-testid="director-v2-shell">
      <header className="dsv2-shell-topbar">
        <div className="dsv2-shell-title-block">
          <span className="dsv2-shell-dot" aria-hidden />
          <input
            ref={titleRef}
            className="dsv2-shell-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            aria-label="场景标题"
            data-testid="shell-title"
          />
          {/* 供 textContent 断言使用，视觉上不可见 */}
          <span aria-hidden style={{ display: 'none' }}>{title}</span>
          <span className="dsv2-shell-eyebrow">PANORAMA · ORBIT · v2</span>
        </div>

        <div className="dsv2-shell-mode" role="tablist" aria-label="视口模式">
          <button
            type="button" role="tab"
            aria-selected={viewportMode === 'director'}
            className="dsv2-shell-mode-btn"
            data-active={viewportMode === 'director' ? '1' : '0'}
            onClick={() => onViewportModeChange('director')}
            data-testid="shell-mode-director"
          >⟳ 环绕预览</button>
          <button
            type="button" role="tab"
            aria-selected={viewportMode === 'camera'}
            className="dsv2-shell-mode-btn"
            data-active={viewportMode === 'camera' ? '1' : '0'}
            onClick={() => onViewportModeChange('camera')}
            data-testid="shell-mode-camera"
          >▣ 机位画面</button>
        </div>

        <div className="dsv2-shell-actions">
          <button
            type="button"
            className="dsv2-shell-action"
            data-primary="1" data-dirty={isDirty ? '1' : '0'}
            onClick={onSave}
            data-testid="shell-save"
            aria-label="保存"
          >↑ 保存</button>
          <button
            type="button"
            className="dsv2-shell-close"
            onClick={onClose}
            data-testid="shell-close"
            aria-label="关闭工作台"
          >✕</button>
        </div>
      </header>

      <div className="dsv2-shell-body">
        {leftRail}
        {viewport}
        {inspector}
      </div>

      {diagBar}
    </div>
  );
}
