/* Infinite canvas with pan/zoom, nodes, edges */
import React from 'react';
import { canvasStyles } from './styles.js';
import { useViewport } from './useViewport.js';
import { ViewportContext } from './ViewportContext.js';
import {
  useEdges,
  useEdgesForNode,
  useProjectId,
  useNodeById,
  useNodeRuntime,
  useNodesById,
  useIncomingNodesForNode,
  useDrawableNodeIds,
  useBackgroundPanelNodeIds,
  useGroupNodeIds,
  mergeNodeRuntime,
  canvasActions,
  canvasStore,
} from '../../shared/store/canvasStore.js';
import { canvasUndoActions } from '../../shared/store/canvasUndoStore.js';
import { useSelection, useIsSelected, uiActions, uiStore } from '../../shared/store/uiStore.js';
import { MiniMap } from './MiniMap.jsx';
import { NodeRenderer } from '../nodes/NodeRenderer.jsx';
import { NodeWorkbench } from '../generator/NodeWorkbench.jsx';
import { buildFanOutEdges } from './edgeFanOut.js';
import { syncPromptRunnerOutputsForGenerationEdges } from '../nodes/promptRunnerUtils.js';
import {
  CanvasElementRegistryContext,
  createCanvasElementRegistry,
  useRegisterCanvasElement,
} from './canvasElementRegistry.js';
import {
  dataTransferHasStoryboardCollectorItem,
  readStoryboardCollectorDragPayload,
} from '../nodes/storyboardCollectorDrag.js';
import {
  createGroupFrameResizePatch,
  getGroupFrameBounds,
} from './groupFrame.js';
import {
  canvasMediaVisibilityActions,
  getViewportMediaNodeIds,
} from './canvasMediaVisibilityStore.js';

const GROUP_HANDLE_CENTER_OFFSET = -1;
const NODE_HANDLE_CENTER_OFFSET = 23;
const FULL_GRAPH_NODE_TYPES = new Set(["director-stage", "jianying-export"]);

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

function resolveCanvasEdgeAnchor(node, nodesById, side = "in") {
  if (isGroupNode(node)) {
    const memberIds = Array.isArray(node.memberIds) ? node.memberIds : [];
    const memberNodes = memberIds.map((memberId) => nodesById?.get(memberId)).filter(Boolean);
    const bounds = getGroupBounds(node, memberNodes);
    if (bounds) {
      return {
        x: side === "out"
          ? bounds.x + bounds.w + GROUP_HANDLE_CENTER_OFFSET
          : bounds.x + GROUP_HANDLE_CENTER_OFFSET,
        y: bounds.y + bounds.h / 2,
      };
    }
  }

  return {
    x: side === "out"
      ? node.x + node.w + NODE_HANDLE_CENTER_OFFSET
      : node.x - NODE_HANDLE_CENTER_OFFSET,
    y: node.y + node.h / 2,
  };
}

function resolveCanvasConnectableBounds(node, nodesById) {
  if (isGroupNode(node)) {
    const memberIds = Array.isArray(node.memberIds) ? node.memberIds : [];
    const memberNodes = memberIds.map((memberId) => nodesById?.get(memberId)).filter(Boolean);
    return getGroupBounds(node, memberNodes) || node;
  }
  return node;
}

const Edge = React.memo(function Edge({ id, from, to, dashed, onDelete }) {
  const a = useNodeById(from);
  const b = useNodeById(to);
  const nodesById = useNodesById();
  if (!a || !b) return null;
  const sourceAnchor = resolveCanvasEdgeAnchor(a, nodesById, "out");
  const targetAnchor = resolveCanvasEdgeAnchor(b, nodesById, "in");
  const ax = sourceAnchor.x, ay = sourceAnchor.y;
  const bx = targetAnchor.x, by = targetAnchor.y;
  const dx = Math.max(40, (bx - ax) * 0.5);
  const d = `M ${ax} ${ay} C ${ax+dx} ${ay} ${bx-dx} ${by} ${bx} ${by}`;
  const mx = (ax + 3 * (ax + dx) + 3 * (bx - dx) + bx) / 8;
  const my = (ay + by) / 2;
  const deleteEdge = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.(id);
  };
  return (
    <g className={`edge-group ${dashed ? "is-dashed" : "is-pulsing"}`} data-edge-id={id}>
      <path d={d} className={`edge edge-base ${dashed ? "dashed" : ""}`}/>
      {!dashed && (
        <path d={d} className="edge edge-pulse" aria-hidden="true"/>
      )}
      <polygon className="edge-arrow" points={`${bx},${by} ${bx-9},${by-5} ${bx-9},${by+5}`}/>
      {!dashed && (
        <g
          className="edge-delete"
          transform={`translate(${mx} ${my})`}
          role="button"
          tabIndex={0}
          aria-label="删除连接"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={deleteEdge}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') deleteEdge(event);
          }}
        >
          <circle r="9"/>
          <path d="M -3.5 -3.5 L 3.5 3.5 M 3.5 -3.5 L -3.5 3.5"/>
        </g>
      )}
    </g>
  );
});

const EMPTY_SCRIPT_NODE_SIZE = { w: 380, h: 360 };

function isEmptyScriptNode(node) {
  if ((node?.type !== "script" && node?.type !== "script.storyboard") || node.generating) return false;
  const shots = Array.isArray(node.shots) ? node.shots : [];
  return shots.length === 0 || (shots.length === 1 && shots[0]?.desc === "（待填写）");
}

function ensureEmptyScriptNodeSize(node) {
  if (!isEmptyScriptNode(node)) return node;
  const w = Math.max(Number(node.w) || 0, EMPTY_SCRIPT_NODE_SIZE.w);
  const h = Math.max(Number(node.h) || 0, EMPTY_SCRIPT_NODE_SIZE.h);
  return w === node.w && h === node.h ? node : { ...node, w, h };
}

function minNodeSize(node) {
  const type = node?.type;
  if (type === "video") return { w: 240, h: 180 };
  if (type === "image") return { w: 260, h: 230 };
  if (type === "audio") return { w: 220, h: 170 };
  if (isEmptyScriptNode(node)) return EMPTY_SCRIPT_NODE_SIZE;
  if (type === "script") return { w: 320, h: 190 };
  if (type === "director-stage") return { w: 420, h: 300 };
  if (type === "vr720-gen" || type === "panorama.generate") return { w: 360, h: 300 };
  if (type === "panorama-viewer" || type === "panorama.viewer") return { w: 420, h: 320 };
  if (type === "asset-gen") return { w: 360, h: 380 };
  if (type === "jianying-export" || type === "jianying.export") return { w: 320, h: 280 };
  if (type === "storyboard-collector-detail" || type === "storyboard.collector") return { w: 360, h: 280 };
  return { w: 220, h: 140 };
}

function isGroupNode(node) {
  return node?.type === "group";
}

function isBackgroundPanelNode(node) {
  return node?.type === "background-panel";
}

function isCanvasContentNode(node) {
  return node && !isGroupNode(node) && !isBackgroundPanelNode(node);
}

function isStoryboardCollectorNode(node) {
  return node?.type === "storyboard-collector-detail" || node?.type === "storyboard.collector";
}

function isCollectorMediaNode(node) {
  if (!node) return false;
  if (node.type === "image") return Boolean(node.src || node.imageUrl || node.assetUrl || node.assetPath);
  if (node.type === "video") return Boolean(node.videoSrc || node.poster || node.videoUrl || node.assetUrl || node.assetPath);
  if (node.type === "asset-gen") return Boolean(node.imageUrl || node.src);
  if (node.type === "vr720-gen") return Boolean(node.settings?.imageUrl);
  if (node.type === "panorama-viewer") return Boolean(node.settings?.panoramaImageUrl);
  return false;
}

function nodeCenterInside(node, target) {
  const cx = (Number(node?.x) || 0) + (Number(node?.w) || 0) / 2;
  const cy = (Number(node?.y) || 0) + (Number(node?.h) || 0) / 2;
  return (
    cx >= (Number(target?.x) || 0)
    && cx <= (Number(target?.x) || 0) + (Number(target?.w) || 0)
    && cy >= (Number(target?.y) || 0)
    && cy <= (Number(target?.y) || 0) + (Number(target?.h) || 0)
  );
}

function sameSelection(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((id, index) => id === b[index]);
}

function getGroupMembers(group, nodes) {
  const memberIds = Array.isArray(group?.memberIds) ? group.memberIds : [];
  return nodes.filter((node) => memberIds.includes(node.id) && isCanvasContentNode(node));
}

function getBackgroundPanelMembers(panel, nodes) {
  return nodes.filter((node) => (
    node.id !== panel?.id
    && isCanvasContentNode(node)
    && nodeCenterInside(node, panel)
  ));
}

