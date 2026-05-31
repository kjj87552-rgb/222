/* MiniTopBar — top chrome bar with logo, project name, and right-side actions */

import React from 'react';
import {
  ILogo,
  IChevD,
  IChevL,
  ISparkle,
} from '../../shared/ui/icons/index.jsx';
import { useProject } from '../../shared/store/canvasStore.js';

export function MiniTopBar({ themeKey, onToggleTheme, onOpenProjects, onBackToProjects }) {
  const project = useProject();
  return (
    <div className="minitop">
      <div className="brand">
        {onBackToProjects && (
          <button
            type="button"
            className="back-btn"
            onClick={onBackToProjects}
            title="返回项目主界面"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', marginRight: 4,
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--ink-soft)',
              cursor: 'pointer', fontSize: 11,
              fontFamily: 'var(--font-display)',
            }}
          >
            <IChevL size={12}/> 返回
          </button>
        )}
        <span className="logo"><ILogo size={22}/> 漫创AI</span>
        <span className="sep">|</span>
        <span className="proj" onClick={onOpenProjects} style={{cursor:"pointer"}} title="切换项目">{project?.name || "未命名"} <IChevD size={10} style={{opacity:0.6}}/></span>
      </div>
      <div className="right">
        <button className="icon-btn" title="切换主题" onClick={onToggleTheme}>
          <ISparkle size={13}/>
        </button>
      </div>
    </div>
  );
}
