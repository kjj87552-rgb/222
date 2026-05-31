import React from 'react';
import { IStar, IArrow } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';

const MB_TIERS = [
  { k: "pro", h: "专业版", price: "639", old: "948", monthly: "1800", featured: false, ribbon: "9折",
    feats: ["每月 1800 积分", "10 个高清节点", "云端储存 30GB", "标准生成速度"] },
  { k: "team", h: "大师版", price: "1299", old: "1899", monthly: "5400", featured: true, ribbon: "推荐",
    feats: ["每月 5400 积分", "无限节点", "云端储存 100GB", "优先生成队列", "20+ 风格模板"] },
  { k: "flag", h: "旗舰版", price: "2999", old: "4754", monthly: "14000", featured: false, ribbon: "热卖",
    feats: ["每月 14000 积分", "全模型权限", "云端储存 300GB", "极速生成", "全部风格模板", "API 接入"] },
  { k: "gold", h: "尊享版", price: "6599", old: "10788", monthly: "34000", featured: false, ribbon: "尊享", isGold: true,
    feats: ["每月 34000 积分", "全功能解锁", "无限存储", "尊享专员", "线下交付服务"] },
];
const MB_CREDITS = [
  { amt: "1,000",  cost: "￥9.9" },
  { amt: "5,000",  cost: "￥49" },
  { amt: "12,000", cost: "￥99",  bonus: "送 2,000" },
  { amt: "30,000", cost: "￥229", bonus: "送 8,000" },
];

export function MemberModal() {
  const onClose = uiActions.closeTopModal;
  const [tab, setTab] = React.useState("pkg");
  const [bill, setBill] = React.useState("year");
  return (
    <XModal title="会员中心" icon={<IStar size={16}/>} onClose={onClose} className="mb-modal">
      <div className="mb-banner">
        <span style={{ background: "var(--accent-2, #FF6B6B)", color: "#fff", padding: "2px 8px", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 10 }}>限时 9 折</span>
        <span>漫创AI 创作权益已上线，年卡套餐赠送额外生成积分</span>
        <span className="countdown">距活动结束 <span>02</span> : <span>12</span> : <span>26</span></span>
      </div>
      <div className="mb-tabs">
        <button className={`mb-tab ${tab==="pkg"?"active":""}`} onClick={() => setTab("pkg")}>会员套餐</button>
        <button className={`mb-tab ${tab==="cr"?"active":""}`} onClick={() => setTab("cr")}>积分包</button>
        <button className={`mb-tab ${tab==="biz"?"active":""}`} onClick={() => setTab("biz")}>企业版</button>
      </div>
      {tab !== "cr" && (
        <div style={{ display: "inline-flex", padding: 3, background: "var(--paper-2)", borderRadius: 8, marginBottom: 16 }}>
          <button onClick={() => setBill("year")} style={{ padding: "5px 14px", border: "none", borderRadius: 6, background: bill==="year"?"var(--ink)":"transparent", color: bill==="year"?"var(--paper)":"var(--ink-soft)", cursor: "pointer", fontSize: 12 }}>包年（9 折）</button>
          <button onClick={() => setBill("mon")} style={{ padding: "5px 14px", border: "none", borderRadius: 6, background: bill==="mon"?"var(--ink)":"transparent", color: bill==="mon"?"var(--paper)":"var(--ink-soft)", cursor: "pointer", fontSize: 12 }}>包月</button>
        </div>
      )}
      {tab === "pkg" && (
        <div className="mb-cards">
          {MB_TIERS.map(t => (
            <div key={t.k} className={`mb-card ${t.featured?"featured":""} ${t.isGold?"gold":""}`}>
              <span className="ribbon">{t.ribbon}</span>
              <h3>{t.h}</h3>
              <div className="price">
                <span className="num">￥{t.price}</span>
                <span className="old">￥{t.old}</span>
              </div>
              <div className="unit">/ 年（含 12 个月，赠 1 个月）</div>
              <button className="buy">立即开通</button>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}>每月 {t.monthly} 积分</div>
              <ul>
                {t.feats.map((f, i) => (
                  <li key={i}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12l5 5L20 6"/></svg> {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {tab === "cr" && (
        <>
          <p style={{ color: "var(--ink-mute)", fontSize: 12, margin: "6px 0 14px" }}>积分用于消耗模型算力，不与会员套餐冲突。会员套餐内的积分先用，溢出部分使用积分包。</p>
          <div className="mb-credits">
            {MB_CREDITS.map((c, i) => (
              <div key={i} className="mb-credit-pack">
                <div className="amt">{c.amt}</div>
                <div className="cost">{c.cost}</div>
                {c.bonus && <div style={{ marginTop: 6, fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{c.bonus}</div>}
                <button className="x-btn primary" style={{ width: "100%", marginTop: 12 }}><IArrow size={11}/>立即购买</button>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "biz" && (
        <div style={{ padding: "32px 22px", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--ink)", marginBottom: 8 }}>企业版定制方案</div>
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 16 }}>API 接入、私有部署、专属客户成功经理</div>
          <button className="x-btn primary"><IArrow size={11}/>联系销售</button>
        </div>
      )}
    </XModal>
  );
}
