export const PROMPT_RUNNER_CATEGORY = 'inference-template';
export const PROMPT_RUNNER_META_KIND = 'canvas-prompt-node';
export const INPUT_PLACEHOLDER = '{{INPUT}}';
export const LEGACY_INPUT_PLACEHOLDER = '{INPUT}';
export const PROMPT_RUNNER_TEMPLATE_IDS = {
  storyboard16x9: 'official_short_drama_storyboard_16_9_v1',
  storyboard9x16: 'official_short_drama_storyboard_9_16_v1',
  novelToScript: 'official_storyboard_novel_to_script_v1',
  extractAssets: 'official_storyboard_extract_assets_v3',
};

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values) {
  const seen = new Set();
  return values.filter((value) => {
    const text = compactString(value);
    if (!text || seen.has(text)) return false;
    seen.add(text);
    return true;
  });
}

function promptInputSyncKeys(value) {
  if (Array.isArray(value)) return value.map((item) => compactString(item)).filter(Boolean);
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, enabled]) => enabled !== false)
      .map(([key]) => compactString(key))
      .filter(Boolean);
  }
  return [];
}

function appendPromptInputText(prompt, text) {
  return [compactString(prompt), compactString(text)].filter(Boolean).join('\n\n');
}

function isPromptGenerationTarget(node) {
  return node?.type === 'image' || node?.type === 'video';
}

function isPromptRunnerNode(node) {
  const type = String(node?.type || '').trim();
  return type === 'prompt-runner' || type === 'prompt.runner';
}

function stripJsonFence(value) {
  const text = compactString(value);
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return compactString(fence ? fence[1] : text);
}

function jsonObjectCandidate(value) {
  const text = stripJsonFence(value);
  if (!text) return '';
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first < 0 || last <= first) return text;
  return text.slice(first, last + 1).trim();
}

function jsonValueCandidate(value) {
  const text = stripJsonFence(value);
  if (!text) return '';
  const objectFirst = text.indexOf('{');
  const arrayFirst = text.indexOf('[');
  const starts = [
    objectFirst >= 0 ? { start: objectFirst, end: text.lastIndexOf('}') } : null,
    arrayFirst >= 0 ? { start: arrayFirst, end: text.lastIndexOf(']') } : null,
  ].filter((item) => item && item.end > item.start);
  if (!starts.length) return text;
  starts.sort((a, b) => a.start - b.start);
  const { start, end } = starts[0];
  return text.slice(start, end + 1).trim();
}

function parseJsonValue(output) {
  const raw = compactString(output);
  if (!raw) {
    return { ok: false, value: null, raw, error: 'JSON 解析失败：模型没有返回内容' };
  }
  const candidate = jsonValueCandidate(raw);
  try {
    let parsed = JSON.parse(candidate);
    if (typeof parsed === 'string') {
      parsed = JSON.parse(jsonValueCandidate(parsed));
    }
    return { ok: true, value: parsed, raw };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || '未知错误');
    return { ok: false, value: null, raw, error: `JSON 解析失败：${message}` };
  }
}

function textValue(value) {
  if (typeof value === 'string') return compactString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join('，');
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, item]) => {
        const text = textValue(item);
        return text ? `${key}：${text}` : '';
      })
      .filter(Boolean)
      .join('；');
  }
  return '';
}

function firstTextFromKeys(source, keys = []) {
  if (!source || typeof source !== 'object') return '';
  for (const key of keys) {
    const text = textValue(source[key]);
    if (text) return text;
  }
  return '';
}

function scriptTextFromScene(scene, index) {
  if (typeof scene === 'string') return compactString(scene);
  if (!scene || typeof scene !== 'object') return '';
  const title = firstTextFromKeys(scene, ['title', 'name', 'scene', '场次']) || `第${index + 1}场`;
  const location = firstTextFromKeys(scene, ['location', 'place', 'setting', '地点']);
  const time = firstTextFromKeys(scene, ['time', 'period', '时间']);
  const description = firstTextFromKeys(scene, ['description', 'desc', 'action', 'visual', '画面', '动作']);
  const dialogue = textValue(scene.dialogue || scene.dialogues || scene.lines || scene.台词);
  return [
    title,
    [location, time].filter(Boolean).join(' / '),
    description,
    dialogue,
  ].filter(Boolean).join('\n');
}

