const UNGROUPED_SHOT_GROUP_ID = 'ungrouped';

const CONTAINER_PADDING = 24;
const CONTAINER_HEADER_HEIGHT = 48;
const NODE_WIDTH = 320;
const NODE_HEIGHT = 180;
const NODE_GAP_X = 40;
const ROW_GAP_Y = 24;
const DEPLOYMENT_GROUP_GAP_Y = 96;
const SCRIPT_TO_DEPLOYMENT_GAP_X = 180;
const SHOT_GROUP_DEPLOYMENT_HEIGHT = CONTAINER_HEADER_HEIGHT + NODE_HEIGHT + (CONTAINER_PADDING * 2);

const DEFAULT_ORIGIN = Object.freeze({ x: 0, y: 0 });
const NODE_DIMENSIONS = Object.freeze({ width: NODE_WIDTH, height: NODE_HEIGHT });

const finiteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeOrigin = (origin = DEFAULT_ORIGIN, fallback = DEFAULT_ORIGIN) => ({
  x: finiteNumber(origin?.x, fallback.x),
  y: finiteNumber(origin?.y, fallback.y),
});

const storyboardDeploymentListHeight = (groupCount = 1) => {
  const count = Math.max(1, Math.floor(finiteNumber(groupCount, 1)));
  return (SHOT_GROUP_DEPLOYMENT_HEIGHT * count) + (DEPLOYMENT_GROUP_GAP_Y * (count - 1));
};

const getShotTasks = (productionPackage) => {
  const shotTasks = productionPackage?.generationPlan?.shotTasks;
  return Array.isArray(shotTasks) ? shotTasks : [];
};

const isNonEmptyScalarId = (value) => (
  (typeof value === 'string' && value.trim() !== '')
  || (typeof value === 'number' && Number.isFinite(value))
);

const sanitizeIdSegment = (value) => {
  const segment = isNonEmptyScalarId(value) ? String(value).trim() : UNGROUPED_SHOT_GROUP_ID;
  const sanitized = segment
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitized || UNGROUPED_SHOT_GROUP_ID;
};

const getShotGroupId = (task) => {
  if (isNonEmptyScalarId(task?.shotGroupId)) return task.shotGroupId;
  if (isNonEmptyScalarId(task?.shotGroup)) return task.shotGroup;
  if (isNonEmptyScalarId(task?.groupId)) return task.groupId;
  return UNGROUPED_SHOT_GROUP_ID;
};

const makeSummaryGroup = (shotGroupId) => ({
  shotGroupId,
  total: 0,
  deployed: 0,
  imageDone: 0,
  videoDone: 0,
  failed: 0,
});

const incrementStatusCount = (summary, status) => {
  if (status === 'deployed') {
    summary.deployed += 1;
  } else if (status === 'image_done') {
    summary.imageDone += 1;
  } else if (status === 'video_done') {
    summary.videoDone += 1;
  } else if (status === 'failed') {
    summary.failed += 1;
  }
};

const isInferredPromptRecord = (record) => {
  const status = cleanText(record?.promptStatus);
  return status === 'completed'
    || Boolean(cleanText(record?.promptJobId))
    || Boolean(cleanText(record?.promptUpdatedAt));
};

const getPromptDraft = (task, kind, options = {}) => {
  if (options.requireInferred && !isInferredPromptRecord(task)) return '';
  if (kind === 'video') {
    return task?.videoPromptDraft ?? task?.videoPrompt ?? '';
  }

  return task?.imagePromptDraft ?? task?.promptDraft ?? task?.imagePrompt ?? '';
};

const getShotGroupPrompt = (productionPackage, shotGroupId, kind) => {
  const groups = Array.isArray(productionPackage?.shotGroups) ? productionPackage.shotGroups : [];
  const group = groups.find((item) => getShotGroupId(item) === shotGroupId);
  if (!group) return '';
  if (kind === 'video') {
    return group.videoPromptDraft || group.videoPrompt || '';
  }
  return group.imagePromptDraft || group.imagePrompt || group.promptDraft || group.prompt || '';
};

const getShotGroupRecord = (productionPackage, shotGroupId) => {
  const groups = Array.isArray(productionPackage?.shotGroups) ? productionPackage.shotGroups : [];
  return groups.find((item) => getShotGroupId(item) === shotGroupId) || null;
};

const makeTaskLabel = (task) => (
  task?.title || task?.shotTitle || task?.shotId || task?.id || ''
);

const DEFAULT_DEPLOYMENT_ID_PREFIX = 'storyboard-';

const makeNodeId = (taskId, kind, idPrefix = DEFAULT_DEPLOYMENT_ID_PREFIX) => (
  `${idPrefix}task-${taskId}-${kind}`
);

const makeShotGroupNodeId = (shotGroupId, kind, idPrefix = DEFAULT_DEPLOYMENT_ID_PREFIX) => (
  `${idPrefix}shot-group-${sanitizeIdSegment(shotGroupId)}-${kind}`
);

const makeContainerId = (shotGroupId, idPrefix = DEFAULT_DEPLOYMENT_ID_PREFIX) => (
  `${idPrefix}shot-group-${sanitizeIdSegment(shotGroupId)}`
);

const getShotTaskEntries = (productionPackage) => (
  getShotTasks(productionPackage).map((task, planIndex) => ({ task, planIndex }))
);

const selectShotTaskEntriesForDeployment = (productionPackage, options = {}) => {
  const entries = getShotTaskEntries(productionPackage);

  if (options.scope === 'shot-group') {
    return entries.filter(({ task }) => getShotGroupId(task) === options.shotGroupId);
  }

  if (options.scope === 'selected') {
    const selectedIds = new Set(Array.isArray(options.shotTaskIds) ? options.shotTaskIds : []);
    return entries.filter(({ task }) => selectedIds.has(task?.id));
  }

  return entries;
};

