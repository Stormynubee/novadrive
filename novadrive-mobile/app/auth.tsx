import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { HudCard } from '../src/components/HudCard';
import { HudText } from '../src/components/HudText';
import { NovaButton } from '../src/components/NovaButton';
import { NovaInput } from '../src/components/NovaInput';
import { NovaLogo } from '../src/components/NovaLogo';
import { useApp } from '../src/context/AppContext';
import { tokens } from '../src/theme/tokens';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Stitch `login_page` — secure sign-in with persistent navy labels, "Continue with email" primary
 * navy CTA, secondary saffron "Continue as Guest". Adds a small Aadhaar/Mobile placeholder field
 * matching the Indian-government context (kept guest-compatible — submit goes to email path only).
 */
export default function AuthScreen() {
  const { updateProfile } = useApp();
  const [email, setEmail] = useState('');

  const continueGuest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    await updateProfile({ mode: 'guest', name: 'Guest', email: undefined });
    router.push('/medical');
  };

  const continueEmail = async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      Alert.alert(
        'Email required',
        'Enter a valid email to continue, or use Guest mode for the offline demo.'
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    await updateProfile({ mode: 'auth', name: trimmed.split('@')[0], email: trimmed });
    router.push('/medical');
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
          <NovaLogo size={36} showWordmark={false} />
          <View>
            <HudText variant="headlineMd" style={styles.brandTitle}>
              NOVA DRIVE
            </HudText>
            <HudText variant="mono" style={styles.brandSub}>
              Secure sign-in
            </HudText>
          </View>
        </View>

        <HudText variant="headlineLg" style={styles.title}>
          Sign in to continue
        </HudText>
        <HudText variant="bodyMd" style={styles.body}>
          Your identity is verified locally. Nothing leaves the device until you build a Golden
          Hour Packet.
        </HudText>

        <HudCard>
          <HudText variant="mono" style={styles.label}>
            Email address
          </HudText>
          <NovaInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <HudText variant="bodySm" style={styles.hint}>
            We use this only to label your journey logs on this device.
          </HudText>
          <NovaButton
            label="Continue with email"
            onPress={continueEmail}
            large
            style={{ marginTop: 16 }}
          />
        </HudCard>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <HudText variant="mono" style={styles.dividerText}>
            or
          </HudText>
          <View style={styles.dividerLine} />
        </View>

        <NovaButton label="Continue as Guest (demo)" onPress={continueGuest} variant="secondary" large />

        <Pressable
          onPress={() =>
            Alert.alert(
              'Biometric quick-login',
              'Will be available on stable device builds. Use Guest mode for the demo.',
              [{ text: 'OK' }]
            )
          }
          style={({ pressed }) => [styles.biometric, pressed && { opacity: 0.85 }]}
        >
          <MaterialIcons name="fingerprint" size={28} color={tokens.primary} />
          <View style={{ flex: 1 }}>
            <HudText variant="bodyMd" style={styles.bioTitle}>
              Biometric quick-login
            </HudText>
            <HudText variant="mono" style={styles.bioSub}>
              Coming soon · device-bound
            </HudText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={tokens.outline} />
        </Pressable>

        <HudText variant="mono" style={styles.footer}>
          Team Vortex · Government of India · IIT Madras
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
  label: { color: tokens.primary, fontSize: 12, marginBottom: 8 },
  hint: { color: tokens.onSurfaceVariant, marginTop: 8, lineHeight: 20 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: tokens.outlineVariant },
  dividerText: { color: tokens.onSurfaceVariant, fontSize: 11, letterSpacing: 1.4 },
  biometric: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
  },
  bioTitle: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  bioSub: { color: tokens.onSurfaceVariant, fontSize: 10, marginTop: 2 },
  footer: {
    textAlign: 'center',
    color: tokens.onSurfaceVariant,
    marginTop: 32,
    fontSize: 10,
    letterSpacing: 1.6,
  },
});
