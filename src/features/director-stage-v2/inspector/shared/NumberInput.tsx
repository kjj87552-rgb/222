// src/features/director-stage-v2/inspector/shared/NumberInput.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
  label?: string;
  width?: number;
  ariaLabel?: string;
}

export function NumberInput({
  value, onChange, min, max, step = 1, precision = 2, unit = '', label, width, ariaLabel,
}: NumberInputProps) {
  const [draft, setDraft] = useState(value.toFixed(precision));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value.toFixed(precision)); }, [value, precision]);

  const clamp = (n: number) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };

  const commit = useCallback((raw: string) => {
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(clamp(n));
    else setDraft(value.toFixed(precision));
  }, [onChange, value, precision, min, max]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const mul = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowUp') { e.preventDefault(); onChange(clamp(value + step * mul)); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - step * mul)); }
    else if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); }
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--paper-2)',
                   border: '1px solid var(--line-soft)', borderRadius: 5, padding: '3px 5px', width }}>
      {label ? (
        <span style={{ fontSize: 9, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>{label}</span>
      ) : null}
      <input
        ref={inputRef}
        type="text" inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={onKey}
        aria-label={ariaLabel || label || 'number'}
        style={{ flex: 1, minWidth: 30, background: 'transparent', border: 'none', outline: 'none',
                 fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink)',
                 fontVariantNumeric: 'tabular-nums' }}
      />
      {unit ? <span style={{ fontSize: 9, color: 'var(--ink-mute)' }}>{unit}</span> : null}
    </span>
  );
}
