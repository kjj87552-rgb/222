import React from 'react';
import { AssetStore, GLOBAL_ASSET_PROJECT_ID } from '../../shared/platform/assetStore.js';
import { libraryActions } from '../../shared/store/libraryStore.js';
import { ITrash } from '../../shared/ui/icons/index.jsx';
import { getAssetProjectId, isAssetLibraryItem, isGlobalAsset, isProjectAsset } from '../../shared/utils/assetScopes.js';

const MEDIA_TABS = [
  { key: 'all', label: '全部' },
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
  { key: 'audio', label: '音频' },
  { key: 'text', label: '文本 / 脚本' },
];

function inferKind(item) {
  const kind = String(item?.kind || item?.mediaKind || '').trim().toLowerCase();
  if (kind === 'image' || kind === 'video' || kind === 'audio' || kind === 'text' || kind === 'script') return kind;
  const mime = String(item?.mime || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  const src = String(item?.src || item?.url || item?.assetUrl || '').toLowerCase();
  if (src.startsWith('data:image/') || /\.(png|jpe?g|webp|gif|avif|bmp|svg)(?:$|\?)/.test(src)) return 'image';
  if (src.startsWith('data:video/') || /\.(mp4|mov|webm|mkv|avi)(?:$|\?)/.test(src)) return 'video';
  if (src.startsWith('data:audio/') || /\.(mp3|wav|m4a|flac|ogg|aac)(?:$|\?)/.test(src)) return 'audio';
  if (item?.text || item?.prompt || String(item?.action || '').includes('text')) return 'text';
  return 'asset';
}

function mediaSrc(item) {
  return item?.src || item?.url || item?.assetUrl || item?.thumb || item?.thumbnail || '';
}

function mediaTitle(item) {
  return item?.title || item?.name || item?.filename || item?.prompt || item?.id || '未命名素材';
}

function assetRecordKey(item) {
  if (!item) return '';
  const id = item.id || item.assetId;
  if (id) return `id:${id}`;
  const src = mediaSrc(item);
  if (src) return `src:${src}`;
  const title = mediaTitle(item);
  return title ? `title:${title}` : '';
}

function assetRecordsMatch(a, b) {
  const aKey = assetRecordKey(a);
  const bKey = assetRecordKey(b);
  return Boolean(aKey && bKey && aKey === bKey);
}

function mediaTime(item) {
  const raw = item?.createdAt || item?.time || item?.updatedAt || '';
  if (!raw) return '刚刚';
  const value = String(raw);
  if (!value.includes('T')) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
}

function normalizeMediaRecord(item, source) {
  if (!item) return null;
  const src = mediaSrc(item);
  const kind = inferKind(item);
  const id = item.id || item.assetId || `${source}-${kind}-${src || mediaTitle(item)}`;
  return {
    ...item,
    id,
    kind,
    src,
    title: mediaTitle(item),
    source: item.source || source,
    createdAt: item.createdAt || item.time,
  };
}

function mergeMediaRecords(...groups) {
  const seen = new Set();
  const merged = [];
  groups.flat().forEach((raw) => {
    const item = normalizeMediaRecord(raw, raw?.source || 'local');
    if (!item) return;
    const key = item.src || item.assetId || item.id;
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });
  return merged.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

export function getAssetLibraryRecords({ scope = 'global', backendAssets = [], localScopedAssets = [] } = {}) {
  const includeRecord = (asset) => (scope === 'global' ? isAssetLibraryItem(asset) : true);
  return mergeMediaRecords(
    (backendAssets || []).filter(includeRecord),
    (localScopedAssets || []).filter(includeRecord),
  );
}

function tabMatches(item, tab) {
  if (tab === 'all') return true;
  if (tab === 'text') return item.kind === 'text' || item.kind === 'script' || item.kind === 'asset';
  return item.kind === tab;
}

function projectNameFor(projects, projectId, fallback = '未命名项目') {
  return projects.find((item) => item.id === projectId)?.name || fallback;
}

function uniqueProjects(projects, project) {
  const map = new Map();
  [...(projects || []), project].forEach((item) => {
    if (!item?.id || item.id === GLOBAL_ASSET_PROJECT_ID || map.has(item.id)) return;
    map.set(item.id, item);
  });
  return Array.from(map.values());
}

function PreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M4.8 12s2.45-5.2 7.2-5.2 7.2 5.2 7.2 5.2-2.45 5.2-7.2 5.2S4.8 12 4.8 12Z" />
      <path d="M12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z" />
      <path d="M17.2 17.2 20 20" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="m7.4 7.4 9.2 9.2M16.6 7.4l-9.2 9.2" />
    </svg>
  );
}

