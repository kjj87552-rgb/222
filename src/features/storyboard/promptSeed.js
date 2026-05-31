import { PromptStore } from '../../shared/platform/promptStore.js';
import { DIRECTOR_BIBLE_V1 } from './directorBible.js';
import { SCRIPT_TO_SHOTS_V2_TEMPLATE } from './scriptPromptUtils.js';
import { SHOTGROUP_PROMPT_TEMPLATE_DEFINITIONS } from './promptTemplateRegistry.js';

import NOVEL_TO_SCRIPT_V1 from './prompts/v3/novelToScript.v1.txt?raw';
import SCRIPT_FORMATTER_V1 from './prompts/v3/scriptFormatter.v1.txt?raw';
import EXTRACT_ASSETS_V3 from './prompts/v3/extractAssets.v3.txt?raw';
import REFERENCE_ANALYZE_V1 from './prompts/v3/referenceAnalyze.v1.txt?raw';
import SCRIPT_TO_SHOTGROUPS_V3_15S from './prompts/v3/scriptToShotGroups.v3.15s.txt?raw';
import SCRIPT_TO_SHOTGROUPS_V3_8S from './prompts/v3/scriptToShotGroups.v3.8s.txt?raw';
import SCRIPT_TO_SHOTGROUPS_V4_UNIFIED from './prompts/v4/scriptToShotGroups.v4.unified.txt?raw';
import SHOTGROUP_PROMPT_INFERENCE_V4_DUAL from './prompts/v4/shotGroupPromptInference.v4.dual.txt?raw';

/* Stable, well-known titles for built-in storyboard prompts. */
export const STORYBOARD_PROMPT_KEYS = {
  fillShotDesc:           '_builtin.storyboard.fillShotDesc.v1',
  directorBible:          '_builtin.storyboard.directorBible.v1',
  scriptToShots:          '_builtin.storyboard.scriptToShots.v2',
  novelToScript:          '_builtin.storyboard.novelToScript.v1',
  scriptFormatter:        '_builtin.storyboard.scriptFormatter.v1',
  extractAssets:          '_builtin.storyboard.extractAssets.v3',
  referenceAnalyze:       '_builtin.storyboard.referenceAnalyze.v1',
  scriptToShotGroupsUnified: '_builtin.storyboard.scriptToShotGroups.v4.unified',
  shotGroupPromptInference: '_builtin.storyboard.shotGroupPromptInference.v4.dual',
  scriptToShotGroups15s:  '_builtin.storyboard.scriptToShotGroups.v3.15s',
  scriptToShotGroups8s:   '_builtin.storyboard.scriptToShotGroups.v3.8s',
};

const SHOTGROUP_PROMPT_TEMPLATE_SEEDS = SHOTGROUP_PROMPT_TEMPLATE_DEFINITIONS.map((definition) => ({
  title: definition.key,
  scope: 'global',
  category: 'storyboard.prompt.inference',
  tags: [
    'builtin',
    'storyboard',
    'shotgroup-prompts',
    definition.category,
    definition.outputMode === 'dual' ? 'dual-channel' : `${definition.outputMode}-channel`,
    'tapnow',
  ],
  meta: {
    builtin: true,
    role: 'shotgroup-prompts',
    source: 'tapnow-script-mode',
    sourcePath: definition.relativePath,
    promptTemplateId: definition.id,
    promptTemplateTitle: definition.title,
    providerFamily: definition.providerFamily,
    outputMode: definition.outputMode,
    outputs: definition.outputs,
    editable: true,
  },
  content: definition.content,
}));

