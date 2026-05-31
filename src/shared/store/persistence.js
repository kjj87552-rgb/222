import { canvasStore, canvasActions, isLayoutOnlyNodesChange } from './canvasStore.js';
import { libraryStore, libraryActions } from './libraryStore.js';
import { projectListStore, projectListActions } from './projectListStore.js';
import { designSpaceActions, designSpaceStore } from '../../features/design-space/designSpaceStore.js';
import { EMBED_MODE } from '../../app/embed.js';
import { getBackendBaseUrl } from '../platform/backendClient.js';
import { ProjectStore } from '../platform/projectStore.js';
import { DEFAULT_PROJECT_ID, makeProject, makeProjectId, makeProjectSummary } from '../utils/asset.js';
import { isAssetLibraryItem } from '../utils/assetScopes.js';

const CANVAS_STORAGE_KEY = 'mancrea.canvas.state.v1';           // legacy single-key (back-compat)
const LAYOUT_PATCH_STORAGE_KEY = 'mancrea.canvas.layoutPatches.v1';
const PROJECT_LIST_STORAGE_KEY = 'mancrea.projects.v1';
const CURRENT_PROJECT_STORAGE_KEY = 'mancrea.currentProjectId.v1';
const VERSION = 2;
const CURRENT_PROVIDER_ID = 'newapi';
const CURRENT_TEXT_MODEL_ID = 'gpt-5.5';
const CURRENT_IMAGE_MODEL_ID = 'gpt-image-2';
const NODE_LAYOUT_KEYS = ['x', 'y', 'w', 'h'];
const NODE_HOT_STATE_KEYS = new Set([
  '_playing',
  'focusAnalysisJobId',
  'focusAnalysisProgress',
  'focusAnalysisStatus',
  'generating',
  'jobId',
  'jobStage',
  'progress',
]);
const NODE_LIVE_JOB_KEYS = new Set([
  'composedPrompt',
  'error',
  'finalPrompt',
  'model',
  'modelId',
  'modelName',
  'prompt',
  'provider',
  'providerModelId',
  'systemPrompt',
  'tag',
  'workbenchModel',
]);
const NODE_LIVE_SETTINGS_KEYS = new Set([
  'error',
  'jobStage',
  'model',
  'modelId',
  'progress',
  'provider',
  'providerModelId',
]);

let saveTimer = null;
let suppressPersistence = false;
let persistenceBootstrapped = false;
let persistenceSubscriptionsStarted = false;
let backendSaveInFlight = false;
let backendSavePending = false;
let backendSavePromise = null;
let backendPersistenceUnavailable = false;
let librarySaveTimer = null;
let backendLibrarySaveInFlight = false;
let backendLibrarySavePending = false;
let backendLibrarySavePromise = null;
let lastCanvasAutosaveState = canvasStore.getState();
let lastDesignSpaceState = designSpaceStore.getState();
let layoutPatchTimer = null;
const pendingLayoutPatchesByProject = new Map();

const SAVE_DEBOUNCE_MS = 180;
const LAYOUT_PATCH_DEBOUNCE_MS = 120;

function projectCanvasKey(projectId) {
  return `${CANVAS_STORAGE_KEY}:${projectId || DEFAULT_PROJECT_ID}`;
}

function projectLayoutPatchKey(projectId) {
  return `${LAYOUT_PATCH_STORAGE_KEY}:${projectId || DEFAULT_PROJECT_ID}`;
}

function cloneData(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function runWithoutPersistence(fn) {
  suppressPersistence = true;
  try {
    return fn();
  } finally {
    suppressPersistence = false;
  }
}

function markBackendUnavailable() {
  backendPersistenceUnavailable = true;
}

function backendAvailable() {
  return !backendPersistenceUnavailable && !EMBED_MODE && ProjectStore.available();
}

function getLocalStorage() {
  if (typeof globalThis === 'undefined') return null;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function finiteLayoutNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function layoutPatchForNode(node) {
  const patch = {};
  for (const key of NODE_LAYOUT_KEYS) {
    const value = finiteLayoutNumber(node?.[key]);
    if (value !== null) patch[key] = value;
  }
  return patch;
}

function readLayoutPatches(projectId) {
  if (EMBED_MODE) return {};
  const storage = getLocalStorage();
  if (!storage) return {};
  try {
    const parsed = JSON.parse(storage.getItem(projectLayoutPatchKey(projectId)) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn('Failed to read canvas layout patches', error);
    return {};
  }
}

function writeLayoutPatches(projectId, patches) {
  if (EMBED_MODE) return false;
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    const compact = {};
    Object.entries(patches || {}).forEach(([nodeId, patch]) => {
      if (!nodeId || !patch || typeof patch !== 'object' || Array.isArray(patch)) return;
      const nextPatch = {};
      for (const key of NODE_LAYOUT_KEYS) {
        const value = finiteLayoutNumber(patch[key]);
        if (value !== null) nextPatch[key] = value;
      }
      if (Object.keys(nextPatch).length) compact[nodeId] = nextPatch;
    });
    const key = projectLayoutPatchKey(projectId);
    if (!Object.keys(compact).length) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(compact));
    return true;
  } catch (error) {
    console.warn('Failed to save canvas layout patches', error);
    return false;
  }
}

function mergeLayoutPatches(projectId, patches) {
  if (!projectId || !patches || !Object.keys(patches).length) return;
  writeLayoutPatches(projectId, { ...readLayoutPatches(projectId), ...patches });
}

function cancelLayoutPatchTimerIfIdle() {
  if (pendingLayoutPatchesByProject.size || !layoutPatchTimer) return;
  clearTimeout(layoutPatchTimer);
  layoutPatchTimer = null;
}

function flushPendingLayoutPatches(projectId = null) {
  if (layoutPatchTimer) {
    clearTimeout(layoutPatchTimer);
    layoutPatchTimer = null;
  }
  const entries = projectId
    ? [[projectId, pendingLayoutPatchesByProject.get(projectId)]]
    : Array.from(pendingLayoutPatchesByProject.entries());
  if (projectId) pendingLayoutPatchesByProject.delete(projectId);
  else pendingLayoutPatchesByProject.clear();
  entries.forEach(([entryProjectId, patches]) => {
    if (!entryProjectId || !patches || !Object.keys(patches).length) return;
    mergeLayoutPatches(entryProjectId, patches);
  });
}

function discardPendingLayoutPatches(projectId) {
  if (!projectId) return;
  pendingLayoutPatchesByProject.delete(projectId);
  cancelLayoutPatchTimerIfIdle();
}

function queueLayoutPatches(projectId, patches) {
  if (!projectId || !patches || !Object.keys(patches).length) return;
  const previous = pendingLayoutPatchesByProject.get(projectId) || {};
  pendingLayoutPatchesByProject.set(projectId, { ...previous, ...patches });
  if (layoutPatchTimer) return;
  layoutPatchTimer = setTimeout(() => {
    layoutPatchTimer = null;
    flushPendingLayoutPatches();
  }, LAYOUT_PATCH_DEBOUNCE_MS);
}

function clearLayoutPatches(projectId) {
  if (EMBED_MODE) return;
  discardPendingLayoutPatches(projectId);
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(projectLayoutPatchKey(projectId));
  } catch (error) {
    console.warn('Failed to clear canvas layout patches', error);
  }
}

function collectLayoutPatches(beforeNodes = [], afterNodes = []) {
  if (!Array.isArray(beforeNodes) || !Array.isArray(afterNodes)) return {};
  const patches = {};
  for (let index = 0; index < afterNodes.length; index += 1) {
    const before = beforeNodes[index];
    const after = afterNodes[index];
    if (!after?.id) continue;
    const changed = NODE_LAYOUT_KEYS.some((key) => !Object.is(before?.[key], after?.[key]));
    if (changed) patches[after.id] = layoutPatchForNode(after);
  }
  return patches;
}

function applyLayoutPatches(projectId, nodes) {
  if (!Array.isArray(nodes) || !nodes.length) return Array.isArray(nodes) ? nodes : [];
  const patches = readLayoutPatches(projectId);
  if (!Object.keys(patches).length) return nodes;
  let changed = false;
  const nextNodes = nodes.map((node) => {
    const patch = patches[node?.id];
    if (!patch || typeof patch !== 'object') return node;
    const layout = {};
    for (const key of NODE_LAYOUT_KEYS) {
      if (!hasOwn(patch, key)) continue;
      const value = finiteLayoutNumber(patch[key]);
      if (value !== null) layout[key] = value;
    }
    if (!Object.keys(layout).length) return node;
    const nodeChanged = Object.entries(layout).some(([key, value]) => !Object.is(node[key], value));
    if (!nodeChanged) return node;
    changed = true;
    return { ...node, ...layout };
  });
  return changed ? nextNodes : nodes;
}

