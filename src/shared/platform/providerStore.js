import { backendApi } from './backendClient.js';

const FALLBACK_PROVIDER_DATA = {
  providers: [
    {
      id: 'newapi',
      name: '漫创AI 中转站',
      baseUrl: 'http://103.207.68.225:3000',
      authType: 'bearer',
      enabled: false,
      capabilities: ['text.generate', 'image.analyze', 'image.generate', 'video.generate'],
      hasApiKey: false,
    },
  ],
  models: [],
};

const modelResultCache = new Map();
const modelRequestCache = new Map();

function modelQueryKey(query = {}) {
  return JSON.stringify(
    Object.entries(query || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

function clearModelCaches() {
  modelResultCache.clear();
  modelRequestCache.clear();
}

async function loadModels(query = {}) {
  if (!window.libai?.provider?.models) {
    if (typeof fetch === 'function') {
      try {
        const params = new URLSearchParams();
        Object.entries(query || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
        });
        const suffix = params.toString() ? `?${params}` : '';
        return { result: await backendApi('GET', `/provider-models${suffix}`), cacheable: true };
      } catch {
        // fall through to static fallback below
      }
    }
    const models = FALLBACK_PROVIDER_DATA.models.filter((model) => {
      if (query.provider_id && model.providerId !== query.provider_id) return false;
      if (query.capability && model.capability !== query.capability) return false;
      return true;
    });
    return { result: { models }, cacheable: false };
  }
  return { result: await window.libai.provider.models(query), cacheable: true };
}

export const ProviderStore = {
  clearModelCache() {
    clearModelCaches();
  },
  async list() {
    if (!window.libai?.provider?.list) {
      if (typeof fetch === 'function') {
        try {
          return await backendApi('GET', '/providers');
        } catch {
          return FALLBACK_PROVIDER_DATA;
        }
      }
      return FALLBACK_PROVIDER_DATA;
    }
    return window.libai.provider.list();
  },
  async update(providerId, patch = {}) {
    if (!window.libai?.provider?.update) {
      if (typeof fetch === 'function') return backendApi('PUT', `/providers/${encodeURIComponent(providerId)}`, patch);
      throw new Error('需要连接本地后端后保存配置');
    }
    return window.libai.provider.update(providerId, patch);
  },
  async test(providerId) {
    if (!window.libai?.provider?.test) {
      if (typeof fetch === 'function') return backendApi('POST', `/providers/${encodeURIComponent(providerId)}/test`);
      return { ok: false, message: '需要连接本地后端后测试' };
    }
    return window.libai.provider.test(providerId);
  },
  async models(query = {}) {
    const key = modelQueryKey(query);
    if (modelResultCache.has(key)) return modelResultCache.get(key);
    if (modelRequestCache.has(key)) return modelRequestCache.get(key);
    const request = loadModels(query)
      .then(({ result, cacheable }) => {
        if (cacheable) modelResultCache.set(key, result);
        return result;
      })
      .finally(() => {
        modelRequestCache.delete(key);
      });
    modelRequestCache.set(key, request);
    return request;
  },
  async updateModel(modelId, patch = {}) {
    let result;
    if (!window.libai?.provider?.updateModel) {
      if (typeof fetch === 'function') result = await backendApi('PUT', `/provider-models/${encodeURIComponent(modelId)}`, patch);
      else throw new Error('需要连接本地后端后修改模型');
    } else {
      result = await window.libai.provider.updateModel(modelId, patch);
    }
    clearModelCaches();
    return result;
  },
  async createModel(body = {}) {
    let result;
    if (!window.libai?.provider?.createModel) {
      if (typeof fetch === 'function') result = await backendApi('POST', '/provider-models', body);
      else throw new Error('需要连接本地后端后添加模型');
    } else {
      result = await window.libai.provider.createModel(body);
    }
    clearModelCaches();
    return result;
  },
  async deleteModel(modelId) {
    let result;
    if (!window.libai?.provider?.deleteModel) {
      if (typeof fetch === 'function') result = await backendApi('DELETE', `/provider-models/${encodeURIComponent(modelId)}`);
      else throw new Error('需要连接本地后端后删除模型');
    } else {
      result = await window.libai.provider.deleteModel(modelId);
    }
    clearModelCaches();
    return result;
  },
};
