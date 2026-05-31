/* Project list store — metadata summaries only.
 * Canvas state for the active project lives in canvasStore.
 *
 * Storage keys (managed externally by persistence layer):
 *   mancrea.projects.v1          — array of project summaries
 *   mancrea.currentProjectId.v1  — id of currently active project
 *
 * The default project (id="local-default") is always present as a seed.
 */
import { createStore } from './createStore.js';
import { DEFAULT_PROJECT_ID, makeProject, makeProjectSummary } from '../utils/asset.js';

export const projectListStore = createStore({
  projects:         [makeProjectSummary(makeProject())],
  currentProjectId: DEFAULT_PROJECT_ID,
});

// Hooks
export const useProjectList       = () => projectListStore.useSelector((s) => s.projects);
export const useCurrentProjectId  = () => projectListStore.useSelector((s) => s.currentProjectId);

// Actions
export const projectListActions = {
  setProjects: (projects) =>
    projectListStore.setState((s) => ({ ...s, projects })),

  setCurrentProjectId: (id) =>
    projectListStore.setState((s) => ({ ...s, currentProjectId: id || DEFAULT_PROJECT_ID })),

  upsertSummary: (summary) =>
    projectListStore.setState((s) => {
      const next = [summary, ...s.projects.filter((p) => p.id !== summary.id)];
      return {
        ...s,
        projects: next.sort((a, b) =>
          String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
        ),
      };
    }),

  removeProject: (id) =>
    projectListStore.setState((s) => ({
      ...s,
      projects:         s.projects.filter((p) => p.id !== id),
      currentProjectId: s.currentProjectId === id ? DEFAULT_PROJECT_ID : s.currentProjectId,
    })),

  renameProject: (id, name) =>
    projectListStore.setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
      ),
    })),
};
