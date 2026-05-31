export const upscaleStyles = `
.upscale-panel {
  position: absolute;
  left: 56px;
  top: 64px;
  bottom: 14px;
  width: 392px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-float);
  display: flex;
  flex-direction: column;
  z-index: 52;
  font-family: var(--font-body);
  overflow: hidden;
}
.upscale-panel header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper) 94%, var(--bg));
}
.upscale-panel header h3 {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
}
.upscale-panel header .close {
  margin-left: auto;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-mute);
  cursor: pointer;
}
.upscale-panel header .close:hover {
  background: var(--paper-2);
  color: var(--ink);
}
.upscale-subtitle {
  padding: 8px 12px 10px;
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.5;
}
.upscale-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 12px 10px;
}
.upscale-btn {
  min-height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 12px;
}
.upscale-btn.primary {
  background: color-mix(in oklab, var(--accent) 18%, var(--paper-2));
  border-color: color-mix(in oklab, var(--accent) 42%, var(--line));
}
.upscale-btn:hover:not(:disabled) {
  background: color-mix(in oklab, var(--ink) 10%, var(--paper-2));
}
.upscale-btn:disabled {
  cursor: not-allowed;
  opacity: .45;
}
.upscale-settings {
  padding: 0 12px 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.upscale-field {
  display: grid;
  gap: 4px;
}
.upscale-field span {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 10px;
}
.upscale-field select {
  width: 100%;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--paper-2);
  color: var(--ink);
  font: 12px var(--font-body);
  outline: none;
}
.upscale-list-head {
  padding: 7px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 10px;
  border-top: 1px solid var(--line-soft);
}
.upscale-list-title {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.upscale-list-title em {
  font-style: normal;
  color: var(--accent);
}
.upscale-head-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: wrap;
}
.upscale-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
  display: grid;
  gap: 8px;
}
.upscale-empty {
  margin-top: 24px;
  padding: 28px 18px;
  border: 1px dashed var(--line);
  border-radius: var(--radius-md);
  color: var(--ink-mute);
  text-align: center;
  font-size: 12px;
  line-height: 1.6;
}
.upscale-card {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 10px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  padding: 8px;
}
.upscale-card.selected {
  border-color: color-mix(in oklab, var(--accent) 45%, var(--line));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--accent) 32%, transparent);
}
.upscale-thumb {
  width: 74px;
  height: 74px;
  border-radius: var(--radius-sm);
  background: var(--bg-deep);
  overflow: hidden;
}
.upscale-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.upscale-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.upscale-card-head {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
}
.upscale-queue-select {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
}
.upscale-queue-select input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.upscale-queue-select span {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--paper);
  display: grid;
  place-items: center;
}
.upscale-queue-select input:checked + span {
  border-color: var(--accent);
  background: var(--accent);
}
.upscale-queue-select input:disabled + span {
  cursor: not-allowed;
  opacity: .45;
}
.upscale-title {
  min-width: 0;
  color: var(--ink);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.upscale-meta {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 10px;
}
.upscale-progress {
  height: 5px;
  border-radius: 99px;
  background: color-mix(in oklab, var(--ink) 10%, transparent);
  overflow: hidden;
}
.upscale-progress span {
  display: block;
  height: 100%;
  width: 0;
  background: var(--accent);
}
.upscale-card-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.upscale-card-actions button {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--ink-soft);
  font: 11px var(--font-display);
  cursor: pointer;
  padding: 5px 8px;
}
.upscale-card-actions button.primary {
  color: var(--ink);
  border-color: color-mix(in oklab, var(--accent) 38%, var(--line));
  background: color-mix(in oklab, var(--accent) 15%, var(--paper));
}
.upscale-card-actions button:disabled {
  cursor: not-allowed;
  opacity: .45;
}
.upscale-error {
  color: var(--accent-2);
  font-size: 11px;
  line-height: 1.35;
}
.upscale-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 0 12px 10px;
}
.upscale-tabs button {
  height: 32px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  background: var(--paper-2);
  color: var(--ink-soft);
  cursor: pointer;
  font: 12px var(--font-display);
}
.upscale-tabs button.active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.upscale-tabs span {
  margin-left: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
}
.upscale-list-head button {
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font: 11px var(--font-display);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
}
.upscale-list-head button:disabled {
  color: var(--ink-mute);
  cursor: not-allowed;
  opacity: .45;
}
.upscale-result-card {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 10px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  padding: 8px;
}
.upscale-result-thumb {
  position: relative;
  width: 74px;
  height: 74px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--bg-deep);
  overflow: hidden;
  padding: 0;
  cursor: pointer;
}
.upscale-result-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.upscale-result-thumb span {
  position: absolute;
  right: 5px;
  bottom: 5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: white;
  background: rgba(0,0,0,.45);
}
.upscale-result-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.upscale-result-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.upscale-result-actions button {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--ink-soft);
  font: 11px var(--font-display);
  cursor: pointer;
  padding: 5px 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.upscale-result-actions button.danger {
  color: var(--accent-2);
  border-color: color-mix(in oklab, var(--accent-2) 28%, var(--line));
}
.upscale-result-actions button:disabled {
  cursor: not-allowed;
  opacity: .45;
}
.upscale-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,.36);
  backdrop-filter: blur(4px);
}
.upscale-picker,
.upscale-preview {
  width: min(760px, calc(100vw - 64px));
  max-height: min(680px, calc(100vh - 64px));
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-float);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.upscale-picker header,
.upscale-preview header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--line-soft);
}
.upscale-picker header div {
  display: grid;
  gap: 3px;
}
.upscale-picker header strong,
.upscale-preview header strong {
  color: var(--ink);
  font: 700 14px var(--font-display);
}
.upscale-picker header span {
  color: var(--ink-mute);
  font: 10px var(--font-mono);
}
.upscale-picker header button,
.upscale-preview header button {
  margin-left: auto;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-mute);
  cursor: pointer;
}
.upscale-picker header button:hover,
.upscale-preview header button:hover {
  background: var(--paper-2);
  color: var(--ink);
}
.upscale-picker-grid {
  padding: 12px;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 10px;
}
.upscale-picker-grid button {
  position: relative;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  color: var(--ink-soft);
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
}
.upscale-picker-grid button.active {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}
.upscale-picker-grid img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  background: var(--bg-deep);
}
.upscale-picker-grid button span {
  display: block;
  padding: 7px 8px;
  font: 11px var(--font-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.upscale-picker-grid button em {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--paper);
  background: var(--accent);
}
.upscale-picker-empty {
  grid-column: 1 / -1;
  padding: 42px 20px;
  text-align: center;
  color: var(--ink-mute);
  border: 1px dashed var(--line);
  border-radius: var(--radius-md);
}
.upscale-picker footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid var(--line-soft);
}
.upscale-preview {
  width: min(920px, calc(100vw - 64px));
}
.upscale-preview img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 150px);
  object-fit: contain;
  margin: 0 auto;
  background: var(--bg-deep);
}
`;
