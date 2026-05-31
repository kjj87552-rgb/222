/* Upload helpers for browser-mode file ingestion (no Electron dialog).
 *
 * Two responsibilities:
 *   1. Persist a File object as an Asset record (native path import first,
 *      AssetStore.writeDataUrl fallback).
 *   2. Extract sample frames from a video File (HTML5 <video> + canvas).
 *
 * Both work in plain browser (Vite dev) and Electron (Electron window).
 */

import { AssetStore } from '../platform/assetStore.js';
import { JobStore } from '../platform/jobStore.js';
import { makeAssetUrl } from '../platform/backendClient.js';
import { readFileAsDataUrl, safeFileName } from './file.js';

export function localPathForUploadFile(file) {
  const directPath = typeof file?.path === 'string' ? file.path.trim() : '';
  if (directPath) return directPath;
  if (typeof window === 'undefined') return '';
  try {
    const bridgedPath = window.libai?.system?.filePath?.(file);
    return typeof bridgedPath === 'string' ? bridgedPath.trim() : '';
  } catch (_) {
    return '';
  }
}

export async function importLocalFileAsAsset(file, projectId, kind = undefined, meta = {}) {
  if (!file) return null;
  const filePath = localPathForUploadFile(file);
  if (!filePath || !AssetStore.importAvailable?.()) return null;
  try {
    const deferCopy = !(meta?.inLibrary || meta?.libraryAsset);
    return await AssetStore.importFile(filePath, projectId, kind || guessKindFromMime(file.type), meta, {
      deferCopy,
    });
  } catch (error) {
    console.warn('Local file path import failed; falling back to browser upload', error);
    return null;
  }
}

/* Persist a File as an Asset, returning the canonical AssetRecord (with .url
 * populated). Falls back gracefully when the backend is offline (returns null
 * — caller decides what to do). */
export async function uploadFileAsAsset(file, projectId, kind = undefined, meta = {}) {
  if (!file) return null;
  const imported = await importLocalFileAsAsset(file, projectId, kind, {
    ...meta,
    source: meta.source || 'browser-upload',
  });
  if (imported) return imported;
  const dataUrl = await readFileAsDataUrl(file);
  const record = await AssetStore.writeDataUrl(projectId, {
    dataUrl,
    filename: safeFileName(file.name, 'asset'),
    kind: kind || guessKindFromMime(file.type),
    mime: file.type || undefined,
    meta: { ...meta, source: meta.source || 'browser-upload' },
  });
  return record;
}

/* Persist a base64 dataUrl directly (no File needed) — used by video frame
 * extraction since canvas.toDataURL bypasses File. */
export async function uploadDataUrlAsAsset(dataUrl, projectId, { filename = 'frame.jpg', kind = 'image', mime = 'image/jpeg', meta = {} } = {}) {
  if (!dataUrl) return null;
  return AssetStore.writeDataUrl(projectId, {
    dataUrl,
    filename: safeFileName(filename, 'frame.jpg'),
    kind,
    mime,
    meta: { ...meta, source: meta.source || 'browser-frame-extract' },
  });
}

