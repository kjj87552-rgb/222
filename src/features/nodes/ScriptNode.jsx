import React from 'react';
import {
  IScript, IText, IVideo, ISparkle, ICamera, ICopy, ITrash, IBox,
} from '../../shared/ui/icons/index.jsx';
import { NodeShell, TryMenu, TbBtn } from './NodeShell.jsx';

function ScriptToolbar({ onOpen }) {
  return (
    <div className="node-toolbar script-toolbar" onPointerDown={(e)=>e.stopPropagation()}>
      <TbBtn icon={IScript}  label="全屏编辑"   onClick={() => onOpen("scriptfull")}/>
      <TbBtn icon={IBox}     label="打开脚本工作台" onClick={() => onOpen("workbench")}/>
      <TbBtn icon={ISparkle} label="快速分镜"   onClick={() => onOpen("genshots")}/>
      <TbBtn icon={IVideo}   label="批量生成视频" onClick={() => onOpen("batchvideo")}/>
      <TbBtn icon={ICamera}  label="重新生成脚本分镜" onClick={() => onOpen("scriptcreate")}/>
      <span className="sep"/>
      <TbBtn icon={ICopy}    onClick={() => onOpen("copy")}/>
      <TbBtn icon={ITrash}   onClick={() => onOpen("delete")} danger/>
    </div>
  );
}

/* Pulsing dot + stage text shown while node.generating is true. */
function ScriptGeneratingBanner({ stage, progress }) {
  const safeStage = stage || '生成中…';
  const safeProgress = Math.max(1, Math.min(99, Number(progress) || 1));
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      margin: '6px 8px',
      borderRadius: 8,
      background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
      border: '1px solid color-mix(in oklab, var(--accent) 30%, var(--line))',
      fontSize: 12,
      color: 'var(--ink)',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--accent)',
        boxShadow: '0 0 8px var(--accent)',
        animation: 'tmfade 1s ease-in-out infinite alternate',
        flex: '0 0 8px',
      }}/>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {safeStage}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--ink-mute)',
        minWidth: 32,
        textAlign: 'right',
      }}>
        {safeProgress}%
      </span>
    </div>
  );
}

export function ScriptNode(props) {
  const { node, onOpenModal } = props;
  const open = (k, options) => onOpenModal?.(k, node.id, options);
  const isEmpty = !node.shots || node.shots.length === 0
    || (node.shots.length === 1 && node.shots[0].desc === "（待填写）");
  const isGenerating = !!node.generating;

  /* Double-click on the body opens workbench. Stop event from triggering NodeShell drag. */
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onOpenModal?.("workbench", node.id);
  };

  return (
    <NodeShell {...props} isEmpty={isEmpty && !isGenerating}
      toolbar={<ScriptToolbar onOpen={open}/>}
      alwaysShowToolbar={isEmpty && !isGenerating}
      onDoubleClick={handleDoubleClick}>
      {isGenerating && (
        <ScriptGeneratingBanner stage={node.jobStage} progress={node.progress}/>
      )}
      {!isEmpty && !isGenerating && (
        <table>
          <thead>
            <tr><th>#</th><th>景别</th><th>画面描述</th><th>时长</th></tr>
          </thead>
          <tbody>
            {node.shots.map(s => (
              <tr key={s.n}>
                <td>{String(s.n).padStart(2,"0")}</td>
                <td className="shot">{s.shot}</td>
                <td>{s.desc}</td>
                <td className="dur">{s.dur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isEmpty && !isGenerating && (
        <TryMenu
          items={{
            icon: <IScript size={26} sw={1.4}/>,
            list: [
              { icon: <IBox size={14}/>, label: "打开脚本工作台", onClick: () => open("workbench") },
              { icon: <IText size={14}/>, label: "从剧本创作开始", onClick: () => open("workbench", { entry: "script_create" }) },
              { icon: <IVideo size={14}/>, label: "从参考视频复刻开始", onClick: () => open("workbench", { entry: "video_remix" }) },
              { icon: <ISparkle size={14}/>, label: "快速分镜", onClick: () => open("scriptcreate") },
            ]
          }}
        />
      )}
    </NodeShell>
  );
}
