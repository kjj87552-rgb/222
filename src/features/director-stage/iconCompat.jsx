import React from 'react';

function SvgIcon({ size = 16, className, children, style, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Play = (p) => <SvgIcon {...p}><path d="M6 4v16l14-8-14-8z" fill="currentColor" stroke="none" /></SvgIcon>;
export const Pause = (p) => <SvgIcon {...p}><path d="M7 4h3v16H7zM14 4h3v16h-3z" fill="currentColor" stroke="none" /></SvgIcon>;
export const Camera = (p) => <SvgIcon {...p}><path d="M4 7h3l2-2h6l2 2h3v12H4z" /><circle cx="12" cy="13" r="4" /></SvgIcon>;
export const ChevronLeft = (p) => <SvgIcon {...p}><path d="M15 18l-6-6 6-6" /></SvgIcon>;
export const ChevronRight = (p) => <SvgIcon {...p}><path d="M9 6l6 6-6 6" /></SvgIcon>;
export const Copy = (p) => <SvgIcon {...p}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></SvgIcon>;
export const Download = (p) => <SvgIcon {...p}><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></SvgIcon>;
export const Eraser = (p) => <SvgIcon {...p}><path d="M4 16l8-8 7 7-5 5H8z" /><path d="M9 21h10" /></SvgIcon>;
export const Expand = (p) => <SvgIcon {...p}><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></SvgIcon>;
export const FileText = (p) => <SvgIcon {...p}><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h4M8 12h8M8 16h8" /></SvgIcon>;
export const Grid3X3 = (p) => <SvgIcon {...p}><rect x="3" y="3" width="18" height="18" rx="1.5" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></SvgIcon>;
export const ImagePlus = (p) => <SvgIcon {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 15l3-3 4 4 2-2 3 3" /><path d="M16 8h4M18 6v4" /></SvgIcon>;
export const Lock = (p) => <SvgIcon {...p}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></SvgIcon>;
export const LockOpen = (p) => <SvgIcon {...p}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 017-2" /></SvgIcon>;
export const Maximize2 = (p) => <SvgIcon {...p}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></SvgIcon>;
export const Minimize2 = (p) => <SvgIcon {...p}><path d="M14 10h6V4M10 14H4v6M20 4l-7 7M4 20l7-7" /></SvgIcon>;
export const Move3D = (p) => <SvgIcon {...p}><path d="M12 3v18M3 12h18" /><path d="M8 7l4-4 4 4M16 17l-4 4-4-4M7 8l-4 4 4 4M17 8l4 4-4 4" /></SvgIcon>;
export const Orbit = (p) => <SvgIcon {...p}><circle cx="12" cy="12" r="3" /><path d="M3 12c2-5 6-8 9-8s7 3 9 8c-2 5-6 8-9 8s-7-3-9-8z" /></SvgIcon>;
export const Plus = (p) => <SvgIcon {...p}><path d="M12 5v14M5 12h14" /></SvgIcon>;
export const Route = (p) => <SvgIcon {...p}><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h5a3 3 0 010 6H11a3 3 0 000 6h5" /></SvgIcon>;
export const RotateCcw = (p) => <SvgIcon {...p}><path d="M3 12a9 9 0 109-9" /><path d="M3 4v8h8" /></SvgIcon>;
export const ScanLine = (p) => <SvgIcon {...p}><path d="M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2M4 12h16" /></SvgIcon>;
export const Sparkles = (p) => <SvgIcon {...p}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></SvgIcon>;
export const Trash2 = (p) => <SvgIcon {...p}><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13" /></SvgIcon>;
export const Ungroup = (p) => <SvgIcon {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><path d="M10 6h4M6 10v4M18 10v4M10 18h4" /></SvgIcon>;
export const User = (p) => <SvgIcon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></SvgIcon>;
export const Users = (p) => <SvgIcon {...p}><circle cx="9" cy="8" r="3" /><path d="M3 21a6 6 0 0112 0" /><path d="M16 11a3 3 0 10-1-5.8M17 21a6 6 0 00-3-5" /></SvgIcon>;
export const X = (p) => <SvgIcon {...p}><path d="M5 5l14 14M19 5L5 19" /></SvgIcon>;
export const BadgeInfo = (p) => <SvgIcon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></SvgIcon>;
export const Focus = (p) => <SvgIcon {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></SvgIcon>;
export const PanelTopOpen = (p) => <SvgIcon {...p}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 10h16M9 15l3-3 3 3" /></SvgIcon>;
