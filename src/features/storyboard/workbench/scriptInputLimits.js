export const SCRIPT_INPUT_NEXT_STEP_LIMIT = 5000;
export const SCRIPT_INPUT_MAX_LENGTH = 7000;

const asString = (value) => (typeof value === 'string' ? value : '');

export function countScriptInputChars(value) {
  return Array.from(asString(value)).length;
}

export function truncateScriptInput(value, maxLength = SCRIPT_INPUT_MAX_LENGTH) {
  const text = asString(value);
  const chars = Array.from(text);
  if (chars.length <= maxLength) return text;
  return chars.slice(0, maxLength).join('');
}

export function isScriptInputOverNextStepLimit(value) {
  return countScriptInputChars(value) > SCRIPT_INPUT_NEXT_STEP_LIMIT;
}
