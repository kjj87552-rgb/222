import { GLOBAL_ASSET_PROJECT_ID } from '../platform/assetStore.js';

export function getAssetProjectId(asset) {
  return String(
    asset?.projectId
    || asset?.project_id
    || asset?.meta?.projectId
    || asset?.meta?.project_id
    || asset?.metadata?.projectId
    || asset?.metadata?.project_id
    || ''
  );
}

export function getAssetLibraryScope(asset) {
  const raw = String(
    asset?.assetScope
    || asset?.libraryScope
    || asset?.scope
    || asset?.meta?.scope
    || asset?.metadata?.scope
    || ''
  ).toLowerCase();
  if (raw === 'global') return 'global';
  if (raw === 'project') return 'project';
  return '';
}

export function isGlobalAsset(asset) {
  return getAssetProjectId(asset) === GLOBAL_ASSET_PROJECT_ID || getAssetLibraryScope(asset) === 'global';
}

export function isProjectAsset(asset, projectId, options = {}) {
  if (!asset || isGlobalAsset(asset)) return false;
  const includeLegacy = options.includeLegacy !== false;
  const assetProjectId = getAssetProjectId(asset);
  if (!assetProjectId) return includeLegacy;
  return Boolean(projectId && assetProjectId === String(projectId));
}

const MANUAL_LIBRARY_SOURCES = new Set([
  'asset-library',
  'canvas.save.global',
  'canvas.save.project',
  'global-import',
  'global.import',
  'global.promote',
  'global.saved',
  'global.write',
  'library-import',
  'library-upload',
  'saved',
  'subject-upscale',
  'user-saved',
]);

const AUTO_OUTPUT_SOURCES = [
  'canvas-image-tool',
  'generated',
  'job.output',
  'job.remote',
  'job.upscale',
  'local.preview',
  'panorama.generate',
  'preview',
  'yunwu',
];

export function isAssetLibraryItem(asset) {
  if (!asset) return false;
  const explicit = asset.inLibrary
    ?? asset.libraryAsset
    ?? asset.savedToLibrary
    ?? asset.meta?.inLibrary
    ?? asset.meta?.libraryAsset
    ?? asset.metadata?.inLibrary
    ?? asset.metadata?.libraryAsset;
  if (explicit === true || explicit === 'true' || explicit === 1 || explicit === '1') return true;
  if (explicit === false || explicit === 'false' || explicit === 0 || explicit === '0') return false;

  const source = String(asset.source || asset.meta?.source || asset.metadata?.source || '').trim().toLowerCase();
  if (!source) return false;
  if (MANUAL_LIBRARY_SOURCES.has(source)) return true;
  if (source.startsWith('global.')) return true;
  if (source.startsWith('job.')) return false;
  if (AUTO_OUTPUT_SOURCES.some((marker) => source.includes(marker))) return false;
  return false;
}

export function withLibraryFlag(asset, inLibrary = true) {
  return {
    ...asset,
    inLibrary,
    libraryAsset: inLibrary,
    meta: {
      ...(asset?.meta || {}),
      inLibrary,
      libraryAsset: inLibrary,
    },
  };
}

export function withAssetScope(asset, projectId, scope = 'project') {
  const nextScope = scope === 'global' ? 'global' : 'project';
  const nextProjectId = nextScope === 'global' ? GLOBAL_ASSET_PROJECT_ID : String(projectId || 'local-default');
  return {
    ...asset,
    projectId: nextProjectId,
    project_id: nextProjectId,
    assetScope: nextScope,
    libraryScope: nextScope,
    scope: nextScope,
    meta: {
      ...(asset?.meta || {}),
      projectId: nextProjectId,
      project_id: nextProjectId,
      scope: nextScope,
    },
  };
}

export function withProjectAssetScope(asset, projectId) {
  return withAssetScope(asset, projectId, 'project');
}

export function withGlobalAssetScope(asset) {
  return withAssetScope(asset, GLOBAL_ASSET_PROJECT_ID, 'global');
}

export function isProjectLibraryAsset(asset, projectId, options = {}) {
  return isAssetLibraryItem(asset) && isProjectAsset(asset, projectId, options);
}