export async function analyzeVideoFileWithBackend(file, projectId, {
  sceneDetectionStrength = 60,
  sceneDetect,
  sceneThreshold,
  strengthPreset,
  minSceneDuration,
  extractionStrategy,
  maxFrames = 8,
  referenceIntent = 'structure_reference',
  onStage,
} = {}) {
  if (!file) {
    throw new Error('请选择视频文件');
  }
  if (!JobStore.available()) {
    throw new Error('未连接后端，无法使用 FFmpeg 解析视频');
  }

  onStage?.('正在保存原视频…');
  const videoAsset = await uploadFileAsAsset(file, projectId, 'video', {
    source: 'script-create.reference-video',
    referenceIntent,
  });
  if (!videoAsset?.id) {
    throw new Error('视频上传失败，后端未返回资产 ID');
  }

  onStage?.('正在提交 FFmpeg 场景检测…');
  const job = await JobStore.create(null, {
    projectId,
    type: 'storyboard.video.analyze',
    tab: 'video',
    assetId: videoAsset.id,
    sourceAssetId: videoAsset.id,
    videoUrl: videoAsset.url || videoAsset.src || videoAsset.assetUrl,
    title: videoAsset.title || file.name,
    referenceIntent,
    sceneDetectionStrength,
    sceneDetect,
    sceneThreshold,
    strengthPreset,
    minSceneDuration,
    extractionStrategy,
    maxFrames,
    _storyboard: 'storyboard-video-reference-analyze',
  });
  const completed = await waitForVideoAnalysisJob(job?.id || job?.jobId, onStage);
  const output = completed.output || {};
  const analysis = output.videoReferenceAnalysis || output;
  if (completed.status !== 'completed' || !analysis || !Array.isArray(analysis.frames)) {
    throw new Error(completed.error || '视频解析失败');
  }
  const frames = analysis.frames.map((frame) => {
    const url = makeAssetUrl(frame);
    return url ? { ...frame, url, src: url } : frame;
  });
  return {
    videoAsset,
    frames,
    frameTimes: frames.map((frame) => Number(frame.timestampSec)).filter(Number.isFinite),
    scenes: Array.isArray(analysis.scenes) ? analysis.scenes : [],
    analysis: analysis.analysis || analysis,
    duration: Number(analysis.durationSeconds) || 0,
    width: Number(analysis.width) || 0,
    height: Number(analysis.height) || 0,
    videoReferenceAnalysis: {
      ...analysis,
      frames,
    },
  };
}

async function waitForVideoAnalysisJob(jobId, onStage) {
  if (!jobId) {
    throw new Error('后端未返回视频解析任务 ID');
  }
  const startedAt = Date.now();
  const timeoutMs = 10 * 60 * 1000;
  while (Date.now() - startedAt < timeoutMs) {
    const job = await JobStore.get(jobId);
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'canceled') {
      return job;
    }
    const stage = job.output?.stage || 'FFmpeg 正在解析视频…';
    const progress = Math.max(1, Math.min(99, Number(job.progress) || 1));
    onStage?.(`${stage} ${progress}%`);
    await sleep(650);
  }
  throw new Error('视频解析超时');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* Extract representative frames from a video File as JPEG dataUrls.
 *
 * Strategy:
 *   1. Pre-scan the video with a tiny canvas.
 *   2. Compare adjacent frame features to detect shot / scene changes.
 *   3. Pick representative frames from detected segments using frame quality
 *      (sharpness / exposure / contrast) and distance from cut boundaries, then
 *      fill gaps with high-change moments or evenly spaced fallbacks.
 *   4. Export only the selected frames at `maxDimension`.
 *
 * Returns:
 *   { frames, frameTimes, duration, width, height, scenes, analysis }
 */
export async function extractVideoFrames(file, {
  count = 6,
  maxDimension = 1024,
  mimeType = 'image/jpeg',
  quality = 0.85,
  sceneDetection = true,
  maxScanFrames = 56,
  minSceneGapSec = 0.9,
} = {}) {
  if (!file) {
    return { frames: [], frameTimes: [], scenes: [], analysis: null, duration: 0, width: 0, height: 0 };
  }
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  try {
    await waitForVideoReady(video);
    const duration = Number(video.duration) || 0;
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('视频时长读取失败');
    }
    const naturalW = video.videoWidth;
    const naturalH = video.videoHeight;
    const scale = Math.min(1, maxDimension / Math.max(naturalW, naturalH));
    const targetW = Math.max(1, Math.round(naturalW * scale));
    const targetH = Math.max(1, Math.round(naturalH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: false });

    const scan = sceneDetection
      ? await scanVideoScenes(video, duration, {
          count,
          maxScanFrames,
          minSceneGapSec,
        })
      : null;
    const selected = scan?.selectedTimes?.length
      ? scan.selectedTimes
      : evenlySpacedTimes(duration, count);

    const frames = [];
    const frameTimes = [];
    for (const time of selected.slice(0, count)) {
      const safeTime = clampVideoTime(time, duration);
      await seekVideo(video, safeTime);
      ctx.drawImage(video, 0, 0, targetW, targetH);
      frames.push(canvas.toDataURL(mimeType, quality));
      frameTimes.push(safeTime);
    }

    return {
      frames,
      frameTimes,
      duration,
      width: targetW,
      height: targetH,
      scenes: scan?.scenes || [],
      analysis: scan?.analysis || {
        method: 'uniform',
        sampleCount: frames.length,
        selectedFrameTimes: frameTimes,
        detectedSceneCount: 0,
      },
    };
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute('src');
    try { video.load(); } catch { /* ignore */ }
  }
}

