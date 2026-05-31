import { getBackendBaseUrl } from '../../shared/platform/backendClient.js';

function backendBaseUrl() {
  return getBackendBaseUrl();
}

export const fallbackDesignPromptTemplates = [
  {
    id: 'expression',
    name: '表情包',
    sourcePath: '',
    content: '生成 3x3 照片网格。在所有面板中完整保留角色的面部、发型和服装；每个网格都是角色头像正视图；服装、脸型和发型保持一致；姿势和表情各不相同。',
  },
  {
    id: 'three-view',
    name: '三视图',
    sourcePath: '',
    content: '参考当前角色设定，制作同一角色的三视图，正面、侧面、背面平行排开，画幅16:9。注意输出是一张完整三视图图片。',
  },
  {
    id: 'character-split',
    name: '角色拆分',
    sourcePath: '',
    content: '横图，白色背景，创作角色设计图。分解服装、饰品、表情、全身图和局部放大细节，用中文标注，保持角色脸型、发色、身材和画风一致。',
  },
  {
    id: 'color-card',
    name: '线稿色卡',
    sourcePath: '',
    content: '生成清晰线稿与色卡。提取角色主要配色，色块约6-12色，每个颜色标注HEX或RGB数值，准确反映整体色彩风格。',
  },
  {
    id: 'design-split',
    name: '角色设计拆分',
    sourcePath: '',
    content: '生成专业级角色三视图及细节设定图。包含全身三视图、服装结构、材质特写、配饰、表情与色彩说明，风格与当前角色设定一致。',
  },
  {
    id: 'super-split',
    name: '超级拆分',
    sourcePath: '',
    content: '生成全景式角色深度概念分解图。中心放置角色全身立绘，周围展示服装分层、不同表情、核心道具、材质特写和随身物品展示。',
  },
];

export function labelFromTemplateFilename(filename = '') {
  const stem = String(filename || '').trim().replace(/\.md$/i, '');
  return stem.replace(/^\d+[-_ ]*/, '').trim() || stem || '模板';
}

export function parseMarkdownPromptTemplate(markdown = '') {
  const text = String(markdown ?? '').replace(/^\uFEFF/, '').trim();
  if (!text) return '';

  const fenced = text.match(/```(?:text|txt|prompt)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  return text
    .split(/\r?\n/)
    .filter((line, index) => !(index === 0 && line.trim().startsWith('# ')))
    .filter((line) => !line.trim().startsWith('来源：'))
    .join('\n')
    .trim();
}

function normalizeTemplate(template, index) {
  const name = String(template?.name || labelFromTemplateFilename(template?.filename) || `模板${index + 1}`).trim();
  const content = String(template?.content || '').trim();
  if (!name || !content) return null;

  return {
    id: String(template?.id || name).trim(),
    name,
    sourcePath: String(template?.sourcePath || ''),
    content,
  };
}

export async function loadDesignPromptTemplates() {
  try {
    const response = await fetch(`${backendBaseUrl()}/design-space/prompt-templates`);
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(payload?.detail || `HTTP ${response.status}`);

    const templates = (Array.isArray(payload.templates) ? payload.templates : [])
      .map(normalizeTemplate)
      .filter(Boolean);

    return {
      templates: templates.length > 0 ? templates : fallbackDesignPromptTemplates,
      usingFallback: Boolean(payload.usingFallback) || templates.length === 0,
      error: String(payload.error || ''),
    };
  } catch (error) {
    return {
      templates: fallbackDesignPromptTemplates,
      usingFallback: true,
      error: error instanceof Error ? error.message : String(error || '模板读取失败'),
    };
  }
}
