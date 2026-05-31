import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const mainProcess = readFileSync('electron/main.cjs', 'utf8');
const preload = readFileSync('electron/preload.cjs', 'utf8');
const fileUtils = readFileSync('src/shared/utils/file.js', 'utf8');

describe('electron file download bridge', () => {
  it('routes renderer downloads through a native save dialog', () => {
    expect(preload).toContain('saveFile: (payload) => ipcRenderer.invoke("libai:saveFile", payload)');
    expect(mainProcess).toContain('ipcMain.handle("libai:saveFile"');
    expect(mainProcess).toContain('dialog.showSaveDialog');
    expect(mainProcess).toContain('writeDownloadPayloadToPath(payload, result.filePath)');
    expect(fileUtils).toContain('window.libai?.system?.saveFile');
  });

  it('can save local asset paths and backend asset urls without navigating the renderer', () => {
    expect(mainProcess).toContain('localPathFromRendererUrl(payload?.assetPath');
    expect(mainProcess).toContain('new URL(source, backendBaseUrl');
    expect(fileUtils).toContain('document.body.appendChild(a)');
    expect(fileUtils.indexOf('window.libai?.system?.saveFile')).toBeLessThan(
      fileUtils.indexOf('document.body.appendChild(a)'),
    );
  });
});
