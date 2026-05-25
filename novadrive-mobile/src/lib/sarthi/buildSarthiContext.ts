import type { UserProfile } from '../types';
import type { SarthiUserContext } from '../sarthiTypes';
import { sarthiStrings } from './sarthiStrings';

export function buildMedicalSummary(profile: UserProfile): string | undefined {
  const m = profile.medical;
  if (!m) return undefined;
  const parts: string[] = [];
  if (m.bloodType?.trim()) parts.push(`blood type ${m.bloodType.trim()}`);
  if (m.allergies?.trim()) parts.push(`allergies: ${m.allergies.trim()}`);
  return parts.length ? parts.join('; ') : undefined;
}

export function hasEmergencyContacts(profile: UserProfile): boolean {
  const m = profile.medical;
  if (!m) return false;
  if (m.primaryContact?.phone?.trim()) return true;
  if (m.emergencyContact?.trim()) return true;
  return false;
}

export function buildSarthiUserContext(
  profile: UserProfile,
  journeyPhase: 'IDLE' | 'ACTIVE',
  corridorLabel?: string
): SarthiUserContext {
  const language = profile.settings?.language ?? 'en';
  const displayName =
    profile.name?.trim() ||
    (profile.mode === 'guest' ? sarthiStrings.guestName[language] : undefined);

  return {
    journeyPhase,
    corridorLabel,
    language,
    displayName,
    mode: profile.mode,
    medicalSummary: buildMedicalSummary(profile),
    hasEmergencyContacts: hasEmergencyContacts(profile),
    regionalProtocols: profile.settings?.regionalProtocols ?? true,
  };
}
