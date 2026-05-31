import React from 'react';
import { summarizeShotGroupsForDeployment } from '../deployment/canvasDeploymentDraft.js';
import { makeAssetUrl } from '../../../shared/platform/backendClient.js';
import { TaskProgressBadge } from './components/TaskProgressPanel.jsx';
import { ProviderStore } from '../../../shared/platform/providerStore.js';
import { modelLabel, selectBackendModel } from '../../../shared/platform/modelSelection.js';
import {
  IClose,
  IImage,
  IVideo,
} from '../../../shared/ui/icons/index.jsx';
import {
  durationOptionsForModel,
  includeGenerateAudioForModel,
  includeResolutionForModel,
  normalizeVideoModeForModel,
  referenceModeForVideoMode,
  ratioOptionsForModel,
  resolutionOptionsForModel,
  VIDEO_MODE_OPTIONS,
  videoModeOptionsForModel,
} from '../../../shared/platform/generationModelParams.js';

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());
const DEFAULT_IMAGE_RATIOS = Object.freeze(['Auto', '16:9', '4:3', '1:1', '3:4', '9:16', '21:9']);
const DEFAULT_VIDEO_RATIOS = Object.freeze(['16:9', '9:16']);
const DEFAULT_IMAGE_RESOLUTIONS = Object.freeze(['1K', '2K', '4K']);
const DEFAULT_VIDEO_RESOLUTIONS = Object.freeze(['480P', '720P', '1080P']);
const DEFAULT_VIDEO_DURATIONS = Object.freeze([5, 8, 10, 15]);

const getTaskGroupId = (task) => (
  clean(task?.shotGroupId || task?.shotGroup || task?.groupId) || 'ungrouped'
);

const nodeGroupId = (node) => (
  clean(node?.storyboardShotGroupId || node?.shotGroupId)
);

const hasNodeMedia = (node, kind) => {
  if (!node) return false;
  if (kind === 'image') {
    return Boolean(clean(node.src || node.imageUrl || node.url || node.assetUrl || node.assetPath));
  }
  return Boolean(clean(node.videoSrc || node.videoUrl || node.assetUrl || node.assetPath || node.poster));
};

const mediaUrl = (node, kind) => {
  if (!node) return '';
  if (kind === 'image') {
    return makeAssetUrl({
      src: node.src || node.imageUrl || node.url || node.assetUrl || node.assetPath,
      url: node.url,
      assetUrl: node.assetUrl,
      id: node.assetId,
    });
  }
  return makeAssetUrl({
    src: node.videoSrc || node.videoUrl || node.assetUrl || node.assetPath || node.poster,
    url: node.videoUrl,
    assetUrl: node.assetUrl,
    id: node.assetId,
  });
};

const mediaStatus = (node, kind) => {
  const label = kind === 'image' ? '图片' : '视频';
  if (node?.error) return `${label}失败`;
  if (node?.generating) {
    const progress = Math.max(1, Math.min(99, Number(node.progress) || 1));
    return `${label} ${progress}%`;
  }
  if (hasNodeMedia(node, kind)) return `${label}完成`;
  return `${label}等待`;
};

const buildNodeLookup = (nodes) => new Map(
  (Array.isArray(nodes) ? nodes : [])
    .filter((node) => node?.id)
    .map((node) => [node.id, node]),
);

const connectedNodesFor = (nodeId, nodesById, canvasEdges) => {
  if (!nodeId) return [];
  return (Array.isArray(canvasEdges) ? canvasEdges : [])
    .filter((edge) => edge?.from === nodeId || edge?.to === nodeId)
    .map((edge) => nodesById.get(edge.from === nodeId ? edge.to : edge.from))
    .filter(Boolean);
};

