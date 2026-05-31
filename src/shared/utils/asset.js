/* Asset / project / history record factories + node→asset payload helper */
import { safeFileName } from './file.js';

export const DEFAULT_PROJECT_ID = "local-default";

export function makeProject(name = "未命名", id = DEFAULT_PROJECT_ID) {
  const now = new Date().toISOString();
  return {
    id,
    name: name || "未命名",
    createdAt: now,
    updatedAt: now,
  };
}

export function makeProjectId(name) {
  const base = String(name || "project")
    .trim()
    .replace(/[^\w一-龥-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "project";
  return "project_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

export function makeProjectSummary(project, nodes = [], edges = [], assets = [], history = []) {
  const assetList = Array.isArray(assets) ? assets : [];
  const countKind = (kind) => assetList.filter((asset) => String(asset?.kind || asset?.mediaKind || '').toLowerCase() === kind).length;
  return {
    ...(project || makeProject()),
    nodeCount: nodes.length,
    edgeCount: edges.length,
    assetCount: assetList.length,
    imageCount: countKind('image'),
    videoCount: countKind('video'),
    historyCount: history.length,
  };
}

export function makeAssetRecord({ kind, src, title, nodeId, source = "generated", prompt, ...extra }) {
  return {
    id: "asset_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
    kind,
    src,
    url: src,
    title: title || "未命名素材",
    nodeId,
    source,
    prompt: prompt || "",
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

export function makeHistoryRecord(asset) {
  return {
    id: "hist_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
    assetId: asset.id,
    kind: asset.kind,
    src: asset.src,
    url: asset.url || asset.src || asset.assetUrl || "",
    assetUrl: asset.assetUrl || asset.src || asset.url || "",
    title: asset.title,
    nodeId: asset.nodeId,
    jobId: asset.jobId || "",
    status: asset.status || "completed",
    progress: asset.progress ?? 100,
    prompt: asset.prompt || "",
    source: asset.source || "",
    action: asset.action || "asset.record",
    model: asset.model || "",
    modelName: asset.modelName || "",
    provider: asset.provider || "",
    projectId: asset.projectId || asset.project_id || asset.meta?.projectId || asset.meta?.project_id || "",
    project_id: asset.project_id || asset.projectId || asset.meta?.project_id || asset.meta?.projectId || "",
    assetPath: asset.assetPath || asset.path || "",
    assetScope: asset.assetScope || asset.libraryScope || asset.scope || asset.meta?.scope || "",
    libraryScope: asset.libraryScope || asset.assetScope || asset.scope || asset.meta?.scope || "",
    createdAt: asset.createdAt || new Date().toISOString(),
    updatedAt: asset.updatedAt || asset.createdAt || new Date().toISOString(),
    time: new Date().toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(/\//g, "-"),
  };
}

export function getNodeAssetPayload(node) {
  if (!node) return null;
  const title = node.title || node.id || "未命名素材";
  const common = {
    assetId: node.assetId || "",
    assetUrl: node.assetUrl || "",
    assetPath: node.assetPath || node.localPath || node.path || "",
    mime: node.mime || "",
  };
  if (node.type === "image" && (node.src || node.url || node.assetUrl || node.imageUrl || node.assetPath)) {
    const src = node.src || node.url || node.assetUrl || node.imageUrl || node.assetPath;
    return {
      ...common,
      kind: "image",
      mediaKind: "image",
      src,
      url: node.url || src,
      assetUrl: node.assetUrl || node.url || src,
      title,
      filename: `${safeFileName(title, "image")}.jpg`,
    };
  }
  if (node.type === "vr720-gen" && node.settings?.imageUrl) {
    return { ...common, kind: "image", mediaKind: "image", src: node.settings.imageUrl, url: node.settings.imageUrl, title, filename: `${safeFileName(title, "panorama")}.jpg` };
  }
  if (node.type === "panorama-viewer" && node.settings?.panoramaImageUrl) {
    return { ...common, kind: "image", mediaKind: "image", src: node.settings.panoramaImageUrl, url: node.settings.panoramaImageUrl, title, filename: `${safeFileName(title, "panorama-viewer")}.jpg` };
  }
  if (node.type === "asset-gen" && (node.imageUrl || node.src)) {
    return {
      ...common,
      kind: "image",
      mediaKind: "image",
      src: node.imageUrl || node.src,
      url: node.imageUrl || node.src,
      assetUrl: node.assetUrl || node.imageUrl || node.src,
      title,
      filename: `${safeFileName(title, "asset")}.jpg`,
    };
  }
  if (node.type === "video") {
    const videoSrc = node.videoSrc || node.videoUrl || node.assetUrl || node.assetPath;
    if (videoSrc) return { ...common, kind: "video", mediaKind: "video", src: videoSrc, url: node.videoUrl || videoSrc, assetUrl: node.assetUrl || node.videoUrl || videoSrc, title, filename: `${safeFileName(title, "video")}.mp4` };
    if (node.poster) return { ...common, kind: "video", mediaKind: "image", src: node.poster, url: node.poster, assetUrl: node.assetUrl || node.poster, title, filename: `${safeFileName(title, "video-poster")}.jpg` };
  }
  if (node.type === "audio" && node.audioSrc) {
    return { ...common, kind: "audio", mediaKind: "audio", src: node.audioSrc, url: node.audioSrc, assetUrl: node.assetUrl || node.audioSrc, title, filename: `${safeFileName(title, "audio")}.mp3` };
  }
  if (node.type === "text") {
    const text = node.body || "";
    return {
      kind: "text",
      mediaKind: "text",
      src: `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
      text,
      title,
      filename: `${safeFileName(title, "text")}.txt`,
    };
  }
  if (node.type === "script") {
    const text = JSON.stringify(node.shots || [], null, 2);
    return {
      kind: "script",
      mediaKind: "text",
      src: `data:application/json;charset=utf-8,${encodeURIComponent(text)}`,
      text,
      title,
      filename: `${safeFileName(title, "script")}.json`,
    };
  }
  return null;
}
