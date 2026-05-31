/* Storyboard prompt assembly — pure utilities (no React, no I/O).
 *
 * `buildFillDescPrompt` takes the user-editable template (loaded from PromptStore)
 * and the current shot's context, returns { user, system } strings ready to send.
 */

import { DIRECTOR_BIBLE_V1 } from './directorBible.js';

const STRATEGIC_GUIDE_PROMPT_JSON_LIMIT = 240_000;
const STRATEGIC_GUIDE_MAX_ITEMS = 40;
const STRATEGIC_GUIDE_TEXT_LIMIT = 2_000;
const STRATEGIC_GUIDE_SHORT_TEXT_LIMIT = 480;

const STRATEGIC_GUIDE_ARRAY_KEYS = [
  'keyCharacters',
  'keyProps',
  'sceneAnalysis',
  'sourceAssets',
  'referenceAssets',
  'textReferences',
];

const STRATEGIC_GUIDE_TEXT_KEYS = [
  'title',
  'name',
  'style',
  'styleGuide',
  'projectStyle',
  'visualStyle',
  'worldSetting',
  'tone',
  'theme',
  'summary',
  'directorAnalysis',
];

const GUIDE_ITEM_TEXT_KEYS = new Set([
  'id',
  'assetId',
  'type',
  'kind',
  'category',
  'name',
  'title',
  'label',
  'role',
  'gender',
  'age',
  'personality',
  'details',
  'description',
  'summary',
  'analysis',
  'referenceIntent',
  'prompt',
  'promptFragment',
  'visualPrompt',
  'stylePrompt',
  'appearance',
  'costume',
  'clothing',
  'hair',
  'face',
  'body',
  'signature',
  'relationship',
  'relationships',
  'motivation',
  'conflict',
  'arc',
  'scene',
  'sceneRef',
  'time',
  'timeOfDay',
  'location',
  'space',
  'weather',
  'lighting',
  'atmosphere',
  'mood',
  'tone',
  'color',
  'composition',
  'camera',
  'action',
  'note',
  'notes',
  'text',
  'content',
  'tags',
  'traits',
  'aliases',
]);

const GUIDE_HEAVY_KEY_RE = /^(url|src|href|path|assetPath|assetUrl|asset_url|localPath|filePath|thumb|thumbnail|preview|poster|blob|data|buffer|bytes|b64_json|base64|image|images|video|videos|audio|audios|media|file|files|history|histories|job|jobs|raw|response|request|payload|input|output|outputs|result|results|error|lastError|stack)$/i;

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

function looksLikeEmbeddedMedia(text) {
  const value = String(text || '').trim();
  if (!value) return false;
  if (/^data:[^,]+;base64,/i.test(value)) return true;
  if (/^(blob:|file:|libai-asset:|local-asset:)/i.test(value)) return true;
  if (value.length > 12_000 && /^[A-Za-z0-9+/=\s]+$/.test(value)) return true;
  return false;
}

