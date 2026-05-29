import { geocodePlace, type GeocodeResult, type LatLng } from './nominatim';
import {
  fetchDrivingRoute,
  formatRouteDistanceKm,
  formatRouteMinutes,
  type OsrmRoute,
} from './osrm';

export type TripRoutePlan = {
  origin: LatLng;
  destination: GeocodeResult;
  route: OsrmRoute;
  distanceKm: number;
  minutes: number;
};

export async function planTripRoute(input: {
  origin: LatLng;
  destinationQuery: string;
  fetchImpl?: typeof fetch;
}): Promise<TripRoutePlan | null> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const destination = await geocodePlace(input.destinationQuery, fetchImpl);
  if (!destination) return null;
  const route = await fetchDrivingRoute(input.origin, destination, fetchImpl);
  if (!route) return null;
  return {
    origin: input.origin,
    destination,
    route,
    distanceKm: formatRouteDistanceKm(route.distanceM),
    minutes: formatRouteMinutes(route.durationS),
  };
}

export function projectPolylineToViewBox(
  coordinates: LatLng[],
  viewW: number,
  viewH: number,
  padding = 12
): string {
  if (coordinates.length < 2) return '';
  const lats = coordinates.map((c) => c.lat);
  const lngs = coordinates.map((c) => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 0.001;
  const lngSpan = maxLng - minLng || 0.001;
  const innerW = viewW - padding * 2;
  const innerH = viewH - padding * 2;

  const points = coordinates.map((c) => {
    const x = padding + ((c.lng - minLng) / lngSpan) * innerW;
    const y = padding + (1 - (c.lat - minLat) / latSpan) * innerH;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return `M ${points.join(' L ')}`;
}
