import React from 'react';

export function ShotExpandedEditor({ shot, onSave, onCancel }) {
  const [draft, setDraft] = React.useState({ ...shot });

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const audioText = React.useMemo(
    () => (draft.audio || []).map((a) => `${a.character} (${a.type}): ${a.line}`).join('\n'),
    [draft.audio]
  );
  const handleAudioChange = (e) => {
    const lines = e.target.value.split('\n').map((line) => line.trim()).filter(Boolean);
    const audio = lines.map((line) => {
      const m = line.match(/^([^()]+)\s*\(([^)]+)\)\s*:\s*(.+)$/);
      if (!m) return null;
      const [, character, type, lineText] = m;
      return {
        character: character.trim(),
        type: ['Dialogue', 'VO', 'OS'].includes(type.trim()) ? type.trim() : 'Dialogue',
        line: lineText.trim(),
      };
    }).filter(Boolean);
    setDraft((d) => ({ ...d, audio }));
  };

  return (
    <div className="sb-shot-expanded" onClick={(e) => e.stopPropagation()}>
      <div className="field">
        <label>镜号</label>
        <input value={draft.shotNumber || ''} onChange={set('shotNumber')} />
      </div>
      <div className="field">
        <label>时长</label>
        <input value={draft.timeline || draft.dur || ''} onChange={set('timeline')} placeholder="2.5s" />
      </div>
      <div className="field">
        <label>转场</label>
        <input value={draft.transition || ''} onChange={set('transition')} placeholder="硬切" />
      </div>
      <div className="field full">
        <label>运镜（cameraWork）</label>
        <input value={draft.cameraWork || ''} onChange={set('cameraWork')} placeholder="特写(CU)，平视，缓慢前推" />
      </div>
      <div className="field full">
        <label>画面描述（visualsAction）</label>
        <textarea rows={3} value={draft.visualsAction || draft.desc || ''} onChange={set('visualsAction')} placeholder="①角色动作微表情 ②构图位置 ③环境光影" />
      </div>
      <div className="field full">
        <label>台词（每行一条："角色 (Dialogue/VO/OS): 台词"）</label>
        <textarea rows={2} value={audioText} onChange={handleAudioChange} placeholder="林夏 (Dialogue): 你好" />
      </div>
      <div className="field">
        <label>色调</label>
        <input value={draft.colorTone || ''} onChange={set('colorTone')} placeholder="冷调青蓝，低饱和" />
      </div>
      <div className="field">
        <label>音效</label>
        <input value={draft.sfx || ''} onChange={set('sfx')} placeholder="脚步声/雨声" />
      </div>
      <div className="field">
        <label>对话角色</label>
        <select value={draft.dialogueRole || 'observer'} onChange={set('dialogueRole')} style={{ padding: '6px 8px', border: '1px solid var(--line-soft)', borderRadius: 5, background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 12 }}>
          <option value="speaker">speaker</option>
          <option value="listener">listener</option>
          <option value="observer">observer</option>
        </select>
      </div>
      <div className="field full">
        <label>导演备注</label>
        <input value={draft.directorNote || ''} onChange={set('directorNote')} />
      </div>
      <div className="actions">
        <button type="button" onClick={() => onCancel?.()}>取消</button>
        <button type="button" className="primary" onClick={() => onSave?.(draft)}>保存</button>
      </div>
    </div>
  );
}
