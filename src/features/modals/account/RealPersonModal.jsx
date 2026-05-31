import React from 'react';
import { IKey, IArrow, ICheck, IClose, IAdd, IChevR } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { FakeQR } from '../shared/FakeQR.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

export function RealPersonModal() {
  const onClose = uiActions.closeOverlayModal;
  const [step, setStep] = React.useState(1);
  const [seconds, setSeconds] = React.useState(120);

  React.useEffect(() => {
    if (step !== 1) return;
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  return (
    <XModal title="真人人像授权" icon={<IKey size={16}/>} onClose={onClose} className="rp-modal">
      <div className="steps">
        {[1,2,3].map((n, i) => (
          <React.Fragment key={n}>
            <span className={`step ${step >= n ? "active" : ""}`}>
              <span className="num">{n}</span>
              {["扫码登录","活体检测","上传妆造"][i]}
            </span>
            {n < 3 && <span className="arr"><IChevR size={12}/></span>}
          </React.Fragment>
        ))}
      </div>
      {step === 1 && (
        <>
          <h3>扫码完成真人识别</h3>
          <p>请使用真人本人的手机扫描下方二维码，按提示完成活体检测与肖像授权。</p>
          <div className="qrbox">
            <FakeQR size={200}/>
          </div>
          <p style={{ color: "var(--accent)", fontWeight: 600 }}>等待扫码...</p>
          <p className="timer">二维码 {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")} 后失效</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
            <button className="x-btn ghost" onClick={onClose}>取消</button>
            <button className="x-btn ghost" onClick={() => { setSeconds(120); }}>刷新二维码</button>
            <button className="x-btn primary" onClick={() => setStep(2)}><IArrow size={11}/>已完成扫码</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h3>活体检测中...</h3>
          <p>请保持光线充足，按提示完成 3 个表情动作。</p>
          <div className="qrbox" style={{ background: "linear-gradient(160deg, #001624 0%, #000 100%)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <div className="spin" style={{ width: 40, height: 40, borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)", borderTopColor: "var(--accent)" }}/>
              </div>
              <p style={{ margin: 0, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>请眨眼 →</p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="x-btn primary" onClick={() => setStep(3)}>模拟通过 → 上传妆造</button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <h3>上传妆造 / 三视图</h3>
          <p>授权完成后，请把当前真人的不同妆造或三视图上传到此文件夹，便于后续视频生成调用。</p>
          <div className="sc-uploaded" style={{ justifyContent: "center", marginTop: 18 }}>
            {[100,101,102].map(i => (
              <div key={i} className="pic" style={{ backgroundImage: `url(${DEMO_IMG(i, 200, 200)})`, width: 100, height: 100 }}>
                <span className="x"><IClose size={10}/></span>
              </div>
            ))}
            <div className="add" style={{ width: 100, height: 100 }}><IAdd size={26}/></div>
          </div>
          <div style={{ marginTop: 22 }}>
            <button className="x-btn primary" onClick={onClose}><ICheck size={12}/>完成授权流程</button>
          </div>
        </>
      )}
    </XModal>
  );
}
