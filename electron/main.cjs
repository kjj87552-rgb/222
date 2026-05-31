const { app, BrowserWindow, dialog, ipcMain, Menu, protocol, shell } = require("electron");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { fileURLToPath } = require("node:url");
const mime = require("node:fs"); // placeholder — we use simple ext-based mime below
const { localAssetUrlFromPath, localPathFromLibaiAssetUrl } = require("./localAssetProtocol.cjs");
const { createAutoUpdateController, fetchUpdateHistory, loadAutoUpdater } = require("./autoUpdate.cjs");
const { createBackendRequester } = require("./backendRequest.cjs");
const { configureGraphicsCompatibility } = require("./graphicsCompatibility.cjs");
const { loadReferenceStorageEnv } = require("./referenceStorageEnv.cjs");
const { rememberSaveDirectory, resolveDefaultSavePath } = require("./downloadSaveDirectory.cjs");
const { ffmpegResourceSubdir } = require("./platformResources.cjs");

configureGraphicsCompatibility(app);

/* Allowed file extensions for the local-folder browser (case-insensitive). */
const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp", "avif", "svg"]);
const VIDEO_EXTS = new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
const AUDIO_EXTS = new Set(["mp3", "wav", "m4a", "aac", "flac", "ogg"]);

function extMime(ext) {
  ext = String(ext || "").toLowerCase();
  if (IMAGE_EXTS.has(ext)) return `image/${ext === "jpg" ? "jpeg" : ext}`;
  if (VIDEO_EXTS.has(ext)) return ext === "mov" ? "video/quicktime" : `video/${ext}`;
  if (AUDIO_EXTS.has(ext)) return `audio/${ext}`;
  return "application/octet-stream";
}

function safeDownloadFilename(name, fallback = "asset") {
  return String(name || fallback)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 120) || fallback;
}

function downloadFilters(kind, filename) {
  const ext = String(path.extname(filename || "").replace(".", "")).toLowerCase();
  const allFiles = { name: "All Files", extensions: ["*"] };
  if (kind === "image" || IMAGE_EXTS.has(ext)) return [{ name: "Images", extensions: Array.from(IMAGE_EXTS) }, allFiles];
  if (kind === "video" || VIDEO_EXTS.has(ext)) return [{ name: "Videos", extensions: Array.from(VIDEO_EXTS) }, allFiles];
  if (kind === "audio" || AUDIO_EXTS.has(ext)) return [{ name: "Audio", extensions: Array.from(AUDIO_EXTS) }, allFiles];
  if (ext === "json") return [{ name: "JSON", extensions: ["json"] }, allFiles];
  if (ext === "txt") return [{ name: "Text", extensions: ["txt"] }, allFiles];
  return [allFiles];
}

