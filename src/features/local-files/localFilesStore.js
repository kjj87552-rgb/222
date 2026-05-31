import { createStore } from '../../shared/store/createStore.js';
import { AssetStore } from '../../shared/platform/assetStore.js';

/* Persistence shape (localStorage):
 *
 *   key: mancrea.localFolders.v1
 *   value: { paths: string[], currentPath: string|null, favorites: string[] }
 *
 * Folder file lists themselves are NOT persisted — they're re-listed via
 * Electron on bootstrap (cheap, ensures files reflect on-disk reality).
 *
 * In-memory store also tracks files (with assetUrl) and a loading flag per
 * folder so the panel can show progress.
 */

const STORAGE_KEY = 'mancrea.localFolders.v1';

function fileKey(file) {
  // For Electron paths use the path itself (stable); otherwise fall back to name+size.
  return file.path || `${file.name}__${file.size}__${file.lastModified || 0}`;
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      paths: Array.isArray(parsed.paths) ? parsed.paths.filter(p => typeof p === 'string') : [],
      currentPath: typeof parsed.currentPath === 'string' ? parsed.currentPath : null,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    };
  } catch (e) {
    console.warn('Failed to read localFolders persisted state', e);
    return null;
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      paths: state.folders.map(f => f.path).filter(Boolean),
      currentPath: state.folders.find(f => f.id === state.currentFolderId)?.path || null,
      favorites: Array.from(state.favorites),
    }));
  } catch (e) {
    console.warn('Failed to persist localFolders', e);
  }
}

const store = createStore({
  folders: [],          // [{ id, path, name, files: [...], loading, error }]
  currentFolderId: null,
  favorites: new Set(), // Set of fileKey strings
});

/* Persist on every change (cheap — localStorage write is not throttled here
 * because folder ops are infrequent: add/remove/switch). */
store.subscribe(() => persist(store.getState()));

export const localFilesStore = store;

export const useFolders         = () => store.useSelector((s) => s.folders);
export const useCurrentFolderId = () => store.useSelector((s) => s.currentFolderId);
export const useCurrentFolder   = () => store.useSelector(
  (s) => s.folders.find((f) => f.id === s.currentFolderId) || s.folders[0] || null
);
export const useFavorites       = () => store.useSelector((s) => s.favorites);

function makeFolderId(path) {
  // Stable id derived from path so re-listing the same folder keeps the same id.
  return 'lf_' + Math.abs(hashCode(path)).toString(36);
}
function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

export const localFilesActions = {
  /* Open native folder picker (Electron) → list its files → upsert. */
  async pickAndAddFolder() {
    if (!AssetStore.folderApiAvailable()) {
      throw new Error('需要 Electron 环境才能选择本地文件夹');
    }
    const picked = await AssetStore.pickFolder();
    if (!picked) return null;
    return localFilesActions.addFolderByPath(picked.path);
  },

  /* Add (or refresh) a folder by absolute path. */
  async addFolderByPath(folderPath) {
    if (!folderPath) return null;
    const id = makeFolderId(folderPath);
    /* Insert/refresh placeholder with loading=true */
    store.setState((s) => {
      const others = s.folders.filter(f => f.id !== id);
      const placeholder = { id, path: folderPath, name: basename(folderPath), files: [], loading: true, error: null };
      return { ...s, folders: [...others, placeholder], currentFolderId: id };
    });
    try {
      const listing = await AssetStore.listFolder(folderPath);
      store.setState((s) => ({
        ...s,
        folders: s.folders.map(f => f.id === id
          ? { ...f, name: listing.name || f.name, files: listing.files || [], loading: false, error: null }
          : f),
      }));
    } catch (error) {
      store.setState((s) => ({
        ...s,
        folders: s.folders.map(f => f.id === id
          ? { ...f, loading: false, error: String(error?.message || error) }
          : f),
      }));
    }
    return id;
  },

  /* Browser-only fallback: add a folder of File objects (no path).
   * Used when running outside Electron and webkitdirectory was used. */
  addBrowserFolder(name, files) {
    const id = 'lf_browser_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5);
    const filtered = Array.from(files).filter((f) => /^(image|video|audio)\//.test(f.type));
    const folder = { id, path: null, name: name || '新文件夹', files: filtered, loading: false, error: null };
    store.setState((s) => ({
      ...s,
      folders: [...s.folders, folder],
      currentFolderId: id,
    }));
    return id;
  },

  /* Re-list current folder (e.g. user added new files on disk). */
  async refreshFolder(id) {
    const folder = store.getState().folders.find(f => f.id === id);
    if (!folder?.path) return;
    return localFilesActions.addFolderByPath(folder.path);
  },

  removeFolder: (id) => {
    store.setState((s) => {
      const folders = s.folders.filter((f) => f.id !== id);
      const currentFolderId = s.currentFolderId === id
        ? (folders[0]?.id || null)
        : s.currentFolderId;
      return { ...s, folders, currentFolderId };
    });
  },

  clearFolders: () => store.setState((s) => ({ ...s, folders: [], currentFolderId: null })),

  setCurrentFolder: (id) => store.setState((s) => ({ ...s, currentFolderId: id })),

  toggleFavorite: (file) => store.setState((s) => {
    const k = fileKey(file);
    const next = new Set(s.favorites);
    if (next.has(k)) next.delete(k); else next.add(k);
    return { ...s, favorites: next };
  }),
};

function basename(p) {
  const parts = String(p).replace(/\\/g, '/').split('/').filter(Boolean);
  return parts[parts.length - 1] || p;
}

/* Bootstrap: on import, restore persisted folders and re-list them.
 * Safe to call multiple times (no-op if already loaded). */
export async function bootstrapLocalFiles() {
  const persisted = loadPersisted();
  if (!persisted) return;
  store.setState((s) => ({ ...s, favorites: new Set(persisted.favorites) }));
  if (!AssetStore.folderApiAvailable()) {
    /* Browser-only — show empty state with a hint. Persisted paths are remembered
     * for when the user re-opens in Electron. */
    return;
  }
  for (const path of persisted.paths) {
    await localFilesActions.addFolderByPath(path);
  }
  if (persisted.currentPath) {
    const id = makeFolderId(persisted.currentPath);
    store.setState((s) => ({ ...s, currentFolderId: id }));
  }
}

export { fileKey };
