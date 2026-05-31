function nodeId() {
  return `dsgn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cardType(card) {
  if (card?.type === 'scene' || card?.type === 'prop') {
    return card.type;
  }
  return 'character';
}

function tagForCard(card) {
  const type = cardType(card);
  if (type === 'scene') {
    return '场景设定';
  }
  if (type === 'prop') {
    return '道具设定';
  }
  return '人物设定';
}

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function mediaString(value) {
  const text = compactString(value);
  if (!text) return '';
  if (/^(https?:|data:|blob:|libai-asset:)/i.test(text)) return text;
  if (text.startsWith('/')) return text;
  if (/^[A-Za-z]:[\\/]/.test(text)) return text;
  return '';
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstMediaString(value, seen = new Set()) {
  if (typeof value === 'string') return mediaString(value);
  if (!value || typeof value !== 'object') return '';
  if (seen.has(value)) return '';
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = firstMediaString(item, seen);
      if (resolved) return resolved;
    }
    return '';
  }

  const keys = ['assetUrl', 'url', 'src', 'imageUrl', 'assetPath', 'localPath', 'path'];
  for (const key of keys) {
    const resolved = firstMediaString(value[key], seen);
    if (resolved) return resolved;
  }
  return '';
}

function firstMediaFrom(...values) {
  for (const value of values) {
    const resolved = firstMediaString(value);
    if (resolved) return resolved;
  }
  return '';
}

export function createDesignImageNode({
  card = {},
  version = {},
  position = { x: 200, y: 200 },
} = {}) {
  const type = cardType(card);
  const x = finiteNumber(position?.x, 200);
  const y = finiteNumber(position?.y, 200);
  const src = firstMediaFrom(version.assetUrl, version.url, version.src, version.assetPath, version.localPath);

  return {
    id: nodeId(),
    type: 'image',
    x,
    y,
    w: type === 'character' ? 480 : 420,
    h: 320,
    title: compactString(card.name) || '设计资产',
    tag: tagForCard(card),
    src,
    assetId: compactString(version.assetId),
    assetPath: compactString(version.assetPath) || compactString(version.localPath),
    prompt: compactString(version.prompt),
    model: compactString(version.model),
    designSpace: {
      cardId: compactString(card.id),
      cardType: type,
      versionId: compactString(version.id),
    },
  };
}
