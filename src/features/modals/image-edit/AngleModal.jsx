import React from 'react';
import { IClose, ICamera, ILight, IGrid9, IPano, ISparkle } from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { Gizmo3D } from '../shared/Gizmo3D.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

/* ─────────────────────────────────────────────────────────
 * ANGLE MODAL — camera angles (figures 062–065)
 * ───────────────────────────────────────────────────────── */
const ANGLE_PRESETS = [
  { id:"front",       lbl:"正面",   yaw:0,    pitch:0 },
  { id:"three-q-l",   lbl:"3/4 左", yaw:-Math.PI/4, pitch:0 },
  { id:"three-q-r",   lbl:"3/4 右", yaw: Math.PI/4, pitch:0 },
  { id:"side-l",      lbl:"左侧",   yaw:-Math.PI/2, pitch:0 },
  { id:"side-r",      lbl:"右侧",   yaw: Math.PI/2, pitch:0 },
  { id:"back",        lbl:"背面",   yaw: Math.PI, pitch:0 },
  { id:"top",         lbl:"俯视",   yaw:0, pitch: Math.PI/3 },
  { id:"low",         lbl:"仰视",   yaw:0, pitch:-Math.PI/3 },
  { id:"birdseye",    lbl:"鸟瞰",   yaw:0, pitch: Math.PI/2.2 },
];

export function AngleModal({ src, onClose, onApply }) {
  const [yaw, setYaw] = React.useState(0);
  const [pitch, setPitch] = React.useState(0);
  const [fov, setFov] = React.useState(35);
  const [distance, setDistance] = React.useState(60);
  const [preset, setPreset] = React.useState(null);

  const apply = (p) => {
    setPreset(p.id);
    setYaw(p.yaw);
    setPitch(p.pitch);
  };

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose}><IClose size={16}/></button>
      <span className="sep"/>
      <button className="active"><ICamera size={15}/><span className="tip">多角度</span></button>
      <button><ILight size={15}/><span className="tip">打光</span></button>
      <button><IGrid9 size={15}/><span className="tip">九宫格</span></button>
      <button><IPano size={15}/><span className="tip">全景</span></button>
    </div>
  );

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tm-stage">
        <div className="label"><ICamera size={12}/>多角度生成</div>
        <img className="bigimg" src={src || DEMO_IMG(22, 1200, 800)}
          style={{ transform: `perspective(800px) rotateY(${yaw}rad) rotateX(${-pitch}rad) scale(${1 - distance/400})` }}
        />
        <Gizmo3D yaw={yaw} pitch={pitch}/>

        <div className="tm-side">
          <h3>摄像机角度</h3>
          <div className="tm-row">
            <label>偏航</label>
            <input type="range" min="-180" max="180" value={Math.round(yaw*180/Math.PI)}
              onChange={e => { setYaw(e.target.value * Math.PI/180); setPreset(null); }}/>
            <span className="val">{Math.round(yaw*180/Math.PI)}°</span>
          </div>
          <div className="tm-row">
            <label>俯仰</label>
            <input type="range" min="-90" max="90" value={Math.round(pitch*180/Math.PI)}
              onChange={e => { setPitch(e.target.value * Math.PI/180); setPreset(null); }}/>
            <span className="val">{Math.round(pitch*180/Math.PI)}°</span>
          </div>
          <div className="tm-row">
            <label>焦距</label>
            <input type="range" min="14" max="135" value={fov} onChange={e => setFov(+e.target.value)}/>
            <span className="val">{fov}mm</span>
          </div>
          <div className="tm-row">
            <label>距离</label>
            <input type="range" min="0" max="100" value={distance} onChange={e => setDistance(+e.target.value)}/>
            <span className="val">{distance}%</span>
          </div>

          <h3 style={{marginTop:14}}>预设视角</h3>
          <div className="tm-preset-grid">
            {ANGLE_PRESETS.map(p => (
              <div key={p.id} className={`tm-preset ${preset===p.id?"active":""}`} onClick={() => apply(p)}>
                <Gizmo3D yaw={p.yaw} pitch={p.pitch}/>
                <span className="lbl">{p.lbl}</span>
              </div>
            ))}
          </div>

          <button className="tm-send" onClick={() => onApply?.({yaw, pitch, fov, distance})}>
            <ISparkle size={13}/> 应用角度生成
          </button>
        </div>
      </div>
    </ToolModal>
  );
}