function absoluteAssetUrl(asset, backendBaseUrl) {
  if (!asset) return '';
  const existing = asset.src || asset.url || asset.assetUrl;
  const baseUrl = backendBaseUrl || getBackendBaseUrl();
  const canonical = canonicalLocalAssetUrl(existing);
  if (canonical && canonical !== existing && canonical.startsWith('/assets/')) {
    return baseUrl ? `${baseUrl}${canonical}` : canonical;
  }
  if (existing && /^(data:|blob:|libai-asset:|https?:)/i.test(existing)) return existing;
  if (baseUrl && existing && existing.startsWith('/assets/')) return `${baseUrl}${existing}`;
  if (baseUrl && asset.id) return `${baseUrl}/assets/${encodeURIComponent(asset.id)}`;
  return existing || '';
}

function displayLocalAssetUrl(value, backendBaseUrl) {
  if (typeof value !== 'string' || !value.startsWith('/assets/')) return value;
  return `${backendBaseUrl || getBackendBaseUrl()}${value}`;
}

function canonicalLocalAssetUrl(value) {
  if (typeof value !== 'string' || !value) return value;
  if (value.startsWith('/assets/')) return value;
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    if ((host === '127.0.0.1' || host === 'localhost') && parsed.pathname.startsWith('/assets/')) {
      return `${parsed.pathname}${parsed.search || ''}${parsed.hash || ''}`;
    }
  } catch {
    return value;
  }
  return value;
}

function normalizeMediaStringsDeep(value, transform) {
  if (typeof value === 'string') return transform(value);
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const normalized = normalizeMediaStringsDeep(item, transform);
      if (normalized !== item) changed = true;
      return normalized;
    });
    return changed ? next : value;
  }
  if (!value || typeof value !== 'object') return value;

  let changed = false;
  const next = {};
  for (const [key, current] of Object.entries(value)) {
    const normalized = normalizeMediaStringsDeep(current, transform);
    next[key] = normalized;
    if (normalized !== current) {
      changed = true;
    }
  }
  return changed ? next : value;
}

function normalizeMediaFields(record, transform) {
  return normalizeMediaStringsDeep(record, transform);
}

function normalizeMediaForDisplay(record, backendBaseUrl) {
  return normalizeMediaFields(record, (value) => displayLocalAssetUrl(value, backendBaseUrl));
}

function normalizeNodeMediaForDisplay(node, backendBaseUrl) {
  return normalizeMediaFields(node, (value) => displayLocalAssetUrl(value, backendBaseUrl));
}

function canonicalizeMediaForStorage(record) {
  return normalizeMediaFields(record, canonicalLocalAssetUrl);
}

function normalizeDesignSpacePackageForDisplay(pkg, projectId, backendBaseUrl) {
  if (!pkg || typeof pkg !== 'object') return null;
  return normalizeMediaForDisplay({ ...pkg, projectId: pkg.projectId || projectId }, backendBaseUrl);
}

function canonicalizeDesignSpacePackageForStorage(pkg, projectId) {
  if (!pkg || typeof pkg !== 'object') return null;
  return canonicalizeMediaForStorage({ ...pkg, projectId: pkg.projectId || projectId });
}

function designSpacePackageFromPayload(payload, projectId, backendBaseUrl = '') {
  const raw = payload?.designSpacePackage || payload?.designSpace?.package || null;
  return normalizeDesignSpacePackageForDisplay(raw, projectId, backendBaseUrl);
}

function currentDesignSpacePackageForStorage(projectId) {
  const pkg = designSpaceStore.getState().packagesByProject[projectId];
  return canonicalizeDesignSpacePackageForStorage(pkg, projectId);
}

function applyDesignSpacePackage(projectId, pkg) {
  if (!projectId) return;
  if (pkg) designSpaceActions.setPackage(projectId, pkg);
  else designSpaceActions.clearPackage(projectId);
}

function oldProviderId() {
  return ['yun', 'wu'].join('');
}

function canonicalProviderModelId(value) {
  const text = String(value || '').trim();
  const lowered = text.toLowerCase();
  const oldPrefix = `${oldProviderId()}.`;
  const currentPrefix = `${CURRENT_PROVIDER_ID}.`;
  const unprefixed = lowered.startsWith(oldPrefix) || lowered.startsWith(currentPrefix)
    ? lowered.split('.', 2)[1]
    : lowered;
  if (unprefixed === 'gpt-5-5' || unprefixed === CURRENT_TEXT_MODEL_ID) return CURRENT_TEXT_MODEL_ID;
  if (unprefixed === CURRENT_IMAGE_MODEL_ID) return CURRENT_IMAGE_MODEL_ID;
  return '';
}

function cleanModelLabel(value, modelId = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  const canonical = canonicalProviderModelId(modelId || text);
  if (canonical === CURRENT_IMAGE_MODEL_ID) return 'GPT Image 2';
  if (canonical === CURRENT_TEXT_MODEL_ID) return 'GPT 5.5';
  const withoutProvider = text.split(' · ', 1)[0].trim();
  const lowered = withoutProvider.toLowerCase();
  if (lowered.includes('gpt image 2') || lowered.includes(CURRENT_IMAGE_MODEL_ID)) return 'GPT Image 2';
  if (lowered.includes('gpt 5.5') || lowered.includes(CURRENT_TEXT_MODEL_ID) || lowered.includes('gpt-5-5')) return 'GPT 5.5';
  const legacyMarkers = [
    oldProviderId(),
    'local-preview',
    '本地预览',
    'kling',
    'gpt image 2 all',
    'openai.image',
  ];
  if (legacyMarkers.some((marker) => lowered.includes(marker))) return '';
  return withoutProvider;
}

function sanitizeNodeProviderFields(node) {
  if (!node || typeof node !== 'object') return node;
  const next = { ...node };
  let changed = false;
  const candidateModelId = canonicalProviderModelId(
    next.providerModelId || next.modelId || next.modelName || next.model || next.workbenchModel,
  );
  if (candidateModelId === CURRENT_TEXT_MODEL_ID || candidateModelId === CURRENT_IMAGE_MODEL_ID) {
    const label = candidateModelId === CURRENT_IMAGE_MODEL_ID ? 'GPT Image 2' : 'GPT 5.5';
    for (const key of ['providerModelId', 'modelId', 'modelName']) {
      if (next[key] !== candidateModelId) {
        next[key] = candidateModelId;
        changed = true;
      }
    }
    if (next.provider !== CURRENT_PROVIDER_ID) {
      next.provider = CURRENT_PROVIDER_ID;
      changed = true;
    }
    for (const key of ['model', 'workbenchModel']) {
      if (next[key] && next[key] !== label) {
        next[key] = label;
        changed = true;
      }
    }
  } else {
    const provider = String(next.provider || '').trim().toLowerCase();
    const oldProvider = oldProviderId();
    const idFields = ['providerModelId', 'modelId', 'modelName'];
    const hasOldModelId = idFields.some((key) => {
      const value = String(next[key] || '').trim().toLowerCase();
      return value.startsWith(`${oldProvider}.`);
    });
    if (provider === oldProvider || hasOldModelId) {
      for (const key of ['provider', ...idFields]) {
        if (next[key] !== undefined) {
          delete next[key];
          changed = true;
        }
      }
    }
  }
  for (const key of ['model', 'workbenchModel']) {
    const cleaned = cleanModelLabel(next[key], next.providerModelId || next.modelId || next.modelName);
    if (cleaned !== String(next[key] || '')) {
      if (cleaned) next[key] = cleaned;
      else delete next[key];
      changed = true;
    }
  }
  return changed ? next : node;
}

