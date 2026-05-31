import React from 'react';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { ProviderStore } from '../../shared/platform/providerStore.js';
import { modelLabel, selectBackendModel } from '../../shared/platform/modelSelection.js';
import { IImage, IPano, ISparkle } from '../../shared/ui/icons/index.jsx';
import {
  FALLBACK_PANORAMA_PROMPT,
  PANORAMA_RATIOS,
  PANORAMA_RESOLUTIONS,
  PANORAMA_STYLES,
  createVR720GenDefaults,
  getPanoramaStyle,
} from '../panorama/panoramaConfig.js';
import { NodeShell } from './NodeShell.jsx';

function sourceForImageNode(node) {
  if (!node) return '';
  return node.src || node.url || node.assetUrl || node.settings?.imageUrl || node.assetPath || '';
}

function connectedImageNodes(nodeId, allNodes = [], edges = []) {
  const byId = new Map(allNodes.map((item) => [item.id, item]));
  const seen = new Set();
  return edges
    .filter((edge) => edge?.to === nodeId)
    .map((edge) => byId.get(edge.from))
    .filter((node) => {
      if (!node || seen.has(node.id)) return false;
      seen.add(node.id);
      return node.type === 'image' && Boolean(sourceForImageNode(node));
    });
}

export function VR720GenNode(props) {
  const { node, allNodes = [], edges = [], onUpdateNode, onGeneratePanorama } = props;
  const settings = { ...createVR720GenDefaults(), ...(node.settings || {}) };
  const [localSubmitting, setLocalSubmitting] = React.useState(false);
  const submitLockRef = React.useRef(false);
  const nodeGeneratingRef = React.useRef(Boolean(node.generating));
  const connectedImages = React.useMemo(
    () => connectedImageNodes(node.id, allNodes, edges),
    [allNodes, edges, node.id],
  );
  const referenceSources = React.useMemo(
    () => connectedImages.map(sourceForImageNode).filter(Boolean),
    [connectedImages],
  );

  const [models, setModels] = React.useState([]);
  const [modelLoading, setModelLoading] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setModelLoading(true);
    ProviderStore.models({ capability: 'image.generate' })
      .then((result) => {
        if (!alive) return;
        const items = (result?.models || []).filter((model) => model.enabled !== false);
        setModels(items);
      })
      .catch(() => {
        if (alive) setModels([]);
      })
      .finally(() => {
        if (alive) setModelLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const selectedModel = React.useMemo(() => selectBackendModel(models, {
    currentId: settings.modelId || settings.providerModelId,
    currentLabel: settings.model || node.model,
  }) || models[0] || null, [models, node.model, settings.model, settings.modelId, settings.providerModelId]);

  const selectedStyle = getPanoramaStyle(settings.style);
  const errorText = settings.error || node.error || '';
  const isGenerating = Boolean(node.generating) || localSubmitting;
  const disabled = isGenerating || !selectedModel || (!settings.prompt?.trim() && referenceSources.length === 0);
  const progress = Math.max(0, Math.min(100, Number(node.progress || settings.progress || 0)));
  const displayProgress = isGenerating ? Math.max(1, progress || 8) : progress;
  const statusLabel = node.jobStage || (localSubmitting ? '任务提交中' : '全景生成中');

  React.useEffect(() => {
    nodeGeneratingRef.current = Boolean(node.generating);
    if (node.generating) {
      submitLockRef.current = false;
      setLocalSubmitting(false);
    }
  }, [node.generating]);

  React.useEffect(() => {
    submitLockRef.current = false;
    setLocalSubmitting(false);
  }, [node.id, errorText, settings.imageUrl]);

  const updateSettings = React.useCallback((patch) => {
    onUpdateNode?.(node.id, {
      settings: { ...(node.settings || {}), ...patch },
    });
  }, [node.id, node.settings, onUpdateNode]);

  const onModelChange = React.useCallback((event) => {
    const next = models.find((model) => model.id === event.target.value) || selectedModel;
    onUpdateNode?.(node.id, {
      model: modelLabel(next),
      providerModelId: next?.id,
      settings: {
        ...(node.settings || {}),
        modelId: next?.id || '',
        providerModelId: next?.id || '',
        model: modelLabel(next),
      },
    });
  }, [models, node.id, node.settings, onUpdateNode, selectedModel]);

  const handleGenerate = React.useCallback((event) => {
    event.stopPropagation();
    if (disabled || submitLockRef.current) return;
    submitLockRef.current = true;
    setLocalSubmitting(true);
    try {
      const result = onGeneratePanorama?.(node.id);
      Promise.resolve(result).catch(() => {}).finally(() => {
        if (!nodeGeneratingRef.current) {
          submitLockRef.current = false;
          setLocalSubmitting(false);
        }
      });
    } catch {
      submitLockRef.current = false;
      setLocalSubmitting(false);
    }
  }, [disabled, node.id, onGeneratePanorama]);

  return (
    <NodeShell {...props} isEmpty={false} toolbar={null}>
      <div className={`vr720-node ${isGenerating ? 'generating' : ''}`} aria-busy={isGenerating}>
        {isGenerating && (
          <div className="vr720-status running">
            <span className="vr720-spin"/>
            <strong>生成中 {displayProgress}%</strong>
            <em>{statusLabel}</em>
          </div>
        )}
        {errorText && !isGenerating && (
          <div className="vr720-status failed">{errorText}</div>
        )}

        <div className="vr720-field three">
          <label>
            <span>风格</span>
            <select
              value={settings.style}
              onChange={(event) => updateSettings({ style: event.target.value })}
              onPointerDown={(event) => event.stopPropagation()}
              disabled={isGenerating}
            >
              {PANORAMA_STYLES.map((style) => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>比例</span>
            <select
              name="panoramaRatio"
              value={settings.ratio}
              onChange={(event) => updateSettings({ ratio: event.target.value })}
              onPointerDown={(event) => event.stopPropagation()}
              disabled={isGenerating}
            >
              {PANORAMA_RATIOS.map((ratio) => (
                <option key={ratio} value={ratio}>{ratio}</option>
              ))}
            </select>
          </label>
          <label>
            <span>分辨率</span>
            <select
              name="panoramaResolution"
              value={settings.resolution}
              onChange={(event) => updateSettings({ resolution: event.target.value })}
              onPointerDown={(event) => event.stopPropagation()}
              disabled={isGenerating}
            >
              {PANORAMA_RESOLUTIONS.map((resolution) => (
                <option key={resolution} value={resolution}>{resolution}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="vr720-field">
          <span>场景描述</span>
          <textarea
            value={settings.prompt}
            placeholder="描述要生成的720空间场景，或连接参考图片后直接生成"
            onChange={(event) => updateSettings({ prompt: event.target.value })}
            onPointerDown={(event) => event.stopPropagation()}
            disabled={isGenerating}
          />
        </label>

        <div className={`vr720-refs ${referenceSources.length ? '' : 'empty'}`}>
          <div className="vr720-refs-head">
            <span><IImage size={12}/> 参考图</span>
            <em>{referenceSources.length} 张</em>
          </div>
          {referenceSources.length ? (
            <div className="vr720-ref-list">
              {connectedImages.slice(0, 6).map((image, index) => {
                const src = makeAssetUrl({ src: sourceForImageNode(image) });
                return (
                  <div className="vr720-ref" key={`${image.id}-${index}`}>
                    <img src={src} alt="" draggable="false"/>
                    <span>{index + 1}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="vr720-ref-empty">
              <IPano size={18}/>
              <span>从图片节点连线到这里作为720参考图</span>
            </div>
          )}
        </div>

        {isGenerating && (
          <div className="vr720-loading-panel" aria-live="polite">
            <div className="vr720-orbit" aria-hidden="true">
              <span className="vr720-orbit-ring"/>
              <span className="vr720-orbit-ring inner"/>
              <span className="vr720-orbit-sweep"/>
              <span className="vr720-orbit-mark">720°</span>
            </div>
            <div className="vr720-loading-copy">
              <strong>{statusLabel}</strong>
              <span>已提交任务，请勿重复点击</span>
            </div>
            <div
              className="vr720-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={displayProgress}
            >
              <span className="vr720-progress-fill" style={{ width: `${displayProgress}%` }}/>
            </div>
          </div>
        )}

        <div className="vr720-footer">
          <select
            className="vr720-model"
            value={selectedModel?.id || ''}
            onChange={onModelChange}
            onPointerDown={(event) => event.stopPropagation()}
            title={selectedModel ? modelLabel(selectedModel) : '选择模型'}
            disabled={isGenerating}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>{modelLabel(model)}</option>
            ))}
          </select>
          <button
            className="vr720-generate"
            type="button"
            disabled={disabled}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleGenerate}
          >
            <ISparkle size={12}/>
            {isGenerating ? `生成中 ${displayProgress}%` : modelLoading ? '模型加载' : '生成720'}
          </button>
        </div>

        {settings.imageUrl && !isGenerating && (
          <div className="vr720-last">
            <span>已生成全景图</span>
            <em>{selectedStyle.label || FALLBACK_PANORAMA_PROMPT}</em>
          </div>
        )}
      </div>
    </NodeShell>
  );
}