function scriptTextFromJson(data) {
  if (typeof data === 'string') return compactString(data);
  if (Array.isArray(data)) {
    return data.map(scriptTextFromScene).filter(Boolean).join('\n\n');
  }
  if (!data || typeof data !== 'object') return '';
  const direct = firstTextFromKeys(data, [
    'script_text',
    'scriptText',
    'script',
    'script_body',
    'body',
    'content',
    'text',
    'result',
    'output',
    '剧本',
    '剧本文本',
  ]);
  if (direct) return direct.replace(/\r\n/g, '\n');
  const nested = scriptTextFromJson(data.data || data.payload || data.result);
  if (nested) return nested;
  const scenes = data.scenes || data.scriptScenes || data.episodes || data.分场 || data.场景;
  if (Array.isArray(scenes)) return scenes.map(scriptTextFromScene).filter(Boolean).join('\n\n');
  return '';
}

export function parsePromptRunnerVideoPromptOutput(output) {
  const raw = compactString(output);
  if (!raw) {
    return { ok: false, value: '', error: 'JSON 解析失败：模型没有返回内容' };
  }
  const candidate = jsonObjectCandidate(raw);
  try {
    let parsed = JSON.parse(candidate);
    if (typeof parsed === 'string') parsed = JSON.parse(stripJsonFence(parsed));
    const videoPrompt = compactString(parsed?.video_prompt);
    if (!videoPrompt) {
      return { ok: false, value: '', error: 'JSON 解析失败：缺少 video_prompt 字段' };
    }
    return {
      ok: true,
      value: videoPrompt.replace(/\r\n/g, '\n'),
      mode: 'video-prompt',
      raw,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || '未知错误');
    return { ok: false, value: '', error: `JSON 解析失败：${message}` };
  }
}

export function parsePromptRunnerNovelScriptOutput(output) {
  const parsed = parseJsonValue(output);
  if (!parsed.ok) return { ...parsed, value: '', mode: 'novel-script' };
  const script = scriptTextFromJson(parsed.value);
  if (!script) {
    return {
      ok: false,
      value: '',
      mode: 'novel-script',
      raw: parsed.raw,
      error: 'JSON 解析失败：小说转剧本结果缺少 script_text 字段',
    };
  }
  return {
    ok: true,
    value: script,
    mode: 'novel-script',
    data: parsed.value,
    raw: parsed.raw,
  };
}

function arrayFromKeys(source, keys = []) {
  if (!source || typeof source !== 'object') return [];
  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key];
  }
  return [];
}

function assetDisplayName(item, fallback) {
  if (typeof item === 'string') return compactString(item);
  const text = firstTextFromKeys(item, [
    'name',
    'title',
    '角色名',
    '道具名',
    '场景名',
    'scene',
    'label',
  ]);
  return text || fallback;
}

function assetPromptText(item, kind) {
  if (typeof item === 'string') return compactString(item);
  const keys = kind === 'scene'
    ? ['prompt', 'details', 'description', 'desc', 'visualPrompt', 'scenePrompt', 'environment', 'atmosphere', '画面提示词', '场景描述']
    : ['details', 'prompt', 'description', 'desc', 'visualPrompt', 'appearance', 'profile', 'features', '服装', '外观', '视觉描述'];
  return firstTextFromKeys(item, keys);
}

function normalizeAssetItem(item, kind, index) {
  if (!item) return null;
  const fallbackName = kind === 'character'
    ? `角色 ${index + 1}`
    : kind === 'prop'
    ? `道具 ${index + 1}`
    : `场景 ${index + 1}`;
  const name = assetDisplayName(item, fallbackName);
  const prompt = assetPromptText(item, kind) || name;
  if (!name && !prompt) return null;
  const imageCategory = kind === 'character' ? 'person' : kind === 'prop' ? 'prop' : 'scene';
  return {
    key: `${kind}:${index}:${name}`,
    kind,
    assetType: imageCategory,
    imageCategory,
    label: kind === 'character' ? '人物' : kind === 'prop' ? '道具' : '场景',
    name,
    prompt,
    source: item,
  };
}

