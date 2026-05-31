function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function compactLines(values) {
  return values.map(compactString).filter(Boolean);
}

function safeJson(value) {
  if (!value) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function shotText(node) {
  const shots = Array.isArray(node?.shots) ? node.shots : [];
  return shots
    .map((shot, index) => compactLines([
      `${shot.n || index + 1}.`,
      shot.shot,
      shot.desc || shot.description,
      shot.dur || shot.duration,
    ]).join(' '))
    .filter(Boolean)
    .join('\n');
}

function mediaTypeLabel(node) {
  return node?.type === 'video' ? '视频' : '图片';
}

function mediaPolishInstructions(node) {
  if (node?.type === 'video') {
    return [
      '你是一名AI视频生成提示词导演。',
      '请将用户当前视频节点的提示词润色为更清晰、具体、可直接用于AI视频生成的中文提示词。',
      '标准化目标: 把散乱描述整理成一段完整的视频镜头提示词。',
      '视频提示词必须优先交代: 画面主体、主体动作、场景环境、镜头运动、时间顺序、动作节奏、光线与色彩、风格质感、画幅比例、时长和音频要求。',
      '如果原始内容只有静态画面描述，可以补足合理的镜头推进、运动方向或动作变化，但不要添加无关人物或情节。',
      '保留原意，保留已有 @素材/@标签 的引用语义。',
      '不要写成静态图片提示词，不要输出镜头运动分解清单。',
      '只输出润色后的中文提示词本身，不要解释、不要标题、不要 Markdown。',
    ].join('\n');
  }

  return [
    '你是一名AI图片生成提示词导演。',
    '请将用户当前图片节点的提示词润色为更清晰、具体、可直接用于AI图片生成的中文提示词。',
    '标准化目标: 把散乱描述整理成一段完整的静态画面提示词。',
    '图片提示词必须优先交代: 画面主体、场景环境、构图与景别、姿态/表情/关键物件、光线与色彩、风格质感、细节质量、画幅比例。',
    '不要添加时间线、转场、连续动作变化等视频要素。',
    '保留原意，保留已有 @素材/@标签 的引用语义。',
    '不要输出镜头运动分解，不要写成视频分镜。',
    '只输出润色后的中文提示词本身，不要解释、不要标题、不要 Markdown。',
  ].join('\n');
}

function referenceToken(asset) {
  return compactString(asset?.token || asset?.promptToken || asset?.tag || asset?.title || asset?.id);
}

function referenceLine(asset, index) {
  const kind = compactString(asset?.kind || asset?.mediaKind || asset?.type || '素材');
  const title = compactString(asset?.title || asset?.name || asset?.label || `参考素材${index + 1}`);
  const token = referenceToken(asset);
  return compactLines([`${index + 1}.`, title, kind ? `(${kind})` : '', token]).join(' ');
}

function focusTagLines(analysis) {
  const tags = Array.isArray(analysis?.tags) ? analysis.tags : [];
  return tags
    .map((tag, index) => compactLines([
      `${index + 1}.`,
      tag.label || tag.name,
      tag.promptToken || tag.tag,
      tag.kind ? `(${tag.kind})` : '',
    ]).join(' '))
    .filter(Boolean);
}

function nodeSummary(node, index) {
  if (!node) return '';
  const text = mediaPromptPolishSourceText(node) || compactString(node.title);
  return compactLines([
    `${index + 1}.`,
    node.title || node.id,
    node.type ? `(${node.type})` : '',
    text ? `- ${text}` : '',
  ]).join(' ');
}

export function isMediaPromptPolishNode(node) {
  return node?.type === 'image' || node?.type === 'video';
}

export function mediaPromptPolishSourceText(node) {
  if (!node) return '';
  return compactString(node.promptDraft)
    || compactString(node.prompt)
    || compactString(node.body)
    || compactString(shotText(node));
}

export function buildMediaPromptPolishPrompt({
  node,
  sourceText,
  upstreamNodes = [],
  referenceAssets,
} = {}) {
  const typeLabel = mediaTypeLabel(node);
  const originalPrompt = compactString(sourceText) || mediaPromptPolishSourceText(node);
  const references = Array.isArray(referenceAssets)
    ? referenceAssets
    : (Array.isArray(node?.referenceAssets) ? node.referenceAssets : []);
  const focusTags = focusTagLines(node?.focusAnalysis);
  const upstreamLines = (Array.isArray(upstreamNodes) ? upstreamNodes : []).map(nodeSummary).filter(Boolean);

  const metadata = compactLines([
    `节点类型: ${typeLabel}`,
    node?.title ? `节点标题: ${node.title}` : '',
    node?.ratio ? `比例: ${node.ratio}` : '',
    node?.resolution ? `分辨率: ${node.resolution}` : '',
    node?.type === 'video' && (node.durationSeconds || node.duration) ? `时长: ${node.durationSeconds || node.duration}秒` : '',
    node?.type === 'video' ? `音频: ${node.audioOn === false ? '关' : '开'}` : '',
  ]);

  const sections = [
    `任务: ${typeLabel}生成提示词润色`,
    mediaPolishInstructions(node),
    metadata.length ? `节点上下文:\n${metadata.join('\n')}` : '',
    references.length ? `引用素材:\n${references.map(referenceLine).join('\n')}` : '',
    focusTags.length ? `视觉分析标签:\n${focusTags.join('\n')}` : '',
    upstreamLines.length ? `上游连接节点:\n${upstreamLines.join('\n')}` : '',
    node?.focusAnalysis && !focusTags.length ? `视觉分析数据:\n${safeJson(node.focusAnalysis)}` : '',
    originalPrompt
      ? `原始提示词:\n${originalPrompt}`
      : `原始提示词:\n当前节点没有可用提示词。请基于节点标题、引用素材和视觉分析标签生成一条可直接用于AI${typeLabel}生成的提示词。`,
  ].filter(Boolean);

  return sections.join('\n\n');
}

export function buildMediaPromptPolishPatch({ textOutput, fallbackPrompt, modelLabel } = {}) {
  const polished = compactString(textOutput) || compactString(fallbackPrompt);
  const patch = {
    prompt: polished,
    promptDraft: polished,
    tag: '润色',
  };
  const cleanModel = compactString(modelLabel);
  if (cleanModel) patch.promptPolishModel = cleanModel;
  return patch;
}
