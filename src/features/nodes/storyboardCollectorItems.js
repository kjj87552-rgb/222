import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { getNodeStoryboardPackage } from '../storyboard/package/storyboardPackage.js';

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function firstString(values) {
  for (const value of values) {
    const text = compactString(value);
    if (text) return text;
  }
  return '';
}

const LINKED_SCRIPT_STORYBOARD_SOURCE = 'linked-script-storyboard';

function compactArray(value) {
  return Array.isArray(value) ? value : [];
}

function stableIdPart(value, fallback = 'item') {
  const text = compactString(value);
  if (!text) return fallback;
  return text.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || fallback;
}

function normalizeMediaMode(mode) {
  if (mode === 'image' || mode === 'images') return ['image'];
  if (mode === 'both' || mode === 'all') return ['image', 'video'];
  return ['video'];
}

function getShotGroupId(record, fallback = '') {
  return compactString(
    record?.shotGroupId
    || record?.shotGroup
    || record?.groupId
    || record?.id
    || fallback,
  );
}

function rawStoryboardPackageFromScriptNode(node) {
  return node?.storyboardPackage || node?.state?.storyboardPackage || node?.settings?.storyboardPackage || null;
}

function storyboardPackageFromScriptNode(node) {
  const rawPackage = rawStoryboardPackageFromScriptNode(node);
  if (!rawPackage) return null;
  return getNodeStoryboardPackage({
    ...node,
    storyboardPackage: rawPackage,
  }, {
    projectId: rawPackage.projectId,
    nodeId: node?.id,
  });
}

function shotGroupsFromPackage(storyboardPackage = {}) {
  const explicitGroups = compactArray(storyboardPackage.shotGroups);
  if (explicitGroups.length) {
    return explicitGroups
      .map((group, index) => ({
        group,
        groupId: getShotGroupId(group, `group-${index + 1}`),
        index,
      }))
      .filter((entry) => entry.groupId);
  }

  const seen = new Set();
  return compactArray(storyboardPackage?.generationPlan?.shotTasks)
    .map((task, index) => ({
      group: { shotGroupId: getShotGroupId(task, `group-${index + 1}`) },
      groupId: getShotGroupId(task, `group-${index + 1}`),
      index,
    }))
    .filter((entry) => {
      if (!entry.groupId || seen.has(entry.groupId)) return false;
      seen.add(entry.groupId);
      return true;
    });
}

function tasksForShotGroup(storyboardPackage = {}, groupId = '') {
  return compactArray(storyboardPackage?.generationPlan?.shotTasks)
    .filter((task) => getShotGroupId(task, 'ungrouped') === groupId);
}

function mediaSourceFromNode(node, kind) {
  if (!node) return '';
  if (kind === 'video') {
    return firstString([
      node.videoSrc,
      node.videoUrl,
      node.assetUrl,
      node.assetPath,
      node.url,
      node.src,
      node.settings?.videoSrc,
      node.settings?.videoUrl,
      node.settings?.video_url,
    ]);
  }
  return firstString([
    node.src,
    node.imageUrl,
    node.url,
    node.assetUrl,
    node.assetPath,
    node.settings?.imageUrl,
    node.settings?.image_url,
  ]);
}

function mediaSourceFromGroup(group, kind) {
  if (kind === 'video') {
    return firstString([
      group?.videoUrl,
      group?.videoSrc,
      group?.videoAssetUrl,
      group?.videoAssetPath,
      group?.videoUrls?.[0],
    ]);
  }
  return firstString([
    group?.imageUrl,
    group?.imageSrc,
    group?.imageAssetUrl,
    group?.imageAssetPath,
    group?.imageUrls?.[0],
  ]);
}

function mediaSourceFromTasks(tasks, kind) {
  const fields = kind === 'video'
    ? ['videoUrl', 'videoSrc', 'videoAssetUrl', 'videoAssetPath', 'videoUrls']
    : ['imageUrl', 'imageSrc', 'imageAssetUrl', 'imageAssetPath', 'imageUrls'];
  for (const task of tasks) {
    const source = firstString(fields.flatMap((field) => (
      Array.isArray(task?.[field]) ? task[field] : [task?.[field]]
    )));
    if (source) return source;
  }
  return '';
}

function linkedNodeForGroup(scriptNode, groupId, tasks, kind, nodesById) {
  const lookup = nodesById instanceof Map ? nodesById : null;
  if (!lookup) return null;
  const linkedKey = kind === 'video' ? 'videoNodeId' : 'imageNodeId';
  const sourceNodeId = compactString(scriptNode?.id);
  const belongsToScriptNode = (node) => {
    const linkedSourceNodeId = compactString(node?.deployedFromNodeId || node?.sourceNodeId);
    return !sourceNodeId || linkedSourceNodeId === sourceNodeId;
  };
  for (const task of tasks) {
    const linkedId = task?.linkedCanvasNodeIds?.[linkedKey];
    const linked = linkedId ? lookup.get(linkedId) : null;
    if (linked && belongsToScriptNode(linked) && mediaSourceFromNode(linked, kind)) return linked;
  }
  for (const node of lookup.values()) {
    if (
      node?.deploymentKind === 'storyboard'
      && node?.deploymentRole === kind
      && getShotGroupId(node) === groupId
      && belongsToScriptNode(node)
      && mediaSourceFromNode(node, kind)
    ) {
      return node;
    }
  }
  return null;
}

