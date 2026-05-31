export const SOFTWARE_DECLARATION_CONSENT_KEY = 'mancrea.softwareDeclarationConsent.v1';
export const SOFTWARE_DECLARATION_CONSENT_VERSION = '2026-05-03';

function storage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function hasAcceptedSoftwareDeclaration() {
  const local = storage();
  if (!local) return false;

  try {
    const payload = JSON.parse(local.getItem(SOFTWARE_DECLARATION_CONSENT_KEY) || 'null');
    return Boolean(
      payload?.accepted
      && payload.version === SOFTWARE_DECLARATION_CONSENT_VERSION,
    );
  } catch {
    return false;
  }
}

export function acceptSoftwareDeclaration() {
  const local = storage();
  if (!local) return;

  local.setItem(SOFTWARE_DECLARATION_CONSENT_KEY, JSON.stringify({
    accepted: true,
    version: SOFTWARE_DECLARATION_CONSENT_VERSION,
    acceptedAt: new Date().toISOString(),
  }));
}
