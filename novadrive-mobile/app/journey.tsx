import { type Href, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { DrivingHudBackdrop } from '../src/components/DrivingHudBackdrop';
import { HoldSOSButton } from '../src/components/HoldSOSButton';
import { HudText } from '../src/components/HudText';
import { ScreenEnter } from '../src/components/ScreenEnter';
import { useApp } from '../src/context/AppContext';
import { EMERGENCY_SELECTION_PATH } from '../src/lib/emergency/emergencyNavigation';
import { tokens } from '../src/theme/tokens';

const SPEED_LIMIT_KMH = 80;
const SPEEDO_SIZE = 256;

/**
 * Stitch `main_app_driving_sos_dashboard` — live speedometer, sensor status, massive SOS.
 */
export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const {
    journeyStatus,
    speedKmh,
    finishJourney,
    simulateCrash,
    simulatePanic,
    voiceMonitoring,
    triggerSOS,
    beginEmergencyFlow,
  } = useApp();

  const onSOS = () => {
    triggerSOS();
    beginEmergencyFlow();
    router.push(EMERGENCY_SELECTION_PATH as Href);
  };

  const live = journeyStatus === 'ACTIVE';
  const speedDisplay = Math.round(speedKmh);
  const overSpeed = speedDisplay > SPEED_LIMIT_KMH;
  const arcRatio = Math.min(1, speedDisplay / 120);

  const confirmExit = () => {
    Alert.alert('Exit drive mode?', 'End this journey and return to Home?', [
      { text: 'Stay on HUD', style: 'cancel' },
      {
        text: 'Exit drive',
        style: 'destructive',
        onPress: async () => {
          await finishJourney();
          router.replace('/(tabs)/explore' as Href);
        },
      },
    ]);
  };

  const onEndJourney = async () => {
    const id = await finishJourney();
    router.replace({
      pathname: '/journey/complete',
      params: id ? { id } : {},
    } as Href);
  };

  return (
    <ScreenEnter variant="fade">
      <View style={styles.root}>
        <DrivingHudBackdrop />

        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={confirmExit} style={styles.iconBtn} accessibilityLabel="Menu">
            <MaterialIcons name="menu" size={24} color={tokens.onPrimary} />
          </Pressable>
          <HudText variant="headlineMd" style={styles.headerTitle}>
            Margi
          </HudText>
          <Pressable
            onPress={() => {
              beginEmergencyFlow();
              router.push(EMERGENCY_SELECTION_PATH as Href);
            }}
            style={styles.iconBtn}
            accessibilityLabel="Emergency share"
          >
            <MaterialIcons name="emergency-share" size={26} color={tokens.secondary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.speedoSection}>
            <Svg width={120} height={32} viewBox="0 0 120 32" style={styles.chevron}>
              <Path
                d="M10 28 L60 4 L110 28"
                stroke={tokens.secondary}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.45}
              />
            </Svg>

            <SpeedometerRing speed={speedDisplay} arcRatio={arcRatio} overSpeed={overSpeed} />

            <View style={[styles.limitBadge, overSpeed && styles.limitBadgeAlert]}>
              <MaterialIcons name="speed" size={18} color={tokens.onErrorContainer} />
              <HudText variant="bodySm" style={styles.limitText}>
                Zone Limit: {SPEED_LIMIT_KMH}
              </HudText>
            </View>
          </View>

          <View style={styles.sensorList}>
            <SensorStatusCard
              icon={voiceMonitoring ? 'mic' : 'mic-off'}
              title="Voice Detection"
              subtitle={voiceMonitoring ? 'Active & Monitoring' : 'Standby'}
              active={voiceMonitoring}
            />
            <SensorStatusCard
              icon="sensors"
              title="Motion Sensors"
              subtitle={live ? 'Calibrated' : 'Standby'}
              active={live}
            />
          </View>

          <View style={styles.sosSection}>
            <HoldSOSButton onTrigger={onSOS} variant="dashboard" />
          </View>

          <View style={styles.demoRow}>
            <Pressable onPress={simulateCrash} style={styles.demoPill}>
              <MaterialIcons name="science" size={14} color={tokens.primary} />
              <HudText variant="mono" style={styles.demoText}>
                Test impact
              </HudText>
            </Pressable>
            <Pressable onPress={simulatePanic} style={styles.demoPill}>
              <MaterialIcons name="record-voice-over" size={14} color={tokens.primary} />
              <HudText variant="mono" style={styles.demoText}>
                Test scream
              </HudText>
            </Pressable>
            <Pressable onPress={onEndJourney} style={styles.demoPill}>
              <MaterialIcons name="flag" size={14} color={tokens.primary} />
              <HudText variant="mono" style={styles.demoText}>
                End trip
              </HudText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ScreenEnter>
  );
}

