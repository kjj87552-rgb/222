export const HISTORY_GENERATED_ACTIONS = new Set([
  'asset.job-output',
  'asset.upscale',
  'job.generate',
  'job.output',
]);

export const HISTORY_GENERATED_SOURCE_MARKERS = [
  'generated',
  'provider',
  'newapi',
  'job.output',
  'job.upscale',
  'job.remote',
  'preview',
];

export function historyKindOf(item) {
  const explicit = String(item?.kind || item?.mediaKind || item?.type || '').toLowerCase();
  if (['image', 'video', 'audio', 'text'].includes(explicit)) return explicit;
  const jobType = String(item?.jobType || item?.actionType || item?.input?.type || item?.type || '').toLowerCase();
  if (jobType.includes('video')) return 'video';
  if (jobType.includes('audio')) return 'audio';
  if (jobType.includes('text') || jobType.includes('reason') || jobType.includes('inference')) return 'text';
  const src = historyMediaSrc(item).toLowerCase();
  if (src.startsWith('data:image/') || /\.(png|jpe?g|webp|gif|avif|bmp|svg)(?:$|\?)/.test(src)) return 'image';
  if (src.startsWith('data:video/') || /\.(mp4|mov|webm|mkv|avi|m4v)(?:$|\?)/.test(src)) return 'video';
  if (src.startsWith('data:audio/') || /\.(mp3|wav|m4a|flac|ogg|aac)(?:$|\?)/.test(src)) return 'audio';
  return 'image';
}

export function historyMediaSrc(item) {
  return item?.src || item?.url || item?.assetUrl || item?.imageUrl || item?.videoUrl || item?.posterUrl || '';
}

export function historyProjectId(item) {
  return String(
    item?.projectId
    || item?.project_id
    || item?.meta?.projectId
    || item?.meta?.project_id
    || item?.metadata?.projectId
    || item?.metadata?.project_id
    || ''
  );
}

export function historyIdentity(item) {
  const jobId = item?.jobId || item?.remoteTaskId;
  if (jobId) return `job:${jobId}`;
  const assetId = item?.assetId || item?.targetId;
  if (assetId) return `asset:${assetId}`;
  return `id:${item?.id || historyMediaSrc(item) || Math.random().toString(36).slice(2)}`;
}

export function normalizeHistoryStatus(status) {
  const raw = String(status || '').toLowerCase();
  if (raw === 'queued' || raw === 'running' || raw === 'processing' || raw === 'generating') return 'generating';
  if (raw === 'success' || raw === 'completed') return 'completed';
  if (raw === 'cancelled') return 'canceled';
  if (raw === 'error') return 'failed';
  return raw || 'completed';
}

export function isGeneratedHistoryRecord(item) {
  if (!item) return false;
  const action = String(item.action || '').toLowerCase();
  if (HISTORY_GENERATED_ACTIONS.has(action)) return true;
  const source = String(item.source || item.provider || '').toLowerCase();
  if (HISTORY_GENERATED_SOURCE_MARKERS.some((marker) => source.includes(marker))) return true;
  const status = normalizeHistoryStatus(item.status);
  return Boolean(item.jobId && ['generating', 'completed', 'failed', 'canceled'].includes(status));
}

export function mergeHistoryRecords(a, b) {
  const first = a || {};
  const second = b || {};
  const firstSrc = historyMediaSrc(first);
  const secondSrc = historyMediaSrc(second);
  const preferred = secondSrc && !firstSrc ? second : first;
  const fallback = preferred === first ? second : first;
  const historyIds = Array.from(new Set([
    ...(Array.isArray(first.historyIds) ? first.historyIds : []),
    ...(Array.isArray(second.historyIds) ? second.historyIds : []),
    first.id,
    second.id,
  ].filter(Boolean)));
  return {
    ...fallback,
    ...preferred,
    historyIds,
    status: normalizeHistoryStatus(preferred.status || fallback.status),
    progress: Math.max(Number(fallback.progress) || 0, Number(preferred.progress) || 0),
    src: historyMediaSrc(preferred) || historyMediaSrc(fallback),
  };
}

export function normalizeHistoryCollection(items) {
  const byKey = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item !== 'object') continue;
    const normalized = {
      ...item,
      historyIds: Array.isArray(item.historyIds) ? item.historyIds : [item.id].filter(Boolean),
      kind: historyKindOf(item),
      status: normalizeHistoryStatus(item.status),
      src: historyMediaSrc(item),
    };
    const key = historyIdentity(normalized);
    byKey.set(key, byKey.has(key) ? mergeHistoryRecords(byKey.get(key), normalized) : normalized);
  }
  return Array.from(byKey.values()).sort((a, b) => {
    const at = Date.parse(a?.updatedAt || a?.createdAt || a?.time || '') || 0;
    const bt = Date.parse(b?.updatedAt || b?.createdAt || b?.time || '') || 0;
    return bt - at;
  });
}

export function isHistoryInProject(item, projectId) {
  if (!projectId) return false;
  const itemProjectId = historyProjectId(item);
  return itemProjectId === String(projectId);
}
