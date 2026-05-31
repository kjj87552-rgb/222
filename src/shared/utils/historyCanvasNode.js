import { historyKindOf, historyMediaSrc } from './history.js';

const typeLabel = (kind) => ({
  image: '图片',
  video: '视频',
  audio: '音频',
  text: '文本',
}[kind] || '素材');

function displayText(value, fallback = '') {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    return [
      value.displayName,
      value.modelName,
      value.name,
      value.id,
      value.title,
    ].find((item) => typeof item === 'string' && item.trim()) || fallback;
  }
  return fallback;
}

export function historyCanvasNodeModelLabel(item) {
  return displayText(item?.model)
    || displayText(item?.modelName)
    || displayText(item?.provider)
    || '';
}

export function createCanvasNodeFromHistoryItem(item, {
  index = 0,
  nodes = [],
  position = null,
} = {}) {
  const kind = historyKindOf(item);
  const src = historyMediaSrc(item);
  const title = item?.prompt || item?.title || `${typeLabel(kind)}历史`;
  const maxX = nodes.length ? Math.max(...nodes.map((node) => Number(node.x) || 0)) : 40;
  const baseX = position ? Number(position.x) || 0 : maxX + 48;
  const baseY = position ? Number(position.y) || 0 : 90;
  const x = baseX + index * 34;
  const y = baseY + index * 34;
  const id = `histnode_${Date.now().toString(36)}_${index}_${Math.random().toString(36).slice(2, 5)}`;
  const common = {
    id,
    type: kind === 'text' ? 'text' : kind,
    x,
    y,
    title,
    tag: '历史',
    prompt: item?.prompt || '',
    model: historyCanvasNodeModelLabel(item),
    assetId: item?.assetId || item?.targetId,
    assetPath: item?.assetPath || item?.path,
    historyId: item?.id,
  };
  if (kind === 'video') {
    return {
      ...common,
      w: 340,
      h: 320,
      videoSrc: src,
      poster: item?.poster || item?.posterUrl || item?.thumbnailUrl || null,
      duration: item?.duration || '历史',
    };
  }
  if (kind === 'audio') {
    return { ...common, w: 300, h: 220, audioSrc: src, waveform: true, duration: item?.duration || '历史' };
  }
  if (kind === 'text') {
    return { ...common, w: 340, h: 220, body: item?.text || item?.body || item?.prompt || title };
  }
  return { ...common, w: 340, h: 300, src };
}
