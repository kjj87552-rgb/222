import React from 'react';
import { IAdd, ICheck, IClose, IEye, IImage, IPlay, ITrash, IZoomIn } from '../../shared/ui/icons/index.jsx';
import { AssetStore } from '../../shared/platform/assetStore.js';
import { JobStore } from '../../shared/platform/jobStore.js';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { readFileAsDataUrl, safeFileName, triggerDownload } from '../../shared/utils/file.js';
import { importLocalFileAsAsset } from '../../shared/utils/uploadHelpers.js';
import { upscaleStyles } from './styles.js';

function makeItemId() {
  return 'up_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
}

function cleanTitle(value, fallback = '图片素材') {
  return String(value || fallback).replace(/\.[^.]+$/, '').trim() || fallback;
}

function sourceKey(item) {
  return item?.assetId || item?.src || item?.sourceNodeId || item?.id;
}

function normalizeOutputAsset(output, fallbackTitle) {
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
    source: 'upscale',
    engine: output.engine,
    scale: output.scale,
    sourceAssetId: output.sourceAssetId,
    sourceNodeId: output.sourceNodeId,
  };
  const src = makeAssetUrl(merged);
  return src ? { ...merged, src, url: src } : merged;
}

function itemStatusText(item) {
  if (item.status === 'queued') return '排队中';
  if (item.status === 'running') return `${Math.max(1, Math.min(99, Number(item.progress) || 1))}%`;
  if (item.status === 'completed') return item.engine || '已完成';
  if (item.status === 'failed') return '失败';
  return '待处理';
}

function itemBusy(item) {
  return item.status === 'queued' || item.status === 'running';
}

function itemRunnable(item) {
  return Boolean(item?.src) && !itemBusy(item) && ['ready', 'failed', 'completed'].includes(item.status || 'ready');
}

function extensionFromMime(mime) {
  const value = String(mime || '').toLowerCase();
  if (value.includes('jpeg') || value.includes('jpg')) return 'jpg';
  if (value.includes('webp')) return 'webp';
  return 'png';
}

const UPSCALE_MODEL_BY_TYPE = {
  portrait: 'realesrgan-x4plus',
  anime: 'realesrgan-x4plus-anime',
  general: 'realesrgan-x4plus',
};

function makeQueueItemFromNode(node) {
  return {
    id: makeItemId(),
    title: cleanTitle(node.title, '画布图片'),
    src: node.src,
    assetId: node.assetId,
    assetPath: node.assetPath,
    sourceNodeId: node.id,
    status: 'ready',
    progress: 0,
    source: 'canvas',
  };
}

function CanvasImageChooser({ images, selectedIds, onToggle, onClose, onConfirm }) {
  return (
    <div className="upscale-modal-mask" onMouseDown={onClose} role="presentation">
      <div className="upscale-picker" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <strong>选择画布图片</strong>
            <span>{images.length} 个可用图片节点</span>
          </div>
          <button type="button" onClick={onClose} title="关闭">
            <IClose size={14}/>
          </button>
        </header>
        <div className="upscale-picker-grid">
          {images.map((node) => {
            const checked = selectedIds.includes(node.id);
            return (
              <button
                type="button"
                key={node.id}
                className={checked ? 'active' : ''}
                onClick={() => onToggle(node.id)}
              >
                <img src={node.src} alt="" draggable="false"/>
                <span>{node.title || node.id}</span>
                {checked && <em><ICheck size={11}/></em>}
              </button>
            );
          })}
          {!images.length && (
            <div className="upscale-picker-empty">当前画布没有可用图片节点</div>
          )}
        </div>
        <footer>
          <button type="button" className="upscale-btn" onClick={onClose}>取消</button>
          <button type="button" className="upscale-btn primary" onClick={onConfirm} disabled={!selectedIds.length}>
            加入工作台
          </button>
        </footer>
      </div>
    </div>
  );
}

