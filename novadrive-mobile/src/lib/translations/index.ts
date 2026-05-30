import { enDict } from './en';
import { hiDict } from './hi';
import { taDict } from './ta';
import { globalDicts } from './global_dicts';
import type { ExtendedLang } from '../types';

export type AuthStringKey =
  | 'secureSignIn'
  | 'signIn'
  | 'createAccount'
  | 'guestDemo'
  | 'profileSyncDesc'
  | 'supabaseMissingDesc'
  | 'displayName'
  | 'emailAddress'
  | 'password'
  | 'genderOptional'
  | 'guestDesc'
  | 'continueAsGuest'
  | 'pleaseWait'
  | 'demoMode'
  | 'namePlaceholder'
  | 'emailPlaceholder'
  | 'passwordPlaceholder'
  | 'teamDisplay';

export const AUTH_STRINGS: Record<ExtendedLang, Record<AuthStringKey, string>> = {
  en: enDict,
  hi: hiDict,
  ta: taDict,
  ...globalDicts,
};

export function getAuthString(key: AuthStringKey, lang: ExtendedLang): string {
  const dict = AUTH_STRINGS[lang] ?? AUTH_STRINGS.en;
  return dict[key] ?? AUTH_STRINGS.en[key] ?? '';
}