function waitForVideoReady(video) {
  return new Promise((resolve, reject) => {
    if (video.readyState >= 1 && video.duration) return resolve();
    const onMeta = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject(new Error('视频加载失败')); };
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onErr);
    };
    video.addEventListener('loadedmetadata', onMeta, { once: true });
    video.addEventListener('error', onErr, { once: true });
  });
}

function seekVideo(video, time) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject(new Error('视频跳转失败')); };
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onErr);
    };
    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onErr, { once: true });
    video.currentTime = time;
  });
}

async function scanVideoScenes(video, duration, {
  count = 6,
  maxScanFrames = 56,
  minSceneGapSec = 0.9,
} = {}) {
  const desiredSamples = Math.max(count * 5, 18, Math.ceil(duration * 1.6));
  const sampleCount = Math.max(count + 2, Math.min(maxScanFrames, desiredSamples));
  const sampleTimes = evenlySpacedTimes(duration, sampleCount);
  const featureCanvas = document.createElement('canvas');
  featureCanvas.width = 48;
  featureCanvas.height = 27;
  const featureCtx = featureCanvas.getContext('2d', {
    alpha: false,
    willReadFrequently: true,
  });

  const samples = [];
  let previous = null;
  for (const time of sampleTimes) {
    const safeTime = clampVideoTime(time, duration);
    await seekVideo(video, safeTime);
    featureCtx.drawImage(video, 0, 0, featureCanvas.width, featureCanvas.height);
    const data = featureCtx.getImageData(0, 0, featureCanvas.width, featureCanvas.height).data;
    const feature = frameFeature(data, featureCanvas.width, featureCanvas.height);
    const quality = frameQuality(data, featureCanvas.width, featureCanvas.height);
    const changeScore = previous ? featureDistance(previous.feature, feature) : 0;
    samples.push({ time: safeTime, feature, changeScore, ...quality });
    previous = { feature };
  }

  const scores = samples.slice(1).map((item) => item.changeScore);
  const average = scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length);
  const variance = scores.reduce((sum, value) => sum + ((value - average) ** 2), 0) / Math.max(1, scores.length);
  const std = Math.sqrt(variance);
  const threshold = Math.max(0.08, percentile(scores, 0.72), average + std * 0.75);
  const gap = Math.max(minSceneGapSec, duration / Math.max(7, count * 2.5));
  const cutCandidates = samples
    .slice(1)
    .filter((item) => item.changeScore >= threshold)
    .sort((a, b) => b.changeScore - a.changeScore);

  const cuts = [];
  for (const item of cutCandidates) {
    if (cuts.every((cut) => Math.abs(cut.time - item.time) >= gap)) {
      cuts.push({ time: item.time, score: item.changeScore });
    }
  }
  cuts.sort((a, b) => a.time - b.time);

  const scenes = buildScenesFromCuts(cuts, duration, samples);
  const selectedTimes = selectSceneRepresentativeTimes(scenes, samples, duration, count);
  const analysis = summarizeSceneAnalysis({
    scenes,
    selectedTimes,
    sampleCount,
    cuts,
    threshold,
    average,
  });

  return {
    scenes,
    selectedTimes,
    analysis,
  };
}

function frameFeature(data, width, height) {
  const gridX = 4;
  const gridY = 3;
  const cells = Array.from({ length: gridX * gridY }, () => [0, 0, 0, 0]);
  const hist = new Array(12).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const cx = Math.min(gridX - 1, Math.floor((x / width) * gridX));
      const cy = Math.min(gridY - 1, Math.floor((y / height) * gridY));
      const cell = cells[cy * gridX + cx];
      cell[0] += r / 255;
      cell[1] += g / 255;
      cell[2] += b / 255;
      cell[3] += 1;
      hist[Math.min(hist.length - 1, Math.floor(luma * hist.length))] += 1;
    }
  }
  const cellFeatures = cells.flatMap(([r, g, b, n]) => (
    n ? [r / n, g / n, b / n] : [0, 0, 0]
  ));
  const pixels = width * height || 1;
  return [...cellFeatures, ...hist.map((value) => value / pixels)];
}

