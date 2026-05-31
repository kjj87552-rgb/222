// src/features/director-stage-v2/tools/LeftToolRail.tsx
import React, { useEffect } from 'react';
import { ToolButton } from './ToolButton';
import { ensureToolbarStylesInjected } from './toolbar-styles';

export type ActiveTool = null | 'background' | 'ground' | 'crowd-builder' | 'camera' | 'frame' | 'path' | 'command';

export interface ToolCounts {
  hero: number;
  crowd: number;
  camera: number;
  hasBackground: boolean;
  hasGround: boolean;
  selectedHasPath: boolean;
}

interface LeftToolRailProps {
  activeTool: ActiveTool;
  counts: ToolCounts;
  onActivateTool: (tool: ActiveTool) => void;
  onAddHero: () => void;
  onTogglePathPreview: () => void;
  isPathPreviewPlaying: boolean;
}

export function LeftToolRail({
  activeTool, counts, onActivateTool, onAddHero, onTogglePathPreview, isPathPreviewPlaying,
}: LeftToolRailProps) {
  useEffect(() => { ensureToolbarStylesInjected(); }, []);

  return (
    <div className="dsv2-rail" role="toolbar" aria-label="创建工具">
      <span className="dsv2-rail-section">环境</span>
      <ToolButton icon="🖼" label="背景设置" hotkey="B" active={activeTool === 'background'}
        onClick={() => onActivateTool(activeTool === 'background' ? null : 'background')} />
      <ToolButton icon="▦" label="地面平面" hotkey="G" active={activeTool === 'ground'}
        onClick={() => onActivateTool(activeTool === 'ground' ? null : 'ground')} />

      <span className="dsv2-rail-divider" aria-hidden />
      <span className="dsv2-rail-section">对象</span>
      <ToolButton icon="👤" label="添加主角" hotkey="H" role="hero" active={false}
        badge={counts.hero} onClick={onAddHero} />
      <ToolButton icon="👥" label="批量布置群演" hotkey="C" active={activeTool === 'crowd-builder'}
        badge={counts.crowd} onClick={() => onActivateTool(activeTool === 'crowd-builder' ? null : 'crowd-builder')} />

      <span className="dsv2-rail-divider" aria-hidden />
      <span className="dsv2-rail-section">镜头</span>
      <ToolButton icon="🎬" label="添加机位" hotkey="K" active={activeTool === 'camera'}
        badge={counts.camera} onClick={() => onActivateTool(activeTool === 'camera' ? null : 'camera')} />
      <ToolButton icon="▭" label="切换取景比例" hotkey="F" role="frame" active={activeTool === 'frame'}
        onClick={() => onActivateTool(activeTool === 'frame' ? null : 'frame')} />

      <span className="dsv2-rail-divider" aria-hidden />
      <span className="dsv2-rail-section">动画</span>
      <ToolButton icon="↝" label="绘制路径" hotkey="P" active={activeTool === 'path'}
        onClick={() => onActivateTool(activeTool === 'path' ? null : 'path')} />
      <ToolButton icon={isPathPreviewPlaying ? '⏸' : '▶'} label="路径预览" hotkey="Space" active={isPathPreviewPlaying}
        onClick={onTogglePathPreview} />

      <span className="dsv2-rail-spacer" aria-hidden />
      <span className="dsv2-rail-divider" aria-hidden />
      {/* 占位，T22 接入真实创建逻辑 */}
      <ToolButton icon="⊕" label="命令面板" hotkey="/" active={activeTool === 'command'}
        onClick={() => onActivateTool(activeTool === 'command' ? null : 'command')} />
    </div>
  );
}
