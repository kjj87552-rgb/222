import React from 'react';
import { createPortal } from 'react-dom';
import {
  IArrow,
  ICopy,
  IFolder,
  IHistory,
  IImage,
  ISearch,
  ITrash,
  IVideo,
} from '../../shared/ui/icons/index.jsx';
import { canvasActions, canvasStore, useProject } from '../../shared/store/canvasStore.js';
import { libraryActions, useHistory } from '../../shared/store/libraryStore.js';
import { uiActions } from '../../shared/store/uiStore.js';
import { makeAssetRecord } from '../../shared/utils/asset.js';
import { withLibraryFlag, withProjectAssetScope } from '../../shared/utils/assetScopes.js';
import { safeFileName, triggerDownload } from '../../shared/utils/file.js';
import { createCanvasNodeFromHistoryItem } from '../../shared/utils/historyCanvasNode.js';
import {
  historyKindOf,
  historyMediaSrc,
  historyProjectId,
  isGeneratedHistoryRecord,
  normalizeHistoryStatus,
} from '../../shared/utils/history.js';

const HISTORY_TABS = [
  ['all', '全部'],
  ['image', '图片'],
  ['video', '视频'],
];

const VISIBLE_HISTORY_KINDS = new Set(['image', 'video']);
const HISTORY_MENU_WIDTH = 184;
const HISTORY_MENU_ESTIMATED_HEIGHT = 230;
const HISTORY_MENU_VIEWPORT_MARGIN = 8;

function resolveHistoryMenuPortalTarget() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('.product-shell') || document.body;
}

const typeLabel = (kind) => ({
  image: '图片',
  video: '视频',
}[kind] || '素材');

const typeIcon = (kind, size = 18) => {
  const Icon = kind === 'video' ? IVideo : IImage;
  return <Icon size={size} />;
};

const historyTimeLabel = (item) => {
  const value = item?.updatedAt || item?.createdAt || item?.time || '';
  if (!value) return '刚刚';
  const text = String(value);
  if (!text.includes('T')) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
};

const statusLabel = (status) => ({
  generating: '生成中',
  completed: '已完成',
  failed: '失败',
  canceled: '已取消',
}[normalizeHistoryStatus(status)] || '已记录');

function displayText(value, fallback = '') {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    return [
      value.displayName,
      value.modelName,
      value.name,
      value.id,
      value.title,
    ].find((item) => typeof item === 'string' && item.trim()) || fallback;
  }
  return fallback;
}

function historyModelLabel(item) {
  return displayText(item?.model)
    || displayText(item?.modelName)
    || displayText(item?.provider)
    || statusLabel(item?.status);
}

const nodeFromHistoryItem = (item, index, nodes) => createCanvasNodeFromHistoryItem(item, { index, nodes });

function saveHistoryItemToProjectAsset(item, projectId) {
  const kind = historyKindOf(item);
  const src = historyMediaSrc(item);
  if (!src || kind !== 'image') return null;
  const record = withLibraryFlag(withProjectAssetScope(makeAssetRecord({
    kind,
    src,
    url: src,
    title: item.title || item.prompt || '历史图片',
    source: 'canvas.save.project',
    prompt: item.prompt,
    assetId: item.assetId,
    assetPath: item.assetPath || item.path,
    nodeId: item.nodeId,
  }), projectId));
  libraryActions.recordAssets([record]);
  return record;
}

function previewModalItemFromHistory(item) {
  const kind = historyKindOf(item);
  const src = historyMediaSrc(item);
  const title = item.title || item.prompt || `${typeLabel(kind)}历史`;
  if (!src && kind !== 'text') return null;
  return {
    ...item,
    title,
    mediaKind: kind,
    src,
    text: item.text || item.body || item.prompt || title,
  };
}

function clampMenuCoordinate(value, size, viewportSize) {
  if (!Number.isFinite(value)) return HISTORY_MENU_VIEWPORT_MARGIN;
  const max = Math.max(HISTORY_MENU_VIEWPORT_MARGIN, viewportSize - size - HISTORY_MENU_VIEWPORT_MARGIN);
  return Math.min(Math.max(value, HISTORY_MENU_VIEWPORT_MARGIN), max);
}

