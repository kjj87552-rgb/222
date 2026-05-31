// src/features/director-stage-v2/inspector/shared/JointSlider.tsx
import React from 'react';

interface JointSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
}

export function JointSlider({ label, value, min = -180, max = 180, step = 1, onChange }: JointSliderProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
      <span style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="dsv2-stage-slider"
        style={{ width: '100%' }}
      />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textAlign: 'right', color: 'var(--ink)' }}>
        {value.toFixed(0)}°
      </span>
    </div>
  );
}
