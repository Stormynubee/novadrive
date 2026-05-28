type LiteLocation = {
  lat: number;
  lng: number;
};

export function pickDispatchLocation(
  sessionLocation?: LiteLocation,
  freshLocation?: LiteLocation | null
): LiteLocation | null {
  if (freshLocation) return freshLocation;
  if (sessionLocation) return sessionLocation;
  return null;
}
