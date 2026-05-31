/* Slash-command dropdown — rendered inside the Generator prompt area */
import React from 'react';
import { SLASH_COMMANDS } from '../../shared/data/presets.js';

export function SlashMenu({ onSelect }) {
  return (
    <div className="slash-menu">
      {SLASH_COMMANDS.map(s => (
        <div key={s.k} className="slash-item" onClick={() => onSelect?.(s.k)}>
          <span className="k">{s.k}</span>
          <span className="d">{s.d}</span>
        </div>
      ))}
    </div>
  );
}
