import React from 'react';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { IAdd, IArrow, ICamera, IGrid9, IPano, IUndo } from '../../shared/ui/icons/index.jsx';
import { importLocalFileAsAsset } from '../../shared/utils/uploadHelpers.js';
import { createPanoramaViewerDefaults } from '../panorama/panoramaConfig.js';
import { PanoramaEngine } from '../panorama/PanoramaEngine.js';
import { NodeBlankState, NodeShell } from './NodeShell.jsx';

const SCREENSHOT_MODES = [
  { id: 'single', label: '单张', icon: ICamera },
  { id: 'grid4', label: '四方位', icon: IGrid9 },
  { id: 'grid6', label: '六方位', icon: IGrid9 },
  { id: 'grid9', label: '九方位', icon: IGrid9 },
  { id: 'grid12', label: '十二方位', icon: IGrid9 },
];

const LOCAL_ASSET_RETRY_DELAYS_MS = [300, 900];

function isLocalAssetUrl(url) {
  if (typeof url !== 'string') return false;
  const text = url.trim();
  if (text.startsWith('/assets/')) return true;
  try {
    const parsed = new URL(text);
    const host = parsed.hostname.toLowerCase();
    return (host === '127.0.0.1' || host === 'localhost') && parsed.pathname.startsWith('/assets/');
  } catch {
    return false;
  }
}

function waitForRetry(delayMs) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

