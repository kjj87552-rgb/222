/* Rail — left icon column (LeftRailMini) + popover panel (RailPopover) */

import React from 'react';
import {
  IAdd,
  IBox,
  IFolder,
  IHistory,
  IBook,
  IText,
  IImage,
  IVideo,
  IAudio,
  IScript,
  IMagic,
  ISparkle,
  IKey,
  IChevR,
  IBell,
  IShare,
  IFilm,
  IZoomIn,
  IPano,
} from '../../shared/ui/icons/index.jsx';
import { HistoryRailPanel } from './HistoryRailPanel.jsx';
import { TaskQueuePanel } from './TaskQueuePanel.jsx';

export function LeftRailMini({
  active, onChange,
  generatorVisible, onToggleGenerator,
  localFilesVisible, onToggleLocalFiles,
  upscaleVisible, onToggleUpscale,
  onOpenSeedencePortraitLibrary,
}) {
  const tabs = [
    ["add",      IAdd,     "添加节点"],
    ["workflow", IBox,     "工作流"],
    ["assets",   IFolder,  "资产库"],
    ["tasks",    IBell,    "任务队列"],
    ["history",  IHistory, "历史"],
    ["help",     IBook,    "帮助"],
  ];
  const hasToggles = onToggleGenerator || onToggleLocalFiles || onToggleUpscale;
  return (
    <div className="leftrail" data-onboarding-id="canvas-left-rail">
      {tabs.map(([k, I, label]) => {
        const tabButton = (
          <button type="button" key={k} className={active===k?"active":""} onClick={()=>onChange(k)} title={label}>
            <I size={18}/>
          </button>
        );
        if (k !== 'assets' || !onOpenSeedencePortraitLibrary) return tabButton;
        return (
          <React.Fragment key={k}>
            {tabButton}
            <button type="button" onClick={onOpenSeedencePortraitLibrary} title="Seedence 角色库">
              <IImage size={18}/>
            </button>
          </React.Fragment>
        );
      })}
      {hasToggles && <div style={{ height: 1, background: 'var(--line-soft)', margin: '6px 8px' }}/>}
      {onToggleLocalFiles && (
        <button
          className={localFilesVisible ? "active" : ""}
          onClick={onToggleLocalFiles}
          title={localFilesVisible ? "隐藏本地文件夹" : "显示本地文件夹"}
        >
          <IFilm size={18}/>
        </button>
      )}
      {onToggleUpscale && (
        <button
          className={upscaleVisible ? "active" : ""}
          onClick={onToggleUpscale}
          title={upscaleVisible ? "隐藏高清放大" : "显示高清放大"}
        >
          <IZoomIn size={18}/>
        </button>
      )}
      {onToggleGenerator && (
        <button
          className={generatorVisible ? "active" : ""}
          onClick={onToggleGenerator}
          title={generatorVisible ? "隐藏生成器" : "显示生成器"}
          data-onboarding-id="canvas-generator-toggle"
        >
          <IMagic size={18}/>
        </button>
      )}
    </div>
  );
}

