/* Workflow library / asset folders / history items / templates / shortcuts */

export const WORKFLOW_LIBRARY = [
  { id: "w1", name: "参考图 → 图生视频", steps: 3, tag: "基础" },
  { id: "w2", name: "脚本 → 分镜 → 视频", steps: 5, tag: "剧情" },
  { id: "w3", name: "角色三视图 + 运镜", steps: 4, tag: "角色" },
  { id: "w4", name: "产品广告一条龙", steps: 6, tag: "电商" },
  { id: "w5", name: "漫剧分镜工作流", steps: 8, tag: "漫剧" },
];

export const ASSET_FOLDERS = [
  { id: "a1", name: "角色 · 林夏", count: 12, kind: "character" },
  { id: "a2", name: "场景 · 旧书店", count: 8, kind: "scene" },
  { id: "a3", name: "产品 · 香水瓶 / 多视角", count: 14, kind: "product" },
  { id: "a4", name: "风格板 · 胶片暖调", count: 6, kind: "style" },
];

export const HISTORY_ITEMS = Array.from({ length: 12 }).map((_, i) => ({
  id: "h" + i,
  src: `https://picsum.photos/seed/mancrea${100 + i}/160/160`,
  kind: i % 3 === 0 ? "video" : "image",
  time: `04-${String(21 - Math.floor(i/2)).padStart(2,"0")} 14:${String(i*7%60).padStart(2,"0")}`,
}));

export const TEMPLATES = [
  { id: "t1", name: "角色设定卡", kind: "text" },
  { id: "t2", name: "分镜脚本表", kind: "script" },
  { id: "t3", name: "产品广告板", kind: "image" },
  { id: "t4", name: "MV 工作流", kind: "video" },
];

export const SHORTCUTS = [
  { g:"创作", items:[
    ["双击画布", "新建节点"],
    ["Ctrl + C / V", "复制 / 粘贴节点"],
    ["Ctrl + D", "创建副本（保留连线）"],
    ["Ctrl + G", "打组"],
    ["Delete", "删除节点"],
    ["Ctrl + Z / Y", "撤销 / 重做"],
  ]},
  { g:"缩放", items:[
    ["滚轮", "放大 / 缩小"],
    ["Ctrl + 0", "重置缩放"],
    ["Ctrl + 1", "适应画布"],
    ["Space + 拖动", "平移画布"],
  ]},
  { g:"移动", items:[
    ["方向键", "微调节点位置"],
    ["Shift + 拖动", "水平 / 垂直对齐"],
    ["Ctrl + A", "全选"],
    ["Ctrl + F", "搜索定位"],
  ]},
  { g:"其他", items:[
    ["Shift + Option + F", "整理画布"],
    ["I / O", "视频出入点"],
    ["/", "Slash 快捷生成"],
    ["?", "打开快捷键面板"],
  ]},
];
