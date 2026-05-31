import React from 'react';
import { createPortal } from 'react-dom';
import {
  IBell,
  IClose,
  IImage,
  IVideo,
} from '../../shared/ui/icons/index.jsx';
import { useNodesById, useProject } from '../../shared/store/canvasStore.js';
import { uiActions } from '../../shared/store/uiStore.js';
import { JobStore } from '../../shared/platform/jobStore.js';

const TASK_TABS = [
  ['image', '图片'],
  ['video', '视频'],
];

const LIVE_STATUSES = new Set(['queued', 'running']);
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'canceled']);

function compactString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function truncateText(value, max = 34) {
  const text = compactString(value);
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  return `${chars.slice(0, max).join('')}...`;
}

function jobProjectId(job) {
  return String(job?.projectId || job?.project_id || job?.input?.projectId || job?.input?.project_id || '');
}

function jobKind(job) {
  const input = job?.input || {};
  const output = job?.output || {};
  const explicit = String(
    job?.kind
    || job?.mediaKind
    || input.kind
    || input.mediaKind
    || output.kind
    || output.mediaKind
    || '',
  ).toLowerCase();
  if (explicit === 'image' || explicit === 'video') return explicit;
  const type = String(job?.type || input.type || input.tab || '').toLowerCase();
  if (type.includes('video')) return 'video';
  if (type.includes('image') || type.includes('upscale')) return 'image';
  return '';
}

function isVisibleTask(job, projectId) {
  if (!job?.id) return false;
  if (projectId && jobProjectId(job) !== String(projectId)) return false;
  return jobKind(job) === 'image' || jobKind(job) === 'video';
}

function normalizeJobsPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.jobs)) return payload.jobs;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function jobTime(job) {
  const raw = job?.updatedAt || job?.createdAt || '';
  if (!raw) return '刚刚';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
}

function statusLabel(status) {
  const normalized = String(status || '').toLowerCase();
  return {
    queued: '排队中',
    running: '生成中',
    completed: '已完成',
    failed: '失败',
    canceled: '已取消',
    cancelled: '已取消',
  }[normalized] || '已记录';
}

function progressOf(job) {
  const status = String(job?.status || '').toLowerCase();
  const progress = Number(job?.progress);
  if (Number.isFinite(progress)) return Math.max(0, Math.min(100, progress));
  if (status === 'completed') return 100;
  return 0;
}

function jobPrompt(job) {
  const input = job?.input || {};
  const output = job?.output || {};
  return compactString(input.prompt)
    || compactString(input.positivePrompt)
    || compactString(input.text)
    || compactString(output.prompt)
    || compactString(job?.title)
    || '未命名任务';
}

function jobModel(job) {
  const input = job?.input || {};
  const output = job?.output || {};
  return compactString(input.model)
    || compactString(input.modelName)
    || compactString(input.providerModelName)
    || compactString(output.displayName)
    || compactString(output.providerModelName)
    || compactString(job?.type)
    || '默认模型';
}

function jobError(job, cancelError = '') {
  return compactString(cancelError)
    || compactString(job?.error)
    || compactString(job?.output?.error)
    || compactString(job?.output?.message)
    || '';
}

function taskErrorSummary(error) {
  if (!error) return '';
  return `错误：${truncateText(error, 34)}`;
}

function taskKindLabel(kind) {
  return kind === 'video' ? '视频生成任务' : '图片生成任务';
}

function taskCardTitle(job, node) {
  const kind = jobKind(job);
  const rawTitle = compactString(node?.title);
  if (!rawTitle || rawTitle === jobPrompt(job)) return taskKindLabel(kind);
  return truncateText(rawTitle, 22);
}

function taskPromptSummary(job) {
  const prompt = jobPrompt(job);
  if (!prompt || prompt === '未命名任务') return '未填写提示词';
  return `提示词：${truncateText(prompt, 28)}`;
}

function sortJobs(jobs) {
  return [...jobs].sort((a, b) => {
    const aLive = LIVE_STATUSES.has(String(a?.status || '').toLowerCase()) ? 1 : 0;
    const bLive = LIVE_STATUSES.has(String(b?.status || '').toLowerCase()) ? 1 : 0;
    if (aLive !== bLive) return bLive - aLive;
    const at = Date.parse(a?.updatedAt || a?.createdAt || '') || 0;
    const bt = Date.parse(b?.updatedAt || b?.createdAt || '') || 0;
    return bt - at;
  });
}

