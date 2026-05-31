import React, { useSyncExternalStore } from 'react';
import { createStore } from './createStore.js';
import { makeProject, DEFAULT_PROJECT_ID } from '../utils/asset.js';

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_RUNTIME = Object.freeze({});
const NODE_LAYOUT_KEYS = new Set(['x', 'y', 'w', 'h']);
const NODE_RUNTIME_KEYS = new Set([
  '_playing',
  'focusAnalysisJobId',
  'focusAnalysisProgress',
  'focusAnalysisStatus',
  'generating',
  'jobId',
  'jobStage',
  'progress',
]);
const NODE_LIVE_RUNTIME_KEYS = new Set([
  'composedPrompt',
  'error',
  'finalPrompt',
  'model',
  'modelId',
  'modelName',
  'prompt',
  'provider',
  'providerModelId',
  'systemPrompt',
  'tag',
  'workbenchModel',
]);
const NODE_LIVE_SETTINGS_KEYS = new Set([
  'error',
  'jobStage',
  'model',
  'modelId',
  'progress',
  'provider',
  'providerModelId',
]);
const NODE_RESULT_KEYS = new Set([
  'assetId',
  'assetPath',
  'audioSrc',
  'body',
  'duration',
  'focusAnalysis',
  'generatedText',
  'output',
  'poster',
  'shotGroups',
  'src',
  'storyboardPackage',
  'videoSrc',
  'waveform',
]);

function buildEdgesByNode(edges) {
  const map = new Map();
  for (const e of edges) {
    if (!map.has(e.from)) map.set(e.from, []);
    if (!map.has(e.to))   map.set(e.to,   []);
    map.get(e.from).push(e);
    map.get(e.to).push(e);
  }
  return map;
}

function buildNodeBuckets(nodes = []) {
  const nodeIds = [];
  const drawableNodeIds = [];
  const backgroundPanelNodeIds = [];
  const groupNodeIds = [];

  for (const node of nodes) {
    if (!node?.id) continue;
    nodeIds.push(node.id);
    if (node.type === 'background-panel') {
      backgroundPanelNodeIds.push(node.id);
    } else if (node.type === 'group') {
      groupNodeIds.push(node.id);
    } else {
      drawableNodeIds.push(node.id);
    }
  }

  return { nodeIds, drawableNodeIds, backgroundPanelNodeIds, groupNodeIds };
}

function isLayoutOnlyNodeChange(before, after) {
  if (before === after) return true;
  if (!before || !after || before.id !== after.id || before.type !== after.type) return false;
  const beforeKeys = Object.keys(before);
  const afterKeys = Object.keys(after);
  for (const key of beforeKeys) {
    if (Object.is(before[key], after[key])) continue;
    if (!NODE_LAYOUT_KEYS.has(key)) return false;
  }
  for (const key of afterKeys) {
    if (Object.prototype.hasOwnProperty.call(before, key)) continue;
    if (Object.is(before[key], after[key])) continue;
    if (!NODE_LAYOUT_KEYS.has(key)) return false;
  }
  return true;
}

export function isLayoutOnlyNodesChange(before = [], after = []) {
  if (before === after) return true;
  if (!Array.isArray(before) || !Array.isArray(after)) return false;
  if (before.length !== after.length) return false;
  for (let index = 0; index < before.length; index += 1) {
    if (!isLayoutOnlyNodeChange(before[index], after[index])) return false;
  }
  return true;
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value || {}, key);
}

function isPlainRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function shallowRecordEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (!isPlainRecord(a) || !isPlainRecord(b)) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((key) => Object.is(a[key], b[key]));
}

function shallowNodeEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (!isPlainRecord(a) || !isPlainRecord(b)) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((key) => {
    if (key === 'settings' && isPlainRecord(a.settings) && isPlainRecord(b.settings)) {
      return shallowRecordEqual(a.settings, b.settings);
    }
    return Object.is(a[key], b[key]);
  });
}

function isLiveStatus(value) {
  return ['queued', 'running', 'processing', 'generating'].includes(String(value || '').toLowerCase());
}

function isTerminalRuntimeClearPatch(patch) {
  return patch?.generating === false || patch?.jobId === null || patch?.jobStage === '';
}

function hasNonEmptyRuntimeError(patch = {}) {
  const direct = typeof patch.error === 'string' ? patch.error.trim() : patch.error;
  const settingsError = isPlainRecord(patch.settings)
    ? (typeof patch.settings.error === 'string' ? patch.settings.error.trim() : patch.settings.error)
    : '';
  return Boolean(direct || settingsError);
}

