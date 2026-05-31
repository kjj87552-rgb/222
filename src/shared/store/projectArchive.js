import { readProjectPayloadForArchive, saveImportedProjectPayload, prepareProjectImportTarget } from './persistence.js';
import { AssetStore } from '../platform/assetStore.js';
import { getBackendBaseUrl } from '../platform/backendClient.js';
import { makeProjectId } from '../utils/asset.js';
import { safeFileName } from '../utils/file.js';

export const PROJECT_ARCHIVE_FORMAT = 'libai.project.archive.v1';

const ASSET_URL_RE = /(?:https?:\/\/[^/\s"']+)?\/assets\/([A-Za-z0-9_-]+)/g;
const ASSET_ID_KEYS = /(^|_|\b)(assetid|asset_id|sourceassetid|outputassetid|coverassetid|posterassetid)(\b|$)/i;
const NODE_ID_KEYS = /(^|_|\b)(nodeid|node_id|canvasnodeid|canvasnodeids|linkedcanvasnodeids|sourcenodeid|targetnodeid|imagenodeid|videonodeid|scriptnodeid)(\b|$)/i;
const EDGE_ID_KEYS = /(^|_|\b)(edgeid|edge_id)(\b|$)/i;
const ASSET_EMBED_TIMEOUT_MS = 12000;

function isAssetIdKey(key) {
  const value = String(key || '').toLowerCase();
  return ASSET_ID_KEYS.test(value) || value.includes('assetid') || value.includes('asset_id');
}

function isNodeIdKey(key) {
  const value = String(key || '').toLowerCase();
  return NODE_ID_KEYS.test(value) || value.includes('nodeid') || value.includes('node_id') || value.includes('canvasnode');
}

function isEdgeIdKey(key) {
  const value = String(key || '').toLowerCase();
  return EDGE_ID_KEYS.test(value) || value.includes('edgeid') || value.includes('edge_id');
}

function cloneData(value) {
  if (value == null) return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function defaultImportId(kind, oldId = '') {
  const safe = String(oldId || kind)
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32) || kind;
  return `${kind}_${Date.now().toString(36)}_${safe}_${Math.random().toString(36).slice(2, 6)}`;
}

function mapFrom(value) {
  if (value instanceof Map) return new Map(value);
  return new Map(Object.entries(value || {}));
}

function collectIds(items = []) {
  return Array.from(new Set((items || []).map((item) => item?.id).filter(Boolean)));
}

function collectAssetUrls(value, urlsById) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(ASSET_URL_RE)) {
      const assetId = match[1];
      if (!assetId) continue;
      const set = urlsById.get(assetId) || new Set();
      set.add(match[0]);
      urlsById.set(assetId, set);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectAssetUrls(item, urlsById));
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.values(value).forEach((item) => collectAssetUrls(item, urlsById));
}

