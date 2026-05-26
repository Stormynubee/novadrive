import type { UserProfile } from '../types';
import { buildCommunityAlertBody, buildDistressSmsBody } from './messages';
import { findNearestPoliceStation } from './stations';

export interface NaariDistressCoords {
  lat: number;
  lng: number;
}

export interface ActivateNaariDistressInput {
  profile: UserProfile;
  coords: NaariDistressCoords;
}

export interface ActivateNaariDistressDeps {
  speak: (message: string) => void | Promise<void>;
  openSms: (phone: string, body: string) => void | Promise<void>;
  startRecording: () => void | Promise<void>;
}

export interface ActivateNaariDistressResult {
  sessionId: string;
  stationName: string;
  coords: NaariDistressCoords;
}

export function activateNaariDistress(
  input: ActivateNaariDistressInput,
  deps: ActivateNaariDistressDeps
): ActivateNaariDistressResult {
  const userName = input.profile.name?.trim() || 'Citizen';
  const station = findNearestPoliceStation(input.coords.lat, input.coords.lng);
  const body = buildDistressSmsBody({
    userName,
    lat: input.coords.lat,
    lng: input.coords.lng,
    stationName: station.name,
  });

  deps.speak(
    'Emergency help activated. Your location is being shared with nearby responders.'
  );
  deps.startRecording();
  deps.openSms(station.phone, body);

  const ice = input.profile.medical?.primaryContact?.phone?.trim();
  const notifyIce = input.profile.settings?.notifyEmergencyContacts !== false;
  if (notifyIce && ice) {
    const iceBody = buildCommunityAlertBody({
      userName,
      lat: input.coords.lat,
      lng: input.coords.lng,
      preset: 'Emergency distress signal activated.',
    });
    deps.openSms(ice, iceBody);
  }

  return {
    sessionId: `naari-${Date.now()}`,
    stationName: station.name,
    coords: input.coords,
  };
}
