export const nodeStyles = `
.node {
  position:absolute;
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--paper-3, var(--paper-2)) 34%, transparent) 0%, transparent 42%),
    color-mix(in oklab, var(--paper) 94%, transparent);
  border: 1px solid color-mix(in oklab, var(--line) 92%, var(--accent) 8%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  font-family: var(--font-body);
  color: var(--ink);
  user-select:none;
  transition: box-shadow .15s ease, border-color .15s ease, transform .05s;
  overflow:visible;
  display:flex; flex-direction:column;
  backdrop-filter: blur(10px);
}
.node::before {
  content:"";
  position:absolute;
  left:12px;
  right:12px;
  top:0;
  height:1px;
  background:linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 42%, white), color-mix(in oklab, var(--accent-2) 36%, white), transparent);
  opacity:.55;
  pointer-events:none;
}
.node.selected {
  border-color: color-mix(in oklab, var(--accent) 72%, var(--ink));
  border-style: solid;
  box-shadow: var(--shadow-float), var(--shadow-glow);
}
.node.dragging { cursor: grabbing; }
.node.fast-dragging {
  cursor: grabbing;
  transition: none;
  will-change: transform;
}
.theme-b .node { border-width:1.5px; }

/* ── Empty-state pattern (figures 003, 005, 007, 009, 011) ── */
.node.empty .node-body {
  display:flex; flex-direction:column;
  padding: 0;
}
.node-empty {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:flex-start;
  padding: 18px 14px 14px;
  position:relative;
}
.node-empty .empty-icon {
  width:54px; height:54px; border-radius:14px;
  background: color-mix(in oklab, var(--ink) 6%, var(--paper-2));
  border:1px solid var(--line-soft);
  display:flex; align-items:center; justify-content:center;
  color: var(--ink-mute);
  margin-top: 12px; margin-bottom: 18px;
}
.theme-b .node-empty .empty-icon { background: var(--paper-2); }
.node-empty .empty-up {
  position:absolute; top:-14px; left:50%; transform:translateX(-50%);
  display:inline-flex; align-items:center; gap:5px;
  padding: 4px 12px; border-radius: 999px;
  background: color-mix(in oklab, var(--paper) 92%, transparent);
  border:1px solid var(--line);
  color: var(--ink-soft); font-size: 11px; cursor:pointer;
  backdrop-filter: blur(6px);
}
.node-empty .empty-up:hover { color: var(--accent); border-color: var(--accent); }
.node-empty .try-label {
  align-self:flex-start; padding-left: 8px;
  font-size: 12px; color: var(--ink-mute);
  margin-bottom: 6px; font-family: var(--font-body);
}
.node-empty .try-list {
  width:100%; display:flex; flex-direction:column; gap: 2px;
}
.node-empty .try-item {
  display:flex; align-items:center; gap:10px;
  padding: 7px 10px; border-radius: 8px;
  font-size: 13px; color: var(--ink-soft); cursor: pointer;
  font-family: var(--font-body);
  transition: background .12s, color .12s;
}
.node-empty .try-item:hover {
  background: color-mix(in oklab, var(--accent) 10%, var(--paper-2));
  color: var(--ink);
}
.node-empty .try-item.disabled {
  cursor: default;
  opacity: .45;
}
.node-empty .try-item.disabled:hover {
  background: transparent;
  color: var(--ink-soft);
}
.node-empty .try-item .ti-ic {
  width: 22px; height: 22px; display:flex; align-items:center; justify-content:center;
  color: var(--ink-mute);
}
.node-empty .try-item:hover .ti-ic { color: var(--accent); }
.node-empty .try-item.disabled:hover .ti-ic { color: var(--ink-mute); }
.node-empty .try-soon {
  margin-left:auto;
  font-size: 9px;
  font-family: var(--font-mono);
  color: var(--ink-mute);
}

/* generation status indicator overlay */
.gen-overlay {
  position:absolute; inset:0;
  background: color-mix(in oklab, var(--paper) 70%, transparent);
  backdrop-filter: blur(2px);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap: 8px; color: var(--accent);
  font-family: var(--font-mono); font-size: 11px;
  z-index: 4;
}
.gen-overlay .spin {
  width: 26px; height: 26px; border-radius:50%;
  border: 2px solid color-mix(in oklab, var(--accent) 40%, transparent);
  border-top-color: var(--accent);
  animation: nspin .8s linear infinite;
}
@keyframes nspin { to { transform: rotate(360deg); } }
.gen-overlay .pct {
  font-family: var(--font-mono); font-size: 12px;
  color: var(--ink); letter-spacing: .03em;
}
.gen-overlay .label { font-size:10px; color: var(--ink-mute); letter-spacing:.04em; }

.node-head {
  display:flex; align-items:center; gap:6px;
  padding: 6px 10px 4px;
  font-size:11px; color: var(--ink-mute);
  cursor: grab;
  background: linear-gradient(180deg, color-mix(in oklab, var(--paper-2) 52%, transparent), transparent);
  border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
}
.node-head .kind-icon { display:inline-flex; color: var(--ink-mute); }
.node-head .title {
  flex:1; font-size:12px; color: var(--ink-soft);
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.handle span { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color: var(--bg); font-size:9px; font-weight:700; line-height:1; pointer-events:none; }

.node-body { flex:1; display:flex; flex-direction:column; min-height:0; position:relative; overflow:hidden; }

.node-foot {
  display:flex; align-items:center; gap:6px; padding:6px 8px;
  font-family: var(--font-mono); font-size:10px; color: var(--ink-mute);
  border-top:1px solid var(--line-soft);
  background:
    linear-gradient(90deg, color-mix(in oklab, var(--accent) 5%, transparent), transparent 62%),
    color-mix(in oklab, var(--paper) 90%, var(--bg));
  border-radius: 0 0 calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px);
}
.node-foot .badge {
  padding:1px 6px; border-radius: var(--radius-sm);
  background: color-mix(in oklab, var(--accent) 18%, var(--paper));
  color: color-mix(in oklab, var(--accent) 86%, white); font-weight:600;
  border:1px solid color-mix(in oklab, var(--accent) 25%, transparent);
}
.node-foot .dur { margin-left:auto; }

/* handles — 漫创AI "+" connector nubs */
.handle {
  position:absolute; width:30px; height:30px; border-radius:50%;
  background: color-mix(in oklab, var(--paper) 86%, transparent);
  border: 1px solid color-mix(in oklab, var(--accent) 35%, var(--line));
  top:50%; transform: translateY(-50%);
  cursor: crosshair; z-index:5;
  display:flex; align-items:center; justify-content:center;
  color: var(--ink-mute); font-size:18px; font-weight:500;
  opacity:0;
  pointer-events:auto;
  transition: color .1s, border-color .1s, background .1s, opacity .1s;
}
.node.selected .handle,
.node:hover .handle {
  opacity:1;
  pointer-events:auto;
}
.handle:hover { border-color: var(--accent); color: var(--accent); opacity:1; }
.handle.l { left:-38px; }
.handle.r { right:-38px; }
.handle::before { content:"+"; line-height:1; }
.handle span { display:none; }

/* specific node types */
.node.image .node-body img,
.node.image .node-body .ph {
  width:100%; height:100%; object-fit:contain; display:block;
}
.image-node-media {
  position:relative;
  width:100%;
  height:100%;
  min-height:0;
  overflow:hidden;
}
.image-node-seedence-badge {
  position:absolute;
  right:8px;
  top:8px;
  z-index:10;
  max-width:calc(100% - 16px);
  height:20px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:0 7px;
  border-radius:999px;
  border:1px solid color-mix(in oklab, #14b8a6 56%, var(--line));
  background:color-mix(in oklab, var(--paper) 88%, transparent);
  color:color-mix(in oklab, #14b8a6 88%, var(--ink));
  box-shadow:var(--shadow-float);
  backdrop-filter:blur(10px);
  font-family:var(--font-mono);
  font-size:9px;
  font-weight:700;
  line-height:1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  pointer-events:auto;
}
.image-node-action-dock {
  position:absolute;
  left:50%;
  bottom:10px;
  z-index:9;
  transform:translateX(-50%);
  display:flex;
  align-items:center;
  gap:0;
  max-width:calc(100% - 12px);
  padding:4px;
  border:1px solid color-mix(in oklab, var(--line) 84%, transparent);
  border-radius:999px;
  background:color-mix(in oklab, var(--paper) 90%, transparent);
  box-shadow:var(--shadow-float);
  backdrop-filter:blur(12px);
  opacity:0;
  pointer-events:none;
  transition:opacity .14s ease, transform .16s ease;
}
.node.image:hover .image-node-action-dock,
.node.image.selected .image-node-action-dock {
  opacity:1;
  pointer-events:auto;
  transform:translateX(-50%) translateY(0);
}
.image-node-action-dock button {
  height:26px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:3px;
  border:none;
  border-radius:999px;
  background:transparent;
  color:var(--ink-soft);
  cursor:pointer;
  font-family:var(--font-body);
  font-size:10px;
  white-space:nowrap;
  transition:background .12s ease, color .12s ease;
}
.image-node-action-dock button:hover {
  background:color-mix(in oklab, var(--accent) 12%, var(--paper-2));
  color:var(--ink);
}
.image-node-action-main {
  flex:0 0 auto;
  padding:0 8px;
  background:color-mix(in oklab, var(--accent) 14%, var(--paper-2)) !important;
  color:var(--ink) !important;
  font-weight:600;
}
.image-node-action-dock:hover .image-node-action-main,
.image-node-action-dock:focus-within .image-node-action-main {
  width:26px;
  padding:0;
}
.image-node-action-dock:hover .image-node-action-main span,
.image-node-action-dock:focus-within .image-node-action-main span {
  display:none;
}
.image-node-action-options {
  display:inline-flex;
  align-items:center;
  gap:1px;
  max-width:0;
  opacity:0;
  overflow:hidden;
  pointer-events:none;
  transition:max-width .2s ease, opacity .15s ease, margin-left .2s ease;
}
.image-node-action-dock:hover .image-node-action-options,
.image-node-action-dock:focus-within .image-node-action-options {
  max-width:280px;
  margin-left:3px;
  opacity:1;
  pointer-events:auto;
}
.image-node-action-options::before {
  content:"";
  width:1px;
  height:18px;
  margin:0 2px;
  background:var(--line-soft);
  flex:0 0 auto;
}
.image-node-action-options button {
  padding:0 5px;
}
.media-node-preview-button{position:absolute;left:50%;top:50%;z-index:10;width:46px;height:46px;display:inline-flex;align-items:center;justify-content:center;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.26);border-radius:999px;background:linear-gradient(135deg,rgba(8,10,14,.48),rgba(20,24,28,.34));color:#fff;box-shadow:0 18px 44px -24px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(14px);cursor:pointer;opacity:0;pointer-events:none;transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1),border-color .16s ease,background .16s ease,box-shadow .16s ease;}
.node.image:hover .media-node-preview-button,.node.video:hover .media-node-preview-button{opacity:.82;pointer-events:auto;background:linear-gradient(135deg,rgba(8,10,14,.64),rgba(20,24,28,.48));}
.media-node-preview-button:hover{transform:translate(-50%,-50%) scale(1.08);opacity:1;border-color:color-mix(in oklab,var(--accent) 62%,rgba(255,255,255,.3));background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 30%,rgba(8,10,14,.78)),rgba(20,24,28,.66));box-shadow:0 22px 52px -22px rgba(0,0,0,.98),0 0 0 6px color-mix(in oklab,var(--accent) 12%,transparent),inset 0 1px 0 rgba(255,255,255,.22);}
.media-node-preview-button:active{transform:translate(-50%,-50%) scale(.98);}
.media-node-preview-button:focus-visible{outline:2px solid color-mix(in oklab,var(--accent) 74%,white);outline-offset:3px;opacity:1;}
.media-node-preview-button svg{stroke:currentColor;}
.node.text .node-body {
  padding: 10px 12px;
  font-size:13px; line-height:1.55;
  color: var(--ink);
  font-family: var(--font-body);
}
.node.video .node-body { position:relative; background:#000; }
.node.video .node-body img { width:100%; height:100%; object-fit:contain; opacity:.9; background:#000; }
.node.video .node-body video { width:100%; height:100%; object-fit:contain; display:block; background:#000; }
.node.video .play {
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  color:#fff; pointer-events:none;
}
.node.video .play .disc {
  width:48px; height:48px; border-radius:50%; background: rgba(0,0,0,0.45);
  display:flex; align-items:center; justify-content:center;
  border: 1.5px solid rgba(255,255,255,0.7);
}
.node.video .duration {
  position:absolute; right:8px; bottom:8px; padding:2px 6px;
  background: rgba(0,0,0,0.55); color:#fff; font-family: var(--font-mono);
  font-size:10px; border-radius: var(--radius-sm);
}
.node.asset-gen .node-body {
  padding:0;
  background:
    radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 38%),
    color-mix(in oklab, var(--paper) 96%, var(--bg));
}
.asset-gen-panel {
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:10px;
  overflow:hidden;
}
.asset-gen-status {
  min-height:24px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  border-radius:8px;
  border:1px solid var(--line-soft);
  font-family:var(--font-mono);
  font-size:10px;
}
.asset-gen-status.running {
  color:var(--accent);
  background:color-mix(in oklab, var(--accent) 10%, var(--paper));
  border-color:color-mix(in oklab, var(--accent) 28%, var(--line));
}
.asset-gen-status.error {
  color:#ef4444;
  background:color-mix(in oklab, #ef4444 9%, var(--paper));
  border-color:color-mix(in oklab, #ef4444 25%, var(--line));
}
.asset-gen-status em {
  margin-left:auto;
  padding-right:8px;
  color:var(--ink-mute);
  font-style:normal;
}
.mini-spin {
  width:12px;
  height:12px;
  border-radius:50%;
  border:1.5px solid color-mix(in oklab, currentColor 30%, transparent);
  border-top-color:currentColor;
  animation:nspin .8s linear infinite;
}
.asset-gen-row {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  min-height:48px;
}
.asset-gen-row label {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:4px;
  color:var(--ink-mute);
  font-size:10px;
}
.asset-gen-row select,
.asset-gen-size select {
  width:100%;
  min-width:0;
  height:28px;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:var(--paper);
  color:var(--ink-soft);
  font-size:11px;
  outline:none;
}
.asset-gen-row select:focus,
.asset-gen-size select:focus,
.asset-gen-prompt:focus {
  border-color:color-mix(in oklab, var(--accent) 56%, var(--line));
}
.asset-gen-prompt {
  flex:1;
  min-height:0;
  min-height:92px;
  max-height:180px;
  width:100%;
  resize:none;
  border:1px solid var(--line-soft);
  border-radius:9px;
  background:color-mix(in oklab, var(--paper) 88%, var(--bg));
  color:var(--ink);
  padding:9px 10px;
  outline:none;
  font-family:var(--font-body);
  font-size:12px;
  line-height:1.55;
  overflow-y:auto;
  overscroll-behavior:contain;
}
.asset-gen-prompt::placeholder {
  color:var(--ink-mute);
}
.asset-gen-ref-strip {
  min-height:48px;
  display:flex;
  align-items:center;
  gap:8px;
  border:1px solid var(--line-soft);
  border-radius:9px;
  padding:7px;
  background:color-mix(in oklab, var(--paper-2) 64%, transparent);
  overflow:hidden;
}
.asset-gen-ref-label {
  flex:0 0 auto;
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
}
.asset-gen-refs {
  min-width:0;
  display:flex;
  gap:5px;
  overflow:hidden;
}
.asset-gen-ref {
  position:relative;
  flex:0 0 38px;
  width:38px;
  height:38px;
  border-radius:7px;
  overflow:hidden;
  border:1px solid var(--line);
  background:color-mix(in oklab, var(--paper-3) 78%, var(--bg));
}
.asset-gen-ref img {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.asset-gen-ref em {
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  display:block;
  padding:1px 2px;
  background:rgba(0,0,0,.52);
  color:#fff;
  font-size:8px;
  font-style:normal;
  text-align:center;
}
.asset-gen-no-ref {
  min-width:0;
  color:var(--ink-mute);
  font-size:11px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.asset-gen-bottom {
  position:relative;
  display:flex;
  align-items:center;
  gap:6px;
  min-height:34px;
  padding-top:7px;
  border-top:1px solid var(--line-soft);
}
.asset-gen-model {
  position:relative;
  flex:1;
  min-width:0;
}
.asset-gen-model-btn,
.asset-gen-submit {
  height:30px;
  display:flex;
  align-items:center;
  gap:6px;
  border-radius:8px;
  border:1px solid var(--line-soft);
  background:var(--paper-2);
  color:var(--ink-soft);
  cursor:pointer;
  font-size:11px;
}
.asset-gen-model-btn {
  width:100%;
  min-width:0;
  padding:0 8px;
}
.asset-gen-model-btn span:nth-child(2) {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.model-dot {
  width:7px;
  height:7px;
  flex:0 0 auto;
  border-radius:50%;
  background:var(--ink-mute);
}
.model-dot.ready {
  background:#22c55e;
  box-shadow:0 0 7px rgba(34,197,94,.7);
}
.asset-gen-model-menu {
  position:absolute;
  left:0;
  bottom:calc(100% + 6px);
  z-index:30;
  width:100%;
  min-width:100%;
  box-sizing:border-box;
  max-height:210px;
  overflow:auto;
  padding:5px;
  border:1px solid var(--line);
  border-radius:10px;
  background:var(--paper);
  box-shadow:var(--shadow-float);
}
.asset-gen-model-option {
  width:100%;
  min-height:30px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  border:none;
  border-radius:7px;
  background:transparent;
  color:var(--ink-soft);
  cursor:pointer;
  padding:6px 8px;
  font-size:11px;
  text-align:left;
}
.asset-gen-model-option:hover,
.asset-gen-model-option.active {
  background:color-mix(in oklab, var(--accent) 12%, var(--paper-2));
  color:var(--ink);
}
.asset-gen-model-option em {
  flex:0 0 auto;
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:9px;
  font-style:normal;
}
.asset-gen-model-option span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.asset-gen-size {
  flex:0 0 auto;
  display:flex;
  align-items:center;
  gap:3px;
  height:30px;
  padding:0 5px;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:var(--paper-2);
}
.asset-gen-size select {
  width:54px;
  height:24px;
  border:none;
  background:transparent;
  font-family:var(--font-mono);
  font-size:10px;
}
.asset-gen-size em {
  color:var(--ink-mute);
  font-style:normal;
}
.asset-gen-submit {
  flex:0 0 auto;
  padding:0 10px;
  border-color:color-mix(in oklab, var(--accent) 45%, var(--line));
  background:color-mix(in oklab, var(--accent) 18%, var(--paper-2));
  color:var(--ink);
  font-weight:700;
}
.asset-gen-submit:hover:not(:disabled) {
  background:color-mix(in oklab, var(--accent) 26%, var(--paper-2));
  border-color:var(--accent);
}
.asset-gen-submit:disabled {
  cursor:not-allowed;
  opacity:.45;
}
.asset-gen-prompt-preview {
  min-height:24px;
  display:flex;
  align-items:center;
  gap:6px;
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  overflow:hidden;
}
.asset-gen-prompt-preview span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.node.prompt-runner .node-body {
  padding:0;
  background:
    linear-gradient(180deg, color-mix(in oklab, #14b8a6 6%, transparent), transparent 42%),
    color-mix(in oklab, var(--paper) 96%, var(--bg));
}
.prompt-runner-panel {
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:10px;
  overflow:hidden;
}
.prompt-runner-status {
  min-height:28px;
  display:grid;
  grid-template-columns:12px minmax(0, 1fr) auto;
  align-items:center;
  gap:7px;
}
.prompt-runner-status strong {
  min-width:0;
  font-size:12px;
  color:var(--ink);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.prompt-runner-status em {
  max-width:160px;
  color:var(--ink-mute);
  font-style:normal;
  font-size:10px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.prompt-runner-dot {
  width:8px;
  height:8px;
  border-radius:50%;
  background:#ef4444;
  box-shadow:0 0 0 3px color-mix(in oklab, #ef4444 14%, transparent);
}
.prompt-runner-dot.ready {
  background:#14b8a6;
  box-shadow:0 0 0 3px color-mix(in oklab, #14b8a6 16%, transparent);
}
.prompt-runner-template-strip {
  flex:0 0 auto;
  display:grid;
  grid-template-columns:auto minmax(0, 1fr);
  gap:6px;
  align-items:center;
}
.prompt-runner-template-new,
.prompt-runner-template-list button,
.prompt-runner-bottom button {
  height:28px;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:color-mix(in oklab, var(--paper) 92%, var(--bg));
  color:var(--ink-soft);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:4px;
  padding:0 8px;
  font-size:11px;
  cursor:pointer;
}
.prompt-runner-template-new:hover,
.prompt-runner-template-list button:hover,
.prompt-runner-bottom button:hover:not(:disabled) {
  color:var(--ink);
  border-color:color-mix(in oklab, #14b8a6 48%, var(--line));
}
.prompt-runner-template-list {
  min-width:0;
  display:flex;
  gap:5px;
  overflow:auto hidden;
  scrollbar-width:thin;
}
.prompt-runner-template-list button {
  max-width:128px;
  flex:0 0 auto;
}
.prompt-runner-template-list button span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.prompt-runner-template-list button.active {
  color:var(--ink);
  background:color-mix(in oklab, #14b8a6 14%, var(--paper));
  border-color:color-mix(in oklab, #14b8a6 48%, var(--line));
}
.prompt-runner-muted {
  align-self:center;
  color:var(--ink-mute);
  font-size:11px;
  white-space:nowrap;
}
.prompt-runner-template-source {
  display:flex;
  flex-direction:column;
  gap:5px;
}
.prompt-runner-template-source.prompt-runner-template-dual {
  display:grid;
  grid-template-columns:minmax(0, 1fr) minmax(0, 1fr);
  gap:6px;
}
.prompt-runner-template-source label {
  display:flex;
  flex-direction:column;
  min-width:0;
  gap:5px;
}
.prompt-runner-template-source span {
  color:var(--ink-mute);
  font-size:10px;
  font-weight:700;
}
.prompt-runner-source-tabs {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:5px;
}
.prompt-runner-source-tabs button {
  min-width:0;
  height:30px;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 92%, var(--bg));
  color:var(--ink-soft);
  font-size:11px;
  cursor:pointer;
}
.prompt-runner-source-tabs button.active {
  color:var(--ink);
  border-color:color-mix(in oklab, #14b8a6 54%, var(--line));
  background:color-mix(in oklab, #14b8a6 12%, var(--paper));
}
.prompt-runner-template-source select {
  height:32px;
  width:100%;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 92%, var(--bg));
  color:var(--ink);
  font:inherit;
  font-size:11px;
  padding:0 9px;
  outline:none;
}
.prompt-runner-template-source select:focus {
  border-color:color-mix(in oklab, #14b8a6 56%, var(--line));
}
.prompt-runner-template-card {
  border:1px solid var(--line-soft);
  border-radius:9px;
  background:color-mix(in oklab, var(--paper-2) 45%, transparent);
  padding:8px 9px;
}
.prompt-runner-template-card strong {
  display:block;
  color:var(--ink);
  font-size:12px;
}
.prompt-runner-template-card p {
  margin:5px 0 0;
  color:var(--ink-mute);
  font-size:11px;
  line-height:1.45;
}
.prompt-runner-scroll {
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:8px;
  overflow:auto;
  padding-right:2px;
  overscroll-behavior:contain;
}
.prompt-runner-field {
  display:flex;
  flex-direction:column;
  gap:4px;
}
.prompt-runner-field span,
.prompt-runner-preview span,
.prompt-runner-result span {
  color:var(--ink-mute);
  font-size:10px;
  font-weight:700;
}
.prompt-runner-field input,
.prompt-runner-field textarea,
.prompt-runner-model select {
  width:100%;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:color-mix(in oklab, var(--paper) 92%, var(--bg));
  color:var(--ink);
  font:inherit;
  font-size:11px;
  outline:none;
}
.prompt-runner-field input {
  height:30px;
  padding:0 9px;
}
.prompt-runner-field textarea {
  min-height:58px;
  max-height:96px;
  resize:none;
  padding:8px 9px;
  line-height:1.45;
}
.prompt-runner-field input:focus,
.prompt-runner-field textarea:focus,
.prompt-runner-model select:focus {
  border-color:color-mix(in oklab, #14b8a6 56%, var(--line));
}
.prompt-runner-hint {
  color:var(--ink-mute);
  font-size:10px;
  line-height:1.35;
}
.prompt-runner-preview,
.prompt-runner-result {
  flex:0 0 auto;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:color-mix(in oklab, var(--paper-2) 45%, transparent);
  padding:7px 8px;
}
.prompt-runner-preview p,
.prompt-runner-result p {
  margin:4px 0 0;
  color:var(--ink-soft);
  font-size:11px;
  line-height:1.45;
  max-height:92px;
  overflow:auto;
  white-space:pre-wrap;
}
.prompt-runner-result {
  border-color:color-mix(in oklab, #22c55e 36%, var(--line-soft));
  background:color-mix(in oklab, #22c55e 7%, var(--paper));
}
.prompt-runner-error {
  flex:0 0 auto;
  border:1px solid color-mix(in oklab, #ef4444 42%, var(--line-soft));
  border-radius:7px;
  background:color-mix(in oklab, #ef4444 9%, var(--paper));
  color:#fca5a5;
  font-size:11px;
  line-height:1.4;
  padding:7px 8px;
}
.prompt-runner-bottom {
  flex:0 0 auto;
  display:grid;
  grid-template-columns:minmax(112px, 1fr) auto auto;
  align-items:center;
  gap:5px;
  min-height:32px;
}
.prompt-runner-model {
  position:relative;
  min-width:0;
  display:flex;
  align-items:center;
}
.prompt-runner-model select {
  height:28px;
  appearance:none;
  padding:0 23px 0 8px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.prompt-runner-model svg {
  position:absolute;
  right:7px;
  pointer-events:none;
  color:var(--ink-mute);
}
.prompt-runner-bottom button {
  min-width:0;
  padding:0 7px;
  white-space:nowrap;
}
.prompt-runner-bottom button.primary {
  color:white;
  border-color:color-mix(in oklab, #14b8a6 72%, var(--line));
  background:linear-gradient(180deg, #14b8a6, #0f766e);
}
.prompt-runner-bottom button:disabled {
  opacity:.45;
  cursor:not-allowed;
}
.prompt-template-designer-backdrop {
  position:fixed;
  inset:0;
  z-index:11900;
  display:grid;
  place-items:center;
  padding:20px;
  box-sizing:border-box;
  background:rgba(15, 23, 42, .46);
  isolation:isolate;
  backdrop-filter:blur(8px);
}
.prompt-template-designer {
  position:relative;
  z-index:1;
  width:min(1180px, calc(100vw - 40px));
  max-width:100%;
  height:min(760px, calc(100vh - 40px));
  max-height:100%;
  display:grid;
  grid-template-columns:minmax(170px, 210px) minmax(360px, 1fr) minmax(240px, 300px);
  grid-template-rows:52px minmax(0, 1fr);
  overflow:hidden;
  border:1px solid var(--line, #BFD8EE);
  border-radius:18px;
  background:var(--paper, #F8FCFF);
  box-shadow:0 34px 110px -44px rgba(31, 78, 121, .42), 0 0 0 1px rgba(255, 255, 255, .72) inset;
  color:var(--ink, #16233A);
  font-family:var(--font-body, "Noto Sans SC", "IBM Plex Sans", system-ui, sans-serif);
}
.prompt-template-designer-head {
  grid-column:1 / -1;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 16px;
  border-bottom:1px solid var(--line-soft, #D7E8F7);
  background:linear-gradient(180deg, var(--paper, #F8FCFF), var(--paper-2, #EAF4FF));
}
.prompt-template-designer-head strong {
  color:var(--ink, #16233A);
  font-size:15px;
}
.prompt-template-designer-list,
.prompt-template-editor,
.prompt-template-preview {
  min-height:0;
  overflow:auto;
  padding:14px;
}
.prompt-template-designer-list {
  border-right:1px solid var(--line-soft, #D7E8F7);
  background:var(--paper-2, #EAF4FF);
}
.prompt-template-editor {
  background:var(--paper, #F8FCFF);
}
.prompt-template-designer-tabs {
  color:var(--ink-mute, #6E87A3);
  font-size:12px;
  font-weight:700;
}
.prompt-template-designer-list button {
  width:100%;
  min-height:44px;
  margin-top:8px;
  border:1px solid var(--line-soft, #D7E8F7);
  border-radius:9px;
  background:var(--paper, #F8FCFF);
  color:var(--ink, #16233A);
  text-align:left;
  padding:7px 9px;
  cursor:pointer;
}
.prompt-template-designer-list button.active {
  border-color:var(--accent, #55B6F2);
  background:var(--accent-soft, #BFE7FF);
}
.prompt-template-designer-list button strong {
  display:block;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:12px;
}
.prompt-template-designer-list button span {
  display:block;
  margin-top:3px;
  color:var(--ink-mute, #6E87A3);
  font-size:11px;
}
.prompt-template-editor label,
.prompt-template-preview label {
  display:flex;
  flex-direction:column;
  gap:6px;
  margin-bottom:12px;
}
.prompt-template-editor label span,
.prompt-template-preview label span,
.prompt-template-composed span {
  color:var(--ink-mute, #6E87A3);
  font-size:12px;
  font-weight:700;
}
.prompt-template-editor input,
.prompt-template-editor textarea,
.prompt-template-preview textarea {
  width:100%;
  border:1px solid var(--line-soft, #D7E8F7);
  border-radius:9px;
  background:var(--paper, #F8FCFF);
  color:var(--ink, #16233A);
  font:inherit;
  outline:none;
}
.prompt-template-editor input {
  height:36px;
  padding:0 10px;
}
.prompt-template-content-field textarea {
  min-height:300px;
  resize:vertical;
  padding:10px;
  line-height:1.55;
}
.prompt-template-editor input:disabled,
.prompt-template-editor textarea:disabled {
  opacity:.78;
  cursor:not-allowed;
}
.prompt-template-hint {
  margin:0 0 12px;
  color:var(--ink-mute, #6E87A3);
  font-size:11px;
  line-height:1.45;
}
.prompt-template-preview {
  border-left:1px solid var(--line-soft, #D7E8F7);
  background:var(--paper-2, #EAF4FF);
}
.prompt-template-preview textarea {
  min-height:96px;
  resize:vertical;
  padding:10px;
}
.prompt-template-composed {
  border:1px dashed var(--line, #BFD8EE);
  border-radius:10px;
  padding:10px;
  background:var(--paper, #F8FCFF);
}
.prompt-template-composed p {
  max-height:260px;
  margin:8px 0 0;
  overflow:auto;
  white-space:pre-wrap;
  color:var(--ink-soft, #3D5774);
  font-size:12px;
  line-height:1.5;
}
.prompt-template-actions {
  display:flex;
  gap:8px;
  justify-content:flex-end;
}
.prompt-template-actions button,
.prompt-template-designer-head button,
.prompt-template-test,
.prompt-template-new {
  border:1px solid var(--line-soft, #D7E8F7);
  border-radius:9px;
  background:var(--paper, #F8FCFF);
  color:var(--ink, #16233A);
  min-height:32px;
  padding:0 10px;
  cursor:pointer;
}
.prompt-template-actions button,
.prompt-template-test {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
}
.prompt-template-error {
  margin-bottom:10px;
  border:1px solid color-mix(in oklab, #ef4444 42%, var(--line-soft));
  border-radius:9px;
  padding:8px 10px;
  color:#ef4444;
  font-size:12px;
}
@media (max-width: 920px) {
  .prompt-template-designer {
    grid-template-columns:minmax(0, 1fr);
    grid-template-rows:52px minmax(120px, 24%) minmax(260px, 1fr) minmax(160px, 30%);
  }
  .prompt-template-designer-list {
    border-right:0;
    border-bottom:1px solid var(--line-soft);
  }
  .prompt-template-preview {
    border-left:0;
    border-top:1px solid var(--line-soft);
  }
}
.node.director-stage {
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--paper-3) 28%, transparent), transparent 48%),
    color-mix(in oklab, var(--paper) 96%, transparent);
}
.node.director-stage .node-body {
  padding: 12px;
  background:
    radial-gradient(circle at 18% 0%, color-mix(in oklab, var(--accent) 11%, transparent), transparent 36%),
    color-mix(in oklab, var(--paper) 96%, var(--bg));
}
.director-stage-node-preview {
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:12px;
  border:1px solid color-mix(in oklab, var(--accent) 34%, var(--line));
  border-radius:12px;
  background:color-mix(in oklab, var(--paper-2) 80%, var(--bg));
  padding:16px;
  color:var(--ink);
  overflow:hidden;
}
.director-stage-node-preview .kicker {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  min-height:18px;
  color:color-mix(in oklab, var(--accent) 62%, var(--ink-soft));
  font-family:var(--font-mono);
  font-size:11px;
  text-transform:uppercase;
}
.director-stage-node-preview .title {
  font-size:18px;
  line-height:1.25;
  font-weight:700;
  color:var(--ink);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.director-stage-node-preview .stats {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:10px;
}
.director-stage-node-preview .stat {
  min-height:64px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:3px;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper-2) 72%, transparent);
  padding:10px;
}
.director-stage-node-preview .stat strong {
  color:var(--ink);
  font-family:var(--font-mono);
  font-size:24px;
  line-height:1;
}
.director-stage-node-preview .stat span {
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  letter-spacing:0;
}
.director-stage-node-preview .open {
  margin-top:auto;
  min-height:40px;
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  border:1px solid color-mix(in oklab, var(--accent) 52%, var(--line));
  border-radius:8px;
  background:color-mix(in oklab, var(--accent) 16%, var(--paper-2));
  color:var(--ink);
  cursor:pointer;
  font-size:13px;
  font-weight:700;
}
.director-stage-node-preview .open:hover {
  background:color-mix(in oklab, var(--accent) 24%, var(--paper-2));
  border-color:var(--accent);
}
.node.director-stage .node-foot {
  background:
    linear-gradient(90deg, color-mix(in oklab, var(--accent) 5%, transparent), transparent 62%),
    color-mix(in oklab, var(--paper) 90%, var(--bg));
}
.node.vr720-gen {
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--paper-3) 26%, transparent), transparent 48%),
    color-mix(in oklab, var(--paper) 96%, transparent);
}
.node.vr720-gen .node-body {
  padding:10px;
  background:
    radial-gradient(circle at 18% 0%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 34%),
    color-mix(in oklab, var(--paper) 96%, var(--bg));
}
.vr720-node {
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:9px;
  color:var(--ink);
  overflow:hidden;
}
.vr720-status {
  min-height:24px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  border:1px solid color-mix(in oklab, var(--accent) 30%, var(--line));
  border-radius:8px;
  background:color-mix(in oklab, var(--accent) 11%, var(--paper-2));
  color:color-mix(in oklab, var(--accent) 72%, var(--ink));
  font-family:var(--font-mono);
  font-size:10px;
}
.vr720-status.failed {
  justify-content:flex-start;
  padding:0 8px;
  border-color:color-mix(in oklab, #ef4444 42%, var(--line));
  background:color-mix(in oklab, #ef4444 12%, var(--paper-2));
  color:#fca5a5;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.vr720-spin {
  width:13px;
  height:13px;
  border-radius:50%;
  border:2px solid color-mix(in oklab, var(--accent) 28%, transparent);
  border-top-color:var(--accent);
  animation:nspin .8s linear infinite;
}
.vr720-status strong {
  color:var(--ink);
  font-size:11px;
}
.vr720-status em {
  font-style:normal;
  color:var(--ink-mute);
}
.vr720-node.generating .vr720-field select,
.vr720-node.generating .vr720-field textarea,
.vr720-node.generating .vr720-model {
  opacity:.72;
  cursor:not-allowed;
}
.vr720-field {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:5px;
}
.vr720-field.two {
  display:grid;
  grid-template-columns:minmax(0, 1fr) 88px;
  gap:8px;
}
.vr720-field.three {
  display:grid;
  grid-template-columns:minmax(0, 1fr) 82px 82px;
  gap:8px;
}
.vr720-field span {
  display:block;
  color:var(--ink-mute);
  font-size:10px;
  font-family:var(--font-mono);
}
.vr720-field select,
.vr720-field textarea,
.vr720-model {
  width:100%;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper-2) 76%, var(--bg));
  color:var(--ink);
  font-family:var(--font-body);
  font-size:12px;
  outline:none;
}
.vr720-field select,
.vr720-model {
  height:30px;
  padding:0 8px;
}
.vr720-field textarea {
  flex:1;
  min-height:70px;
  resize:none;
  padding:8px;
  line-height:1.45;
}
.vr720-field select:focus,
.vr720-field textarea:focus,
.vr720-model:focus {
  border-color:color-mix(in oklab, var(--accent) 60%, var(--line));
}
.vr720-refs {
  border:1px solid color-mix(in oklab, var(--accent) 22%, var(--line-soft));
  border-radius:10px;
  background:color-mix(in oklab, var(--paper-2) 50%, transparent);
  padding:8px;
}
.vr720-refs.empty {
  border-style:dashed;
}
.vr720-refs-head {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  color:var(--ink-mute);
  font-size:10px;
  font-family:var(--font-mono);
}
.vr720-refs-head span {
  display:inline-flex;
  align-items:center;
  gap:5px;
}
.vr720-refs-head em {
  font-style:normal;
}
.vr720-ref-list {
  display:flex;
  gap:6px;
  margin-top:7px;
  overflow:hidden;
}
.vr720-ref {
  position:relative;
  width:40px;
  height:40px;
  flex:0 0 auto;
  overflow:hidden;
  border-radius:10px;
  border:1px solid color-mix(in oklab, var(--accent) 35%, var(--line));
  background:color-mix(in oklab, var(--paper-3) 78%, var(--bg));
}
.vr720-ref img {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.vr720-ref span {
  position:absolute;
  left:3px;
  top:3px;
  width:15px;
  height:15px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  background:rgba(0,0,0,.62);
  color:#fff;
  font-size:9px;
  font-family:var(--font-mono);
}
.vr720-ref-empty {
  min-height:42px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  color:var(--ink-mute);
  font-size:11px;
}
.vr720-loading-panel {
  display:grid;
  grid-template-columns:54px minmax(0, 1fr);
  gap:8px 10px;
  align-items:center;
  padding:8px;
  border:1px solid color-mix(in oklab, var(--accent) 28%, var(--line-soft));
  border-radius:10px;
  background:
    linear-gradient(90deg, color-mix(in oklab, var(--accent) 10%, transparent), transparent 58%),
    color-mix(in oklab, var(--paper-2) 62%, transparent);
}
.vr720-orbit {
  position:relative;
  width:48px;
  height:48px;
  border-radius:50%;
  background:
    repeating-linear-gradient(90deg, color-mix(in oklab, var(--accent) 10%, transparent) 0 1px, transparent 1px 8px),
    repeating-linear-gradient(0deg, color-mix(in oklab, var(--accent) 8%, transparent) 0 1px, transparent 1px 8px);
  overflow:hidden;
}
.vr720-orbit-ring,
.vr720-orbit-ring.inner,
.vr720-orbit-sweep {
  position:absolute;
  inset:5px;
  border-radius:50%;
  border:1px solid color-mix(in oklab, var(--accent) 42%, transparent);
}
.vr720-orbit-ring.inner {
  inset:13px;
  border-style:dashed;
  border-color:color-mix(in oklab, var(--accent) 32%, transparent);
}
.vr720-orbit-sweep {
  inset:4px;
  border-color:transparent;
  border-top-color:var(--accent);
  border-right-color:color-mix(in oklab, var(--accent) 45%, transparent);
  animation:nspin 1.15s linear infinite;
}
.vr720-orbit-mark {
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  color:color-mix(in oklab, var(--accent) 74%, var(--ink));
  font-size:10px;
  font-family:var(--font-mono);
  font-weight:800;
}
.vr720-loading-copy {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
}
.vr720-loading-copy strong {
  color:var(--ink);
  font-size:12px;
}
.vr720-loading-copy span {
  color:var(--ink-mute);
  font-size:10px;
  font-family:var(--font-mono);
}
.vr720-progress {
  grid-column:1 / -1;
  position:relative;
  height:6px;
  overflow:hidden;
  border-radius:999px;
  background:color-mix(in oklab, var(--accent) 11%, var(--paper-3));
}
.vr720-progress-fill {
  position:absolute;
  inset:0 auto 0 0;
  min-width:10px;
  border-radius:inherit;
  background:
    repeating-linear-gradient(135deg, rgba(255,255,255,.38) 0 4px, transparent 4px 8px),
    color-mix(in oklab, var(--accent) 72%, #6ee7ff);
  animation:vr720-progress-shimmer 1.1s linear infinite;
}
@keyframes vr720-progress-shimmer {
  to { background-position:16px 0, 0 0; }
}
.vr720-footer {
  display:grid;
  grid-template-columns:minmax(0, 1fr) auto;
  gap:8px;
  align-items:center;
  margin-top:auto;
}
.vr720-generate {
  height:30px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:0 11px;
  border:1px solid color-mix(in oklab, var(--accent) 58%, var(--line));
  border-radius:8px;
  background:color-mix(in oklab, var(--accent) 22%, var(--paper-2));
  color:var(--ink);
  cursor:pointer;
  font-size:12px;
  font-weight:700;
}
.vr720-generate:hover:not(:disabled) {
  border-color:var(--accent);
  background:color-mix(in oklab, var(--accent) 30%, var(--paper-2));
}
.vr720-generate:disabled {
  cursor:not-allowed;
  opacity:.5;
}
.vr720-last {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  color:var(--ink-mute);
  font-size:10px;
  font-family:var(--font-mono);
  overflow:hidden;
}
.vr720-last em {
  min-width:0;
  font-style:normal;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.node.panorama-viewer {
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--paper-3) 24%, transparent), transparent 48%),
    color-mix(in oklab, var(--paper) 96%, transparent);
}
.node.panorama-viewer .node-body {
  padding:0;
  background:color-mix(in oklab, var(--paper) 96%, var(--bg));
}
.panorama-viewer-node {
  position:relative;
  flex:1;
  min-height:0;
  overflow:hidden;
  background:color-mix(in oklab, var(--paper) 96%, var(--bg));
}
.panorama-engine-host {
  position:absolute;
  inset:0;
  overflow:hidden;
  cursor:grab;
}
.panorama-engine-host:active {
  cursor:grabbing;
}
.panorama-viewer-node .node-blank-state {
  position:absolute;
  inset:0;
  z-index:2;
  background:
    radial-gradient(circle at 50% 34%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 42%),
    color-mix(in oklab, var(--paper) 94%, transparent);
}
.panorama-loading,
.panorama-error {
  position:absolute;
  inset:0;
  z-index:3;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  background:color-mix(in oklab, var(--paper) 78%, transparent);
  color:var(--ink);
  font-size:12px;
  font-family:var(--font-mono);
}
.panorama-loading em {
  font-style:normal;
  color:var(--ink-mute);
}
.panorama-error {
  color:#fca5a5;
}
.panorama-ratio-hint {
  position:absolute;
  left:10px;
  top:10px;
  z-index:4;
  max-width:calc(100% - 20px);
  padding:5px 8px;
  border:1px solid color-mix(in oklab, #f59e0b 34%, var(--line));
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 84%, transparent);
  color:color-mix(in oklab, #f59e0b 72%, var(--ink));
  font-family:var(--font-mono);
  font-size:10px;
  line-height:1.25;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  pointer-events:none;
  backdrop-filter:blur(10px);
}
.panorama-toolbar {
  position:absolute;
  left:10px;
  right:10px;
  bottom:10px;
  z-index:4;
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:5px;
  padding:6px;
  border:1px solid color-mix(in oklab, var(--line) 84%, transparent);
  border-radius:10px;
  background:color-mix(in oklab, var(--paper) 86%, transparent);
  backdrop-filter:blur(10px);
}
.panorama-toolbar button {
  min-width:28px;
  height:28px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:4px;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper-2) 76%, transparent);
  color:var(--ink-soft);
  cursor:pointer;
  font-size:10px;
}
.panorama-toolbar button:hover:not(:disabled) {
  background:color-mix(in oklab, var(--accent) 14%, var(--paper-2));
  color:var(--ink);
}
.panorama-toolbar button:disabled {
  opacity:.45;
  cursor:not-allowed;
}
.panorama-toolbar .panorama-sep {
  width:1px;
  min-height:22px;
  align-self:center;
  background:var(--line-soft);
  margin:0 2px;
}
.node.audio .node-body { padding:12px; display:flex; flex-direction:column; gap:10px; }
.node.audio .wave { flex:1; display:flex; align-items:center; gap:2px; }
.node.audio .wave span {
  flex:1; background: var(--accent); opacity:.8; border-radius:1px;
}
.node.audio .controls { display:flex; align-items:center; gap:8px; color:var(--ink-soft); font-family:var(--font-mono); font-size:11px; }
.node.audio audio { width:100%; height:32px; filter: saturate(.8); }
.node.audio .playbtn {
  width:28px; height:28px; border-radius:50%;
  background: var(--ink); color: var(--paper);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; border:none;
}
  .node.text .node-body {
    padding: 10px 12px;
    display:flex;
    flex-direction:column;
    gap:8px;
  }
  .node.text .text-node-topbar {
    flex:0 0 auto;
    display:flex;
    align-items:center;
    gap:8px;
  }
  .node.text .text-model-field {
    min-width:0;
    flex:1;
    display:grid;
    grid-template-columns:auto minmax(0, 1fr);
    align-items:center;
    gap:7px;
    color:var(--ink-mute);
    font-size:11px;
  }
  .node.text .text-model-field span {
    white-space:nowrap;
  }
  .node.text .text-model-select {
    min-width:0;
    height:28px;
    border:1px solid var(--line-soft);
    border-radius:8px;
    background:color-mix(in oklab, var(--paper-2) 78%, var(--bg));
    color:var(--ink);
    font-family:var(--font-body);
    font-size:11px;
    padding:0 8px;
    outline:none;
  }
  .node.text .text-model-select:focus {
    border-color:color-mix(in oklab, var(--accent) 58%, var(--line));
  }
  .node.text .text-editor {
    flex:1 1 auto;
    width:100%; height:100%; min-height:0;
    border:none; outline:none; resize:none; background:transparent;
    color: var(--ink); font: inherit; line-height:1.55;
  }
.node.text .text-editor::placeholder { color: var(--ink-mute); }
.node.text .text-quick {
  display:flex; gap:6px; flex-wrap:wrap;
  padding-top:8px; border-top:1px dashed var(--line-soft);
}
.node.text .text-quick button {
  border:1px solid var(--line-soft);
  background: var(--paper-2);
  color: var(--ink-soft);
  border-radius: var(--radius-sm);
  padding:4px 7px;
  font-size:11px;
  cursor:pointer;
}
.node.text .text-quick button:hover { color: var(--accent); border-color: var(--accent); }

.node.script .node-body { padding:0; overflow:auto; }
.node.script table { width:100%; border-collapse: collapse; font-size:12px; }
.node.script th, .node.script td {
  border:1px solid var(--line-soft);
  padding: 6px 8px; text-align:left;
  font-family: var(--font-body);
  color: var(--ink);
}
.node.script th {
  background: var(--paper-2);
  font-family: var(--font-mono);
  font-size:10px; color: var(--ink-mute);
  text-transform: uppercase; letter-spacing:.04em;
  font-weight:600;
}
.node.script td:first-child { width:32px; color: var(--ink-mute); font-family: var(--font-mono); }
.node.script td.shot { width:56px; font-family: var(--font-mono); font-size:11px; color: var(--accent); }
.node.script td.dur { width:42px; font-family: var(--font-mono); color: var(--ink-mute); text-align:right; }

.node.image.empty .node-body,
.node.video.empty .node-body,
.node.audio.empty .node-body,
.node.script.empty .node-body {
  padding:0;
  overflow:hidden;
  background:
    radial-gradient(circle at 50% 32%, color-mix(in oklab, var(--node-tone, var(--accent)) 10%, transparent), transparent 38%),
    color-mix(in oklab, var(--paper) 96%, var(--bg));
}
.node.image.empty .node-body { --node-tone: var(--accent); }
.node.video.empty .node-body { --node-tone: #8B5CF6; }
.node.audio.empty .node-body { --node-tone: #22C55E; }
.node.script.empty .node-body { --node-tone: #F59E0B; }
.node-blank-state {
  --node-tone: var(--accent);
  flex:1;
  min-height:0;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:14px;
}
.node-blank-state.tone-image { --node-tone: var(--accent); }
.node-blank-state.tone-video { --node-tone: #8B5CF6; }
.node-blank-state.tone-audio { --node-tone: #22C55E; }
.node-blank-state.tone-script { --node-tone: #F59E0B; }
.node-blank-state.tone-error { --node-tone: #EF4444; }
.node-blank-preview {
  min-width:0;
  min-height:0;
  width:100%;
  height:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:10px;
  padding:18px;
  border:1px dashed color-mix(in oklab, var(--ink-mute) 34%, var(--line));
  border-radius:10px;
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--paper-2) 74%, transparent), color-mix(in oklab, var(--paper) 92%, transparent));
  color:var(--ink-soft);
  text-align:center;
  overflow:hidden;
}
.node-blank-icon {
  width:48px;
  height:48px;
  flex:0 0 auto;
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:color-mix(in oklab, var(--node-tone) 60%, var(--ink-mute));
  background:color-mix(in oklab, var(--node-tone) 10%, var(--paper-2));
  border:1px solid color-mix(in oklab, var(--node-tone) 24%, var(--line-soft));
}
.node-blank-copy {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:4px;
  line-height:1.25;
}
.node-blank-copy strong {
  font-size:13px;
  color:var(--ink-soft);
}
.node-blank-copy em {
  max-width:230px;
  font-style:normal;
  font-size:11px;
  color:var(--ink-mute);
  white-space:normal;
}
.node.text .text-empty-hint {
  position:absolute;
  left:12px;
  bottom:10px;
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:5px 8px;
  border-radius:8px;
  border:1px solid var(--line-soft);
  background:color-mix(in oklab, var(--paper-2) 88%, transparent);
  color:var(--ink-mute);
  font-size:11px;
  pointer-events:none;
}

/* image placeholder */
.ph {
  display:flex; align-items:center; justify-content:center; height:100%;
  background:
    repeating-linear-gradient(45deg, var(--bg-deep) 0 8px, var(--paper-2) 8px 16px);
  color: var(--ink-mute);
  font-family: var(--font-mono); font-size:11px;
}

.node-resize {
  position:absolute;
  right:-1px;
  bottom:-1px;
  width:18px;
  height:18px;
  cursor:nwse-resize;
  opacity:0;
  z-index:8;
  border-radius:0 0 calc(var(--radius-lg) - 1px) 0;
  background:
    linear-gradient(135deg,
      transparent 0 48%,
      color-mix(in oklab, var(--ink-mute) 62%, transparent) 48% 54%,
      transparent 54% 64%,
      color-mix(in oklab, var(--ink-mute) 62%, transparent) 64% 70%,
      transparent 70%);
  touch-action:none;
  transition:opacity .12s ease, background .12s ease;
}
.node:hover .node-resize,
.node.selected .node-resize {
  opacity:.85;
}
.node-resize:hover {
  opacity:1;
  background:
    linear-gradient(135deg,
      transparent 0 48%,
      var(--accent) 48% 54%,
      transparent 54% 64%,
      var(--accent) 64% 70%,
      transparent 70%);
}

/* Hover/selected tool bar — sits BELOW the node, with a small arrow stem
   pointing back to the node (漫创AI / Mancrea spec, figures 052, 079). */
.node-toolbar {
  position: absolute;
  left: 50%; top: calc(100% + 14px);
  transform: translateX(-50%);
  display: flex; gap: 1px; padding: 4px 5px;
  background: color-mix(in oklab, var(--paper) 95%, transparent);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow-float);
  font-family: var(--font-body); font-size: 11px;
  white-space: nowrap;
  z-index: 12;
  backdrop-filter: blur(10px);
  animation: nodetb-in .14s ease-out;
}
@keyframes nodetb-in {
  from { opacity: 0; transform: translate(-50%, -4px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
/* small stem connecting toolbar to the node */
.node-toolbar::before {
  content: ""; position: absolute;
  left: 50%; top: -7px; transform: translateX(-50%);
  width: 10px; height: 10px;
  background: color-mix(in oklab, var(--paper) 95%, transparent);
  border-left: 1px solid var(--line);
  border-top:  1px solid var(--line);
  transform-origin: center;
  transform: translateX(-50%) rotate(45deg);
}
.node-toolbar button {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 9px; border: none; background: transparent; cursor: pointer;
  border-radius: 7px; color: var(--ink);
  transition: background .12s, color .12s;
  font-family: var(--font-body); font-size: 11px;
}
.node-toolbar button:hover {
  background: color-mix(in oklab, var(--accent) 12%, var(--paper-2));
  color: var(--ink);
}
.node-toolbar button.danger:hover {
  background: color-mix(in oklab, var(--accent-2, #FF6B6B) 14%, var(--paper-2));
  color: var(--accent-2, #FF6B6B);
}
.node-toolbar .sep {
  width: 1px; align-self: stretch;
  background: var(--line-soft); margin: 3px 2px;
}
.node-toolbar.script-toolbar {
  min-width: max-content;
  align-items: center;
}
.node-toolbar.script-toolbar button {
  flex: 0 0 auto;
}
.node-toolbar.image-toolbar {
  gap: 0;
  align-items: center;
  padding: 4px;
  overflow: hidden;
}
.image-toolbar .image-tool-main {
  font-weight: 600;
  color: var(--ink);
  background: color-mix(in oklab, var(--accent) 10%, transparent);
}
.image-toolbar .image-tool-options {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  transition: max-width .18s ease, opacity .14s ease, margin-left .18s ease;
}
.image-toolbar:hover .image-tool-options,
.image-toolbar:focus-within .image-tool-options {
  max-width: 360px;
  margin-left: 4px;
  opacity: 1;
  pointer-events: auto;
}
.image-toolbar .image-tool-options::before {
  content: "";
  width: 1px;
  height: 18px;
  margin: 0 2px;
  background: var(--line-soft);
  flex: 0 0 auto;
}
.node.jianying-export .node-body {
  padding: 12px;
  background: color-mix(in oklab, #8B5CF6 5%, var(--paper));
}
.jianying-export-node {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  height: 100%;
}
.jianying-export-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.jianying-export-stats span {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 6px;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  background: color-mix(in oklab, var(--paper-2) 74%, transparent);
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: 10px;
}
.jianying-export-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--ink-mute);
  font-size: 11px;
}
.jianying-export-field input {
  width: 100%;
  min-height: 34px;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink);
  padding: 0 10px;
  outline: none;
}
.jianying-export-field input:focus {
  border-color: color-mix(in oklab, var(--accent) 55%, var(--line));
}
.jianying-export-path {
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 10px;
  overflow: hidden;
}
.jianying-export-path span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.jianying-export-button {
  min-height: 38px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: #031018;
  font-weight: 800;
  cursor: pointer;
}
.jianying-export-button:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.jianying-export-status {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 30px;
  padding: 8px 9px;
  border-radius: 8px;
  background: color-mix(in oklab, var(--accent) 8%, transparent);
  color: var(--ink-soft);
  font-size: 11px;
  line-height: 1.35;
  overflow: auto;
}
.jianying-export-status.error {
  background: color-mix(in oklab, #EF4444 10%, transparent);
  color: #fca5a5;
}
.node.storyboard-collector-detail .node-body {
  padding: 10px;
  background:
    radial-gradient(circle at 18% 0%, color-mix(in oklab, #8B5CF6 12%, transparent), transparent 38%),
    color-mix(in oklab, var(--paper) 96%, var(--bg));
}
.storyboard-collector-node {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}
.storyboard-collector-empty {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.storyboard-collector-entry {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in oklab, var(--accent) 42%, var(--line));
  border-radius: 7px;
  background: color-mix(in oklab, var(--accent) 15%, var(--paper));
  color: var(--ink);
  cursor: pointer;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.storyboard-collector-entry:hover {
  border-color: color-mix(in oklab, var(--accent) 72%, var(--line));
  background: color-mix(in oklab, var(--accent) 22%, var(--paper));
}
.storyboard-collector-entry.compact {
  min-height: 24px;
  padding: 0 8px;
  font-size: 10px;
}
.storyboard-collector-collect-panel {
  width: 100%;
  max-width: 258px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 7px;
  border: 1px solid color-mix(in oklab, var(--accent) 28%, var(--line-soft));
  border-radius: 8px;
  background: color-mix(in oklab, var(--accent) 7%, var(--paper-2));
  box-sizing: border-box;
}
.storyboard-collector-node .storyboard-collector-collect-panel {
  max-width: none;
  flex: 0 0 auto;
}
.storyboard-collector-collect-summary {
  min-width: 0;
  color: var(--ink-mute);
  font-size: 10px;
  line-height: 1.3;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.storyboard-collector-collect-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}
.storyboard-collector-collect-actions button {
  min-width: 0;
  height: 25px;
  padding: 0 5px;
  border: 1px solid color-mix(in oklab, var(--accent) 38%, var(--line));
  border-radius: 6px;
  background: color-mix(in oklab, var(--accent) 14%, var(--paper));
  color: var(--ink);
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.storyboard-collector-collect-actions button:hover:not(:disabled) {
  border-color: color-mix(in oklab, var(--accent) 68%, var(--line));
  background: color-mix(in oklab, var(--accent) 22%, var(--paper));
}
.storyboard-collector-collect-actions button:disabled {
  opacity: .42;
  cursor: not-allowed;
}
.storyboard-collector-head {
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 2px;
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 700;
}
.storyboard-collector-head > span:first-child {
  min-width: 0;
  flex: 1;
}
.storyboard-collector-head em {
  color: var(--ink-mute);
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
}
.storyboard-collector-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  padding-right: 2px;
}
.storyboard-collector-item {
  min-height: 58px;
  display: grid;
  grid-template-columns: 30px 52px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 6px;
  border: 1px solid var(--line-soft);
  border-radius: 9px;
  background: color-mix(in oklab, var(--paper-2) 72%, transparent);
  cursor: grab;
}
.storyboard-collector-item.dragging {
  opacity: .55;
  border-color: color-mix(in oklab, var(--accent) 58%, var(--line));
}
.storyboard-collector-order {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 11px;
  text-align: center;
}
.storyboard-collector-thumb {
  width: 52px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in oklab, var(--paper-3) 78%, var(--bg));
  color: var(--ink-mute);
}
.storyboard-collector-thumb img,
.storyboard-collector-thumb video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.storyboard-collector-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.storyboard-collector-meta strong {
  min-width: 0;
  color: var(--ink);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.storyboard-collector-meta em {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 9px;
  font-style: normal;
}
.storyboard-collector-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.storyboard-collector-actions button {
  height: 24px;
  padding: 0 6px;
  border: 1px solid var(--line-soft);
  border-radius: 6px;
  background: var(--paper);
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 10px;
}
.storyboard-collector-actions button:hover:not(:disabled) {
  border-color: color-mix(in oklab, var(--accent) 52%, var(--line));
  color: var(--ink);
}
.storyboard-collector-actions button:disabled {
  opacity: .38;
  cursor: not-allowed;
}
.storyboard-collector-tip {
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--line-soft);
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 10px;
}
`;
