import React from 'react';

export const ONBOARDING_STEPS = [
  {
    id: 'projects',
    eyebrow: '1 / 7 · 项目页',
    title: '先认识项目页',
    body: '每个项目都是一个独立的本地创作空间。你可以继续当前画布，也可以新建项目开始新的创作。',
    targetIds: ['project-gallery', 'product-nav-projects'],
    action: ({ setActiveView }) => setActiveView?.('projects'),
  },
  {
    id: 'assets',
    eyebrow: '2 / 7 · 资产库',
    title: '管理你的素材',
    body: '资产库集中管理图片、视频、音频和文本素材。后续生成结果也可以保存到这里，方便复用。',
    targetIds: ['asset-library', 'product-nav-assets'],
    action: ({ setActiveView }) => setActiveView?.('assets'),
  },
  {
    id: 'models',
    eyebrow: '3 / 7 · 模型配置',
    title: '检查可用模型',
    body: '生成内容前，先确认图片、视频和文本模型已经同步并可用。模型列表会显示能力、价格和接入状态。',
    targetIds: ['model-config', 'product-nav-models'],
    action: ({ setActiveView }) => setActiveView?.('models'),
  },
  {
    id: 'open-canvas',
    eyebrow: '4 / 7 · 进入画布',
    title: '进入当前画布',
    body: '画布是节点、提示词、素材和生成结果连接在一起的地方。下一步会带你进入画布。',
    targetIds: ['project-continue', 'project-gallery', 'product-nav-projects'],
    action: ({ setActiveView }) => setActiveView?.('projects'),
  },
  {
    id: 'add-node',
    eyebrow: '5 / 7 · 添加节点',
    title: '用节点组织创作',
    body: '左侧工具栏可以添加文本、图片、视频、音频、资产生成和提示词调用节点。节点可以拖动、连接和组合。',
    targetIds: ['canvas-left-rail', 'canvas-screen'],
    action: ({ openCanvasView }) => openCanvasView?.(),
  },
  {
    id: 'generate',
    eyebrow: '6 / 7 · 生成内容',
    title: '打开生成器',
    body: '生成器用于选择内容类型、模型、比例和提示词。写好提示词后点击生成，任务会进入队列。',
    targetIds: ['canvas-generator-panel', 'canvas-generator-toggle'],
    action: ({ openCanvasView, generatorVisible, setGeneratorVisible }) => {
      openCanvasView?.();
      if (!generatorVisible) setGeneratorVisible?.(true);
    },
  },
  {
    id: 'results',
    eyebrow: '7 / 7 · 查看结果',
    title: '在画布查看结果',
    body: '生成完成后，图片、视频、音频或文本会作为节点落在画布上。任务队列和历史入口可以继续查看进度与过往结果。',
    targetIds: ['canvas-results-area', 'canvas-screen'],
    action: ({ openCanvasView }) => openCanvasView?.(),
  },
];

export function findOnboardingTarget(targetIds = []) {
  if (typeof document === 'undefined') return null;
  for (const id of targetIds) {
    const element = document.querySelector(`[data-onboarding-id="${id}"]`);
    if (!element) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return element;
  }
  return null;
}

function rectStyle(rect) {
  if (!rect) return {};
  const padding = 10;
  return {
    left: `${Math.max(8, rect.left - padding)}px`,
    top: `${Math.max(8, rect.top - padding)}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`,
  };
}

function cardStyle(rect) {
  if (!rect) return {};
  const cardWidth = 360;
  const gap = 18;
  const viewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 720 : window.innerHeight;
  const preferRight = rect.right + cardWidth + gap < viewportWidth;
  const preferLeft = rect.left - cardWidth - gap > 0;
  const left = preferRight
    ? rect.right + gap
    : preferLeft
      ? rect.left - cardWidth - gap
      : Math.max(16, Math.min(viewportWidth - cardWidth - 16, rect.left));
  const top = Math.max(16, Math.min(viewportHeight - 260, rect.top));
  return {
    left: `${left}px`,
    top: `${top}px`,
  };
}

function requestMeasure(callback) {
  if (typeof window === 'undefined') return null;
  if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }
  return window.setTimeout(callback, 0);
}

function cancelMeasure(handle) {
  if (handle === null || typeof window === 'undefined') return;
  if (typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(handle);
    return;
  }
  window.clearTimeout(handle);
}

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll([
    'button:not(:disabled)',
    '[href]',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
  ].join(','))).filter((element) => {
    if (element.getAttribute('aria-hidden') === 'true') return false;
    return typeof element.focus === 'function';
  });
}

