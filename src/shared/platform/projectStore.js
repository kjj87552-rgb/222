import { LIBAI_PROJECT_ID } from './nodeRegistry.js';
import { backendApi, getBackendRuntime } from './backendClient.js';

/* Async project store — bridges to backend via Electron preload (window.libai).
 * Distinct from the reactive `canvasStore` in shared/store/.
 * This one talks to disk + sqlite (backend), the other holds in-memory React state.
 */
export const ProjectStore = {
  available() {
    return typeof window !== 'undefined' && (Boolean(window.libai?.project) || typeof fetch === 'function');
  },
  async runtime() {
    if (typeof window === 'undefined') return null;
    return getBackendRuntime();
  },
  async create(name = "未命名", id = LIBAI_PROJECT_ID) {
    if (!this.available()) return null;
    if (window.libai?.project?.create) return window.libai.project.create(name, id);
    return backendApi('POST', '/projects', { name, id });
  },
  async list() {
    if (!this.available()) return { projects: [] };
    if (window.libai?.project?.list) return window.libai.project.list();
    return backendApi('GET', '/projects');
  },
  async open(projectId = LIBAI_PROJECT_ID) {
    if (!this.available()) return null;
    try {
      const loaded = window.libai?.project?.open
        ? await window.libai.project.open(projectId)
        : await backendApi('GET', `/projects/${encodeURIComponent(projectId)}`);
      if (loaded?.error === "not_found" || loaded?.status === 404) return null;
      return loaded;
    } catch (error) {
      if (error?.status === 404 || String(error?.message || error).includes("404") || String(error?.message || error).includes("Project not found")) return null;
      throw error;
    }
  },
  async saveGraph(projectId = LIBAI_PROJECT_ID, snapshot) {
    if (!this.available()) return null;
    if (window.libai?.project?.saveGraph) return window.libai.project.saveGraph(projectId, snapshot);
    return backendApi('PUT', `/projects/${encodeURIComponent(projectId)}/graph`, snapshot);
  },
  async patchGraph(projectId = LIBAI_PROJECT_ID, patch = {}) {
    if (!this.available()) return null;
    if (window.libai?.project?.patchGraph) return window.libai.project.patchGraph(projectId, patch);
    return backendApi('PATCH', `/projects/${encodeURIComponent(projectId)}/graph`, patch);
  },
  async saveNode(projectId = LIBAI_PROJECT_ID, node = {}) {
    if (!this.available() || !node?.id) return null;
    if (window.libai?.project?.saveNode) return window.libai.project.saveNode(projectId, node);
    return backendApi('PUT', `/projects/${encodeURIComponent(projectId)}/nodes/${encodeURIComponent(node.id)}`, { node });
  },
  async saveLibrary(projectId = LIBAI_PROJECT_ID, library = {}) {
    if (!this.available()) return null;
    if (window.libai?.project?.saveLibrary) return window.libai.project.saveLibrary(projectId, library);
    return backendApi('PUT', `/projects/${encodeURIComponent(projectId)}/library`, library);
  },
  async delete(projectId = LIBAI_PROJECT_ID) {
    if (!this.available()) return null;
    if (window.libai?.project?.delete) return window.libai.project.delete(projectId);
    return backendApi('DELETE', `/projects/${encodeURIComponent(projectId)}`);
  },
  async storageSettings() {
    if (!this.available()) return null;
    if (window.libai?.project?.storageSettings) return window.libai.project.storageSettings();
    return backendApi('GET', '/settings/project-storage');
  },
  async setStoragePath(folderPath) {
    if (!this.available()) return null;
    if (window.libai?.project?.setStoragePath) return window.libai.project.setStoragePath(folderPath);
    return backendApi('POST', '/settings/project-storage', { path: folderPath });
  },
};