function isLiveRuntimePatch(patch = {}, current = {}) {
  if (patch.generating === true || current.generating === true) return true;
  if (isLiveStatus(patch.status) || isLiveStatus(patch.focusAnalysisStatus)) return true;
  return false;
}

function splitSettingsRuntime(settings, live) {
  if (!isPlainRecord(settings) || !live) return { persistent: settings, runtime: undefined };
  let changed = false;
  const persistent = {};
  const runtime = {};
  Object.entries(settings).forEach(([key, value]) => {
    if (NODE_LIVE_SETTINGS_KEYS.has(key)) {
      runtime[key] = value;
      changed = true;
    } else {
      persistent[key] = value;
    }
  });
  if (!changed) return { persistent: settings, runtime: undefined };
  return {
    persistent: Object.keys(persistent).length ? persistent : undefined,
    runtime,
  };
}

function splitRuntimeFromNodePatch(patch = {}, current = {}) {
  if (!isPlainRecord(patch)) return { persistentPatch: patch, runtimePatch: null };
  const live = isLiveRuntimePatch(patch, current);
  const hasResultFields = Object.keys(patch).some((key) => NODE_RESULT_KEYS.has(key));
  const persistentPatch = {};
  const runtimePatch = {};
  let hasPersistent = false;
  let hasRuntime = false;

  Object.entries(patch).forEach(([key, value]) => {
    if (NODE_RUNTIME_KEYS.has(key)) {
      runtimePatch[key] = value;
      hasRuntime = true;
      return;
    }
    if (key === 'error' && hasResultFields && (value == null || value === '')) {
      persistentPatch[key] = value;
      hasPersistent = true;
      return;
    }
    if (key === 'error' && (live || isTerminalRuntimeClearPatch(patch)) && (value == null || value === '')) {
      runtimePatch[key] = value;
      hasRuntime = true;
      return;
    }
    if (key === 'settings') {
      const split = splitSettingsRuntime(value, live);
      if (split.runtime) {
        runtimePatch.settings = split.runtime;
        hasRuntime = true;
      }
      if (split.persistent !== undefined) {
        persistentPatch.settings = split.persistent;
        hasPersistent = true;
      }
      return;
    }
    if (live && !hasResultFields && NODE_LIVE_RUNTIME_KEYS.has(key) && !NODE_RESULT_KEYS.has(key)) {
      runtimePatch[key] = value;
      hasRuntime = true;
      return;
    }
    persistentPatch[key] = value;
    hasPersistent = true;
  });

  return {
    persistentPatch: hasPersistent ? persistentPatch : null,
    runtimePatch: hasRuntime ? runtimePatch : null,
  };
}

function applyPersistentPatch(node, patch) {
  if (!isPlainRecord(patch) || !Object.keys(patch).length) return node;
  let changed = false;
  const next = { ...node };
  Object.entries(patch).forEach(([key, value]) => {
    if (key === 'settings' && isPlainRecord(value) && isPlainRecord(node.settings)) {
      const mergedSettings = { ...node.settings, ...value };
      if (!shallowRecordEqual(node.settings, mergedSettings)) {
        next.settings = mergedSettings;
        changed = true;
      }
      return;
    }
    if (!Object.is(node[key], value)) {
      next[key] = value;
      changed = true;
    }
  });
  return changed ? next : node;
}

function shouldClearRuntimeAfterPatch(patch = {}) {
  if (!isPlainRecord(patch)) return false;
  if (Object.keys(patch).some((key) => NODE_RESULT_KEYS.has(key))) return true;
  if (patch.generating === true || isLiveStatus(patch.status) || isLiveStatus(patch.focusAnalysisStatus)) return false;
  if (isTerminalRuntimeClearPatch(patch)) return !hasNonEmptyRuntimeError(patch);
  if (hasOwn(patch, 'error')) return !hasNonEmptyRuntimeError(patch);
  return false;
}

