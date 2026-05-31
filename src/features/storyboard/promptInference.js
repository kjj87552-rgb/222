import { patchStoryboardPackage } from './package/storyboardPackage.js';
import {
  renderPromptWithInputAppendix,
  sanitizeStrategicGuideForPrompt,
} from './scriptPromptUtils.js';

export const SHOTGROUP_PROMPT_INFERENCE_TAG = 'shotgroup-prompts';
export const SHOTGROUP_PROMPT_INFERENCE_BATCH_SIZE = 3;

const DEFAULT_STYLE_DIRECTIVE = '电影叙事感，画面清晰，角色一致，动作连贯。';

const toArray = (value) => (Array.isArray(value) ? value : []);

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const safeText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

const safeJson = (value) => {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return 'null';
  }
};

const firstText = (values, fallback = '') => {
  for (const value of values) {
    const text = safeText(value);
    if (text) return text;
  }
  return fallback;
};

const pickText = (item, keys, fallback = '') => {
  if (!isPlainObject(item)) return fallback;
  return firstText(keys.map((key) => item[key]), fallback);
};

const normalizeAssetsForPrompt = (assets = {}) => ({
  ...sanitizeStrategicGuideForPrompt({
    keyCharacters: toArray(assets.keyCharacters),
    keyProps: toArray(assets.keyProps),
    sceneAnalysis: toArray(assets.sceneAnalysis),
  }),
});

const assetNameById = (assets, bucket, id) => {
  const target = safeText(id);
  if (!target) return '';
  const item = toArray(assets?.[bucket]).find((entry) => (
    safeText(entry?.id) === target
    || safeText(entry?.assetId) === target
    || safeText(entry?.name) === target
  ));
  return safeText(item?.name);
};

const shotCharacters = (shot, assets) => {
  const fromIds = toArray(shot?.characterIds)
    .map((id) => assetNameById(assets, 'keyCharacters', id) || safeText(id))
    .filter(Boolean);
  const fromAudio = toArray(shot?.audio)
    .map((entry) => safeText(entry?.character))
    .filter(Boolean);
  return [...new Set([...fromIds, ...fromAudio])];
};

const shotNumber = (shot, index = 0) => (
  firstText([
    shot?.shotNumber,
    shot?.number,
    shot?.n,
    shot?.id,
  ], String(index + 1).padStart(4, '0'))
);

const shotGroupId = (shotGroup, index = 0) => (
  firstText([
    shotGroup?.groupId,
    shotGroup?.shotGroupId,
    shotGroup?.id,
  ], `G${String(index + 1).padStart(3, '0')}`)
);

const normalizePromptShotGroups = (ctx = {}) => {
  const batchGroups = toArray(ctx.shotGroups).filter(isPlainObject);
  if (batchGroups.length) return batchGroups;
  return isPlainObject(ctx.shotGroup) ? [ctx.shotGroup] : [];
};

export function shotGroupToBatchShots(shotGroup = {}, assets = {}) {
  const groupId = firstText([shotGroup.groupId, shotGroup.shotGroupId, shotGroup.id], 'G001');
  const sceneRef = safeText(shotGroup.sceneRef);
  return toArray(shotGroup.shots).map((shot, index) => ({
    分镜号: shotNumber(shot, index),
    内容: firstText([shot?.visualsAction, shot?.desc, shot?.promptText, shot?.prompt]),
    角色: shotCharacters(shot, assets),
    场景: firstText([shot?.scene, shot?.sceneName, sceneRef]),
    groupId,
    sceneRef,
    shotNumber: shotNumber(shot, index),
    timeline: safeText(shot?.timeline || shot?.dur),
    transition: safeText(shot?.transition),
    cameraWork: safeText(shot?.cameraWork || shot?.shot),
    visualsAction: firstText([shot?.visualsAction, shot?.desc]),
    audio: toArray(shot?.audio),
    dialogueRole: safeText(shot?.dialogueRole),
    sfx: safeText(shot?.sfx),
    colorTone: safeText(shot?.colorTone),
    directorNote: safeText(shot?.directorNote),
  }));
}

