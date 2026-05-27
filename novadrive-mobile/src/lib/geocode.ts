import * as Location from 'expo-location';

export async function reverseGeocodePlace(
  lat: number,
  lng: number
): Promise<{ landmark: string; city?: string; district?: string; region?: string }> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const place = results[0];
    if (place) {
      const parts = [
        place.name,
        place.street,
        place.district ?? place.subregion,
        place.city,
        place.region,
      ].filter((p): p is string => !!p && p.length > 0);
      const unique = [...new Set(parts)];
      return {
        landmark: unique.slice(0, 3).join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        city: place.city ?? undefined,
        district: place.district ?? place.subregion ?? undefined,
        region: place.region ?? undefined,
      };
    }
  } catch {
    /* offline or permission */
  }
  return { landmark: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
}
