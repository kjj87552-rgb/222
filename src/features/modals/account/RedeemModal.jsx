import React from 'react';
import { ISparkle, IArrow } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { NewApiStore } from '../../../shared/platform/newApiStore.js';
import { accountActions, useAccountConnected, useAccountQuota, formatQuota } from '../../../shared/store/accountStore.js';

export function RedeemModal() {
  const onClose = uiActions.closeOverlayModal;
  const connected = useAccountConnected();
  const quota = useAccountQuota();
  const [code, setCode] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [tone, setTone] = React.useState('info'); // 'info' | 'success' | 'error'

  const submit = async (event) => {
    event?.preventDefault?.();
    const trimmed = code.trim();
    if (!trimmed) {
      setMessage('请输入兑换码。');
      setTone('error');
      return;
    }
    if (!connected) {
      setMessage('未登录中转站账号，请先在用户中心登录后再充值。');
      setTone('error');
      return;
    }
    setBusy(true);
    setMessage('正在兑换...');
    setTone('info');
    try {
      const result = await NewApiStore.redeem({ code: trimmed });
      const added = Number(result?.addedQuota || result?.added_quota || 0);
      setMessage(added ? `兑换成功，新增 ${added.toLocaleString()} 算力。` : '兑换成功。');
      setTone('success');
      setCode('');
      await accountActions.refresh();
    } catch (error) {
      setMessage(`兑换失败：${error instanceof Error ? error.message : String(error)}`);
      setTone('error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <XModal
      title="充值 / 兑换码"
      icon={<ISparkle size={16}/>}
      onClose={onClose}
      className="rd-modal"
      footer={<>
        <span className="x-credit"><ISparkle size={11}/>当前余额 {connected ? formatQuota(quota) : '未登录'}</span>
        <span style={{ flex: 1 }}/>
        <button type="button" className="x-btn ghost" onClick={onClose}>关闭</button>
        <button type="button" className="x-btn primary" disabled={busy || !code.trim() || !connected} onClick={submit}>
          <IArrow size={12}/>{busy ? '兑换中' : '提交兑换'}
        </button>
      </>}
    >
      <form onSubmit={submit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="sc-field">
          <label>兑换码</label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="输入从中转站后台获取的兑换码"
            autoFocus
            disabled={busy}
          />
        </div>
        {message && (
          <div className={`model-message ${tone}`} style={{ marginBottom: 0 }}>
            {message}
          </div>
        )}
        {!connected && (
          <div style={{ color: 'var(--ink-mute)', fontSize: 12, lineHeight: 1.6 }}>
            还未登录中转站账号？关闭此弹窗后，进入"用户中心"用账号登录，登录成功后再回来充值。
          </div>
        )}
      </form>
    </XModal>
  );
}
