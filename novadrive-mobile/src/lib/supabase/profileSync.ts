import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppSettings, MedicalProfile, UserProfile } from '../types';
import { defaultSettings } from '../storage';

export type RemoteProfileRow = {
  display_name: string | null;
  email: string | null;
  medical_json: MedicalProfile | null;
  settings_json: Partial<AppSettings> | null;
  gov_employee: boolean | null;
};

export async function fetchRemoteProfile(
  client: SupabaseClient,
  userId: string
): Promise<RemoteProfileRow | null> {
  const { data, error } = await client
    .from('profiles')
    .select('display_name, email, medical_json, settings_json, gov_employee')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as RemoteProfileRow;
}

export async function upsertRemoteProfile(
  client: SupabaseClient,
  userId: string,
  patch: {
    display_name?: string;
    email?: string;
    medical_json?: MedicalProfile;
    settings_json?: Partial<AppSettings>;
    gov_employee?: boolean;
  }
): Promise<void> {
  await client.from('profiles').upsert({
    id: userId,
    ...patch,
    updated_at: new Date().toISOString(),
  });
}

export function mergeRemoteIntoProfile(
  local: UserProfile,
  remote: RemoteProfileRow | null
): UserProfile {
  if (!remote) return local;
  return {
    ...local,
    name: remote.display_name ?? local.name,
    email: remote.email ?? local.email,
    medical: remote.medical_json ?? local.medical,
    settings: { ...defaultSettings(), ...(local.settings ?? {}), ...(remote.settings_json ?? {}) },
    govEmployee: remote.gov_employee ?? local.govEmployee,
  };
}
