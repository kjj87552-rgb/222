// src/features/director-stage-v2/viewport/viewport-hud/ViewportTopHud.tsx
import React, { useEffect } from 'react';
import { ensureHudStylesInjected } from './hud-styles';

interface ViewportTopHudProps {
  activeCameraName: string | null;
  activeCameraShotType: string | null;
  activeCameraFrame: string;
  showGrid: boolean;
  showElementNumbers: boolean;
  showPaths: boolean;
  onToggleGrid: () => void;
  onToggleNumbers: () => void;
  onTogglePaths: () => void;
}

export function ViewportTopHud(props: ViewportTopHudProps) {
  useEffect(() => { ensureHudStylesInjected(); }, []);
  const {
    activeCameraName, activeCameraShotType, activeCameraFrame,
    showGrid, showElementNumbers, showPaths,
    onToggleGrid, onToggleNumbers, onTogglePaths,
  } = props;

  return (
    <div className="dsv2-hud-top">
      <div className="dsv2-hud-group">
        <span className="dsv2-hud-chip" data-tone="camera">
          ▶ {activeCameraName || '无机位'}{activeCameraShotType ? ` · ${activeCameraShotType}` : ''}
        </span>
        {activeCameraFrame && activeCameraFrame !== 'none' ? (
          <span className="dsv2-hud-chip" data-tone="frame">{activeCameraFrame}</span>
        ) : null}
      </div>
      <div className="dsv2-hud-group" role="group" aria-label="显示开关">
        <button
          type="button"
          className="dsv2-hud-chip"
          data-active={showGrid ? '1' : '0'}
          onClick={onToggleGrid}
          aria-pressed={showGrid}
        >
          ⊞ 网格
        </button>
        <button
          type="button"
          className="dsv2-hud-chip"
          data-active={showElementNumbers ? '1' : '0'}
          onClick={onToggleNumbers}
          aria-pressed={showElementNumbers}
        >
          ◈ 编号
        </button>
        <button
          type="button"
          className="dsv2-hud-chip"
          data-active={showPaths ? '1' : '0'}
          onClick={onTogglePaths}
          aria-pressed={showPaths}
        >
          ↝ 路径
        </button>
      </div>
    </div>
  );
}
