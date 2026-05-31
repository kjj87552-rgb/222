/* Storyboard Workbench — full-screen modal styles.
 * Injected once at App-level via <style>{workbenchStyles}</style>. */
export const workbenchStyles = `
.sb-workbench-backdrop{position:fixed;inset:0;z-index:8500;background:radial-gradient(ellipse at center,rgba(10,11,13,.55),rgba(10,11,13,.86));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:stretch;justify-content:stretch;animation:sb-fade .25s ease}
.has-window-chrome .sb-workbench-backdrop{top:38px;bottom:auto;height:calc(100% - 38px)}
@keyframes sb-fade{from{opacity:0}to{opacity:1}}
.sb-workbench{position:relative;flex:1;display:flex;flex-direction:column;background:linear-gradient(180deg,color-mix(in oklab,var(--bg) 84%,var(--paper)),var(--bg));color:var(--ink);overflow:hidden}

.sb-workbench-shellbar{display:grid;grid-template-columns:minmax(230px,.72fr) minmax(420px,1.52fr) minmax(220px,.76fr);align-items:center;gap:14px;flex:0 0 auto;padding:9px 16px;border-bottom:1px solid color-mix(in oklab,var(--accent) 16%,var(--line-soft));background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 96%,var(--accent) 4%),color-mix(in oklab,var(--paper-2) 82%,var(--bg)));box-shadow:0 14px 34px -34px rgba(15,23,42,.72)}
.sb-shell-left{display:flex;align-items:center;gap:10px;min-width:0}
.sb-shell-back{appearance:none;display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 10px;border:1px solid var(--line);border-radius:999px;background:linear-gradient(180deg,var(--paper),color-mix(in oklab,var(--paper-2) 78%,var(--paper)));color:var(--ink-soft);cursor:pointer;font-size:12px;transition:color .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease}
.sb-shell-back:hover{color:var(--accent);border-color:color-mix(in oklab,var(--accent) 48%,var(--line));background:color-mix(in oklab,var(--accent) 7%,var(--paper));box-shadow:0 8px 18px -16px color-mix(in oklab,var(--accent) 72%,black)}
.sb-shell-title{display:flex;flex-direction:column;gap:2px;min-width:0}
.sb-shell-title span{display:flex;align-items:center;gap:5px;color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
.sb-shell-title strong{display:block;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink);font-size:13px;font-weight:650}
.sb-mode-tabs{display:inline-flex;align-items:center;gap:4px;padding:3px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper-2)}
.sb-mode-tabs button{appearance:none;border:0;border-radius:999px;background:transparent;color:var(--ink-mute);font-size:12px;padding:6px 12px;cursor:pointer;font-family:var(--font-body)}
.sb-mode-tabs button:hover{color:var(--ink-soft)}
.sb-mode-tabs button.active,.sb-mode-tabs button[aria-selected="true"]{background:var(--accent);color:var(--accent-ink,#fff)}
.sb-shell-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;min-width:0}
.sb-workflow-tabs{display:flex;align-items:center;gap:5px;min-width:0;width:100%;padding:4px;border:1px solid color-mix(in oklab,var(--accent) 16%,var(--line-soft));border-radius:14px;background:color-mix(in oklab,var(--paper) 74%,var(--paper-2));box-shadow:inset 0 1px 0 color-mix(in oklab,white 42%,transparent)}
.sb-workflow-tabs button{appearance:none;position:relative;display:flex;align-items:center;justify-content:center;gap:6px;min-width:0;flex:1;height:36px;padding:0 10px;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--ink-mute);cursor:pointer;font-size:12px;font-family:var(--font-body);transition:color .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease}
.sb-workflow-tabs button:hover{color:var(--ink);background:color-mix(in oklab,var(--accent) 5%,transparent)}
.sb-workflow-tabs button.active{color:var(--accent);border-color:color-mix(in oklab,var(--accent) 34%,var(--line));background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 12%,var(--paper)),color-mix(in oklab,var(--accent) 6%,var(--paper-2)));box-shadow:0 9px 22px -18px color-mix(in oklab,var(--accent) 82%,black)}
.sb-workflow-tabs button:disabled{opacity:.45;cursor:not-allowed}
.sb-workflow-tabs button:disabled:hover{color:var(--ink-mute);background:transparent}
.sb-workflow-tabs .tab-index{font-family:var(--font-mono);font-size:10px;color:color-mix(in oklab,currentColor 64%,var(--ink-mute));white-space:nowrap}
.sb-workflow-tabs .tab-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;flex:0 0 auto}
.sb-workflow-tabs .tab-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-workflow-tabs .tab-pulse{position:absolute;right:7px;top:7px;width:6px;height:6px;border-radius:999px;background:var(--accent);box-shadow:0 0 0 4px color-mix(in oklab,var(--accent) 14%,transparent);animation:sb-pulse 1.2s ease-in-out infinite alternate}
.sb-task-orb-status{display:inline-flex;align-items:center;gap:8px;min-width:0;max-width:270px;height:40px;padding:4px 10px 4px 5px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line-soft));border-radius:999px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 95%,var(--accent) 5%),color-mix(in oklab,var(--paper-2) 86%,var(--bg)));box-shadow:0 12px 28px -24px color-mix(in oklab,var(--accent) 76%,black);color:var(--ink-soft);pointer-events:none}
.sb-task-orb-status.inline{margin-left:auto;flex:0 1 260px}
.sb-task-orb-status.shell{flex:0 1 260px}
.sb-progress-ring{--progress:0deg;position:relative;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;flex:0 0 32px;border-radius:50%;background:conic-gradient(var(--accent) 0deg var(--progress),color-mix(in oklab,var(--ink-mute) 16%,transparent) var(--progress) 360deg);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--accent) 24%,transparent),0 0 18px -10px color-mix(in oklab,var(--accent) 80%,black)}
.sb-progress-ring::after{content:"";position:absolute;inset:4px;border-radius:inherit;background:var(--paper)}
.sb-progress-ring em{position:relative;z-index:1;font-family:var(--font-mono);font-size:9px;font-style:normal;font-weight:700;color:var(--accent);line-height:1}
.sb-task-orb-copy{display:flex;min-width:0;flex-direction:column;gap:1px}
.sb-task-orb-copy strong{font-size:12px;color:var(--ink);font-weight:650;white-space:nowrap}
.sb-task-orb-copy span{display:block;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--ink-mute)}
.sb-task-orb-status.error{border-color:color-mix(in oklab,#ef4444 44%,var(--line));background:color-mix(in oklab,#ef4444 8%,var(--paper))}
.sb-task-orb-status.error .sb-progress-ring{background:conic-gradient(#ef4444 0deg var(--progress),color-mix(in oklab,#ef4444 16%,transparent) var(--progress) 360deg)}
.sb-task-orb-status.error .sb-progress-ring em{color:#ef4444}
.sb-queue-modal-backdrop{position:fixed;inset:0;z-index:8800;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(8,13,20,.46);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px)}
.sb-queue-modal{display:flex;flex-direction:column;width:min(720px,calc(100vw - 44px));max-height:min(720px,calc(100vh - 44px));overflow:hidden;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));border-radius:12px;background:linear-gradient(180deg,var(--paper),color-mix(in oklab,var(--paper-2) 88%,var(--bg)));box-shadow:0 24px 72px -42px rgba(2,6,23,.78);color:var(--ink)}
.sb-queue-modal-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line-soft)}
.sb-queue-modal-head div{display:flex;min-width:0;flex-direction:column;gap:3px}
.sb-queue-modal-head strong{font-size:15px;font-weight:700;color:var(--ink)}
.sb-queue-modal-head span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.sb-queue-modal-close{appearance:none;height:30px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);font-size:12px;cursor:pointer}
.sb-queue-modal-stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;padding:12px 16px;border-bottom:1px solid var(--line-soft)}
.sb-queue-stat{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:4px 8px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);font-family:var(--font-mono);font-size:11px;color:var(--ink-mute);white-space:nowrap}
.sb-queue-stat.completed{color:#059669;border-color:color-mix(in oklab,#10b981 30%,var(--line-soft));background:color-mix(in oklab,#10b981 8%,var(--paper))}
.sb-queue-stat.running,.sb-queue-stat.queued,.sb-queue-stat.pending{color:var(--accent);border-color:color-mix(in oklab,var(--accent) 32%,var(--line-soft));background:color-mix(in oklab,var(--accent) 8%,var(--paper))}
.sb-queue-stat.failed{color:#dc2626;border-color:color-mix(in oklab,#ef4444 30%,var(--line-soft));background:color-mix(in oklab,#ef4444 8%,var(--paper))}
.sb-queue-modal-actions{display:flex;align-items:center;gap:9px;padding:10px 16px;border-bottom:1px solid var(--line-soft)}
.sb-queue-modal-list{display:flex;flex:1;min-height:0;flex-direction:column;gap:8px;overflow:auto;padding:12px 16px}
.sb-queue-task{display:flex;flex-direction:column;gap:8px;padding:10px;border:1px solid color-mix(in oklab,var(--accent) 20%,var(--line-soft));border-radius:10px;background:color-mix(in oklab,var(--paper-2) 64%,var(--paper))}
.sb-queue-task-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}
.sb-queue-task-head div{display:flex;min-width:0;flex-direction:column;gap:2px}
.sb-queue-task-head strong{font-size:13px;font-weight:700;color:var(--ink)}
.sb-queue-task-head span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.sb-queue-task-items{display:flex;flex-direction:column;gap:6px}
.sb-queue-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(160px,auto);gap:10px;align-items:center;min-height:58px;padding:10px 12px;border:1px solid var(--line-soft);border-radius:8px;background:color-mix(in oklab,var(--paper) 90%,var(--paper-2))}
.sb-queue-row-main{display:flex;min-width:0;flex-direction:column;gap:3px}
.sb-queue-row-main strong{font-family:var(--font-mono);font-size:12px;color:var(--ink)}
.sb-queue-row-main span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--ink-mute)}
.sb-queue-row-meta{display:flex;min-width:0;align-items:center;justify-content:flex-end;gap:7px;flex-wrap:wrap;font-size:11px;color:var(--ink-mute)}
.sb-queue-row-meta code{max-width:128px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-mono);font-size:10px;color:var(--accent)}
.sb-queue-row-meta em{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:normal;color:#dc2626}

.sb-body{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;padding:12px 16px 14px}
.sb-body>*{flex:1;min-height:0;width:100%}
.sb-body.asset-bindings-body{display:flex;flex-direction:column;min-height:0;overflow:hidden}
.sb-statusbar{display:none}

/* ScriptTab */
.sb-script-command-strip{display:flex;align-items:center;gap:9px;flex:0 0 auto;min-height:48px;padding:8px 10px;border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line-soft));border-radius:12px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 94%,var(--accent) 4%),color-mix(in oklab,var(--paper-2) 84%,var(--bg)));box-shadow:0 14px 34px -32px rgba(15,23,42,.7)}
.sb-script-command-strip[data-busy="true"]{border-color:color-mix(in oklab,var(--accent) 36%,var(--line));box-shadow:0 16px 36px -32px color-mix(in oklab,var(--accent) 88%,black)}
.sb-tool-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:34px;padding:0 13px;border:1px solid var(--line);border-radius:9px;background:var(--paper);color:var(--ink-soft);font-size:12px;cursor:pointer;transition:color .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease,transform .16s ease}
.sb-tool-btn .btn-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;flex:0 0 auto}
.sb-tool-btn:hover:not(:disabled){color:var(--ink);border-color:color-mix(in oklab,var(--accent) 44%,var(--line));background:color-mix(in oklab,var(--accent) 6%,var(--paper));box-shadow:0 9px 20px -18px color-mix(in oklab,var(--accent) 76%,black);transform:translateY(-1px)}
.sb-tool-btn.primary{background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent) 68%,white));border-color:transparent;color:#031018;font-weight:650}
.sb-tool-btn.primary:hover:not(:disabled){color:#031018;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 92%,white),color-mix(in oklab,var(--accent) 60%,white))}
.sb-tool-btn.warning{background:color-mix(in oklab,#facc15 13%,var(--paper));border-color:color-mix(in oklab,#facc15 45%,var(--line));color:var(--ink)}
.sb-tool-btn.danger{background:color-mix(in oklab,#ef4444 9%,var(--paper));border-color:color-mix(in oklab,#ef4444 36%,var(--line));color:#b91c1c}
.sb-tool-btn:disabled{opacity:.45;cursor:not-allowed}
.sb-tool-btn.is-loading,.sb-package-actions button.is-loading{opacity:.82;cursor:wait}
.sb-btn-spinner{width:13px;height:13px;border-radius:50%;border:2px solid color-mix(in oklab,currentColor 28%,transparent);border-top-color:currentColor;animation:sb-spin .8s linear infinite;flex:0 0 auto}
@keyframes sb-spin{to{transform:rotate(360deg)}}

.sb-engine-switch{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--ink-mute)}
.sb-engine-switch button{appearance:none;border:1px solid var(--line);background:var(--paper);color:var(--ink-soft);padding:4px 10px;border-radius:6px;cursor:pointer;font-family:var(--font-mono);font-size:11px}
.sb-engine-switch button.active{background:color-mix(in oklab,var(--accent) 16%,var(--paper));border-color:color-mix(in oklab,var(--accent) 50%,var(--line));color:var(--accent)}
.sb-duration-slider{display:flex;align-items:center;gap:12px;min-width:282px;color:var(--ink-mute);font-size:12px}
.sb-duration-slider span{display:inline-flex;align-items:baseline;gap:6px;white-space:nowrap}
.sb-duration-slider strong{font-family:var(--font-mono);font-size:13px;color:var(--accent);font-weight:700}
.sb-duration-slider input{width:184px;accent-color:var(--accent);cursor:pointer}
.sb-prompt-template-controls{display:grid;grid-template-columns:minmax(122px,.54fr) minmax(220px,1fr);align-items:end;gap:8px;min-width:360px}
.sb-prompt-template-controls label{display:flex;flex-direction:column;gap:4px;min-width:0}
.sb-prompt-template-controls label>span{font-size:10px;color:var(--ink-mute);font-family:var(--font-mono);letter-spacing:.04em}
.sb-prompt-template-controls select{min-width:0;width:100%;height:34px;padding:0 9px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);font-size:12px;outline:none}
.sb-prompt-template-controls select:focus{border-color:color-mix(in oklab,var(--accent) 52%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent)}

.sb-model-picker{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--ink-mute)}
.sb-model-picker .picker-btn{appearance:none;display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 10px;border:1px solid var(--line);border-radius:9px;background:linear-gradient(180deg,var(--paper),color-mix(in oklab,var(--paper-2) 80%,var(--paper)));color:var(--ink);cursor:pointer;font-size:12px;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:border-color .16s ease,background .16s ease,box-shadow .16s ease}
.sb-model-picker .picker-btn:hover{border-color:color-mix(in oklab,var(--accent) 44%,var(--line));background:color-mix(in oklab,var(--accent) 6%,var(--paper));box-shadow:0 8px 18px -16px color-mix(in oklab,var(--accent) 70%,black)}
.sb-model-picker .picker-btn span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-model-picker .picker-btn .arrow{display:inline-flex;align-items:center;color:var(--ink-mute);margin-left:1px}
.sb-model-menu{position:absolute;top:calc(100% + 4px);right:0;z-index:10;min-width:280px;max-height:320px;overflow:auto;padding:4px;background:var(--paper);border:1px solid var(--line);border-radius:8px;box-shadow:0 12px 32px -10px rgba(0,0,0,.4)}
.sb-model-menu .item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:6px;cursor:pointer;font-size:12px}
.sb-model-menu .item:hover{background:color-mix(in oklab,var(--accent) 8%,var(--paper))}
.sb-model-menu .item.active{background:color-mix(in oklab,var(--accent) 16%,var(--paper));color:var(--accent)}
.sb-model-menu .item .label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-model-menu .item .provider{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.sb-model-menu .empty{padding:14px;text-align:center;color:var(--ink-mute);font-size:12px}

.sb-hint-banner{padding:10px 14px;margin-bottom:14px;border:1px solid var(--line-soft);border-radius:8px;background:color-mix(in oklab,var(--accent) 8%,var(--paper-2));color:var(--ink-soft);font-size:12px;display:flex;align-items:center;gap:8px}
.sb-hint-banner.kind-prose{background:color-mix(in oklab,#a78bfa 8%,var(--paper-2));border-color:color-mix(in oklab,#a78bfa 30%,var(--line))}
.sb-hint-banner.kind-loose{background:color-mix(in oklab,#facc15 8%,var(--paper-2));border-color:color-mix(in oklab,#facc15 30%,var(--line))}

.sb-script-layout{display:flex;flex:1;flex-direction:column;gap:10px;min-height:0;overflow:hidden}
.sb-script-toolbar{flex:0 0 auto}
.sb-script-split{display:grid;flex:1;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:stretch;min-height:0}
.sb-script-pane{display:flex;flex-direction:column;min-width:0;min-height:0;border:1px solid color-mix(in oklab,var(--accent) 12%,var(--line-soft));border-radius:12px;background:color-mix(in oklab,var(--paper) 90%,var(--bg));overflow:hidden;box-shadow:0 18px 44px -38px rgba(15,23,42,.72)}
.sb-script-pane-head{display:flex;align-items:center;min-height:38px;padding:9px 13px;border-bottom:1px solid var(--line-soft);background:linear-gradient(180deg,var(--paper),color-mix(in oklab,var(--paper-2) 72%,var(--paper)))}
.sb-script-pane-head h3{display:flex;align-items:center;gap:8px;margin:0;font-size:14px;font-weight:650;color:var(--ink);letter-spacing:0}
.sb-script-pane-head h3::before{content:'';width:3px;height:16px;border-radius:999px;background:var(--accent);box-shadow:0 0 12px color-mix(in oklab,var(--accent) 28%,transparent)}
.sb-script-pane-head p{margin:0;font-size:12px;line-height:1.5;color:var(--ink-mute)}
.sb-script-pane>div:last-child{display:flex;flex:1;flex-direction:column;min-height:0}
.sb-script-pane .sb-hint-banner{margin:12px 12px 0}
.sb-script-pane .sb-script-editor{flex:1;min-height:0;border:0;border-radius:0;background:transparent;resize:none}
.sb-script-pane .sb-script-editor:focus{box-shadow:inset 0 0 0 2px color-mix(in oklab,var(--accent) 34%,transparent)}

.sb-script-editor{width:100%;min-height:520px;padding:14px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink);font-family:var(--font-mono);font-size:13px;line-height:1.7;resize:vertical;outline:none}
.sb-script-editor:focus{border-color:color-mix(in oklab,var(--accent) 50%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent)}
.sb-script-editor-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 12px;border-top:1px solid var(--line-soft);background:color-mix(in oklab,var(--paper) 88%,var(--paper-2));color:var(--ink-mute);font-family:var(--font-mono);font-size:10px}
.sb-script-editor-meta.over-limit{color:#dc2626;background:color-mix(in oklab,#ef4444 7%,var(--paper))}
.sb-script-limit-warning{padding:8px 12px;border-top:1px solid color-mix(in oklab,#ef4444 28%,var(--line-soft));background:color-mix(in oklab,#ef4444 8%,var(--paper));color:#dc2626;font-size:12px;line-height:1.45}

/* AssetsTab */
.sb-assets-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.sb-assets-col{display:flex;flex-direction:column;gap:10px}
.sb-assets-col-head{display:flex;align-items:center;justify-content:space-between;font-family:var(--font-mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:4px}
.sb-asset-card{padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:var(--paper)}
.sb-asset-card .name{font-family:'Source Serif 4','Noto Serif SC',serif;font-size:15px;font-weight:500;color:var(--ink);margin-bottom:6px}
.sb-asset-card .details{font-size:12px;line-height:1.6;color:var(--ink-soft);max-height:90px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical}
.sb-asset-card .actions{display:flex;gap:6px;margin-top:8px}
.sb-asset-card .actions button{appearance:none;flex:1;padding:4px 8px;border:1px solid var(--line-soft);border-radius:5px;background:var(--paper-2);color:var(--ink-mute);cursor:pointer;font-size:11px}
.sb-asset-card .actions button:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 40%,var(--line))}
.sb-asset-card .actions button.danger{color:#fca5a5}
.sb-asset-card .actions button.danger:hover{border-color:#f87171}
.sb-asset-card.editing textarea{width:100%;min-height:100px;padding:8px;border:1px solid var(--line);border-radius:5px;background:var(--paper-2);color:var(--ink);font-family:inherit;font-size:12px;outline:none;resize:vertical}
.sb-asset-card.editing input{width:100%;padding:6px 8px;border:1px solid var(--line);border-radius:5px;background:var(--paper-2);color:var(--ink);font-size:12px;margin-bottom:6px;outline:none}
.sb-asset-add{padding:14px;border:1px dashed var(--line);border-radius:8px;background:transparent;color:var(--ink-mute);cursor:pointer;font-size:12px;text-align:center}
.sb-asset-add:hover{border-color:color-mix(in oklab,var(--accent) 50%,var(--line));color:var(--accent)}

/* AssetBindingsTab */
.sb-asset-bindings{display:flex;flex:1;flex-direction:column;gap:14px;min-height:0}
.embedded-design-space-workbench{display:flex;flex:1;flex-direction:column;gap:12px;min-height:0;border:1px solid var(--line-soft);border-radius:10px;background:color-mix(in oklab,var(--paper) 88%,var(--bg));padding:12px}
.embedded-design-space-toolbar{display:flex;align-items:center;gap:10px;justify-content:space-between;min-width:0}
.embedded-design-space-toolbar .design-space-top-controls{flex:1;min-width:0}
.design-space-open-full{appearance:none;border:1px solid color-mix(in oklab,var(--accent) 42%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--accent) 9%,var(--paper));color:var(--accent);padding:7px 11px;cursor:pointer;font-size:12px;white-space:nowrap}
.design-space-workbench.embedded{display:grid;flex:1;grid-template-columns:minmax(260px,.82fr) minmax(420px,1.12fr) minmax(300px,.9fr);gap:12px;min-height:0;overflow:hidden}
.design-space-workbench.embedded .design-space-panel{min-height:0}
.design-space-workbench.embedded .design-card-panel,.design-space-workbench.embedded .design-detail-panel,.design-space-workbench.embedded .design-space-input-panel{height:100%;max-height:none;overflow:auto}
.canvas-design-space-layer .embedded-design-space-workbench{flex:1;min-height:0;height:auto;display:flex;flex-direction:column;gap:0;border:0;border-radius:0;background:var(--bg);padding:0}
.canvas-design-space-layer .embedded-design-space-toolbar{flex:0 0 auto;padding:14px 14px 0}
.canvas-design-space-layer .design-space-workbench.embedded{flex:1;min-height:0;height:auto;max-height:none;grid-template-columns:minmax(260px,.85fr) minmax(360px,1.15fr) minmax(320px,1fr);gap:14px;padding:14px;overflow:hidden}
.canvas-design-space-layer .design-space-workbench.embedded .design-space-panel{min-height:0;overflow:hidden}
.canvas-design-space-layer .design-space-workbench.embedded .design-card-panel,.canvas-design-space-layer .design-space-workbench.embedded .design-detail-panel,.canvas-design-space-layer .design-space-workbench.embedded .design-space-input-panel{height:100%;max-height:none;overflow:auto}
.sb-design-picker{display:grid;grid-template-columns:auto minmax(180px,280px) 1fr;gap:12px;align-items:start;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);padding:12px}
.sb-design-picker-head{grid-column:1/-1;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:2px 2px 10px;border-bottom:1px solid var(--line-soft)}
.sb-design-picker-head strong{display:block;margin-bottom:4px;color:var(--ink);font-size:14px;font-weight:650}
.sb-design-picker-head p{margin:0;color:var(--ink-mute);font-size:12px;line-height:1.5}
.sb-design-picker-head button{appearance:none;border:1px solid color-mix(in oklab,var(--accent) 42%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));color:var(--accent);padding:7px 11px;cursor:pointer;font-size:12px;white-space:nowrap}
.sb-design-picker-head button:hover{background:color-mix(in oklab,var(--accent) 16%,var(--paper));border-color:color-mix(in oklab,var(--accent) 62%,var(--line))}
.sb-design-picker-tabs{display:flex;gap:6px}
.sb-design-picker-tabs button{border:1px solid var(--line);border-radius:999px;background:var(--paper-2);color:var(--ink-mute);padding:6px 10px;cursor:pointer}
.sb-design-picker-tabs button.active{border-color:var(--accent);color:var(--accent);background:color-mix(in oklab,var(--accent) 10%,var(--paper))}
.sb-design-picker input{width:100%;border:1px solid var(--line);border-radius:8px;background:var(--paper-2);color:var(--ink);padding:8px 10px}
.sb-design-picker-list{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;max-height:260px;overflow:auto}
.sb-design-picker-item{display:grid;grid-template-columns:46px 1fr;gap:8px;text-align:left;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);padding:8px;cursor:pointer;color:var(--ink)}
.sb-design-picker-item .thumb{grid-row:1/3;width:46px;height:46px;border-radius:6px;overflow:hidden;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--ink-mute);font-size:11px}
.sb-design-picker-item img{width:100%;height:100%;object-fit:cover}
.sb-design-picker-item strong{font-size:13px}
.sb-design-picker-item small{font-size:11px;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-binding-card{display:grid;grid-template-columns:54px 1fr auto;gap:10px;align-items:center;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);padding:10px}
.sb-binding-card.candidate{grid-template-columns:1fr;border-style:dashed;background:var(--paper-2)}
.sb-binding-thumb{width:54px;height:54px;border-radius:7px;overflow:hidden;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--ink-mute);font-size:11px}
.sb-binding-thumb img{width:100%;height:100%;object-fit:cover}
.sb-binding-main{display:flex;flex-direction:column;gap:4px;min-width:0}
.sb-binding-main strong{font-size:13px;color:var(--ink)}
.sb-binding-main span{font-size:11px;color:var(--ink-mute)}
.sb-binding-main p{margin:0;font-size:12px;color:var(--ink-soft);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-binding-card button{border:1px solid var(--line);border-radius:999px;background:var(--paper-2);color:var(--ink-mute);font-size:12px;padding:6px 10px;cursor:pointer}
.sb-binding-card button:disabled{opacity:.55;cursor:not-allowed}
.sb-binding-card.project-asset{border-color:color-mix(in oklab,var(--accent) 22%,var(--line-soft));background:color-mix(in oklab,var(--accent) 5%,var(--paper))}

/* ShotsTab */
.sb-shots-layout{position:relative;display:flex;flex:1;flex-direction:column;min-height:0;overflow:hidden}
.sb-shots-scale-frame{position:absolute;inset:0 auto auto 0;display:flex;min-height:0;flex-direction:column;transform-origin:top left}
.sb-shot-scroll{flex:1;min-height:0;overflow:hidden}
.sb-shot-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px;padding:14px;border:1px solid var(--line-soft);border-radius:10px;background:var(--paper)}
.sb-shot-controls h2{margin:0 0 4px;font-size:18px;color:var(--ink);font-weight:650;letter-spacing:0}
.sb-shot-controls p{margin:0;color:var(--ink-mute);font-size:12px}
.sb-shot-control-actions{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:12px;min-width:min(100%,780px)}
.sb-shot-param-panel{display:grid;grid-template-columns:auto minmax(360px,1fr);align-items:end;gap:10px;padding:8px 10px;border:1px solid var(--line-soft);border-radius:10px;background:color-mix(in oklab,var(--paper-2) 72%,var(--paper))}
.sb-shot-action-panel{display:flex;align-items:end;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.sb-shot-production-workbench{display:grid;grid-template-columns:290px minmax(520px,1fr) 360px;gap:12px;height:100%;min-height:0}
.sb-shot-nav-panel,.sb-shot-main-panel,.sb-shot-inspector{min-height:0;border:1px solid color-mix(in oklab,var(--accent) 13%,var(--line-soft));border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 96%,var(--accent) 2%),color-mix(in oklab,var(--paper-2) 88%,var(--bg)));box-shadow:0 18px 42px -38px rgba(15,23,42,.66)}
.sb-shot-nav-panel{display:flex;flex-direction:column;overflow:hidden}
.sb-shot-nav-title{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:42px;padding:10px 12px;border-bottom:1px solid var(--line-soft)}
.sb-shot-nav-title strong{font-size:13px;color:var(--ink);font-weight:650}
.sb-shot-nav-title span{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.sb-shot-nav-list{display:flex;flex:1;min-height:0;flex-direction:column;gap:10px;overflow:auto;padding:12px}
.sb-shot-nav-group{flex:0 0 auto;border:1px solid color-mix(in oklab,var(--accent) 14%,var(--line-soft));border-radius:10px;background:color-mix(in oklab,var(--paper) 86%,var(--paper-2));overflow:hidden;transition:border-color .16s ease,box-shadow .16s ease,background .16s ease}
.sb-shot-nav-group.active{border-color:color-mix(in oklab,var(--accent) 56%,var(--line));background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 9%,var(--paper)),color-mix(in oklab,var(--paper) 88%,var(--paper-2)));box-shadow:0 14px 30px -24px color-mix(in oklab,var(--accent) 82%,black)}
.sb-shot-nav-group.compact:hover{border-color:color-mix(in oklab,var(--accent) 36%,var(--line));background:color-mix(in oklab,var(--accent) 4%,var(--paper))}
.sb-shot-nav-group-btn{appearance:none;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:8px 10px;width:100%;min-height:112px;padding:11px;border:0;background:transparent;color:var(--ink-soft);font-size:11px;text-align:left;cursor:pointer}
.sb-shot-nav-card-head{display:flex;align-items:center;gap:7px;min-width:0}
.sb-shot-nav-group-btn .gid{flex:0 0 auto;font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ink)}
.sb-shot-nav-group-btn .scene-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-mute)}
.sb-shot-nav-group-metrics{display:flex;align-items:center;justify-content:flex-end;gap:4px;min-width:max-content}
.sb-shot-nav-group-metrics em{display:inline-flex;align-items:center;justify-content:center;min-height:20px;padding:2px 6px;border:1px solid color-mix(in oklab,var(--accent) 20%,var(--line-soft));border-radius:999px;background:color-mix(in oklab,var(--paper) 78%,var(--paper-2));font-family:var(--font-mono);font-size:10px;font-style:normal;color:var(--accent);white-space:nowrap}
.sb-shot-nav-summary{grid-column:1/-1;display:-webkit-box;min-width:0;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3;color:var(--ink-soft);font-size:11px;line-height:1.5}
.sb-shot-nav-status{grid-column:1/-1;display:flex;flex-direction:column;gap:5px;min-width:0;padding-top:4px;border-top:1px solid var(--line-soft);color:var(--ink-mute)}
.sb-shot-nav-status-line{display:flex;align-items:center;gap:5px;min-width:0;font-family:var(--font-mono);font-size:10px;line-height:1}
.sb-shot-nav-status-line i{width:6px;height:6px;border-radius:999px;background:currentColor;opacity:.58}
.sb-shot-nav-status-line strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650;color:currentColor}
.sb-shot-nav-status-line em{margin-left:auto;color:currentColor;font-size:10px}
.sb-shot-nav-status.pending,.sb-shot-nav-status.queued{color:color-mix(in oklab,var(--accent) 78%,var(--ink-mute))}
.sb-shot-nav-status.running{color:var(--accent)}
.sb-shot-nav-status.completed{color:#16a05d}
.sb-shot-nav-status.failed{color:#d94848}
.sb-shot-nav-status.canceled,.sb-shot-nav-status.cancelled{color:#64748b}
.sb-shot-nav-status.running .sb-shot-nav-status-line i{animation:sb-prompt-pulse 1.05s ease-in-out infinite}
.sb-shot-nav-progress{position:relative;display:block;height:3px;overflow:hidden;border-radius:999px;background:color-mix(in oklab,currentColor 14%,transparent)}
.sb-shot-nav-progress b{position:absolute;inset:0 auto 0 0;border-radius:inherit;background:currentColor;transition:width .18s ease}
@keyframes sb-prompt-pulse{0%,100%{transform:scale(.8);opacity:.45}50%{transform:scale(1.15);opacity:1}}
.sb-shot-nav-shots{display:flex;flex-direction:column;gap:4px;padding:5px}
.sb-shot-nav-shot{appearance:none;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;min-height:42px;padding:6px 7px;border:0;border-radius:6px;background:transparent;color:var(--ink-mute);font-family:var(--font-body);font-size:11px;text-align:left;cursor:pointer}
.sb-shot-nav-shot:hover{background:color-mix(in oklab,var(--accent) 7%,transparent);color:var(--ink-soft)}
.sb-shot-nav-shot.active{background:color-mix(in oklab,var(--accent) 13%,var(--paper));color:var(--accent)}
.sb-shot-nav-shot-copy{display:flex;min-width:0;flex-direction:column;gap:3px}
.sb-shot-nav-shot strong{font-family:var(--font-mono);font-size:10px;color:currentColor}
.sb-shot-nav-shot small{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-soft);font-size:11px;line-height:1.25}
.sb-shot-nav-shot em{font-style:normal;color:color-mix(in oklab,currentColor 70%,var(--ink-mute))}
.sb-shot-main-panel{display:flex;min-width:0;flex-direction:column;overflow:hidden}
.sb-shot-main-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;min-height:66px;padding:12px 14px;border-bottom:1px solid var(--line-soft)}
.sb-shot-main-head>div:first-child{display:flex;min-width:0;flex-direction:column;gap:4px}
.sb-shot-main-head span{font-family:var(--font-mono);font-size:10px;color:var(--accent);font-weight:700}
.sb-shot-main-head strong{font-size:16px;color:var(--ink);font-weight:650}
.sb-shot-main-head em{display:block;max-width:680px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-mute);font-size:12px;font-style:normal}
.sb-shot-main-stats{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.sb-shot-main-stats span{display:inline-flex;align-items:center;min-height:24px;padding:2px 8px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper);font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);white-space:nowrap}
.sb-shot-list-head{display:grid;grid-template-columns:64px 112px minmax(120px,.7fr) minmax(220px,1.45fr) minmax(145px,.82fr) minmax(168px,.8fr);gap:8px;padding:9px 12px;border-bottom:1px solid var(--line-soft);background:color-mix(in oklab,var(--paper-2) 86%,var(--paper));font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.sb-shot-list{display:flex;flex:1;min-height:0;flex-direction:column;gap:7px;overflow-y:auto;overflow-x:hidden;padding:10px 10px 12px}
.sb-shot-list-row{appearance:none;box-sizing:border-box;display:grid;grid-template-columns:64px 112px minmax(120px,.7fr) minmax(220px,1.45fr) minmax(145px,.82fr) minmax(168px,.8fr);gap:8px;align-items:stretch;width:100%;min-height:72px;overflow:hidden;padding:9px;border:1px solid var(--line-soft);border-radius:8px;background:color-mix(in oklab,var(--paper) 90%,var(--paper-2));color:var(--ink);font-family:var(--font-body);text-align:left;cursor:pointer;transition:border-color .16s ease,background .16s ease,box-shadow .16s ease}
.sb-shot-list-row:hover{border-color:color-mix(in oklab,var(--accent) 34%,var(--line));background:color-mix(in oklab,var(--accent) 4%,var(--paper))}
.sb-shot-list-row.selected{border-color:color-mix(in oklab,var(--accent) 56%,var(--line));background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 10%,var(--paper)),color-mix(in oklab,var(--accent) 4%,var(--paper-2)));box-shadow:0 12px 24px -24px color-mix(in oklab,var(--accent) 86%,black)}
.sb-shot-list-row>span{min-width:0}
.sb-shot-list-row .shot-no{display:flex;align-items:center;justify-content:center;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper);font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--ink)}
.shot-meta{display:flex;flex-direction:column;justify-content:center;gap:4px}
.shot-meta strong{font-size:12px;color:var(--ink)}
.shot-meta em,.shot-meta small{font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.shot-camera,.shot-action,.shot-sound{display:block;overflow:hidden;color:var(--ink-soft);font-size:12px;line-height:1.55}
.shot-camera,.shot-action{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3}
.shot-sound{display:flex;min-width:0;flex-direction:column;gap:4px}
.shot-sound strong{font-size:11px;color:var(--accent);font-weight:650}
.shot-sound em{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;color:var(--ink-mute);font-style:normal}
.shot-refs{display:flex;align-content:flex-start;align-items:flex-start;flex-wrap:wrap;gap:6px;min-width:0;overflow:hidden}
.sb-shot-asset-chip{box-sizing:border-box;display:inline-flex;align-items:center;gap:5px;flex:0 1 auto;max-width:100%;min-width:0;min-height:28px;padding:3px 7px 3px 4px;border:1px solid color-mix(in oklab,var(--accent) 14%,var(--line-soft));border-radius:999px;background:color-mix(in oklab,var(--accent) 8%,var(--paper));color:var(--accent);font-family:var(--font-mono);font-size:10px;line-height:1.2;overflow:hidden}
.sb-shot-asset-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-shot-asset-thumb{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line-soft));border-radius:7px;background:color-mix(in oklab,var(--paper-2) 86%,var(--paper));color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;overflow:hidden}
.sb-shot-asset-thumb.has-image{background:var(--paper);border-color:color-mix(in oklab,var(--accent) 24%,var(--line-soft))}
.sb-shot-asset-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.sb-shot-asset-more{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;min-height:24px;padding:2px 7px;border-radius:999px;background:color-mix(in oklab,var(--paper-2) 84%,var(--paper));color:var(--ink-mute);font-family:var(--font-mono);font-size:10px}
.sb-shot-main-panel .sb-shotgroup-prompts{margin:0;border-top:1px solid var(--line-soft);background:color-mix(in oklab,var(--paper) 92%,var(--paper-2))}
.sb-shot-inspector{display:flex;min-width:0;flex-direction:column;overflow:auto}
.sb-shot-inspector-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line-soft)}
.sb-shot-inspector-head span{font-size:12px;color:var(--ink-mute)}
.sb-shot-inspector-head strong{font-family:var(--font-mono);font-size:14px;color:var(--ink);font-weight:700}
.sb-shot-inspector-head .status{grid-column:1/-1;justify-self:start;display:inline-flex;min-height:22px;padding:2px 8px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper);font-family:var(--font-mono);font-size:10px;font-style:normal;color:var(--ink-mute)}
.sb-shot-inspector-head .status.completed{border-color:color-mix(in oklab,#10b981 36%,var(--line-soft));background:color-mix(in oklab,#10b981 10%,var(--paper));color:#059669}
.sb-shot-inspector-head .status.failed{border-color:color-mix(in oklab,#ef4444 36%,var(--line-soft));background:color-mix(in oklab,#ef4444 10%,var(--paper));color:#dc2626}
.sb-inspector-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:12px 14px}
.sb-inspector-field{display:flex;min-width:0;flex-direction:column;gap:5px}
.sb-inspector-field.wide{grid-column:1/-1}
.sb-inspector-field span{font-size:11px;color:var(--ink-mute)}
.sb-inspector-field input,.sb-inspector-field textarea,.sb-inspector-field select{box-sizing:border-box;width:100%;min-width:0;border:1px solid var(--line-soft);border-radius:7px;background:color-mix(in oklab,var(--paper-2) 82%,var(--paper));color:var(--ink);font-family:var(--font-body);font-size:12px;line-height:1.55;outline:none}
.sb-inspector-field input,.sb-inspector-field select{height:34px;padding:0 9px}
.sb-inspector-field textarea{min-height:58px;padding:8px 9px;resize:vertical;white-space:pre-wrap}
.sb-inspector-field input:focus,.sb-inspector-field textarea:focus,.sb-inspector-field select:focus{border-color:color-mix(in oklab,var(--accent) 58%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent);background:var(--paper)}
.sb-inspector-refs{display:flex;flex-direction:column;gap:8px;margin:0 14px 12px;padding-top:12px;border-top:1px solid var(--line-soft)}
.sb-inspector-refs>span{font-size:11px;color:var(--ink-mute)}
.sb-inspector-refs>div{display:flex;flex-wrap:wrap;gap:6px}
.sb-inspector-refs .asset-ref,.sb-shot-list-row .asset-ref{display:inline-flex;align-items:center;gap:7px;max-width:100%;padding:4px 8px 4px 4px;border-radius:10px;background:color-mix(in oklab,var(--accent) 9%,var(--paper));color:var(--accent);font-family:var(--font-mono);font-size:10px;line-height:1.4;overflow:hidden;text-overflow:ellipsis}
.sb-inspector-refs .asset-ref .sb-shot-asset-thumb{width:30px;height:30px;border-radius:8px}
.sb-shot-asset-copy{display:grid;min-width:0;gap:1px}
.sb-shot-asset-copy small{font-size:9px;color:color-mix(in oklab,currentColor 68%,var(--ink-mute))}
.sb-inspector-refs .asset-ref.empty{background:transparent;color:var(--ink-mute)}
.sb-inspector-delete{appearance:none;margin:0 14px 14px;height:34px;border:1px solid color-mix(in oklab,#ef4444 32%,var(--line-soft));border-radius:7px;background:color-mix(in oklab,#ef4444 7%,var(--paper));color:#dc2626;font-size:12px;cursor:pointer}
.sb-inspector-delete:hover{background:color-mix(in oklab,#ef4444 11%,var(--paper));border-color:color-mix(in oklab,#ef4444 52%,var(--line))}
.sb-shot-inspector-empty{display:flex;flex:1;align-items:center;justify-content:center;color:var(--ink-mute);font-size:12px}
.sb-shotgroup{margin-bottom:16px;border:1px solid var(--line);border-radius:10px;background:var(--paper);overflow:hidden}
.sb-shotgroup-head{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--paper-2);border-bottom:1px solid var(--line-soft);font-size:12px}
.sb-shotgroup-head .gid{font-family:var(--font-mono);font-weight:600;color:var(--ink)}
.sb-shotgroup-head .chip{display:inline-flex;padding:2px 8px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;letter-spacing:.1em}
.sb-shotgroup-head .total{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--accent)}
.sb-shotgroup-head .toggle{appearance:none;border:0;background:transparent;color:var(--ink-mute);cursor:pointer;font-size:14px;padding:2px 6px}
.sb-shotgroup-note{padding:8px 14px;background:color-mix(in oklab,var(--accent) 8%,var(--paper));color:var(--ink-soft);font-size:12px;border-bottom:1px solid var(--line-soft)}
.sb-shotgroup-prompts{border-top:1px solid var(--line);background:color-mix(in oklab,var(--paper) 94%,var(--paper-2))}
.sb-shotgroup-prompts-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;border-bottom:1px solid transparent}
.sb-shotgroup-prompts-toggle{appearance:none;display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;min-height:44px;padding:10px 14px;border:0;background:transparent;color:var(--ink);font-family:var(--font-body);font-size:12px;text-align:left;cursor:pointer}
.sb-shotgroup-prompts-toggle:hover{background:color-mix(in oklab,var(--accent) 5%,transparent)}
.sb-shotgroup-single-prompt-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;height:28px;margin-right:12px;padding:0 10px;border:1px solid color-mix(in oklab,var(--accent) 34%,var(--line));border-radius:7px;background:color-mix(in oklab,var(--accent) 7%,var(--paper));color:var(--accent);font-size:11px;white-space:nowrap;cursor:pointer}
.sb-shotgroup-single-prompt-btn:hover:not(:disabled){background:color-mix(in oklab,var(--accent) 12%,var(--paper))}
.sb-shotgroup-single-prompt-btn:disabled{opacity:.45;cursor:not-allowed}
.sb-shotgroup-prompts-title{font-weight:650;color:var(--ink)}
.sb-shotgroup-prompts-status{display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:2px 8px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;white-space:nowrap}
.sb-shotgroup-prompts-status.completed{border-color:color-mix(in oklab,#10b981 34%,var(--line-soft));background:color-mix(in oklab,#10b981 9%,var(--paper));color:#059669}
.sb-shotgroup-prompts-status.running,.sb-shotgroup-prompts-status.queued,.sb-shotgroup-prompts-status.pending{border-color:color-mix(in oklab,var(--accent) 34%,var(--line-soft));background:color-mix(in oklab,var(--accent) 9%,var(--paper));color:var(--accent)}
.sb-shotgroup-prompts-status.failed{border-color:color-mix(in oklab,#ef4444 34%,var(--line-soft));background:color-mix(in oklab,#ef4444 9%,var(--paper));color:#dc2626}
.sb-shotgroup-prompts-meta{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-mute);font-family:var(--font-mono);font-size:11px}
.sb-shotgroup-prompts-caret{font-size:13px;color:var(--ink-mute)}
.sb-shotgroup-prompts-body{display:grid;grid-template-columns:repeat(2,minmax(280px,1fr));gap:12px;padding:0 14px 14px}
.sb-shotgroup-prompt-field{display:flex;min-width:0;flex-direction:column;gap:7px}
.sb-shotgroup-prompt-field>span{color:var(--ink-mute);font-size:11px}
.sb-shotgroup-prompt-textarea{min-height:220px;resize:vertical}

.sb-shot-table-wrap{overflow-x:auto;background:var(--paper)}
.sb-shot-table{width:100%;min-width:1520px;border-collapse:collapse;table-layout:fixed;font-size:12px}
.sb-shot-table th{position:sticky;top:0;z-index:1;padding:9px 10px;border-bottom:1px solid var(--line);background:var(--paper-2);color:var(--ink-mute);font-weight:600;text-align:left;white-space:nowrap}
.sb-shot-table th:nth-child(1){width:118px}
.sb-shot-table th:nth-child(2){width:112px}
.sb-shot-table th:nth-child(3){width:96px}
.sb-shot-table th:nth-child(4){width:112px}
.sb-shot-table th:nth-child(5){width:190px}
.sb-shot-table th:nth-child(6){width:380px}
.sb-shot-table th:nth-child(7){width:320px}
.sb-shot-table th:nth-child(8){width:292px}
.sb-shot-row{border-bottom:1px solid var(--line-soft)}
.sb-shot-row:hover{background:color-mix(in oklab,var(--accent) 3%,transparent)}
.sb-shot-row td{height:138px;padding:10px;vertical-align:top;color:var(--ink);line-height:1.5}
.sb-shot-row .num{display:flex;flex-direction:column;gap:7px;font-family:var(--font-mono);color:var(--ink-mute);white-space:nowrap}
.sb-shot-row .num button{appearance:none;width:100%;min-height:28px;border:1px solid var(--line-soft);border-radius:5px;background:var(--paper-2);color:var(--ink-mute);cursor:pointer;padding:0 8px;font-size:11px}
.sb-shot-row .num button:hover{color:#fca5a5;border-color:color-mix(in oklab,#ef4444 42%,var(--line))}
.sb-shot-row .dur .shot-edit-box,.sb-shot-row .num .shot-edit-box{font-family:var(--font-mono);text-align:center}
.sb-shot-row .desc,.sb-shot-row .audio-cell,.sb-shot-row .camera-cell,.sb-shot-row .note-cell{white-space:normal;word-break:break-word}
.shot-edit-box{box-sizing:border-box;display:block;width:100%;min-height:48px;padding:8px 9px;border:1px solid var(--line-soft);border-radius:6px;background:color-mix(in oklab,var(--paper-2) 82%,var(--paper));color:var(--ink);font-family:var(--font-body);font-size:12px;line-height:1.55;outline:none;overflow:auto}
.shot-edit-box:hover{border-color:color-mix(in oklab,var(--accent) 34%,var(--line))}
.shot-edit-box:focus{border-color:color-mix(in oklab,var(--accent) 58%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent);background:var(--paper)}
textarea.shot-edit-box{min-height:112px;resize:none;white-space:pre-wrap}
.shot-edit-box.tall{min-height:112px}
.refs-box{display:flex;align-content:flex-start;align-items:flex-start;flex-wrap:wrap;gap:5px;min-height:112px}
.sb-shot-row .asset-ref{display:inline-flex;align-items:center;max-width:100%;padding:2px 6px;border-radius:5px;background:color-mix(in oklab,var(--accent) 10%,transparent);color:var(--accent);font-family:var(--font-mono);font-size:10px;line-height:1.4;overflow:hidden;text-overflow:ellipsis}
.sb-shot-row .asset-ref.empty{background:transparent;color:var(--ink-mute)}

.sb-shot-chip-far{background:color-mix(in oklab,#3b82f6 18%,var(--paper-2));color:#3b82f6}
.sb-shot-chip-mid{background:color-mix(in oklab,#10b981 18%,var(--paper-2));color:#10b981}
.sb-shot-chip-close{background:color-mix(in oklab,#f97316 18%,var(--paper-2));color:#f97316}
.sb-shot-chip-extreme{background:color-mix(in oklab,#ef4444 18%,var(--paper-2));color:#ef4444}
.sb-shot-chip-special{background:color-mix(in oklab,#a855f7 18%,var(--paper-2));color:#a855f7}
.sb-shot-chip-default{background:var(--paper-2);color:var(--ink-mute)}
.sb-empty-step-placeholder{display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;min-height:0;padding:40px;text-align:center;color:var(--ink-mute);font-size:13px;background:var(--paper);border:1px dashed var(--line);border-radius:10px}
.sb-empty-step-placeholder strong{color:var(--ink-soft);font-size:15px;display:block;margin-bottom:6px}

/* Production package tabs */
.sb-package-panel{display:flex;flex:1;flex-direction:column;gap:16px;min-height:0;width:100%;max-width:none;margin:0}
.sb-package-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid var(--line-soft)}
.sb-package-head h2{margin:0 0 6px;font-family:'Source Serif 4','Noto Serif SC',serif;font-size:24px;font-weight:600;color:var(--ink);letter-spacing:0}
.sb-package-head p{margin:0;color:var(--ink-mute);font-family:var(--font-mono);font-size:12px}
.sb-package-head.compact{padding-top:8px}
.sb-package-head.compact h2{font-size:18px}
.sb-status-pill{display:inline-flex;align-items:center;min-height:28px;padding:4px 10px;border:1px solid color-mix(in oklab,var(--accent) 36%,var(--line));border-radius:999px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));color:var(--accent);font-family:var(--font-mono);font-size:11px;white-space:nowrap}
.sb-empty-block{padding:22px;border:1px dashed var(--line);border-radius:8px;background:var(--paper);color:var(--ink-mute);font-size:13px;text-align:center}
.sb-package-panel>.sb-empty-block{display:flex;flex:1;align-items:center;justify-content:center}
.sb-package-list{display:flex;flex-direction:column;gap:8px}
.sb-package-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 13px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);font-size:12px}
.sb-package-row strong{color:var(--ink);font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-package-row span{color:var(--ink-mute);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}
.sb-package-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.sb-package-card{display:flex;flex-direction:column;gap:6px;padding:14px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper)}
.sb-package-card span{font-size:11px;color:var(--ink-mute)}
.sb-package-card strong{font-family:var(--font-mono);font-size:18px;color:var(--ink);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-package-card select,.sb-package-card input{min-width:0;width:100%;padding:7px 9px;border:1px solid var(--line-soft);border-radius:6px;background:var(--paper-2);color:var(--ink);font-size:12px;outline:none}
.sb-package-card input[type="range"]{padding:0;border:0;background:transparent}
.sb-package-card select:focus,.sb-package-card input:focus{border-color:color-mix(in oklab,var(--accent) 52%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent)}
.sb-video-console{display:grid;grid-template-columns:minmax(260px,1.4fr) minmax(180px,.75fr) minmax(180px,.75fr) auto;align-items:end;gap:12px;padding:14px;border:1px solid var(--line-soft);border-radius:10px;background:color-mix(in oklab,var(--paper) 90%,var(--bg));box-shadow:0 12px 34px -28px rgba(0,0,0,.62)}
.sb-video-source,.sb-video-slider{display:flex;flex-direction:column;gap:8px;min-width:0}
.sb-video-source>span{font-size:11px;color:var(--ink-mute)}
.sb-video-source select{min-width:0;width:100%;height:38px;padding:7px 10px;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper-2);color:var(--ink);font-size:12px;outline:none}
.sb-video-source select:focus{border-color:color-mix(in oklab,var(--accent) 52%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent)}
.sb-video-slider>span{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;color:var(--ink-mute)}
.sb-video-slider strong{font-size:11px;font-weight:500;color:var(--ink-mute)}
.sb-video-slider em{min-width:34px;text-align:right;font-family:var(--font-mono);font-size:12px;font-style:normal;color:var(--ink)}
.sb-video-slider input[type="range"]{width:100%;height:38px;margin:0;accent-color:var(--accent);cursor:pointer}
.sb-video-slider input[type="range"]:disabled{cursor:not-allowed;opacity:.52}
.sb-video-actions{display:flex;align-items:center;gap:8px;justify-content:flex-end;min-width:max-content}
.sb-video-actions button{appearance:none;height:38px;padding:0 13px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);font-size:12px;cursor:pointer;white-space:nowrap}
.sb-video-actions button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 44%,var(--line));color:var(--accent)}
.sb-video-actions button:disabled{opacity:.45;cursor:not-allowed}
.sb-video-actions button.primary{background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent) 70%,white));border-color:transparent;color:#031018;font-weight:600}
.sb-video-actions button.primary:hover:not(:disabled){color:#031018;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 88%,white),color-mix(in oklab,var(--accent) 62%,white))}
.sb-video-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:10px;border:1px solid var(--line-soft);border-radius:10px;background:var(--paper)}
.sb-video-summary div{display:flex;flex-direction:column;gap:4px;min-width:0;padding:8px 10px;border-right:1px solid var(--line-soft)}
.sb-video-summary div:last-child{border-right:0}
.sb-video-summary span{font-size:11px;color:var(--ink-mute)}
.sb-video-summary strong{font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-video-result-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.sb-video-result-head h3{margin:0;font-size:14px;font-weight:600;color:var(--ink)}
.sb-video-prompt{display:flex;flex-direction:column;gap:8px;padding:14px;border:1px solid var(--line-soft);border-radius:10px;background:var(--paper);color:var(--ink-soft)}
.sb-video-prompt span{font-size:11px;color:var(--ink-mute)}
.sb-video-prompt p{margin:0;white-space:pre-wrap;font-size:12px;line-height:1.6}
.sb-frame-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px}
.sb-frame-tile{position:relative;aspect-ratio:16/9;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2) center/cover no-repeat;overflow:hidden}
.sb-frame-tile.selectable{cursor:pointer}
.sb-frame-tile.selected{border-color:color-mix(in oklab,var(--accent) 70%,var(--line));box-shadow:0 0 0 2px color-mix(in oklab,var(--accent) 24%,transparent)}
.sb-frame-tile input{position:absolute;right:7px;top:7px;z-index:2;width:16px;height:16px;accent-color:var(--accent)}
.sb-frame-tile span,.sb-frame-tile em{position:absolute;left:7px;display:inline-flex;align-items:center;min-height:18px;padding:1px 6px;border-radius:999px;background:rgba(0,0,0,.62);color:#fff;font-family:var(--font-mono);font-size:10px;font-style:normal}
.sb-frame-tile span{top:7px}
.sb-frame-tile em{bottom:7px}
.sb-warning-list{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.sb-warning-list li{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1px solid color-mix(in oklab,#facc15 34%,var(--line));border-radius:8px;background:color-mix(in oklab,#facc15 8%,var(--paper));color:var(--ink-soft);font-size:12px;line-height:1.5}
.sb-warning-list strong{font-family:var(--font-mono);font-size:10px;color:#facc15;text-transform:uppercase}
.sb-package-actions{display:flex;gap:8px;flex-wrap:wrap}
.sb-package-actions button{appearance:none;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);font-size:12px;cursor:pointer}
.sb-package-actions button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 44%,var(--line));color:var(--accent)}
.sb-package-actions button:disabled{opacity:.45;cursor:not-allowed}
.sb-package-actions.inline{flex-wrap:nowrap;justify-content:flex-end}
.sb-package-actions.inline button{padding:6px 10px}
.sb-package-actions button.primary{background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent) 70%,white));border-color:transparent;color:#031018;font-weight:600}
.sb-package-actions button.primary{display:inline-flex;align-items:center;gap:8px}
.sb-package-actions button.primary:hover:not(:disabled){color:#031018;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 88%,white),color-mix(in oklab,var(--accent) 62%,white))}
.sb-output-panel{gap:12px;overflow:hidden}
.sb-output-head{flex:0 0 auto;margin-bottom:0}
.sb-output-workbench{display:grid;grid-template-columns:280px minmax(520px,1fr) 320px;gap:12px;flex:1;min-height:0}
.sb-output-queue,.sb-output-main,.sb-output-side{min-width:0;min-height:0}
.sb-output-queue,.sb-output-main,.sb-output-action-card{border:1px solid color-mix(in oklab,var(--accent) 14%,var(--line-soft));border-radius:10px;background:color-mix(in oklab,var(--paper) 92%,var(--bg));box-shadow:0 18px 42px -38px rgba(15,23,42,.66)}
.sb-output-queue{display:flex;flex-direction:column;overflow:hidden}
.sb-output-queue-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 10px;align-items:center;min-height:50px;padding:11px 13px;border-bottom:1px solid var(--line-soft)}
.sb-output-queue-head strong,.sb-output-side-title strong{font-size:13px;color:var(--ink);font-weight:650}
.sb-output-queue-head em{font-style:normal;font-size:10px;color:var(--ink-mute)}
.sb-output-queue-head span{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.sb-output-queue-list{display:flex;flex:1;min-height:0;flex-direction:column;gap:9px;overflow:auto;padding:10px}
.sb-output-queue-card{--progress:0deg;appearance:none;display:grid;grid-template-columns:42px minmax(0,1fr) auto;grid-template-areas:"ring copy state" "thumbs thumbs thumbs";gap:8px;align-items:center;width:100%;min-height:88px;padding:10px;border:1px solid var(--line-soft);border-radius:8px;background:color-mix(in oklab,var(--paper) 88%,var(--paper-2));color:var(--ink);text-align:left;cursor:pointer}
.sb-output-queue-card:hover{border-color:color-mix(in oklab,var(--accent) 36%,var(--line));background:color-mix(in oklab,var(--accent) 5%,var(--paper))}
.sb-output-queue-card.active{border-color:color-mix(in oklab,var(--accent) 60%,var(--line));background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 10%,var(--paper)),color-mix(in oklab,var(--accent) 4%,var(--paper-2)))}
.sb-output-ring{grid-area:ring;position:relative;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:conic-gradient(var(--accent) 0deg var(--progress),color-mix(in oklab,var(--ink-mute) 14%,transparent) var(--progress) 360deg)}
.sb-output-ring::after{content:"";position:absolute;inset:4px;border-radius:inherit;background:var(--paper)}
.sb-output-ring em{position:relative;z-index:1;font-family:var(--font-mono);font-size:9px;font-style:normal;color:var(--accent);font-weight:700}
.sb-output-queue-copy{grid-area:copy;display:flex;min-width:0;flex-direction:column;gap:3px}
.sb-output-queue-copy strong{font-family:var(--font-mono);font-size:13px;color:var(--ink);font-weight:700}
.sb-output-queue-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-mute);font-size:11px}
.sb-output-queue-state{grid-area:state;display:inline-flex;align-items:center;min-height:24px;padding:2px 8px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper);font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);white-space:nowrap}
.sb-output-queue-state.ready{color:#059669;border-color:color-mix(in oklab,#10b981 30%,var(--line-soft));background:color-mix(in oklab,#10b981 8%,var(--paper))}
.sb-output-queue-state.failed{color:#dc2626;border-color:color-mix(in oklab,#ef4444 30%,var(--line-soft));background:color-mix(in oklab,#ef4444 8%,var(--paper))}
.sb-output-queue-thumbs{grid-area:thumbs;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.sb-output-queue-thumbs>span{display:flex;align-items:center;justify-content:center;height:32px;overflow:hidden;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper-2);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px}
.sb-output-queue-thumbs img,.sb-output-queue-thumbs video{width:100%;height:100%;object-fit:cover;display:block}
.sb-output-main{display:flex;flex-direction:column;overflow:hidden}
.sb-output-main-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;min-height:96px;padding:16px 18px;border-bottom:1px solid var(--line-soft)}
.sb-output-main-head>div:first-child{display:flex;min-width:0;flex-direction:column;gap:6px}
.sb-output-main-head span{font-family:var(--font-mono);font-size:10px;color:var(--accent);font-weight:700}
.sb-output-main-head h3{margin:0;font-size:24px;line-height:1.1;color:var(--ink);font-weight:760;letter-spacing:0}
.sb-output-main-head p{margin:0;max-width:720px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-mute);font-size:12px}
.sb-output-main-badges{display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap}
.sb-output-main-badges span{display:inline-flex;align-items:center;min-height:24px;padding:2px 8px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;white-space:nowrap}
.sb-output-main-badges .failed{color:#dc2626;border-color:color-mix(in oklab,#ef4444 30%,var(--line-soft));background:color-mix(in oklab,#ef4444 8%,var(--paper))}
.sb-output-status-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px 18px;border-bottom:1px solid var(--line-soft)}
.sb-output-status-grid div{display:flex;flex-direction:column;gap:5px;min-width:0;padding:12px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper)}
.sb-output-status-grid span,.sb-output-overview span{font-size:11px;color:var(--ink-mute)}
.sb-output-status-grid strong,.sb-output-overview strong{font-family:var(--font-mono);font-size:20px;color:var(--ink);font-weight:700}
.sb-output-preview-board{display:grid;flex:1;min-height:0;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px 18px 18px}
.sb-output-preview-slot.large{display:flex;min-height:0;flex-direction:column;gap:9px;padding:12px;border:1px solid var(--line-soft);border-radius:10px;background:var(--paper)}
.sb-output-preview-slot.large>strong{font-size:13px;color:var(--ink);font-weight:650}
.sb-output-preview-slot.large .sb-output-preview-media{width:100%;height:auto;flex:1;min-height:220px;border-radius:8px}
.sb-output-preview-slot.large .sb-output-preview-media img,.sb-output-preview-slot.large .sb-output-preview-media video{width:100%;height:100%;object-fit:contain;display:block}
.sb-output-preview-slot.large em{font-size:11px}
.sb-output-side{display:flex;flex-direction:column;gap:12px;overflow:auto}
.sb-output-action-card{display:flex;flex-direction:column;gap:12px;padding:13px}
.sb-output-side-title{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}
.sb-output-side-title .sb-task-orb-status.inline{margin-left:0;max-width:170px;flex:0 1 170px}
.sb-output-settings-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-width:0}
.sb-output-settings-button{appearance:none;display:flex;align-items:center;gap:8px;min-width:0;min-height:56px;padding:8px 9px;border:1px solid var(--line-soft);border-radius:8px;background:color-mix(in oklab,var(--paper) 88%,var(--paper-2));color:var(--ink-soft);cursor:pointer;text-align:left}
.sb-output-settings-button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 46%,var(--line));background:color-mix(in oklab,var(--accent) 7%,var(--paper))}
.sb-output-settings-button:disabled{opacity:.5;cursor:not-allowed}
.sb-output-settings-icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 28px;border-radius:7px;background:color-mix(in oklab,var(--accent) 12%,var(--paper));color:var(--accent)}
.sb-output-settings-copy{display:flex;min-width:0;flex-direction:column;gap:3px}
.sb-output-settings-copy strong{font-size:12px;color:var(--ink);font-weight:650;white-space:nowrap}
.sb-output-settings-copy em{font-style:normal;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;color:var(--ink-mute)}
.sb-output-settings-backdrop{position:fixed;inset:0;z-index:8700;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(5,8,12,.38);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.sb-output-settings-dialog{display:flex;flex-direction:column;gap:12px;width:min(420px,calc(100vw - 32px));max-height:calc(100vh - 60px);overflow:auto;padding:13px;border:1px solid color-mix(in oklab,var(--accent) 26%,var(--line));border-radius:8px;background:var(--paper);box-shadow:0 24px 60px -28px rgba(0,0,0,.72);color:var(--ink)}
.sb-output-settings-dialog header{display:flex;align-items:center;gap:8px;min-height:30px}
.sb-output-settings-dialog header>span{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:color-mix(in oklab,var(--accent) 12%,var(--paper));color:var(--accent)}
.sb-output-settings-dialog header strong{flex:1;min-width:0;font-size:14px;color:var(--ink);font-weight:700}
.sb-output-settings-dialog header button{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper-2);color:var(--ink-mute);cursor:pointer}
.sb-output-settings-dialog header button:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 38%,var(--line))}
.sb-output-settings-dialog footer{display:flex;justify-content:flex-end;padding-top:2px}
.sb-output-settings-dialog footer button{appearance:none;min-width:76px;height:32px;border:1px solid transparent;border-radius:7px;background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent) 68%,white));color:#031018;font-size:12px;font-weight:650;cursor:pointer}
.sb-output-media-section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px;border:1px solid var(--line-soft);border-radius:8px;background:color-mix(in oklab,var(--paper) 84%,var(--paper-2))}
.sb-output-media-section.compact{padding:0;border:0;background:transparent}
.sb-output-field{display:flex;min-width:0;flex-direction:column;gap:4px}
.sb-output-field span{font-size:10px;color:var(--ink-mute);white-space:nowrap}
.sb-output-field select{width:100%;min-width:0;height:30px;padding:0 8px;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper);color:var(--ink-soft);font-size:11px;outline:none}
.sb-output-field select:focus{border-color:color-mix(in oklab,var(--accent) 52%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent)}
.sb-output-field select:disabled{opacity:.55;cursor:not-allowed}
.sb-output-bulk-actions,.sb-output-group-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sb-output-bulk-actions button,.sb-output-group-actions button{appearance:none;min-height:36px;padding:0 10px;border:1px solid color-mix(in oklab,var(--accent) 38%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--accent) 8%,var(--paper));color:var(--accent);font-size:12px;cursor:pointer;white-space:nowrap}
.sb-output-bulk-actions button:first-child,.sb-output-group-actions button:first-child{grid-column:1/-1;background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent) 68%,white));border-color:transparent;color:#031018;font-weight:650}
.sb-output-bulk-actions button:hover:not(:disabled),.sb-output-group-actions button:hover:not(:disabled){background:color-mix(in oklab,var(--accent) 14%,var(--paper));border-color:color-mix(in oklab,var(--accent) 56%,var(--line))}
.sb-output-bulk-actions button:disabled,.sb-output-group-actions button:disabled{opacity:.45;cursor:not-allowed}
.sb-output-overview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.sb-output-overview div{display:flex;min-width:0;flex-direction:column;gap:4px;padding:10px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper)}
.sb-output-log{display:flex;flex-direction:column;gap:7px}
.sb-output-log span{display:flex;align-items:center;min-height:28px;padding:5px 8px;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper);color:var(--ink-mute);font-size:11px;line-height:1.35}
.sb-output-log .failed{color:#dc2626;border-color:color-mix(in oklab,#ef4444 30%,var(--line-soft));background:color-mix(in oklab,#ef4444 7%,var(--paper))}
.sb-deploy-groups{display:flex;flex:1;flex-direction:column;gap:9px;min-height:0;overflow:auto;padding:12px;border:1px solid var(--line-soft);border-radius:10px;background:color-mix(in oklab,var(--paper) 88%,var(--bg))}
.sb-deploy-groups-title{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute)}
.sb-deploy-group-list{display:flex;flex-direction:column;gap:8px}
.sb-deploy-group{display:grid;grid-template-columns:minmax(150px,.75fr) minmax(230px,1.1fr) minmax(230px,.95fr) minmax(210px,auto);align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper)}
.sb-deploy-group strong{display:block;color:var(--ink);font-family:var(--font-mono);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-deploy-group span{color:var(--ink-mute);font-size:11px}
.sb-deploy-group-stats{display:flex;gap:8px;flex-wrap:wrap}
.sb-deploy-group-stats span{display:inline-flex;align-items:center;min-height:22px;padding:2px 7px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper-2);font-family:var(--font-mono);font-size:10px}
.sb-deploy-group button{appearance:none;padding:7px 10px;border:1px solid color-mix(in oklab,var(--accent) 38%,var(--line));border-radius:7px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));color:var(--accent);cursor:pointer;font-size:12px;white-space:nowrap}
.sb-deploy-group button:hover:not(:disabled){background:color-mix(in oklab,var(--accent) 16%,var(--paper));border-color:color-mix(in oklab,var(--accent) 58%,var(--line))}
.sb-deploy-group button:disabled{opacity:.45;cursor:not-allowed}
.sb-output-previews{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-width:0}
.sb-output-preview-slot{display:grid;grid-template-columns:48px minmax(0,1fr);align-items:center;gap:8px;min-width:0}
.sb-output-preview-media{display:flex;align-items:center;justify-content:center;width:48px;height:34px;overflow:hidden;border:1px solid var(--line-soft);border-radius:6px;background:var(--paper-2);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px}
.sb-output-preview-media img,.sb-output-preview-media video{width:100%;height:100%;object-fit:cover;display:block}
.sb-output-preview-slot em{font-style:normal;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-mute);font-family:var(--font-mono);font-size:10px}
.sb-candidate-row{display:grid;grid-template-columns:minmax(220px,1fr) auto auto;align-items:center}
.sb-reference-source-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.sb-reference-source-column{display:flex;flex-direction:column;gap:8px;min-width:0}
.sb-reference-source-pick{appearance:none;display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:10px 12px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);color:var(--ink-soft);cursor:pointer;text-align:left}
.sb-reference-source-pick:hover{border-color:color-mix(in oklab,var(--accent) 44%,var(--line));background:color-mix(in oklab,var(--accent) 5%,var(--paper));color:var(--ink)}
.sb-reference-source-pick strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;color:var(--ink)}
.sb-reference-source-pick span{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);white-space:nowrap}
.sb-reference-row{align-items:stretch;display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(150px,.8fr) minmax(220px,1fr) auto}
.sb-reference-main{display:flex;flex-direction:column;gap:4px;min-width:0}
.sb-reference-main strong{white-space:nowrap}
.sb-reference-main span{text-align:left;white-space:nowrap}
.sb-reference-row select,.sb-reference-row input{min-width:0;padding:7px 9px;border:1px solid var(--line-soft);border-radius:6px;background:var(--paper-2);color:var(--ink);font-size:12px;outline:none}
.sb-reference-row select:focus,.sb-reference-row input:focus{border-color:color-mix(in oklab,var(--accent) 52%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 10%,transparent)}
.sb-reference-row button{appearance:none;padding:7px 10px;border:1px solid var(--line-soft);border-radius:6px;background:var(--paper-2);color:var(--ink-soft);font-size:12px;cursor:pointer}
.sb-reference-row button:hover{border-color:color-mix(in oklab,var(--accent) 44%,var(--line));color:var(--accent)}
.sb-reference-row button.danger{color:#fca5a5}
.sb-reference-row button.danger:hover{border-color:#f87171;color:#fecaca}
.sb-plan-table{width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);font-size:12px}
.sb-plan-table th,.sb-plan-table td{padding:10px 12px;border-bottom:1px solid var(--line-soft);text-align:left;vertical-align:top}
.sb-plan-table th{background:var(--paper-2);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase}
.sb-plan-table td{color:var(--ink-soft)}
.sb-plan-table tr:last-child td{border-bottom:0}
.sb-plan-table td:first-child{font-family:var(--font-mono);color:var(--ink)}

/* Toast */
.sb-toast{position:fixed;right:20px;bottom:20px;z-index:8600;width:320px;padding:14px 16px;border:1px solid color-mix(in oklab,var(--accent) 30%,var(--line));border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 92%,transparent),color-mix(in oklab,var(--paper-2) 80%,transparent));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 18px 48px -22px rgba(0,0,0,.7);animation:sb-toast-in .3s cubic-bezier(.2,.8,.2,1)}
@keyframes sb-toast-in{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
.sb-toast .stage{font-size:13px;color:var(--ink);display:flex;align-items:center;gap:10px}
.sb-toast .toast-ring{width:36px;height:36px;flex-basis:36px}
@keyframes sb-pulse{from{opacity:1}to{opacity:.4}}
.sb-toast .actions{display:flex;justify-content:flex-end;gap:6px;margin-top:8px;font-size:11px}
.sb-toast .actions button{appearance:none;border:1px solid var(--line);background:transparent;color:var(--ink-mute);padding:3px 10px;border-radius:5px;cursor:pointer}
.sb-toast.error{border-color:color-mix(in oklab,#ef4444 50%,var(--line))}
.sb-toast.error .toast-ring{background:conic-gradient(#ef4444 0deg var(--progress),color-mix(in oklab,#ef4444 16%,transparent) var(--progress) 360deg)}
.sb-toast.error .toast-ring em{color:#ef4444}

@media (prefers-reduced-motion:reduce){
  .sb-workbench-backdrop,.sb-toast{animation:none}
  .sb-btn-spinner,.sb-workflow-tabs .tab-pulse{animation:none}
  .sb-tool-btn:hover:not(:disabled){transform:none}
}

@media (max-width:1100px){
  .sb-workbench-shellbar{grid-template-columns:1fr;align-items:stretch}
  .sb-shell-actions{justify-content:flex-start}
  .sb-workflow-tabs{overflow:auto}
  .sb-workflow-tabs button{min-width:112px}
  .sb-task-orb-status.shell{max-width:none;width:100%}
  .sb-assets-grid{grid-template-columns:1fr}
  .design-space-workbench.embedded{grid-template-columns:1fr}
  .embedded-design-space-toolbar{align-items:stretch;flex-direction:column}
  .sb-script-split{grid-template-columns:1fr}
  .sb-package-grid{grid-template-columns:1fr}
  .sb-video-console{grid-template-columns:1fr 1fr}
  .sb-video-source{grid-column:1/-1}
  .sb-video-actions{grid-column:1/-1;justify-content:flex-start}
  .sb-video-summary{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sb-video-summary div:nth-child(2n){border-right:0}
  .sb-reference-source-grid{grid-template-columns:1fr}
  .sb-reference-row{grid-template-columns:1fr}
  .sb-candidate-row{grid-template-columns:1fr}
  .sb-deploy-group{grid-template-columns:1fr}
  .sb-output-workbench{grid-template-columns:240px minmax(0,1fr)}
  .sb-output-side{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:visible}
  .sb-output-preview-board{grid-template-columns:1fr}
}
@media (max-width:760px){
  .sb-package-head{flex-direction:column}
  .sb-package-row{align-items:flex-start;flex-direction:column}
  .sb-package-row span{text-align:left;white-space:normal}
  .sb-video-console{grid-template-columns:1fr}
  .sb-video-source,.sb-video-actions{grid-column:auto}
  .sb-video-actions{align-items:stretch;flex-direction:column}
  .sb-video-actions button{width:100%}
  .sb-video-summary{grid-template-columns:1fr}
  .sb-video-summary div{border-right:0;border-bottom:1px solid var(--line-soft)}
  .sb-video-summary div:last-child{border-bottom:0}
  .sb-video-result-head{align-items:flex-start;flex-direction:column}
  .sb-plan-table{display:block;overflow-x:auto}
  .sb-output-workbench{grid-template-columns:1fr}
  .sb-output-side{display:flex}
  .sb-output-main-head{flex-direction:column;min-height:auto}
  .sb-output-main-head p{white-space:normal}
  .sb-output-status-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sb-output-bulk-actions,.sb-output-group-actions,.sb-output-overview{grid-template-columns:1fr}
}
`;
