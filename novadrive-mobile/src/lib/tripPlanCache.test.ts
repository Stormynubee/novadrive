jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    setItem: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    removeItem: jest.fn(async (k: string) => {
      delete store[k];
    }),
    __reset: () => {
      store = {};
    },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadTripPlanCache, saveTripPlanCache, TRIP_PLAN_CACHE_KEY } from './tripPlanCache';

describe('tripPlanCache', () => {
  beforeEach(() => {
    (AsyncStorage as unknown as { __reset: () => void }).__reset();
  });

  it('round-trips plan cache', async () => {
    expect(await loadTripPlanCache()).toBeNull();
    await saveTripPlanCache({
      originLabel: 'OMR',
      destinationLabel: 'Chennai',
      routeId: 'alpha',
      routeName: 'Corridor Alpha-1',
      savedAt: '2026-05-28T10:00:00.000Z',
      briefingSnapshot: [{ type: 'route', title: 'Route', body: 'Test' }],
    });
    const cached = await loadTripPlanCache();
    expect(cached?.routeId).toBe('alpha');
    expect(cached?.briefingSnapshot[0].title).toBe('Route');
    expect(TRIP_PLAN_CACHE_KEY).toBe('nd_last_trip_plan');
  });
});
