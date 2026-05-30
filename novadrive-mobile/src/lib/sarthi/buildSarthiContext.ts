import type { UserProfile } from '../types';
import type { SarthiUserContext } from '../sarthiTypes';
import { resolveRegionalCoverage } from '../regionalCoverage';
import { sarthiStrings } from './sarthiStrings';

export type SarthiLocationContext = {
  lat?: number;
  lng?: number;
  regionLabel?: string;
};

export function buildSarthiCorridorLabel(location: SarthiLocationContext): string | undefined {
  if (location.lat != null && location.lng != null) {
    const coverage = resolveRegionalCoverage(location.lat, location.lng);
    if (coverage.mode === 'verified_pack') {
      return `${coverage.stateName} · NH-48 corridor`;
    }
    return `${coverage.stateName} · baseline coverage`;
  }
  return location.regionLabel?.trim() || undefined;
}

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
  location: SarthiLocationContext = {}
): SarthiUserContext {
  const language = profile.settings?.language ?? 'en';
  const displayName =
    profile.name?.trim() ||
    (profile.mode === 'guest' ? sarthiStrings.guestName[language] : undefined);
  const corridorLabel = buildSarthiCorridorLabel(location);

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
