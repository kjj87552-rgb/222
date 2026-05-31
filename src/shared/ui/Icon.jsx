import React from 'react';

/* Minimal stroke icons. Monochrome; use currentColor. */
export const Icon = ({ d, size = 18, fill = "none", stroke = "currentColor", sw = 1.6, children, vb = "0 0 24 24", style }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);
