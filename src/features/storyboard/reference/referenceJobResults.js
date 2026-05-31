import { jsonRobustParse } from '../jsonRobustParse.js';
import {
  applyReferenceAnalysisFailure,
  applyReferenceAnalysisSuccess,
  applyTextAssetsFailure,
  applyTextAssetsSuccess,
  applyVideoReferenceAnalysisFailure,
  applyVideoReferenceAnalysisSuccess,
} from './referenceAnalysisResults.js';

export const STORYBOARD_TEXT_ASSETS_ANALYZE_TAG = 'storyboard-text-assets-analyze';
export const STORYBOARD_REFERENCE_ANALYZE_TAG = 'storyboard-reference-analyze';
export const STORYBOARD_VIDEO_REFERENCE_ANALYZE_TAG = 'storyboard-video-reference-analyze';

const ANALYSIS_JOB_TAGS = new Set([
  STORYBOARD_TEXT_ASSETS_ANALYZE_TAG,
  STORYBOARD_REFERENCE_ANALYZE_TAG,
  STORYBOARD_VIDEO_REFERENCE_ANALYZE_TAG,
]);

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'canceled']);

const isObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

export const isStoryboardAnalysisJobTag = (tag) => ANALYSIS_JOB_TAGS.has(tag);

const jobTag = (job) => job?.input?._storyboard || '';

const jobError = (job, fallback = '任务失败') => {
  const output = job?.output || {};
  const candidates = [
    job?.error,
    output.error,
    output.message,
    output.detail,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (candidate && typeof candidate !== 'string') {
      try {
        return JSON.stringify(candidate);
      } catch {
        return fallback;
      }
    }
  }
  return fallback;
};

const outputText = (job) => {
  const output = job?.output || {};
  return String(output.text || output.content || output.message || '').trim();
};

const directOutputObject = (job, tag) => {
  const output = job?.output || {};
  if (!isObject(output)) return null;
  if (tag === STORYBOARD_TEXT_ASSETS_ANALYZE_TAG) {
    if (Array.isArray(output.keyCharacters) || Array.isArray(output.keyProps) || Array.isArray(output.sceneAnalysis)) {
      return output;
    }
  }
  if (tag === STORYBOARD_REFERENCE_ANALYZE_TAG) {
    if (
      typeof output.referenceIntentSummary === 'string'
      || Array.isArray(output.characterCandidates)
      || Array.isArray(output.continuityCandidates)
      || Array.isArray(output.conflictReport)
    ) {
      return output;
    }
  }
  if (tag === STORYBOARD_VIDEO_REFERENCE_ANALYZE_TAG) {
    if (isObject(output.videoReferenceAnalysis)) {
      return output;
    }
    if (Array.isArray(output.scenes) || Array.isArray(output.frames)) {
      return { videoReferenceAnalysis: output };
    }
  }
  return null;
};

async function parseJobOutput(job, tag) {
  const direct = directOutputObject(job, tag);
  if (direct) return { ok: true, data: direct };

  const text = outputText(job);
  const result = await jsonRobustParse(text);
  if (!result.ok) {
    return {
      ok: false,
      error: tag === STORYBOARD_TEXT_ASSETS_ANALYZE_TAG
        ? `文本资产 JSON 解析失败：${result.error || 'unknown'}`
        : `参考分析 JSON 解析失败：${result.error || 'unknown'}`,
    };
  }
  return { ok: true, data: result.data || {} };
}

export async function resolveStoryboardAnalysisJobPackageUpdate(job, { now } = {}) {
  const tag = jobTag(job);
  if (!isStoryboardAnalysisJobTag(tag)) {
    return { handled: false };
  }

  const status = job?.status || '';
  if (!TERMINAL_STATUSES.has(status)) {
    return {
      handled: true,
      terminal: false,
      task: {
        id: tag,
        stage: job?.output?.stage || '运行中…',
        progress: Math.max(1, Math.min(99, Number(job?.progress) || 1)),
      },
    };
  }

  const jobId = job?.id || job?.jobId || '';
  const isTextJob = tag === STORYBOARD_TEXT_ASSETS_ANALYZE_TAG;
  const isVideoJob = tag === STORYBOARD_VIDEO_REFERENCE_ANALYZE_TAG;
  const applySuccess = isTextJob
    ? applyTextAssetsSuccess
    : isVideoJob
      ? applyVideoReferenceAnalysisSuccess
      : applyReferenceAnalysisSuccess;
  const applyFailure = isTextJob
    ? applyTextAssetsFailure
    : isVideoJob
      ? applyVideoReferenceAnalysisFailure
      : applyReferenceAnalysisFailure;

  if (status === 'failed' || status === 'canceled') {
    const message = status === 'canceled' ? '已取消' : jobError(job);
    return {
      handled: true,
      terminal: true,
      task: { id: tag, error: message },
      updater: (pkg) => applyFailure(pkg, { jobId, error: message, now }),
    };
  }

  const parsed = await parseJobOutput(job, tag);
  if (!parsed.ok) {
    return {
      handled: true,
      terminal: true,
      task: { id: tag, error: parsed.error },
      updater: (pkg) => applyFailure(pkg, { jobId, error: parsed.error, now }),
    };
  }

  return {
    handled: true,
    terminal: true,
    task: { id: tag, stage: '完成 ✓', progress: 100 },
    updater: (pkg) => applySuccess(pkg, { jobId, output: parsed.data, now }),
  };
}
