import React from 'react';
import { TWEAK_DEFAULTS } from '../../app/editmode.js';
import { postEditModeSet } from './compareEmbed.js';

// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
export function useTweaks(defaults = TWEAK_DEFAULTS) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    postEditModeSet(key, val);
  }, []);
  return [values, setTweak];
}
