/**
 * Shared internal components used by all per-type Node files:
 *   NodeShell  — visual wrapper (header, body, footer, handles, toolbar)
 *   TryMenu    — empty-state prompt list
 *   TbBtn      — toolbar button helper
 *
 * These are not exported as public API; import them only from within
 * src/features/nodes/.
 */
import React from 'react';
import { useRegisterCanvasElement } from '../canvas/canvasElementRegistry.js';
import { IImage, IVideo, IAudio, IText, IScript, IFilm, IPano, ISparkle, IEye } from '../../shared/ui/icons/index.jsx';

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function finiteCssNumber(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNodePositionTransform(x, y) {
  return `translate3d(${finiteCssNumber(x, 0)}px, ${finiteCssNumber(y, 0)}px, 0)`;
}

export function NodeShell({
  node,
  selected,
  onPointerDown,
  onStartEdge,
  onResizeStart,
  onSelect,
  children,
  toolbar,
  isEmpty,
  onContextMenu,
  onDoubleClick,
  alwaysShowToolbar = false,
}) {
  const nodeElementRef = useRegisterCanvasElement('nodes', node?.id);
  const nodeType = compactString(node?.type) || 'text';
  const title = compactString(node?.title) || '未命名节点';
  const model = compactString(node?.model);
  const duration = compactString(node?.duration);
  const frameStyle = {
    left: 0,
    top: 0,
    width: finiteCssNumber(node?.w, 320),
    height: finiteCssNumber(node?.h, 220),
    transform: formatNodePositionTransform(node?.x, node?.y),
  };
  const KindIcon = {
    image: IImage, video: IVideo, audio: IAudio, text: IText, script: IScript,
    'director-stage': IFilm, 'vr720-gen': ISparkle, 'panorama.generate': ISparkle,
    'panorama-viewer': IPano, 'panorama.viewer': IPano, 'asset-gen': ISparkle,
    'jianying-export': IFilm, 'jianying.export': IFilm,
    'storyboard-collector-detail': IFilm, 'storyboard.collector': IFilm,
    'prompt-runner': ISparkle, 'prompt.runner': ISparkle,
  }[nodeType] || IText;

  return (
    <div
      ref={nodeElementRef}
      className={`node ${nodeType} ${selected?"selected":""} ${isEmpty?"empty":""}`}
      data-node-id={node.id}
      style={frameStyle}
      onPointerDown={(e) => {
        e.stopPropagation();
        // Selection and multi-node drag are handled by Canvas so one store path owns it.
        onPointerDown?.(e, node.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault(); e.stopPropagation();
        if (!selected) onSelect?.(node.id, false);
        onContextMenu?.(e, node);
      }}
      onDoubleClick={onDoubleClick}
    >
      <div className="node-head">
        <span className="kind-icon"><KindIcon size={13} sw={1.6}/></span>
        <span className="title">{title}</span>
      </div>
      <div className="node-body">{children}</div>
      {!isEmpty && (model || duration) && (
        <div className="node-foot">
          {model && <span>{model}</span>}
          {duration && <span className="dur">{duration}</span>}
        </div>
      )}
      <div className="handle l" onPointerDown={(e)=>{ e.stopPropagation(); onStartEdge?.(e, node.id, "in"); }}><span>+</span></div>
      <div className="handle r" onPointerDown={(e)=>{ e.stopPropagation(); onStartEdge?.(e, node.id, "out"); }}><span>+</span></div>
      <div
        className="node-resize"
        title="缩放节点"
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect?.(node.id, false);
          onResizeStart?.(e, node.id);
        }}
      />
      {(selected || alwaysShowToolbar) && toolbar}
    </div>
  );
}

export function NodeBlankState({ icon, title, description, tone = '' }) {
  return (
    <div className={`node-blank-state ${tone ? `tone-${tone}` : ''}`}>
      <div className="node-blank-preview" aria-label={title}>
        <span className="node-blank-icon">{icon}</span>
        <span className="node-blank-copy">
          <strong>{title}</strong>
          {description && <em>{description}</em>}
        </span>
      </div>
    </div>
  );
}

export function MediaPreviewButton({ title = '预览', onClick }) {
  const label = `放大预览 ${compactString(title) || '媒体'}`;
  return (
    <button
      type="button"
      className="media-node-preview-button"
      aria-label={label}
      title="放大预览"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
    >
      <IEye size={16} sw={1.8}/>
    </button>
  );
}

/* Try-menu used in empty states (figures 003, 005, 007, 009) */
export function TryMenu({ items, onUpload, uploadLabel = "上传" }) {
  return (
    <div className="node-empty">
      {onUpload && (
        <button className="empty-up" onPointerDown={(e)=>e.stopPropagation()} onClick={onUpload}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          {uploadLabel}
        </button>
      )}
      <div className="empty-icon">
        {items.icon ? items.icon : null}
      </div>
      <div className="try-label">尝试：</div>
      <div className="try-list">
        {items.list.map((it, i) => (
          <div
            key={i}
            className={`try-item ${it.disabled ? "disabled" : ""}`}
            onPointerDown={(e)=>e.stopPropagation()}
            onClick={() => {
              if (it.disabled) return;
              it.onClick?.();
            }}
          >
            <span className="ti-ic">{it.icon}</span>
            <span>{it.label}</span>
            {it.disabled && <span className="try-soon">soon</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Toolbar item helper */
export function TbBtn({ icon, label, onClick, danger }) {
  return (
    <button className={danger?"danger":""} onClick={onClick}>
      {React.createElement(icon, { size: 13 })}
      {label && <span>{label}</span>}
    </button>
  );
}
