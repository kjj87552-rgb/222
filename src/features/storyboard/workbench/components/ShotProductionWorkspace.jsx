import React from 'react';
import { ShotGroupPromptPanel } from './ShotGroupCard.jsx';
import {
  asArray,
  audioEditText,
  formatShotNumber,
  parseAudioEditText,
  resolveShotReferences,
} from './ShotRow.jsx';

const textValue = (value) => (
  value === null || value === undefined ? '' : String(value).trim()
);

const groupIdOf = (group = {}, index = 0) => (
  textValue(group.groupId || group.shotGroupId || group.id) || `G${String(index + 1).padStart(3, '0')}`
);

const shotKeyOf = (shot = {}, index = 0) => (
  textValue(shot.id || shot.shotId || shot.shotNumber || shot.number || shot.n) || `shot-${index}`
);

const roleLabels = {
  speaker: '说话者',
  listener: '听者反应',
  observer: '观察镜头',
};

const statusText = (group = {}) => {
  const status = textValue(group.promptStatus).toLowerCase();
  if (status === 'completed') return '提示词完成';
  if (status === 'failed') return '提示词失败';
  if (status === 'canceled' || status === 'cancelled') return '已取消';
  if (status === 'running') return '提示词推理中';
  if (status === 'queued') return '排队中';
  if (status === 'pending') return '待推理';
  return '未推理';
};

const statusClass = (group = {}) => {
  const status = textValue(group.promptStatus).toLowerCase();
  return status || 'idle';
};

const promptProgressValue = (group = {}) => {
  const status = statusClass(group);
  const numeric = Number(group.promptProgress);
  if (Number.isFinite(numeric)) return Math.max(0, Math.min(100, Math.round(numeric)));
  if (['completed', 'failed', 'canceled', 'cancelled'].includes(status)) return 100;
  return 0;
};

function PromptStatusBadge({ group }) {
  const status = statusClass(group);
  const progress = promptProgressValue(group);
  const showProgress = ['pending', 'queued', 'running'].includes(status) && progress > 0;
  const label = statusText(group);
  const stage = textValue(group.promptStage) || label;
  return (
    <span className={`sb-shot-nav-status ${status}`} title={stage}>
      <span className="sb-shot-nav-status-line">
        <i aria-hidden="true" />
        <strong>{label}</strong>
        {showProgress && <em>{progress}%</em>}
      </span>
      {showProgress && (
        <span className="sb-shot-nav-progress" aria-hidden="true">
          <b style={{ width: `${progress}%` }} />
        </span>
      )}
    </span>
  );
}

const compactAudio = (shot) => {
  const lines = asArray(shot?.audio)
    .map((entry) => {
      const character = textValue(entry?.character);
      const line = textValue(entry?.line);
      if (!line) return '';
      return character ? `${character}：${line}` : line;
    })
    .filter(Boolean);
  return lines.join(' / ');
};

function durationSeconds(value) {
  const match = textValue(value).match(/[\d.]+/);
  if (!match) return 0;
  const numeric = Number(match[0]);
  return Number.isFinite(numeric) ? numeric : 0;
}

function shotDurationTotal(shots = []) {
  const total = asArray(shots).reduce((sum, shot) => sum + durationSeconds(shot?.timeline || shot?.dur), 0);
  if (!total) return '';
  return `${Number.isInteger(total) ? total : total.toFixed(1)}s`;
}

