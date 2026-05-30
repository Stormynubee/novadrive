import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, TextInput } from 'react-native';
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
import { getAuthString } from '../src/lib/translations';

const LANGUAGES_LIST = [
  { code: 'en', native: 'English', name: 'English', flag: '🇺🇸' },
  { code: 'hi', native: 'हिन्दी', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ta', native: 'தமிழ்', name: 'Tamil', flag: '🇮🇳' },
  { code: 'es', native: 'Español', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', native: 'Français', name: 'French', flag: '🇫🇷' },
  { code: 'de', native: 'Deutsch', name: 'German', flag: '🇩🇪' },
  { code: 'zh', native: '中文', name: 'Mandarin', flag: '🇨🇳' },
  { code: 'ja', native: '日本語', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ar', native: 'العربية', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', native: 'Português', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', native: 'Русский', name: 'Russian', flag: '🇷🇺' },
  { code: 'bn', native: 'বাংলা', name: 'Bengali', flag: '🇮🇳' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'mr', native: 'मराठी', name: 'Marathi', flag: '🇮🇳' },
  { code: 'te', native: 'తెలుగు', name: 'Telugu', flag: '🇮🇳' },
] as const;

export default function AuthScreen() {
  const { updateProfile, profile, settings, updateSettings } = useApp();
  const [tab, setTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<GenderIdentity | undefined>();
  const [busy, setBusy] = useState(false);
  const [selectorExpanded, setSelectorExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <MargiLogo size={36} showWordmark={false} />
            <View>
              <HudText variant="headlineMd" style={styles.brandTitle}>
                Margi
              </HudText>
              <HudText variant="mono" style={styles.brandSub}>
                {getAuthString('secureSignIn', settings.language)}
              </HudText>
            </View>
          </View>
        </View>

        <HudText variant="bodyMd" style={styles.body}>
          {tab === 'guest'
            ? getAuthString('guestOfflineDesc', settings.language)
            : getAuthString('profileSyncDesc', settings.language)}
        </HudText>

        <View style={styles.tabBlock}>
          <View style={styles.tabRow}>
            {(['signin', 'signup'] as AuthTab[]).map((key) => (
              <Pressable
                key={key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                  setTab(key);
                }}
                style={({ pressed }) => [
                  styles.tab,
                  styles.tabHalf,
                  tab === key && styles.tabActive,
                  pressed && tab === key && styles.tabActivePressed,
                  pressed && tab !== key && styles.tabPressed,
                ]}
              >
                <HudText variant="mono" style={[styles.tabText, tab === key && styles.tabTextActive]}>
                  {key === 'signin'
                    ? getAuthString('signIn', settings.language)
                    : getAuthString('createAccount', settings.language)}
                </HudText>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
              setTab('guest');
            }}
            style={({ pressed }) => [
              styles.tab,
              styles.tabFull,
              tab === 'guest' && styles.tabActive,
              pressed && tab === 'guest' && styles.tabActivePressed,
              pressed && tab !== 'guest' && styles.tabPressed,
            ]}
          >
            <HudText variant="mono" style={[styles.tabText, tab === 'guest' && styles.tabTextActive]}>
              {getAuthString('guestDemo', settings.language)}
            </HudText>
          </Pressable>
        </View>

        {/* Prominent Tactile Expandable Language Selector */}
        <View style={styles.promoSelectorCard}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
              setSelectorExpanded(!selectorExpanded);
            }}
            style={({ pressed }) => [
              styles.promoSelectorHeader,
              pressed && styles.promoSelectorPressed
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialIcons name="language" size={20} color={tokens.primary} />
              <HudText variant="mono" style={styles.promoSelectorLabel}>
                {LANGUAGES_LIST.find((l) => l.code === settings.language)?.flag}{' '}
                {LANGUAGES_LIST.find((l) => l.code === settings.language)?.native} ({LANGUAGES_LIST.find((l) => l.code === settings.language)?.name})
              </HudText>
            </View>
            <MaterialIcons
              name={selectorExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={tokens.primary}
            />
          </Pressable>

          {selectorExpanded && (
            <View style={styles.promoSelectorBody}>
              {/* Search Bar */}
              <View style={styles.promoSearchWrapper}>
                <MaterialIcons name="search" size={18} color={tokens.onSurfaceVariant} style={{ marginRight: 6 }} />
                <TextInput
                  placeholder="Search language..."
                  placeholderTextColor={tokens.onSurfaceVariant}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.promoSearchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Language Grid */}
              <ScrollView
                style={styles.promoGridScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.promoGrid}>
                  {LANGUAGES_LIST.filter(
                    (l) =>
                      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      l.native.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((lang) => {
                    const active = settings.language === lang.code;
                    return (
                      <Pressable
                        key={lang.code}
                        onPress={async () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
                          await updateSettings({ language: lang.code });
                          setSelectorExpanded(false);
                          setSearchQuery('');
                        }}
                        style={({ pressed }) => [
                          styles.promoGridChip,
                          active && styles.promoGridChipActive,
                          pressed && styles.promoGridChipPressed,
                        ]}
                      >
                        <HudText variant="mono" style={styles.promoGridFlag}>
                          {lang.flag}
                        </HudText>
                        <HudText
                          variant="mono"
                          style={[
                            styles.promoGridNative,
                            active && styles.promoGridNativeActive,
                          ]}
                          numberOfLines={1}
                        >
                          {lang.native}
                        </HudText>
                        <HudText
                          variant="mono"
                          style={[
                            styles.promoGridLocal,
                            active && styles.promoGridLocalActive,
                          ]}
                          numberOfLines={1}
                        >
                          {lang.name}
                        </HudText>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {tab !== 'guest' ? (
          <HudCard>
            {tab === 'signup' ? (
              <>
                <HudText variant="mono" style={styles.label}>
                  {getAuthString('displayName', settings.language)}
                </HudText>
                <MargiInput
                  placeholder={getAuthString('namePlaceholder', settings.language)}
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </>
            ) : null}
            <HudText variant="mono" style={styles.label}>
              {getAuthString('emailAddress', settings.language)}
            </HudText>
            <MargiInput
              placeholder={getAuthString('emailPlaceholder', settings.language)}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <HudText variant="mono" style={[styles.label, { marginTop: 16 }]}>
              {getAuthString('password', settings.language)}
            </HudText>
            <MargiInput
              placeholder={getAuthString('passwordPlaceholder', settings.language)}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <HudText variant="mono" style={[styles.label, { marginTop: 16 }]}>
              {getAuthString('genderOptional', settings.language)}
            </HudText>
            <GenderIdentityPicker value={gender} onChange={setGender} />
            <MargiButton
              label={
                busy
                  ? getAuthString('pleaseWait', settings.language)
                  : tab === 'signup'
                  ? getAuthString('createAccount', settings.language)
                  : getAuthString('signIn', settings.language)
              }
              onPress={() => void (tab === 'signup' ? submitSignUp() : submitSignIn())}
              large
              disabled={busy}
              style={{ marginTop: 16 }}
            />
          </HudCard>
        ) : (
          <HudCard>
            <HudText variant="bodyMd" style={styles.hint}>
              {getAuthString('guestDesc', settings.language)}
            </HudText>
            <HudText variant="mono" style={[styles.label, { marginTop: 16 }]}>
              {getAuthString('genderOptional', settings.language)}
            </HudText>
            <GenderIdentityPicker value={gender} onChange={setGender} />
            <MargiButton
              label={getAuthString('continueAsGuest', settings.language)}
              onPress={() => void continueGuest()}
              variant="secondary"
              large
              style={{ marginTop: 16 }}
            />
          </HudCard>
        )}


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 24, paddingBottom: 48 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: 1,
  },
  brandSub: { color: tokens.onSurfaceVariant, marginTop: 2, fontSize: 10 },
  promoSelectorCard: {
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card || 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  promoSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: tokens.surface,
  },
  promoSelectorPressed: {
    backgroundColor: tokens.surfaceContainerLow || '#f1f3f5',
  },
  promoSelectorLabel: {
    fontSize: 12,
    color: tokens.primary,
    fontWeight: '700',
  },
  promoSelectorBody: {
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
    padding: 12,
    backgroundColor: tokens.surface,
  },
  promoSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.background || '#f8f9fa',
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 40,
  },
  promoSearchInput: {
    flex: 1,
    borderWidth: 0,
    height: '100%',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    fontSize: 11,
    color: tokens.primary,
  },
  promoGridScroll: {
    maxHeight: 220,
  },
  promoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  promoGridChip: {
    width: '48%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.background,
    alignItems: 'center',
    marginBottom: 8,
  },
  promoGridChipActive: {
    backgroundColor: tokens.primary,
    borderColor: tokens.primary,
  },
  promoGridChipPressed: {
    backgroundColor: tokens.primaryContainer || '#e8f0fe',
  },
  promoGridFlag: {
    fontSize: 18,
    marginBottom: 4,
  },
  promoGridNative: {
    fontSize: 10,
    fontWeight: '700',
    color: tokens.primary,
    textAlign: 'center',
  },
  promoGridNativeActive: {
    color: tokens.onPrimary,
  },
  promoGridLocal: {
    fontSize: 8,
    color: tokens.onSurfaceVariant,
    marginTop: 2,
    textAlign: 'center',
  },
  promoGridLocalActive: {
    color: tokens.onPrimary,
    opacity: 0.8,
  },
  title: { color: tokens.primary },
  body: {
    color: tokens.onSurfaceVariant,
    marginTop: 0,
    marginBottom: 20,
    fontSize: 12,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
  tabBlock: { gap: 8, marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    paddingVertical: 12,
    borderRadius: 24, // curved pill shape instead of square box
    borderWidth: 1.5,
    borderColor: tokens.outlineVariant,
    alignItems: 'center',
    backgroundColor: tokens.surface,
  },
  tabHalf: { flex: 1 },
  tabFull: { width: '100%' },
  tabActive: { backgroundColor: tokens.primary, borderColor: tokens.primary },
  // Pressing an already-active tab → darken to primaryDeep (feels responsive, not faded)
  tabActivePressed: { backgroundColor: tokens.primaryDeep, borderColor: tokens.primaryDeep },
  // Pressing an inactive tab → clear mid-tone surface darkening (never a pale wash)
  tabPressed: { backgroundColor: tokens.surfaceContainerHigh, borderColor: tokens.outline },
  tabText: { color: tokens.onSurfaceVariant, fontSize: 11, letterSpacing: 0.8, fontWeight: '600' },
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
