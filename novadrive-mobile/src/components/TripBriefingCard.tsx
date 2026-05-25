import { StyleSheet, Text, View } from 'react-native';
import type { BriefingCard } from '../lib/tripBriefing';
import { tokens } from '../theme/tokens';

export function TripBriefingCard({ card }: { card: BriefingCard }) {
  const accent =
    card.accent === 'secondary'
      ? tokens.secondary
      : card.accent === 'tertiary'
        ? tokens.tertiary
        : card.accent === 'outline'
          ? tokens.outline
          : tokens.primary;
  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <Text style={styles.title}>{card.title}</Text>
      <Text style={styles.body}>{card.body}</Text>
      {card.items?.map((item) => (
        <Text key={item} style={styles.item}>
          {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderLeftWidth: 4,
    marginBottom: 10,
    ...tokens.elevation.card,
  },
  title: {
    color: tokens.primary,
    fontSize: 16,
    fontFamily: 'HankenGrotesk_700Bold',
  },
  body: {
    color: tokens.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'PublicSans_400Regular',
    marginTop: 6,
  },
  item: {
    color: tokens.onSurfaceVariant,
    fontSize: 13,
    fontFamily: 'PublicSans_400Regular',
    marginTop: 6,
  },
});
