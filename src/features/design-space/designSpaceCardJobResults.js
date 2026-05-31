import { designVersionFromJob } from './designSpaceGeneration.js';
import { appendDesignVersion, updateDesignCard } from './designSpacePackage.js';

const RUNNING_STATUSES = new Set(['queued', 'running']);
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'canceled']);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function statusForVersion(status) {
  if (status === 'completed') return 'generated';
  if (status === 'failed' || status === 'canceled') return 'failed';
  return 'generating';
}

function findDesignCard(pkg, cardId) {
  return [
    ...asArray(pkg?.characters),
    ...asArray(pkg?.scenes),
    ...asArray(pkg?.props),
  ].find((card) => card?.id === cardId) || null;
}

function versionForJob(card, jobId) {
  if (!jobId) return null;
  return asArray(card?.history).find((version) => version?.jobId === jobId) || null;
}

export function designSpaceCardJobMeta(job = {}) {
  const input = job.input || {};
  const designSpace = input.designSpace && typeof input.designSpace === 'object'
    ? input.designSpace
    : {};
  const projectId = String(input.designSpaceProjectId || '').trim();
  const cardId = String(designSpace.cardId || input._designCardId || input.designCardId || '').trim();
  if (!projectId || !cardId) return null;
  return {
    projectId,
    cardId,
    cardType: designSpace.cardType || '',
    status: job.status || '',
  };
}

export function isDesignSpaceCardJob(job = {}) {
  return Boolean(designSpaceCardJobMeta(job));
}

function firstString(...values) {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .find(Boolean) || '';
}

function isStoryboardDesignProject(projectId = '') {
  return String(projectId || '').includes('__storyboard__');
}

export function designSpaceCardJobHistoryPatch(job = {}) {
  const meta = designSpaceCardJobMeta(job);
  if (!meta) return null;

  const input = job.input || {};
  const output = job.output || {};
  const designSpace = input.designSpace && typeof input.designSpace === 'object'
    ? input.designSpace
    : {};
  const src = firstString(
    output.assetUrl,
    output.url,
    output.urls,
    output.assetPath,
    output.localPath,
  );
  const model = firstString(
    input.model,
    input.modelName,
    input.providerModelName,
    input.modelId,
    job.model,
    job.modelName,
  );

  return {
    action: 'job.output',
    kind: 'image',
    type: 'image',
    status: job.status || meta.status,
    src,
    url: src,
    assetId: firstString(output.assetId),
    assetPath: firstString(output.assetPath, output.localPath),
    prompt: firstString(input.prompt, job.prompt),
    model,
    title: firstString(input.title, designSpace.templateName, '设计空间资产'),
    source: isStoryboardDesignProject(meta.projectId) ? 'storyboard.asset-config' : 'design-space.card',
    projectId: firstString(job.projectId, job.project_id, input.assetProjectId, input.projectId, input.project_id),
    nodeId: firstString(job.nodeId, input._nodeId, input.nodeId),
    designSpaceProjectId: meta.projectId,
    designCardId: meta.cardId,
    designCardType: meta.cardType,
  };
}

export function applyDesignCardJobToPackage(pkg, job = {}) {
  const meta = designSpaceCardJobMeta(job);
  if (!pkg || !meta) return pkg;
  const card = findDesignCard(pkg, meta.cardId);
  if (!card) return pkg;

  if (RUNNING_STATUSES.has(meta.status)) {
    return updateDesignCard(pkg, meta.cardId, {
      status: 'generating',
      activeJobId: job.id || '',
      error: '',
    });
  }

  if (!TERMINAL_STATUSES.has(meta.status)) return pkg;

  const existingVersion = versionForJob(card, job.id);
  if (existingVersion) {
    return updateDesignCard(pkg, meta.cardId, {
      status: statusForVersion(existingVersion.status),
      activeJobId: '',
      error: existingVersion.error || '',
    });
  }

  const version = designVersionFromJob(job, meta.cardId);
  return appendDesignVersion(pkg, meta.cardId, version);
}
