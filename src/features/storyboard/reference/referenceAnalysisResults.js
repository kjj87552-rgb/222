import {
  normalizeStoryboardPackage,
  patchStoryboardPackage,
} from '../package/storyboardPackage.js';
import {
  normalizeAnalysisDraft,
  normalizeCandidateCharacter,
  refreshReferenceDiagnostics as refreshPackageReferenceDiagnostics,
} from './referencePackage.js';
import {
  ANALYSIS_STATUS,
  asArray,
  isObject,
  nowIso,
  text,
} from './referenceSchema.js';

const normalizeStrictConfidence = (confidence) => (
  typeof confidence === 'number' && Number.isFinite(confidence) ? confidence : undefined
);

const normalizeCandidateConfidence = (confidence) => {
  if (typeof confidence === 'number') {
    return Number.isFinite(confidence) ? confidence : undefined;
  }
  if (typeof confidence !== 'string' || confidence.trim() === '') {
    return undefined;
  }

  const value = Number(confidence);
  return Number.isFinite(value) ? value : undefined;
};

const stringifyDetailsValue = (value) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return text(value);
  }
  if (isObject(value) || Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return '';
};

const mergedDetails = (candidate = {}) => [
  candidate.details,
  candidate.visualNotes,
  candidate.evidence,
].map(stringifyDetailsValue).filter(Boolean).join('\n');

const normalizeCandidateForSource = (value, source) => {
  const input = isObject(value) ? value : {};

  return normalizeCandidateCharacter({
    ...input,
    source,
    confirmationStatus: 'candidate',
    confidence: source === 'reference_analysis'
      ? normalizeCandidateConfidence(input.confidence)
      : normalizeStrictConfidence(input.confidence),
    linkedSourceAssetIds: asArray(input.linkedSourceAssetIds),
    details: source === 'reference_analysis'
      ? mergedDetails(input)
      : stringifyDetailsValue(input.details),
  });
};

