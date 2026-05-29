import * as Location from 'expo-location';
import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CorridorAtbInputs } from './CorridorAtbInputs';
import { DashboardHeader } from './DashboardHeader';
import { HudText } from './HudText';
import { LiveChip } from './LiveChip';
import { PlanCorridorMap } from './PlanCorridorMap';
import { useApp } from '../context/AppContext';
import { toCurrentLocationLabel } from '../lib/location/locationLabel';
import { saveTripPlanCache } from '../lib/tripPlanCache';
import type { BriefingCard } from '../lib/tripBriefing';
import { TripBriefingSection } from './TripBriefingSection';
import { planTripRoute, projectPolylineToViewBox } from '../lib/routing/tripRoute';
import { MAP_VIEWBOX } from '../lib/corridorMapGeometry';
import type { LatLng } from '../lib/routing/nominatim';
import { tokens } from '../theme/tokens';

type RoutePreference = 'safest' | 'fastest';

type CorridorRoute = {
  id: string;
  name: string;
  distanceKm: number;
  minutes: number;
  safetyPct: number;
  govSuggested?: boolean;
  caution?: boolean;
};

const ROUTE_CATALOG: Record<RoutePreference, CorridorRoute[]> = {
  safest: [
    {
      id: 'alpha',
      name: 'Corridor Alpha-1',
      distanceKm: 12.4,
      minutes: 38,
      safetyPct: 98,
      govSuggested: true,
    },
    {
      id: 'beta',
      name: 'Route Beta (Express)',
      distanceKm: 14.1,
      minutes: 32,
      safetyPct: 82,
      caution: true,
    },
  ],
  fastest: [
    {
      id: 'beta',
      name: 'Route Beta (Express)',
      distanceKm: 14.1,
      minutes: 32,
      safetyPct: 82,
      caution: true,
    },
    {
      id: 'alpha',
      name: 'Corridor Alpha-1',
      distanceKm: 12.4,
      minutes: 38,
      safetyPct: 98,
      govSuggested: true,
    },
  ],
};

function SafetyBadge({ route }: { route: CorridorRoute }) {
  const safe = route.safetyPct >= 90;
  return (
    <View style={[badgeStyles.wrap, safe ? badgeStyles.safe : badgeStyles.caution]}>
      <MaterialIcons
        name={safe ? 'shield' : 'warning'}
        size={16}
        color={safe ? tokens.onTertiaryContainer : tokens.secondaryDeep}
      />
      <HudText variant="bodySm" style={[badgeStyles.text, safe ? badgeStyles.safeText : badgeStyles.cautionText]}>
        {route.safetyPct}% Safe
      </HudText>
    </View>
  );
}

function RouteCard({
  route,
  selected,
  onPress,
}: {
  route: CorridorRoute;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles.card,
        selected && cardStyles.cardSelected,
        pressed && cardStyles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[cardStyles.accent, selected ? cardStyles.accentPrimary : cardStyles.accentMuted]} />
      <View style={cardStyles.body}>
        <View style={cardStyles.titleRow}>
          <HudText variant="bodyMd" style={cardStyles.title}>
            {route.name}
          </HudText>
          {route.govSuggested ? (
            <View style={cardStyles.govChip}>
              <HudText variant="mono" style={cardStyles.govChipText}>
                GOV SUGGESTED
              </HudText>
            </View>
          ) : null}
        </View>
        <View style={cardStyles.metaRow}>
          <MaterialIcons name="straighten" size={14} color={tokens.onSurfaceVariant} />
          <HudText variant="bodySm" style={cardStyles.meta}>
            {route.distanceKm} km
          </HudText>
          <MaterialIcons name="schedule" size={14} color={tokens.onSurfaceVariant} />
          <HudText variant="bodySm" style={cardStyles.meta}>
            {route.minutes} min
          </HudText>
        </View>
      </View>
      <SafetyBadge route={route} />
    </Pressable>
  );
}

/**
 * Trip tab — Stitch `plan_corridor_route_planning`: map canvas + bottom sheet planner.
 */
