import React from 'react';
import { IGear, ISparkle, IFolder, IText, IImage, IKey } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';

const AC_NAV = [
  { k: "info",     ic: <IGear size={14}/>,    lbl: "账号信息" },
  { k: "credit",   ic: <ISparkle size={14}/>, lbl: "积分明细" },
  { k: "buy",      ic: <IFolder size={14}/>,  lbl: "购买记录" },
  { k: "invoice",  ic: <IText size={14}/>,    lbl: "开票管理" },
  { k: "watermark",ic: <IImage size={14}/>,   lbl: "水印设置" },
  { k: "secure",   ic: <IKey size={14}/>,     lbl: "安全设置" },
];

export function AccountModal() {
  const onClose = uiActions.closeTopModal;
  const [k, setK] = React.useState("info");
  return (
    <XModal title="账号设置" icon={<IGear size={16}/>} onClose={onClose} className="ac-modal">
      <div className="ac-side">
        {AC_NAV.map(n => (
          <div key={n.k} className={`item ${k===n.k?"active":""}`} onClick={() => setK(n.k)}>
            {n.ic}{n.lbl}
          </div>
        ))}
      </div>
      <div className="ac-pane">
        {k === "info" && (
          <>
            <div className="ac-profile">
              <div className="avi">慢</div>
              <div className="info">
                <div className="name">漫创AI创作者</div>
                <div className="id">ID: MC_2026_184392</div>
              </div>
            </div>
            <div className="ac-stats">
              <div className="ac-stat"><div className="l">会员等级</div><div className="v">大师版</div></div>
              <div className="ac-stat"><div className="l">积分余额</div><div className="v">12,023</div></div>
              <div className="ac-stat"><div className="l">有效期</div><div className="v" style={{ fontSize: 16 }}>2027-04-25</div></div>
            </div>
            <h3>资料</h3>
            <div className="ac-row"><span className="key">昵称</span><span className="val">漫创AI创作者 <button className="x-btn ghost">编辑</button></span></div>
            <div className="ac-row"><span className="key">邮箱</span><span className="val">creator@manchuang.ai</span></div>
            <div className="ac-row"><span className="key">手机号</span><span className="val">+86 188 ****  6789</span></div>
            <div className="ac-row"><span className="key">绑定账号</span><span className="val">微信 · 飞书</span></div>
          </>
        )}
        {k === "credit" && (
          <>
            <h3>积分余额 <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>12,023</span></h3>
            <div className="ac-row"><span className="key">04-24 14:32</span><span className="val">Chat 生成 · 后端模型 <span style={{ color: "var(--accent-2, #FF6B6B)" }}>-2</span></span></div>
            <div className="ac-row"><span className="key">04-24 11:14</span><span className="val">图像生成 · 后端模型 <span style={{ color: "var(--accent-2, #FF6B6B)" }}>-3</span></span></div>
            <div className="ac-row"><span className="key">04-24 09:00</span><span className="val">每月续期 <span style={{ color: "var(--accent)" }}>+5,400</span></span></div>
            <div className="ac-row"><span className="key">04-23 22:46</span><span className="val">主体训练 <span style={{ color: "var(--accent-2, #FF6B6B)" }}>-16</span></span></div>
          </>
        )}
        {k === "watermark" && (
          <>
            <h3>水印</h3>
            <div className="ac-row">
              <span className="key">输出水印</span>
              <span className="val">
                <div style={{ width: 32, height: 18, borderRadius: 10, background: "var(--accent)", border: "1px solid var(--line)", position: "relative" }}>
                  <div style={{ position: "absolute", top: 1, left: 15, width: 14, height: 14, borderRadius: "50%", background: "#fff" }}/>
                </div>
              </span>
            </div>
            <div className="ac-row"><span className="key">水印样式</span><span className="val">漫创AI <button className="x-btn ghost">更换</button></span></div>
            <div className="ac-row"><span className="key">水印位置</span><span className="val">右下角</span></div>
          </>
        )}
        {k === "buy" && <p style={{ color: "var(--ink-mute)", fontSize: 12 }}>暂无购买记录</p>}
        {k === "invoice" && <p style={{ color: "var(--ink-mute)", fontSize: 12 }}>添加开票主体后可申请发票</p>}
        {k === "secure" && (
          <>
            <h3>安全</h3>
            <div className="ac-row"><span className="key">登录密码</span><span className="val"><button className="x-btn ghost">修改</button></span></div>
            <div className="ac-row"><span className="key">两步验证</span><span className="val">已开启</span></div>
            <div className="ac-row"><span className="key">登录设备</span><span className="val">2 台 <button className="x-btn ghost">查看</button></span></div>
          </>
        )}
      </div>
    </XModal>
  );
}
