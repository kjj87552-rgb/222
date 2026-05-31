/* Tool modal shared CSS — injected once at app bootstrap.
 * Consumed by ToolModal (and all image-edit / video-edit modals that use
 * the .tool-modal-mask / .tm-* / .tm-toolbar / .tm-stage chrome).
 *
 * Also hosts the .x-modal* / .sl-* / .sc-* / .sh-perm chrome required by
 * XModal-based modals (StyleLibModal etc.). These were lost during the
 * legacy modals3.jsx → split-by-feature refactor and restored here.
 */

export const modalStyles = `
/* ─── XModal shared chrome (.x-modal*) ─── recovered from legacy modals3.jsx ─── */
.x-modal-mask {
  position: absolute; inset: 0;
  background: rgba(4,5,7,0.74);
  backdrop-filter: blur(10px);
  z-index: 600;
  display: flex; align-items: center; justify-content: center;
  animation: tmfade .18s ease-out;
}
.has-window-chrome .x-modal-mask{top:38px;bottom:auto;height:calc(100% - 38px)}
.x-modal {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 32px 80px -20px rgba(0,0,0,0.7);
  display: flex; flex-direction: column;
  overflow: hidden;
  font-family: var(--font-body);
}
.x-modal header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--line-soft);
}
.x-modal header h2 {
  margin: 0; flex: 1; font-size: 16px; color: var(--ink);
  font-weight: 600; letter-spacing: -0.01em;
}
.x-modal header .close {
  border: none; background: transparent; cursor: pointer;
  color: var(--ink-mute); padding: 4px;
}
.x-modal header .close:hover { color: var(--ink); }
.x-modal .body { flex: 1; overflow: auto; }
.x-modal .footer {
  padding: 14px 22px;
  border-top: 1px solid var(--line-soft);
  display: flex; align-items: center; gap: 10px;
}
.auto-update-mask { z-index: 900; }
.auto-update-modal {
  width: min(640px, calc(100vw - 32px));
  border-radius: 12px;
}
.auto-update-badge {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--paper);
  background: var(--accent);
}
.auto-update-badge.done { background: #147a4d; }
.auto-update-badge.error { background: #b83232; }
.auto-update-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 12px 22px;
  border-bottom: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper) 84%, var(--bg));
}
.auto-update-tabs button {
  min-width: 0;
  min-height: 34px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper-2);
  color: var(--ink-soft);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}
.auto-update-tabs button:hover,
.auto-update-tabs button.active {
  border-color: color-mix(in oklab, var(--accent) 56%, var(--line));
  background: color-mix(in oklab, var(--accent) 12%, var(--paper));
  color: var(--ink);
}
.auto-update-body {
  display: grid;
  gap: 16px;
  padding: 18px 22px;
  max-height: min(520px, calc(100vh - 220px));
}
.auto-update-summary {
  display: grid;
  gap: 6px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.55;
}
.auto-update-summary span {
  overflow-wrap: anywhere;
}
.auto-update-summary strong {
  color: var(--ink);
  font-size: 15px;
}
.auto-update-progress-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}
.auto-update-progress {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: color-mix(in oklab, var(--ink) 10%, transparent);
}
.auto-update-progress::-webkit-progress-bar {
  border-radius: 999px;
  background: color-mix(in oklab, var(--ink) 10%, transparent);
}
.auto-update-progress::-webkit-progress-value {
  border-radius: 999px;
  background: var(--accent);
}
.auto-update-progress::-moz-progress-bar {
  border-radius: 999px;
  background: var(--accent);
}
.auto-update-history {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.auto-update-history-empty {
  min-height: 156px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px dashed var(--line);
  border-radius: 8px;
  color: var(--ink-mute);
  text-align: center;
  padding: 18px;
}
.auto-update-history-empty strong {
  color: var(--ink-soft);
  font-size: 13px;
}
.auto-update-history-empty span {
  max-width: 420px;
  font-size: 12px;
  line-height: 1.5;
}
.auto-update-history-empty.error {
  border-color: rgba(239,68,68,.3);
  background: rgba(239,68,68,.07);
}
.auto-update-release {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper-2);
}
.auto-update-release-head {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.auto-update-release-head div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.auto-update-release-head strong {
  color: var(--ink);
  font-size: 15px;
}
.auto-update-release-head span,
.auto-update-release footer {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 10px;
}
.auto-update-release p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.auto-update-release footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid var(--line-soft);
  padding-top: 9px;
}
.auto-update-release footer span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.x-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  border: 1px solid var(--line); background: var(--paper-2);
  color: var(--ink); font-size: 12px; cursor: pointer;
  font-family: var(--font-body);
}
.x-btn:hover { border-color: var(--accent); color: var(--ink); }
.x-btn.primary {
  background: var(--accent); color: var(--paper);
  border-color: var(--accent); font-weight: 600;
}
.x-btn.primary:hover { filter: brightness(1.08); }
.x-btn.danger {
  border-color:rgba(239,68,68,.32);
  background:rgba(239,68,68,.1);
  color:#fecaca;
}
.x-btn.danger:hover {
  border-color:rgba(239,68,68,.54);
  background:rgba(239,68,68,.18);
}
.x-btn.ghost { background: transparent; }
.x-btn:disabled {
  cursor: not-allowed;
  opacity: .45;
  filter: none;
}
.media-upload-label {
  position: relative;
  overflow: hidden;
}
.media-upload-label input {
  position:absolute;
  inset:0;
  opacity:0;
  cursor:pointer;
  font-size: 0;
}
.media-upload-label.disabled {
  cursor:not-allowed;
  opacity:.45;
  filter:none;
}
.media-upload-label.disabled input {
  cursor:not-allowed;
}
.x-credit {
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-mute);
  display: inline-flex; align-items: center; gap: 4px;
}

/* ─── ScriptCreateModal / shared form fields (.sc-*) ─── */
.sc-field { margin-bottom: 14px; }
.sc-field label {
  display: block; font-size: 11px; color: var(--ink-mute);
  margin-bottom: 6px; letter-spacing: .04em; text-transform: uppercase;
}
.sc-field textarea, .sc-field input {
  width: 100%; padding: 10px 12px;
  background: var(--paper-2); border: 1px solid var(--line);
  border-radius: 8px; outline: none; resize: vertical;
  font-family: var(--font-body); font-size: 13px; color: var(--ink);
}
.sc-field textarea:focus, .sc-field input:focus { border-color: var(--accent); }
.sc-uploaded {
  display: flex; gap: 8px; flex-wrap: wrap; padding: 10px 0;
}
.sc-uploaded .pic {
  width: 80px; height: 80px; border-radius: 8px;
  background-size: cover; background-position: center;
  border: 1px solid var(--line-soft); position: relative;
}
.sc-uploaded .pic .x {
  position: absolute; top: 4px; right: 4px;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(0,0,0,0.6); color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.sc-uploaded .add {
  width: 80px; height: 80px; border-radius: 8px;
  border: 1.5px dashed var(--line); display: flex;
  align-items: center; justify-content: center;
  color: var(--ink-mute); cursor: pointer;
}
.sc-uploaded .add:hover { border-color: var(--accent); color: var(--accent); }

/* ─── ShareModal permission cards (.sh-perm*) — also used by StyleLibModal create flow ─── */
.sh-perms {
  display: flex; gap: 8px; margin-bottom: 16px;
}
.sh-perm {
  flex: 1; padding: 10px; border-radius: 8px;
  background: var(--paper-2); border: 1.5px solid var(--line-soft);
  cursor: pointer;
  display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
}
.sh-perm.active { border-color: var(--accent); background: color-mix(in oklab, var(--accent) 8%, var(--paper-2)); }
.sh-perm .h { font-size: 12px; color: var(--ink); font-weight: 600; }
.sh-perm .d { font-size: 10px; color: var(--ink-mute); }

/* ─── StyleLibModal (.sl-*) ─── recovered from legacy modals3.jsx ─── */
.sl-modal { position: relative; width: 1280px; height: 800px; max-width: calc(100% - 60px); max-height: calc(100% - 60px); }
.sl-modal .body { display: flex; flex-direction: column; }
.sl-cats {
  display: flex; gap: 12px; padding: 12px 22px;
  border-bottom: 1px solid var(--line-soft); overflow-x: auto;
  white-space: nowrap;
}
.sl-cat {
  padding: 6px 14px; border-radius: 999px;
  background: var(--paper-2); border: 1px solid transparent;
  font-size: 12px; cursor: pointer; color: var(--ink-soft);
}
.sl-cat.active {
  background: var(--ink); color: var(--paper); border-color: var(--ink);
  font-weight: 600;
}
.sl-grid {
  flex: 1; overflow-y: auto; padding: 18px 22px;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}
.sl-card {
  position: relative;
  border-radius: 10px; overflow: hidden;
  background: var(--paper-2); border: 1px solid var(--line-soft);
  cursor: pointer; aspect-ratio: 0.78;
  transition: transform .12s, border-color .12s;
}
.sl-card:hover { transform: translateY(-3px); border-color: var(--accent); }
.sl-card .thumb {
  width: 100%; height: 75%;
  background-size: cover; background-position: center;
}
.sl-card .meta {
  height: 25%;
  padding: 6px 10px;
  display: flex; flex-direction: column; justify-content: center;
  border-top: 1px solid var(--line-soft);
}
.sl-card .meta .n {
  font-size: 12px; color: var(--ink); margin-bottom: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.sl-card .meta .a {
  font-family: var(--font-mono); font-size: 9px; color: var(--ink-mute);
}
.sl-card .pop-pill {
  position: absolute; top: 8px; right: 8px;
  padding: 2px 6px; border-radius: 4px;
  background: rgba(10,12,14,0.7);
  color: #fff; font-family: var(--font-mono); font-size: 9px;
}
.sl-card .new-pill {
  position: absolute; top: 8px; left: 8px;
  padding: 2px 6px; border-radius: 4px;
  background: var(--accent); color: var(--paper);
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
}
.sl-create-card {
  border: 2px dashed var(--line);
  background: transparent;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--ink-mute); gap: 8px;
}
.sl-create-card:hover { border-color: var(--accent); color: var(--accent); }

/* ─── Style library redesign ─── */
.sl-modal.sl-redesign { width: 1080px; height: 760px; max-width: calc(100% - 56px); max-height: calc(100% - 56px); }
.sl-modal.sl-redesign.sl-modal-adding {
  width: min(640px, calc(100% - 56px));
  height: auto;
  max-height: calc(100% - 56px);
  border: 0;
  background: transparent;
  box-shadow: none;
  overflow: visible;
}
.sl-modal-adding > header,
.sl-modal-adding .sl-library-head,
.sl-modal-adding .sl-tabs,
.sl-modal-adding .sl-style-sections {
  display: none;
}
.sl-redesign .body { display: flex; flex-direction: column; background: var(--bg); }
.sl-modal-adding .body {
  overflow: visible;
  background: transparent;
}
.sl-library-head {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 16px 22px 14px; border-bottom: 1px solid var(--line-soft);
}
.sl-library-head div { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.sl-library-head span {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--ink-mute);
}
.sl-library-head strong { color: var(--ink); font-size: 14px; }
.sl-add-style { white-space: nowrap; }
.sl-tabs {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;
  padding: 14px 22px; border-bottom: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper) 72%, var(--bg));
}
.sl-tab {
  appearance: none; min-width: 0; min-height: 58px; border-radius: 8px;
  border: 1px solid var(--line); background: var(--paper-2);
  color: var(--ink-soft); cursor: pointer; text-align: left;
  display: flex; flex-direction: column; justify-content: center; gap: 6px;
  padding: 10px 14px; font-family: var(--font-body);
  transition: border-color .16s ease, background .16s ease, color .16s ease;
}
.sl-tab strong { color: var(--ink); font-size: 13px; line-height: 1.15; }
.sl-tab span {
  color: var(--ink-mute); font-size: 11px; line-height: 1.25;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.sl-tab:hover {
  border-color: color-mix(in oklab, var(--accent) 38%, var(--line));
  background: color-mix(in oklab, var(--paper-2) 90%, var(--accent));
}
.sl-tab.active {
  border-color: color-mix(in oklab, var(--accent) 58%, var(--line));
  background: color-mix(in oklab, var(--accent) 14%, var(--paper));
  color: var(--ink);
}
.sl-tab.active span { color: var(--ink-soft); }
.sl-tab:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--accent) 64%, white);
  outline-offset: 3px;
}
.sl-style-sections {
  flex: 1; overflow-y: auto; padding: 18px 22px 22px;
  display: flex; flex-direction: column; gap: 22px;
}
.sl-style-section { display: flex; flex-direction: column; gap: 12px; }
.sl-style-section-head {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  padding: 0 2px;
}
.sl-style-section-head strong { color: var(--ink); font-size: 13px; }
.sl-style-section-head span {
  color: var(--ink-mute); font-size: 11px; white-space: nowrap;
}
.sl-style-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;
}
.sl-style-card {
  appearance: none; border: 1px solid var(--line); border-radius: 8px; padding: 0;
  background: var(--paper); color: inherit; text-align: left; cursor: pointer;
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(220px, .95fr);
  min-height: 178px; overflow: hidden; transition: transform .16s ease, border-color .16s ease, background .16s ease;
}
.sl-style-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in oklab, var(--accent) 48%, var(--line));
  background: color-mix(in oklab, var(--paper) 94%, var(--accent));
}
.sl-style-card:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--accent) 64%, white);
  outline-offset: 3px;
}
.sl-preview { min-width: 0; min-height: 178px; background: #080a0d; display: block; overflow: hidden; }
.sl-preview img {
  width: 100%; height: 100%; min-height: 178px;
  object-fit: cover; object-position: left center; display: block;
}
.sl-card-copy { min-width: 0; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; }
.sl-style-title { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.sl-style-title strong { color: var(--ink); font-size: 17px; line-height: 1.2; letter-spacing: 0; }
.sl-style-title em {
  align-self: flex-start; font-style: normal; min-height: 24px; display: inline-flex; align-items: center;
  padding: 0 9px; border-radius: 999px; background: color-mix(in oklab, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in oklab, var(--accent) 28%, var(--line));
  color: var(--ink-soft); font-size: 11px;
}
.sl-texture-row {
  min-width: 0; display: grid; grid-template-columns: 60px minmax(0, 1fr); gap: 10px; align-items: center;
  padding: 10px; border: 1px solid var(--line-soft); border-radius: 8px; background: var(--paper-2);
}
.sl-texture-row img {
  width: 60px; height: 60px; border-radius: 7px;
  object-fit: cover; object-position: right center;
  border: 1px solid color-mix(in oklab, var(--line) 70%, transparent);
}
.sl-texture-row span { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.sl-texture-row small {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-mute);
}
.sl-texture-row b { color: var(--ink-soft); font-size: 12px; line-height: 1.35; font-weight: 600; }
.sl-create-mask {
  position: absolute; inset: 0; z-index: 3;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  background: color-mix(in oklab, rgba(4,5,7,.72) 88%, transparent);
  backdrop-filter: blur(10px);
}
.sl-modal-adding .sl-create-mask {
  position: static;
  inset: auto;
  z-index: auto;
  display: block;
  padding: 0;
  background: transparent;
  backdrop-filter: none;
}
.sl-create-dialog {
  width: min(640px, 100%);
  max-height: min(680px, calc(100vh - 72px));
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--paper);
  box-shadow: 0 26px 80px -22px rgba(0,0,0,.72);
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.sl-create-head {
  grid-column: 1 / -1;
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-soft);
}
.sl-create-head div { display: flex; flex-direction: column; gap: 5px; }
.sl-create-head span {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--ink-mute);
}
.sl-create-head strong { color: var(--ink); font-size: 16px; }
.sl-create-head .close {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid var(--line); background: var(--paper-2);
  color: var(--ink-soft); cursor: pointer;
}
.sl-create-head .close:hover { color: var(--ink); border-color: var(--accent); }
.sl-create-field {
  min-width: 0;
  display: flex; flex-direction: column; gap: 6px;
  color: var(--ink-mute); font-size: 11px;
}
.sl-create-field span { font-size: 11px; color: var(--ink-mute); }
.sl-create-field input,
.sl-create-field select,
.sl-create-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper-2);
  color: var(--ink);
  font: inherit;
  font-size: 12px;
  outline: none;
  padding: 9px 10px;
}
.sl-create-field textarea { min-height: 128px; resize: vertical; line-height: 1.5; }
.sl-create-field input:focus,
.sl-create-field select:focus,
.sl-create-field textarea:focus {
  border-color: color-mix(in oklab, var(--accent) 58%, var(--line));
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 12%, transparent);
}
.sl-create-field-wide { grid-column: 1 / -1; }
.sl-create-upload em {
  color: var(--ink-soft);
  font-size: 11px;
  font-style: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sl-upload-box {
  position: relative;
  min-height: 108px;
  border: 1.5px dashed color-mix(in oklab, var(--accent) 36%, var(--line));
  border-radius: 10px;
  background: color-mix(in oklab, var(--paper-2) 82%, var(--accent));
  overflow: hidden;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.sl-upload-box:hover {
  border-color: color-mix(in oklab, var(--accent) 62%, var(--line));
  background: color-mix(in oklab, var(--paper-2) 76%, var(--accent));
}
.sl-upload-box > span {
  display: grid;
  gap: 5px;
  place-items: center;
  color: var(--ink-soft);
}
.sl-upload-box strong {
  color: var(--ink);
  font-size: 12px;
}
.sl-upload-box small {
  color: var(--ink-mute);
  font-size: 10px;
}
.sl-upload-box img {
  width: 100%;
  height: 168px;
  object-fit: cover;
  display: block;
}
.sl-upload-box input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.sl-create-actions {
  grid-column: 1 / -1;
  display: flex; justify-content: flex-end; gap: 8px;
  padding-top: 2px;
}
@media (max-width: 900px) {
  .sl-modal.sl-redesign { width: calc(100% - 28px); height: calc(100% - 28px); max-width: calc(100% - 28px); max-height: calc(100% - 28px); }
  .sl-tabs { grid-template-columns: 1fr; }
  .sl-style-grid { grid-template-columns: 1fr; }
  .sl-style-section-head { align-items: flex-start; flex-direction: column; gap: 4px; }
  .sl-style-section-head span { white-space: normal; }
}
@media (max-width: 620px) {
  .sl-style-card { grid-template-columns: 1fr; }
  .sl-preview, .sl-preview img { min-height: 180px; }
  .sl-modal.sl-redesign.sl-modal-adding { width: calc(100% - 28px); max-height: calc(100% - 28px); }
  .sl-create-dialog { grid-template-columns: 1fr; }
}

.tool-modal-mask {
  position:absolute; inset:0;
  background: rgba(0,0,0,0.78);
  backdrop-filter: blur(14px);
  z-index: 600;
  display:flex; align-items:center; justify-content:center;
  animation: tmfade .18s ease-out;
}
.has-window-chrome .tool-modal-mask{top:38px;bottom:auto;height:calc(100% - 38px)}
@keyframes tmfade { from { opacity:0; } to { opacity:1; } }

.tool-modal {
  position: relative;
  width: min(1280px, calc(100% - 120px));
  height: min(820px, calc(100% - 120px));
  display:flex; flex-direction:column;
}

/* Floating toolbar at top, 漫创AI pill */
.tm-toolbar {
  align-self:center;
  display:inline-flex; align-items:center; gap:2px;
  padding: 6px 8px;
  background: color-mix(in oklab, var(--paper) 88%, transparent);
  border: 1px solid var(--line);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px -6px rgba(0,0,0,0.5);
  margin-bottom: 18px;
}
.tm-toolbar button {
  width: 34px; height: 34px;
  border:none; background:transparent; cursor:pointer;
  color: var(--ink-soft); border-radius: 8px;
  display:flex; align-items:center; justify-content:center;
  position:relative;
}
.tm-toolbar button:hover { color: var(--ink); background: color-mix(in oklab, var(--ink) 10%, transparent); }
.tm-toolbar button.active { color: var(--accent); background: color-mix(in oklab, var(--accent) 15%, transparent); }
.tm-toolbar button .tip {
  position:absolute; bottom: 40px; left:50%; transform:translateX(-50%);
  padding: 3px 8px; font-size: 11px; border-radius: 4px;
  background: rgba(20,22,26,0.95); color: var(--ink);
  white-space:nowrap; opacity:0; pointer-events:none;
  transition: opacity .12s; border: 1px solid var(--line-soft);
}
.tm-toolbar button:hover .tip { opacity:1; }
.tm-toolbar .sep { width:1px; height:18px; background: var(--line-soft); margin: 0 4px; align-self:center; }
.tm-toolbar .close-btn { color: var(--ink-mute); }

/* Stage = main media area */
.tm-stage {
  flex:1; position:relative;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 16px 60px -20px rgba(0,0,0,0.8);
}
.tm-stage .label {
  position:absolute; top:12px; left:14px;
  display:inline-flex; align-items:center; gap:6px;
  padding: 3px 10px; border-radius: 999px;
  background: rgba(10,12,14,0.7);
  border: 1px solid var(--line-soft);
  color: var(--ink-soft); font-size: 11px;
  font-family: var(--font-mono);
}
.tm-stage .dim {
  position:absolute; top:12px; right:14px;
  font-family: var(--font-mono); font-size: 11px;
  color: var(--ink-mute);
}
.tm-stage .bigimg {
  width:100%; height:100%; object-fit:cover; display:block;
  user-select:none; -webkit-user-drag:none;
}
.tm-stage .stage-btn {
  position:absolute; padding: 6px 12px;
  background: rgba(10,12,14,0.75); color: var(--ink);
  border: 1px solid var(--line-soft); border-radius: 8px;
  font-size: 12px; cursor:pointer;
  display:inline-flex; align-items:center; gap:6px;
}
.tm-stage .stage-btn:hover { background: rgba(10,12,14,0.9); }

/* 3D orbital gizmo (axes + rotating dot) */
.tm-gizmo {
  position:absolute; right:16px; bottom:16px;
  width: 128px; height: 128px;
  background: rgba(10,12,14,0.7);
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: 10px;
  font-family: var(--font-mono); font-size: 10px;
  color: var(--ink-soft);
  backdrop-filter: blur(6px);
}
.tm-gizmo .gizmo-readout {
  position:absolute; bottom:6px; left:10px; right:10px;
  display:flex; justify-content:space-between;
}

/* Panorama dragging ribbon (imitates 360-pan with repeating bg) */
.tm-pano-surface {
  position:absolute; inset:0;
  background-size: 180% 100%;
  background-repeat: repeat-x;
  background-position: center center;
  cursor: grab;
  transition: background-position .08s;
}
.tm-pano-surface.dragging { cursor: grabbing; }

/* Slice grid overlay (3x3 guides) */
.tm-grid-overlay {
  position:absolute; inset:0; pointer-events:none;
}
.tm-grid-overlay .gl {
  position:absolute; background: rgba(255,255,255,0.35);
}
.tm-grid-overlay.cell-hover .cell {
  position:absolute; border: 1.5px solid transparent;
  background: rgba(0,0,0,0);
  transition: background .12s, border-color .12s;
  cursor: crosshair;
}
.tm-grid-overlay.cell-hover .cell:hover {
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 20%, transparent);
}
.tm-grid-overlay.cell-hover .cell.selected {
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 35%, transparent);
}

/* Side / bottom control panels */
.tm-side {
  position:absolute; right: 18px; bottom: 18px;
  width: 280px;
  background: color-mix(in oklab, var(--paper) 92%, transparent);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px;
  backdrop-filter: blur(8px);
  box-shadow: 0 12px 40px -14px rgba(0,0,0,0.7);
  font-family: var(--font-body); font-size: 12px;
}
.tm-side h3 {
  margin:0 0 12px; font-size: 11px;
  color: var(--ink-mute); text-transform:uppercase;
  letter-spacing: .08em; font-weight:600;
}
.tm-row {
  display:flex; align-items:center; gap: 10px;
  margin-bottom: 10px;
}
.tm-row label { width: 56px; color: var(--ink-soft); font-size: 11px; }
.tm-row input[type="range"] {
  flex:1; accent-color: var(--accent);
}
.tm-row .val {
  min-width: 40px; text-align: right;
  font-family: var(--font-mono); font-size: 10px;
  color: var(--ink-mute);
}
.tm-preset-grid {
  display:grid; grid-template-columns: repeat(3, 1fr);
  gap: 6px; margin-top: 10px;
}
.tm-preset {
  aspect-ratio: 1/1; border-radius: 6px;
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  display:flex; align-items:center; justify-content:center;
  cursor: pointer;
  color: var(--ink-soft); font-size: 10px;
  position:relative; overflow:hidden;
}
.tm-preset:hover, .tm-preset.active {
  border-color: var(--accent);
  color: var(--accent);
}
.tm-preset .lbl {
  position:absolute; bottom: 2px; left: 0; right: 0;
  text-align: center; font-size: 9px;
  font-family: var(--font-mono);
  background: rgba(0,0,0,0.5); color: #fff;
  padding: 1px;
}

/* Generate button */
.tm-send {
  width:100%; padding: 10px;
  background: var(--accent); color: var(--paper);
  border:none; border-radius: 8px;
  font-family: var(--font-display); font-weight:700; font-size: 13px;
  cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap: 6px;
  margin-top: 12px;
}
.tm-send:hover { filter: brightness(1.08); }

/* Color-temperature chips */
.tm-temp-bar {
  display:flex; gap:4px; margin-top: 8px;
}
.tm-temp-chip {
  flex:1; height: 28px; border-radius: 6px;
  border: 1.5px solid transparent; cursor:pointer;
  transition: border-color .1s;
}
.tm-temp-chip.active { border-color: var(--ink); }

/* Rotate dial */
.tm-dial {
  width: 150px; height: 150px; margin: 10px auto;
  position:relative; border-radius: 50%;
  background: conic-gradient(from -90deg,
    color-mix(in oklab, var(--accent) 60%, transparent) 0deg,
    color-mix(in oklab, var(--accent) 60%, transparent) var(--angle, 0deg),
    var(--paper-2) var(--angle, 0deg));
  border: 1px solid var(--line);
}
.tm-dial::after {
  content:""; position:absolute; inset: 12px;
  background: var(--paper); border-radius: 50%;
  border: 1px solid var(--line-soft);
}
.tm-dial .knob {
  position:absolute; left: 50%; top: 50%;
  width: 3px; height: 66px; background: var(--accent);
  transform-origin: center 100%;
  transform: translate(-50%, -100%) rotate(var(--angle, 0deg));
  z-index: 2; border-radius: 2px;
}
.tm-dial-val {
  position:absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  font-family: var(--font-mono); font-size: 14px;
  color: var(--ink);
}

/* ─── ScriptFullModal (.sf-*) ─── recovered from legacy modals2.jsx ─── */
.sf-modal .tm-stage {
  background: var(--paper); padding: 0; overflow: hidden;
  display: flex;
}
.sf-left {
  width: 220px; flex: 0 0 220px;
  background: var(--paper-2);
  border-right: 1px solid var(--line-soft);
  padding: 16px 12px;
  overflow-y: auto;
}
.sf-left h4 { margin: 0 0 10px; font-size: 11px; color: var(--ink-mute); text-transform: uppercase; letter-spacing: .08em; }
.sf-char {
  display: flex; align-items: center; gap: 10px;
  padding: 6px; border-radius: 6px; cursor: pointer;
  margin-bottom: 4px;
}
.sf-char:hover { background: var(--paper); }
.sf-char.active { background: var(--paper); border: 1px solid var(--line); }
.sf-char .avi {
  width: 36px; height: 36px; border-radius: 6px;
  background-size: cover; background-position: center;
  flex: 0 0 auto;
}
.sf-char .name { font-size: 12px; color: var(--ink); }
.sf-char .role { font-size: 10px; color: var(--ink-mute); font-family: var(--font-mono); }
.sf-char-add {
  padding: 10px; border-radius: 6px;
  border: 1px dashed var(--line);
  color: var(--ink-mute); font-size: 11px; text-align: center; cursor: pointer;
  margin-top: 6px;
}
.sf-body { flex: 1; padding: 20px 24px; overflow-y: auto; }
.sf-body h2 { font-size: 18px; margin: 0 0 16px; color: var(--ink); }
.sf-toolbar {
  display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
}
.sf-toolbar button {
  padding: 5px 12px; border-radius: 6px;
  background: var(--paper-2); border: 1px solid var(--line-soft);
  color: var(--ink); font-size: 12px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.sf-toolbar button.primary {
  background: var(--accent); color: var(--paper); border-color: var(--accent); font-weight: 600;
}
.sf-table {
  width: 100%; border-collapse: separate; border-spacing: 0;
  font-size: 12px;
}
.sf-table th {
  padding: 8px 10px; text-align: left;
  background: var(--paper-2);
  font-family: var(--font-mono); font-size: 10px;
  color: var(--ink-mute); font-weight: 600;
  text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 1px solid var(--line);
}
.sf-table td {
  padding: 10px; vertical-align: top;
  border-bottom: 1px solid var(--line-soft); color: var(--ink);
}
.sf-table .n { width: 30px; font-family: var(--font-mono); color: var(--ink-mute); }
.sf-table .shot {
  width: 80px; font-family: var(--font-mono);
  color: var(--accent); font-size: 11px;
}
.sf-table .dur { width: 50px; font-family: var(--font-mono); color: var(--ink-mute); text-align: right; }
.sf-table .thumb-col { width: 100px; }
.sf-table .shot-thumb {
  width: 80px; height: 45px; border-radius: 4px;
  background-size: cover; background-position: center;
  border: 1px solid var(--line-soft);
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-mute); font-size: 10px;
}
.sf-table .status {
  font-family: var(--font-mono); font-size: 10px;
  padding: 2px 6px; border-radius: 3px; display: inline-block;
}
.sf-table .status.done { background: color-mix(in oklab, var(--accent) 20%, var(--paper)); color: var(--accent); }
.sf-table .status.pend { background: var(--paper-2); color: var(--ink-mute); }
.sf-overview-modal {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.sf-modal .sf-overview-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 0;
  background:
    radial-gradient(circle at 18% 12%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 34%),
    var(--paper);
}
.sf-overview-main {
  min-width: 0;
  padding: 42px 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.sf-overview-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--line-soft);
  color: var(--accent);
  background: color-mix(in oklab, var(--accent) 8%, transparent);
  font-size: 12px;
  font-weight: 650;
}
.sf-overview-main h2 {
  margin: 0;
  color: var(--ink);
  font-size: 28px;
  line-height: 1.15;
  letter-spacing: 0;
}
.sf-overview-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.sf-overview-stats div {
  min-height: 82px;
  padding: 14px;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  background: color-mix(in oklab, var(--paper-2) 82%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sf-overview-stats strong {
  color: var(--ink);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0;
}
.sf-overview-stats span {
  color: var(--ink-mute);
  font-size: 11px;
}
.sf-overview-preview {
  min-height: 118px;
  max-height: min(420px, 44vh);
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  background: color-mix(in oklab, var(--paper-2) 62%, transparent);
  padding: 16px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.7;
  overflow: auto;
}
.sf-overview-preview p,
.sf-overview-script {
  margin: 0;
}
.sf-overview-script {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font-mono);
}
.sf-overview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: auto;
}
.sf-overview-actions button {
  height: 34px;
  padding: 0 13px;
  border-radius: 7px;
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.sf-overview-actions button:hover {
  border-color: color-mix(in oklab, var(--accent) 42%, var(--line-soft));
}
.sf-overview-actions button.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--paper);
}
.sf-overview-side {
  border-left: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper-2) 76%, transparent);
  padding: 42px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sf-overview-step {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px;
  border-radius: 7px;
  color: var(--ink-mute);
  font-size: 12px;
  border: 1px solid transparent;
}
.sf-overview-step.active {
  color: var(--accent);
  background: color-mix(in oklab, var(--accent) 10%, transparent);
  border-color: color-mix(in oklab, var(--accent) 28%, var(--line-soft));
}
@media (max-width: 900px) {
  .sf-modal .sf-overview-stage { grid-template-columns: 1fr; overflow-y: auto; }
  .sf-overview-main { padding: 28px; }
  .sf-overview-side { display: none; }
  .sf-overview-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
/* ─── Recovered from legacy modals3.jsx (ScriptCreateModal .sc-modal/.sc-modes) ─── */
.sc-modal { width: 720px; max-width: calc(100% - 60px); max-height: 80vh; }
.sc-modes {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; padding: 16px 22px;
}
.sc-mode {
  position: relative; padding: 16px 14px;
  border-radius: 12px; border: 1.5px solid var(--line);
  background: var(--paper-2); cursor: pointer;
  text-align: left; transition: border-color .12s, transform .1s;
}
.sc-mode:hover { border-color: var(--accent); transform: translateY(-2px); }
.sc-mode.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 20%, transparent);
}
.sc-mode .ic {
  width: 38px; height: 38px; border-radius: 10px;
  background: color-mix(in oklab, var(--accent) 12%, var(--paper));
  display: flex; align-items: center; justify-content: center;
  color: var(--accent); margin-bottom: 12px;
}
.sc-mode h3 {
  margin: 0 0 4px; font-size: 14px; color: var(--ink); font-weight: 600;
}
.sc-mode p { margin: 0; font-size: 11px; color: var(--ink-mute); line-height: 1.5; }
.sc-mode .badge-new {
  position: absolute; top: 10px; right: 10px;
  font-family: var(--font-mono); font-size: 9px; padding: 1px 5px;
  border-radius: 3px; background: var(--accent); color: var(--paper); font-weight: 700;
}

/* ─── Recovered from legacy modals3.jsx (.sc-form) ─── */
.sc-form { padding: 0 22px 16px; }
.sc-analysis-note {
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:6px;
  margin:6px 0 8px;
}
.sc-analysis-note span,
.sc-analysis-note em {
  display:inline-flex;
  align-items:center;
  min-height:22px;
  padding:0 7px;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:color-mix(in oklab, var(--paper-2) 84%, transparent);
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  font-style:normal;
}
.sc-analysis-note span {
  color:var(--accent);
  border-color:color-mix(in oklab, var(--accent) 32%, var(--line-soft));
}
.sc-frame-strip {
  display:flex;
  gap:8px;
  overflow-x:auto;
  padding:4px 0 2px;
}
.sc-frame-strip .frame {
  position:relative;
  width:92px;
  height:54px;
  flex:0 0 auto;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background-size:cover;
  background-position:center;
  background-color:#0a0d10;
  overflow:hidden;
}
.sc-frame-strip .frame span,
.sc-frame-strip .frame em,
.sc-frame-strip .frame strong {
  position:absolute;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:rgba(0,0,0,.62);
  color:#fff;
  font-family:var(--font-mono);
  font-style:normal;
}
.sc-frame-strip .frame span {
  left:4px;
  top:4px;
  width:18px;
  height:18px;
  border-radius:50%;
  font-size:10px;
}
.sc-frame-strip .frame em {
  right:4px;
  bottom:4px;
  min-width:28px;
  height:16px;
  padding:0 4px;
  border-radius:4px;
  font-size:9px;
}
.sc-frame-strip .frame strong {
  left:4px;
  bottom:4px;
  max-width:calc(100% - 42px);
  height:16px;
  padding:0 4px;
  border-radius:4px;
  font-size:9px;
  font-weight:600;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

/* ─── Recovered from legacy modals3.jsx (SubjectLibModal .sb-*) ─── */
/* ── SubjectLibModal ── */
.sb-modal { width: 1080px; height: 720px; max-width: calc(100% - 60px); max-height: calc(100% - 60px); }
.media-subject-modal .body { display:flex; flex-direction:column; overflow:hidden; }
.media-lib-tabs {
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 14px 22px 10px;
  border-bottom: 1px solid var(--line-soft);
}
.media-lib-tabs > button {
  min-height: 34px;
  display:inline-flex;
  align-items:center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
}
.media-lib-tabs > button.active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.media-lib-tabs > button em {
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 10px;
  opacity: .72;
}
.media-scope-switch {
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 12px 18px 0;
}
.media-scope-switch button {
  min-height: 44px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  padding: 8px 12px;
  border:1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper-2);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  text-align:left;
}
.media-scope-switch button strong {
  color: var(--ink);
  font-size: 12px;
}
.media-scope-switch button span {
  color: var(--ink-mute);
  font-size: 11px;
}
.media-scope-switch button.active {
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 13%, var(--paper));
}
.media-library-notice {
  margin: 0 18px 10px;
  padding: 7px 10px;
  border:1px solid color-mix(in oklab, var(--accent) 28%, var(--line-soft));
  border-radius: 8px;
  background: color-mix(in oklab, var(--accent) 10%, var(--paper));
  color: var(--ink-soft);
  font-size: 12px;
}
.media-lib-search { margin-left:auto; }
.image-lib-controls {
  display:flex;
  flex-direction:column;
  gap: 10px;
  padding: 12px 22px;
  border-bottom: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper-2) 42%, transparent);
}
.image-category-tabs,
.image-tag-filter {
  display:flex;
  align-items:center;
  gap: 8px;
  flex-wrap:wrap;
}
.image-category-tabs button,
.image-tag-filter button {
  min-height: 28px;
  padding: 5px 10px;
  border-radius: 999px;
  border:1px solid var(--line-soft);
  background: var(--paper);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
}
.image-category-tabs button.active,
.image-tag-filter button.active {
  color: var(--ink);
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 14%, var(--paper));
}
.image-category-tabs button span {
  margin-left: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-mute);
}
.media-library-layout {
  flex:1;
  min-height:0;
  display:grid;
  grid-template-columns: minmax(0, 1fr) 300px;
}
.sb-tabs {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--line-soft);
}
.sb-tab {
  padding: 7px 14px; border-radius: 8px;
  background: var(--paper-2); border: 1px solid var(--line-soft);
  font-size: 12px; cursor: pointer; color: var(--ink-soft);
  position: relative;
}
.sb-tab.active { background: var(--ink); color: var(--paper); border-color: var(--ink); font-weight: 600; }
.sb-tab .sb-count {
  margin-left: 7px;
  font-family: var(--font-mono);
  font-size: 10px;
  opacity: .72;
}
.sb-tab .new-pill {
  position: absolute; top: -8px; right: -10px;
  font-family: var(--font-mono); font-size: 8px; padding: 1px 4px;
  border-radius: 2px; background: var(--accent-2, #FF6B6B); color: #fff; font-weight: 700;
}
.sb-search {
  margin-left: auto; flex: 1; max-width: 360px;
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; background: var(--paper-2);
  border: 1px solid var(--line-soft); border-radius: 8px;
  color: var(--ink-mute); font-size: 12px;
}
.sb-search input {
  flex: 1; border: none; background: transparent;
  outline: none; color: var(--ink); font-size: 12px;
  font-family: var(--font-body);
}
.sb-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px; padding: 16px 22px;
  overflow:auto;
}
.sb-card {
  border-radius: 12px; overflow: hidden;
  background: var(--paper-2); border: 1px solid var(--line-soft);
  cursor: pointer; transition: border-color .12s, transform .1s;
  color: var(--ink-soft);
  font-family: var(--font-body);
  text-align: left;
}
.sb-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.sb-card:disabled {
  cursor:not-allowed;
  opacity:.58;
}
.sb-card:disabled:hover {
  border-color: var(--line-soft);
  transform:none;
}
.sb-card.add {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  aspect-ratio: 0.85; gap: 10px;
  border-style: dashed; color: var(--ink-mute); text-align: center;
}
.sb-card.add:hover { color: var(--accent); }
.sb-card .thumb {
  aspect-ratio: 1/1; background-size: cover; background-position: center;
  position: relative;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
  background: var(--paper);
}
.sb-card .thumb img,
.sb-card .thumb video {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.sb-card .thumb video {
  background:#050607;
}
.sb-card .thumb .sb-play {
  position:absolute;
  left:50%;
  top:50%;
  width:42px;
  height:42px;
  transform:translate(-50%, -50%);
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  background: rgba(0,0,0,.46);
  border:1px solid rgba(255,255,255,.32);
}
.sb-audio-thumb {
  width:100%;
  height:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap: 18px;
  color: var(--accent);
  background:
    radial-gradient(circle at 35% 22%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 34%),
    var(--paper);
}
.sb-wave {
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 3px;
  width: 72%;
  height: 34px;
}
.sb-wave span {
  width: 3px;
  border-radius: 3px;
  background: color-mix(in oklab, var(--accent) 62%, var(--ink-soft));
}
.sb-card .thumb .check-pill {
  position: absolute; top: 8px; left: 8px;
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 999px;
  background: rgba(10,12,14,0.72);
  color: var(--accent); font-size: 10px; font-family: var(--font-mono);
  border: 1px solid color-mix(in oklab, var(--accent) 40%, transparent);
}
.sb-card .meta {
  padding: 8px 10px;
  display: flex; align-items: center; gap: 8px;
  border-top: 1px solid var(--line-soft);
}
.sb-card .meta .n { flex: 1; font-size: 12px; color: var(--ink); }
.sb-card .meta .role {
  font-family: var(--font-mono); font-size: 9px; color: var(--ink-mute);
  padding: 1px 5px; background: var(--paper); border-radius: 3px;
  max-width: 78px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.media-grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
.media-card {
  padding:0;
  position:relative;
}
.media-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--accent) 40%, transparent);
}
.media-card-tags {
  display:flex;
  align-items:center;
  gap: 4px;
  padding: 0 9px 9px;
  flex-wrap:wrap;
}
.media-card-tags span {
  max-width: 74px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--paper);
  border:1px solid var(--line-soft);
  color: var(--ink-mute);
  font-size: 10px;
}
.media-card-use {
  position:absolute;
  right: 8px;
  top: 8px;
  min-height: 24px;
  padding: 3px 8px;
  border:1px solid color-mix(in oklab, var(--accent) 45%, transparent);
  border-radius: 999px;
  background: rgba(10,12,14,.72);
  color: var(--accent);
  cursor:pointer;
  font-size: 10px;
  font-family: var(--font-body);
}
.media-card-use:disabled {
  display:none;
}
.sb-empty {
  min-height: 170px;
  border: 1px dashed var(--line-soft);
  border-radius: 12px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap: 6px;
  color: var(--ink-mute);
  grid-column: span 2;
}
.sb-empty strong {
  color: var(--ink-soft);
  font-size: 13px;
}
.sb-empty span {
  font-size: 12px;
}
.media-detail-panel {
  min-width:0;
  border-left:1px solid var(--line-soft);
  background: var(--paper-2);
  padding: 14px;
  overflow:auto;
  display:flex;
  flex-direction:column;
  gap: 14px;
}
.media-detail-preview {
  width:100%;
  aspect-ratio: 1/1;
  border-radius: 10px;
  overflow:hidden;
  border:1px solid var(--line-soft);
  background: var(--paper);
  display:flex;
  align-items:center;
  justify-content:center;
}
.media-detail-preview img,
.media-detail-preview video {
  width:100%;
  height:100%;
  object-fit:cover;
}
.media-detail-title {
  display:flex;
  flex-direction:column;
  gap: 4px;
}
.media-detail-title strong {
  color: var(--ink);
  font-size: 14px;
  line-height: 1.35;
}
.media-detail-title span {
  color: var(--ink-mute);
  font-size: 11px;
}
.media-detail-section {
  display:flex;
  flex-direction:column;
  gap: 9px;
}
.media-detail-section h3 {
  margin:0;
  font-size: 12px;
  color: var(--ink-soft);
  font-weight: 600;
}
.media-detail-section.muted,
.media-detail-empty {
  color: var(--ink-mute);
  font-size: 12px;
  line-height: 1.6;
  padding: 12px;
  border-radius: 9px;
  border:1px dashed var(--line-soft);
}
.detail-segment {
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.detail-segment button {
  min-height: 32px;
  border:1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
}
.detail-segment button.active {
  border-color: var(--accent);
  color: var(--ink);
  background: color-mix(in oklab, var(--accent) 14%, var(--paper));
}
.detail-tags {
  display:flex;
  gap: 6px;
  flex-wrap:wrap;
  min-height: 26px;
}
.detail-tags span {
  display:inline-flex;
  align-items:center;
  gap: 4px;
  max-width: 132px;
  padding: 4px 6px 4px 8px;
  border-radius: 999px;
  border:1px solid var(--line-soft);
  background: var(--paper);
  color: var(--ink-soft);
  font-size: 11px;
}
.detail-tags button {
  width: 16px;
  height: 16px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:none;
  background:transparent;
  color: var(--ink-mute);
  padding:0;
  cursor:pointer;
}
.detail-tag-form {
  display:flex;
  gap: 7px;
}
.detail-tag-form input {
  min-width:0;
  flex:1;
  height: 32px;
  border:1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink);
  outline:none;
  padding: 0 9px;
  font-family: var(--font-body);
  font-size: 12px;
}
.detail-tag-form button,
.detail-tag-suggestions button {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap: 4px;
  min-height: 32px;
  border:1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
}
.detail-tag-form button {
  padding: 0 9px;
  color: var(--accent);
  border-color: color-mix(in oklab, var(--accent) 40%, var(--line-soft));
}
.detail-tag-suggestions {
  display:flex;
  gap: 6px;
  flex-wrap:wrap;
}
.detail-tag-suggestions button {
  min-height: 26px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
}
.media-lib-tabs.compact {
  padding: 12px 18px;
}
.media-lib-tabs.compact > button {
  min-width: 112px;
  justify-content:center;
}
.media-library-command-row {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 14px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper) 76%, transparent);
}
.media-library-command-row > div {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap: 3px;
}
.media-library-command-row strong {
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
}
.media-library-command-row span {
  color: var(--ink-mute);
  font-size: 11px;
}
.media-library-command-row button {
  flex:0 0 auto;
  min-height: 30px;
  display:inline-flex;
  align-items:center;
  gap: 6px;
  padding: 5px 11px;
  border:1px solid color-mix(in oklab, var(--accent) 40%, var(--line-soft));
  border-radius: 999px;
  background: color-mix(in oklab, var(--accent) 13%, var(--paper));
  color: var(--accent);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
  white-space:nowrap;
}
.media-library-command-row button:hover {
  background: color-mix(in oklab, var(--accent) 20%, var(--paper));
}
.image-upload-settings {
  display:grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, .9fr);
  gap: 14px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper-2) 52%, transparent);
}
.setting-block {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap: 8px;
}
.setting-block > span {
  color: var(--ink-mute);
  font-size: 11px;
}
.setting-segment {
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.setting-segment.dynamic {
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
}
.setting-segment.dynamic .inline-tag-form {
  grid-column: span 2;
  min-width: 132px;
}
.setting-segment button,
.upload-tag-row button,
.inline-tag-form button {
  min-height: 30px;
  border:1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
}
.setting-segment button.active,
.upload-tag-row button.active {
  color: var(--ink);
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 14%, var(--paper));
}
.upload-tag-row {
  display:flex;
  align-items:center;
  gap: 6px;
  flex-wrap:wrap;
}
.upload-tag-row button {
  min-height: 28px;
  border-radius: 999px;
  padding: 3px 9px;
  font-size: 11px;
}
.inline-tag-form {
  display:inline-flex;
  align-items:center;
  height: 28px;
  border:1px solid var(--line-soft);
  border-radius: 999px;
  overflow:hidden;
  background: var(--paper);
}
.inline-tag-form input {
  width: 88px;
  height:100%;
  border:none;
  background:transparent;
  color: var(--ink);
  outline:none;
  padding: 0 8px;
  font-family: var(--font-body);
  font-size: 11px;
}
.inline-tag-form button {
  width: 30px;
  height:100%;
  min-height:0;
  border:none;
  border-left:1px solid var(--line-soft);
  border-radius:0;
  padding:0;
  color: var(--accent);
}
.save-asset-modal {
  width: min(560px, calc(100vw - 32px));
  max-height: min(680px, calc(100vh - 40px));
}
.save-asset-body {
  display:flex;
  flex-direction:column;
  gap: 16px;
  padding: 18px;
}
.save-asset-node {
  display:grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 12px;
  align-items:center;
  padding: 12px 14px;
  border:1px solid var(--line-soft);
  border-radius: 10px;
  background: color-mix(in oklab, var(--paper-2) 58%, transparent);
}
.save-asset-node span,
.save-asset-section > span {
  color: var(--ink-mute);
  font-size: 11px;
}
.save-asset-node strong {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color: var(--ink);
  font-size: 14px;
}
.save-asset-node em {
  grid-row: 1 / span 2;
  grid-column: 2;
  padding: 4px 9px;
  border-radius: 999px;
  border:1px solid var(--line-soft);
  color: var(--accent);
  font-style:normal;
  font-size: 11px;
}
.save-asset-section {
  display:flex;
  flex-direction:column;
  gap: 8px;
}
.save-asset-section > .setting-segment {
  grid-template-columns: repeat(2, 1fr);
}
.save-asset-section > .setting-segment.dynamic {
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
}
.image-category-filter,
.asset-taxonomy-filter {
  display:flex;
  align-items:flex-start;
  gap: 8px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--line-soft);
}
.asset-taxonomy-filter {
  flex-direction:column;
  background: color-mix(in oklab, var(--paper) 72%, transparent);
}
.taxonomy-filter-row {
  width:100%;
  display:flex;
  align-items:center;
  gap: 8px;
  overflow-x:auto;
  padding-bottom: 2px;
}
.taxonomy-filter-row > span {
  flex:0 0 auto;
  min-width: 34px;
  color: var(--ink-mute);
  font-size: 11px;
}
.taxonomy-filter-row .taxonomy-add-form {
  flex:0 0 auto;
  height: 30px;
  margin-left: 2px;
}
.taxonomy-filter-row .taxonomy-add-form input {
  width: 96px;
}
.image-category-filter button,
.asset-taxonomy-filter button {
  display:inline-flex;
  align-items:center;
  gap: 6px;
  min-height: 30px;
  padding: 5px 12px;
  border:1px solid var(--line-soft);
  border-radius: 999px;
  background: var(--paper-2);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
  white-space:nowrap;
}
.image-category-filter button.active,
.asset-taxonomy-filter button.active {
  color: var(--ink);
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 14%, var(--paper));
}
.image-category-filter button span,
.asset-taxonomy-filter button span {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-mute);
}
.asset-taxonomy-filter .taxonomy-add-form button {
  width: 30px;
  height:100%;
  min-height:0;
  padding:0;
  border:none;
  border-left:1px solid var(--line-soft);
  border-radius:0;
  background:transparent;
  color: var(--accent);
}
.media-library-layout.grid-only {
  display:block;
  overflow:hidden;
}
.media-grid.tile-grid {
  height:100%;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-auto-rows: max-content;
  padding: 14px 18px 18px;
  align-content:start;
}
.image-tile .thumb {
  aspect-ratio: 4 / 3;
  background:
    linear-gradient(45deg, color-mix(in oklab, var(--paper-2) 80%, #000) 25%, transparent 25%),
    linear-gradient(-45deg, color-mix(in oklab, var(--paper-2) 80%, #000) 25%, transparent 25%),
    var(--paper);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px;
}
.image-tile .thumb img {
  object-fit: contain;
  padding: 4px;
}
.image-tile .meta {
  min-height: 38px;
}
.image-tile .media-card-use {
  top:auto;
  right: 8px;
  bottom: 8px;
}
.media-card-global-actions {
  position:absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  display:flex;
  gap: 6px;
  pointer-events:auto;
}
.media-card-global-actions button {
  flex:1;
  min-width:0;
  min-height: 26px;
  padding: 3px 7px;
  border:1px solid color-mix(in oklab, var(--accent) 38%, transparent);
  border-radius: 999px;
  background: rgba(10,12,14,.76);
  color: var(--accent);
  cursor:pointer;
  font-size: 10px;
  font-family: var(--font-body);
  white-space:nowrap;
}
.media-card-global-actions button:disabled {
  cursor:default;
  color: rgba(255,255,255,.58);
  border-color: rgba(255,255,255,.18);
  background: rgba(10,12,14,.48);
}
.media-global-picker-mask {
  position: fixed;
  inset: 0;
  z-index: 8800;
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 28px;
  background: rgba(0,0,0,.46);
}
.has-window-chrome .media-global-picker-mask{top:38px;bottom:auto;height:calc(100% - 38px)}
.media-global-picker-dialog {
  width: min(940px, calc(100vw - 56px));
  max-height: min(680px, calc(100vh - 72px));
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border:1px solid var(--line);
  border-radius: 14px;
  background: color-mix(in oklab, var(--paper) 94%, transparent);
  box-shadow: 0 28px 90px rgba(0,0,0,.48);
  backdrop-filter: blur(16px);
}
.media-global-picker-dialog header {
  min-height: 58px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 16px;
  padding: 14px 16px;
  border-bottom:1px solid var(--line-soft);
}
.media-global-picker-dialog header > div {
  display:flex;
  align-items:center;
  gap: 8px;
}
.media-global-picker-dialog header > div:first-child {
  min-width:0;
  flex-direction:column;
  align-items:flex-start;
  gap: 3px;
}
.media-global-picker-dialog header span {
  color: var(--ink-mute);
  font-size: 11px;
}
.media-global-picker-dialog header strong {
  color: var(--ink);
  font-size: 15px;
}
.media-global-picker-dialog header button {
  min-height: 30px;
  border:1px solid var(--line-soft);
  border-radius: 999px;
  background: var(--paper-2);
  color: var(--ink-soft);
  cursor:pointer;
  font-family: var(--font-body);
  font-size: 12px;
}
.media-global-picker-dialog header button.ghost {
  padding: 4px 11px;
}
.media-global-picker-dialog header button.close {
  width: 32px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0;
}
.media-global-picker-dialog > p {
  margin:0;
  padding: 10px 16px;
  border-bottom:1px solid var(--line-soft);
  color: var(--ink-mute);
  font-size: 12px;
}
.media-global-picker-grid {
  flex:1;
  min-height:0;
  overflow:auto;
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-auto-rows: max-content;
  gap: 12px;
  padding: 14px 16px 18px;
  align-content:start;
}
.media-global-picker-grid .sb-empty {
  grid-column: 1 / -1;
  min-height: 180px;
}
.media-eye-btn {
  position:absolute;
  left:50%;
  top:50%;
  transform: translate(-50%, -50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border:1px solid rgba(255,255,255,.36);
  background: rgba(10,12,14,.68);
  color: #fff;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  opacity:0;
  transition: opacity .14s ease, transform .14s ease;
}
.image-tile:hover .media-eye-btn {
  opacity:1;
}
.media-eye-btn:hover {
  transform: translate(-50%, -50%) scale(1.06);
}
.media-delete-btn {
  position:absolute;
  right: 8px;
  top: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border:1px solid rgba(255,255,255,.28);
  background: rgba(10,12,14,.7);
  color: #fff;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  opacity:0;
  transition: opacity .14s ease, background .14s ease, color .14s ease;
}
.image-tile:hover .media-delete-btn {
  opacity:1;
}
.media-delete-btn:hover {
  background: color-mix(in oklab, var(--accent-2, #FF6B6B) 82%, #111);
  color:#fff;
}
.media-preview-mask {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(0,0,0,.58);
  padding: 16px;
}
.has-window-chrome .media-preview-mask{top:38px;bottom:auto;height:calc(100% - 38px)}
.media-preview-dialog {
  width: calc(100vw - 32px);
  height: calc(100vh - 32px);
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  display:flex;
  flex-direction:column;
  border:1px solid var(--line);
  border-radius: 12px;
  background: var(--paper);
  box-shadow: var(--shadow-float);
  overflow:hidden;
}
.has-window-chrome .media-preview-dialog{height:calc(100vh - 70px);max-height:calc(100vh - 70px)}
.media-preview-dialog header {
  height: 44px;
  display:flex;
  align-items:center;
  gap: 12px;
  padding: 0 12px 0 16px;
  border-bottom:1px solid var(--line-soft);
}
.media-preview-dialog header strong {
  min-width:0;
  flex:1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color: var(--ink);
  font-size: 13px;
}
.media-preview-dialog header button {
  width: 28px;
  height: 28px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid var(--line-soft);
  border-radius: 8px;
  background: var(--paper-2);
  color: var(--ink-soft);
  cursor:pointer;
}
.media-preview-stage {
  flex:1;
  min-height:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background: #08090b;
  padding: 10px;
}
.media-preview-stage img {
  max-width:100%;
  max-height:100%;
  width:auto;
  height:auto;
  object-fit:contain;
}
/* Subject create dialog */
.sb-create {
  display: flex; flex-direction: column; gap: 16px;
  padding: 20px 22px;
}
.sb-create .row { display: flex; gap: 16px; }
.sb-create .col { flex: 1; }
.sb-create .uploader {
  width: 100%; aspect-ratio: 1.2;
  background: var(--paper-2);
  border: 1.5px dashed var(--line);
  border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--ink-mute); cursor: pointer; gap: 6px;
}
.sb-create .uploader:hover { border-color: var(--accent); color: var(--accent); }
.sb-create .uploader .h { font-size: 13px; color: var(--ink-soft); }
.sb-create .uploader .s { font-size: 11px; color: var(--ink-mute); }

/* ─── Recovered from legacy modals3.jsx (MemberModal .mb-*) ─── */
/* ── MemberModal ── */
.mb-modal { width: 1180px; max-width: calc(100% - 60px); max-height: 86vh; }
.mb-modal .body { padding: 16px 22px 22px; }
.mb-banner {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; margin-bottom: 18px;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(255,107,107,0.18) 0%, rgba(255,138,91,0.18) 100%);
  border: 1px solid color-mix(in oklab, var(--accent-2, #FF6B6B) 30%, transparent);
  font-size: 12px; color: var(--ink);
}
.mb-banner .countdown {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--font-mono);
}
.mb-banner .countdown span {
  background: var(--ink); color: var(--paper);
  padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 11px;
}
.mb-tabs {
  display: inline-flex; padding: 4px;
  background: var(--paper-2); border-radius: 10px;
  margin-bottom: 16px;
}
.mb-tab {
  padding: 7px 18px; border-radius: 7px; border: none;
  background: transparent; cursor: pointer;
  font-size: 13px; color: var(--ink-soft); font-family: var(--font-body);
}
.mb-tab.active { background: var(--ink); color: var(--paper); font-weight: 600; }
.mb-cards {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.mb-card {
  position: relative;
  background: var(--paper-2);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 22px 20px 18px;
}
.mb-card.featured {
  background: linear-gradient(160deg, color-mix(in oklab, var(--accent) 12%, var(--paper-2)) 0%, var(--paper-2) 100%);
  border-color: var(--accent);
}
.mb-card.gold {
  background: linear-gradient(160deg, rgba(232,177,74,0.18) 0%, var(--paper-2) 100%);
  border-color: #E8B14A;
}
.mb-card .ribbon {
  position: absolute; top: -10px; right: 16px;
  padding: 3px 10px; border-radius: 4px;
  background: var(--accent-2, #FF6B6B); color: #fff;
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  letter-spacing: .04em;
}
.mb-card.gold .ribbon { background: #E8B14A; color: #fff; }
.mb-card h3 {
  margin: 0 0 8px; font-size: 15px; color: var(--ink); font-weight: 700;
}
.mb-card .price {
  display: flex; align-items: baseline; gap: 8px; margin: 6px 0 4px;
}
.mb-card .price .num {
  font-family: var(--font-display); font-size: 32px; font-weight: 700;
  color: var(--ink);
}
.mb-card .price .old {
  font-family: var(--font-mono); font-size: 12px;
  color: var(--ink-mute); text-decoration: line-through;
}
.mb-card .unit { font-size: 11px; color: var(--ink-mute); margin-bottom: 12px; }
.mb-card .buy {
  width: 100%; padding: 9px; border-radius: 8px;
  background: var(--ink); color: var(--paper);
  border: none; font-weight: 600; font-size: 13px; cursor: pointer;
  margin-bottom: 12px;
}
.mb-card.featured .buy { background: var(--accent); }
.mb-card.gold .buy { background: linear-gradient(90deg, #E8B14A 0%, #C68F2C 100%); }
.mb-card ul {
  list-style: none; padding: 0; margin: 12px 0 0;
  font-size: 11px; color: var(--ink-soft); line-height: 1.7;
}
.mb-card ul li {
  display: flex; align-items: flex-start; gap: 6px; padding: 3px 0;
}
.mb-card ul li svg { color: var(--accent); flex: 0 0 auto; margin-top: 2px; }

/* Credit pack section */
.mb-credits {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  margin-top: 22px;
}
.mb-credit-pack {
  padding: 14px;
  background: var(--paper-2);
  border: 1px solid var(--line-soft); border-radius: 10px;
  text-align: center; cursor: pointer;
}
.mb-credit-pack:hover { border-color: var(--accent); }
.mb-credit-pack .amt {
  font-family: var(--font-display); font-size: 22px; font-weight: 700;
  color: var(--ink); margin-bottom: 4px;
}
.mb-credit-pack .cost {
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-mute);
}


/* ─── Recovered from legacy modals3.jsx (AccountModal .ac-*) ─── */
/* ── AccountModal ── */
.ac-modal { width: 920px; max-width: calc(100% - 60px); max-height: 80vh; }
.ac-modal .body { display: grid; grid-template-columns: 220px 1fr; min-height: 480px; }
.ac-side {
  background: var(--paper-2); border-right: 1px solid var(--line-soft);
  padding: 12px; overflow-y: auto;
}
.ac-side .item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px;
  font-size: 13px; color: var(--ink-soft); cursor: pointer;
}
.ac-side .item:hover { background: var(--paper); color: var(--ink); }
.ac-side .item.active {
  background: var(--ink); color: var(--paper); font-weight: 600;
}
.ac-pane { padding: 22px; overflow-y: auto; }
.ac-pane h3 {
  margin: 0 0 16px; font-size: 14px; color: var(--ink); font-weight: 600;
}
.ac-profile {
  display: flex; align-items: center; gap: 14px; margin-bottom: 22px;
}
.ac-profile .avi {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #4FD4FE 0%, #7A5BFF 100%);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 24px;
}
.ac-profile .info .name {
  font-size: 16px; color: var(--ink); font-weight: 600; margin-bottom: 4px;
}
.ac-profile .info .id {
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-mute);
}
.ac-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin-bottom: 22px;
}
.ac-stat {
  padding: 16px; border-radius: 10px;
  background: var(--paper-2); border: 1px solid var(--line-soft);
}
.ac-stat .l { font-size: 11px; color: var(--ink-mute); margin-bottom: 6px; }
.ac-stat .v {
  font-family: var(--font-display); font-size: 22px; font-weight: 700;
  color: var(--ink);
}
.ac-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0; border-bottom: 1px solid var(--line-soft);
}
.ac-row:last-child { border: none; }
.ac-row .key { font-size: 13px; color: var(--ink); }
.ac-row .val {
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; color: var(--ink-soft);
}


/* ─── Recovered from legacy modals3.jsx (ShareModal .sh-modal/-tabs/-cover/-link/-social*) ─── */
.sh-modal { width: 580px; max-width: calc(100% - 60px); }
.sh-modal .body { padding: 20px 22px; }
.sh-tabs {
  display: inline-flex; padding: 3px;
  background: var(--paper-2); border-radius: 8px;
  margin-bottom: 18px;
}
.sh-tab {
  padding: 6px 16px; border-radius: 6px; border: none;
  background: transparent; cursor: pointer;
  font-size: 13px; color: var(--ink-soft);
}
.sh-tab.active { background: var(--ink); color: var(--paper); font-weight: 600; }
.sh-cover {
  width: 100%; aspect-ratio: 16/9; border-radius: 10px;
  background-size: cover; background-position: center;
  margin-bottom: 16px;
}
.sh-link {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: var(--paper-2);
  border: 1px solid var(--line-soft); border-radius: 8px;
  margin-bottom: 12px; font-family: var(--font-mono); font-size: 12px;
  color: var(--ink-soft);
}
.sh-link .url { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.sh-link button {
  padding: 4px 12px; border-radius: 5px; border: none;
  background: var(--ink); color: var(--paper);
  cursor: pointer;
}
.sh-perm .d { font-size: 10px; color: var(--ink-mute); }
.sh-socials { display: flex; gap: 12px; justify-content: center; margin-top: 14px; }
.sh-social {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--paper-2); border: 1px solid var(--line-soft);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--ink-soft);
}
.sh-social:hover { border-color: var(--accent); color: var(--accent); }

/* ─── Recovered from legacy modals3.jsx (MessageModal .ms-*) ─── */
/* ── MessageModal ── */
.ms-modal { width: 560px; max-width: calc(100% - 60px); max-height: 80vh; }
.ms-tabs {
  display: flex; gap: 12px; padding: 14px 22px 0;
  border-bottom: 1px solid var(--line-soft);
}
.ms-tab {
  padding: 8px 0; border: none; background: transparent;
  font-size: 13px; color: var(--ink-soft); cursor: pointer;
  position: relative; font-family: var(--font-body);
}
.ms-tab.active { color: var(--ink); font-weight: 600; }
.ms-tab.active::after {
  content: ""; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 2px; background: var(--accent);
}
.ms-tab .dot {
  display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: var(--accent-2, #FF6B6B);
  margin-left: 4px;
}
.ms-list {
  padding: 8px 0; max-height: 480px; overflow-y: auto;
}
.ms-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 22px;
  border-bottom: 1px solid var(--line-soft);
}
.ms-item:hover { background: var(--paper-2); cursor: pointer; }
.ms-item .icic {
  width: 32px; height: 32px; border-radius: 50%;
  background: color-mix(in oklab, var(--accent) 14%, var(--paper-2));
  color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
}
.ms-item.like .icic { background: color-mix(in oklab, var(--accent-2, #FF6B6B) 14%, var(--paper-2)); color: var(--accent-2, #FF6B6B); }
.ms-item.system .icic { background: var(--paper-2); color: var(--ink-mute); }
.ms-item .content { flex: 1; }
.ms-item .content .hdr {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 4px;
}
.ms-item .content .nm { font-size: 13px; color: var(--ink); font-weight: 600; }
.ms-item .content .tm { font-family: var(--font-mono); font-size: 10px; color: var(--ink-mute); }
.ms-item .content .desc { font-size: 12px; color: var(--ink-soft); line-height: 1.5; }
.ms-item .new::after {
  content: ""; display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: var(--accent-2, #FF6B6B);
  margin-left: 6px; vertical-align: middle;
}


/* ─── Recovered from legacy modals3.jsx (ProjectsModal .pj-*) ─── */
/* ── ProjectsModal ── */
.pj-modal { width: 1100px; height: 720px; max-width: calc(100% - 60px); max-height: calc(100% - 60px); }
.pj-modal .body { display: flex; flex-direction: column; }
.pj-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--line-soft);
}
.pj-bar .new-pj {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px;
  background: var(--accent); color: var(--paper);
  border: none; font-weight: 600; font-size: 13px; cursor: pointer;
}
.pj-grid {
  flex: 1; overflow-y: auto; padding: 18px 22px;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.pj-card {
  background: var(--paper-2);
  border: 1px solid var(--line-soft); border-radius: 12px;
  cursor: pointer; overflow: hidden;
  transition: transform .12s, border-color .12s;
}
.pj-card:hover { transform: translateY(-3px); border-color: var(--accent); }
.pj-card .preview {
  aspect-ratio: 4/3; background-size: cover; background-position: center;
  background-color: var(--paper);
  position: relative;
}
.pj-card .preview .star {
  position: absolute; top: 8px; right: 8px;
  color: #E8B14A;
}
.pj-card .meta { padding: 10px 12px; }
.pj-card .meta .n {
  font-size: 13px; color: var(--ink); margin-bottom: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pj-card .meta .t {
  font-family: var(--font-mono); font-size: 10px; color: var(--ink-mute);
  display: flex; justify-content: space-between;
}


/* ─── Recovered from legacy modals3.jsx (HistoryModal .hs-*) ─── */
/* ── HistoryModal ── */
.hs-modal { width: 1240px; height: 800px; max-width: calc(100% - 60px); max-height: calc(100% - 60px); }
.hs-modal .body { display: flex; flex-direction: column; }
.hs-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--line-soft);
}
.hs-tabs {
  display: inline-flex; padding: 3px;
  background: var(--paper-2); border-radius: 8px;
}
.hs-tabs button {
  padding: 6px 14px; border-radius: 6px; border: none;
  background: transparent; cursor: pointer;
  font-size: 12px; color: var(--ink-soft);
}
.hs-tabs button.active { background: var(--ink); color: var(--paper); font-weight: 600; }
.hs-grid {
  flex: 1; overflow-y: auto; padding: 16px 22px;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  grid-auto-rows: 240px;
  align-items: stretch;
  gap: 14px;
}
.hs-item {
  appearance: none;
  padding: 0;
  text-align: left;
  position: relative; cursor: pointer;
  display: block;
  width: 100%;
  height: 240px;
  min-height: 240px;
  border-radius: 10px; overflow: hidden;
  background-size: cover; background-position: center;
  background-color: var(--paper-2); border: 1px solid var(--line-soft);
  color: var(--ink);
}
.hs-item:hover { border-color: var(--accent); }
.hs-item.selected { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent) 30%, transparent); }
.hs-item .checkbox {
  position: absolute; top: 8px; left: 8px;
  width: 20px; height: 20px; border-radius: 4px;
  background: rgba(10,12,14,0.5);
  border: 1.5px solid #fff;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  z-index: 3;
}
.hs-item.selected .checkbox { background: var(--accent); border-color: var(--accent); }
.hs-item .info {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 14px 8px 6px;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-mono); font-size: 10px;
  z-index: 3;
}
.hs-item .kind-pill {
  position: absolute; top: 8px; right: 8px;
  padding: 2px 6px; border-radius: 4px;
  background: rgba(10,12,14,0.6);
  color: #fff; font-family: var(--font-mono); font-size: 9px;
  z-index: 3;
}
.hs-item.video .kind-pill { background: var(--accent); }
.hs-media-wrap {
  position: absolute; inset: 0;
  min-height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #050608;
}
.hs-media {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.hs-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  width: 100%; height: 100%;
  color: var(--ink-mute);
  background:
    linear-gradient(135deg, color-mix(in oklab, var(--paper-2) 88%, black), color-mix(in oklab, var(--paper) 84%, black));
}
.hs-placeholder span {
  font-family: var(--font-mono);
  font-size: 10px;
}
.hs-preview-eye {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.62);
  background: rgba(6,8,12,.62);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 12px 30px -18px rgba(0,0,0,.9);
  backdrop-filter: blur(8px);
  transition: transform .14s ease, background .14s ease, border-color .14s ease;
}
.hs-preview-eye:hover {
  transform: translate(-50%, -50%) scale(1.06);
  background: color-mix(in oklab, var(--accent) 34%, rgba(6,8,12,.68));
  border-color: rgba(255,255,255,.82);
}
.hs-progress {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 3px; background: rgba(255,255,255,0.12);
  z-index: 4;
}
.hs-progress i {
  display: block; height: 100%;
  background: var(--accent);
}
.hs-error {
  position: absolute; left: 8px; right: 8px; top: 38px;
  z-index: 4;
  padding: 5px 7px;
  border-radius: 6px;
  background: rgba(120, 20, 20, .76);
  color: #fff;
  font-size: 10px;
  line-height: 1.35;
}
.hs-item.failed { border-color: color-mix(in oklab, var(--accent-2, #FF6B6B) 45%, var(--line)); }
.hs-inline-error {
  color: var(--accent-2, #FF6B6B);
  font-size: 11px;
}
.hs-preview-lightbox {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(0,0,0,.74);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 34px;
}
.hs-preview-stage {
  width: min(1040px, calc(100vw - 88px));
  max-height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.16);
  background: #050608;
  box-shadow: 0 34px 100px -30px rgba(0,0,0,.86);
}
.hs-preview-stage-head {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  background: rgba(8,10,14,.92);
  border-bottom: 1px solid rgba(255,255,255,.1);
}
.hs-preview-stage-head div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hs-preview-stage-head strong {
  color: #fff;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hs-preview-stage-head span {
  color: rgba(255,255,255,.58);
  font-family: var(--font-mono);
  font-size: 10px;
}
.hs-preview-stage-head button {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.hs-preview-stage-body {
  min-height: 0;
  max-height: calc(100vh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
.hs-preview-stage-body img,
.hs-preview-stage-body video {
  max-width: 100%;
  max-height: calc(100vh - 150px);
  object-fit: contain;
  display: block;
}


/* ─── Recovered from legacy modals3.jsx (ComplianceModal .cp-*) ─── */
/* ── ComplianceModal ── */
.cp-modal { width: 920px; max-width: calc(100% - 60px); max-height: 86vh; }
.cp-modal .body { padding: 20px 22px; display: flex; flex-direction: column; gap: 18px; }
.cp-banner {
  padding: 16px;
  background: linear-gradient(90deg, color-mix(in oklab, var(--accent) 14%, var(--paper-2)) 0%, var(--paper-2) 100%);
  border: 1px solid color-mix(in oklab, var(--accent) 30%, transparent);
  border-radius: 10px;
  display: flex; align-items: center; gap: 14px;
}
.cp-banner .ic {
  width: 42px; height: 42px; border-radius: 10px;
  background: color-mix(in oklab, var(--accent) 14%, var(--paper));
  color: var(--accent);
  display: flex; align-items: center; justify-content: center;
}
.cp-banner h4 { margin: 0 0 4px; font-size: 14px; color: var(--ink); }
.cp-banner p { margin: 0; font-size: 11px; color: var(--ink-mute); line-height: 1.5; }
.cp-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.cp-item {
  position: relative;
  border-radius: 8px; overflow: hidden;
  background-size: cover; background-position: center;
  aspect-ratio: 1/1; border: 1px solid var(--line-soft);
  cursor: pointer;
}
.cp-item .badge {
  position: absolute; top: 6px; right: 6px;
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 6px; border-radius: 999px;
  background: rgba(10,12,14,0.7); color: #fff;
  font-family: var(--font-mono); font-size: 9px;
}
.cp-item .badge.ok { background: var(--accent); color: var(--paper); }
.cp-item .badge.fail { background: var(--accent-2, #FF6B6B); color: #fff; }
.cp-item .lbl {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 12px 6px 6px;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
  color: #fff; font-family: var(--font-mono); font-size: 9px;
}


/* ─── Recovered from legacy modals3.jsx (RealPersonModal .rp-*) ─── */
/* ── RealPersonModal ── */
.rp-modal { width: 580px; max-width: calc(100% - 60px); }
.rp-modal .body { padding: 22px; text-align: center; }
.rp-modal .qrbox {
  width: 220px; height: 220px; margin: 18px auto;
  background: var(--paper-2); border: 1px solid var(--line);
  border-radius: 14px; padding: 14px;
  position: relative;
}
.rp-qr-svg {
  width: 100%; height: 100%;
}
.rp-qr-svg rect { fill: var(--ink); }
.rp-qr-svg .corner { fill: none; stroke: var(--ink); stroke-width: 5; }
.rp-modal h3 { margin: 0 0 8px; font-size: 16px; color: var(--ink); }
.rp-modal p { margin: 4px 0; font-size: 12px; color: var(--ink-soft); line-height: 1.6; }
.rp-modal .steps {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 0; margin-top: 8px;
  font-size: 11px; color: var(--ink-mute);
}
.rp-modal .step {
  display: inline-flex; align-items: center; gap: 6px;
}
.rp-modal .step .num {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--paper-2); border: 1px solid var(--line);
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 10px; color: var(--ink-mute);
}
.rp-modal .step.active .num { background: var(--accent); color: var(--paper); border-color: var(--accent); }
.rp-modal .step .arr { color: var(--line); }
.rp-modal .timer {
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-mute);
  margin-top: 6px;
}


/* ─── Recovered from legacy modals2.jsx (TimelineModal .tl-*) ─── */
/* ── Timeline (video compose) ───────────────── */
.tl-modal .tm-stage { background: #0A0B0D; display:flex; flex-direction: column; }
.tl-preview {
  flex:1; min-height:0; position:relative; display:flex; align-items:center; justify-content:center;
  background: #000;
}
.tl-preview video, .tl-preview img {
  max-width: 88%; max-height: 88%; border-radius: 6px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.tl-preview .fake-video {
  width: 720px; height: 400px; border-radius: 6px;
  background-size: cover; background-position: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.tl-preview .play-overlay {
  position:absolute; inset:0;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
}
.tl-preview .play-overlay .disc {
  width:64px; height:64px; border-radius:50%;
  background: rgba(0,0,0,0.5); border: 1.5px solid rgba(255,255,255,0.6);
  display:flex; align-items:center; justify-content:center;
  color:#fff;
}
.tl-controls {
  display:flex; align-items:center; gap: 12px;
  padding: 8px 16px;
  color: var(--ink-soft); font-family: var(--font-mono); font-size: 11px;
  border-top:1px solid var(--line-soft);
}
.tl-controls .play { width:32px; height:32px; border-radius:50%; background: var(--accent); color: var(--paper); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.tl-controls .params-btn {
  margin-left:auto; display:inline-flex; align-items:center; gap:6px;
  padding: 5px 10px; border-radius: 6px;
  background: var(--paper-2); border:1px solid var(--line-soft);
  color: var(--ink); font-size: 11px; cursor:pointer;
}
.tl-controls .synth {
  background: var(--accent); color: var(--paper);
  padding: 6px 14px; border-radius: 6px; border:none;
  font-weight:700; font-size: 12px; cursor:pointer;
  display:inline-flex; align-items:center; gap:6px;
  position:relative;
}
.tl-controls .synth .free-pill {
  position:absolute; top:-10px; right:-14px;
  background: color-mix(in oklab, var(--accent) 25%, var(--paper));
  color: var(--accent); font-family: var(--font-mono);
  font-size: 9px; padding: 1px 5px; border-radius: 3px;
  border: 1px solid color-mix(in oklab, var(--accent) 40%, transparent);
}

.tl-tracks {
  height: 200px; background: #0F1012; position:relative;
  border-top: 1px solid var(--line-soft);
  overflow:hidden;
}
.tl-ruler {
  height: 22px; display:flex; align-items:center;
  padding: 0 6px;
  background: color-mix(in oklab, var(--paper) 92%, transparent);
  border-bottom:1px solid var(--line-soft);
  color: var(--ink-mute); font-family: var(--font-mono); font-size: 10px;
  gap: 60px; overflow: hidden;
}
.tl-playhead {
  position:absolute; top: 0; bottom: 0; width: 2px;
  background: var(--accent); z-index: 5; pointer-events:none;
}
.tl-track {
  height: 60px; display:flex; align-items:center; gap: 4px;
  padding: 4px 6px;
  border-bottom: 1px dashed var(--line-soft);
  position:relative;
}
.tl-track .label {
  position:absolute; left: 8px; top: 4px;
  font-family: var(--font-mono); font-size: 9px;
  color: var(--ink-mute); letter-spacing: .08em;
}
.tl-clip {
  height: 44px; border-radius: 3px;
  background: var(--paper-2); border: 1px solid var(--accent);
  overflow: hidden; flex: 0 0 auto; position:relative;
  margin-top: 16px;
}
.tl-clip img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.tl-clip .clip-name {
  position:absolute; left: 4px; top: 3px;
  font-family: var(--font-mono); font-size: 9px;
  color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}
.tl-clip.audio {
  background: linear-gradient(to bottom, rgba(79,212,254,0.05) 0%, rgba(79,212,254,0.2) 100%);
  display:flex; align-items:center; padding: 0 4px; gap: 1px;
}
.tl-clip.audio span {
  flex: 1 1 auto; background: var(--accent); opacity: .6; min-width: 1px;
}

/* params popover */
.tl-params-pop {
  position: absolute; right: 120px; bottom: 54px;
  width: 280px; padding: 16px;
  background: color-mix(in oklab, var(--paper) 94%, transparent);
  border: 1px solid var(--line);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 16px 50px -12px rgba(0,0,0,0.6);
  font-family: var(--font-body); font-size: 12px;
}
.tl-params-pop h4 { margin:0 0 12px; font-size: 12px; color: var(--ink); font-weight:600; }
.tl-params-pop .row {
  display:flex; align-items:center; justify-content:space-between;
  padding: 8px 0; border-bottom:1px solid var(--line-soft);
}
.tl-params-pop .row:last-child { border-bottom:none; }
.tl-params-pop label { color: var(--ink-soft); font-size: 12px; }
.tl-params-pop .val {
  font-family: var(--font-mono); font-size: 11px; color: var(--ink);
  display:inline-flex; align-items:center; gap: 4px;
}
.tl-params-pop select {
  background: var(--paper-2); border:1px solid var(--line);
  border-radius: 6px; padding: 3px 8px; color: var(--ink);
  font-family: var(--font-mono); font-size: 11px;
}


/* ─── Recovered from legacy modals2.jsx (UpscalePopover .upscale-pop) ─── */
/* ── Upscale popover (floats anywhere; used on video/image node) ── */
.upscale-pop {
  width: 280px; padding: 16px;
  background: color-mix(in oklab, var(--paper) 95%, transparent);
  border: 1px solid var(--line);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px -12px rgba(0,0,0,0.6);
  font-family: var(--font-body); font-size: 12px;
}
.upscale-pop h3 { margin: 0 0 14px; font-size: 13px; color: var(--ink); font-weight: 600; }
.upscale-pop .row { display:flex; align-items:center; gap: 12px; padding: 6px 0; }
.upscale-pop .row label { width: 56px; color: var(--ink-mute); font-size: 11px; }
.upscale-pop .seg {
  display:flex; flex: 1; background: var(--paper-2);
  border: 1px solid var(--line-soft); border-radius: 6px; padding: 2px;
}
.upscale-pop .seg button {
  flex:1; padding: 4px 8px; border:none; background: transparent;
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-soft);
  border-radius: 4px; cursor:pointer;
}
.upscale-pop .seg button.active {
  background: var(--ink); color: var(--paper);
}
.upscale-pop select {
  flex: 1; background: var(--paper-2); border: 1px solid var(--line);
  border-radius: 6px; padding: 5px 10px; color: var(--ink); font-size: 12px;
}
.upscale-pop .footer {
  display:flex; align-items:center; justify-content:space-between;
  margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line-soft);
}
.upscale-pop .credit {
  font-family: var(--font-mono); font-size: 11px;
  color: var(--ink-mute);
}
.upscale-pop .go {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--accent); color: var(--paper); border:none;
  display:flex; align-items:center; justify-content:center; cursor:pointer;
}


/* ─── Recovered from legacy modals2.jsx (MarkupModal .mk-*) ─── */
/* ── Markup modal (brush + box annotation) ── */
.mk-stage {
  display: flex;
}
.mk-canvas {
  flex:1; position:relative; overflow: hidden;
  min-height: 0;
  display:flex; align-items:center; justify-content:center;
  background: #000;
}
.mk-canvas .bg {
  max-width: 100%; max-height: 100%; object-fit: contain;
  display: block; border-radius: 6px;
}
.mk-empty {
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap: 8px;
  min-width: 260px;
  min-height: 180px;
  padding: 28px;
  border:1px dashed var(--line-soft);
  border-radius: 12px;
  background: color-mix(in oklab, var(--paper) 78%, transparent);
  color: var(--ink-mute);
  text-align:center;
}
.mk-empty strong {
  color: var(--ink-soft);
  font-size: 14px;
}
.mk-empty span {
  font-size: 12px;
}
.mk-svg {
  position:absolute; inset:0; pointer-events: none;
  touch-action: none;
  user-select: none;
}
.mk-svg.interactive { pointer-events: all; cursor: crosshair; }
.mk-svg .mk-hit { pointer-events: all; }
.mk-tools {
  position: absolute; left: 50%; transform: translateX(-50%); top: 16px;
  display: inline-flex; align-items: center; gap: 2px;
  padding: 4px 6px;
  background: rgba(10, 12, 14, 0.85);
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  z-index: 3;
  backdrop-filter: blur(6px);
}
.mk-tools button {
  width: 30px; height: 30px; border-radius: 50%;
  border: none; background: transparent;
  color: var(--ink-soft); cursor: pointer;
  display:flex; align-items:center; justify-content:center;
}
.mk-tools button.active { background: var(--accent); color: var(--paper); }
.mk-prompt {
  position: absolute; left: 50%; bottom: 20px;
  transform: translateX(-50%);
  width: 70%;
  background: rgba(10, 12, 14, 0.85);
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: 10px 14px;
  display:flex; align-items:center; gap: 10px;
  backdrop-filter: blur(8px);
}
.mk-prompt input {
  flex: 1; border: none; background: transparent;
  color: var(--ink); font-family: var(--font-body); font-size: 13px;
  outline: none;
}
.mk-prompt input::placeholder { color: var(--ink-mute); }
.mk-status {
  max-width: 260px;
  color: var(--accent-2, #FF6B6B);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mk-prompt button {
  padding: 6px 14px; background: var(--accent); color: var(--paper);
  border:none; border-radius: 8px; font-weight:700;
  cursor:pointer; display:inline-flex; align-items:center; gap: 6px;
}
.mk-prompt button:disabled {
  opacity: .62;
  cursor: wait;
}


/* ─── Recovered from legacy modals2.jsx (BulkActionBar .bulk-bar) ─── */
/* ── Multi-select bulk action bar (漫创AI top floating bar) ── */
.bulk-bar {
  position: absolute; left: 50%; top: 76px; transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 10px;
  background: color-mix(in oklab, var(--paper) 88%, transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  border-radius: 999px;
  box-shadow: 0 10px 30px -6px rgba(0,0,0,0.4);
  z-index: 55; font-family: var(--font-body);
}
.bulk-bar button {
  display:inline-flex; align-items:center; gap: 6px;
  padding: 5px 12px;
  background: transparent; border:none; border-radius: 6px;
  color: var(--ink); font-size: 12px; cursor:pointer;
}
.bulk-bar button:hover { background: color-mix(in oklab, var(--ink) 10%, transparent); }
.bulk-bar button:disabled {
  opacity: .42;
  cursor: default;
}
.bulk-bar button:disabled:hover { background: transparent; }
.bulk-bar .count {
  font-family: var(--font-mono); font-size: 10px; color: var(--ink-mute);
  padding-right: 6px; border-right: 1px solid var(--line-soft);
  margin-right: 2px;
}


/* ─── Recovered from legacy modals4.jsx (FocusEditModal .fe-*) ─── */
/* ── Focus edit (extract elements) ── */
.fe-modal { width: 1280px; height: 800px; max-width: calc(100% - 60px); max-height: calc(100% - 60px); }
.fe-modal .body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  min-height: 0;
  overflow: hidden;
}
.fe-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #000;
}
.fe-stage {
  flex: 1 1 auto;
  min-height: 0;
  position: relative; background: #000;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.fe-image-layer {
  position: relative;
  display: inline-flex;
  max-width: 100%;
  max-height: 100%;
}
.fe-image-layer img {
  display: block;
  max-width: 100%; max-height: 100%; object-fit: contain;
  user-select: none; -webkit-user-drag: none;
}
.fe-region {
  position: absolute;
  min-width: 34px;
  min-height: 28px;
  pointer-events: none;
  overflow: visible;
  z-index: 2;
}
.fe-region.previewing {
  z-index: 6;
}
.fe-region-frame {
  position: absolute;
  inset: 0;
  border: 1px solid color-mix(in oklab, var(--accent) 62%, transparent);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.06), transparent),
    color-mix(in oklab, var(--accent) 10%, transparent);
  border-radius: 10px 10px 10px 3px;
  opacity: 0;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.06),
    0 0 0 1px rgba(0,0,0,0.18);
  transition: opacity .14s ease, border-color .14s ease, background .14s ease, box-shadow .14s ease;
}
.fe-region.previewing .fe-region-frame {
  opacity: 1;
  border-color: var(--accent);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.09), transparent),
    color-mix(in oklab, var(--accent) 20%, transparent);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.11),
    0 0 0 2px color-mix(in oklab, var(--accent) 18%, transparent),
    0 12px 24px rgba(0,0,0,0.22);
}
.fe-region-label {
  position: absolute;
  left: 7px;
  top: 7px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: min(190px, calc(100vw - 64px));
  padding: 4px 7px;
  border-radius: 8px 8px 8px 2px;
  border: 1px solid color-mix(in oklab, var(--accent) 42%, rgba(255,255,255,0.16));
  background: rgba(8, 12, 16, 0.78);
  box-shadow: 0 8px 18px rgba(0,0,0,0.24);
  color: var(--paper);
  cursor: pointer;
  font-size: 10px;
  line-height: 1;
  pointer-events: auto;
  white-space: nowrap;
  outline: none;
  z-index: 1;
  transition: border-color .14s ease, background .14s ease, box-shadow .14s ease;
}
.fe-region-label::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 8px;
  height: 8px;
  background: rgba(8, 12, 16, 0.78);
  border-left: 1px solid color-mix(in oklab, var(--accent) 42%, rgba(255,255,255,0.16));
  border-bottom: 1px solid color-mix(in oklab, var(--accent) 42%, rgba(255,255,255,0.16));
  transform: skewY(-38deg);
  transform-origin: top left;
}
.fe-region-token {
  flex: 0 0 auto;
  color: var(--accent);
  font-family: var(--font-mono);
  font-weight: 700;
}
.fe-region-name {
  min-width: 0;
  max-width: 122px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(255,255,255,0.82);
  display: none;
}
.fe-region.previewing .fe-region-name {
  display: inline-block;
}
.fe-region.previewing .fe-region-label,
.fe-region.picked .fe-region-label {
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 24%, rgba(8, 12, 16, 0.88));
}
.fe-region-label:focus-visible {
  box-shadow:
    0 8px 18px rgba(0,0,0,0.24),
    0 0 0 2px color-mix(in oklab, var(--accent) 34%, transparent);
}
.fe-command-panel {
  flex: 0 0 128px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 18px 16px;
  border-top: 1px solid var(--line-soft);
  background: color-mix(in oklab, var(--paper) 88%, #000);
}
.fe-command-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.fe-command-head h3 {
  margin: 0;
  font-size: 13px;
  color: var(--ink);
  font-weight: 600;
}
.fe-command-head span {
  color: var(--ink-mute);
  font-size: 11px;
}
.fe-side {
  min-height: 0;
  background: var(--paper-2);
  border-left: 1px solid var(--line-soft);
  padding: 18px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 16px;
}
.fe-side h3 {
  margin: 0 0 10px; font-size: 13px;
  color: var(--ink); font-weight: 600;
}
.fe-model-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.fe-model-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fe-model-field span {
  font-size: 11px;
  color: var(--ink-mute);
}
.fe-model-field select {
  width: 100%;
  min-width: 0;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--ink);
  padding: 0 10px;
  font-family: var(--font-body);
  font-size: 12px;
  outline: none;
}
.fe-model-field select:focus {
  border-color: var(--accent);
}
.fe-model-field select:disabled {
  opacity: .56;
  cursor: not-allowed;
}
.fe-tag-list { display: flex; gap: 6px; flex-wrap: wrap; }
.fe-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px; border-radius: 999px;
  background: var(--paper); border: 1px solid var(--line);
  font-size: 12px; color: var(--ink-soft); cursor: pointer;
  font-family: var(--font-body);
}
.fe-tag.active {
  background: color-mix(in oklab, var(--accent) 18%, var(--paper));
  border-color: var(--accent);
  color: var(--accent);
}
.fe-tag .x { color: var(--ink-mute); cursor: pointer; }
.fe-tag .x:hover { color: var(--accent-2, #FF6B6B); }
.fe-prompt-row {
  display: flex; align-items: flex-start; gap: 8px;
  min-height: 62px;
  padding: 9px 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.fe-prompt-row input,
.fe-prompt-row textarea {
  flex: 1; border: none; outline: none;
  background: transparent; color: var(--ink);
  font-family: var(--font-body); font-size: 12px;
}
.fe-prompt-row textarea {
  min-height: 42px;
  max-height: 78px;
  line-height: 1.45;
  resize: none;
}
.fe-prompt-row .at {
  margin-top: 2px;
  font-family: var(--font-mono); color: var(--accent);
  font-size: 13px; font-weight: 600;
}
.fe-empty {
  font-size: 11px;
  color: var(--ink-mute);
}
.fe-status {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--line-soft);
  background: var(--paper);
  font-size: 12px;
  color: var(--ink-soft);
}
.fe-status.error {
  color: var(--accent-2, #FF6B6B);
  border-color: color-mix(in oklab, var(--accent-2, #FF6B6B) 30%, transparent);
}


/* ─── Recovered from legacy modals4.jsx (LensFocusModal .lf-*, .lens-img) ─── */
/* ── Lens focus (box select to close-up) ── */
.lf-modal { width: 1180px; height: 760px; max-width: calc(100% - 60px); max-height: calc(100% - 60px); }
.lf-modal .body { display: grid; grid-template-columns: 1fr 300px; }
.lf-stage {
  position: relative; background: #000;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; user-select: none;
}
.lf-stage .lens-img {
  max-width: 100%; max-height: 100%; object-fit: contain;
  display: block;
}
.lf-svg {
  position: absolute; inset: 0;
  cursor: crosshair;
}
.lf-rect {
  fill: rgba(79, 212, 254, 0.16);
  stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 4 3;
}
.lf-mask-around {
  fill: rgba(0, 0, 0, 0.55);
}
.lf-side {
  background: var(--paper-2);
  border-left: 1px solid var(--line-soft);
  padding: 18px; display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto;
}
.lf-preview {
  width: 100%; aspect-ratio: 1/1;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--bg-deep);
  background-size: 220%;
  position: relative;
  overflow: hidden;
}
.lf-preview .pin {
  position: absolute; left: 8px; bottom: 8px;
  padding: 3px 8px; border-radius: 999px;
  background: rgba(10,12,14,0.7); color: #fff;
  font-family: var(--font-mono); font-size: 10px;
}
.lf-info {
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-mute);
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  padding: 10px 12px; background: var(--paper);
  border-radius: 8px; border: 1px solid var(--line-soft);
}


/* ─── Recovered from legacy modals4.jsx (VideoClipModal .vc-*) ─── */
/* ── Video clip (single video trim) ── */
.vc-modal { width: 1280px; height: 800px; max-width: calc(100% - 60px); max-height: calc(100% - 60px); }
.vc-modal .body { display: flex; flex-direction: column; }
.vc-preview {
  flex: 1; min-height: 0; position: relative;
  display: flex; align-items: center; justify-content: center;
  background: #000;
}
.vc-preview .frame {
  width: 80%; max-width: 960px; aspect-ratio: 16/9;
  background-size: cover; background-position: center;
  border-radius: 8px; position: relative;
}
.vc-preview .frame .play-disc {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff; pointer-events: none;
}
.vc-preview .frame .play-disc .disc {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(0,0,0,0.5); border: 1.5px solid rgba(255,255,255,0.6);
  display: flex; align-items: center; justify-content: center;
}
.vc-tools {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 18px;
  border-top: 1px solid var(--line-soft);
  font-family: var(--font-mono); font-size: 11px;
  color: var(--ink-soft);
}
.vc-tools .play-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent); color: var(--paper); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.vc-tools .clip-pill {
  padding: 4px 10px; border-radius: 999px;
  background: var(--paper-2); border: 1px solid var(--line-soft);
  font-family: var(--font-mono); font-size: 11px;
}
.vc-tools .right { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.vc-tools .out-btn {
  padding: 6px 14px; border-radius: 8px;
  background: var(--accent); color: var(--paper);
  border: none; font-weight: 700; cursor: pointer;
}

.vc-track {
  height: 110px; padding: 14px 18px 12px;
  background: var(--bg-deep);
  border-top: 1px solid var(--line-soft);
  position: relative;
}
.vc-frames {
  width: 100%; height: 50px; border-radius: 4px;
  background: linear-gradient(90deg,
    var(--paper-2) 0%, var(--bg-deep) 25%, var(--paper-2) 50%,
    var(--bg-deep) 75%, var(--paper-2) 100%);
  position: relative; overflow: hidden;
  display: flex;
}
.vc-frames .thumb {
  flex: 1; min-width: 0; height: 100%;
  background-size: cover; background-position: center;
  border-right: 1px solid rgba(0,0,0,0.4);
}
.vc-cut-overlay {
  position: absolute; top: 14px; bottom: 12px;
  background: rgba(0,0,0,0.65);
  border-top: 2px solid var(--accent);
  border-bottom: 2px solid var(--accent);
}
.vc-handle {
  position: absolute; top: 14px; bottom: 12px;
  width: 12px;
  background: var(--accent);
  cursor: ew-resize;
  display: flex; align-items: center; justify-content: center;
  color: var(--paper); font-family: var(--font-mono); font-size: 9px;
}
.vc-handle.l { border-radius: 4px 0 0 4px; }
.vc-handle.r { border-radius: 0 4px 4px 0; }
.vc-handle::before {
  content: ""; width: 3px; height: 18px;
  background: var(--paper); border-radius: 2px;
}
.vc-playhead {
  position: absolute; top: 6px; bottom: 4px;
  width: 2px; background: #fff;
  pointer-events: none;
}
.vc-playhead::before {
  content: ""; position: absolute; top: -4px; left: -5px;
  width: 12px; height: 12px;
  background: #fff; border-radius: 2px;
}

.vc-shortcuts {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 6px 18px;
  padding: 12px 18px;
  font-size: 11px; color: var(--ink-soft);
  border-top: 1px dashed var(--line-soft);
  background: var(--paper-2);
}
.vc-shortcuts .sc {
  display: flex; align-items: center; justify-content: space-between;
  padding: 3px 0;
}
.vc-shortcuts .sc .k {
  font-family: var(--font-mono); font-size: 10px;
}
.vc-shortcuts .sc .k span {
  display: inline-block; padding: 1px 5px;
  background: var(--paper); border: 1px solid var(--line-soft);
  border-radius: 4px; margin-left: 2px;
}

/* ── Video subtitle removal (VSR region picker) ── */
.vsr-tool-modal {
  width:min(1360px, calc(100% - 96px));
  height:min(820px, calc(100% - 92px));
}
.vsr-modal {
  flex:1;
  min-height:0;
  display:grid;
  grid-template-columns:minmax(0, 1fr) 334px;
  gap:16px;
  color:var(--ink);
}
.vsr-topbar .active {
  min-width:104px;
}
.vsr-preview {
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-rows:auto minmax(0, 1fr) auto;
  gap:12px;
  border:1px solid var(--line-soft);
  border-radius:12px;
  padding:12px;
  background:linear-gradient(180deg,#080b0f,#030405);
  overflow:hidden;
  box-shadow:0 16px 60px -20px rgba(0,0,0,.8);
}
.vsr-preview-head {
  min-height:32px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  color:rgba(255,255,255,.72);
  font-size:11px;
  font-weight:700;
}
.vsr-preview-head span {
  display:inline-flex;
  align-items:center;
  gap:6px;
}
.vsr-frame {
  position:relative;
  width:100%;
  align-self:center;
  aspect-ratio:16 / 9;
  overflow:hidden;
  background:#000;
  cursor:crosshair;
  user-select:none;
  border:1px solid rgba(255,255,255,.12);
  border-radius:8px;
}
.vsr-frame video {
  width:100%;
  height:100%;
  display:block;
  object-fit:contain;
  background:#000;
}
.vsr-frame.dragging video {
  pointer-events:none;
}
.vsr-empty {
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--ink-mute);
  font-size:13px;
}
.vsr-mask {
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(180deg, transparent 0 48%, rgba(0,0,0,.14) 100%);
}
.vsr-region {
  position:absolute;
  min-width:12px;
  min-height:12px;
  border:2px solid color-mix(in oklab, var(--accent) 86%, #fff);
  background:color-mix(in oklab, var(--accent) 18%, transparent);
  background-image:linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px);
  background-size:24px 24px;
  box-shadow:0 0 0 9999px rgba(0,0,0,.34), 0 0 0 1px rgba(255,255,255,.28) inset;
  pointer-events:none;
}
.vsr-region em {
  position:absolute;
  left:8px;
  top:-24px;
  height:18px;
  display:inline-flex;
  align-items:center;
  padding:0 7px;
  border-radius:5px;
  background:color-mix(in oklab, var(--accent) 24%, #101820);
  color:#dff3ff;
  font-size:10px;
  font-style:normal;
  font-weight:800;
  white-space:nowrap;
}
.vsr-region span {
  position:absolute;
  width:9px;
  height:9px;
  border-radius:50%;
  background:var(--accent);
  box-shadow:0 0 0 1px rgba(255,255,255,.7);
}
.vsr-region span:nth-of-type(1) { left:-5px; top:-5px; }
.vsr-region span:nth-of-type(2) { right:-5px; top:-5px; }
.vsr-region span:nth-of-type(3) { right:-5px; bottom:-5px; }
.vsr-region span:nth-of-type(4) { left:-5px; bottom:-5px; }
.vsr-timeline {
  display:grid;
  gap:9px;
}
.vsr-timeline-bar {
  position:relative;
  height:8px;
  border-radius:999px;
  background:rgba(255,255,255,.12);
  overflow:hidden;
}
.vsr-timeline-bar::before {
  content:"";
  position:absolute;
  inset:0 42% 0 0;
  background:color-mix(in oklab, var(--accent) 60%, #fff);
}
.vsr-timeline-bar i {
  position:absolute;
  top:50%;
  width:12px;
  height:12px;
  border-radius:50%;
  background:#fff;
  transform:translate(-50%,-50%);
  box-shadow:0 0 0 3px color-mix(in oklab, var(--accent) 38%, transparent);
}
.vsr-stage-row {
  display:grid;
  grid-template-columns:repeat(5, minmax(0, 1fr));
  gap:6px;
}
.vsr-stage-row span {
  height:24px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.1);
  border-radius:5px;
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.64);
  font-size:10px;
  font-weight:700;
}
.vsr-stage-row span.active {
  color:#dff3ff;
  border-color:color-mix(in oklab, var(--accent) 44%, transparent);
  background:color-mix(in oklab, var(--accent) 16%, transparent);
}
.vsr-side {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:14px;
  padding:14px;
  border:1px solid var(--line-soft);
  border-radius:12px;
  background:color-mix(in oklab, var(--paper) 96%, transparent);
  overflow:auto;
}
.vsr-panel-section {
  display:grid;
  gap:10px;
}
.vsr-panel-section + .vsr-panel-section {
  padding-top:14px;
  border-top:1px solid var(--line-soft);
}
.vsr-section-head {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  color:var(--ink);
  font-size:12px;
  font-weight:800;
}
.vsr-section-head > span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.vsr-section-head b {
  color:var(--ink-mute);
  font-size:10px;
  font-weight:800;
}
.vsr-engine {
  display:inline-flex;
  align-items:center;
  gap:5px;
}
.vsr-engine i {
  width:7px;
  height:7px;
  border-radius:50%;
  background:#22c55e;
  box-shadow:0 0 0 3px color-mix(in oklab, #22c55e 16%, transparent);
}
.vsr-side label,
.vsr-range-field,
.vsr-output-name {
  display:flex;
  flex-direction:column;
  gap:6px;
  color:var(--ink-mute);
  font-size:11px;
  font-weight:700;
}
.vsr-side select,
.vsr-side input:not([type="range"]):not([type="checkbox"]) {
  width:100%;
  height:32px;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:var(--paper-2);
  color:var(--ink);
  font-family:var(--font-body);
  font-size:12px;
  padding:0 9px;
  outline:none;
}
.vsr-side select:focus,
.vsr-side input:focus {
  border-color:color-mix(in oklab, var(--accent) 64%, var(--line));
}
.vsr-mode-list {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:7px;
}
.vsr-mode {
  height:42px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  padding:0 9px;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:var(--paper-2);
  color:var(--ink);
  cursor:pointer;
  font-family:var(--font-body);
  font-size:11px;
  font-weight:800;
}
.vsr-mode span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.vsr-mode em {
  color:var(--ink-mute);
  font-size:10px;
  font-style:normal;
  font-weight:800;
}
.vsr-mode.active {
  border-color:color-mix(in oklab, var(--accent) 56%, var(--line));
  background:color-mix(in oklab, var(--accent) 11%, var(--paper-2));
}
.vsr-segment {
  display:grid;
  grid-template-columns:repeat(3, minmax(0, 1fr));
  gap:3px;
  padding:3px;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:var(--paper-2);
}
.vsr-segment-two {
  grid-template-columns:repeat(2, minmax(0, 1fr));
}
.vsr-segment button {
  height:26px;
  border:0;
  border-radius:6px;
  background:transparent;
  color:var(--ink-mute);
  font-size:11px;
  font-weight:800;
  cursor:pointer;
}
.vsr-segment button.active {
  background:var(--paper);
  color:var(--ink);
  box-shadow:0 4px 14px -10px rgba(0,0,0,.45);
}
.vsr-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}
.vsr-range-field span {
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.vsr-range-field input[type="range"] {
  width:100%;
  accent-color:var(--accent);
}
.vsr-toggle {
  flex-direction:row !important;
  align-items:center;
  justify-content:space-between;
  min-height:34px;
  padding:0 10px;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:var(--paper-2);
}
.vsr-toggle input {
  width:15px;
  height:15px;
  accent-color:var(--accent);
}
.vsr-toggle span {
  display:inline-flex;
  align-items:center;
  gap:6px;
  color:var(--ink);
}
.vsr-meta {
  margin-top:auto;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
}
.vsr-meta span {
  display:inline-flex;
  align-items:center;
  gap:5px;
}
.vsr-error {
  padding:8px 10px;
  border:1px solid color-mix(in oklab, #ef4444 44%, var(--line));
  border-radius:8px;
  background:color-mix(in oklab, #ef4444 12%, var(--paper));
  color:#fecaca;
  font-size:12px;
  line-height:1.4;
}
@media (max-width: 900px) {
  .vsr-tool-modal {
    width:calc(100% - 28px);
    height:calc(100% - 54px);
  }
  .vsr-modal {
    grid-template-columns:1fr;
    overflow:auto;
  }
  .vsr-side {
    min-height:210px;
  }
}

/* ── Video subtitle removal: global workbench shell ── */
.tool-modal.fullscreen.vsr-tool-modal {
  width:100%;
  height:100%;
  max-width:none;
  max-height:none;
  min-width:0;
  min-height:0;
  margin:0;
  border:0;
  border-radius:0;
  background:transparent;
  box-shadow:none;
  overflow:hidden;
}
.vsr-workbench {
  position:relative;
  width:100%;
  height:100%;
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-rows:64px minmax(0, 1fr);
  color:var(--ink);
  background:
    radial-gradient(ellipse 44% 38% at 12% 5%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 68%),
    radial-gradient(ellipse 38% 34% at 88% 12%, color-mix(in oklab, var(--accent-2) 10%, transparent), transparent 72%),
    linear-gradient(180deg, color-mix(in oklab, var(--paper) 78%, var(--bg)) 0%, color-mix(in oklab, var(--bg-deep) 78%, var(--paper)) 100%);
  isolation:isolate;
  overflow:hidden;
}
.vsr-workbench::before {
  content:"";
  position:absolute;
  inset:0;
  z-index:-1;
  pointer-events:none;
  background-image:
    linear-gradient(color-mix(in oklab, var(--accent) 8%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in oklab, var(--accent-2) 5%, transparent) 1px, transparent 1px),
    radial-gradient(color-mix(in oklab, var(--accent) 18%, transparent) .75px, transparent 1.2px);
  background-size:72px 72px,72px 72px,8px 8px;
  mask-image:radial-gradient(ellipse 86% 72% at 50% 42%, black 0%, transparent 86%);
  opacity:.36;
}
.vsr-workbench-head {
  min-width:0;
  display:grid;
  grid-template-columns:auto minmax(0, 1fr) auto;
  align-items:center;
  gap:14px;
  padding:0 20px;
  border-bottom:1px solid color-mix(in oklab, var(--accent) 18%, var(--line));
  background:linear-gradient(180deg, color-mix(in oklab, var(--paper) 90%, transparent), color-mix(in oklab, var(--paper-2) 70%, transparent));
  box-shadow:0 18px 44px -38px color-mix(in oklab, var(--accent) 48%, #000), inset 0 1px 0 rgba(255,255,255,.7);
  backdrop-filter:blur(18px) saturate(1.08);
}
.vsr-head-close,
.vsr-preview-head button,
.vsr-ghost-action,
.vsr-submit-action {
  min-width:0;
  border:1px solid color-mix(in oklab, var(--line) 82%, transparent);
  border-radius:8px;
  font-family:var(--font-body);
  cursor:pointer;
  transition:border-color .16s ease, background .16s ease, color .16s ease, transform .16s ease, box-shadow .16s ease;
}
.vsr-head-close {
  width:34px;
  height:34px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:color-mix(in oklab, var(--paper) 84%, transparent);
  color:var(--ink-soft);
}
.vsr-head-close:hover,
.vsr-preview-head button:hover,
.vsr-ghost-action:hover {
  color:var(--ink);
  border-color:color-mix(in oklab, var(--accent) 42%, var(--line));
  background:color-mix(in oklab, var(--accent) 10%, var(--paper));
}
.vsr-workbench-title {
  min-width:0;
  display:flex;
  align-items:baseline;
  gap:12px;
}
.vsr-workbench-title strong {
  min-width:0;
  display:inline-flex;
  align-items:center;
  gap:8px;
  color:var(--ink);
  font-size:15px;
  font-weight:850;
  white-space:nowrap;
}
.vsr-workbench-title span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink-mute);
  font-size:11px;
  font-weight:700;
}
.vsr-workbench-status {
  display:inline-flex;
  align-items:center;
  gap:12px;
  color:var(--ink-mute);
  font-size:11px;
  font-weight:800;
}
.vsr-workbench-status span {
  display:inline-flex;
  align-items:center;
  gap:6px;
  color:color-mix(in oklab, #18a957 72%, var(--ink));
}
.vsr-workbench-status i {
  width:7px;
  height:7px;
  border-radius:50%;
  background:#22c55e;
  box-shadow:0 0 0 4px color-mix(in oklab, #22c55e 15%, transparent);
}
.vsr-workbench-status b {
  font-family:var(--font-mono);
  font-size:10px;
  font-weight:700;
}
.vsr-workbench .vsr-modal {
  min-height:0;
  display:grid;
  grid-template-columns:minmax(0, 1fr) 354px;
  gap:18px;
  padding:18px 22px 20px;
  color:var(--ink);
  overflow:hidden;
}
.vsr-workbench .vsr-preview {
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-rows:auto minmax(0, 1fr) auto;
  gap:12px;
  padding:14px;
  border:1px solid color-mix(in oklab, var(--accent) 22%, var(--line));
  border-radius:10px;
  background:
    radial-gradient(ellipse 72% 90% at 0% 0%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 72%),
    linear-gradient(180deg, color-mix(in oklab, var(--paper) 90%, transparent), color-mix(in oklab, var(--paper-2) 72%, transparent));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.78), 0 26px 68px -48px color-mix(in oklab, var(--accent) 54%, #000);
  backdrop-filter:blur(16px) saturate(1.08);
  overflow:hidden;
}
.vsr-workbench .vsr-preview-head {
  min-height:42px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  color:var(--ink);
}
.vsr-preview-head div {
  min-width:0;
  display:grid;
  gap:4px;
}
.vsr-workbench .vsr-preview-head span {
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:var(--ink);
  font-size:12px;
  font-weight:850;
}
.vsr-preview-head strong {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink-mute);
  font-size:10px;
  font-weight:700;
}
.vsr-preview-head button {
  height:32px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:0 11px;
  background:color-mix(in oklab, var(--paper) 82%, transparent);
  color:var(--ink-soft);
  font-size:11px;
  font-weight:800;
}
.vsr-frame-shell {
  min-width:0;
  min-height:0;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:12px;
  border:1px solid color-mix(in oklab, var(--line) 72%, transparent);
  border-radius:10px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.05), transparent 22%),
    radial-gradient(ellipse 70% 90% at 50% 18%, color-mix(in oklab, var(--accent) 9%, transparent), transparent 68%),
    #05070a;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.04), inset 0 -38px 90px -72px rgba(85,182,242,.55);
  overflow:hidden;
}
.vsr-workbench .vsr-frame {
  position:relative;
  width:min(100%, calc((100vh - 238px) * 16 / 9));
  max-width:100%;
  align-self:center;
  aspect-ratio:16 / 9;
  overflow:hidden;
  background:#000;
  cursor:crosshair;
  user-select:none;
  border:1px solid rgba(255,255,255,.13);
  border-radius:8px;
  box-shadow:0 24px 82px -50px rgba(0,0,0,.9);
}
.vsr-workbench .vsr-mask {
  background:linear-gradient(180deg, transparent 0 50%, rgba(0,0,0,.18) 100%);
}
.vsr-workbench .vsr-region {
  border:2px solid color-mix(in oklab, var(--accent) 86%, #fff);
  background:color-mix(in oklab, var(--accent) 20%, transparent);
  background-image:linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.13) 1px, transparent 1px);
  background-size:22px 22px;
  box-shadow:0 0 0 9999px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.34) inset, 0 0 20px -10px color-mix(in oklab, var(--accent) 80%, transparent);
}
.vsr-workbench .vsr-region em {
  top:-23px;
  height:18px;
  border:1px solid color-mix(in oklab, var(--accent) 28%, rgba(255,255,255,.12));
  background:linear-gradient(180deg, color-mix(in oklab, var(--accent) 32%, #0b1420), #0b1420);
}
.vsr-workbench .vsr-timeline {
  display:grid;
  gap:10px;
  padding:2px 0 0;
}
.vsr-workbench .vsr-timeline-bar {
  height:7px;
  background:color-mix(in oklab, var(--ink) 10%, transparent);
}
.vsr-workbench .vsr-timeline-bar::before {
  background:linear-gradient(90deg, color-mix(in oklab, var(--accent) 62%, #fff), color-mix(in oklab, var(--accent-2) 22%, var(--accent)));
}
.vsr-workbench .vsr-stage-row span {
  height:28px;
  border-color:color-mix(in oklab, var(--line) 72%, transparent);
  border-radius:7px;
  background:color-mix(in oklab, var(--paper) 74%, transparent);
  color:var(--ink-mute);
}
.vsr-workbench .vsr-stage-row span.active {
  color:var(--ink);
  border-color:color-mix(in oklab, var(--accent) 46%, var(--line));
  background:color-mix(in oklab, var(--accent) 12%, var(--paper));
}
.vsr-workbench .vsr-side {
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-rows:minmax(0, 1fr) auto;
  gap:0;
  padding:0;
  border:1px solid color-mix(in oklab, var(--accent) 22%, var(--line));
  border-radius:10px;
  background:
    radial-gradient(ellipse 78% 90% at 0% 0%, color-mix(in oklab, var(--accent) 9%, transparent), transparent 72%),
    linear-gradient(180deg, color-mix(in oklab, var(--paper) 92%, transparent), color-mix(in oklab, var(--paper-2) 78%, transparent));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.82), 0 26px 68px -50px color-mix(in oklab, var(--accent) 46%, #000);
  backdrop-filter:blur(16px) saturate(1.08);
  overflow:hidden;
}
.vsr-side-scroll {
  min-height:0;
  display:grid;
  align-content:start;
  gap:14px;
  padding:16px;
  overflow:auto;
  scrollbar-width:thin;
}
.vsr-workbench .vsr-panel-section {
  display:grid;
  gap:11px;
}
.vsr-workbench .vsr-panel-section + .vsr-panel-section {
  padding-top:14px;
  border-top:1px solid color-mix(in oklab, var(--accent) 15%, var(--line-soft));
}
.vsr-workbench .vsr-section-head {
  color:var(--ink);
}
.vsr-workbench .vsr-section-head b {
  color:var(--ink-mute);
}
.vsr-workbench .vsr-engine {
  color:color-mix(in oklab, #18a957 70%, var(--ink));
}
.vsr-workbench .vsr-mode,
.vsr-workbench .vsr-side input:not([type="range"]):not([type="checkbox"]),
.vsr-workbench .vsr-toggle {
  border-color:color-mix(in oklab, var(--line) 78%, transparent);
  background:color-mix(in oklab, var(--paper-2) 72%, transparent);
  box-shadow:inset 0 1px 0 color-mix(in oklab, var(--ink) 5%, transparent);
}
.vsr-workbench .vsr-mode {
  height:44px;
}
.vsr-workbench .vsr-mode:hover {
  border-color:color-mix(in oklab, var(--accent) 36%, var(--line));
  background:color-mix(in oklab, var(--accent) 8%, var(--paper-2));
}
.vsr-workbench .vsr-mode.active {
  border-color:color-mix(in oklab, var(--accent) 58%, var(--line));
  background:linear-gradient(180deg, color-mix(in oklab, var(--accent) 15%, var(--paper)), color-mix(in oklab, var(--paper-2) 82%, transparent));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.64), 0 12px 28px -24px color-mix(in oklab, var(--accent) 62%, transparent);
}
.vsr-workbench .vsr-segment {
  border-color:color-mix(in oklab, var(--line) 78%, transparent);
  background:color-mix(in oklab, var(--paper-2) 72%, transparent);
}
.vsr-workbench .vsr-segment button.active {
  background:linear-gradient(180deg, color-mix(in oklab, var(--paper) 96%, transparent), color-mix(in oklab, var(--accent) 8%, var(--paper)));
  color:var(--ink);
  box-shadow:0 10px 20px -18px color-mix(in oklab, var(--accent) 58%, #000), inset 0 1px 0 rgba(255,255,255,.72);
}
.vsr-workbench .vsr-side input:not([type="range"]):not([type="checkbox"]) {
  height:34px;
}
.vsr-workbench .vsr-meta {
  margin-top:2px;
  padding-top:10px;
  border-top:1px dashed color-mix(in oklab, var(--line) 74%, transparent);
}
.vsr-side-actions {
  display:grid;
  grid-template-columns:96px minmax(0, 1fr);
  gap:10px;
  padding:12px 16px 16px;
  border-top:1px solid color-mix(in oklab, var(--accent) 16%, var(--line-soft));
  background:linear-gradient(180deg, color-mix(in oklab, var(--paper) 74%, transparent), color-mix(in oklab, var(--paper-2) 88%, transparent));
}
.vsr-ghost-action,
.vsr-submit-action {
  height:42px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  padding:0 14px;
  font-size:12px;
  font-weight:850;
}
.vsr-ghost-action {
  background:color-mix(in oklab, var(--paper) 82%, transparent);
  color:var(--ink-soft);
}
.vsr-submit-action {
  justify-self:stretch;
  border-color:color-mix(in oklab, var(--accent) 64%, white);
  background:linear-gradient(135deg, color-mix(in oklab, var(--accent) 96%, #fff), color-mix(in oklab, var(--accent-2) 18%, var(--accent)) 72%, color-mix(in oklab, var(--accent-3) 18%, var(--accent)));
  color:#092238;
  box-shadow:0 18px 42px -28px color-mix(in oklab, var(--accent) 86%, transparent), inset 0 1px 0 rgba(255,255,255,.48);
}
.vsr-submit-action:hover:not(:disabled) {
  transform:translateY(-1px);
  box-shadow:0 22px 48px -28px color-mix(in oklab, var(--accent) 90%, transparent), inset 0 1px 0 rgba(255,255,255,.56);
}
.vsr-submit-action:disabled,
.vsr-ghost-action:disabled,
.vsr-preview-head button:disabled {
  opacity:.58;
  cursor:not-allowed;
  transform:none;
}
.theme-b .vsr-workbench {
  background:
    radial-gradient(ellipse 44% 38% at 12% 5%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 68%),
    radial-gradient(ellipse 34% 32% at 88% 12%, color-mix(in oklab, var(--accent-2) 7%, transparent), transparent 72%),
    linear-gradient(180deg, #0D0F0E 0%, #171817 56%, #080908 100%);
}
.theme-b .vsr-workbench-head,
.theme-b .vsr-workbench .vsr-preview,
.theme-b .vsr-workbench .vsr-side {
  box-shadow:inset 0 1px 0 rgba(255,255,255,.055), 0 28px 74px -46px rgba(0,0,0,.98);
}
@media (max-width: 1080px) {
  .vsr-workbench .vsr-modal {
    grid-template-columns:minmax(0, 1fr) 316px;
    gap:14px;
    padding:14px;
  }
  .vsr-workbench-title span {
    display:none;
  }
}
@media (max-width: 820px) {
  .vsr-workbench {
    grid-template-rows:58px minmax(0, 1fr);
  }
  .vsr-workbench-head {
    grid-template-columns:auto minmax(0, 1fr);
  }
  .vsr-workbench-status {
    display:none;
  }
  .vsr-workbench .vsr-modal {
    grid-template-columns:1fr;
    grid-template-rows:minmax(420px, 1fr) minmax(280px, 42%);
    overflow:auto;
  }
  .vsr-workbench .vsr-side {
    min-height:280px;
  }
}


/* ─── Recovered from legacy modals4.jsx (SaveWorkflowModal .wf-*) ─── */
/* ── Save workflow modal ── */
.wf-modal { width: 540px; max-width: calc(100% - 60px); }
.wf-cover {
  width: 100%; aspect-ratio: 16/9; border-radius: 10px;
  background-size: cover; background-position: center;
  margin-bottom: 16px;
  position: relative;
}
.wf-cover .badge {
  position: absolute; top: 10px; left: 10px;
  padding: 4px 10px; border-radius: 999px;
  background: rgba(10,12,14,0.7); color: #fff;
  font-family: var(--font-mono); font-size: 10px;
}


/* ─── Recovered from legacy modals4.jsx (FrameCapModal .fc-*) ─── */
/* ── Frame capture (从视频截帧) ── */
.fc-modal { width: 980px; height: 700px; max-width: calc(100% - 60px); max-height: calc(100% - 60px); }
.fc-modal .body { display: flex; flex-direction: column; }
.fc-stage {
  flex: 1; background: #000; position: relative;
  display: flex; align-items: center; justify-content: center;
}
.fc-stage img {
  max-width: 80%; max-height: 80%; object-fit: contain;
  border-radius: 8px;
}
.fc-video-source {
  position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;
}
.fc-stage-empty {
  color: rgba(255,255,255,.72); font-size: 13px;
  padding: 10px 14px; border-radius: 6px;
  background: rgba(255,255,255,.08);
}
.fc-strip {
  height: 90px; padding: 12px 18px;
  background: var(--bg-deep);
  border-top: 1px solid var(--line-soft);
  display: flex; gap: 6px; overflow-x: auto;
}
.fc-strip .sl {
  flex: 0 0 100px; height: 56px;
  border-radius: 4px;
  background-size: cover; background-position: center;
  border: 2px solid transparent; cursor: pointer;
  position: relative;
  margin-top: 6px;
  padding: 0;
}
.fc-strip .sl.active { border-color: var(--accent); }
.fc-strip .sl .t {
  position: absolute; bottom: -16px; left: 0; right: 0;
  text-align: center; font-family: var(--font-mono);
  font-size: 9px; color: var(--ink-mute);
}
.fc-strip-status {
  align-self: center; color: var(--ink-mute); font-size: 12px;
}


/* ─── Recovered from legacy modals4.jsx (VoiceChangeModal .vch-*) ─── */
/* ── VoiceChange modal ── */
.vch-modal { width: 720px; max-width: calc(100% - 60px); }
.vch-modal .body { padding: 20px 22px; }
.vch-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 10px; margin-top: 8px;
}
.vch-card {
  padding: 14px 10px; border-radius: 10px;
  background: var(--paper-2); border: 1.5px solid var(--line);
  text-align: center; cursor: pointer;
}
.vch-card.active { border-color: var(--accent); }
.vch-card .ic {
  width: 38px; height: 38px; border-radius: 50%;
  margin: 0 auto 8px;
  background: color-mix(in oklab, var(--accent) 14%, var(--paper));
  display: flex; align-items: center; justify-content: center;
  color: var(--accent);
}
.vch-card .n { font-size: 12px; color: var(--ink); margin-bottom: 2px; }
.vch-card .d { font-size: 10px; color: var(--ink-mute); }

/* ─── Generic .spin (used by RealPersonModal etc.) — borrows nspin keyframes from features/nodes/styles.js ─── */
.spin {
  border-style: solid; border-width: 2px;
  border-radius: 50%;
  animation: nspin .8s linear infinite;
}

/* ── CamCtrl popover (摄像机/运镜) ── */
.cc-popover-backdrop {
  position: fixed; inset: 0; z-index: 8500;
  background: rgba(0,0,0,0.5);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: cc-fade .2s ease;
}
.has-window-chrome .cc-popover-backdrop{top:38px;bottom:auto;height:calc(100% - 38px)}
@keyframes cc-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes cc-pop  { from { transform: translateY(8px) scale(.96); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
.cc-popover {
  width: min(440px, 100%);
  max-height: calc(100vh - 80px);
  overflow: auto;
  background: linear-gradient(180deg, color-mix(in oklab, var(--paper) 92%, transparent) 0%, color-mix(in oklab, var(--paper-2) 80%, transparent) 100%);
  border: 1px solid color-mix(in oklab, var(--accent) 28%, var(--line));
  border-radius: 16px;
  padding: 20px 22px 18px;
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--ink) 9%, transparent),
    0 28px 80px -28px rgba(0,0,0,.7),
    0 0 120px -50px color-mix(in oklab, var(--accent) 60%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(125%);
  backdrop-filter: blur(20px) saturate(125%);
  font-family: var(--font-body);
  color: var(--ink);
  animation: cc-pop .3s cubic-bezier(.2,.8,.2,1) backwards;
}
.cc-popover h3 { margin: 0 0 14px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
.cc-popover .row {
  display: grid; grid-template-columns: 56px 1fr 64px;
  align-items: center; gap: 12px; margin-bottom: 10px;
}
.cc-popover .row label { font-size: 12px; color: var(--ink-soft); }
.cc-popover .row .val {
  font-family: var(--font-mono); font-size: 11px;
  color: var(--ink-mute); text-align: right;
}
.cc-popover .row input[type=range] {
  width: 100%; accent-color: var(--accent); cursor: pointer;
}
.cc-popover .seg { display: flex; flex-wrap: wrap; gap: 4px; }
.cc-popover .seg button {
  padding: 5px 10px;
  border: 1px solid var(--line-soft); border-radius: 6px;
  background: var(--paper-2); color: var(--ink-soft);
  font-size: 11px; cursor: pointer; font-family: var(--font-body);
  transition: all .15s ease;
}
.cc-popover .seg button:hover { color: var(--ink); border-color: color-mix(in oklab, var(--accent) 40%, var(--line)); }
.cc-popover .seg button.active {
  background: color-mix(in oklab, var(--accent) 18%, var(--paper-2));
  border-color: color-mix(in oklab, var(--accent) 50%, var(--line));
  color: var(--ink);
}
.cc-popover .div { height: 1px; background: var(--line-soft); margin: 14px 0; }
.cc-popover .preset-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
}
.cc-popover .preset {
  padding: 8px 4px;
  border: 1px solid var(--line-soft); border-radius: 8px;
  background: var(--paper-2); color: var(--ink-soft);
  font-size: 10.5px; cursor: pointer; font-family: var(--font-body);
  transition: all .15s ease;
}
.cc-popover .preset:hover { color: var(--ink); border-color: color-mix(in oklab, var(--accent) 40%, var(--line)); }
.cc-popover .preset.active {
  background: color-mix(in oklab, var(--accent) 18%, var(--paper-2));
  border-color: color-mix(in oklab, var(--accent) 50%, var(--line));
  color: var(--ink);
}
.cc-popover .preset .pi {
  font-size: 14px; line-height: 1; margin-bottom: 2px;
  color: color-mix(in oklab, var(--accent) 80%, white);
}

/* Toolbox */
.tb-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1400;
  background: rgba(0,0,0,0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.has-window-chrome .tb-modal-mask{top:38px;bottom:auto;height:calc(100% - 38px)}
.tb-modal {
  width: min(760px, calc(100vw - 48px));
  max-height: min(680px, calc(100vh - 48px));
  overflow: auto;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 28px 90px rgba(0,0,0,0.45);
  color: var(--ink);
}
.tb-head {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: color-mix(in oklab, var(--paper) 94%, transparent);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(10px);
}
.tb-head strong {
  display: block;
  font-size: 15px;
}
.tb-head span {
  display: block;
  margin-top: 4px;
  color: var(--ink-mute);
  font-size: 12px;
}
.tb-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--ink-soft);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.tb-close:hover { color: var(--ink); border-color: var(--accent); }
.tb-groups {
  padding: 16px 18px 20px;
  display: grid;
  gap: 18px;
}
.tb-group h3 {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 650;
  color: var(--ink-soft);
}
.tb-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.tb-card {
  min-height: 76px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--paper-2);
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}
.tb-card:hover:not(:disabled) {
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent) 8%, var(--paper-2));
}
.tb-card:disabled {
  cursor: not-allowed;
  opacity: 0.54;
}
.tb-card-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: color-mix(in oklab, var(--accent) 12%, var(--paper));
  color: var(--accent);
  border: 1px solid color-mix(in oklab, var(--accent) 24%, var(--line));
}
.tb-card-main {
  min-width: 0;
  display: grid;
  gap: 5px;
}
.tb-card-main strong {
  font-size: 13px;
  line-height: 1.25;
}
.tb-card-main em {
  color: var(--ink-mute);
  font-size: 11px;
  line-height: 1.45;
  font-style: normal;
}

/* Canvas image node tools */
.cit-loading {
  min-width:520px;
  min-height:320px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:14px;
  border:1px solid var(--line);
  background:var(--paper);
  color:var(--ink-mute);
  box-shadow:var(--shadow-float);
}
.cit-title {
  display:inline-flex;
  align-items:center;
  gap:6px;
  color:var(--ink);
  font-size:12px;
}
.cit-panel {
  width:min(1040px, calc(100vw - 56px));
  max-height:calc(100vh - 96px);
  display:flex;
  flex-direction:column;
  gap:12px;
  padding:12px;
  overflow:hidden;
}
.cit-work {
  min-height:0;
  display:flex;
  align-items:flex-start;
  justify-content:center;
  gap:14px;
  overflow:auto;
}
.cit-image-frame {
  position:relative;
  flex:0 0 auto;
  overflow:hidden;
  border-radius:12px;
  background:#050505;
  box-shadow:0 0 0 1px var(--line);
  user-select:none;
  touch-action:none;
}
.cit-image-frame img {
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:contain;
  display:block;
}
.cit-crop-dim {
  position:absolute;
  inset:0;
  background:rgba(0,0,0,.46);
  pointer-events:none;
}
.cit-crop-box {
  position:absolute;
  border:2px solid var(--accent);
  background:rgba(79,212,254,.12);
  box-shadow:0 0 0 9999px rgba(0,0,0,.38);
  pointer-events:none;
}
.cit-draw-canvas {
  position:absolute;
  inset:0;
  cursor:crosshair;
  touch-action:none;
}
.cit-grid-overlay {
  position:absolute;
  inset:0;
  pointer-events:none;
}
.cit-side {
  width:148px;
  flex:0 0 148px;
  display:flex;
  flex-direction:column;
  gap:7px;
  padding:10px;
  border:1px solid var(--line-soft);
  border-radius:12px;
  background:color-mix(in oklab, var(--paper-2) 72%, transparent);
}
.cit-side strong {
  margin-top:4px;
  color:var(--ink-mute);
  font-size:10px;
  font-family:var(--font-mono);
  font-weight:600;
}
.cit-side button {
  min-height:28px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:var(--paper);
  color:var(--ink-soft);
  cursor:pointer;
  font-size:11px;
}
.cit-side button:hover,
.cit-side button.active {
  border-color:color-mix(in oklab, var(--accent) 52%, var(--line));
  background:color-mix(in oklab, var(--accent) 14%, var(--paper));
  color:var(--ink);
}
.cit-side input[type="range"] {
  width:100%;
  accent-color:var(--accent);
}
.cit-colors {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:6px;
}
.cit-colors button {
  min-height:24px;
  border-radius:8px;
}
.cit-colors button.active {
  outline:2px solid var(--accent);
  outline-offset:1px;
}
.cit-footer {
  min-height:42px;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:8px;
  padding-top:10px;
  border-top:1px solid var(--line-soft);
}
.cit-meta {
  margin-right:auto;
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
}
.cit-upscale {
  min-height:360px;
  display:grid;
  grid-template-columns:minmax(0, 1fr) 220px;
  gap:14px;
}
.cit-upscale-preview {
  min-height:360px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:12px;
  border:1px solid var(--line);
  background:#050505;
  overflow:hidden;
}
.cit-upscale-preview img {
  max-width:100%;
  max-height:100%;
  object-fit:contain;
}
.cit-upscale-options {
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:14px;
  border:1px solid var(--line-soft);
  border-radius:12px;
  background:color-mix(in oklab, var(--paper-2) 70%, transparent);
  color:var(--ink-soft);
}
.cit-upscale-options strong {
  color:var(--ink);
  font-size:13px;
}
.cit-upscale-options div {
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  justify-content:center;
}
.cit-upscale-options button {
  min-width:58px;
  height:34px;
  border:1px solid var(--line);
  border-radius:9px;
  background:var(--paper);
  color:var(--ink-soft);
  cursor:pointer;
}
.cit-upscale-options button:disabled {
  opacity:.55;
  cursor:not-allowed;
}
.cit-upscale-options button.active,
.cit-upscale-options button:hover {
  border-color:var(--accent);
  background:color-mix(in oklab, var(--accent) 15%, var(--paper));
  color:var(--ink);
}
.cit-upscale-status {
  width:calc(100% - 24px);
  display:flex;
  flex-direction:column;
  gap:7px;
  align-items:stretch;
  color:var(--ink-mute);
  font-size:11px;
  line-height:1.35;
  text-align:center;
}
.cit-upscale-status progress {
  width:100%;
  height:6px;
  accent-color:var(--accent);
}

/* ─── Storyboard collector workspace ─── */
.sbc-editor-toolbar-title {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 700;
  padding-left: 2px;
}
.sbc-editor-shell {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 244px minmax(360px, 1fr) 278px;
  grid-template-rows: minmax(0, 1fr) 188px;
  gap: 10px;
  padding: 10px;
  border: 1px solid color-mix(in oklab, var(--line) 72%, transparent);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(13,15,18,.98), rgba(8,10,13,.98));
  color: var(--ink);
  overflow: hidden;
}
.sbc-editor-shell.missing {
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--ink-mute);
  font-size:13px;
}
.sbc-editor-assets,
.sbc-editor-params,
.sbc-editor-preview,
.sbc-editor-timeline {
  min-width: 0;
  min-height: 0;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(20,23,28,.74);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
}
.sbc-editor-assets,
.sbc-editor-params {
  display:flex;
  flex-direction:column;
  gap:10px;
  padding:12px;
  border-radius:10px;
}
.sbc-editor-preview {
  display:flex;
  flex-direction:column;
  border-radius:10px;
  overflow:hidden;
  background:#050608;
}
.sbc-editor-timeline {
  grid-column:1 / 4;
  display:flex;
  flex-direction:column;
  border-radius:10px;
  overflow:hidden;
}
.sbc-panel-head {
  min-height: 26px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}
.sbc-panel-head strong {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink);
  font-size:13px;
}
.sbc-panel-head span,
.sbc-timeline-ruler em {
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  font-style:normal;
}
.sbc-add-local {
  min-height:34px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  border:1px solid color-mix(in oklab, var(--accent) 44%, var(--line));
  border-radius:8px;
  background:color-mix(in oklab, var(--accent) 16%, rgba(255,255,255,.04));
  color:var(--ink);
  cursor:pointer;
  font-size:12px;
  font-weight:700;
}
.sbc-add-local:hover:not(:disabled) {
  background:color-mix(in oklab, var(--accent) 23%, rgba(255,255,255,.05));
  border-color:color-mix(in oklab, var(--accent) 70%, var(--line));
}
.sbc-add-local:disabled {
  opacity:.56;
  cursor:wait;
}
.sbc-hidden-file {
  display:none;
}
.sbc-asset-list {
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:7px;
  overflow:auto;
  padding-right:2px;
}
.sbc-asset-row {
  width:100%;
  min-height:58px;
  display:grid;
  grid-template-columns:52px minmax(0, 1fr);
  align-items:center;
  gap:9px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:8px;
  background:rgba(255,255,255,.035);
  color:var(--ink-soft);
  cursor:pointer;
  padding:6px;
  text-align:left;
}
.sbc-asset-row:hover,
.sbc-asset-row.active {
  border-color:color-mix(in oklab, var(--accent) 48%, rgba(255,255,255,.08));
  background:color-mix(in oklab, var(--accent) 12%, rgba(255,255,255,.035));
  color:var(--ink);
}
.sbc-asset-thumb,
.sbc-timeline-thumb {
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.1);
  border-radius:7px;
  overflow:hidden;
  background:#0b0d10;
  color:var(--ink-mute);
}
.sbc-asset-thumb {
  width:52px;
  height:42px;
}
.sbc-asset-thumb img,
.sbc-timeline-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.sbc-asset-copy {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.sbc-asset-copy strong {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:12px;
}
.sbc-asset-copy em {
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  font-style:normal;
}
.sbc-empty-assets,
.sbc-empty-params,
.sbc-preview-empty,
.sbc-timeline-empty {
  flex:1;
  min-height:0;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  color:var(--ink-mute);
  font-size:12px;
  text-align:center;
}
.sbc-editor-status {
  min-height:28px;
  display:flex;
  align-items:center;
  border-top:1px solid rgba(255,255,255,.08);
  color:var(--ink-mute);
  font-size:11px;
  line-height:1.35;
}
.sbc-player-frame {
  flex:1;
  min-height:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#030405;
  overflow:hidden;
}
.sbc-player-frame video,
.sbc-player-frame img {
  max-width:100%;
  max-height:100%;
  width:auto;
  height:auto;
  object-fit:contain;
  display:block;
}
.sbc-audio-preview {
  min-width:min(420px, calc(100% - 48px));
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px;
  color:var(--ink-soft);
}
.sbc-audio-preview strong {
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:14px;
}
.sbc-audio-preview audio {
  width:100%;
}
.sbc-preview-controls {
  min-height:44px;
  display:grid;
  grid-template-columns:34px minmax(0, 1fr) auto;
  align-items:center;
  gap:10px;
  padding:7px 10px;
  border-top:1px solid rgba(255,255,255,.08);
  background:rgba(12,14,17,.92);
}
.sbc-play-toggle {
  width:30px;
  height:30px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.1);
  border-radius:999px;
  background:color-mix(in oklab, var(--accent) 18%, rgba(255,255,255,.04));
  color:var(--ink);
  cursor:pointer;
}
.sbc-play-toggle:disabled {
  opacity:.42;
  cursor:default;
}
.sbc-preview-title {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:12px;
  font-weight:700;
}
.sbc-preview-meta {
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  white-space:nowrap;
}
.sbc-param-field {
  display:flex;
  flex-direction:column;
  gap:6px;
}
.sbc-param-field span {
  color:var(--ink-mute);
  font-size:11px;
}
.sbc-param-field input,
.sbc-param-field select {
  width:100%;
  min-width:0;
  min-height:32px;
  border:1px solid rgba(255,255,255,.1);
  border-radius:8px;
  background:rgba(255,255,255,.045);
  color:var(--ink);
  outline:none;
  padding:0 9px;
  font-size:12px;
}
.sbc-param-field input:focus,
.sbc-param-field select:focus {
  border-color:color-mix(in oklab, var(--accent) 62%, var(--line));
}
.sbc-param-field input[type="range"] {
  padding:0;
  accent-color:var(--accent);
}
.sbc-param-field input:disabled,
.sbc-param-field select:disabled {
  opacity:.48;
}
.sbc-param-actions {
  margin-top:auto;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:7px;
}
.sbc-param-actions button {
  min-height:30px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  border:1px solid rgba(255,255,255,.1);
  border-radius:8px;
  background:rgba(255,255,255,.045);
  color:var(--ink-soft);
  cursor:pointer;
  font-size:12px;
}
.sbc-param-actions button:hover:not(:disabled) {
  border-color:color-mix(in oklab, var(--accent) 46%, rgba(255,255,255,.1));
  color:var(--ink);
}
.sbc-param-actions button:disabled {
  opacity:.42;
  cursor:default;
}
.sbc-param-actions button.danger {
  grid-column:1 / 3;
  color:#fca5a5;
}
.sbc-timeline-ruler {
  min-height:30px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:0 12px;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:rgba(12,14,17,.92);
}
.sbc-timeline-ruler span {
  color:var(--ink-soft);
  font-size:12px;
  font-weight:700;
}
.sbc-timeline-strip {
  flex:1;
  min-height:0;
  display:flex;
  align-items:stretch;
  gap:8px;
  overflow:auto;
  padding:10px;
}
.sbc-timeline-clip {
  width:154px;
  flex:0 0 154px;
  display:flex;
  flex-direction:column;
  gap:6px;
  border:1px solid rgba(255,255,255,.09);
  border-radius:8px;
  background:rgba(255,255,255,.035);
  padding:6px;
}
.sbc-timeline-clip.active {
  border-color:color-mix(in oklab, var(--accent) 58%, rgba(255,255,255,.09));
  background:color-mix(in oklab, var(--accent) 12%, rgba(255,255,255,.035));
}
.sbc-timeline-clip.dragging {
  opacity:.55;
}
.sbc-timeline-select {
  min-width:0;
  flex:1;
  display:grid;
  grid-template-columns:42px minmax(0, 1fr);
  grid-template-rows:auto auto;
  gap:5px 7px;
  align-items:center;
  border:0;
  background:transparent;
  color:var(--ink-soft);
  cursor:pointer;
  padding:0;
  text-align:left;
}
.sbc-timeline-thumb {
  grid-row:1 / 3;
  width:42px;
  height:42px;
}
.sbc-timeline-select strong {
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
}
.sbc-timeline-select em {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink);
  font-size:11px;
  font-style:normal;
}
.sbc-timeline-actions {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:5px;
}
.sbc-timeline-actions button {
  height:24px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.09);
  border-radius:6px;
  background:rgba(255,255,255,.035);
  color:var(--ink-soft);
  cursor:pointer;
}
.sbc-timeline-actions button:hover:not(:disabled) {
  color:var(--ink);
  border-color:color-mix(in oklab, var(--accent) 46%, rgba(255,255,255,.09));
}
.sbc-timeline-actions button:disabled {
  opacity:.36;
  cursor:default;
}
@media (max-width: 1040px) {
  .sbc-editor-shell {
    grid-template-columns: 210px minmax(300px, 1fr);
    grid-template-rows: minmax(0, 1fr) 210px 168px;
  }
  .sbc-editor-params {
    grid-column:1 / 3;
    flex-direction:row;
    flex-wrap:wrap;
    align-content:flex-start;
  }
  .sbc-editor-timeline {
    grid-column:1 / 3;
  }
  .sbc-param-field {
    width:calc(50% - 8px);
  }
  .sbc-param-actions {
    width:100%;
    margin-top:0;
  }
}

/* ─── Storyboard collector fullscreen editor redesign ─── */
.tool-modal-mask.fullscreen {
  inset:0;
  display:block;
  padding:0;
  background:#0b0f14;
  backdrop-filter:none;
}
.has-window-chrome .tool-modal-mask.fullscreen {
  top:38px;
  bottom:auto;
  height:calc(100% - 38px);
}
.tool-modal.fullscreen.storyboard-collector-fullscreen {
  width:100%;
  height:100%;
  max-width:none;
  max-height:none;
  min-width:0;
  min-height:0;
  display:flex;
  margin:0;
  border:0;
  border-radius:0;
  background:#0b0f14;
  box-shadow:none;
}
.sbc-editor-shell.fullscreen {
  width:100%;
  height:100%;
  flex:1;
  display:grid;
  grid-template-columns:344px minmax(420px, 1fr) 312px;
  grid-template-rows:56px minmax(0, 1fr) 236px;
  grid-template-areas:
    "top top top"
    "left preview params"
    "timeline timeline timeline";
  gap:0;
  padding:0;
  border:0;
  border-radius:0;
  background:#0b0f14;
  color:var(--ink);
}
.sbc-editor-shell.fullscreen.missing {
  display:flex;
  align-items:center;
  justify-content:center;
}
.sbc-editor-topbar {
  grid-area:top;
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-columns:auto minmax(0, 1fr) auto auto;
  align-items:center;
  gap:14px;
  padding:0 14px;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:#11161d;
}
.sbc-top-return,
.sbc-top-actions button,
.sbc-timeline-toolbar button,
.sbc-viewer-tools button {
  min-width:0;
  border:1px solid rgba(255,255,255,.09);
  border-radius:7px;
  background:rgba(255,255,255,.045);
  color:var(--ink-soft);
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  font-size:12px;
  font-family:var(--font-body);
}
.sbc-top-return {
  min-height:32px;
  padding:0 10px;
}
.sbc-top-return:hover,
.sbc-top-actions button:hover,
.sbc-timeline-toolbar button:hover,
.sbc-viewer-tools button:hover {
  color:var(--ink);
  border-color:color-mix(in oklab, var(--accent) 46%, rgba(255,255,255,.09));
}
.sbc-top-title {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
}
.sbc-top-title span {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink-mute);
  font-size:10px;
}
.sbc-top-title strong {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink);
  font-size:13px;
}
.sbc-top-status {
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:#8fb4ca;
  font-size:11px;
  white-space:nowrap;
}
.sbc-save-dot {
  width:7px;
  height:7px;
  border-radius:999px;
  background:#36d399;
  box-shadow:0 0 0 3px rgba(54,211,153,.12);
}
.sbc-top-actions {
  display:flex;
  align-items:center;
  gap:8px;
}
.sbc-top-actions button {
  min-height:32px;
  padding:0 10px;
}
.sbc-top-actions button.primary {
  border-color:color-mix(in oklab, var(--accent) 66%, rgba(255,255,255,.08));
  background:color-mix(in oklab, var(--accent) 26%, rgba(255,255,255,.04));
  color:var(--ink);
  font-weight:700;
}
.sbc-top-actions button.icon {
  width:32px;
  padding:0;
}
.sbc-editor-left {
  grid-area:left;
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-columns:58px minmax(0, 1fr);
  border-right:1px solid rgba(255,255,255,.08);
  background:#0e1319;
}
.sbc-mode-rail {
  min-width:0;
  min-height:0;
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:4px;
  padding:10px 6px;
  border-right:1px solid rgba(255,255,255,.08);
  background:#0a0e13;
}
.sbc-mode-rail button {
  min-height:48px;
  border:0;
  border-radius:7px;
  background:transparent;
  color:#73899d;
  cursor:pointer;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:4px;
  font-size:10px;
}
.sbc-mode-rail button:hover,
.sbc-mode-rail button.active {
  background:color-mix(in oklab, var(--accent) 15%, transparent);
  color:color-mix(in oklab, var(--accent) 78%, white);
}
.sbc-media-panel {
  min-width:0;
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:10px;
  padding:12px;
}
.sbc-media-head {
  min-height:34px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
}
.sbc-media-head div {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.sbc-media-head span {
  color:var(--ink-mute);
  font-size:10px;
}
.sbc-media-head strong {
  color:var(--ink);
  font-size:14px;
}
.sbc-media-head em {
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  font-style:normal;
  white-space:nowrap;
}
.sbc-media-tabs {
  display:grid;
  grid-template-columns:repeat(3, minmax(0, 1fr));
  gap:5px;
}
.sbc-media-tabs button {
  min-height:28px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:7px;
  background:rgba(255,255,255,.035);
  color:var(--ink-mute);
  cursor:pointer;
  font-size:11px;
}
.sbc-media-tabs button.active,
.sbc-media-tabs button:hover {
  border-color:color-mix(in oklab, var(--accent) 45%, rgba(255,255,255,.08));
  background:color-mix(in oklab, var(--accent) 14%, rgba(255,255,255,.035));
  color:var(--ink);
}
.sbc-media-search {
  min-height:32px;
  display:grid;
  grid-template-columns:18px minmax(0, 1fr);
  align-items:center;
  gap:7px;
  padding:0 9px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:8px;
  background:#0b1016;
  color:var(--ink-mute);
}
.sbc-media-search input {
  min-width:0;
  border:0;
  outline:0;
  background:transparent;
  color:var(--ink);
  font-size:12px;
}
.sbc-media-search input::placeholder {
  color:#6f8395;
}
.sbc-editor-shell.fullscreen .sbc-add-local {
  min-height:32px;
  border-radius:8px;
}
.sbc-linked-script-panel {
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:9px;
  border:1px solid color-mix(in oklab, var(--accent) 28%, rgba(255,255,255,.08));
  border-radius:9px;
  background:color-mix(in oklab, var(--accent) 7%, #0b1016);
}
.sbc-linked-script-head {
  display:flex;
  flex-direction:column;
  gap:3px;
  min-width:0;
}
.sbc-linked-script-head strong {
  color:var(--ink);
  font-size:12px;
}
.sbc-linked-script-head span {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink-mute);
  font-size:10px;
}
.sbc-linked-script-actions {
  display:grid;
  grid-template-columns:repeat(3, minmax(0, 1fr));
  gap:6px;
}
.sbc-linked-script-actions button {
  min-width:0;
  min-height:30px;
  border:1px solid color-mix(in oklab, var(--accent) 42%, rgba(255,255,255,.08));
  border-radius:7px;
  background:rgba(255,255,255,.035);
  color:color-mix(in oklab, var(--accent) 78%, white);
  cursor:pointer;
  font-size:11px;
}
.sbc-linked-script-actions button:hover:not(:disabled) {
  background:color-mix(in oklab, var(--accent) 15%, rgba(255,255,255,.035));
}
.sbc-linked-script-actions button:disabled {
  opacity:.42;
  cursor:not-allowed;
}
.sbc-media-grid {
  flex:1;
  min-height:0;
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  align-content:start;
  gap:8px;
  overflow:auto;
  padding-right:2px;
}
.sbc-media-tile {
  position:relative;
  min-width:0;
  min-height:132px;
  display:flex;
  flex-direction:column;
  gap:7px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:8px;
  background:#121821;
  color:var(--ink-soft);
  cursor:pointer;
  padding:7px;
  text-align:left;
  overflow:hidden;
}
.sbc-media-tile:hover,
.sbc-media-tile.active {
  border-color:color-mix(in oklab, var(--accent) 52%, rgba(255,255,255,.08));
  background:color-mix(in oklab, var(--accent) 11%, #121821);
}
.sbc-media-thumb {
  width:100%;
  aspect-ratio:16 / 10;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.09);
  border-radius:7px;
  background:#05070a;
  color:#7f94a8;
  overflow:hidden;
}
.sbc-media-thumb img,
.sbc-media-thumb video,
.sbc-timeline-thumb video {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.sbc-media-copy {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
}
.sbc-media-copy strong {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink);
  font-size:11px;
}
.sbc-media-copy em {
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:9px;
  font-style:normal;
}
.sbc-media-type {
  position:absolute;
  top:12px;
  left:12px;
  min-height:20px;
  display:inline-flex;
  align-items:center;
  padding:0 6px;
  border-radius:5px;
  background:rgba(3,5,8,.72);
  color:#d8e8f3;
  font-size:10px;
}
.sbc-media-dropzone {
  grid-column:1 / -1;
  min-height:180px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:7px;
  border:1px dashed color-mix(in oklab, var(--accent) 34%, rgba(255,255,255,.08));
  border-radius:10px;
  color:var(--ink-mute);
  background:rgba(255,255,255,.025);
  text-align:center;
}
.sbc-media-dropzone strong {
  color:var(--ink-soft);
  font-size:12px;
}
.sbc-media-dropzone span {
  max-width:180px;
  color:var(--ink-mute);
  font-size:11px;
  line-height:1.4;
}
.sbc-editor-shell.fullscreen .sbc-editor-preview {
  grid-area:preview;
  border:0;
  border-right:1px solid rgba(255,255,255,.08);
  border-radius:0;
  background:#05070a;
}
.sbc-viewer-head {
  min-height:36px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:0 12px;
  border-bottom:1px solid rgba(255,255,255,.07);
  background:#0d1218;
}
.sbc-viewer-head span {
  color:var(--ink-soft);
  font-size:12px;
  font-weight:700;
}
.sbc-viewer-head em {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  font-style:normal;
}
.sbc-editor-shell.fullscreen .sbc-player-frame {
  position:relative;
  background:
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255,255,255,.025) 1px, transparent 1px),
    #030405;
  background-size:36px 36px;
}
.sbc-safe-frame {
  position:absolute;
  width:min(82%, calc(100% - 64px));
  aspect-ratio:16 / 9;
  border:1px dashed rgba(132,170,196,.24);
  pointer-events:none;
}
.sbc-editor-shell.fullscreen .sbc-preview-controls {
  grid-template-columns:34px minmax(0, 1fr) auto auto;
}
.sbc-viewer-tools {
  display:inline-flex;
  align-items:center;
  gap:5px;
}
.sbc-viewer-tools button {
  min-width:28px;
  min-height:26px;
  padding:0 8px;
  font-family:var(--font-mono);
  font-size:10px;
}
.sbc-editor-shell.fullscreen .sbc-editor-params {
  grid-area:params;
  border:0;
  border-radius:0;
  background:#10151c;
  overflow:auto;
}
.sbc-inspector-groups {
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:12px;
}
.sbc-inspector-group {
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:10px;
  border:1px solid rgba(255,255,255,.07);
  border-radius:8px;
  background:rgba(255,255,255,.025);
}
.sbc-inspector-group h3 {
  margin:0;
  color:var(--ink);
  font-size:12px;
}
.sbc-param-field textarea {
  min-height:72px;
  width:100%;
  min-width:0;
  resize:vertical;
  border:1px solid rgba(255,255,255,.1);
  border-radius:8px;
  background:rgba(255,255,255,.045);
  color:var(--ink);
  outline:none;
  padding:8px 9px;
  font-size:12px;
  font-family:var(--font-body);
  line-height:1.45;
}
.sbc-param-field textarea:focus {
  border-color:color-mix(in oklab, var(--accent) 62%, var(--line));
}
.sbc-inspector-groups .sbc-param-actions {
  margin-top:0;
}
.sbc-editor-shell.fullscreen .sbc-editor-timeline {
  grid-area:timeline;
  border:0;
  border-top:1px solid rgba(255,255,255,.08);
  border-radius:0;
  background:#0d1117;
}
.sbc-timeline-toolbar {
  min-height:36px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:0 12px;
  border-bottom:1px solid rgba(255,255,255,.07);
  background:#10151c;
}
.sbc-timeline-toolbar strong {
  color:var(--ink-soft);
  font-size:12px;
}
.sbc-timeline-toolbar span {
  display:flex;
  align-items:center;
  gap:7px;
}
.sbc-timeline-toolbar button {
  min-height:26px;
  padding:0 9px;
}
.sbc-editor-shell.fullscreen .sbc-timeline-ruler {
  min-height:24px;
  display:grid;
  grid-template-columns:repeat(4, minmax(0, 1fr)) auto;
  padding-left:92px;
  background:#0b1016;
}
.sbc-editor-shell.fullscreen .sbc-timeline-ruler span {
  color:#63778a;
  font-family:var(--font-mono);
  font-size:10px;
  font-weight:500;
}
.sbc-track-stack {
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
  overflow:auto;
}
.sbc-track-row {
  min-height:52px;
  display:grid;
  grid-template-columns:92px minmax(0, 1fr);
  border-bottom:1px solid rgba(255,255,255,.06);
}
.sbc-track-head {
  min-width:0;
  display:flex;
  align-items:center;
  gap:7px;
  padding:0 12px;
  border-right:1px solid rgba(255,255,255,.07);
  color:#7f94a8;
}
.sbc-track-head strong {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--ink-soft);
  font-size:11px;
}
.sbc-track-lane {
  min-width:0;
  display:flex;
  align-items:center;
  gap:8px;
  overflow:auto;
  padding:6px 10px;
  background:
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px),
    rgba(255,255,255,.01);
  background-size:92px 100%;
}
.sbc-editor-shell.fullscreen .sbc-timeline-clip {
  width:178px;
  flex:0 0 178px;
  min-height:40px;
  display:grid;
  grid-template-columns:minmax(0, 1fr) 46px;
  align-items:stretch;
  gap:6px;
  padding:5px;
  border-radius:7px;
  background:#17202b;
}
.sbc-track-empty {
  min-height:32px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0 18px;
  border:1px dashed rgba(255,255,255,.08);
  border-radius:7px;
  color:#63778a;
  font-size:11px;
}
.sbc-editor-shell.fullscreen .sbc-timeline-actions {
  grid-template-columns:1fr;
}
.sbc-editor-shell.fullscreen .sbc-timeline-actions button {
  height:18px;
}
@media (max-width: 1180px) {
  .sbc-editor-shell.fullscreen {
    grid-template-columns:300px minmax(360px, 1fr);
    grid-template-rows:56px minmax(0, 1fr) 228px 214px;
    grid-template-areas:
      "top top"
      "left preview"
      "params params"
      "timeline timeline";
  }
  .sbc-editor-shell.fullscreen .sbc-editor-params {
    border-top:1px solid rgba(255,255,255,.08);
  }
  .sbc-inspector-groups {
    display:grid;
    grid-template-columns:repeat(3, minmax(0, 1fr));
  }
  .sbc-inspector-groups .sbc-param-actions {
    grid-column:1 / -1;
  }
}
@media (max-width: 760px) {
  .sbc-editor-shell.fullscreen {
    grid-template-columns:1fr;
    grid-template-rows:72px 280px minmax(260px, 1fr) 250px 220px;
    grid-template-areas:
      "top"
      "left"
      "preview"
      "params"
      "timeline";
  }
  .sbc-editor-topbar {
    grid-template-columns:auto minmax(0, 1fr) auto;
    gap:8px;
  }
  .sbc-top-status {
    display:none;
  }
  .sbc-top-actions button:not(.primary):not(.icon) {
    display:none;
  }
  .sbc-editor-left {
    border-right:0;
    border-bottom:1px solid rgba(255,255,255,.08);
  }
  .sbc-media-grid {
    grid-template-columns:repeat(3, minmax(0, 1fr));
  }
}

/* ─── Seedence portrait library modal ─── */
.seedence-portrait-modal {
  width:min(760px,calc(100vw - 40px));
  max-height:calc(100vh - 56px);
}
.seedence-portrait-modal .body {
  overflow:auto;
  background:var(--bg);
}
.seedence-portrait-input {
  display:none;
}
.seedence-portrait-shell {
  display:flex;
  flex-direction:column;
  gap:14px;
  padding:18px 22px 22px;
}
.seedence-portrait-intro {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:14px;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:var(--paper);
}
.seedence-portrait-badge {
  display:inline-flex;
  align-items:center;
  gap:6px;
  width:max-content;
  max-width:100%;
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
  letter-spacing:.08em;
  text-transform:uppercase;
}
.seedence-portrait-intro strong {
  color:var(--ink);
  font-size:15px;
}
.seedence-portrait-intro p {
  margin:0;
  color:var(--ink-soft);
  font-size:12px;
  line-height:1.55;
}
.seedence-portrait-intro code {
  font-family:var(--font-mono);
  color:var(--ink);
}
.seedence-portrait-error {
  padding:10px 12px;
  border:1px solid rgba(239,68,68,.32);
  border-radius:8px;
  background:rgba(239,68,68,.1);
  color:#fecaca;
  font-size:12px;
}
.seedence-portrait-list {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(190px,1fr));
  gap:12px;
}
.seedence-portrait-card {
  position:relative;
  min-width:0;
  display:grid;
  grid-template-columns:86px minmax(0,1fr) auto;
  align-items:center;
  gap:10px;
  padding:10px;
  border:1px solid var(--line-soft);
  border-radius:8px;
  background:var(--paper);
}
.seedence-portrait-card.pickable {
  cursor:pointer;
}
.seedence-portrait-card.pickable:hover {
  border-color:var(--accent);
  background:color-mix(in oklab, var(--accent) 10%, var(--paper));
}
.seedence-portrait-card-actions {
  display:flex;
  align-items:flex-start;
  justify-content:flex-end;
  align-self:stretch;
}
.seedence-portrait-delete {
  display:inline-flex;
  align-items:center;
  gap:4px;
  min-height:24px;
  padding:3px 7px;
  border:1px solid rgba(239,68,68,.22);
  border-radius:7px;
  background:rgba(239,68,68,.08);
  color:#fecaca;
  cursor:pointer;
  font-size:11px;
}
.seedence-portrait-delete:hover {
  border-color:rgba(239,68,68,.46);
  background:rgba(239,68,68,.16);
}
.seedence-portrait-delete:disabled {
  cursor:not-allowed;
  opacity:.62;
}
.seedence-portrait-thumb {
  position:relative;
  width:100%;
  aspect-ratio:1/1;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border:1px solid var(--line-soft);
  border-radius:7px;
  background:#05070a;
  color:var(--ink-mute);
}
.seedence-portrait-select {
  position:absolute;
  top:6px;
  left:6px;
  z-index:2;
  width:22px;
  height:22px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.18);
  border-radius:6px;
  background:rgba(3,5,8,.66);
  cursor:pointer;
}
.seedence-portrait-select input {
  width:14px;
  height:14px;
  margin:0;
  accent-color:var(--accent);
  cursor:pointer;
}
.seedence-portrait-select:has(input:checked) {
  border-color:color-mix(in oklab, var(--accent) 64%, white);
  background:color-mix(in oklab, var(--accent) 34%, rgba(3,5,8,.72));
}
.seedence-portrait-select:has(input:disabled) {
  cursor:not-allowed;
  opacity:.55;
}
.seedence-portrait-thumb img {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.seedence-portrait-meta {
  min-width:0;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:5px;
}
.seedence-portrait-meta strong,
.seedence-portrait-meta span {
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.seedence-portrait-meta strong {
  color:var(--ink);
  font-size:13px;
}
.seedence-portrait-meta span {
  color:var(--ink-mute);
  font-family:var(--font-mono);
  font-size:10px;
}
.seedence-portrait-empty {
  grid-column:1 / -1;
  min-height:170px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:7px;
  padding:20px;
  border:1px dashed var(--line);
  border-radius:8px;
  color:var(--ink-mute);
  text-align:center;
}
.seedence-portrait-empty strong {
  color:var(--ink-soft);
  font-size:13px;
}
.seedence-portrait-empty span {
  max-width:320px;
  font-size:12px;
  line-height:1.45;
}
`;