export function PlanCorridorScreen() {
  const { height: windowH } = useWindowDimensions();
  const mapHeight = Math.round(windowH * 0.37);

  const { journeyStatus, plannedDestination, setPlannedDestination } = useApp();
  const live = journeyStatus === 'ACTIVE';

  const [origin, setOrigin] = useState('Locating…');
  const [originCoords, setOriginCoords] = useState({ lat: 13.0827, lng: 80.2707 });
  const [destination, setDestination] = useState('');
  const [briefingCards, setBriefingCards] = useState<BriefingCard[]>([]);
  const [preference, setPreference] = useState<RoutePreference>('safest');
  const [selectedRouteId, setSelectedRouteId] = useState('alpha');
  const [osrmPolyline, setOsrmPolyline] = useState<LatLng[] | null>(null);
  const [osrmPathD, setOsrmPathD] = useState<string | undefined>();
  const [osrmOnline, setOsrmOnline] = useState(false);
  const [osrmMetrics, setOsrmMetrics] = useState<{ distanceKm: number; minutes: number } | null>(
    null
  );
  const gpsReady = useRef(false);
  const routeFetchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const routes = ROUTE_CATALOG[preference];

  const selectedRoute = useMemo(() => {
    const base = routes.find((r) => r.id === selectedRouteId) ?? routes[0];
    if (osrmMetrics) {
      return { ...base, distanceKm: osrmMetrics.distanceKm, minutes: osrmMetrics.minutes };
    }
    return base;
  }, [routes, selectedRouteId, osrmMetrics]);

  useEffect(() => {
    if (gpsReady.current) return;
    gpsReady.current = true;    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();        if (status !== 'granted') {
          setOrigin('Current location (permission needed)');
          return;
        }
        const last = await Location.getLastKnownPositionAsync({ maxAge: 90_000 });
        if (last?.coords) {
          setOriginCoords({ lat: last.coords.latitude, lng: last.coords.longitude });
          setOrigin(
            toCurrentLocationLabel({
              lat: last.coords.latitude,
              lng: last.coords.longitude,
            })
          );
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setOriginCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setOrigin(
          toCurrentLocationLabel({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        );
      } catch {        setOrigin('Current location unavailable');
      }
    })();
  }, []);

  useEffect(() => {
    const first = ROUTE_CATALOG[preference][0];
    setSelectedRouteId(first.id);
  }, [preference]);

  useEffect(() => {
    if (plannedDestination && !destination) {
      setDestination(plannedDestination);
    }
  }, [plannedDestination, destination]);

  useEffect(() => {
    const dest = destination.trim();
    if (!dest) {
      setOsrmPolyline(null);
      setOsrmPathD(undefined);
      setOsrmOnline(false);
      setOsrmMetrics(null);
      return;
    }
    if (routeFetchRef.current) clearTimeout(routeFetchRef.current);
    routeFetchRef.current = setTimeout(() => {
      void (async () => {
        try {
          const plan = await planTripRoute({
            origin: originCoords,
            destinationQuery: dest,
          });
          if (!plan) {
            setOsrmPolyline(null);
            setOsrmPathD(undefined);
            setOsrmOnline(false);
            setOsrmMetrics(null);
            return;
          }
          setOsrmPolyline(plan.route.coordinates);
          setOsrmPathD(
            projectPolylineToViewBox(plan.route.coordinates, MAP_VIEWBOX.w, MAP_VIEWBOX.h)
          );
          setOsrmOnline(true);
          setOsrmMetrics({ distanceKm: plan.distanceKm, minutes: plan.minutes });
        } catch {
          setOsrmPolyline(null);
          setOsrmPathD(undefined);
          setOsrmOnline(false);
          setOsrmMetrics(null);
        }
      })();
    }, 800);
    return () => {
      if (routeFetchRef.current) clearTimeout(routeFetchRef.current);
    };
  }, [destination, originCoords]);

  const onPreference = useCallback((next: RoutePreference) => {
    Haptics.selectionAsync().catch(() => undefined);
    setPreference(next);
  }, []);

  const startDriving = useCallback(async () => {
    const dest = destination.trim();
    if (!dest) {
      Alert.alert('Destination required', 'Enter your destination ID or area before starting.');
      return;
    }
    const label = `${selectedRoute.name} → ${dest}`;
    setPlannedDestination(label);
    await saveTripPlanCache({
      originLabel: origin,
      destinationLabel: dest,
      routeId: selectedRoute.id,
      routeName: selectedRoute.name,
      savedAt: new Date().toISOString(),
      briefingSnapshot: briefingCards,
      routePolyline: osrmPolyline ?? undefined,
      distanceKm: selectedRoute.distanceKm,
      minutes: selectedRoute.minutes,
      osrmOnline,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.push('/journey/depart' as Href);
  }, [destination, selectedRoute, origin, briefingCards, setPlannedDestination, osrmPolyline, osrmOnline]);

  const openLiveHud = () => {
    router.push('/journey' as Href);
  };

  const openBriefing = () => {
    router.push('/trip/plan' as Href);
  };

  return (
    <View style={styles.root}>
      <DashboardHeader planCorridorChrome />

      <View style={[styles.mapRegion, { height: mapHeight }]}>
        <PlanCorridorMap
          routeId={selectedRoute.id === 'beta' ? 'beta' : 'alpha'}
          preference={preference}
          hasDestination={destination.trim().length > 0}
          osrmPathD={osrmPathD}
          osrmOnline={osrmOnline}
        />
        {live ? (
          <View style={styles.liveBanner}>
            <LiveChip label="Live journey" tone="safe" />
            <Pressable onPress={openLiveHud} style={styles.liveLink}>
              <HudText variant="bodySm" style={styles.liveLinkText}>
                Open HUD
              </HudText>
              <MaterialIcons name="chevron-right" size={18} color={tokens.onPrimary} />
            </Pressable>
          </View>
        ) : null}
      </View>

      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {live ? (
          <View style={styles.liveSheet}>
            <HudText variant="headlineLg" style={styles.sheetTitle}>
              Drive in progress
            </HudText>
            <HudText variant="bodyMd" style={styles.sheetSub}>
              {plannedDestination || 'Active corridor'} — return to the live HUD for telemetry and SOS.
            </HudText>
            <Pressable
              onPress={openLiveHud}
              style={({ pressed }) => [styles.startBtn, pressed && styles.startPressed]}
            >
              <MaterialIcons name="directions-car" size={22} color={tokens.onPrimary} />
              <HudText variant="bodyMd" style={styles.startLabel}>
                Open live HUD
              </HudText>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <HudText variant="headlineLg" style={styles.sheetTitle}>
                Plan Corridor
              </HudText>
              <HudText variant="bodyMd" style={styles.sheetSub}>
                Select authorized route and dispatch.
              </HudText>

              <CorridorAtbInputs
                origin={origin}
                destination={destination}
                onDestinationChange={setDestination}
              />

              <View style={styles.prefRow}>
                <Pressable
                  onPress={() => onPreference('safest')}
                  style={[styles.prefBtn, preference === 'safest' && styles.prefBtnOn]}
                >
                  <MaterialIcons
                    name="verified-user"
                    size={18}
                    color={preference === 'safest' ? tokens.primary : tokens.onSurfaceVariant}
                  />
                  <HudText
                    variant="bodySm"
                    style={[styles.prefLabel, preference === 'safest' && styles.prefLabelOn]}
                  >
                    Safest
                  </HudText>
                </Pressable>
                <Pressable
                  onPress={() => onPreference('fastest')}
                  style={[styles.prefBtn, preference === 'fastest' && styles.prefBtnOn]}
                >
                  <MaterialIcons
                    name="bolt"
                    size={18}
                    color={preference === 'fastest' ? tokens.primary : tokens.onSurfaceVariant}
                  />
                  <HudText
                    variant="bodySm"
                    style={[styles.prefLabel, preference === 'fastest' && styles.prefLabelOn]}
                  >
                    Fastest
                  </HudText>
                </Pressable>
              </View>

              <View style={styles.routeList}>
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    selected={selectedRoute.id === route.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => undefined);
                      setSelectedRouteId(route.id);
                    }}
                  />
                ))}
              </View>

              <TripBriefingSection
                originLabel={origin}
                destinationLabel={destination}
                originLat={originCoords.lat}
                originLng={originCoords.lng}
                routeId={selectedRoute.id}
                routeName={selectedRoute.name}
                onCardsLoaded={setBriefingCards}
              />

              <Pressable onPress={openBriefing} style={styles.briefingLink}>
                <MaterialIcons name="open-in-new" size={18} color={tokens.primary} />
                <HudText variant="bodySm" style={styles.briefingLinkText}>
                  Full-screen corridor briefing
                </HudText>
                <MaterialIcons name="chevron-right" size={20} color={tokens.outline} />
              </Pressable>
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                onPress={startDriving}
                style={({ pressed }) => [styles.startBtn, pressed && styles.startPressed]}
                accessibilityRole="button"
                accessibilityLabel="Start driving"
              >
                <MaterialIcons name="directions-car" size={22} color={tokens.onPrimary} />
                <HudText variant="bodyMd" style={styles.startLabel}>
                  Start Driving
                </HudText>
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  mapRegion: {
    minHeight: 160,
    backgroundColor: tokens.surfaceContainerHigh,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outlineVariant,
  },
  liveBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,10,30,0.82)',
    borderRadius: tokens.radius.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  liveLinkText: { color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' },
  sheet: {
    flex: 1,
    backgroundColor: tokens.surface,
    borderTopLeftRadius: tokens.radius.sheet,
    borderTopRightRadius: tokens.radius.sheet,
    marginTop: -12,
    ...tokens.elevation.floating,
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: tokens.outlineVariant,
    opacity: 0.6,
  },
  sheetScroll: { flex: 1 },
  sheetScrollContent: {
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingBottom: 24,
    flexGrow: 1,
  },
  sheetTitle: {
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 28,
    lineHeight: 34,
    marginTop: 4,
  },
  sheetSub: {
    color: tokens.onSurfaceVariant,
    marginTop: 4,
    marginBottom: tokens.spacing.stackMd,
  },
  prefRow: {
    flexDirection: 'row',
    backgroundColor: tokens.surfaceContainerLow,
    borderRadius: tokens.radius.card,
    padding: 4,
    marginBottom: tokens.spacing.stackMd,
  },
  prefBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: tokens.radius.button,
  },
  prefBtnOn: {
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.primary,
    ...tokens.elevation.card,
  },
  prefLabel: { color: tokens.onSurfaceVariant, fontFamily: 'PublicSans_700Bold' },
  prefLabelOn: { color: tokens.primary },
  routeList: { gap: 10 },
  briefingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: tokens.spacing.stackMd,
    paddingVertical: 10,
  },
  briefingLinkText: { flex: 1, color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  footer: {
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingTop: 10,
    paddingBottom: 100,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,198,207,0.35)',
    backgroundColor: tokens.surface,
  },
  startBtn: {
    height: 56,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: tokens.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  startPressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  startLabel: {
    color: tokens.onPrimary,
    fontFamily: 'PublicSans_700Bold',
    fontSize: 16,
  },
  liveSheet: {
    flex: 1,
    paddingHorizontal: tokens.spacing.sideMargin,
    paddingBottom: 100,
    gap: 12,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    padding: 14,
    paddingLeft: 16,
    overflow: 'hidden',
    ...tokens.elevation.card,
  },
  cardSelected: {
    backgroundColor: tokens.surfaceContainerLowest,
    borderColor: 'rgba(0,10,30,0.2)',
  },
  pressed: { opacity: 0.92 },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  accentPrimary: { backgroundColor: tokens.primary },
  accentMuted: { backgroundColor: tokens.outlineVariant },
  body: { flex: 1, marginLeft: 6, marginRight: 8 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 4 },
  title: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  govChip: {
    backgroundColor: 'rgba(0,10,30,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  govChipText: {
    fontSize: 9,
    letterSpacing: 0.8,
    color: tokens.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { color: tokens.onSurfaceVariant, marginRight: 6 },
});

const badgeStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: tokens.radius.button,
  },
  safe: { backgroundColor: tokens.tertiaryContainer },
  caution: { backgroundColor: tokens.secondaryFixed },
  text: { fontFamily: 'PublicSans_700Bold', fontSize: 12 },
  safeText: { color: tokens.onTertiaryContainer },
  cautionText: { color: tokens.secondaryDeep },
});
