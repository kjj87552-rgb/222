import React from 'react';
import { IMic, ISparkle, ICheck } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';

const VOICE_PRESETS = [
  { k: "warm-male",   n: "沉稳男声",  d: "中低音磁性",   ic: <IMic size={18}/> },
  { k: "warm-fem",    n: "温柔女声",  d: "气声轻盈",     ic: <IMic size={18}/> },
  { k: "energetic",   n: "活力少女",  d: "高音明亮",     ic: <IMic size={18}/> },
  { k: "narrator",    n: "电影旁白",  d: "深沉戏剧化",   ic: <IMic size={18}/> },
  { k: "kid",         n: "童声",      d: "可爱稚嫩",     ic: <IMic size={18}/> },
  { k: "elder",       n: "老者",      d: "苍老沉稳",     ic: <IMic size={18}/> },
  { k: "robot",       n: "机器人",    d: "电子合成",     ic: <IMic size={18}/> },
  { k: "anime",       n: "二次元",    d: "动漫角色音",   ic: <IMic size={18}/> },
];

export function VoiceChangeModal({ onClose, onApply }) {
  const [pick, setPick] = React.useState("warm-fem");
  const [pitch, setPitch] = React.useState(0);
  const [speed, setSpeed] = React.useState(100);
  return (
    <XModal title="变声 · Voice Change" icon={<IMic size={16}/>} onClose={onClose}
      className="vch-modal"
      footer={<>
        <span className="x-credit"><ISparkle size={11}/>消耗 3 算力</span>
        <span style={{ flex: 1 }}/>
        <button className="x-btn ghost" onClick={onClose}>取消</button>
        <button className="x-btn primary" onClick={() => { onApply?.({ voice: pick, pitch, speed }); onClose(); }}>
          <ICheck size={12}/>应用变声
        </button>
      </>}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>选择音色</h3>
      <div className="vch-grid">
        {VOICE_PRESETS.map(v => (
          <div key={v.k} className={`vch-card ${pick===v.k?"active":""}`} onClick={() => setPick(v.k)}>
            <div className="ic">{v.ic}</div>
            <div className="n">{v.n}</div>
            <div className="d">{v.d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <h3 style={{ margin: "0 0 6px", fontSize: 12, color: "var(--ink-mute)" }}>音调（半音）</h3>
          <input type="range" min="-12" max="12" value={pitch} onChange={e => setPitch(+e.target.value)} style={{ width: "100%", accentColor: "var(--accent)" }}/>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-soft)", textAlign: "right" }}>{pitch > 0 ? "+" : ""}{pitch}</div>
        </div>
        <div>
          <h3 style={{ margin: "0 0 6px", fontSize: 12, color: "var(--ink-mute)" }}>语速</h3>
          <input type="range" min="50" max="200" value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width: "100%", accentColor: "var(--accent)" }}/>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-soft)", textAlign: "right" }}>{speed}%</div>
        </div>
      </div>
    </XModal>
  );
}