function directorAnalysisText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  return safeJson(value);
}

export function buildShotGroupPromptInferencePrompt(template, ctx = {}) {
  const safeCtx = ctx || {};
  const assets = normalizeAssetsForPrompt(safeCtx.assets || safeCtx.strategicGuide || {});
  const shotGroups = normalizePromptShotGroups(safeCtx);
  const shotGroup = shotGroups[0] || {};
  const targetDuration = safeText(safeCtx.targetDuration) || '15';
  const previousAnchor = safeCtx.previousAnchor ? String(safeCtx.previousAnchor).trim() : 'null';
  const batchShots = shotGroups.flatMap((group) => shotGroupToBatchShots(group, assets));
  const vars = {
    ASPECT_RATIO: firstText([
      safeCtx.aspectRatio,
      safeCtx.targetAspectRatio,
      safeCtx.outputAspectRatio,
    ], 'auto'),
    SCRIPT: firstText([
      safeCtx.scriptText,
      safeCtx.script,
      safeCtx.standardScript,
      safeCtx.rawScriptText,
      safeCtx.scriptSourceText,
    ]),
    CHARACTER_INFO: safeJson(assets.keyCharacters),
    P0_ASSETS: safeJson(assets),
    PREV_ANCHOR: previousAnchor,
    DIRECTOR_ANALYSIS: directorAnalysisText(safeCtx.directorAnalysis),
    SCRIPT_SHOT_GROUPS: safeJson(shotGroups),
    BATCH_SHOTS: safeJson(batchShots),
    SHOTGROUP_INPUT: safeJson(shotGroups.length <= 1 ? shotGroup : { shotGroups }),
    CHARACTER_LIBRARY: safeJson(assets.keyCharacters),
    SCENE_LIBRARY: safeJson(assets.sceneAnalysis),
    PROP_LIBRARY: safeJson(assets.keyProps),
    STYLE_DIRECTIVE: safeText(safeCtx.styleDirective) || DEFAULT_STYLE_DIRECTIVE,
    TARGET_DURATION: targetDuration,
  };
  const groupCount = Math.max(1, shotGroups.length);
  const callConstraints = groupCount > 1
    ? [
        `本次处理 ${groupCount} 个 shotGroup；这是一个批量提示词推理任务。`,
        '必须按 SCRIPT_SHOT_GROUPS 的顺序输出每个 shotGroup 的结果，并保留对应 groupId。',
        '推荐输出合法 JSON 数组：每项包含 groupId、items、next_anchor；items 内按分镜号输出图片提示词和视频提示词。',
        '输出条数必须以 BATCH_SHOTS 实际条数为准；若模板示例写固定 3 条，不要照搬固定数量。',
        `目标视频时长按 ${targetDuration} 秒理解；若模板内有固定时长描述，以本行目标时长覆盖。`,
      ].join('\n')
    : [
        '本次只处理一个 shotGroup；每个 shotGroup 只推理一次。',
        '输出条数必须以 BATCH_SHOTS 实际条数为准；若模板示例写固定 3 条，不要照搬固定数量。',
        '输出必须是合法 JSON。优先输出数组；字段兼容「图片提示词/视频提示词/续接锚点」或 image_prompt/video_prompt/next_anchor。',
        `目标视频时长按 ${targetDuration} 秒理解；若模板内有固定时长描述，以本行目标时长覆盖。`,
      ].join('\n');
  const appendix = [
    {
      key: 'CALL_CONSTRAINTS',
      label: '本次调用约束',
      value: callConstraints,
    },
    { key: 'P0_ASSETS', label: 'P0_ASSETS', value: vars.P0_ASSETS },
    { key: 'PREV_ANCHOR', label: 'PREV_ANCHOR', value: vars.PREV_ANCHOR },
    { key: 'DIRECTOR_ANALYSIS', label: 'DIRECTOR_ANALYSIS', value: vars.DIRECTOR_ANALYSIS },
    { key: 'SCRIPT_SHOT_GROUPS', label: 'SCRIPT_SHOT_GROUPS', value: vars.SCRIPT_SHOT_GROUPS },
    { key: 'BATCH_SHOTS', label: 'BATCH_SHOTS', value: vars.BATCH_SHOTS },
    { key: 'TARGET_DURATION', label: 'TARGET_DURATION', value: vars.TARGET_DURATION },
  ];
  const templateText = String(template || '');
  const placeholderKeys = Object.keys(vars);
  const hasAnyPlaceholder = placeholderKeys.some((key) => templateText.includes(`{{${key}}}`));
  let user_prompt = renderPromptWithInputAppendix(
    template,
    vars,
    {
      placeholders: placeholderKeys,
      appendix,
    },
  );
  if (hasAnyPlaceholder) {
    const missingBlocks = appendix
      .filter((item) => item.key === 'CALL_CONSTRAINTS' || !templateText.includes(`{{${item.key}}}`))
      .map(({ label, value }) => `${label}\n${value}`)
      .join('\n\n---\n\n');
    if (missingBlocks) {
      user_prompt = `${user_prompt.trimEnd()}\n\n---\n\n${missingBlocks}\n`;
    }
  }
  return { user_prompt, system_prompt: undefined };
}

