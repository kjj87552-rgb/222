import React from 'react';
import { createPortal } from 'react-dom';
import {
  formatQuotaMoney,
  useAccount,
  useAccountConnected,
  useAccountLoading,
  useAccountQuota,
  useAccountUser,
} from '../../shared/store/accountStore.js';
import { emitAutoUpdateStatus, updateUnavailableMessage } from '../../shared/platform/autoUpdateStatus.js';
import { DeclarationIcon, SoftwareDeclarationModal } from './SoftwareDeclarationModal.jsx';
import { acceptSoftwareDeclaration } from './softwareDeclarationConsent.js';

function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <IconBase>
      <path d="M4.5 8.1c0-1.56 0-2.34.37-2.9.16-.25.38-.47.63-.63.56-.37 1.34-.37 2.9-.37h7.2c1.56 0 2.34 0 2.9.37.25.16.47.38.63.63.37.56.37 1.34.37 2.9v7.8c0 1.56 0 2.34-.37 2.9-.16.25-.38.47-.63.63-.56.37-1.34.37-2.9.37H8.4c-1.56 0-2.34 0-2.9-.37a2.2 2.2 0 0 1-.63-.63c-.37-.56-.37-1.34-.37-2.9V8.1Z" />
      <path d="M8 8.4h8M8 12h4.9M8 15.6h6.6" />
      <path d="M16.2 4.7v14.6" />
    </IconBase>
  );
}

function AssetsIcon() {
  return (
    <IconBase>
      <path d="M5.2 6.6c0-1.12.9-2.02 2.02-2.02h9.56c1.12 0 2.02.9 2.02 2.02v10.8c0 1.12-.9 2.02-2.02 2.02H7.22A2.02 2.02 0 0 1 5.2 17.4V6.6Z" />
      <path d="m7.4 16 3.4-3.7 2.18 2.2 1.7-1.78L17.1 16" />
      <path d="M9.4 8.62h.02M15.6 8.62h.02M12.5 7.3v2.8" />
    </IconBase>
  );
}

function ModelsIcon() {
  return (
    <IconBase>
      <path d="M12 4.2 18.8 8v8L12 19.8 5.2 16V8L12 4.2Z" />
      <path d="M12 12 18.5 8.2M12 12 5.5 8.2M12 12v7.1" />
      <path d="M9.1 6.05 15 9.42M15 14.58l-5.9 3.37" />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
      <path d="M4.8 7.2c0-1.1.9-2 2-2h4.1l1.54 1.52h4.76c1.1 0 2 .9 2 2v7.98c0 1.1-.9 2-2 2H6.8c-1.1 0-2-.9-2-2V7.2Z" />
      <path d="M8 10.3h8M8 13.1h5.7M8 15.9h7" />
      <path d="M15.8 4.9v3" />
    </IconBase>
  );
}

function GuideIcon() {
  return (
    <IconBase>
      <path d="M5.3 5.7c0-.9.72-1.62 1.62-1.62h5.18c1.04 0 1.88.84 1.88 1.88v13.96H7.2a1.9 1.9 0 0 1-1.9-1.9V5.7Z" />
      <path d="M13.98 5.96c0-1.04.84-1.88 1.88-1.88h1.22c.9 0 1.62.72 1.62 1.62v12.32a1.9 1.9 0 0 1-1.9 1.9h-2.82V5.96Z" />
      <path d="M8.2 8.2h2.9M8.2 11.2h2.9M8.2 14.2h2.2M16 8.2h.7M16 11.2h.7M16 14.2h.7" />
    </IconBase>
  );
}

function AnnouncementIcon() {
  return (
    <IconBase>
      <path d="M6 8.4a6 6 0 0 1 12 0c0 5.1 2.2 6.25 2.2 6.25H3.8S6 13.5 6 8.4Z" />
      <path d="M9.8 18.1a2.35 2.35 0 0 0 4.4 0" />
      <path d="M12 4.2v-1" />
      <path d="M8.7 10.9h6.6" />
    </IconBase>
  );
}

