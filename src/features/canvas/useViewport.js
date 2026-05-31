import React from 'react';

const DEFAULT_VIEW = { x: 0, y: 0, s: 1 };

export function useViewport(initial = DEFAULT_VIEW) {
  const [view, setView] = React.useState(initial);
  const viewRef = React.useRef(view);
  viewRef.current = view;

  const api = React.useMemo(() => ({
    get: () => viewRef.current,
    set: (updater) => setView((v) => typeof updater === 'function' ? updater(v) : updater),
    panBy: (dx, dy) => setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy })),
    zoomTo: (nextScale, anchor) =>
      setView((v) => {
        const ratio = nextScale / v.s;
        return {
          x: anchor.x - (anchor.x - v.x) / ratio,
          y: anchor.y - (anchor.y - v.y) / ratio,
          s: nextScale,
        };
      }),
    focusOn: (rect, viewportSize) => {
      const cx = (rect.minX + rect.maxX) / 2;
      const cy = (rect.minY + rect.maxY) / 2;
      setView((v) => ({
        ...v,
        x: cx - viewportSize.w / (2 * v.s),
        y: cy - viewportSize.h / (2 * v.s),
      }));
    },
    reset: () => setView(DEFAULT_VIEW),
  }), []);

  return [view, api];
}
