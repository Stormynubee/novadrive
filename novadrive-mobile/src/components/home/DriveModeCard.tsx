import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { HudText } from '../HudText';
import { useApp } from '../../context/AppContext';
import { tokens } from '../../theme/tokens';

const ROAD_DASHES = [0, 1, 2, 3, 4, 5] as const;
const ROAD_CYCLE_MS = 1400;
const CHASSIS_CYCLE_MS = 280;

/**
 * Stitch home dashboard — horizontal ENTER DRIVE MODE card; car rides centered on road dashes.
 */
export function DriveModeCard({ onPress }: { onPress: () => void }) {
  const { a11y } = useApp();
  const reduceMotion = a11y.reduceMotion;

  const chassisY = useSharedValue(0);
  const roadX = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    chassisY.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: CHASSIS_CYCLE_MS / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: CHASSIS_CYCLE_MS / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    roadX.value = withRepeat(
      withTiming(-48, { duration: ROAD_CYCLE_MS, easing: Easing.linear }),
      -1,
      false
    );
  }, [reduceMotion, chassisY, roadX]);

  const chassisStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: chassisY.value }],
  }));

  const roadStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: roadX.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.outer, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Enter drive mode"
    >
      <View style={styles.gradientFill} />
      <View style={styles.row}>
        <View style={styles.carLane}>
          <Animated.View style={[styles.carBody, chassisStyle]}>
            <Svg width={56} height={40} viewBox="0 0 80 80">
              <G stroke={tokens.onPrimary} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}>
                <Path d="M 18 42 L 26 28 L 54 22 L 68 32 L 74 46 L 64 56 L 16 50 Z" />
                <Circle cx={28} cy={52} r={5} fill={tokens.onPrimary} stroke="none" />
                <Circle cx={60} cy={54} r={5} fill={tokens.onPrimary} stroke="none" />
              </G>
            </Svg>
          </Animated.View>
          <View style={styles.roadClip}>
            <Animated.View style={[styles.roadStrip, roadStyle]}>
              <View style={styles.roadRow}>
                {ROAD_DASHES.map((i) => (
                  <View key={i} style={styles.roadDash} />
                ))}
                {ROAD_DASHES.map((i) => (
                  <View key={`b-${i}`} style={styles.roadDash} />
                ))}
              </View>
            </Animated.View>
          </View>
        </View>
        <View style={styles.labels}>
          <HudText variant="headlineMd" style={styles.enter}>
            ENTER
          </HudText>
          <HudText variant="bodySm" style={styles.sub}>
            DRIVE MODE
          </HudText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.primary,
  },
  outer: {
    height: 124,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: tokens.surfaceContainerHigh,
    overflow: 'hidden',
    backgroundColor: tokens.primaryContainer,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.96 },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  carLane: {
    width: 88,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 72,
  },
  carBody: {
    marginBottom: 6,
    zIndex: 2,
  },
  roadClip: {
    width: 72,
    height: 4,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  roadStrip: {
    width: 144,
  },
  roadRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  roadDash: {
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  labels: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  enter: {
    color: tokens.onPrimary,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    letterSpacing: 2,
    fontSize: 22,
  },
  sub: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
    marginTop: 4,
    textTransform: 'uppercase',
    fontSize: 11,
    fontFamily: 'PublicSans_600SemiBold',
  },
});
