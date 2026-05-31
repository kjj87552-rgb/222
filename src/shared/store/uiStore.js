import { createStore } from './createStore.js';

export const uiStore = createStore({
  selection: [],
  modal: null,
  topModal: null,
  overlayModal: null,
});

export const useSelection    = () => uiStore.useSelector((s) => s.selection);
export const useIsSelected   = (id) => uiStore.useSelector((s) => s.selection.includes(id));
export const useModal        = () => uiStore.useSelector((s) => s.modal);
export const useTopModal     = () => uiStore.useSelector((s) => s.topModal);
export const useOverlayModal = () => uiStore.useSelector((s) => s.overlayModal);

export const uiActions = {
  setSelection:    (ids) => uiStore.setState((s) => ({ ...s, selection: ids })),
  toggleSelection: (id)  => uiStore.setState((s) => ({
    ...s,
    selection: s.selection.includes(id)
      ? s.selection.filter((x) => x !== id)
      : [...s.selection, id],
  })),
  clearSelection:  () => uiStore.setState((s) => ({ ...s, selection: [] })),

  openModal:  (m) => uiStore.setState((s) => ({ ...s, modal: m })),
  closeModal: ()  => uiStore.setState((s) => ({ ...s, modal: null })),

  openTopModal:  (k) => uiStore.setState((s) => ({ ...s, topModal: k })),
  closeTopModal: ()  => uiStore.setState((s) => ({ ...s, topModal: null })),

  openOverlayModal:  (k) => uiStore.setState((s) => ({ ...s, overlayModal: k })),
  closeOverlayModal: ()  => uiStore.setState((s) => ({ ...s, overlayModal: null })),

  closeAllModals: () => uiStore.setState((s) => ({
    ...s, modal: null, topModal: null, overlayModal: null,
  })),
};
