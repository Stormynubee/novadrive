export type ActivationMode = 'auto' | 'manual';

/** Minimum splash dwell before auto mode advances to trauma response. */
export const ACTIVATION_SPLASH_SECONDS = 6;

type AutoNavigationInput = {
  mode: ActivationMode;
  secondsLeft: number;
  backendReady: boolean;
  alreadyNavigated: boolean;
};

export function shouldNavigateToResponse(input: AutoNavigationInput): boolean {
  if (input.alreadyNavigated) return false;
  if (input.mode !== 'auto') return false;
  if (input.secondsLeft > 0) return false;
  return true;
}
