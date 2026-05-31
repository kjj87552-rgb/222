import { STYLE_PRESET_ITEMS } from './styleLibrary.js';

/* Slash commands + style presets */

export const SLASH_COMMANDS = [
  { k: '/多机位九宫格', d: '一次性生成 9 个机位角度' },
  { k: '/剧情推演四宫格', d: '基于画面推演 4 格剧情' },
  { k: '/25宫格连贯分镜', d: '生成 25 格连贯分镜' },
  { k: '/电影级光影校正', d: '专业级光影色彩重调' },
  { k: '/角色三视图', d: '生成角色正、侧、背三视图' },
  { k: '/画面推演-3秒后', d: '预测 3 秒后的画面' },
  { k: '/画面推演-5秒前', d: '回溯 5 秒前的画面' },
];

export const STYLE_PRESETS = STYLE_PRESET_ITEMS.map((item) => ({
  id: item.id,
  name: item.n,
  tag: item.tag,
  prompt: item.prompt,
  group: item.group,
  mode: item.mode,
  texture: item.texture,
  thumbnail: item.preview,
}));
