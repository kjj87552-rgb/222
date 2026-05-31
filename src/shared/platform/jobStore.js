import { LIBAI_PROJECT_ID } from './nodeRegistry.js';
import { ProjectStore } from './projectStore.js';
import { backendApi, getBackendBaseUrl } from './backendClient.js';

function backendBaseUrl() {
  return getBackendBaseUrl();
}

function wsUrl(httpUrl, path) {
  return httpUrl.replace(/^http/, 'ws') + path;
}

function queryString(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const text = params.toString();
  return text ? `?${text}` : '';
}

async function httpApi(method, path, body) {
  return backendApi(method, path, body);
}

async function listFromProjectSnapshot(query = {}) {
  const projectId = query.projectId || query.project_id || LIBAI_PROJECT_ID;
  if (!ProjectStore.available()) return { jobs: [] };
  const snapshot = await ProjectStore.open(projectId);
  let jobs = Array.isArray(snapshot?.jobs) ? snapshot.jobs : [];
  const kind = String(query.kind || '').toLowerCase();
  if (kind === 'image' || kind === 'video') {
    jobs = jobs.filter((job) => {
      const type = String(job?.type || job?.input?.type || job?.input?.tab || '').toLowerCase();
      return kind === 'image'
        ? type.includes('image') || type.includes('upscale')
        : type.includes('video');
    });
  }
  const limit = Number(query.limit);
  if (Number.isFinite(limit) && limit > 0) jobs = jobs.slice(0, Math.min(200, Math.floor(limit)));
  return { jobs };
}

function electronJobBridge() {
  if (typeof window === 'undefined') return null;
  return window.libai?.job || null;
}

export const JobStore = {
  available() {
    return Boolean(electronJobBridge()) || typeof fetch === 'function';
  },
  async list(query = {}) {
    const bridge = electronJobBridge();
    const projectId = query.projectId || query.project_id || LIBAI_PROJECT_ID;
    if (projectId && ProjectStore.available()) {
      try {
        return await listFromProjectSnapshot({ ...query, projectId });
      } catch {
        /* Fall through to the dedicated jobs endpoint. */
      }
    }
    const path = `/jobs${queryString({
      project_id: projectId,
      kind: query.kind,
      limit: query.limit,
    })}`;
    if (bridge?.list) {
      try {
        return await bridge.list(query);
      } catch (error) {
        return listFromProjectSnapshot(query).catch(() => { throw error; });
      }
    }
    try {
      return await httpApi('GET', path);
    } catch (error) {
      return listFromProjectSnapshot(query).catch(() => { throw error; });
    }
  },
  async create(nodeId, payload = {}) {
    const body = { projectId: payload.projectId || LIBAI_PROJECT_ID, ...payload };
    const bridge = electronJobBridge();
    if (bridge?.create) return bridge.create(nodeId, body);
    return httpApi('POST', '/jobs', {
      project_id: body.projectId || body.project_id || LIBAI_PROJECT_ID,
      node_id: nodeId,
      type: body.type || body.provider || body.tab || 'image.generate',
      payload: body,
    });
  },
  async get(jobId) {
    const bridge = electronJobBridge();
    if (bridge?.get) return bridge.get(jobId);
    return httpApi('GET', `/jobs/${encodeURIComponent(jobId)}`);
  },
  async cancel(jobId) {
    const bridge = electronJobBridge();
    if (bridge?.cancel) return bridge.cancel(jobId);
    return httpApi('POST', `/jobs/${encodeURIComponent(jobId)}/cancel`);
  },
  onEvent(callback) {
    const bridge = electronJobBridge();
    if (bridge?.onEvent) return bridge.onEvent(callback);
    if (typeof WebSocket === 'undefined') return () => {};
    let closed = false;
    let socket = null;
    try {
      socket = new WebSocket(wsUrl(backendBaseUrl(), '/jobs/events'));
      socket.onmessage = (event) => {
        try {
          callback(JSON.parse(event.data));
        } catch {
          callback({ type: 'raw', data: event.data });
        }
      };
      socket.onerror = () => {};
    } catch {
      return () => {};
    }
    return () => {
      closed = true;
      if (socket && !closed) socket.close();
      else if (socket) socket.close();
    };
  },
};
