/* Storyboard creation orchestrator.
 *
 * Responsibilities:
 *   - Compose the final LLM prompt by loading the user-editable scriptToShots
 *     template from PromptStore (fallback to inline default), filling vars,
 *     and embedding the Director Bible.
 *   - Decide target ScriptNode (existing one if `targetIsScript`, else create new).
 *   - Optimistically mark the node as generating + jobStage = '准备…'.
 *   - Hand off to JobStore.create with payload that backend can route
 *     to text.generate, tagged with `_storyboard: 'create-script'` so
 *     App.jsx onJobComplete writes shots back via jsonRobustParse.
 *
 * Returns: Promise<{ targetNodeId, jobId }> on success.
 *          Throws on hard failures (caller catches and writes node.error).
 */

import { JobStore } from '../../shared/platform/jobStore.js';
import { ProviderStore } from '../../shared/platform/providerStore.js';
import { modelLabel, selectBackendModel } from '../../shared/platform/modelSelection.js';
import { buildGenerationPayload } from '../../shared/platform/generationPayload.js';
import { canvasActions } from '../../shared/store/canvasStore.js';
import { uiActions } from '../../shared/store/uiStore.js';
import { buildScriptToShotsPrompt } from './scriptPromptUtils.js';
import { getStoryboardPrompt, STORYBOARD_PROMPT_KEYS } from './promptSeed.js';
import { getShotGroupPromptTemplateDefinition } from './promptTemplateRegistry.js';

const DEFAULT_VIEWPORT_CENTER = { x: 600, y: 400 };

