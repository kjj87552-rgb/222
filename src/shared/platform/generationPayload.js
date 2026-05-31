import {
  getMediaKind,
  getMediaSrc,
  getMediaTitle,
  isMediaAsset,
  toMediaReference,
} from '../utils/mediaReferences.js';

const GENERATION_CAPABILITIES = new Set([
  'image.generate',
  'video.generate',
  'audio.generate',
  'text.generate',
  'text.reason',
  'inference.generate',
]);

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values) {
  const seen = new Set();
  return values.map(compactString).filter((value) => {
    const text = compactString(value);
    if (!text || seen.has(text)) return false;
    seen.add(text);
    return true;
  });
}

function isDisplayableSource(value) {
  return /^(https?:|data:|blob:|libai-asset:|\/)/i.test(compactString(value));
}

function localAssetUrl(value) {
  const text = compactString(value);
  if (!text) return '';
  if (text.startsWith('/assets/')) return text;
  if (!/^https?:/i.test(text)) return '';
  try {
    const parsed = new URL(text);
    const host = parsed.hostname.toLowerCase();
    if ((host === '127.0.0.1' || host === 'localhost') && parsed.pathname.startsWith('/assets/')) {
      return `${parsed.pathname}${parsed.search || ''}`;
    }
  } catch {
    return '';
  }
  return '';
}

function assetIdSource(item) {
  const rawId = compactString(item?.assetId || item?.asset_id || (/^asset[_-]/i.test(compactString(item?.id)) ? item.id : ''));
  return rawId ? `/assets/${encodeURIComponent(rawId)}` : '';
}

function seedancePortraitAssetKeys(asset) {
  const assetId = compactString(asset?.assetId || asset?.asset_id || asset?.id);
  const assetRef = compactString(asset?.assetRef || asset?.asset_ref || asset?.ref);
  const assetIdFromRef = assetRef.startsWith('asset://') ? assetRef.slice('asset://'.length) : '';
  return uniqueStrings([
    assetId,
    assetRef,
    assetIdFromRef,
    assetId ? `asset://${assetId}` : '',
  ]);
}

function seedancePortraitAssetKeySet(assets) {
  return new Set(
    listValues(assets).flatMap(seedancePortraitAssetKeys),
  );
}

function isSeedancePortraitMediaReference(item, portraitAssetKeys) {
  if (!portraitAssetKeys?.size) return false;
  const asset = item?.seedancePortraitAsset || item?.seedance_portrait_asset;
  if (!asset) return false;
  return seedancePortraitAssetKeys(asset).some((key) => portraitAssetKeys.has(key));
}

function isLocalPathReference(value) {
  const text = compactString(value);
  if (!text) return false;
  if (/^(https?:|data:|blob:)/i.test(text)) return false;
  if (text.startsWith('/assets/')) return true;
  if (text.startsWith('libai-asset:') || text.startsWith('file:')) return true;
  return /^[A-Za-z]:[\\/]/.test(text) || text.startsWith('\\\\') || text.startsWith('/');
}

function localReferenceSource(item) {
  if (!item || typeof item === 'string') return localAssetUrl(item);
  const byId = assetIdSource(item);
  if (byId) return byId;
  const byAssetUrl = uniqueStrings([
    item.assetUrl,
    item.url,
    item.src,
    item.imageUrl,
    item.settings?.imageUrl,
    item.path,
    item.assetPath,
    item.localPath,
  ]).map(localAssetUrl).find(Boolean);
  if (byAssetUrl) return byAssetUrl;
  return uniqueStrings([item.assetPath, item.localPath, item.path]).find(isLocalPathReference) || '';
}

function referenceSource(item) {
  return localReferenceSource(item) || firstReferenceSource(sourceCandidates(item));
}

function firstReferenceSource(values) {
  const sources = uniqueStrings(values);
  return sources.find(isDisplayableSource) || sources[0] || '';
}

function listValues(value) {
  return Array.isArray(value) ? value : [];
}

function sourceCandidates(item) {
  if (!item || typeof item === 'string') return [item];
  return [
    item.src,
    item.url,
    item.assetUrl,
    item.imageUrl,
    item.settings?.imageUrl,
    item.path,
    item.assetPath,
    item.localPath,
  ];
}

