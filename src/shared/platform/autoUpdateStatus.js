export const AUTO_UPDATE_STATUS_EVENT = 'libai:auto-update-status';

export function updateUnavailableMessage(reason) {
  switch (String(reason || '').trim()) {
    case 'development':
      return '当前是开发调试版本，自动更新只在安装后的正式版中可用。';
    case 'missing-updater':
      return '自动更新组件未加载，请安装正式版后再检测更新。';
    case 'not-started':
      return '自动更新服务尚未启动，请稍后再试。';
    default:
      return '当前运行环境没有更新检测服务。请在桌面版中使用，或安装正式版后重试。';
  }
}

export function emitAutoUpdateStatus(payload = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return false;
  window.dispatchEvent(new CustomEvent(AUTO_UPDATE_STATUS_EVENT, {
    detail: {
      ...payload,
      emittedAt: new Date().toISOString(),
    },
  }));
  return true;
}
