/* Lightweight client-side detector for "what kind of script did the user paste?".
 * Three states:
 *   - 'standard'    — has ### X-X scene number AND/OR △ action lines (Phase 2 expected input)
 *   - 'loose-script' — looks like a script (角色：台词 / 场景: / 地点: / 时间:) but missing strict markers
 *   - 'prose'       — no script structure at all (raw novel)
 *
 * Used by ScriptEditor to drive the "smart hint" banner above the editor.
 */

const STANDARD_MARKERS = [
  /###\s+\d+-\d+/,        // ### 1-1 scene number
  /△/,                    // △ action line
];

const LOOSE_MARKERS = [
  /\*\*场[:：]/,           // **场：**
  /场景\s*[:：]/,          // 场景:
  /地点\s*[:：]/,          // 地点:
  /时间\s*[:：]/,          // 时间:
  /[一-龥]+\s*[（(][一-龥]+[)）]\s*[:：]/, // 角色（情绪）：
];

export function detectScriptKind(text) {
  const s = String(text || '').trim();
  if (!s) return 'prose';
  if (STANDARD_MARKERS.some((re) => re.test(s))) return 'standard';
  if (LOOSE_MARKERS.some((re) => re.test(s))) return 'loose-script';
  return 'prose';
}
