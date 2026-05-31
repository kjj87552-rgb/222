export const localFilesStyles = `
.lf-panel {
  position: absolute;
  left: 56px;       /* leave room for the rail (≈48px) + tiny gap */
  top: 64px;        /* below MiniTopBar */
  bottom: 14px;
  width: 300px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-float);
  display: flex; flex-direction: column;
  z-index: 50;
  font-family: var(--font-body);
  overflow: hidden;
}
.lf-panel header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px dashed var(--line-soft);
  background: color-mix(in oklab, var(--paper) 92%, var(--bg));
}
.lf-panel header h3 {
  margin: 0; font-size: 13px; font-weight: 700;
  font-family: var(--font-display);
  color: var(--ink);
}
.lf-panel header .close {
  margin-left: auto;
  background: transparent; border: none;
  color: var(--ink-mute); cursor: pointer;
  padding: 4px; border-radius: var(--radius-sm);
}
.lf-panel header .close:hover { color: var(--ink); background: var(--paper-2); }
.lf-panel .subtitle {
  font-size: 10px; color: var(--ink-mute);
  padding: 0 12px 8px;
  font-family: var(--font-mono);
}

.lf-tabs {
  display: flex; gap: 4px;
  padding: 0 12px 8px;
}
.lf-tabs button {
  flex: 1;
  padding: 6px 10px;
  font-size: 11px;
  background: var(--paper-2);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  color: var(--ink-soft);
  cursor: pointer;
  font-family: var(--font-display);
}
.lf-tabs button.active {
  background: var(--ink); color: var(--paper); border-color: var(--ink);
}
.lf-tabs button:disabled { opacity: 0.45; cursor: not-allowed; }

.lf-add {
  margin: 0 12px 8px;
  padding: 8px 12px;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  background: color-mix(in oklab, var(--accent) 15%, var(--paper-2));
  border: 1px dashed color-mix(in oklab, var(--accent) 40%, var(--line));
  border-radius: var(--radius-md);
  color: var(--ink); font-size: 12px;
  cursor: pointer; font-family: var(--font-display);
}
.lf-add:hover { background: color-mix(in oklab, var(--accent) 22%, var(--paper-2)); }

.lf-folder-bar {
  padding: 0 12px 8px;
  display: flex; flex-direction: column; gap: 6px;
}
.lf-folder-row {
  display: flex; gap: 6px; align-items: center;
  font-size: 11px;
}
.lf-folder-row .label { color: var(--ink-mute); font-family: var(--font-mono); }
.lf-folder-row .actions { margin-left: auto; display: flex; gap: 6px; }
.lf-folder-row .actions button {
  background: transparent; border: none; color: var(--ink-mute);
  font-size: 10px; cursor: pointer; padding: 2px 4px;
  font-family: var(--font-display);
}
.lf-folder-row .actions button:hover { color: var(--accent-2); }

.lf-folder-pick {
  width: 100%; padding: 6px 8px;
  background: var(--paper-2); border: 1px solid var(--line);
  border-radius: var(--radius-sm); color: var(--ink); font-size: 12px;
  font-family: var(--font-body); outline: none;
}

.lf-search {
  padding: 0 12px 8px;
}
.lf-search input {
  width: 100%; padding: 6px 10px;
  background: var(--paper-2); border: 1px solid var(--line);
  border-radius: var(--radius-sm); color: var(--ink); font-size: 12px;
  font-family: var(--font-body); outline: none;
}

.lf-filter {
  display: flex; gap: 4px;
  padding: 0 12px 8px;
}
.lf-filter button {
  flex: 1; padding: 4px 8px; font-size: 11px;
  background: var(--paper-2);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  color: var(--ink-soft); cursor: pointer;
  font-family: var(--font-display);
}
.lf-filter button.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }

.lf-section-head {
  padding: 4px 12px 6px;
  font-size: 11px; color: var(--ink-mute);
  font-family: var(--font-mono);
  display: flex; align-items: center; justify-content: space-between;
}

.lf-grid {
  flex: 1; overflow-y: auto;
  padding: 0 12px 12px;
  display: grid; gap: 8px;
  grid-template-columns: 1fr 1fr;
}
.lf-card {
  position: relative;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  background: var(--paper-2);
  overflow: hidden;
  cursor: grab;
}
.lf-card:active { cursor: grabbing; }
.lf-card .thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--bg-deep);
}
.lf-card .thumb img,
.lf-card .thumb video {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.lf-card .star {
  position: absolute; top: 4px; left: 4px;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  color: var(--ink-mute);
  cursor: pointer;
  border: none;
}
.lf-card .star.on { color: #ffd66b; }
.lf-card .insert-btn {
  position: absolute; left: 6px; right: 6px; bottom: 32px;
  padding: 5px 0;
  background: color-mix(in oklab, var(--accent) 25%, rgba(0,0,0,0.7));
  border: 1px solid color-mix(in oklab, var(--accent) 40%, var(--line));
  border-radius: var(--radius-sm);
  color: #fff; font-size: 11px; cursor: pointer;
  font-family: var(--font-display);
  text-align: center;
  opacity: 0;
  transition: opacity .12s;
}
.lf-card:hover .insert-btn { opacity: 1; }
.lf-card .name {
  padding: 4px 6px;
  font-size: 10px;
  color: var(--ink-soft);
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lf-card .video-tag {
  position: absolute; top: 4px; right: 4px;
  padding: 1px 5px;
  background: rgba(0,0,0,0.6);
  color: #fff; font-size: 9px;
  border-radius: 2px;
  font-family: var(--font-mono);
}

.lf-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-mute);
  font-size: 12px;
  line-height: 1.6;
  grid-column: 1 / -1;
}
`;
