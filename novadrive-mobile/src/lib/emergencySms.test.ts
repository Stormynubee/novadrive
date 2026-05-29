jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

jest.mock('expo-linking', () => ({
  canOpenURL: jest.fn(async () => true),
  openURL: jest.fn(async () => undefined),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 13.08, longitude: 80.27 },
  })),
}));

import * as Linking from 'expo-linking';
import { openEmergencySmsIntent, resolveEmergencyCoords } from './emergencySms';

describe('emergencySms', () => {
  it('resolves coordinates when permitted', async () => {
    const coords = await resolveEmergencyCoords();
    expect(coords?.lat).toBeCloseTo(13.08);
    expect(coords?.lng).toBeCloseTo(80.27);
  });

  it('opens SMS composer for SOS hold', async () => {
    const ok = await openEmergencySmsIntent('sos_hold', { lat: 12.9, lng: 80.1 });
    expect(ok).toBe(true);
    expect(Linking.openURL).toHaveBeenCalled();
    const url = (Linking.openURL as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('sms:108');
    expect(url).toContain('Hold-SOS');
  });
});
