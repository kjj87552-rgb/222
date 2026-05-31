import React from 'react';
import { makeAssetUrl } from '../../../../shared/platform/backendClient.js';

export function abbreviateShot(shot) {
  if (!shot) return '';
  const map = { '大远景': 'EWS', '远景': 'WS', '全景': 'FS', '中全景': 'MWS', '中景': 'MS', '中近景': 'MCU', '近景': 'CU', '特写': 'CU', '大特写': 'ECU', '微距': 'MAC', '过肩': 'OTS', '主观': 'POV', 'POV': 'POV', 'OTS': 'OTS' };
  for (const [key, abbr] of Object.entries(map)) {
    if (shot.includes(key)) return abbr;
  }
  return shot;
}

export const asArray = (value) => (Array.isArray(value) ? value : []);

const assetLabel = (asset) => asset?.name || asset?.title || asset?.label || asset?.id || '';

const idMatches = (value, asset) => (
  value && [asset?.id, asset?.assetId, asset?.cardId].filter(Boolean).includes(value)
);

const currentVersion = (asset = {}) => {
  const safeAsset = asset || {};
  const history = asArray(safeAsset.history);
  if (!history.length) return null;
  return history.find((item) => item?.id && item.id === safeAsset.currentVersionId) || history[0] || null;
};

export function assetThumbnailUrl(asset = {}) {
  const safeAsset = asset || {};
  const version = currentVersion(safeAsset) || safeAsset;
  return makeAssetUrl({
    id: version?.assetId || safeAsset?.assetId,
    src: version?.assetUrl
      || version?.url
      || version?.src
      || version?.imageUrl
      || version?.thumbnailUrl
      || version?.thumbUrl
      || version?.previewUrl
      || version?.assetPath
      || version?.localPath
      || version?.path
      || safeAsset?.assetUrl
      || safeAsset?.url
      || safeAsset?.src
      || safeAsset?.imageUrl
      || safeAsset?.thumbnailUrl
      || safeAsset?.thumbUrl
      || safeAsset?.previewUrl
      || safeAsset?.assetPath
      || safeAsset?.localPath
      || safeAsset?.path,
    url: version?.url || version?.imageUrl || safeAsset?.url || safeAsset?.imageUrl || safeAsset?.previewUrl,
    assetUrl: version?.assetUrl || version?.imageUrl || safeAsset?.assetUrl || safeAsset?.imageUrl || safeAsset?.previewUrl,
  });
}

const addReference = (items, seen, type, label, asset = null) => {
  const text = String(label || '').trim();
  if (!text) return;
  const key = `${type}:${text}`;
  if (seen.has(key)) return;
  seen.add(key);
  items.push({
    type,
    label: text,
    thumbnailUrl: assetThumbnailUrl(asset),
    assetId: asset?.id || asset?.assetId || asset?.cardId || '',
  });
};

const shotSearchText = (shot) => [
  shot?.scene,
  shot?.sceneRef,
  shot?.visualsAction,
  shot?.desc,
  shot?.promptText,
  shot?.prompt,
  ...asArray(shot?.audio).flatMap((entry) => [entry?.character, entry?.line]),
].filter(Boolean).join('\n');

export function resolveShotReferences(shot, assets = {}) {
  const refs = [];
  const seen = new Set();
  const text = shotSearchText(shot);
  const characterIds = new Set(asArray(shot?.characterIds).filter(Boolean));
  const refCount = asArray(shot?.refImageUrls).filter(Boolean).length;

  asArray(assets.keyCharacters).forEach((asset) => {
    const label = assetLabel(asset);
    if (characterIds.has(asset?.id) || characterIds.has(asset?.assetId) || (label && text.includes(label))) {
      addReference(refs, seen, '角色', label, asset);
    }
  });

  asArray(assets.sceneAnalysis).forEach((asset) => {
    const label = assetLabel(asset);
    if (idMatches(shot?.sceneId, asset) || idMatches(shot?.sceneRef, asset) || (label && text.includes(label))) {
      addReference(refs, seen, '场景', label, asset);
    }
  });

  asArray(assets.keyProps).forEach((asset) => {
    const label = assetLabel(asset);
    if (label && text.includes(label)) {
      addReference(refs, seen, '道具', label, asset);
    }
  });

  if (refCount > 0) {
    addReference(refs, seen, '参考', `参考图 ${refCount}`);
  }

  return refs;
}

