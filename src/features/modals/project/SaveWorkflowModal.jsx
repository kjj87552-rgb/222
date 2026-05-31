import React from 'react';
import { IBox, ICheck } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { DEMO_IMG } from '../../../shared/data/initialNodes.js';

export function SaveWorkflowModal({ count, onClose, onSave }) {
  const [name, setName] = React.useState("我的工作流");
  const [desc, setDesc] = React.useState("参考图 → 文字角色 → 图像生成 → 图生视频");
  const [cat, setCat] = React.useState("基础");
  const [pub, setPub] = React.useState("private");

  return (
    <XModal title="保存为工作流" icon={<IBox size={16}/>} onClose={onClose} className="wf-modal"
      footer={<>
        <span className="x-credit">已选 {count} 个节点</span>
        <span style={{ flex: 1 }}/>
        <button className="x-btn ghost" onClick={onClose}>取消</button>
        <button className="x-btn primary" onClick={() => { onSave?.({ name, desc, cat, pub }); onClose(); }}>
          <ICheck size={12}/>保存到工具箱
        </button>
      </>}
    >
      <div style={{ padding: "20px 22px" }}>
        <div className="wf-cover" style={{ backgroundImage: `url(${DEMO_IMG(22, 800, 450)})` }}>
          <span className="badge">{count} 节点 · {cat}</span>
        </div>
        <div className="sc-field">
          <label>工作流名称</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="例如：黎明书店 · 图生视频"/>
        </div>
        <div className="sc-field">
          <label>简介</label>
          <textarea rows="3" value={desc} onChange={e => setDesc(e.target.value)}/>
        </div>
        <div className="sc-field">
          <label>分类</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["基础","剧情","角色","电商","漫剧","创意"].map(c => (
              <span key={c} className={`fe-tag ${cat===c?"active":""}`} onClick={() => setCat(c)}>{c}</span>
            ))}
          </div>
        </div>
        <div className="sc-field">
          <label>可见性</label>
          <div className="sh-perms" style={{ marginTop: 0 }}>
            <div className={`sh-perm ${pub==="private"?"active":""}`} onClick={() => setPub("private")}>
              <div className="h">仅我可见</div>
              <div className="d">保存到我的工具箱</div>
            </div>
            <div className={`sh-perm ${pub==="public"?"active":""}`} onClick={() => setPub("public")}>
              <div className="h">公开发布</div>
              <div className="d">通过审核后展示在工具箱广场</div>
            </div>
          </div>
        </div>
      </div>
    </XModal>
  );
}
