import React, { useSyncExternalStore } from 'react';

export const MEDIA_VIEWPORT_OVERSCAN = 720;

let enabledNodeIds = new Set();
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function sameIdSet(a, b) {
  if (a === b) return true;
  if (!a || !b || a.size !== b.size) return false;
  for (const id of a) {
    if (!b.has(id)) return false;
  }
  return true;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isMediaNodeForViewportLoading(node) {
  if (!node?.id) return false;
  if (node.type === 'image') {
    return Boolean(node.src || node.url || node.assetUrl || node.imageUrl || node.assetId || node.assetPath || node.localPath || node.path);
  }
  if (node.type === 'video') {
    return Boolean(node.videoSrc || node.videoUrl || node.assetUrl || node.assetPath || node.poster || node.posterUrl);
  }
  return false;
}

function mediaViewportWorldRect(view, rootSize, overscan = MEDIA_VIEWPORT_OVERSCAN) {
  const width = Number(rootSize?.width) || 0;
  const height = Number(rootSize?.height) || 0;
  const scale = Number(view?.s) || 1;
  if (width <= 0 || height <= 0 || scale <= 0) return null;
  return {
    x: (Number(view?.x) || 0) - overscan,
    y: (Number(view?.y) || 0) - overscan,
    w: width / scale + overscan * 2,
    h: height / scale + overscan * 2,
  };
}

function nodeIntersectsRect(node, rect) {
  if (!node || !rect) return false;
  const x = Number(node.x) || 0;
  const y = Number(node.y) || 0;
  const w = Number(node.w) || 0;
  const h = Number(node.h) || 0;
  return (
    x + w >= rect.x
    && x <= rect.x + rect.w
    && y + h >= rect.y
    && y <= rect.y + rect.h
  );
}

export function getViewportMediaNodeIds(nodes, view, rootSize, selectedIds = [], overscan = MEDIA_VIEWPORT_OVERSCAN) {
  const rect = mediaViewportWorldRect(view, rootSize, overscan);
  if (!rect) return [];
  const selected = new Set((selectedIds || []).filter(Boolean));
  const ids = [];
  for (const node of nodes || []) {
    if (!isMediaNodeForViewportLoading(node)) continue;
    if (selected.has(node.id) || nodeIntersectsRect(node, rect)) ids.push(node.id);
  }
  return ids;
}

export const canvasMediaVisibilityActions = {
  setEnabledNodeIds(ids) {
    const next = new Set(enabledNodeIds);
    for (const id of ids || []) {
      if (id) next.add(id);
    }
    if (sameIdSet(enabledNodeIds, next)) return;
    enabledNodeIds = next;
    emit();
  },
  reset() {
    if (!enabledNodeIds.size) return;
    enabledNodeIds = new Set();
    emit();
  },
};

export function useCanvasMediaEnabled(nodeId, managed = false) {
  const getSnapshot = React.useCallback(() => {
    if (!managed) return true;
    return enabledNodeIds.has(nodeId);
  }, [managed, nodeId]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
