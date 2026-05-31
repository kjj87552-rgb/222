/* Product shell layout styles — sidebar + home pages + model config.
 * Applies to the product-level chrome that wraps the canvas.
 */
export const shellStyles = `
.product-shell{position:absolute;inset:0;display:flex;background:var(--bg);color:var(--ink);overflow:hidden}
.product-shell::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,color-mix(in oklab,var(--accent) 7%,transparent),transparent 38%),linear-gradient(22deg,transparent 52%,color-mix(in oklab,var(--accent-2) 6%,transparent));opacity:.9}
.app-window-chrome{position:fixed;left:0;right:0;top:0;z-index:12000;height:38px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;border-bottom:1px solid color-mix(in oklab,var(--line) 72%,transparent);background:linear-gradient(90deg,color-mix(in oklab,var(--paper) 92%,transparent),color-mix(in oklab,var(--paper-2) 78%,transparent));box-shadow:0 18px 42px -34px rgba(0,0,0,.55),inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent);backdrop-filter:blur(18px) saturate(1.08);-webkit-app-region:drag;user-select:none}
.app-window-chrome.is-blurred{opacity:.82}
.window-chrome-brand{height:100%;display:flex;align-items:center;gap:9px;padding:0 13px 0 12px;min-width:0;color:var(--ink)}
.window-chrome-mark{width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 36%,var(--line));border-radius:7px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 20%,var(--paper-2)),color-mix(in oklab,var(--accent-2) 10%,var(--paper)));font-size:12px;font-weight:800;color:color-mix(in oklab,var(--accent) 78%,var(--ink))}
.window-chrome-brand strong{font-size:12px;font-weight:800;letter-spacing:0;white-space:nowrap}
.window-chrome-brand em{font-style:normal;font-family:var(--font-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute);white-space:nowrap}
.window-chrome-drag{height:100%;min-width:0}
.window-chrome-controls{height:100%;display:flex;align-items:center;gap:6px;padding:0 8px;-webkit-app-region:no-drag}
.window-control-btn{width:34px;height:26px;display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--ink-soft);cursor:pointer;transition:background .16s ease,border-color .16s ease,color .16s ease,box-shadow .18s ease;-webkit-app-region:no-drag}
.window-control-btn:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 24%,var(--line));background:color-mix(in oklab,var(--accent) 9%,var(--paper-2));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent)}
.window-control-btn.close:hover{color:#fff;border-color:color-mix(in oklab,#ef5f7d 34%,transparent);background:linear-gradient(135deg,#ef5f7d,#d94062)}
.window-control-btn span{position:relative;width:13px;height:13px;display:block}
.window-control-btn.minimize span::before{content:'';position:absolute;left:1px;right:1px;bottom:3px;height:1.5px;border-radius:999px;background:currentColor}
.window-control-btn.maximize span::before{content:'';position:absolute;inset:2px;border:1.5px solid currentColor;border-radius:2px}
.window-control-btn.maximize span.restore::before{inset:4px 1px 1px 4px}
.window-control-btn.maximize span.restore::after{content:'';position:absolute;left:1px;top:1px;width:8px;height:8px;border:1.5px solid currentColor;border-radius:2px;background:transparent}
.window-control-btn.close span::before,.window-control-btn.close span::after{content:'';position:absolute;left:1px;right:1px;top:6px;height:1.5px;border-radius:999px;background:currentColor}.window-control-btn.close span::before{transform:rotate(45deg)}.window-control-btn.close span::after{transform:rotate(-45deg)}
.has-window-chrome .product-sidebar,.has-window-chrome .product-main{margin-top:38px;height:calc(100% - 38px)}
.has-window-chrome .auth-gate{top:38px}
.has-window-chrome .launcher-gate{top:38px}
.has-window-chrome .product-main{min-height:0}
.has-window-chrome .canvas-screen{inset:0;height:100%}
.product-sidebar{width:236px;flex:0 0 236px;display:flex;flex-direction:column;background:color-mix(in oklab,var(--paper) 92%,var(--bg));border-right:1px solid var(--line);padding:16px 12px;z-index:120}
.product-brand{display:flex;align-items:center;gap:10px;height:44px;padding:0 8px 14px;border-bottom:1px dashed var(--line-soft)}
.product-brand .wordmark{display:flex;flex-direction:column;gap:2px;line-height:1}
.product-brand strong{font-size:15px;letter-spacing:0}
.product-brand span{font-size:10px;color:var(--ink-mute);font-family:var(--font-mono)}
.product-nav{display:flex;flex-direction:column;gap:6px;padding:14px 0}
.product-nav button{width:100%;min-height:44px;display:flex;align-items:center;gap:10px;padding:0 10px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--ink-soft);cursor:pointer;text-align:left}
.product-nav button:hover{background:var(--paper-2);color:var(--ink)}
.product-nav button.active{background:color-mix(in oklab,var(--accent) 12%,var(--paper-2));border-color:color-mix(in oklab,var(--accent) 38%,var(--line));color:var(--ink)}
.product-nav button .nav-meta{margin-left:auto;font-size:10px;color:var(--ink-mute);font-family:var(--font-mono)}
.product-sidefoot{margin-top:auto;border-top:1px dashed var(--line-soft);padding:12px 8px 0;color:var(--ink-mute);font-size:11px;line-height:1.5}
.product-main{position:relative;flex:1;min-width:0;overflow:hidden;background:transparent}
.canvas-screen{position:absolute;inset:0;overflow:hidden}
.home-page{position:absolute;inset:0;overflow:auto;padding:28px 34px 40px}
.home-page .page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:22px}
.home-page h1{margin:0 0 8px;font-size:24px;line-height:1.2;letter-spacing:0}
.home-page .sub{margin:0;color:var(--ink-mute);font-size:13px}
.home-actions{display:flex;gap:8px;flex-wrap:wrap}
.project-create{grid-column:1/-1;display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:10px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--paper)}
.project-name-input{min-height:38px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);color:var(--ink);padding:0 12px;outline:none}
.project-name-input:focus{border-color:color-mix(in oklab,var(--accent) 50%,var(--line))}
.home-btn{min-height:36px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 12px;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:var(--ink-soft);cursor:pointer}
.home-btn:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 45%,var(--line))}
.home-btn.primary{color:#041312;border-color:color-mix(in oklab,var(--accent) 78%,white);background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent-3,var(--accent)) 36%,var(--accent)));font-weight:700;box-shadow:0 14px 34px -26px color-mix(in oklab,var(--accent) 80%,transparent),inset 0 1px 0 rgba(255,255,255,.28)}
.home-btn:disabled{cursor:default;opacity:.48}
.home-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}
.stat-strip{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.stat-item{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:14px}
.stat-item strong{display:block;font-family:var(--font-mono);font-size:22px}
.stat-item span{color:var(--ink-mute);font-size:12px}
.project-list,.asset-panel,.model-panel{background:var(--paper);border:1px solid var(--line);border-radius:8px}
.project-list{grid-column:span 8}
.project-list.full{grid-column:1/-1}
.side-panel{grid-column:span 4}
.section-head{display:flex;align-items:center;justify-content:space-between;min-height:46px;padding:0 14px;border-bottom:1px solid var(--line-soft)}
.section-head h2{margin:0;font-size:14px}
.section-head span{color:var(--ink-mute);font-size:11px;font-family:var(--font-mono)}
.project-row{display:grid;grid-template-columns:88px minmax(0,1fr) auto;gap:14px;align-items:center;padding:14px;border-bottom:1px solid var(--line-soft)}
.project-row.active{background:color-mix(in oklab,var(--accent) 7%,transparent)}
.project-row:last-child{border-bottom:0}
.project-row h3{margin:0 0 6px;font-size:14px}
.project-row p{margin:0;font-size:12px;color:var(--ink-mute)}
.asset-panel,.model-panel{grid-column:1/-1}
.asset-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;padding:14px}
.asset-tile{border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);min-height:150px;overflow:hidden}
.asset-thumb{height:100px;display:flex;align-items:center;justify-content:center;background:color-mix(in oklab,var(--ink) 5%,var(--paper-2))}
.asset-thumb img{width:100%;height:100%;object-fit:cover}
.asset-info{padding:10px}
.asset-info strong{display:block;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.asset-info span{color:var(--ink-mute);font-size:11px}
.empty-state{min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--ink-mute);padding:30px;text-align:center}
.media-home-page{background:var(--bg)}
.media-page-head{position:sticky;top:0;z-index:4;padding:2px 0 18px;background:linear-gradient(180deg,var(--bg) 72%,transparent)}
.asset-scopebar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 10px}
.asset-scopebar button{min-height:58px;text-align:left;display:flex;flex-direction:column;justify-content:center;gap:5px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);padding:0 14px;cursor:pointer}
.asset-scopebar button:hover,.asset-project-strip button:hover{border-color:color-mix(in oklab,var(--accent) 40%,var(--line));color:var(--ink)}
.asset-scopebar button.active,.asset-project-strip button.active{background:color-mix(in oklab,var(--accent) 11%,var(--paper));border-color:color-mix(in oklab,var(--accent) 50%,var(--line));color:var(--ink)}
.asset-scopebar strong,.asset-project-strip strong{font-size:13px}
.asset-scopebar span,.asset-project-strip span{font-size:11px;color:var(--ink-mute);font-family:var(--font-mono)}
.asset-project-strip{display:flex;gap:8px;overflow-x:auto;padding:0 0 10px;margin:0 0 4px;scrollbar-width:thin}
.asset-project-strip button{min-width:180px;max-width:240px;min-height:50px;text-align:left;display:flex;flex-direction:column;justify-content:center;gap:5px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);padding:0 12px;cursor:pointer}
.asset-project-strip strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.asset-strip-empty{min-height:44px;display:flex;align-items:center;color:var(--ink-mute);font-size:12px}
.media-tabbar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0 0 14px}
.media-tabbar button{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);padding:0 12px;cursor:pointer}
.media-tabbar button:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 38%,var(--line))}
.media-tabbar button.active{background:color-mix(in oklab,var(--accent) 12%,var(--paper));border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--ink)}
.media-tabbar button strong{font-size:13px}
.media-tabbar button span{font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.media-panel{overflow:hidden}
.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;padding:14px}
.media-card{min-width:0;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);overflow:hidden;display:flex;flex-direction:column}
.media-thumb{position:relative;height:132px;display:flex;align-items:center;justify-content:center;background:color-mix(in oklab,var(--ink) 5%,var(--paper-2));overflow:hidden}
.media-thumb img,.media-thumb video{width:100%;height:100%;object-fit:contain;display:block;background:#080908}
.media-card-badge{position:absolute;left:8px;top:8px;z-index:1;max-width:calc(100% - 54px);padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.58);color:#fff;font-size:10px;line-height:1;font-family:var(--font-mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-glyph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:12px;color:var(--ink-mute);letter-spacing:.16em;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 8%,transparent),transparent)}
.media-info{padding:10px;display:grid;gap:5px;min-height:84px}
.media-info strong{font-size:12px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-info span{font-size:11px;color:var(--ink-mute);font-family:var(--font-mono)}
.media-info em{font-style:normal;font-size:11px;color:var(--ink-mute);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.media-actions{display:flex;justify-content:flex-end;padding:0 10px 10px}
.media-actions .home-btn{min-height:30px;font-size:12px}
.asset-card-actions{gap:6px;justify-content:space-between;flex-wrap:wrap}
.asset-card-tags{display:flex;gap:5px;flex-wrap:wrap;min-height:18px}
.asset-card-tags i{font-style:normal;font-size:10px;color:var(--ink-soft);border:1px solid var(--line-soft);background:var(--paper);border-radius:999px;padding:2px 6px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.asset-library-notice{margin:12px 14px 0;border:1px solid color-mix(in oklab,var(--accent) 34%,var(--line));background:color-mix(in oklab,var(--accent) 8%,var(--paper));color:var(--ink);border-radius:8px;padding:9px 11px;font-size:12px}
.asset-library-notice.error{border-color:color-mix(in oklab,#ef4444 42%,var(--line));background:color-mix(in oklab,#ef4444 10%,var(--paper));color:#ef4444}
.asset-library-page{display:flex;flex-direction:column}
.asset-page-head{margin-bottom:16px}
.asset-library-overview{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,42%);gap:14px;align-items:stretch;margin:0 0 14px;padding:14px;border:1px solid color-mix(in oklab,var(--line) 90%,transparent);border-radius:8px;background:linear-gradient(135deg,color-mix(in oklab,var(--paper) 92%,var(--bg)),color-mix(in oklab,var(--paper-2) 70%,var(--bg)));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent)}
.asset-overview-copy{display:flex;flex-direction:column;justify-content:center;gap:6px;min-width:0}
.asset-overview-copy span,.asset-section-label,.asset-content-head span{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.asset-overview-copy strong{font-size:18px;line-height:1.2;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.asset-overview-copy p{margin:0;color:var(--ink-mute);font-size:12px;line-height:1.5}
.asset-overview-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.asset-overview-metrics div{min-height:72px;border:1px solid var(--line-soft);border-radius:8px;background:color-mix(in oklab,var(--paper-2) 78%,transparent);padding:12px;display:flex;flex-direction:column;justify-content:center;gap:7px}
.asset-overview-metrics strong{font-family:var(--font-mono);font-size:24px;line-height:1;color:var(--ink)}
.asset-overview-metrics span{font-size:11px;color:var(--ink-mute)}
.asset-library-shell{display:grid;grid-template-columns:minmax(260px,300px) minmax(0,1fr);gap:14px;align-items:start;min-height:0}
.asset-control-panel{position:sticky;top:96px;display:flex;flex-direction:column;gap:12px;min-width:0}
.asset-control-section{border:1px solid var(--line);border-radius:8px;background:color-mix(in oklab,var(--paper) 92%,var(--bg));padding:12px}
.asset-section-label{display:flex;align-items:center;gap:8px;margin:0 0 10px}
.asset-section-label::after{content:'';height:1px;flex:1;background:var(--line-soft)}
.asset-scopebar-v2{grid-template-columns:1fr;gap:8px;margin:0}
.asset-scopebar-v2 button{min-height:68px;padding:0 12px}
.asset-project-strip-v2{display:flex;flex-direction:column;gap:8px;overflow:visible;padding:0;margin:0}
.asset-project-strip-v2 button{width:100%;min-width:0;max-width:none}
.media-tabbar-v2{display:flex;flex-direction:column;gap:6px;margin:0}
.media-tabbar-v2 button{min-height:38px;border-color:var(--line-soft);background:color-mix(in oklab,var(--paper-2) 68%,transparent)}
.asset-summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.asset-summary-grid button{min-height:68px;text-align:left;border:1px solid var(--line-soft);border-radius:8px;background:color-mix(in oklab,var(--paper-2) 68%,transparent);color:var(--ink-soft);padding:10px;display:flex;flex-direction:column;justify-content:center;gap:6px;cursor:pointer}
.asset-summary-grid button:hover{border-color:color-mix(in oklab,var(--accent) 35%,var(--line));color:var(--ink)}
.asset-summary-grid button.active{background:color-mix(in oklab,var(--accent) 10%,var(--paper));border-color:color-mix(in oklab,var(--accent) 45%,var(--line));color:var(--ink)}
.asset-summary-grid button:first-child{grid-column:1/-1}
.asset-summary-grid strong{font-family:var(--font-mono);font-size:20px;line-height:1;color:var(--ink)}
.asset-summary-grid span{font-size:11px;color:var(--ink-mute)}
.asset-content-panel{grid-column:auto;min-width:0;overflow:hidden;background:var(--paper);border-color:color-mix(in oklab,var(--line) 92%,transparent)}
.asset-content-head{min-height:58px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border-bottom:1px solid var(--line-soft);background:color-mix(in oklab,var(--paper) 94%,var(--bg))}
.asset-content-head h2{margin:3px 0 0;font-size:16px;line-height:1.2;color:var(--ink)}
.asset-content-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;min-width:0;text-align:right}
.asset-content-meta strong{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--ink-soft)}
.asset-content-meta span{font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.asset-main-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 14px;padding:5px;border:1px solid var(--line);border-radius:12px;background:color-mix(in oklab,var(--paper) 84%,var(--bg))}
.asset-main-tabs button{min-height:58px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--ink-soft);display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;padding:0 14px;cursor:pointer;text-align:left}
.asset-main-tabs button:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 24%,var(--line))}
.asset-main-tabs button.active{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 46%,var(--line));background:color-mix(in oklab,var(--accent) 11%,var(--paper))}
.asset-main-tabs strong{font-size:14px}
.asset-main-tabs span{font-size:11px;color:var(--ink-mute);font-family:var(--font-mono)}
.asset-category-strip{display:flex;align-items:center;gap:8px;overflow-x:auto;margin:0 0 14px;padding:10px;border:1px solid var(--line);border-radius:12px;background:color-mix(in oklab,var(--paper) 82%,var(--bg));scrollbar-width:thin}
.asset-category-strip button{min-height:38px;white-space:nowrap;border:1px solid var(--line-soft);border-radius:999px;background:color-mix(in oklab,var(--paper-2) 62%,transparent);color:var(--ink-soft);display:inline-flex;align-items:center;gap:9px;padding:0 13px;cursor:pointer}
.asset-category-strip button:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 36%,var(--line))}
.asset-category-strip button.active{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 48%,var(--line));background:color-mix(in oklab,var(--accent) 12%,var(--paper))}
.asset-category-strip strong{font-size:12px}
.asset-category-strip span{min-width:18px;height:18px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;padding:0 6px;background:color-mix(in oklab,var(--bg-deep) 55%,transparent);color:var(--ink-mute);font-family:var(--font-mono);font-size:10px}
.asset-library-shell.project-index,.asset-library-shell.media-view{grid-template-columns:1fr}
.asset-project-index{grid-column:auto;min-width:0;overflow:hidden}
.asset-project-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;padding:16px}
.asset-project-card{position:relative;min-height:220px;border:1px solid var(--line-soft);border-radius:12px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 76%,transparent),color-mix(in oklab,var(--paper-2) 58%,transparent));color:var(--ink-soft);padding:16px;text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:10px;cursor:pointer;overflow:hidden;transition:transform .18s ease,border-color .18s ease,box-shadow .2s ease}
.asset-project-card:hover{transform:translateY(-2px);border-color:color-mix(in oklab,var(--accent) 42%,var(--line));box-shadow:0 28px 58px -42px color-mix(in oklab,var(--accent) 48%,transparent)}
.asset-project-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 58% at 50% 0%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 70%);opacity:.9;pointer-events:none}
.asset-project-card > *{position:relative;z-index:1}
.asset-project-badge{align-self:flex-start;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:999px;background:color-mix(in oklab,var(--accent) 9%,transparent);color:var(--accent);font-family:var(--font-mono);font-size:10px;padding:4px 8px}
.asset-project-glyph{width:70px;height:54px;border:1px dashed color-mix(in oklab,var(--accent) 35%,var(--line));border-radius:10px;background:color-mix(in oklab,var(--bg-deep) 40%,transparent);display:flex;flex-direction:column;justify-content:center;gap:6px;padding:10px;margin-top:4px}
.asset-project-glyph i{height:1px;background:color-mix(in oklab,var(--accent) 46%,transparent)}
.asset-project-card strong{width:100%;font-size:15px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.asset-project-card em{font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.asset-project-card-stats{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto}
.asset-project-card-stats span{border:1px solid var(--line-soft);border-radius:999px;background:color-mix(in oklab,var(--paper) 58%,transparent);font-size:10px;color:var(--ink-mute);padding:4px 7px}
.asset-project-card b{align-self:stretch;min-height:32px;border-radius:8px;background:color-mix(in oklab,var(--accent) 10%,transparent);color:var(--ink);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
.asset-back-link{border:1px solid var(--line);border-radius:999px;background:color-mix(in oklab,var(--paper-2) 64%,transparent);color:var(--ink-soft);min-height:28px;padding:0 10px;cursor:pointer;font-size:12px}
.asset-back-link:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 40%,var(--line))}
.model-table{display:flex;flex-direction:column}
.model-row{display:grid;grid-template-columns:1.2fr 1fr 1fr auto;gap:12px;align-items:center;min-height:58px;padding:0 14px;border-bottom:1px solid var(--line-soft)}
.model-row:last-child{border-bottom:0}
.model-row strong{font-size:13px}
.model-row span{color:var(--ink-mute);font-size:12px}
.model-message{margin:0 0 14px;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);font-size:12px;white-space:pre-line}
.model-message.error{border-color:color-mix(in oklab,#ef4444 45%,var(--line));background:color-mix(in oklab,#ef4444 9%,var(--paper));color:#fca5a5}
.model-message.success{border-color:color-mix(in oklab,var(--accent) 45%,var(--line));background:color-mix(in oklab,var(--accent) 9%,var(--paper));color:color-mix(in oklab,var(--accent) 80%,white)}
.model-message.info{border-color:var(--line);background:var(--paper);color:var(--ink-soft)}
.provider-list{display:flex;flex-direction:column}
.provider-block{border-bottom:1px solid var(--line-soft);padding:14px}
.provider-block:last-child{border-bottom:0}
.provider-row{display:grid;grid-template-columns:minmax(150px,1.1fr) minmax(170px,1fr) minmax(180px,1fr) auto auto;gap:12px;align-items:center}
.provider-row strong{display:block;font-size:13px;margin-bottom:3px}
.provider-row span,.provider-actions span{color:var(--ink-mute);font-size:12px}
.provider-actions{display:grid;grid-template-columns:minmax(220px,1fr) auto auto;gap:8px;margin-top:10px}
.model-input{min-height:36px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);color:var(--ink);padding:0 10px;outline:none;font-size:12px}
.model-input:focus{border-color:color-mix(in oklab,var(--accent) 50%,var(--line))}
.model-input:disabled{opacity:.48}
.model-switch{display:inline-flex;align-items:center;gap:7px;color:var(--ink-soft);font-size:12px}
.model-switch input{accent-color:var(--accent)}
.provider-models{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.provider-model-chip{min-height:32px;display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);color:var(--ink-soft);padding:0 10px;cursor:pointer}
.provider-model-chip.active{border-color:color-mix(in oklab,var(--accent) 45%,var(--line));color:var(--ink)}
.provider-model-chip span{font-size:12px}
.provider-model-chip em{font-style:normal;color:var(--ink-mute);font-size:10px;font-family:var(--font-mono)}
.status-pill{justify-self:start;padding:3px 8px;border-radius:999px;border:1px solid var(--line);font-size:11px;color:var(--ink-mute)}
.status-pill.ready{color:var(--accent);border-color:color-mix(in oklab,var(--accent) 42%,var(--line))}
.model-config-page{background:var(--bg)}
.category-tabs{display:flex;gap:8px;margin:0 0 14px;border-bottom:1px solid var(--line-soft);padding-bottom:12px}
.category-tabs button{min-width:128px;min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-soft);padding:0 12px;cursor:pointer}
.category-tabs button.active{background:color-mix(in oklab,var(--accent) 12%,var(--paper));border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:var(--ink)}
.category-tabs button strong{font-size:13px}
.category-tabs button span{font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.model-config-layout{display:grid;grid-template-columns:minmax(260px,320px) minmax(0,1fr);gap:14px;align-items:start}
.config-connection-panel{border:1px solid var(--line);border-radius:8px;background:var(--paper);overflow:hidden}
.section-head.compact{min-height:42px}
.connection-body{display:flex;flex-direction:column;gap:12px;padding:14px}
.model-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.model-field span{font-size:11px;color:var(--ink-mute)}
.model-switch.row{justify-content:flex-start}
.connection-actions{display:flex;gap:8px;flex-wrap:wrap}
.capability-readout{display:flex;flex-direction:column;gap:5px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);padding:10px}
.capability-readout span,.capability-readout em{font-size:11px;color:var(--ink-mute);font-style:normal}
.capability-readout strong{font-size:13px}
.config-model-panel{min-width:0}
.add-model-panel{display:grid;grid-template-columns:minmax(150px,.9fr) minmax(170px,1fr) auto;gap:8px;padding:14px;border-bottom:1px solid var(--line-soft)}
.add-model-panel:has(select){grid-template-columns:minmax(150px,.9fr) minmax(170px,1fr) minmax(130px,.5fr) auto}
.model-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;padding:14px}
.api-model-card{border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);padding:12px}
.api-model-card.enabled{border-color:color-mix(in oklab,var(--accent) 28%,var(--line))}
.api-model-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
.api-model-card-head strong{display:block;font-size:13px;margin-bottom:4px}
.api-model-card-head span{font-size:11px;color:var(--ink-mute)}
.model-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.model-field-grid .model-field:last-child{grid-column:1/-1}
.api-model-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:12px}
.home-btn.danger{border-color:color-mix(in oklab,#ef4444 42%,var(--line));color:#ef4444}
.home-btn.danger:hover{background:color-mix(in oklab,#ef4444 10%,var(--paper))}
.user-center-page{background:var(--bg)}
.user-center-layout{display:grid;grid-template-columns:minmax(260px,320px) minmax(0,1fr);gap:14px;align-items:start}
.user-login-panel{position:sticky;top:28px}
.user-main-stack{display:flex;flex-direction:column;gap:14px;min-width:0}
.user-summary-panel{overflow:hidden}
.user-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:14px}
.user-stat{border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);padding:12px;min-height:74px;display:flex;flex-direction:column;gap:8px;justify-content:center}
.user-stat span{font-size:11px;color:var(--ink-mute)}
.user-stat strong{font-size:13px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.user-token-form{display:grid;grid-template-columns:minmax(130px,.9fr) minmax(110px,.6fr) minmax(190px,1.2fr) auto auto auto;gap:8px;align-items:center;padding:14px;border-bottom:1px solid var(--line-soft)}
.user-token-list{display:flex;flex-direction:column}
.user-token-row{display:grid;grid-template-columns:minmax(180px,1.1fr) minmax(160px,.8fr) auto;gap:12px;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line-soft)}
.user-token-row:last-child{border-bottom:0}
.user-token-row strong{display:block;font-size:13px;margin-bottom:4px}
.user-token-row span,.user-token-quota span{display:block;color:var(--ink-mute);font-size:11px}
.user-token-quota{display:flex;flex-direction:column;gap:4px;font-family:var(--font-mono)}
.user-two-col{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,340px);gap:14px;align-items:start}
.user-model-list{display:flex;gap:8px;flex-wrap:wrap;align-content:flex-start;max-height:260px;overflow:auto;padding:14px}
.user-model-list span{display:inline-flex;align-items:center;min-height:28px;border:1px solid var(--line-soft);border-radius:999px;background:var(--paper-2);color:var(--ink-soft);font-size:11px;font-family:var(--font-mono);padding:0 10px}
.user-redeem-form{display:grid;grid-template-columns:1fr auto;gap:8px;padding:14px}
.empty-state.small{min-height:120px;grid-column:1/-1}
.launcher-gate{position:absolute;inset:0;isolation:isolate;display:grid;place-items:center;padding:clamp(28px,6vw,76px);overflow:hidden;background:linear-gradient(140deg,#081C2D 0%,#123F5F 42%,#F5FAFF 100%)}
.launcher-gate::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.08),transparent 38%,rgba(247,109,158,.16)),radial-gradient(ellipse 52% 38% at 22% 16%,rgba(85,182,242,.36),transparent 70%),radial-gradient(ellipse 44% 44% at 82% 78%,rgba(255,184,108,.28),transparent 72%)}
.launcher-gate::after{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px);background-size:54px 54px;mask-image:radial-gradient(ellipse 78% 68% at 50% 50%,black 0%,transparent 84%);opacity:.46}
.launcher-brand{position:absolute;left:clamp(24px,5vw,62px);top:clamp(58px,8vw,92px);z-index:1;display:flex;flex-direction:column;gap:7px;color:#F8FCFF;text-shadow:0 18px 48px rgba(0,0,0,.32)}
.launcher-brand strong{font-family:'Source Serif 4','Noto Serif SC',serif;font-size:46px;font-weight:700;line-height:1;letter-spacing:0}
.launcher-brand span{font-family:var(--font-mono);font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:rgba(248,252,255,.78)}
.launcher-stage{position:absolute;inset:0;z-index:1;pointer-events:none}
.launcher-float-card,.launcher-float-line{position:absolute;display:block;border:1px solid rgba(255,255,255,.24);background:linear-gradient(145deg,rgba(255,255,255,.22),rgba(255,255,255,.08));box-shadow:0 28px 72px -36px rgba(2,12,22,.68),inset 0 1px 0 rgba(255,255,255,.34);backdrop-filter:blur(10px)}
.launcher-float-card{border-radius:14px;animation:launcherFloat 7s ease-in-out infinite}
.launcher-float-card.card-a{left:14%;bottom:18%;width:170px;height:108px;transform:rotate(-8deg);animation-delay:-1s}
.launcher-float-card.card-b{right:15%;top:18%;width:136px;height:156px;border-color:rgba(255,184,108,.34);animation-delay:-2.8s}
.launcher-float-card.card-c{right:24%;bottom:14%;width:220px;height:84px;border-color:rgba(247,109,158,.32);animation-delay:-4.2s}
.launcher-float-line{height:1px;transform-origin:center;background:linear-gradient(90deg,transparent,rgba(248,252,255,.72),transparent);border:0;box-shadow:none;animation:launcherFloat 8.5s ease-in-out infinite}
.launcher-float-line.line-a{left:18%;top:35%;width:230px;transform:rotate(-14deg);animation-delay:-3.4s}
.launcher-float-line.line-b{right:13%;bottom:35%;width:260px;transform:rotate(11deg);animation-delay:-5.2s}
.launcher-start-button{position:relative;z-index:2;width:clamp(196px,22vw,268px);aspect-ratio:1;border:1px solid rgba(255,255,255,.54);border-radius:50%;display:inline-grid;place-items:center;padding:0;background:radial-gradient(circle at 38% 28%,rgba(255,255,255,.95),rgba(234,246,255,.76) 36%,rgba(85,182,242,.88) 72%,rgba(247,109,158,.72) 100%);color:#082238;cursor:pointer;box-shadow:0 34px 90px -44px rgba(0,0,0,.56),0 0 0 12px rgba(255,255,255,.08),inset 0 1px 0 rgba(255,255,255,.78);transition:transform .22s ease,box-shadow .22s ease,filter .22s ease}
.launcher-start-button:hover{transform:translateY(-3px) scale(1.02);filter:saturate(1.08);box-shadow:0 40px 100px -42px rgba(0,0,0,.62),0 0 0 14px rgba(255,255,255,.11),inset 0 1px 0 rgba(255,255,255,.82)}
.launcher-start-button:focus-visible{outline:3px solid rgba(255,255,255,.86);outline-offset:8px}
.launcher-button-orbit{position:absolute;inset:-14px;border-radius:50%;border:1px dashed rgba(255,255,255,.62);animation:launcherOrbit 14s linear infinite}
.launcher-button-orbit::before{content:'';position:absolute;left:50%;top:-4px;width:8px;height:8px;border-radius:50%;background:#FFB86C;box-shadow:0 0 18px rgba(255,184,108,.84)}
.launcher-button-core{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.launcher-button-core strong{font-size:30px;font-weight:900;line-height:1;letter-spacing:0}
.launcher-button-core em{font-style:normal;font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(8,34,56,.7)}
.launcher-account-note{position:absolute;left:50%;bottom:clamp(44px,7vw,74px);z-index:2;transform:translateX(-50%);margin:0;color:rgba(248,252,255,.82);font-size:13px;line-height:1.4;text-align:center;text-shadow:0 12px 30px rgba(0,0,0,.35)}
@keyframes launcherOrbit{to{transform:rotate(360deg)}}
@keyframes launcherFloat{0%,100%{translate:0 0}50%{translate:0 -16px}}
.auth-gate{position:absolute;inset:0;isolation:isolate;display:flex;align-items:center;justify-content:flex-end;padding:clamp(28px,6vw,78px);background:#EAF6FF;overflow:hidden}
.auth-gate::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background-image:url('./ui-assets/auth-studio-bg.png');background-size:cover;background-position:center;background-repeat:no-repeat;filter:saturate(1.12) hue-rotate(8deg) brightness(1.04) contrast(1.02);transform:scale(1.012);transform-origin:center}
.auth-gate::after{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,rgba(234,246,255,.10) 0%,rgba(234,246,255,.28) 38%,rgba(214,236,255,.70) 67%,rgba(248,252,255,.94) 100%),linear-gradient(180deg,rgba(255,255,255,.18) 0%,transparent 42%,rgba(215,236,255,.20) 100%),radial-gradient(ellipse 54% 62% at 18% 80%,color-mix(in oklab,var(--accent) 18%,transparent),transparent 72%),radial-gradient(ellipse 38% 44% at 80% 18%,color-mix(in oklab,var(--accent-2) 14%,transparent),transparent 74%);mask-image:linear-gradient(90deg,rgba(0,0,0,.78) 0%,#000 38%,#000 100%)}
.auth-panel{position:relative;z-index:1;width:min(500px,100%);max-height:calc(100vh - 64px);overflow:auto;border:1px solid color-mix(in oklab,var(--line) 66%,var(--accent) 14%);border-radius:18px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 66%,transparent),transparent 42%),color-mix(in oklab,var(--paper) 88%,rgba(255,255,255,.72));box-shadow:0 34px 110px -54px rgba(72,126,176,.38),0 0 0 1px rgba(255,255,255,.7) inset,0 1px 0 rgba(255,255,255,.9) inset;backdrop-filter:blur(22px) saturate(1.14)}
.auth-panel.compact{width:min(520px,100%);max-height:min(78vh,720px);box-shadow:0 28px 82px -48px rgba(72,126,176,.42),0 0 0 1px rgba(255,255,255,.72) inset}
.auth-panel.compact .auth-head{padding:26px 30px 20px}
.auth-panel.compact .auth-tabs{margin:20px 30px 0}
.auth-panel.compact .auth-form{padding:22px 30px 30px}
.auth-panel.compact .model-message{margin:14px 30px 0}
.auth-panel::before{content:'';position:absolute;left:24px;right:24px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 48%,transparent),color-mix(in oklab,var(--accent-2) 28%,transparent),transparent);pointer-events:none}
.auth-panel::after{content:'';position:absolute;right:18px;top:18px;width:7px;height:7px;border-radius:999px;background:var(--accent-2);box-shadow:0 0 18px color-mix(in oklab,var(--accent-2) 70%,transparent);pointer-events:none}
.auth-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:30px 32px 22px;border-bottom:1px solid color-mix(in oklab,var(--line-soft) 72%,transparent)}
.auth-brand{display:flex;flex-direction:column;gap:7px;min-width:0}
.auth-brand strong{font-family:'Source Serif 4','Noto Serif SC',serif;font-size:32px;font-weight:600;letter-spacing:0;color:var(--ink);line-height:1;text-shadow:0 12px 34px rgba(0,0,0,.52)}
.auth-brand span{font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:color-mix(in oklab,var(--accent) 52%,var(--ink-mute))}
.auth-mark{font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);border:1px solid color-mix(in oklab,var(--accent) 25%,var(--line-soft));border-radius:999px;padding:7px 10px;background:color-mix(in oklab,var(--paper-2) 72%,transparent)}
.auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:22px 32px 0;padding:4px;border:1px solid color-mix(in oklab,var(--line-soft) 82%,var(--accent) 7%);border-radius:12px;background:color-mix(in oklab,var(--bg) 46%,transparent)}
.auth-tabs button{min-height:38px;border:0;border-radius:6px;background:transparent;color:var(--ink-mute);cursor:pointer;font-weight:600}
.auth-tabs button.active{background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 20%,var(--paper-2)),color-mix(in oklab,var(--accent-3) 9%,var(--paper-2)));color:var(--ink);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--accent) 34%,var(--line)),0 10px 28px -24px color-mix(in oklab,var(--accent) 64%,transparent)}
.auth-panel .model-message{margin:16px 32px 0}
.auth-form{display:flex;flex-direction:column;gap:14px;padding:24px 32px 32px}
.auth-panel .model-field span{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.auth-panel .model-input{min-height:44px;border-radius:10px;background:rgba(255,255,255,.66);color:#17324A;border-color:color-mix(in oklab,var(--accent) 28%,rgba(85,182,242,.34));font-size:13px;box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 24px -20px rgba(70,128,184,.42)}
.auth-panel .model-input:focus{border-color:color-mix(in oklab,var(--accent) 72%,#fff);background:rgba(255,255,255,.82);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 18%,transparent),inset 0 1px 0 rgba(255,255,255,.9)}
.auth-password-wrap{position:relative;display:flex;align-items:center}
.auth-password-wrap .model-input{width:100%;padding-right:44px}
.auth-password-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:color-mix(in oklab,var(--ink-mute) 72%,var(--accent));cursor:pointer}
.auth-password-toggle:hover:not(:disabled){background:color-mix(in oklab,var(--accent) 12%,transparent);color:var(--ink)}
.auth-password-toggle:focus-visible{outline:2px solid color-mix(in oklab,var(--accent) 60%,transparent);outline-offset:2px}
.auth-password-toggle:disabled{cursor:default;opacity:.45}
.auth-hint{font-style:normal;font-size:11px;color:var(--ink-mute);line-height:1.2}
.auth-grid{display:grid;grid-template-columns:1fr;gap:14px}
.auth-remember-option{min-height:28px;display:flex;align-items:center;gap:8px;color:var(--ink-soft);font-size:12px;line-height:1.2}
.auth-remember-option input{width:14px;height:14px;flex:0 0 14px;margin:0;accent-color:var(--accent);cursor:pointer}
.auth-remember-option input:disabled{cursor:default;opacity:.45}
.auth-remember-option span{font-weight:650;color:var(--ink)}
.auth-remember-option em{font-style:normal;color:var(--ink-mute);font-size:11px}
.auth-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;padding-top:6px}
.auth-actions .home-btn{min-height:40px;border-radius:6px}
.auth-actions .home-btn.primary{min-width:136px;color:#15130E;border-color:color-mix(in oklab,var(--accent) 74%,#F3EEE3);background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 88%,#F3EEE3),color-mix(in oklab,var(--accent-3) 26%,var(--accent)));box-shadow:0 18px 42px -28px color-mix(in oklab,var(--accent) 76%,transparent),inset 0 1px 0 rgba(255,255,255,.32)}
@media (max-width:980px){
  .product-sidebar{width:76px;flex-basis:76px}
  .product-brand .wordmark,.product-nav button .nav-label,.product-nav button .nav-meta{display:none}
  .product-nav button{justify-content:center}
  .product-nav button .nav-index{width:auto;text-align:center;font-size:13px}
  .product-sidefoot{padding:12px 0 0}
  .product-account-button{justify-content:center;padding:8px}
  .product-account-copy{display:none}
  .home-grid,.stat-strip{grid-template-columns:1fr}
  .asset-scopebar,.media-tabbar{grid-template-columns:1fr}
  .asset-library-overview,.asset-library-shell{grid-template-columns:1fr}
  .asset-main-tabs{grid-template-columns:1fr}
  .asset-control-panel{position:static}
  .asset-overview-metrics{grid-template-columns:1fr 1fr}
  .asset-overview-metrics div:first-child{grid-column:1/-1}
  .project-create{grid-template-columns:1fr}
  .project-list,.side-panel{grid-column:1/-1}
  .model-config-layout{grid-template-columns:1fr}
  .category-tabs{overflow-x:auto}
  .add-model-panel,.add-model-panel:has(select),.provider-row,.provider-actions{grid-template-columns:1fr}
  .provider-row,.provider-actions{grid-template-columns:1fr}
  .user-center-layout,.user-two-col{grid-template-columns:1fr}
  .user-login-panel{position:static}
  .user-stat-grid{grid-template-columns:1fr 1fr}
  .user-token-form,.user-token-row{grid-template-columns:1fr}
  .user-token-row .api-model-actions{justify-content:flex-start}
  .auth-gate{align-items:stretch;justify-content:center;padding:14px;background-position:38% center}
  .auth-panel{width:100%;max-height:none}
  .auth-grid{grid-template-columns:1fr}
  .auth-head{align-items:flex-start;flex-direction:column}
  .auth-actions{justify-content:stretch}
  .auth-actions .home-btn{flex:1}
  .launcher-gate{padding:24px}
  .launcher-brand{left:24px;right:24px;top:58px}
  .launcher-brand strong{font-size:32px}
  .launcher-float-card.card-a{left:8%;bottom:15%;width:132px;height:88px}
  .launcher-float-card.card-b{right:6%;top:22%;width:100px;height:124px}
  .launcher-float-card.card-c{display:none}
  .launcher-float-line.line-a{left:5%;top:38%;width:170px}
  .launcher-float-line.line-b{right:5%;bottom:30%;width:180px}
  .launcher-button-core strong{font-size:24px}
  .launcher-account-note{width:calc(100% - 48px);bottom:36px}
}
@media (prefers-reduced-motion:reduce){
  .launcher-start-button,.launcher-button-orbit,.launcher-float-card,.launcher-float-line{animation:none;transition:none}
  .launcher-start-button:hover{transform:none}
}

/* ──────────────────────────────────────────────────────── */
/* SIDEBAR refinements                                      */
/* ──────────────────────────────────────────────────────── */
.product-sidebar{position:relative;padding:18px 14px 16px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 96%,var(--bg)),color-mix(in oklab,var(--paper) 88%,var(--bg)));border-right:0}
.product-sidebar::after{content:'';position:absolute;right:0;top:0;bottom:0;width:1px;background:linear-gradient(180deg,transparent 0%,var(--line) 14%,var(--line) 86%,transparent 100%);pointer-events:none}
.product-brand{align-items:flex-start;gap:12px;height:auto;padding:6px 6px 16px;border-bottom:1px dashed var(--line-soft)}
.product-brand::before{content:'';width:8px;height:8px;border-radius:999px;background:var(--accent);box-shadow:0 0 12px color-mix(in oklab,var(--accent) 70%,transparent);margin-top:6px;flex:0 0 8px}
.product-brand strong{font-family:'Source Serif 4','Noto Serif SC',serif;font-size:18px;letter-spacing:.005em;font-weight:600}
.product-brand span{font-family:var(--font-mono);font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-mute)}
.product-nav{padding:26px 0 14px;gap:2px;position:relative}
.product-nav button{min-height:42px;padding:0 12px;border-radius:6px;gap:12px;font-size:13px;color:var(--ink-mute);transition:color .18s ease,background .18s ease,border-color .18s ease;position:relative;border:1px solid transparent}
.product-nav button .nav-index{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;color:var(--ink-mute);width:18px;flex:0 0 18px;text-align:left}
.product-nav button .nav-label{flex:1;letter-spacing:.02em}
.product-nav button .nav-meta{margin-left:auto;font-size:10px;font-family:var(--font-mono);color:var(--ink-mute);min-width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;padding:0 6px;border-radius:999px;border:1px solid var(--line-soft);background:var(--paper-2)}
.product-nav button:hover{color:var(--ink);background:color-mix(in oklab,var(--paper-2) 80%,transparent)}
.product-nav button:hover .nav-index{color:color-mix(in oklab,var(--accent) 80%,white)}
.product-nav button.active{color:var(--ink);background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 14%,transparent) 0%,transparent 70%);border-color:transparent}
.product-nav button.active::before{content:'';position:absolute;left:-14px;top:9px;bottom:9px;width:2px;background:var(--accent);border-radius:0 2px 2px 0;box-shadow:0 0 12px color-mix(in oklab,var(--accent) 60%,transparent)}
.product-nav button.active .nav-index{color:var(--accent)}
.product-nav button.active .nav-meta{border-color:color-mix(in oklab,var(--accent) 38%,var(--line));color:var(--ink)}
.product-sidefoot{padding:14px 0 4px;border-top:1px solid var(--line-soft);font-family:var(--font-mono);font-size:10.5px;letter-spacing:.12em;line-height:1.7;color:var(--ink-mute);text-transform:uppercase}
.product-sidefoot strong{display:block;font-family:'Source Serif 4','Noto Serif SC',serif;font-style:italic;font-weight:500;font-size:14px;letter-spacing:0;text-transform:none;color:var(--ink-soft);margin-bottom:4px}
.product-sidefoot::before{content:none}
.product-account-button{width:100%;min-height:76px;display:flex;align-items:center;gap:11px;padding:10px;border:1px solid var(--line-soft);border-radius:8px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 84%,transparent),color-mix(in oklab,var(--paper) 92%,transparent));color:var(--ink-soft);cursor:pointer;text-align:left;transition:border-color .18s ease,background .18s ease,color .18s ease,transform .18s ease}
.product-account-button:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 42%,var(--line));background:color-mix(in oklab,var(--accent) 7%,var(--paper))}
.product-account-button.connected{border-color:color-mix(in oklab,var(--accent) 28%,var(--line))}
.product-account-avatar{width:36px;height:36px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 36px;background:var(--accent);color:#031018;font-family:var(--font-display);font-weight:800;font-size:16px;letter-spacing:0;text-transform:none}
.product-account-copy{min-width:0;display:flex;flex-direction:column;gap:2px;line-height:1.25}
.product-account-copy strong{margin:0;color:var(--ink);font-family:'Source Serif 4','Noto Serif SC',serif;font-style:normal;font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.product-account-copy span{color:var(--ink-mute);font-size:10px;letter-spacing:.08em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.product-account-copy em{font-style:normal;color:var(--ink-soft);font-size:11px;letter-spacing:0;text-transform:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (max-width:980px){
  .product-sidefoot{padding:12px 0 0}
  .product-account-button{justify-content:center;padding:8px;min-height:54px}
  .product-account-copy{display:none}
}

/* ──────────────────────────────────────────────────────── */
/* PROJECTS HOME — Minimal cards · Blueprint atmosphere     */
/* ──────────────────────────────────────────────────────── */
.projects-home{padding:72px 64px 80px;position:absolute;inset:0;overflow:auto;display:flex;align-items:flex-start;justify-content:center;background:radial-gradient(ellipse 70% 55% at 14% 6%,color-mix(in oklab,var(--accent) 11%,transparent) 0%,transparent 60%),radial-gradient(ellipse 55% 45% at 88% 96%,color-mix(in oklab,var(--accent) 7%,transparent) 0%,transparent 55%),radial-gradient(ellipse 80% 70% at 50% 45%,color-mix(in oklab,var(--paper) 36%,transparent) 0%,transparent 70%),var(--bg)}
@keyframes hp-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}
@keyframes hp-glow-drift{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(2%,-1%,0) scale(1.04)}}
.hp-arrow{font-style:normal;font-size:14px;line-height:1;font-family:var(--font-mono);font-weight:700}

/* atmospheric background layers */
.hp-bg{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.hp-bg-glow{position:absolute;border-radius:50%;filter:blur(80px);opacity:.55;mix-blend-mode:screen;animation:hp-glow-drift 18s ease-in-out infinite}
.hp-bg-glow-a{top:-12%;left:-8%;width:60%;height:50%;background:radial-gradient(circle at 50% 50%,color-mix(in oklab,var(--accent) 38%,transparent) 0%,transparent 65%)}
.hp-bg-glow-b{bottom:-18%;right:-10%;width:55%;height:55%;background:radial-gradient(circle at 50% 50%,color-mix(in oklab,var(--accent) 22%,transparent) 0%,transparent 70%);animation-delay:-9s;animation-duration:24s}
.hp-bg-grid{position:absolute;inset:0;background-image:radial-gradient(color-mix(in oklab,var(--ink-mute) 32%,transparent) 1px,transparent 1.4px);background-size:32px 32px;background-position:0 0;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 45%,black 0%,transparent 80%);mask-image:radial-gradient(ellipse 70% 60% at 50% 45%,black 0%,transparent 80%);opacity:.5}
.hp-bg-line{position:absolute;top:0;left:8%;right:8%;height:1px;background:linear-gradient(90deg,transparent 0%,color-mix(in oklab,var(--accent) 70%,transparent) 50%,transparent 100%)}

/* corner brackets — drafting marks */
.hp-corner{position:absolute;width:26px;height:26px}
.hp-corner-tl{top:32px;left:32px;border-top:1px solid color-mix(in oklab,var(--accent) 55%,transparent);border-left:1px solid color-mix(in oklab,var(--accent) 55%,transparent)}
.hp-corner-tr{top:32px;right:32px;border-top:1px solid color-mix(in oklab,var(--accent) 55%,transparent);border-right:1px solid color-mix(in oklab,var(--accent) 55%,transparent)}
.hp-corner-bl{bottom:32px;left:32px;border-bottom:1px solid color-mix(in oklab,var(--accent) 35%,transparent);border-left:1px solid color-mix(in oklab,var(--accent) 35%,transparent)}
.hp-corner-br{bottom:32px;right:32px;border-bottom:1px solid color-mix(in oklab,var(--accent) 35%,transparent);border-right:1px solid color-mix(in oklab,var(--accent) 35%,transparent)}

/* projects grid (cards) */
.hp-project-grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,320px));gap:20px;width:100%;max-width:1080px;align-content:start}

.hp-card{position:relative;display:flex;flex-direction:column;border:1px solid color-mix(in oklab,var(--line) 70%,transparent);border-radius:16px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 78%,transparent) 0%,color-mix(in oklab,var(--paper-2) 60%,transparent) 100%);-webkit-backdrop-filter:blur(14px) saturate(125%);backdrop-filter:blur(14px) saturate(125%);overflow:hidden;cursor:pointer;outline:none;transition:transform .3s cubic-bezier(.2,.8,.2,1),border-color .25s ease,box-shadow .35s ease;box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent),0 18px 48px -22px rgba(0,0,0,.55),0 2px 8px -4px rgba(0,0,0,.35)}
.hp-card::before{content:'';position:absolute;inset:0;border-radius:inherit;background:radial-gradient(ellipse 100% 60% at 50% 0%,color-mix(in oklab,var(--accent) 9%,transparent) 0%,transparent 60%);opacity:0;transition:opacity .35s ease;pointer-events:none}
.hp-card:hover{transform:translateY(-3px);border-color:color-mix(in oklab,var(--accent) 45%,var(--line));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 9%,transparent),0 28px 60px -22px rgba(0,0,0,.7),0 0 90px -28px color-mix(in oklab,var(--accent) 70%,transparent),0 0 0 1px color-mix(in oklab,var(--accent) 18%,transparent)}
.hp-card:hover::before{opacity:1}
.hp-card:focus-visible{border-color:color-mix(in oklab,var(--accent) 60%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 22%,transparent),inset 0 1px 0 color-mix(in oklab,var(--ink) 9%,transparent)}

/* project card */
.hp-card-project{padding:18px 20px 16px;min-height:300px}
.hp-card-project.is-current{border-color:color-mix(in oklab,var(--accent) 45%,var(--line));background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 6%,var(--paper)) 0%,color-mix(in oklab,var(--paper) 75%,transparent) 100%);box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 9%,transparent),0 22px 56px -22px rgba(0,0,0,.6),0 0 70px -28px color-mix(in oklab,var(--accent) 70%,transparent),0 0 0 1px color-mix(in oklab,var(--accent) 20%,transparent)}
.hp-card-status-idle{color:var(--ink-mute);border-color:var(--line-soft);background:transparent;opacity:.85}
.hp-card-del{position:absolute;top:14px;right:14px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line-soft);border-radius:999px;background:color-mix(in oklab,var(--paper-2) 70%,transparent);color:var(--ink-mute);cursor:pointer;opacity:0;transform:scale(.92);transition:opacity .2s ease,color .2s ease,border-color .2s ease,transform .2s ease,background .2s ease;z-index:3;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.hp-card-project:hover .hp-card-del,.hp-card-project:focus-within .hp-card-del{opacity:1;transform:scale(1)}
.hp-card-del:hover{color:#fca5a5;border-color:color-mix(in oklab,#ef4444 50%,var(--line));background:color-mix(in oklab,#ef4444 12%,var(--paper-2))}
.hp-card-project.is-current .hp-card-del{top:14px;right:14px}
.hp-card-project.is-current:hover{transform:translateY(-3px)}
.hp-card-head{display:flex;align-items:center;justify-content:space-between}
.hp-card-no{font-family:'Source Serif 4',serif;font-style:italic;font-weight:600;font-size:32px;color:var(--accent);letter-spacing:-.02em;line-height:1;font-feature-settings:'tnum' 1}
.hp-card-status{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-mute);padding:4px 9px;border:1px solid var(--line-soft);border-radius:999px;background:color-mix(in oklab,var(--paper-2) 80%,transparent);transition:opacity .2s ease,transform .2s ease}
.hp-card-project:hover .hp-card-status{opacity:0;transform:translateX(8px);pointer-events:none}
.hp-card-dot{width:5px;height:5px;border-radius:999px;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:hp-pulse 1.6s ease-in-out infinite}

.hp-card-glyph-wrap{margin:14px 0 18px;height:90px;border:1px dashed color-mix(in oklab,var(--line) 80%,transparent);border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 5%,transparent),transparent);display:flex;align-items:center;justify-content:center;color:var(--accent);overflow:hidden;position:relative;transition:border-color .3s ease,background .3s ease}
.hp-card-glyph-wrap::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,color-mix(in oklab,var(--accent) 20%,transparent) 0%,transparent 65%);opacity:0;transition:opacity .35s ease;pointer-events:none}
.hp-card-project:hover .hp-card-glyph-wrap{border-color:color-mix(in oklab,var(--accent) 55%,transparent);background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 11%,transparent),transparent)}
.hp-card-project:hover .hp-card-glyph-wrap::after{opacity:1}
.hp-card-glyph{width:100%;height:100%;color:var(--accent)}

.hp-card-body{flex:1;display:flex;flex-direction:column;gap:8px}
.hp-card-title{margin:0;font-family:'Source Serif 4','Noto Serif SC',serif;font-size:24px;font-weight:500;letter-spacing:-.005em;color:var(--ink);line-height:1.18;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hp-card-sub{margin:0;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute)}
.hp-card-stats{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-mono);margin-top:6px}
.hp-card-stats span{font-size:14px;font-weight:600;color:var(--ink);font-feature-settings:'tnum' 1;display:inline-flex;align-items:baseline}
.hp-card-stats em{font-style:normal;color:var(--ink-mute);font-size:9.5px;margin-left:3px;letter-spacing:.18em}
.hp-card-stat-divider{width:1px;height:10px;background:var(--line-soft)}

.hp-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:14px;border-top:1px solid var(--line-soft);font-family:var(--font-mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-mute);transition:color .2s ease}
.hp-card-actions{gap:6px;justify-content:stretch;letter-spacing:0;text-transform:none}
.hp-card-action{appearance:none;min-width:0;height:28px;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid color-mix(in oklab,var(--line-soft) 84%,transparent);border-radius:7px;background:color-mix(in oklab,var(--paper-2) 52%,transparent);color:var(--ink-mute);padding:0 9px;font-family:var(--font-body);font-size:11px;font-weight:650;cursor:pointer;transition:transform .16s ease,border-color .18s ease,color .18s ease,background .18s ease}
.hp-card-action:hover{transform:translateY(-1px);border-color:color-mix(in oklab,var(--accent) 38%,var(--line));color:var(--ink);background:color-mix(in oklab,var(--accent) 7%,var(--paper-2))}
.hp-card-action:disabled{cursor:not-allowed;opacity:.58;transform:none}
.hp-card-action.primary{flex:1;justify-content:space-between;color:var(--accent);background:color-mix(in oklab,var(--accent) 8%,var(--paper-2))}
.hp-card-action.danger{color:#fca5a5;border-color:color-mix(in oklab,#ef4444 24%,var(--line-soft));background:color-mix(in oklab,#ef4444 7%,var(--paper-2))}
.hp-card-action.danger:hover{border-color:color-mix(in oklab,#ef4444 52%,var(--line));background:color-mix(in oklab,#ef4444 13%,var(--paper-2))}
.hp-card-action svg{flex:0 0 auto;width:12px;height:12px}
.hp-card-project:hover .hp-card-foot{color:var(--accent)}
.hp-card-foot .hp-arrow{transition:transform .25s cubic-bezier(.2,.8,.2,1)}
.hp-card-project:hover .hp-card-foot .hp-arrow{transform:translateX(4px)}

/* create new card (entry → opens modal) */
.hp-card-create{padding:0;border-style:dashed;background:color-mix(in oklab,var(--paper) 50%,transparent)}
.hp-card-create:hover{background:color-mix(in oklab,var(--accent) 5%,var(--paper));border-style:solid;transform:translateY(-2px)}
.hp-card-create-btn{appearance:none;border:0;background:transparent;color:var(--ink-mute);width:100%;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:32px;cursor:pointer;font-family:var(--font-body);transition:color .2s ease}
.hp-card-create-btn:hover{color:var(--ink)}
.hp-card-plus{width:52px;height:52px;border-radius:999px;border:1px solid color-mix(in oklab,var(--line) 80%,transparent);display:flex;align-items:center;justify-content:center;font-family:'Source Serif 4',serif;font-weight:300;font-size:34px;color:var(--ink-mute);transition:all .25s cubic-bezier(.2,.8,.2,1);line-height:1;padding-bottom:4px}
.hp-card-create:hover .hp-card-plus{border-color:var(--accent);color:var(--accent);box-shadow:0 0 28px color-mix(in oklab,var(--accent) 30%,transparent);transform:rotate(90deg)}
.hp-card-create-label{font-family:'Source Serif 4','Noto Serif SC',serif;font-size:18px;font-weight:500;letter-spacing:-.005em;color:var(--ink-soft)}
.hp-card-create:hover .hp-card-create-label{color:var(--ink)}

/* ──────────────────────────────────────────────────────── */
/* MODAL — new project dialog                               */
/* ──────────────────────────────────────────────────────── */
.hp-modal-backdrop{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:28px;background:radial-gradient(ellipse at center,rgba(10,11,13,.55),rgba(10,11,13,.86));-webkit-backdrop-filter:blur(14px) saturate(120%);backdrop-filter:blur(14px) saturate(120%);animation:hp-modal-fade .25s cubic-bezier(.2,.8,.2,1)}
.has-window-chrome .hp-modal-backdrop{top:38px;bottom:auto;height:calc(100% - 38px)}
@keyframes hp-modal-fade{from{opacity:0}to{opacity:1}}
@keyframes hp-modal-pop{from{transform:translateY(8px) scale(.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}

.hp-modal{position:relative;width:100%;max-width:480px;padding:30px 30px 24px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:18px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 92%,transparent) 0%,color-mix(in oklab,var(--paper-2) 80%,transparent) 100%);-webkit-backdrop-filter:blur(20px) saturate(125%);backdrop-filter:blur(20px) saturate(125%);box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 9%,transparent),0 28px 80px -28px rgba(0,0,0,.7),0 0 140px -50px color-mix(in oklab,var(--accent) 70%,transparent),0 0 0 1px color-mix(in oklab,var(--accent) 14%,transparent);animation:hp-modal-pop .35s cubic-bezier(.2,.8,.2,1) backwards}
.hp-modal::before{content:'';position:absolute;top:0;left:14%;right:14%;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 80%,transparent),transparent);pointer-events:none}

.hp-modal-close{position:absolute;top:14px;right:14px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line-soft);border-radius:999px;background:color-mix(in oklab,var(--paper-2) 70%,transparent);color:var(--ink-mute);cursor:pointer;font-family:var(--font-mono);font-size:13px;line-height:1;transition:all .25s cubic-bezier(.2,.8,.2,1)}
.hp-modal-close:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 50%,var(--line));transform:rotate(90deg)}

.hp-modal-tag{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:color-mix(in oklab,var(--accent) 95%,white);padding:5px 11px 5px 9px;border:1px solid color-mix(in oklab,var(--accent) 40%,var(--line));border-radius:999px;background:color-mix(in oklab,var(--accent) 8%,transparent)}
.hp-modal-tag-dot{width:5px;height:5px;border-radius:999px;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:hp-pulse 1.6s ease-in-out infinite}

.hp-modal-title{margin:18px 0 6px;font-family:'Source Serif 4','Noto Serif SC',serif;font-size:30px;font-weight:500;letter-spacing:-.01em;color:var(--ink);line-height:1.15}
.hp-modal-sub{margin:0 0 24px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute)}

.hp-modal-form{display:flex;flex-direction:column;gap:24px}
.hp-modal-field{display:flex;flex-direction:column;gap:8px}
.hp-modal-field-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-mute)}
.hp-modal-input{appearance:none;width:100%;border:0;border-bottom:1px solid color-mix(in oklab,var(--line) 90%,transparent);background:transparent;color:var(--ink);font-family:'Source Serif 4','Noto Serif SC',serif;font-size:22px;letter-spacing:-.005em;padding:6px 0 12px;outline:none;transition:border-color .2s ease,box-shadow .2s ease}
.hp-modal-input::placeholder{color:var(--ink-mute);font-style:italic;font-weight:400}
.hp-modal-input:focus{border-bottom-color:var(--accent);box-shadow:0 1px 0 0 var(--accent)}

.hp-modal-actions{display:flex;gap:10px;justify-content:flex-end}
.hp-modal-btn{appearance:none;min-height:40px;display:inline-flex;align-items:center;gap:10px;padding:0 18px;border:1px solid var(--line);border-radius:999px;background:color-mix(in oklab,var(--paper) 60%,transparent);color:var(--ink-soft);font-family:var(--font-body);font-size:13px;font-weight:500;letter-spacing:.04em;cursor:pointer;transition:all .18s ease}
.hp-modal-btn:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 40%,var(--line));background:color-mix(in oklab,var(--paper) 80%,transparent)}
.hp-modal-btn.primary{background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent) 70%,white));border-color:transparent;color:#031018;font-weight:700;box-shadow:0 8px 24px -10px color-mix(in oklab,var(--accent) 75%,transparent),inset 0 1px 0 rgba(255,255,255,.35)}
.hp-modal-btn.primary:hover{transform:translateY(-1px);box-shadow:0 12px 32px -10px color-mix(in oklab,var(--accent) 85%,transparent),inset 0 1px 0 rgba(255,255,255,.45)}
.hp-modal-kbd{font-style:normal;font-family:var(--font-mono);font-size:9.5px;letter-spacing:.08em;padding:2px 6px;border-radius:4px;border:1px solid currentColor;opacity:.55;line-height:1.3}
.hp-modal-btn.primary .hp-modal-kbd{border-color:rgba(3,16,24,.4);opacity:.7}

/* PROJECT SETTINGS */
.settings-page{background:var(--bg);align-items:flex-start}
.settings-shell{max-width:980px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:18px;padding-top:18px}
.settings-head{display:flex;flex-direction:column;gap:8px;padding:0}
.settings-head h1{margin:0;font-size:30px;letter-spacing:0;line-height:1.12}
.settings-storage-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid var(--line);border-radius:8px;background:color-mix(in oklab,var(--paper) 88%,transparent);padding:22px}
.settings-folder-mark{width:58px;height:58px;border-radius:8px;border:1px solid color-mix(in oklab,var(--accent) 30%,var(--line));background:color-mix(in oklab,var(--accent) 12%,transparent);color:var(--accent);display:grid;place-items:center}
.settings-storage-main{min-width:0;display:flex;flex-direction:column;gap:8px}
.settings-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.settings-storage-main p{margin:0;color:var(--ink);font-family:var(--font-mono);font-size:13px;line-height:1.55;word-break:break-all}
.settings-path-input{width:100%;min-height:42px;border:1px solid var(--line);border-radius:8px;background:color-mix(in oklab,var(--bg) 74%,transparent);color:var(--ink);padding:0 12px;font-family:var(--font-mono);font-size:12px;outline:none}
.settings-path-input:focus{border-color:color-mix(in oklab,var(--accent) 55%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 12%,transparent)}
.settings-storage-main small{font-size:11px;line-height:1.45}
.settings-path-ok{color:color-mix(in oklab,var(--accent) 80%,white)}
.settings-path-warn{color:var(--ink-mute)}
.settings-folder-button{appearance:none;min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:9px;border:1px solid transparent;border-radius:8px;background:var(--accent);color:#031018;padding:0 18px;font-family:var(--font-body);font-size:13px;font-weight:800;letter-spacing:0;white-space:nowrap;cursor:pointer;transition:transform .16s ease,filter .16s ease,opacity .16s ease}
.settings-folder-button.ghost{border-color:var(--line);background:color-mix(in oklab,var(--paper) 60%,transparent);color:var(--ink-soft);font-weight:700}
.settings-folder-button.ghost:hover:not(:disabled){color:var(--ink);border-color:color-mix(in oklab,var(--accent) 45%,var(--line))}
.settings-folder-button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.04)}
.settings-folder-button:focus-visible{outline:2px solid color-mix(in oklab,var(--accent) 55%,white);outline-offset:3px}
.settings-folder-button:disabled{opacity:.58;cursor:not-allowed}
.settings-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}

/* responsive */
@media (max-width:1100px){
  .projects-home{padding:48px 36px 60px}
}
@media (max-width:900px){.settings-storage-card{grid-template-columns:1fr;align-items:start}.settings-folder-mark{width:52px;height:52px}.settings-folder-button{width:100%}.settings-actions{width:100%;display:grid;grid-template-columns:1fr}}
@media (max-width:820px){
  .projects-home{padding:32px 20px 40px}
  .hp-project-grid{grid-template-columns:1fr;max-width:none}
  .hp-modal{padding:24px 22px 20px}
  .hp-modal-title{font-size:24px}
  .hp-modal-actions{flex-direction:column-reverse}
  .hp-modal-btn{justify-content:center;width:100%}
}

/* ═══════════════════════════════════════════════════════════════════
 * USER CENTER — mission-control redesign (.uc-*)
 * Replaces the flat 2-col .user-center-layout with a hero balance card,
 * status pill row, and key-grid + sticky aside. All NewApiStore handlers
 * remain identical; only the JSX shell + chrome changed.
 * ═══════════════════════════════════════════════════════════════════ */
.uc-shell{position:relative;padding:36px 40px 60px;display:flex;flex-direction:column;gap:22px;min-height:100%;background:var(--bg)}
.uc-shell::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(color-mix(in oklab,var(--line) 18%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--line) 14%,transparent) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,black,transparent 80%);-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,black,transparent 80%);opacity:.55}
.uc-shell > *{position:relative;z-index:1}
.uc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:28px;flex-wrap:wrap}
.uc-head-left{display:flex;flex-direction:column;gap:10px;min-width:0;max-width:60%}
.uc-eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.22em;color:var(--ink-mute)}
.uc-eyebrow::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px color-mix(in oklab,var(--accent) 22%,transparent);animation:uc-pulse 2.4s ease-in-out infinite}
.uc-shell h1{margin:0;font-family:'Source Serif 4','Noto Serif SC',var(--font-display),serif;font-size:38px;line-height:1;font-weight:600;letter-spacing:-.01em;color:var(--ink)}
.uc-tagline{margin:0;color:var(--ink-mute);font-size:13px;line-height:1.5;max-width:60ch}
.uc-head-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.uc-banner{padding:10px 16px;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));background:color-mix(in oklab,var(--accent) 4%,var(--paper));border-radius:8px;font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);letter-spacing:.04em;display:inline-flex;align-items:center;gap:10px;width:fit-content}
.uc-banner.warn{border-color:color-mix(in oklab,var(--accent-2,#FF6B6B) 32%,var(--line));background:color-mix(in oklab,var(--accent-2,#FF6B6B) 4%,var(--paper));color:var(--ink)}
.uc-banner .uc-banner-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 24%,transparent)}
.uc-banner.warn .uc-banner-dot{background:var(--accent-2,#FF6B6B);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent-2,#FF6B6B) 18%,transparent)}

/* HERO balance card */
.uc-hero{position:relative;overflow:hidden;border-radius:16px;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));background:radial-gradient(ellipse 50% 80% at 100% 0%,color-mix(in oklab,var(--accent) 16%,transparent) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 0% 100%,color-mix(in oklab,var(--accent-2,#FF6B6B) 8%,transparent) 0%,transparent 70%),linear-gradient(150deg,var(--paper) 0%,color-mix(in oklab,var(--paper) 70%,var(--bg)) 100%);box-shadow:0 20px 60px -28px color-mix(in oklab,var(--accent) 40%,rgba(0,0,0,.6)),inset 0 1px 0 color-mix(in oklab,var(--ink) 8%,transparent);padding:32px 36px;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:36px;align-items:center}
.uc-hero::after{content:"";position:absolute;right:-120px;top:-120px;width:320px;height:320px;background:conic-gradient(from 220deg,transparent 0%,color-mix(in oklab,var(--accent) 18%,transparent) 30%,transparent 60%);border-radius:50%;opacity:.4;pointer-events:none;filter:blur(8px)}
.uc-hero-main{position:relative;z-index:1}
.uc-hero-label{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:var(--ink-mute)}
.uc-hero-num{font-family:var(--font-display);font-variant-numeric:tabular-nums;font-size:clamp(48px,7vw,84px);font-weight:700;letter-spacing:-.04em;line-height:.92;margin:18px 0 0;color:var(--ink);display:flex;align-items:baseline;gap:16px;flex-wrap:wrap}
.uc-hero-num .unit{font-family:var(--font-mono);font-size:13px;font-weight:500;letter-spacing:.04em;color:var(--ink-mute)}
.uc-hero-num .dim{color:var(--ink-mute);opacity:.6}
.uc-hero-meter{margin-top:24px;display:flex;flex-direction:column;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.uc-hero-meter-bar{height:6px;border-radius:3px;background:color-mix(in oklab,var(--ink) 6%,var(--paper-2));overflow:hidden;position:relative}
.uc-hero-meter-fill{height:100%;background:linear-gradient(90deg,var(--accent),color-mix(in oklab,var(--accent) 50%,white));box-shadow:0 0 12px color-mix(in oklab,var(--accent) 60%,transparent);border-radius:3px;transition:width .35s ease-out}
.uc-hero-meter-line{display:flex;justify-content:space-between;gap:8px}
.uc-hero-meta{display:flex;flex-direction:column;gap:12px;min-width:0;position:relative;z-index:1}
.uc-hero-meta-item{display:flex;flex-direction:column;gap:6px;padding:14px 16px;border:1px solid color-mix(in oklab,var(--line) 70%,transparent);border-radius:10px;background:color-mix(in oklab,var(--bg) 30%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.uc-hero-meta-item span{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.uc-hero-meta-item strong{font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* Status pill row */
.uc-status-row{display:flex;flex-wrap:wrap;gap:8px}
.uc-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:var(--paper);border:1px solid var(--line-soft);border-radius:999px;font-family:var(--font-mono);font-size:11px;letter-spacing:.04em;color:var(--ink-soft)}
.uc-pill .uc-dot{width:7px;height:7px;border-radius:50%;background:var(--ink-mute);transition:box-shadow .25s}
.uc-pill.ok{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 30%,var(--line))}
.uc-pill.ok .uc-dot{background:var(--accent);box-shadow:0 0 0 4px color-mix(in oklab,var(--accent) 22%,transparent)}
.uc-pill.warn{color:var(--ink);border-color:color-mix(in oklab,var(--accent-2,#FF6B6B) 30%,var(--line))}
.uc-pill.warn .uc-dot{background:var(--accent-2,#FF6B6B);box-shadow:0 0 0 4px color-mix(in oklab,var(--accent-2,#FF6B6B) 18%,transparent)}

/* Body grid */
.uc-body{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:22px;align-items:start}
.uc-main{display:flex;flex-direction:column;gap:22px;min-width:0}
.uc-aside{display:flex;flex-direction:column;gap:18px;position:sticky;top:28px}

/* Generic card */
.uc-card{background:var(--paper);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.uc-card-head{padding:16px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--line-soft)}
.uc-card-head .uc-icn{width:32px;height:32px;border-radius:8px;background:color-mix(in oklab,var(--accent) 12%,var(--paper-2));color:var(--accent);display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.uc-card-head h2{margin:0;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:var(--ink-soft);font-weight:600}
.uc-card-head .uc-badge{margin-left:auto;padding:4px 10px;background:var(--paper-2);border:1px solid var(--line-soft);border-radius:999px;font-size:10px;font-family:var(--font-mono);color:var(--ink-mute);letter-spacing:.1em}
.uc-card-body{padding:18px 20px}

/* Login hero (when not connected) */
.uc-login-hero{padding:32px 32px 32px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:36px;align-items:start}
.uc-login-pitch h3{margin:8px 0 14px;font-family:'Source Serif 4',var(--font-display),serif;font-size:24px;font-weight:600;color:var(--ink);letter-spacing:-.01em}
.uc-login-pitch p{margin:0;font-size:13px;color:var(--ink-mute);line-height:1.6}
.uc-login-bullets{margin:18px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.uc-login-bullets li{display:flex;align-items:flex-start;gap:10px;font-size:12px;color:var(--ink-soft);line-height:1.5}
.uc-login-bullets li::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--accent);margin-top:8px;flex:0 0 auto;box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 22%,transparent)}
.uc-login-form{display:flex;flex-direction:column;gap:12px;padding:22px;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));border-radius:12px;background:color-mix(in oklab,var(--bg) 35%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.uc-login-form .model-field span{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.uc-login-form .model-input{min-height:38px;border-radius:8px}
.uc-login-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.uc-login-actions .home-btn{flex:1;min-width:110px}

/* Account compact card (when connected) */
.uc-acct-card{display:flex;flex-direction:column;gap:14px;padding:18px 20px}
.uc-acct-head{display:flex;align-items:center;gap:14px}
.uc-acct-avatar{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--accent) 0%,color-mix(in oklab,var(--accent) 50%,#7A5BFF) 100%);color:var(--paper);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:18px;box-shadow:0 6px 20px -8px color-mix(in oklab,var(--accent) 60%,transparent);flex:0 0 auto}
.uc-acct-head .name{font-size:15px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis}
.uc-acct-head .id{font-family:var(--font-mono);font-size:11px;color:var(--ink-mute);margin-top:2px;overflow:hidden;text-overflow:ellipsis}
.uc-acct-rows{display:flex;flex-direction:column;gap:10px}
.uc-acct-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;background:var(--paper-2);border:1px solid var(--line-soft);border-radius:8px;font-size:12px}
.uc-acct-row .k{color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;flex:0 0 auto}
.uc-acct-row .v{color:var(--ink);font-family:var(--font-mono);font-size:12px;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}
.uc-acct-actions{display:flex;gap:8px}
.uc-acct-actions .home-btn{flex:1;min-height:34px}

/* API Key cards */
.uc-key-list{display:flex;flex-direction:column;gap:10px;padding:16px 20px 20px}
.uc-key-card{position:relative;padding:16px 18px;background:var(--paper-2);border:1px solid var(--line-soft);border-radius:12px;display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:14px;align-items:center;transition:border-color .15s,transform .15s,box-shadow .15s}
.uc-key-card:hover{border-color:color-mix(in oklab,var(--accent) 36%,var(--line));transform:translateY(-1px)}
.uc-key-card.default{border-color:color-mix(in oklab,var(--accent) 50%,var(--line));background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 6%,var(--paper-2)) 0%,var(--paper-2) 50%);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--accent) 18%,transparent)}
.uc-key-card.default::before{content:"默认";position:absolute;top:-7px;left:14px;padding:1px 8px;background:var(--accent);color:var(--paper);font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.14em;border-radius:3px}
.uc-key-icn{width:36px;height:36px;border-radius:10px;background:color-mix(in oklab,var(--accent) 12%,var(--bg));color:var(--accent);display:flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line))}
.uc-key-info{min-width:0}
.uc-key-name{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uc-key-meta{font-family:var(--font-mono);font-size:11px;color:var(--ink-mute);display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;margin-bottom:8px}
.uc-key-meta .sep{width:3px;height:3px;border-radius:50%;background:var(--ink-mute);opacity:.5}
.uc-key-status{color:var(--accent)}
.uc-key-status.bad{color:var(--accent-2,#FF6B6B)}
.uc-key-meter-track{height:4px;border-radius:2px;background:color-mix(in oklab,var(--ink) 8%,var(--bg));overflow:hidden;position:relative;margin-bottom:4px}
.uc-key-meter-fill{height:100%;background:linear-gradient(90deg,var(--accent),color-mix(in oklab,var(--accent) 60%,white));border-radius:2px;transition:width .35s ease-out}
.uc-key-quotaline{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);display:flex;justify-content:space-between;gap:8px}
.uc-key-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.uc-key-actions .home-btn{min-height:30px;padding:0 10px;font-size:11px}

/* Create-key form */
.uc-key-form{display:grid;grid-template-columns:minmax(140px,1fr) minmax(110px,.8fr) minmax(180px,1.2fr) auto auto auto;gap:8px;align-items:center;padding:14px 20px;border-bottom:1px solid var(--line-soft);background:color-mix(in oklab,var(--bg) 25%,var(--paper))}
.uc-key-form input,.uc-key-form select{min-height:36px}
.uc-key-form .uc-key-form-switch{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-family:var(--font-mono);letter-spacing:.06em;color:var(--ink-mute)}

/* Models chip wall */
.uc-model-wall{display:flex;flex-wrap:wrap;gap:6px;padding:16px 20px;max-height:240px;overflow:auto}
.uc-model-chip{display:inline-flex;align-items:center;padding:4px 10px;background:color-mix(in oklab,var(--bg) 20%,var(--paper-2));border:1px solid var(--line-soft);border-radius:6px;font-family:var(--font-mono);font-size:10px;color:var(--ink-soft);letter-spacing:.02em;transition:color .12s,border-color .12s}
.uc-model-chip:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 32%,var(--line))}
.uc-model-empty{padding:36px 20px;text-align:center;color:var(--ink-mute);font-size:12px;font-family:var(--font-mono);letter-spacing:.04em}

/* Redeem card */
.uc-redeem{padding:22px 20px;background:radial-gradient(ellipse 80% 60% at 100% 50%,color-mix(in oklab,var(--accent) 8%,transparent),transparent 70%),var(--paper)}
.uc-redeem h3{margin:0 0 6px;font-family:'Source Serif 4',var(--font-display),serif;font-size:18px;color:var(--ink);font-weight:600}
.uc-redeem p{margin:0 0 14px;font-size:12px;color:var(--ink-mute);line-height:1.5}
.uc-redeem-form{display:flex;gap:8px}
.uc-redeem-form input{flex:1;min-height:38px;padding:0 12px;background:var(--paper-2);border:1px solid var(--line);border-radius:8px;font-family:var(--font-mono);font-size:13px;color:var(--ink);outline:none}
.uc-redeem-form input:focus{border-color:var(--accent)}

/* Animations */
@keyframes uc-pulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes uc-fade-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.uc-shell .uc-hero,.uc-shell .uc-status-row,.uc-shell .uc-banner{animation:uc-fade-up .42s ease-out both}
.uc-shell .uc-status-row{animation-delay:.05s}
.uc-shell .uc-body{animation:uc-fade-up .42s ease-out .12s both}

/* Responsive */
@media (max-width:1180px){
  .uc-body{grid-template-columns:1fr}
  .uc-aside{position:static}
  .uc-hero{grid-template-columns:1fr}
  .uc-login-hero{grid-template-columns:1fr;gap:22px}
  .uc-key-form{grid-template-columns:1fr 1fr}
  .uc-head-left{max-width:100%}
}
@media (max-width:720px){
  .uc-shell{padding:22px 18px 40px}
  .uc-shell h1{font-size:30px}
  .uc-key-card{grid-template-columns:36px minmax(0,1fr)}
  .uc-key-actions{grid-column:1 / -1;justify-content:flex-start;margin-top:6px}
  .uc-key-form{grid-template-columns:1fr}
  .uc-hero{padding:24px 22px}
}

/* ═══════════════════════════════════════════════════════════════════
 * USER CENTER — compact SaaS dashboard refinement.
 * Replaces the hero giant-number with a 3-stat KPI strip; adds dedicated
 * model-pricing column. All content must respect min-width:0 to never
 * overflow the viewport.
 * ═══════════════════════════════════════════════════════════════════ */
.uc-shell.uc-v2{padding:32px 36px 60px;max-width:1640px;margin:0 auto;width:100%;box-sizing:border-box}
.uc-shell.uc-v2 h1{font-size:28px}
.uc-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;width:100%;min-width:0}
.uc-stat{padding:18px 20px;background:var(--paper);border:1px solid var(--line);border-radius:12px;min-width:0;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden}
.uc-stat.primary{border-color:color-mix(in oklab,var(--accent) 32%,var(--line));background:radial-gradient(ellipse 80% 100% at 100% 0%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 60%),var(--paper);box-shadow:0 12px 32px -20px color-mix(in oklab,var(--accent) 50%,transparent)}
.uc-stat .label{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute);display:flex;align-items:center;gap:6px}
.uc-stat .value{font-family:var(--font-display);font-size:30px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em;color:var(--ink);line-height:1.05;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;overflow:hidden;text-overflow:ellipsis}
.uc-stat .value .sub{font-family:var(--font-mono);font-size:11px;font-weight:500;color:var(--ink-mute);letter-spacing:0;white-space:nowrap}
.uc-stat .meter{height:4px;background:color-mix(in oklab,var(--ink) 6%,var(--paper-2));border-radius:2px;overflow:hidden}
.uc-stat .meter-fill{height:100%;background:linear-gradient(90deg,var(--accent),color-mix(in oklab,var(--accent) 50%,white));border-radius:2px;transition:width .35s}
.uc-stat .hint{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);display:flex;justify-content:space-between;gap:8px}
.uc-stat .hint strong{color:var(--ink-soft);font-weight:600}

/* 3-column body */
.uc-3col{display:grid;grid-template-columns:280px minmax(0,1fr) 320px;gap:18px;align-items:start;width:100%;min-width:0}
.uc-3col > *{min-width:0}
.uc-aside-l{display:flex;flex-direction:column;gap:14px;position:sticky;top:24px}
.uc-main-c{display:flex;flex-direction:column;gap:14px;min-width:0}
.uc-aside-r{display:flex;flex-direction:column;gap:14px;position:sticky;top:24px}

/* Model list (right column) */
.uc-model-list{display:flex;flex-direction:column}
.uc-model-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 18px;border-bottom:1px solid var(--line-soft);font-size:12px;min-width:0}
.uc-model-row:last-child{border-bottom:0}
.uc-model-row .kind{display:inline-flex;align-items:center;justify-content:center;min-width:38px;padding:0 8px;height:22px;border-radius:5px;font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;color:var(--ink);background:color-mix(in oklab,var(--accent) 12%,var(--paper-2));border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line))}
.uc-model-row .kind.video{background:color-mix(in oklab,var(--accent-2,#FF6B6B) 12%,var(--paper-2));border-color:color-mix(in oklab,var(--accent-2,#FF6B6B) 22%,var(--line))}
.uc-model-row .name{font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
.uc-model-row .price{font-family:var(--font-mono);font-size:11px;color:var(--accent);font-weight:600;white-space:nowrap}
.uc-coming{padding:36px 22px 32px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px}
.uc-coming .badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:color-mix(in oklab,var(--accent) 10%,var(--paper-2));border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.uc-coming h4{margin:6px 0 0;font-family:'Source Serif 4','Noto Serif SC',var(--font-display),serif;font-size:17px;font-weight:600;color:var(--ink)}
.uc-coming p{margin:0;font-size:11px;color:var(--ink-mute);line-height:1.6;max-width:240px}
.uc-coming .home-btn{margin-top:8px}

/* Compact account block (sidebar) */
.uc-acct-mini{padding:18px 18px 16px;display:flex;flex-direction:column;gap:14px}
.uc-acct-mini .top{display:flex;align-items:center;gap:12px;min-width:0}
.uc-acct-mini .avatar{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--accent) 0%,color-mix(in oklab,var(--accent) 50%,#7A5BFF) 100%);color:var(--paper);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:16px;flex:0 0 auto;box-shadow:0 6px 18px -8px color-mix(in oklab,var(--accent) 60%,transparent)}
.uc-acct-mini .info{min-width:0;flex:1}
.uc-acct-mini .info .nm{font-size:14px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uc-acct-mini .info .id{font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}
.uc-acct-mini .rows{display:flex;flex-direction:column;gap:6px}
.uc-acct-mini .row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 10px;background:var(--paper-2);border:1px solid var(--line-soft);border-radius:6px;font-size:11px;min-width:0}
.uc-acct-mini .row .k{color:var(--ink-mute);font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;flex:0 0 auto}
.uc-acct-mini .row .v{color:var(--ink);font-family:var(--font-mono);font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;min-width:0}
.uc-acct-mini .acts{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.uc-acct-mini .acts .home-btn{min-height:32px;padding:0 8px;font-size:11px}

/* Compact redeem block */
.uc-redeem-mini{padding:18px 18px 18px;background:radial-gradient(ellipse 80% 60% at 100% 0%,color-mix(in oklab,var(--accent) 8%,transparent),transparent 70%),var(--paper)}
.uc-redeem-mini h4{margin:0 0 4px;font-family:'Source Serif 4',var(--font-display),serif;font-size:15px;color:var(--ink);font-weight:600}
.uc-redeem-mini p{margin:0 0 12px;font-size:11px;color:var(--ink-mute);line-height:1.5}
.uc-redeem-mini form{display:flex;gap:6px}
.uc-redeem-mini input{flex:1;min-width:0;min-height:34px;padding:0 10px;background:var(--paper-2);border:1px solid var(--line);border-radius:6px;font-family:var(--font-mono);font-size:12px;color:var(--ink);outline:none}
.uc-redeem-mini input:focus{border-color:var(--accent)}
.uc-redeem-mini .home-btn{min-height:34px;padding:0 12px;font-size:11px}

/* Tighter key card for narrower main column */
.uc-v2 .uc-key-card{grid-template-columns:32px minmax(0,1fr) auto;padding:14px 16px;gap:12px}
.uc-v2 .uc-key-icn{width:32px;height:32px;border-radius:8px}
.uc-v2 .uc-key-name{font-size:13px}
.uc-v2 .uc-key-form{grid-template-columns:minmax(120px,1fr) minmax(90px,.7fr) minmax(140px,1fr) auto auto auto;padding:12px 16px}
.uc-v2 .uc-key-list{padding:14px 16px 16px}

@media (max-width:1380px){
  .uc-3col{grid-template-columns:260px minmax(0,1fr)}
  .uc-3col .uc-aside-r{grid-column:1 / -1;flex-direction:row;flex-wrap:wrap;position:static}
  .uc-3col .uc-aside-r > *{flex:1;min-width:280px}
}
@media (max-width:980px){
  .uc-3col{grid-template-columns:1fr}
  .uc-aside-l,.uc-aside-r{position:static}
  .uc-3col .uc-aside-r{flex-direction:column}
  .uc-stats{grid-template-columns:1fr 1fr}
}
@media (max-width:640px){
  .uc-shell.uc-v2{padding:22px 16px 40px}
  .uc-stats{grid-template-columns:1fr}
  .uc-v2 .uc-key-form{grid-template-columns:1fr}
}

/* USER CENTER — account, balance, recharge only */
.account-modal-overlay{position:absolute;inset:0;z-index:980;display:flex;align-items:stretch;justify-content:center;background:color-mix(in oklab,var(--bg) 78%,rgba(0,0,0,.52));backdrop-filter:blur(18px)}
.has-window-chrome .account-modal-overlay{top:38px;bottom:auto;height:calc(100% - 38px)}
.account-center-page{background:var(--bg)}
.account-center-shell{max-width:1080px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:18px;padding-top:10px}
.account-center-frame{position:relative;isolation:isolate;width:100%;display:flex;flex-direction:column;gap:18px;padding:30px;border:1px solid color-mix(in oklab,var(--line) 88%,transparent);border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 94%,#111827) 0%,color-mix(in oklab,var(--paper) 84%,#06080b) 100%);box-shadow:0 34px 90px -54px rgba(0,0,0,.95),0 0 0 1px color-mix(in oklab,var(--ink) 5%,transparent) inset;overflow:hidden}
.account-center-frame::before{content:'';position:absolute;inset:0;z-index:-2;background-image:linear-gradient(color-mix(in oklab,var(--ink) 7%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--ink) 6%,transparent) 1px,transparent 1px);background-size:42px 42px;opacity:.26;-webkit-mask-image:linear-gradient(180deg,black 0%,transparent 82%);mask-image:linear-gradient(180deg,black 0%,transparent 82%)}
.account-center-frame::after{content:'';position:absolute;left:30px;right:30px;top:0;height:1px;z-index:-1;background:linear-gradient(90deg,transparent 0%,color-mix(in oklab,var(--accent) 82%,white) 50%,transparent 100%);opacity:.75}
.account-frame-glow{position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(115deg,transparent 0%,color-mix(in oklab,var(--accent) 7%,transparent) 36%,transparent 58%),linear-gradient(180deg,color-mix(in oklab,var(--ink) 4%,transparent),transparent 34%)}
.account-center-head{display:flex;align-items:center;justify-content:space-between;gap:16px}
.account-center-title{display:flex;flex-direction:column;gap:7px;min-width:0}
.account-center-title span{font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-mute)}
.account-center-head h1{margin:0;font-size:34px;line-height:1.06;letter-spacing:0;text-shadow:0 0 18px color-mix(in oklab,var(--accent) 22%,transparent)}
.account-center-modal-page{position:relative;inset:auto;width:100%;height:100%;overflow:auto;padding:44px clamp(24px,5vw,72px);background:linear-gradient(180deg,color-mix(in oklab,var(--bg) 96%,#111827) 0%,var(--bg) 100%)}
.account-center-modal-page::before{content:'';position:fixed;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 0%,color-mix(in oklab,var(--accent) 4%,transparent) 50%,transparent 100%),linear-gradient(color-mix(in oklab,var(--ink) 4%,transparent) 1px,transparent 1px);background-size:100% 100%,100% 46px;opacity:.65}
.account-center-modal-page .account-center-shell{max-width:1120px;min-height:100%;justify-content:center;padding:0}
.account-center-modal-page .account-center-head{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}
.account-center-modal-page .account-center-title{grid-column:2;text-align:center;align-items:center}
.account-modal-close{grid-column:3;justify-self:end;min-height:38px;border:1px solid var(--line);border-radius:8px;background:color-mix(in oklab,var(--paper) 84%,transparent);color:var(--ink-soft);padding:0 14px;cursor:pointer;font-size:13px;font-weight:700}
.account-modal-close:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 42%,var(--line));background:color-mix(in oklab,var(--accent) 8%,var(--paper))}
.account-auth-modal-page{width:min(560px,calc(100vw - 36px));max-height:calc(100vh - 48px);display:flex;align-items:center;justify-content:center}
.account-auth-shell{position:relative;width:100%;display:flex;flex-direction:column;gap:12px}
.account-auth-close{align-self:flex-end}
.account-auth-title{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute);text-align:center}
.account-auth-modal-page .auth-panel{width:100%;max-height:calc(100vh - 96px)}
.account-panel{position:relative;border:1px solid color-mix(in oklab,var(--line) 86%,transparent);border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 78%,transparent),color-mix(in oklab,var(--paper) 92%,transparent));padding:24px;min-width:0;box-shadow:0 22px 48px -34px rgba(0,0,0,.9),inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent)}
.account-panel::before{content:'';position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--ink) 16%,transparent),transparent);pointer-events:none}
.account-panel-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.account-panel-head div{min-width:0;display:flex;flex-direction:column;gap:5px}
.account-panel-head span:not(.account-icon){font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.account-panel-head strong{font-size:15px;color:var(--ink);font-weight:700}
.account-icon{width:38px;height:38px;border-radius:8px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));background:color-mix(in oklab,var(--accent) 11%,transparent);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}
.account-form{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}
.account-form label{display:flex;flex-direction:column;gap:7px;min-width:0}
.account-form label span{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.account-form input,.account-redeem-form input{min-height:42px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);color:var(--ink);padding:0 12px;outline:none;font-size:13px}
.account-form input:focus,.account-redeem-form input:focus{border-color:color-mix(in oklab,var(--accent) 50%,var(--line))}
.account-form input:disabled,.account-redeem-form input:disabled{opacity:.55}
.account-primary-btn,.account-ghost-btn{appearance:none;min-height:42px;border-radius:8px;padding:0 18px;font-family:var(--font-body);font-size:13px;font-weight:800;letter-spacing:0;cursor:pointer;transition:transform .16s ease,filter .16s ease,opacity .16s ease,border-color .16s ease,color .16s ease}
.account-primary-btn{border:1px solid transparent;background:var(--accent);color:#031018}
.account-primary-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.04)}
.account-primary-btn:disabled,.account-ghost-btn:disabled{opacity:.56;cursor:not-allowed}
.account-ghost-btn{border:1px solid var(--line);background:transparent;color:var(--ink-soft)}
.account-ghost-btn:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 40%,var(--line));color:var(--ink)}
.account-center-grid{display:grid;grid-template-columns:minmax(300px,.95fr) minmax(420px,1.05fr);gap:16px;align-items:stretch}
.account-profile-panel{display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px;align-items:center}
.account-profile-panel .account-ghost-btn{grid-column:1 / -1;width:100%}
.account-avatar{width:64px;height:64px;border-radius:8px;background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent) 62%,white));color:#031018;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:25px;font-weight:800;box-shadow:0 16px 34px -22px color-mix(in oklab,var(--accent) 70%,transparent)}
.account-profile-copy{min-width:0;display:flex;flex-direction:column;gap:5px}
.account-profile-copy span,.account-balance-head span:not(.account-icon){font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.account-profile-copy strong{font-size:18px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.account-profile-copy em{font-style:normal;color:var(--ink-mute);font-size:12px}
.account-key-panel{display:flex;flex-direction:column;gap:18px}
.account-access-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:auto}
.account-access-item{min-width:0;min-height:78px;display:flex;flex-direction:column;justify-content:center;gap:8px;border:1px solid color-mix(in oklab,var(--line-soft) 82%,transparent);border-radius:9px;background:linear-gradient(180deg,color-mix(in oklab,var(--bg) 30%,transparent),color-mix(in oklab,var(--paper-2) 64%,transparent));padding:12px}
.account-access-item span{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.account-access-item strong{font-size:13px;color:var(--ink-soft);white-space:nowrap}
.account-access-item.ready{border-color:color-mix(in oklab,var(--accent) 28%,var(--line));background:radial-gradient(ellipse 80% 100% at 0% 0%,color-mix(in oklab,var(--accent) 11%,transparent),transparent 70%),linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 72%,transparent),color-mix(in oklab,var(--paper) 80%,transparent))}
.account-access-item.ready strong{color:color-mix(in oklab,var(--accent-soft) 76%,white)}
.account-balance-panel{display:flex;flex-direction:column;gap:12px;border-color:color-mix(in oklab,var(--accent) 22%,var(--line))}
.account-balance-head{display:flex;align-items:center;gap:10px}
.account-balance-panel > strong{font-family:var(--font-display);font-size:58px;line-height:1;font-weight:800;color:var(--ink);letter-spacing:0;text-shadow:0 0 20px color-mix(in oklab,var(--accent) 18%,transparent)}
.account-balance-panel .account-ghost-btn{align-self:flex-start;margin-top:auto}
.account-balance-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:auto}
.account-balance-actions .account-ghost-btn,.account-balance-actions .account-primary-btn{align-self:auto;margin-top:0;min-height:38px}
.account-consumption-panel{grid-column:1 / -1;display:flex;flex-direction:column;gap:14px}
.account-consumption-summary{display:grid;grid-template-columns:1fr;gap:10px}
.account-consumption-summary div{min-height:86px;display:flex;flex-direction:column;justify-content:center;gap:8px;border:1px solid color-mix(in oklab,var(--line-soft) 82%,transparent);border-radius:9px;background:radial-gradient(ellipse 80% 100% at 0% 0%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 70%),linear-gradient(180deg,color-mix(in oklab,var(--bg) 30%,transparent),color-mix(in oklab,var(--paper-2) 64%,transparent));padding:14px}
.account-consumption-summary span,.account-consumption-head span{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.account-consumption-summary strong{font-size:28px;color:var(--ink);line-height:1;text-shadow:0 0 16px color-mix(in oklab,var(--accent) 18%,transparent)}
.account-consumption-summary em{font-style:normal;font-size:12px;color:var(--ink-mute)}
.account-consumption-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.account-consumption-actions .account-primary-btn,.account-consumption-actions .account-ghost-btn{min-height:38px}
.account-consumption-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:2px}
.account-consumption-head .account-ghost-btn{min-height:34px;padding:0 12px;font-size:12px}
.account-consumption-list{display:flex;flex-direction:column;gap:8px}
.account-consumption-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;min-height:62px;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:9px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 56%,transparent),color-mix(in oklab,var(--paper) 72%,transparent));padding:11px 12px}
.account-consumption-main,.account-consumption-meta{min-width:0;display:flex;flex-direction:column;gap:5px}
.account-consumption-main strong{font-size:13px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.account-consumption-main span,.account-consumption-meta span{font-size:11px;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.account-consumption-meta{text-align:right;align-items:flex-end}
.account-consumption-meta strong{font-family:var(--font-mono);font-size:13px;color:color-mix(in oklab,var(--accent-soft) 78%,white)}
.account-consumption-empty{min-height:90px;display:flex;align-items:center;justify-content:center;border:1px dashed color-mix(in oklab,var(--line) 78%,transparent);border-radius:9px;color:var(--ink-mute);font-size:13px}
.account-consumption-dialog-backdrop{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(5,18,32,.46);-webkit-backdrop-filter:blur(18px) saturate(1.08);backdrop-filter:blur(18px) saturate(1.08)}
.has-window-chrome .account-consumption-dialog-backdrop{top:38px;bottom:auto;height:calc(100% - 38px)}
.account-consumption-dialog{width:min(980px,calc(100vw - 48px));max-height:min(760px,calc(100vh - 64px));display:grid;grid-template-rows:auto auto auto minmax(0,1fr);gap:14px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:16px;background:radial-gradient(ellipse 72% 58% at 8% 0%,color-mix(in oklab,var(--accent) 13%,transparent),transparent 70%),linear-gradient(180deg,var(--paper),var(--paper-2));box-shadow:0 34px 100px -46px rgba(34,89,138,.62),0 0 0 1px rgba(255,255,255,.28),inset 0 1px 0 rgba(255,255,255,.82);padding:20px;overflow:hidden}
.theme-a .account-consumption-dialog{background:radial-gradient(ellipse 72% 58% at 8% 0%,rgba(85,182,242,.13),transparent 70%),linear-gradient(180deg,#F8FCFF 0%,#E6F4FF 100%);box-shadow:0 34px 100px -46px rgba(70,128,184,.58),0 0 0 1px rgba(255,255,255,.62),inset 0 1px 0 rgba(255,255,255,.9)}
.theme-b .account-consumption-dialog-backdrop{background:rgba(3,5,5,.62)}
.theme-b .account-consumption-dialog{border-color:rgba(228,212,173,.34);background:radial-gradient(ellipse 78% 62% at 9% 0%,rgba(198,166,106,.15),transparent 70%),linear-gradient(180deg,#1D201C 0%,#121412 100%);box-shadow:0 34px 100px -46px rgba(0,0,0,.92),0 0 0 1px rgba(255,255,255,.05),inset 0 1px 0 rgba(255,255,255,.08)}
.account-consumption-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);padding-bottom:14px}
.account-consumption-dialog-head span{display:block;margin-bottom:4px;font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute)}
.account-consumption-dialog-head h2{margin:0;font-size:22px;line-height:1.15;color:var(--ink)}
.account-bill-toolbar{display:grid;grid-template-columns:minmax(260px,.42fr) minmax(0,1fr);gap:12px;align-items:stretch}
.account-bill-totals{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.account-bill-totals .account-consumption-dialog-total:first-child{grid-row:1 / span 2}
.account-consumption-dialog-total{min-height:92px;display:flex;flex-direction:column;justify-content:center;gap:8px;border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line));border-radius:12px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 12%,transparent),color-mix(in oklab,var(--paper-2) 72%,transparent));padding:16px}
.account-consumption-dialog-total.compact{min-height:0;padding:12px}
.account-consumption-dialog-total.refund{border-color:color-mix(in oklab,#36b37e 28%,var(--line));background:linear-gradient(135deg,color-mix(in oklab,#36b37e 12%,transparent),color-mix(in oklab,var(--paper-2) 72%,transparent))}
.account-consumption-dialog-total span{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.account-consumption-dialog-total strong{font-family:var(--font-display);font-size:38px;line-height:1;color:var(--ink)}
.account-consumption-dialog-total.compact strong{font-size:22px}
.account-bill-filter{display:grid;grid-template-columns:repeat(2,minmax(140px,1fr)) auto auto;gap:10px;align-items:end;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:12px;background:color-mix(in oklab,var(--paper-2) 56%,transparent);padding:12px}
.account-bill-filter label{display:flex;flex-direction:column;gap:7px;min-width:0}
.account-bill-filter span{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.account-bill-filter input{min-height:38px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);color:var(--ink);padding:0 10px;font-size:12px;outline:none}
.account-bill-filter input:focus{border-color:color-mix(in oklab,var(--accent) 50%,var(--line))}
.account-bill-table-head,.account-bill-row{display:grid;grid-template-columns:86px 54px minmax(170px,1.45fr) minmax(96px,.7fr) 74px 86px minmax(132px,.9fr);gap:12px;align-items:center}
.account-bill-table-head{min-height:34px;padding:0 12px;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:10px;background:color-mix(in oklab,var(--paper-2) 54%,transparent)}
.account-bill-table-head span{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute)}
.account-bill-table{display:flex;flex-direction:column;gap:8px}
.account-bill-row{min-height:64px;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 58%,transparent),color-mix(in oklab,var(--paper) 72%,transparent));padding:10px 12px}
.account-bill-row>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--ink-mute)}
.account-bill-row>strong{font-family:var(--font-mono);font-size:13px;color:color-mix(in oklab,var(--accent-soft) 78%,white);text-align:right}
.account-bill-row>strong.refund{color:color-mix(in oklab,#36b37e 76%,var(--ink))}
.account-bill-type{width:max-content;max-width:100%;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid color-mix(in oklab,var(--accent) 20%,var(--line));background:color-mix(in oklab,var(--accent) 10%,transparent);padding:3px 8px;color:var(--ink)!important;font-weight:800}
.account-bill-type.refund{border-color:color-mix(in oklab,#36b37e 30%,var(--line));background:color-mix(in oklab,#36b37e 14%,transparent);color:color-mix(in oklab,#36b37e 70%,var(--ink))!important}
.account-bill-main{min-width:0;display:flex;flex-direction:column;gap:5px}
.account-bill-main strong{font-size:13px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.account-bill-main em{font-style:normal;font-size:11px;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.account-bill-media{min-width:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.account-bill-media-empty{color:var(--ink-mute)}
.account-bill-media-tag{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid color-mix(in oklab,var(--accent) 24%,var(--line));background:color-mix(in oklab,var(--accent) 10%,transparent);color:color-mix(in oklab,var(--accent) 76%,var(--ink));font-size:11px;font-weight:800;line-height:1;padding:4px 7px;white-space:nowrap}
.account-bill-media-tag.video{border-color:color-mix(in oklab,#7c6dff 30%,var(--line));background:color-mix(in oklab,#7c6dff 12%,transparent);color:color-mix(in oklab,#7c6dff 72%,var(--ink))}
.account-bill-media-tag.audio{border-color:color-mix(in oklab,#36b37e 28%,var(--line));background:color-mix(in oklab,#36b37e 12%,transparent);color:color-mix(in oklab,#36b37e 72%,var(--ink))}
.account-bill-media-actions{min-width:0;display:flex;align-items:center;gap:6px}
.account-bill-media-btn{appearance:none;min-height:26px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--line) 86%,transparent);border-radius:999px;background:color-mix(in oklab,var(--paper) 76%,transparent);color:var(--ink);padding:0 9px;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:0;cursor:pointer;white-space:nowrap}
.account-bill-media-btn:hover{border-color:color-mix(in oklab,var(--accent) 48%,var(--line));background:color-mix(in oklab,var(--accent) 10%,var(--paper));color:color-mix(in oklab,var(--accent) 76%,var(--ink))}
.account-consumption-dialog-scroll{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding-right:4px}
.account-consumption-dialog-scroll::-webkit-scrollbar{width:8px}
.account-consumption-dialog-scroll::-webkit-scrollbar-thumb{border-radius:999px;background:color-mix(in oklab,var(--accent) 34%,var(--line))}
.account-consumption-dialog-scroll::-webkit-scrollbar-track{background:color-mix(in oklab,var(--paper-2) 48%,transparent);border-radius:999px}
.account-purchase-panel{display:flex;flex-direction:column;gap:12px;justify-content:space-between;border-color:color-mix(in oklab,var(--accent) 24%,var(--line))}
.account-purchase-url{min-height:42px;display:flex;align-items:center;min-width:0;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper-2);color:var(--ink-soft);padding:0 12px;font-family:var(--font-mono);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.account-purchase-actions{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}
.account-purchase-actions .account-primary-btn,.account-purchase-actions .account-ghost-btn{min-height:38px}
.account-purchase-note{min-height:18px;margin:0;color:var(--ink-mute);font-size:12px;line-height:1.5}
.account-purchase-note.success{color:color-mix(in oklab,#36b37e 72%,var(--ink))}
.account-purchase-note.error{color:color-mix(in oklab,#ff6b6b 76%,var(--ink))}
.account-usage-dialog-backdrop{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(5,18,32,.48);-webkit-backdrop-filter:blur(18px) saturate(1.08);backdrop-filter:blur(18px) saturate(1.08)}
.has-window-chrome .account-usage-dialog-backdrop{top:38px;bottom:auto;height:calc(100% - 38px)}
.account-usage-dialog{width:min(1180px,calc(100vw - 48px));max-height:min(780px,calc(100vh - 64px));display:grid;grid-template-rows:auto auto auto minmax(0,1fr);gap:14px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:16px;background:radial-gradient(ellipse 72% 58% at 8% 0%,color-mix(in oklab,var(--accent) 12%,transparent),transparent 70%),linear-gradient(180deg,var(--paper),var(--paper-2));box-shadow:0 34px 100px -46px rgba(34,89,138,.62),0 0 0 1px rgba(255,255,255,.28),inset 0 1px 0 rgba(255,255,255,.82);padding:20px;overflow:hidden}
.theme-a .account-usage-dialog{background:radial-gradient(ellipse 72% 58% at 8% 0%,rgba(85,182,242,.12),transparent 70%),linear-gradient(180deg,#F8FCFF 0%,#E6F4FF 100%)}
.theme-b .account-usage-dialog-backdrop{background:rgba(3,5,5,.62)}
.theme-b .account-usage-dialog{border-color:rgba(228,212,173,.34);background:radial-gradient(ellipse 78% 62% at 9% 0%,rgba(198,166,106,.14),transparent 70%),linear-gradient(180deg,#1D201C 0%,#121412 100%)}
.account-usage-dialog-head em{display:block;margin-top:3px;font-style:normal;color:var(--ink-mute);font-size:12px}
.account-usage-summary{display:grid;grid-template-columns:120px minmax(0,1fr);gap:12px;align-items:stretch}
.account-usage-summary>div{display:flex;flex-direction:column;justify-content:center;gap:8px;border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line));border-radius:12px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 12%,transparent),color-mix(in oklab,var(--paper-2) 72%,transparent));padding:14px}
.account-usage-summary>div span{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.account-usage-summary>div strong{font-family:var(--font-display);font-size:30px;line-height:1;color:var(--ink)}
.account-usage-filter{display:grid;grid-template-columns:repeat(5,minmax(92px,1fr)) auto auto auto;gap:10px;align-items:end;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:12px;background:color-mix(in oklab,var(--paper-2) 56%,transparent);padding:12px}
.account-usage-filter label{display:flex;flex-direction:column;gap:7px;min-width:0}
.account-usage-filter span{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.account-usage-filter input,.account-usage-filter select{min-height:38px;border:1px solid var(--line-soft);border-radius:8px;background:var(--paper);color:var(--ink);padding:0 10px;font-size:12px;outline:none}
.account-usage-filter input:focus,.account-usage-filter select:focus{border-color:color-mix(in oklab,var(--accent) 50%,var(--line))}
.account-usage-table-head,.account-usage-row{display:grid;grid-template-columns:104px 104px 76px 54px 76px 78px minmax(190px,1.4fr) 78px minmax(120px,.8fr) minmax(120px,1fr);gap:10px;align-items:center}
.account-usage-table-head{min-height:34px;padding:0 12px;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:10px;background:color-mix(in oklab,var(--paper-2) 54%,transparent)}
.account-usage-table-head span{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-mute)}
.account-usage-dialog-scroll{min-height:0;overflow:auto;overscroll-behavior:contain;padding-right:4px}
.account-usage-table{min-width:1040px;display:flex;flex-direction:column;gap:8px}
.account-usage-row{min-height:58px;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 58%,transparent),color-mix(in oklab,var(--paper) 72%,transparent));padding:9px 12px}
.account-usage-row>span,.account-usage-row>strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--ink-mute)}
.account-usage-row>strong{font-family:var(--font-mono);font-size:11px;color:var(--ink)}
.account-usage-status{width:max-content;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid color-mix(in oklab,var(--line) 80%,transparent);padding:3px 8px;font-weight:800;color:var(--ink)!important}
.account-usage-status.success{border-color:color-mix(in oklab,#36b37e 30%,var(--line));background:color-mix(in oklab,#36b37e 14%,transparent);color:color-mix(in oklab,#36b37e 70%,var(--ink))!important}
.account-usage-status.failure{border-color:color-mix(in oklab,#ff6b6b 34%,var(--line));background:color-mix(in oklab,#ff6b6b 13%,transparent);color:color-mix(in oklab,#ff6b6b 72%,var(--ink))!important}
.account-usage-status.in_progress,.account-usage-status.submitted,.account-usage-status.queued{border-color:color-mix(in oklab,var(--accent) 30%,var(--line));background:color-mix(in oklab,var(--accent) 12%,transparent);color:color-mix(in oklab,var(--accent) 76%,var(--ink))!important}
.account-usage-progress{min-width:0;position:relative;height:18px;border-radius:999px;background:color-mix(in oklab,var(--line-soft) 50%,transparent);overflow:hidden}
.account-usage-progress i{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 78%,#36b37e),#36b37e)}
.account-usage-progress em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--ink)}
.account-usage-detail-action{appearance:none;min-width:0;width:max-content;max-width:100%;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 34%,var(--line));border-radius:999px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));color:var(--accent);font-size:12px;font-weight:750;padding:5px 10px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.account-usage-detail-action:hover{border-color:color-mix(in oklab,var(--accent) 58%,var(--line));background:color-mix(in oklab,var(--accent) 16%,var(--paper));color:color-mix(in oklab,var(--accent) 72%,var(--ink))}
.account-usage-error-btn{border-color:color-mix(in oklab,#ff6b6b 34%,var(--line));background:color-mix(in oklab,#ff6b6b 10%,var(--paper));color:color-mix(in oklab,#ff6b6b 74%,var(--ink))}
.account-usage-preview-backdrop{position:fixed;inset:0;z-index:10040;display:flex;align-items:center;justify-content:center;padding:26px;background:rgba(4,14,24,.42);-webkit-backdrop-filter:blur(10px) saturate(1.04);backdrop-filter:blur(10px) saturate(1.04)}
.account-usage-preview-dialog{width:min(860px,calc(100vw - 72px));max-height:min(720px,calc(100vh - 84px));display:flex;flex-direction:column;border:1px solid color-mix(in oklab,var(--accent) 30%,var(--line));border-radius:16px;background:linear-gradient(180deg,var(--paper),var(--paper-2));box-shadow:0 32px 92px -42px rgba(20,72,118,.66),inset 0 1px 0 rgba(255,255,255,.78);overflow:hidden}
.account-usage-preview-head{display:flex;align-items:center;justify-content:space-between;gap:14px;border-bottom:1px solid var(--line-soft);padding:16px 18px;background:color-mix(in oklab,var(--accent) 7%,transparent)}
.account-usage-preview-head span{display:block;margin-bottom:4px;font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.account-usage-preview-head h3{margin:0;font-size:18px;color:var(--ink)}
.account-usage-preview-head em{display:block;margin-top:4px;max-width:560px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:normal;font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.account-usage-preview-stage{min-height:260px;max-height:560px;display:flex;align-items:center;justify-content:center;background:color-mix(in oklab,var(--bg) 72%,var(--paper));padding:18px;overflow:auto}
.account-usage-preview-stage video,.account-usage-preview-stage img{max-width:100%;max-height:520px;border-radius:10px;background:#000;box-shadow:0 18px 54px -34px rgba(0,0,0,.72)}
.account-usage-preview-stage audio{width:min(620px,100%)}
.account-usage-preview-stage pre{width:100%;min-height:220px;margin:0;white-space:pre-wrap;word-break:break-word;border:1px solid color-mix(in oklab,#ff6b6b 20%,var(--line));border-radius:10px;background:color-mix(in oklab,#ff6b6b 7%,var(--paper));color:var(--ink);padding:14px;font-family:var(--font-mono);font-size:12px;line-height:1.65}
.account-usage-preview-link{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;color:var(--ink)}
.account-usage-preview-link strong{font-size:15px}
.account-usage-preview-link a,.account-usage-preview-foot a{display:inline-flex;align-items:center;justify-content:center;min-height:34px;border:1px solid color-mix(in oklab,var(--accent) 42%,var(--line));border-radius:999px;background:color-mix(in oklab,var(--accent) 12%,var(--paper));color:var(--accent);padding:0 12px;text-decoration:none;font-size:12px;font-weight:750}
.account-usage-preview-foot{display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--line-soft);padding:12px 18px;background:color-mix(in oklab,var(--paper-2) 62%,transparent)}
.account-redeem-panel{display:flex;flex-direction:column;justify-content:space-between}
.account-redeem-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:auto}
@media (max-width:900px){
  .account-center-grid{grid-template-columns:1fr}
  .account-balance-panel{grid-row:auto}
  .account-form{grid-template-columns:1fr}
  .account-redeem-panel{grid-column:auto}
  .account-purchase-actions{grid-template-columns:1fr}
  .account-access-grid{grid-template-columns:1fr}
  .account-center-modal-page .account-center-head{grid-template-columns:1fr auto}
  .account-center-modal-page .account-center-title{grid-column:1;text-align:left;align-items:flex-start}
  .account-modal-close{grid-column:2}
}
@media (max-width:560px){
  .account-center-shell{padding-top:0}
  .account-center-modal-page{padding:24px 16px}
  .account-center-head{align-items:flex-start}
  .account-panel{padding:18px}
  .account-consumption-summary{grid-template-columns:1fr}
  .account-consumption-row{grid-template-columns:1fr}
  .account-consumption-meta{text-align:left;align-items:flex-start}
  .account-redeem-form{grid-template-columns:1fr}
  .account-primary-btn,.account-ghost-btn{width:100%}
  .account-balance-panel > strong{font-size:44px}
}

/* Product visual architecture — layered creator workspace */
.product-shell{isolation:isolate;background:linear-gradient(180deg,#0D0F0E 0%,var(--bg) 52%,#080908 100%)}
.product-shell::before{z-index:0;background:radial-gradient(ellipse 62% 48% at 18% 8%,color-mix(in oklab,var(--accent) 14%,transparent),transparent 62%),radial-gradient(ellipse 42% 42% at 88% 18%,color-mix(in oklab,var(--accent-3) 10%,transparent),transparent 66%),radial-gradient(ellipse 50% 45% at 72% 96%,color-mix(in oklab,var(--accent-2) 8%,transparent),transparent 70%),linear-gradient(120deg,rgba(255,255,255,.025),transparent 42%)}
.product-shell::after{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(color-mix(in oklab,var(--ink) 5%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--ink) 4%,transparent) 1px,transparent 1px),radial-gradient(color-mix(in oklab,var(--accent) 28%,transparent) .8px,transparent 1.2px);background-size:64px 64px,64px 64px,7px 7px;mask-image:radial-gradient(ellipse 78% 64% at 54% 42%,black 0%,transparent 82%);opacity:.5}
.product-sidebar,.product-main{position:relative;z-index:1}
.product-sidebar{border-right:1px solid color-mix(in oklab,var(--line) 70%,var(--accent) 18%);background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 83%,transparent),color-mix(in oklab,var(--bg-deep) 92%,transparent));box-shadow:14px 0 42px -34px rgba(0,0,0,.95),inset -1px 0 0 rgba(255,255,255,.025);backdrop-filter:blur(18px)}
.product-sidebar::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 6%,transparent),transparent 34%),radial-gradient(ellipse 90% 36% at 0% 0%,color-mix(in oklab,var(--accent) 13%,transparent),transparent 70%)}
.product-brand{position:relative;height:58px;padding:0 8px 16px;border-bottom:1px solid color-mix(in oklab,var(--line-soft) 64%,transparent)}
.product-brand::before{content:'';width:8px;height:8px;border-radius:999px;background:var(--accent);box-shadow:0 0 0 5px color-mix(in oklab,var(--accent) 14%,transparent),0 0 22px color-mix(in oklab,var(--accent) 80%,transparent);flex:0 0 auto}
.product-brand strong{font-family:'Source Serif 4','Noto Serif SC',var(--font-display),serif;font-size:18px;font-weight:700;text-shadow:0 0 18px color-mix(in oklab,var(--accent) 22%,transparent)}
.product-brand span{letter-spacing:.22em;text-transform:uppercase}
.product-nav{position:relative;gap:8px;padding:20px 0}
.product-nav button{position:relative;min-height:42px;border-radius:4px;background:transparent;transition:background .18s ease,border-color .18s ease,color .18s ease,box-shadow .18s ease}
.product-nav button::before{content:'';position:absolute;left:-13px;top:50%;width:2px;height:0;background:var(--accent);box-shadow:0 0 14px var(--accent);transform:translateY(-50%);transition:height .18s ease}
.product-nav button:hover{background:color-mix(in oklab,var(--paper-2) 58%,transparent);border-color:color-mix(in oklab,var(--accent) 16%,transparent);box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent)}
.product-nav button.active{background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 13%,var(--paper-2)),color-mix(in oklab,var(--paper-2) 62%,transparent));border-color:color-mix(in oklab,var(--accent) 24%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
.product-nav button.active::before{height:22px}
.product-nav .nav-index{font-family:var(--font-mono);font-size:11px;color:var(--accent);letter-spacing:.08em}
.product-nav .nav-label{font-weight:700}
.product-nav button .nav-meta{min-width:26px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 20%,var(--line));border-radius:999px;background:color-mix(in oklab,var(--accent) 8%,transparent)}
.product-sidefoot{position:relative;border-top:1px solid color-mix(in oklab,var(--line-soft) 70%,transparent);padding:14px 0 0}
.product-account-actions{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:stretch}
.product-account-button{width:100%;display:flex;align-items:center;gap:11px;text-align:left;border:1px solid color-mix(in oklab,var(--accent) 24%,var(--line));border-radius:8px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 9%,var(--paper-2)),color-mix(in oklab,var(--paper) 72%,transparent));color:var(--ink);padding:12px;cursor:pointer;box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 16px 36px -28px rgba(0,0,0,.8)}
.product-account-button:hover{border-color:color-mix(in oklab,var(--accent) 48%,var(--line));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 8%,transparent),0 22px 48px -30px color-mix(in oklab,var(--accent) 46%,transparent)}
.product-account-recharge{min-width:54px;border:1px solid color-mix(in oklab,var(--accent-2) 32%,var(--line));border-radius:8px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent-2) 18%,var(--paper-2)),color-mix(in oklab,var(--accent) 9%,var(--paper)));color:var(--ink);font-size:12px;font-weight:800;letter-spacing:0;cursor:pointer;box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 16px 34px -28px color-mix(in oklab,var(--accent-2) 58%,transparent);transition:border-color .18s ease,background .18s ease,box-shadow .18s ease,transform .18s ease}
.product-account-recharge:hover{transform:translateY(-1px);border-color:color-mix(in oklab,var(--accent-2) 58%,var(--line));background:linear-gradient(135deg,color-mix(in oklab,var(--accent-2) 26%,var(--paper-2)),color-mix(in oklab,var(--accent) 13%,var(--paper)));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 8%,transparent),0 18px 42px -29px color-mix(in oklab,var(--accent-2) 66%,transparent)}
.product-account-avatar{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent-3) 38%,var(--accent)));color:#031018;font-weight:800;box-shadow:0 12px 24px -18px color-mix(in oklab,var(--accent) 90%,transparent)}
.product-account-copy{min-width:0;display:flex;flex-direction:column;gap:2px}
.product-account-copy strong{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.product-account-copy span,.product-account-copy em{font-size:10px;color:var(--ink-mute);font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.home-page{background:transparent}
.home-page::before{content:'';position:fixed;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 0%,color-mix(in oklab,var(--accent) 4%,transparent) 48%,transparent 100%),linear-gradient(180deg,color-mix(in oklab,var(--paper) 7%,transparent),transparent 34%);opacity:.78}
.home-page > :not(.hp-modal-backdrop){position:relative;z-index:1}
.home-page > .hp-modal-backdrop{position:fixed;inset:0;z-index:9000}
.home-page .page-head{position:relative;align-items:center;padding:16px 18px;border:1px solid color-mix(in oklab,var(--line) 70%,transparent);border-radius:12px;background:linear-gradient(135deg,color-mix(in oklab,var(--paper) 78%,transparent),color-mix(in oklab,var(--paper-2) 42%,transparent));box-shadow:var(--shadow-card);backdrop-filter:blur(16px)}
.home-page .page-head::before{content:'';position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 50%,transparent),color-mix(in oklab,var(--accent-2) 32%,transparent),transparent)}
.home-page h1{font-family:'Source Serif 4','Noto Serif SC',var(--font-display),serif;font-size:30px;font-weight:650}
.home-btn{border-color:color-mix(in oklab,var(--line) 80%,transparent);background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 72%,transparent),color-mix(in oklab,var(--paper) 82%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent);transition:transform .16s ease,border-color .18s ease,background .18s ease,color .18s ease,box-shadow .18s ease}
.home-btn:hover:not(:disabled){transform:translateY(-1px);background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 9%,var(--paper-2)),color-mix(in oklab,var(--paper) 86%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 14px 28px -24px color-mix(in oklab,var(--accent) 55%,transparent)}
.asset-library-frame{position:relative;z-index:1;display:flex;flex-direction:column;gap:14px;border:1px solid color-mix(in oklab,var(--line) 72%,var(--accent) 12%);border-radius:14px;background:radial-gradient(ellipse 52% 34% at 14% 0%,color-mix(in oklab,var(--accent) 11%,transparent),transparent 70%),linear-gradient(180deg,color-mix(in oklab,var(--paper) 46%,transparent),color-mix(in oklab,var(--bg-deep) 18%,transparent));box-shadow:0 30px 88px -62px rgba(0,0,0,.92),inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent);backdrop-filter:blur(12px);padding:18px}
.asset-library-frame::before{content:'';position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 46%,transparent),color-mix(in oklab,var(--accent-2) 26%,transparent),transparent);pointer-events:none}
.asset-library-frame .asset-page-head{position:relative;top:auto;z-index:1;display:flex;align-items:flex-start;justify-content:flex-start;padding:0 2px 2px;border:0;border-radius:0;background:transparent;box-shadow:none;backdrop-filter:none;margin:0}
.asset-library-frame .asset-page-head::before{display:none}
.asset-library-frame .asset-page-head h1{margin:0 0 7px}

/* Project home cockpit */
.projects-home{padding:46px 56px 78px;display:block;background:radial-gradient(ellipse 50% 42% at 20% 7%,color-mix(in oklab,var(--accent) 15%,transparent),transparent 64%),radial-gradient(ellipse 48% 38% at 88% 88%,color-mix(in oklab,var(--accent-2) 8%,transparent),transparent 70%),var(--bg)}
.hp-workbench{position:relative;z-index:2;width:100%;max-width:1120px;margin:0 auto;display:flex;flex-direction:column;gap:22px}
.hp-workbench-hero{position:relative;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(240px,.8fr);grid-template-areas:'copy current' 'stats stats';gap:16px;padding:22px;border:1px solid color-mix(in oklab,var(--accent) 20%,var(--line));border-radius:18px;background:linear-gradient(135deg,color-mix(in oklab,var(--paper) 82%,transparent),color-mix(in oklab,var(--bg-deep) 70%,transparent)),radial-gradient(ellipse 70% 80% at 8% 8%,color-mix(in oklab,var(--accent) 12%,transparent),transparent 70%);box-shadow:0 34px 86px -58px rgba(0,0,0,.95),inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent);backdrop-filter:blur(20px);overflow:hidden}
.hp-workbench-hero::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(color-mix(in oklab,var(--accent) 9%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--accent) 7%,transparent) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(90deg,black 0%,transparent 72%);opacity:.6}
.hp-workbench-hero::after{content:'';position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,var(--accent),color-mix(in oklab,var(--accent-2) 70%,white),transparent);opacity:.65}
.hp-hero-copy,.hp-hero-current,.hp-hero-stats{position:relative;z-index:1}
.hp-hero-copy{grid-area:copy;display:flex;flex-direction:column;gap:12px;min-width:0}
.hp-kicker{font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:color-mix(in oklab,var(--accent) 70%,var(--ink-mute))}
.hp-hero-copy h1{margin:0;font-family:'Source Serif 4','Noto Serif SC',var(--font-display),serif;font-size:38px;line-height:1.1;font-weight:650;color:var(--ink);text-shadow:0 18px 44px rgba(0,0,0,.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hp-hero-copy p{margin:0;max-width:62ch;color:var(--ink-mute);font-size:13px;line-height:1.65}
.hp-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}
.hp-hero-btn{min-height:38px;border:1px solid color-mix(in oklab,var(--line) 78%,transparent);border-radius:999px;background:color-mix(in oklab,var(--paper-2) 56%,transparent);color:var(--ink-soft);padding:0 16px;font-weight:700;cursor:pointer;transition:transform .16s ease,border-color .18s ease,color .18s ease,background .18s ease}
.hp-hero-btn:hover:not(:disabled){transform:translateY(-1px);border-color:color-mix(in oklab,var(--accent) 42%,var(--line));color:var(--ink);background:color-mix(in oklab,var(--accent) 8%,var(--paper-2))}
.hp-hero-btn.primary{background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent-3) 34%,var(--accent)));border-color:transparent;color:#031018;box-shadow:0 16px 36px -24px color-mix(in oklab,var(--accent) 88%,transparent)}
.hp-hero-btn:disabled{opacity:.52;cursor:not-allowed}
.hp-hero-current{grid-area:current;display:grid;grid-template-columns:minmax(0,1fr) 118px;grid-template-rows:auto auto auto;gap:4px 14px;align-items:center;padding:14px;border:1px solid color-mix(in oklab,var(--line) 76%,var(--accent) 12%);border-radius:12px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 55%,transparent),color-mix(in oklab,var(--paper) 58%,transparent))}
.hp-hero-current span{font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute)}
.hp-hero-current strong{font-size:16px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hp-hero-current em{font-style:normal;font-family:var(--font-mono);font-size:10.5px;color:var(--ink-mute)}
.hp-hero-mini{grid-column:2;grid-row:1 / 4;height:78px;border:1px dashed color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:8px;color:var(--accent);background:color-mix(in oklab,var(--accent) 5%,transparent);overflow:hidden}
.hp-hero-mini .hp-card-glyph{height:100%}
.hp-hero-stats{grid-area:stats;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.hp-hero-stats div{min-height:78px;padding:13px 14px;border:1px solid color-mix(in oklab,var(--line-soft) 80%,transparent);border-radius:12px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 58%,transparent),color-mix(in oklab,var(--paper) 42%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent)}
.hp-hero-stats strong{display:block;font-family:var(--font-mono);font-size:25px;line-height:1;color:var(--accent);font-variant-numeric:tabular-nums}
.hp-hero-stats span{display:block;margin-top:9px;font-size:11px;color:var(--ink-mute)}
.hp-project-grid{max-width:none;grid-template-columns:repeat(auto-fill,minmax(276px,1fr));gap:18px}
.hp-card{border-radius:14px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 76%,rgba(255,255,255,.02)),color-mix(in oklab,var(--paper-2) 60%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent),0 26px 60px -44px rgba(0,0,0,.92)}
.hp-card-project{min-height:286px}
.hp-card-glyph-wrap{border-radius:9px;background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 7%,transparent),color-mix(in oklab,var(--bg-deep) 32%,transparent))}

/* Asset and model pages */
.media-home-page,.model-config-page,.account-center-page{background:transparent}
.asset-library-overview,.asset-control-section,.asset-content-panel,.model-panel,.config-connection-panel,.api-model-card,.user-stat,.category-tabs button,.media-card{position:relative;border-color:color-mix(in oklab,var(--line) 74%,var(--accent) 10%);background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 78%,transparent),color-mix(in oklab,var(--paper-2) 54%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent),0 20px 54px -42px rgba(0,0,0,.86);backdrop-filter:blur(14px)}
.asset-library-overview::before,.asset-control-section::before,.asset-content-panel::before,.model-panel::before,.config-connection-panel::before,.api-model-card::before{content:'';position:absolute;left:12px;right:12px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 38%,transparent),transparent);pointer-events:none}
.asset-library-overview{border-radius:14px;padding:16px 18px;background:radial-gradient(ellipse 55% 90% at 0% 0%,color-mix(in oklab,var(--accent) 11%,transparent),transparent 72%),linear-gradient(135deg,color-mix(in oklab,var(--paper) 82%,transparent),color-mix(in oklab,var(--paper-2) 58%,transparent))}
.asset-overview-copy strong{font-family:'Source Serif 4','Noto Serif SC',var(--font-display),serif;font-size:24px;font-weight:650}
.asset-overview-metrics div,.asset-summary-grid button,.asset-scopebar-v2 button,.asset-project-strip-v2 button,.media-tabbar-v2 button,.capability-readout{border-color:color-mix(in oklab,var(--line-soft) 76%,var(--accent) 8%);background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 68%,transparent),color-mix(in oklab,var(--paper) 44%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent)}
.asset-overview-metrics strong,.asset-summary-grid strong{color:var(--accent);text-shadow:0 0 16px color-mix(in oklab,var(--accent) 26%,transparent)}
.asset-control-panel{top:104px}
.asset-control-section{border-radius:12px;padding:14px}
.asset-section-label::before{content:'';width:5px;height:5px;border-radius:999px;background:var(--accent);box-shadow:0 0 10px var(--accent)}
.asset-content-panel,.model-panel,.config-connection-panel{border-radius:14px;overflow:hidden}
.asset-content-head,.section-head{background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 7%,transparent),transparent 48%,color-mix(in oklab,var(--accent-2) 5%,transparent));border-bottom-color:color-mix(in oklab,var(--line-soft) 72%,transparent)}
.media-grid{gap:14px;padding:16px}
.media-card{border-radius:12px;overflow:hidden;transition:transform .18s ease,border-color .18s ease,box-shadow .2s ease}
.media-card:hover{transform:translateY(-2px);border-color:color-mix(in oklab,var(--accent) 38%,var(--line));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 28px 58px -42px color-mix(in oklab,var(--accent) 48%,transparent)}
.media-thumb{height:146px;background:radial-gradient(ellipse 70% 80% at 50% 42%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 66%),#080908}
.media-card-badge{border:1px solid rgba(255,255,255,.12);background:rgba(3,8,12,.68);backdrop-filter:blur(8px)}
.media-info{padding:12px 12px 10px}
.model-message{border-color:color-mix(in oklab,var(--accent) 20%,var(--line));background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 7%,var(--paper)),color-mix(in oklab,var(--paper) 76%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent)}
.category-tabs{border-bottom-color:color-mix(in oklab,var(--line-soft) 74%,transparent);gap:10px}
.category-tabs button{border-radius:10px;min-height:54px}
.category-tabs button:hover,.category-tabs button.active{border-color:color-mix(in oklab,var(--accent) 42%,var(--line));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent),0 14px 34px -28px color-mix(in oklab,var(--accent) 50%,transparent)}
.model-config-layout{gap:16px}
.connection-body,.add-model-panel{background:linear-gradient(180deg,transparent,color-mix(in oklab,var(--bg-deep) 18%,transparent))}
.model-input{min-height:39px;border-color:color-mix(in oklab,var(--line-soft) 82%,transparent);background:color-mix(in oklab,var(--bg-deep) 54%,var(--paper-2));box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}
.model-input:focus{border-color:color-mix(in oklab,var(--accent) 60%,var(--line));box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 12%,transparent),inset 0 1px 0 rgba(255,255,255,.04)}
.user-stat{border-radius:10px}
.user-stat strong{font-size:15px}
.api-model-card{border-radius:12px;transition:border-color .18s ease,box-shadow .2s ease,transform .18s ease}
.api-model-card.enabled{border-color:color-mix(in oklab,var(--accent) 36%,var(--line));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 24px 54px -44px color-mix(in oklab,var(--accent) 46%,transparent)}
.api-model-card:hover{transform:translateY(-2px);border-color:color-mix(in oklab,var(--accent) 40%,var(--line))}
.status-pill{background:color-mix(in oklab,var(--paper-2) 58%,transparent)}
.status-pill.ready{background:color-mix(in oklab,var(--accent) 10%,transparent);box-shadow:0 0 18px -8px color-mix(in oklab,var(--accent) 70%,transparent)}

@media (max-width:1100px){
  .hp-workbench-hero{grid-template-columns:1fr;grid-template-areas:'copy' 'current' 'stats'}
}
@media (max-width:820px){
  .projects-home{padding:26px 18px 42px}
  .hp-workbench{gap:16px}
  .hp-workbench-hero{padding:16px}
  .hp-hero-copy h1{font-size:30px;white-space:normal}
  .hp-hero-current{grid-template-columns:1fr}
  .hp-hero-mini{grid-column:auto;grid-row:auto}
  .hp-hero-stats{grid-template-columns:1fr}
  .asset-library-shell,.model-config-layout{grid-template-columns:1fr}
  .asset-control-panel{position:relative;top:auto}
}

/* Project gallery refinement — lighter header, smaller cards, richer background depth */
.projects-home{padding:34px 48px 60px;background:linear-gradient(180deg,rgba(13,15,14,.94),rgba(15,16,14,.98) 62%,rgba(8,9,8,1)),radial-gradient(ellipse 44% 34% at 22% 10%,color-mix(in oklab,var(--accent) 13%,transparent),transparent 64%),radial-gradient(ellipse 34% 42% at 84% 18%,color-mix(in oklab,var(--accent-2) 8%,transparent),transparent 72%)}
.projects-home::after{content:'';position:fixed;right:44px;bottom:42px;width:420px;height:260px;pointer-events:none;border:1px solid color-mix(in oklab,var(--accent) 16%,transparent);border-radius:24px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 5%,transparent),transparent 52%),linear-gradient(90deg,color-mix(in oklab,var(--ink) 5%,transparent) 1px,transparent 1px),linear-gradient(color-mix(in oklab,var(--ink) 4%,transparent) 1px,transparent 1px);background-size:auto,34px 34px,34px 34px;mask-image:linear-gradient(135deg,transparent 0%,black 30%,black 70%,transparent 100%);opacity:.38;transform:rotate(-2deg)}
.hp-bg{opacity:.82}
.hp-bg-glow{opacity:.34;filter:blur(96px)}
.hp-bg-grid{background-size:28px 28px;opacity:.24}
.hp-bg-line{left:18%;right:18%;opacity:.44}
.hp-corner{width:18px;height:18px;opacity:.58}
.hp-workbench{max-width:1130px;gap:18px;padding:18px;border:1px solid color-mix(in oklab,var(--line) 64%,var(--accent) 10%);border-radius:22px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 28%,transparent),color-mix(in oklab,var(--bg-deep) 18%,transparent));box-shadow:0 34px 110px -74px rgba(0,0,0,.96),inset 0 1px 0 rgba(255,255,255,.035);backdrop-filter:blur(10px)}
.hp-workbench::before{content:'';position:absolute;inset:10px;border:1px solid color-mix(in oklab,var(--accent) 10%,transparent);border-radius:16px;pointer-events:none}
.hp-gallery-head{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(190px,260px) auto 170px;gap:14px;align-items:center;min-height:118px;padding:18px 18px 18px 22px;border:1px solid color-mix(in oklab,var(--line) 70%,var(--accent) 12%);border-radius:16px;background:linear-gradient(135deg,color-mix(in oklab,var(--paper) 60%,transparent),color-mix(in oklab,var(--paper-2) 28%,transparent)),radial-gradient(ellipse 55% 90% at 0% 0%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 72%);box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent),0 20px 56px -48px rgba(0,0,0,.9);overflow:hidden}
.hp-gallery-head::before{content:'';position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 46%,transparent),color-mix(in oklab,var(--accent-2) 24%,transparent),transparent)}
.hp-gallery-head::after{content:'';position:absolute;right:160px;top:18px;bottom:18px;width:1px;background:linear-gradient(180deg,transparent,color-mix(in oklab,var(--line) 84%,transparent),transparent)}
.hp-gallery-title{position:relative;z-index:1;min-width:0}
.hp-gallery-title h1{margin:6px 0 5px;font-family:'Source Serif 4','Noto Serif SC',var(--font-display),serif;font-size:30px;line-height:1;font-weight:650;color:var(--ink)}
.hp-gallery-title p{margin:0;color:var(--ink-mute);font-size:12px;line-height:1.5}
.hp-gallery-status{position:relative;z-index:1;min-width:0;display:flex;flex-direction:column;gap:5px;padding:12px 14px;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:12px;background:color-mix(in oklab,var(--bg-deep) 36%,transparent)}
.hp-gallery-status span{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.hp-gallery-status strong{font-size:14px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hp-gallery-status em{font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--ink-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hp-gallery-actions{position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.hp-import-input{display:none}
.hp-gallery-art{position:relative;z-index:1;height:84px;min-width:150px}
.hp-art-board{position:absolute;right:0;top:8px;width:126px;height:68px;border:1px dashed color-mix(in oklab,var(--accent) 36%,var(--line));border-radius:10px;color:var(--accent);background:radial-gradient(ellipse 80% 80% at 50% 44%,color-mix(in oklab,var(--accent) 12%,transparent),transparent 68%),color-mix(in oklab,var(--bg-deep) 46%,transparent);overflow:hidden;box-shadow:0 16px 34px -28px color-mix(in oklab,var(--accent) 70%,transparent)}
.hp-art-board .hp-card-glyph{height:100%;opacity:.82}
.hp-art-frame{position:absolute;border:1px solid color-mix(in oklab,var(--accent) 22%,transparent);border-radius:7px;background:color-mix(in oklab,var(--paper-2) 18%,transparent);box-shadow:0 12px 24px -22px rgba(0,0,0,.8)}
.hp-art-frame i{position:absolute;height:1px;background:color-mix(in oklab,var(--accent) 34%,transparent)}
.hp-art-frame-a{right:96px;top:4px;width:54px;height:34px;transform:rotate(-6deg)}
.hp-art-frame-a i:first-child{left:10px;right:10px;top:12px}.hp-art-frame-a i:last-child{left:14px;right:18px;top:20px}
.hp-art-frame-b{right:28px;bottom:1px;width:70px;height:40px;transform:rotate(4deg);opacity:.76}
.hp-art-frame-b i:nth-child(1){left:12px;right:12px;top:12px}.hp-art-frame-b i:nth-child(2){left:12px;right:20px;top:20px}.hp-art-frame-b i:nth-child(3){left:12px;right:30px;top:28px}
.hp-project-grid{grid-template-columns:repeat(auto-fill,minmax(222px,1fr));gap:14px}
.hp-card{border-radius:12px;transition:transform .22s cubic-bezier(.2,.8,.2,1),border-color .2s ease,box-shadow .25s ease,background .25s ease}
.hp-card:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 24px 52px -36px rgba(0,0,0,.9),0 0 48px -30px color-mix(in oklab,var(--accent) 50%,transparent)}
.hp-card-project{min-height:226px;padding:14px 16px 13px}
.hp-card-project.is-current{box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 24px 54px -38px color-mix(in oklab,var(--accent) 54%,transparent),0 0 0 1px color-mix(in oklab,var(--accent) 18%,transparent)}
.hp-card-no{font-size:26px}
.hp-card-status{font-size:8.5px;letter-spacing:.18em;padding:3px 7px}
.hp-card-glyph-wrap{height:64px;margin:10px 0 13px;border-radius:8px}
.hp-card-title{font-size:18px;line-height:1.22}
.hp-card-sub{font-size:9.5px;letter-spacing:.13em}
.hp-card-stats{gap:7px;margin-top:3px}
.hp-card-stats span{font-size:12px}.hp-card-stats em{font-size:8px}
.hp-card-foot{margin-top:12px;padding-top:10px;font-size:9.5px;letter-spacing:.16em}
.hp-card-del{width:24px;height:24px;top:10px;right:10px}
.hp-card-create-btn{min-height:226px;padding:22px}
.hp-card-plus{width:42px;height:42px;font-size:28px}
.hp-card-create-label{font-size:15px}

@media (max-width:1180px){
  .hp-gallery-head{grid-template-columns:minmax(0,1fr) minmax(180px,240px) auto;grid-template-areas:'title status actions' 'art art art'}
  .hp-gallery-title{grid-area:title}.hp-gallery-status{grid-area:status}.hp-gallery-actions{grid-area:actions}.hp-gallery-art{grid-area:art;height:56px}
  .hp-art-board{left:0;right:auto;top:0}
}
@media (max-width:820px){
  .projects-home{padding:20px 14px 38px}
  .hp-workbench{padding:12px;border-radius:16px}
  .hp-gallery-head{grid-template-columns:1fr;grid-template-areas:'title' 'status' 'actions' 'art';padding:16px;min-height:0}
  .hp-gallery-actions{justify-content:flex-start}
  .hp-project-grid{grid-template-columns:1fr}
}

/* Atelier noir palette pass — premium graphite workspace */
.product-shell{background:linear-gradient(180deg,#0D0F0E 0%,#171817 46%,#080908 100%)}
.product-shell::before{background:radial-gradient(ellipse 58% 48% at 16% 7%,color-mix(in oklab,var(--accent) 9%,transparent),transparent 66%),radial-gradient(ellipse 38% 44% at 86% 20%,color-mix(in oklab,var(--accent-3) 7%,transparent),transparent 72%),radial-gradient(ellipse 46% 42% at 74% 94%,color-mix(in oklab,var(--accent-2) 6%,transparent),transparent 76%),linear-gradient(120deg,rgba(255,255,255,.018),transparent 44%);opacity:.9}
.product-shell::after{background-image:linear-gradient(color-mix(in oklab,var(--ink) 3.2%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--ink) 2.8%,transparent) 1px,transparent 1px),linear-gradient(135deg,transparent 0 47%,color-mix(in oklab,var(--accent) 18%,transparent) 48% 52%,transparent 53%),radial-gradient(color-mix(in oklab,var(--accent) 12%,transparent) .75px,transparent 1.2px);background-size:68px 68px,68px 68px,220px 220px,7px 7px;mask-image:radial-gradient(ellipse 78% 64% at 54% 42%,black 0%,transparent 82%);opacity:.36}
.product-sidebar{width:242px;flex-basis:242px;padding:18px 12px 14px;background:linear-gradient(180deg,color-mix(in oklab,#1B1C18 84%,transparent),color-mix(in oklab,#10110F 96%,transparent));border-right:1px solid color-mix(in oklab,var(--line) 80%,var(--accent) 8%);box-shadow:18px 0 56px -42px rgba(0,0,0,.98),inset -1px 0 0 rgba(255,255,255,.025)}
.product-sidebar::before{background:radial-gradient(ellipse 95% 32% at 12% 0%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 68%),linear-gradient(180deg,rgba(255,255,255,.022),transparent 38%)}
.product-brand{height:54px;margin:0 2px 12px;padding:0 8px 14px}
.product-brand::before{background:var(--accent);box-shadow:0 0 0 5px color-mix(in oklab,var(--accent) 12%,transparent),0 0 18px color-mix(in oklab,var(--accent) 48%,transparent)}
.product-brand strong{color:var(--ink);text-shadow:0 12px 28px rgba(0,0,0,.55)}
.product-brand span{color:color-mix(in oklab,var(--accent-soft) 32%,var(--ink-mute))}
.product-menu-frame{position:relative;margin:0 2px;padding:8px;border:1px solid color-mix(in oklab,var(--line) 76%,transparent);border-radius:14px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 42%,transparent),color-mix(in oklab,var(--bg-deep) 38%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent),0 16px 42px -34px rgba(0,0,0,.86)}
.product-menu-frame::before{content:'';position:absolute;left:12px;right:12px;top:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 26%,transparent),transparent)}
.product-menu-frame::after{content:'';position:absolute;right:10px;top:14px;width:34px;height:34px;border:1px solid color-mix(in oklab,var(--accent) 10%,transparent);border-radius:50%;opacity:.5;pointer-events:none}
.product-menu-frame .product-nav{padding:7px 0;gap:7px}
.product-nav button{border-radius:9px;min-height:40px;padding:0 10px;background:color-mix(in oklab,var(--bg-deep) 18%,transparent)}
.product-nav button::before{left:-9px;background:color-mix(in oklab,var(--accent) 78%,white);box-shadow:0 0 12px color-mix(in oklab,var(--accent) 58%,transparent)}
.product-nav button:hover{background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 7%,var(--paper-2)),color-mix(in oklab,var(--paper) 28%,transparent));border-color:color-mix(in oklab,var(--accent) 14%,var(--line));color:var(--ink)}
.product-nav button.active{background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 14%,var(--paper-2)),color-mix(in oklab,var(--paper) 26%,transparent));border-color:color-mix(in oklab,var(--accent) 30%,var(--line));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent),0 14px 34px -30px color-mix(in oklab,var(--accent) 42%,transparent)}
.product-nav .nav-index{color:color-mix(in oklab,var(--accent) 82%,white)}
.product-nav button .nav-meta{background:color-mix(in oklab,var(--accent) 8%,transparent);border-color:color-mix(in oklab,var(--accent) 18%,var(--line));color:var(--ink-soft)}
.product-sidebar-art{position:relative;margin:14px 2px 0;min-height:176px;border:1px solid color-mix(in oklab,var(--line) 72%,var(--accent) 8%);border-radius:16px;background:radial-gradient(ellipse 100% 70% at 50% 0%,color-mix(in oklab,var(--accent) 9%,transparent),transparent 70%),linear-gradient(180deg,color-mix(in oklab,var(--paper) 34%,transparent),color-mix(in oklab,var(--bg-deep) 46%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent),0 18px 46px -36px rgba(0,0,0,.9);overflow:hidden}
.product-sidebar-art::before{content:'';position:absolute;inset:0;background-image:linear-gradient(color-mix(in oklab,var(--ink) 4%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--ink) 3.5%,transparent) 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(180deg,black 0%,transparent 86%);opacity:.62}
.product-sidebar-art::after{content:'';position:absolute;left:14px;right:14px;bottom:18px;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent-2) 36%,transparent),transparent)}
.product-art-label{position:absolute;left:13px;top:11px;z-index:2;font-family:var(--font-mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:color-mix(in oklab,var(--accent-soft) 48%,var(--ink-mute))}
.product-art-window{position:absolute;inset:32px 12px 12px;border:1px solid color-mix(in oklab,var(--accent) 14%,var(--line));border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.02),transparent 48%),radial-gradient(ellipse 70% 80% at 52% 18%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 72%);overflow:hidden}
.product-art-moon{position:absolute;right:20px;top:15px;width:18px;height:18px;border-radius:50%;background:color-mix(in oklab,var(--accent-soft) 58%,white);box-shadow:0 0 24px color-mix(in oklab,var(--accent-soft) 42%,transparent)}
.product-art-panel{position:absolute;border:1px solid color-mix(in oklab,var(--accent) 34%,transparent);border-radius:5px;background:color-mix(in oklab,var(--paper-2) 28%,transparent);box-shadow:0 12px 22px -18px rgba(0,0,0,.9)}
.product-art-panel::before,.product-art-panel::after{content:'';position:absolute;left:8px;right:8px;height:1px;background:color-mix(in oklab,var(--accent) 36%,transparent)}
.product-art-panel::before{top:9px}.product-art-panel::after{top:17px}
.product-art-panel.panel-a{left:18px;top:24px;width:54px;height:34px;transform:rotate(-6deg)}
.product-art-panel.panel-b{right:18px;top:42px;width:58px;height:38px;transform:rotate(5deg)}
.product-art-panel.panel-c{left:55px;top:58px;width:70px;height:44px;opacity:.72}
.product-art-desk{position:absolute;left:18px;right:18px;bottom:18px;height:24px;border-top:1px solid color-mix(in oklab,var(--accent-2) 24%,transparent);background:linear-gradient(180deg,color-mix(in oklab,var(--accent-2) 8%,transparent),transparent)}
.product-art-screen{position:absolute;left:50%;bottom:28px;width:48px;height:25px;border:1px solid color-mix(in oklab,var(--accent) 32%,transparent);border-radius:4px;transform:translateX(-50%);background:color-mix(in oklab,var(--bg-deep) 56%,transparent)}
.product-art-line{position:absolute;width:58px;height:1px;background:color-mix(in oklab,var(--accent) 24%,transparent);transform-origin:left center}
.product-art-line.line-a{left:72px;top:86px;transform:rotate(-26deg)}
.product-art-line.line-b{left:78px;top:86px;transform:rotate(24deg)}
.product-sidebar-utility{position:relative;margin:12px 2px 0;display:flex;flex-direction:column;gap:8px}
.product-declaration-button{width:100%;min-height:58px;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid color-mix(in oklab,var(--accent) 20%,var(--line));border-radius:14px;background:radial-gradient(circle at 18% 12%,color-mix(in oklab,var(--accent-2) 13%,transparent),transparent 58%),linear-gradient(135deg,color-mix(in oklab,var(--paper) 70%,transparent),color-mix(in oklab,var(--paper-2) 48%,transparent));color:var(--ink);cursor:pointer;text-align:left;box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent),0 16px 34px -28px color-mix(in oklab,var(--accent) 42%,transparent);transition:transform .18s ease,border-color .18s ease,background .2s ease,box-shadow .22s ease}
.product-declaration-button:hover{transform:translateY(-1px);border-color:color-mix(in oklab,var(--accent) 44%,var(--line));background:radial-gradient(circle at 18% 12%,color-mix(in oklab,var(--accent-2) 17%,transparent),transparent 58%),linear-gradient(135deg,color-mix(in oklab,var(--paper) 82%,transparent),color-mix(in oklab,var(--paper-2) 58%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 20px 44px -30px color-mix(in oklab,var(--accent) 56%,transparent)}
.product-declaration-icon{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 34px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:12px;background:linear-gradient(145deg,color-mix(in oklab,var(--accent) 13%,var(--paper)),color-mix(in oklab,var(--accent-2) 8%,var(--paper-2)));color:color-mix(in oklab,var(--accent) 80%,var(--ink));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent)}
.product-declaration-copy{min-width:0;display:flex;flex-direction:column;gap:3px}
.product-declaration-copy strong{font-size:13px;line-height:1.15;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.product-declaration-copy em{font-style:normal;font-family:var(--font-mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.product-sidefoot{margin-top:12px;padding:12px 2px 0}
.product-account-button{background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 8%,var(--paper-2)),color-mix(in oklab,var(--paper) 50%,transparent));border-color:color-mix(in oklab,var(--accent) 18%,var(--line))}
.product-account-avatar{background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 86%,white),color-mix(in oklab,var(--accent-2) 34%,var(--accent)));color:#10130E}
.projects-home{background:linear-gradient(180deg,#0D0F0E 0%,#171817 56%,#080908 100%),radial-gradient(ellipse 46% 36% at 21% 7%,color-mix(in oklab,var(--accent) 9%,transparent),transparent 68%),radial-gradient(ellipse 34% 42% at 86% 20%,color-mix(in oklab,var(--accent-3) 5%,transparent),transparent 76%)}
.hp-gallery-head{border-color:color-mix(in oklab,var(--line) 78%,var(--accent) 7%);background:linear-gradient(135deg,color-mix(in oklab,var(--paper) 50%,transparent),color-mix(in oklab,var(--paper-2) 22%,transparent)),radial-gradient(ellipse 52% 90% at 0% 0%,color-mix(in oklab,var(--accent) 8%,transparent),transparent 74%)}
.hp-kicker{color:color-mix(in oklab,var(--accent-soft) 52%,var(--ink-mute))}
.hp-hero-btn.primary{background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 88%,white),color-mix(in oklab,var(--accent-2) 22%,var(--accent)));color:#10130E}
.hp-card-no,.hp-hero-stats strong{color:color-mix(in oklab,var(--accent) 90%,white)}
.hp-card-glyph,.hp-art-board{color:color-mix(in oklab,var(--accent) 78%,white)}
.hp-card-project.is-current{border-color:color-mix(in oklab,var(--accent) 36%,var(--line));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent),0 24px 54px -42px color-mix(in oklab,var(--accent) 42%,transparent),0 0 0 1px color-mix(in oklab,var(--accent) 12%,transparent)}

@media (max-width:820px){
  .product-sidebar-art{display:none}
}

/* Sidebar interaction and media preview controls */
.product-sidebar{transition:width .22s ease,flex-basis .22s ease,padding .22s ease;box-sizing:border-box;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
.product-sidebar::-webkit-scrollbar{width:7px}
.product-sidebar::-webkit-scrollbar-thumb{border-radius:999px;background:color-mix(in oklab,var(--accent) 30%,var(--line))}
.product-sidebar::-webkit-scrollbar-track{background:transparent}
.product-brand{display:flex;align-items:center;justify-content:space-between;gap:10px}
.product-brand .wordmark{min-width:0}
.product-sidebar-toggle{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 34px;border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line));border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 64%,transparent),color-mix(in oklab,var(--bg-deep) 42%,transparent));color:var(--ink-soft);cursor:pointer;box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent);transition:border-color .18s ease,color .18s ease,background .18s ease}
.product-sidebar-toggle:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 40%,var(--line));background:color-mix(in oklab,var(--accent) 10%,var(--paper))}
.product-sidebar-toggle svg,.product-nav-icon svg,.product-account-avatar svg,.product-declaration-icon svg{width:18px;height:18px;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}
.product-nav button{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;padding:10px 10px}
.product-nav-icon{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 32px;border:1px solid color-mix(in oklab,var(--line) 74%,transparent);border-radius:10px;color:color-mix(in oklab,var(--accent-soft) 64%,var(--ink-mute));background:linear-gradient(145deg,color-mix(in oklab,var(--paper-2) 70%,transparent),color-mix(in oklab,var(--bg-deep) 46%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent)}
.product-nav button:hover .product-nav-icon,.product-nav button.active .product-nav-icon{color:var(--accent);border-color:color-mix(in oklab,var(--accent) 32%,var(--line));background:radial-gradient(circle at 35% 25%,color-mix(in oklab,var(--accent) 22%,transparent),transparent 60%),color-mix(in oklab,var(--paper-2) 72%,transparent)}
.product-nav .nav-label{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.product-sidefoot{margin-top:auto;padding:12px 2px 0}
.product-account-avatar{position:relative;color:#10130E}
.product-account-avatar svg{width:19px;height:19px;opacity:.72}
.product-account-avatar b{position:absolute;right:-3px;bottom:-3px;min-width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:color-mix(in oklab,var(--bg-deep) 82%,black);border:1px solid color-mix(in oklab,var(--accent-2) 36%,transparent);color:color-mix(in oklab,var(--accent-2) 76%,white);font-family:var(--font-mono);font-size:9px;line-height:1}
.product-sidebar.collapsed{width:78px;flex-basis:78px;padding:18px 10px 14px}
.product-sidebar.collapsed .product-brand{height:auto;margin:0 0 12px;padding:0 0 12px;justify-content:center}
.product-sidebar.collapsed .product-brand::before,.product-sidebar.collapsed .wordmark,.product-sidebar.collapsed .product-sidebar-art,.product-sidebar.collapsed .nav-label,.product-sidebar.collapsed .nav-meta,.product-sidebar.collapsed .product-account-copy{display:none}
.product-sidebar.collapsed .product-menu-frame{margin:0;padding:6px;border-radius:14px}
.product-sidebar.collapsed .product-nav{padding:6px 0;gap:8px}
.product-sidebar.collapsed .product-nav button{display:flex;align-items:center;justify-content:center;padding:8px;min-height:46px}
.product-sidebar.collapsed .product-nav-icon{width:34px;height:34px}
.product-sidebar.collapsed .product-sidebar-utility{margin:12px 0 0}
.product-sidebar.collapsed .product-declaration-button{min-height:50px;justify-content:center;padding:8px;border-radius:13px}
.product-sidebar.collapsed .product-declaration-copy{display:none}
.product-sidebar.collapsed .product-sidefoot{padding:12px 0 0}
.product-sidebar.collapsed .product-account-actions{grid-template-columns:1fr;gap:8px}
.product-sidebar.collapsed .product-account-button{min-height:50px;justify-content:center;padding:8px;border-radius:13px}
.product-sidebar.collapsed .product-account-avatar{width:34px;height:34px;flex-basis:34px}
.product-sidebar.collapsed .product-account-recharge{min-width:0;min-height:38px;border-radius:12px;font-size:11px}
@media (max-height:820px){
  .product-sidebar{padding-top:12px;padding-bottom:12px}
  .product-brand{height:44px;margin-bottom:8px;padding-bottom:10px}
  .product-menu-frame{padding:6px}
  .product-menu-frame .product-nav{padding:5px 0;gap:5px}
  .product-nav button{min-height:36px;padding:7px 9px}
  .product-nav-icon{width:30px;height:30px;flex-basis:30px}
  .product-sidebar-art{display:none}
  .product-sidebar-utility{margin-top:8px;gap:6px}
  .product-declaration-button{min-height:48px;padding:8px 10px}
  .product-bottom-actions{gap:6px;margin-bottom:8px}
  .product-theme-switch,.product-update-check{min-height:44px;padding:7px 9px}
  .product-theme-icon,.product-declaration-icon{width:30px;height:30px;flex-basis:30px;border-radius:10px}
  .product-sidefoot{margin-top:8px;padding-top:8px}
  .product-account-button{min-height:58px;padding:8px 10px}
}
.media-thumb::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,rgba(0,0,0,.14),rgba(0,0,0,.48));opacity:.36;pointer-events:none;transition:opacity .18s ease}
.media-card:hover .media-thumb::after{opacity:.64}
.media-preview-button{position:absolute;left:50%;top:50%;z-index:3;transform:translate(-50%,-50%);min-width:88px;height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:linear-gradient(135deg,rgba(12,17,16,.76),rgba(24,32,29,.64));color:#F6F3E9;backdrop-filter:blur(12px);box-shadow:0 16px 38px -22px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.1);font-size:12px;font-weight:700;cursor:pointer;opacity:.92;transition:opacity .18s ease,border-color .18s ease,background .18s ease,color .18s ease}
.media-preview-button:hover{opacity:1;color:color-mix(in oklab,var(--accent) 82%,white);border-color:color-mix(in oklab,var(--accent) 48%,rgba(255,255,255,.2));background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 18%,rgba(12,17,16,.82)),rgba(24,32,29,.72))}
.media-preview-button svg{width:17px;height:17px;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
.media-delete-button{position:absolute;right:8px;top:8px;z-index:4;width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:linear-gradient(135deg,rgba(42,16,16,.82),rgba(21,16,14,.68));color:#FFE3E3;backdrop-filter:blur(12px);box-shadow:0 14px 32px -20px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.1);cursor:pointer;opacity:.94;transition:opacity .18s ease,border-color .18s ease,background .18s ease,color .18s ease,transform .18s ease}
.media-delete-button:hover{opacity:1;transform:translateY(-1px);border-color:color-mix(in oklab,#ff6b6b 52%,rgba(255,255,255,.2));background:linear-gradient(135deg,rgba(92,28,28,.88),rgba(31,18,16,.76));color:#fff}
.media-delete-button:disabled{cursor:progress;opacity:.58;transform:none}
.media-delete-button svg{display:block;stroke:currentColor;pointer-events:none}
.media-preview-backdrop{position:fixed;inset:0;z-index:320;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,5,6,.72);backdrop-filter:blur(18px)}
.has-window-chrome .media-preview-backdrop{top:38px;bottom:auto;height:calc(100% - 38px)}
.media-preview-dialog{width:calc(100vw - 32px);height:calc(100vh - 32px);max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);display:flex;flex-direction:column;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));border-radius:18px;background:linear-gradient(180deg,color-mix(in oklab,#1B1C18 92%,transparent),color-mix(in oklab,#0D0F0E 98%,transparent));box-shadow:0 36px 90px -46px rgba(0,0,0,.96),inset 0 1px 0 rgba(255,255,255,.06);overflow:hidden}
.has-window-chrome .media-preview-dialog{height:calc(100vh - 70px);max-height:calc(100vh - 70px)}
.media-preview-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;border-bottom:1px solid color-mix(in oklab,var(--line-soft) 76%,transparent);background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 8%,transparent),transparent 54%,color-mix(in oklab,var(--accent-2) 6%,transparent))}
.media-preview-head div{min-width:0;display:grid;gap:3px}
.media-preview-head span{font-family:var(--font-mono);font-size:10px;color:color-mix(in oklab,var(--accent-soft) 58%,var(--ink-mute))}
.media-preview-head strong{font-size:14px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-preview-close{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--line) 82%,transparent);border-radius:10px;background:color-mix(in oklab,var(--paper-2) 54%,transparent);color:var(--ink-soft);cursor:pointer}
.media-preview-close:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 36%,var(--line));background:color-mix(in oklab,var(--accent) 9%,var(--paper))}
.media-preview-close svg{width:18px;height:18px;stroke:currentColor;stroke-width:1.9;stroke-linecap:round}
.media-preview-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:10px;background:radial-gradient(ellipse 74% 80% at 50% 18%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 72%),#080908;overflow:hidden}
.media-preview-stage img,.media-preview-stage video{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;display:block;border-radius:12px;box-shadow:0 24px 72px -44px rgba(0,0,0,.92)}
.media-preview-stage.is-image-preview{padding:0;cursor:grab;touch-action:none;user-select:none}
.media-preview-image-viewer{width:100%;height:100%;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:none;cursor:grab}
.media-preview-image-viewer.dragging{cursor:grabbing}
.media-preview-stage .media-preview-zoomable-image{width:auto;height:auto;max-width:100%;max-height:100%;transform-origin:center center;will-change:transform;user-select:none;pointer-events:none}
.media-preview-stage audio{width:min(560px,100%)}
.media-preview-text{width:min(640px,100%);display:grid;gap:12px;border:1px solid color-mix(in oklab,var(--line) 80%,transparent);border-radius:14px;padding:18px;background:color-mix(in oklab,var(--paper) 50%,transparent)}
.media-preview-text strong{font-size:16px;color:var(--ink)}
.media-preview-text p{margin:0;color:var(--ink-soft);line-height:1.7;white-space:pre-wrap}
@media (max-width:820px){
  .media-preview-backdrop{padding:10px}
  .media-preview-dialog{width:calc(100vw - 20px);height:calc(100vh - 20px);max-width:calc(100vw - 20px);max-height:calc(100vh - 20px)}
  .has-window-chrome .media-preview-dialog{height:calc(100vh - 58px);max-height:calc(100vh - 58px)}
}

/* Sidebar software declaration */
.software-declaration-overlay{position:fixed;inset:0;z-index:1450;display:flex;align-items:center;justify-content:center;padding:28px;background:rgba(5,18,32,.32);backdrop-filter:blur(18px)}
.software-declaration-dialog{width:min(920px,calc(100vw - 56px));max-height:min(760px,calc(100vh - 72px));display:grid;grid-template-rows:auto minmax(0,1fr) auto;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:18px;background:radial-gradient(ellipse 76% 60% at 8% 0%,color-mix(in oklab,var(--accent) 13%,transparent),transparent 70%),linear-gradient(180deg,color-mix(in oklab,var(--paper) 94%,transparent),color-mix(in oklab,var(--paper-2) 88%,transparent));box-shadow:0 34px 100px -46px rgba(34,89,138,.52),inset 0 1px 0 rgba(255,255,255,.74);overflow:hidden}
.software-declaration-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;padding:18px 20px;border-bottom:1px solid color-mix(in oklab,var(--line-soft) 76%,transparent);background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 8%,transparent),transparent 52%,color-mix(in oklab,var(--accent-2) 6%,transparent))}
.software-declaration-mark{width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 30%,var(--line));border-radius:12px;background:linear-gradient(145deg,color-mix(in oklab,var(--accent) 13%,var(--paper)),color-mix(in oklab,var(--accent-2) 8%,var(--paper-2)));color:color-mix(in oklab,var(--accent) 82%,var(--ink));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent)}
.software-declaration-mark svg{width:22px;height:22px;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
.software-declaration-head div{min-width:0;display:flex;flex-direction:column;gap:5px}
.software-declaration-head span:not(.software-declaration-mark){font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute)}
.software-declaration-head h2{margin:0;font-size:22px;line-height:1.15;color:var(--ink)}
.software-declaration-close{min-height:36px;border:1px solid var(--line);border-radius:9px;background:color-mix(in oklab,var(--paper) 82%,transparent);color:var(--ink-soft);padding:0 14px;cursor:pointer;font-size:13px;font-weight:800}
.software-declaration-close:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 42%,var(--line));background:color-mix(in oklab,var(--accent) 8%,var(--paper))}
.software-declaration-body{min-height:0;overflow:auto;padding:20px;display:flex;flex-direction:column;gap:14px}
.software-declaration-body::-webkit-scrollbar{width:8px}
.software-declaration-body::-webkit-scrollbar-thumb{border-radius:999px;background:color-mix(in oklab,var(--accent) 34%,var(--line))}
.software-declaration-body::-webkit-scrollbar-track{background:color-mix(in oklab,var(--paper-2) 48%,transparent);border-radius:999px}
.software-declaration-intro,.software-declaration-section p{margin:0;color:var(--ink-soft);font-size:13px;line-height:1.75}
.software-declaration-intro{padding:13px 14px;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:11px;background:color-mix(in oklab,var(--paper-2) 58%,transparent);color:var(--ink)}
.software-declaration-section{display:flex;flex-direction:column;gap:9px;border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:12px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 58%,transparent),color-mix(in oklab,var(--paper) 76%,transparent));padding:15px}
.software-declaration-section h3{margin:0;font-size:15px;line-height:1.3;color:var(--ink)}
.software-declaration-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 20px;border-top:1px solid color-mix(in oklab,var(--line-soft) 76%,transparent);background:linear-gradient(90deg,color-mix(in oklab,var(--paper) 88%,transparent),color-mix(in oklab,var(--accent) 7%,transparent))}
.software-declaration-footer span{min-width:0;font-size:12px;line-height:1.5;color:var(--ink-mute)}
.software-declaration-confirm{min-height:38px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:1px solid color-mix(in oklab,var(--accent) 78%,white);border-radius:10px;background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent-2) 28%,var(--accent)));color:#092238;padding:0 18px;cursor:pointer;font-size:13px;font-weight:850;box-shadow:0 16px 36px -28px color-mix(in oklab,var(--accent) 72%,transparent),inset 0 1px 0 rgba(255,255,255,.34)}
.software-declaration-confirm:hover{filter:brightness(1.04);transform:translateY(-1px)}
.theme-b .software-declaration-overlay{background:rgba(3,5,5,.58);backdrop-filter:blur(18px) saturate(1.05)}
.theme-b .software-declaration-dialog{border-color:rgba(228,212,173,.34);background:radial-gradient(ellipse 78% 62% at 9% 0%,rgba(198,166,106,.15),transparent 70%),linear-gradient(180deg,#1D201C 0%,#121412 100%);box-shadow:0 34px 100px -46px rgba(0,0,0,.92),inset 0 1px 0 rgba(255,255,255,.08)}
.theme-b .software-declaration-head{border-bottom-color:rgba(228,212,173,.16);background:linear-gradient(90deg,rgba(198,166,106,.13),rgba(255,255,255,.025) 48%,rgba(111,139,107,.1))}
.theme-b .software-declaration-mark{border-color:rgba(228,212,173,.32);background:linear-gradient(145deg,rgba(198,166,106,.18),rgba(255,255,255,.04));color:#EAD9AA;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)}
.theme-b .software-declaration-head span:not(.software-declaration-mark){color:#D8C7A7}
.theme-b .software-declaration-head h2{color:#FFF7E8;text-shadow:0 0 20px rgba(228,212,173,.18)}
.theme-b .software-declaration-close{border-color:rgba(228,212,173,.22);background:rgba(34,37,31,.88);color:#E7DDCC}
.theme-b .software-declaration-close:hover{color:#FFF7E8;border-color:rgba(228,212,173,.46);background:rgba(198,166,106,.14)}
.theme-b .software-declaration-body{background:linear-gradient(180deg,rgba(255,255,255,.018),rgba(0,0,0,.04))}
.theme-b .software-declaration-body::-webkit-scrollbar-thumb{background:rgba(228,212,173,.34)}
.theme-b .software-declaration-body::-webkit-scrollbar-track{background:rgba(255,255,255,.045)}
.theme-b .software-declaration-intro,.theme-b .software-declaration-section p{color:#E7DDCC}
.theme-b .software-declaration-intro{border-color:rgba(228,212,173,.18);background:rgba(255,255,255,.055);color:#F1E8DA}
.theme-b .software-declaration-section{border-color:rgba(228,212,173,.16);background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))}
.theme-b .software-declaration-section h3{color:#F5E7C8}
.theme-b .software-declaration-footer{border-top-color:rgba(228,212,173,.16);background:linear-gradient(90deg,rgba(18,20,18,.94),rgba(198,166,106,.1))}
.theme-b .software-declaration-footer span{color:#D3C8B6}
.theme-b .software-declaration-confirm{border-color:#F2DFA9;background:linear-gradient(135deg,#E4D4AD,#C6A66A);color:#171817}
@media (max-width:720px){
  .software-declaration-overlay{padding:16px}
  .software-declaration-dialog{width:calc(100vw - 32px);max-height:calc(100vh - 48px)}
  .software-declaration-head{grid-template-columns:auto minmax(0,1fr);gap:12px}
  .software-declaration-close{grid-column:1 / -1;width:100%}
  .software-declaration-footer{flex-direction:column;align-items:stretch}
  .software-declaration-confirm{width:100%}
}

/* Desktop announcements */
.announcement-center-page{display:flex;flex-direction:column;gap:14px}
.announcement-page-head{margin-bottom:0}
.announcement-page-kicker{display:block;margin:0 0 7px;font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.announcement-sync-error{border:1px solid color-mix(in oklab,#ef4444 38%,var(--line));border-radius:8px;background:color-mix(in oklab,#ef4444 9%,var(--paper));color:#ef4444;padding:10px 12px;font-size:12px;line-height:1.5}
.announcement-list{display:grid;gap:10px;max-width:900px}
.announcement-list-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:start;border:1px solid var(--line);border-radius:8px;background:color-mix(in oklab,var(--paper) 90%,transparent);padding:14px}
.announcement-list-main{min-width:0;display:grid;gap:8px}
.announcement-list-title{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.announcement-list-title h2{margin:0;min-width:0;font-size:15px;line-height:1.35;color:var(--ink);overflow-wrap:anywhere}
.announcement-list-main p{margin:0;color:var(--ink-soft);font-size:13px;line-height:1.65;overflow-wrap:anywhere}
.announcement-level,.announcement-read-state{display:inline-flex;align-items:center;min-height:22px;border:1px solid var(--line-soft);border-radius:7px;padding:0 8px;font-size:11px;line-height:1;color:var(--ink-soft);background:color-mix(in oklab,var(--paper-2) 68%,transparent)}
.announcement-level.level-important{border-color:color-mix(in oklab,#f59e0b 42%,var(--line));color:#b45309;background:color-mix(in oklab,#f59e0b 10%,var(--paper))}
.announcement-level.level-maintenance{border-color:color-mix(in oklab,var(--accent) 44%,var(--line));color:color-mix(in oklab,var(--accent) 78%,var(--ink));background:color-mix(in oklab,var(--accent) 10%,var(--paper))}
.announcement-level.level-outage{border-color:color-mix(in oklab,#ef4444 42%,var(--line));color:#dc2626;background:color-mix(in oklab,#ef4444 10%,var(--paper))}
.announcement-read-state.read{color:color-mix(in oklab,var(--ink-mute) 92%,var(--ink));background:transparent}
.announcement-read-state.unread{border-color:color-mix(in oklab,var(--accent-2) 36%,var(--line));color:color-mix(in oklab,var(--accent-2) 80%,var(--ink));background:color-mix(in oklab,var(--accent-2) 9%,var(--paper))}
.announcement-pushed-time{white-space:nowrap;color:var(--ink-mute);font-family:var(--font-mono);font-size:11px;line-height:1.7}
.announcement-empty{min-height:180px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--line);border-radius:8px;background:color-mix(in oklab,var(--paper) 74%,transparent);color:var(--ink-mute);font-size:13px}
.desktop-announcement-mask{z-index:940}
.desktop-announcement-modal{width:min(460px,calc(100vw - 32px));border-radius:12px}
.desktop-announcement-badge{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 34%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--accent) 13%,var(--paper));color:var(--accent)}
.desktop-announcement-body{display:grid;gap:14px;padding:18px 22px}
.desktop-announcement-body p{margin:0;color:var(--ink-soft);font-size:13px;line-height:1.7;overflow-wrap:anywhere;white-space:pre-wrap}
.desktop-announcement-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--ink-mute);font-family:var(--font-mono);font-size:11px}
.desktop-announcement-footer{min-height:58px}
.desktop-announcement-toast{position:fixed;right:18px;bottom:18px;z-index:950;width:min(360px,calc(100vw - 36px));display:grid;gap:7px;border:1px solid var(--line);border-radius:8px;background:color-mix(in oklab,var(--paper) 94%,transparent);box-shadow:0 20px 54px -32px rgba(0,0,0,.62);padding:12px;color:var(--ink)}
.desktop-announcement-toast strong{font-size:13px;line-height:1.35}
.desktop-announcement-toast span{color:var(--ink-mute);font-size:12px;line-height:1.5}
.canvas-action-toast{position:fixed;right:18px;bottom:18px;z-index:960;width:min(340px,calc(100vw - 36px));display:grid;gap:6px;border:1px solid color-mix(in oklab,var(--accent) 34%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--paper) 94%,transparent);box-shadow:0 20px 54px -32px rgba(0,0,0,.62);padding:12px;color:var(--ink)}
.canvas-action-toast.stacked{bottom:116px}
.canvas-action-toast strong{font-size:13px;line-height:1.35}
.canvas-action-toast span{color:var(--ink-mute);font-size:12px;line-height:1.5;overflow-wrap:anywhere}
.canvas-action-toast.success{border-color:color-mix(in oklab,#10b981 42%,var(--line))}
.canvas-action-toast.error{border-color:color-mix(in oklab,#ef4444 48%,var(--line))}
.canvas-action-toast.error strong{color:#ef4444}
.theme-b .announcement-list-item,.theme-b .announcement-empty,.theme-b .desktop-announcement-toast,.theme-b .canvas-action-toast{background:color-mix(in oklab,var(--paper) 86%,transparent);border-color:color-mix(in oklab,var(--line) 88%,var(--accent) 8%)}
@media (max-width:720px){
  .announcement-list-item{grid-template-columns:1fr;gap:8px}
  .announcement-pushed-time{white-space:normal}
}

/* Model catalog page */
.model-catalog-page{display:flex;flex-direction:column;box-sizing:border-box;gap:16px;min-height:0;overflow:hidden;padding:18px 22px 24px;background:linear-gradient(145deg,rgba(248,252,255,.84),rgba(222,239,255,.52) 54%,rgba(248,252,255,.68)),linear-gradient(28deg,transparent 58%,color-mix(in oklab,var(--accent) 7%,transparent));}
.model-catalog-head{min-height:118px;margin-bottom:0;padding:20px;border:1px solid color-mix(in oklab,var(--line) 78%,var(--accent) 8%);border-radius:14px;background:linear-gradient(135deg,color-mix(in oklab,var(--paper) 58%,transparent),color-mix(in oklab,var(--paper-2) 24%,transparent)),radial-gradient(ellipse 56% 100% at 0% 0%,color-mix(in oklab,var(--accent) 8%,transparent),transparent 74%);box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent),0 24px 58px -46px rgba(0,0,0,.9)}
.model-page-kicker{display:inline-flex;margin-bottom:8px;font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;color:color-mix(in oklab,var(--accent-soft) 58%,var(--ink-mute))}
.model-catalog-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.model-catalog-stats div{min-height:78px;padding:14px 16px;border:1px solid color-mix(in oklab,var(--line) 78%,var(--accent) 8%);border-radius:12px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 62%,transparent),color-mix(in oklab,var(--paper-2) 34%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent)}
.model-catalog-stats span{display:block;margin-bottom:8px;font-size:11px;color:var(--ink-mute)}
.model-catalog-stats strong{font-size:24px;color:color-mix(in oklab,var(--accent) 88%,white);line-height:1}
.model-catalog-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;flex:0 0 auto;padding:8px;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(231,244,255,.68));box-shadow:inset 0 1px 0 rgba(255,255,255,.88),0 24px 64px -46px rgba(58,128,196,.46);backdrop-filter:blur(18px) saturate(1.1)}
.model-catalog-tabs button{min-width:0;min-height:58px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid transparent;border-radius:15px;background:transparent;color:var(--ink-soft);cursor:pointer;transition:background .18s ease,border-color .18s ease,color .18s ease,box-shadow .2s ease,transform .18s ease}
.model-catalog-tabs button:hover{transform:translateY(-1px);color:var(--ink);background:rgba(255,255,255,.46);border-color:color-mix(in oklab,var(--accent) 18%,var(--line))}
.model-catalog-tabs button:focus-visible{outline:2px solid color-mix(in oklab,var(--accent) 72%,white);outline-offset:2px}
.model-catalog-tabs button.active{color:#064081;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(226,244,255,.78));border-color:color-mix(in oklab,var(--accent) 42%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 18px 42px -28px rgba(73,144,214,.46)}
.model-catalog-tabs strong{font-size:14px;font-weight:650;line-height:1.2;white-space:nowrap}
.model-catalog-tabs span{min-width:24px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--line-soft) 76%,transparent);border-radius:999px;background:color-mix(in oklab,var(--bg-deep) 34%,transparent);font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)}
.model-catalog-tabs button.active span{color:color-mix(in oklab,var(--accent-soft) 76%,white);border-color:color-mix(in oklab,var(--accent) 35%,var(--line));background:color-mix(in oklab,var(--accent) 12%,transparent)}
.model-list-section{position:relative;display:flex;flex:1 1 auto;flex-direction:column;box-sizing:border-box;min-height:0;border:1px solid color-mix(in oklab,var(--accent) 24%,var(--line));border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(229,244,255,.62) 62%,rgba(248,252,255,.74));box-shadow:inset 0 1px 0 rgba(255,255,255,.88),0 32px 78px -48px rgba(59,127,190,.5);overflow:hidden;backdrop-filter:blur(18px) saturate(1.08)}
.model-result-frame{min-height:0;border-radius:24px;background:linear-gradient(132deg,rgba(255,255,255,.86),rgba(231,245,255,.66) 58%,rgba(248,252,255,.8)),linear-gradient(28deg,transparent 54%,color-mix(in oklab,var(--accent) 8%,transparent))}
.model-list-section::before{content:'';position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.92),color-mix(in oklab,var(--accent) 38%,transparent),transparent)}
.model-list-section::after{content:'';position:absolute;right:-18%;top:-18%;width:56%;height:56%;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.28),transparent 44%);transform:rotate(-12deg)}
.model-list-section-head{position:relative;z-index:1;min-height:118px;display:flex;flex:0 0 auto;align-items:flex-end;justify-content:space-between;gap:18px;padding:26px 30px 24px;border-bottom:1px solid color-mix(in oklab,var(--accent) 14%,var(--line-soft));background:linear-gradient(105deg,rgba(255,255,255,.64),transparent 44%,color-mix(in oklab,var(--accent) 7%,transparent))}
.model-list-section-head span{display:block;margin-bottom:9px;font-size:13px;font-weight:650;color:color-mix(in oklab,var(--accent) 58%,var(--ink-mute))}
.model-list-section-head h2{margin:0;font-size:30px;line-height:1.08;color:#09284f}
.model-list-section-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}
.model-list-section-actions>strong{font-family:var(--font-mono);font-size:13px;color:#164c8f}
.model-sync-btn{min-height:42px;padding:0 18px;border-radius:13px;border-color:color-mix(in oklab,var(--accent) 48%,#fff);background:linear-gradient(135deg,#8cc8ff,#3d91ff 68%,#6aa9ff);color:#fff;font-size:13px;font-weight:800;box-shadow:0 16px 34px -20px rgba(36,116,230,.78),inset 0 1px 0 rgba(255,255,255,.58)}
.video-model-family-tabs{position:relative;z-index:1;display:flex;gap:8px;flex:0 0 auto;align-items:center;overflow:auto;padding:12px 28px;border-bottom:1px solid color-mix(in oklab,var(--accent) 14%,var(--line-soft));background:linear-gradient(180deg,rgba(247,252,255,.74),rgba(229,244,255,.5));scrollbar-gutter:stable}
.video-model-family-tabs button{min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:7px;flex:0 0 auto;padding:0 12px;border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line));border-radius:10px;background:rgba(255,255,255,.58);color:var(--ink-soft);cursor:pointer;transition:background .18s ease,border-color .18s ease,color .18s ease,box-shadow .18s ease}
.video-model-family-tabs button:hover{color:var(--ink);border-color:color-mix(in oklab,var(--accent) 34%,var(--line));background:rgba(255,255,255,.78)}
.video-model-family-tabs button.active{color:#0757a8;border-color:color-mix(in oklab,var(--accent) 48%,#fff);background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(225,243,255,.74));box-shadow:inset 0 1px 0 rgba(255,255,255,.86),0 14px 28px -24px rgba(36,116,230,.62)}
.video-model-family-tabs strong{font-size:12px;font-weight:800;white-space:nowrap}
.video-model-family-tabs span{min-width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--line-soft) 72%,transparent);border-radius:999px;background:color-mix(in oklab,var(--paper-2) 66%,transparent);font-family:var(--font-mono);font-size:10px;color:var(--ink-mute)}
.model-list-scroll{display:block;flex:1 1 auto;box-sizing:border-box;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
.model-list-scroll::-webkit-scrollbar{width:9px}
.model-list-scroll::-webkit-scrollbar-thumb{border-radius:999px;background:color-mix(in oklab,var(--accent) 34%,var(--line))}
.model-list-scroll::-webkit-scrollbar-track{border-radius:999px;background:color-mix(in oklab,var(--paper-2) 52%,transparent)}
.seedance-volc-price-table{position:relative;z-index:1;margin:26px 28px 0;border:1px solid color-mix(in oklab,var(--accent) 24%,var(--line));border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(232,246,255,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.94),0 24px 58px -42px rgba(57,128,196,.5);overflow:hidden}
.seedance-volc-price-table::before{content:'';position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.94),color-mix(in oklab,var(--accent) 34%,transparent),transparent)}
.seedance-volc-price-head{position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:14px;padding:18px 20px 16px;border-bottom:1px solid color-mix(in oklab,var(--accent) 16%,var(--line-soft));background:linear-gradient(105deg,rgba(255,255,255,.62),transparent 46%,color-mix(in oklab,var(--accent) 8%,transparent))}
.seedance-volc-price-head span{display:block;margin-bottom:7px;font-size:11px;font-weight:800;color:color-mix(in oklab,var(--accent) 62%,var(--ink-mute))}
.seedance-volc-price-head h3{margin:0;font-size:19px;line-height:1.18;color:#09284f}
.seedance-volc-price-head strong{font-family:var(--font-mono);font-size:12px;color:#1660ab;white-space:nowrap}
.seedance-volc-table-scroll{overflow:auto;scrollbar-gutter:stable}
.seedance-volc-price-table table{width:100%;min-width:760px;border-collapse:collapse;table-layout:fixed}
.seedance-volc-price-table th,.seedance-volc-price-table td{padding:13px 16px;border-bottom:1px solid color-mix(in oklab,var(--accent) 12%,var(--line-soft));text-align:left;vertical-align:middle}
.seedance-volc-price-table th{font-size:12px;font-weight:850;color:#254466;background:rgba(255,255,255,.5)}
.seedance-volc-price-table td{font-size:13px;font-weight:750;color:#1f4e78}
.seedance-volc-price-table .seedance-volc-price-cell{font-family:var(--font-mono);font-size:12px;color:#0865d8;white-space:nowrap}
.seedance-volc-price-table tbody tr:last-child td{border-bottom:0}
.seedance-volc-price-table tbody tr:hover td{background:rgba(255,255,255,.38)}
.seedance-volc-model-cell{width:28%;background:linear-gradient(180deg,rgba(255,255,255,.58),rgba(226,244,255,.5))}
.seedance-volc-model-cell strong{display:block;margin-bottom:6px;font-size:14px;color:#0a2548;overflow-wrap:anywhere}
.seedance-volc-model-cell span{display:inline-flex;align-items:center;min-height:22px;padding:0 8px;border:1px solid color-mix(in oklab,var(--accent) 28%,#fff);border-radius:999px;background:color-mix(in oklab,var(--accent) 10%,transparent);font-size:11px;color:#0b6fd3}
.model-catalog-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:22px;align-content:start;align-items:start;min-width:0;padding:26px 28px 32px}
.model-catalog-card{position:relative;box-sizing:border-box;min-height:306px;display:flex;flex-direction:column;justify-content:flex-start;gap:15px;overflow:hidden;padding:20px;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(236,248,255,.7)),linear-gradient(145deg,color-mix(in oklab,var(--accent) 8%,transparent),transparent 54%);box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 26px 58px -42px rgba(70,132,190,.5);transition:border-color .18s ease,box-shadow .2s ease,transform .18s ease}
.model-catalog-card::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(138deg,rgba(255,255,255,.72),transparent 30%,rgba(80,163,255,.08) 72%,transparent)}
.model-catalog-card::after{content:'';position:absolute;left:20px;right:20px;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.92),color-mix(in oklab,var(--accent) 34%,transparent),transparent)}
.model-catalog-card>*{position:relative;z-index:1}
.model-catalog-card:hover{transform:translateY(-3px);border-color:color-mix(in oklab,var(--accent) 44%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.96),0 34px 74px -42px rgba(58,128,196,.58)}
.model-catalog-card.is-disabled{opacity:.82}
.model-catalog-card-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:14px;min-height:74px}
.model-brand-icon{position:relative;width:62px;height:62px;display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 28%,#fff);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.9),rgba(217,239,255,.72));color:#0755b8;box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 18px 32px -24px rgba(0,102,204,.72)}
.model-brand-icon::after{content:'';position:absolute;left:13px;right:13px;bottom:-7px;height:9px;border-radius:999px;background:color-mix(in oklab,var(--accent) 28%,transparent);filter:blur(5px)}
.model-brand-icon svg{position:relative;z-index:1;width:31px;height:31px}
.model-brand-generic svg{stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.model-brand-openai{color:color-mix(in oklab,var(--accent-soft) 78%,white)}
.model-title-copy{min-width:0;display:flex;flex-direction:column;gap:4px;padding-top:13px}
.model-title-copy strong{font-size:16px;font-weight:800;line-height:1.35;color:#0a2548;overflow:visible;white-space:normal;overflow-wrap:anywhere}
.model-title-copy span{font-family:var(--font-mono);font-size:11px;line-height:1.3;color:var(--ink-mute);overflow:visible;white-space:normal;overflow-wrap:anywhere}
.model-title-copy .model-face-pass-badge{display:inline-flex;width:max-content;max-width:100%;margin-top:1px;padding:3px 8px;border:1px solid color-mix(in oklab,#ef4444 42%,var(--accent));border-radius:999px;background:color-mix(in oklab,#ef4444 10%,var(--paper));color:#ef4444;font-family:inherit;font-size:12px;font-weight:800;line-height:1.15;letter-spacing:0;white-space:nowrap;box-shadow:0 8px 22px -16px #ef4444}
.model-card-actions{justify-self:end;display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:72px;margin-top:8px}
.model-catalog-card .status-pill{justify-self:end;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.64);font-size:12px;font-weight:800;color:#6f7f91;border-color:color-mix(in oklab,var(--line) 72%,#fff);box-shadow:0 10px 22px -18px rgba(25,111,213,.72),inset 0 1px 0 rgba(255,255,255,.82)}
.model-catalog-card .status-pill.ready{color:#1372d6;border-color:color-mix(in oklab,var(--accent) 34%,#fff)}
.model-enable-switch{min-width:74px;min-height:32px;display:inline-flex;align-items:center;justify-content:flex-end;gap:7px;padding:0;border:0;background:transparent;color:var(--ink-soft);font-size:12px;font-weight:850;cursor:pointer}
.model-enable-switch:disabled{cursor:default;opacity:.62}
.model-enable-switch:focus-visible{outline:2px solid color-mix(in oklab,var(--accent) 70%,white);outline-offset:3px;border-radius:999px}
.model-enable-switch .switch-track{position:relative;width:48px;height:28px;display:inline-flex;align-items:center;border:1px solid color-mix(in oklab,var(--line) 82%,transparent);border-radius:999px;background:linear-gradient(180deg,rgba(226,232,240,.9),rgba(203,213,225,.86));box-shadow:inset 0 1px 3px rgba(15,23,42,.18),0 10px 22px -18px rgba(15,23,42,.38);transition:background .2s ease,border-color .2s ease,box-shadow .2s ease}
.model-enable-switch .switch-knob{position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:999px;background:linear-gradient(180deg,#fff,#edf5ff);box-shadow:0 4px 10px -5px rgba(15,23,42,.58),inset 0 1px 0 rgba(255,255,255,.9);transition:transform .2s ease,background .2s ease}
.model-enable-switch.is-on .switch-track{border-color:color-mix(in oklab,var(--accent) 48%,#fff);background:linear-gradient(135deg,#57b9ff,#2378e8 72%,#5a9fff);box-shadow:inset 0 1px 0 rgba(255,255,255,.26),0 12px 24px -18px rgba(36,116,230,.78)}
.model-enable-switch.is-on .switch-knob{transform:translateX(20px)}
.model-enable-switch .switch-label{min-width:20px;color:var(--ink-mute);line-height:1}
.model-enable-switch.is-on .switch-label{color:#0b6fd3}
.model-enable-switch:hover:not(:disabled) .switch-track{border-color:color-mix(in oklab,var(--accent) 44%,var(--line));box-shadow:inset 0 1px 3px rgba(15,23,42,.14),0 14px 28px -20px rgba(36,116,230,.48)}
.model-price-row{display:grid;grid-template-columns:50px minmax(0,1fr);align-items:center;gap:10px;min-height:78px;padding:10px 13px;border:1px solid color-mix(in oklab,var(--accent) 16%,#fff);border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,.64),rgba(225,242,255,.58));box-shadow:inset 0 1px 0 rgba(255,255,255,.82)}
.model-price-row > span{font-size:12px;font-weight:750;color:#254466}
.model-price-row strong{min-width:0;font-size:13px;font-weight:850;color:#0865d8;overflow:visible;text-overflow:clip;white-space:normal;line-height:1.34}
.model-price-row strong.price-lines{display:flex;flex-direction:column;gap:1px}
.model-price-row .price-line{display:block;min-width:0;color:inherit;overflow:visible;text-overflow:clip;white-space:normal}
.model-intro-warning{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:9px;padding:9px 12px;border:1px solid color-mix(in oklab,#f97316 46%,#ef4444 20%);border-radius:12px;background:linear-gradient(135deg,color-mix(in oklab,#fff7ed 86%,transparent),color-mix(in oklab,#fed7aa 66%,transparent));box-shadow:0 16px 36px -28px rgba(234,88,12,.75),inset 0 1px 0 rgba(255,255,255,.88)}
.model-intro-warning strong{display:inline-flex;align-items:center;min-height:24px;padding:0 8px;border-radius:999px;background:color-mix(in oklab,#f97316 18%,white);color:#c2410c;font-size:12px;font-weight:900;white-space:nowrap}
.model-intro-warning span{min-width:0;color:#9a3412;font-size:13px;font-weight:900;line-height:1.42;overflow-wrap:anywhere}
.model-intro-panel{margin-top:auto;display:grid;gap:8px;padding:11px 13px 12px;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line-soft));border-radius:14px;background:linear-gradient(135deg,rgba(255,255,255,.72),rgba(226,244,255,.66));box-shadow:0 18px 38px -30px rgba(74,143,205,.46),inset 0 1px 0 rgba(255,255,255,.86)}
.model-intro-panel span{font-size:13px;font-weight:850;color:#14375e}
.model-intro-panel p{margin:0;font-size:13px;font-weight:750;line-height:1.56;color:#22547f;overflow-wrap:anywhere}
.model-meta-row{display:flex;gap:7px;flex-wrap:wrap}
.model-meta-row span,.model-param-chips i{font-style:normal;font-size:10px;color:var(--ink-soft);border:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:999px;padding:4px 8px;background:color-mix(in oklab,var(--paper) 36%,transparent)}
.model-param-chips{display:flex;gap:7px;flex-wrap:wrap;align-content:flex-start;margin-top:auto;padding-bottom:1px}
.model-empty-card{margin:16px;min-height:104px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px dashed color-mix(in oklab,var(--line) 80%,transparent);border-radius:14px;background:color-mix(in oklab,var(--paper) 28%,transparent);color:var(--ink-mute);text-align:center}
.model-empty-card strong{color:var(--ink-soft)}
.account-key-panel{display:flex;flex-direction:column;gap:18px}
.account-key-grid{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px 12px;align-items:center}
.account-key-grid span{font-size:11px;color:var(--ink-mute)}
.account-key-grid strong{min-width:0;font-size:12px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (max-width:820px){
  .model-catalog-stats{grid-template-columns:1fr}
  .model-catalog-tabs{grid-template-columns:1fr;gap:8px}
  .model-catalog-tabs button{justify-content:space-between;padding:0 12px}
  .video-model-family-tabs{padding:10px 12px}
  .seedance-volc-price-table{margin:12px}
  .seedance-volc-price-head{align-items:flex-start;flex-direction:column}
  .seedance-volc-price-table table{min-width:680px}
  .model-catalog-grid{grid-template-columns:1fr;padding:12px}
  .model-list-section-head{align-items:flex-start;flex-direction:column}
  .model-list-section-actions{width:100%;justify-content:space-between}
}

/* User guide page */
.user-guide-page{position:absolute;inset:0;overflow:auto;padding:24px;line-height:1.68;color:var(--ink);scroll-behavior:smooth;overflow-wrap:anywhere}
.user-guide-page::before{content:"";position:fixed;inset:0;pointer-events:none;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 48%,transparent),transparent 42%),radial-gradient(ellipse 54% 38% at 16% 0%,color-mix(in oklab,var(--accent) 9%,transparent),transparent 72%),radial-gradient(ellipse 46% 34% at 92% 16%,color-mix(in oklab,var(--accent-2) 7%,transparent),transparent 72%);opacity:.82}
.guide-hero,.guide-layout{position:relative;z-index:1}
.guide-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,42%);gap:18px;align-items:stretch;margin:0 0 18px;padding:22px;border:1px solid color-mix(in oklab,var(--line) 82%,var(--accent) 12%);border-radius:12px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 88%,transparent),color-mix(in oklab,var(--paper-2) 62%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent),0 24px 62px -48px color-mix(in oklab,var(--accent) 32%,transparent)}
.guide-hero-copy{min-width:0;display:flex;flex-direction:column;justify-content:center}
.guide-kicker{margin:0 0 8px;font-family:var(--font-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:color-mix(in oklab,var(--accent) 74%,var(--ink-mute))}
.guide-hero h1{margin:0;font-size:clamp(30px,3.2vw,46px);line-height:1.08;letter-spacing:0;color:var(--ink)}
.guide-hero p{max-width:760px;margin:13px 0 18px;font-size:15px;color:var(--ink-soft)}
.guide-step-flow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.guide-step-flow span{min-height:34px;display:inline-flex;align-items:center;gap:7px;padding:0 10px;border:1px solid color-mix(in oklab,var(--line) 82%,transparent);border-radius:8px;background:color-mix(in oklab,var(--paper-2) 58%,transparent);font-size:12px;color:var(--ink-soft)}
.guide-step-flow b{font-family:var(--font-mono);font-size:10px;color:color-mix(in oklab,var(--accent) 76%,var(--ink))}
.guide-step-flow i{width:18px;height:1px;background:color-mix(in oklab,var(--accent) 42%,var(--line));display:inline-block}
.guide-interface-map,.guide-visual-panel{min-width:0;border:1px solid color-mix(in oklab,var(--line) 82%,transparent);border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 78%,transparent),color-mix(in oklab,var(--paper-2) 56%,transparent));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent)}
.guide-interface-map{padding:12px;display:flex;flex-direction:column;gap:10px}
.guide-map-topbar,.guide-visual-topbar{height:28px;display:flex;align-items:center;gap:6px;color:var(--ink-mute);font-family:var(--font-mono);font-size:10px}
.guide-map-topbar span,.guide-visual-topbar i{width:8px;height:8px;border-radius:999px;background:color-mix(in oklab,var(--accent) 42%,var(--paper))}
.guide-map-topbar strong,.guide-visual-topbar span{margin-left:4px;font-weight:600;color:var(--ink-soft);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.guide-map-body{position:relative;height:210px;display:grid;grid-template-columns:74px minmax(0,1fr);grid-template-rows:minmax(0,1fr) 38px;gap:10px}
.guide-map-sidebar{grid-row:1/3;display:flex;flex-direction:column;gap:9px;padding:10px;border-radius:8px;background:color-mix(in oklab,var(--accent) 8%,var(--paper));border:1px solid color-mix(in oklab,var(--accent) 16%,var(--line))}
.guide-map-sidebar b{font-size:11px;color:var(--ink);white-space:nowrap}
.guide-map-sidebar i{height:20px;border-radius:7px;background:color-mix(in oklab,var(--paper) 76%,transparent);border:1px solid color-mix(in oklab,var(--line-soft) 70%,transparent)}
.guide-map-canvas{position:relative;border-radius:8px;border:1px solid color-mix(in oklab,var(--line-soft) 84%,transparent);background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 7%,transparent) 1px,transparent 1px),linear-gradient(color-mix(in oklab,var(--accent) 7%,transparent) 1px,transparent 1px),color-mix(in oklab,var(--paper) 48%,transparent);background-size:28px 28px}
.guide-map-canvas .map-node{position:absolute;display:flex;align-items:center;justify-content:center;min-width:70px;height:42px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--paper) 82%,transparent);font-size:12px;color:var(--ink)}
.guide-map-canvas .node-a{left:12%;top:20%}.guide-map-canvas .node-b{right:14%;top:25%}.guide-map-canvas .node-c{left:42%;bottom:18%}
.guide-map-canvas .map-edge{position:absolute;height:2px;background:color-mix(in oklab,var(--accent-2) 42%,var(--accent));transform-origin:left center}.guide-map-canvas .edge-a{left:34%;top:38%;width:86px;transform:rotate(8deg)}.guide-map-canvas .edge-b{left:52%;top:58%;width:70px;transform:rotate(-24deg)}
.guide-map-dock{display:flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent-2) 20%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--accent-2) 8%,var(--paper));font-size:12px;color:var(--ink)}
.guide-map-labels{display:flex;gap:8px;flex-wrap:wrap}
.guide-map-labels span{font-size:11px;color:var(--ink-mute);padding:5px 8px;border-radius:8px;background:color-mix(in oklab,var(--paper) 58%,transparent);border:1px solid color-mix(in oklab,var(--line-soft) 70%,transparent)}
.guide-layout{display:grid;grid-template-columns:minmax(190px,230px) minmax(0,1fr);gap:18px;align-items:start}
.guide-toc{position:sticky;top:18px;max-height:calc(100vh - 56px);overflow:auto;padding:12px;border:1px solid color-mix(in oklab,var(--accent) 24%,var(--line));border-radius:12px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 96%,white 4%),color-mix(in oklab,var(--paper-2) 82%,white 6%));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 6%,transparent),0 18px 48px -36px color-mix(in oklab,var(--accent) 36%,transparent)}
.guide-toc strong{display:block;margin-bottom:10px;font-size:12px;color:var(--ink)}
.guide-folder-list{display:grid;gap:10px;margin:0 0 12px;padding:0 0 12px;border-bottom:1px solid color-mix(in oklab,var(--line-soft) 72%,transparent)}
.guide-folder-button{position:relative;width:100%;min-height:66px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;padding:10px 11px 10px 14px;overflow:hidden;border:1px solid color-mix(in oklab,var(--accent) 26%,var(--line));border-radius:10px;background:linear-gradient(180deg,color-mix(in oklab,var(--paper) 94%,white 6%),color-mix(in oklab,var(--paper-2) 78%,white 8%));color:var(--ink-soft);text-align:left;cursor:pointer;box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 4%,transparent),0 10px 24px -22px color-mix(in oklab,var(--accent) 32%,transparent)}
.guide-folder-button::before{content:"";position:absolute;left:0;top:10px;bottom:10px;width:3px;border-radius:0 999px 999px 0;background:transparent}
.guide-folder-button:hover{border-color:color-mix(in oklab,var(--accent) 36%,var(--line));color:var(--ink);background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 7%,var(--paper)),color-mix(in oklab,var(--paper-2) 64%,transparent))}
.guide-folder-button.active{border-color:color-mix(in oklab,var(--accent) 72%,var(--line));background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 20%,var(--paper)),color-mix(in oklab,var(--paper-2) 84%,white 6%));color:var(--ink);box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent),0 12px 28px -22px color-mix(in oklab,var(--accent) 62%,transparent)}
.guide-folder-button.active::before{background:linear-gradient(180deg,var(--accent),color-mix(in oklab,var(--accent-2) 42%,var(--accent)))}
.guide-folder-title{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:800;line-height:1.2;color:var(--ink)}
.guide-folder-title b{width:24px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:color-mix(in oklab,var(--accent) 12%,var(--paper));border:1px solid color-mix(in oklab,var(--accent) 24%,var(--line));font-family:var(--font-mono);font-size:10px;color:color-mix(in oklab,var(--accent) 78%,var(--ink))}
.guide-folder-button em{font-style:normal;font-size:11px;line-height:1.35;color:var(--ink-mute)}
.guide-folder-button small{font-family:var(--font-mono);font-size:10px;line-height:1.1;color:color-mix(in oklab,var(--accent) 72%,var(--ink-mute))}
.guide-folder-sections{display:grid;gap:5px;padding:10px;border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line));border-radius:10px;background:color-mix(in oklab,var(--paper) 88%,white 4%)}
.guide-current-folder{display:grid;gap:3px;margin:0 0 5px;font-size:11px;font-weight:800;color:var(--ink);line-height:1.35}
.guide-current-folder em{font-style:normal;font-weight:600;color:color-mix(in oklab,var(--accent) 70%,var(--ink-mute))}
.guide-toc a{display:grid;grid-template-columns:26px minmax(0,1fr);gap:7px;align-items:center;padding:7px 8px;border-radius:8px;color:var(--ink-soft);font-size:12px;line-height:1.35;text-decoration:none}
.guide-toc a b{font-family:var(--font-mono);font-size:10px;color:color-mix(in oklab,var(--accent) 74%,var(--ink-mute))}
.guide-toc a:hover{background:color-mix(in oklab,var(--accent) 10%,transparent);color:var(--ink)}
.guide-content{min-width:0;max-width:960px;width:100%;display:flex;flex-direction:column;gap:36px}
.guide-section{position:relative;padding:0 0 34px;border:0;border-bottom:1px solid color-mix(in oklab,var(--line-soft) 78%,transparent);border-radius:0;background:transparent;box-shadow:none;overflow-wrap:anywhere;scroll-margin-top:24px}
.guide-section-head{display:grid;grid-template-columns:42px minmax(0,1fr);gap:12px;align-items:start;margin:0 0 14px}
.guide-section-head>span{height:34px;display:flex;align-items:center;justify-content:center;border-radius:0;border:0;background:transparent;font-family:var(--font-mono);font-weight:800;color:color-mix(in oklab,var(--accent) 72%,var(--ink));font-size:16px}
.guide-section h2{margin:0 0 6px;font-size:25px;line-height:1.22;letter-spacing:0;color:var(--ink)}
.guide-section-head p{margin:0;max-width:760px;color:var(--ink-soft);font-size:15px;line-height:1.7}
.guide-reading-layout{display:grid;gap:18px;max-width:860px;margin-left:54px}
.guide-reading-flow{display:grid;gap:18px;max-width:760px}
.guide-section-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;align-items:start}
.guide-section-main{min-width:0}
.guide-block-grid{display:grid;gap:16px}
.guide-block{display:grid;gap:10px;padding:0 0 18px;border-top:0;border-bottom:1px solid color-mix(in oklab,var(--line-soft) 58%,transparent);overflow-wrap:anywhere}
.guide-block:first-child{padding-top:0;border-top:0}
.guide-block:last-child{padding-bottom:0;border-bottom:0}
.guide-block h3{margin:0;font-size:16px;line-height:1.4;color:var(--ink)}
.guide-block ol,.guide-block ul{display:grid;gap:9px;margin:0;padding-left:20px;color:var(--ink-soft);font-size:14px;line-height:1.72}
.guide-block li::marker{color:color-mix(in oklab,var(--accent) 72%,var(--ink-mute))}
.guide-block.is-error{padding:0 0 0 14px;border:0;border-left:3px solid color-mix(in oklab,var(--warn) 62%,var(--accent-2));background:transparent}
.guide-error-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}
.guide-error-list li{position:relative;padding-left:15px;color:var(--ink-soft);font-size:13px}
.guide-error-list li::before{content:"";position:absolute;left:0;top:.72em;width:6px;height:6px;border-radius:999px;background:color-mix(in oklab,var(--warn) 72%,var(--accent-2))}
.guide-visual-panel{position:relative;top:auto;max-width:640px;margin:2px 0 4px;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}
.guide-visual-window{overflow:hidden;border:1px solid color-mix(in oklab,var(--accent) 24%,var(--line));border-radius:8px;background:color-mix(in oklab,var(--paper) 86%,white 6%)}
.guide-visual-body{position:relative;height:206px;padding:12px;overflow:hidden;background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 8%,transparent) 1px,transparent 1px),linear-gradient(color-mix(in oklab,var(--accent) 8%,transparent) 1px,transparent 1px),color-mix(in oklab,var(--paper-2) 50%,transparent);background-size:24px 24px}
.guide-visual-caption{display:grid;gap:3px;margin:8px 0 0;color:var(--ink-soft);font-size:12px;line-height:1.55}
.guide-visual-caption strong{color:var(--ink);font-size:12px}
.guide-visual-hotspot{position:absolute;left:var(--x);top:var(--y);display:flex;align-items:center;gap:6px;transform:translate(-50%,-50%);z-index:2}
.guide-visual-hotspot b{width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent-2) 34%,var(--accent)));color:#081E2E;font-family:var(--font-mono);font-size:11px;box-shadow:0 8px 18px -12px color-mix(in oklab,var(--accent) 80%,transparent)}
.guide-visual-hotspot em{font-style:normal;max-width:88px;padding:4px 6px;border:1px solid color-mix(in oklab,var(--accent) 30%,var(--line));border-radius:7px;background:color-mix(in oklab,var(--paper) 88%,transparent);color:var(--ink);font-size:11px;line-height:1.2;box-shadow:0 12px 24px -20px rgba(0,0,0,.25)}
.guide-mock-workflow{height:100%;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));align-items:center;gap:8px}
.guide-mock-workflow span{height:62px;display:flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));border-radius:9px;background:color-mix(in oklab,var(--paper) 70%,transparent);font-weight:700;color:var(--ink)}
.guide-mock-canvas{position:relative;height:100%}.mock-toolbar{position:absolute;left:0;top:14px;width:32px;height:126px;border-radius:9px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line))}.mock-node{position:absolute;display:flex;align-items:center;justify-content:center;border:1px solid color-mix(in oklab,var(--accent) 26%,var(--line));border-radius:9px;background:color-mix(in oklab,var(--paper) 78%,transparent);font-size:11px;color:var(--ink)}.mock-node.image{left:54px;top:26px;width:88px;height:54px}.mock-node.text{right:22px;top:46px;width:98px;height:62px}.mock-node.video{left:96px;bottom:48px;width:96px;height:54px}.mock-edge{position:absolute;height:2px;background:color-mix(in oklab,var(--accent-2) 42%,var(--accent));transform-origin:left center}.edge-one{left:139px;top:62px;width:86px;transform:rotate(8deg)}.edge-two{left:170px;top:124px;width:78px;transform:rotate(-22deg)}.guide-mock-canvas>b{position:absolute;left:46px;right:12px;bottom:4px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:color-mix(in oklab,var(--accent-2) 9%,var(--paper));border:1px solid color-mix(in oklab,var(--accent-2) 22%,var(--line));font-size:12px}
.guide-mock-gallery{height:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.guide-mock-gallery .wide{grid-column:1/-1;height:36px;border-radius:9px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line))}.guide-mock-gallery i{border-radius:9px;background:linear-gradient(145deg,color-mix(in oklab,var(--accent) 12%,var(--paper)),color-mix(in oklab,var(--accent-2) 8%,var(--paper-2)));border:1px solid color-mix(in oklab,var(--line-soft) 80%,transparent)}
.guide-mock-list{height:100%;display:grid;gap:10px;align-content:center}.guide-mock-list span{height:36px;border-radius:9px;background:color-mix(in oklab,var(--paper) 72%,transparent);border:1px solid color-mix(in oklab,var(--line-soft) 82%,transparent)}.guide-mock-list span:nth-child(2){width:86%}.guide-mock-list span:nth-child(3){width:74%}.guide-mock-list span:nth-child(4){width:92%;background:color-mix(in oklab,var(--accent) 10%,var(--paper))}
.guide-mock-workbench{height:100%;display:grid;grid-template-rows:30px minmax(0,1fr);grid-template-columns:minmax(0,1fr) 78px;gap:9px}.mock-tabs{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.mock-tabs span{border-radius:8px;background:color-mix(in oklab,var(--accent) 10%,var(--paper));border:1px solid color-mix(in oklab,var(--accent) 18%,var(--line))}.mock-main{display:grid;gap:8px}.mock-main i{border-radius:8px;background:color-mix(in oklab,var(--paper) 76%,transparent);border:1px solid color-mix(in oklab,var(--line-soft) 76%,transparent)}.mock-side{display:grid;gap:8px}.mock-side b{border-radius:8px;background:linear-gradient(145deg,color-mix(in oklab,var(--accent) 11%,var(--paper)),color-mix(in oklab,var(--accent-2) 7%,var(--paper-2)));border:1px solid color-mix(in oklab,var(--line-soft) 76%,transparent)}
.guide-section-troubleshooting{border-color:color-mix(in oklab,var(--accent) 32%,var(--line));background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 8%,var(--paper)),color-mix(in oklab,var(--paper-2) 60%,transparent))}
@media (max-width:1180px){
  .guide-hero{grid-template-columns:1fr}
  .guide-section-grid{grid-template-columns:1fr}
  .guide-visual-panel{position:relative;top:auto}
}
@media (max-width:980px){
  .user-guide-page{padding:18px}
  .guide-layout{grid-template-columns:1fr}
  .guide-toc{position:relative;top:auto;max-height:none}
  .guide-reading-layout{margin-left:0;max-width:none}
  .guide-reading-flow{max-width:none}
  .guide-folder-list{grid-template-columns:repeat(2,minmax(0,1fr))}
  .guide-folder-sections{grid-template-columns:repeat(2,minmax(0,1fr))}
  .guide-current-folder{grid-column:1/-1}
  .guide-toc a{display:grid;margin:0}
}
@media (max-width:640px){
  .user-guide-page{padding:14px}
  .guide-hero{padding:16px}
  .guide-section{padding:15px}
  .guide-section-head{grid-template-columns:1fr;gap:6px}
  .guide-section-head>span{justify-content:flex-start;height:auto}
  .guide-folder-list,.guide-folder-sections{grid-template-columns:1fr}
  .guide-step-flow i{display:none}
  .guide-map-body{height:190px;grid-template-columns:58px minmax(0,1fr)}
  .guide-visual-hotspot em{display:none}
}

/* Theme toggle dock */
.product-bottom-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;margin:0 0 10px}
.product-theme-switch,.product-update-check{width:100%;min-height:50px;display:flex;align-items:center;gap:10px;margin:0;padding:9px 11px;border:1px solid color-mix(in oklab,var(--accent) 24%,var(--line));border-radius:14px;background:radial-gradient(circle at 18% 12%,color-mix(in oklab,var(--accent) 18%,transparent),transparent 58%),linear-gradient(135deg,color-mix(in oklab,var(--paper) 76%,transparent),color-mix(in oklab,var(--paper-2) 54%,transparent));color:var(--ink);cursor:pointer;text-align:left;box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent),0 14px 32px -26px color-mix(in oklab,var(--accent) 44%,transparent);transition:transform .18s ease,border-color .18s ease,background .2s ease,box-shadow .22s ease}
.product-theme-switch:hover,.product-update-check:hover{transform:translateY(-1px);border-color:color-mix(in oklab,var(--accent) 48%,var(--line));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 7%,transparent),0 18px 42px -28px color-mix(in oklab,var(--accent) 58%,transparent)}
.product-update-check{background:radial-gradient(circle at 82% 10%,color-mix(in oklab,var(--accent-2) 18%,transparent),transparent 60%),linear-gradient(135deg,color-mix(in oklab,var(--paper) 78%,transparent),color-mix(in oklab,var(--accent) 8%,var(--paper-2)))}
.product-update-icon{color:color-mix(in oklab,var(--accent-2) 70%,var(--ink))}
.product-theme-icon{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 34px;border:1px solid color-mix(in oklab,var(--accent) 28%,var(--line));border-radius:12px;background:linear-gradient(145deg,color-mix(in oklab,var(--accent) 16%,var(--paper)),color-mix(in oklab,var(--accent-2) 8%,var(--paper-2)));color:color-mix(in oklab,var(--accent) 80%,var(--ink));box-shadow:inset 0 1px 0 color-mix(in oklab,var(--ink) 5%,transparent)}
.product-theme-icon svg{width:19px;height:19px;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.product-theme-copy{min-width:0;display:flex;flex-direction:column;gap:2px}
.product-theme-copy strong{font-size:12px;line-height:1.15;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.product-theme-copy em{font-style:normal;font-family:var(--font-mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.product-sidebar.collapsed .product-theme-copy{display:none}
.product-sidebar.collapsed .product-bottom-actions{grid-template-columns:1fr;gap:8px}
.product-sidebar.collapsed .product-theme-switch,.product-sidebar.collapsed .product-update-check{min-height:50px;justify-content:center;padding:8px;border-radius:13px}

/* Aerial blue rose palette pass */
.product-shell.theme-a{background:linear-gradient(180deg,#EAF6FF 0%,#F8FCFF 46%,#D7ECFF 100%)}
.product-shell.theme-a::before{background:radial-gradient(ellipse 58% 48% at 14% 7%,color-mix(in oklab,var(--accent) 18%,transparent),transparent 66%),radial-gradient(ellipse 40% 46% at 86% 18%,color-mix(in oklab,var(--accent-2) 16%,transparent),transparent 72%),radial-gradient(ellipse 46% 42% at 74% 94%,color-mix(in oklab,var(--accent-3) 11%,transparent),transparent 76%),linear-gradient(120deg,rgba(255,255,255,.56),transparent 44%);opacity:.95}
.product-shell.theme-a::after{background-image:linear-gradient(color-mix(in oklab,var(--accent) 9%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--accent-2) 6%,transparent) 1px,transparent 1px),radial-gradient(color-mix(in oklab,var(--accent-2) 24%,transparent) .75px,transparent 1.2px);background-size:68px 68px,68px 68px,8px 8px;mask-image:radial-gradient(ellipse 82% 70% at 54% 42%,black 0%,transparent 84%);opacity:.32}
.theme-a .product-sidebar{background:linear-gradient(180deg,rgba(248,252,255,.88),rgba(226,242,255,.72));border-right-color:color-mix(in oklab,var(--accent) 24%,var(--line));box-shadow:18px 0 56px -42px rgba(68,130,188,.48),inset -1px 0 0 rgba(255,255,255,.72)}
.theme-a .product-sidebar::before{background:radial-gradient(ellipse 95% 32% at 12% 0%,color-mix(in oklab,var(--accent) 16%,transparent),transparent 68%),radial-gradient(ellipse 70% 44% at 92% 54%,color-mix(in oklab,var(--accent-2) 9%,transparent),transparent 76%),linear-gradient(180deg,rgba(255,255,255,.46),transparent 38%)}
.theme-a .media-home-page,.theme-a .model-config-page,.theme-a .model-catalog-page{background:radial-gradient(ellipse 46% 34% at 16% 4%,color-mix(in oklab,var(--accent) 13%,transparent),transparent 70%),radial-gradient(ellipse 38% 32% at 86% 12%,color-mix(in oklab,var(--accent-2) 8%,transparent),transparent 72%),linear-gradient(180deg,rgba(248,252,255,.72),rgba(215,236,255,.48))}
.theme-a .product-menu-frame,.theme-a .product-sidebar-art,.theme-a .home-page .page-head,.theme-a .hp-workbench,.theme-a .hp-gallery-head,.theme-a .hp-card,.theme-a .hp-hero-current,.theme-a .hp-hero-stats div,.theme-a .asset-library-frame,.theme-a .asset-library-overview,.theme-a .asset-control-section,.theme-a .asset-content-panel,.theme-a .model-panel,.theme-a .config-connection-panel,.theme-a .api-model-card,.theme-a .user-stat,.theme-a .category-tabs button,.theme-a .media-card,.theme-a .model-catalog-head,.theme-a .model-catalog-tabs,.theme-a .model-list-section,.theme-a .model-catalog-card,.theme-a .model-result-frame{background:radial-gradient(ellipse 72% 90% at 0% 0%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 72%),linear-gradient(180deg,rgba(248,252,255,.88),rgba(234,246,255,.68));border-color:color-mix(in oklab,var(--accent) 20%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.78),0 22px 58px -42px rgba(70,128,184,.34);backdrop-filter:blur(16px) saturate(1.08)}
.theme-a .product-sidebar-art{background:radial-gradient(ellipse 80% 70% at 50% 8%,color-mix(in oklab,var(--accent) 15%,transparent),transparent 72%),radial-gradient(ellipse 56% 58% at 86% 24%,color-mix(in oklab,var(--accent-2) 12%,transparent),transparent 70%),linear-gradient(180deg,rgba(248,252,255,.86),rgba(217,237,255,.58))}
.theme-a .product-art-window{background:linear-gradient(180deg,rgba(255,255,255,.36),transparent 48%),radial-gradient(ellipse 70% 80% at 52% 18%,color-mix(in oklab,var(--accent) 17%,transparent),transparent 72%)}
.theme-a .product-art-panel{background:rgba(248,252,255,.56);box-shadow:0 12px 22px -18px rgba(76,130,180,.42)}
.theme-a .product-art-screen{background:color-mix(in oklab,var(--accent) 10%,rgba(248,252,255,.86))}
.theme-a .projects-home{background:radial-gradient(ellipse 48% 34% at 18% 4%,color-mix(in oklab,var(--accent) 18%,transparent),transparent 68%),radial-gradient(ellipse 42% 38% at 88% 18%,color-mix(in oklab,var(--accent-2) 11%,transparent),transparent 74%),linear-gradient(180deg,#F8FCFF 0%,#EAF6FF 56%,#D7ECFF 100%)}
.theme-a .home-page::before{background:linear-gradient(90deg,transparent 0%,color-mix(in oklab,var(--accent) 9%,transparent) 48%,transparent 100%),linear-gradient(180deg,rgba(255,255,255,.48),transparent 34%);opacity:.86}
.theme-a .hp-kicker,.theme-a .model-page-kicker,.theme-a .product-art-label{color:color-mix(in oklab,var(--accent) 74%,var(--ink-mute))}
.theme-a .hp-hero-copy h1,.theme-a .home-page h1{font-family:'Noto Sans SC','IBM Plex Sans',var(--font-display),sans-serif;text-shadow:0 16px 36px rgba(96,152,202,.18)}
.theme-a .hp-hero-btn.primary,.theme-a .home-btn.primary{background:linear-gradient(135deg,#55B6F2,#F76D9E 72%,#FFB86C);color:#092238;box-shadow:0 18px 42px -28px rgba(85,182,242,.74),inset 0 1px 0 rgba(255,255,255,.42)}
.theme-a .hp-card-no,.theme-a .hp-hero-stats strong,.theme-a .model-catalog-stats strong,.theme-a .model-price-row strong{color:color-mix(in oklab,var(--accent) 82%,#123454);text-shadow:0 0 16px color-mix(in oklab,var(--accent) 26%,transparent)}
.theme-a .model-catalog-page{background:linear-gradient(145deg,rgba(248,252,255,.86),rgba(219,237,255,.54) 55%,rgba(248,252,255,.7)),linear-gradient(28deg,transparent 58%,rgba(85,182,242,.1))}
.theme-a .model-catalog-tabs{background:linear-gradient(180deg,rgba(255,255,255,.84),rgba(229,244,255,.7));border-color:color-mix(in oklab,var(--accent) 24%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 24px 64px -46px rgba(58,128,196,.46)}
.theme-a .model-catalog-tabs button.active{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(223,242,255,.8));color:#064081;box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 18px 42px -28px rgba(73,144,214,.46)}
.theme-a .model-list-section,.theme-a .model-result-frame{background:linear-gradient(132deg,rgba(255,255,255,.88),rgba(229,245,255,.68) 58%,rgba(248,252,255,.82)),linear-gradient(28deg,transparent 54%,rgba(85,182,242,.1));border-color:color-mix(in oklab,var(--accent) 26%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 32px 78px -48px rgba(59,127,190,.5)}
.theme-a .model-catalog-card{background:linear-gradient(180deg,rgba(255,255,255,.84),rgba(235,248,255,.72)),linear-gradient(145deg,rgba(85,182,242,.1),transparent 54%);border-color:color-mix(in oklab,var(--accent) 24%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.94),0 26px 58px -42px rgba(70,132,190,.5)}
.theme-a .model-catalog-card:hover{border-color:color-mix(in oklab,var(--accent) 46%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.96),0 34px 74px -42px rgba(58,128,196,.58)}
.theme-a .model-price-row{background:linear-gradient(180deg,rgba(255,255,255,.66),rgba(223,242,255,.6));border-color:color-mix(in oklab,var(--accent) 18%,#fff)}
.theme-a .model-intro-panel{border-color:color-mix(in oklab,var(--accent) 22%,var(--line-soft))}
.theme-a .model-sync-btn{background:linear-gradient(135deg,#8cc8ff,#3d91ff 68%,#6aa9ff);color:#fff;border-color:color-mix(in oklab,var(--accent) 48%,#fff);box-shadow:0 16px 34px -20px rgba(36,116,230,.78),inset 0 1px 0 rgba(255,255,255,.58)}
.theme-a .media-thumb{background:radial-gradient(ellipse 70% 80% at 50% 42%,color-mix(in oklab,var(--accent) 12%,transparent),transparent 66%),#F8FCFF}
.theme-a .media-thumb img,.theme-a .media-thumb video{background:#F8FCFF}
.theme-a .media-thumb::after{background:radial-gradient(circle at 50% 46%,rgba(255,255,255,.12),rgba(85,182,242,.14));opacity:.24}
.theme-a .media-card:hover .media-thumb::after{opacity:.34}
.theme-a .media-preview-dialog{background:linear-gradient(180deg,rgba(248,252,255,.96),rgba(226,242,255,.92));box-shadow:0 36px 90px -50px rgba(70,128,184,.42),inset 0 1px 0 rgba(255,255,255,.82)}
.theme-a .media-preview-stage{background:radial-gradient(ellipse 74% 80% at 50% 18%,color-mix(in oklab,var(--accent) 13%,transparent),transparent 72%),#F8FCFF}
.theme-a .media-preview-stage img,.theme-a .media-preview-stage video{box-shadow:0 24px 72px -44px rgba(70,128,184,.48)}

/* Atelier noir palette pass */
.product-shell.theme-b{background:linear-gradient(180deg,#0D0F0E 0%,#171817 46%,#080908 100%)}
.product-shell.theme-b::before{background:radial-gradient(ellipse 58% 48% at 16% 7%,color-mix(in oklab,var(--accent) 9%,transparent),transparent 66%),radial-gradient(ellipse 38% 44% at 86% 20%,color-mix(in oklab,var(--accent-3) 7%,transparent),transparent 72%),radial-gradient(ellipse 46% 42% at 74% 94%,color-mix(in oklab,var(--accent-2) 6%,transparent),transparent 76%),linear-gradient(120deg,rgba(255,255,255,.018),transparent 44%);opacity:.9}
.product-shell.theme-b::after{background-image:linear-gradient(color-mix(in oklab,var(--ink) 3.2%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--ink) 2.8%,transparent) 1px,transparent 1px),linear-gradient(135deg,transparent 0 47%,color-mix(in oklab,var(--accent) 18%,transparent) 48% 52%,transparent 53%),radial-gradient(color-mix(in oklab,var(--accent) 12%,transparent) .75px,transparent 1.2px);background-size:68px 68px,68px 68px,220px 220px,7px 7px;mask-image:radial-gradient(ellipse 78% 64% at 54% 42%,black 0%,transparent 82%);opacity:.36}
.theme-b .product-sidebar{background:linear-gradient(180deg,color-mix(in oklab,#1B1C18 84%,transparent),color-mix(in oklab,#10110F 96%,transparent));border-right-color:color-mix(in oklab,var(--line) 80%,var(--accent) 8%);box-shadow:18px 0 56px -42px rgba(0,0,0,.98),inset -1px 0 0 rgba(255,255,255,.025)}
.theme-b .product-sidebar::before{background:radial-gradient(ellipse 95% 32% at 12% 0%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 68%),linear-gradient(180deg,rgba(255,255,255,.022),transparent 38%)}
.theme-b .projects-home{background:linear-gradient(180deg,#0D0F0E 0%,#171817 56%,#080908 100%),radial-gradient(ellipse 46% 36% at 21% 7%,color-mix(in oklab,var(--accent) 9%,transparent),transparent 68%),radial-gradient(ellipse 34% 42% at 86% 20%,color-mix(in oklab,var(--accent-3) 5%,transparent),transparent 76%)}
.theme-b .hp-hero-btn.primary,.theme-b .home-btn.primary{background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 88%,white),color-mix(in oklab,var(--accent-2) 22%,var(--accent)));color:#10130E}
.theme-b .media-preview-dialog{background:linear-gradient(180deg,color-mix(in oklab,#1B1C18 92%,transparent),color-mix(in oklab,#0D0F0E 98%,transparent))}
.theme-b .media-home-page,.theme-b .model-config-page,.theme-b .model-catalog-page{background:radial-gradient(ellipse 44% 34% at 14% 5%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 72%),radial-gradient(ellipse 36% 32% at 88% 14%,color-mix(in oklab,var(--accent-2) 7%,transparent),transparent 74%),linear-gradient(180deg,#0D0F0E 0%,#171817 58%,#080908 100%)}
.theme-b .model-catalog-tabs{background:linear-gradient(180deg,rgba(34,37,31,.92),rgba(18,20,18,.88));border-color:color-mix(in oklab,var(--accent) 26%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 24px 64px -46px rgba(0,0,0,.98)}
.theme-b .model-catalog-tabs button{color:var(--ink-mute)}
.theme-b .model-catalog-tabs button:hover{background:color-mix(in oklab,var(--accent) 8%,rgba(255,255,255,.035));border-color:color-mix(in oklab,var(--accent) 24%,var(--line));color:var(--ink)}
.theme-b .model-catalog-tabs button.active{background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 16%,#24271F),color-mix(in oklab,var(--paper-2) 82%,transparent));border-color:color-mix(in oklab,var(--accent) 48%,var(--line));color:color-mix(in oklab,var(--accent-soft) 86%,white);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 18px 42px -30px color-mix(in oklab,var(--accent) 32%,transparent)}
.theme-b .model-catalog-tabs span{background:color-mix(in oklab,var(--paper-3) 68%,transparent);border-color:color-mix(in oklab,var(--line) 82%,transparent);color:var(--ink-mute)}
.theme-b .model-catalog-tabs button.active span{background:color-mix(in oklab,var(--accent) 14%,transparent);border-color:color-mix(in oklab,var(--accent) 42%,var(--line));color:color-mix(in oklab,var(--accent-soft) 88%,white)}
.theme-b .model-list-section,.theme-b .model-result-frame{background:linear-gradient(132deg,rgba(34,37,31,.9),rgba(18,20,18,.88) 58%,rgba(13,15,14,.94)),linear-gradient(28deg,transparent 54%,color-mix(in oklab,var(--accent) 8%,transparent));border-color:color-mix(in oklab,var(--accent) 28%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 32px 78px -48px rgba(0,0,0,.98)}
.theme-b .model-list-section::before{background:linear-gradient(90deg,transparent,rgba(228,212,173,.34),color-mix(in oklab,var(--accent) 28%,transparent),transparent)}
.theme-b .model-list-section::after{background:linear-gradient(135deg,rgba(255,255,255,.045),transparent 48%)}
.theme-b .model-list-section-head{border-bottom-color:color-mix(in oklab,var(--accent) 16%,var(--line-soft));background:linear-gradient(105deg,rgba(255,255,255,.035),transparent 46%,color-mix(in oklab,var(--accent) 7%,transparent))}
.theme-b .model-list-section-head span{color:color-mix(in oklab,var(--accent-soft) 58%,var(--ink-mute))}
.theme-b .model-list-section-head h2{color:var(--ink)}
.theme-b .model-list-section-actions>strong{color:color-mix(in oklab,var(--accent-soft) 74%,var(--ink-soft))}
.theme-b .model-sync-btn{background:linear-gradient(135deg,color-mix(in oklab,var(--accent-soft) 72%,white),var(--accent) 72%,color-mix(in oklab,var(--accent-2) 28%,var(--accent)));color:#10130E;border-color:color-mix(in oklab,var(--accent) 52%,var(--line));box-shadow:0 16px 34px -22px color-mix(in oklab,var(--accent) 56%,transparent),inset 0 1px 0 rgba(255,255,255,.24)}
.theme-b .video-model-family-tabs{background:linear-gradient(180deg,rgba(24,26,22,.9),rgba(18,20,18,.78));border-bottom-color:color-mix(in oklab,var(--accent) 16%,var(--line-soft))}
.theme-b .video-model-family-tabs button{background:color-mix(in oklab,var(--paper-2) 72%,transparent);border-color:color-mix(in oklab,var(--accent) 18%,var(--line));color:var(--ink-mute)}
.theme-b .video-model-family-tabs button:hover{background:color-mix(in oklab,var(--accent) 8%,var(--paper-2));border-color:color-mix(in oklab,var(--accent) 30%,var(--line));color:var(--ink)}
.theme-b .video-model-family-tabs button.active{background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 14%,var(--paper-2)),color-mix(in oklab,var(--paper) 82%,transparent));border-color:color-mix(in oklab,var(--accent) 42%,var(--line));color:color-mix(in oklab,var(--accent-soft) 86%,white);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 14px 28px -24px color-mix(in oklab,var(--accent) 34%,transparent)}
.theme-b .video-model-family-tabs span{background:color-mix(in oklab,var(--paper-3) 68%,transparent);border-color:color-mix(in oklab,var(--line) 82%,transparent);color:var(--ink-mute)}
.theme-b .model-list-scroll::-webkit-scrollbar-thumb{background:color-mix(in oklab,var(--accent) 34%,var(--line))}
.theme-b .model-list-scroll::-webkit-scrollbar-track{background:color-mix(in oklab,var(--paper-2) 62%,transparent)}
.theme-b .seedance-volc-price-table{background:linear-gradient(180deg,rgba(34,37,31,.92),rgba(24,26,22,.88));border-color:color-mix(in oklab,var(--accent) 26%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 24px 58px -42px rgba(0,0,0,.98)}
.theme-b .seedance-volc-price-table::before{background:linear-gradient(90deg,transparent,rgba(228,212,173,.28),color-mix(in oklab,var(--accent) 24%,transparent),transparent)}
.theme-b .seedance-volc-price-head{border-bottom-color:color-mix(in oklab,var(--accent) 18%,var(--line-soft));background:linear-gradient(105deg,rgba(255,255,255,.035),transparent 46%,color-mix(in oklab,var(--accent) 7%,transparent))}
.theme-b .seedance-volc-price-head span{color:color-mix(in oklab,var(--accent-soft) 62%,var(--ink-mute))}
.theme-b .seedance-volc-price-head h3{color:var(--ink)}
.theme-b .seedance-volc-price-head strong{color:color-mix(in oklab,var(--accent-soft) 78%,var(--ink-soft))}
.theme-b .seedance-volc-price-table th{background:color-mix(in oklab,var(--paper-2) 60%,transparent);color:var(--ink-soft)}
.theme-b .seedance-volc-price-table th,.theme-b .seedance-volc-price-table td{border-bottom-color:color-mix(in oklab,var(--accent) 16%,var(--line-soft))}
.theme-b .seedance-volc-price-table td{color:color-mix(in oklab,var(--ink-soft) 92%,white)}
.theme-b .seedance-volc-price-table .seedance-volc-price-cell{color:color-mix(in oklab,var(--accent-soft) 88%,white)}
.theme-b .seedance-volc-price-table tbody tr:hover td{background:color-mix(in oklab,var(--accent) 6%,transparent)}
.theme-b .seedance-volc-model-cell{background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 74%,transparent),color-mix(in oklab,var(--paper) 56%,transparent))}
.theme-b .seedance-volc-model-cell strong{color:var(--ink)}
.theme-b .seedance-volc-model-cell span{background:color-mix(in oklab,var(--accent) 12%,var(--paper-2));border-color:color-mix(in oklab,var(--accent) 36%,var(--line));color:color-mix(in oklab,var(--accent-soft) 88%,white)}
.theme-b .model-catalog-card{background:linear-gradient(180deg,rgba(34,37,31,.92),rgba(24,26,22,.88)),linear-gradient(145deg,color-mix(in oklab,var(--accent) 8%,transparent),transparent 56%);border-color:color-mix(in oklab,var(--accent) 24%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 26px 58px -42px rgba(0,0,0,.98)}
.theme-b .model-catalog-card::before{background:linear-gradient(138deg,rgba(255,255,255,.045),transparent 32%,color-mix(in oklab,var(--accent) 6%,transparent) 74%,transparent)}
.theme-b .model-catalog-card::after{background:linear-gradient(90deg,transparent,rgba(228,212,173,.28),color-mix(in oklab,var(--accent) 24%,transparent),transparent)}
.theme-b .model-catalog-card:hover{border-color:color-mix(in oklab,var(--accent) 48%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.075),0 34px 74px -42px rgba(0,0,0,.98)}
.theme-b .model-brand-icon{background:linear-gradient(145deg,color-mix(in oklab,var(--paper-3) 76%,transparent),color-mix(in oklab,var(--accent) 10%,var(--paper-2)));border-color:color-mix(in oklab,var(--accent) 34%,var(--line));color:color-mix(in oklab,var(--accent-soft) 86%,white);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 18px 32px -24px rgba(0,0,0,.98)}
.theme-b .model-brand-icon::after{background:color-mix(in oklab,var(--accent) 24%,transparent)}
.theme-b .model-brand-openai{color:color-mix(in oklab,var(--accent-soft) 86%,white)}
.theme-b .model-title-copy strong{color:var(--ink)}
.theme-b .model-title-copy span{color:var(--ink-mute)}
.theme-b .model-title-copy .model-face-pass-badge{background:color-mix(in oklab,#ef4444 12%,var(--paper-2));border-color:color-mix(in oklab,#ef4444 38%,var(--line));color:#ff9f9f}
.theme-b .model-catalog-card .status-pill{background:color-mix(in oklab,var(--accent) 12%,var(--paper-2));color:color-mix(in oklab,var(--accent-soft) 88%,white);border-color:color-mix(in oklab,var(--accent) 38%,var(--line));box-shadow:0 10px 22px -18px color-mix(in oklab,var(--accent) 70%,transparent),inset 0 1px 0 rgba(255,255,255,.06)}
.theme-b .model-catalog-card .status-pill:not(.ready){background:color-mix(in oklab,var(--paper-3) 72%,transparent);color:var(--ink-mute);border-color:color-mix(in oklab,var(--line) 84%,transparent)}
.theme-b .model-enable-switch{color:var(--ink-soft)}
.theme-b .model-enable-switch .switch-track{background:linear-gradient(180deg,color-mix(in oklab,var(--paper-3) 82%,transparent),color-mix(in oklab,var(--paper-2) 86%,transparent));border-color:color-mix(in oklab,var(--line) 88%,transparent);box-shadow:inset 0 1px 4px rgba(0,0,0,.54),0 10px 22px -18px rgba(0,0,0,.9)}
.theme-b .model-enable-switch .switch-knob{background:linear-gradient(180deg,color-mix(in oklab,var(--ink-soft) 82%,white),color-mix(in oklab,var(--paper-2) 70%,white));box-shadow:0 4px 10px -5px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.2)}
.theme-b .model-enable-switch.is-on .switch-track{background:linear-gradient(135deg,color-mix(in oklab,var(--accent-soft) 76%,white),var(--accent) 72%,color-mix(in oklab,var(--accent-2) 26%,var(--accent)));border-color:color-mix(in oklab,var(--accent) 48%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 12px 24px -18px color-mix(in oklab,var(--accent) 62%,transparent)}
.theme-b .model-enable-switch.is-on .switch-label{color:color-mix(in oklab,var(--accent-soft) 86%,white)}
.theme-b .model-enable-switch:hover:not(:disabled) .switch-track{border-color:color-mix(in oklab,var(--accent) 38%,var(--line))}
.theme-b .model-price-row{background:linear-gradient(180deg,color-mix(in oklab,var(--paper-2) 78%,transparent),color-mix(in oklab,var(--paper) 56%,transparent));border-color:color-mix(in oklab,var(--accent) 20%,var(--line));box-shadow:inset 0 1px 0 rgba(255,255,255,.055)}
.theme-b .model-price-row > span{color:var(--ink-soft)}
.theme-b .model-price-row strong{color:color-mix(in oklab,var(--accent-soft) 88%,white);text-shadow:0 0 16px color-mix(in oklab,var(--accent) 22%,transparent)}
.theme-b .model-intro-panel{background:linear-gradient(135deg,color-mix(in oklab,var(--paper-2) 78%,transparent),color-mix(in oklab,var(--paper) 58%,transparent));border-color:color-mix(in oklab,var(--accent) 24%,var(--line-soft));box-shadow:0 18px 38px -30px rgba(0,0,0,.98),inset 0 1px 0 rgba(255,255,255,.06)}
.theme-b .model-intro-warning{background:linear-gradient(135deg,color-mix(in oklab,#451a03 42%,var(--paper-2)),color-mix(in oklab,#7c2d12 30%,var(--paper)));border-color:color-mix(in oklab,#fb923c 42%,var(--line));box-shadow:0 18px 38px -32px rgba(249,115,22,.62),inset 0 1px 0 rgba(255,255,255,.08)}
.theme-b .model-intro-warning strong{background:color-mix(in oklab,#fb923c 20%,var(--paper-2));color:#fdba74}
.theme-b .model-intro-warning span{color:#fed7aa}
.theme-b .model-intro-panel span{color:color-mix(in oklab,var(--accent-soft) 74%,var(--ink-soft))}
.theme-b .model-intro-panel p{color:color-mix(in oklab,var(--ink-soft) 92%,white)}
.theme-b .model-empty-card{background:color-mix(in oklab,var(--paper-2) 64%,transparent);border-color:color-mix(in oklab,var(--accent) 22%,var(--line));color:var(--ink-mute)}
.theme-b .model-empty-card strong{color:var(--ink-soft)}
.project-bootstrap-screen{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:48px;background:radial-gradient(ellipse 48% 34% at 18% 4%,color-mix(in oklab,var(--accent) 16%,transparent),transparent 68%),radial-gradient(ellipse 42% 38% at 88% 18%,color-mix(in oklab,var(--accent-2) 10%,transparent),transparent 74%),var(--bg)}
.project-bootstrap-card{width:min(520px,calc(100vw - 96px));display:flex;flex-direction:column;align-items:center;gap:13px;padding:34px;border:1px solid color-mix(in oklab,var(--accent) 22%,var(--line));border-radius:16px;background:radial-gradient(ellipse 72% 90% at 0% 0%,color-mix(in oklab,var(--accent) 10%,transparent),transparent 72%),linear-gradient(180deg,color-mix(in oklab,var(--paper) 88%,transparent),color-mix(in oklab,var(--paper-2) 68%,transparent));box-shadow:inset 0 1px 0 rgba(255,255,255,.48),0 24px 62px -42px color-mix(in oklab,var(--accent) 40%,transparent);text-align:center;backdrop-filter:blur(16px) saturate(1.08)}
.project-bootstrap-card span{font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;color:var(--ink-mute)}
.project-bootstrap-card h1{margin:0;font-size:24px;line-height:1.18;color:var(--ink)}
.project-bootstrap-card p{margin:0;color:var(--ink-soft);font-size:13px}
.project-bootstrap-loader{display:flex;gap:8px;margin-top:6px}
.project-bootstrap-loader i{width:8px;height:8px;border-radius:999px;background:color-mix(in oklab,var(--accent) 82%,white);box-shadow:0 0 16px color-mix(in oklab,var(--accent) 46%,transparent);animation:projectBootstrapPulse 1s ease-in-out infinite}
.project-bootstrap-loader i:nth-child(2){animation-delay:.14s}
.project-bootstrap-loader i:nth-child(3){animation-delay:.28s}
@keyframes projectBootstrapPulse{0%,100%{transform:translateY(0);opacity:.36}50%{transform:translateY(-5px);opacity:1}}
@media (max-width:760px){.project-bootstrap-screen{padding:22px}.project-bootstrap-card{width:100%;padding:26px 20px}.project-bootstrap-card h1{font-size:21px}}
`;
