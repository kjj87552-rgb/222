// src/features/director-stage-v2/viewport/viewport-hud/ViewportBottomHud.tsx
import React, { useEffect } from 'react';
import { ensureHudStylesInjected } from './hud-styles';

interface ViewportBottomHudProps {
  fov: number;
  distance: number;
  onResetView: () => void;
  onFitScene: () => void;
}

export function ViewportBottomHud({ fov, distance, onResetView, onFitScene }: ViewportBottomHudProps) {
  useEffect(() => { ensureHudStylesInjected(); }, []);
  return (
    <div className="dsv2-hud-bottom">
      <div className="dsv2-hud-group" role="group" aria-label="视图工具">
        <button
          type="button"
          className="dsv2-hud-chip"
          onClick={onResetView}
          aria-keyshortcuts="R"
        >
          ⟲ 重置视角
        </button>
        <button
          type="button"
          className="dsv2-hud-chip"
          onClick={onFitScene}
        >
          ⌧ 适配场景
        </button>
      </div>
      <div className="dsv2-hud-group">
        <span className="dsv2-hud-chip">FOV {fov}°</span>
        <span className="dsv2-hud-chip">距 {distance.toFixed(1)}m</span>
      </div>
    </div>
  );
}
