export const REMEMBER_LOGIN_DAYS = 14;
export const REMEMBER_LOGIN_STORAGE_KEY = 'libai:auth:remember-login';

const CURRENT_NEWAPI_BASE_URL = 'http://103.207.68.225:3000';
const LEGACY_NEWAPI_BASE_URLS = new Set([
  'http://210.16.166.38:3000',
  'https://210.16.166.38:3000',
  'http://69.30.252.146:3000',
  'https://69.30.252.146:3000',
  'http://69.30.252.146:8317',
  'https://69.30.252.146:8317',
  'http://api.yueying01.cn',
  'https://api.yueying01.cn',
]);
const DAY_MS = 24 * 60 * 60 * 1000;
const REMEMBER_LOGIN_TTL_MS = REMEMBER_LOGIN_DAYS * DAY_MS;
const STORAGE_VERSION = 1;

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
}

function clean(value) {
  return String(value || '').trim();
}

function normalizeBaseUrl(value) {
  const baseUrl = clean(value).replace(/\/+$/, '');
  return LEGACY_NEWAPI_BASE_URLS.has(baseUrl) ? CURRENT_NEWAPI_BASE_URL : baseUrl;
}

function emptyRememberedLogin() {
  return {
    remembered: false,
    expired: false,
    baseUrl: '',
    username: '',
    password: '',
    expiresAt: 0,
  };
}

function writeRecord(record) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(REMEMBER_LOGIN_STORAGE_KEY, JSON.stringify({
    version: STORAGE_VERSION,
    baseUrl: normalizeBaseUrl(record.baseUrl),
    username: clean(record.username),
    password: String(record.password || ''),
    expiresAt: Number(record.expiresAt) || 0,
  }));
}

function parseRecord() {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(REMEMBER_LOGIN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const record = JSON.parse(raw);
    if (!record || typeof record !== 'object') return null;
    return record;
  } catch {
    storage.removeItem(REMEMBER_LOGIN_STORAGE_KEY);
    return null;
  }
}

export function rememberLoginAccount({ baseUrl = '', username = '' } = {}) {
  const accountName = clean(username);
  const storage = getStorage();
  if (!storage) return;
  if (!accountName) {
    storage.removeItem(REMEMBER_LOGIN_STORAGE_KEY);
    return;
  }
  writeRecord({
    baseUrl,
    username: accountName,
    password: '',
    expiresAt: 0,
  });
}

export function rememberLoginCredentials({ baseUrl = '', username = '', password = '' } = {}, now = Date.now()) {
  const accountName = clean(username);
  if (!accountName || !password) {
    rememberLoginAccount({ baseUrl, username: accountName });
    return;
  }
  writeRecord({
    baseUrl,
    username: accountName,
    password,
    expiresAt: now + REMEMBER_LOGIN_TTL_MS,
  });
}

export function clearRememberedLogin() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(REMEMBER_LOGIN_STORAGE_KEY);
}

export function forgetRememberedPassword(now = Date.now()) {
  const remembered = getRememberedLogin(now);
  if (!remembered.username) {
    clearRememberedLogin();
    return;
  }
  rememberLoginAccount({
    baseUrl: remembered.baseUrl,
    username: remembered.username,
  });
}

export function getRememberedLogin(now = Date.now()) {
  const record = parseRecord();
  if (!record) return emptyRememberedLogin();

  const storedBaseUrl = clean(record.baseUrl);
  const baseUrl = normalizeBaseUrl(storedBaseUrl);
  const username = clean(record.username);
  const password = String(record.password || '');
  const expiresAt = Number(record.expiresAt) || 0;
  if (!username) {
    getStorage()?.removeItem(REMEMBER_LOGIN_STORAGE_KEY);
    return emptyRememberedLogin();
  }

  if (baseUrl !== storedBaseUrl) {
    writeRecord({ baseUrl, username, password, expiresAt });
  }

  if (password && expiresAt > now) {
    return {
      remembered: true,
      expired: false,
      baseUrl,
      username,
      password,
      expiresAt,
    };
  }

  const expired = Boolean(password || expiresAt);
  if (expired) {
    rememberLoginAccount({ baseUrl, username });
  }
  return {
    remembered: false,
    expired,
    baseUrl,
    username,
    password: '',
    expiresAt: 0,
  };
}
