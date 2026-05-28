import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  BRIEF_ACK_STORAGE_KEY,
  parseBriefAcknowledgments,
  serializeBriefAcknowledgments,
} from './home/safetyBriefAcknowledgments';
import type {
  AccessibilityPrefs,
  AppSettings,
  EmergencyContact,
  GoldenHourPacket,
  MedicalProfile,
  NaariShaktiPrefs,
  UserProfile,
} from './types';

const KEYS = {
  onboarded: 'nd_onboarded',
  profile: 'nd_profile',
  relay: 'nd_relay_packet',
};

export async function isOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.onboarded)) === '1';
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboarded, '1');
}

export async function resetDemoApp(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.onboarded, KEYS.profile]);
  try {
    await SecureStore.deleteItemAsync(KEYS.relay);
  } catch {
    /* relay may not exist */
  }
}

export async function loadProfile(): Promise<UserProfile> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  if (!raw) return { mode: 'guest' };
  const parsed = JSON.parse(raw) as UserProfile;
  return normalizeProfile(parsed);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(normalizeProfile(profile)));
}

export async function saveRelayPacket(packet: GoldenHourPacket): Promise<void> {
  await SecureStore.setItemAsync(KEYS.relay, JSON.stringify(packet));
}

export async function loadRelayPacket(): Promise<GoldenHourPacket | null> {
  const raw = await SecureStore.getItemAsync(KEYS.relay);
  if (!raw) return null;
  return JSON.parse(raw) as GoldenHourPacket;
}

export async function clearRelayPacket(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.relay);
}

export function defaultA11y(): AccessibilityPrefs {
  return {
    largeText: false,
    highContrast: false,
    reduceMotion: false,
    ttsEnabled: true,
    fontScale: 1,
    voiceCommand: true,
    hapticCrashAlerts: true,
    screenReader: false,
    audioNavigation: true,
  };
}

export function defaultSettings(): AppSettings {
  return {
    language: 'en',
    regionalProtocols: true,
    biometricAuth: false,
    sosSensitivity: 'high',
    telemetrySharing: true,
    autoDispatchMedical: true,
    notifyEmergencyContacts: true,
    lockDeviceScreen: false,
    voiceCrashDetection: true,
  };
}

export function defaultEmergencyContact(): EmergencyContact {
  return { fullName: '', relationship: '', phone: '' };
}

export function resolveFontScale(a11y: AccessibilityPrefs): number {
  if (a11y.fontScale != null) return a11y.fontScale;
  return a11y.largeText ? 1.15 : 1;
}

export function defaultNaariShakti(): NaariShaktiPrefs {
  return { enabled: false, safetyModeActive: false };
}

export function defaultMedical(): MedicalProfile {
  return {
    bloodType: '',
    allergies: '',
    conditions: '',
    medications: '',
    primaryContact: defaultEmergencyContact(),
    emergencyContact: '',
  };
}

/** Migrate legacy single-line ICE string into structured primary contact. */
export function normalizeMedical(m?: MedicalProfile): MedicalProfile {
  const base = { ...defaultMedical(), ...m };
  if (!base.primaryContact) {
    base.primaryContact = defaultEmergencyContact();
  }
  if (m?.emergencyContact && !base.primaryContact.fullName && !base.primaryContact.phone) {
    const legacy = m.emergencyContact.trim();
    const phoneMatch = legacy.match(/(\+?\d[\d\s-]{8,})/);
    const phone = phoneMatch ? phoneMatch[1].trim() : '';
    const name = legacy.replace(phoneMatch?.[0] ?? '', '').replace(/[,|]/g, ' ').trim();
    base.primaryContact = {
      fullName: name || legacy,
      relationship: '',
      phone,
    };
  }
  base.emergencyContact = formatIceLine(base.primaryContact);
  return base;
}

export function formatIceLine(contact?: EmergencyContact): string {
  if (!contact) return '';
  const parts = [contact.fullName, contact.relationship, contact.phone].filter(Boolean);
  return parts.join(' · ');
}

function normalizeProfile(p: UserProfile): UserProfile {
  const base = defaultA11y();
  const saved: Partial<AccessibilityPrefs> = p.a11y ?? {};
  const a11y: AccessibilityPrefs = {
    ...base,
    ...saved,
    fontScale: saved.fontScale ?? (saved.largeText ? 1.15 : base.fontScale),
    voiceCommand: saved.voiceCommand ?? base.voiceCommand,
    hapticCrashAlerts: saved.hapticCrashAlerts ?? base.hapticCrashAlerts,
    screenReader: saved.screenReader ?? base.screenReader,
    audioNavigation: saved.audioNavigation ?? base.audioNavigation,
  };
  return {
    ...p,
    citizenId: p.citizenId ?? 'ND-2024-8832',
    a11y,
    settings: { ...defaultSettings(), ...p.settings },
    medical: p.medical ? normalizeMedical(p.medical) : undefined,
    naariShakti: {
      ...defaultNaariShakti(),
      ...p.naariShakti,
    },
  };
}

export async function loadBriefAcknowledgments(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(BRIEF_ACK_STORAGE_KEY);
  return parseBriefAcknowledgments(raw);
}

export async function saveBriefAcknowledgments(slugs: string[]): Promise<void> {
  await AsyncStorage.setItem(BRIEF_ACK_STORAGE_KEY, serializeBriefAcknowledgments(slugs));
}
