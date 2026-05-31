// src/features/director-stage-v2/inspector/BackgroundToolPanel.tsx
import React, { useRef } from 'react';
import { DIRECTOR_STAGE_BACKGROUND_COLORS } from '../../director-stage/types';

interface BackgroundToolPanelProps {
  currentBackground: string;
  currentBackgroundSourceNodeId: string | null;
  currentBackgroundColor: string;
  connectedSources: Array<{ nodeId: string; label: string; rawSource: string }>;
  onSelectSource: (nodeId: string) => void;
  onClearSource: () => void;
  onPickColor: (color: string) => void;
  onUploadFile: (file: File) => void;
  onClose: () => void;
}

export function BackgroundToolPanel(props: BackgroundToolPanelProps) {
  const { currentBackground, currentBackgroundSourceNodeId, currentBackgroundColor,
          connectedSources, onSelectSource, onClearSource, onPickColor, onUploadFile, onClose } = props;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerUpload = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
    e.target.value = '';
  };

  return (
    <div data-testid="inspector-tool-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="选择背景图片"
      />

      <div className="dsv2-insp-meta">
        <div className="dsv2-insp-eyebrow">
          <span>TOOL · BACKGROUND</span>
          <button type="button" className="dsv2-insp-eyebrow-key" onClick={onClose}>B 关闭</button>
        </div>
        <div className="dsv2-insp-name-row">
          <span className="dsv2-insp-icon" style={{ background: 'var(--stage-hero)' }}>🖼</span>
          <span className="dsv2-insp-name">背景设置</span>
        </div>
      </div>

      <div className="dsv2-insp-body">
        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>当前背景</span></div>
          <div className="dsv2-insp-sec-body">
            {currentBackground ? (
              <>
                <div style={{ aspectRatio: '16/9', borderRadius: 6, overflow: 'hidden',
                              background: `url(${currentBackground}) center/cover, ${currentBackgroundColor}` }} />
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <button type="button" className="dsv2-insp-chip" style={{ flex: 1, textAlign: 'center' }}
                          onClick={triggerUpload}>替换</button>
                  <button type="button" className="dsv2-insp-chip" style={{ flex: 1, textAlign: 'center', color: 'var(--stage-danger)' }}
                          onClick={onClearSource}>移除</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ aspectRatio: '16/9', borderRadius: 6, background: currentBackgroundColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--ink-mute)', fontSize: 11 }}>未设置</div>
                <button type="button" className="dsv2-insp-chip"
                        style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 6 }}
                        onClick={triggerUpload}>＋ 上传图片</button>
              </>
            )}
          </div>
        </div>

        {connectedSources.length > 0 ? (
          <div className="dsv2-insp-section">
            <div className="dsv2-insp-sec-head"><span>从连接的节点选择</span></div>
            <div className="dsv2-insp-sec-body">
              {connectedSources.map((s) => (
                <button key={s.nodeId} type="button"
                        className="dsv2-insp-chip"
                        style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 4,
                                 background: s.nodeId === currentBackgroundSourceNodeId ? 'var(--stage-camera-soft)' : undefined }}
                        onClick={() => onSelectSource(s.nodeId)}>{s.label}</button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="dsv2-insp-section">
          <div className="dsv2-insp-sec-head"><span>纯色背景</span></div>
          <div className="dsv2-insp-sec-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
              {DIRECTOR_STAGE_BACKGROUND_COLORS.map((c) => (
                <button key={c.color} type="button"
                        aria-label={c.label}
                        title={c.label}
                        style={{ aspectRatio: '1', borderRadius: 5, background: c.color,
                                 border: currentBackgroundColor === c.color ? '2px solid var(--accent)' : '1px solid var(--line-soft)',
                                 cursor: 'pointer' }}
                        onClick={() => onPickColor(c.color)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
