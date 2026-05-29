import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TripBriefingCard } from './TripBriefingCard';
import { HudText } from './HudText';
import { buildTripBriefing, type BriefingCard } from '../lib/tripBriefing';
import { tokens } from '../theme/tokens';

export function TripBriefingSection({
  originLabel,
  destinationLabel,
  originLat,
  originLng,
  routeId,
  routeName,
  onCardsLoaded,
}: {
  originLabel: string;
  destinationLabel: string;
  originLat: number;
  originLng: number;
  routeId: string;
  routeName: string;
  onCardsLoaded?: (cards: BriefingCard[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cards, setCards] = useState<BriefingCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expanded || !destinationLabel.trim()) return;
    setLoading(true);
    buildTripBriefing(
      { lat: originLat, lng: originLng, label: originLabel },
      destinationLabel
    )
      .then((c) => {
        setCards(c);
        onCardsLoaded?.(c);
      })
      .finally(() => setLoading(false));
  }, [expanded, destinationLabel, originLabel, originLat, originLng, onCardsLoaded]);

  if (!destinationLabel.trim()) return null;

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.toggle} onPress={() => setExpanded((e) => !e)}>
        <MaterialIcons name="layers" size={20} color={tokens.primary} />
        <HudText variant="bodyMd" style={styles.toggleText}>
          Trip briefing (offline)
        </HudText>
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={22}
          color={tokens.outline}
        />
      </Pressable>
      {expanded ? (
        loading ? (
          <ActivityIndicator color={tokens.primary} style={{ marginVertical: 12 }} />
        ) : (
          <>
            <HudText variant="mono" style={styles.routeTag}>
              {routeName} · {routeId}
            </HudText>
            {cards.map((card) => (
              <TripBriefingCard key={card.type} card={card} />
            ))}
          </>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: tokens.spacing.stackMd },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  toggleText: { flex: 1, color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  routeTag: { fontSize: 10, letterSpacing: 1, color: tokens.secondary, marginBottom: 8 },
});
