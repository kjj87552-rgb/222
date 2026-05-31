import React from 'react';
import { IArrow, ICheck, IClose } from '../../../shared/ui/icons/index.jsx';
import { AUTO_UPDATE_STATUS_EVENT } from '../../../shared/platform/autoUpdateStatus.js';

const VISIBLE_STATES = new Set(['checking', 'available', 'downloading', 'downloaded', 'not-available', 'error']);

function clampProgress(value, fallback = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function updateErrorMessage(message) {
  const raw = String(message || '').trim();
  const lower = raw.toLowerCase();
  if (
    lower.includes('githubprovider') ||
    lower.includes('github') ||
    lower.includes('err_connection') ||
    lower.includes('timed_out') ||
    lower.includes('etimedout') ||
    lower.includes('econnreset') ||
    lower.includes('enotfound') ||
    lower.includes('eai_again') ||
    lower.includes('<?xml') ||
    lower.includes('<feed')
  ) {
    return '暂时无法连接更新服务。请稍后重试，或使用侧边栏“检测更新”再次检查。';
  }
  const firstLine = raw
    .replace(/^Error:\s*/i, '')
    .split(/\r?\n|\sat\s+/)[0]
    .trim();
  if (!firstLine) return '暂时无法连接更新服务。';
  return firstLine.length > 180 ? `${firstLine.slice(0, 180)}...` : firstLine;
}

function updateCopy(status) {
  if (status?.state === 'checking') {
    return {
      title: '正在检查更新',
      line: '正在连接更新服务，请稍候。',
    };
  }
  if (status?.state === 'downloaded') {
    return {
      title: '更新已下载',
      line: '重启应用后会自动完成安装。',
    };
  }
  if (status?.state === 'not-available') {
    return {
      title: '当前已是最新版本',
      line: status.version ? `当前版本 ${status.version} 已是最新版本。` : '暂未发现可用新版本。',
    };
  }
  if (status?.state === 'error') {
    return {
      title: '更新检查失败',
      line: updateErrorMessage(status.message),
    };
  }
  return {
    title: '发现新版本',
    line: '已开始下载更新，下载完成后即可立即更新。',
  };
}

function formatReleaseDate(value) {
  const text = String(value || '').trim();
  if (!text) return '未知日期';
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '未知日期';
  return date.toISOString().slice(0, 10);
}

function formatBytes(value) {
  const size = Number(value);
  if (!Number.isFinite(size) || size <= 0) return '未知大小';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function releaseNotesText(value) {
  const text = String(value || '').trim();
  if (!text) return '此版本没有填写更新说明。';
  return text.length > 240 ? `${text.slice(0, 240)}...` : text;
}

function historySourceText(source) {
  if (source === 'github') return '历史版本来自 GitHub Releases。';
  if (source === 'rainyun') return '历史版本来自雨云更新源。';
  return '历史版本来自更新服务。';
}

export function AutoUpdateModal({ updateApi }) {
  const api = updateApi || (typeof window !== 'undefined' ? window.libai?.update : null);
  const [status, setStatus] = React.useState(null);
  const [installing, setInstalling] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('status');
  const [historyState, setHistoryState] = React.useState({
    loading: false,
    loaded: false,
    releases: [],
    message: '',
    source: '',
  });
  const dismissedStageRef = React.useRef(null);

  const applyStatus = React.useCallback((payload) => {
    const state = String(payload?.state || '');
    if (!VISIBLE_STATES.has(state)) return;
    if (state === 'checking') {
      if (payload?.manual !== true) return;
      dismissedStageRef.current = null;
      setStatus((current) => ({ ...(current || {}), ...payload, state }));
      return;
    }
    if (state === 'not-available') {
      dismissedStageRef.current = null;
      if (payload?.manual === true) {
        setStatus((current) => ({ ...(current || {}), ...payload, state }));
        return;
      }
      setStatus(null);
      return;
    }
    if (state === 'error') {
      dismissedStageRef.current = null;
      setStatus((current) => {
        if (payload?.manual !== true && !current) return current;
        return {
          ...(current || {}),
          ...payload,
          state,
          message: updateErrorMessage(payload?.message),
        };
      });
      return;
    }
    if ((state === 'available' || state === 'downloading') && dismissedStageRef.current === 'download') {
      return;
    }
    if (state === 'downloaded') {
      if (dismissedStageRef.current === 'install') return;
      dismissedStageRef.current = null;
    }
    setStatus((current) => ({ ...(current || {}), ...payload, state }));
  }, []);

  const loadHistory = React.useCallback(async (options = {}) => {
    if (historyState.loading) return;
    if (historyState.loaded && !options.force) return;
    if (typeof api?.history !== 'function') {
      setHistoryState({
        loading: false,
        loaded: true,
        releases: [],
        message: '当前运行环境没有历史版本服务，请安装正式桌面版后重试。',
        source: '',
      });
      return;
    }
    setHistoryState((current) => ({ ...current, loading: true, message: '' }));
    try {
      const result = await api.history();
      setHistoryState({
        loading: false,
        loaded: true,
        releases: Array.isArray(result?.releases) ? result.releases : [],
        message: result?.ok === false ? (result.message || '历史版本获取失败，请稍后重试。') : '',
        source: typeof result?.source === 'string' ? result.source : '',
      });
    } catch (error) {
      setHistoryState({
        loading: false,
        loaded: true,
        releases: [],
        message: error?.message || '历史版本获取失败，请稍后重试。',
        source: '',
      });
    }
  }, [api, historyState.loaded, historyState.loading]);

  React.useEffect(() => {
    const cleanups = [];
    if (api?.onStatus) {
      cleanups.push(api.onStatus(applyStatus));
    }
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handleLocalStatus = (event) => applyStatus(event.detail);
      window.addEventListener(AUTO_UPDATE_STATUS_EVENT, handleLocalStatus);
      cleanups.push(() => window.removeEventListener(AUTO_UPDATE_STATUS_EVENT, handleLocalStatus));
    }
    return () => {
      cleanups.forEach((cleanup) => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, [api, applyStatus]);

  if (!status) return null;

  const isDownloaded = status.state === 'downloaded';
  const isError = status.state === 'error';
  const isChecking = status.state === 'checking';
  const isLatest = status.state === 'not-available';
  const isInProgress = status.state === 'available' || status.state === 'downloading';
  const showProgress = isDownloaded || isInProgress;
  const percent = isDownloaded ? 100 : clampProgress(status.percent, status.state === 'available' ? 1 : 0);
  const copy = updateCopy(status);
  const version = isChecking ? '更新检查' : status.version ? `版本 ${status.version}` : '新版本';
  const historyVisible = activeTab === 'history';

  function postponeUpdate() {
    dismissedStageRef.current = isDownloaded ? 'install' : 'download';
    setStatus(null);
  }

  async function installNow() {
    if (!api?.install || installing) return;
    setInstalling(true);
    try {
      await api.install();
    } catch (error) {
      setStatus({
        state: 'error',
        message: error?.message || '安装更新失败',
      });
      setInstalling(false);
    }
  }

  function openHistoryTab() {
    setActiveTab('history');
    loadHistory();
  }

  function openStatusTab() {
    setActiveTab('status');
  }

  function downloadRelease(release) {
    const url = release?.installer?.downloadUrl || release?.pageUrl || '';
    if (!url) return;
    const bridge = window?.libai?.system?.openExternal;
    if (typeof bridge === 'function') {
      Promise.resolve(bridge(url)).catch(() => {
        window?.open?.(url, '_blank', 'noopener,noreferrer');
      });
      return;
    }
    window?.open?.(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="x-modal-mask auto-update-mask">
      <section className="x-modal auto-update-modal" role="dialog" aria-modal="true" aria-label="软件更新">
        <header>
          <span className={`auto-update-badge ${isError ? 'error' : isDownloaded ? 'done' : ''}`}>
            {isError ? <IClose size={14}/> : isDownloaded ? <ICheck size={14}/> : <IArrow size={14}/>}
          </span>
          <h2>软件更新</h2>
          {isError && (
            <button className="close" type="button" onClick={() => setStatus(null)} aria-label="关闭更新提示">
              <IClose size={16}/>
            </button>
          )}
        </header>
        <div className="auto-update-tabs" role="tablist" aria-label="软件更新内容">
          <button
            type="button"
            className={activeTab === 'status' ? 'active' : ''}
            role="tab"
            aria-selected={activeTab === 'status'}
            onClick={openStatusTab}
          >
            更新状态
          </button>
          <button
            type="button"
            className={historyVisible ? 'active' : ''}
            role="tab"
            aria-selected={historyVisible}
            onClick={openHistoryTab}
          >
            历史版本
          </button>
        </div>
        <div className="body auto-update-body">
          {!historyVisible ? (
            <>
              <div className="auto-update-summary">
                <strong>{copy.title}</strong>
                <span>{version}</span>
                <span>{copy.line}</span>
              </div>
              {showProgress && (
                <div className="auto-update-progress-wrap">
                  <progress className="auto-update-progress" value={percent} max="100"/>
                  <span>{percent}%</span>
                </div>
              )}
            </>
          ) : (
            <div className="auto-update-history">
              {historyState.loading && (
                <div className="auto-update-history-empty">
                  <strong>正在获取历史版本</strong>
                  <span>正在连接更新服务。</span>
                </div>
              )}
              {!historyState.loading && historyState.message && (
                <div className="auto-update-history-empty error">
                  <strong>历史版本获取失败</strong>
                  <span>{historyState.message}</span>
                </div>
              )}
              {!historyState.loading && !historyState.message && historyState.loaded && historyState.releases.length === 0 && (
                <div className="auto-update-history-empty">
                  <strong>暂无历史版本</strong>
                  <span>当前发布仓库没有可下载的 Windows 安装包。</span>
                </div>
              )}
              {!historyState.loading && historyState.releases.map((release) => (
                <article className="auto-update-release" key={release.tagName || release.version}>
                  <div className="auto-update-release-head">
                    <div>
                      <strong>{release.version}</strong>
                      <span>{formatReleaseDate(release.publishedAt)}{release.prerelease ? ' · 预发布' : ''}</span>
                    </div>
                    <button type="button" className="x-btn primary" onClick={() => downloadRelease(release)}>
                      下载安装包
                    </button>
                  </div>
                  <p>{releaseNotesText(release.notes)}</p>
                  <footer>
                    <span>{release.installer?.name || 'Windows 安装包'}</span>
                    <span>{formatBytes(release.installer?.size)}</span>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="footer">
          <span className="x-credit">
            {historyVisible
              ? historySourceText(historyState.source)
              : isDownloaded
                ? '安装前请保存当前项目。'
                : isError
                  ? '本次不会影响当前使用。'
                  : isChecking
                    ? '检查期间可继续使用软件。'
                    : isLatest
                      ? '本次无需安装。'
                      : '下载期间可继续使用软件。'}
          </span>
          <span style={{ flex: 1 }}/>
          {historyVisible && (
            <>
              <button className="x-btn ghost" type="button" onClick={() => loadHistory({ force: true })} disabled={historyState.loading}>
                {historyState.loading ? '刷新中' : '刷新'}
              </button>
              <button className="x-btn ghost" type="button" onClick={() => setStatus(null)}>关闭</button>
            </>
          )}
          {!historyVisible && (isDownloaded || isInProgress) && (
            <>
              <button className="x-btn ghost" type="button" onClick={postponeUpdate}>稍后</button>
              {isDownloaded ? (
                <button className="x-btn primary" type="button" onClick={installNow} disabled={installing}>
                  <ICheck size={12}/>{installing ? '正在重启' : '立即更新'}
                </button>
              ) : (
                <button className="x-btn primary" type="button" disabled title="下载完成后即可立即更新">
                  <IArrow size={12}/>立即更新
                </button>
              )}
            </>
          )}
          {!historyVisible && isError && (
            <button className="x-btn ghost" type="button" onClick={() => setStatus(null)}>关闭</button>
          )}
          {!historyVisible && (isChecking || isLatest) && (
            <button className="x-btn ghost" type="button" onClick={() => setStatus(null)}>关闭</button>
          )}
        </div>
      </section>
    </div>
  );
}
