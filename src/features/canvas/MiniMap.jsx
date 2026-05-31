import React, { useContext } from 'react';
import { ViewportContext } from './ViewportContext.js';
import { useNodes } from '../../shared/store/canvasStore.js';
import { IMap } from '../../shared/ui/icons/index.jsx';

function stopCanvasGesture(event) {
  event.preventDefault();
  event.stopPropagation();
}

export const MiniMap = React.memo(function MiniMap() {
  const [open, setOpen] = React.useState(false);
  const ignoreNextClickRef = React.useRef(false);

  const toggleOpen = (event) => {
    stopCanvasGesture(event);
    setOpen((value) => !value);
  };

  const toggleOpenFromPointer = (event) => {
    ignoreNextClickRef.current = true;
    window.setTimeout(() => {
      ignoreNextClickRef.current = false;
    }, 1200);
    toggleOpen(event);
  };

  const toggleOpenFromClick = (event) => {
    stopCanvasGesture(event);
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }
    setOpen((value) => !value);
  };

  return (
    <div className={`minimap ${open ? "open" : "closed"}`} onPointerDown={(event) => event.stopPropagation()}>
      {open && <MiniMapPanel />}
      <button
        type="button"
        className={`minimap-toggle minimap-toggle-closed ${open ? "active" : ""}`}
        aria-label={open ? "收起小地图" : "展开小地图"}
        title={open ? "收起小地图" : "展开小地图"}
        aria-pressed={open ? "true" : "false"}
        onPointerDown={toggleOpenFromPointer}
        onClick={toggleOpenFromClick}
      >
        <IMap size={16} />
      </button>
    </div>
  );
});

function MiniMapPanel() {
  const ctx = useContext(ViewportContext);
  const view = ctx?.view;
  const api = ctx?.api;
  const nodes = useNodes();

  const W = 188, H = 118;

  // World bounds — pad with viewport so the map shows where you currently are
  const viewX = view?.x ?? 0;
  const viewY = view?.y ?? 0;
  const viewScale = view?.s ?? 1;

  const allXs = [...nodes.map(n => n.x), ...nodes.map(n => n.x + n.w), viewX, viewX + W / viewScale];
  const allYs = [...nodes.map(n => n.y), ...nodes.map(n => n.y + n.h), viewY, viewY + H / viewScale];
  const minX = Math.min(...allXs) - 80;
  const minY = Math.min(...allYs) - 80;
  const maxX = Math.max(...allXs) + 80;
  const maxY = Math.max(...allYs) + 80;
  const wx = Math.max(maxX - minX, 1200);
  const wy = Math.max(maxY - minY, 800);
  const sx = W / wx, sy = H / wy;
  const s = Math.min(sx, sy);
  // Center the map content in available area
  const offX = (W - wx * s) / 2;
  const offY = (H - wy * s) / 2;

  const project = (x, y) => ({ left: offX + (x - minX) * s, top: offY + (y - minY) * s });
  const compactNodes = nodes.length >= 80;

  const handleMapPointerDown = (e) => {
    stopCanvasGesture(e);
    const r = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    const wx2 = (cx - offX) / s + minX;
    const wy2 = (cy - offY) / s + minY;
    api?.set({ x: wx2, y: wy2, s: viewScale });
  };

  // Viewport rect in world coords (approximate from current view)
  const vpW = W / viewScale;
  const vpH = H / viewScale;

  return (
    <div className="minimap-panel">
      <div className="minimap-head">
        <span>小地图</span>
      </div>
      <div className={`map-canvas ${compactNodes ? 'compact' : ''}`} onPointerDown={handleMapPointerDown}>
        <span className="map-readout">{Math.round(viewScale * 100)}% · {nodes.length} 节点</span>
        {nodes.map(n => {
          const rawWidth = Math.max(2, n.w * s);
          const rawHeight = Math.max(2, n.h * s);
          const compactWidth = n.type === 'video' ? 8 : n.type === 'asset-gen' || n.type === 'script' ? 6 : 5;
          const compactHeight = 4;
          const center = compactNodes ? project(n.x + n.w / 2, n.y + n.h / 2) : null;
          const p = compactNodes ? center : project(n.x, n.y);
          const width = compactNodes ? compactWidth : Math.min(42, rawWidth);
          const height = compactNodes ? compactHeight : Math.min(28, rawHeight);
          return (
            <span key={n.id}
              className={`map-node ${n.type}`}
              style={{
                left: compactNodes ? p.left - width / 2 : p.left,
                top: compactNodes ? p.top - height / 2 : p.top,
                width,
                height,
              }}
            />
          );
        })}
        {(() => {
          const p = project(viewX, viewY);
          return (
            <span className="map-vp" style={{
              left: p.left, top: p.top,
              width: Math.max(8, vpW * s),
              height: Math.max(6, vpH * s),
            }}/>
          );
        })()}
      </div>
    </div>
  );
}
