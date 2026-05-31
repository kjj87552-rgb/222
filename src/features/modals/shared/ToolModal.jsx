import React from 'react';

/* Common modal chrome — fullscreen mask + keyboard ESC handler */
export function ToolModal({ onClose, toolbar, children, fullscreen = false, className = '' }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const maskClassName = `tool-modal-mask${fullscreen ? ' fullscreen' : ''}`;
  const modalClassName = [
    'tool-modal',
    fullscreen ? 'fullscreen' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div className={maskClassName} onPointerDown={(e) => { if (e.target.classList.contains("tool-modal-mask")) onClose(); }}>
      <div className={modalClassName} onPointerDown={(e) => e.stopPropagation()}>
        {toolbar}
        {children}
      </div>
    </div>
  );
}
