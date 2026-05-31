import { backendApi } from './backendClient.js';

export const PromptStore = {
  async list(query = {}) {
    if (!window.libai?.prompt?.list) {
      if (typeof fetch !== 'function') return { prompts: [] };
      const params = new URLSearchParams();
      Object.entries(query || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
      });
      const suffix = params.toString() ? `?${params}` : '';
      return backendApi('GET', `/prompts${suffix}`);
    }
    return window.libai.prompt.list(query);
  },
  async create(prompt) {
    if (!window.libai?.prompt?.create) {
      if (typeof fetch !== 'function') return null;
      return backendApi('POST', '/prompts', prompt);
    }
    return window.libai.prompt.create(prompt);
  },
  async update(promptId, patch) {
    if (!window.libai?.prompt?.update) {
      if (typeof fetch !== 'function') return null;
      return backendApi('PUT', `/prompts/${encodeURIComponent(promptId)}`, patch);
    }
    return window.libai.prompt.update(promptId, patch);
  },
  async delete(promptId) {
    if (!window.libai?.prompt?.delete) {
      if (typeof fetch !== 'function') return null;
      return backendApi('DELETE', `/prompts/${encodeURIComponent(promptId)}`);
    }
    return window.libai.prompt.delete(promptId);
  },
};
