// src/features/director-stage-v2/shell/DiagnosticBar.tsx
import React from 'react';

interface DiagnosticBarProps {
  heroCount: number;
  crowdCount: number;
  cameraCount: number;
  backgroundLabel: string | null; // null = 无背景
  activeCameraName: string | null;
  activeCameraShotType: string | null;
  activeCameraFrame: string;
}

const DIAG_STYLE = `
.dsv2-diag {
  flex: 0 0 auto;
  height: 32px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 18px;
  background: linear-gradient(180deg,
    var(--paper-2),
    color-mix(in oklab, var(--paper-3) 90%, var(--accent) 6%));
  border-top: 1px solid var(--stage-hairline);
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, white 8%, transparent),
    0 -4px 12px -8px color-mix(in oklab, var(--ink) 18%, transparent);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--stage-diag-fg);
  letter-spacing: 0.08em;
  position: relative;
  text-transform: uppercase;
}
.dsv2-diag-left {
  display: flex; align-items: center; gap: 18px;
}
.dsv2-diag-pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--stage-led-online-bg);
  box-shadow: var(--stage-led-online-glow);
  animation: stage-pulse 2s infinite;
}
.dsv2-diag-sep {
  width: 1px; height: 12px;
  background: var(--stage-hairline);
  display: inline-block;
  margin: 0 4px;
}
`;
let __injected = false;
function inject() {
  if (__injected || typeof document === 'undefined') return;
  __injected = true;
  const s = document.createElement('style');
  s.id = 'director-stage-v2-diag';
  s.textContent = DIAG_STYLE;
  document.head.appendChild(s);
}

export function DiagnosticBar({
  heroCount, crowdCount, cameraCount, backgroundLabel,
  activeCameraName, activeCameraShotType, activeCameraFrame,
}: DiagnosticBarProps) {
  React.useEffect(inject, []);
  const stats = `READY · ${heroCount} 主角 / ${crowdCount} 群演 / ${cameraCount} 机位`;
  const bgText = backgroundLabel ? `BG · ${backgroundLabel}` : 'BG · 未连接';
  const camText = activeCameraName
    ? `${activeCameraName}${activeCameraShotType ? ' · ' + activeCameraShotType : ''}${activeCameraFrame && activeCameraFrame !== 'none' ? ' · ' + activeCameraFrame : ''}`
    : '无机位';

  return (
    <div className="dsv2-diag" role="status" aria-live="polite">
      <div className="dsv2-diag-left">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="dsv2-diag-pulse" aria-hidden />
          <span>{stats}</span>
        </span>
        <span className="dsv2-diag-sep" aria-hidden />
        <span>{bgText}</span>
      </div>
      <div>{camText}</div>
    </div>
  );
}
