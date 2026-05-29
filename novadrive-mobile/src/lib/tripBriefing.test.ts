jest.mock('./facilitiesDb', () => ({
  rankFacilities: jest.fn(async () => [
    {
      id: 'f1',
      name: 'Govt GH',
      type: 'hospital',
      traumaTier: 2,
      phone: '0441234567',
      distanceKm: 12,
      etaMinutes: 20,
      verified: true,
    },
  ]),
}));

jest.mock('./tripBriefingDb', () => ({
  listCorridorHazards: jest.fn(async (kind?: string) => {
    if (kind === 'hazard') {
      return [{ id: 1, name: 'Test hazard', note: 'Slow down', kind: 'hazard' as const }];
    }
    if (kind === 'deadzone') {
      return [{ id: 2, name: 'Test dead zone', note: 'Offline', kind: 'deadzone' as const }];
    }
    return [];
  }),
}));

import { buildTripBriefing } from './tripBriefing';

describe('buildTripBriefing', () => {
  it('builds cards from DB fixture hazards', async () => {
    const cards = await buildTripBriefing(
      { lat: 13, lng: 80, label: 'Start' },
      'Chennai'
    );
    const hazards = cards.find((c) => c.type === 'hazards');
    expect(hazards?.body).toContain('Test hazard');
    const dead = cards.find((c) => c.type === 'deadzone');
    expect(dead?.body).toContain('Test dead zone');
  });
});