function reconcileNodesWithJobs(nodes, jobs, backendBaseUrl) {
  if (!Array.isArray(nodes) || !Array.isArray(jobs) || jobs.length === 0) return nodes;
  const latestByNode = new Map();
  for (const job of jobs) {
    if (!job?.nodeId || latestByNode.has(job.nodeId)) continue;
    latestByNode.set(job.nodeId, job);
  }
  if (!latestByNode.size) return nodes;

  return nodes.map((node) => {
    const job = latestByNode.get(node.id);
    if (!job || (node.jobId && node.jobId !== job.id && !node.generating)) return node;
    if (job.status === 'queued' || job.status === 'running') {
      return {
        ...node,
        generating: true,
        progress: Math.max(1, Math.min(99, Number(job.progress) || 1)),
        jobId: job.id,
        jobStage: job.output?.stage || node.jobStage,
        model: job.output?.displayName || job.output?.providerModelName || job.input?.model || node.model,
      };
    }
    if (job.status === 'failed' || job.status === 'canceled') {
      return {
        ...node,
        generating: false,
        progress: 0,
        jobId: job.id,
        jobStage: '',
        error: job.status === 'canceled' ? '已取消' : job.error,
        tag: job.status === 'canceled' ? '取消' : '失败',
      };
    }
    if (job.status !== 'completed') return node;

    const output = job.output || {};
    const jobType = job.type || '';
    const kind = output.assetKind || (
      jobType.includes('video') ? 'video'
      : jobType.includes('audio') ? 'audio'
      : jobType.includes('text') || jobType.includes('reason') || jobType.includes('inference') ? 'text'
      : node.type || 'image'
    );
    const rawUrl = output.url || output.urls?.[0] || output.posterUrl;
    const url = rawUrl ? absoluteAssetUrl({ src: rawUrl }, backendBaseUrl) : '';
    const modelLabel = output.displayName || output.providerModelName || job.input?.model || '';
    const displayPrompt = typeof job.input?._assetUserPrompt === 'string'
      ? job.input._assetUserPrompt
      : (typeof job.input?.assetUserPrompt === 'string' ? job.input.assetUserPrompt : (job.input?.prompt || node.prompt));
    const patch = {
      generating: false,
      progress: 0,
      jobId: job.id,
      jobStage: '',
      error: null,
      prompt: displayPrompt,
      model: modelLabel || node.model,
      tag: '生成',
    };
    if (kind === 'image' && url) patch.src = url;
    if (kind === 'text') {
      patch.body = output.text || output.content || output.message || node.body || '';
      patch.title = job.input?.title || node.title || '文本生成结果';
    }
    if (kind === 'video' && url) {
      if (output.posterUrl) patch.poster = absoluteAssetUrl({ src: output.posterUrl }, backendBaseUrl);
      else patch.videoSrc = url;
      patch.duration = job.input?.duration ? `00:${String(job.input.duration).padStart(2, '0')}` : node.duration;
    }
    if (kind === 'audio') {
      patch.waveform = true;
      if (url) patch.audioSrc = url;
      patch.duration = output.duration || job.input?.duration || job.input?.durationSeconds || node.duration || '00:18';
    }
    return { ...node, ...patch };
  });
}

function normalizePayload(payload, fallbackId = DEFAULT_PROJECT_ID, backendBaseUrl = '') {
  const project = payload?.project || makeProject('未命名', fallbackId);
  const projectId = project?.id || fallbackId;
  const assets = Array.isArray(payload?.assets)
    ? payload.assets
      .filter(isAssetLibraryItem)
      .map((asset) => {
        const url = absoluteAssetUrl(asset, backendBaseUrl);
        const displayAsset = url ? { ...asset, src: url, url } : asset;
        return normalizeMediaForDisplay(displayAsset, backendBaseUrl);
      })
    : [];
  const normalizedNodes = reconcileNodesWithJobs(
      Array.isArray(payload?.nodes) ? payload.nodes : [],
      Array.isArray(payload?.jobs) ? payload.jobs : [],
      backendBaseUrl,
    )
      .map(sanitizeNodeProviderFields)
      .map((node) => normalizeNodeMediaForDisplay(node, backendBaseUrl));
  const nodes = applyLayoutPatches(projectId, normalizedNodes);
  return {
    project,
    nodes,
    edges: Array.isArray(payload?.edges) ? payload.edges : [],
    assets,
    history: Array.isArray(payload?.history)
      ? payload.history.map((item) => normalizeNodeMediaForDisplay(item, backendBaseUrl))
      : [],
    designSpacePackage: designSpacePackageFromPayload(payload, projectId, backendBaseUrl),
  };
}

function buildSnapshot() {
  const c = canvasStore.getState();
  const l = libraryStore.getState();
  const projectId = c.projectId || c.project?.id || DEFAULT_PROJECT_ID;
  const nodes = (c.nodes || []).map(sanitizeNodeProviderFields).map(canonicalizeMediaForStorage);
  const assets = (l.assets || []).filter(isAssetLibraryItem).map(canonicalizeMediaForStorage);
  const history = (l.history || []).map(canonicalizeMediaForStorage);
  const designSpacePackage = currentDesignSpacePackageForStorage(projectId);
  return {
    projectId,
    project: { ...makeProject('未命名', projectId), ...c.project, id: projectId, updatedAt: new Date().toISOString() },
    nodes,
    edges: c.edges || [],
    assets,
    history,
    designSpacePackage,
  };
}

function buildLibrarySnapshot() {
  const c = canvasStore.getState();
  const l = libraryStore.getState();
  const projectId = c.projectId || c.project?.id || DEFAULT_PROJECT_ID;
  return {
    projectId,
    assets: (l.assets || []).filter(isAssetLibraryItem).map(canonicalizeMediaForStorage),
    history: (l.history || []).map(canonicalizeMediaForStorage),
  };
}

function applyProjectPayload(payload, backendBaseUrl = '') {
  const normalized = normalizePayload(payload, payload?.project?.id || DEFAULT_PROJECT_ID, backendBaseUrl);
  runWithoutPersistence(() => {
    canvasActions.setActiveProject(normalized.project, normalized.nodes, normalized.edges);
    libraryActions.setAssets(normalized.assets);
    libraryActions.setHistory(normalized.history);
    applyDesignSpacePackage(normalized.project.id, normalized.designSpacePackage);
    projectListActions.setCurrentProjectId(normalized.project.id);
  });
  writeCurrentProjectId(normalized.project.id);
  return normalized;
}

// ─── READ HELPERS ──────────────────────────────────────────────────

export function readCurrentProjectId() {
  if (EMBED_MODE) return DEFAULT_PROJECT_ID;
  const storage = getLocalStorage();
  if (!storage) return DEFAULT_PROJECT_ID;
  try {
    return storage.getItem(CURRENT_PROJECT_STORAGE_KEY) || DEFAULT_PROJECT_ID;
  } catch (e) {
    return DEFAULT_PROJECT_ID;
  }
}

export function readCanvasState(projectId = readCurrentProjectId()) {
  if (EMBED_MODE) return null;
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    // Try project-keyed first; fall back to legacy single key for default project (back-compat)
    const raw = storage.getItem(projectCanvasKey(projectId))
      || (projectId === DEFAULT_PROJECT_ID ? storage.getItem(CANVAS_STORAGE_KEY) : null);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;
    const patchProjectId = parsed.project?.id || projectId;
    const nodes = applyLayoutPatches(
      patchProjectId,
      parsed.nodes.map(sanitizeNodeProviderFields).map(canonicalizeMediaForStorage),
    );
    return {
      project: parsed.project,
      nodes,
      edges: parsed.edges,
      assets: Array.isArray(parsed.assets) ? parsed.assets.filter(isAssetLibraryItem).map(canonicalizeMediaForStorage) : [],
      history: Array.isArray(parsed.history) ? parsed.history.map(canonicalizeMediaForStorage) : [],
      designSpacePackage: canonicalizeDesignSpacePackageForStorage(parsed.designSpacePackage, projectId),
    };
  } catch (e) {
    console.warn('Failed to read saved canvas state', e);
    return null;
  }
}

export function readProjectSummaries() {
  if (EMBED_MODE) return [];
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(PROJECT_LIST_STORAGE_KEY) || '[]');
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (e) {
    console.warn('Failed to read project list', e);
  }
  return [];
}

// ─── LOCALSTORAGE FALLBACK ─────────────────────────────────────────

function writeCanvasState(projectId, state, library) {
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    const project = { ...state.project, updatedAt: new Date().toISOString() };
    storage.setItem(projectCanvasKey(projectId), JSON.stringify({
      version: VERSION,
      project,
      nodes: state.nodes,
      edges: state.edges,
      assets: library.assets,
      history: library.history,
      designSpacePackage: state.designSpacePackage || null,
      updatedAt: project.updatedAt,
    }));
    return true;
  } catch (e) {
    console.warn('Failed to save canvas state', e);
    return false;
  }
}

function writeProjectSummaries(projects) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(PROJECT_LIST_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to save project list', e);
  }
}