export function OnboardingTour({
  open,
  onClose,
  onComplete,
  activeView,
  setActiveView,
  openCanvasView,
  generatorVisible,
  setGeneratorVisible,
}) {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [targetRect, setTargetRect] = React.useState(null);
  const dialogRef = React.useRef(null);
  const latestActionPropsRef = React.useRef({});
  const previousFocusRef = React.useRef(null);
  const wasOpenRef = React.useRef(false);
  const step = ONBOARDING_STEPS[stepIndex] || ONBOARDING_STEPS[0];

  latestActionPropsRef.current = {
    activeView,
    setActiveView,
    openCanvasView,
    generatorVisible,
    setGeneratorVisible,
  };

  const measure = React.useCallback(() => {
    if (!open) return;
    const target = findOnboardingTarget(step.targetIds);
    if (!target) {
      setTargetRect(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    setTargetRect({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
  }, [open, step]);

  React.useEffect(() => {
    if (!open) return undefined;
    const frame = requestMeasure(measure);
    const timer = window.setTimeout(measure, 80);
    return () => {
      cancelMeasure(frame);
      window.clearTimeout(timer);
    };
  }, [measure, open]);

  React.useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
      if (stepIndex !== 0) {
        setStepIndex(0);
        return;
      }
    }

    step.action?.(latestActionPropsRef.current);
  }, [open, stepIndex, step]);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    previousFocusRef.current = document.activeElement;
    const focusable = getFocusableElements(dialogRef.current);
    const focusTarget = focusable[0] || dialogRef.current;
    focusTarget?.focus?.({ preventScroll: true });

    return () => {
      const previousFocus = previousFocusRef.current;
      if (previousFocus && typeof previousFocus.focus === 'function' && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
      previousFocusRef.current = null;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return undefined;
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure, open]);

  React.useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onComplete?.({ skipped: true });
        onClose?.();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setStepIndex((value) => Math.min(ONBOARDING_STEPS.length - 1, value + 1));
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setStepIndex((value) => Math.max(0, value - 1));
      }
      if (event.key === 'Tab') {
        const focusable = getFocusableElements(dialogRef.current);
        if (focusable.length === 0) {
          event.preventDefault();
          dialogRef.current?.focus?.({ preventScroll: true });
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeElement = document.activeElement;
        if (event.shiftKey && (activeElement === first || !dialogRef.current?.contains(activeElement))) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!event.shiftKey && (activeElement === last || !dialogRef.current?.contains(activeElement))) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onComplete, open]);

  React.useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  if (!open) return null;

  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
  const fallback = !targetRect;

  const goPrevious = () => setStepIndex((value) => Math.max(0, value - 1));
  const goNext = () => setStepIndex((value) => Math.min(ONBOARDING_STEPS.length - 1, value + 1));
  const skip = () => {
    onComplete?.({ skipped: true });
    onClose?.();
  };
  const finish = () => {
    onComplete?.({ skipped: false });
    onClose?.();
  };

  return (
    <div
      ref={dialogRef}
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-body"
      tabIndex={-1}
    >
      <div className="onboarding-dim" />
      {targetRect ? <div className="onboarding-spotlight" style={rectStyle(targetRect)} /> : null}
      {targetRect ? <div className="onboarding-arrow" style={cardStyle(targetRect)} aria-hidden="true" /> : null}
      <section className={`onboarding-card${fallback ? ' is-fallback' : ''}`} style={cardStyle(targetRect)}>
        <span className="onboarding-eyebrow">{step.eyebrow}</span>
        <h2 id="onboarding-title">{step.title}</h2>
        <p id="onboarding-body">{step.body}</p>
        <div className="onboarding-progress" aria-label={`新手引导进度 ${stepIndex + 1} / ${ONBOARDING_STEPS.length}`}>
          {ONBOARDING_STEPS.map((item, index) => (
            <span key={item.id} className={index <= stepIndex ? 'active' : ''} />
          ))}
        </div>
        <footer className="onboarding-actions">
          <button type="button" className="onboarding-link" onClick={skip}>跳过</button>
          <span>{stepIndex + 1} / {ONBOARDING_STEPS.length}</span>
          <button type="button" onClick={goPrevious} disabled={stepIndex === 0}>上一步</button>
          {isLast ? (
            <button type="button" className="primary" onClick={finish}>完成</button>
          ) : (
            <button type="button" className="primary" onClick={goNext}>下一步</button>
          )}
        </footer>
      </section>
    </div>
  );
}
