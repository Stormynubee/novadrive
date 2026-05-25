import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { tokens } from '../theme/tokens';

/** Abstract top-down corridor map (offline, no tile server). */
export function PlanCorridorMap() {
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox="0 0 360 220" preserveAspectRatio="xMidYMid slice">
        <Path d="M0 0 H360 V220 H0 Z" fill={tokens.surfaceContainerLow} />
        {Array.from({ length: 9 }).map((_, i) => (
          <Line
            key={`v${i}`}
            x1={i * 40}
            y1={0}
            x2={i * 40}
            y2={220}
            stroke={tokens.outlineVariant}
            strokeWidth={0.5}
            opacity={0.45}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <Line
            key={`h${i}`}
            x1={0}
            y1={i * 40}
            x2={360}
            y2={i * 40}
            stroke={tokens.outlineVariant}
            strokeWidth={0.5}
            opacity={0.45}
          />
        ))}
        <Path
          d="M24 190 Q 90 150 130 120 T 220 70 Q 280 48 320 28"
          stroke={tokens.secondary}
          strokeWidth={4}
          fill="none"
          opacity={0.85}
        />
        <Path
          d="M24 190 Q 90 150 130 120 T 220 70 Q 280 48 320 28"
          stroke={tokens.primary}
          strokeWidth={2}
          fill="none"
          opacity={0.35}
        />
        <Path
          d="M24 190 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0"
          fill={tokens.primary}
        />
        <Path
          d="M320 28 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0"
          fill={tokens.secondary}
        />
      </Svg>
      <View style={styles.reticle}>
        <View style={styles.reticleRing}>
          <View style={styles.reticleDot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: tokens.surfaceContainerHigh,
    overflow: 'hidden',
  },
  reticle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: tokens.primary,
    backgroundColor: 'rgba(0,10,30,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.primary,
  },
});