function resolveHistoryMenuPosition(x, y) {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  return {
    x: clampMenuCoordinate(Number(x), HISTORY_MENU_WIDTH, viewportWidth),
    y: clampMenuCoordinate(Number(y), HISTORY_MENU_ESTIMATED_HEIGHT, viewportHeight),
  };
}

const HistoryPreview = React.memo(function HistoryPreview({ item }) {
  const kind = historyKindOf(item);
  const src = historyMediaSrc(item);
  const status = normalizeHistoryStatus(item.status);
  const progress = Math.max(0, Math.min(100, Number(item.progress) || (status === 'completed' ? 100 : 0)));
  const poster = item.poster || item.posterUrl || item.thumbnailUrl || '';
  const [mediaFailed, setMediaFailed] = React.useState(false);

  React.useEffect(() => {
    setMediaFailed(false);
  }, [src, poster]);

  if (kind === 'image' && src && !mediaFailed) {
    return <img src={src} alt="" loading="lazy" onError={() => setMediaFailed(true)} />;
  }
  if (kind === 'video' && src && !mediaFailed) {
    return <video src={src} poster={poster || undefined} muted loop playsInline preload="metadata" onError={() => setMediaFailed(true)} />;
  }
  return (
    <div className="rail-history-placeholder">
      {typeIcon(kind, 20)}
      <span>{statusLabel(status)}</span>
      {status === 'generating' && <i style={{ width: `${progress}%` }} />}
    </div>
  );
});

const HistoryCard = React.memo(function HistoryCard({ item, active, onOpen, onContextMenu }) {
  const kind = historyKindOf(item);
  const title = item.prompt || item.title || typeLabel(kind);
  const error = item.errorMsg || item.error || '';
  const meta = historyModelLabel(item);

  return (
    <button
      type="button"
      className={`rail-history-card ${kind} ${active ? 'active' : ''}`.trim()}
      onClick={() => onOpen(item)}
      onContextMenu={(event) => onContextMenu(event, item)}
      title={title}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('application/json', JSON.stringify({
          type: 'history-item',
          id: item.id,
        }));
        event.dataTransfer.effectAllowed = 'copy';
      }}
    >
      <span className="rail-history-kind">{typeLabel(kind)}</span>
      <span className="rail-history-preview">
        <HistoryPreview item={item} />
      </span>
      <span className="rail-history-copy">
        <strong>{title}</strong>
        <em>{historyTimeLabel(item)} · {meta}</em>
        {normalizeHistoryStatus(item.status) === 'failed' && error && <small>{String(error).slice(0, 80)}</small>}
      </span>
    </button>
  );
});

