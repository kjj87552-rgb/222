import React from 'react';
import { ISparkle, ICheck, IFolder, IAdd } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

const CP_ASSETS = [
  { src: DEMO_IMG(110, 240, 240), n: "图片 22", st: "ok"   },
  { src: DEMO_IMG(111, 240, 240), n: "图片 23", st: "ok"   },
  { src: DEMO_IMG(112, 240, 240), n: "图片 24", st: "ok"   },
  { src: DEMO_IMG(113, 240, 240), n: "图片 25", st: "ok"   },
  { src: DEMO_IMG(100, 240, 240), n: "图片 26", st: "wait" },
  { src: DEMO_IMG(101, 240, 240), n: "图片 27", st: "wait" },
  { src: DEMO_IMG(102, 240, 240), n: "图片 28", st: "fail" },
  { src: DEMO_IMG(103, 240, 240), n: "图片 29", st: "ok"   },
];

export function ComplianceModal() {
  const onClose = uiActions.closeOverlayModal;
  const [tab, setTab] = React.useState("img");
  return (
    <XModal title="合规素材库" icon={<ISparkle size={16}/>} onClose={onClose} className="cp-modal"
      footer={<>
        <span className="x-credit"><ISparkle size={11}/>校验消耗：每个素材 1 算力</span>
        <span style={{ flex: 1 }}/>
        <button className="x-btn ghost"><IFolder size={12}/>从历史图库添加</button>
        <button className="x-btn primary"><ICheck size={12}/>开始批量核验</button>
      </>}
    >
      <div className="cp-banner">
        <div className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg></div>
        <div>
          <h4>素材内容已合规，可用于后续生成流程</h4>
          <p>添加图片、视频、音频后将自动核验是否符合真人/版权/敏感内容规范。可用素材将获得 <span style={{ color: "var(--accent)", fontWeight: 600 }}>已合规</span> 标识。</p>
        </div>
      </div>
      <div className="sb-tabs" style={{ padding: 0, border: "none" }}>
        {[["pers","真人人像", true],["img","图片"],["video","视频"],["audio","音频"]].map(([k,l,n]) => (
          <button key={k} className={`sb-tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>
            {l}{n && <span className="new-pill">NEW</span>}
          </button>
        ))}
      </div>
      <div className="cp-grid">
        <div className="cp-item" style={{ background: "var(--paper-2)", display: "flex", alignItems: "center", justifyContent: "center", borderStyle: "dashed", color: "var(--ink-mute)" }}>
          <div style={{ textAlign: "center" }}>
            <IAdd size={28}/>
            <div style={{ fontSize: 11, marginTop: 6 }}>本地上传 / 历史</div>
            <div style={{ fontSize: 10, color: "var(--ink-mute)", marginTop: 2 }}>≤ 30 M / 张</div>
          </div>
        </div>
        {CP_ASSETS.map((a, i) => (
          <div key={i} className="cp-item" style={{ backgroundImage: `url(${a.src})` }}>
            <span className={`badge ${a.st==="ok"?"ok":a.st==="fail"?"fail":""}`}>
              {a.st==="ok" && <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12l5 5L20 6"/></svg>已合规</>}
              {a.st==="wait" && "待核验"}
              {a.st==="fail" && "未通过"}
            </span>
            <div className="lbl">{a.n}</div>
          </div>
        ))}
      </div>
    </XModal>
  );
}