function stripRuntimeFromLiveNode(node) {
  if (!isPlainRecord(node)) return { node, runtimePatch: null };
  const live = Boolean(node.generating === true || isLiveStatus(node.status) || isLiveStatus(node.focusAnalysisStatus));
  const shouldClear = hasOwn(node, 'generating') && node.generating === false
    && (hasOwn(node, 'progress') || hasOwn(node, 'jobId') || hasOwn(node, 'jobStage'));
  if (!live && !shouldClear) return { node, runtimePatch: null };

  const runtimePatch = {};
  const persistentNode = {};
  let hasRuntime = false;
  let changed = false;

  Object.entries(node).forEach(([key, value]) => {
    if (NODE_RUNTIME_KEYS.has(key)) {
      runtimePatch[key] = value;
      hasRuntime = true;
      changed = true;
      return;
    }
    if (key === 'error' && (live || shouldClear) && (value == null || value === '')) {
      runtimePatch[key] = value;
      hasRuntime = true;
      changed = true;
      return;
    }
    if (key === 'settings') {
      const split = splitSettingsRuntime(value, live);
      if (split.runtime) {
        runtimePatch.settings = split.runtime;
        hasRuntime = true;
        changed = true;
      }
      if (split.persistent !== undefined) persistentNode.settings = split.persistent;
      return;
    }
    if (live && NODE_LIVE_RUNTIME_KEYS.has(key) && !NODE_RESULT_KEYS.has(key)) {
      runtimePatch[key] = value;
      hasRuntime = true;
      changed = true;
      return;
    }
    persistentNode[key] = value;
  });

  return {
    node: changed ? persistentNode : node,
    runtimePatch: hasRuntime ? runtimePatch : null,
  };
}

function reuseStableNodes(previous = [], next = []) {
  if (!Array.isArray(previous) || !Array.isArray(next) || previous.length !== next.length) return next;
  let changed = false;
  const reused = next.map((node, index) => {
    const previousNode = previous[index];
    if (shallowNodeEqual(previousNode, node)) return previousNode;
    changed = true;
    return node;
  });
  return changed ? reused : previous;
}

let nodeRuntimeById = new Map();
const nodeRuntimeListenersById = new Map();

function runtimeIsEmpty(runtime) {
  return !isPlainRecord(runtime) || Object.keys(runtime).length === 0;
}

function runtimeRecordsEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (!isPlainRecord(a) || !isPlainRecord(b)) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((key) => {
    if (key === 'settings') return shallowRecordEqual(a.settings, b.settings);
    return Object.is(a[key], b[key]);
  });
}

function emitNodeRuntime(nodeId) {
  const listeners = nodeRuntimeListenersById.get(nodeId);
  if (!listeners) return;
  Array.from(listeners).forEach((listener) => listener());
}

function getNodeRuntimeSnapshot(nodeId) {
  return nodeRuntimeById.get(nodeId) || EMPTY_RUNTIME;
}

function subscribeNodeRuntime(nodeId, listener) {
  if (!nodeId) return () => {};
  const listeners = nodeRuntimeListenersById.get(nodeId) || new Set();
  listeners.add(listener);
  nodeRuntimeListenersById.set(nodeId, listeners);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) nodeRuntimeListenersById.delete(nodeId);
  };
}

function normalizeRuntimePatch(previous = EMPTY_RUNTIME, patch = {}) {
  const next = {
    ...(previous || {}),
    ...(patch || {}),
    settings: patch?.settings
      ? { ...(previous.settings || {}), ...patch.settings }
      : previous.settings,
  };
  if (patch?.generating === false || patch?.jobId === null) {
    delete next.generating;
    delete next.progress;
    delete next.jobId;
    delete next.jobStage;
    if (next.error == null || next.error === '') delete next.error;
  }
  Object.keys(next).forEach((key) => {
    if (next[key] === undefined || next[key] === null || next[key] === '') delete next[key];
  });
  return next;
}

function setNodeRuntime(nodeId, patch) {
  if (!nodeId || !isPlainRecord(patch)) return;
  const previous = getNodeRuntimeSnapshot(nodeId);
  const next = normalizeRuntimePatch(previous, patch);
  if (runtimeIsEmpty(next)) {
    if (!nodeRuntimeById.has(nodeId)) return;
    nodeRuntimeById.delete(nodeId);
    emitNodeRuntime(nodeId);
    return;
  }
  if (runtimeRecordsEqual(previous, next)) return;
  nodeRuntimeById.set(nodeId, next);
  emitNodeRuntime(nodeId);
}

function clearNodeRuntime(nodeId) {
  if (!nodeId || !nodeRuntimeById.has(nodeId)) return;
  nodeRuntimeById.delete(nodeId);
  emitNodeRuntime(nodeId);
}

function clearAllNodeRuntime() {
  const ids = new Set([...nodeRuntimeById.keys(), ...nodeRuntimeListenersById.keys()]);
  nodeRuntimeById = new Map();
  ids.forEach(emitNodeRuntime);
}

