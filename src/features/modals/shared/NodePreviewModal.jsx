import React from 'react';
import { makeAssetUrl } from '../../../shared/platform/backendClient.js';
import { IClose } from '../../../shared/ui/icons/index.jsx';

function mediaKindLabel(item) {
  const kind = item?.mediaKind || item?.kind || 'media';
  if (kind === 'image') return 'IMAGE';
  if (kind === 'video') return 'VIDEO';
  if (kind === 'audio') return 'AUDIO';
  if (kind === 'text' || kind === 'script') return 'TEXT';
  return String(kind).toUpperCase();
}

const IMAGE_PREVIEW_MIN_SCALE = 0.25;
const IMAGE_PREVIEW_MAX_SCALE = 8;
const IMAGE_PREVIEW_DEFAULT_VIEW = { scale: 1, x: 0, y: 0 };

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function getNextImagePreviewZoom(view, rect, clientX, clientY, deltaY) {
  const width = Number(rect?.width) || 0;
  const height = Number(rect?.height) || 0;
  if (!width || !height || !Number.isFinite(deltaY) || deltaY === 0) return view;
  const scale = Number(view?.scale) || 1;
  const nextScale = clampNumber(
    scale * clampNumber(Math.exp(-deltaY * 0.002), 0.72, 1.38),
    IMAGE_PREVIEW_MIN_SCALE,
    IMAGE_PREVIEW_MAX_SCALE,
  );
  if (nextScale === scale) return view;
  const pointerX = clampNumber((Number(clientX) || 0) - (Number(rect?.left) || 0), 0, width) - width / 2;
  const pointerY = clampNumber((Number(clientY) || 0) - (Number(rect?.top) || 0), 0, height) - height / 2;
  const imageX = (pointerX - (Number(view?.x) || 0)) / scale;
  const imageY = (pointerY - (Number(view?.y) || 0)) / scale;
  return {
    scale: nextScale,
    x: pointerX - imageX * nextScale,
    y: pointerY - imageY * nextScale,
  };
}

function formatImagePreviewTransform(view) {
  const x = Number(view?.x) || 0;
  const y = Number(view?.y) || 0;
  const scale = Number(view?.scale) || 1;
  return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
}

function ImagePreviewViewer({ item }) {
  const src = makeAssetUrl({ ...item, id: item.assetId || item.id });
  const viewerRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const [view, setView] = React.useState(IMAGE_PREVIEW_DEFAULT_VIEW);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    setView(IMAGE_PREVIEW_DEFAULT_VIEW);
    dragRef.current = null;
    setDragging(false);
  }, [src]);

  const handleWheel = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = viewerRef.current?.getBoundingClientRect?.();
    setView((current) => getNextImagePreviewZoom(current, rect, event.clientX, event.clientY, event.deltaY));
  }, []);

  React.useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;
    viewer.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewer.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handlePointerDown = React.useCallback((event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: view.x,
      y: view.y,
    };
    setDragging(true);
  }, [view.x, view.y]);

  const handlePointerMove = React.useCallback((event) => {
    const drag = dragRef.current;
    if (!drag) return;
    event.preventDefault();
    event.stopPropagation();
    setView((current) => ({
      ...current,
      x: drag.x + event.clientX - drag.clientX,
      y: drag.y + event.clientY - drag.clientY,
    }));
  }, []);

  const finishDrag = React.useCallback((event) => {
    const drag = dragRef.current;
    if (!drag) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.currentTarget?.releasePointerCapture?.(drag.pointerId);
    dragRef.current = null;
    setDragging(false);
  }, []);

  const resetView = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setView(IMAGE_PREVIEW_DEFAULT_VIEW);
  }, []);

  return (
    <div
      ref={viewerRef}
      className={`media-preview-image-viewer ${dragging ? 'dragging' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onDoubleClick={resetView}
    >
      <img
        className="media-preview-zoomable-image"
        src={src}
        alt=""
        draggable="false"
        style={{ transform: formatImagePreviewTransform(view) }}
      />
    </div>
  );
}

function renderPreviewContent(item) {
  if (item.mediaKind === 'image') {
    return <ImagePreviewViewer item={item}/>;
  }
  if (item.mediaKind === 'video') {
    return <video src={makeAssetUrl({ ...item, id: item.assetId || item.id })} controls playsInline/>;
  }
  if (item.mediaKind === 'audio') {
    return <audio src={makeAssetUrl({ ...item, id: item.assetId || item.id })} controls/>;
  }
  if (item.mediaKind === 'text') {
    return (
      <div className="media-preview-text">
        <strong>{item.title || '文本预览'}</strong>
        <p>{item.text || ''}</p>
      </div>
    );
  }
  return null;
}

export function NodePreviewModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="media-preview-backdrop" role="presentation" onPointerDown={onClose}>
      <div
        className={`media-preview-dialog media-preview-${item.mediaKind || item.kind || 'media'}`}
        role="dialog"
        aria-modal="true"
        aria-label={`预览 ${item.title || '媒体'}`}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="media-preview-head">
          <div>
            <span>{mediaKindLabel(item)}</span>
            <strong>{item.title || '预览'}</strong>
          </div>
          <button type="button" className="media-preview-close" aria-label="关闭预览" onClick={onClose}>
            <IClose size={15}/>
          </button>
        </div>
        <div className={`media-preview-stage ${item.mediaKind === 'image' ? 'is-image-preview' : ''}`}>
          {renderPreviewContent(item)}
        </div>
      </div>
    </div>
  );
}
