export type LatLng = { lat: number; lng: number };

export type GeocodeResult = LatLng & {
  displayName: string;
};

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Margi/2.0 (roadsafetyhackathon; demo routing)';

export async function geocodePlace(
  query: string,
  fetchImpl: typeof fetch = fetch
): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`;
  const res = await fetchImpl(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Nominatim failed: ${res.status}`);
  const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  const hit = rows[0];
  if (!hit) return null;
  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    displayName: hit.display_name,
  };
}

export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
