import { LIBAI_PROJECT_ID } from './nodeRegistry.js';
import { backendApi, getBackendRuntime, makeAssetUrl } from './backendClient.js';

export const GLOBAL_ASSET_PROJECT_ID = 'global';

function assetUrl(asset, backendBaseUrl) {
  return makeAssetUrl(asset, backendBaseUrl || undefined);
}

async function runtime() {
  try {
    return await getBackendRuntime();
  } catch (error) {
    return null;
  }
}

export const AssetStore = {
  available() {
    return typeof window !== 'undefined'
      && Boolean(window.libai?.system?.pickFiles)
      && Boolean(window.libai?.asset?.importFile);
  },
  importAvailable() {
    return typeof window !== 'undefined'
      && Boolean(window.libai?.asset?.importFile);
  },
  writeAvailable() {
    return typeof window !== 'undefined'
      && (Boolean(window.libai?.asset?.writeDataUrl) || typeof fetch === 'function');
  },
  /* Folder browser is available iff Electron exposes pickFolder/listFolder. */
  folderApiAvailable() {
    return typeof window !== 'undefined'
      && Boolean(window.libai?.system?.pickFolder)
      && Boolean(window.libai?.system?.listFolder);
  },
  async pickAndImport(projectId = LIBAI_PROJECT_ID, options = {}) {
    if (!this.available()) return [];
    const filePaths = await window.libai.system.pickFiles(options);
    const rt = await runtime();
    const backendBaseUrl = rt?.backendBaseUrl || '';
    const importOptions = {
      copy: options.copy,
      deferCopy: options.deferCopy ?? options.defer_copy,
    };
    const imported = [];
    for (const filePath of filePaths) {
      const record = await window.libai.asset.importFile(filePath, projectId, options.kind, options.meta || {}, importOptions);
      const url = assetUrl(record, backendBaseUrl);
      imported.push(url ? { ...record, src: url, url } : record);
    }
    return imported;
  },

  async list(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    const result = (typeof window !== 'undefined' && window.libai?.asset?.list)
      ? await window.libai.asset.list(query)
      : await backendApi('GET', `/assets${params.toString() ? `?${params}` : ''}`);
    const rt = await runtime();
    const backendBaseUrl = rt?.backendBaseUrl || '';
    const assets = Array.isArray(result?.assets) ? result.assets : [];
    return {
      assets: assets.map((asset) => {
        const url = assetUrl(asset, backendBaseUrl);
        return url ? { ...asset, src: url, url } : asset;
      }),
    };
  },

  async delete(assetId) {
    if (!assetId) return { ok: false };
    if (typeof window !== 'undefined' && window.libai?.asset?.delete) {
      try {
        return await window.libai.asset.delete(assetId);
      } catch (error) {
        if (!/method not allowed|405/i.test(String(error?.message || error))) throw error;
      }
    }
    try {
      return await backendApi('DELETE', `/assets/${encodeURIComponent(assetId)}`);
    } catch (error) {
      if (!/method not allowed|405/i.test(String(error?.message || error))) throw error;
      return backendApi('POST', `/assets/${encodeURIComponent(assetId)}/delete`);
    }
  },

  async promote(assetId, meta = {}) {
    if (!assetId) return null;
    const record = (typeof window !== 'undefined' && window.libai?.asset?.promote)
      ? await window.libai.asset.promote(assetId, meta)
      : await backendApi('POST', `/assets/${encodeURIComponent(assetId)}/promote`, meta);
    const rt = await runtime();
    const url = assetUrl(record, rt?.backendBaseUrl || '');
    return url ? { ...record, src: url, url } : record;
  },

  /* Open native folder picker. Returns { path, name } | null. */
  async pickFolder() {
    if (!window.libai?.system?.pickFolder) return null;
    return window.libai.system.pickFolder();
  },

  /* List image / video / audio files in a folder.
   * Returns { path, name, files: [{ name, path, mime, kind, size, mtime, assetUrl }] }.
   * `assetUrl` is a libai-asset:// URL safe to use directly in <img>/<video> src. */
  async listFolder(folderPath) {
    if (!window.libai?.system?.listFolder) {
      throw new Error('listFolder unavailable — running outside Electron');
    }
    return window.libai.system.listFolder(folderPath);
  },

  /* Import one file by absolute path into the project's backend storage,
   * returning the persisted record with a stable URL. */
  async importFile(filePath, projectId = LIBAI_PROJECT_ID, kind, meta = {}, options = {}) {
    if (!window.libai?.asset?.importFile) return null;
    const record = await window.libai.asset.importFile(filePath, projectId, kind, meta, options);
    const rt = await runtime();
    const url = assetUrl(record, rt?.backendBaseUrl || '');
    return url ? { ...record, src: url, url } : record;
  },

  async writeDataUrl(projectId = LIBAI_PROJECT_ID, payload = {}) {
    if (!this.writeAvailable()) return null;
    const record = window.libai?.asset?.writeDataUrl
      ? await window.libai.asset.writeDataUrl(projectId, payload)
      : await backendApi('POST', '/assets/write', {
        project_id: projectId,
        filename: payload.filename || 'asset.png',
        data_url: payload.dataUrl || payload.data_url,
        kind: payload.kind,
        mime: payload.mime,
        meta: payload.meta || {},
      });
    const rt = await runtime();
    const url = assetUrl(record, rt?.backendBaseUrl || '');
    return url ? { ...record, src: url, url } : record;
  },
};
