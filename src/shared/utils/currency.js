export const RMB_SYMBOL = '￥';

export function displayCurrencyText(value = '') {
  return String(value || '').replace(/\$/g, RMB_SYMBOL);
}