function mediaSourceForGroup({ scriptNode, storyboardPackage, group, groupId, tasks, kind, nodesById }) {
  const directSource = mediaSourceFromGroup(group, kind) || mediaSourceFromTasks(tasks, kind);
  if (directSource) return { source: directSource, node: null };
  const node = linkedNodeForGroup(scriptNode, groupId, tasks, kind, nodesById);
  return { source: mediaSourceFromNode(node, kind), node };
}

function durationForGroup(group, tasks) {
  return firstString([
    group?.totalDuration,
    group?.duration,
    group?.durationText,
    tasks?.[0]?.duration,
    tasks?.[0]?.timeline,
  ]);
}

function posterForGroup({ group, imageSource, linkedImageNode }) {
  return firstString([
    group?.poster,
    group?.previewUrl,
    group?.thumbnail,
    group?.thumb,
    imageSource,
    linkedImageNode?.poster,
    linkedImageNode?.src,
    linkedImageNode?.imageUrl,
    linkedImageNode?.url,
  ]);
}

export function normalizeStoryboardItems(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && item.id)
    .map((item, index) => ({ ...item, order: Number.isFinite(Number(item.order)) ? Number(item.order) : index }))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
}

export function resequenceStoryboardItems(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && item.id)
    .map((item, index) => ({ ...item, order: index }));
}

