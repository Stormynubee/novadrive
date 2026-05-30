import type { VoiceDistressSensitivity } from '../types';
import {
  createPanicVoiceState,
  evaluatePanicVoice,
  PANIC_VOICE_CONFIG,
  type PanicVoiceState,
} from '../panicVoiceEngine';
import type { DistressAudioFeatures } from './distressAudioFeatures';

export const DISTRESS_CLASSIFIER_CONFIG = {
  CONFIRM_FRAMES: 3,
  FRAME_WINDOW: 5,
  HIGH_BAND_MIN: 0.6,
  ZCR_MIN: 0.3,
  YAMNET_DISTRESS_MIN: 0.45,
};

export type DistressVoiceSample = {
  meteringDb: number;
  features: DistressAudioFeatures;
  yamnetDistress?: number;
};

export type DistressVoiceClassifierState = {
  panic: PanicVoiceState;
  recentHits: boolean[];
  lastAlertAt: number;
};

export function createDistressVoiceClassifierState(
  now = Date.now()
): DistressVoiceClassifierState {
  return {
    panic: createPanicVoiceState(now),
    recentHits: [],
    lastAlertAt: 0,
  };
}

function sensitivityConfig(sensitivity: VoiceDistressSensitivity) {
  switch (sensitivity) {
    case 'low':
      return {
        highBandMin: 0.68,
        zcrMin: 0.36,
        yamnetMin: 0.55,
        confirmFrames: 4,
      };
    case 'high':
      return {
        highBandMin: 0.55,
        zcrMin: 0.28,
        yamnetMin: 0.38,
        confirmFrames: 2,
      };
    default:
      return {
        highBandMin: DISTRESS_CLASSIFIER_CONFIG.HIGH_BAND_MIN,
        zcrMin: DISTRESS_CLASSIFIER_CONFIG.ZCR_MIN,
        yamnetMin: DISTRESS_CLASSIFIER_CONFIG.YAMNET_DISTRESS_MIN,
        confirmFrames: 4,
      };
  }
}

function spectralDistressHit(
  features: DistressAudioFeatures,
  yamnetDistress: number | undefined,
  thresholds: ReturnType<typeof sensitivityConfig>
): boolean {
  const spectral =
    features.highBandRatio >= thresholds.highBandMin &&
    features.zcr >= thresholds.zcrMin &&
    features.crestFactor >= 2.4;

  if (yamnetDistress != null) {
    return spectral && yamnetDistress >= thresholds.yamnetMin;
  }
  return spectral;
}

export function evaluateDistressVoice(
  state: DistressVoiceClassifierState,
  sample: DistressVoiceSample,
  options: {
    now?: number;
    sensitivity?: VoiceDistressSensitivity;
  } = {}
): { state: DistressVoiceClassifierState; alert: boolean } {
  const now = options.now ?? Date.now();
  const thresholds = sensitivityConfig(options.sensitivity ?? 'medium');

  if (now - state.lastAlertAt < PANIC_VOICE_CONFIG.COOLDOWN_MS) {
    const panicOnly = evaluatePanicVoice(state.panic, sample.meteringDb, now);
    return {
      state: { ...state, panic: panicOnly.state },
      alert: false,
    };
  }

  const panicResult = evaluatePanicVoice(state.panic, sample.meteringDb, now);
  const panic = panicResult.state;
  const aboveBaseline = panic.calibrated ? sample.meteringDb - panic.baselineDb : 0;
  const prefilterPass =
    !panic.calibrated ||
    aboveBaseline >= PANIC_VOICE_CONFIG.SUSTAINED_ABOVE_BASELINE_DB ||
    sample.meteringDb >= PANIC_VOICE_CONFIG.ABSOLUTE_LOUD_DB;

  const hit = prefilterPass && spectralDistressHit(sample.features, sample.yamnetDistress, thresholds);

  const recentHits = [...state.recentHits, hit].slice(-DISTRESS_CLASSIFIER_CONFIG.FRAME_WINDOW);
  const confirmCount = recentHits.filter(Boolean).length;
  const alert = confirmCount >= thresholds.confirmFrames;

  return {
    state: {
      panic,
      recentHits,
      lastAlertAt: alert ? now : state.lastAlertAt,
    },
    alert,
  };
}

export function getConfirmThreshold(sensitivity: VoiceDistressSensitivity = 'medium'): number {
  return sensitivityConfig(sensitivity).confirmFrames;
}
