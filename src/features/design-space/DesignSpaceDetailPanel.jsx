import React from 'react';
import { DesignSpaceHistoryGrid } from './DesignSpaceHistoryGrid.jsx';
import { readFileAsDataUrl } from '../../shared/utils/file.js';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { importLocalFileAsAsset } from '../../shared/utils/uploadHelpers.js';

const MAX_REFERENCE_IMAGES = 7;

function promptLabelForCard(card) {
  if (card?.type === 'scene') return '场景提示词';
  if (card?.type === 'prop') return '道具提示词';
  return '人物提示词';
}

function referenceLabelForCard(card) {
  if (card?.type === 'scene') return '场景参考图';
  if (card?.type === 'prop') return '道具参考图';
  return '人物参考图';
}

function compactPromptText(value) {
  return String(value ?? '').trim();
}

function secondaryPromptForCard(card) {
  if (card?.type === 'scene') return card?.atmospherePrompt || '';
  if (card?.type === 'prop') return card?.materialPrompt || '';
  return '';
}

function mergePromptParts(...values) {
  const parts = [];
  const seen = new Set();
  values.forEach((value) => {
    const text = compactPromptText(value);
    const key = text.replace(/\s+/g, '');
    if (!text || seen.has(key)) return;
    seen.add(key);
    parts.push(text);
  });
  return parts.join('\n');
}

function editablePromptForCard(card) {
  const mainPrompt = card?.visualPrompt || card?.details || '';
  return mergePromptParts(mainPrompt, secondaryPromptForCard(card));
}

function promptPatchForCard(card, value) {
  const patch = { visualPrompt: value };
  if (card?.type === 'scene') patch.atmospherePrompt = '';
  if (card?.type === 'prop') patch.materialPrompt = '';
  return patch;
}

function CompositionSafeTextarea({ value, onCommit }) {
  const [draft, setDraft] = React.useState(value || '');
  const composingRef = React.useRef(false);

  React.useEffect(() => {
    if (!composingRef.current) setDraft(value || '');
  }, [value]);

  const commit = React.useCallback((nextValue) => {
    onCommit?.(nextValue);
  }, [onCommit]);

  return (
    <textarea
      value={draft}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={(event) => {
        composingRef.current = false;
        commit(event.currentTarget.value);
      }}
      onChange={(event) => {
        const nextValue = event.target.value;
        setDraft(nextValue);
        if (composingRef.current || event.nativeEvent?.isComposing) return;
        commit(nextValue);
      }}
    />
  );
}

function cardReferenceAssets(card) {
  return (Array.isArray(card?.referenceAssets) ? card.referenceAssets : [])
    .filter((asset) => asset?.src || asset?.url || asset?.assetUrl || asset?.imageUrl || asset?.assetPath || asset?.localPath);
}

function referenceAssetUrl(asset) {
  return makeAssetUrl({
    id: asset?.assetId || asset?.id,
    src: asset?.src || asset?.url || asset?.assetUrl || asset?.imageUrl || asset?.assetPath || asset?.localPath,
    url: asset?.url,
    assetUrl: asset?.assetUrl || asset?.imageUrl,
    assetPath: asset?.assetPath,
    localPath: asset?.localPath,
    path: asset?.path,
    preferLocalAsset: true,
  });
}

