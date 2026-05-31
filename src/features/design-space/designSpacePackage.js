const DESIGN_TABS = ['characters', 'scenes', 'props'];
let idSequence = 0;

function nowIso() {
  return new Date().toISOString();
}

function nextId(prefix) {
  idSequence = (idSequence + 1) % Number.MAX_SAFE_INTEGER;
  return `${prefix}_${Date.now().toString(36)}_${idSequence.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cardStatusForVersion(status) {
  if (status === 'completed') {
    return 'generated';
  }
  if (status === 'failed' || status === 'canceled') {
    return 'failed';
  }
  return 'generating';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function patchChanged(card, patch) {
  return Object.entries(patch).some(([key, value]) => card[key] !== value);
}

function applyUpdater(card, updater) {
  if (typeof updater === 'function') {
    const patch = updater(card);
    if (!patch || typeof patch !== 'object' || !patchChanged(card, patch)) {
      return card;
    }
    return { ...card, ...patch };
  }

  if (!updater || typeof updater !== 'object' || !patchChanged(card, updater)) {
    return card;
  }

  return { ...card, ...updater };
}

function updateCardInBucket(pkg, bucket, cardId, updater) {
  let changed = false;
  const cards = asArray(pkg?.[bucket]).map((card) => {
    if (card?.id !== cardId) {
      return card;
    }

    const nextCard = applyUpdater(card, updater);
    if (nextCard === card) {
      return card;
    }

    changed = true;
    return { ...nextCard, updatedAt: nowIso() };
  });

  return changed ? cards : null;
}

function typeForBucket(bucket) {
  if (bucket === 'scenes') return 'scene';
  if (bucket === 'props') return 'prop';
  return 'character';
}

function idPrefixForType(type) {
  if (type === 'scene') return 'scene';
  if (type === 'prop') return 'prop';
  return 'char';
}

export function createEmptyDesignSpacePackage({
  projectId = 'local-default',
  title = '设计空间',
} = {}) {
  const timestamp = nowIso();
  return {
    id: nextId('ds'),
    projectId,
    title,
    sourceKind: 'unknown',
    sourceText: '',
    projectMeta: {},
    characters: [],
    scenes: [],
    props: [],
    selectedCardId: '',
    activeTab: 'characters',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function cardsForDesignTab(pkg, tab) {
  if (tab === 'scenes') {
    return asArray(pkg?.scenes);
  }
  if (tab === 'props') {
    return asArray(pkg?.props);
  }
  return asArray(pkg?.characters);
}

export function createManualDesignCard({
  bucket = 'characters',
  name = '',
  visualPrompt = '',
} = {}) {
  const type = typeForBucket(bucket);
  const timestamp = nowIso();
  const prompt = String(visualPrompt || '').trim();
  const card = {
    id: nextId(idPrefixForType(type)),
    type,
    name: String(name || '').trim() || '未命名资产',
    details: prompt,
    visualPrompt: prompt,
    status: 'ready',
    tags: [],
    sourceEvidence: [],
    warnings: [],
    history: [],
    currentVersionId: '',
    source: 'manual',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (type === 'scene') {
    card.atmospherePrompt = '';
  } else if (type === 'prop') {
    card.materialPrompt = '';
  } else {
    card.outfitPrompt = '';
  }

  return card;
}

export function updateDesignCard(pkg, cardId, updater) {
  for (const bucket of DESIGN_TABS) {
    const nextCards = updateCardInBucket(pkg, bucket, cardId, updater);
    if (nextCards) {
      return {
        ...pkg,
        [bucket]: nextCards,
        updatedAt: nowIso(),
      };
    }
  }

  return pkg;
}

export function appendDesignVersion(pkg, cardId, version) {
  const nextVersion = {
    ...version,
    id: version?.id || `ver_${Date.now().toString(36)}`,
    createdAt: version?.createdAt || nowIso(),
  };

  return updateDesignCard(pkg, cardId, (card) => ({
    ...card,
    history: [nextVersion, ...asArray(card.history)],
    currentVersionId: nextVersion.id,
    status: cardStatusForVersion(nextVersion.status),
  }));
}

export function markDesignVersionCurrent(pkg, cardId, versionId) {
  return updateDesignCard(pkg, cardId, { currentVersionId: versionId });
}

export function selectedDesignCard(pkg) {
  const cards = [
    ...asArray(pkg?.characters),
    ...asArray(pkg?.scenes),
    ...asArray(pkg?.props),
  ];
  return cards.find((card) => card?.id === pkg?.selectedCardId) || cards[0] || null;
}
