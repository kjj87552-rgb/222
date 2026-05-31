/* Style preset strip — horizontal scrolling cards shown under the Generator */
import React from 'react';
import { STYLE_PRESETS } from '../../shared/data/presets.js';

export function StylePresets({ activeId, onSelect }) {
  return (
    <div className="style-presets">
      {STYLE_PRESETS.map(s => (
        <div
          key={s.id}
          className={`sp-card ${activeId === s.id ? "active" : ""}`}
          onClick={() => onSelect?.(s.id)}
        >
          <div className="th">{s.tag}</div>
          <div className="n">{s.name}</div>
        </div>
      ))}
    </div>
  );
}
