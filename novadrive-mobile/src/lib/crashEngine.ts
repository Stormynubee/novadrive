import type { SosSensitivity } from './types';

export const CRASH_CONFIG = {
  /** Highway-style crash: was moving fast, then nearly stopped */
  PRE_SPEED_MIN_KMH: 25,
  SPEED_AFTER_MAX_KMH: 5,
  ACCEL_PEAK_THRESHOLD: 2.8,
  /** Throw / drop / launch — no GPS speed required */
  IMPACT_PEAK_THRESHOLD: 2.4,
  IMPACT_SEVERE_PEAK: 3.2,
  JERK_THRESHOLD: 1.6,
  FREE_FALL_THRESHOLD: 0.45,
  COOLDOWN_MS: 90_000,
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
  peakJerkInWindow: number;
  windowStart: number;
  speedBefore: number;
  speedAfter: number;
  lastAccelMag: number;
  freeFallSeen: boolean;
}

export function resetCrashDetectionCooldown(state: CrashEngineState): void {
  state.lastCandidateAt = 0;
}

export function createCrashEngineState(): CrashEngineState {
  return {
    lastCandidateAt: 0,
    peakAccelInWindow: 0,
    peakJerkInWindow: 0,
    windowStart: 0,
    speedBefore: 0,
    speedAfter: 0,
    lastAccelMag: 1,
    freeFallSeen: false,
  };
}

export function kmhFromMps(mps: number): number {
  return mps * 3.6;
}

/** Total acceleration magnitude in g (device at rest ≈ 1.0). */
export function accelMagnitudeG(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

function resetWindow(state: CrashEngineState, now: number, speedKmh: number): void {
  state.windowStart = now;
  state.peakAccelInWindow = 0;
  state.peakJerkInWindow = 0;
  state.speedBefore = speedKmh;
  state.freeFallSeen = false;
}

export interface CrashSensitivityThresholds {
  accelPeak: number;
  impactPeak: number;
  impactSevere: number;
  jerk: number;
  preSpeedMin: number;
}

export function thresholdsForSensitivity(
  sensitivity: SosSensitivity = 'high'
): CrashSensitivityThresholds {
  const scale = sensitivity === 'low' ? 1.28 : sensitivity === 'medium' ? 1.12 : 1;
  return {
    accelPeak: CRASH_CONFIG.ACCEL_PEAK_THRESHOLD * scale,
    impactPeak: CRASH_CONFIG.IMPACT_PEAK_THRESHOLD * scale,
    impactSevere: CRASH_CONFIG.IMPACT_SEVERE_PEAK * scale,
    jerk: CRASH_CONFIG.JERK_THRESHOLD * scale,
    preSpeedMin: CRASH_CONFIG.PRE_SPEED_MIN_KMH * (sensitivity === 'low' ? 1.08 : 1),
  };
}

/** Vehicle deceleration crash (GPS speed drop + impact). */
function isVehicleCrash(state: CrashEngineState, t: CrashSensitivityThresholds): boolean {
  const peakOk = state.peakAccelInWindow > t.accelPeak;
  const speedBeforeOk = state.speedBefore > t.preSpeedMin;
  const speedAfterOk = state.speedAfter < CRASH_CONFIG.SPEED_AFTER_MAX_KMH;
  return peakOk && speedBeforeOk && speedAfterOk;
}

/**
 * Impact crash: phone thrown, dropped, or violent jerk without reliable GPS speed change.
 * - Severe peak (launch/impact)
 * - Free-fall then impact (drop)
 * - High jerk + meaningful peak (throw from hand)
 */
function isImpactCrash(state: CrashEngineState, t: CrashSensitivityThresholds): boolean {
  const peak = state.peakAccelInWindow;
  const jerk = state.peakJerkInWindow;

  if (peak >= t.impactSevere) return true;
  if (state.freeFallSeen && peak >= t.impactPeak) return true;
  if (peak >= t.impactPeak && jerk >= t.jerk) return true;
  if (jerk >= t.jerk + 0.8 && peak >= t.accelPeak) return true;
  return false;
}

export function evaluateCrashCandidate(
  state: CrashEngineState,
  speedKmh: number,
  accelMag: number | null,
  now = Date.now(),
  sensitivity: SosSensitivity = 'high'
): { state: CrashEngineState; event?: CrashEvent } {
  const thresholds = thresholdsForSensitivity(sensitivity);
  if (now - state.lastCandidateAt < CRASH_CONFIG.COOLDOWN_MS) {
    return { state };
  }

  if (now - state.windowStart > CRASH_CONFIG.CANDIDATE_WINDOW_MS) {
    resetWindow(state, now, speedKmh);
  }

  state.speedAfter = speedKmh;

  if (accelMag != null) {
    const jerk = Math.abs(accelMag - state.lastAccelMag);
    state.lastAccelMag = accelMag;
    state.peakJerkInWindow = Math.max(state.peakJerkInWindow, jerk);
    state.peakAccelInWindow = Math.max(state.peakAccelInWindow, accelMag);
  }

  if (accelMag != null && accelMag < CRASH_CONFIG.FREE_FALL_THRESHOLD) {
    state.freeFallSeen = true;
  }

  if (
    accelMag != null &&
    accelMag > CRASH_CONFIG.ACCEL_PEAK_THRESHOLD * 0.5 &&
    accelMag <= thresholds.accelPeak &&
    !isImpactCrash(state, thresholds)
  ) {
    return { state, event: 'BUMP_LOGGED' };
  }

  if (isVehicleCrash(state, thresholds) || isImpactCrash(state, thresholds)) {
    state.lastCandidateAt = now;
    return { state: { ...state, lastCandidateAt: now }, event: 'CRASH_CANDIDATE' };
  }

  return { state };
}