function sortProjectSummaries(projects) {
  return [...projects].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

function upsertStoredProjectSummary(summary) {
  if (!summary?.id || EMBED_MODE) return;
  const existing = readProjectSummaries().filter((project) => project?.id !== summary.id);
  writeProjectSummaries(sortProjectSummaries([summary, ...existing]));
}

function writeCurrentProjectId(id) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(CURRENT_PROJECT_STORAGE_KEY, id || DEFAULT_PROJECT_ID);
  } catch (e) {
    console.warn('Failed to save current project id', e);
  }
}

function activeProjectId() {
  const canvas = canvasStore.getState();
  return canvas.projectId || canvas.project?.id || projectListStore.getState().currentProjectId || DEFAULT_PROJECT_ID;
}

function writeCurrentProjectIdIfActive(projectId) {
  if (!projectId || activeProjectId() !== projectId) return;
  writeCurrentProjectId(projectId);
}

function writeLocalCheckpoint(projectId, snapshot) {
  if (!projectId || EMBED_MODE) return;
  const wroteCanvasState = writeCanvasState(projectId, {
    project: snapshot.project,
    nodes: snapshot.nodes,
    edges: snapshot.edges,
    designSpacePackage: snapshot.designSpacePackage || null,
  }, {
    assets: snapshot.assets || [],
    history: snapshot.history || [],
  });
  if (wroteCanvasState) clearLayoutPatches(projectId);
  upsertStoredProjectSummary(makeProjectSummary(
    snapshot.project,
    snapshot.nodes || [],
    snapshot.edges || [],
    snapshot.assets || [],
    snapshot.history || [],
  ));
  writeCurrentProjectId(projectId);
}

function flushLocalCanvasNow() {
  const snapshot = buildSnapshot();
  if (!snapshot.projectId) return null;
  writeLocalCheckpoint(snapshot.projectId, snapshot);
  const summary = makeProjectSummary(snapshot.project, snapshot.nodes, snapshot.edges, snapshot.assets, snapshot.history);
  projectListActions.upsertSummary(summary);
  return summary;
}

function bootstrapLocalPersistence() {
  const summaries = readProjectSummaries();
  const currentId = readCurrentProjectId();

  if (summaries.length === 0) {
    summaries.push(makeProjectSummary(makeProject('未命名', DEFAULT_PROJECT_ID)));
  }

  runWithoutPersistence(() => {
    projectListActions.setProjects(summaries);
    projectListActions.setCurrentProjectId(currentId);

    const stored = readCanvasState(currentId);
    if (stored) {
      canvasActions.setActiveProject(
        stored.project || makeProject('未命名', currentId),
        stored.nodes || [],
        stored.edges || [],
      );
      libraryActions.setAssets(stored.assets || []);
      libraryActions.setHistory(stored.history || []);
      applyDesignSpacePackage(currentId, stored.designSpacePackage);
    }
  });
}

function switchLocalProject(projectId) {
  if (!projectId || EMBED_MODE) return null;
  flushLocalCanvasNow();
  return activateLocalProject(projectId);
}

function activateLocalProject(projectId) {
  writeCurrentProjectId(projectId);
  projectListActions.setCurrentProjectId(projectId);
  const stored = readCanvasState(projectId);
  if (stored) {
    canvasActions.setActiveProject(
      stored.project || makeProject('未命名', projectId),
      stored.nodes || [],
      stored.edges || [],
    );
    libraryActions.setAssets(stored.assets || []);
    libraryActions.setHistory(stored.history || []);
    applyDesignSpacePackage(projectId, stored.designSpacePackage);
    return stored;
  }
  const project = makeProject('未命名', projectId);
  canvasActions.setActiveProject(project, [], []);
  libraryActions.setAssets([]);
  libraryActions.setHistory([]);
  applyDesignSpacePackage(projectId, null);
  return { project, nodes: [], edges: [], assets: [], history: [], designSpacePackage: null };
}

function removeLocalProjectData(projectId) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(projectCanvasKey(projectId));
    storage.removeItem(projectLayoutPatchKey(projectId));
    if (projectId === DEFAULT_PROJECT_ID) storage.removeItem(CANVAS_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to remove local project data', e);
  }
}

function createLocalProject(name, seed = {}) {
  const trimmed = (name || '').trim() || '未命名项目';
  const project = makeProject(trimmed, makeProjectId(trimmed));
  const nodes = cloneData(seed.nodes || []);
  const edges = cloneData(seed.edges || []);
  runWithoutPersistence(() => {
    canvasActions.setActiveProject(project, nodes, edges);
    libraryActions.setAssets([]);
    libraryActions.setHistory([]);
    applyDesignSpacePackage(project.id, null);
    projectListActions.upsertSummary(makeProjectSummary(project, nodes, edges, [], []));
    projectListActions.setCurrentProjectId(project.id);
  });
  writeCurrentProjectId(project.id);
  flushLocalCanvasNow();
  return { project, nodes, edges, assets: [], history: [] };
}

// ─── BACKEND / SQLITE PERSISTENCE ─────────────────────────────────

async function listBackendProjects() {
  const result = await ProjectStore.list();
  return Array.isArray(result?.projects) ? result.projects : [];
}

function listLocalCheckpointProjectIds() {
  const ids = new Set(readProjectSummaries().map((summary) => summary?.id).filter(Boolean));
  const currentId = readCurrentProjectId();
  if (currentId) ids.add(currentId);

  if (EMBED_MODE) return ids;
  const storage = getLocalStorage();
  if (!storage) return ids;
  try {
    const prefix = `${CANVAS_STORAGE_KEY}:`;
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(prefix)) {
        const projectId = key.slice(prefix.length);
        if (projectId) ids.add(projectId);
      }
    }
    if (storage.getItem(CANVAS_STORAGE_KEY)) ids.add(DEFAULT_PROJECT_ID);
  } catch (error) {
    console.warn('Failed to enumerate local project checkpoints', error);
  }
  return ids;
}

async function migrateLocalProjectsToBackend() {
  const summaryById = new Map(readProjectSummaries().map((summary) => [summary.id, summary]));
  const targets = listLocalCheckpointProjectIds();
  if (!targets.size) targets.add(DEFAULT_PROJECT_ID);

  for (const projectId of targets) {
    const summary = summaryById.get(projectId);
    const stored = readCanvasState(projectId);
    const projectName = summary?.name || stored?.project?.name || '未命名';
    const project = stored?.project || makeProject(projectName, projectId);
    const nodes = stored?.nodes || [];
    const edges = stored?.edges || [];
    const assets = stored?.assets || [];
    const history = stored?.history || [];
    const designSpacePackage = stored?.designSpacePackage || null;
    try {
      await ProjectStore.create(project.name || projectName, projectId);
      await ProjectStore.saveGraph(projectId, { project, nodes, edges, assets, history, designSpacePackage });
    } catch (error) {
      console.warn('Failed to migrate local project to backend', projectId, error);
    }
  }
}

function isNewerLocalProject(stored, backendSummary) {
  const localUpdatedAt = Date.parse(stored?.project?.updatedAt || stored?.updatedAt || '');
  if (!Number.isFinite(localUpdatedAt)) return !backendSummary;
  const backendUpdatedAt = Date.parse(backendSummary?.updatedAt || '');
  return !Number.isFinite(backendUpdatedAt) || localUpdatedAt > backendUpdatedAt;
}

function hasDesignSpaceContent(pkg) {
  if (!pkg || typeof pkg !== 'object') return false;
  return ['characters', 'scenes', 'props', 'shotGroups', 'references'].some((key) => (
    Array.isArray(pkg[key]) && pkg[key].length > 0
  ));
}

function isEmptyLocalCheckpoint(stored) {
  if (!stored) return true;
  return !(
    (Array.isArray(stored.nodes) && stored.nodes.length > 0)
    || (Array.isArray(stored.edges) && stored.edges.length > 0)
    || (Array.isArray(stored.assets) && stored.assets.length > 0)
    || (Array.isArray(stored.history) && stored.history.length > 0)
    || hasDesignSpaceContent(stored.designSpacePackage)
  );
}

function hasBackendSummaryContent(summary) {
  if (!summary) return false;
  return Number(summary.nodeCount || 0) > 0
    || Number(summary.edgeCount || 0) > 0
    || Number(summary.assetCount || 0) > 0
    || Number(summary.historyCount || 0) > 0;
}

