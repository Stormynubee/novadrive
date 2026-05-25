import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';

const AnimatedLine = Animated.createAnimatedComponent(Line);

/** Origin → destination nodes with marching dashed connector (Stitch calibration). */
export function RouteCalibrationPath({ animate }: { animate: boolean }) {
  const dashOffset = useSharedValue(0);

  useEffect(() => {
    if (!animate) {
      dashOffset.value = 0;
      return;
    }
    dashOffset.value = withRepeat(
      withTiming(16, { duration: 600, easing: Easing.linear }),
      -1,
      false
    );
  }, [animate, dashOffset]);

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.lineTrack}>
        <Svg width="100%" height={4} viewBox="0 0 200 4" preserveAspectRatio="none">
          <AnimatedLine
            x1={0}
            y1={2}
            x2={200}
            y2={2}
            stroke={tokens.primaryFixed}
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="8 8"
            animatedProps={lineProps}
          />
        </Svg>
      </View>

      <View style={styles.originOuter}>
        <View style={styles.originInner}>
          <MaterialIcons name="location-on" size={28} color={tokens.primary} />
        </View>
      </View>

      <View style={styles.destOuter}>
        <View style={styles.destInner}>
          <MaterialIcons name="flag" size={28} color={tokens.outline} />
        </View>
      </View>
    </View>
  );
}

const NODE = 64;
const INNER = 48;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 128,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  lineTrack: {
    position: 'absolute',
    left: NODE / 2 + 8,
    right: NODE / 2 + 8,
    top: '50%',
    marginTop: -2,
  },
  originOuter: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: tokens.primaryContainer,
    borderWidth: 1,
    borderColor: 'rgba(214,227,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  originInner: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    backgroundColor: tokens.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destOuter: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 2,
    borderColor: 'rgba(116,119,127,0.5)',
    backgroundColor: 'rgba(248,249,250,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  destInner: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
