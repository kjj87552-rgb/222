import React from 'react';

/* ─────────────────────────────────────────────────────────
 * 3D GIZMO — tiny orbital axes widget (pitch/yaw readout)
 * ───────────────────────────────────────────────────────── */
export function Gizmo3D({ pitch = 0, yaw = 0, roll = 0, label = "摄像机" }) {
  const rx = pitch, ry = yaw;
  // Project the 3 axes (X right, Y up, Z toward camera) to 2D
  const project = (x, y, z) => {
    // Yaw rotates around Y (swaps X/Z); Pitch rotates around X (swaps Y/Z)
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cx = Math.cos(rx), sx = Math.sin(rx);
    let x1 = x*cy + z*sy;
    let z1 = -x*sy + z*cy;
    let y1 = y*cx - z1*sx;
    return [x1, y1];
  };
  const axis = (x, y, z, col, lbl) => {
    const [px, py] = project(x, y, z);
    return { x: 40 + px*28, y: 40 - py*28, col, lbl };
  };
  const axes = [
    axis(1, 0, 0, "#FF6B6B", "X"),
    axis(0, 1, 0, "#6BE38A", "Y"),
    axis(0, 0, 1, "#4FD4FE", "Z"),
  ];
  return (
    <div className="tm-gizmo">
      <svg width="80" height="80" style={{display:"block", margin:"auto"}}>
        {/* orbit ring */}
        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)"/>
        <ellipse cx="40" cy="40" rx="32" ry="12" fill="none" stroke="rgba(79,212,254,0.3)" strokeDasharray="2 3"/>
        {axes.map((a,i) => (
          <g key={i}>
            <line x1="40" y1="40" x2={a.x} y2={a.y} stroke={a.col} strokeWidth="1.5"/>
            <circle cx={a.x} cy={a.y} r="2" fill={a.col}/>
            <text x={a.x + 4} y={a.y + 3} fill={a.col} fontSize="9" fontFamily="var(--font-mono)">{a.lbl}</text>
          </g>
        ))}
        {/* camera lens dot */}
        <circle cx="40" cy="40" r="2" fill="#fff"/>
      </svg>
      <div className="gizmo-readout">
        <span>横 {Math.round(yaw*180/Math.PI)}°</span>
        <span>纵 {Math.round(pitch*180/Math.PI)}°</span>
      </div>
    </div>
  );
}