export function moveStoryboardItem(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  if (fromIndex >= items.length || toIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return resequenceStoryboardItems(next);
}

export function storyboardItemKind(item) {
  const kind = String(item?.mediaKind || item?.kind || item?.mime || '').toLowerCase();
  if (kind.startsWith('audio') || kind === 'audio') return 'audio';
  if (kind.startsWith('video') || kind === 'video') return 'video';
  return 'image';
}

export function storyboardItemMediaSrc(item) {
  const src = firstString([
    item?.url,
    item?.src,
    item?.assetUrl,
    item?.imageUrl,
    item?.videoSrc,
    item?.audioSrc,
    item?.assetPath,
    item?.path,
  ]);
  return makeAssetUrl({ src, id: item?.assetId || item?.id });
}

export function storyboardItemPreviewSrc(item) {
  const kind = storyboardItemKind(item);
  const src = kind === 'video'
    ? firstString([item?.poster, item?.previewUrl, item?.thumb, item?.thumbnail, item?.url, item?.src])
    : kind === 'audio'
      ? firstString([item?.poster, item?.previewUrl, item?.thumb, item?.thumbnail])
      : firstString([item?.previewUrl, item?.url, item?.src, item?.assetUrl, item?.imageUrl]);
  return makeAssetUrl({ src, id: item?.assetId || item?.id });
}

function assetKind(asset) {
  const raw = String(asset?.mediaKind || asset?.kind || asset?.type || asset?.mime || '').toLowerCase();
  if (raw.startsWith('audio') || raw === 'audio') return 'audio';
  if (raw.startsWith('video') || raw === 'video') return 'video';
  const source = firstString([
    asset?.url,
    asset?.src,
    asset?.assetUrl,
    asset?.imageUrl,
    asset?.videoSrc,
    asset?.audioSrc,
    asset?.assetPath,
    asset?.path,
    asset?.filename,
    asset?.name,
  ]).toLowerCase().split('?')[0];
  if (/\.(mp4|mov|webm|mkv|avi|m4v)$/.test(source)) return 'video';
  if (/\.(mp3|wav|m4a|aac|flac|ogg)$/.test(source)) return 'audio';
  return 'image';
}

function uniqueItemId(baseId, usedIds) {
  const fallback = `storyAsset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const seed = compactString(baseId) || fallback;
  let id = seed;
  let index = 2;
  while (usedIds?.has?.(id)) {
    id = `${seed}_${index}`;
    index += 1;
  }
  usedIds?.add?.(id);
  return id;
}

export function createStoryboardItemFromAsset(asset, order = 0, usedIds = new Set()) {
  if (!asset) return null;
  const kind = assetKind(asset);
  const src = firstString([
    asset.url,
    asset.src,
    asset.assetUrl,
    asset.imageUrl,
    asset.videoSrc,
    asset.audioSrc,
    asset.assetPath,
    asset.path,
  ]);
  const id = uniqueItemId(asset.id || asset.assetId, usedIds);
  const title = firstString([asset.title, asset.name, asset.filename, asset.fileName, id]);
  const previewUrl = kind === 'video'
    ? firstString([asset.poster, asset.previewUrl, asset.thumb, asset.thumbnail])
    : kind === 'audio'
      ? firstString([asset.poster, asset.previewUrl, asset.thumb, asset.thumbnail])
      : src;

  return {
    id,
    assetId: asset.assetId || asset.id || '',
    assetPath: asset.assetPath || asset.path || asset.localPath || '',
    kind,
    mediaKind: kind,
    title: title || (kind === 'video' ? '视频素材' : kind === 'audio' ? '音频素材' : '图片素材'),
    url: src || asset.url || asset.src || '',
    src: src || asset.src || asset.url || '',
    poster: asset.poster || '',
    previewUrl,
    duration: asset.duration || asset.durationText || '',
    mime: asset.mime || '',
    source: 'storyboard-editor',
    order,
    meta: asset.meta || undefined,
  };
}

export function buildStoryboardItemsFromScriptNodes(scriptNodes, options = {}) {
  const modes = normalizeMediaMode(options.mediaMode);
  const nodesById = options.nodesById instanceof Map ? options.nodesById : null;
  const sourceNodes = compactArray(scriptNodes)
    .filter((node) => node?.type === 'script' && storyboardPackageFromScriptNode(node));
  const items = [];

  sourceNodes.forEach((scriptNode) => {
    const storyboardPackage = storyboardPackageFromScriptNode(scriptNode);
    shotGroupsFromPackage(storyboardPackage).forEach(({ group, groupId, index }) => {
      const tasks = tasksForShotGroup(storyboardPackage, groupId);
      const imageResult = mediaSourceForGroup({
        scriptNode,
        storyboardPackage,
        group,
        groupId,
        tasks,
        kind: 'image',
        nodesById,
      });
      const videoResult = mediaSourceForGroup({
        scriptNode,
        storyboardPackage,
        group,
        groupId,
        tasks,
        kind: 'video',
        nodesById,
      });
      const imageSource = imageResult.source;
      const videoSource = videoResult.source;
      const duration = durationForGroup(group, tasks);

      modes.forEach((kind) => {
        const url = kind === 'video' ? videoSource : imageSource;
        if (!url) return;
        const sourcePart = stableIdPart(scriptNode.id, 'script');
        const groupPart = stableIdPart(groupId, `group-${index + 1}`);
        const titleKind = kind === 'video' ? '视频' : '图片';
        const poster = kind === 'video'
          ? posterForGroup({ group, imageSource, linkedImageNode: imageResult.node })
          : '';
        items.push({
          id: `linked-script-${sourcePart}-${groupPart}-${kind}`,
          source: LINKED_SCRIPT_STORYBOARD_SOURCE,
          sourceNodeId: scriptNode.id,
          scriptNodeId: scriptNode.id,
          sourceType: 'script',
          storyboardPackageId: storyboardPackage.id || '',
          storyboardShotGroupId: groupId,
          shotGroupId: groupId,
          shotGroupIndex: index,
          kind,
          mediaKind: kind,
          title: `${groupId} · ${titleKind}`,
          url,
          src: url,
          poster,
          previewUrl: kind === 'video' ? poster : url,
          duration,
          order: items.length,
          meta: {
            source: LINKED_SCRIPT_STORYBOARD_SOURCE,
            sourceNodeId: scriptNode.id,
            storyboardPackageId: storyboardPackage.id || '',
            storyboardShotGroupId: groupId,
          },
          originalNode: kind === 'video'
            ? {
              type: 'video',
              title: `${groupId} · ${titleKind}`,
              videoSrc: url,
              poster,
              duration,
            }
            : {
              type: 'image',
              title: `${groupId} · ${titleKind}`,
              src: url,
            },
        });
      });
    });
  });

  return resequenceStoryboardItems(items);
}

function isLinkedScriptStoryboardItem(item, sourceNodeIds = []) {
  const sourceIds = new Set(compactArray(sourceNodeIds).map(compactString).filter(Boolean));
  const isLinked = item?.source === LINKED_SCRIPT_STORYBOARD_SOURCE
    || item?.meta?.source === LINKED_SCRIPT_STORYBOARD_SOURCE
    || compactString(item?.id).startsWith('linked-script-');
  if (!isLinked) return false;
  if (!sourceIds.size) return true;
  const itemSourceId = compactString(item?.sourceNodeId || item?.scriptNodeId || item?.meta?.sourceNodeId);
  return sourceIds.has(itemSourceId);
}

export function mergeLinkedScriptStoryboardItems(existingItems, linkedItems, options = {}) {
  const sourceNodeIds = compactArray(options.sourceNodeIds);
  const manualItems = normalizeStoryboardItems(existingItems)
    .filter((item) => !isLinkedScriptStoryboardItem(item, sourceNodeIds));
  return resequenceStoryboardItems([
    ...normalizeStoryboardItems(linkedItems),
    ...manualItems,
  ]);
}
