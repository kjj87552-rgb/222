/* 4-layer robust JSON parser for LLM output.
 *
 * Returns { ok, data?, layer?, error? }
 *   - layer 1: direct JSON.parse
 *   - layer 2: strip ```json``` markdown fences
 *   - layer 3: balanced-bracket scan, extract first complete [...], partial [...], OR {...}
 *   - layer 4: re-ask LLM via repairFn callback (optional)
 *
 * `repairFn` is an async function the caller passes in; if not provided,
 * layer 4 is skipped and we fall through to error.
 *
 * Accepted root shapes (success):
 *   - JSON array: [...]
 *   - { shots: [...] } → unwrapped to shots[] (Phase 1 back-compat)
 *   - any other JSON object: returned as-is (Phase 2A v3 prompts emit
 *     { keyCharacters, ..., shotGroups, ... } objects).
 *
 * Caller is responsible for shape-specific unwrapping (e.g. `data.shotGroups`).
 */

export async function jsonRobustParse(raw, options = {}) {
  const { repairFn } = options;
  const text = String(raw ?? '').trim();
  if (!text) return { ok: false, layer: 0, error: 'empty input' };

  // Layer 1: direct parse
  const direct = tryParse(text);
  if (direct.ok) return { ok: true, data: direct.data, layer: 1 };

  // Layer 2: strip markdown fences (```json ... ``` or bare ``` ... ```)
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (stripped !== text) {
    const r = tryParse(stripped);
    if (r.ok) return { ok: true, data: r.data, layer: 2 };
  }

  // Layer 3: balanced bracket scan — arrays first, then truncated arrays, then objects.
  for (const candidate of extractBalanced(text, '[', ']')) {
    const r = tryParse(candidate);
    if (r.ok) return { ok: true, data: r.data, layer: 3 };
  }
  const partialArrayItems = recoverPartialArrayItems(text);
  if (partialArrayItems.length) {
    return {
      ok: true,
      data: partialArrayItems,
      layer: 3,
      partial: true,
      error: 'partial JSON recovered from truncated array',
    };
  }
  for (const candidate of extractBalanced(text, '{', '}')) {
    const r = tryParse(candidate);
    if (r.ok) return { ok: true, data: r.data, layer: 3 };
  }

  // Layer 4: ask repairFn to coerce
  if (typeof repairFn === 'function') {
    try {
      const repaired = await repairFn(text);
      const r = tryParse(String(repaired || '').trim());
      if (r.ok) return { ok: true, data: r.data, layer: 4 };
    } catch (err) {
      return { ok: false, layer: 5, error: `all parse layers failed (repair threw: ${err?.message || err})` };
    }
  }

  return { ok: false, layer: 5, error: 'all parse layers failed' };
}

/* Try to parse `text` as JSON. Accepts arrays and objects.
 * If it's `{ shots: [...] }`, the array is unwrapped (Phase 1 back-compat). */
function tryParse(text) {
  try {
    const parsed = JSON.parse(text);
    if (parsed === null) return { ok: false };
    if (Array.isArray(parsed)) return { ok: true, data: parsed };
    if (typeof parsed === 'object') {
      /* Phase 1 back-compat: scriptToShots prompts emit { shots: [...] }. */
      if (Array.isArray(parsed.shots)) return { ok: true, data: parsed.shots };
      return { ok: true, data: parsed };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

function* extractBalanced(text, openCh, closeCh) {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === openCh) {
      if (start < 0) start = i;
      depth++;
    } else if (ch === closeCh) {
      if (depth > 0) {
        depth--;
        if (depth === 0 && start >= 0) {
          yield text.slice(start, i + 1);
          start = -1;
        }
      }
    }
  }
}

function recoverPartialArrayItems(text) {
  const items = [];
  let arrayDepth = 0;
  let objectDepth = 0;
  let objectStart = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }

    if (ch === '[') {
      if (arrayDepth === 0) {
        objectDepth = 0;
        objectStart = -1;
      }
      arrayDepth++;
      continue;
    }

    if (arrayDepth === 0) continue;

    if (ch === ']') {
      arrayDepth = Math.max(0, arrayDepth - 1);
      if (arrayDepth === 0) {
        objectDepth = 0;
        objectStart = -1;
      }
      continue;
    }

    if (ch === '{') {
      if (arrayDepth === 1 && objectDepth === 0) objectStart = i;
      if (objectStart >= 0) objectDepth++;
      continue;
    }

    if (ch === '}' && objectDepth > 0) {
      objectDepth--;
      if (objectDepth === 0 && objectStart >= 0) {
        const candidate = text.slice(objectStart, i + 1);
        try {
          const parsed = JSON.parse(candidate);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            items.push(parsed);
          }
        } catch {
          // Ignore a malformed item and keep scanning for any later complete item.
        }
        objectStart = -1;
      }
    }
  }

  return items;
}
