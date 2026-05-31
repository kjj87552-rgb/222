import {
  makeEmptyAnalysisDraft,
  normalizeAnalysisDraft,
} from '../reference/referenceSchema.js';
import {
  normalizeAssetBindings,
  normalizeAssetCandidates,
} from '../assetBindings.js';

export const STORYBOARD_PACKAGE_VERSION = 2;

export const SOURCE_MODES = Object.freeze({
  script: 'script',
  character_reference: 'character_reference',
  video_reference: 'video_reference',
  videoRemix: 'video-remix',
  mixed: 'mixed',
});

const DEFAULT_PROJECT_ID = 'local-default';

const toIsoTimestamp = (now) => {
  const value = typeof now === 'function' ? now() : now;
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string' && value) {
    return value;
  }
  return new Date().toISOString();
};

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const mergeObject = (defaults, value) => ({
  ...defaults,
  ...(isPlainObject(value) ? value : {}),
});

const toArray = (value) => (Array.isArray(value) ? value : []);

const toObject = (value) => (isPlainObject(value) ? value : {});

const safeText = (value) => (
  value === null || value === undefined ? '' : String(value).trim()
);

const sanitizeTaskId = (value, fallback) => {
  const raw = safeText(value) || safeText(fallback) || 'shot-task';
  const sanitized = raw
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sanitized || 'shot-task';
};

const normalizePlanStatus = (status) => {
  const value = safeText(status);
  if (['planned', 'deployed', 'image_done', 'video_done', 'failed'].includes(value)) {
    return value;
  }
  return 'planned';
};

const audioLineText = (audio) => toArray(audio)
  .map((entry) => {
    if (!isPlainObject(entry)) return '';
    const character = safeText(entry.character);
    const line = safeText(entry.line);
    if (!line) return '';
    return character ? `${character}：${line}` : line;
  })
  .filter(Boolean)
  .join(' / ');

const compactPrompt = (parts) => parts
  .map(safeText)
  .filter(Boolean)
  .join('\n');

const shotTaskTitle = (shot, shotNumber) => (
  compactPrompt([
    shotNumber ? `#${shotNumber}` : '',
    shot?.shot,
    shot?.cameraWork,
  ]).replace(/\n/g, ' · ') || `镜头 ${shotNumber || ''}`.trim()
);

export const buildShotTasksFromShotGroups = (shotGroups = []) => {
  const tasks = [];
  let globalIndex = 0;

  toArray(shotGroups).forEach((group, groupIndex) => {
    if (!isPlainObject(group)) return;
    const groupId = safeText(group.groupId || group.shotGroupId || group.id)
      || `G${String(groupIndex + 1).padStart(3, '0')}`;
    const sceneRef = safeText(group.sceneRef);

    toArray(group.shots).forEach((shot) => {
      if (!isPlainObject(shot)) return;
      globalIndex += 1;
      const shotNumber = safeText(shot.shotNumber || shot.number || shot.n)
        || String(globalIndex).padStart(4, '0');
      const shotId = safeText(shot.id || shot.shotId)
        || `sh_${sanitizeTaskId(groupId)}_${shotNumber}`;
      const taskId = sanitizeTaskId(`${groupId}-${shotNumber}`, `${groupIndex + 1}-${globalIndex}`);
      const imagePrompt = compactPrompt([
        shot.promptText,
        shot.prompt,
        shot.imagePrompt,
        shot.scene,
        shot.cameraWork,
        shot.visualsAction,
        shot.desc,
        shot.colorTone,
        shot.directorNote,
      ]);
      const dialogue = audioLineText(shot.audio);
      const videoPrompt = compactPrompt([
        imagePrompt,
        shot.transition ? `转场：${shot.transition}` : '',
        shot.timeline || shot.dur ? `时长：${shot.timeline || shot.dur}` : '',
        dialogue ? `对白：${dialogue}` : '',
        shot.sfx ? `音效：${shot.sfx}` : '',
      ]);

      tasks.push({
        id: taskId,
        shotId,
        sourceShotId: shotId,
        shotNumber,
        shotGroupId: groupId,
        shotGroup: groupId,
        groupId,
        sceneRef,
        scene: safeText(shot.scene),
        title: shotTaskTitle(shot, shotNumber),
        shotTitle: shotTaskTitle(shot, shotNumber),
        status: normalizePlanStatus(shot.status),
        timeline: safeText(shot.timeline || shot.dur),
        duration: safeText(shot.timeline || shot.dur),
        prompt: imagePrompt,
        promptDraft: imagePrompt,
        imagePrompt,
        imagePromptDraft: imagePrompt,
        videoPrompt,
        videoPromptDraft: videoPrompt,
        audio: toArray(shot.audio),
        characterIds: toArray(shot.characterIds),
        sceneId: shot.sceneId || null,
        refImageUrls: toArray(shot.refImageUrls),
      });
    });
  });

  return tasks;
};

