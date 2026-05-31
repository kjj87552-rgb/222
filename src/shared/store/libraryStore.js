import { createStore } from './createStore.js';
import { canvasStore } from './canvasStore.js';
import { getNodeAssetPayload, makeAssetRecord, makeHistoryRecord } from '../utils/asset.js';
import { isAssetLibraryItem, withGlobalAssetScope, withLibraryFlag, withProjectAssetScope } from '../utils/assetScopes.js';
import { isVisualKind, makeVisualTaxonomyMeta } from '../utils/assetTaxonomy.js';
import {
  historyKindOf,
  historyMediaSrc,
  isGeneratedHistoryRecord,
  normalizeHistoryCollection,
  normalizeHistoryStatus,
} from '../utils/history.js';

export const libraryStore = createStore({ assets: [], history: [] });

export const useAssets  = () => libraryStore.useSelector((s) => s.assets);
export const useHistory = () => libraryStore.useSelector((s) => s.history);

function isGeneratedHistoryAsset(asset) {
  const kind = historyKindOf(asset);
  if (kind !== 'image' && kind !== 'video' && kind !== 'audio' && kind !== 'text') return false;
  return isGeneratedHistoryRecord(asset);
}

function jobKind(job) {
  const output = job?.output || {};
  const input = job?.input || {};
  const type = String(output.assetKind || job?.type || input.type || '').toLowerCase();
  if (type.includes('video')) return 'video';
  if (type.includes('audio')) return 'audio';
  if (type.includes('text') || type.includes('reason') || type.includes('inference')) return 'text';
  return 'image';
}

function jobMediaSrc(job, patch = {}) {
  const output = job?.output || {};
  return patch.src
    || patch.url
    || output.url
    || output.assetUrl
    || output.urls?.[0]
    || output.posterUrl
    || '';
}

