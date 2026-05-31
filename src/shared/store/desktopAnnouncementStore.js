import { createStore } from './createStore.js';
import { DesktopAnnouncementApi } from '../platform/backendClient.js';

export const DESKTOP_ANNOUNCEMENT_STORAGE_KEY = 'mancrea.desktopAnnouncements.v1';

const MAX_HISTORY = 200;
const MAX_EVENTS = 500;
const VALID_LEVELS = new Set(['normal', 'important', 'maintenance', 'outage']);

function getLocalStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    return null;
  }
  return null;
}

function loadPersistedState() {
  const storage = getLocalStorage();
  if (!storage) return { history: [], events: [] };

  try {
    const raw = storage.getItem(DESKTOP_ANNOUNCEMENT_STORAGE_KEY);
    if (!raw) return { history: [], events: [] };

    const parsed = JSON.parse(raw);
    return {
      history: Array.isArray(parsed?.history) ? parsed.history.slice(0, MAX_HISTORY) : [],
      events: Array.isArray(parsed?.events) ? parsed.events.slice(0, MAX_EVENTS) : [],
    };
  } catch {
    return { history: [], events: [] };
  }
}

function persistState(state) {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(DESKTOP_ANNOUNCEMENT_STORAGE_KEY, JSON.stringify({
      history: state.history.slice(0, MAX_HISTORY),
      events: state.events.slice(0, MAX_EVENTS),
    }));
  } catch {
    // localStorage may be unavailable or full; in-memory state still remains usable.
  }
}

function normalizeAnnouncement(item, source, now) {
  if (!item || typeof item !== 'object') return null;

  const id = item.id;
  const contentHash = item.contentHash ?? item.content_hash;
  if (!id || !contentHash) return null;

  const level = VALID_LEVELS.has(item.level) ? item.level : 'normal';
  const pushedAt = item.pushedAt ?? item.pushed_at ?? item.publishedAt ?? null;

  return {
    ...item,
    id: String(id),
    contentHash: String(contentHash),
    title: item.title || '公告',
    level,
    pushedAt,
    receivedAt: now,
    source: source || 'unknown',
    read: false,
  };
}

function announcementKey(item) {
  return `${item.id}\u0000${item.contentHash}`;
}

function normalizeTarget(target) {
  if (target && typeof target === 'object') {
    const id = target.id;
    const contentHash = target.contentHash ?? target.content_hash;
    return {
      id: id == null ? '' : String(id),
      contentHash: contentHash == null ? null : String(contentHash),
    };
  }

  return {
    id: target == null ? '' : String(target),
    contentHash: null,
  };
}

function findCurrentTarget(items, target) {
  return items.find((item) => (
    item.id === target.id
    && (!target.contentHash || item.contentHash === target.contentHash)
  )) || null;
}

function matchesTarget(item, target) {
  return item.id === target.id
    && (!target.contentHash || item.contentHash === target.contentHash);
}

function uniqueAnnouncements(items) {
  const byKey = new Map();
  for (const item of items) {
    if (!item?.id || !item?.contentHash) continue;
    const key = announcementKey(item);
    if (!byKey.has(key)) byKey.set(key, item);
  }
  return [...byKey.values()];
}