function safeShotNumber(shot, index = 0) {
  const raw = textValue(shot?.shotNumber || shot?.number || shot?.n);
  if (raw) return raw.replace(/^#/, '');
  return String(index + 1).padStart(4, '0');
}

const compactLine = (value, fallback = '') => {
  const text = textValue(value).replace(/\s+/g, ' ');
  return text || fallback;
};

function groupSummaryText(group = {}, shots = []) {
  const direct = compactLine(
    group.groupNote
      || group.summary
      || group.sceneSummary
      || group.directorNote,
  );
  if (direct) return direct;
  const firstShot = asArray(shots)[0] || {};
  return compactLine(
    firstShot.visualsAction
      || firstShot.desc
      || firstShot.cameraWork
      || compactAudio(firstShot),
    '暂无组级摘要',
  );
}

function InspectorField({
  as = 'input',
  label,
  value,
  field,
  rows = 2,
  onCommit,
}) {
  const Component = as;
  const extraProps = as === 'textarea' ? { rows } : {};
  return (
    <label className={`sb-inspector-field ${as === 'textarea' ? 'wide' : ''}`}>
      <span>{label}</span>
      <Component
        aria-label={label}
        defaultValue={value || ''}
        {...extraProps}
        onBlur={(event) => onCommit?.(field, event.currentTarget.value)}
      />
    </label>
  );
}

function ReferenceChips({ references = [] }) {
  if (!references.length) {
    return <span className="asset-ref empty">暂无引用</span>;
  }
  return references.map((ref) => (
    <span className={`asset-ref ${ref.type}`} key={`${ref.type}-${ref.label}`}>
      <AssetThumb refItem={ref} />
      <span className="sb-shot-asset-copy">
        <small>{ref.type}</small>
        {ref.label}
      </span>
    </span>
  ));
}

function AssetThumb({ refItem }) {
  const src = textValue(refItem?.thumbnailUrl);
  return (
    <span className={`sb-shot-asset-thumb ${src ? 'has-image' : ''}`} aria-hidden="true">
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      ) : (
        <small>{textValue(refItem?.type).slice(0, 1) || '资'}</small>
      )}
    </span>
  );
}

function AssetReferencePill({ refItem }) {
  return (
    <span className={`sb-shot-asset-chip ${refItem.type}`}>
      <AssetThumb refItem={refItem} />
      <span className="sb-shot-asset-name">{refItem.label}</span>
    </span>
  );
}

