import React from 'react';

// app shell
import { useTweaks } from '../features/tweaks/useTweaks.js';
import {
  TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor,
} from '../features/tweaks/TweaksPanel.jsx';
import { EFFECTIVE_DEFAULTS } from './editmode.js';
import { EMBED_MODE, EMBED_LABEL } from './embed.js';
import { shouldUseSelectedGenerationTarget } from './generationPlacement.js';
import { createSubtitleRemovalResultGraph } from './subtitleRemovalCanvas.js';

// canvas
import { Canvas } from '../features/canvas/Canvas.jsx';
import { canvasStyles } from '../features/canvas/styles.js';
import { getGroupRunnableMediaMembers } from '../features/canvas/groupFrame.js';

// generator
import { Generator } from '../features/generator/Generator.jsx';
import { genStyles } from '../features/generator/styles.js';

// modals
import { ModalRoot } from '../features/modals/ModalRoot.jsx';
import { CamCtrlPanel } from '../features/modals/image-edit/CamCtrlPanel.jsx';
import { DesktopAnnouncementModal } from '../features/modals/shared/DesktopAnnouncementModal.jsx';
import { modalStyles } from '../features/modals/shared/styles.js';

// panels
import { MiniTopBar } from '../features/panels/LeftPanel.jsx';
import { LeftRailMini, RailPopover } from '../features/panels/Rail.jsx';
import { ZoomCtl, ShortcutsModal, ContextMenu } from '../features/panels/RightPanel.jsx';
import { panelStyles } from '../features/panels/styles.js';

// node styles
import { nodeStyles } from '../features/nodes/styles.js';
import { NodeRenameDialog } from '../features/nodes/NodeRenameDialog.jsx';

// local-files panel
import { LocalFilesPanel } from '../features/local-files/LocalFilesPanel.jsx';
import { bootstrapLocalFiles } from '../features/local-files/localFilesStore.js';
import { UpscalePanel } from '../features/upscale/UpscalePanel.jsx';

// stores
import { canvasActions, canvasStore, useEdges, useProject } from '../shared/store/canvasStore.js';
import { canvasUndoActions, shouldUseNativeUndoTarget } from '../shared/store/canvasUndoStore.js';
import { libraryActions, useAssets } from '../shared/store/libraryStore.js';
import { uiActions, useSelection } from '../shared/store/uiStore.js';
import { useProjectList, useCurrentProjectId } from '../shared/store/projectListStore.js';

// utils
import { inferNodeTypeFromFile, isNodeEmptyForKind } from '../features/nodes/nodeUtils.js';
import {
  buildAssetGenOutputReferences,
  syncAssetGenOutputToDownstreamReferences,
} from '../features/nodes/assetGenOutputSync.js';
import { readFileAsDataUrl, safeFileName, triggerDownload } from '../shared/utils/file.js';
import { getNodeAssetPayload, makeAssetRecord } from '../shared/utils/asset.js';
import { AssetStore, GLOBAL_ASSET_PROJECT_ID } from '../shared/platform/assetStore.js';
import { SeedancePortraitStore } from '../shared/platform/seedancePortraitStore.js';
import { withAssetScope, withProjectAssetScope, withLibraryFlag } from '../shared/utils/assetScopes.js';
import { importLocalFileAsAsset } from '../shared/utils/uploadHelpers.js';
import { JobStore } from '../shared/platform/jobStore.js';
import {
  runScriptModeStoryboard,
  runShotGroupPromptInference,
} from '../features/storyboard/storyboardOrchestrator.js';
import { seedStoryboardPrompts } from '../features/storyboard/promptSeed.js';
import { jsonRobustParse } from '../features/storyboard/jsonRobustParse.js';
import { StoryboardWorkbench } from '../features/storyboard/workbench/StoryboardWorkbench.jsx';
import { shouldReplaceWorkbenchTask } from '../features/storyboard/workbench/components/TaskProgressPanel.jsx';
import { workbenchStyles } from '../features/storyboard/workbench/styles.js';
import { projectAssetsActions, loadProjectAssets, saveProjectAssets } from '../shared/store/projectAssetsStore.js';
import { storyboardPackageActions } from '../shared/store/storyboardPackageStore.js';
import { getNodeStoryboardPackage } from '../features/storyboard/package/storyboardPackage.js';
import { PromptStore } from '../shared/platform/promptStore.js';
import { ProjectStore } from '../shared/platform/projectStore.js';
import { getBackendBaseUrl, makeAssetUrl } from '../shared/platform/backendClient.js';
import { buildGenerationPayload, capabilityForGeneration } from '../shared/platform/generationPayload.js';
import { ProviderStore } from '../shared/platform/providerStore.js';
import { modelLabel, selectBackendModel } from '../shared/platform/modelSelection.js';
import {
  applyGenerationParameterDefaults,
  captureGenerationParameterDefaults,
} from '../features/generator/nodeParameterDefaults.js';
import {
  bootstrapPersistence,
  createAndSwitchProject,
  deleteProject,
  flushCanvasNow,
  startPersistenceSubscriptions,
  switchProject,
} from '../shared/store/persistence.js';
import { buildProjectArchive, importProjectArchive, readProjectArchiveFile } from '../shared/store/projectArchive.js';
import {
  buildMediaPromptPolishPatch,
  buildMediaPromptPolishPrompt,
  isMediaPromptPolishNode,
  mediaPromptPolishSourceText,
} from '../shared/utils/mediaPromptPolish.js';
import { buildTextNodeToolPrompt } from '../shared/utils/textNodeTools.js';
import { buildGeneratedMediaAspectPatch } from '../shared/utils/mediaAspectRatio.js';
import { createCanvasNodeFromHistoryItem } from '../shared/utils/historyCanvasNode.js';
import { historyKindOf, historyMediaSrc } from '../shared/utils/history.js';
import {
  isStoryboardAnalysisJobTag,
  resolveStoryboardAnalysisJobPackageUpdate,
} from '../features/storyboard/reference/referenceJobResults.js';
import {
  resolveScriptToShotGroupsJobUpdate,
} from '../features/storyboard/shotGroupJobResults.js';
import {
  SHOTGROUP_PROMPT_INFERENCE_TAG,
  SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE,
  applyShotGroupPromptInferenceBatchToPackage,
  applyShotGroupPromptInferenceFailureToPackage,
  applyShotGroupPromptInferenceStatusToPackage,
  normalizeShotGroupPromptInferenceBatchOutput,
} from '../features/storyboard/promptInference.js';
import {
  applyPromptInferenceQueueCancelToGroups,
  applyPromptInferenceQueueStopToGroups,
  canContinuePromptInferenceQueue,
  nextPromptInferenceQueueIndex,
  promptInferenceQueueBatchCanceled,
} from '../features/storyboard/promptInferenceQueue.js';
import {
  applyCanvasDeploymentToGenerationPlan,
  applyStoryboardMediaJobToPackage,
  buildStoryboardCanvasDeployment,
  mergeCanvasDeploymentIntoGraph,
  resolveShotGroupMediaPrompt,
  resolveStoryboardDeploymentListOrigin,
  resolveStoryboardDeploymentOrigin,
  summarizeShotGroupsForDeployment,
  syncStoryboardMediaPromptsIntoDeployment,
} from '../features/storyboard/deployment/canvasDeploymentDraft.js';

// data

// product shell pages + styles
import { ProductSidebar } from '../features/shell/ProductSidebar.jsx';
import { ProjectHomePage } from '../features/shell/ProjectHomePage.jsx';
import { AssetLibraryPage } from '../features/shell/AssetLibraryPage.jsx';
import { ModelConfigPage } from '../features/shell/ModelConfigPage.jsx';
import { ProjectSettingsPage } from '../features/shell/ProjectSettingsPage.jsx';
import { UserCenterPage } from '../features/shell/UserCenterPage.jsx';
import { UserGuidePage } from '../features/shell/UserGuidePage.jsx';
import { AnnouncementCenterPage } from '../features/shell/AnnouncementCenterPage.jsx';
import { LauncherGate } from '../features/shell/LauncherGate.jsx';
import { shellStyles } from '../features/shell/styles.js';
import { SoftwareDeclarationModal } from '../features/shell/SoftwareDeclarationModal.jsx';
import { acceptSoftwareDeclaration, hasAcceptedSoftwareDeclaration } from '../features/shell/softwareDeclarationConsent.js';
import { forgetRememberedPassword } from '../features/shell/authRememberLogin.js';
import { OnboardingTour } from '../features/onboarding/OnboardingTour.jsx';
import { onboardingStyles } from '../features/onboarding/styles.js';
import {
  hasCompletedOnboarding,
  markOnboardingCompleted,
  shouldAutoOpenOnboarding,
} from '../features/onboarding/onboardingStorage.js';
import { DesignSpacePage } from '../features/design-space/DesignSpacePage.jsx';
import { designSpaceStyles } from '../features/design-space/styles.js';
import { parseDesignSpaceP0Response } from '../features/design-space/designSpaceParser.js';
import { buildDesignSpaceExtractionPrompt } from '../features/design-space/designSpacePrompts.js';
import {
  DESIGN_SPACE_JOB_POLL_INTERVAL_MS,
  DESIGN_SPACE_PARSE_JOB_POLL_ATTEMPTS,
  extractCompletedDesignSpaceJobText,
} from '../features/design-space/designSpaceJobResult.js';
import { appendDesignVersion, updateDesignCard } from '../features/design-space/designSpacePackage.js';
import {
  applyDesignCardJobToPackage,
  designSpaceCardJobHistoryPatch,
  designSpaceCardJobMeta,
} from '../features/design-space/designSpaceCardJobResults.js';
import {
  buildDesignImagePayload,
  designAssetMeta,
  designGenerationQueueOptionsForModel,
  runDesignGenerationQueue,
} from '../features/design-space/designSpaceGeneration.js';
import { createDesignImageNode } from '../features/design-space/designSpaceCanvas.js';
import { fallbackDesignPromptTemplates, loadDesignPromptTemplates } from '../features/design-space/designPromptTemplates.js';
import {
  designModelOptionId,
  designParseModelCapability,
  normalizeDesignParseModels,
  resolveDesignModel,
} from '../features/design-space/designSpaceModels.js';
import { designSpaceActions, designSpaceStore } from '../features/design-space/designSpaceStore.js';
import { accountActions } from '../shared/store/accountStore.js';
import {
  desktopAnnouncementActions,
  startDesktopAnnouncementSync,
  useAnnouncementHistory,
  useAnnouncementQueue,
  useAnnouncementSyncError,
} from '../shared/store/desktopAnnouncementStore.js';
import {
  FALLBACK_PANORAMA_PROMPT,
  PANORAMA_ENVIRONMENT_PREFIX,
  createPanoramaViewerDefaults,
  createVR720GenDefaults,
  getPanoramaStyle,
} from '../features/panorama/panoramaConfig.js';
import { createDirectorStageDefaultSettings } from '../features/director-stage/types';
import {
  PROMPT_RUNNER_TEMPLATE_IDS,
  ensurePromptRunnerAssetImageGraph,
  ensurePromptRunnerPreviewTextGraph,
  parsePromptRunnerOutput,
  syncPromptRunnerOutputToDownstreamNodes,
} from '../features/nodes/promptRunnerUtils.js';

