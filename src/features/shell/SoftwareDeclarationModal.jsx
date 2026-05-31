import React from 'react';
import { SOFTWARE_DECLARATION } from './softwareDeclaration.js';

function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function DeclarationIcon() {
  return (
    <IconBase>
      <path d="M7.2 4.4h6.2l3.4 3.4v11.8H7.2V4.4Z" />
      <path d="M13.2 4.6v3.5h3.4" />
      <path d="M9.6 11.1h4.8M9.6 14h4.8M9.6 16.9h3.1" />
    </IconBase>
  );
}

export function SoftwareDeclarationModal({ dismissible = true, onClose, onConfirm }) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <div
      className="software-declaration-overlay"
      role="presentation"
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        className="software-declaration-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="software-declaration-title"
      >
        <header className="software-declaration-head">
          <span className="software-declaration-mark">
            <DeclarationIcon />
          </span>
          <div>
            <span>使用与合规协议</span>
            <h2 id="software-declaration-title">软件声明</h2>
          </div>
          {dismissible && (
            <button type="button" className="software-declaration-close" onClick={onClose} aria-label="关闭软件声明">
              关闭
            </button>
          )}
        </header>
        <div className="software-declaration-body">
          {SOFTWARE_DECLARATION.intro.map((paragraph) => (
            <p className="software-declaration-intro" key={paragraph}>{paragraph}</p>
          ))}
          {SOFTWARE_DECLARATION.sections.map((section) => (
            <section className="software-declaration-section" key={section.title}>
              <h3>{section.title}</h3>
              {section.clauses.map((clause) => (
                <p key={clause}>{clause}</p>
              ))}
            </section>
          ))}
        </div>
        <footer className="software-declaration-footer">
          <span>请确认您已阅读并理解以上声明。</span>
          <button type="button" className="software-declaration-confirm" onClick={handleConfirm}>
            我已阅读并确认
          </button>
        </footer>
      </section>
    </div>
  );
}
