/* Project-level creation assets — keyCharacters / keyProps / sceneAnalysis.
 *
 * Persistence: piggybacks on PromptStore (no new backend endpoint).
 * Each project's assets are stored as a single PromptStore record with
 * title `_user.projectAssets.{projectId}` and content = JSON.stringify(payload).
 *
 * The store itself only holds in-memory state per projectId; the persistence
 * loader/saver is wired by the orchestrator + workbench.
 */

import { createStore } from './createStore.js';

export const EMPTY_ASSETS = Object.freeze({
  keyCharacters: [],
  keyProps: [],
  sceneAnalysis: [],
});

export const projectAssetsStore = createStore({
  /** @type {Map<string, ProjectAssets>} */
  byProject: new Map(),
});

export const useProjectAssets = (projectId) =>
  projectAssetsStore.useSelector((s) => s.byProject.get(projectId) || EMPTY_ASSETS);

function withProject(state, projectId, mutator) {
  const next = new Map(state.byProject);
  const current = next.get(projectId) || { ...EMPTY_ASSETS, projectId, updatedAt: null };
  const mutated = mutator({
    keyCharacters: [...(current.keyCharacters || [])],
    keyProps: [...(current.keyProps || [])],
    sceneAnalysis: [...(current.sceneAnalysis || [])],
  });
  next.set(projectId, {
    ...mutated,
    projectId,
    updatedAt: new Date().toISOString(),
  });
  return { ...state, byProject: next };
}

function upsertById(list, item) {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const out = list.slice();
    out[idx] = { ...out[idx], ...item };
    return out;
  }
  return [...list, item];
}

function removeById(list, id) {
  return list.filter((x) => x.id !== id);
}

export const projectAssetsActions = {
  setAssets: (projectId, assets) => projectAssetsStore.setState((s) =>
    withProject(s, projectId, () => ({
      keyCharacters: assets?.keyCharacters || [],
      keyProps: assets?.keyProps || [],
      sceneAnalysis: assets?.sceneAnalysis || [],
    }))
  ),
  upsertCharacter: (projectId, character) => projectAssetsStore.setState((s) =>
    withProject(s, projectId, (cur) => ({ ...cur, keyCharacters: upsertById(cur.keyCharacters, character) }))
  ),
  upsertProp: (projectId, prop) => projectAssetsStore.setState((s) =>
    withProject(s, projectId, (cur) => ({ ...cur, keyProps: upsertById(cur.keyProps, prop) }))
  ),
  upsertScene: (projectId, scene) => projectAssetsStore.setState((s) =>
    withProject(s, projectId, (cur) => ({ ...cur, sceneAnalysis: upsertById(cur.sceneAnalysis, scene) }))
  ),
  removeCharacter: (projectId, id) => projectAssetsStore.setState((s) =>
    withProject(s, projectId, (cur) => ({ ...cur, keyCharacters: removeById(cur.keyCharacters, id) }))
  ),
  removeProp: (projectId, id) => projectAssetsStore.setState((s) =>
    withProject(s, projectId, (cur) => ({ ...cur, keyProps: removeById(cur.keyProps, id) }))
  ),
  removeScene: (projectId, id) => projectAssetsStore.setState((s) =>
    withProject(s, projectId, (cur) => ({ ...cur, sceneAnalysis: removeById(cur.sceneAnalysis, id) }))
  ),
};

/* Stable id generator — used by AssetsTab when user manually adds a card. */
export function makeAssetId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      // Strip dashes for shorter id; UUID v4 has 122 bits of entropy.
      return crypto.randomUUID().replace(/-/g, '');
    }
  } catch (_) { /* fallback below */ }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/* Persistence helpers. */

const PROMPT_TITLE_PREFIX = '_user.projectAssets.';

export function projectAssetsPromptTitle(projectId) {
  return `${PROMPT_TITLE_PREFIX}${projectId}`;
}

export async function loadProjectAssets(projectId, PromptStore) {
  if (!projectId || !PromptStore?.list) return null;
  try {
    const res = await PromptStore.list();
    const list = Array.isArray(res?.prompts) ? res.prompts : [];
    const row = list.find((p) => p.title === projectAssetsPromptTitle(projectId));
    if (!row?.content) return null;
    const parsed = JSON.parse(row.content);
    return {
      keyCharacters: parsed.keyCharacters || [],
      keyProps: parsed.keyProps || [],
      sceneAnalysis: parsed.sceneAnalysis || [],
      _promptId: row.id,
    };
  } catch (error) {
    console.warn('[projectAssets] load failed', error);
    return null;
  }
}

export async function saveProjectAssets(projectId, assets, PromptStore) {
  if (!projectId || !PromptStore) {
    return { ok: false, error: 'missing projectId or PromptStore' };
  }
  const title = projectAssetsPromptTitle(projectId);
  const payload = {
    keyCharacters: assets.keyCharacters || [],
    keyProps: assets.keyProps || [],
    sceneAnalysis: assets.sceneAnalysis || [],
  };
  try {
    const res = await PromptStore.list();
    const list = Array.isArray(res?.prompts) ? res.prompts : [];
    const existing = list.find((p) => p.title === title);
    if (existing) {
      await PromptStore.update(existing.id, { content: JSON.stringify(payload) });
    } else {
      await PromptStore.create({
        title,
        scope: 'project',
        category: 'storyboard.kb.projectAssets',
        tags: ['user', 'storyboard', 'project-assets'],
        meta: { projectId, kbType: 'projectAssets' },
        content: JSON.stringify(payload),
      });
    }
    return { ok: true };
  } catch (error) {
    console.warn('[projectAssets] save failed', error);
    return { ok: false, error: String(error?.message || error) };
  }
}
