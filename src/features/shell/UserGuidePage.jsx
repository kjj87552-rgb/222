import React from 'react';

const GUIDE_SECTIONS = [
  {
    id: 'quick-start',
    title: '快速开始',
    summary: '第一次使用时先进入项目页；需要模型调用时，再完成账号、模型和路径准备。',
    blocks: [
      {
        type: 'steps',
        title: '推荐阅读顺序',
        items: [
          '启动软件后先进入「项目」，新建项目或继续当前项目。',
          '进入画布后添加节点、上传素材、整理创作流程。',
          '需要模型调用时，打开左下角账号入口完成登录或注册，确认账号已经连接。',
          '在用户中心查看余额；必要时绑定完整 API Key 或输入兑换码充值。',
          '进入「模型列表」，点击同步模型，确认图片、视频、文本模型处于可用状态。',
          '进入「本地路径」，设置项目保存目录；如果要导出剪映草稿，再设置剪映草稿目录。',
          '回到画布打开生成器，开始生成图片、视频、音频或文本。',
        ],
      },
      {
        type: 'tips',
        title: '新手理解',
        items: [
          '项目是独立的本地创作空间，切换项目后画布、资产和历史会跟着切换。',
          '模型列表只是展示和同步模型，真正生成时还需要在生成器或工作台里选择模型。',
          '资产库用于沉淀素材，画布用于组织创作流程，两者可以互相配合。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '服务暂不可用：先确认桌面应用后端已经启动，稍后刷新用户中心或模型列表。',
          '模型不可用：进入「模型列表」同步模型，确认当前账号拥有对应模型，并且模型没有被禁用。',
          '路径不可写：在「本地路径」重新选择一个有写入权限的文件夹。',
          '本地后端未连接：生成任务不会真正提交，需要重新启动桌面应用或检查后端服务。',
        ],
      },
    ],
  },
  {
    id: 'projects',
    title: '项目模块',
    summary: '项目页用于创建、切换和删除本地创作空间。',
    blocks: [
      {
        type: 'steps',
        title: '怎么使用',
        items: [
          '点击侧边栏「项目」进入项目画廊。',
          '点击「继续当前画布」打开最近使用的项目。',
          '点击「新建项目」，输入项目名称后确认创建。',
          '点击任意项目卡片，可以切换并进入对应画布。',
          '项目卡片上的 N、E、A 分别表示节点数、连线数和资产数，用来快速判断项目规模。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '暂无项目：点击「新建项目」创建第一个本地画布。',
          '误点删除：删除前会弹出确认框，确认后不可恢复，请谨慎操作。',
          '切换项目后画布变化：这是正常行为，每个项目都有自己的节点、连线和资产。',
        ],
      },
    ],
  },
  {
    id: 'assets',
    title: '资产库模块',
    summary: '资产库集中管理图片、视频、音频和文本素材。',
    blocks: [
      {
        type: 'steps',
        title: '项目资产和全局资产',
        items: [
          '项目资产只属于当前项目，适合保存当前故事、角色和场景素材。',
          '全局资产可以跨项目复用，适合保存常用风格、角色参考、品牌素材。',
          '进入资产库后先选择「项目资产」或「全局资产」，再按图片、视频、音频、文本分类查看。',
          '点击素材上的「预览」可以放大查看图片、视频、音频或文本内容。',
          '在项目资产里点击「保存全局」，可以把当前项目素材沉淀到全局资产库。',
        ],
      },
      {
        type: 'tips',
        title: '使用逻辑',
        items: [
          '建议先把项目内会反复使用的人物、场景、道具保存为项目资产。',
          '生成器里的 @ 引用主要读取当前项目可用素材，所以素材要先进入当前项目资产。',
          '满意的成品可以保存到全局资产，后续其它项目可以继续复用。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '素材为空：先在画布上传文件，或从生成结果保存到资产库。',
          '预览打不开：检查素材文件是否被移动、删除，或后端资产地址是否可访问。',
          '保存全局失败：确认后端服务可用，并检查资产本身是否有有效地址。',
        ],
      },
    ],
  },
  {
    id: 'models-account',
    title: '模型和账户',
    summary: '生成能力依赖账号、余额、API Key、模型同步和后端服务。',
    blocks: [
      {
        type: 'steps',
        title: '账号和模型准备',
        items: [
          '点击侧边栏底部账户区域打开用户中心。',
          '无账号时在左下角账号入口注册；已有账号时输入账号和密码登录。',
          '登录后查看余额、消费账单、调用密钥和兑换码入口。',
          '需要模型调用时，粘贴完整 API Key 并绑定，不要粘贴脱敏后的 Key。',
          '进入「模型列表」后点击同步模型，查看图片模型、视频模型、推理模型。',
          '生成前确认所需能力存在：图片生成、视频生成、文本生成或视觉分析。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '尚未登录中转站账号：在左下角账号入口完成登录或注册。',
          '密码长度不符合要求：密码至少需要满足系统提示的位数。',
          'API Key 不完整：必须粘贴完整 sk- 开头的密钥，脱敏 Key 不能用于模型调用。',
          '模型不支持当前能力：例如视频生成必须选择 video.generate 能力的模型。',
          '模型已禁用：进入模型配置启用，或同步账号可用模型后重新选择。',
        ],
      },
    ],
  },
  {
    id: 'local-paths',
    title: '本地路径和剪映路径',
    summary: '本地路径决定项目、资产和剪映草稿导出的保存位置。',
    blocks: [
      {
        type: 'steps',
        title: '设置路径',
        items: [
          '点击侧边栏「本地路径」进入路径设置页。',
          '在「当前目录」区域点击「添加本地文件夹」，选择项目保存目录。',
          '如果要导出剪映草稿，在「剪映草稿路径」区域点击「自动识别」或「手动选择」。',
          '确认路径有效后点击「保存路径」。',
          '路径显示可写后，再回到画布使用剪映导出节点。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '当前浏览器预览不能打开系统文件夹选择器：请在桌面应用中使用。',
          'Selected path is not a folder：选择的是文件而不是文件夹，请重新选择目录。',
          'Cannot write to selected folder：当前目录无写入权限，换到桌面、文档或专用项目目录。',
          '剪映草稿目录不存在：确认剪映专业版已经安装，并选择草稿根目录。',
          '这不是有效的剪映草稿目录：不要选择单个草稿文件夹，要选择剪映草稿根目录。',
        ],
      },
    ],
  },
  {
    id: 'canvas',
    title: '画布基础',
    summary: '画布是节点、素材、提示词、生成结果和工作流连接在一起的主工作区。',
    blocks: [
      {
        type: 'steps',
        title: '基础操作',
        items: [
          '在项目页点击「继续当前画布」进入画布。',
          '按住画布空白处拖动可以平移视野，滚轮可以缩放。',
          '双击空白画布或右键空白画布，可以打开添加节点菜单。',
          '从左侧工具栏可以添加文本、图片、视频、音频、脚本、资产生成、提示词调用、720 空间、剪映导出等节点。',
          '拖动节点可以调整位置，拖动节点右下角可以调整大小。',
          '从节点左右连接点拖拽到另一个节点，可以创建连线。',
          '多选节点后右键可以新建组合、批量下载、收进分镜收集节点。',
          '按住 Ctrl/Cmd 在空白画布拖动可以创建背景板，用来整理一组节点。',
        ],
      },
      {
        type: 'tips',
        title: '使用逻辑',
        items: [
          '连线表示上游内容会作为下游生成或分析的参考。',
          '画布适合把灵感、素材、提示词和生成结果放在同一个空间里反复调整。',
          '节点不是一次性结果，可以继续编辑、复制、连线、保存到资产库。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '节点没有素材时，下载和保存到资产库会不可用。',
          '拖入文件没有反应：确认文件类型是图片、视频或音频，并检查是否拖到画布区域。',
          '连线失败：从节点边缘连接点开始拖动，并松开到另一个节点上。',
          '批量操作不可用：先框选或多选至少两个可操作节点。',
        ],
      },
    ],
  },
  {
    id: 'generator',
    title: '底部生成器',
    summary: '生成器负责统一提交图片、视频、音频和文本生成任务。',
    blocks: [
      {
        type: 'steps',
        title: '生成流程',
        items: [
          '在画布左侧点击魔法棒按钮打开生成器。',
          '选择生成类型：图像、视频、音频或文本。',
          '在模型下拉中选择可用模型。',
          '输入清晰提示词，说明主体、场景、风格、动作和输出要求。',
          '图片或视频生成时选择比例，例如 16:9、1:1、9:16。',
          '需要参考素材时点击「上传参考图」，或在提示词中输入 @ 引用项目素材。',
          '选择数量后点击「生成」，结果会作为新节点落到画布上。',
          '输入 / 可以调出快捷生成，例如角色三视图、多机位九宫格、电影级光影矫正。',
        ],
      },
      {
        type: 'tips',
        title: '提示词建议',
        items: [
          '图片提示词要写清楚主体、构图、镜头、光线、材质和风格。',
          '视频提示词要写清楚动作、镜头运动、节奏、时长和首帧参考。',
          '文本提示词要写清楚输入资料、输出格式和不要输出的内容。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '提示词为空时不能生成，先输入描述内容。',
          '没有可用模型时，先到「模型列表」同步并启用对应能力模型。',
          '本地后端未连接时，节点会显示失败，重新启动后端或桌面应用后再试。',
          '参考素材不显示：确认素材已保存到当前项目资产，并且类型符合当前生成模式。',
        ],
      },
    ],
  },
  {
    id: 'nodes',
    title: '节点模块',
    summary: '不同节点负责不同创作环节，可以单独使用，也可以连线组成工作流。',
    blocks: [
      {
        type: 'notes',
        title: '常用节点',
        items: [
          '文本节点：写提示词、存脚本、做文本续写、改写、润色和分镜生成。',
          '图片节点：查看图片，使用打光、焦点编辑、高清放大和创建 720 空间。',
          '视频节点：查看视频，进行剪辑，或截帧生成图片节点。',
          '音频节点：保存音频素材，试听或进入变声工具。',
          '脚本节点：管理剧本和分镜，支持全屏编辑、重新生成分镜和打开工作台。',
          '资产生成节点：基于参考图和提示词生成角色、道具、场景等生产资产。',
          '提示词调用节点：保存自己的提示词模板，读取上游输入，运行模型并输出文本。',
          '720 空间场景节点：生成全景环境图，并连接到 720 全景预览节点查看。',
          '分镜收集细节节点：收集图片和视频素材，适合整理一组镜头或素材候选。',
          '剪映导出节点：读取上游图片、视频、音频和文本，生成剪映草稿。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '图片加载失败：检查文件是否还存在，或后端资产链接是否可访问。',
          '生成失败：展开节点或任务队列查看错误摘要，修正模型、提示词或路径后重试。',
          '工具按钮不可用：当前节点没有对应素材，或节点类型不支持该工具。',
          '剪映导出失败：先确认剪映草稿目录有效，并且上游连接了可导出的素材节点。',
        ],
      },
    ],
  },
  {
    id: 'design-space',
    title: '设计空间',
    summary: '设计空间用于从小说或剧本提取人物、场景、道具，并生成视觉资产。',
    blocks: [
      {
        type: 'steps',
        title: '标准流程',
        items: [
          '在画布或工作台入口打开设计空间。',
          '粘贴小说、剧本或项目设定文本。',
          '选择解析模型，填写项目风格要求。',
          '点击「解析原文」，系统会生成「人物」「场景」「道具」三类卡片。',
          '逐张检查卡片，修改名称、描述和视觉提示词。',
          '设置比例、清晰度和 Prompt Prefix。',
          '点击「生成该卡片」生成单卡图片，或用快捷生成批量跑提示词模板。',
          '在生成历史里对比版本，把满意版本保存到资产库或加载回画布。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '解析失败：保留原文，检查模型输出是否完整，减少输入长度后可重试。',
          '卡片为空：确认原文里确实包含人物、场景或道具信息，并补充更明确的项目描述。',
          '模板读取失败：系统会使用内置提示词模板，不影响继续生成。',
          '单卡生成失败：失败会记录在该卡片历史中，修改提示词或模型后可重新生成。',
          '保存资产失败：生成版本不会丢失，先检查后端和项目路径，再重新保存。',
        ],
      },
    ],
  },
  {
    id: 'script-workbench',
    title: '剧本生产工作台',
    summary: '剧本生产工作台负责把小说或剧本文本变成可生成、可输出到画布的镜头组。',
    blocks: [
      {
        type: 'steps',
        title: '从文本到画布',
        items: [
          '从脚本节点打开工作台，顶部选择 Chat 模型。',
          '在「内容输入」粘贴小说原文或已有剧本。',
          '需要改写时点击「小说→剧本」，需要统一格式时点击「格式标准化」。',
          '进入「资产配置」，解析或整理人物、场景、道具资产。',
          '进入「分镜拆解」，设置目标时长，选择提示词类型和模板。',
          '点击「V3 生成分镜」生成镜头组。',
          '点击「提示词推理」为每个镜头组生成图片提示词和视频提示词。',
          '进入「输出」，可以输出全部组或单个组到画布，再按组生成图片或视频。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '请先选择一个 Chat 模型：在工作台右上角模型下拉选择可用推理模型。',
          '请先准备标准剧本：内容输入为空时不能拆解分镜。',
          '没有资产配置：仍可生成分镜，但角色和场景一致性风险更高。',
          '提示词推理失败：失败组会标记错误，可单组重试或修改模板后再跑。',
          '还没有可输出的镜头组：先完成分镜拆解和提示词推理。',
        ],
      },
    ],
  },
  {
    id: 'video-workbench',
    title: '参考视频工作台',
    summary: '参考视频工作台用于上传视频、抽帧分析、确认关键帧并反推提示词。',
    blocks: [
      {
        type: 'steps',
        title: '从视频到提示词',
        items: [
          '从脚本节点或工作台入口选择参考视频链路。',
          '在「视频输入」上传参考视频。',
          '进入「抽帧分析」，设置检测强度和关键帧上限。',
          '点击「解析视频」，等待后端完成 FFmpeg 场景检测和抽帧。',
          '在关键帧列表中全选、清空或手动勾选需要用于反推的关键帧。',
          '点击「确认关键帧」。',
          '进入「提示词反推」，点击「开始反推提示词」。',
          '确认反推结果后进入输出流程，把结果放回画布继续生成。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '请选择视频文件：上传时不要选择图片、音频或文本文件。',
          '尚未解析参考视频：先进入抽帧分析并点击解析视频。',
          '请至少选择一个关键帧：未确认关键帧不能进行提示词反推。',
          '确认的关键帧缺少可读取的资产地址：重新上传视频并再次抽帧。',
          '提示词反推任务提交失败：检查 Chat 模型和后端任务服务。',
        ],
      },
    ],
  },
  {
    id: 'task-history-tools',
    title: '任务、历史和辅助工具',
    summary: '任务队列、历史、本地文件夹和高清放大用于辅助管理生成结果。',
    blocks: [
      {
        type: 'notes',
        title: '辅助入口',
        items: [
          '任务队列：查看正在排队、运行、失败或完成的后台任务。',
          '历史：查看过往生成结果，适合找回之前生成的图片或视频。',
          '本地文件夹：从本机目录插入图片、视频、音频素材。',
          '高清放大：对选中的图片做放大处理，并可保存为项目资产。',
          '任务面板中的定位动作可以把视野跳到对应画布节点。',
        ],
      },
      {
        type: 'errors',
        title: '常见错误处理',
        items: [
          '任务长时间不完成：检查后端、网络、模型供应商和余额状态。',
          '历史为空：先完成一次生成任务，或确认当前项目是否正确。',
          '本地文件不可读取：检查文件是否被移动、删除或权限不足。',
          '高清放大失败：确认输入是有效图片，并检查后端生成服务。',
        ],
      },
    ],
  },
  {
    id: 'shortcuts',
    title: '快捷键和常见操作',
    summary: '这里列出当前代码中已经接入的常用快捷操作。',
    blocks: [
      {
        type: 'notes',
        title: '快捷操作',
        items: [
          '?：打开快捷键面板。',
          'Esc：关闭快捷键面板、右键菜单和左侧弹层。',
          'Delete / Backspace：删除已选节点。',
          'Ctrl/Cmd + G：将已选节点打组。',
          'Ctrl/Cmd + D：复制已选节点。',
          '鼠标滚轮：缩放画布。',
          'Shift + 拖动空白画布：框选节点。',
          'Ctrl/Cmd + 拖动空白画布：创建背景板。',
        ],
      },
      {
        type: 'tips',
        title: '注意事项',
        items: [
          '在输入框或文本域里按快捷键时，软件会优先保留文本编辑行为。',
          '文档只写当前已接入的快捷键，避免承诺还未实现的撤销、重做、全选和搜索。',
        ],
      },
    ],
  },
];

