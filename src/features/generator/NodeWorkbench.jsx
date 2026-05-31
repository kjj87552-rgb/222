/* Node-level generation workbench — floats below a selected canvas node */
import React from 'react';
import {
  IAdd, IBox, ISearch, IGrid9, ICamera, IFolder, IClose,
  IVideo, ISparkle, IChevD, IAudio, IText, IGear, IMagic,
  IArrow, ICheck, IImage,
} from '../../shared/ui/icons/index.jsx';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { AssetStore } from '../../shared/platform/assetStore.js';
import { ProviderStore } from '../../shared/platform/providerStore.js';
import { capabilityForGeneration } from '../../shared/platform/generationPayload.js';
import {
  durationOptionsForModel,
  includeGenerateAudioForModel,
  includeResolutionForModel,
  includeSeedanceModeForModel,
  maxReferenceAudiosForModel,
  maxReferenceImagesForModel,
  maxReferenceVideosForModel,
  modelParams,
  normalizeSeedanceModeForModel,
  normalizeVideoModeForModel,
  referenceModeForVideoMode,
  ratioOptionsForModel,
  resolutionOptionsForModel,
  seedanceModeOptionsForModel,
  supportsVideoReferenceForModel,
  VIDEO_MODE_OPTIONS,
  videoModeOptionsForModel,
} from '../../shared/platform/generationModelParams.js';
import { GENERATION_PARAMETER_UPDATE_SOURCE } from './nodeParameterDefaults.js';
import { modelLabel, modelMatchesLabel, selectBackendModel } from '../../shared/platform/modelSelection.js';
import { DEFAULT_PROJECT_ID, makeAssetRecord } from '../../shared/utils/asset.js';
import { readFileAsDataUrl } from '../../shared/utils/file.js';
import { importLocalFileAsAsset } from '../../shared/utils/uploadHelpers.js';
import {
  MEDIA_KIND_LABELS,
  findActiveMediaMention,
  getMediaKind,
  getMediaSrc,
  getMediaThumbnailSrc,
  getMediaTitle,
  isMediaAsset,
  makeMediaToken,
  mergeMediaReference,
  removeMediaReference,
} from '../../shared/utils/mediaReferences.js';
import { withProjectAssetScope } from '../../shared/utils/assetScopes.js';
import { useRegisterCanvasElement } from '../canvas/canvasElementRegistry.js';

const IMAGE_UPLOAD_ACCEPT = "image/*";
const MEDIA_UPLOAD_ACCEPT = "image/*,video/*,audio/*";
const IMAGE_PICK_FILTERS = [
  { name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "gif", "avif", "bmp"] },
];
const MEDIA_PICK_FILTERS = [
  { name: "Media", extensions: ["png", "jpg", "jpeg", "webp", "gif", "avif", "bmp", "mp4", "mov", "webm", "mkv", "avi", "m4v", "mp3", "wav", "m4a", "flac", "ogg", "aac"] },
];
const AUDIO_UPLOAD_ACCEPT = "audio/*";
const SEEDANCE_REFERENCE_PREFIX = { image: "图片", video: "视频", audio: "音频" };
const SEEDANCE_REFERENCE_KINDS = ["image", "video", "audio"];
const SEEDANCE_MODEL_IDS = [
  "seedance-2.0-fast",
  "seedance-2.0-pro",
  "seedance-2-0",
  "seedance-2-0-fast",
  "seedance-2-0-pro",
  "sora-3-fast",
  "sora-3-pro",
];
const XINGHE_SEEDANCE_STYLE_MODEL_IDS = [
  "sora-v3-fast",
  "sora-v3-pro",
  "seedence2-fast",
  "seedence2-pro",
  "seedence2-fast（特价版1）",
  "seedence2-pro（特价版1）",
  "seedence2-fast（特价版2）",
  "seedence2-pro（特价版2）",
  "seedence2.0-720（满血）",
  "sora-vip3-pro-720p",
  "sora-vip3-pro-1080p",
  "真人人脸即梦满血版",
];
const SEEDANCE_PORTRAIT_MODEL_IDS = [
  "seedance-2-0-pro",
  "seedance-2-0-fast",
];
const MUSE_VIDEO_MODEL_IDS = [
  "seedence2.0-m-c",
  "seedence2.0fast-m-c",
  "seedence2.0-real-person-m-c",
  "seedence2.0-company-m-c",
  "seedence2.0人脸-m-c",
  "seedence2.0企业-m-c",
];
const MENTION_MENU_WIDTH = 148;
const MENTION_MENU_ESTIMATED_HEIGHT = 116;
const MENTION_MENU_GAP = 6;
const PROMPT_MENTION_ICON_SPACE = "\u3000";
const PROMPT_TEXTAREA_DEFAULT_HEIGHT = 132;
const PROMPT_TEXTAREA_MIN_HEIGHT = 132;

function seedanceReferenceLabel(kind, index) {
  const prefix = SEEDANCE_REFERENCE_PREFIX[kind] || "素材";
  return `${prefix}${index}`;
}

function buildOrdinalReferenceItems(refs = []) {
  const counters = { image: 0, video: 0, audio: 0 };
  return (Array.isArray(refs) ? refs : [])
    .filter((asset) => isMediaAsset(asset))
    .map((asset) => {
      const kind = getMediaKind(asset) || "image";
      counters[kind] = (counters[kind] || 0) + 1;
      const label = seedanceReferenceLabel(kind, counters[kind]);
      return {
        asset,
        kind,
        index: counters[kind],
        label,
        token: `@${label}`,
      };
    });
}

function sameMediaReference(a, b) {
  if (!a || !b) return false;
  const aId = String(a.id || "").trim();
  const bId = String(b.id || "").trim();
  if (aId && bId && aId === bId) return true;
  const aSrc = getMediaSrc(a);
  const bSrc = getMediaSrc(b);
  return Boolean(aSrc && bSrc && aSrc === bSrc);
}

function ordinalTokenForAsset(asset, ordinalItems = []) {
  return ordinalItems.find((item) => sameMediaReference(item.asset, asset))?.token || "";
}

function isSeedanceModel(model) {
  const values = [model?.id, model?.modelName, model?.displayName]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
  const params = model?.params && typeof model.params === "object" ? model.params : {};
  if (String(params.videoProtocol || "").trim().toLowerCase() === "muse_video") return true;
  const protocol = String(params.videoProtocol || "").trim().toLowerCase();
  return values.some((value) => (
    SEEDANCE_MODEL_IDS.includes(value)
    || MUSE_VIDEO_MODEL_IDS.includes(value)
    || value.startsWith("seedence2.0")
    || (protocol === "public_video_api" && XINGHE_SEEDANCE_STYLE_MODEL_IDS.includes(value))
  ));
}

function isSeedancePortraitModel(model) {
  const values = [model?.id, model?.modelName, model?.displayName]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
  return values.some((value) => SEEDANCE_PORTRAIT_MODEL_IDS.includes(value));
}

function seedancePortraitAssetRef(asset) {
  const assetRef = String(asset?.assetRef || asset?.asset_ref || "").trim();
  if (assetRef) return assetRef;
  const assetId = String(asset?.assetId || asset?.asset_id || asset?.id || "").trim();
  return assetId ? `asset://${assetId}` : "";
}

