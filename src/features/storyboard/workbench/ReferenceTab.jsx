import React from 'react';
import { ProviderStore } from '../../../shared/platform/providerStore.js';
import { storyboardPackageActions } from '../../../shared/store/storyboardPackageStore.js';
import { getNodeAssetPayload } from '../../../shared/utils/asset.js';
import { uploadFileAsAsset } from '../../../shared/utils/uploadHelpers.js';
import { modelLabel, selectBackendModel } from '../../../shared/platform/modelSelection.js';
import {
  REFERENCE_INTENTS,
  refreshReferenceDiagnostics,
  removeSourceAsset,
  updateSourceAsset,
  upsertSourceAsset,
} from '../reference/referencePackage.js';
import {
  runStoryboardReferenceAnalysis,
  runStoryboardTextAssetsAnalyze,
} from '../storyboardOrchestrator.js';
import { asArray, displayFirst, displayKey, displayValue } from './displayValue.js';

const CHAT_CAPABILITY = 'text.generate';

const INTENT_OPTIONS = [
  { value: '', label: '选择参考意图' },
  { value: REFERENCE_INTENTS.sameCharacter, label: '同一角色多参考' },
  { value: REFERENCE_INTENTS.multipleCharacters, label: '多个角色' },
  { value: REFERENCE_INTENTS.structure, label: '复刻结构 / 节奏' },
  { value: REFERENCE_INTENTS.style, label: '提取风格' },
  { value: REFERENCE_INTENTS.mixed, label: '混合参考' },
];

const assetLabel = (asset, index) => (
  displayFirst([
    asset?.title,
    asset?.name,
    asset?.assetId,
    asset?.id,
    asset?.url,
  ], `参考素材 ${index + 1}`)
);

const assetMeta = (asset) => (
  displayFirst([
    asset?.referenceIntent,
    asset?.kind,
    asset?.type,
    asset?.assetId,
    asset?.id,
  ], 'reference')
);

const domKey = (value, fallback) => (
  displayValue(value, fallback)
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || fallback
);

const sourceKind = (kind) => {
  const value = String(kind || '').toLowerCase();
  if (value.includes('video')) return 'video';
  if (value.includes('image')) return 'image';
  if (value.includes('text') || value.includes('script')) return 'text';
  return 'unknown';
};

const assetUrl = (asset) => displayFirst([
  asset?.url,
  asset?.src,
  asset?.assetUrl,
  asset?.previewUrl,
  asset?.path,
], '');

const sourceFromCanvasNode = (node) => {
  const payload = getNodeAssetPayload(node);
  const url = payload?.src || payload?.url || '';
  if (!payload || !url) return null;
  const kind = sourceKind(payload.kind || payload.mediaKind || node?.type);
  if (kind !== 'image' && kind !== 'video' && kind !== 'text') return null;
  return {
    origin: 'canvas_node',
    nodeId: node.id,
    kind,
    title: payload.title || node.title || node.id,
    url,
  };
};

const sourceFromLibraryAsset = (asset) => {
  const url = assetUrl(asset);
  if (!url) return null;
  const kind = sourceKind(asset?.kind || asset?.type || asset?.mediaKind);
  if (kind !== 'image' && kind !== 'video' && kind !== 'text') return null;
  return {
    origin: 'project_asset',
    assetId: asset.id || asset.assetId,
    kind,
    title: asset.title || asset.name || asset.filename || asset.id,
    url,
  };
};

const scriptTextFromNode = (node) => {
  const direct = displayFirst([
    node?.scriptText,
    node?.body,
    node?.generatedText,
    node?.prompt,
  ], '');
  if (direct) return direct;
  if (Array.isArray(node?.shots) && node.shots.length) {
    return node.shots.map((shot, index) => (
      `${shot.n || index + 1}. ${displayFirst([shot.shot, shot.desc, shot.prompt], '')}`
    )).join('\n');
  }
  return '';
};

async function resolveWorkbenchModel(node) {
  const result = await ProviderStore.models({ capability: CHAT_CAPABILITY });
  const candidates = (result?.models || []).filter((model) => model.enabled !== false);
  return selectBackendModel(candidates, {
    currentId: node?.workbenchModelId || null,
    currentLabel: node?.workbenchModelLabel || null,
  });
}

