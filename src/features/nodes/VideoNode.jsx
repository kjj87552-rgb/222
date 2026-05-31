import React from 'react';
import { useCanvasMediaEnabled } from '../canvas/canvasMediaVisibilityStore.js';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import {
  IPlay, IVideo,
  ISparkle, IMagic, ICut, IGrid9, ICamera, ICopy, IText, ITrash,
} from '../../shared/ui/icons/index.jsx';
import { MediaPreviewButton, NodeBlankState, NodeShell, TbBtn } from './NodeShell.jsx';

function VideoToolbar({ onOpen }) {
  return (
    <div className="node-toolbar" onPointerDown={(e)=>e.stopPropagation()}>
      <TbBtn icon={IText}    label="润色"   onClick={() => onOpen('textpolish')}/>
      <TbBtn icon={IPlay}    label="播放"   onClick={() => onOpen('play')}/>
      <TbBtn icon={IMagic}   label="去字幕" onClick={() => onOpen('subtitlesremove')}/>
      <TbBtn icon={ISparkle} label="高清"   onClick={() => onOpen('upscale-video')}/>
      <TbBtn icon={ICut}     label="剪辑"   onClick={() => onOpen('videoclip')}/>
      <TbBtn icon={IGrid9}   label="合成"   onClick={() => onOpen('timeline')}/>
      <TbBtn icon={ICamera}  label="截帧"   onClick={() => onOpen('framecap')}/>
      <span className="sep"/>
      <TbBtn icon={ICopy}    onClick={() => onOpen('copy')}/>
      <TbBtn icon={ITrash}   onClick={() => onOpen('delete')} danger/>
    </div>
  );
}

function nodeErrorText(node) {
  if (typeof node?.error === 'string') return node.error.trim();
  if (node?.error) return String(node.error);
  return '';
}

export function VideoNode(props) {
  const { node, onOpenModal } = props;
  const open = (kind) => onOpenModal?.(kind, node.id);
  const deferMediaLoading = Boolean(props.deferMediaLoading || node?.deferMediaLoading);
  const mediaEnabled = useCanvasMediaEnabled(node?.id, deferMediaLoading);
  const poster = makeAssetUrl({ src: node.poster });
  const videoSrc = makeAssetUrl({ src: node.videoSrc });
  const activePoster = mediaEnabled ? poster : '';
  const activeVideoSrc = mediaEnabled ? videoSrc : '';
  const errorText = nodeErrorText(node);
  const hasFailed = !node.generating && !poster && !videoSrc && (node.tag === '失败' || Boolean(errorText));
  const mediaDeferred = Boolean((poster || videoSrc) && !mediaEnabled && !node.generating);
  const empty = !poster && !videoSrc && !node.generating && !hasFailed;

  return (
    <NodeShell {...props} isEmpty={empty || mediaDeferred || hasFailed} toolbar={<VideoToolbar onOpen={open}/>}>
      {node.generating && (
        <div className="gen-overlay">
          <div className="spin"/>
          <div className="pct">{node.progress || 1}%</div>
          <div className="label">{node.model || '默认视频模型'} · 生成中</div>
        </div>
      )}
      {activeVideoSrc && !node.generating && (
        <>
          <video src={activeVideoSrc} controls playsInline preload="metadata"/>
          <MediaPreviewButton title={node.title} onClick={() => onOpenModal?.('preview', node.id)}/>
        </>
      )}
      {activePoster && !activeVideoSrc && !node.generating && (
        <>
          <img src={activePoster} alt="" draggable="false" loading="lazy" decoding="async"/>
          <div className="play"><div className="disc"><IPlay size={18}/></div></div>
          {node.duration && <div className="duration">{node.duration}</div>}
          <MediaPreviewButton title={node.title} onClick={() => onOpenModal?.('preview', node.id)}/>
        </>
      )}
      {mediaDeferred && (
        <NodeBlankState
          icon={<IVideo size={25} sw={1.5}/>}
          title="视频待加载"
          description="移动停止后按视口加载预览资源"
          tone="video"
        />
      )}
      {hasFailed && (
        <NodeBlankState
          icon={<IVideo size={25} sw={1.5}/>}
          title="生成失败"
          description={errorText || '后端没有返回错误详情，请检查模型配置或稍后重试'}
          tone="error"
        />
      )}
      {empty && (
        <NodeBlankState
          icon={<IVideo size={25} sw={1.5}/>}
          title="视频输入"
          description="生成视频或导入视频后会显示在这里"
          tone="video"
        />
      )}
    </NodeShell>
  );
}