function collectArchiveAssetReferences(payload = {}) {
  const urlsById = new Map();
  collectAssetUrls(payload, urlsById);
  (payload.assets || []).forEach((asset) => {
    const assetId = asset?.id || asset?.assetId || asset?.asset_id;
    if (!assetId) return;
    const set = urlsById.get(assetId) || new Set();
    [asset.src, asset.url, asset.assetUrl, asset.path].filter(Boolean).forEach((url) => {
      if (
        typeof url === 'string'
        && (/^https?:\/\//i.test(url) || url.startsWith('/assets/') || url.startsWith('data:'))
      ) set.add(url);
    });
    urlsById.set(assetId, set);
  });
  return urlsById;
}

function extensionFromMime(mime = '', fallback = '') {
  const value = String(mime || '').toLowerCase();
  if (value.includes('png')) return '.png';
  if (value.includes('webp')) return '.webp';
  if (value.includes('gif')) return '.gif';
  if (value.includes('jpeg') || value.includes('jpg')) return '.jpg';
  if (value.includes('mp4')) return '.mp4';
  if (value.includes('quicktime')) return '.mov';
  if (value.includes('webm')) return '.webm';
  if (value.includes('mpeg')) return '.mp3';
  if (value.includes('wav')) return '.wav';
  return fallback || '.bin';
}

function filenameForAsset(asset = {}, fallbackId = 'asset') {
  const title = asset.filename || asset.title || asset.name || fallbackId;
  const current = safeFileName(title, fallbackId);
  if (/\.[A-Za-z0-9]{2,8}$/.test(current)) return current;
  return `${current}${extensionFromMime(asset.mime, '')}`;
}

function assetFetchUrl(assetId, urls = []) {
  const base = getBackendBaseUrl();
  const candidates = Array.from(urls || []).filter(Boolean);
  const direct = candidates.find((url) => /^https?:\/\//i.test(url));
  if (direct) return direct;
  const relative = candidates.find((url) => String(url).startsWith('/assets/'));
  if (relative) return `${base}${relative}`;
  return `${base}/assets/${encodeURIComponent(assetId)}`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('读取素材失败'));
    reader.readAsDataURL(blob);
  });
}

