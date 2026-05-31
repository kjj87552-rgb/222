import React from 'react';
import { IBell, IStar, IText } from '../../../shared/ui/icons/index.jsx';
import { XModal } from '../shared/XModal.jsx';
import { uiActions } from '../../../shared/store/uiStore.js';

const MS_ITEMS = {
  all: [
    { kind: "like",   nm: "Yang ❤ 喜欢了你的作品「黎明书店」", desc: "查看作品 →", tm: "2 分钟前", new: true },
    { kind: "system", nm: "系统通知", desc: "漫创AI 生成能力已更新", tm: "1 小时前", new: true },
    { kind: "like",   nm: "石庐 收藏了你的风格模板「电影胶片暖调」", desc: "已被 32 位创作者使用", tm: "3 小时前" },
    { kind: "comment",nm: "Dave 评论：构图非常好，请问相机参数是？", desc: "「黄昏少女」", tm: "昨天 22:14" },
    { kind: "system", nm: "积分提醒", desc: "您本月剩余 2,398 积分，将在 4-30 自动续期", tm: "昨天 09:00" },
    { kind: "comment",nm: "极夜 评论：好喜欢这种欧美卡通的氛围", desc: "「赛博港口」", tm: "2 天前" },
  ],
};

export function MessageModal() {
  const onClose = uiActions.closeTopModal;
  const [tab, setTab] = React.useState("all");
  return (
    <XModal title="消息中心" icon={<IBell size={16}/>} onClose={onClose} className="ms-modal">
      <div className="ms-tabs">
        <button className={`ms-tab ${tab==="all"?"active":""}`} onClick={() => setTab("all")}>全部 <span className="dot"/></button>
        <button className={`ms-tab ${tab==="comment"?"active":""}`} onClick={() => setTab("comment")}>评论</button>
        <button className={`ms-tab ${tab==="like"?"active":""}`} onClick={() => setTab("like")}>互动</button>
        <button className={`ms-tab ${tab==="system"?"active":""}`} onClick={() => setTab("system")}>系统</button>
      </div>
      <div className="ms-list">
        {MS_ITEMS.all
          .filter(m => tab === "all" || m.kind === tab)
          .map((m, i) => (
            <div key={i} className={`ms-item ${m.kind}`}>
              <div className="icic">
                {m.kind === "like" && <IStar size={14}/>}
                {m.kind === "comment" && <IText size={14}/>}
                {m.kind === "system" && <IBell size={14}/>}
              </div>
              <div className="content">
                <div className="hdr">
                  <span className={`nm ${m.new?"new":""}`}>{m.nm}</span>
                  <span className="tm">{m.tm}</span>
                </div>
                <div className="desc">{m.desc}</div>
              </div>
            </div>
          ))}
      </div>
    </XModal>
  );
}
