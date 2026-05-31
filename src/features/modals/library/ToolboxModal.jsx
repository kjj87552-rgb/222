import React from 'react';
import {
  IClose,
  IGrid9,
  IMagic,
  IScript,
  ISearch,
  ISparkle,
} from '../../../shared/ui/icons/index.jsx';

const TOOL_GROUPS = [
  {
    title: '图片节点工具',
    items: [
      { key: 'upscale', title: '高清放大', desc: '对选中的图片节点生成高清版本', icon: ISparkle, requiresImage: true },
      { key: 'focus', title: '焦点编辑', desc: '分析并局部编辑图片重点区域', icon: ISearch, requiresImage: true },
      { key: 'gridsplit', title: '宫格切分', desc: '把图片拆成可复用的画面分区', icon: IGrid9, requiresImage: true },
      { key: 'markup', title: '涂抹重绘', desc: '用标记区域重绘图片细节', icon: IMagic, requiresImage: true },
    ],
  },
  {
    title: '生产工具',
    items: [
      { key: 'scriptcreate', title: '分镜脚本', desc: '根据文本或当前节点生成分镜脚本', icon: IScript },
    ],
  },
];

export function ToolboxModal({ onClose, onPickTool, selectedNodeType }) {
  const canUseImageTools = selectedNodeType === 'image';

  return (
    <div className="tb-modal-mask" onPointerDown={(event) => { if (event.currentTarget === event.target) onClose?.(); }}>
      <div className="tb-modal" onPointerDown={(event) => event.stopPropagation()}>
        <header className="tb-head">
          <div>
            <strong>工具箱</strong>
            <span>选择节点后使用对应工具</span>
          </div>
          <button type="button" className="tb-close" onClick={onClose} title="关闭"><IClose size={16}/></button>
        </header>

        <div className="tb-groups">
          {TOOL_GROUPS.map((group) => (
            <section key={group.title} className="tb-group">
              <h3>{group.title}</h3>
              <div className="tb-grid">
                {group.items.map((item) => {
                  const disabled = item.requiresImage && !canUseImageTools;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className="tb-card"
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        onPickTool?.(item.key);
                      }}
                    >
                      <span className="tb-card-icon"><Icon size={17}/></span>
                      <span className="tb-card-main">
                        <strong>{item.title}</strong>
                        <em>{disabled ? '请先选中图片节点' : item.desc}</em>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
