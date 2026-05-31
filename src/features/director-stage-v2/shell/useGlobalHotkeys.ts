// src/features/director-stage-v2/shell/useGlobalHotkeys.ts
import { useEffect } from 'react';

export interface HotkeyHandlers {
  onHero?: () => void;
  onCrowd?: () => void;
  onCamera?: () => void;
  onBackground?: () => void;
  onGround?: () => void;
  onFrame?: () => void;
  onPath?: () => void;
  onTogglePathPreview?: () => void;
  onResetView?: () => void;
  onCommandPalette?: () => void;
}

const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
};

export function useGlobalHotkeys(handlers: HotkeyHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const map: Record<string, undefined | (() => void)> = {
        h: handlers.onHero,
        c: handlers.onCrowd,
        k: handlers.onCamera,
        b: handlers.onBackground,
        g: handlers.onGround,
        f: handlers.onFrame,
        p: handlers.onPath,
        ' ': handlers.onTogglePathPreview,
        r: handlers.onResetView,
        '/': handlers.onCommandPalette,
      };
      const fn = map[k];
      if (fn) { e.preventDefault(); fn(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, handlers]);
}