const SEED_PROMPTS = [
  /* — Phase 1 (existing) — */
  {
    title: STORYBOARD_PROMPT_KEYS.fillShotDesc,
    scope: 'global',
    category: 'storyboard',
    tags: ['builtin', 'storyboard', 'fill-description'],
    meta: { builtin: true, version: 1, role: 'fill-shot-desc' },
    content: [
      '你是一名经验丰富的电影分镜师。基于以下信息，为这一镜头生成一段简洁、画面感强、可被图像生成模型直接使用的描述。',
      '',
      '【整体风格】{{style}}',
      '【场景】{{scene_name}}：{{scene_description}}',
      '【出场角色】{{characters}}',
      '【景别】{{shot_type}}',
      '【时长】{{duration}}',
      '【上一镜】{{prev_shot}}',
      '【下一镜】{{next_shot}}',
      '',
      '要求：',
      '- 30-60 个汉字',
      '- 描述画面（人物动作、表情、镜头角度、光线、环境）',
      '- 不要解释、不要 markdown、不要前后缀引号',
      '- 直接输出描述文本',
    ].join('\n'),
  },
  {
    title: STORYBOARD_PROMPT_KEYS.directorBible,
    scope: 'global',
    category: 'storyboard.kb.core',
    tags: ['builtin', 'storyboard', 'director-bible', 'core'],
    meta: { builtin: true, version: 1, role: 'core-knowledge', editable: true },
    content: DIRECTOR_BIBLE_V1,
  },
  {
    title: STORYBOARD_PROMPT_KEYS.scriptToShots,
    scope: 'global',
    category: 'storyboard.prompt.main',
    tags: ['builtin', 'storyboard', 'script-to-shots'],
    meta: { builtin: true, version: 2, role: 'script-to-shots', mode: 'script' },
    content: SCRIPT_TO_SHOTS_V2_TEMPLATE,
  },

  /* — Phase 2A (new) — */
  {
    title: STORYBOARD_PROMPT_KEYS.novelToScript,
    scope: 'global',
    category: 'storyboard.prompt.preprocess',
    tags: ['builtin', 'storyboard', 'novel-to-script'],
    meta: { builtin: true, version: 1, role: 'novel-to-script' },
    content: NOVEL_TO_SCRIPT_V1,
  },
  {
    title: STORYBOARD_PROMPT_KEYS.scriptFormatter,
    scope: 'global',
    category: 'storyboard.prompt.preprocess',
    tags: ['builtin', 'storyboard', 'script-formatter'],
    meta: { builtin: true, version: 1, role: 'script-formatter' },
    content: SCRIPT_FORMATTER_V1,
  },
  {
    title: STORYBOARD_PROMPT_KEYS.extractAssets,
    scope: 'global',
    category: 'storyboard.prompt.assets',
    tags: ['builtin', 'storyboard', 'extract-assets'],
    meta: { builtin: true, version: 3, role: 'extract-assets' },
    content: EXTRACT_ASSETS_V3,
  },
  {
    title: STORYBOARD_PROMPT_KEYS.referenceAnalyze,
    scope: 'global',
    category: 'storyboard.prompt.reference',
    tags: ['builtin', 'storyboard', 'reference-analysis'],
    meta: { builtin: true, version: 1, role: 'reference-analysis' },
    content: REFERENCE_ANALYZE_V1,
  },
  {
    title: STORYBOARD_PROMPT_KEYS.scriptToShotGroupsUnified,
    scope: 'global',
    category: 'storyboard.prompt.main',
    tags: ['builtin', 'storyboard', 'script-to-shotgroups', 'unified-duration'],
    meta: { builtin: true, version: 4, role: 'script-to-shotgroups', engine: 'unified', durationRange: '8-15s' },
    content: SCRIPT_TO_SHOTGROUPS_V4_UNIFIED,
  },
  {
    title: STORYBOARD_PROMPT_KEYS.shotGroupPromptInference,
    scope: 'global',
    category: 'storyboard.prompt.inference',
    tags: ['builtin', 'storyboard', 'shotgroup-prompts', 'dual-channel', 'tapnow'],
    meta: { builtin: true, version: 4, role: 'shotgroup-prompts', source: 'tapnow-grok-dual-15s', editable: true },
    content: SHOTGROUP_PROMPT_INFERENCE_V4_DUAL,
  },
  ...SHOTGROUP_PROMPT_TEMPLATE_SEEDS,
  {
    title: STORYBOARD_PROMPT_KEYS.scriptToShotGroups15s,
    scope: 'global',
    category: 'storyboard.prompt.main',
    tags: ['builtin', 'storyboard', 'script-to-shotgroups', 'engine-15s'],
    meta: { builtin: true, version: 3, role: 'script-to-shotgroups', engine: '15s' },
    content: SCRIPT_TO_SHOTGROUPS_V3_15S,
  },
  {
    title: STORYBOARD_PROMPT_KEYS.scriptToShotGroups8s,
    scope: 'global',
    category: 'storyboard.prompt.main',
    tags: ['builtin', 'storyboard', 'script-to-shotgroups', 'engine-8s'],
    meta: { builtin: true, version: 3, role: 'script-to-shotgroups', engine: '8s' },
    content: SCRIPT_TO_SHOTGROUPS_V3_8S,
  },
];

/* Idempotent seeding — only creates prompts whose title doesn't already exist.
 * Works in both Electron (window.libai.prompt) and browser (HTTP fallback via PromptStore). */
export async function seedStoryboardPrompts() {
  if (typeof window === 'undefined') return;
  let existing = [];
  try {
    const res = await PromptStore.list();
    existing = Array.isArray(res?.prompts) ? res.prompts : (Array.isArray(res) ? res : []);
  } catch (error) {
    console.warn('[storyboard] failed to list prompts during seed', error);
    return;
  }
  const haveTitles = new Set(existing.map((p) => p.title));
  for (const seed of SEED_PROMPTS) {
    if (haveTitles.has(seed.title)) continue;
    try {
      await PromptStore.create(seed);
      console.info('[storyboard] seeded prompt:', seed.title);
    } catch (error) {
      console.warn('[storyboard] failed to seed prompt', seed.title, error);
    }
  }
}

/* Find a builtin prompt by its key. Works in both Electron and browser.
 * Returns the row { id, title, content, ... } or null if not found / on error. */
export async function getStoryboardPrompt(key) {
  if (typeof window === 'undefined') return null;
  try {
    const res = await PromptStore.list();
    const list = Array.isArray(res?.prompts) ? res.prompts : (Array.isArray(res) ? res : []);
    return list.find((p) => p.title === key) || null;
  } catch (error) {
    console.warn('[storyboard] failed to load prompt', key, error);
    return null;
  }
}
