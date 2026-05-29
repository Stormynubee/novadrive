import { type Href, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AccessibilityToggleCard } from '../src/components/AccessibilityToggleCard';
import { HudText } from '../src/components/HudText';
import { MargiButton } from '../src/components/MargiButton';
import { MargiTopBar } from '../src/components/MargiTopBar';
import { OnboardingShell } from '../src/components/OnboardingShell';
import { TextSizeSlider } from '../src/components/TextSizeSlider';
import { useApp } from '../src/context/AppContext';
import { announceA11y, speakA11y } from '../src/lib/a11yRuntime';
import { setOnboarded } from '../src/lib/storage';
import { useThemeTokens } from '../src/theme/useThemeTokens';

/**
 * Stitch `accessibility_features` — Voice Command, High Contrast, Screen Reader,
 * Haptic Crash Alerts, Audio Navigation. Each toggle persists and triggers live feedback.
 */
export default function AccessibilityScreen() {
  const { fromSettings, fromProfile } = useLocalSearchParams<{
    fromSettings?: string;
    fromProfile?: string;
  }>();
  const inSettings = fromSettings === '1' || fromProfile === '1';
  const insets = useSafeAreaInsets();
  const tokens = useThemeTokens();
  const { a11y, updateA11y } = useApp();
  const scale = a11y.fontScale ?? 1;

  const patchA11y = async (patch: Parameters<typeof updateA11y>[0], label: string) => {
    await updateA11y(patch);
    const next = { ...a11y, ...patch };
    announceA11y(`${label} ${Object.values(patch)[0] ? 'on' : 'off'}`, next);
    if (patch.voiceCommand !== undefined && patch.voiceCommand) {
      speakA11y('Voice command control enabled. Hands-free safety features are active.', next);
    }
    if (patch.highContrast !== undefined) {
      speakA11y(
        patch.highContrast
          ? 'High contrast mode enabled.'
          : 'High contrast mode disabled.',
        next
      );
    }
  };

  const finish = async () => {
    if (!inSettings) {
      await setOnboarded();
      router.replace('/(tabs)/explore' as Href);
    } else {
      router.back();
    }
  };

  const toggles = (
    <View style={styles.toggleList}>
      <AccessibilityToggleCard
        icon="mic"
        title="Voice Command Control"
        description="Operate core safety features completely hands-free."
        value={a11y.voiceCommand}
        onValueChange={(v) => patchA11y({ voiceCommand: v, ttsEnabled: v ? true : a11y.ttsEnabled }, 'Voice command')}
        activeIconBg
      />
      <AccessibilityToggleCard
        icon="contrast"
        title="High Contrast Mode"
        description="Enhance visual clarity for critical alerts and map paths."
        value={a11y.highContrast}
        onValueChange={(v) => patchA11y({ highContrast: v }, 'High contrast')}
        activeIconBg={a11y.highContrast}
      />
      <AccessibilityToggleCard
        icon="record-voice-over"
        title="Screen Reader Support"
        description="Optimize interface for TalkBack and standard screen readers."
        value={a11y.screenReader}
        onValueChange={(v) => patchA11y({ screenReader: v }, 'Screen reader')}
        activeIconBg={a11y.screenReader}
      />
      <AccessibilityToggleCard
        icon="vibration"
        title="Haptic Crash Alerts"
        description="Receive strong physical feedback for immediate danger warnings."
        value={a11y.hapticCrashAlerts}
        onValueChange={(v) => patchA11y({ hapticCrashAlerts: v }, 'Haptic alerts')}
        activeIconBg
      />
      <AccessibilityToggleCard
        icon="volume-up"
        title="Audio Navigation"
        description="Detailed turn-by-turn spoken directions and traffic updates."
        value={a11y.audioNavigation}
        onValueChange={(v) => patchA11y({ audioNavigation: v, ttsEnabled: v ? true : a11y.ttsEnabled }, 'Audio navigation')}
        activeIconBg
      />
    </View>
  );

  if (!inSettings) {
    return (
      <OnboardingShell
        step={3}
        total={3}
        title="Accessibility"
        subtitle="Customize your Nova Drive experience for safer, distraction-free navigation."
      >
        {toggles}
        <MargiButton label="Enter Margi" onPress={finish} large style={{ marginTop: 8 }} />
      </OnboardingShell>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: tokens.background }]}>
      <StatusBar style="light" />
      <MargiTopBar title="Margi" showBack onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <HudText variant="headlineLg" style={[styles.title, { color: tokens.primary }]}>
          Accessibility
        </HudText>
        <HudText variant="bodyMd" style={styles.subtitle}>
          Customize your Nova Drive experience for safer, distraction-free navigation.
        </HudText>
        {toggles}
        <MargiButton label="Save & close" onPress={finish} large style={{ marginTop: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, gap: 12 },
  title: { marginTop: 4 },
  subtitle: { color: '#44474e', lineHeight: 24, marginBottom: 8 },
  toggleList: { gap: 12 },
});
