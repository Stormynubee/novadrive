export const CANCEL_SOS_SECONDS = 10;

export function formatCancelSosLabel(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return 'CANCEL SOS (EXPIRED)';
  return `CANCEL SOS (${secondsRemaining}s)`;
}

export function canCancelSos(secondsRemaining: number): boolean {
  return secondsRemaining > 0;
}

export function nextCancelSeconds(secondsRemaining: number): number {
  return Math.max(0, secondsRemaining - 1);
}