const GUIDE_GROUPS = [
  {
    id: 'getting-started',
    title: '入门准备',
    summary: '启动、项目、账号入口和模型准备',
    sectionIds: ['quick-start', 'models-account', 'local-paths', 'projects'],
  },
  {
    id: 'workspace',
    title: '核心工作区',
    summary: '画布、生成器、节点和资产库',
    sectionIds: ['canvas', 'generator', 'nodes', 'assets'],
  },
  {
    id: 'advanced',
    title: '进阶工作台',
    summary: '设计空间、剧本生产和参考视频',
    sectionIds: ['design-space', 'script-workbench', 'video-workbench', 'task-history-tools'],
  },
  {
    id: 'help',
    title: '排错与快捷键',
    summary: '快捷操作和错误排查',
    sectionIds: ['shortcuts'],
    includeTroubleshooting: true,
  },
];

const GUIDE_SECTIONS_BY_ID = new Map(GUIDE_SECTIONS.map((section) => [section.id, section]));

const GUIDE_VISUALS = {
  'quick-start': {
    kind: 'workflow',
    windowTitle: '首次使用顺序',
    caption: '先启动软件进入项目页和画布；需要模型调用时，再通过左下角账号入口完成账号、模型和路径准备。',
    markers: [
      { label: '启动', x: '18%', y: '30%' },
      { label: '项目', x: '39%', y: '30%' },
      { label: '画布', x: '60%', y: '30%' },
      { label: '账号入口', x: '80%', y: '30%' },
    ],
  },
  projects: {
    kind: 'projects',
    windowTitle: '项目页',
    caption: '项目卡片负责切换创作空间；进入画布前先确认当前项目是否正确。',
    markers: [
      { label: '新建项目', x: '76%', y: '20%' },
      { label: '项目卡片', x: '37%', y: '56%' },
      { label: '继续画布', x: '77%', y: '76%' },
    ],
  },
  assets: {
    kind: 'gallery',
    windowTitle: '资产库',
    caption: '先选资产范围，再按图片、视频、音频、文本分类查看和预览。',
    markers: [
      { label: '项目/全局', x: '24%', y: '22%' },
      { label: '分类筛选', x: '55%', y: '34%' },
      { label: '素材预览', x: '72%', y: '66%' },
    ],
  },
  'models-account': {
    kind: 'models',
    windowTitle: '账户与模型',
    caption: '用户中心管账号和余额，模型列表管可用能力，二者都正常后再生成。',
    markers: [
      { label: '用户中心', x: '20%', y: '76%' },
      { label: '同步模型', x: '70%', y: '20%' },
      { label: '能力标签', x: '54%', y: '58%' },
    ],
  },
  'local-paths': {
    kind: 'paths',
    windowTitle: '本地路径',
    caption: '保存目录和剪映草稿目录都要可写，路径错误会影响导出和素材保存。',
    markers: [
      { label: '项目目录', x: '40%', y: '35%' },
      { label: '剪映目录', x: '43%', y: '62%' },
      { label: '保存路径', x: '74%', y: '82%' },
    ],
  },
  canvas: {
    kind: 'canvas',
    windowTitle: '画布工作区',
    caption: '画布用节点和连线组织创作流程，素材、提示词和生成结果都在这里串起来。',
    markers: [
      { label: '添加节点', x: '11%', y: '36%' },
      { label: '节点连线', x: '50%', y: '50%' },
      { label: '生成器', x: '57%', y: '82%' },
    ],
  },
  generator: {
    kind: 'generator',
    windowTitle: '底部生成器',
    caption: '选择类型和模型，写提示词，补参考素材，然后提交生成。',
    markers: [
      { label: '生成类型', x: '22%', y: '30%' },
      { label: '提示词', x: '48%', y: '56%' },
      { label: '生成按钮', x: '78%', y: '76%' },
    ],
  },
  nodes: {
    kind: 'nodes',
    windowTitle: '节点面板',
    caption: '不同节点承担不同任务，连线后上游内容会成为下游参考。',
    markers: [
      { label: '素材节点', x: '28%', y: '38%' },
      { label: '文本节点', x: '64%', y: '35%' },
      { label: '工具按钮', x: '55%', y: '72%' },
    ],
  },
  'design-space': {
    kind: 'design',
    windowTitle: '设计空间',
    caption: '从原文解析人物、场景、道具，再逐卡生成和保存视觉资产。',
    markers: [
      { label: '原文输入', x: '22%', y: '32%' },
      { label: '资产卡片', x: '58%', y: '45%' },
      { label: '生成历史', x: '70%', y: '74%' },
    ],
  },
  'script-workbench': {
    kind: 'workbench',
    windowTitle: '剧本生产工作台',
    caption: '按照内容输入、资产配置、分镜拆解、输出的顺序推进。',
    markers: [
      { label: '流程标签', x: '47%', y: '20%' },
      { label: '分镜组', x: '34%', y: '56%' },
      { label: '输出画布', x: '77%', y: '76%' },
    ],
  },
  'video-workbench': {
    kind: 'video',
    windowTitle: '参考视频工作台',
    caption: '先抽帧，再确认关键帧，最后把关键帧用于提示词反推。',
    markers: [
      { label: '上传视频', x: '25%', y: '35%' },
      { label: '关键帧', x: '57%', y: '48%' },
      { label: '反推提示词', x: '73%', y: '78%' },
    ],
  },
  'task-history-tools': {
    kind: 'tasks',
    windowTitle: '任务与历史',
    caption: '任务队列看状态，历史找结果，本地文件夹和高清放大辅助素材管理。',
    markers: [
      { label: '任务状态', x: '27%', y: '35%' },
      { label: '历史结果', x: '58%', y: '45%' },
      { label: '定位节点', x: '74%', y: '73%' },
    ],
  },
  shortcuts: {
    kind: 'shortcuts',
    windowTitle: '快捷键',
    caption: '快捷键主要服务画布整理，输入框内会优先保留文本编辑行为。',
    markers: [
      { label: '删除', x: '25%', y: '37%' },
      { label: '打组', x: '52%', y: '47%' },
      { label: '框选', x: '72%', y: '68%' },
    ],
  },
};

