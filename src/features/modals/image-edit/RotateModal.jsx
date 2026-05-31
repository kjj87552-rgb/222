import React from 'react';
import { IClose, ICheck, ISparkle } from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

/* ─────────────────────────────────────────────────────────
 * ROTATE / MIRROR MODAL (076–078)
 * ───────────────────────────────────────────────────────── */
export function RotateModal({ src, onClose, onApply }) {
  const [angle, setAngle] = React.useState(0);
  const [flipH, setFlipH] = React.useState(false);
  const [flipV, setFlipV] = React.useState(false);

  const quick = (a) => setAngle(((angle + a) % 360 + 360) % 360);

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose}><IClose size={16}/></button>
      <span className="sep"/>
      <button onClick={() => quick(-90)} title="左旋 90°">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 12a9 9 0 019-9v4"/><path d="M12 3l3 3-3 3"/>
        </svg>
      </button>
      <button onClick={() => quick(90)} title="右旋 90°">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 12a9 9 0 00-9-9v4"/><path d="M12 3l-3 3 3 3"/>
        </svg>
      </button>
      <button onClick={() => setAngle(a => (a+180)%360)} title="180°">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 12a9 9 0 1018 0"/><path d="M3 12l3-3M3 12l3 3"/>
        </svg>
      </button>
      <span className="sep"/>
      <button className={flipH?"active":""} onClick={() => setFlipH(v=>!v)} title="水平镜像">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3v18"/><path d="M6 8l-3 4 3 4" fill="currentColor" fillOpacity=".3"/>
          <path d="M18 8l3 4-3 4"/>
        </svg>
      </button>
      <button className={flipV?"active":""} onClick={() => setFlipV(v=>!v)} title="垂直镜像">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 12h18"/><path d="M8 6l4-3 4 3" fill="currentColor" fillOpacity=".3"/>
          <path d="M8 18l4 3 4-3"/>
        </svg>
      </button>
    </div>
  );

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tm-stage" style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
        <div className="label">旋转 & 镜像</div>
        <img src={src || DEMO_IMG(22, 800, 600)} style={{
          maxWidth:"70%", maxHeight:"70%", objectFit:"contain",
          transform: `rotate(${angle}deg) scale(${flipH?-1:1}, ${flipV?-1:1})`,
          transition: "transform .2s",
        }}/>
        <div className="tm-side" style={{right:18, bottom:18, width: 200}}>
          <h3>旋转角度</h3>
          <div className="tm-dial" style={{"--angle": angle+"deg"}}>
            <div className="knob"/>
            <div className="tm-dial-val">{angle}°</div>
          </div>
          <input type="range" min="0" max="359" value={angle} onChange={e => setAngle(+e.target.value)}
            style={{width:"100%", accentColor:"var(--accent)"}}/>
          <button className="tm-send" onClick={() => onApply?.({angle, flipH, flipV})}>
            <ICheck size={13}/> 应用
          </button>
        </div>
      </div>
    </ToolModal>
  );
}
