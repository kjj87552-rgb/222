import React from 'react';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { ProviderStore } from '../../shared/platform/providerStore.js';
import { capabilityForGeneration } from '../../shared/platform/generationPayload.js';
import { modelLabel, modelMatchesLabel, selectBackendModel } from '../../shared/platform/modelSelection.js';
import { ICheck, IChevD, IImage, ISparkle } from '../../shared/ui/icons/index.jsx';
import { NodeShell } from './NodeShell.jsx';
import {
  ASSET_RATIOS,
  ASSET_RESOLUTIONS,
  ASSET_STYLES,
  ASSET_TYPES,
  getAssetStyleByValue,
  getAssetTypeByValue,
} from './assetGenPresets.js';

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values) {
  const seen = new Set();
  return values.map(compactString).filter((value) => {
    const text = compactString(value);
    if (!text || seen.has(text)) return false;
    seen.add(text);
    return true;
  });
}

function isDisplayableSource(value) {
  return /^(https?:|data:|blob:|libai-asset:|\/)/i.test(compactString(value));
}

function firstMediaSource(values) {
  const sources = uniqueStrings(values);
  return sources.find(isDisplayableSource) || sources[0] || '';
}

function singleMediaSource(values) {
  const source = firstMediaSource(values);
  return source ? [source] : [];
}

function listValues(value) {
  return Array.isArray(value) ? value : [];
}

function sourceCandidates(item) {
  if (!item || typeof item === 'string') return [item];
  return [
    item.src,
    item.url,
    item.assetUrl,
    item.imageUrl,
    item.settings?.imageUrl,
    item.path,
    item.assetPath,
  ];
}

function mediaSourcesFromItems(items, fallbackValues = []) {
  const sources = uniqueStrings(items.map((item) => firstMediaSource(sourceCandidates(item))));
  if (sources.length) return sources;
  return singleMediaSource(fallbackValues);
}

function mediaSource(node, preferredKind = 'image') {
  if (!node) return [];
  if (node.type === 'image') {
    const imageItems = [
      ...listValues(node.imageUrls),
      ...listValues(node.images),
      ...listValues(node.assets),
    ];
    return mediaSourcesFromItems(imageItems.length ? [...imageItems, {
      src: node.src,
      url: node.url,
      assetUrl: node.assetUrl,
      imageUrl: node.imageUrl,
      settings: node.settings,
    }] : [node], [node.assetPath]);
  }
  if (node.type === 'video' && preferredKind !== 'image-only') {
    return singleMediaSource([
      node.poster,
      node.posterUrl,
      node.thumbnailUrl,
      node.settings?.poster,
      node.posterPath,
    ]);
  }
  if (node.type === 'asset-gen') {
    const imageItems = [
      ...listValues(node.imageUrls),
      ...listValues(node.images),
      ...listValues(node.assets),
    ];
    return mediaSourcesFromItems(imageItems.length ? [...imageItems, {
      src: node.src,
      url: node.url,
      assetUrl: node.assetUrl,
      imageUrl: node.imageUrl,
      settings: node.settings,
    }] : [node], [node.assetPath]);
  }
  return [];
}

function collectConnectedImages(nodeId, allNodes = [], edges = []) {
  const byId = new Map(allNodes.map((node) => [node.id, node]));
  return uniqueStrings((edges || [])
    .filter((edge) => edge?.to === nodeId)
    .flatMap((edge) => mediaSource(byId.get(edge.from), 'image')));
}

function buildFinalPrompt({ prompt, assetType, assetStyle }) {
  const userPrompt = compactString(prompt);
  const prefix = assetType?.promptPrefix || '';
  const suffix = assetStyle?.promptSuffix || '';
  let result = prefix ? (userPrompt ? `${prefix}, ${userPrompt}` : prefix) : userPrompt;
  if (suffix) result = `${result}${suffix}`;
  return result.trim();
}

function displayUrl(src) {
  return src ? makeAssetUrl({ src }) : '';
}

