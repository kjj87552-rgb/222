const VALID_BINDING_TYPES = new Set(['character', 'scene', 'prop']);
const VALID_SOURCES = new Set(['design-space', 'project-asset', 'manual']);
const VALID_SYNC_POLICIES = new Set(['pinned-version', 'latest-manual']);
const VALID_CANDIDATE_STATUSES = new Set(['unbound', 'matched', 'bound', 'ignored']);

export const DESIGN_BUCKET_TO_BINDING_TYPE = Object.freeze({
  characters: 'character',
  scenes: 'scene',
  props: 'prop',
});

function toText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function nowIso(now) {
  const value = typeof now === 'function' ? now() : now;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && value) return value;
  return new Date().toISOString();
}

function stableId(prefix, parts) {
  const text = parts.map(toText).filter(Boolean).join('_');
  const safe = text
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${prefix}_${safe || Date.now().toString(36)}`;
}

export function bindingTypeFromDesignCard(card = {}) {
  if (card?.type === 'scene') return 'scene';
  if (card?.type === 'prop') return 'prop';
  return 'character';
}

export function normalizeAssetBinding(value = {}, context = {}) {
  const input = value && typeof value === 'object' ? value : {};
  const type = VALID_BINDING_TYPES.has(input.type) ? input.type : 'character';
  const source = VALID_SOURCES.has(input.source) ? input.source : 'manual';
  const syncPolicy = VALID_SYNC_POLICIES.has(input.syncPolicy) ? input.syncPolicy : 'pinned-version';
  const timestamp = nowIso(context.now || input.updatedAt || input.createdAt);
  const name = toText(input.name) || '未命名资产';
  const bindingId = toText(input.bindingId) || stableId('bind', [
    source,
    input.cardId,
    input.versionId,
    input.assetId,
    name,
  ]);

  return {
    bindingId,
    type,
    source,
    assetId: toText(input.assetId),
    cardId: toText(input.cardId),
    versionId: toText(input.versionId),
    name,
    aliases: toArray(input.aliases).map(toText).filter(Boolean),
    imageUrl: toText(input.imageUrl || input.assetUrl || input.url || input.src),
    prompt: toText(input.prompt),
    roleHint: toText(input.roleHint),
    locked: input.locked === false ? false : true,
    syncPolicy,
    createdAt: toText(input.createdAt) || timestamp,
    updatedAt: timestamp,
  };
}

export function makeAssetBinding({
  source = 'manual',
  card = {},
  version = {},
  roleHint = '',
  now,
} = {}) {
  const type = source === 'design-space'
    ? bindingTypeFromDesignCard(card)
    : (VALID_BINDING_TYPES.has(card?.type) ? card.type : 'character');
  const prompt = toText(version?.prompt)
    || toText(card?.visualPrompt)
    || toText(card?.details)
    || toText(card?.outfitPrompt)
    || toText(card?.atmospherePrompt)
    || toText(card?.materialPrompt);

  return normalizeAssetBinding({
    bindingId: stableId('bind', [source, card?.id, version?.id, version?.assetId]),
    type,
    source,
    assetId: version?.assetId || card?.assetId,
    cardId: card?.id,
    versionId: version?.id || card?.currentVersionId,
    name: card?.name || version?.title,
    imageUrl: version?.assetUrl || version?.url || card?.imageUrl,
    prompt,
    roleHint,
    locked: true,
    syncPolicy: 'pinned-version',
  }, { now });
}

export function normalizeAssetCandidate(value = {}, context = {}) {
  const input = value && typeof value === 'object' ? value : {};
  const type = VALID_BINDING_TYPES.has(input.type) ? input.type : 'character';
  const name = toText(input.name) || '未命名候选';
  const status = VALID_CANDIDATE_STATUSES.has(input.status) ? input.status : 'unbound';
  const timestamp = nowIso(context.now || input.updatedAt || input.createdAt);

  return {
    candidateId: toText(input.candidateId) || stableId('cand', [type, name]),
    type,
    name,
    extractedPrompt: toText(input.extractedPrompt || input.prompt || input.details),
    evidence: toArray(input.evidence).map(toText).filter(Boolean),
    status,
    matchedBindingId: toText(input.matchedBindingId),
    createdAt: toText(input.createdAt) || timestamp,
    updatedAt: timestamp,
  };
}

export function normalizeAssetBindings(bindings = []) {
  return toArray(bindings).map((item) => normalizeAssetBinding(item));
}

export function normalizeAssetCandidates(candidates = []) {
  return toArray(candidates).map((item) => normalizeAssetCandidate(item));
}

export function upsertAssetBinding(bindings = [], binding) {
  const nextBinding = normalizeAssetBinding(binding);
  const normalized = normalizeAssetBindings(bindings);
  const index = normalized.findIndex((item) => item.bindingId === nextBinding.bindingId);
  if (index < 0) return [...normalized, nextBinding];
  return normalized.map((item, itemIndex) => (itemIndex === index ? nextBinding : item));
}

export function removeAssetBinding(bindings = [], bindingId) {
  const target = toText(bindingId);
  return normalizeAssetBindings(bindings).filter((item) => item.bindingId !== target);
}
