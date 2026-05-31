const UPDATE_CHECK_DELAY_MS = 10_000;
const GITHUB_UPDATE_FEED = {
  provider: "github",
  owner: "kjj87552-rgb",
  repo: "222",
};
const RAINYUN_UPDATE_FEED_BASE_URL = "https://111.cn-nb1.rains3.com/libai-updates";
const RAINYUN_UPDATE_FEED = {
  provider: "generic",
  url: RAINYUN_UPDATE_FEED_BASE_URL,
};
const RAINYUN_UPDATE_HISTORY_URL = `${RAINYUN_UPDATE_FEED_BASE_URL}/releases.json`;
const GITHUB_UPDATE_HISTORY_API_URL = "https://api.github.com/repos/kjj87552-rgb/222/releases?per_page=20";
const GITHUB_UPDATE_HISTORY_ATOM_URL = "https://github.com/kjj87552-rgb/222/releases.atom";
const GITHUB_RELEASE_DOWNLOAD_BASE_URL = "https://github.com/kjj87552-rgb/222/releases/download";

function installerExtensionsForPlatform(platform = process.platform) {
  return String(platform || "").trim() === "darwin" ? ["dmg", "zip"] : ["exe"];
}

function installerAssetPattern(platform = process.platform) {
  const extensions = installerExtensionsForPlatform(platform)
    .map((extension) => extension.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return new RegExp(`^libai-canvas-setup-.+\\.(${extensions})$`, "i");
}

function defaultInstallerAssetName(version, platform = process.platform) {
  const extension = installerExtensionsForPlatform(platform)[0] || "exe";
  return `libai-canvas-setup-${version}.${extension}`;
}

function loadAutoUpdater() {
  try {
    return require("electron-updater").autoUpdater;
  } catch (error) {
    return null;
  }
}

function log(logger, level, ...args) {
  const target = logger && typeof logger[level] === "function" ? logger[level] : console[level];
  if (typeof target === "function") target(...args);
}

function updateInfoPayload(info = {}) {
  return {
    version: info && info.version ? String(info.version) : "",
    releaseName: info && info.releaseName ? String(info.releaseName) : "",
    releaseDate: info && info.releaseDate ? String(info.releaseDate) : "",
  };
}

function progressPayload(progress = {}) {
  return {
    percent: Number.isFinite(Number(progress.percent)) ? Number(progress.percent) : 0,
    transferred: Number.isFinite(Number(progress.transferred)) ? Number(progress.transferred) : 0,
    total: Number.isFinite(Number(progress.total)) ? Number(progress.total) : 0,
    bytesPerSecond: Number.isFinite(Number(progress.bytesPerSecond)) ? Number(progress.bytesPerSecond) : 0,
  };
}

function errorMessage(error) {
  return error && error.message ? String(error.message) : String(error || "自动更新检查失败");
}

function publicUpdateErrorMessage(error) {
  const raw = errorMessage(error).trim();
  const lower = raw.toLowerCase();
  if (
    lower.includes("githubprovider") ||
    lower.includes("github") ||
    lower.includes("err_connection") ||
    lower.includes("timed_out") ||
    lower.includes("etimedout") ||
    lower.includes("econnreset") ||
    lower.includes("enotfound") ||
    lower.includes("eai_again") ||
    lower.includes("<?xml") ||
    lower.includes("<feed")
  ) {
    return "暂时无法连接更新服务。请稍后重试，或使用侧边栏“检测更新”再次检查。";
  }
  const firstLine = raw
    .replace(/^Error:\s*/i, "")
    .split(/\r?\n|\sat\s+/)[0]
    .trim();
  if (!firstLine) return "自动更新检查失败，请稍后重试。";
  return firstLine.length > 180 ? `${firstLine.slice(0, 180)}...` : firstLine;
}

function versionFromTag(tagName) {
  return String(tagName || "").trim().replace(/^v/i, "");
}

function buildReleaseAssetUrl(baseUrl, assetName) {
  const base = String(baseUrl || "").replace(/\/$/, "");
  const path = String(assetName || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${base}/${path}`;
}

function resolveReleaseAssetUrl(value, baseUrl) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return buildReleaseAssetUrl(baseUrl, text.replace(/^\/+/, ""));
}

function normalizeInstallerAsset(asset, platform = process.platform) {
  const name = String(asset && asset.name ? asset.name : "").trim();
  if (!installerAssetPattern(platform).test(name)) return null;
  const downloadUrl = String(asset && asset.browser_download_url ? asset.browser_download_url : "").trim();
  if (!/^https?:\/\//i.test(downloadUrl)) return null;
  return {
    name,
    size: Number.isFinite(Number(asset.size)) ? Number(asset.size) : 0,
    downloadUrl,
  };
}

function normalizeReleaseHistoryItem(release, platform = process.platform) {
  if (!release || release.draft) return null;
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const installer = assets.map((asset) => normalizeInstallerAsset(asset, platform)).find(Boolean);
  if (!installer) return null;
  const tagName = String(release.tag_name || "").trim();
  const version = versionFromTag(tagName || release.name);
  if (!version) return null;
  return {
    version,
    tagName,
    name: String(release.name || tagName || version).trim(),
    notes: String(release.body || "").trim(),
    publishedAt: String(release.published_at || "").trim(),
    prerelease: Boolean(release.prerelease),
    pageUrl: String(release.html_url || "").trim(),
    installer,
  };
}

function decodeXmlText(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function atomHtmlToText(value) {
  return decodeXmlText(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|h[1-6]|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function xmlElementText(source, tagName) {
  const match = String(source || "").match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXmlText(match[1]).trim() : "";
}

function xmlAttribute(source, name) {
  const match = String(source || "").match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match ? decodeXmlText(match[1]).trim() : "";
}

function atomAlternateLink(entry) {
  const links = String(entry || "").match(/<link\b[^>]*>/gi) || [];
  for (const link of links) {
    if (xmlAttribute(link, "rel") !== "alternate") continue;
    const href = xmlAttribute(link, "href");
    if (href) return href;
  }
  return "";
}

function normalizeAtomReleaseEntry(entry, platform = process.platform) {
  const tagName = xmlElementText(entry, "title");
  const version = versionFromTag(tagName);
  if (!tagName || !version) return null;
  const installerName = defaultInstallerAssetName(version, platform);
  return {
    version,
    tagName,
    name: tagName,
    notes: atomHtmlToText(xmlElementText(entry, "content")),
    publishedAt: xmlElementText(entry, "updated"),
    prerelease: /(?:alpha|beta|rc|pre)/i.test(version),
    pageUrl: atomAlternateLink(entry),
    installer: {
      name: installerName,
      size: 0,
      downloadUrl: `${GITHUB_RELEASE_DOWNLOAD_BASE_URL}/${tagName}/${installerName}`,
    },
  };
}

function normalizeGenericInstallerAsset(asset, downloadBaseUrl, platform = process.platform) {
  if (!asset || typeof asset !== "object") return null;
  const name = String(asset.name || asset.path || asset.url || "").trim().split("/").pop();
  if (!installerAssetPattern(platform).test(name)) return null;
  const downloadUrl = resolveReleaseAssetUrl(
    asset.downloadUrl || asset.download_url || asset.browser_download_url || asset.url || asset.path || name,
    downloadBaseUrl,
  );
  if (!/^https?:\/\//i.test(downloadUrl)) return null;
  return {
    name,
    size: Number.isFinite(Number(asset.size)) ? Number(asset.size) : 0,
    downloadUrl,
  };
}

function normalizeGenericReleaseHistoryItem(release, downloadBaseUrl, platform = process.platform) {
  if (!release || release.draft) return null;
  const tagName = String(release.tagName || release.tag_name || "").trim();
  const version = versionFromTag(release.version || tagName || release.name);
  if (!version) return null;
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const installer = normalizeGenericInstallerAsset(release.installer, downloadBaseUrl, platform)
    || assets.map((asset) => normalizeGenericInstallerAsset(asset, downloadBaseUrl, platform)).find(Boolean)
    || normalizeGenericInstallerAsset({ name: defaultInstallerAssetName(version, platform) }, downloadBaseUrl, platform);
  if (!installer) return null;
  const normalizedTagName = tagName || `v${version}`;
  return {
    version,
    tagName: normalizedTagName,
    name: String(release.name || normalizedTagName || version).trim(),
    notes: String(release.notes || release.body || release.description || "").trim(),
    publishedAt: String(release.publishedAt || release.published_at || release.releaseDate || "").trim(),
    prerelease: Boolean(release.prerelease) || /(?:alpha|beta|rc|pre)/i.test(version),
    pageUrl: String(release.pageUrl || release.page_url || release.html_url || "").trim(),
    installer,
  };
}

async function fetchGenericUpdateHistory(fetchImpl, historyUrl, limit, downloadBaseUrl, platform = process.platform) {
  const response = await fetchImpl(historyUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "libai-canvas-updater",
    },
  });
  if (!response || !response.ok) {
    throw new Error(`Update history HTTP ${response ? response.status : "unknown"}`);
  }
  const payload = await response.json();
  const rawReleases = Array.isArray(payload) ? payload : (Array.isArray(payload && payload.releases) ? payload.releases : []);
  const releases = rawReleases
    .map((release) => normalizeGenericReleaseHistoryItem(release, downloadBaseUrl, platform))
    .filter(Boolean)
    .slice(0, Math.max(1, Number(limit) || 20));
  return { ok: true, source: "rainyun", releases };
}

async function fetchJsonUpdateHistory(fetchImpl, apiUrl, limit, platform = process.platform) {
  const response = await fetchImpl(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "libai-canvas-updater",
    },
  });
  if (!response || !response.ok) {
    throw new Error(`GitHub Releases HTTP ${response ? response.status : "unknown"}`);
  }
  const payload = await response.json();
  const releases = (Array.isArray(payload) ? payload : [])
    .map((release) => normalizeReleaseHistoryItem(release, platform))
    .filter(Boolean)
    .slice(0, Math.max(1, Number(limit) || 20));
  return { ok: true, source: "github", releases };
}

async function fetchAtomUpdateHistory(fetchImpl, atomUrl, limit, platform = process.platform) {
  const response = await fetchImpl(atomUrl, {
    headers: {
      Accept: "application/atom+xml, application/xml;q=0.9, text/xml;q=0.8",
      "User-Agent": "libai-canvas-updater",
    },
  });
  if (!response || !response.ok) {
    throw new Error(`GitHub Releases Atom HTTP ${response ? response.status : "unknown"}`);
  }
  const text = await response.text();
  const releases = (String(text || "").match(/<entry>[\s\S]*?<\/entry>/gi) || [])
    .map((entry) => normalizeAtomReleaseEntry(entry, platform))
    .filter(Boolean)
    .slice(0, Math.max(1, Number(limit) || 20));
  return { ok: true, source: "github", releases };
}

async function fetchGitHubUpdateHistory(fetchImpl, apiUrl, atomUrl, limit, platform = process.platform) {
  let lastError = null;
  try {
    const result = await fetchJsonUpdateHistory(fetchImpl, apiUrl, limit, platform);
    if (result.releases.length > 0) return result;
    lastError = new Error("GitHub Releases did not include downloadable Windows installers");
  } catch (error) {
    lastError = error;
  }
  try {
    const result = await fetchAtomUpdateHistory(fetchImpl, atomUrl, limit, platform);
    if (result.releases.length > 0) return result;
    lastError = new Error("GitHub Atom feed did not include downloadable Windows installers");
  } catch (error) {
    lastError = lastError || error;
  }
  throw lastError || new Error("GitHub update history is unavailable");
}

async function fetchUpdateHistory({
  fetchImpl = typeof fetch === "function" ? fetch : null,
  source = "github",
  historyUrl = RAINYUN_UPDATE_HISTORY_URL,
  downloadBaseUrl = RAINYUN_UPDATE_FEED_BASE_URL,
  apiUrl = GITHUB_UPDATE_HISTORY_API_URL,
  atomUrl = GITHUB_UPDATE_HISTORY_ATOM_URL,
  limit = 20,
  platform = process.platform,
} = {}) {
  if (typeof fetchImpl !== "function") {
    return {
      ok: false,
      releases: [],
      message: "当前运行环境无法获取历史版本。",
    };
  }
  if (source !== "github") {
    try {
      return await fetchGenericUpdateHistory(fetchImpl, historyUrl, limit, downloadBaseUrl, platform);
    } catch (error) {
      return {
        ok: false,
        releases: [],
        message: publicUpdateErrorMessage(error),
      };
    }
  }
  try {
    return await fetchGitHubUpdateHistory(fetchImpl, apiUrl, atomUrl, limit, platform);
  } catch (githubError) {
    try {
      return await fetchGenericUpdateHistory(fetchImpl, historyUrl, limit, downloadBaseUrl, platform);
    } catch (fallbackError) {
      return {
        ok: false,
        releases: [],
        message: publicUpdateErrorMessage(githubError || fallbackError),
      };
    }
  }
}

function manualUnavailableMessage(reason) {
  switch (String(reason || "").trim()) {
    case "development":
      return "当前是开发调试版本，自动更新只在安装后的正式版中可用。";
    case "missing-updater":
      return "自动更新组件未加载，请安装正式版后再检测更新。";
    case "not-started":
      return "自动更新服务尚未启动，请稍后再试。";
    default:
      return "自动更新检查暂不可用，请稍后重试。";
  }
}

function cloneFeedOptions(options) {
  return { ...(options || {}) };
}

function createAutoUpdateController({
  app,
  autoUpdater,
  dialog,
  getMainWindow = () => null,
  logger = console,
  schedule = setTimeout,
  checkDelayMs = UPDATE_CHECK_DELAY_MS,
} = {}) {
  let started = false;
  let activeCheckManual = false;
  let checkingForUpdates = false;
  let activeFeedSource = "github";
  let fallbackRetryInProgress = false;

  function sendStatus(payload) {
    const targetWindow = getMainWindow();
    const webContents = targetWindow && targetWindow.webContents;
    if (!webContents || typeof webContents.send !== "function") return false;
    if (typeof webContents.isDestroyed === "function" && webContents.isDestroyed()) return false;
    webContents.send("libai:auto-update", {
      ...payload,
      emittedAt: new Date().toISOString(),
    });
    return true;
  }

  async function promptForRestart(info) {
    const version = info && info.version ? String(info.version) : "";
    const options = {
      type: "info",
      buttons: ["立即重启安装", "稍后"],
      defaultId: 0,
      cancelId: 1,
      title: "发现新版本",
      message: "新版本已下载完成",
      detail: version
        ? `版本 ${version} 已下载。重启应用后会自动完成安装。`
        : "重启应用后会自动完成安装。",
    };
    const targetWindow = getMainWindow();
    const result = targetWindow
      ? await dialog.showMessageBox(targetWindow, options)
      : await dialog.showMessageBox(options);
    if (result && result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  }

  function install() {
    if (!autoUpdater || typeof autoUpdater.quitAndInstall !== "function") {
      return { ok: false, reason: "missing-updater" };
    }
    autoUpdater.quitAndInstall(false, true);
    return { ok: true };
  }

  async function checkWithFeed(feedOptions, source) {
    activeFeedSource = source;
    if (typeof autoUpdater.setFeedURL === "function") {
      autoUpdater.setFeedURL(cloneFeedOptions(feedOptions));
    }
    checkingForUpdates = true;
    try {
      await autoUpdater.checkForUpdates();
    } finally {
      checkingForUpdates = false;
    }
  }

  async function checkRainyunFallback(manual, originalError) {
    if (fallbackRetryInProgress) {
      const message = publicUpdateErrorMessage(originalError);
      return { ok: false, reason: "check-failed", message };
    }
    fallbackRetryInProgress = true;
    log(logger, "warn", "GitHub 更新检查失败，切换到雨云兜底", originalError);
    try {
      await checkWithFeed(RAINYUN_UPDATE_FEED, "rainyun");
      return { ok: true };
    } catch (fallbackError) {
      const message = publicUpdateErrorMessage(originalError || fallbackError);
      log(logger, "warn", "自动更新检查失败", fallbackError);
      sendStatus({ state: "error", manual, message });
      activeCheckManual = false;
      return { ok: false, reason: "check-failed", message };
    } finally {
      fallbackRetryInProgress = false;
    }
  }

  async function checkNow(options = {}) {
    const manual = Boolean(options && options.manual);
    if (!started) {
      if (manual) sendStatus({ state: "error", manual, message: manualUnavailableMessage("not-started") });
      return { ok: false, reason: "not-started" };
    }
    if (!app || !app.isPackaged) {
      if (manual) sendStatus({ state: "error", manual, message: manualUnavailableMessage("development") });
      return { ok: false, reason: "development" };
    }
    if (!autoUpdater || typeof autoUpdater.checkForUpdates !== "function") {
      if (manual) sendStatus({ state: "error", manual, message: manualUnavailableMessage("missing-updater") });
      return { ok: false, reason: "missing-updater" };
    }
    activeCheckManual = manual;
    sendStatus({ state: "checking", manual });
    try {
      await checkWithFeed(GITHUB_UPDATE_FEED, "github");
      return { ok: true };
    } catch (githubError) {
      return await checkRainyunFallback(manual, githubError);
    }
  }

  function handleUpdaterError(error) {
    log(logger, "warn", "自动更新检查失败", error);
    if (checkingForUpdates) {
      return;
    }
    const manual = activeCheckManual;
    if (activeFeedSource === "github" && !fallbackRetryInProgress) {
      checkRainyunFallback(manual, error).catch((fallbackError) => {
        const message = publicUpdateErrorMessage(error || fallbackError);
        log(logger, "warn", "自动更新检查失败", fallbackError);
        sendStatus({ state: "error", manual, message });
        activeCheckManual = false;
      });
      return;
    }
    activeCheckManual = false;
    sendStatus({
      state: "error",
      manual,
      message: publicUpdateErrorMessage(error),
    });
  }

  function start() {
    if (started) return { enabled: false, reason: "already-started" };
    started = true;

    if (!app || !app.isPackaged) {
      return { enabled: false, reason: "development" };
    }
    if (!autoUpdater) {
      log(logger, "warn", "自动更新不可用：缺少 electron-updater。");
      return { enabled: false, reason: "missing-updater" };
    }

    autoUpdater.autoDownload = true;
    autoUpdater.on("error", handleUpdaterError);
    autoUpdater.on("update-available", (info) => {
      log(logger, "info", "发现新版本", info && info.version ? info.version : "");
      const manual = activeCheckManual;
      activeCheckManual = false;
      sendStatus({
        state: "available",
        manual,
        ...updateInfoPayload(info),
      });
    });
    autoUpdater.on("update-not-available", (info) => {
      log(logger, "info", "当前已是最新版本", info && info.version ? info.version : "");
      const manual = activeCheckManual;
      activeCheckManual = false;
      sendStatus({
        state: "not-available",
        manual,
        ...updateInfoPayload(info),
      });
    });
    autoUpdater.on("download-progress", (progress) => {
      sendStatus({
        state: "downloading",
        ...progressPayload(progress),
      });
    });
    autoUpdater.on("update-downloaded", (info) => {
      const sent = sendStatus({
        state: "downloaded",
        ...updateInfoPayload(info),
      });
      if (sent) return;
      promptForRestart(info).catch((error) => {
        log(logger, "warn", "更新安装提示失败", error);
      });
    });

    schedule(() => {
      checkNow().catch((error) => {
        log(logger, "warn", "自动更新检查失败", error);
      });
    }, checkDelayMs);

    return { enabled: true };
  }

  return { checkNow, install, start };
}

module.exports = {
  UPDATE_CHECK_DELAY_MS,
  createAutoUpdateController,
  fetchUpdateHistory,
  loadAutoUpdater,
  progressPayload,
  updateInfoPayload,
};
