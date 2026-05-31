const visualMethodPrompt = (visualStyle) => [
  'Visual-prefix methodology: treat the user prompt as the subject request, then guide the model with concrete art direction.',
  'Specify subject and action, environment, composition/framing, camera or lens language, lighting setup, color palette, material texture, mood, and intended output use.',
  'Use positive, specific visual descriptors before negative constraints; avoid contradictory style cues.',
  'If reference images are supplied, use them to preserve subject identity, outfit, props, composition, lighting, and style continuity unless the user explicitly asks to change them.',
  'For video outputs, translate the still style into subject action, environmental motion, camera movement, focus behavior, and timing while preserving the selected visual identity.',
  visualStyle,
].join(' ');

const comicDramaPrompt = (visualStyle) => [
  'Comic-drama generation logic: produce a serialized manhua/web-drama frame, not a generic poster.',
  'Prioritize consistent lead characters, clear relationship tension, readable facial expressions, cinematic panel framing, episode-still composition, foreground/background layering, and sequential-story continuity.',
  'Use comic panel thinking: establish-shot context, medium-shot interaction, close-up emotion, deliberate camera angle, and clean visual flow.',
  'If reference images are supplied, preserve identity, outfit, hairstyle, props, and scene continuity unless the user explicitly asks to change them.',
  'Avoid random typography, speech bubbles, extra unrelated characters, inconsistent faces, overbusy poster layouts, logos, and watermarks.',
  visualStyle,
].join(' ');

