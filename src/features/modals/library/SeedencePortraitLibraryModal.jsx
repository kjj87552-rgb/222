import React from 'react';
import { IAdd, IImage, ISparkle, ITrash } from '../../../shared/ui/icons/index.jsx';
import { getBackendBaseUrl } from '../../../shared/platform/backendClient.js';
import { SeedancePortraitStore } from '../../../shared/platform/seedancePortraitStore.js';
import { uiActions } from '../../../shared/store/uiStore.js';
import { XModal } from '../shared/XModal.jsx';

function assetTitle(asset) {
  return asset.name || asset.assetId || 'Seedence 角色图';
}

function fileTitle(file) {
  const name = String(file?.name || '').trim();
  return name.replace(/\.[^./\\]+$/, '') || 'Seedence 角色图';
}

function backendRelativeSrc(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (text.startsWith('/seedance/') || text.startsWith('/assets/') || text.startsWith('/newapi/')) {
    return `${getBackendBaseUrl()}${text}`;
  }
  return text;
}

function assetImageSrc(asset) {
  const src = asset.localPreviewUrl
    || asset.local_preview_url
    || asset.previewUrl
    || asset.preview_url
    || asset.preview
    || asset.src
    || asset.url
    || '';
  return backendRelativeSrc(src);
}

function assetIdOf(asset) {
  return String(asset?.assetId || asset?.asset_id || '').trim();
}

function assetNeedsRefresh(asset) {
  const status = String(asset?.status || '').trim().toLowerCase();
  if (['failed', 'error', 'deleted'].includes(status)) return false;
  return !assetImageSrc(asset) || ['queued', 'processing', 'running', 'uploaded'].includes(status);
}