const uniqueDiagnostics = (diagnostics) => {
  const seen = new Set();
  return diagnostics.filter((diagnostic) => {
    const key = JSON.stringify(diagnostic);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const withFailureDiagnostic = (pkg, diagnostic) => uniqueDiagnostics([
  ...normalizeStoryboardPackage(pkg).diagnostics,
  diagnostic,
]);

const TEXT_ASSET_SUCCESS_CLEAR_DIAGNOSTIC_CODES = new Set([
  'text_assets_failed',
]);

const removeDiagnosticsByCode = (diagnostics, codes) => asArray(diagnostics)
  .filter((diagnostic) => !codes.has(diagnostic?.code));

const removePackageDiagnosticsByCode = (pkg, codes) => removeDiagnosticsByCode(
  normalizeStoryboardPackage(pkg).diagnostics,
  codes,
);

export const normalizeTextAssetsOutput = (output = {}) => {
  const input = isObject(output) ? output : {};

  return {
    keyCharacters: asArray(input.keyCharacters)
      .map((item) => normalizeCandidateForSource(item, 'text_extraction')),
    keyProps: asArray(input.keyProps),
    sceneAnalysis: asArray(input.sceneAnalysis),
  };
};

export const normalizeReferenceAnalysisOutput = (output = {}) => {
  const input = isObject(output) ? output : {};

  return {
    referenceIntentSummary: text(input.referenceIntentSummary),
    characterCandidates: asArray(input.characterCandidates)
      .map((item) => normalizeCandidateForSource(item, 'reference_analysis')),
    continuityCandidates: asArray(input.continuityCandidates),
    conflictReport: asArray(input.conflictReport),
  };
};

export const applyTextAssetsSuccess = (pkg, { jobId = '', output = {}, now } = {}) => {
  const timestamp = nowIso(now);
  const draft = normalizeAnalysisDraft(pkg?.analysisDraft, { now: timestamp });
  const normalizedOutput = normalizeTextAssetsOutput(output);

  return patchStoryboardPackage(pkg, {
    analysisDraft: {
      ...draft,
      status: ANALYSIS_STATUS.ready,
      updatedAt: timestamp,
      textExtraction: {
        ...draft.textExtraction,
        status: ANALYSIS_STATUS.ready,
        jobId: text(jobId),
        error: '',
        ...normalizedOutput,
      },
    },
    diagnostics: uniqueDiagnostics(removePackageDiagnosticsByCode(
      pkg,
      TEXT_ASSET_SUCCESS_CLEAR_DIAGNOSTIC_CODES,
    )),
  }, timestamp);
};

export const applyReferenceAnalysisSuccess = (pkg, { jobId = '', output = {}, now } = {}) => {
  const timestamp = nowIso(now);
  const draft = normalizeAnalysisDraft(pkg?.analysisDraft, { now: timestamp });
  const normalizedOutput = normalizeReferenceAnalysisOutput(output);
  const next = patchStoryboardPackage(pkg, {
    analysisDraft: {
      ...draft,
      status: ANALYSIS_STATUS.ready,
      updatedAt: timestamp,
      referenceAnalysis: {
        ...draft.referenceAnalysis,
        status: ANALYSIS_STATUS.ready,
        jobId: text(jobId),
        error: '',
        ...normalizedOutput,
      },
    },
  }, timestamp);

  return refreshPackageReferenceDiagnostics(next, timestamp);
};

export const normalizeVideoReferenceAnalysisOutput = (output = {}) => {
  const input = isObject(output?.videoReferenceAnalysis)
    ? output.videoReferenceAnalysis
    : (isObject(output) ? output : {});
  const frameCandidates = asArray(input.frameCandidates?.length ? input.frameCandidates : input.frames)
    .map((frame) => ({
      ...frame,
      userSelected: frame?.userSelected !== false,
    }));

  return {
    ...input,
    sourceAssetId: text(input.sourceAssetId || input.sourceVideoAssetId || input.assetId),
    referenceIntent: text(input.referenceIntent || input.intent),
    duration: text(input.duration),
    durationSeconds: typeof input.durationSeconds === 'number'
      ? input.durationSeconds
      : Number(input.durationSeconds) || 0,
    sceneDetectStrength: input.sceneDetectStrength ?? input.sceneDetectionStrength ?? '',
    sceneDetectionStrength: input.sceneDetectionStrength ?? input.sceneDetectStrength ?? '',
    sceneDetectionThreshold: typeof input.sceneDetectionThreshold === 'number'
      ? input.sceneDetectionThreshold
      : Number(input.sceneDetectionThreshold) || 0,
    sceneDetect: isObject(input.sceneDetect) ? input.sceneDetect : {},
    scenes: asArray(input.scenes).map((scene) => ({
      ...scene,
      userSelected: scene?.userSelected !== false,
    })),
    frames: asArray(input.frames).map((frame) => ({
      ...frame,
      userSelected: frame?.userSelected !== false,
    })),
    frameCandidates,
    analysisPrompt: text(input.analysisPrompt),
  };
};

export const applyVideoReferenceAnalysisSuccess = (pkg, { jobId = '', output = {}, now } = {}) => {
  const timestamp = nowIso(now);
  const normalizedOutput = normalizeVideoReferenceAnalysisOutput(output);

  const next = patchStoryboardPackage(pkg, {
    videoReferenceAnalysis: {
      ...normalizedOutput,
      status: 'ready',
      jobId: text(jobId),
      error: '',
      updatedAt: timestamp,
    },
    reviewState: {
      ...pkg?.reviewState,
      videoReviewed: false,
    },
  }, timestamp);

  return patchStoryboardPackage(next, {
    diagnostics: uniqueDiagnostics(next.diagnostics),
  }, timestamp);
};

export const applyTextAssetsFailure = (pkg, { jobId = '', error = '', now } = {}) => {
  const timestamp = nowIso(now);
  const draft = normalizeAnalysisDraft(pkg?.analysisDraft, { now: timestamp });
  const normalizedJobId = text(jobId);
  const message = text(error);

  return patchStoryboardPackage(pkg, {
    analysisDraft: {
      ...draft,
      status: ANALYSIS_STATUS.failed,
      updatedAt: timestamp,
      textExtraction: {
        ...draft.textExtraction,
        status: ANALYSIS_STATUS.failed,
        jobId: normalizedJobId,
        error: message,
      },
    },
    diagnostics: withFailureDiagnostic(pkg, {
      code: 'text_assets_failed',
      severity: 'error',
      jobId: normalizedJobId,
      message,
    }),
  }, timestamp);
};

export const applyReferenceAnalysisFailure = (pkg, { jobId = '', error = '', now } = {}) => {
  const timestamp = nowIso(now);
  const draft = normalizeAnalysisDraft(pkg?.analysisDraft, { now: timestamp });
  const normalizedJobId = text(jobId);
  const message = text(error);

  return patchStoryboardPackage(pkg, {
    analysisDraft: {
      ...draft,
      status: ANALYSIS_STATUS.failed,
      updatedAt: timestamp,
      referenceAnalysis: {
        ...draft.referenceAnalysis,
        status: ANALYSIS_STATUS.failed,
        jobId: normalizedJobId,
        error: message,
      },
    },
    diagnostics: withFailureDiagnostic(pkg, {
      code: 'reference_analysis_failed',
      severity: 'error',
      jobId: normalizedJobId,
      message,
    }),
  }, timestamp);
};

export const applyVideoReferenceAnalysisFailure = (pkg, { jobId = '', error = '', now } = {}) => {
  const timestamp = nowIso(now);
  const normalizedJobId = text(jobId);
  const message = text(error);

  return patchStoryboardPackage(pkg, {
    diagnostics: withFailureDiagnostic(pkg, {
      code: 'video_reference_analysis_failed',
      severity: 'error',
      jobId: normalizedJobId,
      message,
      createdAt: timestamp,
    }),
  }, timestamp);
};