function QueueCard({ item, selected, onSelect, onRun, onRemove }) {
  const busy = itemBusy(item);
  return (
    <div className={`upscale-card ${selected ? 'selected' : ''}`}>
      <div className="upscale-thumb">
        {item.src ? <img src={item.src} alt={item.title} loading="lazy"/> : null}
      </div>
      <div className="upscale-info">
        <div className="upscale-card-head">
          <label className="upscale-queue-select" title="选择此图片">
            <input
              type="checkbox"
              checked={selected}
              disabled={busy}
              onChange={(event) => onSelect(item.id, event.target.checked)}
            />
            <span>{selected && <ICheck size={10}/>}</span>
          </label>
          <div className="upscale-title" title={item.title}>{item.title}</div>
        </div>
        <div className="upscale-meta">{item.source === 'canvas' ? '画布图片' : '本地上传'} · {itemStatusText(item)}</div>
        <div className="upscale-progress">
          <span style={{ width: `${Math.max(0, Math.min(100, Number(item.progress) || 0))}%` }}/>
        </div>
        {item.error && <div className="upscale-error">{item.error}</div>}
        <div className="upscale-card-actions">
          <button type="button" className="primary" onClick={() => onRun(item)} disabled={busy || !item.src}>
            {item.status === 'completed' ? '重新放大' : '开始放大'}
          </button>
          <button type="button" onClick={() => onRemove(item.id)} disabled={busy}>移除</button>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ item, deleting, onInsert, onSaveSubject, onPreview, onDelete }) {
  const asset = item.outputAsset;
  const title = asset?.title || item.title || '高清放大结果';
  const filename = `${safeFileName(title, 'upscale')}.${extensionFromMime(asset?.mime)}`;
  return (
    <div className="upscale-result-card">
      <button type="button" className="upscale-result-thumb" onClick={() => onPreview(asset)} title="预览">
        {asset?.src ? <img src={asset.src} alt={title} loading="lazy"/> : null}
        <span><IEye size={14}/></span>
      </button>
      <div className="upscale-result-body">
        <div className="upscale-title" title={title}>{title}</div>
        <div className="upscale-meta">{item.engine || asset?.engine || '本地高清放大'} · {item.finishedAtText}</div>
        <div className="upscale-result-actions">
          <button type="button" onClick={() => onInsert(asset)}>回到画布</button>
          <button type="button" onClick={() => onSaveSubject(asset, item.id)} disabled={item.subjectSaved}>
            {item.subjectSaved ? '已入主体库' : '存主体库'}
          </button>
          <button
            type="button"
            onClick={() => triggerDownload({ ...asset, filename })}
            disabled={!asset?.src}
          >
            导出本地
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => onDelete(item)}
            disabled={deleting}
          >
            <ITrash size={12}/> 删除
          </button>
        </div>
      </div>
    </div>
  );
}

