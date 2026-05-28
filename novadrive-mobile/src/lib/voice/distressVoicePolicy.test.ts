import {
  createVoicePolicyState,
  markNavigationTransition,
  markRecorderWarmup,
  markTtsMute,
  shouldProcessVoiceSample,
} from './distressVoicePolicy';

describe('shouldProcessVoiceSample', () => {
  const base = createVoicePolicyState(10_000);

  it('allows samples when all grace windows have passed', () => {
    expect(shouldProcessVoiceSample(base)).toBe(true);
  });

  it('blocks samples during navigation transition grace', () => {
    expect(
      shouldProcessVoiceSample({
        ...base,
        navigationTransitionUntil: 12_000,
      })
    ).toBe(false);
  });

  it('blocks samples while app TTS is muted', () => {
    expect(
      shouldProcessVoiceSample({ ...base, ttsMuteUntil: 11_000 })
    ).toBe(false);
  });

  it('blocks samples during recorder warm-up', () => {
    expect(
      shouldProcessVoiceSample({ ...base, recorderWarmUntil: 11_500 })
    ).toBe(false);
  });
});

describe('markNavigationTransition', () => {
  it('extends navigationTransitionUntil from now', () => {
    const next = markNavigationTransition(createVoicePolicyState(5_000), 5_000);
    expect(next.navigationTransitionUntil).toBe(9_000);
  });
});

describe('markTtsMute', () => {
  it('extends ttsMuteUntil by speech duration plus pad', () => {
    const next = markTtsMute(createVoicePolicyState(1_000), 2_000, 1_000);
    expect(next.ttsMuteUntil).toBe(4_500);
  });
});

describe('markRecorderWarmup', () => {
  it('extends recorderWarmUntil from now', () => {
    const next = markRecorderWarmup(createVoicePolicyState(0), 0);
    expect(next.recorderWarmUntil).toBe(6_000);
  });
});