export function audioEditText(shot) {
  return asArray(shot.audio)
    .map((entry) => {
      const character = String(entry?.character || '').trim();
      const type = String(entry?.type || 'Dialogue').trim() || 'Dialogue';
      const line = String(entry?.line || '').trim();
      if (!character && !line) return '';
      return `${character || '声音'} (${type}): ${line}`;
    })
    .filter(Boolean)
    .join('\n');
}

export function parseAudioEditText(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const paren = line.match(/^([^()：:]+)\s*\(([^)]+)\)\s*[:：]\s*(.+)$/);
      if (paren) {
        const [, character, type, lineText] = paren;
        return {
          character: character.trim(),
          type: ['Dialogue', 'VO', 'OS'].includes(type.trim()) ? type.trim() : 'Dialogue',
          line: lineText.trim(),
        };
      }
      const colon = line.match(/^([^：:]+)\s*[:：]\s*(.+)$/);
      if (colon) {
        const [, character, lineText] = colon;
        return {
          character: character.trim(),
          type: 'Dialogue',
          line: lineText.trim(),
        };
      }
      return {
        character: '',
        type: 'Dialogue',
        line,
      };
    });
}

export function formatShotNumber(shot) {
  const raw = shot.shotNumber || String(shot.n || 0).padStart(4, '0');
  const text = String(raw || '').trim();
  return text.startsWith('#') ? text : `#${text}`;
}

function EditableBox({
  as = 'input',
  value,
  field,
  label,
  rows = 2,
  onCommit,
}) {
  const Component = as;
  const handleBlur = (event) => onCommit?.(field, event.currentTarget.value);
  const extraProps = as === 'textarea' ? { rows } : {};
  return (
    <Component
      className={`shot-edit-box ${as === 'textarea' ? 'tall' : ''}`}
      aria-label={label}
      data-field={field}
      defaultValue={value || ''}
      {...extraProps}
      onClick={(event) => event.stopPropagation()}
      onBlur={handleBlur}
    />
  );
}

export function ShotRow({ shot, assets = {}, onUpdate, onDelete }) {
  const references = resolveShotReferences(shot, assets);
  const commit = (field, value) => {
    const nextValue = String(value || '').trim();
    if (field === 'audio') {
      onUpdate?.({ ...shot, audio: parseAudioEditText(value) });
      return;
    }
    if (field === 'shotNumber') {
      onUpdate?.({ ...shot, shotNumber: nextValue.replace(/^#/, '').trim() });
      return;
    }
    const patch = { [field]: nextValue };
    if (field === 'timeline') patch.dur = nextValue;
    if (field === 'visualsAction') patch.desc = nextValue;
    onUpdate?.({ ...shot, ...patch });
  };

  return (
    <tr className="sb-shot-row">
      <td className="num">
        <EditableBox
          value={formatShotNumber(shot)}
          field="shotNumber"
          label="镜号"
          onCommit={commit}
        />
        <button type="button" title="删除" onClick={(e) => { e.stopPropagation(); onDelete?.(shot); }}>删除</button>
      </td>
      <td>
        <EditableBox value={shot.shot || abbreviateShot(shot.shot)} field="shot" label="景别" onCommit={commit} />
      </td>
      <td className="dur">
        <EditableBox value={shot.timeline || shot.dur || ''} field="timeline" label="时长" onCommit={commit} />
      </td>
      <td>
        <EditableBox value={shot.transition || ''} field="transition" label="转场" onCommit={commit} />
      </td>
      <td>
        <EditableBox value={shot.cameraWork || ''} field="cameraWork" label="运镜" as="textarea" rows={2} onCommit={commit} />
      </td>
      <td className="desc">
        <EditableBox value={shot.visualsAction || shot.desc || ''} field="visualsAction" label="画面动作" as="textarea" rows={3} onCommit={commit} />
      </td>
      <td className="audio-cell">
        <EditableBox value={audioEditText(shot)} field="audio" label="对白/声音" as="textarea" rows={3} onCommit={commit} />
      </td>
      <td className="refs-cell">
        <div className="shot-edit-box refs-box" aria-label="引用资产">
          {references.length ? references.map((ref) => (
            <span className={`asset-ref ${ref.type}`} key={`${ref.type}-${ref.label}`}>
              {ref.label}
            </span>
          )) : <span className="asset-ref empty">-</span>}
        </div>
      </td>
    </tr>
  );
}
