export const asArray = (value) => (Array.isArray(value) ? value : []);

export const displayValue = (value, fallback = '') => {
  if (typeof value === 'string') {
    return value.trim() ? value : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
};

export const displayFirst = (values, fallback = '') => {
  for (const value of values) {
    const next = displayValue(value, '');
    if (next) return next;
  }

  return fallback;
};

export const displayKey = (values, fallback) => displayFirst(values, fallback);
