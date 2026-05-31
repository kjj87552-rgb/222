import React from 'react';
import { ShotRow } from './ShotRow.jsx';

const textValue = (value) => (
  value === null || value === undefined ? '' : String(value).trim()
);

const groupIdOf = (group = {}) => (
  textValue(group.groupId || group.shotGroupId || group.id) || 'G001'
);

const groupPrompt = (group, kind) => {
  if (kind === 'video') {
    return textValue(group.videoPromptDraft || group.videoPrompt);
  }
  return textValue(group.imagePromptDraft || group.imagePrompt || group.promptDraft || group.prompt);
};

const promptStatusLabel = (group = {}, hasPrompt = false) => {
  const status = textValue(group.promptStatus).toLowerCase();
  if (status === 'completed') return '提示词完成';
  if (['pending', 'queued', 'running'].includes(status)) return '提示词推理中';
  if (status === 'failed') return '提示词失败';
  if (hasPrompt) return '提示词已写入';
  return '未推理';
};

function GroupPromptTextarea({ label, value, onCommit }) {
  const [draft, setDraft] = React.useState(value || '');

  React.useEffect(() => {
    setDraft(value || '');
  }, [value]);

  return (
    <label className="sb-shotgroup-prompt-field">
      <span>{label}</span>
      <textarea
        className="shot-edit-box sb-shotgroup-prompt-textarea"
        aria-label={`组级${label}`}
        value={draft}
        rows={8}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={(event) => onCommit?.(event.currentTarget.value)}
      />
    </label>
  );
}

export function ShotGroupPromptPanel({ group, onUpdateGroup, onGeneratePrompts, disableGeneratePrompts = false }) {
  const groupId = groupIdOf(group);
  const imagePrompt = groupPrompt(group, 'image');
  const videoPrompt = groupPrompt(group, 'video');
  const hasPrompt = Boolean(imagePrompt || videoPrompt);
  const statusLabel = promptStatusLabel(group, hasPrompt);
  const status = textValue(group.promptStatus).toLowerCase();
  const generateLabel = status === 'failed' ? '重试本组' : '生成本组提示词';
  const generateDisabled = typeof disableGeneratePrompts === 'function'
    ? Boolean(disableGeneratePrompts(group))
    : Boolean(disableGeneratePrompts);
  const promptKey = `${group.promptJobId || ''}:${imagePrompt}:${videoPrompt}`;
  const [expanded, setExpanded] = React.useState(hasPrompt || group.promptStatus === 'completed');

  React.useEffect(() => {
    if (hasPrompt || group.promptStatus === 'completed') {
      setExpanded(true);
    }
  }, [hasPrompt, group.promptStatus, promptKey]);

  const commitPrompt = (kind, value) => {
    const nextPrompt = textValue(value);
    if (kind === 'video') {
      onUpdateGroup?.(groupId, {
        videoPrompt: nextPrompt,
        videoPromptDraft: nextPrompt,
      });
      return;
    }
    onUpdateGroup?.(groupId, {
      imagePrompt: nextPrompt,
      imagePromptDraft: nextPrompt,
    });
  };

  return (
    <section className={`sb-shotgroup-prompts ${expanded ? 'expanded' : ''}`}>
      <div className="sb-shotgroup-prompts-head">
        <button
          type="button"
          className="sb-shotgroup-prompts-toggle"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          <span className="sb-shotgroup-prompts-title">组级提示词</span>
          <span className={`sb-shotgroup-prompts-status ${status || 'idle'}`}>
            {statusLabel}
          </span>
          <span className="sb-shotgroup-prompts-meta">
            图片 {imagePrompt.length} 字 · 视频 {videoPrompt.length} 字
          </span>
          <span className="sb-shotgroup-prompts-caret" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
        </button>
        {onGeneratePrompts && (
          <button
            type="button"
            className="sb-shotgroup-single-prompt-btn"
            onClick={() => onGeneratePrompts(groupId)}
            disabled={generateDisabled}
          >
            {generateLabel}
          </button>
        )}
      </div>
      {expanded && (
        <div className="sb-shotgroup-prompts-body">
          <GroupPromptTextarea
            label="图片提示词"
            value={imagePrompt}
            onCommit={(value) => commitPrompt('image', value)}
          />
          <GroupPromptTextarea
            label="视频提示词"
            value={videoPrompt}
            onCommit={(value) => commitPrompt('video', value)}
          />
        </div>
      )}
    </section>
  );
}

export function ShotGroupCard({
  group,
  assets = {},
  onGeneratePrompts,
  disableGeneratePrompts = false,
  onUpdateGroup,
  onUpdateShot,
  onDeleteShot,
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const groupId = groupIdOf(group);
  const shots = Array.isArray(group.shots) ? group.shots : [];

  return (
    <div className="sb-shotgroup">
      <div className="sb-shotgroup-head">
        <span className="gid">{groupId}</span>
        {group.sceneRef && <span className="chip">场 {group.sceneRef}</span>}
        <span className="total">{group.totalDuration || '-'}</span>
        <span className="chip">{shots.length} 镜</span>
        <button
          className="toggle"
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? '展开' : '折叠'}
        >{collapsed ? '▸' : '▾'}</button>
      </div>
      {!collapsed && group.groupNote && (
        <div className="sb-shotgroup-note">{group.groupNote}</div>
      )}
      {!collapsed && (
        <div className="sb-shot-table-wrap">
          <table className="sb-shot-table">
            <thead>
              <tr>
                <th>编号</th>
                <th>景别</th>
                <th>时长</th>
                <th>转场</th>
                <th>运镜</th>
                <th>画面动作</th>
                <th>对白/声音</th>
                <th>引用资产</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((shot) => (
                <ShotRow
                  key={shot.id || shot.shotNumber}
                  shot={shot}
                  assets={assets}
                  onUpdate={(next) => onUpdateShot?.(groupId, next)}
                  onDelete={() => onDeleteShot?.(groupId, shot.id)}
                />
              ))}
            </tbody>
          </table>
          <ShotGroupPromptPanel
            group={group}
            onUpdateGroup={onUpdateGroup}
            onGeneratePrompts={onGeneratePrompts}
            disableGeneratePrompts={disableGeneratePrompts}
          />
        </div>
      )}
    </div>
  );
}
