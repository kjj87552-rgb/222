import React from 'react';

export function FakeQR({ size = 200 }) {
  // deterministic-ish dot pattern
  const cells = [];
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      // skip the 3 corner finder zones
      if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) continue;
      // pseudo-random
      const v = Math.sin(r * 31.7 + c * 17.3) * 5000;
      if (v - Math.floor(v) > 0.5) cells.push({ r, c });
    }
  }
  const s = size / 21;
  const corner = (cx, cy) => (
    <g key={`co-${cx}-${cy}`}>
      <rect x={cx*s} y={cy*s} width={s*7} height={s*7} className="corner"/>
      <rect x={(cx+2)*s} y={(cy+2)*s} width={s*3} height={s*3}/>
    </g>
  );
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="rp-qr-svg">
      {cells.map(({r,c}, i) => <rect key={i} x={c*s} y={r*s} width={s*0.95} height={s*0.95}/>)}
      {corner(0, 0)}{corner(14, 0)}{corner(0, 14)}
    </svg>
  );
}
