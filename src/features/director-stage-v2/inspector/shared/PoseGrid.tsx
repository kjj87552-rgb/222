// src/features/director-stage-v2/inspector/shared/PoseGrid.tsx
import React from 'react';
import { DIRECTOR_STAGE_POSE_OPTIONS, type DirectorStagePose } from '../../../director-stage/types';

interface PoseGridProps {
  value: DirectorStagePose | 'neutral';
  onChange: (next: DirectorStagePose | 'neutral') => void;
}

export function PoseGrid({ value, onChange }: PoseGridProps) {
  return (
    <div className="dsv2-insp-chips" role="radiogroup" aria-label="姿态">
      {DIRECTOR_STAGE_POSE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="radio"
          aria-checked={value === opt.key}
          className="dsv2-insp-chip"
          data-active={value === opt.key ? '1' : '0'}
          data-tone="hero"
          onClick={() => onChange(opt.key as any)}
        >{opt.label}</button>
      ))}
    </div>
  );
}
