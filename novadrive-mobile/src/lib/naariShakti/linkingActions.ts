import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import type { UserProfile } from '../types';
import { buildDistressSmsBody, buildLocationShareBody } from './messages';
import { findNearestPoliceStation } from './stations';
import { WOMENS_HELPLINE } from './helplines';

export async function openSmsUrl(phone: string, body: string): Promise<boolean> {
  const url = `sms:${phone}?body=${encodeURIComponent(body)}`;
  const ok = await Linking.canOpenURL(url);
  if (!ok) {
    Alert.alert(
      'SMS unavailable',
      'Could not open the messaging app. Copy your location from Quick Help and send manually.'
    );
    return false;
  }
  await Linking.openURL(url);
  return true;
}

export async function dialHelpline(phone: string): Promise<void> {
  const url = `tel:${phone}`;
  const ok = await Linking.canOpenURL(url);
  if (!ok) {
    Alert.alert('Call unavailable', `Unable to dial ${phone} on this device.`);
    return;
  }
  await Linking.openURL(url);
}

export async function smsNearestStation(
  profile: UserProfile,
  coords: { lat: number; lng: number }
): Promise<void> {
  const station = findNearestPoliceStation(coords.lat, coords.lng);
  const body = buildDistressSmsBody({
    userName: profile.name?.trim() || 'Citizen',
    lat: coords.lat,
    lng: coords.lng,
    stationName: station.name,
  });
  await openSmsUrl(station.phone, body);
}

export async function shareLiveLocation(
  profile: UserProfile,
  coords: { lat: number; lng: number }
): Promise<void> {
  const ice = profile.medical?.primaryContact?.phone?.trim();
  const body = buildLocationShareBody({
    userName: profile.name?.trim() || 'Citizen',
    lat: coords.lat,
    lng: coords.lng,
  });
  if (ice) {
    await openSmsUrl(ice, body);
    return;
  }
  Alert.alert(
    'No ICE contact',
    'Add a primary emergency contact in your Medical Profile to share live location.'
  );
}

export async function dialWomensHelpline(): Promise<void> {
  await dialHelpline(WOMENS_HELPLINE);
}

export function openMapsNavigate(lat: number, lng: number): void {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  Linking.openURL(url).catch(() => {
    Alert.alert('Navigation unavailable', 'Could not open maps on this device.');
  });
}