function trimText(value, limit = STRATEGIC_GUIDE_TEXT_LIMIT) {
  const text = String(value ?? '').trim();
  if (!text || looksLikeEmbeddedMedia(text)) return '';
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 12)).trimEnd()}...`;
}

function sanitizePrimitiveArray(value, limit = STRATEGIC_GUIDE_SHORT_TEXT_LIMIT) {
  return value
    .slice(0, 24)
    .map((item) => {
      if (typeof item === 'number' || typeof item === 'boolean') return item;
      if (typeof item === 'string') return trimText(item, limit);
      return '';
    })
    .filter((item) => item !== '');
}

function sanitizeGuideObject(value, { depth = 0, textLimit = STRATEGIC_GUIDE_TEXT_LIMIT } = {}) {
  if (!isPlainObject(value) || depth > 2) return undefined;
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    if (GUIDE_HEAVY_KEY_RE.test(key)) continue;
    if (!GUIDE_ITEM_TEXT_KEYS.has(key) && depth > 0) continue;

    if (typeof raw === 'string') {
      const text = trimText(raw, key === 'id' || key === 'assetId' ? 160 : textLimit);
      if (text) out[key] = text;
      continue;
    }
    if (typeof raw === 'number' || typeof raw === 'boolean') {
      out[key] = raw;
      continue;
    }
    if (Array.isArray(raw)) {
      const primitiveItems = sanitizePrimitiveArray(raw, STRATEGIC_GUIDE_SHORT_TEXT_LIMIT);
      if (primitiveItems.length) out[key] = primitiveItems;
      continue;
    }
    if (isPlainObject(raw)) {
      const nested = sanitizeGuideObject(raw, { depth: depth + 1, textLimit: STRATEGIC_GUIDE_SHORT_TEXT_LIMIT });
      if (nested && Object.keys(nested).length) out[key] = nested;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

function sanitizeGuideList(list) {
  if (!Array.isArray(list)) return undefined;
  const items = list
    .slice(0, STRATEGIC_GUIDE_MAX_ITEMS)
    .map((item) => {
      if (typeof item === 'string') {
        const text = trimText(item);
        return text ? { text } : null;
      }
      return sanitizeGuideObject(item);
    })
    .filter(Boolean);
  return items.length ? items : [];
}

function compactGuideItem(item, stringLimit) {
  if (!isPlainObject(item)) return item;
  const keepKeys = [
    'id',
    'assetId',
    'name',
    'title',
    'role',
    'type',
    'kind',
    'personality',
    'details',
    'description',
    'summary',
    'analysis',
    'prompt',
    'visualPrompt',
    'referenceIntent',
    'scene',
    'timeOfDay',
    'location',
    'tags',
  ];
  const out = {};
  for (const key of keepKeys) {
    if (!hasOwn(item, key)) continue;
    const raw = item[key];
    if (typeof raw === 'string') {
      const text = trimText(raw, stringLimit);
      if (text) out[key] = text;
    } else if (Array.isArray(raw)) {
      const arr = sanitizePrimitiveArray(raw, Math.min(160, stringLimit));
      if (arr.length) out[key] = arr.slice(0, 12);
    } else if (typeof raw === 'number' || typeof raw === 'boolean') {
      out[key] = raw;
    }
  }
  return out;
}

function compactGuideToLimit(guide, limit = STRATEGIC_GUIDE_PROMPT_JSON_LIMIT) {
  let json = JSON.stringify(guide);
  if (json.length <= limit) return guide;

  const compact = {};
  for (const [key, value] of Object.entries(guide || {})) {
    if (Array.isArray(value)) {
      compact[key] = value.slice(0, 24).map((item) => compactGuideItem(item, 700)).filter((item) => (
        isPlainObject(item) ? Object.keys(item).length > 0 : Boolean(item)
      ));
    } else if (typeof value === 'string') {
      compact[key] = trimText(value, 700);
    } else if (isPlainObject(value)) {
      compact[key] = sanitizeGuideObject(value, { textLimit: 700 });
    }
  }
  json = JSON.stringify(compact);
  if (json.length <= limit) return compact;

  const strict = {};
  for (const [key, value] of Object.entries(compact)) {
    if (Array.isArray(value)) {
      strict[key] = value.slice(0, 12).map((item) => compactGuideItem(item, 320)).filter((item) => (
        isPlainObject(item) ? Object.keys(item).length > 0 : Boolean(item)
      ));
    } else if (typeof value === 'string') {
      strict[key] = trimText(value, 320);
    }
  }
  return strict;
}

/* Strategic guide data can contain design-space assets, generated results,
 * local paths, thumbnails, and even base64 media. Shot grouping only needs
 * the text bible, so the model request is built from a text-only projection. */
export function sanitizeStrategicGuideForPrompt(guide = {}) {
  if (!isPlainObject(guide)) return {};
  const out = {};

  for (const key of STRATEGIC_GUIDE_ARRAY_KEYS) {
    if (!hasOwn(guide, key)) continue;
    const list = sanitizeGuideList(guide[key]);
    if (list) out[key] = list;
  }

  for (const key of STRATEGIC_GUIDE_TEXT_KEYS) {
    if (!hasOwn(guide, key)) continue;
    const value = guide[key];
    if (typeof value === 'string') {
      const text = trimText(value);
      if (text) out[key] = text;
    } else if (isPlainObject(value)) {
      const nested = sanitizeGuideObject(value);
      if (nested) out[key] = nested;
    }
  }

  return compactGuideToLimit(out);
}

/* Replace {{var}} placeholders with values. Missing values become empty string. */
export function fillTemplate(template, vars) {
  if (!template) return '';
  return String(template).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars?.[key];
    if (value == null) return '';
    return String(value);
  });
}

/* Render a template with placeholder substitution, OR — if the template
 * contains NONE of the expected placeholders — append the primary user input
 * as a labelled appendix at the end. This keeps the prompts robust whether
 * the user supplies a templated prompt (with {{novel_text}} etc.) or a
 * placeholderless rule book that expects the input to be appended verbatim. */
export function renderPromptWithInputAppendix(template, vars, appendixSpec) {
  const tpl = String(template || '');
  const expectedPlaceholders = appendixSpec?.placeholders || [];
  const hasAnyPlaceholder = expectedPlaceholders.some((p) => tpl.includes(`{{${p}}}`));
  if (hasAnyPlaceholder) {
    return fillTemplate(tpl, vars);
  }
  /* No placeholder — append user input verbatim under a labelled section. */
  const sections = appendixSpec?.appendix || [];
  const blocks = sections
    .map(({ label, value }) => {
      const text = (value == null ? '' : String(value)).trim();
      if (!text) return '';
      return `${label}\n${text}`;
    })
    .filter(Boolean);
  if (!blocks.length) return tpl;
  return `${tpl.trimEnd()}\n\n---\n\n${blocks.join('\n\n---\n\n')}\n`;
}

const SCRIPT_TO_SHOTGROUPS_INPUT_MARKER_RE = /\{\{在此处粘贴\s+STRATEGIC_GUIDE_JSON\s+和\s+CURRENT_CHUNK\}\}/;
const SCRIPT_TO_SHOTGROUPS_INPUT_MARKER_RE_GLOBAL = /\{\{在此处粘贴\s+STRATEGIC_GUIDE_JSON\s+和\s+CURRENT_CHUNK\}\}/g;

function buildScriptToShotGroupsInputBlock({ guideJson, chunk, targetDuration }) {
  return [
    { label: '【目标时长】', value: `${targetDuration}秒` },
    { label: '【战略指引 JSON】', value: guideJson },
    { label: '【当前剧本片段】', value: chunk },
  ]
    .map(({ label, value }) => {
      const text = (value == null ? '' : String(value)).trim();
      return text ? `${label}\n${text}` : '';
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}

function renderScriptToShotGroupsTemplate(template, { guideJson, chunk, targetDuration }) {
  const tpl = String(template || '');
  if (!SCRIPT_TO_SHOTGROUPS_INPUT_MARKER_RE.test(tpl)) {
    return renderPromptWithInputAppendix(
      tpl,
      { STRATEGIC_GUIDE_JSON: guideJson, CURRENT_CHUNK: chunk, TARGET_DURATION: targetDuration },
      {
        placeholders: ['STRATEGIC_GUIDE_JSON', 'CURRENT_CHUNK', 'TARGET_DURATION'],
        appendix: [
          { label: '【目标时长】', value: `${targetDuration}秒` },
          { label: '【战略指引 JSON】', value: guideJson },
          { label: '【当前剧本片段】', value: chunk },
        ],
      },
    );
  }

  const inputBlock = buildScriptToShotGroupsInputBlock({ guideJson, chunk, targetDuration });
  return tpl
    .replace(/\{\{TARGET_DURATION\}\}/g, String(targetDuration))
    .replace(/\{\{STRATEGIC_GUIDE_JSON\}\}/g, 'STRATEGIC_GUIDE_JSON')
    .replace(/\{\{CURRENT_CHUNK\}\}/g, 'CURRENT_CHUNK')
    .replace(SCRIPT_TO_SHOTGROUPS_INPUT_MARKER_RE_GLOBAL, inputBlock);
}

/* Build the LLM prompt for "fill shot description" action.
 *
 * Inputs:
 *   template     — content from PromptStore (or null → uses inline fallback)
 *   shots        — full normalized shots array (for prev/next context)
 *   shotIndex    — which shot to fill
 *   ctx = {
 *     style: string,           // global style hint (e.g. '电影胶片质感')
 *     characters: Character[], // optional, can be empty
 *     scene: Scene | null,     // optional
 *   }
 *
 * Returns:
 *   { user_prompt: string, system_prompt: string | undefined }
 */
export function buildFillDescPrompt(template, shots, shotIndex, ctx = {}) {
  const shot = shots[shotIndex];
  if (!shot) return { user_prompt: '', system_prompt: undefined };

  const prevShot = shots[shotIndex - 1];
  const nextShot = shots[shotIndex + 1];

  const characterText = (ctx.characters || []).length === 0
    ? '未指定（自由发挥）'
    : ctx.characters.map((c) => c.name + (c.promptFragment ? `（${c.promptFragment}）` : '')).join('、');

  const sceneName = ctx.scene?.name || '未指定';
  const sceneDescription = ctx.scene?.promptFragment || ctx.scene?.description || '';

  const vars = {
    style: ctx.style || '默认（电影叙事感）',
    scene_name: sceneName,
    scene_description: sceneDescription,
    characters: characterText,
    shot_type: shot.shot || '中景',
    duration: shot.dur || '3s',
    prev_shot: prevShot ? `${prevShot.shot} · ${prevShot.desc || '无描述'}` : '本场首镜',
    next_shot: nextShot ? `${nextShot.shot} · ${nextShot.desc || '无描述'}` : '本场末镜',
  };

  const text = fillTemplate(template || INLINE_FALLBACK_TEMPLATE, vars);
  return { user_prompt: text, system_prompt: undefined };
}

/* Used when the PromptStore lookup hasn't completed yet (or running outside Electron).
 * Mirrors the seeded builtin so behavior degrades gracefully. */
const INLINE_FALLBACK_TEMPLATE = [
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
].join('\n');

// ─── scriptToShots 主 prompt 构造 ─────────────────────────────────

/* Build the LLM prompt for "script → shots" creation
 * (剧本拆分镜，一次性 JSON 输出).
 *
 * Inputs:
 *   template — content from PromptStore (or null → uses inline fallback)
 *   ctx = {
 *     story_text:  string,    // 用户的剧情文本
 *     shot_count:  number,    // 期望分镜数
 *     style?:      string,    // 审美调性（缺省"电影叙事感"）
 *   }
 *
 * Returns:
 *   { user_prompt: string, system_prompt: string | undefined }
 */
export function buildScriptToShotsPrompt(template, ctx = {}) {
  const safeCtx = ctx || {};
  const vars = {
    style: safeCtx.style || '电影叙事感',
    story_text: safeCtx.story_text || '',
    shot_count: safeCtx.shot_count || 8,
    director_bible: DIRECTOR_BIBLE_V1,
  };
  const tpl = template || SCRIPT_TO_SHOTS_V2_TEMPLATE;
  return {
    user_prompt: fillTemplate(tpl, vars),
    system_prompt: undefined,
  };
}

export const SCRIPT_TO_SHOTS_V2_TEMPLATE = [
  '<role>',
  '你是一位精通多种媒介形态的华语分镜导演。',
  '你已内化下方 director_bible 的全部创作宪法，并据此生成专业级分镜。',
  '</role>',
  '',
  '<task>',
  '将剧情文本拆分为 {{shot_count}} 个分镜，镜头之间有节奏起伏与视觉逻辑。',
  '</task>',
  '',
  '<context>',
  '<style>{{style}}</style>',
  '<shot_count>{{shot_count}}</shot_count>',
  '<story>',
  '{{story_text}}',
  '</story>',
  '</context>',
  '',
  '{{director_bible}}',
  '',
  '<reasoning_steps>',
  '在内部按以下顺序思考（**思考过程不要输出**，只输出最终 JSON）：',
  '1. 叙事拆解：识别剧情情绪曲线、关键转折点、可视化机会。',
  '2. 节拍分配：按 director_bible 的通用 5 节拍模型分配 {{shot_count}} 个分镜。',
  '3. 镜头语言选型：每个分镜按 director_bible 选择 景别+角度+运镜，遵守 180°/30° 规则。',
  '4. 光色规划：选定整体调性（高调/低调）和时间段。',
  '5. 视觉母题植入：选 1-2 个母题，至少在 2 个分镜中出现。',
  '6. 描述生成：每条 desc 通过 can-camera-film-it 测试 + 调动 ≥2 种感官 + 用具体描述代替泛指。',
  '7. 自检：数组长度 = {{shot_count}}？景别分布合理？同角色一致？母题出现 ≥2 次？',
  '</reasoning_steps>',
  '',
  '<output_schema>',
  '严格输出一个 JSON 数组，长度恰好 {{shot_count}}，每项结构：',
  '{',
  '  "shot": "景别（远景|全景|中景|近景|特写|大特写|俯拍|仰拍|跟拍|过肩）",',
  '  "desc": "30-80 字可执行画面描述，含【人物动作】+【镜头视角】+【环境/光线】",',
  '  "dur": "时长 1s-6s（快剪 1-2s，叙事 3-4s，铺陈 5-6s）"',
  '}',
  '</output_schema>',
  '',
  '<example>',
  '输入示例：',
  '<style>克制叙事</style>',
  '<shot_count>3</shot_count>',
  '<story>清晨地铁，林夏发现一封旧信，拆开，瞳孔轻微收缩。</story>',
  '',
  '输出示例（仅做格式参考，不要复用其内容）：',
  '[',
  '  {"shot":"全景","desc":"清晨地铁车厢内，逆光从窗外打进，林夏靠门站立，背包压肩，乘客稀疏","dur":"4s"},',
  '  {"shot":"近景","desc":"她低头看手中泛黄信封，手指在封口处停顿，环境噪点压低","dur":"3s"},',
  '  {"shot":"大特写","desc":"瞳孔轻微收缩，眼底反射窗外掠过的光斑，背景虚化成色块","dur":"2s"}',
  ']',
  '</example>',
  '',
  '<rules>',
  '- 严格输出 JSON 数组，不要任何前后文字、不要 markdown、不要 ```json``` 包裹。',
  '- 长度必须恰好 {{shot_count}}。',
  '- desc 不要出现"主角""某人"等泛指词，要用具体描述（"红衣少女""戴眼镜的男人"）。',
  '- desc 不要出现意识流文学化表达（"她的心如同潮汐般翻涌"），改成可视的（"她攥紧拳头，呼吸加速"）。',
  '- shot 字段必须从给定枚举中选，不要发明新景别。',
  '- dur 字段格式严格 "数字+s"。',
  '</rules>',
].join('\n');

// ─── Phase 2A: 工作台 prompt 装配函数 ────────────────────────────

/* Build the LLM prompt for "novel → standardized script" preprocessing.
 *
 * Inputs:
 *   template — full prompt content from PromptStore (novelToScript.v1)
 *   ctx = {
 *     novelText:      string,    // 用户粘贴的散文小说
 *     episodeNumber?: number,    // 起始集数，默认 1
 *   }
 */
export function buildNovelToScriptPrompt(template, ctx = {}) {
  const safeCtx = ctx || {};
  const novelText = safeCtx.novelText || '';
  const episodeNumber = safeCtx.episodeNumber || 1;
  const user_prompt = renderPromptWithInputAppendix(
    template,
    { novel_text: novelText, episode_number: episodeNumber },
    {
      placeholders: ['novel_text', 'episode_number'],
      appendix: [
        { label: '【起始集数】', value: `第${episodeNumber}集` },
        { label: '【小说原文】', value: novelText },
      ],
    },
  );
  return { user_prompt, system_prompt: undefined };
}

/* Build the LLM prompt for "any-format script → standardized script" preprocessing. */
export function buildScriptFormatterPrompt(template, ctx = {}) {
  const safeCtx = ctx || {};
  const rawScript = safeCtx.rawScript || '';
  const episodeNumber = safeCtx.episodeNumber || 1;
  const user_prompt = renderPromptWithInputAppendix(
    template,
    { raw_script: rawScript, episode_number: episodeNumber },
    {
      placeholders: ['raw_script', 'episode_number'],
      appendix: [
        { label: '【起始集数】', value: `第${episodeNumber}集` },
        { label: '【待规范化的剧本原文】', value: rawScript },
      ],
    },
  );
  return { user_prompt, system_prompt: undefined };
}

/* Build the LLM prompt for extracting keyCharacters / keyProps / sceneAnalysis. */
export function buildAssetExtractionPrompt(template, ctx = {}) {
  const safeCtx = ctx || {};
  const scriptText = safeCtx.scriptText || '';
  const user_prompt = renderPromptWithInputAppendix(
    template,
    { script_text: scriptText },
    {
      placeholders: ['script_text', 'SCRIPT_TEXT'],
      appendix: [
        { label: '【标准格式剧本】', value: scriptText },
      ],
    },
  );
  return { user_prompt, system_prompt: undefined };
}

/* Build the LLM prompt for "standardized script + strategic guide → shotGroups[]" (v3).
 *
 * Inputs:
 *   template — content from scriptToShotGroups.v3.{15s|8s} (caller decides which to load)
 *   ctx = {
 *     strategicGuide?: { keyCharacters[], keyProps[], sceneAnalysis[] }, // serialized as JSON
 *     currentChunk:    string,    // 标准格式剧本片段
 *   }
 */
export function buildScriptToShotGroupsPrompt(template, ctx = {}) {
  const safeCtx = ctx || {};
  const guide = sanitizeStrategicGuideForPrompt(safeCtx.strategicGuide || {});
  const guideJson = JSON.stringify(guide);
  const chunk = safeCtx.currentChunk || '';
  const targetDuration = safeCtx.targetDuration || 15;
  const user_prompt = renderScriptToShotGroupsTemplate(template, { guideJson, chunk, targetDuration });
  return { user_prompt, system_prompt: undefined };
}

/* Build the LLM prompt for reference material analysis.
 *
 * Inputs:
 *   template — content from PromptStore (referenceAnalyze.v1)
 *   ctx = {
 *     scriptTitle?:     string,
 *     scriptExcerpt?:   string,
 *     sourceAssets?:    Array,
 *     textCandidates?:  Object,
 *   }
 */
export function buildReferenceAnalysisPrompt(template, ctx = {}) {
  const safeCtx = ctx || {};
  const sourceAssetsJson = JSON.stringify(safeCtx.sourceAssets || []);
  const textCandidatesJson = JSON.stringify(safeCtx.textCandidates || {});
  const vars = {
    script_title: safeCtx.scriptTitle || safeCtx.script_title || '',
    script_excerpt: safeCtx.scriptExcerpt || safeCtx.script_excerpt || '',
    source_assets_json: sourceAssetsJson,
    text_candidates_json: textCandidatesJson,
  };
  const user_prompt = renderPromptWithInputAppendix(
    template,
    vars,
    {
      placeholders: ['script_title', 'script_excerpt', 'source_assets_json', 'text_candidates_json'],
      appendix: [
        { label: '【剧本标题】', value: vars.script_title },
        { label: '【剧本片段】', value: vars.script_excerpt },
        { label: '【参考素材 JSON】', value: sourceAssetsJson },
        { label: '【文本提取候选 JSON】', value: textCandidatesJson },
      ],
    },
  );
  return { user_prompt, system_prompt: undefined };
}
