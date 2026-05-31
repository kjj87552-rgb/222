/* Tiny store factory built on useSyncExternalStore.
 *
 * PERFORMANCE BLACKLIST — DO NOT:
 *  1. ❌ Use .filter() / .map() / .slice() inside a selector — returns new array, breaks shallow compare
 *  2. ❌ Return { a: s.a, b: s.b } from a selector — returns new object, same problem
 *  3. ❌ Put 60Hz fields (viewport / drag-position) in any store
 *  4. ❌ Store derived data (use useMemo in component instead)
 *  5. ❌ Write "big actions" that mutate multiple stores in one go — split into multiple action calls
 *
 * DO:
 *  ✅ Use high-level hooks (useNodeById, not useNodes)
 *  ✅ Cross-store coordination lives in action functions
 *  ✅ Profile before optimizing
 */

import React, { useSyncExternalStore } from 'react';

export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  const getState = () => state;

  const setState = (updater) => {
    const next = typeof updater === 'function' ? updater(state) : updater;
    if (Object.is(next, state)) return;
    state = next;
    listeners.forEach((fn) => fn());
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useSelector = (selector, equalityFn = shallowEqual) => {
    const lastSelected = React.useRef();
    const lastState = React.useRef();
    const lastSelector = React.useRef();
    const getSnapshot = () => {
      if (lastState.current !== state || lastSelector.current !== selector) {
        const next = selector(state);
        if (lastSelected.current === undefined || !equalityFn(lastSelected.current, next)) {
          lastSelected.current = next;
        }
        lastState.current = state;
        lastSelector.current = selector;
      }
      return lastSelected.current;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  };

  return { getState, setState, subscribe, useSelector };
}

function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const ak = Object.keys(a), bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (!Object.is(a[k], b[k])) return false;
  return true;
}
