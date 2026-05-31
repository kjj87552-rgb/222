import { patchStoryboardPackage } from '../package/storyboardPackage.js';
import {
  VALID_INTENTS,
  asArray,
  isObject,
  makeEmptyAnalysisDraft,
  normalizeAnalysisDraft,
  normalizeAppearanceLocks,
  normalizeCandidateCharacter,
  normalizeStatus,
  nowIso,
  text,
} from './referenceSchema.js';

export {
  ANALYSIS_STATUS,
  REFERENCE_INTENTS,
  VALID_INTENTS,
  asArray,
  isObject,
  makeEmptyAnalysisDraft,
  normalizeAnalysisDraft,
  normalizeAppearanceLocks,
  normalizeCandidateCharacter,
  normalizeStatus,
  nowIso,
  text,
} from './referenceSchema.js';

const SOURCE_KINDS = ['image', 'video', 'text', 'unknown'];
const SOURCE_ORIGINS = ['local_upload', 'canvas_node', 'project_asset', 'manual'];
const REFRESHED_DIAGNOSTIC_CODES = new Set([
  'source_intent_missing',
  'candidate_unconfirmed',
]);

const hasValidReferenceIntent = (intent) => VALID_INTENTS.includes(intent);

const normalizeSourceKind = (kind) => (
  SOURCE_KINDS.includes(kind) ? kind : 'unknown'
);

const normalizeSourceOrigin = (origin) => (
  SOURCE_ORIGINS.includes(origin) ? origin : 'manual'
);

const sourceAssetId = (asset) => {
  if (text(asset.id)) {
    return text(asset.id);
  }

  const origin = normalizeSourceOrigin(asset.origin);
  const stableSourceId = text(asset.nodeId) || text(asset.assetId) || text(asset.url) || 'local';
  return `source_${origin}_${stableSourceId}`;
};

export const normalizeSourceAsset = (value = {}, context = {}) => {
  const input = isObject(value) ? value : {};
  const createdAt = input.createdAt ?? nowIso(context.now);
  const normalized = {
    id: sourceAssetId(input),
    kind: normalizeSourceKind(input.kind),
    origin: normalizeSourceOrigin(input.origin),
    referenceIntent: hasValidReferenceIntent(input.referenceIntent) ? input.referenceIntent : '',
    createdAt,
    updatedAt: input.updatedAt ?? createdAt,
  };

  if (text(input.nodeId)) {
    normalized.nodeId = text(input.nodeId);
  }
  if (text(input.assetId)) {
    normalized.assetId = text(input.assetId);
  }
  if (text(input.url)) {
    normalized.url = text(input.url);
  }
  if (text(input.title)) {
    normalized.title = text(input.title);
  }
  if (text(input.roleHint)) {
    normalized.roleHint = text(input.roleHint);
  }

  return normalized;
};

export const upsertSourceAsset = (pkg, sourceAsset, now) => {
  const normalizedAsset = normalizeSourceAsset(sourceAsset, { now });
  const sourceAssets = asArray(pkg?.sourceAssets);
  const existingIndex = sourceAssets.findIndex((asset) => asset?.id === normalizedAsset.id);
  const nextSourceAssets = existingIndex >= 0
    ? sourceAssets.map((asset, index) => (index === existingIndex ? normalizedAsset : asset))
    : [...sourceAssets, normalizedAsset];

  return patchStoryboardPackage(pkg, { sourceAssets: nextSourceAssets }, now);
};

export const updateSourceAsset = (pkg, sourceAssetIdValue, patch = {}, now) => {
  const sourceAssets = asArray(pkg?.sourceAssets);
  const nextSourceAssets = sourceAssets.map((asset) => {
    if (asset?.id !== sourceAssetIdValue) {
      return asset;
    }

    return normalizeSourceAsset({
      ...asset,
      ...(isObject(patch) ? patch : {}),
      id: asset.id,
      createdAt: asset.createdAt,
      updatedAt: nowIso(now),
    });
  });

  return patchStoryboardPackage(pkg, { sourceAssets: nextSourceAssets }, now);
};

export const removeSourceAsset = (pkg, sourceAssetIdValue, now) => {
  const nextSourceAssets = asArray(pkg?.sourceAssets)
    .filter((asset) => asset?.id !== sourceAssetIdValue);

  return patchStoryboardPackage(pkg, { sourceAssets: nextSourceAssets }, now);
};

