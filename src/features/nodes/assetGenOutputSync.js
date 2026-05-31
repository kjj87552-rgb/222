const ASSET_GEN_OUTPUT_SOURCE = 'asset-gen-output';
const DOWNSTREAM_REFERENCE_NODE_TYPES = new Set(['image', 'video']);

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values = []) {
  const seen = new Set();
  return (Array.isArray(values) ? values : []).map(compactString).filter((value) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function isReferenceTarget(node) {
  return DOWNSTREAM_REFERENCE_NODE_TYPES.has(String(node?.type || '').trim());
}

function isGeneratedAssetReference(asset, assetGenNodeId) {
  return asset?.source === ASSET_GEN_OUTPUT_SOURCE && asset?.sourceNodeId === assetGenNodeId;
}

function referenceKey(asset) {
  return compactString(asset?.src || asset?.url || asset?.assetUrl || asset?.id);
}

function mergeReferenceAssets(existing = [], incoming = []) {
  const refs = [];
  const indexByKey = new Map();
  [...(Array.isArray(existing) ? existing : []), ...(Array.isArray(incoming) ? incoming : [])].forEach((asset) => {
    const key = referenceKey(asset);
    if (!key) return;
    if (indexByKey.has(key)) {
      refs[indexByKey.get(key)] = { ...refs[indexByKey.get(key)], ...asset };
      return;
    }
    indexByKey.set(key, refs.length);
    refs.push(asset);
  });
  return refs.slice(-12);
}

function sameReferences(a = [], b = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((item, index) => JSON.stringify(item) === JSON.stringify(b[index]));
}

export function buildAssetGenOutputReferences({
  assetGenNodeId = '',
  assetGenTitle = '资产生成',
  urls = [],
  jobId = '',
  assetId = '',
  assetPath = '',
  projectId = '',
} = {}) {
  const sourceNodeId = compactString(assetGenNodeId);
  if (!sourceNodeId) return [];
  const cleanUrls = uniqueStrings(urls);
  const title = compactString(assetGenTitle) || '资产生成';
  return cleanUrls.map((src, index) => ({
    id: `${ASSET_GEN_OUTPUT_SOURCE}:${sourceNodeId}:${index}`,
    kind: 'image',
    src,
    url: src,
    assetUrl: src,
    thumbUrl: src,
    thumbnailUrl: src,
    title: cleanUrls.length > 1 ? `${title} 输出 ${index + 1}` : `${title} 输出`,
    source: ASSET_GEN_OUTPUT_SOURCE,
    sourceNodeId,
    jobId: compactString(jobId),
    assetId: index === 0 ? compactString(assetId) : '',
    assetPath: index === 0 ? compactString(assetPath) : '',
    projectId: compactString(projectId),
  }));
}

export function syncAssetGenOutputToDownstreamReferences({
  nodes = [],
  edges = [],
  assetGenNodeId = '',
  excludeNodeId = '',
  references = [],
} = {}) {
  const sourceNodeId = compactString(assetGenNodeId);
  if (!sourceNodeId || !Array.isArray(nodes) || !nodes.length) return nodes;
  const cleanReferences = (Array.isArray(references) ? references : []).filter((asset) => (
    asset?.kind === 'image' && referenceKey(asset)
  ));
  if (!cleanReferences.length) return nodes;
  const excluded = compactString(excludeNodeId);
  const targetIds = new Set((Array.isArray(edges) ? edges : [])
    .filter((edge) => edge?.from === sourceNodeId && edge?.to && edge.to !== excluded)
    .map((edge) => edge.to));
  if (!targetIds.size) return nodes;

  let changed = false;
  const nextNodes = nodes.map((node) => {
    if (!targetIds.has(node?.id) || !isReferenceTarget(node)) return node;
    const currentRefs = Array.isArray(node.referenceAssets) ? node.referenceAssets : [];
    const retainedRefs = currentRefs.filter((asset) => !isGeneratedAssetReference(asset, sourceNodeId));
    const nextRefs = mergeReferenceAssets(retainedRefs, cleanReferences);
    if (sameReferences(currentRefs, nextRefs)) return node;
    changed = true;
    return { ...node, referenceAssets: nextRefs };
  });
  return changed ? nextNodes : nodes;
}
