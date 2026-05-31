const LOCAL_BACKEND_BASE_URL = 'http://127.0.0.1:8765';

function cleanBaseUrl(value) {
  return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
}

function envBackendBaseUrl() {
  try {
    return cleanBaseUrl(import.meta.env?.VITE_LIBAI_API_BASE_URL);
  } catch {
    return '';
  }
}

function rememberBackendBaseUrl(runtime) {
  const backendBaseUrl = cleanBaseUrl(runtime?.backendBaseUrl);
  if (typeof window !== 'undefined' && backendBaseUrl) {
    window.__LIBAI_BACKEND_BASE_URL__ = backendBaseUrl;
  }
  return runtime;
}

export function getBackendBaseUrl() {
  if (typeof window === 'undefined') return envBackendBaseUrl() || LOCAL_BACKEND_BASE_URL;
  return cleanBaseUrl(window.__LIBAI_BACKEND_BASE_URL__) || envBackendBaseUrl() || LOCAL_BACKEND_BASE_URL;
}

export async function getBackendRuntime() {
  if (typeof window === 'undefined') {
    return { backendBaseUrl: LOCAL_BACKEND_BASE_URL, transport: 'http' };
  }
  if (window.libai?.system?.getRuntime) {
    return Promise.resolve(window.libai.system.getRuntime()).then(rememberBackendBaseUrl);
  }
  return rememberBackendBaseUrl({
    backendBaseUrl: getBackendBaseUrl(),
    transport: 'http',
    platform: 'browser',
    packaged: false,
  });
}

export async function backendHealth() {
  if (typeof fetch !== 'function') return false;
  try {
    const response = await fetch(`${getBackendBaseUrl()}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

export async function backendApi(method, path, body) {
  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { detail: text };
    }
  }
  if (!response.ok) {
    const detail = payload?.detail || payload?.message || `HTTP ${response.status}`;
    const error = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload || {};
}

function parseDesktopAnnouncementEvent(event) {
  try {
    return JSON.parse(event.data);
  } catch {
    return { type: 'raw', data: event.data };
  }
}

function subscribeDesktopAnnouncementEvents(callback, baseUrl = getBackendBaseUrl()) {
  if (typeof callback !== 'function') return () => {};
  if (typeof window === 'undefined' || typeof EventSource !== 'function') return () => {};

  const source = new EventSource(`${baseUrl}/desktop-announcements/events`);
  const handleEvent = (event) => callback(parseDesktopAnnouncementEvent(event));
  source.onopen = () => callback({ type: 'desktop.announcement.connected' });
  source.onmessage = handleEvent;
  source.addEventListener('desktop-announcement', handleEvent);
  source.onerror = () => callback({ type: 'desktop.announcement.connection-error' });

  return () => source.close();
}

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isElectronRenderer() {
  return typeof window !== 'undefined' && Boolean(window.libai);
}

function isLocalFilePath(value) {
  const text = compactString(value);
  if (!text || /^(https?:|data:|blob:|libai-asset:|file:)/i.test(text)) return false;
  if (/^[A-Za-z]:[\\/]/.test(text)) return true;
  if (/^\\\\/.test(text)) return true;
  if (text.startsWith('/') && !text.startsWith('/assets/') && !text.startsWith('/newapi/')) return true;
  return false;
}

function encodeLocalAssetPath(filePath) {
  const normalized = compactString(filePath).replace(/\\/g, '/');
  if (!normalized) return '';
  const encoded = normalized
    .split('/')
    .map((segment, index) => {
      if (!segment) return segment;
      if (index === 0 && /^[A-Za-z]:$/.test(segment)) return segment;
      return encodeURIComponent(segment);
    })
    .join('/');
  if (normalized.startsWith('//')) return `libai-asset://${encoded}`;
  if (/^[A-Za-z]:\//.test(normalized)) return `libai-asset:///${encoded}`;
  if (normalized.startsWith('/')) return `libai-asset://${encoded}`;
  return `libai-asset:///${encoded}`;
}

function localAssetUrl(asset) {
  if (!isElectronRenderer()) return '';
  const candidates = [
    asset?.assetPath,
    asset?.localPath,
    asset?.path,
    asset?.src,
    asset?.url,
    asset?.assetUrl,
  ];
  const path = candidates.find(isLocalFilePath);
  return path ? encodeLocalAssetPath(path) : '';
}

export const JianyingApi = {
  settings() {
    if (typeof window !== 'undefined' && window.libai?.jianying?.settings) {
      return window.libai.jianying.settings();
    }
    return backendApi('GET', '/jianying/settings');
  },
  saveSettings(path) {
    if (typeof window !== 'undefined' && window.libai?.jianying?.saveSettings) {
      return window.libai.jianying.saveSettings({ path });
    }
    return backendApi('POST', '/jianying/settings', { path });
  },
  autoDetect() {
    if (typeof window !== 'undefined' && window.libai?.jianying?.autoDetect) {
      return window.libai.jianying.autoDetect();
    }
    return backendApi('POST', '/jianying/drafts-root/auto');
  },
  exportDraft(body) {
    if (typeof window !== 'undefined' && window.libai?.jianying?.exportDraft) {
      return window.libai.jianying.exportDraft(body);
    }
    return backendApi('POST', '/jianying/export', body);
  },
};

export const DesktopAnnouncementApi = {
  list() {
    if (typeof window !== 'undefined' && window.libai?.announcement?.list) {
      return window.libai.announcement.list();
    }
    return backendApi('GET', '/desktop-announcements');
  },
  onEvent(callback) {
    if (typeof window !== 'undefined' && window.libai?.announcement?.onEvent) {
      return window.libai.announcement.onEvent(callback);
    }
    return subscribeDesktopAnnouncementEvents(callback);
  },
};

export function makeAssetUrl(asset, backendBaseUrl = getBackendBaseUrl()) {
  if (!asset) return '';
  if (asset.preferLocalAsset) {
    const localUrl = localAssetUrl(asset);
    if (localUrl) return localUrl;
  }
  const existing = compactString(asset.src) || compactString(asset.url) || compactString(asset.assetUrl);
  if (isLocalFilePath(existing)) {
    const localUrl = localAssetUrl({ src: existing });
    if (localUrl) return localUrl;
  }
  const baseUrl = backendBaseUrl || getBackendBaseUrl();
  if (existing && /^https?:/i.test(existing)) {
    try {
      const parsed = new URL(existing);
      const host = parsed.hostname.toLowerCase();
      if ((host === '127.0.0.1' || host === 'localhost') && parsed.pathname.startsWith('/assets/')) {
        return `${baseUrl}${parsed.pathname}${parsed.search || ''}`;
      }
    } catch {
      return existing;
    }
    return existing;
  }
  if (existing && /^(data:|blob:|libai-asset:)/i.test(existing)) return existing;
  if (baseUrl && existing && (existing.startsWith('/assets/') || existing.startsWith('/newapi/') || existing.startsWith('/seedance/'))) {
    return `${baseUrl}${existing}`;
  }
  const assetId = compactString(asset.assetId) || compactString(asset.id);
  if (baseUrl && assetId) return `${baseUrl}/assets/${encodeURIComponent(assetId)}`;
  return existing || '';
}
