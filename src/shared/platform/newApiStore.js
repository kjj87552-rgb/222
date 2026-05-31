import { backendApi, backendHealth, getBackendBaseUrl } from './backendClient.js';

function getNewApiBridge() {
  if (typeof window === 'undefined') return null;
  return window.libai?.newapi || null;
}

function getLocalBackendBaseUrl() {
  return getBackendBaseUrl();
}

async function httpApi(method, path, body) {
  return backendApi(method, path, body);
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

async function localBackendAvailable() {
  return backendHealth();
}

function getNewApiClient() {
  const bridge = getNewApiBridge();
  if (bridge) return bridge;
  return {
    account: () => httpApi('GET', '/newapi/account'),
    login: (body) => httpApi('POST', '/newapi/login', body),
    register: (body) => httpApi('POST', '/newapi/register', body),
    sendVerification: (body) => httpApi('POST', '/newapi/verification', body),
    logout: () => httpApi('POST', '/newapi/logout'),
    refresh: () => httpApi('POST', '/newapi/refresh'),
    models: () => httpApi('GET', '/newapi/models'),
    tokens: () => httpApi('GET', '/newapi/tokens'),
    consumption: (query = {}) => httpApi('GET', `/newapi/consumption${queryString(query)}`),
    usageLogs: (query = {}) => httpApi('GET', `/newapi/usage-logs${queryString(query)}`),
    createToken: (body) => httpApi('POST', '/newapi/tokens', body),
    setDefaultKey: (body) => httpApi('POST', '/newapi/default-key', body),
    setDefaultToken: (tokenId) => httpApi('POST', `/newapi/tokens/${encodeURIComponent(tokenId)}/default`),
    deleteToken: (tokenId) => httpApi('DELETE', `/newapi/tokens/${encodeURIComponent(tokenId)}`),
    redeem: (body) => httpApi('POST', '/newapi/redeem', body),
  };
}

async function requireConnectedClient() {
  const client = getNewApiClient();
  if (!getNewApiBridge() && !(await localBackendAvailable())) {
    throw new Error(`本地后端未连接：${getLocalBackendBaseUrl()}`);
  }
  return client;
}

export const NewApiStore = {
  available() {
    return Boolean(getNewApiBridge()?.account) || typeof fetch === 'function';
  },

  async account() {
    const bridge = getNewApiBridge();
    if (bridge?.account) {
      const result = await bridge.account();
      return {
        backendAvailable: true,
        transport: 'electron',
        ...result,
      };
    }
    if (!(await localBackendAvailable())) {
      return {
        connected: false,
        account: null,
        backendAvailable: false,
        transport: 'http',
        backendBaseUrl: getLocalBackendBaseUrl(),
      };
    }
    const result = await httpApi('GET', '/newapi/account');
    return {
      backendAvailable: true,
      transport: 'http',
      backendBaseUrl: getLocalBackendBaseUrl(),
      ...result,
    };
  },

  async login(body = {}) {
    return (await requireConnectedClient()).login(body);
  },

  async register(body = {}) {
    return (await requireConnectedClient()).register(body);
  },

  async sendVerification(body = {}) {
    return (await requireConnectedClient()).sendVerification(body);
  },

  async logout() {
    return (await requireConnectedClient()).logout();
  },

  async refresh() {
    return (await requireConnectedClient()).refresh();
  },

  async models() {
    return (await requireConnectedClient()).models();
  },

  async tokens() {
    return (await requireConnectedClient()).tokens();
  },

  async consumption(query = {}) {
    return (await requireConnectedClient()).consumption(query);
  },

  async usageLogs(query = {}) {
    return (await requireConnectedClient()).usageLogs(query);
  },

  async createToken(body = {}) {
    return (await requireConnectedClient()).createToken(body);
  },

  async setDefaultKey(body = {}) {
    return (await requireConnectedClient()).setDefaultKey(body);
  },

  async setDefaultToken(tokenId) {
    return (await requireConnectedClient()).setDefaultToken(tokenId);
  },

  async deleteToken(tokenId) {
    return (await requireConnectedClient()).deleteToken(tokenId);
  },

  async redeem(body = {}) {
    return (await requireConnectedClient()).redeem(body);
  },
};
