import { normalizePromptTemplate } from './promptRunnerUtils.js';
import shortDramaStoryboardPrompt16x9 from './prompts/shortDramaStoryboardPrompt16x9.md?raw';
import shortDramaStoryboardPrompt9x16 from './prompts/shortDramaStoryboardPrompt9x16.md?raw';
import novelToScriptPromptV1 from '../storyboard/prompts/v3/novelToScript.v1.txt?raw';
import extractAssetsPromptV3 from '../storyboard/prompts/v3/extractAssets.v3.txt?raw';

function withPromptRunnerInputSection(prompt, label, outputContract = '') {
  return [
    String(prompt || '').trim(),
    outputContract ? '' : null,
    outputContract ? '---' : null,
    outputContract ? '【提示词调用节点输出格式】' : null,
    outputContract ? String(outputContract || '').trim() : null,
    '',
    '---',
    label,
    '{{INPUT}}',
  ].filter((item) => item !== null && item !== undefined).join('\n');
}

const NOVEL_TO_SCRIPT_JSON_CONTRACT = [
  '必须只输出 JSON 对象，不要 Markdown 代码块、不要解释、不要在 JSON 外追加任何文字。',
  '固定字段：script_text。',
  'script_text 的值必须是完整剧本文本，保留原剧本格式、换行、场次、动作和台词。',
  '示例：{"script_text":"第1集\\n\\n1-1\\n场：书房・夜・内\\n△少女推门而入。"}',
].join('\n');

const EXTRACT_ASSETS_JSON_CONTRACT = [
  '必须只输出 JSON 对象，不要 Markdown 代码块、不要解释、不要在 JSON 外追加任何文字。',
  '固定字段：keyCharacters、keyProps、sceneAnalysis，三者都必须是数组；没有内容时输出空数组。',
  '每个角色或道具至少包含 name 和 details；每个场景至少包含 name 和 prompt。',
  '示例：{"keyCharacters":[{"name":"方源","details":"黑发少年，青色长衫"}],"keyProps":[],"sceneAnalysis":[{"name":"雨夜街巷","prompt":"潮湿街巷，雨水反光"}]}',
].join('\n');

export const OFFICIAL_PROMPT_TEMPLATES = [
  {
    id: 'official_short_drama_storyboard_16_9_v1',
    title: '分镜故事板 16:9',
    description: '根据短剧剧本和角色信息，生成用于图生图的 16:9 横版影视工业分镜看板提示词。',
    prompt: shortDramaStoryboardPrompt16x9,
    source: 'official',
    readonly: true,
  },
  {
    id: 'official_short_drama_storyboard_9_16_v1',
    title: '分镜故事板 9:16',
    description: '根据短剧剧本和角色信息，生成用于图生图的 9:16 竖版影视工业分镜看板提示词。',
    prompt: shortDramaStoryboardPrompt9x16,
    source: 'official',
    readonly: true,
  },
  {
    id: 'official_storyboard_novel_to_script_v1',
    title: '小说转剧本',
    description: '将小说原文改编为短视频剧本格式，自动筛选不可视内容并强化镜头、对白和节奏。',
    prompt: withPromptRunnerInputSection(novelToScriptPromptV1, '【小说原文】', NOVEL_TO_SCRIPT_JSON_CONTRACT),
    source: 'official',
    readonly: true,
  },
  {
    id: 'official_storyboard_extract_assets_v3',
    title: '资产提取',
    description: '从小说或剧本文本中提取角色、场景和关键道具视觉蓝图，输出可用于资产配置的结构化 JSON。',
    prompt: withPromptRunnerInputSection(extractAssetsPromptV3, '【小说或剧本文本】', EXTRACT_ASSETS_JSON_CONTRACT),
    source: 'official',
    readonly: true,
  },
];

export function mergePromptTemplateOptions(userRecords = []) {
  const users = (Array.isArray(userRecords) ? userRecords : [])
    .map(normalizePromptTemplate)
    .filter((item) => (
      item.id
      && item.prompt
      && item.source !== 'official'
      && !item.readonly
      && !String(item.id).startsWith('official_')
    ));
  const seen = new Set();
  return [...OFFICIAL_PROMPT_TEMPLATES, ...users].filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function duplicateOfficialTemplateDraft(template = {}) {
  return {
    id: '',
    title: `${template.title || '官方模板'} 副本`,
    description: template.description || '',
    prompt: template.prompt || '',
    source: 'user',
    readonly: false,
  };
}
