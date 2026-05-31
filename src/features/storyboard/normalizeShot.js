/* Schema normalization helpers for shot v2 + shotGroup containers.
 *
 * shot v2 is a superset of v1 — old fields (n, shot, desc, dur, ...) are kept
 * for back-compat with ScriptFullModal, while new fields (shotNumber, cameraWork,
 * audio, dialogueRole, colorTone, sfx, transition, directorNote, sceneRef,
 * visualsAction, timeline) are added with safe defaults.
 *
 * shotGroup is a new container layer above shots[]. It carries groupId,
 * sceneRef, totalDuration, groupNote, and an array of normalized shots.
 */

const VALID_AUDIO_TYPES = new Set(['Dialogue', 'VO', 'OS']);
const VALID_DIALOGUE_ROLES = new Set(['speaker', 'listener', 'observer']);

function pad4(n) {
  const v = Math.max(0, Number(n) || 0);
  return String(v).padStart(4, '0');
}

function normalizeAudioEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const line = String(entry.line || '').trim();
  if (!line) return null;
  const type = VALID_AUDIO_TYPES.has(entry.type) ? entry.type : 'Dialogue';
  const character = String(entry.character || '').trim();
  // Dialogue 必须有角色名；VO/OS（旁白/画外音）允许空 character
  if (type === 'Dialogue' && !character) return null;
  return { character, type, line };
}

export function normalizeShotV2(raw, index = 0) {
  const safe = raw || {};
  const visualsAction = safe.visualsAction || safe.desc || '';
  const desc = safe.desc || safe.visualsAction || '';
  const timeline = safe.timeline || safe.dur || '3s';
  const dur = safe.dur || safe.timeline || '3s';

  const audioRaw = Array.isArray(safe.audio) ? safe.audio : [];
  const audio = audioRaw.map(normalizeAudioEntry).filter((entry) => entry !== null);

  const dialogueRole = VALID_DIALOGUE_ROLES.has(safe.dialogueRole)
    ? safe.dialogueRole
    : (audio.length > 0 ? 'speaker' : 'observer');

  return {
    // v1 兼容字段
    id: safe.id || `sh_${index}_${(safe.n ?? index)}_${(desc || 'x').slice(0, 8)}`,
    n: safe.n || index + 1,
    shot: safe.shot || '中景',
    desc,
    dur,
    status: safe.status || 'pending',
    errorMessage: safe.errorMessage || null,
    thumbAssetId: safe.thumbAssetId || null,
    thumbUrl: safe.thumbUrl || null,
    videoAssetId: safe.videoAssetId || null,
    videoUrl: safe.videoUrl || null,
    thumbJobId: safe.thumbJobId || null,
    videoJobId: safe.videoJobId || null,
    promptText: safe.promptText || '',
    promptOverrides: safe.promptOverrides || {},
    characterIds: Array.isArray(safe.characterIds) ? safe.characterIds : [],
    sceneId: safe.sceneId || null,
    refImageUrls: Array.isArray(safe.refImageUrls) ? safe.refImageUrls : [],
    createdAt: safe.createdAt || new Date().toISOString(),
    updatedAt: safe.updatedAt || new Date().toISOString(),

    // v2 新字段
    shotNumber: safe.shotNumber || pad4(index + 1),
    scene: safe.scene || '',
    transition: safe.transition || '硬切',
    timeline,
    cameraWork: safe.cameraWork || '',
    visualsAction,
    audio,
    dialogueRole,
    colorTone: safe.colorTone || '',
    sfx: safe.sfx || '',
    directorNote: safe.directorNote || '',
    sceneRef: safe.sceneRef || '',
  };
}

export function normalizeShotGroups(rawArray) {
  if (!Array.isArray(rawArray)) return [];
  return rawArray
    .filter((g) => g && typeof g === 'object' && Array.isArray(g.shots))
    .map((g, gIdx) => ({
      groupId: g.groupId || `G${String(gIdx + 1).padStart(3, '0')}`,
      sceneRef: g.sceneRef || '',
      totalDuration: g.totalDuration || '',
      groupNote: g.groupNote || '',
      shots: g.shots.map((shot, sIdx) => normalizeShotV2(shot, sIdx)),
    }));
}
