export const designSpaceStyles = `
.design-space-page{height:100%;min-height:0;background:var(--bg);color:var(--ink);display:flex;flex-direction:column;overflow:hidden}
.design-space-topbar{display:grid;grid-template-columns:auto minmax(160px,240px) minmax(360px,1fr) auto;align-items:center;gap:16px;padding:14px 18px;border-bottom:1px solid var(--line-soft);background:var(--paper)}
.design-space-topbar h1{margin:2px 0 0;font-size:24px;line-height:1.1;letter-spacing:0;color:var(--ink)}
.design-space-kicker{font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.design-space-project{color:var(--ink-soft);font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}
.design-template-status{grid-column:3/5;justify-self:end;border:1px solid color-mix(in oklab,#f59e0b 45%,var(--line));border-radius:999px;background:color-mix(in oklab,#f59e0b 10%,var(--paper-2));color:color-mix(in oklab,#f59e0b 72%,var(--ink));font-size:11px;font-weight:600;padding:4px 8px}
.design-space-top-controls{display:grid;grid-template-columns:minmax(124px,.62fr) minmax(124px,.62fr) minmax(142px,.68fr) minmax(180px,.9fr) auto;gap:8px;align-items:end;min-width:0}
.design-space-top-controls label,.design-space-control-field{display:flex;flex-direction:column;gap:5px;min-width:0;color:var(--ink-mute);font-size:11px}
.design-space-top-controls select,.design-space-top-controls input,.design-space-image-param-trigger,.design-space-prefix-trigger{min-width:0;border:1px solid var(--line);border-radius:7px;background:var(--paper-2);color:var(--ink);font:inherit;font-size:12px;outline:none;padding:8px 9px}
.design-space-top-controls select:focus,.design-space-top-controls input:focus,.design-space-image-param-trigger:focus-visible,.design-space-prefix-trigger:focus-visible{border-color:color-mix(in oklab,var(--accent) 55%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 12%,transparent)}
.design-space-style-control{gap:6px}
.design-space-style-label-row{display:flex;align-items:center;gap:7px;min-width:0}
.design-space-style-label-row>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:auto}
.design-space-top-controls .design-space-style-enable{display:inline-flex;flex-direction:row;align-items:center;gap:4px;min-width:auto;color:var(--ink-soft);font-size:11px;line-height:1;white-space:nowrap;cursor:pointer}
.design-space-style-enable input{width:13px;height:13px;margin:0;padding:0;accent-color:var(--accent);cursor:pointer}
.design-space-style-add{appearance:none;height:23px;border:1px solid var(--line);border-radius:6px;background:var(--paper-2);color:var(--ink-soft);font-size:11px;line-height:1;padding:0 7px;cursor:pointer;white-space:nowrap}
.design-space-style-add:hover{border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent)}
.design-space-style-control.is-disabled select,.design-space-style-control.is-disabled input[aria-label="风格补充"]{opacity:.55}
.design-space-image-param-control{position:relative}
.design-space-image-param-trigger{width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer}
.design-space-image-param-trigger strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600;color:var(--ink)}
.design-space-image-param-trigger span{flex:0 0 auto;color:var(--ink-mute);font-size:12px;line-height:1}
.design-space-image-param-trigger.active{border-color:color-mix(in oklab,var(--accent) 54%,var(--line));background:color-mix(in oklab,var(--accent) 8%,var(--paper-2))}
.design-space-prefix-trigger{width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;white-space:nowrap}
.design-space-prefix-trigger svg{flex:0 0 auto;color:currentColor}
.design-space-prefix-trigger strong{font-size:12px;font-weight:650;color:inherit}
.design-space-prefix-trigger em{font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--accent)}
.design-space-prefix-trigger.is-set{border-color:color-mix(in oklab,var(--accent) 50%,var(--line));background:color-mix(in oklab,var(--accent) 9%,var(--paper-2));color:var(--accent)}
.design-prefix-backdrop{position:fixed;inset:0;z-index:360;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(2,5,6,.56);backdrop-filter:blur(14px)}
.design-prefix-dialog{width:min(560px,calc(100vw - 48px));display:flex;flex-direction:column;gap:14px;border:1px solid color-mix(in oklab,var(--accent) 26%,var(--line));border-radius:14px;background:color-mix(in oklab,var(--paper) 96%,#060807);box-shadow:0 34px 88px -48px rgba(0,0,0,.92);padding:16px}
.design-prefix-head{display:flex;align-items:center;justify-content:space-between;gap:14px}
.design-prefix-head div{min-width:0;display:grid;gap:3px}
.design-prefix-head span{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute)}
.design-prefix-head h2{margin:0;font-size:18px;color:var(--ink)}
.design-prefix-head button{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--paper-2);color:var(--ink-soft);font-size:20px;line-height:1;cursor:pointer}
.design-prefix-dialog textarea{min-height:132px}
.design-prefix-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.design-prefix-actions button{appearance:none;border:1px solid var(--line);border-radius:8px;background:var(--paper-2);color:var(--ink-soft);font-size:12px;padding:9px 12px;cursor:pointer}
.design-prefix-actions button:hover:not(:disabled),.design-prefix-head button:hover{border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent)}
.design-style-dialog-backdrop{position:fixed;inset:0;z-index:370;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(2,5,6,.56);backdrop-filter:blur(14px)}
.design-style-dialog{width:min(520px,calc(100vw - 48px));display:flex;flex-direction:column;gap:13px;border:1px solid color-mix(in oklab,var(--accent) 26%,var(--line));border-radius:14px;background:color-mix(in oklab,var(--paper) 96%,#060807);box-shadow:0 34px 88px -48px rgba(0,0,0,.92);padding:16px}
.design-style-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:14px}
.design-style-dialog-head div{min-width:0;display:grid;gap:3px}
.design-style-dialog-head span{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute)}
.design-style-dialog-head h2{margin:0;font-size:18px;color:var(--ink)}
.design-style-dialog-head button{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--paper-2);color:var(--ink-soft);font-size:14px;line-height:1;cursor:pointer}
.design-style-dialog textarea{min-height:142px}
.design-style-dialog-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.design-style-dialog-actions button{appearance:none;border:1px solid var(--line);border-radius:8px;background:var(--paper-2);color:var(--ink-soft);font-size:12px;padding:9px 12px;cursor:pointer}
.design-style-dialog-actions .design-space-primary{background:color-mix(in oklab,var(--accent) 14%,var(--paper-2));color:var(--accent);border-color:color-mix(in oklab,var(--accent) 55%,var(--line))}
.design-style-dialog-actions button:hover:not(:disabled),.design-style-dialog-head button:hover{border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent)}
.design-space-image-param-popover{position:absolute;top:calc(100% + 8px);left:0;z-index:50;width:min(300px,calc(100vw - 40px));display:flex;flex-direction:column;gap:12px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:10px;background:var(--paper);box-shadow:0 22px 54px -34px rgba(31,86,132,.52),0 10px 24px -18px rgba(15,23,42,.28);padding:12px}
.design-space-image-param-popover section{display:flex;flex-direction:column;gap:8px}
.design-space-image-param-popover h3{margin:0;font-size:12px;line-height:1.3;color:var(--ink);font-weight:700}
.design-space-param-option-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.design-space-param-option-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.design-space-param-option-grid button,.design-space-param-option-row button{appearance:none;min-height:34px;border:1px solid var(--line);border-radius:7px;background:var(--paper-2);color:var(--ink-soft);font:inherit;font-size:12px;font-weight:650;cursor:pointer}
.design-space-param-option-grid button:hover,.design-space-param-option-row button:hover{border-color:color-mix(in oklab,var(--accent) 44%,var(--line));color:var(--accent)}
.design-space-param-option-grid button.active,.design-space-param-option-row button.active{border-color:color-mix(in oklab,var(--accent) 64%,var(--line));background:color-mix(in oklab,var(--accent) 13%,var(--paper-2));color:var(--accent)}
.design-space-back,.design-space-actions button,.design-history-actions button{appearance:none;border:1px solid var(--line);border-radius:8px;background:var(--paper-2);color:var(--ink-soft);font-size:12px;padding:8px 11px;cursor:pointer}
.design-space-back:hover,.design-space-actions button:hover:not(:disabled),.design-history-actions button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent)}
.embedded-design-space-workbench{height:100%;min-height:0;display:flex;flex-direction:column}
.embedded-design-space-toolbar{flex:0 0 auto}
.design-space-workbench{flex:1;min-height:0;display:grid;grid-template-columns:minmax(260px,.85fr) minmax(360px,1.15fr) minmax(320px,1fr);gap:14px;padding:14px;overflow:hidden}
.design-space-panel{min-width:0;min-height:0;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);display:flex;flex-direction:column;overflow:hidden}
.design-space-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 14px;border-bottom:1px solid var(--line-soft)}
.design-space-panel-head.compact{padding:12px 0 8px;border-bottom:0}
.design-space-panel-head h2{margin:0;font-size:15px;color:var(--ink)}
.design-space-panel-head span{font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.design-space-input-panel,.design-detail-panel{padding:0 14px 14px;gap:12px;overflow:auto}
.design-space-input-panel{height:100%;overflow:hidden}
.design-space-input-panel .design-space-panel-head,.design-detail-panel .design-space-panel-head{margin:0 -14px}
.design-space-field{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--ink-mute)}
.design-space-field input,.design-space-field textarea,.design-space-field select{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:7px;background:var(--paper-2);color:var(--ink);font:inherit;font-size:13px;outline:none;padding:9px 10px}
.design-space-field textarea{min-height:90px;resize:vertical;line-height:1.5}
.design-space-input-panel .design-space-field{flex:1 1 auto;min-height:0}
.design-space-input-panel .design-space-field textarea{flex:1 1 auto;min-height:0;resize:none}
.design-space-field input:focus,.design-space-field textarea:focus,.design-space-field select:focus{border-color:color-mix(in oklab,var(--accent) 55%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 12%,transparent)}
.design-space-primary{appearance:none;border:1px solid color-mix(in oklab,var(--accent) 55%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--accent) 14%,var(--paper-2));color:var(--accent);font-weight:600;font-size:13px;padding:10px 12px;cursor:pointer}
.design-space-primary:hover:not(:disabled){background:color-mix(in oklab,var(--accent) 20%,var(--paper-2))}
.design-space-primary:disabled{opacity:.45;cursor:not-allowed}
.design-error-box{display:flex;flex-direction:column;gap:4px;border:1px solid color-mix(in oklab,#ef4444 55%,var(--line));border-radius:8px;background:color-mix(in oklab,#ef4444 10%,var(--paper-2));color:var(--ink);padding:10px 11px;font-size:12px;line-height:1.45}
.design-error-box strong{color:#ef4444;font-size:12px}
.design-error-box span{color:var(--ink-soft)}
.design-space-tabs{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line-soft);background:var(--paper-2)}
.design-space-tabs button{appearance:none;border:0;border-right:1px solid var(--line-soft);background:transparent;color:var(--ink-mute);padding:12px 8px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px}
.design-space-tabs button:last-child{border-right:0}
.design-space-tabs button.active{color:var(--accent);background:color-mix(in oklab,var(--accent) 10%,transparent)}
.design-space-tabs button span{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);padding:1px 5px;border-radius:999px;background:var(--bg)}
.design-side-actions{margin-top:12px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);padding:10px;display:flex;flex-direction:column;gap:9px}
.design-space-input-panel .design-side-actions{flex:0 0 auto;margin-top:0}
.design-side-actions-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.design-side-actions-head strong{font-size:12px;color:var(--ink)}
.design-side-actions-head span{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);white-space:nowrap}
.design-side-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.design-side-action-grid button{appearance:none;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--ink-soft);font-size:12px;padding:9px 8px;cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.design-side-action-grid button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent)}
.design-side-action-grid button:disabled{opacity:.45;cursor:not-allowed}
.design-side-action-grid .design-space-primary{grid-column:1/-1;background:color-mix(in oklab,var(--accent) 12%,var(--paper));color:var(--accent);border-color:color-mix(in oklab,var(--accent) 42%,var(--line))}
.design-side-template-block{display:flex;flex-direction:column;gap:8px;padding-top:2px}
.design-side-template-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.design-side-template-grid button{appearance:none;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--ink-soft);font-size:12px;padding:9px 8px;cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.design-side-template-grid button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent)}
.design-side-template-grid button:disabled{opacity:.45;cursor:not-allowed}
.design-side-template-grid button:last-child:nth-child(odd){grid-column:1/-1}
.design-template-runner{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}
.design-template-runner select{min-width:0;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--ink);font:inherit;font-size:12px;outline:none;padding:9px 10px}
.design-template-runner select:focus{border-color:color-mix(in oklab,var(--accent) 55%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 12%,transparent)}
.design-template-runner button{appearance:none;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--ink-soft);font-size:12px;padding:9px 10px;cursor:pointer;white-space:nowrap}
.design-template-runner button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent)}
.design-template-runner button:disabled{opacity:.45;cursor:not-allowed}
.design-card-grid-status{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line-soft);background:color-mix(in oklab,var(--paper) 88%,var(--accent) 4%);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.design-card-grid{padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:10px;overflow:auto;align-content:start}
.design-card-grid-spacer{grid-column:1/-1;min-width:0;pointer-events:none}
.design-card{text-align:left;border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line-soft));border-radius:7px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 92%,white),color-mix(in oklab,var(--paper-2) 96%,var(--bg)));color:var(--ink);padding:9px;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;position:relative;gap:7px;contain:layout paint style;content-visibility:auto;contain-intrinsic-size:198px;transition:border-color .14s ease,box-shadow .14s ease,transform .14s ease,background .14s ease}
.design-card:hover{border-color:color-mix(in oklab,var(--accent) 42%,var(--line));box-shadow:0 12px 28px -24px rgba(31,86,132,.62);transform:translateY(-1px)}
.design-card.active{border-color:color-mix(in oklab,var(--accent) 72%,var(--line));box-shadow:0 0 0 2px color-mix(in oklab,var(--accent) 16%,transparent),0 14px 34px -26px color-mix(in oklab,var(--accent) 70%,black)}
.design-card.selected{background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 10%,var(--paper-2)),color-mix(in oklab,var(--paper-2) 95%,var(--accent) 5%))}
.design-card:focus-visible{outline:3px solid color-mix(in oklab,var(--accent) 28%,transparent);outline-offset:-3px}
.design-card-add{appearance:none;min-height:198px;align-items:center;justify-content:center;text-align:center;border-style:dashed;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 92%,#eaf6ff),color-mix(in oklab,var(--paper-2) 96%,var(--accent) 4%));color:var(--ink-soft)}
.design-card-add-icon{width:42px;height:42px;border:1px solid color-mix(in oklab,var(--accent) 44%,var(--line));border-radius:12px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));color:var(--accent);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 12px 28px -22px color-mix(in oklab,var(--accent) 70%,black)}
.design-card-add strong{font-size:14px;color:var(--ink)}
.design-card-add em{font-style:normal;font-size:12px;line-height:1.4;color:var(--ink-mute)}
.design-card-activate{color:inherit;text-align:left;padding:0;display:flex;flex-direction:column;width:100%;font:inherit;min-width:0}
.design-card-check{position:absolute;top:8px;left:8px;z-index:1;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:1px solid color-mix(in oklab,var(--line) 75%,transparent);border-radius:6px;background:color-mix(in oklab,var(--paper) 88%,transparent);box-shadow:0 3px 10px rgba(0,0,0,.12);cursor:pointer}
.design-card-check input{width:14px;height:14px;margin:0;accent-color:var(--accent)}
.design-card-preview-button{position:absolute;right:8px;bottom:8px;z-index:2;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--paper) 70%,transparent);border-radius:999px;background:color-mix(in oklab,#111827 70%,transparent);color:white;box-shadow:0 10px 24px rgba(15,23,42,.28);cursor:pointer;backdrop-filter:blur(8px);opacity:.9;transition:opacity .14s ease,transform .14s ease,background .14s ease}
.design-card-preview-button:hover{opacity:1;transform:translateY(-1px);background:color-mix(in oklab,var(--accent) 45%,#111827);border-color:color-mix(in oklab,var(--accent) 55%,white)}
.design-card-preview-button svg{stroke:currentColor}
.design-card-delete-button{position:absolute;left:8px;bottom:8px;z-index:2;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--paper) 72%,transparent);border-radius:999px;background:color-mix(in oklab,#7f1d1d 70%,transparent);color:white;box-shadow:0 10px 24px rgba(127,29,29,.24);cursor:pointer;backdrop-filter:blur(8px);opacity:.9;transition:opacity .14s ease,transform .14s ease,background .14s ease}
.design-card-delete-button:hover{opacity:1;transform:translateY(-1px);background:color-mix(in oklab,#ef4444 58%,#111827);border-color:color-mix(in oklab,#ef4444 58%,white)}
.design-card-delete-button svg{stroke:currentColor}
.design-card-thumb{aspect-ratio:1;position:relative;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 76%,#eaf6ff),color-mix(in oklab,var(--bg) 88%,white));border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line-soft));border-radius:7px;display:flex;align-items:center;justify-content:center;color:var(--ink-mute);font-family:var(--font-mono);font-size:11px;overflow:hidden;isolation:isolate;transform:translateZ(0)}
.design-card-thumb::before{content:"";position:absolute;left:13%;right:13%;bottom:10%;height:20%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(31,86,132,.22) 0%,rgba(31,86,132,.09) 46%,transparent 72%);filter:blur(6px);transform:perspective(180px) rotateX(58deg);z-index:0}
.design-card-thumb::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.55),transparent 36%,rgba(31,86,132,.08) 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -10px 28px rgba(31,86,132,.06);pointer-events:none;z-index:1}
.design-card-thumb img,.design-history-thumb img{width:100%;height:100%;object-fit:contain;display:block}
.design-card-thumb img{position:relative;z-index:1;max-width:92%;max-height:90%;filter:drop-shadow(0 14px 14px rgba(15,23,42,.2)) drop-shadow(0 3px 3px rgba(15,23,42,.12));transform:translateY(-1px) scale(.96);will-change:transform}
.design-card-type-pill{position:absolute;top:8px;right:8px;z-index:1;max-width:calc(100% - 48px);border:1px solid color-mix(in oklab,var(--paper) 70%,transparent);border-radius:999px;background:color-mix(in oklab,var(--paper) 82%,transparent);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;line-height:1;padding:4px 7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.design-card-thumb .design-card-type-pill{z-index:2}
.design-card-empty-thumb{position:relative;z-index:2;color:var(--ink-mute);font-size:12px}
.design-card-skeleton{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;width:74%;height:58%;border:1px dashed color-mix(in oklab,var(--accent) 24%,var(--line));border-radius:8px;background:linear-gradient(90deg,color-mix(in oklab,var(--paper) 82%,var(--bg)) 0%,color-mix(in oklab,var(--accent) 12%,var(--paper)) 48%,color-mix(in oklab,var(--paper) 82%,var(--bg)) 100%);background-size:220% 100%;animation:design-card-shimmer 1.4s ease-in-out infinite;color:var(--ink-mute);font-size:11px}
.design-card-body{display:flex;flex-direction:column;gap:5px;padding:0 1px 1px;min-width:0}
.design-card-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;min-width:0}
.design-card-body strong{font-size:14px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.design-card-body em{font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.design-card-body>span:not(.design-card-meta){font-size:12px;line-height:1.5;color:var(--ink-soft);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
@keyframes design-card-shimmer{0%{background-position:120% 0}100%{background-position:-120% 0}}
.design-warning{display:block;border-radius:6px;background:color-mix(in oklab,#f59e0b 12%,var(--paper));color:color-mix(in oklab,#f59e0b 74%,var(--ink));font-size:11px;font-weight:600;line-height:1.35;padding:5px 6px}
.design-card-error{display:block;border-radius:6px;background:color-mix(in oklab,#ef4444 10%,var(--paper));color:color-mix(in oklab,#ef4444 82%,var(--ink));font-size:11px;font-weight:600;line-height:1.35;padding:5px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.design-manual-asset-dialog{width:min(520px,calc(100vw - 48px))}
.design-manual-asset-form{display:flex;flex-direction:column;gap:12px}
.design-manual-asset-form textarea{min-height:150px}
.design-manual-asset-actions{padding-top:2px}
.design-space-actions{display:flex;gap:8px;flex-wrap:wrap}
.design-space-actions .design-space-primary{flex:1 1 140px}
.design-space-actions .design-space-prefix-trigger{flex:0 1 132px}
.design-space-actions button:disabled,.design-history-actions button:disabled{opacity:.45;cursor:not-allowed}
.design-reference-section{display:flex;flex-direction:column;gap:8px}
.design-reference-card{border:1px dashed var(--line);border-radius:8px;background:var(--paper-2);padding:10px;display:grid;grid-template-columns:1fr;gap:9px;min-height:0}
.design-reference-card.has-images{border-style:solid}
.design-reference-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,88px));justify-content:start;align-items:start;gap:8px}
.design-reference-tile{min-width:0;max-width:88px;border:1px solid var(--line-soft);border-radius:7px;background:var(--paper);overflow:hidden;display:flex;flex-direction:column}
.design-reference-tile img{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:var(--bg)}
.design-reference-tile span{padding:5px 6px;color:var(--ink-soft);font-size:10px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.design-reference-tile button{border:0;border-top:1px solid var(--line-soft);border-radius:0;background:transparent;padding:5px 6px;font-size:10px;min-height:26px}
.design-reference-preview{width:92px;aspect-ratio:1;border-radius:7px;overflow:hidden;background:var(--bg)}
.design-reference-preview img{width:100%;height:100%;object-fit:cover;display:block}
.design-reference-empty{min-height:54px;border-radius:7px;background:color-mix(in oklab,var(--accent) 7%,var(--paper));display:flex;align-items:center;justify-content:center;color:var(--ink-mute);font-size:12px}
.design-reference-meta{min-width:0;display:flex;flex-direction:column;gap:4px}
.design-reference-meta strong{font-size:13px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.design-reference-meta span{font-size:11px;color:var(--ink-mute)}
.design-reference-actions{grid-column:1/-1;display:grid;grid-template-columns:1fr auto;gap:8px}
.design-reference-card button{appearance:none;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--ink-soft);font-size:12px;padding:8px 10px;cursor:pointer}
.design-reference-card button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent)}
.design-reference-card button:disabled{opacity:.45;cursor:not-allowed}
.design-template-section{display:flex;flex-direction:column;gap:8px}
.design-template-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.design-template-grid button{appearance:none;border:1px solid var(--line);border-radius:7px;background:var(--paper-2);color:var(--ink-soft);font-size:12px;padding:9px 8px;cursor:pointer;min-height:36px}
.design-template-grid button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent);background:color-mix(in oklab,var(--accent) 10%,var(--paper-2))}
.design-template-grid button:disabled{opacity:.45;cursor:not-allowed}
.design-evidence{display:flex;flex-direction:column;gap:7px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);padding:10px 11px}
.design-evidence strong{font-size:12px;color:var(--ink)}
.design-evidence p{margin:0;color:var(--ink-soft);font-size:12px;line-height:1.55}
.design-history-section{display:flex;flex-direction:column;gap:8px;flex:1 1 auto;min-height:0}
.design-history-head{align-items:center;min-height:34px}
.design-history-head h2{line-height:1.2}
.design-history-head-actions{display:flex;align-items:center;gap:6px}
.design-history-upload-button{appearance:none;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:7px;background:var(--paper-2);color:var(--ink-soft);font-size:12px;padding:0 12px;cursor:pointer;white-space:nowrap;transition:border-color .14s ease,color .14s ease,background .14s ease,box-shadow .14s ease}
.design-history-upload-button:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--accent);background:color-mix(in oklab,var(--accent) 8%,var(--paper-2))}
.design-history-upload-button:focus-visible{outline:none;border-color:color-mix(in oklab,var(--accent) 58%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 14%,transparent)}
.design-history-upload-button:disabled{opacity:.45;cursor:not-allowed}
.design-history-container{flex:1 1 auto;min-height:176px;box-sizing:border-box;border:1px solid color-mix(in oklab,var(--line) 84%,var(--accent) 16%);border-radius:10px;background:color-mix(in oklab,var(--paper-2) 62%,var(--paper));padding:10px;overflow:auto;overscroll-behavior:contain}
.design-history-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,148px));justify-content:start;align-content:start;gap:10px}
.design-history-grid>.design-space-empty{grid-column:1/-1}
.design-history-item{min-width:0;border:1px solid var(--line-soft);border-radius:9px;background:var(--paper);overflow:hidden;display:grid;grid-template-rows:auto auto auto;transition:border-color .14s ease,box-shadow .14s ease,transform .14s ease,background .14s ease}
.design-history-item:hover{border-color:color-mix(in oklab,var(--accent) 38%,var(--line));box-shadow:0 12px 26px -22px rgba(31,86,132,.55);transform:translateY(-1px)}
.design-history-item:focus-within{border-color:color-mix(in oklab,var(--accent) 56%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 13%,transparent)}
.design-history-item.current{border-color:color-mix(in oklab,var(--accent) 66%,var(--line));box-shadow:0 0 0 2px color-mix(in oklab,var(--accent) 13%,transparent)}
.design-history-thumb{height:104px;box-sizing:border-box;padding:6px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 72%,#eaf6ff),color-mix(in oklab,var(--bg) 88%,white));display:flex;align-items:center;justify-content:center;color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;border-bottom:1px solid var(--line-soft)}
.design-history-thumb img{border-radius:6px;background:color-mix(in oklab,var(--paper) 88%,var(--bg))}
.design-history-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border:1px dashed color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:7px;background:linear-gradient(90deg,color-mix(in oklab,var(--paper) 82%,var(--bg)) 0%,color-mix(in oklab,var(--accent) 10%,var(--paper)) 48%,color-mix(in oklab,var(--paper) 82%,var(--bg)) 100%);background-size:220% 100%;color:var(--ink-mute);font-size:11px}
.design-history-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:6px;min-height:30px;padding:6px 8px 5px;color:var(--ink-soft);font-family:var(--font-mono);font-size:10px}
.design-history-status{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-soft)}
.design-history-current{display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 30%,var(--line));border-radius:999px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));color:var(--accent);font-size:10px;line-height:1;padding:3px 6px;white-space:nowrap}
.design-history-error{margin:-2px 8px 7px;padding:5px 6px;border-radius:6px;background:color-mix(in oklab,#ef4444 10%,var(--paper));color:color-mix(in oklab,#ef4444 82%,var(--ink));font-size:10px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.design-history-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 8px 9px}
.design-history-actions button{min-width:0;height:30px;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 6px;font-size:11px;border-radius:6px;transition:border-color .14s ease,color .14s ease,background .14s ease,transform .12s ease,box-shadow .14s ease}
.design-history-actions button:focus-visible{outline:none;border-color:color-mix(in oklab,var(--accent) 58%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 14%,transparent)}
.design-history-actions button:active:not(:disabled){transform:translateY(1px)}
.design-history-preview-button{background:color-mix(in oklab,var(--accent) 10%,var(--paper-2));color:var(--accent);border-color:color-mix(in oklab,var(--accent) 34%,var(--line))}
.design-history-download-button{background:var(--paper-2)}
.design-space-empty{padding:22px;border:1px dashed var(--line);border-radius:8px;background:var(--paper-2);color:var(--ink-mute);font-size:13px;text-align:center}
.media-preview-backdrop{position:fixed;inset:0;z-index:320;display:flex;align-items:center;justify-content:center;padding:32px;background:rgba(2,5,6,.72);backdrop-filter:blur(18px)}
.media-preview-dialog{width:min(920px,calc(100vw - 64px));height:min(760px,calc(100vh - 96px));display:flex;flex-direction:column;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));border-radius:18px;background:color-mix(in oklab,var(--paper) 94%,#060807);box-shadow:0 36px 90px -46px rgba(0,0,0,.96);overflow:hidden}
.media-preview-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;border-bottom:1px solid var(--line-soft);background:color-mix(in oklab,var(--accent) 8%,var(--paper))}
.media-preview-head div{min-width:0;display:grid;gap:3px}
.media-preview-head span{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.media-preview-head strong{font-size:14px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-preview-close{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:10px;background:var(--paper-2);color:var(--ink-soft);cursor:pointer}
.media-preview-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:18px;background:var(--bg);overflow:hidden}
.media-preview-stage img,.media-preview-stage video{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;display:block;border-radius:12px}
.media-preview-stage audio{width:min(560px,100%)}
.media-preview-text{width:min(640px,100%);display:grid;gap:12px;border:1px solid var(--line);border-radius:14px;padding:18px;background:var(--paper)}
@media (max-width:1180px){.design-space-topbar{grid-template-columns:auto 1fr}.design-space-project{grid-column:1/-1;text-align:left}.design-template-status{grid-column:1/-1;justify-self:start}.design-space-top-controls{grid-column:1/-1;grid-template-columns:1fr 1fr minmax(150px,.8fr) minmax(180px,.9fr) auto}.design-space-workbench{grid-template-columns:minmax(260px,.9fr) minmax(360px,1.1fr)}.design-detail-panel{grid-column:1/-1}}
@media (max-width:760px){.design-space-topbar{grid-template-columns:1fr;align-items:flex-start}.design-space-top-controls{grid-template-columns:1fr}.design-space-project{width:100%;text-align:left}.design-space-workbench{grid-template-columns:1fr;padding:10px;height:auto;max-height:none}.design-side-action-grid,.design-template-runner,.design-side-template-grid{grid-template-columns:1fr}.design-card-grid{grid-template-columns:1fr}.design-template-grid{grid-template-columns:1fr 1fr}}
`;
