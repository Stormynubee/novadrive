import { buildDispatchBody, resolveDispatchEndpoints } from './dispatchOrchestrator';

describe('dispatchOrchestrator', () => {
  it('detects configured endpoints', () => {
    expect(
      resolveDispatchEndpoints({
        traumaUrl: 'https://api.example.com/trauma',
        policeUrl: 'https://api.example.com/police',
      }).configured
    ).toBe(true);
    expect(
      resolveDispatchEndpoints({
        traumaUrl: 'https://dispatch.novadrive.local/trauma',
        policeUrl: 'https://api.example.com/police',
      }).configured
    ).toBe(false);
  });

  it('includes medical when autoDispatchMedical is on', () => {
    const body = buildDispatchBody({
      incidentType: 'road_accident',
      lat: 13,
      lng: 77,
      language: 'en',
      autoDispatchMedical: true,
      medical: {
        bloodType: 'O+',
        allergies: 'none',
        conditions: '',
        medications: '',
        primaryContact: { fullName: 'ICE', relationship: 'spouse', phone: '999' },
        emergencyContact: '',
      },
    });
    expect(body.medical).toBeDefined();
  });
});
