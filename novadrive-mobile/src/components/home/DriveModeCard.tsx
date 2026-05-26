import { useEffect } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  type AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { HudText } from '../HudText';
import { useApp } from '../../context/AppContext';
import { tokens } from '../../theme/tokens';

/** Stitch HTML: w-40 h-24 scene inside ENTER DRIVE MODE button */
const SCENE_W = 112;
const SCENE_H = 88;
const CAR_W = 64;
const ROAD_BOTTOM = 14;
const ROAD_HEIGHT = 4;
const VIEWBOX_H = 64;
const WHEEL_BOTTOM_Y = 48;
const WHEEL_INSET_FROM_VIEW_BOTTOM = ((VIEWBOX_H - WHEEL_BOTTOM_Y) / VIEWBOX_H) * CAR_W;
const CAR_BOTTOM = ROAD_BOTTOM + ROAD_HEIGHT - WHEEL_INSET_FROM_VIEW_BOTTOM;
const ROAD_TILE = 16;
const ROAD_TILES = 14;
const ROAD_SHIFT = 32;
const ROAD_CYCLE_MS = 600;
const WHEEL_SPIN_MS = 1200;
const WHEEL_R = 6;
const STROKE = tokens.onPrimary;

const WHEEL_CENTERS = [
  { cx: 18, cy: 42 },
  { cx: 46, cy: 42 },
] as const;

function WheelGraphic() {
  const size = WHEEL_R * 2;
  const c = WHEEL_R;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G
        stroke={STROKE}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
      >
        <Circle cx={c} cy={c} r={6} />
        <Circle cx={c} cy={c} r={2} />
        <Line x1={c} x2={c} y1={c - 6} y2={c + 6} />
        <Line x1={c - 6} x2={c + 6} y1={c} y2={c} />
      </G>
    </Svg>
  );
}

function DriveModeCar({ wheelStyle }: { wheelStyle: AnimatedStyle<ViewStyle> }) {
  return (
    <View style={styles.carCanvas}>
      <Svg width={CAR_W} height={CAR_W} viewBox="0 0 64 64">
        <G
          stroke={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        >
          <Path d="M 14 42 L 8 42 C 5 42 4 40 4 37 L 4 32 C 4 30 5 28 8 26 L 16 16 C 18 14 20 14 24 14 L 40 14 C 44 14 46 16 48 20 L 54 28 C 58 29 60 31 60 35 L 60 38 C 60 40 58 42 56 42 L 50 42" />
          <Path d="M 22 42 L 42 42" />
          <Path d="M 28 14 L 28 28 L 8 28" />
          <Path d="M 28 14 L 46 14 L 54 28 L 28 28" />
        </G>
      </Svg>
      {WHEEL_CENTERS.map((w) => (
        <View
          key={`${w.cx}-${w.cy}`}
          collapsable={false}
          style={[
            styles.wheelClip,
            {
              left: w.cx - WHEEL_R,
              top: w.cy - WHEEL_R,
              width: WHEEL_R * 2,
              height: WHEEL_R * 2,
              borderRadius: WHEEL_R,
            },
          ]}
        >
          <Animated.View style={[styles.wheelSpinner, wheelStyle]}>
            <WheelGraphic />
          </Animated.View>
        </View>
      ))}
    </View>
  );
}

/**
 * Stitch home dashboard — ENTER DRIVE MODE; scrolling road + spinning wheels (HTML reference).
 */
export function DriveModeCard({ onPress }: { onPress: () => void }) {
  const { a11y } = useApp();
  const reduceMotion = a11y.reduceMotion;

  const roadX = useSharedValue(0);
  const wheelSpin = useSharedValue(0);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelSpin.value}deg` }],
  }));

  useEffect(() => {
    if (reduceMotion) {
      roadX.value = 0;
      wheelSpin.value = 0;
      return;
    }
    roadX.value = withRepeat(
      withTiming(-ROAD_SHIFT, { duration: ROAD_CYCLE_MS, easing: Easing.linear }),
      -1,
      false
    );
    wheelSpin.value = withRepeat(
      withTiming(360, { duration: WHEEL_SPIN_MS, easing: Easing.linear }),
      -1,
      false
    );
  }, [reduceMotion, roadX, wheelSpin]);

  const roadStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: roadX.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPress();
  };

  const roadTiles = Array.from({ length: ROAD_TILES }, (_, i) => i);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.outer, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Enter drive mode"
    >
      <View style={styles.gradientFill} />
      <View style={styles.row}>
        <View style={styles.scene}>
          <View style={styles.roadClip}>
            <Animated.View style={[styles.roadStrip, roadStyle]}>
              <View style={styles.roadRow}>
                {roadTiles.map((i) => (
                  <View
                    key={i}
                    style={[styles.roadTile, i % 2 === 0 ? styles.roadTileOn : styles.roadTileOff]}
                  />
                ))}
              </View>
            </Animated.View>
          </View>
          <View style={styles.carWrap}>
            <DriveModeCar wheelStyle={wheelStyle} />
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scene: {
    width: SCENE_W,
    height: SCENE_H,
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadClip: {
    position: 'absolute',
    left: 0,
    bottom: ROAD_BOTTOM,
    width: SCENE_W,
    height: ROAD_HEIGHT,
    overflow: 'hidden',
    zIndex: 1,
  },
  roadStrip: {
    width: ROAD_TILE * ROAD_TILES,
    height: ROAD_HEIGHT,
  },
  roadRow: {
    flexDirection: 'row',
    height: ROAD_HEIGHT,
  },
  roadTile: {
    width: ROAD_TILE,
    height: ROAD_HEIGHT,
  },
  roadTileOn: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  roadTileOff: {
    backgroundColor: 'transparent',
  },
  carWrap: {
    position: 'absolute',
    left: (SCENE_W - CAR_W) / 2,
    bottom: CAR_BOTTOM,
    width: CAR_W,
    zIndex: 2,
  },
  carCanvas: {
    width: CAR_W,
    height: CAR_W,
    position: 'relative',
  },
  wheelClip: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  wheelSpinner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 12,
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
