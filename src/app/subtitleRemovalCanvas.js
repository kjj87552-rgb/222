function finiteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanOutputTitle(value, fallback = '视频') {
  const text = String(value || '').trim() || fallback;
  return text.endsWith('去字幕') ? text : `${text} · 去字幕`;
}

export function createSubtitleRemovalResultGraph({
  sourceNode,
  payload = {},
  projectId,
  makeId,
}) {
  if (!sourceNode?.id) throw new Error('sourceNode is required');
  if (typeof makeId !== 'function') throw new Error('makeId is required');
  const resultNodeId = makeId('vsr');
  const sourceWidth = finiteNumber(sourceNode.w, 620);
  const sourceHeight = finiteNumber(sourceNode.h, 350);
  const title = cleanOutputTitle(payload.outputTitle, sourceNode.title || '视频');
  const videoWidth = finiteNumber(payload.videoWidth || sourceNode.videoWidth || sourceNode.settings?.videoWidth, 0);
  const videoHeight = finiteNumber(payload.videoHeight || sourceNode.videoHeight || sourceNode.settings?.videoHeight, 0);
  const node = {
    id: resultNodeId,
    type: 'video',
    x: finiteNumber(sourceNode.x, 0) + sourceWidth + 78,
    y: finiteNumber(sourceNode.y, 0),
    w: sourceWidth,
    h: sourceHeight,
    title,
    tag: '去字幕',
    generating: true,
    progress: 1,
    duration: sourceNode.duration || '00:00',
    model: '去字幕',
    sourceNodeId: sourceNode.id,
    videoWidth: videoWidth || undefined,
    videoHeight: videoHeight || undefined,
    settings: {
      ...(sourceNode.settings || {}),
      sourceNodeId: sourceNode.id,
      subtitleRemoval: {
        sourceNodeId: sourceNode.id,
        region: payload.region || payload.subtitleRegion || null,
      },
    },
  };
  const edge = {
    id: `evsr_${sourceNode.id}_${resultNodeId}`,
    from: sourceNode.id,
    to: resultNodeId,
  };
  return {
    node,
    edge,
    jobNodeId: resultNodeId,
    jobPayload: {
      ...payload,
      projectId,
      type: 'video.subtitle.remove',
      nodeId: resultNodeId,
      sourceNodeId: sourceNode.id,
      sourceVideoNodeId: sourceNode.id,
      outputTitle: title,
      _subtitleRemoval: true,
    },
  };
}
