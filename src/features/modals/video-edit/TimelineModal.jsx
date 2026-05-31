import React from 'react';
import { IClose, ICut, ISparkle, IMic, IPlay, IPause, IGear } from '../../../shared/ui/icons/index.jsx';
import { ToolModal } from '../shared/ToolModal.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

/* ─────────────────────────────────────────────────
 * TIMELINE MODAL — video compose editor (085–090)
 * ───────────────────────────────────────────────── */
export function TimelineModal({ tracks, onClose }) {
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(8.5);
  const [showParams, setShowParams] = React.useState(false);
  const [fps, setFps] = React.useState("30");
  const [res, setRes] = React.useState("720P");

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTime(t => (t > 20 ? 0 : t + 0.1)), 100);
    return () => clearInterval(id);
  }, [playing]);

  const clips = tracks?.video || [
    { id: 1, start: 0, end: 3.5, src: DEMO_IMG(301, 160, 90), name: "视频节点 1" },
    { id: 2, start: 3.5, end: 7, src: DEMO_IMG(302, 160, 90), name: "视频节点 4" },
    { id: 3, start: 7, end: 12, src: DEMO_IMG(303, 160, 90), name: "视频节点 7 00:00:05:01" },
    { id: 4, start: 12, end: 17, src: DEMO_IMG(304, 160, 90), name: "视频节点 8" },
  ];

  const pxPerSec = 48;
  const playheadX = time * pxPerSec + 8;
  const previewClip = clips.find(c => time >= c.start && time < c.end) || clips[0];

  const tb = (
    <div className="tm-toolbar">
      <button className="close-btn" onClick={onClose}><IClose size={16}/></button>
      <span className="sep"/>
      <button className="active"><ICut size={15}/><span className="tip">视频合成</span></button>
      <button><ISparkle size={15}/><span className="tip">转场</span></button>
      <button><IMic size={15}/><span className="tip">配音</span></button>
    </div>
  );

  return (
    <ToolModal onClose={onClose} toolbar={tb}>
      <div className="tool-modal tl-modal" style={{position:"absolute", inset:0, width:"100%", height:"100%"}}>
        <div className="tm-stage" style={{flex:1, display:"flex", flexDirection:"column"}}>
          <div className="tl-preview">
            <div className="fake-video" style={{backgroundImage:`url(${previewClip.src.replace(/\/160\/90/, "/1280/720")})`}}/>
            <div className="play-overlay">
              {!playing && <div className="disc"><IPlay size={24}/></div>}
            </div>
          </div>
          <div className="tl-controls">
            <button className="play" onClick={() => setPlaying(p => !p)}>
              {playing ? <IPause size={14}/> : <IPlay size={14}/>}
            </button>
            <span>{String(Math.floor(time/60)).padStart(2,"0")}:{String(Math.floor(time%60)).padStart(2,"0")}</span>
            <span style={{color:"var(--ink-mute)"}}>/ 00:17</span>
            <button className="params-btn" onClick={() => setShowParams(v => !v)}>
              <IGear size={12}/>视频参数
            </button>
            <button className="synth">
              <ISparkle size={13}/>合成
              <span className="free-pill">限免</span>
            </button>
          </div>

          {showParams && (
            <div className="tl-params-pop">
              <h4>视频参数</h4>
              <div className="row">
                <label>帧率</label>
                <span className="val">{fps} 帧/秒</span>
              </div>
              <div className="row">
                <label>分辨率</label>
                <select value={res} onChange={e => setRes(e.target.value)}>
                  {["480P", "720P", "1080P", "2K", "4K"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="tl-tracks">
            <div className="tl-ruler">
              {Array.from({length: 18}, (_, i) => <span key={i}>00:{String(i+5).padStart(2,"0")}</span>)}
            </div>
            <div className="tl-playhead" style={{left: playheadX}}/>

            <div className="tl-track" style={{paddingLeft: 60}}>
              <span className="label">V1</span>
              {clips.map(c => (
                <div key={c.id} className="tl-clip" style={{
                  width: (c.end - c.start) * pxPerSec,
                  marginLeft: c === clips[0] ? 8 : 0,
                }}>
                  <img src={c.src}/>
                  <span className="clip-name">{c.name}</span>
                </div>
              ))}
            </div>
            <div className="tl-track" style={{paddingLeft: 60}}>
              <span className="label">A1</span>
              <div className="tl-clip audio" style={{width: 17 * pxPerSec, marginLeft: 8}}>
                {Array.from({length: 80}, (_, i) => (
                  <span key={i} style={{height: `${20 + Math.abs(Math.sin(i*0.7))*60}%`}}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolModal>
  );
}
