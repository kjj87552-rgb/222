import React from 'react';
import { ProjectStore } from '../../shared/platform/projectStore.js';
import { JianyingApi } from '../../shared/platform/backendClient.js';
import { ICheck, IFolder, ISearch } from '../../shared/ui/icons/index.jsx';

export function ProjectSettingsPage({ onApplyStoragePath }) {
  const [settings, setSettings] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [messageKind, setMessageKind] = React.useState('info');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [jianyingPath, setJianyingPath] = React.useState('');
  const [jianyingStatus, setJianyingStatus] = React.useState(null);
  const [savingJianying, setSavingJianying] = React.useState(false);
  const [detectingJianying, setDetectingJianying] = React.useState(false);
  const canPickFolder = typeof window !== 'undefined' && Boolean(window.libai?.system?.pickFolder);

  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const [result, jianying] = await Promise.all([
        ProjectStore.storageSettings(),
        JianyingApi.settings().catch(() => null),
      ]);
      setSettings(result || null);
      setJianyingPath(jianying?.jianyingDraftsRoot || jianying?.jianying_drafts_root || '');
      setJianyingStatus(jianying?.status || null);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setMessageKind('error');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const applyPath = async (folderPath) => {
    const cleanPath = String(folderPath || '').trim();
    if (!cleanPath || saving) return;
    setSaving(true);
    setMessage('');
    try {
      const result = await onApplyStoragePath?.(cleanPath);
      const nextSettings = result?.settings || await ProjectStore.storageSettings();
      setSettings(nextSettings || { path: cleanPath, projectStorageDir: cleanPath });
      setMessage('项目保存位置已更新');
      setMessageKind('success');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setMessageKind('error');
    } finally {
      setSaving(false);
    }
  };

  const pickFolder = async () => {
    if (!canPickFolder) {
      setMessage('当前浏览器预览不能打开系统文件夹选择器，请在打包后的桌面应用中使用。');
      setMessageKind('error');
      return;
    }
    setMessage('');
    const picked = await window.libai.system.pickFolder();
    if (!picked?.path) return;
    await applyPath(picked.path);
  };

  const pickJianyingFolder = async () => {
    if (!canPickFolder) {
      setMessage('当前浏览器预览不能打开系统文件夹选择器，请在桌面应用中使用或手动填写路径。');
      setMessageKind('error');
      return;
    }
    const picked = await window.libai.system.pickFolder();
    if (picked?.path) setJianyingPath(picked.path);
  };

  const detectJianyingFolder = async () => {
    setDetectingJianying(true);
    setMessage('');
    try {
      const result = await JianyingApi.autoDetect();
      if (result?.found && result.path) {
        setJianyingPath(result.path);
        setJianyingStatus(result.status || null);
        setMessage('已自动识别剪映草稿路径，请保存后生效');
        setMessageKind('success');
      } else {
        setMessage('未自动找到剪映草稿路径，请手动选择或填写。');
        setMessageKind('error');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setMessageKind('error');
    } finally {
      setDetectingJianying(false);
    }
  };

  const saveJianyingFolder = async () => {
    const cleanPath = String(jianyingPath || '').trim();
    if (!cleanPath || savingJianying) return;
    setSavingJianying(true);
    setMessage('');
    try {
      const result = await JianyingApi.saveSettings(cleanPath);
      setJianyingPath(result?.jianyingDraftsRoot || cleanPath);
      setJianyingStatus(result?.status || null);
      setMessage('剪映草稿路径已保存');
      setMessageKind('success');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setMessageKind('error');
    } finally {
      setSavingJianying(false);
    }
  };

  const currentPath = settings?.path || settings?.projectStorageDir || '';
  const jianyingReady = Boolean(jianyingStatus?.valid && jianyingStatus?.writable);

  return (
    <section className="home-page settings-page">
      <div className="settings-shell">
        <header className="settings-head">
          <h1>本地路径设置</h1>
        </header>

        {message && <div className={`model-message ${messageKind}`}>{message}</div>}

        <article className="settings-storage-card">
          <div className="settings-folder-mark" aria-hidden="true">
            <IFolder size={34} />
          </div>
          <div className="settings-storage-main">
            <span className="settings-label">当前目录</span>
            <p title={currentPath || ''}>
              {loading ? '正在读取目录...' : currentPath || '尚未读取到项目目录'}
            </p>
          </div>
          <button type="button" className="settings-folder-button" onClick={pickFolder} disabled={saving || loading}>
            <IFolder size={18} />
            <span>{saving ? '保存中...' : '添加本地文件夹'}</span>
          </button>
        </article>

        <article className="settings-storage-card">
          <div className="settings-folder-mark" aria-hidden="true">
            <IFolder size={34} />
          </div>
          <div className="settings-storage-main">
            <span className="settings-label">剪映草稿路径</span>
            <input
              type="text"
              value={jianyingPath}
              onChange={(event) => setJianyingPath(event.target.value)}
              placeholder="C:\\Users\\用户名\\JianyingPro Drafts"
              disabled={loading || savingJianying}
              className="settings-path-input"
            />
            <small className={jianyingReady ? 'settings-path-ok' : 'settings-path-warn'}>
              {loading
                ? '正在读取路径...'
                : jianyingReady
                  ? '路径有效，可写入剪映草稿'
                  : '需要选择剪映专业版的草稿根目录'}
            </small>
          </div>
          <div className="settings-actions">
            <button type="button" className="settings-folder-button ghost" onClick={detectJianyingFolder} disabled={detectingJianying || loading}>
              <ISearch size={18} />
              <span>{detectingJianying ? '识别中...' : '自动识别'}</span>
            </button>
            <button type="button" className="settings-folder-button ghost" onClick={pickJianyingFolder} disabled={loading || savingJianying}>
              <IFolder size={18} />
              <span>手动选择</span>
            </button>
            <button type="button" className="settings-folder-button" onClick={saveJianyingFolder} disabled={savingJianying || loading || !jianyingPath.trim()}>
              <ICheck size={18} />
              <span>{savingJianying ? '保存中...' : '保存路径'}</span>
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
