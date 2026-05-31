import React from 'react';
import { STYLE_GROUPS } from '../data/styleLibrary.js';
import { createStore } from './createStore.js';

export const STYLE_LIBRARY_STORAGE_KEY = 'libai.styleLibrary.custom.v1';

const CUSTOM_PREVIEW = './style-library/comic-flat-2d.png';

function storage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
}

function readPersistedCustomStyles() {
  const target = storage();
  if (!target) return [];
  try {
    const parsed = JSON.parse(target.getItem(STYLE_LIBRARY_STORAGE_KEY) || '{}');
    return Array.isArray(parsed.customStyles) ? parsed.customStyles : [];
  } catch (error) {
    console.warn('Failed to read custom style library', error);
    return [];
  }
}

function persistCustomStyles(customStyles) {
  const target = storage();
  if (!target) return;
  try {
    target.setItem(STYLE_LIBRARY_STORAGE_KEY, JSON.stringify({ customStyles }));
  } catch (error) {
    console.warn('Failed to persist custom style library', error);
  }
}

function groupById(groupId) {
  return STYLE_GROUPS.find((group) => group.id === groupId) || STYLE_GROUPS[0];
}

function slug(value) {
  const text = String(value || '').trim().toLowerCase();
  return text
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'style';
}

function attachCustomGroup(item) {
  const group = groupById(item.groupId || item.mode);
  return {
    ...item,
    groupId: group.id,
    group: group.title,
    mode: group.id,
  };
}

function normalizeCustomStyle(input = {}) {
  const group = groupById(input.groupId || input.mode || 'comic-drama');
  const name = String(input.name || input.n || '').trim();
  const prompt = String(input.prompt || '').trim();
  const texture = String(input.texture || prompt || group.summary || '自定义提示词').trim();
  const id = input.id || `custom-${slug(name)}-${Date.now().toString(36)}`;
  return attachCustomGroup({
    id,
    groupId: group.id,
    n: name,
    tag: String(input.tag || group.title || '自定义').trim(),
    texture,
    preview: String(input.preview || input.thumbnail || CUSTOM_PREVIEW).trim() || CUSTOM_PREVIEW,
    textureImage: String(input.textureImage || input.preview || CUSTOM_PREVIEW).trim() || CUSTOM_PREVIEW,
    prompt: prompt || [name, texture].filter(Boolean).join('，'),
    source: 'custom',
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export const styleLibraryStore = createStore({
  customStyles: readPersistedCustomStyles().map(normalizeCustomStyle),
});

export function getStyleGroups(customStyles = styleLibraryStore.getState().customStyles) {
  const normalizedCustomStyles = (Array.isArray(customStyles) ? customStyles : []).map(attachCustomGroup);
  return STYLE_GROUPS.map((group) => ({
    ...group,
    items: [
      ...group.items,
      ...normalizedCustomStyles.filter((item) => item.groupId === group.id),
    ],
  }));
}

export function getStyleCount(styleGroups = getStyleGroups()) {
  return styleGroups.reduce((sum, group) => sum + group.items.length, 0);
}

export function useStyleGroups() {
  const customStyles = styleLibraryStore.useSelector((state) => state.customStyles);
  return React.useMemo(() => getStyleGroups(customStyles), [customStyles]);
}

export const styleLibraryActions = {
  addCustomStyle(input) {
    const customStyle = normalizeCustomStyle(input);
    styleLibraryStore.setState((state) => {
      const customStyles = [...state.customStyles, customStyle];
      persistCustomStyles(customStyles);
      return { ...state, customStyles };
    });
    return customStyle;
  },
  resetCustomStyles() {
    styleLibraryStore.setState((state) => ({ ...state, customStyles: [] }));
    storage()?.removeItem(STYLE_LIBRARY_STORAGE_KEY);
  },
};
