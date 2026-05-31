import React from 'react';
import { IClose, ICamera, IGrid9, IMove, IPano, IArrow } from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { Gizmo3D } from '../shared/Gizmo3D.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

/* ─────────────────────────────────────────────────────────
 * 720° PANORAMA MODAL  (figures 053–061)
 * ───────────────────────────────────────────────────────── */
export function PanoModal({ src, onClose, onCapture, onFourView, onTwelveView, onReset, onSplit }) {
  const [mode, setMode] = React.useState("view");  // view | capture | four | twelve | reset | grid
  const [showGuide, setShowGuide] = React.useState(false);
  const [offset, setOffset] = React.useState(50); // 0-100, maps to bg-position-x
  const [pitch, setPitch] = React.useState(0);
  const [drag, setDrag] = React.useState(false);

  const onPanDown = (e) => {
    e.preventDefault();
    setDrag(true);
    const sx = e.clientX, sy = e.clientY;
    const s0 = offset, p0 = pitch;
    const mv = (ev) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      setOffset(Math.max(0, Math.min(100, s0 + dx * -0.12)));
      setPitch(Math.max(-0.4, Math.min(0.4, p0 + dy * 0.003)));
    };
    const up = () => {
      setDrag(false);
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  };

  const bgUrl = src || DEMO_IMG(500, 2400, 800);

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose} title="关闭"><IClose size={16}/><span className="tip">关闭</span></button>
      <span className="sep"/>
      <button className={mode==="capture"?"active":""} onClick={() => { setMode("capture"); onCapture?.(); }}><ICamera size={15}/><span className="tip">当前视角截图</span></button>
      <button className={mode==="four"?"active":""} onClick={() => { setMode("four"); onFourView?.(); }}><IGrid9 size={15}/><span className="tip">4大视角</span></button>
      <button className={mode==="twelve"?"active":""} onClick={() => { setMode("twelve"); onTwelveView?.(); }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="1"/>
          <path d="M7 3v18M11 3v18M15 3v18M19 3v18M3 7h18M3 11h18M3 15h18M3 19h18"/>
        </svg>
        <span className="tip">12大视角</span>
      </button>
      <button onClick={() => { setMode("reset"); setOffset(50); setPitch(0); onReset?.(); }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 12a9 9 0 1015-6.7"/><path d="M18 3v5h-5"/>
        </svg>
        <span className="tip">重置视角</span>
      </button>
      <button className={showGuide?"active":""} onClick={() => setShowGuide(v => !v)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="4" width="16" height="16"/>
          <path d="M4 10h16M4 14h16M10 4v16M14 4v16"/>
        </svg>
        <span className="tip">构图参考线</span>
      </button>
      <button onClick={() => onSplit?.()}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 12h18M12 3v18"/><rect x="3" y="3" width="18" height="18"/>
        </svg>
        <span className="tip">宫格切分</span>
      </button>
      <span className="sep"/>
      <button title="全屏"><IMove size={15}/><span className="tip">全屏</span></button>
    </div>
  );

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tm-stage">
        <div className="label"><IPano size={12}/>720° 全景预览</div>
        <div className="dim">6336 × 2688</div>
        <div
          className={`tm-pano-surface ${drag?"dragging":""}`}
          onPointerDown={onPanDown}
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundPositionX: `${offset}%`,
            backgroundPositionY: `${50 + pitch*80}%`,
          }}
        />
        {showGuide && (
          <div className="tm-grid-overlay">
            <div className="gl" style={{left:"33.3%", top:0, bottom:0, width:1}}/>
            <div className="gl" style={{left:"66.6%", top:0, bottom:0, width:1}}/>
            <div className="gl" style={{top:"33.3%", left:0, right:0, height:1}}/>
            <div className="gl" style={{top:"66.6%", left:0, right:0, height:1}}/>
          </div>
        )}
        <button className="stage-btn" style={{right:12, top:12}}>
          <IArrow size={13} style={{transform:"rotate(-45deg)"}}/> 退出全景
        </button>
        <Gizmo3D yaw={(offset-50) * Math.PI/100} pitch={pitch}/>
      </div>
    </ToolModal>
  );
}
