import React from 'react';
import { cardsForDesignTab } from './designSpacePackage.js';
import { designSpaceActions } from './designSpaceStore.js';
import { NodePreviewModal } from '../modals/shared/NodePreviewModal.jsx';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { IAdd, IClose, IEye, ITrash } from '../../shared/ui/icons/index.jsx';

const TABS = [
  { key: 'characters', label: '人物', type: 'character' },
  { key: 'scenes', label: '场景', type: 'scene' },
  { key: 'props', label: '道具', type: 'prop' },
];
const EMPTY_WARNINGS = Object.freeze([]);
const VIRTUAL_CARD_MIN_WIDTH = 148;
const VIRTUAL_CARD_GAP = 10;
const VIRTUAL_DEFAULT_GRID_WIDTH = 520;
const VIRTUAL_DEFAULT_ROW_HEIGHT = 224;
const VIRTUAL_OVERSCAN_ROWS = 3;
const VIRTUAL_FALLBACK_VISIBLE_ROWS = 6;

function tabMeta(tabKey) {
  return TABS.find((tab) => tab.key === tabKey) || TABS[0];
}

function currentVersion(card) {
  const history = Array.isArray(card?.history) ? card.history : [];
  return history.find((item) => item.id === card.currentVersionId) || history[0] || null;
}

function versionAssetUrl(version) {
  return makeAssetUrl({
    id: version?.assetId,
    src: version?.assetUrl || version?.url || version?.src || version?.imageUrl || version?.assetPath || version?.localPath || version?.path,
    url: version?.url || version?.imageUrl,
    assetUrl: version?.assetUrl || version?.imageUrl,
    assetPath: version?.assetPath,
    localPath: version?.localPath,
    path: version?.path,
    preferLocalAsset: true,
  });
}

function versionErrorText(version) {
  return String(version?.error || version?.message || '').trim();
}

function statusLabel(status) {
  const value = String(status || 'draft').trim();
  if (value === 'generating') return '生成中';
  if (value === 'generated') return '已生成';
  if (value === 'failed') return '失败';
  if (value === 'draft') return '草稿';
  return value;
}

function handleCardKeyDown(event, onActivate) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onActivate?.();
}

