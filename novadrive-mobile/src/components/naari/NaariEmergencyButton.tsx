import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HudText } from '../HudText';
import { tokens } from '../../theme/tokens';
import { createHoldTimer, NAARI_HOLD_MS } from '../../lib/naariShakti/holdTimer';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_R = 98;
const RING_C = 2 * Math.PI * RING_R;
/** If finger lifts within this window after 2s, still activate (avoids timer vs pressOut race). */
const RELEASE_GRACE_MS = 120;

type Props = {
  disabled?: boolean;
  onActivate: () => void | Promise<void>;
};

export function NaariEmergencyButton({ disabled, onActivate }: Props) {
  const [holding, setHolding] = useState(false);
  const holdProgress = useSharedValue(0);
  const activatedRef = useRef(false);
  const pressStartRef = useRef(0);
  const onActivateRef = useRef(onActivate);
  onActivateRef.current = onActivate;

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_C * (1 - holdProgress.value),
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: holdProgress.value > 0 ? 1 : 0,
  }));

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const fireActivateRef = useRef<() => void>(() => undefined);
  fireActivateRef.current = () => {
    if (disabledRef.current || activatedRef.current) return;
    activatedRef.current = true;
    setHolding(false);
    holdProgress.value = withTiming(1, { duration: 100 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    void Promise.resolve(onActivateRef.current());
  };

  const holdTimerRef = useRef<ReturnType<typeof createHoldTimer> | null>(null);
  useEffect(() => {
    const timer = createHoldTimer(NAARI_HOLD_MS, () => fireActivateRef.current());
    holdTimerRef.current = timer;
    return () => timer.cancel();
  }, []);

  const startHold = () => {
    if (disabled) return;
    activatedRef.current = false;
    pressStartRef.current = Date.now();
    setHolding(true);
    holdProgress.value = 0;
    holdProgress.value = withTiming(1, { duration: NAARI_HOLD_MS, easing: Easing.linear });
    holdTimerRef.current?.start();
  };

  const endHold = () => {
    const elapsedMs = Date.now() - pressStartRef.current;
    const wasActivated = activatedRef.current;
    holdTimerRef.current?.cancel();
    holdProgress.value = withTiming(0, { duration: 200 });
    setHolding(false);
    if (wasActivated || disabled) return;
    if (elapsedMs >= NAARI_HOLD_MS - RELEASE_GRACE_MS) {
      fireActivateRef.current();
      return;
    }
    Alert.alert('Hold to activate', 'Press and hold Emergency Help for 2 seconds to send alerts.');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.btnOuter}>
        <Animated.View style={[styles.progressRing, ringStyle]} pointerEvents="none">
          <Svg width={RING_R * 2 + 8} height={RING_R * 2 + 8}>
            <Circle
              cx={RING_R + 4}
              cy={RING_R + 4}
              r={RING_R}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={6}
              fill="none"
            />
            <AnimatedCircle
              cx={RING_R + 4}
              cy={RING_R + 4}
              r={RING_R}
              stroke={tokens.onPrimary}
              strokeWidth={6}
              fill="none"
              strokeDasharray={`${RING_C} ${RING_C}`}
              animatedProps={ringProps}
              strokeLinecap="round"
              rotation="-90"
              origin={`${RING_R + 4}, ${RING_R + 4}`}
            />
          </Svg>
        </Animated.View>
        <Pressable
          disabled={disabled}
          onPressIn={startHold}
          onPressOut={endHold}
          style={({ pressed }) => [
            styles.btn,
            disabled && styles.btnDisabled,
            pressed && !disabled && styles.btnPressed,
            holding && styles.btnHolding,
          ]}
          accessibilityLabel="Emergency help. Press and hold for two seconds."
        >
          <MaterialIcons name="emergency" size={64} color={tokens.onSecondary} />
          <HudText variant="bodyMd" style={styles.btnLabel}>
            EMERGENCY HELP
          </HudText>
        </Pressable>
      </View>
      <HudText variant="bodyMd" style={styles.holdHint}>
        Press & Hold for 2 Seconds
      </HudText>
      <HudText variant="bodySm" style={styles.holdSub}>
        SMS station, live location & community alert
      </HudText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 24 },
  btnOuter: {
    width: 204,
    height: 204,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: tokens.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: tokens.secondary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    gap: 4,
  },
  btnDisabled: { opacity: 0.45 },
  btnPressed: { transform: [{ scale: 0.96 }] },
  btnHolding: { transform: [{ scale: 0.92 }] },
  btnLabel: {
    color: tokens.onSecondary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 2,
    fontSize: 12,
  },
  holdHint: {
    marginTop: 16,
    color: tokens.secondary,
    fontFamily: 'PublicSans_700Bold',
    textAlign: 'center',
  },
  holdSub: { marginTop: 4, color: tokens.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 16 },
});
