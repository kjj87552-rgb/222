function hasFunction(value) {
  return typeof value === 'function';
}

export function getRuntimeCapabilities() {
  const bridge = typeof window !== 'undefined' ? window.libai : null;
  return {
    mode: bridge ? 'desktop' : 'web',
    canPickFiles: hasFunction(bridge?.system?.pickFiles),
    canPickFolder: hasFunction(bridge?.system?.pickFolder),
    canListFolder: hasFunction(bridge?.system?.listFolder),
    canSaveFile: hasFunction(bridge?.system?.saveFile),
    canUseAutoUpdate: hasFunction(bridge?.update?.check),
    canControlWindow: hasFunction(bridge?.window?.minimize),
  };
}

export function isWebRuntime() {
  return getRuntimeCapabilities().mode === 'web';
}
