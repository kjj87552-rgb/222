// src/features/director-stage-v2/viewport/viewport-hud/EmptyStateHint.tsx
import React, { useEffect, useState } from 'react';

const DISMISS_KEY = 'directorStageV2_emptyHintDismissed';

interface EmptyStateHintProps { onDismiss?: () => void; }

export function EmptyStateHint({ onDismiss }: EmptyStateHintProps) {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY) === '1') setDismissed(true); } catch {}
  }, []);
  if (dismissed) return null;

  const close = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div role="status" aria-live="polite"
         style={{
           position: 'absolute', top: '50%', left: '50%',
           transform: 'translate(-50%, -50%)',
           background: 'color-mix(in oklab, var(--paper) 90%, transparent)',
           backdropFilter: 'blur(10px)',
           border: '1px solid var(--line)', borderRadius: 12,
           padding: '18px 22px',
           color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: 12,
           boxShadow: '0 14px 38px -22px rgba(0,0,0,0.4)',
           textAlign: 'center', pointerEvents: 'auto',
         }}>
      <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>开始布置 3D 场景</div>
      <Row icon="👤" hotkey="H" label="添加主角" />
      <Row icon="👥" hotkey="C" label="批量布置群演" />
      <Row icon="🎬" hotkey="K" label="添加机位" />
      <Row icon="🖼" hotkey="B" label="选择背景" />
      <button type="button" onClick={close}
              style={{ marginTop: 12, padding: '4px 10px', fontSize: 11,
                       background: 'transparent', border: '1px solid var(--line)',
                       borderRadius: 5, color: 'var(--ink-mute)', cursor: 'pointer' }}>
        不再显示
      </button>
    </div>
  );
}

function Row({ icon, hotkey, label }: { icon: string; hotkey: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', justifyContent: 'flex-start', textAlign: 'left' }}>
      <span style={{ fontSize: 16, width: 22, textAlign: 'center' }} aria-hidden>{icon}</span>
      <span>按 <kbd style={{ padding: '1px 6px', background: 'var(--paper-2)', borderRadius: 3,
                              fontFamily: 'var(--font-mono)', fontSize: 11 }}>{hotkey}</kbd> {label}</span>
    </div>
  );
}
