// src/features/director-stage-v2/viewport/viewport-tokens.ts
// 3D 视口内部色板。所有颜色用 hex（Three.js 直接消费 number），但语义和外壳 var(--stage-*) 一一对应。
// 当未来需要支持暗夜主题时，从外壳读取 computedStyle 注入到这里。

export const VIEWPORT_COLORS = {
  // 背景渐变
  bgTop: 0x0a1828,
  bgBottom: 0x0f1e32,

  // 地网格
  gridMinor: 0x55b6f2, // alpha via three.js Material.opacity
  gridMajor: 0x55b6f2,

  // 轴色
  axisX: 0xf76d9e,
  axisZ: 0x55b6f2,
  axisY: 0x5bc78e,

  // 角色
  hero: 0xf76d9e,
  heroSoft: 0xf76d9e, // 半透明在 Material 里设
  crowd: 0x9cb3cc,

  // 机位
  cameraActive: 0x55b6f2,
  cameraInactive: 0x55b6f2, // dashed material via LineDashedMaterial
  cameraFrustum: 0x55b6f2,

  // 取景 / 路径
  frame: 0xffb86c,
  framedark: 0x000000, // 暗角遮罩
  path: 0xffb86c,
  pathDot: 0xffb86c,

  // 选中焦点
  selectionRing: 0xffffff, // 颜色随选中类型变（hero=玫瑰，camera=蓝，frame=橙）—— 由组件根据 selection 切换 material color
} as const;

export const VIEWPORT_OPACITIES = {
  gridMinor: 0.08,
  gridMajor: 0.18,
  cameraInactive: 0.6,
  cameraFrustum: 0.18,
  pathLine: 0.5,
  frameDark: 0.32,   // box-shadow 黑色暗角等效
  heroSoftFill: 0.15,
  selectionRing: 0.7,
} as const;

export type ViewportColorKey = keyof typeof VIEWPORT_COLORS;
