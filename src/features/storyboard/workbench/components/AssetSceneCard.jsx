import React from 'react';

const TIME_OPTIONS = ['黎明', '清晨', '正午', '午后', '黄昏', '夜晚', '深夜', '不定'];

export function AssetSceneCard({ scene, onSave, onDelete }) {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(scene.name || '');
  const [timeOfDay, setTimeOfDay] = React.useState(scene.timeOfDay || '不定');
  const [prompt, setPrompt] = React.useState(scene.prompt || '');

  const handleSave = () => {
    onSave?.({ ...scene, name: name.trim(), timeOfDay, prompt: prompt.trim() });
    setEditing(false);
  };
  const handleCancel = () => {
    setName(scene.name || '');
    setTimeOfDay(scene.timeOfDay || '不定');
    setPrompt(scene.prompt || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="sb-asset-card editing">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="场景名" />
        <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} style={{ width: '100%', padding: '6px 8px', marginBottom: 6, border: '1px solid var(--line)', borderRadius: 5, background: 'var(--paper-2)', color: 'var(--ink)' }}>
          {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="六要素严格顺序：空间结构 → 核心元素 → 材质质感 → 光影特征 → 色彩主调 → 推荐构图"
        />
        <div className="actions">
          <button onClick={handleSave}>保存</button>
          <button onClick={handleCancel}>取消</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sb-asset-card">
      <div className="name">{scene.name || '(未命名)'} · <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)' }}>{scene.timeOfDay || '不定'}</span></div>
      <div className="details">{scene.prompt || '(无描述)'}</div>
      <div className="actions">
        <button onClick={() => setEditing(true)}>编辑</button>
        <button className="danger" onClick={() => onDelete?.(scene.id)}>删除</button>
      </div>
    </div>
  );
}