function featureDistance(a, b) {
  const len = Math.min(a.length, b.length);
  if (!len) return 0;
  let sum = 0;
  for (let i = 0; i < len; i++) sum += Math.abs(a[i] - b[i]);
  return sum / len;
}

function frameQuality(data, width, height) {
  const pixels = width * height || 1;
  const lumas = new Float32Array(pixels);
  let sum = 0;
  let sumSq = 0;
  let clipped = 0;

  for (let i = 0; i < pixels; i++) {
    const idx = i * 4;
    const luma = ((0.299 * data[idx]) + (0.587 * data[idx + 1]) + (0.114 * data[idx + 2])) / 255;
    lumas[i] = luma;
    sum += luma;
    sumSq += luma * luma;
    if (luma < 0.04 || luma > 0.96) clipped += 1;
  }

  const mean = sum / pixels;
  const variance = Math.max(0, (sumSq / pixels) - (mean * mean));
  const contrast = Math.sqrt(variance);
  let edgeSum = 0;
  let edgeCount = 0;
  for (let y = 1; y < height; y++) {
    for (let x = 1; x < width; x++) {
      const idx = y * width + x;
      edgeSum += Math.abs(lumas[idx] - lumas[idx - 1]) + Math.abs(lumas[idx] - lumas[idx - width]);
      edgeCount += 1;
    }
  }

  const sharpness = edgeCount ? edgeSum / edgeCount : 0;
  const exposure = clamp01(1 - (Math.abs(mean - 0.5) * 1.8) - ((clipped / pixels) * 0.7));
  const score = clamp01((sharpness * 2.8) + (contrast * 1.25) + (exposure * 0.22));
  return {
    qualityScore: roundNumber(score),
    sharpness: roundNumber(sharpness),
    contrast: roundNumber(contrast),
    exposure: roundNumber(exposure),
    lumaMean: roundNumber(mean),
  };
}

function buildScenesFromCuts(cuts, duration, samples) {
  const boundaries = [0, ...cuts.map((cut) => cut.time), duration];
  const scenes = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = Math.max(start, boundaries[i + 1]);
    const mid = clampVideoTime(start + ((end - start) * 0.5), duration);
    const cut = cuts[i - 1] || null;
    const segmentSamples = samples.filter((item) => item.time >= start && item.time <= end);
    const bestSample = selectBestSceneSample(segmentSamples, start, end, duration);
    const peakSample = segmentSamples.reduce((best, item) => (
      !best || item.changeScore > best.changeScore ? item : best
    ), null);
    const avgChange = segmentSamples.reduce((sum, item) => sum + item.changeScore, 0) / Math.max(1, segmentSamples.length);
    const avgQuality = segmentSamples.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / Math.max(1, segmentSamples.length);
    scenes.push({
      index: i,
      start,
      end,
      duration: Math.max(0, end - start),
      representativeTime: bestSample?.time ?? mid,
      changeScore: roundNumber(cut?.score || peakSample?.changeScore || avgChange || 0),
      peakChangeScore: roundNumber(peakSample?.changeScore || 0),
      motionScore: roundNumber(avgChange || 0),
      qualityScore: roundNumber(bestSample?.qualityScore ?? avgQuality ?? 0),
      sharpness: roundNumber(bestSample?.sharpness || 0),
      exposure: roundNumber(bestSample?.exposure || 0),
      sampleCount: segmentSamples.length,
    });
  }
  return scenes.filter((scene) => scene.duration > 0.08);
}

function selectBestSceneSample(samples, start, end, duration) {
  if (!samples.length) return null;
  const segmentDuration = Math.max(0.1, end - start);
  const mid = start + (segmentDuration * 0.5);
  return samples.reduce((best, item) => {
    const centerBias = 1 - Math.min(1, Math.abs(item.time - mid) / Math.max(0.1, segmentDuration * 0.5));
    const boundaryDistance = Math.min(item.time - start, end - item.time);
    const boundaryBias = Math.min(1, Math.max(0, boundaryDistance) / Math.min(1.2, Math.max(0.18, segmentDuration * 0.25)));
    const stableBias = 1 - Math.min(1, (item.changeScore || 0) * 5);
    const score = ((item.qualityScore || 0) * 0.48)
      + (centerBias * 0.24)
      + (boundaryBias * 0.2)
      + (stableBias * 0.08);
    if (!best || score > best.score) return { ...item, score };
    return best;
  }, null);
}