const getTaskIdentity = (task, planIndex) => {
  if (isNonEmptyScalarId(task?.id)) {
    return sanitizeIdSegment(task.id);
  }

  if (isNonEmptyScalarId(task?.shotId)) {
    return sanitizeIdSegment(task.shotId);
  }

  return `${sanitizeIdSegment(getShotGroupId(task))}-${planIndex}`;
};

const groupEntriesByShotGroup = (entries) => {
  const groups = [];
  const byId = new Map();

  entries.forEach((entry) => {
    const shotGroupId = getShotGroupId(entry.task);
    if (!byId.has(shotGroupId)) {
      const group = { shotGroupId, entries: [] };
      byId.set(shotGroupId, group);
      groups.push(group);
    }
    byId.get(shotGroupId).entries.push(entry);
  });

  return groups;
};

const makeDeploymentIdPrefix = (productionPackage, deploymentInstanceId = '') => {
  const packageNamespace = sanitizeIdSegment(productionPackage?.id || 'local');
  const nodeNamespace = productionPackage?.nodeId ? sanitizeIdSegment(productionPackage.nodeId) : '';
  const namespace = nodeNamespace ? `${packageNamespace}-${nodeNamespace}` : packageNamespace;
  const instanceNamespace = isNonEmptyScalarId(deploymentInstanceId)
    ? sanitizeIdSegment(deploymentInstanceId)
    : '';
  const scopedNamespace = instanceNamespace ? `${namespace}-${instanceNamespace}` : namespace;
  return `${DEFAULT_DEPLOYMENT_ID_PREFIX}${scopedNamespace}-`;
};

export const selectShotTasksForDeployment = (productionPackage, options = {}) => {
  return selectShotTaskEntriesForDeployment(productionPackage, options)
    .map(({ task }) => task);
};

export const summarizeShotGroupsForDeployment = (productionPackage) => {
  const groups = new Map();

  getShotTasks(productionPackage).forEach((task) => {
    const shotGroupId = getShotGroupId(task);
    if (!groups.has(shotGroupId)) {
      groups.set(shotGroupId, makeSummaryGroup(shotGroupId));
    }

    const summary = groups.get(shotGroupId);
    summary.total += 1;
    incrementStatusCount(summary, task?.status);
  });

  return Array.from(groups.values());
};

const buildCanvasDeploymentDraftFromEntries = (productionPackage, entries, options = {}) => {
  const includeVideo = options.includeVideo !== false;
  const origin = {
    x: Number.isFinite(options.origin?.x) ? options.origin.x : DEFAULT_ORIGIN.x,
    y: Number.isFinite(options.origin?.y) ? options.origin.y : DEFAULT_ORIGIN.y,
  };
  const tasks = entries.map(({ task }) => task);
  const shotGroupId = options.shotGroupId || getShotGroupId(tasks[0]);
  const columnCount = includeVideo ? 2 : 1;
  const contentWidth = (NODE_WIDTH * columnCount) + (NODE_GAP_X * (columnCount - 1));
  const contentHeight = tasks.length > 0
    ? (NODE_HEIGHT * tasks.length) + (ROW_GAP_Y * (tasks.length - 1))
    : 0;
  const dimensions = {
    width: contentWidth + (CONTAINER_PADDING * 2),
    height: CONTAINER_HEADER_HEIGHT + contentHeight + (CONTAINER_PADDING * 2),
  };
  const idPrefix = options.idPrefix || DEFAULT_DEPLOYMENT_ID_PREFIX;
  const containerId = makeContainerId(shotGroupId, idPrefix);
  const nodes = [];
  const edges = [];

  entries.forEach(({ task, planIndex }, index) => {
    const taskId = getTaskIdentity(task, planIndex);
    const rowY = origin.y + CONTAINER_HEADER_HEIGHT + CONTAINER_PADDING + (index * (NODE_HEIGHT + ROW_GAP_Y));
    const imageNodeId = makeNodeId(taskId, 'image', idPrefix);
    const baseNode = {
      storyboardTaskId: task?.id,
      storyboardTaskKey: taskId,
      storyboardPlanIndex: planIndex,
      shotGroupId: getShotGroupId(task),
      shotId: task?.shotId,
      title: makeTaskLabel(task),
      parentContainerId: containerId,
      dimensions: { ...NODE_DIMENSIONS },
    };

    nodes.push({
      ...baseNode,
      id: imageNodeId,
      kind: 'image',
      promptDraft: getPromptDraft(task, 'image'),
      position: {
        x: origin.x + CONTAINER_PADDING,
        y: rowY,
      },
    });

    if (!includeVideo) {
      return;
    }

    const videoNodeId = makeNodeId(taskId, 'video', idPrefix);
    nodes.push({
      ...baseNode,
      id: videoNodeId,
      kind: 'video',
      promptDraft: getPromptDraft(task, 'video'),
      position: {
        x: origin.x + CONTAINER_PADDING + NODE_WIDTH + NODE_GAP_X,
        y: rowY,
      },
    });

    edges.push({
      id: `${idPrefix}task-${taskId}-image-to-video`,
      source: imageNodeId,
      target: videoNodeId,
      storyboardTaskId: task?.id,
      storyboardTaskKey: taskId,
      storyboardPlanIndex: planIndex,
    });
  });

  return {
    container: {
      id: containerId,
      kind: 'shotGroupContainer',
      shotGroupId,
      collapsed: false,
      taskCount: tasks.length,
      origin,
      dimensions,
    },
    nodes,
    edges,
  };
};

const makeShotGroupLabel = (shotGroupId) => `分镜组 ${shotGroupId}`;

const makePromptSectionLabel = (task, index) => {
  const primary = task?.shotNumber || task?.number || task?.shotId || task?.id || `镜头 ${index + 1}`;
  const title = makeTaskLabel(task);
  if (title && title !== primary) return `${primary} ${title}`;
  return primary;
};

const cleanText = (value) => (
  value === null || value === undefined ? '' : String(value).trim()
);

