import { buildVolunteerNotifyResult, haversineKm } from './volunteerProviders';

describe('volunteerProviders', () => {
  it('computes haversine distance', () => {
    const km = haversineKm({ lat: 13.0, lng: 77.0 }, { lat: 13.01, lng: 77.01 });
    expect(km).toBeGreaterThan(0);
    expect(km).toBeLessThan(5);
  });

  it('builds notify result with unique phones', () => {
    const result = buildVolunteerNotifyResult([
      {
        id: '1',
        org_name: 'A',
        contact_name: 'X',
        phone: '+911080000000',
        service_area: 'Chennai',
        lat: 13,
        lng: 77,
        verified: true,
      },
      {
        id: '2',
        org_name: 'B',
        contact_name: 'Y',
        phone: '+911080000000',
        service_area: 'Chennai',
        lat: 13.01,
        lng: 77.01,
        verified: true,
      },
    ]);
    expect(result.notified).toHaveLength(2);
    expect(result.smsTargets).toEqual(['+911080000000']);
  });
});