const outputItems = (raw) => {
  if (Array.isArray(raw)) return raw.filter(isPlainObject);
  if (!isPlainObject(raw)) return [];
  for (const key of ['shotGroups', 'groups', 'items', 'prompts', 'results', 'shotPrompts', 'data']) {
    if (Array.isArray(raw[key])) return raw[key].filter(isPlainObject);
  }
  return [raw];
};

const normalizeAnchor = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (isPlainObject(value)) {
    const characters = value.角色 || value.characters;
    const characterText = Array.isArray(characters) ? characters.join('、') : safeText(characters);
    return [
      safeText(value.场景 || value.scene) ? `场景：${safeText(value.场景 || value.scene)}` : '',
      characterText ? `角色：${characterText}` : '',
      safeText(value.首画面 || value.firstFrame || value.openingFrame) ? `首画面：${safeText(value.首画面 || value.firstFrame || value.openingFrame)}` : '',
      safeText(value.description || value.summary),
    ].filter(Boolean).join('\n');
  }
  return '';
};

const normalizePromptItem = (item, index = 0, shotGroup = {}) => {
  const fallbackShot = toArray(shotGroup.shots)[index];
  return {
    shotNumber: pickText(item, ['分镜号', 'shotNumber', 'number', 'panel_index'], shotNumber(fallbackShot, index)),
    imagePrompt: pickText(item, ['图片提示词', 'image_prompt', 'imagePrompt', 'first_frame_prompt', '首帧提示词']),
    videoPrompt: pickText(item, ['视频提示词', 'video_prompt', 'videoPrompt', 'prompt', '导演分镜手记']),
    nextAnchor: normalizeAnchor(
      item.续接锚点
      || item.next_anchor
      || item.nextAnchor
      || item.anchor
    ),
    raw: item,
  };
};

const outputGroupId = (item) => (
  pickText(item, ['groupId', 'shotGroupId', 'group_id', 'shot_number', '分镜组ID', '分镜组'])
);

const outputShotNumber = (item) => (
  pickText(item, ['分镜号', 'shotNumber', 'number', 'panel_index'])
);

const isGroupedOutputCandidate = (item) => (
  isPlainObject(item)
  && !outputShotNumber(item)
  && (
    Array.isArray(item.items)
    || Array.isArray(item.prompts)
    || Array.isArray(item.results)
    || Array.isArray(item.shotPrompts)
    || safeText(item.imagePrompt || item.image_prompt || item.图片提示词)
    || safeText(item.videoPrompt || item.video_prompt || item.视频提示词 || item.prompt || item.导演分镜手记)
  )
);

