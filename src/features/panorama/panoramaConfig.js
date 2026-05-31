export const FALLBACK_PANORAMA_PROMPT = '根据参考图生成720空间场景';

export const PANORAMA_ENVIRONMENT_PREFIX = [
  '生成一张360°沉浸式全景图，第一人称视角。',
  'Seam-safe panoramic environment plate, one single continuous immersive environment only, not a collage, not multiple panels, not multiple disconnected scenes.',
  'Compose the image as a wraparound panoramic world with believable 360-degree continuity and natural left-right edge connection.',
  'Keep the horizon stable, camera height consistent, vertical structures calm and readable, and the full width spatially coherent.',
  'Prioritize panoramic continuity over poster composition.',
  'Keep the most important scene information in the middle horizontal band.',
  'Keep the upper and lower regions broad, simple, and remap-safe, avoiding critical structure or dense fine detail at the extreme top and bottom.',
  'Avoid fisheye distortion, dutch angles, broken perspective, mirrored artifacts, abrupt scene changes, lighting mismatch, warped floors, collapsed ceilings, tunnel stretching, or disconnected mini-scenes.',
  'Maintain one environment, one lighting setup, one perspective system, and one stable scene identity across the full panoramic strip.',
].join(' ');

export const PANORAMA_RATIOS = ['16:9', '2:1', '4:3', '3:2', '1:1'];
export const PANORAMA_RESOLUTIONS = ['1K', '2K', '4K'];

export const PANORAMA_STYLES = [
  {
    value: 'none',
    label: '无参考风格',
    promptSuffix: '',
  },
  {
    value: 'realistic_cinematic',
    label: '电影级写实风',
    promptSuffix: ', masterpiece, best quality, 8K ultra HD, 电影级镜头, 写实电影风格, 专业级灯光追踪, 全局光照, 浅景深光线渲染',
  },
  {
    value: '3d_chinese_comic',
    label: '次世代国漫风',
    promptSuffix: ', masterpiece, best quality, 8K ultra HD, 真实3D国漫风格, 专业级灯光追踪, 全局光照, 浅景深光线渲染',
  },
  {
    value: 'pixar_style',
    label: '迪士尼皮克斯风',
    promptSuffix: ', masterpiece, best quality, 8K ultra HD, 皮克斯动画风格, 专业级灯光追踪, 全局光照, 浅景深光线渲染',
  },
  {
    value: 'historical_drama',
    label: '东方古韵纪实',
    promptSuffix: ', masterpiece, best quality, 8K ultra HD, 电影级镜头, 专业级灯光追踪, 全局光照, 对称构图, 历史纪录风格',
  },
  {
    value: 'cyberpunk_neon',
    label: '赛博朋克霓虹风',
    promptSuffix: ', masterpiece, best quality, 8K ultra HD, 赛博朋克风格, 霓虹灯光, 未来都市, 专业级灯光追踪, 全局光照',
  },
  {
    value: 'japanese_anime',
    label: '日系二次元动漫风',
    promptSuffix: ', masterpiece, best quality, 8K ultra HD, 日系二次元动漫风格, 清新画风, 专业级灯光追踪, 全局光照',
  },
  {
    value: 'ghibli_handdraw',
    label: '吉卜力手绘治愈风',
    promptSuffix: ', masterpiece, best quality, 8K ultra HD, 吉卜力宫崎骏手绘风格, 温暖治愈色调, 专业级灯光追踪, 全局光照',
  },
  {
    value: 'watercolor_dream',
    label: '水彩梦境插画风',
    promptSuffix: ', masterpiece, best quality, 8K ultra HD, 水彩插画风格, 梦幻色彩, 柔和笔触, 专业级灯光追踪, 全局光照',
  },
];

export function getPanoramaStyle(value) {
  return PANORAMA_STYLES.find((style) => style.value === value) || PANORAMA_STYLES[1];
}

export function createVR720GenDefaults(overrides = {}) {
  return {
    prompt: '',
    style: 'realistic_cinematic',
    modelId: '',
    model: '',
    ratio: '16:9',
    resolution: '4K',
    imageUrl: '',
    imageUrls: [],
    connectedViewerNodeId: '',
    error: null,
    progress: 0,
    ...overrides,
  };
}

export function createPanoramaViewerDefaults(overrides = {}) {
  return {
    displayName: '',
    panoramaImageUrl: '',
    previewImageUrl: '',
    aspectRatio: '2:1',
    fov: 55,
    yaw: 0,
    pitch: 0,
    imageInfo: null,
    isLoading: false,
    loadError: null,
    ...overrides,
  };
}