const HERO_FLOW = ['启动软件', '创建项目', '进入画布', '账号入口', '同步模型', '生成与保存'];

function GuideStepFlow() {
  return (
    <div className="guide-step-flow" aria-label="推荐阅读顺序">
      {HERO_FLOW.map((item, index) => (
        <React.Fragment key={item}>
          <span>
            <b>{String(index + 1).padStart(2, '0')}</b>
            {item}
          </span>
          {index < HERO_FLOW.length - 1 && <i aria-hidden="true" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function GuideInterfaceMap() {
  return (
    <aside className="guide-interface-map" aria-label="软件界面总览图">
      <div className="guide-map-topbar">
        <span />
        <span />
        <span />
        <strong>漫创AI 主界面</strong>
      </div>
      <div className="guide-map-body">
        <div className="guide-map-sidebar">
          <b>侧边栏</b>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="guide-map-canvas">
          <span className="map-node node-a">文本</span>
          <span className="map-node node-b">图片</span>
          <span className="map-node node-c">视频</span>
          <span className="map-edge edge-a" />
          <span className="map-edge edge-b" />
        </div>
        <div className="guide-map-dock">底部生成器</div>
      </div>
      <div className="guide-map-labels">
        <span>项目 / 资产 / 模型 / 路径 / 文档</span>
        <span>节点、连线、任务、历史</span>
      </div>
    </aside>
  );
}

function VisualMock({ kind }) {
  if (kind === 'workflow') {
    return (
      <div className="guide-mock-workflow">
        {['启动', '项目', '画布', '账号', '模型'].map((item) => <span key={item}>{item}</span>)}
      </div>
    );
  }

  if (kind === 'canvas') {
    return (
      <div className="guide-mock-canvas">
        <span className="mock-toolbar" />
        <span className="mock-node image">图片节点</span>
        <span className="mock-node text">文本节点</span>
        <span className="mock-node video">视频节点</span>
        <i className="mock-edge edge-one" />
        <i className="mock-edge edge-two" />
        <b>生成器</b>
      </div>
    );
  }

  if (kind === 'gallery') {
    return (
      <div className="guide-mock-gallery">
        <span className="wide" />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  }

  if (kind === 'models' || kind === 'paths' || kind === 'tasks' || kind === 'shortcuts') {
    return (
      <div className={`guide-mock-list guide-mock-${kind}`}>
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (kind === 'workbench' || kind === 'video' || kind === 'design') {
    return (
      <div className={`guide-mock-workbench guide-mock-${kind}`}>
        <div className="mock-tabs"><span /><span /><span /><span /></div>
        <div className="mock-main">
          <i />
          <i />
          <i />
        </div>
        <div className="mock-side">
          <b />
          <b />
        </div>
      </div>
    );
  }

  return (
    <div className={`guide-mock-list guide-mock-${kind}`}>
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function GuideVisualPanel({ section }) {
  const visual = GUIDE_VISUALS[section.id] || GUIDE_VISUALS['quick-start'];
  return (
    <figure
      className={`guide-visual-panel guide-visual-${visual.kind}`}
      data-visual-kind={visual.kind}
      aria-label={`${section.title}界面定位图`}
    >
      <div className="guide-visual-window">
        <div className="guide-visual-topbar">
          <i />
          <i />
          <i />
          <span>{visual.windowTitle}</span>
        </div>
        <div className="guide-visual-body">
          <VisualMock kind={visual.kind} />
          {visual.markers.map((marker, index) => (
            <span
              className="guide-visual-hotspot"
              style={{ '--x': marker.x, '--y': marker.y }}
              key={marker.label}
            >
              <b>{index + 1}</b>
              <em>{marker.label}</em>
            </span>
          ))}
        </div>
      </div>
      <figcaption className="guide-visual-caption">
        <strong>界面定位图</strong>
        {visual.caption}
      </figcaption>
    </figure>
  );
}

function GuideBlock({ block }) {
  if (block.type === 'steps') {
    return (
      <ol className="guide-step-list">
        {block.items.map((item, index) => <li key={`${block.title}-${index}`}>{item}</li>)}
      </ol>
    );
  }

  const className = block.type === 'errors' ? 'guide-error-list' : 'guide-note-list';
  return (
    <ul className={className}>
      {block.items.map((item, index) => <li key={`${block.title}-${index}`}>{item}</li>)}
    </ul>
  );
}

export function UserGuidePage() {
  const [activeGroupId, setActiveGroupId] = React.useState(GUIDE_GROUPS[0].id);
  const activeGroup = GUIDE_GROUPS.find((group) => group.id === activeGroupId) || GUIDE_GROUPS[0];
  const activeSections = activeGroup.sectionIds
    .map((sectionId) => GUIDE_SECTIONS_BY_ID.get(sectionId))
    .filter(Boolean);

  return (
    <section className="home-page user-guide-page">
      <header className="guide-hero">
        <div className="guide-hero-copy">
          <span className="guide-kicker">MANCHUANG AI GUIDE</span>
          <h1>使用文档</h1>
          <p>
            这份文档按真实创作顺序整理：先启动软件，进入项目和画布；需要模型调用时，再通过左下角账号入口完成账号、模型和路径准备。
            新手可以从「快速开始」顺着读，熟悉后直接从目录跳到需要的模块。
          </p>
          <GuideStepFlow />
        </div>
        <GuideInterfaceMap />
      </header>

      <div className="guide-layout">
        <nav className="guide-toc" aria-label="使用文档目录">
          <strong>目录</strong>
          <div className="guide-folder-list" aria-label="文档文件夹">
            {GUIDE_GROUPS.map((group, groupIndex) => (
              <button
                type="button"
                className={`guide-folder-button${group.id === activeGroup.id ? ' active' : ''}`}
                aria-pressed={group.id === activeGroup.id}
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
              >
                <span className="guide-folder-title">
                  <b>{String(groupIndex + 1).padStart(2, '0')}</b>
                  {group.title}
                </span>
                <em>{group.summary}</em>
                <small>{group.sectionIds.length} 个模块</small>
              </button>
            ))}
          </div>
          <div className="guide-folder-sections" aria-label={`${activeGroup.title}目录内容`}>
            <span className="guide-current-folder">
              当前目录：{activeGroup.title}
              <em>仅显示本目录内容</em>
            </span>
            {activeSections.map((section, index) => (
              <a key={section.id} href={`#guide-${section.id}`}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <main className="guide-content">
          {activeSections.map((section, index) => {
            const [primaryBlock, ...secondaryBlocks] = section.blocks;

            return (
              <section className="guide-section" id={`guide-${section.id}`} key={section.id}>
                <div className="guide-section-head">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2>{section.title}</h2>
                    <p>{section.summary}</p>
                  </div>
                </div>

                <div className="guide-reading-layout">
                  <div className="guide-reading-flow">
                    {primaryBlock ? (
                      <article className={`guide-block ${primaryBlock.type === 'errors' ? 'is-error' : ''}`}>
                        <h3>{primaryBlock.title}</h3>
                        <GuideBlock block={primaryBlock} />
                      </article>
                    ) : null}
                    <GuideVisualPanel section={section} />
                    {secondaryBlocks.map((block) => (
                      <article className={`guide-block ${block.type === 'errors' ? 'is-error' : ''}`} key={block.title}>
                        <h3>{block.title}</h3>
                        <GuideBlock block={block} />
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}

          {activeGroup.includeTroubleshooting && (
            <section className="guide-section guide-section-troubleshooting" id="guide-troubleshooting">
              <div className="guide-section-head">
                <span>!</span>
                <div>
                  <h2>常见错误处理总览</h2>
                  <p>遇到问题时先判断是账号、模型、路径、后端、素材还是提示词问题，再按对应模块排查。</p>
                </div>
              </div>
              <article className="guide-block is-error">
                <h3>快速排查顺序</h3>
                <ol className="guide-step-list">
                  <li>先看任务或节点上的错误文字，确认失败发生在哪一步。</li>
                  <li>如果提示模型不可用，去「模型列表」同步并重新选择模型。</li>
                  <li>如果提示本地后端未连接，重启桌面应用或检查后端服务。</li>
                  <li>如果是资产预览、保存或剪映导出失败，优先检查本地路径和剪映草稿目录。</li>
                  <li>如果是解析失败或提示词推理失败，缩短输入、换模型或把输出格式写得更明确后重试。</li>
                </ol>
              </article>
            </section>
          )}
        </main>
      </div>
    </section>
  );
}