const labelledJoin = (items, key) => {
  const prompts = items
    .map((item, index) => {
      const prompt = safeText(item[key]);
      if (!prompt) return '';
      if (items.length === 1) return prompt;
      const label = safeText(item.shotNumber) || String(index + 1).padStart(4, '0');
      return `#${label}\n${prompt}`;
    })
    .filter(Boolean);
  return prompts.join('\n\n');
};

const normalizeOutputMode = (value) => {
  const mode = safeText(value).toLowerCase();
  if (mode === 'image' || mode === 'image-only' || mode === 'imageprompt') return 'image';
  if (mode === 'video' || mode === 'video-only' || mode === 'videoprompt') return 'video';
  return 'dual';
};

const hasImageOutput = (mode) => normalizeOutputMode(mode) !== 'video';
const hasVideoOutput = (mode) => normalizeOutputMode(mode) !== 'image';

const normalizePromptProgress = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const promptTimestamp = (now) => {
  const value = typeof now === 'function' ? now() : now;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && value) return value;
  return new Date().toISOString();
};

export function applyShotGroupPromptInferenceStatusToPackage(pkg, {
  groupId,
  groupIds,
  status = 'running',
  progress,
  stage,
  jobId,
  error,
  now,
} = {}) {
  const ids = new Set([
    ...toArray(groupIds),
    groupId,
  ].map(safeText).filter(Boolean));
  if (!ids.size) return pkg;

  const resolvedStatus = safeText(status) || 'running';
  const resolvedProgress = normalizePromptProgress(
    progress,
    resolvedStatus === 'completed' || resolvedStatus === 'failed' ? 100 : 0,
  );
  const resolvedStage = safeText(stage)
    || (resolvedStatus === 'completed'
      ? '提示词完成'
      : resolvedStatus === 'failed'
        ? safeText(error) || '提示词失败'
        : resolvedStatus === 'queued'
          ? '提示词排队中'
          : resolvedStatus === 'pending'
            ? '等待提示词推理'
            : '提示词推理中');
  const timestamp = promptTimestamp(now);
  const shotGroups = toArray(pkg?.shotGroups);
  const nextShotGroups = shotGroups.map((group) => {
    const currentGroupId = firstText([group?.groupId, group?.shotGroupId, group?.id]);
    if (!ids.has(currentGroupId)) return group;
    return {
      ...group,
      promptStatus: resolvedStatus,
      promptProgress: resolvedProgress,
      promptStage: resolvedStage,
      promptJobId: jobId || group.promptJobId || '',
      promptError: resolvedStatus === 'failed' ? (safeText(error) || resolvedStage) : '',
      promptUpdatedAt: timestamp,
    };
  });

  const generationPlan = pkg?.generationPlan || {};
  const nextShotTasks = toArray(generationPlan.shotTasks).map((task) => {
    if (!ids.has(getTaskGroupId(task))) return task;
    return {
      ...task,
      promptStatus: resolvedStatus,
      promptProgress: resolvedProgress,
      promptStage: resolvedStage,
      promptJobId: jobId || task.promptJobId || '',
    };
  });

  return patchStoryboardPackage(pkg, {
    shotGroups: nextShotGroups,
    generationPlan: {
      ...generationPlan,
      shotTasks: nextShotTasks,
    },
  }, now);
}

export function fallbackImagePromptFromShotGroup(shotGroup = {}) {
  const parts = [
    safeText(shotGroup.groupNote),
    ...toArray(shotGroup.shots).map((shot) => firstText([
      shot?.imagePrompt,
      shot?.promptText,
      shot?.visualsAction,
      shot?.desc,
      shot?.cameraWork,
      shot?.scene,
    ])),
  ].filter(Boolean);
  return parts.join('，').slice(0, 1200);
}

