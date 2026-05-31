import { createRequire } from 'node:module';
import { describe, expect, test, vi } from 'vitest';

const require = createRequire(import.meta.url);
const { createBackendRequester } = require('../../electron/backendRequest.cjs');

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('backend request proxy', () => {
  test('restarts the local backend and retries once after a transport fetch failure', async () => {
    const ensureBackendRunning = vi.fn()
      .mockResolvedValueOnce('http://127.0.0.1:50530')
      .mockResolvedValueOnce('http://127.0.0.1:50531');
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const backendRequest = createBackendRequester({
      getBackendBaseUrl: () => 'http://127.0.0.1:50530',
      ensureBackendRunning,
      fetchImpl,
    });

    await expect(backendRequest({ method: 'POST', path: '/newapi/register', body: { username: 'u' } }))
      .resolves.toEqual({ ok: true });

    expect(ensureBackendRunning).toHaveBeenCalledTimes(2);
    expect(ensureBackendRunning).toHaveBeenNthCalledWith(1, { restart: false });
    expect(ensureBackendRunning).toHaveBeenNthCalledWith(2, { restart: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[1][0]).toBe('http://127.0.0.1:50531/newapi/register');
  });

  test('throws a readable Chinese error if the local backend remains unreachable', async () => {
    const backendRequest = createBackendRequester({
      getBackendBaseUrl: () => 'http://127.0.0.1:50530',
      ensureBackendRunning: vi.fn().mockResolvedValue('http://127.0.0.1:50530'),
      fetchImpl: vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    });

    await expect(backendRequest({ method: 'GET', path: '/newapi/account' }))
      .rejects.toThrow('本地服务连接失败');
  });
});
