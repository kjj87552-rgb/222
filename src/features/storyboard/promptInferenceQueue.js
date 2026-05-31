export const DEFAULT_PROMPT_INFERENCE_CONCURRENCY = 2;
export const DEFAULT_PROMPT_INFERENCE_BATCH_SIZE = 3;

const asArray = (value) => (Array.isArray(value) ? value : []);

const cleanText = (value) => (
  value === null || value === undefined ? '' : String(value).trim()
);

const nowTimestamp = (now) => {
  const value = typeof now === 'function' ? now() : now;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && value) return value;
  return new Date().toISOString();
};

export const PROMPT_INFERENCE_QUEUE_STATUSES = [
  'pending',
  'queued',
  'running',
  'completed',
  'failed',
  'canceled',
];

export function normalizePromptInferenceQueueStatus(value) {
  const status = cleanText(value).toLowerCase();
  if (status === 'cancelled') return 'canceled';
  return PROMPT_INFERENCE_QUEUE_STATUSES.includes(status) ? status : 'pending';
}

export const promptInferenceGroupId = (group = {}, index = 0) => (
  cleanText(group.groupId || group.shotGroupId || group.id)
  || `G${String(index + 1).padStart(3, '0')}`
);

export function promptInferenceGroupsToRun(shotGroups = [], { includeCompleted = false, groupId } = {}) {
  return asArray(shotGroups).filter((group, index) => {
    if (groupId && promptInferenceGroupId(group, index) !== groupId) return false;
    if (includeCompleted) return true;
    return cleanText(group?.promptStatus).toLowerCase() !== 'completed';
  });
}

export function initialPromptInferenceQueueItems(groups = [], {
  concurrency = DEFAULT_PROMPT_INFERENCE_CONCURRENCY,
  batchSize = DEFAULT_PROMPT_INFERENCE_BATCH_SIZE,
} = {}) {
  const limit = Math.max(1, Number(concurrency) || DEFAULT_PROMPT_INFERENCE_CONCURRENCY);
  const size = Math.max(1, Number(batchSize) || DEFAULT_PROMPT_INFERENCE_BATCH_SIZE);
  const source = asArray(groups);
  return Array.from({ length: limit })
    .map((_, batchIndex) => {
      const index = batchIndex * size;
      const batchGroups = source.slice(index, index + size);
      if (!batchGroups.length) return null;
      return {
        group: batchGroups[0],
        groups: batchGroups,
        index,
        batchSize: batchGroups.length,
      };
    })
    .filter(Boolean);
}

export function nextPromptInferenceQueueIndex({
  groupIndex = 0,
  concurrency = DEFAULT_PROMPT_INFERENCE_CONCURRENCY,
  batchSize = DEFAULT_PROMPT_INFERENCE_BATCH_SIZE,
  total = 0,
} = {}) {
  const index = Math.max(0, Number(groupIndex) || 0);
  const limit = Math.max(1, Number(concurrency) || DEFAULT_PROMPT_INFERENCE_CONCURRENCY);
  const size = Math.max(1, Number(batchSize) || DEFAULT_PROMPT_INFERENCE_BATCH_SIZE);
  const count = Math.max(0, Number(total) || 0);
  const nextIndex = index + (limit * size);
  return nextIndex < count ? nextIndex : -1;
}

