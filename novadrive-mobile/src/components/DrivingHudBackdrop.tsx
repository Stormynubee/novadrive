import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { tokens } from '../theme/tokens';

/** Abstract map wash behind the live driving HUD (offline). */
export function DrivingHudBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.navyWash} />
      <Svg width="100%" height="100%" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 10 }).map((_, i) => (
          <Line
            key={`v${i}`}
            x1={i * 40}
            y1={0}
            x2={i * 40}
            y2={640}
            stroke={tokens.primaryFixed}
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <Line
            key={`h${i}`}
            x1={0}
            y1={i * 48}
            x2={360}
            y2={i * 48}
            stroke={tokens.primaryFixed}
            strokeOpacity={0.06}
            strokeWidth={1}
          />
        ))}
        <Path
          d="M20 520 Q 120 400 200 320 T 340 120"
          stroke={tokens.secondary}
          strokeWidth={3}
          fill="none"
          opacity={0.35}
        />
        <Path
          d="M40 500 Q 140 420 220 340 T 320 160"
          stroke={tokens.primaryFixed}
          strokeWidth={2}
          fill="none"
          opacity={0.2}
        />
      </Svg>
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  navyWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.primaryContainer,
    opacity: 0.88,
  },
  gradientTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.surface,
    opacity: 0.55,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: tokens.surface,
    opacity: 0.92,
  },
});
