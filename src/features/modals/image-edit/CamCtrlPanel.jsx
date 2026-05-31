import React from 'react';
import { ICheck } from '../../../shared/ui/icons/index.jsx';

const MOVEMENT_PRESETS = [
  { k: "static",  lbl: "静止",     ic: "·" },
  { k: "push-in", lbl: "推近",     ic: "▶" },
  { k: "pull-out",lbl: "拉远",     ic: "◁" },
  { k: "pan-l",   lbl: "左摇",     ic: "←" },
  { k: "pan-r",   lbl: "右摇",     ic: "→" },
  { k: "tilt-up", lbl: "上摇",     ic: "↑" },
  { k: "tilt-dn", lbl: "下摇",     ic: "↓" },
  { k: "orbit",   lbl: "环绕",     ic: "⟲" },
  { k: "dolly",   lbl: "推轨",     ic: "≫" },
  { k: "handheld",lbl: "手持",     ic: "≈" },
  { k: "zoom",    lbl: "变焦",     ic: "⊙" },
  { k: "crane",   lbl: "升降",     ic: "⇕" },
];

export function CamCtrlPanel({ onClose, onApply, mode = "image" }) {
  const [shutter, setShutter] = React.useState(35);
  const [aperture, setAperture] = React.useState("f/2.8");
  const [iso, setIso] = React.useState(400);
  const [focus, setFocus] = React.useState("人物");
  const [movement, setMovement] = React.useState("static");
  const [speed, setSpeed] = React.useState(50);

  return (
    <div className="cc-popover" onPointerDown={e => e.stopPropagation()}>
      <h3>{mode === "video" ? "运镜控制" : "摄像机控制"}</h3>
      <div className="row">
        <label>焦距</label>
        <input type="range" min="14" max="200" value={shutter} onChange={e => setShutter(+e.target.value)}/>
        <span className="val">{shutter}mm</span>
      </div>
      <div className="row">
        <label>光圈</label>
        <div className="seg">
          {["f/1.4", "f/2.0", "f/2.8", "f/4", "f/5.6", "f/8"].map(a => (
            <button key={a} className={aperture===a?"active":""} onClick={() => setAperture(a)}>{a}</button>
          ))}
        </div>
        <span/>
      </div>
      <div className="row">
        <label>ISO</label>
        <input type="range" min="100" max="6400" step="100" value={iso} onChange={e => setIso(+e.target.value)}/>
        <span className="val">{iso}</span>
      </div>
      <div className="row">
        <label>对焦点</label>
        <div className="seg">
          {["人物", "前景", "背景", "中心"].map(f => (
            <button key={f} className={focus===f?"active":""} onClick={() => setFocus(f)}>{f}</button>
          ))}
        </div>
        <span/>
      </div>

      {mode === "video" && (
        <>
          <div className="div"/>
          <h3 style={{ marginTop: 0 }}>运镜方式 · 20+ 预设</h3>
          <div className="preset-grid">
            {MOVEMENT_PRESETS.map(m => (
              <button key={m.k} className={`preset ${movement===m.k?"active":""}`} onClick={() => setMovement(m.k)}>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <span className="pi">{m.ic}</span>
                  <span>{m.lbl}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <label>速度</label>
            <input type="range" min="10" max="100" value={speed} onChange={e => setSpeed(+e.target.value)}/>
            <span className="val">{speed}%</span>
          </div>
        </>
      )}

      <div className="div"/>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="x-btn ghost" style={{ flex: 1 }} onClick={onClose}>关闭</button>
        <button className="x-btn primary" style={{ flex: 1 }} onClick={() => { onApply?.({ shutter, aperture, iso, focus, movement, speed }); onClose?.(); }}>
          <ICheck size={12}/>应用
        </button>
      </div>
    </div>
  );
}
