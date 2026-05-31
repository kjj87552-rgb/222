export const onboardingStyles = `
.onboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: auto;
  font-family: var(--font-display, Inter, system-ui, sans-serif);
}

.onboarding-dim {
  position: absolute;
  inset: 0;
  background: rgba(8, 11, 18, 0.64);
  backdrop-filter: blur(2px);
}

.onboarding-spotlight {
  position: fixed;
  z-index: 1;
  border: 2px solid color-mix(in oklab, var(--accent) 82%, white 18%);
  border-radius: 14px;
  box-shadow:
    0 0 0 9999px rgba(8, 11, 18, 0.38),
    0 0 0 8px color-mix(in oklab, var(--accent) 24%, transparent),
    0 16px 42px rgba(0, 0, 0, 0.26);
  animation: onboardingPulse 1.6s ease-in-out infinite;
  pointer-events: none;
}

.onboarding-arrow {
  position: fixed;
  z-index: 2;
  width: 0;
  height: 0;
  transform: translate(-16px, 34px);
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
  border-right: 12px solid color-mix(in oklab, var(--paper) 96%, white 4%);
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18));
  animation: onboardingNudge 1.2s ease-in-out infinite;
}

.onboarding-card {
  position: fixed;
  z-index: 3;
  width: min(360px, calc(100vw - 32px));
  padding: 18px;
  border-radius: 12px;
  border: 1px solid color-mix(in oklab, var(--line) 74%, var(--accent) 26%);
  background: color-mix(in oklab, var(--paper) 96%, white 4%);
  color: var(--ink);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
  animation: onboardingCardIn 160ms ease-out;
}

.onboarding-card.is-fallback {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.onboarding-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.onboarding-card h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: 0;
}

.onboarding-card p {
  margin: 10px 0 14px;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.65;
}

.onboarding-progress {
  display: flex;
  gap: 5px;
  margin: 0 0 14px;
}

.onboarding-progress span {
  height: 4px;
  flex: 1;
  border-radius: 999px;
  background: color-mix(in oklab, var(--line) 80%, transparent);
}

.onboarding-progress span.active {
  background: var(--accent);
}

.onboarding-actions {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 8px;
}

.onboarding-actions span {
  justify-self: center;
  color: var(--ink-soft);
  font-size: 12px;
}

.onboarding-actions button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: color-mix(in oklab, var(--paper) 90%, white 10%);
  color: var(--ink);
  cursor: pointer;
  font-size: 13px;
}

.onboarding-actions button:disabled {
  opacity: 0.46;
  cursor: not-allowed;
}

.onboarding-actions button.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
  font-weight: 700;
}

.onboarding-actions .onboarding-link {
  border-color: transparent;
  background: transparent;
  color: var(--ink-soft);
}

@keyframes onboardingPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.012); }
}

@keyframes onboardingNudge {
  0%, 100% { margin-left: 0; }
  50% { margin-left: -5px; }
}

@keyframes onboardingCardIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .onboarding-spotlight,
  .onboarding-arrow,
  .onboarding-card {
    animation: none;
  }
}
`;
