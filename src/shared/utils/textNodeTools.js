export const TEXT_NODE_MODEL_CAPABILITIES = [
  'text.reason',
  'inference.generate',
  'text.generate',
];

const TOOL_META = {
  textcont: {
    title: 'AI续写',
    task: [
      '在不破坏原文事实、人物关系和叙事风格的前提下续写。',
      '输出完整正文: 前半部分保留原文的核心表达，后半部分自然追加新内容。',
      '续写必须有明确的戏剧推进、情绪递进和可拍摄的动作细节。',
    ],
  },
  textrewrite: {
    title: '重写',
    task: [
      '在保留核心信息、人物关系、业务目标和事实边界的前提下重写。',
      '提升结构、表达密度、镜头感和商业传播效率。',
      '输出重写后的完整正文，不输出修改说明。',
    ],
  },
  textpolish: {
    title: '润色',
    task: [
      '对原文进行商业交付级润色，不改变核心事实与意图。',
      '强化语言质感、节奏、情绪递进、画面信息和可执行表达。',
      '输出润色后的完整正文，可直接进入影视、短剧、广告或内容生产流程。',
    ],
  },
  genshots: {
    title: '分镜推理',
    task: [
      '把文本拆解为可执行分镜，先判断叙事重点，再规划镜头顺序。',
      '每个分镜必须包含景别、画面动作、镜头运动、时长建议和声音/氛围提示。',
      '输出紧凑的分镜清单，不输出泛泛的创作建议。',
    ],
  },
};

function compactText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeKind(kind) {
  return TOOL_META[kind] ? kind : 'textpolish';
}

export function buildTextNodeToolPrompt({ kind, sourceText, upstreamContext = '', node = null } = {}) {
  const toolKind = normalizeKind(kind);
  const meta = TOOL_META[toolKind];
  const source = compactText(sourceText) || compactText(node?.body || node?.prompt || node?.title) || '（用户尚未输入正文，请基于节点标题和上下文生成可用正文）';
  const context = compactText(upstreamContext);
  const title = compactText(node?.title);

  return [
    '<role>',
    '你是一名商业影视内容总监、短剧编剧顾问和品牌文案主笔，负责把粗糙文本处理成可投入商业生产的成稿。',
    '</role>',
    '',
    '<task>',
    `任务类型: ${meta.title}`,
    ...meta.task.map((line) => `- ${line}`),
    '</task>',
    '',
    '<production_requirements>',
    '- 保留原文已经明确的人物、地点、时间、因果关系、品牌/产品信息和关键设定。',
    '- 不得新增未被原文支持的核心事实，不得编造真实机构背书、价格、法律/医疗/金融承诺。',
    '- 中文输出优先；除非原文是外语，否则不要切换语言。',
    '- 语气要成熟、可交付，避免模板腔、AI腔、口号堆叠和空泛形容词。',
    '- 兼顾商业转化和创作可执行性: 信息清楚、情绪有层次、动作能落地、画面能被导演或生成模型理解。',
    '- 如果原文包含风格、受众、平台、时长或比例要求，必须显式继承。',
    '</production_requirements>',
    '',
    '<quality_bar>',
    '- 结构: 起承转合清晰，段落服务目标，不重复堆字。',
    '- 表达: 动词具体，名词准确，少用泛化修饰。',
    '- 节奏: 句长有变化，关键处有停顿和推进。',
    '- 画面: 人物动作、空间关系、氛围和冲突可被镜头化。',
    '- 商业化: 能直接用于短剧脚本、广告脚本、项目提案、生成提示词或宣发文案的下一步生产。',
    '</quality_bar>',
    '',
    '<output_rules>',
    '- 只输出最终正文，不输出解释、标题、Markdown、项目符号或“以下是”。',
    '- 不要声明你是 AI，不要描述你的处理过程。',
    '- 如原文很短，也要补足必要上下文，但不得突破事实边界。',
    '</output_rules>',
    '',
    title ? `<node_title>${title}</node_title>` : '',
    context ? `<context>\n${context}\n</context>` : '<context>无额外上游上下文</context>',
    '',
    '<source_text>',
    source,
    '</source_text>',
  ].filter(Boolean).join('\n');
}
