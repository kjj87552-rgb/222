import React from 'react';
import { Icon } from '../Icon.jsx';

export const IText   = (p) => <Icon {...p}><path d="M5 5h14M5 5v2M19 5v2M12 5v14M9 19h6"/></Icon>;
export const IImage  = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/></Icon>;
export const IVideo  = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></Icon>;
export const IAudio  = (p) => <Icon {...p}><path d="M9 19V7l10-2v12"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="17" r="2"/></Icon>;
export const IScript = (p) => <Icon {...p}><path d="M4 4h13l3 3v13H4V4z"/><path d="M17 4v3h3"/><path d="M7 10h9M7 14h9M7 18h6"/></Icon>;
export const IAdd    = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const IMove   = (p) => <Icon {...p}><path d="M12 3v18M3 12h18M8 7l-5 5 5 5M16 7l5 5-5 5M7 8l5-5 5 5M7 16l5 5 5-5"/></Icon>;
export const IZoomIn = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5M8 11h6M11 8v6"/></Icon>;
export const IZoomOut= (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5M8 11h6"/></Icon>;
export const IUndo   = (p) => <Icon {...p}><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 016 6v1"/></Icon>;
export const IRedo   = (p) => <Icon {...p}><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 00-6 6v1"/></Icon>;
export const IMap    = (p) => <Icon {...p}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></Icon>;
export const IGear   = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></Icon>;
export const IBell   = (p) => <Icon {...p}><path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 004 0"/></Icon>;
export const IShare  = (p) => <Icon {...p}><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/></Icon>;
export const ITrash  = (p) => <Icon {...p}><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/></Icon>;
export const ICopy   = (p) => <Icon {...p}><rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V4H4v12h4"/></Icon>;
export const IGroup  = (p) => <Icon {...p}><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="M11 7h6v6M7 11v6h6" strokeDasharray="2 2"/></Icon>;
export const IFolder = (p) => <Icon {...p}><path d="M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6z"/></Icon>;
export const IHistory= (p) => <Icon {...p}><path d="M3 12a9 9 0 109-9"/><path d="M3 12l3-3M3 12l3 3"/><path d="M12 7v5l3 2"/></Icon>;
export const IBook   = (p) => <Icon {...p}><path d="M4 4h7a3 3 0 013 3v13a3 3 0 00-3-3H4V4z"/><path d="M20 4h-7a3 3 0 00-3 3v13a3 3 0 013-3h7V4z"/></Icon>;
export const IBox    = (p) => <Icon {...p}><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/></Icon>;
export const ISparkle= (p) => <Icon {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></Icon>;
export const IPlay   = (p) => <Icon {...p}><path d="M6 4v16l14-8L6 4z" fill="currentColor"/></Icon>;
export const IPause  = (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></Icon>;
export const IClose  = (p) => <Icon {...p}><path d="M5 5l14 14M19 5L5 19"/></Icon>;
export const IGrid9  = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></Icon>;
export const ICamera = (p) => <Icon {...p}><path d="M4 7h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="13" r="4"/></Icon>;
export const ILight  = (p) => <Icon {...p}><path d="M9 21h6M10 18h4M8 14a5 5 0 118 0c0 2-2 2-2 4h-4c0-2-2-2-2-4z"/></Icon>;
export const IPano   = (p) => <Icon {...p}><path d="M3 8c6 3 12 3 18 0v8c-6-3-12-3-18 0V8z"/><circle cx="12" cy="12" r="2"/></Icon>;
export const IMagic  = (p) => <Icon {...p}><path d="M4 20L16 8M14 4l2 2M20 10l-2-2M18 6l2-2M16 8l4 4"/></Icon>;
export const ICrop   = (p) => <Icon {...p}><path d="M6 2v16h16M2 6h16v16"/></Icon>;
export const ICut    = (p) => <Icon {...p}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 7.5L20 19M8.5 16.5L20 5"/></Icon>;
export const IArrow  = (p) => <Icon {...p}><path d="M4 12h16M14 6l6 6-6 6"/></Icon>;
export const ISearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></Icon>;
export const ICheck  = (p) => <Icon {...p}><path d="M4 12l5 5L20 6"/></Icon>;
export const IEye    = (p) => <Icon {...p}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Icon>;
export const IEyeOff = (p) => <Icon {...p}><path d="M2 12s3.5-6 10-6c1.4 0 2.7.28 3.86.72M19.3 9.15C21.08 10.55 22 12 22 12s-3.5 6-10 6c-1.4 0-2.7-.28-3.86-.72M9.9 9.9a3 3 0 014.2 4.2M3 3l18 18"/></Icon>;
export const IStar   = (p) => <Icon {...p}><path d="M12 3l2.8 6 6.6 1-4.7 4.6 1.1 6.5L12 18l-5.8 3.1L7.3 14.6 2.6 10l6.6-1L12 3z"/></Icon>;
export const IMic    = (p) => <Icon {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></Icon>;
export const IFilm   = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 8h18M3 16h18M7 4v16M17 4v16"/></Icon>;
export const IDot3   = (p) => <Icon {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></Icon>;
export const IChevD  = (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>;
export const IChevR  = (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>;
export const IChevL  = (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>;
export const IKey    = (p) => <Icon {...p}><circle cx="8" cy="14" r="4"/><path d="M11 11l9-9M17 5l3 3M15 7l2 2"/></Icon>;
export const ILayer  = (p) => <Icon {...p}><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/></Icon>;
export const IHome   = (p) => <Icon {...p}><path d="M4 11l8-7 8 7v9h-6v-6h-4v6H4v-9z"/></Icon>;
export const ILogo   = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="2" y="2" width="36" height="36" rx="6" fill="var(--ink)"/>
    <path d="M10 28V14l5 6 5-6v14" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="28" cy="14" r="2.2" fill="var(--accent)"/>
    <path d="M24 28c4 0 4-6 4-6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);
