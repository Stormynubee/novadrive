import { AccessibilityInfo, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import type { AccessibilityPrefs } from './types';

let lastSpoken = '';

export function announceA11y(message: string, prefs: AccessibilityPrefs) {
  if (!prefs.screenReader) return;
  if (Platform.OS === 'web') return;
  AccessibilityInfo.announceForAccessibility(message);
}

export function speakA11y(message: string, prefs: AccessibilityPrefs, locale = 'en-IN') {
  const enabled = prefs.ttsEnabled || prefs.voiceCommand || prefs.audioNavigation;
  if (!enabled || !message.trim()) return;
  if (message === lastSpoken) return;
  lastSpoken = message;
  Speech.stop();
  Speech.speak(message, { language: locale, rate: 0.92 });
}

export async function hapticCrashAlert(prefs: AccessibilityPrefs) {
  if (!prefs.hapticCrashAlerts) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    /* device may not support haptics */
  }
}

export function resetSpeakDedupe() {
  lastSpoken = '';
}