function isAllowedExternalUrl(url) {
  try {
    const parsed = new URL(String(url || "").trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
}

const CARD_PURCHASE_URL = "http://km.huimengart.cn/";

function isAllowedPurchaseNavigation(url) {
  try {
    const parsed = new URL(String(url || "").trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function localPathFromRendererUrl(source) {
  const text = String(source || "").trim();
  if (!text) return "";
  if (/^libai-asset:\/\//i.test(text)) {
    return localPathFromLibaiAssetUrl(text);
  }
  if (/^file:\/\//i.test(text)) {
    try {
      return fileURLToPath(text);
    } catch (_) {
      return "";
    }
  }
  if (/^[A-Za-z]:[\\/]/.test(text) || text.startsWith("\\\\")) return text;
  return "";
}

function dataUrlToBuffer(source) {
  const match = String(source || "").match(/^data:([^,]*?),(.*)$/s);
  if (!match) return null;
  const meta = match[1] || "";
  const body = match[2] || "";
  if (/;base64(?:;|$)/i.test(meta)) return Buffer.from(body, "base64");
  return Buffer.from(decodeURIComponent(body), "utf8");
}

async function writeDownloadPayloadToPath(payload, targetPath) {
  const text = payload && Object.prototype.hasOwnProperty.call(payload, "text") ? payload.text : undefined;
  if (text !== undefined && text !== null) {
    await fs.promises.writeFile(targetPath, String(text), "utf8");
    return;
  }

  const explicitPath = localPathFromRendererUrl(payload?.assetPath || payload?.localPath || payload?.path);
  if (explicitPath && fs.existsSync(explicitPath)) {
    if (path.resolve(explicitPath) !== path.resolve(targetPath)) {
      await fs.promises.copyFile(explicitPath, targetPath);
    }
    return;
  }

  const source = String(payload?.source || payload?.url || payload?.src || "").trim();
  const sourcePath = localPathFromRendererUrl(source);
  if (sourcePath && fs.existsSync(sourcePath)) {
    if (path.resolve(sourcePath) !== path.resolve(targetPath)) {
      await fs.promises.copyFile(sourcePath, targetPath);
    }
    return;
  }

  const dataBuffer = dataUrlToBuffer(source);
  if (dataBuffer) {
    await fs.promises.writeFile(targetPath, dataBuffer);
    return;
  }

  if (/^https?:\/\//i.test(source) || source.startsWith("/")) {
    const url = source.startsWith("/")
      ? new URL(source, backendBaseUrl || "http://127.0.0.1").toString()
      : source;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`下载失败：HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(targetPath, bytes);
    return;
  }

  throw new Error("没有可保存的本地文件或媒体地址");
}

const ROOT_DIR = path.resolve(__dirname, "..");
const isDev = !app.isPackaged;
const APP_ICON_RELATIVE_PATH = path.join("assets", "app-icon.ico");
const FFMPEG_RESOURCE_SUBDIR = ffmpegResourceSubdir();
const BACKEND_RESOURCE_SUBDIR = "backend";

let mainWindow = null;
let backendProcess = null;
let backendBaseUrl = null;
let backendStartPromise = null;
let closeAfterRendererFlush = false;
let closeFlushInProgress = false;
let autoUpdateController = null;
let purchaseWindow = null;

function usableWindow(targetWindow = mainWindow) {
  if (
    targetWindow &&
    typeof targetWindow.isDestroyed === "function" &&
    !targetWindow.isDestroyed()
  ) return targetWindow;
  if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;
  return null;
}

function currentWindowState(targetWindow = mainWindow) {
  const targetWindowOrNull = usableWindow(targetWindow);
  if (!targetWindowOrNull) {
    return { maximized: false, focused: false };
  }
  return {
    maximized: targetWindowOrNull.isMaximized(),
    focused: targetWindowOrNull.isFocused(),
  };
}

function emitWindowState(targetWindow = mainWindow) {
  const targetWindowOrNull = usableWindow(targetWindow);
  if (!targetWindowOrNull) return;
  targetWindowOrNull.webContents.send("libai:window-state", currentWindowState(targetWindowOrNull));
}

function windowFromEvent(event) {
  const eventWindow = event?.sender ? BrowserWindow.fromWebContents(event.sender) : null;
  return usableWindow(eventWindow);
}

function resolveAppIconPath() {
  return path.join(ROOT_DIR, APP_ICON_RELATIVE_PATH);
}

function resolveBundledExecutable(name) {
  const exeName = process.platform === "win32" ? `${name}.exe` : name;
  const candidates = [
    path.join(process.resourcesPath || "", FFMPEG_RESOURCE_SUBDIR, exeName),
    path.join(ROOT_DIR, FFMPEG_RESOURCE_SUBDIR, exeName),
    path.join(ROOT_DIR, "node_modules", name === "ffprobe" ? "ffprobe-static" : "ffmpeg-static", exeName),
  ];

  if (name === "ffprobe") {
    candidates.push(path.join(ROOT_DIR, "node_modules", "ffprobe-static", "bin", "win32", "x64", exeName));
  }

  for (const candidate of candidates) {
    try {
      if (candidate && fs.existsSync(candidate)) return candidate;
    } catch (error) {
      // ignore inaccessible candidate and continue
    }
  }
  return "";
}

function resolveFfmpegRuntime() {
  return {
    ffmpegPath: resolveBundledExecutable("ffmpeg"),
    ffprobePath: resolveBundledExecutable("ffprobe"),
  };
}

function resolveBackendResourceDir() {
  return isDev
    ? path.join(ROOT_DIR, "backend")
    : path.join(process.resourcesPath || "", BACKEND_RESOURCE_SUBDIR);
}

function rendererOriginForCors() {
  const origins = new Set(
    String(process.env.LIBAI_CORS_ORIGINS || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
  if (isDev) {
    try {
      origins.add(new URL(process.env.LIBAI_RENDERER_URL || "http://127.0.0.1:5177/").origin);
    } catch (_) {
      origins.add("http://127.0.0.1:5177");
    }
  }
  return Array.from(origins).join(",");
}

function resolvePackagedBackendExecutable() {
  const exeName = process.platform === "win32" ? "libai-backend.exe" : "libai-backend";
  const candidates = [
    path.join(resolveBackendResourceDir(), exeName),
    path.join(resolveBackendResourceDir(), "libai-backend", exeName),
  ];
  for (const candidate of candidates) {
    try {
      if (candidate && fs.existsSync(candidate)) return candidate;
    } catch (error) {
      // ignore inaccessible candidate and continue
    }
  }
  throw new Error(`缺少打包后端运行文件：${path.join(BACKEND_RESOURCE_SUBDIR, exeName)}`);
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function waitForBackend(url, timeoutMs = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/health`);
      if (res.ok) return;
    } catch (error) {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Backend did not become healthy at ${url}`);
}

async function startBackend() {
  const port = await findFreePort();
  backendBaseUrl = `http://127.0.0.1:${port}`;
  const appDataDir = path.join(app.getPath("appData"), "LibAI");
  fs.mkdirSync(appDataDir, { recursive: true });
  const ffmpegRuntime = resolveFfmpegRuntime();
  const backendResourceDir = resolveBackendResourceDir();
  const referenceStorageEnv = loadReferenceStorageEnv({
    rootDir: ROOT_DIR,
    backendResourceDir,
    appDataDir,
    env: process.env,
  });

  const env = {
    ...process.env,
    ...referenceStorageEnv,
    LIBAI_APP_DATA_DIR: appDataDir,
    LIBAI_BACKEND_PORT: String(port),
    LIBAI_BACKEND_RESOURCE_DIR: backendResourceDir,
    LIBAI_DESIGN_PROMPT_TEMPLATE_DIR: path.join(backendResourceDir, "design_prompt_templates"),
    LIBAI_BACKEND_LOG_LEVEL: isDev ? "info" : "warning",
    LIBAI_CORS_ORIGINS: rendererOriginForCors(),
    ...(ffmpegRuntime.ffmpegPath ? { LIBAI_FFMPEG_PATH: ffmpegRuntime.ffmpegPath } : {}),
    ...(ffmpegRuntime.ffprobePath ? { LIBAI_FFPROBE_PATH: ffmpegRuntime.ffprobePath } : {}),
    PYTHONUTF8: "1",
    PYTHONIOENCODING: "utf-8",
  };
  let backendCommand = "python";
  let backendArgs = [
    "-m",
    "uvicorn",
    "backend.app:app",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--log-level",
    isDev ? "info" : "warning",
  ];
  let backendCwd = ROOT_DIR;
  if (!isDev) {
    backendCommand = resolvePackagedBackendExecutable();
    backendArgs = [];
    backendCwd = backendResourceDir;
  }
  backendProcess = childProcess.spawn(backendCommand, backendArgs, {
    cwd: backendCwd,
    env,
    windowsHide: true,
    stdio: isDev ? "inherit" : "ignore",
  });
  backendProcess.on("exit", (code) => {
    if (code !== 0 && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("libai:backend-exit", { code });
    }
  });
  await waitForBackend(backendBaseUrl);
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
  backendProcess = null;
  backendBaseUrl = null;
}

function backendProcessIsRunning() {
  return Boolean(backendProcess && !backendProcess.killed && backendProcess.exitCode === null);
}

async function ensureBackendRunning({ restart = false } = {}) {
  if (backendStartPromise) return backendStartPromise;

  if (restart) {
    stopBackend();
  } else if (backendBaseUrl && backendProcessIsRunning()) {
    return backendBaseUrl;
  }

  backendStartPromise = startBackend()
    .then(() => backendBaseUrl)
    .finally(() => {
      backendStartPromise = null;
    });
  return backendStartPromise;
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

async function flushRendererCanvas() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  await withTimeout(
    mainWindow.webContents.executeJavaScript(
      "window.__libaiFlushCanvasForClose ? window.__libaiFlushCanvasForClose() : null",
      true,
    ),
    8000,
    "Timed out while saving the current canvas",
  );
}

async function createWindow() {
  closeAfterRendererFlush = false;
  closeFlushInProgress = false;
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    title: "漫创AI",
    icon: resolveAppIconPath(),
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: "#0A0B0D",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.removeMenu();
  mainWindow.setMenuBarVisibility(false);

  ["maximize", "unmaximize", "restore", "focus", "blur"].forEach((eventName) => {
    mainWindow.on(eventName, () => emitWindowState(mainWindow));
  });
  mainWindow.webContents.once("did-finish-load", () => emitWindowState(mainWindow));

  if (isDev) {
    const rendererUrl = process.env.LIBAI_RENDERER_URL || "http://127.0.0.1:5177/";
    await mainWindow.loadURL(rendererUrl);
  } else {
    await mainWindow.loadFile(path.join(ROOT_DIR, "dist", "index.html"));
  }

  mainWindow.on("close", (event) => {
    if (closeAfterRendererFlush) return;
    event.preventDefault();
    if (closeFlushInProgress) return;
    closeFlushInProgress = true;
    flushRendererCanvas()
      .then(() => {
        closeAfterRendererFlush = true;
        closeFlushInProgress = false;
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
      })
      .catch((error) => {
        console.warn("Renderer canvas flush during close failed; closing anyway", error);
        closeAfterRendererFlush = true;
        closeFlushInProgress = false;
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
      });
  });
}

async function createPurchaseWindow(parentWindow = mainWindow) {
  if (purchaseWindow && !purchaseWindow.isDestroyed()) {
    purchaseWindow.focus();
    return { ok: true, url: CARD_PURCHASE_URL };
  }

  const parent = usableWindow(parentWindow);
  purchaseWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    title: "购买卡密",
    parent: parent || undefined,
    autoHideMenuBar: true,
    backgroundColor: "#F8FCFF",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      partition: "persist:libai-purchase",
    },
  });
  purchaseWindow.removeMenu();
  purchaseWindow.setMenuBarVisibility(false);
  purchaseWindow.on("closed", () => {
    purchaseWindow = null;
  });
  purchaseWindow.webContents.on("will-attach-webview", (event) => {
    event.preventDefault();
  });
  purchaseWindow.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedPurchaseNavigation(url)) event.preventDefault();
  });
  purchaseWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!isAllowedPurchaseNavigation(url)) return { action: "deny" };
    purchaseWindow.loadURL(url).catch((error) => {
      console.warn("Purchase window popup navigation failed", error);
    });
    return { action: "deny" };
  });

  await purchaseWindow.loadURL(CARD_PURCHASE_URL);
  return { ok: true, url: CARD_PURCHASE_URL };
}

