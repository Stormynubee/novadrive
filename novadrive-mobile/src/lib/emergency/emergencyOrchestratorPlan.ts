import type { AppSettings, Facility, IncidentType, UserProfile } from '../types';

export type EmergencyOrchestratorPlan = {
  openIceSms: boolean;
  open108Sms: boolean;
  openMaps: boolean;
  icePhone: string | null;
  iceSmsBody: string | null;
  mapsTarget: { lat: number; lng: number } | null;
  nearestFacility: Facility | null;
  coords: { lat: number; lng: number } | null;
};

export function buildMargiIceSmsBody(input: {
  userName: string;
  lat: number;
  lng: number;
  incidentLabel: string;
}): string {
  const mapsLink = `https://maps.google.com/?q=${input.lat},${input.lng}`;
  return [
    'MARGI EMERGENCY SOS',
    `${input.userName} activated ${input.incidentLabel}.`,
    `Location: ${input.lat.toFixed(5)}, ${input.lng.toFixed(5)}`,
    mapsLink,
    'Please call or reach them immediately.',
  ].join('\n');
}

function incidentLabel(type: IncidentType): string {
  return type.replace(/_/g, ' ');
}

export function planEmergencyOrchestrator(input: {
  profile: UserProfile;
  settings: AppSettings;
  coords: { lat: number; lng: number } | null;
  incidentType: IncidentType;
  nearestFacility: Facility | null;
}): EmergencyOrchestratorPlan {
  const icePhone = input.profile.medical?.primaryContact?.phone?.trim() || null;
  const notifyIce = input.settings.notifyEmergencyContacts !== false;
  const userName = input.profile.name?.trim() || 'Citizen';
  const coords = input.coords;

  let iceSmsBody: string | null = null;
  if (coords && icePhone && notifyIce) {
    iceSmsBody = buildMargiIceSmsBody({
      userName,
      lat: coords.lat,
      lng: coords.lng,
      incidentLabel: incidentLabel(input.incidentType),
    });
  }

  const mapsTarget =
    input.nearestFacility?.lat != null && input.nearestFacility?.lng != null
      ? { lat: input.nearestFacility.lat, lng: input.nearestFacility.lng }
      : null;

  return {
    openIceSms: Boolean(icePhone && notifyIce && iceSmsBody),
    open108Sms: true,
    openMaps: mapsTarget != null,
    icePhone,
    iceSmsBody,
    mapsTarget,
    nearestFacility: input.nearestFacility,
    coords,
  };
}
