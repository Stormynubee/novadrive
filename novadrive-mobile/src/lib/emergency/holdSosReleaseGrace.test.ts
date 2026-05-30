import { HOLD_SOS_RELEASE_GRACE_MS, shouldFireHoldSosOnRelease } from './holdSosReleaseGrace';

describe('holdSosReleaseGrace', () => {
  it('uses 120ms release grace', () => {
    expect(HOLD_SOS_RELEASE_GRACE_MS).toBe(120);
  });

  it('fires when release is within grace window of hold completion', () => {
    expect(shouldFireHoldSosOnRelease(3000, 3000)).toBe(true);
    expect(shouldFireHoldSosOnRelease(2900, 3000)).toBe(true);
    expect(shouldFireHoldSosOnRelease(2800, 3000)).toBe(false);
  });
});