const normalizeArrayFields = (defaults, value, fieldNames) => {
  const merged = mergeObject(defaults, value);

  return fieldNames.reduce((next, fieldName) => ({
    ...next,
    [fieldName]: toArray(merged[fieldName]),
  }), merged);
};

const normalizeContinuityRules = (defaults, value) => {
  const merged = normalizeArrayFields(defaults, value, [
    'characterConsistency',
    'outfitContinuity',
    'sceneContinuity',
    'cameraLanguage',
    'colorPalette',
    'forbiddenChanges',
  ]);

  return {
    ...merged,
    shotToCharacterMap: toObject(merged.shotToCharacterMap),
    shotToSceneMap: toObject(merged.shotToSceneMap),
  };
};

const normalizeDiagnostics = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isPlainObject(value)) {
    return [];
  }

  return [
    ...toArray(value.warnings),
    ...toArray(value.errors),
  ];
};

const normalizeSourceMode = (sourceMode) => (
  Object.values(SOURCE_MODES).includes(sourceMode) ? sourceMode : SOURCE_MODES.script
);

const NESTED_PATCH_SECTION_NAMES = [
  'brief',
  'characterBible',
  'sceneBible',
  'propBible',
  'continuityRules',
  'analysisDraft',
  'scriptSource',
  'videoSource',
  'generationPlan',
  'reviewState',
];

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const mergeNestedPatch = (currentValue, patchValue) => {
  if (!isPlainObject(currentValue) || !isPlainObject(patchValue)) {
    return patchValue;
  }

  return Object.keys(patchValue).reduce((next, key) => ({
    ...next,
    [key]: hasOwn(patchValue, key)
      ? mergeNestedPatch(currentValue[key], patchValue[key])
      : currentValue[key],
  }), { ...currentValue });
};

export const makeStoryboardPackageId = (nodeId = '') => (
  `storyboard_pkg_${String(nodeId || 'local')}`
);

const resolveStoryboardPackageId = (input, base, context = {}) => {
  if (shouldRebaseStoryboardPackage(input, context)) {
    return base.id;
  }
  return input.id ?? base.id;
};

const shouldRebaseStoryboardPackage = (input, context = {}) => {
  const contextNodeId = safeText(context.nodeId);
  const inputNodeId = safeText(input.nodeId);
  const inputPackageId = safeText(input.id);
  const generatedPackageIdMismatch = inputPackageId.startsWith('storyboard_pkg_')
    && inputPackageId !== makeStoryboardPackageId(contextNodeId);
  return Boolean(
    contextNodeId
    && (
      (inputNodeId && contextNodeId !== inputNodeId)
      || generatedPackageIdMismatch
    ),
  );
};

const REBASED_SHOT_TASK_OUTPUT_FIELDS = [
  'linkedCanvasNodeIds',
  'textNodeId',
  'imageNodeId',
  'videoNodeId',
  'groupNodeId',
  'imageOutputAssetId',
  'videoOutputAssetId',
  'imageJobId',
  'videoJobId',
  'imageStatus',
  'videoStatus',
  'imageProgress',
  'videoProgress',
  'imageError',
  'videoError',
  'imageUrl',
  'videoUrl',
  'imageSrc',
  'videoSrc',
  'imageAssetId',
  'videoAssetId',
  'imageAssetPath',
  'videoAssetPath',
  'imageAssetUrl',
  'videoAssetUrl',
  'imageUrls',
  'videoUrls',
  'poster',
  'previewUrl',
  'thumbnail',
  'thumb',
];

const REBASED_SHOT_GROUP_OUTPUT_FIELDS = [
  'imageJobId',
  'videoJobId',
  'imageStatus',
  'videoStatus',
  'imageProgress',
  'videoProgress',
  'imageError',
  'videoError',
  'imageUrl',
  'videoUrl',
  'imageSrc',
  'videoSrc',
  'imageAssetId',
  'videoAssetId',
  'imageAssetPath',
  'videoAssetPath',
  'imageAssetUrl',
  'videoAssetUrl',
  'imageUrls',
  'videoUrls',
  'poster',
  'previewUrl',
  'thumbnail',
  'thumb',
];

const omitFields = (record, fields) => {
  if (!isPlainObject(record)) return record;
  const next = { ...record };
  fields.forEach((field) => {
    delete next[field];
  });
  return next;
};

