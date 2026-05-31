// src/features/director-stage-v2/inspector/MultiSelectInspector.tsx
import React from 'react';
import { type DirectorStageElement } from '../../director-stage/types';
import { NumberInput } from './shared/NumberInput';
import { PoseGrid } from './shared/PoseGrid';

interface MultiSelectInspectorProps {
  elements: DirectorStageElement[];
  onUpdateMany: (ids: string[], patch: Partial<DirectorStageElement>) => void;
  onDeleteMany: (ids: string[]) => void;
  onClear: () => void;
}

function shared<T>(items: any[], key: string): T | '__mixed__' | undefined {
  if (items.length === 0) return undefined;
  const v = items[0][key];
  return items.every((i) => i[key] === v) ? v : '__mixed__';
}

export function MultiSelectInspector({ elements, onUpdateMany, onDeleteMany, onClear }: MultiSelectInspectorProps) {
  const heroes = elements.filter((e) => e.kind === 'advanced');
  const allIds = elements.map((e) => e.id);

  const sharedScale = shared<number>(elements, 'scale');
  const sharedRot = shared<number>(elements, 'rotationY');
  const heroSharedPose = shared<string>(heroes, 'pose');

  return (
    <div data-testid="inspector-multi">
      <div className="dsv2-insp-meta">
        <div className="dsv2-insp-eyebrow">
          <span>MULTI · {elements.length} OBJECTS</span>
          <button type="button" className="dsv2-insp-eyebrow-key" onClick={onClear}>Esc 取消</button>
        </div>
        <div className="dsv2-insp-name-row">
          <span className="dsv2-insp-icon" style={{ background: 'var(--ink-soft)' }}>×{elements.length}</span>
          <span className="dsv2-insp-name" style={{ color: 'var(--ink-soft)' }}>{elements.length} 个对象</span>
        </div>
      </div>

      <div className="dsv2-insp-body">
        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>批量操作</span></div>
          <div className="dsv2-insp-sec-body">
            <div className="dsv2-insp-chips" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <button type="button" className="dsv2-insp-chip" style={{ textAlign: 'left' }}>⌖ 对齐视角</button>
              <button type="button" className="dsv2-insp-chip" style={{ textAlign: 'left' }}>⬚ 编入分组</button>
              <button type="button" className="dsv2-insp-chip" style={{ textAlign: 'left' }}>⟳ 平均分布</button>
              <button type="button" className="dsv2-insp-chip" style={{ textAlign: 'left', color: 'var(--stage-danger)' }}
                      onClick={() => onDeleteMany(allIds)}>⌫ 删除全部</button>
            </div>
          </div>
        </div>

        {heroes.length >= 1 && heroes.length < elements.length ? (
          <div className="dsv2-insp-section">
            <div className="dsv2-insp-sec-head"><span>{elements.length} 个里 {heroes.length} 个主角共享</span></div>
            <div className="dsv2-insp-sec-body">
              <div className="dsv2-insp-field">
                <span className="dsv2-insp-field-label">姿态</span>
                {heroSharedPose === '__mixed__' ? (
                  <span style={{ color: 'var(--ink-mute)', fontSize: 10 }}>Mixed</span>
                ) : (
                  <PoseGrid value={(heroSharedPose as any) || 'neutral'}
                            onChange={(p) => onUpdateMany(heroes.map((h) => h.id), { pose: p === 'neutral' ? 'idle' : p } as any)} />
                )}
              </div>
            </div>
          </div>
        ) : heroes.length === elements.length && heroes.length > 0 ? (
          <div className="dsv2-insp-section">
            <div className="dsv2-insp-sec-head"><span>主角属性共享</span></div>
            <div className="dsv2-insp-sec-body">
              <div className="dsv2-insp-field">
                <span className="dsv2-insp-field-label">姿态</span>
                {heroSharedPose === '__mixed__' ? (
                  <span style={{ color: 'var(--ink-mute)', fontSize: 10 }}>Mixed</span>
                ) : (
                  <PoseGrid value={(heroSharedPose as any) || 'neutral'}
                            onChange={(p) => onUpdateMany(allIds, { pose: p === 'neutral' ? 'idle' : p } as any)} />
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>全部 {elements.length} 个共享</span></div>
          <div className="dsv2-insp-sec-body">
            <div className="dsv2-insp-field">
              <span className="dsv2-insp-field-label">缩放</span>
              {sharedScale === '__mixed__' ? (
                <span style={{ color: 'var(--ink-mute)', fontSize: 10 }}>Mixed</span>
              ) : (
                <NumberInput value={(sharedScale as number) ?? 1} onChange={(v) => onUpdateMany(allIds, { scale: v })}
                             step={0.01} precision={2} unit="×" />
              )}
            </div>
            <div className="dsv2-insp-field">
              <span className="dsv2-insp-field-label">朝向</span>
              {sharedRot === '__mixed__' ? (
                <span style={{ color: 'var(--ink-mute)', fontSize: 10 }}>Mixed</span>
              ) : (
                <NumberInput value={(sharedRot as number) ?? 0} onChange={(v) => onUpdateMany(allIds, { rotationY: v } as any)}
                             min={-180} max={180} step={1} precision={0} unit="°" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
