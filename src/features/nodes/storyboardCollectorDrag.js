export const STORYBOARD_COLLECTOR_ITEM_MIME = 'application/x-libai-storyboard-item';

export function buildStoryboardCollectorDragPayload(collectorId, item) {
  return JSON.stringify({
    kind: 'storyboard-collector-item',
    collectorId,
    itemId: item?.id || '',
    title: item?.title || '',
  });
}

export function dataTransferHasStoryboardCollectorItem(dataTransfer) {
  return Array.from(dataTransfer?.types || []).includes(STORYBOARD_COLLECTOR_ITEM_MIME);
}

export function readStoryboardCollectorDragPayload(dataTransfer) {
  if (!dataTransferHasStoryboardCollectorItem(dataTransfer)) return null;
  try {
    const parsed = JSON.parse(dataTransfer.getData(STORYBOARD_COLLECTOR_ITEM_MIME) || '{}');
    if (parsed?.kind !== 'storyboard-collector-item') return null;
    if (!parsed.collectorId || !parsed.itemId) return null;
    return {
      collectorId: parsed.collectorId,
      itemId: parsed.itemId,
      title: parsed.title || '',
    };
  } catch {
    return null;
  }
}
