import React from 'react';
import {
  groupPromptInferenceQueueItems,
  summarizePromptInferenceQueue,
} from '../../promptInferenceQueue.js';

const STATUS_LABELS = {
  completed: '完成',
  running: '运行',
  queued: '排队',
  pending: '等待',
  failed: '失败',
  canceled: '取消',
};

const STATUS_ORDER = ['completed', 'running', 'queued', 'pending', 'failed', 'canceled'];

function itemTitle(item) {
  return item.title || item.stage || item.error || '提示词任务';
}

export function PromptInferenceQueueModal({
  open,
  shotGroups = [],
  task = null,
  onClose,
  onStopQueue,
  onCancelRunning,
  onCancelTask,
}) {
  const summary = React.useMemo(
    () => summarizePromptInferenceQueue(shotGroups, { task }),
    [shotGroups, task],
  );
  const taskGroups = React.useMemo(
    () => groupPromptInferenceQueueItems(summary.items),
    [summary.items],
  );

  if (!open) return null;

  const canStop = summary.items.some((item) => item.status === 'pending' || item.status === 'queued');
  const canCancelRunning = summary.activeJobIds.length > 0;

  return (
    <div className="sb-queue-modal-backdrop" role="presentation" onClick={() => onClose?.()}>
      <section
        className="sb-queue-modal"
        role="dialog"
        aria-modal="true"
        aria-label="提示词推理队列"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sb-queue-modal-head">
          <div>
            <strong>提示词推理队列</strong>
            <span>{summary.queueId || '未绑定队列'}{summary.queueLabel ? ` · ${summary.queueLabel}` : ''}</span>
          </div>
          <button type="button" className="sb-queue-modal-close" onClick={() => onClose?.()}>关闭</button>
        </header>

        <div className="sb-queue-modal-stats">
          {STATUS_ORDER.map((status) => (
            <span key={status} className={`sb-queue-stat ${status}`}>
              {STATUS_LABELS[status]} {summary.counts[status] || 0}
            </span>
          ))}
        </div>

        <div className="sb-queue-modal-actions">
          <button
            type="button"
            className="sb-tool-btn warning"
            disabled={!canStop}
            onClick={() => onStopQueue?.(summary)}
          >
            停止队列
          </button>
          <button
            type="button"
            className="sb-tool-btn"
            disabled={!canCancelRunning}
            onClick={() => onCancelRunning?.(summary)}
          >
            取消运行中
          </button>
        </div>

        <div className="sb-queue-modal-list">
          {taskGroups.map((taskGroup) => (
            <section key={taskGroup.id} className="sb-queue-task">
              <header className="sb-queue-task-head">
                <div>
                  <strong>{taskGroup.label}</strong>
                  <span>{taskGroup.rangeLabel || '未绑定分组'}</span>
                </div>
                <button
                  type="button"
                  className="sb-tool-btn danger"
                  disabled={!taskGroup.cancelable}
                  aria-label={`取消${taskGroup.label}`}
                  onClick={() => onCancelTask?.({
                    ...taskGroup,
                    taskLabel: taskGroup.label,
                    queueId: summary.queueId,
                    queueLabel: summary.queueLabel,
                    summary,
                  })}
                >
                  取消任务
                </button>
              </header>
              <div className="sb-queue-task-items">
                {taskGroup.items.map((item) => (
                  <article key={item.groupId} className={`sb-queue-row ${item.status}`}>
                    <div className="sb-queue-row-main">
                      <strong>{item.groupId}</strong>
                      <span>{itemTitle(item)}</span>
                    </div>
                    <div className="sb-queue-row-meta">
                      <span>{STATUS_LABELS[item.status] || item.status}</span>
                      {item.jobId ? <code>{item.jobId}</code> : null}
                      {item.error ? <em>{item.error}</em> : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
