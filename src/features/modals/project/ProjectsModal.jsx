import React from 'react';
import { IHome, IAdd, ISearch, IStar, ITrash } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import {
  useProjectList,
  useCurrentProjectId,
} from '../../../shared/store/projectListStore.js';
import { createAndSwitchProject, deleteProject, switchProject } from '../../../shared/store/persistence.js';

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } catch (e) {
    return '';
  }
}

function handlePick(projectId) {
  void switchProject(projectId);
  uiActions.closeOverlayModal();
}

function handleCreate(name) {
  const trimmed = (name || '').trim() || '未命名项目';
  void createAndSwitchProject(trimmed);
  uiActions.closeOverlayModal();
}

function handleDelete(e, projectId) {
  e.stopPropagation();
  if (!confirm('确认删除该项目？此操作不可撤销。')) return;
  void deleteProject(projectId);
}

export function ProjectsModal() {
  const projects = useProjectList();
  const currentId = useCurrentProjectId();
  const [query, setQuery] = React.useState('');
  const [newName, setNewName] = React.useState('');

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [projects, query]);

  const submitCreate = React.useCallback((e) => {
    e?.preventDefault?.();
    handleCreate(newName);
    setNewName('');
  }, [newName]);

  return (
    <XModal title="全部项目" icon={<IHome size={16}/>} onClose={uiActions.closeOverlayModal} className="pj-modal">
      <div className="pj-bar">
        <form onSubmit={submitCreate} style={{ display: 'flex', gap: 6 }}>
          <input
            className="sb-search-input"
            placeholder="新项目名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              padding: '6px 10px', fontSize: 12,
              background: 'var(--paper-2)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)', color: 'var(--ink)', outline: 'none',
            }}
          />
          <button type="submit" className="new-pj"><IAdd size={13}/>新建</button>
        </form>
        <div className="sb-search" style={{ maxWidth: 320 }}>
          <ISearch size={12}/>
          <input
            placeholder="搜索项目"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span style={{ flex: 1 }}/>
        <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
          {projects.length} 个项目
        </span>
      </div>
      <div className="pj-grid">
        {visible.length === 0 ? (
          <div style={{ padding: '40px 16px', color: 'var(--ink-mute)', gridColumn: '1 / -1', textAlign: 'center' }}>
            没有匹配的项目
          </div>
        ) : visible.map((p) => {
          const isCurrent = p.id === currentId;
          return (
            <div
              key={p.id}
              className={`pj-card ${isCurrent ? 'is-current' : ''}`}
              onClick={() => handlePick(p.id)}
              style={isCurrent ? { outline: '2px solid var(--accent)', outlineOffset: -2 } : undefined}
            >
              <div className="preview" style={{
                background: 'linear-gradient(135deg, var(--paper-2), var(--bg-deep))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink-mute)', fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 700,
              }}>
                {(p.name || '?').slice(0, 1).toUpperCase()}
                {isCurrent && <span className="star" style={{ position: 'absolute' }}><IStar size={14}/></span>}
              </div>
              <div className="meta">
                <div className="n">{p.name || '未命名'}</div>
                <div className="t">
                  <span>编辑于 {formatDate(p.updatedAt)}</span>
                  <span>{p.nodeCount ?? 0} 节点</span>
                  {p.id !== 'local-default' && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, p.id)}
                      title="删除项目"
                      style={{
                        marginLeft: 'auto', background: 'transparent', border: 'none',
                        color: 'var(--ink-mute)', cursor: 'pointer', padding: 2,
                      }}
                    >
                      <ITrash size={12}/>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </XModal>
  );
}
