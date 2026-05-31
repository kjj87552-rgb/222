// src/features/director-stage-v2/inspector/ElementInspector.tsx
import React, { useState } from 'react';
import {
  type DirectorStageElement, type DirectorStageAdvancedElement,
  DIRECTOR_STAGE_LOOK_AT_OPTIONS, DIRECTOR_STAGE_MANNEQUIN_STYLES,
  getDirectorStageJointPreset,
} from '../../director-stage/types';
import { NumberInput } from './shared/NumberInput';
import { AngleDial } from './shared/AngleDial';
import { PoseGrid } from './shared/PoseGrid';
import { JointSlider } from './shared/JointSlider';

interface ElementInspectorProps {
  element: DirectorStageElement;
  onUpdate: (patch: Partial<DirectorStageElement>) => void;
  onDelete: () => void;
  onRename: (next: string) => void;
}

export function ElementInspector({ element, onUpdate, onDelete, onRename }: ElementInspectorProps) {
  const [openJoints, setOpenJoints] = useState(false);
  const isHero = element.kind === 'advanced';
  const testId = isHero ? 'inspector-element-hero' : 'inspector-element-crowd';

  return (
    <div data-testid={testId}>
      <div className="dsv2-insp-meta" data-tone={isHero ? 'hero' : undefined}>
        <div className="dsv2-insp-eyebrow">
          <span>SELECTED · {isHero ? 'HERO' : 'CROWD'}</span>
          <button type="button" className="dsv2-insp-eyebrow-key" onClick={onDelete} aria-label="删除">⌫ 删除</button>
        </div>
        <div className="dsv2-insp-name-row">
          <span className="dsv2-insp-icon"
                style={{ background: isHero ? 'var(--stage-hero)' : 'var(--stage-crowd)' }}>
            {isHero ? '主' : '群'}
          </span>
          <input
            className="dsv2-insp-name"
            value={element.name || ''}
            onChange={(e) => onRename(e.target.value)}
            aria-label="对象名称"
          />
        </div>
      </div>

      <div className="dsv2-insp-body">
        <Section title="位置" defaultOpen>
          <Field label="坐标">
            <div style={{ display: 'flex', gap: 4 }}>
              <NumberInput value={element.x ?? 0} onChange={(v) => onUpdate({ x: v })} label="X" />
              <NumberInput value={element.y ?? 0} onChange={(v) => onUpdate({ y: v })} label="Y" />
              <NumberInput value={element.z ?? 0} onChange={(v) => onUpdate({ z: v })} label="Z" />
            </div>
          </Field>
          <Field label="朝向">
            <div style={{ display: 'flex', gap: 4 }}>
              <AngleDial value={element.rotationY ?? 0} onChange={(v) => onUpdate({ rotationY: v })} />
              <NumberInput value={element.scale ?? 1} onChange={(v) => onUpdate({ scale: v })} unit="×" step={0.01} precision={2} />
            </div>
          </Field>
        </Section>

        <Section title="姿态" defaultOpen>
          <PoseGrid
            value={(element.pose as any) || 'neutral'}
            onChange={(p) => {
              if (isHero) {
                const joints = getDirectorStageJointPreset(p);
                onUpdate({ pose: p === 'neutral' ? 'idle' : p, joints } as any);
              } else {
                onUpdate({ pose: p === 'neutral' ? 'idle' : p } as any);
              }
            }}
          />
          {isHero ? (
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--ink-mute)' }}>
              体块：
              <span className="dsv2-insp-chips" style={{ display: 'inline-flex', marginLeft: 6 }}>
                {DIRECTOR_STAGE_MANNEQUIN_STYLES.map((s) => (
                  <button key={s.key} type="button" className="dsv2-insp-chip"
                          data-active={(element as DirectorStageAdvancedElement).mannequinStyle === s.key ? '1' : '0'}
                          data-tone="hero"
                          onClick={() => onUpdate({ mannequinStyle: s.key } as any)}>{s.label}</button>
                ))}
              </span>
            </div>
          ) : null}
        </Section>

        {isHero ? (
          <Section title="关节微调" defaultOpen={openJoints} onToggle={() => setOpenJoints(!openJoints)}>
            {openJoints ? (
              <div>
                {Object.entries((element as DirectorStageAdvancedElement).joints || {}).map(([k, v]) => (
                  <JointSlider
                    key={k}
                    label={k}
                    value={v as number}
                    onChange={(nv) => onUpdate({
                      joints: { ...(element as DirectorStageAdvancedElement).joints, [k]: nv },
                    } as any)}
                  />
                ))}
              </div>
            ) : null}
          </Section>
        ) : null}

        <Section title="朝向目标">
          <div className="dsv2-insp-chips">
            {DIRECTOR_STAGE_LOOK_AT_OPTIONS.map((opt) => (
              <button key={opt.key} type="button" className="dsv2-insp-chip"
                      data-active={(element.lookAtMode || 'manual') === opt.key ? '1' : '0'}
                      data-tone="hero"
                      onClick={() => onUpdate({ lookAtMode: opt.key } as any)}>{opt.label}</button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, defaultOpen = false, onToggle }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; onToggle?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = onToggle ? defaultOpen : open;
  const toggle = onToggle || (() => setOpen(!open));
  return (
    <div className="dsv2-insp-section">
      <button
        type="button"
        className="dsv2-insp-sec-head"
        onClick={toggle}
        aria-expanded={isOpen}
      >
        <span>{title}</span><span aria-hidden>{isOpen ? '▾' : '▸'}</span>
      </button>
      {isOpen ? <div className="dsv2-insp-sec-body">{children}</div> : null}
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
