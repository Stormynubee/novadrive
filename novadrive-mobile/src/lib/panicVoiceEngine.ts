export const PANIC_VOICE_CONFIG = {
  /** Learn cabin noise before detecting screams */
  CALIBRATION_MS: 2_500,
  /** dB above rolling baseline — sudden shout */
  SPIKE_ABOVE_BASELINE_DB: 11,
  /** Absolute loud floor (metering dB, closer to 0 = louder) */
  ABSOLUTE_LOUD_DB: -24,
  /** Strong single hit (scream / panic) */
  PANIC_ABOVE_BASELINE_DB: 16,
  /** Consecutive loud samples within burst window */
  SUSTAINED_COUNT: 3,
  SUSTAINED_ABOVE_BASELINE_DB: 7,
  BURST_WINDOW_MS: 900,
  COOLDOWN_MS: 45_000,
};

export type PanicVoiceEvent = 'VOICE_SAMPLE' | 'PANIC_CANDIDATE';

export interface PanicVoiceState {
  startedAt: number;
  calibrated: boolean;
  baselineDb: number;
  calibrationSum: number;
  calibrationCount: number;
  lastTriggerAt: number;
  burstStart: number;
  loudStreak: number;
  peakAboveBaseline: number;
}

export function createPanicVoiceState(now = Date.now()): PanicVoiceState {
  return {
    startedAt: now,
    calibrated: false,
    baselineDb: -42,
    calibrationSum: 0,
    calibrationCount: 0,
    lastTriggerAt: 0,
    burstStart: 0,
    loudStreak: 0,
    peakAboveBaseline: 0,
  };
}

function updateBaseline(state: PanicVoiceState, db: number): void {
  state.calibrationSum += db;
  state.calibrationCount += 1;
  state.baselineDb = state.calibrationSum / state.calibrationCount;
}

export function evaluatePanicVoice(
  state: PanicVoiceState,
  meteringDb: number,
  now = Date.now()
): { state: PanicVoiceState; event?: PanicVoiceEvent } {
  if (now - state.lastTriggerAt < PANIC_VOICE_CONFIG.COOLDOWN_MS) {
    return { state };
  }

  if (!state.calibrated) {
    updateBaseline(state, meteringDb);
    if (now - state.startedAt >= PANIC_VOICE_CONFIG.CALIBRATION_MS) {
      state.calibrated = true;
    }
    return { state, event: 'VOICE_SAMPLE' };
  }

  const above = meteringDb - state.baselineDb;
  state.peakAboveBaseline = Math.max(state.peakAboveBaseline, above);

  if (above >= PANIC_VOICE_CONFIG.SUSTAINED_ABOVE_BASELINE_DB) {
    if (state.loudStreak === 0) state.burstStart = now;
    state.loudStreak += 1;
  } else if (now - state.burstStart > PANIC_VOICE_CONFIG.BURST_WINDOW_MS) {
    state.loudStreak = 0;
    state.peakAboveBaseline = 0;
  }

  const absoluteLoud = meteringDb >= PANIC_VOICE_CONFIG.ABSOLUTE_LOUD_DB;
  const panicSpike = above >= PANIC_VOICE_CONFIG.PANIC_ABOVE_BASELINE_DB && absoluteLoud;
  const sharpSpike =
    above >= PANIC_VOICE_CONFIG.SPIKE_ABOVE_BASELINE_DB &&
    meteringDb >= PANIC_VOICE_CONFIG.ABSOLUTE_LOUD_DB - 4;
  const sustainedBurst =
    state.loudStreak >= PANIC_VOICE_CONFIG.SUSTAINED_COUNT &&
    now - state.burstStart <= PANIC_VOICE_CONFIG.BURST_WINDOW_MS &&
    state.peakAboveBaseline >= PANIC_VOICE_CONFIG.SPIKE_ABOVE_BASELINE_DB;

  if (panicSpike || (sharpSpike && sustainedBurst)) {
    state.lastTriggerAt = now;
    state.loudStreak = 0;
    state.peakAboveBaseline = 0;
    return { state: { ...state, lastTriggerAt: now }, event: 'PANIC_CANDIDATE' };
  }

  return { state, event: 'VOICE_SAMPLE' };
}
