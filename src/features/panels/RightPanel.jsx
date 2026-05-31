/* Canvas utilities — CanvasTip, ZoomCtl, ShortcutsModal, ContextMenu */

import React from 'react';
import {
  IZoomOut,
  IZoomIn,
  IKey,
  IClose,
} from '../../shared/ui/icons/index.jsx';
import { SHORTCUTS } from '../../shared/data/workflows.js';

export function CanvasTip() {
  return (
    <div className="canvas-tip">
      <div className="bubble">
        <span className="cyan">✱</span>
        <span>双击画布 <span style={{color:"var(--ink-mute)"}}>自由生成节点</span></span>
      </div>
    </div>
  );
}

export function ZoomCtl({ scale, onZoom, onFit }) {
  return (
    <div className="zoomctl">
      <button title="缩小" onClick={()=>onZoom(-0.1)}><IZoomOut size={13}/></button>
      <span className="pct" onClick={onFit}>{Math.round(scale*100)}%</span>
      <button title="放大" onClick={()=>onZoom(0.1)}><IZoomIn size={13}/></button>
    </div>
  );
}

export function ShortcutsModal({ onClose }) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <header>
          <IKey size={16}/>
          <h2>快捷键</h2>
          <button className="close" onClick={onClose}><IClose size={14}/></button>
        </header>
        <div className="body">
          <div className="kb-grid">
            {SHORTCUTS.map(g => (
              <div className="kb-group" key={g.g}>
                <h4>{g.g}</h4>
                {g.items.map(([k,d]) => (
                  <div className="kb-row" key={k+d}>
                    <span className="desc">{d}</span>
                    <span className="keys">{k.split(" ").map((x,i) => x==="+"||x==="/" ? <React.Fragment key={i}> {x} </React.Fragment> : <span key={i}>{x}</span>)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContextMenu({ x, y, items, onClose }) {
  React.useEffect(() => {
    const h = () => onClose();
    setTimeout(() => window.addEventListener("pointerdown", h, { once:true }), 0);
    return () => window.removeEventListener("pointerdown", h);
  }, [onClose]);
  // Clamp to viewport
  const style = { left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 380) };
  return (
    <div className="ctxmenu" style={style} onPointerDown={e=>e.stopPropagation()}>
      {items.map((it,i) => {
        if (it.sep) return <div className="sep" key={i}/>;
        if (it.sub) return <div className="sub" key={i}>{it.sub}</div>;
        return (
          <div
            className={`item ${it.danger?"danger":""} ${it.disabled?"disabled":""}`}
            key={i}
            onClick={()=>{
              if (it.disabled) return;
              it.onClick?.();
              onClose();
            }}
          >
            {it.icon && <span className="ic">{React.createElement(it.icon, { size:13 })}</span>}
            <span className="label">{it.label}</span>
            {it.shortcut && <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--ink-mute)"}}>{it.shortcut}</span>}
            {it.badge && <span className="badge">{it.badge}</span>}
          </div>
        );
      })}
    </div>
  );
}
