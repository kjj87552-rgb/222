export const REFERENCE_INTENTS = Object.freeze({
  sameCharacter: 'same_character_multi_reference',
  multipleCharacters: 'multiple_characters',
  structure: 'structure_reference',
  style: 'style_reference',
  mixed: 'mixed_reference',
});

export const ANALYSIS_STATUS = Object.freeze({
  idle: 'idle',
  queued: 'queued',
  running: 'running',
  ready: 'ready',
  failed: 'failed',
});

export const VALID_INTENTS = Object.freeze(Object.values(REFERENCE_INTENTS));

export const asArray = (value) => (Array.isArray(value) ? value : []);

export const isObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

export const text = (value, fallback = '') => {
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
};

export const nowIso = (now) => {
  const value = typeof now === 'function' ? now() : now;
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string' && value) {
    return value;
  }
  return new Date().toISOString();
};

export const normalizeStatus = (status) => (
  Object.values(ANALYSIS_STATUS).includes(status) ? status : ANALYSIS_STATUS.idle
);

export const normalizeAppearanceLocks = (value) => {
  const input = isObject(value) ? value : {};
  return {
    face: text(input.face),
    hair: text(input.hair),
    outfit: text(input.outfit),
    body: text(input.body),
    signature: text(input.signature),
    temperament: text(input.temperament),
  };
};

const normalizeConfirmationStatus = (status) => (
  ['candidate', 'confirmed', 'rejected'].includes(status) ? status : 'candidate'
);

const normalizeConfidence = (confidence) => {
  if (confidence === null || confidence === undefined) {
    return undefined;
  }
  if (typeof confidence === 'string' && confidence.trim() === '') {
    return undefined;
  }

  const value = Number(confidence);
  return Number.isFinite(value) ? value : undefined;
};

export const normalizeCandidateCharacter = (value = {}) => {
  const input = isObject(value) ? value : {};
  const id = text(input.id) || `candidate_${text(input.name) || 'character'}`;

  return {
    id,
    name: text(input.name),
    source: text(input.source),
    confidence: normalizeConfidence(input.confidence),
    linkedSourceAssetIds: asArray(input.linkedSourceAssetIds).map((item) => text(item)).filter(Boolean),
    details: text(input.details),
    appearanceLocks: normalizeAppearanceLocks(input.appearanceLocks),
    confirmationStatus: normalizeConfirmationStatus(input.confirmationStatus),
    mergeTargetId: text(input.mergeTargetId),
    notes: text(input.notes),
  };
};

const normalizeTextExtraction = (value = {}) => {
  const input = isObject(value) ? value : {};
  return {
    status: normalizeStatus(input.status),
    jobId: text(input.jobId),
    keyCharacters: asArray(input.keyCharacters),
    keyProps: asArray(input.keyProps),
    sceneAnalysis: asArray(input.sceneAnalysis),
    error: text(input.error),
  };
};

const normalizeReferenceAnalysis = (value = {}) => {
  const input = isObject(value) ? value : {};
  return {
    status: normalizeStatus(input.status),
    jobId: text(input.jobId),
    referenceIntentSummary: text(input.referenceIntentSummary),
    characterCandidates: asArray(input.characterCandidates)
      .map(normalizeCandidateCharacter),
    continuityCandidates: asArray(input.continuityCandidates),
    conflictReport: asArray(input.conflictReport),
    error: text(input.error),
  };
};

export const makeEmptyAnalysisDraft = (now = null) => ({
  status: ANALYSIS_STATUS.idle,
  updatedAt: now,
  textExtraction: {
    status: ANALYSIS_STATUS.idle,
    jobId: '',
    keyCharacters: [],
    keyProps: [],
    sceneAnalysis: [],
    error: '',
  },
  referenceAnalysis: {
    status: ANALYSIS_STATUS.idle,
    jobId: '',
    referenceIntentSummary: '',
    characterCandidates: [],
    continuityCandidates: [],
    conflictReport: [],
    error: '',
  },
});

export const normalizeAnalysisDraft = (value, context = {}) => {
  const input = isObject(value) ? value : {};
  const base = makeEmptyAnalysisDraft(context.now ?? input.updatedAt ?? null);

  return {
    ...base,
    status: normalizeStatus(input.status),
    textExtraction: normalizeTextExtraction(input.textExtraction),
    referenceAnalysis: normalizeReferenceAnalysis(input.referenceAnalysis),
    updatedAt: input.updatedAt ?? base.updatedAt,
  };
};
