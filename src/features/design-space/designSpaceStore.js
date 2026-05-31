import { useSyncExternalStore } from 'react';
import { createStore } from '../../shared/store/createStore.js';
import { createEmptyDesignSpacePackage } from './designSpacePackage.js';

export const designSpaceStore = createStore({
  packagesByProject: {},
});

export const useDesignSpacePackage = (projectId) =>
  useSyncExternalStore(
    designSpaceStore.subscribe,
    () => designSpaceStore.getState().packagesByProject[projectId] || null,
    () => designSpaceStore.getState().packagesByProject[projectId] || null,
  );

function hasPatchChanges(current, patch) {
  return Object.entries(patch).some(([key, value]) => !Object.is(current[key], value));
}

export const designSpaceActions = {
  reset: () => designSpaceStore.setState(() => ({ packagesByProject: {} })),

  setPackage: (projectId, pkg) => {
    if (!projectId || !pkg) return;
    designSpaceStore.setState((state) => ({
      ...state,
      packagesByProject: { ...state.packagesByProject, [projectId]: pkg },
    }));
  },

  clearPackage: (projectId) => {
    if (!projectId) return;
    designSpaceStore.setState((state) => {
      if (!state.packagesByProject[projectId]) return state;
      const nextPackages = { ...state.packagesByProject };
      delete nextPackages[projectId];
      return { ...state, packagesByProject: nextPackages };
    });
  },

  ensurePackage: (projectId, seed = {}) => {
    if (!projectId) return;
    designSpaceStore.setState((state) => {
      if (state.packagesByProject[projectId]) return state;
      return {
        ...state,
        packagesByProject: {
          ...state.packagesByProject,
          [projectId]: createEmptyDesignSpacePackage({ projectId, title: seed.title || '设计空间' }),
        },
      };
    });
  },

  patchPackage: (projectId, patch) => {
    if (!projectId || !patch) return;
    designSpaceStore.setState((state) => {
      const current = state.packagesByProject[projectId];
      if (!current) {
        const next = { ...createEmptyDesignSpacePackage({ projectId }), ...patch };
        return {
          ...state,
          packagesByProject: { ...state.packagesByProject, [projectId]: next },
        };
      }
      if (!hasPatchChanges(current, patch)) return state;
      const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return {
        ...state,
        packagesByProject: { ...state.packagesByProject, [projectId]: next },
      };
    });
  },

  selectCard: (projectId, cardId) => {
    designSpaceActions.patchPackage(projectId, { selectedCardId: cardId });
  },
};
