import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { HudText } from './HudText';
import { tokens } from '../theme/tokens';

type Accent = 'emergency' | 'scan' | 'default';

const ACCENT: Record<Accent, { fg: string; tile: string; left: string }> = {
  emergency: { fg: tokens.secondary, tile: tokens.secondaryFixed, left: tokens.secondary },
  scan: { fg: tokens.primary, tile: tokens.primaryFixed, left: tokens.primary },
  default: { fg: tokens.primary, tile: tokens.surfaceContainerLow, left: tokens.outlineVariant },
};

export function QuickActionTile({
  label,
  icon,
  onPress,
  accent = 'default',
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  accent?: Accent;
}) {
  const tint = ACCENT[accent];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: tint.tile, borderColor: tint.fg }]}
      >
        <MaterialIcons name={icon} size={26} color={tint.fg} />
      </View>
      <HudText variant="bodyMd" style={styles.label}>
        {label}
      </HudText>
      <View style={[styles.leftAccent, { backgroundColor: tint.left }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 110,
    borderRadius: tokens.radius.card,
    padding: 16,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    ...tokens.elevation.card,
    overflow: 'hidden',
    gap: 10,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.iconWrap,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});
