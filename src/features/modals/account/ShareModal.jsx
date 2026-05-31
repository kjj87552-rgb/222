import React from 'react';
import { IShare, ISearch, ISparkle } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

export function ShareModal() {
  const onClose = uiActions.closeTopModal;
  const [tab, setTab] = React.useState("link");
  const [perm, setPerm] = React.useState("view");
  return (
    <XModal title="分享与发布" icon={<IShare size={16}/>} onClose={onClose} className="sh-modal">
      <div className="sh-tabs">
        <button className={`sh-tab ${tab==="link"?"active":""}`} onClick={() => setTab("link")}>分享画布</button>
        <button className={`sh-tab ${tab==="pub"?"active":""}`} onClick={() => setTab("pub")}>发布到漫创AI社区</button>
      </div>
      {tab === "link" && (
        <>
          <div className="sh-cover" style={{ backgroundImage: `url(${DEMO_IMG(33, 800, 450)})` }}/>
          <div className="sh-link">
            <ISearch size={12}/>
            <span className="url">https://manchuang.ai/share/m_8a2ff3b9c4</span>
            <button>复制</button>
          </div>
          <div className="sh-perms">
            <div className={`sh-perm ${perm==="view"?"active":""}`} onClick={() => setPerm("view")}>
              <div className="h">仅查看</div><div className="d">他人不可编辑</div>
            </div>
            <div className={`sh-perm ${perm==="copy"?"active":""}`} onClick={() => setPerm("copy")}>
              <div className="h">允许另存</div><div className="d">他人可复制为自己的画布</div>
            </div>
            <div className={`sh-perm ${perm==="edit"?"active":""}`} onClick={() => setPerm("edit")}>
              <div className="h">协作编辑</div><div className="d">受邀人可同步编辑</div>
            </div>
          </div>
          <div className="sh-socials">
            <div className="sh-social" title="微信"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="9" r="3"/><circle cx="15" cy="14" r="3"/></svg></div>
            <div className="sh-social" title="微博"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg></div>
            <div className="sh-social" title="Email"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14"/><path d="M3 7l9 6 9-6"/></svg></div>
            <div className="sh-social" title="二维码"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></div>
          </div>
        </>
      )}
      {tab === "pub" && (
        <>
          <div className="sh-cover" style={{ backgroundImage: `url(${DEMO_IMG(33, 800, 450)})`, position: "relative" }}>
            <div style={{ position: "absolute", left: 14, bottom: 14, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)", fontWeight: 600 }}>选择封面帧</div>
          </div>
          <div className="sc-field">
            <label>作品标题</label>
            <input placeholder="给你的作品起一个名字"/>
          </div>
          <div className="sc-field">
            <label>简介 / 标签</label>
            <textarea rows="3" placeholder="#胶片 #人像 描述你的灵感..."/>
          </div>
          <div className="sh-perms">
            <div className="sh-perm active">
              <div className="h">公开</div><div className="d">任何人可观看与点赞</div>
            </div>
            <div className="sh-perm">
              <div className="h">私享</div><div className="d">仅持链接者可观看</div>
            </div>
          </div>
          <button className="x-btn primary" style={{ width: "100%", padding: 11, marginTop: 10 }}>
            <ISparkle size={12}/>发布到漫创AI社区
          </button>
        </>
      )}
    </XModal>
  );
}
