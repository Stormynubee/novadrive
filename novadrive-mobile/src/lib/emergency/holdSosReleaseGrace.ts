export const HOLD_SOS_RELEASE_GRACE_MS = 120;

/** If finger lifts within grace after hold completes, still fire SOS (timer vs pressOut race). */
export function shouldFireHoldSosOnRelease(elapsedMs: number, holdMs: number): boolean {
  return elapsedMs >= holdMs - HOLD_SOS_RELEASE_GRACE_MS;
}
