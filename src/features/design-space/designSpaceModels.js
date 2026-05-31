const DESIGN_PARSE_MODEL_CAPABILITIES = new Set([
  'text.generate',
  'text.reason',
  'inference.generate',
]);

export function designModelOptionId(model = {}) {
  return model.id || model.modelId || model.name || model.modelName || model.displayName || '';
}

export function designModelOptionLabel(model = {}) {
  return model.name || model.displayName || model.modelName || model.modelId || model.id || '未命名模型';
}

export function isDesignParseModel(model = {}) {
  const capability = String(model.capability || '').trim();
  return !capability || DESIGN_PARSE_MODEL_CAPABILITIES.has(capability);
}

export function designParseModelCapability(model = {}) {
  const capability = String(model.capability || '').trim();
  return DESIGN_PARSE_MODEL_CAPABILITIES.has(capability) ? capability : 'text.generate';
}

export function normalizeDesignParseModels(models = []) {
  const list = Array.isArray(models) ? models : [];
  const seen = new Set();
  return list
    .filter((model) => model?.enabled !== false)
    .filter(isDesignParseModel)
    .map((model) => {
      const id = designModelOptionId(model);
      return id && model.id === id ? model : { ...model, id };
    })
    .filter((model) => {
      const id = designModelOptionId(model);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

export function resolveDesignModel(models = [], modelId = '') {
  const list = normalizeDesignParseModels(models);
  const found = list.find((item) => designModelOptionId(item) === modelId) || list[0] || null;
  if (!found) return null;
  const resolvedId = designModelOptionId(found);
  return found.id === resolvedId ? found : { ...found, id: resolvedId };
}
