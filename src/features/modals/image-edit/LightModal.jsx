import React from 'react';
import { IClose, ILight, ISparkle } from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

/* ─────────────────────────────────────────────────────────
 * LIGHTING MODAL — key/rim + temperature (066–071)
 * ───────────────────────────────────────────────────────── */
const LIGHT_PRESETS = [
  { id:"natural",  lbl:"自然光",   key:{yaw:-0.6, pitch:0.3}, rim:{yaw:2.5, pitch:0.2}, tempIdx:3, brightness:70 },
  { id:"cinema",   lbl:"电影布光", key:{yaw:-1.0, pitch:0.5}, rim:{yaw:1.6, pitch:0.4}, tempIdx:5, brightness:60 },
  { id:"soft-box", lbl:"柔光箱",   key:{yaw:0,    pitch:0.2}, rim:{yaw:3.0, pitch:0.1}, tempIdx:3, brightness:85 },
  { id:"rim-back", lbl:"逆光",     key:{yaw:Math.PI-0.3, pitch:0.3}, rim:{yaw:0.2, pitch:0.2}, tempIdx:2, brightness:55 },
  { id:"low-key",  lbl:"低调光",   key:{yaw:-1.3, pitch:0.6}, rim:{yaw:1.3, pitch:-0.1}, tempIdx:6, brightness:35 },
  { id:"sunset",   lbl:"黄昏光",   key:{yaw:-0.8, pitch:0.15},rim:{yaw:2.0, pitch:0.25}, tempIdx:1, brightness:65 },
];
const TEMP_COLORS = [
  { k:"2200K", hex:"#FF7038" },
  { k:"2800K", hex:"#FF9A4F" },
  { k:"3800K", hex:"#FFC277" },
  { k:"5000K", hex:"#FFEBC2" },
  { k:"5600K", hex:"#FFFFFF" },
  { k:"6500K", hex:"#D7E4FF" },
  { k:"8000K", hex:"#A8C6FF" },
];

export function LightModal({ src, onClose, onApply }) {
  const [key, setKey] = React.useState({ yaw: -0.6, pitch: 0.3 });
  const [rim, setRim] = React.useState({ yaw: 2.5, pitch: 0.2 });
  const [brightness, setBrightness] = React.useState(70);
  const [tempIdx, setTempIdx] = React.useState(3);
  const [smart, setSmart] = React.useState(false);
  const [preset, setPreset] = React.useState(null);

  const apply = (p) => { setPreset(p.id); setKey(p.key); setRim(p.rim); setTempIdx(p.tempIdx); setBrightness(p.brightness); };

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose}><IClose size={16}/></button>
      <span className="sep"/>
      <button className="active"><ILight size={15}/><span className="tip">打光</span></button>
    </div>
  );

  const tempHex = TEMP_COLORS[tempIdx].hex;

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tm-stage">
        <div className="label"><ILight size={12}/>打光 · 工作室</div>
        <img className="bigimg" src={src || DEMO_IMG(100, 1200, 800)} style={{
          filter: `brightness(${0.5 + brightness/140}) saturate(1.05)`,
        }}/>
        {/* light overlay simulation */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background: `radial-gradient(circle at ${50 + Math.sin(key.yaw)*35}% ${50 - Math.sin(key.pitch)*35}%, ${tempHex}55 0%, transparent 55%), radial-gradient(circle at ${50 + Math.sin(rim.yaw)*42}% ${50 - Math.sin(rim.pitch)*42}%, #4FD4FE33 0%, transparent 45%)`,
          mixBlendMode: "screen",
        }}/>

        <div className="tm-side" style={{width: 320}}>
          <h3>主光（Key）</h3>
          <div className="tm-row">
            <label>偏航</label>
            <input type="range" min="-180" max="180" value={Math.round(key.yaw*180/Math.PI)} onChange={e => { setKey(k => ({...k, yaw: e.target.value*Math.PI/180})); setPreset(null); }}/>
            <span className="val">{Math.round(key.yaw*180/Math.PI)}°</span>
          </div>
          <div className="tm-row">
            <label>俯仰</label>
            <input type="range" min="-90" max="90" value={Math.round(key.pitch*180/Math.PI)} onChange={e => { setKey(k => ({...k, pitch: e.target.value*Math.PI/180})); setPreset(null); }}/>
            <span className="val">{Math.round(key.pitch*180/Math.PI)}°</span>
          </div>
          <h3 style={{marginTop:14}}>轮廓光（Rim）</h3>
          <div className="tm-row">
            <label>偏航</label>
            <input type="range" min="-180" max="180" value={Math.round(rim.yaw*180/Math.PI)} onChange={e => { setRim(r => ({...r, yaw: e.target.value*Math.PI/180})); setPreset(null); }}/>
            <span className="val">{Math.round(rim.yaw*180/Math.PI)}°</span>
          </div>
          <h3 style={{marginTop:14}}>强度 & 色温</h3>
          <div className="tm-row">
            <label>亮度</label>
            <input type="range" min="0" max="100" value={brightness} onChange={e => { setBrightness(+e.target.value); setPreset(null); }}/>
            <span className="val">{brightness}%</span>
          </div>
          <div className="tm-temp-bar">
            {TEMP_COLORS.map((c,i) => (
              <div key={i} className={`tm-temp-chip ${tempIdx===i?"active":""}`}
                style={{ background: c.hex }}
                title={c.k}
                onClick={() => { setTempIdx(i); setPreset(null); }}
              />
            ))}
          </div>

          <div style={{display:"flex", alignItems:"center", gap:8, marginTop:14}}>
            <h3 style={{margin:0, flex:1}}>智能模式</h3>
            <div onClick={() => setSmart(v => !v)}
              style={{
                width: 32, height: 18, borderRadius: 10,
                background: smart ? "var(--accent)" : "var(--paper-2)",
                border: "1px solid var(--line)", cursor:"pointer",
                position:"relative", flex:"0 0 auto",
              }}>
              <div style={{
                position:"absolute", top:1, left: smart? 15: 1,
                width: 14, height: 14, borderRadius: "50%",
                background: "#fff", transition: "left .15s",
              }}/>
            </div>
          </div>

          <h3 style={{marginTop:14}}>光照预设</h3>
          <div className="tm-preset-grid">
            {LIGHT_PRESETS.map(p => (
              <div key={p.id} className={`tm-preset ${preset===p.id?"active":""}`} onClick={() => apply(p)}
                style={{
                  background: `radial-gradient(circle at ${50 + Math.sin(p.key.yaw)*35}% ${50 - Math.sin(p.key.pitch)*35}%, ${TEMP_COLORS[p.tempIdx].hex} 0%, #222 70%)`,
                }}>
                <span className="lbl">{p.lbl}</span>
              </div>
            ))}
          </div>

          <button className="tm-send" onClick={() => onApply?.({key, rim, brightness, tempIdx, temperature: TEMP_COLORS[tempIdx], preset, smart})}>
            <ISparkle size={13}/> 确定生成
          </button>
        </div>
      </div>
    </ToolModal>
  );
}