function getGroupBounds(group, nodes, pad = 18) {
  const members = getGroupMembers(group, nodes);
  return getGroupFrameBounds(group, members, pad);
}

function getCanvasNodesSnapshot() {
  return canvasStore.getState().nodes || [];
}

function getDrawableNodesSnapshot() {
  return getCanvasNodesSnapshot().filter(isCanvasContentNode);
}

function getDrawableNodeIdsIntersectingRect(rect) {
  if (!rect || rect.w <= 0 || rect.h <= 0) return [];
  return getDrawableNodesSnapshot()
    .filter((node) => nodeIntersectsRect(node, rect))
    .map((node) => node.id);
}

function getGroupNodesSnapshot() {
  return getCanvasNodesSnapshot().filter(isGroupNode);
}

function getBackgroundPanelNodesSnapshot() {
  return getCanvasNodesSnapshot().filter(isBackgroundPanelNode);
}

function findSelectedGroup(groupNodes, selection, selectionSet) {
  if (selection.length < 2) return null;
  return groupNodes.find((group) => {
    const memberIds = Array.isArray(group.memberIds) ? group.memberIds : [];
    return memberIds.length === selection.length && memberIds.every((id) => selectionSet.has(id));
  }) || null;
}

function getSelectionBounds(nodes, pad = 14) {
  if (!Array.isArray(nodes) || nodes.length < 2) return null;
  const x = Math.min(...nodes.map((node) => node.x)) - pad;
  const y = Math.min(...nodes.map((node) => node.y)) - pad;
  const maxX = Math.max(...nodes.map((node) => node.x + node.w)) + pad;
  const maxY = Math.max(...nodes.map((node) => node.y + node.h)) + pad;
  return { x, y, w: maxX - x, h: maxY - y };
}

function isCanvasEditableTarget(target) {
  return Boolean(target?.closest?.('input, textarea, select, option, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]'));
}

function isScrollableCanvasTarget(target) {
  let el = target instanceof Element ? target : target?.parentElement;
  while (el) {
    if (el.classList?.contains('canvas-root')) return false;
    const style = window.getComputedStyle?.(el);
    const overflowY = style?.overflowY || '';
    const overflowX = style?.overflowX || '';
    const canScrollY = /(auto|scroll|overlay)/.test(overflowY) && el.scrollHeight > el.clientHeight;
    const canScrollX = /(auto|scroll|overlay)/.test(overflowX) && el.scrollWidth > el.clientWidth;
    if (canScrollY || canScrollX) return true;
    el = el.parentElement;
  }
  return false;
}

function shouldAllowNativeWheel(target) {
  return isCanvasEditableTarget(target) || isScrollableCanvasTarget(target);
}

function blurActiveEditorWhenLeaving(target) {
  const active = document.activeElement;
  if (!active || active === document.body || active === document.documentElement) return;
  if (!isCanvasEditableTarget(active)) return;
  if (active === target || active.contains?.(target)) return;
  active.blur?.();
}

let nativeSelectionClearToken = 0;

function clearNativeSelectionNow() {
  const selection = window.getSelection?.();
  if (selection?.rangeCount) selection.removeAllRanges();
}

function scheduleNativeSelectionClear() {
  if (nativeSelectionClearToken) return;
  const run = () => {
    nativeSelectionClearToken = 0;
    clearNativeSelectionNow();
  };
  if (typeof window.requestAnimationFrame === "function") {
    nativeSelectionClearToken = window.requestAnimationFrame(() => {
      window.setTimeout(run, 0);
    });
    return;
  }
  nativeSelectionClearToken = window.setTimeout(run, 0);
}

function getNodeElement(registry, nodeId) {
  if (!registry || !nodeId) return null;
  return registry.nodes.get(nodeId) || null;
}

function getNodeWorkbenchElement(registry, nodeId) {
  if (!registry || !nodeId) return null;
  return registry.workbenches.get(nodeId) || null;
}

function getNodeDragElements(registry, nodeId) {
  return [
    getNodeElement(registry, nodeId),
    getNodeWorkbenchElement(registry, nodeId),
  ].filter(Boolean);
}

function getGroupFrameElement(registry, groupId) {
  if (!registry || !groupId) return null;
  return registry.groups.get(groupId) || null;
}

function getBackgroundPanelElement(registry, panelId) {
  if (!registry || !panelId) return null;
  return registry.backgroundPanels.get(panelId) || null;
}

function formatWorldTransform(view) {
  return `translate3d(${-view.x * view.s}px, ${-view.y * view.s}px, 0) scale(${view.s})`;
}

const GRID_PATTERN_SIZE = 72;

function modulo(value, size) {
  if (!Number.isFinite(size) || size <= 0) return 0;
  return ((value % size) + size) % size;
}

function formatBackgroundTransform(view) {
  const patternSize = GRID_PATTERN_SIZE * view.s;
  const x = modulo(-view.x * view.s, patternSize);
  const y = modulo(-view.y * view.s, patternSize);
  return `translate3d(${x}px, ${y}px, 0)`;
}

function finiteCanvasNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatCanvasPositionTransform(x, y) {
  return `translate3d(${finiteCanvasNumber(x)}px, ${finiteCanvasNumber(y)}px, 0)`;
}

function readCanvasPositionTransform(element) {
  const transform = element?.style?.transform || "";
  const match = transform.match(/translate(?:3d)?\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px/i);
  return {
    x: match ? finiteCanvasNumber(match[1]) : 0,
    y: match ? finiteCanvasNumber(match[2]) : 0,
    transform,
  };
}

function captureCanvasDragTransforms(elements) {
  return elements.map((element) => ({
    element,
    ...readCanvasPositionTransform(element),
  }));
}

function applyCanvasDragTransform(captures, dx, dy) {
  captures.forEach(({ element, x, y }) => {
    element.style.transform = formatCanvasPositionTransform(x + dx, y + dy);
  });
}

function restoreCanvasDragTransforms(captures) {
  captures.forEach(({ element, transform: savedTransform }) => {
    element.style.transform = savedTransform;
  });
}

function captureCanvasResizeState(element) {
  if (!element) return null;
  return {
    element,
    width: element.style.width,
    height: element.style.height,
    transform: element.style.transform,
  };
}

function applyCanvasResizeTransform(capture, width, height) {
  if (!capture?.element) return;
  capture.element.style.width = `${finiteCanvasNumber(width)}px`;
  capture.element.style.height = `${finiteCanvasNumber(height)}px`;
}

function applyWorkbenchResizeTransform(capture, node, width, height) {
  if (!capture?.element || !node) return;
  const workbenchW = Math.max(finiteCanvasNumber(width), 640);
  const x = finiteCanvasNumber(node.x) + finiteCanvasNumber(width) / 2 - workbenchW / 2;
  const y = finiteCanvasNumber(node.y) + finiteCanvasNumber(height) + 14;
  capture.element.style.width = `${workbenchW}px`;
  capture.element.style.transform = formatCanvasPositionTransform(x, y);
}

function restoreCanvasResizeState(capture) {
  if (!capture?.element) return;
  capture.element.style.width = capture.width;
  capture.element.style.height = capture.height;
  capture.element.style.transform = capture.transform;
}

function captureNewCanvasDragTransforms(captures, elements) {
  const captured = new Set(captures.map(({ element }) => element));
  elements.forEach((element) => {
    if (!element || captured.has(element)) return;
    captured.add(element);
    captures.push({
      element,
      ...readCanvasPositionTransform(element),
    });
  });
}

function applyViewportToDom(root, world, background, nextView) {
  if (world) world.style.transform = formatWorldTransform(nextView);
  if (background) {
    background.style.transform = formatBackgroundTransform(nextView);
    if (background.style.getPropertyValue("--s") !== String(nextView.s)) {
      background.style.setProperty("--s", nextView.s);
    }
  }
  if (!root) return;
}

function scheduleCanvasIdleTask(callback) {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    return { type: "idle", id: window.requestIdleCallback(callback, { timeout: 160 }) };
  }
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    return { type: "frame", id: window.requestAnimationFrame(() => window.setTimeout(callback, 0)) };
  }
  return { type: "timeout", id: window.setTimeout(callback, 0) };
}

function cancelCanvasIdleTask(task) {
  if (!task || typeof window === "undefined") return;
  if (task.type === "idle" && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(task.id);
  } else if (task.type === "frame" && typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(task.id);
  } else {
    window.clearTimeout?.(task.id);
  }
}

function setCanvasInteractionClass(root, active) {
  root?.classList?.toggle("panning", active);
  root?.classList?.toggle("canvas-interacting", active);
}

function commitCanvasNodes(updater, type = 'edit-node') {
  canvasUndoActions.run(type, () => {
    canvasActions.setNodes(updater);
  });
}

