export function resolveEdgeNodes(edge, nodesById) {
  const lookup = nodesById instanceof Map ? nodesById : new Map();
  return {
    from: lookup.get(edge?.from) || null,
    to: lookup.get(edge?.to) || null,
  };
}
