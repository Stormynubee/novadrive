import { resolveHospitalNavTarget } from './hospitalNavTarget';

describe('hospitalNavTarget', () => {
  it('prefers facility coordinates over user location', () => {
    const target = resolveHospitalNavTarget({
      facility: {
        id: '1',
        name: 'Apollo Trauma',
        type: 'trauma',
        traumaTier: 1,
        phone: '108',
        lat: 13.05,
        lng: 80.2,
        distanceKm: 2,
        etaMinutes: 8,
      },
      location: { lat: 12.9, lng: 80.1, capturedAt: '2026-05-28T00:00:00Z' },
    });
    expect(target).toEqual({ lat: 13.05, lng: 80.2, label: 'Apollo Trauma' });
  });

  it('returns null when facility has no coordinates', () => {
    expect(resolveHospitalNavTarget({ location: { lat: 12.9, lng: 80.1, capturedAt: '' } })).toBeNull();
  });
});
