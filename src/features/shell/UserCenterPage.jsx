import React from 'react';
import { createPortal } from 'react-dom';
import { NewApiStore } from '../../shared/platform/newApiStore.js';
import { makeAssetUrl } from '../../shared/platform/backendClient.js';
import { accountActions, formatQuotaMoney } from '../../shared/store/accountStore.js';
import { IArrow, IHistory, IKey, ISparkle } from '../../shared/ui/icons/index.jsx';
import { AuthPanel } from './AuthGate.jsx';
import { forgetRememberedPassword } from './authRememberLogin.js';

const DEFAULT_BASE_URL = 'http://103.207.68.225:3000';
const MIN_PASSWORD_LENGTH = 8;
export const CARD_PURCHASE_URL = 'http://km.huimengart.cn/';

function errorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes('invalid smtp account')) {
    return '中转站邮件服务 SMTP 未配置或不可用，请先检查后台配置。';
  }
  if (message.toLowerCase().includes('user.password') && message.toLowerCase().includes('min')) {
    return `密码长度不符合要求，请至少输入 ${MIN_PASSWORD_LENGTH} 位密码。`;
  }
  return message;
}

function avatarLetter(username) {
  const value = String(username || '?').trim();
  return (value[0] || '?').toUpperCase();
}

function formatLogTime(value) {
  if (!value) return '未知时间';
  let date = null;
  if (typeof value === 'number') {
    date = new Date(value > 10_000_000_000 ? value : value * 1000);
  } else if (/^\d+$/.test(String(value))) {
    const number = Number(value);
    date = new Date(number > 10_000_000_000 ? number : number * 1000);
  } else {
    date = new Date(value);
  }
  if (!date || Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function logTitle(item = {}) {
  return item.content || item.modelName || item.tokenName || '模型调用';
}

function transactionType(item = {}) {
  if (item.transactionType) return item.transactionType;
  const raw = String(item.type ?? item.kind ?? '').trim().toLowerCase();
  if (item.isRefund || raw === '6' || raw === 'refund' || raw === '退款') return 'refund';
  if (raw === '2' || raw === 'consume' || raw === '消费') return 'consume';
  return 'consume';
}

function transactionLabel(item = {}) {
  return transactionType(item) === 'refund' ? '退款' : '消费';
}

function formatSignedQuotaMoney(value, item = {}) {
  const sign = transactionType(item) === 'refund' ? '+' : '-';
  return `${sign}${formatQuotaMoney(Math.abs(Number(value) || 0))}`;
}

function formatDuration(seconds) {
  const value = Number(seconds) || 0;
  if (value <= 0) return 'N/A';
  if (value < 60) return `${value} s`;
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

function usageStatusLabel(status) {
  const value = String(status || '').trim().toUpperCase();
  return {
    SUCCESS: '成功',
    FAILURE: '失败',
    IN_PROGRESS: '执行中',
    SUBMITTED: '队列中',
    QUEUED: '队列中',
    NOT_START: '未启动',
  }[value] || value || '未知';
}

function usageProgressValue(value) {
  const number = Number(String(value || '').replace('%', ''));
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number));
}

function usagePreviewKindLabel(kind) {
  return {
    video: '视频',
    audio: '音频',
    image: '图片',
    link: '结果',
    error: '错误详情',
  }[String(kind || '').toLowerCase()] || '结果';
}

function usagePreviewLabel(item = {}) {
  if (item.previewLabel) return item.previewLabel;
  const kind = String(item.previewKind || '').toLowerCase();
  if (kind === 'video') return '预览视频';
  if (kind === 'audio') return '预览音频';
  if (kind === 'image') return '预览图片';
  return '打开结果';
}

function normalizeUsagePreviewUrl(value) {
  const text = String(value || '').trim();
  if (!/^(https?:|data:|blob:|libai-asset:)/i.test(text) && !text.startsWith('/assets/') && !text.startsWith('/newapi/')) {
    return '';
  }
  return makeAssetUrl({ src: text });
}

function UsageLogPreviewDialog({ preview, onClose }) {
  if (!preview) return null;
  const kind = String(preview.kind || preview.previewKind || '').toLowerCase();
  const url = normalizeUsagePreviewUrl(preview.url || preview.previewUrl || '');
  const downloadUrl = normalizeUsagePreviewUrl(preview.downloadUrl || preview.download_url || url);
  const title = preview.title || usagePreviewKindLabel(kind);

  return (
    <div className="account-usage-preview-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="account-usage-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="任务详情预览"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="account-usage-preview-head">
          <div>
            <span>{usagePreviewKindLabel(kind)}</span>
            <h3>{title}</h3>
            {preview.taskId && <em>{preview.taskId}</em>}
          </div>
          <button type="button" className="account-modal-close" onClick={onClose} aria-label="关闭任务详情预览">
            关闭
          </button>
        </header>
        <div className={`account-usage-preview-stage ${kind || 'link'}`}>
          {kind === 'video' && url && (
            <video src={url} controls preload="metadata" />
          )}
          {kind === 'audio' && url && (
            <audio src={url} controls preload="metadata" />
          )}
          {kind === 'image' && url && (
            <img src={url} alt={title} />
          )}
          {kind === 'error' && (
            <pre>{preview.text || preview.errorDetail || preview.detail || '暂无详情'}</pre>
          )}
          {!['video', 'audio', 'image', 'error'].includes(kind) && (
            <div className="account-usage-preview-link">
              <strong>{preview.detail || title}</strong>
              {url && <a href={url} target="_blank" rel="noreferrer">打开结果链接</a>}
            </div>
          )}
        </div>
        {url && kind !== 'link' && (
          <footer className="account-usage-preview-foot">
            <a href={url} target="_blank" rel="noreferrer">在浏览器打开</a>
            {downloadUrl && <a href={downloadUrl} target="_blank" rel="noreferrer" download={preview.fileName || undefined}>下载</a>}
          </footer>
        )}
      </section>
    </div>
  );
}

function UsageLogDetailCell({ item = {}, onPreview }) {
  const previewUrl = normalizeUsagePreviewUrl(item.previewUrl) || normalizeUsagePreviewUrl(item.resultUrl);
  const downloadUrl = normalizeUsagePreviewUrl(item.downloadUrl || item.download_url);
  const errorText = item.errorDetail || item.failReason || '';
  if (previewUrl) {
    const label = usagePreviewLabel(item);
    return (
      <button
        type="button"
        className="account-usage-detail-action account-usage-preview-btn"
        onClick={() => onPreview?.({
          kind: item.previewKind || 'link',
          url: previewUrl,
          downloadUrl,
          fileName: item.previewFileName || item.preview_file_name || '',
          title: label,
          taskId: item.taskId,
          detail: item.detail,
        })}
      >
        {label}
      </button>
    );
  }
  if (errorText) {
    return (
      <button
        type="button"
        className="account-usage-detail-action account-usage-error-btn"
        onClick={() => onPreview?.({
          kind: 'error',
          title: '失败详情',
          taskId: item.taskId,
          text: errorText,
        })}
      >
        查看错误
      </button>
    );
  }
  return <span>{item.detail || '-'}</span>;
}

function mediaAssetKind(asset = {}, item = {}) {
  const type = String(asset.mediaType || asset.media_type || item.previewKind || '').toLowerCase();
  if (['image', 'video', 'audio', 'link', 'file'].includes(type)) return type;
  const mime = String(asset.mimeType || asset.mime_type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  const url = String(asset.previewUrl || asset.preview_url || asset.downloadUrl || asset.download_url || item.previewUrl || '').toLowerCase();
  if (/\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/.test(url)) return 'image';
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/.test(url)) return 'video';
  if (/\.(mp3|wav|m4a|aac|ogg)(\?|#|$)/.test(url)) return 'audio';
  return 'link';
}

function billMediaFromItem(item = {}) {
  const assets = Array.isArray(item.mediaAssets)
    ? item.mediaAssets
    : Array.isArray(item.media_assets)
      ? item.media_assets
      : [];
  const firstAsset = assets.find((asset) => asset && !asset.expired && (asset.previewUrl || asset.preview_url || asset.downloadUrl || asset.download_url));
  const source = firstAsset || (item.previewUrl || item.preview_url || item.downloadUrl || item.download_url ? item : null);
  if (!source) return null;
  const previewUrl = normalizeUsagePreviewUrl(source.previewUrl || source.preview_url || source.resultUrl || source.result_url);
  const downloadUrl = normalizeUsagePreviewUrl(source.downloadUrl || source.download_url || source.previewUrl || source.preview_url || source.resultUrl || source.result_url);
  if (!previewUrl && !downloadUrl) return null;
  const kind = mediaAssetKind(source, item);
  return {
    kind,
    previewUrl,
    downloadUrl,
    title: source.previewLabel || source.preview_label || item.previewLabel || usagePreviewLabel({ previewKind: kind }),
    fileName: source.fileName || source.file_name || item.previewFileName || '',
    taskId: source.taskId || source.task_id || item.requestId || '',
    detail: item.content || item.modelName || '',
  };
}

function AccountBillMediaCell({ item = {}, onPreview }) {
  const media = billMediaFromItem(item);
  if (!media) return <span className="account-bill-media-empty">-</span>;
  return (
    <div className="account-bill-media">
      <span className={`account-bill-media-tag ${media.kind}`}>{usagePreviewKindLabel(media.kind)}</span>
      <div className="account-bill-media-actions">
        {media.previewUrl && (
          <button
            type="button"
            className="account-bill-media-btn account-bill-preview-btn"
            onClick={() => onPreview?.({
              kind: media.kind,
              url: media.previewUrl,
              downloadUrl: media.downloadUrl,
              title: media.title,
              fileName: media.fileName,
              taskId: media.taskId,
              detail: media.detail,
            })}
          >
            预览
          </button>
        )}
        {media.downloadUrl && (
          <a
            className="account-bill-media-btn account-bill-download-btn"
            href={media.downloadUrl}
            target="_blank"
            rel="noreferrer"
            download={media.fileName || undefined}
          >
            下载
          </a>
        )}
      </div>
    </div>
  );
}

export function AccountAccessPanel({
  hasDefaultKey = false,
  hasRelay = false,
  hasGroup = false,
}) {
  const items = [
    { label: '密钥状态', value: hasDefaultKey ? '已绑定' : '待绑定', ready: hasDefaultKey },
    { label: '中转站', value: hasRelay ? '已配置' : '待配置', ready: hasRelay },
    { label: '分组同步', value: hasGroup ? '已同步' : '待同步', ready: hasGroup },
  ];

  return (
    <section className="account-panel account-key-panel">
      <div className="account-panel-head">
        <span className="account-icon"><IKey size={16} /></span>
        <div>
          <span>画布接入</span>
          <strong>{hasDefaultKey && hasRelay ? '调用通道已就绪' : '等待接入配置'}</strong>
        </div>
      </div>
      <div className="account-access-grid">
        {items.map((item) => (
          <div className={`account-access-item ${item.ready ? 'ready' : ''}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AccountConsumptionPanel({
  summary = {},
  items = [],
  loading = false,
  backendAvailable = false,
  busyAction = '',
  onRefresh,
  onOpenDetails,
}) {
  const totalQuota = Number(summary?.quota) || items.reduce((sum, item) => sum + (Number(item?.quota) || 0), 0);
  const disabled = !backendAvailable || Boolean(busyAction) || loading;

  return (
    <section className="account-panel account-consumption-panel">
      <div className="account-panel-head">
        <span className="account-icon"><IHistory size={16} /></span>
        <div>
          <span>消费明细</span>
          <strong>历史总消费</strong>
        </div>
      </div>
      <div className="account-consumption-summary">
        <div>
          <span>历史总消费</span>
          <strong>{formatQuotaMoney(totalQuota)}</strong>
          <em>{loading ? '正在同步消费记录' : '消费记录已放入独立窗口'}</em>
        </div>
      </div>
      <div className="account-consumption-actions">
        <button type="button" className="account-primary-btn" onClick={onOpenDetails} disabled={disabled}>
          {loading ? '读取中...' : '查看消费记录'}
        </button>
        <button type="button" className="account-ghost-btn" onClick={onRefresh} disabled={disabled}>
          刷新明细
        </button>
      </div>
    </section>
  );
}

export function AccountConsumptionDialog({
  open = false,
  summary = {},
  items = [],
  loading = false,
  backendAvailable = false,
  busyAction = '',
  startDate = '',
  endDate = '',
  onClose,
  onRefresh,
  onSearch,
  onReset,
  onStartDateChange,
  onEndDateChange,
}) {
  const [portalTarget, setPortalTarget] = React.useState(null);
  const [selectedPreview, setSelectedPreview] = React.useState(null);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined' || !document.body) {
      setPortalTarget(null);
      return;
    }
    setPortalTarget(document.querySelector('.product-shell') || document.body);
  }, [open]);

  React.useEffect(() => {
    if (!open) setSelectedPreview(null);
  }, [open]);

  if (!open) return null;
  const debitQuota = Number(summary?.debitQuota ?? summary?.quota) || items
    .filter((item) => transactionType(item) !== 'refund')
    .reduce((sum, item) => sum + (Number(item?.quota) || 0), 0);
  const refundQuota = Number(summary?.refundQuota) || items
    .filter((item) => transactionType(item) === 'refund')
    .reduce((sum, item) => sum + (Number(item?.quota) || 0), 0);
  const netQuota = Number(summary?.netQuota ?? (debitQuota - refundQuota));
  const disabled = !backendAvailable || Boolean(busyAction) || loading;

  const dialog = (
    <div className="account-consumption-dialog-backdrop" role="presentation">
      <section
        className="account-consumption-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="消费账单窗口"
      >
        <header className="account-consumption-dialog-head">
          <div>
            <span>消费明细</span>
            <h2>消费账单</h2>
          </div>
          <button type="button" className="account-modal-close" onClick={onClose} aria-label="关闭消费账单">
            关闭
          </button>
        </header>
        <div className="account-bill-toolbar">
          <div className="account-bill-totals">
            <div className="account-consumption-dialog-total">
              <span>净消费</span>
              <strong>{formatQuotaMoney(netQuota)}</strong>
            </div>
            <div className="account-consumption-dialog-total compact">
              <span>扣费</span>
              <strong>{formatQuotaMoney(debitQuota)}</strong>
            </div>
            <div className="account-consumption-dialog-total compact refund">
              <span>退款</span>
              <strong>{formatQuotaMoney(refundQuota)}</strong>
            </div>
          </div>
          <form className="account-bill-filter" onSubmit={onSearch}>
            <label>
              <span>开始时间</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="YYYY-MM-DD"
                pattern="\d{4}-\d{2}-\d{2}"
                value={startDate}
                disabled={disabled}
                onChange={(event) => onStartDateChange?.(event.target.value)}
              />
            </label>
            <label>
              <span>结束时间</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="YYYY-MM-DD"
                pattern="\d{4}-\d{2}-\d{2}"
                value={endDate}
                disabled={disabled}
                onChange={(event) => onEndDateChange?.(event.target.value)}
              />
            </label>
            <button type="submit" className="account-primary-btn" disabled={disabled}>
              {loading ? '查询中...' : '查询账单'}
            </button>
            <button type="button" className="account-ghost-btn" onClick={onReset} disabled={disabled}>
              重置时间
            </button>
          </form>
        </div>
        <div className="account-bill-table-head">
          <span>时间</span>
          <span>类型</span>
          <span>模型 / 内容</span>
          <span>调用通道</span>
          <span>Tokens</span>
          <span>金额</span>
          <span>预览 / 下载</span>
        </div>
        <div className="account-consumption-dialog-scroll">
          <div className="account-bill-table">
            {loading && <div className="account-consumption-empty">正在读取消费明细...</div>}
            {!loading && !items.length && <div className="account-consumption-empty">暂无消费明细</div>}
            {!loading && items.map((item, index) => (
              <div className="account-bill-row" key={item.id || `${item.createdAt || 'log'}-${index}`}>
                <span>{formatLogTime(item.createdAt)}</span>
                <span className={`account-bill-type ${transactionType(item)}`}>{transactionLabel(item)}</span>
                <div className="account-bill-main">
                  <strong>{item.modelName || '未知模型'}</strong>
                  <em>{logTitle(item)}</em>
                </div>
                <span>{item.tokenName || '默认通道'}</span>
                <span>{Number(item.totalTokens || 0).toLocaleString()}</span>
                <strong className={transactionType(item) === 'refund' ? 'refund' : ''}>{formatSignedQuotaMoney(item.quota, item)}</strong>
                <AccountBillMediaCell item={item} onPreview={setSelectedPreview} />
              </div>
            ))}
          </div>
        </div>
        <UsageLogPreviewDialog preview={selectedPreview} onClose={() => setSelectedPreview(null)} />
      </section>
    </div>
  );

  return portalTarget ? createPortal(dialog, portalTarget) : dialog;
}

export function AccountUsageLogDialog({
  open = false,
  summary = {},
  items = [],
  loading = false,
  backendAvailable = false,
  busyAction = '',
  startDate = '',
  endDate = '',
  taskId = '',
  channelId = '',
  status = 'all',
  onClose,
  onRefresh,
  onSearch,
  onReset,
  onStartDateChange,
  onEndDateChange,
  onTaskIdChange,
  onChannelIdChange,
  onStatusChange,
}) {
  const [portalTarget, setPortalTarget] = React.useState(null);
  const [selectedPreview, setSelectedPreview] = React.useState(null);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined' || !document.body) {
      setPortalTarget(null);
      return;
    }
    setPortalTarget(document.querySelector('.product-shell') || document.body);
  }, [open]);

  React.useEffect(() => {
    if (!open) setSelectedPreview(null);
  }, [open]);

  if (!open) return null;
  const disabled = !backendAvailable || Boolean(busyAction) || loading;
  const total = Number(summary?.total) || items.length;

  const dialog = (
    <div className="account-usage-dialog-backdrop" role="presentation">
      <section
        className="account-usage-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="使用日志窗口"
      >
        <header className="account-consumption-dialog-head account-usage-dialog-head">
          <div>
            <span>USAGE LOGS</span>
            <h2>使用日志</h2>
            <em>任务执行记录</em>
          </div>
          <button type="button" className="account-modal-close" onClick={onClose} aria-label="关闭使用日志">
            关闭
          </button>
        </header>
        <div className="account-usage-summary">
          <div>
            <span>记录数</span>
            <strong>{total.toLocaleString()}</strong>
          </div>
          <form className="account-usage-filter" onSubmit={onSearch}>
            <label>
              <span>开始时间</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="YYYY-MM-DD"
                pattern="\d{4}-\d{2}-\d{2}"
                value={startDate}
                disabled={disabled}
                onChange={(event) => onStartDateChange?.(event.target.value)}
              />
            </label>
            <label>
              <span>结束时间</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="YYYY-MM-DD"
                pattern="\d{4}-\d{2}-\d{2}"
                value={endDate}
                disabled={disabled}
                onChange={(event) => onEndDateChange?.(event.target.value)}
              />
            </label>
            <label>
              <span>任务ID</span>
              <input
                type="text"
                autoComplete="off"
                placeholder="task_libai..."
                value={taskId}
                disabled={disabled}
                onChange={(event) => onTaskIdChange?.(event.target.value)}
              />
            </label>
            <label>
              <span>渠道ID</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="6"
                value={channelId}
                disabled={disabled}
                onChange={(event) => onChannelIdChange?.(event.target.value)}
              />
            </label>
            <label>
              <span>状态</span>
              <select
                value={status}
                disabled={disabled}
                onChange={(event) => onStatusChange?.(event.target.value)}
              >
                <option value="all">全部</option>
                <option value="SUCCESS">成功</option>
                <option value="FAILURE">失败</option>
                <option value="IN_PROGRESS">执行中</option>
                <option value="SUBMITTED">队列中</option>
              </select>
            </label>
            <button type="submit" className="account-primary-btn" disabled={disabled}>
              {loading ? '查询中...' : '查询'}
            </button>
            <button type="button" className="account-ghost-btn" onClick={onReset} disabled={disabled}>
              重置
            </button>
            <button type="button" className="account-ghost-btn" onClick={onRefresh} disabled={disabled}>
              刷新
            </button>
          </form>
        </div>
        <div className="account-usage-table-head">
          <span>提交时间</span>
          <span>结束时间</span>
          <span>花费时间</span>
          <span>渠道</span>
          <span>平台</span>
          <span>类型</span>
          <span>任务ID</span>
          <span>任务状态</span>
          <span>进度</span>
          <span>详情</span>
        </div>
        <div className="account-usage-dialog-scroll">
          <div className="account-usage-table">
            {loading && <div className="account-consumption-empty">正在读取使用日志...</div>}
            {!loading && !items.length && <div className="account-consumption-empty">暂无使用日志</div>}
            {!loading && items.map((item, index) => {
              const statusText = item.statusLabel || usageStatusLabel(item.status);
              const progress = usageProgressValue(item.progress);
              return (
                <div className="account-usage-row" key={item.id || item.taskId || index}>
                  <span>{formatLogTime(item.submitTime)}</span>
                  <span>{formatLogTime(item.finishTime)}</span>
                  <span>{formatDuration(item.durationSeconds)}</span>
                  <span>{item.channelId || '-'}</span>
                  <span>{item.platform || '-'}</span>
                  <span>{item.type || '任务'}</span>
                  <strong>{item.taskId || '-'}</strong>
                  <span className={`account-usage-status ${String(item.status || '').toLowerCase()}`}>{statusText}</span>
                  <div className="account-usage-progress">
                    <i style={{ width: `${progress}%` }} />
                    <em>{progress}%</em>
                  </div>
                  <UsageLogDetailCell item={item} onPreview={setSelectedPreview} />
                </div>
              );
            })}
          </div>
        </div>
        <UsageLogPreviewDialog preview={selectedPreview} onClose={() => setSelectedPreview(null)} />
      </section>
    </div>
  );

  return portalTarget ? createPortal(dialog, portalTarget) : dialog;
}

export function AccountBalancePanel({
  quota = 0,
  backendAvailable = false,
  busyAction = '',
  onRefresh,
  onOpenBilling,
  onOpenUsageLogs,
}) {
  return (
    <section className="account-panel account-balance-panel">
      <div className="account-balance-head">
        <span className="account-icon"><ISparkle size={16} /></span>
        <span>账户余额</span>
      </div>
      <strong>{formatQuotaMoney(quota)}</strong>
      <div className="account-balance-actions">
        <button type="button" className="account-ghost-btn" onClick={onRefresh} disabled={!backendAvailable || Boolean(busyAction)}>
          {busyAction === 'refresh' ? '刷新中...' : '刷新余额'}
        </button>
        <button type="button" className="account-primary-btn" onClick={onOpenBilling} disabled={!backendAvailable || Boolean(busyAction)}>
          消费账单
        </button>
        <button type="button" className="account-primary-btn account-usage-open-btn" onClick={onOpenUsageLogs} disabled={!backendAvailable || Boolean(busyAction)}>
          使用日志
        </button>
      </div>
    </section>
  );
}

export function AccountPurchasePanel() {
  const [status, setStatus] = React.useState('');
  const [statusTone, setStatusTone] = React.useState('info');

  const openPurchaseWindow = async () => {
    setStatus('');
    setStatusTone('info');
    const bridge = globalThis.window?.libai?.system?.openPurchaseWindow;
    if (typeof bridge !== 'function') {
      setStatus('当前运行环境不支持软件内购买窗口，请复制购买地址。');
      setStatusTone('error');
      return;
    }
    try {
      const result = await bridge();
      if (result?.ok === false) {
        setStatus('购买窗口打开失败，请复制购买地址。');
        setStatusTone('error');
      }
    } catch (error) {
      setStatus(errorMessage(error) || '购买窗口打开失败，请复制购买地址。');
      setStatusTone('error');
    }
  };

  const copyPurchaseUrl = async () => {
    try {
      const writeText = globalThis.navigator?.clipboard?.writeText;
      if (typeof writeText !== 'function') throw new Error('clipboard-unavailable');
      await writeText.call(globalThis.navigator.clipboard, CARD_PURCHASE_URL);
      setStatus('购买地址已复制。');
      setStatusTone('success');
    } catch {
      setStatus('复制失败，请手动选择购买地址。');
      setStatusTone('error');
    }
  };

  return (
    <section className="account-panel account-purchase-panel">
      <div className="account-panel-head">
        <span className="account-icon"><ISparkle size={16} /></span>
        <div>
          <span>购买卡密</span>
          <strong>在软件内打开卡网购买兑换码</strong>
        </div>
      </div>
      <div className="account-purchase-url" title={CARD_PURCHASE_URL}>{CARD_PURCHASE_URL}</div>
      <div className="account-purchase-actions">
        <button type="button" className="account-primary-btn account-purchase-open-btn" onClick={openPurchaseWindow}>
          打开购买窗口
        </button>
        <button type="button" className="account-ghost-btn" onClick={copyPurchaseUrl}>
          复制地址
        </button>
      </div>
      {status && <p className={`account-purchase-note ${statusTone}`}>{status}</p>}
    </section>
  );
}

export function UserCenterPage({ onSignedOut, onClose, variant = 'page' }) {
  const [loading, setLoading] = React.useState(true);
  const [backendAvailable, setBackendAvailable] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [messageTone, setMessageTone] = React.useState('info');
  const [account, setAccount] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [consumption, setConsumption] = React.useState({ summary: {}, items: [] });
  const [consumptionLoading, setConsumptionLoading] = React.useState(false);
  const [consumptionDialogOpen, setConsumptionDialogOpen] = React.useState(false);
  const [usageLogs, setUsageLogs] = React.useState({ summary: {}, items: [] });
  const [usageLogsLoading, setUsageLogsLoading] = React.useState(false);
  const [usageLogDialogOpen, setUsageLogDialogOpen] = React.useState(false);
  const [billStartDate, setBillStartDate] = React.useState('');
  const [billEndDate, setBillEndDate] = React.useState('');
  const [usageStartDate, setUsageStartDate] = React.useState('');
  const [usageEndDate, setUsageEndDate] = React.useState('');
  const [usageTaskId, setUsageTaskId] = React.useState('');
  const [usageChannelId, setUsageChannelId] = React.useState('');
  const [usageStatus, setUsageStatus] = React.useState('all');
  const [apiKeyInput, setApiKeyInput] = React.useState('');
  const [redeemCode, setRedeemCode] = React.useState('');
  const [busyAction, setBusyAction] = React.useState('');
  const accountDataGenerationRef = React.useRef(0);

  const applyPayload = React.useCallback((payload = {}) => {
    const nextAccount = payload.account || null;
    const cachedUser = nextAccount?.user || nextAccount?.meta?.user || null;
    setAccount(nextAccount);
    setUser(payload.user || cachedUser || null);
  }, []);

  const loadAccount = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await NewApiStore.account();
      setBackendAvailable(Boolean(result.backendAvailable));
      applyPayload(result);
      setMessage('');
      setMessageTone('info');
    } catch (error) {
      setMessage(errorMessage(error));
      setMessageTone('error');
    } finally {
      setLoading(false);
    }
  }, [applyPayload]);

  React.useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const loadConsumption = React.useCallback(async (query = {}) => {
    if (!backendAvailable) return null;
    const requestGeneration = accountDataGenerationRef.current;
    setConsumptionLoading(true);
    try {
      const result = await NewApiStore.consumption(query);
      if (accountDataGenerationRef.current !== requestGeneration) return null;
      setConsumption({
        summary: result?.summary || result?.consumption?.summary || {},
        items: result?.items || result?.consumption?.items || [],
      });
      return result;
    } catch (error) {
      if (accountDataGenerationRef.current !== requestGeneration) return null;
      setMessage(errorMessage(error));
      setMessageTone('error');
      setConsumption({ summary: {}, items: [] });
      return null;
    } finally {
      if (accountDataGenerationRef.current === requestGeneration) {
        setConsumptionLoading(false);
      }
    }
  }, [backendAvailable]);

  const currentBillQuery = React.useCallback(() => ({
    start: billStartDate || undefined,
    end: billEndDate || undefined,
  }), [billEndDate, billStartDate]);

  const loadUsageLogs = React.useCallback(async (query = {}) => {
    if (!backendAvailable) return null;
    const requestGeneration = accountDataGenerationRef.current;
    setUsageLogsLoading(true);
    try {
      const result = await NewApiStore.usageLogs(query);
      if (accountDataGenerationRef.current !== requestGeneration) return null;
      setUsageLogs({
        summary: result?.summary || result?.usage?.summary || {},
        items: result?.items || result?.usage?.items || [],
      });
      return result;
    } catch (error) {
      if (accountDataGenerationRef.current !== requestGeneration) return null;
      setMessage(errorMessage(error));
      setMessageTone('error');
      setUsageLogs({ summary: {}, items: [] });
      return null;
    } finally {
      if (accountDataGenerationRef.current === requestGeneration) {
        setUsageLogsLoading(false);
      }
    }
  }, [backendAvailable]);

  const currentUsageQuery = React.useCallback(() => ({
    start: usageStartDate || undefined,
    end: usageEndDate || undefined,
    task_id: usageTaskId.trim() || undefined,
    channel_id: usageChannelId.trim() || undefined,
    status: usageStatus && usageStatus !== 'all' ? usageStatus : undefined,
  }), [usageChannelId, usageEndDate, usageStartDate, usageStatus, usageTaskId]);

  const runAction = async (name, action, successMessage) => {
    setBusyAction(name);
    setMessage('');
    setMessageTone('info');
    try {
      const result = await action();
      applyPayload(result);
      setMessage(successMessage || '');
      setMessageTone('success');
      return result;
    } catch (error) {
      setMessage(errorMessage(error));
      setMessageTone('error');
      return null;
    } finally {
      setBusyAction('');
    }
  };

  const handleAuthenticated = React.useCallback(async (payload = {}) => {
    const authGeneration = accountDataGenerationRef.current + 1;
    accountDataGenerationRef.current = authGeneration;
    const payloadConnected = Boolean(payload?.account?.hasAccessToken);
    applyPayload(payload);
    try {
      const latest = await accountActions.refresh();
      if (accountDataGenerationRef.current !== authGeneration) return;
      const latestConnected = Boolean(latest?.account?.hasAccessToken);
      if (latest) {
        setBackendAvailable(true);
        applyPayload(latest);
      }
      if (latestConnected || (!latest && payloadConnected)) {
        setMessage('登录成功。');
        setMessageTone('success');
      } else {
        setMessage('账号状态刷新失败，请重新登录。');
        setMessageTone('error');
      }
    } catch (error) {
      if (accountDataGenerationRef.current !== authGeneration) return;
      setMessage(errorMessage(error));
      setMessageTone('error');
    }
  }, [applyPayload]);

  const refreshAccount = () => {
    runAction('refresh', () => NewApiStore.refresh(), '余额已刷新。')
      .then((result) => {
        if (result) {
          accountActions.refresh();
          loadConsumption(currentBillQuery());
        }
      });
  };

  const logout = () => {
    runAction('logout', () => NewApiStore.logout(), '已退出登录。')
      .then((result) => {
        if (result) {
          accountDataGenerationRef.current += 1;
          forgetRememberedPassword();
          setAccount(null);
          setUser(null);
          setApiKeyInput('');
          setRedeemCode('');
          setBillStartDate('');
          setBillEndDate('');
          setUsageStartDate('');
          setUsageEndDate('');
          setUsageTaskId('');
          setUsageChannelId('');
          setUsageStatus('all');
          setConsumptionDialogOpen(false);
          setUsageLogDialogOpen(false);
          setConsumption({ summary: {}, items: [] });
          setConsumptionLoading(false);
          setUsageLogs({ summary: {}, items: [] });
          setUsageLogsLoading(false);
          accountActions.reset();
          onSignedOut?.();
        }
      });
  };

  const redeem = (event) => {
    event.preventDefault();
    runAction('redeem', () => NewApiStore.redeem({ code: redeemCode.trim() }), '兑换成功，余额已更新。')
      .then((result) => {
        if (result) {
          setRedeemCode('');
          accountActions.refresh();
        }
      });
  };

  const saveDefaultKey = (event) => {
    event.preventDefault();
    runAction('default-key', () => NewApiStore.setDefaultKey({
      api_key: apiKeyInput.trim(),
      verify: true,
    }), '调用密钥已验证并绑定。').then((result) => {
      if (result) {
        setApiKeyInput('');
        accountActions.refresh();
      }
    });
  };

  const openConsumptionDialog = () => {
    setConsumptionDialogOpen(true);
    if (connected && backendAvailable && !consumptionLoading && !consumption.items.length) {
      loadConsumption(currentBillQuery());
    }
  };

  const openUsageLogDialog = () => {
    setUsageLogDialogOpen(true);
    if (connected && backendAvailable && !usageLogsLoading && !usageLogs.items.length) {
      loadUsageLogs(currentUsageQuery());
    }
  };

  const searchConsumptionBill = (event) => {
    event?.preventDefault?.();
    loadConsumption(currentBillQuery());
  };

  const resetConsumptionBill = () => {
    setBillStartDate('');
    setBillEndDate('');
    loadConsumption();
  };

  const searchUsageLogs = (event) => {
    event?.preventDefault?.();
    loadUsageLogs(currentUsageQuery());
  };

  const resetUsageLogs = () => {
    setUsageStartDate('');
    setUsageEndDate('');
    setUsageTaskId('');
    setUsageChannelId('');
    setUsageStatus('all');
    loadUsageLogs();
  };

  const connected = Boolean(account?.hasAccessToken);
  const safeUser = user || {};
  const displayUsername = safeUser.username || account?.username || '未登录';
  const displayGroup = safeUser.group || account?.group || '默认用户';
  const defaultKeyPreview = account?.defaultApiKeyPreview || '';
  const hasDefaultKey = Boolean(account?.hasDefaultApiKey || account?.defaultApiKeyUsable);
  const hasRelay = Boolean(account?.baseUrl || DEFAULT_BASE_URL);
  const hasGroup = Boolean(displayGroup);
  const totalQuota = Number(safeUser.quota) || 0;
  const isModal = variant === 'modal';

  React.useEffect(() => {
    if (connected && backendAvailable) {
      loadConsumption();
    } else {
      setConsumption({ summary: {}, items: [] });
    }
  }, [backendAvailable, connected, loadConsumption]);

  if (!connected) {
    return (
      <section className={`account-auth-modal-page${isModal ? ' account-auth-modal-page-modal' : ''}`}>
        <div className="account-auth-shell">
          {isModal && (
            <button
              type="button"
              className="account-modal-close account-auth-close"
              onClick={onClose}
              aria-label="关闭账号登录"
            >
              关闭
            </button>
          )}
          {message && <div className={`model-message ${messageTone}`}>{message}</div>}
          {!backendAvailable && !loading && (
            <div className="model-message error">服务暂不可用，请稍后重试。</div>
          )}
          <div className="account-auth-title">账号登录</div>
          {loading ? (
            <div className="auth-panel compact account-auth-loading" aria-busy="true">
              <header className="auth-head">
                <div className="auth-brand">
                  <strong>漫创AI</strong>
                  <span>Creative Workspace</span>
                </div>
                <div className="auth-mark">Sign In</div>
              </header>
              <div className="auth-tabs" role="tablist" aria-label="认证方式">
                <button type="button" className="active">登录</button>
                <button type="button">注册</button>
              </div>
            </div>
          ) : (
            <AuthPanel
              compact
              autoPass={false}
              onAuthenticated={handleAuthenticated}
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={`home-page user-center-page account-center-page${isModal ? ' account-center-modal-page' : ''}`}>
      <div className="account-center-shell">
        <div className="account-center-frame">
          <div className="account-frame-glow" aria-hidden="true" />
          <header className="account-center-head">
            <div className="account-center-title">
              <span>ACCOUNT CENTER</span>
              <h1>用户中心</h1>
            </div>
            {isModal && (
              <button
                type="button"
                className="account-modal-close"
                onClick={onClose}
                aria-label="关闭用户中心"
              >
                关闭
              </button>
            )}
          </header>

          {message && <div className={`model-message ${messageTone}`}>{message}</div>}

          {!backendAvailable && !loading && (
            <div className="model-message error">服务暂不可用，请稍后重试。</div>
          )}

          {connected && (
            <div className="account-center-grid">
              <section className="account-panel account-profile-panel">
                <div className="account-avatar">{avatarLetter(displayUsername)}</div>
                <div className="account-profile-copy">
                  <span>当前账号</span>
                  <strong>{displayUsername}</strong>
                  <em>{displayGroup}</em>
                </div>
                <button type="button" className="account-ghost-btn" onClick={logout} disabled={!backendAvailable || Boolean(busyAction)}>
                  退出登录
                </button>
              </section>

              <AccountAccessPanel
                hasDefaultKey={hasDefaultKey}
                hasRelay={hasRelay}
                hasGroup={hasGroup}
              />

              <section className="account-panel account-key-bind-panel">
                <div className="account-panel-head">
                  <span className="account-icon"><IKey size={16} /></span>
                  <div>
                    <span>模型调用密钥</span>
                    <strong>{hasDefaultKey ? `已绑定 ${defaultKeyPreview}` : '绑定完整 sk-key'}</strong>
                  </div>
                </div>
                <form className="account-redeem-form account-key-form" onSubmit={saveDefaultKey}>
                  <input
                    type="password"
                    value={apiKeyInput}
                    placeholder="粘贴完整 API Key"
                    autoComplete="off"
                    disabled={!backendAvailable || busyAction === 'default-key'}
                    onChange={(event) => setApiKeyInput(event.target.value)}
                  />
                  <button
                    type="submit"
                    className="account-primary-btn"
                    disabled={!backendAvailable || !apiKeyInput.trim() || Boolean(busyAction)}
                  >
                    {busyAction === 'default-key' ? '验证中...' : '绑定'}
                  </button>
                </form>
              </section>

              <AccountBalancePanel
                quota={totalQuota}
                backendAvailable={backendAvailable}
                busyAction={busyAction}
                onRefresh={refreshAccount}
                onOpenBilling={openConsumptionDialog}
                onOpenUsageLogs={openUsageLogDialog}
              />

              <section className="account-panel account-redeem-panel">
                <div className="account-panel-head">
                  <span className="account-icon"><IArrow size={16} /></span>
                  <div>
                    <span>兑换码充值</span>
                    <strong>输入兑换码补充余额</strong>
                  </div>
                </div>
                <form className="account-redeem-form" onSubmit={redeem}>
                  <input
                    value={redeemCode}
                    placeholder="输入兑换码"
                    disabled={!backendAvailable || busyAction === 'redeem'}
                    onChange={(event) => setRedeemCode(event.target.value)}
                  />
                  <button
                    type="submit"
                    className="account-primary-btn"
                    disabled={!backendAvailable || !redeemCode.trim() || Boolean(busyAction)}
                  >
                    {busyAction === 'redeem' ? '提交中...' : '兑换'}
                  </button>
                </form>
              </section>

              <AccountPurchasePanel />
            </div>
          )}
        </div>
      </div>
      <AccountConsumptionDialog
        open={consumptionDialogOpen}
        summary={consumption.summary}
        items={consumption.items}
        loading={consumptionLoading}
        backendAvailable={backendAvailable}
        busyAction={busyAction}
        startDate={billStartDate}
        endDate={billEndDate}
        onClose={() => setConsumptionDialogOpen(false)}
        onRefresh={() => loadConsumption(currentBillQuery())}
        onSearch={searchConsumptionBill}
        onReset={resetConsumptionBill}
        onStartDateChange={setBillStartDate}
        onEndDateChange={setBillEndDate}
      />
      <AccountUsageLogDialog
        open={usageLogDialogOpen}
        summary={usageLogs.summary}
        items={usageLogs.items}
        loading={usageLogsLoading}
        backendAvailable={backendAvailable}
        busyAction={busyAction}
        startDate={usageStartDate}
        endDate={usageEndDate}
        taskId={usageTaskId}
        channelId={usageChannelId}
        status={usageStatus}
        onClose={() => setUsageLogDialogOpen(false)}
        onRefresh={() => loadUsageLogs(currentUsageQuery())}
        onSearch={searchUsageLogs}
        onReset={resetUsageLogs}
        onStartDateChange={setUsageStartDate}
        onEndDateChange={setUsageEndDate}
        onTaskIdChange={setUsageTaskId}
        onChannelIdChange={setUsageChannelId}
        onStatusChange={setUsageStatus}
      />
    </section>
  );
}
