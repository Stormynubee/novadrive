import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Line, Path } from 'react-native-svg';
import { ScreenEnter } from '../../src/components/ScreenEnter';
import { HudCard } from '../../src/components/HudCard';
import { HudText } from '../../src/components/HudText';
import { LiveChip } from '../../src/components/LiveChip';
import { NovaButton } from '../../src/components/NovaButton';
import { NovaTopBar } from '../../src/components/NovaTopBar';
import { tokens } from '../../src/theme/tokens';

/**
 * Stitch route_discovery — light corridor "map" surface that segues into the cab-style planner
 * (`/trip/plan`). We render an abstract corridor SVG instead of a real basemap to stay offline.
 */
export default function RouteDiscoverScreen() {
  const insets = useSafeAreaInsets();

  const continueToPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push('/trip/plan' as Href);
  };

  return (
    <ScreenEnter variant="slide">
      <View style={styles.root}>
        <NovaTopBar
          title="ROUTE DISCOVERY"
          subtitle="Offline corridor intel"
          showBack
        />

        {/* Abstract corridor map */}
        <View style={styles.mapPanel}>
          <Svg width="100%" height={260} viewBox="0 0 360 260">
            {/* Grid */}
            {Array.from({ length: 8 }).map((_, i) => (
              <Line
                key={`v${i}`}
                x1={i * 50}
                y1={0}
                x2={i * 50}
                y2={260}
                stroke={tokens.outlineVariant}
                strokeWidth={0.6}
                opacity={0.5}
              />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <Line
                key={`h${i}`}
                x1={0}
                y1={i * 50}
                x2={360}
                y2={i * 50}
                stroke={tokens.outlineVariant}
                strokeWidth={0.6}
                opacity={0.5}
              />
            ))}
            {/* Corridor path */}
            <Path
              d="M30 220 Q 100 180 140 140 T 240 80 Q 300 60 330 30"
              stroke={tokens.primary}
              strokeWidth={3}
              fill="none"
            />
            <Path
              d="M30 220 Q 100 180 140 140 T 240 80 Q 300 60 330 30"
              stroke={tokens.secondary}
              strokeWidth={3}
              strokeDasharray="8 8"
              fill="none"
              opacity={0.5}
            />
            {/* Endpoints */}
            <Path
              d="M30 220 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0"
              fill={tokens.tertiary}
            />
            <Path
              d="M330 30 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0"
              fill={tokens.secondary}
            />
          </Svg>
          <View style={styles.mapBadge}>
            <LiveChip label="Offline ready" tone="safe" />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <HudText variant="mono" style={styles.kicker}>
            CORRIDOR PRE-CHECK
          </HudText>
          <HudText variant="headlineLg" style={styles.title}>
            Initialise route
          </HudText>
          <HudText variant="bodyMd" style={styles.body}>
            Set your corridor before telemetry arms. Trauma facilities, hazard zones, and briefing
            cards all load offline once your trip is queued.
          </HudText>

          <HudCard accent="primary">
            <Stat
              icon="local-hospital"
              tone="primary"
              label="Trauma-tier POI pack"
              value="Ready"
            />
            <View style={styles.divider} />
            <Stat
              icon="offline-bolt"
              tone="warn"
              label="Works without signal after first sync"
              value="Verified"
            />
            <View style={styles.divider} />
            <Stat
              icon="layers"
              tone="safe"
              label="Corridor briefing layer"
              value="3 cards"
            />
          </HudCard>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={continueToPlan}
          >
            <MaterialIcons name="route" size={22} color={tokens.onSecondary} />
            <HudText variant="headlineMd" style={styles.ctaLabel}>
              Set destination
            </HudText>
          </Pressable>

          <NovaButton
            label="Cancel"
            onPress={() => router.back()}
            variant="ghost"
          />
        </ScrollView>
      </View>
    </ScreenEnter>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  tone: 'primary' | 'warn' | 'safe';
}) {
  const fg = tone === 'safe' ? tokens.tertiary : tone === 'warn' ? tokens.secondary : tokens.primary;
  const bg = tone === 'safe' ? tokens.tertiaryContainer : tone === 'warn' ? tokens.secondaryFixed : tokens.primaryFixed;
  return (
    <View style={statStyles.row}>
      <View style={[statStyles.iconWrap, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={18} color={fg} />
      </View>
      <HudText variant="bodyMd" style={statStyles.label}>
        {label}
      </HudText>
      <HudText variant="mono" style={[statStyles.value, { color: fg }]}>
        {value}
      </HudText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  mapPanel: {
    backgroundColor: tokens.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outlineVariant,
    overflow: 'hidden',
  },
  mapBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  scroll: { padding: 20, gap: 14 },
  kicker: { fontSize: 10, letterSpacing: 1.6, color: tokens.secondary },
  title: { color: tokens.primary, marginTop: 4 },
  body: { color: tokens.onSurfaceVariant, lineHeight: 24, marginBottom: 4 },
  cta: {
    height: 56,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    ...tokens.elevation.card,
  },
  ctaPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  ctaLabel: { color: tokens.onSecondary, fontSize: 17 },
  divider: { height: 1, backgroundColor: tokens.outlineVariant, marginVertical: 10 },
});

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.iconWrap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  value: { fontSize: 11, letterSpacing: 0.6 },
});
