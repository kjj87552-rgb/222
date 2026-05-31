/* Compare-page iframe embed mode detection */

export const EMBED_MODE = (() => {
  try {
    return new URLSearchParams(location.search).get("embed") === "1";
  } catch (e) {
    return false;
  }
})();

export const EMBED_LABEL = (() => {
  try {
    return new URLSearchParams(location.search).get("label") || "";
  } catch (e) {
    return "";
  }
})();
