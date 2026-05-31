import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

function createDeferred() {
  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise,
  };
}

function loadPreload({ runtimePromise = Promise.resolve({ backendBaseUrl: 'http://127.0.0.1:8765' }) } = {}) {
  const preloadPath = resolve('electron/preload.cjs');
  const source = readFileSync(preloadPath, 'utf8');
  const exposed = {};
  const eventSources = [];
  const contextBridge = {
    exposeInMainWorld: vi.fn((name, value) => {
      exposed[name] = value;
    }),
  };
  const ipcRenderer = {
    invoke: vi.fn((channel) => {
      if (channel === 'libai:runtime') return runtimePromise;
      return Promise.resolve({});
    }),
    on: vi.fn(),
    removeListener: vi.fn(),
  };
  const webUtils = {
    getPathForFile: vi.fn(() => ''),
  };

  class FakeEventSource {
    constructor(url) {
      this.url = url;
      this.listeners = {};
      this.close = vi.fn();
      eventSources.push(this);
    }

    addEventListener(type, callback) {
      this.listeners[type] = callback;
    }
  }

  const sandbox = {
    require: (id) => {
      if (id === 'electron') {
        return { contextBridge, ipcRenderer, webUtils };
      }
      throw new Error(`Unexpected require: ${id}`);
    },
    module: { exports: {} },
    exports: {},
    URLSearchParams,
    EventSource: FakeEventSource,
    Promise,
  };

  vm.runInNewContext(source, sandbox, { filename: preloadPath });

  return {
    exposed,
    eventSources,
    ipcRenderer,
  };
}

describe('desktop announcement preload bridge', () => {
  it('does not create EventSource when cleanup runs before runtime resolves', async () => {
    const runtime = createDeferred();
    const { eventSources, exposed, ipcRenderer } = loadPreload({ runtimePromise: runtime.promise });

    const cleanup = exposed.libai.announcement.onEvent(vi.fn());
    cleanup();
    runtime.resolve({ backendBaseUrl: 'http://127.0.0.1:4567' });
    await Promise.resolve();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith('libai:runtime');
    expect(eventSources).toHaveLength(0);
  });

  it('closes EventSource when cleanup runs after runtime resolves', async () => {
    const { eventSources, exposed } = loadPreload();

    const cleanup = exposed.libai.announcement.onEvent(vi.fn());
    await Promise.resolve();

    expect(eventSources).toHaveLength(1);
    expect(eventSources[0].url).toBe('http://127.0.0.1:8765/desktop-announcements/events');

    cleanup();

    expect(eventSources[0].close).toHaveBeenCalledTimes(1);
  });

  it('reports connected when the announcement EventSource opens', async () => {
    const { eventSources, exposed } = loadPreload();
    const callback = vi.fn();

    exposed.libai.announcement.onEvent(callback);
    await Promise.resolve();
    eventSources[0].onopen?.({});

    expect(callback).toHaveBeenCalledWith({ type: 'desktop.announcement.connected' });
  });
});
