import {
  buildCharacterTurnaroundPrompt,
  buildPropConceptPrompt,
  buildSceneConceptPrompt,
} from './designSpacePrompts.js';

let idSequence = 0;

function nowId(prefix) {
  idSequence = (idSequence + 1) % Number.MAX_SAFE_INTEGER;
  return `${prefix}_${Date.now().toString(36)}_${idSequence.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cardType(card) {
  if (card?.type === 'scene' || card?.type === 'prop') {
    return card.type;
  }
  return 'character';
}

function promptForCard(card, projectStyle) {
  const type = cardType(card);
  if (type === 'scene') {
    return buildSceneConceptPrompt(card, projectStyle);
  }
  if (type === 'prop') {
    return buildPropConceptPrompt(card, projectStyle);
  }
  return buildCharacterTurnaroundPrompt(card, projectStyle);
}

const TYPE_TEMPLATE_INSTRUCTIONS = {
  scene: {
    expression: '基于上面的场景设定，生成 3x3 场景氛围网格。每格保持同一场景空间结构，分别展示不同时间、光线、机位、天气或情绪氛围，适合作为场景参考。',
    'three-view': '基于上面的场景设定，生成同一场景的三视图：远景展示完整空间关系，中景展示主要活动区域，近景展示关键环境细节；三张视图保持布局、风格、材质和光线连续。',
    'character-split': '基于上面的场景设定，生成场景拆分设定图。拆分空间平面关系、入口动线、主要家具或建筑部件、光线分区、材质特写，并用中文标注。',
    'color-card': '基于上面的场景设定，生成场景线稿与色卡。提取环境主色、辅助色、光源色和阴影色，色块约 6-12 色，并标注 HEX 或 RGB 数值。',
    'design-split': '基于上面的场景设定，生成专业级场景设计拆分图。包含整体空间概念、平面关系、关键区域、材质贴图、灯光氛围和可复用环境元素，中文标注清晰。',
    'super-split': '基于上面的场景设定，生成全景式场景深度概念分解图。中心展示完整场景，周围展示空间结构、关键道具、材质、光线、入口动线和拍摄机位参考。',
  },
  prop: {
    expression: '基于上面的道具设定，生成 3x3 道具状态网格。每格保持同一道具结构与材质，分别展示不同角度、开合状态、使用方式、磨损程度或局部细节。',
    'three-view': '基于上面的道具设定，生成同一道具的三视图：正面、侧面、背面或背侧视图平行排开；结构比例一致，材质、花纹、磨损和标志性细节统一。',
    'character-split': '基于上面的道具设定，生成道具拆分设定图。拆分整体轮廓、内部结构、零件关系、材质特写、使用方式和尺寸比例，并用中文标注。',
    'color-card': '基于上面的道具设定，生成道具线稿与色卡。提取道具主色、金属或布料材质色、旧化色、阴影色，色块约 6-12 色，并标注 HEX 或 RGB 数值。',
    'design-split': '基于上面的道具设定，生成专业级道具设计拆分图。包含整体图、三视图、结构拆解、材质特写、使用痕迹、尺寸比例和中文标注。',
    'super-split': '基于上面的道具设定，生成全景式道具深度概念分解图。中心展示完整道具，周围展示零件拆分、材质细节、使用状态、旧化痕迹和场景摆放参考。',
  },
};

function templateKey(template = {}) {
  return String(template?.id || template?.name || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
}

function explicitTemplateInstruction(template = {}, type) {
  const byType = template?.contentByType || template?.contentsByType || template?.instructionsByType || {};
  return compactString(
    byType?.[type]
      || template?.[`${type}Content`]
      || template?.[`${type}Instruction`],
  );
}

function templateInstructionForCard(template = {}, type) {
  const explicit = explicitTemplateInstruction(template, type);
  if (explicit) return explicit;
  if (type !== 'character') {
    const mapped = TYPE_TEMPLATE_INSTRUCTIONS[type]?.[templateKey(template)];
    if (mapped) return mapped;
  }
  return compactString(template?.content) || compactString(template?.name);
}

function referenceSource(item) {
  return String(item?.src || item?.url || item?.assetUrl || item?.imageUrl || item?.path || '').trim();
}

function normalizeReferenceAssets(card = {}) {
  const refs = Array.isArray(card.referenceAssets) ? card.referenceAssets : [];
  return refs
    .map((asset) => {
      const src = referenceSource(asset);
      if (!src) return null;
      return {
        ...asset,
        kind: asset.kind || asset.type || 'image',
        type: asset.type || asset.kind || 'image',
        src,
        url: asset.url || src,
        title: asset.title || asset.name || asset.filename || '人物参考图',
      };
    })
    .filter(Boolean);
}

function ratioForCard(card) {
  return card?.generationHints?.ratio || card?.ratio || (cardType(card) === 'character' ? '16:9' : '1:1');
}

function generationRatioForCard(card, imageParams = {}) {
  return imageParams?.ratio || ratioForCard(card);
}

function normalizeStatus(status) {
  if (status === 'completed' || status === 'failed' || status === 'canceled') {
    return status;
  }
  return 'generating';
}

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function withPromptPrefix(prompt, promptPrefix) {
  return [compactString(promptPrefix), compactString(prompt)].filter(Boolean).join('\n\n');
}

function isGptImage2Model(model = {}) {
  return [
    model.id,
    model.modelId,
    model.modelName,
    model.name,
    model.displayName,
  ].some((value) => String(value || '').trim().toLowerCase() === 'gpt-image-2');
}

export function softenDesignImagePrompt(prompt, model = {}) {
  return compactString(prompt);
}

export const DESIGN_SPACE_BATCH_CONCURRENCY = 5;
export const DESIGN_SPACE_SUBMISSION_INTERVAL_MS = 1200;
export const DESIGN_SPACE_GPT_IMAGE_2_BATCH_CONCURRENCY = DESIGN_SPACE_BATCH_CONCURRENCY;
export const DESIGN_SPACE_GPT_IMAGE_2_SUBMISSION_INTERVAL_MS = DESIGN_SPACE_SUBMISSION_INTERVAL_MS;

export function designGenerationQueueOptionsForModel(model = {}) {
  if (isGptImage2Model(model)) {
    return {
      concurrency: DESIGN_SPACE_GPT_IMAGE_2_BATCH_CONCURRENCY,
      submissionIntervalMs: DESIGN_SPACE_GPT_IMAGE_2_SUBMISSION_INTERVAL_MS,
    };
  }
  return {
    concurrency: DESIGN_SPACE_BATCH_CONCURRENCY,
    submissionIntervalMs: DESIGN_SPACE_SUBMISSION_INTERVAL_MS,
  };
}

function wait(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildDesignGenerationTasks({ cards = [], templates = [] } = {}) {
  const targetCards = Array.isArray(cards) ? cards.filter(Boolean) : [];
  const targetTemplates = Array.isArray(templates) ? templates.filter(Boolean) : [];
  if (targetTemplates.length === 0) {
    return targetCards.map((card) => ({ card }));
  }
  return targetCards.flatMap((card) => (
    targetTemplates.map((template) => ({ card, template }))
  ));
}

export async function runDesignGenerationQueue({
  cards = [],
  templates = [],
  concurrency = DESIGN_SPACE_BATCH_CONCURRENCY,
  submissionIntervalMs = DESIGN_SPACE_SUBMISSION_INTERVAL_MS,
  runTask,
} = {}) {
  const tasks = buildDesignGenerationTasks({ cards, templates });
  if (!tasks.length || typeof runTask !== 'function') return [];

  const limit = Math.max(1, Math.min(
    tasks.length,
    Math.floor(Number(concurrency) || DESIGN_SPACE_BATCH_CONCURRENCY),
  ));
  const results = new Array(tasks.length);
  let nextIndex = 0;
  let nextSubmissionAt = 0;
  let submissionGate = Promise.resolve();

  const intervalMs = Math.max(0, Math.floor(Number(submissionIntervalMs) || 0));
  const waitForSubmissionTurn = async () => {
    if (intervalMs <= 0) return;

    let releaseGate = () => {};
    const previousGate = submissionGate;
    submissionGate = new Promise((resolve) => {
      releaseGate = resolve;
    });
    await previousGate;
    try {
      const delayMs = Math.max(0, nextSubmissionAt - Date.now());
      await wait(delayMs);
      nextSubmissionAt = Date.now() + intervalMs;
    } finally {
      releaseGate();
    }
  };

  const worker = async () => {
    while (nextIndex < tasks.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        await waitForSubmissionTurn();
        results[index] = {
          status: 'fulfilled',
          value: await runTask(tasks[index], index),
        };
      } catch (error) {
        results[index] = {
          status: 'rejected',
          reason: error,
        };
      }
    }
  };

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

function mediaString(value) {
  const text = compactString(value);
  if (!text) return '';
  if (/^(https?:|data:|blob:|libai-asset:)/i.test(text)) return text;
  if (text.startsWith('/')) return text;
  if (/^[A-Za-z]:[\\/]/.test(text)) return text;
  return '';
}

function firstMediaString(value, seen = new Set()) {
  if (typeof value === 'string') return mediaString(value);
  if (!value || typeof value !== 'object') return '';
  if (seen.has(value)) return '';
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = firstMediaString(item, seen);
      if (resolved) return resolved;
    }
    return '';
  }

  const keys = ['assetUrl', 'url', 'src', 'imageUrl', 'assetPath', 'localPath', 'path'];
  for (const key of keys) {
    const resolved = firstMediaString(value[key], seen);
    if (resolved) return resolved;
  }
  return '';
}

function firstMediaFrom(...values) {
  for (const value of values) {
    const resolved = firstMediaString(value);
    if (resolved) return resolved;
  }
  return '';
}

function outputAssetUrl(output = {}) {
  return firstMediaFrom(output.assetUrl, output.url, output.urls, output.assetPath, output.localPath);
}

function outputLocalPath(output = {}) {
  return firstMediaFrom(output.localPath, output.assetPath);
}

function outputUrl(output = {}) {
  return firstMediaFrom(output.url, output.urls, output.assetUrl, output.assetPath, output.localPath);
}

function assetTypeForCard(card) {
  const type = cardType(card);
  if (type === 'character') {
    return 'person';
  }
  return type;
}

export function buildDesignImagePayload({
  card,
  projectStyle = '',
  model = {},
  template = null,
  imageParams = {},
  promptPrefix = '',
} = {}) {
  const type = cardType(card);
  const outputMode = type === 'character' ? 'single-image-turnaround-sheet' : 'concept-image';
  const basePrompt = promptForCard(card, projectStyle);
  const templateInstruction = template ? templateInstructionForCard(template, type) : '';
  const finalPrompt = template
    ? [basePrompt, `一键提示词模板：${template?.name || '模板'}`, templateInstruction].filter(Boolean).join('\n\n')
    : basePrompt;
  const ratio = generationRatioForCard(card, imageParams);
  const resolution = imageParams?.resolution || card?.generationHints?.resolution || card?.resolution || '';
  const prefixedPrompt = withPromptPrefix(finalPrompt, promptPrefix);
  const softenedPrompt = softenDesignImagePrompt(prefixedPrompt, model);
  const referenceAssets = normalizeReferenceAssets(card);
  const referenceImages = referenceAssets.map(referenceSource).filter(Boolean);

  return {
    type: 'image.generate',
    capability: 'image.generate',
    tab: 'image',
    title: template?.name ? `${card?.name || '设计资产'} · ${template.name}` : (card?.name || '设计资产'),
    prompt: softenedPrompt,
    negativePrompt: card?.negativePrompt || '',
    ratio,
    aspectRatio: ratio,
    resolution,
    count: 1,
    modelId: model.id || model.modelId || '',
    modelName: model.displayName || model.name || '',
    providerId: model.providerId || '',
    provider: model.providerId || model.provider || '',
    model,
    referenceAssets,
    referenceImages,
    designSpace: {
      cardId: card?.id || '',
      cardType: type,
      outputMode,
      templateId: template?.id || '',
      templateName: template?.name || '',
      promptSoftened: softenedPrompt !== prefixedPrompt,
    },
  };
}

export function designVersionFromJob(job = {}, cardId = '') {
  const output = job.output || {};
  const input = job.input || {};

  return {
    id: job.versionId || nowId('dsv'),
    cardId,
    jobId: job.id || '',
    assetId: compactString(output.assetId),
    assetUrl: outputAssetUrl(output),
    assetPath: firstMediaFrom(output.assetPath, output.localPath),
    localPath: outputLocalPath(output),
    url: outputUrl(output),
    status: normalizeStatus(job.status),
    prompt: input.prompt || job.prompt || '',
    negativePrompt: input.negativePrompt || job.negativePrompt || '',
    ratio: input.ratio || job.ratio || '',
    resolution: input.resolution || job.resolution || '',
    model: input.model || input.modelId || job.model || job.modelId || '',
    provider: input.provider || input.providerId || job.provider || job.providerId || '',
    error: compactString(job.error) || compactString(output.error) || compactString(output.message),
    stage: compactString(output.stage) || compactString(job.stage),
    createdAt: job.completedAt || job.updatedAt || job.createdAt || new Date().toISOString(),
  };
}

export function designAssetMeta({ packageId = '', card = {}, version = {} } = {}) {
  const type = cardType(card);
  const assetType = assetTypeForCard(card);

  return {
    source: 'design-space',
    designSpaceId: packageId,
    designCardId: card.id || '',
    designCardType: type,
    assetType,
    visualType: assetType,
    imageCategory: assetType,
    category: assetType,
    prompt: version.prompt || '',
    negativePrompt: version.negativePrompt || '',
    isCharacterTurnaroundSheet: type === 'character',
  };
}