const backendRequest = createBackendRequester({
  getBackendBaseUrl: () => backendBaseUrl,
  ensureBackendRunning,
});

ipcMain.handle("libai:runtime", () => ({
  backendBaseUrl,
  appDataDir: path.join(app.getPath("appData"), "LibAI"),
  platform: process.platform,
  packaged: app.isPackaged,
}));

ipcMain.handle("libai:api", (_event, request) => backendRequest(request));

ipcMain.handle("libai:openExternal", async (_event, value) => {
  const url = String(value || "").trim();
  if (!isAllowedExternalUrl(url)) return { ok: false, reason: "blocked-url" };
  await shell.openExternal(url);
  return { ok: true };
});

ipcMain.handle("libai:openPurchaseWindow", async (event) => (
  createPurchaseWindow(windowFromEvent(event))
));

ipcMain.handle("libai:auto-update:install", () => (
  autoUpdateController ? autoUpdateController.install() : { ok: false, reason: "not-started" }
));

ipcMain.handle("libai:auto-update:check", () => (
  autoUpdateController ? autoUpdateController.checkNow({ manual: true }) : { ok: false, reason: "not-started" }
));

ipcMain.handle("libai:auto-update:history", () => fetchUpdateHistory());

ipcMain.handle("libai:window:state", (event) => currentWindowState(windowFromEvent(event)));

