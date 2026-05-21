import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { AccessibilityPrefs, GoldenHourPacket, MedicalProfile, UserProfile } from './types';

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

export async function loadProfile(): Promise<UserProfile> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  if (!raw) return { mode: 'guest' };
  return JSON.parse(raw) as UserProfile;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
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
  return { largeText: false, highContrast: false, reduceMotion: false, ttsEnabled: false };
}

export function defaultMedical(): MedicalProfile {
  return { bloodType: '', allergies: '', conditions: '', emergencyContact: '' };
}
