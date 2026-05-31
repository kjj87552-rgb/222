import React from 'react';
import { makeAssetUrl } from '../../../shared/platform/backendClient.js';
import { JobStore } from '../../../shared/platform/jobStore.js';
import {
  IArrow,
  ICheck,
  IClose,
  ICrop,
  IGrid9,
  IImage,
  IMagic,
  ISparkle,
  IText,
  ITrash,
  IUndo,
  IZoomIn,
} from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { resolveToolImageCandidates, toolImageSourceKey } from './toolImageSource.js';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ffffff', '#111827'];
const ASPECTS = [
  { label: '自由', value: 0 },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
];
const UPSCALE_MODEL_BY_TYPE = {
  general: 'realesrgan-x4plus',
  portrait: 'realesrgan-x4plus',
  anime: 'realesrgan-x4plus-anime',
};
const UPSCALE_TYPE_OPTIONS = [
  { key: 'general', label: '通用' },
  { key: 'portrait', label: '人像' },
  { key: 'anime', label: '动漫' },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function useToolImage(source) {
  const [state, setState] = React.useState({ image: null, url: '', error: '' });
  const sourceKey = toolImageSourceKey(source);

  React.useEffect(() => {
    const candidates = resolveToolImageCandidates(source);
    if (!candidates.length) {
      setState({ image: null, url: '', error: '图片地址为空' });
      return undefined;
    }
    let cancelled = false;

    const loadCandidate = (index) => {
      const candidate = candidates[index];
      if (!candidate) {
        if (!cancelled) setState({ image: null, url: '', error: '图片加载失败' });
        return;
      }
      const image = new Image();
      if (candidate.crossOrigin) image.crossOrigin = candidate.crossOrigin;
      image.onload = () => {
        if (!cancelled) setState({ image, url: candidate.url, error: '' });
      };
      image.onerror = () => {
        if (!cancelled) loadCandidate(index + 1);
      };
      image.src = candidate.url;
    };

    setState({ image: null, url: candidates[0].url, error: '' });
    loadCandidate(0);
    return () => {
      cancelled = true;
    };
  }, [sourceKey]);

  return state;
}

function fitSize(image, maxW = 780, maxH = 560) {
  if (!image) return { scale: 1, w: 0, h: 0 };
  const scale = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight, 1);
  return {
    scale,
    w: Math.round(image.naturalWidth * scale),
    h: Math.round(image.naturalHeight * scale),
  };
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function normalizeUpscaleOutput(output, fallbackTitle) {
  if (!output) return null;
  const asset = output.asset || {};
  const merged = {
    ...asset,
    id: output.assetId || asset.id,
    kind: output.assetKind || asset.kind || 'image',
    title: output.title || asset.title || fallbackTitle || '高清放大结果',
    path: output.assetPath || asset.path,
    mime: output.mime || asset.mime || 'image/png',
    assetUrl: output.assetUrl || asset.assetUrl || output.url,
    url: output.url || output.assetUrl || asset.url || asset.assetUrl,
    source: asset.source || 'job.upscale',
    engine: output.engine || asset.engine,
    scale: output.scale || asset.scale,
    model: output.model || asset.model,
    sourceAssetId: output.sourceAssetId || asset.sourceAssetId,
    sourceNodeId: output.sourceNodeId || asset.sourceNodeId,
  };
  const src = makeAssetUrl(merged);
  return src ? { ...merged, src, url: src } : merged;
}

function upscaleStageText(stage, status) {
  if (status === 'queued') return '排队中';
  if (stage === 'resolved-provider') return '准备本地放大';
  if (stage === 'realesrgan-start') return 'Real-ESRGAN 处理中';
  if (stage === 'realesrgan-finished') return 'Real-ESRGAN 已完成';
  if (stage === 'lanczos-start') return '本地兜底放大中';
  if (stage === 'lanczos-finished') return '本地兜底已完成';
  if (status === 'running') return '处理中';
  return '';
}

function ToolLoading({ error }) {
  return (
    <div className="cit-loading">
      {error || '加载中...'}
    </div>
  );
}

function ToolShell({ title, icon, onClose, children, footer }) {
  return (
    <ToolModal
      onClose={onClose}
      toolbar={(
        <div className="tm-toolbar">
          <button className="close-btn" onClick={onClose} title="关闭"><IClose size={16}/></button>
          <span className="sep"/>
          <strong className="cit-title">{icon}{title}</strong>
        </div>
      )}
    >
      <div className="cit-panel">
        {children}
        {footer && <div className="cit-footer">{footer}</div>}
      </div>
    </ToolModal>
  );
}

function imagePointFromEvent(event, frameRef, image, scale) {
  const rect = frameRef.current?.getBoundingClientRect();
  if (!rect || !image) return null;
  return {
    x: clamp((event.clientX - rect.left) / scale, 0, image.naturalWidth),
    y: clamp((event.clientY - rect.top) / scale, 0, image.naturalHeight),
  };
}

function normalizeCrop(start, current, image, aspect) {
  let dx = current.x - start.x;
  let dy = current.y - start.y;
  if (aspect > 0 && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
    const signX = dx >= 0 ? 1 : -1;
    const signY = dy >= 0 ? 1 : -1;
    let absW = Math.abs(dx);
    let absH = Math.abs(dy);
    if (!absH || absW / absH > aspect) absH = absW / aspect;
    else absW = absH * aspect;
    dx = absW * signX;
    dy = absH * signY;
  }
  const x1 = clamp(start.x, 0, image.naturalWidth);
  const y1 = clamp(start.y, 0, image.naturalHeight);
  const x2 = clamp(start.x + dx, 0, image.naturalWidth);
  const y2 = clamp(start.y + dy, 0, image.naturalHeight);
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
  };
}

