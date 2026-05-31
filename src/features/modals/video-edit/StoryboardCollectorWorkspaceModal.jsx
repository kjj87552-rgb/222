import React from 'react';
import {
  IAdd,
  IAudio,
  IArrow,
  IChevL,
  IChevR,
  IClose,
  ICut,
  IFilm,
  IFolder,
  IGrid9,
  IImage,
  ILayer,
  IPause,
  IPlay,
  ISearch,
  ISparkle,
  IStar,
  IText,
  ITrash,
  IVideo,
  IZoomIn,
  IZoomOut,
} from '../../../shared/ui/icons/index.jsx';
import { AssetStore } from '../../../shared/platform/assetStore.js';
import { uploadFileAsAsset } from '../../../shared/utils/uploadHelpers.js';
import {
  canvasActions,
  useIncomingNodesForNode,
  useNodeById,
  useNodesById,
  useProjectId,
} from '../../../shared/store/canvasStore.js';
import { ToolModal } from '../shared/ToolModal.jsx';
import {
  buildStoryboardItemsFromScriptNodes,
  createStoryboardItemFromAsset,
  mergeLinkedScriptStoryboardItems,
  moveStoryboardItem,
  normalizeStoryboardItems,
  storyboardItemKind,
  storyboardItemMediaSrc,
  storyboardItemPreviewSrc,
} from '../../nodes/storyboardCollectorItems.js';

function kindLabel(kind) {
  if (kind === 'video') return '视频';
  if (kind === 'audio') return '音频';
  return '图片';
}

function kindIcon(kind, size = 14) {
  const Icon = kind === 'video' ? IVideo : kind === 'audio' ? IAudio : IImage;
  return <Icon size={size}/>;
}

const EDITOR_RAIL = [
  { id: 'media', label: '媒体', Icon: IFilm },
  { id: 'audio', label: '音频', Icon: IAudio },
  { id: 'text', label: '文本', Icon: IText },
  { id: 'sticker', label: '贴纸', Icon: IStar },
  { id: 'effects', label: '效果', Icon: ISparkle },
  { id: 'transition', label: '转场', Icon: ICut },
  { id: 'filter', label: '滤镜', Icon: ILayer },
];

const MEDIA_TABS = ['本地', '项目', '收藏'];

const TIMELINE_TRACKS = [
  { id: 'video', label: '视频轨', Icon: IVideo },
  { id: 'image', label: '图片轨', Icon: IImage },
  { id: 'audio', label: '音频轨', Icon: IAudio },
];

function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase();
}

function itemMatchesSearch(item, query) {
  if (!query) return true;
  const haystack = [
    item?.title,
    item?.name,
    item?.filename,
    item?.id,
    storyboardItemKind(item),
  ].join(' ').toLowerCase();
  return haystack.includes(query);
}

function mediaPanelTitle(activeRail) {
  if (activeRail === 'audio') return '音频库';
  if (activeRail === 'text') return '文本库';
  if (activeRail === 'sticker') return '贴纸库';
  if (activeRail === 'effects') return '效果库';
  if (activeRail === 'transition') return '转场库';
  if (activeRail === 'filter') return '滤镜库';
  return '媒体库';
}

function guessKindFromFile(file) {
  const type = String(file?.type || '').toLowerCase();
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'image';
}

