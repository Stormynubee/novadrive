import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

export type AuthTab = 'signin' | 'signup' | 'guest';

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function profileFromSession(
  session: Session,
  displayName?: string
): Pick<UserProfile, 'mode' | 'name' | 'email' | 'supabaseUserId'> {
  const email = session.user.email ?? undefined;
  const name =
    displayName?.trim() ||
    (session.user.user_metadata?.display_name as string | undefined) ||
    (email ? email.split('@')[0] : 'Margi user');
  return {
    mode: 'auth',
    name,
    email,
    supabaseUserId: session.user.id,
  };
}

export async function signInWithPassword(
  client: SupabaseClient,
  email: string,
  password: string
): Promise<{ session: Session | null; error: string | null }> {
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
}

export async function signUpWithPassword(
  client: SupabaseClient,
  email: string,
  password: string,
  displayName?: string
): Promise<{ session: Session | null; error: string | null; needsEmailConfirm: boolean }> {
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: displayName ? { display_name: displayName.trim() } : undefined,
    },
  });
  if (error) return { session: null, error: error.message, needsEmailConfirm: false };
  const needsEmailConfirm = !data.session && Boolean(data.user);
  return { session: data.session, error: null, needsEmailConfirm };
}

export async function signOutSession(client: SupabaseClient): Promise<void> {
  await client.auth.signOut();
}
