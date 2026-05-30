const mockDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => mockDb),
}));

import {
  STATIC_SAFETY_HOTSPOTS,
  queryRouteSafety,
  type SafetyHotspot,
} from './safetyEngine';

describe('safetyEngine static data', () => {
  it('contains seeded accident hotspots', () => {
    expect(STATIC_SAFETY_HOTSPOTS.length).toBeGreaterThanOrEqual(36);
    const hasOdisha = STATIC_SAFETY_HOTSPOTS.some((h) => h.area.includes('Odisha') || h.area.includes('Bhubaneswar') || h.area.includes('Cuttack') || h.area.includes('Sambalpur'));
    const hasChennai = STATIC_SAFETY_HOTSPOTS.some((h) => h.area.includes('Chennai'));
    const hasPune = STATIC_SAFETY_HOTSPOTS.some((h) => h.area.includes('Pune'));
    
    expect(hasOdisha).toBe(true);
    expect(hasChennai).toBe(true);
    expect(hasPune).toBe(true);
  });
});

describe('queryRouteSafety failsafe levels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.execAsync.mockResolvedValue(undefined);
    mockDb.runAsync.mockResolvedValue(undefined);
    mockDb.getFirstAsync.mockResolvedValue({ c: STATIC_SAFETY_HOTSPOTS.length });
    mockDb.getAllAsync.mockResolvedValue([
      {
        area: 'SQLite Test Area, Odisha',
        risk: 'High',
        reason: 'Severe blackspot at highway intersection',
        lat: 20.2588,
        lng: 85.7876,
        suggestion: 'Drive cautiously, stay in designated lanes',
      },
    ]);
  });

  it('Level 1: Fetches successfully from Cloud API when online', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hotspots: [
          {
            area: 'Cloud API Hotspot, Chennai',
            risk: 'Medium',
            reason: 'Slippery coastal curve',
            lat: 12.9122,
            lng: 80.2520,
            suggestion: 'Maintain safe speed under 40km/h',
          },
        ],
      }),
    });

    const analysis = await queryRouteSafety(
      [{ lat: 12.9122, lng: 80.2520 }],
      'Chennai',
      mockFetch as never
    );

    expect(analysis.dataSource).toBe('cloud');
    expect(analysis.riskLevel).toBe('Medium');
    expect(analysis.safetyPct).toBe(75);
    expect(analysis.closestHotspot?.area).toBe('Cloud API Hotspot, Chennai');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('Level 2: Falls back to SQLite DB when Cloud API is unreachable', async () => {
    // Force cloud fetch to throw an error (offline / network error)
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const analysis = await queryRouteSafety(
      [{ lat: 20.2588, lng: 85.7876 }],
      'Bhubaneswar',
      mockFetch as never
    );

    expect(analysis.dataSource).toBe('sqlite');
    expect(analysis.riskLevel).toBe('High');
    expect(analysis.safetyPct).toBe(55);
    expect(analysis.closestHotspot?.area).toBe('SQLite Test Area, Odisha');
    expect(mockDb.getAllAsync).toHaveBeenCalled();
  });

  it('Level 3: Falls back to compiled in-memory static array if both Cloud and SQLite fail', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
    mockDb.getAllAsync.mockRejectedValue(new Error('SQLite query error'));

    // Test a coordinate close to the static 'Shivajinagar, Pune' hotspot (lat: 18.5308, lng: 73.8475)
    const analysis = await queryRouteSafety(
      [{ lat: 18.5308, lng: 73.8475 }],
      'Pune',
      mockFetch as never
    );

    expect(analysis.dataSource).toBe('memory');
    expect(analysis.riskLevel).toBe('High');
    expect(analysis.safetyPct).toBe(55);
    expect(analysis.closestHotspot?.area).toBe('Shivajinagar, Pune');
  });

  it('returns default low risk if no hotspots are close to the route', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
    mockDb.getAllAsync.mockResolvedValue([]); // No hotspots in database

    const analysis = await queryRouteSafety(
      [{ lat: 0.0, lng: 0.0 }], // middle of the ocean
      'Safe Ocean',
      mockFetch as never
    );

    expect(analysis.riskLevel).toBe('Low');
    expect(analysis.safetyPct).toBe(98);
    expect(analysis.closestHotspot).toBeNull();
  });
});
