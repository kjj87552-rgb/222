import React from 'react';
import {
  IFolder, IAdd, ICheck, IImage, IVideo, IAudio, IClose, IEye,
} from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions, useSelection } from '../../../shared/store/uiStore.js';
import { useNodes, useProjectId, canvasActions } from '../../../shared/store/canvasStore.js';
import { libraryActions, useAssets } from '../../../shared/store/libraryStore.js';
import { AssetStore, GLOBAL_ASSET_PROJECT_ID } from '../../../shared/platform/assetStore.js';
import { makeAssetRecord } from '../../../shared/utils/asset.js';
import { readFileAsDataUrl } from '../../../shared/utils/file.js';
import { importLocalFileAsAsset } from '../../../shared/utils/uploadHelpers.js';
import {
  isGlobalAsset,
  isAssetLibraryItem,
  isProjectAsset,
  withAssetScope,
  withLibraryFlag,
  withProjectAssetScope,
} from '../../../shared/utils/assetScopes.js';
import {
  ASSET_TYPES,
  DEFAULT_STYLE_TAGS,
  getAssetTypeLabel,
  isVisualKind,
  makeVisualTaxonomyMeta,
  normalizeAssetType,
  normalizeLabel,
  normalizeTags,
} from '../../../shared/utils/assetTaxonomy.js';
import {
  MEDIA_KIND_LABELS,
  findActiveMediaMention,
  getMediaKind,
  getMediaSrc,
  getMediaTitle,
  isMediaAsset,
  makeMediaToken,
  mergeMediaReference,
  removeMediaMentionText,
} from '../../../shared/utils/mediaReferences.js';

const MEDIA_TABS = [
  { key: 'image', label: '图片素材', icon: IImage },
  { key: 'video', label: '视频素材', icon: IVideo },
  { key: 'audio', label: '音频素材', icon: IAudio },
];

const KIND_ICON = {
  image: IImage,
  video: IVideo,
  audio: IAudio,
};

function inferKindFromFile(file) {
  const mime = String(file?.type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  const name = String(file?.name || '').toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|avif|svg)$/.test(name)) return 'image';
  if (/\.(mp4|mov|webm|mkv|avi|m4v)$/.test(name)) return 'video';
  if (/\.(mp3|wav|m4a|aac|ogg|flac)$/.test(name)) return 'audio';
  return 'image';
}

function titleFromFile(file) {
  return String(file?.name || '本地素材').replace(/\.[^.]+$/, '') || '本地素材';
}

function assetKey(asset) {
  return asset?.id || getMediaSrc(asset);
}

function getAssetType(asset) {
  return normalizeAssetType(
    asset?.assetType
    || asset?.visualType
    || asset?.imageCategory
    || asset?.category
    || asset?.meta?.assetType
    || asset?.meta?.imageCategory
    || 'person'
  );
}

function getAssetStyles(asset) {
  const styles = [
    ...(Array.isArray(asset?.styleTags) ? asset.styleTags : []),
    ...(Array.isArray(asset?.styles) ? asset.styles : []),
    asset?.styleTag,
    asset?.assetStyle,
    asset?.style,
    asset?.meta?.styleTag,
    asset?.meta?.assetStyle,
    asset?.meta?.style,
  ];
  const normalized = normalizeTags(styles);
  return normalized.length ? normalized : ['未设风格'];
}

function assetMatches(asset, mediaTab, activeType, activeStyle) {
  const kind = getMediaKind(asset);
  if (kind !== mediaTab) return false;
  if (isVisualKind(kind)) {
    if (activeStyle !== 'all' && !getAssetStyles(asset).includes(activeStyle)) return false;
    if (activeType !== 'all' && getAssetType(asset) !== activeType) return false;
  }
  return true;
}

function mergeAssets(frontendAssets, backendAssets) {
  const map = new Map();
  [...(backendAssets || []), ...(frontendAssets || [])].forEach((asset) => {
    if (!isMediaAsset(asset)) return;
    map.set(assetKey(asset), asset);
  });
  return Array.from(map.values()).sort((a, b) => {
    const ta = Date.parse(a.createdAt || a.mtime || 0) || 0;
    const tb = Date.parse(b.createdAt || b.mtime || 0) || 0;
    return tb - ta;
  });
}

