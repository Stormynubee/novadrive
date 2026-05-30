jest.mock('expo-sqlite', () => {
  const nodes: Array<{
    id: string;
    name: string;
    type: string;
    trauma_tier: number;
    phone: string;
    lat: number;
    lng: number;
    verified: number;
  }> = [
    {
      id: 't1',
      name: 'Trauma Center Near',
      type: 'trauma',
      trauma_tier: 1,
      phone: '044-1111',
      lat: 13.0,
      lng: 80.2,
      verified: 1,
    },
    {
      id: 'c1',
      name: 'Clinic Near',
      type: 'clinic',
      trauma_tier: 3,
      phone: '044-2222',
      lat: 13.01,
      lng: 80.21,
      verified: 0,
    },
    {
      id: 't-far',
      name: 'Trauma Far',
      type: 'trauma',
      trauma_tier: 1,
      phone: '044-3333',
      lat: 14.0,
      lng: 81.0,
      verified: 1,
    },
  ];

  return {
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(async () => ({ c: nodes.length })),
      getAllAsync: jest.fn(async () => nodes),
    })),
  };
});

import { POI_DATA_VERIFIED, countVerifiedFacilities, rankFacilities } from './facilitiesDb';

describe('facilitiesDb', () => {
  it('exports demo seed verification date', () => {
    expect(POI_DATA_VERIFIED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('counts verified facilities from SEED pack', () => {
    expect(countVerifiedFacilities()).toBeGreaterThanOrEqual(1);
  });

  // C1 production gate — satisfied after Task 6 web-official pass (2026-05-30)
  it('reports at least 40 verified facilities in production pack', () => {
    expect(countVerifiedFacilities()).toBeGreaterThanOrEqual(40);
  });

  it('ranks nearest trauma first for RED triage and excludes clinics', async () => {
    const results = await rankFacilities('RED', 13.0, 80.2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).not.toBe('clinic');
    expect(results[0].recommended).toBe(true);
    expect(results[0].name).toBe('Trauma Center Near');
    expect(results[0].lat).toBe(13.0);
    expect(results[0].lng).toBe(80.2);
    expect(results.every((f) => f.type !== 'clinic')).toBe(true);
  });

  it('allows clinics for GREEN triage', async () => {
    const results = await rankFacilities('GREEN', 13.0, 80.2);
    expect(results.some((f) => f.type === 'clinic')).toBe(true);
  });
});
