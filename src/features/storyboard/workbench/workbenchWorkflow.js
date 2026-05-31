export const WORKBENCH_MODE_SCRIPT = 'script-create';
export const WORKBENCH_MODE_VIDEO = 'video-remix';

const WORKFLOWS = {
  [WORKBENCH_MODE_SCRIPT]: {
    title: '剧本生产工作台',
    defaultTab: 'script',
    tabs: [
      { key: 'script', label: '内容输入' },
      { key: 'asset-bindings', label: '资产配置' },
      { key: 'shots', label: '分镜拆解' },
      { key: 'output', label: '输出' },
    ],
    aliases: {
      package: 'output',
      plan: 'output',
      generate: 'output',
      reference: 'asset-bindings',
      characters: 'asset-bindings',
      assets: 'asset-bindings',
      video: 'script',
      'video-frames': 'script',
      'video-prompts': 'script',
    },
  },
  [WORKBENCH_MODE_VIDEO]: {
    title: '参考视频工作台',
    defaultTab: 'video',
    tabs: [
      { key: 'video', label: '视频输入' },
      { key: 'video-frames', label: '抽帧分析' },
      { key: 'video-prompts', label: '提示词反推' },
      { key: 'asset-bindings', label: '资产配置' },
      { key: 'output', label: '输出' },
    ],
    aliases: {
      package: 'output',
      plan: 'output',
      generate: 'output',
      reference: 'video',
      script: 'video',
      characters: 'asset-bindings',
      assets: 'asset-bindings',
      'asset-bindings': 'asset-bindings',
      shots: 'video-prompts',
    },
  },
};

export const normalizeWorkbenchMode = (mode) => (
  mode === WORKBENCH_MODE_VIDEO ? WORKBENCH_MODE_VIDEO : WORKBENCH_MODE_SCRIPT
);

export const getWorkflow = (mode) => WORKFLOWS[normalizeWorkbenchMode(mode)];

export const getWorkflowTabs = (mode) => getWorkflow(mode).tabs;

export const getWorkflowTitle = (mode) => getWorkflow(mode).title;

export const getWorkflowDefaultTab = (mode) => getWorkflow(mode).defaultTab;

export const normalizeWorkflowTab = (mode, tab) => {
  const workflow = getWorkflow(mode);
  const key = typeof tab === 'string' ? tab : '';
  const directMatch = workflow.tabs.some((item) => item.key === key);
  if (directMatch) return key;
  return workflow.aliases[key] || workflow.defaultTab;
};
