import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';
import { dialHelpline } from '../../lib/naariShakti/linkingActions';
import { POLICE } from '../../lib/naariShakti/helplines';

type Props = {
  visible: boolean;
  onCancel: () => void;
};

export function NaariEmergencyHud({ visible, onCancel }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <HudText variant="headlineLg" style={styles.title}>
          DISTRESS SIGNAL INITIATED
        </HudText>
        <ActivityIndicator size="large" color={tokens.onSecondary} style={styles.spinner} />
        <HudText variant="bodyMd" style={styles.body}>
          GPS coordinates transmitted. Dispatching immediate response team to your location.
        </HudText>
        <Pressable style={styles.primaryBtn} onPress={() => dialHelpline(POLICE)}>
          <HudText variant="bodyMd" style={styles.primaryLabel}>
            Speak to Officer
          </HudText>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <HudText variant="bodyMd" style={styles.cancelLabel}>
            CANCEL ALERT
          </HudText>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(254, 107, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: tokens.onSecondary,
    textAlign: 'center',
    fontFamily: 'HankenGrotesk_800ExtraBold',
    marginBottom: 16,
  },
  spinner: { marginVertical: 24 },
  body: { color: tokens.onSecondary, textAlign: 'center', marginBottom: 32, maxWidth: 320 },
  primaryBtn: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: tokens.surfaceContainerLowest,
    paddingVertical: 16,
    borderRadius: tokens.radius.card,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryLabel: {
    color: tokens.secondaryContainer,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 1,
  },
  cancelBtn: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: tokens.radius.card,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 10, 30, 0.25)',
  },
  cancelLabel: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
});
