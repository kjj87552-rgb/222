import React from 'react';

function pad2(n) {
  const v = Math.max(0, Number(n) || 0);
  return v < 10 ? `0${v}` : String(v);
}

function formatStamp(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');
    return `${mm}-${dd} ${HH}:${MM}`;
  } catch (_) {
    return '—';
  }
}

function CanvasMiniGlyph() {
  return (
    <svg viewBox="0 0 120 80" className="hp-card-glyph" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="hpGlyphGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="0.6" cy="0.6" r="0.6" fill="currentColor" opacity="0.18"/>
        </pattern>
      </defs>
      <rect width="120" height="80" fill="url(#hpGlyphGrid)"/>
      <g stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.7">
        <path d="M28 28 Q56 28 56 50"/>
        <path d="M92 28 Q64 28 64 50"/>
      </g>
      <g>
        <rect x="14" y="20" width="28" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.75"/>
        <rect x="78" y="20" width="28" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.75"/>
        <rect x="46" y="50" width="28" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="60" cy="58" r="2" fill="currentColor"/>
      </g>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h10M6.5 4V2.5h3V4M4.5 4l.5 9a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9L11.5 4"/>
      <path d="M7 7v4M9 7v4"/>
    </svg>
  );
}

export function ProjectHomePage({
  projects = [],
  currentProjectId,
  newProjectName, onNewProjectNameChange, onCreateProject,
  onPickProject, onDeleteProject, onExportProject, onExportCurrentProject, onImportProject,
  exportingProjectId = '', importingProject = false,
}) {
  const [isCreating, setIsCreating] = React.useState(false);
  const inputRef = React.useRef(null);
  const importInputRef = React.useRef(null);

  React.useEffect(() => {
    if (isCreating && inputRef.current) {
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [isCreating]);

  React.useEffect(() => {
    if (!isCreating) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreating]);

  const openModal = () => setIsCreating(true);
  const closeModal = () => {
    setIsCreating(false);
    onNewProjectNameChange('');
  };

  const handleSubmit = (e) => {
    onCreateProject?.(e);
    setIsCreating(false);
  };

  const handleDelete = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!projectId || projectId === 'local-default') return;
    if (!window.confirm('确认删除该项目？此操作不可撤销。')) return;
    onDeleteProject?.(projectId);
  };
  const handleExport = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!projectId || exportingProjectId) return;
    onExportProject?.(projectId);
  };
  const handleOpen = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (projectId) onPickProject?.(projectId);
  };
  const handleImportChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImportProject?.(file);
    e.target.value = '';
  };

  const orderedProjects = React.useMemo(() => {
    const list = Array.isArray(projects) ? projects.slice() : [];
    return list.sort((a, b) =>
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
    );
  }, [projects]);
  const currentProject = React.useMemo(() => (
    orderedProjects.find((item) => item.id === currentProjectId) || orderedProjects[0] || null
  ), [currentProjectId, orderedProjects]);
  const isExportingAny = Boolean(exportingProjectId);
  const isCurrentExporting = Boolean(currentProject?.id && exportingProjectId === currentProject.id);
  const handleContinue = () => {
    if (currentProject?.id) onPickProject?.(currentProject.id);
  };

  return (
    <section className="home-page projects-home" data-onboarding-id="project-gallery">
      <div className="hp-bg" aria-hidden="true">
        <span className="hp-bg-glow hp-bg-glow-a" />
        <span className="hp-bg-glow hp-bg-glow-b" />
        <span className="hp-bg-grid" />
        <span className="hp-bg-line" />
        <span className="hp-corner hp-corner-tl" />
        <span className="hp-corner hp-corner-tr" />
        <span className="hp-corner hp-corner-bl" />
        <span className="hp-corner hp-corner-br" />
      </div>

      <div className="hp-workbench">
        <input
          ref={importInputRef}
          type="file"
          accept=".json,.libai-project.json,application/json"
          className="hp-import-input"
          onChange={handleImportChange}
          aria-label="导入项目文件"
        />

        <header className="hp-gallery-head" aria-label="项目画廊">
          <div className="hp-gallery-title">
            <span className="hp-kicker">PROJECT GALLERY</span>
            <h1>项目</h1>
            <p>选择一个画布继续创作。</p>
          </div>

          <div className="hp-gallery-status" aria-label="当前项目">
            <span>当前</span>
            <strong>{currentProject?.name || '暂无项目'}</strong>
            <em>{orderedProjects.length} 个项目 · {formatStamp(currentProject?.updatedAt)}</em>
          </div>

          <div className="hp-gallery-actions">
            <button
              type="button"
              className="hp-hero-btn primary"
              onClick={handleContinue}
              disabled={!currentProject}
              data-onboarding-id="project-continue"
            >
              继续当前画布
            </button>
            <button
              type="button"
              className="hp-hero-btn"
              onClick={() => onExportCurrentProject?.()}
              disabled={!currentProject || isExportingAny}
            >
              {isCurrentExporting ? '导出中...' : '导出当前项目'}
            </button>
            <button
              type="button"
              className="hp-hero-btn"
              onClick={() => {
                if (!importingProject) importInputRef.current?.click();
              }}
              disabled={importingProject}
            >
              {importingProject ? '导入中...' : '导入项目'}
            </button>
            <button type="button" className="hp-hero-btn" onClick={openModal}>
              新建项目
            </button>
          </div>

          <div className="hp-gallery-art" aria-hidden="true">
            <span className="hp-art-frame hp-art-frame-a">
              <i />
              <i />
            </span>
            <span className="hp-art-frame hp-art-frame-b">
              <i />
              <i />
              <i />
            </span>
            <div className="hp-art-board">
              <CanvasMiniGlyph />
            </div>
          </div>
        </header>

        <div className="hp-project-grid">
          {orderedProjects.map((p, idx) => {
            const isCurrent = p.id === currentProjectId;
            const canDelete = p.id !== 'local-default';
            const isExporting = exportingProjectId === p.id;
            return (
              <article
                key={p.id}
                className={`hp-card hp-card-project ${isCurrent ? 'is-current' : ''}`}
                onClick={() => onPickProject?.(p.id)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.target?.closest?.('button')) return;
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPickProject?.(p.id); }
                }}
              >
                <header className="hp-card-head">
                  <span className="hp-card-no">{pad2(idx + 1)}</span>
                  {isCurrent ? (
                    <span className="hp-card-status">
                      <span className="hp-card-dot" aria-hidden="true" />
                      <span>ACTIVE</span>
                    </span>
                  ) : (
                    <span className="hp-card-status hp-card-status-idle">
                      <span>已存档</span>
                    </span>
                  )}
                </header>

                <div className="hp-card-glyph-wrap">
                  <CanvasMiniGlyph />
                </div>

                <div className="hp-card-body">
                  <h3 className="hp-card-title">{p.name || '未命名'}</h3>
                  <p className="hp-card-sub">本地 · {formatStamp(p.updatedAt)}</p>
                  <div className="hp-card-stats">
                    <span>{pad2(p.nodeCount)}<em>N</em></span>
                    <span className="hp-card-stat-divider" aria-hidden="true" />
                    <span>{pad2(p.edgeCount)}<em>E</em></span>
                    <span className="hp-card-stat-divider" aria-hidden="true" />
                    <span>{pad2(p.assetCount)}<em>A</em></span>
                  </div>
                </div>

                <footer className="hp-card-foot hp-card-actions">
                  <button
                    type="button"
                    className="hp-card-action primary"
                    onClick={(e) => handleOpen(e, p.id)}
                  >
                    {isCurrent ? '打开' : '切换'}
                    <i className="hp-arrow" aria-hidden="true">→</i>
                  </button>
                  <button
                    type="button"
                    className="hp-card-action"
                    onClick={(e) => handleExport(e, p.id)}
                    disabled={isExportingAny}
                  >
                    {isExporting ? '导出中...' : '导出'}
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      className="hp-card-action danger"
                      onClick={(e) => handleDelete(e, p.id)}
                      aria-label={`删除项目 ${p.name || ''}`}
                      title="删除项目"
                    >
                      <TrashIcon />
                      删除
                    </button>
                  )}
                </footer>
              </article>
            );
          })}

          <article className="hp-card hp-card-create">
            <button type="button" className="hp-card-create-btn" onClick={openModal}>
              <span className="hp-card-plus" aria-hidden="true">+</span>
              <span className="hp-card-create-label">新建画布项目</span>
            </button>
          </article>
        </div>
      </div>

      {isCreating && (
        <div className="hp-modal-backdrop" onClick={closeModal} role="presentation">
          <div
            className="hp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hp-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="hp-modal-close" onClick={closeModal} aria-label="关闭">✕</button>

            <span className="hp-modal-tag">
              <span className="hp-modal-tag-dot" aria-hidden="true" />
              NEW · PROJECT
            </span>

            <h2 id="hp-modal-title" className="hp-modal-title">新建画布项目</h2>
            <p className="hp-modal-sub">独立本地目录 · 自动初始化 SQLite</p>

            <form className="hp-modal-form" onSubmit={handleSubmit}>
              <label className="hp-modal-field">
                <span className="hp-modal-field-label">项目名称</span>
                <input
                  ref={inputRef}
                  className="hp-modal-input"
                  value={newProjectName}
                  onChange={(e) => onNewProjectNameChange(e.target.value)}
                  placeholder="例如：海边的小镇 · 第一章…"
                  aria-label="新画布项目名称"
                />
              </label>

              <div className="hp-modal-actions">
                <button type="button" className="hp-modal-btn" onClick={closeModal}>
                  <span>取消</span>
                  <i className="hp-modal-kbd" aria-hidden="true">Esc</i>
                </button>
                <button type="submit" className="hp-modal-btn primary">
                  <span>创建项目</span>
                  <i className="hp-modal-kbd" aria-hidden="true">↵</i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