function upsertJob(jobs, job) {
  if (!job?.id) return jobs;
  const next = jobs.filter((item) => item.id !== job.id);
  next.unshift(job);
  return sortJobs(next);
}

function TaskIcon({ kind, size = 15 }) {
  const Icon = kind === 'video' ? IVideo : IImage;
  return <Icon size={size} />;
}

function TaskCard({
  job,
  node,
  cancelError,
  canceling,
  onFocus,
  onCancel,
  onDetails,
}) {
  const kind = jobKind(job);
  const status = String(job?.status || '').toLowerCase();
  const progress = progressOf(job);
  const error = jobError(job, cancelError);
  const canCancel = LIVE_STATUSES.has(status);
  const isDone = TERMINAL_STATUSES.has(status);
  const title = taskCardTitle(job, node);

  const focus = () => onFocus(job);
  const onKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    focus();
  };

  return (
    <div
      className="rail-task-card"
      data-status={status || 'unknown'}
      role="button"
      tabIndex={0}
      onClick={focus}
      onKeyDown={onKeyDown}
      title="点击定位节点"
    >
      <div className="rail-task-card-top">
        <span className="rail-task-icon"><TaskIcon kind={kind} /></span>
        <span className="rail-task-title">{title}</span>
        <span className="rail-task-status">{statusLabel(status)}</span>
      </div>
      <div className="rail-task-prompt">{taskPromptSummary(job)}</div>
      <div className="rail-task-meta">
        <span>{jobModel(job)}</span>
        <span>{jobTime(job)}</span>
      </div>
      <div className="rail-task-progress" aria-label={`任务进度 ${progress}%`}>
        <i style={{ width: `${progress}%` }} />
      </div>
      {error && <div className="rail-task-error">{taskErrorSummary(error)}</div>}
      <div className="rail-task-actions">
        <span>{node ? `节点 ${node.id}` : '节点已不在画布'}</span>
        <button
          type="button"
          className="rail-task-detail-button"
          onClick={(event) => {
            event.stopPropagation();
            onDetails(job);
          }}
        >
          详情
        </button>
        {canCancel && (
          <button
            type="button"
            className="rail-task-cancel-button"
            onClick={(event) => {
              event.stopPropagation();
              onCancel(job);
            }}
            disabled={canceling}
          >
            <IClose size={12} />{canceling ? '取消中' : '取消'}
          </button>
        )}
        {isDone && <em>{progress}%</em>}
      </div>
    </div>
  );
}

