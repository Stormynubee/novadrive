import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

type Props = {
  visible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
};

export function NaariShaktiProtocolModal({ visible, onEnable, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialIcons
                name="shield"
                size={40}
                color={tokens.secondaryContainer}
                style={{ fontWeight: 'bold' }}
              />
            </View>
            <HudText variant="headlineMd" style={styles.headerTitle}>
              Naari Shakti Protocol
            </HudText>
          </View>
          <View style={styles.body}>
            <HudText variant="bodyMd" style={styles.message}>
              Verified female user detected. Would you like to enable the specialized emergency
              portal for enhanced protection?
            </HudText>
            <Pressable style={styles.enableBtn} onPress={onEnable}>
              <HudText variant="bodyMd" style={styles.enableLabel}>
                ENABLE PORTAL
              </HudText>
            </Pressable>
            <Pressable style={styles.notNow} onPress={onDismiss}>
              <HudText variant="bodyMd" style={styles.notNowLabel}>
                Not Now
              </HudText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 10, 30, 0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: tokens.surfaceContainerLowest,
    borderRadius: tokens.radius.card,
    overflow: 'hidden',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    backgroundColor: tokens.primary,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(254, 107, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: tokens.onPrimary, textAlign: 'center' },
  body: { padding: 24, alignItems: 'center' },
  message: { color: tokens.onSurfaceVariant, textAlign: 'center', marginBottom: 24 },
  enableBtn: {
    width: '100%',
    backgroundColor: tokens.secondaryContainer,
    paddingVertical: 14,
    borderRadius: tokens.radius.card,
    alignItems: 'center',
    marginBottom: 12,
  },
  enableLabel: {
    color: tokens.onSecondary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 1,
  },
  notNow: { paddingVertical: 8 },
  notNowLabel: { color: tokens.outline, fontFamily: 'PublicSans_700Bold' },
});
