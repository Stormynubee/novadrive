export interface NaariPoliceStation {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
}

export const NAARI_POLICE_STATIONS: NaariPoliceStation[] = [
  { id: 'cl-phq', name: 'Civil Lines Police HQ', phone: '100', lat: 28.6315, lng: 77.2167 },
  { id: 'city-control', name: 'City Control Room', phone: '112', lat: 28.6139, lng: 77.209 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestPoliceStation(
  lat: number,
  lng: number
): NaariPoliceStation & { distanceKm: number; etaMinutes: number } {
  let best = NAARI_POLICE_STATIONS[0];
  let bestKm = haversineKm(lat, lng, best.lat, best.lng);
  for (let i = 1; i < NAARI_POLICE_STATIONS.length; i++) {
    const s = NAARI_POLICE_STATIONS[i];
    const km = haversineKm(lat, lng, s.lat, s.lng);
    if (km < bestKm) {
      best = s;
      bestKm = km;
    }
  }
  const etaMinutes = Math.max(2, Math.round(bestKm * 5));
  return { ...best, distanceKm: Math.round(bestKm * 10) / 10, etaMinutes };
}