function normalizeExtractedAssets(data) {
  if (Array.isArray(data)) {
    return data.map((item, index) => normalizeAssetItem(item, 'character', index)).filter(Boolean);
  }
  if (!data || typeof data !== 'object') return [];
  const root = data.data || data.payload || data.result || data;
  const characters = arrayFromKeys(root, ['keyCharacters', 'characters', 'roles', '人物', '角色']);
  const props = arrayFromKeys(root, ['keyProps', 'props', 'items', '道具', '关键道具']);
  const scenes = arrayFromKeys(root, ['sceneAnalysis', 'scenes', 'locations', '场景', '场景分析']);
  return [
    ...characters.map((item, index) => normalizeAssetItem(item, 'character', index)),
    ...props.map((item, index) => normalizeAssetItem(item, 'prop', index)),
    ...scenes.map((item, index) => normalizeAssetItem(item, 'scene', index)),
  ].filter(Boolean);
}

export function parsePromptRunnerAssetExtractionOutput(output) {
  const parsed = parseJsonValue(output);
  if (!parsed.ok) return { ...parsed, value: '', mode: 'asset-extraction', assets: [] };
  const assets = normalizeExtractedAssets(parsed.value);
  if (!assets.length) {
    return {
      ok: false,
      value: '',
      mode: 'asset-extraction',
      assets: [],
      raw: parsed.raw,
      error: 'JSON 解析失败：资产提取结果缺少 keyCharacters、keyProps 或 sceneAnalysis 资产数组',
    };
  }
  return {
    ok: true,
    value: JSON.stringify({
      keyCharacters: assets.filter((item) => item.kind === 'character'),
      keyProps: assets.filter((item) => item.kind === 'prop'),
      sceneAnalysis: assets.filter((item) => item.kind === 'scene'),
    }, null, 2),
    mode: 'asset-extraction',
    assets,
    data: parsed.value,
    raw: parsed.raw,
  };
}

export function parsePromptRunnerRawOutput(output) {
  const raw = compactString(output);
  return {
    ok: true,
    value: raw,
    mode: 'raw',
    raw,
  };
}

export function parsePromptRunnerOutput(output, { templateId } = {}) {
  const id = compactString(templateId);
  if (id === PROMPT_RUNNER_TEMPLATE_IDS.novelToScript) {
    return parsePromptRunnerNovelScriptOutput(output);
  }
  if (id === PROMPT_RUNNER_TEMPLATE_IDS.extractAssets) {
    return parsePromptRunnerAssetExtractionOutput(output);
  }
  if (id === PROMPT_RUNNER_TEMPLATE_IDS.storyboard16x9 || id === PROMPT_RUNNER_TEMPLATE_IDS.storyboard9x16) {
    return parsePromptRunnerVideoPromptOutput(output);
  }
  return parsePromptRunnerRawOutput(output);
}

export function promptRunnerOutputText(node) {
  if (!isPromptRunnerNode(node)) return '';
  if (node.outputMode === 'asset-extraction' || Array.isArray(node.parsedAssets)) return '';
  const parsedOutput = compactString(node.parsedOutput || node.videoPrompt);
  if (parsedOutput) return parsedOutput;
  const rawOutput = compactString(node.output || node.body || node.generatedText);
  if (!rawOutput) return '';
  const parsed = parsePromptRunnerVideoPromptOutput(rawOutput);
  return parsed.ok ? parsed.value : '';
}

export function normalizePromptTemplate(record = {}) {
  const meta = record.meta && typeof record.meta === 'object' ? record.meta : {};
  const source = compactString(meta.source) || compactString(record.source) || 'user';
  const systemPrompt = compactString(meta.systemPrompt);
  const content = compactString(record.content || record.prompt);
  const prompt = [systemPrompt, content].filter(Boolean).join('\n\n');
  return {
    id: compactString(record.id),
    title: compactString(record.title),
    description: compactString(meta.description || record.description),
    prompt,
    source,
    readonly: Boolean(meta.readonly || record.readonly || source === 'official'),
  };
}

export function buildPromptTemplateCreatePayload(template = {}) {
  const description = compactString(template.description);
  return {
    scope: 'global',
    category: PROMPT_RUNNER_CATEGORY,
    title: compactString(template.title),
    content: compactString(template.prompt || template.content),
    tags: Array.isArray(template.tags) ? template.tags : [],
    meta: {
      templateKind: PROMPT_RUNNER_META_KIND,
      description,
      source: 'user',
      readonly: false,
    },
  };
}