function applyRuntimePatches(patches = []) {
  patches.forEach(({ id, runtimePatch }) => {
    if (runtimePatch) setNodeRuntime(id, runtimePatch);
  });
}

function prepareNodesForCanvasState(nodes = [], previousNodes = []) {
  const runtimePatches = [];
  const stripped = nodes.map((node) => {
    const { node: persistentNode, runtimePatch } = stripRuntimeFromLiveNode(node);
    if (runtimePatch) runtimePatches.push({ id: node.id, runtimePatch });
    return persistentNode;
  });
  const stableNodes = reuseStableNodes(previousNodes, stripped);
  return { nodes: stableNodes, runtimePatches };
}

function clearRemovedNodeRuntime(previousNodes = [], nextNodes = []) {
  const nextIds = new Set(nextNodes.map((node) => node?.id).filter(Boolean));
  previousNodes.forEach((node) => {
    if (node?.id && !nextIds.has(node.id)) clearNodeRuntime(node.id);
  });
}

export function mergeNodeRuntime(node, runtime = getNodeRuntimeSnapshot(node?.id)) {
  if (!node || runtimeIsEmpty(runtime)) return node;
  const { settings, ...runtimeFields } = runtime;
  return {
    ...node,
    ...runtimeFields,
    settings: settings ? { ...(node.settings || {}), ...settings } : node.settings,
  };
}

export const nodeRuntimeActions = {
  getNodeRuntime: getNodeRuntimeSnapshot,
  updateNodeRuntime: setNodeRuntime,
  clearNodeRuntime,
  clearAllNodeRuntime,
};

const INITIAL_NODE_BUCKETS = buildNodeBuckets([]);

export const canvasStore = createStore({
  projectId:   DEFAULT_PROJECT_ID,
  project:     makeProject("未命名", DEFAULT_PROJECT_ID),
  nodes:       [],
  edges:       [],
  nodesById:   new Map(),
  edgesByNode: buildEdgesByNode([]),
  ...INITIAL_NODE_BUCKETS,
  nodeDataVersion: 0,
  nodeLayoutVersion: 0,
});

// Hooks (preferred API)
export const useProject      = () => canvasStore.useSelector((s) => s.project);
export const useNodes        = () => canvasStore.useSelector((s) => s.nodes);
export const useEdges        = () => canvasStore.useSelector((s) => s.edges);
export const useNodeIds      = () => canvasStore.useSelector((s) => s.nodeIds, Object.is);
export const useDrawableNodeIds = () => canvasStore.useSelector((s) => s.drawableNodeIds, Object.is);
export const useBackgroundPanelNodeIds = () =>
  canvasStore.useSelector((s) => s.backgroundPanelNodeIds, Object.is);