function selectSceneRepresentativeTimes(scenes, samples, duration, count) {
  const selected = [];
  const scenePool = [...scenes].sort((a, b) => {
    const weightA = a.duration + (a.changeScore * 6) + (a.motionScore * 4) + (a.qualityScore * 2);
    const weightB = b.duration + (b.changeScore * 6) + (b.motionScore * 4) + (b.qualityScore * 2);
    return weightB - weightA;
  });
  if (scenes[0]) selected.push(scenes[0].representativeTime);
  if (count > 1 && scenes.length > 1) addTime(selected, scenes[scenes.length - 1].representativeTime, duration, 0.4);
  for (const scene of scenePool) {
    if (selected.length >= count) break;
    addTime(selected, scene.representativeTime, duration, duration / Math.max(10, count * 3));
  }

  const changePool = [...samples]
    .sort((a, b) => b.changeScore - a.changeScore)
    .map((item) => item.time);
  for (const time of changePool) {
    if (selected.length >= count) break;
    addTime(selected, time, duration, duration / Math.max(12, count * 4));
  }

  for (const time of evenlySpacedTimes(duration, count)) {
    if (selected.length >= count) break;
    addTime(selected, time, duration, duration / Math.max(16, count * 5));
  }

  return selected
    .slice(0, count)
    .map((time) => clampVideoTime(time, duration))
    .sort((a, b) => a - b);
}

function summarizeSceneAnalysis({ scenes, selectedTimes, sampleCount, cuts, threshold, average }) {
  const sceneCount = scenes.length;
  const totalSceneDuration = scenes.reduce((sum, scene) => sum + (scene.duration || 0), 0);
  const averageSceneDuration = totalSceneDuration / Math.max(1, sceneCount);
  const averageMotion = scenes.reduce((sum, scene) => sum + (scene.motionScore || 0), 0) / Math.max(1, sceneCount);
  const averageQuality = scenes.reduce((sum, scene) => sum + (scene.qualityScore || 0), 0) / Math.max(1, sceneCount);
  const pacing = averageSceneDuration <= 1.6
    ? 'fast-cut'
    : averageSceneDuration >= 5.5
      ? 'slow-build'
      : 'balanced';
  return {
    method: 'scene-detection',
    sampleCount,
    detectedSceneCount: sceneCount,
    cutCount: cuts.length,
    threshold: roundNumber(threshold),
    averageChange: roundNumber(average),
    averageSceneDuration: roundNumber(averageSceneDuration, 2),
    averageMotion: roundNumber(averageMotion),
    averageQuality: roundNumber(averageQuality),
    pacing,
    selectedFrameTimes: selectedTimes.map((time) => roundNumber(time, 2)),
    sceneSummaries: scenes.map((scene) => ({
      index: scene.index,
      start: roundNumber(scene.start, 2),
      end: roundNumber(scene.end, 2),
      duration: roundNumber(scene.duration, 2),
      representativeTime: roundNumber(scene.representativeTime, 2),
      motionScore: roundNumber(scene.motionScore),
      qualityScore: roundNumber(scene.qualityScore),
      changeScore: roundNumber(scene.changeScore),
    })),
  };
}

function addTime(items, time, duration, minGap) {
  const safeTime = clampVideoTime(time, duration);
  if (items.every((item) => Math.abs(item - safeTime) >= minGap)) {
    items.push(safeTime);
  }
}

function evenlySpacedTimes(duration, count) {
  const total = Math.max(1, Number(count) || 1);
  return Array.from({ length: total }, (_, i) => (
    clampVideoTime((duration * (i + 0.5)) / total, duration)
  ));
}

function clampVideoTime(time, duration) {
  const safeDuration = Math.max(0.1, Number(duration) || 0.1);
  return Math.max(0, Math.min(safeDuration - 0.05, Number(time) || 0));
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.round((sorted.length - 1) * p)));
  return sorted[index];
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function roundNumber(value, digits = 3) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const m = 10 ** digits;
  return Math.round(n * m) / m;
}

function guessKindFromMime(mime) {
  if (!mime) return undefined;
  const v = String(mime).toLowerCase();
  if (v.startsWith('image/')) return 'image';
  if (v.startsWith('video/')) return 'video';
  if (v.startsWith('audio/')) return 'audio';
  return undefined;
}
