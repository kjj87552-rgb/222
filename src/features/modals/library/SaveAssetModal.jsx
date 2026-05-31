import React from 'react';
import { IAdd, ICheck, IFolder } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { useNodes, useProjectId } from '../../../shared/store/canvasStore.js';
import { libraryActions } from '../../../shared/store/libraryStore.js';
import { AssetStore, GLOBAL_ASSET_PROJECT_ID } from '../../../shared/platform/assetStore.js';
import { safeFileName } from '../../../shared/utils/file.js';
import { getNodeAssetPayload } from '../../../shared/utils/asset.js';
import {
  ASSET_TYPES,
  DEFAULT_STYLE_TAGS,
  getAssetTypeLabel,
  isVisualKind,
  makeVisualTaxonomyMeta,
  normalizeAssetType,
  normalizeLabel,
} from '../../../shared/utils/assetTaxonomy.js';

async function persistCanvasAsset(node, asset, { scope, projectId, meta }) {
  if (!asset?.src) return null;
  const targetProjectId = scope === 'global' ? GLOBAL_ASSET_PROJECT_ID : (projectId || 'local-default');
  const sourceAssetId = node?.assetId || node?.asset_id || asset.assetId;

  if (scope === 'global' && sourceAssetId) {
    try {
      return await AssetStore.promote(sourceAssetId, {
        title: asset.title,
        meta: {
          ...meta,
          sourceNodeId: node.id,
          source: 'canvas.save.global',
          savedFrom: 'canvas-save-dialog',
        },
      });
    } catch (error) {
      console.warn('Save canvas asset via promote failed; falling back to library record', error);
    }
  }

  if (/^data:/i.test(asset.src) && AssetStore.writeAvailable()) {
    try {
      return await AssetStore.writeDataUrl(targetProjectId, {
        dataUrl: asset.src,
        filename: asset.filename || `${safeFileName(asset.title, 'asset')}.png`,
        kind: asset.kind,
        meta: {
          ...meta,
          source: `canvas.save.${scope}`,
          inLibrary: true,
          libraryAsset: true,
          scope,
          projectId: targetProjectId,
          project_id: targetProjectId,
          sourceNodeId: node.id,
          savedFrom: 'canvas-save-dialog',
        },
      });
    } catch (error) {
      console.warn('Save canvas data URL asset failed; falling back to library record', error);
    }
  }

  return null;
}

export function SaveAssetModal({ nodeId, node: providedNode, onClose = uiActions.closeModal }) {
  const nodes = useNodes();
  const projectId = useProjectId();
  const node = providedNode || nodes.find((item) => item.id === nodeId);
  const asset = React.useMemo(() => getNodeAssetPayload(node), [node]);
  const [scope, setScope] = React.useState('project');
  const [styleTag, setStyleTag] = React.useState(DEFAULT_STYLE_TAGS[0]);
  const [assetType, setAssetType] = React.useState('person');
  const [styleDraft, setStyleDraft] = React.useState('');
  const [typeDraft, setTypeDraft] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [notice, setNotice] = React.useState('');
  const showTaxonomy = isVisualKind(asset?.kind);

  const addCustomStyle = React.useCallback(() => {
    const next = normalizeLabel(styleDraft);
    if (!next) return;
    setStyleTag(next);
    setStyleDraft('');
  }, [styleDraft]);

  const addCustomType = React.useCallback(() => {
    const next = normalizeLabel(typeDraft);
    if (!next) return;
    setAssetType(normalizeAssetType(next));
    setTypeDraft('');
  }, [typeDraft]);

  const confirmSave = React.useCallback(async () => {
    if (!node || !asset?.src || saving) return;
    setSaving(true);
    setNotice('');
    const taxonomy = showTaxonomy ? makeVisualTaxonomyMeta({ styleTag, assetType }) : {};
    const persistedAsset = await persistCanvasAsset(node, asset, {
      scope,
      projectId,
      meta: taxonomy,
    });
    libraryActions.saveNodeToAssets(node, {
      scope,
      projectId,
      styleTag,
      assetType,
      persistedAsset,
    });
    setSaving(false);
    onClose();
  }, [asset, assetType, node, onClose, projectId, saving, scope, showTaxonomy, styleTag]);

  const title = asset?.title || node?.title || '未命名素材';

  return (
    <XModal
      title="保存到资产库"
      icon={<IFolder size={16}/>}
      onClose={onClose}
      className="save-asset-modal"
      footer={(
        <>
          <span className="x-credit">{notice || '保存前选择归属和分类，生成历史不会自动入库。'}</span>
          <span style={{ flex: 1 }}/>
          <button className="x-btn ghost" type="button" onClick={onClose} disabled={saving}>取消</button>
          <button className="x-btn primary" type="button" onClick={confirmSave} disabled={!asset?.src || saving}>
            <ICheck size={12}/>{saving ? '保存中' : '确认保存'}
          </button>
        </>
      )}
    >
      <div className="save-asset-body">
        <div className="save-asset-node">
          <span>当前素材</span>
          <strong>{title}</strong>
          <em>{asset?.kind === 'video' ? '视频' : asset?.kind === 'audio' ? '音频' : '图片'}</em>
        </div>

        <section className="save-asset-section">
          <span>保存位置</span>
          <div className="setting-segment">
            <button type="button" className={scope === 'project' ? 'active' : ''} onClick={() => setScope('project')}>
              项目素材
            </button>
            <button type="button" className={scope === 'global' ? 'active' : ''} onClick={() => setScope('global')}>
              全局资产库
            </button>
          </div>
        </section>

        {showTaxonomy && (
          <>
            <section className="save-asset-section">
              <span>一级风格</span>
              <div className="upload-tag-row">
                {DEFAULT_STYLE_TAGS.map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={styleTag === style ? 'active' : ''}
                    onClick={() => setStyleTag(style)}
                  >
                    {style}
                  </button>
                ))}
                <form
                  className="inline-tag-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    addCustomStyle();
                  }}
                >
                  <input value={styleDraft} onChange={(event) => setStyleDraft(event.target.value)} placeholder="自定义风格"/>
                  <button type="submit"><IAdd size={11}/></button>
                </form>
              </div>
            </section>

            <section className="save-asset-section">
              <span>二级类型</span>
              <div className="setting-segment dynamic">
                {ASSET_TYPES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={normalizeAssetType(assetType) === item.key ? 'active' : ''}
                    onClick={() => setAssetType(item.key)}
                  >
                    {getAssetTypeLabel(item.key)}
                  </button>
                ))}
                <form
                  className="inline-tag-form taxonomy-add-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    addCustomType();
                  }}
                >
                  <input value={typeDraft} onChange={(event) => setTypeDraft(event.target.value)} placeholder="添加类型"/>
                  <button type="submit"><IAdd size={11}/></button>
                </form>
              </div>
            </section>
          </>
        )}
      </div>
    </XModal>
  );
}
