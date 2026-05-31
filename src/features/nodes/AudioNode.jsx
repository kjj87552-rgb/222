import React from 'react';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import {
  IAudio, IPlay, IMic, ICut, ISparkle, ICopy, ITrash,
} from '../../shared/ui/icons/index.jsx';
import { NodeBlankState, NodeShell, TbBtn } from './NodeShell.jsx';

function AudioToolbar({ onOpen }) {
  return (
    <div className="node-toolbar" onPointerDown={(e)=>e.stopPropagation()}>
      <TbBtn icon={IPlay}    label="试听"  onClick={() => onOpen("play")}/>
      <TbBtn icon={IMic}     label="变声"  onClick={() => onOpen("voicechange")}/>
      <TbBtn icon={ICut}     label="剪辑"  onClick={() => onOpen("audiocut")}/>
      <TbBtn icon={ISparkle} label="降噪"  onClick={() => onOpen("denoise")}/>
      <span className="sep"/>
      <TbBtn icon={ICopy}    onClick={() => onOpen("copy")}/>
      <TbBtn icon={ITrash}   onClick={() => onOpen("delete")} danger/>
    </div>
  );
}

function nodeErrorText(node) {
  if (typeof node?.error === 'string') return node.error.trim();
  if (node?.error) return String(node.error);
  return '';
}

export function AudioNode(props) {
  const { node, onOpenModal } = props;
  const open = (kind) => onOpenModal?.(kind, node.id);
  const audioSrc = makeAssetUrl({ src: node.audioSrc });
  const errorText = nodeErrorText(node);
  const hasMedia = Boolean(audioSrc || node.waveform);
  const hasFailed = !node.generating && !hasMedia && (node.tag === '失败' || Boolean(errorText));
  const bars = React.useMemo(
    () => Array.from({length: 48}).map(() => 10 + Math.random()*36),
    [node.id]
  );
  const isEmpty = !hasMedia && !node.generating && !hasFailed;
  return (
    <NodeShell {...props} isEmpty={isEmpty || hasFailed}
      toolbar={<AudioToolbar onOpen={open}/>}>
      {node.generating && (
        <div className="gen-overlay">
          <div className="spin"/>
          <div className="pct">{node.progress || 1}%</div>
          <div className="label">{node.model || '默认音频模型'} · 生成中</div>
        </div>
      )}
      {hasMedia && !node.generating && (
        <>
          <div className="wave">
            {bars.map((h,i) => <span key={i} style={{height:h+"%"}}/>)}
          </div>
          {audioSrc && (
            <audio src={audioSrc} controls onPointerDown={(e)=>e.stopPropagation()}/>
          )}
          <div className="controls">
            <button className="playbtn"><IPlay size={12}/></button>
            <span>00:00 / {node.duration || "00:00"}</span>
            <span style={{marginLeft:"auto"}}>{node.model || "音频"}</span>
          </div>
        </>
      )}
      {hasFailed && (
        <NodeBlankState
          icon={<IAudio size={25} sw={1.5}/>}
          title="生成失败"
          description={errorText || '后端没有返回错误详情，请检查模型配置或稍后重试'}
          tone="error"
        />
      )}
      {isEmpty && (
        <NodeBlankState
          icon={<IAudio size={25} sw={1.5}/>}
          title="音频输入"
          description="生成音乐、音效或导入音频后会显示在这里"
          tone="audio"
        />
      )}
    </NodeShell>
  );
}
