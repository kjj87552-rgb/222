import React from 'react';
import { useNodesById } from '../../shared/store/canvasStore.js';
import { IAudio, IFilm, IImage, IVideo } from '../../shared/ui/icons/index.jsx';
import { NodeBlankState, NodeShell } from './NodeShell.jsx';
import { STORYBOARD_COLLECTOR_ITEM_MIME, buildStoryboardCollectorDragPayload } from './storyboardCollectorDrag.js';
import {
  buildStoryboardItemsFromScriptNodes,
  mergeLinkedScriptStoryboardItems,
  moveStoryboardItem,
  normalizeStoryboardItems,
  storyboardItemKind,
  storyboardItemPreviewSrc,
} from './storyboardCollectorItems.js';

export function StoryboardCollectorNode(props) {
  const { node, allNodes = [], onOpenModal, onUpdateNode, onStoryboardCollectorRestoreItem } = props;
  const nodesById = useNodesById();
  const items = React.useMemo(() => normalizeStoryboardItems(node.items || node.settings?.items), [node.items, node.settings?.items]);
  const [dragId, setDragId] = React.useState('');
  const isEmpty = items.length === 0;
  const linkedScriptNodes = React.useMemo(() => (
    (Array.isArray(allNodes) ? allNodes : [])
      .filter((sourceNode) => (
        sourceNode?.type === 'script'
        && (sourceNode.storyboardPackage || sourceNode.settings?.storyboardPackage)
      ))
  ), [allNodes]);
  const linkedScriptMedia = React.useMemo(() => ({
    image: buildStoryboardItemsFromScriptNodes(linkedScriptNodes, { mediaMode: 'image', nodesById }),
    video: buildStoryboardItemsFromScriptNodes(linkedScriptNodes, { mediaMode: 'video', nodesById }),
    both: buildStoryboardItemsFromScriptNodes(linkedScriptNodes, { mediaMode: 'both', nodesById }),
  }), [linkedScriptNodes, nodesById]);
  const hasLinkedScriptSources = linkedScriptNodes.length > 0;

  const updateItems = React.useCallback((nextItems) => {
    const normalizedItems = normalizeStoryboardItems(nextItems);
    onUpdateNode?.(node.id, {
      items: normalizedItems,
      settings: {
        ...(node.settings || {}),
        items: normalizedItems,
      },
    });
  }, [node.id, node.settings, onUpdateNode]);

  const openEditor = React.useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    onOpenModal?.('storyboardcollector', node.id);
  }, [node.id, onOpenModal]);

  const reorderByDrop = React.useCallback((targetId) => {
    if (!dragId || !targetId || dragId === targetId) return;
    const fromIndex = items.findIndex((item) => item.id === dragId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    updateItems(moveStoryboardItem(items, fromIndex, toIndex));
    setDragId('');
  }, [dragId, items, updateItems]);

  const keepDragInsideCollector = React.useCallback((event) => {
    if (!dragId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  }, [dragId]);

  const cancelCollectorDrop = React.useCallback((event) => {
    if (!dragId) return;
    event.preventDefault();
    event.stopPropagation();
    setDragId('');
  }, [dragId]);

  const stopActionDrag = React.useCallback((event) => {
    event.stopPropagation();
  }, []);

  const collectLinkedScriptMedia = React.useCallback((mediaMode, event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const nextLinkedItems = linkedScriptMedia[mediaMode] || [];
    if (!nextLinkedItems.length) return;
    const nextItems = mergeLinkedScriptStoryboardItems(items, nextLinkedItems, {
      sourceNodeIds: linkedScriptNodes.map((sourceNode) => sourceNode.id),
    });
    updateItems(nextItems);
  }, [items, linkedScriptMedia, linkedScriptNodes, updateItems]);

  const collectActions = hasLinkedScriptSources ? (
    <div className="storyboard-collector-collect-panel">
      <div className="storyboard-collector-collect-summary">
        {linkedScriptNodes.length} 个脚本 · {linkedScriptMedia.image.length} 图 · {linkedScriptMedia.video.length} 视频
      </div>
      <div className="storyboard-collector-collect-actions">
        <button
          type="button"
          data-testid="storyboard-collector-collect-video"
          disabled={!linkedScriptMedia.video.length}
          onPointerDown={stopActionDrag}
          onDragStart={stopActionDrag}
          onClick={(event) => collectLinkedScriptMedia('video', event)}
        >
          收视频
        </button>
        <button
          type="button"
          data-testid="storyboard-collector-collect-image"
          disabled={!linkedScriptMedia.image.length}
          onPointerDown={stopActionDrag}
          onDragStart={stopActionDrag}
          onClick={(event) => collectLinkedScriptMedia('image', event)}
        >
          收图片
        </button>
        <button
          type="button"
          data-testid="storyboard-collector-collect-both"
          disabled={!linkedScriptMedia.both.length}
          onPointerDown={stopActionDrag}
          onDragStart={stopActionDrag}
          onClick={(event) => collectLinkedScriptMedia('both', event)}
        >
          全收集
        </button>
      </div>
    </div>
  ) : null;

  const move = React.useCallback((itemId, delta) => {
    const fromIndex = items.findIndex((item) => item.id === itemId);
    updateItems(moveStoryboardItem(items, fromIndex, fromIndex + delta));
  }, [items, updateItems]);

  const restore = React.useCallback((itemId) => {
    onStoryboardCollectorRestoreItem?.(node.id, itemId);
  }, [node.id, onStoryboardCollectorRestoreItem]);

  return (
    <NodeShell {...props} isEmpty={isEmpty} toolbar={null} onDoubleClick={openEditor}>
      {isEmpty ? (
        <div className="storyboard-collector-empty" onPointerDown={(event) => event.stopPropagation()}>
          <NodeBlankState
            icon={<IFilm size={25} sw={1.5}/>}
            title="分镜收集细节"
            description="连接脚本后可直接收集素材，编辑器用于精排顺序"
            tone="video"
          />
          {collectActions}
          <button
            type="button"
            className="storyboard-collector-entry"
            data-testid="storyboard-collector-open-editor"
            onPointerDown={stopActionDrag}
            onDragStart={stopActionDrag}
            onClick={openEditor}
          >
            进入编辑器
          </button>
        </div>
      ) : (
        <div
          className="storyboard-collector-node"
          onPointerDown={(event) => event.stopPropagation()}
          onDragOver={keepDragInsideCollector}
          onDrop={cancelCollectorDrop}
        >
          <div className="storyboard-collector-head">
            <span>素材序列</span>
            <button
              type="button"
              className="storyboard-collector-entry compact"
              data-testid="storyboard-collector-open-editor"
              draggable={false}
              onPointerDown={stopActionDrag}
              onDragStart={stopActionDrag}
              onClick={openEditor}
            >
              进入
            </button>
            <em>{items.length} 个</em>
          </div>
          {collectActions}
          <div className="storyboard-collector-list">
            {items.map((item, index) => {
              const kind = storyboardItemKind(item);
              const preview = storyboardItemPreviewSrc(item);
              const KindIcon = kind === 'video' ? IVideo : kind === 'audio' ? IAudio : IImage;
              return (
                <div
                  key={item.id}
                  className={`storyboard-collector-item ${dragId === item.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData(
                      STORYBOARD_COLLECTOR_ITEM_MIME,
                      buildStoryboardCollectorDragPayload(node.id, item),
                    );
                    event.dataTransfer.setData('text/plain', item.id);
                    setDragId(item.id);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    reorderByDrop(item.id);
                  }}
                  onDragEnd={() => setDragId('')}
                >
                  <span className="storyboard-collector-order">{String(index + 1).padStart(2, '0')}</span>
                  <span className="storyboard-collector-thumb">
                    {preview ? (
                      kind === 'video' && !item.poster ? (
                        <video src={preview} muted playsInline preload="metadata"/>
                      ) : (
                        <img src={preview} alt="" draggable="false"/>
                      )
                    ) : (
                      <KindIcon size={16}/>
                    )}
                  </span>
                  <span className="storyboard-collector-meta">
                    <strong>{item.title || (kind === 'video' ? '视频素材' : kind === 'audio' ? '音频素材' : '图片素材')}</strong>
                    <em>{kind.toUpperCase()}{item.duration ? ` · ${item.duration}` : ''}</em>
                  </span>
                  <span className="storyboard-collector-actions">
                    <button type="button" draggable={false} onPointerDown={stopActionDrag} onDragStart={stopActionDrag} onClick={() => move(item.id, -1)} disabled={index === 0}>上移</button>
                    <button type="button" draggable={false} onPointerDown={stopActionDrag} onDragStart={stopActionDrag} onClick={() => move(item.id, 1)} disabled={index === items.length - 1}>下移</button>
                    <button type="button" draggable={false} onPointerDown={stopActionDrag} onDragStart={stopActionDrag} onClick={() => restore(item.id)}>取出</button>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="storyboard-collector-tip">
            连接到剪映导出后，会按这里的顺序生成时间线
          </div>
        </div>
      )}
    </NodeShell>
  );
}
