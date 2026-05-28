export const VOICE_POLICY = {
  NAVIGATION_GRACE_MS: 4_000,
  RECORDER_WARMUP_MS: 6_000,
  TTS_MUTE_PAD_MS: 1_500,
};

export type VoicePolicyState = {
  navigationTransitionUntil: number;
  ttsMuteUntil: number;
  recorderWarmUntil: number;
  now: number;
};

export function createVoicePolicyState(now = Date.now()): VoicePolicyState {
  return {
    navigationTransitionUntil: 0,
    ttsMuteUntil: 0,
    recorderWarmUntil: 0,
    now,
  };
}

export function shouldProcessVoiceSample(state: VoicePolicyState): boolean {
  return (
    state.now >= state.navigationTransitionUntil &&
    state.now >= state.ttsMuteUntil &&
    state.now >= state.recorderWarmUntil
  );
}

export function markNavigationTransition(
  state: VoicePolicyState,
  now = Date.now()
): VoicePolicyState {
  return {
    ...state,
    now,
    navigationTransitionUntil: now + VOICE_POLICY.NAVIGATION_GRACE_MS,
  };
}

export function markTtsMute(
  state: VoicePolicyState,
  estimatedSpeechMs: number,
  now = Date.now()
): VoicePolicyState {
  const until = now + estimatedSpeechMs + VOICE_POLICY.TTS_MUTE_PAD_MS;
  return {
    ...state,
    now,
    ttsMuteUntil: Math.max(state.ttsMuteUntil, until),
  };
}

export function markRecorderWarmup(state: VoicePolicyState, now = Date.now()): VoicePolicyState {
  return {
    ...state,
    now,
    recorderWarmUntil: now + VOICE_POLICY.RECORDER_WARMUP_MS,
  };
}
