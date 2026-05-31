import { LIBAI_PROJECT_ID } from './nodeRegistry.js';
import { backendApi } from './backendClient.js';

function electronHistoryBridge() {
  if (typeof window === 'undefined') return null;
  return window.libai?.history || null;
}

export const HistoryStore = {
  available() {
    return Boolean(electronHistoryBridge()) || typeof fetch === 'function';
  },
  async list(projectId = LIBAI_PROJECT_ID, query = {}) {
    const bridge = electronHistoryBridge();
    if (bridge?.list) return bridge.list(projectId, query);
    const params = new URLSearchParams();
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    const suffix = params.toString() ? `?${params}` : '';
    return backendApi('GET', `/history/project/${encodeURIComponent(projectId)}${suffix}`);
  },
  async delete(historyId) {
    if (!historyId) return { ok: false };
    const bridge = electronHistoryBridge();
    if (bridge?.delete) return bridge.delete(historyId);
    return backendApi('DELETE', `/history/${encodeURIComponent(historyId)}`);
  },
  async clearProject(projectId = LIBAI_PROJECT_ID, query = {}) {
    const bridge = electronHistoryBridge();
    if (bridge?.clearProject) return bridge.clearProject(projectId, query);
    const params = new URLSearchParams();
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    const suffix = params.toString() ? `?${params}` : '';
    return backendApi('DELETE', `/history/project/${encodeURIComponent(projectId)}${suffix}`);
  },
};
