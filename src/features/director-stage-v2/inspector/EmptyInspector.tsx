// src/features/director-stage-v2/inspector/EmptyInspector.tsx
import React from 'react';

interface EmptyInspectorProps {
  heroCount: number;
  crowdCount: number;
  cameraCount: number;
  pathCount: number;
  backgroundLabel: string | null;
}

export function EmptyInspector(props: EmptyInspectorProps) {
  const { heroCount, crowdCount, cameraCount, pathCount, backgroundLabel } = props;
  return (
    <>
      <div className="dsv2-insp-empty" data-testid="inspector-empty">
        <div className="dsv2-insp-empty-icon" aria-hidden>⌖</div>
        <div className="dsv2-insp-empty-title">未选中任何对象</div>
        <div className="dsv2-insp-empty-hint">
          在视口或左工具栏创建对象<br/>
          或单击视口里的对象进行编辑
        </div>
      </div>
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '6px 0 8px' }}>场景概览</div>
        <Row color="var(--stage-hero)" label="主角" value={heroCount} />
        <Row color="var(--stage-crowd)" label="群演" value={crowdCount} />
        <Row color="var(--stage-camera)" label="机位" value={cameraCount} />
        <Row color="var(--stage-frame)" label="路径" value={pathCount} />
        {backgroundLabel ? (
          <div className="dsv2-insp-overview-stat" style={{ background: 'var(--paper-2)' }}>
            <span className="dsv2-insp-overview-label"><span aria-hidden>🖼</span>背景</span>
            <span style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{backgroundLabel}</span>
          </div>
        ) : null}
      </div>
    </>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="dsv2-insp-overview-stat">
      <span className="dsv2-insp-overview-label">
        <span style={{ width: 8, height: 8, background: color, borderRadius: 2 }} aria-hidden />
        {label}
      </span>
      <span className="dsv2-insp-overview-value">{String(value).padStart(2, '0')}</span>
    </div>
  );
}
