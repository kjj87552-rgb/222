// src/features/director-stage-v2/inspector/CameraInspector.tsx
import React from 'react';
import {
  type DirectorStageCamera,
  DIRECTOR_STAGE_FRAME_OPTIONS, DIRECTOR_STAGE_SHOT_TYPE_OPTIONS, DIRECTOR_STAGE_SHOT_PRIORITY_OPTIONS,
} from '../../director-stage/types';
import { NumberInput } from './shared/NumberInput';

interface CameraInspectorProps {
  camera: DirectorStageCamera;
  isActive: boolean;
  onUpdate: (patch: Partial<DirectorStageCamera>) => void;
  onDelete: () => void;
  onRename: (next: string) => void;
  onMakeActive: () => void;
}

export function CameraInspector({ camera, isActive, onUpdate, onDelete, onRename, onMakeActive }: CameraInspectorProps) {
  return (
    <div data-testid="inspector-camera">
      <div className="dsv2-insp-meta" data-tone="camera">
        <div className="dsv2-insp-eyebrow">
          <span>SELECTED · CAMERA</span>
          <button type="button" className="dsv2-insp-eyebrow-key" onClick={onDelete} aria-label="删除">⌫ 删除</button>
        </div>
        <div className="dsv2-insp-name-row">
          <span className="dsv2-insp-icon" style={{ background: 'var(--stage-camera)' }}>
            {(camera.name || 'A').slice(0, 1)}
          </span>
          <input
            className="dsv2-insp-name"
            value={camera.name || ''}
            onChange={(e) => onRename(e.target.value)}
            aria-label="机位名称"
          />
          {isActive ? (
            <span style={{ fontSize: 10, color: 'var(--stage-camera)' }}>● 当前</span>
          ) : (
            <button type="button" className="dsv2-insp-eyebrow-key" onClick={onMakeActive}>切到此机位</button>
          )}
        </div>
      </div>

      <div className="dsv2-insp-body">
        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>镜头属性</span></div>
          <div className="dsv2-insp-sec-body">
            <Field label="FOV">
              <NumberInput value={camera.fov ?? 42} onChange={(v) => onUpdate({ fov: v })} min={10} max={140} unit="°" precision={0} />
            </Field>
            <Field label="取景">
              <Chips
                options={DIRECTOR_STAGE_FRAME_OPTIONS}
                value={camera.frame || 'none'}
                tone="frame"
                label="取景"
                onChange={(v) => onUpdate({ frame: v as any })}
              />
            </Field>
            <Field label="类型">
              <Chips
                options={DIRECTOR_STAGE_SHOT_TYPE_OPTIONS}
                value={camera.shotType || 'master'}
                label="类型"
                onChange={(v) => onUpdate({ shotType: v as any })}
              />
            </Field>
            <Field label="优先级">
              <Chips
                options={DIRECTOR_STAGE_SHOT_PRIORITY_OPTIONS}
                value={camera.priority || 'primary'}
                label="优先级"
                onChange={(v) => onUpdate({ priority: v as any })}
              />
            </Field>
          </div>
        </div>

        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>位置 · 目标</span></div>
          <div className="dsv2-insp-sec-body">
            <Field label="位置">
              <div style={{ display: 'flex', gap: 4 }}>
                <NumberInput value={camera.x ?? 0} onChange={(v) => onUpdate({ x: v })} label="X" />
                <NumberInput value={camera.y ?? 0} onChange={(v) => onUpdate({ y: v })} label="Y" />
                <NumberInput value={camera.z ?? 0} onChange={(v) => onUpdate({ z: v })} label="Z" />
              </div>
            </Field>
            <Field label="目标">
              <div style={{ display: 'flex', gap: 4 }}>
                <NumberInput value={camera.targetX ?? 0} onChange={(v) => onUpdate({ targetX: v })} label="X" />
                <NumberInput value={camera.targetY ?? 0} onChange={(v) => onUpdate({ targetY: v })} label="Y" />
                <NumberInput value={camera.targetZ ?? 0} onChange={(v) => onUpdate({ targetZ: v })} label="Z" />
              </div>
            </Field>
          </div>
        </div>

        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>叙事元数据</span></div>
          <div className="dsv2-insp-sec-body">
            <Field label="用途">
              <input
                className="dsv2-insp-input" style={{ width: '100%' }}
                value={camera.usage || ''}
                onChange={(e) => onUpdate({ usage: e.target.value })}
                placeholder="如：空间建立镜头"
              />
            </Field>
            <Field label="时长">
              <NumberInput value={camera.durationSeconds ?? 0} onChange={(v) => onUpdate({ durationSeconds: v })} unit="秒" precision={1} step={0.5} />
            </Field>
            <Field label="备注">
              <input
                className="dsv2-insp-input" style={{ width: '100%' }}
                value={camera.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="可选"
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chips<T extends string>({ options, value, onChange, tone, label }: {
  options: ReadonlyArray<{ key: T; label: string }>; value: T; onChange: (v: T) => void; tone?: 'frame' | 'hero'; label?: string;
}) {
  return (
    <div className="dsv2-insp-chips" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.key} type="button" role="radio" aria-checked={value === o.key}
                className="dsv2-insp-chip"
                data-active={value === o.key ? '1' : '0'}
                data-tone={tone}
                onClick={() => onChange(o.key)}>{o.label}</button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dsv2-insp-field">
      <span className="dsv2-insp-field-label">{label}</span>
      <div>{children}</div>
    </div>
  );
}
