export const DEFAULT_STYLE_TAGS = ['古风', '真人短剧', '都市', '民国', '赛博朋克', '奇幻', '校园', '悬疑'];

export const ASSET_TYPES = [
  { key: 'person', label: '人物' },
  { key: 'scene', label: '场景' },
  { key: 'prop', label: '道具' },
];

export function normalizeLabel(value, max = 24) {
  return String(value || '').trim().slice(0, max);
}

export function normalizeTags(tags) {
  return Array.from(new Set((Array.isArray(tags) ? tags : [])
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .map((tag) => tag.slice(0, 24))));
}

export function normalizeAssetType(value) {
  const raw = normalizeLabel(value);
  const matched = ASSET_TYPES.find((item) => item.key === raw || item.label === raw);
  return matched?.key || raw || 'person';
}

export function getAssetTypeLabel(type) {
  const key = normalizeAssetType(type);
  return ASSET_TYPES.find((item) => item.key === key)?.label || key;
}

export function isVisualKind(kind) {
  return kind === 'image' || kind === 'video';
}

export function makeVisualTaxonomyMeta({ styleTag, assetType } = {}) {
  const style = normalizeLabel(styleTag) || DEFAULT_STYLE_TAGS[0];
  const type = normalizeAssetType(assetType);
  return {
    styleTag: style,
    styleTags: [style],
    assetStyle: style,
    assetType: type,
    visualType: type,
    imageCategory: type,
    category: type,
  };
}
