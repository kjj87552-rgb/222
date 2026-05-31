import React from 'react';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { safeFileName, triggerDownload } from '../../shared/utils/file.js';

function versionAssetUrl(version) {
  return makeAssetUrl({
    id: version?.assetId,
    src: version?.assetUrl || version?.url || version?.src || version?.imageUrl || version?.assetPath || version?.localPath || version?.path,
    url: version?.url || version?.imageUrl,
    assetUrl: version?.assetUrl || version?.imageUrl,
    assetPath: version?.assetPath,
    localPath: version?.localPath,
    path: version?.path,
    preferLocalAsset: true,
  });
}

function versionErrorText(version) {
  return String(version?.error || version?.message || '').trim();
}

function versionStatusLabel(version) {
  const status = String(version?.status || '').toLowerCase();
  if (['completed', 'generated', 'done', 'success'].includes(status)) return '已完成';
  if (['generating', 'running', 'processing', 'pending', 'queued'].includes(status)) return '生成中';
  if (['failed', 'error', 'cancelled'].includes(status)) return '失败';
  if (['uploaded', 'manual'].includes(status)) return '已上传';
  return version?.status || '等待中';
}

function imageExtensionForVersion(version, assetUrl) {
  const explicitName = version?.filename || version?.title || '';
  if (/\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(explicitName)) return '';
  const mime = String(version?.mime || '').toLowerCase();
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('gif')) return '.gif';
  if (mime.includes('avif')) return '.avif';
  const path = String(assetUrl || '').split('?')[0].split('#')[0];
  const match = path.match(/\.(png|jpe?g|webp|gif|bmp|avif)$/i);
  return match ? match[0].toLowerCase().replace('.jpeg', '.jpg') : '.png';
}

function versionDownloadFilename(card, version, assetUrl) {
  const explicitName = version?.filename || version?.title;
  if (explicitName) return `${safeFileName(explicitName, '生成历史图片')}${imageExtensionForVersion(version, assetUrl)}`;
  const base = safeFileName(`${card?.name || card?.id || '生成历史'}-${version?.id || 'version'}`, '生成历史图片');
  return `${base}${imageExtensionForVersion(version, assetUrl)}`;
}

function versionDownloadAsset(card, version, assetUrl) {
  if (!assetUrl) return null;
  return {
    ...version,
    src: assetUrl,
    url: assetUrl,
    assetUrl,
    assetPath: version?.assetPath,
    localPath: version?.localPath,
    path: version?.path,
    filename: versionDownloadFilename(card, version, assetUrl),
    mediaKind: 'image',
    kind: 'image',
    mime: version?.mime || 'image/png',
  };
}

export function DesignSpaceHistoryGrid({
  card,
  onSetCurrentVersion,
  onUploadImages,
  uploading = false,
}) {
  const fileInputRef = React.useRef(null);
  const history = Array.isArray(card?.history) ? card.history : [];
  const canUpload = Boolean(onUploadImages) && !uploading;

  const uploadImages = React.useCallback((event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    onUploadImages?.(files);
  }, [onUploadImages]);

  const downloadVersion = React.useCallback((version, assetUrl) => {
    const asset = versionDownloadAsset(card, version, assetUrl);
    if (!asset) return;
    void triggerDownload(asset);
  }, [card]);

  return (
    <section className="design-history-section">
      <div className="design-space-panel-head compact design-history-head">
        <h2>生成历史 {history.length}</h2>
        <div className="design-history-head-actions">
          <button
            type="button"
            className="design-history-upload-button"
            disabled={!canUpload}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? '上传中...' : '上传图片'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            aria-label="上传生成历史图片"
            onChange={uploadImages}
          />
        </div>
      </div>
      <div className="design-history-container">
        <div className="design-history-grid">
          {history.length === 0 && (
            <div className="design-space-empty">当前卡片还没有生成历史</div>
          )}
          {history.map((version) => {
            const isCurrent = version.id === card.currentVersionId;
            const assetUrl = versionAssetUrl(version);
            const errorText = versionErrorText(version);
            const statusText = versionStatusLabel(version);
            return (
              <article
                key={version.id}
                className={`design-history-item${isCurrent ? ' current' : ''}`}
                aria-current={isCurrent ? 'true' : undefined}
              >
                <div className="design-history-thumb">
                  {assetUrl ? (
                    <img src={assetUrl} alt={`${card?.name || '生成历史'}预览图`} />
                  ) : (
                    <span className="design-history-placeholder">{statusText}</span>
                  )}
                </div>
                <div className="design-history-meta">
                  <span className="design-history-status">{statusText}</span>
                  {isCurrent && <span className="design-history-current">当前</span>}
                </div>
                {errorText && (
                  <div className="design-history-error" title={errorText}>
                    {errorText}
                  </div>
                )}
                <div className="design-history-actions">
                  <button
                    type="button"
                    className="design-history-preview-button"
                    disabled={!assetUrl || !onSetCurrentVersion}
                    title={assetUrl ? '设为当前预览' : '生成完成后可设为当前预览'}
                    onClick={() => onSetCurrentVersion?.(version)}
                  >
                    设为当前预览
                  </button>
                  <button
                    type="button"
                    className="design-history-download-button"
                    disabled={!assetUrl}
                    title={assetUrl ? '下载图片到本地' : '生成完成后可下载'}
                    onClick={() => downloadVersion(version, assetUrl)}
                  >
                    下载
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
