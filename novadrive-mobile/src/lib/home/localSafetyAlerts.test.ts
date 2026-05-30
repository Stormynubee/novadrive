import { filterAlertsWithinKm, haversineKm } from './localSafetyAlerts';

describe('localSafetyAlerts', () => {
  it('computes haversine distance in km', () => {
    const d = haversineKm(13.0, 80.2, 13.01, 80.21);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(2);
  });

  it('filters alerts outside radius', () => {
    const alerts = [
      { id: 'a', lat: 13.0, lng: 80.2 },
      { id: 'b', lat: 20.0, lng: 77.0 },
    ];
    const near = filterAlertsWithinKm(alerts, 13.0, 80.2, 5);
    expect(near.map((a) => a.id)).toEqual(['a']);
  });
});
