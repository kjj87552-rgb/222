import React from 'react';
import { IClose, IAdd, ISearch, IStar, IFolder } from '../../shared/ui/icons/index.jsx';
import { localFilesStyles } from './styles.js';
import { AssetStore } from '../../shared/platform/assetStore.js';
import {
  useFolders,
  useCurrentFolder,
  useCurrentFolderId,
  useFavorites,
  localFilesActions,
  fileKey,
} from './localFilesStore.js';

/* Thumb component:
 *   - Electron file objects have an `assetUrl` (libai-asset://...) — used directly
 *   - Browser File objects need URL.createObjectURL — created lazily, revoked on unmount
 */
function FileThumb({ file }) {
  const [blobUrl, setBlobUrl] = React.useState(null);
  const isElectronFile = Boolean(file.assetUrl);
  React.useEffect(() => {
    if (isElectronFile || !(file instanceof File)) return undefined;
    const u = URL.createObjectURL(file);
    setBlobUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file, isElectronFile]);
  const url = isElectronFile ? file.assetUrl : blobUrl;
  if (!url) return <div className="thumb"/>;
  const isVideo = (file.kind || file.type || '').startsWith('video');
  return (
    <div className="thumb">
      {isVideo ? (
        <>
          <video src={url} muted preload="metadata"/>
          <span className="video-tag">VIDEO</span>
        </>
      ) : (
        <img src={url} alt={file.name} loading="lazy"/>
      )}
    </div>
  );
}

function FileCard({ file, isFav, onInsert, onToggleFav }) {
  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-libai-localfile', JSON.stringify({
      name: file.name,
      size: file.size,
      mime: file.mime || file.type || '',
      kind: file.kind,
      path: file.path || null,
      assetUrl: file.assetUrl || null,
    }));
    /* For browser File objects, also set as DataTransfer file (helps native drop targets). */
    if (file instanceof File) {
      try { e.dataTransfer.items?.add?.(file); } catch (_) {}
    }
  };
  return (
    <div className="lf-card" draggable onDragStart={onDragStart}>
      <FileThumb file={file}/>
      <button
        type="button"
        className={`star ${isFav ? 'on' : ''}`}
        title={isFav ? '取消收藏' : '收藏'}
        onClick={(e) => { e.stopPropagation(); onToggleFav(file); }}
      >
        <IStar size={11}/>
      </button>
      <button
        type="button"
        className="insert-btn"
        onClick={(e) => { e.stopPropagation(); onInsert(file); }}
      >
        + 插入
      </button>
      <div className="name" title={file.name}>{file.name}</div>
    </div>
  );
}