export function ImageCropToolModal({ src, assetId, assetPath, assetUrl, imageUrl, localPath, path, onClose, onApply }) {
  const { image, url, error } = useToolImage({ src, assetId, assetPath, assetUrl, imageUrl, localPath, path });
  const frameRef = React.useRef(null);
  const [aspect, setAspect] = React.useState(0);
  const [crop, setCrop] = React.useState(null);
  const [dragStart, setDragStart] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const fit = fitSize(image);

  const startCrop = (event) => {
    if (event.button !== 0 || !image) return;
    event.preventDefault();
    const point = imagePointFromEvent(event, frameRef, image, fit.scale);
    if (!point) return;
    setDragStart(point);
    setCrop({ x: point.x, y: point.y, w: 0, h: 0 });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const updateCrop = (event) => {
    if (!dragStart || !image) return;
    event.preventDefault();
    const point = imagePointFromEvent(event, frameRef, image, fit.scale);
    if (point) setCrop(normalizeCrop(dragStart, point, image, aspect));
  };

  const finishCrop = (event) => {
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
    setDragStart(null);
  };

  const applyCrop = async () => {
    if (!image || !crop || crop.w < 2 || crop.h < 2 || busy) return;
    setBusy(true);
    const canvas = document.createElement('canvas');
    const w = Math.round(crop.w);
    const h = Math.round(crop.h);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, Math.round(crop.x), Math.round(crop.y), w, h, 0, 0, w, h);
    await onApply?.({ label: '裁剪', dataUrl: canvas.toDataURL('image/png'), width: w, height: h });
    setBusy(false);
    onClose?.();
  };

  if (!image) {
    return (
      <ToolShell title="裁剪" icon={<ICrop size={15}/>} onClose={onClose}>
        <ToolLoading error={error}/>
      </ToolShell>
    );
  }

  return (
    <ToolShell
      title="裁剪"
      icon={<ICrop size={15}/>}
      onClose={onClose}
      footer={(
        <>
          <span className="cit-meta">选区 {Math.round(crop?.w || 0)} × {Math.round(crop?.h || 0)}</span>
          <button className="x-btn ghost" onClick={() => setCrop(null)}>重选</button>
          <button className="x-btn primary" onClick={applyCrop} disabled={!crop || crop.w < 2 || crop.h < 2 || busy}>
            <ICheck size={13}/>{busy ? '处理中' : '应用'}
          </button>
        </>
      )}
    >
      <div className="cit-work">
        <div
          ref={frameRef}
          className="cit-image-frame"
          style={{ width: fit.w, height: fit.h }}
          onPointerDown={startCrop}
          onPointerMove={updateCrop}
          onPointerUp={finishCrop}
          onPointerCancel={finishCrop}
        >
          <img src={url} alt="" draggable="false"/>
          <div className="cit-crop-dim"/>
          {crop && (
            <div
              className="cit-crop-box"
              style={{
                left: crop.x * fit.scale,
                top: crop.y * fit.scale,
                width: crop.w * fit.scale,
                height: crop.h * fit.scale,
              }}
            />
          )}
        </div>
        <aside className="cit-side">
          <strong>比例</strong>
          {ASPECTS.map((item) => (
            <button
              key={item.label}
              className={aspect === item.value ? 'active' : ''}
              onClick={() => setAspect(item.value)}
            >
              {item.label}
            </button>
          ))}
        </aside>
      </div>
    </ToolShell>
  );
}

