export const canvasStyles = `
.canvas-root {
  position:absolute; inset:0; overflow:hidden;
  background: var(--bg);
  cursor: grab;
  user-select:none;
  -webkit-user-select:none;
  touch-action:none;
}
.canvas-root img,
.canvas-root video,
.canvas-root svg {
  -webkit-user-drag:none;
}
.canvas-root input,
.canvas-root textarea,
.canvas-root select,
.canvas-root [contenteditable="true"],
.canvas-root [contenteditable=""],
.canvas-root [contenteditable="plaintext-only"] {
  user-select:text;
  -webkit-user-select:text;
  touch-action:auto;
}
.canvas-root::before {
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(116deg, color-mix(in oklab, var(--accent) 11%, transparent) 0%, transparent 38%),
    linear-gradient(27deg, transparent 48%, color-mix(in oklab, var(--accent-2) 9%, transparent) 100%),
    linear-gradient(180deg, color-mix(in oklab, #07121f 48%, var(--bg)) 0%, var(--bg) 54%, #05070b 100%);
}
.canvas-root::after {
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(90deg, rgba(255,255,255,.026) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,.018) 1px, transparent 1px);
  background-size: 96px 96px;
  mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%);
  opacity:.42;
}
.theme-a .canvas-root {
  background: #EAF6FF;
}
.theme-a .canvas-root::before {
  background:
    radial-gradient(ellipse 78% 58% at 50% 28%, rgba(248,252,255,.86) 0%, rgba(215,236,255,.58) 52%, transparent 80%),
    radial-gradient(ellipse 55% 44% at 18% 78%, rgba(85,182,242,.20) 0%, transparent 64%),
    radial-gradient(ellipse 52% 42% at 82% 22%, rgba(247,109,158,.16) 0%, transparent 68%),
    linear-gradient(180deg, #F8FCFF 0%, #EAF6FF 58%, #D7ECFF 100%);
}
.theme-a .canvas-root::after {
  background:
    radial-gradient(rgba(85,182,242,.075) 1px, transparent 1.4px);
  background-size: 6px 6px;
  mask-image: none;
  opacity:.48;
}
.theme-b .canvas-root {
  background: #0D0F0E;
}
.theme-b .canvas-root::before {
  background:
    radial-gradient(ellipse 78% 58% at 50% 28%, rgba(38,36,31,.66) 0%, rgba(23,24,23,.54) 52%, transparent 80%),
    radial-gradient(ellipse 55% 44% at 18% 78%, rgba(198,166,106,.070) 0%, transparent 64%),
    radial-gradient(ellipse 44% 38% at 86% 16%, rgba(159,117,101,.055) 0%, transparent 68%),
    linear-gradient(180deg, #171817 0%, #0D0F0E 58%, #080908 100%);
}
.theme-b .canvas-root::after {
  background:
    radial-gradient(rgba(198,166,106,.034) 1px, transparent 1.4px);
  background-size: 5px 5px;
  mask-image: none;
  opacity:.42;
}
.canvas-root.panning { cursor: grabbing; }
.canvas-bg {
  position:absolute; inset:-220px;
  background-color: transparent;
  background-image:
    radial-gradient(circle, color-mix(in oklab, var(--accent) 14%, var(--ink-mute)) 1px, transparent 1.65px),
    linear-gradient(180deg, transparent 0%, rgba(0,0,0,.08) 100%);
  background-size: calc(24px * var(--s, 1)) calc(24px * var(--s, 1));
  background-position: 0 0;
  opacity:.48;
  transform:translate3d(0, 0, 0);
  transform-origin:0 0;
  will-change: transform;
  pointer-events:none;
}
.theme-a .canvas-bg {
  background-image:
    radial-gradient(circle, rgba(85,182,242,.34) 1px, transparent 1.7px),
    radial-gradient(circle, rgba(247,109,158,.18) 1px, transparent 1.8px);
  background-size: calc(24px * var(--s, 1)) calc(24px * var(--s, 1)), calc(72px * var(--s, 1)) calc(72px * var(--s, 1));
  background-position: 0 0, 12px 12px;
  opacity:.62;
}
.theme-b .canvas-bg {
  background-image:
    radial-gradient(circle, rgba(198,166,106,.26) 1px, transparent 1.7px),
    radial-gradient(circle, rgba(111,139,107,.14) 1px, transparent 1.8px);
  background-size: calc(24px * var(--s, 1)) calc(24px * var(--s, 1)), calc(72px * var(--s, 1)) calc(72px * var(--s, 1));
  background-position: 0 0, 12px 12px;
  opacity:.50;
}
.canvas-bg.grid {
  background-image:
    linear-gradient(to right, color-mix(in oklab, var(--accent) 12%, var(--line)) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--accent) 10%, var(--line)) 1px, transparent 1px),
    linear-gradient(180deg, transparent 0%, rgba(0,0,0,.14) 100%);
}
.theme-b .canvas-bg.grid {
  background-image:
    radial-gradient(circle, rgba(198,166,106,.22) 1px, transparent 1.7px),
    radial-gradient(circle, rgba(111,139,107,.12) 1px, transparent 1.8px);
  background-size: calc(24px * var(--s, 1)) calc(24px * var(--s, 1)), calc(72px * var(--s, 1)) calc(72px * var(--s, 1));
  background-position: 0 0, 12px 12px;
  opacity:.42;
}
.canvas-bg.solid { background-image: none; }

.canvas-world {
  position:absolute; left:0; top:0;
  transform-origin: 0 0;
  will-change: transform;
}
.node-workbench.fast-dragging {
  transition: none;
  will-change: transform;
}
.node.fast-dragging .image-node-action-dock,
.node.fast-dragging .media-node-preview-button {
  opacity:0 !important;
  pointer-events:none !important;
}
.node.fast-dragging video {
  pointer-events:none;
}
.group-frame.fast-dragging {
  transition:none;
  will-change: transform;
}
.background-panel.fast-dragging {
  transition:none;
  will-change: transform;
}
.canvas-root.canvas-interacting .node,
.canvas-root.canvas-interacting .node-toolbar,
.canvas-root.canvas-interacting .node-workbench,
.canvas-root.canvas-interacting .background-panel,
.canvas-root.canvas-interacting .image-node-action-dock,
.canvas-root.canvas-interacting .media-node-preview-button {
  transition:none !important;
}
.canvas-root.canvas-interacting .node,
.canvas-root.canvas-interacting .node-workbench,
.canvas-root.canvas-interacting .node-toolbar {
  box-shadow:none !important;
  backdrop-filter:none !important;
}
.canvas-root.canvas-interacting .image-node-action-dock,
.canvas-root.canvas-interacting .media-node-preview-button {
  opacity:0 !important;
  pointer-events:none !important;
}
.canvas-root.canvas-interacting video {
  pointer-events:none;
}

.minimap {
  position:absolute;
  left:18px;
  bottom:14px;
  z-index:45;
  pointer-events:auto;
  touch-action:none;
}
.minimap button,
.minimap-panel {
  pointer-events:auto;
}
.minimap-toggle {
  width:34px;
  height:34px;
  display:inline-grid;
  place-items:center;
  padding:0;
  border:1px solid color-mix(in oklab, var(--line) 80%, transparent);
  border-radius: var(--radius-sm);
  background: color-mix(in oklab, var(--paper) 90%, transparent);
  color: var(--ink);
  box-shadow: var(--shadow-card);
  cursor:pointer;
}
.minimap-toggle:hover,
.minimap-toggle:focus-visible,
.minimap-toggle.active {
  border-color: color-mix(in oklab, var(--accent) 70%, var(--line));
  background: color-mix(in oklab, var(--accent) 10%, var(--paper));
  outline:none;
}
.minimap-panel {
  position:absolute;
  left:0;
  bottom:42px;
  width:204px;
  padding:8px;
  border:1px solid color-mix(in oklab, var(--line) 82%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in oklab, var(--paper) 90%, transparent);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(14px);
}
.minimap-head {
  height:18px;
  display:flex;
  align-items:center;
  margin-bottom:6px;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size:11px;
}
.map-canvas {
  position:relative;
  width:188px;
  height:118px;
  overflow:hidden;
  border:1px solid color-mix(in oklab, var(--line) 78%, transparent);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle, color-mix(in oklab, var(--accent) 14%, transparent) 1px, transparent 1.6px),
    color-mix(in oklab, var(--bg) 76%, var(--paper));
  background-size: 12px 12px;
  cursor:crosshair;
}
.map-readout {
  position:absolute;
  left:8px;
  top:7px;
  z-index:3;
  padding:2px 6px;
  border-radius: var(--radius-sm);
  background: color-mix(in oklab, var(--paper) 88%, transparent);
  border:1px solid color-mix(in oklab, var(--line) 60%, transparent);
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size:10px;
  pointer-events:none;
}
.map-canvas .map-node {
  position:absolute;
  display:block;
  z-index:1;
  box-sizing:border-box;
  min-width:0;
  border-radius:2px;
  background: color-mix(in oklab, var(--accent) 42%, var(--paper));
  border:1px solid color-mix(in oklab, var(--accent) 78%, transparent);
  opacity:.82;
  pointer-events:none;
}
.map-canvas .map-node.video {
  background: color-mix(in oklab, var(--accent-2) 36%, var(--paper));
  border-color: color-mix(in oklab, var(--accent-2) 72%, transparent);
}
.map-canvas .map-node.script,
.map-canvas .map-node.asset-gen {
  background: color-mix(in oklab, var(--ink-soft) 24%, var(--paper));
  border-color: color-mix(in oklab, var(--ink-soft) 56%, transparent);
}
.map-canvas.compact .map-node {
  border-radius:999px;
  border-width:0;
  opacity:.74;
}
.map-vp {
  position:absolute;
  display:block;
  z-index:2;
  border:1.5px solid color-mix(in oklab, var(--accent) 88%, var(--ink));
  background: color-mix(in oklab, var(--accent) 10%, transparent);
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--paper) 60%, transparent);
  pointer-events:none;
}

.edges {
  position:absolute;
  left:0;
  top:0;
  width:1px;
  height:1px;
  overflow:visible;
  pointer-events:none;
  --edge-line: color-mix(in oklab, var(--accent) 68%, transparent);
  --edge-pulse: color-mix(in oklab, var(--accent) 82%, #fff 18%);
}
.theme-a .edges {
  --edge-line: rgba(85,182,242,.48);
  --edge-pulse: rgba(47,177,242,.92);
}
.theme-b .edges {
  --edge-line: rgba(198,166,106,.46);
  --edge-pulse: rgba(238,203,132,.95);
}
.edge {
  fill:none;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.edge-base {
  stroke: var(--edge-line);
  stroke-width: 1.35;
}
.edge-pulse {
  stroke: var(--edge-pulse);
  stroke-width: 2.25;
  stroke-dasharray: 44 260;
  stroke-dashoffset: 0;
  opacity:.88;
  animation: canvas-edge-pulse 2.45s linear infinite;
}
.edge.dashed {
  stroke: var(--edge-line);
  stroke-width: 1.35;
  stroke-dasharray: 6 4;
  opacity:.82;
}
.edge-arrow {
  fill: var(--edge-pulse);
}
.edge-delete {
  pointer-events:auto;
  cursor:pointer;
  opacity:1;
  transition: opacity .16s ease, transform .16s ease;
}
.edge-group:hover .edge-delete,
.edge-delete:focus-visible {
  opacity:1;
}
.edge-delete circle {
  fill: color-mix(in oklab, var(--paper) 94%, transparent);
  stroke: color-mix(in oklab, var(--accent) 72%, var(--line));
  stroke-width: 1.2;
}
.edge-delete path {
  fill:none;
  stroke: var(--ink);
  stroke-width: 1.6;
  stroke-linecap: round;
}
.edge-delete:hover circle,
.edge-delete:focus-visible circle {
  fill: color-mix(in oklab, var(--accent) 13%, var(--paper));
  stroke: var(--accent);
}
.canvas-root.canvas-interacting .edge-pulse,
.canvas-root.canvas-interacting .edge-delete {
  display:none;
}
@keyframes canvas-edge-pulse {
  from { stroke-dashoffset: 304; }
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .edge-pulse {
    animation: none;
    stroke-dashoffset: 0;
  }
}

.marquee {
  position:absolute; pointer-events:none;
  border: 1.5px dashed var(--accent);
  background: color-mix(in oklab, var(--accent) 8%, transparent);
}

.background-panel,
.background-panel-draft {
  position:absolute;
  box-sizing:border-box;
  border-radius: 8px;
}
.background-panel {
  --background-panel-color: #D7ECFF;
  border: 1.5px solid color-mix(in oklab, var(--background-panel-color) 72%, var(--line));
  background:
    linear-gradient(180deg, rgba(255,255,255,.32), transparent 42%),
    repeating-linear-gradient(0deg, transparent 0 23px, color-mix(in oklab, var(--background-panel-color) 28%, transparent) 23px 24px),
    repeating-linear-gradient(90deg, transparent 0 23px, color-mix(in oklab, var(--background-panel-color) 28%, transparent) 23px 24px),
    color-mix(in oklab, var(--background-panel-color) 28%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in oklab, #fff 34%, transparent),
    0 18px 46px -34px color-mix(in oklab, var(--background-panel-color) 54%, #000);
  cursor: grab;
  pointer-events:auto;
  transition:border-color .16s ease, box-shadow .16s ease, background .16s ease;
}
.background-panel:active { cursor: grabbing; }
.background-panel.selected {
  border-color: color-mix(in oklab, var(--accent) 82%, var(--background-panel-color));
  box-shadow:
    inset 0 0 0 1px color-mix(in oklab, #fff 42%, transparent),
    0 0 0 3px color-mix(in oklab, var(--accent) 14%, transparent),
    0 20px 54px -34px color-mix(in oklab, var(--background-panel-color) 62%, #000);
}
.background-panel-title {
  position:absolute;
  left:10px;
  top:8px;
  display:inline-flex;
  align-items:center;
  gap:7px;
  max-width:calc(100% - 20px);
  height:24px;
  padding:0 9px;
  border:1px solid color-mix(in oklab, var(--background-panel-color) 58%, var(--line));
  border-radius: 7px;
  background: color-mix(in oklab, var(--paper) 82%, transparent);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size:11px;
  box-shadow:0 8px 24px -18px rgba(0,0,0,.45);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  pointer-events:none;
}
.background-panel-swatch {
  flex:0 0 auto;
  width:10px;
  height:10px;
  border-radius:3px;
  background: var(--background-panel-color);
  border:1px solid color-mix(in oklab, var(--ink) 18%, transparent);
}
.background-panel-draft {
  pointer-events:none;
  border:1.5px dashed color-mix(in oklab, var(--accent) 76%, var(--line));
  background: color-mix(in oklab, var(--accent) 10%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, #fff 30%, transparent);
}

.group-box {
  position:absolute;
  border: 1.5px dashed var(--ink-soft);
  border-radius: var(--radius-md);
  background: color-mix(in oklab, var(--ink) 2%, transparent);
  pointer-events:none;
}
.group-box .gb-label {
  position:absolute; left:8px; top:-22px;
  padding:2px 8px; font-family: var(--font-mono); font-size:10px;
  background: var(--paper); border:1px solid var(--line);
  border-radius: var(--radius-sm); color: var(--ink);
  pointer-events:auto;
}

.group-frame {
  position:absolute;
  border: 1.5px solid color-mix(in oklab, var(--ink-soft) 52%, transparent);
  border-radius: 14px;
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--accent) 5%, transparent), transparent 45%),
    color-mix(in oklab, var(--paper) 18%, transparent);
  pointer-events:none;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--paper) 25%, transparent);
}
.group-frame.selected {
  border-color: color-mix(in oklab, var(--accent) 78%, var(--ink));
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--accent) 8%, transparent), transparent 52%),
    color-mix(in oklab, var(--accent) 4%, transparent);
}
.group-frame-label {
  position:absolute;
  left:12px;
  top:-26px;
  display:inline-flex;
  align-items:center;
  gap:8px;
  height:22px;
  padding:0 9px;
  border-radius: var(--radius-sm);
  background: color-mix(in oklab, var(--paper) 94%, transparent);
  border:1px solid var(--line);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size:10px;
  cursor: grab;
  pointer-events:auto;
  box-shadow: var(--shadow-card);
}
.group-frame-label:active { cursor: grabbing; }
.group-frame-label em {
  font-style:normal;
  color: var(--ink-mute);
}
.group-frame-run {
  position:absolute;
  right:10px;
  top:-27px;
  width:24px;
  height:24px;
  border-radius:999px;
  border:1px solid color-mix(in oklab, var(--accent) 58%, var(--line));
  background: color-mix(in oklab, var(--paper) 94%, transparent);
  color: var(--accent);
  pointer-events:auto;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow: var(--shadow-card);
}
.group-frame-run:hover {
  background: color-mix(in oklab, var(--accent) 12%, var(--paper));
  border-color: var(--accent);
}
.group-frame-run span {
  font-size:11px;
  line-height:1;
  transform: translateX(1px);
}
.group-handle {
  position:absolute;
  top:50%;
  width:22px;
  height:22px;
  margin-top:-11px;
  border:1px solid color-mix(in oklab, var(--ink-soft) 46%, transparent);
  border-radius:999px;
  background:color-mix(in oklab, var(--paper) 94%, transparent);
  color:var(--ink-mute);
  pointer-events:auto;
  cursor:crosshair;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 4px 14px -10px rgba(0,0,0,.6);
}
.group-handle::before { content:"+"; font-size:14px; line-height:1; }
.group-handle.l { left:-12px; }
.group-handle.r { right:-12px; }
.group-frame:hover .group-handle,
.group-frame.selected .group-handle { border-color:color-mix(in oklab, var(--accent) 62%, var(--line)); color:var(--accent); }
.group-frame-resize {
  position:absolute;
  right:-5px;
  bottom:-5px;
  width:16px;
  height:16px;
  border-radius:4px 0 8px 0;
  border-right:2px solid color-mix(in oklab, var(--accent) 70%, var(--line));
  border-bottom:2px solid color-mix(in oklab, var(--accent) 70%, var(--line));
  background: color-mix(in oklab, var(--paper) 78%, transparent);
  pointer-events:auto;
  cursor:nwse-resize;
  box-shadow:0 4px 10px -8px rgba(0,0,0,.8);
}
.group-frame-resize::before,
.group-frame-resize::after {
  content:"";
  position:absolute;
  right:3px;
  bottom:3px;
  width:7px;
  height:7px;
  border-right:1px solid color-mix(in oklab, var(--accent) 56%, var(--line));
  border-bottom:1px solid color-mix(in oklab, var(--accent) 56%, var(--line));
}
.group-frame-resize::after {
  right:6px;
  bottom:6px;
  width:4px;
  height:4px;
}
`;