ipcMain.handle("libai:window:minimize", (event) => {
  const targetWindow = windowFromEvent(event);
  if (targetWindow) targetWindow.minimize();
  return currentWindowState(targetWindow);
});

ipcMain.handle("libai:window:toggleMaximize", (event) => {
  const targetWindow = windowFromEvent(event);
  if (!targetWindow) return currentWindowState(targetWindow);
  if (targetWindow.isMaximized()) {
    targetWindow.unmaximize();
  } else {
    targetWindow.maximize();
  }
  emitWindowState(targetWindow);
  return currentWindowState(targetWindow);
});

ipcMain.handle("libai:window:close", (event) => {
  const targetWindow = windowFromEvent(event);
  if (targetWindow) targetWindow.close();
  return currentWindowState(targetWindow);
});

ipcMain.handle("libai:pickFiles", async (_event, options = {}) => {
  const kind = String(options.kind || "").toLowerCase();
  const defaultFilters = kind === "image"
    ? [
        { name: "Images", extensions: Array.from(IMAGE_EXTS) },
        { name: "All Files", extensions: ["*"] },
      ]
    : kind === "video"
      ? [
          { name: "Videos", extensions: Array.from(VIDEO_EXTS) },
          { name: "All Files", extensions: ["*"] },
        ]
      : kind === "audio"
        ? [
            { name: "Audio", extensions: Array.from(AUDIO_EXTS) },
            { name: "All Files", extensions: ["*"] },
          ]
        : [
            { name: "Media", extensions: ["png", "jpg", "jpeg", "webp", "gif", "mp4", "mov", "webm", "mp3", "wav", "m4a"] },
            { name: "All Files", extensions: ["*"] },
          ];
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: options.multiple ? ["openFile", "multiSelections"] : ["openFile"],
    filters: options.filters || defaultFilters,
  });
  if (result.canceled) return [];
  return result.filePaths;
});