function inferNodeTypeFromAsset(asset, fallback) {
  const kind = String(asset?.kind || '').toLowerCase();
  if (kind === 'image' || kind === 'video' || kind === 'audio') return kind;
  const mime = String(asset?.mime || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return fallback || 'image';
}

function modelFromStoryboardJobInput(input = {}) {
  const id = input.modelId || input.providerModelId || input.modelName || input.model;
  if (!id) return null;
  return {
    id,
    modelName: input.modelName || input.model || id,
    displayName: input.model || input.modelName || id,
    providerId: input.provider || input.providerId || '',
    capability: input.capability || input.type || 'text.generate',
    enabled: true,
  };
}

function storyboardRequestModelForKind(request = {}, kind = 'image') {
  const model = kind === 'video' ? request.videoModel : request.imageModel;
  if (model?.id) {
    return {
      ...model,
      displayName: model.displayName || model.model || model.modelName || model.id,
      modelName: model.modelName || model.id,
      providerId: model.providerId || model.provider || '',
      capability: model.capability || (kind === 'video' ? 'video.generate' : 'image.generate'),
      enabled: model.enabled !== false,
    };
  }
  return null;
}

function storyboardRequestModelHintForKind(request = {}, targetNode = {}, kind = 'image') {
  if (kind === 'video') {
    return {
      modelId: request.videoModelId || request.videoProviderModelId || request.modelId || targetNode.modelId,
      providerModelId: request.videoModelId || request.videoProviderModelId || request.providerModelId || targetNode.providerModelId,
      model: request.videoModelLabel || request.videoModelName || request.model || targetNode.model,
    };
  }
  return {
    modelId: request.imageModelId || request.imageProviderModelId || request.modelId || targetNode.modelId,
    providerModelId: request.imageModelId || request.imageProviderModelId || request.providerModelId || targetNode.providerModelId,
    model: request.imageModelLabel || request.imageModelName || request.model || targetNode.model,
  };
}

function storyboardMediaNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function makeStoryboardDeploymentInstanceId() {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function storyboardNodeShotGroups(nodeId) {
  const node = canvasStore.getState().nodesById.get(nodeId);
  const packageGroups = node?.storyboardPackage?.shotGroups || node?.state?.storyboardPackage?.shotGroups;
  if (Array.isArray(packageGroups) && packageGroups.length) return packageGroups;
  return Array.isArray(node?.shotGroups) ? node.shotGroups : [];
}

function deferGenerationJobSubmission(callback) {
  if (typeof callback !== 'function') return;
  if (typeof window === 'undefined') {
    setTimeout(callback, 0);
    return;
  }
  const scheduleFrame = typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (handler) => window.setTimeout(handler, 16);
  scheduleFrame(() => {
    window.setTimeout(callback, 0);
  });
}

function useWindowChromeAvailable() {
  return React.useMemo(() => Boolean(typeof window !== 'undefined' && window.libai?.window), []);
}

function announcementDisplayKey(announcement) {
  if (!announcement) return '';
  return `${announcement.id || ''}\u0000${announcement.contentHash || announcement.content_hash || ''}`;
}

function AppWindowChrome() {
  const controls = typeof window !== 'undefined' ? window.libai?.window : null;
  const [windowState, setWindowState] = React.useState({ maximized: false, focused: true });

  React.useEffect(() => {
    if (!controls?.onStateChange) return undefined;
    return controls.onStateChange((nextState) => {
      if (!nextState) return;
      setWindowState((current) => ({ ...current, ...nextState }));
    });
  }, [controls]);

  if (!controls) return null;

  return (
    <div className={`app-window-chrome${windowState.focused === false ? ' is-blurred' : ''}`} data-maximized={windowState.maximized ? 'true' : 'false'}>
      <div className="window-chrome-brand" aria-hidden="true">
        <span className="window-chrome-mark">漫</span>
        <strong>漫创AI</strong>
        <em>创作画布</em>
      </div>
      <div className="window-chrome-drag" aria-hidden="true" />
      <div className="window-chrome-controls">
        <button type="button" className="window-control-btn minimize" aria-label="最小化" title="最小化" onClick={() => controls.minimize?.()}>
          <span />
        </button>
        <button type="button" className="window-control-btn maximize" aria-label={windowState.maximized ? '还原' : '最大化'} title={windowState.maximized ? '还原' : '最大化'} onClick={() => controls.toggleMaximize?.()}>
          <span className={windowState.maximized ? 'restore' : ''} />
        </button>
        <button type="button" className="window-control-btn close" aria-label="关闭" title="关闭" onClick={() => controls.close?.()}>
          <span />
        </button>
      </div>
    </div>
  );
}

function jobErrorMessage(job, fallback = '生成失败：后端未返回错误详情') {
  const candidates = [
    job?.error,
    job?.output?.error,
    job?.output?.message,
    job?.output?.detail,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value !== 'string') return JSON.stringify(value);
  }
  return fallback;
}

function makeNodeId(prefix) {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

const BACKGROUND_PANEL_COLOR_OPTIONS = [
  '#D7ECFF',
  '#DFF7E8',
  '#FFF3BF',
  '#FFE0E9',
  '#E8E1FF',
  '#D7F7F4',
];

function isBackgroundPanelNode(node) {
  return node?.type === 'background-panel';
}

function isCanvasGroupableNode(node) {
  return node && node.type !== 'group' && !isBackgroundPanelNode(node);
}

function isStoryboardCollectorNode(node) {
  return node?.type === 'storyboard-collector-detail' || node?.type === 'storyboard.collector';
}

function nodeImageReference(node) {
  if (!node) return '';
  if (node.type === 'image') return node.src || node.url || node.assetUrl || node.imageUrl || node.settings?.imageUrl || node.assetPath || '';
  if (node.type === 'vr720-gen') return node.settings?.imageUrl || node.imageUrl || '';
  if (node.type === 'panorama-viewer') return node.settings?.panoramaImageUrl || '';
  return '';
}

function portraitSourceTitle(node, asset = null) {
  const title = String(node?.title || asset?.title || asset?.filename || '').trim();
  return title.replace(/\.[^./\\]+$/, '') || 'Seedence 角色图';
}

function portraitSourceFromImageNode(node, asset = null) {
  const title = portraitSourceTitle(node, asset);
  return {
    src: nodeImageReference(node),
    url: node?.url || asset?.url || '',
    assetUrl: node?.assetUrl || asset?.assetUrl || asset?.url || '',
    imageUrl: node?.imageUrl || node?.settings?.imageUrl || asset?.imageUrl || '',
    previewUrl: node?.previewUrl || node?.thumbnailUrl || asset?.previewUrl || '',
    assetPath: node?.assetPath || node?.localPath || node?.path || asset?.assetPath || asset?.path || '',
    localPath: node?.localPath || asset?.localPath || '',
    path: node?.path || asset?.path || '',
    assetId: node?.assetId || asset?.assetId || asset?.id || '',
    filename: asset?.filename || '',
    title,
    name: title,
  };
}

function nodeVideoReference(node) {
  if (!node) return '';
  return node.videoSrc || node.videoUrl || node.assetUrl || node.assetPath || node.settings?.videoUrl || node.settings?.video_url || '';
}

function nodeAudioReference(node) {
  if (!node) return '';
  return node.audioSrc || node.audioUrl || node.assetUrl || node.assetPath || node.settings?.audioUrl || node.settings?.audio_url || '';
}

function nodePosterReference(node) {
  if (!node) return '';
  return node.poster || node.thumbnailUrl || node.thumb || node.settings?.poster || node.settings?.thumbnailUrl || '';
}

function isStoryboardCollectableNode(node) {
  if (!node) return false;
  if (node.type === 'image') return Boolean(nodeImageReference(node));
  if (node.type === 'video') return Boolean(nodeVideoReference(node) || nodePosterReference(node));
  if (node.type === 'audio') return Boolean(nodeAudioReference(node));
  return false;
}

function storyboardCollectorItems(node) {
  return (Array.isArray(node?.items) ? node.items : Array.isArray(node?.settings?.items) ? node.settings.items : [])
    .filter((item) => item && item.id)
    .map((item, index) => ({ ...item, order: Number.isFinite(Number(item.order)) ? Number(item.order) : index }))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
}

function createStoryboardCollectorItemFromNode(node, order = 0) {
  if (!isStoryboardCollectableNode(node)) return null;
  const videoUrl = node.type === 'video' ? nodeVideoReference(node) : '';
  const audioUrl = node.type === 'audio' ? nodeAudioReference(node) : '';
  const poster = nodePosterReference(node);
  const imageUrl = node.type === 'image' ? nodeImageReference(node) : poster;
  const mediaKind = audioUrl ? 'audio' : videoUrl ? 'video' : 'image';
  const url = audioUrl || videoUrl || imageUrl;
  if (!url) return null;
  return {
    id: `storyItem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    sourceNodeId: node.id,
    sourceType: node.type,
    kind: mediaKind,
    mediaKind,
    title: node.title || (mediaKind === 'video' ? '视频素材' : mediaKind === 'audio' ? '音频素材' : '图片素材'),
    url,
    src: url,
    poster,
    previewUrl: mediaKind === 'video' ? (poster || '') : mediaKind === 'audio' ? (poster || '') : url,
    duration: node.duration || node.settings?.duration || '',
    prompt: node.prompt || node.settings?.prompt || '',
    model: node.model || node.settings?.model || '',
    order,
    addedAt: new Date().toISOString(),
    originalNode: {
      type: node.type,
      title: node.title,
      w: node.w,
      h: node.h,
      src: node.src,
      imageUrl: node.imageUrl,
      videoSrc: node.videoSrc,
      videoUrl: node.videoUrl,
      poster: node.poster,
      assetUrl: node.assetUrl,
      assetPath: node.assetPath,
      duration: node.duration,
      prompt: node.prompt,
      model: node.model,
      settings: node.settings,
    },
  };
}

function createNodeFromStoryboardItem(item, collector, index = 0, at = null) {
  const original = item?.originalNode || {};
  const rawKind = String(item?.mediaKind || item?.kind || '').toLowerCase();
  const mediaKind = rawKind === 'audio' ? 'audio' : rawKind === 'video' ? 'video' : 'image';
  const type = ['video', 'image', 'audio'].includes(original.type) ? original.type : mediaKind;
  const id = makeNodeId(type === 'video' ? 'v' : type === 'audio' ? 'aud' : 'img');
  const dropX = Number(at?.x);
  const dropY = Number(at?.y);
  const x = Number.isFinite(dropX) ? Math.round(dropX) : (collector?.x || 0) + (collector?.w || 420) + 72;
  const y = Number.isFinite(dropY) ? Math.round(dropY) : (collector?.y || 0) + Math.min(index, 8) * 42;
  if (type === 'video') {
    return {
      ...original,
      id,
      type: 'video',
      x,
      y,
      w: Number(original.w) || 620,
      h: Number(original.h) || 350,
      title: item.title || original.title || '视频素材',
      videoSrc: item.url || original.videoSrc || original.videoUrl || '',
      poster: item.poster || original.poster || '',
      duration: item.duration || original.duration || '00:00',
      model: item.model || original.model,
    };
  }
  if (type === 'audio') {
    return {
      ...original,
      id,
      type: 'audio',
      x,
      y,
      w: Number(original.w) || 360,
      h: Number(original.h) || 150,
      title: item.title || original.title || '音频素材',
      audioSrc: item.url || item.src || original.audioSrc || '',
      duration: item.duration || original.duration || '00:00',
      model: item.model || original.model,
    };
  }
  return {
    ...original,
    id,
    type: 'image',
    x,
    y,
    w: Number(original.w) || 392,
    h: Number(original.h) || 260,
    title: item.title || original.title || '图片素材',
    src: item.url || item.src || original.src || original.imageUrl || '',
    model: item.model || original.model,
  };
}

function nearestStoryboardCollectorForNodes(collectors, mediaNodes) {
  if (!collectors.length || !mediaNodes.length) return null;
  const ax = mediaNodes.reduce((sum, node) => sum + (node.x || 0) + (node.w || 0) / 2, 0) / mediaNodes.length;
  const ay = mediaNodes.reduce((sum, node) => sum + (node.y || 0) + (node.h || 0) / 2, 0) / mediaNodes.length;
  return [...collectors].sort((a, b) => {
    const ad = Math.hypot(((a.x || 0) + (a.w || 0) / 2) - ax, ((a.y || 0) + (a.h || 0) / 2) - ay);
    const bd = Math.hypot(((b.x || 0) + (b.w || 0) / 2) - ax, ((b.y || 0) + (b.h || 0) / 2) - ay);
    return ad - bd;
  })[0];
}

function uniqueNonEmptyStrings(values) {
  const seen = new Set();
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

function isImageNodeForToolList(node) {
  return node?.type === 'image' && Boolean(node.src);
}

function imageNodeToolListEqual(a = [], b = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    const prev = a[index];
    const next = b[index];
    if (
      prev?.id !== next?.id
      || prev?.src !== next?.src
      || prev?.title !== next?.title
      || prev?.assetId !== next?.assetId
      || prev?.assetPath !== next?.assetPath
    ) {
      return false;
    }
  }
  return true;
}

function useCanvasImageNodesForTools() {
  return canvasStore.useSelector(
    (state) => (state.nodes || []).filter(isImageNodeForToolList),
    imageNodeToolListEqual,
  );
}

function useSelectedImageNodesForTools(selection = []) {
  const selector = React.useMemo(() => {
    const selected = new Set(selection);
    return (state) => (state.nodes || []).filter((node) => (
      selected.has(node.id) && isImageNodeForToolList(node)
    ));
  }, [selection]);
  return canvasStore.useSelector(selector, imageNodeToolListEqual);
}

/* Coerce raw LLM JSON array items into the canonical shot shape. */
function normalizeShots(rawArray, fallbackCount = 8) {
  if (!Array.isArray(rawArray) || rawArray.length === 0) {
    return [{ n: 1, shot: '中景', desc: '后端未返回有效分镜', dur: '3s' }];
  }
  return rawArray.slice(0, Math.max(1, Number(fallbackCount) || 8) * 2).map((item, index) => ({
    n: item.n || item.index || index + 1,
    shot: item.shot || item.camera || item.type || '中景',
    desc: item.desc || item.description || item.prompt || String(item),
    dur: item.dur || item.duration || '3s',
  }));
}

function ProjectBootstrapScreen() {
  return (
    <section className="project-bootstrap-screen" aria-busy="true" aria-label="项目加载中">
      <div className="project-bootstrap-card">
        <span>PROJECT GALLERY</span>
        <h1>项目加载中</h1>
        <p>正在读取创作空间。</p>
        <div className="project-bootstrap-loader" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
    </section>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {
  // === Tweaks ===
  const [tweaks, setTweaks] = useTweaks(EFFECTIVE_DEFAULTS);

  // === Local UI state ===
  const [railPop, setRailPop] = React.useState(null);         // which rail icon's popover is open
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  const [ctx, setCtx] = React.useState(null);                 // right-click context menu payload
  const [showCamCtrl, setShowCamCtrl] = React.useState(false);
  const [workbenchNodeId, setWorkbenchNodeId] = React.useState(null);
  const [workbenchEntryOptions, setWorkbenchEntryOptions] = React.useState(null);
  const [workbenchTask, setWorkbenchTask] = React.useState(null);
  const setWorkbenchTaskForNode = React.useCallback((nodeId, task) => {
    if (!task) {
      setWorkbenchTask(null);
      return;
    }
    const nextTask = {
      ...task,
      nodeId: task.nodeId || nodeId || null,
    };
    setWorkbenchTask((current) => (shouldReplaceWorkbenchTask(current, nextTask) ? nextTask : current));
  }, []);
  const clearWorkbenchTaskForNode = React.useCallback((nodeId) => {
    setWorkbenchTask((current) => {
      if (!current) return current;
      if (!nodeId || !current.nodeId || current.nodeId === nodeId) return null;
      return current;
    });
  }, []);
  const [pendingGroup, setPendingGroup] = React.useState(null);
  const [groupNameDraft, setGroupNameDraft] = React.useState('');
  const [pendingRenameNode, setPendingRenameNode] = React.useState(null);
  const [pendingBackgroundPanel, setPendingBackgroundPanel] = React.useState(null);
  const [backgroundPanelDraft, setBackgroundPanelDraft] = React.useState({ title: '', color: BACKGROUND_PANEL_COLOR_OPTIONS[0] });
  const [portraitUploadNodeId, setPortraitUploadNodeId] = React.useState('');
  const [portraitImportNotice, setPortraitImportNotice] = React.useState(null);
  const [activeView, setActiveView] = React.useState(() => EMBED_MODE ? 'canvas' : 'projects');
  const [designSpaceVisible, setDesignSpaceVisible] = React.useState(false);
  const [userCenterOpen, setUserCenterOpen] = React.useState(false);
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);
  const [loginDeclarationOpen, setLoginDeclarationOpen] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState('');
  const [exportingProjectId, setExportingProjectId] = React.useState('');
  const [importingProject, setImportingProject] = React.useState(false);
  const exportingProjectRef = React.useRef('');
  const importingProjectRef = React.useRef(false);
  const [viewScale, setViewScale] = React.useState(1);        // display-only, polled via rAF
  const [generatorVisible, setGeneratorVisible] = React.useState(false);  // bottom dock toggle
  const [localFilesVisible, setLocalFilesVisible] = React.useState(false);  // left local-files panel toggle
  const [upscaleVisible, setUpscaleVisible] = React.useState(false);  // left upscale panel toggle
  const [upscaleIncomingImages, setUpscaleIncomingImages] = React.useState([]);
  const [designTextModels, setDesignTextModels] = React.useState([]);
  const [designImageModels, setDesignImageModels] = React.useState([]);
  const [designVideoModels, setDesignVideoModels] = React.useState([]);
  const [designPromptTemplates, setDesignPromptTemplates] = React.useState(fallbackDesignPromptTemplates);
  const [designTemplateStatus, setDesignTemplateStatus] = React.useState({ usingFallback: false, error: '' });
  const [launched, setLaunched] = React.useState(() => EMBED_MODE);
  const [projectBootstrapReady, setProjectBootstrapReady] = React.useState(() => EMBED_MODE);
  const onboardingCheckedRef = React.useRef(false);
  const appBootstrappedRef = React.useRef(false);
  const hasWindowChrome = useWindowChromeAvailable();
  const openCanvasView = React.useCallback(() => {
    setDesignSpaceVisible(false);
    setActiveView('canvas');
  }, []);
  const returnToProjectsView = React.useCallback(() => {
    setDesignSpaceVisible(false);
    setActiveView('projects');
  }, []);

  // === Refs ===
  const canvasRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const uploadRequestRef = React.useRef(null);
  const jobPollersRef = React.useRef(new Map());
  const handledTerminalJobsRef = React.useRef(new Set());
  const promptQueueSubmittedRef = React.useRef(new Set());
  const promptQueueTerminalRef = React.useRef(new Map());
  const stoppedPromptQueuesRef = React.useRef(new Set());
  const canceledPromptQueueGroupsRef = React.useRef(new Map());
  const backendBaseUrlRef = React.useRef(getBackendBaseUrl());
  const upscaleNodeCleanupRef = React.useRef(new Set());
  const portraitImportNoticeTimerRef = React.useRef(null);

  // === Store-derived ===
  const edges = useEdges();
  const selection = useSelection();
  const selectedImageNodes = useSelectedImageNodesForTools(selection);
  const canvasImageNodes = useCanvasImageNodesForTools();
  const project = useProject();
  const assets = useAssets();
  const projectList = useProjectList();
  const currentProjectId = useCurrentProjectId();

  const stopPromptInferenceQueue = React.useCallback((request = {}) => {
    const nodeId = request.nodeId || workbenchNodeId;
    if (!nodeId) return;
    const queueId = request.queueId || request.task?.queue?.queueId || '';
    const activeJobIds = Array.isArray(request.activeJobIds) ? request.activeJobIds : [];
    if (queueId) stoppedPromptQueuesRef.current.add(queueId);
    const projectId = request.projectId || project?.id || currentProjectId || 'local-default';
    storyboardPackageActions.updateNodePackage(nodeId, {
      projectId,
      updater: (pkg) => {
        const previousGroups = Array.isArray(pkg?.shotGroups) ? pkg.shotGroups : [];
        const stoppedGroups = applyPromptInferenceQueueStopToGroups(previousGroups);
        const canceledIds = new Set(stoppedGroups
          .filter((group, index) => {
            const before = String(previousGroups[index]?.promptStatus || '').trim().toLowerCase();
            return group?.promptStatus === 'canceled' && (!before || before === 'pending');
          })
          .map((group) => String(group?.groupId || group?.shotGroupId || group?.id || '').trim())
          .filter(Boolean));
        const generationPlan = pkg?.generationPlan || {};
        const shotTasks = Array.isArray(generationPlan.shotTasks) ? generationPlan.shotTasks : [];
        const nextShotTasks = shotTasks.map((task) => {
          const taskGroupId = String(task?.shotGroupId || task?.shotGroup || task?.groupId || '').trim();
          const status = String(task?.promptStatus || '').trim().toLowerCase();
          if (!canceledIds.has(taskGroupId) || (status && status !== 'pending')) return task;
          return {
            ...task,
            promptStatus: 'canceled',
            promptProgress: 100,
            promptStage: '队列已停止，未提交的分组已取消',
          };
        });
        return {
          shotGroups: stoppedGroups,
          generationPlan: {
            ...generationPlan,
            shotTasks: nextShotTasks,
          },
        };
      },
    });
    setWorkbenchTaskForNode(nodeId, {
      id: SHOTGROUP_PROMPT_INFERENCE_TAG,
      stage: activeJobIds.length ? '队列已停止，等待已提交任务完成…' : '队列已停止',
      progress: activeJobIds.length ? Math.max(1, Math.min(99, Number(request.task?.progress || request.progress) || 1)) : 100,
      queue: {
        ...(request.task?.queue || {}),
        queueId,
        stopped: true,
      },
      stopped: true,
    });
    if (!activeJobIds.length) {
      window.setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
    }
  }, [clearWorkbenchTaskForNode, currentProjectId, project?.id, setWorkbenchTaskForNode, workbenchNodeId]);

  const cancelPromptInferenceRunning = React.useCallback(async (request = {}) => {
    const nodeId = request.nodeId || workbenchNodeId;
    const activeJobIds = Array.isArray(request.activeJobIds) ? request.activeJobIds : [];
    stopPromptInferenceQueue(request);
    if (!nodeId || !activeJobIds.length) return;
    const results = await Promise.allSettled(activeJobIds.map((jobId) => JobStore.cancel(jobId)));
    const failedCount = results.filter((result) => result.status === 'rejected').length;
    setWorkbenchTaskForNode(nodeId, {
      id: SHOTGROUP_PROMPT_INFERENCE_TAG,
      stage: failedCount
        ? `已请求取消运行中任务，${failedCount} 个任务取消失败`
        : '已请求取消运行中任务',
      progress: 100,
      queue: {
        ...(request.task?.queue || {}),
        queueId: request.queueId || request.task?.queue?.queueId || '',
        stopped: true,
      },
      canceled: true,
      stopped: true,
    });
  }, [setWorkbenchTaskForNode, stopPromptInferenceQueue, workbenchNodeId]);

  const cancelPromptInferenceQueueTask = React.useCallback(async (request = {}) => {
    const nodeId = request.nodeId || workbenchNodeId;
    if (!nodeId) return;
    const queueId = request.queueId || request.task?.queue?.queueId || '';
    const taskGroupIds = (Array.isArray(request.groupIds) ? request.groupIds : [request.groupId])
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    const groupIds = (Array.isArray(request.cancelableGroupIds) && request.cancelableGroupIds.length
      ? request.cancelableGroupIds
      : taskGroupIds)
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    if (!groupIds.length) return;
    if (queueId) {
      const canceledSet = canceledPromptQueueGroupsRef.current.get(queueId) || new Set();
      (taskGroupIds.length ? taskGroupIds : groupIds).forEach((groupId) => canceledSet.add(groupId));
      canceledPromptQueueGroupsRef.current.set(queueId, canceledSet);
    }
    const projectId = request.projectId || project?.id || currentProjectId || 'local-default';
    const message = '已取消该任务';
    const queuePatch = {
      ...(request.task?.queue || {}),
      queueId,
      groupId: request.rangeLabel || request.taskLabel || groupIds.join(','),
      kind: 'prompt',
      stopped: true,
    };
    storyboardPackageActions.updateNodePackage(nodeId, {
      projectId,
      updater: (pkg) => {
        const previousGroups = Array.isArray(pkg?.shotGroups) ? pkg.shotGroups : [];
        const canceledGroups = applyPromptInferenceQueueCancelToGroups(previousGroups, {
          groupIds,
          message,
        });
        const canceledIds = new Set(canceledGroups
          .filter((group, index) => {
            const before = String(previousGroups[index]?.promptStatus || '').trim().toLowerCase();
            return group?.promptStatus === 'canceled' && ['pending', 'queued', 'running', ''].includes(before);
          })
          .map((group) => String(group?.groupId || group?.shotGroupId || group?.id || '').trim())
          .filter(Boolean));
        const generationPlan = pkg?.generationPlan || {};
        const shotTasks = Array.isArray(generationPlan.shotTasks) ? generationPlan.shotTasks : [];
        const nextShotTasks = shotTasks.map((task) => {
          const taskGroupId = String(task?.shotGroupId || task?.shotGroup || task?.groupId || '').trim();
          const status = String(task?.promptStatus || '').trim().toLowerCase();
          if (!canceledIds.has(taskGroupId) || !['pending', 'queued', 'running', ''].includes(status)) return task;
          return {
            ...task,
            promptStatus: 'canceled',
            promptProgress: 100,
            promptStage: message,
            promptJobId: '',
          };
        });
        return {
          shotGroups: canceledGroups,
          generationPlan: {
            ...generationPlan,
            shotTasks: nextShotTasks,
          },
        };
      },
    });
    setWorkbenchTaskForNode(nodeId, {
      id: SHOTGROUP_PROMPT_INFERENCE_TAG,
      stage: `${request.taskLabel || '任务'} 已取消`,
      progress: 100,
      queue: queuePatch,
      canceled: true,
      stopped: true,
    });

    const jobIds = [...new Set([
      ...(Array.isArray(request.jobIds) ? request.jobIds : []),
      ...(Array.isArray(request.activeJobIds) ? request.activeJobIds : []),
    ].map((value) => String(value || '').trim()).filter(Boolean))];
    const results = jobIds.length
      ? await Promise.allSettled(jobIds.map((jobId) => JobStore.cancel(jobId)))
      : [];
    const failedCount = results.filter((result) => result.status === 'rejected').length;
    if (failedCount) {
      setWorkbenchTaskForNode(nodeId, {
        id: SHOTGROUP_PROMPT_INFERENCE_TAG,
        stage: `${request.taskLabel || '任务'} 已标记取消，${failedCount} 个运行任务取消请求失败`,
        progress: 100,
        queue: queuePatch,
        canceled: true,
        stopped: true,
      });
      return;
    }
    window.setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
  }, [clearWorkbenchTaskForNode, currentProjectId, project?.id, setWorkbenchTaskForNode, workbenchNodeId]);

  const showPortraitImportNotice = React.useCallback((notice) => {
    if (portraitImportNoticeTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(portraitImportNoticeTimerRef.current);
    }
    setPortraitImportNotice({
      tone: notice?.tone || 'info',
      title: notice?.title || '',
      message: notice?.message || '',
    });
    if (typeof window !== 'undefined') {
      portraitImportNoticeTimerRef.current = window.setTimeout(() => {
        setPortraitImportNotice(null);
        portraitImportNoticeTimerRef.current = null;
      }, notice?.tone === 'error' ? 4200 : 2400);
    }
  }, []);

  React.useEffect(() => () => {
    if (portraitImportNoticeTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(portraitImportNoticeTimerRef.current);
      portraitImportNoticeTimerRef.current = null;
    }
  }, []);

  const announcementHistory = useAnnouncementHistory();
  const announcementQueue = useAnnouncementQueue();
  const announcementSyncError = useAnnouncementSyncError();
  const activeAnnouncement = React.useMemo(
    () => announcementQueue.find((item) => (item?.level || 'normal') !== 'normal') || null,
    [announcementQueue],
  );
  const normalAnnouncement = React.useMemo(
    () => activeAnnouncement ? null : announcementQueue.find((item) => (item?.level || 'normal') === 'normal') || null,
    [activeAnnouncement, announcementQueue],
  );
  const activeAnnouncementKey = announcementDisplayKey(activeAnnouncement);
  const normalAnnouncementKey = announcementDisplayKey(normalAnnouncement);
  const displayedAnnouncementKeysRef = React.useRef(new Set());
  const canvasGraphRef = React.useRef({
    nodes: canvasStore.getState().nodes || [],
    edges: canvasStore.getState().edges || [],
  });
  React.useEffect(() => canvasStore.subscribe(() => {
    const state = canvasStore.getState();
    canvasGraphRef.current = {
      nodes: state.nodes || [],
      edges: state.edges || [],
    };
  }), []);
  React.useEffect(() => {
    const state = canvasStore.getState();
    canvasGraphRef.current = {
      nodes: state.nodes || [],
      edges: state.edges || [],
    };
  }, [edges]);
  const readCanvasNodes = React.useCallback(() => canvasGraphRef.current.nodes || [], []);
  const readCanvasEdges = React.useCallback(() => canvasGraphRef.current.edges || [], []);
  const generationParameterDefaultsRef = React.useRef({});
  const updateNodeWithUndo = React.useCallback((id, patch, meta) => {
    if (!id || patch == null) return;
    const currentNode = canvasStore.getState().nodesById.get(id);
    generationParameterDefaultsRef.current = captureGenerationParameterDefaults(
      generationParameterDefaultsRef.current,
      currentNode,
      patch,
      meta,
    );
    canvasUndoActions.run('update-node', () => {
      canvasActions.updateNode(id, patch);
    });
  }, []);
  const recordJobResultUndo = React.useCallback((fn) => {
    canvasUndoActions.run('job-result', fn);
  }, []);
  React.useEffect(() => {
    if (!EMBED_MODE && !launched) return undefined;
    if (appBootstrappedRef.current) return undefined;
    appBootstrappedRef.current = true;
    let cancelled = false;
    Promise.resolve(bootstrapPersistence())
      .catch((error) => {
        console.warn('Project persistence bootstrap failed', error);
      })
      .finally(() => {
        if (cancelled) return;
        startPersistenceSubscriptions();
        setProjectBootstrapReady(true);
      });
    void bootstrapLocalFiles();
    void seedStoryboardPrompts();
    return () => { cancelled = true; };
  }, [launched]);
  const undoProjectIdRef = React.useRef(project?.id || currentProjectId || '');
  React.useEffect(() => {
    const nextProjectId = project?.id || currentProjectId || '';
    if (
      undoProjectIdRef.current
      && nextProjectId
      && undoProjectIdRef.current !== nextProjectId
    ) {
      canvasUndoActions.clear();
      generationParameterDefaultsRef.current = {};
    }
    undoProjectIdRef.current = nextProjectId;
  }, [currentProjectId, project?.id]);

  /* Phase 2A: load projectAssets from PromptStore on project change. */
  React.useEffect(() => {
    if (!projectBootstrapReady && !EMBED_MODE) return undefined;
    if (!launched && !EMBED_MODE) return undefined;
    const projectId = project?.id;
    if (!projectId) return undefined;
    let cancelled = false;
    loadProjectAssets(projectId, PromptStore).then((data) => {
      if (cancelled) return;
      if (data) {
        projectAssetsActions.setAssets(projectId, data);
      }
    });
    return () => { cancelled = true; };
  }, [launched, project?.id, projectBootstrapReady]);

  const handleLaunch = React.useCallback(() => {
    if (!hasAcceptedSoftwareDeclaration()) {
      setLoginDeclarationOpen(true);
      return;
    }
    setLaunched(true);
  }, []);

  const handleLoginDeclarationConfirm = React.useCallback(() => {
    acceptSoftwareDeclaration();
    setLoginDeclarationOpen(false);
    if (!launched) {
      setLaunched(true);
    }
  }, [launched]);

  const handleSignedOut = React.useCallback(() => {
    forgetRememberedPassword();
    setLoginDeclarationOpen(false);
    accountActions.reset();
  }, []);

  const openUserCenter = React.useCallback(() => {
    setUserCenterOpen(true);
  }, []);

  const closeUserCenter = React.useCallback(() => {
    setUserCenterOpen(false);
  }, []);

  const openOnboardingTour = React.useCallback(() => {
    setUserCenterOpen(false);
    setRailPop(null);
    setDesignSpaceVisible(false);
    setOnboardingOpen(true);
  }, []);

  const closeOnboardingTour = React.useCallback(() => {
    setOnboardingOpen(false);
  }, []);

  const completeOnboardingTour = React.useCallback(() => {
    markOnboardingCompleted();
    setOnboardingOpen(false);
  }, []);

  React.useEffect(() => {
    if (!userCenterOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setUserCenterOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userCenterOpen]);

  // Initial balance fetch + refresh whenever user re-enters main shell
  React.useEffect(() => {
    if (!EMBED_MODE && launched) accountActions.refresh();
  }, [launched]);

  React.useEffect(() => {
    if (EMBED_MODE || !launched) return undefined;

    let cancelled = false;
    let cleanup = null;
    startDesktopAnnouncementSync().then((stop) => {
      if (typeof stop !== 'function') return;
      if (cancelled) {
        stop();
        return;
      }
      cleanup = stop;
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [launched]);

  React.useEffect(() => {
    if (!activeAnnouncement || !activeAnnouncementKey || displayedAnnouncementKeysRef.current.has(activeAnnouncementKey)) return;
    displayedAnnouncementKeysRef.current.add(activeAnnouncementKey);
    desktopAnnouncementActions.markDisplayed({
      id: activeAnnouncement.id,
      contentHash: activeAnnouncement.contentHash ?? activeAnnouncement.content_hash,
    });
  }, [activeAnnouncement, activeAnnouncementKey]);

  React.useEffect(() => {
    if (!normalAnnouncement || !normalAnnouncementKey || displayedAnnouncementKeysRef.current.has(normalAnnouncementKey)) return;
    displayedAnnouncementKeysRef.current.add(normalAnnouncementKey);
    desktopAnnouncementActions.markDisplayed({
      id: normalAnnouncement.id,
      contentHash: normalAnnouncement.contentHash ?? normalAnnouncement.content_hash,
    });
  }, [normalAnnouncement, normalAnnouncementKey]);

  React.useEffect(() => {
    const completed = hasCompletedOnboarding();
    const shouldOpen = shouldAutoOpenOnboarding({
      embedMode: EMBED_MODE,
      authenticated: launched && !loginDeclarationOpen,
      alreadyChecked: onboardingCheckedRef.current,
      completed,
    });
    if (!shouldOpen) return;
    onboardingCheckedRef.current = true;
    setOnboardingOpen(true);
  }, [launched, loginDeclarationOpen]);

  React.useEffect(() => {
    if (EMBED_MODE || !launched) return undefined;
    let alive = true;
    ProjectStore.runtime()
      .then((runtime) => {
        if (alive) backendBaseUrlRef.current = runtime?.backendBaseUrl || getBackendBaseUrl();
      })
      .catch(() => {
        if (alive) backendBaseUrlRef.current = getBackendBaseUrl();
      });
    return () => { alive = false; };
  }, [launched]);

  React.useEffect(() => {
    if (!launched && !EMBED_MODE) return undefined;
    let cancelled = false;
    Promise.all([
      ProviderStore.models({ capability: 'text.generate' }).catch(() => ({ models: [] })),
      ProviderStore.models({ capability: 'text.reason' }).catch(() => ({ models: [] })),
      ProviderStore.models({ capability: 'inference.generate' }).catch(() => ({ models: [] })),
      ProviderStore.models({ capability: 'image.generate' }).catch(() => ({ models: [] })),
      ProviderStore.models({ capability: 'video.generate' }).catch(() => ({ models: [] })),
    ]).then(([textResult, reasonResult, inferenceResult, imageResult, videoResult]) => {
      if (cancelled) return;
      const parserModels = [
        ...(Array.isArray(textResult?.models) ? textResult.models : []),
        ...(Array.isArray(reasonResult?.models) ? reasonResult.models : []),
        ...(Array.isArray(inferenceResult?.models) ? inferenceResult.models : []),
      ];
      setDesignTextModels(normalizeDesignParseModels(parserModels));
      setDesignImageModels((Array.isArray(imageResult?.models) ? imageResult.models : []).filter((model) => model.enabled !== false));
      setDesignVideoModels((Array.isArray(videoResult?.models) ? videoResult.models : []).filter((model) => model.enabled !== false));
    }).catch(() => {
      if (cancelled) return;
      setDesignTextModels([]);
      setDesignImageModels([]);
      setDesignVideoModels([]);
    });
    return () => { cancelled = true; };
  }, [launched]);

  React.useEffect(() => {
    if (!launched && !EMBED_MODE) return undefined;
    let cancelled = false;
    loadDesignPromptTemplates().then((result) => {
      if (cancelled) return;
      setDesignPromptTemplates(result.templates);
      setDesignTemplateStatus({
        usingFallback: result.usingFallback,
        error: result.error,
      });
    });
    return () => { cancelled = true; };
  }, [launched]);

  const applyGenericJobUpdate = React.useCallback((job, options = {}) => {
    if (!job?.nodeId) return;
    const sideEffects = options.sideEffects !== false;
    const assetGenNodeId = job.input?._assetGenNodeId || job.input?.assetGenNodeId || '';
    const currentNodes = readCanvasNodes();
    const currentEdges = readCanvasEdges();
    const targetNode = currentNodes.find((item) => item.id === job.nodeId);
    const isPanoramaJob = job.input?._panorama720 || targetNode?.type === 'vr720-gen';

    if (isPanoramaJob) {
      if (job.status === 'queued' || job.status === 'running') {
        const progress = Math.max(1, Math.min(99, Number(job.progress) || 1));
        canvasActions.updateNode(job.nodeId, (current) => ({
          generating: true,
          progress,
          jobId: job.id,
          jobStage: job.output?.stage,
          error: null,
          tag: '720生成',
          model: job.output?.displayName || job.output?.providerModelName || job.input?.model || current.model,
          settings: {
            ...(current.settings || {}),
            progress,
            error: null,
          },
        }));
        libraryActions.recordJobHistory(job, { status: 'generating', source: 'panorama.generate' });
        return;
      }

      if (job.status === 'failed' || job.status === 'canceled') {
        const errorMessage = job.status === 'canceled' ? '已取消' : jobErrorMessage(job, '720空间场景生成失败');
        canvasActions.updateNode(job.nodeId, (current) => ({
          generating: false,
          progress: 0,
          jobId: job.id,
          jobStage: '',
          error: errorMessage,
          tag: job.status === 'canceled' ? '取消' : '失败',
          settings: {
            ...(current.settings || {}),
            progress: 0,
            error: errorMessage,
          },
        }));
        libraryActions.recordJobHistory(job, {
          status: job.status,
          errorMsg: errorMessage,
          source: 'panorama.generate',
        });
        return;
      }

      if (job.status !== 'completed') return;

      const output = job.output || {};
      const rawUrl = output.url || output.urls?.[0] || output.assetUrl || output.posterUrl;
      const url = rawUrl ? makeAssetUrl({ src: rawUrl }, backendBaseUrlRef.current || undefined) : '';
      const modelName = output.displayName || output.providerModelName || job.input?.model || '';
      const alreadyHandled = handledTerminalJobsRef.current.has(job.id);
      if (!alreadyHandled) handledTerminalJobsRef.current.add(job.id);
      const allowSideEffects = sideEffects && !alreadyHandled;

      if (!url) {
        canvasActions.updateNode(job.nodeId, (current) => ({
          generating: false,
          progress: 0,
          error: '720空间场景生成完成，但没有返回图片地址',
          tag: '失败',
          settings: {
            ...(current.settings || {}),
            progress: 0,
            error: '720空间场景生成完成，但没有返回图片地址',
          },
        }));
        return;
      }

      if (allowSideEffects && output.provider) accountActions.refresh();
      let viewerId = job.input?.viewerNodeId || targetNode?.settings?.connectedViewerNodeId || '';
      if (!viewerId) {
        const viewerEdge = currentEdges.find((edge) => {
          if (edge?.from !== job.nodeId) return false;
          return currentNodes.find((item) => item.id === edge.to)?.type === 'panorama-viewer';
        });
        viewerId = viewerEdge?.to || '';
      }

      let finalViewerId = viewerId;
      let createdViewer = null;
      recordJobResultUndo(() => {
        canvasActions.setNodes((items) => {
          const control = items.find((item) => item.id === job.nodeId) || targetNode;
          const existingViewer = finalViewerId
            ? items.find((item) => item.id === finalViewerId && item.type === 'panorama-viewer')
            : null;
          if (!existingViewer) {
            finalViewerId = makeNodeId('panoView');
            createdViewer = {
              id: finalViewerId,
              type: 'panorama-viewer',
              x: (control?.x || 0) + (control?.w || 360) + 78,
              y: control?.y || 0,
              w: 520,
              h: 360,
              title: '720全景预览',
              tag: '720预览',
              settings: createPanoramaViewerDefaults({
                panoramaImageUrl: url,
                displayName: job.input?.basePrompt || job.input?.userPrompt || FALLBACK_PANORAMA_PROMPT,
              }),
            };
          }

          const updated = items.map((item) => {
            if (item.id === job.nodeId) {
              return {
                ...item,
                generating: false,
                progress: 0,
                jobId: job.id,
                jobStage: '',
                error: null,
                tag: '720生成',
                model: modelName || item.model,
                settings: {
                  ...(item.settings || {}),
                  imageUrl: url,
                  imageUrls: output.urls || [url],
                  connectedViewerNodeId: finalViewerId,
                  progress: 100,
                  error: null,
                  model: modelName || item.settings?.model,
                  modelId: job.input?.modelId || job.input?.providerModelId || item.settings?.modelId,
                },
              };
            }
            if (item.id === finalViewerId) {
              return {
                ...item,
                tag: '720预览',
                settings: {
                  ...(item.settings || {}),
                  panoramaImageUrl: url,
                  displayName: job.input?.basePrompt || job.input?.userPrompt || item.settings?.displayName || FALLBACK_PANORAMA_PROMPT,
                  loadError: null,
                  isLoading: false,
                },
              };
            }
            return item;
          });
          return createdViewer ? [...updated, createdViewer] : updated;
        });
        canvasActions.setEdges((items) => {
          if (!finalViewerId || items.some((edge) => edge.from === job.nodeId && edge.to === finalViewerId)) return items;
          return [...items, { id: `e720_${job.nodeId}_${finalViewerId}`, from: job.nodeId, to: finalViewerId }];
        });
      });

      libraryActions.recordJobHistory(job, {
        status: 'completed',
        kind: 'image',
        src: url,
        assetId: output.assetId,
        assetPath: output.assetPath,
        model: modelName,
        source: output.asset?.source || output.provider || 'panorama.generate',
      });

      if (allowSideEffects) {
        libraryActions.recordAssets([withProjectAssetScope(makeAssetRecord({
          kind: 'image',
          src: url,
          title: '720空间场景结果',
          nodeId: job.nodeId,
          source: output.asset?.source || output.provider || 'panorama.generate',
          prompt: job.input?.userPrompt || job.input?.basePrompt || job.input?.prompt,
          jobId: job.id,
          assetId: output.assetId,
          assetPath: output.assetPath,
          action: 'asset.panorama-output',
          status: 'completed',
          progress: 100,
          model: modelName,
          modelName: output.providerModelName,
          provider: output.provider,
        }), job.projectId || job.project_id || project?.id)]);
      }
      return;
    }

    if (job.status === 'queued' || job.status === 'running') {
      canvasActions.updateNode(job.nodeId, {
        generating: true,
        progress: Math.max(1, Math.min(99, Number(job.progress) || 1)),
        jobId: job.id,
        jobStage: job.output?.stage,
        error: null,
        tag: '生成',
        model: job.output?.displayName || job.output?.providerModelName || job.input?.model,
      });
      if (assetGenNodeId && assetGenNodeId !== job.nodeId) {
        canvasActions.updateNode(assetGenNodeId, {
          generating: true,
          progress: Math.max(1, Math.min(99, Number(job.progress) || 1)),
          jobId: job.id,
          jobStage: job.output?.stage,
          error: null,
          tag: '生成',
        });
      }
      libraryActions.recordJobHistory(job, { status: 'generating', source: 'job.output' });
      return;
    }

    if (job.status === 'failed' || job.status === 'canceled') {
      const errorMessage = job.status === 'canceled' ? '已取消' : jobErrorMessage(job);
      canvasActions.updateNode(job.nodeId, {
        generating: false,
        progress: 0,
        jobId: job.id,
        error: errorMessage,
        tag: job.status === 'canceled' ? '取消' : '失败',
      });
      if (assetGenNodeId && assetGenNodeId !== job.nodeId) {
        canvasActions.updateNode(assetGenNodeId, {
          generating: false,
          progress: 0,
          jobId: job.id,
          error: errorMessage,
          tag: job.status === 'canceled' ? '取消' : '失败',
        });
      }
      if (sideEffects && job.status === 'failed') {
        const failedProvider = job.output?.provider || job.type;
        if (failedProvider) accountActions.refresh();
      }
      libraryActions.recordJobHistory(job, {
        status: job.status,
        errorMsg: errorMessage,
        source: 'job.output',
      });
      return;
    }

    if (job.status !== 'completed') return;

    const output = job.output || {};
    const alreadyHandled = handledTerminalJobsRef.current.has(job.id);
    if (!alreadyHandled) handledTerminalJobsRef.current.add(job.id);
    const allowSideEffects = sideEffects && !alreadyHandled;

    if (allowSideEffects && output.provider) accountActions.refresh();
    const jobType = job.type || '';
    const kind = output.assetKind || (
      jobType.includes('video') ? 'video'
      : jobType.includes('audio') ? 'audio'
      : jobType.includes('text') || jobType.includes('reason') || jobType.includes('inference') ? 'text'
      : 'image'
    );
    const rawUrl = output.url || output.urls?.[0] || output.posterUrl;
    const url = rawUrl ? makeAssetUrl({ src: rawUrl }, backendBaseUrlRef.current || undefined) : '';
    const modelLabel = output.displayName || output.providerModelName || job.input?.model || '';
    const displayPrompt = typeof job.input?._assetUserPrompt === 'string'
      ? job.input._assetUserPrompt
      : (typeof job.input?.assetUserPrompt === 'string' ? job.input.assetUserPrompt : job.input?.prompt);
    if (job.input?._promptRunner) {
      const textOutput = String(output.text || output.content || output.message || '').trim();
      const parsedOutput = parsePromptRunnerOutput(textOutput, {
        templateId: job.input?._templateId || job.input?.templateId,
      });
      const promptRunnerEdges = canvasStore.getState().edges || currentEdges;
      const now = new Date().toISOString();
      if (!parsedOutput.ok) {
        recordJobResultUndo(() => {
          canvasActions.setNodes((items) => items.map((item) => {
            if (item.id !== job.nodeId) return item;
            return {
              ...item,
              generating: false,
              progress: 0,
              jobId: job.id,
              error: parsedOutput.error,
              jobStage: '',
              body: '',
              output: '',
              parsedOutput: '',
              videoPrompt: '',
              rawOutput: textOutput,
              prompt: displayPrompt,
              lastRunAt: now,
              lastElapsedMs: output.elapsedMs || output.elapsed_ms || item.lastElapsedMs || 0,
              model: modelLabel || item.model,
              tag: '解析失败',
            };
          }));
        });
        libraryActions.recordJobHistory(job, {
          status: 'failed',
          kind: 'text',
          prompt: displayPrompt,
          model: modelLabel,
          errorMsg: parsedOutput.error,
          source: 'prompt.runner.parser',
        });
        return;
      }
      const isAssetExtraction = parsedOutput.mode === 'asset-extraction';
      const promptRunnerNodes = canvasStore.getState().nodes || currentNodes;
      const completedNodes = promptRunnerNodes.map((item) => {
        if (item.id !== job.nodeId) return item;
        const body = isAssetExtraction ? `已解析资产 ${parsedOutput.assets?.length || 0} 个` : parsedOutput.value;
        const outputText = isAssetExtraction ? body : parsedOutput.value;
        return {
          ...item,
          generating: false,
          progress: 0,
          jobId: job.id,
          error: null,
          jobStage: '',
          body,
          output: outputText,
          parsedOutput: isAssetExtraction ? '' : parsedOutput.value,
          videoPrompt: parsedOutput.mode === 'video-prompt' ? parsedOutput.value : '',
          parsedAssets: isAssetExtraction ? (parsedOutput.assets || []) : undefined,
          outputMode: parsedOutput.mode,
          rawOutput: textOutput,
          prompt: displayPrompt,
          lastRunAt: now,
          lastElapsedMs: output.elapsedMs || output.elapsed_ms || item.lastElapsedMs || 0,
          model: modelLabel || item.model,
          tag: '生成',
        };
      });
      if (isAssetExtraction) {
        const graph = ensurePromptRunnerAssetImageGraph({
          nodes: completedNodes,
          edges: promptRunnerEdges,
          sourceNodeId: job.nodeId,
          assets: parsedOutput.assets || [],
          makeId: () => makeNodeId('asset'),
        });
        recordJobResultUndo(() => {
          canvasActions.setNodes(graph.nodes);
          canvasActions.setEdges(graph.edges);
        });
      } else {
        recordJobResultUndo(() => {
          canvasActions.setNodes(syncPromptRunnerOutputToDownstreamNodes(
            completedNodes,
            promptRunnerEdges,
            job.nodeId,
            parsedOutput.value,
          ));
        });
      }
      libraryActions.recordJobHistory(job, {
        status: 'completed',
        kind: 'text',
        prompt: displayPrompt,
        model: modelLabel,
        source: 'prompt.runner',
      });
      return;
    }
    const patch = {
      generating: false,
      progress: 0,
      jobId: job.id,
      error: null,
      jobStage: '',
      prompt: displayPrompt,
      model: modelLabel || undefined,
      tag: '生成',
    };
    if (output.assetId) patch.assetId = output.assetId;
    if (output.assetPath) patch.assetPath = output.assetPath;
    if (kind === 'image' && url) patch.src = url;
    if (kind === 'text') {
      const textOutput = String(output.text || output.content || output.message || '').trim();
      const toolStyle = String(job.input?.style || '');
      const shouldWriteBackPrompt = toolStyle === 'node-tool:textpolish' && isMediaPromptPolishNode(targetNode);
      if (shouldWriteBackPrompt) {
        Object.assign(patch, buildMediaPromptPolishPatch({
          textOutput,
          fallbackPrompt: displayPrompt,
          modelLabel,
        }));
        delete patch.model;
      } else {
        patch.body = textOutput;
        patch.title = job.input?.title || '文本生成结果';
      }
    }
    if (kind === 'video' && url) {
      if (output.posterUrl) patch.poster = output.posterUrl;
      else patch.videoSrc = url;
      patch.duration = job.input?.duration ? `00:${String(job.input.duration).padStart(2, '0')}` : patch.duration;
    }
    if ((kind === 'image' || kind === 'video') && url) {
      Object.assign(patch, buildGeneratedMediaAspectPatch({ kind, node: targetNode, job }));
    }
    if (kind === 'audio') {
      patch.waveform = true;
      if (url) patch.audioSrc = url;
      patch.duration = output.duration || job.input?.duration || job.input?.durationSeconds || '00:18';
    }
    recordJobResultUndo(() => {
      canvasActions.updateNode(job.nodeId, patch);
      if (assetGenNodeId && assetGenNodeId !== job.nodeId) {
        const assetUrls = uniqueNonEmptyStrings([
          ...(Array.isArray(output.urls) ? output.urls.map((src) => makeAssetUrl({ src }, backendBaseUrlRef.current || undefined)) : []),
          url,
        ]);
        const assetPatch = {
          generating: false,
          progress: 0,
          jobId: job.id,
          error: null,
          jobStage: '',
          finalPrompt: job.input?.prompt,
          model: modelLabel || undefined,
          tag: '生成',
        };
        if (typeof job.input?._assetUserPrompt === 'string') assetPatch.prompt = job.input._assetUserPrompt;
        else if (typeof job.input?.assetUserPrompt === 'string') assetPatch.prompt = job.input.assetUserPrompt;
        if (url) {
          assetPatch.imageUrl = url;
          assetPatch.src = url;
        }
        if (assetUrls.length) assetPatch.imageUrls = assetUrls;
        if (output.assetId) assetPatch.assetId = output.assetId;
        if (output.assetPath) assetPatch.assetPath = output.assetPath;
        canvasActions.updateNode(assetGenNodeId, assetPatch);
        if (kind === 'image' && assetUrls.length) {
          const assetGenNode = currentNodes.find((item) => item.id === assetGenNodeId);
          const outputReferences = buildAssetGenOutputReferences({
            assetGenNodeId,
            assetGenTitle: assetGenNode?.title || '资产生成',
            urls: assetUrls,
            jobId: job.id,
            assetId: output.assetId,
            assetPath: output.assetPath,
            projectId: job.projectId || job.project_id || project?.id,
          });
          canvasActions.setNodes((items) => syncAssetGenOutputToDownstreamReferences({
            nodes: items,
            edges: canvasStore.getState().edges || currentEdges,
            assetGenNodeId,
            excludeNodeId: job.nodeId,
            references: outputReferences,
          }));
        }
      }
    });
    libraryActions.recordJobHistory(job, {
      status: 'completed',
      kind,
      src: url,
      assetId: output.assetId,
      assetPath: output.assetPath,
      prompt: displayPrompt,
      model: modelLabel,
      source: output.asset?.source || output.provider || 'job.output',
    });
    if (allowSideEffects && url && (kind === 'image' || kind === 'video')) {
      libraryActions.recordAssets([withProjectAssetScope(makeAssetRecord({
        kind,
        src: url,
        title: `${kind === 'image' ? '图片' : '视频'}结果`,
        nodeId: job.nodeId,
        source: output.asset?.source || output.provider || 'job.output',
        prompt: displayPrompt,
        jobId: job.id,
        assetId: output.assetId,
        assetPath: output.assetPath,
        action: 'asset.job-output',
        status: 'completed',
        progress: 100,
        model: modelLabel,
        modelName: output.providerModelName,
        provider: output.provider,
      }), job.projectId || job.project_id || project?.id)]);
    }
  }, [project?.id, readCanvasEdges, readCanvasNodes, recordJobResultUndo]);

  const pollJobUntilTerminal = React.useCallback((jobId) => {
    if (!jobId || jobPollersRef.current.has(jobId)) return;
    let attempts = 0;
    const terminal = new Set(['completed', 'failed', 'canceled']);
    const schedule = (delay = 900) => {
      const timer = window.setTimeout(async () => {
        jobPollersRef.current.delete(jobId);
        attempts += 1;
        try {
          const job = await JobStore.get(jobId);
          applyGenericJobUpdate(job);
          if (!terminal.has(job?.status) && attempts < 180) schedule(1800);
        } catch (error) {
          if (attempts < 12) schedule(2200);
          else console.warn('Job polling stopped', jobId, error);
        }
      }, delay);
      jobPollersRef.current.set(jobId, timer);
    };
    schedule();
  }, [applyGenericJobUpdate]);

  React.useEffect(() => {
    const jobId = workbenchTask?.jobId;
    if (!jobId || workbenchTask?.error) return;
    if (Number(workbenchTask?.progress) >= 100) return;
    pollJobUntilTerminal(jobId);
  }, [pollJobUntilTerminal, workbenchTask?.error, workbenchTask?.jobId, workbenchTask?.progress]);

  const clearUpscaleNodeLoading = React.useCallback((job) => {
    if (!job?.nodeId || job.type !== 'image.upscale') return;
    canvasActions.updateNode(job.nodeId, (current) => {
      if (!current?.generating && current?.jobId !== job.id) return {};
      return {
        generating: false,
        progress: 0,
        jobStage: '',
        jobId: null,
        error: null,
      };
    });
  }, []);

  const applyDesignSpaceCardJobUpdate = React.useCallback((job) => {
    const meta = designSpaceCardJobMeta(job);
    if (!meta) return false;
    const historyPatch = designSpaceCardJobHistoryPatch(job);
    if (historyPatch && ['completed', 'failed', 'canceled'].includes(String(job?.status || '').toLowerCase())) {
      libraryActions.recordJobHistory(job, historyPatch);
    }
    const currentPackage = designSpaceStore.getState().packagesByProject[meta.projectId];
    if (!currentPackage) return true;
    const nextPackage = applyDesignCardJobToPackage(currentPackage, job);
    if (nextPackage !== currentPackage) {
      designSpaceActions.setPackage(meta.projectId, nextPackage);
    }
    return true;
  }, []);

  const submitTrackedJob = React.useCallback((nodeId, body) => {
    return JobStore.create(nodeId, body)
      .then((job) => {
        applyGenericJobUpdate(job, { sideEffects: false });
        if (job?.id) pollJobUntilTerminal(job.id);
        return job;
      })
      .catch((error) => {
        const message = error instanceof Error && error.message
          ? error.message
          : String(error || '') || '生成失败：后端未返回错误详情';
        const assetGenNodeId = body?._assetGenNodeId || body?.assetGenNodeId || '';
        canvasActions.updateNode(nodeId, {
          generating: false,
          progress: 0,
          error: message,
          tag: '失败',
        });
        if (assetGenNodeId && assetGenNodeId !== nodeId) {
          canvasActions.updateNode(assetGenNodeId, {
            generating: false,
            progress: 0,
            error: message,
            tag: '失败',
          });
        }
        throw error;
      });
  }, [applyGenericJobUpdate, pollJobUntilTerminal]);

  React.useEffect(() => () => {
    jobPollersRef.current.forEach((timer) => window.clearTimeout(timer));
    jobPollersRef.current.clear();
  }, []);

  React.useEffect(() => {
    if (!EMBED_MODE && !launched) return undefined;
    return JobStore.onEvent((event) => {
      const job = event?.job;
      if (applyDesignSpaceCardJobUpdate(job)) return;
      if (!job?.nodeId) return;

      if (job.type === 'image.upscale') {
        if (['completed', 'failed', 'canceled'].includes(job.status)) {
          clearUpscaleNodeLoading(job);
        }
        return;
      }

      if (job.type === 'image.analyze') {
        if (job.status === 'queued' || job.status === 'running') {
          canvasActions.updateNode(job.nodeId, {
            focusAnalysisStatus: job.status,
            focusAnalysisProgress: Math.max(1, Math.min(99, Number(job.progress) || 1)),
            focusAnalysisJobId: job.id,
            focusAnalysisError: null,
          });
          return;
        }
        if (job.status === 'failed') {
          canvasActions.updateNode(job.nodeId, {
            focusAnalysisStatus: 'failed',
            focusAnalysisProgress: 0,
            focusAnalysisJobId: job.id,
            focusAnalysisError: job.error || '标签分析失败',
          });
          return;
        }
        if (job.status === 'completed') {
          const output = job.output || {};
          canvasActions.updateNode(job.nodeId, {
            focusAnalysisStatus: 'completed',
            focusAnalysisProgress: 100,
            focusAnalysisJobId: job.id,
            focusAnalysisError: null,
            focusAnalysis: {
              version: 1,
              sourceAssetId: output.sourceAssetId || job.input?.assetId,
              sourceUrl: output.sourceUrl || job.input?.imageUrl,
              provider: output.provider,
              providerModelId: output.providerModelId,
              providerModelName: output.providerModelName,
              tags: output.tags || output.regions || [],
              updatedAt: new Date().toISOString(),
            },
          });
          return;
        }
      }

      /* Storyboard "fill shot description" routing — bypass the node-level patch path.
       * These jobs target a specific shot inside a script node's shots[] array. */
      const isStoryboardFillDesc = job.input?._storyboard === 'fill-desc' && job.input?._shotId && job.input?._field;
      if (isStoryboardFillDesc) {
        const targetShotId = job.input._shotId;
        const targetField = job.input._field;
        if (job.status === 'queued' || job.status === 'running') {
          canvasActions.setNodes((ns) => ns.map((n) => {
            if (n.id !== job.nodeId || !Array.isArray(n.shots)) return n;
            return { ...n, shots: n.shots.map((s) => (s.id === targetShotId
              ? { ...s, status: 'generating', jobId: job.id, errorMessage: null }
              : s)) };
          }));
          return;
        }
        if (job.status === 'failed') {
          canvasActions.setNodes((ns) => ns.map((n) => {
            if (n.id !== job.nodeId || !Array.isArray(n.shots)) return n;
            return { ...n, shots: n.shots.map((s) => (s.id === targetShotId
              ? { ...s, status: 'failed', errorMessage: job.error || '生成失败' }
              : s)) };
          }));
          return;
        }
        if (job.status !== 'completed') return;
        const output = job.output || {};
        const text = (output.text || output.content || output.message || '').trim();
        canvasActions.setNodes((ns) => ns.map((n) => {
          if (n.id !== job.nodeId || !Array.isArray(n.shots)) return n;
          return { ...n, shots: n.shots.map((s) => (s.id === targetShotId
            ? { ...s, [targetField]: text, status: 'done', jobId: null,
                updatedAt: new Date().toISOString() }
            : s)) };
        }));
        return;
      }

      const isStoryboardCreate = job.input?._storyboard === 'create-script';
      if (isStoryboardCreate) {
        if (job.status === 'queued' || job.status === 'running') {
          canvasActions.updateNode(job.nodeId, {
            generating: true,
            progress: Math.max(1, Math.min(99, Number(job.progress) || 1)),
            jobId: job.id,
            jobStage: job.output?.stage,
            tag: '生成',
          });
          return;
        }
        if (job.status === 'failed') {
          canvasActions.updateNode(job.nodeId, {
            generating: false,
            progress: 0,
            jobId: job.id,
            error: job.error,
            tag: '失败',
          });
          return;
        }
        if (job.status !== 'completed') return;
        const output = job.output || {};
        const text = output.text || output.content || output.message || '';
        const shotCount = job.input?.shotsCount || 8;
        /* 4-layer robust parse; fall back to error display if all layers fail.
         * TODO(Phase 2): 传入 options.repairFn 启用 layer-4 LLM 修复（见 spec § 3.4）。 */
        jsonRobustParse(text).then((result) => {
          if (result.ok) {
            const shots = normalizeShots(result.data, shotCount);
            canvasActions.updateNode(job.nodeId, {
              type: 'script',
              title: job.input?.title || '分镜脚本',
              shots,
              generatedText: text,
              generating: false,
              progress: 0,
              jobStage: '',
              jobId: job.id,
              error: null,
              tag: '生成',
              model: output.displayName || output.providerModelName || job.input?.model,
            });
          } else {
            canvasActions.updateNode(job.nodeId, {
              generating: false,
              progress: 0,
              jobStage: '',
              jobId: job.id,
              error: `分镜 JSON 解析失败（${result.error || 'unknown'}）。可点击节点工具栏「重生分镜」重试。`,
              tag: '失败',
            });
          }
        }).catch((err) => {
          canvasActions.updateNode(job.nodeId, {
            generating: false,
            progress: 0,
            jobStage: '',
            error: String(err?.message || err),
            tag: '失败',
          });
        });
        return;
      }

      // ─── Phase 2A: 工作台 storyboard 任务的完成路由 ──────────
      const sbTag = job.input?._storyboard;
      if (sbTag === 'storyboard-shotgroup-media') {
        const sourceNodeId = job.input?._storyboardSourceNodeId || job.input?._nodeId || job.input?.sourceNodeId;
        const projectId = job.input?.projectId || project?.id || 'local-default';
        const mediaKind = job.input?._storyboardMediaKind === 'video' ? 'video' : 'image';
        const groupId = job.input?._shotGroupId || job.input?.shotGroupId || '';
        const progress = Math.max(1, Math.min(99, Number(job.progress) || 1));
        const terminal = ['completed', 'failed', 'canceled'].includes(job.status);

        if (sourceNodeId) {
          storyboardPackageActions.updateNodePackage(sourceNodeId, {
            projectId,
            updater: (pkg) => applyStoryboardMediaJobToPackage(pkg, job),
          });
        }
        applyGenericJobUpdate(job);
        if (sourceNodeId) {
          if (job.status === 'queued' || job.status === 'running') {
            setWorkbenchTaskForNode(sourceNodeId, {
              id: sbTag,
              stage: mediaKind === 'video' ? '镜头组视频生成中…' : '镜头组图片生成中…',
              progress,
              queue: { index: 1, total: 1, groupId, kind: mediaKind },
            });
          } else if (job.status === 'failed' || job.status === 'canceled') {
            setWorkbenchTaskForNode(sourceNodeId, {
              id: sbTag,
              error: job.status === 'canceled' ? '已取消' : jobErrorMessage(job),
              queue: { index: 1, total: 1, groupId, kind: mediaKind },
            });
          } else if (job.status === 'completed') {
            setWorkbenchTaskForNode(sourceNodeId, {
              id: sbTag,
              stage: mediaKind === 'video' ? '镜头组视频完成 ✓' : '镜头组图片完成 ✓',
              progress: 100,
              queue: { index: 1, total: 1, groupId, kind: mediaKind },
            });
            if (terminal) setTimeout(() => clearWorkbenchTaskForNode(sourceNodeId), 1500);
          }
        }
        return;
      }
      if (isStoryboardAnalysisJobTag(sbTag)) {
        const projectId = job.input?.projectId || project?.id || 'local-default';
        const nodeId = job.input?._nodeId || job.nodeId;

        (async () => {
          try {
            const update = await resolveStoryboardAnalysisJobPackageUpdate(job);
            if (update.updater && nodeId) {
              storyboardPackageActions.updateNodePackage(nodeId, {
                projectId,
                updater: update.updater,
              });
            }
            if (update.task) {
              setWorkbenchTaskForNode(nodeId, update.task);
              if (update.terminal && !update.task.error) {
                setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
              }
            }
          } catch (err) {
            console.error('Storyboard reference job handler failed', err);
            setWorkbenchTaskForNode(nodeId, { id: sbTag, error: String(err?.message || err) });
          }
        })();
        return;
      }

      if (sbTag === SHOTGROUP_PROMPT_INFERENCE_TAG) {
        const projectId = job.input?.projectId || project?.id || 'local-default';
        const nodeId = job.input?._nodeId || job.nodeId;
        const groupIdFor = (group, index = 0) => (
          group?.groupId
          || group?.shotGroupId
          || group?.id
          || `G${String(index + 1).padStart(3, '0')}`
        );
        const batchGroupIds = Array.isArray(job.input?._shotGroupIds)
          ? job.input._shotGroupIds.filter(Boolean)
          : [];
        const groupId = job.input?._shotGroupId || batchGroupIds[0] || groupIdFor(job.input?._shotGroup, 0);
        const groupIndex = Math.max(0, Number(job.input?._shotGroupIndex) || 0);
        const groupTotal = Math.max(1, Number(job.input?._shotGroupTotal) || 1);
        const batchSize = Math.max(1, Number(job.input?._shotGroupBatchSize) || batchGroupIds.length || 1);
        const promptOutputMode = job.input?._promptOutputMode || 'dual';
        const promptQueueId = job.input?._shotGroupQueueId || '';
        const promptQueueMode = job.input?._shotGroupQueueMode || '';
        const promptQueueConcurrency = Math.max(1, Number(job.input?._shotGroupQueueConcurrency) || 1);
        const promptQueueStopped = Boolean(promptQueueId && stoppedPromptQueuesRef.current.has(promptQueueId));
        const autoContinueQueue = canContinuePromptInferenceQueue({
          queueMode: promptQueueMode,
          autoContinue: job.input?._shotGroupAutoContinue !== false,
          queueId: promptQueueId,
          stoppedQueueIds: stoppedPromptQueuesRef.current,
        });
        const groupLabel = batchGroupIds.length > 1
          ? `${batchGroupIds[0]}~${batchGroupIds[batchGroupIds.length - 1]}`
          : groupId;
        const currentGroupIds = batchGroupIds.length ? batchGroupIds : [groupId].filter(Boolean);
        const queue = {
          queueId: promptQueueId,
          index: groupIndex + 1,
          total: groupTotal,
          groupId: groupLabel,
          kind: 'prompt',
          batchSize,
          stopped: promptQueueStopped,
        };
        const packageGroups = storyboardNodeShotGroups(nodeId);
        const inputAllGroups = Array.isArray(job.input?._allShotGroups) ? job.input._allShotGroups : [];
        const allGroups = promptQueueMode && inputAllGroups.length
          ? inputAllGroups
          : (packageGroups.length
            ? packageGroups
            : (inputAllGroups.length ? inputAllGroups : [job.input?._shotGroup].filter(Boolean)));
        const recordPromptQueueTerminalRange = (startIndex, count) => {
          if (!promptQueueId) return 0;
          const terminalSet = promptQueueTerminalRef.current.get(promptQueueId) || new Set();
          const terminalSize = Math.max(1, Number(count) || 1);
          for (let offset = 0; offset < terminalSize; offset += 1) {
            const terminalGroupIndex = Math.max(0, Number(startIndex) || 0) + offset;
            if (terminalGroupIndex < allGroups.length) {
              terminalSet.add(terminalGroupIndex);
            }
          }
          promptQueueTerminalRef.current.set(promptQueueId, terminalSet);
          return terminalSet.size;
        };
        const recordPromptQueueTerminal = () => (
          recordPromptQueueTerminalRange(groupIndex, currentGroupIds.length || batchSize)
        );
        const cleanupPromptQueue = () => {
          if (!promptQueueId) return;
          promptQueueTerminalRef.current.delete(promptQueueId);
          stoppedPromptQueuesRef.current.delete(promptQueueId);
          canceledPromptQueueGroupsRef.current.delete(promptQueueId);
          Array.from(promptQueueSubmittedRef.current).forEach((key) => {
            if (key.startsWith(`${promptQueueId}:`)) {
              promptQueueSubmittedRef.current.delete(key);
            }
          });
        };
        const terminalCount = ['completed', 'failed', 'canceled'].includes(job.status)
          ? recordPromptQueueTerminal()
          : 0;
        const canceledPromptQueueGroupIds = () => (
          promptQueueId ? (canceledPromptQueueGroupsRef.current.get(promptQueueId) || new Set()) : new Set()
        );
        const currentBatchCanceled = promptInferenceQueueBatchCanceled(
          currentGroupIds,
          canceledPromptQueueGroupIds(),
        );
        const promptQueueTerminalCount = () => (
          promptQueueId ? (promptQueueTerminalRef.current.get(promptQueueId)?.size || terminalCount) : terminalCount
        );
        const isPromptQueueComplete = () => Boolean(
          promptQueueId
          && allGroups.length
          && promptQueueTerminalCount() >= allGroups.length,
        );
        const markPromptGroupsFailed = (failedGroupIds, error) => {
          const ids = (Array.isArray(failedGroupIds) ? failedGroupIds : [])
            .filter(Boolean);
          if (!nodeId || !ids.length) return;
          storyboardPackageActions.updateNodePackage(nodeId, {
            projectId,
            updater: (pkg) => ids.reduce((nextPkg, failedGroupId) => (
              applyShotGroupPromptInferenceFailureToPackage(nextPkg, {
                groupId: failedGroupId,
                jobId: job.id || job.jobId,
                error,
              })
            ), pkg),
          });
        };
        const markPromptGroupsCanceled = (canceledGroupIds, message = '已取消该任务') => {
          const ids = (Array.isArray(canceledGroupIds) ? canceledGroupIds : [])
            .filter(Boolean);
          if (!nodeId || !ids.length) return;
          storyboardPackageActions.updateNodePackage(nodeId, {
            projectId,
            updater: (pkg) => {
              const shotGroups = applyPromptInferenceQueueCancelToGroups(pkg?.shotGroups || [], {
                groupIds: ids,
                message,
              });
              const canceledIds = new Set(shotGroups
                .filter((group) => group?.promptStatus === 'canceled')
                .map((group) => String(group?.groupId || group?.shotGroupId || group?.id || '').trim())
                .filter((id) => ids.includes(id)));
              const generationPlan = pkg?.generationPlan || {};
              const shotTasks = Array.isArray(generationPlan.shotTasks) ? generationPlan.shotTasks : [];
              const nextShotTasks = shotTasks.map((task) => {
                const taskGroupId = String(task?.shotGroupId || task?.shotGroup || task?.groupId || '').trim();
                const status = String(task?.promptStatus || '').trim().toLowerCase();
                if (!canceledIds.has(taskGroupId) || !['pending', 'queued', 'running', ''].includes(status)) return task;
                return {
                  ...task,
                  promptStatus: 'canceled',
                  promptProgress: 100,
                  promptStage: message,
                  promptJobId: '',
                };
              });
              return {
                shotGroups,
                generationPlan: {
                  ...generationPlan,
                  shotTasks: nextShotTasks,
                },
              };
            },
          });
        };
        const markPromptGroupsStatus = (targetGroupIds, patch = {}) => {
          const ids = (Array.isArray(targetGroupIds) ? targetGroupIds : [])
            .filter(Boolean);
          if (!nodeId || !ids.length) return;
          const hasJobId = Object.prototype.hasOwnProperty.call(patch, 'jobId');
          storyboardPackageActions.updateNodePackage(nodeId, {
            projectId,
            updater: (pkg) => applyShotGroupPromptInferenceStatusToPackage(pkg, {
              groupIds: ids,
              status: patch.status,
              progress: patch.progress,
              stage: patch.stage,
              error: patch.error,
              jobId: hasJobId ? patch.jobId : (job.id || job.jobId || ''),
            }),
          });
        };
        const submitNextPromptQueueGroup = async (fromIndex = groupIndex) => {
          if (!autoContinueQueue || !promptQueueId || !allGroups.length) return false;
          const nextIndex = nextPromptInferenceQueueIndex({
            groupIndex: fromIndex,
            concurrency: promptQueueConcurrency,
            batchSize: SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE,
            total: allGroups.length,
          });
          if (nextIndex < 0) return false;
          const nextBatchGroups = allGroups.slice(nextIndex, nextIndex + SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE);
          const nextGroup = nextBatchGroups[0];
          if (!nextGroup || !nextBatchGroups.length) return false;
          const queueKey = `${promptQueueId}:${nextIndex}`;
          if (promptQueueSubmittedRef.current.has(queueKey)) return true;
          promptQueueSubmittedRef.current.add(queueKey);
          const nextGroupIds = nextBatchGroups.map((item, offset) => groupIdFor(item, nextIndex + offset));
          const nextGroupId = nextGroupIds[0];
          if (promptInferenceQueueBatchCanceled(nextGroupIds, canceledPromptQueueGroupIds())) {
            markPromptGroupsCanceled(nextGroupIds);
            recordPromptQueueTerminalRange(nextIndex, nextBatchGroups.length);
            return submitNextPromptQueueGroup(nextIndex);
          }
          const nextGroupLabel = nextGroupIds.length > 1
            ? `${nextGroupIds[0]}~${nextGroupIds[nextGroupIds.length - 1]}`
            : nextGroupId;
          const nextQueue = {
            queueId: promptQueueId,
            index: nextIndex + 1,
            total: allGroups.length,
            groupId: nextGroupLabel,
            kind: 'prompt',
            batchSize: nextBatchGroups.length,
            stopped: false,
          };
          const model = modelFromStoryboardJobInput(job.input);
          const submitProgress = Math.max(5, Math.min(96, Math.round((nextIndex / allGroups.length) * 100)));
          markPromptGroupsStatus(nextGroupIds, {
            status: 'queued',
            progress: submitProgress,
            stage: `提交第 ${nextIndex + 1}-${Math.min(nextIndex + nextBatchGroups.length, allGroups.length)}/${allGroups.length} 组提示词推理…`,
            jobId: '',
          });
          setWorkbenchTaskForNode(nodeId, {
            id: sbTag,
            stage: `提交第 ${nextIndex + 1}/${allGroups.length} 组提示词推理…`,
            progress: submitProgress,
            queue: nextQueue,
          });
          const result = await runShotGroupPromptInference({
            shotGroup: nextGroup,
            shotGroups: nextBatchGroups,
            assets: job.input?._strategicGuide || {},
            previousAnchor: null,
            directorAnalysis: job.input?._directorAnalysis || '',
            scriptText: job.input?._scriptText || '',
            aspectRatio: job.input?._aspectRatio || 'auto',
            projectId,
            nodeId,
            model,
            targetDuration: job.input?._targetDuration || null,
            allShotGroups: allGroups,
            groupIndex: nextIndex,
            groupTotal: allGroups.length,
            promptTemplateId: job.input?._promptTemplateId || '',
            promptTemplateKey: job.input?._promptTemplateKey || '',
            promptOutputMode,
            promptQueueId,
            promptQueueMode: 'parallel',
            promptQueueConcurrency,
            shotGroupAutoContinue: true,
            onProgress: (payload) => {
              if (promptInferenceQueueBatchCanceled(nextGroupIds, canceledPromptQueueGroupIds())) {
                markPromptGroupsCanceled(nextGroupIds);
                setWorkbenchTaskForNode(nodeId, {
                  id: sbTag,
                  stage: `${nextGroupLabel} 已取消`,
                  progress: 100,
                  queue: { ...nextQueue, stopped: true },
                  canceled: true,
                  stopped: true,
                });
                return;
              }
              setWorkbenchTaskForNode(nodeId, {
                id: sbTag,
                ...payload,
                queue: nextQueue,
              });
            },
          });
          if (!result.ok) {
            markPromptGroupsFailed(nextGroupIds, result.error || '提示词推理任务提交失败');
            return submitNextPromptQueueGroup(nextIndex);
          }
          return true;
        };
        const failCurrentAndMaybeContinue = async (error) => {
          markPromptGroupsFailed(currentGroupIds, error);
          if (autoContinueQueue) {
            const submittedNext = await submitNextPromptQueueGroup(groupIndex);
            const queueComplete = isPromptQueueComplete();
            setWorkbenchTaskForNode(nodeId, {
              id: sbTag,
              stage: queueComplete
                ? '提示词队列处理完成（有失败）'
                : (submittedNext
                ? `${groupLabel} 失败，已跳过并继续队列…`
                : `${groupLabel} 失败，已跳过该分组。`),
              progress: queueComplete ? 100 : Math.min(96, Math.max(10, Number(job.progress) || 10)),
              queue,
            });
            if (queueComplete) {
              setTimeout(() => {
                cleanupPromptQueue();
                clearWorkbenchTaskForNode(nodeId);
              }, 1500);
            }
            return;
          }
          setWorkbenchTaskForNode(nodeId, { id: sbTag, error, queue });
        };

        if (currentBatchCanceled) {
          markPromptGroupsCanceled(currentGroupIds);
          if (job.status === 'queued' || job.status === 'running') {
            setWorkbenchTaskForNode(nodeId, {
              id: sbTag,
              stage: `${groupLabel} 已取消`,
              progress: 100,
              queue: { ...queue, stopped: true },
              canceled: true,
              stopped: true,
            });
            return;
          }
          if (['completed', 'failed', 'canceled'].includes(job.status)) {
            if (autoContinueQueue) {
              submitNextPromptQueueGroup(groupIndex).then((submittedNext) => {
                const queueComplete = isPromptQueueComplete();
                setWorkbenchTaskForNode(nodeId, {
                  id: sbTag,
                  stage: queueComplete
                    ? '提示词队列处理完成'
                    : (submittedNext ? `${groupLabel} 已取消，队列继续…` : `${groupLabel} 已取消`),
                  progress: queueComplete ? 100 : Math.min(96, Math.max(10, Number(job.progress) || 10)),
                  queue: queueComplete ? { ...queue, stopped: true } : queue,
                  canceled: queueComplete,
                  stopped: queueComplete,
                });
                if (queueComplete) {
                  setTimeout(() => {
                    cleanupPromptQueue();
                    clearWorkbenchTaskForNode(nodeId);
                  }, 1500);
                }
              }).catch((err) => {
                console.error('ShotGroup prompt queue canceled batch handler failed', err);
                setWorkbenchTaskForNode(nodeId, { id: sbTag, error: String(err?.message || err), queue });
              });
              return;
            }
            setWorkbenchTaskForNode(nodeId, {
              id: sbTag,
              stage: '提示词任务已取消',
              progress: 100,
              queue: { ...queue, stopped: true },
              canceled: true,
              stopped: true,
            });
            setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
            return;
          }
        }

        if (job.status === 'queued' || job.status === 'running') {
          const progress = Math.max(1, Math.min(99, Number(job.progress) || 1));
          markPromptGroupsStatus(currentGroupIds, {
            status: job.status,
            progress,
            stage: job.output?.stage || '提示词推理中…',
          });
          setWorkbenchTaskForNode(nodeId, {
            id: sbTag,
            stage: job.output?.stage || '提示词推理中…',
            progress,
            queue,
          });
          return;
        }

        if (job.status === 'canceled') {
          markPromptGroupsCanceled(currentGroupIds);
          if (autoContinueQueue) {
            submitNextPromptQueueGroup(groupIndex).then((submittedNext) => {
              const queueComplete = isPromptQueueComplete();
              setWorkbenchTaskForNode(nodeId, {
                id: sbTag,
                stage: queueComplete
                  ? '提示词队列处理完成'
                  : (submittedNext ? `${groupLabel} 已取消，队列继续…` : `${groupLabel} 已取消`),
                progress: queueComplete ? 100 : Math.min(96, Math.max(10, Number(job.progress) || 10)),
                queue,
                canceled: queueComplete || !submittedNext,
                stopped: queueComplete || !submittedNext,
              });
              if (queueComplete) {
                setTimeout(() => {
                  cleanupPromptQueue();
                  clearWorkbenchTaskForNode(nodeId);
                }, 1500);
              }
            }).catch((err) => {
              console.error('ShotGroup prompt queue cancel handler failed', err);
              setWorkbenchTaskForNode(nodeId, { id: sbTag, error: String(err?.message || err), queue });
            });
            return;
          }
          setWorkbenchTaskForNode(nodeId, {
            id: sbTag,
            stage: '提示词任务已取消',
            progress: 100,
            queue: { ...queue, stopped: true },
            canceled: true,
            stopped: true,
          });
          return;
        }

        if (job.status === 'failed') {
          const error = job.error || '提示词推理失败';
          failCurrentAndMaybeContinue(error).catch((err) => {
            console.error('ShotGroup prompt queue failure handler failed', err);
            setWorkbenchTaskForNode(nodeId, { id: sbTag, error: String(err?.message || err), queue });
          });
          return;
        }

        if (job.status !== 'completed') return;

        const output = job.output || {};
        const text = (output.text || output.content || output.message || '').trim();

        (async () => {
          try {
            let parsedData = output;
            let parsedPartial = false;
            if (text) {
              const parsed = await jsonRobustParse(text);
              if (!parsed.ok) {
                await failCurrentAndMaybeContinue(`提示词 JSON 解析失败：${parsed.error}`);
                return;
              }
              parsedData = parsed.data;
              parsedPartial = Boolean(parsed.partial);
            }

            const inputBatchGroups = Array.isArray(job.input?._shotGroups) ? job.input._shotGroups : [];
            const currentBatchGroups = inputBatchGroups.length
              ? inputBatchGroups
              : allGroups.slice(groupIndex, groupIndex + batchSize);
            const inferredBatch = normalizeShotGroupPromptInferenceBatchOutput(parsedData, {
              shotGroups: currentBatchGroups.length ? currentBatchGroups : [{ groupId }],
              partial: parsedPartial,
            });
            if (parsedPartial && !inferredBatch.length) {
              await failCurrentAndMaybeContinue('提示词 JSON 只返回了截断内容，未解析到当前分组可用提示词');
              return;
            }
            const inferredGroupIds = new Set(inferredBatch
              .map((item) => String(item?.groupId || '').trim())
              .filter(Boolean));
            const missingPartialGroupIds = parsedPartial
              ? currentGroupIds.filter((id) => !inferredGroupIds.has(id))
              : [];
            if (nodeId && inferredBatch.length) {
              storyboardPackageActions.updateNodePackage(nodeId, {
                projectId,
                updater: (pkg) => applyShotGroupPromptInferenceBatchToPackage(pkg, {
                  jobId: job.id || job.jobId,
                  outputs: inferredBatch,
                  outputMode: promptOutputMode,
                }),
              });
            }
            if (missingPartialGroupIds.length) {
              markPromptGroupsFailed(
                missingPartialGroupIds,
                `提示词 JSON 部分解析：已写回 ${inferredBatch.length} 组，剩余 ${missingPartialGroupIds.length} 组需重试`,
              );
            }

            if (autoContinueQueue) {
              const submittedNext = await submitNextPromptQueueGroup(groupIndex);
              const queueComplete = isPromptQueueComplete();
              setWorkbenchTaskForNode(nodeId, {
                id: sbTag,
                stage: queueComplete
                  ? (missingPartialGroupIds.length ? '提示词队列处理完成（有部分解析失败）' : '提示词队列完成 ✓')
                  : (missingPartialGroupIds.length
                    ? `已写回 ${inferredBatch.length} 组，${missingPartialGroupIds.length} 组解析失败，队列继续…`
                    : (submittedNext ? '当前分组完成，队列继续…' : '当前分组完成，等待剩余队列任务…')),
                progress: queueComplete
                  ? 100
                  : (submittedNext
                  ? Math.max(15, Math.min(96, Math.round(((groupIndex + 1) / allGroups.length) * 100)))
                  : Math.min(99, Math.round(((groupIndex + 1) / allGroups.length) * 100))),
                queue,
              });
              if (queueComplete) {
                setTimeout(() => {
                  cleanupPromptQueue();
                  clearWorkbenchTaskForNode(nodeId);
                }, 1500);
              }
              return;
            }

            if (promptQueueMode === 'parallel') {
              setWorkbenchTaskForNode(nodeId, {
                id: sbTag,
                stage: missingPartialGroupIds.length
                  ? `已写回 ${inferredBatch.length} 组，${missingPartialGroupIds.length} 组解析失败`
                  : (promptQueueStopped
                    ? '队列已停止，已完成分组已写回'
                    : '当前分组完成，等待剩余队列任务…'),
                progress: promptQueueStopped
                  ? Math.min(100, Math.max(1, Number(job.progress) || 100))
                  : Math.min(99, Math.round(((groupIndex + currentBatchGroups.length) / allGroups.length) * 100)),
                queue,
                stopped: promptQueueStopped,
              });
              if (promptQueueStopped) {
                setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
              }
              return;
            }

            const nextIndex = groupIndex + Math.max(1, currentBatchGroups.length || batchSize);
            const nextBatchGroups = allGroups.slice(nextIndex, nextIndex + SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE);
            if (nextBatchGroups.length) {
              const nextFirstGroup = nextBatchGroups[0];
              const nextLastGroup = nextBatchGroups[nextBatchGroups.length - 1];
              const nextFirstGroupId = nextFirstGroup.groupId || nextFirstGroup.shotGroupId || nextFirstGroup.id;
              const nextLastGroupId = nextLastGroup.groupId || nextLastGroup.shotGroupId || nextLastGroup.id || nextFirstGroupId;
              const nextGroupLabel = nextBatchGroups.length > 1 ? `${nextFirstGroupId}~${nextLastGroupId}` : nextFirstGroupId;
              const lastAnchor = [...inferredBatch].reverse().map((item) => item.nextAnchor).find(Boolean)
                || job.input?._previousAnchor
                || null;
              const model = modelFromStoryboardJobInput(job.input);
              setWorkbenchTaskForNode(nodeId, {
                id: sbTag,
                stage: `提交第 ${nextIndex + 1}-${Math.min(nextIndex + nextBatchGroups.length, allGroups.length)}/${allGroups.length} 组提示词推理…`,
                progress: Math.max(70, Math.round(((nextIndex) / allGroups.length) * 100)),
                queue: {
                  index: nextIndex + 1,
                  total: allGroups.length,
                  groupId: nextGroupLabel,
                  kind: 'prompt',
                  batchSize: nextBatchGroups.length,
                },
              });
              const result = await runShotGroupPromptInference({
                shotGroup: nextFirstGroup,
                shotGroups: nextBatchGroups,
                assets: job.input?._strategicGuide || {},
                previousAnchor: lastAnchor,
                directorAnalysis: job.input?._directorAnalysis || '',
                scriptText: job.input?._scriptText || '',
                aspectRatio: job.input?._aspectRatio || 'auto',
                projectId,
                nodeId,
                model,
                targetDuration: job.input?._targetDuration || null,
                groupIndex: nextIndex,
                groupTotal: allGroups.length,
                promptTemplateId: job.input?._promptTemplateId || '',
                promptTemplateKey: job.input?._promptTemplateKey || '',
                promptOutputMode,
                onProgress: (payload) => setWorkbenchTaskForNode(nodeId, {
                  id: sbTag,
                  ...payload,
                  queue: {
                    index: nextIndex + 1,
                    total: allGroups.length,
                    groupId: nextGroupLabel,
                    kind: 'prompt',
                    batchSize: nextBatchGroups.length,
                  },
                }),
              });
              if (!result.ok) {
                setWorkbenchTaskForNode(nodeId, { id: sbTag, error: result.error || '提示词推理任务提交失败' });
              }
              return;
            }

            setWorkbenchTaskForNode(nodeId, {
              id: sbTag,
              stage: missingPartialGroupIds.length
                ? `提示词部分完成：已写回 ${inferredBatch.length} 组，${missingPartialGroupIds.length} 组解析失败`
                : '提示词推理完成 ✓',
              progress: 100,
            });
            setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
          } catch (err) {
            console.error('ShotGroup prompt inference handler failed', err);
            await failCurrentAndMaybeContinue(String(err?.message || err));
          }
        })();
        return;
      }

      if (['novel-to-script', 'script-formatter', 'extract-assets', 'script-to-shotgroups'].includes(sbTag)) {
        const projectId = job.input?.projectId || project?.id || 'local-default';
        const nodeId = job.input?._nodeId || job.nodeId;

        if (job.status === 'queued' || job.status === 'running') {
          setWorkbenchTaskForNode(nodeId, {
            id: sbTag,
            stage: job.output?.stage || '运行中…',
            progress: Math.max(1, Math.min(99, Number(job.progress) || 1)),
          });
          return;
        }
        if (job.status === 'failed') {
          setWorkbenchTaskForNode(nodeId, { id: sbTag, error: job.error || '任务失败' });
          return;
        }
        if (job.status !== 'completed') return;

        const output = job.output || {};
        const text = (output.text || output.content || output.message || '').trim();

        (async () => {
          try {
            if (sbTag === 'novel-to-script' || sbTag === 'script-formatter') {
              /* Output is the standardized script text — write it back to the node's scriptText. */
              if (nodeId) canvasActions.updateNode(nodeId, { scriptText: text });
              setWorkbenchTaskForNode(nodeId, { id: sbTag, stage: '完成 ✓', progress: 100 });
              setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
              return;
            }
            if (sbTag === 'extract-assets') {
              const result = await jsonRobustParse(text);
              if (result.ok) {
                const data = Array.isArray(result.data) ? { keyCharacters: result.data } : (result.data || {});
                const assets = {
                  keyCharacters: data.keyCharacters || [],
                  keyProps: data.keyProps || [],
                  sceneAnalysis: data.sceneAnalysis || [],
                };
                /* Ensure each item has id */
                const ensureIds = (arr, prefix) => arr.map((item, i) => ({
                  ...item,
                  id: item.id || `${prefix}_${Date.now().toString(36)}_${i}`,
                }));
                const withIds = {
                  keyCharacters: ensureIds(assets.keyCharacters, 'c'),
                  keyProps: ensureIds(assets.keyProps, 'p'),
                  sceneAnalysis: ensureIds(assets.sceneAnalysis, 's'),
                };
                projectAssetsActions.setAssets(projectId, withIds);
                /* Persist to PromptStore */
                await saveProjectAssets(projectId, withIds, PromptStore);
                setWorkbenchTaskForNode(nodeId, { id: sbTag, stage: '完成 ✓', progress: 100 });
                setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
              } else {
                setWorkbenchTaskForNode(nodeId, { id: sbTag, error: `资产 JSON 解析失败：${result.error}` });
              }
              return;
            }
            if (sbTag === 'script-to-shotgroups') {
              const update = await resolveScriptToShotGroupsJobUpdate(job);
              if (nodeId && update.nodePatch) {
                canvasActions.updateNode(nodeId, update.nodePatch);
              }
              if (nodeId && update.updater) {
                storyboardPackageActions.updateNodePackage(nodeId, {
                  projectId,
                  updater: update.updater,
                });
              }
              if (update.task) {
                setWorkbenchTaskForNode(nodeId, update.task);
                if (update.terminal && !update.task.error) {
                  setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
                }
              }
              return;
            }
          } catch (err) {
            console.error('Workbench job complete handler failed', err);
            setWorkbenchTaskForNode(nodeId, { id: sbTag, error: String(err?.message || err) });
          }
        })();
        return;
      }

      applyGenericJobUpdate(job);
    });
  }, [applyDesignSpaceCardJobUpdate, applyGenericJobUpdate, clearUpscaleNodeLoading, launched]);

  React.useEffect(() => {
    if (!EMBED_MODE && !launched) return undefined;
    const terminal = new Set(['completed', 'failed', 'canceled']);
    let active = true;
    const pendingUpscaleTimers = new Set();
    const watchedUpscaleJobIds = new Set();
    const releaseUpscaleJob = (jobId) => {
      upscaleNodeCleanupRef.current.delete(jobId);
      watchedUpscaleJobIds.delete(jobId);
    };
    const watchUpscaleNodes = () => {
      if (!active) return;
      const currentNodes = canvasStore.getState().nodes || [];
      currentNodes.forEach((node) => {
        const jobId = node?.jobId;
        if (node?.type !== 'image' || !node.generating || !jobId || upscaleNodeCleanupRef.current.has(jobId)) return;
        upscaleNodeCleanupRef.current.add(jobId);
        watchedUpscaleJobIds.add(jobId);
        let attempts = 0;
        const check = async () => {
          if (!active) return;
          attempts += 1;
          try {
            const job = await JobStore.get(jobId);
            if (!active) return;
            if (job?.type !== 'image.upscale') {
              releaseUpscaleJob(jobId);
              return;
            }
            if (terminal.has(job.status)) {
              clearUpscaleNodeLoading(job);
              releaseUpscaleJob(jobId);
              return;
            }
            if (attempts < 180) {
              const timerId = window.setTimeout(() => {
                pendingUpscaleTimers.delete(timerId);
                void check();
              }, 1600);
              pendingUpscaleTimers.add(timerId);
            } else {
              releaseUpscaleJob(jobId);
            }
          } catch {
            if (!active) return;
            releaseUpscaleJob(jobId);
          }
        };
        void check();
      });
    };
    watchUpscaleNodes();
    const unsubscribe = canvasStore.subscribe(watchUpscaleNodes);
    return () => {
      active = false;
      unsubscribe();
      pendingUpscaleTimers.forEach((timerId) => window.clearTimeout(timerId));
      pendingUpscaleTimers.clear();
      watchedUpscaleJobIds.forEach((jobId) => upscaleNodeCleanupRef.current.delete(jobId));
      watchedUpscaleJobIds.clear();
    };
  }, [clearUpscaleNodeLoading, launched]);

  // === focusNodesInCanvas — touches DOM + canvasRef ===
  const focusNodesInCanvas = React.useCallback((targetNodes) => {
    if (!targetNodes?.length || !canvasRef.current) return;
    const root = document.querySelector('.canvas-root');
    const rect = root?.getBoundingClientRect();
    if (!rect) return;
    const minX = Math.min(...targetNodes.map(n => n.x));
    const minY = Math.min(...targetNodes.map(n => n.y));
    const maxX = Math.max(...targetNodes.map(n => n.x + n.w));
    const maxY = Math.max(...targetNodes.map(n => n.y + n.h));
    canvasRef.current.focusOn({ minX, minY, maxX, maxY }, { w: rect.width, h: rect.height });
  }, []);

  const focusTaskNodeInCanvas = React.useCallback((nodeId, providedNode = null) => {
    const node = providedNode || canvasStore.getState().nodesById.get(nodeId);
    if (!node) return;
    uiActions.setSelection([node.id]);
    focusNodesInCanvas([node]);
  }, [focusNodesInCanvas]);

  // === Viewport center helper ===
  const getViewportCenter = React.useCallback(() => {
    const v = canvasRef.current?.get?.();
    const el = document.querySelector('.canvas-root');
    const r = el?.getBoundingClientRect();
    if (!v || !r) return { x: 200, y: 200 };
    return { x: v.x + r.width / (2 * v.s) - 160, y: v.y + r.height / (2 * v.s) - 110 };
  }, []);

  const resolveGenerationModel = React.useCallback(async (capability, current = {}) => {
    try {
      const [providerResult, modelResult] = await Promise.all([
        ProviderStore.list(),
        ProviderStore.models({ capability }),
      ]);
      const enabledProviderIds = new Set((providerResult?.providers || [])
        .filter((provider) => provider.enabled !== false)
        .map((provider) => provider.id));
      const candidates = (Array.isArray(modelResult?.models) ? modelResult.models : [])
        .filter((model) => model.enabled !== false);
      return selectBackendModel(candidates, {
        currentId: current.modelId || current.providerModelId,
        currentLabel: current.model,
        enabledProviderIds,
      });
    } catch {
      return null;
    }
  }, []);

  const storyboardGroupNodeSet = React.useCallback((items, { storyboardPackage, sourceNodeId, shotGroupId }) => {
    const packageId = storyboardPackage?.id;
    const belongs = (node) => (
      node?.deploymentKind === 'storyboard'
      && (node.storyboardShotGroupId || node.shotGroupId) === shotGroupId
      && (!packageId || node.deployedFromPackageId === packageId)
      && (!sourceNodeId || node.deployedFromNodeId === sourceNodeId)
    );
    const linkedIds = (Array.isArray(storyboardPackage?.generationPlan?.shotTasks)
      ? storyboardPackage.generationPlan.shotTasks
      : [])
      .filter((task) => (
        (task?.shotGroupId || task?.shotGroup || task?.groupId || 'ungrouped') === shotGroupId
      ))
      .reduce((next, task) => ({
        ...next,
        ...(task?.linkedCanvasNodeIds || {}),
      }), {});
    const linkedNode = (id, role) => {
      const node = id ? items.find((item) => item?.id === id) : null;
      return node && belongs(node) && (!role || node.deploymentRole === role) ? node : null;
    };
    const newest = [...items].reverse();
    return {
      text: linkedNode(linkedIds.textNodeId, 'text')
        || newest.find((node) => belongs(node) && node.deploymentRole === 'text')
        || null,
      image: linkedNode(linkedIds.imageNodeId, 'image')
        || newest.find((node) => belongs(node) && node.deploymentRole === 'image')
        || null,
      video: linkedNode(linkedIds.videoNodeId, 'video')
        || newest.find((node) => belongs(node) && node.deploymentRole === 'video')
        || null,
      group: linkedNode(linkedIds.groupNodeId, 'group')
        || newest.find((node) => belongs(node) && node.deploymentRole === 'group')
        || null,
    };
  }, []);

  const ensureStoryboardMediaNodes = React.useCallback((request = {}) => {
    const storyboardPackage = request.storyboardPackage;
    const sourceNodeId = request.nodeId || storyboardPackage?.nodeId;
    const projectId = request.projectId || project?.id || currentProjectId || 'local-default';
    const wantedGroupIds = request.scope === 'shot-group' && request.shotGroupId
      ? [request.shotGroupId]
      : summarizeShotGroupsForDeployment(storyboardPackage).map((group) => group.shotGroupId);
    if (!sourceNodeId || !storyboardPackage || !wantedGroupIds.length) {
      return { ok: false, error: '缺少分镜生产包或镜头组，无法生成。' };
    }

    let workingNodes = canvasStore.getState().nodes;
    let workingEdges = canvasStore.getState().edges;
    const sourceNode = workingNodes.find((node) => node.id === sourceNodeId) || null;
    const deploymentFallbackOrigin = request.origin || resolveStoryboardDeploymentListOrigin({
      sourceNode,
      groupCount: wantedGroupIds.length,
      fallbackOrigin: getViewportCenter(),
    });
    const deployedGroups = [];
    let mediaPromptsSynced = false;
    wantedGroupIds.forEach((shotGroupId) => {
      const existing = storyboardGroupNodeSet(workingNodes, { storyboardPackage, sourceNodeId, shotGroupId });
      const syncedNodes = syncStoryboardMediaPromptsIntoDeployment({
        nodes: workingNodes,
        productionPackage: storyboardPackage,
        shotGroupIds: [shotGroupId],
      });
      if (syncedNodes !== workingNodes) {
        workingNodes = syncedNodes;
        mediaPromptsSynced = true;
      }
      if (existing.image && existing.video) return;
      const deploymentOrigin = resolveStoryboardDeploymentOrigin({
        nodes: workingNodes,
        productionPackage: storyboardPackage,
        sourceNodeId,
        shotGroupId,
        fallbackOrigin: deploymentFallbackOrigin,
      });
      const deployment = buildStoryboardCanvasDeployment(storyboardPackage, {
        scope: 'shot-group',
        shotGroupId,
        includeVideo: true,
        origin: deploymentOrigin,
      });
      const merged = mergeCanvasDeploymentIntoGraph({
        nodes: workingNodes,
        edges: workingEdges,
        deployment,
      });
      workingNodes = merged.nodes;
      workingEdges = merged.edges;
      deployedGroups.push(deployment);
      storyboardPackageActions.updateNodePackage(sourceNodeId, {
        projectId,
        updater: (pkg) => ({
          generationPlan: applyCanvasDeploymentToGenerationPlan(pkg, deployment),
        }),
      });
    });
    if (deployedGroups.length || mediaPromptsSynced) {
      canvasActions.setNodes(workingNodes);
    }
    if (deployedGroups.length) {
      canvasActions.setEdges(workingEdges);
      const focusTargets = deployedGroups
        .flatMap((deployment) => deployment.nodes)
        .filter((node) => node.type !== 'group');
      if (focusTargets.length) {
        uiActions.setSelection(focusTargets.map((node) => node.id));
        focusNodesInCanvas(focusTargets);
      }
    }
    return { ok: true, nodes: workingNodes, edges: workingEdges, groupIds: wantedGroupIds };
  }, [currentProjectId, focusNodesInCanvas, getViewportCenter, project?.id, storyboardGroupNodeSet]);

  const nodeMediaUrlForStoryboard = React.useCallback((node, kind) => {
    if (!node) return '';
    if (kind === 'video') return node.videoSrc || node.videoUrl || node.assetUrl || node.assetPath || '';
    return node.src || node.imageUrl || node.url || node.assetUrl || node.assetPath || '';
  }, []);

  const generateStoryboardPackageMedia = React.useCallback(async (request = {}) => {
    const storyboardPackage = request.storyboardPackage;
    const sourceNodeId = request.nodeId || storyboardPackage?.nodeId;
    const projectId = request.projectId || project?.id || currentProjectId || 'local-default';
    const ensured = ensureStoryboardMediaNodes(request);
    if (!ensured.ok) {
      setWorkbenchTaskForNode(sourceNodeId, { id: 'storyboard-shotgroup-media', error: ensured.error });
      return;
    }
    if (!JobStore.available()) {
      setWorkbenchTaskForNode(sourceNodeId, { id: 'storyboard-shotgroup-media', error: '本地后端未连接，无法生成镜头组媒体。' });
      return;
    }

    const requestedKind = request.kind || 'image';
    const kinds = requestedKind === 'failed' ? ['image', 'video'] : [requestedKind === 'video' ? 'video' : 'image'];
    let submitted = 0;
    const total = ensured.groupIds.length * kinds.length;

    for (const shotGroupId of ensured.groupIds) {
      const groupNodes = storyboardGroupNodeSet(ensured.nodes, { storyboardPackage, sourceNodeId, shotGroupId });
      const groupTasks = Array.isArray(storyboardPackage?.generationPlan?.shotTasks)
        ? storyboardPackage.generationPlan.shotTasks.filter((task) => (
          (task?.shotGroupId || task?.shotGroup || task?.groupId || 'ungrouped') === shotGroupId
        ))
        : [];
      for (const kind of kinds) {
        const targetNode = kind === 'video' ? groupNodes.video : groupNodes.image;
        if (!targetNode) continue;
        const hasFailedTask = groupTasks.some((task) => (
          task?.status === 'failed'
          || Boolean(kind === 'video' ? task?.videoError : task?.imageError)
        ));
        if (request.retryFailed && !targetNode.error && !hasFailedTask) continue;
        const prompt = targetNode.prompt
          || targetNode.promptDraft
          || targetNode.body
          || resolveShotGroupMediaPrompt(storyboardPackage, shotGroupId, kind)
          || '';
        if (!prompt.trim()) {
          canvasActions.updateNode(targetNode.id, {
            generating: false,
            progress: 0,
            error: kind === 'video' ? '缺少视频提示词，无法生成。' : '缺少图片提示词，无法生成。',
            tag: '失败',
          });
          continue;
        }
        const capability = kind === 'video' ? 'video.generate' : 'image.generate';
        const requestModel = storyboardRequestModelForKind(request, kind);
        const selectedModel = requestModel
          || await resolveGenerationModel(capability, {
            ...targetNode,
            ...storyboardRequestModelHintForKind(request, targetNode, kind),
          });
        if (!selectedModel) {
          canvasActions.updateNode(targetNode.id, {
            generating: false,
            progress: 0,
            error: kind === 'video' ? '请先在「模型配置」启用视频生成模型。' : '请先在「模型配置」启用图片生成模型。',
            tag: '失败',
          });
          continue;
        }
        const ratio = kind === 'video'
          ? (request.videoRatio || request.ratio || targetNode.ratio || targetNode.aspectRatio || '16:9')
          : (request.imageRatio || request.ratio || targetNode.ratio || targetNode.aspectRatio || '16:9');
        const resolution = kind === 'video'
          ? (request.videoResolution || request.resolution || targetNode.resolution)
          : (request.imageResolution || request.resolution || targetNode.resolution);
        const durationSeconds = storyboardMediaNumber(
          kind === 'video'
            ? (request.videoDurationSeconds ?? request.durationSeconds ?? request.duration ?? targetNode.durationSeconds ?? targetNode.duration)
            : (targetNode.durationSeconds ?? targetNode.duration),
          5,
        );
        const generationMode = kind === 'video'
          ? (request.videoMode || request.generationMode || request.mode || targetNode.generationMode || targetNode.mode || 'image-video')
          : undefined;
        const referenceMode = kind === 'video'
          ? (request.videoReferenceMode ?? request.referenceMode ?? targetNode.referenceMode ?? (generationMode === 'text-video' ? '' : undefined))
          : undefined;
        const audioOn = kind === 'video'
          ? (request.videoAudioOn ?? request.audioOn ?? targetNode.audioOn ?? true)
          : undefined;
        const startFrameUrl = kind === 'video' ? nodeMediaUrlForStoryboard(groupNodes.image, 'image') : '';
        if (kind === 'video' && generationMode !== 'text-video' && !startFrameUrl) {
          canvasActions.updateNode(targetNode.id, {
            generating: false,
            progress: 0,
            error: '请先生成该镜头组图片，再生成视频；或在输出设置里把视频模式切换为文生视频。',
            tag: '失败',
          });
          continue;
        }
        const queue = { index: submitted + 1, total, groupId: shotGroupId, kind };
        setWorkbenchTaskForNode(sourceNodeId, {
          id: 'storyboard-shotgroup-media',
          stage: kind === 'video' ? '提交镜头组视频生成…' : '提交镜头组图片生成…',
          progress: 5,
          queue,
        });
        canvasActions.updateNode(targetNode.id, {
          generating: true,
          progress: 8,
          error: null,
          tag: '生成',
          model: modelLabel(selectedModel),
          providerModelId: selectedModel.id,
          modelName: selectedModel.modelName,
          provider: selectedModel.providerId,
          prompt,
          promptDraft: prompt,
          ratio,
          aspectRatio: ratio,
          ...(resolution ? { resolution } : {}),
          ...(kind === 'video' ? {
            duration: durationSeconds,
            durationSeconds,
            generationMode,
            mode: generationMode,
            referenceMode,
            audioOn,
          } : {}),
        });
        const payload = {
          tab: kind,
          type: capability,
          capability,
          prompt,
          title: targetNode.title,
          model: modelLabel(selectedModel),
          modelId: selectedModel.id,
          providerModelId: selectedModel.id,
          modelName: selectedModel.modelName,
          provider: selectedModel.providerId,
          ratio,
          aspectRatio: ratio,
          resolution,
          duration: durationSeconds,
          durationSeconds,
          mode: generationMode,
          generationMode,
          referenceMode,
          audioOn,
          startFrameUrl,
          referenceAssets: Array.isArray(targetNode.referenceAssets) ? targetNode.referenceAssets : [],
          referenceImages: startFrameUrl ? [startFrameUrl] : [],
          _storyboard: 'storyboard-shotgroup-media',
          _storyboardMediaKind: kind,
          _storyboardSourceNodeId: sourceNodeId,
          _nodeId: sourceNodeId,
          _storyboardPackageId: storyboardPackage?.id || '',
          _shotGroupId: shotGroupId,
        };
        const body = buildGenerationPayload({
          payload,
          nodeId: targetNode.id,
          nodes: ensured.nodes,
          edges: ensured.edges,
          projectId,
          capability,
        });
        try {
          const job = await submitTrackedJob(targetNode.id, body);
          storyboardPackageActions.updateNodePackage(sourceNodeId, {
            projectId,
            updater: (pkg) => applyStoryboardMediaJobToPackage(pkg, {
              ...job,
              input: { ...(job?.input || {}), ...body },
            }),
          });
          submitted += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error || '提交生成任务失败');
          canvasActions.updateNode(targetNode.id, {
            generating: false,
            progress: 0,
            error: message,
            tag: '失败',
          });
          storyboardPackageActions.updateNodePackage(sourceNodeId, {
            projectId,
            updater: (pkg) => applyStoryboardMediaJobToPackage(pkg, {
              id: null,
              status: 'failed',
              error: message,
              input: body,
            }),
          });
        }
      }
    }

    if (!submitted) {
      setWorkbenchTaskForNode(sourceNodeId, {
        id: 'storyboard-shotgroup-media',
        error: request.retryFailed ? '没有找到可重试的失败媒体节点。' : '没有提交任何镜头组媒体生成任务。',
      });
    }
  }, [
    currentProjectId,
    ensureStoryboardMediaNodes,
    nodeMediaUrlForStoryboard,
    project?.id,
    resolveGenerationModel,
    setWorkbenchTaskForNode,
    storyboardGroupNodeSet,
    submitTrackedJob,
  ]);

  const deployStoryboardPackageToCanvas = React.useCallback((request = {}) => {
    const storyboardPackage = request.storyboardPackage;
    const shotTasks = Array.isArray(storyboardPackage?.generationPlan?.shotTasks)
      ? storyboardPackage.generationPlan.shotTasks
      : [];
    const nodeId = request.nodeId || storyboardPackage?.nodeId;
    const projectId = request.projectId || project?.id || currentProjectId || 'local-default';
    const mode = request.mode || 'canvas';
    const replacePrevious = request.replacePrevious === true;
    const deploymentInstanceId = replacePrevious
      ? ''
      : (request.deploymentInstanceId || makeStoryboardDeploymentInstanceId());

    if (!nodeId || !storyboardPackage) {
      setWorkbenchTaskForNode(nodeId, { id: 'storyboard-package-deploy', error: '缺少分镜生产包，无法部署。' });
      return;
    }
    if (!shotTasks.length) {
      setWorkbenchTaskForNode(nodeId, { id: 'storyboard-package-deploy', error: '生成计划里还没有可部署的镜头任务。' });
      return;
    }

    if (mode === 'virtual') {
      storyboardPackageActions.updateNodePackage(nodeId, {
        projectId,
        updater: (pkg) => ({
          generationPlan: {
            ...pkg.generationPlan,
            deployMode: 'virtual',
          },
        }),
      });
      setWorkbenchTaskForNode(nodeId, { id: 'storyboard-package-deploy', stage: '已切换为虚拟部署', progress: 100 });
      window.setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1200);
      return;
    }

    const currentNodes = readCanvasNodes();
    const sourceNode = currentNodes.find((node) => node.id === nodeId) || null;
    const deploymentGroupCount = request.scope === 'shot-group' && request.shotGroupId
      ? 1
      : summarizeShotGroupsForDeployment(storyboardPackage).length;
    const deploymentFallbackOrigin = request.origin || resolveStoryboardDeploymentListOrigin({
      sourceNode,
      groupCount: deploymentGroupCount,
      fallbackOrigin: getViewportCenter(),
    });
    const replacementOrigin = request.scope === 'shot-group' && request.shotGroupId
      ? resolveStoryboardDeploymentOrigin({
        nodes: currentNodes,
        productionPackage: storyboardPackage,
        sourceNodeId: nodeId,
        shotGroupId: request.shotGroupId,
        fallbackOrigin: deploymentFallbackOrigin,
      })
      : deploymentFallbackOrigin;
    const appendOrigin = request.origin
      ? deploymentFallbackOrigin
      : resolveStoryboardDeploymentOrigin({
        nodes: currentNodes,
        productionPackage: storyboardPackage,
        sourceNodeId: nodeId,
        shotGroupId: `__append_${deploymentInstanceId}`,
        fallbackOrigin: deploymentFallbackOrigin,
      });
    const deploymentOrigin = replacePrevious ? replacementOrigin : appendOrigin;
    const deployment = buildStoryboardCanvasDeployment(storyboardPackage, {
      scope: request.scope,
      shotGroupId: request.shotGroupId,
      includeVideo: request.includeVideo !== false,
      origin: deploymentOrigin,
      deploymentInstanceId,
    });
    const deployedVisibleNodes = deployment.nodes.filter((node) => node.type !== 'group');
    if (!deployedVisibleNodes.length) {
      setWorkbenchTaskForNode(nodeId, { id: 'storyboard-package-deploy', error: '没有匹配到可部署的分镜任务。' });
      return;
    }

    canvasUndoActions.run('deploy-storyboard', () => {
      canvasActions.setNodes((items) => mergeCanvasDeploymentIntoGraph({
        nodes: items,
        edges: [],
        deployment,
        replacePrevious,
      }).nodes);
      canvasActions.setEdges((items) => mergeCanvasDeploymentIntoGraph({
        nodes: [],
        edges: items,
        deployment,
        replacePrevious,
      }).edges);
      storyboardPackageActions.updateNodePackage(nodeId, {
        projectId,
        updater: (pkg) => ({
          generationPlan: applyCanvasDeploymentToGenerationPlan(pkg, deployment),
        }),
      });
      uiActions.setSelection(deployment.selectionIds);
      focusNodesInCanvas(deployedVisibleNodes);
    });
    setWorkbenchTaskForNode(nodeId, {
      id: 'storyboard-package-deploy',
      stage: request.scope === 'shot-group'
        ? `已部署分镜组 ${request.shotGroupId}`
        : `已部署 ${deployedVisibleNodes.length} 个画布节点`,
      progress: 100,
    });
    window.setTimeout(() => clearWorkbenchTaskForNode(nodeId), 1500);
  }, [clearWorkbenchTaskForNode, currentProjectId, focusNodesInCanvas, getViewportCenter, project?.id, readCanvasNodes, setWorkbenchTaskForNode]);

  // === Node operations ===
  const storyboardPackagePatchForCopiedNode = React.useCallback((node, nextNodeId) => {
    const rawPackage = node?.storyboardPackage || node?.state?.storyboardPackage || node?.settings?.storyboardPackage;
    if (!rawPackage || !nextNodeId) return {};
    const nextPackage = getNodeStoryboardPackage({
      ...node,
      id: nextNodeId,
      storyboardPackage: rawPackage,
    }, {
      projectId: currentProjectId || project?.id || rawPackage.projectId || 'local-default',
      nodeId: nextNodeId,
    });
    return {
      storyboardPackage: nextPackage,
      state: {
        ...(node?.state || {}),
        storyboardPackage: nextPackage,
      },
      ...(node?.settings?.storyboardPackage ? {
        settings: {
          ...(node.settings || {}),
          storyboardPackage: nextPackage,
        },
      } : {}),
    };
  }, [currentProjectId, project?.id]);

  const duplicateNode = React.useCallback((nodeId) => {
    canvasUndoActions.run('duplicate-node', () => {
      canvasActions.setNodes(ns => {
        const orig = ns.find(n => n.id === nodeId);
        if (!orig) return ns;
        const id = orig.id + '_d' + Math.random().toString(36).slice(2, 5);
        return [...ns, {
          ...orig,
          id,
          x: orig.x + 30,
          y: orig.y + 30,
          title: orig.title + ' · 副本',
          ...storyboardPackagePatchForCopiedNode(orig, id),
        }];
      });
    });
  }, [storyboardPackagePatchForCopiedNode]);

  const removeNodeIds = React.useCallback((ids) => {
    const idSet = new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean));
    if (!idSet.size) return;
    canvasUndoActions.run('delete-node', () => {
      canvasActions.setNodes(ns => ns
        .filter(n => !idSet.has(n.id))
        .map(n => {
          if (n.type !== 'group') return n;
          const memberIds = (Array.isArray(n.memberIds) ? n.memberIds : []).filter(id => !idSet.has(id));
          return { ...n, memberIds };
        })
        .filter(n => n.type !== 'group' || (Array.isArray(n.memberIds) && n.memberIds.length >= 2))
      );
      canvasActions.setEdges(es => es.filter(ed => !idSet.has(ed.from) && !idSet.has(ed.to)));
      uiActions.setSelection(selection.filter(id => !idSet.has(id)));
    });
  }, [selection]);

  const deleteNode = React.useCallback((nodeId) => {
    removeNodeIds([nodeId]);
  }, [removeNodeIds]);

  const collectNodesIntoStoryboardCollector = React.useCallback((collectorId, nodeIds) => {
    const idSet = new Set((Array.isArray(nodeIds) ? nodeIds : [nodeIds]).filter(Boolean));
    if (!collectorId || !idSet.size) return;
    canvasUndoActions.run('collect-storyboard', () => {
      let collectedCount = 0;
      canvasActions.setNodes(ns => {
        const collector = ns.find(n => n.id === collectorId && isStoryboardCollectorNode(n));
        if (!collector) return ns;
        const existingItems = storyboardCollectorItems(collector);
        const sourceNodes = ns.filter(n => idSet.has(n.id) && isStoryboardCollectableNode(n));
        const nextItems = [
          ...existingItems,
          ...sourceNodes
            .map((sourceNode, index) => createStoryboardCollectorItemFromNode(sourceNode, existingItems.length + index))
            .filter(Boolean),
        ].map((item, index) => ({ ...item, order: index }));
        collectedCount = nextItems.length - existingItems.length;
        if (collectedCount <= 0) return ns;
        return ns
          .filter(n => !idSet.has(n.id))
          .map(n => {
            if (n.id === collectorId) {
              return {
                ...n,
                items: nextItems,
                settings: {
                  ...(n.settings || {}),
                  items: nextItems,
                },
              };
            }
            if (n.type !== 'group') return n;
            const memberIds = (Array.isArray(n.memberIds) ? n.memberIds : []).filter(id => !idSet.has(id));
            return { ...n, memberIds };
          })
          .filter(n => n.type !== 'group' || (Array.isArray(n.memberIds) && n.memberIds.length >= 2));
      });
      if (collectedCount > 0) {
        canvasActions.setEdges(es => es.filter(edge => !idSet.has(edge.from) && !idSet.has(edge.to)));
        uiActions.setSelection([collectorId]);
        setCtx(null);
      }
    });
  }, []);

  const collectNodesIntoNearestStoryboardCollector = React.useCallback((nodeIds) => {
    const idSet = new Set((Array.isArray(nodeIds) ? nodeIds : [nodeIds]).filter(Boolean));
    const currentNodes = readCanvasNodes();
    const mediaNodes = currentNodes.filter(n => idSet.has(n.id) && isStoryboardCollectableNode(n));
    if (!mediaNodes.length) return;
    const collectors = currentNodes.filter(isStoryboardCollectorNode);
    const nearest = nearestStoryboardCollectorForNodes(collectors, mediaNodes);
    if (nearest) {
      collectNodesIntoStoryboardCollector(nearest.id, mediaNodes.map(n => n.id));
      return;
    }

    const minX = Math.min(...mediaNodes.map(n => n.x || 0));
    const minY = Math.min(...mediaNodes.map(n => n.y || 0));
    const maxX = Math.max(...mediaNodes.map(n => (n.x || 0) + (n.w || 0)));
    const collectorId = makeNodeId('storyCollector');
    const items = mediaNodes
      .map((sourceNode, index) => createStoryboardCollectorItemFromNode(sourceNode, index))
      .filter(Boolean);
    const collector = {
      id: collectorId,
      type: 'storyboard-collector-detail',
      x: maxX + 78,
      y: minY,
      w: 460,
      h: 360,
      title: '分镜收集细节',
      tag: '分镜收集',
      items,
      settings: { items },
    };
    canvasUndoActions.run('collect-storyboard', () => {
      canvasActions.setNodes(ns => [
        ...ns
          .filter(n => !idSet.has(n.id))
          .map(n => {
            if (n.type !== 'group') return n;
            const memberIds = (Array.isArray(n.memberIds) ? n.memberIds : []).filter(id => !idSet.has(id));
            return { ...n, memberIds };
          })
          .filter(n => n.type !== 'group' || (Array.isArray(n.memberIds) && n.memberIds.length >= 2)),
        collector,
      ]);
      canvasActions.setEdges(es => es.filter(edge => !idSet.has(edge.from) && !idSet.has(edge.to)));
      uiActions.setSelection([collectorId]);
      setCtx(null);
      focusNodesInCanvas([collector]);
    });
  }, [collectNodesIntoStoryboardCollector, focusNodesInCanvas, readCanvasNodes]);

  const restoreStoryboardCollectorItem = React.useCallback((collectorId, itemId, at = null) => {
    if (!collectorId || !itemId) return;
    let restoredNode = null;
    canvasUndoActions.run('restore-storyboard-item', () => {
      canvasActions.setNodes(ns => {
        const collector = ns.find(n => n.id === collectorId && isStoryboardCollectorNode(n));
        if (!collector) return ns;
        const items = storyboardCollectorItems(collector);
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex < 0) return ns;
        const item = items[itemIndex];
        restoredNode = createNodeFromStoryboardItem(item, collector, itemIndex, at);
        const nextItems = items
          .filter(existing => existing.id !== itemId)
          .map((existing, index) => ({ ...existing, order: index }));
        return [
          ...ns.map(n => {
            if (n.id !== collectorId) return n;
            return {
              ...n,
              items: nextItems,
              settings: {
                ...(n.settings || {}),
                items: nextItems,
              },
            };
          }),
          restoredNode,
        ];
      });
      if (restoredNode) {
        uiActions.setSelection([restoredNode.id]);
        setCtx(null);
      }
    });
  }, []);

  const duplicateSelectedNodes = React.useCallback(() => {
    const currentNodes = readCanvasNodes();
    const selectedNodes = currentNodes.filter(n => selection.includes(n.id) && isCanvasGroupableNode(n));
    if (!selectedNodes.length) return;
    const createdAt = Date.now().toString(36);
    const copies = selectedNodes.map((node, index) => {
      const id = `${node.id}_d${createdAt}_${index}${Math.random().toString(36).slice(2, 4)}`;
      const { groupId, ...rest } = node;
      return {
        ...rest,
        id,
        x: node.x + 30,
        y: node.y + 30,
        title: node.title ? `${node.title} · 副本` : '副本',
        ...storyboardPackagePatchForCopiedNode(node, id),
      };
    });
    canvasUndoActions.run('duplicate-node', () => {
      canvasActions.setNodes(ns => [...ns, ...copies]);
      uiActions.setSelection(copies.map(node => node.id));
    });
  }, [readCanvasNodes, selection, storyboardPackagePatchForCopiedNode]);

  const ungroupNode = React.useCallback((groupId) => {
    if (!groupId) return;
    canvasUndoActions.run('ungroup-node', () => {
      let memberIds = [];
      canvasActions.setNodes(ns => {
        const group = ns.find(n => n.id === groupId && n.type === 'group');
        memberIds = Array.isArray(group?.memberIds) ? group.memberIds : [];
        const memberSet = new Set(memberIds);
        return ns
          .filter(n => n.id !== groupId)
          .map(n => {
            if (!memberSet.has(n.id)) return n;
            const { groupId: _groupId, ...rest } = n;
            return rest;
          });
      });
      uiActions.setSelection(memberIds);
      setCtx(null);
    });
  }, []);

  const createGroupFromNodeIds = React.useCallback((memberIds, requestedName) => {
    const ids = Array.from(new Set((memberIds || []).filter(Boolean)));
    const currentNodes = readCanvasNodes();
    const selectedNodes = currentNodes.filter(n => ids.includes(n.id) && isCanvasGroupableNode(n));
    if (selectedNodes.length < 2) return;
    const cleanMemberIds = selectedNodes.map(n => n.id);
    const memberSet = new Set(cleanMemberIds);
    const existing = currentNodes.find(n => {
      if (n.type !== 'group' || !Array.isArray(n.memberIds)) return false;
      return n.memberIds.length === cleanMemberIds.length && n.memberIds.every(id => memberSet.has(id));
    });
    if (existing) {
      uiActions.setSelection(cleanMemberIds);
      return;
    }
    const fallbackName = `组合 ${currentNodes.filter(n => n.type === 'group').length + 1}`;
    const groupName = String(requestedName || '').trim() || fallbackName;

    const pad = 18;
    const minX = Math.min(...selectedNodes.map(n => n.x)) - pad;
    const minY = Math.min(...selectedNodes.map(n => n.y)) - pad;
    const maxX = Math.max(...selectedNodes.map(n => n.x + n.w)) + pad;
    const maxY = Math.max(...selectedNodes.map(n => n.y + n.h)) + pad;
    const groupId = `group_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const groupNode = {
      id: groupId,
      type: 'group',
      title: groupName,
      x: minX,
      y: minY,
      w: Math.max(220, Math.round(maxX - minX)),
      h: Math.max(140, Math.round(maxY - minY)),
      memberIds: cleanMemberIds,
      createdAt: new Date().toISOString(),
    };

    canvasUndoActions.run('group-node', () => {
      canvasActions.setNodes(ns => {
        const cleaned = ns
          .map(n => {
            if (n.type === 'group') {
              const kept = (Array.isArray(n.memberIds) ? n.memberIds : []).filter(id => !memberSet.has(id));
              return { ...n, memberIds: kept };
            }
            if (memberSet.has(n.id)) return { ...n, groupId };
            return n;
          })
          .filter(n => n.type !== 'group' || (Array.isArray(n.memberIds) && n.memberIds.length >= 2));
        return [...cleaned, groupNode];
      });
      uiActions.setSelection(cleanMemberIds);
    });
  }, [readCanvasNodes]);

  const requestGroupSelectedNodes = React.useCallback(() => {
    const currentNodes = readCanvasNodes();
    const selectedNodes = currentNodes.filter(n => selection.includes(n.id) && isCanvasGroupableNode(n));
    if (selectedNodes.length < 2) return;
    const memberIds = selectedNodes.map(n => n.id);
    const memberSet = new Set(memberIds);
    const existing = currentNodes.find(n => (
      n.type === 'group' &&
      Array.isArray(n.memberIds) &&
      n.memberIds.length === memberIds.length &&
      n.memberIds.every(id => memberSet.has(id))
    ));
    if (existing) {
      uiActions.setSelection(memberIds);
      return;
    }
    const fallbackName = `组合 ${currentNodes.filter(n => n.type === 'group').length + 1}`;
    setCtx(null);
    setPendingGroup({ memberIds, fallbackName, count: memberIds.length });
    setGroupNameDraft(fallbackName);
  }, [readCanvasNodes, selection]);

  const closeGroupNameDialog = React.useCallback(() => {
    setPendingGroup(null);
    setGroupNameDraft('');
  }, []);

  const confirmGroupNameDialog = React.useCallback((e) => {
    e?.preventDefault?.();
    if (!pendingGroup?.memberIds?.length) return;
    createGroupFromNodeIds(pendingGroup.memberIds, groupNameDraft || pendingGroup.fallbackName);
    closeGroupNameDialog();
  }, [closeGroupNameDialog, createGroupFromNodeIds, groupNameDraft, pendingGroup]);

  const openBackgroundPanelDialog = React.useCallback((panel) => {
    if (!panel?.id) return;
    setCtx(null);
    setPendingBackgroundPanel({ id: panel.id });
    setBackgroundPanelDraft({
      title: panel.title || '背景板',
      color: panel.color || BACKGROUND_PANEL_COLOR_OPTIONS[0],
    });
  }, []);

  const closeBackgroundPanelDialog = React.useCallback(() => {
    setPendingBackgroundPanel(null);
    setBackgroundPanelDraft({ title: '', color: BACKGROUND_PANEL_COLOR_OPTIONS[0] });
  }, []);

  const confirmBackgroundPanelDialog = React.useCallback((e) => {
    e?.preventDefault?.();
    const panelId = pendingBackgroundPanel?.id;
    if (!panelId) return;
    const title = String(backgroundPanelDraft.title || '').trim() || '背景板';
    const color = String(backgroundPanelDraft.color || BACKGROUND_PANEL_COLOR_OPTIONS[0]).trim() || BACKGROUND_PANEL_COLOR_OPTIONS[0];
    canvasUndoActions.run('edit-background-panel', () => {
      canvasActions.updateNode(panelId, { title, color });
      closeBackgroundPanelDialog();
    });
  }, [backgroundPanelDraft.color, backgroundPanelDraft.title, closeBackgroundPanelDialog, pendingBackgroundPanel]);

  const downloadNode = React.useCallback((node) => {
    const asset = getNodeAssetPayload(node);
    if (!asset) return;
    triggerDownload(asset, asset.text, asset.kind === 'script' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8');
  }, []);

  const previewNode = React.useCallback((node) => {
    const asset = getNodeAssetPayload(node);
    if (!asset) return;
    uiActions.openModal({ kind: 'preview', item: asset });
  }, []);

  const openRenameNodeDialog = React.useCallback((node) => {
    if (!node?.id) return;
    setPendingRenameNode(node);
  }, []);

  const closeRenameNodeDialog = React.useCallback(() => {
    setPendingRenameNode(null);
  }, []);

  const confirmRenameNodeDialog = React.useCallback((nodeId, name) => {
    const title = String(name || '').trim();
    if (!nodeId || !title) return;
    canvasUndoActions.run('rename-node', () => {
      canvasActions.updateNode(nodeId, { title });
      closeRenameNodeDialog();
    });
  }, [closeRenameNodeDialog]);

  const downloadSelectedNodes = React.useCallback(() => {
    const currentNodes = readCanvasNodes();
    const currentEdges = readCanvasEdges();
    const sel = currentNodes.filter(n => selection.includes(n.id));
    if (!sel.length) return;
    const selIds = new Set(sel.map(n => n.id));
    triggerDownload(
      { filename: `${safeFileName(project?.name || 'selection', 'selection')}.json` },
      JSON.stringify({ version: 2, project, exportedAt: new Date().toISOString(), nodes: sel, edges: currentEdges.filter(e => selIds.has(e.from) && selIds.has(e.to)) }, null, 2),
      'application/json;charset=utf-8'
    );
  }, [project, readCanvasEdges, readCanvasNodes, selection]);

  // === File upload ===
  const getUploadBasePosition = React.useCallback((req = {}) => {
    const v = canvasRef.current?.get?.();
    const el = document.querySelector('.canvas-root');
    const r = el?.getBoundingClientRect();
    const vx = v ? v.x : -60; const vy = v ? v.y : -60;
    const vw = v && r ? r.width / v.s : 1200; const vh = v && r ? r.height / v.s : 700;
    return req.at || { x: vx + vw / 2 - 160, y: vy + vh / 2 - 110 };
  }, []);

  const applyImportedAssets = React.useCallback((records, request) => {
    if (!records.length) return;
    const req = request || uploadRequestRef.current || {};
    const targetProjectId = req.targetProjectId || project?.id || currentProjectId || 'local-default';
    const libraryScope = req.libraryScope || (targetProjectId === GLOBAL_ASSET_PROJECT_ID ? 'global' : 'project');
    const loaded = records.map((asset) => {
      const type = inferNodeTypeFromAsset(asset, req.forcedType);
      const src = asset.src || asset.url || asset.assetUrl || '';
      const title = asset.title || asset.name || asset.filename || '本地素材';
      return { asset, src, title, type };
    }).filter((item) => item.src);

    if (req.libraryOnly) {
      libraryActions.recordAssets(loaded.map(({ asset, src, title, type }) => withAssetScope({
        ...asset,
        kind: type,
        src,
        title,
        nodeId: req.nodeId,
        source: asset.source || 'library-import',
        inLibrary: true,
        libraryAsset: true,
      }, targetProjectId, libraryScope)));
    }

    if (req.libraryOnly) return;
    const basePos = getUploadBasePosition(req);

    canvasUndoActions.run('import-assets', () => {
      canvasActions.setNodes(ns => {
        const ti = req.nodeId ? ns.findIndex(n => n.id === req.nodeId) : -1;
        const next = [...ns]; let start = 0;
        if (ti >= 0 && loaded.length === 1) {
          const { asset, src, title, type } = loaded[0];
          const prev = next[ti];
          const common = { title, tag: '上传', generating: false, progress: 0, assetId: asset.id, assetPath: asset.path };
          const patch = type === 'image' ? { ...common, type: 'image', src }
            : type === 'video' ? { ...common, type: 'video', videoSrc: src, poster: null, duration: '本地' }
            : { ...common, type: 'audio', audioSrc: src, waveform: true, duration: '本地' };
          next[ti] = { ...prev, ...patch };
          uiActions.setSelection([prev.id]); start = 1;
        }
        const created = loaded.slice(start).map(({ asset, src, title, type }, idx) => {
          const id = 'u' + Date.now().toString(36) + '_' + idx + Math.random().toString(36).slice(2, 4);
          const common = {
            id, type,
            x: basePos.x + idx * 36, y: basePos.y + idx * 36,
            title,
            tag: '上传',
            assetId: asset.id,
            assetPath: asset.path,
          };
          if (type === 'image') return { ...common, w: 320, h: 300, src };
          if (type === 'video') return { ...common, w: 340, h: 320, videoSrc: src, duration: '本地', poster: null };
          if (type === 'audio') return { ...common, w: 300, h: 220, audioSrc: src, waveform: true, duration: '本地' };
          return { ...common, w: 320, h: 280, body: title };
        });
        if (created.length) uiActions.setSelection(created.map(n => n.id));
        return [...next, ...created];
      });
    });
  }, [currentProjectId, getUploadBasePosition, project?.id]);

  const requestUpload = React.useCallback((nodeId, forcedType, at) => {
    const req = { nodeId, forcedType, at };
    if (AssetStore.available()) {
      AssetStore.pickAndImport(project?.id, {
        multiple: true,
        kind: forcedType,
        deferCopy: true,
        meta: {
          source: 'canvas-upload',
          inLibrary: false,
          libraryAsset: false,
          scope: 'project',
          projectId: project?.id || currentProjectId || 'local-default',
          project_id: project?.id || currentProjectId || 'local-default',
        },
      }).then((records) => applyImportedAssets(records, req))
        .catch((err) => console.error('Import failed', err));
      return;
    }
    uploadRequestRef.current = req;
    if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); }
  }, [applyImportedAssets, currentProjectId, project?.id]);

  const requestLibraryImport = React.useCallback((options = {}) => {
    const targetProjectId = options.targetProjectId || options.projectId || project?.id || currentProjectId || 'local-default';
    const req = {
      libraryOnly: true,
      targetProjectId,
      libraryScope: options.scope || (targetProjectId === GLOBAL_ASSET_PROJECT_ID ? 'global' : 'project'),
    };
    if (AssetStore.available()) {
      return AssetStore.pickAndImport(targetProjectId, {
        multiple: true,
        kind: options.kind,
        meta: {
          source: 'library-import',
          inLibrary: true,
          libraryAsset: true,
          scope: req.libraryScope,
          ...(options.meta || {}),
        },
      })
        .then((records) => applyImportedAssets(records, req))
        .catch((err) => console.error('Import failed', err));
    }
    return new Promise((resolve, reject) => {
      uploadRequestRef.current = { ...req, resolve, reject };
      if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); }
    });
  }, [applyImportedAssets, currentProjectId, project?.id]);

  const applyUploadedFiles = React.useCallback(async (files, request) => {
    if (!files.length) return;
    const req = request || uploadRequestRef.current || {};
    const targetProjectId = req.targetProjectId || project?.id || currentProjectId || 'local-default';
    const libraryScope = req.libraryScope || (targetProjectId === GLOBAL_ASSET_PROJECT_ID ? 'global' : 'project');

    const loaded = await Promise.all(files.map(async (file) => {
      const type = inferNodeTypeFromFile(file, req.forcedType);
      const title = file.name.replace(/\.[^.]+$/, '') || file.name;
      const meta = {
        source: req.libraryOnly ? 'library-upload' : 'canvas-upload',
        inLibrary: Boolean(req.libraryOnly),
        libraryAsset: Boolean(req.libraryOnly),
        scope: libraryScope,
        projectId: targetProjectId,
        project_id: targetProjectId,
      };
      let persisted = await importLocalFileAsAsset(file, targetProjectId, type, meta);
      let dataUrl = '';
      if (!persisted) {
        dataUrl = await readFileAsDataUrl(file);
      }
      if (!persisted && AssetStore.writeAvailable()) {
        try {
          persisted = await AssetStore.writeDataUrl(targetProjectId, {
            filename: file.name,
            dataUrl,
            kind: type,
            mime: file.type,
            meta,
          });
        } catch (error) {
          console.warn('Upload asset persistence failed; using in-memory preview', error);
        }
      }
      const src = persisted?.src || persisted?.url || dataUrl;
      const asset = withAssetScope({
        ...makeAssetRecord({ kind: type, src, title, nodeId: req.nodeId, source: persisted ? 'upload-local' : 'upload' }),
        ...(persisted || {}),
        kind: persisted?.kind || type,
        src,
        title: persisted?.title || title,
        nodeId: req.nodeId,
        source: req.libraryOnly ? 'library-upload' : (persisted ? 'upload-local' : 'upload'),
        inLibrary: Boolean(req.libraryOnly),
        libraryAsset: Boolean(req.libraryOnly),
      }, targetProjectId, libraryScope);
      return { file, dataUrl, type, src, title, asset };
    }));
    if (req.libraryOnly) libraryActions.recordAssets(loaded.map(item => item.asset));

    if (req.libraryOnly) return loaded;
    const basePos = getUploadBasePosition(req);

    canvasUndoActions.run('upload-files', () => {
      canvasActions.setNodes(ns => {
        const ti = req.nodeId ? ns.findIndex(n => n.id === req.nodeId) : -1;
        const next = [...ns]; let start = 0;
        if (ti >= 0 && loaded.length === 1) {
          const { asset, src, title, type } = loaded[0];
          const prev = next[ti];
          const patch = type === 'image' ? { type: 'image', src, title: title || prev.title, tag: '上传', assetId: asset.id, assetPath: asset.path, generating: false, progress: 0 }
            : type === 'video' ? { type: 'video', videoSrc: src, poster: null, title: title || prev.title, tag: '上传', assetId: asset.id, assetPath: asset.path, duration: '本地', generating: false, progress: 0 }
            : { type: 'audio', audioSrc: src, waveform: true, title: title || prev.title, tag: '上传', assetId: asset.id, assetPath: asset.path, duration: '本地', generating: false, progress: 0 };
          next[ti] = { ...prev, ...patch };
          uiActions.setSelection([prev.id]); start = 1;
        }
        const created = loaded.slice(start).map(({ file, asset, src, title, type }, idx) => {
          const id = 'u' + Date.now().toString(36) + '_' + idx + Math.random().toString(36).slice(2, 4);
          const common = { id, type, x: basePos.x + idx * 36, y: basePos.y + idx * 36, title: title || file.name || '本地素材', tag: '上传', assetId: asset.id, assetPath: asset.path };
          if (type === 'image') return { ...common, w: 320, h: 300, src };
          if (type === 'video') return { ...common, w: 340, h: 320, videoSrc: src, duration: '本地', poster: null };
          if (type === 'audio') return { ...common, w: 300, h: 220, audioSrc: src, waveform: true, duration: '本地' };
          return { ...common, w: 320, h: 280, body: file.name };
        });
        if (created.length) uiActions.setSelection(created.map(n => n.id));
        return [...next, ...created];
      });
    });
    return loaded;
  }, [currentProjectId, getUploadBasePosition, project?.id]);

  const onUploadInputChange = React.useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const req = uploadRequestRef.current; uploadRequestRef.current = null;
    applyUploadedFiles(files, req)
      .then((result) => req?.resolve?.(result))
      .catch((err) => {
        req?.reject?.(err);
        console.error('Upload failed', err);
      });
  }, [applyUploadedFiles]);

  /* Local-folder browser → canvas insert.
   * Two paths:
   *   (a) Electron file (has .path): import via backend → stable asset URL → create node
   *   (b) Browser File object (webkitdirectory fallback): reuse applyUploadedFiles (data URL)
   */
  const insertLocalFile = React.useCallback(async (file) => {
    /* (b) Browser fallback */
    if (!file?.path) {
      if (file instanceof File) {
        return applyUploadedFiles([file], { at: undefined });
      }
      console.warn('insertLocalFile: unsupported file shape', file);
      return;
    }
    /* (a) Electron path → backend import */
    const projectId = project?.id || 'local-default';
    const kind = file.kind || (
      file.mime?.startsWith('image/') ? 'image' :
      file.mime?.startsWith('video/') ? 'video' :
      file.mime?.startsWith('audio/') ? 'audio' : 'image'
    );
    let record;
    try {
      record = await AssetStore.importFile(file.path, projectId, kind, {
        source: 'canvas-upload',
        inLibrary: false,
        libraryAsset: false,
        scope: 'project',
        projectId,
        project_id: projectId,
      });
    } catch (error) {
      console.error('insertLocalFile: backend import failed', error);
      return;
    }
    if (!record) {
      /* Backend not available — fall back to file's libai-asset:// URL (works in Electron). */
      record = { kind, src: file.assetUrl, url: file.assetUrl, mime: file.mime };
    }
    const nodeType = inferNodeTypeFromAsset(record, kind);
    const url = record.src || record.url;
    libraryActions.recordAssets([withProjectAssetScope(makeAssetRecord({
      kind: nodeType,
      src: url,
      title: file.name.replace(/\.[^.]+$/, '') || file.name,
      source: 'local-folder',
    }), projectId)]);
    const pos = getViewportCenter();
    const id = 'lf' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 4);
    const baseTitle = file.name.replace(/\.[^.]+$/, '') || '本地素材';
    canvasUndoActions.run('insert-local-file', () => {
      canvasActions.setNodes(ns => {
        const created = nodeType === 'image'
          ? { id, type: 'image', x: pos.x, y: pos.y, w: 320, h: 300, title: baseTitle, src: url, tag: '本地' }
          : nodeType === 'video'
          ? { id, type: 'video', x: pos.x, y: pos.y, w: 340, h: 320, title: baseTitle, videoSrc: url, poster: null, duration: '本地', tag: '本地' }
          : nodeType === 'audio'
          ? { id, type: 'audio', x: pos.x, y: pos.y, w: 300, h: 220, title: baseTitle, audioSrc: url, waveform: true, duration: '本地', tag: '本地' }
          : { id, type: 'image', x: pos.x, y: pos.y, w: 320, h: 300, title: baseTitle, src: url, tag: '本地' };
        return [...ns, created];
      });
      uiActions.setSelection([id]);
    });
  }, [project, applyUploadedFiles, getViewportCenter]);

  const insertUpscaleAsset = React.useCallback((asset) => {
    if (!asset) return;
    const src = asset.src || asset.url || asset.assetUrl;
    if (!src) return;
    const pos = getViewportCenter();
    const id = 'upimg' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 4);
    const title = asset.title || '高清放大结果';
    libraryActions.recordAssets([withProjectAssetScope({
      ...asset,
      id: asset.id || id,
      kind: 'image',
      src,
      title,
      source: asset.source || 'upscale',
      nodeId: id,
    }, project?.id || currentProjectId || 'local-default')]);
    canvasUndoActions.run('insert-upscale-asset', () => {
      canvasActions.setNodes(ns => [
        ...ns,
        {
          id,
          type: 'image',
          x: pos.x,
          y: pos.y,
          w: 360,
          h: 280,
          title,
          src,
          tag: '高清',
          assetId: asset.id,
          assetPath: asset.path,
          model: asset.engine || '本地高清放大',
        },
      ]);
      uiActions.setSelection([id]);
    });
  }, [currentProjectId, getViewportCenter, project?.id]);

  const openSaveAssetDialog = React.useCallback((node) => {
    if (!node?.id) return;
    uiActions.openModal({ kind: 'saveasset', nodeId: node.id });
  }, []);

  const insertAssetToCanvas = React.useCallback((asset) => {
    if (!asset) return;
    const src = asset.src || asset.url || asset.assetUrl;
    const rawKind = String(asset.kind || '').toLowerCase();
    const fallbackType = rawKind === 'script'
      ? 'script'
      : rawKind === 'text' || (!src && (asset.text || asset.prompt || asset.title))
      ? 'text'
      : 'image';
    const nodeType = inferNodeTypeFromAsset(asset, fallbackType);
    const pos = getViewportCenter();
    const id = 'lib' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5);
    const title = asset.title || asset.name || asset.filename || '素材';
    const common = {
      id,
      type: nodeType,
      x: pos.x,
      y: pos.y,
      title,
      tag: '资产',
      assetId: asset.id || asset.assetId,
      assetPath: asset.path,
    };
    const created = nodeType === 'image'
      ? { ...common, w: 320, h: 300, src }
      : nodeType === 'video'
      ? { ...common, w: 340, h: 320, videoSrc: src, poster: asset.poster || asset.posterUrl || null, duration: asset.duration || '本地' }
      : nodeType === 'audio'
      ? { ...common, w: 300, h: 220, audioSrc: src, waveform: true, duration: asset.duration || '本地' }
      : nodeType === 'script'
      ? { ...common, w: 360, h: 280, shots: Array.isArray(asset.shots) ? asset.shots : [{ n: 1, shot: '素材', desc: asset.prompt || title, dur: '3s' }] }
      : { ...common, type: 'text', w: 340, h: 220, body: asset.text || asset.prompt || title };
    canvasUndoActions.run('insert-library-asset', () => {
      canvasActions.setNodes(ns => [...ns, created]);
      uiActions.setSelection([id]);
      setRailPop(null);
      openCanvasView();
    });
  }, [getViewportCenter, openCanvasView]);

  const openSubjectLibraryOverlay = React.useCallback((request = {}) => {
    const props = request && typeof request === 'object' ? request : {};
    uiActions.openOverlayModal({
      ...props,
      kind: 'subject',
      onUseAsset: insertAssetToCanvas,
    });
  }, [insertAssetToCanvas]);

  const insertHistoryItemsToCanvas = React.useCallback((targets = []) => {
    const list = Array.isArray(targets) ? targets : [targets];
    const usable = list.filter((item) => historyMediaSrc(item) || historyKindOf(item) === 'text');
    if (!usable.length) return;
    const currentNodes = readCanvasNodes();
    const position = getViewportCenter();
    const created = usable.map((item, index) => createCanvasNodeFromHistoryItem(item, {
      index,
      nodes: [...currentNodes],
      position,
    }));
    canvasUndoActions.run('insert-history-items', () => {
      canvasActions.setNodes((items) => [...items, ...created]);
      uiActions.setSelection(created.map((node) => node.id));
      setRailPop(null);
      openCanvasView();
    });
  }, [getViewportCenter, openCanvasView, readCanvasNodes]);

  const insertHistoryItemToCanvas = React.useCallback((item) => {
    insertHistoryItemsToCanvas([item]);
  }, [insertHistoryItemsToCanvas]);

  const openCanvasHistoryItem = React.useCallback((item) => {
    if (!item) return;
    const currentNodes = readCanvasNodes();
    const target = item.nodeId
      ? currentNodes.find(n => n.id === item.nodeId)
      : currentNodes.find(n => (
        (n.type === 'image' && n.src && n.src === item.src)
        || (n.type === 'video' && ((n.videoSrc && n.videoSrc === item.src) || (n.poster && n.poster === item.src)))
    ));
    if (target) {
      uiActions.setSelection([target.id]);
      openCanvasView();
      window.setTimeout(() => focusNodesInCanvas([target]), 0);
      return;
    }
    insertAssetToCanvas(item);
  }, [focusNodesInCanvas, insertAssetToCanvas, openCanvasView, readCanvasNodes]);

  const saveUpscaleAssetToSubject = React.useCallback((asset) => {
    if (!asset) return;
    const src = asset.src || asset.url || asset.assetUrl;
    if (!src) return;
    const title = asset.title || '高清放大结果';
    libraryActions.recordAssets([withProjectAssetScope({
      ...makeAssetRecord({ kind: 'image', src, title, source: 'subject-upscale' }),
      ...asset,
      kind: 'image',
      src,
      url: asset.url || src,
      title,
      source: 'subject-upscale',
      imageCategory: asset.imageCategory || 'person',
      category: asset.category || 'person',
      tags: Array.from(new Set([...(asset.tags || []), '高清放大', '本地放大'])),
    }, project?.id || currentProjectId || 'local-default')]);
  }, [currentProjectId, project?.id]);

  const writeImageToolAsset = React.useCallback(async (dataUrl, title, meta = {}) => {
    const projectId = project?.id || currentProjectId || 'local-default';
    try {
      const record = await AssetStore.writeDataUrl(projectId, {
        dataUrl,
        filename: `${safeFileName(title, 'image-tool')}.png`,
        kind: 'image',
        mime: 'image/png',
        meta: { source: 'canvas-image-tool', ...meta },
      });
      if (record?.src || record?.url) {
        libraryActions.recordAssets([withProjectAssetScope({
          ...makeAssetRecord({
            kind: 'image',
            src: record.src || record.url,
            title,
            source: 'canvas-image-tool',
          }),
          ...record,
          kind: 'image',
          src: record.src || record.url,
          url: record.url || record.src,
          title,
          source: 'canvas-image-tool',
        }, projectId)]);
        return {
          src: record.src || record.url,
          assetId: record.id,
          assetPath: record.path,
        };
      }
    } catch (error) {
      console.warn('writeImageToolAsset fallback to dataUrl', error);
    }
    return { src: dataUrl };
  }, [currentProjectId, project?.id]);

  const createImageToolResultNodes = React.useCallback(async (sourceNode, payload = {}) => {
    if (!sourceNode) return;
    const list = Array.isArray(payload.results) ? payload.results : [payload];
    const results = list.filter((item) => {
      if (!item) return false;
      if (item.dataUrl) return true;
      return Boolean(item.src || item.url || item.assetUrl || item.assetId || item.id);
    });
    if (!results.length) return;
    const projectId = project?.id || currentProjectId || 'local-default';
    const label = payload.label || results[0]?.label || '图片处理';
    const cols = Math.max(1, Math.min(payload.cols || Math.min(results.length, 3), results.length));
    const gap = 20;
    const created = [];
    for (let index = 0; index < results.length; index += 1) {
      const item = results[index];
      const row = Math.floor(index / cols);
      const col = index % cols;
      const aspect = item.width && item.height ? item.height / item.width : 0.75;
      const nodeW = Math.max(220, Math.min(360, item.width || 280));
      const nodeH = Math.max(160, Math.min(320, Math.round(nodeW * aspect)));
      const title = `${sourceNode.title || '图片'} · ${item.label || label}`;
      let saved = null;
      if (item.dataUrl) {
        saved = await writeImageToolAsset(item.dataUrl, title, {
          sourceNodeId: sourceNode.id,
          tool: label,
          width: item.width,
          height: item.height,
        });
      } else {
        const source = {
          ...item,
          id: item.assetId || item.id,
          path: item.assetPath || item.path,
          assetUrl: item.assetUrl || item.url,
        };
        const src = makeAssetUrl(source) || item.src || item.url || item.assetUrl;
        saved = {
          src,
          assetId: item.assetId || item.id,
          assetPath: item.assetPath || item.path,
        };
        if (src) {
          libraryActions.recordAssets([withProjectAssetScope({
            ...makeAssetRecord({
              kind: 'image',
              src,
              title,
              source: item.source || 'canvas-image-tool',
            }),
            ...item,
            id: item.assetId || item.id,
            kind: 'image',
            src,
            url: item.url || src,
            assetUrl: item.assetUrl || item.url || src,
            path: item.assetPath || item.path,
            title,
            source: item.source || 'canvas-image-tool',
          }, projectId)]);
        }
      }
      if (!saved?.src) continue;
      created.push({
        id: makeNodeId('imgtool'),
        type: 'image',
        x: sourceNode.x + sourceNode.w + 78 + col * (nodeW + gap),
        y: sourceNode.y + row * (nodeH + gap),
        w: nodeW,
        h: nodeH,
        title,
        tag: label,
        src: saved.src,
        assetId: saved.assetId,
        assetPath: saved.assetPath,
        model: item.engine || item.model || '本地图片工具',
      });
    }
    if (!created.length) return;
    const createdEdges = created.map((node) => ({ id: `eit_${sourceNode.id}_${node.id}`, from: sourceNode.id, to: node.id }));
    canvasUndoActions.run('create-image-tool-results', () => {
      canvasActions.setNodes((items) => [...items, ...created]);
      canvasActions.setEdges((items) => [...items, ...createdEdges]);
      uiActions.setSelection(created.map((node) => node.id));
      focusNodesInCanvas(created);
      uiActions.closeModal();
    });
  }, [currentProjectId, focusNodesInCanvas, project?.id, writeImageToolAsset]);

  // === addNode ===
  const addNode = React.useCallback((type, at) => {
    const pos = at || getViewportCenter();
    if (type === 'vr720-gen') {
      const controlId = makeNodeId('panoGen');
      const viewerId = makeNodeId('panoView');
      const control = {
        id: controlId,
        type: 'vr720-gen',
        x: pos.x,
        y: pos.y,
        w: 380,
        h: 330,
        title: '720空间场景',
        tag: '720控制',
        settings: createVR720GenDefaults({ connectedViewerNodeId: viewerId }),
      };
      const viewer = {
        id: viewerId,
        type: 'panorama-viewer',
        x: pos.x + 460,
        y: pos.y,
        w: 520,
        h: 360,
        title: '720全景预览',
        tag: '720预览',
        settings: createPanoramaViewerDefaults(),
      };
      canvasUndoActions.run('create-node', () => {
        canvasActions.setNodes(ns => [...ns, control, viewer]);
        canvasActions.setEdges(es => [...es, { id: `e720_${controlId}_${viewerId}`, from: controlId, to: viewerId }]);
        uiActions.setSelection([controlId]);
        setCtx(null);
        focusNodesInCanvas([control, viewer]);
      });
      return;
    }

    const id = makeNodeId('n');
    const titles = { text: '文本节点', image: '图片节点', video: '视频节点', audio: '音频节点', script: '脚本节点', 'panorama-viewer': '720全景预览', 'asset-gen': '资产生成', 'prompt-runner': '提示词调用', 'jianying-export': '剪映导出', 'storyboard-collector-detail': '分镜收集细节', 'director-stage': '全景环绕控制' };
    const extras = {
      text: { body: '', h: 280 },
      image: { src: null, h: 260, w: 392 },
      video: { poster: null, duration: '00:00', h: 350, w: 620 },
      audio: { duration: '00:00', h: 280 },
      script: { shots: [{ n: 1, shot: '中景', desc: '（待填写）', dur: '3s' }], h: 360, w: 380 },
      'panorama-viewer': { w: 520, h: 360, tag: '720预览', settings: createPanoramaViewerDefaults() },
      'asset-gen': {
        w: 420,
        h: 480,
        prompt: '',
        assetStyle: 'realistic_cinematic',
        assetType: 'character_3view',
        ratio: '1:1',
        resolution: '2K',
        imageUrl: '',
        imageUrls: [],
        progress: 0,
      },
      'prompt-runner': {
        w: 460,
        h: 540,
        tag: '提示词',
        templateId: '',
        templateTitle: '',
        templateDescription: '',
        systemPrompt: '',
        userPrompt: '',
        manualInput: '',
        output: '',
        body: '',
        progress: 0,
      },
      'jianying-export': {
        w: 360,
        h: 320,
        tag: '导出',
        settings: { draftName: '分镜草稿' },
      },
      'storyboard-collector-detail': {
        w: 460,
        h: 360,
        tag: '分镜收集',
        items: [],
        settings: { items: [] },
      },
      'director-stage': {
        w: 320,
        h: 260,
        tag: '3D 导演',
        settings: createDirectorStageDefaultSettings(),
      },
    };
    const nextNode = applyGenerationParameterDefaults(
      { id, type, x: pos.x, y: pos.y, w: 320, h: 220, title: titles[type], ...extras[type] },
      generationParameterDefaultsRef.current,
    );
    canvasUndoActions.run('create-node', () => {
      canvasActions.setNodes(ns => [...ns, nextNode]);
      uiActions.setSelection([id]);
      setCtx(null);
    });
  }, [focusNodesInCanvas, getViewportCenter]);

  const createPanoramaNodeFromImage = React.useCallback((node) => {
    const source = nodeImageReference(node);
    if (!source) return;
    const controlId = makeNodeId('panoGen');
    const viewerId = makeNodeId('panoView');
    const control = {
      id: controlId,
      type: 'vr720-gen',
      x: node.x + node.w + 96,
      y: node.y,
      w: 380,
      h: 330,
      title: '720空间场景',
      tag: '720控制',
      settings: createVR720GenDefaults({
        prompt: node.prompt || '',
        connectedViewerNodeId: viewerId,
      }),
    };
    const viewer = {
      id: viewerId,
      type: 'panorama-viewer',
      x: node.x + node.w + 96 + 380 + 78,
      y: node.y,
      w: 520,
      h: 360,
      title: '720全景预览',
      tag: '720预览',
      settings: createPanoramaViewerDefaults({ displayName: node.title || '图片参考' }),
    };
    canvasUndoActions.run('create-node', () => {
      canvasActions.setNodes(ns => [...ns, control, viewer]);
      canvasActions.setEdges(es => [
        ...es,
        { id: `e720_src_${node.id}_${controlId}`, from: node.id, to: controlId },
        { id: `e720_${controlId}_${viewerId}`, from: controlId, to: viewerId },
      ]);
      uiActions.setSelection([controlId]);
      setCtx(null);
      focusNodesInCanvas([control, viewer]);
    });
  }, [focusNodesInCanvas]);

  const runPanoramaGeneration = React.useCallback(async (nodeId) => {
    const currentNodes = readCanvasNodes();
    const currentEdges = readCanvasEdges();
    const node = currentNodes.find(n => n.id === nodeId);
    if (!node || node.type !== 'vr720-gen') return;
    if (node.generating) return;

    const settings = { ...createVR720GenDefaults(), ...(node.settings || {}) };
    const upstreamNodes = currentEdges
      .filter(edge => edge?.to === nodeId)
      .map(edge => currentNodes.find(item => item.id === edge.from))
      .filter(Boolean);
    const referenceImages = uniqueNonEmptyStrings(upstreamNodes.map(nodeImageReference));
    const basePrompt = settings.prompt?.trim() || FALLBACK_PANORAMA_PROMPT;
    const style = getPanoramaStyle(settings.style);
    const userPrompt = `${basePrompt}${style.promptSuffix || ''}`.trim();
    const requestPrompt = `${PANORAMA_ENVIRONMENT_PREFIX}\n\n${userPrompt}`.trim();

    canvasActions.updateNode(nodeId, (current) => ({
      generating: true,
      progress: 3,
      error: null,
      jobStage: '任务提交中',
      tag: '720生成',
      settings: {
        ...(current.settings || {}),
        progress: 3,
        error: null,
      },
    }));

    let selectedModel = null;
    try {
      const [providerResult, modelResult] = await Promise.all([
        ProviderStore.list(),
        ProviderStore.models({ capability: 'image.generate' }),
      ]);
      const enabledProviderIds = (providerResult?.providers || [])
        .filter(provider => provider.enabled !== false)
        .map(provider => provider.id);
      selectedModel = selectBackendModel(modelResult?.models || [], {
        currentId: settings.modelId || settings.providerModelId || node.providerModelId,
        currentLabel: settings.model || node.model,
        enabledProviderIds,
      });
    } catch {
      selectedModel = null;
    }

    const selectedModelLabel = selectedModel ? modelLabel(selectedModel) : (settings.model || node.model || 'GPT Image 2');
    const viewerEdge = currentEdges.find(edge => edge?.from === nodeId && currentNodes.find(item => item.id === edge.to)?.type === 'panorama-viewer');
    const viewerNodeId = settings.connectedViewerNodeId || viewerEdge?.to || '';
    const payload = {
      tab: 'image',
      type: selectedModel?.capability || 'image.generate',
      capability: selectedModel?.capability || 'image.generate',
      _panorama720: true,
      basePrompt,
      userPrompt,
      prompt: requestPrompt,
      model: selectedModelLabel,
      modelId: selectedModel?.id || settings.modelId || node.providerModelId,
      providerModelId: selectedModel?.id || settings.providerModelId || node.providerModelId,
      modelName: selectedModel?.modelName,
      provider: selectedModel?.providerId,
      ratio: settings.ratio || '16:9',
      aspectRatio: settings.ratio || '16:9',
      resolution: settings.resolution || '4K',
      count: 1,
      style: settings.style || 'realistic_cinematic',
      styleName: style.label,
      referenceImages,
      viewerNodeId,
    };

    canvasActions.updateNode(nodeId, {
      generating: true,
      progress: 8,
      error: null,
      jobStage: '全景生成中',
      tag: '720生成',
      model: selectedModelLabel,
      settings: {
        ...(node.settings || {}),
        progress: 8,
        error: null,
        model: selectedModelLabel,
        modelId: payload.modelId || '',
        providerModelId: payload.providerModelId || '',
        connectedViewerNodeId: viewerNodeId,
      },
    });

    if (!JobStore.available()) {
      canvasActions.updateNode(nodeId, {
        generating: false,
        progress: 0,
        error: '本地后端未连接，无法生成720空间场景',
        tag: '失败',
        settings: {
          ...(node.settings || {}),
          progress: 0,
          error: '本地后端未连接，无法生成720空间场景',
        },
      });
      return;
    }

    try {
      const body = buildGenerationPayload({
        payload,
        nodeId,
        nodes: currentNodes,
        edges: currentEdges,
        projectId: project?.id,
        capability: selectedModel?.capability || 'image.generate',
      });
      const job = await JobStore.create(nodeId, body);
      applyGenericJobUpdate(job, { sideEffects: false });
      if (job?.id) pollJobUntilTerminal(job.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || '720空间场景生成失败');
      canvasActions.updateNode(nodeId, {
        generating: false,
        progress: 0,
        error: message,
        tag: '失败',
        settings: {
          ...(node.settings || {}),
          progress: 0,
          error: message,
        },
      });
    }
  }, [applyGenericJobUpdate, pollJobUntilTerminal, project?.id, readCanvasEdges, readCanvasNodes]);

  // === Generator unavailable ===
  const markGenerationUnavailable = React.useCallback((ids, assetGenNodeId = '') => {
    canvasActions.setNodes(ns => ns.map(n => {
      if (assetGenNodeId && n.id === assetGenNodeId) {
        return { ...n, generating: false, progress: 0, tag: '失败', error: '本地后端未连接，无法生成' };
      }
      if (!ids.includes(n.id)) return n;
      return { ...n, generating: false, progress: 0, tag: '失败', error: '本地后端未连接，无法生成' };
    }));
  }, []);

  // === runGenerator ===
  const runGenerator = React.useCallback((payload) => {
    const currentNodes = readCanvasNodes();
    const currentEdges = readCanvasEdges();
    const kind = payload.tab;
    const count = Math.max(1, Math.min(Number(payload.count) || 1, 4));
    const forceViewportCenter = payload.placement === 'viewport-center' || payload.ignoreSelection;
    const targetId = forceViewportCenter ? null : (payload.nodeId || selection[0]);
    const selectedNode = targetId ? currentNodes.find(n => n.id === targetId) : null;
    const anchorId = selectedNode?.id || null;
    const jobsAvailable = JobStore.available();
    const displayPrompt = typeof payload._assetUserPrompt === 'string'
      ? payload._assetUserPrompt
      : (typeof payload.assetUserPrompt === 'string' ? payload.assetUserPrompt : payload.prompt);
    const v = canvasRef.current?.get?.();
    const el = document.querySelector('.canvas-root');
    const r = el?.getBoundingClientRect();
    const vx = v ? v.x : -60; const vy = v ? v.y : -60;
    const vw = v && r ? r.width / v.s : 1200; const vh = v && r ? r.height / v.s : 700;
    const anchor = selectedNode || { x: vx + vw / 2 - 160, y: vy + vh / 2 - 110, w: 320, h: 220 };
    const useSelected = shouldUseSelectedGenerationTarget({
      selectedNode,
      kind,
      count,
      replaceTarget: payload.replaceTarget,
      isEmpty: selectedNode ? isNodeEmptyForKind(selectedNode, kind) : false,
    });
    const assetGenNodeId = payload._assetGenNodeId || (selectedNode?.type === 'asset-gen' ? selectedNode.id : '');
    if (assetGenNodeId) {
      canvasActions.updateNode(assetGenNodeId, {
        generating: jobsAvailable,
        progress: jobsAvailable ? 8 : 0,
        error: jobsAvailable ? null : '本地后端未连接，无法生成',
        tag: jobsAvailable ? '生成' : '失败',
        jobStage: jobsAvailable ? '任务提交中' : '',
      });
    }
    const submitGenerationJob = (id, capability, jobNodes, jobEdges) => {
      const body = buildGenerationPayload({
        payload: { ...payload, type: capability },
        nodeId: id,
        nodes: jobNodes,
        edges: jobEdges,
        projectId: project?.id,
        capability,
      });
      submitTrackedJob(id, body).catch(() => {});
    };

    if (payload._promptRunner) {
      const id = payload.nodeId || selection[0];
      if (!id) return;
      const promptRunnerPatch = {
        generating: jobsAvailable,
        progress: jobsAvailable ? 8 : 0,
        error: jobsAvailable ? null : '本地后端未连接，无法生成',
        tag: jobsAvailable ? '生成' : '失败',
        prompt: payload.prompt,
        composedPrompt: payload.prompt,
        systemPrompt: payload.systemPrompt ?? selectedNode?.systemPrompt,
        userPrompt: payload.userPrompt ?? selectedNode?.userPrompt,
        manualInput: payload.manualInput ?? selectedNode?.manualInput,
        templateTitle: payload._templateTitle || selectedNode?.templateTitle,
        templateDescription: payload._templateDescription || selectedNode?.templateDescription,
        templateId: payload._templateId || selectedNode?.templateId,
        model: payload.model,
        providerModelId: payload.providerModelId || payload.modelId,
        modelId: payload.modelId || payload.providerModelId,
        modelName: payload.modelName,
        provider: payload.provider,
        jobStage: jobsAvailable ? '任务提交中' : '',
      };
      const promptRunnerNodes = currentNodes.map((node) => (node.id === id ? { ...node, ...promptRunnerPatch } : node));
      if (payload._templateId === PROMPT_RUNNER_TEMPLATE_IDS.extractAssets) {
        canvasUndoActions.run('start-generation', () => {
          canvasActions.setNodes(promptRunnerNodes);
          canvasActions.setEdges(currentEdges);
          uiActions.setSelection([id]);
        });
        if (jobsAvailable) {
          const capability = capabilityForGeneration(payload);
          deferGenerationJobSubmission(() => submitGenerationJob(id, capability, promptRunnerNodes, currentEdges));
        }
        return;
      }
      const previewGraph = ensurePromptRunnerPreviewTextGraph({
        nodes: promptRunnerNodes,
        edges: currentEdges,
        sourceNodeId: id,
        prompt: payload.prompt,
        model: payload.model,
        makeId: () => makeNodeId('gt'),
        generating: jobsAvailable,
        progress: jobsAvailable ? 8 : 0,
        error: jobsAvailable ? null : '本地后端未连接，无法生成',
        tag: jobsAvailable ? '生成' : '失败',
      });
      canvasUndoActions.run('start-generation', () => {
        canvasActions.setNodes(previewGraph.nodes);
        canvasActions.setEdges(previewGraph.edges);
        uiActions.setSelection([id]);
      });
      if (jobsAvailable) {
        const capability = capabilityForGeneration(payload);
        deferGenerationJobSubmission(() => submitGenerationJob(id, capability, previewGraph.nodes, previewGraph.edges));
      }
      return;
    }

    if (kind === 'text') {
      const dw = 340, dh = 180;
      const startX = selectedNode ? anchor.x + anchor.w + 100 : vx + vw / 2 - dw / 2;
      const startY = selectedNode ? anchor.y : vy + vh / 2 - (count * dh + (count - 1) * 18) / 2;
      const ids = [];
      let jobNodes = currentNodes;
      let jobEdges = currentEdges;
      if (useSelected) {
        ids.push(selectedNode.id);
        canvasUndoActions.run('start-generation', () => {
          canvasActions.updateNode(selectedNode.id, { body: '', title: selectedNode.title || '文本生成结果', model: payload.model, prompt: payload.prompt, generating: jobsAvailable, progress: jobsAvailable ? 8 : 0, jobStage: jobsAvailable ? '任务提交中' : '', tag: jobsAvailable ? '生成' : '失败', error: jobsAvailable ? null : '本地后端未连接，无法生成' });
          uiActions.setSelection([selectedNode.id]);
          focusNodesInCanvas([selectedNode]);
        });
      } else {
        const created = Array.from({ length: count }, (_, i) => {
          const id = 'gt' + Date.now().toString(36) + '_' + i;
          ids.push(id);
          return {
            id,
            type: 'text',
            x: startX,
            y: startY + i * (dh + 18),
            w: dw,
            h: dh,
            title: `文本结果 ${i + 1}`,
            body: '',
            model: payload.model,
            prompt: payload.prompt,
            generating: jobsAvailable,
            progress: jobsAvailable ? 8 : 0,
            jobStage: jobsAvailable ? '任务提交中' : '',
            tag: jobsAvailable ? '生成' : '失败',
            error: jobsAvailable ? null : '本地后端未连接，无法生成',
          };
        });
        const createdEdges = anchorId ? created.map(n => ({ id: 'egt' + n.id, from: anchorId, to: n.id })) : [];
        jobNodes = [...currentNodes, ...created];
        jobEdges = [...currentEdges, ...createdEdges];
        canvasUndoActions.run('start-generation', () => {
          canvasActions.setNodes(ns => [...ns, ...created]);
          canvasActions.setEdges(es => anchorId ? [...es, ...createdEdges] : es);
          uiActions.setSelection(created.map(n => n.id));
          focusNodesInCanvas(created);
        });
      }
      if (jobsAvailable) {
        const capability = capabilityForGeneration(payload);
        deferGenerationJobSubmission(() => {
          ids.forEach((id) => submitGenerationJob(id, capability, jobNodes, jobEdges));
        });
      }
      return;
    }

    const dims = kind === 'image' ? { w: 320, h: 220 } : kind === 'video' ? { w: 340, h: 280 } : { w: 300, h: 220 };
    const ids = [];
    let jobNodes = currentNodes;
    let jobEdges = currentEdges;
    if (useSelected) {
      ids.push(selectedNode.id);
      canvasUndoActions.run('start-generation', () => {
        canvasActions.updateNode(selectedNode.id, {
          generating: true,
          progress: 8,
          jobId: '',
          jobStage: '任务提交中',
          error: null,
          tag: '生成',
          model: payload.model,
          prompt: displayPrompt,
        });
        uiActions.setSelection(ids);
        focusNodesInCanvas([selectedNode]);
      });
    } else {
      const cols = Math.min(count, 2);
      const startX = selectedNode ? anchor.x + anchor.w + 100 : vx + vw / 2 - (cols * dims.w + (cols - 1) * 18) / 2;
      const startY = selectedNode ? anchor.y : vy + vh / 2 - (Math.ceil(count / cols) * dims.h + (Math.ceil(count / cols) - 1) * 18) / 2;
      const defaultTitlePrefix = kind === 'image' ? '图片结果' : kind === 'video' ? '视频结果' : '音频结果';
      const titlePrefix = payload.outputTitlePrefix || defaultTitlePrefix;
      const created = Array.from({ length: count }, (_, i) => {
        const id = 'g' + Date.now().toString(36) + '_' + i + Math.random().toString(36).slice(2, 4);
        ids.push(id);
        return { id, type: kind, x: startX + (i % cols) * (dims.w + 18), y: startY + Math.floor(i / cols) * (dims.h + 18), w: dims.w, h: dims.h, title: `${titlePrefix} ${i + 1}`, generating: true, progress: 8, jobStage: '任务提交中', model: payload.model, prompt: displayPrompt, tag: '生成' };
      });
      const createdEdges = anchorId ? created.map(n => ({ id: 'eg' + n.id, from: anchorId, to: n.id })) : [];
      jobNodes = [...currentNodes, ...created];
      jobEdges = [...currentEdges, ...createdEdges];
      canvasUndoActions.run('start-generation', () => {
        canvasActions.setNodes(ns => [...ns, ...created]);
        canvasActions.setEdges(es => anchorId ? [...es, ...createdEdges] : es);
        uiActions.setSelection(ids);
        focusNodesInCanvas(created);
      });
    }
    if (jobsAvailable) {
      const capability = capabilityForGeneration(payload);
      deferGenerationJobSubmission(() => {
        ids.forEach((id) => submitGenerationJob(id, capability, jobNodes, jobEdges));
      });
      return;
    }
    markGenerationUnavailable(ids, assetGenNodeId);
  }, [focusNodesInCanvas, markGenerationUnavailable, project?.id, readCanvasEdges, readCanvasNodes, selection, submitTrackedJob]);

  const runGroupMediaGeneration = React.useCallback((groupId) => {
    const currentNodes = readCanvasNodes();
    const group = currentNodes.find((node) => node.id === groupId && node.type === 'group');
    if (!group) return;
    const runnable = getGroupRunnableMediaMembers(group, currentNodes);
    if (!runnable.length) return;

    const shotGroupId = group.storyboardShotGroupId || group.shotGroupId;
    const sourceNodeId = group.deployedFromNodeId || group.sourceNodeId || '';
    const sourceNode = sourceNodeId ? currentNodes.find((node) => node.id === sourceNodeId) : null;
    const rawStoryboardPackage = sourceNode?.storyboardPackage || sourceNode?.state?.storyboardPackage || sourceNode?.settings?.storyboardPackage || null;
    const storyboardPackage = rawStoryboardPackage
      ? getNodeStoryboardPackage(sourceNode, {
        projectId: currentProjectId || project?.id || rawStoryboardPackage.projectId || 'local-default',
        nodeId: sourceNodeId,
      })
      : null;
    const isStoryboardGroup = group.deploymentKind === 'storyboard' && storyboardPackage && shotGroupId;
    if (isStoryboardGroup) {
      uiActions.setSelection(runnable.map((node) => node.id));
      const projectId = currentProjectId || project?.id || storyboardPackage?.projectId || 'local-default';
      const groupNodes = storyboardGroupNodeSet(currentNodes, {
        storyboardPackage,
        sourceNodeId,
        shotGroupId,
      });
      const hasImageNode = runnable.some((node) => node.type === 'image');
      const hasVideoNode = runnable.some((node) => node.type === 'video');
      if (hasImageNode) {
        generateStoryboardPackageMedia({
          storyboardPackage,
          nodeId: sourceNodeId,
          projectId,
          scope: 'shot-group',
          shotGroupId,
          kind: 'image',
        });
      }
      if (hasVideoNode && nodeMediaUrlForStoryboard(groupNodes.image, 'image')) {
        generateStoryboardPackageMedia({
          storyboardPackage,
          nodeId: sourceNodeId,
          projectId,
          scope: 'shot-group',
          shotGroupId,
          kind: 'video',
        });
      }
      return;
    }

    canvasUndoActions.run('group-media-generation', () => {
      uiActions.setSelection(runnable.map((node) => node.id));
      runnable.forEach((node) => {
        const prompt = node.prompt || node.promptDraft || node.body || node.settings?.prompt || '';
        if (!String(prompt).trim()) {
          canvasActions.updateNode(node.id, {
            generating: false,
            progress: 0,
            error: node.type === 'video' ? '缺少视频提示词，无法生成。' : '缺少图片提示词，无法生成。',
            tag: '失败',
          });
          return;
        }
        runGenerator({
          tab: node.type,
          nodeId: node.id,
          replaceTarget: true,
          count: 1,
          prompt,
          model: node.model || node.providerModelName || node.modelName || '',
          modelId: node.modelId || node.providerModelId || '',
          providerModelId: node.providerModelId || node.modelId || '',
          modelName: node.modelName,
          provider: node.provider,
          ratio: node.ratio || node.aspectRatio || node.settings?.ratio || '16:9',
          aspectRatio: node.aspectRatio || node.ratio || node.settings?.aspectRatio || node.settings?.ratio || '16:9',
          duration: node.durationSeconds || node.duration || node.settings?.duration || 5,
          durationSeconds: node.durationSeconds || node.duration || node.settings?.durationSeconds || node.settings?.duration || 5,
        });
      });
    });
  }, [
    currentProjectId,
    generateStoryboardPackageMedia,
    nodeMediaUrlForStoryboard,
    project?.id,
    readCanvasNodes,
    runGenerator,
    storyboardGroupNodeSet,
  ]);

  const runLightingGeneration = React.useCallback(async (node, lighting) => {
    if (!node?.src) return;
    let selectedModel = null;
    try {
      const [providerResult, modelResult] = await Promise.all([
        ProviderStore.list(),
        ProviderStore.models({ capability: 'image.generate' }),
      ]);
      const enabledProviderIds = new Set((providerResult?.providers || [])
        .filter((provider) => provider.enabled !== false)
        .map((provider) => provider.id));
      const modelsForCapability = (modelResult?.models || []).filter((model) => model.enabled !== false);
      selectedModel = selectBackendModel(modelsForCapability, {
        currentId: node.providerModelId,
        currentLabel: node.model || node.workbenchModel,
        enabledProviderIds,
      });
    } catch {
      selectedModel = null;
    }
    const tempLabel = lighting?.temperature?.k || '';
    const prompt = [
      '基于参考图片重新生成一张打光调整后的图片，保持主体、构图、人物身份、场景结构和画面比例一致。',
      `主光角度 ${Math.round((lighting?.key?.yaw || 0) * 180 / Math.PI)}°，主光俯仰 ${Math.round((lighting?.key?.pitch || 0) * 180 / Math.PI)}°。`,
      `轮廓光角度 ${Math.round((lighting?.rim?.yaw || 0) * 180 / Math.PI)}°，亮度 ${lighting?.brightness ?? 70}%，色温 ${tempLabel || '5000K'}。`,
      lighting?.smart ? '启用智能补光，保留自然阴影层次。' : '保持电影级真实光影层次。',
      node.prompt || node.title || '',
    ].filter(Boolean).join('\n');
    runGenerator({
      tab: 'image',
      type: selectedModel?.capability || 'image.generate',
      capability: selectedModel?.capability || 'image.generate',
      nodeId: node.id,
      replaceTarget: false,
      prompt,
      model: selectedModel ? modelLabel(selectedModel) : (node.model || '默认图片模型'),
      modelId: selectedModel?.id || node.providerModelId,
      providerModelId: selectedModel?.id || node.providerModelId,
      modelName: selectedModel?.modelName,
      provider: selectedModel?.providerId,
      ratio: node.ratio || '16:9',
      aspectRatio: node.ratio || '16:9',
      resolution: node.resolution || node.settings?.resolution || '2K',
      count: 1,
      style: 'node-tool:lighting',
      referenceImages: [node.src],
    });
    uiActions.closeModal();
  }, [runGenerator]);

  const runMarkupGeneration = React.useCallback(async (node, markup = {}) => {
    if (!node?.src) return;
    let selectedModel = null;
    try {
      const [providerResult, modelResult] = await Promise.all([
        ProviderStore.list(),
        ProviderStore.models({ capability: 'image.generate' }),
      ]);
      const enabledProviderIds = new Set((providerResult?.providers || [])
        .filter((provider) => provider.enabled !== false)
        .map((provider) => provider.id));
      const modelsForCapability = (modelResult?.models || []).filter((model) => model.enabled !== false);
      selectedModel = selectBackendModel(modelsForCapability, {
        currentId: node.providerModelId,
        currentLabel: node.model || node.workbenchModel,
        enabledProviderIds,
      });
    } catch {
      selectedModel = null;
    }
    const editPrompt = [
      '只修改用户标记的遮罩区域，未标记区域必须保持原图一致。',
      markup.prompt || '按标记区域进行局部重绘。',
    ].filter(Boolean).join('\n');
    const sourceImage = makeAssetUrl(
      { src: markup.sourceImage || node.src },
      backendBaseUrlRef.current || undefined,
    );
    runGenerator({
      tab: 'image',
      type: selectedModel?.capability || 'image.generate',
      capability: selectedModel?.capability || 'image.generate',
      nodeId: node.id,
      replaceTarget: markup.replaceTarget !== false,
      prompt: editPrompt,
      model: selectedModel ? modelLabel(selectedModel) : (node.model || '默认图片模型'),
      modelId: selectedModel?.id || node.providerModelId,
      providerModelId: selectedModel?.id || node.providerModelId,
      modelName: selectedModel?.modelName,
      provider: selectedModel?.providerId,
      ratio: node.ratio || '16:9',
      aspectRatio: node.ratio || '16:9',
      resolution: node.resolution || node.settings?.resolution || '2K',
      count: 1,
      outputTitlePrefix: markup.outputTitlePrefix,
      style: 'node-tool:markup',
      mode: 'image-edit',
      maskMode: markup.maskMode,
      maskImage: markup.maskImage,
      referenceImages: [sourceImage].filter(Boolean),
    });
    uiActions.closeModal();
  }, [runGenerator]);

  // === Slash command router ===
  const runSlashCommand = React.useCallback(async (slashKey, anchorId) => {
    const currentNodes = readCanvasNodes();
    const currentEdges = readCanvasEdges();
    const anchor = anchorId || selection[0] || currentNodes[0]?.id;
    const cfgMap = {
      '/多机位九宫格':   { count: 9,  cols: 3, cellW: 180, cellH: 120, titleTpl: '机位 {i}',  labelTop: '九宫格' },
      '/剧情推演四宫格': { count: 4,  cols: 2, cellW: 220, cellH: 150, titleTpl: '推演 {i}',  labelTop: '四宫格' },
      '/25宫格连贯分镜': { count: 25, cols: 5, cellW: 150, cellH: 100, titleTpl: '分镜 {i}',  labelTop: '25宫格' },
      '/电影级光影矫正': { count: 3,  cols: 3, cellW: 260, cellH: 180, titleTpl: '光影 V{i}', labelTop: '光影' },
      '/角色三视图':     { count: 3,  cols: 3, cellW: 220, cellH: 280, titleTpl: ['正面', '侧面', '背面'], labelTop: '三视图' },
      '/画面推演-3秒后': { count: 1,  cols: 1, cellW: 360, cellH: 240, titleTpl: '3秒后', labelTop: '推演' },
      '/画面推演-5秒前': { count: 1,  cols: 1, cellW: 360, cellH: 240, titleTpl: '5秒前', labelTop: '推演' },
    };
    const cfg = cfgMap[slashKey];
    if (!cfg) return;
    const mkTitle = Array.isArray(cfg.titleTpl) ? (i) => cfg.titleTpl[(i - 1) % cfg.titleTpl.length] : (i) => cfg.titleTpl.replace('{i}', String(i));
    const an = currentNodes.find(n => n.id === anchor) || currentNodes[0];
    if (!an) return;
    let selectedModel = null;
    try {
      const [providerResult, modelResult] = await Promise.all([
        ProviderStore.list(),
        ProviderStore.models({ capability: 'image.generate' }),
      ]);
      const enabledProviderIds = new Set((providerResult?.providers || [])
        .filter((provider) => provider.enabled !== false)
        .map((provider) => provider.id));
      const modelsForCapability = (modelResult?.models || []).filter((model) => model.enabled !== false);
      selectedModel = selectBackendModel(modelsForCapability, { enabledProviderIds });
    } catch {
      selectedModel = null;
    }
    const newNodes = Array.from({ length: cfg.count }, (_, i) => {
      const row = Math.floor(i / cfg.cols), col = i % cfg.cols;
      return {
        id: 'g' + Date.now().toString(36) + '_' + i + Math.random().toString(36).slice(2, 4),
        type: 'image',
        x: an.x + an.w + 100 + col * (cfg.cellW + 14),
        y: an.y + row * (cfg.cellH + 14),
        w: cfg.cellW,
        h: cfg.cellH,
        title: mkTitle(i + 1),
        tag: '生成',
        groupLabel: cfg.labelTop,
        generating: true,
        progress: 8,
        prompt: `${slashKey}：${an.prompt || an.body || an.title || ''}`.trim(),
        model: selectedModel ? modelLabel(selectedModel) : '默认图片模型',
        providerModelId: selectedModel?.id,
      };
    });
    const newEdges = newNodes.map((n, i) => ({ id: 'eg' + Date.now().toString(36) + '_' + i + Math.random().toString(36).slice(2, 3), from: anchor, to: n.id }));
    canvasUndoActions.run('slash-command', () => {
      canvasActions.setNodes(ns => [...ns, ...newNodes]);
      canvasActions.setEdges(es => [...es, ...newEdges]);
      uiActions.setSelection(newNodes.map(n => n.id));
    });
    const jobNodes = [...currentNodes, ...newNodes];
    const jobEdges = [...currentEdges, ...newEdges];
    if (!JobStore.available()) {
      markGenerationUnavailable(newNodes.map(n => n.id));
      return;
    }
    newNodes.forEach((node) => {
      submitTrackedJob(node.id, buildGenerationPayload({
        payload: {
          tab: 'image',
          type: 'image.generate',
          prompt: node.prompt,
          model: node.model,
          modelId: selectedModel?.id,
          providerModelId: selectedModel?.id,
          modelName: selectedModel?.modelName,
          provider: selectedModel?.providerId,
          ratio: '16:9',
          resolution: '2K',
          style: `slash:${slashKey}`,
        },
        nodeId: node.id,
        nodes: jobNodes,
        edges: jobEdges,
        projectId: project?.id,
        capability: 'image.generate',
      })).catch(() => {});
    });
  }, [markGenerationUnavailable, project?.id, readCanvasEdges, readCanvasNodes, selection, submitTrackedJob]);

  const simulateNodeProgress = React.useCallback((nodeId) => {
    canvasActions.updateNode(nodeId, { generating: true, progress: 12 });
    let p = 12;
    const t = setInterval(() => {
      p += Math.random() * 12;
      if (p >= 100) {
        clearInterval(t);
        canvasActions.updateNode(nodeId, { generating: false, progress: 0 });
      } else {
        canvasActions.updateNode(nodeId, { progress: Math.round(p) });
      }
    }, 220);
  }, []);

  const runNodeToolJob = React.useCallback(async (kind, nodeId) => {
    const currentNodes = readCanvasNodes();
    const currentEdges = readCanvasEdges();
    const node = currentNodes.find(n => n.id === nodeId);
    if (!node) return;
    const shotText = Array.isArray(node.shots)
      ? node.shots.map((shot, idx) => `${shot.n || idx + 1}. ${shot.shot || ''} ${shot.desc || ''} ${shot.dur || ''}`.trim()).join('\n')
      : '';
    const mediaPolishSource = mediaPromptPolishSourceText(node);
    const sourceText = (node.body || node.promptDraft || node.prompt || shotText || node.title || '').trim();

    if (kind === 'textvideo' || kind === 'batchvideo') {
      runGenerator({
        tab: 'video',
        nodeId,
        replaceTarget: false,
        prompt: sourceText || '根据当前节点内容生成视频',
        model: node.workbenchModel || node.model || '暂无可用模型',
        providerModelId: node.providerModelId,
        ratio: node.ratio || '16:9',
        resolution: node.resolution || '720P',
        duration: node.durationSeconds || 5,
        audioOn: node.audioOn !== false,
        count: kind === 'batchvideo' ? Math.max(1, Math.min((node.shots || []).length || 1, 4)) : 1,
        style: `node-tool:${kind}`,
      });
      return;
    }

    if (!JobStore.available()) {
      simulateNodeProgress(nodeId);
      return;
    }

    const isMediaPromptPolish = kind === 'textpolish' && isMediaPromptPolishNode(node);
    const byId = new Map(currentNodes.map((item) => [item.id, item]));
    const upstreamNodes = currentEdges
      .filter((edge) => edge?.to === nodeId)
      .map((edge) => byId.get(edge.from))
      .filter(Boolean);
    const upstreamContext = upstreamNodes.map((item, index) => {
      const text = item.body || item.promptDraft || item.prompt || item.title || '';
      return `[${index + 1}] ${item.title || item.id || '上游节点'}: ${String(text || '').trim()}`;
    }).filter(Boolean).join('\n');
    const prompts = {
      textcont: buildTextNodeToolPrompt({ kind: 'textcont', sourceText, upstreamContext, node }),
      textrewrite: buildTextNodeToolPrompt({ kind: 'textrewrite', sourceText, upstreamContext, node }),
      textpolish: isMediaPromptPolish
        ? buildMediaPromptPolishPrompt({
          node,
          sourceText: mediaPolishSource,
          upstreamNodes,
          referenceAssets: node.referenceAssets,
        })
        : buildTextNodeToolPrompt({ kind: 'textpolish', sourceText, upstreamContext, node }),
      genshots: buildTextNodeToolPrompt({ kind: 'genshots', sourceText, upstreamContext, node }),
    };
    const capability = node.textModelCapability || (kind === 'genshots' ? 'inference.generate' : 'text.reason');
    let textModel = null;
    try {
      const result = await ProviderStore.models({ capability });
      const availableModels = Array.isArray(result?.models) ? result.models.filter((item) => item.enabled !== false) : [];
      textModel = selectBackendModel(availableModels, { currentId: node.providerModelId, currentLabel: node.workbenchModel || node.model });
    } catch {
      textModel = null;
    }
    const fallbackTextModelLabel = node.workbenchModel || node.model || '默认文本模型';
    const fallbackTextModelId = node.providerModelId || node.modelId || node.workbenchModelId;
    canvasActions.updateNode(nodeId, {
      generating: true,
      progress: 8,
      error: null,
      tag: kind === 'textpolish' ? '润色' : '生成',
    });
    submitTrackedJob(nodeId, buildGenerationPayload({
      payload: {
        tab: 'text',
        type: textModel?.capability || capability,
        capability: textModel?.capability || capability,
        prompt: prompts[kind] || sourceText || '请分析当前节点内容。',
        model: textModel ? modelLabel(textModel) : fallbackTextModelLabel,
        modelId: textModel?.id || fallbackTextModelId,
        providerModelId: textModel?.id || fallbackTextModelId,
        modelName: textModel?.modelName || node.modelName,
        provider: textModel?.providerId || node.provider,
        style: `node-tool:${kind}`,
      },
      nodeId,
      nodes: currentNodes,
      edges: currentEdges,
      projectId: project?.id,
      capability: textModel?.capability || capability,
    })).catch(() => {});
  }, [project?.id, readCanvasEdges, readCanvasNodes, runGenerator, simulateNodeProgress, submitTrackedJob]);

  const runScriptCreateJob = React.useCallback(async (request = {}, sourceNodeId) => {
    const currentNodes = readCanvasNodes();
    const sourceNode = sourceNodeId ? currentNodes.find(n => n.id === sourceNodeId) : null;
    try {
      await runScriptModeStoryboard({
        request,
        sourceNode,
        projectId: project?.id,
        getViewportCenter,
        focusNodesInCanvas,
      });
    } catch (error) {
      const targetNodeId = sourceNode?.type === 'script' ? sourceNode.id : null;
      if (targetNodeId) {
        canvasActions.updateNode(targetNodeId, {
          generating: false,
          progress: 0,
          jobStage: '',
          error: error instanceof Error ? error.message : String(error),
          tag: '失败',
        });
      }
      console.error('runScriptCreateJob failed', error);
    }
  }, [focusNodesInCanvas, getViewportCenter, project?.id, readCanvasNodes]);

  const addImageNodeToPortraitLibrary = React.useCallback(async (node) => {
    if (!node || node.type !== 'image' || portraitUploadNodeId === node.id) return;
    const asset = getNodeAssetPayload(node);
    const source = portraitSourceFromImageNode(node, asset);
    const hasUploadableSource = Boolean(
      source.assetPath
      || source.localPath
      || source.path
      || source.src
      || source.url
      || source.assetUrl
      || source.imageUrl
      || source.previewUrl,
    );
    if (!hasUploadableSource) {
      showPortraitImportNotice({
        tone: 'error',
        title: '添加到人像库失败',
        message: '当前图片没有可上传的来源',
      });
      return;
    }

    setPortraitUploadNodeId(node.id);
    showPortraitImportNotice({
      tone: 'info',
      title: '正在添加到人像库',
      message: source.title,
    });
    try {
      const uploaded = await SeedancePortraitStore.uploadSource(source, {
        name: source.name,
        description: '',
      });
      const assetId = uploaded?.assetId || uploaded?.asset_id || '';
      canvasActions.updateNode(node.id, {
        seedancePortraitAsset: uploaded,
      });
      showPortraitImportNotice({
        tone: 'success',
        title: '已添加到人像库',
        message: assetId ? `${source.title} · ${assetId}` : source.title,
      });
    } catch (error) {
      showPortraitImportNotice({
        tone: 'error',
        title: '添加到人像库失败',
        message: error?.message || '上传失败',
      });
    } finally {
      setPortraitUploadNodeId((current) => (current === node.id ? '' : current));
    }
  }, [portraitUploadNodeId, showPortraitImportNotice]);

  // === openModal — routes to uiStore or local UI state ===
  const openModal = React.useCallback((kind, nodeId, options = null) => {
    if (kind === 'shortcuts')    { setShowShortcuts(true); return; }
    if (kind === 'camctrl-image') { setShowCamCtrl('image'); return; }
    if (kind === 'camctrl-video') { setShowCamCtrl('video'); return; }
    if (kind === 'workbench')     { setWorkbenchNodeId(nodeId); setWorkbenchEntryOptions(options || null); return; }
    const currentNodes = readCanvasNodes();
    if (kind === 'scriptfull') {
      if (nodeId) uiActions.setSelection([nodeId]);
      uiActions.openModal({
        kind: 'scriptfull',
        nodeId,
        onOpenWorkbench: (entryOptions = { entry: 'package' }) => {
          uiActions.closeModal();
          setWorkbenchNodeId(nodeId);
          setWorkbenchEntryOptions(entryOptions || { entry: 'package' });
        },
      });
      return;
    }
    if (kind === 'scriptcreate') {
      if (nodeId) uiActions.setSelection([nodeId]);
      uiActions.openModal({ kind: 'scriptcreate', nodeId, onCreate: (request) => runScriptCreateJob(request, nodeId) });
      return;
    }
    if (kind === 'stylelib' && options?.onPick) {
      if (nodeId) uiActions.setSelection([nodeId]);
      uiActions.openModal({ kind: 'stylelib', nodeId, onPick: options.onPick });
      return;
    }
    if (kind === 'seedencePortraitLibrary' && options?.onPick) {
      if (nodeId) uiActions.setSelection([nodeId]);
      uiActions.openModal({
        kind: 'seedencePortraitLibrary',
        nodeId,
        onPick: options.onPick,
        selectedAssets: options.selectedAssets || [],
      });
      return;
    }
    if (kind === 'history') {
      setRailPop(null);
      uiActions.openOverlayModal({ kind: 'history', onUseHistoryItems: insertHistoryItemsToCanvas });
      return;
    }
    if (kind === 'preview') {
      const targetNodeId = nodeId || selection[0];
      const node = currentNodes.find(n => n.id === targetNodeId);
      const asset = getNodeAssetPayload(node);
      if (!asset) return;
      if (targetNodeId) uiActions.setSelection([targetNodeId]);
      uiActions.openModal({ kind: 'preview', item: asset });
      return;
    }
    if (['imagecrop', 'imageannotate', 'imagesplit', 'imageupscale'].includes(kind)) {
      const targetNodeId = nodeId || selection[0];
      const node = currentNodes.find(n => n.id === targetNodeId);
      if (!node) return;
      const sourceImage = nodeImageReference(node) || nodePosterReference(node) || nodeVideoReference(node);
      uiActions.setSelection([targetNodeId]);
      uiActions.openModal({
        kind,
        nodeId: targetNodeId,
        src: sourceImage,
        assetId: node.assetId,
        assetUrl: node.assetUrl || node.url || node.imageUrl,
        imageUrl: node.imageUrl,
        assetPath: node.assetPath,
        projectId: project?.id || currentProjectId || 'local-default',
        title: node.title,
        onApply: (payload) => createImageToolResultNodes(node, payload),
      });
      return;
    }
    if (kind === 'framecap') {
      const targetNodeId = nodeId || selection[0];
      const node = currentNodes.find(n => n.id === targetNodeId);
      if (!node) return;
      const asset = getNodeAssetPayload(node) || {};
      const sourceVideo = nodeVideoReference(node) || asset.src || asset.url || asset.assetUrl || '';
      if (!sourceVideo) return;
      const activeProjectId = project?.id || currentProjectId || 'local-default';
      if (targetNodeId) uiActions.setSelection([targetNodeId]);
      uiActions.openModal({
        kind: 'framecap',
        nodeId: targetNodeId,
        src: sourceVideo,
        assetId: node.assetId || asset.assetId || asset.id,
        assetPath: node.assetPath || asset.assetPath || asset.path,
        assetUrl: node.assetUrl || asset.assetUrl || asset.url,
        projectId: activeProjectId,
        title: node.title || asset.title,
        onApply: (payload) => createImageToolResultNodes(node, payload),
      });
      return;
    }
    if (kind === 'subtitlesremove') {
      const targetNodeId = nodeId || selection[0];
      const node = currentNodes.find(n => n.id === targetNodeId);
      if (!node) return;
      const asset = getNodeAssetPayload(node) || {};
      const sourceVideo = nodeVideoReference(node) || asset.src || asset.url || '';
      if (!sourceVideo) return;
      const activeProjectId = project?.id || currentProjectId || 'local-default';
      if (targetNodeId) uiActions.setSelection([targetNodeId]);
      uiActions.openModal({
        kind: 'subtitlesremove',
        nodeId: targetNodeId,
        src: sourceVideo,
        assetId: node.assetId || asset.assetId,
        assetPath: node.assetPath || asset.assetPath,
        assetUrl: node.assetUrl || asset.assetUrl || asset.url,
        projectId: activeProjectId,
        title: node.title || asset.title,
        videoWidth: node.videoWidth || node.settings?.videoWidth,
        videoHeight: node.videoHeight || node.settings?.videoHeight,
        onApply: async (payload) => {
          const result = createSubtitleRemovalResultGraph({
            sourceNode: node,
            payload,
            projectId: activeProjectId,
            makeId: makeNodeId,
          });
          canvasUndoActions.run('create-subtitle-removal-result', () => {
            canvasActions.setNodes((items) => [...items, result.node]);
            canvasActions.setEdges((items) => [...items, result.edge]);
            uiActions.setSelection([result.node.id]);
            focusNodesInCanvas([result.node]);
          });
          return submitTrackedJob(result.jobNodeId, result.jobPayload);
        },
      });
      return;
    }
    if (kind === 'focus') {
      const targetNodeId = nodeId || selection[0];
      const node = currentNodes.find(n => n.id === targetNodeId);
      if (!node) return;
      const sourceImage = nodeImageReference(node) || nodePosterReference(node) || nodeVideoReference(node);
      uiActions.setSelection([targetNodeId]);
      uiActions.openModal({
        kind: 'focus',
        nodeId: targetNodeId,
        src: sourceImage,
        assetId: node.assetId,
        assetUrl: node.assetUrl || node.url || node.imageUrl,
        imageUrl: node.imageUrl,
        assetPath: node.assetPath,
        analysis: node.focusAnalysis,
        onApply: ({ payload } = {}) => runGenerator({
          ...(payload || {}),
          nodeId: targetNodeId,
          replaceTarget: false,
          count: 1,
          outputTitlePrefix: `${node.title || '图片'} · 聚焦`,
        }),
      });
      return;
    }
    if (kind === 'imageinpaint') {
      const targetNodeId = nodeId || selection[0];
      const node = currentNodes.find(n => n.id === targetNodeId);
      if (!node) return;
      const sourceImage = nodeImageReference(node) || nodePosterReference(node) || nodeVideoReference(node);
      uiActions.setSelection([targetNodeId]);
      uiActions.openModal({
        kind: 'markup',
        nodeId: targetNodeId,
        src: sourceImage,
        assetId: node.assetId,
        assetUrl: node.assetUrl || node.url || node.imageUrl,
        imageUrl: node.imageUrl,
        assetPath: node.assetPath,
        analysis: node.focusAnalysis,
        onApply: (markup) => runMarkupGeneration(node, {
          ...markup,
          replaceTarget: false,
          outputTitlePrefix: `${node.title || '图片'} · 涂抹`,
        }),
      });
      return;
    }
    if (kind === 'toolbox') {
      const targetNodeId = nodeId || selection[0];
      const node = currentNodes.find(n => n.id === targetNodeId);
      uiActions.openModal({
        kind: 'toolbox',
        nodeId: targetNodeId,
        selectedNodeType: node?.type,
        onPickTool: (toolKind) => {
          uiActions.closeModal();
          if (toolKind === 'scriptcreate') {
            uiActions.openModal({ kind: 'scriptcreate', nodeId: targetNodeId, onCreate: (request) => runScriptCreateJob(request, targetNodeId) });
            return;
          }
          if (toolKind === 'markup') {
            if (targetNodeId) uiActions.setSelection([targetNodeId]);
            const sourceImage = nodeImageReference(node) || nodePosterReference(node) || nodeVideoReference(node);
            uiActions.openModal({
              kind: toolKind,
              nodeId: targetNodeId,
              src: sourceImage,
              assetId: node?.assetId,
              assetUrl: node?.assetUrl || node?.url || node?.imageUrl,
              imageUrl: node?.imageUrl,
              assetPath: node?.assetPath,
              analysis: node?.focusAnalysis,
              onApply: (markup) => runMarkupGeneration(node, markup),
            });
            return;
          }
          if (toolKind === 'focus') {
            if (targetNodeId) uiActions.setSelection([targetNodeId]);
            const sourceImage = nodeImageReference(node) || nodePosterReference(node) || nodeVideoReference(node);
            uiActions.openModal({
              kind: 'focus',
              nodeId: targetNodeId,
              src: sourceImage,
              assetId: node?.assetId,
              assetUrl: node?.assetUrl || node?.url || node?.imageUrl,
              imageUrl: node?.imageUrl,
              assetPath: node?.assetPath,
              analysis: node?.focusAnalysis,
              onApply: ({ payload } = {}) => runGenerator({
                ...(payload || {}),
                nodeId: targetNodeId,
                replaceTarget: false,
                count: 1,
                outputTitlePrefix: `${node?.title || '图片'} · 聚焦`,
              }),
            });
            return;
          }
          if (['imagecrop', 'imageannotate', 'imagesplit', 'imageupscale'].includes(toolKind)) {
            if (targetNodeId) uiActions.setSelection([targetNodeId]);
            const sourceImage = nodeImageReference(node) || nodePosterReference(node) || nodeVideoReference(node);
            uiActions.openModal({
              kind: toolKind,
              nodeId: targetNodeId,
              src: sourceImage,
              assetId: node?.assetId,
              assetUrl: node?.assetUrl || node?.url || node?.imageUrl,
              imageUrl: node?.imageUrl,
              assetPath: node?.assetPath,
              projectId: project?.id || currentProjectId || 'local-default',
              title: node?.title,
              onApply: (payload) => createImageToolResultNodes(node, payload),
            });
            return;
          }
          uiActions.openModal({
            kind: toolKind,
            nodeId: targetNodeId,
            src: node?.src || node?.poster || node?.videoSrc,
            assetId: node?.assetId,
            analysis: node?.focusAnalysis,
          });
        },
      });
      return;
    }
    const overlayMap = { assets: 'subject', subject: 'subject', subjectlib: 'subject', style: 'style', stylelib: 'style', history: 'history', projects: 'projects', compliance: 'compliance', realperson: 'realperson' };
    if (overlayMap[kind]) {
      if (nodeId) uiActions.setSelection([nodeId]);
      if (overlayMap[kind] === 'history') {
        uiActions.openOverlayModal({ kind: 'history', onUseHistoryItems: insertHistoryItemsToCanvas });
      } else if (overlayMap[kind] === 'subject') {
        openSubjectLibraryOverlay();
      } else {
        uiActions.openOverlayModal(overlayMap[kind]);
      }
      return;
    }
    if (kind === 'copy')   { duplicateNode(nodeId); return; }
    if (kind === 'delete') { deleteNode(nodeId); return; }
    if (kind === 'upload') { requestUpload(nodeId, currentNodes.find(n => n.id === nodeId)?.type); return; }
    if (kind === 'play')   { canvasActions.updateNode(nodeId, n => ({ _playing: !n._playing })); return; }
    if (kind === 'upscale-video') { uiActions.openModal({ kind: 'upscale', nodeId, kindHint: 'video' }); return; }
    if (['audiocut', 'denoise'].includes(kind)) { simulateNodeProgress(nodeId); return; }
    if (['textcont', 'textrewrite', 'textpolish', 'textvideo', 'genshots', 'batchvideo'].includes(kind)) { runNodeToolJob(kind, nodeId); return; }
    const targetNodeId = nodeId || selection[0];
    const node = currentNodes.find(n => n.id === targetNodeId);
    if (kind === 'light') {
      if (targetNodeId) uiActions.setSelection([targetNodeId]);
      uiActions.openModal({
        kind,
        nodeId: targetNodeId,
        src: node?.src || node?.poster || node?.videoSrc,
        assetId: node?.assetId,
        onApply: (lighting) => runLightingGeneration(node, lighting),
      });
      return;
    }
    if (kind === 'markup') {
      if (targetNodeId) uiActions.setSelection([targetNodeId]);
      const sourceImage = nodeImageReference(node) || nodePosterReference(node) || nodeVideoReference(node);
      uiActions.openModal({
        kind,
        nodeId: targetNodeId,
        src: sourceImage,
        assetId: node?.assetId,
        assetUrl: node?.assetUrl || node?.url || node?.imageUrl,
        imageUrl: node?.imageUrl,
        assetPath: node?.assetPath,
        analysis: node?.focusAnalysis,
        onApply: (markup) => runMarkupGeneration(node, markup),
      });
      return;
    }
    uiActions.openModal({
      kind,
      nodeId: targetNodeId,
      src: node?.src || node?.poster || node?.videoSrc,
      assetId: node?.assetId,
      analysis: node?.focusAnalysis,
    });
  }, [selection, duplicateNode, deleteNode, requestUpload, createImageToolResultNodes, focusNodesInCanvas, insertHistoryItemsToCanvas, openSubjectLibraryOverlay, readCanvasNodes, runLightingGeneration, runMarkupGeneration, runNodeToolJob, runScriptCreateJob, simulateNodeProgress, submitTrackedJob, project?.id, currentProjectId]);

  // === Node context menu ===
  const onNodeContextMenu = React.useCallback((e, node) => {
    const currentNodes = readCanvasNodes();
    const asset = getNodeAssetPayload(node);
    const typeLabel = {
      image: '图片',
      video: '视频',
      audio: '音频',
      text: '文本',
      script: '脚本',
      'asset-gen': '资产生成',
      'vr720-gen': '720空间场景',
      'panorama-viewer': '720全景预览',
      'jianying-export': '剪映导出',
      'storyboard-collector-detail': '分镜收集细节',
    }[node.type] || node.type;
    const selectedNodes = currentNodes.filter(n => selection.includes(n.id) && isCanvasGroupableNode(n));
    const selectedCollectableNodes = selectedNodes.filter(isStoryboardCollectableNode);
    const collectorNodes = currentNodes.filter(isStoryboardCollectorNode);
    const selectedIds = selectedNodes.map(n => n.id);
    const selectedIdSet = new Set(selectedIds);
    const alreadyGrouped = selectedIds.length >= 2 && currentNodes.some(n => (
      n.type === 'group' &&
      Array.isArray(n.memberIds) &&
      n.memberIds.length === selectedIds.length &&
      n.memberIds.every(id => selectedIdSet.has(id))
    ));
    const isMultiSelectionContext = selection.includes(node.id) && selectedNodes.length >= 2;
    setCtx({
      x: e.clientX, y: e.clientY, compact: false,
      items: [
        ...(isMultiSelectionContext ? [
          { sub: `已选 ${selectedNodes.length} 个节点` },
          { label: '新建组合', onClick: requestGroupSelectedNodes, disabled: alreadyGrouped },
          { label: collectorNodes.length ? '收进最近分镜收集' : '新建分镜收集并收进', onClick: () => collectNodesIntoNearestStoryboardCollector(selectedCollectableNodes.map(n => n.id)), disabled: selectedCollectableNodes.length < 1 },
          { label: '创建副本', onClick: duplicateSelectedNodes },
          { label: '批量下载', onClick: downloadSelectedNodes },
          { sep: true },
        ] : []),
        { sub: `${typeLabel}节点 · ${node.title}` },
        { label: '重新生成',   onClick: () => openModal('genshots', node.id) },
        { label: '复用作输入', onClick: () => duplicateNode(node.id) },
        { sep: true },
        { label: '复制',       onClick: () => duplicateNode(node.id) },
        { label: '保存到资产库', onClick: () => openSaveAssetDialog(node), disabled: !asset },
        { label: '下载',       onClick: () => downloadNode(node), disabled: !asset },
        { label: collectorNodes.length ? '收进最近分镜收集' : '新建分镜收集并收进', onClick: () => collectNodesIntoNearestStoryboardCollector([node.id]), disabled: !isStoryboardCollectableNode(node) },
        { sep: true },
        ...(node.type === 'image' ? [
          { label: '查看大图', onClick: () => previewNode(node), disabled: !asset },
          { label: '添加到人像库', onClick: () => addImageNodeToPortraitLibrary(node), disabled: !nodeImageReference(node) || node.generating || portraitUploadNodeId === node.id },
          { label: '创建720空间场景', onClick: () => createPanoramaNodeFromImage(node), disabled: !nodeImageReference(node) || node.generating },
          { label: '打光生成', onClick: () => openModal('light', node.id), disabled: !node.src || node.generating },
          {
            label: '高清放大',
            onClick: () => {
              uiActions.setSelection([node.id]);
              setUpscaleIncomingImages([node]);
              setUpscaleVisible(true);
            },
            disabled: !node.src,
          },
          { label: '焦点编辑', onClick: () => openModal('focus', node.id) },
        ] : []),
        ...(node.type === 'video' ? [
          { label: '剪辑',       onClick: () => openModal('videoclip', node.id) },
          { label: '截帧为图片', onClick: () => openModal('framecap', node.id) },
        ] : []),
        ...(node.type === 'audio' ? [
          { label: '试听', onClick: () => previewNode(node), disabled: !asset },
          { label: '变声', onClick: () => openModal('voicechange', node.id) },
        ] : []),
        ...(node.type === 'script' ? [
          { label: '全屏编辑',     onClick: () => openModal('scriptfull', node.id) },
          { label: '重新生成分镜', onClick: () => openModal('scriptcreate', node.id) },
        ] : []),
        { sep: true },
        { label: '重命名', onClick: () => openRenameNodeDialog(node) },
        { label: '删除', onClick: () => deleteNode(node.id), danger: true },
      ],
    });
  }, [selection, requestGroupSelectedNodes, duplicateSelectedNodes, downloadSelectedNodes, openModal, duplicateNode, deleteNode, downloadNode, previewNode, openRenameNodeDialog, createPanoramaNodeFromImage, collectNodesIntoNearestStoryboardCollector, openSaveAssetDialog, addImageNodeToPortraitLibrary, portraitUploadNodeId, readCanvasNodes]);

  const onGroupContextMenu = React.useCallback((e, group) => {
    const memberIds = Array.isArray(group?.memberIds) ? group.memberIds : [];
    setCtx({
      x: e.clientX,
      y: e.clientY,
      compact: false,
      items: [
        { sub: `组合 · ${group?.title || '未命名组合'}` },
        { label: '选择组内节点', onClick: () => uiActions.setSelection(memberIds), disabled: memberIds.length < 1 },
        { sep: true },
        { label: '解组', onClick: () => ungroupNode(group.id), danger: true },
      ],
    });
  }, [ungroupNode]);

  const onBackgroundPanelContextMenu = React.useCallback((e, panel) => {
    if (!panel?.id) return;
    setCtx({
      x: e.clientX,
      y: e.clientY,
      compact: false,
      items: [
        { sub: `背景板 · ${panel.title || '未命名背景板'}` },
        { label: '设置名称和颜色', onClick: () => openBackgroundPanelDialog(panel) },
        { sep: true },
        { label: '删除背景板', onClick: () => deleteNode(panel.id), danger: true },
      ],
    });
  }, [deleteNode, openBackgroundPanelDialog]);

  // === Canvas right-click (empty area) ===
  const onCanvasContext = React.useCallback((e, options = {}) => {
    const currentNodes = readCanvasNodes();
    const selectedNodes = currentNodes.filter(n => selection.includes(n.id) && isCanvasGroupableNode(n));
    if (options.selectionContext && selectedNodes.length >= 2) {
      const selectedIds = selectedNodes.map(n => n.id);
      const selectedIdSet = new Set(selectedIds);
      const selectedCollectableNodes = selectedNodes.filter(isStoryboardCollectableNode);
      const collectorNodes = currentNodes.filter(isStoryboardCollectorNode);
      const alreadyGrouped = currentNodes.some(n => (
        n.type === 'group' &&
        Array.isArray(n.memberIds) &&
        n.memberIds.length === selectedIds.length &&
        n.memberIds.every(id => selectedIdSet.has(id))
      ));
      setCtx({
        x: e.clientX, y: e.clientY, compact: false,
        items: [
          { sub: `已选 ${selectedNodes.length} 个节点` },
          { label: '新建组合', onClick: requestGroupSelectedNodes, disabled: alreadyGrouped },
          { label: collectorNodes.length ? '收进最近分镜收集' : '新建分镜收集并收进', onClick: () => collectNodesIntoNearestStoryboardCollector(selectedCollectableNodes.map(n => n.id)), disabled: selectedCollectableNodes.length < 1 },
          { label: '创建副本', onClick: duplicateSelectedNodes },
          { label: '批量下载', onClick: downloadSelectedNodes },
          { sep: true },
          { label: '取消选择', onClick: uiActions.clearSelection },
        ],
      });
      return;
    }
    const v = canvasRef.current?.get?.();
    const el = document.querySelector('.canvas-root');
    const r = el?.getBoundingClientRect();
    const p = v && r ? { x: (e.clientX - r.left) / v.s + v.x - 160, y: (e.clientY - r.top) / v.s + v.y - 110 } : { x: 0, y: 0 };
    setCtx({
      x: e.clientX, y: e.clientY, compact: true,
      items: [
        { sub: '添加节点' },
        { label: '文本', onClick: () => addNode('text', p) }, { label: '图片', onClick: () => addNode('image', p) },
        { label: '视频', onClick: () => addNode('video', p) }, { label: '音频', onClick: () => addNode('audio', p) },
        { label: '脚本', onClick: () => addNode('script', p), badge: 'Beta' },
        { label: '720空间场景', onClick: () => addNode('vr720-gen', p) },
        { label: '720全景预览', onClick: () => addNode('panorama-viewer', p) },
        { label: '资产生成', onClick: () => addNode('asset-gen', p) },
        { label: '提示词调用', onClick: () => addNode('prompt-runner', p) },
        { label: '分镜收集细节', onClick: () => addNode('storyboard-collector-detail', p) },
        { label: '剪映导出', onClick: () => addNode('jianying-export', p) },
        { label: '全景环绕控制', onClick: () => addNode('director-stage', p) },
        { sep: true },
        { sub: '添加资源' },
        { label: '上传', onClick: () => requestUpload(null, null, p) },
        { label: '从图库选择' },
      ],
    });
  }, [selection, requestGroupSelectedNodes, duplicateSelectedNodes, downloadSelectedNodes, addNode, requestUpload, collectNodesIntoNearestStoryboardCollector, readCanvasNodes]);

  // === Zoom helpers ===
  const onZoom = React.useCallback((d) => {
    if (!canvasRef.current) return;
    const v = canvasRef.current.get();
    const newS = Math.max(0.2, Math.min(2.5, v.s + d));
    const el = document.querySelector('.canvas-root');
    const r = el?.getBoundingClientRect();
    if (r) canvasRef.current.zoomTo(newS, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }, []);

  const onFit = React.useCallback(() => { canvasRef.current?.set({ x: -60, y: -60, s: 1 }); }, []);

  // === Project management ===
  const createProjectFromName = React.useCallback((e) => {
    e?.preventDefault?.();
    const name = newProjectName.trim() || '未命名项目';
    createAndSwitchProject(name, { nodes: [], edges: [] })
      .then(() => {
        uiActions.clearSelection();
        setNewProjectName('');
        openCanvasView();
      })
      .catch((error) => console.error('Create project failed', error));
  }, [newProjectName, openCanvasView]);

  const pickProjectAndOpen = React.useCallback((projectId) => {
    if (!projectId) return;
    if (projectId === currentProjectId) {
      openCanvasView();
      return;
    }
    Promise.resolve(switchProject(projectId))
      .then(() => {
        uiActions.clearSelection();
        openCanvasView();
      })
      .catch((error) => console.error('Switch project failed', error));
  }, [currentProjectId, openCanvasView]);

  const deleteProjectById = React.useCallback((projectId) => {
    if (!projectId || projectId === 'local-default') return;
    Promise.resolve(deleteProject(projectId))
      .then(() => {
        if (projectId === currentProjectId) {
          uiActions.clearSelection();
          returnToProjectsView();
        }
      })
      .catch((error) => console.error('Delete project failed', error));
  }, [currentProjectId, returnToProjectsView]);

  const exportProjectById = React.useCallback(async (projectId) => {
    if (!projectId || exportingProjectRef.current) return;
    exportingProjectRef.current = projectId;
    setExportingProjectId(projectId);
    try {
      const archive = await buildProjectArchive(projectId);
      const name = archive.project?.name || projectList.find((item) => item.id === projectId)?.name || 'libai-project';
      await triggerDownload(
        {
          filename: `${safeFileName(name, 'libai-project')}.libai-project.json`,
          kind: 'json',
          mime: 'application/json;charset=utf-8',
        },
        JSON.stringify(archive, null, 2),
        'application/json;charset=utf-8',
      );
      if (archive.warnings?.length && typeof window !== 'undefined' && window.alert) {
        window.alert(`项目已导出，但有 ${archive.warnings.length} 个素材未能嵌入，导入后可能需要重新关联。`);
      }
    } catch (error) {
      console.error('Export project failed', error);
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`导出项目失败：${error instanceof Error ? error.message : String(error || '未知错误')}`);
      }
    } finally {
      exportingProjectRef.current = '';
      setExportingProjectId('');
    }
  }, [projectList]);

  const exportCurrentProject = React.useCallback(() => {
    const projectId = currentProjectId || project?.id;
    if (projectId) void exportProjectById(projectId);
  }, [currentProjectId, exportProjectById, project?.id]);

  const importProjectFromFile = React.useCallback(async (file) => {
    if (!file || importingProjectRef.current) return;
    importingProjectRef.current = true;
    setImportingProject(true);
    try {
      const archive = await readProjectArchiveFile(file);
      const result = await importProjectArchive(archive);
      uiActions.clearSelection();
      openCanvasView();
      if (result.warnings?.length && typeof window !== 'undefined' && window.alert) {
        window.alert(`项目已导入，但有 ${result.warnings.length} 个素材未能恢复，导入后可能需要重新关联。`);
      }
    } catch (error) {
      console.error('Import project failed', error);
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`导入项目失败：${error instanceof Error ? error.message : String(error || '未知错误')}`);
      }
    } finally {
      importingProjectRef.current = false;
      setImportingProject(false);
    }
  }, [openCanvasView]);

  const applyProjectStoragePath = React.useCallback(async (folderPath) => {
    await flushCanvasNow();
    const result = await ProjectStore.setStoragePath(folderPath);
    await bootstrapPersistence();
    return result;
  }, []);

  // === Global keyboard shortcuts ===
  React.useEffect(() => {
    const h = (e) => {
      const isUndoShortcut = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
      if (isUndoShortcut) {
        if (shouldUseNativeUndoTarget(e.target)) return;
        if (canvasUndoActions.undo()) e.preventDefault();
        return;
      }
      if (shouldUseNativeUndoTarget(e.target)) return;
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) { setShowShortcuts(true); e.preventDefault(); }
      else if (e.key === 'Escape') { setShowShortcuts(false); setCtx(null); setRailPop(null); }
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!selection.length) return;
        removeNodeIds(selection);
        uiActions.clearSelection();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        requestGroupSelectedNodes();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelectedNodes();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [duplicateSelectedNodes, requestGroupSelectedNodes, removeNodeIds, selection]);

  // === Derived: assetFolders for RailPopover ===
  const assetFolders = React.useMemo(() => {
    if (!assets.length) return [];
    const counts = assets.reduce((acc, a) => { acc[a.kind] = (acc[a.kind] || 0) + 1; return acc; }, {});
    return [
      { id: 'project-images', name: '当前项目 · 图片', count: counts.image || 0, kind: 'image' },
      { id: 'project-videos', name: '当前项目 · 视频', count: counts.video || 0, kind: 'video' },
      { id: 'project-audio',  name: '当前项目 · 音频', count: counts.audio || 0, kind: 'audio' },
      { id: 'project-uploads', name: '上传素材', count: assets.filter(a => a.source === 'upload').length, kind: 'upload' },
    ].filter(a => a.count > 0);
  }, [assets]);

  const themeClass = tweaks.themeKey === 'b' ? 'theme-b' : 'theme-a';
  const productShellClassName = `${themeClass} product-shell${hasWindowChrome ? ' has-window-chrome' : ''}`;
  const applyProductTheme = React.useCallback((next) => {
    setTweaks('themeKey', next);
    setTweaks('accent', next === 'a' ? '#55B6F2' : '#C6A66A');
  }, [setTweaks]);
  const toggleProductTheme = React.useCallback(() => {
    applyProductTheme(tweaks.themeKey === 'a' ? 'b' : 'a');
  }, [applyProductTheme, tweaks.themeKey]);

  const resolveDesignSpaceProjectIds = React.useCallback((request = {}) => {
    const canvasProjectId = currentProjectId || project?.id || 'local-default';
    return {
      designProjectId: request.projectId || canvasProjectId,
      assetProjectId: request.assetProjectId || canvasProjectId,
    };
  }, [currentProjectId, project?.id]);

  const waitForDesignSpaceJob = React.useCallback(async (jobId) => {
    if (!jobId) return null;
    const terminal = new Set(['completed', 'failed', 'canceled']);
    for (let attempt = 0; attempt < DESIGN_SPACE_PARSE_JOB_POLL_ATTEMPTS; attempt += 1) {
      const job = await JobStore.get(jobId);
      if (terminal.has(job?.status)) return job;
      await new Promise((resolve) => window.setTimeout(resolve, DESIGN_SPACE_JOB_POLL_INTERVAL_MS));
    }
    return JobStore.get(jobId);
  }, []);

  const handleDesignSpaceParse = React.useCallback(async ({ sourceText, projectStyle, modelId, projectId: requestProjectId, assetProjectId: requestAssetProjectId }) => {
    const { designProjectId, assetProjectId } = resolveDesignSpaceProjectIds({
      projectId: requestProjectId,
      assetProjectId: requestAssetProjectId,
    });
    const model = resolveDesignModel(designTextModels, modelId);
    if (!sourceText?.trim() || !model) return;
    const selectedModelId = designModelOptionId(model);
    const selectedModelName = model.displayName || model.modelName || model.name || selectedModelId;
    const parseCapability = designParseModelCapability(model);
    const prompt = buildDesignSpaceExtractionPrompt({ sourceText, projectStyle });
    try {
      const job = await JobStore.create(`design_parse_${designProjectId}`, {
        type: parseCapability,
        capability: parseCapability,
        tab: 'text',
        projectId: assetProjectId,
        designSpaceProjectId: designProjectId,
        prompt,
        title: '设计空间解析',
        model: selectedModelName,
        modelId: selectedModelId,
        providerModelId: selectedModelId,
        modelName: model.modelName || selectedModelName,
        provider: model.providerId,
        _designSpace: 'parse',
      });
      const terminal = job?.id ? await waitForDesignSpaceJob(job.id) : job;
      const text = extractCompletedDesignSpaceJobText(terminal);
      const parsed = parseDesignSpaceP0Response(text, { projectId: designProjectId, sourceText, title: project?.name || '设计空间' });
      designSpaceActions.setPackage(designProjectId, {
        ...parsed,
        sourceText,
        parseError: '',
        rawParseOutput: text,
        projectMeta: { ...parsed.projectMeta, visualStyle: projectStyle || parsed.projectMeta.visualStyle },
      });
    } catch (error) {
      designSpaceActions.patchPackage(designProjectId, {
        sourceText,
        parseError: error instanceof Error ? error.message : String(error || '解析失败'),
        rawParseOutput: '',
      });
    }
  }, [designTextModels, project?.name, resolveDesignSpaceProjectIds, waitForDesignSpaceJob]);

  const handleDesignSpaceGenerateCard = React.useCallback(async ({
    card,
    modelId,
    template,
    projectStyle: requestProjectStyle,
    imageParams,
    promptPrefix,
    projectId: requestProjectId,
    assetProjectId: requestAssetProjectId,
  }) => {
    const { designProjectId, assetProjectId } = resolveDesignSpaceProjectIds({
      projectId: requestProjectId,
      assetProjectId: requestAssetProjectId,
    });
    const foundModel = designImageModels.find((item) => designModelOptionId(item) === modelId) || designImageModels[0];
    if (!card || !foundModel) return;

    const model = foundModel.id ? foundModel : { ...foundModel, id: designModelOptionId(foundModel) };
    const currentPkg = designSpaceStore.getState().packagesByProject[designProjectId];
    const projectStyle = requestProjectStyle || currentPkg?.projectMeta?.visualStyle || '';
    const payload = buildDesignImagePayload({ card, projectStyle, model, template, imageParams, promptPrefix });
    const bucket = card.type === 'scene' ? 'scenes' : card.type === 'prop' ? 'props' : 'characters';
    const cards = designSpaceStore.getState().packagesByProject[designProjectId]?.[bucket] || [];

    designSpaceActions.patchPackage(designProjectId, {
      [bucket]: cards.map((item) => (item.id === card.id ? { ...item, status: 'generating' } : item)),
    });

    try {
      const job = await JobStore.create(`design_card_${designProjectId}_${card.id}`, {
        ...payload,
        projectId: assetProjectId,
        designSpaceProjectId: designProjectId,
      });
      const terminal = job?.id ? await waitForDesignSpaceJob(job.id) : job;
      const latestPkg = designSpaceStore.getState().packagesByProject[designProjectId];
      if (latestPkg) {
        designSpaceActions.setPackage(
          designProjectId,
          applyDesignCardJobToPackage(latestPkg, terminal),
        );
      }
    } catch (error) {
      const latestPkg = designSpaceStore.getState().packagesByProject[designProjectId];
      const failedVersion = {
        id: `ver_failed_${Date.now().toString(36)}`,
        cardId: card.id,
        prompt: payload.prompt,
        negativePrompt: payload.negativePrompt,
        ratio: payload.ratio,
        status: 'failed',
        templateId: template?.id || '',
        templateName: template?.name || '',
        error: error instanceof Error ? error.message : String(error || '生成失败'),
        createdAt: new Date().toISOString(),
      };
      if (latestPkg) designSpaceActions.setPackage(designProjectId, appendDesignVersion(latestPkg, card.id, failedVersion));
    }
  }, [designImageModels, resolveDesignSpaceProjectIds, waitForDesignSpaceJob]);

  const handleDesignSpaceBatchGenerate = React.useCallback(async ({ cards = [], modelId, projectStyle, imageParams, promptPrefix, projectId, assetProjectId, templates = [] }) => {
    const foundModel = designImageModels.find((item) => designModelOptionId(item) === modelId) || designImageModels[0] || {};
    const queueOptions = designGenerationQueueOptionsForModel(foundModel);
    await runDesignGenerationQueue({
      cards,
      templates,
      ...queueOptions,
      runTask: ({ card, template }) => (
        handleDesignSpaceGenerateCard({ card, modelId, template, projectStyle, imageParams, promptPrefix, projectId, assetProjectId })
      ),
    });
  }, [designImageModels, handleDesignSpaceGenerateCard]);

  const handleDesignSpaceSaveVersion = React.useCallback(({ card, version, projectId: requestProjectId, assetProjectId: requestAssetProjectId } = {}) => {
    if (!card || !version?.assetUrl) return;

    const { designProjectId, assetProjectId } = resolveDesignSpaceProjectIds({
      projectId: requestProjectId,
      assetProjectId: requestAssetProjectId,
    });
    const designPackage = designSpaceStore.getState().packagesByProject[designProjectId];
    const meta = designAssetMeta({ packageId: designPackage?.id, card, version });
    const assetPath = version.localPath || version.assetPath || '';
    const record = withLibraryFlag(withProjectAssetScope(makeAssetRecord({
      kind: 'image',
      src: version.assetUrl,
      url: version.assetUrl,
      assetUrl: version.assetUrl,
      title: card.name,
      source: 'design-space',
      prompt: version.prompt,
      assetId: version.assetId,
      assetPath,
      id: version.assetId || `asset_${version.id}`,
      meta,
    }), assetProjectId));

    libraryActions.recordAssets([record]);

    const latestPackage = designSpaceStore.getState().packagesByProject[designProjectId];
    if (latestPackage) {
      designSpaceActions.setPackage(designProjectId, updateDesignCard(latestPackage, card.id, {
        status: 'saved',
        savedVersionId: version.id,
      }));
    }
  }, [resolveDesignSpaceProjectIds]);

  const handleDesignSpaceLoadVersionToCanvas = React.useCallback(({ card, version } = {}) => {
    if (!card || !version?.assetUrl) return;

    const node = createDesignImageNode({ card, version, position: getViewportCenter() });
    canvasUndoActions.run('design-space-load-version', () => {
      canvasActions.setNodes((items) => [...items, node]);
      uiActions.setSelection([node.id]);
      openCanvasView();
      window.setTimeout(() => focusNodesInCanvas([node]), 0);
    });
  }, [focusNodesInCanvas, getViewportCenter, openCanvasView]);

  if (!EMBED_MODE && !launched) {
    return (
      <div className={productShellClassName} style={{ '--accent': tweaks.accent }}>
        <style>{shellStyles}</style>
        <AppWindowChrome />
        <LauncherGate onLaunch={handleLaunch} />
        {loginDeclarationOpen && (
          <SoftwareDeclarationModal
            dismissible={false}
            onClose={() => setLoginDeclarationOpen(false)}
            onConfirm={handleLoginDeclarationConfirm}
          />
        )}
      </div>
    );
  }

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <div className={productShellClassName} style={{ '--accent': tweaks.accent }}>
      <style>{canvasStyles}</style>
      <style>{nodeStyles}</style>
      <style>{panelStyles}</style>
      <style>{genStyles}</style>
      <style>{modalStyles}</style>
      <style>{shellStyles}</style>
      <style>{onboardingStyles}</style>
      <style>{designSpaceStyles}</style>
      <AppWindowChrome />
      {loginDeclarationOpen && (
        <SoftwareDeclarationModal
          dismissible={false}
          onClose={() => setLoginDeclarationOpen(false)}
          onConfirm={handleLoginDeclarationConfirm}
        />
      )}

      {!EMBED_MODE && activeView !== 'canvas' && (
        <ProductSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          project={project}
          assets={assets}
          onOpenUserCenter={openUserCenter}
          onOpenOnboarding={openOnboardingTour}
          themeKey={tweaks.themeKey}
          onToggleTheme={toggleProductTheme}
        />
      )}

      <main className="product-main">
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*" style={{ display: 'none' }} onChange={onUploadInputChange} />

        {!EMBED_MODE && activeView === 'projects' && !projectBootstrapReady && (
          <ProjectBootstrapScreen />
        )}
        {!EMBED_MODE && activeView === 'projects' && projectBootstrapReady && (
          <ProjectHomePage
            projects={projectList}
            currentProjectId={currentProjectId}
            newProjectName={newProjectName} onNewProjectNameChange={setNewProjectName}
            onCreateProject={createProjectFromName}
            onOpenCanvas={openCanvasView}
            onPickProject={pickProjectAndOpen}
            onDeleteProject={deleteProjectById}
            onExportProject={exportProjectById}
            onExportCurrentProject={exportCurrentProject}
            onImportProject={importProjectFromFile}
            exportingProjectId={exportingProjectId}
            importingProject={importingProject}
          />
        )}
        {!EMBED_MODE && activeView === 'assets' && (
          <AssetLibraryPage
            assets={assets}
            projects={projectList}
            project={project}
            projectId={currentProjectId || project?.id}
            onImportAssets={requestLibraryImport}
            onUseAsset={insertAssetToCanvas}
          />
        )}
        {!EMBED_MODE && activeView === 'models' && (
          <ModelConfigPage />
        )}
        {!EMBED_MODE && activeView === 'settings' && (
          <ProjectSettingsPage onApplyStoragePath={applyProjectStoragePath} />
        )}
        {!EMBED_MODE && activeView === 'guide' && (
          <UserGuidePage />
        )}
        {!EMBED_MODE && activeView === 'announcements' && (
          <AnnouncementCenterPage
            history={announcementHistory}
            syncError={announcementSyncError}
          />
        )}

        {(EMBED_MODE || activeView === 'canvas') && (
          <div className="canvas-screen" data-onboarding-id="canvas-screen">
            <Canvas
              ref={canvasRef}
              bgStyle={tweaks.bgStyle}
              onContextMenu={onCanvasContext}
              onNodeContextMenu={onNodeContextMenu}
              onGroupContextMenu={onGroupContextMenu}
              onBackgroundPanelContextMenu={onBackgroundPanelContextMenu}
              onGroupRun={runGroupMediaGeneration}
              onOpenModal={openModal}
              onUpdateNode={updateNodeWithUndo}
              onDropFiles={(files, at) => applyUploadedFiles(files, { at })}
              onGenerate={runGenerator}
              onGeneratePanorama={runPanoramaGeneration}
              onRunSlash={runSlashCommand}
              onSave={() => {}}
              onDownload={downloadSelectedNodes}
              onDuplicate={duplicateSelectedNodes}
              onGroup={requestGroupSelectedNodes}
              onCompose={selection.length >= 2 ? () => uiActions.openModal({ kind: 'timeline' }) : null}
              onViewportScaleChange={setViewScale}
              onCollectIntoStoryboard={collectNodesIntoStoryboardCollector}
              onStoryboardCollectorRestoreItem={restoreStoryboardCollectorItem}
              onStoryboardCollectorDropItem={restoreStoryboardCollectorItem}
            />

            {generatorVisible && (
              <Generator onGenerate={runGenerator} onRunSlash={runSlashCommand} onOpenModal={openModal} projectId={project?.id} />
            )}

            <MiniTopBar
              themeKey={tweaks.themeKey}
              onToggleTheme={toggleProductTheme}
              onOpenProjects={() => uiActions.openOverlayModal('projects')}
              onBackToProjects={returnToProjectsView}
            />

            {tweaks.showRail && (
              <LeftRailMini
                active={railPop}
                onChange={(k) => {
                  setDesignSpaceVisible(false);
                  setRailPop(k === railPop ? null : k);
                }}
                generatorVisible={generatorVisible}
                onToggleGenerator={() => {
                  setDesignSpaceVisible(false);
                  setGeneratorVisible(v => !v);
                }}
                localFilesVisible={localFilesVisible}
                onToggleLocalFiles={() => {
                  setDesignSpaceVisible(false);
                  setLocalFilesVisible(v => !v);
                }}
                upscaleVisible={upscaleVisible}
                onToggleUpscale={() => {
                  setDesignSpaceVisible(false);
                  setUpscaleVisible(v => !v);
                }}
                onOpenSeedencePortraitLibrary={() => {
                  setDesignSpaceVisible(false);
                  setRailPop(null);
                  uiActions.openModal({ kind: 'seedencePortraitLibrary' });
                }}
              />
            )}

            {designSpaceVisible && (
              <div className="canvas-design-space-layer">
                <DesignSpacePage
                  project={project}
                  projectId={currentProjectId || project?.id}
                  models={designTextModels}
                  imageModels={designImageModels}
                  promptTemplates={designPromptTemplates}
                  templateStatus={designTemplateStatus}
                  onBackToCanvas={() => setDesignSpaceVisible(false)}
                  onParse={handleDesignSpaceParse}
                  onGenerateCard={handleDesignSpaceGenerateCard}
                  onBatchGenerate={handleDesignSpaceBatchGenerate}
                  onSaveVersion={handleDesignSpaceSaveVersion}
                  onLoadVersionToCanvas={handleDesignSpaceLoadVersionToCanvas}
                />
              </div>
            )}

            {localFilesVisible && (
              <LocalFilesPanel
                onClose={() => setLocalFilesVisible(false)}
                onInsertFile={insertLocalFile}
              />
            )}
            {upscaleVisible && (
              <UpscalePanel
                projectId={project?.id}
                canvasImages={canvasImageNodes}
                selectedImages={selectedImageNodes}
                incomingImages={upscaleIncomingImages}
                onIncomingConsumed={() => setUpscaleIncomingImages([])}
                onClose={() => setUpscaleVisible(false)}
                onInsertAsset={insertUpscaleAsset}
                onSaveSubjectAsset={saveUpscaleAssetToSubject}
              />
            )}
            {railPop && (
              <RailPopover
                railKey={railPop} onClose={() => setRailPop(null)}
                onAddNode={addNode}
                onOpenModal={(k) => openModal(k, selection[0])}
                onOpenOverlay={(k) => {
                  setRailPop(null);
                  const overlayKind = typeof k === 'string' ? k : k?.kind;
                  if (overlayKind === 'history') {
                    uiActions.openOverlayModal({ kind: 'history', onUseHistoryItems: insertHistoryItemsToCanvas });
                    return;
                  }
                  if (overlayKind === 'assets' || overlayKind === 'subject') {
                    openSubjectLibraryOverlay(k);
                    return;
                  }
                  uiActions.openOverlayModal(k);
                }}
                onFocusNode={focusTaskNodeInCanvas}
                onUseHistoryItem={insertHistoryItemToCanvas}
                assetFolders={assetFolders}
              />
            )}

            <ZoomCtl scale={viewScale} onZoom={onZoom} onFit={onFit} />
            {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
            {ctx && <ContextMenu {...ctx} onClose={() => setCtx(null)} />}
            {pendingGroup && (
              <div className="modal-mask" onClick={closeGroupNameDialog} role="presentation">
                <form className="modal group-name-modal" onClick={(e) => e.stopPropagation()} onSubmit={confirmGroupNameDialog}>
                  <header>
                    <h2>新建组合</h2>
                    <button type="button" className="close" onClick={closeGroupNameDialog}>关闭</button>
                  </header>
                  <div className="body group-name-body">
                    <label className="group-name-field">
                      <span>组合名称</span>
                      <input
                        autoFocus
                        value={groupNameDraft}
                        onChange={(e) => setGroupNameDraft(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder={pendingGroup.fallbackName}
                      />
                    </label>
                    <div className="group-name-meta">已选 {pendingGroup.count} 个节点</div>
                    <div className="group-name-actions">
                      <button type="button" className="x-btn ghost" onClick={closeGroupNameDialog}>取消</button>
                      <button type="submit" className="x-btn primary">创建组合</button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            {pendingRenameNode && (
              <NodeRenameDialog
                node={pendingRenameNode}
                onClose={closeRenameNodeDialog}
                onConfirm={confirmRenameNodeDialog}
              />
            )}
            {pendingBackgroundPanel && (
              <div className="modal-mask" onClick={closeBackgroundPanelDialog} role="presentation">
                <form className="modal group-name-modal" onClick={(e) => e.stopPropagation()} onSubmit={confirmBackgroundPanelDialog}>
                  <header>
                    <h2>设置背景板</h2>
                    <button type="button" className="close" onClick={closeBackgroundPanelDialog}>关闭</button>
                  </header>
                  <div className="body group-name-body">
                    <label className="group-name-field">
                      <span>背景板名称</span>
                      <input
                        autoFocus
                        value={backgroundPanelDraft.title}
                        onChange={(e) => setBackgroundPanelDraft((current) => ({ ...current, title: e.target.value }))}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder="背景板"
                      />
                    </label>
                    <div className="background-panel-color-field">
                      <span>背景板颜色</span>
                      <div className="background-panel-color-row">
                        {BACKGROUND_PANEL_COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`background-panel-color-option ${backgroundPanelDraft.color === color ? 'active' : ''}`}
                            style={{ '--background-panel-option-color': color }}
                            aria-label={`选择颜色 ${color}`}
                            onClick={() => setBackgroundPanelDraft((current) => ({ ...current, color }))}
                          />
                        ))}
                        <input
                          className="background-panel-color-input"
                          type="color"
                          value={backgroundPanelDraft.color}
                          onChange={(e) => setBackgroundPanelDraft((current) => ({ ...current, color: e.target.value }))}
                          aria-label="自定义背景板颜色"
                        />
                      </div>
                    </div>
                    <div className="group-name-actions">
                      <button type="button" className="x-btn ghost" onClick={closeBackgroundPanelDialog}>取消</button>
                      <button type="submit" className="x-btn primary">保存设置</button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            {!EMBED_MODE && (
              <TweaksPanel title="Tweaks">
                <TweakSection title="视觉方案">
                  <TweakRadio label="方案" value={tweaks.themeKey} options={[{ value: 'a', label: '白色主题' }, { value: 'b', label: '黑色主题' }]} onChange={applyProductTheme} />
                  <TweakColor label="强调色" value={tweaks.accent} onChange={(v) => setTweaks('accent', v)} />
                </TweakSection>
                <TweakSection title="画布">
                  <TweakRadio label="背景" value={tweaks.bgStyle} options={[{ value: 'dots', label: '点阵' }, { value: 'grid', label: '网格' }, { value: 'solid', label: '纯色' }]} onChange={(v) => setTweaks('bgStyle', v)} />
                  <TweakToggle label="左侧工具栏" value={tweaks.showRail} onChange={(v) => setTweaks('showRail', v)} />
                  <TweakToggle label="操作提示" value={tweaks.showTip} onChange={(v) => setTweaks('showTip', v)} />
                </TweakSection>
              </TweaksPanel>
            )}
          </div>
        )}
      </main>

      {!EMBED_MODE && userCenterOpen && (
        <div
          className="account-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="用户中心"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeUserCenter();
          }}
        >
          <UserCenterPage
            variant="modal"
            onClose={closeUserCenter}
            onSignedOut={handleSignedOut}
          />
        </div>
      )}

      {!EMBED_MODE && (
        <DesktopAnnouncementModal
          announcement={activeAnnouncement}
          onClose={() => desktopAnnouncementActions.close({
            id: activeAnnouncement?.id,
            contentHash: activeAnnouncement?.contentHash ?? activeAnnouncement?.content_hash,
          })}
        />
      )}

      {!EMBED_MODE && normalAnnouncement && (
        <div className="desktop-announcement-toast" role="status" aria-live="polite">
          <strong>{normalAnnouncement.title || '公告'}</strong>
          <span>{normalAnnouncement.content || ''}</span>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              className="x-btn ghost"
              onClick={() => {
                desktopAnnouncementActions.close({
                  id: normalAnnouncement.id,
                  contentHash: normalAnnouncement.contentHash ?? normalAnnouncement.content_hash,
                });
                setActiveView('announcements');
              }}
            >
              查看
            </button>
            <button
              type="button"
              className="x-btn primary"
              onClick={() => desktopAnnouncementActions.close({
                id: normalAnnouncement.id,
                contentHash: normalAnnouncement.contentHash ?? normalAnnouncement.content_hash,
              })}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {portraitImportNotice && (
        <div
          className={`canvas-action-toast ${portraitImportNotice.tone || 'info'}${normalAnnouncement ? ' stacked' : ''}`}
          role="status"
          aria-live="polite"
        >
          <strong>{portraitImportNotice.title}</strong>
          {portraitImportNotice.message ? <span>{portraitImportNotice.message}</span> : null}
        </div>
      )}

      <ModalRoot />

      <OnboardingTour
        open={!EMBED_MODE && onboardingOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        openCanvasView={openCanvasView}
        generatorVisible={generatorVisible}
        setGeneratorVisible={setGeneratorVisible}
        onClose={closeOnboardingTour}
        onComplete={completeOnboardingTour}
      />

      <style>{workbenchStyles}</style>

      {workbenchNodeId && (
        <StoryboardWorkbench
          nodeId={workbenchNodeId}
          initialTab={workbenchEntryOptions?.initialTab}
          packageSourceMode={workbenchEntryOptions?.sourceMode}
          entry={workbenchEntryOptions?.entry}
          task={workbenchTask}
          designModels={designTextModels}
          imageModels={designImageModels}
          videoModels={designVideoModels}
          designPromptTemplates={designPromptTemplates}
          designTemplateStatus={designTemplateStatus}
          onDesignSpaceParse={handleDesignSpaceParse}
          onDesignSpaceGenerateCard={handleDesignSpaceGenerateCard}
          onDesignSpaceBatchGenerate={handleDesignSpaceBatchGenerate}
          onDesignSpaceSaveVersion={handleDesignSpaceSaveVersion}
          onDesignSpaceLoadVersionToCanvas={handleDesignSpaceLoadVersionToCanvas}
          onOpenDesignSpace={() => {
            const projectId = currentProjectId || project?.id || 'local-default';
            designSpaceActions.ensurePackage(projectId, {
              title: `${project?.name || '项目'}设计空间`,
            });
            setWorkbenchNodeId(null);
            setWorkbenchEntryOptions(null);
            setRailPop(null);
            setLocalFilesVisible(false);
            setUpscaleVisible(false);
            setGeneratorVisible(false);
            setActiveView('canvas');
            setDesignSpaceVisible(true);
          }}
          onClose={() => {
            setWorkbenchNodeId(null);
            setWorkbenchEntryOptions(null);
          }}
          onDeployPackage={deployStoryboardPackageToCanvas}
          onGeneratePackageMedia={generateStoryboardPackageMedia}
          onTask={(task) => setWorkbenchTaskForNode(workbenchNodeId, task)}
          onStopPromptInferenceQueue={stopPromptInferenceQueue}
          onCancelPromptInferenceRunning={cancelPromptInferenceRunning}
          onCancelPromptInferenceQueueTask={cancelPromptInferenceQueueTask}
        />
      )}

      {showCamCtrl && (
        <div className="cc-popover-backdrop" onClick={() => setShowCamCtrl(false)} role="presentation">
          <div onClick={(e) => e.stopPropagation()}>
            <CamCtrlPanel
              mode={showCamCtrl}
              onClose={() => setShowCamCtrl(false)}
              onApply={(params) => { console.log('camctrl apply', params); }}
            />
          </div>
        </div>
      )}

      {EMBED_MODE && EMBED_LABEL && (
        <div style={{ position: 'absolute', left: 14, bottom: 14, zIndex: 50, padding: '6px 10px', borderRadius: 8, background: 'color-mix(in oklab, var(--paper) 92%, transparent)', border: '1px solid var(--line)', color: 'var(--ink-soft)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1, backdropFilter: 'blur(8px)', pointerEvents: 'none' }}>{EMBED_LABEL}</div>
      )}
    </div>
  );
}