export function createPromptInferenceQueueId(nodeId = 'storyboard') {
  return `prompt_queue_${cleanText(nodeId) || 'storyboard'}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function canContinuePromptInferenceQueue({
  queueMode,
  autoContinue = true,
  queueId,
  stoppedQueueIds,
} = {}) {
  const stopped = stoppedQueueIds instanceof Set
    ? stoppedQueueIds.has(cleanText(queueId))
    : false;
  return cleanText(queueMode) === 'parallel' && autoContinue !== false && !stopped;
}

export function summarizePromptInferenceQueue(shotGroups = [], { task } = {}) {
  const items = asArray(shotGroups).map((group, index) => {
    const status = normalizePromptInferenceQueueStatus(group?.promptStatus);
    const jobId = cleanText(group?.promptJobId);
    return {
      groupId: promptInferenceGroupId(group, index),
      status,
      progress: Math.max(0, Math.min(100, Number(group?.promptProgress) || 0)),
      stage: cleanText(group?.promptStage),
      error: cleanText(group?.promptError),
      jobId,
      title: cleanText(group?.title || group?.sceneRef || group?.groupNote),
    };
  });
  const counts = PROMPT_INFERENCE_QUEUE_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});
  items.forEach((item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
  });
  const activeJobIds = [...new Set(items
    .filter((item) => ['queued', 'running'].includes(item.status) && item.jobId)
    .map((item) => item.jobId))];
  const queue = task?.queue || {};
  return {
    queueId: cleanText(queue.queueId || task?.queueId),
    queueLabel: cleanText(queue.groupId),
    total: items.length,
    counts,
    activeJobIds,
    items,
    stopped: Boolean(queue.stopped || task?.stopped),
  };
}

const CANCELABLE_PROMPT_INFERENCE_STATUSES = new Set(['pending', 'queued', 'running']);

export function groupPromptInferenceQueueItems(items = [], {
  size = DEFAULT_PROMPT_INFERENCE_BATCH_SIZE,
} = {}) {
  const chunkSize = Math.max(1, Number(size) || DEFAULT_PROMPT_INFERENCE_BATCH_SIZE);
  const source = asArray(items);
  return Array.from({ length: Math.ceil(source.length / chunkSize) })
    .map((_, index) => {
      const taskItems = source.slice(index * chunkSize, (index + 1) * chunkSize);
      const groupIds = taskItems.map((item) => cleanText(item?.groupId)).filter(Boolean);
      const cancelableItems = taskItems.filter((item) => (
        CANCELABLE_PROMPT_INFERENCE_STATUSES.has(normalizePromptInferenceQueueStatus(item?.status))
      ));
      const cancelableGroupIds = cancelableItems
        .map((item) => cleanText(item?.groupId))
        .filter(Boolean);
      const jobIds = [...new Set(cancelableItems.map((item) => cleanText(item?.jobId)).filter(Boolean))];
      return {
        id: `prompt-task-${index + 1}`,
        label: `任务 ${index + 1}`,
        rangeLabel: groupIds.length > 1 ? `${groupIds[0]}-${groupIds[groupIds.length - 1]}` : (groupIds[0] || ''),
        items: taskItems,
        groupIds,
        cancelableGroupIds,
        jobIds,
        cancelable: cancelableGroupIds.length > 0,
      };
    })
    .filter((taskGroup) => taskGroup.items.length > 0);
}

export function promptInferenceQueueBatchCanceled(groupIds = [], canceledGroupIds = []) {
  const ids = asArray(groupIds).map(cleanText).filter(Boolean);
  if (!ids.length) return false;
  const canceled = canceledGroupIds instanceof Set
    ? canceledGroupIds
    : new Set(asArray(canceledGroupIds).map(cleanText).filter(Boolean));
  return ids.every((groupId) => canceled.has(groupId));
}

export function applyPromptInferenceQueueStopToGroups(shotGroups = [], { now } = {}) {
  const timestamp = nowTimestamp(now);
  return asArray(shotGroups).map((group, index) => {
    const status = normalizePromptInferenceQueueStatus(group?.promptStatus);
    if (status !== 'pending') return group;
    return {
      ...group,
      groupId: group?.groupId || promptInferenceGroupId(group, index),
      promptStatus: 'canceled',
      promptProgress: 100,
      promptStage: '队列已停止，未提交的分组已取消',
      promptError: '',
      promptUpdatedAt: timestamp,
    };
  });
}

export function applyPromptInferenceQueueCancelToGroups(shotGroups = [], {
  groupIds = [],
  now,
  message = '已取消该任务',
} = {}) {
  const ids = new Set(asArray(groupIds).map(cleanText).filter(Boolean));
  if (!ids.size) return asArray(shotGroups);
  const timestamp = nowTimestamp(now);
  return asArray(shotGroups).map((group, index) => {
    const groupId = group?.groupId || promptInferenceGroupId(group, index);
    const status = normalizePromptInferenceQueueStatus(group?.promptStatus);
    if (!ids.has(groupId) || !CANCELABLE_PROMPT_INFERENCE_STATUSES.has(status)) return group;
    return {
      ...group,
      groupId,
      promptStatus: 'canceled',
      promptProgress: 100,
      promptStage: message,
      promptJobId: '',
      promptError: '',
      promptUpdatedAt: timestamp,
    };
  });
}