function HistoryContextMenu({
  menu,
  onClose,
  onUseToCanvas,
  onSaveAsset,
  onDelete,
}) {
  React.useEffect(() => {
    if (!menu) return undefined;
    const close = () => onClose();
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    const timer = window.setTimeout(() => document.addEventListener('pointerdown', close), 0);
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu, onClose]);

  if (!menu?.item) return null;
  const item = menu.item;
  const src = historyMediaSrc(item);
  const kind = historyKindOf(item);

  const copySource = async () => {
    if (!src) return;
    try {
      await navigator.clipboard?.writeText(src);
    } catch (_) {
      /* Clipboard may be unavailable in embedded previews. */
    }
    onClose();
  };

  const download = () => {
    if (!src) return;
    const ext = kind === 'video' ? 'mp4' : kind === 'audio' ? 'mp3' : 'png';
    triggerDownload({
      src,
      filename: `${safeFileName(item.title || item.prompt || `${typeLabel(kind)}历史`)}.${ext}`,
    });
    onClose();
  };

  const position = resolveHistoryMenuPosition(menu.x, menu.y);
  const menuNode = (
    <div
      className="rail-history-menu"
      style={{ position: 'fixed', left: position.x, top: position.y }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="rail-history-menu-title">操作</div>
      <button type="button" onClick={() => onUseToCanvas(item)}>
        <IArrow size={14} />使用到画布
      </button>
      {kind === 'image' && (
        <button type="button" onClick={() => onSaveAsset(item)}>
          <IFolder size={14} />保存到项目素材
        </button>
      )}
      <button type="button" onClick={copySource} disabled={!src}>
        <ICopy size={14} />复制链接
      </button>
      <button type="button" onClick={download} disabled={!src}>
        <IArrow size={14} />下载
      </button>
      <div className="rail-history-menu-divider" />
      <button type="button" className="danger" onClick={() => onDelete(item)}>
        <ITrash size={14} />删除
      </button>
    </div>
  );

  const portalTarget = resolveHistoryMenuPortalTarget();
  return portalTarget ? createPortal(menuNode, portalTarget) : menuNode;
}

export function HistoryRailPanel({ onClose, onOpenOverlay, onUseHistoryItem }) {
  const history = useHistory();
  const project = useProject();
  const [activeTab, setActiveTab] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [previewItem, setPreviewItem] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState(null);
  const projectId = project?.id || '';

  const projectHistory = React.useMemo(() => (
    history.filter((item) => {
      const kind = historyKindOf(item);
      return (
        VISIBLE_HISTORY_KINDS.has(kind)
        && isGeneratedHistoryRecord(item)
        && (!projectId || historyProjectId(item) === String(projectId))
      );
    })
  ), [history, projectId]);

  const counts = React.useMemo(() => {
    const next = { all: projectHistory.length, image: 0, video: 0 };
    projectHistory.forEach((item) => {
      const kind = historyKindOf(item);
      if (next[kind] !== undefined) next[kind] += 1;
    });
    return next;
  }, [projectHistory]);

  const items = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projectHistory.filter((item) => {
      const kind = historyKindOf(item);
      if (activeTab !== 'all' && kind !== activeTab) return false;
      if (!needle) return true;
      return [
        item.prompt,
        item.title,
        item.model,
        item.modelName,
        item.provider,
        item.errorMsg,
      ].some((value) => String(value || '').toLowerCase().includes(needle));
    }).slice(0, 80);
  }, [projectHistory, activeTab, query]);

  const openPreview = React.useCallback((item) => {
    setPreviewItem(item);
    const previewItem = previewModalItemFromHistory(item);
    if (!previewItem) return;
    uiActions.openModal({
      kind: 'preview',
      item: previewItem,
    });
  }, []);

  const useToCanvas = React.useCallback((item) => {
    const src = historyMediaSrc(item);
    if (!src && historyKindOf(item) !== 'text') return;
    if (onUseHistoryItem) {
      onUseHistoryItem(item);
      setContextMenu(null);
      onClose?.();
      return;
    }
    const nodes = canvasStore.getState().nodes || [];
    const node = nodeFromHistoryItem(item, 0, nodes);
    canvasActions.setNodes((current) => [...current, node]);
    uiActions.setSelection([node.id]);
    setContextMenu(null);
    onClose?.();
  }, [onClose, onUseHistoryItem]);

  const saveAsset = React.useCallback((item) => {
    saveHistoryItemToProjectAsset(item, projectId || 'local-default');
    setContextMenu(null);
  }, [projectId]);

  const deleteItem = React.useCallback((item) => {
    if (!item?.id) return;
    if (!window.confirm(`确定删除这条${typeLabel(historyKindOf(item))}历史吗？`)) return;
    libraryActions.removeHistoryItem(item.id);
    setContextMenu(null);
  }, []);

  const openContextMenu = React.useCallback((event, item) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      item,
    });
  }, []);

  return (
    <>
      <div className="rail-history-panel">
        <div className="rail-history-head">
          <div>
            <strong>生成历史</strong>
            <span>{project?.name || '当前项目'}</span>
          </div>
          <button type="button" onClick={() => onOpenOverlay?.('history')} title="批量管理">
            <IHistory size={13} />
          </button>
        </div>

        <div className="rail-history-tabs">
          {HISTORY_TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={activeTab === key ? 'active' : ''}
              onClick={() => setActiveTab(key)}
            >
              {label} {counts[key] || 0}
            </button>
          ))}
        </div>

        <div className="rail-history-search">
          <ISearch size={12} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索 Prompt / 模型"
          />
        </div>

        <div className="rail-history-list">
          {items.length ? items.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              active={previewItem?.id === item.id}
              onOpen={openPreview}
              onContextMenu={openContextMenu}
            />
          )) : (
            <div className="rail-history-empty">
              <IHistory size={18} />
              <span>{activeTab === 'all' ? '暂无生成历史' : `暂无${typeLabel(activeTab)}记录`}</span>
            </div>
          )}
        </div>
      </div>

      <HistoryContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        onUseToCanvas={useToCanvas}
        onSaveAsset={saveAsset}
        onDelete={deleteItem}
      />
    </>
  );
}
