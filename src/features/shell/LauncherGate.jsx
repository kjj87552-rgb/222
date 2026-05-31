import React from 'react';

export function LauncherGate({ onLaunch }) {
  return (
    <section className="launcher-gate" aria-label="漫创AI 启动页">
      <div className="launcher-brand">
        <strong>漫创AI</strong>
        <span>创作画布</span>
      </div>
      <div className="launcher-stage" aria-hidden="true">
        <span className="launcher-float-card card-a" />
        <span className="launcher-float-card card-b" />
        <span className="launcher-float-card card-c" />
        <span className="launcher-float-line line-a" />
        <span className="launcher-float-line line-b" />
      </div>
      <button
        type="button"
        className="launcher-start-button"
        onClick={onLaunch}
        aria-label="启动漫创AI"
      >
        <span className="launcher-button-orbit" aria-hidden="true" />
        <span className="launcher-button-core">
          <strong>启动漫创AI</strong>
          <em>Launch Workspace</em>
        </span>
      </button>
      <p className="launcher-account-note">账号功能进入软件后再绑定</p>
    </section>
  );
}
