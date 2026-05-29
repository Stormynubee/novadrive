import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { GHP_SMS_HEADER } from './brand';

export type EmergencySmsKind = 'sos_hold' | 'crash_detected';

const TEMPLATES: Record<EmergencySmsKind, (lat: number, lng: number) => string> = {
  sos_hold: (lat, lng) =>
    `${GHP_SMS_HEADER}\nPossible road emergency. Hold-SOS activated.\nLocation: ${lat.toFixed(5)}, ${lng.toFixed(5)}\nTime: ${new Date().toISOString()}\nReply if you can reach the driver.`,
  crash_detected: (lat, lng) =>
    `${GHP_SMS_HEADER}\nPossible crash detected (sensors). No response on calm timer.\nLocation: ${lat.toFixed(5)}, ${lng.toFixed(5)}\nTime: ${new Date().toISOString()}\nDriver may be unable to use the phone.`,
};

export async function resolveEmergencyCoords(): Promise<{ lat: number; lng: number } | null> {
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      const req = await Location.requestForegroundPermissionsAsync();
      if (req.status !== 'granted') return null;
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

/** Opens the OS SMS composer to 108 — user must tap Send. Returns false if SMS URL cannot open. */
export async function openEmergencySmsIntent(
  kind: EmergencySmsKind,
  coords?: { lat: number; lng: number } | null
): Promise<boolean> {
  const loc = coords ?? (await resolveEmergencyCoords());
  const body = loc
    ? TEMPLATES[kind](loc.lat, loc.lng)
    : `${GHP_SMS_HEADER}\n${kind === 'sos_hold' ? 'Possible road emergency (Hold SOS).' : 'Possible crash detected.'}\nLocation unavailable — check Margi app if installed.`;
  const url = `sms:108?body=${encodeURIComponent(body)}`;
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert('SMS 108', body);
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert('SMS 108', body);
    return false;
  }
}
