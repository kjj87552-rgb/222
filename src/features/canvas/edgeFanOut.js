function defaultEdgeId() {
  return `e${Math.random().toString(36).slice(2, 7)}`;
}

function edgeKey(from, to) {
  return `${from}->${to}`;
}

export function buildFanOutEdges({
  existingEdges = [],
  selectedNodeIds = [],
  drawableNodeIds = [],
  sourceNodeId,
  targetNodeId,
  direction = 'out',
  makeId = defaultEdgeId,
} = {}) {
  if (!sourceNodeId || !targetNodeId) return [];

  const validNodeIds = new Set(drawableNodeIds);
  const selectedIds = Array.isArray(selectedNodeIds) ? selectedNodeIds.filter(Boolean) : [];
  const shouldFanOut = selectedIds.length > 1 && selectedIds.includes(sourceNodeId);
  const candidates = shouldFanOut ? selectedIds : [sourceNodeId];
  const seen = new Set((Array.isArray(existingEdges) ? existingEdges : [])
    .map((edge) => edgeKey(edge?.from, edge?.to)));
  const nextEdges = [];

  candidates.forEach((candidateId) => {
    if (!candidateId || !validNodeIds.has(candidateId)) return;
    const from = direction === 'in' ? targetNodeId : candidateId;
    const to = direction === 'in' ? candidateId : targetNodeId;
    if (!from || !to || from === to) return;
    const key = edgeKey(from, to);
    if (seen.has(key)) return;
    seen.add(key);
    nextEdges.push({
      id: makeId({ from, to, sourceNodeId, targetNodeId, direction }),
      from,
      to,
    });
  });

  return nextEdges;
}
