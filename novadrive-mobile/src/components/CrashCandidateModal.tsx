import { Modal, StyleSheet, Text, View } from 'react-native';
import { NovaButton } from './NovaButton';
import { colors } from '../theme/colors';

export function CrashCandidateModal({
  visible,
  countdown,
  onDismiss,
  onConfirm,
}: {
  visible: boolean;
  countdown: number;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Possible incident detected</Text>
          <Text style={styles.body}>
            We noticed a sudden stop. Stay calm — nothing is sent automatically.
          </Text>
          <Text style={styles.countdown}>
            {countdown > 0 ? `${countdown}s — take a breath` : 'Ready when you are'}
          </Text>
          <NovaButton label="I'm OK — dismiss" onPress={onDismiss} variant="secondary" />
          <NovaButton
            label="Start emergency flow"
            onPress={onConfirm}
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  countdown: { color: colors.amber, fontSize: 18, fontWeight: '600', marginVertical: 16 },
});
