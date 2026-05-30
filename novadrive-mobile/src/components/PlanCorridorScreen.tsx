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
import { type LatLng, type GeocodeSuggestion, fetchLocationSuggestions } from '../lib/routing/nominatim';
import { fetchDrivingRoute, formatRouteDistanceKm, formatRouteMinutes } from '../lib/routing/osrm';
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

type SafetyHotspot = {
  area: string;
  risk: 'High' | 'Medium' | 'Low';
  reason: string;
  lat: number;
  lng: number;
  suggestion: string;
};

const SAFETY_HOTSPOTS: SafetyHotspot[] = [
  {
    area: 'Shivajinagar',
    risk: 'High',
    reason: 'Heavy traffic and poor signals',
    lat: 18.5308,
    lng: 73.8475,
    suggestion: 'Avoid peak hours (6–9 PM). Use designated flyover routes where possible.',
  },
  {
    area: 'Katraj',
    risk: 'Medium',
    reason: 'Sharp turns and highway merging',
    lat: 18.4575,
    lng: 73.8657,
    suggestion: 'Drive cautiously, extend your vehicle following distance to 3 seconds.',
  },
  {
    area: 'Hinjewadi',
    risk: 'Low',
    reason: 'Planned roads and better traffic control',
    lat: 18.5912,
    lng: 73.7389,
    suggestion: 'Optimal corridor selected. Drive within default speed limits.',
  },
  {
    area: 'Silk Board Junction, Bengaluru',
    risk: 'High',
    reason: 'Severe multi-way congestion and complex weaving patterns',
    lat: 12.9176,
    lng: 77.6244,
    suggestion: 'High-risk congestion zone. Anticipate sudden lane-changes and braking.',
  },
  {
    area: 'Kathipara Junction, Chennai',
    risk: 'High',
    reason: 'Complex multi-level merging and high transit speed variance',
    lat: 13.0076,
    lng: 80.2052,
    suggestion: 'High-risk merging zone. Maintain lane discipline and monitor blindspots.',
  },
  {
    area: 'Chanakyapuri, Delhi',
    risk: 'Medium',
    reason: 'High-speed broad corridors with frequent pedestrian crossings',
    lat: 28.5983,
    lng: 77.1895,
    suggestion: 'Moderate speed hazard. Be prepared for mid-block pedestrian crossings.',
  },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type SafetyAnalysis = {
  safetyPct: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  advice: string;
  closestHotspot: SafetyHotspot | null;
  distanceToHotspot: number | null;
};

function analyzeRouteSafety(coordinates: LatLng[] | null, destName: string): SafetyAnalysis {
  if (!coordinates || coordinates.length === 0) {
    const matched = SAFETY_HOTSPOTS.find((h) =>
      destName.toLowerCase().includes(h.area.toLowerCase().split(',')[0].trim())
    );
    if (matched) {
      const safetyPct = matched.risk === 'High' ? 62 : matched.risk === 'Medium' ? 82 : 98;
      return {
        safetyPct,
        riskLevel: matched.risk,
        advice: matched.suggestion,
        closestHotspot: matched,
        distanceToHotspot: 0,
      };
    }
    return {
      safetyPct: 98,
      riskLevel: 'Low',
      advice: 'Optimal corridor selected. Drive within speed limits.',
      closestHotspot: null,
      distanceToHotspot: null,
    };
  }

  let minDistance = Infinity;
  let closest: SafetyHotspot | null = null;

  for (const coord of coordinates) {
    for (const hotspot of SAFETY_HOTSPOTS) {
      const dist = getDistanceKm(coord.lat, coord.lng, hotspot.lat, hotspot.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = hotspot;
      }
    }
  }

  if (closest && minDistance <= 5.0) {
    const safetyPct =
      closest.risk === 'High'
        ? Math.max(55, Math.round(55 + (minDistance / 5.0) * 15))
        : closest.risk === 'Medium'
        ? Math.max(75, Math.round(75 + (minDistance / 5.0) * 13))
        : 98;

    return {
      safetyPct,
      riskLevel: closest.risk,
      advice: closest.suggestion,
      closestHotspot: closest,
      distanceToHotspot: Math.round(minDistance * 10) / 10,
    };
  }

  return {
    safetyPct: 98,
    riskLevel: 'Low',
    advice: 'No major accident hotspots detected on route. Safe to travel.',
    closestHotspot: null,
    distanceToHotspot: null,
  };
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

  // Suggestions state
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingSuggestions, setSearchingSuggestions] = useState(false);

  const routes = ROUTE_CATALOG[preference];

  const safetyAnalysis = useMemo(() => {
    return analyzeRouteSafety(osrmPolyline, destination);
  }, [osrmPolyline, destination]);

  const selectedRoute = useMemo(() => {
    const base = routes.find((r) => r.id === selectedRouteId) ?? routes[0];
    const distanceKm = osrmMetrics ? osrmMetrics.distanceKm : base.distanceKm;
    const minutes = osrmMetrics ? osrmMetrics.minutes : base.minutes;
    const safetyPct = osrmPolyline ? safetyAnalysis.safetyPct : base.safetyPct;
    return { ...base, distanceKm, minutes, safetyPct };
  }, [routes, selectedRouteId, osrmMetrics, osrmPolyline, safetyAnalysis]);

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

  const handleDestinationChange = useCallback((text: string) => {
    setDestination(text);
    if (text.trim().length >= 3) {
      setSearchingSuggestions(true);
      setShowSuggestions(true);
      fetchLocationSuggestions(text)
        .then((hits) => {
          setSuggestions(hits);
          setSearchingSuggestions(false);
        })
        .catch(() => {
          setSearchingSuggestions(false);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setOsrmPolyline(null);
      setOsrmPathD(undefined);
      setOsrmOnline(false);
      setOsrmMetrics(null);
    }
  }, [originCoords]);

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
                onDestinationChange={handleDestinationChange}
              />

              {showSuggestions && (
                <View style={styles.suggestionsCard}>
                  {searchingSuggestions ? (
                    <View style={styles.suggestionsStatus}>
                      <HudText variant="mono" style={styles.suggestionsStatusText}>SEARCHING REAL LOCATIONS…</HudText>
                    </View>
                  ) : suggestions.length === 0 ? (
                    <View style={styles.suggestionsStatus}>
                      <HudText variant="mono" style={styles.suggestionsStatusText}>NO REAL LOCATIONS FOUND</HudText>
                    </View>
                  ) : (
                    suggestions.map((item, idx) => (
                      <Pressable
                        key={`${item.lat}_${item.lng}_${idx}`}
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => undefined);
                          setDestination(item.displayName);
                          setOriginCoords(originCoords);
                          setOsrmPolyline(null);
                          setOsrmPathD(undefined);
                          setOsrmOnline(false);
                          setOsrmMetrics(null);
                          setShowSuggestions(false);

                          void (async () => {
                            try {
                              const route = await fetchDrivingRoute(originCoords, item);
                              if (route) {
                                setOsrmPolyline(route.coordinates);
                                setOsrmPathD(
                                  projectPolylineToViewBox(route.coordinates, MAP_VIEWBOX.w, MAP_VIEWBOX.h)
                                );
                                setOsrmOnline(true);
                                setOsrmMetrics({
                                  distanceKm: formatRouteDistanceKm(route.distanceM),
                                  minutes: formatRouteMinutes(route.durationS),
                                });
                              }
                            } catch (e) {
                              Alert.alert('Routing failed', 'Could not plan a route along proper roads.');
                            }
                          })();
                        }}
                        style={({ pressed }) => [
                          styles.suggestionRow,
                          pressed && styles.suggestionPressed,
                          idx < suggestions.length - 1 && styles.suggestionBorder,
                        ]}
                      >
                        <MaterialIcons name="location-on" size={16} color={tokens.secondary} style={{ marginRight: 8, marginTop: 2 }} />
                        <HudText variant="bodySm" style={styles.suggestionText} numberOfLines={2}>
                          {item.displayName}
                        </HudText>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

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
                    route={{
                      ...route,
                      distanceKm: selectedRoute.id === route.id ? selectedRoute.distanceKm : route.distanceKm,
                      minutes: selectedRoute.id === route.id ? selectedRoute.minutes : route.minutes,
                      safetyPct: selectedRoute.id === route.id ? selectedRoute.safetyPct : route.safetyPct,
                    }}
                    selected={selectedRoute.id === route.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => undefined);
                      setSelectedRouteId(route.id);
                    }}
                  />
                ))}
              </View>

              {/* AI Safety Intelligence & Recommendations Card */}
              {destination.trim().length > 0 && (
                <View style={styles.safetyAnalysisCard}>
                  <View style={styles.safetyAnalysisHeader}>
                    <MaterialIcons
                      name={safetyAnalysis.riskLevel === 'High' ? 'report-problem' : safetyAnalysis.riskLevel === 'Medium' ? 'warning' : 'security'}
                      size={20}
                      color={safetyAnalysis.riskLevel === 'High' ? tokens.error : safetyAnalysis.riskLevel === 'Medium' ? tokens.secondary : tokens.tertiary}
                    />
                    <HudText variant="headlineMd" style={styles.safetyAnalysisTitle}>
                      AI Safety Intelligence
                    </HudText>
                  </View>

                  <View style={styles.safetyAnalysisRow}>
                    <View style={styles.safetyMetric}>
                      <HudText variant="mono" style={styles.safetyMetricLabel}>ROUTE RISK</HudText>
                      <HudText
                        variant="headlineLg"
                        style={[
                          styles.safetyMetricValue,
                          {
                            color:
                              safetyAnalysis.riskLevel === 'High'
                                ? tokens.error
                                : safetyAnalysis.riskLevel === 'Medium'
                                ? tokens.secondary
                                : tokens.tertiary,
                          },
                        ]}
                      >
                        {safetyAnalysis.riskLevel.toUpperCase()}
                      </HudText>
                    </View>

                    <View style={styles.safetyDivider} />

                    <View style={styles.safetyMetric}>
                      <HudText variant="mono" style={styles.safetyMetricLabel}>SAFETY RATING</HudText>
                      <HudText
                        variant="headlineLg"
                        style={[
                          styles.safetyMetricValue,
                          {
                            color:
                              safetyAnalysis.safetyPct >= 90
                                ? tokens.tertiary
                                : safetyAnalysis.safetyPct >= 75
                                ? tokens.secondary
                                : tokens.error,
                          },
                        ]}
                      >
                        {safetyAnalysis.safetyPct}%
                      </HudText>
                    </View>
                  </View>

                  {safetyAnalysis.closestHotspot && (
                    <View style={styles.hotspotAlert}>
                      <MaterialIcons name="error-outline" size={16} color={tokens.primary} style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <HudText variant="bodyMd" style={styles.hotspotTitle}>
                          Proximity to Accident Hotspot
                        </HudText>
                        <HudText variant="bodySm" style={styles.hotspotReason}>
                          {safetyAnalysis.closestHotspot.area}: {safetyAnalysis.closestHotspot.reason}
                        </HudText>
                      </View>
                    </View>
                  )}

                  <View style={styles.recommendationBox}>
                    <HudText variant="mono" style={styles.recommendationLabel}>REAL-TIME RECOMMENDATION</HudText>
                    <HudText variant="bodySm" style={styles.recommendationText}>
                      {safetyAnalysis.advice}
                    </HudText>
                  </View>
                </View>
              )}

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

              <View style={styles.footerInline}>
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
            </ScrollView>
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
    paddingBottom: 130, // plenty of space to scroll button clear of the tabbar!
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
  suggestionsCard: {
    backgroundColor: tokens.surface,
    borderWidth: 1.5,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
    marginTop: -8,
    marginBottom: tokens.spacing.stackMd,
    overflow: 'hidden',
    ...tokens.elevation.floating,
  },
  suggestionsStatus: {
    padding: 14,
    alignItems: 'center',
  },
  suggestionsStatusText: {
    fontSize: 10,
    color: tokens.outline,
    letterSpacing: 1.0,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: tokens.surface,
  },
  suggestionPressed: {
    backgroundColor: tokens.surfaceContainerLow,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,198,207,0.25)',
  },
  suggestionText: {
    color: tokens.primary,
    flex: 1,
    lineHeight: 18,
  },
  safetyAnalysisCard: {
    backgroundColor: tokens.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
    padding: 14,
    marginVertical: tokens.spacing.stackMd,
    gap: 12,
    ...tokens.elevation.card,
  },
  safetyAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safetyAnalysisTitle: {
    color: tokens.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  safetyAnalysisRow: {
    flexDirection: 'row',
    backgroundColor: tokens.surfaceContainerLow,
    borderRadius: tokens.radius.button,
    padding: 12,
    alignItems: 'center',
  },
  safetyMetric: {
    flex: 1,
    alignItems: 'center',
  },
  safetyMetricLabel: {
    fontSize: 9,
    color: tokens.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  safetyMetricValue: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 22,
    marginTop: 2,
  },
  safetyDivider: {
    width: 1,
    height: 32,
    backgroundColor: tokens.outlineVariant,
  },
  hotspotAlert: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(254,107,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(254,107,0,0.18)',
    borderRadius: 8,
    padding: 10,
  },
  hotspotTitle: {
    color: tokens.primary,
    fontFamily: 'PublicSans_700Bold',
    fontSize: 12,
  },
  hotspotReason: {
    color: tokens.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  recommendationBox: {
    backgroundColor: tokens.primaryContainer,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  recommendationLabel: {
    fontSize: 9,
    color: tokens.primary,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  recommendationText: {
    color: tokens.onPrimaryContainer,
    lineHeight: 18,
    fontWeight: '500',
  },
  footerInline: {
    marginTop: tokens.spacing.stackLg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,198,207,0.35)',
    paddingTop: 16,
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