export function DesignSpaceDetailPanel({
  projectId = 'local-default',
  card,
  selectedImageModelId = '',
  imageParams = null,
  promptPrefix = '',
  onPatchCard,
  onGenerateCard,
  onPromptPrefixChange,
}) {
  const fileInputRef = React.useRef(null);
  const [referenceUploading, setReferenceUploading] = React.useState(false);
  const [historyUploading, setHistoryUploading] = React.useState(false);
  const [prefixOpen, setPrefixOpen] = React.useState(false);
  const [prefixDraft, setPrefixDraft] = React.useState(promptPrefix);

  React.useEffect(() => {
    if (prefixOpen) setPrefixDraft(promptPrefix || '');
  }, [prefixOpen, promptPrefix]);

  React.useEffect(() => {
    if (!prefixOpen) return undefined;
    const closeFromEscape = (event) => {
      if (event.key === 'Escape') setPrefixOpen(false);
    };
    document.addEventListener('keydown', closeFromEscape);
    return () => document.removeEventListener('keydown', closeFromEscape);
  }, [prefixOpen]);

  if (!card) {
    return (
      <aside className="design-space-panel design-detail-panel">
        <div className="design-space-panel-head">
          <h2>卡片编辑</h2>
        </div>
        <div className="design-space-empty">请选择一张卡片</div>
      </aside>
    );
  }

  const modelId = selectedImageModelId;
  const promptText = editablePromptForCard(card);
  const referenceLabel = referenceLabelForCard(card);
  const referenceAssets = cardReferenceAssets(card);
  const historyVersions = Array.isArray(card.history) ? card.history : [];
  const referenceSlotsLeft = Math.max(0, MAX_REFERENCE_IMAGES - referenceAssets.length);
  const canUploadReference = referenceSlotsLeft > 0;
  const hasPromptPrefix = String(promptPrefix || '').trim().length > 0;

  const savePromptPrefix = () => {
    onPromptPrefixChange?.(String(prefixDraft || '').trim());
    setPrefixOpen(false);
  };

  const uploadReferenceImage = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, referenceSlotsLeft);
    event.target.value = '';
    if (!files.length) return;
    setReferenceUploading(true);
    try {
      const uploadedAssets = await Promise.all(files.map(async (file) => {
        const persisted = await importLocalFileAsAsset(file, projectId, 'image', {
          source: 'design-space-reference-upload',
          inLibrary: false,
          libraryAsset: false,
          scope: 'project',
          projectId,
          project_id: projectId,
        });
        let dataUrl = '';
        if (!persisted) {
          dataUrl = await readFileAsDataUrl(file);
        }
        const src = persisted?.src || persisted?.url || dataUrl;
        return {
          ...(persisted || {}),
          id: persisted?.id || `design_ref_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          kind: persisted?.kind || 'image',
          type: 'image',
          src,
          url: persisted?.url || src,
          assetUrl: persisted?.assetUrl,
          assetId: persisted?.id,
          assetPath: persisted?.path,
          title: persisted?.title || file.name || referenceLabel,
          filename: persisted?.filename || file.name || referenceLabel,
          mime: persisted?.mime || file.type || 'image/*',
          source: persisted?.source || 'design-space-reference-upload',
        };
      }));
      onPatchCard?.({
        referenceAssets: [...referenceAssets, ...uploadedAssets].slice(0, MAX_REFERENCE_IMAGES),
      });
    } finally {
      setReferenceUploading(false);
    }
  };

  const removeReferenceImage = (assetId) => {
    onPatchCard?.({
      referenceAssets: referenceAssets.filter((asset) => asset.id !== assetId),
    });
  };

  const setCurrentPreviewVersion = (targetVersion) => {
    if (!targetVersion?.id) return;
    onPatchCard?.({ currentVersionId: targetVersion.id });
  };

  const uploadHistoryImages = async (files) => {
    const imageFiles = Array.from(files || []).filter(Boolean);
    if (!imageFiles.length) return;
    setHistoryUploading(true);
    try {
      const uploadedVersions = await Promise.all(imageFiles.map(async (file) => {
        const persisted = await importLocalFileAsAsset(file, projectId, 'image', {
          source: 'design-space-history-upload',
          inLibrary: false,
          libraryAsset: false,
          scope: 'project',
          projectId,
          project_id: projectId,
        });
        let dataUrl = '';
        if (!persisted) {
          dataUrl = await readFileAsDataUrl(file);
        }
        const src = persisted?.src || persisted?.url || persisted?.assetUrl || dataUrl;
        const id = `design_hist_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        return {
          id,
          status: 'completed',
          kind: 'image',
          mediaKind: 'image',
          type: 'image',
          assetId: persisted?.id,
          assetUrl: persisted?.assetUrl || persisted?.url || persisted?.src || src,
          imageUrl: persisted?.imageUrl || persisted?.assetUrl || persisted?.url || persisted?.src || src,
          url: persisted?.url || src,
          src,
          assetPath: persisted?.path || persisted?.assetPath,
          localPath: persisted?.localPath,
          title: persisted?.title || file.name || '生成历史图片',
          filename: persisted?.filename || file.name || '生成历史图片',
          mime: persisted?.mime || file.type || 'image/*',
          source: 'design-space-history-upload',
          createdAt: new Date().toISOString(),
        };
      }));
      onPatchCard?.({
        history: [...uploadedVersions, ...historyVersions],
        currentVersionId: uploadedVersions[0]?.id || card.currentVersionId || '',
        status: 'generated',
      });
    } finally {
      setHistoryUploading(false);
    }
  };

  return (
    <aside className="design-space-panel design-detail-panel">
      <div className="design-space-panel-head">
        <h2>卡片编辑</h2>
        <span>{card.status || 'draft'}</span>
      </div>
      <label className="design-space-field">
        <span>名称</span>
        <input value={card.name || ''} onChange={(event) => onPatchCard?.({ name: event.target.value })} />
      </label>
      <label className="design-space-field">
        <span>{promptLabelForCard(card)}</span>
        <CompositionSafeTextarea value={promptText} onCommit={(value) => onPatchCard?.(promptPatchForCard(card, value))} />
      </label>
      <section className="design-reference-section">
        <div className="design-space-panel-head compact">
          <h2>{referenceLabel}</h2>
          <span>{referenceAssets.length}/{MAX_REFERENCE_IMAGES}</span>
        </div>
        <div className={`design-reference-card ${referenceAssets.length ? 'has-images' : ''}`}>
          {referenceAssets.length ? (
            <>
              <div className="design-reference-list">
                {referenceAssets.map((asset, index) => {
                  const src = referenceAssetUrl(asset);
                  const title = asset.title || asset.filename || `${referenceLabel} ${index + 1}`;
                  return (
                    <div className="design-reference-tile" key={asset.id || `${src}-${index}`}>
                      <img src={src} alt={title} />
                      <span>{title}</span>
                      <button type="button" onClick={() => removeReferenceImage(asset.id)}>
                        移除
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="design-reference-actions">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={referenceUploading || !canUploadReference}>
                  {referenceUploading ? '上传中...' : '继续上传'}
                </button>
                <button type="button" onClick={() => onPatchCard?.({ referenceAssets: [] })}>
                  清空
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="design-reference-empty">最多上传 {MAX_REFERENCE_IMAGES} 张{referenceLabel}</div>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={referenceUploading}>
                {referenceUploading ? '上传中...' : `上传${referenceLabel}`}
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            aria-label={`上传${referenceLabel}`}
            hidden
            onChange={uploadReferenceImage}
          />
        </div>
      </section>
      <div className="design-space-actions">
        <button type="button" className="design-space-primary" disabled={card.status === 'generating' || !modelId || !promptText.trim()} onClick={() => onGenerateCard?.({ card, modelId, imageParams })}>
          {card.status === 'generating' ? '生成中...' : '生成该卡片'}
        </button>
        <button
          type="button"
          className={`design-space-prefix-trigger${hasPromptPrefix ? ' is-set' : ''}`}
          aria-label="前缀设定"
          onClick={() => setPrefixOpen(true)}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M4 7.5h10.5M4 12h16M4 16.5h8.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M16.5 4.5 20 8l-7.6 7.6-3.8.8.8-3.8 7.1-8.1Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <strong>前缀设定</strong>
          {hasPromptPrefix && <em>已设定</em>}
        </button>
      </div>
      <DesignSpaceHistoryGrid
        card={card}
        onSetCurrentVersion={setCurrentPreviewVersion}
        onUploadImages={uploadHistoryImages}
        uploading={historyUploading}
      />
      {prefixOpen && (
        <div className="design-prefix-backdrop" role="presentation" onMouseDown={() => setPrefixOpen(false)}>
          <section
            className="design-prefix-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="前缀设定"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="design-prefix-head">
              <div>
                <span>Prompt Prefix</span>
                <h2>前缀设定</h2>
              </div>
              <button type="button" aria-label="关闭前缀设定" onClick={() => setPrefixOpen(false)}>
                ×
              </button>
            </div>
            <label className="design-space-field">
              <span>每次生成图片都会拼接在提示词最前面</span>
              <textarea
                value={prefixDraft}
                onChange={(event) => setPrefixDraft(event.target.value)}
                placeholder="例如：统一前缀：古风真人短剧，写实电影质感，禁止卡通化。"
              />
            </label>
            <div className="design-prefix-actions">
              <button type="button" onClick={() => setPrefixDraft('')}>
                清空
              </button>
              <button type="button" onClick={() => setPrefixOpen(false)}>
                取消
              </button>
              <button type="button" className="design-space-primary" onClick={savePromptPrefix}>
                保存前缀
              </button>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
