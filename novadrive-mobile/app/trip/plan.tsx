import * as Location from 'expo-location';
import { type Href, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { LiveChip } from '../../src/components/LiveChip';
import { MargiInput } from '../../src/components/MargiInput';
import { MargiTopBar } from '../../src/components/MargiTopBar';
import { ScreenEnter } from '../../src/components/ScreenEnter';
import { TripBriefingCard } from '../../src/components/TripBriefingCard';
import { useApp } from '../../src/context/AppContext';
import {
  buildTripBriefing,
  filterCardsByQuery,
  type BriefingCard,
} from '../../src/lib/tripBriefing';
import { tokens } from '../../src/theme/tokens';

/**
 * Stitch `plan_corridor_route_planning` — cab-style picker that turns into a corridor briefing
 * once "Calculate vector" is pressed. Briefing scroll appears below with offline keyword filter.
 */
export default function TripPlanScreen() {
  const insets = useSafeAreaInsets();
  const { setPlannedDestination } = useApp();
  const [pointA, setPointA] = useState('Fetching GPS…');
  const [pointB, setPointB] = useState('Chennai → Trichy (NH48)');
  const [cards, setCards] = useState<BriefingCard[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'input' | 'briefing'>('input');
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPointA('Location permission needed');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        setPointA(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      } catch {
        setPointA('Current location (GPS)');
      }
    })();
  }, []);

  const planTrip = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission required.');
      const pos = await Location.getCurrentPositionAsync({});
      setPlannedDestination(pointB);
      const briefing = await buildTripBriefing(
        { lat: pos.coords.latitude, lng: pos.coords.longitude, label: pointA },
        pointB
      );
      setCards(briefing);
      setPhase('briefing');
    } catch (e) {
      Alert.alert('Plan trip', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const startDrive = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.push('/journey/depart' as Href);
  };

  const shown = filterCardsByQuery(cards, query);

  return (
    <ScreenEnter variant="slide" delay={60}>
      <View style={styles.root}>
        <MargiTopBar
          title="PLAN CORRIDOR"
          subtitle="Point A · Point B"
          showBack
        />

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <HudText variant="mono" style={styles.kicker}>
            CORRIDOR INPUT
          </HudText>
          <HudText variant="headlineLg" style={styles.title}>
            Where are you going?
          </HudText>
          <HudText variant="bodyMd" style={styles.body}>
            Enter your destination — we'll pull a trauma POI briefing that works offline. GPS
            anchors point A automatically.
          </HudText>

          <HudCard>
            <View style={styles.routeVisual}>
              <View style={styles.dotCol}>
                <View style={[styles.dot, styles.dotA]} />
                <View style={styles.lineWrap}>
                  <Svg width={3} height={56}>
                    <Line
                      x1={1.5}
                      y1={0}
                      x2={1.5}
                      y2={56}
                      stroke={tokens.outlineVariant}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  </Svg>
                </View>
                <View style={[styles.dot, styles.dotB]} />
              </View>
              <View style={styles.inputsCol}>
                <HudText variant="mono" style={styles.fieldLabel}>
                  Pickup · GPS
                </HudText>
                <MargiInput value={pointA} editable={false} />
                <View style={{ height: 14 }} />
                <HudText variant="mono" style={styles.fieldLabel}>
                  Drop-off
                </HudText>
                <MargiInput
                  value={pointB}
                  onChangeText={setPointB}
                  placeholder="e.g. Chennai → Trichy (NH48)"
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.calcBtn,
                pressed && styles.calcPressed,
                loading && styles.calcDisabled,
              ]}
              onPress={planTrip}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={tokens.onSecondary} />
              ) : (
                <>
                  <MaterialIcons name="route" size={20} color={tokens.onSecondary} />
                  <HudText variant="mono" style={styles.calcLabel}>
                    Calculate vector
                  </HudText>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/trip/discover' as Href)}
              style={styles.discoverLink}
              accessibilityRole="link"
              accessibilityLabel="Open route discovery map"
            >
              <MaterialIcons name="map" size={18} color={tokens.primary} />
              <HudText variant="bodySm" style={styles.discoverLinkText}>
                Route discovery map (offline corridor preview)
              </HudText>
              <MaterialIcons name="chevron-right" size={20} color={tokens.outline} />
            </Pressable>
          </HudCard>

          {phase === 'briefing' && cards.length === 0 ? (
            <HudCard style={styles.emptyBriefing}>
              <HudText variant="bodyMd" style={styles.emptyBriefingText}>
                No briefing cards yet. Try route discovery or recalculate your vector.
              </HudText>
              <Pressable
                onPress={() => router.push('/trip/discover' as Href)}
                style={styles.discoverLink}
              >
                <HudText variant="bodySm" style={styles.discoverLinkText}>
                  Open route discovery
                </HudText>
                <MaterialIcons name="chevron-right" size={20} color={tokens.primary} />
              </Pressable>
            </HudCard>
          ) : null}

          {phase === 'briefing' && cards.length > 0 ? (
            <Animated.View entering={FadeInDown.duration(420)} style={styles.briefingSection}>
              <View style={styles.briefingHead}>
                <View style={{ flex: 1 }}>
                  <HudText variant="mono" style={styles.briefingKicker}>
                    BRIEFING · {cards.length} CARDS
                  </HudText>
                  <HudText variant="headlineMd" style={styles.briefingTitle}>
                    Route briefing
                  </HudText>
                </View>
                <LiveChip label="Offline" tone="safe" />
              </View>
              <MargiInput
                value={query}
                onChangeText={setQuery}
                placeholder="Filter by keyword (e.g. flood, hospital, police)"
              />
              {shown.map((c) => (
                <TripBriefingCard key={c.type} card={c} />
              ))}
              <Pressable
                style={({ pressed }) => [styles.driveBtn, pressed && styles.calcPressed]}
                onPress={startDrive}
              >
                <MaterialIcons name="play-arrow" size={28} color={tokens.onSecondary} />
                <HudText variant="headlineMd" style={styles.driveLabel}>
                  Start drive
                </HudText>
              </Pressable>
            </Animated.View>
          ) : null}
        </ScrollView>
      </View>
    </ScreenEnter>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  scroll: { padding: 20, gap: 14 },
  kicker: { fontSize: 10, letterSpacing: 1.6, color: tokens.secondary },
  title: { color: tokens.primary, marginTop: 4 },
  body: { color: tokens.onSurfaceVariant, lineHeight: 24, marginBottom: 4 },
  routeVisual: { flexDirection: 'row', gap: 14 },
  dotCol: { alignItems: 'center', width: 20, paddingTop: 22 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotA: { backgroundColor: tokens.tertiary },
  dotB: { backgroundColor: tokens.secondary },
  lineWrap: { height: 56, justifyContent: 'center', alignItems: 'center' },
  inputsCol: { flex: 1 },
  fieldLabel: {
    fontSize: 11,
    marginBottom: 6,
    letterSpacing: 1,
    color: tokens.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  calcBtn: {
    height: 52,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    ...tokens.elevation.card,
  },
  calcPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  calcDisabled: { opacity: 0.7 },
  calcLabel: {
    color: tokens.onSecondary,
    letterSpacing: 1.5,
    fontSize: 13,
  },
  briefingSection: { gap: 12, marginTop: 8 },
  briefingHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  briefingKicker: { fontSize: 10, color: tokens.secondary, letterSpacing: 1.4 },
  briefingTitle: { color: tokens.primary, marginTop: 2 },
  driveBtn: {
    height: 64,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    ...tokens.elevation.card,
  },
  driveLabel: { color: tokens.onSecondary },
  discoverLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 8,
  },
  discoverLinkText: { flex: 1, color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  emptyBriefing: { marginTop: 12, gap: 10 },
  emptyBriefingText: { color: tokens.onSurfaceVariant, lineHeight: 22 },
});
