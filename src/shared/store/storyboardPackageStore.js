import { canvasActions, canvasStore } from './canvasStore.js';
import {
  getNodeStoryboardPackage,
  patchStoryboardPackage,
} from '../../features/storyboard/package/storyboardPackage.js';
import {
  removeAssetBinding as removeAssetBindingFromList,
  upsertAssetBinding as upsertAssetBindingInList,
} from '../../features/storyboard/assetBindings.js';

const DEFAULT_PROJECT_ID = 'local-default';

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const makePackageContext = (node, projectId) => ({
  projectId,
  nodeId: node?.id,
});

const resolveProjectId = (projectId) => (
  projectId ?? canvasStore.getState()?.projectId ?? DEFAULT_PROJECT_ID
);

export const makeNodePackagePatch = (
  node,
  { projectId = DEFAULT_PROJECT_ID, sourceMode, packagePatch = {} } = {},
) => {
  const current = getNodeStoryboardPackage(node, makePackageContext(node, projectId));
  const nextPackage = patchStoryboardPackage(current, {
    ...(isPlainObject(packagePatch) ? packagePatch : {}),
    ...(sourceMode ? { sourceMode } : {}),
  });

  return {
    storyboardPackage: nextPackage,
    state: {
      ...node?.state,
      storyboardPackage: nextPackage,
    },
  };
};

export const nextNodeWithStoryboardPackage = (
  node,
  { projectId = DEFAULT_PROJECT_ID, sourceMode, updater } = {},
) => {
  const current = getNodeStoryboardPackage(node, makePackageContext(node, projectId));
  const updated = typeof updater === 'function' ? updater(current) : current;
  const nextPackage = patchStoryboardPackage(current, {
    ...(isPlainObject(updated) ? updated : {}),
    ...(sourceMode ? { sourceMode } : {}),
  });

  return {
    ...node,
    storyboardPackage: nextPackage,
    state: {
      ...node?.state,
      storyboardPackage: nextPackage,
    },
  };
};

export const storyboardPackageActions = {
  ensureNodePackage: (nodeId, { projectId, sourceMode } = {}) => {
    if (!nodeId) return;

    canvasActions.updateNode(nodeId, (node) => makeNodePackagePatch(node, {
      projectId: resolveProjectId(projectId),
      sourceMode,
    }));
  },

  updateNodePackage: (
    nodeId,
    { projectId, sourceMode, updater } = {},
  ) => {
    if (!nodeId || typeof updater !== 'function') return;

    canvasActions.updateNode(nodeId, (node) => {
      const next = nextNodeWithStoryboardPackage(node, {
        projectId: resolveProjectId(projectId),
        sourceMode,
        updater,
      });

      return {
        storyboardPackage: next.storyboardPackage,
        state: next.state,
      };
    });
  },

  upsertAssetBinding: (nodeId, { projectId, binding } = {}) => {
    if (!nodeId || !binding) return;
    storyboardPackageActions.updateNodePackage(nodeId, {
      projectId,
      updater: (pkg) => ({
        assetBindings: upsertAssetBindingInList(pkg.assetBindings, binding),
      }),
    });
  },

  removeAssetBinding: (nodeId, { projectId, bindingId } = {}) => {
    if (!nodeId || !bindingId) return;
    storyboardPackageActions.updateNodePackage(nodeId, {
      projectId,
      updater: (pkg) => ({
        assetBindings: removeAssetBindingFromList(pkg.assetBindings, bindingId),
      }),
    });
  },
};
