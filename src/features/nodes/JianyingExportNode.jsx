import React from 'react';
import { JianyingApi, getBackendBaseUrl, makeAssetUrl } from '../../shared/platform/backendClient.js';
import { useHistory } from '../../shared/store/libraryStore.js';
import {
  historyKindOf,
  historyMediaSrc,
  normalizeHistoryStatus,
} from '../../shared/utils/history.js';
import { ICheck, IFilm, IFolder, IVideo } from '../../shared/ui/icons/index.jsx';
import { NodeBlankState, NodeShell } from './NodeShell.jsx';

const TRUNCATED_MARKER = '[truncated]';
const ELLIPSIS_CHAR = '\u2026';

function isTruncatedDataUrl(url) {
  const text = String(url || '').trim();
  if (!text.startsWith('data:')) return false;
  if (text.includes(TRUNCATED_MARKER) || text.includes('...') || text.includes(ELLIPSIS_CHAR)) return true;
  const commaIndex = text.indexOf(',');
  if (commaIndex < 0) return true;
  const meta = text.slice(5, commaIndex).toLowerCase();
  const data = text.slice(commaIndex + 1);
  if (!data) return true;
  if (meta.includes('base64')) {
    if (/[^A-Za-z0-9+/=]/.test(data)) return true;
    if (data.length % 4 === 1) return true;
  }
  return false;
}

function normalizeMediaPath(value) {
  const text = String(value || '').trim();
  if (!text || isTruncatedDataUrl(text)) return '';
  if (/^(https?:|file:|data:|blob:|libai-asset:)/i.test(text)) return text;
  if (text.startsWith('/assets/') || text.startsWith('/static/projects/') || text.startsWith('static/projects/')) return text;
  return text;
}

function firstMediaPath(...values) {
  for (const value of values) {
    const normalized = normalizeMediaPath(value);
    if (normalized) return normalized;
  }
  return '';
}

function nodeImageUrl(node) {
  if (!node) return '';
  const settings = node.settings || {};
  return firstMediaPath(
    node.src,
    node.url,
    node.imageUrl,
    node.image_url,
    node.assetUrl,
    node.assetPath,
    settings.src,
    settings.url,
    settings.imageUrl,
    settings.image_url,
    settings.panoramaImageUrl,
    settings.selectedPreviewImage,
    settings.outputImageUrl,
    settings.assetUrl,
    settings.assetPath,
  );
}

function nodeVideoUrl(node) {
  if (!node) return '';
  const settings = node.settings || {};
  return firstMediaPath(
    node.videoSrc,
    node.videoUrl,
    node.video_url,
    node.url,
    node.assetUrl,
    node.assetPath,
    node.content,
    settings.videoSrc,
    settings.videoUrl,
    settings.video_url,
    settings.outputVideoUrl,
    settings.url,
    settings.assetUrl,
    settings.assetPath,
  );
}

function nodeAudioUrl(node) {
  if (!node) return '';
  const settings = node.settings || {};
  return firstMediaPath(
    node.audioSrc,
    node.audioUrl,
    node.audio_url,
    node.url,
    node.assetUrl,
    node.assetPath,
    settings.audioSrc,
    settings.audioUrl,
    settings.audio_url,
    settings.outputAudioUrl,
    settings.url,
    settings.assetUrl,
    settings.assetPath,
  );
}

function isVideoUrl(value) {
  const url = String(value || '').toLowerCase();
  return Boolean(
    url.startsWith('data:video/')
    || /\.(mp4|webm|mov|m4v|mkv|avi)(?:$|\?)/.test(url)
    || url.includes('/video')
    || url.includes('sora')
    || url.includes('veo')
  );
}

function isImageUrl(value) {
  const url = String(value || '').toLowerCase();
  return Boolean(
    url.startsWith('data:image/')
    || /\.(png|jpe?g|webp|gif|avif|bmp|svg)(?:$|\?)/.test(url)
    || url.includes('/image')
  );
}

function isAudioUrl(value) {
  const url = String(value || '').toLowerCase();
  return Boolean(
    url.startsWith('data:audio/')
    || /\.(mp3|wav|m4a|flac|ogg|aac)(?:$|\?)/.test(url)
    || url.includes('/audio')
  );
}