function CollapseIcon({ collapsed }) {
  return (
    <IconBase>
      <path d="M4.5 5.6c0-.83.67-1.5 1.5-1.5h12c.83 0 1.5.67 1.5 1.5v12.8c0 .83-.67 1.5-1.5 1.5H6c-.83 0-1.5-.67-1.5-1.5V5.6Z" />
      <path d="M9 4.3v15.4" />
      <path d={collapsed ? 'm13.6 9 3 3-3 3' : 'm16.4 9-3 3 3 3'} />
    </IconBase>
  );
}

function UserIcon() {
  return (
    <IconBase>
      <path d="M12 12.2a3.55 3.55 0 1 0 0-7.1 3.55 3.55 0 0 0 0 7.1Z" />
      <path d="M5.6 19.2c.86-3.1 3.25-4.72 6.4-4.72s5.54 1.62 6.4 4.72" />
    </IconBase>
  );
}

function ThemeIcon({ dark }) {
  return (
    <IconBase>
      {dark ? (
        <>
          <path d="M18.4 14.6A7 7 0 0 1 9.4 5.6a7.1 7.1 0 1 0 9 9Z" />
          <path d="M16.2 4.8h.02M19.2 8.2h.02M14.8 8.1h.02" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 3.8v1.8M12 18.4v1.8M4.8 12H3M21 12h-1.8M6.9 6.9 5.6 5.6M18.4 18.4l-1.3-1.3M17.1 6.9l1.3-1.3M5.6 18.4l1.3-1.3" />
        </>
      )}
    </IconBase>
  );
}

function UpdateIcon() {
  return (
    <IconBase>
      <path d="M19 11a7 7 0 0 0-12.18-4.73L5 8.1" />
      <path d="M5 4.4v3.7h3.7" />
      <path d="M5 13a7 7 0 0 0 12.18 4.73L19 15.9" />
      <path d="M19 19.6v-3.7h-3.7" />
      <path d="M12 8.4v5.2" />
      <path d="m9.9 11.6 2.1 2.1 2.1-2.1" />
    </IconBase>
  );
}

function IBookIcon() {
  return (
    <IconBase>
      <path d="M5.2 5.8c0-.88.72-1.6 1.6-1.6h5.1c1.05 0 1.9.85 1.9 1.9v13.1H7.1a1.9 1.9 0 0 1-1.9-1.9V5.8Z" />
      <path d="M13.8 6.1c0-1.05.85-1.9 1.9-1.9h1.5c.88 0 1.6.72 1.6 1.6v11.5c0 1.05-.85 1.9-1.9 1.9h-3.1V6.1Z" />
      <path d="M8.2 8.1h2.6M8.2 11h2.6M16 8.1h.8M16 11h.8" />
    </IconBase>
  );
}

export const APP_NAV = [
  { key: 'projects', label: '项目', Icon: ProjectsIcon },
  { key: 'assets', label: '资产库', Icon: AssetsIcon },
  { key: 'models', label: '模型列表', Icon: ModelsIcon },
  { key: 'announcements', label: '公告', Icon: AnnouncementIcon },
  { key: 'settings', label: '本地路径', Icon: SettingsIcon },
  { key: 'guide', label: '使用文档', Icon: GuideIcon },
];

const RECHARGE_URL = 'http://km.huimengart.cn/';

