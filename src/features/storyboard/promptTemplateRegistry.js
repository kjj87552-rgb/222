const promptModules = import.meta.glob('./prompts/inference/script-mode/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});

export const DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID = 'grok.ancient-real-dual-15s';

export const SHOTGROUP_PROMPT_TEMPLATE_GROUPS = [
  {
    id: 'grok',
    sourceFolder: 'grok',
    label: 'Grok 双通道',
    outputMode: 'dual',
    description: '同时产出图片提示词和视频提示词。',
  },
  {
    id: 'director-storyboard',
    sourceFolder: '导演故事板',
    label: '导演故事板',
    outputMode: 'dual',
    description: '面向导演故事板工作流，同时产出图片提示词和视频提示词。',
  },
  {
    id: 'seedence',
    sourceFolder: 'seedence',
    label: 'Seedence 视频',
    outputMode: 'video',
    description: '面向 Seedence / Seedance 视频生成的导演手记。',
  },
  {
    id: 'sora',
    sourceFolder: 'sora',
    label: 'Sora 视频',
    outputMode: 'video',
    description: '面向 Sora 视频生成的普通剧本推理模板。',
  },
  {
    id: 'veo',
    sourceFolder: 'veo',
    label: 'VEO 视频',
    outputMode: 'dual',
    description: '面向 VEO 多参考、首尾帧视频生成，保留首帧图和视频提示词。',
  },
  {
    id: 'vidu',
    sourceFolder: 'vidu',
    label: 'Vidu 视频',
    outputMode: 'dual',
    description: '面向 Vidu 视频生成的适配模板，保留图片和视频提示词。',
  },
  {
    id: 'banana',
    sourceFolder: '香蕉模式',
    label: 'Nano Banana 图片',
    outputMode: 'image',
    description: '面向图片宫格和图片叙事生成。',
  },
];

const GROUP_BY_FOLDER = new Map(SHOTGROUP_PROMPT_TEMPLATE_GROUPS.map((group) => [group.sourceFolder, group]));
const GROUP_BY_ID = new Map(SHOTGROUP_PROMPT_TEMPLATE_GROUPS.map((group) => [group.id, group]));
const GROUP_ORDER = new Map(SHOTGROUP_PROMPT_TEMPLATE_GROUPS.map((group, index) => [group.id, index]));

const SPECIAL_IDS = {
  'grok/P3_古风真人双通道提示词专家_剧本版_v1.2_10s.md': 'grok.ancient-real-dual-10s',
  'grok/P3_古风真人双通道提示词专家_剧本版_v1.2_15s.md': DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID,
  'grok/P3_都市言情双通道提示词专家_剧本版_v1.0_10s.md': 'grok.urban-romance-dual-10s',
  'grok/P3_都市言情双通道提示词专家_剧本版_v1.0_15s.md': 'grok.urban-romance-dual-15s',
  '导演故事板/故事板双通道_16x9.md': 'director-storyboard.dual-16x9',
  '导演故事板/故事板双通道_9x16.md': 'director-storyboard.dual-9x16',
};

export const DIRECTOR_STORYBOARD_PROMPT_TEMPLATE_IDS = {
  legacy: 'director-storyboard.dual',
  landscape: 'director-storyboard.dual-16x9',
  portrait: 'director-storyboard.dual-9x16',
};

const DIRECTOR_STORYBOARD_LEGACY_SELECTORS = new Set([
  DIRECTOR_STORYBOARD_PROMPT_TEMPLATE_IDS.legacy,
  `_builtin.storyboard.shotGroupPromptInference.${DIRECTOR_STORYBOARD_PROMPT_TEMPLATE_IDS.legacy}`,
]);

const normalizeImportPath = (value) => String(value || '')
  .replace(/\\/g, '/')
  .replace(/^\.\/prompts\/inference\/script-mode\//, '');

const safeText = (value) => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

const aspectRatioForTemplate = (options = {}) => {
  const value = safeText(options.aspectRatio || options.targetAspectRatio || options.outputAspectRatio).toLowerCase();
  if (value === '9:16' || value === '9x16' || value === 'portrait') return '9:16';
  if (value === '16:9' || value === '16x9' || value === 'landscape') return '16:9';
  return value ? '16:9' : '';
};

const outputsForMode = (mode) => {
  if (mode === 'image') return ['imagePrompt'];
  if (mode === 'video') return ['videoPrompt'];
  return ['imagePrompt', 'videoPrompt'];
};

const outputModeForTemplate = (group, relativePath) => {
  if (group?.outputMode === 'image') return 'image';
  const text = String(relativePath || '').toLowerCase();
  if (text.includes('dual') || relativePath.includes('双通道')) return 'dual';
  return group?.outputMode || 'dual';
};

const stableHash = (value) => {
  let hash = 5381;
  const input = String(value || '');
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index);
    hash >>>= 0;
  }
  return hash.toString(36).slice(0, 6);
};