const DesignAssetCard = React.memo(function DesignAssetCard({
  card,
  assetUrl,
  errorText,
  isActive,
  isChecked,
  warnings = [],
  onSelect,
  onToggle,
  onPreview,
  onDelete,
}) {
  const title = card?.name || '未命名卡片';
  const type = card?.type || 'asset';
  const isGenerating = card?.status === 'generating';
  const activate = React.useCallback(() => {
    onSelect?.(card.id);
  }, [card.id, onSelect]);
  const toggle = React.useCallback(() => {
    onToggle?.(card.id);
  }, [card.id, onToggle]);
  const preview = React.useCallback((event) => {
    event.stopPropagation();
    onPreview?.(card, assetUrl);
  }, [assetUrl, card, onPreview]);
  const deleteCard = React.useCallback((event) => {
    event.stopPropagation();
    onDelete?.(card.id);
  }, [card.id, onDelete]);

  return (
    <article
      data-virtual-card="true"
      className={`design-card${isActive ? ' active' : ''}${isChecked ? ' selected' : ''}`}
      tabIndex={0}
      aria-label={`选择${title}`}
      onClick={activate}
      onKeyDown={(event) => handleCardKeyDown(event, activate)}
    >
      <label className="design-card-check" onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={toggle}
          aria-label={`选择${title}`}
        />
      </label>
      <div className={`design-card-thumb${assetUrl ? ' has-image' : ''}${isGenerating ? ' is-loading' : ''}`}>
        <span className="design-card-type-pill">{type}</span>
        {assetUrl ? (
          <img
            src={assetUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchpriority={isActive ? 'high' : 'low'}
            draggable="false"
          />
        ) : (
          <span className={isGenerating ? 'design-card-skeleton' : 'design-card-empty-thumb'}>
            {isGenerating ? '生成中' : '暂无图片'}
          </span>
        )}
        {assetUrl && (
          <button
            type="button"
            className="design-card-preview-button"
            aria-label={`预览${title}`}
            title="放大预览"
            onClick={preview}
          >
            <IEye size={16} />
          </button>
        )}
        <button
          type="button"
          className="design-card-delete-button"
          aria-label={`删除${title}`}
          title="删除资产"
          onClick={deleteCard}
        >
          <ITrash size={15} />
        </button>
      </div>
      <div className="design-card-activate">
        <span className="design-card-body">
          <span className="design-card-meta">
            <strong>{title}</strong>
            <em title={errorText || undefined}>{statusLabel(card?.status)}</em>
          </span>
          {warnings.length > 0 && <small className="design-warning">{warnings[0]}</small>}
          {errorText && <small className="design-card-error" title={errorText}>{errorText}</small>}
        </span>
      </div>
    </article>
  );
});

function ManualAssetDialog({ tab, onClose, onSubmit }) {
  const [nameDraft, setNameDraft] = React.useState('');
  const [promptDraft, setPromptDraft] = React.useState('');
  const canSubmit = nameDraft.trim().length > 0 && promptDraft.trim().length > 0;

  React.useEffect(() => {
    const closeFromEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', closeFromEscape);
    return () => document.removeEventListener('keydown', closeFromEscape);
  }, [onClose]);

  const submit = React.useCallback((event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit?.({
      bucket: tab.key,
      type: tab.type,
      name: nameDraft.trim(),
      visualPrompt: promptDraft.trim(),
    });
  }, [canSubmit, nameDraft, onSubmit, promptDraft, tab.key, tab.type]);

  return (
    <div className="design-prefix-backdrop design-manual-asset-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="design-prefix-dialog design-manual-asset-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`新增${tab.label}资产`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="design-prefix-head">
          <div>
            <span>Manual Asset</span>
            <h2>新增{tab.label}资产</h2>
          </div>
          <button type="button" aria-label="关闭新增资产" onClick={onClose}>
            <IClose size={16} />
          </button>
        </div>
        <form className="design-manual-asset-form" onSubmit={submit}>
          <label className="design-space-field">
            <span>名称</span>
            <input
              name="assetName"
              value={nameDraft}
              autoFocus
              placeholder={`例如：${tab.label}名称`}
              onChange={(event) => setNameDraft(event.target.value)}
            />
          </label>
          <label className="design-space-field">
            <span>提示词</span>
            <textarea
              name="assetPrompt"
              value={promptDraft}
              placeholder="填写用于生成该资产的视觉提示词"
              onChange={(event) => setPromptDraft(event.target.value)}
            />
          </label>
          <div className="design-prefix-actions design-manual-asset-actions">
            <button type="button" onClick={onClose}>取消</button>
            <button type="submit" className="design-space-primary" disabled={!canSubmit}>
              保存资产
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function DesignSpaceCardGrid({
  projectId,
  packageData,
  selectedIds = new Set(),
  onSelectCard,
  onToggleCard,
  onDeleteCard,
  onCreateManualAsset,
}) {
  const activeTab = packageData?.activeTab || 'characters';
  const activeTabMeta = tabMeta(activeTab);
  const cards = cardsForDesignTab(packageData, activeTab);
  const gridRef = React.useRef(null);
  const [gridViewport, setGridViewport] = React.useState({
    width: VIRTUAL_DEFAULT_GRID_WIDTH,
    height: VIRTUAL_DEFAULT_ROW_HEIGHT * VIRTUAL_FALLBACK_VISIBLE_ROWS,
    scrollTop: 0,
    rowHeight: VIRTUAL_DEFAULT_ROW_HEIGHT,
  });
  const [previewItem, setPreviewItem] = React.useState(null);
  const [manualDialogOpen, setManualDialogOpen] = React.useState(false);

  const virtualItems = React.useMemo(() => (
    cards.length > 0
      ? [
        ...cards.map((card) => ({ kind: 'card', id: card.id, card })),
        { kind: 'add', id: '__add_asset__' },
      ]
      : []
  ), [cards]);

  const virtualColumns = React.useMemo(() => {
    const width = Math.max(1, gridViewport.width || VIRTUAL_DEFAULT_GRID_WIDTH);
    return Math.max(1, Math.floor((width + VIRTUAL_CARD_GAP) / (VIRTUAL_CARD_MIN_WIDTH + VIRTUAL_CARD_GAP)));
  }, [gridViewport.width]);

  const virtualWindow = React.useMemo(() => {
    const totalItems = virtualItems.length;
    const rowHeight = Math.max(1, gridViewport.rowHeight || VIRTUAL_DEFAULT_ROW_HEIGHT);
    const viewportHeight = Math.max(rowHeight, gridViewport.height || (rowHeight * VIRTUAL_FALLBACK_VISIBLE_ROWS));
    const totalRows = Math.ceil(totalItems / virtualColumns);
    const rowsInView = Math.max(1, Math.ceil(viewportHeight / rowHeight));
    const renderRows = rowsInView + VIRTUAL_OVERSCAN_ROWS * 2;
    const maxStartRow = Math.max(0, totalRows - renderRows);
    const startRow = Math.min(
      maxStartRow,
      Math.max(0, Math.floor((gridViewport.scrollTop || 0) / rowHeight) - VIRTUAL_OVERSCAN_ROWS),
    );
    const endRow = Math.min(totalRows, startRow + renderRows);
    const startIndex = startRow * virtualColumns;
    const endIndex = Math.min(totalItems, endRow * virtualColumns);

    return {
      startIndex,
      endIndex,
      topPad: startRow * rowHeight,
      bottomPad: Math.max(0, (totalRows - endRow) * rowHeight),
    };
  }, [gridViewport.height, gridViewport.rowHeight, gridViewport.scrollTop, virtualColumns, virtualItems.length]);

  const visibleItems = virtualItems.slice(virtualWindow.startIndex, virtualWindow.endIndex);
  const renderedAssetCount = visibleItems.filter((item) => item.kind === 'card').length;
  const visibleStatus = `按滚动窗口渲染 ${renderedAssetCount}/${cards.length} 张卡片 · 图片懒加载 · ${cards.length} 个资产`;

  const refreshGridMetrics = React.useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measuredCard = grid.querySelector('[data-virtual-card="true"]');
    const measuredHeight = measuredCard?.getBoundingClientRect?.().height || 0;
    const rowHeight = measuredHeight > 0
      ? Math.ceil(measuredHeight + VIRTUAL_CARD_GAP)
      : gridViewport.rowHeight;
    const next = {
      width: grid.clientWidth || VIRTUAL_DEFAULT_GRID_WIDTH,
      height: grid.clientHeight || (rowHeight * VIRTUAL_FALLBACK_VISIBLE_ROWS),
      scrollTop: grid.scrollTop || 0,
      rowHeight,
    };
    setGridViewport((current) => (
      current.width === next.width
        && current.height === next.height
        && current.scrollTop === next.scrollTop
        && current.rowHeight === next.rowHeight
        ? current
        : next
    ));
  }, [gridViewport.rowHeight]);

  React.useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    let frame = 0;
    const scheduleRefresh = () => {
      if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
        refreshGridMetrics();
        return;
      }
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        refreshGridMetrics();
      });
    };

    refreshGridMetrics();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleRefresh) : null;
    observer?.observe(grid);
    if (typeof window !== 'undefined') window.addEventListener('resize', scheduleRefresh);
    return () => {
      if (frame && typeof window !== 'undefined') window.cancelAnimationFrame(frame);
      observer?.disconnect();
      if (typeof window !== 'undefined') window.removeEventListener('resize', scheduleRefresh);
    };
  }, [refreshGridMetrics]);

  React.useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    grid.scrollTop = 0;
    setGridViewport((current) => ({ ...current, scrollTop: 0 }));
  }, [activeTab]);

  React.useLayoutEffect(() => {
    refreshGridMetrics();
  }, [refreshGridMetrics, visibleItems.length]);

  const selectTab = React.useCallback((tabKey) => {
    const targetCards = cardsForDesignTab(packageData, tabKey);
    designSpaceActions.patchPackage(projectId, {
      activeTab: tabKey,
      selectedCardId: targetCards[0]?.id || '',
    });
  }, [packageData, projectId]);

  const toggleCard = React.useCallback((cardId) => {
    onToggleCard?.(cardId);
  }, [onToggleCard]);

  const openPreview = React.useCallback((card, assetUrl) => {
    if (!assetUrl) return;
    setPreviewItem({
      mediaKind: 'image',
      src: assetUrl,
      title: card?.name || '未命名卡片',
    });
  }, []);

  const submitManualAsset = React.useCallback((payload) => {
    onCreateManualAsset?.(payload);
    setManualDialogOpen(false);
  }, [onCreateManualAsset]);

  const handleGridScroll = React.useCallback((event) => {
    const scrollTop = event.currentTarget.scrollTop || 0;
    setGridViewport((current) => (
      Math.abs(current.scrollTop - scrollTop) < 4 ? current : { ...current, scrollTop }
    ));
  }, []);

  return (
    <section className="design-space-panel design-card-panel">
      <div className="design-space-tabs" role="tablist" aria-label="设计分类">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            className={activeTab === tab.key ? 'active' : ''}
            aria-selected={activeTab === tab.key}
            onClick={() => selectTab(tab.key)}
          >
            {tab.label}<span>{cardsForDesignTab(packageData, tab.key).length}</span>
          </button>
        ))}
      </div>
      <div className="design-card-grid-status" role="status">{visibleStatus}</div>
      <div className="design-card-grid" ref={gridRef} onScroll={handleGridScroll}>
        {cards.length === 0 && (
          <div className="design-space-empty">当前分类还没有卡片</div>
        )}
        {cards.length > 0 && virtualWindow.topPad > 0 && (
          <div className="design-card-grid-spacer" style={{ height: virtualWindow.topPad }} />
        )}
        {visibleItems.map((item) => {
          if (item.kind === 'add') {
            return (
              <button
                key={item.id}
                type="button"
                data-virtual-card="true"
                className="design-card design-card-add"
                aria-label={`新增${activeTabMeta.label}资产`}
                onClick={() => setManualDialogOpen(true)}
              >
                <span className="design-card-add-icon"><IAdd size={22} /></span>
                <strong>新增{activeTabMeta.label}资产</strong>
                <em>手动填写名称和提示词</em>
              </button>
            );
          }
          const card = item.card;
          const version = currentVersion(card);
          const assetUrl = versionAssetUrl(version);
          const errorText = versionErrorText(version);
          const isActive = card.id === packageData?.selectedCardId;
          const isChecked = selectedIds.has(card.id);
          const warnings = Array.isArray(card.warnings) ? card.warnings : EMPTY_WARNINGS;
          return (
            <DesignAssetCard
              key={card.id}
              card={card}
              assetUrl={assetUrl}
              errorText={errorText}
              isActive={isActive}
              isChecked={isChecked}
              warnings={warnings}
              onSelect={onSelectCard}
              onToggle={toggleCard}
              onPreview={openPreview}
              onDelete={onDeleteCard}
            />
          );
        })}
        {cards.length === 0 && (
          <button
            type="button"
            className="design-card design-card-add"
            aria-label={`新增${activeTabMeta.label}资产`}
            onClick={() => setManualDialogOpen(true)}
          >
            <span className="design-card-add-icon"><IAdd size={22} /></span>
            <strong>新增{activeTabMeta.label}资产</strong>
            <em>手动填写名称和提示词</em>
          </button>
        )}
        {cards.length > 0 && virtualWindow.bottomPad > 0 && (
          <div className="design-card-grid-spacer" style={{ height: virtualWindow.bottomPad }} />
        )}
      </div>
      <NodePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      {manualDialogOpen && (
        <ManualAssetDialog
          tab={activeTabMeta}
          onClose={() => setManualDialogOpen(false)}
          onSubmit={submitManualAsset}
        />
      )}
    </section>
  );
}
