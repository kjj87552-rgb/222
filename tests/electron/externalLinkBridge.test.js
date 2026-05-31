import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const mainProcess = readFileSync('electron/main.cjs', 'utf8');
const preload = readFileSync('electron/preload.cjs', 'utf8');

describe('electron external link bridge', () => {
  it('opens recharge links through a restricted native browser bridge', () => {
    expect(preload).toContain('openExternal: (url) => ipcRenderer.invoke("libai:openExternal", url)');
    expect(mainProcess).toContain('shell');
    expect(mainProcess).toContain('ipcMain.handle("libai:openExternal"');
    expect(mainProcess).toContain('isAllowedExternalUrl(url)');
    expect(mainProcess).toContain('shell.openExternal(url)');
    expect(mainProcess).toContain('parsed.protocol === "http:" || parsed.protocol === "https:"');
  });

  it('opens card purchases inside a sandboxed Electron purchase window', () => {
    expect(preload).toContain('openPurchaseWindow: () => ipcRenderer.invoke("libai:openPurchaseWindow")');
    expect(mainProcess).toContain('const CARD_PURCHASE_URL = "http://km.huimengart.cn/"');
    expect(mainProcess).toContain('ipcMain.handle("libai:openPurchaseWindow"');
    expect(mainProcess).toContain('createPurchaseWindow(windowFromEvent(event))');
    expect(mainProcess).toContain('sandbox: true');
    expect(mainProcess).toContain('nodeIntegration: false');
    expect(mainProcess).toContain('setWindowOpenHandler');
    expect(mainProcess).toContain('isAllowedPurchaseNavigation(url)');
  });
});
