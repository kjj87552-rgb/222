/* EDITMODE-BEGIN/END marker block + URL preset overrides.
 *
 * ⚠️ DO NOT modify the comment markers /*EDITMODE-BEGIN*\/ and /*EDITMODE-END*\/.
 * External tooling may regex-match these exact strings to programmatically
 * update TWEAK_DEFAULTS values. Preserve format, indentation, whitespace.
 */

export const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "themeKey": "a",
  "bgStyle": "dots",
  "showRail": true,
  "showTip": true,
  "accent": "#55B6F2",
  "directorStageV2": true
}/*EDITMODE-END*/;

export const URL_PRESET = (() => {
  try {
    const q = new URLSearchParams(location.search);
    const out = {};
    for (const k of Object.keys(TWEAK_DEFAULTS)) {
      if (!q.has(k)) continue;
      const v = q.get(k);
      if (typeof TWEAK_DEFAULTS[k] === "boolean") {
        out[k] = v === "1" || v === "true";
      } else {
        out[k] = v;
      }
    }
    return out;
  } catch (e) {
    return {};
  }
})();

export const EFFECTIVE_DEFAULTS = { ...TWEAK_DEFAULTS, ...URL_PRESET };
