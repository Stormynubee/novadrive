import { formatRouteDistanceKm, formatRouteMinutes } from './osrm';

describe('osrm helpers', () => {
  it('formats distance and duration', () => {
    expect(formatRouteDistanceKm(12400)).toBe(12.4);
    expect(formatRouteMinutes(1920)).toBe(32);
    expect(formatRouteMinutes(30)).toBe(1);
  });
});

describe('fetchDrivingRoute', () => {
  it('parses geojson route', async () => {
    const { fetchDrivingRoute } = await import('./osrm');
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [
          {
            distance: 5000,
            duration: 600,
            geometry: { coordinates: [[77.0, 13.0], [77.1, 13.1]] },
          },
        ],
      }),
    });
    const route = await fetchDrivingRoute(
      { lat: 13.0, lng: 77.0 },
      { lat: 13.1, lng: 77.1 },
      mockFetch as never
    );
    expect(route?.distanceM).toBe(5000);
    expect(route?.coordinates).toHaveLength(2);
  });
});
