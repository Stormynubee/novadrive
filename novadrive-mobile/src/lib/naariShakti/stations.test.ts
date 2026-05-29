import { findNearestPoliceStation, NAARI_POLICE_STATIONS } from './stations';

describe('findNearestPoliceStation', () => {
  it('returns a Chennai corridor station when coords are near NH48 demo', () => {
    const near = findNearestPoliceStation(12.97, 80.21);
    expect(NAARI_POLICE_STATIONS.some((s) => s.id === near.id)).toBe(true);
    expect(near.lat).toBeGreaterThan(12);
    expect(near.lat).toBeLessThan(14);
    expect(near.lng).toBeGreaterThan(79);
    expect(near.lng).toBeLessThan(81);
    expect(near.distanceKm).toBeGreaterThanOrEqual(0);
  });

  it('prefers closer station on Tambaram side of corridor', () => {
    const tambaram = findNearestPoliceStation(12.925, 80.12);
    expect(tambaram.id).toBe('tambaram-ps');
  });
});
