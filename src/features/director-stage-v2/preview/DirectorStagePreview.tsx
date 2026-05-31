import React, { useEffect, useMemo } from 'react';
import { ensureStageTokensInjected } from '../tokens/stage-tokens';
import { ensureStageMaterialsInjected } from '../tokens/stage-materials';
import { ensureStageSignatureInjected } from '../tokens/stage-signature';
import { ensureMotionKeyframesInjected } from '../motion/transitions';
import { ensurePreviewStylesInjected } from './preview-styles';
import type { CanvasNodeLike } from '../DirectorStageWorkbench';

interface DirectorStagePreviewProps {
  node: CanvasNodeLike;
  onOpen: () => void;
}

export function DirectorStagePreview({ node, onOpen }: DirectorStagePreviewProps) {
  useEffect(() => {
    ensureStageTokensInjected();
    ensureStageMaterialsInjected();
    ensureStageSignatureInjected();
    ensureMotionKeyframesInjected();
    ensurePreviewStylesInjected();
  }, []);

  const settings = (node.settings || {}) as Record<string, any>;
  const elements = (settings.director3dElements || []) as Array<{ kind?: string }>;
  const cameras = (settings.director3dCameras || []) as Array<unknown>;

  const heroCount = elements.filter((el) => el.kind === 'advanced').length;
  const objCount = elements.length;
  const camCount = cameras.length || 1;
  const hasData = elements.length > 0 || cameras.length > 0 || Boolean(settings.director3dBackground);
  const hasBg = Boolean(settings.director3dBackground || settings.director3dBackgroundSourceNodeId);
  const modeLabel = settings.director3dViewportMode === 'camera' ? 'CAM PREVIEW' : 'ORBIT VIEW';

  const diag = useMemo(() => {
    if (!hasData) return 'empty · 双击布置场景';
    const parts: string[] = ['READY'];
    if (hasBg) parts.push('BG 已连接');
    parts.push(modeLabel);
    return parts.join(' · ');
  }, [hasData, hasBg, modeLabel]);

  const title = (settings.displayName as string) || node.displayName || node.title || '全景环绕控制';

  return (
    <div
      className="dsv2-preview"
      onDoubleClick={(e) => { e.stopPropagation(); onOpen(); }}
    >
      <header className="dsv2-preview-header">
        <span className="dsv2-preview-brand">
          <span className="dsv2-preview-dot" aria-hidden />
          <span>PANORAMA·ORBIT</span>
          <span style={{ opacity: 0.5 }}>v2</span>
        </span>
        <span className="dsv2-preview-status">{hasData ? '●● ONLINE' : '·· STANDBY'}</span>
      </header>

      <div className="dsv2-preview-title-block">
        <div className="dsv2-preview-eyebrow">PANORAMA CONTROL</div>
        <div className="dsv2-preview-title">{title}</div>
      </div>

      <div className="dsv2-preview-stats">
        <div className="dsv2-preview-stat" data-role="hero" data-testid="stage-stat">
          <div className="dsv2-preview-stat-label">主角</div>
          <div className="dsv2-preview-stat-value">{String(heroCount).padStart(2, '0')}</div>
        </div>
        <div className="dsv2-preview-stat" data-role="obj" data-testid="stage-stat">
          <div className="dsv2-preview-stat-label">场景</div>
          <div className="dsv2-preview-stat-value">{String(objCount).padStart(2, '0')}</div>
        </div>
        <div className="dsv2-preview-stat" data-role="cam" data-testid="stage-stat">
          <div className="dsv2-preview-stat-label">机位</div>
          <div className="dsv2-preview-stat-value">{String(camCount).padStart(2, '0')}</div>
        </div>
      </div>

      <div className="dsv2-preview-diag">
        <span>≋ {diag}<span className="dsv2-preview-cursor" /></span>
        <button
          type="button"
          className="dsv2-preview-enter"
          data-testid="stage-enter"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >ENTER ▸</button>
      </div>
    </div>
  );
}
