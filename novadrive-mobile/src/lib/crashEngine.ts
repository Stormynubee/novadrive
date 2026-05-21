export const CRASH_CONFIG = {
  PRE_SPEED_MIN_KMH: 25,
  SPEED_AFTER_MAX_KMH: 5,
  ACCEL_PEAK_THRESHOLD: 2.8,
  COOLDOWN_MS: 600_000,
  CANDIDATE_WINDOW_MS: 8_000,
  CALM_DIALOG_SECONDS: 15,
};

export type CrashEvent = 'BUMP_LOGGED' | 'CRASH_CANDIDATE' | 'SIMULATE_CRASH';

export interface SpeedSample {
  kmh: number;
  at: number;
}

export interface AccelSample {
  magnitude: number;
  at: number;
}

export interface CrashEngineState {
  lastCandidateAt: number;
  peakAccelInWindow: number;
  windowStart: number;
  speedBefore: number;
  speedAfter: number;
}

export function createCrashEngineState(): CrashEngineState {
  return {
    lastCandidateAt: 0,
    peakAccelInWindow: 0,
    windowStart: 0,
    speedBefore: 0,
    speedAfter: 0,
  };
}

export function kmhFromMps(mps: number): number {
  return mps * 3.6;
}

export function evaluateCrashCandidate(
  state: CrashEngineState,
  speedKmh: number,
  accelMag: number,
  now = Date.now()
): { state: CrashEngineState; event?: CrashEvent } {
  if (now - state.lastCandidateAt < CRASH_CONFIG.COOLDOWN_MS) {
    return { state };
  }

  if (now - state.windowStart > CRASH_CONFIG.CANDIDATE_WINDOW_MS) {
    state.windowStart = now;
    state.peakAccelInWindow = 0;
    state.speedBefore = speedKmh;
  }

  state.peakAccelInWindow = Math.max(state.peakAccelInWindow, accelMag);
  state.speedAfter = speedKmh;

  if (accelMag > CRASH_CONFIG.ACCEL_PEAK_THRESHOLD * 0.5 && accelMag <= CRASH_CONFIG.ACCEL_PEAK_THRESHOLD) {
    return { state, event: 'BUMP_LOGGED' };
  }

  const peakOk = state.peakAccelInWindow > CRASH_CONFIG.ACCEL_PEAK_THRESHOLD;
  const speedBeforeOk = state.speedBefore > CRASH_CONFIG.PRE_SPEED_MIN_KMH;
  const speedAfterOk = state.speedAfter < CRASH_CONFIG.SPEED_AFTER_MAX_KMH;

  if (peakOk && speedBeforeOk && speedAfterOk) {
    state.lastCandidateAt = now;
    return { state: { ...state, lastCandidateAt: now }, event: 'CRASH_CANDIDATE' };
  }

  return { state };
}
