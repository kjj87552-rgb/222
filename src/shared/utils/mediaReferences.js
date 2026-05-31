export const MEDIA_REFERENCE_KINDS = ["image", "video", "audio"];

export const MEDIA_KIND_LABELS = {
  image: "图片",
  video: "视频",
  audio: "音频",
};

export function getMediaKind(asset) {
  const kind = String(asset?.kind || asset?.type || "").toLowerCase();
  if (MEDIA_REFERENCE_KINDS.includes(kind)) return kind;
  const mime = String(asset?.mime || asset?.contentType || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "";
}

export function isMediaAsset(asset) {
  return Boolean(getMediaKind(asset) && getMediaSrc(asset));
}

export function getMediaSrc(asset) {
  return asset?.src || asset?.url || asset?.assetUrl || "";
}

export function getMediaThumbnailSrc(asset) {
  const kind = getMediaKind(asset);
  return asset?.thumbUrl
    || asset?.thumbnailUrl
    || asset?.thumbnail
    || asset?.thumb
    || asset?.preview
    || asset?.posterUrl
    || asset?.poster
    || (kind === "image" && asset?.id ? `/assets/${encodeURIComponent(asset.id)}/thumb` : "")
    || "";
}

export function getMediaTitle(asset) {
  const raw = asset?.title || asset?.name || asset?.filename || asset?.id || "未命名素材";
  return String(raw).replace(/\.[^.]+$/, "").trim() || "未命名素材";
}

export function makeMediaToken(asset) {
  const kind = getMediaKind(asset) || "media";
  const fallback = MEDIA_KIND_LABELS[kind] || "素材";
  const text = getMediaTitle(asset)
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .replace(/[，。！？、：；"'“”‘’()[\]{}<>|\\/#?]+/g, "")
    .slice(0, 24);
  return `@${text || fallback}`;
}

export function toMediaReference(asset) {
  const kind = getMediaKind(asset);
  const src = getMediaSrc(asset);
  const title = getMediaTitle(asset);
  return {
    id: asset?.id || src || `${kind}_${title}`,
    kind,
    src,
    title,
    token: asset?.token || makeMediaToken(asset),
    source: asset?.source,
    assetPath: asset?.assetPath || asset?.path,
    thumb: asset?.thumb,
    thumbUrl: asset?.thumbUrl,
    thumbnail: asset?.thumbnail,
    thumbnailUrl: asset?.thumbnailUrl,
    preview: asset?.preview,
    poster: asset?.poster,
    posterUrl: asset?.posterUrl,
  };
}

export function mergeMediaReference(existing = [], asset) {
  const ref = toMediaReference(asset);
  if (!ref.kind || !ref.src) return existing;
  const next = Array.isArray(existing) ? [...existing] : [];
  const index = next.findIndex((item) => item.id === ref.id || item.src === ref.src);
  if (index >= 0) next[index] = { ...next[index], ...ref };
  else next.push(ref);
  return next.slice(-12);
}

export function removeMediaReference(existing = [], ref) {
  return (Array.isArray(existing) ? existing : []).filter((item) => (
    item.id !== ref?.id && item.src !== ref?.src && item.token !== ref?.token
  ));
}

export function findActiveMediaMention(value, cursor) {
  const text = String(value || "");
  const pos = Number.isFinite(cursor) ? cursor : text.length;
  const before = text.slice(0, pos);
  const atIndex = Math.max(before.lastIndexOf("@"), before.lastIndexOf("＠"));
  if (atIndex < 0) return null;
  const query = before.slice(atIndex + 1);
  if (/[\s@＠]/u.test(query)) return null;
  return {
    start: atIndex,
    end: pos,
    query,
  };
}

export function insertMediaToken(value, token, mention) {
  const text = String(value || "");
  const refToken = String(token || "").startsWith("@") ? String(token) : `@${token}`;
  const start = mention ? mention.start : text.length;
  const end = mention ? mention.end : text.length;
  const before = text.slice(0, start);
  const after = text.slice(end);
  const prefix = before && !/\s$/.test(before) ? " " : "";
  const suffix = after && /^\s/.test(after) ? "" : " ";
  const next = `${before}${prefix}${refToken}${suffix}${after}`;
  return {
    value: next,
    caret: (before + prefix + refToken + suffix).length,
  };
}

export function removeMediaMentionText(value, mention) {
  const text = String(value || "");
  if (!mention) return { value: text, caret: text.length };
  const start = Math.max(0, Math.min(text.length, Number(mention.start) || 0));
  const end = Math.max(start, Math.min(text.length, Number(mention.end) || start));
  const before = text.slice(0, start).replace(/\s+$/u, "");
  const after = text.slice(end).replace(/^\s+/u, "");
  const glue = before && after ? " " : "";
  const next = `${before}${glue}${after}`;
  return {
    value: next,
    caret: Math.min(next.length, (before + glue).length),
  };
}