export function RailPopover({ railKey, onClose, onAddNode, onOpenModal, onOpenOverlay, onFocusNode, onUseHistoryItem, assetFolders = [] }) {
  React.useEffect(() => {
    const h = (e) => { if (!e.target.closest(".rail-pop") && !e.target.closest(".leftrail")) onClose(); };
    setTimeout(()=>window.addEventListener("pointerdown", h), 0);
    return () => window.removeEventListener("pointerdown", h);
  }, [onClose]);

  const content = {
    add: (
      <>
        <div className="sub">添加节点</div>
        <div className="item" onClick={()=>{onAddNode("text"); onClose();}}>
          <span className="ic"><IText size={13}/></span><span className="txt">文本</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("image"); onClose();}}>
          <span className="ic"><IImage size={13}/></span><span className="txt">图片</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("video"); onClose();}}>
          <span className="ic"><IVideo size={13}/></span><span className="txt">视频</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("audio"); onClose();}}>
          <span className="ic"><IAudio size={13}/></span><span className="txt">音频</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("script"); onClose();}}>
          <span className="ic"><IScript size={13}/></span><span className="txt">脚本</span>
          <span className="beta">Beta</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("vr720-gen"); onClose();}}>
          <span className="ic"><IPano size={13}/></span><span className="txt">720空间场景</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("panorama-viewer"); onClose();}}>
          <span className="ic"><IVideo size={13}/></span><span className="txt">720全景预览</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("asset-gen"); onClose();}}>
          <span className="ic"><ISparkle size={13}/></span><span className="txt">资产生成</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("prompt-runner"); onClose();}}>
          <span className="ic"><ISparkle size={13}/></span><span className="txt">提示词调用</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("storyboard-collector-detail"); onClose();}}>
          <span className="ic"><IFilm size={13}/></span><span className="txt">分镜收集细节</span>
        </div>
        <div className="item" onClick={()=>{onAddNode("jianying-export"); onClose();}}>
          <span className="ic"><IFilm size={13}/></span><span className="txt">剪映导出</span>
        </div>
        <div className="divider"/>
        <div className="sub">添加资源</div>
        <div className="item" onClick={()=>{onOpenModal?.("upload"); onClose();}}><span className="ic"><IAdd size={13}/></span><span className="txt">上传</span></div>
        <div className="item" onClick={()=>{onOpenOverlay?.({ kind: "subject", initialScope: "project" }); onClose();}}><span className="ic"><IMagic size={13}/></span><span className="txt">从图库选择</span></div>
      </>
    ),
    workflow: (
      <>
        <div className="sub">本地资源</div>
        <div className="item" onClick={() => { onOpenOverlay?.("style"); }}>
          <span className="ic"><ISparkle size={13}/></span>
          <span className="txt">风格库</span>
        </div>
      </>
    ),
    assets: (
      <>
        <div className="sub">画布资产库</div>
        <div className="item" onClick={() => onOpenOverlay?.({ kind: "subject", initialScope: "project" })}>
          <span className="ic"><IFolder size={13}/></span>
          <span className="txt">项目素材</span>
          <span className="beta">NEW</span>
        </div>
        <div className="item" onClick={() => onOpenOverlay?.({ kind: "subject", initialScope: "global" })}>
          <span className="ic"><IFolder size={13}/></span>
          <span className="txt">全局资产库</span>
        </div>
        <div className="divider"/>
        <div className="sub">资产文件夹</div>
        {assetFolders.slice(0,4).map((a, index) => (
          <div className="item" key={`${a?.id || a?.name || 'asset-folder'}-${index}`} onClick={() => onOpenOverlay?.({ kind: "subject", initialScope: "project" })}>
            <span className="ic"><IFolder size={13}/></span>
            <span className="txt">{a?.name || '未命名资产夹'}</span>
            <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--ink-mute)"}}>{a?.count || 0}</span>
          </div>
        ))}
      </>
    ),
    history: (
      <HistoryRailPanel onClose={onClose} onOpenOverlay={onOpenOverlay} onUseHistoryItem={onUseHistoryItem} />
    ),
    tasks: (
      <TaskQueuePanel onClose={onClose} onFocusNode={onFocusNode} />
    ),
    help: (
      <>
        <div className="sub">帮助</div>
        <div className="item" onClick={()=>{onOpenModal?.("shortcuts"); onClose();}}><span className="ic"><IKey size={13}/></span><span className="txt">快捷键</span></div>
        <div className="item disabled"><span className="ic"><IBook size={13}/></span><span className="txt">使用教程</span><span className="beta">soon</span></div>
        <div className="item disabled"><span className="ic"><IBell size={13}/></span><span className="txt">更新日志</span><span className="beta">soon</span></div>
        <div className="divider"/>
        <div className="item disabled"><span className="ic"><IShare size={13}/></span><span className="txt">反馈与建议</span><span className="beta">soon</span></div>
      </>
    ),
  };

  return <div className="rail-pop">{content[railKey] || null}</div>;
}
