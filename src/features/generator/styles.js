/* Generator feature — all CSS strings */

export const genStyles = `
.generator {
  position:absolute; left:50%; bottom: 14px; transform: translateX(-50%);
  width: clamp(560px, 54vw, 840px);
  max-width: calc(100vw - 32px);
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--paper-2) 42%, transparent), transparent 46%),
    color-mix(in oklab, var(--paper) 91%, transparent);
  border:1px solid color-mix(in oklab, var(--line) 76%, var(--accent) 12%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-float);
  font-family: var(--font-body);
  z-index:45;
  overflow:visible;
  backdrop-filter: blur(18px);
}
.generator .generator-file-input {
  position:absolute;
  left:-9999px;
  top:0;
  width:1px;
  height:1px;
  opacity:0;
  pointer-events:none;
}
.generator header {
  position: relative;
  display:flex; align-items:center; gap:8px;
  padding: 8px 12px;
  border-bottom: 1px dashed var(--line-soft);
  background:
    linear-gradient(90deg, color-mix(in oklab, var(--accent) 10%, transparent), transparent 42%, color-mix(in oklab, var(--accent-2) 6%, transparent)),
    color-mix(in oklab, var(--paper) 90%, var(--bg));
  border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
}
.generator header .tab {
  display:inline-flex; align-items:center; gap:4px;
  padding: 4px 10px; font-size:12px; border-radius: var(--radius-sm);
  border:1px solid transparent; background:transparent; cursor:pointer;
  font-family: var(--font-display); font-weight:600;
  color: var(--ink-mute);
}
.generator header .tab.active {
  color: var(--ink);
  background: color-mix(in oklab, var(--accent) 14%, var(--paper-2));
  border-color: color-mix(in oklab, var(--accent) 34%, var(--line-soft));
}
.generator header .model-anchor {
  position:relative;
  margin-left:auto;
  display:inline-flex;
  align-items:center;
  min-width:0;
}
.generator header .model {
  display:inline-flex; align-items:center; gap:4px;
  padding: 4px 10px; border-radius: var(--radius-sm);
  background: color-mix(in oklab, var(--paper-2) 78%, transparent);
  border:1px solid color-mix(in oklab, var(--line) 78%, var(--accent) 10%);
  cursor:pointer; font-size:12px;
  min-width:0;
  max-width: 170px;
}
.generator header .model span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.generator header .credit {
  font-family: var(--font-mono); font-size:10px; color: var(--ink-mute);
}
.generator .model-menu {
  position:absolute; right:0; top:calc(100% + 6px);
  width: 100%; min-width: 100%; max-width: 100%;
  box-sizing:border-box;
  max-height: 260px; overflow:auto;
  background: var(--paper); border:1px solid var(--line);
  border-radius: var(--radius-md); box-shadow: var(--shadow-float);
  padding: 4px; z-index: 12;
}
.generator .model-menu-item {
  width:100%; border:none; font-family: var(--font-body); text-align:left;
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding: 7px 9px; font-size:12px; cursor:pointer;
  border-radius: var(--radius-sm); color: var(--ink);
  background: transparent;
}
.generator .model-menu-item:hover { background: var(--bg-deep); }
.generator .model-menu-item.active {
  background: color-mix(in oklab, var(--accent) 10%, var(--paper-2));
  color: var(--ink);
}
.generator .model-menu-item:disabled {
  cursor:not-allowed; opacity:.6;
}
.generator .model-menu-item .k { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.generator .model-menu-item .d { flex:0 0 auto; color: var(--ink-mute); font-size:11px; }
.generator .prompt-wrap { position:relative; }
.generator .prompt {
  padding: 10px 12px;
  display:flex; flex-direction:column; gap:8px; align-items:stretch;
  max-height: 170px;
  overflow:visible;
}
.generator .prompt textarea {
  width:100%; border:none; background: transparent; outline:none; resize:none;
  font-family: var(--font-body); font-size:13px; color: var(--ink);
  line-height:1.55; min-height:48px; max-height:116px;
  min-width:0; overflow-y:auto; overscroll-behavior:contain;
}
.generator .prompt textarea::placeholder { color: var(--ink-mute); }
.generator .prompt .refs {
  display:flex; gap:5px; max-width: 180px; flex-wrap:wrap;
}
.generator .prompt .ref {
  width: 52px; height:52px; border-radius: var(--radius-sm);
  border: 1px solid var(--line-soft); overflow:hidden; position:relative;
  background: var(--paper-2);
}
.generator .prompt .ref.add-ref {
  display:flex; align-items:center; justify-content:center;
  color: var(--ink-mute); cursor:pointer;
}
.generator .prompt .ref.add-ref:hover {
  border-color: var(--accent); color: var(--ink);
}
.generator .prompt .ref img { width:100%; height:100%; object-fit:cover; }
.generator .prompt .ref .ref-icon {
  width:100%; height:100%; display:flex; align-items:center; justify-content:center;
  color: var(--ink-mute);
}
.generator .prompt .ref .tag {
  position:absolute; left:2px; bottom:2px; font-family: var(--font-mono);
  font-size:9px; color:#fff; background: rgba(0,0,0,0.6); padding: 0 3px;
  border-radius: 2px;
  max-width: calc(100% - 4px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.generator .prompt .ref .ref-remove {
  position:absolute; top:2px; right:2px; width:16px; height:16px;
  display:flex; align-items:center; justify-content:center; padding:0;
  border:none; border-radius: 4px;
  background: rgba(0,0,0,.55); color:#fff; cursor:pointer;
  opacity:0;
}
.generator .prompt .ref:hover .ref-remove { opacity:1; }
.generator .generator-ref-strip {
  display:flex;
  align-items:flex-start;
  gap:10px;
  padding:0 12px 10px;
  border-top:1px dashed color-mix(in oklab, var(--line-soft) 70%, transparent);
}
.generator .generator-ref-label {
  flex:0 0 auto;
  margin-top:10px;
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  white-space:nowrap;
}
.generator .generator-ref-list {
  flex:1;
  min-width:0;
  display:flex;
  gap:7px;
  overflow-x:auto;
  padding-top:8px;
  padding-bottom:1px;
}
.generator .generator-inline-refs {
  display:flex;
  align-items:center;
  gap:7px;
  flex-wrap:wrap;
  max-height:none;
  overflow:visible;
  overscroll-behavior:contain;
  padding-bottom:1px;
}
.generator .generator-ref-card {
  position:relative;
  flex:0 0 44px;
  width:44px;
  height:44px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:4px;
  border:1px solid color-mix(in oklab, var(--accent) 30%, var(--line-soft));
  border-radius:8px;
  background:color-mix(in oklab, var(--accent) 8%, var(--paper-2));
}
.generator .generator-inline-refs .generator-ref-card {
  flex:0 0 44px;
  background:color-mix(in oklab, var(--accent) 11%, var(--paper-2));
}
.generator .generator-ref-thumb {
  width:100%;
  height:100%;
  flex:0 0 auto;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:6px;
  border:1px solid var(--line-soft);
  background:var(--paper);
  color:var(--ink-mute);
}
.generator .generator-ref-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.generator .media-icon {
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
}
.generator .generator-ref-remove {
  position:absolute;
  top:-6px;
  right:-6px;
  width:16px;
  height:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0;
  border:none;
  border-radius:999px;
  background:color-mix(in oklab, var(--ink) 72%, transparent);
  color:var(--paper);
  cursor:pointer;
  opacity:.86;
}
.generator .generator-ref-remove:hover {
  opacity:1;
}
.generator .generator-ref-preview,
.generator .generator-ref-floating-preview,
.generator .at-preview {
  position:absolute;
  display:none;
  z-index:22;
  width:220px;
  padding:7px;
  border:1px solid var(--line);
  border-radius:10px;
  background:color-mix(in oklab, var(--paper) 98%, transparent);
  box-shadow:var(--shadow-float);
  pointer-events:none;
}
.generator .generator-ref-preview {
  left:0;
  bottom:calc(100% + 8px);
}
.generator .generator-ref-floating-preview {
  left:12px;
  bottom:calc(100% + 8px);
  display:block;
  z-index:32;
}
.generator .generator-ref-card:hover .generator-ref-preview,
.generator .at-item:hover .at-preview {
  display:block;
}
.generator .generator-ref-preview-media,
.generator .at-preview-media {
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:148px;
  overflow:hidden;
  border-radius:7px;
  background:var(--paper-2);
  color:var(--ink-mute);
}
.generator .generator-ref-preview-media img,
.generator .at-preview-media img {
  width:100%;
  height:100%;
  object-fit:contain;
}
.generator .at-preview strong {
  display:block;
  margin-top:6px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:11px;
}
.generator .at-menu {
  position:absolute; left:12px; bottom:100%;
  width: 340px;
  max-height: min(360px, calc(100vh - 220px));
  overflow-y:auto;
  overflow-x:hidden;
  overscroll-behavior:contain;
  margin-bottom: 6px; padding: 8px;
  border:1px solid var(--line);
  border-radius: var(--radius-md);
  background: color-mix(in oklab, var(--paper) 98%, transparent);
  box-shadow: var(--shadow-float);
  z-index: 14;
}
.generator .at-menu::-webkit-scrollbar,
.generator .generator-inline-refs::-webkit-scrollbar {
  width:7px;
  height:7px;
}
.generator .at-menu::-webkit-scrollbar-thumb,
.generator .generator-inline-refs::-webkit-scrollbar-thumb {
  background:color-mix(in oklab, var(--ink-mute) 45%, transparent);
  border-radius:999px;
}
.generator .at-head {
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding: 2px 3px 7px;
  color: var(--ink-mute); font-size:11px;
}
.generator .at-head button {
  display:inline-flex; align-items:center; gap:4px;
  border:1px solid var(--line-soft); border-radius: 7px;
  background: var(--paper-2); color: var(--ink-soft);
  cursor:pointer; padding: 4px 7px; font-size:11px;
}
.generator .at-item {
  position:relative;
  width:100%; display:flex; align-items:center; gap:9px;
  padding: 7px; border:1px solid transparent; border-radius: 8px;
  background: transparent; color: var(--ink); cursor:pointer; text-align:left;
  font-family: var(--font-body);
}
.generator .at-item:hover {
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 8%, var(--paper-2));
}
.generator .at-thumb {
  width:34px; height:34px; flex:0 0 auto;
  border:1px solid var(--line-soft); border-radius: 7px;
  background: var(--paper-2); overflow:hidden;
  display:flex; align-items:center; justify-content:center;
  color: var(--ink-mute);
}
.generator .at-thumb img { width:100%; height:100%; object-fit:cover; }
.generator .at-preview {
  right:8px;
  top:8px;
}
.generator .at-main {
  min-width:0; display:flex; flex-direction:column; gap:2px;
}
.generator .at-main strong {
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  font-size:12px; font-weight:700;
}
.generator .at-main em {
  color: var(--ink-mute); font-family: var(--font-mono);
  font-style:normal; font-size:10px;
}
.generator .at-empty {
  padding: 14px 6px; text-align:center;
  color: var(--ink-mute); font-size:12px;
}
.generator .controls {
  padding: 8px 12px 10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;
  border-top: 1px dashed var(--line-soft);
}
.generator .chip {
  display:inline-flex; align-items:center; gap:4px;
  padding: 4px 9px; font-size:11px;
  background: color-mix(in oklab, var(--paper-2) 78%, transparent);
  border:1px solid color-mix(in oklab, var(--line-soft) 80%, var(--accent) 7%);
  border-radius: var(--radius-sm); cursor:pointer; color: var(--ink);
  font-family: var(--font-body);
}
.generator .chip:hover { border-color: color-mix(in oklab, var(--accent) 56%, var(--line)); background: color-mix(in oklab, var(--accent) 9%, var(--paper-2)); }
.generator .chip.active { background: color-mix(in oklab, var(--accent) 18%, var(--paper-2)); color: var(--ink); border-color: color-mix(in oklab, var(--accent) 48%, var(--line)); }
.generator .chip.ghost { background: transparent; }
.generator .control-wrap { position:relative; display:inline-flex; }
.generator .control-sep {
  width:1px; height:18px; background:var(--line-soft); margin:0 4px;
}
.generator .ratio-glyph {
  width:14px; height:8px; border:1.5px solid currentColor; border-radius:2px;
}
.generator .control-pop {
  position:absolute; left:0; bottom: calc(100% + 8px);
  min-width: 136px; padding: 5px;
  border:1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper);
  box-shadow: var(--shadow-float);
  z-index: 16;
}
.generator .option-list { display:flex; flex-direction:column; gap:4px; }
.generator .option-btn {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  width:100%; min-height:28px; padding:5px 8px;
  border:none; border-radius: var(--radius-sm);
  background: transparent; color: var(--ink);
  cursor:pointer; font-family: var(--font-body); font-size:12px;
}
.generator .option-btn:hover {
  background: var(--bg-deep);
}
.generator .option-btn.active {
  background: color-mix(in oklab, var(--accent) 12%, var(--paper-2));
}
.generator .gen-btn {
  margin-left:auto;
  display:inline-flex; align-items:center; gap:6px;
  padding: 6px 14px; font-size:13px; font-family: var(--font-display); font-weight:700;
  background: linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent-3, var(--accent)) 38%, var(--accent)));
  color: #031313; border:none;
  border-radius: var(--radius-md); cursor:pointer;
  box-shadow: 0 12px 30px -20px color-mix(in oklab, var(--accent) 80%, transparent), 0 1px 0 rgba(255,255,255,.26) inset;
}
.generator .gen-btn:hover { background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 88%, white), color-mix(in oklab, var(--accent-3, var(--accent)) 42%, var(--accent))); }
.generator .gen-btn:disabled {
  cursor:not-allowed; opacity:.55; box-shadow:none;
}

.slash-menu {
  position: absolute; left: 12px; bottom: 100%;
  margin-bottom: 4px;
  background: var(--paper); border:1px solid var(--line);
  border-radius: var(--radius-md); box-shadow: var(--shadow-float);
  min-width: 280px; padding: 4px; z-index: 10;
}
.slash-item {
  width:100%; border:none; background:transparent; text-align:left;
  display:flex; align-items:center; gap:8px; padding: 6px 10px;
  font-size:12px; cursor:pointer; border-radius: var(--radius-sm);
  color: var(--ink);
  font-family: var(--font-body);
}
.slash-item:hover { background: var(--bg-deep); }
.slash-item .k { font-family: var(--font-mono); color: var(--accent); min-width: 130px; font-size:11px; }
.slash-item .d { color: var(--ink-mute); font-size:11px; }

.style-presets {
  display:flex; gap:6px; padding: 0 12px 10px;
  overflow-x: auto;
}
.sp-card {
  flex: 0 0 auto; width: 96px;
  border: 1px solid var(--line-soft); border-radius: var(--radius-sm);
  background: var(--paper-2); padding: 5px; cursor:pointer;
  transition: border-color .1s;
  font-family: var(--font-body);
}
.sp-card:hover, .sp-card.active { border-color: var(--accent); }
.sp-card .th {
  aspect-ratio: 1/1; border-radius: 2px;
  background:
    repeating-linear-gradient(45deg, var(--bg-deep) 0 6px, var(--paper) 6px 12px);
  margin-bottom:4px;
  display:flex; align-items:center; justify-content:center;
  color: var(--ink-mute); font-family: var(--font-mono); font-size:9px;
}
.sp-card .n { font-size:10px; text-align:center; color: var(--ink); font-family: var(--font-body); }

.node-workbench {
  position:absolute;
  z-index: 18;
  min-height: 190px;
  background: color-mix(in oklab, var(--paper) 96%, transparent);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow-float);
  font-family: var(--font-body);
  color: var(--ink);
  padding: 12px;
  display:flex;
  flex-direction:column;
  gap: 10px;
  backdrop-filter: blur(10px);
}
.node-workbench .node-workbench-file-input {
  position:absolute;
  left:-9999px;
  top:0;
  width:1px;
  height:1px;
  opacity:0;
  pointer-events:none;
}
.node-workbench .wb-top {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
}
.node-workbench .wb-tabs {
  display:flex;
  gap: 6px;
  flex-wrap:wrap;
}
.node-workbench .wb-tab,
.node-workbench .wb-tool,
.node-workbench .wb-control,
.node-workbench .wb-icon-btn {
  border: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper-2) 94%, transparent);
  color: var(--ink-soft);
  border-radius: 7px;
  cursor:pointer;
  font-family: var(--font-body);
  transition: border-color .14s ease, color .14s ease, background .14s ease;
}
.node-workbench .wb-tab {
  padding: 5px 10px;
  font-size: 12px;
}
.node-workbench .wb-tab.active {
  color: var(--ink);
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 16%, var(--paper));
}
.node-workbench .wb-tab:disabled {
  opacity: .38;
  cursor:not-allowed;
}
.node-workbench .wb-icon-btn {
  width: 26px;
  height: 26px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0;
}
.node-workbench .wb-tool-row {
  display:flex;
  gap: 8px;
  flex-wrap:wrap;
}
.node-workbench .wb-tool {
  width: 46px;
  height: 46px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap: 4px;
  font-size: 11px;
}
.node-workbench .wb-tool:hover,
.node-workbench .wb-control:hover,
.node-workbench .wb-icon-btn:hover {
  border-color: var(--accent);
  color: var(--ink);
}
.node-workbench .wb-tool.active {
  border-color: var(--accent);
  color: var(--ink);
  background: color-mix(in oklab, var(--accent) 13%, var(--paper));
}
.node-workbench .wb-tool span {
  max-width: 40px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.node-workbench .wb-prompt {
  flex: 1;
  min-width:0;
  min-height:0;
  min-height: 66px;
  max-height: 132px;
  width:100%;
  padding:0;
  margin:0;
  resize:none;
  border:none;
  outline:none;
  background:transparent;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.55;
  overflow-y:auto;
  overscroll-behavior:contain;
  white-space:pre-wrap;
  word-break:break-word;
  overflow-wrap:break-word;
  cursor:text;
}
.node-workbench .wb-prompt-textarea {
  position:relative;
  z-index:1;
  flex:1 1 auto;
  height: 132px;
  min-height: 132px;
  max-height: none;
  color: var(--ink);
  caret-color: var(--ink);
  resize: none;
  box-sizing:border-box;
}
.node-workbench .wb-prompt-textarea-with-highlight {
  color: transparent;
  caret-color: var(--ink);
}
.node-workbench .wb-prompt-textarea-with-highlight::selection {
  color: transparent;
  background: color-mix(in oklab, var(--accent) 36%, transparent);
}
.node-workbench .wb-prompt::placeholder { color: var(--ink-mute); }
.node-workbench .wb-prompt-highlight {
  position:absolute;
  left:9px;
  right:9px;
  top:8px;
  z-index:2;
  min-height:132px;
  overflow:hidden;
  pointer-events:none;
  color:var(--ink);
  font-family: var(--font-body);
  font-size:14px;
  line-height:1.55;
  padding:0;
  margin:0;
  white-space:pre-wrap;
  word-break:break-word;
  overflow-wrap:break-word;
  box-sizing:border-box;
}
.node-workbench .wb-prompt-mention-token {
  --mention-accent:#0ea5e9;
  --mention-bg: color-mix(in oklab, var(--mention-accent) 14%, var(--paper-2));
  position:relative;
  display:inline;
  margin:0;
  padding:0;
  border-radius:4px;
  background:transparent;
  color:var(--mention-accent);
  box-shadow:none;
  font-weight:inherit;
  line-height:inherit;
  isolation:isolate;
  vertical-align:baseline;
  white-space:inherit;
  pointer-events:auto;
  cursor:default;
}
.node-workbench .wb-prompt-mention-token::before {
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:.08em;
  bottom:.08em;
  z-index:-1;
  border:1px solid color-mix(in oklab, var(--mention-accent) 48%, var(--line-soft));
  border-radius:6px;
  background:var(--mention-bg);
  box-shadow:0 1px 0 color-mix(in oklab, white 36%, transparent) inset;
}
.node-workbench .wb-prompt-mention-token[data-kind="image"] {
  --mention-accent:#0ea5e9;
}
.node-workbench .wb-prompt-mention-mini {
  position:absolute;
  left:.08em;
  top:50%;
  width:.9em;
  height:.9em;
  display:flex;
  align-items:center;
  justify-content:center;
  box-sizing:border-box;
  overflow:hidden;
  transform:translateY(-50%);
  border-radius:3px;
  border:1px solid color-mix(in oklab, var(--mention-accent) 32%, var(--line-soft));
  background:var(--paper);
  color:var(--ink-mute);
  pointer-events:auto;
}
.node-workbench .wb-prompt-mention-mini img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-prompt-mention-icon-space {
  color:transparent;
  pointer-events:none;
}
.node-workbench .wb-prompt-mention-label {
  display:inline;
  min-width:0;
}
.node-workbench .wb-prompt-rich {
  position:relative;
  z-index:1;
  flex:1 1 auto;
  height:132px;
  min-height:132px;
  max-height:none;
  box-sizing:border-box;
  caret-color:var(--ink);
}
.node-workbench .wb-prompt-rich:empty::before {
  content: attr(data-placeholder);
  color: var(--ink-mute);
  pointer-events:none;
}
.node-workbench .wb-prompt-box {
  position:relative;
  flex:1;
  min-height: 192px;
  max-height: none;
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:8px 9px 18px;
  border:1px solid color-mix(in oklab, var(--line-soft) 80%, transparent);
  border-radius:10px;
  background:color-mix(in oklab, var(--paper-2) 38%, transparent);
  overflow:visible;
}
.node-workbench .wb-prompt-resize-handle {
  position:absolute;
  right:4px;
  bottom:4px;
  width:18px;
  height:18px;
  padding:0;
  border:none;
  border-radius:5px;
  background:transparent;
  color:var(--ink-mute);
  cursor:ns-resize;
  touch-action:none;
  z-index:4;
}
.node-workbench .wb-prompt-resize-handle::before {
  content:"";
  position:absolute;
  right:3px;
  bottom:3px;
  width:10px;
  height:10px;
  border-right:1px solid currentColor;
  border-bottom:1px solid currentColor;
  opacity:.72;
}
.node-workbench .wb-prompt-resize-handle::after {
  content:"";
  position:absolute;
  right:7px;
  bottom:3px;
  width:5px;
  height:5px;
  border-right:1px solid currentColor;
  border-bottom:1px solid currentColor;
  opacity:.5;
}
.node-workbench .wb-prompt-resize-handle:hover {
  color:var(--accent);
}
.node-workbench .wb-inline-mention {
  --mention-accent:#0ea5e9;
  --mention-bg: color-mix(in oklab, var(--mention-accent) 14%, var(--paper-2));
  display:inline-flex;
  align-items:center;
  gap:3px;
  max-width:min(220px, 80%);
  min-height:1.35em;
  margin:0;
  padding:0 4px 0 2px;
  border:1px solid color-mix(in oklab, var(--mention-accent) 48%, var(--line-soft));
  border-radius:6px;
  background:var(--mention-bg);
  color:var(--mention-accent);
  font-weight:750;
  line-height:inherit;
  vertical-align:baseline;
  user-select:none;
  white-space:nowrap;
}
.node-workbench .wb-inline-mention-thumb {
  width:1em;
  height:1em;
  flex:0 0 auto;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:3px;
  border:1px solid color-mix(in oklab, var(--mention-accent) 32%, var(--line-soft));
  background:var(--paper);
  color:var(--ink-mute);
  font-size:11px;
}
.node-workbench .wb-inline-mention-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-inline-mention-token {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  font-size:inherit;
  font-weight:750;
  line-height:inherit;
}
.node-workbench .wb-reference-area {
  position:relative;
  min-height: 58px;
  padding: 0;
  border:0;
  border-radius:0;
  background:transparent;
  overflow:visible;
}
.node-workbench .wb-ref-grid {
  display:flex;
  flex-wrap:wrap;
  align-items:flex-start;
  justify-content:flex-start;
  gap: 8px;
  width:100%;
  max-height:none;
  padding:0;
  box-sizing:border-box;
  overflow:visible;
  overscroll-behavior:contain;
}
.node-workbench .wb-ref-slot {
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:58px;
  height:58px;
  flex:0 0 58px;
  min-width:58px;
  min-height:58px;
  padding:4px;
  border-radius: 8px;
  box-sizing:border-box;
}
.node-workbench .wb-ref-chip {
  border: 1px solid color-mix(in oklab, var(--accent) 34%, var(--line-soft));
  background: color-mix(in oklab, var(--accent) 9%, var(--paper-2));
  color: var(--ink-soft);
}
.node-workbench .wb-ref-thumb {
  width:100%;
  height:100%;
  flex:0 0 auto;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:6px;
  border:1px solid var(--line-soft);
  background:var(--paper);
  color:var(--ink-mute);
}
.node-workbench .wb-ref-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-media-icon {
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
}
.node-workbench .wb-ref-chip button {
  position:absolute;
  top:-6px;
  right:-6px;
  width: 16px;
  height: 16px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:none;
  border-radius:999px;
  background:color-mix(in oklab, var(--ink) 72%, transparent);
  color: var(--paper);
  cursor:pointer;
  padding:0;
  opacity:.86;
}
.node-workbench .wb-ref-chip button:hover { opacity:1; }
.node-workbench .wb-ref-preview,
.node-workbench .wb-ref-floating-preview,
.node-workbench .wb-prompt-hover-preview,
.node-workbench .wb-at-preview {
  position:absolute;
  display:none;
  z-index:48;
  width:220px;
  padding:7px;
  border:1px solid var(--line);
  border-radius:10px;
  background:color-mix(in oklab, var(--paper) 98%, transparent);
  box-shadow:var(--shadow-float);
  pointer-events:none;
}
.node-workbench .wb-ref-preview {
  left:0;
  bottom:calc(100% + 8px);
}
.node-workbench .wb-ref-floating-preview {
  left:9px;
  bottom:calc(100% + 8px);
  display:block;
}
.node-workbench .wb-prompt-hover-preview {
  display:block;
  transform:translateY(calc(-100% - 8px));
  z-index:60;
}
.node-workbench .wb-ref-chip:hover .wb-ref-preview,
.node-workbench .wb-seedance-image-card:hover .wb-ref-preview {
  display:block;
}
.node-workbench .wb-ref-preview-media,
.node-workbench .wb-at-preview-media {
  width:100%;
  height:148px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:7px;
  background:var(--paper-2);
  color:var(--ink-mute);
}
.node-workbench .wb-ref-preview-media img,
.node-workbench .wb-at-preview-media img {
  width:100%;
  height:100%;
  object-fit:contain;
}
.node-workbench .wb-ref-preview strong,
.node-workbench .wb-at-preview strong {
  display:block;
  margin-top:6px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:11px;
}
.node-workbench .wb-seedance-reference-box {
  position:relative;
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:9px;
  border:1px solid color-mix(in oklab, var(--accent) 28%, var(--line-soft));
  border-radius:10px;
  background:color-mix(in oklab, var(--accent) 7%, var(--paper-2));
  overflow:visible;
}
.node-workbench .wb-seedance-portrait-box {
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:9px;
  border:1px solid color-mix(in oklab, #3db4ff 24%, var(--line-soft));
  border-radius:10px;
  background:color-mix(in oklab, #3db4ff 8%, var(--paper-2));
}
.node-workbench .wb-seedance-portrait-head {
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
  color:var(--ink-soft);
  font-size:11px;
}
.node-workbench .wb-seedance-portrait-head strong {
  color:var(--ink);
  font-size:12px;
}
.node-workbench .wb-seedance-portrait-head span {
  flex:1 1 auto;
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink-mute);
}
.node-workbench .wb-seedance-portrait-head button {
  flex:0 0 auto;
  min-height:24px;
  padding:3px 8px;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:color-mix(in oklab, var(--paper) 82%, transparent);
  color:var(--ink-soft);
  cursor:pointer;
  font-size:11px;
}
.node-workbench .wb-seedance-portrait-head button:hover {
  border-color:var(--accent);
  color:var(--ink);
}
.node-workbench .wb-seedance-portrait-strip {
  display:flex;
  gap:8px;
  overflow-x:auto;
  overflow-y:hidden;
  padding:1px 2px 5px;
  overscroll-behavior:contain;
}
.node-workbench .wb-seedance-portrait-card {
  width:132px;
  height:58px;
  flex:0 0 132px;
  display:grid;
  grid-template-columns:42px 1fr;
  grid-template-rows:1fr 1fr;
  column-gap:8px;
  align-items:center;
  padding:7px;
  border:1px solid color-mix(in oklab, var(--line-soft) 84%, transparent);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 84%, transparent);
  color:var(--ink);
  cursor:pointer;
  text-align:left;
}
.node-workbench .wb-seedance-portrait-card.selected {
  border-color:var(--accent);
  background:color-mix(in oklab, var(--accent) 14%, var(--paper));
}
.node-workbench .wb-seedance-portrait-thumb {
  grid-row:1 / span 2;
  width:40px;
  height:40px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:7px;
  background:var(--paper-2);
  border:1px solid var(--line-soft);
  color:var(--ink-mute);
}
.node-workbench .wb-seedance-portrait-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-seedance-portrait-name,
.node-workbench .wb-seedance-portrait-ref {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.node-workbench .wb-seedance-portrait-name {
  font-size:12px;
  font-weight:700;
}
.node-workbench .wb-seedance-portrait-ref {
  color:var(--ink-mute);
  font-size:10px;
}
.node-workbench .wb-seedance-portrait-empty {
  width:100%;
  min-height:38px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  padding:7px 10px;
  border:1px dashed color-mix(in oklab, var(--line) 80%, #3db4ff 18%);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 62%, transparent);
  color:var(--ink-mute);
  cursor:pointer;
  font-size:12px;
}
.node-workbench .wb-seedance-image-strip {
  display:flex;
  align-items:flex-start;
  gap:8px;
  min-width:0;
  min-height:66px;
  overflow-x:auto;
  overflow-y:hidden;
  padding:2px 2px 6px;
  overscroll-behavior:contain;
}
.node-workbench .wb-seedance-image-strip::-webkit-scrollbar {
  height:7px;
}
.node-workbench .wb-seedance-image-strip::-webkit-scrollbar-thumb {
  background:color-mix(in oklab, var(--ink-mute) 36%, transparent);
  border-radius:999px;
}
.node-workbench .wb-seedance-image-card,
.node-workbench .wb-seedance-add-card {
  position:relative;
  width:58px;
  height:64px;
  flex:0 0 58px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  gap:4px;
  border:1px solid color-mix(in oklab, var(--line-soft) 84%, transparent);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 82%, transparent);
  color:var(--ink);
  box-sizing:border-box;
}
.node-workbench .wb-seedance-image-card {
  padding:4px;
}
.node-workbench .wb-seedance-add-card {
  justify-content:center;
  padding:6px;
  border-style:dashed;
  color:var(--ink-mute);
  cursor:pointer;
}
.node-workbench .wb-seedance-add-card:hover {
  border-color:var(--accent);
  color:var(--ink);
}
.node-workbench .wb-seedance-image-thumb {
  width:36px;
  height:36px;
  flex:0 0 36px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:6px;
  background:var(--paper-2);
  border:1px solid var(--line-soft);
  color:var(--ink-mute);
}
.node-workbench .wb-seedance-image-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-seedance-image-label,
.node-workbench .wb-seedance-add-card span {
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:10px;
  line-height:1;
}
.node-workbench .wb-seedance-image-card button {
  position:absolute;
  top:-5px;
  right:-5px;
  width:16px;
  height:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0;
  border:none;
  border-radius:999px;
  background:color-mix(in oklab, var(--ink) 72%, transparent);
  color:var(--paper);
  cursor:pointer;
}
.node-workbench .wb-seedance-role-card {
  position:relative;
  width:76px;
  height:64px;
  flex:0 0 76px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  gap:3px;
  padding:4px;
  border:1px solid color-mix(in oklab, var(--accent) 54%, var(--line-soft));
  border-radius:8px;
  background:color-mix(in oklab, var(--accent) 11%, var(--paper));
  color:var(--ink);
  box-sizing:border-box;
}
.node-workbench .wb-seedance-role-thumb {
  width:34px;
  height:34px;
  flex:0 0 34px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:6px;
  background:var(--paper-2);
  border:1px solid color-mix(in oklab, var(--accent) 38%, var(--line-soft));
  color:var(--ink-mute);
}
.node-workbench .wb-seedance-role-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-seedance-role-copy {
  max-width:100%;
  min-width:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:1px;
}
.node-workbench .wb-seedance-role-copy strong,
.node-workbench .wb-seedance-role-copy em {
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-style:normal;
  line-height:1;
}
.node-workbench .wb-seedance-role-copy strong {
  font-size:10px;
  font-weight:700;
}
.node-workbench .wb-seedance-role-copy em {
  color:var(--ink-mute);
  font-size:8px;
}
.node-workbench .wb-seedance-role-card button {
  position:absolute;
  top:-5px;
  right:-5px;
  width:16px;
  height:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0;
  border:none;
  border-radius:999px;
  background:color-mix(in oklab, var(--ink) 72%, transparent);
  color:var(--paper);
  cursor:pointer;
}
.node-workbench .wb-seedance-audio-section,
.node-workbench .wb-seedance-video-section {
  display:flex;
  flex-direction:column;
  gap:6px;
}
.node-workbench .wb-seedance-audio-label {
  color:var(--ink-mute);
  font-size:11px;
  font-weight:650;
}
.node-workbench .wb-seedance-media-list {
  display:flex;
  flex-direction:column;
  gap:5px;
}
.node-workbench .wb-seedance-media-row {
  display:flex;
  align-items:center;
  gap:7px;
  min-width:0;
  padding:5px 7px;
  border:1px solid color-mix(in oklab, var(--line-soft) 78%, transparent);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 76%, transparent);
}
.node-workbench .wb-seedance-media-token {
  flex:0 0 auto;
  min-width:46px;
  padding:2px 5px;
  border-radius:6px;
  background:color-mix(in oklab, var(--accent) 12%, var(--paper-2));
  color:var(--accent);
  font-size:10px;
  font-weight:700;
  text-align:center;
}
.node-workbench .wb-seedance-media-thumb {
  width:24px;
  height:24px;
  flex:0 0 24px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:6px;
  background:var(--paper-2);
  color:var(--ink-mute);
}
.node-workbench .wb-seedance-media-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-seedance-media-name {
  flex:1 1 auto;
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:11px;
}
.node-workbench .wb-seedance-media-row button {
  flex:0 0 auto;
  width:18px;
  height:18px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0;
  border:none;
  border-radius:6px;
  background:transparent;
  color:var(--ink-mute);
  cursor:pointer;
}
.node-workbench .wb-seedance-media-row button:hover {
  color:var(--ink);
  background:color-mix(in oklab, var(--line-soft) 62%, transparent);
}
.node-workbench .wb-seedance-audio-upload {
  width:100%;
  min-height:34px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:7px 10px;
  border:1px dashed color-mix(in oklab, var(--line) 80%, var(--accent) 18%);
  border-radius:7px;
  background:color-mix(in oklab, var(--paper) 62%, transparent);
  color:var(--ink-mute);
  cursor:pointer;
  font-size:12px;
}
.node-workbench .wb-seedance-audio-upload:hover {
  border-color:var(--accent);
  color:var(--ink);
}
.node-workbench .wb-seedance-reference-limit {
  color:var(--ink-mute);
  font-size:10px;
  line-height:1.2;
}
.node-workbench .wb-reference-box-head,
.node-workbench .wb-reference-candidate-head {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  color:var(--ink-soft);
  font-size:11px;
  font-weight:700;
}
.node-workbench .wb-reference-box-head strong {
  min-width:20px;
  height:18px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  background:color-mix(in oklab, var(--accent) 16%, var(--paper));
  color:var(--accent);
  font-size:11px;
}
.node-workbench .wb-reference-selected-row {
  display:grid;
  grid-template-columns:minmax(0, 1fr) auto;
  gap:8px;
  align-items:stretch;
}
.node-workbench .wb-reference-selected-main {
  min-height:62px;
  display:flex;
  align-items:center;
  min-width:0;
  overflow:hidden;
}
.node-workbench .wb-reference-selected-main .wb-ref-grid {
  flex-wrap:nowrap;
  overflow-x:auto;
  overflow-y:visible;
  padding:2px 4px 8px 2px;
}
.node-workbench .wb-reference-selected-empty,
.node-workbench .wb-reference-candidate-empty {
  width:100%;
  min-height:54px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0 10px;
  border:1px dashed color-mix(in oklab, var(--line-soft) 82%, transparent);
  border-radius:8px;
  color:var(--ink-mute);
  font-size:12px;
  text-align:center;
}
.node-workbench .wb-reference-upload {
  width:76px;
  min-height:62px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:5px;
  padding:6px;
  border:1px dashed color-mix(in oklab, var(--accent) 36%, var(--line-soft));
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 70%, transparent);
  color:var(--ink-soft);
  cursor:pointer;
  font-size:11px;
}
.node-workbench .wb-reference-upload:hover {
  border-color:var(--accent);
  color:var(--ink);
}
.node-workbench .wb-reference-candidate-wrap {
  display:flex;
  flex-direction:column;
  gap:6px;
}
.node-workbench .wb-reference-candidate-rail {
  display:flex;
  gap:8px;
  min-width:0;
  overflow-x:auto;
  overflow-y:hidden;
  padding:1px 2px 8px;
  overscroll-behavior:contain;
  scroll-snap-type:x proximity;
}
.node-workbench .wb-reference-candidate-rail::-webkit-scrollbar,
.node-workbench .wb-reference-selected-main .wb-ref-grid::-webkit-scrollbar {
  height:7px;
}
.node-workbench .wb-reference-candidate-rail::-webkit-scrollbar-thumb,
.node-workbench .wb-reference-selected-main .wb-ref-grid::-webkit-scrollbar-thumb {
  background:color-mix(in oklab, var(--ink-mute) 36%, transparent);
  border-radius:999px;
}
.node-workbench .wb-ref-candidate {
  position:relative;
  width:150px;
  min-width:150px;
  height:50px;
  display:flex;
  align-items:center;
  gap:8px;
  padding:6px 8px 6px 6px;
  border:1px solid color-mix(in oklab, var(--line-soft) 82%, transparent);
  border-radius:8px;
  background:color-mix(in oklab, var(--paper) 84%, transparent);
  color:var(--ink);
  cursor:pointer;
  text-align:left;
  scroll-snap-align:start;
}
.node-workbench .wb-ref-candidate:hover,
.node-workbench .wb-ref-candidate.is-selected {
  border-color:var(--accent);
  background:color-mix(in oklab, var(--accent) 10%, var(--paper));
}
.node-workbench .wb-ref-candidate:disabled {
  opacity:.48;
  cursor:not-allowed;
}
.node-workbench .wb-ref-candidate-thumb {
  width:36px;
  height:36px;
  flex:0 0 auto;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border-radius:7px;
  border:1px solid var(--line-soft);
  background:var(--paper-2);
  color:var(--ink-mute);
}
.node-workbench .wb-ref-candidate-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-ref-candidate-main {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
}
.node-workbench .wb-ref-candidate-main strong {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:12px;
  line-height:1;
}
.node-workbench .wb-ref-candidate-main small {
  color:var(--ink-mute);
  font-size:10px;
  line-height:1;
}
.node-workbench .wb-ref-candidate-check {
  position:absolute;
  top:4px;
  right:4px;
  width:16px;
  height:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  background:var(--accent);
  color:var(--paper);
}
.node-workbench .wb-at-menu {
  position:absolute;
  left: 8px;
  right: auto;
  top: 8px;
  bottom: auto;
  width: min(148px, calc(100% - 24px));
  max-height: 108px;
  padding: 3px;
  border:1px solid var(--line);
  border-radius: 8px;
  background: color-mix(in oklab, var(--paper) 98%, transparent);
  box-shadow: var(--shadow-float);
  z-index: 35;
  overflow-y:auto;
  overflow-x:hidden;
  overscroll-behavior:contain;
}
.node-workbench .wb-at-menu::-webkit-scrollbar {
  width:5px;
  height:5px;
}
.node-workbench .wb-at-menu::-webkit-scrollbar-thumb {
  background:color-mix(in oklab, var(--ink-mute) 45%, transparent);
  border-radius:999px;
}
.node-workbench .wb-at-head {
  display:flex;
  align-items:center;
  justify-content:flex-start;
  gap: 5px;
  padding: 2px 3px 3px;
  color: var(--ink-mute);
  font-size: 10px;
}
.node-workbench .wb-at-item {
  position:relative;
  width:100%;
  display:flex;
  align-items:center;
  gap: 5px;
  padding: 3px;
  border:1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--ink);
  cursor:pointer;
  text-align:left;
}
.node-workbench .wb-at-item:hover {
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 8%, var(--paper-2));
}
.node-workbench .wb-at-thumb {
  width: 22px;
  height: 22px;
  flex:0 0 auto;
  border-radius: 5px;
  overflow:hidden;
  border:1px solid var(--line-soft);
  background: var(--paper-2);
  display:flex;
  align-items:center;
  justify-content:center;
  color: var(--ink-mute);
}
.node-workbench .wb-at-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.node-workbench .wb-at-main {
  min-width:0;
  display:block;
}
.node-workbench .wb-at-main strong {
  display:block;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size: 11px;
  line-height: 1.1;
  font-weight:650;
}
.node-workbench .wb-at-main span {
  display:block;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color: var(--ink-mute);
  font-size: 9px;
  line-height: 1.2;
}
.node-workbench .wb-at-empty {
  padding: 8px 4px;
  color: var(--ink-mute);
  text-align:center;
  font-size: 11px;
}
.node-workbench .wb-bottom {
  position:relative;
  display:flex;
  align-items:center;
  gap: 9px;
  flex-wrap:wrap;
}
.node-workbench .wb-control-anchor {
  position:relative;
  display:inline-flex;
  align-items:center;
  min-width:0;
}
.node-workbench .wb-model {
  display:inline-flex;
  align-items:center;
  gap: 6px;
  min-width: 140px;
  max-width: 190px;
  font-weight: 700;
  font-size: 13px;
}
.node-workbench .wb-model > span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.node-workbench .wb-control {
  display:inline-flex;
  align-items:center;
  gap: 5px;
  padding: 5px 7px;
  font-size: 12px;
}
.node-workbench .wb-mode-control {
  position:relative;
  min-width: 128px;
  justify-content:flex-start;
  cursor:pointer;
}
.node-workbench .wb-mode-control .wb-control-label {
  flex:0 0 auto;
  color: var(--ink-mute);
  font-size: 11px;
}
.node-workbench .wb-mode-value {
  min-width:0;
  max-width: 74px;
  color: var(--ink);
  font-size: 12px;
  font-weight:700;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.node-workbench .wb-mode-control svg {
  flex:0 0 auto;
  margin-left:auto;
  opacity:.72;
}
.node-workbench .wb-mode-anchor .wb-mode-menu {
  left: 0;
  bottom: calc(100% + 8px);
  width: 150px;
  box-sizing:border-box;
  padding: 7px;
}
.node-workbench .mode-option {
  width:100%;
  min-height: 32px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 8px;
  padding: 6px 8px;
  border:1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-soft);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 650;
  cursor:pointer;
  text-align:left;
}
.node-workbench .mode-option + .mode-option {
  margin-top: 4px;
}
.node-workbench .mode-option:hover:not(:disabled),
.node-workbench .mode-option.active {
  color: var(--ink);
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 12%, var(--paper-2));
}
.node-workbench .mode-option:disabled {
  cursor:not-allowed;
  color: color-mix(in oklab, var(--ink-mute) 48%, transparent);
  background: color-mix(in oklab, var(--paper-2) 60%, transparent);
}
.node-workbench .mode-option span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.node-workbench .wb-control.active {
  color: var(--ink);
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 12%, var(--paper-2));
}
.node-workbench .wb-param-control {
  font-weight: 650;
}
.node-workbench .wb-sep {
  width: 1px;
  height: 18px;
  background: var(--line-soft);
}
.node-workbench .wb-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-mute);
}
.node-workbench .wb-submit {
  margin-left:auto;
  width: 30px;
  height: 30px;
  border:none;
  border-radius: 9px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  color: var(--paper);
  background: var(--accent);
  box-shadow: 0 2px 0 color-mix(in oklab, var(--accent) 55%, var(--ink));
}
.node-workbench .wb-submit:disabled {
  opacity:.5;
  cursor:not-allowed;
  box-shadow:none;
}
.node-workbench .wb-pop {
  position:absolute;
  left: 200px;
  bottom: 40px;
  width: 330px;
  padding: 12px;
  border-radius: 12px;
  border:1px solid var(--line);
  background: color-mix(in oklab, var(--paper) 98%, transparent);
  box-shadow: var(--shadow-float);
  z-index: 30;
}
.node-workbench .wb-model-anchor .wb-model-pop {
  left: 0;
  bottom: calc(100% + 8px);
  width: 240px;
  min-width: 210px;
  max-width: min(315px, calc(100vw - 24px));
  box-sizing:border-box;
  padding: 8px;
}
.node-workbench .wb-params-pop {
  left: 150px;
}
.node-workbench .wb-pop h4 {
  margin: 0 0 8px;
  color: var(--ink-mute);
  font-size: 12px;
  font-weight: 600;
}
.node-workbench .ratio-grid {
  display:grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.node-workbench .ratio-card,
.node-workbench .res-btn,
.node-workbench .audio-btn {
  border:1px solid var(--line-soft);
  background: var(--paper-2);
  color: var(--ink-soft);
  border-radius: 8px;
  cursor:pointer;
}
.node-workbench .ratio-card {
  height: 64px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap: 7px;
  font-size: 12px;
}
.node-workbench .ratio-card .shape {
  border: 1.5px solid currentColor;
  border-radius: 2px;
}
.node-workbench .ratio-card.active,
.node-workbench .res-btn.active,
.node-workbench .audio-btn.active {
  color: var(--ink);
  border-color: var(--ink);
  background: color-mix(in oklab, var(--ink) 8%, var(--paper-2));
}
.node-workbench .res-row,
.node-workbench .audio-row {
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.node-workbench .res-btn,
.node-workbench .audio-btn {
  height: 32px;
  font-weight: 600;
}
.node-workbench .duration-row {
  display:flex;
  align-items:center;
  gap: 10px;
  color: var(--ink-mute);
  font-size: 12px;
  margin-bottom: 12px;
}
.node-workbench .duration-row.slider {
  display:block;
}
.node-workbench .duration-slider {
  display:flex;
  flex-direction:column;
  gap: 8px;
  padding: 8px 10px 10px;
  border:1px solid var(--line-soft);
  border-radius: 9px;
  background: var(--paper-2);
}
.node-workbench .duration-slider-head {
  display:grid;
  grid-template-columns: 1fr auto 1fr;
  align-items:center;
  gap: 10px;
  font-size: 11px;
  color: var(--ink-mute);
}
.node-workbench .duration-slider-head strong {
  color: var(--ink);
  font-size: 13px;
  font-weight: 750;
}
.node-workbench .duration-slider-head span:last-child {
  text-align:right;
}
.node-workbench input[type="range"] {
  flex:1;
  accent-color: var(--accent);
}
.node-workbench .duration-slider-control {
  width: 100%;
  margin: 0;
}
.node-workbench .model-list {
  display:flex;
  flex-direction:column;
  gap: 6px;
  max-height: 260px;
  overflow:auto;
}
.node-workbench .model-option {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
  min-height: 36px;
  padding: 7px 9px;
  border:1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper-2);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
  text-align:left;
}
.node-workbench .model-option span {
  flex:1 1 auto;
  min-width:0;
  overflow:visible;
  text-overflow:clip;
  white-space:normal;
  overflow-wrap:anywhere;
  line-height:1.25;
}
.node-workbench .model-option svg {
  flex:0 0 auto;
  margin-top:1px;
}
.node-workbench .model-option.active {
  color: var(--ink);
  border-color: var(--accent);
}
`;
