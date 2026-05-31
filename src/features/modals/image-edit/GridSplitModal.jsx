import React from 'react';
import { IClose, ICheck, ISparkle } from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

/* ─────────────────────────────────────────────────────────
 * GRID SPLIT MODAL — pick slices, send to generator (072–074)
 * ───────────────────────────────────────────────────────── */
export function GridSplitModal({ src, onClose, onSend }) {
  const [grid, setGrid] = React.useState(9); // 4 | 9 | 16 | 25
  const [picked, setPicked] = React.useState(new Set());

  const n = Math.sqrt(grid);
  const toggle = (i) => setPicked(s => { const c = new Set(s); c.has(i) ? c.delete(i) : c.add(i); return c; });

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose}><IClose size={16}/></button>
      <span className="sep"/>
      {[4, 9, 16, 25].map(g => (
        <button key={g} className={grid===g?"active":""} onClick={() => { setGrid(g); setPicked(new Set()); }}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:11}}>{g}宫</span>
        </button>
      ))}
      <span className="sep"/>
      <button title="全选" onClick={() => setPicked(new Set(Array.from({length:grid}, (_,i) => i)))}>
        <ICheck size={14}/><span className="tip">全选</span>
      </button>
      <button title="反选" onClick={() => setPicked(s => new Set(Array.from({length:grid}, (_,i) => i).filter(i => !s.has(i))))}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="4" width="16" height="16" rx="1"/>
          <path d="M4 4l16 16" strokeDasharray="2 2"/>
        </svg>
        <span className="tip">反选</span>
      </button>
    </div>
  );

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tm-stage">
        <div className="label">宫格切分 · {grid} 宫格 · 已选 {picked.size}</div>
        <img className="bigimg" src={src || DEMO_IMG(22, 1200, 800)}/>
        <div className="tm-grid-overlay cell-hover">
          {Array.from({length: grid}, (_, i) => {
            const r = Math.floor(i / n), c = i % n;
            return (
              <div key={i}
                className={`cell ${picked.has(i)?"selected":""}`}
                onClick={() => toggle(i)}
                style={{
                  left: `${(c/n)*100}%`, top: `${(r/n)*100}%`,
                  width: `${100/n}%`, height: `${100/n}%`,
                }}
              >
                <span style={{
                  position:"absolute", top:6, left:8,
                  fontFamily:"var(--font-mono)", fontSize:11, color:"#fff",
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                }}>{String(i+1).padStart(2,"0")}</span>
              </div>
            );
          })}
          {/* grid lines */}
          {Array.from({length: n-1}, (_, i) => (
            <React.Fragment key={i}>
              <div className="gl" style={{left:`${((i+1)/n)*100}%`, top:0, bottom:0, width:1.5, background:"rgba(255,255,255,0.6)"}}/>
              <div className="gl" style={{top:`${((i+1)/n)*100}%`, left:0, right:0, height:1.5, background:"rgba(255,255,255,0.6)"}}/>
            </React.Fragment>
          ))}
        </div>
        <button className="stage-btn" style={{ right: 16, bottom: 16, background:"var(--accent)", color:"var(--paper)", border:"none", padding:"10px 18px", fontWeight:700 }}
          onClick={() => onSend?.(Array.from(picked), grid)}
          disabled={!picked.size}>
          <ISparkle size={13}/> 发送 {picked.size} 个切片到生成器
        </button>
      </div>
    </ToolModal>
  );
}