function imageSourcesForNode(node) {
  const imageItems = [
    ...listValues(node.imageUrls),
    ...listValues(node.images),
    ...listValues(node.assets),
  ];
  const scalarItem = {
    assetId: node.assetId,
    asset_id: node.asset_id,
    src: node.src,
    url: node.url,
    assetUrl: node.assetUrl,
    imageUrl: node.imageUrl,
    settings: node.settings,
    path: node.path,
    assetPath: node.assetPath,
    localPath: node.localPath,
  };
  const items = imageItems.length ? [...imageItems, scalarItem] : [node];
  const sources = uniqueStrings(items.map(referenceSource));
  if (sources.length) return sources;
  return uniqueStrings([node.assetPath]);
}

export function normalizeGenerationTab(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'chat') return 'text';
  if (raw === 'reason' || raw === 'text.reason' || raw === 'text.reasoning') return 'text';
  if (raw === 'inference' || raw === 'inference.generate' || raw === 'infer') return 'text';
  if (raw === 'image.generate') return 'image';
  if (raw === 'video.generate') return 'video';
  if (raw === 'audio.generate') return 'audio';
  if (raw === 'text.generate') return 'text';
  if (raw === 'image' || raw === 'video' || raw === 'audio' || raw === 'text') return raw;
  return 'image';
}

export function capabilityForGeneration(payloadOrTab) {
  const raw = typeof payloadOrTab === 'object'
    ? payloadOrTab?.type || payloadOrTab?.capability || payloadOrTab?.tab
    : payloadOrTab;
  const value = String(raw || '').trim().toLowerCase();
  if (GENERATION_CAPABILITIES.has(value)) return value;
  if (value === 'reason' || value === 'text.reasoning') return 'text.reason';
  if (value === 'inference' || value === 'infer') return 'inference.generate';
  if (value === 'chat') return 'text.generate';
  const tab = normalizeGenerationTab(value);
  return `${tab}.generate`;
}

function nodeText(node) {
  if (!node) return '';
  if (node.type === 'text') return compactString(node.body || node.prompt || node.title);
  if (node.type === 'script') {
    const shots = Array.isArray(node.shots) ? node.shots : [];
    if (!shots.length) return compactString(node.title);
    return shots.map((shot, index) => {
      const n = shot.n || index + 1;
      const camera = compactString(shot.shot);
      const desc = compactString(shot.desc || shot.description);
      const dur = compactString(shot.dur || shot.duration);
      return [`${n}.`, camera, desc, dur].filter(Boolean).join(' ');
    }).join('\n');
  }
  if (node.type === 'asset-gen') {
    return compactString(node.finalPrompt || node.prompt || node.title);
  }
  return compactString(node.prompt || node.title);
}

function nodeMedia(node) {
  if (!node) return [];
  const title = node.title || node.id || 'node';
  if (node.type === 'image') {
    const sources = imageSourcesForNode(node);
    if (sources.length) return sources.map((src, index) => ({
      kind: 'image',
      src,
      assetId: node.assetId,
      assetPath: node.assetPath,
      localPath: node.localPath,
      path: node.path,
      seedancePortraitAsset: node.seedancePortraitAsset || node.seedance_portrait_asset,
      title: index ? `${title} ${index + 1}` : title,
    }));
  }
  if (node.type === 'asset-gen') {
    return [];
  }
  if (node.type === 'video') {
    return [
      node.videoSrc ? { kind: 'video', src: node.assetPath || node.videoSrc, assetPath: node.assetPath, title } : null,
      (node.poster || node.posterUrl || node.thumbnailUrl) ? { kind: 'image', src: node.posterPath || node.poster || node.posterUrl || node.thumbnailUrl, assetPath: node.posterPath, title: `${title} poster` } : null,
    ].filter(Boolean);
  }
  if (node.type === 'audio' && node.audioSrc) {
    return [{ kind: 'audio', src: node.assetPath || node.audioSrc, assetPath: node.assetPath, title }];
  }
  return [];
}

function summarizeNode(node) {
  if (!node) return null;
  const media = nodeMedia(node);
  const text = nodeText(node);
  const summary = {
    id: node.id,
    type: node.type,
    title: node.title || node.id,
  };
  if (text) summary.text = text;
  if (media.length) summary.media = media;
  if (node.type === 'script' && Array.isArray(node.shots)) summary.shots = node.shots;
  return summary;
}

function upstreamNodesFor(nodeId, nodes, edges) {
  if (!nodeId) return [];
  const byId = new Map((nodes || []).map((node) => [node.id, node]));
  return (edges || [])
    .filter((edge) => edge?.to === nodeId)
    .map((edge) => byId.get(edge.from))
    .filter(Boolean);
}

