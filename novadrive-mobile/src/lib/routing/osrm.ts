import type { LatLng } from './nominatim';

export type OsrmRoute = {
  distanceM: number;
  durationS: number;
  coordinates: LatLng[];
};

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export async function fetchDrivingRoute(
  origin: LatLng,
  destination: LatLng,
  fetchImpl: typeof fetch = fetch
): Promise<OsrmRoute | null> {
  const path = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_BASE}/${path}?overview=full&geometries=geojson`;
  const res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`OSRM failed: ${res.status}`);
  const payload = (await res.json()) as {
    routes?: Array<{
      distance: number;
      duration: number;
      geometry?: { coordinates?: [number, number][] };
    }>;
  };
  const route = payload.routes?.[0];
  if (!route?.geometry?.coordinates?.length) return null;
  return {
    distanceM: route.distance,
    durationS: route.duration,
    coordinates: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
  };
}

export function formatRouteDistanceKm(distanceM: number): number {
  return Math.round((distanceM / 1000) * 10) / 10;
}

export function formatRouteMinutes(durationS: number): number {
  return Math.max(1, Math.round(durationS / 60));
}