async function loadPanoramaImageWithRetry(engine, imageUrl, shouldContinue) {
  const retryable = isLocalAssetUrl(imageUrl);
  let lastError = null;
  for (let attempt = 0; attempt <= LOCAL_ASSET_RETRY_DELAYS_MS.length; attempt += 1) {
    if (!shouldContinue()) return null;
    try {
      return await engine.loadImage(imageUrl);
    } catch (error) {
      lastError = error;
      const hasRetry = retryable && attempt < LOCAL_ASSET_RETRY_DELAYS_MS.length;
      if (!hasRetry || !shouldContinue()) break;
      await waitForRetry(LOCAL_ASSET_RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError || new Error('Failed to load panorama image');
}

function sourceForNode(node) {
  if (!node) return '';
  if (node.type === 'image') return node.src || node.url || node.assetUrl || node.settings?.imageUrl || node.assetPath || '';
  if (node.type === 'vr720-gen') return node.settings?.imageUrl || node.imageUrl || '';
  return node.settings?.panoramaImageUrl || node.src || '';
}

function connectedImageSource(nodeId, allNodes = [], edges = []) {
  const byId = new Map(allNodes.map((item) => [item.id, item]));
  const source = edges
    .filter((edge) => edge?.to === nodeId)
    .map((edge) => sourceForNode(byId.get(edge.from)))
    .find(Boolean);
  return source || '';
}

export function PanoramaViewerNode(props) {
  const { node, allNodes = [], edges = [], onUpdateNode, onCreateNode, onCreateEdge } = props;
  const settings = { ...createPanoramaViewerDefaults(), ...(node.settings || {}) };
  const containerRef = React.useRef(null);
  const engineRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const viewChangeTimerRef = React.useRef(null);
  const [capturing, setCapturing] = React.useState(false);
  const [loadStatus, setLoadStatus] = React.useState({ url: '', loading: false, error: '' });

  const connectedSource = React.useMemo(
    () => connectedImageSource(node.id, allNodes, edges),
    [allNodes, edges, node.id],
  );
  const rawImageUrl = settings.panoramaImageUrl || connectedSource || '';
  const imageUrl = rawImageUrl ? makeAssetUrl({ src: rawImageUrl }) : '';
  const usesConnectedImage = Boolean(!settings.panoramaImageUrl && connectedSource);
  const hasImage = Boolean(imageUrl);
  const imageInfo = settings.imageInfo || null;
  const showRatioHint = hasImage && imageInfo && imageInfo.isNearEquirectangular === false;
  const activeLoadStatus = loadStatus.url === imageUrl ? loadStatus : null;
  const persistedLoadErrorUrl = settings.loadErrorUrl ? makeAssetUrl({ src: settings.loadErrorUrl }) : '';
  const persistedLoadError = settings.loadError
    && !usesConnectedImage
    && (!persistedLoadErrorUrl || persistedLoadErrorUrl === imageUrl)
    ? settings.loadError
    : '';
  const isLoading = activeLoadStatus
    ? Boolean(activeLoadStatus.loading)
    : Boolean(settings.isLoading && !settings.loadError);
  const visibleLoadError = !isLoading ? (activeLoadStatus ? activeLoadStatus.error : persistedLoadError) : '';

  const updateSettings = React.useCallback((patch) => {
    onUpdateNode?.(node.id, {
      settings: { ...(node.settings || {}), ...patch },
    });
  }, [node.id, node.settings, onUpdateNode]);

  React.useEffect(() => {
    if (!containerRef.current) return undefined;
    const engine = new PanoramaEngine(containerRef.current, {
      fov: settings.fov,
      yaw: settings.yaw,
      pitch: settings.pitch,
      onViewChange: (state) => {
        if (viewChangeTimerRef.current) window.clearTimeout(viewChangeTimerRef.current);
        viewChangeTimerRef.current = window.setTimeout(() => {
          updateSettings({
            fov: state.fov,
            yaw: state.yaw,
            pitch: state.pitch,
          });
        }, 200);
      },
    });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
      if (viewChangeTimerRef.current) {
        window.clearTimeout(viewChangeTimerRef.current);
        viewChangeTimerRef.current = null;
      }
    };
  }, [node.id]);

  React.useEffect(() => {
    if (!engineRef.current || !imageUrl) {
      setLoadStatus((current) => (
        current.url || current.loading || current.error
          ? { url: '', loading: false, error: '' }
          : current
      ));
      return;
    }
    let cancelled = false;
    setLoadStatus({ url: imageUrl, loading: true, error: '' });
    updateSettings({ isLoading: true, loadError: null, loadErrorUrl: null });
    engineRef.current.setOriginalUrl(imageUrl);
    loadPanoramaImageWithRetry(engineRef.current, imageUrl, () => !cancelled)
      .then((nextImageInfo) => {
        if (cancelled) return;
        setLoadStatus({ url: imageUrl, loading: false, error: '' });
        updateSettings({
          isLoading: false,
          loadError: null,
          loadErrorUrl: null,
          imageInfo: nextImageInfo || null,
          aspectRatio: nextImageInfo?.aspectRatioLabel || settings.aspectRatio,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLoadStatus({ url: imageUrl, loading: false, error: '全景图加载失败' });
        updateSettings({ isLoading: false, loadError: '全景图加载失败', loadErrorUrl: imageUrl });
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const rafId = requestAnimationFrame(() => engineRef.current?.resize());
    const observer = new ResizeObserver(() => engineRef.current?.resize());
    observer.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const rafId = requestAnimationFrame(() => engineRef.current?.resize());
    return () => cancelAnimationFrame(rafId);
  }, [node.w, node.h]);

  const loadFile = React.useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const projectId = node.projectId || node.project_id || 'local-default';
    const persisted = await importLocalFileAsAsset(file, projectId, 'image', {
      source: 'panorama-viewer-upload',
      nodeId: node.id,
      inLibrary: false,
      libraryAsset: false,
      scope: 'project',
      projectId,
      project_id: projectId,
    });
    const importedUrl = persisted?.src || persisted?.url || persisted?.assetUrl;
    if (importedUrl) {
      updateSettings({
        panoramaImageUrl: importedUrl,
        displayName: persisted?.title || file.name,
        assetId: persisted?.id,
        assetPath: persisted?.path,
        loadError: null,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateSettings({
      panoramaImageUrl: reader.result,
      displayName: file.name,
      loadError: null,
    });
    reader.readAsDataURL(file);
  }, [node.id, node.projectId, node.project_id, updateSettings]);

  const createScreenshotNodes = React.useCallback((results, mode) => {
    const cols = mode === 'single' ? 1 : mode === 'grid12' ? 4 : 3;
    results.forEach((result, index) => {
      const id = `panoShot${Date.now().toString(36)}_${index}_${Math.random().toString(36).slice(2, 4)}`;
      const created = {
        id,
        type: 'image',
        x: node.x + node.w + 70 + (index % cols) * 260,
        y: node.y + Math.floor(index / cols) * 200,
        w: 240,
        h: 155,
        title: `720截图 ${index + 1}`,
        src: result.url,
        tag: '720截图',
      };
      onCreateNode?.(created);
      onCreateEdge?.({ id: `e${node.id}_${id}`, from: node.id, to: id });
    });
  }, [node.h, node.id, node.w, node.x, node.y, onCreateEdge, onCreateNode]);

  const handleScreenshot = React.useCallback(async (mode) => {
    if (!engineRef.current || capturing || !hasImage) return;
    setCapturing(true);
    try {
      const results = await engineRef.current.captureScreenshots(mode);
      if (results.length) createScreenshotNodes(results, mode);
    } finally {
      setCapturing(false);
    }
  }, [capturing, createScreenshotNodes, hasImage]);

  return (
    <NodeShell {...props} isEmpty={!hasImage} toolbar={null}>
      <div
        className="panorama-viewer-node"
        onPointerDown={(event) => event.stopPropagation()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          loadFile(event.dataTransfer.files?.[0]);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div
          ref={containerRef}
          className="panorama-engine-host"
          onClick={() => {
            if (!hasImage) fileInputRef.current?.click();
          }}
        />

        {!hasImage && (
          <NodeBlankState
            icon={<IPano size={25} sw={1.5}/>}
            title="720全景预览"
            description="生成完成后会自动回填，也可以拖入全景图"
            tone="image"
          />
        )}

        {isLoading && (
          <div className="panorama-loading">
            <span className="vr720-spin"/>
            <em>加载中</em>
          </div>
        )}

        {visibleLoadError && (
          <div className="panorama-error">{visibleLoadError}</div>
        )}

        {showRatioHint && !isLoading && (
          <div className="panorama-ratio-hint">
            {imageInfo.width} × {imageInfo.height} · 非 2:1，全景预览可能拉伸
          </div>
        )}

        {hasImage && !isLoading && (
          <div className="panorama-toolbar" onPointerDown={(event) => event.stopPropagation()}>
            {SCREENSHOT_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  title={mode.label}
                  disabled={capturing}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleScreenshot(mode.id);
                  }}
                >
                  <Icon size={13}/>
                  <span>{mode.label}</span>
                </button>
              );
            })}
            <span className="panorama-sep"/>
            <button type="button" title="重置视角" onClick={(event) => { event.stopPropagation(); engineRef.current?.resetView(); }}>
              <IUndo size={13}/>
            </button>
            <button type="button" title="更换图片" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}>
              <IAdd size={13}/>
            </button>
            <button type="button" title="下载原图" onClick={(event) => { event.stopPropagation(); engineRef.current?.downloadOriginal(); }}>
              <IArrow size={13}/>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(event) => {
            loadFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
    </NodeShell>
  );
}
