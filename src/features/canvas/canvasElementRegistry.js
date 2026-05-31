import React from 'react';

export function createCanvasElementRegistry() {
  return {
    nodes: new Map(),
    workbenches: new Map(),
    groups: new Map(),
    backgroundPanels: new Map(),
  };
}

export const CanvasElementRegistryContext = React.createContext(null);

export function useRegisterCanvasElement(kind, id) {
  const registry = React.useContext(CanvasElementRegistryContext);

  return React.useCallback((element) => {
    if (!registry || !id) return;
    const bucket = registry[kind];
    if (!bucket) return;
    if (element) {
      bucket.set(id, element);
      return;
    }
    bucket.delete(id);
  }, [registry, kind, id]);
}