const asciiSlug = (value) => {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/\.(md|txt)$/i, '')
    .replace(/v(\d+)[._](\d+)/gi, 'v$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'template';
};

const cleanTitlePart = (value) => String(value || '')
  .replace(/\.(md|txt)$/i, '')
  .replace(/^\d+_/, '')
  .replace(/^P\d(?:-[A-Z])?_/, '')
  .replace(/_/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const buildTitle = (group, relativePath) => {
  const parts = relativePath.split('/');
  const fileName = parts[parts.length - 1] || relativePath;
  const subFolder = parts.length > 2 ? cleanTitlePart(parts.slice(1, -1).join(' / ')) : '';
  const title = cleanTitlePart(fileName);
  return [group.label, subFolder, title].filter(Boolean).join(' · ');
};

const buildTemplateId = (group, relativePath) => {
  if (SPECIAL_IDS[relativePath]) return SPECIAL_IDS[relativePath];
  const fileName = relativePath.split('/').pop() || relativePath;
  return `${group.id}.${asciiSlug(fileName)}-${stableHash(relativePath)}`;
};

const buildDefinition = ([path, content]) => {
  const relativePath = normalizeImportPath(path);
  const [folder] = relativePath.split('/');
  const group = GROUP_BY_FOLDER.get(folder);
  if (!group) return null;
  const outputMode = outputModeForTemplate(group, relativePath);
  const id = buildTemplateId(group, relativePath);
  return {
    id,
    key: `_builtin.storyboard.shotGroupPromptInference.${id}`,
    title: buildTitle(group, relativePath),
    category: group.id,
    categoryLabel: group.label,
    outputMode,
    outputs: outputsForMode(outputMode),
    relativePath,
    sourceFolder: folder,
    providerFamily: group.id,
    content: safeText(content),
  };
};

export const SHOTGROUP_PROMPT_TEMPLATE_DEFINITIONS = Object.entries(promptModules)
  .map(buildDefinition)
  .filter(Boolean)
  .sort((a, b) => {
    const groupDiff = (GROUP_ORDER.get(a.category) ?? 99) - (GROUP_ORDER.get(b.category) ?? 99);
    if (groupDiff) return groupDiff;
    if (a.id === DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID) return -1;
    if (b.id === DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID) return 1;
    return a.title.localeCompare(b.title, 'zh-Hans-CN');
  });

const TEMPLATE_BY_ID = new Map(SHOTGROUP_PROMPT_TEMPLATE_DEFINITIONS.map((definition) => [definition.id, definition]));
const TEMPLATE_BY_KEY = new Map(SHOTGROUP_PROMPT_TEMPLATE_DEFINITIONS.map((definition) => [definition.key, definition]));

export function resolveShotGroupPromptTemplateId(idOrKey = DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID, options = {}) {
  const selector = safeText(idOrKey);
  const aspectRatio = aspectRatioForTemplate(options);
  if (!selector) return DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID;

  if (DIRECTOR_STORYBOARD_LEGACY_SELECTORS.has(selector)) {
    return aspectRatio === '9:16'
      ? DIRECTOR_STORYBOARD_PROMPT_TEMPLATE_IDS.portrait
      : DIRECTOR_STORYBOARD_PROMPT_TEMPLATE_IDS.landscape;
  }

  return selector;
}

export function getShotGroupPromptTemplateDefinition(idOrKey = DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID, options = {}) {
  const resolvedIdOrKey = resolveShotGroupPromptTemplateId(idOrKey, options);
  if (!resolvedIdOrKey) return TEMPLATE_BY_ID.get(DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID) || SHOTGROUP_PROMPT_TEMPLATE_DEFINITIONS[0] || null;
  return TEMPLATE_BY_ID.get(resolvedIdOrKey)
    || TEMPLATE_BY_KEY.get(resolvedIdOrKey)
    || TEMPLATE_BY_ID.get(DEFAULT_SHOTGROUP_PROMPT_TEMPLATE_ID)
    || SHOTGROUP_PROMPT_TEMPLATE_DEFINITIONS[0]
    || null;
}

export function getShotGroupPromptTemplateOptions(categoryId = '') {
  const group = categoryId ? GROUP_BY_ID.get(categoryId) : null;
  const targetCategory = group?.id || '';
  return SHOTGROUP_PROMPT_TEMPLATE_DEFINITIONS.filter((definition) => (
    targetCategory ? definition.category === targetCategory : true
  ));
}

export function getShotGroupPromptTemplateGroup(categoryId) {
  return GROUP_BY_ID.get(categoryId) || SHOTGROUP_PROMPT_TEMPLATE_GROUPS[0] || null;
}