function beginCanvasDragLock(event, cursor) {
  if (!isCanvasEditableTarget(event?.target)) blurActiveEditorWhenLeaving(event?.target);
  event?.preventDefault?.();
  const previous = {
    cursor: document.body.style.cursor,
    userSelect: document.body.style.userSelect,
    webkitUserSelect: document.body.style.webkitUserSelect,
  };
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  if (cursor) document.body.style.cursor = cursor;
  return () => {
    document.body.style.cursor = previous.cursor;
    document.body.style.userSelect = previous.userSelect;
    document.body.style.webkitUserSelect = previous.webkitUserSelect;
  };
}

function preventNativeCanvasGesture(event) {
  if (isCanvasEditableTarget(event.target)) return;
  if (event.target?.closest?.('.storyboard-collector-item')) return;
  event.preventDefault();
  scheduleNativeSelectionClear();
}

function useEventCallback(callback) {
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;
  return React.useCallback((...args) => callbackRef.current?.(...args), []);
}

function GroupFrame({ group, nodes, selected, onPointerDown, onContextMenu, onStartEdge, onResizeStart, onGroupRun }) {
  const groupElementRef = useRegisterCanvasElement('groups', group?.id);
  const bounds = getGroupBounds(group, nodes);
  if (!bounds) return null;
  const { x, y, w, h, members } = bounds;
  return (
    <div
      ref={groupElementRef}
      className={`group-frame ${selected ? "selected" : ""}`}
      data-group-id={group.id}
      style={{ left: 0, top: 0, width: w, height: h, transform: formatCanvasPositionTransform(x, y) }}
    >
      <div
        className="group-frame-label"
        onPointerDown={(event) => onPointerDown(event, group, members)}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onContextMenu?.(event, group, members);
        }}
      >
        <span>{group.title || "组合"}</span>
        <em>{members.length}</em>
      </div>
      <button
        type="button"
        className="group-frame-run"
        title="运行组内图片和视频"
        aria-label="运行组内图片和视频"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onGroupRun?.(group.id);
        }}
      >
        <span aria-hidden="true">▶</span>
      </button>
      <div
        className="group-handle l"
        onPointerDown={(event) => {
          event.stopPropagation();
          onStartEdge?.(event, group.id, "in");
        }}
      />
      <div
        className="group-handle r"
        onPointerDown={(event) => {
          event.stopPropagation();
          onStartEdge?.(event, group.id, "out");
        }}
      />
      <div
        className="group-frame-resize"
        title="拖拽缩放分组边框"
        onPointerDown={(event) => {
          event.stopPropagation();
          onResizeStart?.(event, group, bounds);
        }}
      />
    </div>
  );
}

function BackgroundPanel({ panel, selected, onPointerDown, onContextMenu }) {
  const panelElementRef = useRegisterCanvasElement('backgroundPanels', panel?.id);
  const color = panel.color || "#D7ECFF";
  return (
    <div
      ref={panelElementRef}
      className={`background-panel ${selected ? "selected" : ""}`}
      data-background-panel-id={panel.id}
      style={{
        left: 0,
        top: 0,
        width: panel.w,
        height: panel.h,
        transform: formatCanvasPositionTransform(panel.x, panel.y),
        "--background-panel-color": color,
      }}
      onPointerDown={(event) => onPointerDown(event, panel)}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onContextMenu?.(event, panel);
      }}
    >
      <div className="background-panel-title">
        <span className="background-panel-swatch" aria-hidden="true" />
        <span>{panel.title || "背景板"}</span>
      </div>
    </div>
  );
}

const BackgroundPanelConnected = React.memo(function BackgroundPanelConnected({
  id,
  onPointerDown,
  onContextMenu,
}) {
  const panel = useNodeById(id);
  const selected = useIsSelected(id);
  if (!isBackgroundPanelNode(panel)) return null;
  return (
    <BackgroundPanel
      panel={panel}
      selected={selected}
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
    />
  );
});

const SelectionGroupBox = React.memo(function SelectionGroupBox({ selection }) {
  const nodesById = useNodesById();
  const selectionSet = React.useMemo(() => new Set(selection), [selection]);
  const selectedDrawableNodes = React.useMemo(
    () => selection.map((id) => nodesById.get(id)).filter(isCanvasContentNode),
    [nodesById, selection],
  );
  const selectedGroup = React.useMemo(() => {
    const groupNodes = Array.from(nodesById.values()).filter(isGroupNode);
    return findSelectedGroup(groupNodes, selection, selectionSet);
  }, [nodesById, selection, selectionSet]);
  if (selection.length < 2 || selectedGroup || !selectedDrawableNodes.length) return null;
  const bounds = getSelectionBounds(selectedDrawableNodes, 12);
  if (!bounds) return null;
  return (
    <div
      className="group-box"
      style={{
        left: 0,
        top: 0,
        width: bounds.w,
        height: bounds.h,
        transform: formatCanvasPositionTransform(bounds.x, bounds.y),
      }}
    >
      <div className="gb-label">已选 {selection.length} · 右键新建组合</div>
    </div>
  );
});

const GroupFrameConnected = React.memo(function GroupFrameConnected({
  id,
  onPointerDown,
  onContextMenu,
  onStartEdge,
  onResizeStart,
  onGroupRun,
}) {
  const group = useNodeById(id);
  const nodesById = useNodesById();
  const selection = useSelection();
  const selectionSet = React.useMemo(() => new Set(selection), [selection]);
  if (!isGroupNode(group)) return null;
  const memberIds = Array.isArray(group.memberIds) ? group.memberIds : [];
  const memberNodes = memberIds.map((memberId) => nodesById.get(memberId)).filter(Boolean);
  const selected = memberNodes.length > 0 && memberNodes.every((node) => selectionSet.has(node.id));
  return (
    <GroupFrame
      group={group}
      nodes={memberNodes}
      selected={selected}
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
      onStartEdge={onStartEdge}
      onResizeStart={onResizeStart}
      onGroupRun={onGroupRun}
    />
  );
});

const NodeRendererConnected = React.memo(function NodeRendererConnected({
  id,
  projectId,
  onPointerDown,
  onResizeStart,
  onStartEdge,
  onSelect,
  onOpenModal,
  onGenerate,
  onUpdateNode,
  onGeneratePanorama,
  onContextMenu,
  onCreateNode,
  onCreateEdge,
  onStoryboardCollectorRestoreItem,
  deferMediaLoading,
}) {
  const node = useNodeById(id);
  const runtime = useNodeRuntime(id);
  const connectedEdges = useEdgesForNode(id);
  const incomingNodes = useIncomingNodesForNode(id);
  const renderNode = mergeNodeRuntime(node, runtime);
  const selected = useIsSelected(id);
  if (!isCanvasContentNode(renderNode)) return null;
  if (FULL_GRAPH_NODE_TYPES.has(renderNode.type)) {
    return (
      <FullGraphNodeRenderer
        renderNode={renderNode}
        selected={selected}
        projectId={projectId}
        deferMediaLoading={deferMediaLoading}
        onPointerDown={onPointerDown}
        onResizeStart={onResizeStart}
        onStartEdge={onStartEdge}
        onSelect={onSelect}
        onOpenModal={onOpenModal}
        onGenerate={onGenerate}
        onUpdateNode={onUpdateNode}
        onGeneratePanorama={onGeneratePanorama}
        onContextMenu={onContextMenu}
        onCreateNode={onCreateNode}
        onCreateEdge={onCreateEdge}
        onStoryboardCollectorRestoreItem={onStoryboardCollectorRestoreItem}
      />
    );
  }
  return (
    <NodeRenderer
      id={renderNode.id}
      type={renderNode.type}
      node={renderNode}
      selected={selected}
      onPointerDown={onPointerDown}
      onResizeStart={onResizeStart}
      onStartEdge={onStartEdge}
      onSelect={onSelect}
      onOpenModal={onOpenModal}
      onGenerate={onGenerate}
      onUpdateNode={onUpdateNode}
      onGeneratePanorama={onGeneratePanorama}
      onContextMenu={onContextMenu}
      allNodes={incomingNodes}
      edges={connectedEdges}
      connectedEdges={connectedEdges}
        projectId={projectId}
        deferMediaLoading={deferMediaLoading}
        onCreateNode={onCreateNode}
      onCreateEdge={onCreateEdge}
      onStoryboardCollectorRestoreItem={onStoryboardCollectorRestoreItem}
    />
  );
});

