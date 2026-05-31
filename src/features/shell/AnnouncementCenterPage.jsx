import React from 'react';

const LEVEL_LABELS = {
  normal: '公告',
  important: '重要公告',
  maintenance: '维护公告',
  outage: '停服公告',
};

function levelLabel(level) {
  return LEVEL_LABELS[level] || LEVEL_LABELS.normal;
}

function pushedTime(item) {
  const value = item?.pushedAt ?? item?.pushed_at ?? item?.publishedAt ?? item?.receivedAt;
  if (value == null || value === '') return '未知';
  return String(value);
}

export function AnnouncementCenterPage({ history = [], syncError = null }) {
  const items = Array.isArray(history) ? history : [];

  return (
    <section className="home-page announcement-center-page">
      <div className="page-head announcement-page-head">
        <div>
          <span className="announcement-page-kicker">历史消息</span>
          <h1>公告历史</h1>
        </div>
      </div>

      {syncError && (
        <div className="announcement-sync-error" role="status">
          {syncError}
        </div>
      )}

      <div className="announcement-list" aria-label="历史消息">
        {items.length === 0 ? (
          <div className="announcement-empty">暂无公告</div>
        ) : (
          items.map((item) => {
            const level = item.level || 'normal';
            return (
              <article className={`announcement-list-item level-${level}`} key={`${item.id}-${item.contentHash || ''}`}>
                <div className="announcement-list-main">
                  <div className="announcement-list-title">
                    <h2>{item.title || '公告'}</h2>
                    <span className={`announcement-level level-${level}`}>{levelLabel(level)}</span>
                    <span className={`announcement-read-state ${item.read ? 'read' : 'unread'}`}>
                      {item.read ? '已读' : '未读'}
                    </span>
                  </div>
                  <p>{item.content || ''}</p>
                </div>
                <time className="announcement-pushed-time">
                  推送时间 {pushedTime(item)}
                </time>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

