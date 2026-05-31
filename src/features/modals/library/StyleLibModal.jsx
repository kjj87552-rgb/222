import React from 'react';
import { ISparkle } from '../../../shared/ui/icons/index.jsx';
import { getStyleCount, styleLibraryActions, useStyleGroups } from '../../../shared/store/styleLibraryStore.js';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { GLOBAL_ASSET_PROJECT_ID } from '../../../shared/platform/assetStore.js';
import { importLocalFileAsAsset } from '../../../shared/utils/uploadHelpers.js';

const emptyStyleDraft = (groupId = 'comic-drama') => ({
  groupId,
  name: '',
  prompt: '',
  preview: '',
  previewFileName: '',
});

export function StyleLibModal({ onPick, onClose = uiActions.closeOverlayModal }) {
  const styleGroups = useStyleGroups();
  const [activeTab, setActiveTab] = React.useState(styleGroups[0]?.id || 'comic-drama');
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState(() => emptyStyleDraft(activeTab));
  const activeGroup = styleGroups.find((group) => group.id === activeTab) || styleGroups[0];

  const openAddDialog = () => {
    setDraft(emptyStyleDraft(activeTab));
    setAdding(true);
  };

  const closeAddDialog = () => {
    setAdding(false);
  };

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const uploadPreviewImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const persisted = await importLocalFileAsAsset(file, GLOBAL_ASSET_PROJECT_ID, 'image', {
      source: 'style-library-preview',
      inLibrary: true,
      libraryAsset: true,
      scope: 'global',
    });
    const importedPreview = persisted?.src || persisted?.url || '';
    if (importedPreview) {
      setDraft((current) => ({
        ...current,
        preview: importedPreview,
        previewFileName: persisted?.title || file.name,
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        preview: String(reader.result || ''),
        previewFileName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveCustomStyle = (event) => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    const added = styleLibraryActions.addCustomStyle({
      groupId: draft.groupId,
      name,
      prompt: draft.prompt,
      preview: draft.preview,
    });
    setActiveTab(added.groupId);
    setAdding(false);
    setDraft(emptyStyleDraft(added.groupId));
  };

  return (
    <XModal
      title="风格库"
      icon={<ISparkle size={16}/>}
      onClose={onClose}
      className={`sl-modal sl-redesign ${adding ? 'sl-modal-adding' : ''}`}
    >
      <div className="sl-library-head">
        <div>
          <span>精选风格</span>
          <strong>{getStyleCount(styleGroups)} 套视觉方向</strong>
        </div>
        <button type="button" className="x-btn primary sl-add-style" onClick={openAddDialog}>
          添加风格
        </button>
      </div>
      <div className="sl-tabs" role="tablist" aria-label="风格分类">
        {styleGroups.map((group) => (
          <button
            type="button"
            key={group.id}
            role="tab"
            aria-selected={group.id === activeTab}
            className={`sl-tab ${group.id === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(group.id)}
          >
            <strong>{group.title}</strong>
            <span>{group.items.length} 套 · {group.summary}</span>
          </button>
        ))}
      </div>
      <div className="sl-style-sections">
        <section className="sl-style-section">
          <div className="sl-style-grid">
            {activeGroup.items.map((item) => (
              <button
                type="button"
                key={item.id}
                className="sl-style-card"
                onClick={() => {
                  onPick?.(item);
                  if (onPick) onClose?.();
                }}
              >
                <span className="sl-preview">
                  <img src={item.preview} alt={`${item.n}风格预览`} />
                </span>
                <span className="sl-card-copy">
                  <span className="sl-style-title">
                    <strong>{item.n}</strong>
                    <em>{item.source === 'custom' ? `${item.tag} · 自定义` : item.tag}</em>
                  </span>
                  <span className="sl-texture-row">
                    <img src={item.textureImage} alt={`${item.n}材质贴图`} />
                    <span>
                      <small>材质贴图</small>
                      <b>{item.texture}</b>
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
      {adding && (
        <div className="sl-create-mask" role="dialog" aria-modal="true" aria-label="新增风格">
          <form className="sl-create-dialog" onSubmit={saveCustomStyle}>
            <div className="sl-create-head">
              <div>
                <span>Custom Style</span>
                <strong>新增风格</strong>
              </div>
              <button type="button" className="close" onClick={closeAddDialog} aria-label="关闭新增风格">×</button>
            </div>
            <label className="sl-create-field">
              <span>分类</span>
              <select
                aria-label="风格分类"
                value={draft.groupId}
                onChange={(event) => updateDraft('groupId', event.target.value)}
              >
                {styleGroups.map((group) => (
                  <option key={group.id} value={group.id}>{group.title}</option>
                ))}
              </select>
            </label>
            <label className="sl-create-field">
              <span>风格名称</span>
              <input
                aria-label="风格名称"
                value={draft.name}
                onChange={(event) => updateDraft('name', event.target.value)}
                placeholder="例如：赛博漫剧"
              />
            </label>
            <label className="sl-create-field sl-create-field-wide sl-create-upload">
              <span>预览图</span>
              <div className={`sl-upload-box ${draft.preview ? 'has-image' : ''}`}>
                {draft.preview ? (
                  <img src={draft.preview} alt="自定义风格预览" />
                ) : (
                  <span>
                    <strong>上传本地图片</strong>
                    <small>PNG / JPG / WebP</small>
                  </span>
                )}
                <input
                  aria-label="上传风格预览图"
                  type="file"
                  accept="image/*"
                  onChange={uploadPreviewImage}
                />
              </div>
              {draft.previewFileName && <em>{draft.previewFileName}</em>}
            </label>
            <label className="sl-create-field sl-create-field-wide">
              <span>完整提示词</span>
              <textarea
                aria-label="风格提示词"
                value={draft.prompt}
                onChange={(event) => updateDraft('prompt', event.target.value)}
                placeholder="粘贴或编写这个风格的一键提示词，包含画面方向、光影、色彩、材质、构图和禁忌要求"
              />
            </label>
            <div className="sl-create-actions">
              <button type="button" className="x-btn ghost" onClick={closeAddDialog}>取消</button>
              <button type="submit" className="x-btn primary" disabled={!draft.name.trim()}>
                保存风格
              </button>
            </div>
          </form>
        </div>
      )}
    </XModal>
  );
}
