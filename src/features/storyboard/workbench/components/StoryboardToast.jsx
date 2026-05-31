import React from 'react';

/* Floating progress toast — driven by orchestrator's onProgress callbacks.
 * Phase 2A scope: single-toast queue (showing the most recent task only).
 * Phase 2B may upgrade to multi-toast stack. */
export function StoryboardToast({ task, onCancel, onDismiss }) {
  if (!task) return null;
  const { stage, progress, error } = task;
  const isError = !!error;
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));

  return (
    <div className={`sb-toast ${isError ? 'error' : ''}`} role="status">
      <div className="stage">
        <span
          className="sb-progress-ring toast-ring"
          style={{ '--progress': isError ? '360deg' : `${safeProgress * 3.6}deg` }}
          aria-hidden="true"
        >
          <em>{isError ? '!' : `${safeProgress}%`}</em>
        </span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isError ? `错误：${error}` : (stage || '处理中…')}
        </span>
      </div>
      <div className="actions">
        {isError ? (
          <button onClick={onDismiss} type="button">关闭</button>
        ) : (
          <button onClick={onCancel} type="button">取消</button>
        )}
      </div>
    </div>
  );
}
