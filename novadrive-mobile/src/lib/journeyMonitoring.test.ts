import { shouldEnableVoiceMonitoring } from './journeyMonitoring';
import type { AppSettings } from './types';

const baseSettings = (): AppSettings => ({
  language: 'en',
  regionalProtocols: true,
  biometricAuth: false,
  sosSensitivity: 'high',
  telemetrySharing: true,
  autoDispatchMedical: true,
  notifyEmergencyContacts: true,
  lockDeviceScreen: false,
  voiceCrashDetection: true,
});

describe('shouldEnableVoiceMonitoring', () => {
  it('is true when voiceCrashDetection is on or unset', () => {
    expect(shouldEnableVoiceMonitoring(baseSettings())).toBe(true);
    expect(
      shouldEnableVoiceMonitoring({ ...baseSettings(), voiceCrashDetection: true })
    ).toBe(true);
  });

  it('is false when voiceCrashDetection is explicitly off', () => {
    expect(
      shouldEnableVoiceMonitoring({ ...baseSettings(), voiceCrashDetection: false })
    ).toBe(false);
  });
});
