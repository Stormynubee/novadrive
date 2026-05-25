import { StyleSheet, View } from 'react-native';
import { HudText } from '../HudText';
import type { SarthiActionCard as SarthiActionCardType } from '../../lib/sarthiTypes';
import { tokens } from '../../theme/tokens';

export function SarthiActionCard({ card }: { card: SarthiActionCardType }) {
  return (
    <View style={styles.card}>
      <View style={styles.bar} />
      <View style={styles.body}>
        <HudText variant="bodyMd" style={styles.title}>
          {card.title}
        </HudText>
        <HudText variant="bodySm" style={styles.subtitle}>
          {card.subtitle}
        </HudText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginTop: tokens.spacing.base,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    ...tokens.elevation.card,
  },
  bar: { width: 4, backgroundColor: tokens.secondary },
  body: { flex: 1, padding: tokens.spacing.gutter },
  title: { color: tokens.onSurface, fontFamily: 'PublicSans_600SemiBold' },
  subtitle: { color: tokens.onSurfaceVariant, marginTop: 4 },
});
