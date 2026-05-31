// src/features/director-stage-v2/inspector/CrowdBuilderPanel.tsx
import React, { useState } from 'react';
import { NumberInput } from './shared/NumberInput';

type Layout = 'single' | 'grid' | 'circle';

interface CrowdBuilderPanelProps {
  onGenerate: (cfg: { count: number; layout: Layout; columns: number; spacingX: number; spacingZ: number; radius: number }) => void;
  onClose: () => void;
}

export function CrowdBuilderPanel({ onGenerate, onClose }: CrowdBuilderPanelProps) {
  const [count, setCount] = useState(18);
  const [layout, setLayout] = useState<Layout>('grid');
  const [columns, setColumns] = useState(4);
  const [spacingX, setSpacingX] = useState(1.5);
  const [spacingZ, setSpacingZ] = useState(1.8);
  const [radius, setRadius] = useState(4.6);

  return (
    <div data-testid="inspector-tool-crowd">
      <div className="dsv2-insp-meta">
        <div className="dsv2-insp-eyebrow">
          <span>TOOL · CROWD BUILDER</span>
          <button type="button" className="dsv2-insp-eyebrow-key" onClick={onClose}>C 关闭</button>
        </div>
        <div className="dsv2-insp-name-row">
          <span className="dsv2-insp-icon" style={{ background: 'var(--stage-crowd)' }}>👥</span>
          <span className="dsv2-insp-name">批量布置群演</span>
        </div>
      </div>

      <div className="dsv2-insp-body">
        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>阵型</span></div>
          <div className="dsv2-insp-sec-body">
            <div className="dsv2-insp-chips">
              {(['single', 'grid', 'circle'] as Layout[]).map((l) => (
                <button key={l} type="button" className="dsv2-insp-chip"
                        data-active={layout === l ? '1' : '0'}
                        onClick={() => setLayout(l)}>
                  {l === 'single' ? '单排' : l === 'grid' ? '网格' : '环形'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>参数</span></div>
          <div className="dsv2-insp-sec-body">
            <div className="dsv2-insp-field">
              <span className="dsv2-insp-field-label">数量</span>
              <NumberInput value={count} min={1} max={200} step={1} precision={0} onChange={setCount} />
            </div>
            {layout === 'grid' ? (
              <div className="dsv2-insp-field">
                <span className="dsv2-insp-field-label">列数</span>
                <NumberInput value={columns} min={1} max={20} step={1} precision={0} onChange={setColumns} />
              </div>
            ) : null}
            {layout !== 'circle' ? (
              <>
                <div className="dsv2-insp-field">
                  <span className="dsv2-insp-field-label">X 间距</span>
                  <NumberInput value={spacingX} step={0.1} precision={1} unit="m" onChange={setSpacingX} />
                </div>
                <div className="dsv2-insp-field">
                  <span className="dsv2-insp-field-label">Z 间距</span>
                  <NumberInput value={spacingZ} step={0.1} precision={1} unit="m" onChange={setSpacingZ} />
                </div>
              </>
            ) : (
              <div className="dsv2-insp-field">
                <span className="dsv2-insp-field-label">半径</span>
                <NumberInput value={radius} step={0.1} precision={1} unit="m" onChange={setRadius} />
              </div>
            )}
          </div>
        </div>

        <button type="button"
                className="dsv2-shell-action"
                data-primary="1" data-dirty="1"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { onGenerate({ count, layout, columns, spacingX, spacingZ, radius }); onClose(); }}>
          生成 {count} 个群演
        </button>
      </div>
    </div>
  );
}
