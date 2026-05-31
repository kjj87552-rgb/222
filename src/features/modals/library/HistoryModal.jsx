import React from 'react';
import {
  IHistory,
  ISearch,
  ICheck,
  ITrash,
  IArrow,
  IImage,
  IVideo,
  IEye,
  IClose,
} from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { libraryActions, useHistory } from '../../../shared/store/libraryStore.js';
import { canvasActions, useNodes, useProject } from '../../../shared/store/canvasStore.js';
import { HistoryStore } from '../../../shared/platform/historyStore.js';
import { safeFileName, triggerDownload } from '../../../shared/utils/file.js';
import { createCanvasNodeFromHistoryItem } from '../../../shared/utils/historyCanvasNode.js';
import {
  historyKindOf,
  historyMediaSrc,
  historyProjectId,
  isGeneratedHistoryRecord,
  normalizeHistoryStatus,
} from '../../../shared/utils/history.js';

const VISIBLE_HISTORY_KINDS = new Set(['image', 'video']);

function typeLabel(kind) {
  return { image: '图片', video: '视频' }[kind] || '素材';
}

function typeIcon(kind) {
  const Icon = kind === 'video' ? IVideo : IImage;
  return <Icon size={18} />;
}

function timeOf(item) {
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
}

function statusLabel(status) {
  return {
    generating: '生成中',
    completed: '已完成',
    failed: '失败',
    canceled: '已取消',
  }[normalizeHistoryStatus(status)] || '已记录';
}

function nodeFromHistoryItem(item, index, nodes) {
  return createCanvasNodeFromHistoryItem(item, { index, nodes });
}

function previewItemFromHistory(item) {
  const kind = historyKindOf(item);
  const src = historyMediaSrc(item);
  if (!src || !VISIBLE_HISTORY_KINDS.has(kind)) return null;
  return {
    id: item.id,
    kind,
    src,
    poster: item.poster || item.posterUrl || item.thumbnailUrl || '',
    title: item.prompt || item.title || typeLabel(kind),
    model: item.model || item.modelName || '',
    time: timeOf(item),
  };
}

