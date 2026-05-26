import {
  isNaariShaktiEligible,
  shouldShowNaariHomeCard,
  shouldShowProtocolModal,
} from './eligibility';

describe('isNaariShaktiEligible', () => {
  it('returns true only for female gender', () => {
    expect(isNaariShaktiEligible({ mode: 'guest', gender: 'female' })).toBe(true);
    expect(isNaariShaktiEligible({ mode: 'guest', gender: 'male' })).toBe(false);
    expect(isNaariShaktiEligible({ mode: 'guest' })).toBe(false);
  });
});

describe('shouldShowNaariHomeCard', () => {
  it('matches eligibility', () => {
    expect(shouldShowNaariHomeCard({ mode: 'guest', gender: 'female' })).toBe(true);
    expect(shouldShowNaariHomeCard({ mode: 'guest', gender: 'male' })).toBe(false);
  });
});

describe('shouldShowProtocolModal', () => {
  it('shows modal when eligible and portal not enabled', () => {
    expect(
      shouldShowProtocolModal({
        mode: 'guest',
        gender: 'female',
        naariShakti: { enabled: false, safetyModeActive: false },
      })
    ).toBe(true);
    expect(
      shouldShowProtocolModal({
        mode: 'guest',
        gender: 'female',
        naariShakti: { enabled: true, safetyModeActive: true },
      })
    ).toBe(false);
  });
});
