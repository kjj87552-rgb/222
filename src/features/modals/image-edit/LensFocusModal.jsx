import React from 'react';
import { IZoomIn, ISparkle } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

export function LensFocusModal({ src, onClose, onApply }) {
  const [box, setBox] = React.useState({ x: 30, y: 25, w: 30, h: 40 });
  const [drag, setDrag] = React.useState(null);
  const [prompt, setPrompt] = React.useState("人物面部细节特写，胶片质感，浅景深");
  const stageRef = React.useRef(null);

  const onPointerDown = (e) => {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setBox({ x, y, w: 0, h: 0 });
    setDrag({ ox: x, oy: y });
  };
  const onPointerMove = (e) => {
    if (!drag || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setBox({
      x: Math.min(drag.ox, x), y: Math.min(drag.oy, y),
      w: Math.abs(x - drag.ox), h: Math.abs(y - drag.oy),
    });
  };
  const onPointerUp = () => setDrag(null);

  const bgUrl = src || DEMO_IMG(22, 1200, 800);

  // for the close-up preview, derive a zoomed bg position
  const bgPosX = (box.x + box.w / 2);
  const bgPosY = (box.y + box.h / 2);

  return (
    <XModal title="镜头聚焦 · 特写生成" icon={<IZoomIn size={16}/>} onClose={onClose}
      className="lf-modal"
      footer={<>
        <span className="x-credit"><ISparkle size={11}/>消耗 4 算力</span>
        <span style={{ flex: 1 }}/>
        <button className="x-btn ghost" onClick={() => setBox({ x: 30, y: 25, w: 30, h: 40 })}>重置框选</button>
        <button className="x-btn primary" onClick={() => onApply?.({ box, prompt })}>
          <ISparkle size={12}/>生成特写分镜
        </button>
      </>}
    >
      <div className="lf-stage" ref={stageRef}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      >
        <img className="lens-img" src={bgUrl}/>
        <svg className="lf-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* darken outside region with 4 rects */}
          <rect className="lf-mask-around" x="0" y="0" width="100" height={box.y}/>
          <rect className="lf-mask-around" x="0" y={box.y + box.h} width="100" height={Math.max(0, 100 - box.y - box.h)}/>
          <rect className="lf-mask-around" x="0" y={box.y} width={box.x} height={box.h}/>
          <rect className="lf-mask-around" x={box.x + box.w} y={box.y} width={Math.max(0, 100 - box.x - box.w)} height={box.h}/>
          {/* selection */}
          <rect className="lf-rect" x={box.x} y={box.y} width={box.w} height={box.h} vectorEffect="non-scaling-stroke"/>
          {/* corner handles (visual only) */}
          {[[box.x, box.y], [box.x+box.w, box.y], [box.x, box.y+box.h], [box.x+box.w, box.y+box.h]].map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="0.7" fill="var(--accent)" vectorEffect="non-scaling-stroke"/>
          ))}
        </svg>
      </div>
      <div className="lf-side">
        <div>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>特写预览</h3>
          <div className="lf-preview" style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
          }}>
            <span className="pin">缩放 ×{Math.max(2, Math.round(100/Math.max(box.w, 5)))}</span>
          </div>
          <div className="lf-info" style={{ marginTop: 10 }}>
            <span>X · {Math.round(box.x)}%</span>
            <span>Y · {Math.round(box.y)}%</span>
            <span>W · {Math.round(box.w)}%</span>
            <span>H · {Math.round(box.h)}%</span>
          </div>
        </div>
        <div>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>特写描述</h3>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows="4"
            style={{
              width: "100%", padding: "10px 12px",
              background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: 8, outline: "none", resize: "vertical",
              color: "var(--ink)", fontSize: 12, fontFamily: "var(--font-body)",
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {["眼神", "面部", "手部", "材质", "光斑"].map(t => (
              <span key={t} style={{
                padding: "3px 9px", fontSize: 11,
                background: "var(--paper)", border: "1px solid var(--line-soft)",
                borderRadius: 999, cursor: "pointer", color: "var(--ink-soft)",
              }} onClick={() => setPrompt(p => p + " " + t)}>+ {t}</span>
            ))}
          </div>
        </div>
      </div>
    </XModal>
  );
}