const FullGraphNodeRenderer = React.memo(function FullGraphNodeRenderer({
  renderNode,
  selected,
  projectId,
  onPointerDown,
  onResizeStart,
  onStartEdge,
  onSelect,
  onOpenModal,
  onGenerate,
  onUpdateNode,
  onGeneratePanorama,
  onContextMenu,
  onCreateNode,
  onCreateEdge,
  onStoryboardCollectorRestoreItem,
  deferMediaLoading,
}) {
  const edges = useEdges();
  return (
    <NodeRenderer
      id={renderNode.id}
      type={renderNode.type}
      node={renderNode}
      selected={selected}
      onPointerDown={onPointerDown}
      onResizeStart={onResizeStart}
      onStartEdge={onStartEdge}
      onSelect={onSelect}
      onOpenModal={onOpenModal}
      onGenerate={onGenerate}
      onUpdateNode={onUpdateNode}
      onGeneratePanorama={onGeneratePanorama}
      onContextMenu={onContextMenu}
      allNodes={getCanvasNodesSnapshot()}
      edges={edges}
      projectId={projectId}
      deferMediaLoading={deferMediaLoading}
      onCreateNode={onCreateNode}
      onCreateEdge={onCreateEdge}
      onStoryboardCollectorRestoreItem={onStoryboardCollectorRestoreItem}
    />
  );
});

const WorkbenchLayer = React.memo(function WorkbenchLayer({
  nodeId,
  onGenerate,
  onOpenModal,
  onUpdateNode,
  onRunSlash,
  projectId,
}) {
  const node = useNodeById(nodeId);
  const runtime = useNodeRuntime(nodeId);
  const nodesById = useNodesById();
  const connectedEdges = useEdgesForNode(nodeId);
  const renderNode = mergeNodeRuntime(node, runtime);
  if (!renderNode || isGroupNode(renderNode) || (renderNode.type !== "image" && renderNode.type !== "video") || !NodeWorkbench) return null;
  return (
    <NodeWorkbench
      node={renderNode}
      nodesById={nodesById}
      edges={connectedEdges}
      onGenerate={onGenerate}
      onOpenModal={onOpenModal}
      onUpdateNode={onUpdateNode}
      onRunSlash={onRunSlash}
      projectId={projectId}
    />
  );
});

const CanvasWorldContent = React.memo(function CanvasWorldContent({
  backgroundPanelNodeIds,
  onBackgroundPanelPointerDown,
  onBackgroundPanelContextMenu,
  edges,
  onDeleteEdge,
  tempEdge,
  selection,
  groupNodeIds,
  onGroupFramePointerDown,
  onGroupContextMenu,
  onStartEdge,
  onGroupFrameResizeStart,
  onGroupRun,
  drawableNodeIds,
  projectId,
  onNodePointerDown,
  onNodeResizeStart,
  onNodeSelect,
  onOpenModal,
  onGenerate,
  onUpdateNode,
  onGeneratePanorama,
  onNodeContextMenu,
  onCreateNode,
  onCreateEdge,
  onStoryboardCollectorRestoreItem,
  deferredWorkbenchNodeId,
  onRunSlash,
  marquee,
  backgroundPanelDraft,
}) {
  return (
    <>
      {backgroundPanelNodeIds.map((id) => (
        <BackgroundPanelConnected
          key={id}
          id={id}
          onPointerDown={onBackgroundPanelPointerDown}
          onContextMenu={onBackgroundPanelContextMenu}
        />
      ))}
      <svg className="edges">
        {edges.map(e => (
          <Edge
            key={e.id}
            id={e.id}
            from={e.from}
            to={e.to}
            onDelete={onDeleteEdge}
          />
        ))}
        {tempEdge && (
          <path
            d={`M ${tempEdge.from.x} ${tempEdge.from.y} L ${tempEdge.to.x} ${tempEdge.to.y}`}
            className="edge dashed"
          />
        )}
      </svg>
      {selection.length >= 2 && <SelectionGroupBox selection={selection} />}
      {groupNodeIds.map((id) => (
        <GroupFrameConnected
          key={id}
          id={id}
          onPointerDown={onGroupFramePointerDown}
          onContextMenu={onGroupContextMenu}
          onStartEdge={onStartEdge}
          onResizeStart={onGroupFrameResizeStart}
          onGroupRun={onGroupRun}
        />
      ))}
      {drawableNodeIds.map((id) => (
        <NodeRendererConnected
          key={id}
          id={id}
          projectId={projectId}
          deferMediaLoading
          onPointerDown={onNodePointerDown}
          onResizeStart={onNodeResizeStart}
          onStartEdge={onStartEdge}
          onSelect={onNodeSelect}
          onOpenModal={onOpenModal}
          onGenerate={onGenerate}
          onUpdateNode={onUpdateNode}
          onGeneratePanorama={onGeneratePanorama}
          onContextMenu={onNodeContextMenu}
          onCreateNode={onCreateNode}
          onCreateEdge={onCreateEdge}
          onStoryboardCollectorRestoreItem={onStoryboardCollectorRestoreItem}
        />
      ))}
      <WorkbenchLayer
        key={deferredWorkbenchNodeId || "no-workbench"}
        nodeId={deferredWorkbenchNodeId}
        onGenerate={onGenerate}
        onOpenModal={onOpenModal}
        onUpdateNode={onUpdateNode}
        onRunSlash={onRunSlash}
        projectId={projectId}
      />
      {marquee && (
        <div className="marquee" style={{left:0, top:0, width:marquee.w, height:marquee.h, transform: formatCanvasPositionTransform(marquee.x, marquee.y)}}/>
      )}
      {backgroundPanelDraft && (
        <div
          className="background-panel-draft"
          style={{
            left: 0,
            top: 0,
            width: backgroundPanelDraft.w,
            height: backgroundPanelDraft.h,
            transform: formatCanvasPositionTransform(backgroundPanelDraft.x, backgroundPanelDraft.y),
          }}
        />
      )}
    </>
  );
});

