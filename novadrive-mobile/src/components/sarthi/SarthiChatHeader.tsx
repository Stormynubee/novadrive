import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

export function SarthiChatHeader({
  compact,
  onClose,
}: {
  compact?: boolean;
  onClose: () => void;
}) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="account-balance" size={compact ? 20 : 22} color={tokens.onPrimary} />
      </View>
      <View style={styles.titles}>
        <HudText variant={compact ? 'bodyMd' : 'headlineMd'} style={styles.title}>
          Sarthi — AI Assistant
        </HudText>
        {!compact ? (
          <HudText variant="bodySm" style={styles.subtitle}>
            Powered by Margi
          </HudText>
        ) : null}
      </View>
      <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close Sarthi">
        <MaterialIcons name="close" size={22} color={tokens.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.base,
    backgroundColor: tokens.primary,
    paddingHorizontal: tokens.spacing.gutter,
    paddingVertical: tokens.spacing.stackMd,
  },
  headerCompact: {
    paddingVertical: tokens.spacing.base,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.iconWrap,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1 },
  title: { color: tokens.onPrimary, fontFamily: 'HankenGrotesk_700Bold' },
  subtitle: { color: tokens.primaryFixedDim, marginTop: 2 },
});
