import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { HudText } from './HudText';
import { MargiTopBar } from './MargiTopBar';
import { ProgressRail, type RailStep } from './ProgressRail';
import { tokens } from '../theme/tokens';

const STEP_NUM: Record<RailStep, number> = {
  Locate: 1,
  Triage: 2,
  Route: 3,
  Packet: 4,
  Relay: 5,
};

/**
 * Five-step emergency frame: navy app bar → "STEP n OF 5" + ProgressRail → title/subtitle →
 * scrollable content → sticky surface footer with action buttons.
 */
export function EmergencyStepShell({
  step,
  title,
  subtitle,
  children,
  footer,
  showBack,
}: {
  step: RailStep;
  title: string;
  subtitle: string;
  children?: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
}) {
  const { a11y } = useApp();
  const n = STEP_NUM[step];

  return (
    <SafeAreaView
      style={[styles.safe, a11y.highContrast && styles.highContrast]}
      edges={['bottom']}
    >
      <MargiTopBar title="EMERGENCY" subtitle={`Step ${n} · ${step}`} showBack={showBack} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProgressRail current={step} />
        <HudText variant="mono" style={styles.stepLabel}>{`STEP ${n} OF 5`}</HudText>
        <HudText variant="headlineLg" style={styles.title}>
          {title}
        </HudText>
        <HudText variant="bodyMd" style={styles.sub}>
          {subtitle}
        </HudText>
        <View style={styles.body}>{children}</View>
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.background },
  highContrast: { backgroundColor: '#ffffff' },
  scroll: { padding: tokens.spacing.gutter, paddingTop: 16, paddingBottom: 24 },
  stepLabel: { marginBottom: 4, color: tokens.secondary },
  title: { marginBottom: 4, color: tokens.primary },
  sub: { marginBottom: 18, color: tokens.onSurfaceVariant, lineHeight: 22 },
  body: { gap: 14 },
  footer: {
    padding: tokens.spacing.gutter,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.outlineVariant,
    gap: 10,
    backgroundColor: tokens.surface,
  },
});