function assetAllowedForNode(asset, nodeType) {
  const kind = getMediaKind(asset);
  if (nodeType === 'image') return kind === 'image';
  if (nodeType === 'video') return kind === 'image' || kind === 'video' || kind === 'audio';
  return false;
}

function MediaThumb({ asset }) {
  const kind = getMediaKind(asset);
  const src = getMediaSrc(asset);
  const Icon = KIND_ICON[kind] || IFolder;
  if (kind === 'image') return <img src={src} alt="" draggable="false" />;
  if (kind === 'video') {
    return (
      <>
        <video src={src} muted playsInline preload="metadata" />
        <span className="sb-play"><IVideo size={18}/></span>
      </>
    );
  }
  return (
    <div className="sb-audio-thumb">
      <Icon size={28}/>
      <div className="sb-wave" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} style={{ height: `${8 + (index % 5) * 5}px` }} />
        ))}
      </div>
    </div>
  );
}

export function SubjectLibModal({ initialScope = 'project', onUseAsset } = {}) {
  const onClose = uiActions.closeOverlayModal;
  const inputRef = React.useRef(null);
  const uploadInputId = React.useId();
  const projectId = useProjectId();
  const assets = useAssets();
  const nodes = useNodes();
  const selection = useSelection();
  const [backendAssets, setBackendAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [libraryScope, setLibraryScope] = React.useState(initialScope === 'global' ? 'global' : 'project');
  const [mediaTab, setMediaTab] = React.useState('image');
  const [uploadStyle, setUploadStyle] = React.useState(DEFAULT_STYLE_TAGS[0]);
  const [activeStyle, setActiveStyle] = React.useState('all');
  const [styleDraft, setStyleDraft] = React.useState('');
  const [uploadAssetType, setUploadAssetType] = React.useState('person');
  const [activeAssetType, setActiveAssetType] = React.useState('all');
  const [typeDraft, setTypeDraft] = React.useState('');
  const [previewAsset, setPreviewAsset] = React.useState(null);
  const [deletedAssetKeys, setDeletedAssetKeys] = React.useState([]);
  const [notice, setNotice] = React.useState('');
  const [globalPickerOpen, setGlobalPickerOpen] = React.useState(false);
  const [globalBackendAssets, setGlobalBackendAssets] = React.useState([]);
  const [globalLoading, setGlobalLoading] = React.useState(false);

  const activeNode = React.useMemo(() => {
    if (selection.length !== 1) return null;
    const node = nodes.find((item) => item.id === selection[0]);
    return node && (node.type === 'image' || node.type === 'video') ? node : null;
  }, [nodes, selection]);

  const activeLibraryProjectId = libraryScope === 'global'
    ? GLOBAL_ASSET_PROJECT_ID
    : (projectId || 'local-default');

  const refreshBackendAssets = React.useCallback(() => {
    setLoading(true);
    AssetStore.list({ project_id: activeLibraryProjectId })
      .then((result) => setBackendAssets(Array.isArray(result?.assets) ? result.assets : []))
      .catch(() => setBackendAssets([]))
      .finally(() => setLoading(false));
  }, [activeLibraryProjectId]);

  const refreshGlobalPickerAssets = React.useCallback(() => {
    setGlobalLoading(true);
    return AssetStore.list({ project_id: GLOBAL_ASSET_PROJECT_ID })
      .then((result) => setGlobalBackendAssets(Array.isArray(result?.assets) ? result.assets : []))
      .catch(() => setGlobalBackendAssets([]))
      .finally(() => setGlobalLoading(false));
  }, []);

  React.useEffect(() => {
    refreshBackendAssets();
  }, [refreshBackendAssets, assets.length]);

  React.useEffect(() => {
    setPreviewAsset(null);
    setNotice('');
    setGlobalPickerOpen(false);
  }, [libraryScope]);

  React.useEffect(() => {
    if (!globalPickerOpen) return;
    refreshGlobalPickerAssets();
  }, [globalPickerOpen, refreshGlobalPickerAssets]);

  React.useEffect(() => {
    setLibraryScope(initialScope === 'global' ? 'global' : 'project');
  }, [initialScope]);

  const mediaAssets = React.useMemo(
    () => {
      const deleted = new Set(deletedAssetKeys);
      const scopedFrontendAssets = assets
        .filter(isAssetLibraryItem)
        .filter((asset) => (
          libraryScope === 'global'
            ? isGlobalAsset(asset)
            : isProjectAsset(asset, projectId)
        ));
      const scopedBackendAssets = backendAssets
        .filter(isAssetLibraryItem)
        .map((asset) => withAssetScope(asset, activeLibraryProjectId, libraryScope));
      return mergeAssets(scopedFrontendAssets, scopedBackendAssets).filter((asset) => !deleted.has(assetKey(asset)));
    },
    [activeLibraryProjectId, assets, backendAssets, deletedAssetKeys, libraryScope, projectId]
  );

  const counts = React.useMemo(() => mediaAssets.reduce((acc, asset) => {
    const kind = getMediaKind(asset);
    acc[kind] = (acc[kind] || 0) + 1;
    return acc;
  }, { image: 0, video: 0, audio: 0 }), [mediaAssets]);

  const styleOptions = React.useMemo(() => (
    Array.from(new Set([
      ...DEFAULT_STYLE_TAGS,
      ...mediaAssets.filter((asset) => isVisualKind(getMediaKind(asset))).flatMap(getAssetStyles),
      uploadStyle,
    ].filter(Boolean))).slice(0, 40)
  ), [mediaAssets, uploadStyle]);

  const assetTypeOptions = React.useMemo(() => {
    const map = new Map(ASSET_TYPES.map((item) => [item.key, item]));
    mediaAssets
      .filter((asset) => isVisualKind(getMediaKind(asset)))
      .forEach((asset) => {
        const key = getAssetType(asset);
        map.set(key, { key, label: getAssetTypeLabel(key) });
      });
    if (uploadAssetType) {
      const key = normalizeAssetType(uploadAssetType);
      map.set(key, { key, label: getAssetTypeLabel(key) });
    }
    return Array.from(map.values()).slice(0, 40);
  }, [mediaAssets, uploadAssetType]);

  const visibleAssets = React.useMemo(() => mediaAssets.filter((asset) => (
    assetMatches(asset, mediaTab, isVisualKind(mediaTab) ? activeAssetType : 'all', isVisualKind(mediaTab) ? activeStyle : 'all')
  )), [activeAssetType, activeStyle, mediaAssets, mediaTab]);

  const globalPickerAssets = React.useMemo(() => {
    const deleted = new Set(deletedAssetKeys);
    const scopedFrontendAssets = assets
      .filter(isAssetLibraryItem)
      .filter(isGlobalAsset);
    const scopedBackendAssets = globalBackendAssets
      .filter(isAssetLibraryItem)
      .map((asset) => withAssetScope(asset, GLOBAL_ASSET_PROJECT_ID, 'global'));
    return mergeAssets(scopedFrontendAssets, scopedBackendAssets)
      .filter((asset) => !deleted.has(assetKey(asset)))
      .filter((asset) => assetMatches(
        asset,
        mediaTab,
        isVisualKind(mediaTab) ? activeAssetType : 'all',
        isVisualKind(mediaTab) ? activeStyle : 'all',
      ));
  }, [activeAssetType, activeStyle, assets, deletedAssetKeys, globalBackendAssets, mediaTab]);

  React.useEffect(() => {
    if (mediaTab !== 'image') setPreviewAsset(null);
  }, [mediaTab]);

  const addCustomStyle = React.useCallback((rawStyle) => {
    const style = normalizeLabel(rawStyle);
    if (!style) return;
    setUploadStyle(style);
    setActiveStyle(style);
    setStyleDraft('');
  }, []);

  const addCustomType = React.useCallback((rawType) => {
    const type = normalizeLabel(rawType);
    if (!type) return;
    setUploadAssetType(type);
    setActiveAssetType(normalizeAssetType(type));
    setTypeDraft('');
  }, []);

  const attachToActiveNode = React.useCallback((asset) => {
    if (!activeNode) return;
      const token = makeMediaToken(asset);
      canvasActions.updateNode(activeNode.id, (current) => {
        const basePrompt = current.promptDraft ?? current.prompt ?? '';
        const mention = findActiveMediaMention(basePrompt, basePrompt.length);
        const promptNext = removeMediaMentionText(basePrompt, mention).value;
        return {
          promptDraft: promptNext,
          referenceAssets: mergeMediaReference(current.referenceAssets, { ...asset, token }),
      };
    });
    setNotice('已添加到当前节点参考列表');
  }, [activeNode]);

  const findProjectCopy = React.useCallback((asset) => {
    const src = getMediaSrc(asset);
    const originalId = asset?.id || asset?.assetId || '';
    return assets.find((item) => (
      isProjectAsset(item, projectId)
      && (
        (originalId && (item.originalAssetId === originalId || item.sourceAssetId === originalId || item.globalAssetId === originalId))
        || (src && getMediaSrc(item) === src)
      )
    ));
  }, [assets, projectId]);

  const importGlobalAssetToProject = React.useCallback((asset, options = {}) => {
    if (!asset || !projectId) return null;
    const existing = findProjectCopy(asset);
    const kind = getMediaKind(asset) || mediaTab;
    const src = getMediaSrc(asset);
    const title = getMediaTitle(asset);
    const projectAsset = existing || withLibraryFlag(withProjectAssetScope({
      ...makeAssetRecord({ kind, src, title, source: 'global-import' }),
      ...asset,
      id: `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      originalAssetId: asset.id || asset.assetId,
      sourceAssetId: asset.id || asset.assetId,
      globalAssetId: asset.id || asset.assetId,
      kind,
      src,
      url: asset.url || src,
      title,
      source: 'global-import',
    }, projectId));
    if (!existing) {
      libraryActions.addAssets([projectAsset]);
    }
    if (options.attach && activeNode && assetAllowedForNode(projectAsset, activeNode.type)) attachToActiveNode(projectAsset);
    if (options.addToCanvas !== false) onUseAsset?.(projectAsset);
    setNotice(options.attach
      ? (existing ? '该素材已添加到当前节点参考列表' : '已加入项目并添加到当前节点参考列表')
      : (existing ? '该素材已在当前项目素材中' : '已加入当前项目素材'));
    return projectAsset;
  }, [activeNode, attachToActiveNode, findProjectCopy, mediaTab, onUseAsset, projectId]);

  const deleteAsset = React.useCallback(async (asset) => {
    if (!asset) return;
    const key = assetKey(asset);
    const ok = window.confirm(`删除图片素材「${getMediaTitle(asset)}」？`);
    if (!ok) return;
    setDeletedAssetKeys((current) => Array.from(new Set([...current, key])));
    libraryActions.removeAsset(asset);
    if (asset.id) {
      try {
        await AssetStore.delete(asset.id);
      } catch (error) {
        console.warn('Delete asset persistence failed; removed from current library view only', error);
      }
    }
    if (previewAsset && assetKey(previewAsset) === key) setPreviewAsset(null);
  }, [previewAsset]);

  const recordImportedAssets = React.useCallback((records) => {
    const clean = records
      .filter((asset) => asset && getMediaSrc(asset))
      .map((asset) => {
        const kind = getMediaKind(asset) || mediaTab;
        const title = getMediaTitle(asset);
        const src = getMediaSrc(asset);
        const visualMeta = isVisualKind(kind)
          ? makeVisualTaxonomyMeta({ styleTag: uploadStyle, assetType: uploadAssetType })
          : {};
        return withLibraryFlag(withAssetScope({
          ...makeAssetRecord({ kind, src, title, source: asset.source || 'import' }),
          ...asset,
          kind,
          src,
          title,
          ...visualMeta,
        }, activeLibraryProjectId, libraryScope));
      });
    libraryActions.recordAssets(clean);
  }, [activeLibraryProjectId, libraryScope, mediaTab, uploadAssetType, uploadStyle]);

  const uploadMeta = React.useMemo(() => (
    isVisualKind(mediaTab)
      ? makeVisualTaxonomyMeta({ styleTag: uploadStyle, assetType: uploadAssetType })
      : {}
  ), [mediaTab, uploadAssetType, uploadStyle]);

  const handleUploadFiles = React.useCallback(async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const records = await Promise.all(files.map(async (file) => {
        const kind = inferKindFromFile(file);
        const title = titleFromFile(file);
        const meta = isVisualKind(kind)
          ? { ...uploadMeta, source: 'library-upload', inLibrary: true, libraryAsset: true, scope: libraryScope, projectId: activeLibraryProjectId, project_id: activeLibraryProjectId }
          : { source: 'library-upload', inLibrary: true, libraryAsset: true, scope: libraryScope, projectId: activeLibraryProjectId, project_id: activeLibraryProjectId };
        let persisted = await importLocalFileAsAsset(file, activeLibraryProjectId, kind, meta);
        let dataUrl = '';
        if (!persisted) {
          dataUrl = await readFileAsDataUrl(file);
        }
        if (!persisted && AssetStore.writeAvailable()) {
          try {
            persisted = await AssetStore.writeDataUrl(activeLibraryProjectId, {
              filename: file.name,
              dataUrl,
              kind,
              mime: file.type,
              meta,
            });
          } catch (error) {
            console.warn('Subject media upload persistence failed; using in-memory asset', error);
          }
        }
        const src = persisted?.src || persisted?.url || dataUrl;
        return {
          ...(persisted || {}),
          kind: persisted?.kind || kind,
          src,
          url: persisted?.url || src,
          title: persisted?.title || title,
          source: persisted ? 'upload-local' : 'upload',
          mime: file.type,
        };
      }));
      recordImportedAssets(records);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [activeLibraryProjectId, libraryScope, recordImportedAssets, uploadMeta]);

  const openUploadPicker = React.useCallback(async () => {
    if (uploading) return;
    if (AssetStore.available()) {
      setUploading(true);
      try {
        const records = await AssetStore.pickAndImport(activeLibraryProjectId, {
          multiple: true,
          kind: mediaTab,
          meta: { ...uploadMeta, source: 'library-import', inLibrary: true, libraryAsset: true, scope: libraryScope, projectId: activeLibraryProjectId, project_id: activeLibraryProjectId },
        });
        recordImportedAssets(records);
      } catch (error) {
        console.error('Native media import failed', error);
        inputRef.current?.click();
      } finally {
        setUploading(false);
      }
      return;
    }
    inputRef.current?.click();
  }, [activeLibraryProjectId, libraryScope, mediaTab, recordImportedAssets, uploadMeta, uploading]);

  const accept = mediaTab === 'image' ? 'image/*' : mediaTab === 'video' ? 'video/*' : 'audio/*';
  const showImageTools = mediaTab === 'image';
  const showTaxonomyTools = isVisualKind(mediaTab);
  const scopeTitle = libraryScope === 'global' ? '全局资产库' : '项目素材';

  return (
    <XModal
      title="画布资产库"
      icon={<IFolder size={16}/>}
      onClose={onClose}
      className="sb-modal media-subject-modal"
      footer={(
        <>
          <span className="x-credit">
            {activeNode
              ? `当前节点：${activeNode.title || activeNode.id}`
              : (libraryScope === 'global' ? '全局资产可跨项目复用' : '项目素材可添加到节点参考列表')}
          </span>
          <span style={{ flex: 1 }}/>
          <button className="x-btn ghost" type="button" onClick={refreshBackendAssets} disabled={loading}>
            {loading ? '同步中' : '刷新'}
          </button>
          <label className={`x-btn primary media-upload-label ${uploading ? 'disabled' : ''}`} htmlFor={uploadInputId}>
            <IAdd size={12}/>{uploading ? '上传中' : `上传到${libraryScope === 'global' ? '全局资产库' : '项目素材'}`}
            <input
              ref={inputRef}
              id={uploadInputId}
              type="file"
              multiple
              accept={accept}
              disabled={uploading}
              onChange={(event) => handleUploadFiles(event.target.files)}
            />
          </label>
        </>
      )}
    >
      <div className="media-lib-tabs compact">
        {MEDIA_TABS.map(({ key, label, icon: IconComp }) => (
          <button
            key={key}
            type="button"
            className={mediaTab === key ? 'active' : ''}
            onClick={() => setMediaTab(key)}
          >
            <IconComp size={14}/>
            <span>{label}</span>
            <em>{counts[key] || 0}</em>
          </button>
        ))}
      </div>

      {libraryScope === 'project' && (
        <div className="media-library-command-row">
          <div>
            <strong>项目资产库</strong>
            <span>点击素材可添加到当前节点参考列表</span>
          </div>
          <button type="button" onClick={() => setGlobalPickerOpen(true)}>
            <IAdd size={12}/>添加全局资产库
          </button>
        </div>
      )}

      {notice ? <div className="media-library-notice">{notice}</div> : null}

      {showTaxonomyTools && (
        <div className="image-upload-settings">
          <div className="setting-block styles">
            <span>一级风格</span>
            <div className="upload-tag-row">
              {styleOptions.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={uploadStyle === style ? 'active' : ''}
                  onClick={() => {
                    setUploadStyle(style);
                    setActiveStyle(style);
                  }}
                >
                  {style}
                </button>
              ))}
              <form
                className="inline-tag-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  addCustomStyle(styleDraft);
                }}
              >
                <input value={styleDraft} onChange={(event) => setStyleDraft(event.target.value)} placeholder="自定义风格"/>
                <button type="submit"><IAdd size={11}/></button>
              </form>
            </div>
          </div>
          <div className="setting-block types">
            <span>二级类型</span>
            <div className="setting-segment dynamic">
              {assetTypeOptions.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={normalizeAssetType(uploadAssetType) === item.key ? 'active' : ''}
                  onClick={() => {
                    setUploadAssetType(item.key);
                    setActiveAssetType(item.key);
                  }}
                >
                  {item.label}
                </button>
              ))}
              <form
                className="inline-tag-form taxonomy-add-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  addCustomType(typeDraft);
                }}
              >
                <input value={typeDraft} onChange={(event) => setTypeDraft(event.target.value)} placeholder="添加类型"/>
                <button type="submit"><IAdd size={11}/></button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="media-library-layout grid-only">
        <div className="sb-grid media-grid tile-grid">
          {visibleAssets.map((asset) => {
            const kind = getMediaKind(asset);
            const title = getMediaTitle(asset);
            const token = makeMediaToken(asset);
            const canAttach = libraryScope === 'project' && Boolean(activeNode && assetAllowedForNode(asset, activeNode.type));
            const canImportAndAttach = libraryScope === 'global' && Boolean(activeNode && assetAllowedForNode(asset, activeNode.type));
            const alreadyInProject = libraryScope === 'global' && Boolean(findProjectCopy(asset));
            return (
              <div key={assetKey(asset)} className="sb-card media-card image-tile">
                <div className="thumb">
                  <MediaThumb asset={asset}/>
                  {kind === 'image' && (
                    <button
                      type="button"
                      className="media-eye-btn"
                      onClick={() => setPreviewAsset(asset)}
                      title="放大预览"
                    >
                      <IEye size={18}/>
                    </button>
                  )}
                  {kind === 'image' && (
                    <button
                      type="button"
                      className="media-delete-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteAsset(asset);
                      }}
                      title="删除图片"
                    >
                      <IClose size={13}/>
                    </button>
                  )}
                  <span className="check-pill">
                    <ICheck size={10}/>{isVisualKind(kind) ? getAssetTypeLabel(getAssetType(asset)) : MEDIA_KIND_LABELS[kind]}
                  </span>
                </div>
                <div className="meta">
                  <span className="n">{title}</span>
                  <span className="role">{token}</span>
                </div>
                {isVisualKind(kind) && (
                  <div className="media-card-tags">
                    {getAssetStyles(asset).slice(0, 2).map((style) => <span key={style}>{style}</span>)}
                    <span>{getAssetTypeLabel(getAssetType(asset))}</span>
                  </div>
                )}
                {libraryScope === 'project' ? (
                  <button
                    type="button"
                    className="media-card-use"
                    onClick={(event) => { event.stopPropagation(); if (canAttach) attachToActiveNode(asset); }}
                    disabled={!canAttach}
                  >
                    添加参考
                  </button>
                ) : (
                  <div className="media-card-global-actions">
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); importGlobalAssetToProject(asset); }}
                      disabled={alreadyInProject}
                    >
                      {alreadyInProject ? '已在项目' : '加入项目'}
                    </button>
                    {canImportAndAttach && (
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); importGlobalAssetToProject(asset, { attach: true, addToCanvas: false }); }}
                      >
                        加入并添加参考
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!visibleAssets.length && (
            <div className="sb-empty">
              <strong>{scopeTitle}暂无素材</strong>
              <span>{libraryScope === 'global' ? '只有主动上传或保存到全局资产库的素材会出现在这里。' : '只有主动上传或保存的素材会出现在这里，生成历史在项目历史记录中查看。'}</span>
            </div>
          )}
        </div>
      </div>

      {previewAsset && (
        <div className="media-preview-mask" onPointerDown={() => setPreviewAsset(null)}>
          <div className="media-preview-dialog" onPointerDown={(event) => event.stopPropagation()}>
            <header>
              <strong>{getMediaTitle(previewAsset)}</strong>
              <button type="button" onClick={() => setPreviewAsset(null)}><IClose size={14}/></button>
            </header>
            <div className="media-preview-stage">
              <img src={getMediaSrc(previewAsset)} alt="" />
            </div>
          </div>
        </div>
      )}

      {globalPickerOpen && (
        <div className="media-global-picker-mask" onPointerDown={() => setGlobalPickerOpen(false)}>
          <section
            className="media-global-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="从全局资产库添加"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>全局资产库</span>
                <strong>从全局资产库添加</strong>
              </div>
              <div>
                <button type="button" className="ghost" onClick={refreshGlobalPickerAssets} disabled={globalLoading}>
                  {globalLoading ? '同步中' : '刷新'}
                </button>
                <button type="button" className="close" onClick={() => setGlobalPickerOpen(false)} aria-label="关闭全局资产选择">
                  <IClose size={14}/>
                </button>
              </div>
            </header>
            <p>选择全局素材补充到当前项目资产库，补充后的项目副本才可以添加到节点参考列表。</p>
            <div className="media-global-picker-grid">
              {globalPickerAssets.map((asset) => {
                const kind = getMediaKind(asset);
                const title = getMediaTitle(asset);
                const alreadyInProject = Boolean(findProjectCopy(asset));
                return (
                  <div key={assetKey(asset)} className="sb-card media-card image-tile">
                    <div className="thumb">
                      <MediaThumb asset={asset}/>
                      <span className="check-pill">
                        <ICheck size={10}/>{isVisualKind(kind) ? getAssetTypeLabel(getAssetType(asset)) : MEDIA_KIND_LABELS[kind]}
                      </span>
                    </div>
                    <div className="meta">
                      <span className="n">{title}</span>
                      <span className="role">{MEDIA_KIND_LABELS[kind] || kind} · 全局</span>
                    </div>
                    {isVisualKind(kind) && (
                      <div className="media-card-tags">
                        {getAssetStyles(asset).slice(0, 2).map((style) => <span key={style}>{style}</span>)}
                        <span>{getAssetTypeLabel(getAssetType(asset))}</span>
                      </div>
                    )}
                    <div className="media-card-global-actions">
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); importGlobalAssetToProject(asset); }}
                        disabled={alreadyInProject}
                      >
                        {alreadyInProject ? '已在项目' : '加入项目'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {!globalPickerAssets.length && (
                <div className="sb-empty">
                  <strong>{globalLoading ? '正在同步全局资产' : '当前分类暂无全局素材'}</strong>
                  <span>先在全局资产库上传或保存素材，然后从这里加入当前项目。</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </XModal>
  );
}
