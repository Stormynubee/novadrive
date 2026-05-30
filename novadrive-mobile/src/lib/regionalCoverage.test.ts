import { resolveRegionalCoverage } from './regionalCoverage';

describe('resolveRegionalCoverage', () => {
  it('returns verified_pack for NH48 corridor coordinates', () => {
    const coverage = resolveRegionalCoverage(13.0, 80.2);
    expect(coverage).toEqual({
      mode: 'verified_pack',
      packId: 'nh48',
      stateName: 'Tamil Nadu',
      emergencyDial: '108',
      hasVerifiedHospitals: true,
    });
  });

  it('returns baseline mode for Odisha with no verified hospitals', () => {
    const coverage = resolveRegionalCoverage(20.2961, 85.8245);
    expect(coverage.mode).toBe('baseline');
    expect(coverage.packId).toBe('none');
    expect(coverage.stateName).toBe('Odisha');
    expect(coverage.emergencyDial).toBe('108');
    expect(coverage.hasVerifiedHospitals).toBe(false);
  });

  it('returns baseline for Tamil Nadu coords outside NH48 bbox', () => {
    const coverage = resolveRegionalCoverage(11.9416, 79.8083);
    expect(coverage.mode).toBe('baseline');
    expect(coverage.packId).toBe('none');
    expect(coverage.stateName).toBe('Tamil Nadu');
    expect(coverage.hasVerifiedHospitals).toBe(false);
  });
});