export function AssetGenNode(props) {
  const { node, allNodes = [], edges = [], onGenerate, onUpdateNode } = props;
  const [openPanel, setOpenPanel] = React.useState(null);
  const [models, setModels] = React.useState([]);
  const [modelLoading, setModelLoading] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);

  const promptValue = node.prompt || '';
  const styleValue = node.assetStyle || node.style || 'realistic_cinematic';
  const assetTypeValue = node.assetType || 'character_3view';
  const ratioValue = node.ratio || '1:1';
  const resolutionValue = node.resolution || '2K';
  const providerModelId = node.providerModelId || node.modelId || '';
  const modelNameValue = node.workbenchModel || node.model || '';
  const isGenerating = Boolean(node.generating);
  const errorText = compactString(node.error);

  const currentStyle = React.useMemo(() => getAssetStyleByValue(styleValue), [styleValue]);
  const currentAssetType = React.useMemo(() => getAssetTypeByValue(assetTypeValue), [assetTypeValue]);
  const referenceImages = React.useMemo(
    () => collectConnectedImages(node.id, allNodes, edges),
    [allNodes, edges, node.id],
  );
  const finalPrompt = React.useMemo(
    () => buildFinalPrompt({ prompt: promptValue, assetType: currentAssetType, assetStyle: currentStyle }),
    [assetTypeValue, currentAssetType, currentStyle, promptValue],
  );

  React.useEffect(() => {
    let cancelled = false;
    setModelLoading(true);
    ProviderStore.models({ capability: 'image.generate' })
      .then((result) => {
        if (cancelled) return;
        const next = Array.isArray(result?.models) ? result.models.filter((item) => item.enabled !== false) : [];
        setModels(next);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setModelLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!isGenerating) {
      setElapsed(0);
      return undefined;
    }
    const start = Date.now();
    const timer = window.setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 100);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  React.useEffect(() => {
    if (!openPanel) return undefined;
    const close = () => setOpenPanel(null);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [openPanel]);

  const selectedModel = React.useMemo(() => {
    return models.find((item) => item.id === providerModelId)
      || models.find((item) => modelMatchesLabel(item, modelNameValue))
      || selectBackendModel(models, { currentId: providerModelId, currentLabel: modelNameValue });
  }, [modelNameValue, models, providerModelId]);
  const displayModel = selectedModel ? modelLabel(selectedModel) : (modelNameValue || (modelLoading ? '加载模型...' : '暂无可用模型'));
  const canGenerate = Boolean(finalPrompt && selectedModel && !isGenerating);

  const update = React.useCallback((patch) => {
    onUpdateNode?.(node.id, patch);
  }, [node.id, onUpdateNode]);

  const chooseModel = (model) => {
    update({
      workbenchModel: modelLabel(model),
      model: modelLabel(model),
      modelId: model?.id,
      providerModelId: model?.id,
      modelName: model?.modelName,
      provider: model?.providerId,
      error: null,
    });
    setOpenPanel(null);
  };

  const handleGenerate = (event) => {
    event?.stopPropagation?.();
    if (!finalPrompt) {
      update({ error: '请输入资产描述或选择资产类型' });
      return;
    }
    if (!selectedModel) {
      update({ error: '请选择图像模型' });
      return;
    }
    const selectedLabel = modelLabel(selectedModel);
    update({
      generating: true,
      progress: 8,
      error: null,
      tag: '生成',
      workbenchModel: selectedLabel,
      model: selectedLabel,
      modelId: selectedModel.id,
      providerModelId: selectedModel.id,
      modelName: selectedModel.modelName,
      provider: selectedModel.providerId,
      finalPrompt,
    });
    onGenerate?.({
      tab: 'image',
      type: selectedModel?.capability || capabilityForGeneration('image'),
      capability: selectedModel?.capability || capabilityForGeneration('image'),
      nodeId: node.id,
      replaceTarget: false,
      placement: 'after-node',
      prompt: finalPrompt,
      model: selectedLabel,
      modelId: selectedModel.id,
      providerModelId: selectedModel.id,
      modelName: selectedModel.modelName,
      provider: selectedModel.providerId,
      ratio: ratioValue,
      aspectRatio: ratioValue,
      resolution: resolutionValue,
      count: 1,
      style: styleValue,
      styleName: currentStyle.label,
      stylePrompt: currentStyle.promptSuffix,
      referenceImages,
      outputTitlePrefix: '资产预览',
      _assetGenNodeId: node.id,
      _assetUserPrompt: promptValue,
      assetUserPrompt: promptValue,
      _assetType: assetTypeValue,
      _assetStyle: styleValue,
    });
  };

  return (
    <NodeShell {...props} isEmpty={false} toolbar={null}>
      <div className="asset-gen-panel" onPointerDown={(event) => event.stopPropagation()}>
        {isGenerating && (
          <div className="asset-gen-status running">
            <span className="mini-spin"/>
            <span>{elapsed.toFixed(1)}s</span>
            <em>{node.progress || 1}%</em>
          </div>
        )}
        {errorText && !isGenerating && (
          <div className="asset-gen-status error">{errorText}</div>
        )}

        <div className="asset-gen-row">
          <label>
            <span>风格</span>
            <select
              value={styleValue}
              onChange={(event) => update({ assetStyle: event.target.value, style: event.target.value, error: null })}
            >
              {ASSET_STYLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>资产类型</span>
            <select
              value={assetTypeValue}
              onChange={(event) => update({ assetType: event.target.value, error: null })}
            >
              {ASSET_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>

        <textarea
          className="asset-gen-prompt"
          value={promptValue}
          onChange={(event) => update({ prompt: event.target.value, error: null })}
          onKeyDown={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
          placeholder="描述要生成的资产内容..."
        />

        <div className="asset-gen-ref-strip">
          <span className="asset-gen-ref-label">参考图</span>
          {referenceImages.length ? (
            <div className="asset-gen-refs">
              {referenceImages.slice(0, 6).map((src, index) => (
                <span className="asset-gen-ref" key={`${src}-${index}`} title={`参考图${index + 1}`}>
                  <img src={displayUrl(src)} alt="" draggable="false"/>
                  <em>图{index + 1}</em>
                </span>
              ))}
            </div>
          ) : (
            <span className="asset-gen-no-ref">连接图片节点作为参考</span>
          )}
        </div>

        <div className="asset-gen-bottom">
          <div className="asset-gen-model">
            <button
              type="button"
              className="asset-gen-model-btn"
              onClick={(event) => {
                event.stopPropagation();
                setOpenPanel(openPanel === 'model' ? null : 'model');
              }}
              title={displayModel}
            >
              <span className={`model-dot ${selectedModel ? 'ready' : ''}`}/>
              <span>{displayModel}</span>
              <IChevD size={10}/>
            </button>
            {openPanel === 'model' && (
              <div className="asset-gen-model-menu" onPointerDown={(event) => event.stopPropagation()}>
                {models.length ? models.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`asset-gen-model-option ${selectedModel?.id === item.id ? 'active' : ''}`}
                    onClick={() => chooseModel(item)}
                  >
                    <span>{modelLabel(item)}</span>
                    {selectedModel?.id === item.id ? <ICheck size={12}/> : <em>{item.providerId}</em>}
                  </button>
                )) : (
                  <button type="button" className="asset-gen-model-option" disabled>暂无可用模型</button>
                )}
              </div>
            )}
          </div>

          <span className="asset-gen-size">
            <select value={ratioValue} onChange={(event) => update({ ratio: event.target.value })}>
              {ASSET_RATIOS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <em>·</em>
            <select value={resolutionValue} onChange={(event) => update({ resolution: event.target.value })}>
              {ASSET_RESOLUTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </span>

          <button
            type="button"
            className="asset-gen-submit"
            disabled={!canGenerate}
            onClick={handleGenerate}
            title="生成资产"
          >
            {isGenerating ? <span className="mini-spin"/> : <ISparkle size={11}/>}
            <span>生成</span>
          </button>
        </div>

        <div className="asset-gen-prompt-preview" title={finalPrompt}>
          <IImage size={11}/>
          <span>{currentAssetType.label} · {currentStyle.label}</span>
        </div>
      </div>
    </NodeShell>
  );
}