function mergePortraitAssets(primary = [], secondary = []) {
  const seen = new Set();
  return [...primary, ...secondary].filter((asset) => {
    const key = asset?.assetId || asset?.asset_id || asset?.assetRef || asset?.asset_ref || asset?.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function cachedPortraitAssets() {
  try {
    const result = SeedancePortraitStore.listCached?.();
    return Array.isArray(result?.assets) ? result.assets : [];
  } catch {
    return [];
  }
}

export function SeedencePortraitLibraryModal({ onClose = uiActions.closeModal, onPick = null }) {
  const inputRef = React.useRef(null);
  const previewUrlsRef = React.useRef([]);
  const mountedRef = React.useRef(true);
  const [assets, setAssets] = React.useState(cachedPortraitAssets);
  const [busy, setBusy] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState({ done: 0, total: 0 });
  const [deletingAssetId, setDeletingAssetId] = React.useState('');
  const [deleteProgress, setDeleteProgress] = React.useState({ done: 0, total: 0 });
  const [selectedAssetIds, setSelectedAssetIds] = React.useState(() => new Set());
  const [error, setError] = React.useState('');

  const loadAssets = React.useCallback(async () => {
    try {
      const result = await SeedancePortraitStore.list();
      const nextAssets = Array.isArray(result?.assets) ? result.assets : [];
      if (mountedRef.current) setAssets(nextAssets);
      return nextAssets;
    } catch (listError) {
      if (mountedRef.current) setError(listError?.message || '角色库列表加载失败');
      return [];
    }
  }, []);

  React.useEffect(() => () => {
    mountedRef.current = false;
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
  }, []);

  React.useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  React.useEffect(() => {
    if (!assets.some(assetNeedsRefresh)) return undefined;
    const timer = window.setTimeout(() => {
      loadAssets();
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [assets, loadAssets]);

  React.useEffect(() => {
    setSelectedAssetIds((current) => {
      if (!current.size) return current;
      const availableIds = new Set(assets.map(assetIdOf).filter(Boolean));
      const next = new Set([...current].filter((assetId) => availableIds.has(assetId)));
      return next.size === current.size ? current : next;
    });
  }, [assets]);

  const uploadFiles = React.useCallback(async (files) => {
    const selectedFiles = Array.from(files || []).filter(Boolean);
    if (!selectedFiles.length || busy) return;
    setBusy(true);
    setUploadProgress({ done: 0, total: selectedFiles.length });
    setError('');
    try {
      const failedUploads = [];
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        try {
          const uploaded = await SeedancePortraitStore.upload(file, {
            name: fileTitle(file),
            description: '',
          });
          let localPreviewUrl = '';
          if (!assetImageSrc(uploaded) && typeof URL !== 'undefined' && URL.createObjectURL) {
            localPreviewUrl = URL.createObjectURL(file);
            previewUrlsRef.current.push(localPreviewUrl);
          }
          setAssets((current) => mergePortraitAssets([{
            ...uploaded,
            name: uploaded.name || fileTitle(file),
            localPreviewUrl,
          }], current));
        } catch (uploadError) {
          failedUploads.push(`${file?.name || `第 ${index + 1} 张`}: ${uploadError?.message || '上传失败'}`);
        }
        setUploadProgress({ done: index + 1, total: selectedFiles.length });
      }
      if (failedUploads.length) {
        const prefix = failedUploads.length === selectedFiles.length ? '上传失败' : '部分图片上传失败';
        setError(`${prefix}：${failedUploads.join('；')}`);
      }
    } finally {
      setBusy(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  }, [busy]);

  const onFileChange = React.useCallback((event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    uploadFiles(files);
  }, [uploadFiles]);

  const deleteAsset = React.useCallback(async (asset) => {
    const assetId = assetIdOf(asset);
    if (!assetId || deletingAssetId) return;
    setDeletingAssetId(assetId);
    setError('');
    try {
      await SeedancePortraitStore.delete(assetId);
      setAssets((current) => current.filter((item) => (item.assetId || item.asset_id) !== assetId));
      setSelectedAssetIds((current) => {
        if (!current.has(assetId)) return current;
        const next = new Set(current);
        next.delete(assetId);
        return next;
      });
    } catch (deleteError) {
      setError(deleteError?.message || '删除失败，请稍后重试');
    } finally {
      setDeletingAssetId('');
    }
  }, [deletingAssetId]);

  const selectedAssets = React.useMemo(
    () => assets.filter((asset) => selectedAssetIds.has(assetIdOf(asset))),
    [assets, selectedAssetIds],
  );

  const toggleAssetSelected = React.useCallback((asset, checked) => {
    const assetId = assetIdOf(asset);
    if (!assetId || deletingAssetId) return;
    setSelectedAssetIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(assetId);
      } else {
        next.delete(assetId);
      }
      return next;
    });
  }, [deletingAssetId]);

  const deleteSelectedAssets = React.useCallback(async () => {
    if (!selectedAssets.length || deletingAssetId) return;
    setDeletingAssetId('__batch__');
    setDeleteProgress({ done: 0, total: selectedAssets.length });
    setError('');
    const failedDeletes = [];
    try {
      for (let index = 0; index < selectedAssets.length; index += 1) {
        const asset = selectedAssets[index];
        const assetId = assetIdOf(asset);
        if (!assetId) {
          setDeleteProgress({ done: index + 1, total: selectedAssets.length });
          continue;
        }
        try {
          await SeedancePortraitStore.delete(assetId);
          setAssets((current) => current.filter((item) => assetIdOf(item) !== assetId));
          setSelectedAssetIds((current) => {
            if (!current.has(assetId)) return current;
            const next = new Set(current);
            next.delete(assetId);
            return next;
          });
        } catch (deleteError) {
          failedDeletes.push(`${assetTitle(asset)}: ${deleteError?.message || '删除失败'}`);
        }
        setDeleteProgress({ done: index + 1, total: selectedAssets.length });
      }
      if (failedDeletes.length) {
        const prefix = failedDeletes.length === selectedAssets.length ? '删除失败' : '部分角色删除失败';
        setError(`${prefix}：${failedDeletes.join('；')}`);
      }
    } finally {
      setDeletingAssetId('');
      setDeleteProgress({ done: 0, total: 0 });
    }
  }, [deletingAssetId, selectedAssets]);

  const pickAsset = React.useCallback((asset) => {
    if (typeof onPick === 'function') {
      onPick(asset);
    }
  }, [onPick]);

  return (
    <XModal
      title="Seedence 角色库"
      icon={<ISparkle size={16}/>}
      onClose={onClose}
      className="seedence-portrait-modal"
      footer={(
        <>
          <span className="x-credit">生成时引用 asset://素材ID</span>
          <span style={{ flex: 1 }}/>
          {selectedAssetIds.size ? (
            <button
              type="button"
              className="x-btn danger"
              onClick={deleteSelectedAssets}
              disabled={Boolean(deletingAssetId)}
            >
              <ITrash size={12}/>
              {deletingAssetId === '__batch__'
                ? `删除中 ${deleteProgress.done}/${deleteProgress.total}`
                : `删除所选(${selectedAssetIds.size})`}
            </button>
          ) : null}
          <button
            type="button"
            className="x-btn primary"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <IAdd size={12}/>
            {busy && uploadProgress.total > 1
              ? `上传中 ${uploadProgress.done}/${uploadProgress.total}`
              : (busy ? '上传中' : '上传角色图片')}
          </button>
          <input
            ref={inputRef}
            className="seedence-portrait-input"
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            disabled={busy}
          />
        </>
      )}
    >
      <div className="seedence-portrait-shell">
        <section className="seedence-portrait-intro">
          <span className="seedence-portrait-badge"><IImage size={14}/>Seedance Portrait Asset</span>
          <strong>支持 seedance-2-0-pro 和 seedance-2-0-fast 使用</strong>
          <p>上传角色图片后会得到素材 ID。生成 Seedance 2.0 Pro / Fast 视频时，在提示词或参数中引用 <code>asset://素材ID</code> 来锁定角色一致性。</p>
        </section>

        {error ? (
          <div className="seedence-portrait-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="seedence-portrait-list">
          {assets.map((asset) => {
            const src = assetImageSrc(asset);
            return (
              <article
                key={asset.assetId || asset.assetRef || asset.name}
                className={`seedence-portrait-card${onPick ? ' pickable' : ''}`}
                onClick={() => pickAsset(asset)}
              >
                <div className="seedence-portrait-thumb">
                  <label
                    className="seedence-portrait-select"
                    onClick={(event) => event.stopPropagation()}
                    title={`选择 ${assetTitle(asset)}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssetIds.has(assetIdOf(asset))}
                      onChange={(event) => toggleAssetSelected(asset, event.target.checked)}
                      disabled={Boolean(deletingAssetId)}
                      aria-label={`选择 ${assetTitle(asset)}`}
                    />
                  </label>
                  {src ? <img src={src} alt={assetTitle(asset)} /> : <IImage size={28}/>}
                </div>
                <div className="seedence-portrait-meta">
                  <strong title={assetTitle(asset)}>{assetTitle(asset)}</strong>
                  <span title={asset.assetId || ''}>assetId: {asset.assetId || '-'}</span>
                  <span title={asset.assetRef || ''}>assetRef: {asset.assetRef || '-'}</span>
                  <span title={asset.status || ''}>status: {asset.status || '-'}</span>
                </div>
                <div className="seedence-portrait-card-actions">
                  <button
                    type="button"
                    className="seedence-portrait-delete"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteAsset(asset);
                    }}
                    disabled={Boolean(deletingAssetId)}
                    title="删除角色图"
                    aria-label={`删除 ${assetTitle(asset)}`}
                  >
                    <ITrash size={12}/>{deletingAssetId === assetIdOf(asset) ? '删除中' : '删除'}
                  </button>
                </div>
              </article>
            );
          })}
          {!assets.length && (
            <div className="seedence-portrait-empty">
              <IImage size={24}/>
              <strong>还没有角色图片</strong>
              <span>上传一张清晰角色图，成功后这里会显示 assetId 和 assetRef。</span>
            </div>
          )}
        </div>
      </div>
    </XModal>
  );
}
