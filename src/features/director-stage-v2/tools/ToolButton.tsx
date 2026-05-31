// src/features/director-stage-v2/tools/ToolButton.tsx
import React from 'react';

export interface ToolButtonProps {
  icon: string;        // emoji or unicode glyph
  label: string;       // tooltip 主文本
  hotkey: string;      // 单字母按键
  role?: 'camera' | 'hero' | 'frame' | 'default';
  active?: boolean;
  badge?: number;      // 数量角标
  onClick: () => void;
  ariaPressed?: boolean;
}

export function ToolButton({
  icon, label, hotkey, role = 'default', active = false, badge, onClick, ariaPressed,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      className="dsv2-rail-tool"
      data-active={active ? '1' : '0'}
      data-role={role}
      onClick={onClick}
      aria-label={label}
      aria-pressed={ariaPressed ?? active}
      aria-keyshortcuts={hotkey}
      data-testid={`tool-${hotkey.toLowerCase()}`}
    >
      <span className="dsv2-rail-tool-icon" aria-hidden>{icon}</span>
      <span className="dsv2-rail-tool-key" aria-hidden>{hotkey}</span>
      {typeof badge === 'number' && badge > 0 ? (
        <span className="dsv2-rail-tool-badge" aria-hidden>{badge}</span>
      ) : null}
      <span className="dsv2-rail-tooltip" role="tooltip">
        {label}<span className="dsv2-rail-tooltip-key">{hotkey}</span>
      </span>
    </button>
  );
}