const rebaseShotTaskForNode = (task) => {
  const next = omitFields(task, REBASED_SHOT_TASK_OUTPUT_FIELDS);
  return isPlainObject(next) ? { ...next, status: 'planned' } : next;
};

const rebaseShotGroupForNode = (group) => omitFields(group, REBASED_SHOT_GROUP_OUTPUT_FIELDS);

export const makeEmptyStoryboardPackage = ({
  projectId = DEFAULT_PROJECT_ID,
  nodeId = '',
  sourceMode = SOURCE_MODES.script,
  now,
} = {}) => {
  const timestamp = toIsoTimestamp(now);

  return {
    id: makeStoryboardPackageId(nodeId),
    version: STORYBOARD_PACKAGE_VERSION,
    projectId,
    nodeId,
    sourceMode: normalizeSourceMode(sourceMode),
    sourceAssets: [],
    scriptSource: {
      rawText: '',
      normalizedText: '',
      updatedAt: '',
    },
    videoSource: {
      sourceAssetId: '',
      analysisJobId: '',
      frameAssets: [],
      remixStrategy: {},
    },
    assetCandidates: [],
    assetBindings: [],
    analysisDraft: makeEmptyAnalysisDraft(timestamp),
    brief: {
      title: '',
      logline: '',
      synopsis: '',
      notes: '',
    },
    characterBible: {
      characters: [],
      relationshipGraph: [],
      conflictReport: [],
    },
    sceneBible: {
      scenes: [],
    },
    propBible: {
      props: [],
    },
    videoReferenceAnalysis: null,
    continuityRules: {
      characterConsistency: [],
      outfitContinuity: [],
      sceneContinuity: [],
      cameraLanguage: [],
      colorPalette: [],
      forbiddenChanges: [],
      shotToCharacterMap: {},
      shotToSceneMap: {},
    },
    shotGroups: [],
    generationPlan: {
      id: `genplan_${nodeId || 'script'}`,
      target: 'image_then_video',
      deployMode: 'virtual',
      shotTasks: [],
    },
    reviewState: {
      stage: 'draft',
      sourceReviewed: false,
      characterReviewed: false,
      videoReviewed: false,
      packageReviewed: false,
      generationPlanReviewed: false,
      notes: [],
    },
    diagnostics: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const normalizeStoryboardPackage = (value, context = {}) => {
  const input = isPlainObject(value) ? value : {};
  const base = makeEmptyStoryboardPackage({
    projectId: context.projectId ?? input.projectId ?? DEFAULT_PROJECT_ID,
    nodeId: context.nodeId ?? input.nodeId ?? '',
    sourceMode: input.sourceMode,
    now: context.now ?? input.createdAt ?? input.updatedAt,
  });
  const rebaseForCurrentNode = shouldRebaseStoryboardPackage(input, context);
  const shotGroups = rebaseForCurrentNode
    ? toArray(input.shotGroups).map(rebaseShotGroupForNode)
    : toArray(input.shotGroups);
  const generationPlanInput = rebaseForCurrentNode
    ? {
      ...toObject(input.generationPlan),
      id: base.generationPlan.id,
      shotTasks: toArray(input.generationPlan?.shotTasks).map(rebaseShotTaskForNode),
    }
    : input.generationPlan;
  const generationPlan = normalizeArrayFields(base.generationPlan, generationPlanInput, ['shotTasks']);
  const shotTasks = generationPlan.shotTasks.length
    ? generationPlan.shotTasks
    : buildShotTasksFromShotGroups(shotGroups);

  return {
    ...base,
    ...input,
    id: resolveStoryboardPackageId(input, base, context),
    version: input.version ?? STORYBOARD_PACKAGE_VERSION,
    projectId: context.projectId ?? input.projectId ?? base.projectId,
    nodeId: context.nodeId ?? input.nodeId ?? base.nodeId,
    sourceMode: normalizeSourceMode(input.sourceMode ?? base.sourceMode),
    sourceAssets: toArray(input.sourceAssets),
    scriptSource: mergeObject(base.scriptSource, input.scriptSource),
    videoSource: {
      ...mergeObject(base.videoSource, input.videoSource),
      frameAssets: toArray(input.videoSource?.frameAssets),
      remixStrategy: toObject(input.videoSource?.remixStrategy),
    },
    assetCandidates: normalizeAssetCandidates(input.assetCandidates),
    assetBindings: normalizeAssetBindings(input.assetBindings),
    analysisDraft: normalizeAnalysisDraft(input.analysisDraft ?? base.analysisDraft),
    brief: mergeObject(base.brief, input.brief),
    characterBible: normalizeArrayFields(base.characterBible, input.characterBible, [
      'characters',
      'relationshipGraph',
      'conflictReport',
    ]),
    sceneBible: normalizeArrayFields(base.sceneBible, input.sceneBible, ['scenes']),
    propBible: normalizeArrayFields(base.propBible, input.propBible, ['props']),
    videoReferenceAnalysis: input.videoReferenceAnalysis ?? base.videoReferenceAnalysis,
    continuityRules: normalizeContinuityRules(base.continuityRules, input.continuityRules),
    shotGroups,
    generationPlan: {
      ...generationPlan,
      id: rebaseForCurrentNode ? base.generationPlan.id : generationPlan.id,
      shotTasks,
    },
    reviewState: mergeObject(base.reviewState, input.reviewState),
    diagnostics: normalizeDiagnostics(input.diagnostics),
    createdAt: input.createdAt ?? base.createdAt,
    updatedAt: input.updatedAt ?? base.updatedAt,
  };
};

export const getNodeStoryboardPackage = (node, context = {}) => {
  const value = node?.storyboardPackage ?? node?.state?.storyboardPackage ?? node?.settings?.storyboardPackage;
  const input = isPlainObject(value) ? value : {};
  const legacyShotGroups = toArray(input.shotGroups).length ? [] : toArray(node?.shotGroups);
  const packageValue = legacyShotGroups.length
    ? { ...input, shotGroups: legacyShotGroups }
    : value;
  return normalizeStoryboardPackage(packageValue, {
    projectId: context.projectId,
    nodeId: context.nodeId ?? node?.id,
    now: context.now,
  });
};

export const patchStoryboardPackage = (pkg, patch = {}, now) => {
  const normalized = normalizeStoryboardPackage(pkg);
  const patchObject = isPlainObject(patch) ? patch : {};
  const next = {
    ...normalized,
    ...patchObject,
    updatedAt: toIsoTimestamp(now),
  };

  NESTED_PATCH_SECTION_NAMES.forEach((sectionName) => {
    if (hasOwn(patchObject, sectionName)) {
      next[sectionName] = mergeNestedPatch(normalized[sectionName], patchObject[sectionName]);
    }
  });

  return normalizeStoryboardPackage(next);
};

export const summarizeGenerationPlan = (plan = {}) => {
  const shotTasks = Array.isArray(plan.shotTasks) ? plan.shotTasks : [];
  const summary = {
    total: shotTasks.length,
    planned: 0,
    deployed: 0,
    imageDone: 0,
    videoDone: 0,
    failed: 0,
    completed: 0,
  };

  shotTasks.forEach((task) => {
    switch (task?.status) {
      case 'planned':
        summary.planned += 1;
        break;
      case 'deployed':
        summary.deployed += 1;
        break;
      case 'image_done':
        summary.imageDone += 1;
        break;
      case 'video_done':
        summary.videoDone += 1;
        summary.completed += 1;
        break;
      case 'failed':
        summary.failed += 1;
        break;
      default:
        break;
    }
  });

  return summary;
};

export const updateShotTaskOutput = (pkg, shotTaskId, { kind, assetId, nodeId } = {}) => {
  const normalized = normalizeStoryboardPackage(pkg);
  if (kind !== 'image' && kind !== 'video') {
    return normalized;
  }

  const shotTasks = Array.isArray(normalized.generationPlan.shotTasks)
    ? normalized.generationPlan.shotTasks
    : [];
  if (!shotTasks.some((task) => task?.id === shotTaskId)) {
    return normalized;
  }

  const nextShotTasks = shotTasks.map((task) => {
    if (task?.id !== shotTaskId) {
      return task;
    }

    const linkedCanvasNodeIds = {
      ...(isPlainObject(task.linkedCanvasNodeIds) ? task.linkedCanvasNodeIds : {}),
    };

    if (kind === 'image') {
      if (nodeId) {
        linkedCanvasNodeIds.imageNodeId = nodeId;
      }
      return {
        ...task,
        imageOutputAssetId: assetId,
        linkedCanvasNodeIds,
        status: 'image_done',
      };
    }

    if (kind === 'video') {
      if (nodeId) {
        linkedCanvasNodeIds.videoNodeId = nodeId;
      }
      return {
        ...task,
        videoOutputAssetId: assetId,
        linkedCanvasNodeIds,
        status: 'video_done',
      };
    }

    return task;
  });

  return patchStoryboardPackage(normalized, {
    generationPlan: {
      ...normalized.generationPlan,
      shotTasks: nextShotTasks,
    },
  });
};
