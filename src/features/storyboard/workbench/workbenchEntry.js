const ENTRY_MAP = {
  script_create: { initialTab: 'script', sourceMode: 'script', workbenchMode: 'script-create' },
  script: { initialTab: 'script', sourceMode: 'script', workbenchMode: 'script-create' },
  character_reference: { initialTab: 'script', sourceMode: 'script', workbenchMode: 'script-create' },
  char: { initialTab: 'script', sourceMode: 'script', workbenchMode: 'script-create' },
  asset_bindings: { initialTab: 'asset-bindings', sourceMode: 'script', workbenchMode: 'script-create' },
  video_remix: { initialTab: 'video', sourceMode: 'video-remix', workbenchMode: 'video-remix' },
  video_reference: { initialTab: 'video', sourceMode: 'video-remix', workbenchMode: 'video-remix' },
  video: { initialTab: 'video', sourceMode: 'video-remix', workbenchMode: 'video-remix' },
  package: { initialTab: 'output', sourceMode: 'script', workbenchMode: 'script-create' },
  plan: { initialTab: 'output', sourceMode: 'script', workbenchMode: 'script-create' },
};

const FALLBACK_ENTRY = { initialTab: 'script', sourceMode: 'script', workbenchMode: 'script-create' };

export function getStoryboardWorkbenchEntry(entry) {
  const key = typeof entry === 'string' ? entry.trim().toLowerCase() : '';
  return ENTRY_MAP[key] || FALLBACK_ENTRY;
}