async function replayLocalCheckpointsToBackend(backendSummaries) {
  const backendById = new Map((backendSummaries || []).map((project) => [project.id, project]));
  const summaryById = new Map(readProjectSummaries().map((summary) => [summary.id, summary]));
  for (const projectId of listLocalCheckpointProjectIds()) {
    const summary = summaryById.get(projectId);
    const stored = readCanvasState(projectId);
    const backendSummary = backendById.get(projectId);
    if (!stored || !isNewerLocalProject(stored, backendSummary)) continue;
    if (isEmptyLocalCheckpoint(stored) && hasBackendSummaryContent(backendSummary)) continue;
    const projectName = summary?.name || stored.project?.name || '未命名';
    const project = { ...makeProject(projectName, projectId), ...(stored.project || {}), id: projectId };
    try {
      await ProjectStore.create(project.name || projectName, projectId);
      await ProjectStore.saveGraph(projectId, {
        project,
        nodes: stored.nodes || [],
        edges: stored.edges || [],
        assets: stored.assets || [],
        history: stored.history || [],
        designSpacePackage: stored.designSpacePackage || null,
      });
    } catch (error) {
      console.warn('Failed to replay local project checkpoint to backend', projectId, error);
    }
  }
}

async function flushBackendCanvasNow() {
  if (!backendAvailable()) return flushLocalCanvasNow();
  if (backendSaveInFlight) {
    backendSavePending = true;
    const snapshot = buildSnapshot();
    if (snapshot.projectId) {
      writeLocalCheckpoint(snapshot.projectId, snapshot);
      const summary = makeProjectSummary(snapshot.project, snapshot.nodes, snapshot.edges, snapshot.assets, snapshot.history);
      runWithoutPersistence(() => projectListActions.upsertSummary(summary));
      writeCurrentProjectId(snapshot.projectId);
    }
    return backendSavePromise;
  }

  backendSaveInFlight = true;
  backendSavePromise = (async () => {
    try {
      do {
        backendSavePending = false;
        const snapshot = buildSnapshot();
        if (!snapshot.projectId) return null;
        writeLocalCheckpoint(snapshot.projectId, snapshot);
        await ProjectStore.saveGraph(snapshot.projectId, {
          project: snapshot.project,
          nodes: snapshot.nodes,
          edges: snapshot.edges,
          assets: snapshot.assets,
          history: snapshot.history,
          designSpacePackage: snapshot.designSpacePackage || null,
        });
        const summary = makeProjectSummary(snapshot.project, snapshot.nodes, snapshot.edges, snapshot.assets, snapshot.history);
        runWithoutPersistence(() => projectListActions.upsertSummary(summary));
        writeCurrentProjectIdIfActive(snapshot.projectId);
      } while (backendSavePending);
      return true;
    } catch (error) {
      markBackendUnavailable();
      console.warn('Failed to save project to backend; falling back to localStorage', error);
      return flushLocalCanvasNow();
    } finally {
      backendSaveInFlight = false;
      backendSavePromise = null;
    }
  })();
  return backendSavePromise;
}

function checkpointProjectBeforeSwitch() {
  clearTimeout(saveTimer);
  clearTimeout(librarySaveTimer);
  flushPendingLayoutPatches();
  saveTimer = null;
  librarySaveTimer = null;

  const snapshot = buildSnapshot();
  if (!snapshot.projectId) return null;

  writeLocalCheckpoint(snapshot.projectId, snapshot);
  const summary = makeProjectSummary(snapshot.project, snapshot.nodes, snapshot.edges, snapshot.assets, snapshot.history);
  runWithoutPersistence(() => projectListActions.upsertSummary(summary));
  return { snapshot, summary };
}

function queueBackendSnapshotSave(checkpoint, context = 'project switch') {
  const snapshot = checkpoint?.snapshot;
  if (!backendAvailable() || !snapshot?.projectId) return;
  void Promise.resolve()
    .then(() => ProjectStore.saveGraph(snapshot.projectId, {
      project: snapshot.project,
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      assets: snapshot.assets,
      history: snapshot.history,
      designSpacePackage: snapshot.designSpacePackage || null,
    }))
    .then(() => {
      if (checkpoint?.summary) {
        runWithoutPersistence(() => projectListActions.upsertSummary(checkpoint.summary));
      }
    })
    .catch((error) => {
      markBackendUnavailable();
      console.warn(`Background project save during ${context} failed; local checkpoint is available`, error);
    });
}

function queueBackendProjectListRefresh(previousCheckpoint, currentSummary) {
  if (!backendAvailable()) return;
  void Promise.resolve()
    .then(listBackendProjects)
    .then((summaries) => {
      runWithoutPersistence(() => {
        projectListActions.setProjects(summaries);
        if (previousCheckpoint?.summary) projectListActions.upsertSummary(previousCheckpoint.summary);
        if (currentSummary) projectListActions.upsertSummary(currentSummary);
      });
      writeProjectSummaries(projectListStore.getState().projects);
    })
    .catch((error) => {
      markBackendUnavailable();
      console.warn('Background project list refresh failed during project switch', error);
    });
}

async function flushBackendLibraryNow() {
  if (!backendAvailable()) return flushLocalCanvasNow();
  if (backendLibrarySaveInFlight) {
    backendLibrarySavePending = true;
    return backendLibrarySavePromise;
  }

  backendLibrarySaveInFlight = true;
  backendLibrarySavePromise = (async () => {
    try {
      do {
        backendLibrarySavePending = false;
        const snapshot = buildLibrarySnapshot();
        if (!snapshot.projectId) return null;
        await ProjectStore.saveLibrary(snapshot.projectId, {
          assets: snapshot.assets,
          history: snapshot.history,
        });
        if (activeProjectId() !== snapshot.projectId) continue;
        const canvas = canvasStore.getState();
        const project = {
          ...makeProject('未命名', snapshot.projectId),
          ...(canvas.project || {}),
          id: snapshot.projectId,
          updatedAt: new Date().toISOString(),
        };
        const summary = makeProjectSummary(
          project,
          canvas.nodes || [],
          canvas.edges || [],
          snapshot.assets,
          snapshot.history,
        );
        runWithoutPersistence(() => projectListActions.upsertSummary(summary));
        writeCurrentProjectIdIfActive(snapshot.projectId);
      } while (backendLibrarySavePending);
      return true;
    } catch (error) {
      markBackendUnavailable();
      console.warn('Failed to save project library to backend; falling back to localStorage', error);
      return flushLocalCanvasNow();
    } finally {
      backendLibrarySaveInFlight = false;
      backendLibrarySavePromise = null;
    }
  })();
  return backendLibrarySavePromise;
}

async function bootstrapBackendPersistence() {
  const runtime = await ProjectStore.runtime();
  const backendBaseUrl = runtime?.backendBaseUrl || '';

  let summaries = await listBackendProjects();
  await replayLocalCheckpointsToBackend(summaries);
  summaries = await listBackendProjects();
  if (!summaries.length) {
    await migrateLocalProjectsToBackend();
    summaries = await listBackendProjects();
  }
  if (!summaries.length) {
    const created = await ProjectStore.create('未命名', DEFAULT_PROJECT_ID);
    const project = created?.project || makeProject('未命名', DEFAULT_PROJECT_ID);
    await ProjectStore.saveGraph(DEFAULT_PROJECT_ID, {
      project,
      nodes: [],
      edges: [],
      assets: [],
      history: [],
      designSpacePackage: null,
    });
    summaries = await listBackendProjects();
  }

  let currentId = readCurrentProjectId();
  if (!summaries.some((project) => project.id === currentId)) {
    currentId = summaries[0]?.id || DEFAULT_PROJECT_ID;
  }

  let payload = await ProjectStore.open(currentId);
  if (!payload) {
    currentId = summaries[0]?.id || DEFAULT_PROJECT_ID;
    payload = await ProjectStore.open(currentId);
  }
  if (!payload) {
    payload = await ProjectStore.create('未命名', DEFAULT_PROJECT_ID);
  }

  const normalized = normalizePayload(payload, currentId, backendBaseUrl);
  runWithoutPersistence(() => {
    projectListActions.setProjects(summaries.length ? summaries : [makeProjectSummary(normalized.project)]);
    projectListActions.setCurrentProjectId(normalized.project.id);
    canvasActions.setActiveProject(normalized.project, normalized.nodes, normalized.edges);
    libraryActions.setAssets(normalized.assets);
    libraryActions.setHistory(normalized.history);
    applyDesignSpacePackage(normalized.project.id, normalized.designSpacePackage);
  });
  writeCurrentProjectId(normalized.project.id);
  return normalized;
}