function HistoryPreviewLightbox({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="hs-preview-lightbox" onPointerDown={(event) => {
      if (event.target.classList.contains('hs-preview-lightbox')) onClose();
    }}>
      <div className="hs-preview-stage" onPointerDown={(event) => event.stopPropagation()}>
        <div className="hs-preview-stage-head">
          <div>
            <strong>{item.title}</strong>
            <span>{typeLabel(item.kind)} · {item.model || item.time}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭预览">
            <IClose size={16} />
          </button>
        </div>
        <div className="hs-preview-stage-body">
          {item.kind === 'video' ? (
            <video src={item.src} poster={item.poster || undefined} controls playsInline autoPlay />
          ) : (
            <img src={item.src} alt="" />
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryCard({ item, picked, onToggle, onUse, onPreview }) {
  const kind = historyKindOf(item);
  const src = historyMediaSrc(item);
  const status = normalizeHistoryStatus(item.status);
  const progress = Math.max(0, Math.min(100, Number(item.progress) || (status === 'completed' ? 100 : 0)));
  const errorText = item.errorMsg || item.error || '';
  const title = item.prompt || item.title || typeLabel(kind);
  const canPreview = VISIBLE_HISTORY_KINDS.has(kind) && Boolean(src);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`hs-item ${kind} ${status} ${picked ? 'selected' : ''}`}
      onClick={() => onToggle(item.id)}
      onDoubleClick={() => onUse([item])}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle(item.id);
        }
      }}
      title={title}
    >
      <span className="checkbox">{picked && <ICheck size={12}/>}</span>
      <span className="kind-pill">{typeLabel(kind)}</span>
      <div className="hs-media-wrap">
        {kind === 'image' && src ? (
          <img className="hs-media" src={src} alt="" loading="lazy" />
        ) : kind === 'video' && src ? (
          <video className="hs-media" src={src} muted loop playsInline preload="metadata" />
        ) : (
          <div className="hs-placeholder">
            {typeIcon(kind)}
            <span>{statusLabel(status)}</span>
          </div>
        )}
      </div>
      {canPreview && (
        <button
          type="button"
          className="hs-preview-eye"
          aria-label={`放大预览 ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            onPreview(item);
          }}
        >
          <IEye size={18} />
        </button>
      )}
      {status === 'generating' && (
        <span className="hs-progress"><i style={{ width: `${progress}%` }} /></span>
      )}
      {status === 'failed' && errorText && (
        <span className="hs-error">{String(errorText).slice(0, 90)}</span>
      )}
      <div className="info">
        <span>{item.model || item.modelName || item.title || typeLabel(kind)}</span>
        <span>{timeOf(item)}</span>
      </div>
    </div>
  );
}

export function HistoryModal({ onUseHistoryItems } = {}) {
  const onClose = uiActions.closeOverlayModal;
  const history = useHistory();
  const project = useProject();
  const nodes = useNodes();
  const [tab, setTab] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [picked, setPicked] = React.useState(new Set());
  const [busy, setBusy] = React.useState('');
  const [error, setError] = React.useState('');
  const [previewItem, setPreviewItem] = React.useState(null);

  const projectHistory = React.useMemo(() => {
    const projectId = project?.id;
    if (!projectId) return [];
    return history.filter((item) => {
      const kind = historyKindOf(item);
      return (
        VISIBLE_HISTORY_KINDS.has(kind)
        && isGeneratedHistoryRecord(item)
        && historyProjectId(item) === String(projectId)
      );
    });
  }, [history, project?.id]);

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
      if (tab !== 'all' && kind !== tab) return false;
      if (!needle) return true;
      return [
        item.prompt,
        item.title,
        item.model,
        item.modelName,
        item.provider,
        item.errorMsg,
      ].some((value) => String(value || '').toLowerCase().includes(needle));
    });
  }, [projectHistory, query, tab]);

  React.useEffect(() => {
    setPicked((current) => {
      const validIds = new Set(items.map((item) => item.id));
      const next = new Set(Array.from(current).filter((id) => validIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [items]);

  const selectedItems = React.useMemo(
    () => items.filter((item) => picked.has(item.id)),
    [items, picked],
  );

  const toggle = (id) => {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const useToCanvas = React.useCallback((targets = selectedItems) => {
    const usable = targets.filter((item) => historyMediaSrc(item) || historyKindOf(item) === 'text');
    if (!usable.length) return;
    if (onUseHistoryItems) {
      onUseHistoryItems(usable);
      onClose();
      return;
    }
    const existingIds = [];
    const created = [];
    usable.forEach((item, index) => {
      const existing = item.nodeId ? nodes.find((node) => node.id === item.nodeId) : null;
      if (existing) {
        existingIds.push(existing.id);
      } else {
        created.push(nodeFromHistoryItem(item, index, [...nodes, ...created]));
      }
    });
    if (created.length) canvasActions.setNodes((current) => [...current, ...created]);
    uiActions.setSelection([...existingIds, ...created.map((node) => node.id)]);
    onClose();
  }, [nodes, onClose, onUseHistoryItems, selectedItems]);

  const openPreview = React.useCallback((item) => {
    const preview = previewItemFromHistory(item);
    if (!preview) return;
    setPreviewItem(preview);
  }, []);

  const downloadSelected = React.useCallback(() => {
    selectedItems.forEach((item, index) => {
      const src = historyMediaSrc(item);
      if (!src) return;
      const kind = historyKindOf(item);
      const ext = kind === 'video' ? 'mp4' : kind === 'audio' ? 'mp3' : 'png';
      triggerDownload({
        src,
        filename: `${safeFileName(item.title || item.prompt || `${typeLabel(kind)}历史_${index + 1}`)}.${ext}`,
      });
    });
  }, [selectedItems]);

  const deleteSelected = React.useCallback(async () => {
    if (!selectedItems.length) return;
    const confirmed = window.confirm(`确定删除选中的 ${selectedItems.length} 条生成历史吗？`);
    if (!confirmed) return;
    setBusy('delete');
    setError('');
    const ids = Array.from(new Set(selectedItems.flatMap((item) => (
      Array.isArray(item.historyIds) && item.historyIds.length ? item.historyIds : [item.id]
    )).filter(Boolean)));
    try {
      await Promise.allSettled(ids.map((id) => HistoryStore.delete(id)));
      libraryActions.removeHistoryItems(ids);
      setPicked(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy('');
    }
  }, [selectedItems]);

  return (
    <XModal
      title="当前项目生成历史"
      icon={<IHistory size={16}/>}
      onClose={onClose}
      className="hs-modal"
      footer={(
        <>
          <span className="x-credit">当前项目 {project?.name || '未命名'} · 已选 {picked.size} / {items.length}</span>
          <span style={{ flex: 1 }}/>
          <button className="x-btn ghost" onClick={() => setPicked(new Set())} disabled={!picked.size || Boolean(busy)}>取消选择</button>
          <button className="x-btn ghost" onClick={downloadSelected} disabled={!selectedItems.some(historyMediaSrc) || Boolean(busy)}>
            <IArrow size={12}/>下载
          </button>
          <button className="x-btn ghost" onClick={deleteSelected} disabled={!picked.size || Boolean(busy)}>
            <ITrash size={12}/>{busy === 'delete' ? '删除中' : '删除'}
          </button>
          <button className="x-btn primary" onClick={() => useToCanvas()} disabled={!selectedItems.length || Boolean(busy)}>
            <IArrow size={12}/>使用到画布
          </button>
        </>
      )}
    >
      <div className="hs-bar">
        <div className="hs-tabs">
          {[
            ['all', `全部 ${counts.all}`],
            ['image', `图片 ${counts.image}`],
            ['video', `视频 ${counts.video}`],
          ].map(([k, label]) => (
            <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>
        <div className="sb-search" style={{ maxWidth: 320 }}>
          <ISearch size={12}/>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 Prompt / 模型 / 标题"/>
        </div>
        {error && <span className="hs-inline-error">{error}</span>}
      </div>
      <div className="hs-grid">
        {items.length ? items.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            picked={picked.has(item.id)}
            onToggle={toggle}
            onUse={useToCanvas}
            onPreview={openPreview}
          />
        )) : (
          <div className="empty-state">
            <strong>暂无生成历史</strong>
            <span>当前画布项目生成完成或失败后，会在这里留下可追溯记录。</span>
          </div>
        )}
      </div>
      <HistoryPreviewLightbox item={previewItem} onClose={() => setPreviewItem(null)} />
    </XModal>
  );
}
