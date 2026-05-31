export const ONBOARDING_STORAGE_KEY = 'libai:onboarding:v1:completed';

function defaultStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage || null;
  } catch (_) {
    return null;
  }
}

export function hasCompletedOnboarding(storage = defaultStorage()) {
  try {
    return storage?.getItem?.(ONBOARDING_STORAGE_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

export function markOnboardingCompleted(storage = defaultStorage()) {
  try {
    if (typeof storage?.setItem !== 'function') return false;
    storage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    return true;
  } catch (_) {
    return false;
  }
}

export function resetOnboardingCompletion(storage = defaultStorage()) {
  try {
    if (typeof storage?.removeItem !== 'function') return false;
    storage.removeItem(ONBOARDING_STORAGE_KEY);
    return true;
  } catch (_) {
    return false;
  }
}

export function shouldAutoOpenOnboarding({
  embedMode = false,
  authenticated = false,
  alreadyChecked = false,
  completed = false,
} = {}) {
  return !embedMode && authenticated && !alreadyChecked && !completed;
}