const resolveGroupPreview = ({ groupId, storyboardPackage, canvasNodes, canvasEdges }) => {
  const nodes = Array.isArray(canvasNodes) ? canvasNodes : [];
  const nodesById = buildNodeLookup(nodes);
  const tasks = Array.isArray(storyboardPackage?.generationPlan?.shotTasks)
    ? storyboardPackage.generationPlan.shotTasks
    : [];
  const groupTasks = tasks.filter((task) => getTaskGroupId(task) === groupId);
  const linkedIds = groupTasks.reduce((next, task) => ({
    ...next,
    ...(task?.linkedCanvasNodeIds || {}),
  }), {});
  const packageId = storyboardPackage?.id;
  const nodeId = storyboardPackage?.nodeId;
  const belongsToCurrentScript = (item) => (
    item
    && (!packageId || item.deployedFromPackageId === packageId)
    && (!nodeId || item.deployedFromNodeId === nodeId)
  );
  const linkedNode = (id) => {
    const item = nodesById.get(id);
    return belongsToCurrentScript(item) ? item : null;
  };
  const groupNode = linkedNode(linkedIds.groupNodeId)
    || nodes.find((item) => (
      item?.type === 'group'
      && item?.deploymentRole === 'group'
      && nodeGroupId(item) === groupId
      && belongsToCurrentScript(item)
    ));
  const deployedNodes = nodes.filter((item) => (
    item?.deploymentKind === 'storyboard'
    && nodeGroupId(item) === groupId
    && belongsToCurrentScript(item)
  ));
  const connected = connectedNodesFor(groupNode?.id, nodesById, canvasEdges);
  const imageNode = linkedNode(linkedIds.imageNodeId)
    || deployedNodes.find((item) => item.deploymentRole === 'image')
    || connected.find((item) => item.type === 'image' && hasNodeMedia(item, 'image'));
  const videoNode = linkedNode(linkedIds.videoNodeId)
    || deployedNodes.find((item) => item.deploymentRole === 'video')
    || connected.find((item) => item.type === 'video' && hasNodeMedia(item, 'video'));

  return {
    imageNode,
    videoNode,
    imageUrl: mediaUrl(imageNode, 'image'),
    videoUrl: mediaUrl(videoNode, 'video'),
    imageStatus: mediaStatus(imageNode, 'image'),
    videoStatus: mediaStatus(videoNode, 'video'),
  };
};

const promptStatusText = (status) => {
  const normalized = clean(status).toLowerCase();
  if (normalized === 'completed') return '提示词完成';
  if (['pending', 'queued', 'running'].includes(normalized)) return '提示词推理中';
  if (normalized === 'failed') return '提示词失败';
  return '等待提示词';
};

const outputProgress = (group = {}) => {
  const total = Math.max(1, Number(group.total) || 1);
  const done = (Number(group.deployed) || 0)
    + (Number(group.imageDone) || 0)
    + (Number(group.videoDone) || 0);
  return Math.max(0, Math.min(100, Math.round((done / (total * 3)) * 100)));
};

const groupRecordId = (group = {}) => (
  clean(group?.groupId || group?.shotGroupId || group?.id)
);

const groupNote = (group = {}) => (
  clean(group?.groupNote || group?.summary || group?.sceneSummary || group?.directorNote)
);

const enabledModelList = (models) => (
  (Array.isArray(models) ? models : []).filter((model) => model?.enabled !== false)
);

const modelListKey = (models) => enabledModelList(models)
  .map((model) => `${model.id || ''}:${model.modelName || ''}:${model.displayName || ''}`)
  .join('|');