const asArray = (value) => (Array.isArray(value) ? value : []);

const firstMediaSource = (...values) => {
  for (const value of values.flat()) {
    const text = cleanText(value);
    if (text) return text;
  }
  return '';
};

const isBlobMediaSource = (value) => /^blob:/i.test(cleanText(value));

const firstDurableMediaSource = (...values) => {
  for (const value of values.flat()) {
    const text = cleanText(value);
    if (text && !isBlobMediaSource(text)) return text;
  }
  return '';
};

const designCardVersionSource = (version = {}) => (
  firstDurableMediaSource(version.assetUrl, version.url, version.src, version.imageUrl, version.assetPath, version.localPath, version.path)
  || firstMediaSource(version.assetUrl, version.url, version.src, version.imageUrl, version.assetPath, version.localPath, version.path)
);

const currentDesignPreviewAsset = (card = {}, type = 'asset') => {
  const history = asArray(card.history);
  const currentVersion = (card.currentVersionId
    ? history.find((version) => cleanText(version?.id) === cleanText(card.currentVersionId))
    : history[0]) || history[0] || card;
  const src = designCardVersionSource(currentVersion);
  if (!src) return null;
  const versionUrl = cleanText(currentVersion?.url || currentVersion?.imageUrl);
  const versionAssetUrl = cleanText(currentVersion?.assetUrl || currentVersion?.imageUrl);
  const id = cleanText(card.id || card.assetId || card.cardId || card.name || card.title || src);
  const title = cleanText(card.name || card.title || card.label || currentVersion?.title || id);
  return {
    id: `${id}:current-preview`,
    assetId: cleanText(currentVersion?.assetId || currentVersion?.id || card.assetId || id),
    cardId: cleanText(card.cardId || card.id || id),
    kind: 'image',
    type: 'image',
    mediaKind: 'image',
    src,
    url: versionUrl && !isBlobMediaSource(versionUrl) ? versionUrl : src,
    assetUrl: versionAssetUrl && !isBlobMediaSource(versionAssetUrl) ? versionAssetUrl : src,
    title,
    name: title,
    token: title ? `@${title}` : undefined,
    source: 'design-space-current-preview',
    designAssetType: type,
    currentVersionId: cleanText(currentVersion?.id),
  };
};

const designPackageCards = (productionPackage = {}) => {
  const pkg = productionPackage.designSpacePackage
    || productionPackage.designPackage
    || productionPackage.storyboardDesignPackage
    || {};
  return [
    ...asArray(pkg.characters).map((card) => ({ card, type: 'character' })),
    ...asArray(pkg.scenes).map((card) => ({ card, type: 'scene' })),
    ...asArray(pkg.props).map((card) => ({ card, type: 'prop' })),
  ];
};

const cardIdentityValues = (card = {}) => [
  card.id,
  card.assetId,
  card.cardId,
  card.name,
  card.title,
  card.label,
].map(cleanText).filter(Boolean);

const audioSearchText = (audio) => (
  asArray(audio)
    .flatMap((entry) => [entry?.character, entry?.line, entry?.type])
    .map(cleanText)
    .filter(Boolean)
    .join('\n')
);

const shotGroupReferenceSearch = (group = {}, entries = []) => {
  const shots = asArray(group.shots);
  const textParts = [
    group.groupId,
    group.shotGroupId,
    group.id,
    group.sceneRef,
    group.groupNote,
    group.imagePrompt,
    group.imagePromptDraft,
    group.videoPrompt,
    group.videoPromptDraft,
    group.prompt,
    group.promptDraft,
    ...shots.flatMap((shot) => [
      shot?.shotNumber,
      shot?.scene,
      shot?.sceneName,
      shot?.sceneId,
      shot?.sceneRef,
      shot?.visualsAction,
      shot?.desc,
      shot?.description,
      shot?.promptText,
      shot?.prompt,
      shot?.imagePrompt,
      shot?.videoPrompt,
      shot?.cameraWork,
      shot?.directorNote,
      audioSearchText(shot?.audio),
      ...asArray(shot?.characterIds),
    ]),
    ...entries.flatMap(({ task }) => [
      task?.scene,
      task?.sceneId,
      task?.sceneRef,
      task?.prompt,
      task?.promptDraft,
      task?.imagePrompt,
      task?.imagePromptDraft,
      task?.videoPrompt,
      task?.videoPromptDraft,
      ...asArray(task?.characterIds),
    ]),
  ].map(cleanText).filter(Boolean);
  return {
    text: textParts.join('\n').toLowerCase(),
    exact: new Set(textParts.map((item) => item.toLowerCase())),
  };
};

const designCardReferencedByShotGroup = (card, search) => {
  const values = cardIdentityValues(card);
  return values.some((value) => {
    const lower = value.toLowerCase();
    return search.exact.has(lower)
      || search.text.includes(`[@${lower}]`)
      || search.text.includes(`@${lower}`)
      || search.text.includes(lower);
  });
};