function renderPreviewContent(asset) {
  const src = mediaSrc(asset);
  if (asset.kind === 'image' && src) return <img src={src} alt={asset.title || '素材预览'} />;
  if (asset.kind === 'video' && src) return <video src={src} controls autoPlay muted />;
  if (asset.kind === 'audio' && src) return <audio src={src} controls />;
  return (
    <div className="media-preview-text">
      <strong>{asset.title}</strong>
      <p>{asset.text || asset.prompt || asset.description || '暂无可预览内容'}</p>
    </div>
  );
}

export function AssetLibraryPage({
  assets = [],
  projects = [],
  project,
  projectId,
  initialScope = 'global',
  onImportAssets,
  onUseAsset,
}) {
  const projectOptions = React.useMemo(() => uniqueProjects(projects, project), [projects, project]);
  const fallbackProjectId = projectId || project?.id || projectOptions[0]?.id || 'local-default';
  const [scope, setScope] = React.useState(initialScope === 'project' ? 'project' : 'global');
  const [selectedProjectId, setSelectedProjectId] = React.useState(fallbackProjectId);
  const [projectDrilldown, setProjectDrilldown] = React.useState(false);
  const [backendAssets, setBackendAssets] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState('all');
  const [promotingId, setPromotingId] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);
  const [notice, setNotice] = React.useState('');
  const [previewAsset, setPreviewAsset] = React.useState(null);

  React.useEffect(() => {
    if (!previewAsset || typeof window === 'undefined') return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPreviewAsset(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewAsset]);

  React.useEffect(() => {
    if (!projectOptions.some((item) => item.id === selectedProjectId)) {
      setSelectedProjectId(fallbackProjectId);
    }
  }, [fallbackProjectId, projectOptions, selectedProjectId]);

  const isProjectIndex = scope === 'project' && !projectDrilldown;
  const activeProjectId = scope === 'global' ? GLOBAL_ASSET_PROJECT_ID : (selectedProjectId || fallbackProjectId);
  const activeProjectName = scope === 'global'
    ? '全局资产'
    : (isProjectIndex ? '项目资产' : projectNameFor(projectOptions, activeProjectId, project?.name || '当前项目'));
  const shouldListAssets = scope === 'global' || projectDrilldown;

  const refreshAssets = React.useCallback(() => {
    if (!shouldListAssets || !activeProjectId) {
      setBackendAssets([]);
      setLoading(false);
      return Promise.resolve();
    }
    setLoading(true);
    return AssetStore.list({ project_id: activeProjectId })
      .then((result) => setBackendAssets(Array.isArray(result?.assets) ? result.assets : []))
      .catch(() => setBackendAssets(null))
      .finally(() => setLoading(false));
  }, [activeProjectId, shouldListAssets]);

  React.useEffect(() => {
    refreshAssets();
  }, [refreshAssets, assets.length]);

  const currentProjectId = projectId || project?.id;
  const localScopedAssets = React.useMemo(() => assets.filter((asset) => (
    scope === 'global'
      ? isGlobalAsset(asset)
      : projectDrilldown && activeProjectId === currentProjectId && isProjectAsset(asset, activeProjectId)
  )), [activeProjectId, assets, currentProjectId, projectDrilldown, scope]);
  const records = React.useMemo(
    () => getAssetLibraryRecords({ scope, backendAssets: backendAssets || [], localScopedAssets }),
    [backendAssets, localScopedAssets, scope],
  );
  const counts = React.useMemo(() => records.reduce((acc, item) => {
    const key = item.kind === 'script' || item.kind === 'asset' ? 'text' : item.kind;
    acc[key] = (acc[key] || 0) + 1;
    acc.all += 1;
    return acc;
  }, { all: 0, image: 0, video: 0, audio: 0, text: 0 }), [records]);
  const visibleRecords = React.useMemo(
    () => records.filter((item) => tabMatches(item, tab)),
    [records, tab],
  );
  const activeTabMeta = MEDIA_TABS.find((item) => item.key === tab) || MEDIA_TABS[0];
  const projectCards = React.useMemo(() => projectOptions.map((item) => {
    const localItems = assets.filter((asset) => isProjectAsset(asset, item.id));
    const localCounts = localItems.reduce((acc, asset) => {
      const kind = inferKind(asset);
      const key = kind === 'script' || kind === 'asset' ? 'text' : kind;
      acc[key] = (acc[key] || 0) + 1;
      acc.all += 1;
      return acc;
    }, { all: 0, image: 0, video: 0, audio: 0, text: 0 });
    return {
      ...item,
      assetTotal: item.assetCount ?? item.assetsCount ?? localCounts.all,
      imageTotal: item.imageCount ?? localCounts.image,
      videoTotal: item.videoCount ?? localCounts.video,
      updatedLabel: mediaTime({ createdAt: item.updatedAt || item.updated_at || item.time || item.createdAt }),
    };
  }), [assets, projectOptions]);
  const projectAssetTotal = projectCards.reduce((sum, item) => sum + (Number(item.assetTotal) || 0), 0);

  const handleScopeChange = React.useCallback((nextScope) => {
    setScope(nextScope);
    setTab('all');
    setNotice('');
    setProjectDrilldown(false);
  }, []);

  const handleOpenProject = React.useCallback((item) => {
    setScope('project');
    setSelectedProjectId(item.id);
    setProjectDrilldown(true);
    setTab('all');
    setNotice('');
  }, []);

  const handleBackToProjects = React.useCallback(() => {
    setProjectDrilldown(false);
    setTab('all');
    setNotice('');
  }, []);

  const handleImportAssets = React.useCallback(() => {
    setNotice('');
    const targetProjectId = activeProjectId;
    Promise.resolve(onImportAssets?.({
      scope,
      projectId: targetProjectId,
      targetProjectId,
      meta: {
        source: 'library-import',
        inLibrary: true,
        libraryAsset: true,
        scope,
        library: scope === 'global' ? 'global' : 'project',
      },
    })).finally(() => {
      window.setTimeout(() => refreshAssets(), 250);
    });
  }, [activeProjectId, onImportAssets, refreshAssets, scope]);

  const handlePromote = React.useCallback(async (asset) => {
    if (!asset?.id || scope === 'global') return;
    setNotice('');
    setPromotingId(asset.id);
    try {
      await AssetStore.promote(asset.id, {
        title: asset.title,
        tags: Array.isArray(asset.tags) ? asset.tags : [],
        meta: {
          sourceProjectName: activeProjectName,
          savedFrom: 'asset-library',
        },
      });
      setNotice('已保存到全局资产');
    } catch (error) {
      setNotice(`保存失败：${String(error?.message || error)}`);
    } finally {
      setPromotingId(null);
    }
  }, [activeProjectName, scope]);

  const handleDeleteAsset = React.useCallback(async (asset) => {
    if (!asset) return;
    const title = mediaTitle(asset);
    const confirmed = typeof window === 'undefined'
      || window.confirm(`删除素材「${title}」？此操作会从资产库移除该文件。`);
    if (!confirmed) return;

    const key = assetRecordKey(asset);
    const assetId = asset.id || asset.assetId;
    setNotice('');
    setDeletingId(key);
    try {
      if (assetId) {
        const result = await AssetStore.delete(assetId);
        if (result?.ok === false) throw new Error(result.error || '删除未完成');
      }
      libraryActions.removeAsset(asset);
      setBackendAssets((items) => (
        Array.isArray(items) ? items.filter((item) => !assetRecordsMatch(item, asset)) : items
      ));
      setPreviewAsset((current) => (assetRecordsMatch(current, asset) ? null : current));
      await refreshAssets();
      setNotice('已删除素材');
    } catch (error) {
      setNotice(`删除失败：${String(error?.message || error)}`);
    } finally {
      setDeletingId(null);
    }
  }, [refreshAssets]);

  return (
    <section className="home-page media-home-page asset-library-page" data-onboarding-id="asset-library">
      <div className="asset-library-frame">
        <div className="page-head media-page-head asset-page-head">
          <div>
            <h1>资产库</h1>
            <p className="sub">{activeProjectName} · 图片、视频、音频和文本素材</p>
          </div>
        </div>

        <div className="asset-main-tabs" aria-label="资产库一级分类">
          <button type="button" className={scope === 'project' ? 'active' : ''} onClick={() => handleScopeChange('project')}>
            <strong>项目资产</strong>
            <span>先选择项目卡片</span>
          </button>
          <button type="button" className={scope === 'global' ? 'active' : ''} onClick={() => handleScopeChange('global')}>
            <strong>全局资产</strong>
            <span>直接按分类查看</span>
          </button>
        </div>

        {!isProjectIndex ? (
          <div className="asset-category-strip" aria-label="素材类型">
            {MEDIA_TABS.map((item) => (
              <button key={item.key} type="button" className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)}>
                <strong>{item.label}</strong>
                <span>{counts[item.key] || 0}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className={`asset-library-shell ${isProjectIndex ? 'project-index' : 'media-view'}`}>
        {isProjectIndex ? (
          <main className="asset-project-index asset-panel">
            <div className="asset-content-head">
              <div>
                <span>项目资产</span>
                <h2>选择项目</h2>
              </div>
              <div className="asset-content-meta">
                <strong>{projectCards.length} projects</strong>
                <span>{projectAssetTotal} assets</span>
              </div>
            </div>
            {projectCards.length === 0 ? (
              <div className="empty-state">
                <strong>暂无项目</strong>
                <span>创建项目后，这里会以卡片形式显示项目资产入口。</span>
              </div>
            ) : (
              <div className="asset-project-card-grid">
                {projectCards.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="asset-project-card"
                    onClick={() => handleOpenProject(item)}
                  >
                    <span className="asset-project-badge">{Number(item.assetTotal) || 0} assets</span>
                    <div className="asset-project-glyph" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </div>
                    <strong>{item.name || '未命名项目'}</strong>
                    <em>{item.updatedLabel}</em>
                    <div className="asset-project-card-stats">
                      <span>{Number(item.imageTotal) || 0} 图片</span>
                      <span>{Number(item.videoTotal) || 0} 视频</span>
                    </div>
                    <b>进入项目</b>
                  </button>
                ))}
              </div>
            )}
          </main>
        ) : (
          <main className="asset-content-panel asset-panel media-panel">
          <div className="asset-content-head">
            <div>
              <span>当前视图</span>
              <h2>{scope === 'project' ? `${activeProjectName} / ${activeTabMeta.label}` : activeTabMeta.label}</h2>
            </div>
            <div className="asset-content-meta">
              {scope === 'project' ? (
                <button type="button" className="asset-back-link" onClick={handleBackToProjects}>返回项目</button>
              ) : (
                <strong>{activeProjectName}</strong>
              )}
              <span>{loading ? 'syncing' : `${visibleRecords.length} items`}</span>
            </div>
          </div>
          {notice ? <div className={`asset-library-notice ${notice.includes('失败') ? 'error' : ''}`}>{notice}</div> : null}
          {visibleRecords.length === 0 ? (
            <div className="empty-state">
              <strong>暂无素材</strong>
              <span>{scope === 'global' ? '本地素材同步后会显示在这里，也可以从项目资产保存为全局资产。' : '选择项目后会显示该画布项目的本地资产。'}</span>
            </div>
          ) : (
            <div className="media-grid">
              {visibleRecords.map((asset, index) => {
                const src = mediaSrc(asset);
                const key = `${asset.id || asset.src || asset.title}-${index}`;
                const deleteKey = assetRecordKey(asset);
                const isDeleting = deletingId === deleteKey;
                const assetProjectId = getAssetProjectId(asset);
                const assetProjectName = assetProjectId === GLOBAL_ASSET_PROJECT_ID
                  ? '全局'
                  : projectNameFor(projectOptions, assetProjectId, activeProjectName);
                const deleteKind = asset.kind === 'image' ? '图片' : '素材';
                return (
                  <article className={`media-card media-card-${asset.kind}`} key={key}>
                    <div className="media-thumb">
                      <span className="media-card-badge">{assetProjectName}</span>
                      {asset.kind === 'image' && src ? <img src={src} alt="" /> : null}
                      {asset.kind === 'video' && src ? <video src={src} muted preload="metadata" /> : null}
                      {asset.kind === 'audio' ? <div className="media-glyph">AUDIO</div> : null}
                      {(asset.kind === 'text' || asset.kind === 'script' || asset.kind === 'asset') ? <div className="media-glyph">{asset.kind.toUpperCase()}</div> : null}
                      <button
                        type="button"
                        className="media-delete-button"
                        aria-label={`删除${deleteKind} ${asset.title}`}
                        title={`删除${deleteKind}`}
                        disabled={isDeleting}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteAsset(asset);
                        }}
                      >
                        <ITrash size={15} />
                      </button>
                      <button
                        type="button"
                        className="media-preview-button"
                        aria-label={`放大预览 ${asset.title}`}
                        title="放大预览"
                        onClick={() => setPreviewAsset(asset)}
                      >
                        <PreviewIcon />
                        <span>预览</span>
                      </button>
                    </div>
                    <div className="media-info">
                      <strong>{asset.title}</strong>
                      <span>{asset.kind.toUpperCase()} · {mediaTime(asset)}</span>
                      {asset.prompt ? <em>{asset.prompt}</em> : null}
                      {Array.isArray(asset.tags) && asset.tags.length ? (
                        <div className="asset-card-tags">
                          {asset.tags.slice(0, 3).map((tag) => <i key={tag}>{tag}</i>)}
                        </div>
                      ) : null}
                    </div>
                    {scope === 'project' ? (
                      <div className="media-actions asset-card-actions">
                        <button
                          type="button"
                          className="home-btn"
                          disabled={!asset.id || promotingId === asset.id}
                          onClick={() => handlePromote(asset)}
                        >
                          {promotingId === asset.id ? '保存中' : '保存全局'}
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
          </main>
        )}
        </div>
      </div>
      {previewAsset ? (
        <div className="media-preview-backdrop" role="presentation" onClick={() => setPreviewAsset(null)}>
          <div
            className={`media-preview-dialog media-preview-${previewAsset.kind}`}
            role="dialog"
            aria-modal="true"
            aria-label={`预览 ${previewAsset.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="media-preview-head">
              <div>
                <span>{previewAsset.kind.toUpperCase()}</span>
                <strong>{previewAsset.title}</strong>
              </div>
              <button type="button" className="media-preview-close" aria-label="关闭预览" onClick={() => setPreviewAsset(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="media-preview-stage">
              {renderPreviewContent(previewAsset)}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