const ANNOTATE_TOOLS = [
  { key: 'pen', label: '画笔', icon: IMagic },
  { key: 'arrow', label: '箭头', icon: IArrow },
  { key: 'rect', label: '矩形', icon: ICrop },
  { key: 'text', label: '文字', icon: IText },
  { key: 'eraser', label: '橡皮', icon: ITrash },
];

export function ImageAnnotateToolModal({ src, assetId, assetPath, assetUrl, imageUrl, localPath, path, onClose, onApply }) {
  const { image, url, error } = useToolImage({ src, assetId, assetPath, assetUrl, imageUrl, localPath, path });
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const [tool, setTool] = React.useState('pen');
  const [color, setColor] = React.useState('#ef4444');
  const [lineWidth, setLineWidth] = React.useState(4);
  const [drawing, setDrawing] = React.useState(null);
  const [history, setHistory] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const fit = fitSize(image);

  React.useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  }, [image]);

  const pushHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory((items) => [...items.slice(-12), canvas.toDataURL('image/png')]);
  };

  const restoreLast = () => {
    const last = history[history.length - 1];
    if (!last || !canvasRef.current) return;
    const imageData = new Image();
    imageData.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(imageData, 0, 0);
    };
    imageData.src = last;
    setHistory((items) => items.slice(0, -1));
  };

  const point = (event) => imagePointFromEvent(event, frameRef, image, fit.scale);

  const drawText = (event) => {
    const text = window.prompt('输入标注文字');
    if (!text || !canvasRef.current) return;
    const p = point(event);
    if (!p) return;
    pushHistory();
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = `${Math.max(18, lineWidth * 7)}px sans-serif`;
    ctx.fillText(text, p.x, p.y);
  };

  const onPointerDown = (event) => {
    if (!image || event.button !== 0) return;
    event.preventDefault();
    const p = point(event);
    if (!p) return;
    if (tool === 'text') {
      drawText(event);
      return;
    }
    pushHistory();
    setDrawing({ start: p, last: p });
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.strokeStyle = color;
    if (tool === 'pen' || tool === 'eraser') {
      if (tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!drawing || !canvasRef.current) return;
    const p = point(event);
    if (!p) return;
    const ctx = canvasRef.current.getContext('2d');
    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    setDrawing((current) => ({ ...current, last: p }));
  };

  const onPointerUp = (event) => {
    if (!drawing || !canvasRef.current) return;
    const p = point(event) || drawing.last;
    const ctx = canvasRef.current.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (tool === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(drawing.start.x, drawing.start.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      const angle = Math.atan2(p.y - drawing.start.y, p.x - drawing.start.x);
      const head = Math.max(12, lineWidth * 4);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - head * Math.cos(angle - Math.PI / 6), p.y - head * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - head * Math.cos(angle + Math.PI / 6), p.y - head * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
    if (tool === 'rect') {
      ctx.strokeRect(drawing.start.x, drawing.start.y, p.x - drawing.start.x, p.y - drawing.start.y);
    }
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
    setDrawing(null);
  };

  const clear = () => {
    if (!canvasRef.current) return;
    pushHistory();
    canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const apply = async () => {
    if (!image || !canvasRef.current || busy) return;
    setBusy(true);
    const out = document.createElement('canvas');
    out.width = image.naturalWidth;
    out.height = image.naturalHeight;
    const ctx = out.getContext('2d');
    ctx.drawImage(image, 0, 0);
    ctx.drawImage(canvasRef.current, 0, 0);
    await onApply?.({ label: '标注', dataUrl: out.toDataURL('image/png'), width: out.width, height: out.height });
    setBusy(false);
    onClose?.();
  };

  if (!image) {
    return (
      <ToolShell title="标注" icon={<IMagic size={15}/>} onClose={onClose}>
        <ToolLoading error={error}/>
      </ToolShell>
    );
  }

  return (
    <ToolShell
      title="标注"
      icon={<IMagic size={15}/>}
      onClose={onClose}
      footer={(
        <>
          <span className="cit-meta">{image.naturalWidth} × {image.naturalHeight}</span>
          <button className="x-btn ghost" onClick={restoreLast} disabled={!history.length}><IUndo size={13}/>撤销</button>
          <button className="x-btn ghost" onClick={clear}><ITrash size={13}/>清空</button>
          <button className="x-btn primary" onClick={apply} disabled={busy}><ICheck size={13}/>{busy ? '处理中' : '应用'}</button>
        </>
      )}
    >
      <div className="cit-work">
        <div ref={frameRef} className="cit-image-frame" style={{ width: fit.w, height: fit.h }}>
          <img src={url} alt="" draggable="false"/>
          <canvas
            ref={canvasRef}
            className="cit-draw-canvas"
            style={{ width: fit.w, height: fit.h }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </div>
        <aside className="cit-side">
          <strong>工具</strong>
          {ANNOTATE_TOOLS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={tool === item.key ? 'active' : ''} onClick={() => setTool(item.key)}>
                <Icon size={13}/>{item.label}
              </button>
            );
          })}
          <strong>颜色</strong>
          <div className="cit-colors">
            {COLORS.map((item) => (
              <button
                key={item}
                className={color === item ? 'active' : ''}
                style={{ background: item }}
                onClick={() => setColor(item)}
                title={item}
              />
            ))}
          </div>
          <strong>线宽 {lineWidth}px</strong>
          <input type="range" min="1" max="14" value={lineWidth} onChange={(event) => setLineWidth(Number(event.target.value))}/>
        </aside>
      </div>
    </ToolShell>
  );
}

export function ImageSplitToolModal({ src, assetId, assetPath, assetUrl, imageUrl, localPath, path, onClose, onApply }) {
  const { image, url, error } = useToolImage({ src, assetId, assetPath, assetUrl, imageUrl, localPath, path });
  const [rows, setRows] = React.useState(2);
  const [cols, setCols] = React.useState(2);
  const [busy, setBusy] = React.useState(false);
  const fit = fitSize(image);

  const apply = async () => {
    if (!image || busy) return;
    setBusy(true);
    const cellW = Math.floor(image.naturalWidth / cols);
    const cellH = Math.floor(image.naturalHeight / rows);
    const results = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = c * cellW;
        const y = r * cellH;
        const w = c === cols - 1 ? image.naturalWidth - x : cellW;
        const h = r === rows - 1 ? image.naturalHeight - y : cellH;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(image, x, y, w, h, 0, 0, w, h);
        results.push({ label: `切割 ${r + 1}-${c + 1}`, dataUrl: canvas.toDataURL('image/png'), width: w, height: h });
      }
    }
    await onApply?.({ label: '切割', results, cols });
    setBusy(false);
    onClose?.();
  };

  if (!image) {
    return (
      <ToolShell title="切割" icon={<IGrid9 size={15}/>} onClose={onClose}>
        <ToolLoading error={error}/>
      </ToolShell>
    );
  }

  return (
    <ToolShell
      title="切割"
      icon={<IGrid9 size={15}/>}
      onClose={onClose}
      footer={(
        <>
          <span className="cit-meta">{rows} × {cols} = {rows * cols} 张</span>
          <button className="x-btn primary" onClick={apply} disabled={busy}><IGrid9 size={13}/>{busy ? '切割中' : '生成切片'}</button>
        </>
      )}
    >
      <div className="cit-work">
        <div className="cit-image-frame" style={{ width: fit.w, height: fit.h }}>
          <img src={url} alt="" draggable="false"/>
          <div
            className="cit-grid-overlay"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(79,212,254,.85) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(79,212,254,.85) 1px, transparent 1px)
              `,
              backgroundSize: `${100 / cols}% ${100 / rows}%`,
            }}
          />
        </div>
        <aside className="cit-side">
          <strong>快速预设</strong>
          {[
            [2, 2],
            [3, 3],
            [2, 3],
            [3, 4],
          ].map(([r, c]) => (
            <button key={`${r}-${c}`} className={rows === r && cols === c ? 'active' : ''} onClick={() => { setRows(r); setCols(c); }}>
              {r}×{c}
            </button>
          ))}
          <strong>行数</strong>
          <input type="range" min="1" max="6" value={rows} onChange={(event) => setRows(Number(event.target.value))}/>
          <strong>列数</strong>
          <input type="range" min="1" max="6" value={cols} onChange={(event) => setCols(Number(event.target.value))}/>
        </aside>
      </div>
    </ToolShell>
  );
}

export function ImageUpscaleToolModal({
  src,
  nodeId,
  assetId,
  assetPath,
  assetUrl,
  imageUrl,
  localPath,
  path,
  projectId,
  title,
  onClose,
  onApply,
}) {
  const { image, url, error } = useToolImage({ src, assetId, assetPath, assetUrl, imageUrl, localPath, path });
  const [scale, setScale] = React.useState(2);
  const [contentType, setContentType] = React.useState('general');
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [statusText, setStatusText] = React.useState('');
  const [jobError, setJobError] = React.useState('');

  const apply = async () => {
    if (!image || busy) return;
    setBusy(true);
    setProgress(1);
    setStatusText('提交后端任务');
    setJobError('');
    try {
      if (!JobStore.available()) {
        throw new Error('后端任务服务不可用，无法进行高清放大');
      }
      const job = await JobStore.create(null, {
        projectId,
        type: 'image.upscale',
        _canvasImageTool: 'imageupscale',
        providerModelId: 'local.upscale.realesrgan',
        title: `${title || '画布图片'} · 放大 ${scale}x`,
        assetId,
        assetPath,
        assetUrl: assetId ? `/assets/${assetId}` : undefined,
        imageUrl: src,
        src,
        sourceNodeId: nodeId,
        nodeId,
        scale,
        contentType,
        upscaleModel: UPSCALE_MODEL_BY_TYPE[contentType] || UPSCALE_MODEL_BY_TYPE.general,
      });
      let current = job;
      for (let index = 0; index < 480; index += 1) {
        if (current?.status === 'completed') break;
        if (current?.status === 'failed') {
          throw new Error(current.error || '高清放大失败');
        }
        const nextProgress = Math.max(1, Math.min(99, Number(current?.progress) || 1));
        setProgress(nextProgress);
        setStatusText(upscaleStageText(current?.output?.stage, current?.status));
        await sleep(750);
        current = await JobStore.get(job.id);
      }
      if (current?.status !== 'completed') {
        throw new Error('高清放大任务超时，请稍后在历史或资产库中检查结果');
      }
      const outputAsset = normalizeUpscaleOutput(current.output, `${title || '画布图片'} · 放大 ${scale}x`);
      if (!outputAsset?.src && !outputAsset?.url && !outputAsset?.assetUrl && !outputAsset?.id) {
        throw new Error('高清放大完成但未返回本地资产');
      }
      setProgress(100);
      setStatusText(current.output?.engine || '已完成');
      await onApply?.({
        label: `放大 ${scale}x`,
        width: image.naturalWidth * scale,
        height: image.naturalHeight * scale,
        src: outputAsset.src || outputAsset.url || outputAsset.assetUrl,
        url: outputAsset.url || outputAsset.src || outputAsset.assetUrl,
        assetUrl: outputAsset.assetUrl,
        assetId: outputAsset.id,
        assetPath: outputAsset.path,
        mime: outputAsset.mime,
        engine: outputAsset.engine || current.output?.engine,
        scale: outputAsset.scale || scale,
        model: outputAsset.model || current.output?.model,
        source: outputAsset.source || 'job.upscale',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setJobError(message || '高清放大失败');
      setBusy(false);
      setStatusText('');
      setProgress(0);
    }
  };

  if (!image) {
    return (
      <ToolShell title="放大" icon={<IZoomIn size={15}/>} onClose={onClose}>
        <ToolLoading error={error}/>
      </ToolShell>
    );
  }

  return (
    <ToolShell
      title="放大"
      icon={<IZoomIn size={15}/>}
      onClose={onClose}
      footer={(
        <>
          <span className="cit-meta">{image.naturalWidth} × {image.naturalHeight} → {image.naturalWidth * scale} × {image.naturalHeight * scale}</span>
          <button className="x-btn primary" onClick={apply} disabled={busy}><ISparkle size={13}/>{busy ? '处理中' : '生成放大图'}</button>
        </>
      )}
    >
      <div className="cit-upscale">
        <div className="cit-upscale-preview"><img src={url} alt="" draggable="false"/></div>
        <div className="cit-upscale-options">
          <IImage size={28}/>
          <strong>选择放大倍数</strong>
          <div>
            {[2, 4].map((item) => (
              <button key={item} className={scale === item ? 'active' : ''} onClick={() => setScale(item)} disabled={busy}>{item}x</button>
            ))}
          </div>
          <strong>内容类型</strong>
          <div className="cit-upscale-types">
            {UPSCALE_TYPE_OPTIONS.map((item) => (
              <button key={item.key} className={contentType === item.key ? 'active' : ''} onClick={() => setContentType(item.key)} disabled={busy}>{item.label}</button>
            ))}
          </div>
          {(busy || jobError) && (
            <div className="cit-upscale-status">
              {busy && <progress value={progress} max="100"/>}
              <span>{jobError || `${statusText || '处理中'} · ${progress}%`}</span>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
