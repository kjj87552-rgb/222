import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

function createFakeUpdater() {
  const handlers = {};
  return {
    handlers,
    checkForUpdates: vi.fn().mockResolvedValue({}),
    quitAndInstall: vi.fn(),
    setFeedURL: vi.fn(),
    on: vi.fn((eventName, handler) => {
      handlers[eventName] = handler;
      return undefined;
    }),
  };
}

describe('electron auto update integration', () => {
  it('does not check for updates while running in development', () => {
    const { createAutoUpdateController } = require('../../electron/autoUpdate.cjs');
    const updater = createFakeUpdater();
    const schedule = vi.fn();

    const result = createAutoUpdateController({
      app: { isPackaged: false },
      autoUpdater: updater,
      dialog: {},
      schedule,
    }).start();

    expect(result).toEqual({ enabled: false, reason: 'development' });
    expect(schedule).not.toHaveBeenCalled();
    expect(updater.checkForUpdates).not.toHaveBeenCalled();
  });

  it('reports manual update checks as unavailable while running in development', async () => {
    const { createAutoUpdateController } = require('../../electron/autoUpdate.cjs');
    const updater = createFakeUpdater();
    const mainWindow = {
      webContents: {
        send: vi.fn(),
      },
    };
    const controller = createAutoUpdateController({
      app: { isPackaged: false },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      getMainWindow: () => mainWindow,
      schedule: vi.fn(),
    });

    controller.start();
    await expect(controller.checkNow({ manual: true })).resolves.toEqual({
      ok: false,
      reason: 'development',
    });

    expect(updater.checkForUpdates).not.toHaveBeenCalled();
    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      'libai:auto-update',
      expect.objectContaining({
        state: 'error',
        manual: true,
        message: expect.stringContaining('正式版'),
      }),
    );
  });

  it('checks for updates on unsigned packaged Windows builds', async () => {
    const { createAutoUpdateController, UPDATE_CHECK_DELAY_MS } = require('../../electron/autoUpdate.cjs');
    const updater = createFakeUpdater();
    let scheduledCheck = null;
    const schedule = vi.fn((callback, delay) => {
      scheduledCheck = { callback, delay };
      return 1;
    });

    const result = createAutoUpdateController({
      app: { isPackaged: true },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      schedule,
      platform: 'win32',
      packageMetadata: { build: { win: {} } },
      env: {},
    }).start();

    expect(result).toEqual({ enabled: true });
    expect(updater.autoDownload).toBe(true);
    expect(scheduledCheck.delay).toBe(UPDATE_CHECK_DELAY_MS);

    await scheduledCheck.callback();
    expect(updater.checkForUpdates).toHaveBeenCalledTimes(1);
  });

  it('schedules a signed packaged app update check with auto download enabled', async () => {
    const { createAutoUpdateController, UPDATE_CHECK_DELAY_MS } = require('../../electron/autoUpdate.cjs');
    const updater = createFakeUpdater();
    let scheduledCheck = null;
    const schedule = vi.fn((callback, delay) => {
      scheduledCheck = { callback, delay };
      return 1;
    });

    const result = createAutoUpdateController({
      app: { isPackaged: true },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      schedule,
      platform: 'win32',
      packageMetadata: { build: { win: { publisherName: 'Manchuang AI' } } },
    }).start();

    expect(result).toEqual({ enabled: true });
    expect(updater.autoDownload).toBe(true);
    expect(updater.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(updater.on).toHaveBeenCalledWith('update-downloaded', expect.any(Function));
    expect(scheduledCheck.delay).toBe(UPDATE_CHECK_DELAY_MS);

    await scheduledCheck.callback();
    expect(updater.checkForUpdates).toHaveBeenCalledTimes(1);
  });

  it('checks GitHub first and retries Rainyun when the GitHub update check fails', async () => {
    const { createAutoUpdateController } = require('../../electron/autoUpdate.cjs');
    const githubError = new Error('net::ERR_CONNECTION_TIMED_OUT at GitHubProvider.getLatestTagName');
    const updater = createFakeUpdater();
    updater.checkForUpdates
      .mockImplementationOnce(async () => {
        updater.handlers.error(githubError);
        throw githubError;
      })
      .mockResolvedValueOnce({});
    const mainWindow = {
      webContents: {
        send: vi.fn(),
      },
    };
    const logger = { warn: vi.fn(), info: vi.fn(), error: vi.fn() };
    const controller = createAutoUpdateController({
      app: { isPackaged: true },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      getMainWindow: () => mainWindow,
      schedule: vi.fn(),
      logger,
      platform: 'win32',
      packageMetadata: { build: { win: { publisherName: 'Manchuang AI' } } },
    });
    controller.start();

    await expect(controller.checkNow({ manual: true })).resolves.toEqual({ ok: true });

    expect(updater.setFeedURL).toHaveBeenNthCalledWith(1, {
      provider: 'github',
      owner: 'kjj87552-rgb',
      repo: '222',
    });
    expect(updater.setFeedURL).toHaveBeenNthCalledWith(2, {
      provider: 'generic',
      url: 'https://111.cn-nb1.rains3.com/libai-updates',
    });
    expect(updater.checkForUpdates).toHaveBeenCalledTimes(2);
    expect(mainWindow.webContents.send.mock.calls.map((call) => call[1]))
      .not.toContainEqual(expect.objectContaining({ state: 'error' }));
    expect(logger.warn).toHaveBeenCalledWith(
      'GitHub 更新检查失败，切换到雨云兜底',
      githubError,
    );
  });

  it('retries Rainyun when the GitHub download fails after an update is found', async () => {
    const { createAutoUpdateController } = require('../../electron/autoUpdate.cjs');
    const downloadError = new Error('net::ERR_CONNECTION_RESET https://github.com/kjj87552-rgb/222/releases/download/v0.19.5/libai-canvas-setup-0.19.5.exe');
    const updater = createFakeUpdater();
    updater.checkForUpdates.mockResolvedValue({});
    const mainWindow = {
      webContents: {
        send: vi.fn(),
      },
    };
    const logger = { warn: vi.fn(), info: vi.fn(), error: vi.fn() };
    const controller = createAutoUpdateController({
      app: { isPackaged: true },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      getMainWindow: () => mainWindow,
      schedule: vi.fn(),
      logger,
      platform: 'win32',
      packageMetadata: { build: { win: { publisherName: 'Manchuang AI' } } },
    });
    controller.start();
    await controller.checkNow({ manual: true });

    updater.handlers.error(downloadError);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(updater.setFeedURL).toHaveBeenNthCalledWith(1, {
      provider: 'github',
      owner: 'kjj87552-rgb',
      repo: '222',
    });
    expect(updater.setFeedURL).toHaveBeenNthCalledWith(2, {
      provider: 'generic',
      url: 'https://111.cn-nb1.rains3.com/libai-updates',
    });
    expect(updater.checkForUpdates).toHaveBeenCalledTimes(2);
    expect(mainWindow.webContents.send.mock.calls.map((call) => call[1]))
      .not.toContainEqual(expect.objectContaining({ state: 'error' }));
    expect(logger.warn).toHaveBeenCalledWith(
      'GitHub 更新检查失败，切换到雨云兜底',
      downloadError,
    );
  });

  it('sends update status events to the renderer and installs on request', async () => {
    const { createAutoUpdateController } = require('../../electron/autoUpdate.cjs');
    const updater = createFakeUpdater();
    const mainWindow = {
      webContents: {
        send: vi.fn(),
      },
    };

    const controller = createAutoUpdateController({
      app: { isPackaged: true },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      getMainWindow: () => mainWindow,
      schedule: vi.fn(),
      platform: 'win32',
      packageMetadata: { build: { win: { publisherName: 'Manchuang AI' } } },
    });
    controller.start();

    updater.handlers['update-available']({ version: '0.1.1' });
    updater.handlers['download-progress']({ percent: 42.4, transferred: 424, total: 1000 });
    updater.handlers['update-downloaded']({ version: '0.1.1' });

    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      'libai:auto-update',
      expect.objectContaining({
        state: 'available',
        version: '0.1.1',
      }),
    );
    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      'libai:auto-update',
      expect.objectContaining({
        state: 'downloading',
        percent: 42.4,
      }),
    );
    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      'libai:auto-update',
      expect.objectContaining({
        state: 'downloaded',
        version: '0.1.1',
      }),
    );

    expect(controller.install()).toEqual({ ok: true });
    expect(updater.quitAndInstall).toHaveBeenCalledWith(false, true);
  });

  it('allows the renderer to trigger an immediate update check', async () => {
    const { createAutoUpdateController } = require('../../electron/autoUpdate.cjs');
    const updater = createFakeUpdater();
    const mainWindow = {
      webContents: {
        send: vi.fn(),
      },
    };
    const controller = createAutoUpdateController({
      app: { isPackaged: true },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      getMainWindow: () => mainWindow,
      schedule: vi.fn(),
      platform: 'win32',
      packageMetadata: { build: { win: { publisherName: 'Manchuang AI' } } },
    });
    controller.start();

    await expect(controller.checkNow()).resolves.toEqual({ ok: true });

    expect(updater.checkForUpdates).toHaveBeenCalledTimes(1);
    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      'libai:auto-update',
      expect.objectContaining({ state: 'checking' }),
    );
  });

  it('marks a manual no-update result so the renderer can show completion feedback', async () => {
    const { createAutoUpdateController } = require('../../electron/autoUpdate.cjs');
    const updater = createFakeUpdater();
    const mainWindow = {
      webContents: {
        send: vi.fn(),
      },
    };
    updater.checkForUpdates.mockImplementation(async () => {
      updater.handlers['update-not-available']({ version: '0.12.0' });
      return {};
    });
    const controller = createAutoUpdateController({
      app: { isPackaged: true },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      getMainWindow: () => mainWindow,
      schedule: vi.fn(),
      platform: 'win32',
      packageMetadata: { build: { win: { publisherName: 'Manchuang AI' } } },
    });
    controller.start();

    await expect(controller.checkNow({ manual: true })).resolves.toEqual({ ok: true });

    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      'libai:auto-update',
      expect.objectContaining({
        state: 'not-available',
        manual: true,
        version: '0.12.0',
      }),
    );
  });

  it('marks manual update check failures and hides raw provider details', async () => {
    const { createAutoUpdateController } = require('../../electron/autoUpdate.cjs');
    const rawError = new Error([
      'net::ERR_CONNECTION_TIMED_OUT',
      'at GitHubProvider.getLatestTagName (D:\\Man Chuan AI\\resources\\app.asar\\node_modules\\electron-updater\\out\\providers\\GitHubProvider.js:162:55)',
      '<?xml version="1.0" encoding="UTF-8"?><feed><entry><title>v0.12.0</title></entry></feed>',
    ].join('\n'));
    const fallbackError = new Error('net::ERR_CONNECTION_REFUSED https://111.cn-nb1.rains3.com/libai-updates/latest.yml');
    const updater = createFakeUpdater();
    updater.checkForUpdates
      .mockImplementationOnce(async () => {
        updater.handlers.error(rawError);
        throw rawError;
      })
      .mockImplementationOnce(async () => {
        updater.handlers.error(fallbackError);
        throw fallbackError;
      });
    const mainWindow = {
      webContents: {
        send: vi.fn(),
      },
    };
    const controller = createAutoUpdateController({
      app: { isPackaged: true },
      autoUpdater: updater,
      dialog: { showMessageBox: vi.fn() },
      getMainWindow: () => mainWindow,
      schedule: vi.fn(),
      logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
      platform: 'win32',
      packageMetadata: { build: { win: { publisherName: 'Manchuang AI' } } },
    });
    controller.start();

    await expect(controller.checkNow({ manual: true })).resolves.toEqual(expect.objectContaining({
      ok: false,
      reason: 'check-failed',
    }));

    const errorEvent = mainWindow.webContents.send.mock.calls
      .map((call) => call[1])
      .find((payload) => payload?.state === 'error');
    expect(errorEvent).toEqual(expect.objectContaining({
      manual: true,
      message: expect.stringContaining('更新服务'),
    }));
    expect(errorEvent.message).not.toContain('GitHub 更新服务');
    expect(errorEvent.message).not.toContain('GitHubProvider.getLatestTagName');
    expect(errorEvent.message).not.toContain('<?xml');
    expect(updater.checkForUpdates).toHaveBeenCalledTimes(2);
  });

  it('publishes Windows update metadata to GitHub Releases by default', () => {
    expect(packageJson.version).toBe('0.19.7');
    expect(packageJson.dependencies).toHaveProperty('electron-updater');
    expect(packageJson.build.win).toEqual(expect.objectContaining({
      verifyUpdateCodeSignature: false,
    }));
    expect(JSON.stringify(packageJson.build.win)).not.toContain('publisherName');
    expect(packageJson.build.publish).toEqual([
      {
        provider: 'github',
        owner: 'kjj87552-rgb',
        repo: '222',
      },
    ]);
  });

  it('falls back to the Rainyun releases manifest when GitHub history is unavailable by default', async () => {
    const { fetchUpdateHistory } = require('../../electron/autoUpdate.cjs');
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'API rate limit exceeded' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        text: async () => '',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          releases: [
            {
              version: '0.19.3',
              name: '漫创AI 0.19.3',
              notes: '切换自动更新源到雨云对象存储',
              publishedAt: '2026-05-24T08:30:00Z',
              installer: {
                name: 'libai-canvas-setup-0.19.3.exe',
                size: 186266323,
              },
            },
            {
              version: '0.19.2',
              draft: true,
              installer: {
                name: 'libai-canvas-setup-0.19.2.exe',
                size: 186266323,
              },
            },
          ],
        }),
      });

    await expect(fetchUpdateHistory({ fetchImpl })).resolves.toEqual({
      ok: true,
      source: 'rainyun',
      releases: [
        {
          version: '0.19.3',
          tagName: 'v0.19.3',
          name: '漫创AI 0.19.3',
          notes: '切换自动更新源到雨云对象存储',
          publishedAt: '2026-05-24T08:30:00Z',
          prerelease: false,
          pageUrl: '',
          installer: {
            name: 'libai-canvas-setup-0.19.3.exe',
            size: 186266323,
            downloadUrl: 'https://111.cn-nb1.rains3.com/libai-updates/libai-canvas-setup-0.19.3.exe',
          },
        },
      ],
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      'https://api.github.com/repos/kjj87552-rgb/222/releases?per_page=20',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github+json',
        }),
      }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://github.com/kjj87552-rgb/222/releases.atom',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8',
        }),
      }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      'https://111.cn-nb1.rains3.com/libai-updates/releases.json',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('normalizes GitHub releases into historical versions with installer download links', async () => {
    const { fetchUpdateHistory } = require('../../electron/autoUpdate.cjs');
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => [
        {
          tag_name: 'v0.18.1',
          name: 'v0.18.1',
          body: '修复后端启动失败',
          draft: false,
          prerelease: false,
          html_url: 'https://github.com/kjj87552-rgb/222/releases/tag/v0.18.1',
          published_at: '2026-05-20T11:41:27Z',
          assets: [
            {
              name: 'latest.yml',
              size: 356,
              browser_download_url: 'https://github.com/kjj87552-rgb/222/releases/download/v0.18.1/latest.yml',
            },
            {
              name: 'libai-canvas-setup-0.18.1.exe',
              size: 184038326,
              browser_download_url: 'https://github.com/kjj87552-rgb/222/releases/download/v0.18.1/libai-canvas-setup-0.18.1.exe',
            },
          ],
        },
        {
          tag_name: 'v0.18.0',
          name: 'v0.18.0',
          body: '',
          draft: false,
          prerelease: false,
          html_url: 'https://github.com/kjj87552-rgb/222/releases/tag/v0.18.0',
          published_at: '2026-05-20T10:51:57Z',
          assets: [
            {
              name: 'libai-canvas-setup-0.18.0.exe.blockmap',
              size: 191203,
              browser_download_url: 'https://github.com/kjj87552-rgb/222/releases/download/v0.18.0/libai-canvas-setup-0.18.0.exe.blockmap',
            },
          ],
        },
        {
          tag_name: 'v0.17.0',
          name: 'v0.17.0',
          body: '旧版',
          draft: true,
          prerelease: false,
          html_url: 'https://github.com/kjj87552-rgb/222/releases/tag/v0.17.0',
          published_at: '2026-05-20T09:51:57Z',
          assets: [],
        },
      ],
    }));

    await expect(fetchUpdateHistory({
      fetchImpl,
      source: 'github',
    })).resolves.toEqual({
      ok: true,
      source: 'github',
      releases: [
        {
          version: '0.18.1',
          tagName: 'v0.18.1',
          name: 'v0.18.1',
          notes: '修复后端启动失败',
          publishedAt: '2026-05-20T11:41:27Z',
          prerelease: false,
          pageUrl: 'https://github.com/kjj87552-rgb/222/releases/tag/v0.18.1',
          installer: {
            name: 'libai-canvas-setup-0.18.1.exe',
            size: 184038326,
            downloadUrl: 'https://github.com/kjj87552-rgb/222/releases/download/v0.18.1/libai-canvas-setup-0.18.1.exe',
          },
        },
      ],
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.github.com/repos/kjj87552-rgb/222/releases?per_page=20',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github+json',
        }),
      }),
    );
  });

  it('normalizes macOS GitHub releases into historical versions with dmg download links', async () => {
    const { fetchUpdateHistory } = require('../../electron/autoUpdate.cjs');
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => [
        {
          tag_name: 'v0.20.0',
          name: 'v0.20.0',
          body: 'Mac 测试版',
          draft: false,
          prerelease: false,
          html_url: 'https://github.com/kjj87552-rgb/222/releases/tag/v0.20.0',
          published_at: '2026-05-31T10:00:00Z',
          assets: [
            {
              name: 'libai-canvas-setup-0.20.0.exe',
              size: 188000000,
              browser_download_url: 'https://github.com/kjj87552-rgb/222/releases/download/v0.20.0/libai-canvas-setup-0.20.0.exe',
            },
            {
              name: 'libai-canvas-setup-0.20.0.dmg',
              size: 205000000,
              browser_download_url: 'https://github.com/kjj87552-rgb/222/releases/download/v0.20.0/libai-canvas-setup-0.20.0.dmg',
            },
          ],
        },
      ],
    }));

    await expect(fetchUpdateHistory({
      fetchImpl,
      source: 'github',
      platform: 'darwin',
    })).resolves.toEqual({
      ok: true,
      source: 'github',
      releases: [
        {
          version: '0.20.0',
          tagName: 'v0.20.0',
          name: 'v0.20.0',
          notes: 'Mac 测试版',
          publishedAt: '2026-05-31T10:00:00Z',
          prerelease: false,
          pageUrl: 'https://github.com/kjj87552-rgb/222/releases/tag/v0.20.0',
          installer: {
            name: 'libai-canvas-setup-0.20.0.dmg',
            size: 205000000,
            downloadUrl: 'https://github.com/kjj87552-rgb/222/releases/download/v0.20.0/libai-canvas-setup-0.20.0.dmg',
          },
        },
      ],
    });
  });

  it('falls back to the public Atom release feed when the GitHub API is rate-limited', async () => {
    const { fetchUpdateHistory } = require('../../electron/autoUpdate.cjs');
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'API rate limit exceeded' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => `<?xml version="1.0" encoding="UTF-8"?>
          <feed>
            <entry>
              <updated>2026-05-20T11:45:01Z</updated>
              <link rel="alternate" type="text/html" href="https://github.com/kjj87552-rgb/222/releases/tag/v0.18.1"/>
              <title>v0.18.1</title>
              <content type="html">&lt;p&gt;漫创AI 0.18.1&lt;/p&gt;&lt;ul&gt;&lt;li&gt;修复后端启动失败&lt;/li&gt;&lt;/ul&gt;</content>
            </entry>
          </feed>`,
      });

    await expect(fetchUpdateHistory({
      fetchImpl,
      source: 'github',
    })).resolves.toEqual({
      ok: true,
      source: 'github',
      releases: [
        {
          version: '0.18.1',
          tagName: 'v0.18.1',
          name: 'v0.18.1',
          notes: '漫创AI 0.18.1\n修复后端启动失败',
          publishedAt: '2026-05-20T11:45:01Z',
          prerelease: false,
          pageUrl: 'https://github.com/kjj87552-rgb/222/releases/tag/v0.18.1',
          installer: {
            name: 'libai-canvas-setup-0.18.1.exe',
            size: 0,
            downloadUrl: 'https://github.com/kjj87552-rgb/222/releases/download/v0.18.1/libai-canvas-setup-0.18.1.exe',
          },
        },
      ],
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://github.com/kjj87552-rgb/222/releases.atom',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8',
        }),
      }),
    );
  });
});
