export interface NaariPoliceStation {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
}

/** Demo seed aligned with Chennai / NH48 corridor POIs — not live dispatch data. */
export const NAARI_POLICE_STATIONS: NaariPoliceStation[] = [
  {
    id: 'egmore-ps',
    name: 'Egmore Police Station (demo)',
    phone: '100',
    lat: 13.0731,
    lng: 80.2609,
  },
  {
    id: 't-nagar-ps',
    name: 'T Nagar Police Station (demo)',
    phone: '100',
    lat: 13.0418,
    lng: 80.2341,
  },
  {
    id: 'tambaram-ps',
    name: 'Tambaram Police Station (NH48 demo)',
    phone: '100',
    lat: 12.9249,
    lng: 80.12,
  },
  {
    id: 'chennai-control',
    name: 'Chennai City Control Room (demo)',
    phone: '112',
    lat: 13.0569,
    lng: 80.2598,
  },
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
