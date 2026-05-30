import type { ActivationMode } from './activationAuto';

/** Show manual Continue CTA only near end of auto countdown or in manual mode. */
export function shouldShowManualContinue(mode: ActivationMode, secondsLeft: number): boolean {
  if (mode === 'manual') return true;
  return secondsLeft <= 3;
}

export function autoAdvanceLabel(secondsLeft: number): string {
  if (secondsLeft <= 0) return 'Advancing now…';
  return `Auto-advancing in ${secondsLeft}s`;
}

export function activationCountdownProgress(
  secondsLeft: number,
  totalSeconds: number
): number {
  if (totalSeconds <= 0) return 1;
  return Math.max(0, Math.min(1, (totalSeconds - secondsLeft) / totalSeconds));
}
