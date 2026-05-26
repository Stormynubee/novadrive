import type { UserProfile } from '../types';

export function isNaariShaktiEligible(profile: UserProfile): boolean {
  return profile.gender === 'female';
}

export function shouldShowNaariHomeCard(profile: UserProfile): boolean {
  return isNaariShaktiEligible(profile);
}

export function shouldShowProtocolModal(profile: UserProfile): boolean {
  if (!isNaariShaktiEligible(profile)) return false;
  return !profile.naariShakti?.enabled;
}