function avatarLetter(value) {
  const text = String(value || '?').trim();
  return (text[0] || '?').toUpperCase();
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

function isAdminRole(value) {
  const role = Number(value);
  return Number.isFinite(role) && role >= 10;
}

function hasAdminInviteBinding(user, account) {
  const meta = account?.meta || {};
  const binding = meta.inviteBinding || {};
  const userSnapshots = [
    user,
    account,
    account?.user,
    meta.user,
  ].filter(Boolean);
  if (userSnapshots.some((snapshot) => isAdminRole(snapshot?.role))) return true;
  if (binding.adminBound === true) return true;
  if (positiveNumber(binding.inviterId) || positiveNumber(binding.inviter_id)) return true;
  return userSnapshots.some((snapshot) => (
    positiveNumber(snapshot?.inviterId) || positiveNumber(snapshot?.inviter_id)
  ));
}

export function ProductSidebar({
  activeView,
  setActiveView,
  project,
  onOpenUserCenter,
  onOpenOnboarding,
  themeKey = 'a',
  onToggleTheme,
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [declarationOpen, setDeclarationOpen] = React.useState(false);
  const account = useAccount();
  const user = useAccountUser();
  const quota = useAccountQuota();
  const connected = useAccountConnected();
  const accountLoading = useAccountLoading();
  const displayName = connected ? (user?.username || '未登录') : '无账号';
  const accountLine = accountLoading
    ? '账户同步中'
    : connected
      ? `余额 ${formatQuotaMoney(quota)}`
      : '请注册 / 登录';
  const projectName = project?.name || '未命名项目';
  const darkTheme = themeKey === 'b';
  const canOpenOnboarding = typeof onOpenOnboarding === 'function';
  const showRechargeEntry = !hasAdminInviteBinding(user, account);
  const handleOpenOnboarding = React.useCallback(() => {
    if (typeof onOpenOnboarding === 'function') onOpenOnboarding();
  }, [onOpenOnboarding]);
  const handleOpenRecharge = React.useCallback(() => {
    const purchaseBridge = globalThis.window?.libai?.system?.openPurchaseWindow;
    if (typeof purchaseBridge === 'function') {
      Promise.resolve(purchaseBridge()).catch(() => {
        const externalBridge = globalThis.window?.libai?.system?.openExternal;
        if (typeof externalBridge === 'function') {
          Promise.resolve(externalBridge(RECHARGE_URL)).catch(() => {
            globalThis.window?.open?.(RECHARGE_URL, '_blank', 'noopener,noreferrer');
          });
          return;
        }
        globalThis.window?.open?.(RECHARGE_URL, '_blank', 'noopener,noreferrer');
      });
      return;
    }
    const bridge = globalThis.window?.libai?.system?.openExternal;
    if (typeof bridge === 'function') {
      Promise.resolve(bridge(RECHARGE_URL)).catch(() => {
        globalThis.window?.open?.(RECHARGE_URL, '_blank', 'noopener,noreferrer');
      });
      return;
    }
    globalThis.window?.open?.(RECHARGE_URL, '_blank', 'noopener,noreferrer');
  }, []);
  const handleCheckForUpdates = React.useCallback(() => {
    const check = globalThis.window?.libai?.update?.check;
    if (typeof check !== 'function') {
      emitAutoUpdateStatus({
        state: 'error',
        manual: true,
        message: updateUnavailableMessage('missing-bridge'),
      });
      return;
    }
    emitAutoUpdateStatus({
      state: 'checking',
      manual: true,
      message: '正在连接更新服务，请稍候。',
    });
    Promise.resolve(check())
      .then((result) => {
        if (!result || result.ok !== false) return;
        emitAutoUpdateStatus({
          state: 'error',
          manual: true,
          message: result.message || updateUnavailableMessage(result.reason),
        });
      })
      .catch((error) => {
        emitAutoUpdateStatus({
          state: 'error',
          manual: true,
          message: error?.message || '自动更新检查失败，请稍后重试。',
        });
      });
  }, []);

  return (
    <aside className={`product-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="product-brand">
        <div className="wordmark">
          <strong>漫创AI</strong>
          <span>Desktop Workspace</span>
        </div>
        <button
          type="button"
          className="product-sidebar-toggle"
          aria-label={collapsed ? '展开菜单' : '折叠菜单'}
          aria-expanded={!collapsed}
          aria-controls="product-main-nav"
          title={collapsed ? '展开菜单' : '折叠菜单'}
          onClick={() => setCollapsed((value) => !value)}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>
      <div className="product-menu-frame">
        <nav className="product-nav" aria-label="主导航" id="product-main-nav">
          {APP_NAV.map((item) => {
            const Icon = item.Icon;
            return (
              <button
                key={item.key}
                type="button"
                className={activeView === item.key ? 'active' : ''}
                onClick={() => setActiveView(item.key)}
                title={item.label}
                data-onboarding-id={`product-nav-${item.key}`}
              >
                <span className="product-nav-icon"><Icon /></span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="product-sidebar-art" aria-label="Virtual Atelier">
        <span className="product-art-label">Virtual Atelier</span>
        <div className="product-art-window" aria-hidden="true">
          <span className="product-art-moon" />
          <span className="product-art-panel panel-a" />
          <span className="product-art-panel panel-b" />
          <span className="product-art-panel panel-c" />
          <span className="product-art-desk" />
          <span className="product-art-screen" />
          <span className="product-art-line line-a" />
          <span className="product-art-line line-b" />
        </div>
      </div>
      <div className="product-sidebar-utility" data-testid="product-sidebar-utility">
        <button
          type="button"
          className="product-declaration-button"
          title={collapsed ? '软件声明' : undefined}
          onClick={() => setDeclarationOpen(true)}
        >
          <span className="product-declaration-icon"><DeclarationIcon /></span>
          <span className="product-declaration-copy">
            <strong>软件声明</strong>
            <em>使用与合规协议</em>
          </span>
        </button>
        <button
          type="button"
          className="product-declaration-button"
          title={collapsed ? '新手引导' : undefined}
          onClick={handleOpenOnboarding}
          disabled={!canOpenOnboarding}
        >
          <span className="product-declaration-icon"><IBookIcon /></span>
          <span className="product-declaration-copy">
            <strong>新手引导</strong>
            <em>重新查看基础流程</em>
          </span>
        </button>
      </div>
      <div className="product-sidefoot">
        <div className="product-bottom-actions">
          <button
            type="button"
            className="product-theme-switch"
            onClick={onToggleTheme}
            aria-label={darkTheme ? '切换到白色主题' : '切换到黑色主题'}
            title={darkTheme ? '切换到白色主题' : '切换到黑色主题'}
          >
            <span className="product-theme-icon"><ThemeIcon dark={darkTheme} /></span>
            <span className="product-theme-copy">
              <strong>{darkTheme ? '黑色主题' : '白色主题'}</strong>
              <em>{darkTheme ? '切换浅色' : '切换深色'}</em>
            </span>
          </button>
          <button
            type="button"
            className="product-update-check"
            onClick={handleCheckForUpdates}
            aria-label="检测软件更新"
            title="检测软件更新"
          >
            <span className="product-theme-icon product-update-icon"><UpdateIcon /></span>
            <span className="product-theme-copy">
              <strong>检测更新</strong>
              <em>查看新版</em>
            </span>
          </button>
        </div>
        <div className="product-account-actions">
          <button
            type="button"
            className={`product-account-button product-account-main${connected ? ' connected' : ''}`}
            onClick={onOpenUserCenter}
            aria-label="打开用户中心"
          >
            <span className="product-account-avatar">
              <UserIcon />
              <b>{avatarLetter(connected ? user?.username : '无账号')}</b>
            </span>
            <span className="product-account-copy">
              <strong>{displayName}</strong>
              <span>{accountLine}</span>
              <em>{projectName}</em>
            </span>
          </button>
          {showRechargeEntry && (
            <button
              type="button"
              className="product-account-recharge"
              onClick={handleOpenRecharge}
              aria-label="打开充值链接"
              title="充值"
            >
              充值
            </button>
          )}
        </div>
      </div>
      {declarationOpen && createPortal(
        <SoftwareDeclarationModal
          onClose={() => setDeclarationOpen(false)}
          onConfirm={acceptSoftwareDeclaration}
        />,
        document.body,
      )}
    </aside>
  );
}
