import { canDetectDistressVoice, shouldEnableVoiceMonitoring } from './journeyMonitoring';
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
  voiceDistressSensitivity: 'medium',
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

describe('canDetectDistressVoice', () => {
  it('allows distress detection while actively driving', () => {
    expect(
      canDetectDistressVoice({
        journeyActive: true,
        appForeground: true,
        isFemaleSafetyHelpActive: false,
      })
    ).toBe(true);
  });

  it('allows distress detection for women help mode even when not driving', () => {
    expect(
      canDetectDistressVoice({
        journeyActive: false,
        appForeground: true,
        isFemaleSafetyHelpActive: true,
      })
    ).toBe(true);
  });

  it('blocks distress detection when neither driving nor women help mode is active', () => {
    expect(
      canDetectDistressVoice({
        journeyActive: false,
        appForeground: true,
        isFemaleSafetyHelpActive: false,
      })
    ).toBe(false);
  });
});