export const useGroupNodeIds = () => canvasStore.useSelector((s) => s.groupNodeIds, Object.is);
export const useNodesById    = () => canvasStore.useSelector((s) => s.nodesById, Object.is);
export const useNodeById     = (id) => canvasStore.useSelector((s) => s.nodesById.get(id));
export const useNodeRuntime  = (id) => {
  const subscribe = React.useCallback((listener) => subscribeNodeRuntime(id, listener), [id]);
  const getSnapshot = React.useCallback(() => getNodeRuntimeSnapshot(id), [id]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
export const useEdgesForNode = (id) =>
  canvasStore.useSelector((s) => s.edgesByNode.get(id) || EMPTY_ARRAY);
export const useIncomingNodesForNode = (id) =>
  canvasStore.useSelector((s) => {
    const edges = s.edgesByNode.get(id) || EMPTY_ARRAY;
    if (!edges.length) return EMPTY_ARRAY;
    const incoming = [];
    for (const edge of edges) {
      if (edge?.to !== id) continue;
      const source = s.nodesById.get(edge.from);
      if (source) incoming.push(source);
    }
    return incoming.length ? incoming : EMPTY_ARRAY;
  });
export const useProjectId    = () => canvasStore.useSelector((s) => s.projectId);
export const useNodeDataVersion = () => canvasStore.useSelector((s) => s.nodeDataVersion);
export const useNodeLayoutVersion = () => canvasStore.useSelector((s) => s.nodeLayoutVersion);

// Actions
export const canvasActions = {
  setProject: (u) => canvasStore.setState((s) => ({
    ...s, project: typeof u === 'function' ? u(s.project) : u,
  })),

  setNodes: (u) => canvasStore.setState((s) => {
    const rawNext = typeof u === 'function' ? u(s.nodes) : u;
    if (rawNext === s.nodes) return s;
    const prepared = prepareNodesForCanvasState(rawNext, s.nodes);
    const next = prepared.nodes;
    applyRuntimePatches(prepared.runtimePatches);
    clearRemovedNodeRuntime(s.nodes, next);
    if (next === s.nodes) return s;
    const layoutOnly = isLayoutOnlyNodesChange(s.nodes, next);
    const nodeBuckets = layoutOnly
      ? {
          nodeIds: s.nodeIds,
          drawableNodeIds: s.drawableNodeIds,
          backgroundPanelNodeIds: s.backgroundPanelNodeIds,
          groupNodeIds: s.groupNodeIds,
        }
      : buildNodeBuckets(next);
    const nodeDataVersion = layoutOnly
      ? s.nodeDataVersion
      : s.nodeDataVersion + 1;
    const nodeLayoutVersion = s.nodeLayoutVersion + 1;
    return {
      ...s,
      nodes: next,
      nodesById: new Map(next.map((n) => [n.id, n])),
      ...nodeBuckets,
      nodeDataVersion,
      nodeLayoutVersion,
    };
  }),

  setEdges: (u) => canvasStore.setState((s) => {
    const next = typeof u === 'function' ? u(s.edges) : u;
    if (next === s.edges) return s;
    return { ...s, edges: next, edgesByNode: buildEdgesByNode(next) };
  }),

  updateNode: (nodeId, patch) => {
    const current = canvasStore.getState().nodesById.get(nodeId);
    if (!current) return;
    const currentWithRuntime = mergeNodeRuntime(current);
    const rawPatch = typeof patch === 'function' ? patch(currentWithRuntime) : patch;
    if (!isPlainRecord(rawPatch) || !Object.keys(rawPatch).length) return;
    const { persistentPatch, runtimePatch } = splitRuntimeFromNodePatch(rawPatch, currentWithRuntime);
    if (runtimePatch) setNodeRuntime(nodeId, runtimePatch);
    if (!persistentPatch || !Object.keys(persistentPatch).length) return;
    canvasActions.setNodes((nodes) => {
      let changed = false;
      const next = nodes.map((node) => {
        if (node.id !== nodeId) return node;
        const updated = applyPersistentPatch(node, persistentPatch);
        if (updated !== node) changed = true;
        return updated;
      });
      return changed ? next : nodes;
    });
    if (shouldClearRuntimeAfterPatch(rawPatch)) clearNodeRuntime(nodeId);
  },

  replaceAll: ({ project, nodes, edges }) =>
    canvasStore.setState((s) => {
      clearAllNodeRuntime();
      const prepared = prepareNodesForCanvasState(nodes, []);
      applyRuntimePatches(prepared.runtimePatches);
      return {
      projectId:   project.id,
      project,
      nodes:       prepared.nodes,
      edges,
      nodesById:   new Map(prepared.nodes.map((n) => [n.id, n])),
      edgesByNode: buildEdgesByNode(edges),
      ...buildNodeBuckets(prepared.nodes),
      nodeDataVersion: s.nodeDataVersion + 1,
      nodeLayoutVersion: s.nodeLayoutVersion + 1,
      };
    }),

  reset: () => {
    clearAllNodeRuntime();
    canvasStore.setState((s) => ({
      projectId:   s.projectId,
      project:     makeProject("未命名", s.projectId),
      nodes:       [],
      edges:       [],
      nodesById:   new Map(),
      edgesByNode: buildEdgesByNode([]),
      ...buildNodeBuckets([]),
      nodeDataVersion: s.nodeDataVersion + 1,
      nodeLayoutVersion: s.nodeLayoutVersion + 1,
    }));
  },

  touchProject: () => canvasStore.setState((s) => ({
    ...s, project: { ...s.project, updatedAt: new Date().toISOString() },
  })),

  setActiveProject: (project, nodes = [], edges = []) =>
    canvasStore.setState((s) => {
      clearAllNodeRuntime();
      const prepared = prepareNodesForCanvasState(nodes, []);
      applyRuntimePatches(prepared.runtimePatches);
      return {
      projectId:   project.id,
      project,
      nodes:       prepared.nodes,
      edges,
      nodesById:   new Map(prepared.nodes.map((n) => [n.id, n])),
      edgesByNode: buildEdgesByNode(edges),
      ...buildNodeBuckets(prepared.nodes),
      nodeDataVersion: s.nodeDataVersion + 1,
      nodeLayoutVersion: s.nodeLayoutVersion + 1,
      };
    }),
};
