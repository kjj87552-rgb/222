/* Initial canvas data + demo media URLs (placeholders using picsum for images) */

export const DEMO_IMG = (seed, w = 480, h = 320) =>
  `https://picsum.photos/seed/mancrea${seed}/${w}/${h}`;

/* Initial workflow: 参考图 → 文本角色设定 → 图像生成 → 视频生成 */
export const INITIAL_NODES = [
  {
    id: "n1", type: "image", x: 80, y: 140, w: 300, h: 260,
    title: "风格参考图",
    src: DEMO_IMG(11),
    tag: "素材",
  },
  {
    id: "n2", type: "text", x: 80, y: 440, w: 300, h: 170,
    title: "角色设定",
    body: "少女，棕色短发，穿米色风衣，琥珀色瞳孔；身处清晨的旧书店，逆光从窗口投入。",
    tag: "输入",
  },
  {
    id: "n2b", type: "text", x: 80, y: 640, w: 300, h: 280,
    title: "新建文本节点",
    body: "",
    tag: "新建",
  },
  {
    id: "n3", type: "image", x: 460, y: 250, w: 320, h: 300,
    title: "图像生成",
    src: DEMO_IMG(22),
    status: "generated",
    tag: "生成",
  },
  {
    id: "n4", type: "video", x: 860, y: 230, w: 340, h: 320,
    title: "视频素材",
    poster: DEMO_IMG(33),
    duration: "00:05",
    tag: "素材",
  },
  {
    id: "n5", type: "script", x: 460, y: 610, w: 640, h: 260,
    title: "分镜脚本 · 旧书店",
    shots: [
      { n: 1, shot: "中景", desc: "少女推开书店门，铃铛响起", dur: "3s" },
      { n: 2, shot: "特写", desc: "指尖拂过书脊", dur: "2s" },
      { n: 3, shot: "全景", desc: "阳光洒落的书架长廊", dur: "4s" },
    ],
    tag: "剧本",
  },
  {
    id: "n6", type: "audio", x: 1240, y: 280, w: 280, h: 200,
    title: "配乐素材",
    duration: "00:18",
    waveform: true,
    tag: "素材",
  },
  {
    id: "n7", type: "video", x: 1240, y: 540, w: 320, h: 280,
    title: "新建视频节点",
    poster: null,
    tag: "新建",
  },
];

/* Connections: from -> to via right handle */
export const INITIAL_EDGES = [
  { id: "e1", from: "n1", to: "n3" },
  { id: "e2", from: "n2", to: "n3" },
  { id: "e3", from: "n3", to: "n4" },
  { id: "e4", from: "n4", to: "n6" },
];