export function buildPromptTemplateUpdatePayload(template = {}) {
  const payload = buildPromptTemplateCreatePayload(template);
  delete payload.project_id;
  delete payload.scope;
  return payload;
}

export function mergePromptTemplateInput(userPrompt, input) {
  const prompt = compactString(userPrompt);
  const source = compactString(input);
  if (!prompt) return source;
  if (!source) return prompt;
  if (prompt.includes(INPUT_PLACEHOLDER)) return prompt.replaceAll(INPUT_PLACEHOLDER, source);
  if (prompt.includes(LEGACY_INPUT_PLACEHOLDER)) return prompt.replaceAll(LEGACY_INPUT_PLACEHOLDER, source);
  return `${prompt}\n\n---\n${source}`;
}

function scriptText(node) {
  const shots = Array.isArray(node?.shots) ? node.shots : [];
  return shots
    .map((shot, index) => [
      `${shot?.n || index + 1}.`,
      shot?.shot,
      shot?.desc || shot?.description,
      shot?.dur || shot?.duration,
    ].map(compactString).filter(Boolean).join(' '))
    .filter(Boolean)
    .join('\n');
}

export function promptRunnerNodeText(node) {
  if (!node) return '';
  if (node.type === 'script' || node.type === 'script.storyboard') {
    return scriptText(node) || compactString(node.title);
  }
  if (node.type === 'asset-gen') {
    return compactString(node.finalPrompt || node.prompt || node.title);
  }
  return compactString(node.body || node.output || node.prompt || node.finalPrompt || node.title);
}

export function collectPromptRunnerInput(nodeId, nodes = [], edges = [], manualInput = '') {
  const byId = new Map((nodes || []).map((node) => [node.id, node]));
  const upstream = (edges || [])
    .filter((edge) => edge?.to === nodeId)
    .map((edge) => promptRunnerNodeText(byId.get(edge.from)))
    .filter(Boolean);
  const manual = compactString(manualInput);
  return uniqueStrings([...upstream, manual]).join('\n\n');
}

function promptRunnerPreviewPatch({
  prompt = '',
  model = '',
  generating = true,
  progress = 8,
  error = null,
  tag,
} = {}) {
  const running = generating !== false;
  const patch = {
    title: '提示词结果',
    body: '',
    generating: running,
    progress: running ? Math.max(1, Math.min(99, Number(progress) || 8)) : 0,
    error: running ? null : (error || null),
    tag: tag || (running ? '生成' : '失败'),
  };
  const promptText = compactString(prompt);
  const modelText = compactString(model);
  if (promptText) patch.prompt = promptText;
  if (modelText) patch.model = modelText;
  return patch;
}

