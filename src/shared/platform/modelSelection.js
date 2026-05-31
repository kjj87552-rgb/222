export function modelLabel(model, fallback = '暂无可用模型') {
  return model?.displayName || model?.modelName || model?.id || fallback;
}

export function modelMatchesLabel(model, label) {
  const target = String(label || '').trim().toLowerCase();
  if (!target) return false;
  return [
    model?.id,
    model?.modelName,
    model?.displayName,
    ...(model?.meta?.aliases || []),
  ]
    .map((item) => String(item || '').trim().toLowerCase())
    .filter(Boolean)
    .includes(target);
}

export function enabledModels(models = []) {
  return (Array.isArray(models) ? models : []).filter((model) => model?.enabled !== false);
}

export function selectBackendModel(models = [], options = {}) {
  const items = enabledModels(models);
  const providerIds = new Set((options.enabledProviderIds || []).filter(Boolean));
  return items.find((model) => options.currentId && model.id === options.currentId)
    || items.find((model) => modelMatchesLabel(model, options.currentLabel))
    || items.find((model) => providerIds.size && providerIds.has(model.providerId))
    || items.find((model) => model.providerId)
    || items[0]
    || null;
}
