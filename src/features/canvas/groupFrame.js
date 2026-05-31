const DEFAULT_GROUP_PADDING = 18;
const GROUP_FRAME_MIN_SIZE = Object.freeze({ w: 220, h: 140 });

const finite = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const isManualGroupFrame = (group) => (
  group?.boundsMode === 'manual'
  || group?.frameMode === 'manual'
  || group?.manualBounds === true
);

export function getGroupFrameBounds(group, nodes = [], pad = DEFAULT_GROUP_PADDING) {
  const members = (nodes || []).filter(Boolean);
  if (members.length < 2) return null;

  if (isManualGroupFrame(group)) {
    return {
      x: finite(group?.x),
      y: finite(group?.y),
      w: Math.max(GROUP_FRAME_MIN_SIZE.w, finite(group?.w, GROUP_FRAME_MIN_SIZE.w)),
      h: Math.max(GROUP_FRAME_MIN_SIZE.h, finite(group?.h, GROUP_FRAME_MIN_SIZE.h)),
      members,
    };
  }

  const x = Math.min(...members.map((node) => finite(node.x))) - pad;
  const y = Math.min(...members.map((node) => finite(node.y))) - pad;
  const maxX = Math.max(...members.map((node) => finite(node.x) + finite(node.w))) + pad;
  const maxY = Math.max(...members.map((node) => finite(node.y) + finite(node.h))) + pad;
  return { x, y, w: maxX - x, h: maxY - y, members };
}

export function createGroupFrameResizePatch(bounds, deltaW, deltaH, minSize = GROUP_FRAME_MIN_SIZE) {
  const minW = Math.max(1, finite(minSize?.w, GROUP_FRAME_MIN_SIZE.w));
  const minH = Math.max(1, finite(minSize?.h, GROUP_FRAME_MIN_SIZE.h));
  return {
    x: finite(bounds?.x),
    y: finite(bounds?.y),
    w: Math.max(minW, Math.round(finite(bounds?.w, minW) + finite(deltaW))),
    h: Math.max(minH, Math.round(finite(bounds?.h, minH) + finite(deltaH))),
    boundsMode: 'manual',
  };
}

export function getGroupRunnableMediaMembers(group, nodes = []) {
  const memberIds = Array.isArray(group?.memberIds) ? group.memberIds : [];
  const byId = new Map((nodes || []).filter(Boolean).map((node) => [node.id, node]));
  const ordered = memberIds
    .map((id) => byId.get(id))
    .filter((node) => (
      node
      && (node.type === 'image' || node.type === 'video')
      && !node.generating
    ));
  return [
    ...ordered.filter((node) => node.type === 'image'),
    ...ordered.filter((node) => node.type === 'video'),
  ];
}
