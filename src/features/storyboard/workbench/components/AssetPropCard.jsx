import React from 'react';

export function AssetPropCard({ prop, onSave, onDelete }) {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(prop.name || '');
  const [details, setDetails] = React.useState(prop.details || '');

  const handleSave = () => {
    onSave?.({ ...prop, name: name.trim(), details: details.trim() });
    setEditing(false);
  };
  const handleCancel = () => {
    setName(prop.name || '');
    setDetails(prop.details || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="sb-asset-card editing">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="道具名（2-6 字）" />
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="六段式：类别尺寸 / 材质质感 / 色彩主调 / 核心纹饰 / 关键时刻视觉 / 静态呈现姿态（60-120 字）"
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
      <div className="name">{prop.name || '(未命名)'}</div>
      <div className="details">{prop.details || '(无描述)'}</div>
      <div className="actions">
        <button onClick={() => setEditing(true)}>编辑</button>
        <button className="danger" onClick={() => onDelete?.(prop.id)}>删除</button>
      </div>
    </div>
  );
}
