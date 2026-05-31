import React from 'react';
import { makeAssetUrl } from '../../../shared/platform/backendClient.js';
import {
  IAudio,
  IArrow,
  ICheck,
  IClose,
  IEye,
  IFilm,
  IMagic,
  IUndo,
} from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import {
  defaultSubtitleRegion,
  normalizeSubtitleRegion,
  normalizeVideoSize,
  regionFromClientDrag,
  subtitleRegionStyle,
} from './videoSubtitleRemoval.js';

const INPAINT_MODES = [
  { value: 'sttn-auto', label: 'STTN 自动', meta: '推荐', tone: 'primary' },
  { value: 'sttn-det', label: 'STTN 检测', meta: '保守' },
  { value: 'lama', label: 'LaMa', meta: '动画' },
  { value: 'opencv', label: 'OpenCV', meta: '快速' },
];

const QUALITY_PRESETS = [
  { value: 'balanced', label: '均衡' },
  { value: 'quality', label: '质量' },
  { value: 'speed', label: '速度' },
];

const WORKFLOW_STAGES = [
  { key: 'queued', label: '待处理' },
  { key: 'detect', label: '检测字幕' },
  { key: 'repair', label: '修复画面' },
  { key: 'audio', label: '合并音频' },
  { key: 'done', label: '完成' },
];

const REGION_DRAG_THRESHOLD_PX = 4;

function numericInputValue(value) {
  return Number.isFinite(Number(value)) ? String(Math.round(Number(value))) : '0';
}

function finiteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanOutputTitle(title) {
  const base = String(title || '视频').trim() || '视频';
  return base.endsWith('去字幕') ? base : `${base} · 去字幕`;
}

