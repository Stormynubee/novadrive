type LatLng = {
  lat: number;
  lng: number;
};

export function toCurrentLocationLabel(coords: LatLng | null): string {
  if (!coords) return 'Locating current location...';
  return `Current Location · ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
}
