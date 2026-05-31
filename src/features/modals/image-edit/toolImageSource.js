import { makeAssetUrl } from '../../../shared/platform/backendClient.js';

function firstNonEmpty(values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
}

function isBrowserLoadableImageSource(value) {
  if (!value) return false;
  return /^(https?:|data:|blob:|libai-asset:)/i.test(value) || value.startsWith('/assets/');
}

function assetIdFromPath(value) {
  if (typeof value !== 'string') return '';
  const match = value.match(/(?:^|[\\/])(asset_[A-Za-z0-9_-]+)/);
  return match?.[1] || '';
}

function normalizeToolImageSource(source) {
  if (typeof source === 'string') return { src: source };
  return source && typeof source === 'object' ? source : {};
}

export function toolImageSourceKey(source) {
  const input = normalizeToolImageSource(source);
  return [
    input.src,
    input.url,
    input.assetUrl,
    input.imageUrl,
    input.poster,
    input.videoSrc,
    input.assetId,
    input.id,
    input.assetPath,
    input.localPath,
    input.path,
  ].map((value) => String(value || '')).join('\u0001');
}

function pushUniqueImageCandidate(list, seen, url) {
  if (!url) return;
  const normalizedUrl = toSameOriginAssetUrl(url);
  if (!normalizedUrl || seen.has(normalizedUrl)) return;
  seen.add(normalizedUrl);
  list.push({
    url: normalizedUrl,
    crossOrigin: shouldUseAnonymousCors(normalizedUrl) ? 'anonymous' : '',
  });
}

function toSameOriginAssetUrl(url) {
  if (!url || typeof window === 'undefined') return url;
  try {
    const parsed = new URL(url, window.location.href);
    const isLocalBackend = (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')
      && parsed.port === '8765'
      && parsed.pathname.startsWith('/assets/');
    if (isLocalBackend && window.location.port === '5177') {
      return `${parsed.pathname}${parsed.search || ''}`;
    }
  } catch {
    return url;
  }
  return url;
}

function shouldUseAnonymousCors(url) {
  if (!url || !/^https?:/i.test(url)) return false;
  try {
    const parsed = new URL(url, typeof window === 'undefined' ? undefined : window.location.href);
    const host = parsed.hostname.toLowerCase();
    return (host === '127.0.0.1' || host === 'localhost') && parsed.pathname.startsWith('/assets/');
  } catch {
    return false;
  }
}

export function resolveToolImageCandidates(source, backendBaseUrl) {
  const input = normalizeToolImageSource(source);
  const rawCandidates = [
    input.src,
    input.url,
    input.assetUrl,
    input.imageUrl,
    input.poster,
    input.videoSrc,
    input.assetPath,
    input.localPath,
    input.path,
  ].map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean);

  const results = [];
  const seen = new Set();
  for (const candidate of rawCandidates) {
    if (!isBrowserLoadableImageSource(candidate)) continue;
    pushUniqueImageCandidate(results, seen, makeAssetUrl({ src: candidate }, backendBaseUrl));
  }

  const localPathCandidates = [
    input.assetPath,
    input.localPath,
    input.path,
  ].map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean);
  for (const localPath of localPathCandidates) {
    pushUniqueImageCandidate(results, seen, makeAssetUrl({
      src: localPath,
      assetPath: localPath,
      localPath,
      path: localPath,
      preferLocalAsset: true,
    }, backendBaseUrl));
  }

  const assetIds = [
    input.assetId,
    input.id,
    assetIdFromPath(input.assetPath),
    ...rawCandidates.map(assetIdFromPath),
  ].map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean);
  for (const assetId of assetIds) {
    pushUniqueImageCandidate(results, seen, makeAssetUrl({ id: assetId, src: '' }, backendBaseUrl));
  }

  if (!results.length) {
    const fallbackSource = firstNonEmpty(rawCandidates);
    pushUniqueImageCandidate(results, seen, makeAssetUrl({ src: fallbackSource }, backendBaseUrl));
  }

  return results;
}

export function resolveToolImageUrl(source, backendBaseUrl) {
  return resolveToolImageCandidates(source, backendBaseUrl)[0] || { url: '', crossOrigin: '' };
}
