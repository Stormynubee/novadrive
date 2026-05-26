import type { UserProfile } from '../types';

export function isOnboardingGenderComplete(profile: UserProfile): boolean {
  return profile.gender != null && profile.gender.length > 0;
}
