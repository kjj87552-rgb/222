import React from 'react';

export function AssetCharacterCard({ character, onSave, onDelete }) {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(character.name || '');
  const [details, setDetails] = React.useState(character.details || '');

  const handleSave = () => {
    onSave?.({ ...character, name: name.trim(), details: details.trim() });
    setEditing(false);
  };
  const handleCancel = () => {
    setName(character.name || '');
    setDetails(character.details || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="sb-asset-card editing">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="角色名" />
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="六段式：年龄性别 / 发型发饰 / 瞳色 / 主衣 / 内衬配饰 / 视觉化气质（60-120 字）"
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
      <div className="name">{character.name || '(未命名)'}</div>
      <div className="details">{character.details || '(无描述)'}</div>
      <div className="actions">
        <button onClick={() => setEditing(true)}>编辑</button>
        <button className="danger" onClick={() => onDelete?.(character.id)}>删除</button>
      </div>
    </div>
  );
}