ipcMain.handle("libai:pickFolder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const folderPath = result.filePaths[0];
  return { path: folderPath, name: path.basename(folderPath) };
});

ipcMain.handle("libai:listFolder", async (_event, folderPath) => {
  if (!folderPath || typeof folderPath !== "string") {
    throw new Error("folderPath required");
  }
  let entries;
  try {
    entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
  } catch (error) {
    throw new Error(`Cannot read folder: ${error.message}`);
  }
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    const ext = name.includes(".") ? name.split(".").pop() : "";
    const lowerExt = ext.toLowerCase();
    if (!IMAGE_EXTS.has(lowerExt) && !VIDEO_EXTS.has(lowerExt) && !AUDIO_EXTS.has(lowerExt)) continue;
    const fullPath = path.join(folderPath, name);
    let stat = null;
    try { stat = await fs.promises.stat(fullPath); } catch (_) { continue; }
    files.push({
      name,
      path: fullPath,
      mime: extMime(lowerExt),
      kind: IMAGE_EXTS.has(lowerExt) ? "image" : VIDEO_EXTS.has(lowerExt) ? "video" : "audio",
      size: stat.size,
      mtime: stat.mtimeMs,
      assetUrl: localAssetUrlFromPath(fullPath),
    });
  }
  return {
    path: folderPath,
    name: path.basename(folderPath),
    files: files.sort((a, b) => a.name.localeCompare(b.name, "zh-CN")),
  };
});

ipcMain.handle("libai:saveFile", async (event, payload = {}) => {
  const filename = safeDownloadFilename(payload.filename || "asset");
  const targetWindow = windowFromEvent(event);
  const options = {
    defaultPath: resolveDefaultSavePath(app, filename),
    filters: downloadFilters(String(payload.kind || "").toLowerCase(), filename),
  };
  const result = targetWindow
    ? await dialog.showSaveDialog(targetWindow, options)
    : await dialog.showSaveDialog(options);
  if (result.canceled || !result.filePath) return { canceled: true };
  await writeDownloadPayloadToPath(payload, result.filePath);
  rememberSaveDirectory(app, result.filePath);
  return { canceled: false, path: result.filePath };
});

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  /* Custom protocol so the renderer (loaded over http://) can display arbitrary
   * local image/video files without disabling webSecurity. The renderer uses
   * URLs like  libai-asset:///C:/path/to/file.png  in <img src> / <video src>. */
  protocol.registerFileProtocol("libai-asset", (request, callback) => {
    try {
      const decoded = localPathFromLibaiAssetUrl(request.url);
      if (!decoded) throw new Error("Invalid libai-asset url");
      callback({ path: decoded });
    } catch (error) {
      callback({ error: -2 /* FILE_NOT_FOUND */ });
    }
  });

  try {
    await ensureBackendRunning();
    await createWindow();
    autoUpdateController = createAutoUpdateController({
      app,
      autoUpdater: loadAutoUpdater(),
      dialog,
      getMainWindow: () => usableWindow(),
    });
    autoUpdateController.start();
  } catch (error) {
    dialog.showErrorBox("漫创AI 启动失败", error instanceof Error ? error.message : String(error));
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("will-quit", stopBackend);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