export function ReferenceTab({
  nodeId,
  projectId,
  node,
  storyboardPackage,
  canvasNodes = [],
  libraryAssets = [],
  onTask,
}) {
  const sourceAssets = asArray(storyboardPackage?.sourceAssets);
  const fileInputRef = React.useRef(null);
  const [busy, setBusy] = React.useState('');

  const canvasCandidates = React.useMemo(() => (
    asArray(canvasNodes)
      .filter((item) => item?.id && item.id !== nodeId)
      .map((item) => ({ node: item, source: sourceFromCanvasNode(item) }))
      .filter((item) => item.source)
      .slice(0, 12)
  ), [canvasNodes, nodeId]);

  const libraryCandidates = React.useMemo(() => (
    asArray(libraryAssets)
      .map((item) => ({ asset: item, source: sourceFromLibraryAsset(item) }))
      .filter((item) => item.source)
      .slice(0, 12)
  ), [libraryAssets]);

  const updatePackage = React.useCallback((updater) => {
    if (!nodeId) return;
    storyboardPackageActions.updateNodePackage(nodeId, { projectId, updater });
  }, [nodeId, projectId]);

  const addSource = React.useCallback((source) => {
    if (!source) return;
    updatePackage((pkg) => refreshReferenceDiagnostics(upsertSourceAsset(pkg, source)));
  }, [updatePackage]);

  const patchSource = React.useCallback((sourceAssetId, patch) => {
    updatePackage((pkg) => refreshReferenceDiagnostics(updateSourceAsset(pkg, sourceAssetId, patch)));
  }, [updatePackage]);

  const deleteSource = React.useCallback((sourceAssetId) => {
    updatePackage((pkg) => refreshReferenceDiagnostics(removeSourceAsset(pkg, sourceAssetId)));
  }, [updatePackage]);

  const handleUpload = React.useCallback(async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setBusy('upload');
    try {
      for (const file of files) {
        const kind = file.type?.startsWith('video/') ? 'video' : file.type?.startsWith('image/') ? 'image' : undefined;
        const record = await uploadFileAsAsset(file, projectId, kind, { source: 'storyboard-reference-upload' });
        if (record) {
          addSource({
            origin: 'local_upload',
            assetId: record.id || record.assetId,
            kind: sourceKind(record.kind || kind),
            title: record.title || file.name,
            url: record.url || record.src || record.assetUrl,
          });
        }
      }
    } catch (error) {
      onTask?.({ id: 'reference-upload', error: String(error?.message || error) });
    } finally {
      setBusy('');
    }
  }, [addSource, onTask, projectId]);

  const handleTextAssetsAnalyze = React.useCallback(async () => {
    const scriptText = scriptTextFromNode(node);
    if (!scriptText.trim()) {
      onTask?.({ id: 'storyboard-text-assets-analyze', error: '请先在剧本页写入剧本内容' });
      return;
    }
    setBusy('text');
    try {
      const model = await resolveWorkbenchModel(node);
      if (!model) {
        onTask?.({ id: 'storyboard-text-assets-analyze', error: '请先在「模型配置」启用一个 Chat 模型' });
        return;
      }
      onTask?.({ id: 'storyboard-text-assets-analyze', stage: '准备提取文本资产…', progress: 0 });
      const result = await runStoryboardTextAssetsAnalyze({
        scriptText,
        projectId,
        nodeId,
        model,
        onProgress: (payload) => onTask?.({ id: 'storyboard-text-assets-analyze', ...payload }),
      });
      if (!result.ok) onTask?.({ id: 'storyboard-text-assets-analyze', error: result.error || '文本资产提取失败' });
    } catch (error) {
      onTask?.({ id: 'storyboard-text-assets-analyze', error: String(error?.message || error) });
    } finally {
      setBusy('');
    }
  }, [node, nodeId, onTask, projectId]);

  const handleReferenceAnalyze = React.useCallback(async () => {
    if (!sourceAssets.length) {
      onTask?.({ id: 'storyboard-reference-analyze', error: '请先添加图片或视频参考素材' });
      return;
    }
    setBusy('reference');
    try {
      const model = await resolveWorkbenchModel(node);
      if (!model) {
        onTask?.({ id: 'storyboard-reference-analyze', error: '请先在「模型配置」启用一个 Chat 模型' });
        return;
      }
      const scriptText = scriptTextFromNode(node);
      onTask?.({ id: 'storyboard-reference-analyze', stage: `使用 ${modelLabel(model)} 分析参考…`, progress: 0 });
      const result = await runStoryboardReferenceAnalysis({
        scriptTitle: node?.title || storyboardPackage?.brief?.title || '',
        scriptExcerpt: scriptText.slice(0, 5000),
        sourceAssets,
        referenceAssets: sourceAssets,
        textCandidates: storyboardPackage?.analysisDraft?.textExtraction || {},
        projectId,
        nodeId,
        model,
        onProgress: (payload) => onTask?.({ id: 'storyboard-reference-analyze', ...payload }),
      });
      if (!result.ok) onTask?.({ id: 'storyboard-reference-analyze', error: result.error || '参考分析失败' });
    } catch (error) {
      onTask?.({ id: 'storyboard-reference-analyze', error: String(error?.message || error) });
    } finally {
      setBusy('');
    }
  }, [node, nodeId, onTask, projectId, sourceAssets, storyboardPackage]);

  return (
    <section className="sb-package-panel">
      <div className="sb-package-head">
        <div>
          <h2>素材与参考</h2>
          <p>{displayValue(storyboardPackage?.sourceMode, 'script')}</p>
        </div>
        <span className="sb-status-pill">参考素材 {sourceAssets.length}</span>
      </div>

      <div className="sb-package-actions">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy === 'upload'}>
          本地上传
        </button>
        <button type="button" onClick={handleTextAssetsAnalyze} disabled={busy === 'text'}>
          提取剧本文本资产
        </button>
        <button type="button" onClick={handleReferenceAnalyze} disabled={!sourceAssets.length || busy === 'reference'}>
          AI 分析参考素材
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={handleUpload}
        />
      </div>

      {(canvasCandidates.length > 0 || libraryCandidates.length > 0) && (
        <div className="sb-reference-source-grid">
          <div className="sb-reference-source-column">
            <div className="sb-assets-col-head">画布素材</div>
            {canvasCandidates.length ? canvasCandidates.map(({ node: sourceNode, source }) => (
              <button
                key={sourceNode.id}
                type="button"
                className="sb-reference-source-pick"
                data-testid={`add-canvas-source-${sourceNode.id}`}
                onClick={() => addSource(source)}
              >
                <strong>{source.title}</strong>
                <span>{source.kind} · {sourceNode.type}</span>
              </button>
            )) : (
              <div className="sb-empty-block">画布中暂无可用图片或视频。</div>
            )}
          </div>

          <div className="sb-reference-source-column">
            <div className="sb-assets-col-head">资产库素材</div>
            {libraryCandidates.length ? libraryCandidates.map(({ asset, source }, index) => (
              <button
                key={displayKey([asset?.id, asset?.assetId, source.url], `lib-source-${index}`)}
                type="button"
                className="sb-reference-source-pick"
                onClick={() => addSource(source)}
              >
                <strong>{source.title}</strong>
                <span>{source.kind} · {asset?.assetScope || asset?.libraryScope || 'library'}</span>
              </button>
            )) : (
              <div className="sb-empty-block">资产库中暂无可用图片或视频。</div>
            )}
          </div>
        </div>
      )}

      {sourceAssets.length === 0 ? (
        <div className="sb-empty-block">还没有导入参考素材。</div>
      ) : (
        <div className="sb-package-list">
          {sourceAssets.map((asset, index) => (
            <div
              className="sb-package-row sb-reference-row"
              key={displayKey([asset?.id, asset?.assetId, asset?.url], `reference-${index}`)}
            >
              <div className="sb-reference-main">
                <strong>{assetLabel(asset, index)}</strong>
                <span>{assetMeta(asset)}</span>
              </div>
              <select
                data-testid={`source-intent-${domKey(asset?.id, `reference-${index}`)}`}
                value={displayValue(asset?.referenceIntent, '')}
                onChange={(event) => patchSource(asset.id, { referenceIntent: event.target.value })}
              >
                {INTENT_OPTIONS.map((option) => (
                  <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                ))}
              </select>
              <input
                data-testid={`source-role-hint-${domKey(asset?.id, `reference-${index}`)}`}
                type="text"
                value={displayValue(asset?.roleHint, '')}
                placeholder="用途提示，例如：提取服装、光影、镜头节奏"
                onInput={(event) => patchSource(asset.id, { roleHint: event.currentTarget.value })}
                onChange={(event) => patchSource(asset.id, { roleHint: event.currentTarget.value })}
              />
              <button
                type="button"
                className="danger"
                data-testid={`remove-source-${domKey(asset?.id, `reference-${index}`)}`}
                onClick={() => deleteSource(asset.id)}
              >
                移除
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