export function ensurePromptRunnerPreviewTextGraph({
  nodes = [],
  edges = [],
  sourceNodeId,
  prompt = '',
  model = '',
  makeId,
  generating = true,
  progress = 8,
  error = null,
  tag,
} = {}) {
  const source = (nodes || []).find((node) => node.id === sourceNodeId);
  if (!source) return { nodes, edges, targetId: '', created: false };
  const byId = new Map((nodes || []).map((node) => [node.id, node]));
  const existingEdge = (edges || []).find((edge) => (
    edge?.from === sourceNodeId && byId.get(edge.to)?.type === 'text'
  ));
  const patch = promptRunnerPreviewPatch({ prompt, model, generating, progress, error, tag });
  if (existingEdge) {
    return {
      nodes: (nodes || []).map((node) => (
        node.id === existingEdge.to ? { ...node, ...patch } : node
      )),
      edges,
      targetId: existingEdge.to,
      created: false,
    };
  }
  const hasGenerationTarget = (edges || []).some((edge) => (
    edge?.from === sourceNodeId && isPromptGenerationTarget(byId.get(edge.to))
  ));
  if (hasGenerationTarget) {
    return { nodes, edges, targetId: '', created: false };
  }

  const id = typeof makeId === 'function'
    ? makeId()
    : `promptPreview_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const previewNode = {
    id,
    type: 'text',
    x: (Number(source.x) || 0) + (Number(source.w) || 460) + 96,
    y: Number(source.y) || 0,
    w: 340,
    h: 180,
    ...patch,
  };
  const previewEdge = {
    id: `e_prompt_${sourceNodeId}_${id}`,
    from: sourceNodeId,
    to: id,
  };
  return {
    nodes: [...(nodes || []), previewNode],
    edges: [...(edges || []), previewEdge],
    targetId: id,
    created: true,
  };
}

const PROMPT_RUNNER_ASSET_COLUMN = {
  character: 0,
  scene: 1,
  prop: 2,
};

function promptRunnerAssetNodePatch(asset, sourceNodeId, index, source, layout = {}) {
  const col = Number.isFinite(layout.column) ? layout.column : index % 2;
  const row = Number.isFinite(layout.row) ? layout.row : Math.floor(index / 2);
  const w = 320;
  const h = 300;
  const gapX = 36;
  const gapY = 28;
  const prompt = compactString(asset?.prompt || asset?.name);
  return {
    type: 'image',
    x: (Number(source?.x) || 0) + (Number(source?.w) || 460) + 96 + col * (w + gapX),
    y: (Number(source?.y) || 0) + row * (h + gapY),
    w,
    h,
    title: compactString(asset?.name) || `资产 ${index + 1}`,
    tag: asset?.label || '资产',
    groupLabel: '资产提取',
    prompt,
    promptDraft: prompt,
    body: prompt,
    ratio: '1:1',
    resolution: '2K',
    assetType: asset?.assetType || asset?.imageCategory || 'person',
    imageCategory: asset?.imageCategory || asset?.assetType || 'person',
    extractedAsset: asset,
    sourcePromptRunnerId: sourceNodeId,
    promptRunnerAssetKey: compactString(asset?.key) || `${asset?.kind || 'asset'}:${index}`,
    promptInputSyncKeys: sourceNodeId ? [sourceNodeId] : [],
    autoCreatedByPromptRunner: true,
    generating: false,
    progress: 0,
    error: null,
  };
}

export function ensurePromptRunnerAssetImageGraph({
  nodes = [],
  edges = [],
  sourceNodeId,
  assets = [],
  makeId,
} = {}) {
  const source = (nodes || []).find((node) => node.id === sourceNodeId);
  if (!source) return { nodes, edges, targetIds: [], created: 0 };
  const normalized = (Array.isArray(assets) ? assets : [])
    .map((asset, index) => ({ ...asset, key: compactString(asset?.key) || `${asset?.kind || 'asset'}:${index}` }))
    .filter((asset) => compactString(asset.name || asset.prompt));
  if (!normalized.length) return { nodes, edges, targetIds: [], created: 0 };

  const nextKeys = new Set(normalized.map((asset) => asset.key));
  const staleIds = new Set((nodes || [])
    .filter((node) => (
      node?.sourcePromptRunnerId === sourceNodeId
      && node?.autoCreatedByPromptRunner
      && isPromptGenerationTarget(node)
      && !nextKeys.has(compactString(node.promptRunnerAssetKey))
    ))
    .map((node) => node.id));
  const keptNodes = (nodes || []).filter((node) => !staleIds.has(node.id));
  const keptEdges = (edges || []).filter((edge) => !staleIds.has(edge?.to) && !staleIds.has(edge?.from));
  const existingByKey = new Map(keptNodes
    .filter((node) => node?.sourcePromptRunnerId === sourceNodeId && node?.autoCreatedByPromptRunner)
    .map((node) => [compactString(node.promptRunnerAssetKey), node]));

  let created = 0;
  const targetIds = [];
  const updates = new Map();
  const additions = [];
  const edgeAdditions = [];
  const rowByKind = new Map();
  normalized.forEach((asset, index) => {
    const kind = compactString(asset?.kind) || 'character';
    const column = PROMPT_RUNNER_ASSET_COLUMN[kind] ?? PROMPT_RUNNER_ASSET_COLUMN.character;
    const row = rowByKind.get(kind) || 0;
    rowByKind.set(kind, row + 1);
    const patch = promptRunnerAssetNodePatch(asset, sourceNodeId, index, source, { column, row });
    const existing = existingByKey.get(asset.key);
    if (existing) {
      targetIds.push(existing.id);
      updates.set(existing.id, { ...existing, ...patch, id: existing.id });
      return;
    }
    const id = typeof makeId === 'function'
      ? makeId()
      : `promptAsset_${Date.now().toString(36)}_${index}_${Math.random().toString(36).slice(2, 6)}`;
    targetIds.push(id);
    created += 1;
    additions.push({ id, ...patch });
    edgeAdditions.push({
      id: `e_prompt_asset_${sourceNodeId}_${id}`,
      from: sourceNodeId,
      to: id,
    });
  });

  const updatedNodes = keptNodes.map((node) => updates.get(node.id) || node);
  const existingEdgeKeys = new Set(keptEdges.map((edge) => `${edge?.from || ''}->${edge?.to || ''}`));
  const nextEdges = [
    ...keptEdges,
    ...edgeAdditions.filter((edge) => !existingEdgeKeys.has(`${edge.from}->${edge.to}`)),
  ];
  return {
    nodes: [...updatedNodes, ...additions],
    edges: nextEdges,
    targetIds,
    created,
  };
}

function syncPromptRunnerOutputToTextNode(node, text) {
  const statusPatch = {
    generating: false,
    progress: 0,
    jobId: null,
    error: null,
    jobStage: '',
    tag: '生成',
  };
  const nextTitle = node.title || '提示词结果';
  return { ...node, ...statusPatch, title: nextTitle, body: text };
}

function syncPromptRunnerOutputToGenerationNode(node, sourceNodeId, text) {
  const sourceKey = compactString(sourceNodeId);
  if (!sourceKey || !isPromptGenerationTarget(node)) return node;
  const syncKeys = promptInputSyncKeys(node.promptInputSyncKeys);
  if (syncKeys.includes(sourceKey)) return node;
  const currentPrompt = typeof node.promptDraft === 'string' ? node.promptDraft : node.prompt;
  const nextPrompt = appendPromptInputText(currentPrompt, text);
  if (!nextPrompt) return node;
  return {
    ...node,
    promptDraft: nextPrompt,
    prompt: nextPrompt,
    promptInputSyncKeys: [...syncKeys, sourceKey],
  };
}

export function syncPromptRunnerOutputToTextNodes(nodes = [], edges = [], sourceNodeId, output) {
  const text = compactString(output);
  if (!text) return nodes;
  const targetIds = new Set((edges || [])
    .filter((edge) => edge?.from === sourceNodeId)
    .map((edge) => edge.to));
  if (!targetIds.size) return nodes;
  let changed = false;
  const next = (nodes || []).map((node) => {
    if (!targetIds.has(node.id) || node.type !== 'text') return node;
    const updated = syncPromptRunnerOutputToTextNode(node, text);
    if (updated !== node) changed = true;
    return updated;
  });
  return changed ? next : nodes;
}

export function syncPromptRunnerOutputToDownstreamNodes(nodes = [], edges = [], sourceNodeId, output) {
  const text = compactString(output);
  if (!text) return nodes;
  const targetIds = new Set((edges || [])
    .filter((edge) => edge?.from === sourceNodeId)
    .map((edge) => edge.to));
  if (!targetIds.size) return nodes;
  let changed = false;
  const next = (nodes || []).map((node) => {
    if (!targetIds.has(node.id)) return node;
    const updated = node.type === 'text'
      ? syncPromptRunnerOutputToTextNode(node, text)
      : syncPromptRunnerOutputToGenerationNode(node, sourceNodeId, text);
    if (updated !== node) changed = true;
    return updated;
  });
  return changed ? next : nodes;
}

export function syncPromptRunnerOutputsForGenerationEdges(nodes = [], edges = []) {
  if (!Array.isArray(nodes) || !nodes.length || !Array.isArray(edges) || !edges.length) return nodes;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  let next = nodes;
  let changed = false;
  edges.forEach((edge) => {
    const source = byId.get(edge?.from);
    const target = byId.get(edge?.to);
    if (!isPromptRunnerNode(source) || !isPromptGenerationTarget(target)) return;
    const text = promptRunnerOutputText(source);
    if (!text) return;
    const updated = syncPromptRunnerOutputToDownstreamNodes(next, [edge], source.id, text);
    if (updated !== next) {
      next = updated;
      changed = true;
    }
  });
  return changed ? next : nodes;
}
