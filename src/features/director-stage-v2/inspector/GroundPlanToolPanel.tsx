// src/features/director-stage-v2/inspector/GroundPlanToolPanel.tsx
import React, { useRef } from 'react';
import { NumberInput } from './shared/NumberInput';

interface GroundPlanToolPanelProps {
  groundPlanUrl: string;
  showGroundPlan: boolean;
  opacity: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetZ: number;
  onUpdate: (patch: {
    groundPlan?: string; showGroundPlan?: boolean;
    opacity?: number; scale?: number; rotation?: number; offsetX?: number; offsetZ?: number;
  }) => void;
  onUploadFile: (file: File) => void;
  onClearFile: () => void;
  onClose: () => void;
}

export function GroundPlanToolPanel(p: GroundPlanToolPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerUpload = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) p.onUploadFile(file);
    e.target.value = '';
  };

  return (
    <div data-testid="inspector-tool-ground">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="选择地面图片"
      />

      <div className="dsv2-insp-meta">
        <div className="dsv2-insp-eyebrow">
          <span>TOOL · GROUND</span>
          <button type="button" className="dsv2-insp-eyebrow-key" onClick={p.onClose}>G 关闭</button>
        </div>
        <div className="dsv2-insp-name-row">
          <span className="dsv2-insp-icon" style={{ background: 'var(--accent-3)' }}>▦</span>
          <span className="dsv2-insp-name">地面平面</span>
        </div>
      </div>

      <div className="dsv2-insp-body">
        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>显示</span></div>
          <div className="dsv2-insp-sec-body">
            <div className="dsv2-insp-field">
              <span className="dsv2-insp-field-label">显示地面</span>
              <button type="button" className="dsv2-insp-chip"
                      data-active={p.showGroundPlan ? '1' : '0'}
                      onClick={() => p.onUpdate({ showGroundPlan: !p.showGroundPlan })}>
                {p.showGroundPlan ? '开' : '关'}
              </button>
            </div>
          </div>
        </div>

        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>图片</span></div>
          <div className="dsv2-insp-sec-body">
            {p.groundPlanUrl ? (
              <>
                <div style={{ aspectRatio: '1', borderRadius: 6, background: `url(${p.groundPlanUrl}) center/contain no-repeat #eee`, opacity: p.opacity }} />
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <button type="button" className="dsv2-insp-chip" style={{ flex: 1, textAlign: 'center' }}
                          onClick={triggerUpload}>替换</button>
                  <button type="button" className="dsv2-insp-chip" style={{ flex: 1, textAlign: 'center', color: 'var(--stage-danger)' }}
                          onClick={p.onClearFile}>移除</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ aspectRatio: '1', borderRadius: 6, background: 'var(--paper-2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--ink-mute)', fontSize: 11 }}>未上传</div>
                <button type="button" className="dsv2-insp-chip"
                        style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 6 }}
                        onClick={triggerUpload}>＋ 上传图片</button>
              </>
            )}
          </div>
        </div>

        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>变换</span></div>
          <div className="dsv2-insp-sec-body">
            <Field label="透明度">
              <NumberInput value={p.opacity} min={0} max={1} step={0.05} precision={2}
                           onChange={(v) => p.onUpdate({ opacity: v })} />
            </Field>
            <Field label="缩放">
              <NumberInput value={p.scale} min={1} max={50} step={0.5} precision={1} unit="m"
                           onChange={(v) => p.onUpdate({ scale: v })} />
            </Field>
            <Field label="旋转">
              <NumberInput value={p.rotation} min={-180} max={180} step={1} precision={0} unit="°"
                           onChange={(v) => p.onUpdate({ rotation: v })} />
            </Field>
            <Field label="偏移">
              <div style={{ display: 'flex', gap: 4 }}>
                <NumberInput value={p.offsetX} step={0.1} precision={1} label="X"
                             onChange={(v) => p.onUpdate({ offsetX: v })} />
                <NumberInput value={p.offsetZ} step={0.1} precision={1} label="Z"
                             onChange={(v) => p.onUpdate({ offsetZ: v })} />
              </div>
            </Field>
          </div>
        </div>
      </div>
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
