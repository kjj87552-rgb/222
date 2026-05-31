export function shouldUseSelectedGenerationTarget({
  selectedNode,
  kind,
  count = 1,
  replaceTarget,
  isEmpty = false,
} = {}) {
  if (!selectedNode || selectedNode.type !== kind) return false;
  if (replaceTarget === false) return false;
  if (replaceTarget) return true;
  if (isEmpty) return true;
  return count === 1;
}
