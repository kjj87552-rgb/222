import React from 'react';
import { IClose, ICut, ICheck, IPlay, IPause, IArrow } from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

export function VideoClipModal({ src, onClose, onApply }) {
  const total = 17.5; // demo duration in seconds
  const [io, setIO] = React.useState({ inP: 3.2, outP: 12.8 });
  const [time, setTime] = React.useState(io.inP);
  const [playing, setPlaying] = React.useState(false);
  const [drag, setDrag] = React.useState(null);
  const trackRef = React.useRef(null);

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTime(t => t > io.outP ? io.inP : t + 0.05), 50);
    return () => clearInterval(id);
  }, [playing, io]);

  const fmt = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(Math.floor(s % 60)).padStart(2, "0");
    const cs = String(Math.floor((s % 1) * 100)).padStart(2, "0");
    return `${mm}:${ss}.${cs}`;
  };

  const onHandleDown = (which) => (e) => {
    e.preventDefault(); e.stopPropagation();
    setDrag(which);
    const onMove = (ev) => {
      const r = trackRef.current.getBoundingClientRect();
      const t = ((ev.clientX - r.left) / r.width) * total;
      const clamped = Math.max(0, Math.min(total, t));
      setIO(io => {
        if (which === "in")  return { ...io, inP:  Math.min(clamped, io.outP - 0.5) };
        if (which === "out") return { ...io, outP: Math.max(clamped, io.inP + 0.5) };
        return io;
      });
    };
    const onUp = () => {
      setDrag(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // keyboard shortcuts I (inpoint), O (outpoint), J/L (back/forward)
  React.useEffect(() => {
    const h = (e) => {
      if (e.key === "i" || e.key === "I") setIO(io => ({ ...io, inP: time }));
      else if (e.key === "o" || e.key === "O") setIO(io => ({ ...io, outP: time }));
      else if (e.key === "j" || e.key === "J") setTime(t => Math.max(0, t - 0.5));
      else if (e.key === "l" || e.key === "L") setTime(t => Math.min(total, t + 0.5));
      else if (e.key === " ") { e.preventDefault(); setPlaying(p => !p); }
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [time, onClose]);

  const playheadPct = (time / total) * 100;
  const cutLeft = (io.inP / total) * 100;
  const cutRight = (io.outP / total) * 100;
  const dur = io.outP - io.inP;

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose}><IClose size={16}/></button>
      <span className="sep"/>
      <button className="active"><ICut size={15}/><span className="tip">视频剪辑</span></button>
      <button onClick={() => onApply?.({ inP: io.inP, outP: io.outP })}><ICheck size={15}/><span className="tip">确认裁剪</span></button>
    </div>
  );

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tool-modal vc-modal" style={{position:"absolute", inset:0, width:"100%", height:"100%"}}>
        <div className="tm-stage" style={{display:"flex", flexDirection:"column"}}>
          <div className="vc-preview">
            <div className="frame" style={{ backgroundImage: `url(${(src || DEMO_IMG(33, 1280, 720))})` }}>
              <div className="play-disc">{!playing && <div className="disc"><IPlay size={28}/></div>}</div>
            </div>
          </div>

          <div className="vc-tools">
            <button className="play-btn" onClick={() => setPlaying(p => !p)}>
              {playing ? <IPause size={14}/> : <IPlay size={14}/>}
            </button>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>{fmt(time)} / {fmt(total)}</span>
            <span className="clip-pill">入 {fmt(io.inP)}</span>
            <span className="clip-pill">出 {fmt(io.outP)}</span>
            <span className="clip-pill" style={{ color: "var(--accent)" }}>时长 {fmt(dur)}</span>
            <div className="right">
              <button className="x-btn ghost" onClick={() => setIO(io => ({ ...io, inP: time }))}><IArrow size={11} style={{ transform: "rotate(180deg)" }}/>设入点 (I)</button>
              <button className="x-btn ghost" onClick={() => setIO(io => ({ ...io, outP: time }))}>设出点 (O) <IArrow size={11}/></button>
              <button className="out-btn" onClick={() => onApply?.({ inP: io.inP, outP: io.outP })}><ICheck size={12}/>导出片段</button>
            </div>
          </div>

          <div className="vc-track" ref={trackRef}>
            <div className="vc-frames">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="thumb" style={{ backgroundImage: `url(${DEMO_IMG(33 + i*3, 96, 54)})` }}/>
              ))}
            </div>
            <div className="vc-cut-overlay" style={{ left: `calc(18px + ${cutLeft}% - ${cutLeft*0.18}px)`, right: `calc(18px + ${100-cutRight}% - ${(100-cutRight)*0.18}px)` }}/>
            <div className="vc-handle l" style={{ left: `calc(18px + ${cutLeft}% - ${cutLeft*0.18}px - 12px)` }}
              onPointerDown={onHandleDown("in")}>I</div>
            <div className="vc-handle r" style={{ left: `calc(18px + ${cutRight}% - ${cutRight*0.18}px)` }}
              onPointerDown={onHandleDown("out")}>O</div>
            <div className="vc-playhead" style={{ left: `calc(18px + ${playheadPct}% - ${playheadPct*0.18}px)` }}/>
          </div>

          <div className="vc-shortcuts">
            <div className="sc"><span>设入点</span><span className="k"><span>I</span></span></div>
            <div className="sc"><span>设出点</span><span className="k"><span>O</span></span></div>
            <div className="sc"><span>后退一帧</span><span className="k"><span>J</span></span></div>
            <div className="sc"><span>前进一帧</span><span className="k"><span>L</span></span></div>
            <div className="sc"><span>播放/暂停</span><span className="k"><span>Space</span></span></div>
            <div className="sc"><span>精确模式</span><span className="k"><span>Shift</span> + 滚轮</span></div>
            <div className="sc"><span>移动选区</span><span className="k">← / →</span></div>
            <div className="sc"><span>扩展/收缩</span><span className="k"><span>[</span> / <span>]</span></span></div>
          </div>
        </div>
      </div>
    </ToolModal>
  );
}
