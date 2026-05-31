export const GENERATION_PARAMETER_UPDATE_SOURCE = 'node-workbench:user-params';

const GENERATION_PARAMETER_NODE_TYPES = new Set(['image', 'video']);

const GENERATION_PARAMETER_KEYS = [
  'ratio',
  'resolution',
  'durationSeconds',
  'seedanceMode',
  'audioOn',
  'count',
  'generationMode',
  'workbenchModel',
  'providerModelId',
  'modelName',
  'provider',
  'style',
  'styleId',
  'styleName',
  'stylePrompt',
  'stylePreset',
];

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function cloneDefaultValue(value) {
  if (Array.isArray(value)) return value.slice();
  if (isPlainObject(value)) return { ...value };
  return value;
}

function pickGenerationParameterPatch(patch) {
  if (!isPlainObject(patch)) return null;
  const picked = {};
  for (const key of GENERATION_PARAMETER_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
    if (patch[key] === undefined) continue;
    picked[key] = cloneDefaultValue(patch[key]);
  }
  return Object.keys(picked).length ? picked : null;
}

export function captureGenerationParameterDefaults(defaults = {}, node, patch, meta = {}) {
  if (meta?.source !== GENERATION_PARAMETER_UPDATE_SOURCE) return defaults;
  const type = node?.type;
  if (!GENERATION_PARAMETER_NODE_TYPES.has(type)) return defaults;
  const picked = pickGenerationParameterPatch(patch);
  if (!picked) return defaults;
  return {
    ...defaults,
    [type]: {
      ...(defaults[type] || {}),
      ...picked,
    },
  };
}

export function applyGenerationParameterDefaults(node, defaults = {}) {
  const type = node?.type;
  if (!GENERATION_PARAMETER_NODE_TYPES.has(type)) return node;
  const nodeDefaults = defaults[type];
  if (!isPlainObject(nodeDefaults) || !Object.keys(nodeDefaults).length) return node;
  const clonedDefaults = {};
  for (const [key, value] of Object.entries(nodeDefaults)) {
    clonedDefaults[key] = cloneDefaultValue(value);
  }
  return {
    ...node,
    ...clonedDefaults,
  };
}
