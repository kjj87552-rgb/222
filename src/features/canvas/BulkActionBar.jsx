import React from 'react';
import { useSelection } from '../../shared/store/uiStore.js';
import { IFolder, ICopy, IGroup, ICut } from '../../shared/ui/icons/index.jsx';

export function BulkActionBar({ onSave, onDownload, onDuplicate, onGroup, canGroup, onCompose }) {
  const selection = useSelection();
  const count = selection.length;
  if (!count) return null;
  const groupDisabled = canGroup === undefined ? count < 2 : !canGroup;

  return (
    <div
      className="bulk-bar"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="count">已选 {count}</span>
      <button onClick={onSave}><IFolder size={13}/>保存到素材</button>
      <button onClick={onDownload}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></svg>
        批量下载
      </button>
      <button onClick={onDuplicate}><ICopy size={13}/>创建副本</button>
      <button onClick={onGroup} disabled={groupDisabled}><IGroup size={13}/>新建组合</button>
      {onCompose && <button onClick={onCompose} style={{color:"var(--accent)"}}><ICut size={13}/>视频合成</button>}
    </div>
  );
}