export async function runScriptModeStoryboard({
  request,
  sourceNode,
  projectId,
  getViewportCenter,
  focusNodesInCanvas,
}) {
  const targetIsScript = sourceNode?.type === 'script';
  const count = clampShotCount(request?.shotsCount);
  const sourceText = collectSourceText(request, sourceNode);

  /* Try to load user-editable scriptToShots template; fallback to inline default. */
  let templateRow = null;
  try {
    templateRow = await getStoryboardPrompt(STORYBOARD_PROMPT_KEYS.scriptToShots);
  } catch (_) { /* network/electron offline → inline fallback */ }
  const template = templateRow?.content || null;

  /* Compose the user-visible source text. char/video modes prepend a small
   * note about the attached references so the LLM knows what the images mean. */
  const mode = request?.mode || 'script';
  const refImages = collectReferenceImages(request);
  const refAssets = collectReferenceAssets(request);
  const refVideos = collectReferenceVideos(request, refAssets);
  const annotatedText = annotateSourceText(sourceText, mode, refImages, request, refAssets, refVideos);

  /* Build the LLM prompt with director_bible already embedded via the renderer. */
  const { user_prompt: prompt } = buildScriptToShotsPrompt(template, {
    story_text: annotatedText,
    shot_count: count,
    style: request?.style || '电影叙事感',
  });

  /* Decide target node. */
  const pos = sourceNode
    ? { x: sourceNode.x + sourceNode.w + 100, y: sourceNode.y }
    : (getViewportCenter ? getViewportCenter() : DEFAULT_VIEWPORT_CENTER);

  const targetNode = targetIsScript ? sourceNode : {
    id: 'sc' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 4),
    type: 'script',
    x: pos.x,
    y: pos.y,
    w: 640,
    h: 280,
    title: '分镜脚本',
    shots: [],
    generating: true,
    progress: 8,
    jobStage: '准备…',
    tag: '生成',
  };

  const createdEdges = !targetIsScript && sourceNode
    ? [{ id: 'esc' + targetNode.id, from: sourceNode.id, to: targetNode.id }]
    : [];

  if (targetIsScript) {
    canvasActions.updateNode(targetNode.id, {
      generating: true,
      progress: 8,
      jobStage: '准备…',
      error: null,
      tag: '生成',
    });
  } else {
    canvasActions.setNodes(ns => [...ns, targetNode]);
    if (createdEdges.length) canvasActions.setEdges(es => [...es, ...createdEdges]);
    uiActions.setSelection([targetNode.id]);
    if (typeof focusNodesInCanvas === 'function') focusNodesInCanvas([targetNode]);
  }

  /* Pick a Chat model; when references exist, prefer models flagged for image input. */
  let selectedModel = null;
  const storyboardCapability = 'text.generate';
  try {
    selectedModel = await selectStoryboardModel({ visualRefs: refImages.length > 0 });
  } catch { /* fall through with selectedModel = null */ }

  /* Fail explicitly if backend is offline or no suitable model is configured. */
  if (!JobStore.available() || !selectedModel) {
    const fallbackDesc = !JobStore.available()
      ? '未连接后端，请启动 backend 服务再试'
      : (refImages.length
        ? '未配置可用的 Chat 模型，请到「模型配置」新增或启用模型'
        : '未配置可用的 Chat 模型，请到「模型配置」新增或启用模型');
    canvasActions.updateNode(targetNode.id, {
      generating: false,
      progress: 0,
      jobStage: '',
      tag: '失败',
      error: fallbackDesc,
      shots: [
        { n: 1, shot: '中景', desc: fallbackDesc, dur: '3s' },
      ],
    });
    return { targetNodeId: targetNode.id, jobId: null };
  }

  /* Submit the job. Wrap in try/catch so the optimistic 'generating' state
   * gets reset if backend rejects — caller may also catch and rethrow,
   * but we keep the optimistic-update rollback co-located with the optimistic mark. */
  let job;
  try {
    const referenceImages = refImages.map(referenceUrl).filter(Boolean);
    const referenceVideos = refVideos.map(referenceUrl).filter(Boolean);
    const basePayload = {
      projectId,
      type: storyboardCapability,
      capability: storyboardCapability,
      tab: 'text',
      prompt,
      inputText: annotatedText,
      title: targetNode.title,
      shotsCount: count,
      style: `scriptcreate:${mode}`,
      mode,
      model: modelLabel(selectedModel),
      modelId: selectedModel?.id,
      providerModelId: selectedModel?.id,
      modelName: selectedModel?.modelName,
      provider: selectedModel?.providerId,
      params: {
        count,
        mode,
        storyboardMode: mode,
        referenceKind: mode === 'video' ? 'video-frames' : mode === 'char' ? 'character-images' : 'script',
      },
      referenceAssets: refAssets,
      ...(referenceImages.length ? { referenceImages } : {}),
      ...(referenceVideos.length ? { referenceVideos, sourceVideoUrl: referenceVideos[0] } : {}),
      characterImages: mode === 'char' ? refImages : [],
      videoFrames: mode === 'video' ? refImages : [],
      videoMeta: request?.videoMeta || null,
      characterPlan: mode === 'char' ? request?.characterPlan || null : null,
      videoAnalysis: mode === 'video' ? request?.videoAnalysis || request?.videoMeta?.analysis || null : null,
      videoScenes: mode === 'video' ? request?.videoScenes || request?.videoMeta?.scenes || [] : [],
      _storyboard: 'create-script',
      _nodeId: targetNode.id,
      _scriptCreateMode: mode,
    };
    const jobPayload = buildGenerationPayload({
      payload: basePayload,
      nodeId: targetNode.id,
      nodes: [sourceNode, targetNode].filter(Boolean),
      edges: createdEdges,
      projectId,
      capability: storyboardCapability,
    });
    jobPayload.params = { ...(jobPayload.params || {}), ...basePayload.params };
    job = await JobStore.create(targetNode.id, jobPayload);
  } catch (err) {
    canvasActions.updateNode(targetNode.id, {
      generating: false,
      progress: 0,
      jobStage: '',
      error: err instanceof Error ? err.message : String(err),
      tag: '失败',
    });
    throw err;
  }

  return { targetNodeId: targetNode.id, jobId: job?.id || job?.jobId || null };
}

/* helpers */

function clampShotCount(n) {
  const v = Math.max(1, Math.min(Number(n) || 8, 40));
  return v;
}

/* Collect reference image URLs from request.images (AssetRecord[]).
 * char-mode = 1-3 portrait uploads; video-mode = scene-aware key frames. */