async function switchBackendProject(projectId) {
  if (!projectId) return null;
  const previousCheckpoint = checkpointProjectBeforeSwitch();

  const runtime = await ProjectStore.runtime();
  const backendBaseUrl = runtime?.backendBaseUrl || '';
  let payload = await ProjectStore.open(projectId);
  if (!payload) {
    payload = await ProjectStore.create('未命名', projectId);
  }
  const normalized = applyProjectPayload(payload, backendBaseUrl);
  const currentSummary = makeProjectSummary(
    normalized.project,
    normalized.nodes,
    normalized.edges,
    normalized.assets,
    normalized.history,
  );
  runWithoutPersistence(() => {
    projectListActions.upsertSummary(currentSummary);
    if (previousCheckpoint?.summary) projectListActions.upsertSummary(previousCheckpoint.summary);
  });
  queueBackendSnapshotSave(previousCheckpoint);
  queueBackendProjectListRefresh(previousCheckpoint, currentSummary);
  return normalized;
}

async function createBackendProject(name, seed = {}) {
  const trimmed = (name || '').trim() || '未命名项目';
  const projectId = makeProjectId(trimmed);
  await flushBackendCanvasNow();

  const created = await ProjectStore.create(trimmed, projectId);
  const project = { ...makeProject(trimmed, projectId), ...(created?.project || {}), id: projectId, name: trimmed };
  const nodes = cloneData(seed.nodes || []);
  const edges = cloneData(seed.edges || []);
  const snapshot = { project, nodes, edges, assets: [], history: [], designSpacePackage: null };
  await ProjectStore.saveGraph(projectId, snapshot);

  const runtime = await ProjectStore.runtime();
  const normalized = normalizePayload(snapshot, projectId, runtime?.backendBaseUrl || '');
  runWithoutPersistence(() => {
    canvasActions.setActiveProject(normalized.project, normalized.nodes, normalized.edges);
    libraryActions.setAssets([]);
    libraryActions.setHistory([]);
    applyDesignSpacePackage(projectId, null);
    projectListActions.upsertSummary(makeProjectSummary(project, nodes, edges, [], []));
    projectListActions.setCurrentProjectId(projectId);
  });
  writeCurrentProjectId(projectId);

  try {
    const summaries = await listBackendProjects();
    runWithoutPersistence(() => projectListActions.setProjects(summaries));
  } catch (error) {
    console.warn('Failed to refresh backend project list', error);
  }
  return normalized;
}

// ─── PUBLIC LIFECYCLE API ─────────────────────────────────────────

export function bootstrapPersistence() {
  if (EMBED_MODE) {
    persistenceBootstrapped = true;
    return Promise.resolve(null);
  }
  if (!backendAvailable()) {
    try {
      bootstrapLocalPersistence();
    } finally {
      persistenceBootstrapped = true;
    }
    return Promise.resolve(null);
  }
  return bootstrapBackendPersistence().catch((error) => {
    markBackendUnavailable();
    console.warn('Backend persistence bootstrap failed; using localStorage fallback', error);
    bootstrapLocalPersistence();
    return null;
  }).finally(() => {
    persistenceBootstrapped = true;
  });
}

export function switchProject(projectId) {
  if (!projectId || EMBED_MODE) return Promise.resolve(null);
  if (!backendAvailable()) return Promise.resolve(switchLocalProject(projectId));
  return switchBackendProject(projectId).catch((error) => {
    markBackendUnavailable();
    console.warn('Backend project switch failed; using localStorage fallback', error);
    return switchLocalProject(projectId);
  });
}

export function createAndSwitchProject(name, seed = {}) {
  if (EMBED_MODE || !backendAvailable()) return Promise.resolve(createLocalProject(name, seed));
  return createBackendProject(name, seed).catch((error) => {
    markBackendUnavailable();
    console.warn('Backend project create failed; using localStorage fallback', error);
    return createLocalProject(name, seed);
  });
}

export async function readProjectPayloadForArchive(projectId) {
  if (EMBED_MODE) throw new Error('当前嵌入模式不支持项目导出');
  const targetId = projectId || projectListStore.getState().currentProjectId || readCurrentProjectId();
  if (!targetId) throw new Error('请选择要导出的项目');

  await flushCanvasNow();

  if (backendAvailable()) {
    try {
      const payload = await ProjectStore.open(targetId);
      if (payload) return cloneData(payload);
    } catch (error) {
      console.warn('Backend project export read failed; trying local checkpoint', error);
    }
  }

  const stored = readCanvasState(targetId);
  if (stored) {
    return {
      project: stored.project || makeProject('未命名', targetId),
      nodes: stored.nodes || [],
      edges: stored.edges || [],
      assets: stored.assets || [],
      history: stored.history || [],
      designSpacePackage: stored.designSpacePackage || null,
      jobs: [],
      prompts: [],
    };
  }

  const current = canvasStore.getState();
  if ((current.projectId || current.project?.id) === targetId) {
    const snapshot = buildSnapshot();
    return {
      project: snapshot.project,
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      assets: snapshot.assets,
      history: snapshot.history,
      designSpacePackage: snapshot.designSpacePackage || null,
      jobs: [],
      prompts: [],
    };
  }

  throw new Error('未找到可导出的项目数据');
}

export async function prepareProjectImportTarget(projectId, name = '导入项目') {
  if (!projectId || EMBED_MODE || !backendAvailable()) return null;
  try {
    return await ProjectStore.create(name || '导入项目', projectId);
  } catch (error) {
    console.warn('Backend import project shell create failed; continuing with fallback if possible', error);
    return null;
  }
}

function activateImportedLocalPayload(payload) {
  const projectId = payload?.project?.id;
  if (!projectId) throw new Error('导入项目缺少项目 ID');
  const snapshot = {
    projectId,
    project: payload.project,
    nodes: payload.nodes || [],
    edges: payload.edges || [],
    assets: payload.assets || [],
    history: payload.history || [],
    designSpacePackage: payload.designSpacePackage || null,
  };
  writeLocalCheckpoint(projectId, snapshot);
  runWithoutPersistence(() => {
    canvasActions.setActiveProject(snapshot.project, snapshot.nodes, snapshot.edges);
    libraryActions.setAssets(snapshot.assets);
    libraryActions.setHistory(snapshot.history);
    applyDesignSpacePackage(projectId, snapshot.designSpacePackage);
    projectListActions.upsertSummary(makeProjectSummary(
      snapshot.project,
      snapshot.nodes,
      snapshot.edges,
      snapshot.assets,
      snapshot.history,
    ));
    projectListActions.setCurrentProjectId(projectId);
  });
  writeCurrentProjectId(projectId);
  return snapshot;
}

export async function saveImportedProjectPayload(payload) {
  if (!payload?.project?.id) throw new Error('导入项目缺少项目 ID');
  const projectId = payload.project.id;
  await flushCanvasNow();

  if (backendAvailable()) {
    try {
      await ProjectStore.create(payload.project.name || '导入项目', projectId);
      await ProjectStore.saveGraph(projectId, {
        project: payload.project,
        nodes: payload.nodes || [],
        edges: payload.edges || [],
        assets: payload.assets || [],
        history: payload.history || [],
        designSpacePackage: payload.designSpacePackage || null,
        allowEmptyOverwrite: true,
      });
      const runtime = await ProjectStore.runtime();
      const normalized = applyProjectPayload(payload, runtime?.backendBaseUrl || '');
      try {
        const summaries = await listBackendProjects();
        runWithoutPersistence(() => projectListActions.setProjects(summaries));
        writeProjectSummaries(summaries);
      } catch (error) {
        console.warn('Failed to refresh project list after import', error);
        runWithoutPersistence(() => projectListActions.upsertSummary(makeProjectSummary(
          normalized.project,
          normalized.nodes,
          normalized.edges,
          normalized.assets,
          normalized.history,
        )));
      }
      return normalized;
    } catch (error) {
      console.warn('Backend project import failed; using localStorage fallback', error);
    }
  }

  return activateImportedLocalPayload(payload);
}

function deleteLocalProject(projectId) {
  if (!projectId || projectId === DEFAULT_PROJECT_ID || EMBED_MODE) return null;
  const { projects, currentProjectId } = projectListStore.getState();
  const remaining = projects.filter((project) => project.id !== projectId);
  removeLocalProjectData(projectId);
  runWithoutPersistence(() => {
    projectListActions.setProjects(remaining);
    if (currentProjectId === projectId) projectListActions.setCurrentProjectId(remaining[0]?.id || DEFAULT_PROJECT_ID);
  });
  writeProjectSummaries(remaining);
  if (currentProjectId === projectId) {
    if (remaining.length) return activateLocalProject(remaining[0].id);
    return createLocalProject('未命名项目', { nodes: [], edges: [] });
  }
  return { ok: true, projectId };
}

