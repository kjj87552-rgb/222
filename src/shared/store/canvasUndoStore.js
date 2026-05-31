import { createStore } from './createStore.js';
import { canvasActions, canvasStore } from './canvasStore.js';
import { uiActions, uiStore } from './uiStore.js';

export const MAX_UNDO_STEPS = 10;

export const canvasUndoStore = createStore({
  canUndo: false,
  depth: 0,
  lastType: '',
});

let undoStack = [];
let restoring = false;
let transactionDepth = 0;

function cloneValue(value) {
  if (value == null) return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function graphString(value) {
  return JSON.stringify(value ?? null);
}

function currentProjectId() {
  const state = canvasStore.getState();
  return state.projectId || state.project?.id || 'local-default';
}

function emitUndoState() {
  const last = undoStack[undoStack.length - 1] || null;
  canvasUndoStore.setState({
    canUndo: undoStack.length > 0,
    depth: undoStack.length,
    lastType: last?.type || '',
  });
}

function hasGraphSnapshotChanged(before, after) {
  if (!before || !after) return false;
  return (
    before.projectId !== after.projectId
    || graphString(before.nodes) !== graphString(after.nodes)
    || graphString(before.edges) !== graphString(after.edges)
  );
}

function pushUndoRecord(record) {
  undoStack = [...undoStack, record].slice(-MAX_UNDO_STEPS);
  emitUndoState();
}

function restoreSnapshot(snapshot) {
  canvasActions.setNodes(cloneValue(snapshot.nodes || []));
  canvasActions.setEdges(cloneValue(snapshot.edges || []));
  uiActions.setSelection(cloneValue(snapshot.selection || []));
}

function isThenable(value) {
  return Boolean(value && typeof value.then === 'function');
}

export function shouldUseNativeUndoTarget(target) {
  if (!target || typeof target !== 'object') return false;
  const element = target.nodeType === 1 ? target : target.parentElement;
  if (!element || typeof element.closest !== 'function') return false;
  const tagName = String(element.tagName || '').toLowerCase();
  return (
    tagName === 'input'
    || tagName === 'textarea'
    || tagName === 'select'
    || element.isContentEditable === true
    || Boolean(element.closest('[contenteditable="true"]'))
  );
}

export const canvasUndoActions = {
  captureSnapshot: () => {
    const canvasState = canvasStore.getState();
    const uiState = uiStore.getState();
    return {
      projectId: currentProjectId(),
      nodes: cloneValue(canvasState.nodes || []),
      edges: cloneValue(canvasState.edges || []),
      selection: cloneValue(uiState.selection || []),
    };
  },

  run: (type, fn) => {
    if (typeof fn !== 'function') return undefined;
    if (restoring) return fn();
    if (transactionDepth > 0) return fn();

    const before = canvasUndoActions.captureSnapshot();
    const commit = () => {
      const after = canvasUndoActions.captureSnapshot();
      if (!hasGraphSnapshotChanged(before, after)) return;
      pushUndoRecord({
        type: String(type || 'edit'),
        before,
        after,
        createdAt: new Date().toISOString(),
      });
    };

    transactionDepth += 1;
    let result;
    try {
      result = fn();
    } catch (error) {
      transactionDepth -= 1;
      throw error;
    }
    if (isThenable(result)) {
      return result.then((value) => {
        try {
          commit();
          return value;
        } finally {
          transactionDepth -= 1;
        }
      }, (error) => {
        transactionDepth -= 1;
        throw error;
      });
    }
    try {
      commit();
      return result;
    } finally {
      transactionDepth -= 1;
    }
  },

  undo: () => {
    if (!undoStack.length) {
      emitUndoState();
      return false;
    }

    const record = undoStack[undoStack.length - 1];
    if (record?.before?.projectId !== currentProjectId()) {
      undoStack = [];
      emitUndoState();
      return false;
    }

    undoStack = undoStack.slice(0, -1);
    restoring = true;
    try {
      restoreSnapshot(record.before);
    } finally {
      restoring = false;
      emitUndoState();
    }
    return true;
  },

  clear: () => {
    if (!undoStack.length) {
      emitUndoState();
      return;
    }
    undoStack = [];
    emitUndoState();
  },

  canUndo: () => undoStack.length > 0,

  getUndoDepth: () => undoStack.length,
};