function collectReferenceImages(request) {
  const items = [
    ...(Array.isArray(request?.images) ? request.images : []),
    ...(Array.isArray(request?.characterImages) ? request.characterImages : []),
    ...(Array.isArray(request?.videoFrames) ? request.videoFrames : []),
  ];
  return uniqueAssets(items).filter((img) => Boolean(referenceUrl(img)));
}

function collectReferenceAssets(request) {
  return uniqueAssets([
    ...(Array.isArray(request?.referenceAssets) ? request.referenceAssets : []),
    ...(Array.isArray(request?.characterImages) ? request.characterImages : []),
    ...(Array.isArray(request?.videoFrames) ? request.videoFrames : []),
    request?.videoAsset,
  ].filter(Boolean));
}

function collectReferenceVideos(request, refAssets = []) {
  return uniqueAssets([
    request?.videoAsset,
    ...refAssets.filter((asset) => String(asset?.kind || '').toLowerCase() === 'video'),
  ].filter(Boolean));
}

function referenceUrl(asset) {
  if (!asset) return '';
  return asset.url || asset.src || asset.assetUrl || asset.asset_url || asset.path || asset.assetPath || '';
}

function referenceTitle(asset, fallback = '参考素材') {
  return asset?.title || asset?.name || asset?.filename || asset?.id || fallback;
}