async function deleteBackendProject(projectId) {
  if (!projectId || projectId === DEFAULT_PROJECT_ID) return null;
  const currentProjectId = projectListStore.getState().currentProjectId || readCurrentProjectId();
  await ProjectStore.delete(projectId);
  removeLocalProjectData(projectId);

  let summaries = [];
  try {
    summaries = await listBackendProjects();
  } catch (error) {
    summaries = projectListStore.getState().projects.filter((project) => project.id !== projectId);
  }

  if (currentProjectId !== projectId) {
    runWithoutPersistence(() => projectListActions.setProjects(summaries));
    writeProjectSummaries(summaries);
    return { ok: true, projectId };
  }

  const nextId = summaries[0]?.id || DEFAULT_PROJECT_ID;
  const runtime = await ProjectStore.runtime();
  let payload = await ProjectStore.open(nextId);
  if (!payload) {
    payload = await ProjectStore.create('未命名项目', nextId);
    await ProjectStore.saveGraph(nextId, {
      project: payload?.project || makeProject('未命名项目', nextId),
      nodes: [],
      edges: [],
      assets: [],
      history: [],
      designSpacePackage: null,
    });
    summaries = await listBackendProjects();
    payload = await ProjectStore.open(nextId);
  }
  runWithoutPersistence(() => projectListActions.setProjects(summaries));
  applyProjectPayload(payload, runtime?.backendBaseUrl || '');
  return { ok: true, projectId, nextProjectId: nextId };
}

export function deleteProject(projectId) {
  if (!projectId || EMBED_MODE || projectId === DEFAULT_PROJECT_ID) return Promise.resolve(null);
  if (!backendAvailable()) return Promise.resolve(deleteLocalProject(projectId));
  return deleteBackendProject(projectId).catch((error) => {
    console.warn('Backend project delete failed; using localStorage fallback', error);
    return deleteLocalProject(projectId);
  });
}

// ─── AUTOSAVE ─────────────────────────────────────────────────────

function isLiveStatus(value) {
  return ['queued', 'running', 'processing', 'generating'].includes(String(value || '').toLowerCase());
}

function isPlainRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function changedKeys(before = {}, after = {}) {
  const keys = new Set([
    ...Object.keys(isPlainRecord(before) ? before : {}),
    ...Object.keys(isPlainRecord(after) ? after : {}),
  ]);
  return Array.from(keys).filter((key) => !Object.is(before?.[key], after?.[key]));
}

function isLiveNodeUpdate(before, after) {
  return Boolean(after?.generating)
    || isLiveStatus(after?.status)
    || isLiveStatus(after?.focusAnalysisStatus)
    || (Boolean(after?.jobId) && !before?.src && !after?.src && !before?.videoSrc && !after?.videoSrc);
}

function isHotSettingsChange(before, after, liveNodeUpdate) {
  if (!liveNodeUpdate) return false;
  if (!isPlainRecord(before) && !isPlainRecord(after)) return false;
  return changedKeys(before || {}, after || {}).every((key) => NODE_LIVE_SETTINGS_KEYS.has(key));
}

function isHotNodeChange(before, after) {
  if (before === after) return true;
  if (!before || !after || before.id !== after.id || before.type !== after.type) return false;
  const liveNodeUpdate = isLiveNodeUpdate(before, after);
  return changedKeys(before, after).every((key) => {
    if (NODE_HOT_STATE_KEYS.has(key)) return true;
    if (liveNodeUpdate && NODE_LIVE_JOB_KEYS.has(key)) return true;
    if (key === 'settings') return isHotSettingsChange(before.settings, after.settings, liveNodeUpdate);
    return false;
  });
}

function isCanvasHotStateOnlyChange(before, after) {
  if (!before || !after || before === after) return false;
  if (before.projectId !== after.projectId || before.project !== after.project || before.edges !== after.edges) return false;
  if (before.nodes === after.nodes) return false;
  const beforeNodes = before.nodes || [];
  const afterNodes = after.nodes || [];
  if (!Array.isArray(beforeNodes) || !Array.isArray(afterNodes) || beforeNodes.length !== afterNodes.length) return false;
  for (let index = 0; index < afterNodes.length; index += 1) {
    if (!isHotNodeChange(beforeNodes[index], afterNodes[index])) return false;
  }
  return true;
}

function isCanvasLayoutOnlyChange(before, after) {
  if (!before || !after || before === after) return false;
  return (
    before.projectId === after.projectId
    && before.project === after.project
    && before.edges === after.edges
    && before.nodeDataVersion === after.nodeDataVersion
    && before.nodes !== after.nodes
    && isLayoutOnlyNodesChange(before.nodes, after.nodes)
  );
}

function singleNodeSaveCandidate(before, after) {
  if (!before || !after || before === after) return null;
  if (before.projectId !== after.projectId || before.project !== after.project || before.edges !== after.edges) return null;
  if (before.nodes === after.nodes) return null;
  const beforeNodes = before.nodes || [];
  const afterNodes = after.nodes || [];
  if (!Array.isArray(beforeNodes) || !Array.isArray(afterNodes) || beforeNodes.length !== afterNodes.length) return null;
  let changedNode = null;
  for (let index = 0; index < afterNodes.length; index += 1) {
    const beforeNode = beforeNodes[index];
    const afterNode = afterNodes[index];
    if (beforeNode === afterNode) continue;
    if (!beforeNode?.id || !afterNode?.id || beforeNode.id !== afterNode.id) return null;
    if (changedNode) return null;
    changedNode = afterNode;
  }
  return changedNode ? canonicalizeMediaForStorage(sanitizeNodeProviderFields(changedNode)) : null;
}

function diffGraphItemsById(beforeItems = [], afterItems = []) {
  const beforeById = new Map();
  const afterById = new Map();
  for (const item of beforeItems || []) {
    if (item?.id) beforeById.set(item.id, item);
  }
  for (const item of afterItems || []) {
    if (item?.id) afterById.set(item.id, item);
  }
  const added = [];
  const removed = [];
  const changed = [];
  afterById.forEach((afterItem, id) => {
    const beforeItem = beforeById.get(id);
    if (!beforeItem) {
      added.push(afterItem);
      return;
    }
    if (beforeItem !== afterItem) changed.push(afterItem);
  });
  beforeById.forEach((beforeItem, id) => {
    if (!afterById.has(id)) removed.push(beforeItem);
  });
  return { added, removed, changed };
}

function singleNodeAddCandidate(before, after) {
  if (!before || !after || before === after) return null;
  if (before.projectId !== after.projectId || before.project !== after.project || before.edges !== after.edges) return null;
  if (before.nodes === after.nodes) return null;
  const beforeNodes = before.nodes || [];
  const afterNodes = after.nodes || [];
  if (!Array.isArray(beforeNodes) || !Array.isArray(afterNodes) || afterNodes.length !== beforeNodes.length + 1) return null;
  const diff = diffGraphItemsById(beforeNodes, afterNodes);
  if (diff.added.length !== 1 || diff.removed.length || diff.changed.length) return null;
  return canonicalizeMediaForStorage(sanitizeNodeProviderFields(diff.added[0]));
}

function graphEdgePatch(edge) {
  const id = String(edge?.id || '').trim();
  const from = String(edge?.from || '').trim();
  const to = String(edge?.to || '').trim();
  if (!id || !from || !to) return null;
  return { id, from, to };
}

function smallGraphPatchCandidate(before, after) {
  if (!before || !after || before === after) return null;
  if (before.projectId !== after.projectId || before.project !== after.project) return null;
  if (before.nodes === after.nodes && before.edges === after.edges) return null;
  const beforeNodes = before.nodes || [];
  const afterNodes = after.nodes || [];
  const beforeEdges = before.edges || [];
  const afterEdges = after.edges || [];
  if (
    !Array.isArray(beforeNodes)
    || !Array.isArray(afterNodes)
    || !Array.isArray(beforeEdges)
    || !Array.isArray(afterEdges)
  ) return null;
  const nodeDiff = diffGraphItemsById(beforeNodes, afterNodes);
  const edgeDiff = diffGraphItemsById(beforeEdges, afterEdges);
  if (nodeDiff.changed.length || edgeDiff.changed.length) return null;
  const mutationCount = nodeDiff.added.length
    + nodeDiff.removed.length
    + edgeDiff.added.length
    + edgeDiff.removed.length;
  if (!mutationCount) return null;
  if (nodeDiff.added.length > 4 || nodeDiff.removed.length > 4 || edgeDiff.added.length > 8 || edgeDiff.removed.length > 8) return null;
  const edgesUpsert = edgeDiff.added.map(graphEdgePatch);
  if (edgesUpsert.some((edge) => !edge)) return null;
  return {
    nodesUpsert: nodeDiff.added.map((node) => canonicalizeMediaForStorage(sanitizeNodeProviderFields(node))),
    nodeIdsDelete: nodeDiff.removed.map((node) => node.id).filter(Boolean),
    edgesUpsert,
    edgeIdsDelete: edgeDiff.removed.map((edge) => edge.id).filter(Boolean),
  };
}

