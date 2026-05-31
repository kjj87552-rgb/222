/* iframe ↔ parent postMessage handshake for the Compare page */

// Posts to parent that the edit-mode panel is ready to receive commands.
export function postEditModeAvailable() {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');
}

// Posts to parent that the edit-mode panel was closed by the user.
export function postEditModeDismissed() {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
}

// Posts a single key/value tweak change to the parent host.
// The host rewrites the EDITMODE block on disk with the new value.
export function postEditModeSet(key, val) {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
}

// Subscribes to inbound messages from the parent host.
// handler is called with the full event data object for recognised message types:
//   __activate_edit_mode   — host wants the panel shown
//   __deactivate_edit_mode — host wants the panel hidden
// Returns a cleanup function (removes the event listener).
export function listenForEditModeMessages(handler) {
  if (typeof window === 'undefined') return () => {};
  const onMsg = (e) => {
    const t = e?.data?.type;
    if (t === '__activate_edit_mode' || t === '__deactivate_edit_mode') {
      handler(e.data);
    }
  };
  window.addEventListener('message', onMsg);
  return () => window.removeEventListener('message', onMsg);
}
