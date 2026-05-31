import { promptTextOrFallback, stripEnglishPromptFragments } from './designPromptLanguage.js';
import P0_DESIGN_SPACE_EXTRACTION_PROMPT from './prompts/p0DesignSpaceExtraction.md?raw';

function valueOrFallback(value, fallback = '未指定') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function resolveProjectStyle(card, projectStyle) {
  return stripEnglishPromptFragments(projectStyle ?? card?.projectStyle) || '遵循项目整体视觉风格';
}

function mergePromptParts(...values) {
  const parts = [];
  const seen = new Set();
  values.forEach((value) => {
    const text = stripEnglishPromptFragments(value);
    const key = text.replace(/\s+/g, '');
    if (!text || seen.has(key)) return;
    seen.add(key);
    parts.push(text);
  });
  return parts.join('\n');
}

export function buildDesignSpaceExtractionPrompt({
  sourceText = '',
  projectStyle = '',
} = {}) {
  const taskInput = [
    `项目风格参考：${valueOrFallback(projectStyle, '未指定')}`,
    '',
    valueOrFallback(sourceText, ''),
  ].join('\n');
  return P0_DESIGN_SPACE_EXTRACTION_PROMPT.replace('{{在此处粘贴小说原文}}', taskInput);
}

export function buildCharacterTurnaroundPrompt(card = {}, projectStyle) {
  return [
    '生成单张角色三视图设定稿。',
    '同一张画面中清晰呈现同一角色的正面、侧面、背面，比例一致，服装和发型细节统一。',
    `角色名称：${valueOrFallback(card.name)}`,
    `人物提示词：${promptTextOrFallback(card.visualPrompt, card.details)}`,
    `项目风格：${resolveProjectStyle(card, projectStyle)}`,
    '不要额外添加表情、动作、姿势或情绪表演。',
    '全程使用中文提示词，不要加入英文标签、英文摄影术语或中英混写效果词。',
    '干净设定稿背景，写实可信，线条清楚，避免遮挡，适合后续角色资产制作。',
  ].join('\n');
}

export function buildSceneConceptPrompt(card = {}, projectStyle) {
  const visualPrompt = mergePromptParts(card.visualPrompt, card.atmospherePrompt);
  return [
    '生成场景概念图。',
    `场景名称：${valueOrFallback(card.name)}`,
    `场景细节：${promptTextOrFallback(card.details)}`,
    `视觉提示：${visualPrompt || promptTextOrFallback(card.details)}`,
    `项目风格：${resolveProjectStyle(card, projectStyle)}`,
    '强调空间关系、光线、色彩、镜头构图和叙事氛围。',
    '全程使用中文提示词，不要加入英文标签、英文摄影术语或中英混写效果词。',
  ].join('\n');
}

export function buildPropConceptPrompt(card = {}, projectStyle) {
  const visualPrompt = mergePromptParts(card.visualPrompt, card.materialPrompt);
  return [
    '生成道具设定图。',
    `道具名称：${valueOrFallback(card.name)}`,
    `道具细节：${promptTextOrFallback(card.details)}`,
    `视觉提示：${visualPrompt || promptTextOrFallback(card.details)}`,
    `项目风格：${resolveProjectStyle(card, projectStyle)}`,
    '强调材质、结构、尺寸感、磨损痕迹和可识别轮廓。',
    '全程使用中文提示词，不要加入英文标签、英文摄影术语或中英混写效果词。',
  ].join('\n');
}