function makeJobHistoryRecord(job, patch = {}) {
  const input = job?.input || {};
  const output = job?.output || {};
  const now = new Date().toISOString();
  const kind = patch.kind || jobKind(job);
  const src = jobMediaSrc(job, patch);
  const status = normalizeHistoryStatus(patch.status || job?.status);
  return {
    id: patch.id || `hist_${job?.id || Date.now().toString(36)}`,
    jobId: job?.id,
    targetId: job?.id,
    action: patch.action || 'job.generate',
    kind,
    type: kind,
    status,
    progress: status === 'completed' ? 100 : Math.max(0, Math.min(100, Number(patch.progress ?? job?.progress) || 0)),
    src,
    url: src,
    assetId: patch.assetId || output.assetId,
    assetPath: patch.assetPath || output.assetPath,
    nodeId: job?.nodeId || input.nodeId || patch.nodeId,
    title: patch.title || output.title || `${kind === 'video' ? '视频' : kind === 'audio' ? '音频' : kind === 'text' ? '文本' : '图片'}生成`,
    prompt: patch.prompt ?? input.prompt ?? '',
    model: patch.model || output.displayName || output.providerModelName || input.model || input.modelName || '',
    modelName: patch.modelName || output.providerModelName || input.modelName || '',
    provider: patch.provider || output.provider || input.provider || '',
    source: patch.source || output.asset?.source || output.provider || 'job.output',
    errorMsg: patch.errorMsg || job?.error || output.error || output.message || '',
    projectId: patch.projectId || job?.projectId || job?.project_id || input.projectId || input.project_id || canvasStore.getState().projectId,
    project_id: patch.project_id || patch.projectId || job?.projectId || job?.project_id || input.projectId || input.project_id || canvasStore.getState().projectId,
    createdAt: patch.createdAt || job?.createdAt || now,
    updatedAt: patch.updatedAt || job?.updatedAt || now,
    time: new Date(patch.updatedAt || job?.updatedAt || now).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(/\//g, "-"),
  };
}

function isInFlightJobHistory(job, patch = {}) {
  if (normalizeHistoryStatus(patch.status || job?.status) !== 'generating') return false;
  return !jobMediaSrc(job, patch);
}

export const libraryActions = {
  setAssets:  (u) => libraryStore.setState((s) => ({
    ...s, assets:  typeof u === 'function' ? u(s.assets)  : u,
  })),
  setHistory: (u) => libraryStore.setState((s) => ({
    ...s, history: normalizeHistoryCollection(typeof u === 'function' ? u(s.history) : u),
  })),

  addAssets: (clean) => libraryStore.setState((s) => ({
    ...s, assets: [...clean, ...s.assets].slice(0, 160),
  })),

  updateAssetMetadata: (target, patch) => {
    if (!target || !patch) return;
    const key = target.id || target.src || target.url;
    if (!key) return;
    libraryStore.setState((s) => {
      let found = false;
      const assets = s.assets.map((asset) => {
        const assetKey = asset.id || asset.src || asset.url;
        if (assetKey !== key) return asset;
        found = true;
        return { ...asset, ...patch, updatedAt: new Date().toISOString() };
      });
      if (!found) {
        assets.unshift({
          ...target,
          id: target.id || `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          src: target.src || target.url,
          ...patch,
          updatedAt: new Date().toISOString(),
        });
      }
      return { ...s, assets: assets.slice(0, 160) };
    });
  },

  removeAsset: (target) => {
    if (!target) return;
    const key = target.id || target.src || target.url;
    if (!key) return;
    libraryStore.setState((s) => ({
      ...s,
      assets: s.assets.filter((asset) => {
        const assetKey = asset.id || asset.src || asset.url;
        return assetKey !== key;
      }),
      history: s.history.filter((item) => item.assetId !== target.id && item.src !== target.src && item.src !== target.url),
    }));
  },

  upsertHistory: (record) => {
    if (!record) return;
    libraryStore.setState((s) => ({
      ...s,
      history: normalizeHistoryCollection([record, ...s.history]).slice(0, 180),
    }));
  },

  removeHistoryItem: (target) => {
    const id = typeof target === 'string' ? target : target?.id;
    if (!id) return;
    libraryStore.setState((s) => ({
      ...s,
      history: s.history.filter((item) => item.id !== id),
    }));
  },

  removeHistoryItems: (ids) => {
    const idSet = new Set(Array.from(ids || []).filter(Boolean));
    if (!idSet.size) return;
    libraryStore.setState((s) => ({
      ...s,
      history: s.history.filter((item) => {
        if (idSet.has(item.id)) return false;
        return !(Array.isArray(item.historyIds) && item.historyIds.some((id) => idSet.has(id)));
      }),
    }));
  },

  recordJobHistory: (job, patch = {}) => {
    if (!job?.id) return;
    if (isInFlightJobHistory(job, patch)) return;
    libraryActions.upsertHistory(makeJobHistoryRecord(job, patch));
  },

  recordAssets: (records) => {
    const clean = records
      .filter((r) => r && historyMediaSrc(r))
      .map((r) => {
        const src = historyMediaSrc(r);
        return { ...r, src, url: r.url || src };
      });
    if (!clean.length) return;
    const generated = clean.filter(isGeneratedHistoryAsset);
    const libraryAssets = clean.filter(isAssetLibraryItem);
    if (!generated.length && !libraryAssets.length) return;
    libraryStore.setState((s) => ({
      ...s,
      assets:  [...libraryAssets, ...s.assets].slice(0, 160),
      history: normalizeHistoryCollection([...generated.map(makeHistoryRecord), ...s.history]).slice(0, 180),
    }));
  },

  saveNodeToAssets: (node, options = {}) => {
    const asset = getNodeAssetPayload(node);
    if (!asset) return;
    const scope = options.scope === 'global' ? 'global' : 'project';
    const persisted = options.persistedAsset || options.savedAsset || null;
    const kind = persisted?.kind || asset.kind;
    const src = persisted?.src || persisted?.url || persisted?.assetUrl || asset.src;
    const title = persisted?.title || asset.title;
    const taxonomy = isVisualKind(kind)
      ? makeVisualTaxonomyMeta({ styleTag: options.styleTag, assetType: options.assetType })
      : {};
    const record = makeAssetRecord({
      kind,
      src,
      title,
      nodeId: node.id,
      source: persisted?.source || `canvas.save.${scope}`,
      prompt: node.prompt,
      assetId: persisted?.id || node.assetId || node.asset_id || asset.assetId,
      assetPath: persisted?.path || persisted?.assetPath || node.assetPath,
      ...taxonomy,
    });
    const merged = {
      ...record,
      ...(persisted || {}),
      id: persisted?.id || record.id,
      kind,
      src,
      url: persisted?.url || persisted?.src || src,
      title,
      source: persisted?.source || record.source,
      prompt: node.prompt,
      nodeId: node.id,
      ...taxonomy,
      meta: {
        ...(persisted?.meta || {}),
        ...taxonomy,
        source: persisted?.source || record.source,
        sourceNodeId: node.id,
      },
    };
    const scoped = scope === 'global'
      ? withGlobalAssetScope(merged)
      : withProjectAssetScope(merged, options.projectId || canvasStore.getState().projectId);
    const finalRecord = withLibraryFlag(scoped);
    libraryActions.recordAssets([finalRecord]);
    return finalRecord;
  },

  saveNodeToGlobalAssets: (node) => {
    return libraryActions.saveNodeToAssets(node, { scope: 'global' });
  },
};