export const patchAnalysisDraft = (pkg, patch = {}, now) => {
  const currentDraft = normalizeAnalysisDraft(pkg?.analysisDraft, { now });
  return patchStoryboardPackage(pkg, {
    analysisDraft: {
      ...currentDraft,
      ...(isObject(patch) ? patch : {}),
    },
  }, now);
};

export const buildReferenceDiagnostics = (pkg = {}) => {
  const sourceAssets = asArray(pkg.sourceAssets);
  const analysisDraft = normalizeAnalysisDraft(pkg.analysisDraft);
  const diagnostics = [];

  sourceAssets.forEach((asset) => {
    if (!hasValidReferenceIntent(asset?.referenceIntent)) {
      diagnostics.push({
        code: 'source_intent_missing',
        severity: 'warning',
        sourceAssetId: asset?.id,
        message: '参考素材缺少引用意图。',
      });
    }
  });

  analysisDraft.referenceAnalysis.characterCandidates.forEach((candidate) => {
    if (candidate.confirmationStatus === 'candidate') {
      diagnostics.push({
        code: 'candidate_unconfirmed',
        severity: 'info',
        candidateId: candidate.id,
        message: '候选角色需要用户确认后才能写入角色圣经。',
      });
    }
  });

  return diagnostics;
};

const stableDiagnosticKey = (diagnostic) => JSON.stringify(
  Object.keys(diagnostic ?? {})
    .sort()
    .reduce((result, key) => ({
      ...result,
      [key]: diagnostic[key],
    }), {}),
);

const uniqueDiagnostics = (diagnostics) => {
  const seen = new Set();
  return diagnostics.filter((diagnostic) => {
    const key = stableDiagnosticKey(diagnostic);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const refreshReferenceDiagnostics = (pkg, now) => {
  const preservedDiagnostics = asArray(pkg?.diagnostics)
    .filter((diagnostic) => !REFRESHED_DIAGNOSTIC_CODES.has(diagnostic?.code));
  const nextDiagnostics = uniqueDiagnostics([
    ...preservedDiagnostics,
    ...buildReferenceDiagnostics(pkg),
  ]);

  return patchStoryboardPackage(pkg, { diagnostics: nextDiagnostics }, now);
};

export const promoteCandidateCharacter = (pkg, candidateId, now) => {
  const draft = normalizeAnalysisDraft(pkg?.analysisDraft, { now });
  const candidates = draft.referenceAnalysis.characterCandidates;
  const candidate = candidates.find((item) => item.id === candidateId);

  if (!candidate) {
    return patchStoryboardPackage(pkg, {}, now);
  }

  const confirmedCandidate = {
    ...normalizeCandidateCharacter(candidate),
    confirmationStatus: 'confirmed',
  };
  const existingCharacters = asArray(pkg?.characterBible?.characters);
  const nextCharacters = existingCharacters.some((character) => character?.id === confirmedCandidate.id)
    ? existingCharacters.map((character) => (
      character?.id === confirmedCandidate.id
        ? { ...character, ...confirmedCandidate, confirmationStatus: 'confirmed' }
        : character
    ))
    : [...existingCharacters, confirmedCandidate];

  const consistencyRuleMarker = `角色 ${confirmedCandidate.id}｜${confirmedCandidate.name}：`;
  const nextConsistencyRule = `${consistencyRuleMarker}${Object.values(
    normalizeAppearanceLocks(confirmedCandidate.appearanceLocks),
  ).filter(Boolean).join('，') || '沿用确认参考'}`;
  const existingRules = asArray(pkg?.continuityRules?.characterConsistency);
  const nextRules = existingRules.some((rule) => (
    typeof rule === 'string' && rule.startsWith(consistencyRuleMarker)
  ))
    ? existingRules.map((rule) => (
      typeof rule === 'string' && rule.startsWith(consistencyRuleMarker)
        ? nextConsistencyRule
        : rule
    ))
    : [...existingRules, nextConsistencyRule];

  return patchStoryboardPackage(pkg, {
    analysisDraft: {
      ...draft,
      referenceAnalysis: {
        ...draft.referenceAnalysis,
        characterCandidates: candidates.map((item) => (
          item.id === confirmedCandidate.id ? confirmedCandidate : item
        )),
      },
      updatedAt: nowIso(now),
    },
    characterBible: {
      characters: nextCharacters,
    },
    continuityRules: {
      characterConsistency: nextRules,
    },
  }, now);
};
