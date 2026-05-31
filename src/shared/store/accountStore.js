import { createStore } from './createStore.js';
import { NewApiStore } from '../platform/newApiStore.js';
import { RMB_SYMBOL } from '../utils/currency.js';

const initial = {
  loading: false,
  connected: false,
  user: null,         // { username, group, quota, usedQuota, ... }
  account: null,      // raw payload from /newapi/account
  error: null,
  lastFetched: 0,
};

export const accountStore = createStore(initial);
let accountRefreshGeneration = 0;

export const useAccount        = () => accountStore.useSelector((s) => s.account);
export const useAccountUser    = () => accountStore.useSelector((s) => s.user);
export const useAccountQuota   = () => accountStore.useSelector((s) => Number(s.user?.quota) || 0);
export const useAccountUsed    = () => accountStore.useSelector((s) => Number(s.user?.usedQuota) || 0);
export const useAccountConnected = () => accountStore.useSelector((s) => s.connected);
export const useAccountLoading = () => accountStore.useSelector((s) => s.loading);

export const accountActions = {
  async refresh() {
    const refreshGeneration = accountRefreshGeneration + 1;
    accountRefreshGeneration = refreshGeneration;
    accountStore.setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await NewApiStore.account();
      const account = result?.account || null;
      const user = result?.user || account?.user || account?.meta?.user || null;
      if (accountRefreshGeneration !== refreshGeneration) return null;
      accountStore.setState((s) => ({
        ...s,
        loading: false,
        connected: Boolean(account?.hasAccessToken),
        user: user || null,
        account: account || null,
        error: null,
        lastFetched: Date.now(),
      }));
      return { account, user };
    } catch (error) {
      if (accountRefreshGeneration !== refreshGeneration) return null;
      accountStore.setState((s) => ({
        ...s,
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      }));
      return null;
    }
  },

  reset() {
    accountRefreshGeneration += 1;
    accountStore.setState(initial);
  },
};

// ─── helpers for display ───
export function formatQuota(value) {
  const quota = Number(value) || 0;
  const dollars = quota / 500000;
  return `${quota.toLocaleString()} / ${RMB_SYMBOL}${dollars.toFixed(2)}`;
}

export function formatQuotaShort(value) {
  const quota = Number(value) || 0;
  if (quota >= 100_000) return `${(quota / 1000).toFixed(1)}k`;
  return quota.toLocaleString();
}

export function formatQuotaMoney(value) {
  const quota = Number(value) || 0;
  const dollars = quota / 500000;
  if (quota > 0 && dollars < 0.01) return `${RMB_SYMBOL}${dollars.toFixed(4)}`;
  return `${RMB_SYMBOL}${dollars.toFixed(2)}`;
}
