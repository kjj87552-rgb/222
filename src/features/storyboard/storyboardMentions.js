import { normalizeAssetBindings } from './assetBindings.js';

export function getStoryboardMentionOptions(storyboardPackage = {}, options = {}) {
  const typeFilter = options?.type;
  return normalizeAssetBindings(storyboardPackage?.assetBindings)
    .filter((binding) => !typeFilter || binding.type === typeFilter)
    .map((binding) => ({
      id: binding.bindingId,
      label: `@${binding.name}`,
      name: binding.name,
      type: binding.type,
      aliases: binding.aliases,
      prompt: binding.prompt,
      imageUrl: binding.imageUrl,
    }));
}
