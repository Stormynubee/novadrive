import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

export function DrivingHudHeader({
  paddingTop,
  onMenu,
  onEmergencyShare,
}: {
  paddingTop: number;
  onMenu: () => void;
  onEmergencyShare: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop }]}>
      <Pressable onPress={onMenu} style={styles.iconBtn} accessibilityLabel="Menu">
        <MaterialIcons name="menu" size={24} color={tokens.onPrimary} />
      </Pressable>
      <HudText variant="headlineMd" style={styles.headerTitle}>
        Margi
      </HudText>
      <Pressable onPress={onEmergencyShare} style={styles.iconBtn} accessibilityLabel="Emergency share">
        <MaterialIcons name="emergency-share" size={26} color={tokens.secondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: tokens.primary,
    zIndex: 10,
    gap: 8,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: tokens.onPrimary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: 1,
    fontSize: 18,
  },
});
