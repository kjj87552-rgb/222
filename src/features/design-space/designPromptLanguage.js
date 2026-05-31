const ENGLISH_PROMPT_FRAGMENT_RE = /\b[A-Za-z][A-Za-z'’.-]{1,}(?:\s+[A-Za-z][A-Za-z'’.-]{1,})*\b/g;

function normalizePromptSeparators(value) {
  return value
    .replace(/\s*,\s*/g, '，')
    .replace(/\s*;\s*/g, '；')
    .replace(/\s*:\s*/g, '：')
    .replace(/\s*([，、；：。])\s*/g, '$1')
    .replace(/[，、；：](?:[，、；：])+/g, '，')
    .replace(/^[，、；：\s]+|[，、；：\s]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function stripEnglishPromptFragments(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return normalizePromptSeparators(text.replace(ENGLISH_PROMPT_FRAGMENT_RE, ''));
}

export function promptTextOrFallback(value, fallback = '未指定') {
  return stripEnglishPromptFragments(value) || stripEnglishPromptFragments(fallback) || '未指定';
}
