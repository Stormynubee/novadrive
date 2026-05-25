import type { AppSettings } from './types';

/** Voice distress mic is enabled only when the user turns on voice crash detection in settings. */
export function shouldEnableVoiceMonitoring(settings: AppSettings): boolean {
  return settings.voiceCrashDetection ?? true;
}