function seedancePortraitAssetId(asset) {
  const assetId = String(asset?.assetId || asset?.asset_id || asset?.id || "").trim();
  if (assetId) return assetId;
  return seedancePortraitAssetRef(asset).replace(/^asset:\/\//, "");
}

function seedancePortraitAssetTitle(asset) {
  return String(asset?.name || asset?.title || asset?.filename || seedancePortraitAssetId(asset) || "角色图").trim();
}

function seedancePortraitMentionToken(asset) {
  const text = seedancePortraitAssetTitle(asset)
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .replace(/[，。！？、：；"'“”‘’()[\]{}<>|\\/#?]+/g, "")
    .slice(0, 24);
  return `@${text || seedancePortraitAssetId(asset) || "角色"}`;
}

function seedancePortraitAssetImage(asset) {
  const raw = [
    asset?.localPreviewUrl,
    asset?.local_preview_url,
    asset?.previewUrl,
    asset?.preview_url,
    asset?.preview,
    asset?.src,
    asset?.url,
  ]
    .map((value) => String(value || "").trim())
    .find((value) => value && !/^asset:\/\//i.test(value));
  return raw ? makeAssetUrl({ src: raw, url: raw }) : "";
}

function normalizeSeedancePortraitAsset(asset) {
  const assetId = seedancePortraitAssetId(asset);
  const assetRef = seedancePortraitAssetRef(asset) || (assetId ? `asset://${assetId}` : "");
  if (!assetId || !assetRef) return null;
  return {
    ...asset,
    assetId,
    asset_id: assetId,
    assetRef,
    asset_ref: assetRef,
    name: seedancePortraitAssetTitle(asset),
    url: seedancePortraitAssetImage(asset),
    status: asset?.status || "",
  };
}

function normalizeSeedancePortraitAssets(assets) {
  const seen = new Set();
  return (Array.isArray(assets) ? assets : []).map(normalizeSeedancePortraitAsset).filter((asset) => {
    if (!asset || seen.has(asset.assetId)) return false;
    seen.add(asset.assetId);
    return true;
  });
}

function mergeSeedancePortraitAssets(primary = [], secondary = []) {
  return normalizeSeedancePortraitAssets([...primary, ...secondary]);
}

function shouldRenderDurationSlider(model, options) {
  return isSeedanceModel(model) && Array.isArray(options) && options.length > 6;
}

function closestDurationOption(value, options) {
  const numericValue = Number(value);
  if (!Array.isArray(options) || !options.length || !Number.isFinite(numericValue)) {
    return numericValue;
  }
  return options.reduce((closest, option) => (
    Math.abs(option - numericValue) < Math.abs(closest - numericValue) ? option : closest
  ), options[0]);
}

function cssPixel(value, fallback = 0) {
  const number = Number.parseFloat(String(value || ""));
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
}

function fallbackTextareaCaretRect(textarea, offset) {
  const view = textarea.ownerDocument?.defaultView || window;
  const computed = view.getComputedStyle?.(textarea) || {};
  const rect = textarea.getBoundingClientRect?.() || { left: 0, top: 0, width: 0 };
  const fontSize = cssPixel(computed.fontSize, 13);
  const lineHeight = cssPixel(computed.lineHeight, fontSize * 1.35);
  const paddingLeft = cssPixel(computed.paddingLeft, 0);
  const paddingTop = cssPixel(computed.paddingTop, 0);
  const text = String(textarea.value || "").slice(0, Math.max(0, offset));
  const lines = text.split("\n");
  const lineIndex = Math.max(0, lines.length - 1);
  const charWidth = fontSize * 0.58;
  return {
    left: rect.left + paddingLeft + (lines[lineIndex] || "").length * charWidth - (textarea.scrollLeft || 0),
    top: rect.top + paddingTop + lineIndex * lineHeight - (textarea.scrollTop || 0),
    height: lineHeight,
  };
}

function textareaCaretRect(textarea, offset) {
  const doc = textarea.ownerDocument || document;
  const view = doc.defaultView || window;
  const computed = view.getComputedStyle?.(textarea);
  if (!computed || !doc.body) return fallbackTextareaCaretRect(textarea, offset);

  const textareaRect = textarea.getBoundingClientRect?.() || { left: 0, top: 0, width: 0 };
  const mirror = doc.createElement("div");
  const span = doc.createElement("span");
  const width = textarea.clientWidth || textareaRect.width || 1;
  const style = mirror.style;
  style.position = "absolute";
  style.visibility = "hidden";
  style.pointerEvents = "none";
  style.left = "-9999px";
  style.top = "0";
  style.width = `${width}px`;
  style.boxSizing = computed.boxSizing;
  style.whiteSpace = "pre-wrap";
  style.overflowWrap = "break-word";
  style.wordBreak = computed.wordBreak;
  style.font = computed.font;
  style.letterSpacing = computed.letterSpacing;
  style.textTransform = computed.textTransform;
  style.textIndent = computed.textIndent;
  style.tabSize = computed.tabSize;
  style.padding = computed.padding;
  style.border = computed.border;

  const before = String(textarea.value || "").slice(0, Math.max(0, offset));
  mirror.textContent = before || "\u200b";
  span.textContent = "\u200b";
  mirror.appendChild(span);
  doc.body.appendChild(mirror);

  const mirrorRect = mirror.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  const usable = spanRect.width || spanRect.height || spanRect.left || spanRect.top;
  mirror.remove();
  if (!usable) return fallbackTextareaCaretRect(textarea, offset);

  return {
    left: textareaRect.left + (spanRect.left - mirrorRect.left) - (textarea.scrollLeft || 0),
    top: textareaRect.top + (spanRect.top - mirrorRect.top) - (textarea.scrollTop || 0),
    height: spanRect.height || cssPixel(computed.lineHeight, cssPixel(computed.fontSize, 13) * 1.35),
  };
}

function textareaMentionMenuStyle(textarea, mention) {
  const box = textarea?.closest?.(".wb-prompt-box");
  if (!textarea || !box || !mention) return null;
  const boxRect = box.getBoundingClientRect?.() || { left: 0, top: 0, width: 0, height: 0 };
  const caret = textareaCaretRect(textarea, mention.end);
  const maxLeft = Math.max(4, (boxRect.width || MENTION_MENU_WIDTH + 8) - MENTION_MENU_WIDTH - 4);
  const left = clampNumber(caret.left - boxRect.left, 4, maxLeft);
  const below = caret.top - boxRect.top + caret.height + MENTION_MENU_GAP;
  const top = below + MENTION_MENU_ESTIMATED_HEIGHT > boxRect.height - 4
    ? Math.max(4, caret.top - boxRect.top - MENTION_MENU_ESTIMATED_HEIGHT - MENTION_MENU_GAP)
    : Math.max(4, below);
  return {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  };
}

function assetAllowedForNode(asset, nodeType) {
  const kind = getMediaKind(asset);
  if (nodeType === "image") return kind === "image" || kind === "video";
  if (nodeType === "video") return kind === "image" || kind === "video" || kind === "audio";
  return false;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePromptMentionIconSpaces(value, mentionItems = []) {
  const text = String(value || "");
  const tokens = (Array.isArray(mentionItems) ? mentionItems : [])
    .filter((item) => item?.token)
    .sort((a, b) => b.token.length - a.token.length);
  if (!text || !tokens.length || !text.includes("@")) return text;

  const parts = [];
  let index = 0;
  let plainStart = 0;
  while (index < text.length) {
    const item = tokens.find((candidate) => text.startsWith(candidate.token, index));
    if (!item) {
      index += 1;
      continue;
    }
    const plain = text.slice(plainStart, index).replace(/[^\S\r\n]+$/u, "");
    parts.push(plain, PROMPT_MENTION_ICON_SPACE, item.token);
    index += item.token.length;
    plainStart = index;
  }
  parts.push(text.slice(plainStart));
  return parts.join("");
}

function insertPromptMentionToken(value, token, mention) {
  const text = String(value || "");
  const refToken = String(token || "").startsWith("@") ? String(token) : `@${token}`;
  const start = mention ? mention.start : text.length;
  const end = mention ? mention.end : text.length;
  const before = text.slice(0, start).replace(/[^\S\r\n]+$/u, "");
  const after = text.slice(end);
  const suffix = after && /^\s/u.test(after) ? "" : " ";
  const next = `${before}${PROMPT_MENTION_ICON_SPACE}${refToken}${suffix}${after}`;
  return {
    value: next,
    caret: (before + PROMPT_MENTION_ICON_SPACE + refToken + suffix).length,
  };
}

function inferMediaKindFromFile(file) {
  const mime = String(file?.type || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  const name = String(file?.name || "").toLowerCase();
  if (/\.(png|jpe?g|webp|gif|avif|bmp|svg)$/.test(name)) return "image";
  if (/\.(mp4|mov|webm|mkv|avi|m4v)$/.test(name)) return "video";
  if (/\.(mp3|wav|m4a|flac|ogg|aac)$/.test(name)) return "audio";
  return "";
}

function probeAudioDurationSeconds(file) {
  if (typeof Audio === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL?.(url);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), 1600);
    audio.onloadedmetadata = () => finish(Number.isFinite(audio.duration) ? audio.duration : null);
    audio.onerror = () => finish(null);
    audio.src = url;
  });
}

function normalizeImportedAsset(asset) {
  const src = getMediaSrc(asset);
  if (!src) return null;
  return {
    ...asset,
    src,
    url: asset.url || src,
    title: asset.title || asset.name || asset.filename || getMediaTitle(asset),
  };
}

function compactString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function listValues(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueCompactStrings(values = []) {
  const seen = new Set();
  return values.map(compactString).filter((value) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function isDisplayableReferenceSource(value) {
  return /^(https?:|data:|blob:|libai-asset:|\/)/i.test(compactString(value));
}

function firstReferenceSource(values = []) {
  const sources = uniqueCompactStrings(values);
  return sources.find(isDisplayableReferenceSource) || sources[0] || "";
}

function referenceSourceCandidates(item) {
  if (!item || typeof item === "string") return [item];
  const source = firstReferenceSource([
    item.src,
    item.url,
    item.assetUrl,
    item.imageUrl,
    item.settings?.imageUrl,
    item.path,
    item.assetPath,
  ]);
  return source ? [source] : [];
}

function finiteCssNumber(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatWorkbenchPositionTransform(x, y) {
  return `translate3d(${finiteCssNumber(x, 0)}px, ${finiteCssNumber(y, 0)}px, 0)`;
}

function ratioShape(value) {
  const shapes = {
    Auto: [18, 14],
    "16:9": [24, 13],
    "4:3": [21, 15],
    "1:1": [17, 17],
    "3:4": [14, 20],
    "9:16": [12, 22],
    "21:9": [27, 10],
  };
  return shapes[value] || [20, 15];
}

function nodeImageReferenceSource(node) {
  if (!node) return "";
  if (node.type === "image") return nodeImageReferenceSources(node)[0] || "";
  if (node.type === "asset-gen") {
    return "";
  }
  if (node.type === "vr720-gen") return compactString(node.settings?.imageUrl || node.imageUrl || node.assetUrl);
  if (node.type === "panorama-viewer") return compactString(node.settings?.panoramaImageUrl || node.imageUrl || node.assetUrl);
  if (node.type === "video") return compactString(node.poster || node.posterUrl || node.thumbnailUrl || node.thumb || node.posterPath);
  return "";
}

function nodeImageReferenceSources(node) {
  if (!node) return [];
  if (node.type !== "image") {
    const src = nodeImageReferenceSource(node);
    return src ? [src] : [];
  }
  const itemSources = [
    ...listValues(node.imageUrls),
    ...listValues(node.images),
    ...listValues(node.assets),
    {
      src: node.src,
      url: node.url,
      assetUrl: node.assetUrl,
      imageUrl: node.imageUrl,
      settings: node.settings,
      assetPath: node.assetPath,
      path: node.path,
    },
  ].flatMap(referenceSourceCandidates);
  return uniqueCompactStrings(itemSources);
}

function nodeFromLookup(lookup, id) {
  if (!id) return null;
  if (typeof lookup?.get === "function") return lookup.get(id) || null;
  if (Array.isArray(lookup)) return lookup.find((item) => item?.id === id) || null;
  return null;
}

function imageReferenceAssetFromNode({ sourceNode, edge, idPrefix = "canvas-edge", relayNodeId = "" }) {
  return imageReferenceAssetsFromNode({ sourceNode, edge, idPrefix, relayNodeId })[0] || null;
}

function imageReferenceAssetsFromNode({ sourceNode, edge, idPrefix = "canvas-edge", relayNodeId = "" }) {
  const sources = nodeImageReferenceSources(sourceNode);
  const seedancePortraitAsset = normalizeSeedancePortraitAsset(sourceNode?.seedancePortraitAsset);
  return sources.map((src, index) => ({
    id: `${idPrefix}:${edge?.id || edge?.from || sourceNode?.id || "edge"}:${sourceNode?.id || "node"}:${index}`,
    kind: "image",
    src,
    url: src,
    thumbUrl: src,
    thumbnailUrl: src,
    assetUrl: sourceNode?.assetUrl,
    assetPath: sourceNode?.assetPath || sourceNode?.path,
    title: sourceNode?.title || "连线参考图",
    source: idPrefix,
    sourceNodeId: sourceNode?.id,
    ...(seedancePortraitAsset ? { seedancePortraitAsset } : {}),
    ...(relayNodeId ? { relayNodeId } : {}),
    edgeId: edge?.id,
  }));
}

function collectAssetGenInputReferences(assetGenNode, nodesById, edges = []) {
  if (!assetGenNode?.id) return [];
  return (edges || [])
    .filter((edge) => edge?.to === assetGenNode.id)
    .flatMap((edge) => imageReferenceAssetsFromNode({
      sourceNode: nodeFromLookup(nodesById, edge.from),
      edge,
      idPrefix: "asset-gen-input",
      relayNodeId: assetGenNode.id,
    }))
    .filter(Boolean);
}

export function collectConnectedImageReferences(nodeId, nodesById = new Map(), edges = []) {
  if (!nodeId) return [];
  const seen = new Set();
  const refs = [];
  (edges || []).forEach((edge) => {
    if (edge?.to !== nodeId) return;
    const sourceNode = nodeFromLookup(nodesById, edge.from);
    const edgeReferences = sourceNode?.type === "asset-gen"
      ? collectAssetGenInputReferences(sourceNode, nodesById, edges)
      : imageReferenceAssetsFromNode({ sourceNode, edge });
    edgeReferences.forEach((asset) => {
      if (!asset?.src || seen.has(asset.src)) return;
      seen.add(asset.src);
      refs.push(asset);
    });
  });
  return refs;
}

function mergeWorkbenchReferences(linkedRefs = [], manualRefs = []) {
  const seen = new Set();
  const refs = [];
  [...linkedRefs, ...manualRefs].forEach((asset) => {
    if (!isMediaAsset(asset)) return;
    const key = getMediaSrc(asset) || asset.id;
    if (!key || seen.has(key)) return;
    seen.add(key);
    refs.push(asset);
  });
  return refs;
}

function iconForKind(kind, size = 15) {
  if (kind === "video") return <IVideo size={size}/>;
  if (kind === "audio") return <IAudio size={size}/>;
  return <IImage size={size}/>;
}

function mediaDisplayUrl(asset, thumbnail = false) {
  const raw = thumbnail ? getMediaThumbnailSrc(asset) : getMediaSrc(asset);
  return raw ? makeAssetUrl({ ...asset, src: raw, url: raw, assetUrl: raw }) : "";
}

function promptHydrateKey(value, refs = []) {
  const refKey = (Array.isArray(refs) ? refs : [])
    .map((entry) => {
      const asset = entry?.asset || entry;
      const token = entry?.token || asset?.token || asset?.promptToken || makeMediaToken(asset);
      return `${token}:${asset?.id || getMediaSrc(asset)}`;
    })
    .join("|");
  return `${value || ""}::${refKey}`;
}

function promptValueFromNode(node = {}) {
  return typeof node.promptDraft === "string" ? node.promptDraft : (node.prompt || "");
}

function workbenchStyleName(style) {
  return String(style?.name || style?.n || style?.styleName || "").trim();
}

function workbenchStyleId(style) {
  const raw = String(style?.id || style?.styleId || "").trim();
  if (!raw) return "";
  return raw.startsWith("stylelib:") ? raw : `stylelib:${raw}`;
}

function workbenchStylePromptFor(style) {
  if (!style) return "";
  if (style.prompt || style.description || style.stylePrompt) {
    return String(style.prompt || style.description || style.stylePrompt || "").trim();
  }
  const name = workbenchStyleName(style);
  const tag = String(style?.tag || "").trim();
  if (!name && !tag) return "";
  return `${name || "所选"}风格，${tag ? `${tag}方向，` : ""}保持统一的色彩、材质、构图和光影语言`;
}

function normalizeWorkbenchStyle(style) {
  if (!style) return null;
  const name = workbenchStyleName(style);
  const prompt = workbenchStylePromptFor(style);
  const id = workbenchStyleId(style) || (name ? `stylelib:${name}` : "");
  if (!id && !name && !prompt) return null;
  return {
    ...style,
    id,
    name,
    prompt,
    thumbnail: style.thumbnail || style.preview || "",
    source: style.source || "style-library",
  };
}

function workbenchStyleFromNode(node = {}) {
  if (node.stylePreset) return normalizeWorkbenchStyle(node.stylePreset);
  if (!node.styleName && !node.stylePrompt) return null;
  return normalizeWorkbenchStyle({
    id: node.styleId || node.style,
    name: node.styleName,
    prompt: node.stylePrompt,
    tag: node.styleTag,
  });
}

function promptInputSyncKeys(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, enabled]) => enabled !== false)
      .map(([key]) => String(key || "").trim())
      .filter(Boolean);
  }
  return [];
}

function isPromptInputSourceNode(node) {
  const type = String(node?.type || "").trim();
  return [
    "text",
    "text.note",
    "text.reason",
    "inference.generate",
    "prompt-runner",
    "prompt.runner",
  ].includes(type);
}

function promptInputSourceText(node) {
  if (!isPromptInputSourceNode(node)) return "";
  const type = String(node?.type || "").trim();
  const values = type === "prompt-runner" || type === "prompt.runner"
    ? [node.output, node.body, node.generatedText]
    : [node.body, node.output, node.finalPrompt, node.promptDraft, node.prompt, node.generatedText];
  return values
    .map((value) => String(value || "").trim())
    .find(Boolean) || "";
}

export function connectedPromptInputs(nodeId, nodesById = new Map(), edges = [], syncedKeys = []) {
  if (!nodeId) return [];
  const synced = new Set(promptInputSyncKeys(syncedKeys));
  const seen = new Set();
  return (edges || [])
    .filter((edge) => edge?.to === nodeId)
    .map((edge) => nodeFromLookup(nodesById, edge.from))
    .filter((source) => {
      const key = String(source?.id || "").trim();
      if (!key || synced.has(key) || seen.has(key)) return false;
      const text = promptInputSourceText(source);
      if (!text) return false;
      seen.add(key);
      return true;
    })
    .map((source) => ({
      key: String(source.id),
      text: promptInputSourceText(source),
    }));
}

function appendPromptInputText(prompt, inputs = []) {
  const base = String(prompt || "").trim();
  const additions = inputs.map((item) => String(item?.text || "").trim()).filter(Boolean);
  return [base, ...additions].filter(Boolean).join("\n\n");
}

export function normalizePromptCompositionValue(value, compositionStart, committedText) {
  const text = String(value || "");
  const data = String(committedText || "");
  const startValue = String(compositionStart?.value || "");
  const rawOffset = Number(compositionStart?.offset);
  if (!text || !Number.isFinite(rawOffset)) return text;

  const offset = Math.max(0, Math.min(rawOffset, startValue.length));
  const before = startValue.slice(0, offset);
  const after = startValue.slice(offset);
  if (!text.startsWith(before)) return text;

  const insertedAndAfter = text.slice(before.length);
  const stripPreinsertedLead = (inserted, tail = after) => {
    if (!inserted || !/[^\x00-\x7F]/.test(inserted)) return null;
    const leadMatch = before.match(/^(.*?)([A-Za-z'`]{1,16})$/u);
    if (!leadMatch) return null;
    const [, prefix, lead] = leadMatch;
    const hasBoundary = !prefix || /[\s([{，。！？、；："'“‘]$/u.test(prefix);
    const likelyLeakedLead = !prefix ? lead.length <= 3 : hasBoundary && lead.length <= 8;
    return likelyLeakedLead ? `${prefix}${inserted}${tail}` : null;
  };

  if (data && /[^\x00-\x7F]/.test(data) && insertedAndAfter.startsWith(data)) {
    const tail = insertedAndAfter.slice(data.length);
    if (tail === after) return stripPreinsertedLead(data, tail) || text;
    return text;
  }

  if (data && /[^\x00-\x7F]/.test(data)) {
    const dataIndex = insertedAndAfter.indexOf(data);
    if (dataIndex > 0 && dataIndex <= 32) {
      const leakedLead = insertedAndAfter.slice(0, dataIndex);
      const tail = insertedAndAfter.slice(dataIndex + data.length);
      if (/^[A-Za-z'`\s]+$/.test(leakedLead) && tail === after) return `${before}${data}${after}`;
    }
  }

  if (!after || insertedAndAfter.endsWith(after)) {
    const inserted = after ? insertedAndAfter.slice(0, -after.length) : insertedAndAfter;
    const stripped = stripPreinsertedLead(inserted, after);
    if (stripped) return stripped;
    const match = inserted.match(/^([A-Za-z'`\s]{1,32})([^\x00-\x7F].*)$/u);
    if (match) return `${before}${match[2]}${after}`;
  }

  return text;
}

function promptTokenMap(refs = []) {
  const map = new Map();
  (Array.isArray(refs) ? refs : []).forEach((asset) => {
    if (!asset) return;
    const tokens = [asset.token, asset.promptToken, makeMediaToken(asset)].filter(Boolean);
    tokens.forEach((token) => {
      const clean = String(token || "").trim();
      if (clean) map.set(clean.startsWith("@") ? clean : `@${clean}`, asset);
    });
  });
  return map;
}

function addPromptMentionItem(map, token, asset, kindOverride = "") {
  const clean = String(token || "").trim();
  if (!clean || !asset) return;
  const normalized = clean.startsWith("@") ? clean : `@${clean}`;
  map.set(normalized, {
    token: normalized,
    asset,
    kind: kindOverride || getMediaKind(asset) || "image",
  });
}

function buildPromptMentionItems(refs = [], portraitAssets = [], ordinalItems = []) {
  const map = new Map();
  (Array.isArray(refs) ? refs : []).forEach((asset) => {
    if (!asset) return;
    [
      asset.token,
      asset.promptToken,
      asset.sourceToken,
      asset.sourcePromptToken,
      asset.tag,
      makeMediaToken(asset),
    ].forEach((token) => {
      addPromptMentionItem(map, token, asset);
    });
  });
  (Array.isArray(ordinalItems) ? ordinalItems : []).forEach((item) => {
    addPromptMentionItem(map, item?.token, item?.asset, item?.kind);
  });
  (Array.isArray(portraitAssets) ? portraitAssets : []).forEach((asset) => {
    const token = seedancePortraitMentionToken(asset);
    const src = seedancePortraitAssetImage(asset);
    const previewAsset = {
      ...asset,
      kind: "image",
      src,
      url: src,
      title: seedancePortraitAssetTitle(asset),
    };
    addPromptMentionItem(map, token, previewAsset, "portrait");
  });
  return Array.from(map.values()).sort((a, b) => b.token.length - a.token.length);
}

function renderPromptHighlightParts(value, mentionItems = [], handlers = {}) {
  const { onTokenMouseDown, onTokenMouseEnter, onTokenMouseLeave, onTokenMouseMove } = handlers || {};
  const text = String(value || "");
  const tokens = (Array.isArray(mentionItems) ? mentionItems : [])
    .filter((item) => item?.token && item?.asset)
    .sort((a, b) => b.token.length - a.token.length);
  if (!text) return ["\u200b"];
  if (!tokens.length || !text.includes("@")) return [text];

  const parts = [];
  let index = 0;
  let plainStart = 0;
  let key = 0;
  while (index < text.length) {
    const item = tokens.find((candidate) => text.startsWith(candidate.token, index));
    if (!item) {
      index += 1;
      continue;
    }
    const hasIconSpace = index > plainStart && text[index - 1] === PROMPT_MENTION_ICON_SPACE;
    const tokenStart = hasIconSpace ? index - 1 : index;
    if (plainStart < tokenStart) {
      parts.push(text.slice(plainStart, tokenStart));
    }
    parts.push(
      <span
        key={`${item.token}-${index}-${key++}`}
        className="wb-prompt-mention-token"
        data-token={item.token}
        data-kind={item.kind}
        title={`${getMediaTitle(item.asset)} ${item.token}`}
        onMouseDown={(event) => onTokenMouseDown?.(event, item, index)}
        onMouseEnter={(event) => onTokenMouseEnter?.(event, item, index)}
        onMouseMove={(event) => onTokenMouseMove?.(event, item, index)}
        onMouseLeave={(event) => onTokenMouseLeave?.(event, item, index)}
        onPointerEnter={(event) => onTokenMouseEnter?.(event, item, index)}
        onPointerMove={(event) => onTokenMouseMove?.(event, item, index)}
        onPointerLeave={(event) => onTokenMouseLeave?.(event, item, index)}
      >
        {hasIconSpace && <span className="wb-prompt-mention-icon-space">{PROMPT_MENTION_ICON_SPACE}</span>}
        {hasIconSpace && <span className="wb-prompt-mention-mini"><MediaReferenceThumb asset={item.asset}/></span>}
        <span className="wb-prompt-mention-label">{item.token}</span>
      </span>,
    );
    index += item.token.length;
    plainStart = index;
  }
  if (plainStart < text.length) parts.push(text.slice(plainStart));
  return parts.length ? parts : ["\u200b"];
}

function promptMentionRanges(value, mentionItems = []) {
  const text = String(value || "");
  const tokens = (Array.isArray(mentionItems) ? mentionItems : [])
    .filter((item) => item?.token)
    .sort((a, b) => b.token.length - a.token.length);
  if (!text || !tokens.length || !text.includes("@")) return [];

  const ranges = [];
  let index = 0;
  while (index < text.length) {
    const item = tokens.find((candidate) => text.startsWith(candidate.token, index));
    if (!item) {
      index += 1;
      continue;
    }
    const start = index > 0 && text[index - 1] === PROMPT_MENTION_ICON_SPACE ? index - 1 : index;
    ranges.push({ start, tokenStart: index, end: index + item.token.length, item });
    index += item.token.length;
  }
  return ranges;
}

function removePromptMentionForKey(value, caret, key, mentionItems = []) {
  if (key !== "Backspace" && key !== "Delete") return null;
  const offset = Number(caret);
  if (!Number.isFinite(offset)) return null;
  const text = String(value || "");
  const range = promptMentionRanges(text, mentionItems).find(({ start, end }) => (
    key === "Backspace"
      ? offset > start && offset <= end
      : offset >= start && offset < end
  ));
  const separatorRange = range || promptMentionRanges(text, mentionItems).find(({ start, end }) => {
    if (key === "Backspace") {
      let after = end;
      while (after < text.length && /\s/u.test(text[after])) after += 1;
      return offset > end && offset <= after;
    }
    let before = start;
    while (before > 0 && /\s/u.test(text[before - 1])) before -= 1;
    return offset >= before && offset < start;
  });
  if (!separatorRange) return null;
  const before = text.slice(0, separatorRange.start).replace(/\s+$/u, "");
  const after = text.slice(separatorRange.end).replace(/^\s+/u, "");
  const glue = before && after ? " " : "";
  const nextValue = `${before}${glue}${after}`;
  return {
    value: nextValue,
    caret: (before + glue).length,
  };
}

function promptEditorMentionMenuStyle(editor) {
  const box = editor?.closest?.(".wb-prompt-box");
  const selection = window.getSelection?.();
  if (!editor || !box || !selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const anchorNode = range.startContainer;
  if (anchorNode !== editor && !editor.contains(anchorNode)) return null;
  const boxRect = box.getBoundingClientRect?.() || { left: 0, top: 0, width: 0, height: 0 };
  const rect = promptEditorCaretRect(editor) || editor.getBoundingClientRect?.();
  const editorRect = editor.getBoundingClientRect?.() || { left: 0, top: 0 };
  const leftBase = Number.isFinite(rect?.left) && rect.left ? rect.left : editorRect.left;
  const topBase = Number.isFinite(rect?.top) && rect.top ? rect.top : editorRect.top;
  const height = Number.isFinite(rect?.height) && rect.height ? rect.height : 18;
  const maxLeft = Math.max(4, (boxRect.width || MENTION_MENU_WIDTH + 8) - MENTION_MENU_WIDTH - 4);
  const left = clampNumber(leftBase - boxRect.left, 4, maxLeft);
  const below = topBase - boxRect.top + height + MENTION_MENU_GAP;
  const top = below + MENTION_MENU_ESTIMATED_HEIGHT > boxRect.height - 4
    ? Math.max(4, topBase - boxRect.top - MENTION_MENU_ESTIMATED_HEIGHT - MENTION_MENU_GAP)
    : Math.max(4, below);
  return {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  };
}

function isUsableDomRect(rect) {
  return Boolean(
    rect
    && Number.isFinite(rect.left)
    && Number.isFinite(rect.top)
    && (rect.width || rect.height || rect.left || rect.top)
  );
}

function promptEditorCaretRect(editor) {
  const selection = window.getSelection?.();
  if (!editor || !selection || selection.rangeCount === 0) return editor?.getBoundingClientRect?.() || null;
  const activeRange = selection.getRangeAt(0);
  const anchorNode = activeRange.startContainer;
  if (anchorNode !== editor && !editor.contains(anchorNode)) return editor.getBoundingClientRect?.() || null;
  if (!activeRange.collapsed) {
    const rect = activeRange.getBoundingClientRect?.();
    return isUsableDomRect(rect) ? rect : editor.getBoundingClientRect?.();
  }

  const offset = promptSelectionOffset(editor);
  const marker = editor.ownerDocument.createElement("span");
  marker.className = "wb-caret-probe";
  marker.textContent = "\u200b";
  marker.setAttribute("aria-hidden", "true");
  marker.style.cssText = "display:inline-block;width:0;height:1em;overflow:hidden;line-height:inherit;vertical-align:baseline;";

  try {
    const probeRange = activeRange.cloneRange();
    probeRange.insertNode(marker);
    const markerRect = marker.getBoundingClientRect?.();
    const parent = marker.parentNode;
    marker.remove();
    parent?.normalize?.();
    if (Number.isFinite(offset)) setPromptSelectionOffset(editor, offset);
    if (isUsableDomRect(markerRect)) return markerRect;
  } catch {
    marker.remove?.();
  }

  const rect = activeRange.getBoundingClientRect?.();
  return isUsableDomRect(rect) ? rect : editor.getBoundingClientRect?.();
}

function serializedNodeLength(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.length || 0;
  if (node instanceof HTMLElement) {
    if (node.dataset.mediaToken) return node.dataset.mediaToken.length;
    if (node.tagName === "BR") return 1;
  }
  return Array.from(node.childNodes || []).reduce((total, child) => total + serializedNodeLength(child), 0);
}

function serializePromptEditor(container) {
  let result = "";
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || "";
      return;
    }
    if (!(node instanceof HTMLElement)) {
      node.childNodes?.forEach(walk);
      return;
    }
    if (node.dataset.mediaToken) {
      result += node.dataset.mediaToken;
      return;
    }
    if (node.tagName === "BR") {
      result += "\n";
      return;
    }
    const isBlock = node !== container && /^(DIV|P)$/i.test(node.tagName);
    if (isBlock && result && !result.endsWith("\n")) result += "\n";
    node.childNodes.forEach(walk);
    if (isBlock && result && !result.endsWith("\n")) result += "\n";
  };
  container.childNodes.forEach(walk);
  return result.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n");
}

function promptSelectionOffset(container) {
  const selection = window.getSelection?.();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const anchorNode = range.startContainer;
  if (anchorNode !== container && !container.contains(anchorNode)) return null;
  let offset = 0;
  let found = false;

  const visit = (node) => {
    if (found) return true;
    if (node === anchorNode) {
      if (node.nodeType === Node.TEXT_NODE) {
        offset += range.startOffset;
      } else {
        const children = Array.from(node.childNodes || []).slice(0, range.startOffset);
        offset += children.reduce((total, child) => total + serializedNodeLength(child), 0);
      }
      found = true;
      return true;
    }
    if (node instanceof HTMLElement && node.dataset.mediaToken) {
      offset += node.dataset.mediaToken.length;
      return false;
    }
    if (node instanceof HTMLElement && node.tagName === "BR") {
      offset += 1;
      return false;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      offset += node.textContent?.length || 0;
      return false;
    }
    return Array.from(node.childNodes || []).some(visit);
  };

  visit(container);
  return found ? offset : null;
}

function setPromptSelectionOffset(container, targetOffset) {
  const selection = window.getSelection?.();
  if (!selection || !container) return;
  const range = document.createRange();
  let remaining = Math.max(0, Number(targetOffset) || 0);
  let placed = false;

  const placeAfter = (node) => {
    range.setStartAfter(node);
    range.collapse(true);
    placed = true;
  };
  const visit = (node) => {
    if (placed) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.textContent?.length || 0;
      if (remaining <= length) {
        range.setStart(node, remaining);
        range.collapse(true);
        placed = true;
        return;
      }
      remaining -= length;
      return;
    }
    if (node instanceof HTMLElement && node.dataset.mediaToken) {
      if (remaining <= 0) {
        range.setStartBefore(node);
        range.collapse(true);
        placed = true;
        return;
      }
      if (remaining <= node.dataset.mediaToken.length) {
        placeAfter(node);
        return;
      }
      remaining -= node.dataset.mediaToken.length;
      return;
    }
    if (node instanceof HTMLElement && node.tagName === "BR") {
      if (remaining <= 1) {
        placeAfter(node);
        return;
      }
      remaining -= 1;
      return;
    }
    Array.from(node.childNodes || []).forEach(visit);
  };

  Array.from(container.childNodes || []).forEach(visit);
  if (!placed) {
    range.selectNodeContents(container);
    range.collapse(false);
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

export function placePromptCaretFromPoint(container, clientX, clientY) {
  if (!container || typeof document === "undefined") return false;
  const makeRange = () => {
    if (typeof document.caretRangeFromPoint === "function") {
      return document.caretRangeFromPoint(clientX, clientY);
    }
    if (typeof document.caretPositionFromPoint === "function") {
      const position = document.caretPositionFromPoint(clientX, clientY);
      if (!position?.offsetNode) return null;
      const nextRange = document.createRange();
      nextRange.setStart(position.offsetNode, position.offset);
      nextRange.collapse(true);
      return nextRange;
    }
    return null;
  };
  const range = makeRange();
  if (!range) return false;
  const start = range.startContainer;
  if (start !== container && !container.contains(start)) return false;
  const selection = window.getSelection?.();
  if (!selection) return false;
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function usableTextRect(rect) {
  return Boolean(
    rect
    && Number.isFinite(rect.left)
    && Number.isFinite(rect.right)
    && Number.isFinite(rect.top)
    && Number.isFinite(rect.bottom)
    && Number.isFinite(rect.height)
    && rect.height > 0
  );
}

function promptTextCaretRangeFromPoint(container, clientX, clientY) {
  if (!container || typeof document === "undefined") return null;
  const doc = container.ownerDocument || document;
  const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest?.("[data-media-token]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let best = null;
  let node = walker.nextNode();
  while (node) {
    const text = node.textContent || "";
    for (let offset = 0; offset < text.length; offset += 1) {
      const range = doc.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);
      const rects = Array.from(range.getClientRects?.() || []);
      rects.forEach((rect) => {
        if (!usableTextRect(rect)) return;
        const ySlack = Math.max(6, Math.min(16, rect.height * 0.7));
        if (clientY < rect.top - ySlack || clientY > rect.bottom + ySlack) return;
        const middle = rect.left + ((rect.right - rect.left) / 2);
        const nextOffset = clientX <= middle ? offset : offset + 1;
        const xAnchor = nextOffset === offset ? rect.left : rect.right;
        const yCenter = rect.top + (rect.height / 2);
        const score = Math.abs(clientX - xAnchor) + Math.abs(clientY - yCenter) * 4;
        if (!best || score < best.score) {
          best = { node, offset: nextOffset, score };
        }
      });
    }
    node = walker.nextNode();
  }
  if (!best) return null;
  const range = doc.createRange();
  range.setStart(best.node, best.offset);
  range.collapse(true);
  return range;
}

function placePromptTextCaretFromPoint(container, clientX, clientY) {
  const range = promptTextCaretRangeFromPoint(container, clientX, clientY);
  if (!range) return false;
  const selection = window.getSelection?.();
  if (!selection) return false;
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function appendPromptText(container, text) {
  const parts = String(text || "").split("\n");
  parts.forEach((part, index) => {
    if (index > 0) container.appendChild(document.createElement("br"));
    if (part) container.appendChild(document.createTextNode(part));
  });
}

function makeInlineMentionElement(asset, token, kindOverride = "") {
  const chip = document.createElement("span");
  chip.className = "wb-inline-mention";
  chip.contentEditable = "false";
  chip.setAttribute("contenteditable", "false");
  chip.dataset.mediaToken = token;
  chip.dataset.token = token;
  chip.dataset.kind = kindOverride || getMediaKind(asset) || "image";
  chip.title = `${getMediaTitle(asset)} ${token}`;

  const thumb = document.createElement("span");
  thumb.className = "wb-inline-mention-thumb";
  const imageUrl = mediaDisplayUrl(asset, true) || mediaDisplayUrl(asset, false);
  if (imageUrl && getMediaKind(asset) !== "audio") {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = getMediaTitle(asset);
    image.onerror = () => {
      image.remove();
      thumb.textContent = (getMediaTitle(asset).trim().charAt(0) || "图");
    };
    thumb.appendChild(image);
  } else {
    thumb.textContent = (MEDIA_KIND_LABELS[getMediaKind(asset)] || "素材").slice(0, 1);
  }
  chip.appendChild(thumb);

  const label = document.createElement("span");
  label.className = "wb-inline-mention-token";
  label.textContent = token;
  chip.appendChild(label);
  return chip;
}

function renderPromptEditor(container, value, mentionItems = []) {
  const tokens = (Array.isArray(mentionItems) ? mentionItems : [])
    .filter((item) => item?.token && item?.asset)
    .sort((a, b) => b.token.length - a.token.length);
  const text = String(value || "");
  container.innerHTML = "";
  if (!tokens.length || !text.includes("@")) {
    appendPromptText(container, text);
    return;
  }
  let index = 0;
  let plainStart = 0;
  while (index < text.length) {
    const item = tokens.find((candidate) => text.startsWith(candidate.token, index));
    if (!item) {
      index += 1;
      continue;
    }
    if (plainStart < index) appendPromptText(container, text.slice(plainStart, index));
    container.appendChild(makeInlineMentionElement(item.asset, item.token, item.kind));
    index += item.token.length;
    plainStart = index;
  }
  if (plainStart < text.length) appendPromptText(container, text.slice(plainStart));
}

function adjacentInlineMention(container, key) {
  const selection = window.getSelection?.();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!range.collapsed) return null;
  const node = range.startContainer;
  if (node !== container && !container.contains(node)) return null;
  const isChip = (candidate) => candidate instanceof HTMLElement && Boolean(candidate.dataset.mediaToken);
  if (key === "Backspace") {
    if (node.nodeType === Node.TEXT_NODE && range.startOffset === 0 && isChip(node.previousSibling)) return node.previousSibling;
    if (node === container && isChip(container.childNodes[range.startOffset - 1])) return container.childNodes[range.startOffset - 1];
  }
  if (key === "Delete") {
    if (node.nodeType === Node.TEXT_NODE && range.startOffset === (node.textContent?.length || 0) && isChip(node.nextSibling)) return node.nextSibling;
    if (node === container && isChip(container.childNodes[range.startOffset])) return container.childNodes[range.startOffset];
  }
  return null;
}

function MediaReferenceThumb({ asset }) {
  const kind = getMediaKind(asset);
  const thumbUrl = mediaDisplayUrl(asset, true);
  const mediaUrl = mediaDisplayUrl(asset, false);
  const [failed, setFailed] = React.useState(false);
  const imageUrl = failed && mediaUrl !== thumbUrl ? mediaUrl : (thumbUrl || mediaUrl);

  React.useEffect(() => {
    setFailed(false);
  }, [thumbUrl, mediaUrl]);

  if (kind === "image" && imageUrl) {
    return <img src={imageUrl} alt="" loading="lazy" decoding="async" draggable="false" onError={() => setFailed(true)} />;
  }
  if (kind === "video" && thumbUrl && !failed) {
    return <img src={thumbUrl} alt="" loading="lazy" decoding="async" draggable="false" onError={() => setFailed(true)} />;
  }
  return <span className="wb-media-icon">{iconForKind(kind, 15)}</span>;
}

function WorkbenchReferencePreview({ asset, floating = false }) {
  return (
    <span className={floating ? "wb-ref-floating-preview" : "wb-ref-preview"} aria-hidden="true">
      <span className="wb-ref-preview-media"><MediaReferenceThumb asset={asset}/></span>
    </span>
  );
}

function PromptMentionHoverPreview({ asset, style }) {
  return (
    <span className="wb-prompt-hover-preview" aria-hidden="true" style={style}>
      <span className="wb-ref-preview-media"><MediaReferenceThumb asset={asset}/></span>
    </span>
  );
}

export function NodeWorkbench({ node, allNodes = [], nodesById = null, edges = [], onGenerate, onOpenModal, onUpdateNode, onRunSlash, projectId }) {
  const workbenchElementRef = useRegisterCanvasElement('workbenches', node?.id);
  const isVideo = node.type === "video";
  const tab = isVideo ? "video" : "image";
  const promptRef = React.useRef(null);
  const promptHighlightRef = React.useRef(null);
  const skipPromptHydrateRef = React.useRef("");
  const isPromptComposingRef = React.useRef(false);
  const promptCompositionStartRef = React.useRef(null);
  const promptPointerRef = React.useRef(null);
  const promptResizeCleanupRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const seedanceImageInputRef = React.useRef(null);
  const seedanceAudioInputRef = React.useRef(null);
  const paramButtonRef = React.useRef(null);
  const paramsPanelRef = React.useRef(null);
  const submitLockRef = React.useRef(false);
  const promptInputSyncKeysRef = React.useRef(new Set(promptInputSyncKeys(node.promptInputSyncKeys)));
  const promptValueRef = React.useRef(promptValueFromNode(node));
  const effectiveProjectId = projectId || DEFAULT_PROJECT_ID;
  const [mode, setMode] = React.useState(isVideo ? normalizeVideoModeForModel(node.generationMode || node.mode || node.workbenchMode, null) : "image");
  const [prompt, setPrompt] = React.useState(promptValueFromNode(node));
  const [selectedStyle, setSelectedStyle] = React.useState(() => workbenchStyleFromNode(node));
  const [promptTextareaHeight, setPromptTextareaHeight] = React.useState(PROMPT_TEXTAREA_DEFAULT_HEIGHT);
  const [ratio, setRatio] = React.useState(node.ratio || "16:9");
  const [resolution, setResolution] = React.useState(node.resolution || (isVideo ? "720P" : "2K"));
  const [duration, setDuration] = React.useState(node.durationSeconds || 15);
  const committedDurationRef = React.useRef(node.durationSeconds || 15);
  const [seedanceMode, setSeedanceMode] = React.useState(node.seedanceMode || node.seedance_mode || "");
  const [audioOn, setAudioOn] = React.useState(node.audioOn !== false);
  const [count, setCount] = React.useState(node.count || 1);
  const [openPanel, setOpenPanel] = React.useState(null);
  const [mention, setMention] = React.useState(null);
  const [mentionMenuStyle, setMentionMenuStyle] = React.useState(null);
  const [seedancePreviewAsset, setSeedancePreviewAsset] = React.useState(null);
  const [promptMentionPreview, setPromptMentionPreview] = React.useState(null);
  const [referenceAssets, setReferenceAssets] = React.useState(() => (
    Array.isArray(node.referenceAssets) ? node.referenceAssets.filter(isMediaAsset) : []
  ));
  const [seedancePortraitAssets, setSeedancePortraitAssets] = React.useState(() => (
    normalizeSeedancePortraitAssets(node.seedancePortraitAssets)
  ));
  const seedancePortraitAssetsRef = React.useRef(seedancePortraitAssets);
  const [model, setModel] = React.useState(node.workbenchModel || "");
  const [providerModelId, setProviderModelId] = React.useState(node.providerModelId || "");
  const [models, setModels] = React.useState([]);
  const [modelLoading, setModelLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [submitPending, setSubmitPending] = React.useState(false);
  const selectedModel = React.useMemo(
    () => models.find((item) => item.id === providerModelId) || models.find((item) => modelMatchesLabel(item, model)) || null,
    [model, models, providerModelId]
  );
  const displayModel = selectedModel ? modelLabel(selectedModel) : (model || (modelLoading ? "加载模型..." : "暂无可用模型"));
  const videoModeOptions = React.useMemo(
    () => (isVideo ? videoModeOptionsForModel(selectedModel) : VIDEO_MODE_OPTIONS),
    [isVideo, selectedModel?.id, selectedModel?.modelName, selectedModel?.displayName, selectedModel?.params]
  );
  const activeVideoMode = isVideo ? normalizeVideoModeForModel(mode, selectedModel) : mode;
  const selectedModeOption = React.useMemo(
    () => videoModeOptions.find((item) => item.key === activeVideoMode) || videoModeOptions[0] || VIDEO_MODE_OPTIONS[0],
    [activeVideoMode, videoModeOptions]
  );
  const isSeedanceSelected = isVideo && isSeedanceModel(selectedModel);
  const supportsSeedancePortraitAssets = isVideo && isSeedancePortraitModel(selectedModel);
  const linkedReferenceAssets = React.useMemo(
    () => collectConnectedImageReferences(node.id, nodesById || allNodes, edges),
    [allNodes, nodesById, edges, node.id]
  );
  const linkedSeedancePortraitAssets = React.useMemo(
    () => (supportsSeedancePortraitAssets
      ? normalizeSeedancePortraitAssets(linkedReferenceAssets.map((asset) => asset.seedancePortraitAsset).filter(Boolean))
      : []),
    [linkedReferenceAssets, supportsSeedancePortraitAssets]
  );
  const displayReferenceAssets = React.useMemo(
    () => mergeWorkbenchReferences(
      supportsSeedancePortraitAssets
        ? linkedReferenceAssets.filter((asset) => !asset.seedancePortraitAsset)
        : linkedReferenceAssets,
      referenceAssets,
    ),
    [linkedReferenceAssets, referenceAssets, supportsSeedancePortraitAssets]
  );
  const imageReferenceAssets = React.useMemo(
    () => displayReferenceAssets.filter((asset) => getMediaKind(asset) === "image"),
    [displayReferenceAssets]
  );
  const videoReferenceAssets = React.useMemo(
    () => displayReferenceAssets.filter((asset) => getMediaKind(asset) === "video"),
    [displayReferenceAssets]
  );
  const audioReferenceAssets = React.useMemo(
    () => displayReferenceAssets.filter((asset) => getMediaKind(asset) === "audio"),
    [displayReferenceAssets]
  );
  const maxReferenceVideos = isVideo ? maxReferenceVideosForModel(selectedModel) : 0;
  const maxReferenceAudios = isVideo ? maxReferenceAudiosForModel(selectedModel) : 0;
  const canUseVideoReference = isVideo && supportsVideoReferenceForModel(selectedModel) && maxReferenceVideos > 0;
  const canUseAudioReference = isVideo && maxReferenceAudios > 0;
  const activeReferenceMode = isVideo ? referenceModeForVideoMode(selectedModel, activeVideoMode) : "";
  const activeSeedancePortraitAssets = supportsSeedancePortraitAssets
    ? mergeSeedancePortraitAssets(linkedSeedancePortraitAssets, seedancePortraitAssets)
    : [];
  const useSeedanceNodeReferences = isSeedanceSelected && activeVideoMode === "image-video";
  const activeReferenceAssets = React.useMemo(() => {
    if (!isVideo) return displayReferenceAssets;
    if (activeVideoMode === "text-video") return [];
    const videos = canUseVideoReference ? videoReferenceAssets.slice(0, maxReferenceVideos) : [];
    const audios = canUseAudioReference ? audioReferenceAssets.slice(0, maxReferenceAudios) : [];
    if (activeVideoMode === "keyframe") return imageReferenceAssets.slice(0, 2);
    return [...imageReferenceAssets, ...videos, ...audios];
  }, [activeVideoMode, audioReferenceAssets, canUseAudioReference, canUseVideoReference, displayReferenceAssets, imageReferenceAssets, isVideo, maxReferenceAudios, maxReferenceVideos, videoReferenceAssets]);
  const seedanceReferenceItems = React.useMemo(() => {
    if (!useSeedanceNodeReferences) return [];
    const counters = { image: 0, video: 0, audio: 0 };
    return activeReferenceAssets
      .filter((asset) => SEEDANCE_REFERENCE_KINDS.includes(getMediaKind(asset)))
      .map((asset) => {
        const kind = getMediaKind(asset);
        counters[kind] += 1;
        const label = seedanceReferenceLabel(kind, counters[kind]);
        return {
          asset,
          kind,
          index: counters[kind],
          label,
          token: `@${label}`,
        };
      });
  }, [activeReferenceAssets, useSeedanceNodeReferences]);
  const generationReferenceAssets = React.useMemo(() => {
    if (!useSeedanceNodeReferences) return activeReferenceAssets;
    return seedanceReferenceItems.map(({ asset, token, label }) => ({
      ...asset,
      sourceToken: asset?.token,
      sourcePromptToken: asset?.promptToken,
      token,
      promptToken: token,
      seedanceLabel: label,
    }));
  }, [activeReferenceAssets, seedanceReferenceItems, useSeedanceNodeReferences]);
  const seedanceImageItems = React.useMemo(
    () => seedanceReferenceItems.filter((item) => item.kind === "image"),
    [seedanceReferenceItems]
  );
  const seedanceAudioItems = React.useMemo(
    () => seedanceReferenceItems.filter((item) => item.kind === "audio"),
    [seedanceReferenceItems]
  );
  const seedanceVideoItems = React.useMemo(
    () => seedanceReferenceItems.filter((item) => item.kind === "video"),
    [seedanceReferenceItems]
  );
  const promptOrdinalReferenceItems = React.useMemo(() => (
    !isVideo && !useSeedanceNodeReferences ? buildOrdinalReferenceItems(displayReferenceAssets) : []
  ), [displayReferenceAssets, isVideo, useSeedanceNodeReferences]);
  const nodeMentionAssets = React.useMemo(() => {
    if (useSeedanceNodeReferences) return [];
    return displayReferenceAssets.filter((asset) => (
      isMediaAsset(asset) && assetAllowedForNode(asset, node.type)
    ));
  }, [displayReferenceAssets, node.type, useSeedanceNodeReferences]);
  const filteredMentionAssets = React.useMemo(() => {
    if (useSeedanceNodeReferences) return [];
    if (supportsSeedancePortraitAssets) return [];
    if (!mention) return [];
    const query = mention.query.trim().toLowerCase();
    return nodeMentionAssets.filter((asset) => {
      if (!query) return true;
      const ordinalToken = ordinalTokenForAsset(asset, promptOrdinalReferenceItems);
      return `${getMediaTitle(asset)} ${MEDIA_KIND_LABELS[getMediaKind(asset)] || ''} ${makeMediaToken(asset)} ${ordinalToken}`
        .toLowerCase()
      .includes(query);
    }).slice(0, 80);
  }, [mention, nodeMentionAssets, promptOrdinalReferenceItems, supportsSeedancePortraitAssets, useSeedanceNodeReferences]);
  const filteredSeedanceMentionItems = React.useMemo(() => {
    if (!mention || !useSeedanceNodeReferences) return [];
    const query = mention.query.trim().toLowerCase();
    return seedanceReferenceItems.filter((item) => {
      if (!query) return true;
      return `${item.label} ${item.token}`.toLowerCase().includes(query);
    });
  }, [mention, seedanceReferenceItems, useSeedanceNodeReferences]);
  const seedancePortraitMentionAssets = React.useMemo(
    () => activeSeedancePortraitAssets,
    [activeSeedancePortraitAssets]
  );
  const filteredSeedancePortraitMentionItems = React.useMemo(() => {
    if (!mention || !supportsSeedancePortraitAssets) return [];
    const query = mention.query.trim().toLowerCase();
    return seedancePortraitMentionAssets
      .map((asset) => ({ asset, token: seedancePortraitMentionToken(asset) }))
      .filter((item) => {
        if (!query) return true;
        return `${seedancePortraitAssetTitle(item.asset)} ${item.token} ${item.asset.assetRef || item.asset.asset_ref || ""}`
          .toLowerCase()
          .includes(query);
      })
      .slice(0, 80);
  }, [mention, seedancePortraitMentionAssets, supportsSeedancePortraitAssets]);
  const workbenchW = Math.max(node.w, isVideo ? 640 : 640);
  const left = node.x + node.w / 2 - workbenchW / 2;
  const top = node.y + node.h + 14;
  const placeholder = isVideo
    ? "描述你想要生成的画面内容，@引用素材"
    : "描述你想要生成的画面内容，按/呼出指令，@引用素材";
  const defaultRatioOptions = isVideo
    ? ["16:9", "9:16"]
    : ["Auto", "16:9", "4:3", "1:1", "3:4", "9:16", "21:9"];
  const ratioOptions = ratioOptionsForModel(selectedModel, defaultRatioOptions);
  const includeResolution = !isVideo || includeResolutionForModel(selectedModel);
  const includeGenerateAudio = !isVideo || includeGenerateAudioForModel(selectedModel);
  const resolutionOptions = resolutionOptionsForModel(selectedModel, isVideo);
  const includeSeedanceMode = isVideo && includeSeedanceModeForModel(selectedModel);
  const seedanceModeOptions = includeSeedanceMode ? seedanceModeOptionsForModel(selectedModel, resolution) : [];
  const activeSeedanceMode = includeSeedanceMode ? normalizeSeedanceModeForModel(seedanceMode, selectedModel, resolution) : "";
  const selectedSeedanceModeOption = seedanceModeOptions.find((item) => item.key === activeSeedanceMode) || seedanceModeOptions[0] || null;
  const durationOptions = isVideo ? durationOptionsForModel(selectedModel) : [];
  const useDurationSlider = shouldRenderDurationSlider(selectedModel, durationOptions);
  const durationMin = durationOptions.length ? durationOptions[0] : 3;
  const durationMax = durationOptions.length ? durationOptions[durationOptions.length - 1] : 20;
  const maxReferenceImages = isVideo ? maxReferenceImagesForModel(selectedModel) : 0;
  const referenceImageCount = isVideo && activeVideoMode !== "text-video" ? imageReferenceAssets.length : 0;
  const referenceVideoCount = isVideo && activeVideoMode !== "text-video" ? videoReferenceAssets.length : 0;
  const referenceAudioCount = isVideo && activeVideoMode !== "text-video" ? audioReferenceAssets.length : 0;
  const seedanceReferenceRequirementCount = activeReferenceAssets.length + activeSeedancePortraitAssets.length;
  const referenceLimitExceeded = Boolean(maxReferenceImages && referenceImageCount > maxReferenceImages);
  const videoReferenceLimitExceeded = Boolean(maxReferenceVideos && referenceVideoCount > maxReferenceVideos);
  const audioReferenceLimitExceeded = Boolean(maxReferenceAudios && referenceAudioCount > maxReferenceAudios);
  const videoModeError = (() => {
    if (!isVideo) return "";
    if (referenceLimitExceeded) return `最多 ${maxReferenceImages} 张参考图`;
    if (videoReferenceLimitExceeded) return `最多 ${maxReferenceVideos} 个参考视频`;
    if (audioReferenceLimitExceeded) return `最多 ${maxReferenceAudios} 个参考音频`;
    if (referenceVideoCount > 0 && !canUseVideoReference) return "当前模型不支持参考视频";
    if (referenceAudioCount > 0 && !canUseAudioReference) return "当前模型不支持参考音频";
    if (activeVideoMode === "image-video" && seedanceReferenceRequirementCount < 1) return "图生视频至少需要 1 个参考素材";
    if (activeVideoMode === "keyframe" && referenceImageCount !== 2) return "首尾帧需要 2 张参考图";
    return "";
  })();
  const generationActive = Boolean(node.generating);
  const submitBlocked = generationActive || submitPending;
  const canGenerate = prompt.trim().length > 0 && Boolean(selectedModel) && !videoModeError && !submitBlocked;
  const paramTitleParts = [ratio];
  if (includeResolution) paramTitleParts.push(resolution);
  if (selectedSeedanceModeOption) paramTitleParts.push(selectedSeedanceModeOption.label);
  if (isVideo) {
    paramTitleParts.push(`${duration}s`);
    if (includeGenerateAudio) paramTitleParts.push(audioOn ? "音频开" : "音频关");
  }
  const paramTitle = paramTitleParts.join(" · ");
  const promptMentionItems = React.useMemo(() => (
    buildPromptMentionItems(
      useSeedanceNodeReferences ? generationReferenceAssets : displayReferenceAssets,
      activeSeedancePortraitAssets,
      promptOrdinalReferenceItems,
    )
  ), [activeSeedancePortraitAssets, displayReferenceAssets, generationReferenceAssets, promptOrdinalReferenceItems, useSeedanceNodeReferences]);
  const useRichPromptEditor = false;
  const usePromptHighlightOverlay = React.useMemo(() => (
    !useRichPromptEditor && promptMentionRanges(prompt, promptMentionItems).length > 0
  ), [prompt, promptMentionItems, useRichPromptEditor]);
  const promptHighlightStyle = React.useMemo(() => ({ height: promptTextareaHeight }), [promptTextareaHeight]);
  const syncPromptHighlightScroll = React.useCallback((target = promptRef.current) => {
    const highlight = promptHighlightRef.current;
    if (!highlight || !(target instanceof HTMLTextAreaElement)) return;
    highlight.scrollTop = target.scrollTop || 0;
    highlight.scrollLeft = target.scrollLeft || 0;
  }, []);
  const focusPromptFromHighlightToken = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    promptRef.current?.focus();
  }, []);
  const showPromptMentionPreviewFromElement = React.useCallback((token, item) => {
    if (!item?.asset) return;
    const promptBox = token?.closest?.(".wb-prompt-box");
    const tokenRect = token?.getBoundingClientRect?.();
    const boxRect = promptBox?.getBoundingClientRect?.();
    if (!tokenRect || !boxRect) {
      setPromptMentionPreview({ asset: item.asset, style: undefined });
      return;
    }
    const previewWidth = 220;
    const maxLeft = Math.max(4, (boxRect.width || previewWidth + 8) - previewWidth - 4);
    const left = clampNumber(tokenRect.left - boxRect.left, 4, maxLeft);
    const top = Math.max(4, tokenRect.top - boxRect.top);
    setPromptMentionPreview({
      asset: item.asset,
      style: {
        left: `${Math.round(left)}px`,
        top: `${Math.round(top)}px`,
      },
    });
  }, []);
  const showPromptMentionPreview = React.useCallback((event, item) => {
    showPromptMentionPreviewFromElement(event.currentTarget, item);
  }, [showPromptMentionPreviewFromElement]);
  const handleInlineMentionMouseOver = React.useCallback((event) => {
    const token = event.target?.closest?.(".wb-inline-mention");
    if (!token || !event.currentTarget.contains(token)) return;
    if (event.relatedTarget && token.contains(event.relatedTarget)) return;
    const item = promptMentionItems.find((candidate) => candidate.token === token.dataset.token);
    if (item) showPromptMentionPreviewFromElement(token, item);
  }, [promptMentionItems, showPromptMentionPreviewFromElement]);
  const handleInlineMentionMouseOut = React.useCallback((event) => {
    const token = event.target?.closest?.(".wb-inline-mention");
    if (!token || !event.currentTarget.contains(token)) {
      if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
        setPromptMentionPreview(null);
      }
      return;
    }
    if (event.relatedTarget && token.contains(event.relatedTarget)) return;
    setPromptMentionPreview(null);
  }, []);
  const handleInlineMentionPointerMove = React.useCallback((event) => {
    const token = event.target?.closest?.(".wb-inline-mention");
    if (!token || !event.currentTarget.contains(token)) {
      setPromptMentionPreview(null);
      return;
    }
    const item = promptMentionItems.find((candidate) => candidate.token === token.dataset.token);
    if (item) showPromptMentionPreviewFromElement(token, item);
  }, [promptMentionItems, showPromptMentionPreviewFromElement]);
  const hidePromptMentionPreview = React.useCallback(() => {
    setPromptMentionPreview(null);
  }, []);

  React.useEffect(() => {
    setPromptTextareaHeight(PROMPT_TEXTAREA_DEFAULT_HEIGHT);
    submitLockRef.current = false;
    setSubmitPending(false);
  }, [node.id]);

  const previousGenerationActiveRef = React.useRef(generationActive);
  React.useEffect(() => {
    if (generationActive) {
      submitLockRef.current = true;
      setSubmitPending(false);
    } else if (previousGenerationActiveRef.current) {
      submitLockRef.current = false;
      setSubmitPending(false);
    }
    previousGenerationActiveRef.current = generationActive;
  }, [generationActive]);

  React.useEffect(() => () => {
    promptResizeCleanupRef.current?.();
  }, []);

  React.useEffect(() => {
    if (openPanel !== "params" || typeof document === "undefined") return undefined;
    const closeParamsFromOutside = (event) => {
      const target = event.target;
      if (!target) return;
      if (paramButtonRef.current?.contains(target) || paramsPanelRef.current?.contains(target)) return;
      setOpenPanel((current) => (current === "params" ? null : current));
    };
    document.addEventListener("pointerdown", closeParamsFromOutside, true);
    return () => {
      document.removeEventListener("pointerdown", closeParamsFromOutside, true);
    };
  }, [openPanel]);

  React.useEffect(() => {
    promptValueRef.current = prompt;
  }, [prompt]);

  React.useLayoutEffect(() => {
    const editor = promptRef.current;
    if (!editor) return;
    if (editor instanceof HTMLTextAreaElement) return;
    if (isPromptComposingRef.current && document.activeElement === editor) return;
    const key = promptHydrateKey(prompt, promptMentionItems);
    if (skipPromptHydrateRef.current === key) {
      skipPromptHydrateRef.current = "";
      return;
    }
    const active = document.activeElement === editor;
    const offset = active ? promptSelectionOffset(editor) : null;
    editor.value = prompt;
    renderPromptEditor(editor, prompt, promptMentionItems);
    if (active && offset !== null) {
      setPromptSelectionOffset(editor, offset);
    }
  }, [prompt, promptMentionItems]);

  React.useLayoutEffect(() => {
    syncPromptHighlightScroll();
  }, [prompt, promptTextareaHeight, syncPromptHighlightScroll]);

  React.useLayoutEffect(() => {
    if (isPromptComposingRef.current || document.activeElement === promptRef.current) return;
    const normalized = normalizePromptMentionIconSpaces(prompt, promptMentionItems);
    if (normalized === prompt) return;
    promptValueRef.current = normalized;
    setPrompt(normalized);
  }, [prompt, promptMentionItems]);

  React.useEffect(() => {
    const nextPrompt = promptValueFromNode(node);
    promptValueRef.current = nextPrompt;
    promptInputSyncKeysRef.current = new Set(promptInputSyncKeys(node.promptInputSyncKeys));
    setPrompt(nextPrompt);
    setSeedancePreviewAsset(null);
    setPromptMentionPreview(null);
    setReferenceAssets(Array.isArray(node.referenceAssets) ? node.referenceAssets.filter(isMediaAsset) : []);
    const nextPortraitAssets = normalizeSeedancePortraitAssets(node.seedancePortraitAssets);
    seedancePortraitAssetsRef.current = nextPortraitAssets;
    setSeedancePortraitAssets(nextPortraitAssets);
    setRatio(node.ratio || "16:9");
    setResolution(node.resolution || (node.type === "video" ? "720P" : "2K"));
    const nextDuration = node.durationSeconds || 15;
    committedDurationRef.current = nextDuration;
    setDuration(nextDuration);
    setSeedanceMode(node.seedanceMode || node.seedance_mode || "");
    setAudioOn(node.audioOn !== false);
    setCount(node.count || 1);
    setSelectedStyle(workbenchStyleFromNode(node));
    if (node.type === "video") setMode(normalizeVideoModeForModel(node.generationMode || node.mode || node.workbenchMode, selectedModel));
    setModel(node.workbenchModel || "");
    setProviderModelId(node.providerModelId || "");
  }, [node.id, node.promptDraft, node.prompt, node.promptInputSyncKeys, node.referenceAssets, node.seedancePortraitAssets, node.ratio, node.resolution, node.durationSeconds, node.seedanceMode, node.seedance_mode, node.audioOn, node.count, node.styleId, node.styleName, node.stylePrompt, node.stylePreset, node.workbenchModel, node.providerModelId, node.type]);

  React.useEffect(() => {
    seedancePortraitAssetsRef.current = seedancePortraitAssets;
  }, [seedancePortraitAssets]);

  React.useEffect(() => {
    let cancelled = false;
    const capability = capabilityForGeneration(tab);
    setModelLoading(true);
    ProviderStore.models({ capability })
      .then(async (result) => {
        if (cancelled) return;
        let next = Array.isArray(result?.models) ? result.models.filter((item) => item.enabled !== false) : [];
        if (!next.length) {
          try {
            const allResult = await ProviderStore.models();
            if (!cancelled) {
              next = (Array.isArray(allResult?.models) ? allResult.models : [])
                .filter((item) => item.enabled !== false && (!item.capability || item.capability === capability));
            }
          } catch {
            next = [];
          }
        }
        const preferred = selectBackendModel(next, { currentId: node.providerModelId, currentLabel: node.workbenchModel });
        setModels(next);
        if (preferred) {
          setProviderModelId(preferred.id);
          setModel(modelLabel(preferred));
        } else {
          setProviderModelId("");
          setModel("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModels([]);
          setProviderModelId("");
          setModel("");
        }
      })
      .finally(() => {
        if (!cancelled) setModelLoading(false);
      });
    return () => { cancelled = true; };
  }, [node.id, node.providerModelId, node.workbenchModel, tab]);

  const updateDraft = (patch) => onUpdateNode?.(node.id, patch);
  const updateUserParams = (patch) => onUpdateNode?.(node.id, patch, { source: GENERATION_PARAMETER_UPDATE_SOURCE });
  const selectedStyleName = workbenchStyleName(selectedStyle);
  const selectedStylePrompt = workbenchStylePromptFor(selectedStyle);

  const pickStyleFromLibrary = (item) => {
    const nextStyle = normalizeWorkbenchStyle(item);
    if (!nextStyle) return;
    const nextPrompt = workbenchStylePromptFor(nextStyle);
    setSelectedStyle(nextStyle);
    updateUserParams({
      style: nextStyle.id,
      styleId: nextStyle.id,
      styleName: workbenchStyleName(nextStyle),
      stylePrompt: nextPrompt,
      stylePreset: {
        ...nextStyle,
        prompt: nextPrompt,
      },
    });
  };

  const openWorkbenchTool = (kind) => {
    if (kind === "stylelib") {
      onOpenModal?.("stylelib", node.id, { onPick: pickStyleFromLibrary });
      return;
    }
    onOpenModal?.(kind, node.id);
  };

  React.useEffect(() => {
    const pendingInputs = connectedPromptInputs(
      node.id,
      nodesById || allNodes,
      edges,
      Array.from(promptInputSyncKeysRef.current),
    );
    if (!pendingInputs.length) return;
    const nextKeys = Array.from(new Set([
      ...Array.from(promptInputSyncKeysRef.current),
      ...pendingInputs.map((item) => item.key),
    ]));
    const nextPrompt = appendPromptInputText(promptValueRef.current, pendingInputs);
    promptInputSyncKeysRef.current = new Set(nextKeys);
    promptValueRef.current = nextPrompt;
    setPrompt(nextPrompt);
    updateDraft({
      promptDraft: nextPrompt,
      promptInputSyncKeys: nextKeys,
    });
  }, [allNodes, nodesById, edges, node.id]);

  React.useEffect(() => {
    if (!isVideo || !selectedModel) return;
    const nextMode = normalizeVideoModeForModel(mode, selectedModel);
    if (nextMode === mode) return;
    setMode(nextMode);
    updateDraft({ generationMode: nextMode });
  }, [isVideo, mode, node.id, selectedModel?.id]);

  React.useEffect(() => {
    if (!isVideo || !selectedModel || imageReferenceAssets.length < 1) return;
    if (node.generationMode || node.mode || node.workbenchMode) return;
    if (activeVideoMode !== "text-video") return;
    const imageMode = videoModeOptions.find((item) => item.key === "image-video");
    if (!imageMode || imageMode.disabled) return;
    setMode("image-video");
    updateDraft({ generationMode: "image-video" });
  }, [
    activeVideoMode,
    imageReferenceAssets.length,
    isVideo,
    node.generationMode,
    node.id,
    node.mode,
    node.workbenchMode,
    selectedModel?.id,
    videoModeOptions,
  ]);

  React.useEffect(() => {
    if (!isVideo || !selectedModel) return;
    const patch = {};
    const params = modelParams(selectedModel);
    const preferredRatio = String(params.defaultRatio || params.defaultAspectRatio || "").trim();
    const shouldUsePreferredRatio = Boolean(preferredRatio && ratioOptions.includes(preferredRatio) && !node.ratio && ratio !== preferredRatio);
    if (ratioOptions.length && (!ratioOptions.includes(ratio) || shouldUsePreferredRatio)) {
      const nextRatio = ratioOptions.includes(preferredRatio) ? preferredRatio : ratioOptions[0];
      setRatio(nextRatio);
      patch.ratio = nextRatio;
    }
    if (includeResolution && resolutionOptions.length && !resolutionOptions.includes(String(resolution || "").toUpperCase())) {
      const nextResolution = resolutionOptions[0];
      setResolution(nextResolution);
      patch.resolution = nextResolution;
    }
    if (includeSeedanceMode) {
      const nextSeedanceMode = normalizeSeedanceModeForModel(seedanceMode, selectedModel, patch.resolution || resolution);
      if (nextSeedanceMode && nextSeedanceMode !== seedanceMode) {
        setSeedanceMode(nextSeedanceMode);
        patch.seedanceMode = nextSeedanceMode;
      }
    }
    if (durationOptions.length && !durationOptions.includes(Number(duration))) {
      const params = modelParams(selectedModel);
      const preferred = Number(params.defaultSeconds || params.defaultDuration);
      const nextDuration = durationOptions.includes(preferred) ? preferred : durationOptions[0];
      committedDurationRef.current = nextDuration;
      setDuration(nextDuration);
      patch.durationSeconds = nextDuration;
    }
    if (Object.keys(patch).length) updateDraft(patch);
  }, [
    duration,
    durationOptions.join("|"),
    includeResolution,
    includeSeedanceMode,
    isVideo,
    node.id,
    node.ratio,
    ratio,
    ratioOptions.join("|"),
    resolution,
    resolutionOptions.join("|"),
    seedanceMode,
    seedanceModeOptions.map((item) => item.key).join("|"),
    selectedModel?.id,
  ]);
  const addUploadedReferences = (items) => {
    const clean = items
      .map(normalizeImportedAsset)
      .filter((asset) => {
        const kind = getMediaKind(asset);
        if (!asset || !kind) return false;
        if (!isVideo) return kind === "image";
        if (isSeedanceSelected && activeVideoMode === "keyframe") return kind === "image";
        return ["image", "video", "audio"].includes(kind);
      });
    if (!clean.length) return;
    const nextRefs = clean.reduce((refs, asset) => mergeMediaReference(refs, asset), referenceAssets);
    const patch = { referenceAssets: nextRefs };
    if (isSeedanceSelected && activeVideoMode === "text-video") {
      setMode("image-video");
      patch.generationMode = "image-video";
    }
    setReferenceAssets(nextRefs);
    updateDraft(patch);
  };
  const handleUploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const records = [];
      for (const file of files) {
        const kind = inferMediaKindFromFile(file);
        if (!kind || (!isVideo && kind !== "image")) continue;
        if (isSeedanceSelected && kind === "audio") {
          const durationSeconds = await probeAudioDurationSeconds(file);
          if (Number.isFinite(durationSeconds) && durationSeconds > 15) continue;
        }
        const meta = {
          source: "node-workbench-upload",
          nodeId: node.id,
          inLibrary: false,
          libraryAsset: false,
          scope: "project",
          projectId: effectiveProjectId,
          project_id: effectiveProjectId,
        };
        let persisted = await importLocalFileAsAsset(file, effectiveProjectId, kind, meta);
        let dataUrl = "";
        if (!persisted) {
          dataUrl = await readFileAsDataUrl(file);
        }
        if (!persisted && AssetStore.writeAvailable()) {
          try {
            persisted = await AssetStore.writeDataUrl(effectiveProjectId, {
              filename: file.name || `image-${Date.now()}.png`,
              dataUrl,
              kind,
              mime: file.type,
              meta,
            });
          } catch (error) {
            console.warn("Node workbench upload persistence failed", error);
          }
        }
        const localRecord = makeAssetRecord({
          kind,
          src: dataUrl,
          title: file.name || "本地图片",
          nodeId: node.id,
          source: "node-workbench-upload",
        });
        records.push({
          ...withProjectAssetScope(localRecord, effectiveProjectId),
          ...(persisted || {}),
          id: persisted?.id || localRecord.id,
          kind: persisted?.kind || kind,
          src: persisted?.src || persisted?.url || dataUrl,
          url: persisted?.url || persisted?.src || dataUrl,
          title: persisted?.title || persisted?.name || file.name || localRecord.title,
          filename: persisted?.filename || file.name,
          mime: persisted?.mime || file.type,
          size: file.size,
          source: persisted?.source || "node-workbench-upload",
          nodeId: node.id,
          projectId: effectiveProjectId,
          project_id: effectiveProjectId,
          assetScope: "project",
          libraryScope: "project",
          inLibrary: false,
          libraryAsset: false,
        });
      }
      if (records.length) {
        addUploadedReferences(records);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (seedanceImageInputRef.current) seedanceImageInputRef.current.value = "";
      if (seedanceAudioInputRef.current) seedanceAudioInputRef.current.value = "";
    }
  };
  const openUploadPicker = async () => {
    setOpenPanel(null);
    setMention(null);
    if (AssetStore.available()) {
      setUploading(true);
      try {
        const imported = await AssetStore.pickAndImport(effectiveProjectId, {
          multiple: true,
          kind: isVideo ? undefined : "image",
          filters: isVideo ? MEDIA_PICK_FILTERS : IMAGE_PICK_FILTERS,
          deferCopy: true,
          meta: {
            source: "node-workbench-upload",
            nodeId: node.id,
            inLibrary: false,
            libraryAsset: false,
            scope: "project",
            projectId: effectiveProjectId,
            project_id: effectiveProjectId,
          },
        });
        const clean = imported
          .map(normalizeImportedAsset)
          .filter((asset) => {
            const kind = getMediaKind(asset);
            return asset && (isVideo ? ["image", "video", "audio"].includes(kind) : kind === "image");
          })
          .map((asset) => withProjectAssetScope({ ...asset, nodeId: node.id }, effectiveProjectId));
        if (clean.length) {
          addUploadedReferences(clean);
        }
      } catch (error) {
        console.warn("Native node workbench upload picker failed; falling back to browser input", error);
        fileInputRef.current?.click();
      } finally {
        setUploading(false);
      }
      return;
    }
    fileInputRef.current?.click();
  };
  const updateMentionFromPromptEditor = (target, value = serializePromptEditor(target)) => {
    const cursor = promptSelectionOffset(target);
    const nextMention = findActiveMediaMention(value, cursor ?? value.length);
    setMention(nextMention);
    setMentionMenuStyle(nextMention ? promptEditorMentionMenuStyle(target) : null);
  };
  const updateMentionFromTextarea = (target, value = target.value) => {
    const nextMention = findActiveMediaMention(value, target.selectionStart ?? value.length);
    setMention(nextMention);
    setMentionMenuStyle(nextMention ? textareaMentionMenuStyle(target, nextMention) : null);
  };
  const commitTextareaPrompt = (target, nextValue = target.value, nextSelectionOffset = null) => {
    const rawValue = String(nextValue || "");
    const rawOffset = Number.isFinite(nextSelectionOffset)
      ? nextSelectionOffset
      : (target.selectionStart ?? rawValue.length);
    const v = normalizePromptMentionIconSpaces(rawValue, promptMentionItems);
    const adjustedOffset = v === rawValue
      ? nextSelectionOffset
      : normalizePromptMentionIconSpaces(rawValue.slice(0, rawOffset), promptMentionItems).length;
    if (target.value !== v) {
      target.value = v;
    }
    setPrompt(v);
    updateDraft({ promptDraft: v });
    updateMentionFromTextarea(target, v);
    if (v.endsWith("/")) onRunSlash?.("/", node.id);
    if (Number.isFinite(adjustedOffset)) {
      requestAnimationFrame(() => {
        if (promptRef.current instanceof HTMLTextAreaElement) {
          promptRef.current.focus();
          promptRef.current.setSelectionRange(adjustedOffset, adjustedOffset);
        }
      });
    }
  };
  const handlePromptTextareaChange = (e) => {
    const value = e.currentTarget.value;
    if (isPromptComposingRef.current || e.nativeEvent?.isComposing) {
      setPrompt(value);
      return;
    }
    commitTextareaPrompt(e.currentTarget, value, e.currentTarget.selectionStart ?? value.length);
  };
  const handleTextareaCompositionStart = (e) => {
    isPromptComposingRef.current = true;
    promptCompositionStartRef.current = {
      value: e.currentTarget.value,
      offset: e.currentTarget.selectionStart ?? e.currentTarget.value.length,
    };
    setMention(null);
    setMentionMenuStyle(null);
  };
  const handleTextareaCompositionEnd = (e) => {
    isPromptComposingRef.current = false;
    const rawValue = e.currentTarget.value;
    const committedText = String(e.data || "");
    const compositionStart = promptCompositionStartRef.current;
    const normalizedValue = normalizePromptCompositionValue(rawValue, compositionStart, committedText);
    const startOffset = Number(compositionStart?.offset || 0);
    const afterLength = Math.max(0, String(compositionStart?.value || "").length - startOffset);
    const normalizedInsertLength = Math.max(0, normalizedValue.length - startOffset - afterLength);
    const nextOffset = normalizedValue === rawValue ? null : startOffset + normalizedInsertLength;
    promptCompositionStartRef.current = null;
    commitTextareaPrompt(e.currentTarget, normalizedValue, nextOffset);
  };
  const handlePromptTextareaKeyDown = (e) => {
    e.stopPropagation();
    if (!isPromptComposingRef.current && !e.nativeEvent?.isComposing) {
      const target = e.currentTarget;
      const selectionStart = target.selectionStart ?? 0;
      const selectionEnd = target.selectionEnd ?? selectionStart;
      if (selectionStart === selectionEnd && (e.key === "Backspace" || e.key === "Delete")) {
        const removal = removePromptMentionForKey(target.value, selectionStart, e.key, promptMentionItems);
        if (removal) {
          e.preventDefault();
          target.value = removal.value;
          target.setSelectionRange(removal.caret, removal.caret);
          setMention(null);
          setMentionMenuStyle(null);
          hidePromptMentionPreview();
          commitTextareaPrompt(target, removal.value, removal.caret);
          return;
        }
      }
    }
    if (e.key === "Escape" && mention) {
      e.preventDefault();
      setMention(null);
      setMentionMenuStyle(null);
    }
  };
  const commitPromptEditor = (editor, nextValue = null, nextSelectionOffset = null) => {
    const rawValue = serializePromptEditor(editor);
    const v = typeof nextValue === "string" ? nextValue : rawValue;
    if (typeof nextValue === "string" && nextValue !== rawValue) {
      renderPromptEditor(editor, nextValue, referenceAssets);
      if (Number.isFinite(nextSelectionOffset)) {
        setPromptSelectionOffset(editor, nextSelectionOffset);
      }
    }
    skipPromptHydrateRef.current = promptHydrateKey(v, promptMentionItems);
    setPrompt(v);
    updateDraft({ promptDraft: v });
    updateMentionFromPromptEditor(editor, v);
    if (v.endsWith("/")) onRunSlash?.("/", node.id);
  };
  const handlePromptInput = (e) => {
    if (isPromptComposingRef.current || e.nativeEvent?.isComposing) return;
    commitPromptEditor(e.currentTarget);
  };
  const handlePromptCompositionStart = (e) => {
    isPromptComposingRef.current = true;
    const value = serializePromptEditor(e.currentTarget);
    promptCompositionStartRef.current = {
      value,
      offset: promptSelectionOffset(e.currentTarget) ?? value.length,
    };
    setMention(null);
    setMentionMenuStyle(null);
  };
  const handlePromptCompositionEnd = (e) => {
    isPromptComposingRef.current = false;
    const rawValue = serializePromptEditor(e.currentTarget);
    const committedText = String(e.data || "");
    const compositionStart = promptCompositionStartRef.current;
    const normalizedValue = normalizePromptCompositionValue(
      rawValue,
      compositionStart,
      committedText,
    );
    const startOffset = Number(compositionStart?.offset || 0);
    const afterLength = Math.max(0, String(compositionStart?.value || "").length - startOffset);
    const normalizedInsertLength = Math.max(0, normalizedValue.length - startOffset - afterLength);
    const nextOffset = normalizedValue === rawValue ? null : startOffset + normalizedInsertLength;
    promptCompositionStartRef.current = null;
    commitPromptEditor(e.currentTarget, normalizedValue, nextOffset);
  };
  const handlePromptKeyDown = (e) => {
    e.stopPropagation();
    if (isPromptComposingRef.current || e.nativeEvent?.isComposing) return;
    if (e.key === "Backspace" || e.key === "Delete") {
      const selection = window.getSelection?.();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const anchorNode = range?.startContainer;
      const selectionInsideEditor = anchorNode === e.currentTarget || e.currentTarget.contains(anchorNode);
      if (range?.collapsed && selectionInsideEditor) {
        const value = serializePromptEditor(e.currentTarget);
        const offset = promptSelectionOffset(e.currentTarget);
        const removal = removePromptMentionForKey(value, offset, e.key, promptMentionItems);
        if (removal) {
          e.preventDefault();
          hidePromptMentionPreview();
          commitPromptEditor(e.currentTarget, removal.value, removal.caret);
          return;
        }
      }
      const chip = adjacentInlineMention(e.currentTarget, e.key);
      if (chip) {
        e.preventDefault();
        chip.remove();
        const v = serializePromptEditor(e.currentTarget);
        skipPromptHydrateRef.current = promptHydrateKey(v, promptMentionItems);
        setPrompt(v);
        updateDraft({ promptDraft: v });
        updateMentionFromPromptEditor(e.currentTarget, v);
        return;
      }
    }
    if (e.key === "Escape" && mention) {
      e.preventDefault();
      setMention(null);
      setMentionMenuStyle(null);
    }
  };
  const handlePromptPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    document.execCommand?.("insertText", false, text);
  };
  const handlePromptPointerDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0 || isPromptComposingRef.current) {
      promptPointerRef.current = null;
      return;
    }
    promptPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
      target: e.currentTarget,
    };
  };
  const handlePromptPointerUp = (e) => {
    e.stopPropagation();
    const start = promptPointerRef.current;
    promptPointerRef.current = null;
    if (!start || start.target !== e.currentTarget || isPromptComposingRef.current) return;
    if (Math.abs(e.clientX - start.x) > 3 || Math.abs(e.clientY - start.y) > 3) return;
    requestAnimationFrame(() => {
      const selection = window.getSelection?.();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const anchorNode = range.startContainer;
        const selectionInsideEditor = anchorNode === e.currentTarget || e.currentTarget.contains(anchorNode);
        if (selectionInsideEditor) {
          if (!range.collapsed) return;
          if (!e.target?.closest?.(".wb-inline-mention")) {
            placePromptTextCaretFromPoint(e.currentTarget, e.clientX, e.clientY);
          }
          updateMentionFromPromptEditor(e.currentTarget);
          return;
        }
      }
      if (placePromptCaretFromPoint(e.currentTarget, e.clientX, e.clientY)) {
        updateMentionFromPromptEditor(e.currentTarget);
        return;
      }
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const anchorNode = range.startContainer;
        const selectionInsideEditor = anchorNode === e.currentTarget || e.currentTarget.contains(anchorNode);
        if (selectionInsideEditor && range.collapsed) updateMentionFromPromptEditor(e.currentTarget);
      }
    });
  };
  const handlePromptResizePointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.button !== 0 || typeof window === "undefined") return;

    promptResizeCleanupRef.current?.();
    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    const startY = event.clientY;
    const startHeight = promptRef.current?.getBoundingClientRect?.().height || promptTextareaHeight || PROMPT_TEXTAREA_DEFAULT_HEIGHT;
    const previousCursor = document.body?.style.cursor || "";
    const previousUserSelect = document.body?.style.userSelect || "";

    if (document.body) {
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    }

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const nextHeight = Math.max(PROMPT_TEXTAREA_MIN_HEIGHT, Math.round(startHeight + moveEvent.clientY - startY));
      setPromptTextareaHeight(nextHeight);
    };

    const cleanup = () => {
      try {
        handle.releasePointerCapture?.(pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", cleanup);
      window.removeEventListener("pointercancel", cleanup);
      if (document.body) {
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousUserSelect;
      }
      if (promptResizeCleanupRef.current === cleanup) promptResizeCleanupRef.current = null;
    };

    promptResizeCleanupRef.current = cleanup;
    handle.setPointerCapture?.(pointerId);
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", cleanup);
    window.addEventListener("pointercancel", cleanup);
  };
  const chooseRatio = (value) => {
    setRatio(value);
    updateUserParams({ ratio: value });
  };
  const chooseResolution = (value) => {
    const patch = { resolution: value };
    if (includeSeedanceMode) {
      const nextSeedanceMode = normalizeSeedanceModeForModel(seedanceMode, selectedModel, value);
      if (nextSeedanceMode && nextSeedanceMode !== seedanceMode) {
        setSeedanceMode(nextSeedanceMode);
        patch.seedanceMode = nextSeedanceMode;
      }
    }
    setResolution(value);
    updateUserParams(patch);
  };
  const chooseSeedanceMode = (value) => {
    const nextSeedanceMode = normalizeSeedanceModeForModel(value, selectedModel, resolution);
    if (!nextSeedanceMode) return;
    setSeedanceMode(nextSeedanceMode);
    updateUserParams({ seedanceMode: nextSeedanceMode });
  };
  const previewDuration = (value) => {
    const nextDuration = closestDurationOption(value, durationOptions);
    setDuration(nextDuration);
    return nextDuration;
  };
  const chooseDuration = (value) => {
    const nextDuration = previewDuration(value);
    if (Number(committedDurationRef.current) === Number(nextDuration)) return;
    committedDurationRef.current = nextDuration;
    updateUserParams({ durationSeconds: nextDuration });
  };
  const toggleAudio = (value) => {
    setAudioOn(value);
    updateUserParams({ audioOn: value });
  };
  const chooseModel = (value) => {
    const nextLabel = modelLabel(value);
    setModel(nextLabel);
    setProviderModelId(value?.id || "");
    updateUserParams({
      workbenchModel: nextLabel,
      providerModelId: value?.id,
      modelName: value?.modelName,
      provider: value?.providerId,
    });
    setOpenPanel(null);
  };
  const chooseVideoMode = (nextMode) => {
    const option = videoModeOptions.find((item) => item.key === nextMode);
    if (!option || option.disabled) return;
    setMode(option.key);
    updateUserParams({ generationMode: option.key });
    setOpenPanel(null);
  };
  const addSeedancePortraitAsset = (asset) => {
    if (!supportsSeedancePortraitAssets) return;
    const clean = normalizeSeedancePortraitAsset(asset);
    if (!clean) return;
    const nextAssets = mergeSeedancePortraitAssets([...seedancePortraitAssetsRef.current, clean]);
    seedancePortraitAssetsRef.current = nextAssets;
    setSeedancePortraitAssets(nextAssets);
    updateDraft({ seedancePortraitAssets: nextAssets });
  };
  const openSeedancePortraitLibrary = () => {
    if (!supportsSeedancePortraitAssets) return;
    onOpenModal?.("seedencePortraitLibrary", node.id, {
      onPick: addSeedancePortraitAsset,
      selectedAssets: seedancePortraitAssetsRef.current,
    });
  };
  const handleGenerate = () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || !selectedModel || videoModeError || submitBlocked || submitLockRef.current) return;
    submitLockRef.current = true;
    setSubmitPending(true);
    const selectedStylePayload = selectedStyle ? { ...selectedStyle, prompt: selectedStylePrompt } : null;
    updateDraft({
      promptDraft: cleanPrompt,
      ...(isVideo ? { generationMode: activeVideoMode } : {}),
      ...(includeSeedanceMode && activeSeedanceMode ? { seedanceMode: activeSeedanceMode } : {}),
    });
    const generationPayload = {
      tab,
      nodeId: node.id,
      replaceTarget: true,
      prompt: cleanPrompt,
      model: displayModel,
      modelId: selectedModel?.id || providerModelId,
      providerModelId: selectedModel?.id || providerModelId,
      modelName: selectedModel?.modelName,
      provider: selectedModel?.providerId,
      ratio,
      duration,
      count,
      mode: isVideo ? activeVideoMode : undefined,
      generationMode: isVideo ? activeVideoMode : undefined,
      referenceMode: activeReferenceMode || undefined,
      referenceAssets: generationReferenceAssets,
      style: selectedStyle?.id || "node-workbench",
      styleId: selectedStyle?.id,
      styleName: selectedStyleName || undefined,
      stylePrompt: selectedStylePrompt || undefined,
      stylePreset: selectedStylePayload || undefined,
    };
    if (supportsSeedancePortraitAssets && activeSeedancePortraitAssets.length > 0) {
      generationPayload.seedancePortraitAssets = activeSeedancePortraitAssets;
    }
    if (includeResolution) generationPayload.resolution = resolution;
    if (includeSeedanceMode && activeSeedanceMode) {
      generationPayload.seedanceMode = activeSeedanceMode;
      generationPayload.seedance_mode = activeSeedanceMode;
    }
    if (!isVideo || includeGenerateAudio) generationPayload.audioOn = audioOn;
    try {
      onGenerate?.(generationPayload);
    } catch (error) {
      submitLockRef.current = false;
      setSubmitPending(false);
      throw error;
    }
  };
  const insertAssetReference = (asset) => {
    const token = ordinalTokenForAsset(asset, promptOrdinalReferenceItems) || makeMediaToken(asset);
    const inserted = insertPromptMentionToken(prompt, token, mention);
    const nextRefs = mergeMediaReference(referenceAssets, { ...asset, token });
    const patch = { promptDraft: inserted.value, referenceAssets: nextRefs };
    if (isSeedanceSelected && activeVideoMode === "text-video") {
      setMode("image-video");
      patch.generationMode = "image-video";
    }
    setReferenceAssets(nextRefs);
    setPrompt(inserted.value);
    setMention(null);
    setMentionMenuStyle(null);
    updateDraft(patch);
    requestAnimationFrame(() => {
      promptRef.current?.focus();
      if (promptRef.current instanceof HTMLTextAreaElement) {
        promptRef.current.setSelectionRange(inserted.caret, inserted.caret);
      } else {
        setPromptSelectionOffset(promptRef.current, inserted.caret);
      }
    });
  };
  const insertSeedanceReference = (item) => {
    const inserted = insertPromptMentionToken(prompt, item.token, mention);
    setPrompt(inserted.value);
    setMention(null);
    setMentionMenuStyle(null);
    updateDraft({ promptDraft: inserted.value });
    requestAnimationFrame(() => {
      promptRef.current?.focus();
      if (promptRef.current instanceof HTMLTextAreaElement) {
        promptRef.current.setSelectionRange(inserted.caret, inserted.caret);
      } else {
        setPromptSelectionOffset(promptRef.current, inserted.caret);
      }
    });
  };
  const insertSeedancePortraitReference = (item) => {
    const clean = normalizeSeedancePortraitAsset(item?.asset);
    if (!clean) return;
    const token = item?.token || seedancePortraitMentionToken(clean);
    const inserted = insertPromptMentionToken(prompt, token, mention);
    const nextAssets = mergeSeedancePortraitAssets([...seedancePortraitAssetsRef.current, clean]);
    seedancePortraitAssetsRef.current = nextAssets;
    setSeedancePortraitAssets(nextAssets);
    setPrompt(inserted.value);
    setMention(null);
    setMentionMenuStyle(null);
    updateDraft({ promptDraft: inserted.value, seedancePortraitAssets: nextAssets });
    requestAnimationFrame(() => {
      promptRef.current?.focus();
      if (promptRef.current instanceof HTMLTextAreaElement) {
        promptRef.current.setSelectionRange(inserted.caret, inserted.caret);
      } else {
        setPromptSelectionOffset(promptRef.current, inserted.caret);
      }
    });
  };
  const removeSeedancePortraitAsset = (asset) => {
    const clean = normalizeSeedancePortraitAsset(asset);
    if (!clean) return;
    const nextAssets = seedancePortraitAssetsRef.current.filter((item) => item.assetId !== clean.assetId);
    const token = seedancePortraitMentionToken(clean);
    const nextPrompt = prompt
      .replace(new RegExp(`(^|\\s)${escapeRegExp(token)}(?=\\s|$)`, "u"), "$1")
      .replace(/\s{2,}/g, " ")
      .trimStart();
    seedancePortraitAssetsRef.current = nextAssets;
    setSeedancePortraitAssets(nextAssets);
    setPrompt(nextPrompt);
    updateDraft({ promptDraft: nextPrompt, seedancePortraitAssets: nextAssets });
  };
  const removeAssetReference = (asset) => {
    const nextRefs = removeMediaReference(referenceAssets, asset);
    const token = asset?.token || ordinalTokenForAsset(asset, promptOrdinalReferenceItems) || makeMediaToken(asset);
    const nextPrompt = prompt
      .replace(new RegExp(`(^|\\s)${escapeRegExp(token)}(?=\\s|$)`, "u"), "$1")
      .replace(/\s{2,}/g, " ");
    setReferenceAssets(nextRefs);
    setPrompt(nextPrompt);
    updateDraft({ promptDraft: nextPrompt, referenceAssets: nextRefs });
  };
  const handleReferenceRailWheel = (event) => {
    event.stopPropagation();
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaY;
  };

  const imageTools = [
    ["subjectlib", IFolder, "资产库"],
    ["stylelib", IBox, "风格"],
    ["markup", ISearch, "标记"],
    ["focus", IGrid9, "聚焦"],
  ];
  const videoTools = [
    ["subjectlib", IFolder, "资产库"],
    ["camctrl-video", ICamera, "运镜"],
    ["subtitlesremove", IMagic, "去字幕"],
  ];
  const referenceStrip = !isSeedanceSelected && displayReferenceAssets.length > 0 ? (
    <div className="wb-reference-area">
      <div className="wb-ref-grid" aria-label="已引用素材">
        {displayReferenceAssets.map((asset) => {
          const title = getMediaTitle(asset);
          const linked = asset.source === "canvas-edge";
          return (
            <span
              className={`wb-ref-slot wb-ref-chip${linked ? " linked" : ""}`}
              key={asset.id || asset.src || asset.token}
              aria-label={title ? `${linked ? "连线参考图" : "引用素材"}：${title}` : (linked ? "连线参考图" : "引用素材")}
              title={linked ? "来自画布连线，删除连线可移除" : title}
            >
              <span className="wb-ref-thumb"><MediaReferenceThumb asset={asset}/></span>
              {!linked && (
                <button type="button" onClick={() => removeAssetReference(asset)} title="移除引用">
                  <IClose size={10}/>
                </button>
              )}
              <WorkbenchReferencePreview asset={asset}/>
            </span>
          );
        })}
      </div>
    </div>
  ) : null;

  const renderSeedanceImageCard = (item) => {
    const linked = item.asset.source === "canvas-edge";
    return (
      <span
        className={`wb-seedance-image-card${linked ? " linked" : ""}`}
        key={item.asset.id || item.asset.src || item.token}
        title={linked ? "来自画布连线" : getMediaTitle(item.asset)}
        onMouseEnter={() => setSeedancePreviewAsset(item.asset)}
        onMouseLeave={() => setSeedancePreviewAsset(null)}
      >
        <span className="wb-seedance-image-thumb"><MediaReferenceThumb asset={item.asset}/></span>
        <span className="wb-seedance-image-label">{item.label}</span>
        {!linked && (
          <button type="button" onClick={() => removeAssetReference({ ...item.asset, token: item.token })} title="移除引用">
            <IClose size={10}/>
          </button>
        )}
        <WorkbenchReferencePreview asset={item.asset}/>
      </span>
    );
  };
  const renderSeedancePortraitCard = (asset) => {
    const src = seedancePortraitAssetImage(asset);
    return (
      <span
        className="wb-seedance-role-card"
        key={asset.assetId || asset.assetRef}
        title={asset.assetRef || asset.assetId}
      >
        <span className="wb-seedance-role-thumb">
          {src ? <img src={src} alt="" loading="lazy" decoding="async" draggable="false" /> : <IImage size={18}/>}
        </span>
        <span className="wb-seedance-role-copy">
          <strong>{seedancePortraitAssetTitle(asset)}</strong>
          <em>Seedence 角色</em>
        </span>
        <button type="button" onClick={() => removeSeedancePortraitAsset(asset)} title="移除角色库引用">
          <IClose size={10}/>
        </button>
      </span>
    );
  };
  const renderSeedanceMediaRow = (item) => (
    <div className="wb-seedance-media-row" key={item.asset.id || item.asset.src || item.token}>
      <span className="wb-seedance-media-token">{item.token}</span>
      <span className="wb-seedance-media-thumb"><MediaReferenceThumb asset={item.asset}/></span>
      <span className="wb-seedance-media-name">{getMediaTitle(item.asset)}</span>
      {item.asset.source !== "canvas-edge" && (
        <button type="button" onClick={() => removeAssetReference({ ...item.asset, token: item.token })} title="移除引用">
          <IClose size={10}/>
        </button>
      )}
    </div>
  );
  const seedanceReferencePicker = isSeedanceSelected && (activeVideoMode !== "text-video" || activeSeedancePortraitAssets.length > 0) ? (
    <div className="wb-seedance-reference-box" data-reference-mode={activeReferenceMode || (useSeedanceNodeReferences ? "omni_reference" : "first_last_frames")}>
      {useSeedanceNodeReferences || activeVideoMode === "text-video" ? (
        <>
          <div className="wb-seedance-image-strip" onWheel={handleReferenceRailWheel} aria-label="Seedance 参考图">
            {activeSeedancePortraitAssets.map(renderSeedancePortraitCard)}
            {seedanceImageItems.map(renderSeedanceImageCard)}
            {activeVideoMode !== "text-video" && seedanceImageItems.length < maxReferenceImages && (
              <button
                type="button"
                className="wb-seedance-add-card"
                onClick={() => seedanceImageInputRef.current?.click()}
                title="上传参考图"
              >
                <IAdd size={15}/>
                <span>图片{seedanceImageItems.length + 1}</span>
              </button>
            )}
          </div>
          {activeVideoMode !== "text-video" && canUseAudioReference && (
            <div className="wb-seedance-audio-section">
              <div className="wb-seedance-audio-label">音频（提示词中用 @音频1, @音频2... 引用）</div>
              {seedanceAudioItems.length > 0 && (
                <div className="wb-seedance-media-list">
                  {seedanceAudioItems.map(renderSeedanceMediaRow)}
                </div>
              )}
              <button type="button" className="wb-seedance-audio-upload" onClick={() => seedanceAudioInputRef.current?.click()}>
                {seedanceAudioItems.length ? "+ 添加音频（≤15s）" : "选择音频文件（≤15s）"}
              </button>
            </div>
          )}
          {activeVideoMode !== "text-video" && seedanceVideoItems.length > 0 && (
            <div className="wb-seedance-video-section">
              <div className="wb-seedance-audio-label">视频（提示词中用 @视频1, @视频2... 引用）</div>
              <div className="wb-seedance-media-list">
                {seedanceVideoItems.map(renderSeedanceMediaRow)}
              </div>
            </div>
          )}
          {activeVideoMode !== "text-video" && <div className="wb-seedance-reference-limit">最多 {maxReferenceImages} 张参考图</div>}
        </>
      ) : (
        <div className="wb-reference-selected-row" onWheel={handleReferenceRailWheel}>
          <div className="wb-reference-selected-main" aria-label="Seedance 首尾帧">
            {activeSeedancePortraitAssets.length > 0 && (
              <div className="wb-seedance-image-strip compact" onWheel={handleReferenceRailWheel} aria-label="Seedance 角色库">
                {activeSeedancePortraitAssets.map(renderSeedancePortraitCard)}
              </div>
            )}
            {displayReferenceAssets.length ? (
              <div className="wb-ref-grid">
                {displayReferenceAssets.map((asset) => {
                  const title = getMediaTitle(asset);
                  const linked = asset.source === "canvas-edge";
                  return (
                    <span
                      className={`wb-ref-slot wb-ref-chip${linked ? " linked" : ""}`}
                      key={asset.id || asset.src || asset.token}
                      title={linked ? "来自画布连线" : title}
                      onMouseEnter={() => setSeedancePreviewAsset(asset)}
                      onMouseLeave={() => setSeedancePreviewAsset(null)}
                    >
                      <span className="wb-ref-thumb"><MediaReferenceThumb asset={asset}/></span>
                      {!linked && (
                        <button type="button" onClick={() => removeAssetReference(asset)} title="移除引用">
                          <IClose size={10}/>
                        </button>
                      )}
                      <WorkbenchReferencePreview asset={asset}/>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="wb-reference-selected-empty">首尾帧需要 2 张参考图</div>
            )}
          </div>
          <button type="button" className="wb-reference-upload" onClick={openUploadPicker}>
            <IAdd size={13}/>
            <span>上传素材</span>
          </button>
        </div>
      )}
      {seedancePreviewAsset && <WorkbenchReferencePreview asset={seedancePreviewAsset} floating/>}
    </div>
  ) : null;

    return (
      <div
        ref={workbenchElementRef}
        className={`node-workbench ${isVideo ? "video-workbench" : "image-workbench"}`}
      data-node-workbench-id={node.id}
      style={{ left: 0, top: 0, width: workbenchW, transform: formatWorkbenchPositionTransform(left, top) }}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="node-workbench-file-input"
        multiple
        accept={isVideo ? MEDIA_UPLOAD_ACCEPT : IMAGE_UPLOAD_ACCEPT}
        onChange={(event) => handleUploadFiles(event.target.files)}
      />
      <input
        ref={seedanceImageInputRef}
        type="file"
        className="node-workbench-file-input"
        multiple
        accept={IMAGE_UPLOAD_ACCEPT}
        onChange={(event) => handleUploadFiles(event.target.files)}
      />
      <input
        ref={seedanceAudioInputRef}
        type="file"
        className="node-workbench-file-input"
        multiple
        accept={AUDIO_UPLOAD_ACCEPT}
        onChange={(event) => handleUploadFiles(event.target.files)}
      />
      {!isVideo && (
        <div className="wb-top">
          <div className="wb-tool-row">
            {imageTools.map(([kind, IconComp, label]) => {
              const isStyleTool = kind === "stylelib";
              const toolLabel = isStyleTool && selectedStyleName ? selectedStyleName : label;
              return (
                <button
                  key={kind}
                  type="button"
                  className={`wb-tool ${isStyleTool && selectedStyle ? "active" : ""}`}
                  onClick={() => openWorkbenchTool(kind)}
                  title={isStyleTool && selectedStyleName ? `已选择风格：${selectedStyleName}` : label}
                >
                  <IconComp size={14}/>
                  <span>{toolLabel}</span>
                </button>
              );
            })}
            <button type="button" className="wb-tool" onClick={openUploadPicker} title="上传本地图片">
              {uploading ? <ISparkle size={14}/> : <IAdd size={14}/>}
              <span>{uploading ? "上传中" : "上传"}</span>
            </button>
          </div>
        </div>
      )}

      {isVideo && (
        <div className="wb-tool-row">
          {videoTools.map(([kind, IconComp, label]) => (
            <button key={kind} type="button" className="wb-tool" onClick={() => onOpenModal?.(kind, node.id)}>
              <IconComp size={14}/>
              <span>{label}</span>
            </button>
          ))}
          <button type="button" className="wb-tool" onClick={openUploadPicker} title="上传本地素材">
            {uploading ? <ISparkle size={14}/> : <IAdd size={14}/>}
            <span>{uploading ? "上传中" : "上传"}</span>
          </button>
          {supportsSeedancePortraitAssets && (
            <button type="button" className="wb-tool" onClick={openSeedancePortraitLibrary} title="打开 Seedence 角色库">
              <IImage size={14}/>
              <span>角色库</span>
            </button>
          )}
        </div>
      )}

      {seedanceReferencePicker}
      {referenceStrip}

      <div className="wb-prompt-box">
        {useRichPromptEditor ? (
          <div
            ref={promptRef}
            className="wb-prompt wb-prompt-rich"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={isVideo ? "视频提示词输入框" : "图片提示词输入框"}
            data-placeholder={placeholder}
            spellCheck={false}
            style={{ height: promptTextareaHeight }}
            onInput={handlePromptInput}
            onCompositionStart={handlePromptCompositionStart}
            onCompositionEnd={handlePromptCompositionEnd}
            onPointerDown={handlePromptPointerDown}
            onPointerUp={handlePromptPointerUp}
            onKeyDown={handlePromptKeyDown}
            onKeyUp={(e) => {
              if (isPromptComposingRef.current || e.nativeEvent?.isComposing) return;
              updateMentionFromPromptEditor(e.currentTarget);
            }}
            onClick={(e) => updateMentionFromPromptEditor(e.currentTarget)}
            onMouseOver={handleInlineMentionMouseOver}
            onMouseOut={handleInlineMentionMouseOut}
            onPointerMove={handleInlineMentionPointerMove}
            onMouseMove={handleInlineMentionPointerMove}
            onPointerLeave={hidePromptMentionPreview}
            onMouseLeave={hidePromptMentionPreview}
            onBlur={hidePromptMentionPreview}
            onScroll={() => {
              hidePromptMentionPreview();
              if (promptRef.current) updateMentionFromPromptEditor(promptRef.current);
            }}
            onWheel={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            {usePromptHighlightOverlay && (
              <div
                ref={promptHighlightRef}
                className="wb-prompt-highlight"
                style={promptHighlightStyle}
                aria-hidden="true"
              >
                {renderPromptHighlightParts(prompt, promptMentionItems, {
                  onTokenMouseDown: focusPromptFromHighlightToken,
                  onTokenMouseEnter: showPromptMentionPreview,
                  onTokenMouseMove: showPromptMentionPreview,
                  onTokenMouseLeave: hidePromptMentionPreview,
                })}
              </div>
            )}
            <textarea
              ref={promptRef}
              className={`wb-prompt wb-prompt-textarea ${usePromptHighlightOverlay ? "wb-prompt-textarea-with-highlight" : ""}`}
              value={prompt}
              style={{ height: promptTextareaHeight }}
              aria-label={isVideo ? "视频提示词输入框" : "图片提示词输入框"}
              placeholder={placeholder}
              spellCheck={false}
              onChange={handlePromptTextareaChange}
              onCompositionStart={handleTextareaCompositionStart}
              onCompositionEnd={handleTextareaCompositionEnd}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={handlePromptTextareaKeyDown}
              onKeyUp={(e) => {
                if (isPromptComposingRef.current || e.nativeEvent?.isComposing) return;
                updateMentionFromTextarea(e.currentTarget);
              }}
              onClick={(e) => updateMentionFromTextarea(e.currentTarget)}
              onSelect={(e) => updateMentionFromTextarea(e.currentTarget)}
              onMouseMove={hidePromptMentionPreview}
              onPointerMove={hidePromptMentionPreview}
              onScroll={(e) => {
                syncPromptHighlightScroll(e.currentTarget);
                hidePromptMentionPreview();
                updateMentionFromTextarea(e.currentTarget);
              }}
              onWheel={(e) => e.stopPropagation()}
            />
          </>
        )}
        <button
          type="button"
          className="wb-prompt-resize-handle"
          aria-label="拖拽调整提示词框高度"
          title="拖拽调整提示词框高度"
          onPointerDown={handlePromptResizePointerDown}
          onClick={(event) => event.preventDefault()}
        />
        {promptMentionPreview && (
          <PromptMentionHoverPreview asset={promptMentionPreview.asset} style={promptMentionPreview.style}/>
        )}

      {mention && (
        <div
          className="wb-at-menu"
          style={mentionMenuStyle || undefined}
          onMouseDown={(event) => event.preventDefault()}
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="wb-at-head">
            <span>@ 引用素材</span>
          </div>
          {useSeedanceNodeReferences ? (
            (filteredSeedanceMentionItems.length || filteredSeedancePortraitMentionItems.length) ? (
              <>
                {filteredSeedanceMentionItems.map((item) => (
                  <button
                    key={`${item.kind}-${item.index}-${item.asset.id || item.asset.src}`}
                    type="button"
                    className="wb-at-item"
                    onClick={() => insertSeedanceReference(item)}
                  >
                    <span className="wb-at-thumb">
                      <MediaReferenceThumb asset={item.asset}/>
                    </span>
                    <span className="wb-at-main">
                      <strong>{item.label}</strong>
                    </span>
                  </button>
                ))}
                {filteredSeedancePortraitMentionItems.map((item) => (
                  <button
                    key={`seedance-role-${item.asset.assetId || item.asset.assetRef}`}
                    type="button"
                    className="wb-at-item"
                    onClick={() => insertSeedancePortraitReference(item)}
                  >
                    <span className="wb-at-thumb">
                      {seedancePortraitAssetImage(item.asset) ? (
                        <img src={seedancePortraitAssetImage(item.asset)} alt="" loading="lazy" decoding="async" draggable="false" />
                      ) : <IImage size={16}/>}
                    </span>
                    <span className="wb-at-main">
                      <strong>{seedancePortraitAssetTitle(item.asset)}</strong>
                      <span>Seedence 角色库</span>
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <div className="wb-at-empty">先上传参考图、音频或角色库素材</div>
            )
          ) : (filteredMentionAssets.length || filteredSeedancePortraitMentionItems.length) ? (
            <>
              {filteredMentionAssets.map((asset) => {
                const src = getMediaSrc(asset);
                const title = getMediaTitle(asset);
                return (
                  <button
                    key={asset.id || src}
                    type="button"
                    className="wb-at-item"
                    onClick={() => insertAssetReference(asset)}
                  >
                    <span className="wb-at-thumb">
                      <MediaReferenceThumb asset={asset}/>
                    </span>
                    <span className="wb-at-main">
                      <strong>{title}</strong>
                    </span>
                  </button>
                );
              })}
              {filteredSeedancePortraitMentionItems.map((item) => (
                <button
                  key={`seedance-role-${item.asset.assetId || item.asset.assetRef}`}
                  type="button"
                  className="wb-at-item"
                  onClick={() => insertSeedancePortraitReference(item)}
                >
                  <span className="wb-at-thumb">
                    {seedancePortraitAssetImage(item.asset) ? (
                      <img src={seedancePortraitAssetImage(item.asset)} alt="" loading="lazy" decoding="async" draggable="false" />
                    ) : <IImage size={16}/>}
                  </span>
                  <span className="wb-at-main">
                    <strong>{seedancePortraitAssetTitle(item.asset)}</strong>
                    <span>Seedence 角色库</span>
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className="wb-at-empty">先上传或从资产库添加到当前节点参考列表</div>
          )}
        </div>
      )}
      </div>

      <div className="wb-bottom">
        {isVideo && (
          <div className="wb-control-anchor wb-mode-anchor">
            <button
              type="button"
              className={`wb-control wb-mode-control ${openPanel === "mode" ? "active" : ""}`}
              aria-label="模式选择"
              aria-haspopup="listbox"
              aria-expanded={openPanel === "mode"}
              onClick={() => setOpenPanel(openPanel === "mode" ? null : "mode")}
            >
              <span className="wb-control-label">模式</span>
              <strong className="wb-mode-value">{selectedModeOption.label}</strong>
              <IChevD size={10}/>
            </button>
            {openPanel === "mode" && (
              <div className="wb-pop wb-mode-menu" role="listbox" aria-label="模式选择">
                {videoModeOptions.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="option"
                    data-mode={item.key}
                    aria-selected={activeVideoMode === item.key}
                    disabled={item.disabled}
                    className={`mode-option ${activeVideoMode === item.key ? "active" : ""}`}
                    onClick={() => chooseVideoMode(item.key)}
                  >
                    <span>{item.label}</span>
                    {activeVideoMode === item.key && <ICheck size={13}/>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="wb-control-anchor wb-model-anchor">
          <button
            type="button"
            className="wb-control wb-model"
            title={displayModel}
            onClick={() => setOpenPanel(openPanel === "model" ? null : "model")}
          >
            {isVideo ? <IVideo size={13}/> : <ISparkle size={13}/>}
            <span>{displayModel}</span>
            <IChevD size={10}/>
          </button>
          {openPanel === "model" && (
            <div className="wb-pop wb-model-pop">
              <h4>模型</h4>
              <div className="model-list">
                {models.length ? models.map((value) => {
                  const optionLabel = modelLabel(value);
                  return (
                    <button
                      key={value.id}
                      type="button"
                      className={`model-option ${selectedModel?.id === value.id ? "active" : ""}`}
                      title={optionLabel}
                      onClick={() => chooseModel(value)}
                    >
                      <span>{optionLabel}</span>
                      {selectedModel?.id === value.id && <ICheck size={13}/>}
                    </button>
                  );
                }) : (
                  <button type="button" className="model-option" disabled>
                    <span>暂无可用模型</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          ref={paramButtonRef}
          type="button"
          className={`wb-control wb-param-control ${openPanel === "params" ? "active" : ""}`}
          onClick={() => setOpenPanel(openPanel === "params" ? null : "params")}
          title={paramTitle}
        >
          <IGear size={13}/>
          参数设置
        </button>
        {!isVideo && (
          <button type="button" className="wb-control" onClick={() => onOpenModal?.("camctrl-image", node.id)}>
            <ICamera size={13}/>
            摄像机
          </button>
        )}
        <span className="wb-sep"/>
        <button
          type="button"
          className="wb-control"
          onClick={() => onOpenModal?.("textpolish", node.id)}
          title="润色当前提示词"
        >
          <IText size={13}/>
          润色
        </button>
        <button type="button" className="wb-control" onClick={() => {
          const next = count % 4 + 1;
          setCount(next);
          updateUserParams({ count: next });
        }}>
          {count}{isVideo ? "个" : "张"}
        </button>
        {videoModeError && (
          <span className="wb-limit-note">{videoModeError}</span>
        )}

        {openPanel === "params" && (
          <div ref={paramsPanelRef} className="wb-pop wb-params-pop">
            <h4>比例</h4>
            <div className="ratio-grid">
              {ratioOptions.map((value) => {
                const [w, h] = ratioShape(value);
                return (
                <button key={value} type="button" className={`ratio-card ${ratio === value ? "active" : ""}`} onClick={() => chooseRatio(value)}>
                  <span className="shape" style={{ width:w, height:h }}/>
                  <span>{value}</span>
                </button>
              );})}
            </div>
            {includeResolution && (
              <>
                <h4>清晰度</h4>
                <div className="res-row">
                  {resolutionOptions.map(value => (
                    <button key={value} type="button" className={`res-btn ${resolution === value ? "active" : ""}`} onClick={() => chooseResolution(value)}>
                      {value}
                    </button>
                  ))}
                </div>
              </>
            )}
            {includeSeedanceMode && seedanceModeOptions.length > 0 && (
              <>
                <h4>官方档位</h4>
                <div className="res-row">
                  {seedanceModeOptions.map((option) => (
                    <button key={option.key} type="button" className={`res-btn ${activeSeedanceMode === option.key ? "active" : ""}`} onClick={() => chooseSeedanceMode(option.key)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {isVideo && (
                <>
                  <h4>视频时长</h4>
                  <div className={`duration-row ${useDurationSlider ? "slider" : ""}`}>
                    {useDurationSlider ? (
                      <div className="duration-slider">
                        <div className="duration-slider-head">
                          <span>{durationMin}s</span>
                          <strong>{duration}s</strong>
                          <span>{durationMax}s</span>
                        </div>
                        <input
                          className="duration-slider-control"
                          type="range"
                          min={durationMin}
                          max={durationMax}
                          step="1"
                          value={duration}
                          onInput={(e) => previewDuration(Number(e.currentTarget.value))}
                          onChange={(e) => previewDuration(Number(e.target.value))}
                          onPointerUp={(e) => chooseDuration(Number(e.currentTarget.value))}
                          onPointerCancel={(e) => chooseDuration(Number(e.currentTarget.value))}
                          onKeyUp={(e) => chooseDuration(Number(e.currentTarget.value))}
                          onBlur={(e) => chooseDuration(Number(e.currentTarget.value))}
                        />
                      </div>
                    ) : durationOptions.length ? (
                      durationOptions.map((value) => (
                        <button key={value} type="button" className={`res-btn ${Number(duration) === value ? "active" : ""}`} onClick={() => chooseDuration(value)}>
                          {value}s
                        </button>
                      ))
                  ) : (
                    <input type="range" min="3" max="20" value={duration} onChange={(e) => chooseDuration(Number(e.target.value))}/>
                    )}
                    {!useDurationSlider && <span>{duration}s</span>}
                  </div>
                {includeGenerateAudio && (
                  <>
                    <h4>生成音频</h4>
                    <div className="audio-row">
                      <button type="button" className={`audio-btn ${audioOn ? "active" : ""}`} onClick={() => toggleAudio(true)}>开启</button>
                      <button type="button" className={`audio-btn ${!audioOn ? "active" : ""}`} onClick={() => toggleAudio(false)}>关闭</button>
                      <span/>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
        <button type="button" className="wb-submit" disabled={!canGenerate} onClick={handleGenerate} title="生成">
          <IArrow size={15} style={{ transform: "rotate(-90deg)" }}/>
        </button>
      </div>
    </div>
  );
}
