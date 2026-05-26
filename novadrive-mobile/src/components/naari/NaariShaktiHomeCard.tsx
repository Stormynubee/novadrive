import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

type Props = {
  onPress: () => void;
};

export function NaariShaktiHomeCard({ onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Naari Shakti Emergency Safety Portal"
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="female" size={28} color={tokens.onSecondary} />
      </View>
      <View style={styles.textCol}>
        <HudText variant="bodyMd" style={styles.title}>
          NAARI SHAKTI
        </HudText>
        <HudText variant="bodySm" style={styles.sub}>
          Emergency Safety Portal
        </HudText>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={tokens.outline} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: `${tokens.secondaryContainer}4D`,
    backgroundColor: tokens.surfaceContainerLowest,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  title: {
    color: tokens.secondaryContainer,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 1,
  },
  sub: { color: tokens.onSurfaceVariant, marginTop: 2 },
});