function parseCreatedAt(value) {
  if (!value) return 0;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) return asNumber;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDurationSeconds(value, fallback = 15) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  const text = String(value || '').trim();
  if (!text) return fallback;
  const colonParts = text.split(':').map((part) => Number(part));
  if (colonParts.length === 2 && colonParts.every(Number.isFinite)) {
    return Math.max(1, colonParts[0] * 60 + colonParts[1]);
  }
  if (colonParts.length === 3 && colonParts.every(Number.isFinite)) {
    return Math.max(1, colonParts[0] * 3600 + colonParts[1] * 60 + colonParts[2]);
  }
  const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:s|秒)?\s*[-~至到]\s*(\d+(?:\.\d+)?)/i);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) return end - start;
  }
  const parsed = Number(text.replace(/秒|s$/gi, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNumberOrUndefined(value) {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function normalizeSegmentIds(value) {
  const raw = Array.isArray(value)
    ? value
    : (typeof value === 'string' ? value.split(/[,\s]+/) : [value]);
  const ids = Array.from(new Set(raw.map((item) => Number(item)).filter((item) => Number.isFinite(item))));
  return ids.length > 0 ? ids : undefined;
}

function segmentIdsFromSource(source) {
  const ids = normalizeSegmentIds(
    source?.source_segment_ids
    || source?.sourceSegmentIds
    || source?.segmentIds
    || source?.segment_ids
  );
  if (ids) return ids;
  const segmentId = Number(source?.segmentId ?? source?.segment_id);
  return Number.isFinite(segmentId) ? [segmentId] : undefined;
}

function timelineStartMs(source) {
  return toNumberOrUndefined(source?.timeline_start_ms ?? source?.timelineStartMs ?? source?.start_ms ?? source?.startMs);
}

function timelineEndMs(source) {
  return toNumberOrUndefined(source?.timeline_end_ms ?? source?.timelineEndMs ?? source?.end_ms ?? source?.endMs);
}

function nodeOrder(a, b) {
  if (Math.abs((a.y || 0) - (b.y || 0)) > 24) return (a.y || 0) - (b.y || 0);
  return (a.x || 0) - (b.x || 0);
}

function collectUpstream(node, allNodes, edges) {
  const incoming = (edges || []).filter((edge) => edge?.to === node.id);
  const byId = new Map((allNodes || []).map((item) => [item.id, item]));
  return incoming.map((edge) => byId.get(edge.from)).filter(Boolean).sort(nodeOrder);
}

function getConnectionTime(edge, fallbackOrder) {
  if (typeof edge?.createdAt === 'number' && Number.isFinite(edge.createdAt)) return edge.createdAt;
  const parsed = Date.parse(edge?.createdAt || '');
  return Number.isFinite(parsed) ? parsed : fallbackOrder;
}

function getNodeCreatedAt(node) {
  if (typeof node?.createdAt === 'number' && Number.isFinite(node.createdAt)) return node.createdAt;
  const parsed = Date.parse(node?.createdAt || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildShotOrder(shotNodes, edges) {
  if (!shotNodes.length) return [];
  const shotIdSet = new Set(shotNodes.map((item) => item.id));
  const nodeCreatedAt = new Map(shotNodes.map((item) => [item.id, getNodeCreatedAt(item)]));
  const shotEdges = [];
  (edges || []).forEach((edge, index) => {
    if (!shotIdSet.has(edge?.from) || !shotIdSet.has(edge?.to)) return;
    shotEdges.push({ from: edge.from, to: edge.to, time: getConnectionTime(edge, index), order: index });
  });

  const adjacency = new Map();
  const indegree = new Map();
  const minIncomingTime = new Map();
  shotIdSet.forEach((id) => indegree.set(id, 0));
  shotEdges.forEach((edge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push(edge);
    indegree.set(edge.to, (indegree.get(edge.to) || 0) + 1);
    const current = minIncomingTime.get(edge.to);
    if (current === undefined || edge.time < current) minIncomingTime.set(edge.to, edge.time);
  });
  adjacency.forEach((list) => list.sort((a, b) => a.time - b.time || a.order - b.order));

  const weight = (id) => {
    const incoming = minIncomingTime.get(id);
    if (incoming !== undefined) return incoming;
    const outgoing = adjacency.get(id)?.[0]?.time;
    if (outgoing !== undefined) return outgoing;
    return nodeCreatedAt.get(id) ?? 0;
  };

  const ready = [];
  shotIdSet.forEach((id) => {
    if ((indegree.get(id) || 0) === 0) ready.push(id);
  });
  const sortReady = () => ready.sort((a, b) => (
    weight(a) - weight(b)
    || (nodeCreatedAt.get(a) ?? 0) - (nodeCreatedAt.get(b) ?? 0)
    || a.localeCompare(b)
  ));

  const ordered = [];
  sortReady();
  while (ready.length > 0) {
    const current = ready.shift();
    ordered.push(current);
    (adjacency.get(current) || []).forEach((edge) => {
      indegree.set(edge.to, (indegree.get(edge.to) || 0) - 1);
      if ((indegree.get(edge.to) || 0) === 0) ready.push(edge.to);
    });
    sortReady();
  }

  if (ordered.length < shotNodes.length) {
    const remaining = shotNodes.map((item) => item.id).filter((id) => !ordered.includes(id));
    remaining.sort((a, b) => (
      weight(a) - weight(b)
      || (nodeCreatedAt.get(a) ?? 0) - (nodeCreatedAt.get(b) ?? 0)
      || a.localeCompare(b)
    ));
    ordered.push(...remaining);
  }
  return ordered;
}

function getUpstreamShotIdSet(terminalShotIds, edges, shotIdSet) {
  const terminals = [];
  const seen = new Set();
  (terminalShotIds || []).forEach((id) => {
    if (!shotIdSet.has(id) || seen.has(id)) return;
    seen.add(id);
    terminals.push(id);
  });
  if (!terminals.length) return new Set();

  const incoming = new Map();
  (edges || []).forEach((edge) => {
    if (!shotIdSet.has(edge?.from) || !shotIdSet.has(edge?.to)) return;
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    incoming.get(edge.to).push(edge.from);
  });

  const visited = new Set(terminals);
  const queue = [...terminals];
  for (let i = 0; i < queue.length; i += 1) {
    const current = queue[i];
    (incoming.get(current) || []).forEach((from) => {
      if (visited.has(from)) return;
      visited.add(from);
      queue.push(from);
    });
  }
  return visited;
}

function resolveHistoryMediaUrl(item) {
  const primary = historyMediaSrc(item);
  if (primary) return normalizeMediaPath(primary);
  if (item?.assetId) return normalizeMediaPath(makeAssetUrl({ id: item.assetId }, getBackendBaseUrl()));
  return '';
}

function isCompletedVideoHistory(item) {
  return historyKindOf(item) === 'video' && normalizeHistoryStatus(item?.status) === 'completed';
}

function newestHistoryVideoForNode(history, nodeId) {
  if (!nodeId) return null;
  return [...(history || [])]
    .filter((item) => {
      if (!isCompletedVideoHistory(item)) return false;
      return String(item.sourceNodeId || item.nodeId || '') === String(nodeId);
    })
    .sort((a, b) => parseCreatedAt(b.updatedAt || b.createdAt || b.time) - parseCreatedAt(a.updatedAt || a.createdAt || a.time))[0] || null;
}

function newestHistoryVideoForPanel(history, panelIndex, nodesById) {
  const panel = String(panelIndex || '').trim();
  if (!panel) return null;
  return [...(history || [])]
    .filter((item) => {
      if (!isCompletedVideoHistory(item)) return false;
      if (String(item.sourcePanelIndex || item.panelIndex || '') !== panel) return false;
      const itemNodeId = item.sourceNodeId || item.nodeId;
      return itemNodeId ? nodesById.has(String(itemNodeId)) : true;
    })
    .sort((a, b) => parseCreatedAt(b.updatedAt || b.createdAt || b.time) - parseCreatedAt(a.updatedAt || a.createdAt || a.time))[0] || null;
}

function pushUnique(list, seen, item, kind) {
  const url = normalizeMediaPath(item?.url);
  if (!url) return;
  const key = [
    kind,
    url,
    item.panelIndex || '',
    item.timeline_start_ms ?? '',
    item.timeline_end_ms ?? '',
  ].join('|');
  if (seen.has(key)) return;
  seen.add(key);
  list.push({ ...item, url, order: list.length });
}

function selectedVideoFromShot(shot) {
  const videos = Array.isArray(shot?.videos) ? shot.videos : [];
  const selected = videos.find((item) => item?.selected) || videos[0];
  return firstMediaPath(
    selected?.url,
    selected?.videoUrl,
    selected?.src,
    shot?.video_url,
    shot?.videoUrl,
    shot?.video_urls?.[0],
    shot?.videoUrls?.[0],
    shot?.outputVideoUrl,
  );
}

function imageFromShot(shot) {
  return firstMediaPath(
    shot?.image_url,
    shot?.imageUrl,
    shot?.thumbUrl,
    shot?.thumbnailUrl,
    shot?.posterUrl,
    shot?.refImageUrls?.[0],
  );
}

function collectShotVideos(sourceNode, pushVideo) {
  const settings = sourceNode.settings || {};
  const directShots = Array.isArray(sourceNode.shots)
    ? sourceNode.shots
    : (Array.isArray(settings.shots) ? settings.shots : []);
  const shotGroups = Array.isArray(sourceNode.shotGroups)
    ? sourceNode.shotGroups
    : (Array.isArray(settings.shotGroups) ? settings.shotGroups : []);

  const flatGroupedShots = shotGroups.flatMap((group) => (
    Array.isArray(group?.shots)
      ? group.shots.map((shot, index) => ({ ...shot, _groupId: group.groupId, _groupOrder: index }))
      : []
  ));
  const sourceShots = flatGroupedShots.length ? flatGroupedShots : directShots;

  sourceShots
    .filter((shot) => selectedVideoFromShot(shot))
    .sort((a, b) => {
      const at = timelineStartMs(a);
      const bt = timelineStartMs(b);
      if (at !== undefined && bt !== undefined) return at - bt;
      if (at !== undefined) return -1;
      if (bt !== undefined) return 1;
      const an = Number(a.shotNumber || a.scene_index || a.n || a._groupOrder || 0);
      const bn = Number(b.shotNumber || b.scene_index || b.n || b._groupOrder || 0);
      return (Number.isFinite(an) ? an : 0) - (Number.isFinite(bn) ? bn : 0);
    })
    .forEach((shot) => {
      const videoUrl = selectedVideoFromShot(shot);
      if (!videoUrl) return;
      const duration = parseDurationSeconds(shot.duration || shot.dur || shot.timeline, 15);
      const panelIndex = String(shot.scene_index || shot.shotNumber || shot.n || shot.id || shot._groupId || '').trim();
      pushVideo({
        url: videoUrl,
        duration,
        panelIndex,
        timeline_start_ms: timelineStartMs(shot),
        timeline_end_ms: timelineEndMs(shot),
        source_segment_ids: segmentIdsFromSource(shot),
      });
    });
}

function collectVeoGallery(sourceNode, pushVideo) {
  const settings = sourceNode.settings || {};
  const segments = Array.isArray(settings.segments) ? settings.segments : [];
  const shots = Array.isArray(settings.shots) ? settings.shots : [];
  const usedShots = new Set();

  const parseShotNumber = (value) => {
    const parts = String(value || '').match(/\d+/g);
    return parts ? parts.map((part) => Number(part)).filter(Number.isFinite) : [];
  };
  const compareShotNumber = (a, b) => {
    const aParts = parseShotNumber(a.shotNumber);
    const bParts = parseShotNumber(b.shotNumber);
    const max = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < max; i += 1) {
      const aPart = aParts[i];
      const bPart = bParts[i];
      if (aPart === undefined && bPart === undefined) break;
      if (aPart === undefined) return 1;
      if (bPart === undefined) return -1;
      if (aPart !== bPart) return aPart - bPart;
    }
    return String(a.shotNumber || '').localeCompare(String(b.shotNumber || ''));
  };
  const matchesSegment = (shot, segmentId) => {
    const parsed = Number(shot?.segmentId);
    if (Number.isFinite(parsed)) return parsed === segmentId;
    return shot?.id ? String(shot.id).startsWith(`${segmentId}-`) : false;
  };

  const orderedShots = [];
  segments.forEach((segment) => {
    const segmentId = Number(segment?.id);
    const segmentShots = shots.filter((shot) => Number.isFinite(segmentId) && matchesSegment(shot, segmentId)).sort(compareShotNumber);
    segmentShots.forEach((shot) => {
      usedShots.add(shot);
      orderedShots.push(shot);
    });
  });
  orderedShots.push(...shots.filter((shot) => !usedShots.has(shot)).sort(compareShotNumber));

  orderedShots.forEach((shot) => {
    const videoUrl = selectedVideoFromShot(shot);
    if (!videoUrl) return;
    pushVideo({
      url: videoUrl,
      duration: parseDurationSeconds(shot.duration || shot.dur, 15),
      panelIndex: shot.id || shot.shotNumber,
      timeline_start_ms: timelineStartMs(shot),
      timeline_end_ms: timelineEndMs(shot),
      source_segment_ids: segmentIdsFromSource(shot),
    });
  });
}

function collectStoryboardCollector(sourceNode, context, pushVideo) {
  const { allNodes, edges, history } = context;
  const collectorSettings = sourceNode.settings || {};
  const preferredOrder = Array.isArray(collectorSettings.shot_order) ? collectorSettings.shot_order : [];
  const shotNodes = allNodes.filter((item) => item.type === 'shot-node');
  const shotNodeMap = new Map(shotNodes.map((shot) => [shot.id, shot]));
  const shotIdSet = new Set(shotNodes.map((shot) => shot.id));
  const shotEdges = (edges || []).filter((edge) => shotIdSet.has(edge?.from) && shotIdSet.has(edge?.to));
  const terminalShotIds = (edges || [])
    .filter((edge) => edge?.to === sourceNode.id && shotIdSet.has(edge.from))
    .map((edge) => edge.from);
  const upstreamShotIdSet = getUpstreamShotIdSet(terminalShotIds, shotEdges, shotIdSet);
  const upstreamShotNodes = shotNodes.filter((shot) => upstreamShotIdSet.has(shot.id));
  const collectableShotIds = upstreamShotNodes.length ? buildShotOrder(upstreamShotNodes, shotEdges) : [];
  const collectableSet = new Set(collectableShotIds);
  const mergedOrder = [];
  const seen = new Set();

  preferredOrder.forEach((id) => {
    if (!collectableSet.has(id) || seen.has(id)) return;
    mergedOrder.push(id);
    seen.add(id);
  });
  collectableShotIds.forEach((id) => {
    if (seen.has(id)) return;
    mergedOrder.push(id);
    seen.add(id);
  });

  mergedOrder.forEach((shotId) => {
    const shotNode = shotNodeMap.get(shotId);
    if (!shotNode) return;
    const shotSettings = shotNode.settings || {};
    const status = String(shotSettings.status || 'draft');
    if (status !== 'done' && status !== 'completed') return;
    const fallbackVideoUrl = firstMediaPath(shotSettings.video_url, shotSettings.videoUrl, shotSettings.video_urls?.[0], shotSettings.videoUrls?.[0]);
    const historyItem = newestHistoryVideoForNode(history, shotId);
    const videoUrl = resolveHistoryMediaUrl(historyItem) || fallbackVideoUrl;
    if (!videoUrl) return;
    pushVideo({
      url: videoUrl,
      duration: parseDurationSeconds(shotSettings.duration || shotSettings.dur, 15),
      panelIndex: typeof shotSettings.sourcePanelIndex === 'string' ? shotSettings.sourcePanelIndex : shotId,
      timeline_start_ms: timelineStartMs(shotSettings),
      timeline_end_ms: timelineEndMs(shotSettings),
      source_segment_ids: segmentIdsFromSource(shotSettings),
    });
  });
}

function storyboardCollectorDetailItems(sourceNode) {
  const items = Array.isArray(sourceNode.items)
    ? sourceNode.items
    : (Array.isArray(sourceNode.settings?.items) ? sourceNode.settings.items : []);
  let cursorMs = 0;
  return items
    .filter((item) => item && (item.url || item.src))
    .map((item, index) => ({ ...item, order: Number.isFinite(Number(item.order)) ? Number(item.order) : index }))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => {
      const mediaKind = String(item.mediaKind || item.kind || '').toLowerCase() === 'video' ? 'video' : 'image';
      const duration = parseDurationSeconds(item.duration || item.dur, mediaKind === 'video' ? 15 : 3);
      const start = timelineStartMs(item) ?? cursorMs;
      const end = timelineEndMs(item) ?? (start + Math.round(duration * 1000));
      cursorMs = Math.max(cursorMs, end);
      return {
        ...item,
        mediaKind,
        url: firstMediaPath(item.url, item.src),
        duration,
        panelIndex: item.panelIndex || item.title || String(index + 1).padStart(2, '0'),
        timeline_start_ms: start,
        timeline_end_ms: end,
        source_segment_ids: segmentIdsFromSource(item),
      };
    });
}

function collectVideoItems(upstream, context, subtitleDurationMap) {
  const { allNodes, history } = context;
  const nodesById = new Map((allNodes || []).map((item) => [item.id, item]));
  const videos = [];
  const seen = new Set();
  const pushVideo = (item) => pushUnique(videos, seen, item, 'video');

  upstream.forEach((sourceNode) => {
    const settings = sourceNode.settings || {};

    if (sourceNode.type === 'storyboard-collector-detail' || sourceNode.type === 'storyboard.collector') {
      storyboardCollectorDetailItems(sourceNode).forEach((item) => {
        if (item.mediaKind !== 'video') return;
        pushVideo({
          url: item.url,
          duration: item.duration,
          panelIndex: item.panelIndex,
          timeline_start_ms: item.timeline_start_ms,
          timeline_end_ms: item.timeline_end_ms,
          source_segment_ids: item.source_segment_ids,
        });
      });
      return;
    }

    if (sourceNode.type === 'p2-prompts') {
      const panels = settings.analysisResult?.results || [];
      const panelVideoMap = settings.panelVideoMap || {};
      panels.forEach((panel) => {
        const panelIndex = String(panel?.panel_index || '').trim();
        if (!panelIndex) return;
        const overrideVideo = panelVideoMap[panelIndex];
        const videoUrl = firstMediaPath(overrideVideo?.url, overrideVideo?.videoUrl)
          || resolveHistoryMediaUrl(newestHistoryVideoForPanel(history, panelIndex, nodesById));
        if (!videoUrl) return;
        pushVideo({ url: videoUrl, duration: 15, panelIndex });
      });
      return;
    }

    if (sourceNode.type === 'storyboard-collector') {
      collectStoryboardCollector(sourceNode, context, pushVideo);
      return;
    }

    if (sourceNode.type === 'storyboard-node') {
      collectShotVideos(sourceNode, pushVideo);
      return;
    }

    if (sourceNode.type === 'veo-gallery') {
      collectVeoGallery(sourceNode, pushVideo);
      return;
    }

    if (sourceNode.type === 'shot-node') {
      const status = String(settings.status || 'done');
      if (status !== 'done' && status !== 'completed') return;
      const fallbackVideoUrl = firstMediaPath(settings.video_url, settings.videoUrl, settings.video_urls?.[0], settings.videoUrls?.[0]);
      const videoUrl = resolveHistoryMediaUrl(newestHistoryVideoForNode(history, sourceNode.id)) || fallbackVideoUrl;
      if (!videoUrl) return;
      pushVideo({
        url: videoUrl,
        duration: parseDurationSeconds(settings.duration || settings.dur, 15),
        panelIndex: typeof settings.sourcePanelIndex === 'string' ? settings.sourcePanelIndex : sourceNode.id,
        timeline_start_ms: timelineStartMs(settings),
        timeline_end_ms: timelineEndMs(settings),
        source_segment_ids: segmentIdsFromSource(settings),
      });
      return;
    }

    if (sourceNode.type === 'gen-video') {
      const videoUrl = firstMediaPath(settings.videoUrl, settings.video_url, sourceNode.content);
      if (videoUrl) pushVideo({ url: videoUrl, duration: parseDurationSeconds(settings.duration || sourceNode.duration, 15) });
      return;
    }

    collectShotVideos(sourceNode, pushVideo);

    const videoUrl = nodeVideoUrl(sourceNode);
    if (videoUrl && (isVideoUrl(videoUrl) || sourceNode.type === 'video')) {
      pushVideo({
        url: videoUrl,
        duration: parseDurationSeconds(sourceNode.duration || settings.duration || sourceNode.dur || settings.dur, 15),
        panelIndex: sourceNode.title || sourceNode.id,
        timeline_start_ms: timelineStartMs(sourceNode) ?? timelineStartMs(settings),
        timeline_end_ms: timelineEndMs(sourceNode) ?? timelineEndMs(settings),
        source_segment_ids: segmentIdsFromSource(sourceNode) || segmentIdsFromSource(settings),
      });
    }
  });

  const withDuration = videos.map((video) => {
    const panelIndex = String(video.panelIndex || '').trim();
    const desired = panelIndex ? subtitleDurationMap[panelIndex] : undefined;
    return desired ? { ...video, duration: desired } : video;
  });

  const filtered = Object.keys(subtitleDurationMap).length === 0
    ? withDuration
    : (() => {
      const hits = withDuration.filter((video) => {
        const panelIndex = String(video.panelIndex || '').trim();
        return panelIndex && subtitleDurationMap[panelIndex];
      });
      return hits.length ? hits : withDuration;
    })();

  return [...filtered]
    .sort((a, b) => {
      const aTimeline = toNumberOrUndefined(a.timeline_start_ms);
      const bTimeline = toNumberOrUndefined(b.timeline_start_ms);
      if (aTimeline !== undefined && bTimeline !== undefined) return aTimeline - bTimeline;
      if (aTimeline !== undefined) return -1;
      if (bTimeline !== undefined) return 1;
      return a.order - b.order;
    })
    .map((video, index) => ({ ...video, order: index }));
}

function collectImageItems(upstream) {
  const images = [];
  const seen = new Set();
  const pushImage = (item) => pushUnique(images, seen, item, 'image');

  upstream.forEach((sourceNode) => {
    if (sourceNode.type === 'storyboard-collector-detail' || sourceNode.type === 'storyboard.collector') {
      storyboardCollectorDetailItems(sourceNode).forEach((item) => {
        if (item.mediaKind !== 'image') return;
        pushImage({
          url: item.url,
          duration: item.duration,
          timeline_start_ms: item.timeline_start_ms,
          timeline_end_ms: item.timeline_end_ms,
          panelIndex: item.panelIndex,
          as_timeline: true,
        });
      });
      return;
    }

    const imageUrl = nodeImageUrl(sourceNode);
    if (imageUrl && (isImageUrl(imageUrl) || sourceNode.type === 'image')) {
      pushImage({ url: imageUrl });
    }

    const settings = sourceNode.settings || {};
    const directShots = Array.isArray(sourceNode.shots)
      ? sourceNode.shots
      : (Array.isArray(settings.shots) ? settings.shots : []);
    const shotGroups = Array.isArray(sourceNode.shotGroups)
      ? sourceNode.shotGroups
      : (Array.isArray(settings.shotGroups) ? settings.shotGroups : []);
    const flatShots = shotGroups.flatMap((group) => Array.isArray(group?.shots) ? group.shots : []);
    [...directShots, ...flatShots].forEach((shot) => {
      const shotImage = imageFromShot(shot);
      if (shotImage) pushImage({ url: shotImage });
    });
  });

  return images.map((item, index) => ({ ...item, order: index }));
}

function collectAudioItems(upstream) {
  const audios = [];
  const seen = new Set();
  const pushAudio = (item) => pushUnique(audios, seen, item, 'audio');

  upstream.forEach((sourceNode) => {
    const settings = sourceNode.settings || {};
    const audioUrl = nodeAudioUrl(sourceNode);
    if (audioUrl && (isAudioUrl(audioUrl) || sourceNode.type === 'audio' || sourceNode.type === 'audio-reference')) {
      pushAudio({
        url: audioUrl,
        duration: parseDurationSeconds(sourceNode.duration || settings.duration, 0),
        start_ms: toNumberOrUndefined(sourceNode.start_ms ?? sourceNode.startMs ?? settings.start_ms ?? settings.startMs) || 0,
        end_ms: toNumberOrUndefined(sourceNode.end_ms ?? sourceNode.endMs ?? settings.end_ms ?? settings.endMs),
      });
    }

    const audioItems = [
      ...(Array.isArray(sourceNode.audios) ? sourceNode.audios : []),
      ...(Array.isArray(settings.audios) ? settings.audios : []),
      ...(Array.isArray(settings.audioItems) ? settings.audioItems : []),
    ];
    audioItems.forEach((item) => {
      const url = firstMediaPath(item?.url, item?.src, item?.audioUrl, item?.audio_url);
      if (!url) return;
      pushAudio({
        url,
        duration: parseDurationSeconds(item.duration || item.dur, 0),
        start_ms: toNumberOrUndefined(item.start_ms ?? item.startMs) || 0,
        end_ms: toNumberOrUndefined(item.end_ms ?? item.endMs),
      });
    });
  });

  return audios
    .sort((a, b) => (Number(a.start_ms) || 0) - (Number(b.start_ms) || 0) || a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
}

function collectSubtitleItems(upstream, videos) {
  const segmentMap = new Map();

  upstream.forEach((sourceNode) => {
    const settings = sourceNode.settings || {};
    const rawSegments = [
      ...(Array.isArray(settings.segmentsResult?.segments) ? settings.segmentsResult.segments : []),
      ...(Array.isArray(settings.segments) ? settings.segments : []),
      ...(Array.isArray(sourceNode.segmentsResult?.segments) ? sourceNode.segmentsResult.segments : []),
      ...(Array.isArray(sourceNode.segments) ? sourceNode.segments : []),
    ];

    rawSegments.forEach((segment) => {
      const segmentId = Number(segment?.id ?? segment?.segment_id ?? segment?.segmentId);
      if (!Number.isFinite(segmentId) || segmentMap.has(segmentId)) return;
      const startMs = timelineStartMs(segment);
      const endMs = timelineEndMs(segment);
      if (startMs === undefined || endMs === undefined || endMs <= startMs) return;
      const text = String(segment.subtitleText || segment.subtitle || segment.content || segment.text || '').trim();
      if (!text) return;
      segmentMap.set(segmentId, { id: segmentId, startMs, endMs, text });
    });
  });

  if (!segmentMap.size) return [];
  const referencedIds = new Set();
  videos.forEach((video) => {
    (Array.isArray(video.source_segment_ids) ? video.source_segment_ids : []).forEach((id) => {
      const segmentId = Number(id);
      if (Number.isFinite(segmentId)) referencedIds.add(segmentId);
    });
  });
  if (!referencedIds.size) return [];

  return Array.from(referencedIds)
    .map((id) => segmentMap.get(id))
    .filter(Boolean)
    .sort((a, b) => a.startMs - b.startMs || a.id - b.id)
    .map((item, index) => ({
      segment_id: item.id,
      start_ms: item.startMs,
      end_ms: item.endMs,
      text: item.text,
      order: index,
    }));
}

function buildSubtitleDurationMap(upstream) {
  const normalized = {};
  upstream.forEach((sourceNode) => {
    const map = sourceNode?.settings?.panelDurationMap || sourceNode?.panelDurationMap || {};
    Object.entries(map).forEach(([key, value]) => {
      if (!key) return;
      const duration = Number(value);
      if (!Number.isFinite(duration) || duration <= 0) return;
      normalized[String(key)] = duration;
    });
  });
  return normalized;
}

function collectExportPayload(node, allNodes, edges, history) {
  const upstream = collectUpstream(node, allNodes, edges);
  const subtitleDurationMap = buildSubtitleDurationMap(upstream);
  const context = { allNodes: allNodes || [], edges: edges || [], history: history || [] };
  const videos = collectVideoItems(upstream, context, subtitleDurationMap);
  const images = collectImageItems(upstream);
  const audios = collectAudioItems(upstream);
  const subtitles = collectSubtitleItems(upstream, videos);
  return {
    upstream,
    videos,
    images,
    audios,
    subtitles,
    subtitleDurationMap,
  };
}

function normalizePath(value) {
  return String(value || '').trim().replace(/\//g, '\\').replace(/\\+$/g, '').toLowerCase();
}

export function JianyingExportNode(props) {
  const { node, allNodes = [], edges = [], onUpdateNode } = props;
  const history = useHistory();
  const settings = node.settings || {};
  const [draftName, setDraftName] = React.useState(settings.draftName || '分镜草稿');
  const [draftRoot, setDraftRoot] = React.useState('');
  const [statusText, setStatusText] = React.useState(settings.exportMessage || '');
  const [exporting, setExporting] = React.useState(false);

  const payload = React.useMemo(
    () => collectExportPayload(node, allNodes, edges, history),
    [node, allNodes, edges, history],
  );
  const timelineImageCount = payload.images.filter((item) => item.as_timeline).length;
  const canExport = Boolean(draftRoot && (payload.videos.length > 0 || timelineImageCount > 0) && !exporting);

  const loadSettings = React.useCallback(async () => {
    try {
      const result = await JianyingApi.settings();
      setDraftRoot(result?.jianyingDraftsRoot || result?.jianying_drafts_root || '');
    } catch {
      setDraftRoot('');
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = React.useCallback((patch) => {
    onUpdateNode?.(node.id, {
      settings: {
        ...(node.settings || {}),
        ...patch,
      },
    });
  }, [node.id, node.settings, onUpdateNode]);

  const handleDraftNameChange = (event) => {
    const nextName = event.target.value;
    setDraftName(nextName);
    updateSettings({ draftName: nextName });
  };

  const handleExport = async () => {
    const cleanName = draftName.trim() || '分镜草稿';
    let currentRoot = draftRoot;
    try {
      const config = await JianyingApi.settings();
      const configuredRoot = String(config?.jianyingDraftsRoot || config?.jianying_drafts_root || '').trim();
      if (!configuredRoot) {
        setStatusText('请先在设置中配置剪映草稿路径');
        return;
      }
      if (!currentRoot || normalizePath(currentRoot) !== normalizePath(configuredRoot)) {
        currentRoot = configuredRoot;
        setDraftRoot(configuredRoot);
      }
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : '无法读取剪映草稿路径配置');
      return;
    }

    const exportPayload = collectExportPayload(node, allNodes, edges, history);
    const { videos, images, audios, subtitles, subtitleDurationMap } = exportPayload;
    const exportTimelineImageCount = images.filter((item) => item.as_timeline).length;
    if (!videos.length && !exportTimelineImageCount) {
      setStatusText('未找到可导出的时间线素材，请先连接视频、图片、分镜或收集节点');
      return;
    }

    setExporting(true);
    setStatusText('正在生成剪映草稿...');
    onUpdateNode?.(node.id, { generating: true, progress: 12, tag: '导出中', error: null });
    try {
      const result = await JianyingApi.exportDraft({
        draft_name: cleanName,
        videos,
        images,
        audios,
        subtitles,
        output_path: currentRoot,
        width: Number(settings.width) || 1920,
        height: Number(settings.height) || 1080,
        use_requested_duration: Object.keys(subtitleDurationMap).length > 0,
        overwrite: false,
      });
      const message = result?.message || '剪映草稿导出完成';
      setStatusText(message);
      onUpdateNode?.(node.id, {
        generating: false,
        progress: 100,
        tag: '已导出',
        error: null,
        settings: {
          ...(node.settings || {}),
          draftName: cleanName,
          draftPath: result?.draft_path || '',
          exportMessage: message,
          exportedAt: new Date().toISOString(),
          lastExportStats: {
            videos: videos.length,
            images: images.length,
            audios: audios.length,
            subtitles: subtitles.length,
          },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || '剪映导出失败');
      setStatusText(message);
      onUpdateNode?.(node.id, {
        generating: false,
        progress: 0,
        tag: '失败',
        error: message,
        settings: {
          ...(node.settings || {}),
          exportMessage: message,
        },
      });
    } finally {
      setExporting(false);
    }
  };

  const isEmpty = payload.upstream.length === 0;

  return (
    <NodeShell {...props} isEmpty={isEmpty} toolbar={null}>
      {isEmpty ? (
        <NodeBlankState
          icon={<IFilm size={25} sw={1.5}/>}
          title="剪映导出"
          description="连接视频、分镜或镜头节点后导出为剪映草稿"
          tone="video"
        />
      ) : (
        <div className="jianying-export-node" onPointerDown={(event) => event.stopPropagation()}>
          <div className="jianying-export-stats">
            <span><IVideo size={13}/> 视频 {payload.videos.length}</span>
            <span>字幕 {payload.subtitles.length}</span>
            <span>音频 {payload.audios.length}</span>
          </div>
          <div className="jianying-export-stats secondary">
            <span>连接 {payload.upstream.length}</span>
            <span>图片 {payload.images.length}</span>
            <span>时长映射 {Object.keys(payload.subtitleDurationMap).length}</span>
          </div>
          <label className="jianying-export-field">
            <span>草稿名称</span>
            <input value={draftName} onChange={handleDraftNameChange} placeholder="分镜草稿" />
          </label>
          <div className="jianying-export-path" title={draftRoot || ''}>
            <IFolder size={13}/>
            <span>{draftRoot || '未配置剪映草稿路径'}</span>
          </div>
          <button type="button" className="jianying-export-button" disabled={!canExport} onClick={handleExport}>
            {exporting ? '导出中...' : '导出到剪映'}
          </button>
          {statusText && (
            <div className={`jianying-export-status ${node.tag === '失败' ? 'error' : ''}`}>
              {node.tag === '已导出' && <ICheck size={13}/>}
              <span>{statusText}</span>
            </div>
          )}
        </div>
      )}
    </NodeShell>
  );
}