function useDeferredWorkbenchNodeId(nodeId) {
  const [deferredNodeId, setDeferredNodeId] = React.useState(null);

  React.useEffect(() => {
    if (!nodeId) {
      setDeferredNodeId(null);
      return undefined;
    }
    let cancelled = false;
    let idleId = null;
    let timeoutId = null;
    const commit = () => {
      if (!cancelled) setDeferredNodeId(nodeId);
    };
    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(commit, { timeout: 80 });
    } else {
      timeoutId = setTimeout(commit, 0);
    }
    return () => {
      cancelled = true;
      if (idleId !== null && typeof window !== "undefined" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [nodeId]);

  return deferredNodeId === nodeId ? deferredNodeId : null;
}

export const Canvas = React.forwardRef(function Canvas({
  bgStyle,
  onContextMenu, onNodeContextMenu, onGroupContextMenu, onOpenModal, onUpdateNode, onDropFiles,
  onBackgroundPanelContextMenu,
  onGroupRun,
  onGenerate, onGeneratePanorama, onRunSlash,
  onSave, onDownload, onDuplicate, onGroup, onCompose, onViewportScaleChange,
  onCollectIntoStoryboard,
  onStoryboardCollectorRestoreItem,
  onStoryboardCollectorDropItem,
}, ref) {
  const [view, viewportApi] = useViewport({ x: -60, y: -60, s: 1 });
  const edges = useEdges();
  const drawableNodeIds = useDrawableNodeIds();
  const backgroundPanelNodeIds = useBackgroundPanelNodeIds();
  const groupNodeIds = useGroupNodeIds();
  const projectId = useProjectId();
  const selection = useSelection();
  React.useEffect(() => {
    let lastNodeIds = null;
    const normalizeEmptyScriptNodeSizes = () => {
      const state = canvasStore.getState();
      if (state.nodeIds === lastNodeIds) return;
      lastNodeIds = state.nodeIds;
      if (!getCanvasNodesSnapshot().some((node) => ensureEmptyScriptNodeSize(node) !== node)) return;
      canvasActions.setNodes((current) => {
        let changed = false;
        const next = current.map((node) => {
          const normalized = ensureEmptyScriptNodeSize(node);
          if (normalized !== node) changed = true;
          return normalized;
        });
        return changed ? next : current;
      });
    };
    normalizeEmptyScriptNodeSizes();
    return canvasStore.subscribe(normalizeEmptyScriptNodeSizes);
  }, []);
  const rootRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const bgRef = React.useRef(null);
  const elementRegistryRef = React.useRef(createCanvasElementRegistry());
  const rootRectRef = React.useRef({ left: 0, top: 0, width: 0, height: 0 });
  const mediaVisibilityTaskRef = React.useRef(null);
  const [tempEdge, setTempEdge] = React.useState(null);
  const [marquee, setMarquee] = React.useState(null);
  const [backgroundPanelDraft, setBackgroundPanelDraft] = React.useState(null);
  const [suppressedWorkbenchNodeId, setSuppressedWorkbenchNodeId] = React.useState(null);

  // Expose viewport API to parent via ref
  React.useImperativeHandle(ref, () => viewportApi, [viewportApi]);

  // Memoize context value to avoid re-render thrash on stable api
  const ctxValue = React.useMemo(() => ({ view, api: viewportApi }), [view, viewportApi]);

  React.useEffect(() => {
    onViewportScaleChange?.(view.s);
  }, [onViewportScaleChange, view.s]);

  const worldStyle = {
    transform: formatWorldTransform(view),
  };
  const backgroundStyle = {
    "--s": view.s,
    transform: formatBackgroundTransform(view),
  };

  const commitPanViewport = useEventCallback((nextView) => {
    viewportApi.set(nextView);
  });

  const refreshRootRect = React.useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect?.();
    if (!rect) return rootRectRef.current;
    const nextRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    rootRectRef.current = nextRect;
    return nextRect;
  }, []);

  const updateCanvasMediaVisibilityNow = useEventCallback((targetView = viewportApi.get()) => {
    const ids = getViewportMediaNodeIds(
      canvasStore.getState().nodes,
      targetView,
      rootRectRef.current,
      uiStore.getState().selection,
    );
    canvasMediaVisibilityActions.setEnabledNodeIds(ids);
  });

  const scheduleCanvasMediaVisibilityUpdate = useEventCallback((targetView = viewportApi.get()) => {
    cancelCanvasIdleTask(mediaVisibilityTaskRef.current);
    const viewSnapshot = { ...targetView };
    mediaVisibilityTaskRef.current = scheduleCanvasIdleTask(() => {
      mediaVisibilityTaskRef.current = null;
      updateCanvasMediaVisibilityNow(viewSnapshot);
    });
  });

  const clientToWorld = React.useCallback((clientX, clientY, rect = rootRectRef.current, currentView = view) => ({
    x: (clientX - rect.left) / currentView.s + currentView.x,
    y: (clientY - rect.top) / currentView.s + currentView.y,
  }), [view]);

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const updateRootRect = () => {
      refreshRootRect();
      scheduleCanvasMediaVisibilityUpdate(viewportApi.get());
    };
    updateRootRect();
    updateCanvasMediaVisibilityNow(viewportApi.get());
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateRootRect);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", updateRootRect);
    return () => window.removeEventListener("resize", updateRootRect);
  }, [refreshRootRect, scheduleCanvasMediaVisibilityUpdate, updateCanvasMediaVisibilityNow, viewportApi]);

  React.useEffect(() => {
    scheduleCanvasMediaVisibilityUpdate(viewportApi.get());
  }, [scheduleCanvasMediaVisibilityUpdate, selection, viewportApi]);

  React.useEffect(() => {
    scheduleCanvasMediaVisibilityUpdate(viewportApi.get());
  }, [scheduleCanvasMediaVisibilityUpdate, view.s, viewportApi]);

  React.useEffect(() => {
    let lastNodeIds = null;
    let lastLayoutVersion = -1;
    let lastDataVersion = -1;
    const syncMediaVisibilityForNodeChange = () => {
      const state = canvasStore.getState();
      if (
        state.nodeIds === lastNodeIds
        && state.nodeLayoutVersion === lastLayoutVersion
        && state.nodeDataVersion === lastDataVersion
      ) {
        return;
      }
      lastNodeIds = state.nodeIds;
      lastLayoutVersion = state.nodeLayoutVersion;
      lastDataVersion = state.nodeDataVersion;
      scheduleCanvasMediaVisibilityUpdate(viewportApi.get());
    };
    syncMediaVisibilityForNodeChange();
    return canvasStore.subscribe(syncMediaVisibilityForNodeChange);
  }, [scheduleCanvasMediaVisibilityUpdate, viewportApi]);

  React.useEffect(() => () => {
    cancelCanvasIdleTask(mediaVisibilityTaskRef.current);
    mediaVisibilityTaskRef.current = null;
    canvasMediaVisibilityActions.reset();
  }, []);

  // wheel zoom
  const onWheel = (e) => {
    if (shouldAllowNativeWheel(e.target)) return;
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newS = Math.max(0.2, Math.min(2.5, view.s + delta));
    const rect = refreshRootRect();
    const point = clientToWorld(e.clientX, e.clientY, rect, view);
    viewportApi.set({
      x: point.x - (e.clientX - rect.left) / newS,
      y: point.y - (e.clientY - rect.top) / newS,
      s: newS,
    });
  };

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive:false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [view]);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.addEventListener("selectstart", preventNativeCanvasGesture);
    el.addEventListener("dragstart", preventNativeCanvasGesture);
    return () => {
      el.removeEventListener("selectstart", preventNativeCanvasGesture);
      el.removeEventListener("dragstart", preventNativeCanvasGesture);
    };
  }, []);

  // 漫创AI behavior on empty canvas:
  //   - drag (>4px move) → pan the canvas
  //   - quick click → deselect (unless Ctrl/Cmd held)
  //   - shift + drag → marquee select
  //   - ctrl/cmd + drag → select touched nodes, or draw a background panel when empty
  //   - middle button → pan (power-user)
  const onRootPointerDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    const modifiedClick = e.ctrlKey || e.metaKey || e.shiftKey;
    const wantsBackgroundPanel = e.button === 0 && (e.ctrlKey || e.metaKey) && !e.shiftKey;
    const wantsMarquee = e.button === 0 && e.shiftKey;
    const releaseCanvasDragLock = beginCanvasDragLock(e, (wantsBackgroundPanel || wantsMarquee) ? "crosshair" : "grabbing");

    if (wantsBackgroundPanel) {
      const rect = refreshRootRect();
      const start = clientToWorld(e.clientX, e.clientY, rect, view);
      let latestDraft = { x: start.x, y: start.y, w: 0, h: 0 };
      setBackgroundPanelDraft(latestDraft);
      const updateDraft = (ev) => {
        const next = clientToWorld(ev.clientX, ev.clientY, rect, view);
        latestDraft = {
          x: Math.min(start.x, next.x),
          y: Math.min(start.y, next.y),
          w: Math.abs(next.x - start.x),
          h: Math.abs(next.y - start.y),
        };
        setBackgroundPanelDraft(latestDraft);
      };
      const mv = (ev) => {
        updateDraft(ev);
      };
      const finish = (ev, shouldCreate) => {
        if (shouldCreate) updateDraft(ev);
        if (shouldCreate && latestDraft.w > 4 && latestDraft.h > 4) {
          const picked = getDrawableNodeIdsIntersectingRect(latestDraft);
          if (picked.length) {
            uiActions.setSelection(picked);
          } else if (latestDraft.w > 12 && latestDraft.h > 12) {
            const panel = {
              id: `background_panel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
              type: "background-panel",
              title: "背景板",
              color: "#D7ECFF",
              x: Math.round(latestDraft.x),
              y: Math.round(latestDraft.y),
              w: Math.round(latestDraft.w),
              h: Math.round(latestDraft.h),
              createdAt: new Date().toISOString(),
            };
            canvasUndoActions.run('create-background-panel', () => {
              canvasActions.setNodes((items) => [...items, panel]);
              uiActions.setSelection([panel.id]);
            });
          }
        }
        releaseCanvasDragLock();
        setBackgroundPanelDraft(null);
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
      };
      const up = (ev) => {
        finish(ev, true);
      };
      const cancel = (ev) => {
        finish(ev, false);
      };
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
      return;
    }

    // SHIFT + drag = marquee select
    if (wantsMarquee) {
      const rect = refreshRootRect();
      const start = clientToWorld(e.clientX, e.clientY, rect, view);
      let latestMarquee = { x: start.x, y: start.y, w: 0, h: 0 };
      setMarquee(latestMarquee);
      const mv = (ev) => {
        const next = clientToWorld(ev.clientX, ev.clientY, rect, view);
        latestMarquee = {
          x: Math.min(start.x, next.x), y: Math.min(start.y, next.y),
          w: Math.abs(next.x - start.x), h: Math.abs(next.y - start.y),
        };
        setMarquee(latestMarquee);
      };
      const up = () => {
        if (latestMarquee.w > 4 && latestMarquee.h > 4) {
          const picked = getDrawableNodeIdsIntersectingRect(latestMarquee);
          uiActions.setSelection(picked);
        }
        releaseCanvasDragLock();
        setMarquee(null);
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      };
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      return;
    }

    // Default: pan-on-drag, deselect-on-click
    const startX = e.clientX, startY = e.clientY;
    const startView = view;
    const startVx = view.x, startVy = view.y, startS = view.s;
    let moved = false;
    let latestView = startView;
    let frameId = 0;
    const applyPanTransform = () => {
      frameId = 0;
      applyViewportToDom(rootRef.current, worldRef.current, bgRef.current, latestView);
    };
    const schedulePanTransform = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame?.(applyPanTransform) || window.setTimeout(applyPanTransform, 0);
    };
    const mv = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        moved = true;
        setCanvasInteractionClass(rootRef.current, true);
      }
      if (moved) {
        latestView = { ...startView, x: startVx - dx / startS, y: startVy - dy / startS };
        schedulePanTransform();
      }
    };
    const up = () => {
      if (frameId) {
        window.cancelAnimationFrame?.(frameId);
        window.clearTimeout?.(frameId);
        frameId = 0;
      }
      if (moved) {
        commitPanViewport(latestView);
      }
      if (!moved && !modifiedClick) {
        // clean click on empty canvas -> deselect (unless Ctrl/Cmd held)
        uiActions.setSelection([]);
      }
      releaseCanvasDragLock();
      setCanvasInteractionClass(rootRef.current, false);
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // node drag
  const onNodePointerDown = useEventCallback((e, id) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const releaseCanvasDragLock = beginCanvasDragLock(e, "grabbing");
    const additive = e.ctrlKey || e.metaKey || e.shiftKey;
    const current = uiStore.getState().selection || [];
    const picked = current.includes(id)
      ? current
      : additive
        ? Array.from(new Set([...current, id]))
        : [id];
    const selectionChanged = !sameSelection(current, picked);
    const suppressWorkbenchUntilRelease = selectionChanged && picked.length === 1 ? picked[0] : null;
    if (suppressWorkbenchUntilRelease) {
      setSuppressedWorkbenchNodeId(suppressWorkbenchUntilRelease);
    }
    if (selectionChanged) {
      uiActions.setSelection(picked);
    }
    const startMx = e.clientX, startMy = e.clientY;
    const curS = view.s;
    const pickedSet = new Set(picked);
    const latestNodes = canvasStore.getState().nodes || [];
    const starts = new Map();
    latestNodes.forEach((node) => {
      if (pickedSet.has(node.id)) starts.set(node.id, { x: node.x, y: node.y });
    });
    const draggedElements = new Set();
    const dragTransforms = [];
    let dragElementsCollected = false;
    const collectDragElements = () => {
      const elements = picked.flatMap((nodeId) => getNodeDragElements(elementRegistryRef.current, nodeId));
      elements.forEach((element) => {
        if (!element || draggedElements.has(element)) return;
        draggedElements.add(element);
        element.classList.add("fast-dragging");
      });
      captureNewCanvasDragTransforms(dragTransforms, elements);
    };
    const ensureDragElementsCollected = () => {
      if (dragElementsCollected) return;
      dragElementsCollected = true;
      collectDragElements();
    };
    let latestDx = 0;
    let latestDy = 0;
    let moved = false;
    let frameId = 0;
    const applyDragTransform = () => {
      frameId = 0;
      ensureDragElementsCollected();
      applyCanvasDragTransform(dragTransforms, latestDx, latestDy);
    };
    const scheduleDragTransform = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame?.(applyDragTransform) || window.setTimeout(applyDragTransform, 0);
    };
    const updateLatestDragDelta = (ev) => {
      if (!ev || typeof ev.clientX !== "number" || typeof ev.clientY !== "number") return;
      latestDx = (ev.clientX - startMx) / curS;
      latestDy = (ev.clientY - startMy) / curS;
      moved = moved || Math.abs(latestDx) > 0 || Math.abs(latestDy) > 0;
    };
    const mv = (ev) => {
      updateLatestDragDelta(ev);
      scheduleDragTransform();
    };
    const up = (ev) => {
      updateLatestDragDelta(ev);
      if (frameId) {
        window.cancelAnimationFrame?.(frameId);
        window.clearTimeout?.(frameId);
        frameId = 0;
      }
      const hasFinalDelta = Math.abs(latestDx) > 0 || Math.abs(latestDy) > 0;
      if (moved) {
        applyDragTransform();
      }
      if (moved && hasFinalDelta) {
        commitCanvasNodes(ns => ns.map(n => {
          const start = starts.get(n.id);
          return start ? { ...n, x: start.x + latestDx, y: start.y + latestDy } : n;
        }), 'move-node');
        const committedNodes = canvasStore.getState().nodes || [];
        const movedMediaNodes = committedNodes.filter((node) => pickedSet.has(node.id) && isCollectorMediaNode(node));
        if (movedMediaNodes.length && onCollectIntoStoryboard) {
          const collectors = committedNodes.filter((node) => !pickedSet.has(node.id) && isStoryboardCollectorNode(node));
          const target = collectors.find((collector) => movedMediaNodes.some((mediaNode) => nodeCenterInside(mediaNode, collector)));
          if (target) {
            onCollectIntoStoryboard(target.id, movedMediaNodes.map((node) => node.id));
          }
        }
      } else {
        restoreCanvasDragTransforms(dragTransforms);
      }
      draggedElements.forEach((element) => {
        element.classList.remove("fast-dragging");
      });
      if (suppressWorkbenchUntilRelease) {
        setSuppressedWorkbenchNodeId((currentId) => (
          currentId === suppressWorkbenchUntilRelease ? null : currentId
        ));
      }
      setCanvasInteractionClass(rootRef.current, false);
      releaseCanvasDragLock();
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });

  const onNodeResizeStart = useEventCallback((e, id) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const releaseCanvasDragLock = beginCanvasDragLock(e, "nwse-resize");
    uiActions.setSelection([id]);
    const startMx = e.clientX;
    const startMy = e.clientY;
    const curS = view.s;
    const target = canvasStore.getState().nodesById.get(id);
    if (!target) {
      releaseCanvasDragLock();
      return;
    }
    const start = {
      w: Number(target.w) || 320,
      h: Number(target.h) || 220,
      min: minNodeSize(target),
    };
    const nodeCapture = captureCanvasResizeState(getNodeElement(elementRegistryRef.current, id));
    const workbenchCapture = captureCanvasResizeState(getNodeWorkbenchElement(elementRegistryRef.current, id));
    nodeCapture?.element?.classList.add("fast-dragging");
    workbenchCapture?.element?.classList.add("fast-dragging");
    setCanvasInteractionClass(rootRef.current, true);
    let latestW = start.w;
    let latestH = start.h;
    let moved = false;
    let frameId = 0;
    const applyResizeTransform = () => {
      frameId = 0;
      applyCanvasResizeTransform(nodeCapture, latestW, latestH);
      applyWorkbenchResizeTransform(workbenchCapture, target, latestW, latestH);
    };
    const scheduleResizeTransform = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame?.(applyResizeTransform) || window.setTimeout(applyResizeTransform, 0);
    };
    const updateLatestResize = (ev) => {
      if (!ev || typeof ev.clientX !== "number" || typeof ev.clientY !== "number") return;
      const dx = (ev.clientX - startMx) / curS;
      const dy = (ev.clientY - startMy) / curS;
      latestW = Math.max(start.min.w, Math.round(start.w + dx));
      latestH = Math.max(start.min.h, Math.round(start.h + dy));
      moved = moved || latestW !== start.w || latestH !== start.h;
    };
    const mv = (ev) => {
      updateLatestResize(ev);
      scheduleResizeTransform();
    };
    const up = (ev) => {
      updateLatestResize(ev);
      if (frameId) {
        window.cancelAnimationFrame?.(frameId);
        window.clearTimeout?.(frameId);
        frameId = 0;
      }
      if (moved) {
        applyResizeTransform();
        commitCanvasNodes(ns => ns.map(n => (
          n.id === id ? { ...n, w: latestW, h: latestH } : n
        )), 'resize-node');
      } else {
        restoreCanvasResizeState(nodeCapture);
        restoreCanvasResizeState(workbenchCapture);
      }
      nodeCapture?.element?.classList.remove("fast-dragging");
      workbenchCapture?.element?.classList.remove("fast-dragging");
      setCanvasInteractionClass(rootRef.current, false);
      releaseCanvasDragLock();
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });

  // edge creation from handle
  const onStartEdge = useEventCallback((e, id, dir) => {
    const releaseCanvasDragLock = beginCanvasDragLock(e, "crosshair");
    const rect = refreshRootRect();
    const n = canvasStore.getState().nodesById.get(id);
    if (!n) {
      releaseCanvasDragLock();
      return;
    }
    const start = resolveCanvasEdgeAnchor(n, canvasStore.getState().nodesById, dir === "out" ? "out" : "in");
    setTempEdge({ from: start, to: start, sourceId: id });
    const mv = (ev) => {
      const point = clientToWorld(ev.clientX, ev.clientY, rect, view);
      setTempEdge({ from: start, to: point, sourceId: id });
    };
    const up = (ev) => {
      const { x, y } = clientToWorld(ev.clientX, ev.clientY, rect, view);
      const latestNodesById = canvasStore.getState().nodesById;
      const latestConnectableNodes = getCanvasNodesSnapshot()
        .filter((node) => isCanvasContentNode(node) || isGroupNode(node));
      const target = latestConnectableNodes.find((node) => {
        const bounds = resolveCanvasConnectableBounds(node, latestNodesById);
        return (
          x >= bounds.x
          && x <= bounds.x + bounds.w
          && y >= bounds.y
          && y <= bounds.y + bounds.h
          && node.id !== id
        );
      });
      if (target) {
        const selectedNodeIds = uiStore.getState().selection || [];
        const latestConnectableNodeIds = latestConnectableNodes.map((node) => node.id);
        canvasUndoActions.run('create-edge', () => {
          let createdEdges = [];
          canvasActions.setEdges((es) => {
            const additions = buildFanOutEdges({
              existingEdges: es,
              selectedNodeIds,
              drawableNodeIds: latestConnectableNodeIds,
              sourceNodeId: id,
              targetNodeId: target.id,
              direction: dir,
            });
            createdEdges = additions;
            return additions.length ? [...es, ...additions] : es;
          });
          if (createdEdges.length) {
            const state = canvasStore.getState();
            const nextNodes = syncPromptRunnerOutputsForGenerationEdges(state.nodes, createdEdges);
            if (nextNodes !== state.nodes) canvasActions.setNodes(nextNodes);
          }
        });
      }
      setTempEdge(null);
      releaseCanvasDragLock();
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });

  const onNodeSelect = React.useCallback((id, add) => {
    uiActions[add ? 'toggleSelection' : 'setSelection'](add ? id : [id]);
  }, []);

  const deleteEdge = React.useCallback((edgeId) => {
    if (!edgeId) return;
    canvasUndoActions.run('delete-edge', () => {
      canvasActions.setEdges((items) => items.filter((edge) => edge.id !== edgeId));
    });
  }, []);

  const handleCreateNode = React.useCallback((node) => {
    if (!node) return;
    canvasUndoActions.run('create-canvas-node', () => {
      canvasActions.setNodes((items) => [...items, node]);
    });
  }, []);

  const handleCreateEdge = React.useCallback((edge) => {
    if (!edge) return;
    canvasUndoActions.run('create-edge', () => {
      canvasActions.setEdges((items) => [...items, edge]);
      const state = canvasStore.getState();
      const nextNodes = syncPromptRunnerOutputsForGenerationEdges(state.nodes, [edge]);
      if (nextNodes !== state.nodes) canvasActions.setNodes(nextNodes);
    });
  }, []);

  const handleOpenModal = useEventCallback(onOpenModal);
  const handleGenerate = useEventCallback(onGenerate);
  const handleGroupRun = useEventCallback(onGroupRun);
  const handleUpdateNode = useEventCallback(onUpdateNode);
  const handleGeneratePanorama = useEventCallback(onGeneratePanorama);
  const handleNodeContextMenu = useEventCallback(onNodeContextMenu);
  const handleStoryboardCollectorRestoreItem = useEventCallback(onStoryboardCollectorRestoreItem);
  const handleBackgroundPanelContextMenu = useEventCallback(onBackgroundPanelContextMenu);
  const handleRunSlash = useEventCallback(onRunSlash);

  const onBackgroundPanelPointerDown = useEventCallback((e, panel) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const releaseCanvasDragLock = beginCanvasDragLock(e, "grabbing");
    uiActions.setSelection([panel.id]);
    const startMx = e.clientX;
    const startMy = e.clientY;
    const curS = view.s;
    const latestNodes = canvasStore.getState().nodes || [];
    const latestPanel = latestNodes.find((node) => node.id === panel.id) || panel;
    const memberIds = getBackgroundPanelMembers(latestPanel, latestNodes).map((node) => node.id);
    const moveIds = new Set([panel.id, ...memberIds]);
    const starts = new Map();
    latestNodes.forEach((node) => {
      if (moveIds.has(node.id)) starts.set(node.id, { x: Number(node.x) || 0, y: Number(node.y) || 0 });
    });
    const draggedElements = [
      getBackgroundPanelElement(elementRegistryRef.current, panel.id),
      ...memberIds.flatMap((nodeId) => getNodeDragElements(elementRegistryRef.current, nodeId)),
    ].filter(Boolean);
    draggedElements.forEach((element) => {
      element.classList.add("fast-dragging");
    });
    const dragTransforms = captureCanvasDragTransforms(draggedElements);
    setCanvasInteractionClass(rootRef.current, true);
    let latestDx = 0;
    let latestDy = 0;
    let moved = false;
    let frameId = 0;
    const applyPanelTransform = () => {
      frameId = 0;
      applyCanvasDragTransform(dragTransforms, latestDx, latestDy);
    };
    const schedulePanelTransform = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame?.(applyPanelTransform) || window.setTimeout(applyPanelTransform, 0);
    };
    const updateLatestPanelDelta = (ev) => {
      if (!ev || typeof ev.clientX !== "number" || typeof ev.clientY !== "number") return;
      latestDx = (ev.clientX - startMx) / curS;
      latestDy = (ev.clientY - startMy) / curS;
      if (!moved && (Math.abs(latestDx) > 1 || Math.abs(latestDy) > 1)) moved = true;
    };
    const mv = (ev) => {
      updateLatestPanelDelta(ev);
      schedulePanelTransform();
    };
    const up = (ev) => {
      updateLatestPanelDelta(ev);
      if (frameId) {
        window.cancelAnimationFrame?.(frameId);
        window.clearTimeout?.(frameId);
        frameId = 0;
      }
      const hasFinalDelta = Math.abs(latestDx) > 0 || Math.abs(latestDy) > 0;
      if (moved) {
        applyPanelTransform();
      }
      if (moved && hasFinalDelta) {
        commitCanvasNodes(ns => ns.map(n => {
          const start = starts.get(n.id);
          return start ? { ...n, x: start.x + latestDx, y: start.y + latestDy } : n;
        }), 'move-background-panel');
      } else {
        restoreCanvasDragTransforms(dragTransforms);
      }
      draggedElements.forEach((element) => {
        element.classList.remove("fast-dragging");
      });
      setCanvasInteractionClass(rootRef.current, false);
      releaseCanvasDragLock();
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });

  const onGroupFramePointerDown = useEventCallback((e, group, members) => {
    e.stopPropagation();
    if (e.button !== 0 || members.length < 2) return;
    const releaseCanvasDragLock = beginCanvasDragLock(e, "grabbing");
    const memberIds = members.map((node) => node.id);
    uiActions.setSelection(memberIds);
    const startMx = e.clientX;
    const startMy = e.clientY;
    const curS = view.s;
    const moveIds = new Set([group.id, ...memberIds]);
    const starts = new Map();
    (canvasStore.getState().nodes || []).forEach((node) => {
      if (moveIds.has(node.id)) starts.set(node.id, { x: Number(node.x) || 0, y: Number(node.y) || 0 });
    });
    const draggedElements = [
      getGroupFrameElement(elementRegistryRef.current, group.id),
      ...memberIds.flatMap((nodeId) => getNodeDragElements(elementRegistryRef.current, nodeId)),
    ].filter(Boolean);
    draggedElements.forEach((element) => {
      element.classList.add("fast-dragging");
    });
    const dragTransforms = captureCanvasDragTransforms(draggedElements);
    setCanvasInteractionClass(rootRef.current, true);
    let latestDx = 0;
    let latestDy = 0;
    let moved = false;
    let frameId = 0;
    const applyGroupTransform = () => {
      frameId = 0;
      applyCanvasDragTransform(dragTransforms, latestDx, latestDy);
    };
    const scheduleGroupTransform = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame?.(applyGroupTransform) || window.setTimeout(applyGroupTransform, 0);
    };
    const updateLatestGroupDelta = (ev) => {
      if (!ev || typeof ev.clientX !== "number" || typeof ev.clientY !== "number") return;
      latestDx = (ev.clientX - startMx) / curS;
      latestDy = (ev.clientY - startMy) / curS;
      if (!moved && (Math.abs(latestDx) > 1 || Math.abs(latestDy) > 1)) moved = true;
    };
    const mv = (ev) => {
      updateLatestGroupDelta(ev);
      scheduleGroupTransform();
    };
    const up = (ev) => {
      updateLatestGroupDelta(ev);
      if (frameId) {
        window.cancelAnimationFrame?.(frameId);
        window.clearTimeout?.(frameId);
        frameId = 0;
      }
      const hasFinalDelta = Math.abs(latestDx) > 0 || Math.abs(latestDy) > 0;
      if (moved) {
        applyGroupTransform();
      }
      if (moved && hasFinalDelta) {
        commitCanvasNodes(ns => ns.map(n => {
          const start = starts.get(n.id);
          return start ? { ...n, x: start.x + latestDx, y: start.y + latestDy } : n;
        }), 'move-group');
      } else {
        restoreCanvasDragTransforms(dragTransforms);
      }
      draggedElements.forEach((element) => {
        element.classList.remove("fast-dragging");
      });
      setCanvasInteractionClass(rootRef.current, false);
      releaseCanvasDragLock();
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });

  const onGroupFrameResizeStart = useEventCallback((e, group, bounds) => {
    e.stopPropagation();
    if (e.button !== 0 || !group?.id || !bounds) return;
    const releaseCanvasDragLock = beginCanvasDragLock(e, "nwse-resize");
    const memberIds = Array.isArray(group.memberIds) ? group.memberIds : [];
    uiActions.setSelection(memberIds);
    const startMx = e.clientX;
    const startMy = e.clientY;
    const curS = view.s;
    const groupCapture = captureCanvasResizeState(getGroupFrameElement(elementRegistryRef.current, group.id));
    groupCapture?.element?.classList.add("fast-dragging");
    setCanvasInteractionClass(rootRef.current, true);
    let latestW = bounds.w;
    let latestH = bounds.h;
    let moved = false;
    let frameId = 0;
    const applyGroupResizeTransform = () => {
      frameId = 0;
      applyCanvasResizeTransform(groupCapture, latestW, latestH);
    };
    const scheduleGroupResizeTransform = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame?.(applyGroupResizeTransform) || window.setTimeout(applyGroupResizeTransform, 0);
    };
    const updateLatestGroupSize = (ev) => {
      if (!ev || typeof ev.clientX !== "number" || typeof ev.clientY !== "number") return;
      const dx = (ev.clientX - startMx) / curS;
      const dy = (ev.clientY - startMy) / curS;
      const patch = createGroupFrameResizePatch(bounds, dx, dy);
      latestW = patch.w;
      latestH = patch.h;
      moved = moved || latestW !== bounds.w || latestH !== bounds.h;
    };
    const mv = (ev) => {
      updateLatestGroupSize(ev);
      scheduleGroupResizeTransform();
    };
    const up = (ev) => {
      updateLatestGroupSize(ev);
      if (frameId) {
        window.cancelAnimationFrame?.(frameId);
        window.clearTimeout?.(frameId);
        frameId = 0;
      }
      if (moved) {
        applyGroupResizeTransform();
        const patch = createGroupFrameResizePatch(bounds, latestW - bounds.w, latestH - bounds.h);
        commitCanvasNodes(ns => ns.map(n => (
          n.id === group.id ? { ...n, ...patch } : n
        )), 'resize-group');
      } else {
        restoreCanvasResizeState(groupCapture);
      }
      groupCapture?.element?.classList.remove("fast-dragging");
      setCanvasInteractionClass(rootRef.current, false);
      releaseCanvasDragLock();
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = rootRef.current ? refreshRootRect() : null;
    const worldPoint = rect ? clientToWorld(e.clientX, e.clientY, rect, view) : null;
    const latestDrawableNodes = getDrawableNodesSnapshot();
    if (worldPoint && onGroupContextMenu) {
      const hitGroup = [...getGroupNodesSnapshot()].reverse().map((group) => {
        const bounds = getGroupBounds(group, latestDrawableNodes);
        return bounds ? { group, bounds } : null;
      }).find((item) => (
        item &&
        worldPoint.x >= item.bounds.x &&
        worldPoint.x <= item.bounds.x + item.bounds.w &&
        worldPoint.y >= item.bounds.y &&
        worldPoint.y <= item.bounds.y + item.bounds.h
      ));
      if (hitGroup) {
        onGroupContextMenu(e, hitGroup.group, hitGroup.bounds.members);
        return;
      }
    }
    if (worldPoint && onBackgroundPanelContextMenu) {
      const hitPanel = [...getBackgroundPanelNodesSnapshot()].reverse().find((panel) => (
        worldPoint.x >= (Number(panel.x) || 0) &&
        worldPoint.x <= (Number(panel.x) || 0) + (Number(panel.w) || 0) &&
        worldPoint.y >= (Number(panel.y) || 0) &&
        worldPoint.y <= (Number(panel.y) || 0) + (Number(panel.h) || 0)
      ));
      if (hitPanel) {
        onBackgroundPanelContextMenu(e, hitPanel);
        return;
      }
    }
    const latestSelection = uiStore.getState().selection || [];
    const latestSelectionSet = new Set(latestSelection);
    const latestSelectedGroup = findSelectedGroup(getGroupNodesSnapshot(), latestSelection, latestSelectionSet);
    const selectionBounds = latestSelectedGroup
      ? null
      : getSelectionBounds(latestDrawableNodes.filter((node) => latestSelectionSet.has(node.id)));
    if (selectionBounds && rootRef.current) {
      if (
        worldPoint &&
        worldPoint.x >= selectionBounds.x &&
        worldPoint.x <= selectionBounds.x + selectionBounds.w &&
        worldPoint.y >= selectionBounds.y &&
        worldPoint.y <= selectionBounds.y + selectionBounds.h
      ) {
        onContextMenu?.(e, { selectionContext: true });
        return;
      }
    }
    onContextMenu?.(e);
  };

  // Double-click empty canvas → open add-node popover at click point
  const handleDoubleClick = (e) => {
    if (e.target !== rootRef.current && !e.target.classList.contains("canvas-bg")) return;
    onContextMenu?.(e, { compact: true });
  };

  const pointToWorld = (clientX, clientY) => {
    const rect = refreshRootRect();
    const point = clientToWorld(clientX, clientY, rect, view);
    return {
      x: point.x - 160,
      y: point.y - 110,
    };
  };

  const handleDragOver = (e) => {
    if (dataTransferHasStoryboardCollectorItem(e.dataTransfer)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      return;
    }
    if (!Array.from(e.dataTransfer?.types || []).includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    const storyboardItem = readStoryboardCollectorDragPayload(e.dataTransfer);
    if (storyboardItem) {
      e.preventDefault();
      onStoryboardCollectorDropItem?.(
        storyboardItem.collectorId,
        storyboardItem.itemId,
        pointToWorld(e.clientX, e.clientY),
      );
      return;
    }
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    e.preventDefault();
    onDropFiles?.(files, pointToWorld(e.clientX, e.clientY));
  };

  const selectedWorkbenchNodeId = selection.length === 1 ? selection[0] : null;
  const activeWorkbenchNodeId = selectedWorkbenchNodeId === suppressedWorkbenchNodeId
    ? null
    : selectedWorkbenchNodeId;
  const deferredWorkbenchNodeId = useDeferredWorkbenchNodeId(activeWorkbenchNodeId);

  return (
    <CanvasElementRegistryContext.Provider value={elementRegistryRef.current}>
      <ViewportContext.Provider value={ctxValue}>
      <div
        ref={rootRef}
        className="canvas-root"
        data-onboarding-id="canvas-results-area"
        onPointerDown={onRootPointerDown}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <style>{canvasStyles}</style>
        <div ref={bgRef} className={`canvas-bg ${bgStyle}`} style={backgroundStyle}/>
        <div className="canvas-world" ref={worldRef} style={worldStyle}>
          <CanvasWorldContent
            backgroundPanelNodeIds={backgroundPanelNodeIds}
            onBackgroundPanelPointerDown={onBackgroundPanelPointerDown}
            onBackgroundPanelContextMenu={handleBackgroundPanelContextMenu}
            edges={edges}
            onDeleteEdge={deleteEdge}
            tempEdge={tempEdge}
            selection={selection}
            groupNodeIds={groupNodeIds}
            onGroupFramePointerDown={onGroupFramePointerDown}
            onGroupContextMenu={onGroupContextMenu}
            onStartEdge={onStartEdge}
            onGroupFrameResizeStart={onGroupFrameResizeStart}
            onGroupRun={handleGroupRun}
            drawableNodeIds={drawableNodeIds}
            projectId={projectId}
            onNodePointerDown={onNodePointerDown}
            onNodeResizeStart={onNodeResizeStart}
            onNodeSelect={onNodeSelect}
            onOpenModal={handleOpenModal}
            onGenerate={handleGenerate}
            onUpdateNode={handleUpdateNode}
            onGeneratePanorama={handleGeneratePanorama}
            onNodeContextMenu={handleNodeContextMenu}
            onCreateNode={handleCreateNode}
            onCreateEdge={handleCreateEdge}
            onStoryboardCollectorRestoreItem={handleStoryboardCollectorRestoreItem}
            deferredWorkbenchNodeId={deferredWorkbenchNodeId}
            onRunSlash={handleRunSlash}
            marquee={marquee}
            backgroundPanelDraft={backgroundPanelDraft}
          />
        </div>
        <MiniMap />
      </div>
      </ViewportContext.Provider>
    </CanvasElementRegistryContext.Provider>
  );
});
