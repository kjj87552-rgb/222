/* 漫创AI panel styles — extracted from panels.jsx */

export const panelStyles = `
/* ===== Mini Top Bar — only logo + project name on left, avatar+credit on right ===== */
.minitop {
  position:absolute; top:0; left:0; right:0; height:56px;
  display:flex; align-items:center; padding: 0 24px;
  z-index: 50; pointer-events:none;
}
.minitop > * { pointer-events:auto; }
.minitop .brand {
  display:flex; align-items:center; gap:14px;
  font-family: var(--font-body); font-size:14px;
  color: var(--ink);
}
.minitop .brand .logo {
  display:inline-flex; align-items:center; gap:6px;
  font-weight:700; letter-spacing:.02em;
}
.minitop .brand .sep { color: var(--ink-mute); opacity:.4; }
.minitop .brand .proj { color: var(--ink-soft); font-size:13px; }
.minitop .right { margin-left:auto; display:flex; align-items:center; gap:10px; }
.minitop .icon-btn {
  width:32px; height:32px; border-radius:50%;
  background: color-mix(in oklab, var(--paper) 72%, transparent);
  border:1px solid color-mix(in oklab, var(--line-soft) 72%, var(--accent) 10%);
  display:flex; align-items:center; justify-content:center;
  color: var(--ink-soft); cursor:pointer;
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 34px -28px rgba(0,0,0,.82), inset 0 1px 0 rgba(255,255,255,.05);
}
.minitop .icon-btn:hover { color: var(--ink); border-color: color-mix(in oklab, var(--accent) 45%, var(--line)); }
.minitop .member {
  display:inline-flex; align-items:center; gap:8px;
  padding: 4px 12px 4px 8px; border-radius: 999px;
  background: color-mix(in oklab, var(--paper) 74%, transparent);
  border:1px solid color-mix(in oklab, var(--line-soft) 72%, var(--accent) 10%);
  font-size:12px; color: var(--ink); cursor:pointer;
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 34px -28px rgba(0,0,0,.82), inset 0 1px 0 rgba(255,255,255,.05);
}
.minitop .member .heart { color:var(--accent-2); }
.minitop .member .coin { color: var(--accent); font-family: var(--font-mono); font-weight:600; margin-left:4px; display:inline-flex; gap:2px; align-items:center; }
.minitop .avatar {
  width:30px; height:30px; border-radius:50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-3, #79A9FF) 100%);
  display:flex; align-items:center; justify-content:center;
  color:#fff; font-weight:700; font-size:12px;
  border:1px solid rgba(255,255,255,0.1);
  cursor:pointer;
}

/* ===== Left Rail — 48px, icons only ===== */
.leftrail {
  position:absolute; left:16px; top:50%; transform:translateY(-50%);
  width:48px; padding:6px;
  display:flex; flex-direction:column; gap:2px;
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--paper-2) 48%, transparent), transparent 70%),
    color-mix(in oklab, var(--paper) 78%, transparent);
  backdrop-filter: blur(16px);
  border:1px solid color-mix(in oklab, var(--line-soft) 72%, var(--accent) 12%);
  border-radius: 12px;
  z-index:40;
  box-shadow: 0 18px 58px -36px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.05);
}
.leftrail button {
  width:36px; height:36px; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  border:none; background:transparent; cursor:pointer;
  color: var(--ink-soft);
}
.leftrail button:hover { background: color-mix(in oklab, var(--accent) 10%, transparent); color: var(--ink); }
.leftrail button.active {
  background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, var(--paper-2)), color-mix(in oklab, var(--accent-2) 10%, var(--paper)));
  color: color-mix(in oklab, var(--accent) 82%, white);
  border: 1px solid color-mix(in oklab, var(--accent) 42%, transparent);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 10px 28px -24px color-mix(in oklab, var(--accent) 80%, transparent);
}

/* ===== Rail Popover (appears next to the rail when an icon is clicked) ===== */
.rail-pop {
  position:absolute; left:76px; top:50%; transform:translateY(-50%);
  width:240px;
  background: color-mix(in oklab, var(--paper) 88%, transparent);
  border:1px solid color-mix(in oklab, var(--line) 74%, var(--accent) 10%);
  border-radius: 12px;
  box-shadow: var(--shadow-float);
  padding:10px;
  z-index:45;
  font-family: var(--font-body);
  backdrop-filter: blur(18px);
}
.rail-pop:has(.rail-history-panel),.rail-pop:has(.rail-task-queue-panel){width:min(360px,calc(100vw - 92px));max-width:calc(100vw - 92px);min-width:0;box-sizing:border-box;top:16px;bottom:16px;transform:none;display:flex;padding:0;overflow:hidden}
.rail-pop .sub {
  padding: 4px 8px 8px;
  font-size:11px; color: var(--ink-mute);
  letter-spacing:.02em;
}
.rail-pop .item {
  display:flex; align-items:center; gap:10px;
  padding:8px 10px; border-radius:8px; cursor:pointer;
  font-size:13px; color: var(--ink);
}
.rail-pop .item:hover { background: color-mix(in oklab, var(--accent) 9%, var(--paper-2)); }
.rail-pop .item.disabled {
  cursor:not-allowed;
  opacity:.48;
}
.rail-pop .item.disabled:hover { background: transparent; }
.rail-pop .item .ic {
  width:24px; height:24px; border-radius:6px;
  background: var(--paper-2); border:1px solid var(--line-soft);
  display:flex; align-items:center; justify-content:center;
  color: var(--ink-soft);
}
.rail-pop .item .txt { flex:1; }
.rail-pop .item .beta {
  font-size:9px; padding:1px 5px; border-radius: 3px;
  background: color-mix(in oklab, var(--accent) 20%, var(--paper-2));
  color: var(--accent); font-weight:600; font-family: var(--font-mono);
}
.rail-pop .divider { height:1px; background: var(--line-soft); margin:6px 4px; }

.rail-history-panel{display:flex;flex-direction:column;gap:0;width:100%;max-width:100%;min-width:0;min-height:0;box-sizing:border-box;overflow:hidden;flex:1;background:color-mix(in oklab,var(--paper) 94%,transparent)}
.rail-history-head{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;max-width:100%;box-sizing:border-box;padding:12px 12px 8px;border-bottom:1px solid var(--line-soft)}
.rail-history-head div{display:flex;flex-direction:column;gap:2px;min-width:0}
.rail-history-head strong{font-size:13px;font-weight:700;color:var(--ink)}
.rail-history-head span{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rail-history-head button{width:28px;height:28px;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper-2);color:var(--ink-soft);display:flex;align-items:center;justify-content:center;cursor:pointer}
.rail-history-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;width:100%;max-width:100%;box-sizing:border-box;padding:10px 12px 8px;border-bottom:1px solid var(--line-soft)}
.rail-history-tabs button{appearance:none;min-width:0;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper-2);color:var(--ink-soft);font-size:10px;line-height:1;padding:7px 4px;white-space:nowrap;cursor:pointer;overflow:hidden;text-overflow:ellipsis}
.rail-history-tabs button.active{border-color:color-mix(in oklab,var(--accent) 52%,var(--line));background:color-mix(in oklab,var(--accent) 15%,var(--paper));color:var(--accent);font-weight:700}
.rail-history-search{height:32px;display:flex;align-items:center;gap:7px;margin:10px 12px 0;padding:0 9px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper)}
.rail-history-search svg{color:var(--ink-mute);flex:0 0 auto}
.rail-history-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:var(--ink);font-size:12px}
.rail-history-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:196px;gap:10px;width:100%;max-width:100%;box-sizing:border-box;flex:1;min-height:0;align-content:start;overflow-x:hidden;overflow-y:auto;padding:12px}
.rail-history-card{appearance:none;position:relative;display:flex;flex-direction:column;width:100%;max-width:100%;height:100%;min-width:0;min-height:0;box-sizing:border-box;padding:0;border:1px solid var(--line-soft);border-radius:8px;overflow:hidden;background:var(--paper);color:var(--ink);text-align:left;cursor:pointer}
.rail-history-card:hover,.rail-history-card.active{border-color:color-mix(in oklab,var(--accent) 46%,var(--line))}
.rail-history-kind{position:absolute;left:6px;top:6px;z-index:1;padding:2px 5px;border-radius:999px;background:rgba(0,0,0,.58);color:#fff;font-family:var(--font-mono);font-size:9px}
.rail-history-preview{position:relative;width:100%;height:112px;display:flex;align-items:center;justify-content:center;background:#07070a;color:var(--ink-mute);overflow:hidden;flex:0 0 112px}
.rail-history-preview img,.rail-history-preview video{width:100%;height:100%;object-fit:contain;display:block}
.rail-history-placeholder{position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:var(--ink-mute);font-size:11px;background:linear-gradient(135deg,rgba(24,24,27,.9),rgba(39,39,42,.72))}
.rail-history-placeholder i{position:absolute;left:0;bottom:0;height:3px;background:var(--accent)}
.rail-history-placeholder.text span{max-width:86%;text-align:center;line-height:1.4}
.rail-history-copy{display:flex;flex:1;flex-direction:column;gap:4px;padding:8px 8px 9px;min-width:0}
.rail-history-copy strong{font-size:11px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rail-history-copy em{font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rail-history-copy small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;font-size:10px;color:var(--accent-2,#FF6B6B);line-height:1.35}
.rail-history-empty{grid-column:1/-1;min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px dashed var(--line);border-radius:8px;color:var(--ink-mute);font-size:12px}
.rail-history-menu{position:fixed;z-index:9600;width:184px;padding:6px;border:1px solid var(--line,#BFD8EE);border-radius:9px;background:#F8FCFF;background:var(--paper,#F8FCFF);box-shadow:0 22px 54px -28px rgba(0,0,0,.48),0 0 0 1px rgba(22,35,58,.06);-webkit-backdrop-filter:none;backdrop-filter:none;isolation:isolate;pointer-events:auto}
.rail-history-menu-title{padding:5px 8px 7px;border-bottom:1px solid var(--line-soft,#D7E8F7);margin-bottom:4px;color:var(--ink-mute,#6E87A3);font-family:var(--font-mono,"IBM Plex Mono",ui-monospace,monospace);font-size:10px}
.rail-history-menu button{appearance:none;width:100%;display:flex;align-items:center;gap:8px;padding:8px;border:0;border-radius:7px;background:transparent;color:var(--ink-soft,#3D5774);font-size:12px;text-align:left;cursor:pointer}
.rail-history-menu button:hover:not(:disabled){background:var(--paper-2,#EAF4FF);color:var(--ink,#16233A)}
.rail-history-menu button:disabled{opacity:.45;cursor:not-allowed}
.rail-history-menu button.danger{color:var(--accent-2,#FF6B6B)}
.rail-history-menu-divider{height:1px;background:var(--line-soft,#D7E8F7);margin:5px 4px}

.rail-task-queue-panel{display:flex;flex-direction:column;gap:0;width:100%;max-width:100%;min-width:0;min-height:0;box-sizing:border-box;overflow:hidden;flex:1;background:color-mix(in oklab,var(--paper) 94%,transparent)}
.rail-task-head{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:10px;width:100%;max-width:100%;box-sizing:border-box;padding:12px 12px 8px;border-bottom:1px solid var(--line-soft)}
.rail-task-head div{display:flex;flex-direction:column;gap:2px;min-width:0}
.rail-task-head strong{font-size:13px;font-weight:700;color:var(--ink)}
.rail-task-head span{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rail-task-head button{width:28px;height:28px;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper-2);color:var(--ink-soft);display:flex;align-items:center;justify-content:center;cursor:pointer}
.rail-task-head button:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 40%,var(--line))}
.rail-task-tabs{display:grid;flex:0 0 auto;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;width:100%;max-width:100%;box-sizing:border-box;min-height:44px;padding:10px 12px 8px;border-bottom:1px solid var(--line-soft)}
.rail-task-tabs button{appearance:none;display:flex;align-items:center;justify-content:center;min-width:0;min-height:28px;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper-2);color:var(--ink-soft);font-size:10px;line-height:1;padding:7px 4px;white-space:nowrap;cursor:pointer;overflow:hidden;text-overflow:ellipsis}
.rail-task-tabs button.active{border-color:color-mix(in oklab,var(--accent) 52%,var(--line));background:color-mix(in oklab,var(--accent) 15%,var(--paper));color:var(--accent);font-weight:700}
.rail-task-list{display:flex;flex:1;flex-direction:column;gap:9px;width:100%;max-width:100%;box-sizing:border-box;min-height:0;overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable;padding:12px}
.rail-task-card{appearance:none;display:flex;flex:0 0 220px;flex-direction:column;gap:8px;width:100%;max-width:100%;height:220px;min-width:0;min-height:220px;box-sizing:border-box;overflow:hidden;padding:10px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);color:var(--ink);text-align:left;cursor:pointer}
.rail-task-card:hover,.rail-task-card:focus-visible{outline:0;border-color:color-mix(in oklab,var(--accent) 46%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent)}
.rail-task-card-top{display:flex;align-items:center;gap:8px;min-width:0}
.rail-task-icon{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:var(--paper-2);border:1px solid var(--line-soft);color:var(--ink-soft);flex:0 0 auto}
.rail-task-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:700;color:var(--ink)}
.rail-task-status{font-size:10px;padding:2px 6px;border-radius:999px;background:var(--paper-2);border:1px solid var(--line-soft);color:var(--ink-mute);white-space:nowrap}
.rail-task-card[data-status="queued"] .rail-task-status{color:var(--accent);border-color:color-mix(in oklab,var(--accent) 35%,var(--line));background:color-mix(in oklab,var(--accent) 10%,var(--paper))}
.rail-task-card[data-status="running"] .rail-task-status{color:var(--accent);border-color:color-mix(in oklab,var(--accent) 45%,var(--line));background:color-mix(in oklab,var(--accent) 14%,var(--paper))}
.rail-task-card[data-status="failed"] .rail-task-status{color:var(--accent-2,#FF6B6B);border-color:color-mix(in oklab,var(--accent-2,#FF6B6B) 38%,var(--line));background:color-mix(in oklab,var(--accent-2,#FF6B6B) 10%,var(--paper))}
.rail-task-card[data-status="canceled"] .rail-task-status{color:var(--ink-mute)}
.rail-task-prompt{font-size:12px;color:var(--ink-soft);line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rail-task-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.rail-task-meta span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rail-task-progress{height:5px;border-radius:999px;background:var(--paper-2);border:1px solid var(--line-soft);overflow:hidden}
.rail-task-progress i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--accent),color-mix(in oklab,var(--accent) 42%,var(--accent-2,#FF6B6B)));transition:width .18s ease}
.rail-task-error{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:11px;line-height:1.4;color:var(--accent-2,#FF6B6B);background:color-mix(in oklab,var(--accent-2,#FF6B6B) 8%,var(--paper));border:1px solid color-mix(in oklab,var(--accent-2,#FF6B6B) 20%,var(--line-soft));border-radius:7px;padding:7px;overflow:hidden;overflow-wrap:anywhere}
.rail-task-actions{display:flex;align-items:center;gap:8px;min-height:24px}
.rail-task-actions span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.rail-task-actions em{font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.rail-task-actions button{height:24px;display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line-soft);border-radius:6px;background:var(--paper-2);color:var(--ink-soft);font-size:11px;cursor:pointer}
.rail-task-actions button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 40%,var(--line));color:var(--accent)}
.rail-task-actions .rail-task-cancel-button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent-2,#FF6B6B) 36%,var(--line));color:var(--accent-2,#FF6B6B)}
.rail-task-actions button:disabled{opacity:.56;cursor:not-allowed}
.rail-task-empty{min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px dashed var(--line);border-radius:8px;color:var(--ink-mute);font-size:12px}
.rail-task-empty small{max-width:86%;text-align:center;font-size:10px;line-height:1.45;color:var(--accent-2,#FF6B6B)}
.rail-task-detail-mask{position:fixed;inset:0;background:rgba(9,14,22,.42);z-index:9200;backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:24px}
.rail-task-detail-modal{width:min(560px,calc(100vw - 48px));max-width:560px;max-height:calc(100vh - 64px);border-radius:10px}
.rail-task-detail-modal header{padding:12px 14px}
.rail-task-detail-modal header h2{font-size:13px}
.rail-task-detail-body{display:flex;flex-direction:column;gap:12px;padding:12px 14px}
.rail-task-detail-grid{display:grid;grid-template-columns:52px minmax(0,1fr);gap:7px 10px;padding:10px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2)}
.rail-task-detail-grid span{font-size:11px;color:var(--ink-mute)}
.rail-task-detail-grid strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;color:var(--ink)}
.rail-task-detail-section{display:flex;flex-direction:column;gap:7px}
.rail-task-detail-section h3{margin:0;font-size:11px;color:var(--ink-mute);font-weight:600}
.rail-task-detail-section p{margin:0;max-height:180px;overflow:auto;white-space:pre-wrap;word-break:break-word;line-height:1.55;font-size:12px;color:var(--ink-soft);padding:10px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper)}
.rail-task-detail-section.error p{color:var(--accent-2,#FF6B6B);background:color-mix(in oklab,var(--accent-2,#FF6B6B) 8%,var(--paper));border-color:color-mix(in oklab,var(--accent-2,#FF6B6B) 20%,var(--line-soft))}

/* ===== Canvas-scoped Design Space workbench ===== */
.canvas-design-space-layer {
  position:fixed;
  inset:0;
  z-index:8500;
  overflow:hidden;
  background:var(--bg);
}
.canvas-design-space-layer .design-space-page {
  min-height:0;
  width:100vw;
  height:100vh;
  background:var(--bg);
}
.canvas-design-space-layer .design-space-topbar {
  background:var(--paper);
}
.canvas-design-space-layer .design-space-workbench {
  min-height:0;
  overflow:hidden;
}
.has-window-chrome .canvas-design-space-layer {
  top:38px;
  bottom:auto;
  height:calc(100vh - 38px);
}
.has-window-chrome .canvas-design-space-layer .design-space-page {
  height:100%;
}

/* ===== Zoom control — bottom-left, minimal ===== */
.zoomctl {
  position:absolute; left:58px; bottom:14px;
  display:flex; align-items:center; gap:2px;
  z-index:40; font-family: var(--font-body);
  color: var(--ink-soft); font-size:12px;
}
.zoomctl button {
  width:24px; height:24px; border-radius:6px;
  border:none; background:transparent; cursor:pointer;
  color: var(--ink-soft); display:flex; align-items:center; justify-content:center;
}
.zoomctl button:hover { color: var(--ink); background: color-mix(in oklab, var(--ink) 10%, transparent); }
.zoomctl .pct { min-width: 40px; text-align:center; cursor:pointer; color: var(--ink); font-family: var(--font-mono); font-size:11px; }

/* ===== Canvas Tip (cyan floating tooltip, attached with a short cyan line) ===== */
.canvas-tip {
  position:absolute; left:50%; top:50%;
  transform:translate(-50%, -50%);
  pointer-events:none;
  display:flex; flex-direction:column; align-items:center; gap:8px;
  z-index:30; color: var(--accent);
  font-family: var(--font-body); font-size:13px;
}
.canvas-tip .bubble {
  display:inline-flex; align-items:center; gap:6px;
  padding: 8px 14px; border-radius: 999px;
  background: color-mix(in oklab, var(--paper) 80%, transparent);
  border:1px solid color-mix(in oklab, var(--accent) 30%, transparent);
  color: var(--ink);
  backdrop-filter: blur(6px);
}
.canvas-tip .bubble .cyan { color: var(--accent); }

/* ===== Context menu — 漫创AI compact vertical list with icons on the left ===== */
.ctxmenu {
  position: fixed; z-index: 999;
  min-width: 180px;
  background: var(--paper);
  border:1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow-float);
  font-family: var(--font-body); font-size: 13px;
  padding: 10px 8px;
  color: var(--ink);
}
.ctxmenu .sub {
  padding: 4px 10px 8px;
  font-size:11px; color: var(--ink-mute);
}
.ctxmenu .item {
  padding: 7px 10px; display:flex; align-items:center; gap:12px; cursor:pointer;
  border-radius: 8px;
}
.ctxmenu .item:hover { background: var(--bg-deep); }
.ctxmenu .item.disabled {
  cursor: default;
  opacity: .46;
}
.ctxmenu .item.disabled:hover { background: transparent; }
.ctxmenu .item.danger { color: var(--accent-2, #FF6B6B); }
.ctxmenu .item.danger:hover { background: color-mix(in oklab, var(--accent-2, #FF6B6B) 14%, transparent); }
.ctxmenu .item.danger .ic { color: var(--accent-2, #FF6B6B); }
.ctxmenu .item .ic {
  width:22px; height:22px; border-radius: 5px;
  background: var(--paper-2); border:1px solid var(--line-soft);
  display:flex; align-items:center; justify-content:center;
  color: var(--ink-soft);
}
.ctxmenu .item .label { flex:1; }
.ctxmenu .item .badge {
  font-size:9px; padding:1px 5px; border-radius: 3px;
  background: color-mix(in oklab, var(--accent) 20%, var(--paper-2));
  color: var(--accent); font-weight:600; font-family: var(--font-mono);
}
.ctxmenu .sep { height:1px; background: var(--line-soft); margin:6px 4px; }

/* ===== Modal / sheet ===== */
.modal-mask {
  position:absolute; inset:0; background: rgba(0,0,0,0.55);
  display:flex; align-items:center; justify-content:center; z-index: 500;
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--paper);
  border:1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow-float);
  max-width: 720px; width: 82%; max-height: 80%;
  display:flex; flex-direction:column; overflow:hidden;
}
.modal header {
  padding: 14px 18px; display:flex; align-items:center; gap:10px;
  border-bottom:1px solid var(--line-soft);
}
.modal header h2 { margin:0; font-size:15px; flex:1; font-weight:600; }
.modal header .close { border:none; background:transparent; cursor:pointer; padding:4px; border-radius:6px; color: var(--ink-soft); }
.modal header .close:hover { background: var(--bg-deep); color: var(--ink); }
.modal .body { padding: 14px 18px; overflow:auto; }

.group-name-modal {
  width: 420px;
  max-width: calc(100% - 48px);
}
.group-name-modal header .close {
  font-size: 12px;
  color: var(--ink-mute);
}
.group-name-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.group-name-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: var(--ink-soft);
}
.group-name-field input {
  height: 38px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--ink);
  padding: 0 12px;
  outline: none;
}
.group-name-field input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent);
}
.group-name-meta {
  font-size: 12px;
  color: var(--ink-mute);
}
.group-name-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}
.background-panel-color-field {
  display:flex;
  flex-direction:column;
  gap:8px;
  color:var(--ink-soft);
  font-size:12px;
}
.background-panel-color-row {
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}
.background-panel-color-option {
  --background-panel-option-color: #D7ECFF;
  width:32px;
  height:32px;
  border-radius:8px;
  border:1px solid color-mix(in oklab, var(--background-panel-option-color) 66%, var(--line));
  background:var(--background-panel-option-color);
  cursor:pointer;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.42);
}
.background-panel-color-option.active {
  border-color:var(--accent);
  box-shadow:0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent), inset 0 0 0 1px rgba(255,255,255,.55);
}
.background-panel-color-input {
  width:36px;
  height:32px;
  border:1px solid var(--line);
  border-radius:8px;
  padding:2px;
  background:var(--paper-2);
  cursor:pointer;
}

.kb-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 18px 30px; }
.kb-group h4 { margin:0 0 8px; font-size:10px; color: var(--ink-mute); text-transform:uppercase; letter-spacing:.1em; font-weight:600; }
.kb-row { display:flex; align-items:center; justify-content:space-between; padding: 5px 0; border-bottom: 1px solid var(--line-soft); font-size: 12px; }
.kb-row:last-child { border-bottom:none; }
.kb-row .desc { color: var(--ink-soft); }
.kb-row .keys { font-family: var(--font-mono); font-size:11px; color: var(--ink-soft); }
.kb-row .keys span {
  background: var(--paper-2); border:1px solid var(--line-soft);
  padding:1px 6px; border-radius: 4px; margin-left:2px; color: var(--ink);
}
`;
