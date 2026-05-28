export type ActivationMode = 'auto' | 'manual';

type AutoNavigationInput = {
  mode: ActivationMode;
  secondsLeft: number;
  backendReady: boolean;
  alreadyNavigated: boolean;
};

export function shouldNavigateToResponse(input: AutoNavigationInput): boolean {
  if (input.alreadyNavigated) return false;
  if (input.mode !== 'auto') return false;
  if (input.backendReady) return true;
  return input.secondsLeft <= 0;
}