const COMIC_DRAMA_ITEMS = [
  {
    id: 'comic-ancient-real',
    n: '古风真人',
    tag: '漫剧',
    texture: '汉服 / 灯影 / 真人剧照',
    preview: './style-library/comic-ancient-real.png',
    textureImage: './style-library/comic-ancient-real.png',
    prompt: comicDramaPrompt('Visual style: realistic Chinese period live-action drama still. Use elegant hanfu, palace corridors, rain-wet stone, lantern rim light, cool moonlight, shallow depth of field, premium costume-drama cinematography, restrained skin retouching, and romantic suspense. Avoid modern objects, plastic skin, cheap cosplay styling, celebrity likeness, text, logos, and watermarks.'),
  },
  {
    id: 'comic-ancient-2d',
    n: '古风2D',
    tag: '漫剧',
    texture: '线稿 / 绸缎 / 月光',
    preview: './style-library/comic-ancient-2d.png',
    textureImage: './style-library/comic-ancient-2d.png',
    prompt: comicDramaPrompt('Visual style: polished 2D Chinese period romance webtoon. Use expressive hanfu characters, elegant clean linework, controlled line weight, soft cel shading, moonlit bridges, palace rooftops, silk folds, gold ornaments, poetic composition, and high-end vertical-comic drama atmosphere. Avoid speech bubbles, generic anime clutter, muddy colors, text, logos, and watermarks.'),
  },
  {
    id: 'comic-ancient-3d',
    n: '古风3D',
    tag: '漫剧',
    texture: '丝绸 / 玉石 / 体积光',
    preview: './style-library/comic-ancient-3d.png',
    textureImage: './style-library/comic-ancient-3d.png',
    prompt: comicDramaPrompt('Visual style: premium stylized 3D Chinese fantasy drama. Use refined semi-real characters, flowing hanfu, palace stairs, floating petals, carved jade, lacquered wood, gold filigree, volumetric sunset light, physically plausible silk materials, and elegant romantic scale. Avoid toy-like proportions, plastic skin, low-poly detail, text, logos, and watermarks.'),
  },
  {
    id: 'comic-urban-real',
    n: '都市真人',
    tag: '漫剧',
    texture: '雨夜 / 西装 / 城市玻璃',
    preview: './style-library/comic-urban-real.png',
    textureImage: './style-library/comic-urban-real.png',
    prompt: comicDramaPrompt('Visual style: realistic modern urban live-action drama. Use glass elevator lobbies, rainy streets, office practical lights, suit and coat fabrics, city reflections, restrained emotion, natural skin texture, shallow depth of field, and streaming-series cinematography. Avoid stock-photo posing, exaggerated glamour retouching, brand marks, celebrity likeness, text, logos, and watermarks.'),
  },
  {
    id: 'comic-urban-semi-3d',
    n: '都市仿真人3D',
    tag: '漫剧',
    texture: '仿真皮肤 / 玻璃 / 夜景',
    preview: './style-library/comic-urban-semi-3d.png',
    textureImage: './style-library/comic-urban-semi-3d.png',
    prompt: comicDramaPrompt('Visual style: premium semi-realistic 3D modern drama. Use realistic adult proportions, refined facial expressions, high-rise balconies, rain-wet city glass, satin fabric, soft face lighting, realistic skin shader, subtle pores, controlled specular highlights, and polished animated-drama still quality. Avoid plastic doll skin, stiff posing, toy-like faces, text, logos, and watermarks.'),
  },
  {
    id: 'comic-urban-romance',
    n: '都市言情',
    tag: '漫剧',
    texture: '玫瑰 / 雨痕 / 暖光',
    preview: './style-library/comic-urban-romance.png',
    textureImage: './style-library/comic-urban-romance.png',
    prompt: comicDramaPrompt('Visual style: glossy urban romance web-drama still. Use rainy cafe windows, umbrellas, soft backlight, intimate eye contact, rose-petal accents, warm bokeh, tender tension, clean cover-like composition, and premium romance lighting. Avoid cheesy poster text, overdone filters, brand marks, celebrity likeness, logos, and watermarks.'),
  },
  {
    id: 'comic-clear-jp-2d',
    n: '新海城2D',
    tag: '漫剧',
    texture: '天空 / 水光 / 清透色',
    preview: './style-library/comic-clear-jp-2d.png',
    textureImage: './style-library/comic-clear-jp-2d.png',
    prompt: comicDramaPrompt('Visual style: original luminous 2D Japanese animated film atmosphere. Use huge skies after rain, reflective puddles, pedestrian bridges, clean linework, delicate light bloom, emotional distance between characters, transparent blue gradients, and bittersweet cinematic realism. Do not imitate any named artist exactly. Avoid existing IP character likeness, speech bubbles, text, logos, and watermarks.'),
  },
  {
    id: 'comic-flat-2d',
    n: '平面2D插画',
    tag: '漫剧',
    texture: '色块 / 网点 / 纸纹',
    preview: './style-library/comic-flat-2d.png',
    textureImage: './style-library/comic-flat-2d.png',
    prompt: comicDramaPrompt('Visual style: contemporary flat 2D comic illustration. Use clean silhouettes, graphic color blocks, vector-like edges, risograph grain, halftone texture, deliberate negative space, clear emotional staging, modern interiors or rooftops, and poster-like composition. Avoid photoreal rendering, noisy gradients, speech bubbles, text, logos, and watermarks.'),
  },
];

