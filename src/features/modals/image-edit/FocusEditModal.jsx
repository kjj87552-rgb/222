import React from 'react';
import { ISearch, ISparkle } from '../../../shared/ui/icons/index.jsx';
import { JobStore } from '../../../shared/platform/jobStore.js';
import { makeAssetUrl } from '../../../shared/platform/backendClient.js';
import { ProviderStore } from '../../../shared/platform/providerStore.js';
import { modelLabel, selectBackendModel } from '../../../shared/platform/modelSelection.js';
import { useNodeById, useProject } from '../../../shared/store/canvasStore.js';
import { XModal } from '../shared/XModal.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp01(value, fallback = 0.5) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(1, num > 1 ? num / 100 : num));
}

function normalizeTag(tag, index) {
  const bbox = tag?.bbox || {};
  const point = tag?.point || {};
  const x = clamp01(point.x ?? tag?.x ?? (Number(bbox.x) + Number(bbox.w) / 2), 0.5);
  const y = clamp01(point.y ?? tag?.y ?? (Number(bbox.y) + Number(bbox.h) / 2), 0.5);
  const token = tag?.promptToken || tag?.tag || `@标签${index + 1}`;
  return {
    ...tag,
    id: tag?.id || `tag_${index}`,
    label: tag?.label || token.replace(/^@/, '') || `标签 ${index + 1}`,
    kind: tag?.kind || 'region',
    tag: tag?.tag || token,
    promptToken: token,
    point: { x, y },
    bbox: {
      x: clamp01(bbox.x, Math.max(0, x - 0.08)),
      y: clamp01(bbox.y, Math.max(0, y - 0.08)),
      w: clamp01(bbox.w, 0.16),
      h: clamp01(bbox.h, 0.16),
    },
    confidence: Number.isFinite(Number(tag?.confidence)) ? Number(tag.confidence) : null,
  };
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePromptText(value) {
  return String(value || '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([，,。；;、！？!?])/g, '$1')
    .replace(/([（(])\s+/g, '$1')
    .replace(/调整\s+@/g, '调整@')
    .replace(/^[，,、；;\s]+|[，,、；;\s]+$/g, '')
    .trim();
}

function addPromptToken(text, token) {
  const value = String(text || '').trim();
  if (!token || value.includes(token)) return value;
  if (!value) return `调整${token}，保持画面整体一致`;
  if (/^调整.+，保持画面整体一致$/.test(value)) {
    return normalizePromptText(value.replace(/，保持画面整体一致$/, ` ${token}，保持画面整体一致`));
  }
  return normalizePromptText(`${value} ${token}`);
}

function removePromptToken(text, token) {
  if (!token) return normalizePromptText(text);
  const pattern = new RegExp(escapeRegExp(token), 'g');
  const next = normalizePromptText(String(text || '').replace(pattern, ''));
  if (/^调整[，,]\s*保持画面整体一致$/.test(next)) return '';
  return next;
}

function removePromptTokens(text, tokens) {
  const next = (tokens || []).reduce((current, token) => removePromptToken(current, token), text);
  return normalizePromptText(next);
}

function ensurePromptTokens(text, selectedTags) {
  return (selectedTags || []).reduce((current, tag) => addPromptToken(current, tag.promptToken || tag.tag), text);
}

export function FocusEditModal({ src, assetId, nodeId, analysis: initialAnalysis, onClose, onApply }) {
  const project = useProject();
  const liveNode = useNodeById(nodeId);
  const [pickedIds, setPickedIds] = React.useState([]);
  const [text, setText] = React.useState('');
  const [localAnalysis, setLocalAnalysis] = React.useState(null);
  const [localStatus, setLocalStatus] = React.useState('');
  const [localProgress, setLocalProgress] = React.useState(0);
  const [localError, setLocalError] = React.useState('');
  const [applying, setApplying] = React.useState(false);
  const [analysisModels, setAnalysisModels] = React.useState([]);
  const [imageModels, setImageModels] = React.useState([]);
  const [analysisModelId, setAnalysisModelId] = React.useState('');
  const [imageModelId, setImageModelId] = React.useState('');
  const [previewTagId, setPreviewTagId] = React.useState(null);

  const analysis = liveNode?.focusAnalysis || localAnalysis || initialAnalysis || null;
  const tags = React.useMemo(() => (
    Array.isArray(analysis?.tags) ? analysis.tags.map(normalizeTag) : []
  ), [analysis]);
  const status = liveNode?.focusAnalysisStatus || localStatus || (tags.length ? 'completed' : 'idle');
  const progress = liveNode?.focusAnalysisProgress || localProgress || 0;
  const error = liveNode?.focusAnalysisError || localError;
  const sourceUrl = src || liveNode?.src || liveNode?.poster || DEMO_IMG(22, 1200, 800);
  const sourceAssetId = assetId || liveNode?.assetId || analysis?.sourceAssetId;
  const picked = tags.filter((tag) => pickedIds.includes(tag.id));
  const analyzing = status === 'queued' || status === 'running';
  const selectedAnalysisModel = React.useMemo(() => (
    analysisModels.find((model) => model.id === analysisModelId)
    || selectBackendModel(analysisModels, {
      currentId: analysis?.providerModelId,
      currentLabel: analysis?.providerModelName,
    })
  ), [analysis?.providerModelId, analysis?.providerModelName, analysisModelId, analysisModels]);
  const selectedImageModel = React.useMemo(() => selectBackendModel(imageModels, {
    currentId: imageModelId || liveNode?.providerModelId,
    currentLabel: liveNode?.model || liveNode?.workbenchModel,
  }), [imageModelId, imageModels, liveNode?.model, liveNode?.providerModelId, liveNode?.workbenchModel]);
  const canAnalyze = Boolean(nodeId && sourceUrl && selectedAnalysisModel && !analyzing);
  const canGenerate = Boolean(nodeId && picked.length && text.trim() && selectedImageModel && !applying);
  const displaySourceUrl = React.useMemo(() => makeAssetUrl({ src: sourceUrl }), [sourceUrl]);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      ProviderStore.models({ capability: 'image.analyze' }),
      ProviderStore.models({ capability: 'image.generate' }),
    ])
      .then(([analysisResult, imageResult]) => {
        if (cancelled) return;
        setAnalysisModels((analysisResult?.models || []).filter((model) => model.enabled !== false));
        setImageModels((imageResult?.models || []).filter((model) => model.enabled !== false));
      })
      .catch(() => {
        if (!cancelled) {
          setAnalysisModels([]);
          setImageModels([]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!analysisModels.length) {
      setAnalysisModelId('');
      return;
    }
    setAnalysisModelId((current) => {
      if (analysisModels.some((model) => model.id === current)) return current;
      return selectBackendModel(analysisModels, {
        currentId: analysis?.providerModelId,
        currentLabel: analysis?.providerModelName,
      })?.id || analysisModels[0]?.id || '';
    });
  }, [analysis?.providerModelId, analysis?.providerModelName, analysisModels]);

  React.useEffect(() => {
    if (!imageModels.length) {
      setImageModelId('');
      return;
    }
    setImageModelId((current) => {
      if (imageModels.some((model) => model.id === current)) return current;
      return selectBackendModel(imageModels, {
        currentId: liveNode?.providerModelId,
        currentLabel: liveNode?.model || liveNode?.workbenchModel,
      })?.id || imageModels[0]?.id || '';
    });
  }, [imageModels, liveNode?.model, liveNode?.providerModelId, liveNode?.workbenchModel]);

  React.useEffect(() => {
    setPickedIds((ids) => ids.filter((id) => tags.some((tag) => tag.id === id)));
    setPreviewTagId((id) => (tags.some((tag) => tag.id === id) ? id : null));
  }, [tags]);

  const togglePick = (tag) => {
    const selected = pickedIds.includes(tag.id);
    const nextIds = selected ? pickedIds.filter((id) => id !== tag.id) : [...pickedIds, tag.id];
    setPickedIds(nextIds);
    setText((current) => (
      selected
        ? removePromptToken(current, tag.promptToken || tag.tag)
        : addPromptToken(current, tag.promptToken || tag.tag)
    ));
  };

  const clearPickedTags = () => {
    const tokens = picked.map((tag) => tag.promptToken || tag.tag).filter(Boolean);
    setPickedIds([]);
    setText((current) => removePromptTokens(current, tokens));
  };

  const pollJob = React.useCallback(async (jobId) => {
    for (let i = 0; i < 90; i += 1) {
      await delay(800);
      const job = await JobStore.get(jobId);
      if (!job) continue;
      setLocalStatus(job.status);
      setLocalProgress(Number(job.progress) || 0);
      if (job.status === 'completed') {
        const output = job.output || {};
        setLocalAnalysis({
          version: 1,
          sourceAssetId: output.sourceAssetId || sourceAssetId,
          sourceUrl: output.sourceUrl || sourceUrl,
          provider: output.provider,
          providerModelId: output.providerModelId,
          providerModelName: output.providerModelName,
          tags: output.tags || output.regions || [],
          updatedAt: new Date().toISOString(),
        });
        setLocalStatus('completed');
        setLocalProgress(100);
        return;
      }
      if (job.status === 'failed' || job.status === 'canceled') {
        setLocalError(job.error || '标签分析失败');
        setLocalStatus(job.status);
        return;
      }
    }
    setLocalError('标签分析超时，请重试');
    setLocalStatus('failed');
  }, [sourceAssetId, sourceUrl]);

  const analyzeTags = async () => {
    if (!canAnalyze) return;
    setPickedIds([]);
    setLocalError('');
    setLocalStatus('queued');
    setLocalProgress(1);
    try {
      const job = await JobStore.create(nodeId, {
        type: 'image.analyze',
        projectId: project?.id,
        imageUrl: displaySourceUrl || sourceUrl,
        referenceImages: [displaySourceUrl || sourceUrl].filter(Boolean),
        assetId: sourceAssetId,
        nodeTitle: liveNode?.title,
        model: selectedAnalysisModel ? modelLabel(selectedAnalysisModel) : undefined,
        modelId: selectedAnalysisModel?.id,
        providerModelId: selectedAnalysisModel?.id,
        modelName: selectedAnalysisModel?.modelName,
        provider: selectedAnalysisModel?.providerId,
      });
      if (!job?.id) throw new Error('无法创建标签分析任务');
      pollJob(job.id).catch((err) => {
        setLocalError(err instanceof Error ? err.message : String(err));
        setLocalStatus('failed');
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
      setLocalStatus('failed');
      setLocalProgress(0);
    }
  };

  const generateWithTags = async () => {
    if (!canGenerate) return;
    setApplying(true);
    try {
      const commandText = ensurePromptTokens(text.trim(), picked);
      const tagContext = picked.map((tag) => {
        const bbox = tag.bbox || {};
        return `${tag.promptToken || tag.tag}: ${tag.label} bbox=${[
          bbox.x ?? 0,
          bbox.y ?? 0,
          bbox.w ?? 0,
          bbox.h ?? 0,
        ].map((value) => Number(value).toFixed(3)).join(',')}`;
      }).join('\n');
      const prompt = [
        commandText,
        tagContext ? `已选图像标签：\n${tagContext}` : '',
        '基于参考图进行局部编辑，优先修改已选标签对应区域，保持其他区域、人物身份、构图和光影一致。',
      ].filter(Boolean).join('\n\n');
      const payload = {
        type: 'image.generate',
        tab: 'image',
        projectId: project?.id,
        prompt,
        effectivePrompt: prompt,
        mode: 'image-edit',
        resolution: '2K',
        imageUrl: displaySourceUrl || sourceUrl,
        referenceImages: [displaySourceUrl || sourceUrl].filter(Boolean),
        assetId: sourceAssetId,
        focusTags: picked,
        focusTagContext: tagContext,
        selectedTagTokens: picked.map((tag) => tag.promptToken || tag.tag).filter(Boolean),
        analysis,
        model: selectedImageModel ? modelLabel(selectedImageModel) : undefined,
        modelId: selectedImageModel?.id,
        providerModelId: selectedImageModel?.id,
        modelName: selectedImageModel?.modelName,
        provider: selectedImageModel?.providerId,
      };
      if (commandText !== text.trim()) setText(commandText);
      if (onApply) {
        await onApply({ picked, text: commandText, payload });
        onClose?.();
        return;
      }
      const job = await JobStore.create(nodeId, payload);
      if (!job?.id) throw new Error('无法创建焦点生成任务');
      onClose?.();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    } finally {
      setApplying(false);
    }
  };

  return (
    <XModal
      title="焦点编辑 / Focus"
      icon={<ISearch size={16}/>}
      onClose={onClose}
      className="fe-modal"
      footer={<>
        <span className="x-credit">
          <ISparkle size={11}/>
          {analyzing ? `分析中 ${Math.max(1, Math.min(99, progress))}%` : tags.length ? `${tags.length} 个标签` : '等待分析'}
        </span>
        <span style={{ flex: 1 }}/>
        <button className="x-btn ghost" onClick={analyzeTags} disabled={!canAnalyze}>
          {analyzing ? '分析中' : tags.length ? '重新分析' : '分析标签'}
        </button>
        <button className="x-btn ghost" onClick={clearPickedTags} disabled={!picked.length}>清空标签</button>
        <button className="x-btn primary" onClick={generateWithTags} disabled={!canGenerate}>
          <ISparkle size={12}/>{applying ? '创建中' : '使用标签生成'}
        </button>
      </>}
    >
      <div className="fe-main">
        <div className="fe-stage">
          <div className="fe-image-layer">
            <img src={displaySourceUrl || sourceUrl} alt=""/>
            {tags.map((tag) => {
              const selected = pickedIds.includes(tag.id);
              const previewing = previewTagId === tag.id;
              const clearPreview = () => setPreviewTagId((id) => (id === tag.id ? null : id));
              return (
                <div
                  key={tag.id}
                  className={`fe-region ${selected ? 'picked' : ''} ${previewing ? 'previewing' : ''}`}
                  style={{
                    left: `${tag.bbox.x * 100}%`,
                    top: `${tag.bbox.y * 100}%`,
                    width: `${tag.bbox.w * 100}%`,
                    height: `${tag.bbox.h * 100}%`,
                  }}
                >
                  <span className="fe-region-frame" aria-hidden="true" />
                  <button
                    type="button"
                    className="fe-region-label"
                    onClick={() => togglePick(tag)}
                    onMouseEnter={() => setPreviewTagId(tag.id)}
                    onMouseLeave={clearPreview}
                    onFocus={() => setPreviewTagId(tag.id)}
                    onBlur={clearPreview}
                    aria-pressed={selected}
                    aria-label={`选择 ${tag.promptToken} · ${tag.label}`}
                    title={`${tag.promptToken} · ${tag.label}`}
                  >
                    <span className="fe-region-token">{tag.promptToken}</span>
                    <span className="fe-region-name">{tag.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="fe-command-panel">
          <div className="fe-command-head">
            <h3>指令描述</h3>
            <span>{picked.length ? `已选择 ${picked.length} 个标签` : '先在右侧选择标签'}</span>
          </div>
          <label className="fe-prompt-row">
            <span className="at">@</span>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="描述要对选中标签进行的操作..."
            />
          </label>
          {error && <div className="fe-status error">{error}</div>}
        </div>
      </div>
      <div className="fe-side">
        <div>
          <h3>模型</h3>
          <div className="fe-model-grid">
            <label className="fe-model-field">
              <span>分析模型</span>
              <select
                value={analysisModelId}
                onChange={(event) => setAnalysisModelId(event.target.value)}
                disabled={analyzing || analysisModels.length === 0}
              >
                {analysisModels.length === 0 ? (
                  <option value="">暂无 image.analyze 模型</option>
                ) : analysisModels.map((model) => (
                  <option key={model.id} value={model.id}>{modelLabel(model)}</option>
                ))}
              </select>
            </label>
            <label className="fe-model-field">
              <span>生成模型</span>
              <select
                value={imageModelId}
                onChange={(event) => setImageModelId(event.target.value)}
                disabled={applying || imageModels.length === 0}
              >
                {imageModels.length === 0 ? (
                  <option value="">暂无 image.generate 模型</option>
                ) : imageModels.map((model) => (
                  <option key={model.id} value={model.id}>{modelLabel(model)}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div>
          <h3>图像标签</h3>
          <div className="fe-tag-list">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`fe-tag ${pickedIds.includes(tag.id) ? 'active' : ''}`}
                onClick={() => togglePick(tag)}
                onMouseEnter={() => setPreviewTagId(tag.id)}
                onMouseLeave={() => setPreviewTagId((id) => (id === tag.id ? null : id))}
                onFocus={() => setPreviewTagId(tag.id)}
                onBlur={() => setPreviewTagId((id) => (id === tag.id ? null : id))}
                title={tag.confidence === null ? tag.kind : `${tag.kind} · ${Math.round(tag.confidence * 100)}%`}
              >
                {tag.promptToken} · {tag.label}
              </button>
            ))}
            {!tags.length && (
              <span className="fe-empty">{analyzing ? '正在分析图像内容' : '点击分析标签'}</span>
            )}
          </div>
        </div>
        <div>
          <h3>已选元素标签</h3>
          <div className="fe-tag-list">
            {picked.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="fe-tag active"
                onClick={() => togglePick(tag)}
                onMouseEnter={() => setPreviewTagId(tag.id)}
                onMouseLeave={() => setPreviewTagId((id) => (id === tag.id ? null : id))}
                onFocus={() => setPreviewTagId(tag.id)}
                onBlur={() => setPreviewTagId((id) => (id === tag.id ? null : id))}
              >
                {tag.promptToken} · {tag.label}
                <span className="x">×</span>
              </button>
            ))}
            {picked.length === 0 && <span className="fe-empty">选择一个或多个标签</span>}
          </div>
        </div>
      </div>
    </XModal>
  );
}
