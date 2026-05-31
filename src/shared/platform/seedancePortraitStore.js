import { getBackendBaseUrl } from './backendClient.js';

const STORAGE_KEY = 'libai.seedancePortraitAssets.v1';

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function responseDetail(payload, status) {
  const detail = payload?.detail || payload?.message || `HTTP ${status}`;
  return typeof detail === 'string' ? detail : JSON.stringify(detail);
}

function throwIfErrorPayload(payload) {
  if (!payload || typeof payload !== 'object') return;
  const status = Number(payload.status);
  if (!payload.error && !(Number.isFinite(status) && status >= 400)) return;
  const error = new Error(responseDetail(payload, Number.isFinite(status) ? status : 500));
  if (Number.isFinite(status)) error.status = status;
  error.payload = payload;
  throw error;
}

function optionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function backendRelativeUrl(value) {
  const text = optionalString(value);
  if (!text) return '';
  if (text.startsWith('/seedance/') || text.startsWith('/assets/') || text.startsWith('/newapi/')) {
    return `${getBackendBaseUrl()}${text}`;
  }
  return text;
}

async function refreshRuntimeBackendBaseUrl() {
  if (typeof window === 'undefined') return;
  const getRuntime = window.libai?.system?.getRuntime;
  if (typeof getRuntime !== 'function') return;
  try {
    const runtime = await getRuntime();
    const backendBaseUrl = optionalString(runtime?.backendBaseUrl);
    if (backendBaseUrl) window.__LIBAI_BACKEND_BASE_URL__ = backendBaseUrl.replace(/\/+$/, '');
  } catch {
    // Runtime discovery is best-effort; getBackendBaseUrl has a stable fallback.
  }
}

function cachedStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function uniqueAssets(...groups) {
  const seen = new Set();
  const merged = [];
  groups.flat().forEach((asset) => {
    try {
      const clean = normalizeAsset(asset);
      if (seen.has(clean.assetId)) return;
      seen.add(clean.assetId);
      merged.push(clean);
    } catch {
      // Ignore malformed cached rows.
    }
  });
  return merged;
}

function readCachedAssets() {
  const storage = cachedStorage();
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
    return uniqueAssets(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

function writeCachedAssets(assets) {
  const storage = cachedStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(uniqueAssets(assets)));
  } catch {
    // Cache writes are best-effort only.
  }
}

function desktopPortraitBridge() {
  if (typeof window === 'undefined') return null;
  return window.libai?.seedancePortrait || null;
}

function localFilePath(file) {
  if (typeof window === 'undefined') return '';
  const resolver = window.libai?.system?.filePath;
  if (typeof resolver !== 'function') return '';
  try {
    return optionalString(resolver(file));
  } catch {
    return '';
  }
}

function isLocalFilePath(value) {
  const text = optionalString(value);
  if (!text) return false;
  if (/^(https?:|data:|blob:|libai-asset:)/i.test(text)) return false;
  if (text.startsWith('/assets/')) return false;
  return /^[A-Za-z]:[\\/]/.test(text) || text.startsWith('\\\\') || text.startsWith('/');
}

function sourceTitle(source = {}, fallback = 'Seedence 角色图') {
  const name = optionalString(source.name)
    || optionalString(source.title)
    || optionalString(source.filename)
    || optionalString(source.fileName);
  return (name.replace(/\.[^./\\]+$/, '') || fallback).trim();
}

function sourceUrl(source = {}) {
  return optionalString(source.src)
    || optionalString(source.url)
    || optionalString(source.assetUrl)
    || optionalString(source.imageUrl)
    || optionalString(source.previewUrl);
}

function sourceLocalPath(source = {}) {
  return [
    source.filePath,
    source.assetPath,
    source.localPath,
    source.path,
    source.src,
  ].map(optionalString).find(isLocalFilePath) || '';
}

function extensionFromMime(mime) {
  const normalized = optionalString(mime).toLowerCase();
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
  if (normalized.includes('png')) return 'png';
  return '';
}

function extensionFromUrl(url) {
  const clean = optionalString(url).split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-z0-9]{2,5})$/i);
  return match?.[1]?.toLowerCase() || '';
}