export function UpscalePanel({
  projectId,
  canvasImages = [],
  selectedImages = [],
  incomingImages = [],
  onIncomingConsumed,
  onClose,
  onInsertAsset,
  onSaveSubjectAsset,
}) {
  const [items, setItems] = React.useState([]);
  const [results, setResults] = React.useState([]);
  const [queueSelection, setQueueSelection] = React.useState([]);
  const [deletingResultIds, setDeletingResultIds] = React.useState([]);
  const [batchRunning, setBatchRunning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('queue');
  const [scale, setScale] = React.useState(2);
  const [model, setModel] = React.useState('portrait');
  const [panelError, setPanelError] = React.useState('');
  const [chooserOpen, setChooserOpen] = React.useState(false);
  const [chooserSelection, setChooserSelection] = React.useState([]);
  const [previewAsset, setPreviewAsset] = React.useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    let canceled = false;
    AssetStore.list({ project_id: projectId, kind: 'image' })
      .then((result) => {
        if (canceled) return;
        const restored = (result?.assets || [])
          .filter((asset) => asset.source === 'job.upscale' || asset.source === 'upscale')
          .map((asset) => ({
            id: `hist_${asset.id}`,
            title: asset.title || '高清放大结果',
            outputAsset: { ...asset, src: asset.src || asset.url || makeAssetUrl(asset), url: asset.url || makeAssetUrl(asset) },
            engine: asset.engine,
            status: 'completed',
            progress: 100,
            finishedAtText: asset.createdAt ? new Date(asset.createdAt).toLocaleString('zh-CN', { hour12: false }) : '历史结果',
          }));
        setResults(restored.slice(0, 80));
      })
      .catch(() => {});
    return () => { canceled = true; };
  }, [projectId]);

  React.useEffect(() => JobStore.onEvent((event) => {
    const job = event?.job;
    if (!job || job.type !== 'image.upscale') return;
    setItems((prev) => prev.map((item) => {
      if (item.jobId !== job.id) return item;
      if (job.status === 'queued' || job.status === 'running') {
        return { ...item, status: job.status, progress: Math.max(1, Math.min(99, Number(job.progress) || 1)), error: '' };
      }
      if (job.status === 'failed') {
        return { ...item, status: 'failed', progress: 0, error: job.error || '高清放大失败' };
      }
      if (job.status === 'completed') {
        const outputAsset = normalizeOutputAsset(job.output, `${item.title} · 高清放大`);
        const completed = {
          ...item,
          status: 'completed',
          progress: 100,
          outputAsset,
          engine: job.output?.engine,
          finishedAtText: new Date().toLocaleString('zh-CN', { hour12: false }),
          error: '',
        };
        setResults((current) => [completed, ...current.filter((result) => result.outputAsset?.id !== outputAsset?.id)].slice(0, 80));
        setActiveTab('history');
        return completed;
      }
      return item;
    }));
  }), []);

  React.useEffect(() => {
    setQueueSelection((current) => {
      const existing = new Set(items.map((item) => item.id));
      const next = current.filter((itemId) => existing.has(itemId));
      return next.length === current.length ? current : next;
    });
  }, [items]);

  const addItems = React.useCallback((nextItems) => {
    setItems((prev) => {
      const known = new Set(prev.map(sourceKey));
      const merged = [...prev];
      nextItems.forEach((item) => {
        const key = sourceKey(item);
        if (!key || known.has(key)) return;
        known.add(key);
        merged.unshift(item);
      });
      return merged;
    });
    setQueueSelection((current) => Array.from(new Set([...current, ...nextItems.map((item) => item.id)])));
    if (nextItems.length) setActiveTab('queue');
  }, []);

  React.useEffect(() => {
    const next = (incomingImages || []).filter((node) => node?.src).map(makeQueueItemFromNode);
    if (!next.length) return;
    addItems(next);
    onIncomingConsumed?.();
  }, [addItems, incomingImages, onIncomingConsumed]);

  const openCanvasChooser = React.useCallback(() => {
    setPanelError('');
    setChooserSelection(selectedImages.map((node) => node.id));
    setChooserOpen(true);
  }, [selectedImages]);

  const confirmCanvasChooser = React.useCallback(() => {
    const selected = canvasImages.filter((node) => chooserSelection.includes(node.id)).map(makeQueueItemFromNode);
    addItems(selected);
    setChooserOpen(false);
  }, [addItems, canvasImages, chooserSelection]);

  const toggleCanvasImage = React.useCallback((nodeId) => {
    setChooserSelection((current) => (
      current.includes(nodeId)
        ? current.filter((id) => id !== nodeId)
        : [...current, nodeId]
    ));
  }, []);

  const onUploadInputChange = React.useCallback(async (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    event.target.value = '';
    if (!files.length) return;
    setPanelError('');
    const next = [];
    for (const file of files) {
      const meta = { source: 'upscale-upload' };
      let persisted = await importLocalFileAsAsset(file, projectId, 'image', meta);
      let dataUrl = '';
      if (!persisted) {
        dataUrl = await readFileAsDataUrl(file);
      }
      if (!persisted && AssetStore.writeAvailable()) {
        try {
          persisted = await AssetStore.writeDataUrl(projectId, {
            filename: file.name,
            dataUrl,
            kind: 'image',
            mime: file.type,
            meta,
          });
        } catch (error) {
          console.warn('Upscale upload persistence failed; using data URL', error);
        }
      }
      const src = persisted?.src || persisted?.url || dataUrl;
      next.push({
        id: makeItemId(),
        title: cleanTitle(persisted?.title || file.name, '上传图片'),
        src,
        dataUrl: persisted ? undefined : dataUrl,
        assetId: persisted?.id,
        assetPath: persisted?.path,
        status: 'ready',
        progress: 0,
        source: 'upload',
      });
    }
    addItems(next);
  }, [addItems, projectId]);

  const openUploadPicker = React.useCallback(async () => {
    setPanelError('');
    if (AssetStore.available()) {
      try {
        const records = await AssetStore.pickAndImport(projectId, { multiple: true, kind: 'image', deferCopy: true });
        const next = records
          .filter((asset) => asset?.src || asset?.url)
          .map((asset) => ({
            id: makeItemId(),
            title: cleanTitle(asset.title || asset.name || asset.filename, '上传图片'),
            src: asset.src || asset.url,
            assetId: asset.id,
            assetPath: asset.path,
            status: 'ready',
            progress: 0,
            source: 'upload',
          }));
        addItems(next);
        return;
      } catch (error) {
        console.warn('Native upscale upload failed; using browser picker', error);
      }
    }
    fileInputRef.current?.click();
  }, [addItems, projectId]);

  const runItem = React.useCallback(async (item) => {
    setPanelError('');
    setItems((prev) => prev.map((entry) => (
      entry.id === item.id ? { ...entry, status: 'queued', progress: 1, error: '', outputAsset: null } : entry
    )));
    try {
      const job = await JobStore.create(null, {
        projectId,
        type: 'image.upscale',
        providerModelId: 'local.upscale.realesrgan',
        title: `${item.title} · ${scale}x`,
        assetId: item.assetId,
        imageUrl: item.src,
        dataUrl: item.dataUrl,
        sourceNodeId: item.sourceNodeId,
        scale,
        contentType: model,
        upscaleModel: UPSCALE_MODEL_BY_TYPE[model] || UPSCALE_MODEL_BY_TYPE.general,
      });
      setItems((prev) => prev.map((entry) => (
        entry.id === item.id ? { ...entry, jobId: job.id, status: job.status || 'queued', progress: Number(job.progress) || 1 } : entry
      )));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setItems((prev) => prev.map((entry) => (
        entry.id === item.id ? { ...entry, status: 'failed', progress: 0, error: message } : entry
      )));
    }
  }, [model, projectId, scale]);

  const runItemsBatch = React.useCallback(async (targetItems) => {
    const uniqueTargets = Array.from(
      new Map((targetItems || []).filter(itemRunnable).map((item) => [item.id, item])).values()
    );
    if (!uniqueTargets.length) return;
    setBatchRunning(true);
    try {
      for (const item of uniqueTargets) {
        await runItem(item);
      }
    } finally {
      setBatchRunning(false);
    }
  }, [runItem]);

  const runAllReady = React.useCallback(() => {
    runItemsBatch(items.filter((item) => item.status === 'ready' || item.status === 'failed'));
  }, [items, runItemsBatch]);

  const runSelected = React.useCallback(() => {
    const selected = items.filter((item) => queueSelection.includes(item.id));
    runItemsBatch(selected);
  }, [items, queueSelection, runItemsBatch]);

  const setItemSelected = React.useCallback((itemId, selected) => {
    setQueueSelection((current) => (
      selected
        ? Array.from(new Set([...current, itemId]))
        : current.filter((id) => id !== itemId)
    ));
  }, []);

  const toggleSelectAllQueue = React.useCallback(() => {
    const selectable = items.filter((item) => !itemBusy(item)).map((item) => item.id);
    const selected = new Set(queueSelection);
    const allSelected = selectable.length > 0 && selectable.every((id) => selected.has(id));
    setQueueSelection(allSelected ? [] : selectable);
  }, [items, queueSelection]);

  const removeItem = React.useCallback((itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setQueueSelection((prev) => prev.filter((id) => id !== itemId));
  }, []);

  const saveSubjectAsset = React.useCallback((asset, itemId) => {
    onSaveSubjectAsset?.(asset);
    setResults((prev) => prev.map((item) => item.id === itemId ? { ...item, subjectSaved: true } : item));
  }, [onSaveSubjectAsset]);

  const deleteResult = React.useCallback(async (item) => {
    const asset = item?.outputAsset;
    const assetId = asset?.id;
    const resultId = item?.id;
    const title = asset?.title || item?.title || '高清放大结果';
    const confirmed = typeof window === 'undefined'
      ? true
      : window.confirm(`删除历史结果「${title}」？这会删除项目里的结果资产文件。`);
    if (!confirmed) return;
    setPanelError('');
    setDeletingResultIds((current) => Array.from(new Set([...current, resultId || assetId])));
    try {
      if (assetId) await AssetStore.delete(assetId);
      setResults((current) => current.filter((result) => (
        result.id !== resultId && result.outputAsset?.id !== assetId
      )));
      setItems((current) => current.map((entry) => (
        entry.outputAsset?.id === assetId
          ? { ...entry, outputAsset: null, status: 'ready', progress: 0, engine: '', error: '' }
          : entry
      )));
      setPreviewAsset((current) => (current?.id === assetId ? null : current));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setPanelError(`删除失败：${message}`);
    } finally {
      setDeletingResultIds((current) => current.filter((id) => id !== (resultId || assetId)));
    }
  }, []);

  const readyItems = items.filter((item) => Boolean(item?.src) && !itemBusy(item) && ['ready', 'failed'].includes(item.status || 'ready'));
  const selectedItems = items.filter((item) => queueSelection.includes(item.id));
  const selectedRunnableItems = selectedItems.filter(itemRunnable);
  const selectableItems = items.filter((item) => !itemBusy(item));
  const allQueueSelected = selectableItems.length > 0 && selectableItems.every((item) => queueSelection.includes(item.id));

  return (
    <>
      <style>{upscaleStyles}</style>
      <aside className="upscale-panel upscale-workbench">
        <header>
          <IZoomIn size={14}/>
          <h3>高清放大工作台</h3>
          <button className="close" type="button" onClick={onClose} title="关闭工作台">
            <IClose size={14}/>
          </button>
        </header>
        <div className="upscale-subtitle">本地 Real-ESRGAN 主引擎，格式与显存分块自动识别。</div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={onUploadInputChange}/>
        <div className="upscale-actions">
          <button type="button" className="upscale-btn primary" onClick={openCanvasChooser} disabled={!canvasImages.length}>
            <IImage size={13}/> 从画布选择
          </button>
          <button type="button" className="upscale-btn" onClick={openUploadPicker}>
            <IAdd size={13}/> 本地上传
          </button>
        </div>
        <div className="upscale-settings">
          <label className="upscale-field">
            <span>倍率</span>
            <select value={scale} onChange={(event) => setScale(Number(event.target.value))}>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
              <option value={4}>4x</option>
            </select>
          </label>
          <label className="upscale-field">
            <span>图片类型</span>
            <select value={model} onChange={(event) => setModel(event.target.value)}>
              <option value="portrait">真人照片</option>
              <option value="anime">动漫插画</option>
              <option value="general">通用图片</option>
            </select>
          </label>
        </div>
        <div className="upscale-tabs">
          <button type="button" className={activeTab === 'queue' ? 'active' : ''} onClick={() => setActiveTab('queue')}>
            输入队列 <span>{items.length}</span>
          </button>
          <button type="button" className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
            历史结果 <span>{results.length}</span>
          </button>
        </div>
        {activeTab === 'queue' && (
          <>
            <div className="upscale-list-head">
              <span className="upscale-list-title">
                待处理图片
                {queueSelection.length > 0 && <em>{queueSelection.length} 已选</em>}
              </span>
              <div className="upscale-head-actions">
                <button type="button" onClick={toggleSelectAllQueue} disabled={!selectableItems.length}>
                  {allQueueSelected ? '取消全选' : '全选'}
                </button>
                <button type="button" onClick={runSelected} disabled={batchRunning || !selectedRunnableItems.length}>
                  <IPlay size={11}/> 开始选中
                </button>
                <button type="button" onClick={runAllReady} disabled={batchRunning || !readyItems.length}>
                  全部放大
                </button>
              </div>
            </div>
            <div className="upscale-list">
              {panelError && <div className="upscale-error">{panelError}</div>}
              {!items.length && <div className="upscale-empty">从画布选择图片，或从本地上传图片。</div>}
              {items.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  selected={queueSelection.includes(item.id)}
                  onSelect={setItemSelected}
                  onRun={runItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </>
        )}
        {activeTab === 'history' && (
          <>
            <div className="upscale-list-head">
              <span>结果历史</span>
              <span>{results.length} 个</span>
            </div>
            <div className="upscale-list">
              {panelError && <div className="upscale-error">{panelError}</div>}
              {!results.length && <div className="upscale-empty">完成高清放大后，结果会出现在这里。</div>}
              {results.map((item) => (
                <ResultCard
                  key={item.id}
                  item={item}
                  deleting={deletingResultIds.includes(item.id) || deletingResultIds.includes(item.outputAsset?.id)}
                  onInsert={onInsertAsset}
                  onSaveSubject={saveSubjectAsset}
                  onPreview={setPreviewAsset}
                  onDelete={deleteResult}
                />
              ))}
            </div>
          </>
        )}
      </aside>
      {chooserOpen && (
        <CanvasImageChooser
          images={canvasImages}
          selectedIds={chooserSelection}
          onToggle={toggleCanvasImage}
          onClose={() => setChooserOpen(false)}
          onConfirm={confirmCanvasChooser}
        />
      )}
      {previewAsset && (
        <div className="upscale-modal-mask" onMouseDown={() => setPreviewAsset(null)} role="presentation">
          <div className="upscale-preview" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <strong>{previewAsset.title || '高清放大结果'}</strong>
              <button type="button" onClick={() => setPreviewAsset(null)}><IClose size={14}/></button>
            </header>
            <img src={previewAsset.src || previewAsset.url} alt=""/>
          </div>
        </div>
      )}
    </>
  );
}
