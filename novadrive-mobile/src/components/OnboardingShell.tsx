import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HudText } from './HudText';
import { MargiLogo } from './MargiLogo';
import { tokens } from '../theme/tokens';

/**
 * Onboarding wrapper used by /auth, /medical, /accessibility. White GovTech surface, miniature
 * Margi emblem, persistent step indicator (4px navy filled / saffron-on-current).
 */
export function OnboardingShell({
  step,
  total,
  title,
  subtitle,
  children,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <MargiLogo size={36} showWordmark={false} />
            <View>
              <HudText
                variant="headlineMd"
                style={{
                  fontFamily: 'HankenGrotesk_800ExtraBold',
                  letterSpacing: 1,
                  color: tokens.primary,
                }}
              >
                Margi
              </HudText>
              <HudText variant="mono" style={styles.kicker}>
                Government of India · IIT Madras
              </HudText>
            </View>
          </View>

          <View style={styles.dots}>
            {Array.from({ length: total }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i + 1 < step && styles.dotDone,
                  i + 1 === step && styles.dotCurrent,
                ]}
              />
            ))}
          </View>
          <HudText variant="mono" style={styles.step}>{`STEP ${step} OF ${total}`}</HudText>
          <HudText variant="headlineLg" style={styles.title}>
            {title}
          </HudText>
          {subtitle ? (
            <HudText variant="bodyMd" style={styles.sub}>
              {subtitle}
            </HudText>
          ) : null}
          <View style={styles.body}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.background },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 48 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  kicker: { marginTop: 2, color: tokens.onSurfaceVariant, fontSize: 10 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: tokens.outlineVariant },
  dotDone: { backgroundColor: tokens.primary },
  dotCurrent: { backgroundColor: tokens.secondary },
  step: { marginBottom: 8, color: tokens.onSurfaceVariant },
  title: { color: tokens.primary },
  sub: { marginTop: 6, marginBottom: 24, color: tokens.onSurfaceVariant, lineHeight: 24 },
  body: { gap: 16 },
});
