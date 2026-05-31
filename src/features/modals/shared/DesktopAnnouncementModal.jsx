import React from 'react';
import { IBell, ICheck, IClose } from '../../../shared/ui/icons/index.jsx';

const LEVEL_LABELS = {
  normal: '公告',
  important: '重要公告',
  maintenance: '维护公告',
  outage: '停服公告',
};

function announcementLevelLabel(level) {
  return LEVEL_LABELS[level] || LEVEL_LABELS.normal;
}

function announcementTime(value) {
  if (value == null || value === '') return '未知';
  return String(value);
}

export function DesktopAnnouncementModal({ announcement, onClose }) {
  if (!announcement) return null;

  const level = announcement.level || 'normal';
  const closeWithTarget = () => onClose?.({
    id: announcement.id,
    contentHash: announcement.contentHash ?? announcement.content_hash,
  });

  return (
    <div className="x-modal-mask desktop-announcement-mask">
      <section
        className={`x-modal desktop-announcement-modal level-${level}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="desktop-announcement-title"
      >
        <header>
          <span className="desktop-announcement-badge">
            <IBell size={15} />
          </span>
          <h2 id="desktop-announcement-title">{announcement.title || '公告'}</h2>
          <button
            className="close"
            type="button"
            onClick={closeWithTarget}
            aria-label="关闭公告"
          >
            <IClose size={16} />
          </button>
        </header>
        <div className="body desktop-announcement-body">
          <div className="desktop-announcement-meta">
            <span className={`announcement-level level-${level}`}>{announcementLevelLabel(level)}</span>
            <span>推送时间 {announcementTime(announcement.pushedAt ?? announcement.pushed_at)}</span>
          </div>
          <p>{announcement.content || ''}</p>
        </div>
        <div className="footer desktop-announcement-footer">
          <span className="x-credit">来自桌面公告</span>
          <span style={{ flex: 1 }} />
          <button className="x-btn primary" type="button" onClick={closeWithTarget}>
            <ICheck size={12} />
            知道了
          </button>
        </div>
      </section>
    </div>
  );
}
