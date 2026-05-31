const MIN_REGION_SIZE = 32;

function finiteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, finiteNumber(value, min)));
}

export function normalizeVideoSize(size = {}) {
  const width = Math.max(1, Math.round(finiteNumber(size.width, 1)));
  const height = Math.max(1, Math.round(finiteNumber(size.height, 1)));
  return { width, height };
}

function normalizeFrameRect(frameRect = {}) {
  return {
    left: finiteNumber(frameRect.left, 0),
    top: finiteNumber(frameRect.top, 0),
    width: Math.max(1, finiteNumber(frameRect.width, 16)),
    height: Math.max(1, finiteNumber(frameRect.height, 9)),
  };
}

export function containedVideoRect(frameRect = {}, videoSize = {}) {
  const frame = normalizeFrameRect(frameRect);
  const size = normalizeVideoSize(videoSize);
  const videoAspect = size.width / size.height;
  const frameAspect = frame.width / frame.height;
  if (frameAspect > videoAspect) {
    const width = frame.height * videoAspect;
    return {
      left: frame.left + ((frame.width - width) / 2),
      top: frame.top,
      width,
      height: frame.height,
    };
  }
  const height = frame.width / videoAspect;
  return {
    left: frame.left,
    top: frame.top + ((frame.height - height) / 2),
    width: frame.width,
    height,
  };
}

export function normalizeSubtitleRegion(region = {}, videoSize = {}) {
  const size = normalizeVideoSize(videoSize);
  const minWidth = Math.min(MIN_REGION_SIZE, size.width);
  const minHeight = Math.min(MIN_REGION_SIZE, size.height);
  const width = Math.max(minWidth, Math.round(finiteNumber(region.width, minWidth)));
  const height = Math.max(minHeight, Math.round(finiteNumber(region.height, minHeight)));
  const maxX = Math.max(0, size.width - width);
  const maxY = Math.max(0, size.height - height);
  const x = Math.round(clampNumber(region.x, 0, maxX));
  const y = Math.round(clampNumber(region.y, 0, maxY));
  return {
    x,
    y,
    width: Math.min(width, size.width - x),
    height: Math.min(height, size.height - y),
  };
}

export function defaultSubtitleRegion(videoSize = {}) {
  const size = normalizeVideoSize(videoSize);
  return normalizeSubtitleRegion({
    x: size.width * 0.1,
    y: size.height * 0.76,
    width: size.width * 0.8,
    height: size.height * 0.15,
  }, size);
}

function pointToVideo(point = {}, frameRect = {}, videoSize = {}) {
  const size = normalizeVideoSize(videoSize);
  const content = containedVideoRect(frameRect, size);
  const localX = clampNumber(finiteNumber(point.clientX) - content.left, 0, content.width);
  const localY = clampNumber(finiteNumber(point.clientY) - content.top, 0, content.height);
  return {
    x: (localX / content.width) * size.width,
    y: (localY / content.height) * size.height,
  };
}

export function regionFromClientDrag(startPoint, currentPoint, frameRect, videoSize) {
  const start = pointToVideo(startPoint, frameRect, videoSize);
  const current = pointToVideo(currentPoint, frameRect, videoSize);
  const left = Math.min(start.x, current.x);
  const top = Math.min(start.y, current.y);
  return normalizeSubtitleRegion({
    x: left,
    y: top,
    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
  }, videoSize);
}

function percent(value) {
  return `${Number(value.toFixed(4)).toString()}%`;
}

export function subtitleRegionStyle(region, videoSize = {}, frameRect = { width: 16, height: 9 }) {
  const size = normalizeVideoSize(videoSize);
  const frame = normalizeFrameRect(frameRect);
  const content = containedVideoRect({ width: frame.width, height: frame.height }, size);
  const normalized = normalizeSubtitleRegion(region, size);
  return {
    left: percent(((content.left + ((normalized.x / size.width) * content.width)) / frame.width) * 100),
    top: percent(((content.top + ((normalized.y / size.height) * content.height)) / frame.height) * 100),
    width: percent(((normalized.width / size.width) * content.width / frame.width) * 100),
    height: percent(((normalized.height / size.height) * content.height / frame.height) * 100),
  };
}

export function isUsableSubtitleRegion(region, videoSize = {}) {
  const size = normalizeVideoSize(videoSize);
  const normalized = normalizeSubtitleRegion(region, size);
  return normalized.width >= MIN_REGION_SIZE && normalized.height >= MIN_REGION_SIZE;
}
