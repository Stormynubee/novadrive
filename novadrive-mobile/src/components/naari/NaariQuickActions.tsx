import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';

type Action = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

type Props = {
  actions: Action[];
};

export function NaariQuickActions({ actions }: Props) {
  return (
    <View style={styles.list}>
      {actions.map((a) => (
        <Pressable
          key={a.id}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={a.onPress}
        >
          <View style={styles.iconBox}>
            <MaterialIcons name={a.icon} size={24} color={tokens.primary} />
          </View>
          <View style={styles.text}>
            <HudText variant="bodyMd" style={styles.title}>
              {a.title}
            </HudText>
            <HudText variant="bodySm" style={styles.sub}>
              {a.subtitle}
            </HudText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={tokens.outline} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surfaceContainerLowest,
  },
  pressed: { backgroundColor: tokens.surfaceContainer },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.input,
    backgroundColor: `${tokens.primary}0D`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { fontFamily: 'PublicSans_700Bold', color: tokens.onSurface },
  sub: { color: tokens.onSurfaceVariant, marginTop: 2 },
});
