export interface DistressMessageInput {
  userName: string;
  lat: number;
  lng: number;
  stationName: string;
}

export function buildDistressSmsBody(input: DistressMessageInput): string {
  const mapsLink = `https://maps.google.com/?q=${input.lat},${input.lng}`;
  return [
    'NAARI SHAKTI DISTRESS',
    `Citizen: ${input.userName}`,
    `Nearest station: ${input.stationName}`,
    `Location: ${input.lat.toFixed(5)}, ${input.lng.toFixed(5)}`,
    mapsLink,
    'Immediate assistance required.',
  ].join('\n');
}

export function buildLocationShareBody(input: {
  userName: string;
  lat: number;
  lng: number;
}): string {
  const mapsLink = `https://maps.google.com/?q=${input.lat},${input.lng}`;
  return [
    'NAARI SHAKTI — Live location',
    `${input.userName} is sharing their location for safety.`,
    `Coordinates: ${input.lat.toFixed(5)}, ${input.lng.toFixed(5)}`,
    mapsLink,
  ].join('\n');
}

export function buildCommunityAlertBody(input: {
  userName: string;
  lat: number;
  lng: number;
  preset?: string;
}): string {
  const line = input.preset?.trim() || 'Emergency help needed at my location.';
  return [
    'NAARI SHAKTI — Community alert',
    `${input.userName}: ${line}`,
    `Location: ${input.lat.toFixed(5)}, ${input.lng.toFixed(5)}`,
    `https://maps.google.com/?q=${input.lat},${input.lng}`,
  ].join('\n');
}
