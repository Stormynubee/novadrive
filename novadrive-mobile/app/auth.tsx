import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { HudCard } from '../src/components/HudCard';
import { HudText } from '../src/components/HudText';
import { MargiButton } from '../src/components/MargiButton';
import { MargiInput } from '../src/components/MargiInput';
import { MargiLogo } from '../src/components/MargiLogo';
import { GenderIdentityPicker } from '../src/components/GenderIdentityPicker';
import { useApp } from '../src/context/AppContext';
import type { GenderIdentity } from '../src/lib/types';
import { TEAM_DISPLAY_NAME } from '../src/lib/brand';
import { getSupabaseClient, isSupabaseConfigured } from '../src/lib/supabase/client';
import {
  isValidEmail,
  isValidPassword,
  profileFromSession,
  signInWithPassword,
  signUpWithPassword,
  type AuthTab,
} from '../src/lib/supabase/authSession';
import { fetchRemoteProfile, mergeRemoteIntoProfile } from '../src/lib/supabase/profileSync';
import { tokens } from '../src/theme/tokens';

export default function AuthScreen() {
  const { updateProfile, profile } = useApp();
  const [tab, setTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<GenderIdentity | undefined>();
  const [busy, setBusy] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  const continueGuest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    await updateProfile({
      mode: 'guest',
      name: 'Guest',
      email: undefined,
      supabaseUserId: undefined,
      ...(gender ? { gender } : {}),
    });
    router.push('/medical');
  };

  const finishAuth = async (sessionProfile: ReturnType<typeof profileFromSession>) => {
    let merged = {
      ...profile,
      ...sessionProfile,
      ...(gender ? { gender } : {}),
    };
    const client = getSupabaseClient();
    if (client && sessionProfile.supabaseUserId) {
      const remote = await fetchRemoteProfile(client, sessionProfile.supabaseUserId);
      merged = mergeRemoteIntoProfile(merged, remote);
    }
    await updateProfile(merged);
    router.push('/medical');
  };

  const submitSignIn = async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      Alert.alert('Email required', 'Enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert('Password required', 'Password must be at least 8 characters.');
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      Alert.alert(
        'Supabase not configured',
        'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, or use Guest demo mode.'
      );
      return;
    }
    setBusy(true);
    try {
      const { session, error } = await signInWithPassword(client, trimmed, password);
      if (error || !session) {
        Alert.alert('Sign in failed', error ?? 'No session returned.');
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      await finishAuth(profileFromSession(session));
    } finally {
      setBusy(false);
    }
  };

  const submitSignUp = async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      Alert.alert('Email required', 'Enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert('Password required', 'Password must be at least 8 characters.');
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      Alert.alert(
        'Supabase not configured',
        'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, or use Guest demo mode.'
      );
      return;
    }
    setBusy(true);
    try {
      const { session, error, needsEmailConfirm } = await signUpWithPassword(
        client,
        trimmed,
        password,
        displayName || trimmed.split('@')[0]
      );
      if (error) {
        Alert.alert('Sign up failed', error);
        return;
      }
      if (needsEmailConfirm) {
        Alert.alert(
          'Confirm your email',
          'Check your inbox to verify the account, then sign in.'
        );
        setTab('signin');
        return;
      }
      if (!session) {
        Alert.alert('Sign up incomplete', 'Try signing in with your new credentials.');
        setTab('signin');
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      await finishAuth(profileFromSession(session, displayName));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <MargiLogo size={36} showWordmark={false} />
          <View>
            <HudText variant="headlineMd" style={styles.brandTitle}>
              Margi
            </HudText>
            <HudText variant="mono" style={styles.brandSub}>
              Secure sign-in
            </HudText>
          </View>
        </View>

        <HudText variant="headlineLg" style={styles.title}>
          {tab === 'guest' ? 'Demo mode' : tab === 'signup' ? 'Create account' : 'Sign in'}
        </HudText>
        <HudText variant="bodyMd" style={styles.body}>
          {supabaseReady
            ? 'Your profile syncs to Supabase when signed in. Guest mode stays fully offline on this device.'
            : 'Supabase keys are not configured — use Guest demo mode. Add keys in .env for production auth.'}
        </HudText>

        <View style={styles.tabBlock}>
          <View style={styles.tabRow}>
            {(['signin', 'signup'] as AuthTab[]).map((key) => (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={({ pressed }) => [
                  styles.tab,
                  styles.tabHalf,
                  tab === key && styles.tabActive,
                  pressed && tab !== key && styles.tabPressed,
                ]}
              >
                <HudText variant="mono" style={[styles.tabText, tab === key && styles.tabTextActive]}>
                  {key === 'signin' ? 'Sign in' : 'Create account'}
                </HudText>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => setTab('guest')}
            style={({ pressed }) => [
              styles.tab,
              styles.tabFull,
              tab === 'guest' && styles.tabActive,
              pressed && tab !== 'guest' && styles.tabPressed,
            ]}
          >
            <HudText variant="mono" style={[styles.tabText, tab === 'guest' && styles.tabTextActive]}>
              Guest demo
            </HudText>
          </Pressable>
        </View>

        {tab !== 'guest' ? (
          <HudCard>
            {tab === 'signup' ? (
              <>
                <HudText variant="mono" style={styles.label}>
                  Display name
                </HudText>
                <MargiInput
                  placeholder="Your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </>
            ) : null}
            <HudText variant="mono" style={styles.label}>
              Email address
            </HudText>
            <MargiInput
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <HudText variant="mono" style={[styles.label, { marginTop: 16 }]}>
              Password
            </HudText>
            <MargiInput
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <HudText variant="mono" style={[styles.label, { marginTop: 16 }]}>
              Gender (optional)
            </HudText>
            <GenderIdentityPicker value={gender} onChange={setGender} />
            <MargiButton
              label={busy ? 'Please wait…' : tab === 'signup' ? 'Create account' : 'Sign in'}
              onPress={() => void (tab === 'signup' ? submitSignUp() : submitSignIn())}
              large
              disabled={busy}
              style={{ marginTop: 16 }}
            />
          </HudCard>
        ) : (
          <HudCard>
            <HudText variant="bodyMd" style={styles.hint}>
              Guest mode keeps all data on this device. Ideal for judges and offline corridor demos.
            </HudText>
            <HudText variant="mono" style={[styles.label, { marginTop: 16 }]}>
              Gender (optional)
            </HudText>
            <GenderIdentityPicker value={gender} onChange={setGender} />
            <MargiButton
              label="Continue as Guest"
              onPress={() => void continueGuest()}
              variant="secondary"
              large
              style={{ marginTop: 16 }}
            />
          </HudCard>
        )}

        <HudText variant="mono" style={styles.footer}>
          {TEAM_DISPLAY_NAME} · Government of India · IIT Madras
        </HudText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 24, paddingBottom: 48 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 32 },
  brandTitle: {
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: 1,
  },
  brandSub: { color: tokens.onSurfaceVariant, marginTop: 2, fontSize: 10 },
  title: { color: tokens.primary },
  body: { color: tokens.onSurfaceVariant, marginTop: 8, marginBottom: 24, lineHeight: 24 },
  tabBlock: { gap: 8, marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    paddingVertical: 12,
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    alignItems: 'center',
    backgroundColor: tokens.surface,
  },
  tabHalf: { flex: 1 },
  tabFull: { width: '100%' },
  tabActive: { backgroundColor: tokens.primary, borderColor: tokens.primary },
  tabPressed: { backgroundColor: tokens.primaryContainer, borderColor: tokens.primaryDeep },
  tabText: { color: tokens.onSurfaceVariant, fontSize: 11, letterSpacing: 0.8 },
  tabTextActive: { color: tokens.onPrimary },
  label: { color: tokens.primary, fontSize: 12, marginBottom: 8 },
  hint: { color: tokens.onSurfaceVariant, lineHeight: 20 },
  footer: {
    textAlign: 'center',
    color: tokens.onSurfaceVariant,
    marginTop: 32,
    fontSize: 10,
    letterSpacing: 1.6,
  },
});
