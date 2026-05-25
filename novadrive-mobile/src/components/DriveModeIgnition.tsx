import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, G, Line, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { HudText } from './HudText';
import { useApp } from '../context/AppContext';
import { tokens } from '../theme/tokens';

/** Stitch road-motion: drift + fade for one skid line (700ms cycle). */
function lineMotion(t: number) {
  'worklet';
  const opacity = t < 0.2 ? (t / 0.2) * 0.8 : t > 0.8 ? ((1 - t) / 0.2) * 0.8 : 0.8;
  const tx = 6 - 20 * t;
  const ty = -4 + 12 * t;
  return { opacity, tx, ty };
}

const ROAD_LINES = [
  { x1: 12, y1: 58, x2: 24, y2: 60, delay: 0 },
  { x1: 36, y1: 62, x2: 48, y2: 64, delay: 250 },
  { x1: 56, y1: 65, x2: 66, y2: 67, delay: 500 },
] as const;

function RoadLine({
  line,
  delay,
  roadT,
}: {
  line: (typeof ROAD_LINES)[number];
  delay: number;
  roadT: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const t = (roadT.value + delay / 700) % 1;
    const { opacity, tx, ty } = lineMotion(t);
    return {
      opacity,
      transform: [{ translateX: tx }, { translateY: ty }],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width={80} height={80} viewBox="0 0 80 80">
        <Line
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={tokens.onPrimary}
          strokeWidth={2}
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * Stitch `nova_drive_driving_dashboard_animated_icon` — navy ignition pad with ONLY the SVG car
 * animations: engine-vibration (chassis) + road-motion (skid lines). No scan line, no pulse ring.
 */
export function DriveModeIgnition({ onPress }: { onPress: () => void }) {
  const { a11y } = useApp();
  const reduceMotion = a11y.reduceMotion;

  const chassisY = useSharedValue(0);
  const chassisR = useSharedValue(0);
  const roadT = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    chassisY.value = withRepeat(
      withSequence(
        withTiming(-0.5, { duration: 30, easing: Easing.linear }),
        withTiming(0.5, { duration: 60, easing: Easing.linear }),
        withTiming(0, { duration: 30, easing: Easing.linear })
      ),
      -1,
      false
    );
    chassisR.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 30, easing: Easing.linear }),
        withTiming(-0.2, { duration: 60, easing: Easing.linear }),
        withTiming(0, { duration: 30, easing: Easing.linear })
      ),
      -1,
      false
    );
    roadT.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.linear }),
      -1,
      false
    );
  }, [reduceMotion, chassisY, chassisR, roadT]);

  const chassisStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: chassisY.value }, { rotate: `${chassisR.value}deg` }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    onPress();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.grid} pointerEvents="none" />
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.pad, pressed && styles.padPressed]}
        accessibilityRole="button"
        accessibilityLabel="Enter drive mode"
      >
        <View style={styles.padSheen} pointerEvents="none" />
        <View style={styles.crosshairTop} />
        <View style={styles.crosshairBottom} />
        <View style={styles.crosshairLeft} />
        <View style={styles.crosshairRight} />

        <View style={styles.carSlot}>
          {ROAD_LINES.map((line) => (
            <RoadLine key={`${line.x1}-${line.y1}`} line={line} delay={line.delay} roadT={roadT} />
          ))}
          <Animated.View style={chassisStyle}>
            <Svg width={80} height={80} viewBox="0 0 80 80">
              <G stroke={tokens.onPrimary} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M18 42 L26 28 L54 22 L68 32 L74 46 L64 56 L16 50 Z" strokeWidth={2.5} />
                <Path d="M28 30 L50 25 L62 33 L64 40 L30 38 Z" strokeWidth={2} />
                <Path d="M50 25 L52 39" strokeWidth={1.5} />
                <Ellipse
                  cx={68}
                  cy={44}
                  rx={2}
                  ry={4}
                  fill={tokens.onPrimary}
                  stroke="none"
                  transform="rotate(-15 68 44)"
                />
                <Ellipse
                  cx={72}
                  cy={42}
                  rx={1.5}
                  ry={3}
                  fill={tokens.onPrimary}
                  stroke="none"
                  transform="rotate(-15 72 42)"
                />
                <Ellipse
                  cx={30}
                  cy={52}
                  rx={5}
                  ry={8}
                  strokeWidth={2.5}
                  fill={tokens.primary}
                  transform="rotate(-20 30 52)"
                />
                <Ellipse
                  cx={58}
                  cy={54}
                  rx={4}
                  ry={7}
                  strokeWidth={2.5}
                  fill={tokens.primary}
                  transform="rotate(-20 58 54)"
                />
              </G>
            </Svg>
          </Animated.View>
        </View>

        <HudText variant="headlineMd" style={styles.enter}>
          ENTER
        </HudText>
        <HudText variant="bodyLg" style={styles.driveMode}>
          DRIVE MODE
        </HudText>
      </Pressable>
    </View>
  );
}

const PAD = 256;

const styles = StyleSheet.create({
  wrap: {
    width: PAD + 40,
    height: PAD + 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,33,71,0.08)',
    backgroundColor: 'rgba(0,33,71,0.03)',
    opacity: 0.5,
  },
  pad: {
    width: PAD,
    height: PAD,
    borderRadius: 24,
    backgroundColor: tokens.primary,
    borderWidth: 4,
    borderColor: tokens.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  padPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.96,
  },
  padSheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.primaryContainer,
    opacity: 0.35,
  },
  carSlot: {
    width: 80,
    height: 80,
    marginBottom: 12,
    zIndex: 2,
  },
  crosshairTop: {
    position: 'absolute',
    top: 16,
    width: 4,
    height: 8,
    borderRadius: 2,
    backgroundColor: 'rgba(214,227,255,0.3)',
  },
  crosshairBottom: {
    position: 'absolute',
    bottom: 16,
    width: 4,
    height: 8,
    borderRadius: 2,
    backgroundColor: 'rgba(214,227,255,0.3)',
  },
  crosshairLeft: {
    position: 'absolute',
    left: 16,
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(214,227,255,0.3)',
  },
  crosshairRight: {
    position: 'absolute',
    right: 16,
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(214,227,255,0.3)',
  },
  enter: {
    color: tokens.onPrimary,
    letterSpacing: 4,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    zIndex: 2,
  },
  driveMode: {
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginTop: 2,
    zIndex: 2,
  },
});