const GENERAL_STYLE_ITEMS = [
  {
    id: 'warm-film',
    n: '暖调胶片',
    tag: '摄影',
    texture: '颗粒 / 漏光 / 柔雾',
    preview: './style-library/warm-film.png',
    textureImage: './style-library/warm-film.png',
    prompt: visualMethodPrompt('Visual style: warm cinematic 35mm film photography. Use camera-specific realism cues such as 35mm lens feel, shallow depth of field, soft halation around highlights, fine organic grain, golden-hour backlight, natural skin tones, gentle lens bloom, low-contrast shadows, subtle light leaks, and tactile analog finish. Avoid over-sharpened digital HDR, plastic skin, flat lighting, visible text, logos, and watermarks.'),
  },
  {
    id: 'premium-studio',
    n: '高级棚拍',
    tag: '商业',
    texture: '金属 / 亚克力 / 干净反射',
    preview: './style-library/premium-studio.png',
    textureImage: './style-library/premium-studio.png',
    prompt: visualMethodPrompt('Visual style: premium commercial studio photography. Use controlled key light, rim light, negative fill, crisp specular highlights, clean acrylic or brushed-metal surfaces, refined product composition, soft shadow grounding, disciplined reflections, high-end color management, and luxury catalog polish. Avoid clutter, cheap plastic reflections, noisy backgrounds, text, logos, and watermarks.'),
  },
  {
    id: 'ink-wash',
    n: '水墨留白',
    tag: '国风',
    texture: '宣纸 / 墨晕 / 矿物色',
    preview: './style-library/ink-wash.png',
    textureImage: './style-library/ink-wash.png',
    prompt: visualMethodPrompt('Visual style: Chinese ink wash painting on rice paper. Use elegant negative space, soft ink diffusion, dry-brush edges, controlled blank areas, muted mineral greens, warm paper fiber, misty atmospheric depth, layered mountain silhouettes, poetic asymmetry, and restrained composition. Avoid glossy digital rendering, heavy saturation, hard cartoon outlines, text, seals, logos, and watermarks unless explicitly requested.'),
  },
  {
    id: 'clear-anime',
    n: '清透动画',
    tag: '插画',
    texture: '蓝天 / 水光 / 干净线条',
    preview: './style-library/clear-anime.png',
    textureImage: './style-library/clear-anime.png',
    prompt: visualMethodPrompt('Visual style: bright cinematic anime background art. Use clear summer sky, luminous water reflections, clean linework, soft cloud shapes, gentle cel-shaded forms, transparent color layers, controlled atmospheric perspective, and vivid but airy palettes. Avoid muddy shadows, excessive texture, realistic lens noise, text, logos, and watermarks.'),
  },
  {
    id: 'neon-cyber',
    n: '霓虹赛博',
    tag: '科幻',
    texture: '玻璃 / 雨夜 / 霓虹反射',
    preview: './style-library/neon-cyber.png',
    textureImage: './style-library/neon-cyber.png',
    prompt: visualMethodPrompt('Visual style: cyberpunk neon city at night. Use magenta and cyan lighting, wet glass reflections, rainy atmosphere, high contrast silhouettes, glowing signage-like color blocks without readable text, futuristic materials, volumetric haze, reflective pavement, and cinematic depth. Avoid flat daylight, beige palettes, low-detail backgrounds, readable text, logos, and watermarks.'),
  },
  {
    id: 'dark-fantasy',
    n: '暗黑史诗',
    tag: '概念',
    texture: '油画 / 石材 / 月光',
    preview: './style-library/dark-fantasy.png',
    textureImage: './style-library/dark-fantasy.png',
    prompt: visualMethodPrompt('Visual style: dark fantasy cinematic oil painting. Use moonlit architecture, dramatic chiaroscuro, painterly brush texture, weathered stone, muted crimson accents, heroic scale, volumetric fog, deep atmospheric perspective, and readable silhouette design. Avoid generic game UI, cartoon colors, flat lighting, readable text, logos, and watermarks.'),
  },
  {
    id: 'clay-soft',
    n: '软萌黏土',
    tag: '三维',
    texture: '黏土 / 毛毡 / 手作压痕',
    preview: './style-library/clay-soft.png',
    textureImage: './style-library/clay-soft.png',
    prompt: visualMethodPrompt('Visual style: soft handcrafted clay miniature. Use rounded forms, pastel clay surfaces, subtle fingerprints, felt-like props, cozy tabletop scale, soft diffused studio light, shallow depth of field, miniature set dressing, and stop-motion charm. Avoid hard metal surfaces, hyperreal skin, harsh contrast, text, logos, and watermarks.'),
  },
  {
    id: 'designer-toy',
    n: '潮玩手办',
    tag: '潮流',
    texture: '搪胶 / 亮面 / 色块',
    preview: './style-library/designer-toy.png',
    textureImage: './style-library/designer-toy.png',
    prompt: visualMethodPrompt('Visual style: collectible designer toy art direction. Use glossy vinyl material, bold color blocking, toy-like proportions, premium display lighting, clean silhouettes, molded plastic texture, crisp studio reflections, and shelf-ready product staging. Avoid licensed characters, brand marks, cheap toy clutter, text, logos, and watermarks.'),
  },
  {
    id: 'minimal-poster',
    n: '极简海报',
    tag: '平面',
    texture: '纸张 / 网点 / 几何',
    preview: './style-library/minimal-poster.png',
    textureImage: './style-library/minimal-poster.png',
    prompt: visualMethodPrompt('Visual style: minimal editorial poster design. Use clean geometric composition, strong negative space, refined flat shapes, precise visual hierarchy, subtle paper grain, risograph-like ink texture, balanced asymmetry, and restrained high-contrast accents. Avoid readable typography unless requested, busy decoration, photoreal clutter, logos, and watermarks.'),
  },
  {
    id: 'documentary-photo',
    n: '纪实摄影',
    tag: '现实',
    texture: '自然光 / 胶片颗粒 / 生活质感',
    preview: './style-library/documentary-photo.png',
    textureImage: './style-library/documentary-photo.png',
    prompt: visualMethodPrompt('Visual style: natural documentary photography. Use candid composition, available window light, realistic skin and material texture, 50mm editorial framing, muted real-world colors, quiet observational mood, authentic environmental detail, imperfect lived-in surfaces, and believable camera perspective. Avoid stock-photo staging, glamour retouching, artificial HDR, text, logos, and watermarks.'),
  },
  {
    id: 'pixel-game',
    n: '像素游戏',
    tag: '游戏',
    texture: '像素 / 抖动 / 小场景',
    preview: './style-library/pixel-game.png',
    textureImage: './style-library/pixel-game.png',
    prompt: visualMethodPrompt('Visual style: polished pixel-art game scene. Use crisp pixel grid, limited palette discipline, isometric or side-view clarity, readable silhouettes, cozy environmental storytelling, controlled dithering, sprite-like edges, tileable material logic, and warm game lighting. Avoid blurry scaling, smooth airbrush gradients, modern UI overlays, text, logos, and watermarks.'),
  },
  {
    id: 'watercolor-storybook',
    n: '水彩绘本',
    tag: '绘本',
    texture: '水彩 / 纸纹 / 颜料沉淀',
    preview: './style-library/watercolor-storybook.png',
    textureImage: './style-library/watercolor-storybook.png',
    prompt: visualMethodPrompt('Visual style: hand-painted watercolor storybook illustration. Use soft pigment granulation, visible paper texture, delicate pencil underdrawing, warm narrative lighting, gentle color bleeding, cozy scene design, tender composition, and airy negative space. Avoid glossy digital finish, harsh outlines, neon saturation, text, logos, and watermarks.'),
  },
];

const attachGroup = (group, item) => ({
  ...item,
  group: group.title,
  mode: group.id,
});

export const STYLE_GROUPS = [
  { id: 'comic-drama', title: '漫剧专用', summary: '分镜、人物一致性、剧情镜头', items: COMIC_DRAMA_ITEMS },
  { id: 'general', title: '通用', summary: '摄影、插画、3D、平面风格', items: GENERAL_STYLE_ITEMS },
].map((group) => ({
  ...group,
  items: group.items.map((item) => attachGroup(group, item)),
}));

export const STYLE_COUNT = STYLE_GROUPS.reduce((sum, group) => sum + group.items.length, 0);

const comicGroup = STYLE_GROUPS.find((group) => group.id === 'comic-drama');
const generalGroup = STYLE_GROUPS.find((group) => group.id === 'general');

export const STYLE_PRESET_ITEMS = [
  generalGroup?.items[0],
  ...(comicGroup?.items || []),
  ...(generalGroup?.items.slice(1) || []),
].filter(Boolean);
