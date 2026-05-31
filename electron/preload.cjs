const { contextBridge, ipcRenderer, webUtils } = require("electron");

function api(method, path, body) {
  return ipcRenderer.invoke("libai:api", { method, path, body });
}

function wsUrl(httpUrl, path) {
  return httpUrl.replace(/^http/, "ws") + path;
}

function queryString(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const text = params.toString();
  return text ? `?${text}` : "";
}

const libai = {
  system: {
    getRuntime: () => ipcRenderer.invoke("libai:runtime"),
    filePath: (file) => {
      try {
        return webUtils.getPathForFile(file) || "";
      } catch (_) {
        return "";
      }
    },
    pickFiles: (options) => ipcRenderer.invoke("libai:pickFiles", options),
    pickFolder: () => ipcRenderer.invoke("libai:pickFolder"),
    listFolder: (folderPath) => ipcRenderer.invoke("libai:listFolder", folderPath),
    saveFile: (payload) => ipcRenderer.invoke("libai:saveFile", payload),
    openExternal: (url) => ipcRenderer.invoke("libai:openExternal", url),
    openPurchaseWindow: () => ipcRenderer.invoke("libai:openPurchaseWindow"),
  },
  window: {
    state: () => ipcRenderer.invoke("libai:window:state"),
    minimize: () => ipcRenderer.invoke("libai:window:minimize"),
    toggleMaximize: () => ipcRenderer.invoke("libai:window:toggleMaximize"),
    close: () => ipcRenderer.invoke("libai:window:close"),
    onStateChange: (callback) => {
      if (typeof callback !== "function") return () => {};
      const handler = (_event, state) => callback(state);
      ipcRenderer.on("libai:window-state", handler);
      ipcRenderer.invoke("libai:window:state").then(callback).catch(() => {});
      return () => ipcRenderer.removeListener("libai:window-state", handler);
    },
  },
  update: {
    check: () => ipcRenderer.invoke("libai:auto-update:check"),
    install: () => ipcRenderer.invoke("libai:auto-update:install"),
    history: () => ipcRenderer.invoke("libai:auto-update:history"),
    onStatus: (callback) => {
      if (typeof callback !== "function") return () => {};
      const handler = (_event, payload) => callback(payload);
      ipcRenderer.on("libai:auto-update", handler);
      return () => ipcRenderer.removeListener("libai:auto-update", handler);
    },
  },
  announcement: {
    list: () => api("GET", "/desktop-announcements"),
    onEvent: (callback) => {
      if (typeof callback !== "function") return () => {};
      let closed = false;
      let source = null;
      const handleEvent = (event) => {
        try {
          callback(JSON.parse(event.data));
        } catch (error) {
          callback({ type: "raw", data: event.data });
        }
      };
      ipcRenderer.invoke("libai:runtime").then((runtime) => {
        if (closed || !runtime?.backendBaseUrl) return;
        source = new EventSource(`${runtime.backendBaseUrl}/desktop-announcements/events`);
        source.onopen = () => callback({ type: "desktop.announcement.connected" });
        source.onmessage = handleEvent;
        source.addEventListener("desktop-announcement", handleEvent);
        source.onerror = () => callback({ type: "desktop.announcement.connection-error" });
      }).catch(() => {
        if (!closed) callback({ type: "desktop.announcement.connection-error" });
      });
      return () => {
        closed = true;
        if (source) source.close();
      };
    },
  },
  project: {
    list: () => api("GET", "/projects"),
    create: (name = "未命名", id = "local-default") => api("POST", "/projects", { name, id }),
    open: (projectId = "local-default") => api("GET", `/projects/${encodeURIComponent(projectId)}`),
    saveGraph: (projectId = "local-default", graph) => api("PUT", `/projects/${encodeURIComponent(projectId)}/graph`, graph),
    patchGraph: (projectId = "local-default", patch = {}) => api("PATCH", `/projects/${encodeURIComponent(projectId)}/graph`, patch),
    saveNode: (projectId = "local-default", node = {}) => api("PUT", `/projects/${encodeURIComponent(projectId)}/nodes/${encodeURIComponent(node.id)}`, { node }),
    saveLibrary: (projectId = "local-default", library = {}) => api("PUT", `/projects/${encodeURIComponent(projectId)}/library`, library),
    delete: (projectId = "local-default") => api("DELETE", `/projects/${encodeURIComponent(projectId)}`),
    storageSettings: () => api("GET", "/settings/project-storage"),
    setStoragePath: (folderPath) => api("POST", "/settings/project-storage", { path: folderPath }),
  },
  asset: {
    list: (query = {}) => api("GET", `/assets${queryString(query)}`),
    delete: (assetId) => api("DELETE", `/assets/${encodeURIComponent(assetId)}`),
    promote: (assetId, body = {}) => api("POST", `/assets/${encodeURIComponent(assetId)}/promote`, body),
    importFile: (filePath, projectId = "local-default", kind, meta = {}, options = {}) => api("POST", "/assets/import", {
      project_id: projectId,
      file_path: filePath,
      kind,
      meta,
      copy: options.copy,
      defer_copy: options.deferCopy ?? options.defer_copy,
    }),
    writeDataUrl: async (projectId = "local-default", payload = {}) => {
      const record = await api("POST", "/assets/write", {
        project_id: projectId,
        filename: payload.filename || "asset.png",
        data_url: payload.dataUrl || payload.data_url,
        kind: payload.kind,
        mime: payload.mime,
        meta: payload.meta || {},
      });
      const runtime = await ipcRenderer.invoke("libai:runtime");
      return {
        ...record,
        url: runtime.backendBaseUrl ? `${runtime.backendBaseUrl}/assets/${record.id}` : record.assetUrl,
      };
    },
  },
  seedancePortrait: {
    list: () => api("GET", "/seedance/portrait-assets"),
    uploadFilePath: (filePath, options = {}) => api("POST", "/seedance/portrait-assets/from-path", {
      file_path: filePath,
      name: options.name || "",
      description: options.description || "",
    }),
    delete: (assetId) => api("DELETE", `/seedance/portrait-assets/${encodeURIComponent(assetId)}`),
  },
  job: {
    list: (query = {}) => api("GET", `/jobs${queryString({
      project_id: query.projectId || query.project_id,
      kind: query.kind,
      limit: query.limit,
    })}`),
    create: (nodeId, payload = {}) => api("POST", "/jobs", {
      project_id: payload.projectId || payload.project_id || "local-default",
      node_id: nodeId,
      type: payload.type || payload.provider || payload.tab || "image.generate",
      payload,
    }),
    get: (jobId) => api("GET", `/jobs/${encodeURIComponent(jobId)}`),
    cancel: (jobId) => api("POST", `/jobs/${encodeURIComponent(jobId)}/cancel`),
    onEvent: (callback) => {
      let closed = false;
      let socket = null;
      ipcRenderer.invoke("libai:runtime").then((runtime) => {
        if (closed || !runtime?.backendBaseUrl) return;
        socket = new WebSocket(wsUrl(runtime.backendBaseUrl, "/jobs/events"));
        socket.onmessage = (event) => {
          try {
            callback(JSON.parse(event.data));
          } catch (error) {
            callback({ type: "raw", data: event.data });
          }
        };
      });
      return () => {
        closed = true;
        if (socket) socket.close();
      };
    },
  },
  history: {
    list: (projectId = "local-default", query = {}) => api("GET", `/history/project/${encodeURIComponent(projectId)}${queryString(query)}`),
    create: (body = {}) => api("POST", "/history", body),
    update: (historyId, body = {}) => api("PUT", `/history/${encodeURIComponent(historyId)}`, body),
    delete: (historyId) => api("DELETE", `/history/${encodeURIComponent(historyId)}`),
    clearProject: (projectId = "local-default", query = {}) => api("DELETE", `/history/project/${encodeURIComponent(projectId)}${queryString(query)}`),
  },
  registry: {
    nodes: () => api("GET", "/registry/nodes"),
  },
  provider: {
    list: () => api("GET", "/providers"),
    create: (body) => api("POST", "/providers", body),
    update: (providerId, body) => api("PUT", `/providers/${encodeURIComponent(providerId)}`, body),
    test: (providerId) => api("POST", `/providers/${encodeURIComponent(providerId)}/test`),
    models: (query = {}) => api("GET", `/provider-models${queryString(query)}`),
    createModel: (body) => api("POST", "/provider-models", body),
    updateModel: (modelId, body) => api("PUT", `/provider-models/${encodeURIComponent(modelId)}`, body),
    deleteModel: (modelId) => api("DELETE", `/provider-models/${encodeURIComponent(modelId)}`),
  },
  newapi: {
    account: () => api("GET", "/newapi/account"),
    login: (body) => api("POST", "/newapi/login", body),
    register: (body) => api("POST", "/newapi/register", body),
    sendVerification: (body) => api("POST", "/newapi/verification", body),
    logout: () => api("POST", "/newapi/logout"),
    refresh: () => api("POST", "/newapi/refresh"),
    models: () => api("GET", "/newapi/models"),
    tokens: () => api("GET", "/newapi/tokens"),
    consumption: (query = {}) => api("GET", `/newapi/consumption${queryString(query)}`),
    usageLogs: (query = {}) => api("GET", `/newapi/usage-logs${queryString(query)}`),
    createToken: (body) => api("POST", "/newapi/tokens", body),
    setDefaultKey: (body) => api("POST", "/newapi/default-key", body),
    setDefaultToken: (tokenId) => api("POST", `/newapi/tokens/${encodeURIComponent(tokenId)}/default`),
    deleteToken: (tokenId) => api("DELETE", `/newapi/tokens/${encodeURIComponent(tokenId)}`),
    redeem: (body) => api("POST", "/newapi/redeem", body),
  },
  prompt: {
    list: (query = {}) => api("GET", `/prompts${queryString(query)}`),
    create: (body) => api("POST", "/prompts", body),
    update: (promptId, body) => api("PUT", `/prompts/${encodeURIComponent(promptId)}`, body),
    delete: (promptId) => api("DELETE", `/prompts/${encodeURIComponent(promptId)}`),
  },
  jianying: {
    settings: () => api("GET", "/jianying/settings"),
    saveSettings: (body) => api("POST", "/jianying/settings", body),
    autoDetect: () => api("POST", "/jianying/drafts-root/auto"),
    exportDraft: (body) => api("POST", "/jianying/export", body),
  },
};

contextBridge.exposeInMainWorld("libai", libai);
