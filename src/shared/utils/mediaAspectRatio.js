const DEFAULT_MEDIA_CHROME_HEIGHT = 58;

function finitePositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function firstFinite(values) {
  for (const value of values) {
    const number = finitePositive(value);
    if (number) return number;
  }
  return 0;
}

function dimensionsFrom(value) {
  if (!value || typeof value !== 'object') return null;
  const width = firstFinite([
    value.width,
    value.w,
    value.naturalWidth,
    value.videoWidth,
    value.assetWidth,
    value?.dimensions?.width,
    value?.dimensions?.w,
    value?.asset?.width,
    value?.metadata?.width,
    value?.meta?.width,
  ]);
  const height = firstFinite([
    value.height,
    value.h,
    value.naturalHeight,
    value.videoHeight,
    value.assetHeight,
    value?.dimensions?.height,
    value?.dimensions?.h,
    value?.asset?.height,
    value?.metadata?.height,
    value?.meta?.height,
  ]);
  return width && height ? { width, height } : null;
}

export function parseMediaAspectRatio(value) {
  if (!value) return 0;
  if (typeof value === 'number') return finitePositive(value);
  if (typeof value === 'object') {
    const dimensions = dimensionsFrom(value);
    if (dimensions) return dimensions.width / dimensions.height;
    return parseMediaAspectRatio(value.aspectRatio || value.aspect_ratio || value.ratio);
  }

  const text = String(value).trim().toLowerCase();
  if (!text) return 0;
  const pair = text.match(/^(\d+(?:\.\d+)?)\s*[:x/]\s*(\d+(?:\.\d+)?)$/);
  if (pair) {
    const width = finitePositive(pair[1]);
    const height = finitePositive(pair[2]);
    return width && height ? width / height : 0;
  }
  return finitePositive(text);
}

export function mediaDimensionsFromJob(job = {}) {
  const output = job.output || {};
  const input = job.input || {};
  return dimensionsFrom(output)
    || dimensionsFrom(output.asset)
    || dimensionsFrom(output.metadata)
    || dimensionsFrom(output.meta)
    || dimensionsFrom(input);
}

export function mediaAspectRatioFromJob(job = {}) {
  const output = job.output || {};
  const input = job.input || {};
  const dimensions = mediaDimensionsFromJob(job);
  if (dimensions) return dimensions.width / dimensions.height;

  return parseMediaAspectRatio(output.aspectRatio)
    || parseMediaAspectRatio(output.aspect_ratio)
    || parseMediaAspectRatio(output.ratio)
    || parseMediaAspectRatio(output.asset?.aspectRatio || output.asset?.aspect_ratio || output.asset?.ratio)
    || parseMediaAspectRatio(output.metadata?.aspectRatio || output.metadata?.aspect_ratio || output.metadata?.ratio)
    || parseMediaAspectRatio(input.aspectRatio)
    || parseMediaAspectRatio(input.aspect_ratio)
    || parseMediaAspectRatio(input.ratio)
    || parseMediaAspectRatio(input.params?.aspectRatio)
    || parseMediaAspectRatio(input.params?.ratio);
}

export function buildGeneratedMediaAspectPatch({ kind, node = {}, job = {} } = {}) {
  if (kind !== 'image' && kind !== 'video') return {};
  const aspectRatio = mediaAspectRatioFromJob(job);
  if (!aspectRatio) return {};

  const currentWidth = finitePositive(node.w) || (kind === 'video' ? 340 : 320);
  const width = Math.max(kind === 'video' ? 240 : 260, Math.round(currentWidth));
  const mediaHeight = Math.max(kind === 'video' ? 135 : 150, Math.round(width / aspectRatio));
  const dimensions = mediaDimensionsFromJob(job);
  const patch = {
    w: width,
    h: mediaHeight + DEFAULT_MEDIA_CHROME_HEIGHT,
    mediaAspectRatio: aspectRatio,
  };
  if (dimensions) {
    patch.assetWidth = Math.round(dimensions.width);
    patch.assetHeight = Math.round(dimensions.height);
  }
  return patch;
}