function normalizeModelPayload(payload) {
  const modelRecord = payload.modelRecord || (typeof payload.model === 'object' ? payload.model : null);
  const modelLabel = modelRecord
    ? modelRecord.displayName || modelRecord.modelName || modelRecord.id
    : payload.model;
  return {
    model: modelLabel,
    modelName: payload.modelName || modelRecord?.modelName,
    modelId: payload.modelId || modelRecord?.id,
    providerModelId: payload.providerModelId || modelRecord?.id,
    provider: payload.provider || modelRecord?.providerId,
  };
}

export function buildGenerationPayload({
  payload = {},
  nodeId,
  nodes = [],
  edges = [],
  projectId,
  capability,
} = {}) {
  const jobType = capability || capabilityForGeneration(payload);
  const tab = normalizeGenerationTab(payload.tab || jobType);
  const targetNode = (nodes || []).find((node) => node.id === nodeId) || null;
  const upstreamNodes = upstreamNodesFor(nodeId, nodes, edges);
  const inputNodes = upstreamNodes.map(summarizeNode).filter(Boolean);
  const targetInput = summarizeNode(targetNode);
  const upstreamMedia = upstreamNodes.flatMap(nodeMedia);
  const mediaRefs = (Array.isArray(payload.referenceAssets) ? payload.referenceAssets : [])
    .filter(isMediaAsset)
    .map(toMediaReference);
  const activeSeedancePortraitAssetKeys = seedancePortraitAssetKeySet([
    ...listValues(payload.seedancePortraitAssets),
    ...listValues(payload.seedance_portrait_assets),
  ]);

  const mediaImages = [
    ...upstreamMedia
      .filter((item) => item.kind === 'image')
      .filter((item) => !isSeedancePortraitMediaReference(item, activeSeedancePortraitAssetKeys))
      .map(referenceSource),
    ...mediaRefs.filter((item) => getMediaKind(item) === 'image').map(referenceSource),
    ...(Array.isArray(payload.referenceImages) ? payload.referenceImages : []),
  ];
  const mediaVideos = [
    ...upstreamMedia.filter((item) => item.kind === 'video').map(referenceSource),
    ...mediaRefs.filter((item) => getMediaKind(item) === 'video').map(referenceSource),
    ...(Array.isArray(payload.referenceVideos) ? payload.referenceVideos : []),
  ];
  const mediaAudios = [
    ...upstreamMedia.filter((item) => item.kind === 'audio').map(referenceSource),
    ...mediaRefs.filter((item) => getMediaKind(item) === 'audio').map(referenceSource),
    ...(Array.isArray(payload.referenceAudios) ? payload.referenceAudios : []),
  ];

  const inputText = [
    ...upstreamNodes.map(nodeText),
    compactString(payload.inputText),
  ].filter(Boolean).join('\n\n');
  const referenceImages = uniqueStrings(mediaImages);
  const referenceVideos = uniqueStrings(mediaVideos);
  const referenceAudios = uniqueStrings(mediaAudios);
  const modelPayload = normalizeModelPayload(payload);

  return {
    ...payload,
    ...modelPayload,
    type: jobType,
    capability: jobType,
    tab,
    nodeId,
    projectId,
    prompt: compactString(payload.prompt),
    title: payload.title || targetNode?.title,
    params: {
      ratio: payload.ratio,
      aspectRatio: payload.aspectRatio || payload.ratio,
      resolution: payload.resolution,
      duration: payload.duration,
      durationSeconds: payload.durationSeconds || payload.duration,
      seedanceMode: payload.seedanceMode || payload.seedance_mode,
      seedance_mode: payload.seedance_mode || payload.seedanceMode,
      audioOn: payload.audioOn,
      count: payload.count,
      style: payload.style,
      styleId: payload.styleId || payload.style,
      styleName: payload.styleName,
      stylePrompt: payload.stylePrompt,
      stylePreset: payload.stylePreset,
      audioStyle: payload.audioStyle,
      mode: payload.mode,
    },
    inputs: {
      nodes: inputNodes,
      target: targetInput,
      text: inputText,
      referenceImages,
      referenceVideos,
      referenceAudios,
      references: mediaRefs.map((asset) => ({
        id: asset.id,
        kind: getMediaKind(asset),
        src: getMediaSrc(asset),
        title: getMediaTitle(asset),
        token: asset.token,
      })),
    },
    inputNodes,
    inputText,
    referenceImages,
    referenceVideos,
    referenceAudios,
    startFrameUrl: payload.startFrameUrl || referenceImages[0],
    sourceVideoUrl: payload.sourceVideoUrl || referenceVideos[0],
    sourceAudioUrl: payload.sourceAudioUrl || referenceAudios[0],
    aspectRatio: payload.aspectRatio || payload.ratio,
    durationSeconds: payload.durationSeconds || payload.duration,
  };
}
