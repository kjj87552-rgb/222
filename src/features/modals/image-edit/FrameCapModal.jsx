import React from 'react';
import { ICamera, IArrow } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { makeAssetUrl } from '../../../shared/platform/backendClient.js';

const FRAME_COUNT = 12;
const FRAME_MIME = 'image/png';

function formatFrameTime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function frameTimesForDuration(duration, count = FRAME_COUNT) {
  const safeDuration = Number(duration);
  if (!Number.isFinite(safeDuration) || safeDuration <= 0) return [];
  const total = Math.max(1, Math.floor(count));
  if (total === 1 || safeDuration <= 0.12) return [0];
  const last = Math.max(0, safeDuration - 0.05);
  return Array.from({ length: total }, (_, index) => (last * index) / (total - 1));
}

function waitForVideoMetadata(video, signal) {
  return new Promise((resolve, reject) => {
    if (video.readyState >= 1 && Number.isFinite(Number(video.duration)) && Number(video.duration) > 0) {
      resolve();
      return;
    }
    if (signal?.aborted) {
      reject(new Error('视频截帧已取消'));
      return;
    }
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('视频元数据读取超时'));
    }, 12000);
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('error', onError);
      signal?.removeEventListener?.('abort', onAbort);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('视频加载失败'));
    };
    const onAbort = () => {
      cleanup();
      reject(new Error('视频截帧已取消'));
    };
    video.addEventListener('loadedmetadata', onReady, { once: true });
    video.addEventListener('error', onError, { once: true });
    signal?.addEventListener?.('abort', onAbort, { once: true });
  });
}

function seekVideo(video, time, signal) {
  return new Promise((resolve, reject) => {
    const targetTime = Math.max(0, Number(time) || 0);
    if (Math.abs((Number(video.currentTime) || 0) - targetTime) < 0.015 && video.readyState >= 2) {
      resolve();
      return;
    }
    if (signal?.aborted) {
      reject(new Error('视频截帧已取消'));
      return;
    }
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('视频跳转超时'));
    }, 12000);
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      signal?.removeEventListener?.('abort', onAbort);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('视频跳转失败'));
    };
    const onAbort = () => {
      cleanup();
      reject(new Error('视频截帧已取消'));
    };
    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    signal?.addEventListener?.('abort', onAbort, { once: true });
    video.currentTime = targetTime;
  });
}

async function captureVideoFrame(video, time, index, total, signal) {
  await seekVideo(video, time, signal);
  const width = Math.max(1, video.videoWidth || 1280);
  const height = Math.max(1, video.videoHeight || 720);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('无法创建截帧画布');
  ctx.drawImage(video, 0, 0, width, height);
  const dataUrl = canvas.toDataURL(FRAME_MIME);
  const t = formatFrameTime(time);
  return {
    t,
    img: dataUrl,
    dataUrl,
    width,
    height,
    timestampSec: time,
    frameIndex: index,
    frameCount: total,
    label: `截帧 ${t}`,
    model: '视频截帧',
    source: 'video-frame-capture',
  };
}

function crossOriginForVideoSource(source) {
  if (!/^https?:/i.test(source || '')) return undefined;
  return 'anonymous';
}

export function FrameCapModal({
  src,
  assetId,
  assetPath,
  assetUrl,
  title,
  onClose,
  onApply,
}) {
  const [pick, setPick] = React.useState(0);
  const [slots, setSlots] = React.useState([]);
  const [status, setStatus] = React.useState(src ? 'loading' : 'empty');
  const [error, setError] = React.useState('');
  const [exporting, setExporting] = React.useState(false);
  const videoRef = React.useRef(null);
  const videoSource = React.useMemo(() => makeAssetUrl({
    src,
    assetId,
    id: assetId,
    assetPath,
    path: assetPath,
    assetUrl,
    preferLocalAsset: true,
  }), [assetId, assetPath, assetUrl, src]);

  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const video = videoRef.current;
    setPick(0);
    setSlots([]);
    setError('');
    if (!videoSource || !video) {
      setStatus('empty');
      return () => { cancelled = true; };
    }

    async function extractFrames() {
      setStatus('loading');
      try {
        await waitForVideoMetadata(video, controller.signal);
        if (cancelled) return;
        const times = frameTimesForDuration(video.duration, FRAME_COUNT);
        const captured = [];
        for (let index = 0; index < times.length; index += 1) {
          const frame = await captureVideoFrame(video, times[index], index, times.length, controller.signal);
          if (cancelled) return;
          captured.push(frame);
          setSlots([...captured]);
        }
        if (!captured.length) throw new Error('没有可导出的帧');
        if (!cancelled) setStatus('ready');
      } catch (captureError) {
        if (cancelled) return;
        console.warn('Frame capture failed', captureError);
        setStatus('error');
        setError(captureError instanceof Error ? captureError.message : String(captureError));
      }
    }

    extractFrames();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [videoSource]);

  const selected = slots[pick] || null;
  const statusText = status === 'error'
    ? (error || '视频截帧失败')
    : status === 'empty'
      ? '没有可截帧的视频源'
      : '正在解析视频帧…';

  const exportFrame = React.useCallback(async () => {
    if (!selected || exporting) return;
    setExporting(true);
    setError('');
    try {
      await onApply?.({
        ...selected,
        label: selected.label || `截帧 ${selected.t}`,
        filename: `${title || 'video'}-${selected.t.replace(/:/g, '-')}.png`,
      });
      onClose?.();
    } catch (applyError) {
      console.warn('Frame export failed', applyError);
      setStatus('error');
      setError(applyError instanceof Error ? applyError.message : String(applyError));
      setExporting(false);
    }
  }, [exporting, onApply, onClose, selected, title]);

  return (
    <XModal title="视频截帧 → 图片节点" icon={<ICamera size={16}/>} onClose={onClose}
      className="fc-modal"
      footer={<>
        <span className="x-credit">{selected ? '已选 1 帧' : '未选帧'}</span>
        <span style={{ flex: 1 }}/>
        <button className="x-btn ghost" onClick={onClose}>取消</button>
        <button className="x-btn primary" disabled={!selected || exporting} onClick={exportFrame}>
          <IArrow size={12}/>{exporting ? '导出中…' : '导出为图片节点'}
        </button>
      </>}
    >
      <div className="fc-stage">
        {videoSource && (
          <video
            ref={videoRef}
            data-testid="framecap-video"
            src={videoSource}
            crossOrigin={crossOriginForVideoSource(videoSource)}
            muted
            playsInline
            preload="auto"
            className="fc-video-source"
          />
        )}
        {selected ? (
          <>
            <img src={selected.img} alt=""/>
            <div style={{ position: 'absolute', left: 14, top: 14, padding: '4px 10px', background: 'rgba(10,12,14,0.65)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11, borderRadius: 4 }}>
              {selected.t} · 帧 {pick + 1}/{slots.length}
            </div>
          </>
        ) : (
          <div className="fc-stage-empty">{statusText}</div>
        )}
      </div>
      <div className="fc-strip">
        {slots.length ? (
          slots.map((s, i) => (
            <button key={`${s.t}-${i}`} type="button" className={`sl ${pick===i?'active':''}`}
              style={{ backgroundImage: `url(${s.img})` }}
              onClick={() => setPick(i)}>
              <span className="t">{s.t}</span>
            </button>
          ))
        ) : (
          <div className="fc-strip-status">{statusText}</div>
        )}
      </div>
    </XModal>
  );
}
