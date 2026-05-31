function compactStrings(values) {
  return (Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean);
}

export function numericOptions(values) {
  return Array.from(new Set((Array.isArray(values) ? values : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)))
    .sort((a, b) => a - b);
}

export function modelParams(model) {
  return model?.params && typeof model.params === 'object' ? model.params : {};
}

function modelIdentity(model) {
  return [model?.id, model?.modelName, model?.displayName]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
}

const SEEDANCE_MODEL_IDS = Object.freeze([
  'seedance-2.0-fast',
  'seedance-2.0-pro',
  'seedance-2-0',
  'seedance-2-0-fast',
  'seedance-2-0-pro',
  'sora-3-fast',
  'sora-3-pro',
]);
const XINGHE_SEEDANCE_STYLE_MODEL_IDS = Object.freeze([
  'sora-v3-fast',
  'sora-v3-pro',
  'seedence2-fast',
  'seedence2-pro',
  'seedence2-fast（特价版1）',
  'seedence2-pro（特价版1）',
  'seedence2-fast（特价版2）',
  'seedence2-pro（特价版2）',
  'seedence2.0-720（满血）',
  'sora-vip3-pro-720p',
  'sora-vip3-pro-1080p',
  '真人人脸即梦满血版',
]);
const MUSE_VIDEO_MODEL_IDS = Object.freeze([
  'seedence2.0-m-c',
  'seedence2.0fast-m-c',
  'seedence2.0-real-person-m-c',
  'seedence2.0-company-m-c',
  'seedence2.0人脸-m-c',
  'seedence2.0企业-m-c',
]);
const MUSE_SD2_DURATIONS = Object.freeze([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
const MUSE_SD2_RATIOS = Object.freeze(['16:9', '4:3', '1:1', '3:4', '9:16', '21:9']);
const MUSE_SD2_FAST_RESOLUTIONS = Object.freeze(['480P', '720P']);
const MUSE_SD2_PRO_RESOLUTIONS = Object.freeze(['480P', '720P', '1080P']);
const MUSE_SD2_MODEL_PROFILES = Object.freeze({
  muse_sd2_fast_real_full: { resolutions: MUSE_SD2_FAST_RESOLUTIONS, maxReferenceImages: 9 },
  muse_sd2_fast_full: { resolutions: MUSE_SD2_FAST_RESOLUTIONS, maxReferenceImages: 9 },
  muse_sd2_fast_four: { resolutions: MUSE_SD2_FAST_RESOLUTIONS, maxReferenceImages: 4 },
  muse_sd2_real_full: { resolutions: MUSE_SD2_PRO_RESOLUTIONS, maxReferenceImages: 9 },
  muse_sd2_full: { resolutions: MUSE_SD2_PRO_RESOLUTIONS, maxReferenceImages: 9 },
  muse_sd2_four: { resolutions: MUSE_SD2_PRO_RESOLUTIONS, maxReferenceImages: 4 },
});

function isSeedanceModel(model) {
  return modelIdentity(model).some((value) => SEEDANCE_MODEL_IDS.includes(value));
}

function isSeedanceDashProModel(model) {
  return modelIdentity(model).some((value) => value === 'seedance-2-0-pro');
}

function isVolcTokensSeedanceModel(model) {
  return modelIdentity(model).some((value) => value === 'seedance-2-0-fast' || value === 'seedance-2-0-pro');
}

function isVolcTokensSeedanceFastModel(model) {
  return modelIdentity(model).some((value) => value === 'seedance-2-0-fast');
}

function isMuseVideoModel(model) {
  const params = modelParams(model);
  if (String(params.videoProtocol || '').trim().toLowerCase() === 'muse_video') return true;
  if (museSd2Profile(model)) return true;
  return modelIdentity(model).some((value) => MUSE_VIDEO_MODEL_IDS.includes(value) || value.startsWith('seedence2.0'));
}

function museSd2Profile(model) {
  const params = modelParams(model);
  const protocol = String(params.videoProtocol || '').trim().toLowerCase();
  if (protocol && protocol !== 'muse_video') return null;
  const identities = modelIdentity(model);
  for (const value of identities) {
    const normalized = value.replace(/-/g, '_');
    if (MUSE_SD2_MODEL_PROFILES[normalized]) return MUSE_SD2_MODEL_PROFILES[normalized];
  }
  const joined = identities.join(' ');
  if (!joined.includes('seedence2.0') || !joined.includes('满血')) return null;
  const fast = joined.includes('fast');
  const four = joined.includes('4张') || joined.includes('four');
  if (fast) return four ? MUSE_SD2_MODEL_PROFILES.muse_sd2_fast_four : MUSE_SD2_MODEL_PROFILES.muse_sd2_fast_real_full;
  return four ? MUSE_SD2_MODEL_PROFILES.muse_sd2_four : MUSE_SD2_MODEL_PROFILES.muse_sd2_real_full;
}

function isXingheSeedanceStyleModel(model) {
  const params = modelParams(model);
  const protocol = String(params.videoProtocol || '').trim().toLowerCase();
  return modelIdentity(model).some((value) => XINGHE_SEEDANCE_STYLE_MODEL_IDS.includes(value))
    && protocol === 'public_video_api';
}

function usesSeedanceStyleReferences(model) {
  return isSeedanceModel(model) || isMuseVideoModel(model) || isXingheSeedanceStyleModel(model);
}

const SEEDANCE_FAST_DURATIONS = Object.freeze([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
const SEEDANCE_FAST_RATIOS = Object.freeze(['21:9', '16:9', '4:3', '1:1', '3:4', '9:16']);
const GROK3_VIDEO_DURATIONS = Object.freeze([6, 10]);
const GROK3_VIDEO_RATIOS = Object.freeze(['16:9', '9:16', '3:2', '2:3', '1:1']);
const GROK3_VIDEO_RESOLUTIONS = Object.freeze(['480P', '720P']);
const GROK_VIDEO_DURATIONS = Object.freeze([10]);
const GOOGLE_OMNI_FLASH_DURATIONS = Object.freeze([10]);
const VEO_VIDEO_DURATIONS = Object.freeze([4, 6, 8]);
const VEO_VIDEO_RATIOS = Object.freeze(['16:9', '9:16']);

function isGrok3VideoModel(model) {
  return modelIdentity(model).some((value) => value === 'grok3-video' || value === 'grok3 video');
}

function isGrokVideoModel(model) {
  return isGrok3VideoModel(model) || modelIdentity(model).some((value) => value.includes('grok-imagine'));
}

function isGoogleOmniFlashModel(model) {
  return modelIdentity(model).some((value) => (
    value === 'google-omin'
    || value === 'omni_flash-10s'
    || value.includes('omni flash')
  ));
}

function isVeoVideoModel(model) {
  return modelIdentity(model).some((value) => value === 'veo31' || value === 'veo31-fast' || value === 'veo31ref' || value.startsWith('veo'));
}

function supportedReferenceModes(model) {
  return compactStrings(modelParams(model).supportedReferenceModes)
    .map((value) => value.toLowerCase().replace(/-/g, '_'));
}

function booleanParam(model, key) {
  const value = modelParams(model)[key];
  if (value === true) return true;
  if (value === false) return false;
  const text = String(value ?? '').trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(text)) return true;
  if (['0', 'false', 'no', 'off'].includes(text)) return false;
  return undefined;
}

export function durationOptionsForModel(model) {
  if (isSeedanceModel(model)) return [...SEEDANCE_FAST_DURATIONS];
  if (museSd2Profile(model)) return [...MUSE_SD2_DURATIONS];
  if (isGrok3VideoModel(model)) return [...GROK3_VIDEO_DURATIONS];
  if (isGrokVideoModel(model)) return [...GROK_VIDEO_DURATIONS];
  if (isGoogleOmniFlashModel(model)) return [...GOOGLE_OMNI_FLASH_DURATIONS];
  if (isVeoVideoModel(model)) return [...VEO_VIDEO_DURATIONS];
  const params = modelParams(model);
  return numericOptions(params.supportedDurations || params.durations);
}

export function ratioOptionsForModel(model, fallback = []) {
  if (isSeedanceModel(model)) return [...SEEDANCE_FAST_RATIOS];
  if (museSd2Profile(model)) return [...MUSE_SD2_RATIOS];
  if (isGrok3VideoModel(model)) return [...GROK3_VIDEO_RATIOS];
  if (isVeoVideoModel(model)) return [...VEO_VIDEO_RATIOS];
  const params = modelParams(model);
  const ratios = compactStrings(params.ratios);
  return ratios.length ? ratios : fallback;
}

export function resolutionOptionsForModel(model, isVideo, fallback) {
  if (isGrok3VideoModel(model)) return [...GROK3_VIDEO_RESOLUTIONS];
  const museProfile = museSd2Profile(model);
  if (museProfile) return [...museProfile.resolutions];
  const params = modelParams(model);
  const raw = params.supportedResolutions || params.resolutions || params.resolutionNames;
  const options = compactStrings(raw);
  if (options.length) return options.map((value) => value.toUpperCase());
  if (params.defaultResolutionName) return [String(params.defaultResolutionName).toUpperCase()];
  if (Array.isArray(fallback) && fallback.length) return fallback;
  return isVideo ? ['480P', '720P', '1080P'] : ['1K', '2K', '4K'];
}

export function includeResolutionForModel(model) {
  if (museSd2Profile(model)) return true;
  if (isVolcTokensSeedanceModel(model)) return true;
  if (isSeedanceModel(model)) return false;
  const configured = booleanParam(model, 'includeResolution');
  return configured !== false;
}

export function includeGenerateAudioForModel(model) {
  if (museSd2Profile(model)) return false;
  if (isGrok3VideoModel(model)) return false;
  if (isSeedanceDashProModel(model)) {
    const configured = booleanParam(model, 'includeGenerateAudio');
    return configured !== false;
  }
  if (isSeedanceModel(model)) return false;
  const configured = booleanParam(model, 'includeGenerateAudio');
  return configured !== false;
}

const SEEDANCE_MODE_OPTION_STD = Object.freeze({ key: 'std', label: '标准' });
const SEEDANCE_MODE_OPTION_PRO = Object.freeze({ key: 'pro', label: 'Pro' });

function resolutionKey(value) {
  const text = String(value || '').trim().toUpperCase();
  if (text.includes('1080')) return '1080P';
  if (text.includes('720')) return '720P';
  if (text.includes('480')) return '480P';
  return text || '720P';
}

export function includeSeedanceModeForModel(model) {
  return isVolcTokensSeedanceModel(model);
}

export function seedanceModeOptionsForModel(model, resolution) {
  if (!includeSeedanceModeForModel(model)) return [];
  const key = resolutionKey(resolution);
  if (key === '480P') return [SEEDANCE_MODE_OPTION_PRO];
  if (key === '1080P' && isVolcTokensSeedanceFastModel(model)) return [SEEDANCE_MODE_OPTION_STD];
  return [SEEDANCE_MODE_OPTION_STD, SEEDANCE_MODE_OPTION_PRO];
}

export function normalizeSeedanceModeForModel(value, model, resolution) {
  const options = seedanceModeOptionsForModel(model, resolution);
  if (!options.length) return '';
  const raw = String(value || '').trim().toLowerCase();
  const normalized = ({
    standard: 'std',
    normal: 'std',
    default: 'std',
    '标准': 'std',
    '标清': 'std',
    professional: 'pro',
    premium: 'pro',
    '专业': 'pro',
  })[raw] || raw;
  if (options.some((item) => item.key === normalized)) return normalized;
  return options[0].key;
}

export function maxReferenceImagesForModel(model) {
  const museProfile = museSd2Profile(model);
  if (museProfile) return museProfile.maxReferenceImages;
  if (isSeedanceModel(model)) return 9;
  const value = Number(modelParams(model).maxReferenceImages);
  if (Number.isFinite(value) && value > 0) return value;
  if (isGrokVideoModel(model)) return 7;
  if (isVeoVideoModel(model)) return 1;
  return 0;
}

export function supportsStartEndFramesForModel(model) {
  if (museSd2Profile(model)) return false;
  const configured = booleanParam(model, 'supportsStartEndFrames');
  if (configured !== undefined) return configured;
  if (isSeedanceModel(model)) return true;
  const modes = supportedReferenceModes(model);
  return modes.some((value) => ['first_last_frames', 'first_last_frame', 'start_end_frames', 'start_end', 'keyframe'].includes(value));
}

export function supportsVideoReferenceForModel(model) {
  if (museSd2Profile(model)) return true;
  const configured = booleanParam(model, 'supportsVideoReference');
  if (configured !== undefined) return configured;
  if (isSeedanceModel(model)) return true;
  const modes = supportedReferenceModes(model);
  return modes.some((value) => ['video_reference', 'video'].includes(value));
}

export function maxReferenceVideosForModel(model) {
  if (museSd2Profile(model)) return 3;
  if (isSeedanceDashProModel(model)) {
    const value = Number(modelParams(model).maxReferenceVideos);
    if (Number.isFinite(value)) return Math.max(0, value);
    return supportsVideoReferenceForModel(model) ? 1 : 0;
  }
  if (isSeedanceModel(model)) return 3;
  const value = Number(modelParams(model).maxReferenceVideos);
  if (Number.isFinite(value) && value > 0) return value;
  return supportsVideoReferenceForModel(model) ? 1 : 0;
}

export function maxReferenceAudiosForModel(model) {
  if (museSd2Profile(model)) return 3;
  if (isSeedanceDashProModel(model)) {
    const value = Number(modelParams(model).maxReferenceAudios);
    if (Number.isFinite(value) && value > 0) return value;
  }
  if (isSeedanceModel(model)) return 3;
  const value = Number(modelParams(model).maxReferenceAudios);
  if (Number.isFinite(value) && value > 0) return value;
  return 0;
}

export const VIDEO_MODE_OPTIONS = [
  { key: 'text-video', label: '文生视频' },
  { key: 'image-video', label: '图生视频' },
  { key: 'keyframe', label: '首尾帧' },
];

export function normalizeVideoMode(value) {
  const raw = String(value || '').trim();
  if (raw === 'image-ref') return 'image-video';
  if (raw === 'first-last' || raw === 'first_last_frames' || raw === 'frame') return 'keyframe';
  return VIDEO_MODE_OPTIONS.some((item) => item.key === raw) ? raw : 'text-video';
}

export function videoModeOptionsForModel(model) {
  const hasModel = modelIdentity(model).length > 0;
  const seedance = usesSeedanceStyleReferences(model);
  const keyframeSupported = !hasModel || supportsStartEndFramesForModel(model);
  return VIDEO_MODE_OPTIONS.map((item) => {
    const option = seedance && item.key === 'image-video' ? { ...item, label: '全能参考' } : item;
    if (item.key === 'keyframe') {
      return { ...option, disabled: !keyframeSupported || isGrokVideoModel(model) };
    }
    return { ...option, disabled: false };
  });
}

export function normalizeVideoModeForModel(value, model) {
  const mode = normalizeVideoMode(value);
  const options = videoModeOptionsForModel(model);
  const current = options.find((item) => item.key === mode);
  if (current && !current.disabled) return current.key;
  return options.find((item) => !item.disabled)?.key || 'text-video';
}

export function referenceModeForVideoMode(model, mode) {
  const normalized = normalizeVideoModeForModel(mode, model);
  if (normalized === 'text-video') return '';
  if (normalized === 'keyframe') {
    if (supportsStartEndFramesForModel(model)) return 'first_last_frames';
    return '';
  }
  if (museSd2Profile(model)) return 'reference_image';
  const defaultMode = String(modelParams(model).defaultReferenceMode || '').trim();
  if (defaultMode) return defaultMode;
  if (isSeedanceModel(model)) return 'omni_reference';
  if (isVeoVideoModel(model)) return 'frame';
  return maxReferenceImagesForModel(model) > 0 ? 'image' : '';
}