function toTime(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function sortHistory(history) {
  return [...history].sort((a, b) => {
    const aTime = toTime(a.pushedAt) || toTime(a.receivedAt);
    const bTime = toTime(b.pushedAt) || toTime(b.receivedAt);
    if (bTime !== aTime) return bTime - aTime;
    return String(b.id).localeCompare(String(a.id));
  });
}

function addEvent(events, type, announcement, at, source) {
  if (!announcement) return events;

  return [{
    type,
    announcementId: announcement.id,
    contentHash: announcement.contentHash,
    at,
    source: source || announcement.source || 'local',
  }, ...events].slice(0, MAX_EVENTS);
}

function addEvents(events, type, announcements, at, source) {
  let nextEvents = events;
  for (const announcement of uniqueAnnouncements(announcements)) {
    nextEvents = addEvent(nextEvents, type, announcement, at, source);
  }
  return nextEvents;
}

function findClosedAnnouncement(history, announcement) {
  return history.find((item) => (
    item.id === announcement.id
    && (item.read === true || Boolean(item.closedAt))
  )) || null;
}

function inheritClosedState(announcement, closed) {
  if (!closed) return announcement;

  const next = {
    ...announcement,
    read: true,
  };
  const readAt = announcement.readAt || closed.readAt || closed.closedAt;
  const closedAt = announcement.closedAt || closed.closedAt || closed.readAt;
  const displayedAt = announcement.displayedAt || closed.displayedAt;

  if (readAt) next.readAt = readAt;
  if (closedAt) next.closedAt = closedAt;
  if (displayedAt) next.displayedAt = displayedAt;

  return next;
}

const persisted = loadPersistedState();

const initialState = {
  history: persisted.history,
  queue: [],
  events: persisted.events,
  syncError: null,
  lastSyncAt: null,
};

export const desktopAnnouncementStore = createStore(initialState);

export const desktopAnnouncementActions = {
  ingest(items, options = {}) {
    const input = Array.isArray(items) ? items : [];
    const now = Date.now();
    const source = options.source || 'unknown';
    const replaceActive = Boolean(options.replaceActive);
    const normalized = input
      .map((item) => normalizeAnnouncement(item, source, now))
      .filter(Boolean);
    const activeKeys = new Set(normalized.map(announcementKey));

    desktopAnnouncementStore.setState((state) => {
      const historyByKey = new Map(state.history.map((item) => [announcementKey(item), item]));
      let events = state.events;
      let queue = state.queue;

      for (const announcement of normalized) {
        const key = announcementKey(announcement);
        const existing = historyByKey.get(key);
        const closed = findClosedAnnouncement([...historyByKey.values()], announcement);
        const merged = existing
          ? { ...existing, ...announcement, read: Boolean(existing.read || closed) }
          : announcement;
        const mergedWithClosedState = inheritClosedState(merged, closed);

        historyByKey.set(key, mergedWithClosedState);
        if (!existing) {
          events = addEvent(events, 'received', mergedWithClosedState, now, source);
        }

        if (!closed) {
          queue = [
            mergedWithClosedState,
            ...queue.filter((item) => announcementKey(item) !== key),
          ];
        }
      }

      let history = sortHistory([...historyByKey.values()]).slice(0, MAX_HISTORY);
      if (replaceActive) {
        const removed = uniqueAnnouncements([
          ...state.history.filter((item) => !activeKeys.has(announcementKey(item))),
          ...state.queue.filter((item) => !activeKeys.has(announcementKey(item))),
        ]);
        if (removed.length > 0) {
          events = addEvents(events, 'removed', removed, now, source);
        }
        history = history.filter((item) => activeKeys.has(announcementKey(item)));
        queue = queue.filter((item) => activeKeys.has(announcementKey(item)));
      }

      const nextState = {
        ...state,
        history,
        queue,
        events,
        syncError: null,
        lastSyncAt: now,
      };
      persistState(nextState);
      return nextState;
    });
  },

  remove(id, options = {}) {
    const now = Date.now();
    const target = normalizeTarget(id);
    if (!target.id) return;

    desktopAnnouncementStore.setState((state) => {
      const removed = uniqueAnnouncements([
        ...state.queue.filter((item) => matchesTarget(item, target)),
        ...state.history.filter((item) => matchesTarget(item, target)),
      ]);
      if (removed.length === 0) return state;

      const nextState = {
        ...state,
        queue: state.queue.filter((item) => !matchesTarget(item, target)),
        history: state.history.filter((item) => !matchesTarget(item, target)),
        events: addEvents(
          state.events,
          options.eventType || 'removed',
          removed,
          now,
          options.source || 'server',
        ),
      };
      persistState(nextState);
      return nextState;
    });
  },

  markDisplayed(id) {
    const now = Date.now();
    const target = normalizeTarget(id);

    desktopAnnouncementStore.setState((state) => {
      const current = findCurrentTarget(state.queue, target) || findCurrentTarget(state.history, target);
      if (!current) return state;

      const withDisplayedAt = (item) => (
        announcementKey(item) === announcementKey(current) && !item.displayedAt
          ? { ...item, displayedAt: now }
          : item
      );

      const nextState = {
        ...state,
        history: state.history.map(withDisplayedAt),
        queue: state.queue.map(withDisplayedAt),
        events: addEvent(state.events, 'displayed', current, now, 'local'),
      };
      persistState(nextState);
      return nextState;
    });
  },

  close(id) {
    const now = Date.now();
    const target = normalizeTarget(id);

    desktopAnnouncementStore.setState((state) => {
      const current = findCurrentTarget(state.queue, target) || findCurrentTarget(state.history, target);
      if (!current) return state;
      const currentKey = announcementKey(current);

      const nextState = {
        ...state,
        queue: state.queue.filter((item) => announcementKey(item) !== currentKey),
        history: state.history.map((item) => {
          if (announcementKey(item) !== currentKey) return item;
          return {
            ...item,
            read: true,
            readAt: item.readAt || now,
            closedAt: now,
          };
        }),
        events: addEvent(state.events, 'closed', current, now, 'local'),
      };
      persistState(nextState);
      return nextState;
    });
  },

  setSyncError(message) {
    desktopAnnouncementStore.setState((state) => ({ ...state, syncError: message || null }));
  },
};

export const useAnnouncementHistory = () => desktopAnnouncementStore.useSelector((state) => state.history);
export const useAnnouncementQueue = () => desktopAnnouncementStore.useSelector((state) => state.queue);
export const useAnnouncementSyncError = () => desktopAnnouncementStore.useSelector((state) => state.syncError);

const REMOVAL_EVENT_TYPES = {
  'desktop.announcement.disabled': 'disabled',
  'desktop.announcement.deleted': 'deleted',
  'desktop.announcement.revoked': 'revoked',
  'desktop.announcement.revoke': 'revoked',
};

function announcementTargetFromEvent(event) {
  if (event?.announcement) return event.announcement;
  return {
    id: event?.announcementId ?? event?.announcement_id ?? event?.id,
    contentHash: event?.contentHash ?? event?.content_hash,
  };
}

export async function startDesktopAnnouncementSync(api = DesktopAnnouncementApi) {
  try {
    const result = await api.list();
    desktopAnnouncementActions.ingest(result?.announcements || [], { source: 'initial-load', replaceActive: true });
  } catch (error) {
    desktopAnnouncementActions.setSyncError(error?.message || '公告同步失败');
  }

  if (typeof api?.onEvent !== 'function') return () => {};

  let cleanup = null;
  try {
    cleanup = api.onEvent((event) => {
      if (event?.type === 'desktop.announcement.pushed' && event.announcement) {
        desktopAnnouncementActions.ingest([event.announcement], { source: 'sse' });
        return;
      }
      if (REMOVAL_EVENT_TYPES[event?.type]) {
        desktopAnnouncementActions.remove(announcementTargetFromEvent(event), {
          source: 'sse',
          eventType: REMOVAL_EVENT_TYPES[event.type],
        });
        return;
      }
      if (event?.type === 'desktop.announcement.connection-error') {
        desktopAnnouncementActions.setSyncError('公告实时连接中断，正在等待自动重连。');
        return;
      }
      if (event?.type === 'desktop.announcement.connected') {
        desktopAnnouncementActions.setSyncError(null);
      }
    });
  } catch (error) {
    desktopAnnouncementActions.setSyncError(error?.message || '公告实时连接启动失败');
    return () => {};
  }

  return typeof cleanup === 'function' ? cleanup : () => {};
}