export function normalizeShotGroupPromptInferenceOutput(raw, { shotGroup } = {}) {
  const sourceItems = outputItems(raw);
  const items = sourceItems.map((item, index) => normalizePromptItem(item, index, shotGroup));
  const imagePrompt = labelledJoin(items, 'imagePrompt');
  const videoPrompt = labelledJoin(items, 'videoPrompt')
    || pickText(isPlainObject(raw) ? raw : {}, ['video_prompt', 'videoPrompt', '视频提示词'])
    || imagePrompt;
  const nextAnchor = [...items].reverse().map((item) => item.nextAnchor).find(Boolean)
    || normalizeAnchor(isPlainObject(raw) ? (raw.next_anchor || raw.nextAnchor || raw.续接锚点) : null);

  return {
    groupId: firstText([
      isPlainObject(raw) ? raw.groupId : '',
      isPlainObject(raw) ? raw.shotGroupId : '',
      isPlainObject(raw) ? raw.group_id : '',
      isPlainObject(raw) ? raw.shot_number : '',
      shotGroup?.groupId,
    ]),
    imagePrompt,
    videoPrompt,
    nextAnchor,
    items,
    raw,
  };
}

export function normalizeShotGroupPromptInferenceBatchOutput(raw, { shotGroups = [], partial = false } = {}) {
  const groups = toArray(shotGroups).filter(isPlainObject);
  if (!groups.length) {
    return [normalizeShotGroupPromptInferenceOutput(raw, { shotGroup: {} })];
  }
  const sourceItems = outputItems(raw);
  const normalizedItems = sourceItems.length ? sourceItems : [];

  return groups.map((group, index) => {
    const groupId = shotGroupId(group, index);
    const groupedCandidate = normalizedItems.find((item) => (
      outputGroupId(item) === groupId && isGroupedOutputCandidate(item)
    ));
    if (groupedCandidate) {
      const normalized = normalizeShotGroupPromptInferenceOutput(groupedCandidate, { shotGroup: group });
      return { ...normalized, groupId: normalized.groupId || groupId };
    }

    const itemMatches = normalizedItems.filter((item) => outputGroupId(item) === groupId);
    if (itemMatches.length) {
      const normalized = normalizeShotGroupPromptInferenceOutput(itemMatches, { shotGroup: group });
      return { ...normalized, groupId: normalized.groupId || groupId };
    }

    const positional = normalizedItems[index];
    if (positional && !outputGroupId(positional)) {
      const normalized = normalizeShotGroupPromptInferenceOutput(positional, { shotGroup: group });
      return { ...normalized, groupId: normalized.groupId || groupId };
    }

    if (partial) return null;

    const normalized = normalizeShotGroupPromptInferenceOutput([], { shotGroup: group });
    return { ...normalized, groupId };
  }).filter(Boolean);
}

const getTaskGroupId = (task) => firstText([task?.shotGroupId, task?.shotGroup, task?.groupId]);

const promptItemForTask = (items, task) => {
  const shotNo = firstText([task?.shotNumber, task?.number, task?.shotId]);
  if (!shotNo) return null;
  return items.find((item) => item.shotNumber === shotNo) || null;
};

