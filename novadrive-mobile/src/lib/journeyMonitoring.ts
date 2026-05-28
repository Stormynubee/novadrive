import type { AppSettings } from './types';

/** Voice distress mic is enabled only when the user turns on voice crash detection in settings. */
export function shouldEnableVoiceMonitoring(settings: AppSettings): boolean {
  return settings.voiceCrashDetection ?? true;
}

export function canDetectDistressVoice(input: {
  journeyActive: boolean;
  appForeground: boolean;
  isFemaleSafetyHelpActive: boolean;
}): boolean {
  if (!input.appForeground) return false;
  return input.journeyActive || input.isFemaleSafetyHelpActive;
}