async function fetchAssetWithTimeout(url, timeoutMs = ASSET_EMBED_TIMEOUT_MS) {
  if (typeof AbortController === 'undefined') return fetch(url);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`素材读取超时（${Math.round(timeoutMs / 1000)} 秒）`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function embedAsset(assetId, asset, urls) {
  const sourceUrl = assetFetchUrl(assetId, urls);
  const response = await fetchAssetWithTimeout(sourceUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const mime = asset?.mime || blob.type || 'application/octet-stream';
  return {
    id: assetId,
    kind: asset?.kind || (mime.startsWith('video/') ? 'video' : mime.startsWith('audio/') ? 'audio' : 'image'),
    mime,
    filename: filenameForAsset({ ...asset, mime }, assetId),
    libraryAsset: Boolean(asset?.id || asset?.assetId || asset?.asset_id),
    originalUrls: Array.from(urls || []),
    meta: {
      ...(asset || {}),
      id: undefined,
      projectId: undefined,
      project_id: undefined,
      path: undefined,
      src: undefined,
      url: undefined,
      assetUrl: undefined,
    },
    dataUrl: await blobToDataUrl(blob),
  };
}

export async function buildProjectArchive(projectId) {
  const payload = await readProjectPayloadForArchive(projectId);
  const assetById = new Map((payload.assets || []).map((asset) => [asset?.id || asset?.assetId || asset?.asset_id, asset]));
  const references = collectArchiveAssetReferences(payload);
  const embeddedAssets = [];
  const warnings = [];

  for (const [assetId, urls] of references.entries()) {
    if (!assetId) continue;
    try {
      embeddedAssets.push(await embedAsset(assetId, assetById.get(assetId) || {}, urls));
    } catch (error) {
      warnings.push({
        assetId,
        message: error instanceof Error ? error.message : String(error || '素材打包失败'),
      });
    }
  }

  return {
    format: PROJECT_ARCHIVE_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    sourceProjectId: payload.project?.id || projectId || '',
    project: cloneData(payload.project || {}),
    payload: cloneData(payload),
    embeddedAssets,
    warnings,
  };
}

function rewriteAssetUrl(value, assetUrlMap, assetIdMap) {
  if (assetUrlMap.has(value)) return assetUrlMap.get(value);
  return String(value).replace(ASSET_URL_RE, (match, assetId) => {
    if (assetUrlMap.has(match)) return assetUrlMap.get(match);
    if (assetUrlMap.has(`/assets/${assetId}`)) return assetUrlMap.get(`/assets/${assetId}`);
    if (assetIdMap.has(assetId) && match.startsWith('/assets/')) return `/assets/${assetIdMap.get(assetId)}`;
    return match;
  });
}

function rewriteValue(value, maps, key = '') {
  if (typeof value === 'string') {
    const lowerKey = String(key || '').toLowerCase();
    if (isAssetIdKey(lowerKey) && maps.assetIdMap.has(value)) return maps.assetIdMap.get(value);
    if (isNodeIdKey(lowerKey) && maps.nodeIdMap.has(value)) return maps.nodeIdMap.get(value);
    if (isEdgeIdKey(lowerKey) && maps.edgeIdMap.has(value)) return maps.edgeIdMap.get(value);
    return rewriteAssetUrl(value, maps.assetUrlMap, maps.assetIdMap);
  }
  if (Array.isArray(value)) return value.map((item) => rewriteValue(item, maps, key));
  if (!value || typeof value !== 'object') return value;

  const next = {};
  Object.entries(value).forEach(([entryKey, entryValue]) => {
    if (entryKey === 'projectId' || entryKey === 'project_id') {
      next[entryKey] = maps.projectId;
      return;
    }
    next[entryKey] = rewriteValue(entryValue, maps, entryKey);
  });
  return next;
}

function remapAssetRecords(assets, maps) {
  return (assets || []).map((asset) => {
    const oldId = asset?.id || asset?.assetId || asset?.asset_id;
    const rewritten = rewriteValue(asset, maps);
    const restored = oldId ? maps.assetRecordMap.get(oldId) : null;
    const nextId = oldId && maps.assetIdMap.has(oldId) ? maps.assetIdMap.get(oldId) : rewritten.id;
    const restoredUrl = restored?.assetUrl || restored?.url || restored?.src;
    return {
      ...rewritten,
      ...(restored ? {
        kind: restored.kind || rewritten.kind,
        path: restored.path || rewritten.path,
        thumbPath: restored.thumbPath ?? rewritten.thumbPath,
        mime: restored.mime || rewritten.mime,
        size: restored.size ?? rewritten.size,
        src: restoredUrl || rewritten.src,
        url: restoredUrl || rewritten.url,
        assetUrl: restoredUrl || rewritten.assetUrl,
      } : {}),
      id: nextId,
      assetId: rewritten.assetId && maps.assetIdMap.has(rewritten.assetId) ? maps.assetIdMap.get(rewritten.assetId) : (rewritten.assetId || nextId),
      projectId: maps.projectId,
      project_id: maps.projectId,
    };
  });
}

function remapHistoryRecords(history, maps, idFactory) {
  return (history || []).map((item) => {
    const oldId = item?.id || `hist_${Math.random().toString(36).slice(2, 8)}`;
    const rewritten = rewriteValue(item, maps);
    return {
      ...rewritten,
      id: idFactory('history', oldId),
      projectId: maps.projectId,
      project_id: maps.projectId,
    };
  });
}

export function remapProjectPayloadForImport(payload = {}, options = {}) {
  const now = options.now || new Date().toISOString();
  const idFactory = options.idFactory || defaultImportId;
  const sourceProject = payload.project || {};
  const projectId = options.projectId || makeProjectId(sourceProject.name || 'imported-project');
  const nodeIdMap = mapFrom(options.nodeIdMap);
  const edgeIdMap = mapFrom(options.edgeIdMap);
  const assetIdMap = mapFrom(options.assetIdMap);
  const assetUrlMap = mapFrom(options.assetUrlMap);
  const assetRecordMap = mapFrom(options.assetRecordMap);

  collectIds(payload.nodes).forEach((id) => {
    if (!nodeIdMap.has(id)) nodeIdMap.set(id, idFactory('node', id));
  });
  collectIds(payload.edges).forEach((id) => {
    if (!edgeIdMap.has(id)) edgeIdMap.set(id, idFactory('edge', id));
  });
  collectIds(payload.assets).forEach((id) => {
    if (!assetIdMap.has(id)) assetIdMap.set(id, idFactory('asset', id));
  });

  const maps = { projectId, nodeIdMap, edgeIdMap, assetIdMap, assetUrlMap, assetRecordMap };
  const nodes = (payload.nodes || []).map((node) => ({
    ...rewriteValue(node, maps),
    id: nodeIdMap.get(node.id) || idFactory('node', node.id),
  }));
  const edges = (payload.edges || []).map((edge) => ({
    ...rewriteValue(edge, maps),
    id: edgeIdMap.get(edge.id) || idFactory('edge', edge.id),
    from: nodeIdMap.get(edge.from) || edge.from,
    to: nodeIdMap.get(edge.to) || edge.to,
  }));

  return {
    project: {
      ...sourceProject,
      id: projectId,
      name: options.name || sourceProject.name || '未命名项目',
      createdAt: now,
      updatedAt: now,
    },
    nodes,
    edges,
    assets: remapAssetRecords(payload.assets || [], maps),
    history: remapHistoryRecords(payload.history || [], maps, idFactory),
    designSpacePackage: payload.designSpacePackage
      ? rewriteValue(payload.designSpacePackage, maps)
      : null,
  };
}

async function restoreEmbeddedAssets(embeddedAssets = [], projectId) {
  const assetIdMap = new Map();
  const assetUrlMap = new Map();
  const assetRecordMap = new Map();
  const warnings = [];

  if (!embeddedAssets.length) return { assetIdMap, assetUrlMap, warnings };
  await prepareProjectImportTarget(projectId, '导入项目');

  for (const asset of embeddedAssets) {
    try {
      if (!AssetStore.writeAvailable()) throw new Error('当前环境不支持写入素材文件');
      const libraryAsset = asset.libraryAsset === true
        || asset.meta?.inLibrary === true
        || asset.meta?.libraryAsset === true;
      const record = await AssetStore.writeDataUrl(projectId, {
        filename: asset.filename || filenameForAsset(asset, asset.id),
        dataUrl: asset.dataUrl,
        kind: asset.kind,
        mime: asset.mime,
        meta: {
          ...(asset.meta || {}),
          source: 'project-import',
          importedFromAssetId: asset.id,
          inLibrary: libraryAsset,
          libraryAsset,
        },
      });
      const nextId = record?.id || record?.assetId || record?.asset_id;
      const nextUrl = record?.assetUrl || record?.url || record?.src || (nextId ? `/assets/${nextId}` : '');
      if (!nextId || !nextUrl) throw new Error('素材写入后缺少资产 ID');
      assetIdMap.set(asset.id, nextId);
      assetRecordMap.set(asset.id, record);
      assetUrlMap.set(`/assets/${asset.id}`, nextUrl);
      (asset.originalUrls || []).forEach((url) => assetUrlMap.set(url, nextUrl));
    } catch (error) {
      warnings.push({
        assetId: asset.id,
        message: error instanceof Error ? error.message : String(error || '素材恢复失败'),
      });
    }
  }

  return { assetIdMap, assetUrlMap, assetRecordMap, warnings };
}

export async function importProjectArchive(archive) {
  const source = archive?.format === PROJECT_ARCHIVE_FORMAT ? archive : { payload: archive };
  const payload = source.payload || archive;
  const projectName = payload?.project?.name || source.project?.name || '未命名项目';
  const projectId = makeProjectId(projectName);
  const restored = await restoreEmbeddedAssets(source.embeddedAssets || [], projectId);
  const remapped = remapProjectPayloadForImport(payload, {
    projectId,
    name: projectName,
    assetIdMap: restored.assetIdMap,
    assetUrlMap: restored.assetUrlMap,
    assetRecordMap: restored.assetRecordMap,
  });
  const saved = await saveImportedProjectPayload(remapped);
  return {
    ...saved,
    warnings: [...(source.warnings || []), ...restored.warnings],
  };
}

export async function readProjectArchiveFile(file) {
  if (!file) throw new Error('请选择要导入的项目文件');
  const text = await file.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('项目文件不是有效 JSON');
  }
}