function persistSingleNodeChange(projectId, node) {
  if (!projectId || !node?.id) {
    scheduleSave();
    return;
  }
  if (!backendAvailable() || backendSaveInFlight) {
    scheduleSave();
    return;
  }
  void ProjectStore.saveNode(projectId, node).catch((error) => {
    console.warn('Failed to patch node to backend; falling back to full graph save', error);
    scheduleSave();
  });
}

function persistGraphPatch(projectId, patch) {
  if (!projectId || !patch) {
    scheduleSave();
    return;
  }
  if (!backendAvailable() || backendSaveInFlight || typeof ProjectStore.patchGraph !== 'function') {
    scheduleSave();
    return;
  }
  void ProjectStore.patchGraph(projectId, patch).catch((error) => {
    console.warn('Failed to patch graph to backend; falling back to full graph save', error);
    scheduleSave();
  });
}

function scheduleSave() {
  if (suppressPersistence || EMBED_MODE || !persistenceBootstrapped) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void flushCanvasNow();
  }, SAVE_DEBOUNCE_MS);
}

const DESIGN_SELECTION_HOT_KEYS = new Set(['selectedCardId', 'activeTab', 'updatedAt']);

// 选中/切换卡片只改变 selectedCardId、activeTab 这类 UI 高频状态，但每次变更都会
// 触发 scheduleSave -> buildSnapshot，进而把整个项目（全部节点、素材、历史与设计图）
// 同步 JSON 序列化写入 localStorage，造成切换卡片时的明显卡顿。此处仅当变更局限于这些
// 高频状态时跳过保存，最新选中态仍会被下一次实质性保存或关闭前的 flush 捕获。
function isDesignSpaceSelectionOnlyChange(before, after) {
  if (!before || !after || before === after) return false;
  const beforePackages = before.packagesByProject || {};
  const afterPackages = after.packagesByProject || {};
  const beforeKeys = Object.keys(beforePackages);
  const afterKeys = Object.keys(afterPackages);
  if (beforeKeys.length !== afterKeys.length) return false;
  let changed = false;
  for (const projectId of afterKeys) {
    const beforePkg = beforePackages[projectId];
    const afterPkg = afterPackages[projectId];
    if (beforePkg === afterPkg) continue;
    if (!beforePkg || !afterPkg) return false;
    changed = true;
    const keys = new Set([...Object.keys(beforePkg), ...Object.keys(afterPkg)]);
    for (const key of keys) {
      if (DESIGN_SELECTION_HOT_KEYS.has(key)) continue;
      if (!Object.is(beforePkg[key], afterPkg[key])) return false;
    }
  }
  return changed;
}

function scheduleDesignSpaceSave() {
  const previous = lastDesignSpaceState;
  const next = designSpaceStore.getState();
  lastDesignSpaceState = next;
  if (isDesignSpaceSelectionOnlyChange(previous, next)) return;
  scheduleSave();
}

function scheduleLibrarySave() {
  if (suppressPersistence || EMBED_MODE || !persistenceBootstrapped) return;
  if (!backendAvailable()) {
    scheduleSave();
    return;
  }
  clearTimeout(librarySaveTimer);
  librarySaveTimer = setTimeout(() => {
    void flushBackendLibraryNow().catch((error) => {
      console.warn('Failed to save project library to backend', error);
    });
  }, SAVE_DEBOUNCE_MS);
}

function persistLayoutOnlyChange(before, after) {
  if (suppressPersistence || EMBED_MODE || !persistenceBootstrapped) return;
  const projectId = after?.projectId || after?.project?.id || DEFAULT_PROJECT_ID;
  queueLayoutPatches(projectId, collectLayoutPatches(before?.nodes, after?.nodes));
}

function scheduleCanvasSave() {
  const previous = lastCanvasAutosaveState;
  const next = canvasStore.getState();
  lastCanvasAutosaveState = next;
  if (isCanvasLayoutOnlyChange(previous, next)) {
    persistLayoutOnlyChange(previous, next);
    return;
  }
  if (isCanvasHotStateOnlyChange(previous, next)) {
    return;
  }
  const nodePatch = singleNodeSaveCandidate(previous, next);
  if (nodePatch) {
    const projectId = next?.projectId || next?.project?.id || DEFAULT_PROJECT_ID;
    clearLayoutPatches(projectId);
    persistSingleNodeChange(projectId, nodePatch);
    return;
  }
  const nodeAddPatch = singleNodeAddCandidate(previous, next);
  if (nodeAddPatch) {
    const projectId = next?.projectId || next?.project?.id || DEFAULT_PROJECT_ID;
    clearLayoutPatches(projectId);
    persistSingleNodeChange(projectId, nodeAddPatch);
    return;
  }
  const graphPatch = smallGraphPatchCandidate(previous, next);
  if (graphPatch) {
    const projectId = next?.projectId || next?.project?.id || DEFAULT_PROJECT_ID;
    clearLayoutPatches(projectId);
    persistGraphPatch(projectId, graphPatch);
    return;
  }
  discardPendingLayoutPatches(next?.projectId || next?.project?.id || DEFAULT_PROJECT_ID);
  scheduleSave();
}

export function flushCanvasNow() {
  if (EMBED_MODE) return Promise.resolve(null);
  persistenceBootstrapped = true;
  clearTimeout(saveTimer);
  clearTimeout(librarySaveTimer);
  flushPendingLayoutPatches();
  saveTimer = null;
  librarySaveTimer = null;
  if (backendAvailable()) return flushBackendCanvasNow();
  return Promise.resolve(flushLocalCanvasNow());
}

export function flushCanvasForClose() {
  if (EMBED_MODE) return Promise.resolve({ localCheckpoint: false, backendQueued: false });
  persistenceBootstrapped = true;
  clearTimeout(saveTimer);
  clearTimeout(librarySaveTimer);
  flushPendingLayoutPatches();
  saveTimer = null;
  librarySaveTimer = null;

  const snapshot = buildSnapshot();
  if (!snapshot.projectId) return Promise.resolve({ localCheckpoint: false, backendQueued: false });

  writeLocalCheckpoint(snapshot.projectId, snapshot);
  const summary = makeProjectSummary(snapshot.project, snapshot.nodes, snapshot.edges, snapshot.assets, snapshot.history);
  projectListActions.upsertSummary(summary);
  writeCurrentProjectId(snapshot.projectId);

  const backendQueued = backendAvailable();
  if (backendQueued) {
    void flushBackendCanvasNow().catch((error) => {
      console.warn('Background project save during close failed; local checkpoint is available', error);
    });
  }

  return Promise.resolve({ localCheckpoint: true, backendQueued });
}

function scheduleProjectListSave() {
  if (suppressPersistence || EMBED_MODE || !persistenceBootstrapped) return;
  if (typeof queueMicrotask === 'function') queueMicrotask(persistProjectList);
  else setTimeout(persistProjectList, 0);
}

function persistProjectList() {
  const { projects, currentProjectId } = projectListStore.getState();
  writeProjectSummaries(projects);
  writeCurrentProjectId(currentProjectId);
}

export function startPersistenceSubscriptions() {
  if (EMBED_MODE || persistenceSubscriptionsStarted) return;
  persistenceSubscriptionsStarted = true;

  canvasStore.subscribe(scheduleCanvasSave);
  libraryStore.subscribe(scheduleLibrarySave);
  designSpaceStore.subscribe(scheduleDesignSpaceSave);
  projectListStore.subscribe(scheduleProjectListSave);

  if (typeof window !== 'undefined') {
    window.__libaiFlushCanvasNow = () => flushCanvasNow();
    window.__libaiFlushCanvasForClose = () => flushCanvasForClose();
    const flushForLifecycle = () => {
      if (!persistenceBootstrapped) return;
      void flushCanvasNow();
    };
    window.addEventListener('pagehide', flushForLifecycle);
    window.addEventListener('beforeunload', flushForLifecycle);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushForLifecycle();
      });
    }
  }
}