const dedupeReferenceAssets = (assets) => {
  const seen = new Set();
  return assets.filter((asset) => {
    const key = cleanText(asset?.src || asset?.assetUrl || asset?.url || asset?.id);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const referenceAssetsEqual = (left = [], right = []) => (
  JSON.stringify(asArray(left)) === JSON.stringify(asArray(right))
);

const resolveShotGroupReferenceAssets = (productionPackage, shotGroupId, entries = []) => {
  const group = getShotGroupRecord(productionPackage, shotGroupId) || {};
  const search = shotGroupReferenceSearch(group, entries);
  return dedupeReferenceAssets(
    designPackageCards(productionPackage)
      .filter(({ card }) => designCardReferencedByShotGroup(card, search))
      .map(({ card, type }) => currentDesignPreviewAsset(card, type))
      .filter(Boolean),
  );
};

const formatAudioLines = (audio) => (
  asArray(audio)
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return '';
      const character = cleanText(entry.character);
      const line = cleanText(entry.line);
      if (!line) return '';
      return character ? `${character}：${line}` : line;
    })
    .filter(Boolean)
    .join(' / ')
);

const formatShotGroupShotText = (shot, index) => {
  const label = cleanText(shot?.shotNumber || shot?.number || shot?.n || `镜头 ${index + 1}`);
  const title = cleanText(shot?.shot || shot?.title || shot?.shotTitle);
  const visual = cleanText(shot?.visualsAction || shot?.desc || shot?.description);
  const camera = cleanText(shot?.cameraWork);
  const timeline = cleanText(shot?.timeline || shot?.dur || shot?.duration);
  const audio = formatAudioLines(shot?.audio);
  const note = cleanText(shot?.directorNote);
  return [
    `#${label}${title ? ` ${title}` : ''}`,
    visual,
    camera ? `镜头：${camera}` : '',
    timeline ? `时长：${timeline}` : '',
    audio ? `声音：${audio}` : '',
    note ? `导演备注：${note}` : '',
  ].filter(Boolean).join('\n');
};

const getShotGroupTextBody = (productionPackage, entries) => {
  const shotGroupId = getShotGroupId(entries[0]?.task);
  const group = getShotGroupRecord(productionPackage, shotGroupId);
  if (group) {
    const header = [
      makeShotGroupLabel(shotGroupId),
      cleanText(group.sceneRef) ? `场景：${cleanText(group.sceneRef)}` : '',
      cleanText(group.totalDuration) ? `总时长：${cleanText(group.totalDuration)}` : '',
      cleanText(group.groupNote) ? `组说明：${cleanText(group.groupNote)}` : '',
    ].filter(Boolean).join('\n');
    const shots = asArray(group.shots)
      .map(formatShotGroupShotText)
      .filter(Boolean)
      .join('\n\n');
    return [header, shots].filter(Boolean).join('\n\n');
  }

  return entries
    .map(({ task }, index) => {
      const label = makePromptSectionLabel(task, index);
      return [
        `#${label}`,
        cleanText(task?.scene) ? `场景：${cleanText(task.scene)}` : '',
        cleanText(task?.timeline || task?.duration) ? `时长：${cleanText(task.timeline || task.duration)}` : '',
      ].filter(Boolean).join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
};

const getShotGroupPromptDraft = (productionPackage, entries, kind) => {
  const shotGroupId = getShotGroupId(entries[0]?.task);
  const groupPrompt = getShotGroupPrompt(productionPackage, shotGroupId, kind);
  if (groupPrompt) return groupPrompt;

  return entries
    .map(({ task }, index) => {
      const prompt = getPromptDraft(task, kind, { requireInferred: true })
        || (kind === 'video' ? getPromptDraft(task, 'image', { requireInferred: true }) : '');
      if (!prompt) return '';
      if (entries.length === 1) return prompt;
      const label = cleanText(task?.shotNumber || task?.number || task?.shotId || task?.id || `镜头 ${index + 1}`);
      return [`#${label}`, prompt].filter(Boolean).join('\n');
    })
    .filter(Boolean)
    .join('\n\n')
};

export const resolveShotGroupMediaPrompt = (productionPackage, shotGroupId, kind = 'image') => {
  const entries = selectShotTaskEntriesForDeployment(productionPackage, {
    scope: 'shot-group',
    shotGroupId,
  });
  const groupPrompt = getShotGroupPrompt(productionPackage, shotGroupId, kind);
  if (groupPrompt) return groupPrompt;
  return getShotGroupPromptDraft(productionPackage, entries, kind);
};

const buildShotGroupDeploymentDraftFromEntries = (productionPackage, entries, options = {}) => {
  const includeVideo = options.includeVideo !== false;
  const origin = {
    x: Number.isFinite(options.origin?.x) ? options.origin.x : DEFAULT_ORIGIN.x,
    y: Number.isFinite(options.origin?.y) ? options.origin.y : DEFAULT_ORIGIN.y,
  };
  const tasks = entries.map(({ task }) => task);
  const shotGroupId = options.shotGroupId || getShotGroupId(tasks[0]);
  const columnCount = includeVideo ? 3 : 2;
  const contentWidth = (NODE_WIDTH * columnCount) + (NODE_GAP_X * (columnCount - 1));
  const contentHeight = tasks.length > 0 ? NODE_HEIGHT : 0;
  const dimensions = {
    width: contentWidth + (CONTAINER_PADDING * 2),
    height: CONTAINER_HEADER_HEIGHT + contentHeight + (CONTAINER_PADDING * 2),
  };
  const idPrefix = options.idPrefix || DEFAULT_DEPLOYMENT_ID_PREFIX;
  const containerId = makeContainerId(shotGroupId, idPrefix);
  const rowY = origin.y + CONTAINER_HEADER_HEIGHT + CONTAINER_PADDING;
  const storyboardTaskIds = entries
    .map(({ task }) => task?.id)
    .filter((id) => isNonEmptyScalarId(id));
  const storyboardTaskKeys = entries.map(({ task, planIndex }) => getTaskIdentity(task, planIndex));
  const storyboardPlanIndexes = entries.map(({ planIndex }) => planIndex);
  const referenceAssets = resolveShotGroupReferenceAssets(productionPackage, shotGroupId, entries);
  const baseNode = {
    title: makeShotGroupLabel(shotGroupId),
    shotGroupId,
    storyboardShotGroupId: shotGroupId,
    storyboardTaskIds,
    storyboardTaskKeys,
    storyboardPlanIndexes,
    parentContainerId: containerId,
    dimensions: { ...NODE_DIMENSIONS },
  };
  const textNodeId = makeShotGroupNodeId(shotGroupId, 'text', idPrefix);
  const imageNodeId = makeShotGroupNodeId(shotGroupId, 'image', idPrefix);
  const nodes = [{
    ...baseNode,
    id: textNodeId,
    kind: 'text',
    body: getShotGroupTextBody(productionPackage, entries),
    position: {
      x: origin.x + CONTAINER_PADDING,
      y: rowY,
    },
  }, {
    ...baseNode,
    id: imageNodeId,
    kind: 'image',
    promptDraft: getShotGroupPromptDraft(productionPackage, entries, 'image'),
    referenceAssets,
    position: {
      x: origin.x + CONTAINER_PADDING + NODE_WIDTH + NODE_GAP_X,
      y: rowY,
    },
  }];
  const edges = [];

  if (includeVideo) {
    const videoNodeId = makeShotGroupNodeId(shotGroupId, 'video', idPrefix);
    nodes.push({
      ...baseNode,
      id: videoNodeId,
      kind: 'video',
      promptDraft: getShotGroupPromptDraft(productionPackage, entries, 'video'),
      referenceAssets,
      position: {
        x: origin.x + CONTAINER_PADDING + ((NODE_WIDTH + NODE_GAP_X) * 2),
        y: rowY,
      },
    });
    edges.push({
      id: `${idPrefix}shot-group-${sanitizeIdSegment(shotGroupId)}-image-to-video`,
      source: imageNodeId,
      target: videoNodeId,
      shotGroupId,
      storyboardShotGroupId: shotGroupId,
      storyboardTaskIds,
      storyboardTaskKeys,
      storyboardPlanIndexes,
    });
  }

  return {
    container: {
      id: containerId,
      kind: 'shotGroupContainer',
      shotGroupId,
      collapsed: false,
      taskCount: tasks.length,
      origin,
      dimensions,
      storyboardTaskIds,
      storyboardTaskKeys,
      storyboardPlanIndexes,
    },
    nodes,
    edges,
  };
};

export const buildCanvasDeploymentDraft = (productionPackage, options = {}) => (
  buildCanvasDeploymentDraftFromEntries(
    productionPackage,
    selectShotTaskEntriesForDeployment(productionPackage, options),
    options,
  )
);

const canvasNodeTitle = (draftNode) => {
  const suffix = draftNode.kind === 'video' ? '视频' : (draftNode.kind === 'text' ? '文本' : '图像');
  const title = draftNode.title || draftNode.shotId || draftNode.storyboardTaskId || '分镜任务';
  return `${title} · ${suffix}`;
};

const makeCanvasNodeFromDraftNode = (draftNode, productionPackage) => {
  const nodeType = draftNode.kind === 'video' ? 'video' : (draftNode.kind === 'text' ? 'text' : 'image');
  const common = {
    id: draftNode.id,
    type: nodeType,
    x: draftNode.position.x,
    y: draftNode.position.y,
    w: draftNode.dimensions.width,
    h: draftNode.dimensions.height,
    title: canvasNodeTitle(draftNode),
    tag: draftNode.kind === 'video' ? '分镜视频' : (draftNode.kind === 'text' ? '分镜内容' : '分镜图像'),
    prompt: draftNode.promptDraft,
    promptDraft: draftNode.promptDraft,
    ...(Array.isArray(draftNode.referenceAssets) ? { referenceAssets: draftNode.referenceAssets } : {}),
    storyboardTaskId: draftNode.storyboardTaskId,
    storyboardTaskKey: draftNode.storyboardTaskKey,
    storyboardPlanIndex: draftNode.storyboardPlanIndex,
    ...(Array.isArray(draftNode.storyboardTaskIds) ? { storyboardTaskIds: draftNode.storyboardTaskIds } : {}),
    ...(Array.isArray(draftNode.storyboardTaskKeys) ? { storyboardTaskKeys: draftNode.storyboardTaskKeys } : {}),
    ...(Array.isArray(draftNode.storyboardPlanIndexes) ? { storyboardPlanIndexes: draftNode.storyboardPlanIndexes } : {}),
    ...(draftNode.storyboardShotGroupId ? { storyboardShotGroupId: draftNode.storyboardShotGroupId } : {}),
    shotGroupId: draftNode.shotGroupId,
    shotId: draftNode.shotId,
    deploymentKind: 'storyboard',
    deploymentRole: draftNode.kind,
    deployedFromPackageId: productionPackage?.id,
    ...(productionPackage?.nodeId ? { deployedFromNodeId: productionPackage.nodeId } : {}),
  };

  if (draftNode.kind === 'text') {
    const body = draftNode.body || '';
    return {
      ...common,
      body,
      prompt: body,
      promptDraft: body,
    };
  }

  if (draftNode.kind === 'video') {
    return {
      ...common,
      poster: null,
      videoSrc: '',
      duration: '00:00',
    };
  }

  return {
    ...common,
    src: null,
  };
};

const makeCanvasGroupFromDraft = (draft, productionPackage) => ({
  id: draft.container.id,
  type: 'group',
  title: `分镜组 ${draft.container.shotGroupId}`,
  x: draft.container.origin.x,
  y: draft.container.origin.y,
  w: draft.container.dimensions.width,
  h: draft.container.dimensions.height,
  memberIds: draft.nodes.map((node) => node.id),
  tag: '分镜组',
  deploymentKind: 'storyboard',
  deploymentRole: 'group',
  storyboardShotGroupId: draft.container.shotGroupId,
  storyboardTaskIds: Array.isArray(draft.container.storyboardTaskIds) ? draft.container.storyboardTaskIds : [],
  storyboardTaskKeys: Array.isArray(draft.container.storyboardTaskKeys) ? draft.container.storyboardTaskKeys : [],
  storyboardPlanIndexes: Array.isArray(draft.container.storyboardPlanIndexes) ? draft.container.storyboardPlanIndexes : [],
  deployedFromPackageId: productionPackage?.id,
  ...(productionPackage?.nodeId ? { deployedFromNodeId: productionPackage.nodeId } : {}),
  createdAt: new Date(0).toISOString(),
});

const makeScriptToGroupEdge = (draft, group, productionPackage, idPrefix) => {
  const sourceNodeId = productionPackage?.nodeId;
  if (!sourceNodeId || sourceNodeId === draft.container.id) return null;
  return {
    id: `${idPrefix}to-shot-group-${sanitizeIdSegment(group.shotGroupId)}`,
    from: sourceNodeId,
    to: draft.container.id,
    shotGroupId: group.shotGroupId,
    storyboardShotGroupId: group.shotGroupId,
    storyboardTaskIds: Array.isArray(draft.container.storyboardTaskIds) ? draft.container.storyboardTaskIds : [],
    storyboardTaskKeys: Array.isArray(draft.container.storyboardTaskKeys) ? draft.container.storyboardTaskKeys : [],
    storyboardPlanIndexes: Array.isArray(draft.container.storyboardPlanIndexes) ? draft.container.storyboardPlanIndexes : [],
    deploymentKind: 'storyboard',
    deploymentRole: 'script-to-group',
    deployedFromPackageId: productionPackage?.id,
    deployedFromNodeId: sourceNodeId,
  };
};

export const buildStoryboardCanvasDeployment = (productionPackage, options = {}) => {
  const selectedEntries = selectShotTaskEntriesForDeployment(productionPackage, options);
  const groupedEntries = groupEntriesByShotGroup(selectedEntries);
  const idPrefix = options.idPrefix || makeDeploymentIdPrefix(productionPackage, options.deploymentInstanceId);
  const origin = {
    x: Number.isFinite(options.origin?.x) ? options.origin.x : DEFAULT_ORIGIN.x,
    y: Number.isFinite(options.origin?.y) ? options.origin.y : DEFAULT_ORIGIN.y,
  };
  const canvasNodes = [];
  const canvasEdges = [];
  const shotGroupIds = [];
  let currentY = origin.y;

  groupedEntries.forEach((group) => {
    const draft = buildShotGroupDeploymentDraftFromEntries(productionPackage, group.entries, {
      ...options,
      idPrefix,
      shotGroupId: group.shotGroupId,
      origin: { x: origin.x, y: currentY },
    });
    const memberNodes = draft.nodes.map((node) => makeCanvasNodeFromDraftNode(node, productionPackage));
    const groupNode = makeCanvasGroupFromDraft(draft, productionPackage);

    canvasNodes.push(...memberNodes, groupNode);
    const scriptEdge = makeScriptToGroupEdge(draft, group, productionPackage, idPrefix);
    if (scriptEdge) {
      canvasEdges.push(scriptEdge);
    }
    const draftNodeById = new Map(draft.nodes.map((node) => [node.id, node]));
    canvasEdges.push(...draft.edges.map((edge) => {
      const sourceNode = draftNodeById.get(edge.source);
      return {
        id: edge.id,
        from: edge.source,
        to: edge.target,
        ...(edge.storyboardTaskId ? { storyboardTaskId: edge.storyboardTaskId } : {}),
        ...(edge.storyboardTaskKey ? { storyboardTaskKey: edge.storyboardTaskKey } : {}),
        ...(Number.isFinite(edge.storyboardPlanIndex) ? { storyboardPlanIndex: edge.storyboardPlanIndex } : {}),
        ...(Array.isArray(edge.storyboardTaskIds) ? { storyboardTaskIds: edge.storyboardTaskIds } : {}),
        ...(Array.isArray(edge.storyboardTaskKeys) ? { storyboardTaskKeys: edge.storyboardTaskKeys } : {}),
        ...(Array.isArray(edge.storyboardPlanIndexes) ? { storyboardPlanIndexes: edge.storyboardPlanIndexes } : {}),
        ...(edge.storyboardShotGroupId ? { storyboardShotGroupId: edge.storyboardShotGroupId } : {}),
        shotGroupId: sourceNode?.shotGroupId || group.shotGroupId,
        deploymentKind: 'storyboard',
        deployedFromPackageId: productionPackage?.id,
        ...(productionPackage?.nodeId ? { deployedFromNodeId: productionPackage.nodeId } : {}),
      };
    }));
    shotGroupIds.push(group.shotGroupId);
    currentY += draft.container.dimensions.height + DEPLOYMENT_GROUP_GAP_Y;
  });

  return {
    packageId: productionPackage?.id,
    nodeId: productionPackage?.nodeId,
    deploymentInstanceId: isNonEmptyScalarId(options.deploymentInstanceId) ? String(options.deploymentInstanceId).trim() : '',
    shotGroupIds,
    nodes: canvasNodes,
    edges: canvasEdges,
    selectionIds: canvasNodes
      .filter((node) => node.type !== 'group')
      .map((node) => node.id),
  };
};

const deploymentGroupIdOf = (item) => (
  item?.shotGroupId || item?.storyboardShotGroupId || null
);

const belongsToDeploymentScope = (item, deployment) => {
  if (item?.deploymentKind !== 'storyboard') return false;
  if (deployment?.packageId && item.deployedFromPackageId !== deployment.packageId) return false;
  if (deployment?.nodeId && item.deployedFromNodeId !== deployment.nodeId) return false;
  const groupIds = new Set(Array.isArray(deployment?.shotGroupIds) ? deployment.shotGroupIds : []);
  if (!groupIds.size) return true;
  return groupIds.has(deploymentGroupIdOf(item));
};

const storyboardDeploymentGroupNodes = ({
  nodes = [],
  productionPackage,
  sourceNodeId,
} = {}) => {
  const packageId = productionPackage?.id;
  const sourceId = sourceNodeId || productionPackage?.nodeId;
  return (Array.isArray(nodes) ? nodes : []).filter((node) => (
    node?.type === 'group'
    && node?.deploymentKind === 'storyboard'
    && node?.deploymentRole === 'group'
    && (!packageId || node.deployedFromPackageId === packageId)
    && (!sourceId || node.deployedFromNodeId === sourceId)
  ));
};

const deploymentOriginFromNode = (node, fallback = DEFAULT_ORIGIN) => ({
  x: Number.isFinite(Number(node?.x)) ? Number(node.x) : fallback.x,
  y: Number.isFinite(Number(node?.y)) ? Number(node.y) : fallback.y,
});

export const resolveStoryboardDeploymentListOrigin = ({
  sourceNode,
  groupCount = 1,
  fallbackOrigin = DEFAULT_ORIGIN,
} = {}) => {
  const fallback = normalizeOrigin(fallbackOrigin);
  if (!sourceNode) return fallback;

  const sourceX = Number(sourceNode.x);
  const sourceY = Number(sourceNode.y);
  if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY)) return fallback;

  const sourceWidth = finiteNumber(sourceNode.w, 0);
  const sourceHeight = finiteNumber(sourceNode.h, 0);
  const listHeight = storyboardDeploymentListHeight(groupCount);

  return {
    x: sourceX + sourceWidth + SCRIPT_TO_DEPLOYMENT_GAP_X,
    y: sourceY + (sourceHeight / 2) - (listHeight / 2),
  };
};

export const resolveStoryboardDeploymentOrigin = ({
  nodes = [],
  productionPackage,
  sourceNodeId,
  shotGroupId,
  fallbackOrigin = DEFAULT_ORIGIN,
} = {}) => {
  const fallback = normalizeOrigin(fallbackOrigin);
  const groupNodes = storyboardDeploymentGroupNodes({
    nodes,
    productionPackage,
    sourceNodeId,
  });
  const existing = groupNodes.find((node) => deploymentGroupIdOf(node) === shotGroupId);
  if (existing) {
    return deploymentOriginFromNode(existing, fallback);
  }
  if (!groupNodes.length) {
    return fallback;
  }

  const minX = Math.min(...groupNodes.map((node) => (
    Number.isFinite(Number(node.x)) ? Number(node.x) : fallback.x
  )));
  const maxBottom = Math.max(...groupNodes.map((node) => {
    const y = Number.isFinite(Number(node.y)) ? Number(node.y) : fallback.y;
    const h = Number.isFinite(Number(node.h)) ? Number(node.h) : 0;
    return y + h;
  }));

  return {
    x: Number.isFinite(minX) ? minX : fallback.x,
    y: (Number.isFinite(maxBottom) ? maxBottom : fallback.y) + DEPLOYMENT_GROUP_GAP_Y,
  };
};

export const syncStoryboardMediaPromptsIntoDeployment = ({
  nodes = [],
  productionPackage,
  shotGroupIds = [],
} = {}) => {
  const scopedGroupIds = new Set(Array.isArray(shotGroupIds) ? shotGroupIds.filter(Boolean) : []);
  const packageId = productionPackage?.id;
  const sourceNodeId = productionPackage?.nodeId;
  let changed = false;
  const nextNodes = (Array.isArray(nodes) ? nodes : []).map((node) => {
    if (
      node?.deploymentKind !== 'storyboard'
      || !['image', 'video'].includes(node?.deploymentRole)
      || (packageId && node.deployedFromPackageId !== packageId)
      || (sourceNodeId && node.deployedFromNodeId !== sourceNodeId)
    ) {
      return node;
    }
    const shotGroupId = deploymentGroupIdOf(node);
    if (!shotGroupId || (scopedGroupIds.size && !scopedGroupIds.has(shotGroupId))) return node;
    const prompt = resolveShotGroupMediaPrompt(productionPackage, shotGroupId, node.deploymentRole);
    const referenceAssets = resolveShotGroupReferenceAssets(productionPackage, shotGroupId, selectShotTaskEntriesForDeployment(productionPackage, {
      scope: 'shot-group',
      shotGroupId,
    }));
    if (
      (node.prompt || '') === prompt
      && (node.promptDraft || '') === prompt
      && referenceAssetsEqual(node.referenceAssets, referenceAssets)
    ) {
      return node;
    }
    changed = true;
    return {
      ...node,
      prompt,
      promptDraft: prompt,
      referenceAssets,
    };
  });

  return changed ? nextNodes : nodes;
};

export const mergeCanvasDeploymentIntoGraph = ({
  nodes = [],
  edges = [],
  deployment,
  replacePrevious = true,
} = {}) => {
  const nextDeployment = deployment || { nodes: [], edges: [] };
  const deploymentNodeIds = new Set((nextDeployment.nodes || []).map((node) => node.id));
  const deploymentEdgeIds = new Set((nextDeployment.edges || []).map((edge) => edge.id));

  return {
    nodes: [
      ...nodes.filter((node) => (
        !deploymentNodeIds.has(node.id)
        && (!replacePrevious || !belongsToDeploymentScope(node, nextDeployment))
      )),
      ...(nextDeployment.nodes || []),
    ],
    edges: [
      ...edges.filter((edge) => (
        !deploymentEdgeIds.has(edge.id)
        && !deploymentNodeIds.has(edge.from)
        && !deploymentNodeIds.has(edge.to)
        && (!replacePrevious || !belongsToDeploymentScope(edge, nextDeployment))
      )),
      ...(nextDeployment.edges || []),
    ],
  };
};

export const applyCanvasDeploymentToGenerationPlan = (productionPackage, deployment) => {
  const generationPlan = productionPackage?.generationPlan || {};
  const shotTasks = Array.isArray(generationPlan.shotTasks) ? generationPlan.shotTasks : [];
  const linksByTaskId = new Map();
  const linksByShotGroupId = new Map();

  const ensureLinks = (map, key) => {
    if (!key) return null;
    if (!map.has(key)) {
      map.set(key, {});
    }
    return map.get(key);
  };

  const applyNodeLink = (links, node) => {
    if (!links) return;
    if (node.deploymentRole === 'text') {
      links.textNodeId = node.id;
    } else if (node.deploymentRole === 'image') {
      links.imageNodeId = node.id;
    } else if (node.deploymentRole === 'video') {
      links.videoNodeId = node.id;
    } else if (node.deploymentRole === 'group') {
      links.groupNodeId = node.id;
    }
  };

  (deployment?.nodes || []).forEach((node) => {
    const taskKeys = [
      node?.storyboardTaskKey || node?.storyboardTaskId,
      ...(Array.isArray(node?.storyboardTaskKeys) ? node.storyboardTaskKeys : []),
    ].filter(Boolean);
    taskKeys.forEach((taskKey) => applyNodeLink(ensureLinks(linksByTaskId, taskKey), node));
    applyNodeLink(ensureLinks(linksByShotGroupId, node?.storyboardShotGroupId || node?.shotGroupId), node);
  });

  return {
    ...generationPlan,
    deployMode: 'canvas',
    shotTasks: shotTasks.map((task, index) => {
      const links = linksByTaskId.get(getTaskIdentity(task, index))
        || linksByShotGroupId.get(getShotGroupId(task));
      if (!links) return task;
      return {
        ...task,
        status: 'deployed',
        linkedCanvasNodeIds: {
          ...(task?.linkedCanvasNodeIds || {}),
          ...links,
        },
      };
    }),
  };
};

const mediaKindFromJob = (job) => {
  const raw = String(
    job?.input?._storyboardMediaKind
    || job?.input?._mediaKind
    || job?.input?.tab
    || job?.type
    || '',
  ).toLowerCase();
  return raw.includes('video') ? 'video' : 'image';
};

const mediaGroupIdFromJob = (job) => (
  job?.input?._shotGroupId
  || job?.input?.shotGroupId
  || job?.input?.storyboardShotGroupId
  || ''
);

const mediaUrlFromJob = (job) => {
  const output = job?.output || {};
  return output.url || output.assetUrl || output.urls?.[0] || output.videoUrl || output.imageUrl || output.posterUrl || '';
};

const mediaErrorFromJob = (job, fallback = '生成失败') => {
  const output = job?.output || {};
  return job?.error || output.error || output.message || output.detail || fallback;
};

const mediaTaskPatchForJob = (job) => {
  const kind = mediaKindFromJob(job);
  const status = String(job?.status || '');
  const prefix = kind;
  const patch = {
    [`${prefix}JobId`]: job?.id || job?.jobId || null,
  };

  if (status === 'queued' || status === 'running') {
    return {
      status: `${prefix}_running`,
      ...patch,
      [`${prefix}Progress`]: Math.max(1, Math.min(99, Number(job?.progress) || 1)),
      [`${prefix}Error`]: null,
    };
  }

  if (status === 'failed' || status === 'canceled') {
    return {
      status: 'failed',
      ...patch,
      [`${prefix}Progress`]: 0,
      [`${prefix}Error`]: status === 'canceled' ? '已取消' : mediaErrorFromJob(job),
    };
  }

  if (status === 'completed') {
    const output = job?.output || {};
    const url = mediaUrlFromJob(job);
    return {
      status: `${prefix}_done`,
      ...patch,
      [`${prefix}Progress`]: 100,
      [`${prefix}Error`]: null,
      ...(url ? { [`${prefix}Url`]: url } : {}),
      ...(output.assetId ? { [`${prefix}AssetId`]: output.assetId } : {}),
      ...(output.assetPath ? { [`${prefix}AssetPath`]: output.assetPath } : {}),
    };
  }

  return {};
};

const mediaShotGroupPatchForJob = (job) => {
  const kind = mediaKindFromJob(job);
  const status = String(job?.status || '');
  const prefix = kind;
  const patch = {
    [`${prefix}JobId`]: job?.id || job?.jobId || null,
  };

  if (status === 'queued' || status === 'running') {
    return {
      ...patch,
      [`${prefix}Status`]: 'running',
      [`${prefix}Progress`]: Math.max(1, Math.min(99, Number(job?.progress) || 1)),
      [`${prefix}Error`]: null,
    };
  }
  if (status === 'failed' || status === 'canceled') {
    return {
      ...patch,
      [`${prefix}Status`]: 'failed',
      [`${prefix}Progress`]: 0,
      [`${prefix}Error`]: status === 'canceled' ? '已取消' : mediaErrorFromJob(job),
    };
  }
  if (status === 'completed') {
    const output = job?.output || {};
    const url = mediaUrlFromJob(job);
    return {
      ...patch,
      [`${prefix}Status`]: 'completed',
      [`${prefix}Progress`]: 100,
      [`${prefix}Error`]: null,
      ...(url ? { [`${prefix}Url`]: url } : {}),
      ...(output.assetId ? { [`${prefix}AssetId`]: output.assetId } : {}),
      ...(output.assetPath ? { [`${prefix}AssetPath`]: output.assetPath } : {}),
    };
  }
  return {};
};

export const applyStoryboardMediaJobToPackage = (productionPackage = {}, job = {}) => {
  const shotGroupId = mediaGroupIdFromJob(job);
  if (!shotGroupId) return productionPackage;

  const generationPlan = productionPackage.generationPlan || {};
  const shotTasks = Array.isArray(generationPlan.shotTasks) ? generationPlan.shotTasks : [];
  const taskPatch = mediaTaskPatchForJob(job);
  const groupPatch = mediaShotGroupPatchForJob(job);

  return {
    ...productionPackage,
    shotGroups: Array.isArray(productionPackage.shotGroups)
      ? productionPackage.shotGroups.map((group) => (
        getShotGroupId(group) === shotGroupId ? { ...group, ...groupPatch } : group
      ))
      : productionPackage.shotGroups,
    generationPlan: {
      ...generationPlan,
      shotTasks: shotTasks.map((task) => (
        getShotGroupId(task) === shotGroupId ? { ...task, ...taskPatch } : task
      )),
    },
  };
};