function ShotNavigator({ shotGroups, selectedGroupId, onSelectShot }) {
  return (
    <aside className="sb-shot-nav-panel" aria-label="分镜导航">
      <div className="sb-shot-nav-title">
        <strong>分组导航</strong>
        <span>{shotGroups.length} 组</span>
      </div>
      <div className="sb-shot-nav-list">
        {shotGroups.map((group, groupIndex) => {
          const groupId = groupIdOf(group, groupIndex);
          const shots = asArray(group.shots);
          const activeGroup = groupId === selectedGroupId;
          const duration = group.totalDuration || shotDurationTotal(shots) || '-';
          const groupSummary = groupSummaryText(group, shots);
          return (
            <section className={`sb-shot-nav-group ${activeGroup ? 'active' : 'compact'}`} key={groupId}>
              <button
                type="button"
                className="sb-shot-nav-group-btn"
                aria-expanded={activeGroup}
                onClick={() => onSelectShot(groupId, shotKeyOf(shots[0] || {}, 0))}
              >
                <span className="sb-shot-nav-card-head">
                  <span className="gid">{groupId}</span>
                  <span className="scene-label">{group.sceneRef ? `场 ${group.sceneRef}` : '未标场次'}</span>
                </span>
                <span className="sb-shot-nav-group-metrics">
                  <em>{shots.length} 镜</em>
                  <em>{duration}</em>
                </span>
                <span className="sb-shot-nav-summary">{groupSummary}</span>
                <PromptStatusBadge group={group} />
              </button>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function ShotListRow({
  groupId,
  shot,
  shotIndex,
  selected,
  assets,
  onSelect,
}) {
  const references = resolveShotReferences(shot, assets);
  const role = textValue(shot.dialogueRole) || (asArray(shot.audio).length ? 'speaker' : 'observer');
  const audio = compactAudio(shot);
  return (
    <button
      type="button"
      className={`sb-shot-list-row ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      data-group-id={groupId}
      data-shot-number={safeShotNumber(shot, shotIndex)}
    >
      <span className="shot-no">#{safeShotNumber(shot, shotIndex)}</span>
      <span className="shot-meta">
        <strong>{shot.shot || '中景'}</strong>
        <em>{shot.timeline || shot.dur || '-'}</em>
        <small>{shot.transition || '硬切'}</small>
      </span>
      <span className="shot-camera">{shot.cameraWork || '未填写运镜'}</span>
      <span className="shot-action">{shot.visualsAction || shot.desc || '未填写画面动作'}</span>
      <span className="shot-sound">
        <strong>{roleLabels[role] || role}</strong>
        <em>{audio || shot.sfx || '无对白/声音'}</em>
      </span>
      <span className="shot-refs">
        {references.slice(0, 3).map((ref) => (
          <AssetReferencePill refItem={ref} key={`${ref.type}-${ref.label}`} />
        ))}
        {references.length > 3 && <span className="sb-shot-asset-more">+{references.length - 3}</span>}
        {!references.length && <span className="sb-shot-asset-more">-</span>}
      </span>
    </button>
  );
}

function ShotInspector({
  group,
  groupId,
  shot,
  shotIndex,
  assets,
  onUpdateShot,
  onDeleteShot,
}) {
  const references = resolveShotReferences(shot, assets);
  const promptStatus = statusText(group);

  if (!shot) {
    return (
      <aside className="sb-shot-inspector">
        <div className="sb-shot-inspector-empty">请选择一个镜头</div>
      </aside>
    );
  }

  const commit = (field, value) => {
    const nextValue = textValue(value);
    if (field === 'audio') {
      onUpdateShot?.(groupId, { ...shot, audio: parseAudioEditText(value) });
      return;
    }
    if (field === 'shotNumber') {
      onUpdateShot?.(groupId, { ...shot, shotNumber: nextValue.replace(/^#/, '').trim() });
      return;
    }
    const patch = { [field]: nextValue };
    if (field === 'timeline') patch.dur = nextValue;
    if (field === 'visualsAction') patch.desc = nextValue;
    onUpdateShot?.(groupId, { ...shot, ...patch });
  };

  return (
    <aside className="sb-shot-inspector" key={shotKeyOf(shot, shotIndex)}>
      <div className="sb-shot-inspector-head">
        <span>镜头检查器</span>
        <strong>{formatShotNumber(shot)}</strong>
        <em className={`status ${textValue(group?.promptStatus).toLowerCase() || 'idle'}`}>{promptStatus}</em>
      </div>
      <div className="sb-inspector-grid">
        <InspectorField label="编号" field="shotNumber" value={formatShotNumber(shot)} onCommit={commit} />
        <InspectorField label="场景" field="scene" value={shot.scene || ''} onCommit={commit} />
        <InspectorField label="景别" field="shot" value={shot.shot || ''} onCommit={commit} />
        <InspectorField label="时长" field="timeline" value={shot.timeline || shot.dur || ''} onCommit={commit} />
        <InspectorField label="转场" field="transition" value={shot.transition || ''} onCommit={commit} />
        <label className="sb-inspector-field">
          <span>对话角色</span>
          <select
            aria-label="对话角色"
            defaultValue={shot.dialogueRole || (asArray(shot.audio).length ? 'speaker' : 'observer')}
            onChange={(event) => commit('dialogueRole', event.currentTarget.value)}
          >
            <option value="speaker">speaker · 说话者</option>
            <option value="listener">listener · 听者反应</option>
            <option value="observer">observer · 观察镜头</option>
          </select>
        </label>
        <InspectorField as="textarea" rows={3} label="运镜" field="cameraWork" value={shot.cameraWork || ''} onCommit={commit} />
        <InspectorField as="textarea" rows={4} label="画面动作" field="visualsAction" value={shot.visualsAction || shot.desc || ''} onCommit={commit} />
        <InspectorField as="textarea" rows={3} label="对白/声音" field="audio" value={audioEditText(shot)} onCommit={commit} />
        <InspectorField as="textarea" rows={2} label="音效" field="sfx" value={shot.sfx || ''} onCommit={commit} />
        <InspectorField as="textarea" rows={2} label="色调" field="colorTone" value={shot.colorTone || ''} onCommit={commit} />
        <InspectorField as="textarea" rows={3} label="导演备注" field="directorNote" value={shot.directorNote || ''} onCommit={commit} />
      </div>
      <div className="sb-inspector-refs">
        <span>引用资产</span>
        <div>
          <ReferenceChips references={references} />
        </div>
      </div>
      <button
        type="button"
        className="sb-inspector-delete"
        onClick={() => onDeleteShot?.(groupId, shot)}
      >
        删除当前镜头
      </button>
    </aside>
  );
}

export function ShotProductionWorkspace({
  shotGroups = [],
  assets = {},
  onUpdateGroup,
  onUpdateShot,
  onDeleteShot,
  onGeneratePrompts,
  disableGeneratePrompts = false,
}) {
  const firstGroupId = groupIdOf(shotGroups[0] || {}, 0);
  const firstShotKey = shotKeyOf(asArray(shotGroups[0]?.shots)[0] || {}, 0);
  const [selectedGroupId, setSelectedGroupId] = React.useState(firstGroupId);
  const [selectedShotKey, setSelectedShotKey] = React.useState(firstShotKey);

  React.useEffect(() => {
    if (!shotGroups.length) return;
    const hasSelectedGroup = shotGroups.some((group, index) => groupIdOf(group, index) === selectedGroupId);
    const group = hasSelectedGroup
      ? shotGroups.find((item, index) => groupIdOf(item, index) === selectedGroupId)
      : shotGroups[0];
    const groupIndex = shotGroups.indexOf(group);
    const shots = asArray(group?.shots);
    const hasSelectedShot = shots.some((shot, index) => shotKeyOf(shot, index) === selectedShotKey);
    if (!hasSelectedGroup || !hasSelectedShot) {
      setSelectedGroupId(groupIdOf(group, groupIndex));
      setSelectedShotKey(shotKeyOf(shots[0] || {}, 0));
    }
  }, [selectedGroupId, selectedShotKey, shotGroups]);

  const selectedGroupIndex = Math.max(0, shotGroups.findIndex((group, index) => groupIdOf(group, index) === selectedGroupId));
  const selectedGroup = shotGroups[selectedGroupIndex] || shotGroups[0] || {};
  const selectedGroupResolvedId = groupIdOf(selectedGroup, selectedGroupIndex);
  const selectedShots = asArray(selectedGroup.shots);
  const selectedShotIndex = Math.max(0, selectedShots.findIndex((shot, index) => shotKeyOf(shot, index) === selectedShotKey));
  const selectedShot = selectedShots[selectedShotIndex] || selectedShots[0] || null;

  const selectShot = (groupId, shotKey) => {
    if (!groupId || !shotKey) return;
    setSelectedGroupId(groupId);
    setSelectedShotKey(shotKey);
  };

  const deleteShot = (groupId, shot) => {
    if (!shot) return;
    onDeleteShot?.(groupId, shot.id || shot.shotId || shot.shotNumber);
  };

  return (
    <div className="sb-shot-production-workbench">
      <ShotNavigator
        shotGroups={shotGroups}
        selectedGroupId={selectedGroupResolvedId}
        onSelectShot={selectShot}
      />
      <section className="sb-shot-main-panel">
        <header className="sb-shot-main-head">
          <div>
            <span>{selectedGroupResolvedId}</span>
            <strong>{selectedGroup.sceneRef ? `场 ${selectedGroup.sceneRef}` : '未标场次'}</strong>
            <em>{selectedGroup.groupNote || '暂无组级导演意图'}</em>
          </div>
          <div className="sb-shot-main-stats">
            <span>{selectedShots.length} 镜</span>
            <span>{selectedGroup.totalDuration || shotDurationTotal(selectedShots) || '-'}</span>
            <span>{statusText(selectedGroup)}</span>
          </div>
        </header>
        <div className="sb-shot-list-head" aria-hidden="true">
          <span>镜号</span>
          <span>基础</span>
          <span>运镜</span>
          <span>画面动作</span>
          <span>声音</span>
          <span>资产</span>
        </div>
        <div className="sb-shot-list">
          {selectedShots.map((shot, shotIndex) => {
            const shotKey = shotKeyOf(shot, shotIndex);
            return (
              <ShotListRow
                key={shotKey}
                groupId={selectedGroupResolvedId}
                shot={shot}
                shotIndex={shotIndex}
                selected={selectedShot && shotKey === shotKeyOf(selectedShot, selectedShotIndex)}
                assets={assets}
                onSelect={() => selectShot(selectedGroupResolvedId, shotKey)}
              />
            );
          })}
        </div>
        <ShotGroupPromptPanel
          group={selectedGroup}
          onUpdateGroup={onUpdateGroup}
          onGeneratePrompts={onGeneratePrompts}
          disableGeneratePrompts={disableGeneratePrompts}
        />
      </section>
      <ShotInspector
        group={selectedGroup}
        groupId={selectedGroupResolvedId}
        shot={selectedShot}
        shotIndex={selectedShotIndex}
        assets={assets}
        onUpdateShot={onUpdateShot}
        onDeleteShot={deleteShot}
      />
    </div>
  );
}