function formatSeconds(value) {
  const parsed = finiteNumber(value, 0);
  if (parsed <= 0) return '0:00';
  const minutes = Math.floor(parsed / 60);
  const seconds = Math.floor(parsed % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function VideoSubtitleRemoveModal({
  src,
  assetId,
  assetPath,
  assetUrl,
  nodeId,
  projectId,
  title,
  videoWidth,
  videoHeight,
  onApply,
  onClose,
}) {
  const initialSize = React.useMemo(
    () => normalizeVideoSize({ width: videoWidth || 1920, height: videoHeight || 1080 }),
    [videoHeight, videoWidth],
  );
  const [videoSize, setVideoSize] = React.useState(initialSize);
  const [region, setRegion] = React.useState(() => defaultSubtitleRegion(initialSize));
  const [inpaintMode, setInpaintMode] = React.useState('sttn-auto');
  const [qualityPreset, setQualityPreset] = React.useState('balanced');
  const [expandPixels, setExpandPixels] = React.useState(12);
  const [preserveAudio, setPreserveAudio] = React.useState(true);
  const [timeMode, setTimeMode] = React.useState('full');
  const [startSeconds, setStartSeconds] = React.useState('0');
  const [endSeconds, setEndSeconds] = React.useState('');
  const [duration, setDuration] = React.useState(null);
  const [outputTitle, setOutputTitle] = React.useState(() => cleanOutputTitle(title));
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [dragging, setDragging] = React.useState(false);
  const [frameSize, setFrameSize] = React.useState({ width: 16, height: 9 });
  const frameRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const touchedRef = React.useRef(false);

  const videoUrl = makeAssetUrl({
    src: src || assetUrl || assetPath,
    assetId,
    assetUrl,
  });

  React.useEffect(() => {
    setVideoSize(initialSize);
    if (!touchedRef.current) setRegion(defaultSubtitleRegion(initialSize));
  }, [initialSize]);

  React.useEffect(() => {
    const updateFrameSize = () => {
      const rect = frameRef.current?.getBoundingClientRect?.();
      if (!rect?.width || !rect?.height) return;
      setFrameSize((current) => {
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        return current.width === width && current.height === height ? current : { width, height };
      });
    };
    updateFrameSize();
    const frame = frameRef.current;
    const ResizeObserverCtor = typeof ResizeObserver === 'function' ? ResizeObserver : null;
    const observer = ResizeObserverCtor && frame ? new ResizeObserverCtor(updateFrameSize) : null;
    observer?.observe(frame);
    window.addEventListener('resize', updateFrameSize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateFrameSize);
    };
  }, [videoUrl]);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video?.videoHeight) return;
    const nextSize = normalizeVideoSize({ width: video.videoWidth, height: video.videoHeight });
    setVideoSize(nextSize);
    if (Number.isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
      if (!endSeconds) setEndSeconds(String(Math.round(video.duration)));
    }
    if (!touchedRef.current) setRegion(defaultSubtitleRegion(nextSize));
  };

  const startDrag = (event) => {
    if (!frameRef.current || busy) return;
    const rect = frameRef.current.getBoundingClientRect();
    const start = { clientX: event.clientX, clientY: event.clientY };
    let hasDragged = false;
    const onMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - start.clientX;
      const deltaY = moveEvent.clientY - start.clientY;
      if (!hasDragged && Math.hypot(deltaX, deltaY) < REGION_DRAG_THRESHOLD_PX) return;
      hasDragged = true;
      touchedRef.current = true;
      setDragging(true);
      moveEvent.preventDefault?.();
      setRegion(regionFromClientDrag(start, moveEvent, rect, videoSize));
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const setRegionField = (field, value) => {
    touchedRef.current = true;
    setRegion((current) => normalizeSubtitleRegion({ ...current, [field]: value }, videoSize));
  };

  const resetRegion = () => {
    touchedRef.current = false;
    setRegion(defaultSubtitleRegion(videoSize));
  };

  const normalizedRegion = normalizeSubtitleRegion(region, videoSize);
  const regionStyle = subtitleRegionStyle(normalizedRegion, videoSize, frameSize);
  const normalizedExpand = Math.max(0, Math.min(120, Math.round(finiteNumber(expandPixels, 0))));
  const customStart = Math.max(0, finiteNumber(startSeconds, 0));
  const customEndValue = endSeconds === '' ? null : Math.max(0, finiteNumber(endSeconds, 0));
  const timeRange = timeMode === 'custom'
    ? {
      mode: 'custom',
      startSeconds: customStart,
      endSeconds: customEndValue && customEndValue > customStart ? customEndValue : null,
    }
    : { mode: 'full', startSeconds: 0, endSeconds: null };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onApply?.({
        type: 'video.subtitle.remove',
        projectId,
        sourceNodeId: nodeId,
        nodeId,
        assetId,
        assetPath,
        assetUrl,
        videoUrl: src || assetUrl || videoUrl,
        videoPath: assetPath,
        path: assetPath || src,
        title: title || '视频',
        outputTitle: outputTitle || cleanOutputTitle(title),
        region: normalizedRegion,
        expandPixels: normalizedExpand,
        inpaintMode,
        qualityPreset,
        preserveAudio,
        timeRange,
        videoWidth: videoSize.width,
        videoHeight: videoSize.height,
      });
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err || '去字幕任务提交失败'));
      setBusy(false);
    }
  };

  return (
    <ToolModal
      fullscreen
      className="vsr-tool-modal"
      onClose={onClose}
    >
      <div className="vsr-workbench">
        <header className="vsr-workbench-head">
          <button className="vsr-head-close" type="button" onClick={onClose} title="退出工作台">
            <IClose size={16}/>
          </button>
          <div className="vsr-workbench-title">
            <strong><IMagic size={16}/>全局去字幕工作台</strong>
            <span>去字幕 · 输出新视频节点</span>
          </div>
          <div className="vsr-workbench-status">
            <span><i/>去字幕</span>
            <b>{formatSeconds(duration || 0)} · {videoSize.width} × {videoSize.height}</b>
          </div>
        </header>

        <div className="vsr-modal">
          <section className="vsr-preview">
            <div className="vsr-preview-head">
              <div>
                <span><IFilm size={14}/>预览与字幕区域</span>
                <strong>字幕区域 01 · 坐标实时同步</strong>
              </div>
              <button type="button" onClick={resetRegion} disabled={busy}>
                <IUndo size={14}/>重置区域
              </button>
            </div>
            <div className="vsr-frame-shell">
              <div
                ref={frameRef}
                data-testid="vsr-region-frame"
                className={`vsr-frame${dragging ? ' dragging' : ''}`}
                onPointerDown={startDrag}
              >
                {videoUrl ? (
                  <video ref={videoRef} src={videoUrl} controls playsInline onLoadedMetadata={onLoadedMetadata}/>
                ) : (
                  <div className="vsr-empty">视频地址为空</div>
                )}
                <div className="vsr-mask"/>
                <div className="vsr-region" style={regionStyle}>
                  <em>字幕区域 01</em>
                  <span/><span/><span/><span/>
                </div>
              </div>
            </div>
            <div className="vsr-timeline">
              <div className="vsr-timeline-bar">
                <i style={{ left: `${Math.min(92, Math.max(4, (normalizedRegion.x / videoSize.width) * 100))}%` }}/>
              </div>
              <div className="vsr-stage-row">
                {WORKFLOW_STAGES.map((stage, index) => (
                  <span key={stage.key} className={busy && index === 0 ? 'active' : ''}>{stage.label}</span>
                ))}
              </div>
            </div>
          </section>

          <aside className="vsr-side">
            <div className="vsr-side-scroll">
              <section className="vsr-panel-section">
                <div className="vsr-section-head">
                  <span>处理模式</span>
                  <b className="vsr-engine"><i/>GhostCut API</b>
                </div>
                <div className="vsr-mode-list">
                  {INPAINT_MODES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`vsr-mode${inpaintMode === option.value ? ' active' : ''}`}
                      onClick={() => setInpaintMode(option.value)}
                      disabled={busy}
                    >
                      <span>{option.label}</span>
                      <em>{option.meta}</em>
                    </button>
                  ))}
                </div>
                <div className="vsr-segment">
                  {QUALITY_PRESETS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={qualityPreset === option.value ? 'active' : ''}
                      onClick={() => setQualityPreset(option.value)}
                      disabled={busy}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="vsr-panel-section">
                <div className="vsr-section-head"><span>字幕区域</span><b>{normalizedRegion.width} × {normalizedRegion.height}</b></div>
                <div className="vsr-grid">
                  {['x', 'y', 'width', 'height'].map((field) => (
                    <label key={field}>
                      <span>{field}</span>
                      <input
                        type="number"
                        min="0"
                        value={numericInputValue(normalizedRegion[field])}
                        onChange={(event) => setRegionField(field, event.target.value)}
                        disabled={busy}
                      />
                    </label>
                  ))}
                </div>
                <label className="vsr-range-field">
                  <span>边缘扩展 <b>{normalizedExpand}px</b></span>
                  <input
                    data-testid="vsr-expand-pixels"
                    type="range"
                    min="0"
                    max="80"
                    step="1"
                    value={normalizedExpand}
                    onInput={(event) => setExpandPixels(event.currentTarget.value)}
                    onChange={(event) => setExpandPixels(event.target.value)}
                    disabled={busy}
                  />
                </label>
              </section>

              <section className="vsr-panel-section">
                <div className="vsr-section-head"><span>范围与输出</span><b>{timeRange.mode === 'full' ? '全片' : '片段'}</b></div>
                <div className="vsr-segment vsr-segment-two">
                  <button type="button" className={timeMode === 'full' ? 'active' : ''} onClick={() => setTimeMode('full')} disabled={busy}>全片</button>
                  <button type="button" className={timeMode === 'custom' ? 'active' : ''} onClick={() => setTimeMode('custom')} disabled={busy}>自定义</button>
                </div>
                {timeMode === 'custom' && (
                  <div className="vsr-grid">
                    <label>
                      <span>开始秒</span>
                      <input type="number" min="0" value={startSeconds} onChange={(event) => setStartSeconds(event.target.value)} disabled={busy}/>
                    </label>
                    <label>
                      <span>结束秒</span>
                      <input type="number" min="0" value={endSeconds} onChange={(event) => setEndSeconds(event.target.value)} disabled={busy}/>
                    </label>
                  </div>
                )}
                <label className="vsr-output-name">
                  <span>输出名称</span>
                  <input value={outputTitle} onChange={(event) => setOutputTitle(event.target.value)} disabled={busy}/>
                </label>
                <label className="vsr-toggle">
                  <input
                    data-testid="vsr-preserve-audio"
                    type="checkbox"
                    checked={preserveAudio}
                    onChange={(event) => setPreserveAudio(event.target.checked)}
                    disabled={busy}
                  />
                  <span><IAudio size={14}/>保留原音频</span>
                </label>
              </section>

              <div className="vsr-meta">
                <span><IEye size={12}/>输出 MP4</span>
                <span>{videoSize.width} × {videoSize.height}</span>
              </div>
              {error && <div className="vsr-error">{error}</div>}
            </div>

            <div className="vsr-side-actions">
              <button type="button" className="vsr-ghost-action" onClick={resetRegion} disabled={busy}>
                <IUndo size={14}/>重置
              </button>
              <button
                type="button"
                data-testid="vsr-submit"
                className="vsr-submit-action"
                onClick={submit}
                disabled={busy || !videoUrl}
              >
                {busy ? <ICheck size={15}/> : <IArrow size={15}/>}
                {busy ? '提交中' : '开始去字幕'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </ToolModal>
  );
}