function useCapabilityModels(capability, providedModels = []) {
  const providedKey = modelListKey(providedModels);
  const [models, setModels] = React.useState(() => enabledModelList(providedModels));
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const nextProvided = enabledModelList(providedModels);
    if (nextProvided.length) {
      setModels(nextProvided);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    ProviderStore.models({ capability })
      .then((result) => {
        if (cancelled) return;
        setModels(enabledModelList(result?.models));
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [capability, providedKey]);

  return { models, loading };
}

const selectedModelFrom = (models, selectedId) => (
  enabledModelList(models).find((model) => model.id === selectedId)
  || selectBackendModel(models, { currentId: selectedId })
);

const modelPayload = (model) => (model ? {
  id: model.id,
  displayName: model.displayName,
  modelName: model.modelName,
  providerId: model.providerId,
  capability: model.capability,
  params: model.params,
} : null);

const firstEnabledVideoMode = (options) => (
  (Array.isArray(options) ? options : []).find((item) => !item.disabled)?.key
  || VIDEO_MODE_OPTIONS[0]?.key
  || 'text-video'
);

const normalizeSelectValue = (value, options, fallback) => {
  const values = (Array.isArray(options) ? options : []).map((item) => String(item));
  const current = String(value || '').trim();
  if (current && values.includes(current)) return current;
  if (fallback && values.includes(String(fallback))) return String(fallback);
  return values[0] || String(fallback || '');
};

const normalizeDurationValue = (value, options, fallback = 5) => {
  const values = (Array.isArray(options) ? options : []).map(Number).filter((item) => Number.isFinite(item));
  const current = Number(value);
  if (values.includes(current)) return current;
  const fallbackNumber = Number(fallback);
  if (values.includes(fallbackNumber)) return fallbackNumber;
  return values[0] || fallbackNumber || 5;
};

const normalizeTargetDurationValue = (value, fallback = 0) => {
  const numeric = Math.round(Number(value));
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(8, Math.min(15, numeric));
};

const targetDurationFromNode = (node = {}) => {
  if (node?.targetDuration !== undefined) {
    return normalizeTargetDurationValue(node.targetDuration);
  }
  const legacyMatch = String(node?.shotEngine || '').match(/\d+/);
  return legacyMatch ? normalizeTargetDurationValue(legacyMatch[0]) : 0;
};

function ModelSelect({
  label,
  value,
  onChange,
  models,
  loading,
  testId,
}) {
  return (
    <label className="sb-output-field">
      <span>{label}</span>
      <select
        data-testid={testId}
        value={value}
        disabled={loading || !models.length}
        onChange={(event) => onChange(event.target.value)}
      >
        {models.length ? models.map((model) => (
          <option key={model.id} value={model.id}>{modelLabel(model)}</option>
        )) : (
          <option value="">{loading ? '加载中…' : '暂无可用模型'}</option>
        )}
      </select>
    </label>
  );
}

function OptionSelect({
  label,
  value,
  onChange,
  options,
  testId,
  format = (item) => item,
  disabled = false,
}) {
  return (
    <label className="sb-output-field">
      <span>{label}</span>
      <select
        data-testid={testId}
        value={value}
        disabled={disabled || !options.length}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((item) => (
          <option key={String(item)} value={String(item)}>{format(item)}</option>
        ))}
      </select>
    </label>
  );
}

function MediaSettingsButton({
  kind,
  icon,
  title,
  summary,
  disabled = false,
  onClick,
  testId,
}) {
  return (
    <button
      type="button"
      className={`sb-output-settings-button ${kind}`}
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="sb-output-settings-icon" aria-hidden="true">{icon}</span>
      <span className="sb-output-settings-copy">
        <strong>{title}</strong>
        <em>{summary}</em>
      </span>
    </button>
  );
}

function MediaPreviewSlot({ kind, url, status, title, large = false }) {
  return (
    <div className={`sb-output-preview-slot ${kind} ${large ? 'large' : ''}`}>
      {title && <strong>{title}</strong>}
      <div className="sb-output-preview-media">
        {url ? (
          kind === 'video'
            ? <video src={url} muted playsInline preload="metadata" />
            : <img src={url} alt="" loading="lazy" />
        ) : (
          <span>{kind === 'video' ? '视频' : '图片'}</span>
        )}
      </div>
      <em>{status}</em>
    </div>
  );
}

export function OutputTab({
  node = {},
  storyboardPackage,
  onDeploy,
  onGenerateMedia,
  canvasNodes = [],
  canvasEdges = [],
  task,
  imageModels = [],
  videoModels = [],
}) {
  const deploymentGroups = summarizeShotGroupsForDeployment(storyboardPackage);
  const shotGroups = Array.isArray(storyboardPackage?.shotGroups) ? storyboardPackage.shotGroups : [];
  const imageModelResult = useCapabilityModels('image.generate', imageModels);
  const videoModelResult = useCapabilityModels('video.generate', videoModels);
  const preferredVideoDuration = targetDurationFromNode(node);
  const [imageModelId, setImageModelId] = React.useState('');
  const [videoModelId, setVideoModelId] = React.useState('');
  const [imageRatio, setImageRatio] = React.useState('16:9');
  const [imageResolution, setImageResolution] = React.useState('2K');
  const [videoRatio, setVideoRatio] = React.useState('16:9');
  const [videoResolution, setVideoResolution] = React.useState('720P');
  const [videoDuration, setVideoDuration] = React.useState(() => preferredVideoDuration || 5);
  const [videoMode, setVideoMode] = React.useState('image-video');
  const [videoAudioOn, setVideoAudioOn] = React.useState(true);
  const [openSettingsKind, setOpenSettingsKind] = React.useState('');
  const videoDurationTouchedRef = React.useRef(false);
  const imageModelsKey = modelListKey(imageModelResult.models);
  const videoModelsKey = modelListKey(videoModelResult.models);
  const selectedImageModel = React.useMemo(
    () => selectedModelFrom(imageModelResult.models, imageModelId),
    [imageModelId, imageModelsKey],
  );
  const selectedVideoModel = React.useMemo(
    () => selectedModelFrom(videoModelResult.models, videoModelId),
    [videoModelId, videoModelsKey],
  );
  const imageRatioOptions = ratioOptionsForModel(selectedImageModel, DEFAULT_IMAGE_RATIOS);
  const imageResolutionOptions = resolutionOptionsForModel(selectedImageModel, false, DEFAULT_IMAGE_RESOLUTIONS);
  const videoRatioOptions = ratioOptionsForModel(selectedVideoModel, DEFAULT_VIDEO_RATIOS);
  const videoResolutionOptions = resolutionOptionsForModel(selectedVideoModel, true, DEFAULT_VIDEO_RESOLUTIONS);
  const videoDurationOptions = durationOptionsForModel(selectedVideoModel);
  const resolvedVideoDurationOptions = videoDurationOptions.length ? videoDurationOptions : DEFAULT_VIDEO_DURATIONS;
  const videoModeOptions = videoModeOptionsForModel(selectedVideoModel);
  const activeVideoMode = normalizeVideoModeForModel(videoMode, selectedVideoModel);
  const includeImageResolution = includeResolutionForModel(selectedImageModel);
  const includeVideoResolution = includeResolutionForModel(selectedVideoModel);
  const includeVideoAudio = includeGenerateAudioForModel(selectedVideoModel);

  React.useEffect(() => {
    const preferred = selectedModelFrom(imageModelResult.models, imageModelId);
    const nextId = preferred?.id || '';
    if (nextId !== imageModelId) setImageModelId(nextId);
  }, [imageModelsKey]);

  React.useEffect(() => {
    const preferred = selectedModelFrom(videoModelResult.models, videoModelId);
    const nextId = preferred?.id || '';
    if (nextId !== videoModelId) setVideoModelId(nextId);
  }, [videoModelsKey]);

  React.useEffect(() => {
    const nextRatio = normalizeSelectValue(imageRatio, imageRatioOptions, '16:9');
    if (nextRatio !== imageRatio) setImageRatio(nextRatio);
  }, [imageRatioOptions.join('|')]);

  React.useEffect(() => {
    const nextResolution = normalizeSelectValue(imageResolution, imageResolutionOptions, '2K');
    if (nextResolution !== imageResolution) setImageResolution(nextResolution);
  }, [imageResolutionOptions.join('|')]);

  React.useEffect(() => {
    const nextRatio = normalizeSelectValue(videoRatio, videoRatioOptions, '16:9');
    if (nextRatio !== videoRatio) setVideoRatio(nextRatio);
  }, [videoRatioOptions.join('|')]);

  React.useEffect(() => {
    const nextResolution = normalizeSelectValue(videoResolution, videoResolutionOptions, '720P');
    if (nextResolution !== videoResolution) setVideoResolution(nextResolution);
  }, [videoResolutionOptions.join('|')]);

  React.useEffect(() => {
    const nextDuration = normalizeDurationValue(
      videoDuration,
      resolvedVideoDurationOptions,
      preferredVideoDuration || 5,
    );
    if (nextDuration !== videoDuration) setVideoDuration(nextDuration);
  }, [resolvedVideoDurationOptions.join('|')]);

  React.useEffect(() => {
    if (videoDurationTouchedRef.current || !preferredVideoDuration) return;
    const nextDuration = normalizeDurationValue(
      preferredVideoDuration,
      resolvedVideoDurationOptions,
      preferredVideoDuration,
    );
    if (nextDuration !== videoDuration) setVideoDuration(nextDuration);
  }, [preferredVideoDuration, resolvedVideoDurationOptions.join('|')]);

  React.useEffect(() => {
    const nextMode = normalizeVideoModeForModel(videoMode, selectedVideoModel);
    const preferredMode = videoMode === 'image-video'
      ? (videoModeOptions.find((item) => item.key === 'image-video' && !item.disabled)?.key || nextMode)
      : nextMode;
    const safeMode = preferredMode || firstEnabledVideoMode(videoModeOptions);
    if (safeMode !== videoMode) setVideoMode(safeMode);
  }, [selectedVideoModel?.id, videoModeOptions.map((item) => `${item.key}:${item.disabled ? '1' : '0'}`).join('|')]);

  const imageSettings = React.useMemo(() => ({
    imageModel: modelPayload(selectedImageModel),
    imageModelId: selectedImageModel?.id || '',
    imageModelName: selectedImageModel?.modelName,
    imageProvider: selectedImageModel?.providerId,
    imageRatio,
    imageResolution: includeImageResolution ? imageResolution : undefined,
  }), [imageRatio, imageResolution, includeImageResolution, selectedImageModel?.id]);

  const videoSettings = React.useMemo(() => {
    const referenceMode = referenceModeForVideoMode(selectedVideoModel, activeVideoMode);
    return {
      videoModel: modelPayload(selectedVideoModel),
      videoModelId: selectedVideoModel?.id || '',
      videoModelName: selectedVideoModel?.modelName,
      videoProvider: selectedVideoModel?.providerId,
      videoRatio,
      videoResolution: includeVideoResolution ? videoResolution : undefined,
      videoDurationSeconds: videoDuration,
      videoMode: activeVideoMode,
      generationMode: activeVideoMode,
      videoReferenceMode: referenceMode,
      referenceMode,
      videoAudioOn: includeVideoAudio ? videoAudioOn : undefined,
      audioOn: includeVideoAudio ? videoAudioOn : undefined,
    };
  }, [
    activeVideoMode,
    includeVideoAudio,
    includeVideoResolution,
    selectedVideoModel?.id,
    videoAudioOn,
    videoDuration,
    videoRatio,
    videoResolution,
  ]);

  const mediaSettingsFor = (kind) => {
    if (kind === 'image') return imageSettings;
    if (kind === 'video') return videoSettings;
    return { ...imageSettings, ...videoSettings };
  };
  const hasGroups = deploymentGroups.length > 0;
  const groupIds = deploymentGroups.map((group) => group.shotGroupId).join('|');
  const [selectedGroupId, setSelectedGroupId] = React.useState(() => deploymentGroups[0]?.shotGroupId || '');
  React.useEffect(() => {
    if (!deploymentGroups.length) {
      setSelectedGroupId('');
      return;
    }
    if (!deploymentGroups.some((group) => group.shotGroupId === selectedGroupId)) {
      setSelectedGroupId(deploymentGroups[0].shotGroupId);
    }
  }, [deploymentGroups, groupIds, selectedGroupId]);

  const promptStatusForGroup = (shotGroupId) => {
    const group = shotGroups.find((item) => (
      item?.groupId === shotGroupId
      || item?.shotGroupId === shotGroupId
      || item?.id === shotGroupId
    ));
    return group?.promptStatus || '';
  };
  const promptPending = (shotGroupId) => ['pending', 'queued', 'running'].includes(promptStatusForGroup(shotGroupId));
  const promptReady = (shotGroupId) => promptStatusForGroup(shotGroupId) === 'completed';
  const pendingPromptCount = deploymentGroups.filter((group) => promptPending(group.shotGroupId)).length;
  const selectedGroup = deploymentGroups.find((group) => group.shotGroupId === selectedGroupId)
    || deploymentGroups[0]
    || null;
  const selectedShotGroupRecord = selectedGroup
    ? shotGroups.find((group) => groupRecordId(group) === selectedGroup.shotGroupId)
    : null;
  const selectedPreview = selectedGroup
    ? resolveGroupPreview({
      groupId: selectedGroup.shotGroupId,
      storyboardPackage,
      canvasNodes,
      canvasEdges,
    })
    : null;
  const totals = deploymentGroups.reduce((next, group) => ({
    total: next.total + (Number(group.total) || 0),
    deployed: next.deployed + (Number(group.deployed) || 0),
    imageDone: next.imageDone + (Number(group.imageDone) || 0),
    videoDone: next.videoDone + (Number(group.videoDone) || 0),
    failed: next.failed + (Number(group.failed) || 0),
  }), {
    total: 0,
    deployed: 0,
    imageDone: 0,
    videoDone: 0,
    failed: 0,
  });
  const deployAll = () => onDeploy?.({ mode: 'canvas', scope: 'all' });
  const generateAll = (kind) => onGenerateMedia?.({
    scope: 'all',
    kind,
    retryFailed: kind === 'failed',
    ...mediaSettingsFor(kind),
  });
  const deployGroup = (shotGroupId) => onDeploy?.({
    mode: 'canvas',
    scope: 'shot-group',
    shotGroupId,
  });
  const generateGroup = (shotGroupId, kind, retryFailed = false) => onGenerateMedia?.({
    scope: 'shot-group',
    shotGroupId,
    kind,
    retryFailed,
    ...mediaSettingsFor(kind),
  });
  const selectedPromptPending = selectedGroup ? promptPending(selectedGroup.shotGroupId) : false;
  const selectedPromptStatus = selectedGroup ? promptStatusForGroup(selectedGroup.shotGroupId) : '';
  const selectedNote = groupNote(selectedShotGroupRecord) || '当前组暂无导演备注，可直接输出到画布后继续生成图片和视频。';
  const hasImageModel = Boolean(selectedImageModel);
  const hasVideoModel = Boolean(selectedVideoModel);
  const activeVideoModeLabel = videoModeOptions.find((item) => item.key === activeVideoMode)?.label || activeVideoMode;
  const imageSettingsSummary = hasImageModel
    ? [modelLabel(selectedImageModel), imageRatio, includeImageResolution ? imageResolution : ''].filter(Boolean).join(' · ')
    : (imageModelResult.loading ? '加载图片模型中' : '暂无图片模型');
  const videoSettingsSummary = hasVideoModel
    ? [
      modelLabel(selectedVideoModel),
      activeVideoModeLabel,
      videoRatio,
      includeVideoResolution ? videoResolution : '',
      `${videoDuration}s`,
    ].filter(Boolean).join(' · ')
    : (videoModelResult.loading ? '加载视频模型中' : '暂无视频模型');
  const imageSettingsFields = (
    <div className="sb-output-media-section compact">
      <ModelSelect
        label="模型"
        value={selectedImageModel?.id || ''}
        onChange={setImageModelId}
        models={imageModelResult.models}
        loading={imageModelResult.loading}
        testId="output-image-model-select"
      />
      <OptionSelect
        label="比例"
        value={imageRatio}
        onChange={setImageRatio}
        options={imageRatioOptions}
        testId="output-image-ratio-select"
      />
      {includeImageResolution && (
        <OptionSelect
          label="清晰度"
          value={imageResolution}
          onChange={setImageResolution}
          options={imageResolutionOptions}
          testId="output-image-resolution-select"
        />
      )}
    </div>
  );
  const videoSettingsFields = (
    <div className="sb-output-media-section compact">
      <ModelSelect
        label="模型"
        value={selectedVideoModel?.id || ''}
        onChange={setVideoModelId}
        models={videoModelResult.models}
        loading={videoModelResult.loading}
        testId="output-video-model-select"
      />
      <OptionSelect
        label="模式"
        value={activeVideoMode}
        onChange={setVideoMode}
        options={videoModeOptions.filter((item) => !item.disabled).map((item) => item.key)}
        testId="output-video-mode-select"
        format={(key) => videoModeOptions.find((item) => item.key === key)?.label || key}
      />
      <OptionSelect
        label="比例"
        value={videoRatio}
        onChange={setVideoRatio}
        options={videoRatioOptions}
        testId="output-video-ratio-select"
      />
      {includeVideoResolution && (
        <OptionSelect
          label="清晰度"
          value={videoResolution}
          onChange={setVideoResolution}
          options={videoResolutionOptions}
          testId="output-video-resolution-select"
        />
      )}
      <OptionSelect
        label="时长"
        value={String(videoDuration)}
        onChange={(value) => {
          videoDurationTouchedRef.current = true;
          setVideoDuration(Number(value));
        }}
        options={resolvedVideoDurationOptions}
        testId="output-video-duration-select"
        format={(value) => `${value}s`}
      />
      {includeVideoAudio && (
        <OptionSelect
          label="音频"
          value={videoAudioOn ? 'on' : 'off'}
          onChange={(value) => setVideoAudioOn(value === 'on')}
          options={['on', 'off']}
          testId="output-video-audio-select"
          format={(value) => (value === 'on' ? '开启' : '关闭')}
        />
      )}
    </div>
  );
  const settingsDialogTitle = openSettingsKind === 'video' ? '视频生成设置' : '图片生成设置';
  const settingsDialogIcon = openSettingsKind === 'video' ? <IVideo size={16} /> : <IImage size={16} />;

  return (
    <section className="sb-package-panel sb-output-panel">
      <div className="sb-package-head sb-output-head">
        <div>
          <h2>输出到画布</h2>
          <p>按镜头组输出，保持画布结构清晰</p>
        </div>
        <span className="sb-status-pill">镜头组 {deploymentGroups.length}</span>
      </div>

      {hasGroups ? (
        <div className="sb-output-workbench">
          <aside className="sb-output-queue" aria-label="镜头组队列">
            <div className="sb-output-queue-head">
              <strong>镜头组队列</strong>
              <em>可输出镜头组</em>
              <span>{deploymentGroups.length} 组</span>
            </div>
            <div className="sb-output-queue-list">
              {deploymentGroups.map((group) => {
                const preview = resolveGroupPreview({
                  groupId: group.shotGroupId,
                  storyboardPackage,
                  canvasNodes,
                  canvasEdges,
                });
                const active = selectedGroup?.shotGroupId === group.shotGroupId;
                const progress = outputProgress(group);
                const promptStatus = promptStatusForGroup(group.shotGroupId);
                return (
                  <button
                    type="button"
                    className={`sb-output-queue-card ${active ? 'active' : ''}`}
                    key={group.shotGroupId}
                    onClick={() => setSelectedGroupId(group.shotGroupId)}
                    style={{ '--progress': `${progress * 3.6}deg` }}
                  >
                    <span className="sb-output-ring"><em>{progress}%</em></span>
                    <span className="sb-output-queue-copy">
                      <strong>{group.shotGroupId}</strong>
                      <span>{group.total} 镜 · 已输出 {group.deployed}</span>
                    </span>
                    <span className={`sb-output-queue-state ${group.failed > 0 ? 'failed' : 'ready'}`}>
                      {group.failed > 0 ? `失败 ${group.failed}` : promptStatusText(promptStatus)}
                    </span>
                    <span className="sb-output-queue-thumbs" aria-hidden="true">
                      <span className={preview.imageUrl ? 'has-media' : ''}>
                        {preview.imageUrl ? <img src={preview.imageUrl} alt="" /> : '图'}
                      </span>
                      <span className={preview.videoUrl ? 'has-media' : ''}>
                        {preview.videoUrl ? <video src={preview.videoUrl} muted playsInline preload="metadata" /> : '视'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="sb-output-main" aria-label="当前镜头组">
            <div className="sb-output-main-head">
              <div>
                <span>当前镜头组</span>
                <h3>{selectedGroup?.shotGroupId || '-'}</h3>
                <p>{selectedNote}</p>
              </div>
              <div className="sb-output-main-badges">
                <span>{selectedGroup?.total || 0} 镜</span>
                <span>{promptStatusText(selectedPromptStatus)}</span>
                {selectedGroup?.failed > 0 && <span className="failed">失败 {selectedGroup.failed}</span>}
              </div>
            </div>

            <div className="sb-output-status-grid">
              <div><span>已输出</span><strong>{selectedGroup?.deployed || 0}</strong></div>
              <div><span>已出图</span><strong>{selectedGroup?.imageDone || 0}</strong></div>
              <div><span>已成片</span><strong>{selectedGroup?.videoDone || 0}</strong></div>
              <div><span>失败</span><strong>{selectedGroup?.failed || 0}</strong></div>
            </div>

            <div className="sb-output-preview-board">
              <MediaPreviewSlot
                large
                kind="image"
                title="图片结果"
                url={selectedPreview?.imageUrl || ''}
                status={selectedPreview?.imageStatus || '图片等待'}
              />
              <MediaPreviewSlot
                large
                kind="video"
                title="视频结果"
                url={selectedPreview?.videoUrl || ''}
                status={selectedPreview?.videoStatus || '视频等待'}
              />
            </div>
          </section>

          <aside className="sb-output-side" aria-label="输出操作">
            <section className="sb-output-action-card">
              <div className="sb-output-side-title">
                <strong>批量操作</strong>
                <TaskProgressBadge task={task} taskIds={['storyboard-package-deploy', 'storyboard-shotgroup-media']} className="inline" />
              </div>
              <div className="sb-output-settings-row" aria-label="生成设置">
                <MediaSettingsButton
                  kind="image"
                  icon={<IImage size={15} />}
                  title="图片设置"
                  summary={imageSettingsSummary}
                  disabled={!hasImageModel && !imageModelResult.loading}
                  onClick={() => setOpenSettingsKind('image')}
                  testId="output-open-image-settings"
                />
                <MediaSettingsButton
                  kind="video"
                  icon={<IVideo size={15} />}
                  title="视频设置"
                  summary={videoSettingsSummary}
                  disabled={!hasVideoModel && !videoModelResult.loading}
                  onClick={() => setOpenSettingsKind('video')}
                  testId="output-open-video-settings"
                />
              </div>
              {openSettingsKind && (
                <div
                  className="sb-output-settings-backdrop"
                  role="presentation"
                  onMouseDown={() => setOpenSettingsKind('')}
                >
                  <section
                    className="sb-output-settings-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-label={settingsDialogTitle}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <header>
                      <span aria-hidden="true">{settingsDialogIcon}</span>
                      <strong>{settingsDialogTitle}</strong>
                      <button
                        type="button"
                        data-testid="output-settings-close"
                        onClick={() => setOpenSettingsKind('')}
                        aria-label="关闭生成设置"
                      >
                        <IClose size={14} />
                      </button>
                    </header>
                    {openSettingsKind === 'video' ? videoSettingsFields : imageSettingsFields}
                    <footer>
                      <button type="button" onClick={() => setOpenSettingsKind('')}>完成</button>
                    </footer>
                  </section>
                </div>
              )}
              <div className="sb-output-bulk-actions">
                <button type="button" disabled={!hasGroups} onClick={deployAll}>
                  输出全部组
                </button>
                <button type="button" disabled={!hasGroups || pendingPromptCount > 0 || !hasImageModel} onClick={() => generateAll('image')}>
                  生成全部图片
                </button>
                <button type="button" disabled={!hasGroups || pendingPromptCount > 0 || !hasVideoModel} onClick={() => generateAll('video')}>
                  生成全部视频
                </button>
                <button type="button" disabled={!hasGroups || deploymentGroups.every((group) => group.failed <= 0) || (!hasImageModel && !hasVideoModel)} onClick={() => generateAll('failed')}>
                  重试失败
                </button>
              </div>
              <div className="sb-output-group-actions">
                <button type="button" disabled={!selectedGroup} onClick={() => deployGroup(selectedGroup.shotGroupId)}>
                  输出此组
                </button>
                <button
                  type="button"
                  data-testid="output-generate-group-image"
                  disabled={!selectedGroup || selectedPromptPending || !hasImageModel}
                  onClick={() => generateGroup(selectedGroup.shotGroupId, 'image')}
                >
                  生成图片
                </button>
                <button
                  type="button"
                  data-testid="output-generate-group-video"
                  disabled={!selectedGroup || selectedPromptPending || !hasVideoModel}
                  onClick={() => generateGroup(selectedGroup.shotGroupId, 'video')}
                >
                  生成视频
                </button>
                <button
                  type="button"
                  disabled={!selectedGroup || (selectedGroup.failed <= 0 && !selectedPreview?.imageNode?.error && !selectedPreview?.videoNode?.error)}
                  onClick={() => generateGroup(selectedGroup.shotGroupId, 'failed', true)}
                >
                  重试失败
                </button>
              </div>
            </section>

            <section className="sb-output-action-card">
              <div className="sb-output-side-title">
                <strong>生成概览</strong>
              </div>
              <div className="sb-output-overview">
                <div><span>镜头</span><strong>{totals.total}</strong></div>
                <div><span>已输出</span><strong>{totals.deployed}</strong></div>
                <div><span>已出图</span><strong>{totals.imageDone}</strong></div>
                <div><span>已成片</span><strong>{totals.videoDone}</strong></div>
                <div><span>失败</span><strong>{totals.failed}</strong></div>
              </div>
            </section>

            <section className="sb-output-action-card">
              <div className="sb-output-side-title">
                <strong>输出日志</strong>
              </div>
              <div className="sb-output-log">
                <span>当前选择 {selectedGroup?.shotGroupId || '-'}</span>
                <span>{selectedPreview?.imageStatus || '图片等待'}</span>
                <span>{selectedPreview?.videoStatus || '视频等待'}</span>
                {selectedGroup?.failed > 0 && <span className="failed">存在失败任务，可执行重试失败</span>}
              </div>
            </section>
          </aside>
        </div>
      ) : (
        <div className="sb-empty-block">还没有可输出的镜头组。</div>
      )}
    </section>
  );
}
