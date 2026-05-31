function normalizeLocalPathForUrl(filePath) {
  return String(filePath || "").trim().replace(/\\/g, "/");
}

function encodePathForUrl(normalizedPath) {
  return normalizedPath
    .split("/")
    .map((segment, index) => {
      if (!segment) return segment;
      if (index === 0 && /^[A-Za-z]:$/.test(segment)) return segment;
      return encodeURIComponent(segment);
    })
    .join("/");
}

function safeDecodePath(value) {
  try {
    return decodeURIComponent(value);
  } catch (_) {
    try {
      return decodeURI(value);
    } catch (_error) {
      return value;
    }
  }
}

function localAssetUrlFromPath(filePath) {
  const normalized = normalizeLocalPathForUrl(filePath);
  if (!normalized) return "";

  const encoded = encodePathForUrl(normalized);
  if (normalized.startsWith("//")) {
    return `libai-asset://${encoded}`;
  }
  if (/^[A-Za-z]:\//.test(normalized)) {
    return `libai-asset:///${encoded}`;
  }
  if (normalized.startsWith("/")) {
    return `libai-asset://${encoded}`;
  }
  return `libai-asset:///${encoded}`;
}

function localPathFromLibaiAssetUrl(source) {
  const text = String(source || "").trim();
  if (!/^libai-asset:\/\//i.test(text)) return "";

  const afterScheme = text.replace(/^libai-asset:/i, "");
  if (afterScheme.startsWith("////")) {
    return safeDecodePath(afterScheme.slice(2));
  }
  if (afterScheme.startsWith("///")) {
    const decoded = safeDecodePath(afterScheme.slice(3));
    return /^[A-Za-z]:\//.test(decoded) ? decoded : `/${decoded}`;
  }
  if (afterScheme.startsWith("//")) {
    return safeDecodePath(afterScheme.slice(2));
  }
  return "";
}

module.exports = {
  localAssetUrlFromPath,
  localPathFromLibaiAssetUrl,
};