function filenameForSource(source, blob) {
  const title = sourceTitle(source).replace(/[\\/:*?"<>|]+/g, '_');
  const ext = extensionFromUrl(sourceUrl(source)) || extensionFromMime(blob?.type) || 'png';
  return `${title || 'Seedence 角色图'}.${ext}`;
}

export function normalizeAsset(asset) {
  const assetId = optionalString(asset?.assetId) || optionalString(asset?.asset_id);
  if (!assetId) {
    throw new Error('上传成功但未返回素材 ID');
  }
  const assetRef = optionalString(asset?.assetRef) || optionalString(asset?.asset_ref) || `asset://${assetId}`;
  const localPreviewUrl = backendRelativeUrl(asset?.localPreviewUrl || asset?.local_preview_url);
  const previewUrl = backendRelativeUrl(asset?.previewUrl || asset?.preview_url) || localPreviewUrl;
  return {
    ...asset,
    assetId,
    asset_id: assetId,
    assetRef,
    asset_ref: assetRef,
    name: optionalString(asset?.name) || optionalString(asset?.title) || assetId,
    url: asset?.url || '',
    status: asset?.status || '',
    ...(localPreviewUrl ? { localPreviewUrl, local_preview_url: localPreviewUrl } : {}),
    ...(previewUrl ? { previewUrl, preview_url: previewUrl } : {}),
  };
}

export const SeedancePortraitStore = {
  listCached() {
    return { assets: readCachedAssets() };
  },

  async list() {
    const cached = readCachedAssets();
    const bridge = desktopPortraitBridge();
    if (typeof bridge?.list === 'function') {
      await refreshRuntimeBackendBaseUrl();
      const payload = await bridge.list();
      const assets = uniqueAssets(payload?.assets || payload?.data || []);
      writeCachedAssets(assets);
      return { assets };
    }
    const response = await fetch(`${getBackendBaseUrl()}/seedance/portrait-assets`);
    const payload = await parseResponse(response);
    if (!response.ok) {
      if (cached.length) return { assets: cached };
      const error = new Error(responseDetail(payload, response.status));
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    const assets = uniqueAssets(payload?.assets || payload?.data || []);
    writeCachedAssets(assets);
    return { assets };
  },

  async upload(file, options = {}) {
    if (!file) {
      throw new Error('请选择要上传的角色图片');
    }

    const form = new FormData();
    form.append('file', file);
    const name = optionalString(options.name);
    const description = optionalString(options.description);
    if (name) form.append('name', name);
    if (description) form.append('description', description);

    const bridge = desktopPortraitBridge();
    const filePath = localFilePath(file);
    if (filePath && typeof bridge?.uploadFilePath === 'function') {
      await refreshRuntimeBackendBaseUrl();
      const payload = await bridge.uploadFilePath(filePath, { name, description });
      throwIfErrorPayload(payload);
      const uploaded = normalizeAsset(payload?.asset || payload);
      writeCachedAssets(uniqueAssets([uploaded], readCachedAssets()));
      return uploaded;
    }

    const response = await fetch(`${getBackendBaseUrl()}/seedance/portrait-assets`, {
      method: 'POST',
      body: form,
    });
    const payload = await parseResponse(response);
    if (!response.ok) {
      const error = new Error(responseDetail(payload, response.status));
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    const uploaded = normalizeAsset(payload?.asset || payload);
    writeCachedAssets(uniqueAssets([uploaded], readCachedAssets()));
    return uploaded;
  },

  async uploadSource(source, options = {}) {
    const input = source && typeof source === 'object' ? source : { src: source };
    const name = optionalString(options.name) || sourceTitle(input);
    const description = optionalString(options.description);

    const bridge = desktopPortraitBridge();
    const filePath = sourceLocalPath(input);
    if (filePath && typeof bridge?.uploadFilePath === 'function') {
      const payload = await bridge.uploadFilePath(filePath, { name, description });
      throwIfErrorPayload(payload);
      const uploaded = normalizeAsset(payload?.asset || payload);
      writeCachedAssets(uniqueAssets([uploaded], readCachedAssets()));
      return uploaded;
    }

    const url = sourceUrl(input);
    if (!url) {
      throw new Error('当前图片没有可上传的来源');
    }
    if (typeof fetch !== 'function') {
      throw new Error('当前环境不支持读取图片来源');
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`读取图片失败：HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const file = new File([blob], filenameForSource(input, blob), {
      type: blob.type || 'image/png',
    });
    return this.upload(file, { name, description });
  },

  async delete(asset) {
    const assetId = optionalString(asset?.assetId) || optionalString(asset?.asset_id) || optionalString(asset);
    if (!assetId) {
      throw new Error('缺少素材 ID');
    }

    const bridge = desktopPortraitBridge();
    if (typeof bridge?.delete === 'function') {
      const payload = await bridge.delete(assetId);
      writeCachedAssets(readCachedAssets().filter((item) => item.assetId !== assetId));
      return {
        ...payload,
        deleted: payload?.deleted || assetId,
      };
    }

    const response = await fetch(`${getBackendBaseUrl()}/seedance/portrait-assets/${encodeURIComponent(assetId)}`, {
      method: 'DELETE',
    });
    const payload = await parseResponse(response);
    if (!response.ok) {
      const error = new Error(responseDetail(payload, response.status));
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    writeCachedAssets(readCachedAssets().filter((item) => item.assetId !== assetId));
    return {
      ...payload,
      deleted: payload?.deleted || assetId,
    };
  },
};
