import React from 'react';
import { IClose } from '../../../shared/ui/icons/index.jsx';

export function XModal({ title, icon, onClose, children, footer, className = "" }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="x-modal-mask" onPointerDown={(e) => { if (e.target.classList.contains("x-modal-mask")) onClose(); }}>
      <div className={`x-modal ${className}`} onPointerDown={(e) => e.stopPropagation()}>
        <header>
          {icon && <span style={{ color: "var(--accent)" }}>{icon}</span>}
          <h2>{title}</h2>
          <button className="close" onClick={onClose}><IClose size={16}/></button>
        </header>
        <div className="body">{children}</div>
        {footer && <div className="footer">{footer}</div>}
      </div>
    </div>
  );
}
