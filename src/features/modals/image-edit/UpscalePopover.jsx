import React from 'react';
import { ISparkle, IArrow } from '../../../shared/ui/icons/index.jsx';

/* ─────────────────────────────────────────────────
 * UPSCALE POPOVER (figure 080)
 * ───────────────────────────────────────────────── */
export function UpscalePopover({ kind = "video", onClose, onApply, anchor }) {
  const [model, setModel] = React.useState("Topazlabs");
  const [res, setRes] = React.useState("1080P");
  const [slow, setSlow] = React.useState("1x");
  return (
    <div className="tool-modal-mask" onPointerDown={(e) => { if (e.target.classList.contains("tool-modal-mask")) onClose(); }}>
      <div className="upscale-pop" onPointerDown={(e) => e.stopPropagation()}>
        <h3>{kind === "video" ? "视频高清" : "图像高清"}</h3>
        <div className="row">
          <label>模型选择</label>
          <select value={model} onChange={e => setModel(e.target.value)}>
            <option>Topazlabs</option>
            <option>RealESRGAN</option>
            <option>GFPGAN</option>
          </select>
        </div>
        <div className="row">
          <label>分辨率</label>
          <div className="seg">
            {["1080P", "2K", "4K"].map(r => (
              <button key={r} className={res===r?"active":""} onClick={() => setRes(r)}>{r}</button>
            ))}
          </div>
        </div>
        {kind === "video" && (
          <div className="row">
            <label>减速强度</label>
            <select value={slow} onChange={e => setSlow(e.target.value)}>
              {["1x", "2x", "4x", "8x"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="footer">
          <span className="credit"><ISparkle size={10}/> {kind==="video"?"36":"8"}</span>
          <button className="go" onClick={() => onApply?.({model, res, slow})}>
            <IArrow size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}