export function LocalFilesPanel({ onClose, onInsertFile }) {
  const folders = useFolders();
  const currentFolder = useCurrentFolder();
  const currentFolderId = useCurrentFolderId();
  const favorites = useFavorites();
  const [filter, setFilter] = React.useState('all');       // 'all' | 'fav'
  const [query, setQuery] = React.useState('');
  const [pickError, setPickError] = React.useState(null);
  const folderInputRef = React.useRef(null);
  const electronAvailable = AssetStore.folderApiAvailable();

  const onClickAddFolder = async () => {
    setPickError(null);
    if (electronAvailable) {
      try {
        await localFilesActions.pickAndAddFolder();
      } catch (error) {
        setPickError(String(error?.message || error));
      }
    } else {
      /* Browser fallback: webkitdirectory file input */
      folderInputRef.current?.click();
    }
  };

  /* Browser fallback: when user picks via webkitdirectory, files come as File objects.
   * Group them as a synthetic "folder" (no path → not persistable). */
  const onFolderInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const folderName = files[0].webkitRelativePath?.split('/')[0] || '新文件夹';
    localFilesActions.addBrowserFolder(folderName, files);
    e.target.value = '';
  };

  const visible = React.useMemo(() => {
    if (!currentFolder) return [];
    let items = currentFolder.files || [];
    if (filter === 'fav') {
      items = items.filter((f) => favorites.has(fileKey(f)));
    }
    const q = query.trim().toLowerCase();
    if (q) items = items.filter((f) => f.name.toLowerCase().includes(q));
    return items;
  }, [currentFolder, filter, favorites, query]);

  return (
    <>
      <style>{localFilesStyles}</style>
      <aside className="lf-panel">
        <header>
          <IFolder size={14}/>
          <h3>本地文件夹</h3>
          <button className="close" onClick={onClose} title="关闭面板">
            <IClose size={14}/>
          </button>
        </header>
        <div className="subtitle">
          {electronAvailable
            ? '本地图片 / 视频 / 音频，点击插入或拖到画布'
            : '浏览器模式：仅当前会话可用，刷新后丢失'}
        </div>

        {!electronAvailable && (
              <input
                ref={folderInputRef}
                type="file"
                hidden
                multiple
                webkitdirectory=""
                directory=""
                onChange={onFolderInputChange}
              />
            )}

            <button type="button" className="lf-add" onClick={onClickAddFolder}>
              <IAdd size={13}/> 添加文件夹
            </button>

            {pickError && (
              <div style={{ padding: '0 12px 8px', fontSize: 11, color: 'var(--accent-2)' }}>
                ⚠ {pickError}
              </div>
            )}

            {folders.length > 0 && (
              <div className="lf-folder-bar">
                <div className="lf-folder-row">
                  <span className="label">
                    切换文件夹 ({folders.findIndex(f => f.id === currentFolderId) + 1}/{folders.length})
                  </span>
                  <span className="actions">
                    {currentFolder?.path && (
                      <button onClick={() => localFilesActions.refreshFolder(currentFolder.id)}>
                        刷新
                      </button>
                    )}
                    {currentFolder && (
                      <button onClick={() => localFilesActions.removeFolder(currentFolder.id)}>
                        移除
                      </button>
                    )}
                    <button onClick={() => { if (confirm('清空所有已加载的文件夹？')) localFilesActions.clearFolders(); }}>
                      清除全部
                    </button>
                  </span>
                </div>
                <select
                  className="lf-folder-pick"
                  value={currentFolderId || ''}
                  onChange={(e) => localFilesActions.setCurrentFolder(e.target.value)}
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} · {f.loading ? '加载中…' : `${f.files.length} 项`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentFolder && (
              <>
                <div className="lf-search">
                  <input
                    type="text"
                    placeholder="搜索：按名称过滤"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="lf-filter">
                  <button
                    type="button"
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                  >
                    全部
                  </button>
                  <button
                    type="button"
                    className={filter === 'fav' ? 'active' : ''}
                    onClick={() => setFilter('fav')}
                  >
                    收藏
                  </button>
                </div>

                <div className="lf-section-head">
                  <span>{currentFolder.name}</span>
                  <span>
                    {currentFolder.loading ? '加载中…'
                      : currentFolder.error ? '加载失败'
                      : `${visible.length} 个`}
                  </span>
                </div>
              </>
            )}

            <div className="lf-grid">
              {!currentFolder && (
                <div className="lf-empty">
                  还没有文件夹。<br/>
                  点击上方"添加文件夹"导入本地图片 / 视频。
                </div>
              )}
              {currentFolder?.error && (
                <div className="lf-empty" style={{ color: 'var(--accent-2)' }}>
                  {currentFolder.error}
                </div>
              )}
              {currentFolder && !currentFolder.loading && !currentFolder.error && visible.length === 0 && (
                <div className="lf-empty">
                  {filter === 'fav' ? '没有收藏的文件' : '没有匹配的文件'}
                </div>
              )}
              {visible.map((file, i) => (
                <FileCard
                  key={`${currentFolder.id}-${i}-${file.name}`}
                  file={file}
                  isFav={favorites.has(fileKey(file))}
                  onInsert={onInsertFile}
                  onToggleFav={localFilesActions.toggleFavorite}
                />
              ))}
            </div>
      </aside>
    </>
  );
}
