import React from 'react';

const TASK_LABELS = {
  'novel-to-script': '小说转剧本',
  'script-formatter': '格式标准化',
  'extract-assets': '资产解析',
  'script-to-shotgroups': 'V3 分镜生成',
  'storyboard-video-reference-analyze': '视频抽帧解析',
  'storyboard-reference-analyze': '参考素材分析',
  'storyboard-text-assets-analyze': '文本资产提取',
  'shotgroup-prompts': '分镜提示词推理',
  'storyboard-package-deploy': '画布输出',
  'storyboard-shotgroup-media': '镜头组媒体生成',
};

function asTaskIds(taskIds) {
  if (Array.isArray(taskIds)) return taskIds;
  return taskIds ? [taskIds] : [];
}

const CANCEL_STAGE_MARKERS = ['已取消', '已请求取消', '取消运行中', 'canceled', 'cancelled'];

function taskQueueId(task) {
  return String(task?.queue?.queueId || task?.queueId || '').trim();
}

function taskNodeId(task) {
  return String(task?.nodeId || '').trim();
}

export function isWorkbenchTaskCanceled(task) {
  if (!task) return false;
  if (task.canceled || task.cancelled) return true;
  const text = `${task.stage || ''} ${task.error || ''}`.trim().toLowerCase();
  if (!text) return false;
  return CANCEL_STAGE_MARKERS.some((marker) => text.includes(marker.toLowerCase()));
}

export function taskLabel(taskId) {
  return TASK_LABELS[taskId] || '后台任务';
}

export function taskProgressValue(task) {
  if (isWorkbenchTaskCanceled(task)) return 100;
  return Math.max(0, Math.min(100, Number(task?.progress) || 0));
}

export function shouldReplaceWorkbenchTask(current, next) {
  if (!current || !next) return true;
  if (!isWorkbenchTaskCanceled(current)) return true;
  if (isWorkbenchTaskCanceled(next) || next.error) return true;
  if (taskProgressValue(next) >= 100) return true;
  if (current.id !== next.id) return true;

  const currentNodeId = taskNodeId(current);
  const nextNodeId = taskNodeId(next);
  if (currentNodeId && nextNodeId && currentNodeId !== nextNodeId) return true;

  const currentQueueId = taskQueueId(current);
  const nextQueueId = taskQueueId(next);
  if (currentQueueId && nextQueueId && currentQueueId !== nextQueueId) return true;

  return false;
}

export function isWorkbenchTaskActive(task, taskIds) {
  if (!task || task.error) return false;
  if (isWorkbenchTaskCanceled(task)) return false;
  const ids = asTaskIds(taskIds);
  if (ids.length && !ids.includes(task.id)) return false;
  return taskProgressValue(task) < 100;
}

export function TaskProgressBadge({ task, taskIds, className = '' }) {
  const ids = asTaskIds(taskIds);
  if (!task || (ids.length && !ids.includes(task.id))) return null;

  const progress = taskProgressValue(task);
  const isError = Boolean(task.error);
  const label = taskLabel(task.id);
  const stage = isError ? task.error : (task.stage || '处理中…');
  const queue = task.queue;
  const queueKind = queue?.kind === 'prompt' ? '提示词' : (queue?.kind === 'video' ? '视频' : '图片');
  const queueIndex = Math.max(1, Number(queue?.index) || 1);
  const queueTotal = Math.max(1, Number(queue?.total) || 1);
  const queueBatchSize = Math.max(1, Number(queue?.batchSize) || 1);
  const queueEnd = Math.min(queueTotal, queueIndex + queueBatchSize - 1);
  const queueRange = queueEnd > queueIndex
    ? `第 ${queueIndex}-${queueEnd} 组 / 共 ${queueTotal} 组`
    : `第 ${queueIndex} 组 / 共 ${queueTotal} 组`;
  const queueText = queue
    ? `${queueRange} · ${queue.groupId || '未分组'} · ${queueKind}`
    : '';
  const ringProgress = `${progress * 3.6}deg`;

  return (
    <div
      className={`sb-task-orb-status ${isError ? 'error' : ''} ${className}`.trim()}
      role="status"
      aria-live="polite"
      title={`${label} · ${stage}${queueText ? ` · ${queueText}` : ''}`}
    >
      <span
        className="sb-progress-ring"
        style={{ '--progress': isError ? '360deg' : ringProgress }}
        aria-hidden="true"
      >
        <em>{isError ? '!' : `${progress}%`}</em>
      </span>
      <span className="sb-task-orb-copy">
        <strong>{label}</strong>
        <span>{queueText ? `${stage} · ${queueText}` : stage}</span>
      </span>
    </div>
  );
}

export function TaskProgressPanel(props) {
  return <TaskProgressBadge {...props} />;
}