export function applyShotGroupPromptInferenceToPackage(pkg, {
  groupId,
  output,
  outputMode = 'dual',
  jobId,
  now,
} = {}) {
  const shotGroups = toArray(pkg?.shotGroups);
  const targetGroup = shotGroups.find((group) => firstText([group?.groupId, group?.shotGroupId, group?.id]) === groupId)
    || shotGroups[0]
    || {};
  const normalized = normalizeShotGroupPromptInferenceOutput(output, { shotGroup: targetGroup });
  const resolvedGroupId = groupId || normalized.groupId || firstText([targetGroup.groupId, targetGroup.shotGroupId, targetGroup.id]);
  const mode = normalizeOutputMode(outputMode);
  const shouldWriteImage = hasImageOutput(mode);
  const shouldWriteVideo = hasVideoOutput(mode);
  const nextShotGroups = shotGroups.map((group) => {
    const currentGroupId = firstText([group?.groupId, group?.shotGroupId, group?.id]);
    if (currentGroupId !== resolvedGroupId) return group;
    return {
      ...group,
      imagePrompt: shouldWriteImage ? normalized.imagePrompt : group.imagePrompt,
      imagePromptDraft: shouldWriteImage ? normalized.imagePrompt : (group.imagePromptDraft ?? group.imagePrompt),
      videoPrompt: shouldWriteVideo ? normalized.videoPrompt : group.videoPrompt,
      videoPromptDraft: shouldWriteVideo ? normalized.videoPrompt : (group.videoPromptDraft ?? group.videoPrompt),
      nextAnchor: normalized.nextAnchor,
      promptItems: normalized.items,
      promptStatus: 'completed',
      promptProgress: 100,
      promptStage: '提示词完成',
      promptJobId: jobId || '',
      promptError: '',
      promptUpdatedAt: new Date().toISOString(),
    };
  });
  const generationPlan = pkg?.generationPlan || {};
  const nextShotTasks = toArray(generationPlan.shotTasks).map((task) => {
    if (getTaskGroupId(task) !== resolvedGroupId) return task;
    const item = promptItemForTask(normalized.items, task);
    const imagePrompt = safeText(item?.imagePrompt) || normalized.imagePrompt;
    const videoPrompt = safeText(item?.videoPrompt) || normalized.videoPrompt;
    return {
      ...task,
      prompt: shouldWriteImage ? imagePrompt : task.prompt,
      promptDraft: shouldWriteImage ? imagePrompt : task.promptDraft,
      imagePrompt: shouldWriteImage ? imagePrompt : task.imagePrompt,
      imagePromptDraft: shouldWriteImage ? imagePrompt : (task.imagePromptDraft ?? task.imagePrompt ?? task.promptDraft ?? task.prompt),
      videoPrompt: shouldWriteVideo ? videoPrompt : task.videoPrompt,
      videoPromptDraft: shouldWriteVideo ? videoPrompt : (task.videoPromptDraft ?? task.videoPrompt),
      promptStatus: 'completed',
      promptProgress: 100,
      promptStage: '提示词完成',
      promptJobId: jobId || '',
    };
  });

  return patchStoryboardPackage(pkg, {
    shotGroups: nextShotGroups,
    generationPlan: {
      ...generationPlan,
      shotTasks: nextShotTasks,
    },
  }, now);
}

export function applyShotGroupPromptInferenceBatchToPackage(pkg, {
  outputs = [],
  outputMode = 'dual',
  jobId,
  now,
} = {}) {
  return toArray(outputs).reduce((nextPkg, output) => applyShotGroupPromptInferenceToPackage(nextPkg, {
    groupId: safeText(output?.groupId),
    output,
    outputMode,
    jobId,
    now,
  }), pkg);
}

export function applyShotGroupPromptInferenceFailureToPackage(pkg, {
  groupId,
  jobId,
  error,
  now,
} = {}) {
  const shotGroups = toArray(pkg?.shotGroups).map((group) => {
    const currentGroupId = firstText([group?.groupId, group?.shotGroupId, group?.id]);
    if (currentGroupId !== groupId) return group;
    return {
      ...group,
      promptStatus: 'failed',
      promptProgress: 100,
      promptStage: safeText(error) || '提示词推理失败',
      promptJobId: jobId || '',
      promptError: safeText(error) || '提示词推理失败',
      promptUpdatedAt: promptTimestamp(now),
    };
  });
  const generationPlan = pkg?.generationPlan || {};
  const nextShotTasks = toArray(generationPlan.shotTasks).map((task) => {
    if (getTaskGroupId(task) !== groupId) return task;
    return {
      ...task,
      promptStatus: 'failed',
      promptProgress: 100,
      promptStage: safeText(error) || '提示词推理失败',
      promptJobId: jobId || '',
    };
  });
  return patchStoryboardPackage(pkg, {
    shotGroups,
    generationPlan: {
      ...generationPlan,
      shotTasks: nextShotTasks,
    },
  }, now);
}
