import React from 'react';
import { IFilm, ISparkle, ICopy, IScript, IPlay, IText, ICamera, IGear, IImage, IAudio, IMic } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

const VP_SHOTS = [
  { n: 1, t: "00:00 – 00:03", desc: "黎明的街道，少女站在书店外的玻璃门前", scale: "中景", img: DEMO_IMG(401, 480, 270),
    prompt: "黎明城市街道，少女站在旧书店玻璃门前，逆光，胶片质感，冷暖对比",
    move: "缓推 + 微跟焦", music: "环境氛围乐, BPM 78, 大提琴", voice: "无", duration: "3.2s" },
  { n: 2, t: "00:03 – 00:07", desc: "她推开门，铃铛轻响，光线洒进店内", scale: "中近景", img: DEMO_IMG(402, 480, 270),
    prompt: "推门动作，铃铛声响，逆光洒入室内，灰尘漂浮",
    move: "跟随推进", music: "渐强弦乐", voice: "门铃 + 脚步声", duration: "4.1s" },
  { n: 3, t: "00:07 – 00:10", desc: "指尖沿着书脊缓缓滑过", scale: "特写", img: DEMO_IMG(403, 480, 270),
    prompt: "指尖与书脊接触特写，浅景深，柔光",
    move: "微距静止", music: "纯钢琴", voice: "翻页声", duration: "3.0s" },
  { n: 4, t: "00:10 – 00:14", desc: "拿起一本旧诗集，靠窗坐下", scale: "全景 → 中景", img: DEMO_IMG(404, 480, 270),
    prompt: "靠窗座位，光线从右侧投入，少女低头翻书",
    move: "拉远 + 平移", music: "弦乐渐入", voice: "环境噪声", duration: "4.0s" },
];

export function VideoParseModal({ src }) {
  const onClose = uiActions.closeOverlayModal;
  const [active, setActive] = React.useState(0);
  const cur = VP_SHOTS[active];
  return (
    <XModal title="视频解析 · 分镜分析" icon={<IFilm size={16}/>} onClose={onClose}
      className="vp-modal"
      footer={<>
        <span className="x-credit"><ISparkle size={11}/>已耗 4 算力 · 共 4 个镜头</span>
        <span style={{ flex: 1 }}/>
        <button className="x-btn ghost"><ICopy size={12}/>导出脚本</button>
        <button className="x-btn primary"><IScript size={12}/>转为分镜节点</button>
      </>}
    >
      <div className="vp-thumbs">
        {VP_SHOTS.map((s, i) => (
          <div key={s.n} className={`vp-thumb ${active===i?"active":""}`} onClick={() => setActive(i)}>
            <div className="pic" style={{ backgroundImage: `url(${s.img})` }}/>
            <div className="info">
              <div className="t">镜头 {String(s.n).padStart(2, "0")} · {s.t}</div>
              <div className="desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="vp-detail">
        <div className="preview" style={{ backgroundImage: `url(${cur.img.replace(/480.270/, "1280/720")})` }}>
          <div className="play-disc"><IPlay size={20}/></div>
        </div>
        <div className="vp-fields">
          <div className="vp-field full">
            <label><IText size={11}/>画面内容</label>
            <div className="v">{cur.desc}</div>
          </div>
          <div className="vp-field">
            <label><ICamera size={11}/>景别</label>
            <div className="v">{cur.scale}</div>
          </div>
          <div className="vp-field">
            <label><IGear size={11}/>时长</label>
            <div className="v">{cur.duration}</div>
          </div>
          <div className="vp-field full">
            <label><IImage size={11}/>图像提示词</label>
            <div className="v" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{cur.prompt}</div>
          </div>
          <div className="vp-field full">
            <label><IFilm size={11}/>运镜提示词</label>
            <div className="v" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{cur.move}</div>
          </div>
          <div className="vp-field">
            <label><IAudio size={11}/>音乐</label>
            <div className="v">{cur.music}</div>
          </div>
          <div className="vp-field">
            <label><IMic size={11}/>人声/声效</label>
            <div className="v">{cur.voice}</div>
          </div>
        </div>
      </div>
    </XModal>
  );
}
