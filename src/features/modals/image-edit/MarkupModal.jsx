import React from 'react';
import { makeAssetUrl } from '../../../shared/platform/backendClient.js';
import { IClose, IImage, IMagic, ITrash, ISparkle } from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';

/* ─────────────────────────────────────────────────
 * MARKUP MODAL (figure 075) — box/brush + rewrite prompt
 * ───────────────────────────────────────────────── */
export function MarkupModal({ src, onClose, onApply }) {
  const [tool, setTool] = React.useState("box");  // box | brush | erase
  const [prompt, setPrompt] = React.useState("");
  const [boxes, setBoxes] = React.useState([]);
  const [paths, setPaths] = React.useState([]);
  const [drawing, setDrawing] = React.useState(null);
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [svgSize, setSvgSize] = React.useState({ w: 1, h: 1 });
  const svgRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const sourceSrc = typeof src === "string" ? src.trim() : "";
  const displaySrc = React.useMemo(() => (sourceSrc ? makeAssetUrl({ src: sourceSrc }) : ""), [sourceSrc]);
  const hasSource = Boolean(displaySrc || sourceSrc);

  React.useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSvgSize({ w: Math.max(1, Math.round(rect.width)), h: Math.max(1, Math.round(rect.height)) });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const svgPoint = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = svgPoint(e);
    if (tool === "box") setDrawing({ t: "box", x: p.x, y: p.y, w: 0, h: 0 });
    else if (tool === "brush") setDrawing({ t: "brush", points: [p] });
  };
  const onMove = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const p = svgPoint(e);
    if (drawing.t === "box") setDrawing({ ...drawing, w: p.x - drawing.x, h: p.y - drawing.y });
    else setDrawing({ ...drawing, points: [...drawing.points, p] });
  };
  const onUp = (e) => {
    if (!drawing) return;
    e?.currentTarget?.releasePointerCapture?.(e.pointerId);
    if (drawing.t === "box" && (Math.abs(drawing.w) > 6 && Math.abs(drawing.h) > 6)) {
      setBoxes(b => [...b, drawing]);
    } else if (drawing.t === "brush" && drawing.points.length > 3) {
      setPaths(p => [...p, drawing.points]);
    }
    setDrawing(null);
  };

  const imageRectInSvg = () => {
    if (!svgRef.current || !imgRef.current) return null;
    const svgRect = svgRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();
    const naturalWidth = imgRef.current.naturalWidth || imgRect.width;
    const naturalHeight = imgRef.current.naturalHeight || imgRect.height;
    if (!naturalWidth || !naturalHeight || !imgRect.width || !imgRect.height) return null;
    return {
      left: imgRect.left - svgRect.left,
      top: imgRect.top - svgRect.top,
      width: imgRect.width,
      height: imgRect.height,
      naturalWidth,
      naturalHeight,
    };
  };

  const createMaskDataUrl = () => {
    const rect = imageRectInSvg();
    if (!rect) throw new Error("图片尚未加载完成");
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.naturalWidth);
    canvas.height = Math.round(rect.naturalHeight);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const toMaskPoint = (point) => ({
      x: ((point.x - rect.left) / rect.width) * canvas.width,
      y: ((point.y - rect.top) / rect.height) * canvas.height,
    });
    const clearBox = (box) => {
      const p1 = toMaskPoint({ x: box.x, y: box.y });
      const p2 = toMaskPoint({ x: box.x + box.w, y: box.y + box.h });
      const x = Math.max(0, Math.min(p1.x, p2.x));
      const y = Math.max(0, Math.min(p1.y, p2.y));
      const w = Math.min(canvas.width, Math.max(p1.x, p2.x)) - x;
      const h = Math.min(canvas.height, Math.max(p1.y, p2.y)) - y;
      if (w > 1 && h > 1) ctx.clearRect(x, y, w, h);
    };
    const clearPath = (points) => {
      if (!Array.isArray(points) || points.length < 2) return;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = Math.max(14, Math.round(Math.min(canvas.width, canvas.height) * 0.035));
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      points.map(toMaskPoint).forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.restore();
    };

    boxes.forEach(clearBox);
    paths.forEach(clearPath);
    return canvas.toDataURL("image/png");
  };

  const handleApply = async () => {
    const cleanPrompt = prompt.trim() || "只修改标记区域，保持未标记区域、构图和主体一致。";
    if (!hasSource) {
      setStatus("请先选择或连接图片");
      return;
    }
    if (!boxes.length && !paths.length) {
      setStatus("请先框选或涂抹要修改的区域");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const maskImage = createMaskDataUrl();
      await onApply?.({
        boxes,
        paths,
        prompt: cleanPrompt,
        maskImage,
        sourceImage: displaySrc || sourceSrc,
        maskMode: "transparent-edit-area",
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose}><IClose size={16}/></button>
      <span className="sep"/>
      <button className="active" title="标注"><IMagic size={15}/><span className="tip">标注涂鸦</span></button>
    </div>
  );

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tm-stage mk-stage">
        <div className="label">标注涂鸦</div>
        <div className="mk-canvas">
          {hasSource ? (
            <>
              <img ref={imgRef} className="bg" src={displaySrc || sourceSrc} alt=""/>
              <svg
                ref={svgRef}
                className="mk-svg interactive"
                width="100%"
                height="100%"
                viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                <rect className="mk-hit" x="0" y="0" width={svgSize.w} height={svgSize.h} fill="transparent"/>
                {boxes.map((b, i) => (
                  <rect key={i}
                    x={Math.min(b.x, b.x+b.w)} y={Math.min(b.y, b.y+b.h)}
                    width={Math.abs(b.w)} height={Math.abs(b.h)}
                    fill="rgba(79,212,254,0.18)" stroke="#4FD4FE" strokeWidth="1.5" strokeDasharray="4 3"
                  />
                ))}
                {paths.map((pts, i) => (
                  <polyline key={i}
                    points={pts.map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none" stroke="#4FD4FE" strokeWidth="6"
                    strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                ))}
                {drawing?.t === "box" && (
                  <rect
                    x={Math.min(drawing.x, drawing.x + drawing.w)}
                    y={Math.min(drawing.y, drawing.y + drawing.h)}
                    width={Math.abs(drawing.w)} height={Math.abs(drawing.h)}
                    fill="rgba(79,212,254,0.15)" stroke="#4FD4FE" strokeWidth="1.5" strokeDasharray="4 3"
                  />
                )}
                {drawing?.t === "brush" && (
                  <polyline points={drawing.points.map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none" stroke="#4FD4FE" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                )}
              </svg>
              <div className="mk-tools">
                <button className={tool==="box"?"active":""} onClick={() => setTool("box")} title="框选">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="4" y="4" width="16" height="16" strokeDasharray="3 2"/>
                  </svg>
                </button>
                <button className={tool==="brush"?"active":""} onClick={() => setTool("brush")} title="画笔">
                  <IMagic size={15}/>
                </button>
                <button onClick={() => { setBoxes([]); setPaths([]); }} title="清除">
                  <ITrash size={15}/>
                </button>
              </div>
            </>
          ) : (
            <div className="mk-empty">
              <IImage size={32}/>
              <strong>请先选择或连接图片</strong>
              <span>空图片节点不会再显示默认示例图</span>
            </div>
          )}
        </div>
        <div className="mk-prompt">
          <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="输入指令：例如 '把人物换成女性警官'"/>
          {status && <span className="mk-status">{status}</span>}
          <button onClick={handleApply} disabled={busy || !hasSource}>
            <ISparkle size={13}/>{busy ? "提交中" : "应用"}
          </button>
        </div>
      </div>
    </ToolModal>
  );
}