function TaskDetailModal({ job, node, cancelError, onClose }) {
  if (!job) return null;
  const kind = jobKind(job);
  const status = String(job?.status || '').toLowerCase();
  const error = jobError(job, cancelError);
  const prompt = jobPrompt(job);

  const modal = (
    <div className="modal-mask rail-task-detail-mask" role="presentation" onClick={onClose}>
      <div
        className="modal rail-task-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label="任务详情"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h2>任务详情</h2>
          <button type="button" className="close" onClick={onClose} aria-label="关闭任务详情">
            <IClose size={14} />
          </button>
        </header>
        <div className="body rail-task-detail-body">
          <div className="rail-task-detail-grid">
            <span>类型</span><strong>{taskKindLabel(kind)}</strong>
            <span>状态</span><strong>{statusLabel(status)}</strong>
            <span>进度</span><strong>{progressOf(job)}%</strong>
            <span>模型</span><strong>{jobModel(job)}</strong>
            <span>时间</span><strong>{jobTime(job)}</strong>
            <span>节点</span><strong>{node ? `${node.title || node.id} / ${node.id}` : '节点已不在画布'}</strong>
          </div>
          <section className="rail-task-detail-section">
            <h3>提示词</h3>
            <p>{prompt}</p>
          </section>
          {error && (
            <section className="rail-task-detail-section error">
              <h3>错误信息</h3>
              <p>{error}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined' || !document.body) return modal;
  return createPortal(modal, document.body);
}

export function TaskQueuePanel({ onClose, onFocusNode }) {
  const project = useProject();
  const nodesById = useNodesById();
  const projectId = project?.id || '';
  const [activeTab, setActiveTab] = React.useState('image');
  const [jobs, setJobs] = React.useState([]);
  const [loadState, setLoadState] = React.useState('idle');
  const [loadError, setLoadError] = React.useState('');
  const [cancelingId, setCancelingId] = React.useState('');
  const [cancelErrors, setCancelErrors] = React.useState({});
  const [detailJobId, setDetailJobId] = React.useState('');

  React.useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    setLoadState('loading');
    setLoadError('');
    JobStore.list({ projectId, limit: 120 })
      .then((payload) => {
        if (cancelled) return;
        const nextJobs = normalizeJobsPayload(payload).filter((job) => isVisibleTask(job, projectId));
        setJobs(sortJobs(nextJobs));
        setLoadState('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadState('failed');
        setLoadError(error instanceof Error ? error.message : String(error || '任务读取失败'));
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  React.useEffect(() => {
    if (!projectId) return undefined;
    return JobStore.onEvent((event) => {
      const job = event?.job;
      if (!isVisibleTask(job, projectId)) return;
      setJobs((current) => upsertJob(current, job));
    });
  }, [projectId]);

  const counts = React.useMemo(() => {
    const next = { image: 0, video: 0 };
    jobs.forEach((job) => {
      const kind = jobKind(job);
      if (next[kind] !== undefined) next[kind] += 1;
    });
    return next;
  }, [jobs]);

  const visibleJobs = React.useMemo(() => (
    jobs.filter((job) => jobKind(job) === activeTab).slice(0, 80)
  ), [activeTab, jobs]);

  const detailJob = React.useMemo(() => (
    jobs.find((job) => job.id === detailJobId) || null
  ), [detailJobId, jobs]);

  const focusJob = React.useCallback((job) => {
    if (!job?.nodeId) return;
    uiActions.setSelection([job.nodeId]);
    onFocusNode?.(job.nodeId);
  }, [onFocusNode]);

  const cancelJob = React.useCallback(async (job) => {
    if (!job?.id) return;
    setCancelingId(job.id);
    setCancelErrors((current) => ({ ...current, [job.id]: '' }));
    try {
      const updated = await JobStore.cancel(job.id);
      setJobs((current) => upsertJob(current, updated || { ...job, status: 'canceled' }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || '取消失败');
      setCancelErrors((current) => ({ ...current, [job.id]: `取消失败：${message}` }));
    } finally {
      setCancelingId('');
    }
  }, []);

  return (
    <div className="rail-task-queue-panel">
      <div className="rail-task-head">
        <div>
          <strong>任务队列</strong>
          <span>{project?.name || '当前画布'}</span>
        </div>
        <button type="button" onClick={onClose} title="关闭">
          <IClose size={13} />
        </button>
      </div>

      <div className="rail-task-tabs">
        {TASK_TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeTab === key ? 'active' : ''}
            onClick={() => setActiveTab(key)}
          >
            {label} {counts[key] || 0}
          </button>
        ))}
      </div>

      <div className="rail-task-list">
        {loadState === 'loading' && !visibleJobs.length ? (
          <div className="rail-task-empty">
            <IBell size={18} />
            <span>任务加载中</span>
          </div>
        ) : loadState === 'failed' && !visibleJobs.length ? (
          <div className="rail-task-empty error">
            <IBell size={18} />
            <span>任务队列暂时不可用</span>
            {loadError && <small>{loadError}</small>}
          </div>
        ) : visibleJobs.length ? visibleJobs.map((job) => (
          <TaskCard
            key={job.id}
            job={job}
            node={nodesById.get(job.nodeId)}
            cancelError={cancelErrors[job.id]}
            canceling={cancelingId === job.id}
            onFocus={focusJob}
            onCancel={cancelJob}
            onDetails={(selectedJob) => setDetailJobId(selectedJob.id)}
          />
        )) : (
          <div className="rail-task-empty">
            <TaskIcon kind={activeTab} size={18} />
            <span>{activeTab === 'image' ? '暂无图片任务' : '暂无视频任务'}</span>
          </div>
        )}
      </div>
      <TaskDetailModal
        job={detailJob}
        node={detailJob ? nodesById.get(detailJob.nodeId) : null}
        cancelError={detailJob ? cancelErrors[detailJob.id] : ''}
        onClose={() => setDetailJobId('')}
      />
    </div>
  );
}