function uniqueAssets(items) {
  const seen = new Set();
  const result = [];
  for (const item of items || []) {
    if (!item) continue;
    const key = item.id || referenceUrl(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

/* Wrap the user's source text with a short labelled note describing what the
 * accompanying images mean. Without this the LLM might confuse them with
 * generic illustrations. */
function annotateSourceText(sourceText, mode, refImages, request, refAssets = [], refVideos = []) {
  if (!refImages.length) return sourceText || '';
  const base = (sourceText || '').trim();
  if (mode === 'char') {
    const plan = request?.characterPlan || {};
    const locks = Array.isArray(plan.consistencyLocks) && plan.consistencyLocks.length
      ? `一致性锁定项：${plan.consistencyLocks.join('、')}`
      : '一致性锁定项：脸型、发型发色、服装轮廓、体型比例、标志配饰、气质表情';
    const workflow = Array.isArray(plan.analysisWorkflow) && plan.analysisWorkflow.length
      ? plan.analysisWorkflow.map((item, index) => `${index + 1}）${item}`).join('；')
      : '先建立角色视觉设定，再判断多图关系，最后输出分镜。';
    const slots = Array.isArray(plan.referenceSlots) && plan.referenceSlots.length
      ? plan.referenceSlots
          .map((slot) => `${slot.index}. ${slot.title || `角色参考图${slot.index}`}：${slot.role === 'primary-identity-reference' ? '主身份参考' : '补充角度/造型参考'}`)
          .join('\n')
      : '';
    const refs = refImages
      .map((img, index) => {
        const roleHint = refImages.length > 1
          ? '请判断它是同一角色的多视角/多造型，还是不同角色'
          : '请将它作为主角视觉基准';
        return `${index + 1}. ${referenceTitle(img, `角色参考图${index + 1}`)}：${roleHint}`;
      })
      .join('\n');
    const note = [
      `【角色参考图生成模式】以下附 ${refImages.length} 张角色参考图。`,
      `工作流：${workflow}`,
      locks,
      plan.conflictPolicy ? `冲突处理：${plan.conflictPolicy}` : '',
      '角色一致性要求：所有镜头必须保持角色身份、年龄感、发型发色、服装主色和标志物一致；除非剧情明确要求，不要自行换装、换发型、改变脸型。',
      '分镜要求：每个镜头写清景别、动作、情绪、构图/运镜、场景调度和时长；如果有多个角色，写清谁在画面中、谁主导动作、人物关系如何推进。',
      slots ? `参考图角色槽位：\n${slots}` : '',
      refs ? `参考图清单：\n${refs}` : '',
      base ? `剧情描述：\n${base}` : '剧情描述：未提供，请围绕参考角色设计一段适合短剧/漫剧开场的完整情节。',
    ].filter(Boolean).join('\n');
    return note;
  }
  if (mode === 'video') {
    const meta = request?.videoMeta;
    const durHint = meta?.duration ? `时长约 ${Number(meta.duration).toFixed(1)}s，` : '';
    const videoName = meta?.filename || referenceTitle(refVideos[0], '参考视频');
    const analysis = request?.videoAnalysis || meta?.analysis || {};
    const pacingLine = [
      analysis.pacing ? `节奏判断 ${formatPacing(analysis.pacing)}` : '',
      Number.isFinite(Number(analysis.averageSceneDuration)) ? `平均镜头 ${Number(analysis.averageSceneDuration).toFixed(1)}s` : '',
      Number.isFinite(Number(analysis.averageMotion)) ? `平均运动强度 ${Number(analysis.averageMotion).toFixed(3)}` : '',
      Number.isFinite(Number(analysis.averageQuality)) ? `平均代表帧质量 ${Number(analysis.averageQuality).toFixed(3)}` : '',
    ].filter(Boolean).join('；');
    const scenes = Array.isArray(request?.videoScenes) && request.videoScenes.length
      ? request.videoScenes
      : (Array.isArray(meta?.scenes) ? meta.scenes : []);
    const sceneRows = scenes
      .map((scene, index) => {
        const start = Number.isFinite(Number(scene.start)) ? Number(scene.start).toFixed(1) : '0.0';
        const end = Number.isFinite(Number(scene.end)) ? Number(scene.end).toFixed(1) : '';
        const rep = Number.isFinite(Number(scene.representativeTime)) ? `，代表帧 ${Number(scene.representativeTime).toFixed(1)}s` : '';
        const motion = Number.isFinite(Number(scene.motionScore)) ? `，运动 ${Number(scene.motionScore).toFixed(3)}` : '';
        const quality = Number.isFinite(Number(scene.qualityScore)) ? `，清晰度/质量 ${Number(scene.qualityScore).toFixed(3)}` : '';
        const score = Number.isFinite(Number(scene.changeScore)) ? `，变化强度 ${Number(scene.changeScore).toFixed(3)}` : '';
        return `${index + 1}. ${start}s-${end}s${rep}${motion}${quality}${score}`;
      })
      .join('\n');
    const frameRows = refImages
      .map((img, index) => {
        const time = Number.isFinite(Number(img.timestampSec)) ? ` @ ${Number(img.timestampSec).toFixed(1)}s` : '';
        const scene = Number.isFinite(Number(img.sceneIndex)) ? `，所属镜头 ${Number(img.sceneIndex) + 1}` : '';
        return `${index + 1}. ${referenceTitle(img, `关键帧${index + 1}`)}${time}${scene}`;
      })
      .join('\n');
    const note = [
      `【参考视频生成模式】参考视频：${videoName}，${durHint}系统已先做镜头/场景变化检测，再抽取 ${refImages.length} 张关键帧。`,
      `检测摘要：${analysis.method || 'scene-detection'}；采样点 ${analysis.sampleCount || refImages.length}；检测镜头/场景 ${scenes.length || meta?.sceneCount || 1} 段；剪切点 ${analysis.cutCount || 0} 个。`,
      pacingLine ? `节奏/质量摘要：${pacingLine}。` : '',
      '工作流：1）按镜头检测结果还原原视频节奏结构；2）按每段代表帧提炼景别变化、运动方向、构图层次、光影、情绪转折；3）按额外提示改写为新的分镜脚本。',
      '复用要求：保留参考视频的镜头方法和节奏结构，不要逐帧照搬画面内容；如果额外提示指定题材/人物/世界观，则用新内容替换原视频主体。',
      '分镜要求：每个镜头写清景别、动作、构图/运镜、情绪、转场关系和时长；镜头数量与节奏应尽量贴合检测到的场景段。',
      sceneRows ? `检测到的镜头/场景段：\n${sceneRows}` : '',
      frameRows ? `关键帧顺序：\n${frameRows}` : '',
      refAssets.length ? `已传入素材数：${refAssets.length}` : '',
      base ? `额外提示词：\n${base}` : '额外提示词：未提供，请忠实提炼参考视频节奏并生成可执行分镜。',
    ].filter(Boolean).join('\n');
    return note;
  }
  return base;
}

function formatPacing(pacing) {
  if (pacing === 'fast-cut') return '快切/高频切换';
  if (pacing === 'slow-build') return '慢镜铺陈/长镜头感';
  return '均衡叙事节奏';
}

function collectSourceText(request, sourceNode) {
  return [
    request?.text,
    sourceNode?.body,
    Array.isArray(sourceNode?.shots)
      ? sourceNode.shots
          .map((s, i) => `${s.n || i + 1}. ${s.shot || ''} ${s.desc || ''} ${s.dur || ''}`.trim())
          .join('\n')
      : '',
    sourceNode?.prompt,
  ].filter(Boolean).join('\n\n').trim();
}

async function selectStoryboardModel({ visualRefs = false } = {}) {
  const providerResult = await ProviderStore.list();
  const enabledProviderIds = new Set((providerResult?.providers || [])
    .filter((p) => p.enabled !== false)
    .map((p) => p.id));
  const modelResult = await ProviderStore.models({ capability: 'text.generate' });
  const candidates = (modelResult?.models || []).filter((m) => m.enabled !== false);
  const ordered = visualRefs
    ? [...candidates].sort((a, b) => Number(Boolean(b.params?.supportsImageInput)) - Number(Boolean(a.params?.supportsImageInput)))
    : candidates;
  return selectBackendModel(ordered, { enabledProviderIds });
}

// ─── Phase 2A: 工作台编排函数 ────────────────────────────────────────

import {
  SHOTGROUP_PROMPT_INFERENCE_TAG,
  SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE,
  buildShotGroupPromptInferencePrompt,
} from './promptInference.js';

import {
  buildNovelToScriptPrompt,
  buildScriptFormatterPrompt,
  buildAssetExtractionPrompt,
  buildReferenceAnalysisPrompt,
  buildScriptToShotGroupsPrompt,
  sanitizeStrategicGuideForPrompt,
} from './scriptPromptUtils.js';

async function loadTemplateContent(key) {
  try {
    const row = await getStoryboardPrompt(key);
    return row?.content || '';
  } catch {
    return '';
  }
}

function reportProgress(onProgress, stage, progress, extra = {}) {
  try {
    onProgress?.({ stage, progress, ...extra });
  } catch (_) { /* swallow caller errors */ }
}

/* Submit a generic LLM job tagged with `_storyboard` for downstream routing.
 * Caller-provided `model` (a ProviderStore models[] entry) is required;
 * the function fills the standard model-routing fields on jobInput so the
 * backend can dispatch to the right provider — same shape Generator uses.
 * Returns { ok, jobId } on success, { ok: false, error } on failure. */
async function submitWorkbenchJob({
  nodeId,
  projectId,
  prompt,
  storyboardTag,
  model,
  extraInput = {},
  onProgress,
}) {
  if (!JobStore.available()) {
    return { ok: false, error: 'JobStore not available — backend offline?' };
  }
  if (!model) {
    return { ok: false, error: '请先在「模型配置」启用一个 Chat 模型' };
  }
  reportProgress(onProgress, '提交任务…', 20);
  try {
    const capability = model.capability || 'text.generate';
    const job = await JobStore.create(nodeId || null, {
      projectId,
      type: capability,
      capability,
      tab: 'text',
      prompt,
      model: modelLabel(model),
      modelId: model.id,
      providerModelId: model.id,
      modelName: model.modelName,
      provider: model.providerId,
      _storyboard: storyboardTag,
      _nodeId: nodeId || null,
      ...extraInput,
    });
    const jobId = job?.id || job?.jobId || null;
    reportProgress(onProgress, '等待 LLM 响应…', 60, jobId ? { jobId } : {});
    return { ok: true, jobId };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}

/* novel → standardized script (preprocessing). */
export async function runNovelToScript({ novelText, episodeNumber = 1, projectId, nodeId, model, onProgress }) {
  reportProgress(onProgress, '加载提示词模板…', 5);
  const tpl = await loadTemplateContent(STORYBOARD_PROMPT_KEYS.novelToScript);
  reportProgress(onProgress, '装配 prompt…', 10);
  const { user_prompt } = buildNovelToScriptPrompt(tpl, { novelText, episodeNumber });
  return submitWorkbenchJob({
    nodeId,
    projectId,
    prompt: user_prompt,
    storyboardTag: 'novel-to-script',
    model,
    extraInput: { _episodeNumber: episodeNumber },
    onProgress,
  });
}

/* any-format script → standardized script (preprocessing). */
export async function runScriptFormatter({ rawScript, episodeNumber = 1, projectId, nodeId, model, onProgress }) {
  reportProgress(onProgress, '加载提示词模板…', 5);
  const tpl = await loadTemplateContent(STORYBOARD_PROMPT_KEYS.scriptFormatter);
  reportProgress(onProgress, '装配 prompt…', 10);
  const { user_prompt } = buildScriptFormatterPrompt(tpl, { rawScript, episodeNumber });
  return submitWorkbenchJob({
    nodeId,
    projectId,
    prompt: user_prompt,
    storyboardTag: 'script-formatter',
    model,
    extraInput: { _episodeNumber: episodeNumber },
    onProgress,
  });
}

/* Standardized script -> keyCharacters / keyProps / sceneAnalysis. */
export async function runAssetExtraction({ scriptText, projectId, nodeId, model, onProgress }) {
  reportProgress(onProgress, '加载提示词模板…', 5);
  const tpl = await loadTemplateContent(STORYBOARD_PROMPT_KEYS.extractAssets);
  reportProgress(onProgress, '装配 prompt…', 10);
  const { user_prompt } = buildAssetExtractionPrompt(tpl, { scriptText });
  return submitWorkbenchJob({
    nodeId,
    projectId,
    prompt: user_prompt,
    storyboardTag: 'extract-assets',
    model,
    onProgress,
  });
}

/* Workbench text script → asset candidates. */
export async function runStoryboardTextAssetsAnalyze({ scriptText, projectId, nodeId, model, onProgress }) {
  reportProgress(onProgress, '加载提示词模板…', 5);
  const tpl = await loadTemplateContent(STORYBOARD_PROMPT_KEYS.extractAssets);
  reportProgress(onProgress, '装配 prompt…', 10);
  const { user_prompt } = buildAssetExtractionPrompt(tpl, { scriptText });
  return submitWorkbenchJob({
    nodeId,
    projectId,
    prompt: user_prompt,
    storyboardTag: 'storyboard-text-assets-analyze',
    model,
    onProgress,
  });
}

/* Workbench references + text candidates → analysis draft. */
export async function runStoryboardReferenceAnalysis({
  scriptTitle = '',
  scriptExcerpt = '',
  sourceAssets = [],
  referenceAssets,
  textCandidates = {},
  projectId,
  nodeId,
  model,
  onProgress,
}) {
  reportProgress(onProgress, '加载提示词模板…', 5);
  const tpl = await loadTemplateContent(STORYBOARD_PROMPT_KEYS.referenceAnalyze);
  reportProgress(onProgress, '装配 prompt…', 10);
  const normalizedReferenceAssets = Array.isArray(referenceAssets) ? referenceAssets : sourceAssets;
  const promptSourceAssets = mergePromptReferenceAssets(sourceAssets, normalizedReferenceAssets);
  const { user_prompt } = buildReferenceAnalysisPrompt(tpl, {
    scriptTitle,
    scriptExcerpt,
    sourceAssets: promptSourceAssets,
    textCandidates,
  });
  return submitWorkbenchJob({
    nodeId,
    projectId,
    prompt: user_prompt,
    storyboardTag: 'storyboard-reference-analyze',
    model,
    extraInput: {
      sourceAssets,
      referenceAssets: normalizedReferenceAssets,
      textCandidates,
    },
    onProgress,
  });
}

/* Workbench video reference → backend FFmpeg scene analysis. */
export async function runStoryboardVideoReferenceAnalysis({
  sourceAsset,
  projectId,
  nodeId,
  referenceIntent = 'structure_reference',
  sceneDetectionStrength = 60,
  sceneDetect,
  sceneThreshold,
  strengthPreset,
  minSceneDuration,
  extractionStrategy,
  maxFrames = 8,
  onProgress,
}) {
  if (!JobStore.available()) {
    return { ok: false, error: '未连接后端，请启动 backend 服务再试' };
  }
  if (!sourceAsset) {
    return { ok: false, error: '请先选择一个参考视频' };
  }
  const assetId = sourceAsset.assetId || sourceAsset.id || assetIdFromUrl(referenceUrl(sourceAsset));
  const videoUrl = referenceUrl(sourceAsset);
  if (!assetId && !videoUrl) {
    return { ok: false, error: '参考视频缺少 assetId 或 URL' };
  }
  reportProgress(onProgress, '提交后端 FFmpeg 解析…', 8);
  try {
    const job = await JobStore.create(nodeId || null, {
      projectId,
      type: 'storyboard.video.analyze',
      tab: 'video',
      assetId,
      sourceAssetId: assetId,
      videoUrl,
      title: sourceAsset.title || sourceAsset.name || '参考视频',
      referenceIntent,
      sceneDetectionStrength,
      sceneThreshold,
      strengthPreset,
      minSceneDuration,
      extractionStrategy,
      sceneDetect,
      maxFrames,
      _storyboard: 'storyboard-video-reference-analyze',
      _nodeId: nodeId || null,
    });
    reportProgress(onProgress, '等待后端解析视频…', 20);
    return { ok: true, jobId: job?.id || job?.jobId || null };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}

function assetIdFromUrl(url) {
  const match = String(url || '').match(/\/assets\/([A-Za-z0-9_-]+)/);
  return match?.[1] || '';
}

function normalizeShotGroupTargetDuration({ targetDuration, shotEngine } = {}) {
  const legacyMatch = String(shotEngine || '').match(/\d+/);
  const raw = targetDuration ?? (legacyMatch ? Number(legacyMatch[0]) : 15);
  const numeric = Math.round(Number(raw));
  if (!Number.isFinite(numeric)) return 15;
  return Math.max(8, Math.min(15, numeric));
}

function mergePromptReferenceAssets(sourceAssets = [], referenceAssets = []) {
  const seen = new Set();
  return [...sourceAssets, ...referenceAssets].filter((asset) => {
    if (!asset) return false;
    const key = asset.id || asset.assetId || asset.url || asset.path || JSON.stringify(asset);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* standardized script + strategic guide → shotGroups[] (v3). */
export async function runScriptToShotGroups({
  scriptText,
  strategicGuide,
  projectId,
  nodeId,
  model,
  shotEngine,
  targetDuration,
  onProgress,
}) {
  const normalizedTargetDuration = normalizeShotGroupTargetDuration({ targetDuration, shotEngine });
  const normalizedShotEngine = `${normalizedTargetDuration}s`;
  reportProgress(onProgress, '加载提示词模板…', 5);
  const key = STORYBOARD_PROMPT_KEYS.scriptToShotGroupsUnified;
  const tpl = await loadTemplateContent(key);
  reportProgress(onProgress, '装配 prompt…', 10);
  const promptStrategicGuide = sanitizeStrategicGuideForPrompt(strategicGuide || {});
  const { user_prompt } = buildScriptToShotGroupsPrompt(tpl, {
    strategicGuide: promptStrategicGuide,
    currentChunk: scriptText,
    targetDuration: normalizedTargetDuration,
  });
  return submitWorkbenchJob({
    nodeId,
    projectId,
    prompt: user_prompt,
    storyboardTag: 'script-to-shotgroups',
    model,
    extraInput: {
      _shotEngine: normalizedShotEngine,
      _targetDuration: normalizedTargetDuration,
      _strategicGuide: promptStrategicGuide,
    },
    onProgress,
  });
}

export async function runShotGroupPromptInference({
  shotGroup,
  shotGroups,
  assets = {},
  previousAnchor = null,
  directorAnalysis = '',
  styleDirective = '',
  scriptText = '',
  aspectRatio = 'auto',
  projectId,
  nodeId,
  model,
  targetDuration,
  allShotGroups,
  groupIndex = 0,
  groupTotal,
  promptTemplateId,
  promptTemplateKey,
  promptOutputMode,
  promptQueueId,
  promptQueueMode,
  promptQueueConcurrency,
  shotGroupAutoContinue,
  onProgress,
}) {
  const targetGroups = (Array.isArray(shotGroups) && shotGroups.length ? shotGroups : [shotGroup].filter(Boolean))
    .slice(0, SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE);
  const primaryGroup = targetGroups[0] || shotGroup || {};
  const groupIds = targetGroups.map((group, index) => (
    group?.groupId
    || group?.shotGroupId
    || group?.id
    || `G${String(groupIndex + index + 1).padStart(3, '0')}`
  ));
  const groupId = groupIds[0] || `G${String(groupIndex + 1).padStart(3, '0')}`;
  reportProgress(onProgress, '加载提示词模板…', 5);
  const hasTemplateSelection = Boolean(promptTemplateId || promptTemplateKey);
  const promptTemplate = hasTemplateSelection
    ? getShotGroupPromptTemplateDefinition(promptTemplateId || promptTemplateKey, { aspectRatio })
    : null;
  const resolvedTemplateKey = promptTemplate?.key || promptTemplateKey || STORYBOARD_PROMPT_KEYS.shotGroupPromptInference;
  const resolvedOutputMode = promptOutputMode || promptTemplate?.outputMode || 'dual';
  const tpl = (await loadTemplateContent(resolvedTemplateKey))
    || promptTemplate?.content
    || '';
  reportProgress(onProgress, '装配提示词推理 prompt…', 10);
  const { user_prompt } = buildShotGroupPromptInferencePrompt(tpl, {
    shotGroup: primaryGroup,
    shotGroups: targetGroups,
    assets,
    previousAnchor,
    directorAnalysis,
    styleDirective,
    scriptText,
    aspectRatio,
    targetDuration,
  });
  const normalizedAllGroups = Array.isArray(allShotGroups) && allShotGroups.length ? allShotGroups : [];
  const totalGroups = Math.max(1, Number(groupTotal) || normalizedAllGroups.length || 1);
  const queueConcurrency = Math.max(1, Number(promptQueueConcurrency) || 1);
  const promptAssets = sanitizeStrategicGuideForPrompt(assets || {});
  return submitWorkbenchJob({
    nodeId,
    projectId,
    prompt: user_prompt,
    storyboardTag: SHOTGROUP_PROMPT_INFERENCE_TAG,
    model,
    extraInput: {
      _shotGroupId: groupId,
      _shotGroup: primaryGroup || null,
      _shotGroupIds: groupIds,
      _shotGroups: targetGroups,
      _shotGroupIndex: groupIndex,
      _shotGroupTotal: totalGroups,
      _shotGroupBatchSize: targetGroups.length,
      ...(promptQueueId ? { _shotGroupQueueId: promptQueueId } : {}),
      ...(promptQueueMode ? { _shotGroupQueueMode: promptQueueMode } : {}),
      ...(promptQueueId || promptQueueMode ? { _shotGroupQueueConcurrency: queueConcurrency } : {}),
      ...(shotGroupAutoContinue !== undefined ? { _shotGroupAutoContinue: Boolean(shotGroupAutoContinue) } : {}),
      ...(normalizedAllGroups.length ? { _allShotGroups: normalizedAllGroups } : {}),
      _strategicGuide: promptAssets,
      _previousAnchor: previousAnchor || null,
      _directorAnalysis: directorAnalysis || '',
      _scriptText: scriptText || '',
      _aspectRatio: aspectRatio || 'auto',
      _targetDuration: targetDuration || null,
      _promptTemplateId: promptTemplate?.id || promptTemplateId || '',
      _promptTemplateKey: resolvedTemplateKey,
      _promptTemplateTitle: promptTemplate?.title || '',
      _promptOutputMode: resolvedOutputMode,
    },
    onProgress,
  });
}
