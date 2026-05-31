// src/features/director-stage-v2/inspector/shared/AngleDial.tsx
import React from 'react';
import { NumberInput } from './NumberInput';

interface AngleDialProps {
  value: number;
  onChange: (next: number) => void;
}

export function AngleDial({ value, onChange }: AngleDialProps) {
  return (
    <NumberInput
      value={value} onChange={onChange}
      min={-180} max={180} step={1} precision={0} unit="°"
      ariaLabel="朝向角"
    />
  );
}