function fallbackAssetFromFile(file, projectId) {
  if (!file) return null;
  const kind = guessKindFromFile(file);
  const url = typeof URL !== 'undefined' && URL.createObjectURL
    ? URL.createObjectURL(file)
    : '';
  return {
    id: `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    kind,
    mediaKind: kind,
    title: file.name || (kind === 'video' ? '本地视频' : kind === 'audio' ? '本地音频' : '本地图片'),
    url,
    src: url,
    mime: file.type || '',
    projectId,
  };
}

export function StoryboardCollectorWorkspaceModal({ nodeId, onClose }) {
  const collector = useNodeById(nodeId);
  const projectId = useProjectId();
  const incomingNodes = useIncomingNodesForNode(nodeId);
  const nodesById = useNodesById();
  const items = React.useMemo(
    () => normalizeStoryboardItems(collector?.items || collector?.settings?.items),
    [collector?.items, collector?.settings?.items],
  );
  const [selectedId, setSelectedId] = React.useState('');
  const [dragId, setDragId] = React.useState('');
  const [playing, setPlaying] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [activeRail, setActiveRail] = React.useState('media');
  const [activeMediaTab, setActiveMediaTab] = React.useState('本地');
  const [searchText, setSearchText] = React.useState('');
  const fileInputRef = React.useRef(null);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (!items.length) {
      setSelectedId('');
      return;
    }
    if (!items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  React.useEffect(() => {
    setPlaying(false);
  }, [selectedId]);

  const selectedItem = items.find((item) => item.id === selectedId) || items[0] || null;
  const selectedKind = storyboardItemKind(selectedItem);
  const selectedSrc = storyboardItemMediaSrc(selectedItem);
  const selectedPreview = storyboardItemPreviewSrc(selectedItem);
  const linkedScriptNodes = React.useMemo(() => (
    (Array.isArray(incomingNodes) ? incomingNodes : [])
      .filter((node) => node?.type === 'script' && (node.storyboardPackage || node.settings?.storyboardPackage))
  ), [incomingNodes]);
  const linkedScriptMedia = React.useMemo(() => ({
    image: buildStoryboardItemsFromScriptNodes(linkedScriptNodes, { mediaMode: 'image', nodesById }),
    video: buildStoryboardItemsFromScriptNodes(linkedScriptNodes, { mediaMode: 'video', nodesById }),
    both: buildStoryboardItemsFromScriptNodes(linkedScriptNodes, { mediaMode: 'both', nodesById }),
  }), [linkedScriptNodes, nodesById]);
  const searchQuery = normalizeSearch(searchText);
  const filteredLibraryItems = React.useMemo(() => {
    if (activeRail !== 'media' && activeRail !== 'audio') return [];
    return items.filter((item) => {
      const kind = storyboardItemKind(item);
      if (activeRail === 'audio' && kind !== 'audio') return false;
      if (activeMediaTab === '收藏' && !item.favorite) return false;
      return itemMatchesSearch(item, searchQuery);
    });
  }, [activeMediaTab, activeRail, items, searchQuery]);
  const mediaLibraryTitle = mediaPanelTitle(activeRail);

  const updateItems = React.useCallback((nextItems) => {
    if (!collector?.id) return;
    const normalizedItems = normalizeStoryboardItems(nextItems);
    canvasActions.updateNode(collector.id, {
      items: normalizedItems,
      settings: {
        ...(collector.settings || {}),
        items: normalizedItems,
      },
    });
  }, [collector?.id, collector?.settings]);

  const appendAssets = React.useCallback((assets) => {
    const records = Array.isArray(assets) ? assets : [];
    if (!records.length) return;
    const usedIds = new Set(items.map((item) => item.id));
    const nextItems = [...items];
    const added = [];
    records.forEach((asset) => {
      const item = createStoryboardItemFromAsset(asset, nextItems.length, usedIds);
      if (!item) return;
      nextItems.push(item);
      added.push(item);
    });
    if (!added.length) return;
    updateItems(nextItems);
    setSelectedId(added[0].id);
    setStatus(`已加入 ${added.length} 个素材`);
  }, [items, updateItems]);

  const collectLinkedScriptMedia = React.useCallback((mediaMode) => {
    const nextLinkedItems = linkedScriptMedia[mediaMode] || [];
    if (!linkedScriptNodes.length) {
      setStatus('请先把脚本节点连接到分镜收集器');
      return;
    }
    if (!nextLinkedItems.length) {
      setStatus('相连脚本节点还没有可收集的图片或视频结果');
      return;
    }
    const nextItems = mergeLinkedScriptStoryboardItems(items, nextLinkedItems, {
      sourceNodeIds: linkedScriptNodes.map((node) => node.id),
    });
    updateItems(nextItems);
    setSelectedId(nextLinkedItems[0]?.id || nextItems[0]?.id || '');
    setStatus(`已从相连脚本收集 ${nextLinkedItems.length} 个素材`);
  }, [items, linkedScriptMedia, linkedScriptNodes, updateItems]);

  const handleNativeImport = React.useCallback(async () => {
    setStatus('');
    if (!AssetStore.available?.()) {
      fileInputRef.current?.click();
      return;
    }
    setImporting(true);
    try {
      const records = await AssetStore.pickAndImport(projectId, {
        multiple: true,
        deferCopy: true,
        meta: {
          source: 'storyboard-collector-editor',
          collectorId: nodeId,
          projectId,
        },
      });
      appendAssets(records);
    } catch (error) {
      setStatus(`导入失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setImporting(false);
    }
  }, [appendAssets, nodeId, projectId]);

  const handleFileInput = React.useCallback(async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setStatus('');
    setImporting(true);
    try {
      const records = [];
      for (const file of files) {
        const kind = guessKindFromFile(file);
        const record = await uploadFileAsAsset(file, projectId, kind, {
          source: 'storyboard-collector-editor',
          collectorId: nodeId,
          projectId,
        });
        records.push(record || fallbackAssetFromFile(file, projectId));
      }
      appendAssets(records.filter(Boolean));
    } catch (error) {
      setStatus(`导入失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setImporting(false);
    }
  }, [appendAssets, nodeId, projectId]);

  const moveItem = React.useCallback((itemId, delta) => {
    const fromIndex = items.findIndex((item) => item.id === itemId);
    updateItems(moveStoryboardItem(items, fromIndex, fromIndex + delta));
  }, [items, updateItems]);

  const moveDraggedItem = React.useCallback((targetId) => {
    if (!dragId || !targetId || dragId === targetId) return;
    const fromIndex = items.findIndex((item) => item.id === dragId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    updateItems(moveStoryboardItem(items, fromIndex, toIndex));
    setDragId('');
  }, [dragId, items, updateItems]);

  const updateSelectedItem = React.useCallback((patch) => {
    if (!selectedItem) return;
    updateItems(items.map((item) => (
      item.id === selectedItem.id ? { ...item, ...patch } : item
    )));
  }, [items, selectedItem, updateItems]);

  const removeSelectedItem = React.useCallback(() => {
    if (!selectedItem) return;
    const currentIndex = items.findIndex((item) => item.id === selectedItem.id);
    const nextItems = items.filter((item) => item.id !== selectedItem.id);
    const nextSelection = nextItems[Math.min(currentIndex, nextItems.length - 1)]?.id || '';
    updateItems(nextItems);
    setSelectedId(nextSelection);
  }, [items, selectedItem, updateItems]);

  const togglePreviewPlayback = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play?.();
      setPlaying(true);
    } else {
      video.pause?.();
      setPlaying(false);
    }
  }, []);

  if (!collector) {
    return (
      <ToolModal onClose={onClose} fullscreen className="storyboard-collector-fullscreen">
        <div className="sbc-editor-shell fullscreen missing">
          找不到分镜收集节点
        </div>
      </ToolModal>
    );
  }

  return (
    <ToolModal onClose={onClose} fullscreen className="storyboard-collector-fullscreen">
      <div className="sbc-editor-shell fullscreen" data-testid="storyboard-editor">
        <header className="sbc-editor-topbar">
          <button type="button" className="sbc-top-return" onClick={onClose}>
            <IChevL size={15}/>
            <span>返回画布</span>
          </button>
          <div className="sbc-top-title">
            <span>分镜收集节点 / 编辑器</span>
            <strong>分镜收集编辑器</strong>
          </div>
          <div className="sbc-top-status">
            <span className="sbc-save-dot"/>
            <span>已自动保存</span>
          </div>
          <div className="sbc-top-actions">
            <button type="button"><IPlay size={13}/><span>预览</span></button>
            <button type="button" className="primary"><IArrow size={13}/><span>导出序列</span></button>
            <button type="button" className="icon" onClick={onClose} title="关闭"><IClose size={15}/></button>
          </div>
        </header>

        <aside className="sbc-editor-left">
          <nav className="sbc-mode-rail" aria-label="分镜编辑工具">
            {EDITOR_RAIL.map((entry) => {
              const Icon = entry.Icon;
              const active = activeRail === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={active ? 'active' : ''}
                  onClick={() => setActiveRail(entry.id)}
                  title={entry.label}
                >
                  <Icon size={16}/>
                  <span>{entry.label}</span>
                </button>
              );
            })}
          </nav>

          <section className="sbc-media-panel">
            <div className="sbc-media-head">
              <div>
                <span>{activeRail === 'media' ? '媒体' : mediaLibraryTitle.replace('库', '')}</span>
                <strong>{mediaLibraryTitle}</strong>
              </div>
              <em>{items.length} 个素材</em>
            </div>
            <div className="sbc-media-tabs">
              {MEDIA_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={activeMediaTab === tab ? 'active' : ''}
                  onClick={() => setActiveMediaTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <label className="sbc-media-search">
              <ISearch size={13}/>
              <input
                value={searchText}
                placeholder="搜索素材"
                onChange={(event) => setSearchText(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="sbc-add-local"
              data-testid="storyboard-editor-add-local"
              onClick={handleNativeImport}
              disabled={importing}
            >
              <IFolder size={14}/>
              <span>{importing ? '导入中' : '导入'}</span>
            </button>
            <section className="sbc-linked-script-panel" data-testid="storyboard-editor-linked-script-panel">
              <div className="sbc-linked-script-head">
                <strong>相连脚本素材</strong>
                <span>
                  {linkedScriptNodes.length} 个脚本 · {linkedScriptMedia.image.length} 图 · {linkedScriptMedia.video.length} 视频
                </span>
              </div>
              <div className="sbc-linked-script-actions">
                <button
                  type="button"
                  data-testid="storyboard-editor-collect-video"
                  disabled={!linkedScriptMedia.video.length}
                  onClick={() => collectLinkedScriptMedia('video')}
                >
                  收集视频
                </button>
                <button
                  type="button"
                  data-testid="storyboard-editor-collect-image"
                  disabled={!linkedScriptMedia.image.length}
                  onClick={() => collectLinkedScriptMedia('image')}
                >
                  收集图片
                </button>
                <button
                  type="button"
                  data-testid="storyboard-editor-collect-both"
                  disabled={!linkedScriptMedia.both.length}
                  onClick={() => collectLinkedScriptMedia('both')}
                >
                  全部收集
                </button>
              </div>
            </section>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            className="sbc-hidden-file"
            onChange={handleFileInput}
          />
            <div className="sbc-media-grid">
              {filteredLibraryItems.length ? filteredLibraryItems.map((item) => {
              const kind = storyboardItemKind(item);
              const preview = storyboardItemPreviewSrc(item);
              const active = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                    className={`sbc-media-tile ${active ? 'active' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                >
                    <span className="sbc-media-thumb">
                    {preview && kind === 'video' ? (
                        <video src={preview} muted playsInline preload="metadata"/>
                      ) : preview && kind !== 'audio' ? (
                        <img src={preview} alt="" draggable="false"/>
                    ) : (
                      kindIcon(kind, 16)
                    )}
                  </span>
                    <span className="sbc-media-copy">
                    <strong>{item.title || `${kindLabel(kind)}素材`}</strong>
                      <em>{String(item.order + 1).padStart(2, '0')} · {kindLabel(kind)}{item.duration ? ` · ${item.duration}` : ''}</em>
                  </span>
                    <span className="sbc-media-type">{kindLabel(kind)}</span>
                </button>
              );
            }) : (
                <div className="sbc-media-dropzone">
                  <IAdd size={18}/>
                  <strong>拖入图片、视频或音频</strong>
                  <span>{activeRail === 'media' || activeRail === 'audio' ? '也可以点击导入添加到媒体库' : '该分类将在后续版本支持'}</span>
              </div>
            )}
          </div>
          {status && <div className="sbc-editor-status">{status}</div>}
          </section>
        </aside>

        <main className="sbc-editor-preview">
          <div className="sbc-viewer-head">
            <span>预览画面</span>
            <em>{selectedItem ? `${kindLabel(selectedKind)} · ${selectedItem.duration || '自动时长'}` : '未选择素材'}</em>
          </div>
          <section className="sbc-player-frame">
            <span className="sbc-safe-frame"/>
            {selectedItem ? (
              selectedKind === 'video' && selectedSrc ? (
                <video
                  ref={videoRef}
                  src={selectedSrc}
                  poster={selectedItem.poster || selectedPreview || undefined}
                  controls
                  playsInline
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
              ) : selectedKind === 'audio' && selectedSrc ? (
                <div className="sbc-audio-preview">
                  <IAudio size={38}/>
                  <strong>{selectedItem.title || '音频素材'}</strong>
                  <audio src={selectedSrc} controls/>
                </div>
              ) : selectedPreview || selectedSrc ? (
                <img src={selectedPreview || selectedSrc} alt={selectedItem.title || ''}/>
              ) : (
                <div className="sbc-preview-empty">
                  {kindIcon(selectedKind, 30)}
                  <span>该素材没有可预览地址</span>
                </div>
              )
            ) : (
              <div className="sbc-preview-empty">
                <IFilm size={30}/>
                <span>选择素材后开始编辑</span>
              </div>
            )}
          </section>
          <div className="sbc-preview-controls">
            <button
              type="button"
              className="sbc-play-toggle"
              onClick={togglePreviewPlayback}
              disabled={selectedKind !== 'video' || !selectedSrc}
            >
              {playing ? <IPause size={13}/> : <IPlay size={13}/>}
            </button>
            <span className="sbc-preview-title">{selectedItem?.title || '未选择素材'}</span>
            <span className="sbc-preview-meta">
              {selectedItem ? `${String((selectedItem.order || 0) + 1).padStart(2, '0')} · ${kindLabel(selectedKind)}` : '空序列'}
            </span>
            <span className="sbc-viewer-tools">
              <button type="button" title="缩小"><IZoomOut size={12}/></button>
              <button type="button" title="缩放">100%</button>
              <button type="button" title="放大"><IZoomIn size={12}/></button>
            </span>
          </div>
        </main>

        <aside className="sbc-editor-params">
          <div className="sbc-panel-head">
            <strong>参数</strong>
            <span>{selectedItem ? kindLabel(selectedKind) : '-'}</span>
          </div>
          {selectedItem ? (
            <div className="sbc-inspector-groups">
              <section className="sbc-inspector-group">
                <h3>基础</h3>
                <label className="sbc-param-field">
                  <span>名称</span>
                  <input
                    value={selectedItem.title || ''}
                    onChange={(event) => updateSelectedItem({ title: event.target.value })}
                  />
                </label>
                <label className="sbc-param-field">
                  <span>时长</span>
                  <input
                    value={selectedItem.duration || ''}
                    placeholder="自动读取或手动填写"
                    onChange={(event) => updateSelectedItem({ duration: event.target.value })}
                  />
                </label>
              </section>

              <section className="sbc-inspector-group">
                <h3>画面</h3>
                <label className="sbc-param-field">
                  <span>画面填充</span>
                  <select
                    value={selectedItem.fitMode || 'contain'}
                    onChange={(event) => updateSelectedItem({ fitMode: event.target.value })}
                    disabled={selectedKind === 'audio'}
                  >
                    <option value="contain">完整显示</option>
                    <option value="cover">铺满裁切</option>
                    <option value="fill">拉伸填充</option>
                  </select>
                </label>
                <label className="sbc-param-field">
                  <span>缩放</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={Number.isFinite(Number(selectedItem.scale)) ? Number(selectedItem.scale) : 100}
                    onChange={(event) => updateSelectedItem({ scale: Number(event.target.value) })}
                    disabled={selectedKind === 'audio'}
                  />
                </label>
              </section>

              <section className="sbc-inspector-group">
                <h3>运动</h3>
                <label className="sbc-param-field">
                  <span>入场</span>
                  <select
                    value={selectedItem.motionIn || 'none'}
                    onChange={(event) => updateSelectedItem({ motionIn: event.target.value })}
                    disabled={selectedKind === 'audio'}
                  >
                    <option value="none">无</option>
                    <option value="fade">淡入</option>
                    <option value="push">推进</option>
                  </select>
                </label>
              </section>

              <section className="sbc-inspector-group">
                <h3>音频</h3>
                <label className="sbc-param-field">
                  <span>音量</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Number.isFinite(Number(selectedItem.volume)) ? Number(selectedItem.volume) : 100}
                    onChange={(event) => updateSelectedItem({ volume: Number(event.target.value) })}
                    disabled={selectedKind === 'image'}
                  />
                </label>
              </section>

              <section className="sbc-inspector-group">
                <h3>备注</h3>
                <label className="sbc-param-field">
                  <span>镜头说明</span>
                  <textarea
                    value={selectedItem.notes || ''}
                    placeholder="记录素材用途或分镜说明"
                    onChange={(event) => updateSelectedItem({ notes: event.target.value })}
                  />
                </label>
              </section>

              <div className="sbc-param-actions">
                <button type="button" onClick={() => moveItem(selectedItem.id, -1)} disabled={selectedItem.order === 0}>
                  <IChevL size={13}/>前移
                </button>
                <button type="button" onClick={() => moveItem(selectedItem.id, 1)} disabled={selectedItem.order === items.length - 1}>
                  后移<IChevR size={13}/>
                </button>
                <button type="button" className="danger" onClick={removeSelectedItem}>
                  <ITrash size={13}/>移除
                </button>
              </div>
            </div>
          ) : (
            <div className="sbc-empty-params">选择一个素材后可调整参数</div>
          )}
        </aside>

        <section className="sbc-editor-timeline">
          <div className="sbc-timeline-toolbar">
            <strong>时间轴</strong>
            <span>
              <button type="button"><ICut size={12}/>分割</button>
              <button type="button"><ITrash size={12}/>删除</button>
              <button type="button"><IGrid9 size={12}/>对齐</button>
            </span>
          </div>
          <div className="sbc-timeline-ruler">
            <span>00:00</span>
            <span>00:02</span>
            <span>00:04</span>
            <span>00:06</span>
            <em>按顺序拖拽或用箭头调整</em>
          </div>
          <div className="sbc-track-stack">
            {TIMELINE_TRACKS.map((track) => {
              const TrackIcon = track.Icon;
              const trackItems = items.filter((item) => storyboardItemKind(item) === track.id);
              return (
                <div key={track.id} className="sbc-track-row">
                  <div className="sbc-track-head">
                    <TrackIcon size={13}/>
                    <strong>{track.label}</strong>
                  </div>
                  <div className="sbc-track-lane">
                    {trackItems.length ? trackItems.map((item) => {
                      const kind = storyboardItemKind(item);
                      const preview = storyboardItemPreviewSrc(item);
                      const active = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`sbc-timeline-clip ${active ? 'active' : ''} ${dragId === item.id ? 'dragging' : ''}`}
                          draggable
                          onDragStart={() => setDragId(item.id)}
                          onDragEnd={() => setDragId('')}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            moveDraggedItem(item.id);
                          }}
                        >
                          <button type="button" className="sbc-timeline-select" onClick={() => setSelectedId(item.id)}>
                            <span className="sbc-timeline-thumb">
                              {preview && kind === 'video' ? (
                                <video src={preview} muted playsInline preload="metadata"/>
                              ) : preview && kind !== 'audio' ? (
                                <img src={preview} alt="" draggable="false"/>
                              ) : kindIcon(kind, 16)}
                            </span>
                            <strong>{`镜头 ${String(item.order + 1).padStart(2, '0')}`}</strong>
                            <em>{item.title || `${kindLabel(kind)}素材`}</em>
                          </button>
                          <span className="sbc-timeline-actions">
                            <button
                              type="button"
                              data-testid={`storyboard-editor-move-left-${item.id}`}
                              onClick={() => moveItem(item.id, -1)}
                              disabled={item.order === 0}
                              title="前移"
                            >
                              <IChevL size={12}/>
                            </button>
                            <button
                              type="button"
                              data-testid={`storyboard-editor-move-right-${item.id}`}
                              onClick={() => moveItem(item.id, 1)}
                              disabled={item.order === items.length - 1}
                              title="后移"
                            >
                              <IChevR size={12}/>
                            </button>
                          </span>
                        </div>
                      );
                    }) : (
                      <div className="sbc-track-empty">拖入素材</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </ToolModal>
  );
}
