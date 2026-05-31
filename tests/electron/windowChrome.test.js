import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const mainProcess = readFileSync('electron/main.cjs', 'utf8');
const preload = readFileSync('electron/preload.cjs', 'utf8');
const appSource = readFileSync('src/app/App.jsx', 'utf8');
const shellStyles = readFileSync('src/features/shell/styles.js', 'utf8');
const modalStyles = readFileSync('src/features/modals/shared/styles.js', 'utf8');
const workbenchStyles = readFileSync('src/features/storyboard/workbench/styles.js', 'utf8');

describe('electron window chrome', () => {
  it('uses a frameless browser window without the native menu bar', () => {
    expect(mainProcess).toContain('Menu');
    expect(mainProcess).toContain('frame: false');
    expect(mainProcess).toContain('autoHideMenuBar: true');
    expect(mainProcess).toContain('Menu.setApplicationMenu(null)');
    expect(mainProcess).toContain('mainWindow.removeMenu()');
    expect(mainProcess).toContain('mainWindow.setMenuBarVisibility(false)');
  });

  it('exposes safe renderer controls for minimize maximize and close', () => {
    expect(mainProcess).toContain('BrowserWindow.fromWebContents(event.sender)');
    expect(mainProcess).toContain('ipcMain.handle("libai:window:minimize", (event)');
    expect(mainProcess).toContain('ipcMain.handle("libai:window:toggleMaximize"');
    expect(mainProcess).toContain('ipcMain.handle("libai:window:close"');
    expect(mainProcess).toContain('mainWindow.on(eventName, () => emitWindowState(mainWindow))');
    expect(mainProcess).toContain('webContents.send("libai:window-state"');

    expect(preload).toContain('window: {');
    expect(preload).toContain('minimize: () => ipcRenderer.invoke("libai:window:minimize")');
    expect(preload).toContain('toggleMaximize: () => ipcRenderer.invoke("libai:window:toggleMaximize")');
    expect(preload).toContain('close: () => ipcRenderer.invoke("libai:window:close")');
    expect(preload).toContain('onStateChange: (callback) => {');
  });

  it('uses the non-blocking close flush hook before closing the window', () => {
    expect(mainProcess).toContain('window.__libaiFlushCanvasForClose ? window.__libaiFlushCanvasForClose() : null');
    expect(mainProcess).not.toContain('window.__libaiFlushCanvasNow ? window.__libaiFlushCanvasNow() : null');
  });

  it('does not block shutdown with a modal when close-time flushing fails', () => {
    const closeHandler = mainProcess.match(/mainWindow\.on\("close", \(event\) => \{[\s\S]*?\n  \}\);/);
    expect(closeHandler?.[0]).toContain('console.warn("Renderer canvas flush during close failed; closing anyway", error);');
    expect(closeHandler?.[0]).toContain('closeAfterRendererFlush = true;');
    expect(closeHandler?.[0]).toContain('mainWindow.close()');
    expect(closeHandler?.[0]).not.toContain('dialog.showErrorBox(');
    expect(closeHandler?.[0]).not.toContain('"漫创AI 保存失败"');
  });

  it('renders an integrated draggable custom titlebar when electron controls exist', () => {
    expect(appSource).toContain('function AppWindowChrome()');
    expect(appSource).toContain('window.libai?.window');
    expect(appSource).toContain('<AppWindowChrome />');
    expect(appSource).toContain('has-window-chrome');
    expect(appSource).toContain('window-control-btn close');

    expect(shellStyles).toContain('.app-window-chrome');
    expect(shellStyles).toContain('-webkit-app-region:drag');
    expect(shellStyles).toContain('-webkit-app-region:no-drag');
    expect(shellStyles).toContain('.has-window-chrome .product-sidebar');
    expect(shellStyles).toContain('.has-window-chrome .auth-gate');
  });

  it('keeps the custom titlebar as the app-level frame above project canvas views', () => {
    expect(appSource).toContain('<AppWindowChrome />');
    expect(appSource).toContain('activeView === \'canvas\'');
    expect(shellStyles).toContain('.app-window-chrome{position:fixed');
    expect(shellStyles).toContain('z-index:12000');
    expect(shellStyles).toContain('.has-window-chrome .canvas-screen');
  });

  it('keeps full-screen previews and modal backdrops below the custom titlebar controls', () => {
    expect(modalStyles).toMatch(/\.has-window-chrome \.x-modal-mask\{[^}]*top:38px;[^}]*height:calc\(100% - 38px\)/s);
    expect(shellStyles).toMatch(/\.has-window-chrome \.hp-modal-backdrop\{[^}]*top:38px;[^}]*height:calc\(100% - 38px\)/s);
    expect(shellStyles).toMatch(/\.has-window-chrome \.media-preview-backdrop\{[^}]*top:38px;[^}]*height:calc\(100% - 38px\)/s);
    expect(workbenchStyles).toMatch(/\.has-window-chrome \.sb-workbench-backdrop\{[^}]*top:38px;[^}]*height:calc\(100% - 38px\)/s);
  });
});
