import { Modal, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from './HudText';
import { NovaButton } from './NovaButton';
import type { SafetyAlertReason } from '../lib/safetyAlert';
import { safetyAlertBody, safetyAlertTitle } from '../lib/safetyAlert';
import { tokens } from '../theme/tokens';

export function CrashCandidateModal({
  visible,
  countdown,
  reason = 'impact',
  onDismiss,
  onConfirm,
}: {
  visible: boolean;
  countdown: number;
  reason?: SafetyAlertReason;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card} accessibilityRole="alert">
          <View style={styles.iconWrap}>
            <MaterialIcons
              name={reason === 'voice' ? 'record-voice-over' : 'warning'}
              size={32}
              color={tokens.secondary}
            />
          </View>
          <HudText variant="headlineMd" style={styles.title}>
            {safetyAlertTitle(reason)}
          </HudText>
          <HudText variant="bodyMd" style={styles.body}>
            {safetyAlertBody(reason)}
          </HudText>
          <View style={styles.countdown}>
            <View style={styles.countdownDot} />
            <HudText variant="mono" style={styles.countdownText}>
              {countdown > 0 ? `${countdown}s · take a breath` : 'Ready when you are'}
            </HudText>
          </View>
          <NovaButton label="I need help" onPress={onConfirm} variant="secondary" large />
          <NovaButton
            label="I am okay"
            onPress={onDismiss}
            variant="mint"
            style={{ marginTop: 10 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,10,30,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderLeftWidth: 4,
    borderLeftColor: tokens.secondary,
    ...tokens.elevation.floating,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.iconWrap,
    backgroundColor: tokens.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { color: tokens.primary },
  body: { color: tokens.onSurfaceVariant, marginTop: 8, lineHeight: 22 },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  countdownDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.secondary },
  countdownText: { color: tokens.secondary, fontSize: 12 },
});