function SpeedometerRing({
  speed,
  arcRatio,
  overSpeed,
}: {
  speed: number;
  arcRatio: number;
  overSpeed: boolean;
}) {
  const rotateDeg = -135 + arcRatio * 270;

  return (
    <View style={speedoStyles.wrap}>
      <View style={speedoStyles.track} />
      <View
        style={[
          speedoStyles.arc,
          {
            transform: [{ rotate: `${rotateDeg}deg` }],
            borderTopColor: overSpeed ? tokens.error : tokens.secondary,
            borderRightColor: overSpeed ? tokens.error : tokens.secondary,
          },
        ]}
      />
      <View style={speedoStyles.glass}>
        <HudText variant="display" style={speedoStyles.speed}>
          {speed}
        </HudText>
        <HudText variant="mono" style={speedoStyles.unit}>
          KM/H
        </HudText>
      </View>
    </View>
  );
}

function SensorStatusCard({
  icon,
  title,
  subtitle,
  active,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  active: boolean;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <View style={sensorStyles.card}>
      <View style={sensorStyles.accent} />
      <View style={sensorStyles.iconWrap}>
        <MaterialIcons name={icon} size={20} color={tokens.primary} />
      </View>
      <View style={sensorStyles.text}>
        <HudText variant="bodyMd" style={sensorStyles.title}>
          {title}
        </HudText>
        <HudText variant="bodySm" style={sensorStyles.sub}>
          {subtitle}
        </HudText>
      </View>
      {active ? (
        <Animated.View style={[sensorStyles.dot, { opacity: dotOpacity }]} />
      ) : (
        <View style={[sensorStyles.dot, sensorStyles.dotOff]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: tokens.primary,
    zIndex: 10,
    gap: 8,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: tokens.onPrimary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: 1,
    fontSize: 18,
  },
  scroll: { paddingTop: 8, flexGrow: 1 },
  speedoSection: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 },
  chevron: { marginBottom: 4 },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: tokens.errorContainer,
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.2)',
  },
  limitBadgeAlert: {
    backgroundColor: tokens.errorContainer,
  },
  limitText: {
    color: tokens.onErrorContainer,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.5,
  },
  sensorList: {
    paddingHorizontal: tokens.spacing.sideMargin,
    marginTop: 24,
    gap: 10,
  },
  sosSection: {
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  demoText: { fontSize: 10, color: tokens.primary, letterSpacing: 0.6 },
});

const speedoStyles = StyleSheet.create({
  wrap: {
    width: SPEEDO_SIZE,
    height: SPEEDO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SPEEDO_SIZE / 2,
    borderWidth: 12,
    borderColor: tokens.surfaceContainerHigh,
    opacity: 0.5,
  },
  arc: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SPEEDO_SIZE / 2,
    borderWidth: 12,
    borderColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  glass: {
    width: SPEEDO_SIZE - 24,
    height: SPEEDO_SIZE - 24,
    borderRadius: (SPEEDO_SIZE - 24) / 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  speed: {
    color: tokens.primary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -1,
  },
  unit: {
    color: tokens.outline,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 2,
  },
});

const sensorStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(196,198,207,0.35)',
    padding: 14,
    gap: 12,
    overflow: 'hidden',
    ...tokens.elevation.card,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: tokens.primary,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  text: { flex: 1 },
  title: { color: tokens.onSurface, fontFamily: 'PublicSans_700Bold' },
  sub: { color: tokens.onSurfaceVariant, marginTop: 2 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.tertiaryFixedDim,
    shadowColor: tokens.tertiaryFixedDim,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  dotOff: {
    backgroundColor: tokens.outlineVariant,
    opacity: 0.5,
    shadowOpacity: 0,
  },
});
